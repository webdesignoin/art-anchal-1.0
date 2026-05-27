const CACHE_NAME = 'art-anchal-cache-v2';

// Only cache files that actually exist in the public directory
const urlsToCache = [
  '/',
  '/index.html',
  '/site.webmanifest',
  '/logo2.png',
  '/robots.txt',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        // Cache files individually so one 404 doesn't break the entire SW install
        return Promise.allSettled(
          urlsToCache.map(url =>
            cache.add(url).catch(err => {
              console.warn(`[ServiceWorker] Failed to cache ${url}:`, err);
            })
          )
        );
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  // Clean up old cache versions
  event.waitUntil(
    caches.keys().then(cacheNames =>
      Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => {
            console.log(`[ServiceWorker] Deleting old cache: ${name}`);
            return caches.delete(name);
          })
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  // Only handle GET requests; skip API calls and Supabase
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.pathname.startsWith('/api/') || url.hostname.includes('supabase')) return;

  // Network-first strategy with cache fallback
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Cache successful responses for static assets
        if (response.ok && (url.pathname.match(/\.(png|jpg|jpeg|svg|webp|css|js|woff2?)$/) || url.pathname === '/')) {
          const clonedResponse = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clonedResponse));
        }
        return response;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});
