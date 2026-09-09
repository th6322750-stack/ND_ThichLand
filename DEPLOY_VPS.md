# Bàn giao triển khai NDTHICH LAND lên VPS

Tài liệu này dành cho người/AI phụ trách hạ tầng VPS. Phần code đã xong và đã kiểm chứng; việc còn lại thuần hạ tầng.

- **Repo:** https://github.com/th6322750-stack/ND_ThichLand
- **Nhánh:** `claude/pha2-client-visual-v2`
- **Commit tại thời điểm bàn giao:** `4bd2b69`
- **Stack:** Next.js 16.3 (App Router) + Node 20+, dữ liệu đọc/ghi qua Google Sheets API, ảnh lưu trên đĩa VPS
- **Hiện đang chạy ở đâu:** Vercel (`ndthichland.com.vn`). Mục tiêu là chuyển hẳn về VPS.

---

## 1. RÀNG BUỘC QUAN TRỌNG NHẤT — ĐỌC TRƯỚC KHI LÀM

### KHÔNG build trên VPS

Đã đo thực tế: `next build` đạt đỉnh **~4.9 GB RAM** trên máy dev (nhiều nhân nên chạy song song nhiều luồng). Trên VPS 2 nhân sẽ thấp hơn đáng kể, nhưng vẫn tính bằng GB — trong khi VPS chỉ còn **~840 MB RAM trống**. Build tại chỗ gần như chắc chắn bị OOM-kill hoặc quần swap đến treo máy, **kéo sập luôn cả `hathanhweb` lẫn `hathanh-postgres`**.

**Cách làm đúng:** build ở máy khác (máy dev hoặc CI) → chỉ đẩy **kết quả build** lên VPS → chạy `node server.js`. Repo đã bật `output: "standalone"` để phục vụ đúng việc này.

### Ngân sách RAM lúc chạy

Đã đo trên tiến trình standalone đơn (chính là thứ sẽ chạy trên VPS):

| Trạng thái | RAM |
|---|---|
| Nghỉ, mới khởi động | 174 MB |
| Sau khi duyệt hết 6 trang công khai | 183 MB |
| Đỉnh khi 200 request đồng thời | **240 MB** |
| Nghỉ lại sau tải nặng | 170 MB |

→ **Đặt trần container 400 MB.** Dư an toàn so với đỉnh 240 MB, và quan trọng hơn: hiện 4/5 container trên VPS không có trần RAM, nghĩa là một container phình bất thường sẽ ăn hết RAM và kéo sập cả máy. Container mới này phải có trần để nếu nó hỏng thì chỉ mình nó chết.

Lưu ý: `kygui-sync` cứ 30 phút quét một lần và vọt lên ~454 MB, lúc đó RAM trống tụt còn ~450 MB. Đỉnh 240 MB của web vẫn lọt, nhưng đừng đặt thêm gì nặng vào khung giờ đó.

---

## 2. Quy trình build → đẩy → chạy

### Bước 1 — Build (trên máy dev / CI, KHÔNG phải VPS)

```bash
git clone -b claude/pha2-client-visual-v2 https://github.com/th6322750-stack/ND_ThichLand.git
cd ND_ThichLand
npm ci
BUILD_STANDALONE=1 npm run build
```

⚠️ **Bắt buộc có `BUILD_STANDALONE=1`.** Không có biến này thì build vẫn chạy bình thường nhưng **không sinh ra `.next/standalone`**, và không có gì để đẩy lên VPS.

Sở dĩ phải bật bằng biến chứ không để mặc định: `output: "standalone"` luôn-bật làm **build trên Vercel hỏng hẳn** (`ENOENT .next/next-server.js.nft.json`). Trong khi web hiện vẫn đang chạy trên Vercel cho tới lúc chuyển xong, nên hai đường build phải sống song song.

### Bước 2 — Gom gói triển khai

`next build` sinh ra `.next/standalone` nhưng **chưa gồm** file tĩnh và thư mục `public` — phải chép thêm bằng tay (đây là hành vi mặc định của Next, không phải lỗi):

```bash
cp -r public          .next/standalone/
cp -r .next/static    .next/standalone/.next/
```

Kết quả `.next/standalone/` là gói tự chứa, gồm cả `node_modules` đã rút gọn:

| Thành phần | Dung lượng |
|---|---|
| Server + node_modules rút gọn | 55 MB |
| `.next/static` | 3.5 MB |
| `public` (ảnh, hero 4K, assets) | 564 MB |
| **Tổng** | **~620 MB** |

