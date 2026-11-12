// Logic phân loại pallet thuần — KHÔNG đụng DOM, chạy được cả trên Node lẫn trình duyệt.
import { RULES, TOTAL_TH4 } from './rules.js';

const isInt = (n) => Number.isInteger(n) && n >= 0;

/**
 * Phân loại một pallet.
 * @param {object} input xem hợp đồng dữ liệu mục 4
 * @returns {{level:number,label:string,status:'final'|'recheck',recheckGroups:{group:string,count:number}[],totalDamaged:number,reasons:string[]}}
 * @throws {RangeError} khi dữ liệu không hợp lệ
 */
export function classify(input = {}) {
  const reasons = [];
  const recheckGroups = [];
  let level = 1;
  let tong = 0;

  // Nâng mức kết quả và ghi lý do (chỉ ghi lý do khi > TH1)
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

    // Chỉ mất mảng gỗ + gãy/mất tính vào tổng; bung đinh chưa tính
    tong += vua + nang;

    // Ngưỡng nhóm chỉ tính gãy/mất
    const lv = nang >= r.th4 ? 4 : nang >= r.th3 ? 3 : nang >= r.th2 ? 2 : 1;
    if (lv > 1) raise(lv, `${r.label} gãy/mất: ${nang}`);

    // Có mất mảng gỗ → tối thiểu TH2
    if (vua > 0) raise(2, `${r.label} mất mảng gỗ: ${vua}`);

    if (longDinh > 0) recheckGroups.push({ group: k, count: longDinh });
  }

  if (tong >= TOTAL_TH4)
    raise(4, `Tổng cấu kiện hỏng ${tong} ≥ ${TOTAL_TH4} (25% tổng số thanh)`);

  // Sắp xếp lý do từ nặng đến nhẹ (sort ổn định giữ thứ tự nhóm)
  reasons.sort((a, b) => b.lv - a.lv);

  // Đã TH4 thì đóng đinh không cứu được → chốt luôn
  const status = recheckGroups.length > 0 && level < 4 ? 'recheck' : 'final';

  return {
    level,
    label: 'TH' + level,
    status,
    recheckGroups,
    totalDamaged: tong,
    reasons: reasons.map((x) => x.why),
  };
}
