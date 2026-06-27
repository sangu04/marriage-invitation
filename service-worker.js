const CACHE_NAME = 'wedding-invitation-v7';
const STATIC_CACHE = 'wedding-invitation-static-v7';

// URLs that should use network-first strategy (always try to get fresh version)
const NETWORK_FIRST_URLS = [
  '/index.html',
  '/memories.html',
  '/engagement.html'
];

// Static assets that should be cached
const urlsToCache = [
  '/',
  '/index.html',
  '/memories.html',
  '/engagement.html',
  '/style.css',
  '/script.js',
  '/manifest.json',
  '/sangu%20audio.mpeg'
];

// Install event - cache static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('Static cache opened');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('Service worker installed');
        return self.skipWaiting();
      })
      .catch(err => console.error('Cache install failed:', err))
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME, STATIC_CACHE];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (!cacheWhitelist.includes(cacheName)) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service worker activated');
      return self.clients.claim();
    })
  );
});

// Fetch event - implement network-first for HTML, cache-first for static assets
self.addEventListener('fetch', event => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  const url = new URL(event.request.url);
  const isHtmlPage = NETWORK_FIRST_URLS.some(page => url.pathname.endsWith(page));

  if (isHtmlPage) {
    // Network-first strategy for HTML pages - always try to get fresh version
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Check if valid response
          if (!response || response.status !== 200) {
            return response;
          }

          // Clone and cache the fresh response
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });

          return response;
        })
        .catch(() => {
          // Network failed, try cache
          return caches.match(event.request)
            .then(response => {
              if (response) {
                return response;
              }
              // Return offline page if both network and cache fail
              return new Response('Offline - Unable to load resource', {
                status: 503,
                statusText: 'Service Unavailable',
                headers: new Headers({
                  'Content-Type': 'text/plain'
                })
              });
            });
        })
    );
  } else {
    // Cache-first strategy for static assets (CSS, JS, images, fonts, audio)
    event.respondWith(
      caches.match(event.request)
        .then(response => {
          // Cache hit - return response
          if (response) {
            return response;
          }

          // Clone the request
          const fetchRequest = event.request.clone();

          return fetch(fetchRequest).then(response => {
            // Check if valid response
            if (!response || response.status !== 200) {
              return response;
            }

            // Clone the response
            const responseToCache = response.clone();

            // Cache the fetched response for future use
            caches.open(STATIC_CACHE)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return response;
          });
        })
        .catch(() => {
          // Return a custom offline response
          return new Response('Offline - Unable to load resource', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: new Headers({
              'Content-Type': 'text/plain'
            })
          });
        })
    );
  }
});