VPS còn 13 GB trống → thoải mái.

**Kiểm tra nhanh trước khi đẩy lên** — gói phải sạch, không lẫn thứ không được lên server:

```bash
du -sh .next/standalone          # kỳ vọng ~620MB (55MB nếu chưa chép public)
ls -a .next/standalone           # KHÔNG được thấy .git, .env.local, .webby, tests
```

Nếu thấy gói phình lên hàng GB hoặc có `.env.local` trong đó thì **dừng lại, không đẩy lên** — nghĩa là cơ chế lọc file trong `next.config.mjs` (`outputFileTracingExcludes`) đã hỏng, và gói đang mang theo cả lịch sử git lẫn secret của máy build.

### Bước 3 — Chạy

Điểm vào là `server.js`, đọc `PORT` và `HOSTNAME` từ biến môi trường:

```bash
PORT=3000 HOSTNAME=0.0.0.0 node server.js
```

---

## 3. Biến môi trường

Tất cả đều bắt buộc trừ khi ghi rõ khác. **Không commit các giá trị này vào git.**

| Biến | Ý nghĩa | Lấy ở đâu |
|---|---|---|
| `NODE_ENV` | Bắt buộc `production` | — |
| `PORT` | Cổng Node lắng nghe | tự chọn, ví dụ `3000` |
| `HOSTNAME` | `0.0.0.0` để nginx nối vào được | — |
| `NEXT_PUBLIC_SITE_URL` | `https://ndthichland.com.vn` | — |
| `MEDIA_STORAGE_DIR` | **Thư mục lưu ảnh tải lên.** Phải nằm trên volume bền vững, không mất khi restart container | ví dụ `/data/media` |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | Tài khoản dịch vụ đọc/ghi Sheets | đang có trên Vercel |
| `GOOGLE_PRIVATE_KEY` | Khoá riêng của tài khoản trên | đang có trên Vercel |
| `GOOGLE_CMS_SPREADSHEET_ID` | Sheet chứa toàn bộ dữ liệu CMS | đang có trên Vercel |
| `GOOGLE_RENTAL_SPREADSHEET_ID` | Đặt **cùng giá trị** với biến trên | đang có trên Vercel |
| `ADMIN_EMAIL` | Email đăng nhập trang quản trị | đang có trên Vercel |
| `ADMIN_PASSWORD_HASH` | Hash scrypt của mật khẩu admin | đang có trên Vercel |
| `AUTH_SECRET` | Khoá ký session, **tối thiểu 32 ký tự** ở production | đang có trên Vercel |
| `GOOGLE_MEDIA_FOLDER_ID` | **Bỏ hẳn, không set** | xem mục 4 |
| `DEMO_MODE` | **Bỏ hẳn, không set** | không còn tác dụng khi đã có Google |

**Lấy giá trị hiện tại:** người bàn giao chạy `vercel env pull` hoặc lấy từ file JSON khoá dịch vụ gốc. `GOOGLE_PRIVATE_KEY` là chuỗi nhiều dòng — khi đưa vào Docker/systemd nhớ giữ nguyên xuống dòng, hoặc thay xuống dòng bằng `\n` (code tự chuyển lại được, xem `normalizePrivateKey` trong `lib/server/env.ts`).

⚠️ `AUTH_SECRET` ngắn hơn 32 ký tự sẽ khiến **toàn bộ chức năng đăng nhập bị vô hiệu ở production** — code cố tình fail-closed chứ không chạy với khoá yếu.

---

## 4. Ảnh tải lên — vì sao dùng đĩa chứ không dùng Google Drive

Đây là lý do chính phải chuyển sang VPS, đọc kỹ để khỏi "sửa lại cho giống cũ".

Tài khoản dịch vụ của Google **không có dung lượng lưu trữ riêng**. Khi nó tải file vào một folder Drive cá nhân, file sẽ thuộc quyền sở hữu của tài khoản dịch vụ — mà tài khoản đó có 0 byte quota, nên Google trả về:

```
403 Forbidden — Service Accounts do not have storage quota.
```

Đây là giới hạn cứng của Google, không phải lỗi phân quyền folder, không sửa bằng cách share lại folder. Cách duy nhất để dùng Drive là Shared Drive (chỉ có ở Google Workspace trả phí).

**Nên:** khi `MEDIA_STORAGE_DIR` được set, code tự động lưu ảnh vào đĩa (`LocalDiskBlobStore`), chỉ đẩy dòng metadata lên Sheets. Ảnh được phục vụ qua route `/api/media/[id]` của Node.

