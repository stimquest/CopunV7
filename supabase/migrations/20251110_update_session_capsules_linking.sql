-- Migration: alignement PlanPedagogiqueV2 / modules environnement / mode Suivi
-- Corrigée pour éviter sc.updated_at et ec.tips inexistants.

-- Objectif:
-- 1) Chaque lien de module (session_capsules) peut être rattaché à une étape précise.
-- 2) Le front peut charger, pour chaque séance:
--      - les modules par étape (session_step_id),
--      - le détail du module environnement (via join),
--    afin que le mode Suivi dans la page séances reflète la même réalité que l'ancien onglet Suivi.

--------------------------------------------------------------------------------
-- 1) Ajout de la colonne de liaison étape -> module sur la table session_capsules
--------------------------------------------------------------------------------

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'session_capsules'
      AND column_name = 'session_step_id'
  ) THEN
    ALTER TABLE public.session_capsules
      ADD COLUMN session_step_id uuid NULL;
  END IF;
END$$;

-- Si tes IDs d'étape sont integer, adapte:
--   ADD COLUMN session_step_id integer NULL;
-- et la FK ci-dessous.

--------------------------------------------------------------------------------
-- 2) FK vers la table des étapes pédagogiques
--------------------------------------------------------------------------------

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'session_capsules_session_step_id_fkey'
  ) THEN
    ALTER TABLE public.session_capsules
      ADD CONSTRAINT session_capsules_session_step_id_fkey
      FOREIGN KEY (session_step_id)
      REFERENCES public.session_structure(id)
      ON DELETE SET NULL;
  END IF;
END$$;

-- Adapte public.session_structure(id) si le nom réel est différent.

--------------------------------------------------------------------------------
-- 3) FK vers la table des modules environnement
--------------------------------------------------------------------------------

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'session_capsules'
      AND column_name = 'capsule_id'
  ) THEN
    ALTER TABLE public.session_capsules
      ADD COLUMN capsule_id uuid NULL;
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'session_capsules_capsule_id_fkey'
  ) THEN
    ALTER TABLE public.session_capsules
      ADD CONSTRAINT session_capsules_capsule_id_fkey
      FOREIGN KEY (capsule_id)
      REFERENCES public.environment_capsules(id)
      ON DELETE CASCADE;
  END IF;
END$$;

--------------------------------------------------------------------------------
-- 4) Index pour les performances
--------------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_session_capsules_session_step
  ON public.session_capsules (session_step_id);

CREATE INDEX IF NOT EXISTS idx_session_capsules_capsule
  ON public.session_capsules (capsule_id);

--------------------------------------------------------------------------------
-- 5) Vue helper pour getSessionCapsules (sans sc.updated_at ni ec.tips)
--------------------------------------------------------------------------------

CREATE OR REPLACE VIEW public.v_session_capsules_with_capsule AS
SELECT
  sc.id,
  sc.session_id,
  sc.session_step_id,
  sc.capsule_id,
  ec.title            AS capsule_title,
  ec.description      AS capsule_description,
  ec.duration_minutes AS capsule_duration_minutes,
  ec.themes           AS capsule_themes
FROM public.session_capsules sc
LEFT JOIN public.environment_capsules ec
  ON ec.id = sc.capsule_id;

-- Remarques:
-- - Pas de référence à sc.updated_at (colonne absente chez toi).
-- - Pas de référence à ec.tips (colonne absente chez toi).
-- - La vue fournit:
--     - les liens (session_id, session_step_id, capsule_id)
--     - et le détail essentiel du module (title, description, duration_minutes, themes).

--------------------------------------------------------------------------------
-- 6) Intégration côté backend attendue par plan-pedagogique-v2.tsx
--------------------------------------------------------------------------------

-- a) addCapsuleToSession(sessionId, capsuleId, stepId, order)
--    Doit insérer dans public.session_capsules:
--      session_id      = sessionId
--      capsule_id      = capsuleId
--      session_step_id = stepId
--      (optionnel: champ d'ordre si tu en utilises un)

-- b) getSessionCapsules(sessionId)
--    Peut lire depuis la vue:
--      SELECT *
--      FROM public.v_session_capsules_with_capsule
--      WHERE session_id = :sessionId;
--
--    Puis mapper chaque ligne vers un objet exploitable par le front, par ex.:
--      {
--        id,
--        session_id,
--        session_step_id,
--        capsule_id,
--        capsule: {
--          title: capsule_title,
--          description: capsule_description,
--          duration_minutes: capsule_duration_minutes,
--          themes: capsule_themes
--        }
--      }
--
--    Dans [`plan-pedagogique-v2.tsx`](src/components/plan-pedagogique-v2.tsx), StepItem utilise:
--      const capsule = (m as any).capsule || (m as any);
--    donc ce mapping permet:
--      - d'afficher correctement le résumé,
--      - d'afficher le détail en mode "Voir le détail".

-- c) Avec cette migration appliquée et actions-capsules ajustées:
--    - Le mode Construction (séances) attache les modules aux étapes de façon structurée.
--    - Le mode Suivi dans la page séances exploite les mêmes données réelles que l’onglet Suivi.
--    - Tu obtiens la cohérence demandée et peux progressivement retirer l’ancien onglet.
