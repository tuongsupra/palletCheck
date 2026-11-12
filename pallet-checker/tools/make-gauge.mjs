// Script phụ: sinh assets/gauge-card.svg (đơn vị = mm). Chạy: node tools/make-gauge.mjs
import { writeFileSync } from 'node:fs';

const out = [];
const p = (s) => out.push(s);
const t = (x, y, s, size = 3.5, extra = '') =>
  p(`<text x="${x}" y="${y}" font-size="${size}" ${extra}>${s}</text>`);

// Vạch chia mm cho đoạn [x0, x0+len], nhãn bắt đầu từ start
function ruler(x0, y, len, start, step = 10, labelEvery = 10) {
  for (let i = 0; i <= len; i++) {
    const x = x0 + i;
    const h = i % 10 === 0 ? 6 : i % 5 === 0 ? 4 : 2.2;
    p(`<line x1="${x}" y1="${y}" x2="${x}" y2="${y + h}" stroke="#000" stroke-width="0.15"/>`);
    if (i % labelEvery === 0) t(x, y + 9.5, String(start + i), 2.8, 'text-anchor="middle"');
  }
}

p(`<?xml version="1.0" encoding="UTF-8"?>`);
p(`<svg xmlns="http://www.w3.org/2000/svg" width="210mm" height="297mm" viewBox="0 0 210 297" font-family="Arial, Helvetica, sans-serif">`);
p(`<title>Thước mẫu pallet — in A4 tỉ lệ 100%</title>`);
p(`<rect width="210" height="297" fill="#fff"/>`);

// Tiêu đề và quy tắc
t(105, 16, 'THƯỚC MẪU KIỂM PALLET', 6, 'text-anchor="middle" font-weight="700"');
t(105, 23, 'In khổ A4, chọn "Kích thước thật / 100%" — KHÔNG chọn "Vừa trang"', 3.2, 'text-anchor="middle"');
p(`<rect x="15" y="28" width="180" height="16" rx="2" fill="#fff3cd" stroke="#b58100" stroke-width="0.4"/>`);
t(105, 35, 'Sâu ≥ 25mm HOẶC dài ≥ 300mm = Sứt lớn', 5.2, 'text-anchor="middle" font-weight="700"');
t(105, 41, 'Cục gù: sâu ≥ 20mm HOẶC rộng ≥ 1/3 mặt gù = Sứt lớn', 3.4, 'text-anchor="middle"');

// 1) Vạch kiểm tra tỉ lệ 100mm
t(15, 55, '1. Kiểm tra tỉ lệ in: đo đoạn dưới bằng thước thật, phải đúng 100mm.', 3.4, 'font-weight="700"');
p(`<line x1="55" y1="60" x2="155" y2="60" stroke="#000" stroke-width="0.4"/>`);
ruler(55, 60, 100, 0);
t(160, 64, 'mm', 3);

// 2) Thước đo sâu: hai ngạnh 20mm và 25mm
t(15, 85, '2. Thước đo SÂU — cắt theo nét đứt, cắm ngạnh vào vết sứt.', 3.4, 'font-weight="700"');
// Thân thước: x 20..110, y 92..108; ngạnh 20mm tại x 30..45, ngạnh 25mm tại x 80..95
p(`<path d="M20 92 H110 V108 H95 V133 H80 V108 H45 V128 H30 V108 H20 Z" fill="#e8f0fe" stroke="#000" stroke-width="0.3" stroke-dasharray="1.5 1"/>`);
t(65, 101.5, 'THƯỚC ĐO SÂU', 3.4, 'text-anchor="middle" font-weight="700"');
// ngạnh 20 (gù)
p(`<line x1="28" y1="108" x2="28" y2="128" stroke="#1b5e20" stroke-width="0.4"/>`);
t(37.5, 118, '20', 4, 'text-anchor="middle" font-weight="700" fill="#1b5e20"');
t(37.5, 123, 'mm', 2.6, 'text-anchor="middle" fill="#1b5e20"');
t(37.5, 137, 'Cục gù', 3, 'text-anchor="middle"');
// ngạnh 25 (thanh)
p(`<line x1="97" y1="108" x2="97" y2="133" stroke="#c62828" stroke-width="0.4"/>`);
t(87.5, 120, '25', 4, 'text-anchor="middle" font-weight="700" fill="#c62828"');
t(87.5, 125, 'mm', 2.6, 'text-anchor="middle" fill="#c62828"');
t(87.5, 142, 'Thanh mặt/gánh/đáy', 3, 'text-anchor="middle"');
// Ghi chú
t(118, 100, 'Cắm ngạnh thẳng xuống đáy vết sứt:', 3);
t(118, 106, '• Ngạnh chạm đáy mà thân thước còn', 3);
t(118, 111, '  hở trên mặt gỗ → chưa đủ sâu.', 3);
t(118, 117, '• Ngạnh lọt hết, thân thước chạm', 3);
t(118, 122, '  mặt gỗ → đủ sâu → SỨT LỚN.', 3, 'font-weight="700"');

