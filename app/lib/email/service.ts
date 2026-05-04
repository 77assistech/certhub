import { Resend } from "resend";
import {
  type DadosPedidoEmail,
  templateConfirmacaoCliente,
  templateAlertaAdmin,
} from "./templates";

// ─── Cliente Resend (singleton) ───────────────────────────────────────────────

let _resend: Resend | null = null;

function getResendClient(): Resend | null {
  if (!process.env.RESEND_API_KEY) {
    console.warn("[email] RESEND_API_KEY não configurado — envio desabilitado");
    return null;
  }
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}

// ─── Configuração de remetente ────────────────────────────────────────────────

function getFrom(): string {
  return process.env.EMAIL_FROM ?? "77 Assistech <noreply@77assistech.com.br>";
}

function getAdminEmail(): string {
  return process.env.EMAIL_ADMIN ?? "77assistech@gmail.com";
}

// ─── Função base de envio ─────────────────────────────────────────────────────

interface EnviarEmailParams {
  to:      string;
  subject: string;
  html:    string;
}

/**
 * Envia um e-mail via Resend.
 * Retorna true em caso de sucesso, false em caso de falha.
 * Nunca lança exceção — seguro para uso em webhooks.
 */
export async function enviarEmail(params: EnviarEmailParams): Promise<boolean> {
  const resend = getResendClient();
  if (!resend) return false;

  try {
    const { data, error } = await resend.emails.send({
      from:    getFrom(),
      to:      [params.to],
      subject: params.subject,
      html:    params.html,
    });

    if (error) {
      console.error("[email] Falha ao enviar:", { to: params.to, subject: params.subject, error });
      return false;
    }

    console.info("[email] Enviado com sucesso:", { id: data?.id, to: params.to, subject: params.subject });
    return true;
  } catch (err) {
    console.error("[email] Erro inesperado:", { to: params.to, error: err });
    return false;
  }
}

// ─── E-mail de confirmação para o cliente ─────────────────────────────────────

/**
 * Envia confirmação de pagamento ao cliente.
 * Fire-and-forget seguro: nunca lança exceção.
 */
export async function enviarConfirmacaoCliente(dados: DadosPedidoEmail): Promise<void> {
  const template = templateConfirmacaoCliente(dados);
  const ok = await enviarEmail({
    to:      dados.clienteEmail,
    subject: template.subject,
    html:    template.html,
  });

  if (!ok) {
    // Log estruturado para rastreamento e reenvio manual se necessário
    console.error("[email/cliente] Falha na confirmação:", {
      pedidoId: dados.pedidoId,
      shortId:  dados.shortId,
      email:    dados.clienteEmail,
    });
  }
}

// ─── E-mail de alerta para o admin ───────────────────────────────────────────

/**
 * Notifica o admin sobre novo pedido pago.
 * Fire-and-forget seguro: nunca lança exceção.
 */
export async function enviarAlertaAdmin(dados: DadosPedidoEmail): Promise<void> {
  const adminEmail = getAdminEmail();
  const template   = templateAlertaAdmin(dados);
  const ok = await enviarEmail({
    to:      adminEmail,
    subject: template.subject,
    html:    template.html,
  });

  if (!ok) {
    console.error("[email/admin] Falha no alerta:", {
      pedidoId: dados.pedidoId,
      shortId:  dados.shortId,
      adminEmail,
    });
  }
}

// ─── Dispatcher: dispara os dois e-mails em paralelo ─────────────────────────

/**
 * Dispara confirmação ao cliente e alerta ao admin em paralelo.
 * Ambos são independentes — falha em um não afeta o outro.
 * Deve ser chamado em try-catch no webhook para garantir isolamento total.
 */
export async function dispararEmailsPagamento(dados: DadosPedidoEmail): Promise<void> {
  await Promise.allSettled([
    enviarConfirmacaoCliente(dados),
    enviarAlertaAdmin(dados),
  ]);
}
