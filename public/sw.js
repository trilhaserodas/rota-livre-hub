/* eslint-disable no-restricted-globals */
const CACHE_NAME = 'rota-livre-static-v1';
const MAP_CACHE_NAME = 'rota-livre-map-tiles-v1';

// Core assets to pre-cache immediately on SW installation
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/favicon.ico',
];

self.addEventListener('install', (event) => {
  // Force active state immediately
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch(err => {
        console.warn('Pre-cache warning: Some assets could not be cached immediately:', err);
      });
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    clients.claim().then(() => {
      // Clear out outdated caches
      return caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName !== MAP_CACHE_NAME) {
              console.log('Clearing old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      });
    })
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = request.url;

  // Only handle GET requests
  if (request.method !== 'GET') return;

  // Do not intercept hot reload or dev server internal files if dynamic
  if (url.includes('/@vite/') || url.includes('/node_modules/') || url.includes('__vite_ping')) {
    return;
  }

  // Do not intercept local API calls directly without fallbacks
  if (url.includes('/api/')) {
    return;
  }

  // Detect map tile requests (Carto dark base/labels or Google roadmap/satellite/hybrid)
  const isMapTile = url.includes('basemaps.cartocdn.com') || 
                     url.includes('google.com/vt/lyrs=') || 
                     url.includes('/vt/lyrs=') ||
                     url.includes('mt0.google.com') ||
                     url.includes('mt1.google.com') ||
                     url.includes('mt2.google.com') ||
                     url.includes('mt3.google.com') ||
                     url.includes('tile.openstreetmap.org');

  if (isMapTile) {
    event.respondWith(
      caches.open(MAP_CACHE_NAME).then((cache) => {
        return cache.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            // Serve instantly from map tile cache!
            return cachedResponse;
          }
          // Fetch from network and put a clone into map tile cache
          return fetch(request).then((networkResponse) => {
            if (networkResponse && (networkResponse.status === 200 || networkResponse.status === 0)) {
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          }).catch(() => {
            // Offline and tile was not pre-fetched/cached previously
            return new Response('', { status: 404, statusText: 'Offline' });
          });
        });
      })
    );
    return;
  }

  // Standard web application static assets (HTML, main script, global CSS, local images, fonts)
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      // Stale-While-Revalidate pattern: serve immediately if cached, but fetch/update in the background
      const fetchPromise = fetch(request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, networkResponse.clone());
          });
        }
        return networkResponse;
      }).catch(() => {
        // Silent catch: network is offline, browser will gracefully use the cachedResponse if available
      });

      return cachedResponse || fetchPromise;
    })
  );
});
