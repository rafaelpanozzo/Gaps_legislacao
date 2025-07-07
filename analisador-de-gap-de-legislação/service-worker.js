const CACHE_NAME = 'legislation-gap-analyzer-v1.3'; // Increment version for updates (Landing Page added)
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/index.js',
  '/App.js',
  '/components/LandingPage.js', // NOVO COMPONENTE
  '/components/QuestionnaireForm.js',
  '/components/HistoryView.js',
  '/constants.js',
  '/types.js',
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
    // For non-GET requests or other schemes (like chrome-extension://),
    // let the browser handle it by default.
    return;
  }

  // Strategy: Cache, falling back to network
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }

        // Not in cache, fetch from network
        return fetch(event.request).then(
          networkResponse => {
            // Check if we received a valid response
            if (!networkResponse || networkResponse.status !== 200 || 
                (networkResponse.type !== 'basic' && networkResponse.type !== 'cors')) { // 'opaque' for no-cors
              return networkResponse;
            }

            // IMPORTANT: Clone the response. A response is a stream
            // and because we want the browser to consume the response
            // as well as the cache consuming the response, we need
            // to clone it so we have two streams.
            const responseToCache = networkResponse.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                // We don't want to cache everything, e.g. API calls, but for this app, most GETs are static assets.
                // For a more complex app, you'd add more specific caching rules here.
                if (urlsToCache.includes(new URL(event.request.url).pathname) || event.request.url === self.location.origin + '/') {
                     cache.put(event.request, responseToCache);
                }
              });

            return networkResponse;
          }
        ).catch(error => {
          console.error('Fetch failed for:', event.request.url, error);
          // Optional: return a custom offline page here if appropriate
          // return caches.match('/offline.html');
        });
      })
  );
});
