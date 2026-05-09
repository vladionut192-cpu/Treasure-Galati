// Heritage Galați — Service Worker
// Strategy:
//   - Static assets (HTML, vendor, fonts, icons): cache-first cu fallback la network
//   - Data JSON: stale-while-revalidate (răspuns rapid din cache, refresh în fundal)
//   - Tile-uri OpenStreetMap/CARTO: cache-first cu TTL lung
//   - Imagini: cache-first

const CACHE_VERSION = 'tg-v13';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const DATA_CACHE = `${CACHE_VERSION}-data`;
const IMAGE_CACHE = `${CACHE_VERSION}-images`;
const TILE_CACHE = `${CACHE_VERSION}-tiles`;

// Pre-cache shell-ul aplicației la prima vizită
const PRECACHE_URLS = [
  './',
  'index.html',
  'lists.html',
  'batalia-galati-1918.html',
  'vendor/leaflet/leaflet.css',
  'vendor/leaflet/leaflet.js',
  'vendor/leaflet/leaflet.markercluster.js',
  'vendor/leaflet/MarkerCluster.css',
  'vendor/inter/inter.css',
  'vendor/inter/inter-400-latin.woff2',
  'vendor/inter/inter-400-latin-ext.woff2',
  'vendor/inter/inter-600-latin.woff2',
  'vendor/inter/inter-600-latin-ext.woff2',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS).catch(() => {/* best-effort */}))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  // Curăță cache-urile vechi (versiuni anterioare)
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter((k) => !k.startsWith(CACHE_VERSION)).map((k) => caches.delete(k))
    )).then(() => self.clients.claim())
  );
});

function isJsonRequest(req) {
  return req.url.endsWith('.json') || req.url.endsWith('.geojson');
}
function isImageRequest(req) {
  return req.destination === 'image';
}
function isTileRequest(req) {
  return /basemaps\.cartocdn\.com|tile\.openstreetmap\.org|geo-spatial\.org/.test(req.url);
}

async function staleWhileRevalidate(req, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(req);
  const networkPromise = fetch(req).then((res) => {
    if (res && res.ok) cache.put(req, res.clone());
    return res;
  }).catch(() => cached); // dacă network fail, întoarce cached
  return cached || networkPromise;
}

async function cacheFirst(req, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(req);
  if (cached) return cached;
  try {
    const res = await fetch(req);
    if (res && res.ok) cache.put(req, res.clone());
    return res;
  } catch (e) {
    // Returnează un răspuns minimal dacă nu e nimic în cache
    return new Response('Offline', { status: 503, statusText: 'Service unavailable' });
  }
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  // Tile-uri externe (cartocdn, OSM, eHarta) — cache-first lung
  if (isTileRequest(req)) {
    event.respondWith(cacheFirst(req, TILE_CACHE));
    return;
  }

  // Imagini locale — cache-first
  if (isImageRequest(req)) {
    event.respondWith(cacheFirst(req, IMAGE_CACHE));
    return;
  }

  // Date JSON — stale-while-revalidate
  if (isJsonRequest(req)) {
    event.respondWith(staleWhileRevalidate(req, DATA_CACHE));
    return;
  }

  // HTML, CSS, JS, fonturi — stale-while-revalidate (mereu cache-uite, dar updateate)
  const url = new URL(req.url);
  if (url.origin === self.location.origin) {
    event.respondWith(staleWhileRevalidate(req, STATIC_CACHE));
    return;
  }

  // Restul: lasă browserul (default network)
});
