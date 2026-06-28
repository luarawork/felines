// In-memory rate limiter for report submissions (see app/api/reports/route.ts).
// Lives only in the memory of whichever server process handles the
// request, so counts reset if that process restarts/recycles — a
// persistent store (a database table, Redis) would survive that, but
// is more infrastructure than a hackathon-scale anti-spam guard needs.
// Good enough to stop a single abusive client from flooding the map in
// a short window, which is the actual goal here.
type RateLimitEntry = { count: number; windowStart: number };

const WINDOW_MS = 60 * 60 * 1000; // 1 hour

export const RATE_LIMITS = {
  anonymous: 10,
  authenticated: 30,
} as const;

const buckets = new Map<string, RateLimitEntry>();

// Drops expired buckets occasionally so this Map doesn't grow forever
// in a long-lived process. Cheap enough to run on every check.
function pruneExpired(now: number) {
  for (const [key, entry] of buckets) {
    if (now - entry.windowStart > WINDOW_MS) buckets.delete(key);
  }
}

export function checkRateLimit(
  key: string,
  isAuthenticated: boolean
): { allowed: boolean; remaining: number } {
  const limit = isAuthenticated ? RATE_LIMITS.authenticated : RATE_LIMITS.anonymous;
  const now = Date.now();
  pruneExpired(now);

  const entry = buckets.get(key);

  if (!entry || now - entry.windowStart > WINDOW_MS) {
    buckets.set(key, { count: 1, windowStart: now });
    return { allowed: true, remaining: limit - 1 };
  }

  if (entry.count >= limit) {
    return { allowed: false, remaining: 0 };
  }

  entry.count += 1;
  return { allowed: true, remaining: limit - entry.count };
}
