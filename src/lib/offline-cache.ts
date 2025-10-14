'use client';

interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiry?: number;
}

class OfflineCache {
  private prefix = 'copun_cache_';
  private defaultExpiry = 24 * 60 * 60 * 1000; // 24 hours

  set<T>(key: string, data: T, expiry?: number): void {
    try {
      const item: CacheItem<T> = {
        data,
        timestamp: Date.now(),
        expiry: expiry || this.defaultExpiry,
      };
      localStorage.setItem(this.prefix + key, JSON.stringify(item));
    } catch (error) {
      console.error('Error saving to cache:', error);
    }
  }

  get<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(this.prefix + key);
      if (!item) return null;

      const cached: CacheItem<T> = JSON.parse(item);
      
      // Check if expired
      if (cached.expiry && Date.now() - cached.timestamp > cached.expiry) {
        this.remove(key);
        return null;
      }

      return cached.data;
    } catch (error) {
      console.error('Error reading from cache:', error);
      return null;
    }
  }

  remove(key: string): void {
    try {
      localStorage.removeItem(this.prefix + key);
    } catch (error) {
      console.error('Error removing from cache:', error);
    }
  }

  clear(): void {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.prefix)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }

  // Cache specific data types
  cacheStages(stages: any[]): void {
    this.set('stages', stages);
  }

  getCachedStages(): any[] | null {
    return this.get('stages');
  }

  cacheStage(stageId: string, stage: any): void {
    this.set(`stage_${stageId}`, stage);
  }

  getCachedStage(stageId: string): any | null {
    return this.get(`stage_${stageId}`);
  }

  cacheGames(games: any[]): void {
    this.set('games', games);
  }

  getCachedGames(): any[] | null {
    return this.get('games');
  }

  cacheGame(gameId: string, game: any): void {
    this.set(`game_${gameId}`, game);
  }

  getCachedGame(gameId: string): any | null {
    return this.get(`game_${gameId}`);
  }

  cacheGameCards(cards: any[]): void {
    this.set('game_cards', cards);
  }

  getCachedGameCards(): any[] | null {
    return this.get('game_cards');
  }

  // Queue for offline actions
  queueOfflineAction(action: any): void {
    const queue = this.get<any[]>('offline_queue') || [];
    queue.push({
      ...action,
      timestamp: Date.now(),
      id: Date.now().toString(),
    });
    this.set('offline_queue', queue);
  }

  getOfflineQueue(): any[] {
    return this.get('offline_queue') || [];
  }

  clearOfflineQueue(): void {
    this.remove('offline_queue');
  }

  removeFromQueue(actionId: string): void {
    const queue = this.getOfflineQueue();
    const filtered = queue.filter(action => action.id !== actionId);
    this.set('offline_queue', filtered);
  }
}

export const offlineCache = new OfflineCache();
