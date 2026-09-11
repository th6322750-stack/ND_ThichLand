import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { File } from "node:buffer";
import { createSessionToken } from "@/lib/server/crypto/session";

// jsdom's FormData clones any appended File through its own internal File
// class, which (unlike the real Next.js/Node server runtime) has no
// arrayBuffer() — a jsdom test-environment limitation, not a production
// concern. A minimal { get() } stand-in exercises the exact same
// uploadMediaAction code path (duck-typed file check + arrayBuffer read)
// without going through jsdom's FormData at all.
function fakeFormData(file: File): FormData {
  return { get: (key: string) => (key === "file" ? file : null) } as unknown as FormData;
}

const cookieJar = new Map<string, string>();
const mockCookieStore = {
  get(name: string) {
    return cookieJar.has(name) ? { name, value: cookieJar.get(name)! } : undefined;
  },
  set(name: string, value: string) {
    cookieJar.set(name, value);
  },
  delete(name: string) {
    cookieJar.delete(name);
  },
};

vi.mock("next/headers", () => ({ cookies: async () => mockCookieStore }));
vi.mock("next/cache", () => ({ revalidatePath: () => {} }));

const TEST_SECRET = "test-secret-for-media-actions";

function signInAsAdmin() {
  const now = Date.now();
  const token = createSessionToken({ sub: "admin@ndthich.vn", role: "admin", iat: now, exp: now + 60_000 }, TEST_SECRET);
  cookieJar.set("ndthich_admin_session", token);
}

function makeFile(name: string, type: string, sizeBytes: number): File {
  return new File([new Uint8Array(sizeBytes)], name, { type });
}

describe("Media admin actions", () => {
  beforeEach(() => {
    cookieJar.clear();
    process.env.ADMIN_EMAIL = "admin@ndthich.vn";
    process.env.ADMIN_PASSWORD_HASH = "scrypt:1:1:1:00:00";
    process.env.AUTH_SECRET = TEST_SECRET;
  });

  afterEach(() => {
    delete process.env.ADMIN_EMAIL;
    delete process.env.ADMIN_PASSWORD_HASH;
    delete process.env.AUTH_SECRET;
    vi.resetModules();
  });

  it("rejects uploadMediaAction when unauthenticated", async () => {
    const { uploadMediaAction } = await import("@/app/actions/media");
    const result = await uploadMediaAction(fakeFormData(makeFile("a.jpg", "image/jpeg", 1024)));
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/đăng nhập/i);
  });

  it("rejects an unsupported MIME type", async () => {
    signInAsAdmin();
    const { uploadMediaAction } = await import("@/app/actions/media");
    const result = await uploadMediaAction(fakeFormData(makeFile("a.exe", "application/x-msdownload", 1024)));
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/định dạng/i);
  });

  it("rejects an oversized image", async () => {
    signInAsAdmin();
    const { uploadMediaAction } = await import("@/app/actions/media");
    const result = await uploadMediaAction(fakeFormData(makeFile("big.jpg", "image/jpeg", 9 * 1024 * 1024)));
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/dung lượng/i);
  });

  it("uploads a valid image and it shows up in the admin list with a servable URL", async () => {
    signInAsAdmin();
    const { uploadMediaAction, listAdminMediaAction } = await import("@/app/actions/media");
    const result = await uploadMediaAction(fakeFormData(makeFile("room.jpg", "image/jpeg", 2048)));
    expect(result.ok).toBe(true);
    expect(result.record!.webViewLink).toMatch(/^\/api\/media\//);

    const list = await listAdminMediaAction();
    const found = list!.find((r) => r.id === result.record!.id);
    expect(found).toBeDefined();
    expect(found!.filename).toBe("room.jpg");
  });

  it("deleteMediaAction removes the record from the list", async () => {
    signInAsAdmin();
    const { uploadMediaAction, deleteMediaAction, listAdminMediaAction } = await import("@/app/actions/media");
    const uploaded = await uploadMediaAction(fakeFormData(makeFile("to-delete.png", "image/png", 2048)));
    expect(uploaded.ok).toBe(true);

    const deleteResult = await deleteMediaAction(uploaded.record!.id);
    expect(deleteResult.ok).toBe(true);

    const list = await listAdminMediaAction();
    expect(list!.find((r) => r.id === uploaded.record!.id)).toBeUndefined();
  });
});
