# 📋 Instructions pour appliquer la migration V8

## ⚠️ Situation actuelle

**Erreur rencontrée** : `ERROR: 42703: column "created_by" does not exist`

**Cause** : La migration SQL avait des RLS policies qui référençaient une colonne `created_by` qui n'existe pas dans la table `stages`.

**Solution** : ✅ **Corrigée !** La migration a été mise à jour pour utiliser des RLS policies publiques (comme les autres tables).

---

## 🚀 Étapes pour appliquer la migration

### Option 1 : Via Supabase Studio (Recommandé - 2 minutes)

1. **Ouvrir Supabase Studio**
   - Allez sur https://app.supabase.com
   - Connectez-vous à votre projet
   - Cliquez sur "SQL Editor" dans le menu de gauche

2. **Créer une nouvelle requête**
   - Cliquez sur "New Query"
   - Donnez-lui un nom : "V8 Migration - Sessions and Capsules"

3. **Copier le SQL**
   - Ouvrez le fichier : `MIGRATION_V8_SQL.sql` (à la racine du projet)
   - Copiez **tout** le contenu (Ctrl+A, Ctrl+C)

4. **Exécuter la migration**
   - Collez le SQL dans l'éditeur Supabase (Ctrl+V)
   - Cliquez sur "Run" (ou Ctrl+Enter)
   - ⏳ Attendez que la migration se termine (quelques secondes)
   - ✅ Vous devriez voir "Query executed successfully"

5. **Vérifier le succès**
   - Allez dans "Table Editor" (menu de gauche)
   - Vous devriez voir les 5 nouvelles tables :
     - ✅ `sessions`
     - ✅ `session_structure`
     - ✅ `environment_capsules`
     - ✅ `capsule_content`
     - ✅ `session_capsules`

### Option 2 : Via Supabase CLI (Avancé)

```bash
# 1. Lier le projet Supabase
supabase link --project-ref epdfbjkeyagtjubethmh

# 2. Pousser les migrations
supabase db push

# 3. Vérifier le statut
supabase migration list
```

---

## ✅ Vérification après application

Après avoir appliqué la migration, exécutez le test :

```bash
node test-v8-tables.js
```

Vous devriez voir :
```
🔍 Test des tables V8 Supabase...

Testing table: sessions...
✅ sessions: Table exists!
Testing table: session_structure...
✅ session_structure: Table exists!
Testing table: environment_capsules...
✅ environment_capsules: Table exists!
Testing table: capsule_content...
✅ capsule_content: Table exists!
Testing table: session_capsules...
✅ session_capsules: Table exists!

✅ Test terminé !
```

---

## 📝 Contenu de la migration

### Tables créées
- `sessions` - Séances d'un stage
- `session_structure` - Étapes sportives
- `environment_capsules` - Capsules réutilisables
- `capsule_content` - Contenu des capsules
- `session_capsules` - Liaison séances ↔ capsules

### Colonnes ajoutées à `stages`
- `sport_activity` - Type d'activité sportive
- `sport_level` - Niveau sportif
- `sport_description` - Description de l'activité

### Colonnes ajoutées à `stages_exploits`
- `session_id` - Lien vers une séance

### Sécurité
- ✅ Row Level Security (RLS) activé sur toutes les tables
- ✅ Politiques RLS publiques (accès pour tous, comme les autres tables)
- ✅ Indexes créés pour optimiser les requêtes

---

## 🔗 Fichiers importants

- **SQL à copier** : `MIGRATION_V8_SQL.sql`
- **Migration source** : `supabase/migrations/20250108_add_sessions_and_capsules.sql`
- **Test des tables** : `test-v8-tables.js`
- **Documentation V8** : `Docs/EvolutionV8_statsEtFichesSeances.md`

---

## ⚡ Prochaines étapes

Une fois la migration appliquée :

1. ✅ Exécuter `node test-v8-tables.js` pour vérifier
2. ✅ Relancer le serveur : `npm run dev`
3. ✅ Tester la page `/capsules`
4. ✅ Créer une capsule de test
5. ✅ Vérifier que tout fonctionne

---

## 🆘 Dépannage

### Erreur : "relation does not exist"
→ La migration n'a pas été appliquée. Suivez les étapes ci-dessus.

### Erreur : "permission denied"
→ Vérifiez que vous êtes connecté avec un compte ayant les droits d'admin.

### Erreur : "syntax error"
→ Vérifiez que vous avez copié tout le SQL correctement (utilisez `MIGRATION_V8_SQL.sql`).

### Erreur : "column already exists"
→ La migration a déjà été appliquée. C'est normal ! Vous pouvez continuer.

---

**Status** : ✅ Migration corrigée et prête à être appliquée
**Date** : 2025-01-08
**Temps estimé** : 2-3 minutes

