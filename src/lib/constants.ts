export const CACHE_TIMES = {
  STALE_TIME: 1000 * 60 * 2, // 2 minutes
  GC_TIME: 1000 * 60 * 10, // 10 minutes
  DEFAULT_STALE_TIME: 1000 * 60, // 1 minute
  DEFAULT_GC_TIME: 1000 * 60 * 5, // 5 minutes
} as const;

export const RETRY_CONFIG = {
  MAX_RETRIES: 3,
  MUTATION_RETRIES: 1,
  RETRY_DELAY: (attemptIndex: number) =>
    Math.min(1000 * 2 ** attemptIndex, 30000),
} as const;

export const DEBOUNCE_TIMES = {
  SUBSCRIPTION_INVALIDATION: 500, // ms
  TOAST_DURATION: 5000, // ms
} as const;
