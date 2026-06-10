// Heritage Galați — modul: deep links (?loc / ?tour / ?hunt / ?triv / ?leg)
// + sincronizarea URL-ului la deschiderea conținutului (window.__updateDeepLink).
export function initDeepLinks(ctx) {
  const { map, locations, highlight, openDetail } = ctx;
    // ─── Deep links: ?loc=ID, ?tour=ID, ?hunt=ID ─────────────────
    // Permite link-uri shareable direct la o locație/tur/hunt specific.
    // Aplică DUPĂ ce datele sunt încărcate (chiar acum); nu deschide nimic
    // dacă ID-ul nu există.
    function applyDeepLink() {
      const params = new URLSearchParams(location.search);
      const locId = params.get('loc');
      const tourId = params.get('tour');
      const huntId = params.get('hunt');
      const trivId = params.get('triv');
      const legId = params.get('leg');

      if (locId) {
        const item = locations.find(l => l.id === locId);
        if (item) {
          // Mut harta + deschid detail panel
          map.setView([item.lat, item.lon], Math.max(map.getZoom(), 17), { animate: true });
          // Așteptăm puțin ca markerii să fie randați
          setTimeout(() => { highlight(locId, true); openDetail(locId); }, 200);
          return;
        }
      }
      if (tourId && Array.isArray(ctx.tours)) {
        const tour = ctx.tours.find(t => t.id === tourId);
        if (tour && typeof ctx.enterTour === 'function') {
          // Activăm tab-ul Tururi + deschidem turul
          const tourTabBtn = document.querySelector('.tab[data-tab="tours"]');
          if (tourTabBtn) tourTabBtn.click();
          setTimeout(() => ctx.enterTour(tour), 100);
          return;
        }
      }
      if (huntId && Array.isArray(ctx.hunts)) {
        const hunt = ctx.hunts.find(h => h.id === huntId);
        if (hunt && typeof ctx.enterHunt === 'function') {
          const huntTabBtn = document.querySelector('.tab[data-tab="hunts"]');
          if (huntTabBtn) huntTabBtn.click();
          setTimeout(() => ctx.enterHunt(hunt), 100);
          return;
        }
      }
      // Trivia / legendă deep-link — re-încercăm câteva ori până când
      // layer-ele lor sunt încărcate (au load deferred via requestIdleCallback).
      if (trivId || legId) {
        const targetKind = trivId ? 'trivia' : 'legenda';
        const targetId = trivId || legId;
        const findItem = () => {
          const arr = targetKind === 'trivia' ? ctx.triviaMarkers : ctx.legendaMarkers;
          return arr.find(x => x.item.id === targetId);
        };
        let tries = 0;
        const tick = () => {
          const hit = findItem();
          if (hit) {
            map.setView([hit.item.lat, hit.item.lon], Math.max(map.getZoom(), 17), { animate: true });
            setTimeout(() => ctx.openTextModal(targetKind, hit.item), 250);
            return;
          }
          if (++tries < 30) setTimeout(tick, 200); // max ~6s
        };
        tick();
      }
    }
    // Sync URL ↔ state când utilizatorul deschide o locație.
    // Pentru share-uri pe Facebook/WhatsApp/Twitter: ÎNLOCUIM URL-ul SPA cu pagina
    // statică corespunzătoare (`/galati_map/loc/<id>.html`) care are OG tags
    // statice. Crawlerii social NU execută JS — văd doar HTML-ul static.
    // Browserul normal: URL bar arată acea cale, dar SPA continuă să ruleze (nu
    // se face navigation reală — doar replaceState).
    function updateDeepLink(params) {
      // Folosim querystring (?loc=ID / ?tour=ID / ?hunt=ID), NU rescriem path-ul.
      // Rescrierea către `/loc/<id>.html` strica rezolvarea URL-urilor relative
      // din content-ul injectat dinamic (imagini → 404). Paginile statice SEO
      // există în /loc/, /tour/, /hunt/ și sunt servite direct crawlerilor.
      try {
        const url = new URL(location);
        params = params || {};
        // Normalizează path-ul: dacă bara e cumva la /loc|tour|hunt/X.html,
        // o aducem înapoi la directorul SPA-ului.
        url.pathname = url.pathname.replace(/\/(loc|tour|hunt)\/[^/]+\.html$/, '/');
        if (!url.pathname.endsWith('/') && /\.html$/.test(url.pathname) === false) {
          // nu modifica /galati_map/index.html etc.
        }
        const q = new URLSearchParams();
        if (params.loc) q.set('loc', params.loc);
        else if (params.tour) q.set('tour', params.tour);
        else if (params.hunt) q.set('hunt', params.hunt);
        else if (params.triv) q.set('triv', params.triv);
        else if (params.leg) q.set('leg', params.leg);
        url.search = q.toString() ? `?${q.toString()}` : '';
        history.replaceState(null, '', url);
      } catch (e) { /* ignore */ }
    }
    // Expose for use after openDetail / enterTour / enterHunt
    window.__updateDeepLink = updateDeepLink;
    // Apply on load (after data is ready)
    setTimeout(applyDeepLink, 300);

}
