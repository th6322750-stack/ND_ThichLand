# Bàn giao dự án — NDTHICH LAND

Cập nhật: 2026-09-08

## 1. Truy cập nhanh

| Mục | Giá trị |
|---|---|
| Website | https://ndthichland.com.vn |
| Trang quản trị | https://ndthichland.com.vn/admin |
| Tài khoản admin | Xem biến môi trường `ADMIN_EMAIL` trên Vercel (không ghi ở đây để tránh lộ khi tài liệu này được chia sẻ) |
| Repo | https://github.com/th6322750-stack/ND_ThichLand — nhánh `claude/pha2-client-visual-v2` |
| Hạ tầng deploy | Vercel — project `ndthich-demo-2026` (org `lucifer-scmta`) |

Đổi mật khẩu / bật xác thực 2 bước: vào **Cài đặt chung → Bảo mật tài khoản admin**.

## 2. Hiện trạng dữ liệu — ĐIỂM QUAN TRỌNG NHẤT CẦN BIẾT

Site đang chạy ở **chế độ demo** (biến môi trường `DEMO_MODE=true` trên Vercel), nghĩa là:

- Toàn bộ tin BĐS, dự án, tin tức đang hiển thị là **dữ liệu mẫu**, không phải dữ liệu thật của khách.
- Chưa kết nối Google Sheets/Drive thật (`GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY`, các spreadsheet ID đều chưa cấu hình trên Vercel).
- **Bất kỳ nội dung nào admin thêm/sửa qua trang quản trị lúc này đều không được lưu bền vững** — dữ liệu sống trong bộ nhớ tạm của server, có thể biến mất bất cứ lúc nào Vercel khởi động lại phiên chạy khác (rất hay xảy ra, không báo trước).

→ Trước khi bàn giao khách vận hành thật, cần: (a) tạo Google Sheet + Google Drive thật theo đúng schema dự án đã dùng, (b) điền các biến môi trường Google ở trên vào Vercel, (c) tắt `DEMO_MODE`. Đây là việc kỹ thuật, không phải việc của khách.

Ngoại lệ đã xử lý riêng: **địa chỉ, hotline, giờ làm việc, hồ sơ năng lực (PDF)** hiển thị trên trang chủ là dữ liệu thật của công ty, được cố định sẵn trong code (không phụ thuộc Google Sheets) nên luôn hiển thị đúng dù demo hay thật.

## 3. Đã hoàn thành

**Website công khai** — Trang chủ, Dự án (danh sách + chi tiết), Cho thuê (danh sách + chi tiết, bộ lọc), Về chúng tôi, Tin tức (danh sách + chi tiết), Liên hệ. Bản đồ Google Maps thật theo địa chỉ cấu hình được. Xem hồ sơ năng lực dạng lật trang PDF ngay trên web. Lưu tin yêu thích (lưu trên trình duyệt khách, có nút riêng trên PC lẫn điện thoại). Kéo/vuốt được các dải ảnh trên trang chủ. Hiệu ứng cuộn trang mượt.

**Quản trị (CMS)** — Đăng nhập có giới hạn số lần thử sai, hỗ trợ xác thực 2 bước. Quản lý BĐS cho thuê, Dự án, Tin tức (thêm/sửa/xoá, lưu nháp hoặc đăng ngay). Thư viện Media dùng chung. Cài đặt liên hệ + bản đồ + hồ sơ năng lực có xem trước trực tiếp. Toàn bộ form nhập liệu vừa được rà lại để dùng ngôn ngữ thường ngày, không thuật ngữ kỹ thuật; khi lưu thiếu thông tin, trang tự cuộn tới đúng chỗ cần sửa.

**Kỹ thuật nền** — Tối ưu SEO (metadata, sitemap, dữ liệu có cấu trúc cho Google). Đã lắp sẵn Google Analytics 4 + đo tốc độ tải trang, hiện đang **tắt** (xem mục 4). Bảo mật: mã hoá mật khẩu, giới hạn thử sai đăng nhập, các header bảo mật chuẩn. 341 test tự động + kiểm tra kiểu dữ liệu chạy sạch trước mỗi lần đẩy code.

## 4. Việc còn để ngỏ, cố ý chưa làm

- **Google Analytics 4**: khung đã lắp sẵn, chỉ cần tạo tài khoản GA4 và điền mã đo (`NEXT_PUBLIC_GA_MEASUREMENT_ID`) vào Vercel là chạy ngay, không cần sửa code.
- **Dữ liệu thật (mục 2)**: việc quan trọng nhất trước khi khách dùng thật.
- Kiến trúc lưu trữ hiện dùng Google Sheets/Drive (phù hợp quy mô nhỏ, khách tự sửa được qua Sheet quen thuộc). Nếu sau này cần mạnh hơn (nhiều người dùng cùng lúc, tốc độ cao hơn), có thể chuyển sang VPS + database riêng — không gấp, làm khi thật sự cần.

## 5. Đánh giá QA cuối trước bàn giao

Xem `docs/qa-handover/HUONG_DAN_CHATGPT.md` — hướng dẫn dùng CLI để tự chụp ảnh toàn bộ giao diện (cả public lẫn admin, cả điện thoại lẫn máy tính) trên website thật và đưa ra nhận xét cuối cùng độc lập, không phụ thuộc vào những gì đã tự đánh giá trong lúc làm.
