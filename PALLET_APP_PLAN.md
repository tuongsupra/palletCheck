# PALLET CHECKER — Kế hoạch & phân công cho nhiều AI

**Phiên bản 2** (đã cập nhật theo các quyết định về tiêu chí). Tài liệu gốc: "Hướng dẫn sử dụng phân loại Pallet Vinalog" (TH1–TH4). File này là **nguồn sự thật duy nhất** để giao việc cho nhiều AI làm song song. Mỗi AI đọc phần chung (mục 0–4) và phần việc của mình (mục 6).

---

## 0. Tóm tắt sản phẩm

Webapp chạy trên **điện thoại**, nhân viên kho kiểm **từng pallet**: nhập tình trạng các cấu kiện → app hiện ngay kết quả **TH1 / TH2 / TH3 / TH4** kèm lý do và hành động khuyến nghị. Nếu có thanh bung đinh hoặc tách rời còn nguyên, app yêu cầu **đóng lại đinh rồi kiểm tra lại** trước khi chốt.

### Đã chốt (không bàn lại)

| # | Quyết định |
|---|---|
| 1 | Kiểm từng pallet. Chỉ nhập thông tin và xem kết quả. **Không lưu record, không backend, không database.** |
| 2 | Người dùng: nhân viên kho, thiết bị: **điện thoại** (mobile-first, một tay). |
| 3 | Không ký, không xuất phiếu. Chỉ **xem kết quả**. |
| 4 | Không cần xác nhận các điểm mơ hồ của tài liệu với Vinalog. Dùng quyết định ở mục 3. |
| 5 | Chạy trên **Cloudflare free tier**. |
| 6 | Ngưỡng số lượng theo nhóm **chỉ tính cấu kiện hỏng nặng**. Sứt lớn không tính vào ngưỡng nhóm. |
| 7 | Kích thước sứt hỗn hợp dùng **"HOẶC"**: vượt một trong hai ngưỡng là sứt lớn. |
| 8 | Thanh bung đinh / gánh tách rời còn nguyên → **đóng lại đinh rồi kiểm lại**, chưa chốt loại. |

### Ngoài phạm vi (KHÔNG làm)

Đăng nhập, lưu lịch sử, upload ảnh, dashboard, báo cáo, QR cho từng pallet, đa ngôn ngữ, ký tên, in phiếu. AI nào đề xuất thêm các thứ này thì bỏ qua.

---

## 1. Kiến trúc & stack

Vì không lưu dữ liệu, toàn bộ app là **static site**: không cần Worker, D1, KV hay R2.

- **Hosting**: Cloudflare Pages (free).
- **Công nghệ**: HTML + CSS + JavaScript thuần (ES modules). **Không framework, không bước build.**
- **PWA**: `manifest.webmanifest` + service worker, cài lên màn hình chính và **chạy offline**.
- **Test**: Node.js built-in test runner (`node --test`), không cần cài thư viện.
- **Ngôn ngữ giao diện**: tiếng Việt.

### Cấu trúc thư mục (hợp đồng giữa các AI — giữ đúng tên file)

```
pallet-checker/
├─ index.html              # Task B
├─ css/
│  └─ style.css            # Task B
├─ js/
│  ├─ app.js               # Task B: gắn UI với classify()
│  ├─ classify.js          # Task A: logic thuần, KHÔNG đụng DOM
│  └─ rules.js             # Task A: ngưỡng cấu hình
├─ content/
│  └─ texts.js             # Task C: toàn bộ chuỗi tiếng Việt
├─ assets/
│  ├─ pallet-diagram.svg   # Task C: sơ đồ 4 nhóm cấu kiện
│  ├─ icons/               # Task D: icon PWA 192/512 + maskable
│  └─ gauge-card.svg       # Task C: thước mẫu in ra
├─ manifest.webmanifest    # Task D
├─ sw.js                   # Task D
├─ _headers                # Task D
├─ tests/
│  └─ classify.test.js     # Task A + E
└─ README.md               # Task D
```

