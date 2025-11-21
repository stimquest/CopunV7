# Comment appliquer la migration session_step_completion

## Option 1 : Via l'interface Supabase (Recommandé)

1. Aller sur https://supabase.com/dashboard
2. Sélectionner votre projet
3. Aller dans **SQL Editor** (dans le menu de gauche)
4. Cliquer sur **New Query**
5. Copier-coller le contenu du fichier `20250110_create_session_step_completion.sql`
6. Cliquer sur **Run** (ou Ctrl+Enter)

## Option 2 : Via Supabase CLI

Si vous avez configuré Supabase CLI et lié votre projet :

```bash
npx supabase db push
```

## Option 3 : Manuellement via psql

Si vous avez accès direct à PostgreSQL :

```bash
psql -h <your-supabase-host> -U postgres -d postgres -f supabase/migrations/20250110_create_session_step_completion.sql
```

## Vérification

Pour vérifier que la migration a été appliquée avec succès, exécutez cette requête dans SQL Editor :

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'session_step_completion';
```

Vous devriez voir une ligne avec `session_step_completion`.

## Rollback (si nécessaire)

Si vous devez annuler la migration :

```sql
DROP TABLE IF EXISTS public.session_step_completion CASCADE;
```

⚠️ **Attention** : Cela supprimera toutes les données de complétion des étapes !

