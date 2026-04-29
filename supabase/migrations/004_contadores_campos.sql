-- ═══════════════════════════════════════════════════════════════════════════
-- CertHub — Campos adicionais em contadores
-- Execute no Supabase: SQL Editor → New query → Cole e rode
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE public.contadores
  ADD COLUMN IF NOT EXISTS cidade      TEXT,
  ADD COLUMN IF NOT EXISTS estado      TEXT,
  ADD COLUMN IF NOT EXISTS observacoes TEXT;
