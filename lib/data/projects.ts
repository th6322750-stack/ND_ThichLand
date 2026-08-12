import type { ProjectListing } from "../types";

const PLACEHOLDER = "/assets/placeholders/project-placeholder.svg";

export const projects: ProjectListing[] = [
  {
    slug: "sun-galaxy-complex",
    name: "Sun Galaxy Complex",
    location: "Hà Nội",
    status: "Đang triển khai",
    media: [PLACEHOLDER, PLACEHOLDER, PLACEHOLDER],
    summary: "Tổ hợp căn hộ và thương mại đang trong giai đoạn triển khai, theo dữ liệu dự án.",
    amenities: ["Hồ bơi", "Phòng gym", "Khu vui chơi trẻ em", "Bãi đỗ xe ngầm"],
    progressPercent: 45,
  },
  {
    slug: "riverside-garden",
    name: "Riverside Garden",
    location: "Hà Nội",
    status: "Tiêu biểu",
    media: [PLACEHOLDER, PLACEHOLDER, PLACEHOLDER],
    summary: "Dự án tiêu biểu ven sông, không gian xanh, theo dữ liệu dự án.",
    amenities: ["Công viên nội khu", "An ninh 24/7", "Sân thể thao"],
    progressPercent: 80,
  },
  {
    slug: "ndthich-office-center",
    name: "NDTHICH Office Center",
    location: "Hà Nội",
    status: "Đã hoàn thành",
    media: [PLACEHOLDER, PLACEHOLDER],
    summary: "Trung tâm văn phòng đã hoàn thành và đi vào vận hành.",
    amenities: ["Thang máy tốc độ cao", "Sảnh lễ tân", "Bãi đỗ xe"],
    progressPercent: 100,
  },
];

export function getProjectBySlug(slug: string): ProjectListing | undefined {
  return projects.find((p) => p.slug === slug);
}
