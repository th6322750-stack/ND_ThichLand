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

## Media Round 8

`public/assets/round8/` chứa 20 ảnh demo 4K (~515 MB) và cố ý không được commit. Nguồn cùng SHA256 nằm trong `.webby/client-approved-v2/ROUND8_ASSET_SOURCE.md` và manifest liên quan.

Trước khi deploy từ Git, phải thực hiện một trong hai hướng được duyệt:

1. Đưa các binary đã duyệt lên CDN/object storage và cập nhật URL; hoặc
2. Thay media demo bằng media dự án/BĐS thật từ CMS.

Không tìm, tạo hoặc thay ảnh khác ngoài nguồn đã duyệt. Hiện code vẫn có một số tham chiếu Round 8, vì vậy đây là blocker nội dung/hosting cần xử lý trước production launch.

## Checklist phát hành

1. Cấu hình domain và `NEXT_PUBLIC_SITE_URL`; kiểm tra canonical, `/robots.txt`, `/sitemap.xml`.
2. Cấu hình Google/CMS/Drive, chạy bootstrap và nhập dữ liệu đã publish.
3. Xác nhận media Round 8 không bị thiếu trên deployment.
4. Chạy `npm run release:check` và lưu lại kết quả kiểm tra.
5. Smoke test desktop/mobile cho `/`, `/cho-thue`, `/du-an`, `/tin-tuc`, form liên hệ và đăng nhập admin.
6. Kiểm tra upload media, chỉnh sửa BĐS/dự án/tin tức và quyền truy cập file Drive.
7. Sau deploy, kiểm tra log lỗi, Core Web Vitals và luồng liên hệ thực tế.
