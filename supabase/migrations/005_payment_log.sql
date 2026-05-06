-- ═══════════════════════════════════════════════════════════════════════════
-- CertHub — Log de payload do webhook de pagamento
-- Execute no Supabase: SQL Editor → New query → Cole e rode
-- ═══════════════════════════════════════════════════════════════════════════

-- Armazena o payload bruto do MP para auditoria e reprocessamento
ALTER TABLE public.pedidos_certificados
  ADD COLUMN IF NOT EXISTS mp_webhook_payload JSONB,
  ADD COLUMN IF NOT EXISTS mp_paid_at         TIMESTAMPTZ;
