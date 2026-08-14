import { describe, it, expect, afterEach } from "vitest";
import { resolveProviderMode } from "@/lib/server/providerMode";

// @types/node marks NODE_ENV readonly on process.env — this is the standard
// escape hatch for tests that legitimately need to simulate other modes.
const env = process.env as Record<string, string | undefined>;

const originalVitest = env.VITEST;
const originalNodeEnv = env.NODE_ENV;

function restoreEnv() {
  env.VITEST = originalVitest;
  env.NODE_ENV = originalNodeEnv;
}

describe("resolveProviderMode", () => {
  afterEach(restoreEnv);

  it("always resolves to live when configured, regardless of environment", () => {
    expect(resolveProviderMode(true)).toBe("live");
  });

  it("NODE_ENV=test -> mock allowed when not configured", () => {
    env.NODE_ENV = "test";
    expect(resolveProviderMode(false)).toBe("mock");
  });

  it("VITEST=true (automated test run) -> mock allowed even if NODE_ENV says production", () => {
    env.VITEST = "true";
    env.NODE_ENV = "production";
    expect(resolveProviderMode(false)).toBe("mock");
  });

  it("local development (NODE_ENV=development, not configured) -> mock allowed", () => {
    delete env.VITEST;
    env.NODE_ENV = "development";
    expect(resolveProviderMode(false)).toBe("mock");
  });

  it("production + missing config -> unavailable (no fixture publishing, no fake success)", () => {
    delete env.VITEST;
    env.NODE_ENV = "production";
    expect(resolveProviderMode(false)).toBe("unavailable");
  });
});
