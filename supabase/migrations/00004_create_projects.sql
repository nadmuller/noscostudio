-- ============================================================
-- Tabela de projetos
-- ============================================================

CREATE TABLE public.projects (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name        TEXT NOT NULL,
  slug        TEXT UNIQUE NOT NULL,
  owner_email TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- RLS: mesmas politicas das outras tabelas
CREATE POLICY "Usuarios autorizados podem ler projects"
  ON public.projects FOR SELECT
  USING (
    auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.allowed_users
      WHERE email = auth.jwt()->>'email'
    )
  );

CREATE POLICY "Owners podem inserir projects"
  ON public.projects FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.allowed_users
      WHERE email = auth.jwt()->>'email'
      AND role = 'owner'
    )
  );

CREATE POLICY "Owners podem atualizar projects"
  ON public.projects FOR UPDATE
  USING (
    auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.allowed_users
      WHERE email = auth.jwt()->>'email'
      AND role = 'owner'
    )
  );

CREATE POLICY "Owners podem excluir projects"
  ON public.projects FOR DELETE
  USING (
    auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.allowed_users
      WHERE email = auth.jwt()->>'email'
      AND role = 'owner'
    )
  );

-- ============================================================
-- Seed: projeto Alicerce
-- ============================================================

INSERT INTO public.projects (name, slug, owner_email)
VALUES ('Alicerce', 'alicerce', 'oliveiranadiamuller@gmail.com');

-- ============================================================
-- Adicionar project_id em tasks e timelines
-- ============================================================

-- Passo 1: adicionar coluna nullable
ALTER TABLE public.tasks ADD COLUMN project_id UUID REFERENCES public.projects(id);
ALTER TABLE public.timelines ADD COLUMN project_id UUID REFERENCES public.projects(id);

-- Passo 2: vincular todos os registros existentes ao projeto Alicerce
UPDATE public.tasks
SET project_id = (SELECT id FROM public.projects WHERE slug = 'alicerce');

UPDATE public.timelines
SET project_id = (SELECT id FROM public.projects WHERE slug = 'alicerce');

-- Passo 3: tornar NOT NULL agora que todos tem valor
ALTER TABLE public.tasks ALTER COLUMN project_id SET NOT NULL;
ALTER TABLE public.timelines ALTER COLUMN project_id SET NOT NULL;
