import "server-only";
import type { PropertyListing, ProjectListing } from "@/lib/types";

/**
 * Deterministic visual-QA-only fixture data for the PHA2 client-approved
 * masters (.webby/client-approved-v2/QA_PROTOCOL.md — "Deterministic visual
 * mode"). Content/photos are chosen to match the approved master screens so
 * a browser capture is directly comparable, never to represent real
 * business facts.
 *
 * Gated on VISUAL_FIXTURE_V2="true" only — completely independent of
 * lib/server/providerMode.ts. Production and the existing GD6 mock/dev
 * fixtures (lib/data/*.ts) are never touched by this module; setting this
 * flag must never be done on a production deployment.
 */
export function isVisualFixtureV2Enabled(): boolean {
  return process.env.VISUAL_FIXTURE_V2 === "true";
}

const ASSET = (path: string) => `/assets/v2/${path}`;

export function getVisualFixtureProperties(): PropertyListing[] {
  return [
    {
      slug: "can-ho-sunrise-city-view",
      roomNo: "Sunrise City View",
      location: "Quận 7, TP. HCM",
      address: "33 Nguyễn Hữu Thọ, Tân Hưng, Quận 7, TP. HCM",
      price: 12_000_000,
      serviceFee: "Đã bao gồm",
      area: 70,
      verticalAccess: "Thang máy",
      propertyType: "Căn hộ",
      description:
        "Căn hộ cao cấp view sông thoáng mát, nội thất đầy đủ, sẵn sàng vào ở ngay. Khu căn hộ an ninh 24/7, tiện ích đầy đủ: hồ bơi, gym, siêu thị, công viên. Gần trung tâm, di chuyển thuận tiện.",
      highlights: [
        "Căn góc thoáng mát, view sông và công viên",
        "Full nội thất cao cấp, dọn vào ở ngay",
        "Tiện ích 5 sao: hồ bơi, gym, BBQ, công viên nội khu",
        "Vị trí thuận tiện: gần Lotte Mart, Vivo City, trường quốc tế",
      ],
      availability: "Còn trống",
      media: [
        ASSET("property-detail/main-interior.png"),
        ASSET("property-detail/thumb-living.png"),
        ASSET("property-detail/thumb-kitchen.png"),
        ASSET("property-detail/thumb-dining.png"),
        ASSET("properties/sunrise-city-view.png"),
      ],
      bedroomCount: 2,
      furnishingStatus: "Đầy đủ",
    },
    {
      slug: "nha-nguyen-can-hem-8m",
      roomNo: "Nhà nguyên căn hẻm 8m",
      location: "Quận 2, TP. HCM",
      address: "Hẻm 8m, Phường An Phú, Quận 2, TP. HCM",
      price: 16_000_000,
      serviceFee: "Không áp dụng",
      area: 120,
      verticalAccess: "Thang bộ",
      propertyType: "Nhà",
      description:
        "Nhà nguyên căn hẻm xe hơi 8m, thiết kế hiện đại, phù hợp gia đình hoặc kinh doanh nhỏ.",
      highlights: ["Hẻm xe hơi 8m", "4 phòng ngủ, 3 vệ sinh", "An ninh khu vực tốt"],
      availability: "Còn trống",
      media: [ASSET("properties/house-alley-8m.png")],
      bedroomCount: 4,
      furnishingStatus: "Cơ bản",
    },
    {
      slug: "mat-bang-kinh-doanh-mt",
      roomNo: "Mặt bằng kinh doanh MT",
      location: "Bình Thạnh, TP. HCM",
      address: "Mặt tiền đường, Phường 25, Bình Thạnh, TP. HCM",
      price: 25_000_000,
      serviceFee: "Không áp dụng",
      area: 80,
      verticalAccess: "Trệt",
      propertyType: "Mặt bằng",
      description: "Mặt bằng kinh doanh mặt tiền đường lớn, khu dân cư đông đúc, phù hợp F&B/bán lẻ.",
      highlights: ["Mặt tiền 6m", "Khu dân cư đông đúc", "Phù hợp F&B, bán lẻ"],
      availability: "Còn trống",
      media: [ASSET("properties/storefront-mt.png")],
      bedroomCount: null,
      furnishingStatus: null,
    },
    {
      slug: "van-phong-toa-nha-abc",
      roomNo: "Văn phòng tòa nhà ABC",
      location: "Phú Nhuận, TP. HCM",
      address: "Tòa nhà ABC, Phú Nhuận, TP. HCM",
      price: 18_000_000,
      serviceFee: "Đã bao gồm",
      area: 100,
      verticalAccess: "Thang máy",
      propertyType: "Văn phòng",
      description: "Văn phòng hạng B, tầng 5, view thoáng, sẵn sàng vào làm việc ngay.",
      highlights: ["Tầng 5, view thoáng", "Có thang máy", "Sẵn nội thất cơ bản"],
      availability: "Còn trống",
      media: [ASSET("properties/office-abc.png")],
      bedroomCount: null,
      furnishingStatus: "Cơ bản",
    },
    {
      slug: "kho-xuong-nguyen-van-linh",
      roomNo: "Kho xưởng đường Nguyễn Văn Linh",
      location: "Bình Chánh, TP. HCM",
      address: "Đường Nguyễn Văn Linh, Bình Chánh, TP. HCM",
      price: 35_000_000,
      serviceFee: "Không áp dụng",
      area: 500,
      verticalAccess: "Trệt",
      propertyType: "Xưởng",
      description: "Kho xưởng diện tích lớn, xe container ra vào thuận tiện, gần cảng.",
      highlights: ["Xe container ra vào được", "Trần cao, nền tải trọng lớn", "Gần cảng, quốc lộ"],
      availability: "Còn trống",
      media: [ASSET("properties/warehouse.png")],
      bedroomCount: null,
      furnishingStatus: null,
    },
    {
      slug: "phong-tro-cao-cap-full-noi-that",
      roomNo: "Phòng trọ cao cấp Full nội thất",
      location: "Tân Bình, TP. HCM",
      address: "Đường Cộng Hòa, Tân Bình, TP. HCM",
      price: 4_500_000,
      serviceFee: "Theo tháng",
      area: 25,
      verticalAccess: "Thang bộ",
      propertyType: "Studio",
      description: "Phòng trọ cao cấp, full nội thất, giờ giấc tự do, an ninh camera 24/7.",
      highlights: ["Full nội thất", "Giờ giấc tự do", "Camera an ninh 24/7"],
      availability: "Còn trống",
      media: [ASSET("properties/room-furnished.png")],
      bedroomCount: null,
      furnishingStatus: "Đầy đủ",
    },
  ];
}