---

## 2. Mô hình tiêu chí

Pallet gỗ 1.2m × 1.2m × 0.156m, **26 thanh tiêu chuẩn**:

| Nhóm | Key | Tên hiển thị | Tổng | Có mục "bung đinh/tách rời"? |
|---|---|---|---|---|
| Thanh mặt | `mat` | Thanh mặt | 9 | Có |
| Thanh ngang / gánh | `ganh` | Gánh (thanh ngang) | 3 | Có |
| Cục gù / kê | `gu` | Cục gù | 9 | Không |
| Thanh đáy | `day` | Thanh đáy | 5 | Có |

### Các mức tình trạng của mỗi cấu kiện

| Mức | Key | Định nghĩa | Nhân viên nhập? |
|---|---|---|---|
| **Nhẹ** | — | Sứt nhỏ: thanh mặt/gánh/đáy **sâu < 25mm VÀ dài < 300mm**; cục gù **sâu < 20mm VÀ rộng < 1/3 bề mặt gù**; hoặc hư đầu thanh nhưng không bung đinh. Tính là TH1. | Không |
| **Sứt lớn** | `vua` | Vượt ngưỡng nhẹ theo quy tắc **HOẶC**: thanh mặt/gánh/đáy **sâu ≥ 25mm HOẶC dài ≥ 300mm**; cục gù **sâu ≥ 20mm HOẶC rộng ≥ 1/3 bề mặt gù**. Tối thiểu tạo ra TH2. **Không tính vào ngưỡng số lượng nhóm.** | Có |
| **Hỏng nặng** | `nang` | **Gãy, vỡ, nứt, mất** cấu kiện, hoặc cục gù bị tách đôi/hỏng. Đây là loại cần thay thế. | Có |
| **Bung đinh / tách rời còn nguyên** | `longDinh` | Thanh (mặt/gánh/đáy) bung đinh hoặc tách rời nhưng **còn nguyên, chưa gãy/nứt**. Chưa tính loại: phải đóng lại đinh rồi kiểm lại. | Có (chỉ mặt, gánh, đáy) |

Quy ước vận hành cho `longDinh`: sau khi đóng lại đinh, thanh nào **đóng được** thì coi là bình thường. Thanh nào **không đóng lại được** (gỗ nứt chỗ đinh, tách vỡ) thì nhập vào **hỏng nặng**.

### Bảng ngưỡng theo số cấu kiện **hỏng nặng**

| Nhóm | TH2 | TH3 | TH4 |
|---|---|---|---|
| `mat` | 1–3 | 4–5 | ≥ 6 |
| `ganh` | — | 1 | ≥ 2 |
| `gu` | 1 | 2–3 | ≥ 4 |
| `day` | 1–3 | 4 | 5 |

### Quy tắc chung

1. Bất kỳ cấu kiện **sứt lớn** ≥ 1 ở nhóm nào → tối thiểu **TH2**.
2. **Tổng cấu kiện hỏng (sứt lớn + hỏng nặng) ≥ 7** (25% của 26) → **TH4**. Thanh `longDinh` chưa tính vào tổng.
3. **Mối mọt / nhiễm bẩn / mục không khôi phục được** → **TH4**.
4. Kết quả = **mức xấu nhất** trong các quy tắc trên.
5. Không có gì sứt lớn/hỏng nặng, không mối mọt → **TH1**.
6. **Trạng thái chốt** (`status`):
   - Có `longDinh` > 0 **và** kết quả hiện tại < TH4 → `recheck` (chưa chốt, yêu cầu đóng lại đinh rồi kiểm lại). Kết quả hiển thị là "tạm tính" từ phần còn lại.
   - Kết quả đã là TH4 (do mối mọt hoặc do số lượng hỏng nặng) → `final`, vì đóng đinh không thể làm pallet tốt lên.
   - Không có `longDinh` → `final`.

### Ý nghĩa & hành động khuyến nghị (từ tài liệu)

