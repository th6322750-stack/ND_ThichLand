# Bàn giao triển khai NDTHICH LAND lên VPS

Tài liệu này dành cho người/AI phụ trách hạ tầng VPS. Phần code đã xong và đã kiểm chứng; việc còn lại thuần hạ tầng.

- **Repo:** https://github.com/th6322750-stack/ND_ThichLand
- **Nhánh:** `claude/pha2-client-visual-v2`
- **Commit tại thời điểm bàn giao:** `0ba879a`
- **Stack:** Next.js 16.3 (App Router) + Node 20+, dữ liệu đọc/ghi qua Google Sheets API, ảnh lưu trên đĩa VPS

### Hiện trạng — vì sao phải chuyển sang VPS

Web đang chạy trên Vercel tại `ndthichland.com.vn` và **hoạt động bình thường**: trang công khai, dữ liệu thật từ Google Sheets, đăng nhập admin, sửa nội dung, form liên hệ ghi được lead.

**Đúng một thứ hỏng: tải ảnh lên.** Trên Vercel nó báo "Tải lên thất bại" và không có cách nào sửa bằng cấu hình — tài khoản dịch vụ Google không có dung lượng lưu trữ riêng (chi tiết ở mục 4). Đó là lý do duy nhất phải chuyển sang VPS: **VPS có ổ đĩa thật để chứa ảnh.**

Nên tiêu chí nghiệm thu quan trọng nhất sau khi deploy là: **tải một ảnh lên trong admin và thấy nó hiện ra**. Mọi thứ khác vốn đã chạy sẵn, chỉ cần đảm bảo không làm hỏng đi.

---

## 1. RÀNG BUỘC QUAN TRỌNG NHẤT — ĐỌC TRƯỚC KHI LÀM

### KHÔNG build trên VPS

Đã đo thực tế: `next build` đạt đỉnh **~4.9 GB RAM** trên máy dev (nhiều nhân nên chạy song song nhiều luồng). Trên VPS 2 nhân sẽ thấp hơn đáng kể, nhưng vẫn tính bằng GB — trong khi VPS chỉ còn **~840 MB RAM trống**. Build tại chỗ gần như chắc chắn bị OOM-kill hoặc quần swap đến treo máy, **kéo sập luôn cả `hathanhweb` lẫn `hathanh-postgres`**.

**Cách làm đúng:** build ở máy khác (máy dev hoặc CI) → chỉ đẩy **kết quả build** lên VPS → chạy `node server.js`. Repo hỗ trợ `output: "standalone"`, bật bằng biến `BUILD_STANDALONE=1` — xem Bước 1.

Điều này đúng **kể cả với VPS mới rộng hơn**. Ngưỡng không nằm ở chỗ "máy yếu" mà ở chỗ build cần hàng GB còn chạy chỉ cần ~240 MB; không có lý do gì bắt server production gánh việc build.

### Nếu dựng VPS mới thì cần cấu hình gì

| Hạng mục | Mức | Vì sao |
|---|---|---|
| RAM | tối thiểu 1 GB, **nên 2 GB** | Web đỉnh 240 MB + OS/nginx ~300 MB. 1 GB chạy được nếu chỉ có mình nó; 2 GB thì thở được |
| Ổ cứng | tối thiểu 20 GB | Gói ~620 MB, phần còn lại dành cho ảnh khách tải lên tăng dần |
| CPU | 1–2 nhân | App cache dữ liệu Sheets nên gần như không tốn CPU |
| Node | 20 trở lên | |

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
npm run build:vps
```

`build:vps` làm hai việc: build ở chế độ standalone, rồi **tự kiểm gói** và thoát mã lỗi nếu gói bẩn. Chạy được trên cả Windows lẫn Linux.

⚠️ Nếu chạy tay `next build` thì phải có `BUILD_STANDALONE=1`, không thì build vẫn xong nhưng **không sinh ra `.next/standalone`** và chẳng có gì để đẩy lên VPS.

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

**Kiểm gói bằng máy, không bằng mắt.** `npm run build:vps` đã tự chạy bước này; chạy lại bất cứ lúc nào bằng:

```bash
npm run verify:bundle
```

Nó thoát mã lỗi (dừng cả chuỗi lệnh) nếu gói chứa `.git`, bất kỳ file `.env*` nào ở bất kỳ độ sâu nào, mã nguồn `.ts/.tsx`, vượt 150 MB, hoặc thiếu `server.js`.

Vì sao phải là máy chứ không phải người: đã từng có lần gói phình từ 53 MB lên **3.1 GB**, nuốt cả `.git` (461 MB), cache test (1.5 GB) và **`.env.local`**. Phát hiện được chỉ vì tình cờ build Vercel hỏng — nếu không thì secret của máy build đã nằm trên server. Kiểm bằng mắt qua `ls` là thứ chắc chắn có ngày bị bỏ qua.

**Chạy verify TRƯỚC khi chép `public/` vào gói** (chép xong ~620 MB, vượt ngưỡng).

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

## 4b. Giữ tiến trình sống (systemd)

Chạy tay `node server.js` thì **đóng SSH là web chết**, reboot máy cũng chết, mà crash thì không tự dậy. Phải có systemd (hoặc Docker restart policy nếu theo nếp Docker sẵn có trên máy).

`/etc/systemd/system/ndthichland.service`:

```ini
[Unit]
Description=NDTHICH LAND
After=network.target

