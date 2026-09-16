# Bàn giao dự án — NDTHICH LAND

Cập nhật: 2026-09-17

## 1. Truy cập nhanh

| Mục | Giá trị |
|---|---|
| Website | https://ndthichland.com.vn |
| Trang quản trị | https://ndthichland.com.vn/admin |
| Tài khoản admin | Cấp riêng qua kênh bảo mật — cố ý không ghi trong tài liệu này |
| Repo | https://github.com/th6322750-stack/ND_ThichLand — nhánh `claude/pha2-client-visual-v2` |
| Hạ tầng deploy | Vercel — project `ndthich-land` (tài khoản `ndthich` của khách) |
| Lưu ảnh/video | Vercel Blob — store `ndthich-media` |
| Dữ liệu nội dung | Google Sheets (tài khoản `ndthich6868@gmail.com`) |

Đổi mật khẩu / bật xác thực 2 bước: vào **Cài đặt chung → Bảo mật tài khoản admin**.

## 2. Hiện trạng dữ liệu

Website **đang chạy thật**, không còn ở chế độ demo:

- Toàn bộ BĐS, dự án, tin tức hiển thị trên web là **dữ liệu thật**, đọc trực tiếp từ Google Sheets.
- Nội dung admin thêm/sửa được **lưu bền vững** vào Google Sheets, không mất khi máy chủ khởi động lại.
- Ảnh/video tải lên trong admin lưu ở **Vercel Blob** (không phải Google Drive — tài khoản dịch vụ Google không có dung lượng lưu trữ riêng nên không tải file lên Drive được).
- Lead từ biểu mẫu liên hệ ghi vào tab `WEB_CONTACTS` trong Google Sheet.

Đã kiểm chứng trên web thật: gửi thử biểu mẫu thấy lead vào đúng Sheet; tải ảnh lên trong admin thấy hiển thị đúng; trang cho thuê liệt kê đúng số tin có trong Sheet.

## 3. Đã hoàn thành

**Website công khai** — Trang chủ, Dự án (danh sách + chi tiết), Cho thuê (danh sách + chi tiết, bộ lọc), Về chúng tôi, Tin tức (danh sách + chi tiết), Liên hệ. Bản đồ Google Maps thật theo địa chỉ cấu hình được. Xem hồ sơ năng lực dạng lật trang PDF ngay trên web. Lưu tin yêu thích (lưu trên trình duyệt khách). Kéo/vuốt được các dải ảnh trên trang chủ. **Khách và nhân viên tải được ảnh BĐS/dự án về máy** — tải từng ảnh trong khung xem phóng to, hoặc tải tất cả ảnh của một tin dưới dạng file nén.

**Quản trị (CMS)** — Đăng nhập có giới hạn số lần thử sai, hỗ trợ xác thực 2 bước. Quản lý BĐS cho thuê, Dự án, Tin tức (thêm/sửa/xoá, lưu nháp hoặc đăng ngay). Thư viện Media dùng chung. Cài đặt liên hệ + bản đồ + hồ sơ năng lực có xem trước trực tiếp. Form nhập liệu dùng ngôn ngữ thường ngày, không thuật ngữ kỹ thuật; khi lưu thiếu thông tin, trang tự cuộn tới đúng chỗ cần sửa.

**Kỹ thuật nền** — Tối ưu SEO (metadata, sitemap, dữ liệu có cấu trúc cho Google). Đã lắp sẵn Google Analytics 4 + đo tốc độ tải trang, hiện đang **tắt** (xem mục 4). Bảo mật: mã hoá mật khẩu, giới hạn thử sai đăng nhập, các header bảo mật chuẩn. Đọc Google Sheets có bộ nhớ đệm và gộp yêu cầu trùng, đã thử tải 100 lượt truy cập đồng thời không lỗi. 376 test tự động + kiểm tra kiểu dữ liệu chạy sạch trước mỗi lần đẩy code.

## 4. Việc còn để ngỏ, cố ý chưa làm

- **Google Analytics 4**: khung đã lắp sẵn, chỉ cần tạo tài khoản GA4 và điền mã đo (`NEXT_PUBLIC_GA_MEASUREMENT_ID`) vào Vercel là chạy ngay, không cần sửa code.
- **Xác thực 2 bước cho admin**: hệ thống hỗ trợ sẵn nhưng hiện **đang tắt**. Nên bật ngay sau khi tiếp nhận.
- **Chưa nối GitHub với project Vercel mới**: hiện deploy bằng lệnh thủ công (mục 6). Muốn đẩy code là tự động deploy thì chạy `vercel git connect` và cấp quyền GitHub cho tài khoản Vercel.
- **Thông báo lead qua Zalo**: website chưa tự gửi thông báo khi có lead mới; cần Zalo OA hoặc webhook nếu muốn.

## 5. Vận hành kỹ thuật

**Deploy bản mới** (từ thư mục dự án, đã đăng nhập đúng tài khoản Vercel):

```
vercel --prod
```

Lưu ý: project Vercel mới **không nối GitHub**, nên `git push` chỉ để lưu trữ mã nguồn, không tự deploy.

**Khi khoá Google hết hạn / bị thu hồi** (web sẽ lỗi toàn trang, log Vercel báo `invalid_grant`): tải khoá JSON mới từ Google Cloud Console rồi chạy `node scripts/fix-google-key.mjs --key <file.json>`.

**Khi dựng project Vercel mới từ đầu**: `node scripts/setup-vercel-env.mjs` nạp toàn bộ biến môi trường Production.

**Đổi mật khẩu admin bằng script**: `node scripts/fix-admin-sheet-password.mjs`.
Quan trọng: một khi dòng `WEB_ADMIN_SECURITY` đã tồn tại trong Google Sheet thì **mật khẩu trong Sheet được ưu tiên, biến môi trường `ADMIN_PASSWORD_HASH` bị bỏ qua**. Chỉ sửa biến môi trường mà không sửa dòng trong Sheet sẽ không có tác dụng — đây là điểm đã từng gây mất thời gian dò lỗi.

**Biến môi trường cần có trên Vercel (Production)**: `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY`, `GOOGLE_CMS_SPREADSHEET_ID`, `GOOGLE_RENTAL_SPREADSHEET_ID`, `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH`, `AUTH_SECRET`, `NEXT_PUBLIC_SITE_URL`, `BLOB_READ_WRITE_TOKEN`.

## 6. Tài liệu liên quan

- `docs/qa-handover/HUONG_DAN_CHATGPT.md` — hướng dẫn tự chụp toàn bộ giao diện trên web thật để đánh giá độc lập.
- `docs/qa-handover/BAO_CAO_DANH_GIA.md` — báo cáo đánh giá đã thực hiện.
- `DEPLOY_VPS.md` — phương án triển khai lên VPS riêng. **Không dùng cho hiện tại** (dự án đang chạy trên Vercel); giữ lại làm tham khảo nếu sau này muốn tự vận hành máy chủ.
