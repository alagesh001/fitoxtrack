const CACHE_NAME = 'tennisx-cache-v4.5';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/fc-icon-192x192.png',
  '/fc-icon-512x512.png'
];

// Install service worker and cache required files

self.addEventListener('install', event => {
  self.skipWaiting(); // Force activate on install
});
// Activate and clean old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(key => caches.delete(key)))
    ).then(() => self.clients.claim())
  );
});

// Fetch and serve from cache first
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    }).catch(err => {
      console.error('[Service Worker] Fetch failed:', err);
    })
  );
});