[Service]
Type=simple
WorkingDirectory=/opt/ndthichland/standalone
EnvironmentFile=/opt/ndthichland/.env
Environment=PORT=3000
Environment=HOSTNAME=127.0.0.1
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=5
MemoryMax=400M

[Install]
WantedBy=multi-user.target
```

```bash
systemctl daemon-reload && systemctl enable --now ndthichland
systemctl status ndthichland
```

Vì sao từng dòng:
- `MemoryMax=400M` — đo thật đỉnh 240 MB, nên 400M là dư. Quan trọng hơn: nếu app rò rỉ bộ nhớ thì **chỉ mình nó bị khởi động lại**, không ăn hết RAM kéo sập máy.
- `HOSTNAME=127.0.0.1` — Node chỉ nghe nội bộ, không phơi thẳng ra internet; mọi thứ đi qua nginx.
- `Restart=always` — crash thì tự dậy sau 5 giây.

⚠️ **Bẫy `EnvironmentFile` + `GOOGLE_PRIVATE_KEY`:** systemd **không đọc được giá trị nhiều dòng**. Khoá riêng của Google vốn dài nhiều dòng, dán nguyên vào `.env` là service không khởi động nổi. Phải viết **trên đúng một dòng**, xuống dòng thay bằng ký tự `\n`:

```
GOOGLE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBg...\n-----END PRIVATE KEY-----\n
```

Code tự chuyển `\n` thành xuống dòng thật (`normalizePrivateKey` trong `lib/server/env.ts`), nên dạng một dòng là dạng đúng. Nhớ `chmod 600 /opt/ndthichland/.env`.

---

## 4c. Thư mục ảnh phải nằm NGOÀI thư mục deploy

```
/opt/ndthichland/standalone/     <- ghi đè mỗi lần deploy
/var/lib/ndthichland/media/      <- MEDIA_STORAGE_DIR, không bao giờ bị đụng
```

Đặt `MEDIA_STORAGE_DIR` vào trong `standalone/` là **mất sạch ảnh khách ngay lần deploy tiếp theo**. Cái bẫy này còn dễ dính hơn khi chạy systemd so với Docker, vì không có volume nào nhắc mình.

```bash
mkdir -p /var/lib/ndthichland/media
chown -R <user chạy service>:<group> /var/lib/ndthichland/media
```

Nhớ đưa thư mục này vào lịch backup — đây là dữ liệu khách, không tái tạo được từ repo.

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

### SSL

Trên **VPS chung** (máy đã có sẵn certbot): dùng như các dự án khác.

Trên **VPS mới**: chưa có gì, phải cài:

```bash
apt install certbot python3-certbot-nginx
certbot --nginx -d ndthichland.com.vn -d www.ndthichland.com.vn
```

Chỉ chạy được **sau khi DNS đã trỏ về VPS** (certbot cần xác thực qua HTTP). Xem mục 6b về thứ tự chuyển DNS.

---

## 5b. Khoá cửa máy mới ngay giờ đầu

Áp dụng khi dựng **VPS mới**. IP công khai vừa lên là bot dò mật khẩu SSH ngay — trên máy hiện có của anh Thành đo được **7.930 lượt dò mỗi ngày**.

```bash
printf 'PasswordAuthentication no\nPermitRootLogin prohibit-password\nMaxAuthTries 3\n' \
  > /etc/ssh/sshd_config.d/01-hardening.conf
sshd -t && systemctl reload ssh
ufw allow 22,80,443/tcp && ufw enable
```

Hai chỗ dễ tự bắn vào chân:
- **Tên file phải bắt đầu bằng `01-`.** Ubuntu có sẵn `50-cloud-init.conf` ghi `PasswordAuthentication yes`, mà sshd lấy giá trị **gặp đầu tiên** — đặt tên `99-` là vô tác dụng.
- **`sshd -t` trước khi reload**, và sau khi reload thì **mở một phiên SSH mới để thử** trước khi đóng phiên đang dùng. Sai cấu hình mà đóng mất phiên hiện tại là mất luôn đường vào máy.

Đảm bảo đã cài khoá SSH công khai trước khi tắt đăng nhập bằng mật khẩu.

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

**Ba phép thử về độ bền — đừng bỏ, đây là chỗ hay sót:**

```bash
# 1. Khởi động lại dịch vụ -> ảnh vừa tải vẫn phải mở được
systemctl restart ndthichland
# rồi mở lại đúng ảnh đó trong admin

# 2. Reboot cả máy -> web tự lên, không cần ai SSH vào
reboot

