-- ═══════════════════════════════════════════════════════════════════════════
-- CertHub — Schema inicial
-- Execute no Supabase: Dashboard → SQL Editor → New query → Cole e rode
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── ENUM TYPES ───────────────────────────────────────────────────────────────

CREATE TYPE status_contador    AS ENUM ('pending', 'active', 'blocked');
CREATE TYPE status_assinatura  AS ENUM ('active', 'cancelled', 'suspended');
CREATE TYPE status_pagamento   AS ENUM ('pending', 'paid', 'failed', 'refunded');
CREATE TYPE status_comissao    AS ENUM ('pending', 'approved', 'paid', 'cancelled');
CREATE TYPE status_certificado AS ENUM ('pending_payment','paid','processing','issued','cancelled');
CREATE TYPE tipo_comissao      AS ENUM ('sistema', 'certificado');

-- ─── CONTADORES ───────────────────────────────────────────────────────────────

CREATE TABLE contadores (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID REFERENCES auth.users(id) ON DELETE SET NULL,  -- Supabase Auth
  name       TEXT NOT NULL,
  email      TEXT NOT NULL UNIQUE,
  crc        TEXT NOT NULL UNIQUE,
  phone      TEXT,
  status     status_contador NOT NULL DEFAULT 'pending',
  joined_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── CLIENTES ─────────────────────────────────────────────────────────────────

CREATE TABLE clientes (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT NOT NULL,
  document     TEXT NOT NULL,   -- CPF ou CNPJ (apenas dígitos)
  email        TEXT,
  phone        TEXT,
  contador_id  UUID REFERENCES contadores(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── PLANOS ───────────────────────────────────────────────────────────────────

CREATE TABLE planos (
  id                TEXT PRIMARY KEY,   -- ex: 'pdv_pro'
  system_name       TEXT NOT NULL,      -- ex: 'PDV Express'
  plan_name         TEXT NOT NULL,      -- ex: 'Pro'
  category          TEXT NOT NULL,      -- 'PDV' | 'ERP' | 'Fiscal' | 'Financeiro'
  monthly_price     NUMERIC(10,2) NOT NULL,
  commission_value  NUMERIC(10,2) NOT NULL,
  active            BOOLEAN NOT NULL DEFAULT true,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── ASSINATURAS ──────────────────────────────────────────────────────────────

CREATE TABLE assinaturas (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id    UUID NOT NULL REFERENCES clientes(id) ON DELETE RESTRICT,
  plano_id      TEXT NOT NULL REFERENCES planos(id),
  contador_id   UUID REFERENCES contadores(id) ON DELETE SET NULL,
  status        status_assinatura NOT NULL DEFAULT 'active',
  started_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  cancelled_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── PAGAMENTOS ───────────────────────────────────────────────────────────────

CREATE TABLE pagamentos (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assinatura_id       UUID NOT NULL REFERENCES assinaturas(id) ON DELETE CASCADE,
  numero_mensalidade  INTEGER NOT NULL CHECK (numero_mensalidade > 0),
  valor               NUMERIC(10,2) NOT NULL CHECK (valor > 0),
  status              status_pagamento NOT NULL DEFAULT 'pending',
  paid_at             TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE (assinatura_id, numero_mensalidade)   -- impede mensalidade duplicada
);

-- ─── PEDIDOS DE CERTIFICADOS ──────────────────────────────────────────────────

CREATE TABLE pedidos_certificados (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contador_id     UUID REFERENCES contadores(id) ON DELETE SET NULL,
  cliente_id      UUID REFERENCES clientes(id) ON DELETE SET NULL,
  produto         TEXT NOT NULL,           -- 'a1' | 'a3_sem' | 'a3_com'
  preco_venda     NUMERIC(10,2) NOT NULL,
  comissao        NUMERIC(10,2) NOT NULL,
  status          status_certificado NOT NULL DEFAULT 'pending_payment',
  payment_method  TEXT,                    -- 'pix' | 'credit_card' | 'boleto'
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── COMISSÕES ────────────────────────────────────────────────────────────────

CREATE TABLE comissoes (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contador_id            UUID NOT NULL REFERENCES contadores(id) ON DELETE RESTRICT,
  tipo                   tipo_comissao NOT NULL,

  -- Sistema (preenchido quando tipo = 'sistema')
  assinatura_id          UUID REFERENCES assinaturas(id) ON DELETE SET NULL,
  plano_id               TEXT REFERENCES planos(id),
  trigger_pagamento_id   UUID REFERENCES pagamentos(id) ON DELETE SET NULL,

  -- Certificado (preenchido quando tipo = 'certificado')
  pedido_certificado_id  UUID REFERENCES pedidos_certificados(id) ON DELETE SET NULL,

  valor       NUMERIC(10,2) NOT NULL CHECK (valor > 0),
  status      status_comissao NOT NULL DEFAULT 'pending',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  paid_at     TIMESTAMPTZ,

  -- Garante que cada assinatura só gera uma comissão de sistema
  UNIQUE (assinatura_id, tipo)
);

-- ─── ÍNDICES ──────────────────────────────────────────────────────────────────

CREATE INDEX idx_assinaturas_contador  ON assinaturas(contador_id);
CREATE INDEX idx_assinaturas_cliente   ON assinaturas(cliente_id);
CREATE INDEX idx_pagamentos_assinatura ON pagamentos(assinatura_id);
CREATE INDEX idx_comissoes_contador    ON comissoes(contador_id);
CREATE INDEX idx_comissoes_status      ON comissoes(status);
CREATE INDEX idx_clientes_contador     ON clientes(contador_id);

-- ═══════════════════════════════════════════════════════════════════════════
-- TRIGGER: gera comissão única na 2ª mensalidade paga
-- ═══════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION gerar_comissao_sistema()
RETURNS TRIGGER AS $$
DECLARE
  v_assinatura  assinaturas%ROWTYPE;
  v_plano       planos%ROWTYPE;
BEGIN
  -- Só age quando status muda PARA 'paid'
  IF NEW.status <> 'paid' OR OLD.status = 'paid' THEN
    RETURN NEW;
  END IF;

  -- Só age na 2ª mensalidade
  IF NEW.numero_mensalidade <> 2 THEN
    RETURN NEW;
  END IF;

  -- Busca assinatura
  SELECT * INTO v_assinatura FROM assinaturas WHERE id = NEW.assinatura_id;

  -- Só gera se tiver contador vinculado
  IF v_assinatura.contador_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Assinatura deve estar ativa
  IF v_assinatura.status <> 'active' THEN
    RETURN NEW;
  END IF;

  -- Busca plano (para pegar o valor da comissão)
  SELECT * INTO v_plano FROM planos WHERE id = v_assinatura.plano_id;

  -- INSERT com UNIQUE (assinatura_id, tipo) como proteção extra contra duplicata
  INSERT INTO comissoes (
    contador_id,
    tipo,
    assinatura_id,
    plano_id,
    trigger_pagamento_id,
    valor,
    status
  ) VALUES (
    v_assinatura.contador_id,
    'sistema',
    v_assinatura.id,
    v_assinatura.plano_id,
    NEW.id,
    v_plano.commission_value,
    'pending'
  )
  ON CONFLICT (assinatura_id, tipo) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_comissao_sistema
AFTER UPDATE OF status ON pagamentos
FOR EACH ROW
EXECUTE FUNCTION gerar_comissao_sistema();

-- ═══════════════════════════════════════════════════════════════════════════
-- TRIGGER: gera comissão de certificado ao emitir pedido
-- ═══════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION gerar_comissao_certificado()
RETURNS TRIGGER AS $$
BEGIN
  -- Só age quando status muda PARA 'issued'
  IF NEW.status <> 'issued' OR OLD.status = 'issued' THEN
    RETURN NEW;
  END IF;

  -- Só gera se tiver contador vinculado
  IF NEW.contador_id IS NULL THEN
    RETURN NEW;
  END IF;

  INSERT INTO comissoes (
    contador_id,
    tipo,
    pedido_certificado_id,
    valor,
    status
  ) VALUES (
    NEW.contador_id,
    'certificado',
    NEW.id,
    NEW.comissao,
    'pending'
  )
  ON CONFLICT DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_comissao_certificado
AFTER UPDATE OF status ON pedidos_certificados
FOR EACH ROW
EXECUTE FUNCTION gerar_comissao_certificado();

-- ═══════════════════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE contadores           ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes             ENABLE ROW LEVEL SECURITY;
ALTER TABLE assinaturas          ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagamentos           ENABLE ROW LEVEL SECURITY;
ALTER TABLE comissoes            ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedidos_certificados ENABLE ROW LEVEL SECURITY;
ALTER TABLE planos               ENABLE ROW LEVEL SECURITY;

-- Contador vê apenas seus próprios dados
CREATE POLICY "contador_ve_proprios_dados" ON contadores
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "contador_ve_proprios_clientes" ON clientes
  FOR SELECT USING (
    contador_id IN (SELECT id FROM contadores WHERE user_id = auth.uid())
  );

CREATE POLICY "contador_ve_proprias_assinaturas" ON assinaturas
  FOR SELECT USING (
    contador_id IN (SELECT id FROM contadores WHERE user_id = auth.uid())
  );

CREATE POLICY "contador_ve_proprias_comissoes" ON comissoes
  FOR SELECT USING (
    contador_id IN (SELECT id FROM contadores WHERE user_id = auth.uid())
  );

CREATE POLICY "contador_ve_proprios_pedidos" ON pedidos_certificados
  FOR SELECT USING (
    contador_id IN (SELECT id FROM contadores WHERE user_id = auth.uid())
  );

-- Planos são públicos (leitura)
CREATE POLICY "planos_publicos" ON planos
  FOR SELECT USING (active = true);
