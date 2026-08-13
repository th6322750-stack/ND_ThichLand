"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/server/auth/dal";
import { getRentalProviders } from "@/lib/server/rental/providers";
import { buildMergedRentalData } from "@/lib/server/rental/merge";
import { parsePriceVnd, parseAreaM2 } from "@/lib/server/rental/parse";
import type { CustomBdsRecord } from "@/lib/server/rental/overlay";
import type { AdminPropertyRecord } from "@/lib/types";

// price/area arrive as the same free-text the approved form already
// collects ("6.500.000", "35m²") and are parsed here, server-side, with
// the same parser Task 03 uses for the raw sheet — not on the client: that
// module also touches node:crypto (sourceHash) and must never enter a
// client bundle. This keeps parsing authoritative in one place either way.
export interface BdsFormInput {
  slug: string;
  sourceId?: string;
  roomNo: string;
  location: string;
  address: string;
  priceRaw: string;
  serviceFee: string;
  areaRaw: string;
  verticalAccess: string;
  propertyType: string;
  description: string;
  highlights: string[];
  availability: string;
  bedroomCount: number | null;
  furnishingStatus: string | null;
  media: string[];
  commission: string;
  guidePerson: string;
  internalNotes: string;
}

export interface BdsActionResult {
  ok: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
}

const UNAUTHORIZED: BdsActionResult = { ok: false, error: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại." };

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function validate(input: BdsFormInput, price: number | null, area: number | null): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!input.roomNo.trim()) errors.roomNo = "Vui lòng nhập mã/số phòng";
  if (!input.location.trim()) errors.location = "Vui lòng nhập khu vực";
  if (!input.address.trim()) errors.address = "Vui lòng nhập địa chỉ";
  if (!(price !== null && price > 0)) errors.price = "Giá không hợp lệ — vui lòng nhập số, VD: 6.500.000";
  if (!(area !== null && area > 0)) errors.area = "Diện tích không hợp lệ — vui lòng nhập số, VD: 35m²";
  return errors;
}

function revalidateBds() {
  revalidatePath("/admin/bds");
  revalidatePath("/cho-thue");
}

/** Shared by "Lưu nháp" (publish=false) and "Lưu & đăng" (publish=true). */
export async function saveBdsAction(input: BdsFormInput, publish: boolean): Promise<BdsActionResult> {
  const session = await getSession();
  if (!session) return UNAUTHORIZED;

  const price = parsePriceVnd(input.priceRaw);
  const area = parseAreaM2(input.areaRaw);

  const fieldErrors = validate(input, price, area);
  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, error: "Vui lòng kiểm tra lại thông tin.", fieldErrors };
  }

  const { overlay } = await getRentalProviders();
  const now = new Date().toISOString();

  if (input.sourceId) {
    await overlay.upsertOverride({
      sourceId: input.sourceId,
      patch: {
        roomNo: input.roomNo,
        location: input.location,
        address: input.address,
        price,
        serviceFee: input.serviceFee,
        area,
        verticalAccess: input.verticalAccess,
        propertyType: input.propertyType,
        description: input.description,
        highlights: input.highlights,
        availability: input.availability,
        bedroomCount: input.bedroomCount,
        furnishingStatus: input.furnishingStatus,
        media: input.media,
        published: publish,
      },
      hidden: false,
      updatedAt: now,
      updatedBy: session.sub,
    });
  } else {
    const slug = input.slug || slugify(input.roomNo);
    const record: CustomBdsRecord = {
      id: `custom:${slug}`,
      slug,
      roomNo: input.roomNo,
      location: input.location,
      address: input.address,
      price,
      serviceFee: input.serviceFee,
      area,
      verticalAccess: input.verticalAccess,
      propertyType: input.propertyType,
      description: input.description,
      highlights: input.highlights,
      availability: input.availability,
      bedroomCount: input.bedroomCount,
      furnishingStatus: input.furnishingStatus,
      media: input.media,
      commission: input.commission,
      guidePerson: input.guidePerson,
      internalNotes: input.internalNotes,
      published: publish,
      createdAt: now,
      updatedAt: now,
    };
    await overlay.upsertCustomRecord(record);
  }

  revalidateBds();
  return { ok: true };
}

/** Admin "delete" on an imported sheet row — never removes the raw row, only hides it from the merged view. */
export async function hideBdsSourceRecordAction(sourceId: string): Promise<BdsActionResult> {
  const session = await getSession();
  if (!session) return UNAUTHORIZED;
  const { overlay } = await getRentalProviders();
  await overlay.upsertOverride({
    sourceId,
    patch: {},
    hidden: true,
    updatedAt: new Date().toISOString(),
    updatedBy: session.sub,
  });
  revalidateBds();
  return { ok: true };
}

export async function deleteCustomBdsRecordAction(id: string): Promise<BdsActionResult> {
  const session = await getSession();
  if (!session) return UNAUTHORIZED;
  const { overlay } = await getRentalProviders();
  await overlay.softDeleteCustomRecord(id);
  revalidateBds();
  return { ok: true };
}

export async function listAdminBdsAction(): Promise<AdminPropertyRecord[] | null> {
  const session = await getSession();
  if (!session) return null;
  const { source, overlay } = await getRentalProviders();
  const merged = await buildMergedRentalData(source, overlay);
  return merged.admin;
}
