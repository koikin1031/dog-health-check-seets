const CACHE_NAME = 'pet-memo-cache-v1';
const OFFLINE_URLS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(OFFLINE_URLS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const req = event.request;
  // まずキャッシュ、なければネット
  event.respondWith(
    caches.match(req).then(res => {
      return (
        res ||
        fetch(req).catch(() => {
          // 失敗したときにトップページだけでも返す
          if (req.mode === 'navigate') {
            return caches.match('./index.html');
          }
        })
      );
    })
  );
});
