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
    vua: 'Sứt lớn',
    nang: 'Hỏng nặng',
    longDinh: 'Bung đinh / tách rời (còn nguyên)',
  },

  // Dòng gợi ý dưới từng bộ đếm, theo nhóm
  hints: {
    mat: {
      vua: 'Vết sứt sâu từ 25mm trở lên HOẶC dài từ 300mm trở lên.',
      nang: 'Gãy, vỡ, nứt, mất thanh.',
      longDinh: 'Thanh bung đinh, bật lên nhưng gỗ còn nguyên, chưa gãy/nứt.',
    },
    ganh: {
      vua: 'Vết sứt sâu từ 25mm trở lên HOẶC dài từ 300mm trở lên.',
      nang: 'Gánh gãy, nứt, vỡ, mất — mất chịu lực.',
      longDinh: 'Gánh tách rời khỏi gù/thanh mặt nhưng còn nguyên, chưa gãy/nứt.',
    },
    gu: {
      vua: 'Vết sứt sâu từ 20mm trở lên HOẶC rộng từ 1/3 mặt gù trở lên.',
      nang: 'Gù vỡ, nứt, tách đôi, mất.',
    },
    day: {
      vua: 'Vết sứt sâu từ 25mm trở lên HOẶC dài từ 300mm trở lên.',
      nang: 'Gãy, vỡ, nứt, mất thanh.',
      longDinh: 'Thanh bung đinh, bật ra nhưng gỗ còn nguyên, chưa gãy/nứt.',
    },
  },

  // Mô tả đầy đủ các mức (dùng trong màn hình "?")
  levels: {
    nhe: {
      name: 'Nhẹ (không cần nhập)',
      text: 'Sứt nhỏ: thanh mặt/gánh/đáy sâu dưới 25mm VÀ dài dưới 300mm; cục gù sâu dưới 20mm VÀ rộng dưới 1/3 mặt gù; hư đầu thanh nhưng không bung đinh. Vẫn tính là TH1.',
    },
    vua: {
      name: 'Sứt lớn',
      text: 'Thanh mặt/gánh/đáy: sâu từ 25mm trở lên HOẶC dài từ 300mm trở lên. Cục gù: sâu từ 20mm trở lên HOẶC rộng từ 1/3 mặt gù trở lên. Chỉ cần vượt MỘT trong hai là sứt lớn. Pallet tối thiểu TH2.',
    },
    nang: {
      name: 'Hỏng nặng',
      text: 'Gãy, vỡ, nứt, mất cấu kiện; cục gù tách đôi. Đây là loại phải thay thế.',
    },
    longDinh: {
      name: 'Bung đinh / tách rời (còn nguyên)',
      text: 'Thanh mặt, gánh, đáy bị bung đinh hoặc tách rời nhưng gỗ còn nguyên. Chưa tính loại: đóng lại đinh rồi kiểm lại. Thanh nào không đóng lại được (nứt chỗ đinh, tách vỡ) thì nhập vào Hỏng nặng.',
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
    title: 'CHƯA CHỐT — đóng lại đinh rồi kiểm lại',
    provisional: 'Tạm tính',
    action: 'Đóng lại đinh các thanh bị bung/tách, rồi kiểm tra lại.',
    listTitle: 'Cần đóng lại:',
    button: 'Đã đóng lại — kiểm tra lại',
    reminder: 'Thanh nào đóng lại không được thì nhập vào Hỏng nặng.',
  },

  // Các nhãn giao diện khác
  ui: {
    total: 'Tổng',
    details: 'Xem chi tiết',
    reasonsTitle: 'Lý do',
    actionTitle: 'Hành động',
    noReasons: 'Không có cấu kiện sứt lớn hoặc hỏng nặng.',
    totalDamaged: 'Tổng cấu kiện hỏng (sứt lớn + hỏng nặng)',
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
      'Đếm từng nhóm cấu kiện (mặt, gánh, gù, đáy): bấm + cho mỗi thanh/cục bị Sứt lớn, Hỏng nặng hoặc Bung đinh.',
      'Sứt nhỏ (nhẹ) không cần nhập.',
      'Mỗi cấu kiện chỉ nhập vào MỘT mục, chọn mục nặng nhất.',
      'Kết quả hiện ngay ở thanh dưới cùng. Bấm "Xem chi tiết" để xem lý do.',
      'Nếu báo CHƯA CHỐT: đóng lại đinh, bấm "Đã đóng lại — kiểm tra lại", rồi nhập thanh nào không đóng được vào Hỏng nặng.',
      'Xong một pallet, bấm "Kiểm tra pallet mới".',
    ],
    diagramTitle: 'Sơ đồ pallet (26 cấu kiện)',
    diagramAlt: 'Sơ đồ pallet: 9 thanh mặt (xanh dương), 3 gánh (đỏ), 9 cục gù (xanh đậm), 5 thanh đáy (xanh lá).',
    levelsTitle: 'Các mức tình trạng',
    rulesTitle: 'Quy tắc phân loại',
    rules: [
      'Thanh mặt hỏng nặng: 1–3 → TH2, 4–5 → TH3, từ 6 → TH4.',
      'Gánh: sứt lớn → TH2, 1 hỏng nặng → TH3, từ 2 → TH4.',
      'Cục gù hỏng nặng: 1 → TH2, 2–3 → TH3, từ 4 → TH4.',
      'Thanh đáy hỏng nặng: 1–3 → TH2, 4 → TH3, 5 → TH4.',
      'Có bất kỳ sứt lớn nào → tối thiểu TH2.',
      'Tổng sứt lớn + hỏng nặng từ 7 trở lên → TH4.',
      'Mối mọt / nhiễm bẩn / mục → TH4.',
    ],
    gaugeTitle: 'Cách dùng thước mẫu',
    gauge: [
      'In file thước mẫu trên giấy A4, chọn "Kích thước thật / 100%", không chọn "Vừa trang".',
      'Kiểm tra vạch 100mm bằng thước thật trước khi dùng.',
      'Đặt thước vào vết sứt: sâu từ 25mm (gù: 20mm) trở lên HOẶC dài từ 300mm trở lên là Sứt lớn.',
    ],
    gaugeLink: 'Mở thước mẫu để in',
    privacy: 'App không lưu và không gửi dữ liệu đi đâu. Tải lại trang là bắt đầu lại.',
  },
};
