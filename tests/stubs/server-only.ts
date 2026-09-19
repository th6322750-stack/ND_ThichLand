// vitest runs modules outside Next.js's "react-server" bundler condition, so
// the real `server-only` package (which unconditionally throws) can't be
// imported as-is in tests. This alias (see vitest.config.ts) swaps it for a
// no-op so server-only modules stay testable without weakening the real
// Next.js build-time guard, which still uses the actual package.
export {};
