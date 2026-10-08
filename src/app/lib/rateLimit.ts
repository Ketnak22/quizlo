interface RateLimitOptions {
  maxRequests: number;
  windowMs: number;
}

type RateLimitResult = { allowed: true } | { allowed: false; retryAfterSeconds: number };

/**
 * Fixed-window, in-memory rate limiter. State is per server instance, so on serverless hosting it
 * slows down abuse rather than enforcing an exact global limit.
 */
export function createRateLimiter(
  { maxRequests, windowMs }: RateLimitOptions,
  now: () => number = Date.now,
) {
  const windows = new Map<string, { count: number; resetAt: number }>();

  return function checkRateLimit(key: string): RateLimitResult {
    const currentTime = now();

    // Expired entries are dropped so the map cannot grow with every IP ever seen.
    for (const [windowKey, window] of windows) {
      if (window.resetAt <= currentTime) windows.delete(windowKey);
    }

    const window = windows.get(key);
    if (!window) {
      windows.set(key, { count: 1, resetAt: currentTime + windowMs });
      return { allowed: true };
    }

    if (window.count >= maxRequests) {
      return { allowed: false, retryAfterSeconds: Math.ceil((window.resetAt - currentTime) / 1000) };
    }

    window.count += 1;
    return { allowed: true };
  };
}