| Loại | Ý nghĩa | Hành động hiển thị |
|---|---|---|
| TH1 | Sẵn sàng sử dụng | Dùng bình thường, kể cả xếp hàng hóa. |
| TH2 | Khuyến nghị không nên sử dụng, nên sửa chữa để tránh hỏng thêm | Không dùng xếp hàng hóa. Tách riêng, đưa đi sửa. |
| TH3 | Cần phải sửa chữa | Không dùng xếp hàng hóa. Tách riêng, bắt buộc sửa chữa. |
| TH4 | Hỏng, sửa chữa không hiệu quả | Loại bỏ. Không sửa, không dùng. |

Khi `status = recheck`, thay hành động bằng: **"Đóng lại đinh các thanh bị bung/tách, rồi kiểm tra lại."**

---

## 3. Các quyết định cho điểm mơ hồ của tài liệu

Đây là **quy tắc cuối cùng**. AI không được tự thay đổi.

1. **Sứt lớn không tính vào ngưỡng nhóm** (quyết định 6). Chỉ hỏng nặng tính vào ngưỡng TH3/TH4 của từng nhóm. Sứt lớn chỉ tính vào quy tắc tổng ≥ 7.
2. **Kích thước hỗn hợp dùng "HOẶC"** (quyết định 7). Ví dụ vết sâu 30mm dài 100mm là sứt lớn; vết sâu 5mm dài 350mm cũng là sứt lớn.
3. **Gánh tách rời còn nguyên và mọi thanh bung đinh → đóng lại rồi kiểm lại** (quyết định 8).
4. **Gánh "mất < 4 thanh" ở TH2** luôn đúng vì pallet chỉ có 3 gánh. Hiểu là: gánh chỉ vào TH2 khi sứt lớn; 1 gánh hỏng nặng (gãy/mất chịu lực) = TH3; 2 gánh = TH4.
5. **Cục gù**: 1 gù hỏng nặng = TH2; 2–3 = TH3; ≥ 4 = TH4. Cục gù bị tách đôi tính là hỏng nặng.
6. **Thanh mặt TH2 ghi "bề rộng ≥ 25mm"** hiểu là **chiều sâu** (đồng nhất với các nhóm khác).
7. **Tổng ≥ 7** tính cả sứt lớn và hỏng nặng. Thanh mặt TH4 "6 thanh" hiểu là ≥ 6.

---

## 4. Hợp đồng dữ liệu (Task A viết, Task B dùng, Task E test)

### Input

```js
{
  moiMot: false,                            // boolean
  mat:  { vua: 0, nang: 0, longDinh: 0 },   // 0..9, vua + nang + longDinh <= 9
  ganh: { vua: 0, nang: 0, longDinh: 0 },   // 0..3
  gu:   { vua: 0, nang: 0 },                // 0..9, KHÔNG có longDinh
  day:  { vua: 0, nang: 0, longDinh: 0 }    // 0..5
}
```

Trường thiếu mặc định là 0.

### Output

```js
{
  level: 3,                  // 1..4. Khi status = 'recheck' là kết quả TẠM TÍNH
  label: "TH3",
  status: "final",           // "final" | "recheck"
  recheckGroups: [           // rỗng nếu không có longDinh
    { group: "mat", count: 2 }
  ],
  totalDamaged: 4,           // tổng vua + nang (không gồm longDinh)
  reasons: [                 // chuỗi tiếng Việt, sắp xếp từ nặng đến nhẹ
    "Thanh mặt hỏng nặng: 4"
  ]
}
```

### Lỗi

`classify()` **throw `RangeError`** với thông điệp tiếng Việt nếu: số âm, không phải số nguyên, `vua + nang + longDinh` vượt tổng nhóm, hoặc `gu.longDinh > 0`.

### Xuất module

```js
// js/classify.js
export function classify(input) { ... }

// js/rules.js
export const RULES = { mat: {...}, ganh: {...}, gu: {...}, day: {...} };
export const TOTAL_TH4 = 7;
```

