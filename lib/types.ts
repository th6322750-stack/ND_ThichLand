export type PropertyType = "Căn hộ" | "Nhà" | "Mặt bằng" | "Văn phòng" | "Xưởng" | "Studio";
export type Availability = "Còn trống" | "Đã cho thuê" | "Sắp trống";

export interface PropertyListing {
  slug: string;
  roomNo: string; // mã/số phòng, e.g. "P.301 - Tòa A"
  location: string; // khu vực, e.g. "Hà Nội"
  address: string; // địa chỉ chuẩn hóa
  price: number; // VND / month, normalized integer
  serviceFee: string; // phí dịch vụ, free text per Sheet ("Theo tháng", "Đã gồm")
  area: number; // m2, normalized number
  verticalAccess: string; // "thang" e.g. "Thang bộ" | "Thang máy"
  propertyType: PropertyType;
  description: string;
  highlights: string[];
  availability: Availability;
  media: string[]; // resolved image URLs/paths, never raw Drive hyperlinks
  // GĐ6: only ever set from an explicit source phrase (see
  // lib/server/rental/parse.ts) — never inferred (e.g. Studio != 1 bedroom).
  // null renders as "—", exactly like an unset field always has here.
  bedroomCount: number | null;
  furnishingStatus: string | null;
  // Client-requested admin-editable field (no sheet column / parse pattern
  // exists for this — always null for a sheet-derived record until an
  // admin explicitly sets it via an override patch, same mechanism as any
  // other admin correction to a sheet row). null renders as "—".
  bathroomCount: number | null;
  // Backs the "Tiện ích"/"Vị trí"/"Video & Hình ảnh" detail tabs — none of
  // these have a raw sheet column either (same admin-override-only path as
  // bathroomCount above). amenities mirrors ProjectListing's existing
  // field; empty array/null render as "chưa cập nhật", never fabricated.
  amenities: string[];
  locationNote: string | null;
  videoUrl: string | null;
}

export interface AdminPropertyRecord extends Omit<PropertyListing, "propertyType" | "availability"> {
  // GĐ6 QA reopen (defect 01): unlike the public PropertyListing shape,
  // an Admin-visible record MAY have an unknown/unparseable/invalid
  // propertyType or availability — a raw sheet row that failed to parse,
  // or a custom record an admin hasn't finished filling in. Never
  // fabricated to a plausible-looking default (e.g. "Nhà"/"Còn trống") —
  // see lib/server/rental/merge.ts. `published` can only become true once
  // both are non-null (plus price/area), enforced at merge/save time —
  // toPublicPropertyListing is the boundary that turns this back into the
  // public shape's guaranteed-non-null fields.
  propertyType: PropertyType | null;
  availability: Availability | null;
  commission: string; // INTERNAL-ONLY
  guidePerson: string; // INTERNAL-ONLY
  internalNotes: string; // INTERNAL-ONLY
  published: boolean;
  // Present only for sheet-derived records (`sheet:<row>`) — the key an
  // Admin edit/hide writes to WEB_BDS_OVERRIDES. Absent for WEB_BDS_CUSTOM
  // records, which are addressed by `slug`/id directly instead.
  sourceId?: string;
}

export type ProjectStatus = "Đang triển khai" | "Tiêu biểu" | "Đã hoàn thành";

export interface ProjectListing {
  slug: string;
  name: string;
  location: string;
  investor: string;
  // Nullable for the same reason PropertyListing keeps propertyType/
  // availability strict but AdminPropertyRecord allows null: a CMS row can
  // hold an empty or unrecognized status, and inventing "Đang triển khai"
  // for it would publish a fabricated project fact. null renders as
  // "Đang cập nhật" (see lib/projectStatus.ts).
  status: ProjectStatus | null;
  media: string[];
  summary: string;
  amenities: string[];
  progressText: string;
  progressPercent: number;
  // Per-project construction-milestone photos for the "Tiến độ dự án"
  // section — was previously a single hardcoded 5-photo set shared by every
  // project (never real per-project data). Empty renders a "chưa cập nhật"
  // fallback instead of reusing another project's photos.
  progressPhotos: { label: string; image: string }[];
}

export interface NewsArticle {
  slug: string;
  title: string;
  category: string; // e.g. "Kinh nghiệm"
  publishedAt: string; // ISO date
  readMinutes: number;
  excerpt: string;
  sections: { heading: string; body: string }[];
  cover: string;
}
