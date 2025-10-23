'use client';

import { supabaseOffline } from '@/lib/supabase-offline';
import type { Stage, Sortie, PedagogicalContent, Game } from '@/lib/types';

/**
 * Client-side offline-aware data fetching functions
 * These functions use the offline cache when the app is offline
 */

export async function getStagesOfflineAware(): Promise<Stage[]> {
  try {
    const { data, error } = await supabaseOffline.getStages();
    if (error) {
      console.error('Error fetching stages:', error);
      return [];
    }
    return data || [];
  } catch (error) {
    console.error('Error fetching stages:', error);
    return [];
  }
}

export async function getStageByIdOfflineAware(id: number): Promise<Stage | null> {
  try {
    const { data, error } = await supabaseOffline.getStage(id.toString());
    if (error) {
      console.error('Error fetching stage:', error);
      return null;
    }
    return data || null;
  } catch (error) {
    console.error('Error fetching stage:', error);
    return null;
  }
}

export async function getSortiesForStageOfflineAware(stageId: number): Promise<Sortie[]> {
  try {
    const { data, error } = await supabaseOffline.getSorties(stageId);
    if (error) {
      console.error('Error fetching sorties:', error);
      return [];
    }
    return (data || []).map(s => ({
      ...s,
      selected_notions: s.selected_notions || { niveau: 0, comprendre: 0, observer: 0, proteger: 0 },
      selected_content: s.selected_content || {},
    }));
  } catch (error) {
    console.error('Error fetching sorties:', error);
    return [];
  }
}

export async function getPedagogicalContentOfflineAware(): Promise<PedagogicalContent[]> {
  try {
    const { data, error } = await supabaseOffline.getPedagogicalContent();
    if (error) {
      console.error('Error fetching pedagogical content:', error);
      return [];
    }
    return data || [];
  } catch (error) {
    console.error('Error fetching pedagogical content:', error);
    return [];
  }
}

export async function getGamesOfflineAware(): Promise<Game[]> {
  try {
    const { data, error } = await supabaseOffline.getGames();
    if (error) {
      console.error('Error fetching games:', error);
      return [];
    }
    return data || [];
  } catch (error) {
    console.error('Error fetching games:', error);
    return [];
  }
}

