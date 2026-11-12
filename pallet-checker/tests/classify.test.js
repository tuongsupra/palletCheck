// Bộ test phân loại — chạy: node --test tests/
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { classify } from '../js/classify.js';
import { RULES, TOTAL_TH4 } from '../js/rules.js';

// Tạo input đầy đủ từ phần khác 0
const mk = (p = {}) => ({
  moiMot: false,
  mat: { vua: 0, nang: 0, longDinh: 0, ...p.mat },
  ganh: { vua: 0, nang: 0, longDinh: 0, ...p.ganh },
  gu: { vua: 0, nang: 0, ...p.gu },
  day: { vua: 0, nang: 0, longDinh: 0, ...p.day },
  ...(p.moiMot !== undefined ? { moiMot: p.moiMot } : {}),
});

// ---- 36 ca tối thiểu (mục 7) ----
const CASES = [
  [1, {}, 1, 'final'],
  [2, { mat: { nang: 1 } }, 2, 'final'],
  [3, { mat: { nang: 3 } }, 2, 'final'],
  [4, { mat: { nang: 4 } }, 3, 'final'],
  [5, { mat: { nang: 5 } }, 3, 'final'],
  [6, { mat: { nang: 6 } }, 4, 'final'],
  [7, { ganh: { vua: 1 } }, 2, 'final'],
  [8, { ganh: { nang: 1 } }, 3, 'final'],
  [9, { ganh: { nang: 2 } }, 4, 'final'],
  [10, { gu: { nang: 1 } }, 2, 'final'],
  [11, { gu: { nang: 2 } }, 3, 'final'],
  [12, { gu: { nang: 3 } }, 3, 'final'],
  [13, { gu: { nang: 4 } }, 4, 'final'],
  [14, { day: { nang: 3 } }, 2, 'final'],
  [15, { day: { nang: 4 } }, 3, 'final'],
  [16, { day: { nang: 5 } }, 4, 'final'],
  [17, { moiMot: true }, 4, 'final'],
  [18, { mat: { vua: 2 }, gu: { vua: 1 } }, 2, 'final'],
  [19, { mat: { nang: 3 }, day: { nang: 3 } }, 2, 'final'],
  [20, { mat: { nang: 3 }, gu: { nang: 1 }, day: { nang: 3 } }, 4, 'final'],
  [21, { mat: { vua: 4 }, gu: { vua: 3 } }, 4, 'final'],
  [22, { mat: { nang: 4 }, gu: { nang: 1 } }, 3, 'final'],
  [23, { mat: { vua: 5, nang: 5 } }, 'error'],
  [24, { gu: { nang: -1 } }, 'error'],
  [25, { day: { vua: 1.5 } }, 'error'],
  [26, { moiMot: true, mat: { nang: 6 } }, 4, 'final'],
  [27, { mat: { longDinh: 2 } }, 1, 'recheck'],
  [28, { ganh: { longDinh: 1 } }, 1, 'recheck'],
  [29, { mat: { nang: 6 }, day: { longDinh: 1 } }, 4, 'final'],
  [30, { moiMot: true, mat: { longDinh: 2 } }, 4, 'final'],
  [31, { mat: { longDinh: 3 }, gu: { nang: 2 } }, 3, 'recheck'],
  [32, { gu: { longDinh: 1 } }, 'error'],
  [33, { mat: { vua: 5, nang: 3, longDinh: 2 } }, 'error'],
  [34, { mat: { vua: 1, longDinh: 1 } }, 2, 'recheck'],
  [35, { mat: { nang: 3, longDinh: 2 }, day: { nang: 3 } }, 2, 'recheck'],
  [36, { mat: { longDinh: 9 } }, 1, 'recheck'],
];

describe('36 ca tối thiểu (mục 7)', () => {
  for (const [no, p, lv, st] of CASES) {
    test(`ca ${no}`, () => {
      if (lv === 'error') {
        assert.throws(() => classify(mk(p)), RangeError);
        return;
      }
      const r = classify(mk(p));
      assert.equal(r.level, lv);
      assert.equal(r.label, 'TH' + lv);
      assert.equal(r.status, st);
    });
  }
});