### Cài đặt tham chiếu (đã chạy thử, đạt toàn bộ bộ test mục 7)

```js
// js/rules.js
export const RULES = {
  mat:  { label: 'Thanh mặt', total: 9, th2: 1, th3: 4, th4: 6, canRenail: true  },
  ganh: { label: 'Gánh',      total: 3, th2: 1, th3: 1, th4: 2, canRenail: true  },
  gu:   { label: 'Cục gù',    total: 9, th2: 1, th3: 2, th4: 4, canRenail: false },
  day:  { label: 'Thanh đáy', total: 5, th2: 1, th3: 4, th4: 5, canRenail: true  },
};
export const TOTAL_TH4 = 7;

// js/classify.js
import { RULES, TOTAL_TH4 } from './rules.js';
const isInt = (n) => Number.isInteger(n) && n >= 0;

export function classify(input) {
  const reasons = [];
  const recheckGroups = [];
  let level = 1;
  let tong = 0;
  const raise = (lv, why) => {
    if (lv > level) level = lv;
    if (lv > 1) reasons.push({ lv, why });
  };

  if (input.moiMot) raise(4, 'Mối mọt / nhiễm bẩn / mục không khôi phục được');

  for (const [k, r] of Object.entries(RULES)) {
    const { vua = 0, nang = 0, longDinh = 0 } = input[k] || {};
    if (![vua, nang, longDinh].every(isInt))
      throw new RangeError(`${r.label}: số lượng phải là số nguyên không âm`);
    if (longDinh > 0 && !r.canRenail)
      throw new RangeError(`${r.label}: không có mục bung đinh/tách rời`);
    if (vua + nang + longDinh > r.total)
      throw new RangeError(`${r.label}: vượt quá ${r.total}`);

    tong += vua + nang;
    const lv = nang >= r.th4 ? 4 : nang >= r.th3 ? 3 : nang >= r.th2 ? 2 : 1;
    if (lv > 1) raise(lv, `${r.label} hỏng nặng: ${nang}`);
    if (vua > 0) raise(2, `${r.label} sứt lớn: ${vua}`);
    if (longDinh > 0) recheckGroups.push({ group: k, count: longDinh });
  }

  if (tong >= TOTAL_TH4) raise(4, `Tổng cấu kiện hỏng ${tong} ≥ ${TOTAL_TH4} (25% tổng số thanh)`);

  reasons.sort((a, b) => b.lv - a.lv);
  const status = recheckGroups.length > 0 && level < 4 ? 'recheck' : 'final';
  return {
    level, label: 'TH' + level, status, recheckGroups,
    totalDamaged: tong, reasons: reasons.map((x) => x.why),
  };
}
```

---

## 5. Yêu cầu giao diện (Task B)

### Nguyên tắc

- **Một trang duy nhất**, cuộn dọc, không chuyển trang.
- **Mobile-first** (360–420px), chữ ≥ 16px, nút bấm ≥ 48px, thao tác một tay.
- **Kết quả cập nhật ngay** khi nhập, không có nút "Tính".
- Ngoài trời/kho sáng: độ tương phản cao.

### Bố cục

1. **Header**: tên app, nút "?" mở hướng dẫn (sơ đồ pallet, định nghĩa các mức, cách dùng thước mẫu).
2. **Câu hỏi nhanh**: "Pallet có mối mọt / nhiễm bẩn / mục không?" — công tắc Có/Không. Chọn Có → TH4 ngay.
3. **4 thẻ nhóm cấu kiện** (mặt, gánh, gù, đáy). Mỗi thẻ có:
   - Tên + tổng số ("Thanh mặt — 9 thanh").
   - Bộ đếm +/− **Sứt lớn** và **Hỏng nặng**.
   - Riêng mặt, gánh, đáy: thêm bộ đếm **Bung đinh / tách rời (còn nguyên)**.
   - Dòng gợi ý ngắn dưới mỗi bộ đếm mô tả mức (ví dụ "Hỏng nặng: gãy, vỡ, nứt, mất").
   - Không cho tăng khi `vua + nang + longDinh` đã bằng tổng nhóm (vô hiệu hóa nút +).
