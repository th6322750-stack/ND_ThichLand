"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/server/auth/dal";
import { getRentalProviders } from "@/lib/server/rental/providers";
import { buildMergedRentalData } from "@/lib/server/rental/merge";
import { parsePriceVnd, parseAreaM2, parsePropertyType, parseAvailability } from "@/lib/server/rental/parse";
import { fieldErrorsFromZodError } from "@/lib/server/validation";
import type { CustomBdsRecord } from "@/lib/server/rental/overlay";
import type { AdminPropertyRecord } from "@/lib/types";
import { isGoogleRuntimeConfigured } from "@/lib/server/env";
import { resolveProviderMode, PERSISTENCE_NOT_CONFIGURED_ERROR } from "@/lib/server/providerMode";

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
  bathroomCount: number | null;
  amenities: string[];
  locationNote: string | null;
  videoUrl: string | null;
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
const NOT_CONFIGURED: BdsActionResult = { ok: false, error: PERSISTENCE_NOT_CONFIGURED_ERROR };

function persistenceUnavailable(): boolean {
  return resolveProviderMode(isGoogleRuntimeConfigured()) === "unavailable";
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

// price/area/propertyType/availability are parsed from the same free-text
// fields being validated, not separate inputs. All of this runs inside one
// `superRefine` rather than field-level `.min()`/`.transform()` chains: zod
// stops a `.transform()` from ever running once any preceding field check
// in the same pipeline has failed, which silently dropped the price/area/
// property-type/availability errors whenever roomNo/location/address were
// *also* blank — the operator only ever saw the first problem, not every
// field that needed fixing. superRefine's callback always runs against the
// raw shape, so every check is independent and every failing field is
// reported in one pass, matching the plain-object `validate()` this
// replaced.
const bdsFormSchema = z
  .object({
    slug: z.string(),
    sourceId: z.string().optional(),
    roomNo: z.string(),
    location: z.string(),
    address: z.string(),
    priceRaw: z.string(),
    serviceFee: z.string(),
    areaRaw: z.string(),
    verticalAccess: z.string(),
    propertyType: z.string(),
    description: z.string(),
    highlights: z.array(z.string()),
    availability: z.string(),
    bedroomCount: z.number().nullable(),
    furnishingStatus: z.string().nullable(),
    bathroomCount: z.number().nullable(),
    amenities: z.array(z.string()),
    locationNote: z.string().nullable(),
    videoUrl: z.string().nullable(),
    media: z.array(z.string()),
    commission: z.string(),
    guidePerson: z.string(),
    internalNotes: z.string(),
  })
  .superRefine((val, ctx) => {
    if (!val.roomNo.trim()) ctx.addIssue({ code: "custom", path: ["roomNo"], message: "Vui lòng nhập mã/số phòng" });
    if (!val.location.trim()) ctx.addIssue({ code: "custom", path: ["location"], message: "Vui lòng nhập khu vực" });
    if (!val.address.trim()) ctx.addIssue({ code: "custom", path: ["address"], message: "Vui lòng nhập địa chỉ" });

    const price = parsePriceVnd(val.priceRaw);
    if (!(price !== null && price > 0)) {
      ctx.addIssue({ code: "custom", path: ["price"], message: "Giá không hợp lệ — vui lòng nhập số, VD: 6.500.000" });
    }
    const area = parseAreaM2(val.areaRaw);
    if (!(area !== null && area > 0)) {
      ctx.addIssue({ code: "custom", path: ["area"], message: "Diện tích không hợp lệ — vui lòng nhập số, VD: 35m²" });
    }
    // GĐ6 QA reopen (defect 01): never silently coerce an unrecognized value
    // to "Nhà"/"Còn trống" — reject it as a field error instead.
    if (!parsePropertyType(val.propertyType)) {
      ctx.addIssue({
        code: "custom",
        path: ["propertyType"],
        message: "Loại BĐS không hợp lệ — vui lòng nhập đúng: Căn hộ / Nhà / Mặt bằng / Văn phòng / Xưởng / Studio",
      });
    }
    if (!parseAvailability(val.availability)) {
      ctx.addIssue({
        code: "custom",
        path: ["availability"],
        message: "Trạng thái không hợp lệ — vui lòng nhập đúng: Còn trống / Đã cho thuê / Sắp trống",
      });
    }
  })
  .transform((val) => ({
    ...val,
    price: parsePriceVnd(val.priceRaw),
    area: parseAreaM2(val.areaRaw),
    propertyType: parsePropertyType(val.propertyType),
    availability: parseAvailability(val.availability),
  }));

function revalidateBds() {
  revalidatePath("/admin/bds");
  revalidatePath("/cho-thue");
}

/** Shared by "Lưu nháp" (publish=false) and "Lưu & đăng" (publish=true). */
export async function saveBdsAction(input: BdsFormInput, publish: boolean): Promise<BdsActionResult> {
  const session = await getSession();
  if (!session) return UNAUTHORIZED;
  if (persistenceUnavailable()) return NOT_CONFIGURED;

  const parsed = bdsFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Vui lòng kiểm tra lại thông tin.", fieldErrors: fieldErrorsFromZodError(parsed.error) };
  }
  const { price, area, propertyType, availability } = parsed.data;

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
        propertyType,
        description: input.description,
        highlights: input.highlights,
        availability,
        bedroomCount: input.bedroomCount,
        furnishingStatus: input.furnishingStatus,
        bathroomCount: input.bathroomCount,
        amenities: input.amenities,
        locationNote: input.locationNote,
        videoUrl: input.videoUrl,
        media: input.media,
        published: publish,
      },
      hidden: false,
      updatedAt: now,
      updatedBy: session.sub,
    });
  } else {
    const slug = input.slug || slugify(input.roomNo);
    if (!slug) {
      return {
        ok: false,
        error: "Vui lòng kiểm tra lại thông tin.",
        fieldErrors: { roomNo: "Mã/số phòng cần có ít nhất một chữ cái hoặc số" },
      };
    }
    // Creating a second record whose name slugifies to an existing id used to
    // overwrite the first one without warning. Refuse instead — the operator
    // can rename, or open the existing record and edit it.
    if (!input.slug) {
      const existing = await overlay.listCustomRecords();
      if (existing.some((r) => r.id === `custom:${slug}`)) {
        return {
          ok: false,
          error: "Vui lòng kiểm tra lại thông tin.",
          fieldErrors: { roomNo: `Đã có BĐS dùng đường dẫn "${slug}". Đổi mã/tên khác, hoặc mở bản ghi đó ra sửa.` },
        };
      }
    }
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
      // Stored as the validated, normalized union value (never the raw
      // typed text) — bdsFormSchema above already guarantees these are
      // non-null before this point is ever reached.
      propertyType: propertyType!,
      description: input.description,
      highlights: input.highlights,
      availability: availability!,
      bedroomCount: input.bedroomCount,
      furnishingStatus: input.furnishingStatus,
      bathroomCount: input.bathroomCount,
      amenities: input.amenities,
      locationNote: input.locationNote,
      videoUrl: input.videoUrl,
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
  if (persistenceUnavailable()) return NOT_CONFIGURED;
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
  if (persistenceUnavailable()) return NOT_CONFIGURED;
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
