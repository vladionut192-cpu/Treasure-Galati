// Heritage Galați — modul: UI chrome — comutarea paginilor (hash routing),
// colaps sidebar (desktop), meniul burger (mobil), portalurile sidebar↔bottom
// sheets, pin-link-urile din articole și guard-ul de overflow.
export function initChrome(ctx) {
  const { map, locations, openDetail, highlight } = ctx;
    // ─── Runtime overflow guard ──────────────────────────────────
    // Detect if anything ever causes horizontal scroll on the document
    // and log the offenders to console (open DevTools to see).
    function checkOverflow() {
      const sw = document.documentElement.scrollWidth;
      const cw = document.documentElement.clientWidth;
      if (sw <= cw) return;
      console.warn(`[overflow guard] body extinde ${sw}px peste ${cw}px viewport — căutare elemente vinovate:`);
      const ww = window.innerWidth;
      let count = 0;
      document.querySelectorAll('*').forEach(el => {
        if (count >= 8) return;
        const r = el.getBoundingClientRect();
        if (r.right > ww + 1 && r.width > 0 && r.height > 0) {
          console.warn('  →', el.tagName, el.className, `w=${Math.round(r.width)} x=${Math.round(r.left)}–${Math.round(r.right)}`, el);
          count++;
        }
      });
    }
    window.addEventListener('load', () => setTimeout(checkOverflow, 1500));
    window.addEventListener('resize', () => setTimeout(checkOverflow, 200));

    // ─── Top nav: page switching ─────────────────────────────────
    // ATENȚIE: filtrăm pe `[data-page]` ca să excludem butoanele din lang-picker
    // (sunt în același <nav> și le-am prinde fără data-page → activatePage(undefined)
    // ar șterge clasa `map-mode` de pe body și harta ar dispărea la switch RO/EN).
    const navBtns = document.querySelectorAll('.topbar nav button[data-page]');
    const pages = document.querySelectorAll('.page');
    function refreshMapLayout() {
      if (typeof map !== 'undefined' && map) {
        [0, 80, 240, 600].forEach(delay => {
          setTimeout(() => {
            map.invalidateSize({ pan: false });
            map.setView(map.getCenter(), map.getZoom(), { animate: false });
          }, delay);
        });
      }
    }
    function resetDocumentScroll() {
      window.scrollTo({ left: 0, top: 0, behavior: 'instant' });
      document.documentElement.scrollLeft = 0;
      document.body.scrollLeft = 0;
      refreshMapLayout();
    }
    function activatePage(pageId) {
      document.documentElement.classList.toggle('map-mode', pageId === 'map');
      document.body.classList.toggle('map-mode', pageId === 'map');
      navBtns.forEach(b => b.classList.toggle('active', b.dataset.page === pageId));
      pages.forEach(p => p.classList.toggle('active', p.id === `page-${pageId}`));
      // Resize map after switching to it (Leaflet needs invalidateSize after hidden)
      if (pageId === 'map' && map) {
        refreshMapLayout();
      }
      // Update hash (no scroll)
      if (history.replaceState) history.replaceState(null, '', '#' + pageId);
      resetDocumentScroll();
    }

    navBtns.forEach(btn => btn.addEventListener('click', () => activatePage(btn.dataset.page)));

    // ─── Skip link ────────────────────────────────────────────────────────
    // Mută focusul în lista de locații, nu în hartă: containerul Leaflet e
    // urmat de 349 de markere focalizabile, deci un utilizator de tastatură
    // care ajunge acolo trebuie să le parcurgă pe toate ca să iasă.
    // preventDefault fiindcă navigarea la fragment ar schimba hash-ul, iar
    // `initialHash` de mai jos îl citește la pornire: un `#list` rămas în URL
    // ar cere pagina „list", care nu există, și ar lăsa ecranul gol la reload.
    (function () {
      const skip = document.querySelector('.skip-link');
      const list = document.getElementById('list');
      if (!skip || !list) return;
      skip.addEventListener('click', (e) => {
        e.preventDefault();
        list.focus();
        list.scrollIntoView({ block: 'nearest' });
      });
    })();

    // ─── Colaps sidebar (desktop) — săgeată pe marginea hărții ────
    // Strânge coloana sidebar-ului la 0 ca harta să fie mai mare. Starea se
    // reține în localStorage. După tranziție, invalidateSize ca Leaflet să
    // re-randeze tile-urile pe noua lățime.
    (function () {
      const toggle = document.getElementById('sidebar-toggle');
      const appEl = document.querySelector('.app');
      if (!toggle || !appEl) return;
      const KEY = 'tg.sidebar.collapsed';
      function refreshMapSize() {
        [0, 90, 260, 440].forEach(d => setTimeout(() => {
          try { map.invalidateSize({ pan: false }); } catch (e) {}
        }, d));
      }
      function setCollapsed(on, persist) {
        appEl.classList.toggle('sidebar-collapsed', on);
        toggle.setAttribute('aria-expanded', on ? 'false' : 'true');
        const lbl = on ? 'Arată panoul' : 'Ascunde panoul';
        toggle.setAttribute('aria-label', lbl);
        toggle.title = lbl;
        if (persist) { try { localStorage.setItem(KEY, on ? '1' : '0'); } catch (e) {} }
        refreshMapSize();
      }
      toggle.addEventListener('click', () => {
        setCollapsed(!appEl.classList.contains('sidebar-collapsed'), true);
      });
      // Restaurează starea salvată (fără re-persist).
      try { if (localStorage.getItem(KEY) === '1') setCollapsed(true, false); } catch (e) {}
    })();

    // ─── Mobile topbar: hamburger menu ──────────────────────────
    const burgerBtn = document.getElementById('topbar-burger');
    const topbarNav = document.getElementById('topbar-nav');
    function closeBurger() {
      topbarNav.classList.remove('open');
      burgerBtn?.setAttribute('aria-expanded', 'false');
    }
    burgerBtn?.addEventListener('click', () => {
      const open = topbarNav.classList.toggle('open');
      burgerBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    // Click pe orice item din nav închide meniul (atât pe button cât și pe link)
    topbarNav?.addEventListener('click', (e) => {
      if (e.target.closest('button, a')) closeBurger();
    });
    // Click în afară închide meniul
    document.addEventListener('click', (e) => {
      if (!topbarNav?.classList.contains('open')) return;
      if (e.target.closest('.topbar')) return;
      closeBurger();
    });
    // ESC închide meniul
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && topbarNav?.classList.contains('open')) closeBurger();
    });

    // ─── Mobile: portal pentru sidebar controls ↔ bottom sheets ──
    // Mutăm același nod DOM între sidebar (desktop) și sheet-ul flotant
    // (mobil) ca să nu duplicăm event listeners sau state-ul controalelor.
    const mqMobile = window.matchMedia('(max-width: 720px)');
    const layersBackdrop = document.getElementById('layers-sheet-backdrop');

    // Configurarea portal-urilor: nod sursă, slot mobil, ancoră de re-inserare
    const portals = [
      {
        node:    document.getElementById('layer-controls'),
        slot:    document.getElementById('mobile-layers-slot'),
        anchor:  document.getElementById('count'),
      },
      {
        node:    document.getElementById('panel-tours'),
        slot:    document.getElementById('mobile-tours-slot'),
        anchor:  null, // appendChild la sidebarParent
      },
      {
        node:    document.getElementById('panel-hunts'),
        slot:    document.getElementById('mobile-hunts-slot'),
        anchor:  null,
      },
    ].map(p => ({ ...p, sidebarParent: p.node?.parentElement }));

    function applyPortals() {
      portals.forEach(p => {
        if (!p.node || !p.slot || !p.sidebarParent) return;
        const inMobile = p.node.parentElement === p.slot;
        if (mqMobile.matches && !inMobile) {
          p.slot.appendChild(p.node);
        } else if (!mqMobile.matches && inMobile) {
          if (p.anchor && p.anchor.parentElement === p.sidebarParent) {
            p.sidebarParent.insertBefore(p.node, p.anchor);
          } else {
            p.sidebarParent.appendChild(p.node);
          }
        }
      });
    }
    applyPortals();
    mqMobile.addEventListener('change', applyPortals);

    // Bottom sheet generic — un singur backdrop, mai multe sheet-uri.
    // Doar un sheet poate fi deschis simultan. `onOpen` e o lazy hook care
    // re-randă conținutul (ex: tour cards) la deschidere.
    const sheets = [
      { sheet: document.getElementById('mobile-layers-panel'),
        fab:   document.getElementById('layers-fab'),
        close: document.getElementById('layers-sheet-close'),
        onOpen: null },
      { sheet: document.getElementById('mobile-tours-panel'),
        fab:   document.getElementById('tours-fab'),
        close: document.getElementById('tours-sheet-close'),
        // Re-randăm tour browse de fiecare dată — funcția e idempotentă.
        // Pe desktop e apelată când user click pe tab; pe mobil tab-urile
        // sunt ascunse, deci sheet-ul preia rolul de declanșator.
        onOpen: () => { if (typeof ctx.renderTourBrowse === 'function') ctx.renderTourBrowse(); } },
      { sheet: document.getElementById('mobile-hunts-panel'),
        fab:   document.getElementById('hunts-fab'),
        close: document.getElementById('hunts-sheet-close'),
        onOpen: () => { if (typeof ctx.renderHuntBrowse === 'function') ctx.renderHuntBrowse(); } },
    ];

    function openSheet(target) {
      // Închide orice alt sheet deschis
      sheets.forEach(s => { if (s.sheet && s.sheet !== target.sheet) closeSheet(s, /*skipBackdrop*/ true); });
      if (!target.sheet) return;
      target.sheet.hidden = false;
      layersBackdrop.hidden = false;
      void target.sheet.offsetWidth; // force reflow
      target.sheet.classList.add('open');
      layersBackdrop.classList.add('open');
      target.fab?.setAttribute('aria-expanded', 'true');
      target.onOpen?.();
    }
    function closeSheet(target, skipBackdrop) {
      if (!target.sheet) return;
      target.sheet.classList.remove('open');
      target.fab?.setAttribute('aria-expanded', 'false');
      setTimeout(() => { target.sheet.hidden = true; }, 250);
      if (!skipBackdrop) {
        layersBackdrop.classList.remove('open');
        setTimeout(() => { layersBackdrop.hidden = true; }, 250);
      }
    }
    function closeAllSheets() {
      sheets.forEach(s => closeSheet(s));
    }
    sheets.forEach(s => {
      s.fab?.addEventListener('click', () => {
        const isOpen = s.sheet?.classList.contains('open');
        if (isOpen) closeSheet(s); else openSheet(s);
      });
      s.close?.addEventListener('click', () => closeSheet(s));
    });
    layersBackdrop?.addEventListener('click', closeAllSheets);
    // Esc închide orice sheet deschis (paritate cu meniul hamburger)
    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;
      const anyOpen = sheets.some(s => s.sheet?.classList.contains('open'));
      if (anyOpen) closeAllSheets();
    });
    // Pe schimbarea breakpoint-ului, închide sheet-urile dacă sunt deschise
    mqMobile.addEventListener('change', (e) => {
      if (!e.matches) closeAllSheets();
    });

    // Pin links from any article (battle page etc.) → switch to map and open detail
    document.addEventListener('click', (e) => {
      const link = e.target.closest('.pin-link[data-loc]');
      if (!link) return;
      e.preventDefault();
      const locId = link.dataset.loc;
      activatePage('map');
      // Defer until layout settles so the marker is rendered + map sized
      setTimeout(() => {
        const item = locations.find(l => l.id === locId);
        if (!item) return;
        if (typeof openDetail === 'function') openDetail(locId);
        if (typeof highlight === 'function') highlight(locId, true);
        if (map) map.setView([item.lat, item.lon], 17, { animate: true });
      }, 80);
    });
    // Pe încărcare: respectă URL hash. Sub-rute precum `events/1918` activează
    // pagina `events`, sub-routing-ul intern e gestionat de syncEventsRoute
    // (apelat la finalul blocului events ca să evite temporal-dead-zone).
    const initialHash = (location.hash || '#map').replace('#', '');
    const initialBase = initialHash.split('/')[0];
    if (['map','stories','battle','about','trivia','contribute'].includes(initialBase)) {
      activatePage(initialBase);
    }
    window.addEventListener('load', resetDocumentScroll);
    window.addEventListener('resize', () => {
      if (document.body.classList.contains('map-mode')) resetDocumentScroll();
    });


    ctx.closeAllSheets = closeAllSheets;
    ctx.activatePage = activatePage;
    ctx.initialHash = initialHash;
}