// ---- Kiểm tra chi tiết output ----
describe('chi tiết output', () => {
  test('ca 26: reasons có cả mối mọt và thanh mặt', () => {
    const r = classify(mk({ moiMot: true, mat: { nang: 6 } }));
    assert.ok(r.reasons.some((s) => s.includes('Mối mọt')));
    assert.ok(r.reasons.some((s) => s.includes('Thanh mặt gãy/mất: 6')));
  });

  test('trạng thái ban đầu: TH1, không lý do, tổng 0', () => {
    const r = classify(mk());
    assert.deepEqual(r, {
      level: 1, label: 'TH1', status: 'final', recheckGroups: [], totalDamaged: 0, reasons: [],
    });
  });

  test('recheckGroups liệt kê đúng nhóm và số lượng, theo thứ tự nhóm', () => {
    const r = classify(mk({ mat: { longDinh: 2 }, ganh: { longDinh: 1 }, day: { longDinh: 3 } }));
    assert.deepEqual(r.recheckGroups, [
      { group: 'mat', count: 2 }, { group: 'ganh', count: 1 }, { group: 'day', count: 3 },
    ]);
    assert.equal(r.status, 'recheck');
  });

  test('recheckGroups vẫn được trả về khi đã TH4 (status final)', () => {
    const r = classify(mk({ mat: { nang: 6 }, day: { longDinh: 1 } }));
    assert.equal(r.status, 'final');
    assert.deepEqual(r.recheckGroups, [{ group: 'day', count: 1 }]);
  });

  test('totalDamaged = vua + nang, không gồm longDinh', () => {
    const r = classify(mk({ mat: { vua: 1, nang: 2, longDinh: 3 }, gu: { vua: 1 } }));
    assert.equal(r.totalDamaged, 4);
  });

  test('reasons sắp xếp từ nặng đến nhẹ', () => {
    const r = classify(mk({ mat: { vua: 1 }, gu: { nang: 2 }, day: { nang: 3 } }));
    assert.deepEqual(r.reasons, ['Cục gù gãy/mất: 2', 'Thanh mặt mất mảng gỗ: 1', 'Thanh đáy gãy/mất: 3']);
  });

  test('lý do tổng ≥ 7 xuất hiện khi đạt ngưỡng', () => {
    const r = classify(mk({ mat: { vua: 4 }, gu: { vua: 3 } }));
    assert.equal(r.reasons[0], `Tổng cấu kiện hỏng 7 ≥ ${TOTAL_TH4} (25% tổng số thanh)`);
  });

  test('ca 35: tổng 6, longDinh không đẩy lên TH4', () => {
    const r = classify(mk({ mat: { nang: 3, longDinh: 2 }, day: { nang: 3 } }));
    assert.equal(r.totalDamaged, 6);
    assert.equal(r.level, 2);
  });
});

// ---- Ca biên bổ sung (Task E) ----
describe('ca biên bổ sung', () => {
  test('trường thiếu mặc định 0', () => {
    assert.equal(classify({}).level, 1);
    assert.equal(classify({ mat: { nang: 4 } }).level, 3);
    assert.equal(classify().level, 1);
  });

  test('sứt lớn không tính vào ngưỡng nhóm: mat.vua = 6 chỉ TH2', () => {
    assert.equal(classify(mk({ mat: { vua: 6 } })).level, 2);
  });

  test('sứt lớn tối đa cả gù (9) → TH4 do tổng', () => {
    assert.equal(classify(mk({ gu: { vua: 9 } })).level, 4);
  });

  test('gánh: 3 sứt lớn → TH2; 1 sứt + 1 hỏng → TH3; 3 hỏng → TH4', () => {
    assert.equal(classify(mk({ ganh: { vua: 3 } })).level, 2);
    assert.equal(classify(mk({ ganh: { vua: 1, nang: 1 } })).level, 3);
    assert.equal(classify(mk({ ganh: { nang: 3 } })).level, 4);
  });

  test('tổng 6 sứt lớn rải đều → TH2', () => {
    const r = classify(mk({ mat: { vua: 2 }, ganh: { vua: 1 }, gu: { vua: 2 }, day: { vua: 1 } }));
    assert.equal(r.totalDamaged, 6);
    assert.equal(r.level, 2);
  });

  test('tổng 6 + 1 bung đinh → vẫn TH2 tạm tính', () => {
    const r = classify(mk({ mat: { vua: 2 }, ganh: { vua: 1, longDinh: 1 }, gu: { vua: 2 }, day: { vua: 1 } }));
    assert.equal(r.level, 2);
    assert.equal(r.status, 'recheck');
  });

  test('đầy đủ nhóm tối đa không lỗi', () => {
    for (const [k, r] of Object.entries(RULES)) {
      assert.doesNotThrow(() => classify(mk({ [k]: { nang: r.total } })));
      assert.throws(() => classify(mk({ [k]: { nang: r.total + 1 } })), RangeError);
    }
  });

  test('ganh/day vượt tổng có longDinh → lỗi', () => {
    assert.throws(() => classify(mk({ ganh: { vua: 2, longDinh: 2 } })), RangeError);
    assert.throws(() => classify(mk({ day: { nang: 3, longDinh: 3 } })), RangeError);
  });

  test('giá trị không phải số → lỗi', () => {
    assert.throws(() => classify(mk({ mat: { nang: '2' } })), RangeError);
    assert.throws(() => classify(mk({ mat: { nang: NaN } })), RangeError);
    assert.throws(() => classify(mk({ mat: { nang: null } })), RangeError);
    assert.throws(() => classify(mk({ mat: { longDinh: -1 } })), RangeError);
  });

  test('gu.longDinh = 0 hợp lệ', () => {
    assert.doesNotThrow(() => classify(mk({ gu: { longDinh: 0 } })));
  });

  test('thông điệp lỗi bằng tiếng Việt', () => {
    assert.throws(() => classify(mk({ mat: { vua: 5, nang: 5 } })), /Thanh mặt: vượt quá 9/);
    assert.throws(() => classify(mk({ gu: { longDinh: 1 } })), /Cục gù: không có mục bung đinh/);
    assert.throws(() => classify(mk({ day: { vua: 1.5 } })), /số nguyên không âm/);
  });

  test('không thay đổi input', () => {
    const input = mk({ mat: { nang: 2, longDinh: 1 } });
    const copy = JSON.parse(JSON.stringify(input));
    classify(input);
    assert.deepEqual(input, copy);
  });
});
