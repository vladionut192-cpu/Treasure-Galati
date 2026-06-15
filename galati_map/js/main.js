// Heritage Galați — entry point (module ES).
// Refactor 2026-06-10: monolitul de ~4.600 de linii a fost spart în module
// tematice sub js/modules/. Acest fișier doar încarcă datele, construiește
// contextul partajat (ctx) și inițializează modulele ÎN ORDINEA în care
// secțiunile rulau în vechiul IIFE — ordinea contează (core publică render()
// înainte ca timeline să-l folosească etc.).
//
// CUPRINS (un modul = o secțiune din vechiul main.js):
//   • core-map.js     — hartă + markere + render + detail + lightbox + filtre + căutare
//   • timeline.js     — cronologia + overlay an + lupa touch + evenimente (timeline_events.json)
//   • overlays.js     — hărți istorice WMS, fortificații, granița administrativă, bule desktop
//   • altadata.js     — „Galați de altădată" (fotografii istorice geolocate)
//   • text-pins.js    — „Știați că?" + Legende + modal text
//   • deep-links.js   — ?loc / ?tour / ?hunt / ?triv / ?leg
//   • tours.js        — tab-uri + tururi tematice
//   • hunts.js        — treasure hunts + verificare locație
//   • chrome.js       — navigare pagini, sidebar, burger, bottom sheets
//   • events-page.js  — pagina Povești + comic reader 1918
//   • admin.js        — unelte add-pin / add-photo (doar local-dev)
//
// Contractul ctx: modulele primesc obiectul partajat și (1) citesc serviciile
// publicate de modulele dinaintea lor prin destructurare, (2) folosesc
// `ctx.fn?.()` pentru serviciile publicate de module ulterioare (late-bound),
// (3) țin starea partajată (activeId, activeTour, timelineYear, ...) DOAR pe
// ctx — niciodată în variabile locale duplicate.

import { initCoreMap } from './modules/core-map.js';
import { initTimeline } from './modules/timeline.js';
import { initOverlays } from './modules/overlays.js';
import { initAltadata } from './modules/altadata.js';
import { initTextPins } from './modules/text-pins.js';
import { initDeepLinks } from './modules/deep-links.js';
import { initTours } from './modules/tours.js';
import { initHunts } from './modules/hunts.js';
import { initChrome } from './modules/chrome.js';
import { initEventsPage } from './modules/events-page.js';
import { initAdminTools } from './modules/admin.js';

