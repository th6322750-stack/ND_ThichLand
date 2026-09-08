# Hướng dẫn: tự chụp ảnh + đánh giá giao diện web (dùng CLI)

Tài liệu này dành cho một AI có quyền chạy lệnh CLI (terminal), được giao nhiệm vụ:
tự chụp ảnh toàn bộ giao diện website **NDTHICH LAND** trên bản đã lên web thật,
rồi đưa ra nhận xét cuối cùng, độc lập, để đóng gói vào bộ hồ sơ bàn giao cho khách.

Không cần đọc code, không cần hiểu kiến trúc dự án — chỉ cần chạy đúng lệnh bên dưới
và đánh giá kết quả bằng mắt như một người dùng thật.

## Bước 0 — Chuẩn bị

Repo này (nhánh `claude/pha2-client-visual-v2`) đã có sẵn script chụp ảnh tại
`scripts/qa-handover-capture.mjs`. Cần Node.js đã cài, và trình duyệt của Playwright:

```bash
npm install
npx playwright install chromium
```

## Bước 1 — Chụp ảnh phần công khai (không cần tài khoản)

```bash
npm run qa:handover-capture
```

Lệnh này tự động:
- Mở `https://ndthichland.com.vn` (site thật, không phải máy cá nhân)
- Chụp toàn bộ trang công khai (Trang chủ, Cho thuê, Dự án, Về chúng tôi, Tin tức,
  Liên hệ) — mỗi trang 2 ảnh: điện thoại (390×844) và máy tính (1440×900)
- Tự tìm 1 tin cho thuê / 1 dự án / 1 bài tin tức đang thật sự tồn tại để chụp luôn
  trang chi tiết (không dùng đường dẫn cứng có thể đã bị xoá)
- Lưu toàn bộ vào thư mục `qa-handover-output/<thời-gian>/public/`, kèm file
  `manifest.json` liệt kê từng ảnh + link + mã trạng thái HTTP

## Bước 2 — Chụp ảnh phần quản trị (cần tài khoản admin)

Xin tài khoản admin từ người bàn giao (không có sẵn trong repo, không đoán/thử mật khẩu).
Sau đó chạy lại với 2 biến môi trường:

**macOS/Linux:**
```bash
ADMIN_EMAIL="..." ADMIN_PASSWORD="..." npm run qa:handover-capture
```

**Windows PowerShell:**
```powershell
$env:ADMIN_EMAIL="..."; $env:ADMIN_PASSWORD="..."; npm run qa:handover-capture
```

Script sẽ tự đăng nhập rồi chụp thêm: Dashboard, Danh sách BĐS, Form thêm BĐS,
Danh sách Dự án, Form thêm Dự án, Danh sách Tin tức, Form thêm Tin tức, Media,
Cài đặt chung — cũng mỗi trang 2 ảnh (điện thoại + máy tính), lưu vào
`qa-handover-output/<thời-gian>/admin/`.

Nếu không có tài khoản, script vẫn chạy được — chỉ bỏ qua phần admin và ghi rõ lý do,
không lỗi.

## Bước 3 — Xem toàn bộ ảnh

Mở lần lượt các file `.png` trong `qa-handover-output/<thời-gian>/`, đọc theo đúng
thứ tự đánh số trong tên file (01, 02, 03...) — thứ tự này đi theo luồng khách thật
sẽ dùng site: vào trang chủ → xem danh sách → xem chi tiết → tìm hiểu công ty → đọc tin
→ liên hệ. Với admin, xem theo luồng người vận hành: đăng nhập → tổng quan → thêm nội
dung mới → cài đặt.

## Bước 4 — Đưa ra nhận xét cuối

Đánh giá như một khách hàng bất động sản thật đang lướt web lần đầu (với phần công khai)
và như một nhân viên không rành kỹ thuật đang tự vận hành CMS (với phần admin). Cụ thể
kiểm tra:

1. **Nhất quán hình ảnh** — màu sắc, font chữ, khoảng cách có đồng bộ giữa các trang
   không? Có trang nào lệch tông so với phần còn lại?
2. **Đúng trên điện thoại lẫn máy tính** — có chữ bị tràn, ảnh bị vỡ tỉ lệ, nút bấm
   chồng lên nhau, hoặc phải cuộn ngang không?
3. **Ngôn ngữ dễ hiểu** — đặc biệt ở phần admin: còn thuật ngữ kỹ thuật (tiếng Anh viết
   hoa giữa câu, tên biến, tên bảng dữ liệu...) mà một chủ doanh nghiệp bất động sản sẽ
   không hiểu không?
4. **Lỗi hiển thị** — ảnh placeholder/demo còn sót ở chỗ không nên có, đường link chết,
   nút bấm không rõ có bấm được hay không (viền/màu không đủ rõ), thông báo lỗi chung
   chung không nói rõ vấn đề ở đâu.
5. **Cảm giác chuyên nghiệp tổng thể** — so với một website bất động sản thật (không
   phải bản demo), site này có đủ tin cậy để khách điền thông tin liên hệ/gọi điện không?

## Bước 5 — Định dạng báo cáo cuối

Viết file `docs/qa-handover/BAO_CAO_DANH_GIA.md`, tiếng Việt, theo đúng cấu trúc:

```markdown
# Đánh giá QA cuối trước bàn giao — NDTHICH LAND

Ngày đánh giá: <ngày>
Số ảnh đã xem: <số> (public: <số>, admin: <số>)

## Điểm mạnh
- ...

## Vấn đề cần sửa trước khi bàn giao khách
(mỗi mục: mô tả vấn đề, file ảnh minh hoạ, mức độ nghiêm trọng cao/trung bình/thấp)
- [Cao] ... — xem `public/desktop/01_TrangChu.png`
- ...

## Vấn đề có thể để sau (không chặn bàn giao)
- ...

## Kết luận
Đánh giá tổng thể 1 đoạn ngắn: site đã sẵn sàng bàn giao chưa, và nếu chưa thì
ưu tiên sửa gì trước.
```

Không cần khen chung chung — mỗi nhận xét phải trỏ được vào đúng ảnh cụ thể để người
đọc kiểm chứng lại được ngay, không phải đoán "ý là trang nào".
