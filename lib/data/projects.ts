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

// Real content sourced from the developer's own 28/07/2026 sales-training
// deck (sun_galaxy_training.pdf — 50 trang, ~/du-an Sun Galaxy Complex,
// Đà Nẵng). Every fact below is traceable to that deck; fields the deck
// doesn't state (investor legal entity, construction %) stay honest
// placeholders rather than invented numbers. Pricing is the deck's own
// "Giá RUMOR" (indicative training figures, not an official price list) —
// summarized as a range with an explicit disclaimer per anh's call, not
// quoted per-unit-code.
const SUN_GALAXY_MEDIA = [
  "/assets/v2/projects/sun-galaxy/sun-galaxy-hero-song-han.jpg",
  "/assets/v2/projects/sun-galaxy/sun-galaxy-moon-gate.jpg",
  "/assets/v2/projects/sun-galaxy/sun-galaxy-khan-dai-phao-hoa.jpg",
  "/assets/v2/projects/sun-galaxy/sun-galaxy-trung-tam-thuong-mai.jpg",
  "/assets/v2/projects/sun-galaxy/sun-galaxy-da-nang-downtown.jpg",
  "/assets/v2/projects/sun-galaxy/spana-tower-khoi-de.jpg",
  "/assets/v2/projects/sun-galaxy/cora-tower-khoi-de.jpg",
  "/assets/v2/projects/sun-galaxy/s-light-tower-khoi-de.jpg",
  "/assets/v2/projects/sun-galaxy/penthouse-noi-that-1.jpg",
  "/assets/v2/projects/sun-galaxy/penthouse-noi-that-2.jpg",
];

