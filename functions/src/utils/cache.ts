interface CacheEntry<T> {
  data: T;
  cachedAtMs: number;
}

const MEMORY_TTL_MS = 60 * 60 * 1000; // 1 Hour TTL
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000; // 30 Days

const inMemoryCache = new Map<string, CacheEntry<any>>();

export function getFromMemoryCache<T>(key: string): { data: T | null; isHit: boolean } {
  const entry = inMemoryCache.get(key);
  if (!entry) return { data: null, isHit: false };

  const age = Date.now() - entry.cachedAtMs;
  if (age > MEMORY_TTL_MS) {
    inMemoryCache.delete(key);
    return { data: null, isHit: false };
  }

  return { data: entry.data, isHit: true };
}

export function setToMemoryCache<T>(key: string, data: T): void {
  inMemoryCache.set(key, { data, cachedAtMs: Date.now() });
}

export function get30DayCachedEstimate<T extends { landId: string; computedAt: string; sentinelHubRequestId?: string }>(
  landId: string,
  existingEstimates: T[]
): T | null {
  if (!existingEstimates || existingEstimates.length === 0) return null;

  const now = Date.now();
  const validRecord = existingEstimates.find((est) => {
    if (est.landId !== landId) return false;
    const computedTime = new Date(est.computedAt).getTime();
    if (isNaN(computedTime)) return false;

    const isWithin30Days = now - computedTime <= THIRTY_DAYS_MS;
    const hasValidRequestId = Boolean(
      est.sentinelHubRequestId &&
        typeof est.sentinelHubRequestId === "string" &&
        est.sentinelHubRequestId.trim().length > 0
    );

    return isWithin30Days && hasValidRequestId;
  });

  return validRecord || null;
}
