# 🔐 Configuration Supabase pour Netlify

## 🎯 Étapes obligatoires

### 1. **Variables d'environnement Netlify**
Dans votre dashboard Netlify → Site settings → Environment variables :

```bash
NEXT_PUBLIC_SUPABASE_URL=https://epdfbjkeyagtjubethmh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVwZGZiamtleWFndGp1YmV0aG1oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5MzQzNjQsImV4cCI6MjA2ODUxMDM2NH0.svIeOxWSeFfOt06iuUYu0wnT4RasUmFDJ3zZ4dXV3YA
NEXT_PUBLIC_MAPTILER_KEY=2Mdv6V74aBmT7EQlIeqj
GEMINI_API_KEY=AIzaSyDbMl53CuS1s1kZIKXUumORpmzquIN2_eA
NODE_ENV=production
```

### 2. **Configuration Supabase Dashboard**

#### A. Site URL
1. Allez sur https://supabase.com/dashboard
2. Sélectionnez votre projet `epdfbjkeyagtjubethmh`
3. **Settings** → **API**
4. **Site URL** : Remplacez par votre URL Netlify
   ```
   https://votre-site.netlify.app
   ```

#### B. Redirect URLs
Dans **Authentication** → **URL Configuration** :
```
https://votre-site.netlify.app
https://votre-site.netlify.app/**
```

#### C. CORS Origins
Dans **Settings** → **API** → **CORS Origins** :
```
https://votre-site.netlify.app
```

### 3. **Sécurité RLS (Row Level Security)**

Vérifiez que vos tables ont les bonnes politiques :

```sql
-- Exemple pour la table stages
CREATE POLICY "Allow public read" ON stages FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert" ON stages FOR INSERT WITH CHECK (auth.role() = 'authenticated');
```

## 🚨 Points d'attention

### Variables publiques
Les variables `NEXT_PUBLIC_*` sont visibles côté client. C'est normal pour :
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_MAPTILER_KEY`

### Variables privées
Gardez privées :
- `GEMINI_API_KEY` (pas de NEXT_PUBLIC_)

## ✅ Test de connexion

Après déploiement, testez :
1. Ouvrez la console du navigateur
2. Vérifiez qu'il n'y a pas d'erreurs CORS
3. Testez une requête Supabase

## 🔧 Debug

### Erreur CORS
- Vérifiez les URLs dans Supabase
- Redéployez après modification

### Variables non trouvées
- Vérifiez l'orthographe exacte
- Redéployez après ajout de variables

### Erreur 401/403
- Vérifiez les politiques RLS
- Vérifiez la clé ANON