4. **Thanh kết quả dính đáy màn hình** (sticky bottom):
   - `status = final`: nền theo loại (TH1 xanh lá, TH2 xanh dương, TH3 vàng, TH4 đỏ), chữ lớn "TH3", một dòng ý nghĩa, nút "Xem chi tiết" mở danh sách lý do và hành động.
   - `status = recheck`: nền **xám/cam cảnh báo**, tiêu đề **"CHƯA CHỐT — đóng lại đinh rồi kiểm lại"**, dòng nhỏ "Tạm tính: TH2", liệt kê nhóm cần đóng lại (ví dụ "Thanh mặt: 2 thanh"), và nút **"Đã đóng lại — kiểm tra lại"**.
5. **Nút "Đã đóng lại — kiểm tra lại"**: đặt `longDinh` của các nhóm về 0, tính lại kết quả, và hiện nhắc: "Thanh nào đóng lại không được thì nhập vào Hỏng nặng."
6. **Nút "Kiểm tra pallet mới"**: đặt lại toàn bộ form (có xác nhận nhẹ nếu đã nhập).

### Hành vi

- Trạng thái ban đầu: tất cả bằng 0 → hiển thị TH1.
- Rung nhẹ (`navigator.vibrate`) khi đổi loại kết quả, nếu thiết bị hỗ trợ.
- Không lưu gì vào `localStorage` hay server. Tải lại trang là bắt đầu lại.
- Không dùng thư viện ngoài, không CDN.

### Truy cập

- `aria-live="polite"` cho vùng kết quả.
- Không chỉ dựa vào màu: luôn có chữ "TH1–TH4" hoặc "CHƯA CHỐT".

---

## 6. Phân công công việc

A, C, D làm **song song ngay**. B bắt đầu với mock `classify()` rồi ghép thật. E chạy sau khi A xong.

### Task A — Logic phân loại (AI #1)

**Giao:** `js/rules.js`, `js/classify.js`, `tests/classify.test.js` (phần cơ bản).

- Triển khai đúng hợp đồng mục 4 (có thể dùng cài đặt tham chiếu làm điểm bắt đầu, nhưng phải tự chạy test).
- Không phụ thuộc DOM, không import ngoài.
- Chạy được bằng `node --test tests/`.

**Xong khi:** toàn bộ 36 ca mục 7 đạt.

### Task B — Giao diện (AI #2)

**Giao:** `index.html`, `css/style.css`, `js/app.js`.

- Theo mục 5. Import `classify` từ `js/classify.js` và chuỗi từ `content/texts.js`.
- Trong lúc chờ Task A: tạo mock `classify()` rồi thay bằng bản thật.
- Xử lý đúng hai trạng thái `final` và `recheck`, và nút "Đã đóng lại — kiểm tra lại".
- Kiểm tra tại viewport 360×640 và 412×915.

**Xong khi:** nhập các ca mục 7 ra đúng kết quả; không cuộn ngang; nút ≥ 48px.

### Task C — Nội dung & tài nguyên (AI #3)

**Giao:** `content/texts.js`, `assets/pallet-diagram.svg`, `assets/gauge-card.svg`.

- `texts.js` gồm: tên nhóm; mô tả từng mức (nhẹ / sứt lớn / hỏng nặng / bung đinh-tách rời) cho từng nhóm bằng từ nhân viên kho quen dùng; ý nghĩa và hành động TH1–TH4; nội dung trạng thái `recheck` (tiêu đề, hướng dẫn đóng lại, nhắc thanh không đóng được thì nhập hỏng nặng); nội dung màn hình "?".
- Định nghĩa "sứt lớn" trong mô tả phải ghi rõ quy tắc **HOẶC** ("sâu từ 25mm trở lên **hoặc** dài từ 300mm trở lên").
- `pallet-diagram.svg`: sơ đồ pallet đơn giản, tô màu và chú thích 4 nhóm (mặt xanh dương, gánh đỏ, gù xanh đậm, đáy xanh lá như tài liệu), vector, dưới 30KB.
- `gauge-card.svg`: **thước mẫu in ra** kích thước thật, khổ A4: vạch 20mm, 25mm, 300mm; một dòng hướng dẫn "Sâu ≥ 25mm HOẶC dài ≥ 300mm = Sứt lớn". Đặt kích thước theo mm trong SVG để in đúng tỉ lệ.

