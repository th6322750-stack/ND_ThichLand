import type { Availability, PropertyListing, PropertyType } from "./types";

type RawRow = Record<string, string | undefined>;

export function normalizePropertyRow(row: RawRow): PropertyListing | null {
  if (row.is_group_header === "true" || !row.room_no) return null;

  const price = Number((row.price ?? "0").replace(/\./g, "").replace(/[^\d]/g, ""));
  const area = Number((row.area ?? "0").replace(/[^\d.]/g, ""));

  return {
    slug: slugify(row.room_no ?? ""),
    roomNo: row.room_no ?? "",
    location: row.location ?? "",
    address: row.address ?? "",
    price,
    serviceFee: row.service_fee ?? "",
    area,
    verticalAccess: row.vertical_access ?? "",
    propertyType: (row.property_type ?? "Nhà") as PropertyType,
    description: row.description ?? "",
    highlights: (row.highlights ?? "")
      .split("|")
      .map((h) => h.trim())
      .filter(Boolean),
    availability: (row.availability ?? "Còn trống") as Availability,
    media: resolveMediaLinks(row.media ?? ""),
  };
}

function resolveMediaLinks(raw: string): string[] {
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