interface ProjectFixture extends ProjectListing {
  cardMedia: string;
}

export function getVisualFixtureProjects(): ProjectFixture[] {
  return [
    {
      slug: "sun-galaxy-complex",
      name: "Sun Galaxy Complex",
      location: "Quận 7, TP. HCM",
      investor: "Sun Group",
      status: "Đang triển khai",
      media: [
        ASSET("project-detail/hero-reference.png"),
        ASSET("project-detail/pool.png"),
        ASSET("project-detail/gallery-1.png"),
        ASSET("project-detail/gallery-2.png"),
        ASSET("project-detail/gallery-3.png"),
        ASSET("project-detail/gallery-4.png"),
        ASSET("project-detail/gallery-5.png"),
      ],
      cardMedia: ASSET("projects/sun-galaxy-photo.png"),
      summary:
        "Sun Galaxy Complex là khu căn hộ cao cấp được phát triển bởi Sun Group, tọa lạc tại vị trí đắc địa Quận 7, TP. HCM. Dự án sở hữu thiết kế hiện đại, hệ thống tiện ích đẳng cấp mang đến không gian sống lý tưởng cho cư dân.",
      amenities: ["Hồ bơi vô cực", "Gym & Yoga", "Công viên nội khu", "Khu BBQ", "Shophouse", "An ninh 24/7", "Sảnh đón sang trọng"],
      progressText: "Đang thi công phần thân đến tầng 20",
      progressPercent: 55,
    },
    {
      slug: "riverside-garden",
      name: "Riverside Garden",
      location: "Thủ Đức, TP. HCM",
      investor: "NDTHICH Land",
      status: "Đang triển khai",
      media: [ASSET("projects/riverside-garden-photo.png")],
      cardMedia: ASSET("projects/riverside-garden-photo.png"),
      summary: "Khu nhà phố ven sông, không gian xanh, kết nối thuận tiện về trung tâm TP. Thủ Đức.",
      amenities: ["Công viên nội khu", "An ninh 24/7"],
      progressText: "Hoàn thành thi công phần móng",
      progressPercent: 30,
    },
    {
      slug: "ndthich-office-tower",
      name: "NDThich Office Tower",
      location: "Bình Thạnh, TP. HCM",
      investor: "NDTHICH Land",
      status: "Đang triển khai",
      media: [ASSET("projects/ndthich-office-photo.png")],
      cardMedia: ASSET("projects/ndthich-office-photo.png"),
      summary: "Toà văn phòng hạng A tại trung tâm Bình Thạnh, thiết kế hiện đại, view sông Sài Gòn.",
      amenities: ["Thang máy tốc độ cao", "An ninh 24/7"],
      progressText: "Đang thi công phần thân",
      progressPercent: 45,
    },
    {
      slug: "the-central-residence",
      name: "The Central Residence",
      location: "Bình Tân, TP. HCM",
      investor: "Central Group",
      status: "Tiêu biểu",
      media: [ASSET("projects/central-residence-photo.png")],
      cardMedia: ASSET("projects/central-residence-photo.png"),
      summary: "Khu căn hộ trung tâm Bình Tân, đầy đủ tiện ích nội khu, giá hợp lý.",
      amenities: ["Hồ bơi", "Công viên nội khu"],
      progressText: "Đã bàn giao",
      progressPercent: 100,
    },
    {
      slug: "garden-city",
      name: "Garden City",
      location: "Thủ Đức, TP. HCM",
      investor: "Garden Group",
      status: "Đang triển khai",
      media: [ASSET("projects/garden-city-photo.png")],
      cardMedia: ASSET("projects/garden-city-photo.png"),
      summary: "Khu đô thị xanh tại Thủ Đức, quy hoạch đồng bộ, nhiều mảng xanh nội khu.",
      amenities: ["Công viên trung tâm", "Trường học nội khu"],
      progressText: "Đang thi công hạ tầng",
      progressPercent: 40,
    },
    {
      slug: "riverside-tower",
      name: "Riverside Tower",
      location: "Phú Nhuận, TP. HCM",
      investor: "Riverside Corp",
      status: "Đã hoàn thành",
      media: [ASSET("projects/riverside-tower-photo.png")],
      cardMedia: ASSET("projects/riverside-tower-photo.png"),
      summary: "Căn hộ cao tầng view sông tại Phú Nhuận, đã bàn giao và đi vào vận hành ổn định.",
      amenities: ["Hồ bơi", "Gym"],
      progressText: "Đã bàn giao",
      progressPercent: 100,
    },
    {
      slug: "sunrise-riverside",
      name: "Sunrise Riverside",
      location: "Quận 7, TP. HCM",
      investor: "Sunrise Group",
      status: "Tiêu biểu",
      media: [ASSET("projects/sunrise-riverside-photo.png")],
      cardMedia: ASSET("projects/sunrise-riverside-photo.png"),
      summary: "Khu căn hộ cao cấp ven sông Quận 7, tiện ích 5 sao, an ninh khép kín.",
      amenities: ["Hồ bơi vô cực", "Công viên ven sông"],
      progressText: "Đã bàn giao",
      progressPercent: 100,
    },
    {
      slug: "van-phong-lam-viec-abc",
      name: "Văn phòng làm việc ABC",
      location: "Quận 1, TP. HCM",
      investor: "ABC Corp",
      status: "Đang triển khai",
      media: [ASSET("projects/office-abc-photo.png")],
      cardMedia: ASSET("projects/office-abc-photo.png"),
      summary: "Toà văn phòng trung tâm Quận 1, kết nối giao thông thuận tiện.",
      amenities: ["Thang máy tốc độ cao", "Bãi giữ xe rộng"],
      progressText: "Đang hoàn thiện nội thất",
      progressPercent: 80,
    },
    {
      slug: "khu-nha-o-phu-gia",
      name: "Khu nhà ở Phú Gia",
      location: "Nhà Bè, TP. HCM",
      investor: "Phú Gia Land",
      status: "Đang triển khai",
      media: [ASSET("projects/phu-gia-photo.png")],
      cardMedia: ASSET("projects/phu-gia-photo.png"),
      summary: "Khu nhà ở thấp tầng tại Nhà Bè, không gian sống yên tĩnh, gần trung tâm.",
      amenities: ["Công viên nội khu", "An ninh 24/7"],
      progressText: "Đang thi công phần thô",
      progressPercent: 35,
    },
  ];
}
