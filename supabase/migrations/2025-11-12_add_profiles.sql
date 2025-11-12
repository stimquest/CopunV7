-- Migration: 2025-11-12_add_profiles.sql
-- Création d'une table `profiles` pour associer username <-> email <-> auth uid
-- Inclut RLS (Row Level Security) et policies pour que chaque utilisateur puisse lire/mettre à jour son propre profil.

BEGIN;

-- 1) Table profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id text PRIMARY KEY,                     -- doit contenir l'UID Supabase (auth.uid)
  username text NOT NULL,                  -- pseudo choisi (unique)
  email text NOT NULL,                     -- email associé (pour la récupération de mot de passe)
  display_name text,                       -- nom affiché
  metadata jsonb,                          -- objet libre pour données additionnelles
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Index pour rendre la recherche username insensible à la casse et unique
CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_lower_idx ON public.profiles (lower(username));

-- 2) Activer Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3) Policies
DROP POLICY IF EXISTS "Profiles - allow insert for owner" ON public.profiles;
CREATE POLICY "Profiles - allow insert for owner" ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid()::text = id);

DROP POLICY IF EXISTS "Profiles - allow select for owner" ON public.profiles;
CREATE POLICY "Profiles - allow select for owner" ON public.profiles
  FOR SELECT
  USING (auth.uid()::text = id);

DROP POLICY IF EXISTS "Profiles - allow update for owner" ON public.profiles;
CREATE POLICY "Profiles - allow update for owner" ON public.profiles
  FOR UPDATE
  USING (auth.uid()::text = id)
  WITH CHECK (auth.uid()::text = id);

DROP POLICY IF EXISTS "Profiles - allow delete for owner" ON public.profiles;
CREATE POLICY "Profiles - allow delete for owner" ON public.profiles
  FOR DELETE
  USING (auth.uid()::text = id);

-- 4) Exemple d'INSERT (à exécuter avec une clé de service ou via l'interface SQL en remplaçant <AUTH_UID>)
-- Remplacez <AUTH_UID> par l'uid réel retourné par Supabase Auth pour l'utilisateur, puis exécutez.

-- INSERT INTO public.profiles (id, username, email, display_name)
-- VALUES ('<AUTH_UID>', 'mon_pseudo', 'user@example.com', 'Prénom Nom');

COMMIT;

-- Notes:
-- - Les inserts/updates effectués via la clé service_role (admin) échappent aux policies RLS.
-- - Pour permettre des recherches publiques de mapping pseudo->email, il est préférable
--   d'exposer un endpoint serveur (avec la clé service role) plutôt que d'autoriser
--   des sélections publiques côté client, pour des raisons de confidentialité.
-- - Après application, vous pouvez ajouter/mettre à jour les enregistrements `profiles`
--   pour tous les utilisateurs existants afin d'assurer le mapping pseudo→email.