// 3) Thước đo dài 300mm: 2 dải nối nhau (A4 chỉ dài 297mm)
t(15, 160, '3. Thước đo DÀI 300mm — A4 không đủ dài, cắt 2 dải rồi dán nối.', 3.4, 'font-weight="700"');
t(15, 166, 'Dán mép phải dải A (vạch 150) trùng vạch 150 trên dải B, phủ lên phần "DÁN".', 3);

// Dải A: 0..150, x 30..180
t(15, 182, 'A', 6, 'font-weight="700"');
p(`<rect x="30" y="174" width="150" height="16" fill="#fff" stroke="#000" stroke-width="0.3" stroke-dasharray="1.5 1"/>`);
ruler(30, 174, 150, 0);
t(105, 188.5, '0 → 150mm', 2.8, 'text-anchor="middle" fill="#555"');

// Dải B: phần dán 10mm (x 20..30) + 150..300 (x 30..180)
t(10, 210, 'B', 6, 'font-weight="700"');
p(`<rect x="20" y="202" width="10" height="16" fill="#ddd" stroke="#000" stroke-width="0.3" stroke-dasharray="1.5 1"/>`);
t(25, 216.5, 'DÁN', 2.4, 'text-anchor="middle" font-weight="700"');
p(`<rect x="30" y="202" width="150" height="16" fill="#fff" stroke="#000" stroke-width="0.3" stroke-dasharray="1.5 1"/>`);
ruler(30, 202, 150, 150);
p(`<line x1="180" y1="198" x2="180" y2="222" stroke="#c62828" stroke-width="0.8"/>`);
t(186, 209, '300mm', 3.2, 'font-weight="700" fill="#c62828"');
t(186, 213.5, '= sứt lớn', 2.8, 'fill="#c62828"');
t(105, 216.5, '150 → 300mm', 2.8, 'text-anchor="middle" fill="#555"');

// Hướng dẫn dùng
t(15, 236, 'Cách dùng:', 3.4, 'font-weight="700"');
t(15, 242, '• Đặt vạch 0 ở đầu vết sứt, kéo dọc thanh. Vết sứt tới hoặc quá vạch 300 → Sứt lớn.', 3);
t(15, 248, '• Chỉ cần vượt MỘT trong hai ngưỡng (sâu HOẶC dài) là Sứt lớn.', 3);
t(15, 254, '• Gãy, vỡ, nứt, mất thanh, gù tách đôi → nhập Hỏng nặng (không cần đo).', 3);
t(15, 260, '• Bung đinh nhưng gỗ còn nguyên → nhập Bung đinh, đóng lại đinh rồi kiểm lại.', 3);
t(105, 285, 'Pallet Checker — dán thước lên bìa cứng để dùng lâu.', 2.8, 'text-anchor="middle" fill="#555"');

p(`</svg>`);
writeFileSync(new URL('../assets/gauge-card.svg', import.meta.url), out.join('\n') + '\n');
console.log('Đã sinh assets/gauge-card.svg');
