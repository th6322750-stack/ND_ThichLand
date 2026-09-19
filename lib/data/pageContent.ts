import type { AboutPageContent, ContactPageContent } from "@/lib/types";

export const DEFAULT_ABOUT_PAGE_CONTENT: AboutPageContent = {
  metadataTitle: "Về chúng tôi | NDTHICH LAND",
  metadataDescription:
    "NDTHICH LAND — giới thiệu năng lực, giá trị và cách chúng tôi làm việc với khách thuê và chủ nhà.",
  heroEyebrow: "VỀ NDTHICH",
  heroTitle: "Đầu tư uy tín,\nkinh doanh bền vững",
  heroBody:
    "NDTHICH LAND tập trung bất động sản cho thuê và các dự án đầu tư / kinh doanh với trải nghiệm khách hàng rõ ràng.",
  heroImage: "",
  heroMediaLabel: "Thương hiệu / văn phòng",
  statsEyebrow: "NĂNG LỰC",
  statsTitle: "Các con số nổi bật",
  statsDescription: "Vài con số về cách NDTHICH LAND đang phục vụ khách thuê và chủ nhà",
  stats: [
    { value: "500+", label: "Lượt tư vấn" },
    { value: "Nhiều loại hình", label: "Nguồn BĐS cho thuê" },
    { value: "1 hotline", label: "Liên hệ trực tiếp" },
    { value: "Liên tục", label: "Chủ động cập nhật tin đăng" },
  ],
  valuesEyebrow: "GIÁ TRỊ",
  valuesTitle: "Cách NDTHICH vận hành",
  values: [
    { title: "Uy tín", body: "Thông tin rõ ràng, hạn chế nhập nhằng." },
    { title: "Tận tâm", body: "Liên hệ trực tiếp và hỗ trợ nhanh." },
    { title: "Bền vững", body: "Hệ thống nội dung có thể mở rộng lâu dài." },
  ],
  areasEyebrow: "HOẠT ĐỘNG",
  areasTitle: "Lĩnh vực chính",
  areasDescription: "Tập trung đúng nhu cầu khách và năng lực NDTHICH LAND",
  areas: [
    {
      title: "Bất động sản cho thuê",
      description: "Căn hộ, nhà nguyên căn, mặt bằng kinh doanh, văn phòng và kho xưởng cho thuê tại Hà Nội.",
      image: "",
    },
    {
      title: "Dự án",
      description: "Dự án bất động sản đang triển khai và mở bán, cập nhật tiến độ thường xuyên.",
      image: "",
    },
    {
      title: "Tin tức & tư vấn",
      description: "Kinh nghiệm thuê nhà, thông tin thị trường và tư vấn từ đội ngũ NDTHICH.",
      image: "",
    },
  ],
  ctaTitle: "Kết nối với NDTHICH",
  ctaSubtitle: "Trao đổi trực tiếp về nhu cầu thuê hoặc dự án.",
  ctaCallLabel: "Gọi ngay",
  ctaZaloLabel: "Zalo",
};

