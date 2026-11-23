const CACHE = "garaje-v1";
const FILES = ["./", "index.html", "style.css", "app.js", "manifest.json", "icon.svg"];
self.addEventListener("install", e => e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES))));
self.addEventListener("activate", e => e.waitUntil(
  caches.keys().then(k => Promise.all(k.filter(n => n !== CACHE).map(n => caches.delete(n))))));
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
});
