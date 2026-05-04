// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface DadosPedidoEmail {
  pedidoId:      string;   // UUID completo
  shortId:       string;   // 8 primeiros chars, maiúsculo
  clienteNome:   string;
  clienteEmail:  string;
  produto:       string;   // label legível, ex: "Certificado Digital A1 – PF"
  preco:         number;
  paymentMethod: string;   // "credit_card", "pix", etc.
}

export interface EmailTemplate {
  subject: string;
  html:    string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const fmtMetodo = (method: string): string => {
  const map: Record<string, string> = {
    credit_card:  "Cartão de crédito",
    debit_card:   "Cartão de débito",
    pix:          "Pix",
    mercadopago:  "Mercado Pago",
    ticket:       "Boleto",
    bank_transfer:"Transferência bancária",
  };
  return map[method] ?? method;
};

// ─── Layout base (wrapper HTML compartilhado) ─────────────────────────────────

function layout(content: string): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>77 Assistech</title>
</head>
<body style="margin:0;padding:0;background:#F4F4F4;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F4F4F4;padding:32px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#FFFFFF;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:#0F0F0F;padding:28px 40px;text-align:center;">
              <span style="font-size:22px;font-weight:800;color:#FFFFFF;letter-spacing:0.5px;">
                <span style="color:#F07800;">77 </span>ASSISTECH
              </span>
              <div style="font-size:11px;color:#555;margin-top:4px;letter-spacing:1.5px;text-transform:uppercase;">
                Certificados Digitais
              </div>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 40px;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#F9F9F9;border-top:1px solid #EFEFEF;padding:20px 40px;text-align:center;">
              <p style="font-size:12px;color:#999;margin:0;line-height:1.6;">
                77 Assistech · Plataforma de Certificados Digitais<br/>
                <a href="https://77assistech.com.br" style="color:#F07800;text-decoration:none;">77assistech.com.br</a>
                &nbsp;·&nbsp;
                <a href="https://wa.me/5577988160268" style="color:#F07800;text-decoration:none;">WhatsApp</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ─── Template: Confirmação para o cliente ─────────────────────────────────────

export function templateConfirmacaoCliente(dados: DadosPedidoEmail): EmailTemplate {
  const html = layout(`
    <!-- Ícone de sucesso -->
    <div style="text-align:center;margin-bottom:28px;">
      <div style="display:inline-block;width:64px;height:64px;background:#F0FFF4;border:2px solid #22C55E;border-radius:50%;line-height:64px;font-size:28px;">
        ✓
      </div>
    </div>

    <h1 style="font-size:24px;font-weight:700;color:#111;text-align:center;margin:0 0 8px;">
      Pagamento confirmado!
    </h1>
    <p style="font-size:15px;color:#555;text-align:center;margin:0 0 32px;line-height:1.6;">
      Olá, <strong style="color:#111;">${dados.clienteNome}</strong>.<br/>
      Recebemos seu pagamento e sua solicitação já está em andamento.
    </p>

    <!-- Resumo do pedido -->
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#F9F9F9;border:1px solid #EFEFEF;border-radius:10px;margin-bottom:28px;">
      <tr>
        <td style="padding:20px 24px;">
          <p style="font-size:10px;font-weight:700;color:#999;text-transform:uppercase;letter-spacing:1.5px;margin:0 0 14px;">
            Resumo do pedido
          </p>
          ${[
            ["Nº do pedido",    `<code style="font-family:monospace;font-size:13px;background:#EFEFEF;padding:2px 7px;border-radius:4px;">${dados.shortId}</code>`],
            ["Produto",         dados.produto],
            ["Valor pago",      `<strong style="color:#F07800;">${fmt(dados.preco)}</strong>`],
            ["Forma de pagamento", fmtMetodo(dados.paymentMethod)],
          ].map(([l, v]) => `
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:10px;">
            <tr>
              <td style="font-size:13px;color:#888;">${l}</td>
              <td align="right" style="font-size:13px;color:#111;">${v}</td>
            </tr>
          </table>`).join("")}
        </td>
      </tr>
    </table>

    <!-- Próximos passos -->
    <h2 style="font-size:15px;font-weight:700;color:#111;margin:0 0 14px;">
      Próximos passos
    </h2>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
      ${[
        ["1", "Nossa equipe revisará seu pedido e entrará em contato em até 1 dia útil."],
        ["2", "Você receberá as instruções para agendar a validação presencial ou videoconferência."],
        ["3", "Após a validação, o certificado é emitido e entregue digitalmente."],
      ].map(([n, texto]) => `
      <tr>
        <td valign="top" style="padding:6px 0;">
          <table cellpadding="0" cellspacing="0">
            <tr>
              <td valign="top" style="padding-right:12px;">
                <div style="width:24px;height:24px;background:#F07800;border-radius:50%;text-align:center;line-height:24px;font-size:12px;font-weight:800;color:#000;">
                  ${n}
                </div>
              </td>
              <td style="font-size:13.5px;color:#444;line-height:1.6;padding-top:3px;">
                ${texto}
              </td>
            </tr>
          </table>
        </td>
      </tr>`).join("")}
    </table>

    <!-- CTA WhatsApp -->
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center">
          <a href="https://wa.me/5577988160268?text=Olá!%20Paguei%20o%20certificado%20${dados.shortId}%20e%20gostaria%20de%20mais%20informações."
            style="display:inline-block;background:#25D366;color:#000;font-size:14px;font-weight:800;padding:13px 32px;border-radius:10px;text-decoration:none;">
            💬 Falar com nossa equipe
          </a>
        </td>
      </tr>
    </table>
  `);

  return {
    subject: `✓ Pagamento confirmado – Pedido ${dados.shortId}`,
    html,
  };
}

// ─── Template: Alerta para o admin ───────────────────────────────────────────

export function templateAlertaAdmin(dados: DadosPedidoEmail): EmailTemplate {
  const html = layout(`
    <!-- Badge novo pedido -->
    <div style="text-align:center;margin-bottom:24px;">
      <span style="display:inline-block;background:#FFF3E0;border:1.5px solid #F07800;color:#F07800;font-size:12px;font-weight:800;padding:5px 16px;border-radius:100px;letter-spacing:0.5px;text-transform:uppercase;">
        Novo pedido pago
      </span>
    </div>

    <h1 style="font-size:22px;font-weight:700;color:#111;text-align:center;margin:0 0 6px;">
      Pagamento aprovado
    </h1>
    <p style="font-size:14px;color:#666;text-align:center;margin:0 0 28px;">
      Um novo pedido foi pago e aguarda processamento.
    </p>

    <!-- Dados do pedido -->
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#F9F9F9;border:1px solid #EFEFEF;border-radius:10px;margin-bottom:24px;">
      <tr>
        <td style="padding:20px 24px;">
          <p style="font-size:10px;font-weight:700;color:#999;text-transform:uppercase;letter-spacing:1.5px;margin:0 0 14px;">
            Detalhes do pedido
          </p>
          ${[
            ["Nº do pedido",    `<code style="font-family:monospace;font-size:13px;background:#EFEFEF;padding:2px 7px;border-radius:4px;">${dados.shortId}</code>`],
            ["Cliente",         `<strong>${dados.clienteNome}</strong>`],
            ["E-mail do cliente",`<a href="mailto:${dados.clienteEmail}" style="color:#F07800;">${dados.clienteEmail}</a>`],
            ["Produto",         dados.produto],
            ["Valor",           `<strong style="color:#F07800;">${fmt(dados.preco)}</strong>`],
            ["Pagamento",       fmtMetodo(dados.paymentMethod)],
          ].map(([l, v]) => `
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:10px;">
            <tr>
              <td style="font-size:13px;color:#888;width:45%;">${l}</td>
              <td align="right" style="font-size:13px;color:#111;">${v}</td>
            </tr>
          </table>`).join("")}
        </td>
      </tr>
    </table>

    <!-- Ação necessária -->
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#FFF8F0;border:1.5px solid rgba(240,120,0,0.3);border-radius:10px;margin-bottom:28px;">
      <tr>
        <td style="padding:16px 20px;">
          <p style="font-size:13px;font-weight:700;color:#F07800;margin:0 0 6px;">
            ⚡ Ação necessária
          </p>
          <p style="font-size:13px;color:#555;margin:0;line-height:1.6;">
            Agendar o atendimento com o cliente e iniciar o processo de emissão do certificado.
            Prazo sugerido: <strong>1 dia útil</strong>.
          </p>
        </td>
      </tr>
    </table>

    <!-- CTA painel admin -->
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center">
          <a href="${process.env.NEXT_PUBLIC_APP_URL ?? "https://77assistech.com.br"}/admin"
            style="display:inline-block;background:#F07800;color:#000;font-size:14px;font-weight:800;padding:13px 32px;border-radius:10px;text-decoration:none;">
            Abrir painel admin
          </a>
        </td>
      </tr>
    </table>
  `);

  return {
    subject: `🟠 Novo pedido pago – ${dados.clienteNome} · ${dados.shortId}`,
    html,
  };
}
