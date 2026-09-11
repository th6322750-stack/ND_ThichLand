# Đánh giá QA cuối trước bàn giao — NDTHICH LAND

Ngày đánh giá: 2026-09-08

## Phạm vi và kết quả tổng quan

- Đã xem 40 ảnh local: public 18 ảnh (9 màn hình × điện thoại/máy tính), admin 22 ảnh (11 màn hình × điện thoại/máy tính). Cả 40 lượt đều trả về HTTP 200.
- Đã kiểm tra thêm 18 ảnh public trên `https://ndthichland.com.vn`; cả 18 lượt đều trả về HTTP 200.
- Đã đăng nhập admin local thành công, kiểm tra redirect bảo vệ `/admin` và toàn bộ menu CMS. Không ghi tài khoản/mật khẩu vào báo cáo hoặc source.
- Lint: đạt. TypeScript: đạt. Build production Next.js: đạt.
- Unit test: 341/341 đạt khi chạy tuần tự ổn định; trong đó có kiểm tra xác thực, phân quyền, validation, dữ liệu, SEO và accessibility.
- End-to-end giả lập: 36/36 đạt, gồm đăng nhập/đăng xuất, cookie phiên, chống cookie giả, form nội dung, tìm kiếm/lọc/sắp xếp/yêu thích, SEO và điều hướng mobile.
- End-to-end fail-closed: 5/5 đạt; khi thiếu cấu hình thật, hệ thống không công bố dữ liệu mẫu, không báo lưu giả thành công và không cho vào CMS.
- Header bảo mật website thật: có HSTS, CSP, `X-Frame-Options: SAMEORIGIN`, `X-Content-Type-Options: nosniff` và `Referrer-Policy: strict-origin-when-cross-origin`.

## Điểm mạnh

- Hệ màu đỏ đậm–đen–trắng, logo, kiểu chữ, thẻ nội dung và nút kêu gọi hành động được dùng nhất quán trên phần public — xem `qa-handover-output/2026-09-08-local-full-system/public/desktop/01_TrangChu.png` và `qa-handover-output/2026-09-08-local-full-system/public/desktop/04_DuAn.png`.
- Public responsive tốt: không thấy chữ tràn, nút chồng nhau hoặc cuộn ngang trong 18 ảnh — xem `qa-handover-output/2026-09-08-local-full-system/public/mobile/02_ChoThue.png`, `qa-handover-output/2026-09-08-local-full-system/public/mobile/03_ChiTietChoThue.png` và `qa-handover-output/2026-09-08-local-full-system/public/mobile/09_LienHe.png`.
- Luồng tìm BĐS rõ ràng; trang chi tiết đặt gọi điện, Zalo và đặt lịch ở vị trí dễ thấy — xem `qa-handover-output/2026-09-08-local-full-system/public/desktop/02_ChoThue.png` và `qa-handover-output/2026-09-08-local-full-system/public/mobile/03_ChiTietChoThue.png`.
- Admin desktop có bố cục nhất quán, điều hướng rõ, phân biệt nội dung công khai và dữ liệu nội bộ tương đối tốt — xem `qa-handover-output/2026-09-08-local-full-system/admin/desktop/01_Dashboard.png`, `qa-handover-output/2026-09-08-local-full-system/admin/desktop/02_BDS_List.png` và `qa-handover-output/2026-09-08-local-full-system/admin/desktop/09_CaiDat.png`.
- Các form admin có bản xem trước gần với giao diện thật và mô tả khá cụ thể; đây là điểm tốt cho nhân viên ít rành kỹ thuật — xem `qa-handover-output/2026-09-08-local-full-system/admin/desktop/03_BDS_New.png` và `qa-handover-output/2026-09-08-local-full-system/admin/desktop/07_TinTuc_New.png`.
- Backend có hành vi an toàn khi thiếu cấu hình; các bài kiểm tra đăng nhập, cookie, phân quyền, validation và lưu dữ liệu giả lập đều đạt.

