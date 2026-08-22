# NDTHICH LAND

Website bất động sản và CMS nội bộ, xây bằng Next.js 16, React, TypeScript, Tailwind CSS, Google Sheets và Google Drive.

## Chạy local

Yêu cầu Node.js 20.9 trở lên.

```powershell
npm ci
Copy-Item .env.example .env.local
npm run dev
```

Ứng dụng chạy ở `http://localhost:3000`. Nếu chưa cấu hình Google, môi trường development dùng dữ liệu mock. Production luôn fail-closed: không có secrets thì dữ liệu demo không được trình bày như dữ liệu thật và các thao tác ghi sẽ bị từ chối.

## Kiểm tra chất lượng

```powershell
npm run check
npm run release:check
```

- `check`: lint, TypeScript, unit test và production build.
- `release:check`: lint, TypeScript, unit test, E2E mock và E2E fail-closed.
- Nếu cổng E2E mặc định 3100 đang bận, đặt cổng khác: `$env:PLAYWRIGHT_TEST_PORT="3110"`.
- Live E2E chỉ chạy khi đủ Google/admin secrets: `npm run test:e2e:live`.

## Cấu hình production

Sao chép danh sách biến từ `.env.example` vào kho secrets của nền tảng deploy. Tối thiểu cần:

- URL chính thức: `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_ZALO_URL`.
- Social footer (không cấu hình thì không hiện liên kết giả): `NEXT_PUBLIC_FACEBOOK_URL`, `NEXT_PUBLIC_YOUTUBE_URL`, `NEXT_PUBLIC_TIKTOK_URL`.
- Google: service-account email/private key, hai spreadsheet ID và media-folder ID.
- Admin: email, password hash và `AUTH_SECRET`.
- Nên tách riêng `RATE_LIMIT_SECRET` và `DRIVE_MEDIA_PROXY_SECRET` để có thể xoay vòng độc lập.
- Claude là tính năng nội bộ tùy chọn. Không đặt `ANTHROPIC_API_KEY` nếu không sử dụng.

Không bật `DEMO_MODE`, `VISUAL_FIXTURE_V2` hoặc `AUTH_COOKIE_INSECURE` trên production thật.

Tạo password hash và khởi tạo các tab CMS còn thiếu:

```powershell
npm run gd6:hash-password
npm run gd6:bootstrap-cms
```

Service account phải được chia sẻ quyền phù hợp vào cả spreadsheet và thư mục Drive trước khi bootstrap/deploy.
Bootstrap có thể chạy lại an toàn: tab mới được tạo, còn header cũ chỉ được nối thêm cột khi khớp chính xác với tiền tố schema hiện tại. Bản phát hành này cần chạy lại để tạo `WEB_ADMIN_SECURITY` và thêm `apartment_area`, `legal_status` vào `WEB_PROJECTS`.

## Media Round 8

`public/assets/round8/` chứa 20 ảnh nguồn 4K (~515 MB) và cố ý không được commit. Chạy `npm run assets:round8` để tạo 20 bản WebP 1920px trong `public/assets/round8-web/`; các bản tối ưu này được commit và là asset frontend dùng khi deploy. Nguồn cùng SHA256 nằm trong `.webby/client-approved-v2/ROUND8_ASSET_SOURCE.md` và manifest liên quan.

Deploy từ Git đã có đủ bản WebP nên không còn phụ thuộc chép tay 515 MB PNG. Trước khi mở production cho khách thật, vẫn cần xác nhận bộ Round 8 được duyệt làm nội dung chính thức hay thay bằng media dự án/BĐS thật từ CMS; không tự ý tìm hoặc tạo ảnh thay thế ngoài nguồn đã duyệt.

## Checklist phát hành

1. Cấu hình domain và `NEXT_PUBLIC_SITE_URL`; kiểm tra canonical, `/robots.txt`, `/sitemap.xml`.
2. Cấu hình Google/CMS/Drive, chạy bootstrap và nhập dữ liệu đã publish.
3. Xác nhận 20 media WebP Round 8 trả HTTP 200 trên deployment và nội dung đã được duyệt.
4. Chạy `npm run release:check` và lưu lại kết quả kiểm tra.
5. Smoke test desktop/mobile cho `/`, `/cho-thue`, `/du-an`, `/tin-tuc`, form liên hệ và đăng nhập admin.
6. Kiểm tra upload media, chỉnh sửa BĐS/dự án/tin tức và quyền truy cập file Drive.
7. Sau deploy, kiểm tra log lỗi, Core Web Vitals và luồng liên hệ thực tế.
