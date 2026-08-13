import { createHash } from "node:crypto";
import type { PropertyType } from "@/lib/types";
import type { NormalizedRentalRecord, RawRentalRow, RentalParseOutcome } from "./types";

// Canonical column positions per .webby/GD6_BACKEND_CONTRACT.json rentalSource.canonicalColumns (A:P).
const COL = {
  buildingOrGroupCode: 0,
  availabilityRaw: 1,
  location: 2,
  address: 3,
  mediaLink: 4,
  roomNo: 5,
  priceRaw: 6,
  commissionRaw: 7,
  serviceFeeRaw: 8,
  areaRaw: 9,
  verticalAccessRaw: 10,
  propertyTypeRaw: 11,
  descriptionRaw: 12,
  highlightsRaw: 13,
  guidePersonRaw: 14,
  internalNotesRaw: 15,
} as const;

// No trailing \b: "²" (superscript two) isn't a \w character, so \b never
// matches right after it — this dropped "35 m²" (space before the unit)
// silently. Group 1 is captured before "m" either way, so omitting the
// boundary doesn't risk over-matching for this use case.
const AREA_PATTERN = /(\d+(?:[.,]\d+)?)\s*m\s*[²2]/i;

function cell(cells: string[], index: number): string {
  return (cells[index] ?? "").trim();
}

function isLikelySeparatorRow(cells: string[]): boolean {
  const nonEmptyCount = cells.filter((c) => c && c.trim()).length;
  if (nonEmptyCount === 0) return true;
  const roomNo = cell(cells, COL.roomNo);
  const price = cell(cells, COL.priceRaw);
  const area = cell(cells, COL.areaRaw);
  // A real property record always carries at least one core identifying
  // signal; a group-title/section/note row typically has only column A
  // (or a stray note) populated.
  return !roomNo && !price && !area;
}

export function parsePriceVnd(raw: string): number | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const lower = trimmed.toLowerCase();

  const millionMatch = lower.match(/^([\d.,]+)\s*(triệu|tr)\b/);
  if (millionMatch) {
    const numStr = millionMatch[1].replace(/\./g, "").replace(",", ".");
    const num = Number(numStr);
    if (!Number.isFinite(num) || num <= 0) return null;
    return Math.round(num * 1_000_000);
  }

  const cleaned = trimmed.replace(/đ|vnd/gi, "").trim();
  const digitsOnly = cleaned.replace(/[.,\s]/g, "");
  if (!/^\d+$/.test(digitsOnly)) return null;
  const value = Number(digitsOnly);
  if (!Number.isFinite(value) || value <= 0) return null;
  return value;
}

export function parseAreaM2(raw: string): number | null {
  const match = raw.trim().match(AREA_PATTERN);
  if (!match) return null;
  const num = Number(match[1].replace(",", "."));
  return Number.isFinite(num) && num > 0 ? num : null;
}

export function parseAvailability(raw: string): "Còn trống" | "Đã cho thuê" | "Sắp trống" | null {
  const lower = raw.trim().toLowerCase();
  if (!lower) return null;
  if (/(vào luôn|còn trống|trống ngay)/.test(lower)) return "Còn trống";
  if (/(đã hết|đã chốt|đã thuê|hết phòng)/.test(lower)) return "Đã cho thuê";
  if (/(cuối tháng|đầu tháng|giữa tháng)/.test(lower)) return "Sắp trống";
  if (/\b\d{1,2}[/-]\d{1,2}(?:[/-]\d{2,4})?\b/.test(lower)) return "Sắp trống";
  return null;
}

const PROPERTY_TYPE_MAP: Record<string, PropertyType> = {
  "căn hộ": "Căn hộ",
  "chung cư": "Căn hộ",
  "nhà": "Nhà",
  "nhà nguyên căn": "Nhà",
  "mặt bằng": "Mặt bằng",
  "văn phòng": "Văn phòng",
  "xưởng": "Xưởng",
  "kho xưởng": "Xưởng",
  studio: "Studio",
};

export function parsePropertyType(raw: string): PropertyType | null {
  return PROPERTY_TYPE_MAP[raw.trim().toLowerCase()] ?? null;
}

/**
 * Only ever set from an explicit "<N> ngủ" phrase somewhere in the source
 * text. "Studio" alone must NEVER imply bedroomCount = 1 — that's an
 * inference the contract explicitly forbids.
 */
export function parseBedroomCount(text: string): number | null {
  const match = text.toLowerCase().match(/(\d+)\s*ngủ/);
  if (!match) return null;
  const n = Number(match[1]);
  return Number.isFinite(n) && n > 0 ? n : null;
}

/** Only ever set from explicit furnishing wording — never derived from an appliance list. */
export function parseFurnishingStatus(text: string): string | null {
  const explicit = text.match(/nội thất\s*:\s*([^.;\n]+)/i);
  if (explicit) {
    const value = explicit[1].trim();
    return value.length > 0 ? value : null;
  }
  if (/nội thất đầy đủ/i.test(text)) return "Đầy đủ";
  if (/nội thất cơ bản/i.test(text)) return "Cơ bản";
  return null;
}

