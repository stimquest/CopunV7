// Templates de séances pour moniteurs de voile

export interface SessionTemplate {
  id: string;
  title: string;
  description: string;
  category: 'duree' | 'niveau' | 'theme' | 'meteo' | 'support' | 'eco' | 'special';
  icon: string;
  duration_minutes: number;
  level?: string;
  steps: SessionStepTemplate[];
  tags: string[];
}

export interface SessionStepTemplate {
  title: string;
  duration_minutes: number;
  description: string;
  order: number;
}

// ============================================================================
// TEMPLATES PAR DURÉE
// ============================================================================

export const TEMPLATES_DUREE: SessionTemplate[] = [
  {
    id: 'seance-2h',
    title: 'Séance 2h (format classique)',
    description: 'Structure standard pour une séance de 2 heures',
    category: 'duree',
    icon: '⏱️',
    duration_minutes: 120,
    tags: ['2h', 'classique', 'standard'],
    steps: [
      { title: 'Briefing terre', duration_minutes: 10, description: 'Consignes sécurité et objectifs de la séance', order: 1 },
      { title: 'Mise à l\'eau + échauffement', duration_minutes: 15, description: 'Installation et premiers bords', order: 2 },
      { title: 'Exercice technique principal', duration_minutes: 50, description: 'Travail de la technique du jour', order: 3 },
      { title: 'Jeu / mise en situation', duration_minutes: 30, description: 'Application ludique', order: 4 },
      { title: 'Retour + débriefing', duration_minutes: 15, description: 'Rangement et bilan', order: 5 },
    ],
  },
  {
    id: 'demi-journee-3h',
    title: 'Demi-journée 3h',
    description: 'Format demi-journée avec pause observation',
    category: 'duree',
    icon: '⏱️',
    duration_minutes: 180,
    tags: ['3h', 'demi-journée', 'pause éco'],
    steps: [
      { title: 'Briefing + météo', duration_minutes: 15, description: 'Analyse conditions et plan de séance', order: 1 },
      { title: 'Mise à l\'eau', duration_minutes: 10, description: 'Installation rapide', order: 2 },
      { title: 'Bloc technique 1', duration_minutes: 40, description: 'Premier exercice technique', order: 3 },
      { title: 'Pause + observation éco', duration_minutes: 20, description: 'Temps calme et observation environnement', order: 4 },
      { title: 'Bloc technique 2', duration_minutes: 40, description: 'Deuxième exercice technique', order: 5 },
      { title: 'Parcours / jeu', duration_minutes: 30, description: 'Mise en pratique ludique', order: 6 },
      { title: 'Retour + débriefing', duration_minutes: 25, description: 'Rangement et bilan approfondi', order: 7 },
    ],
  },
  {
    id: 'journee-complete',
    title: 'Journée complète',
    description: 'Programme complet sur une journée',
    category: 'duree',
    icon: '📅',
    duration_minutes: 420,
    tags: ['journée', 'complet', 'stage'],
    steps: [
      { title: 'Accueil + brief', duration_minutes: 20, description: 'Accueil et présentation de la journée', order: 1 },
      { title: 'Session technique intensive', duration_minutes: 120, description: 'Travail technique approfondi', order: 2 },
      { title: 'Pause éco-responsable', duration_minutes: 30, description: 'Pause avec sensibilisation environnement', order: 3 },
      { title: 'Pique-nique + temps libre', duration_minutes: 60, description: 'Repas et détente', order: 4 },
      { title: 'Atelier environnement', duration_minutes: 30, description: 'Activité pédagogique environnementale', order: 5 },
      { title: 'Mise en pratique / navigation libre', duration_minutes: 90, description: 'Navigation autonome encadrée', order: 6 },
      { title: 'Jeux nautiques', duration_minutes: 45, description: 'Activités ludiques', order: 7 },
      { title: 'Bilan de journée', duration_minutes: 15, description: 'Retour sur la journée', order: 8 },
    ],
  },
];

// ============================================================================
// TEMPLATES PAR NIVEAU
// ============================================================================

