-- ============================================================
-- ORTUS: Setup completo — cole tudo no SQL Editor do Supabase
-- ============================================================

-- 1. Tabela de projetos
CREATE TABLE public.projects (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name        TEXT NOT NULL,
  slug        TEXT UNIQUE NOT NULL,
  owner_email TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- 2. Tabela de tarefas
CREATE TABLE public.tasks (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id  UUID NOT NULL REFERENCES public.projects(id),
  group_name  TEXT NOT NULL,
  name        TEXT NOT NULL,
  due_date    DATE NOT NULL,
  return_date DATE,
  status      TEXT NOT NULL CHECK (status IN ('done', 'progress', 'pending')),
  sort_order  INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- 3. Tabela de usuarios autorizados
CREATE TABLE public.allowed_users (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email      TEXT UNIQUE NOT NULL,
  role       TEXT DEFAULT 'viewer' CHECK (role IN ('owner', 'viewer')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Tabela de timelines (visualizacoes salvas)
CREATE TABLE public.timelines (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id  UUID NOT NULL REFERENCES public.projects(id),
  name        TEXT NOT NULL,
  slug        TEXT UNIQUE NOT NULL,
  filters     JSONB NOT NULL DEFAULT '{}',
  is_public   BOOLEAN DEFAULT false,
  owner_email TEXT NOT NULL,
  sort_order  INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- 5. Habilitar RLS
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.allowed_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timelines ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- RLS Policies para projects
-- ============================================================

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
-- RLS Policies para tasks
-- ============================================================

CREATE POLICY "Usuarios autorizados podem ler tasks"
  ON public.tasks FOR SELECT
  USING (
    auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.allowed_users
      WHERE email = auth.jwt()->>'email'
    )
  );

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

CREATE POLICY "Usuarios podem ver proprio acesso"
  ON public.allowed_users FOR SELECT
  USING (
    auth.uid() IS NOT NULL
    AND email = auth.jwt()->>'email'
  );

-- ============================================================
-- RLS Policies para timelines
-- ============================================================

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

-- ============================================================
-- Seed data
-- ============================================================

-- IMPORTANTE: Insira seu email Google aqui!
-- INSERT INTO public.allowed_users (email, role) VALUES ('seu.email@gmail.com', 'owner');

-- Projeto Alicerce
INSERT INTO public.projects (name, slug, owner_email)
VALUES ('Alicerce', 'alicerce', 'oliveiranadiamuller@gmail.com');

-- Tarefas (vinculadas ao projeto Alicerce)
INSERT INTO public.tasks (project_id, group_name, name, due_date, status, sort_order)
SELECT p.id, v.group_name, v.name, v.due_date::date, v.status, v.sort_order
FROM public.projects p,
(VALUES
  ('REFRAMME',    'Imagens 3D - L01 P1',    '2026-03-04', 'done',     1),
  ('REFRAMME',    'Imagens 3D - L02 P0',    '2026-03-04', 'done',     2),
  ('REFRAMME',    'Imagens 3D - L01 P2',    '2026-03-23', 'progress', 3),
  ('MOSIMANN',    'Welcome kit',             '2026-03-23', 'progress', 4),
  ('REFRAMME',    'Imagens 3D - L02 P1',    '2026-03-30', 'progress', 5),
  ('MOSIMANN',    'Redes sociais #1',        '2026-04-09', 'pending',  6),
  ('REFRAMME',    'Imagens 3D - L02 P2',    '2026-04-16', 'pending',  7),
  ('MOSIMANN',    'Folder combate',          '2026-04-24', 'pending',  8),
  ('MOSIMANN',    'Apresentacao final',      '2026-05-11', 'pending',  9),
  ('MOSIMANN',    'Tapume final',            '2026-05-14', 'pending', 10),
  ('MOSIMANN',    'Redes sociais #2',        '2026-05-14', 'pending', 11),
  ('MOSIMANN',    'Redes sociais animadas',  '2026-05-20', 'pending', 12),
  ('MOSIMANN',    'Catalogo',                '2026-05-22', 'pending', 13),
  ('MOSIMANN',    'Midia externa',           '2026-05-26', 'pending', 14),
  ('3 ELEMENTOS', 'Maquete',                 '2026-06-02', 'pending', 15),
  ('MOSIMANN',    'Evento lancamento',       '2026-06-23', 'pending', 16)
) AS v(group_name, name, due_date, status, sort_order)
WHERE p.slug = 'alicerce';

-- Timeline Ortus (vinculada ao projeto Alicerce)
INSERT INTO public.timelines (project_id, name, slug, filters, is_public, owner_email, sort_order)
SELECT p.id, 'Ortus', 'ortus', '{}', false, 'oliveiranadiamuller@gmail.com', 0
FROM public.projects p
WHERE p.slug = 'alicerce';
