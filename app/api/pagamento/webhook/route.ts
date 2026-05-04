import { NextRequest, NextResponse } from "next/server";
import { Payment } from "mercadopago";
import { getMPClient, PRODUTO_LABEL_MP } from "@/app/lib/mercadopago";
import { createAdminClient } from "@/app/lib/supabase/admin";
import { dispararEmailsPagamento } from "@/app/lib/email/service";
import crypto from "crypto";

// ─── Validação de assinatura do Mercado Pago ──────────────────────────────────
// https://www.mercadopago.com.br/developers/pt/docs/your-integrations/notifications/webhooks
function validateMPSignature(
  req: NextRequest,
  dataId: string | undefined
): boolean {
  const secret = process.env.MP_WEBHOOK_SECRET;
  // Se o secret não estiver configurado, pula validação (útil no sandbox)
  if (!secret) return true;

  const signature  = req.headers.get("x-signature") ?? "";
  const requestId  = req.headers.get("x-request-id") ?? "";

  // Extrai ts e v1 do header X-Signature: "ts=...,v1=..."
  const parts: Record<string, string> = {};
  for (const part of signature.split(",")) {
    const [k, v] = part.split("=");
    if (k && v) parts[k.trim()] = v.trim();
  }
  const { ts, v1 } = parts;
  if (!ts || !v1) return false;

  const signedString = `id:${dataId};request-id:${requestId};ts:${ts}`;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(signedString)
    .digest("hex");

  try {
    return crypto.timingSafeEqual(
      Buffer.from(v1,       "hex"),
      Buffer.from(expected, "hex")
    );
  } catch {
    return false;
  }
}

// ─── Handler ──────────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  // ── 1. Parse do body ──────────────────────────────────────────────────────
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    // Body vazio ou inválido — MP às vezes envia pings sem body
    return new NextResponse(null, { status: 200 });
  }

  // ── 2. Filtra apenas notificações de pagamento ────────────────────────────
  if (body.type !== "payment") {
    // Outros tipos (merchant_orders, chargebacks…): acusa recebimento e ignora
    return new NextResponse(null, { status: 200 });
  }

  const dataId = (body.data as Record<string, string> | undefined)?.id;
  if (!dataId) {
    return new NextResponse(null, { status: 200 });
  }

  // ── 3. Valida assinatura ──────────────────────────────────────────────────
  if (!validateMPSignature(req, dataId)) {
    console.warn("[webhook/pagamento] Assinatura inválida — ignorando");
    return new NextResponse(null, { status: 401 });
  }

  // ── 4. Busca detalhes do pagamento na API do MP ───────────────────────────
  let payment;
  try {
    payment = await new Payment(getMPClient()).get({ id: dataId });
  } catch (err) {
    console.error("[webhook/pagamento] Erro ao buscar pagamento MP:", err);
    // Retorna 200 para o MP não tentar de novo indefinidamente
    return new NextResponse(null, { status: 200 });
  }

  // Só processa pagamentos aprovados com referência válida
  if (payment.status !== "approved" || !payment.external_reference) {
    return new NextResponse(null, { status: 200 });
  }

  const pedidoId = payment.external_reference;

  // ── 5. Atualiza pedido no banco ───────────────────────────────────────────
  let pedidoAtualizado = false;
  let dadosParaEmail: {
    produto:      string;
    preco_venda:  number;
    clientes:     { name: string; email: string } | null;
  } | null = null;

  try {
    const db = createAdminClient();

    // Busca pedido com dados do cliente para usar nos e-mails
    // (join com clientes para evitar uma segunda query depois)
    const { data: pedido } = await db
      .from("pedidos_certificados")
      .select(`
        status, produto, preco_venda,
        clientes!cliente_id(name, email)
      `)
      .eq("id", pedidoId)
      .single();

    if (!pedido) {
      console.warn("[webhook/pagamento] Pedido não encontrado:", pedidoId);
      return new NextResponse(null, { status: 200 });
    }

    // Idempotência: só atualiza se ainda estiver em pending_payment
    if (pedido.status === "pending_payment") {
      await db
        .from("pedidos_certificados")
        .update({
          status:         "paid",
          payment_method: payment.payment_type_id ?? "mercadopago",
          mp_payment_id:  String(payment.id),
        })
        .eq("id", pedidoId);

      pedidoAtualizado = true;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      dadosParaEmail   = pedido as any;
    }
    // Se status já avançou (paid, processing, issued…), ignora silenciosamente
  } catch (err) {
    console.error("[webhook/pagamento] Erro ao atualizar pedido:", err);
  }

  // ── 6. Dispara e-mails — desacoplado e não-bloqueante ────────────────────
  // Só envia quando o pedido foi realmente atualizado (evita reenvio em retentativas)
  if (pedidoAtualizado && dadosParaEmail) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const cliente = dadosParaEmail.clientes as any;
      await dispararEmailsPagamento({
        pedidoId,
        shortId:       pedidoId.slice(0, 8).toUpperCase(),
        clienteNome:   cliente?.name  ?? "Cliente",
        clienteEmail:  cliente?.email ?? "",
        produto:       PRODUTO_LABEL_MP[dadosParaEmail.produto] ?? dadosParaEmail.produto,
        preco:         Number(dadosParaEmail.preco_venda),
        paymentMethod: payment.payment_type_id ?? "mercadopago",
      });
    } catch (err) {
      // Falha de e-mail NUNCA cancela o 200 — pagamento já foi confirmado no banco
      console.error("[webhook/pagamento] Erro ao disparar e-mails:", err);
    }
  }

  // Sempre retorna 200 — o MP interpreta qualquer outro código como falha e retenta
  return new NextResponse(null, { status: 200 });
}
