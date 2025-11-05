# EcoNav Maestro (Cop'un de la mer) - Documentation Fonctionnelle

## 1. Vue d'ensemble

**EcoNav Maestro** est une application web conçue pour les moniteurs de sports de plein air (spécifiquement les sports nautiques) afin de les assister dans la création et le suivi de programmes pédagogiques environnementaux. L'outil permet de structurer des stages, de construire des séances personnalisées en fonction des objectifs et du public, de créer des jeux éducatifs et de consigner des observations sur le milieu.

L'interface est pensée "mobile-first" pour une utilisation sur le terrain, tout en restant fonctionnelle sur ordinateur, notamment pour les parties de préparation et d'administration.

---

## 2. Fonctionnalités Principales

### 2.1. Gestion des Stages

Le stage est l'entité centrale de l'application. Il représente une session de formation (ex: "Stage de Voile - Semaine 32").

- **Création et Édition :** Les moniteurs peuvent créer de nouveaux stages en définissant un titre, un type (Hebdomadaire, Journée, Libre), un nombre de participants et des dates de début et de fin.
- **Vue d'ensemble :** La page "Stages" liste tous les stages à venir, en cours et passés, avec une barre de progression visuelle sur les objectifs pédagogiques.
- **Titre Dynamique :** Le titre d'un stage est automatiquement mis à jour pour inclure le niveau du groupe et les thèmes principaux du programme, offrant une identification rapide et claire.

### 2.2. Constructeur de Programme Pédagogique

Cette page, accessible depuis un stage spécifique, est le cœur de l'application. Elle guide le moniteur à travers un processus de création structuré en quatre étapes claires pour définir le contenu pédagogique de l'ensemble du stage.

1.  **Étape 1 : À qui je parle ? (Niveau du groupe)**
    *   Le moniteur sélectionne le niveau de compétence de son groupe parmi trois options : "Je découvre", "J'agis, je m’adapte", et "J’agis de façon responsable".
    *   Ce choix initial est fondamental car il filtre la difficulté et la pertinence des fiches pédagogiques proposées dans les étapes suivantes.

2.  **Étape 2 : De quoi je parle ? (Choix des thèmes)**
    *   Le moniteur choisit un ou plusieurs thèmes qui serviront de fil conducteur au programme.
    *   Les thèmes sont organisés en trois grandes catégories conceptuelles :
        *   **Du lieu géographique** (Caractéristiques du littoral, Activités humaines, etc.)
        *   **De l’espace d’évolution** (Lecture du paysage, Repères spatio-temporels, etc.)
        *   **Du site naturel** (Impact de la présence humaine, Cohabitation avec le vivant, etc.)
    *   La sélection d'au moins un thème est nécessaire pour débloquer l'étape suivante et commencer à explorer les fiches.

3.  **Étape 3 : Pourquoi j’en parle ? (Sélection des objectifs)**
    *   Cette section interactive est présentée sous forme d'onglets, permettant au moniteur de construire son programme.
    *   **Onglet "Explorer les fiches" :** Affiche une bibliothèque de fiches-objectifs filtrée selon le niveau (Étape 1) et les thèmes (Étape 2) choisis.
        *   Un filtre supplémentaire permet d'affiner la recherche par pilier pédagogique : "Comprendre", "Observer", ou "Protéger".
        *   Chaque fiche est une carte cliquable qui présente une question, un objectif pédagogique, et un conseil. Un indicateur visuel discret (un cercle coloré avec une icône) rappelle son pilier d'appartenance.
        *   En cliquant sur une fiche, le moniteur l'ajoute à sa sélection. Une fiche sélectionnée est clairement mise en évidence par une bordure de couleur et un fond distinctif.
    *   **Onglet "Mon Programme" :** Affiche uniquement les fiches sélectionnées par le moniteur, lui donnant une vue d'ensemble claire du programme en cours de construction. Il peut y retirer des fiches si nécessaire.

