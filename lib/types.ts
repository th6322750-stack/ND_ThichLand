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
  // ISO timestamp backing "Hàng Mới Lên" (/cho-thue) — no sheet column
  // exists for this (same admin-override-only reasoning as bathroomCount
  // above), so a sheet-sourced listing always starts null. A custom listing
  // gets this for free from CustomBdsRecord.createdAt at creation time.
  // null means "unknown post date", never "not new" — it just never
  // qualifies for the new-listings section, same as any other unfabricated
  // unknown value in this codebase.
  postedAt: string | null;
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
  /**
   * What the project's map pin geocodes to. `location` is a display label
   * ("Hòa Xuân, Đà Nẵng") that is usually too coarse to pin a building, so
   * this holds the precise address, place name or "lat, lng" pair the admin
   * verified. Empty means the project has no confirmed pin and the map
   * section is hidden rather than showing an approximate one as if it were
   * the site.
   */
  mapQuery: string;
  /**
   * The project's own masterplan / site-layout drawing. Empty means there
   * isn't one; it is never filled with a stand-in, because a generic layout
   * shown under "Mặt bằng dự án" reads as this project's actual site plan.
   */
  masterplanImage: string;
  /**
   * Whether the "Mặt bằng dự án" section appears at all. Off by default: the
   * section used to render a large empty dashed box reading "đang được cập
   * nhật" on every project, which is a placeholder shown to customers rather
   * than information. Admin turns it on when there is something to show — or
   * deliberately, to advertise that a drawing is coming.
   */
  showMasterplan: boolean;
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
  // Per-unit-type breakdown for "Quy hoạch - Mặt bằng" (e.g. "Nhà liền kề:
  // 65 căn, 105m² - 192m², mặt tiền 6m"). areaRange/frontage are free text
  // (not a min/max pair) since a source project may quote either a range or
  // a single value, and frontage doesn't always apply (e.g. a standalone
  // "dinh thự" lot). `image` is an admin-uploaded representative photo of
  // that unit type — empty string renders no photo rather than borrowing
  // another unit type's or another project's image. `caption` is a free-text
  // line shown under the image (e.g. "Nhà liền kề/shophouse") — separate
  // from `name` so admin can write a different display caption than the
  // structured row label without the table text changing. Admin-entered
  // only when real; an empty array hides the whole section rather than
  // showing a fabricated or blank-looking table.
  unitTypes: { name: string; count: number; areaRange: string; frontage: string; image: string; caption: string }[];
  // Back the "Loại hình"/"Quy mô"/"Số lượng" fact tiles on the detail page.
  // Free text (not enums) since these vary too much across project types to
  // constrain ("Shop khối đế & Penthouse Duplex", "6ha", "282 sản phẩm").
  // Empty string renders "Đang cập nhật" — same never-fabricate rule as
  // status/investor: no CMS value yet is not the same as "Căn hộ".
  propertyType: string;
  scale: string;
  unitCount: string;
  // Bullet-point USPs for the "Điểm nổi bật" tab in the "Tổng quan dự án"
  // panel — same level as Vị trí/Quy hoạch-Mặt bằng. Free text per line
  // (e.g. "Vận hành bởi Accor với hai thương hiệu Sofitel & Swissôtel"),
  // admin-entered. Empty array hides that tab instead of showing nothing.
  highlights: string[];
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

/**
 * Company contact details shown in the homepage contact panel, the footer and
 * the contact page. These were hardcoded in JSX in three places, so changing
 * an address or a hotline meant a code edit and a redeploy; they are now one
 * admin-editable record.
 *
 * `mapQuery` is what gets geocoded by the embedded map. It defaults to
 * `address` and only needs its own value when the postal address does not
 * resolve cleanly (e.g. a plus-code or a "near X" landmark string).
 */
export interface SiteSettings {
  address: string;
  /** Optional geocoding override for the map. Empty = use `address`. */
  mapQuery: string;
  /** Primary hotline — the one every "Gọi ngay" button dials. */
  phonePrimary: string;
  /** Optional second line shown alongside the first. Empty = hidden. */
  phoneSecondary: string;
  email: string;
  /** e.g. "Thứ 2 - Thứ 7: 8:00 - 18:00" */
  hoursWeekday: string;
  /** e.g. "Chủ nhật: 8:00 - 12:00". Empty = hidden. */
  hoursWeekend: string;
  /**
   * Uploaded "Hồ sơ năng lực" PDF. Empty hides the homepage section entirely
   * — a capability profile is a claim about the company, so an empty slot
   * shows nothing rather than a placeholder booklet.
   */
  profilePdfUrl: string;
}
