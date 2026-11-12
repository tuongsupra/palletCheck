# Pallet Checker

Webapp trên điện thoại giúp nhân viên kho phân loại pallet gỗ **TH1 / TH2 / TH3 / TH4** theo hướng dẫn Vinalog.
Không đăng nhập, không lưu dữ liệu, không backend. Chạy offline sau lần mở đầu tiên.

## Cấu trúc

```
index.html, css/, js/           Giao diện + logic phân loại (js/classify.js, js/rules.js)
content/texts.js                Toàn bộ chuỗi tiếng Việt
assets/                         Sơ đồ pallet, thước mẫu in A4, icon PWA
manifest.webmanifest, sw.js     PWA + offline
_headers                        Header cache/bảo mật cho Cloudflare Pages
tests/                          Test logic (node --test)
tools/                          Script phụ: server chạy thử, sinh thước mẫu, sinh icon, test giao diện
```

## Chạy thử trên máy

```bash
node tools/serve.mjs          # mở http://localhost:8080
npm test                      # hoặc: node --test
```

> Node 22+ ở Windows: lệnh `node --test tests/` báo lỗi (coi `tests/` là file). Dùng `node --test` hoặc `npm test`.

Test giao diện tự động (cần Chrome và server đang chạy): `node tools/e2e.mjs <thư-mục-ảnh>`.

## Deploy lên Cloudflare Pages (miễn phí)

**Cách 1 — kết nối GitHub**

1. Đưa thư mục `pallet-checker/` lên một repo GitHub (thư mục này là gốc repo).
2. Cloudflare Dashboard → *Workers & Pages* → *Create* → *Pages* → *Connect to Git* → chọn repo.
3. Framework preset: **None**. Build command: **để trống**. Build output directory: **`/`** (thư mục gốc).
4. *Save and Deploy*. Mỗi lần push, Pages tự deploy lại.

**Cách 2 — dòng lệnh**

```bash
cd pallet-checker
npx wrangler pages deploy . --project-name pallet-checker
```

(Lần đầu `wrangler` sẽ mở trình duyệt để đăng nhập Cloudflare.)

**Phát hành bản mới:** sửa file xong, **tăng `VERSION` trong `sw.js`** (ví dụ `v1.0.1`) rồi deploy. Điện thoại sẽ tải bản mới ngầm và dùng bản mới ở lần mở app tiếp theo.

### Free tier

Chỉ dùng Cloudflare Pages phục vụ file tĩnh + file `_headers`. Không dùng Pages Functions, Workers, D1, KV, R2 hay dịch vụ trả phí nào. Không có request nào gửi dữ liệu ra ngoài.

## Thêm vào màn hình chính

- **Android (Chrome):** mở link app → menu ⋮ → **Cài đặt ứng dụng** / **Thêm vào màn hình chính**.
- **iPhone (Safari):** mở link app → nút **Chia sẻ** → **Thêm vào MH chính** → *Thêm*.

Mở app một lần khi có mạng; sau đó dùng được cả khi mất mạng.

## In thước mẫu

Mở `assets/gauge-card.svg` (hoặc nút “Mở thước mẫu để in” trong màn hình “?”), in A4 với **tỉ lệ 100% / Kích thước thật**.
Kiểm tra vạch 100mm bằng thước thật. Vì A4 chỉ dài 297mm, thước 300mm được chia thành 2 dải để cắt và dán nối.

## Sinh lại tài nguyên

```bash
node tools/make-gauge.mjs                                       # assets/gauge-card.svg
powershell -ExecutionPolicy Bypass -File tools/make-icons.ps1   # assets/icons/*.png (Windows)
```
