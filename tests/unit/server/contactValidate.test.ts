import { describe, it, expect } from "vitest";
import { normalizeVietnamesePhone, validateContactForm } from "@/lib/server/contact/validate";

describe("normalizeVietnamesePhone", () => {
  it("accepts a standard 10-digit mobile number", () => {
    expect(normalizeVietnamesePhone("0912345678")).toBe("0912345678");
  });

  it("normalizes a +84-prefixed number", () => {
    expect(normalizeVietnamesePhone("+84912345678")).toBe("0912345678");
  });

  it("normalizes an 84-prefixed number without a plus", () => {
    expect(normalizeVietnamesePhone("84912345678")).toBe("0912345678");
  });

  it("strips spaces, dots, dashes, and parens", () => {
    expect(normalizeVietnamesePhone("091 234 5678")).toBe("0912345678");
    expect(normalizeVietnamesePhone("091.234.5678")).toBe("0912345678");
    expect(normalizeVietnamesePhone("(091) 234-5678")).toBe("0912345678");
  });

  it("rejects a non-phone string", () => {
    expect(normalizeVietnamesePhone("abc")).toBeNull();
  });

  it("rejects a too-short number", () => {
    expect(normalizeVietnamesePhone("012345")).toBeNull();
  });
});

describe("validateContactForm", () => {
  const base = { name: "Nguyễn Văn A", phone: "0912345678", need: "", area: "", message: "" };

  it("passes with only the required fields", () => {
    const result = validateContactForm(base);
    expect(result.errors).toEqual({});
    expect(result.value?.phone).toBe("0912345678");
  });

  it("trims whitespace from every field", () => {
    const result = validateContactForm({ ...base, name: "  Nguyễn Văn A  ", need: "  Thuê nhà  " });
    expect(result.value?.name).toBe("Nguyễn Văn A");
    expect(result.value?.need).toBe("Thuê nhà");
  });

  it("flags an empty name and an empty phone", () => {
    const result = validateContactForm({ ...base, name: "", phone: "" });
    expect(result.errors.name).toBeDefined();
    expect(result.errors.phone).toBeDefined();
    expect(result.value).toBeUndefined();
  });
});
