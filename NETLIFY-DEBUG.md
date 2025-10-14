# 🔍 Debug Netlify - Cop'un de la mer

## ✅ Corrections appliquées

### 1. **next-pwa déplacé vers dependencies**
- ✅ Était dans devDependencies
- ✅ Maintenant dans dependencies

### 2. **Configuration Webpack ajoutée**
- ✅ Extension alias pour résolution des modules
- ✅ Support TypeScript/JavaScript

### 3. **Script de build nettoyé**
- ✅ `build:netlify` supprime le cache .next
- ✅ Utilise `rimraf` (cross-platform)

### 4. **Configuration Netlify optimisée**
- ✅ Plugin Next.js officiel
- ✅ Node 18
- ✅ NPM flags pour legacy peer deps

### 5. **Fichier .npmrc ajouté**
- ✅ legacy-peer-deps=true
- ✅ engine-strict=false

## 🚀 Commandes de déploiement

```bash
# Commit et push
git add .
git commit -m "Fix Netlify build - Module resolution and clean build"
git push origin main
```

## 🔧 Sur Netlify Dashboard

### Clear cache and retry deploy
1. Allez sur **Deploys**
2. Cliquez sur **Trigger deploy** → **Clear cache and deploy site**

### Variables d'environnement
Vérifiez que toutes les variables sont présentes :
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
NEXT_PUBLIC_MAPTILER_KEY
GEMINI_API_KEY
NODE_ENV=production
```

## 🐛 Si le problème persiste

### Option 1 : Build local test
```bash
npm run build:netlify
```

### Option 2 : Vérifier les fichiers
```bash
git ls-files | grep -E "card-editor|actions.ts|use-toast"
```

### Option 3 : Netlify Build Logs
Cherchez dans les logs :
- "Module not found" → Problème de résolution
- "Cannot find module" → Problème d'installation
- "Failed to compile" → Erreur TypeScript/Webpack

## 📋 Checklist

- [x] next-pwa dans dependencies
- [x] Webpack config ajoutée
- [x] Script build:netlify créé
- [x] .npmrc configuré
- [x] netlify.toml optimisé
- [ ] Variables d'environnement sur Netlify
- [ ] Clear cache sur Netlify
- [ ] Redéploiement

## 🎯 Fichiers modifiés

- `package.json` - next-pwa déplacé, script build:netlify
- `next.config.ts` - Webpack extensionAlias
- `netlify.toml` - Command build:netlify, NPM_FLAGS
- `.npmrc` - Nouveau fichier
- `NETLIFY-DEBUG.md` - Ce fichier