export const TEMPLATES_NIVEAU: SessionTemplate[] = [
  {
    id: 'debutant-premiere-seance',
    title: 'Débutant - Première séance',
    description: 'Découverte et mise en confiance',
    category: 'niveau',
    icon: '🔰',
    duration_minutes: 130,
    level: 'Débutant',
    tags: ['débutant', 'découverte', 'première fois'],
    steps: [
      { title: 'Visite du club + consignes sécurité', duration_minutes: 20, description: 'Tour du club et règles de sécurité', order: 1 },
      { title: 'Présentation du matériel + vocabulaire', duration_minutes: 15, description: 'Découverte du bateau et termes nautiques', order: 2 },
      { title: 'Jeu au sec: "les allures"', duration_minutes: 10, description: 'Apprentissage ludique à terre', order: 3 },
      { title: 'Mise à l\'eau accompagnée', duration_minutes: 10, description: 'Première mise à l\'eau sécurisée', order: 4 },
      { title: 'Exercice: "suivre le moniteur"', duration_minutes: 30, description: 'Navigation en suivant le moniteur', order: 5 },
      { title: 'Module éco: ramassage de ce qui flotte', duration_minutes: 15, description: 'Sensibilisation déchets marins', order: 6 },
      { title: 'Premier retour au ponton', duration_minutes: 20, description: 'Apprentissage du retour', order: 7 },
      { title: 'Débriefing: "qu\'avez-vous ressenti ?"', duration_minutes: 10, description: 'Partage des émotions', order: 8 },
    ],
  },
  {
    id: 'debutant-virements',
    title: 'Débutant - Virements',
    description: 'Maîtriser le virement de bord',
    category: 'niveau',
    icon: '🔰',
    duration_minutes: 125,
    level: 'Débutant',
    tags: ['débutant', 'virements', 'technique'],
    steps: [
      { title: 'Rappel allures + démonstration terre', duration_minutes: 10, description: 'Révision et démonstration', order: 1 },
      { title: 'Échauffement: navigation libre', duration_minutes: 10, description: 'Prise en main libre', order: 2 },
      { title: 'Exercice 1: virements en binôme', duration_minutes: 20, description: 'Un guide, un apprend', order: 3 },
      { title: 'Exercice 2: parcours en triangle', duration_minutes: 30, description: 'Virements sur parcours', order: 4 },
      { title: 'Pause: observation direction du vent', duration_minutes: 10, description: 'Comprendre le vent et les oiseaux', order: 5 },
      { title: 'Exercice 3: "vire quand je siffle"', duration_minutes: 20, description: 'Réactivité et précision', order: 6 },
      { title: 'Mini-régate virements', duration_minutes: 15, description: 'Mise en situation compétitive', order: 7 },
      { title: 'Débriefing technique', duration_minutes: 10, description: 'Analyse des virements', order: 8 },
    ],
  },
  {
    id: 'intermediaire-perfectionnement',
    title: 'Intermédiaire - Perfectionnement',
    description: 'Autonomie et précision',
    category: 'niveau',
    icon: '⚡',
    duration_minutes: 150,
    level: 'Intermédiaire',
    tags: ['intermédiaire', 'perfectionnement', 'autonomie'],
    steps: [
      { title: 'Brief: objectifs individualisés', duration_minutes: 15, description: 'Objectifs personnalisés par élève', order: 1 },
      { title: 'Exercice réglages: manches à air', duration_minutes: 25, description: 'Optimisation des réglages', order: 2 },
      { title: 'Parcours technique avec contraintes', duration_minutes: 40, description: 'Parcours avec difficultés imposées', order: 3 },
      { title: 'Module éco: navigation en zone herbiers', duration_minutes: 20, description: 'Sensibilisation écosystèmes fragiles', order: 4 },
      { title: 'Travail en duo: coaching mutuel', duration_minutes: 30, description: 'Entraide et analyse', order: 5 },
      { title: 'Débriefing + analyse vidéo', duration_minutes: 20, description: 'Retour avec support vidéo', order: 6 },
    ],
  },
  {
    id: 'avance-competition',
    title: 'Avancé - Compétition',
    description: 'Performance et tactique',
    category: 'niveau',
    icon: '🏆',
    duration_minutes: 150,
    level: 'Avancé',
    tags: ['avancé', 'compétition', 'performance'],
    steps: [
      { title: 'Analyse météo détaillée', duration_minutes: 15, description: 'Étude approfondie des conditions', order: 1 },
      { title: 'Échauffement intensif', duration_minutes: 15, description: 'Préparation physique et technique', order: 2 },
      { title: 'Simulation départ de régate', duration_minutes: 30, description: 'Entraînement aux départs', order: 3 },
      { title: 'Parcours chronométré', duration_minutes: 45, description: 'Parcours en conditions réelles', order: 4 },
      { title: 'Module éco: trajectoires éco-responsables', duration_minutes: 15, description: 'Optimisation écologique du parcours', order: 5 },
      { title: 'Débriefing tactique + analyse', duration_minutes: 30, description: 'Analyse stratégique approfondie', order: 6 },
    ],
  },
];

