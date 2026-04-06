interface CacheEntry {
  value: unknown;
  expires: number;
}

const DEFAULT_TTL = 5 * 60 * 1000;
const MAX_ENTRIES = 200;

const cache = new Map<string, CacheEntry>();

function evictExpired(): void {
  const now = Date.now();
  cache.forEach((entry, key) => {
    if (now > entry.expires) {
      cache.delete(key);
    }
  });
}

export function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expires) {
    cache.delete(key);
    return null;
  }
  return entry.value as T;
}

export function setCache(key: string, value: unknown, ttl = DEFAULT_TTL): void {
  if (cache.size >= MAX_ENTRIES) {
    evictExpired();
  }
  if (cache.size >= MAX_ENTRIES) {
    const oldestKey = cache.keys().next().value;
    if (oldestKey) cache.delete(oldestKey);
  }
  cache.set(key, { value, expires: Date.now() + ttl });
}

export function tokenPrefix(token: string): string {
  return token.slice(0, 8);
}
