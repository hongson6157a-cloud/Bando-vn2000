/* Service worker: lưu sẵn app để dùng khi không có mạng.
   Khi sửa index.html, hãy đổi số phiên bản CACHE (v1 -> v2) để máy người dùng tải bản mới. */
const CACHE = "vn2000-v7";
const FILES = ["./", "./index.html", "./manifest.webmanifest",
  "./icons/icon-192.png", "./icons/icon-512.png", "./icons/maskable-512.png",
  "./icons/apple-touch-icon.png", "./icons/favicon.png",
  "./lib/leaflet.js", "./lib/leaflet.css"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
// Dùng bản đã lưu ngay (nhanh, chạy offline), đồng thời tải bản mới ở nền cho lần mở sau.
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;
  e.respondWith(caches.open(CACHE).then(async cache => {
    const hit = await cache.match(req, { ignoreSearch: true });
    const net = fetch(req).then(res => { if (res && res.ok) cache.put(req, res.clone()); return res; }).catch(() => null);
    return hit || (await net) || (await cache.match("./index.html"));
  }));
});