(async () => {
  const fetchJson = (url) => fetch(url, { cache: 'default' }).then(r => {
    if (!r.ok) throw new Error(`Failed to load ${url}: ${r.status}`);
    return r.json();
  });
  let locations, cartiere, toursData, toursRoutes, huntsData, timelineEvents;
  // Încărcăm întâi indexul UȘOR (~400 KB: tot, fără descrierile lungi +
  // galerii). Harta/lista/căutarea/timeline se randează imediat; datele
  // complete vin în fundal (vezi ensureFullData mai jos). Fallback la
  // locations.json complet dacă indexul lipsește (ex. server static fără build).
  let loadedFullData = false;
  const locationsPromise = fetchJson('locations-index.json').catch(() => {
    loadedFullData = true;
    return fetchJson('locations.json');
  });
  try {
    [locations, cartiere, toursData, toursRoutes, huntsData, timelineEvents] = await Promise.all([
      locationsPromise,
      fetchJson('cartiere.geojson'),
      fetchJson('tours.json'),
      fetchJson('tours_routes.json').catch(() => ({ tours: {} })), // optional
      fetchJson('treasure_hunts.json').catch(() => ({ hunts: [] })), // optional
      // Evenimentele cronologiei — fără ele rigla rămâne fără gradații, dar
      // restul aplicației funcționează.
      fetchJson('timeline_events.json').catch(() => ({ events: [], track_years: [], major_years: [] })),
    ]);
  } catch (err) {
    console.error('Eroare la încărcare date:', err);
    document.body.insertAdjacentHTML('afterbegin',
      `<div style="position:fixed;inset:0;display:grid;place-items:center;background:#efeeea;font-family:system-ui;padding:24px;text-align:center;z-index:9999">
         <div><h2 style="margin:0 0 8px">Eroare la încărcare</h2>
         <p style="color:#6b6358;margin:0 0 12px">Nu am putut încărca datele hărții.</p>
         <p style="font-size:12px;color:#8a8780"><code>${err.message}</code></p></div></div>`);
    return;
  }

  // ── Contextul partajat între module ──
  const ctx = {
    // date încărcate
    locations, cartiere, toursData, toursRoutes, huntsData, timelineEvents,
    // stare partajată (un singur loc de adevăr; modulele NU o duplică local)
    activeId: null,        // locația selectată (highlight + detail)
    activeTour: null,      // turul activ (filtrează render-ul)
    activeHunt: null,      // aventura activă
    activePhoto: null,     // fotografia „de altădată" din lightbox (pt. edit)
    timelineYear: null,    // null = fără filtru de an; altfel anul din slider
    // cozile lightbox-ului (galerie detaliu vs. fotografii de altădată)
    lightboxQueue: [], lightboxIndex: 0, lightboxAnchor: null,
    lightboxGalleryItems: [], lightboxGalleryIdx: 0,
    // markerii colecțiilor secundare (populate de modulele lor)
    pubcrawlMarkers: [], pubcrawlLayer: null,
    triviaMarkers: [], legendaMarkers: [],
  };

  // ── Încărcare lazy a datelor complete (descrieri + galerii) ──
  // Indexul are deja toate metadatele ușoare; aici aducem câmpurile grele și
  // le îmbinăm IN-PLACE în `ctx.locations` (păstrăm referința array-ului, ca
  // modulele care o țin să vadă datele îmbogățite). Apoi reconstruim indexul
  // Fuse (ca să caute și în descrieri) și re-randăm detaliul deschis.
  const HEAVY_FIELDS = ['description', 'description_en', 'gallery',
    'image_then', 'image_now', 'image_then_year', 'image_now_year'];
  ctx.fullDataLoaded = loadedFullData;
  let fullDataPromise = loadedFullData ? Promise.resolve() : null;
  ctx.ensureFullData = function () {
    if (fullDataPromise) return fullDataPromise;
    fullDataPromise = fetchJson('locations.json').then((full) => {
      const byId = new Map(full.map((l) => [l.id, l]));
      for (const loc of ctx.locations) {
        const f = byId.get(loc.id);
        if (!f) continue;
        for (const k of HEAVY_FIELDS) if (k in f) loc[k] = f[k];
      }
      ctx.fullDataLoaded = true;
      if (typeof ctx.rebuildFuseIndex === 'function') ctx.rebuildFuseIndex();
      if (typeof window.__rerenderActiveDetail === 'function') window.__rerenderActiveDetail();
    }).catch((err) => {
      console.warn('Nu am putut încărca datele complete:', err);
      fullDataPromise = null; // permite reîncercarea (ex. la deschiderea unui detaliu)
    });
    return fullDataPromise;
  };

  initCoreMap(ctx);
  initTimeline(ctx);
  initOverlays(ctx);
  initAltadata(ctx);
  initTextPins(ctx);
  initDeepLinks(ctx);
  initTours(ctx);
  initHunts(ctx);

  // Prima randare — după tururi + hunts, exact ca în vechiul IIFE (render
  // citește ctx.activeTour și are nevoie de toate filtrele inițializate).
  ctx.render();

  initChrome(ctx);
  initEventsPage(ctx);
  initAdminTools(ctx);

  // După primul paint, aducem datele complete în fundal (idle), ca să fie gata
  // căutarea în descrieri + deschiderea instantă a detaliilor. Deschiderea unui
  // detaliu sau o căutare declanșează oricum ensureFullData() mai devreme.
  if (!ctx.fullDataLoaded) {
    const idle = window.requestIdleCallback || ((fn) => setTimeout(fn, 1200));
    idle(() => ctx.ensureFullData(), { timeout: 3000 });
  }
})();
