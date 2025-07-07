const CACHE_NAME = 'legislation-gap-analyzer-v2.0'; // Version bump for build system change
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  // Vite will generate hashed assets, so precaching them by name is not robust.
  // A better approach for production PWAs is using a tool like vite-plugin-pwa
  // to auto-generate the service worker with a precache manifest.
  // For simplicity, we'll cache the main static assets. The JS/CSS will be cached on first visit.
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/apple-touch-icon.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache:', CACHE_NAME);
        return cache.addAll(urlsToCache);
      })
      .catch(err => {
        console.error('Failed to cache resources during install:', err);
      })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

self.addEventListener('fetch', event => {
  // Only handle GET requests and http/https schemes
  if (event.request.method !== 'GET' || !event.request.url.startsWith('http')) {
    return;
  }

  // Strategy: Network falling back to cache.
  // This ensures users get the latest content if online, but can still use the app offline.
  event.respondWith(
    caches.open(CACHE_NAME).then(cache => {
      return fetch(event.request)
        .then(networkResponse => {
          // If the fetch is successful, update the cache with the new response
          if (networkResponse.status === 200) {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        })
        .catch(() => {
          // If the fetch fails (e.g., offline), try to get the response from the cache
          return cache.match(event.request).then(response => {
            return response || caches.match('/'); // Fallback to root if specific request not cached
          });
        });
    })
  );
});
