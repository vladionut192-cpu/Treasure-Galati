// Heritage Galați — modul: tab-urile din sidebar + tururile tematice
// (browse, enter/exit, traduceri RO/EN/FR din tours.json).
export function initTours(ctx) {
  const { escapeHtml, render, highlight, openDetail, tours, locsByArticle } = ctx;
    // ─────────── Tabs ───────────
    const tabBtns = document.querySelectorAll('.tabs .tab');
    const panelLocations = document.getElementById('panel-locations');
    const panelTours = document.getElementById('panel-tours');
    const panelHunts = document.getElementById('panel-hunts');
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.dataset.tab;
        tabBtns.forEach(b => {
          b.classList.toggle('active', b === btn);
          b.setAttribute('aria-selected', b === btn ? 'true' : 'false');
        });
        panelLocations.hidden = (target !== 'locations');
        panelTours.hidden     = (target !== 'tours');
        panelHunts.hidden     = (target !== 'hunts');
        if (target === 'locations') {
          if (ctx.activeTour) exitTour();
          if (typeof ctx.exitHunt === 'function' && ctx.activeHunt) ctx.exitHunt();
        } else if (target === 'tours') {
          if (typeof ctx.exitHunt === 'function' && ctx.activeHunt) ctx.exitHunt();
          renderTourBrowse();
        } else if (target === 'hunts') {
          if (ctx.activeTour) exitTour();
          if (typeof ctx.renderHuntBrowse === 'function') ctx.renderHuntBrowse();
        }
      });
    });

    // ─────────── Tour browse list ───────────
    const tourCardsEl = document.getElementById('tour-cards');
    const tourBrowseEl = document.getElementById('tour-browse');
    const tourActiveEl = document.getElementById('tour-active');
    const tourCoverEl = document.getElementById('tour-cover');
    const tourCategoryEl = document.getElementById('tour-category');
    const tourTitleEl = document.getElementById('tour-title');
    const tourSubtitleEl = document.getElementById('tour-subtitle');
    const tourDescriptionEl = document.getElementById('tour-description');
    const tourStopsEl = document.getElementById('tour-stops');
    const tourStopsCountEl = document.getElementById('tour-stops-count');
    const exitTourBtn = document.getElementById('exit-tour');
    const tourBrowseIntroEl = document.getElementById('tour-browse-intro');
    const tourStopsHeadingLabelEl = document.getElementById('tour-stops-heading-label');
    const tourLangLabelBrowseEl = document.getElementById('tour-lang-label-browse');
    const tourLangLabelActiveEl = document.getElementById('tour-lang-label-active');

    // Language i18n strings (UI + fallbacks for tours.json content)
    const TOUR_LANGS = ['ro', 'en', 'fr'];
    const TOUR_UI_STRINGS = {
      ro: {
        browseIntro: 'Tururi gândite pentru o singură poveste, parcurse pe jos. Click pe un tur ca să-l urmărești pe hartă.',
        empty: 'Niciun tur încă.',
        backToList: '← Înapoi la lista de tururi',
        stopsHeading: 'Traseu',
        stopOne: 'oprire', stopMany: 'opriri',
        defaultCategory: 'Tur tematic',
        untitled: '(fără titlu)',
        langLabel: 'Limbă:',
        of: 'opriri',
      },
      en: {
        browseIntro: 'Tours built around a single story, walked on foot. Click a tour to follow it on the map.',
        empty: 'No tours yet.',
        backToList: '← Back to tour list',
        stopsHeading: 'Route',
        stopOne: 'stop', stopMany: 'stops',
        defaultCategory: 'Themed tour',
        untitled: '(untitled)',
        langLabel: 'Language:',
        of: 'stops',
      },
      fr: {
        browseIntro: 'Des parcours construits autour d’une seule histoire, à faire à pied. Cliquez sur un tour pour le suivre sur la carte.',
        empty: 'Aucun tour pour l’instant.',
        backToList: '← Retour à la liste des tours',
        stopsHeading: 'Itinéraire',
        stopOne: 'arrêt', stopMany: 'arrêts',
        defaultCategory: 'Tour thématique',
        untitled: '(sans titre)',
        langLabel: 'Langue :',
        of: 'arrêts',
      },
    };

    // Tururile urmează limba globală a site-ului (RO/EN) — bara de limbi
    // dedicată a fost scoasă; tot conținutul e tradus global.
    function getTourLang() {
      const v = (typeof window.getLang === 'function') ? window.getLang() : 'ro';
      return TOUR_LANGS.includes(v) ? v : 'ro';
    }
    function setTourLang(lang) {
      if (!TOUR_LANGS.includes(lang)) lang = 'ro';
      tourLang = lang;
      // Update UI labels
      const ui = TOUR_UI_STRINGS[lang] || TOUR_UI_STRINGS.ro;
      if (tourBrowseIntroEl) tourBrowseIntroEl.textContent = ui.browseIntro;
      if (exitTourBtn) exitTourBtn.textContent = ui.backToList;
      if (tourStopsHeadingLabelEl) tourStopsHeadingLabelEl.textContent = ui.stopsHeading;
      // Re-render whichever view is open
      if (ctx.activeTour) enterTour(ctx.activeTour, /*keepLang*/ true);
      else renderTourBrowse();
    }
    let tourLang = getTourLang();

    // Helpers: read translated tour fields with fallback to Romanian source.
    function txTour(t, field) {
      if (tourLang !== 'ro' && t.i18n && t.i18n[tourLang] && t.i18n[tourLang][field] != null) {
        return t.i18n[tourLang][field];
      }
      return t[field];
    }
    function txStop(t, idx, field) {
      if (tourLang !== 'ro' && t.i18n && t.i18n[tourLang] && Array.isArray(t.i18n[tourLang].stops)) {
        const s = t.i18n[tourLang].stops[idx];
        if (s && s[field] != null) return s[field];
      }
      const orig = (t.stops || [])[idx];
      return orig ? orig[field] : '';
    }

    // Sincronizează limba tururilor cu limba globală a site-ului.
    window.addEventListener('langchange', () => setTourLang(getTourLang()));
    // Aplică limba curentă la încărcare
    setTourLang(tourLang);

    function renderTourBrowse() {
      tourBrowseEl.hidden = false;
      tourActiveEl.hidden = true;
      tourCardsEl.innerHTML = '';
      const ui = TOUR_UI_STRINGS[tourLang] || TOUR_UI_STRINGS.ro;
      if (!tours.length) {
        tourCardsEl.innerHTML = `<p class="tab-intro" style="text-align:center;color:var(--muted);font-style:italic;">${escapeHtml(ui.empty)}</p>`;
        return;
      }
      tours.forEach(t => {
        const validStops = (t.stops || []).filter(s => locsByArticle[s.article]);
        const card = document.createElement('button');
        card.className = 'tour-card';
        card.type = 'button';
        const titleStr = txTour(t, 'title') || ui.untitled;
        const subtitleStr = txTour(t, 'subtitle') || '';
        const categoryStr = txTour(t, 'category') || '';
        // Coperta cardului: miniatura de 480px, cu fallback pe original.
        const coverThumb = ctx.thumbUrl ? ctx.thumbUrl(t.cover) : null;
        const coverHtml = t.cover
          ? `<img class="cover" src="${escapeHtml(coverThumb || t.cover)}" data-full="${escapeHtml(t.cover)}"${coverThumb ? ' onerror="this.onerror=null;this.src=this.dataset.full"' : ''} alt="" loading="lazy" decoding="async">`
          : `<div class="cover-fallback" style="background:${escapeHtml(t.color || '#d8e4df')};color:white">${escapeHtml((titleStr || '?').charAt(0))}</div>`;
        const stopsLabel = validStops.length === 1 ? ui.stopOne : ui.stopMany;
        card.innerHTML = `
          ${coverHtml}
          <div class="body">
            ${categoryStr ? `<em>${escapeHtml(categoryStr)}</em>` : ''}
            <strong>${escapeHtml(titleStr)}</strong>
            <span>${validStops.length} ${escapeHtml(stopsLabel)}${subtitleStr ? ' · ' + escapeHtml(subtitleStr) : ''}</span>
          </div>
        `;
        card.addEventListener('click', () => enterTour(t));
        tourCardsEl.appendChild(card);
      });
    }

    function enterTour(tour, keepLang) {
      ctx.activeTour = tour;
      tourBrowseEl.hidden = true;
      tourActiveEl.hidden = false;
      const ui = TOUR_UI_STRINGS[tourLang] || TOUR_UI_STRINGS.ro;
      const titleStr = txTour(tour, 'title') || ui.untitled;
      const subtitleStr = txTour(tour, 'subtitle') || '';
      const categoryStr = txTour(tour, 'category') || ui.defaultCategory;
      const descriptionStr = txTour(tour, 'description') || '';
      // Populate tour-active panel
      if (tour.cover) {
        tourCoverEl.src = tour.cover;
        tourCoverEl.alt = titleStr;
        tourCoverEl.hidden = false;
      } else {
        tourCoverEl.hidden = true;
      }
      tourCategoryEl.textContent = categoryStr;
      tourCategoryEl.style.color = tour.color || '';
      tourTitleEl.textContent = titleStr;
      tourSubtitleEl.textContent = subtitleStr;
      tourSubtitleEl.hidden = !subtitleStr;
      tourDescriptionEl.textContent = descriptionStr;
      tourDescriptionEl.hidden = !descriptionStr;
      // Render stops list
      tourStopsEl.innerHTML = '';
      const validStops = (tour.stops || []).filter(s => locsByArticle[s.article]);
      const stopsLabel = validStops.length === 1 ? ui.stopOne : ui.stopMany;
      tourStopsCountEl.textContent = `${validStops.length} ${stopsLabel}`;
      validStops.forEach((s, idx) => {
        const loc = locsByArticle[s.article];
        const li = document.createElement('li');
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'stop';
        btn.dataset.id = loc.id;
        btn.innerHTML = `
          <span class="num" style="background:${idx === 0 ? '#3a7a4f' : (idx === validStops.length - 1 ? '#b34128' : escapeHtml(tour.color || '#2c6157'))}">${idx + 1}</span>
          <span class="body">
            <strong>${escapeHtml(loc.title)}</strong>
            <span>${escapeHtml(loc.location || loc.category || '')}</span>
          </span>
        `;
        btn.addEventListener('click', () => {
          highlight(loc.id, true);
          openDetail(loc.id);
        });
        li.appendChild(btn);
        tourStopsEl.appendChild(li);
      });
      if (!keepLang) {
        ctx.activeId = null;
        render();
      }
      // Update deep link
      if (typeof window.__updateDeepLink === 'function') {
        window.__updateDeepLink({ tour: tour.id });
      }
    }

    function exitTour() {
      ctx.activeTour = null;
      tourBrowseEl.hidden = false;
      tourActiveEl.hidden = true;
      ctx.activeId = null;
      // Clear tour from URL
      if (typeof window.__updateDeepLink === 'function') {
        window.__updateDeepLink({});
      }
      render();
    }

    exitTourBtn.addEventListener('click', exitTour);


    ctx.enterTour = enterTour;
    ctx.exitTour = exitTour;
    ctx.renderTourBrowse = renderTourBrowse;
}
