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
    amenities: [
      "Không gian xanh",
      "Tiện ích thương mại",
      "An ninh 24/7",
      "Khu sinh hoạt",
      "Kết nối giao thông",
      "Hệ thống dịch vụ",
    ],
    progressText: "Đang thi công phần thân, dự kiến bàn giao theo tiến độ CMS.",
    progressPercent: 45,
  },
  {
    slug: "riverside-garden",
    name: "Riverside Garden",
    location: "Hà Nội",
    investor: "Theo dữ liệu CMS",
    status: "Tiêu biểu",
    media: [PLACEHOLDER, PLACEHOLDER, PLACEHOLDER, PLACEHOLDER],
    summary: "Dự án tiêu biểu ven sông, không gian xanh, theo dữ liệu dự án.",
    amenities: ["Công viên nội khu", "An ninh 24/7", "Sân thể thao", "Bãi đỗ xe", "Hồ bơi", "Khu BBQ"],
    progressText: "Hoàn thiện cảnh quan và bàn giao theo từng giai đoạn.",
    progressPercent: 80,
  },
  {
    slug: "ndthich-office-center",
    name: "NDTHICH Office Center",
    location: "Hà Nội",
    investor: "Theo dữ liệu CMS",
    status: "Đã hoàn thành",
    media: [PLACEHOLDER, PLACEHOLDER, PLACEHOLDER, PLACEHOLDER],
    summary: "Trung tâm văn phòng đã hoàn thành và đi vào vận hành.",
    amenities: [
      "Thang máy tốc độ cao",
      "Sảnh lễ tân",
      "Bãi đỗ xe",
      "An ninh 24/7",
      "Hệ thống PCCC",
      "Dịch vụ vệ sinh",
    ],
    progressText: "Đã hoàn thành, đang vận hành ổn định.",
    progressPercent: 100,
  },
  {
    slug: "green-home-residence",
    name: "Green Home Residence",
    location: "Hà Nội",
    investor: "Theo dữ liệu CMS",
    status: "Đang triển khai",
    media: [PLACEHOLDER, PLACEHOLDER, PLACEHOLDER],
    summary: "Khu căn hộ xanh đang trong giai đoạn triển khai, theo dữ liệu dự án.",
    amenities: ["Không gian xanh", "Khu sinh hoạt", "An ninh 24/7", "Bãi đỗ xe", "Sân chơi trẻ em", "Hồ bơi"],
    progressText: "Đang triển khai phần móng, cập nhật tiến độ theo CMS.",
    progressPercent: 35,
  },
  {
    slug: "capital-riverside",
    name: "Capital Riverside",
    location: "Hà Nội",
    investor: "Theo dữ liệu CMS",
    status: "Tiêu biểu",
    media: [PLACEHOLDER, PLACEHOLDER, PLACEHOLDER],
    summary: "Dự án tiêu biểu trung tâm, theo dữ liệu dự án.",
    amenities: ["Tiện ích thương mại", "Kết nối giao thông", "An ninh 24/7", "Hệ thống dịch vụ", "Bãi đỗ xe", "Hồ bơi"],
    progressText: "Hoàn thiện phần thô, chuẩn bị giai đoạn hoàn thiện nội thất.",
    progressPercent: 65,
  },
  {
    slug: "urban-link",
    name: "Urban Link",
    location: "Hà Nội",
    investor: "Theo dữ liệu CMS",
    status: "Đã hoàn thành",
    media: [PLACEHOLDER, PLACEHOLDER, PLACEHOLDER],
    summary: "Tổ hợp đô thị đã hoàn thành và đi vào vận hành.",
    amenities: ["Kết nối giao thông", "An ninh 24/7", "Sảnh lễ tân", "Bãi đỗ xe", "Hệ thống dịch vụ", "Thang máy"],
    progressText: "Đã hoàn thành, đang vận hành ổn định.",
    progressPercent: 100,
  },
];

export function getProjectBySlug(slug: string): ProjectListing | undefined {
  return projects.find((p) => p.slug === slug);
}
