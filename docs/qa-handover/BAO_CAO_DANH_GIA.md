# Đánh giá QA cuối trước bàn giao — NDTHICH LAND

Ngày đánh giá: 2026-09-08
Số ảnh đã xem: 18 (public: 18, admin: 0)

Phạm vi: toàn bộ 9 màn hình công khai đã được chụp ở điện thoại 390×844 và máy tính 1440×900; cả 18 lượt đều trả về HTTP 200. Phần quản trị chưa được chụp vì môi trường đánh giá không có `ADMIN_EMAIL`/`ADMIN_PASSWORD`, đúng cơ chế bỏ qua có chủ đích của script. Vì vậy báo cáo này chưa xác nhận được trải nghiệm vận hành CMS.

## Điểm mạnh

- Hệ màu đỏ đậm–đen–trắng, logo, kiểu chữ, thẻ nội dung và nút kêu gọi hành động được dùng khá nhất quán từ trang chủ sang trang danh sách; tổng thể đã có bản sắc thương hiệu rõ — xem `qa-handover-output/2026-09-08-stable/public/desktop/01_TrangChu.png` và `qa-handover-output/2026-09-08-stable/public/desktop/04_DuAn.png`.
- Bố cục responsive nhìn chung tốt: các khối trên máy tính được xếp lại thành một cột dễ đọc trên điện thoại, không thấy chữ tràn hoặc trang bị cuộn ngang trong bộ ảnh — xem `qa-handover-output/2026-09-08-stable/public/mobile/02_ChoThue.png`, `qa-handover-output/2026-09-08-stable/public/mobile/03_ChiTietChoThue.png` và `qa-handover-output/2026-09-08-stable/public/mobile/09_LienHe.png`.
- Luồng tìm BĐS khá rõ: trang danh sách có lọc/sắp xếp, giá và diện tích nổi bật; trang chi tiết đặt nút gọi, Zalo và đặt lịch ở vị trí dễ thấy — xem `qa-handover-output/2026-09-08-stable/public/desktop/02_ChoThue.png` và `qa-handover-output/2026-09-08-stable/public/mobile/03_ChiTietChoThue.png`.
- Trang liên hệ đưa hotline và bản đồ lên đầu trang, sau đó mới tới form; người ít rành công nghệ vẫn có đường liên hệ trực tiếp — xem `qa-handover-output/2026-09-08-stable/public/desktop/09_LienHe.png` và `qa-handover-output/2026-09-08-stable/public/mobile/09_LienHe.png`.

## Vấn đề cần sửa trước khi bàn giao khách

