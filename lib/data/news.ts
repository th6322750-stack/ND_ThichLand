import type { NewsArticle } from "../types";

const PLACEHOLDER = "/assets/placeholders/news-placeholder.svg";

export const news: NewsArticle[] = [
  {
    slug: "kinh-nghiem-thue-nha-phu-hop-ngan-sach",
    title: "Kinh nghiệm thuê nhà phù hợp ngân sách",
    category: "Kinh nghiệm",
    publishedAt: "2026-08-12",
    readMinutes: 5,
    excerpt: "Những lưu ý giúp bạn tìm được chỗ thuê phù hợp với ngân sách và nhu cầu thực tế.",
    body: "Nội dung chi tiết về kinh nghiệm thuê nhà phù hợp ngân sách, theo dữ liệu biên tập.",
    cover: PLACEHOLDER,
  },
  {
    slug: "checklist-xem-can-ho-truoc-khi-ky-hop-dong",
    title: "Checklist xem căn hộ trước khi ký hợp đồng",
    category: "Kinh nghiệm",
    publishedAt: "2026-08-12",
    readMinutes: 5,
    excerpt: "Danh sách kiểm tra cần thiết trước khi đặt bút ký hợp đồng thuê căn hộ.",
    body: "Nội dung chi tiết về checklist xem căn hộ trước khi ký hợp đồng, theo dữ liệu biên tập.",
    cover: PLACEHOLDER,
  },
  {
    slug: "xu-huong-mat-bang-kinh-doanh-tai-ha-noi",
    title: "Xu hướng mặt bằng kinh doanh tại Hà Nội",
    category: "Kinh nghiệm",
    publishedAt: "2026-08-12",
    readMinutes: 5,
    excerpt: "Cập nhật xu hướng thuê mặt bằng kinh doanh tại Hà Nội trong giai đoạn hiện tại.",
    body: "Nội dung chi tiết về xu hướng mặt bằng kinh doanh tại Hà Nội, theo dữ liệu biên tập.",
    cover: PLACEHOLDER,
  },
];

export function getNewsBySlug(slug: string): NewsArticle | undefined {
  return news.find((n) => n.slug === slug);
}
