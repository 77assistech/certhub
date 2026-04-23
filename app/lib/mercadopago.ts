import { MercadoPagoConfig } from "mercadopago";

let _client: MercadoPagoConfig | null = null;

/**
 * Retorna o cliente MP como singleton.
 * Instanciado na primeira chamada — sem overhead em rotas não-MP.
 */
export function getMPClient(): MercadoPagoConfig {
  if (!_client) {
    if (!process.env.MP_ACCESS_TOKEN) {
      throw new Error("MP_ACCESS_TOKEN não configurado");
    }
    _client = new MercadoPagoConfig({
      accessToken: process.env.MP_ACCESS_TOKEN,
    });
  }
  return _client;
}

// Labels para exibição no checkout MP
export const PRODUTO_LABEL_MP: Record<string, string> = {
  a1_pf:     "Certificado Digital A1 – Pessoa Física",
  a1_pj:     "Certificado Digital A1 – Pessoa Jurídica",
  a3_pf_sem: "Certificado Digital A3 PF – Sem Token",
  a3_pj_sem: "Certificado Digital A3 PJ – Sem Token",
  a3_pf_com: "Certificado Digital A3 PF – Com Token",
  a3_pj_com: "Certificado Digital A3 PJ – Com Token",
  // Legados
  a1:        "Certificado Digital A1",
  a3_sem:    "Certificado Digital A3 – Sem Token",
  a3_com:    "Certificado Digital A3 – Com Token",
};
