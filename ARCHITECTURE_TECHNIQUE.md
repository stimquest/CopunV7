# 🏗️ Architecture Technique - Cop'un de la Mer

## 1. Vue d'ensemble de l'architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT (PWA)                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Next.js 15.3.3 (React 19)                            │   │
│  │ - Server Components & Server Actions                 │   │
│  │ - App Router (Dynamic Routes)                        │   │
│  │ - Image Optimization                                 │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Service Worker (Workbox)                             │   │
│  │ - Offline support (24h cache)                        │   │
│  │ - Background sync                                    │   │
│  │ - Push notifications ready                           │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Local Storage / IndexedDB                            │   │
│  │ - User preferences                                   │   │
│  │ - Offline data cache                                 │   │
│  │ - Session management                                 │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                           ↓ HTTPS
┌─────────────────────────────────────────────────────────────┐
│                    API GATEWAY                               │
│  Netlify Edge Functions (CDN)                               │
│  - CORS handling                                            │
│  - Rate limiting                                            │
│  - Request logging                                          │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                  SUPABASE BACKEND                            │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Authentication                                       │   │
│  │ - Email/Password                                     │   │
│  │ - JWT tokens                                         │   │
│  │ - Session management                                │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ PostgreSQL Database                                  │   │
│  │ - 10+ tables                                         │   │
│  │ - Row Level Security (RLS)                          │   │
│  │ - Real-time subscriptions                           │   │
│  │ - Full-text search                                  │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Storage (S3-compatible)                              │   │
│  │ - Images                                             │   │
│  │ - Documents                                          │   │
│  │ - Exports                                            │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Stack Technologique Détaillé

### Frontend
```
Next.js 15.3.3
├─ React 19 (Server Components)
├─ TypeScript 5.x
├─ Tailwind CSS 3.x
├─ Shadcn/ui (Component library)
├─ React Hook Form (Form management)
├─ Zod (Schema validation)
├─ Lucide React (Icons)
├─ next-pwa (PWA support)
└─ Workbox (Service Worker)
```

### Backend
```
Supabase
├─ PostgreSQL 15
├─ PostgREST (Auto-generated API)
├─ GoTrue (Authentication)
├─ Realtime (WebSocket subscriptions)
├─ Storage (S3-compatible)
└─ Vector (pgvector for embeddings)
```

### Déploiement
```
Netlify
├─ Continuous Deployment (Git-based)
├─ Edge Functions
├─ Analytics
└─ Form handling
```

---

## 3. Structure des Fichiers

```
src/
├─ app/                          # Next.js App Router
│  ├─ page.tsx                   # Accueil
│  ├─ stages/                    # Gestion des stages
│  │  ├─ page.tsx               # Liste des stages
│  │  └─ [stageId]/              # Détail du stage
│  ├─ admin/                     # Espace administrateur
│  │  ├─ contenu/               # Gestion du contenu
│  │  └─ game-cards/            # Éditeur de cartes
│  ├─ jeux/                      # Générateur de jeux
│  ├─ observations/              # Journal des observations
│  ├─ profil/                    # Profil utilisateur
│  ├─ classement/                # Classements
│  ├─ api/                       # API routes
│  └─ actions.ts                 # Server Actions
├─ components/                   # Composants React
│  ├─ ui/                        # Shadcn/ui components
│  ├─ admin/                     # Composants admin
│  └─ [autres]/                  # Composants métier
├─ lib/                          # Utilitaires
│  ├─ supabase.ts               # Client Supabase
│  ├─ types.ts                  # Types TypeScript
│  ├─ utils.ts                  # Fonctions utilitaires
│  └─ offline-cache.ts          # Gestion du cache offline
├─ hooks/                        # React Hooks
│  ├─ use-online-status.ts      # Détection online/offline
│  └─ [autres]/
├─ data/                         # Données statiques
│  ├─ etages.tsx                # Thèmes et piliers
│  └─ defis.tsx                 # Défis
└─ ai/                           # Intégrations IA (futur)
```

---

## 4. Modèle de Données

### Tables principales

**stages**
```sql
id BIGINT PRIMARY KEY
title TEXT
type TEXT (Hebdomadaire, Journée, Libre)
participants INTEGER
start_date DATE
end_date DATE
created_at TIMESTAMP
```

**pedagogical_content** (65+ fiches)
```sql
id BIGINT PRIMARY KEY
niveau SMALLINT (1-3)
dimension VARCHAR (COMPRENDRE, OBSERVER, PROTÉGER)
question TEXT
objectif TEXT
tip TEXT
tags_theme VARCHAR[] (IDs des thèmes)
tags_filtre VARCHAR[] (Filtres)
icon_tag VARCHAR
```

**game_cards** (26+ cartes)
```sql
id BIGINT PRIMARY KEY
type VARCHAR (triage, mots, dilemme, quizz)
data JSONB (Contenu structuré)
theme VARCHAR
related_objective_id VARCHAR
```

**observations**
```sql
id BIGINT PRIMARY KEY
title TEXT
description TEXT
category observation_category (Faune, Flore, Pollution...)
observation_date DATE
latitude REAL
longitude REAL
created_at TIMESTAMP
```