// ============================================================================
// TEMPLATES PAR THÈME TECHNIQUE
// ============================================================================

export const TEMPLATES_THEME: SessionTemplate[] = [
  {
    id: 'theme-allures',
    title: 'Les Allures',
    description: 'Maîtriser toutes les allures',
    category: 'theme',
    icon: '🧭',
    duration_minutes: 115,
    tags: ['allures', 'technique', 'base'],
    steps: [
      { title: 'Brief: schéma des allures', duration_minutes: 10, description: 'Explication théorique', order: 1 },
      { title: 'Exercice "feu rouge": changer d\'allure au signal', duration_minutes: 20, description: 'Réactivité aux changements', order: 2 },
      { title: 'Parcours imposé: toutes les allures', duration_minutes: 30, description: 'Près → travers → largue → vent arrière', order: 3 },
      { title: 'Pause éco: pourquoi les oiseaux volent face au vent', duration_minutes: 10, description: 'Observation et compréhension', order: 4 },
      { title: 'Jeu: "Jacques a dit une allure"', duration_minutes: 15, description: 'Apprentissage ludique', order: 5 },
      { title: 'Navigation libre avec consignes', duration_minutes: 20, description: 'Pratique autonome', order: 6 },
      { title: 'Quiz débriefing', duration_minutes: 10, description: 'Vérification des acquis', order: 7 },
    ],
  },
  {
    id: 'theme-virements-empannages',
    title: 'Virements & Empannages',
    description: 'Maîtriser les changements de bord',
    category: 'theme',
    icon: '🔄',
    duration_minutes: 125,
    tags: ['virements', 'empannages', 'manœuvres'],
    steps: [
      { title: 'Démonstration commentée par le moniteur', duration_minutes: 10, description: 'Explication détaillée', order: 1 },
      { title: 'Exercice terre: mimétique sans bateau', duration_minutes: 5, description: 'Gestuelle à terre', order: 2 },
      { title: 'Virements en ligne, un par un', duration_minutes: 25, description: 'Pratique progressive', order: 3 },
      { title: 'Empannages en sécurité', duration_minutes: 25, description: 'Apprentissage sécurisé', order: 4 },
      { title: 'Pause: observation changement de cap des bateaux', duration_minutes: 10, description: 'Observation et analyse', order: 5 },
      { title: 'Parcours libre avec comptage', duration_minutes: 25, description: 'Comptage des manœuvres réussies', order: 6 },
      { title: 'Débriefing: points communs/différences', duration_minutes: 15, description: 'Analyse comparative', order: 7 },
    ],
  },
];

// ============================================================================
// EXPORT GLOBAL
// ============================================================================

export const ALL_TEMPLATES: SessionTemplate[] = [
  ...TEMPLATES_DUREE,
  ...TEMPLATES_NIVEAU,
  ...TEMPLATES_THEME,
];

export const TEMPLATE_CATEGORIES = [
  { id: 'duree', label: 'Par durée', icon: '⏱️' },
  { id: 'niveau', label: 'Par niveau', icon: '📊' },
  { id: 'theme', label: 'Par thème', icon: '🎯' },
  { id: 'meteo', label: 'Par météo', icon: '🌤️' },
  { id: 'support', label: 'Par support', icon: '⛵' },
  { id: 'eco', label: 'Module éco', icon: '🌿' },
  { id: 'special', label: 'Spéciaux', icon: '⭐' },
] as const;