function sourceHash(cells: string[]): string {
  return createHash("sha256").update(cells.join("")).digest("hex").slice(0, 16);
}

export function parseRentalRow(row: RawRentalRow): RentalParseOutcome {
  const { cells, sourceRow } = row;

  if (isLikelySeparatorRow(cells)) {
    return { kind: "ignored", sourceRow, reason: "separator-or-note-row" };
  }

  // A row with far fewer cells than the canonical A:P width has no
  // reliable column identity at all past whatever's present — quarantine
  // rather than guess which (if any) later fields still line up. This is
  // deliberately a *separate, structural* signal from "one field failed to
  // parse" below: a malformed/blank area at its correct position is not
  // quarantined, it just yields area: null.
  if (cells.length < 10) {
    return { kind: "quarantined", sourceRow, reason: "row-too-short-column-identity-unreliable", raw: row };
  }

  let commissionRaw = cell(cells, COL.commissionRaw);
  let serviceFeeRaw = cell(cells, COL.serviceFeeRaw);
  let areaRaw = cell(cells, COL.areaRaw);
  let verticalAccessRaw = cell(cells, COL.verticalAccessRaw);
  let propertyTypeRaw = cell(cells, COL.propertyTypeRaw);
  let descriptionRaw = cell(cells, COL.descriptionRaw);
  let highlightsRaw = cell(cells, COL.highlightsRaw);
  let guidePersonRaw = cell(cells, COL.guidePersonRaw);
  let internalNotesRaw = cell(cells, COL.internalNotesRaw);
  let wasRepaired = false;

  const canonicalAreaLooksValid = AREA_PATTERN.test(areaRaw);

  if (!canonicalAreaLooksValid) {
    const shiftedAreaCandidate = cell(cells, COL.serviceFeeRaw);
    if (AREA_PATTERN.test(shiftedAreaCandidate)) {
      // High-confidence repair: the area value (a distinctive "<number>m²"
      // shape) is sitting one column left of where it should be — the
      // classic symptom of a row whose commission cell was never entered,
      // shifting every later column left by one. Commission is unrecoverable
      // for this row (and internal-only/low-stakes), so it's cleared.
      wasRepaired = true;
      commissionRaw = "";
      serviceFeeRaw = cell(cells, COL.commissionRaw);
      areaRaw = cell(cells, COL.serviceFeeRaw);
      verticalAccessRaw = cell(cells, COL.areaRaw);
      propertyTypeRaw = cell(cells, COL.verticalAccessRaw);
      descriptionRaw = cell(cells, COL.propertyTypeRaw);
      highlightsRaw = cell(cells, COL.descriptionRaw);
      guidePersonRaw = cell(cells, COL.highlightsRaw);
      internalNotesRaw = cell(cells, COL.guidePersonRaw);
    }
    // else: no shift signal — area is simply blank/malformed at its correct
    // position. Left as-is; parseAreaM2() below yields null, same treatment
    // as an unparseable price. Not quarantined — the rest of the row's
    // column identity is still trustworthy.
  }

  const bedroomSource = `${descriptionRaw} ${highlightsRaw}`;
  const furnishingSource = `${descriptionRaw} ${highlightsRaw}`;

  const record: NormalizedRentalRecord = {
    sourceId: `sheet:${sourceRow}`,
    sourceRow,
    sourceHash: sourceHash(cells),
    buildingOrGroupCode: cell(cells, COL.buildingOrGroupCode),
    availabilityRaw: cell(cells, COL.availabilityRaw),
    availability: parseAvailability(cell(cells, COL.availabilityRaw)),
    location: cell(cells, COL.location),
    address: cell(cells, COL.address),
    mediaLink: cell(cells, COL.mediaLink),
    roomNo: cell(cells, COL.roomNo),
    priceRaw: cell(cells, COL.priceRaw),
    price: parsePriceVnd(cell(cells, COL.priceRaw)),
    commission: commissionRaw,
    serviceFee: serviceFeeRaw,
    areaRaw,
    area: parseAreaM2(areaRaw),
    verticalAccess: verticalAccessRaw,
    propertyTypeRaw,
    propertyType: parsePropertyType(propertyTypeRaw),
    description: descriptionRaw,
    highlights: highlightsRaw
      .split(/[|;]/)
      .map((h) => h.trim())
      .filter(Boolean),
    guidePerson: guidePersonRaw,
    internalNotes: internalNotesRaw,
    bedroomCount: parseBedroomCount(bedroomSource),
    furnishingStatus: parseFurnishingStatus(furnishingSource),
    wasRepaired,
  };

  return { kind: "valid", record };
}

export function parseRentalRows(rows: RawRentalRow[]): RentalParseOutcome[] {
  return rows.map(parseRentalRow);
}
