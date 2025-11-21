-- Lien simple entre une étape de séance et une ou plusieurs fiches PedagogicalContent
-- Hypothèses:
-- - Table session_structure existe (id PK)
-- - Table pedagogical_content existe (id PK)

create table if not exists public.session_step_pedagogical_links (
  id bigserial primary key,
  session_step_id bigint not null references public.session_structure(id) on delete cascade,
  pedagogical_content_id bigint not null references public.pedagogical_content(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (session_step_id, pedagogical_content_id)
);

-- Index pour accès rapide par étape
create index if not exists idx_step_links_by_step
  on public.session_step_pedagogical_links (session_step_id);

-- Index pour accès rapide par contenu
create index if not exists idx_step_links_by_pedagogical
  on public.session_step_pedagogical_links (pedagogical_content_id);