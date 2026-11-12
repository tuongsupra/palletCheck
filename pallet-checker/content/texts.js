// Toàn bộ chuỗi tiếng Việt của giao diện. Không chứa logic.

export const TEXTS = {
  appName: 'Pallet Checker',
  appSubtitle: 'Phân loại pallet Vinalog',

  // Câu hỏi nhanh mối mọt
  moiMot: {
    question: 'Pallet có mối mọt / nhiễm bẩn / mục không?',
    hint: 'Mục, mọt, nhiễm dầu/hóa chất không làm sạch được → TH4 ngay.',
    yes: 'Có',
    no: 'Không',
  },

  // Tên nhóm cấu kiện
  groups: {
    mat:  { name: 'Thanh mặt', unit: 'thanh', desc: 'Các thanh nằm trên cùng, nơi đặt hàng.' },
    ganh: { name: 'Gánh (thanh ngang)', unit: 'thanh', desc: 'Thanh ngang nằm ngay dưới thanh mặt, nối các cục gù.' },
    gu:   { name: 'Cục gù', unit: 'cục', desc: 'Các khối kê ở giữa, chỗ xe nâng luồn càng.' },
    day:  { name: 'Thanh đáy', unit: 'thanh', desc: 'Các thanh nằm dưới cùng, tiếp xúc mặt sàn.' },
  },

  // Tên các bộ đếm
  counters: {
    vua: 'Mất mảng gỗ',
    nang: 'Gãy / mất cả thanh',
    longDinh: 'Bung đinh (còn nguyên)',
  },

  // Gợi ý ngắn gọn ngay trên dòng đếm
  shortHints: {
    mat: {
      vua: 'Sâu ≥ 25mm hoặc dài ≥ 300mm',
      nang: 'Gãy, vỡ, nứt, mất cả thanh',
      longDinh: 'Bung đinh, gỗ còn nguyên',
    },
    ganh: {
      vua: 'Sâu ≥ 25mm hoặc dài ≥ 300mm',
      nang: 'Gãy, nứt, mất chịu lực',
      longDinh: 'Tách rời, gỗ còn nguyên',
    },
    gu: {
      vua: 'Sâu ≥ 20mm hoặc rộng ≥ 1/3',
      nang: 'Vỡ, nứt, tách đôi, mất cả gù',
    },
    day: {
      vua: 'Sâu ≥ 25mm hoặc dài ≥ 300mm',
      nang: 'Gãy, vỡ, nứt, mất cả thanh',
      longDinh: 'Bung đinh, gỗ còn nguyên',
    },
  },

  // Ngưỡng phân loại phục vụ giải thích nguyên nhân
  thresholds: {
    mat:  { th2: '1–3 thanh', th3: '4–5 thanh', th4: '≥ 6 thanh' },
    ganh: { th3: '1 thanh', th4: '≥ 2 thanh' },
    gu:   { th2: '1 cục', th3: '2–3 cục', th4: '≥ 4 cục' },
    day:  { th2: '1–3 thanh', th3: '4 thanh', th4: '5 thanh' },
  },

  // Dòng gợi ý dưới từng bộ đếm, theo nhóm
  hints: {
    mat: {
      vua: 'Vết mất mảng sâu từ 25mm trở lên HOẶC dài từ 300mm trở lên.',
      nang: 'Gãy, vỡ, nứt, mất cả thanh.',
      longDinh: 'Thanh bung đinh, bật lên nhưng gỗ còn nguyên, chưa gãy/nứt.',
    },
    ganh: {
      vua: 'Vết mất mảng sâu từ 25mm trở lên HOẶC dài từ 300mm trở lên.',
      nang: 'Gánh gãy, nứt, vỡ, mất — mất chịu lực.',
      longDinh: 'Gánh tách rời khỏi gù/thanh mặt nhưng còn nguyên, chưa gãy/nứt.',
    },
    gu: {
      vua: 'Vết mất mảng sâu từ 20mm trở lên HOẶC rộng từ 1/3 mặt gù trở lên.',
      nang: 'Gù vỡ, nứt, tách đôi, hoặc mất cả cục gù.',
    },
    day: {
      vua: 'Vết mất mảng sâu từ 25mm trở lên HOẶC dài từ 300mm trở lên.',
      nang: 'Gãy, vỡ, nứt, mất cả thanh.',
      longDinh: 'Thanh bung đinh, bật ra nhưng gỗ còn nguyên, chưa gãy/nứt.',
    },
  },

  // Mô tả đầy đủ các mức (dùng trong màn hình "?")
  levels: {
    nhe: {
      name: 'Mẻ nhỏ (không cần nhập)',
      text: 'Dưới 25mm và dưới 300mm (gù: dưới 20mm và dưới 1/3). Vẫn tính là TH1.',
    },
    vua: {
      name: 'Mất mảng gỗ',
      text: 'Sâu từ 25mm hoặc dài từ 300mm (gù: sâu từ 20mm hoặc rộng từ 1/3). Tối thiểu TH2.',
    },
    nang: {
      name: 'Gãy / mất cả thanh',
      text: 'Gãy, vỡ, nứt, hoặc mất cả thanh/cả cục gù. Đây là loại phải thay thế.',
    },
    longDinh: {
      name: 'Bung đinh (còn nguyên)',
      text: 'Thanh mặt, gánh, đáy bị bung đinh hoặc tách rời nhưng gỗ còn nguyên. Đóng lại đinh rồi kiểm lại. Thanh nào không đóng lại được (nứt chỗ đinh, tách vỡ) thì nhập vào Gãy / mất cả thanh.',
    },
  },

  // Ý nghĩa và hành động TH1–TH4
  results: {
    1: { meaning: 'Sẵn sàng sử dụng', action: 'Dùng bình thường, kể cả xếp hàng hóa.' },
    2: { meaning: 'Không nên dùng, nên sửa để tránh hỏng thêm', action: 'Không dùng xếp hàng hóa. Tách riêng, đưa đi sửa.' },
    3: { meaning: 'Cần phải sửa chữa', action: 'Không dùng xếp hàng hóa. Tách riêng, bắt buộc sửa chữa.' },
    4: { meaning: 'Hỏng, sửa không hiệu quả', action: 'Loại bỏ. Không sửa, không dùng.' },
  },

  // Trạng thái chưa chốt (có bung đinh)
  recheck: {
    title: 'Đóng lại đinh rồi kiểm lại',
    provisional: 'Tạm tính',
    action: 'Đóng lại đinh các thanh bị bung/tách, rồi kiểm tra lại.',
    listTitle: 'Cần đóng lại:',
    button: 'Đã đóng lại — kiểm tra lại',
    reminder: 'Thanh nào đóng lại không được thì nhập vào Gãy / mất cả thanh.',
  },

  // Các nhãn giao diện khác
  ui: {
    total: 'Tổng',
    details: 'Xem chi tiết',
    reasonsTitle: 'Lý do',
    actionTitle: 'Hành động',
    noReasons: 'Không có cấu kiện mất mảng gỗ hoặc gãy/mất cả thanh.',
    totalDamaged: 'Tổng cấu kiện hỏng (mất mảng gỗ + gãy/mất)',
    newPallet: 'Kiểm tra pallet mới',
    confirmReset: 'Xóa dữ liệu đang nhập và kiểm pallet mới?',
    close: 'Đóng',
    help: 'Hướng dẫn',
    increase: 'Tăng',
    decrease: 'Giảm',
    full: 'Đã đủ số lượng của nhóm',
    resetDone: 'Đã đặt lại. Bắt đầu kiểm pallet mới.',
    offlineReady: 'Đã sẵn sàng dùng offline.',
  },

  // Nội dung màn hình "?"
  help: {
    title: 'Hướng dẫn sử dụng',
    stepsTitle: 'Các bước kiểm một pallet',
    steps: [
      'Đếm từng nhóm cấu kiện (mặt, gánh, gù, đáy): bấm + cho mỗi thanh/cục bị Mất mảng gỗ, Gãy / mất cả thanh hoặc Bung đinh.',
      'Mẻ nhỏ (dưới 25mm và dưới 300mm) không cần nhập.',
      'Mỗi cấu kiện chỉ nhập vào MỘT mục, chọn mục nặng nhất.',
      'Kết quả hiện ngay ở thanh dưới cùng. Bấm "Xem chi tiết" để xem lý do.',
      'Nếu báo CHƯA CHỐT: đóng lại đinh, bấm "Đã đóng lại — kiểm tra lại", rồi nhập thanh nào không đóng được vào Gãy / mất cả thanh.',
      'Xong một pallet, bấm "Kiểm tra pallet mới".',
    ],
    diagramTitle: 'Sơ đồ pallet (26 cấu kiện)',
    diagramAlt: 'Sơ đồ pallet: 9 thanh mặt (xanh dương), 3 gánh (đỏ), 9 cục gù (xanh đậm), 5 thanh đáy (xanh lá).',
    levelsTitle: 'Các mức tình trạng',
    rulesTitle: 'Quy tắc phân loại',
    rules: [
      'Thanh mặt gãy / mất: 1–3 → TH2, 4–5 → TH3, từ 6 → TH4.',
      'Gánh: mất mảng gỗ → TH2, 1 thanh gãy/mất → TH3, từ 2 → TH4.',
      'Cục gù gãy / mất: 1 → TH2, 2–3 → TH3, từ 4 → TH4.',
      'Thanh đáy gãy / mất: 1–3 → TH2, 4 → TH3, 5 → TH4.',
      'Có bất kỳ cấu kiện nào mất mảng gỗ → tối thiểu TH2.',
      'Tổng mất mảng gỗ + gãy/mất từ 7 trở lên → TH4.',
      'Mối mọt / nhiễm bẩn / mục → TH4.',
    ],
    gaugeTitle: 'Cách dùng thước mẫu',
    gauge: [
      'In file thước mẫu trên giấy A4, chọn "Kích thước thật / 100%", không chọn "Vừa trang".',
      'Kiểm tra vạch 100mm bằng thước thật trước khi dùng.',
      'Đặt thước vào vết mẻ/khuyết: sâu từ 25mm (gù: 20mm) trở lên HOẶC dài từ 300mm trở lên là Mất mảng gỗ.',
    ],
    gaugeLink: 'Mở thước mẫu để in',
    privacy: 'App không lưu và không gửi dữ liệu đi đâu. Tải lại trang là bắt đầu lại.',
  },
};
