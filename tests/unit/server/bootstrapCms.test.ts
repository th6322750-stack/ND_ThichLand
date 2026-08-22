import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { CMS_TABS } from "@/lib/server/cmsSheetSchema";

const listSheetTitles = vi.fn();
const createSheetTabWithHeader = vi.fn();

vi.mock("@/lib/server/google/sheets", () => ({
  listSheetTitles: (...args: unknown[]) => listSheetTitles(...args),
  createSheetTabWithHeader: (...args: unknown[]) => createSheetTabWithHeader(...args),
}));

describe("bootstrapCms", () => {
  beforeEach(() => {
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL = "sa@project.iam.gserviceaccount.com";
    process.env.GOOGLE_PRIVATE_KEY = "key";
    process.env.GOOGLE_CMS_SPREADSHEET_ID = "cms-sheet-id";
    listSheetTitles.mockReset();
    createSheetTabWithHeader.mockReset();
  });

  afterEach(() => {
    delete process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    delete process.env.GOOGLE_PRIVATE_KEY;
    delete process.env.GOOGLE_CMS_SPREADSHEET_ID;
    vi.resetModules();
  });

  it("refuses to run when Google runtime env is not configured", async () => {
    delete process.env.GOOGLE_CMS_SPREADSHEET_ID;
    const { bootstrapCms } = await import("../../../scripts/gd6-bootstrap-cms");
    await expect(bootstrapCms(() => {})).rejects.toThrow(/Refusing to run/);
    expect(listSheetTitles).not.toHaveBeenCalled();
  });

  it("creates every missing WEB_* tab and leaves existing ones untouched", async () => {
    listSheetTitles.mockResolvedValue([CMS_TABS.projects, "Phòng trống chính "]);
    const { bootstrapCms } = await import("../../../scripts/gd6-bootstrap-cms");
    const result = await bootstrapCms(() => {});

    expect(result.existing).toEqual([CMS_TABS.projects]);
    expect(result.created).toEqual([
      CMS_TABS.bdsOverrides,
      CMS_TABS.bdsCustom,
      CMS_TABS.news,
      CMS_TABS.contacts,
      CMS_TABS.media,
      CMS_TABS.settings,
    ]);
    expect(createSheetTabWithHeader).toHaveBeenCalledTimes(6);
    expect(createSheetTabWithHeader).not.toHaveBeenCalledWith("cms-sheet-id", CMS_TABS.projects, expect.anything());
  });

  it("is a true no-op (creates nothing) when every tab already exists", async () => {
    listSheetTitles.mockResolvedValue(Object.values(CMS_TABS));
    const { bootstrapCms } = await import("../../../scripts/gd6-bootstrap-cms");
    const result = await bootstrapCms(() => {});
    expect(result.created).toEqual([]);
    expect(createSheetTabWithHeader).not.toHaveBeenCalled();
  });

  it("never references the raw rental sheet name in any write call", async () => {
    listSheetTitles.mockResolvedValue([]);
    const { bootstrapCms } = await import("../../../scripts/gd6-bootstrap-cms");
    await bootstrapCms(() => {});
    for (const call of createSheetTabWithHeader.mock.calls) {
      expect(call[1]).not.toBe("Phòng trống chính ");
    }
  });
});
