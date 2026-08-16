import type { NewsArticle } from "../types";

// Real approved demo photography (same Round 8 set already used elsewhere),
// one per article so the news list/detail pages show a real cover instead
// of a blank placeholder tile during a client demo.
const R8 = (n: string) => `/assets/round8/${n}`;
const COVER_RENTAL_TIPS = R8("R8_09-pho-thi-hien-dai-luc-chang-vang.png");
const COVER_APARTMENT_CHECKLIST = R8("R8_17-noi-that-can-ho-cao-cap.png");
const COVER_STOREFRONT_TREND = R8("R8_05-quang-truong-hien-dai-duoi-thap-kinh.png");
const COVER_SERVICE_FEE = R8("R8_14-san-chung-cu-xanh-mat.png");
const COVER_OFFICE_CRITERIA = R8("R8_04-toa-nha-kinh-giua-quang-truong-xanh.png");
const COVER_COMPANY_NEWS = R8("R8_01-toa-thap-ven-song-luc-hoang-hon.png");

export const news: NewsArticle[] = [
  {
    slug: "kinh-nghiem-thue-nha-phu-hop-ngan-sach",
    title: "Kinh nghiệm thuê nhà phù hợp ngân sách",
    category: "Kinh nghiệm",
    publishedAt: "2026-08-12",
    readMinutes: 5,
    excerpt: "Những lưu ý giúp bạn tìm được chỗ thuê phù hợp với ngân sách và nhu cầu thực tế.",
    sections: [
      {
        heading: "1. Xác định ngân sách rõ ràng",
        body: "Tính toán tổng chi phí gồm giá thuê, phí dịch vụ và chi phí phát sinh trước khi tìm phòng.",
      },
      {
        heading: "2. So sánh khu vực",
        body: "Đối chiếu giá và tiện ích giữa các khu vực để chọn nơi phù hợp nhất với công việc và sinh hoạt.",
      },
      {
        heading: "3. Đọc kỹ điều khoản hợp đồng",
        body: "Xác nhận thời hạn, cọc, lịch thanh toán và các chi phí phát sinh trước khi ký hợp đồng.",
      },
    ],
    cover: COVER_RENTAL_TIPS,
  },
  {
    slug: "checklist-xem-can-ho-truoc-khi-ky-hop-dong",
    title: "Checklist xem căn hộ trước khi ký hợp đồng thuê",
    category: "Kinh nghiệm",
    publishedAt: "2026-08-12",
    readMinutes: 5,
    excerpt: "Danh sách kiểm tra cần thiết trước khi đặt bút ký hợp đồng thuê căn hộ.",
    sections: [
      {
        heading: "1. Kiểm tra thông tin cơ bản",
        body: "Đối chiếu địa chỉ, diện tích, giá thuê, tình trạng và các phí dịch vụ. Đây là những thông tin public quan trọng giúp người thuê so sánh nhanh.",
      },
      {
        heading: "2. Xem tình trạng thực tế",
        body: "Kiểm tra ánh sáng, thông gió, nội thất, chất lượng thiết bị và các hạng mục cần bảo trì trước khi nhận bàn giao.",
      },
      {
        heading: "3. Xác nhận điều khoản",
        body: "Thống nhất thời hạn, cọc, lịch thanh toán và chi phí phát sinh. Mọi điều khoản cuối cùng cần được xác nhận trong hợp đồng.",
      },
    ],
    cover: COVER_APARTMENT_CHECKLIST,
  },
  {
    slug: "xu-huong-mat-bang-kinh-doanh-tai-ha-noi",
    title: "Xu hướng mặt bằng kinh doanh tại Hà Nội",
    category: "Kinh nghiệm",
    publishedAt: "2026-08-12",
    readMinutes: 5,
    excerpt: "Cập nhật xu hướng thuê mặt bằng kinh doanh tại Hà Nội trong giai đoạn hiện tại.",
    sections: [
      {
        heading: "1. Vị trí mặt phố vẫn dẫn đầu",
        body: "Mặt bằng mặt phố tại các khu đông dân cư tiếp tục được ưu tiên tìm thuê.",
      },
      {
        heading: "2. Nhu cầu diện tích vừa và nhỏ tăng",
        body: "Nhiều đơn vị kinh doanh ưu tiên mặt bằng diện tích vừa để tối ưu chi phí vận hành.",
      },
      {
        heading: "3. Giá thuê ổn định theo khu vực",
        body: "Giá thuê được công khai rõ ràng giúp bên thuê dễ so sánh giữa các khu vực.",
      },
    ],
    cover: COVER_STOREFRONT_TREND,
  },
  {
    slug: "cach-doc-chi-phi-dich-vu-khi-thue",
    title: "Cách đọc chi phí dịch vụ khi thuê",
    category: "Kinh nghiệm",
    publishedAt: "2026-08-12",
    readMinutes: 5,
    excerpt: "Hiểu đúng các khoản phí dịch vụ trước khi quyết định thuê.",
    sections: [
      {
        heading: "1. Phân biệt phí dịch vụ và giá thuê",
        body: "Giá thuê và phí dịch vụ là hai khoản riêng biệt cần được công khai rõ ràng.",
      },
      {
        heading: "2. Hỏi rõ cách tính phí",
        body: "Xác nhận phí dịch vụ tính theo tháng hay theo mức sử dụng thực tế.",
      },
      {
        heading: "3. Đối chiếu với hợp đồng",
        body: "Đảm bảo các khoản phí dịch vụ được ghi rõ trong hợp đồng trước khi ký.",
      },
    ],
    cover: COVER_SERVICE_FEE,
  },
  {
    slug: "cac-tieu-chi-chon-van-phong-hieu-qua",
    title: "Các tiêu chí chọn văn phòng hiệu quả",
    category: "NDTHICH",
    publishedAt: "2026-08-12",
    readMinutes: 5,
    excerpt: "Những tiêu chí giúp doanh nghiệp chọn văn phòng phù hợp với nhu cầu vận hành.",
    sections: [
      {
        heading: "1. Vị trí kết nối giao thông",
        body: "Ưu tiên văn phòng gần trục giao thông chính, thuận tiện di chuyển cho nhân viên và khách hàng.",
      },
      {
        heading: "2. Diện tích phù hợp quy mô",
        body: "Tính toán diện tích theo số lượng nhân sự và kế hoạch mở rộng trong tương lai.",
      },
      {
        heading: "3. Hạ tầng kỹ thuật",
        body: "Kiểm tra hệ thống điện, mạng, thang máy và an ninh trước khi ký hợp đồng thuê.",
      },
    ],
    cover: COVER_OFFICE_CRITERIA,
  },
  {
    slug: "tin-du-an-va-hoat-dong-ndthich",
    title: "Tin dự án và hoạt động NDTHICH",
    category: "NDTHICH",
    publishedAt: "2026-08-12",
    readMinutes: 5,
    excerpt: "Cập nhật tin tức mới nhất về các dự án và hoạt động của công ty.",
    sections: [
      {
        heading: "1. Tiến độ các dự án đang triển khai",
        body: "Cập nhật tiến độ xây dựng và bàn giao của các dự án công ty đang tham gia.",
      },
      {
        heading: "2. Hoạt động kết nối khách hàng",
        body: "NDTHICH duy trì kênh liên hệ trực tiếp để hỗ trợ khách hàng nhanh chóng.",
      },
      {
        heading: "3. Định hướng phát triển",
        body: "Công ty tiếp tục mở rộng nguồn bất động sản cho thuê và danh mục dự án.",
      },
    ],
    cover: COVER_COMPANY_NEWS,
  },
];

