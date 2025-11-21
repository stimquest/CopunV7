-- Migration: création de la table de liens Étape ↔ Défis
-- Alignée avec le code:
-- - setStepDefis(stepId, defiIds) dans [`src/app/actions-sessions.ts`](src/app/actions-sessions.ts:231)
-- - SessionStructureManager dans [`src/components/session-structure-manager.tsx`](src/components/session-structure-manager.tsx:122)
--
-- Hypothèses:
-- - public.session_structure(id) existe et contient les étapes de séance.
-- - Les IDs de défis utilisés dans allDefis sont des identifiants stables (string ou équivalent),
--   par exemple "defi_littoral_1". On les stocke en TEXT.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'session_step_defis_links'
  ) THEN
    CREATE TABLE public.session_step_defis_links (
      id bigserial PRIMARY KEY,
      session_step_id bigint NOT NULL REFERENCES public.session_structure(id) ON DELETE CASCADE,
      defi_id text NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now(),
      UNIQUE (session_step_id, defi_id)
    );
  END IF;
END$$;

-- Index pour accès rapide par étape
CREATE INDEX IF NOT EXISTS idx_step_defis_links_by_step
  ON public.session_step_defis_links (session_step_id);

-- Index pour accès rapide par défi
CREATE INDEX IF NOT EXISTS idx_step_defis_links_by_defi
  ON public.session_step_defis_links (defi_id);