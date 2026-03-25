-- ============================================================
-- Tabela de timelines (visualizações salvas)
-- ============================================================

CREATE TABLE public.timelines (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name        TEXT NOT NULL,
  slug        TEXT UNIQUE NOT NULL,
  filters     JSONB NOT NULL DEFAULT '{}',
  is_public   BOOLEAN DEFAULT false,
  owner_email TEXT NOT NULL,
  sort_order  INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.timelines ENABLE ROW LEVEL SECURITY;

-- Usuários autorizados podem ver todas as timelines
CREATE POLICY "Usuarios autorizados podem ler timelines"
  ON public.timelines FOR SELECT
  USING (
    (auth.uid() IS NOT NULL
     AND EXISTS (
       SELECT 1 FROM public.allowed_users
       WHERE email = auth.jwt()->>'email'
     ))
    OR is_public = true
  );

-- Owners podem gerenciar timelines
CREATE POLICY "Owners podem inserir timelines"
  ON public.timelines FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.allowed_users
      WHERE email = auth.jwt()->>'email'
      AND role = 'owner'
    )
  );

CREATE POLICY "Owners podem atualizar timelines"
  ON public.timelines FOR UPDATE
  USING (
    auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.allowed_users
      WHERE email = auth.jwt()->>'email'
      AND role = 'owner'
    )
  );

CREATE POLICY "Owners podem excluir timelines"
  ON public.timelines FOR DELETE
  USING (
    auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.allowed_users
      WHERE email = auth.jwt()->>'email'
      AND role = 'owner'
    )
  );

-- Seed: timeline Ortus (sem filtros = mostra tudo)
INSERT INTO public.timelines (name, slug, filters, is_public, owner_email, sort_order)
VALUES ('Ortus', 'ortus', '{}', false, 'oliveiranadiamuller@gmail.com', 0);
