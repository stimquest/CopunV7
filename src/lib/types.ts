

import type { LucideIcon } from 'lucide-react';
import type { Database, Json } from './database.types';

export type CardPriority = 'essential' | 'complementary' | 'personal';
export type CardStatus = 'validated' | 'draft';
export const cardTypes = ["Question", "Ressource"] as const;
export type CardType = typeof cardTypes[number];

export interface GrandTheme {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
}

export interface GrandThemeGroup {
    label: string;
    themes: GrandTheme[];
}

// This represents the structure the frontend uses, which is built from PedagogicalContent
export interface ContentCard {
  id: string;
  option_id: string; 
  question: string;
  answer: string;
  image?: string | null;
  "data-ai-hint"?: string | null;
  priority: CardPriority; 
  status: CardStatus;
  type: CardType | null; 
  duration: number;
  tags_theme: string[]; 
  tags_filtre: string[];
  niveau: number;
  tags: string[];
  tip?: string;
}

export type PedagogicalContent = Database['public']['Tables']['pedagogical_content']['Row'];


export interface Option {
  id: string;
  etage_id: string;
  label: string;
  tip: string;
  duration: number | null;
  group_size: string | null;
  safety: string[] | null;
  materials: string[] | null;
  order: number;
  contentCards: ContentCard[];
}

export interface Etage {
  id: string;
  title: string;
  icon: string;
  color: string;
  options: Option[];
}

export interface Theme extends Etage {}


export interface EtagesData {
  niveau: Etage;
  comprendre: Etage;
  observer: Etage;
  proteger: Etage;
  [key: string]: Etage;
}


export type SelectedNotions = {
  niveau: number;
  comprendre: number;
  observer: number;
  proteger: number;
  [key: string]: number;
};

export type SelectedContent = {
  program?: string[];
  themes?: string[];
  [optionId: string]: string[] | undefined; // Array of selected card IDs for each option
};

export type GroupProfile = {
  size: number;
  age: string;
  experience: string;
};

export type ContextData = {
  weather: { condition: string; wind: string; temp: string };
  tide: { current: string; high: string; coefficient: number };
  alerts: string[];
};

export interface Stage {
    id: number;
    created_at: string;
    title: string;
    type: string;
    participants: number;
    start_date: string; // YYYY-MM-DD
    end_date: string;   // YYYY-MM-DD
    sport_activity?: string | null; // e.g., "Voile", "Kayak", "Paddle"
    sport_level?: string | null; // e.g., "Débutant", "Intermédiaire", "Avancé"
    sport_description?: string | null; // Description of the sport activity
}

export interface Sortie {
    id: number;
    stage_id: number;
    created_at: string;
    date: string; // YYYY-MM-DD
    title: string;
    themes: string[];
    duration: number;
    summary: string;
    content: string;
    selected_notions: Partial<SelectedNotions>;
    selected_content: Partial<SelectedContent>;
}

// V8 Model - Sessions and Capsules
export interface Session {
    id: number;
    stage_id: number;
    title: string;
    description?: string | null;
    session_order: number;
    objectives?: string[] | null;
    success_criteria?: string[] | null;
    required_materials?: string[] | null;
    created_at: string;
    updated_at: string;
}

export interface SessionStructure {
    id: number;
    session_id: number;
    step_order: number;
    step_title: string;
    step_duration_minutes?: number | null;
    step_description?: string | null;
    created_at: string;
}

export interface EnvironmentModule {
    id: number;
    title: string;
    description?: string | null;
    duration_minutes?: number | null;
    level?: string | null; // 'débutant', 'intermédiaire', 'avancé'
    created_by: string;
    is_public: boolean;
    activity_types: string[];
    location_types: string[];
    themes: string[];
    season: string[];
    created_at: string;
    updated_at: string;
}

export interface ModuleContent {
    id: number;
    module_id: number;
    content_type: 'info' | 'question' | 'game' | 'defi' | 'tip';
    content_data: Record<string, any>;
    content_order: number;
    created_at: string;
}

export interface EnvironmentModuleWithContent extends EnvironmentModule {
    content: ModuleContent[];
}

export interface SessionModule {
    id: number;
    session_id: number;
    module_id: number;
    session_step_id?: number | null;
    module_order: number;
    custom_modifications?: Record<string, any> | null;
    created_at: string;
}

export type ObservationCategory = "Faune" | "Flore" | "Pollution" | "Phénomène inhabituel";

export interface Observation {
  id: number;
  created_at: string;
  title: string;
  description: string;
  category: ObservationCategory;
  observation_date: string; // YYYY-MM-DD
  latitude: number;
  longitude: number;
}

export interface Structure {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
}

// Types for Games
export type GameCardType = Database['public']['Enums']['game_card_type'];

interface BaseGameItem {
    id: number;
    theme: string;
    related_objective_id?: string; // Link to the pedagogical ContentCard (e.g. "q1")
}

