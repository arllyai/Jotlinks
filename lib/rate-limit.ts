type Entry = {
  count: number;
  expiresAt: number;
};

const globalForRateLimit = globalThis as unknown as {
  __rateLimitStore?: Map<string, Entry>;
};

const store = globalForRateLimit.__rateLimitStore ?? new Map<string, Entry>();

if (!globalForRateLimit.__rateLimitStore) {
  globalForRateLimit.__rateLimitStore = store;
}

export function rateLimit({
  key,
  limit,
  windowMs,
}: {
  key: string;
  limit: number;
  windowMs: number;
}) {
  const now = Date.now();
  const existing = store.get(key);

  if (!existing || existing.expiresAt < now) {
    store.set(key, {
      count: 1,
      expiresAt: now + windowMs,
    });

    return {
      success: true,
      remaining: limit - 1,
      retryAfterMs: windowMs,
    };
  }

  if (existing.count >= limit) {
    return {
      success: false,
      remaining: 0,
      retryAfterMs: existing.expiresAt - now,
    };
  }

  existing.count += 1;
  store.set(key, existing);

  return {
    success: true,
    remaining: limit - existing.count,
    retryAfterMs: existing.expiresAt - now,
  };
}
