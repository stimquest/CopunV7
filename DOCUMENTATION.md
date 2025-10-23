# 📚 Documentation Complète - Cop'un de la Mer

## Table des Matières
1. [Vue d'ensemble](#vue-densemble)
2. [À quoi sert l'application](#à-quoi-sert-lapplication)
3. [Cas d'usage](#cas-dusage)
4. [Architecture technique](#architecture-technique)
5. [Fonctionnalités principales](#fonctionnalités-principales)
6. [Flux utilisateur](#flux-utilisateur)
7. [Modèle de données](#modèle-de-données)
8. [Sécurité et performances](#sécurité-et-performances)

---

## 🌊 Vue d'ensemble

**Cop'un de la Mer** est une application web et mobile progressive (PWA) conçue pour les moniteurs de sports nautiques. Elle transforme chaque sortie en mer en une opportunité d'apprentissage pédagogique structuré autour de trois piliers : **Comprendre**, **Observer**, et **Protéger** l'environnement marin.

### Informations Clés
- **Type** : Progressive Web App (PWA) - Fonctionne offline
- **Stack** : Next.js 15.3.3, TypeScript, Tailwind CSS, Supabase
- **Public cible** : Moniteurs de voile, kayak, paddle, et autres sports nautiques
- **Région** : France (Supabase EU - Frankfurt)
- **Déploiement** : Netlify

---

## 🎯 À quoi sert l'application

### Problème identifié
Les moniteurs de sports nautiques manquent d'un outil simple et intégré pour :
- Structurer leurs séances pédagogiques
- Sensibiliser à l'environnement marin sans alourdir leur charge
- Suivre la progression des apprenants
- Engager les pratiquants de manière ludique

### Solution proposée
Cop'un de la Mer offre une plateforme complète qui :
1. **Aide à la préparation** : Constructeur de programme pédagogique guidé
2. **Facilite l'animation** : Suivi interactif sur le terrain
3. **Gamifie l'apprentissage** : Défis, jeux, observations
4. **Valorise l'engagement** : Système de classement et d'exploits

---

## 💼 Cas d'usage

### Cas 1 : Préparation d'un stage de voile (Moniteur)
```
1. Créer un nouveau stage (titre, dates, participants)
2. Utiliser le constructeur de programme :
   - Sélectionner le niveau du groupe
   - Choisir les thèmes (marées, météo, biodiversité...)
   - Sélectionner les fiches-objectifs pertinentes
3. Valider le programme
4. Exporter ou imprimer si nécessaire
```

### Cas 2 : Animation d'une sortie (Moniteur sur le terrain)
```
1. Ouvrir l'onglet "Suivi" du stage
2. Consulter les objectifs à aborder
3. Cocher les objectifs au fur et à mesure
4. Accéder aux conseils et astuces intégrés
5. Lancer un défi ou un jeu si besoin
```

### Cas 3 : Suivi de la progression (Moniteur/Formateur)
```
1. Consulter le tableau de bord des compétences
2. Voir les résultats des quiz par thème
3. Identifier les points forts et faibles
4. Adapter les futurs programmes
```

### Cas 4 : Contribution aux sciences participatives (Moniteur)
```
1. Faire une observation en mer (pollution, espèce rare...)
2. Ouvrir la section "Observations"
3. Créer une nouvelle observation avec :
   - Description
   - Catégorie (Faune, Flore, Pollution...)
   - Géolocalisation
   - Photo (optionnel)
4. Contribuer à la base de données collaborative
```

---

## 🏗️ Architecture technique

### Stack technologique

```
┌─────────────────────────────────────────────────────┐
│                   Frontend (PWA)                     │
│  Next.js 15.3.3 + React + TypeScript + Tailwind    │
│  - Server Components & Actions                      │
│  - Service Worker (offline support)                 │
│  - Responsive design (mobile-first)                 │
└──────────────────┬──────────────────────────────────┘
                   │
        ┌──────────┴──────────┐
        │                     │
┌───────▼────────┐   ┌────────▼──────────┐
│  Supabase API  │   │  Local Storage    │
│  (REST/Auth)   │   │  (Offline cache)  │
└───────┬────────┘   └──────────────────┘
        │
┌───────▼──────────────────────────────────┐
│         Supabase Backend                  │
│  - PostgreSQL Database                   │
│  - Authentication (Email/Password)       │
│  - Row Level Security (RLS)              │
│  - Real-time subscriptions               │
└──────────────────────────────────────────┘
```

### Déploiement
- **Frontend** : Netlify (CI/CD automatique)
- **Backend** : Supabase Cloud (EU - Frankfurt)
- **CDN** : Netlify Edge

---

## 🎮 Fonctionnalités principales

### 1. Gestion des Stages
- Créer/modifier/supprimer des stages
- Définir : titre, type, dates, nombre de participants
- Voir la progression globale du stage

### 2. Constructeur de Programme (4 étapes)
**Étape 1 : À qui je parle ?**
- Sélectionner le niveau du groupe (N1, N2-N3, N4-N5)

**Étape 2 : De quoi je parle ?**
- Choisir les thèmes principaux (marées, météo, biodiversité...)

**Étape 3 : Pourquoi j'en parle ?**
- Sélectionner les fiches-objectifs dans la bibliothèque
- Filtrer par niveau, thème, type

**Étape 4 : Action de l'encadrant**
- Valider le programme
- Auto-évaluation du moniteur

### 3. Suivi des Objectifs
- Affichage des objectifs groupés par pilier (Comprendre/Observer/Protéger)
- Validation interactive (checkbox)
- Filtrage par thème
- Affichage des conseils et astuces
- Historique de progression

### 4. Générateur de Jeux
- Créer des quiz, vrai/faux, dilemmes
- Sélectionner les thèmes et niveaux
- Générer des jeux personnalisés
- Jouer directement dans l'app

### 5. Système de Défis
- Assigner des défis au groupe
- Débloquer des exploits
- Classement des moniteurs par club
- Système de rangs (Bronze, Argent, Or, Champion, Elite)

### 6. Journal des Observations
- Créer des observations géolocalisées
- Catégories : Faune, Flore, Pollution, Phénomène inhabituel
- Consulter les observations sur une carte
- Contribuer aux sciences participatives

### 7. Gestion du Contenu Pédagogique
- Bibliothèque de fiches-objectifs (65+ fiches)
- Éditeur de cartes pour les administrateurs
- Filtrage par : niveau, pilier, thème, type
- Recherche textuelle

---

## 👥 Flux utilisateur

### Flux 1 : Moniteur (Utilisateur principal)
```
Accueil
  ↓
Authentification (localStorage actuellement)
  ↓
Tableau de bord des stages
  ↓
Créer/Ouvrir un stage
  ├─→ Onglet "Programme" : Constructeur de programme
  ├─→ Onglet "Suivi" : Suivre les objectifs
  └─→ Onglet "Ressources" : Accéder aux jeux et observations
  ↓
Profil : Voir ses compétences et exploits
```

### Flux 2 : Administrateur
```
Accueil
  ↓
Authentification
  ↓
Tableau de bord admin
  ├─→ Gestion du contenu pédagogique
  ├─→ Éditeur de cartes de jeu
  └─→ Gestion des structures
```

---

## 📊 Modèle de données

### Tables principales

**stages**
- id, title, type, participants, start_date, end_date, created_at

**pedagogical_content** (65+ fiches)
- id, niveau (1-3), dimension (COMPRENDRE/OBSERVER/PROTÉGER)
- question, objectif, tip, tags_theme, tags_filtre

**game_cards** (26+ cartes)
- id, type (triage/mots/dilemme/quizz), data (JSONB)
- theme, related_objective_id

**observations**
- id, title, description, category, observation_date
- latitude, longitude, created_at

**sorties** (Sorties/sessions)
- id, stage_id, date, title, themes, duration
- selected_notions, selected_content

**structures**
- id, name, latitude, longitude

### Relations
```
stages ──→ sorties
stages ──→ pedagogical_content (via selected_content)
stages ──→ observations
pedagogical_content ──→ game_cards (via related_objective_id)
```

---

## 🔒 Sécurité et performances

### Sécurité
- **RLS (Row Level Security)** : Contrôle d'accès au niveau base de données
- **Authentification** : Supabase Auth (email/password)
- **CORS** : Configuré pour Netlify
- **Données sensibles** : Stockées côté serveur

### Performances
- **Limites de requêtes** : 
  - Observations : 100 max
  - Stages : 50 max
  - Game cards : 200 max
  - Contenu pédagogique : 500 max
- **Requêtes parallèles** : Optimisation des appels API
- **Caching** : Service Worker (24h pour offline)
- **Compression** : Gzip activé
- **Images** : Optimisées via Next.js Image

### Mode Offline (PWA)
- Fonctionne sans connexion internet
- Synchronisation automatique au retour online
- Cache des données Supabase (24h)
- Page offline dédiée

---

## 🚀 Prochaines étapes

### Court terme
- [ ] Implémenter une vraie gestion des utilisateurs (Supabase Auth)
- [ ] Ajouter la persistance des données utilisateur
- [ ] Système de rôles (moniteur, admin, formateur)

### Moyen terme
- [ ] Intégration de cartes interactives (MapLibre)
- [ ] Notifications push
- [ ] Export PDF des programmes
- [ ] Partage de stages entre moniteurs

### Long terme
- [ ] Application native (React Native)
- [ ] Intégration avec des APIs externes (météo, marées)
- [ ] Système de certification
- [ ] Marketplace de contenus pédagogiques

---

## 📞 Support et Contact

Pour toute question ou suggestion, contactez l'équipe de développement.

**Version** : 1.0.0  
**Dernière mise à jour** : Octobre 2025  
**Statut** : En production

