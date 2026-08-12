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
}

export interface AdminPropertyRecord extends PropertyListing {
  commission: string; // INTERNAL-ONLY
  guidePerson: string; // INTERNAL-ONLY
  internalNotes: string; // INTERNAL-ONLY
}

export type ProjectStatus = "Đang triển khai" | "Tiêu biểu" | "Đã hoàn thành";

export interface ProjectListing {
  slug: string;
  name: string;
  location: string;
  status: ProjectStatus;
  media: string[];
  summary: string;
  amenities: string[];
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
