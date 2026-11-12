// Ngưỡng phân loại theo số cấu kiện HỎNG NẶNG của từng nhóm (mục 2, 3 của kế hoạch).
// th2/th3/th4: số hỏng nặng tối thiểu để vào mức tương ứng.
// canRenail: nhóm có mục "bung đinh / tách rời còn nguyên".
export const RULES = {
  mat:  { label: 'Thanh mặt', total: 9, th2: 1, th3: 4, th4: 6, canRenail: true  },
  ganh: { label: 'Gánh',      total: 3, th2: 1, th3: 1, th4: 2, canRenail: true  },
  gu:   { label: 'Cục gù',    total: 9, th2: 1, th3: 2, th4: 4, canRenail: false },
  day:  { label: 'Thanh đáy', total: 5, th2: 1, th3: 4, th4: 5, canRenail: true  },
};

// Tổng cấu kiện hỏng (sứt lớn + hỏng nặng) từ mức này trở lên → TH4 (25% của 26 thanh).
export const TOTAL_TH4 = 7;
