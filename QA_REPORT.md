# QA_REPORT — Pallet Checker v1.0.0

Ngày: 12/11/2026. Phạm vi: Task A–D, đối chiếu mục 0–5, 7, 9 của `PALLET_APP_PLAN.md`.

## 1. Kết quả kiểm thử

| Hạng mục | Cách kiểm | Kết quả |
|---|---|---|
| Logic: 36 ca mục 7 | `node --test` | ✅ 36/36 |
| Logic: ca biên bổ sung (20 ca) | `node --test` | ✅ 20/20 (tổng 56/56) |
| Giao diện: 31 ca hợp lệ của mục 7, nhập bằng nút +/− | `tools/e2e.mjs` (Chrome giả lập thiết bị) | ✅ ở cả 360×640 và 412×915 |
| Ca lỗi 23, 33 (vượt tổng) | Nút + bị khóa khi `vua + nang + longDinh` = tổng nhóm | ✅ |
| Ca lỗi 32 (`gu.longDinh`) | Thẻ Cục gù không có bộ đếm bung đinh | ✅ |
| Ca lỗi 24, 25 (âm, không nguyên) | Nút − bị khóa ở 0, chỉ tăng/giảm 1 nên không thể nhập | ✅ |
| Không cuộn ngang | `scrollWidth` = `innerWidth` (cả trạng thái recheck) | ✅ |
| Nút ≥ 48px | Đo mọi nút đang hiện | ✅ (nút đếm 52px) |
| Chữ ≥ 16px | Đo mọi phần tử có chữ | ✅ nhỏ nhất 16px |
| Luồng recheck | Bung đinh → "CHƯA CHỐT" + tạm tính → "Đã đóng lại" → longDinh về 0, ra kết quả chốt, hiện nhắc nhập hỏng nặng | ✅ |
| TH4 không bắt kiểm lại | Ca 29, 30 | ✅ status `final` |
| Offline | Service worker kích hoạt, precache 16 file, tắt mạng tải lại vẫn chạy | ✅ |
| Lỗi console | | ✅ không có |
| `aria-live` vùng kết quả, không chỉ dựa vào màu | Luôn có chữ TH1–TH4 hoặc "CHƯA CHỐT" | ✅ |
| Không lưu dữ liệu | Không dùng `localStorage`/cookie/fetch ra ngoài; CSP `connect-src 'self'` | ✅ |

## 2. Sai lệch / vấn đề phát hiện

1. **`node --test tests/` không chạy trên Node 22+ (Windows)** — Node coi `tests/` là đường dẫn file. Đã dùng `node --test` (tự tìm `*.test.js`) và thêm `npm test`. Không ảnh hưởng logic.
2. **Thước 300mm không vừa A4** (A4 dài 297mm). `gauge-card.svg` chia thành 2 dải 0–150 và 150–300 có phần dán nối, kèm vạch 100mm để kiểm tỉ lệ in. Cần in thử và đo bằng thước thật.
3. **Chưa đối chiếu với PDF gốc** — file "Hướng dẫn sử dụng phân loại Pallet Vinalog" không có trong thư mục dự án. Logic đã đối chiếu với mục 2 và 3 của kế hoạch: khớp hoàn toàn, không phát hiện sai lệch.
4. **Lighthouse đã bỏ mục "PWA"** từ bản 12 (2024). Đã tự kiểm các điều kiện cài đặt: manifest hợp lệ (name, `display: standalone`, `start_url`, icon 192/512 + maskable), service worker có `fetch` handler, chạy offline, HTTPS (Cloudflare Pages).
5. **iPhone không hỗ trợ `navigator.vibrate`** → trên iOS không rung. Đúng yêu cầu "nếu thiết bị hỗ trợ".
6. **Sơ đồ pallet là sơ đồ minh họa**: hướng của 5 thanh đáy chỉ để minh họa, có thể khác pallet thật.
7. **Thư mục `tests/`, `tools/`, `package.json` cũng được deploy** khi dùng thư mục gốc làm output. Không chứa dữ liệu nhạy cảm, không ảnh hưởng app.

## 3. Chưa làm được trong môi trường này

- Kiểm tra trên điện thoại thật (Android + iPhone) và đo thời gian nhập một pallet (mục tiêu < 30 giây).
- Deploy thật lên Cloudflare Pages (cần tài khoản của bạn) — hướng dẫn có trong `README.md`.
- In thử thước mẫu và đo bằng thước thật.

Không thay đổi quyết định nào ở mục 0 và mục 3.
