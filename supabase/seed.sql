-- ═══════════════════════════════════════════════════════════════════════════
-- CertHub — Seed: planos com comissões
-- Execute APÓS o migration 001_schema.sql
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO planos (id, system_name, plan_name, category, monthly_price, commission_value) VALUES

  -- PDV Express
  ('pdv_starter',   'PDV Express', 'Starter',  'PDV',        89.90,  50.00),
  ('pdv_pro',       'PDV Express', 'Pro',       'PDV',       149.90,  70.00),
  ('pdv_premium',   'PDV Express', 'Premium',   'PDV',       229.90,  90.00),

  -- ERP Completo
  ('erp_start',     'ERP Completo', 'Start',     'ERP',      199.90,  80.00),
  ('erp_business',  'ERP Completo', 'Business',  'ERP',      349.90, 120.00),
  ('erp_enterprise','ERP Completo', 'Enterprise','ERP',      599.90, 180.00),

  -- Emissor NF-e
  ('nfe_basico',    'Emissor NF-e', 'Básico',    'Fiscal',    79.90,  40.00),
  ('nfe_completo',  'Emissor NF-e', 'Completo',  'Fiscal',   129.90,  60.00),

  -- Financeiro
  ('fin_starter',   'Financeiro',   'Starter',   'Financeiro', 99.90, 50.00),
  ('fin_pro',       'Financeiro',   'Pro',        'Financeiro',179.90, 80.00);
