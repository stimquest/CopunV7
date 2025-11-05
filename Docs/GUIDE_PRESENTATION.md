# 🌊 Cop'un de la Mer - Guide de Présentation

## 📋 Résumé Exécutif (2 min)

**Cop'un de la Mer** est une application web progressive (PWA) qui transforme chaque sortie en mer en une opportunité d'apprentissage pédagogique structuré. Elle aide les moniteurs de sports nautiques à :

✅ **Préparer** des programmes pédagogiques cohérents  
✅ **Animer** des séances sur le terrain  
✅ **Gamifier** l'apprentissage avec des défis et jeux  
✅ **Contribuer** aux sciences participatives  

---

## 🎯 Le Problème (1 min)

### Situation actuelle
- Les moniteurs utilisent des **fiches papier** ou des **notes désorganisées**
- Pas de lien structuré entre **technique du sport** et **conscience environnementale**
- Difficile de **suivre la progression** des apprenants
- Manque d'**outils ludiques** pour engager les pratiquants

### Impact
- ⏱️ Perte de temps en préparation
- 😕 Manque de cohérence pédagogique
- 📉 Engagement faible des apprenants
- 🌍 Opportunités manquées de sensibilisation environnementale

---

## 💡 La Solution (2 min)

### Trois piliers pédagogiques

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  COMPRENDRE  →  OBSERVER  →  PROTÉGER             │
│                                                     │
│  Savoirs      Capacités    Actions                 │
│  essentiels   d'observation concrètes              │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**COMPRENDRE** 📚
- Marées, météo, courants
- Biodiversité locale
- Activités humaines

**OBSERVER** 👁️
- Lire l'espace d'évolution
- Identifier les dangers
- Repérer les espèces

**PROTÉGER** 🛡️
- Éco-gestes concrets
- Zones sensibles
- Sciences participatives

---

## 🎮 Fonctionnalités Clés (3 min)

### 1️⃣ Constructeur de Programme (4 étapes)

```
Étape 1: À qui je parle?
   ↓ Sélectionner le niveau (N1, N2-N3, N4-N5)
   
Étape 2: De quoi je parle?
   ↓ Choisir les thèmes (marées, météo, biodiversité...)
   
Étape 3: Pourquoi j'en parle?
   ↓ Sélectionner les fiches-objectifs (65+ disponibles)
   
Étape 4: Action de l'encadrant
   ↓ Valider et auto-évaluer
   
✅ Programme cohérent et prêt à déployer
```

### 2️⃣ Suivi sur le Terrain

- 📋 Checklist d'objectifs par pilier
- ✔️ Validation intuitive (checkbox)
- 💡 Conseils et astuces intégrés
- 🎮 Accès aux jeux et défis

### 3️⃣ Gamification

- 🎯 **Défis** : Assignez des missions au groupe
- 🏆 **Exploits** : Débloquez des récompenses
- 📊 **Classement** : Motivez les moniteurs
- 🎲 **Jeux** : Quiz, vrai/faux, dilemmes

### 4️⃣ Sciences Participatives

- 🗺️ Observations géolocalisées
- 📸 Catégories : Faune, Flore, Pollution...
- 🌍 Contribution à une base de données collaborative
- 📈 Suivi des tendances environnementales

---

## 📱 Expérience Utilisateur (2 min)

### Interface Mobile-First
- Conçue pour le terrain
- Responsive et intuitive
- Fonctionne **offline** (PWA)
- Synchronisation automatique

### Flux Utilisateur Principal

```
┌─────────────────────────────────────────┐
│         Accueil / Authentification      │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│      Tableau de Bord des Stages         │
│  (Voir tous les stages en cours)        │
└────────────────┬────────────────────────┘
                 │
        ┌────────┴────────┐
        │                 │
   ┌────▼────┐      ┌─────▼──────┐
   │Programme │      │   Suivi    │
   │(Créer)   │      │(Animer)    │
   └──────────┘      └────────────┘
```

---

## 🏗️ Architecture Technique (2 min)