export const DEFAULT_CONTACT_PAGE_CONTENT: ContactPageContent = {
  metadataTitle: "Liên hệ | NDTHICH LAND",
  metadataDescription:
    "Hotline 0986 602 203, Zalo và form gửi yêu cầu tư vấn bất động sản cho thuê tại Hà Nội.",
  heroTitle: "Liên hệ NDTHICH",
  heroBody: "Trao đổi trực tiếp về bất động sản cho thuê hoặc thông tin dự án.",
  callButtonLabel: "Gọi",
  zaloButtonLabel: "Nhắn Zalo",
  mapLabel: "Google Maps / văn phòng",
  primaryPhoneLabel: "Hotline chính",
  secondaryPhoneLabel: "Hotline phụ",
  locationLabel: "Khu vực hoạt động",
  formTitle: "Gửi yêu cầu tư vấn",
  formDescription: "Để lại thông tin, NDTHICH sẽ liên hệ để tư vấn phù hợp với nhu cầu của bạn.",
  formNameLabel: "Họ và tên",
  formPhoneLabel: "Số điện thoại",
  formNeedLabel: "Nhu cầu",
  formNeedPlaceholder: "Thuê / dự án / tư vấn chung",
  formAreaLabel: "Khu vực quan tâm",
  formAreaPlaceholder: "Hà Nội...",
  formMessageLabel: "Nội dung",
  formSubmitLabel: "Gửi yêu cầu",
  formSubmittingLabel: "Đang gửi...",
  formNameRequiredError: "Vui lòng nhập họ và tên",
  formPhoneRequiredError: "Vui lòng nhập số điện thoại",
  formSuccessMessage: "Đã gửi yêu cầu tư vấn. NDTHICH sẽ liên hệ lại sớm nhất.",
};

function text(value: unknown, fallback: string): string {
  return typeof value === "string" ? value : fallback;
}

function record(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

export function normalizeAboutPageContent(value: unknown): AboutPageContent {
  const input = record(value);
  const stats = Array.isArray(input.stats) ? input.stats : [];
  const values = Array.isArray(input.values) ? input.values : [];
  const areas = Array.isArray(input.areas) ? input.areas : [];
  const fallback = DEFAULT_ABOUT_PAGE_CONTENT;
  return {
    metadataTitle: text(input.metadataTitle, fallback.metadataTitle),
    metadataDescription: text(input.metadataDescription, fallback.metadataDescription),
    heroEyebrow: text(input.heroEyebrow, fallback.heroEyebrow),
    heroTitle: text(input.heroTitle, fallback.heroTitle),
    heroBody: text(input.heroBody, fallback.heroBody),
    heroImage: text(input.heroImage, fallback.heroImage),
    heroMediaLabel: text(input.heroMediaLabel, fallback.heroMediaLabel),
    statsEyebrow: text(input.statsEyebrow, fallback.statsEyebrow),
    statsTitle: text(input.statsTitle, fallback.statsTitle),
    statsDescription: text(input.statsDescription, fallback.statsDescription),
    stats: fallback.stats.map((item, index) => {
      const candidate = record(stats[index]);
      return { value: text(candidate.value, item.value), label: text(candidate.label, item.label) };
    }),
    valuesEyebrow: text(input.valuesEyebrow, fallback.valuesEyebrow),
    valuesTitle: text(input.valuesTitle, fallback.valuesTitle),
    values: fallback.values.map((item, index) => {
      const candidate = record(values[index]);
      return { title: text(candidate.title, item.title), body: text(candidate.body, item.body) };
    }),
    areasEyebrow: text(input.areasEyebrow, fallback.areasEyebrow),
    areasTitle: text(input.areasTitle, fallback.areasTitle),
    areasDescription: text(input.areasDescription, fallback.areasDescription),
    areas: fallback.areas.map((item, index) => {
      const candidate = record(areas[index]);
      return {
        title: text(candidate.title, item.title),
        description: text(candidate.description, item.description),
        image: text(candidate.image, item.image),
      };
    }),
    ctaTitle: text(input.ctaTitle, fallback.ctaTitle),
    ctaSubtitle: text(input.ctaSubtitle, fallback.ctaSubtitle),
    ctaCallLabel: text(input.ctaCallLabel, fallback.ctaCallLabel),
    ctaZaloLabel: text(input.ctaZaloLabel, fallback.ctaZaloLabel),
  };
}

export function normalizeContactPageContent(value: unknown): ContactPageContent {
  const input = record(value);
  const fallback = DEFAULT_CONTACT_PAGE_CONTENT;
  return Object.fromEntries(
    Object.entries(fallback).map(([key, fallbackValue]) => [key, text(input[key], fallbackValue)]),
  ) as unknown as ContactPageContent;
}
