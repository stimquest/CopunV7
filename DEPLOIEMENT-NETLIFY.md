# 🚀 Déploiement Netlify - Guide Simple

## ✅ Configuration actuelle

### Fichiers configurés :
- ✅ `netlify.toml` - Configuration minimale avec plugin Next.js
- ✅ `package.json` - `next-pwa` dans dependencies
- ✅ `next.config.ts` - Configuration PWA
- ✅ `tsconfig.json` - Paths alias (@/*)
- ✅ `jsconfig.json` - Paths alias pour webpack
- ✅ `.nvmrc` - Version Node 18
- ✅ `public/_headers` - Headers pour cache PWA
- ✅ `public/manifest.json` - Manifest PWA
- ✅ `public/offline.html` - Page offline

## 📋 Étapes de déploiement

### 1. Commit et push
```bash
git add .
git commit -m "Clean Netlify configuration for PWA deployment"
git push origin main
```

### 2. Sur Netlify Dashboard

#### A. Clear cache ET Clear build cache (TRÈS IMPORTANT)
1. Allez sur **Site settings** → **Build & deploy** → **Build settings**
2. Cliquez sur **Clear build cache**
3. Ensuite, allez sur **Deploys**
4. Cliquez sur **Trigger deploy**
5. Sélectionnez **Clear cache and deploy site**

**POURQUOI ?** Netlify garde un cache de node_modules qui peut causer des problèmes de résolution de modules.

#### B. Variables d'environnement
1. Allez sur **Site settings** → **Environment variables**
2. Ajoutez ces 5 variables :

```
NEXT_PUBLIC_SUPABASE_URL
Valeur: https://epdfbjkeyagtjubethmh.supabase.co

NEXT_PUBLIC_SUPABASE_ANON_KEY
Valeur: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVwZGZiamtleWFndGp1YmV0aG1oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5MzQzNjQsImV4cCI6MjA2ODUxMDM2NH0.svIeOxWSeFfOt06iuUYu0wnT4RasUmFDJ3zZ4dXV3YA

NEXT_PUBLIC_MAPTILER_KEY
Valeur: 2Mdv6V74aBmT7EQlIeqj

GEMINI_API_KEY
Valeur: AIzaSyDbMl53CuS1s1kZIKXUumORpmzquIN2_eA

NODE_ENV
Valeur: production
```

### 3. Sur Supabase Dashboard

1. Allez sur **Settings** → **API**
2. Dans **Site URL**, ajoutez votre URL Netlify (ex: `https://copunmer.netlify.app`)
3. Dans **Authentication** → **URL Configuration** → **Redirect URLs**, ajoutez :
   - `https://copunmer.netlify.app/*`
   - `https://copunmer.netlify.app/auth/callback`

## 🎯 Résultat attendu

Après le déploiement, votre PWA devrait :
- ✅ Se charger correctement
- ✅ Avoir tous les CSS
- ✅ Se connecter à Supabase
- ✅ Être installable (PWA)
- ✅ Fonctionner offline

## 🐛 Si problème

### Erreur "Module not found"
→ Vérifiez que `next-pwa` est bien dans `dependencies` (pas devDependencies)

### Erreur "Stylesheet URLs"
→ Faites un **Clear cache and deploy**

### Erreur Supabase
→ Vérifiez les variables d'environnement et l'URL dans Supabase

## 📝 Configuration finale

**netlify.toml** :
```toml
[build]
  command = "npm run build"

[[plugins]]
  package = "@netlify/plugin-nextjs"

[build.environment]
  NODE_VERSION = "18"
```

**C'est tout !** Configuration simple et propre. 🎉

