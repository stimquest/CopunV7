

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

export interface Theme extends Etage { }


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
