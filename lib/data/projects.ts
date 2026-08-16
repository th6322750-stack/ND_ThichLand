import type { ProjectListing } from "../types";

const PLACEHOLDER = "/assets/placeholders/project-placeholder.svg";

export const projects: ProjectListing[] = [
  {
    slug: "sun-galaxy-complex",
    name: "Sun Galaxy Complex",
    location: "Hà Nội",
    investor: "Theo dữ liệu CMS",
    status: "Đang triển khai",
    media: [PLACEHOLDER, PLACEHOLDER, PLACEHOLDER, PLACEHOLDER, PLACEHOLDER],
    summary:
      "Sun Galaxy Complex được trình bày như một case dự án tiêu biểu của công ty. Bố cục ưu tiên hình ảnh, vị trí, thông tin chủ đầu tư, tiện ích và tiến độ.",
    amenities: ["Công viên nội khu", "Shophouse", "An ninh 24/7", "Sân chơi trẻ em", "Kết nối giao thông thuận tiện", "Bãi đỗ xe"],
    progressText: "Đang thi công phần thân, dự kiến bàn giao theo tiến độ CMS.",
    progressPercent: 45,
    progressPhotos: [],
  },
  {
    slug: "riverside-garden",
    name: "Riverside Garden",
    location: "Hà Nội",
    investor: "Theo dữ liệu CMS",
    status: "Tiêu biểu",
    media: [PLACEHOLDER, PLACEHOLDER, PLACEHOLDER, PLACEHOLDER],
    summary: "Dự án tiêu biểu ven sông, không gian xanh, theo dữ liệu dự án.",
    amenities: ["Công viên nội khu", "An ninh 24/7", "Bãi đỗ xe", "Hồ bơi vô cực", "Khu BBQ"],
    progressText: "Hoàn thiện cảnh quan và bàn giao theo từng giai đoạn.",
    progressPercent: 80,
    progressPhotos: [],
  },
  {
    slug: "ndthich-office-center",
    name: "NDTHICH Office Center",
    location: "Hà Nội",
    investor: "Theo dữ liệu CMS",
    status: "Đã hoàn thành",
    media: [PLACEHOLDER, PLACEHOLDER, PLACEHOLDER, PLACEHOLDER],
    summary: "Trung tâm văn phòng đã hoàn thành và đi vào vận hành.",
    amenities: ["Thang máy tốc độ cao", "Sảnh đón sang trọng", "Bãi đỗ xe", "An ninh 24/7"],
    progressText: "Đã hoàn thành, đang vận hành ổn định.",
    progressPercent: 100,
    progressPhotos: [],
  },
  {
    slug: "green-home-residence",
    name: "Green Home Residence",
    location: "Hà Nội",
    investor: "Theo dữ liệu CMS",
    status: "Đang triển khai",
    media: [PLACEHOLDER, PLACEHOLDER, PLACEHOLDER],
    summary: "Khu căn hộ xanh đang trong giai đoạn triển khai, theo dữ liệu dự án.",
    amenities: ["Công viên nội khu", "Sân chơi trẻ em", "An ninh 24/7", "Bãi đỗ xe", "Hồ bơi vô cực"],
    progressText: "Đang triển khai phần móng, cập nhật tiến độ theo CMS.",
    progressPercent: 35,
    progressPhotos: [],
  },
  {
    slug: "capital-riverside",
    name: "Capital Riverside",
    location: "Hà Nội",
    investor: "Theo dữ liệu CMS",
    status: "Tiêu biểu",
    media: [PLACEHOLDER, PLACEHOLDER, PLACEHOLDER],
    summary: "Dự án tiêu biểu trung tâm, theo dữ liệu dự án.",
    amenities: ["Shophouse", "Kết nối giao thông thuận tiện", "An ninh 24/7", "Bãi đỗ xe", "Hồ bơi vô cực"],
    progressText: "Hoàn thiện phần thô, chuẩn bị giai đoạn hoàn thiện nội thất.",
    progressPercent: 65,
    progressPhotos: [],
  },
  {
    slug: "urban-link",
    name: "Urban Link",
    location: "Hà Nội",
    investor: "Theo dữ liệu CMS",
    status: "Đã hoàn thành",
    media: [PLACEHOLDER, PLACEHOLDER, PLACEHOLDER],
    summary: "Tổ hợp đô thị đã hoàn thành và đi vào vận hành.",
    amenities: ["Kết nối giao thông thuận tiện", "An ninh 24/7", "Sảnh đón sang trọng", "Bãi đỗ xe", "Thang máy tốc độ cao"],
    progressText: "Đã hoàn thành, đang vận hành ổn định.",
    progressPercent: 100,
    progressPhotos: [],
  },
];

export function getProjectBySlug(slug: string): ProjectListing | undefined {
  return projects.find((p) => p.slug === slug);
}
