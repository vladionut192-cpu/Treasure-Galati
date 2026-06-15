// Heritage Galați — Service Worker
// Strategy:
//   - Static assets (HTML, vendor, fonts, icons): cache-first cu fallback la network
//   - Data JSON: stale-while-revalidate (răspuns rapid din cache, refresh în fundal)
//   - Tile-uri OpenStreetMap/CARTO: cache-first cu TTL lung
//   - Imagini: cache-first

// Versiunea e suprascrisă automat la deploy de CI (tg-<git sha>) — vezi
// .github/workflows/deploy.yml. Valoarea de aici contează doar pe local.
const CACHE_VERSION = 'tg-v119';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const DATA_CACHE = `${CACHE_VERSION}-data`;
const IMAGE_CACHE = `${CACHE_VERSION}-images`;
const TILE_CACHE = `${CACHE_VERSION}-tiles`;

// Pre-cache shell-ul aplicației la prima vizită
const PRECACHE_URLS = [
  './',
  'index.html',
  'lists.html',
  'maps.html',
  'batalia-galati-1918.html',
  'piata-regala-ar.html',
  'piata_regala_buildings.geojson',
  'styles/main.css',
  // Partiale CSS importate de main.css (refactor 2026-06): trebuie pre-cache-uite
  // explicit, altfel offline pagina ar fi nestilată (main.css are doar @import-uri).
  'styles/tokens.css',
  'styles/base.css',
  'styles/topbar.css',
  'styles/pages.css',
  'styles/widgets.css',
  'styles/tooltip.css',
  'styles/hunts.css',
  'styles/onboarding.css',
  'styles/polish.css',
  'styles/layer-bubbles.css',
  'styles/language-picker.css',
  // CSS + JS specifice paginii lists.html (extrase din inline la refactor 2026-06)
  'styles/lists.css',
  'js/lists.head.js',
  'js/lists.js',
  // CSS + JS specifice paginii maps.html (galeria cronologică de hărți)
  'styles/maps.css',
  'js/maps.head.js',
  'js/maps.js',
  'js/boot.js',
  'js/main.js',
  'js/i18n.js',
  'js/analytics.js',
  // Modulele ES importate de main.js (refactor 2026-06) — fără ele offline
  // pagina ar rămâne fără hartă (import-urile ar eșua).
  'js/modules/a11y.js',
  'js/modules/core-map.js',
  'js/modules/timeline.js',
  'js/modules/overlays.js',
  'js/modules/altadata.js',
  'js/modules/text-pins.js',
  'js/modules/deep-links.js',
  'js/modules/tours.js',
  'js/modules/hunts.js',
  'js/modules/chrome.js',
  'js/modules/events-page.js',
  'js/modules/admin.js',
  'timeline_events.json',
  // Indexul ușor de locații — calea critică pentru primul paint al hărții.
  // locations.json (complet) se cache-uiește la cerere prin handler-ul fetch.
  'locations-index.json',
  // PWA: manifest + iconițe (Add to Home Screen)
  'manifest.json',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/maskable-512.png',
  'icons/apple-touch-icon.png',
  'vendor/leaflet/leaflet.css',
  'vendor/leaflet/leaflet.js',
  'vendor/leaflet/leaflet.markercluster.js',
  'vendor/fuse/fuse.basic.min.js',
  'vendor/leaflet/MarkerCluster.css',
  // Fonturi self-hosted (vendor/fonts/). Precache doar fonts.css + DM Sans
  // (UI dominant, latin + latin-ext pentru diacritice); restul greutăților se
  // cache-uiesc la cerere prin handler-ul fetch (same-origin, stale-while-revalidate).
  'vendor/fonts/fonts.css',
  'vendor/fonts/dm-sans-400-latin.woff2',
  'vendor/fonts/dm-sans-400-latin-ext.woff2',
  'vendor/fonts/dm-sans-600-latin.woff2',
  'vendor/fonts/dm-sans-600-latin-ext.woff2',
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
    if (res && res.ok) {
      // cache.put can reject when quota is exceeded — don't block the response on it.
      cache.put(req, res.clone()).catch(() => {});
    }
    return res;
  }).catch(() => cached); // network fail: return cached if any
  const result = cached || (await networkPromise);
  // Both cache miss AND network fail → return a clear 503 (avoids returning undefined).
  return result || new Response('Offline', { status: 503, statusText: 'Service unavailable' });
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
