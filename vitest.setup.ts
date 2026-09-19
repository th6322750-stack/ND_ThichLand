import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// axe-core probes a canvas context to detect icon ligatures. JSDOM returns
// null for that API but also writes a noisy "Not implemented" stack trace;
// mirror the same null result without polluting otherwise-clean test output.
Object.defineProperty(HTMLCanvasElement.prototype, "getContext", {
  configurable: true,
  value: () => null,
});

afterEach(() => {
  cleanup();
});