**Yêu cầu bắt buộc với `MEDIA_STORAGE_DIR`:**
- Nằm trên volume bền vững (Docker named volume hoặc bind mount), **không phải thư mục trong container** — nếu không, ảnh mất sạch mỗi lần deploy lại.
- Tiến trình Node phải có quyền ghi.
- Nhớ đưa vào lịch backup cùng với các dữ liệu khác.

Tên file trên đĩa do code tự sinh (`uuid.ext`), không lấy từ tên file người dùng tải lên, và mọi lượt đọc đều kiểm tra lại định dạng tên trước khi chạm vào ổ đĩa — đã có test cho các trường hợp tấn công đường dẫn (`tests/unit/server/localDiskBlobStore.test.ts`).

---

## 5. nginx

Đề xuất cho nginx phục vụ thẳng thư mục `public` (564 MB ảnh tĩnh) thay vì để Node xử lý — nhanh hơn hẳn và giữ RAM của Node phẳng.

```nginx
server {
    server_name ndthichland.com.vn;

    # Ảnh/asset tĩnh: nginx trả thẳng, không đụng tới Node
    location /assets/ {
        alias /đường/dẫn/tới/standalone/public/assets/;
        expires 30d;
        access_log off;
    }

    location /_next/static/ {
        alias /đường/dẫn/tới/standalone/.next/static/;
        expires 1y;
        access_log off;
    }

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host              $host;
        proxy_set_header X-Real-IP         $remote_addr;
        proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Ảnh tải lên tối đa 8MB, video 50MB, PDF 25MB
        client_max_body_size 50m;
    }
}
```

⚠️ **`client_max_body_size` mặc định của nginx là 1MB** — không nâng lên thì phần lớn ảnh chụp từ điện thoại sẽ bị chặn ngay ở nginx trước khi tới Node. Ứng dụng đã cấu hình nhận tới 50MB (xem `serverActions.bodySizeLimit` trong `next.config.mjs`).

`/api/media/*` phải đi qua Node (không phải nginx) vì file nằm ngoài `public`.

SSL: dùng certbot như các dự án khác trên máy.

---

## 6. Điều cần biết về cách app đọc dữ liệu

- **Toàn bộ nội dung nằm trong Google Sheets**, không có database. Sheet ID trong biến `GOOGLE_CMS_SPREADSHEET_ID`.
- **Có cache 30 giây** cho mọi lượt đọc Sheets (`lib/server/google/sheets.ts`). Lý do: Google giới hạn ~60 lượt đọc/phút, mà mỗi lần tải trang cần 6+ lượt đọc → không cache thì web sập 500 khi có vài khách vào cùng lúc (đã xảy ra thật trên production).
  - Hệ quả vận hành: **admin sửa nội dung xong, ngoài web mất tối đa ~30 giây mới đổi.** Không phải lỗi.
  - Cache dùng `unstable_cache` của Next. Trên VPS chạy một tiến trình duy nhất nên còn hiệu quả hơn cả trên serverless.
- Có thêm lớp gộp request trùng nhau: nhiều request cùng lúc đọc cùng một vùng dữ liệu sẽ dùng chung một lượt gọi API.

---

## 7. Kiểm tra sau khi deploy

Làm đủ, đừng bỏ mục nào — mấy mục cuối là những chỗ đã từng hỏng thật.

```bash
# 1. Trang công khai trả 200
for p in / /cho-thue /du-an /tin-tuc /gioi-thieu /lien-he; do
  curl -s -o /dev/null -w "$p %{http_code}\n" https://ndthichland.com.vn$p
done

# 2. Dữ liệu thật lên đúng (phải thấy tên BĐS, không phải danh sách rỗng)
curl -s https://ndthichland.com.vn/cho-thue | grep -o "Tìm thấy [^<]*"
# Kỳ vọng: "Tìm thấy 12 bất động sản" — nếu ra 0 là Sheets đọc hỏng

# 3. Chịu tải, không sập vì quota Sheets
for i in $(seq 1 30); do curl -s -o /dev/null -w "%{http_code} " https://ndthichland.com.vn/ & done; wait
# Kỳ vọng: 30 số 200. Nếu có 500 là cache không hoạt động.

# 4. RAM thực tế
docker stats --no-stream
# Kỳ vọng: ~170-190 MB lúc nghỉ, dưới 300 MB lúc tải
```

**Kiểm tra thủ công (bắt buộc, không tự động được):**

