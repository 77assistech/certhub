-- ═══════════════════════════════════════════════════════════════════════════
-- CertHub — Row Level Security
-- Execute no Supabase: SQL Editor → New query → Cole e rode
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── PASSO 1: Migrar role do admin para app_metadata ─────────────────────────
-- app_metadata só pode ser escrito via service role (nunca pelo usuário).
-- user_metadata pode ser alterado pelo próprio usuário → NUNCA use para segurança.

UPDATE auth.users
SET raw_app_meta_data = jsonb_set(
  COALESCE(raw_app_meta_data, '{}'::jsonb),
  '{role}',
  '"admin"'
)
WHERE raw_user_meta_data ->> 'role' = 'admin';

-- Verifique antes de continuar:
-- SELECT email, raw_app_meta_data FROM auth.users WHERE raw_app_meta_data ->> 'role' = 'admin';

-- ─── PASSO 2: Funções auxiliares ─────────────────────────────────────────────

-- is_admin(): verifica app_metadata (imutável pelo usuário)
-- SECURITY DEFINER: acessa auth.users mesmo sem permissão direta
-- STABLE: resultado cacheia por transação (performance)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM auth.users
    WHERE id = auth.uid()
      AND raw_app_meta_data ->> 'role' = 'admin'
  )
$$;

-- my_contador_id(): retorna o UUID do contador vinculado ao usuário autenticado
-- Retorna NULL se o usuário não for um contador (ex: admin logando)
CREATE OR REPLACE FUNCTION public.my_contador_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id
  FROM public.contadores
  WHERE user_id = auth.uid()
  LIMIT 1
$$;

-- ─── PASSO 3: Stored function pública para /certificados ─────────────────────
-- Chamada por usuários anônimos no fluxo de compra.
-- SECURITY DEFINER: roda com permissões do dono (postgres), bypassando RLS.
-- O anônimo nunca toca diretamente em clientes ou pedidos_certificados.

CREATE OR REPLACE FUNCTION public.criar_pedido_certificado(
  p_nome         text,
  p_document     text,     -- apenas dígitos (CPF ou CNPJ)
  p_email        text,
  p_phone        text,
  p_produto      text,     -- ex: 'a1_pf', 'a3_pj_com'
  p_preco_venda  numeric,
  p_comissao     numeric,  -- ignorado se não houver contador vinculado
  p_contador_id  uuid DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_cliente_id  uuid;
  v_pedido_id   uuid;
  v_comissao    numeric;
BEGIN
  -- Valida produto (evita inserção de strings arbitrárias)
  IF p_produto NOT IN (
    'a1', 'a3_sem', 'a3_com',
    'a1_pf', 'a1_pj',
    'a3_pf_sem', 'a3_pj_sem',
    'a3_pf_com', 'a3_pj_com'
  ) THEN
    RAISE EXCEPTION 'produto_invalido: %', p_produto;
  END IF;

  -- Valida preço (evita pedidos com valor zero ou negativo)
  IF p_preco_venda <= 0 THEN
    RAISE EXCEPTION 'preco_invalido';
  END IF;

  -- Valida que o contador_id existe e está ativo (se fornecido)
  -- Referência inválida ou inativa é silenciosamente descartada
  IF p_contador_id IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.contadores
      WHERE id = p_contador_id AND status = 'active'
    ) THEN
      p_contador_id := NULL;
    END IF;
  END IF;

  -- Comissão só existe quando há contador ativo vinculado
  v_comissao := CASE WHEN p_contador_id IS NOT NULL THEN p_comissao ELSE 0 END;

  -- Upsert do cliente por documento (idempotente)
  SELECT id INTO v_cliente_id
  FROM public.clientes
  WHERE document = p_document;

  IF v_cliente_id IS NULL THEN
    INSERT INTO public.clientes (name, document, email, phone)
    VALUES (p_nome, p_document, p_email, p_phone)
    RETURNING id INTO v_cliente_id;
  ELSE
    -- Atualiza dados de contato (pode ter mudado)
    UPDATE public.clientes
    SET name  = p_nome,
        email = p_email,
        phone = p_phone
    WHERE id = v_cliente_id;
  END IF;

  -- Cria o pedido
  INSERT INTO public.pedidos_certificados (
    cliente_id,
    contador_id,
    produto,
    preco_venda,
    comissao,
    status,
    payment_method
  )
  VALUES (
    v_cliente_id,
    p_contador_id,
    p_produto,
    p_preco_venda,
    v_comissao,
    'pending_payment',
    NULL        -- preenchido futuramente pela integração de pagamento
  )
  RETURNING id INTO v_pedido_id;

  RETURN jsonb_build_object(
    'pedido_id',  v_pedido_id,
    'cliente_id', v_cliente_id
  );
END;
$$;

-- Permite que anônimos e autenticados chamem esta função
GRANT EXECUTE ON FUNCTION public.criar_pedido_certificado TO anon;
GRANT EXECUTE ON FUNCTION public.criar_pedido_certificado TO authenticated;