**sorties** (Sessions)
```sql
id BIGINT PRIMARY KEY
stage_id BIGINT (FK)
date DATE
title TEXT
themes TEXT[]
duration INTEGER
selected_notions JSONB
selected_content JSONB
```

---

## 5. Flux de Données

### Flux 1 : Création d'un programme

```
Moniteur crée un stage
    ↓
Frontend: Appel Server Action (createStage)
    ↓
Backend: INSERT INTO stages
    ↓
RLS Policy: Vérifier les permissions
    ↓
Retour: Stage créé avec ID
    ↓
Frontend: Redirection vers constructeur
    ↓
Moniteur sélectionne contenu pédagogique
    ↓
Frontend: Appel Server Action (saveProgramme)
    ↓
Backend: UPDATE sorties + INSERT relations
    ↓
Frontend: Affichage du programme validé
```

### Flux 2 : Suivi sur le terrain

```
Moniteur ouvre l'onglet "Suivi"
    ↓
Frontend: Récupère les objectifs du stage
    ↓
Backend: SELECT pedagogical_content WHERE stage_id = X
    ↓
Frontend: Groupe par pilier (Comprendre/Observer/Protéger)
    ↓
Moniteur coche un objectif
    ↓
Frontend: Appel Server Action (toggleObjective)
    ↓
Backend: UPDATE user_progress
    ↓
Frontend: Mise à jour locale + localStorage
    ↓
Sync offline: Enregistre l'action
    ↓
Retour online: Synchronise avec Supabase
```

---

## 6. Optimisations de Performance

### Requêtes Supabase
```typescript
// Limites appliquées
- Observations: .limit(100)
- Stages: .limit(50)
- Game cards: .limit(200)
- Contenu pédagogique: .limit(500)

// Requêtes parallèles
Promise.all([
  getStages(),
  getObjectives(),
  getGames()
])

// Caching
- Service Worker: 24h
- Browser cache: 1h
- Supabase realtime: Subscriptions
```

### Optimisations Frontend
```
- Code splitting automatique (Next.js)
- Image optimization (next/image)
- CSS-in-JS (Tailwind)
- Lazy loading des composants
- Compression Gzip
```

---

## 7. Sécurité

### Row Level Security (RLS)

```sql
-- Exemple: Utilisateurs ne voient que leurs données
CREATE POLICY "Users can read own data" ON public.user_progress
FOR SELECT USING (auth.uid() = user_id);

-- Administrateurs voient tout
CREATE POLICY "Admins can read all" ON public.user_progress
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role = 'admin'
  )
);
```

### Authentification
- JWT tokens (Supabase)
- Session persistence
- Auto-refresh tokens
- Logout sécurisé

### CORS & Headers
```
- Netlify: https://votre-site.netlify.app
- Supabase: Configuré pour Netlify
- CSP: Content Security Policy
- X-Frame-Options: DENY
```

---

## 8. Mode Offline (PWA)

### Service Worker
```javascript
// Stratégies de cache
1. NetworkFirst: Réseau d'abord, fallback cache
2. CacheFirst: Cache d'abord, fallback réseau
3. StaleWhileRevalidate: Retourner cache + mettre à jour

// Routes cachées
- /api/pedagogical_content
- /api/game_cards
- /api/observations
- /offline.html (fallback)
```

### Synchronisation
```
Offline:
  - Enregistrer les actions en localStorage
  - Afficher l'état offline
  
Online:
  - Détecter la connexion
  - Synchroniser les données
  - Mettre à jour l'UI
```

---

## 9. Monitoring & Logging

### Métriques
- Performance (Core Web Vitals)
- Erreurs (Sentry/Rollbar)
- Utilisation (Analytics)
- Uptime (Monitoring)

### Logs
```
Frontend:
- Erreurs console
- Actions utilisateur
- Requêtes API

Backend:
- Logs Supabase
- Erreurs SQL
- Authentification
```

---

## 10. Déploiement

### CI/CD Pipeline
```
Git push
  ↓
Netlify: Détecte le changement
  ↓
Build: npm run build
  ↓
Tests: (À implémenter)
  ↓
Deploy: Netlify Edge
  ↓
Preview: URL temporaire
  ↓
Production: Merge to main
```

### Environnements
```
Development: localhost:3000
Staging: staging.netlify.app
Production: copun-de-la-mer.netlify.app
```

---

## 11. Scalabilité Future

### Prévisions
- 500+ moniteurs actifs
- 10,000+ stages
- 100,000+ observations
- 1,000,000+ interactions

### Solutions
- Database replication
- CDN global
- Caching distribué
- Load balancing
- Microservices (optionnel)

---

## 12. Dépendances Clés

```json
{
  "next": "15.3.3",
  "react": "19.x",
  "@supabase/supabase-js": "2.x",
  "tailwindcss": "3.x",
  "@hookform/resolvers": "3.x",
  "react-hook-form": "7.x",
  "zod": "3.x",
  "next-pwa": "5.6.0"
}
```

---

**Dernière mise à jour** : Octobre 2025  
**Version** : 1.0.0

