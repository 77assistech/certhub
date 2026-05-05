import { NextRequest, NextResponse } from "next/server";
import { Preference } from "mercadopago";
import { getMPClient, PRODUTO_LABEL_MP } from "@/app/lib/mercadopago";
import { createAdminClient } from "@/app/lib/supabase/admin";

export async function POST(req: NextRequest) {
  // ── 1. Parse e validação básica ───────────────────────────────────────────
  let pedido_id: string;
  try {
    const body = await req.json();
    pedido_id = body?.pedido_id;
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  if (!pedido_id || typeof pedido_id !== "string") {
    return NextResponse.json({ error: "pedido_id obrigatório" }, { status: 400 });
  }

  // ── 2. Busca pedido + cliente no banco (service role bypassa RLS) ─────────
  const db = createAdminClient();

  const { data: pedido, error: ePedido } = await db
    .from("pedidos_certificados")
    .select(`
      id, produto, preco_venda, status, mp_preference_id,
      clientes!cliente_id(name, email)
    `)
    .eq("id", pedido_id)
    .single();

  if (ePedido || !pedido) {
    return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });
  }

  // ── 3. Validações de negócio ──────────────────────────────────────────────
  if (pedido.status !== "pending_payment") {
    // Pedido já pago ou cancelado — não gera novo checkout
    return NextResponse.json(
      { error: "Pedido não está aguardando pagamento" },
      { status: 409 }
    );
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!appUrl) {
    console.error("[pagamento/criar] NEXT_PUBLIC_APP_URL não configurado");
    return NextResponse.json({ error: "Configuração interna ausente" }, { status: 500 });
  }

  // ── 4. Idempotência: retorna preference existente se ainda válida ─────────
  if (pedido.mp_preference_id) {
    try {
      const existing = await new Preference(getMPClient()).get({
        preferenceId: pedido.mp_preference_id,
      });
      if (existing?.init_point) {
        return NextResponse.json({
          checkout_url:  existing.init_point,
          preference_id: pedido.mp_preference_id,
        });
      }
    } catch {
      // Preference expirada ou inválida — cria uma nova abaixo
    }
  }

  // ── 5. Cria nova preferência no Mercado Pago ──────────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cliente = pedido.clientes as any;

  // Modo de teste: cobra R$1,00 no checkout do MP quando MP_PRECO_TESTE=true.
  // Afeta apenas o unit_price enviado ao MP — o banco mantém o valor real.
  // NUNCA definir esta variável em produção (Vercel Production).
  const modoTeste  = process.env.MP_PRECO_TESTE === "true";
  const precoFinal = modoTeste ? 1.00 : Number(pedido.preco_venda);
  if (modoTeste) {
    console.info("[pagamento/criar] MP_PRECO_TESTE ativo — cobrando R$1,00 (original:", pedido.preco_venda, ")");
  }

  let result;
  try {
    result = await new Preference(getMPClient()).create({
      body: {
        items: [
          {
            id:          pedido.id,
            title:       PRODUTO_LABEL_MP[pedido.produto] ?? pedido.produto,
            quantity:    1,
            unit_price:  precoFinal,
            currency_id: "BRL",
          },
        ],
        payer: {
          name:  cliente?.name  ?? undefined,
          email: cliente?.email ?? undefined,
        },
        external_reference: pedido.id,
        // back_urls e auto_return só funcionam com HTTPS no MP
        ...(appUrl.startsWith("https://") && {
          back_urls: {
            success: `${appUrl}/certificados?payment=approved&pedido=${pedido.id}`,
            failure: `${appUrl}/certificados?payment=rejected&pedido=${pedido.id}`,
            pending: `${appUrl}/certificados?payment=pending&pedido=${pedido.id}`,
          },
          auto_return:     "approved",
          notification_url:`${appUrl}/api/pagamento/webhook`,
        }),
        // Aceita todos os meios de pagamento disponíveis na conta MP,
        // incluindo PIX, cartão de crédito, débito e boleto.
        // Listas vazias = sem exclusões = MP decide o que exibir.
        payment_methods: {
          excluded_payment_types:   [],
          excluded_payment_methods: [],
          installments:             12,
        },
        statement_descriptor: "77 ASSISTECH",
        // Expira em 24h para evitar links zumbis
        expires:              true,
        expiration_date_to:   new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      },
    });
  } catch (err) {
    console.error("[pagamento/criar] Erro MP:", err);
    return NextResponse.json({ error: "Falha ao criar preferência de pagamento" }, { status: 502 });
  }

  if (!result.id || !result.init_point) {
    return NextResponse.json({ error: "Resposta inválida do Mercado Pago" }, { status: 502 });
  }

  // ── 6. Persiste preference_id no pedido ──────────────────────────────────
  await db
    .from("pedidos_certificados")
    .update({ mp_preference_id: result.id })
    .eq("id", pedido.id);

  return NextResponse.json({
    checkout_url:  result.init_point,
    preference_id: result.id,
  });
}
