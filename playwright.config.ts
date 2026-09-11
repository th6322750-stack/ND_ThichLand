// tests/visual/capture.ts is a standalone screenshot harness run directly via
// tsx, not through the Playwright Test runner.
//
// Task 14.2 split the single e2e runtime into three explicit, incompatible
// modes that must never be mixed: playwright.mock.config.ts (fixture/local
// UX, `next dev`), playwright.failclosed.config.ts (production build with
// no secrets), and playwright.live.config.ts (reserved for real Google
// secrets — not runnable yet). This file is the default `npx playwright
// test` (no -c flag) falls back to — kept as a thin re-export of the mock
// config so that historical/muscle-memory usage still does something safe.
export { default } from "./playwright.mock.config";
