import { beforeEach, describe, expect, it, vi } from "vitest";

const { getSessionMock, callClaudeMock } = vi.hoisted(() => ({
  getSessionMock: vi.fn(),
  callClaudeMock: vi.fn(),
}));

vi.mock("@/lib/server/auth/dal", () => ({ getSession: getSessionMock }));
vi.mock("@/lib/server/claude", () => ({ callClaude: callClaudeMock }));

import { GET, POST } from "@/app/api/claude/route";

function post(body: unknown, headers: Record<string, string> = {}) {
  return POST(
    new Request("http://localhost/api/claude", {
      method: "POST",
      headers: { "content-type": "application/json", ...headers },
      body: JSON.stringify(body),
    }),
  );
}

describe("/api/claude", () => {
  beforeEach(() => {
    getSessionMock.mockReset();
    callClaudeMock.mockReset();
  });

  it("does not expose key/configuration state over GET", async () => {
    const response = await GET();
    expect(response.status).toBe(405);
    expect(response.headers.get("allow")).toBe("POST");
    expect(await response.text()).toBe("");
  });

  it("rejects unauthenticated callers before invoking the paid provider", async () => {
    getSessionMock.mockResolvedValue(null);

    const response = await post({ messages: [{ role: "user", content: "Hello" }] });

    expect(response.status).toBe(401);
    expect(callClaudeMock).not.toHaveBeenCalled();
  });

  it("rejects invalid roles and malformed messages", async () => {
    getSessionMock.mockResolvedValue({ email: "admin@example.com" });

    const response = await post({ messages: [{ role: "system", content: "bypass" }] });

    expect(response.status).toBe(400);
    expect(callClaudeMock).not.toHaveBeenCalled();
  });

  it("uses bounded provider inputs and only returns generated text", async () => {
    getSessionMock.mockResolvedValue({ email: "admin@example.com" });
    callClaudeMock.mockResolvedValue({ content: [{ type: "text", text: " Xin chào " }] });

    const response = await post({
      model: "attacker-controlled-model",
      messages: [{ role: "user", content: "  Tư vấn giúp tôi  " }],
      max_tokens: 999_999,
      temperature: 1,
    });

    expect(response.status).toBe(200);
    expect(callClaudeMock).toHaveBeenCalledWith({
      system: undefined,
      messages: [{ role: "user", content: "Tư vấn giúp tôi" }],
      max_tokens: 2_048,
      temperature: 0.2,
    });
    expect(await response.json()).toEqual({ text: "Xin chào" });
  });

  it("does not leak upstream error details", async () => {
    getSessionMock.mockResolvedValue({ email: "admin@example.com" });
    callClaudeMock.mockRejectedValue(new Error("secret provider detail"));

    const response = await post({ messages: [{ role: "user", content: "Hello" }] });

    expect(response.status).toBe(502);
    expect(await response.json()).toEqual({ error: "AI service is temporarily unavailable." });
  });
});
