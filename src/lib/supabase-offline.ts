'use client';

import { supabase } from '@/lib/supabase';
import { offlineCache } from '@/lib/offline-cache';

export class SupabaseOffline {
  private isOnline(): boolean {
    return navigator.onLine;
  }

  async getStages() {
    try {
      if (this.isOnline()) {
        const { data, error } = await supabase
          .from('stages')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Cache the data
        if (data) {
          offlineCache.cacheStages(data);
        }

        return { data, error: null };
      } else {
        // Return cached data when offline
        const cachedData = offlineCache.getCachedStages();
        return { 
          data: cachedData, 
          error: cachedData ? null : new Error('Aucune donnée en cache') 
        };
      }
    } catch (error) {
      // Fallback to cache on error
      const cachedData = offlineCache.getCachedStages();
      return { 
        data: cachedData, 
        error: cachedData ? null : error 
      };
    }
  }

  async getStage(stageId: string) {
    try {
      if (this.isOnline()) {
        const { data, error } = await supabase
          .from('stages')
          .select('*')
          .eq('id', stageId)
          .single();

        if (error) throw error;

        // Cache the data
        if (data) {
          offlineCache.cacheStage(stageId, data);
        }

        return { data, error: null };
      } else {
        // Return cached data when offline
        const cachedData = offlineCache.getCachedStage(stageId);
        return { 
          data: cachedData, 
          error: cachedData ? null : new Error('Aucune donnée en cache') 
        };
      }
    } catch (error) {
      // Fallback to cache on error
      const cachedData = offlineCache.getCachedStage(stageId);
      return { 
        data: cachedData, 
        error: cachedData ? null : error 
      };
    }
  }

  async getGames() {
    try {
      if (this.isOnline()) {
        const { data, error } = await supabase
          .from('games')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Cache the data
        if (data) {
          offlineCache.cacheGames(data);
        }

        return { data, error: null };
      } else {
        // Return cached data when offline
        const cachedData = offlineCache.getCachedGames();
        return { 
          data: cachedData, 
          error: cachedData ? null : new Error('Aucune donnée en cache') 
        };
      }
    } catch (error) {
      // Fallback to cache on error
      const cachedData = offlineCache.getCachedGames();
      return { 
        data: cachedData, 
        error: cachedData ? null : error 
      };
    }
  }

  async getGameCards() {
    try {
      if (this.isOnline()) {
        const { data, error } = await supabase
          .from('game_cards')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Cache the data
        if (data) {
          offlineCache.cacheGameCards(data);
        }

        return { data, error: null };
      } else {
        // Return cached data when offline
        const cachedData = offlineCache.getCachedGameCards();
        return {
          data: cachedData,
          error: cachedData ? null : new Error('Aucune donnée en cache')
        };
      }
    } catch (error) {
      // Fallback to cache on error
      const cachedData = offlineCache.getCachedGameCards();
      return {
        data: cachedData,
        error: cachedData ? null : error
      };
    }
  }

  async getSorties(stageId: number) {
    try {
      if (this.isOnline()) {
        const { data, error } = await supabase
          .from('sorties')
          .select('*')
          .eq('stage_id', stageId)
          .order('date', { ascending: false });

        if (error) throw error;

        // Cache the data
        if (data) {
          offlineCache.cacheSorties(stageId, data);
        }

        return { data, error: null };
      } else {
        // Return cached data when offline
        const cachedData = offlineCache.getCachedSorties(stageId);
        return {
          data: cachedData,
          error: cachedData ? null : new Error('Aucune donnée en cache')
        };
      }
    } catch (error) {
      // Fallback to cache on error
      const cachedData = offlineCache.getCachedSorties(stageId);
      return {
        data: cachedData,
        error: cachedData ? null : error
      };
    }
  }

  async getPedagogicalContent() {
    try {
      if (this.isOnline()) {
        const { data, error } = await supabase
          .from('pedagogical_content')
          .select('*')
          .order('id');

        if (error) throw error;

        // Cache the data
        if (data) {
          offlineCache.cachePedagogicalContent(data);
        }

        return { data, error: null };
      } else {
        // Return cached data when offline
        const cachedData = offlineCache.getCachedPedagogicalContent();
        return {
          data: cachedData,
          error: cachedData ? null : new Error('Aucune donnée en cache')
        };
      }
    } catch (error) {
      // Fallback to cache on error
      const cachedData = offlineCache.getCachedPedagogicalContent();
      return {
        data: cachedData,
        error: cachedData ? null : error
      };
    }
  }

  // Queue actions for when back online
  async createStageOffline(stageData: any) {
    offlineCache.queueOfflineAction({
      type: 'CREATE_STAGE',
      data: stageData,
    });
    
    return { 
      data: { ...stageData, id: 'temp_' + Date.now() }, 
      error: null 
    };
  }

  async updateStageOffline(stageId: string, updates: any) {
    offlineCache.queueOfflineAction({
      type: 'UPDATE_STAGE',
      stageId,
      data: updates,
    });
    
    return { data: updates, error: null };
  }

  // Sync offline actions when back online
  async syncOfflineActions() {
    if (!this.isOnline()) return;

    const queue = offlineCache.getOfflineQueue();
    
    for (const action of queue) {
      try {
        switch (action.type) {
          case 'CREATE_STAGE':
            await supabase.from('stages').insert(action.data);
            break;
          case 'UPDATE_STAGE':
            await supabase.from('stages').update(action.data).eq('id', action.stageId);
            break;
          // Add more action types as needed
        }
        
        // Remove successful action from queue
        offlineCache.removeFromQueue(action.id);
      } catch (error) {
        console.error('Error syncing action:', action, error);
      }
    }
  }
}

export const supabaseOffline = new SupabaseOffline();