export interface TriageItem extends BaseGameItem {
  statement: string;
  isTrue: boolean;
}

export interface MotsEnRafaleItem extends BaseGameItem {
  definition: string;
  answer: string;
}

export interface DilemmeDuMarinItem extends BaseGameItem {
  optionA: string;
  optionB: string;
  explanation: string;
}

export interface QuizzItem extends BaseGameItem {
  question: string;
  answers: string[];
  correctAnswerIndex: number;
}

export interface TriageCard extends TriageItem {
  type: 'triage';
}
export interface MotsEnRafaleCard extends MotsEnRafaleItem {
  type: 'mots';
}
export interface DilemmeDuMarinCard extends DilemmeDuMarinItem {
  type: 'dilemme';
}

export interface QuizzCard extends QuizzItem {
    type: 'quizz';
}

export type GameCard = TriageCard | MotsEnRafaleCard | DilemmeDuMarinCard | QuizzCard;

export type DbGameCardData = Omit<TriageItem, 'id'> | Omit<MotsEnRafaleItem, 'id'> | Omit<DilemmeDuMarinItem, 'id'> | Omit<QuizzItem, 'id'>;

export interface DbGameCard {
  id: number;
  created_at: string;
  type: GameCardType;
  data: Json;
}


export interface GameData {
  triageCôtier: {
    title: string;
    instruction: string;
    items: TriageItem[];
  };
  motsEnRafale: {
    title: string;
    instruction: string;
    items: MotsEnRafaleItem[];
  };
  dilemmeDuMarin: {
    title: string;
    instruction: string;
    items: DilemmeDuMarinItem[];
  };
  leGrandQuizz: {
    title: string;
    instruction: string;
    items: QuizzItem[];
  };
}

export interface Game {
    id: number;
    created_at: string;
    title: string;
    theme: string;
    game_data: GameData;
    stage_id: number | null;
}

// Program Builder specific types
export type ProgramAxe = Etage & { id: keyof Omit<EtagesData, 'niveau'> };
export type ProgramSelections = { [axeId: string]: number | undefined };


// Badge / Gamification types
export type BadgeId = 'badge_maitre_du_programme' | 'badge_animateur_pedagogique';

export interface BadgeInfo {
    id: BadgeId;
    title: string;
    description: string;
    unlocked: boolean;
}

// Formation / Quiz types
export type QuizAttempt = Database['public']['Tables']['quiz_attempts']['Row'];

// Progression types (Stage-specific)
export type StageObjectiveCompletion = Database['public']['Tables']['stage_objectives_completion']['Row'];
export type StageGameHistory = Database['public']['Tables']['stage_game_history']['Row'];

// --- Defis & Exploits ---
export type DefiStatus = 'en_cours' | 'complete';
export type DefiProofType = 'checkbox' | 'photo' | 'action' | 'quiz';
export type StageType = 'Hebdomadaire' | 'Journée' | 'Libre' | 'annuel' | 'scolaire';

export interface Defi {
    id: string;
    description: string;
    instruction: string;
    stage_type: StageType[];
    type_preuve: DefiProofType;
    icon: string;
    tags_theme: string[];
}

export interface AssignedDefi {
    id: number; // Unique ID for this specific assignment instance
    stage_id: number;
    defi_id: string;
    status: DefiStatus;
    completed_at: string | null;
    preuve_url: string | null;
}

export type ExploitCondition = {
    defi_id: string;
    count: number;
};

export interface Exploit {
  id: string;
  title: string;
  description: string;
  condition: ExploitCondition;
  icon: string;
}

// For stage list display
export interface ThemeScore {
    correct: number;
    total: number;
}
export interface GameProgress {
    averageScore: number;
    themeScores: Record<string, ThemeScore>;
}
export interface DefiProgress {
    completed: number;
    total: number;
}

// ============================================================================
// NEW TYPES FOR V8: SESSIONS AND ENVIRONMENT CAPSULES
// ============================================================================

// Session types
export interface Session {
    id: number;
    stage_id: number;
    title: string;
    description: string | null;
    session_order: number;
    created_at: string;
    updated_at: string;
}

export interface SessionStructure {
    id: number;
    session_id: number;
    step_order: number;
    step_title: string;
    step_duration_minutes: number | null;
    step_description: string | null;
    created_at: string;
}

// Filter types for module discovery
export interface ModuleFilters {
    activity_types?: string[];
    location_types?: string[];
    themes?: string[];
    season?: string[];
    level?: string;
    duration_min?: number;
    duration_max?: number;
    search?: string;
}

// Backward compatibility aliases
export type EnvironmentCapsule = EnvironmentModule;
export type CapsuleContent = ModuleContent;
export type EnvironmentCapsuleWithContent = EnvironmentModuleWithContent;
export type SessionCapsule = SessionModule;
export type CapsuleFilters = ModuleFilters;
export type CapsuleContentType = 'info' | 'question' | 'game' | 'defi' | 'tip';
