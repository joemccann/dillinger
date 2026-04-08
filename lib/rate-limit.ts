interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

export async function rateLimit(
  keyId: string,
  limit = 100,
  windowSec = 3600
): Promise<RateLimitResult> {
  const now = Math.floor(Date.now() / 1000);
  const window = Math.floor(now / windowSec);
  const redisKey = `rl:${keyId}:${window}`;
  const reset = (window + 1) * windowSec;

  try {
    const { kv } = await import("@vercel/kv");
    const count = await kv.incr(redisKey);
    if (count === 1) {
      await kv.expire(redisKey, windowSec);
    }
    return {
      success: count <= limit,
      limit,
      remaining: Math.max(0, limit - count),
      reset,
    };
  } catch {
    return { success: true, limit, remaining: limit, reset };
  }
}

export function rateLimitHeaders(
  result: RateLimitResult
): Record<string, string> {
  return {
    "X-RateLimit-Limit": String(result.limit),
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": String(result.reset),
  };
}
