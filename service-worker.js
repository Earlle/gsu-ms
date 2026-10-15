// Minimal service worker: lets Chrome treat this wrapper as an installable app.
// The GSU-MS app itself is always loaded live from Google Apps Script (never cached here).
const CACHE = "gsu-ms-shell-v1";
const SHELL = ["./", "./index.html", "./manifest.json", "./icons/icon-192.png", "./icons/icon-512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET" || new URL(req.url).origin !== self.location.origin) return;
  // Network first so wrapper updates apply immediately; cached shell only as an offline fallback.
  event.respondWith(fetch(req).catch(() => caches.match(req).then((r) => r || caches.match("./index.html"))));
});
