import { describe, it, expect, afterEach } from "vitest";
import { getZaloUrl, getZaloHref } from "@/lib/zalo";

describe("Zalo config helper", () => {
  afterEach(() => {
    delete process.env.NEXT_PUBLIC_ZALO_URL;
  });

  it("falls back to the hotline tel: link when NEXT_PUBLIC_ZALO_URL is unset", () => {
    expect(getZaloUrl()).toBeNull();
    expect(getZaloHref()).toBe("tel:0986602203");
  });

  it("falls back when NEXT_PUBLIC_ZALO_URL is only whitespace", () => {
    process.env.NEXT_PUBLIC_ZALO_URL = "   ";
    expect(getZaloUrl()).toBeNull();
    expect(getZaloHref()).toBe("tel:0986602203");
  });

  it("uses the configured URL once NEXT_PUBLIC_ZALO_URL is set", () => {
    process.env.NEXT_PUBLIC_ZALO_URL = "https://zalo.me/example";
    expect(getZaloUrl()).toBe("https://zalo.me/example");
    expect(getZaloHref()).toBe("https://zalo.me/example");
  });
});
