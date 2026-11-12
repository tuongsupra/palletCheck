// Service worker: precache toàn bộ file tĩnh, cache-first, chạy offline.
// Khi sửa bất kỳ file nào: TĂNG VERSION để điện thoại tải bản mới ở lần mở sau.
const VERSION = 'v1.0.0';
const CACHE = `pallet-checker-${VERSION}`;

const ASSETS = [
  './',
  './index.html',
  './css/style.css',
  './js/app.js',
  './js/classify.js',
  './js/rules.js',
  './content/texts.js',
  './assets/pallet-diagram.svg',
  './assets/gauge-card.svg',
  './assets/icons/icon.svg',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
  './assets/icons/icon-maskable-192.png',
  './assets/icons/icon-maskable-512.png',
  './assets/icons/apple-touch-icon.png',
  './manifest.webmanifest',
];

// Cài: tải toàn bộ file, bỏ qua cache HTTP để chắc chắn lấy bản mới.
// Không gọi skipWaiting(): bản mới chỉ kích hoạt ở lần mở app sau, tránh đổi code giữa chừng.
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) =>
      cache.addAll(ASSETS.map((url) => new Request(url, { cache: 'reload' })))
    )
  );
});

// Kích hoạt: xóa cache của các phiên bản cũ
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((k) => k.startsWith('pallet-checker-') && k !== CACHE).map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// Cache-first cho mọi yêu cầu GET cùng nguồn
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // Điều hướng trang (kể cả có ?query) → trả index.html từ cache
  if (req.mode === 'navigate') {
    event.respondWith(
      caches.match('./index.html').then((hit) => hit || fetch(req))
    );
    return;
  }

  event.respondWith(
    caches.match(req, { ignoreSearch: true }).then((hit) => {
      if (hit) return hit;
      return fetch(req).then((res) => {
        // Lưu thêm file tĩnh chưa có trong danh sách (nếu hợp lệ)
        if (res.ok && res.type === 'basic') {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
        }
        return res;
      });
    })
  );
});