4.  **Étape 4 : Action de l’encadrant (Finalisation)**
    *   Une fois sa sélection d'objectifs terminée, le moniteur dispose de deux actions clés :
        *   **"Je teste mes connaissances" :** Ce bouton, actif uniquement si des fiches ont été sélectionnées, lance un quiz auto-généré. Ce quiz permet au moniteur de valider sa propre maîtrise des sujets qu'il s'apprête à enseigner.
        *   **"Appliquer le programme" :** Ce bouton sauvegarde le programme. Une fois cliqué, l'application crée automatiquement une fiche de séance pour chaque jour du stage, incluant les objectifs sélectionnés. Le titre du stage est également mis à jour dynamiquement pour refléter le niveau et les thèmes choisis.

Ce processus structuré garantit la création d'un programme cohérent, adapté au public et riche en contenu, tout en offrant au moniteur des outils pour sa propre formation.

### 2.3. Suivi des Objectifs

Sur la page de détail d'un stage, l'onglet "Objectifs" permet un suivi interactif de la progression des élèves.

- **Liste par Piliers :** Les objectifs du programme sont groupés par piliers (Comprendre, Observer, Protéger).
- **Validation par Glissement :** Le moniteur peut marquer un objectif comme "vu" en le faisant simplement glisser vers la droite. L'objectif disparaît alors de la liste principale et est déplacé dans une section "Notions vues".
- **Infobulles d'aide :** Des conseils pour le moniteur sont accessibles via des icônes discrètes pour ne pas surcharger l'interface.

### 2.4. Bibliothèque et Générateur de Jeux

Une section entière est dédiée à la gamification de l'apprentissage.

- **Création de Jeux :**
    - **Générateur Assisté :** Crée un jeu rapidement en choisissant des thèmes, des types de questions (Vrai/Faux, Quizz, etc.) et le nombre de questions souhaité.
    - **Création Manuelle ("Pioche") :** Une interface de type "Tinder" permet de faire défiler des cartes de jeu et de les ajouter ou de les rejeter par un glissement pour créer un jeu 100% personnalisé.
- **Lecture de Jeu :** Une interface simple et plein écran permet de jouer aux jeux créés avec un groupe, avec un suivi du score en temps réel.

### 2.5. Journal des Observations

Cette fonctionnalité transforme les moniteurs en "sentinelles de la mer".

- **Carte Interactive :** Une carte permet de visualiser toutes les observations consignées.
- **Ajout d'Observations :** Le moniteur peut placer un marqueur sur la carte pour signaler une observation et la documenter en précisant un titre, une description, une catégorie (Faune, Flore, Pollution...) et une date.
- **Filtrage :** Les observations peuvent être filtrées par catégorie et par plage de dates.

### 2.6. Gestion de Contenu (Admin)

Des sections dédiées, conçues pour une utilisation sur ordinateur ("desktop-first"), permettent de gérer la base de connaissances de l'application.

- **Gestion du Contenu Pédagogique :** Créer, modifier et supprimer les fiches d'objectifs (questions, objectifs, conseils, niveau, thèmes associés).
- **Gestion des Cartes de Jeu :** Gérer la base de données des questions qui alimentent le générateur de jeux.

---

## 3. Navigation et Interface

- **Barre Latérale (Bureau) :** Une barre de navigation latérale permet d'accéder à toutes les sections. Elle peut être réduite pour n'afficher que les icônes, avec des infobulles pour la clarté.
- **Barre de Navigation Inférieure (Mobile) :** Sur mobile, une barre de navigation standard en bas de l'écran assure un accès rapide aux fonctionnalités principales, garantissant une expérience "mobile-first" optimale.
- **Profil Utilisateur :** Une page profil permet au moniteur de sauvegarder son nom et son club, informations qui peuvent être réutilisées pour personnaliser les documents générés (comme les fiches de sortie).
- **Trophées :** Un système de badges ludiques récompense l'utilisateur pour certaines actions clés (ex: "Maître du Programme").

## Licence
Ce projet est distribué sous licence [CC BY-NC-ND 4.0](LICENSE).  
© 2025 Artyzia / Stimquest  / Patrick LOUVEL — Tous droits réservés pour un usage commercial.