-- ─── PASSO 4: Ativar RLS ─────────────────────────────────────────────────────
-- Nota: NÃO usamos FORCE ROW LEVEL SECURITY para não afetar
-- as funções SECURITY DEFINER dos triggers existentes.

ALTER TABLE public.contadores           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clientes             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assinaturas          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pagamentos           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comissoes            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pedidos_certificados ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.planos               ENABLE ROW LEVEL SECURITY;

-- ─── PASSO 5: Remover políticas antigas (se existirem do schema inicial) ─────
-- Seguro rodar mesmo se não existirem

DROP POLICY IF EXISTS "planos_publicos"                    ON public.planos;
DROP POLICY IF EXISTS "contador_ve_proprios_dados"         ON public.contadores;
DROP POLICY IF EXISTS "contador_ve_proprios_clientes"      ON public.clientes;
DROP POLICY IF EXISTS "contador_ve_proprias_assinaturas"   ON public.assinaturas;
DROP POLICY IF EXISTS "contador_ve_proprias_comissoes"     ON public.comissoes;
DROP POLICY IF EXISTS "contador_ve_proprios_pedidos"       ON public.pedidos_certificados;

-- ─── PASSO 6: Políticas por tabela ───────────────────────────────────────────

-- ── planos ──────────────────────────────────────────────────────────────────
-- Referência pública, leitura aberta para planos ativos

CREATE POLICY "planos__anon_select_ativos"
  ON public.planos
  FOR SELECT
  TO anon, authenticated
  USING (active = true);

CREATE POLICY "planos__admin_all"
  ON public.planos
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ── contadores ───────────────────────────────────────────────────────────────
-- Anônimo: SELECT limitado a ativos (necessário para lookup de referral em /certificados)
-- Contador: lê apenas seu próprio registro
-- Admin: acesso total

CREATE POLICY "contadores__anon_select_ativos"
  ON public.contadores
  FOR SELECT
  TO anon
  USING (status = 'active');

CREATE POLICY "contadores__contador_select_proprio"
  ON public.contadores
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() AND NOT public.is_admin());

CREATE POLICY "contadores__admin_all"
  ON public.contadores
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ── clientes ─────────────────────────────────────────────────────────────────
-- Sem acesso público direto (uso via stored function)
-- Contador: vê clientes que têm pedidos vinculados a ele
--   (via pedidos_certificados — correto pois um cliente pode comprar de vários contadores)
-- Admin: acesso total

CREATE POLICY "clientes__contador_select"
  ON public.clientes
  FOR SELECT
  TO authenticated
  USING (
    NOT public.is_admin()
    AND id IN (
      SELECT cliente_id
      FROM public.pedidos_certificados
      WHERE contador_id = public.my_contador_id()
    )
  );

CREATE POLICY "clientes__admin_all"
  ON public.clientes
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ── assinaturas ──────────────────────────────────────────────────────────────

CREATE POLICY "assinaturas__contador_select"
  ON public.assinaturas
  FOR SELECT
  TO authenticated
  USING (
    contador_id = public.my_contador_id()
    AND NOT public.is_admin()
  );

CREATE POLICY "assinaturas__admin_all"
  ON public.assinaturas
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ── pagamentos ───────────────────────────────────────────────────────────────
-- Contador acessa via join com assinaturas (subquery)

CREATE POLICY "pagamentos__contador_select"
  ON public.pagamentos
  FOR SELECT
  TO authenticated
  USING (
    NOT public.is_admin()
    AND assinatura_id IN (
      SELECT id
      FROM public.assinaturas
      WHERE contador_id = public.my_contador_id()
    )
  );

CREATE POLICY "pagamentos__admin_all"
  ON public.pagamentos
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ── pedidos_certificados ─────────────────────────────────────────────────────

CREATE POLICY "pedidos__contador_select"
  ON public.pedidos_certificados
  FOR SELECT
  TO authenticated
  USING (
    contador_id = public.my_contador_id()
    AND NOT public.is_admin()
  );

CREATE POLICY "pedidos__admin_all"
  ON public.pedidos_certificados
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ── comissoes ────────────────────────────────────────────────────────────────

CREATE POLICY "comissoes__contador_select"
  ON public.comissoes
  FOR SELECT
  TO authenticated
  USING (
    contador_id = public.my_contador_id()
    AND NOT public.is_admin()
  );

CREATE POLICY "comissoes__admin_all"
  ON public.comissoes
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ─── VERIFICAÇÃO FINAL ────────────────────────────────────────────────────────
-- Rode estas queries para confirmar que tudo está correto:

-- 1. Confirmar RLS ativo em todas as tabelas:
-- SELECT tablename, rowsecurity FROM pg_tables
-- WHERE schemaname = 'public'
-- ORDER BY tablename;

-- 2. Listar todas as políticas criadas:
-- SELECT tablename, policyname, cmd, roles
-- FROM pg_policies
-- WHERE schemaname = 'public'
-- ORDER BY tablename, policyname;

-- 3. Confirmar admin com app_metadata:
-- SELECT email, raw_app_meta_data FROM auth.users
-- WHERE raw_app_meta_data ->> 'role' = 'admin';
