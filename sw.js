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

  // 画面遷移（HTML）はネット優先
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then(res => {
          // 取ってきた最新HTMLもキャッシュに入れておく（任意だけど便利）
          return caches.open(CACHE_NAME).then(cache => {
            cache.put('./index.html', res.clone());
            return res;
          });
        })
        .catch(() => {
          // オフラインのときはキャッシュのindex.htmlを返す
          return caches.match('./index.html');
        })
    );
    return;
  }

  // それ以外（画像・アイコン・manifest）はキャッシュ優先
  event.respondWith(
    caches.match(req).then(res => {
      return res || fetch(req);
    })
  );
});
