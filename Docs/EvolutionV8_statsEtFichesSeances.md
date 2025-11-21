📋 ANALYSE FONCTIONNELLE DES ÉVOLUTIONS V8
🎯 VISION RÉVISÉE : SÉANCES STRUCTURÉES + CAPSULES ENVIRONNEMENT

✅ Compréhension du changement

**Modèle ACTUEL :**
```
Stage (ex: "Stage Voile Niveau 1")
  └─ Programme intégré (5 étapes fixes)
      ├─ Étape 1 : Niveau du groupe
      ├─ Étape 2 : Comprendre
      ├─ Étape 3 : Observer
      ├─ Étape 4 : Protéger + Défis
      └─ Étape 5 : Jeux
```
❌ Problème : Centré sur l'environnement, pas sur l'activité réelle. Rigide et non réutilisable.

---

**Modèle PROPOSÉ :**
```
Stage (ex: "Stage Voile Niveau 1")
  └─ Séance (ex: "Jour 2 - Apprentissage des virements")
      ├─ Structure SPORTIVE (pense-bête du moniteur)
      │   ├─ Échauffement (15 min)
      │   ├─ Apprentissage technique (30 min)
      │   ├─ Pratique en mer (45 min)
      │   └─ Débriefing (15 min)
      │
      └─ Capsules ENVIRONNEMENT (optionnelles, réutilisables)
          ├─ Capsule "Marée et navigation" (insérée dans "Apprentissage")
          │   ├─ 📚 Info : "Comment la marée affecte..."
          │   ├─ ❓ Question : "Pourquoi faut-il..."
          │   ├─ 🎮 Jeu : "Triage - Vrai/Faux"
          │   └─ 🏆 Défi : "Observe la marée et..."
          │
          └─ Capsule "Sécurité en mer" (insérée dans "Échauffement")
              ├─ 📚 Tips : "Les équipements essentiels..."
              ├─ ❓ Question : "Quel est le rôle du..."
              └─ 🎮 Jeu : "Quiz - Sécurité"
```
✅ Avantage : Flexibilité, réutilisabilité, pense-bête clair, enrichissement progressif

---

## 🔄 Principes fondamentaux

### 1. **L'app aide, ne fait pas le travail à la place**
- Les capsules sont des **suggestions**, pas des impositions
- Le moniteur reste maître de sa séance
- Les ressources enrichissent, ne remplacent pas la pédagogie du moniteur

