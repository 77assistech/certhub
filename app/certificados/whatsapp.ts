// ─── Configuração ─────────────────────────────────────────────────────────────
// Defina NEXT_PUBLIC_WA_NUMBER no .env.local para sobrescrever.
export const WA_NUMBER =
  process.env.NEXT_PUBLIC_WA_NUMBER ?? "5511999999999";

// ─── Tipos ────────────────────────────────────────────────────────────────────
export interface WaMsgParams {
  /** UUID completo do pedido (exibido como short ID) */
  pedidoId: string;
  /** Nome completo do cliente */
  nome: string;
  /** Descrição legível do produto, ex: "A1 Pessoa Física – CPF" */
  produto: string;
}

// ─── Builder ──────────────────────────────────────────────────────────────────
/**
 * Gera a URL wa.me com mensagem pré-preenchida.
 * Puro — sem side-effects, fácil de testar.
 */
export function buildWaUrl(params: WaMsgParams): string {
  const shortId = params.pedidoId.slice(0, 8).toUpperCase();

  const linhas = [
    "Olá! Acabei de solicitar um certificado digital pelo site da 77 AssisTech.",
    "",
    `📋 Pedido: ${shortId}`,
    `👤 Nome: ${params.nome}`,
    `📜 Produto: ${params.produto}`,
    "",
    "Gostaria de dar continuidade no atendimento.",
  ];

  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(linhas.join("\n"))}`;
}