**Xong khi:** import được vào Task B không lỗi; thước in ra đo đúng bằng thước thật.

### Task D — PWA & deploy Cloudflare (AI #4)

**Giao:** `manifest.webmanifest`, `sw.js`, `_headers`, `assets/icons/`, `README.md`, (tùy chọn) `wrangler.toml`.

- Manifest: tên "Pallet Checker", `display: standalone`, `lang: vi`, `theme_color`, icon 192/512 và maskable.
- Service worker: precache toàn bộ file tĩnh (liệt kê rõ), cache-first, có version; bản mới tải ở lần mở sau.
- `_headers`: `sw.js` và `index.html` cache ngắn (`max-age=0, must-revalidate`); file tĩnh khác cache dài; `X-Content-Type-Options: nosniff`.
- README tiếng Việt, ngắn: deploy Cloudflare Pages bằng (1) kết nối repo GitHub, build command để trống, output directory là thư mục gốc; (2) `npx wrangler pages deploy .`. Kèm cách thêm app vào màn hình chính Android/iPhone.
- Xác nhận không dùng tính năng ngoài free tier.

**Xong khi:** Lighthouse PWA hợp lệ; tắt mạng vẫn mở và dùng được sau lần tải đầu.

### Task E — QA & rà soát (AI #5, chạy sau A và B)

**Giao:** bổ sung `tests/classify.test.js`, báo cáo `QA_REPORT.md`.

- Viết test đầy đủ theo mục 7 và thêm ca biên.
- Đối chiếu logic với tài liệu gốc (PDF) và với mục 2, 3 của file này; liệt kê mọi sai lệch.
- Duyệt giao diện theo mục 5: kích thước nút, tương phản, thao tác một tay, cuộn ngang, luồng `recheck`.
- **Không thay đổi** các quyết định ở mục 0 và mục 3, chỉ báo cáo.

**Xong khi:** `node --test` xanh toàn bộ và `QA_REPORT.md` liệt kê vấn đề (hoặc ghi "không có").

---

## 7. Bộ test tối thiểu (36 ca, đã chạy thử trên cài đặt tham chiếu)

Chỉ ghi các nhóm khác 0. Mặc định `moiMot: false` và mọi giá trị còn lại là 0.

