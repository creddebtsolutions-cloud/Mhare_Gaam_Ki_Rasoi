const CACHE_NAME = 'rasoi-cache-v1';
const STATIC_ASSETS = [
  '/',
  '/static/assets/logo.png',
  '/static/css/theme.css',
  '/static/css/customer.css',
  '/static/css/admin.css',
  '/static/css/kds.css',
  '/static/css/pos.css',
  '/static/js/api.js',
  '/static/js/customer_app.js',
  '/static/js/ai_assistant.js',
  '/static/js/main.js'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then((cached) => {
      return cached || fetch(e.request).catch(() => caches.match('/'));
    })
  );
});
