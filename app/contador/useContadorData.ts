"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/app/lib/supabase/client";

// ─── Tipos públicos ───────────────────────────────────────────────────────────
export type OrderStatus =
  | "pending_payment"
  | "paid"
  | "processing"
  | "issued"
  | "cancelled";

export interface PedidoRow {
  id: string;
  client: string;
  document: string;
  product: string;
  productId: string;
  salePrice: number;
  commission: number;
  status: OrderStatus;
  /** ISO 8601 — mantido bruto para filtros de data */
  createdAt: string;
  /** "DD/MM/AAAA" — para exibição */
  date: string;
}

export interface LinkStats {
  totalPedidos: number;
  pedidosMes: number;
  pedidosConvertidos: number; // status = 'issued'
}

export interface ContadorData {
  loading: boolean;
  error: string | null;
  contadorId: string | null;
  contadorName: string;
  orders: PedidoRow[];
  comissoesTotal: number;
  comissoesPendentes: number;
  assinaturasAtivas: number;
  linkStats: LinkStats;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmtDate(iso: string): string {
  const d = new Date(iso);
  return [
    String(d.getDate()).padStart(2, "0"),
    String(d.getMonth() + 1).padStart(2, "0"),
    d.getFullYear(),
  ].join("/");
}

function isMesAtual(iso: string): boolean {
  const d   = new Date(iso);
  const now = new Date();
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
}

const PRODUTO_LABEL: Record<string, string> = {
  a1:        "A1 PF/PJ",
  a3_sem:    "A3 Sem Token",
  a3_com:    "A3 Com Token",
  a1_pf:     "A1 Pessoa Física",
  a1_pj:     "A1 Pessoa Jurídica",
  a3_pf_sem: "A3 PF – Sem Token",
  a3_pj_sem: "A3 PJ – Sem Token",
  a3_pf_com: "A3 PF – Com Token",
  a3_pj_com: "A3 PJ – Com Token",
};

// ─── Estado inicial ───────────────────────────────────────────────────────────
const INITIAL_STATE: ContadorData = {
  loading:           true,
  error:             null,
  contadorId:        null,
  contadorName:      "",
  orders:            [],
  comissoesTotal:    0,
  comissoesPendentes:0,
  assinaturasAtivas: 0,
  linkStats:         { totalPedidos:0, pedidosMes:0, pedidosConvertidos:0 },
};

const EMPTY_STATE: Omit<ContadorData, "loading" | "error"> = {
  contadorId:        null,
  contadorName:      "",
  orders:            [],
  comissoesTotal:    0,
  comissoesPendentes:0,
  assinaturasAtivas: 0,
  linkStats:         { totalPedidos:0, pedidosMes:0, pedidosConvertidos:0 },
};

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useContadorData(): ContadorData {
  const [state, setState] = useState<ContadorData>(INITIAL_STATE);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const supabase = createClient();

      // ── 1. Usuário autenticado ─────────────────────────────────────────────
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        if (!cancelled) setState({ ...EMPTY_STATE, loading: false, error: null });
        return;
      }

      // ── 2. Perfil do contador (id + name) ─────────────────────────────────
      const { data: contador, error: eContador } = await supabase
        .from("contadores")
        .select("id, name")
        .eq("user_id", user.id)
        .single();

      if (eContador || !contador) {
        if (!cancelled) setState({
          ...EMPTY_STATE, loading: false,
          error: eContador?.message ?? "Contador não encontrado para este usuário",
        });
        return;
      }

      const contadorId   = contador.id   as string;
      const contadorName = contador.name as string;

      // ── 3. Pedidos de certificados ────────────────────────────────────────
      const { data: pedidos, error: ePedidos } = await supabase
        .from("pedidos_certificados")
        .select(`
          id, produto, preco_venda, comissao, status, created_at,
          clientes!cliente_id(name, document)
        `)
        .eq("contador_id", contadorId)
        .order("created_at", { ascending: false });

      if (ePedidos || !pedidos) {
        if (!cancelled) setState({
          ...EMPTY_STATE, loading: false,
          contadorId, contadorName,           // preserva identidade mesmo com erro
          error: ePedidos?.message ?? "Erro ao carregar pedidos",
        });
        return;
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const orders: PedidoRow[] = (pedidos as any[]).map(p => ({
        id:         p.id,
        client:     p.clientes?.name     ?? "—",
        document:   p.clientes?.document ?? "—",
        product:    PRODUTO_LABEL[p.produto] ?? p.produto,
        productId:  p.produto,
        salePrice:  Number(p.preco_venda),
        commission: Number(p.comissao),
        status:     p.status as OrderStatus,
        createdAt:  p.created_at,
        date:       fmtDate(p.created_at),
      }));

      // Estatísticas do link — derivadas dos pedidos (sem query extra)
      const linkStats: LinkStats = {
        totalPedidos:      orders.length,
        pedidosMes:        orders.filter(o => isMesAtual(o.createdAt)).length,
        pedidosConvertidos:orders.filter(o => o.status === "issued").length,
      };

      // ── 4. Comissões ──────────────────────────────────────────────────────
      const { data: comissoes, error: eComm } = await supabase
        .from("comissoes")
        .select("valor, status")
        .eq("contador_id", contadorId);

      if (eComm) {
        if (!cancelled) setState({
          ...EMPTY_STATE, loading: false,
          contadorId, contadorName,           // preserva identidade mesmo com erro
          orders, linkStats,                  // preserva pedidos já carregados
          error: eComm.message,
        });
        return;
      }

      const comissoesTotal = (comissoes ?? [])
        .filter(c => c.status === "paid" || c.status === "approved")
        .reduce((acc, c) => acc + Number(c.valor), 0);

      const comissoesPendentes = (comissoes ?? [])
        .filter(c => c.status === "pending")
        .reduce((acc, c) => acc + Number(c.valor), 0);

      // ── 5. Assinaturas ativas ─────────────────────────────────────────────
      const { count: assinaturasAtivas } = await supabase
        .from("assinaturas")
        .select("id", { count: "exact", head: true })
        .eq("contador_id", contadorId)
        .eq("status", "active");

      if (!cancelled) {
        setState({
          loading: false,
          error:   null,
          contadorId,
          contadorName,
          orders,
          comissoesTotal,
          comissoesPendentes,
          assinaturasAtivas: assinaturasAtivas ?? 0,
          linkStats,
        });
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  return state;
}