- [Cao] Trang “Về chúng tôi” còn các mảng màu phẳng thay cho ảnh thương hiệu/dịch vụ, làm trang giống wireframe chưa hoàn thiện và giảm độ tin cậy — xem `qa-handover-output/2026-09-08-stable/public/desktop/06_GioiThieu.png` và `qa-handover-output/2026-09-08-stable/public/mobile/06_GioiThieu.png`.
- [Cao] Trang “Về chúng tôi” đang đưa thuật ngữ vận hành nội bộ ra cho khách đọc: “CMS”, “Chủ động cập nhật”, “Nội dung chi tiết theo CMS”. Cần thay bằng lợi ích kinh doanh/ngôn ngữ dành cho khách — xem `qa-handover-output/2026-09-08-stable/public/desktop/06_GioiThieu.png` và `qa-handover-output/2026-09-08-stable/public/mobile/06_GioiThieu.png`.
- [Cao] Trang tin tức còn nguyên câu mô tả kỹ thuật “Tin tức là module CMS riêng; card, ảnh và typography đã khóa.” Đây là ghi chú phát triển, không phải nội dung website thật — xem `qa-handover-output/2026-09-08-stable/public/desktop/07_TinTuc.png` và `qa-handover-output/2026-09-08-stable/public/mobile/07_TinTuc.png`.
- [Cao] Trang chi tiết cho thuê hiển thị “Khu vực theo dữ liệu Sheet”, làm lộ nguồn dữ liệu kỹ thuật và cho thấy dữ liệu mẫu chưa được làm sạch — xem `qa-handover-output/2026-09-08-stable/public/desktop/03_ChiTietChoThue.png` và `qa-handover-output/2026-09-08-stable/public/mobile/03_ChiTietChoThue.png`.
- [Cao] Trang chi tiết dự án còn nhiều dữ liệu chưa hoàn thiện: “Chủ đầu tư: Đang cập nhật”, “Diện tích căn hộ: Đang cập nhật”, “Pháp lý: Đang cập nhật”, phần tiến độ cũng chỉ báo đang cập nhật. Với một trang bán/giới thiệu dự án, đây là thông tin tạo niềm tin nên cần có dữ liệu thật trước bàn giao — xem `qa-handover-output/2026-09-08-stable/public/desktop/05_ChiTietDuAn.png` và `qa-handover-output/2026-09-08-stable/public/mobile/05_ChiTietDuAn.png`.
- [Trung bình] Trang bài viết hiển thị “Tư vấn nguồn đang trống” trong hộp liên hệ; đây là trạng thái dữ liệu nội bộ và khiến khách nghi ngờ tính hoàn thiện — xem `qa-handover-output/2026-09-08-stable/public/desktop/08_ChiTietTinTuc.png` và `qa-handover-output/2026-09-08-stable/public/mobile/08_ChiTietTinTuc.png`.
- [Trung bình] Trang liên hệ có câu “Form liên hệ chung, không phải chức năng đặt lịch xem nhà.” Câu này giải thích ranh giới kỹ thuật thay vì hướng dẫn khách; nên đổi thành một lời mời để lại nhu cầu và thời gian liên hệ — xem `qa-handover-output/2026-09-08-stable/public/desktop/09_LienHe.png` và `qa-handover-output/2026-09-08-stable/public/mobile/09_LienHe.png`.
- [Trung bình] Thông tin hotline chưa nhất quán: trang “Về chúng tôi” ghi “2 hotline”, trong khi trang Liên hệ và footer chỉ thể hiện một số chính. Cần sửa số liệu hoặc hiển thị đủ hai số — xem `qa-handover-output/2026-09-08-stable/public/desktop/06_GioiThieu.png` và `qa-handover-output/2026-09-08-stable/public/desktop/09_LienHe.png`.
- [Trung bình] Bốn ô thông tin đầu trang chi tiết dự án trên điện thoại bị rút gọn mạnh thành “Đang cập n...”, “Shop khối ...”, “282 sản ph...”; người dùng không đọc được trọn thông tin quan trọng. Nên cho phép xuống dòng hợp lý, rút gọn nhãn hoặc đổi sang bố cục 2 cột — xem `qa-handover-output/2026-09-08-stable/public/mobile/05_ChiTietDuAn.png`.

## Vấn đề có thể để sau (không chặn bàn giao)

- Hai tin đầu trong danh sách cùng mang tên “P.301 - Tòa A” dù một tin là căn hộ 70m² và một tin là studio 35m²; nên đặt tiêu đề phân biệt rõ hơn khi nhập dữ liệu thật để tránh khách tưởng bị lặp — xem `qa-handover-output/2026-09-08-stable/public/desktop/02_ChoThue.png` và `qa-handover-output/2026-09-08-stable/public/mobile/02_ChoThue.png`.
- Bài viết mẫu khá ngắn, chỉ gồm ba ý cơ bản nên chưa thể hiện nhiều chuyên môn; có thể mở rộng sau khi đã xử lý toàn bộ nội dung nội bộ/placeholder ở nhóm trên — xem `qa-handover-output/2026-09-08-stable/public/desktop/08_ChiTietTinTuc.png` và `qa-handover-output/2026-09-08-stable/public/mobile/08_ChiTietTinTuc.png`.
- Footer còn dùng tiếng Anh “QUICK LINKS” và “All rights reserved.” trong khi phần còn lại gần như hoàn toàn bằng tiếng Việt. Có thể Việt hóa để trải nghiệm đồng nhất hơn — xem `qa-handover-output/2026-09-08-stable/public/desktop/01_TrangChu.png` và `qa-handover-output/2026-09-08-stable/public/mobile/09_LienHe.png`.

## Kết luận

Phần giao diện công khai đã có nền tảng tốt, nhất quán và dùng ổn trên cả điện thoại lẫn máy tính, nhưng **chưa nên bàn giao cho khách vận hành thật** ở trạng thái hiện tại. Ưu tiên trước hết là thay ảnh placeholder, xóa toàn bộ câu chữ kỹ thuật/nội bộ đang lộ trên website, nạp dữ liệu dự án thật và sửa các ô thông tin bị cắt trên điện thoại. Sau đó cần chạy lại đủ phần admin bằng tài khoản hợp lệ. Ngoài phạm vi quan sát bằng ảnh, `HANDOVER.md` cũng xác nhận site vẫn ở `DEMO_MODE=true` và dữ liệu admin chưa lưu bền vững; đây là điều kiện bắt buộc phải xử lý trước khi khách bắt đầu nhập dữ liệu thật.
