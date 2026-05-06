import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/app/lib/supabase/admin";

// ─── Mapa de labels (seguro expor — não contém regras de negócio) ─────────────
const PRODUTO_LABEL: Record<string, string> = {
  a1_pf:     "Certificado Digital A1 – Pessoa Física",
  a1_pj:     "Certificado Digital A1 – Pessoa Jurídica",
  a3_pf_sem: "Certificado Digital A3 PF – Sem Token",
  a3_pj_sem: "Certificado Digital A3 PJ – Sem Token",
  a3_pf_com: "Certificado Digital A3 PF – Com Token",
  a3_pj_com: "Certificado Digital A3 PJ – Com Token",
  a1:        "Certificado Digital A1",
  a3_sem:    "Certificado Digital A3 – Sem Token",
  a3_com:    "Certificado Digital A3 – Com Token",
};

// ─── GET /api/pedido/[id] ─────────────────────────────────────────────────────
// Rota pública — usada pelas páginas /sucesso, /pendente, /erro.
// Retorna apenas campos seguros para exibição ao cliente.
// Não expõe: email, phone, contador_id, mp_payment_id, payload.

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id || typeof id !== "string") {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  const db = createAdminClient();

  const { data: pedido, error } = await db
    .from("pedidos_certificados")
    .select(`
      id, produto, preco_venda, status, payment_method, created_at,
      clientes!cliente_id(name)
    `)
    .eq("id", id)
    .single();

  if (error || !pedido) {
    return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cliente = pedido.clientes as any;

  return NextResponse.json({
    id:           pedido.id,
    shortId:      pedido.id.slice(0, 8).toUpperCase(),
    produto:      PRODUTO_LABEL[pedido.produto] ?? pedido.produto,
    preco:        Number(pedido.preco_venda),
    status:       pedido.status,
    paymentMethod:pedido.payment_method,
    clienteNome:  cliente?.name ?? "Cliente",
    createdAt:    pedido.created_at,
  });
}
