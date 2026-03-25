-- Tabela de tarefas
CREATE TABLE public.tasks (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_name  TEXT NOT NULL,
  name        TEXT NOT NULL,
  due_date    DATE NOT NULL,
  status      TEXT NOT NULL CHECK (status IN ('done', 'progress', 'pending')),
  sort_order  INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Seed: 16 tarefas iniciais
INSERT INTO public.tasks (group_name, name, due_date, status, sort_order) VALUES
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
  ('MOSIMANN',    'Evento lancamento',       '2026-06-23', 'pending', 16);
