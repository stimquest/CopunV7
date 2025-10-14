

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
  [optionId: string]: string[]; // Array of selected card IDs for each option
  program?: string[];
  themes?: string[];
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
