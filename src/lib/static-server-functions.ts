/**
 * Static server functions are build-time snapshots cached as static JSON.
 * Keep router data fresh forever because client refetches cannot produce
 * newer data until the next deployment refreshes the generated assets.
 */
export const STATIC_SERVER_FUNCTION_STALE_TIME = Number.POSITIVE_INFINITY;
