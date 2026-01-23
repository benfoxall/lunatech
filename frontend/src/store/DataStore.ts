/**
 * Centralized data store that abstracts loading from IndexedDB and syncing with APIs.
 * Provides a single source of truth for position data across the application.
 */

interface Position {
  time: number;
  location: [number, number];
  pos_uncertainty: number;
  duration: number;
}

interface CachedData {
  trackerId: string;
  positions: Position[];
  lastSync: number;
  from: string;
  to: string;
}

const DB_NAME = 'lunatech_db';
const DB_VERSION = 1;
const STORE_NAME = 'positions';
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

export class DataStore {
  private db: IDBDatabase | null = null;
  private listeners: Set<(data: Position[]) => void> = new Set();
  private currentData: Position[] = [];

  /**
   * Initialize the IndexedDB database
   */
  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const objectStore = db.createObjectStore(STORE_NAME, { keyPath: 'trackerId' });
          objectStore.createIndex('lastSync', 'lastSync', { unique: false });
        }
      };
    });
  }

  /**
   * Subscribe to data changes
   */
  subscribe(listener: (data: Position[]) => void): () => void {
    this.listeners.add(listener);
    // Immediately call with current data
    if (this.currentData.length > 0) {
      listener(this.currentData);
    }
    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Notify all listeners of data changes
   */
  private notify(data: Position[]): void {
    this.currentData = data;
    this.listeners.forEach(listener => listener(data));
  }

  /**
   * Get cached data from IndexedDB
   */
  private async getCached(trackerId: string): Promise<CachedData | null> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const objectStore = transaction.objectStore(STORE_NAME);
      const request = objectStore.get(trackerId);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const result = request.result;
        if (result && Date.now() - result.lastSync < CACHE_DURATION) {
          resolve(result);
        } else {
          resolve(null);
        }
      };
    });
  }

  /**
   * Store data in IndexedDB
   */
  private async setCached(data: CachedData): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const objectStore = transaction.objectStore(STORE_NAME);
      const request = objectStore.put(data);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  /**
   * Fetch data from API
   */
  private async fetchFromAPI(trackerId: string, from?: Date, to?: Date): Promise<Position[]> {
    const url = new URL(`/api/tracker/${trackerId}/positions`, window.location.origin);
    
    if (from) {
      url.searchParams.set('from', from.toISOString());
    }
    if (to) {
      url.searchParams.set('to', to.toISOString());
    }

    const response = await fetch(url.toString());
    
    if (!response.ok) {
      throw new Error(`Failed to fetch positions: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Flatten if nested array structure
    const positions = Array.isArray(data[0]) ? data.flat() : data;
    
    // Filter out high uncertainty points
    return positions.filter((p: Position) => p.pos_uncertainty < 50);
  }

  /**
   * Load positions for a tracker, using cache when available
   */
  async loadPositions(
    trackerId: string, 
    from?: Date, 
    to?: Date,
    forceRefresh = false
  ): Promise<Position[]> {
    try {
      // Check cache first unless force refresh
      if (!forceRefresh) {
        const cached = await this.getCached(trackerId);
        if (cached) {
          this.notify(cached.positions);
          return cached.positions;
        }
      }

      // Fetch from API
      const positions = await this.fetchFromAPI(trackerId, from, to);

      // Cache the result
      await this.setCached({
        trackerId,
        positions,
        lastSync: Date.now(),
        from: from?.toISOString() || '',
        to: to?.toISOString() || '',
      });

      // Notify listeners
      this.notify(positions);

      return positions;
    } catch (error) {
      console.error('Failed to load positions:', error);
      throw error;
    }
  }

  /**
   * Clear all cached data
   */
  async clearCache(): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const objectStore = transaction.objectStore(STORE_NAME);
      const request = objectStore.clear();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.currentData = [];
        this.notify([]);
        resolve();
      };
    });
  }

  /**
   * Get current data without fetching
   */
  getCurrentData(): Position[] {
    return this.currentData;
  }
}

// Export singleton instance
export const dataStore = new DataStore();
