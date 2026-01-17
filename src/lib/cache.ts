/**
 * Simple in-memory cache with TTL
 * Optimized for low traffic scenarios where server memory caching is sufficient
 */

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

class MemoryCache {
  private cache = new Map<string, CacheEntry<unknown>>();
  private defaultTTL: number;

  constructor(defaultTTLSeconds = 300) { // 5 minutes default
    this.defaultTTL = defaultTTLSeconds * 1000;
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;
    
    if (!entry) return null;
    
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }

  set<T>(key: string, data: T, ttlSeconds?: number): void {
    const ttl = ttlSeconds ? ttlSeconds * 1000 : this.defaultTTL;
    this.cache.set(key, {
      data,
      expiresAt: Date.now() + ttl,
    });
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear all cache entries or entries matching a prefix
   */
  clear(prefix?: string): void {
    if (!prefix) {
      this.cache.clear();
      return;
    }
    
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Get or fetch pattern - returns cached data or fetches fresh data
   */
  async getOrFetch<T>(
    key: string, 
    fetcher: () => Promise<T>, 
    ttlSeconds?: number
  ): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== null) {
      return cached;
    }
    
    const fresh = await fetcher();
    this.set(key, fresh, ttlSeconds);
    return fresh;
  }

  /**
   * Get cache stats for debugging
   */
  stats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

// Singleton cache instance
export const cache = new MemoryCache(300); // 5 minute TTL

// Cache keys constants
export const CACHE_KEYS = {
  CATEGORIES: 'categories',
  PRODUCTS: 'products',
  ADDONS: 'addons',
  CATEGORY: (slug: string) => `category:${slug}`,
  PRODUCTS_BY_CATEGORY: (categoryId: string) => `products:category:${categoryId}`,
} as const;
