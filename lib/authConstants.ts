// Plain constants (no secrets) shared between server-only auth code and
// proxy.ts, which runs outside the "server-only" bundler boundary.
export const SESSION_COOKIE_NAME = "ndthich_admin_session";
export const SESSION_MAX_AGE_DEFAULT_SECONDS = 8 * 60 * 60;
export const SESSION_MAX_AGE_REMEMBER_SECONDS = 30 * 24 * 60 * 60;