### 2. **Capsules propres au moniteur**
- Chaque moniteur crée/adapte ses propres capsules
- Les capsules publiques (Cop'un) = base de travail
- Si une capsule publique est modifiée → elle est modifiée pour le moniteur (pas de versioning)
- Pas de partage entre moniteurs (pour le moment)

### 3. **Découverte facile par filtrage**
- Tags et outils de filtre permettent de trouver rapidement
- Recherche par mots-clés
- Filtres : activité, niveau, durée, thématique, saison, lieu
---

## 🛠️ Modifications nécessaires

### A. Modèle de données (Base de données)

#### Nouvelles tables :

**`sessions`** (Séances d'un stage)
```sql
id BIGINT PRIMARY KEY
stage_id BIGINT (FK → stages)
title TEXT (ex: "Jour 2 - Apprentissage des virements")
description TEXT
order INTEGER (position dans le stage)
created_at TIMESTAMP
updated_at TIMESTAMP
```

**`session_structure`** (Structure sportive de la séance - pense-bête)
```sql
id BIGINT PRIMARY KEY
session_id BIGINT (FK → sessions)
step_order INTEGER (ordre des étapes)
step_title TEXT (ex: "Échauffement")
step_duration_minutes INTEGER
step_description TEXT (notes du moniteur)
created_at TIMESTAMP
```

**`environment_capsules`** (Capsules environnement réutilisables)
```sql
id BIGINT PRIMARY KEY
title TEXT (ex: "Marée et navigation")
description TEXT
duration_minutes INTEGER
level TEXT (débutant, intermédiaire, avancé)
created_by TEXT (moniteur_id ou 'public' pour Cop'un)
is_public BOOLEAN (true = base de travail, false = privée au moniteur)
created_at TIMESTAMP
updated_at TIMESTAMP

-- Métadonnées pour filtrage
activity_types TEXT[] (voile, kayak, paddle, plage, etc.)
location_types TEXT[] (en_mer, sur_plage, en_salle, estran, etc.)
themes TEXT[] (marée, faune, pollution, sécurité, etc.)
season TEXT[] (toute_l_annee, printemps, été, automne, hiver)
```

**`capsule_content`** (Contenu d'une capsule)
```sql
id BIGINT PRIMARY KEY
capsule_id BIGINT (FK → environment_capsules)
content_type TEXT (info, question, game, defi, tip)
content_data JSONB (structure flexible selon le type)
order INTEGER
created_at TIMESTAMP
```

**`session_capsules`** (Liaison Séance ↔ Capsules)
```sql
id BIGINT PRIMARY KEY
session_id BIGINT (FK → sessions)
capsule_id BIGINT (FK → environment_capsules)
session_step_id BIGINT (FK → session_structure - optionnel, pour insérer dans une étape)
order INTEGER (ordre d'insertion)
custom_modifications JSONB (adaptations du moniteur)
created_at TIMESTAMP
```

#### Tables à modifier :

**`stages`** : Ajouter
- `sport_activity` TEXT (voile, kayak, paddle, plage, etc.)
- `sport_level` TEXT (débutant, intermédiaire, avancé)
- `sport_description` TEXT (notes sur l'aspect sportif)

**`stages_exploits`** : Ajouter
- `session_id` BIGINT (optionnel, pour lier un défi à une séance spécifique)
### B. Interfaces utilisateur (UX/UI)

#### Nouvelles pages :

**📚 Bibliothèque de Capsules Environnement** (`/capsules`)
- Liste de toutes les capsules disponibles (publiques + privées du moniteur)
- **Filtres** : activité, niveau, durée, thématique, saison, lieu
- **Recherche** par mots-clés
- **Prévisualisation rapide** (modal avec contenu)
- **Actions** : Voir détails, Dupliquer, Modifier, Supprimer (si propriétaire)
- **Indicateur** : "Publique (Cop'un)" vs "Privée (Mes capsules)"

**✏️ Éditeur de Capsule** (`/capsules/new` ou `/capsules/[id]/edit`)
- **Section 1 : Infos générales**
  - Titre, description, durée, niveau
  - Activités, lieux, thématiques, saison
- **Section 2 : Contenu**
  - Ajouter des éléments : Info, Question, Jeu, Défi, Tip
  - Éditeur riche pour chaque élément
  - Ordre modifiable par drag & drop
- **Section 3 : Métadonnées**
  - Tags pour filtrage
  - Visibilité (privée/publique - si partage futur)
- **Prévisualisation** en temps réel
- **Sauvegarde** en brouillon / Publication

**🎨 Compositeur de Séance** (`/stages/[id]/sessions/new` ou `/stages/[id]/sessions/[sessionId]/edit`)
- **Section 1 : Infos générales**
  - Titre, description, date (optionnel)
- **Section 2 : Structure sportive (pense-bête)**
  - Ajouter des étapes (Échauffement, Apprentissage, Pratique, Débriefing, etc.)
  - Pour chaque étape : titre, durée, notes du moniteur
  - Ordre modifiable par drag & drop
  - Durée totale calculée automatiquement
- **Section 3 : Enrichissement environnement**
  - Pour chaque étape : bouton "Ajouter une capsule"
  - Ouvre la bibliothèque de capsules avec filtres pré-remplis
  - Sélection et insertion de capsules
  - Possibilité d'adapter la capsule pour cette séance
- **Prévisualisation** de la séance complète
- **Sauvegarde** en brouillon / Publication

#### Pages à modifier :

**📖 Page de détail du Stage** (`/stages/[id]`)
- **Onglet "Infos"** : Infos générales + aspect sportif (activité, niveau, description)
- **Onglet "Séances"** :
  - Liste des séances du stage (ordre modifiable par drag & drop)
  - Bouton "Ajouter une séance"
  - Pour chaque séance : Voir détails, Modifier, Dupliquer, Supprimer
  - Durée totale du stage calculée
- **Onglet "Suivi"** : Progression par séance
  - Séance 1 : Objectifs (✓/✗), Défis (✓/✗), Jeux (✓/✗)
  - Séance 2 : Objectifs (✓/✗), Défis (✓/✗), Jeux (✓/✗)
  - Progression globale du stage
### C. Fonctionnalités métier

#### Gestion des droits :

**Capsules publiques** (Cop'un)
- Créées par l'équipe Cop'un
- Visibles par tous les moniteurs
- **Modifiables** : Si un moniteur modifie une capsule publique, elle devient sa copie privée
- Pas de versioning (la capsule publique reste inchangée)

**Capsules privées** (Moniteur)
- Créées par un moniteur
- Visibles uniquement par ce moniteur
- Modifiables à tout moment
- Pas de partage (pour le moment)

#### Adaptation des capsules :

Quand un moniteur insère une capsule dans une séance :
- La capsule originale reste inchangée
- Le moniteur peut adapter le contenu pour cette séance spécifique
- Les adaptations sont stockées dans `session_capsules.custom_modifications`
- Exemple : Modifier la durée, ajouter des notes, retirer un élément

#### Migration des stages existants :

**Objectif** : Convertir les stages actuels (avec programme 5 étapes) en séances structurées

**Approche** :
1. Créer une séance par stage existant
2. Créer une structure sportive par défaut (à compléter par le moniteur)
3. Créer des capsules publiques à partir du contenu pédagogique existant
4. Lier les capsules aux séances
5. Permettre au moniteur de réorganiser/adapter

**Détails** :
- Les 5 étapes actuelles (Niveau, Comprendre, Observer, Protéger, Jeux) deviennent des capsules publiques
- Chaque stage existant reçoit une séance avec ces capsules pré-insérées
- Le moniteur peut ensuite réorganiser, modifier, ajouter/retirer des capsules
---

## 🎁 Bénéfices attendus

### ✅ Pour les moniteurs :

- **Pense-bête clair** : Structure sportive bien définie
- **Gain de temps** : Réutilisation de capsules déjà créées
- **Flexibilité totale** : Composition de séances sur-mesure
- **Enrichissement progressif** : Ajouter du contenu environnemental sans imposer
- **Outil de travail** : L'app aide, ne fait pas le travail à la place
- **Découverte facile** : Filtres et recherche pour trouver les bonnes capsules

### ✅ Pour les structures :

- **Cohérence pédagogique** : Capsules publiques comme base commune
- **Capitalisation** : Chaque moniteur crée ses propres capsules
- **Onboarding** : Nouveaux moniteurs ont accès aux capsules publiques
- **Flexibilité** : Chaque moniteur adapte selon son contexte

### ✅ Pour l'application :

- **Modularité** : Capsules réutilisables = moins de duplication
- **Scalabilité** : Facile d'ajouter du contenu
- **Qualité** : Capsules validées et testées
- **Évolution** : Fondation pour partage futur entre structures
---

## 📊 POINT 2 : STATISTIQUES ET REPORTING (À DÉFINIR ULTÉRIEUREMENT)

**Note** : Les statistiques seront définies après la mise en place des séances et capsules.

**Objectif** : Quantifier et valoriser le travail de sensibilisation environnementale

**Cas d'usage** :
- Directeur de structure : "Combien d'heures de sensibilisation avons-nous fait ce trimestre ?"
- Moniteur : "Quel est mon impact pédagogique ?"
- Financeur/Subventionneur : "Justifier l'utilisation de fonds publics"
- Communication : "Valoriser l'engagement environnemental de la structure"

**À explorer** :
- Métriques d'activité (stages, séances, participants, heures)
- Métriques pédagogiques (objectifs, défis, jeux, sorties)
- Métriques d'impact (apprenants sensibilisés, progression)
- Métriques organisationnelles (par moniteur, par structure)
---

## �️ ROADMAP

### Phase 1 : Séances structurées + Capsules environnement (Priorité HAUTE)
**Durée estimée** : 8-10 semaines

**Pourquoi en premier ?**
- Impact direct sur l'usage quotidien des moniteurs
- Fondation pour les statistiques (meilleure granularité)
- Demande forte des utilisateurs

**Étapes** :
1. Conception du modèle de données (1 semaine)
2. Création des migrations SQL (1 semaine)
3. Développement de la bibliothèque de capsules (2 semaines)
4. Développement de l'éditeur de capsules (2 semaines)
5. Développement du compositeur de séances (2 semaines)
6. Migration des stages existants (1 semaine)
7. Tests et ajustements (1 semaine)

**Livrables** :
- ✅ Tables de base de données
- ✅ Bibliothèque de capsules (publiques + privées)
- ✅ Éditeur de capsules
- ✅ Compositeur de séances
- ✅ Page de détail du stage révisée
- ✅ Migration des stages existants

### Phase 2 : Statistiques et reporting (Priorité MOYENNE)
**Durée estimée** : 4-6 semaines

**Pourquoi après ?**
- Nécessite la structure des séances pour être pertinent
- Besoin de collecter des données d'usage d'abord

**À définir** :
- Modèle de données pour les logs d'activité
- Métriques pertinentes
- Interfaces de reporting
- Système d'export

### Phase 3 : Améliorations futures (Priorité BASSE)
- Partage de capsules entre moniteurs
- Benchmark inter-structures
- Recommandations intelligentes
- Intégrations externes

---

## 💡 RECOMMANDATIONS STRATÉGIQUES

### 1. Approche itérative
- Commencer par un MVP (Minimum Viable Product) pour chaque phase
- Recueillir les retours utilisateurs rapidement
- Ajuster avant de développer les fonctionnalités avancées

### 2. Co-conception avec les utilisateurs
- Impliquer les moniteurs dans la conception des capsules
- Tester les prototypes avec les directeurs de structure
- Organiser des ateliers de feedback

### 3. Migration en douceur
- Maintenir la compatibilité avec les stages existants
- Permettre au moniteur de réorganiser progressivement
- Former les utilisateurs progressivement

### 4. Communication
- Annoncer les évolutions en amont
- Créer des tutoriels vidéo
- Organiser des webinaires de présentation

---

## 🎯 CONCLUSION

Cette évolution transforme Cop'un de la Mer en **outil de structuration et d'enrichissement** :

✅ **Séances structurées** = Pense-bête clair pour les moniteurs
✅ **Capsules réutilisables** = Gain de temps + Flexibilité
✅ **Enrichissement progressif** = L'app aide, ne fait pas le travail à la place
✅ **Découverte facile** = Filtres et recherche pour trouver les bonnes ressources

**Impact** :
- Les moniteurs ont un outil de travail adapté à leur réalité
- L'environnement s'intègre naturellement dans l'activité sportive
- Meilleure pédagogie grâce au contexte pertinent
- Fondation solide pour les statistiques futures

**Investissement estimé** :
- Phase 1 (Séances + Capsules) : ~50-60 jours de développement
- Phase 2 (Statistiques) : À définir après Phase 1
- **Total Phase 1** : ~2-3 mois à temps plein