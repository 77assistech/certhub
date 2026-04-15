"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/app/lib/supabase/client";

export type OrderStatus = "pending_payment" | "paid" | "processing" | "issued" | "cancelled";

export interface PedidoRow {
  id: string;
  number: string;       // gerado no formato "77-YYYY-XXXX"
  client: string;
  document: string;
  product: string;
  productId: string;
  salePrice: number;
  commission: number;
  status: OrderStatus;
  date: string;         // "DD/MM/YYYY"
  channel: "link" | "manual";
}

export interface ContadorData {
  loading: boolean;
  error: string | null;
  // Pedidos de certificados
  orders: PedidoRow[];
  // Comissões de sistemas (indicações)
  comissoesTotal: number;
  comissoesPendentes: number;
  // Contagens
  assinaturasAtivas: number;
}

// ID fixo para dev enquanto não tem autenticação.
// Substitua pelo UUID real do contador criado no Supabase.
// Quando auth estiver pronto, virá do session.user.id → contador.id
const DEV_CONTADOR_ID: string | null = "8384b414-91a4-4652-99bf-11f08a9f78a4";

function pad(n: number) {
  return String(n).padStart(4, "0");
}

function fmtDate(iso: string) {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}/${d.getFullYear()}`;
}

export function useContadorData(): ContadorData {
  const [state, setState] = useState<ContadorData>({
    loading: true,
    error: null,
    orders: [],
    comissoesTotal: 0,
    comissoesPendentes: 0,
    assinaturasAtivas: 0,
  });

  useEffect(() => {
    async function load() {
      const supabase = createClient();

      // ── 1. Resolve o contador logado (ou usa DEV_CONTADOR_ID) ─────────────
      let contadorId = DEV_CONTADOR_ID;

      if (!contadorId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: contador } = await supabase
            .from("contadores")
            .select("id")
            .eq("user_id", user.id)
            .single();
          contadorId = contador?.id ?? null;
        }
      }

      // Sem contador identificado → retorna estado vazio (não é erro fatal)
      if (!contadorId) {
        setState({ loading: false, error: null, orders: [], comissoesTotal: 0, comissoesPendentes: 0, assinaturasAtivas: 0 });
        return;
      }

      // ── 2. Pedidos de certificados ────────────────────────────────────────
      const { data: pedidos, error: ePedidos } = await supabase
        .from("pedidos_certificados")
        .select("id, produto, preco_venda, comissao, status, payment_method, created_at, clientes(name, document)")
        .eq("contador_id", contadorId)
        .order("created_at", { ascending: false });

      if (ePedidos) {
        setState(s => ({ ...s, loading: false, error: ePedidos.message }));
        return;
      }

      const orders: PedidoRow[] = (pedidos ?? []).map((p, i) => ({
        id: p.id,
        number: `77-${new Date(p.created_at).getFullYear()}-${pad(i + 1)}`,
        client: (p.clientes as unknown as { name: string; document: string } | null)?.name ?? "—",
        document: (p.clientes as unknown as { name: string; document: string } | null)?.document ?? "—",
        product: labelProduto(p.produto),
        productId: p.produto,
        salePrice: Number(p.preco_venda),
        commission: Number(p.comissao),
        status: p.status as OrderStatus,
        date: fmtDate(p.created_at),
        channel: p.payment_method ? "link" : "manual",
      }));

      // ── 3. Comissões (sistemas + certificados) ────────────────────────────
      const { data: comissoes, error: eComm } = await supabase
        .from("comissoes")
        .select("valor, status")
        .eq("contador_id", contadorId);

      if (eComm) {
        setState(s => ({ ...s, loading: false, error: eComm.message }));
        return;
      }

      const comissoesTotal = (comissoes ?? [])
        .filter(c => c.status === "paid" || c.status === "approved")
        .reduce((acc, c) => acc + Number(c.valor), 0);

      const comissoesPendentes = (comissoes ?? [])
        .filter(c => c.status === "pending")
        .reduce((acc, c) => acc + Number(c.valor), 0);

      // ── 4. Assinaturas ativas indicadas ───────────────────────────────────
      const { count: assinaturasAtivas } = await supabase
        .from("assinaturas")
        .select("id", { count: "exact", head: true })
        .eq("contador_id", contadorId)
        .eq("status", "active");

      setState({
        loading: false,
        error: null,
        orders,
        comissoesTotal,
        comissoesPendentes,
        assinaturasAtivas: assinaturasAtivas ?? 0,
      });
    }

    load();
  }, []);

  return state;
}

function labelProduto(id: string): string {
  const map: Record<string, string> = {
    a1: "A1 PF/PJ",
    a3_sem: "A3 Sem Token",
    a3_com: "A3 Com Token",
  };
  return map[id] ?? id;
}