export const projects: ProjectListing[] = [
  {
    slug: "sun-galaxy-complex",
    name: "Sun Galaxy Complex",
    location: "Hòa Xuân, Đà Nẵng",
    mapQuery: "",
    masterplanImage: "",
    showMasterplan: false,
    investor: "Đang cập nhật",
    status: "Đang triển khai",
    media: SUN_GALAXY_MEDIA,
    summary:
      'Sun Galaxy Complex là tổ hợp biểu tượng ven sông Hàn, Đà Nẵng, thuộc cụm dự án khu vực Hòa Xuân. Điểm nhấn kiến trúc "Moon Gate" và khán đài pháo hoa gần 30.000 chỗ ngồi hướng thẳng ra sông Hàn — lễ hội pháo hoa diễn ra hàng đêm ngay đối diện. Dự án có 2 tầng hầm; các căn hộ cao tầng tham gia chương trình ủy thác vận hành bởi Accor với hai thương hiệu Sofitel và Swissôtel, tiêu chuẩn full nội thất 5 sao. Khối đế là trung tâm thương mại do đơn vị phát triển bán lẻ hàng đầu khu vực vận hành. Đang chuẩn bị ra mắt 150 căn Shop khối đế và 132 căn Penthouse Duplex tại 3 tòa Spana, Cora, S-Light — tiêu chuẩn bàn giao xây thô hoàn thiện mặt ngoài, không ngăn tường. Giá tham khảo giai đoạn đào tạo (chưa phải giá công bố chính thức): Shophouse khối đế khoảng 5,5 - 9,3 tỷ đồng/căn; Penthouse Duplex khoảng 4,8 - 7,9 tỷ đồng/căn (giá chưa vay).',
    amenities: ["Trung tâm thương mại", "Bãi đỗ xe"],
    progressText: "Đang chuẩn bị ra mắt Shop khối đế và Penthouse Duplex, dự kiến mở bán khi thị trường phù hợp.",
    progressPercent: 10,
    // Không dùng PROGRESS_PHOTOS (ảnh thi công chung, không thuộc dự án
    // này) — deck này là tài liệu bán hàng trước mở bán, chưa có ảnh tiến
    // độ thi công thật, để trống để trang hiện đúng trạng thái "đang cập
    // nhật" thay vì gắn ảnh sai dự án.
    progressPhotos: [],
    unitTypes: [
      {
        name: "Shop khối đế - Spana Tower",
        count: 50,
        areaRange: "",
        frontage: "",
        image: "/assets/v2/projects/sun-galaxy/spana-tower-khoi-de.jpg",
        caption: "Shop khối đế Spana Tower",
      },
      {
        name: "Shop khối đế - Cora Tower",
        count: 62,
        areaRange: "",
        frontage: "",
        image: "/assets/v2/projects/sun-galaxy/cora-tower-khoi-de.jpg",
        caption: "Shop khối đế Cora Tower",
      },
      {
        name: "Shop khối đế - S-Light Tower",
        count: 38,
        areaRange: "",
        frontage: "",
        image: "/assets/v2/projects/sun-galaxy/s-light-tower-khoi-de.jpg",
        caption: "Shop khối đế S-Light Tower",
      },
      // Penthouse Duplex (52 Spana / 48 Cora / 32 S-Light) tạm bỏ khỏi bảng
      // hiển thị — không có ảnh riêng theo tòa nên đứng lẻ loi, thiếu cân
      // đối với 3 khối Shop khối đế phía trên. Anh sẽ chỉnh lại cách trình
      // bày sau.
    ],
    // Real (150 shop + 132 penthouse = 282, explicit in the deck's own
    // "THỐNG KÊ SỐ LƯỢNG SẢN PHẨM" table). "scale" (site area in ha) isn't
    // stated anywhere in the deck — left honest/empty rather than guessed.
    propertyType: "Shop khối đế & Penthouse Duplex",
    scale: "",
    unitCount: "282 sản phẩm",
    // Deck's own "5 UNIQUE SELLING POINT" section (trang 5-10) — 5 điểm,
    // giữ nguyên nội dung thật, không thêm bớt.
    highlights: [
      'Kiến trúc điểm nhấn "Moon Gate" — công trình biểu tượng mới của Việt Nam',
      "Khán đài pháo hoa đẹp nhất Việt Nam, đối diện lễ hội pháo hoa hàng đêm bên kia sông Hàn",
      "100% căn hộ tham gia chương trình ủy thác vận hành bởi Accor, thương hiệu Sofitel & Swissôtel",
      "Khối đế là trung tâm thương mại do đơn vị phát triển bán lẻ hàng đầu khu vực vận hành",
      "Tổ hợp đầu tiên trong tổng thể dự án biểu tượng Da Nang Downtown",
    ],
  },
  {
    slug: "riverside-garden",
    name: "Riverside Garden",
    location: "Hà Nội",
    mapQuery: "",
    masterplanImage: "",
    showMasterplan: false,
    investor: "Đang cập nhật",
    status: "Tiêu biểu",
    media: ["/assets/v2/projects/riverside-garden-photo.png", ...GALLERY.slice(0, 3)],
    summary: "Thông tin dự án đang được cập nhật.",
    amenities: ["Công viên nội khu", "An ninh 24/7", "Bãi đỗ xe", "Hồ bơi vô cực", "Khu BBQ"],
    progressText: "Hoàn thiện cảnh quan và bàn giao theo từng giai đoạn.",
    progressPercent: 80,
    progressPhotos: PROGRESS_PHOTOS,
    unitTypes: [],
    propertyType: "",
    scale: "",
    unitCount: "",
    highlights: [],
  },
  {
    slug: "ndthich-office-center",
    name: "NDTHICH Office Center",
    location: "Hà Nội",
    mapQuery: "",
    masterplanImage: "",
    showMasterplan: false,
    investor: "Đang cập nhật",
    status: "Đã hoàn thành",
    media: ["/assets/v2/projects/ndthich-office-photo.png", ...GALLERY.slice(0, 3)],
    summary: "Trung tâm văn phòng đã hoàn thành và đi vào vận hành.",
    amenities: ["Thang máy tốc độ cao", "Sảnh đón sang trọng", "Bãi đỗ xe", "An ninh 24/7"],
    progressText: "Đã hoàn thành, đang vận hành ổn định.",
    progressPercent: 100,
    progressPhotos: PROGRESS_PHOTOS,
    unitTypes: [],
    propertyType: "",
    scale: "",
    unitCount: "",
    highlights: [],
  },
  {
    slug: "green-home-residence",
    name: "Green Home Residence",
    location: "Hà Nội",
    mapQuery: "",
    masterplanImage: "",
    showMasterplan: false,
    investor: "Đang cập nhật",
    status: "Đang triển khai",
    media: ["/assets/v2/projects/garden-city-photo.png", ...GALLERY.slice(0, 2)],
    summary: "Thông tin dự án đang được cập nhật.",
    amenities: ["Công viên nội khu", "Sân chơi trẻ em", "An ninh 24/7", "Bãi đỗ xe", "Hồ bơi vô cực"],
    progressText: "Đang triển khai phần móng, cập nhật tiến độ thường xuyên.",
    progressPercent: 35,
    progressPhotos: PROGRESS_PHOTOS,
    unitTypes: [],
    propertyType: "",
    scale: "",
    unitCount: "",
    highlights: [],
  },
  {
    slug: "capital-riverside",
    name: "Capital Riverside",
    location: "Hà Nội",
    mapQuery: "",
    masterplanImage: "",
    showMasterplan: false,
    investor: "Đang cập nhật",
    status: "Tiêu biểu",
    media: ["/assets/v2/projects/riverside-tower-photo.png", ...GALLERY.slice(0, 2)],
    summary: "Thông tin dự án đang được cập nhật.",
    amenities: ["Shophouse", "Kết nối giao thông thuận tiện", "An ninh 24/7", "Bãi đỗ xe", "Hồ bơi vô cực"],
    progressText: "Hoàn thiện phần thô, chuẩn bị giai đoạn hoàn thiện nội thất.",
    progressPercent: 65,
    progressPhotos: PROGRESS_PHOTOS,
    unitTypes: [],
    propertyType: "",
    scale: "",
    unitCount: "",
    highlights: [],
  },
  {
    slug: "urban-link",
    name: "Urban Link",
    location: "Hà Nội",
    mapQuery: "",
    masterplanImage: "",
    showMasterplan: false,
    investor: "Đang cập nhật",
    status: "Đã hoàn thành",
    media: ["/assets/v2/projects/central-residence-photo.png", ...GALLERY.slice(0, 2)],
    summary: "Tổ hợp đô thị đã hoàn thành và đi vào vận hành.",
    amenities: ["Kết nối giao thông thuận tiện", "An ninh 24/7", "Sảnh đón sang trọng", "Bãi đỗ xe", "Thang máy tốc độ cao"],
    progressText: "Đã hoàn thành, đang vận hành ổn định.",
    progressPercent: 100,
    progressPhotos: PROGRESS_PHOTOS,
    unitTypes: [],
    propertyType: "",
    scale: "",
    unitCount: "",
    highlights: [],
  },
];

export function getProjectBySlug(slug: string): ProjectListing | undefined {
  return projects.find((p) => p.slug === slug);
}
