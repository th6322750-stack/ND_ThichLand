import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ProjectRecord } from "@/lib/server/projects/repository";

const readSheetRange = vi.fn();
const appendSheetRow = vi.fn();
const updateSheetRange = vi.fn();

vi.mock("@/lib/server/google/sheets", () => ({
  readSheetRange: (...args: unknown[]) => readSheetRange(...args),
  appendSheetRow: (...args: unknown[]) => appendSheetRow(...args),
  updateSheetRange: (...args: unknown[]) => updateSheetRange(...args),
}));

const RECORD: ProjectRecord = {
  id: "custom:test",
  slug: "test",
  name: "Dự án Test",
  location: "Hà Nội",
  mapQuery: "21.0,105.8",
  masterplanImage: "https://example.com/masterplan.webp",
  showMasterplan: true,
  investor: "NDTHICH",
  status: "Đang triển khai",
  media: ["https://example.com/main.webp"],
  summary: "Tóm tắt",
  amenities: [],
  progressText: "Đang thi công",
  progressPercent: 40,
  progressPhotos: [],
  unitTypes: [],
  propertyType: "Căn hộ",
  scale: "2ha",
  unitCount: "500 căn",
  highlights: [],
  apartmentArea: "50m² - 120m²",
  legalStatus: "Sổ hồng lâu dài",
  published: true,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-02T00:00:00.000Z",
};

describe("Google project repository column contract", () => {
  beforeEach(() => {
    process.env.GOOGLE_CMS_SPREADSHEET_ID = "cms-id";
    readSheetRange.mockReset();
    appendSheetRow.mockReset();
    updateSheetRange.mockReset();
  });

  afterEach(() => delete process.env.GOOGLE_CMS_SPREADSHEET_ID);

  it("updates all A:Y columns so late fields are not silently dropped", async () => {
    readSheetRange.mockResolvedValue([[RECORD.id]]);
    const { GoogleProjectRepository } = await import("@/lib/server/projects/repository");
    await new GoogleProjectRepository().upsert(RECORD);
    expect(updateSheetRange).toHaveBeenCalledOnce();
    // Non-null: the assertion above guarantees exactly one call exists.
    const [, range, row] = updateSheetRange.mock.calls[0]!;
    expect(range).toBe("WEB_PROJECTS!A2:Y2");
    expect(row).toHaveLength(25);
    expect(row.slice(-2)).toEqual(["50m² - 120m²", "Sổ hồng lâu dài"]);
  });
});
