# 🚀 Déploiement Netlify - Cop'un de la mer

## 📋 Variables d'environnement à configurer

### Sur Netlify Dashboard :
1. Allez sur **Site settings** → **Environment variables**
2. Ajoutez ces variables :

```bash
# 🔑 SUPABASE (OBLIGATOIRES)
NEXT_PUBLIC_SUPABASE_URL=https://epdfbjkeyagtjubethmh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVwZGZiamtleWFndGp1YmV0aG1oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5MzQzNjQsImV4cCI6MjA2ODUxMDM2NH0.svIeOxWSeFfOt06iuUYu0wnT4RasUmFDJ3zZ4dXV3YA

# 🗺️ MAPTILER (pour les cartes)
NEXT_PUBLIC_MAPTILER_KEY=2Mdv6V74aBmT7EQlIeqj

# 🤖 GOOGLE AI (optionnel)
GEMINI_API_KEY=AIzaSyDbMl53CuS1s1kZIKXUumORpmzquIN2_eA

# ⚙️ PRODUCTION
NODE_ENV=production
```

## 🔧 Configuration Supabase

### Autoriser le domaine Netlify :
1. Allez sur **Supabase Dashboard**
2. **Settings** → **API**
3. **Site URL** : Ajoutez votre URL Netlify
4. **Redirect URLs** : Ajoutez votre URL Netlify

## 🌐 Commandes de déploiement

### Déploiement automatique :
```bash
git add .
git commit -m "Deploy to Netlify with PWA offline support"
git push origin main
```

### Build local pour test :
```bash
npm run build
npm start
```

## ✅ Vérifications post-déploiement

1. **PWA** : Testez l'installation sur mobile
2. **Offline** : Coupez la connexion et vérifiez
3. **Supabase** : Testez la connexion aux données
4. **Service Worker** : Vérifiez dans DevTools

## 🔍 Debug en cas de problème

### Variables manquantes :
- Vérifiez dans Netlify **Site settings** → **Environment variables**
- Redéployez après ajout de variables

### Erreurs Supabase :
- Vérifiez les URLs autorisées dans Supabase
- Testez les clés API

### PWA ne fonctionne pas :
- Vérifiez que le site est en HTTPS
- Testez le service worker dans DevTools