## Vấn đề cần sửa trước khi bàn giao khách

- [Cao] Website và Media vẫn chứa ảnh placeholder/mảng màu thay ảnh thật. Trang “Về chúng tôi” trông như wireframe; thư viện Media còn chữ `PROPERTY/PROJECT/NEWS MEDIA PLACEHOLDER` — xem `qa-handover-output/2026-09-08-local-full-system/public/desktop/06_GioiThieu.png`, `qa-handover-output/2026-09-08-local-full-system/admin/desktop/08_Media.png` và `qa-handover-output/2026-09-08-local-full-system/admin/mobile/08_Media.png`.
- [Cao] Nội dung kỹ thuật/nội bộ đang lộ ra public: “CMS”, “Nội dung chi tiết theo CMS”, “module CMS”, “Khu vực theo dữ liệu Sheet”, “Tư vấn nguồn đang trống” và lời giải thích kỹ thuật về form liên hệ — xem `qa-handover-output/2026-09-08-local-full-system/public/desktop/06_GioiThieu.png`, `qa-handover-output/2026-09-08-local-full-system/public/desktop/07_TinTuc.png`, `qa-handover-output/2026-09-08-local-full-system/public/desktop/03_ChiTietChoThue.png`, `qa-handover-output/2026-09-08-local-full-system/public/desktop/08_ChiTietTinTuc.png` và `qa-handover-output/2026-09-08-local-full-system/public/desktop/09_LienHe.png`.
- [Cao] Dữ liệu dự án chưa sẵn sàng bán hàng: còn “Chủ đầu tư/Diện tích/Pháp lý: Đang cập nhật”, tiến độ thiếu ảnh/thông tin thật — xem `qa-handover-output/2026-09-08-local-full-system/public/desktop/05_ChiTietDuAn.png` và `qa-handover-output/2026-09-08-local-full-system/public/mobile/05_ChiTietDuAn.png`.
- [Cao nếu khách dùng điện thoại] Các bảng Dashboard, BĐS, Dự án và Tin tức trong admin bị cắt ngang ở 390px; cột trạng thái/thao tác không nhìn thấy và không có dấu hiệu rõ rằng cần kéo ngang — xem `qa-handover-output/2026-09-08-local-full-system/admin/mobile/01_Dashboard.png`, `qa-handover-output/2026-09-08-local-full-system/admin/mobile/02_BDS_List.png`, `qa-handover-output/2026-09-08-local-full-system/admin/mobile/04_DuAn_List.png` và `qa-handover-output/2026-09-08-local-full-system/admin/mobile/06_TinTuc_List.png`.
- [Cao] Site thật vẫn ở `DEMO_MODE=true`; dữ liệu admin chưa lưu bền vững vì Google Sheets/Drive thật chưa được cấu hình. Đây là điều kiện bắt buộc trước khi khách nhập dữ liệu vận hành.
- [Cao về vận hành tài khoản] Ảnh local cho thấy 2FA đang tắt. Trước khi giao tài khoản thật, cần bật Authenticator; nếu mật khẩu local được dùng lại ở môi trường thật hoặc đã chia sẻ qua kênh khác, phải đổi mật khẩu thật trước bàn giao — xem `qa-handover-output/2026-09-08-local-full-system/admin/desktop/09_CaiDat.png`.
- [Trung bình] Trên form thêm BĐS và Dự án ở mobile, hai nút Lưu chen vào vùng tiêu đề/mô tả; form rất dài nhưng nút Lưu chỉ ở đầu trang, buộc người vận hành cuộn ngược lên — xem `qa-handover-output/2026-09-08-local-full-system/admin/mobile/03_BDS_New.png` và `qa-handover-output/2026-09-08-local-full-system/admin/mobile/05_DuAn_New.png`.
- [Trung bình] Admin vẫn dùng từ kỹ thuật/pha tiếng Anh như “public”, “gallery”, “tab”, “Link video”, “WEB”, “CMS”. Cần Việt hóa nếu người vận hành không rành kỹ thuật — xem `qa-handover-output/2026-09-08-local-full-system/admin/desktop/03_BDS_New.png`, `qa-handover-output/2026-09-08-local-full-system/admin/desktop/05_DuAn_New.png` và `qa-handover-output/2026-09-08-local-full-system/admin/desktop/10_TrangGioiThieu.png`.
- [Trung bình] `npm audit` báo một lỗ hổng gián tiếp mức trung bình trong `qs@6.15.3` qua `googleapis-common`; không có cảnh báo cao/nghiêm trọng. Bản vá khả dụng là `qs@6.16.0`; nên cập nhật lockfile và chạy lại toàn bộ test trước bàn giao.
- [Trung bình] Lệnh chuẩn `npm run release:check` bị 9 timeout khi 56 tệp unit test chạy song song trên máy kiểm nghiệm; cùng 341 bài đều đạt khi chạy tuần tự. Nên giới hạn worker trong Vitest/CI để quy trình phát hành ổn định và tránh báo lỗi giả.
- [Trung bình] Bốn ô thông tin đầu trang chi tiết dự án trên điện thoại bị rút gọn thành “Đang cập n...”, “Shop khối ...”, “282 sản ph...”; nên đổi sang lưới hai cột hoặc cho xuống dòng — xem `qa-handover-output/2026-09-08-local-full-system/public/mobile/05_ChiTietDuAn.png`.
- [Trung bình] Thông tin “2 hotline” trên trang Về chúng tôi không khớp với một hotline được hiển thị ở trang Liên hệ/footer — xem `qa-handover-output/2026-09-08-local-full-system/public/desktop/06_GioiThieu.png` và `qa-handover-output/2026-09-08-local-full-system/public/desktop/09_LienHe.png`.

