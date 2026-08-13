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
}

export interface AdminPropertyRecord extends PropertyListing {
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
  status: ProjectStatus;
  media: string[];
  summary: string;
  amenities: string[];
  progressText: string;
  progressPercent: number;
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
