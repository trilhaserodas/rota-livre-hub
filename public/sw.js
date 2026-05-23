/* eslint-disable no-restricted-globals */
const CACHE_NAME = 'rota-livre-static-v2';
const MAP_CACHE_NAME = 'rota-livre-map-tiles-v2';
const DATA_CACHE_NAME = 'rota-livre-data-v2';

// Essential assets to cache on install
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/favicon.ico',
];

// Install Event
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch(err => {
        console.warn('Pre-cache warning: Some core assets could not pre-cache:', err);
      });
    })
  );
});

// Activate Event: Clear older caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    clients.claim().then(() => {
      return caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (![CACHE_NAME, MAP_CACHE_NAME, DATA_CACHE_NAME].includes(cacheName)) {
              console.log('Clearing old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      });
    })
  );
});

// Fetch Interception
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Only handle standard GET requests
  if (request.method !== 'GET') return;

  // Ignore bundler specific assets, hot reload signals, development servers, or Firestore sockets
  if (
    url.pathname.includes('/@vite/') || 
    url.pathname.includes('/node_modules/') || 
    url.href.includes('__vite_ping') ||
    url.hostname.includes('firestore.googleapis.com')
  ) {
    return;
  }

  // Define Category 1: Map Tile Servers
  const isMapTile = 
    url.hostname.includes('basemaps.cartocdn.com') || 
    url.hostname.includes('google.com') && url.pathname.includes('/vt/lyrs=') ||
    url.href.includes('/vt/lyrs=') ||
    url.hostname.includes('mt0.google.com') ||
    url.hostname.includes('mt1.google.com') ||
    url.hostname.includes('mt2.google.com') ||
    url.hostname.includes('mt3.google.com') ||
    url.hostname.includes('tile.openstreetmap.org');

  if (isMapTile) {
    event.respondWith(
      caches.open(MAP_CACHE_NAME).then((cache) => {
        return cache.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            // Instantly serve from local cache on the road
            return cachedResponse;
          }
          // Fetch, clone, and cache on-the-fly
          return fetch(request).then((networkResponse) => {
            if (networkResponse && (networkResponse.status === 200 || networkResponse.status === 0)) {
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          }).catch(() => {
            return new Response('', { status: 404, statusText: 'Offline Map Tile' });
          });
        });
      })
    );
    return;
  }

  // Define Category 2: Crucial Navigation & Geolocation API Coordinates/Weather Data
  const isDynamicAPI = 
    url.hostname.includes('router.project-osrm.org') || 
    url.hostname.includes('nominatim.openstreetmap.org') ||
    url.hostname.includes('overpass-api.de') ||
    url.hostname.includes('api.open-meteo.com') ||
    url.pathname.includes('/api/weather') ||
    url.pathname.includes('/api/google-geocode');

  if (isDynamicAPI) {
    // Strategy: Network first, Fallback to latest successfully cached data if offline
    event.respondWith(
      caches.open(DATA_CACHE_NAME).then((cache) => {
        return fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            cache.put(request, networkResponse.clone());
          }
          return networkResponse;
        }).catch(() => {
          // Serve stale but extremely useful cached coordinates/forecast data
          return cache.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // If neither works, return empty JSON
            return new Response(JSON.stringify({ offline: true, data: [] }), {
              headers: { 'Content-Type': 'application/json' }
            });
          });
        });
      })
    );
    return;
  }

  // Define Category 3: Google Fonts & Typography CDN assets
  const isGoogleFont = 
    url.hostname.includes('fonts.googleapis.com') || 
    url.hostname.includes('fonts.gstatic.com');

  if (isGoogleFont) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(request).then((cachedResponse) => {
          if (cachedResponse) return cachedResponse;
          return fetch(request).then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          });
        });
      })
    );
    return;
  }

  // Define Category 4: Generic SPA client-side route fallback to prevent reload page crashes offline
  if (request.mode === 'navigate') {
    event.respondWith(
      caches.match('/index.html').then((cachedIndex) => {
        // Fetch fresh online, fallback to index.html in cache gracefully
        return fetch(request).catch(() => {
          return cachedIndex;
        });
      })
    );
    return;
  }

  // Define Category 5: Page assets (JS, CSS, static images, SVG, JSON)
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      // Stale-While-Revalidate: deliver instantaneously, refresh silently in the background
      const fetchPromise = fetch(request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, networkResponse.clone());
          });
        }
        return networkResponse;
      }).catch(() => {
        // Fallback silently if completely offline
      });

      return cachedResponse || fetchPromise;
    })
  );
});