| # | Input | Kết quả | Status | Ghi chú |
|---|---|---|---|---|
| 1 | (tất cả 0) | TH1 | final | |
| 2 | `mat.nang = 1` | TH2 | final | |
| 3 | `mat.nang = 3` | TH2 | final | biên trên TH2 |
| 4 | `mat.nang = 4` | TH3 | final | biên dưới TH3 |
| 5 | `mat.nang = 5` | TH3 | final | |
| 6 | `mat.nang = 6` | TH4 | final | biên dưới TH4 |
| 7 | `ganh.vua = 1` | TH2 | final | |
| 8 | `ganh.nang = 1` | TH3 | final | gánh gãy |
| 9 | `ganh.nang = 2` | TH4 | final | |
| 10 | `gu.nang = 1` | TH2 | final | |
| 11 | `gu.nang = 2` | TH3 | final | |
| 12 | `gu.nang = 3` | TH3 | final | |
| 13 | `gu.nang = 4` | TH4 | final | |
| 14 | `day.nang = 3` | TH2 | final | |
| 15 | `day.nang = 4` | TH3 | final | |
| 16 | `day.nang = 5` | TH4 | final | |
| 17 | `moiMot = true` | TH4 | final | |
| 18 | `mat.vua = 2`, `gu.vua = 1` | TH2 | final | |
| 19 | `mat.nang = 3`, `day.nang = 3` | TH2 | final | tổng 6, chưa đủ 7 |
| 20 | `mat.nang = 3`, `gu.nang = 1`, `day.nang = 3` | TH4 | final | tổng 7, từng nhóm chỉ TH2 |
| 21 | `mat.vua = 4`, `gu.vua = 3` | TH4 | final | tổng 7 (sứt lớn tính vào tổng) |
| 22 | `mat.nang = 4`, `gu.nang = 1` | TH3 | final | |
| 23 | `mat.vua = 5`, `mat.nang = 5` | `RangeError` | — | vượt tổng 9 |
| 24 | `gu.nang = -1` | `RangeError` | — | số âm |
| 25 | `day.vua = 1.5` | `RangeError` | — | không nguyên |
| 26 | `moiMot = true`, `mat.nang = 6` | TH4 | final | `reasons` có cả hai lý do |
| 27 | `mat.longDinh = 2` | TH1 (tạm tính) | **recheck** | |
| 28 | `ganh.longDinh = 1` | TH1 (tạm tính) | **recheck** | |
| 29 | `mat.nang = 6`, `day.longDinh = 1` | TH4 | final | đã TH4, không cần kiểm lại |
| 30 | `moiMot = true`, `mat.longDinh = 2` | TH4 | final | |
| 31 | `mat.longDinh = 3`, `gu.nang = 2` | TH3 (tạm tính) | **recheck** | |
| 32 | `gu.longDinh = 1` | `RangeError` | — | gù không có mục này |
| 33 | `mat.vua = 5`, `mat.nang = 3`, `mat.longDinh = 2` | `RangeError` | — | 10 > 9 |
| 34 | `mat.vua = 1`, `mat.longDinh = 1` | TH2 (tạm tính) | **recheck** | |
| 35 | `mat.nang = 3`, `mat.longDinh = 2`, `day.nang = 3` | TH2 (tạm tính) | **recheck** | tổng 6, `longDinh` không tính |
| 36 | `mat.longDinh = 9` | TH1 (tạm tính) | **recheck** | biên tối đa |

---

## 8. Thứ tự làm & ghép nối

1. **Song song**: A, C, D bắt đầu ngay. B bắt đầu với mock.
2. A xong → B ghép logic thật; E bắt đầu viết test.
3. C xong → B import `texts.js` và SVG.
4. D chạy sau khi biết danh sách file cuối cùng để precache.
5. E rà soát toàn bộ, báo lỗi → AI phụ trách sửa theo task.
6. Deploy thử trên Cloudflare Pages, kiểm tra trên điện thoại thật (Android + iPhone).

### Quy ước chung cho mọi AI

- Chỉ sửa file thuộc task của mình; cần đổi hợp đồng thì ghi đề xuất, không tự đổi.
- Không thêm tính năng ngoài mục "Ngoài phạm vi".
- Không dùng thư viện ngoài, không CDN.
- Comment trong code bằng tiếng Việt, ngắn gọn.
- Nộp kèm ghi chú: đã làm gì, chưa làm gì, giả định nào đã áp dụng.

---

## 9. Tiêu chí hoàn thành cả dự án

- [ ] 36 ca test mục 7 đạt.
- [ ] Trên điện thoại 360×640: nhập đủ một pallet trong dưới 30 giây, không cuộn ngang.
- [ ] Kết quả đổi ngay khi nhập, có lý do và hành động.
- [ ] Luồng "bung đinh → đóng lại → kiểm lại" chạy đúng, và pallet đã TH4 thì không bắt kiểm lại.
- [ ] Hoạt động offline sau lần mở đầu tiên.
- [ ] Triển khai thành công trên Cloudflare Pages free, không cần Worker hay dịch vụ trả phí.
- [ ] Thước mẫu in ra đo đúng 20mm / 25mm / 300mm.
- [ ] Không có dữ liệu nào rời khỏi điện thoại.