### Stack Moderne

```
Frontend (PWA)
├─ Next.js 15.3.3 (React)
├─ TypeScript
├─ Tailwind CSS
└─ Service Worker (offline)
        ↓
    Supabase API
        ↓
Backend
├─ PostgreSQL
├─ Authentication
├─ Row Level Security
└─ Real-time subscriptions
```

### Déploiement
- **Frontend** : Netlify (CI/CD automatique)
- **Backend** : Supabase Cloud (EU - Frankfurt)
- **Région** : France (latence optimale)

### Performances
- ⚡ Requêtes optimisées (limites + parallélisation)
- 📦 Caching intelligent (24h offline)
- 🚀 Service Worker pour mode offline
- 📊 Compression et optimisation d'images

---

## 📊 Modèle de Données (1 min)

### Entités principales

```
Stages (Sessions de formation)
  ├─ Sorties (Sessions individuelles)
  ├─ Contenu pédagogique (65+ fiches)
  └─ Observations (Données collaboratives)

Contenu pédagogique
  ├─ Fiches-objectifs (Comprendre/Observer/Protéger)
  ├─ Cartes de jeu (26+ cartes)
  └─ Ressources (Thèmes, filtres)

Observations
  ├─ Géolocalisation
  ├─ Catégories (Faune/Flore/Pollution)
  └─ Métadonnées
```

---

## 🔒 Sécurité & Conformité (1 min)

✅ **Row Level Security (RLS)** - Contrôle d'accès granulaire  
✅ **Authentification Supabase** - Email/Password sécurisé  
✅ **CORS configuré** - Netlify + Supabase  
✅ **Données offline** - Chiffrement local  
✅ **RGPD-ready** - Données utilisateur protégées  

---

## 📈 Métriques & Impact (1 min)

### Objectifs mesurables

| Métrique | Cible |
|----------|-------|
| Temps de préparation | -50% |
| Engagement des apprenants | +40% |
| Cohérence pédagogique | +80% |
| Observations collectées | 1000+/an |
| Moniteurs actifs | 500+ |

---

## 🚀 Roadmap (1 min)

### Phase 1 (Actuelle)
✅ Constructeur de programme  
✅ Suivi des objectifs  
✅ Gamification  
✅ Mode offline  

### Phase 2 (Prochaine)
🔄 Authentification robuste (Supabase Auth)  
🔄 Gestion des utilisateurs  
🔄 Système de rôles  

### Phase 3 (Futur)
📅 Cartes interactives  
📅 Notifications push  
📅 Export PDF  
📅 Application native  

---

## 💬 Questions Fréquentes (2 min)

**Q: Fonctionne-t-elle sans internet?**  
R: Oui! C'est une PWA. Elle fonctionne offline et se synchronise automatiquement.

**Q: Combien de fiches pédagogiques?**  
R: 65+ fiches-objectifs + 26+ cartes de jeu, toutes adaptables.

**Q: Quel est le coût?**  
R: À définir selon le modèle (freemium, abonnement, etc.)

**Q: Comment les données sont-elles sécurisées?**  
R: Supabase avec RLS, authentification sécurisée, et conformité RGPD.

**Q: Peut-on l'utiliser sur mobile?**  
R: Oui, c'est une PWA. Installez-la comme une app native!

---

## 🎬 Conclusion (1 min)

### Cop'un de la Mer c'est...

🌊 **Une révolution pédagogique** pour les sports nautiques  
📱 **Une technologie accessible** sur tous les appareils  
🌍 **Un engagement environnemental** concret  
👥 **Une communauté** de moniteurs engagés  

### Appel à l'action

> **"Rejoignez-nous pour faire de chaque vague une vague de conscience."**

---

## 📞 Contact & Ressources

- **Site web** : [À définir]
- **Documentation** : Voir `DOCUMENTATION.md`
- **GitHub** : [À définir]
- **Email** : [À définir]

---

**Durée totale de présentation** : ~15-20 minutes  
**Dernière mise à jour** : Octobre 2025

