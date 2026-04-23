-- ═══════════════════════════════════════════════════════════════════════════
-- CertHub — Mercado Pago
-- Execute no Supabase: SQL Editor → New query → Cole e rode
-- ═══════════════════════════════════════════════════════════════════════════

-- Adiciona colunas de pagamento MP à tabela de pedidos
ALTER TABLE public.pedidos_certificados
  ADD COLUMN IF NOT EXISTS mp_preference_id TEXT,
  ADD COLUMN IF NOT EXISTS mp_payment_id    TEXT;

-- Índice para lookup rápido pelo webhook
CREATE INDEX IF NOT EXISTS idx_pedidos_mp_payment_id
  ON public.pedidos_certificados (mp_payment_id)
  WHERE mp_payment_id IS NOT NULL;