# 3. Sau 24h -> không có khởi động lại bất thường
systemctl status ndthichland
journalctl -u ndthichland --since "24 hours ago" | grep -i "started\|killed\|oom"
```

Phép thử 1 bắt lỗi `MEDIA_STORAGE_DIR` đặt sai chỗ. Phép thử 2 bắt lỗi quên `systemctl enable`. Phép thử 3 bắt rò rỉ bộ nhớ chạm `MemoryMax`.

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
3. ~~Xoá dòng test trong Sheet~~ — **đã dọn**. `WEB_CONTACTS` và `WEB_MEDIA` hiện đều trống 0 dòng; `WEB_BDS_CUSTOM` 12, `WEB_PROJECTS` 6, `WEB_NEWS` 6 (dữ liệu thật, giữ nguyên).
4. **Dữ liệu hiện tại vẫn là hàng mẫu**: 12 BĐS, 6 dự án, 6 tin tức đều là nội dung demo, chưa phải hàng thật của khách. Phải thay trước khi chạy quảng cáo.
5. **Sửa lại tài liệu hướng dẫn PDF**: trang 10 ghi "tệp tải lên lưu trong Google Drive" — sau khi lên VPS thì ảnh nằm trên đĩa VPS, không phải Drive nữa.
6. **Chuyển DNS**: xem mục 6b — có thứ tự và đường lùi, đừng đổi thẳng.

---

## 8b. Chuyển DNS — có đường lùi, không cắt đứt

Web đang phục vụ khách thật trên Vercel. Không đổi DNS thẳng rồi hy vọng mọi thứ ổn.

| # | Việc | Vì sao |
|---|---|---|
| 1 | Hạ TTL bản ghi DNS xuống 300s, **đợi đủ 24h** | TTL cũ (thường 1-24h) là thời gian phải chịu nếu cần lùi. Hạ trước thì lùi lại chỉ mất 5 phút |
| 2 | Dựng VPS chạy song song, test bằng file `hosts` trên máy mình | Kiểm tra được bản VPS thật mà chưa ai bị ảnh hưởng |
| 3 | Chạy **hết** mục 7 trên bản VPS — phải đạt sạch | Đây là cổng chặn cuối. Chưa đạt thì chưa đổi DNS |
| 4 | Đổi DNS về IP VPS | |
| 5 | **Giữ nguyên Vercel 48h** | Có sự cố thì trỏ DNS ngược lại là xong, không phải sửa gấp lúc nửa đêm |
| 6 | Ổn định 48h mới tắt Vercel | |

Test bằng `hosts` ở bước 2 (thay `<IP-VPS>`):

```
# Windows: C:\Windows\System32\drivers\etc\hosts
# Linux/macOS: /etc/hosts
<IP-VPS>  ndthichland.com.vn
```

Lưu ý: lúc này chưa có SSL hợp lệ (certbot cần DNS thật), nên trình duyệt sẽ cảnh báo chứng chỉ — bình thường ở bước này. Kiểm nội dung và chức năng trước, SSL cấp sau khi DNS đã trỏ (mục 5).

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
| Service không khởi động, log báo lỗi env | `GOOGLE_PRIVATE_KEY` đang là nhiều dòng trong `.env` — systemd không đọc được, phải gộp thành một dòng với `\n` (mục 4b) |
| Đóng SSH là web chết | Đang chạy tay `node server.js`, chưa có systemd (mục 4b) |
| Reboot xong web không lên | Quên `systemctl enable` |
| Service bị khởi động lại liên tục | Chạm `MemoryMax` — xem `journalctl -u ndthichland \| grep -i oom` |
| Ảnh mất sau mỗi lần deploy | `MEDIA_STORAGE_DIR` nằm trong thư mục deploy (mục 4c) |
| certbot báo lỗi xác thực | DNS chưa trỏ về VPS — phải đổi DNS trước rồi mới cấp SSL |
| Vẫn đăng nhập SSH được bằng mật khẩu | File hardening đặt tên `99-`, bị `50-cloud-init.conf` chặn trước (mục 5b) |

---

## 10. Trạng thái kiểm thử tại thời điểm bàn giao

| Hạng mục | Kết quả |
|---|---|
| Lint | sạch |
| Typecheck | sạch |
| Unit test | 353/353 |
| E2E (mock) | 36/36 |
| E2E (fail-closed) | 5/5 |
| Production build (đường Vercel) | thành công |
| Build standalone + gác cổng gói | đạt — 48 MB, không secret, không mã nguồn |
| Gác cổng có thật sự biết chặn | đạt — thử nhét `.env.local`, `.git`, file `.ts`, `.env` ở sâu, xoá `server.js`: chặn cả 5 |
| Chạy gói standalone: 7 trang công khai + 8 màn admin | tất cả 200, hiện đủ 12 BĐS |
| Tải ảnh lên đĩa (đầu-cuối, Sheet thật) | đạt — ảnh hiện đúng, `/api/media/[id]` trả 200 `image/png`, file có trên đĩa |
| Chịu tải 100 request đồng thời (trên Vercel) | 100/100 trả 200 |
| RAM khi chạy (1 tiến trình standalone) | nghỉ 174 MB, đỉnh 240 MB khi 200 request đồng thời |

**Chưa kiểm được, phía VPS phải tự làm:** khởi động lại dịch vụ, reboot máy, và theo dõi 24h (mục 7). Ba thứ này chỉ kiểm được trên máy thật.