## Vấn đề có thể để sau (không chặn bàn giao)

- Hai tin đầu cùng tên “P.301 - Tòa A” dù khác loại và diện tích; nên đặt tiêu đề phân biệt rõ hơn khi nhập dữ liệu thật — xem `qa-handover-output/2026-09-08-local-full-system/public/desktop/02_ChoThue.png`.
- Bài viết mẫu ngắn, chưa thể hiện nhiều chuyên môn; có thể mở rộng sau khi xử lý placeholder và nội dung kỹ thuật — xem `qa-handover-output/2026-09-08-local-full-system/public/desktop/08_ChiTietTinTuc.png`.
- Footer còn “QUICK LINKS” và “All rights reserved.”; có thể Việt hóa để đồng nhất — xem `qa-handover-output/2026-09-08-local-full-system/public/mobile/09_LienHe.png`.
- Form chỉnh Trang Về chúng tôi trên mobile rất dài nhưng vẫn đọc và nhập được; có thể bổ sung mục lục thu gọn/sticky save sau — xem `qa-handover-output/2026-09-08-local-full-system/admin/mobile/10_TrangGioiThieu.png`.

## Kết luận

Mã nguồn frontend/backend và các luồng hệ thống cốt lõi **đạt về mặt kỹ thuật**: build sạch, 341 unit test, 36 browser E2E và 5 fail-closed E2E đều qua ở chế độ ổn định. Tuy nhiên sản phẩm **chưa nên bàn giao cho khách vận hành thật tối nay** nếu chưa xử lý tối thiểu bốn nhóm: cấu hình lưu dữ liệu thật và tắt demo mode; thay toàn bộ placeholder/nội dung kỹ thuật public; hoàn thiện dữ liệu dự án; bật 2FA/đổi mật khẩu bàn giao. Nếu khách bắt buộc vận hành admin trên điện thoại, lỗi bảng bị cắt cũng phải sửa trước; nếu thống nhất vận hành bằng máy tính trong giai đoạn đầu, lỗi này có thể được ghi thành điều kiện bàn giao có thời hạn.
