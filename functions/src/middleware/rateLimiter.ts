import { AppError } from "./errorHandler";

interface RateLimitRecord {
  count: number;
  resetTimestampMs: number;
}

const DAILY_FARMER_LIMIT = 10;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

const farmerRateLimitStore = new Map<string, RateLimitRecord>();

/**
 * Rate Limiting per Farmer (10 calls per farmer per day)
 */
export function applyFarmerRateLimit(farmerId: string): { remaining: number; currentCount: number } {
  const id = farmerId || "farmer-01";
  const now = Date.now();
  let record = farmerRateLimitStore.get(id);

  if (!record || now >= record.resetTimestampMs) {
    record = {
      count: 0,
      resetTimestampMs: now + ONE_DAY_MS,
    };
  }

  if (record.count >= DAILY_FARMER_LIMIT) {
    const hoursRemaining = Math.ceil((record.resetTimestampMs - now) / (60 * 60 * 1000));
    throw new AppError(
      `Daily Sentinel Hub API quota exceeded. You have reached the limit of ${DAILY_FARMER_LIMIT} satellite analysis calls per day for this farmer profile. Resets in ~${hoursRemaining} hours.`,
      429,
      "RATE_LIMIT_EXCEEDED",
      { limit: DAILY_FARMER_LIMIT, currentCount: record.count, resetTimestampMs: record.resetTimestampMs }
    );
  }

  record.count += 1;
  farmerRateLimitStore.set(id, record);

  return {
    remaining: DAILY_FARMER_LIMIT - record.count,
    currentCount: record.count,
  };
}
