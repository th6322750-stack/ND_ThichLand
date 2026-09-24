import { describe, it, expect, vi, afterEach } from "vitest";

vi.mock("next/cache", () => ({ revalidatePath: () => {} }));

describe("GET /api/media/[id]", () => {
  afterEach(() => {
    vi.resetModules();
  });

  it("returns 404 for an unknown id", async () => {
    const { GET } = await import("@/app/api/media/[id]/route");
    const res = await GET(new Request("http://localhost/api/media/does-not-exist"), {
      params: Promise.resolve({ id: "media:does-not-exist" }),
    });
    expect(res.status).toBe(404);
  });

  it("serves the uploaded blob bytes with the correct content type", async () => {
    process.env.ADMIN_EMAIL = "admin@ndthich.vn";
    process.env.ADMIN_PASSWORD_HASH = "scrypt:1:1:1:00:00";
    process.env.AUTH_SECRET = "test-secret";

    const cookieJar = new Map<string, string>();
    vi.doMock("next/headers", () => ({
      cookies: async () => ({
        get: (name: string) => (cookieJar.has(name) ? { name, value: cookieJar.get(name)! } : undefined),
        set: (name: string, value: string) => cookieJar.set(name, value),
        delete: (name: string) => cookieJar.delete(name),
      }),
    }));

    const { createSessionToken } = await import("@/lib/server/crypto/session");
    const now = Date.now();
    cookieJar.set(
      "ndthich_admin_session",
      createSessionToken({ sub: "admin@ndthich.vn", role: "admin", iat: now, exp: now + 60_000 }, "test-secret"),
    );

    const { uploadMediaAction } = await import("@/app/actions/media");
    const { File: NodeFile } = await import("node:buffer");
    const bytes = new Uint8Array([1, 2, 3, 4]);
    const file = new NodeFile([bytes], "test.png", { type: "image/png" });
    // jsdom's real FormData clones any appended File through its own
    // internal class (which lacks arrayBuffer()) — a minimal { get() }
    // stand-in exercises the same production code path without it.
    const formData = { get: (key: string) => (key === "file" ? file : null) } as unknown as FormData;
    const uploaded = await uploadMediaAction(formData);
    expect(uploaded.ok).toBe(true);

    const { GET } = await import("@/app/api/media/[id]/route");
    const res = await GET(new Request(`http://localhost${uploaded.record!.webViewLink}`), {
      params: Promise.resolve({ id: uploaded.record!.id }),
    });
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("image/png");
    const body = new Uint8Array(await res.arrayBuffer());
    expect(Array.from(body)).toEqual([1, 2, 3, 4]);

    delete process.env.ADMIN_EMAIL;
    delete process.env.ADMIN_PASSWORD_HASH;
    delete process.env.AUTH_SECRET;
  });
});
