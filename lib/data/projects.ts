import type { ProjectListing } from "../types";

// Real approved demo photography, matched per project where a dedicated
// asset exists (see .webby/client-approved-v2) — same policy as
// lib/data/properties.ts: fixture content only, never presented as a real
// property's evidence, but shown as an actual photo instead of a blank tile.
const GALLERY = [
  "/assets/v2/project-detail/gallery-1.png",
  "/assets/v2/project-detail/gallery-2.png",
  "/assets/v2/project-detail/gallery-3.png",
  "/assets/v2/project-detail/gallery-4.png",
  "/assets/v2/project-detail/gallery-5.png",
];

const PROGRESS_PHOTOS: { label: string; image: string }[] = [
  { label: "Khởi công dự án", image: "/assets/v2/project-detail/progress-1.png" },
  { label: "Thi công phần móng", image: "/assets/v2/project-detail/progress-2.png" },
  { label: "Thi công phần thân", image: "/assets/v2/project-detail/progress-3.png" },
  { label: "Cất nóc dự án", image: "/assets/v2/project-detail/progress-4.png" },
  { label: "Bàn giao dự kiến", image: "/assets/v2/project-detail/progress-5.png" },
];

export const projects: ProjectListing[] = [
  {
    slug: "sun-galaxy-complex",
    name: "Sun Galaxy Complex",
    location: "Hà Nội",
    investor: "Theo dữ liệu CMS",
    status: "Đang triển khai",
    media: ["/assets/v2/projects/sun-galaxy-photo.png", ...GALLERY],
    summary:
      "Sun Galaxy Complex được trình bày như một case dự án tiêu biểu của công ty. Bố cục ưu tiên hình ảnh, vị trí, thông tin chủ đầu tư, tiện ích và tiến độ.",
    amenities: ["Công viên nội khu", "Shophouse", "An ninh 24/7", "Sân chơi trẻ em", "Kết nối giao thông thuận tiện", "Bãi đỗ xe"],
    progressText: "Đang thi công phần thân, dự kiến bàn giao theo tiến độ CMS.",
    progressPercent: 45,
    progressPhotos: PROGRESS_PHOTOS,
  },
  {
    slug: "riverside-garden",
    name: "Riverside Garden",
    location: "Hà Nội",
    investor: "Theo dữ liệu CMS",
    status: "Tiêu biểu",
    media: ["/assets/v2/projects/riverside-garden-photo.png", ...GALLERY.slice(0, 3)],
    summary: "Dự án tiêu biểu ven sông, không gian xanh, theo dữ liệu dự án.",
    amenities: ["Công viên nội khu", "An ninh 24/7", "Bãi đỗ xe", "Hồ bơi vô cực", "Khu BBQ"],
    progressText: "Hoàn thiện cảnh quan và bàn giao theo từng giai đoạn.",
    progressPercent: 80,
    progressPhotos: PROGRESS_PHOTOS,
  },
  {
    slug: "ndthich-office-center",
    name: "NDTHICH Office Center",
    location: "Hà Nội",
    investor: "Theo dữ liệu CMS",
    status: "Đã hoàn thành",
    media: ["/assets/v2/projects/ndthich-office-photo.png", ...GALLERY.slice(0, 3)],
    summary: "Trung tâm văn phòng đã hoàn thành và đi vào vận hành.",
    amenities: ["Thang máy tốc độ cao", "Sảnh đón sang trọng", "Bãi đỗ xe", "An ninh 24/7"],
    progressText: "Đã hoàn thành, đang vận hành ổn định.",
    progressPercent: 100,
    progressPhotos: PROGRESS_PHOTOS,
  },
  {
    slug: "green-home-residence",
    name: "Green Home Residence",
    location: "Hà Nội",
    investor: "Theo dữ liệu CMS",
    status: "Đang triển khai",
    media: ["/assets/v2/projects/garden-city-photo.png", ...GALLERY.slice(0, 2)],
    summary: "Khu căn hộ xanh đang trong giai đoạn triển khai, theo dữ liệu dự án.",
    amenities: ["Công viên nội khu", "Sân chơi trẻ em", "An ninh 24/7", "Bãi đỗ xe", "Hồ bơi vô cực"],
    progressText: "Đang triển khai phần móng, cập nhật tiến độ theo CMS.",
    progressPercent: 35,
    progressPhotos: PROGRESS_PHOTOS,
  },
  {
    slug: "capital-riverside",
    name: "Capital Riverside",
    location: "Hà Nội",
    investor: "Theo dữ liệu CMS",
    status: "Tiêu biểu",
    media: ["/assets/v2/projects/riverside-tower-photo.png", ...GALLERY.slice(0, 2)],
    summary: "Dự án tiêu biểu trung tâm, theo dữ liệu dự án.",
    amenities: ["Shophouse", "Kết nối giao thông thuận tiện", "An ninh 24/7", "Bãi đỗ xe", "Hồ bơi vô cực"],
    progressText: "Hoàn thiện phần thô, chuẩn bị giai đoạn hoàn thiện nội thất.",
    progressPercent: 65,
    progressPhotos: PROGRESS_PHOTOS,
  },
  {
    slug: "urban-link",
    name: "Urban Link",
    location: "Hà Nội",
    investor: "Theo dữ liệu CMS",
    status: "Đã hoàn thành",
    media: ["/assets/v2/projects/central-residence-photo.png", ...GALLERY.slice(0, 2)],
    summary: "Tổ hợp đô thị đã hoàn thành và đi vào vận hành.",
    amenities: ["Kết nối giao thông thuận tiện", "An ninh 24/7", "Sảnh đón sang trọng", "Bãi đỗ xe", "Thang máy tốc độ cao"],
    progressText: "Đã hoàn thành, đang vận hành ổn định.",
    progressPercent: 100,
    progressPhotos: PROGRESS_PHOTOS,
  },
];

export function getProjectBySlug(slug: string): ProjectListing | undefined {
  return projects.find((p) => p.slug === slug);
}
