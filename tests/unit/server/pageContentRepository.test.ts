import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_ABOUT_PAGE_CONTENT } from "@/lib/data/pageContent";

const readSheetRange = vi.fn();
const appendSheetRow = vi.fn();
const updateSheetRange = vi.fn();

vi.mock("@/lib/server/google/sheets", () => ({
  readSheetRange: (...args: unknown[]) => readSheetRange(...args),
  appendSheetRow: (...args: unknown[]) => appendSheetRow(...args),
  updateSheetRange: (...args: unknown[]) => updateSheetRange(...args),
}));

describe("page content repository", () => {
  beforeEach(() => {
    process.env.GOOGLE_CMS_SPREADSHEET_ID = "cms-id";
    readSheetRange.mockReset();
    appendSheetRow.mockReset();
    updateSheetRange.mockReset();
  });

  afterEach(() => delete process.env.GOOGLE_CMS_SPREADSHEET_ID);

  it("falls back safely when a page has not been saved or its JSON is corrupt", async () => {
    const { GooglePageContentRepository } = await import("@/lib/server/pageContent/repository");
    const repo = new GooglePageContentRepository();
    readSheetRange.mockResolvedValueOnce([]).mockResolvedValueOnce([["about", "{not-json"]]);
    expect((await repo.get("about")).heroTitle).toBe(DEFAULT_ABOUT_PAGE_CONTENT.heroTitle);
    expect((await repo.get("about")).stats).toHaveLength(4);
  });

  it("updates the exact existing page row without replacing the other page", async () => {
    readSheetRange.mockResolvedValue([
      ["contact", "{}", "old"],
      ["about", "{}", "old"],
    ]);
    const { GooglePageContentRepository } = await import("@/lib/server/pageContent/repository");
    const content = { ...DEFAULT_ABOUT_PAGE_CONTENT, heroTitle: "Năng lực mới" };
    await new GooglePageContentRepository().save("about", content);
    expect(updateSheetRange).toHaveBeenCalledOnce();
    const [, range, row] = updateSheetRange.mock.calls[0];
    expect(range).toBe("WEB_PAGE_CONTENT!A3:C3");
    expect(row[0]).toBe("about");
    expect(JSON.parse(row[1]).heroTitle).toBe("Năng lực mới");
    expect(appendSheetRow).not.toHaveBeenCalled();
  });
});
