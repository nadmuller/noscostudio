-- Tabela de usuarios autorizados
CREATE TABLE public.allowed_users (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email      TEXT UNIQUE NOT NULL,
  role       TEXT DEFAULT 'viewer' CHECK (role IN ('owner', 'viewer')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.allowed_users ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- RLS Policies para tasks
-- ============================================================

-- Leitura: usuarios autenticados cujo email esta em allowed_users
CREATE POLICY "Usuarios autorizados podem ler tasks"
  ON public.tasks FOR SELECT
  USING (
    auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.allowed_users
      WHERE email = auth.jwt()->>'email'
    )
  );

-- Insercao: somente owners
CREATE POLICY "Owners podem inserir tasks"
  ON public.tasks FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.allowed_users
      WHERE email = auth.jwt()->>'email'
      AND role = 'owner'
    )
  );

-- Atualizacao: somente owners
CREATE POLICY "Owners podem atualizar tasks"
  ON public.tasks FOR UPDATE
  USING (
    auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.allowed_users
      WHERE email = auth.jwt()->>'email'
      AND role = 'owner'
    )
  );

-- Exclusao: somente owners
CREATE POLICY "Owners podem excluir tasks"
  ON public.tasks FOR DELETE
  USING (
    auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.allowed_users
      WHERE email = auth.jwt()->>'email'
      AND role = 'owner'
    )
  );

-- ============================================================
-- RLS Policies para allowed_users
-- ============================================================

-- Usuarios so podem ver seu proprio registro
CREATE POLICY "Usuarios podem ver proprio acesso"
  ON public.allowed_users FOR SELECT
  USING (
    auth.uid() IS NOT NULL
    AND email = auth.jwt()->>'email'
  );

-- ============================================================
-- IMPORTANTE: Insira seu email aqui!
-- Troque 'SEU_EMAIL@gmail.com' pelo seu email real do Google
-- ============================================================
-- INSERT INTO public.allowed_users (email, role) VALUES
--   ('SEU_EMAIL@gmail.com', 'owner');