1. Đăng nhập `https://ndthichland.com.vn/admin` → vào được Dashboard.
2. Vào **BĐS cho thuê → Thêm BĐS → tải một ảnh lên**. Ảnh phải **hiện ra thật**, không phải ô ảnh vỡ. Đây chính là bug đã khiến phải chuyển sang VPS — nếu vẫn vỡ thì `MEDIA_STORAGE_DIR` chưa đúng.
3. Kiểm tra file vừa tải có nằm thật trong thư mục `MEDIA_STORAGE_DIR` trên đĩa không.
4. **Restart container, rồi mở lại ảnh đó** — vẫn phải hiện. Nếu mất là volume chưa bền vững (đây là lỗi cũ trên Vercel).
5. Gửi thử form ở `/lien-he` → mở Sheet, tab `WEB_CONTACTS` phải có dòng mới.

---

## 8. Việc còn dở, người bàn giao phải xử lý (KHÔNG phải việc của phía VPS)

Ghi ra đây để không ai tưởng đã xong:

1. **Đổi mật khẩu admin.** Mật khẩu hiện tại do AI sinh ra và đang nằm dạng chữ trong file PDF hướng dẫn + trong lịch sử chat. Phải đổi trong *Cài đặt chung → Bảo mật tài khoản admin*.
2. **Khoá 2FA của tài khoản Google đang nằm dạng chữ trong PDF bàn giao** (`WAGH CIOF 7TE3 ...`). Ai cầm file PDF đó đều tự sinh được mã 2FA hợp lệ vĩnh viễn. **Phải huỷ và tạo lại khoá 2FA mới**, không phải chỉ đổi mật khẩu.
3. **Xoá dòng test trong Sheet:** tab `WEB_CONTACTS` có dòng `QA TEST 1788908171934`; tab `WEB_MEDIA` có dòng ảnh test từ lần kiểm thử tải lên.
4. **Dữ liệu hiện tại vẫn là hàng mẫu**: 12 BĐS, 6 dự án, 6 tin tức đều là nội dung demo, chưa phải hàng thật của khách. Phải thay trước khi chạy quảng cáo.
5. **Sửa lại tài liệu hướng dẫn PDF**: trang 10 ghi "tệp tải lên lưu trong Google Drive" — sau khi lên VPS thì ảnh nằm trên đĩa VPS, không phải Drive nữa.
6. **Sau khi VPS chạy ổn**: trỏ DNS về VPS và tắt/ngưng dự án trên Vercel để tránh chạy song song hai bản.

---

## 9. Bảng tra lỗi nhanh

| Triệu chứng | Nguyên nhân thường gặp |
|---|---|
| Trang công khai 500 hàng loạt | Hết quota đọc Sheets → kiểm tra cache có chạy không; hoặc sai `GOOGLE_*` |
| `/cho-thue` hiện "Tìm thấy 0" | Sai `GOOGLE_CMS_SPREADSHEET_ID`, hoặc service account chưa được share Sheet |
| Đăng nhập admin luôn báo sai | `AUTH_SECRET` ngắn hơn 32 ký tự, hoặc sai `ADMIN_PASSWORD_HASH` |
| Tải ảnh báo "Tải lên thất bại" | `MEDIA_STORAGE_DIR` chưa set / không có quyền ghi; hoặc đang lỡ set `GOOGLE_MEDIA_FOLDER_ID` |
| Ảnh mất sau khi deploy lại | `MEDIA_STORAGE_DIR` trỏ vào trong container thay vì volume bền vững |
| Ảnh >1MB tải lên bị chặn | `client_max_body_size` của nginx còn mặc định 1MB |
| Sửa admin xong web không đổi | Bình thường, đợi tối đa 30 giây (cache) |
| Build trên VPS bị treo/kill | Đúng như dự đoán — không build trên VPS, xem mục 1 |

---

## 10. Trạng thái kiểm thử tại thời điểm bàn giao

Chạy trên commit `4bd2b69`:

| Hạng mục | Kết quả |
|---|---|
| Lint | sạch |
| Typecheck | sạch |
| Unit test | 353/353 |
| E2E (mock) | 36/36 |
| E2E (fail-closed) | 5/5 |
| Production build | thành công |
| Tải ảnh lên đĩa (đầu-cuối, Sheet thật) | đạt — ảnh hiện đúng, `/api/media/[id]` trả 200 `image/png`, file có trên đĩa |
| Chịu tải 100 request đồng thời (trên Vercel) | 100/100 trả 200 |
