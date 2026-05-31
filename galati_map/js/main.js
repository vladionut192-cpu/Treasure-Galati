// Heritage Galați — main JavaScript bundle
// Extracted from index.html in refactor 2026-05-11.
// Future: split by module (map, tours, hunts, tooltips, lightbox, etc.)

    // Detect local dev (serve.py rulează) ca să afișăm UI-ul de admin (FAB-uri,
    // butoane edit/delete). În prod (cPanel) acele butoane sunt ascunse complet
    // pentru că endpoint-urile /api/* nu există.
    (function () {
      const h = location.hostname;
      const isDev = h === 'localhost' || h === '127.0.0.1' || h === '' || h.endsWith('.local');
      if (isDev) document.documentElement.classList.add('local-dev');
    })();

    // ─── i18n — Wire-up picker de limbă (un singur buton + dropdown) ───
    (function () {
      if (typeof window.applyTranslations !== 'function') return;
      window.applyTranslations();
      const currentBtn = document.getElementById('lang-current-btn');
      const menu = document.getElementById('lang-menu');
      function positionMenu() {
        if (!menu || !currentBtn) return;
        const r = currentBtn.getBoundingClientRect();
        // Default: aliniat sub butonul curent, capăt dreapta aliniat
        let top = r.bottom + 6;
        let left = r.right - menu.offsetWidth;
        const margin = 8;
        if (left < margin) left = margin;
        const maxRight = window.innerWidth - margin;
        if (left + menu.offsetWidth > maxRight) left = maxRight - menu.offsetWidth;
        menu.style.top = top + 'px';
        menu.style.left = left + 'px';
      }
      function openMenu() {
        if (!menu) return;
        menu.hidden = false;
        currentBtn.setAttribute('aria-expanded', 'true');
        // Necesar 2 frames ca offsetWidth să fie populat după display
        requestAnimationFrame(() => requestAnimationFrame(positionMenu));
      }
      function closeMenu() {
        if (!menu) return;
        menu.hidden = true;
        currentBtn.setAttribute('aria-expanded', 'false');
      }
      // Repoziționează când userul redimensionează / scroll
      window.addEventListener('resize', () => { if (menu && !menu.hidden) positionMenu(); }, { passive: true });
      window.addEventListener('scroll', () => { if (menu && !menu.hidden) positionMenu(); }, { passive: true });
      if (currentBtn && menu) {
        currentBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          if (menu.hidden) openMenu(); else closeMenu();
        });
        // Click în afară → închide
        document.addEventListener('click', (e) => {
          if (menu.hidden) return;
          if (e.target.closest('#lang-picker')) return;
          closeMenu();
        });
        // Esc → închide
        document.addEventListener('keydown', (e) => {
          if (e.key === 'Escape' && !menu.hidden) closeMenu();
        });
      }
      // Click pe orice opțiune (RO sau EN) → schimbă limba + închide
      document.querySelectorAll('[data-lang-btn]').forEach(btn => {
        btn.addEventListener('click', () => {
          window.setLang(btn.getAttribute('data-lang-btn'));
          closeMenu();
        });
      });
      // La schimbare de limbă, re-render markerii și panourile active
      // PRESERVĂM view-ul hărții (zoom + centru) — utilizatorul vrea doar text tradus,
      // nu vrea ca harta să sară la fitBounds peste toate locațiile.
      window.addEventListener('langchange', () => {
        try {
          if (typeof window.__render === 'function') window.__render({ preserveView: true });
          if (typeof window.__rerenderActiveDetail === 'function') window.__rerenderActiveDetail();
        } catch (e) {}
      });
    })();

    // ─── Onboarding — floating tooltips ───
    // 6 mesaje plutitoare pe elementele cheie. Apar automat la prima vizită,
    // fiecare cu X de închidere individual. Persistent per-tooltip via
    // localStorage `tg.tip.{id}.seen`. Buton mic discret în topbar pentru reset.
    (function () {
      const tipKey = (id) => `tg.tip.${id}.seen`;
      const allTips = () => document.querySelectorAll('.tour-tip[data-tip-id]');

      function isTipSeen(id) {
        try { return localStorage.getItem(tipKey(id)) === '1'; }
        catch (e) { return false; }
      }
      function markTipSeen(id) {
        try { localStorage.setItem(tipKey(id), '1'); } catch (e) {}
      }
      function clearAllTipsSeen() {
        try {
          allTips().forEach(t => localStorage.removeItem(tipKey(t.dataset.tipId)));
        } catch (e) {}
      }

      function positionTip(tip) {
        const targetSel = tip.dataset.target;
        const pos = tip.dataset.pos || 'below-center';
        const target = document.querySelector(targetSel);
        if (!target) { tip.hidden = true; return; }
        const r = target.getBoundingClientRect();
        if (r.width === 0 && r.height === 0) { tip.hidden = true; return; }
        tip.style.left = '0px'; tip.style.top = '0px';
        tip.hidden = false;
        const tipR = tip.getBoundingClientRect();
        let left = 0, top = 0;
        const gap = 14;
        switch (pos) {
          case 'below-center':
            left = r.left + r.width / 2 - tipR.width / 2;
            top = r.bottom + gap;
            break;
          case 'below-left':
            left = r.left + 16;
            top = r.bottom + gap;
            break;
          case 'above-center':
            left = r.left + r.width / 2 - tipR.width / 2;
            top = r.top - tipR.height - gap;
            break;
          case 'left-center':
            left = r.left - tipR.width - gap;
            top = r.top + r.height / 2 - tipR.height / 2;
            break;
          case 'left-top':
            left = r.left - tipR.width - gap;
            top = r.top + 24;
            break;
          case 'right-center':
            left = r.right + gap;
            top = r.top + r.height / 2 - tipR.height / 2;
            break;
          case 'center':
            left = window.innerWidth / 2 - tipR.width / 2;
            top = window.innerHeight / 2 - tipR.height / 2;
            break;
          default:
            left = r.left + r.width / 2 - tipR.width / 2;
            top = r.bottom + gap;
        }
        const margin = 8;
        if (left < margin) left = margin;
        if (left + tipR.width > window.innerWidth - margin) left = window.innerWidth - tipR.width - margin;
        if (top < margin) top = margin;
        if (top + tipR.height > window.innerHeight - margin) top = window.innerHeight - tipR.height - margin;
        tip.style.left = left + 'px';
        tip.style.top = top + 'px';
      }

      function rectsOverlap(a, b, padding) {
        padding = padding || 0;
        return !(a.right + padding < b.left
              || b.right + padding < a.left
              || a.bottom + padding < b.top
              || b.bottom + padding < a.top);
      }
      function avoidTipOverlap(tip, placedRects) {
        let r = tip.getBoundingClientRect();
        const margin = 12;
        const maxShifts = 8;
        // Multi-pass: keep shifting until no overlap or exhausted attempts
        for (let attempts = 0; attempts < maxShifts; attempts++) {
          let conflict = null;
          for (const pr of placedRects) {
            if (rectsOverlap(r, pr, margin)) {
              conflict = pr; break;
            }
          }
          if (!conflict) break;
          // Try moving below conflict
          const newTopDown = conflict.bottom + margin;
          if (newTopDown + r.height < window.innerHeight - margin) {
            tip.style.top = newTopDown + 'px';
            r = tip.getBoundingClientRect();
            continue;
          }
          // Try moving above conflict
          const newTopUp = conflict.top - r.height - margin;
          if (newTopUp > margin) {
            tip.style.top = newTopUp + 'px';
            r = tip.getBoundingClientRect();
            continue;
          }
          // No vertical space; try moving right
          const newLeftRight = conflict.right + margin;
          if (newLeftRight + r.width < window.innerWidth - margin) {
            tip.style.left = newLeftRight + 'px';
            r = tip.getBoundingClientRect();
            continue;
          }
          break; // Give up — leave overlap
        }
        return r;
      }
      function showTooltips() {
        const placedRects = [];
        allTips().forEach(tip => {
          if (isTipSeen(tip.dataset.tipId)) {
            tip.hidden = true;
            return;
          }
          positionTip(tip);
          if (!tip.hidden) {
            const r = avoidTipOverlap(tip, placedRects);
            placedRects.push(r);
          }
        });
      }
      function hideAllTooltips() {
        allTips().forEach(t => { t.hidden = true; });
      }
      function dismissTip(tip) {
        tip.hidden = true;
        markTipSeen(tip.dataset.tipId);
      }

      // Reposition on resize
      let positionTimer = null;
      function scheduleReposition() {
        clearTimeout(positionTimer);
        positionTimer = setTimeout(() => {
          const placedRects = [];
          allTips().forEach(tip => {
            if (tip.hidden) return;
            positionTip(tip);
            const r = avoidTipOverlap(tip, placedRects);
            placedRects.push(r);
          });
        }, 60);
      }
      window.addEventListener('resize', scheduleReposition);

      // Wire up close (X) buttons
      allTips().forEach(tip => {
        const x = tip.querySelector('.tip-close');
        if (x) x.addEventListener('click', () => dismissTip(tip));
      });

      // ESC închide toate tooltip-urile pendente
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          allTips().forEach(tip => {
            if (!tip.hidden) dismissTip(tip);
          });
        }
      });

      // Show on first visit — DOAR pe desktop. Pe mobil / tableta cu ecran
      // mic, tooltip-urile flotante acoperă conținutul; rămân disponibile
      // la cerere prin butonul „?".
      function isMobileViewport() {
        return window.innerWidth <= 820
          || window.matchMedia('(max-width: 820px)').matches
          || window.matchMedia('(hover: none) and (pointer: coarse)').matches
          || (typeof navigator !== 'undefined' && /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent));
      }
      if (!isMobileViewport()) {
        setTimeout(showTooltips, 800);
      }
      // Safeguard: la resize spre mobil, dacă apar tooltip-uri, le închidem.
      window.addEventListener('resize', () => {
        if (isMobileViewport()) {
          allTips().forEach(t => { if (!t.hidden) t.hidden = true; });
        }
      }, { passive: true });

      // Buton „?" (top-right pe hartă) — TOGGLE:
      //   • dacă există tooltip-uri vizibile  → închide toate (marchează ca seen)
      //   • dacă toate sunt închise           → resetează flag-urile și reafișează toate
      const helpFab = document.getElementById('help-fab');
      const mobileSheet = document.getElementById('mobile-help-sheet');
      function openMobileHelpSheet() {
        if (!mobileSheet) return;
        mobileSheet.hidden = false;
        // Wire close on first open
        mobileSheet.querySelectorAll('[data-close="1"]').forEach(el => {
          el.onclick = () => { mobileSheet.hidden = true; };
        });
      }
      if (helpFab) {
        helpFab.addEventListener('click', () => {
          // On mobile: show the dedicated sheet instead of floating tooltips
          if (isMobileViewport()) {
            openMobileHelpSheet();
            return;
          }
          const anyVisible = Array.from(allTips()).some(t => !t.hidden);
          if (anyVisible) {
            // Închide toate (cu persist — marchează ca seen)
            allTips().forEach(tip => {
              if (!tip.hidden) dismissTip(tip);
            });
          } else {
            // Reopen — resetează flag-urile și reafișează
            clearAllTipsSeen();
            hideAllTooltips();
            setTimeout(showTooltips, 100);
          }
        });
      }
      // Close mobile sheet on Esc
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && mobileSheet && !mobileSheet.hidden) {
          mobileSheet.hidden = true;
        }
      });
    })();

    // Service worker — offline-first cache pentru asset-uri și date.
    // After a deploy, when the new SW activates and takes control via
    // clients.claim(), the in-memory page is still running OLD JS. Reload once
    // automatically so users get the new version without needing two hard refreshes.
    if ('serviceWorker' in navigator && location.protocol !== 'file:') {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js').catch(() => {});
      });
      let reloaded = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (reloaded) return;
        reloaded = true;
        // Tiny delay so any in-flight requests can settle.
        setTimeout(() => window.location.reload(), 50);
      });
    }
    (async () => {
      const fetchJson = (url) => fetch(url, { cache: 'default' }).then(r => {
        if (!r.ok) throw new Error(`Failed to load ${url}: ${r.status}`);
        return r.json();
      });
      let locations, cartiere, toursData, toursRoutes, huntsData;
      try {
        [locations, cartiere, toursData, toursRoutes, huntsData] = await Promise.all([
          fetchJson('locations.json'),
          fetchJson('cartiere.geojson'),
          fetchJson('tours.json'),
          fetchJson('tours_routes.json').catch(() => ({ tours: {} })), // optional
          fetchJson('treasure_hunts.json').catch(() => ({ hunts: [] })), // optional
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

    // Inline SVG icons keyed by category. 24×24 viewBox, white stroke, no fill.
    const ICON_PATHS = {
      'Case istorice':       '<path d="M4 11l8-7 8 7v9a1 1 0 0 1-1 1h-4v-7H9v7H5a1 1 0 0 1-1-1z"/><path d="M4 11l8-7 8 7"/>',
      'Lăcașuri de cult':    '<path d="M12 2v4M10 4h4"/><path d="M5 22V12l7-4 7 4v10"/><path d="M9 22v-6h6v6"/>',
      'Palate':              '<path d="M3 10l9-6 9 6"/><path d="M5 10v10M19 10v10M9 10v10M15 10v10"/><path d="M3 21h18"/>',
      'Consulate':           '<path d="M5 21V4M5 4l11 1-2 4 2 4-11 1"/><path d="M5 21h6"/>',
      'Educație':            '<path d="M3 7l9-4 9 4-9 4-9-4z"/><path d="M7 9v5c0 2 2.5 3 5 3s5-1 5-3V9"/><path d="M21 7v6"/>',
      'Monumente':           '<path d="M10 2h4l-1 4h0v15h-2V6h0z"/><path d="M7 21h10"/>',
      'Industrie':           '<path d="M3 21V11l5 3v-3l5 3V8l5 3V21z"/><path d="M3 21h18"/>',
      'Comerț istoric':      '<path d="M3 8l1.5-4h15L21 8"/><path d="M3 8v13h18V8"/><path d="M3 8h18M9 14h6v7H9z"/>',
      'Spații verzi':        '<path d="M12 3l-4 6h2l-3 5h3l-2 3h8l-2-3h3l-3-5h2z"/><path d="M12 17v4"/>',
      'Alte locuri':         '<path d="M12 22s7-7.5 7-12a7 7 0 1 0-14 0c0 4.5 7 12 7 12z"/><circle cx="12" cy="10" r="3"/>',
    };
    function iconSvg(category, size) {
      const path = ICON_PATHS[category] || ICON_PATHS['Alte locuri'];
      const s = size || 18;
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="${s}" height="${s}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${path}</svg>`;
    }

    // Centrare implicită pe Statuia Mihai Eminescu (loc-113, 45.43614, 28.05456)
    // pentru toți utilizatorii — punct emblematic în mijlocul orașului istoric,
    // lângă Piața Regală. Zoom 16 pentru ca punctul să fie clar vizibil.
    const map = L.map('map', { zoomControl: true, scrollWheelZoom: true })
      .setView([45.43614, 28.05456], 16);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd',
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
    }).addTo(map);

    // ───── Cartiere overlay (Voronoi polygons) ─────
    function colorForCartier(name) {
      let h = 0;
      for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) | 0;
      const hue = Math.abs(h) % 360;
      return `hsl(${hue}, 42%, 48%)`;
    }
    const cartiereLayer = L.geoJSON(cartiere, {
      style: (feature) => {
        const c = colorForCartier(feature.properties.name);
        return {
          color: c, weight: 2, opacity: 0.7,
          fillColor: c, fillOpacity: 0.18,
        };
      },
      onEachFeature: (feature, layer) => {
        const c = colorForCartier(feature.properties.name);
        layer.bindTooltip(feature.properties.name, {
          permanent: true,
          direction: 'center',
          className: 'cartier-tip',
        });
        // Tint the tooltip border to match the polygon color.
        layer.on('add', () => {
          const el = layer.getTooltip() && layer.getTooltip().getElement();
          if (el) el.style.color = c;
        });
        layer.on('mouseover', () => layer.setStyle({ fillOpacity: 0.34 }));
        layer.on('mouseout',  () => layer.setStyle({ fillOpacity: 0.18 }));
      }
    });
    const toggleBtn = document.getElementById('toggle-cartiere');
    const cartiereCountEl = document.getElementById('cartiere-count');
    function _updateCartiereCount() {
      const n = (cartiere.features || []).length;
      cartiereCountEl.textContent = `${n} ${(typeof window.t === 'function' ? window.t('layer.zones') : 'zone')}`;
    }
    _updateCartiereCount();
    window.addEventListener('langchange', _updateCartiereCount);
    toggleBtn.addEventListener('click', () => {
      const isOn = toggleBtn.getAttribute('aria-pressed') === 'true';
      if (isOn) {
        map.removeLayer(cartiereLayer);
        toggleBtn.setAttribute('aria-pressed', 'false');
      } else {
        cartiereLayer.addTo(map);
        cartiereLayer.bringToBack();
        toggleBtn.setAttribute('aria-pressed', 'true');
      }
    });

    const markers = new Map();
    // Cluster pentru locații: reduce numărul de DOM nodes la zoom mic și
    // nu randează în afara viewport-ului — fix pentru jank pe mobil cu ~460
    // pinuri totale (148 locații + ~311 fotografii pubcrawl).
    function makeLocationCluster() {
      return L.markerClusterGroup({
        maxClusterRadius: 60,
        disableClusteringAtZoom: 15,
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: false,
        zoomToBoundsOnClick: true,
        chunkedLoading: true,
        removeOutsideVisibleBounds: true,
        iconCreateFunction: (cluster) => {
          const n = cluster.getChildCount();
          const sz = n < 10 ? 'small' : n < 30 ? 'medium' : 'large';
          const dim = sz === 'small' ? 38 : sz === 'large' ? 46 : 42;
          return L.divIcon({
            html: `<div><span>${n}</span></div>`,
            className: `marker-cluster marker-cluster-${sz}`,
            iconSize: L.point(dim + 8, dim + 8),
          });
        },
      });
    }
    let layer = makeLocationCluster().addTo(map);
    const list = document.getElementById('list');
    const search = document.getElementById('search');
    const category = document.getElementById('category');
    const count = document.getElementById('count');
    const detail = document.getElementById('detail');
    const detailScroll = document.getElementById('detail-scroll');
    const crumbs = document.getElementById('crumbs');
    const closeBtn = document.getElementById('close-detail');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.getElementById('lightbox-caption');
    let activeId = null;
    let activeTour = null;
    const tours = (toursData && toursData.tours) || [];
    const locsByArticle = Object.fromEntries(locations.map(l => [l.article, l]));

    // Total locații — afișat lângă chips (text-ul exact e pus de render())
    function _tt(key, params) {
      return (typeof window.t === 'function') ? window.t(key, params) : key;
    }
    function _catLabel(cat) {
      return _tt('cat.' + cat) || cat || '';
    }
    if (count) count.textContent = `${locations.length} ${_tt('results.count', {total: locations.length})}`;

    const categories = [...new Set(locations.map(item => item.category).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'ro'));
    categories.forEach(name => {
      const option = document.createElement('option');
      option.value = name;
      option.textContent = _catLabel(name);
      option.setAttribute('data-cat-key', name);
      category.appendChild(option);
    });

    function escapeHtml(value) {
      return String(value || '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[char]));
    }

    function buildIcon(item, isActive) {
      // In tour mode: numbered bubble with first/last accents
      if (activeTour) {
        const idx = activeTour.stops.findIndex(s => s.article === item.article);
        if (idx >= 0) {
          const first = idx === 0;
          const last = idx === activeTour.stops.length - 1;
          const cls = `marker-bubble tour-stop${first ? ' first' : (last ? ' last' : '')}${isActive ? ' active' : ''}`;
          const bg = activeTour.color || '';
          return L.divIcon({
            className: 'custom-marker',
            html: `<div class="${cls}" data-num="${idx + 1}" style="${bg && !first && !last ? 'background:' + escapeHtml(bg) : ''}" title="${escapeHtml(item.title)}"></div>`,
            iconSize: [32, 32],
            iconAnchor: [16, 16],
            popupAnchor: [0, -18]
          });
        }
      }
      const statusClass = item.status === 'demolished' || item.status === 'lost'
        ? ' demolished'
        : (item.status === 'ruin' ? ' ruin' : '');
      return L.divIcon({
        className: 'custom-marker',
        html: `<div class="marker-bubble${isActive ? ' active' : ''}${statusClass}" title="${escapeHtml(item.title)}">${iconSvg(item.category, 18)}</div>`,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
        popupAnchor: [0, -18]
      });
    }

    // Helper i18n pentru câmpurile traducibile ale unei locații.
    // Returnează versiunea EN dacă lang=en ȘI există câmpul _en;
    // altfel fallback la versiunea RO. Astfel adăugarea traducerilor
    // se face progresiv în locations.json — entry-urile fără _en
    // continuă să apară în română (cu banner explicativ).
    function _locField(item, field) {
      if (!item) return '';
      const lang = (typeof window.getLang === 'function') ? window.getLang() : 'ro';
      if (lang === 'en' && item[field + '_en']) return item[field + '_en'];
      return item[field] || '';
    }
    function _hasEnContent(item) {
      return !!(item && (item.description_en || item.excerpt_en || item.title_en));
    }

    function popupHtml(item) {
      const catLabel = _catLabel(item.category);
      const phNote = _tt('detail.image.placeholder');
      const readLabel = _tt('detail.read');
      const editLabel = _tt('detail.edit');
      const title = _locField(item, 'title');
      const location = _locField(item, 'location');
      const excerptTxt = _locField(item, 'excerpt');
      const img = item.image
        ? `<img class="pop-img" src="${escapeHtml(item.image)}" alt="${escapeHtml(title)}" loading="lazy" decoding="async">`
        : `<div class="pop-img pop-img-placeholder" aria-hidden="true"><span class="ph-eyebrow">${escapeHtml(catLabel || 'Obiectiv')}</span><svg class="ph-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="0"/><path d="M3 16l5-5 4 4 3-3 6 6"/><circle cx="9" cy="10" r="1.5"/></svg><span class="ph-note">${escapeHtml(phNote)}</span></div>`;
      // Address is intentionally NOT rendered in the popup — the map context
      // already shows the location, and removing it keeps the popup compact.
      // Excerpt is clamped to 3 lines via CSS (-webkit-line-clamp on .popup p).
      const excerpt = excerptTxt ? `<p>${escapeHtml(excerptTxt)}</p>` : '';
      return `<article class="popup">
        ${img}
        <span class="pop-num">${escapeHtml(catLabel)}</span>
        <h3>${escapeHtml(title)}</h3>
        ${excerpt}
        <div class="popup-actions">
          <button type="button" class="read" data-id="${escapeHtml(item.id)}">${escapeHtml(readLabel)}</button>
          <button type="button" class="edit-loc" data-id="${escapeHtml(item.id)}" title="Editează">${escapeHtml(editLabel)}</button>
        </div>
      </article>`;
    }

    // ─── Filter & timeline state ─────────────────────────────────
    let activeFilter = 'all';  // 'all' | 'active' | 'demolished'
    let timelineYear = null;   // null = no timeline filter; else integer year

    function passesFilter(item) {
      switch (activeFilter) {
        case 'all': return true;
        case 'active': return item.status === 'active';
        case 'demolished': return item.status === 'demolished' || item.status === 'lost';
        default: return true;
      }
    }

    function passesTimeline(item) {
      if (timelineYear === null) return true;
      const built = item.year_built;
      const demolished = item.year_demolished;
      // Pinul există în anul X dacă: construit <= X și (nu e demolat sau demolit > X)
      if (built === null || built === undefined) {
        // Fără year_built — afișăm doar dacă timeline e la sau după 1990 (asum modern)
        return timelineYear >= 1990;
      }
      if (built > timelineYear) return false;
      if (demolished !== null && demolished !== undefined && demolished < timelineYear) return false;
      return true;
    }

    // ─── Search: Fuse.js fuzzy + fallback substring ───
    // La 226+ locații, simple includes() ratează tipăriri (ex. „Conachi" cu „k").
    // Fuse oferă fuzzy + relevance scoring. Indexul se reconstruiește când se
    // schimbă lista locațiilor (după filtre de timeline/status).
    let fuseIndex = null;
    let fuseQuery = '';
    let fuseHitIds = null;
    function rebuildFuseIndex() {
      if (typeof Fuse === 'undefined') return;
      fuseIndex = new Fuse(locations, {
        keys: [
          { name: 'title', weight: 3 },
          { name: 'location', weight: 2 },
          { name: 'excerpt', weight: 1 },
          { name: 'description', weight: 0.5 },
        ],
        threshold: 0.32,
        ignoreLocation: true,
        minMatchCharLength: 2,
      });
    }
    function applyFuseQuery(q) {
      if (!q || q.length < 2) { fuseHitIds = null; fuseQuery = ''; return; }
      if (q === fuseQuery && fuseHitIds) return;
      if (!fuseIndex) rebuildFuseIndex();
      if (!fuseIndex) { fuseHitIds = null; return; }
      const hits = fuseIndex.search(q);
      fuseHitIds = new Set(hits.map(h => h.item.id));
      fuseQuery = q;
    }

    function matches(item) {
      // Tour mode: only show items in the active tour
      if (activeTour) {
        return activeTour.stops.some(s => s.article === item.article);
      }
      const q = search.value.trim().toLowerCase();
      const cat = category.value;
      // Fuse pe query nontrivial; fallback substring când e prea scurt
      if (q && q.length >= 2 && typeof Fuse !== 'undefined') {
        applyFuseQuery(q);
        if (fuseHitIds && !fuseHitIds.has(item.id)) return false;
      } else if (q) {
        const haystack = `${item.title} ${item.location} ${item.excerpt || ''} ${item.description || ''}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return (!cat || item.category === cat)
          && passesFilter(item)
          && passesTimeline(item);
    }

    let tourRouteLayer = null;

    // Draws the tour polyline. When detail panel is open AND activeId is a stop
    // in the active tour, shows only the leg from that stop to the next.
    // Otherwise shows the full route.
    function drawTourRoute() {
      if (tourRouteLayer) { map.removeLayer(tourRouteLayer); tourRouteLayer = null; }
      if (!activeTour) return;
      const stopArticles = activeTour.stops.map(s => s.article);
      const stopLocs = stopArticles.map(a => locsByArticle[a]).filter(Boolean);
      if (stopLocs.length < 2) return;

      const precomputed = (toursRoutes && toursRoutes.tours && toursRoutes.tours[activeTour.id]) || null;
      const color = activeTour.color || '#2c6157';
      const isDetailOpen = detail.dataset.open === '1';

      let activeStopIdx = -1;
      if (isDetailOpen && activeId) {
        const activeLoc = locations.find(l => l.id === activeId);
        if (activeLoc) activeStopIdx = stopArticles.indexOf(activeLoc.article);
      }

      // Single-leg mode: detail open + active stop is in tour + has a "next" stop
      if (activeStopIdx >= 0 && activeStopIdx < stopArticles.length - 1) {
        tourRouteLayer = L.layerGroup().addTo(map);
        const legCoords = (precomputed && precomputed[activeStopIdx])
          ? precomputed[activeStopIdx]
          : (function() {
              const a = stopLocs[activeStopIdx], b = stopLocs[activeStopIdx + 1];
              return (a && b) ? [[a.lat, a.lon], [b.lat, b.lon]] : null;
            })();
        if (!legCoords) return;
        const line = L.polyline(legCoords, {
          color, weight: 5.5, opacity: 0.95, dashArray: '10 6',
          className: 'tour-leg-active',
        }).addTo(tourRouteLayer);
        // Ensure SVG element has the class even after Leaflet rerenders on zoom
        const el = line.getElement();
        if (el) el.classList.add('tour-leg-active');
        return;
      }
      // Last stop selected (no next): hide route entirely
      if (activeStopIdx === stopArticles.length - 1) return;

      // Default: full route — dashed throughout
      tourRouteLayer = L.layerGroup().addTo(map);
      if (precomputed && precomputed.length) {
        precomputed.forEach((leg) => {
          L.polyline(leg, {
            color, weight: 4.5, opacity: 0.85, dashArray: '8 7',
          }).addTo(tourRouteLayer);
        });
      } else {
        const coords = stopLocs.map(l => [l.lat, l.lon]);
        L.polyline(coords, {
          color, weight: 4, opacity: 0.85, dashArray: '10 6',
        }).addTo(tourRouteLayer);
      }
    }

    function render(opts) {
      opts = opts || {};
      layer.clearLayers();
      if (tourRouteLayer) { map.removeLayer(tourRouteLayer); tourRouteLayer = null; }
      list.innerHTML = '';
      markers.clear();
      let filtered = locations.filter(matches);

      // In tour mode: sort by tour stop order
      if (activeTour) {
        const order = new Map(activeTour.stops.map((s, i) => [s.article, i]));
        filtered = filtered.slice().sort((a, b) => (order.get(a.article) ?? 999) - (order.get(b.article) ?? 999));
        count.textContent = _tt('results.count.tour', {n: filtered.length});
      } else {
        count.textContent = `${filtered.length} ${_tt('results.count', {total: locations.length})}`;
      }

      // Batch toate marker-ele într-un array și le adăugăm cu addLayers (mult
      // mai eficient decât addLayer pentru 148 markers — un singur recompute
      // de cluster în loc de 148).
      const batch = [];
      filtered.forEach(item => {
        const marker = L.marker([item.lat, item.lon], { icon: buildIcon(item, item.id === activeId) })
          .bindPopup(popupHtml(item), { closeButton: true, autoPan: true });
        // Hover-preview cu imagine (doar pentru puncte cu poză, doar pe desktop hover).
        // Pe mobil tooltip-urile nu se afișează la touch — flow-ul rămâne tap → popup.
        if (item.image) {
          const previewHtml =
            `<div class="marker-preview">
               <img src="${escapeHtml(item.image)}" alt="" loading="lazy" decoding="async">
               <div class="cap">${escapeHtml(_locField(item, 'title'))}</div>
             </div>`;
          marker.bindTooltip(previewHtml, {
            direction: 'top',
            offset: L.point(0, -12),
            opacity: 1,
            sticky: false,
            className: 'preview-tip',
          });
        }
        batch.push(marker);
        markers.set(item.id, marker);
        marker.on('popupopen', (e) => {
          const popEl = e.popup.getElement();
          const btn = popEl.querySelector('button.read');
          if (btn) btn.addEventListener('click', () => openDetail(item.id));
          const editBtn = popEl.querySelector('button.edit-loc');
          if (editBtn) editBtn.addEventListener('click', () => {
            marker.closePopup();
            openEditLocation(item.id);
          });
        });
        marker.on('click', () => highlight(item.id, false));

        const li = document.createElement('li');
        const btn = document.createElement('button');
        const statusCls = item.status === 'demolished' || item.status === 'lost' ? ' is-demolished'
                       : item.status === 'ruin' ? ' is-ruin' : '';
        const hasImage = !!item.image;
        btn.className = 'item' + (item.id === activeId ? ' active' : '') + statusCls + (hasImage ? ' has-image' : '');
        btn.type = 'button';
        btn.dataset.id = item.id;
        const yearLabel = item.year_built !== null && item.year_built !== undefined
          ? (item.year_demolished ? `${item.year_built}–${item.year_demolished}` : `${item.year_built}`)
          : '';
        const catLabelTr = _catLabel(item.category);
        const fullEm = yearLabel ? `${catLabelTr} · ${yearLabel}` : catLabelTr;
        // Background image (when present) loads natively via `loading="lazy"` —
        // browser only fetches when the card is near the viewport, so 200+ cards
        // don't blow up the initial page load.
        const bgImg = hasImage
          ? `<img class="item-bg" src="${escapeHtml(item.image)}" loading="lazy" decoding="async" alt="" aria-hidden="true">`
          : '';
        btn.innerHTML = `
          ${bgImg}
          <span class="num" aria-hidden="true">${iconSvg(item.category, 20)}</span>
          <span class="body">
            <em>${escapeHtml(fullEm)}</em>
            <strong>${escapeHtml(_locField(item, 'title'))}</strong>
          </span>`;
        btn.addEventListener('click', () => {
          highlight(item.id, true);
          openDetail(item.id);
        });
        li.appendChild(btn);
        list.appendChild(li);
      });

      // Adaugăm toate marker-ele într-un singur apel — clusterul recalculează
      // o singură dată în loc de N ori.
      if (batch.length) layer.addLayers(batch);

      // Draw the route polyline if in tour mode
      drawTourRoute();
      // fitBounds doar dacă există context activ (tur, filtru). La rendarea inițială
      // NU facem auto-fit, păstrăm view-ul de start (Statuia Eminescu, zoom 16).
      if (activeTour && filtered.length >= 2 && !opts.preserveView) {
        const coords = filtered.map(l => [l.lat, l.lon]);
        map.fitBounds(coords, { padding: [60, 60], maxZoom: 16 });
      } else if (filtered.length && !activeId && window.__renderHasRunOnce && !opts.preserveView) {
        // Doar de la a doua rendare în sus (după ce user-ul a făcut o acțiune)
        const bounds = L.latLngBounds(filtered.map(item => [item.lat, item.lon]));
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
      }
      // Când rerandăm cu view păstrat (ex: schimbare de limbă), forțăm Leaflet
      // să-și recalculeze dimensiunea containerului. Translatarea labelurilor
      // poate schimba lățimea topbarului/sidebarului → harta vede dimensiuni
      // vechi și apar zone albe (tiles ne-încărcate). invalidateSize forțează
      // un re-layout corect + reîncărcarea tile-urilor lipsă.
      if (opts.preserveView) {
        requestAnimationFrame(() => {
          try { map.invalidateSize({ pan: false, debounceMoveend: true }); } catch (e) {}
        });
      }
      window.__renderHasRunOnce = true;
    }
    // Expun render() global ca să poată fi re-apelat la langchange
    window.__render = render;
    // Helper pentru re-rendering panou de detaliu activ
    window.__rerenderActiveDetail = () => {
      if (activeId && typeof openDetail === 'function') {
        const wasOpen = detail && detail.dataset.open;
        openDetail(activeId);
        if (!wasOpen && detail) delete detail.dataset.open;
      }
      // Update categorie dropdown
      const sel = document.getElementById('category');
      if (sel) {
        sel.querySelectorAll('option[data-cat-key]').forEach(o => {
          const k = o.getAttribute('data-cat-key');
          o.textContent = _catLabel(k);
        });
      }
    };

    function highlight(id, panTo) {
      activeId = id;
      document.querySelectorAll('.item').forEach(el => {
        el.classList.toggle('active', el.dataset.id === id);
      });
      markers.forEach((mk, mid) => {
        mk.setIcon(buildIcon(locations.find(l => l.id === mid), mid === id));
      });
      const item = locations.find(l => l.id === id);
      if (!item) return;
      if (panTo) {
        map.setView([item.lat, item.lon], Math.max(map.getZoom(), 16), { animate: true });
        const mk = markers.get(id);
        if (mk) mk.openPopup();
      }
      const btn = document.querySelector(`.item[data-id="${id}"]`);
      if (btn) btn.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }

    function openDetail(id) {
      const item = locations.find(l => l.id === id);
      if (!item) return;
      // Pe mobil, dacă un bottom-sheet (straturi/tururi) e deschis, îl închidem
      // ca să fie vizibil panel-ul detail care alunecă din dreapta.
      if (typeof closeAllSheets === 'function') closeAllSheets();
      activeId = id;
      const catLabel = _catLabel(item.category);
      crumbs.textContent = catLabel || 'Obiectiv';
      const heroPhNote = _tt('detail.hero.placeholder');
      const titleTxt = _locField(item, 'title');
      const locationTxt = _locField(item, 'location');
      // Before/After comparison takes precedence over the regular hero image when
      // both image_then and image_now are present. The slider is wired up after
      // the panel is rendered (see initBeforeAfter() below).
      const hasComparison = !!(item.image_then && item.image_now);
      // Labels on the comparison slider — prefer the explicit years set in the
      // editor; fall back to plain "ÎNAINTE" / "ACUM" if no year is recorded.
      const thenLabel = (item.image_then_year != null && item.image_then_year !== '')
        ? String(item.image_then_year) : 'ÎNAINTE';
      const nowLabel  = (item.image_now_year  != null && item.image_now_year  !== '')
        ? String(item.image_now_year)  : 'ACUM';
      // Layering: "now" is the base layer (fills the whole frame); "then" sits
      // on top, clip-pathed to show only the LEFT portion. This way the LEFT
      // side of the slider shows the historic photo (labeled with thenLabel),
      // and the RIGHT side reveals the modern photo (nowLabel).
      const heroImg = hasComparison
        ? `<div class="hero-compare" data-compare="1" role="group" aria-label="Comparație înainte–acum">
             <img class="hero-compare-now" src="${escapeHtml(item.image_now)}" alt="${escapeHtml(titleTxt)} — ${escapeHtml(nowLabel)}" decoding="async">
             <img class="hero-compare-then" src="${escapeHtml(item.image_then)}" alt="${escapeHtml(titleTxt)} — ${escapeHtml(thenLabel)}" fetchpriority="high" decoding="async">
             <div class="hero-compare-handle" aria-hidden="true">
               <span class="hc-arrow hc-left">‹</span>
               <span class="hc-arrow hc-right">›</span>
             </div>
             <span class="hero-compare-label hc-label-then">${escapeHtml(thenLabel)}</span>
             <span class="hero-compare-label hc-label-now">${escapeHtml(nowLabel)}</span>
           </div>`
        : (item.image
          ? `<img class="hero-img" src="${escapeHtml(item.image)}" alt="${escapeHtml(titleTxt)}" fetchpriority="high" decoding="async">`
          : `<div class="hero-img hero-img-placeholder" aria-hidden="true"><span class="ph-eyebrow">${escapeHtml(catLabel || 'Obiectiv')}</span><svg class="ph-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="0"/><path d="M3 16l5-5 4 4 3-3 6 6"/><circle cx="9" cy="10" r="1.5"/></svg><span class="ph-note">${escapeHtml(heroPhNote)}</span></div>`);
      // Banner doar dacă lang=EN și NU avem deja conținut tradus pentru această locație
      const langEn = (typeof window.getLang === 'function' && window.getLang() === 'en');
      const enNoticeHtml = (langEn && !_hasEnContent(item))
        ? `<div id="detail-ro-notice">${escapeHtml(_tt('detail.no_translation'))}</div>`
        : '';
      const rawDescOrig = _locField(item, 'description') || _locField(item, 'excerpt') || '';
      const rawDesc = rawDescOrig.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
      const inlineProse = (s) => {
        let h = escapeHtml(s);
        // Markdown-lite: **bold** → <strong>
        h = h.replace(/\*\*([^*\n]+?)\*\*/g, '<strong>$1</strong>');
        return h;
      };
      const renderBlock = (block) => {
        const lines = block.split('\n').map(l => l.trim()).filter(Boolean);
        if (!lines.length) return '';
        const bulletRe = /^[•▪‣]\s*/;
        const bulletLines = lines.filter(l => bulletRe.test(l));
        // Whole block is a bullet list.
        if (bulletLines.length >= 2 && bulletLines.length === lines.length) {
          const items = lines.map(l => `<li>${inlineProse(l.replace(bulletRe, ''))}</li>`).join('');
          return `<ul class="prose-list">${items}</ul>`;
        }
        // Intro line followed by bullets.
        if (bulletLines.length >= 2 && !bulletRe.test(lines[0])) {
          const introIdx = lines.findIndex(l => bulletRe.test(l));
          const intro = lines.slice(0, introIdx).join(' ');
          const items = lines.slice(introIdx).filter(l => bulletRe.test(l))
            .map(l => `<li>${inlineProse(l.replace(bulletRe, ''))}</li>`).join('');
          return `<p>${inlineProse(intro)}</p><ul class="prose-list">${items}</ul>`;
        }
        // Single-line heading: short, ends with ':' (section marker).
        if (lines.length === 1 && lines[0].length < 140 && /:$/.test(lines[0])) {
          return `<h4 class="prose-h">${inlineProse(lines[0].replace(/:$/, ''))}</h4>`;
        }
        // Single-line heading: short, no sentence-ending punctuation.
        if (lines.length === 1 && lines[0].length < 60 && !/[.!?:]$/.test(lines[0])) {
          return `<h4 class="prose-h">${inlineProse(lines[0])}</h4>`;
        }
        return `<p>${lines.map(inlineProse).join('<br>')}</p>`;
      };
      let proseHtml = '';
      if (rawDesc.includes('\n\n')) {
        // Author-supplied paragraph breaks (manual override). Each \n\n is a paragraph block.
        proseHtml = rawDesc.split(/\n{2,}/).map(s => s.trim()).filter(Boolean).map(renderBlock).join('');
      } else {
        // Auto-paragraph by sentence boundaries when description is one big block.
        const sents = rawDesc.split(/(?<=\.)\s+(?=[A-ZĂÎȘȚÂ])/).filter(s => s.length > 8);
        if (sents.length > 1) {
          let buf = '';
          const out = [];
          sents.forEach(s => {
            if ((buf + ' ' + s).length > 380 && buf) { out.push(buf.trim()); buf = s; }
            else { buf = (buf ? buf + ' ' : '') + s; }
          });
          if (buf.trim()) out.push(buf.trim());
          proseHtml = out.map(p => `<p>${inlineProse(p)}</p>`).join('');
        } else {
          proseHtml = `<p>${inlineProse(rawDesc || 'Articol fără descriere disponibilă.')}</p>`;
        }
      }
      const restGallery = (item.gallery || []).filter(g => g.src !== item.image);
      // Show caption if explicitly set, OR if alt looks like sentence text (has
      // spaces, no file extension, not just slug-with-dashes). Auto-extracted
      // alt is usually a filename — those don't make captions.
      const isMeaningfulAlt = (s) => s && s.includes(' ') && !/\.(jpg|jpeg|png|webp|gif)$/i.test(s);
      const galleryTitle = _tt('detail.gallery');
      const galleryImgWord = restGallery.length === 1 ? _tt('detail.gallery.image') : _tt('detail.gallery.images');
      // Wrapper provides the right-edge fade gradient on mobile (swipe hint).
      // The .gallery itself stays the scrolling container; on desktop CSS turns
      // it into a vertical stack so all photos are visible at once.
      const galleryHtml = restGallery.length
        ? `<h3 class="section-title">${escapeHtml(galleryTitle)} · ${restGallery.length} ${escapeHtml(galleryImgWord)}</h3>
           <div class="gallery-wrap">
             <div class="gallery">
               ${restGallery.map(g => {
                 const cap = (g.caption || (isMeaningfulAlt(g.alt) ? g.alt : '')).trim();
                 const figcap = cap ? `<figcaption>${escapeHtml(cap)}</figcaption>` : '';
                 return `<figure data-caption="${escapeHtml(cap)}"><img src="${escapeHtml(g.src)}" alt="${escapeHtml(g.alt || item.title)}" loading="lazy" decoding="async">${figcap}</figure>`;
               }).join('')}
             </div>
           </div>`
        : '';
      const sourceHtml = '';
      // Pilot AR — atașat la punctele care fac parte din experiența Piața Regală
      const AR_PILOT_LOC_IDS = ['loc-84', 'loc-127', 'loc-135', 'loc-255'];  // Statuia Negri, Bodega Suré, Cinema Louvru, Piața Regală
      const arPilotHtml = AR_PILOT_LOC_IDS.includes(item.id)
        ? `<div class="ar-pilot-card">
             <div class="ar-pilot-badge">🥽 PILOT AR</div>
             <h4>Vezi Piața Regală așa cum a fost</h4>
             <p>Reconstrucție în Realitate Augmentată a celor 5 clădiri-emblemă (Hotel Imperial, Hotel Splendid, Casa Helder, Statuia Negri, Bodega Suré) distruse de armata germană în noaptea de 24-25 august 1944.</p>
             <a href="piata-regala-ar.html" class="ar-pilot-btn">Pornește experiența →</a>
           </div>`
        : '';
      detailScroll.innerHTML = `
        <span class="num-large" aria-hidden="true">${iconSvg(item.category, 28)}</span>
        <h2>${escapeHtml(titleTxt)}</h2>
        ${locationTxt && locationTxt !== titleTxt ? `<p class="addr">${escapeHtml(locationTxt)}</p>` : ''}
        ${heroImg}
        ${enNoticeHtml}
        ${galleryHtml}
        <div class="prose">${proseHtml}</div>
        ${sourceHtml}
        ${arPilotHtml}
      `;
      detail.dataset.open = '1';
      detail.setAttribute('aria-hidden', 'false');
      detailScroll.scrollTop = 0;
      // If the rendered hero is a before/after comparison, wire up the slider.
      const compareEl = detailScroll.querySelector('.hero-compare[data-compare="1"]');
      if (compareEl) initBeforeAfter(compareEl);
      // Update deep link URL (?loc=ID)
      if (typeof window.__updateDeepLink === 'function') {
        const params = { loc: id };
        if (activeTour) params.tour = activeTour.id;
        window.__updateDeepLink(params);
      }
      if (activeTour) drawTourRoute();
      // NB: hero + gallery image clicks are handled by a single delegated
      // listener attached once on detailScroll (see below, outside render).
    }

    // ── Lightbox: gallery mode ─────────────────────────────────────────
    // The hero + gallery photos of the active detail form a queue the user can
    // swipe through (mobile) or step with ‹/› buttons + arrow keys (desktop).
    // Coexists with the pubcrawl queue (lightboxQueue): only one is active at a
    // time. `lightboxGalleryItems.length > 0` means gallery mode is active.
    let lightboxGalleryItems = [];
    let lightboxGalleryIdx = 0;

    // Build items for the active detail: hero first, then gallery (deduped).
    function buildDetailLightboxItems() {
      const it = locations.find(l => l.id === activeId);
      if (!it) return [];
      const items = [];
      if (it.image) {
        items.push({ src: it.image, caption: _locField(it, 'title') || '', alt: _locField(it, 'title') || '' });
      }
      (it.gallery || []).forEach(g => {
        if (g.src === it.image) return; // skip duplicate hero
        const lang = (typeof window.getLang === 'function') ? window.getLang() : 'ro';
        const cap = (lang === 'en' && g.caption_en) ? g.caption_en : (g.caption || g.alt || '');
        items.push({ src: g.src, caption: cap, alt: g.alt || '', year: g.year });
      });
      return items;
    }

    function openLightboxGallery(items, startIdx) {
      if (!items || !items.length) return;
      lightboxGalleryItems = items;
      lightboxGalleryIdx = Math.max(0, Math.min(items.length - 1, startIdx || 0));
      // Clear pubcrawl state so navigation routes to gallery
      if (typeof lightboxAnchor !== 'undefined') lightboxAnchor = null;
      if (typeof lightboxQueue !== 'undefined') lightboxQueue = [];
      displayGalleryLightbox(lightboxGalleryIdx);
      lightbox.dataset.open = '1';
    }

    function displayGalleryLightbox(idx) {
      const item = lightboxGalleryItems[idx];
      if (!item) return;
      lightboxGalleryIdx = idx;
      lightboxImg.src = item.src;
      lightboxImg.alt = item.alt || item.caption || '';
      const yearTag = item.year ? `<span class="lb-year-tag">${escapeHtml(String(item.year))}</span>` : '';
      const text = item.caption || '';
      lightboxCaption.innerHTML = `${yearTag}${escapeHtml(text)}`;
      lightboxCaption.hidden = !text && !item.year;

      const total = lightboxGalleryItems.length;
      const prev = document.getElementById('lightbox-prev');
      const next = document.getElementById('lightbox-next');
      const counter = document.getElementById('lightbox-counter');
      if (prev) prev.hidden = total <= 1 || idx <= 0;
      if (next) next.hidden = total <= 1 || idx >= total - 1;
      if (counter) {
        if (total > 1) {
          counter.textContent = `${idx + 1} / ${total}`;
          counter.hidden = false;
        } else {
          counter.hidden = true;
        }
      }
    }

    // Legacy single-image opener — kept for callers that pass an arbitrary src
    // without a gallery context. Clears both queues so no navigation is offered.
    function openImageInLightbox(src, alt, caption) {
      lightboxImg.src = src;
      lightboxImg.alt = alt || '';
      lightboxCaption.textContent = caption || '';
      lightboxCaption.hidden = !caption;
      lightbox.dataset.open = '1';
      lightboxGalleryItems = [];
      if (typeof lightboxQueue !== 'undefined') {
        lightboxQueue = [];
        const prev = document.getElementById('lightbox-prev');
        const next = document.getElementById('lightbox-next');
        const counter = document.getElementById('lightbox-counter');
        if (prev) prev.hidden = true;
        if (next) next.hidden = true;
        if (counter) counter.hidden = true;
      }
    }

    // Wire up a before/after comparison slider on a .hero-compare container.
    // The "now" image is wrapped in a div whose width is updated as the user
    // drags the handle; the "then" image fills the entire frame underneath.
    // Pointer events cover mouse + touch + pen uniformly.
    function initBeforeAfter(root) {
      if (!root || root.dataset.compareInit === '1') return;
      const thenImg = root.querySelector('.hero-compare-then');
      const handle = root.querySelector('.hero-compare-handle');
      if (!thenImg || !handle) return;
      root.dataset.compareInit = '1';

      // The "then" image overlays the base "now" image; we clip-path it so only
      // the LEFT pct% is visible. The right side reveals the "now" image
      // underneath. Handle position tracks the boundary.
      const applyPct = (pct) => {
        pct = Math.max(0, Math.min(100, pct));
        thenImg.style.clipPath = `inset(0 ${100 - pct}% 0 0)`;
        handle.style.left = pct + '%';
        root.dataset.pct = String(pct);
      };
      const setFromClientX = (clientX) => {
        const rect = root.getBoundingClientRect();
        if (rect.width === 0) return;
        applyPct(((clientX - rect.left) / rect.width) * 100);
      };
      applyPct(50);

      let dragging = false;
      const onDown = (e) => {
        dragging = true;
        root.classList.add('is-dragging');
        if (e.pointerId !== undefined) root.setPointerCapture(e.pointerId);
        setFromClientX(e.clientX);
        e.preventDefault();
      };
      const onMove = (e) => {
        if (!dragging) return;
        setFromClientX(e.clientX);
      };
      const onUp = (e) => {
        if (!dragging) return;
        dragging = false;
        root.classList.remove('is-dragging');
        if (e.pointerId !== undefined && root.hasPointerCapture(e.pointerId)) {
          root.releasePointerCapture(e.pointerId);
        }
      };
      root.addEventListener('pointerdown', onDown);
      root.addEventListener('pointermove', onMove);
      root.addEventListener('pointerup', onUp);
      root.addEventListener('pointercancel', onUp);
      root.addEventListener('pointerleave', onUp);
      // Keyboard support for the handle (a11y)
      handle.tabIndex = 0;
      handle.addEventListener('keydown', (e) => {
        const step = e.shiftKey ? 10 : 2;
        const cur = parseFloat(root.dataset.pct || '50');
        if (e.key === 'ArrowLeft')       { applyPct(cur - step); e.preventDefault(); }
        else if (e.key === 'ArrowRight') { applyPct(cur + step); e.preventDefault(); }
      });
    }

    // Delegated click handler: catches hero/gallery image taps regardless of when
    // they were inserted into the DOM. Attached ONCE here (not per-render) so a
    // race condition with mobile touch timing or stale listener references can't
    // break it. Was broken on mobile (Galaxy S22 Chrome) when attached per-render.
    detailScroll.addEventListener('click', (e) => {
      // Inside a before/after compare frame, suppress the lightbox — the user
      // is dragging the slider, not asking to enlarge the photo.
      if (e.target.closest('.hero-compare')) return;
      const hero = e.target.closest('img.hero-img');
      if (hero) {
        // Hero opens a queue starting at index 0 so user can swipe to gallery
        const items = buildDetailLightboxItems();
        openLightboxGallery(items, 0);
        return;
      }
      const gal = e.target.closest('.gallery figure img');
      if (gal) {
        const items = buildDetailLightboxItems();
        // Match by the raw attribute value, not gal.src — the DOM .src property
        // resolves to a full absolute URL, but item.src is the relative path
        // straight from locations.json. They never match as full strings.
        const galAttrSrc = gal.getAttribute('src') || '';
        const idx = items.findIndex(it => it.src === galAttrSrc);
        openLightboxGallery(items, idx < 0 ? 0 : idx);
      }
    });

    function closeDetail() {
      delete detail.dataset.open;
      detail.setAttribute('aria-hidden', 'true');
      if (activeTour) drawTourRoute();
      // Reset deep link (păstrăm doar tour/hunt activ, dacă există)
      if (typeof window.__updateDeepLink === 'function') {
        const params = {};
        if (activeTour) params.tour = activeTour.id;
        window.__updateDeepLink(params);
      }
    }

    closeBtn.addEventListener('click', closeDetail);
    // Track which pubcrawl photo (if any) is currently shown in lightbox so
    // the "Editează" button can pre-fill the modal.
    let activePhoto = null;
    function closeLightbox() {
      delete lightbox.dataset.open;
      lightboxGalleryItems = [];
    }
    lightbox.addEventListener('click', (e) => {
      // Don't dismiss when clicking the edit button or nav arrows
      if (e.target.closest('.lightbox-edit')) return;
      if (e.target.closest('.lightbox-nav')) return;
      // Tap on the image OR backdrop both close
      closeLightbox();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (lightbox.dataset.open) { closeLightbox(); }
        else if (detail.dataset.open) { closeDetail(); }
      }
    });

    search.addEventListener('input', render);
    category.addEventListener('change', render);

    // ─── Filter chips ────────────────────────────────────────────
    const chipsEl = document.getElementById('filter-chips');
    chipsEl.querySelectorAll('.chip').forEach(chip => {
      chip.addEventListener('click', () => {
        activeFilter = chip.dataset.filter;
        const groupRow = chip.closest('.filter-group-row');
        if (groupRow) {
          groupRow.querySelectorAll('.chip').forEach(c => {
            const isActive = c === chip;
            c.classList.toggle('active', isActive);
            c.setAttribute('aria-pressed', isActive ? 'true' : 'false');
          });
        }
        render();
      });
    });

    // ─── Timeline slider ─────────────────────────────────────────
    const timelineEl = document.getElementById('timeline-control');
    const timelineSlider = document.getElementById('timeline-slider');
    const timelineReset = document.getElementById('timeline-reset');
    const yearOverlay = document.getElementById('map-year-overlay');
    const yearNumOut = document.getElementById('year-num');
    const yearFlag = document.getElementById('year-flag');
    const yearEntityName = document.getElementById('year-entity-name');
    const yearEraDot = document.getElementById('year-era-dot');
    const yearEraName = document.getElementById('year-era-name');
    const yearPopOut = document.getElementById('year-pop');
    const yearMetaSep = document.getElementById('year-meta-sep');

    // Date demografice Galați — surse: cronologia subiectivă (Cilinca, vol I-X),
    // catagrafii moldovenești 1818-1845, recensăminte 1859/1866/1881/1885/1895/1899,
    // cheatsheet (1913, 1923, 1939), recensăminte INS (1948-2021).
    //
    // Pre-1800: nu avem date demografice fiabile. Două estimări istorice
    // adesea citate (15.000 în 1596 după Verbiceanu, 15.000 în 1683 după un
    // călător armean) sunt aproape sigur exagerate — Galațiul era târg
    // pescăresc moldovean cu doar câteva mii de locuitori în sec. XVI-XVII,
    // afectat repetat de invazii tătare (1596, 1612, 1623, 1659, 1711),
    // ciume (1652, 1729-39, 1758) și războaie ruso-turce (1769, 1789).
    // Le-am scos pentru a nu distorsiona graficul.
    const populationData = [
      {year: 1800, pop: 7000,  src: 'Populația Galațiului: 7.000 (cronologie)'},
      {year: 1818, pop: 5000,  src: 'Populația oraşului: 5.000 (cronologie 1818)'},
      {year: 1829, pop: 7000,  src: 'Populația oraşului: 7.000 (cronologie 1829)'},
      {year: 1831, pop: 8605,  src: 'populația Galați era de 8.605 (cronologie 1831)'},
      {year: 1836, pop: 9908,  src: 'Populația oraşului: 9.908 (cronologie 1836)'},
      {year: 1842, pop: 18066, src: 'Populația oraşului era de 18.066 (cronologie 1842)'},
      {year: 1843, pop: 20000, src: 'Populația orașului trecea de 20.000 (cronologie 1843)'},
      {year: 1845, pop: 24000, src: 'catagrafia 1845'},
      {year: 1859, pop: 40105, src: 'primul recensământ serios — 40.105 suflete (Moise Pacu, Cartea jud. Covurlui)'},
      {year: 1861, pop: 30000, src: 'Populația Galaților numără 30.000 (cronologie 1861)'},
      {year: 1866, pop: 48799, src: 'recensământ 1866'},
      {year: 1871, pop: 48789, src: '48.789 locuitori (raport Alex. Moruzzi 1871)'},
      {year: 1879, pop: 40022, src: 'populație stabilă de 40.022 (cronologie 1879)'},
      {year: 1881, pop: 40022, src: 'recensământ 1881'},
      {year: 1885, pop: 44096, src: 'recensământ 1885'},
      {year: 1895, pop: 56420, src: 'recensământ 1895'},
      {year: 1899, pop: 62545, src: 'catagrafia 1899'},
      {year: 1900, pop: 62678, src: 'Populația oraşului: 62.678 (cronologie 1900)'},
      {year: 1913, pop: 71641, src: '1913 — al treilea oraș al țării'},
      {year: 1923, pop: 100000, src: 'cca. 100.000 (1923)'},
      {year: 1939, pop: 100000, src: 'pre-WW2 (~1939)'},
      {year: 1948, pop: 80411, src: 'recensământ 1948'},
      {year: 1956, pop: 95646, src: 'recensământ 1956'},
      {year: 1966, pop: 151412, src: 'recensământ 1966'},
      {year: 1977, pop: 238292, src: 'recensământ 1977'},
      {year: 1992, pop: 326141, src: 'recensământ 1992 — vârf'},
      {year: 2002, pop: 298861, src: 'recensământ 2002'},
      {year: 2011, pop: 249432, src: 'recensământ 2011'},
      {year: 2021, pop: 217851, src: 'recensământ 2021'},
    ];
    function populationAt(year) {
      // Pre-1683: nu avem date demografice solide
      if (year < populationData[0].year) return null;
      // Post 2021: folosim ultima
      if (year >= populationData[populationData.length-1].year) {
        return populationData[populationData.length-1];
      }
      // Interpolare liniară între cele 2 puncte mai apropiate
      for (let i = 0; i < populationData.length - 1; i++) {
        const a = populationData[i], b = populationData[i+1];
        if (year >= a.year && year <= b.year) {
          if (year === a.year) return a;
          if (year === b.year) return b;
          const t = (year - a.year) / (b.year - a.year);
          const interp = Math.round(a.pop + t * (b.pop - a.pop));
          return {year, pop: interp, src: `interpolat ${a.year}–${b.year}`, interpolated: true};
        }
      }
      return null;
    }
    function fmtPop(n) {
      // Format românesc: 100.000 / 1.250.000
      return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    }
    const timelineCurrentEvent = document.getElementById('timeline-current-event');
    const timelineEventEls = [...document.querySelectorAll('.timeline-events .event')];

    // Chronology entries — loaded async from cronologie.json. Used to enrich
    // the slider tooltip without adding extra dots to the timeline track.
    let chronologyEvents = [];
    let chronologyRaw = [];
    function _rebuildChronologyLabels() {
      const lang = (typeof window.getLang === 'function') ? window.getLang() : 'ro';
      chronologyEvents = chronologyRaw.map((e) => ({
        year: e.year,
        year_end: e.year_end || null,
        // EN: folosim label_en pre-calculat (text deja truncat și tradus).
        // RO: rulăm chronologyLabel pe textul brut (truncare + curățare patternuri RO).
        label: (lang === 'en' && e.label_en) ? e.label_en : chronologyLabel(e.text),
      }));
    }
    fetch('./cronologie.json')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data || !Array.isArray(data.entries)) return;
        chronologyRaw = data.entries;
        _rebuildChronologyLabels();
        if (timelineYear !== null) updateTimelineDisplay();
      })
      .catch(() => {});
    // Re-build labels (chosen language) on langchange
    window.addEventListener('langchange', () => {
      try { _rebuildChronologyLabels(); } catch (e) {}
    });

    function chronologyLabel(text) {
      if (!text) return '';
      // Strip "Pârcălab - X" / "Primar(i) - X * Prefect - Y" rosters: those
      // belong on the Liste page, the tooltip should describe what HAPPENED
      // that year.
      let body = text.trim();
      body = body.replace(/^P[âa]rc[ăa]lab\s*[-–]\s*[^.]+?(?=\s+(?:\d{1,2}\s+(?:ianuarie|februarie|martie|aprilie|mai|iunie|iulie|august|septembrie|octombrie|noiembrie|decembrie)|Luna\s|[A-ZĂÎȘȚÂ]))/i, '');
      body = body.replace(/^Primar[i]?\s*[-–:]\s*[^*]*?\*\s*Prefec[tţți][i]?\s*[-–]\s*[^.]+?(?=\s+(?:\d{1,2}\s+(?:ianuarie|februarie|martie|aprilie|mai|iunie|iulie|august|septembrie|octombrie|noiembrie|decembrie)|Luna\s|[A-ZĂÎȘȚÂ]))/i, '');
      body = body.replace(/^Popula[țt]i[aei][^.]+\.\s*/i, '');
      body = body.trim();
      // Strip leading date prefix
      const DATE_PREFIX = /^(?:\d{1,2}(?:[-–]\d{1,2})?\s+(?:ianuarie|februarie|martie|aprilie|mai|iunie|iulie|august|septembrie|octombrie|noiembrie|decembrie)(?:\s+\d{4})?|Luna\s+(?:ianuarie|februarie|martie|aprilie|mai|iunie|iulie|august|septembrie|octombrie|noiembrie|decembrie)|În\s+luna\s+\w+|Toamna|Primăvara|Vara|Iarna|La\s+\d{1,2}\s+\w+|Înainte\s+de\s+\d{4})\.\s*/i;
      body = body.replace(DATE_PREFIX, '').trim();
      // Cap to ~260 chars at sentence boundary
      const MAX = 260;
      if (body.length <= MAX) return body;
      let cut = body.lastIndexOf('. ', MAX);
      if (cut < 120) cut = body.indexOf('. ', MAX);
      if (cut < 0) cut = MAX;
      let head = body.slice(0, cut + 1).trim();
      if (!/[.!?]$/.test(head)) head += '.';
      return head + ' …';
    }

    // Comprehensive events list — shown in tag overlay even if no visible circle.
    // Source: Surse/evenimente-istorice-galati.md
    const allEvents = [
      { year: 1445, label: 'Prima atestare documentară · uricul lui Ștefan al II-lea (23 sept) — scutire de vamă pentru două căruțe cu pește livrate Mănăstirii Humor', label_en: 'First documentary attestation · the deed of Stephen II (23 Sept) — customs exemption for two carts of fish delivered to Humor Monastery' },
      { year: 1530, label: 'Stelița lui Petru Rareș (palat domnesc fortificat la malul Dunării)', label_en: "Petru Rareș's stelița (fortified princely palace on the Danube bank)" },
      { year: 1600, label: 'Mihai Viteazul își stabilește o tabără la Galați înainte de campania moldoveană', label_en: 'Michael the Brave sets up camp at Galați before his Moldavian campaign' },
      { year: 1538, label: 'Soliman Magnificul invadează Moldova · suzeranitate otomană directă (Galați rămâne moldovenesc, niciodată parte din raiale)', label_en: 'Suleiman the Magnificent invades Moldavia · direct Ottoman suzerainty (Galați remains Moldavian, never part of the raias)' },
      { year: 1540, label: 'Brăila cucerită de turci · devine raialaua Brăilei (50 de sate, până în 1829) · Galați devine principalul port moldovean de comerț', label_en: 'Brăila conquered by the Turks · becomes the Brăila raia (50 villages, until 1829) · Galați becomes the main Moldavian trading port' },
      { year: 1645, label: 'Biserica fortificată Sf. Precista ridicată de Vasile Lupu — cea mai veche clădire din Galați', label_en: 'The fortified St. Precista Church built by Vasile Lupu — the oldest building in Galați' },
      { year: 1700, label: 'Biserica Mavromol (ctitorie Antioh Cantemir) — centrul comunității greco-comerciale', label_en: 'Mavromol Church (founded by Antioh Cantemir) — centre of the Greek merchant community' },
      { year: 1709, label: 'Hatmanul cazac Ivan Mazepa îngropat la biserica Sf. Gheorghe după bătălia de la Poltava', label_en: 'Cossack hetman Ivan Mazepa buried at St. George Church after the Battle of Poltava' },
      { year: 1789, label: 'Distrugere · războiul ruso-turc · primul incendiu major al orașului', label_en: "Destruction · Russo-Turkish War · the city's first major fire" },
      { year: 1821, label: 'Eteria · grecii lui Vasile Karavia atacă garnizoana otomană · oraș incendiat', label_en: "Heterist uprising · Vasile Karavia's Greeks attack the Ottoman garrison · the city is set on fire" },
      { year: 1828, label: 'Primul consulat la Galați — Franța', label_en: 'First consulate in Galați — France' },
      { year: 1829, label: 'Pacea de la Adrianopol · liberalizarea comerțului dunărean · ieșire de sub turci', label_en: 'Treaty of Adrianople · liberalisation of Danubian trade · end of Turkish rule' },
      { year: 1834, label: 'Consulat Prusia (al treilea, după Belgia 1832)', label_en: 'Prussian consulate (the third, after Belgium 1832)' },
      { year: 1837, label: 'Port liber declarat oficial · vapoare din Marsilia, Genova, Constantinopol fără taxe', label_en: 'Free port officially declared · ships from Marseille, Genoa, Constantinople tax-free' },
      { year: 1842, label: 'Prima fabrică de bere — Marcu Schein, preluată de Josef Ploll în 1860', label_en: 'First brewery — Marcu Schein, taken over by Josef Ploll in 1860' },
      { year: 1853, label: 'Inundație devastatoare a Dunării (prima dintr-o serie 1853–1861)', label_en: 'Devastating Danube flood (first of a 1853–1861 series)' },
      { year: 1856, label: 'Comisia Europeană a Dunării · prima organizație supranațională europeană · sediul la Galați', label_en: 'European Commission of the Danube · the first European supranational organisation · headquartered in Galați' },
      { year: 1860, label: 'Inundație majoră a Dunării', label_en: 'Major Danube flood' },
      { year: 1861, label: 'Inundație majoră a Dunării (a treia într-un deceniu)', label_en: 'Major Danube flood (the third in a decade)' },
      { year: 1862, label: 'Cuza Vodă cumpără casa de pe Domnească 80 (azi muzeul Casa Cuza)', label_en: 'Cuza Vodă buys the house at Domnească 80 (today the Casa Cuza Museum)' },
      { year: 1866, label: 'Recensământ — 48.799 locuitori (vârful intermediar)', label_en: 'Census — 48,799 inhabitants (the interim peak)' },
      { year: 1877, label: 'România declară independența · Reg. 11 Siret pe front în Bulgaria', label_en: 'Romania declares independence · 11th Siret Regiment on the front in Bulgaria' },
      { year: 1882, label: 'Sfârșit port liber · Galați intră în vama națională', label_en: 'End of the free port · Galați joins the national customs system' },
      { year: 1893, label: 'Fondat Șantierul Naval Fernic — peste 2.000 angajați la apogeu', label_en: 'Fernic Shipyard founded — over 2,000 employees at its peak' },
      { year: 1899, label: 'Galațiul are 22 sinagogi active', label_en: 'Galați has 22 active synagogues' },
      { year: 1902, label: 'Dimitrie Frigator lasă prin testament 700.000 lei aur (~12 mil. EUR) pentru filantropie', label_en: 'Dimitrie Frigator bequeaths 700,000 gold lei (~€12 million) for philanthropy' },
      { year: 1905, label: 'Prima cursă auto intercontinentală din lume — Galați → Ispahan (3 mașini, 2 luni)', label_en: "The world's first intercontinental car race — Galați → Isfahan (3 cars, 2 months)" },
      { year: 1907, label: 'Răscoala țărănească · represiune sângeroasă · Reg. 11 Siret implicat', label_en: 'Peasants\' uprising · bloody repression · 11th Siret Regiment involved' },
      { year: 1911, label: 'Inaugurată statuia Eminescu de Frederic Storck — prima din România', label_en: "Eminescu statue by Frederic Storck unveiled — Romania's first" },
      { year: 1912, label: 'Gheorghe Gheorghiu-Dej lucrează ca hamal în port (apoi atelierele CFR)', label_en: 'Gheorghe Gheorghiu-Dej works as a porter in the harbour (then the CFR workshops)' },
      { year: 1913, label: 'Galați — al treilea oraș al țării (71.641 loc.) · Al Doilea Război Balcanic', label_en: "Galați — the country's third-largest city (71,641 inh.) · Second Balkan War" },
      { year: 1916, label: 'România intră în Primul Război Mondial (15 august) · începe asediul de 1,4 ani', label_en: 'Romania enters the First World War (15 August) · the 1.4-year siege begins' },
      { year: 1918, label: 'Bătălia de la Galați (22 ianuarie) · Unirea cu Basarabia (27 martie) · ~3.000 vs ~12.000 (Kiriţescu); ~500 vs 12.000 în memoria populară', label_en: 'Battle of Galați (22 January) · Union with Bessarabia (27 March) · ~3,000 vs ~12,000 (Kirițescu); ~500 vs 12,000 in popular memory' },
      { year: 1920, label: 'Inaugurat Aeroportul Galați — funcțional până 1958, cu vamă', label_en: 'Galați Airport inaugurated — operating until 1958, with customs' },
      { year: 1921, label: 'Crucea de Război italiană („La Croce di Guerra") · gen. Pietro Badoglio o aduce la Galați', label_en: 'Italian Cross of War ("La Croce di Guerra") · Gen. Pietro Badoglio brings it to Galați' },
      { year: 1921, label: 'Sosește samuraiul Shintaro Tsutsumi cu nava „Kilimaru" · moare aici', label_en: 'The samurai Shintaro Tsutsumi arrives aboard the "Kilimaru" · dies here' },
      { year: 1922, label: 'Gen. Henri Berthelot decorează Galațiul cu „Croix de Guerre" franceză', label_en: 'Gen. Henri Berthelot decorates Galați with the French "Croix de Guerre"' },
      { year: 1923, label: 'Galați — 100.000 locuitori, 295 străzi, 15 km tramvai', label_en: 'Galați — 100,000 inhabitants, 295 streets, 15 km of tramway' },
      { year: 1926, label: 'Primul zbor cu pasager plătitor — Anninos (1.800 lei, de 4× prețul biletului de tren)', label_en: 'First flight with a paying passenger — Anninos (1,800 lei, 4× the price of a train ticket)' },
      { year: 1929, label: 'Sinucidere sculptorul Dimitrie Măţăuanu — autorul bustului România Mare neturnat', label_en: 'Sculptor Dimitrie Mățăuanu commits suicide — author of the never-cast Greater Romania bust' },
      { year: 1932, label: 'Smaranda Brăescu sare cu parașuta de la 7.000 m — record mondial femei', label_en: "Smaranda Brăescu parachutes from 7,000 m — women's world record" },
      { year: 1934, label: 'Fondată Filatura Atlantic de frații armeni Seferian', label_en: 'Atlantic Spinning Mill founded by the Armenian Seferian brothers' },
      { year: 1938, label: 'Carol al II-lea + iahtul „Luceafărul" în Galați · întâlnire diplomatică Polonia (criza München)', label_en: 'Carol II + the yacht "Luceafărul" in Galați · diplomatic meeting with Poland (Munich crisis)' },
      { year: 1940, label: 'Pierderea Basarabiei și Bucovinei (28 iun) — refugiați masivi prin Galați', label_en: 'Loss of Bessarabia and Bukovina (28 June) — massive flow of refugees through Galați' },
      { year: 1940, label: 'Cutremur Vrancea (10 nov) · M 7,7 · pagube majore în oraș', label_en: 'Vrancea earthquake (10 Nov) · M 7.7 · major damage in the city' },
      { year: 1941, label: 'Pogromul de la Iași (28-30 iun) + ecou la Galați — comunitatea evreiască decimată', label_en: 'Iași pogrom (28-30 June) + echo in Galați — the Jewish community decimated' },
      { year: 1941, label: 'România reintră în Basarabia · frații Mendel (șantier naval) trimiși în Transnistria', label_en: 'Romania re-enters Bessarabia · the Mendel brothers (shipyard) sent to Transnistria' },
      { year: 1943, label: 'Bombardamentele aliate americane — multiple raiduri pe șantierul naval', label_en: 'American Allied bombings — multiple raids on the shipyard' },
      { year: 1944, label: '23 august — lovitura de stat anti-Antonescu · România întoarce armele', label_en: '23 August — anti-Antonescu coup · Romania switches sides' },
      { year: 1944, label: 'Retragere germană (24-25 aug) · Piața Regală devastată · niciodată reconstruită', label_en: 'German withdrawal (24-25 Aug) · the Royal Square devastated · never rebuilt' },
      { year: 1944, label: 'Galați ocupat de Armata Sovietică (26 aug)', label_en: 'Galați occupied by the Soviet Army (26 Aug)' },
      { year: 1948, label: 'Naționalizare · Liceul Israelit închis · industriile expropriate', label_en: 'Nationalisation · Israelite High School closed · industries expropriated' },
      { year: 1952, label: 'Campania anti-cosmopolită · medicii evrei dați afară din Spitalul Israelit', label_en: 'Anti-cosmopolitan campaign · Jewish doctors expelled from the Israelite Hospital' },
      { year: 1958, label: 'Aeroportul Galați închis definitiv', label_en: 'Galați Airport permanently closed' },
      { year: 1962, label: 'Demolare biserica Sf. Gheorghe (decembrie) — trasă în Dunăre cu remorcherele Navrom', label_en: 'St. George Church demolished (December) — pulled into the Danube by Navrom tugboats' },
      { year: 1963, label: 'Demolarea bisericii Sf. Sofia (decembrie) · sistematizare comunistă', label_en: 'St. Sophia Church demolished (December) · communist systematisation' },
      { year: 1964, label: 'Inaugurat Cinematograful Țiglina (13 apr) · sală Cinemascop 800 locuri', label_en: 'Țiglina Cinema inaugurated (13 Apr) · 800-seat Cinemascope hall' },
      { year: 1965, label: 'Campionatul Mondial de pescuit staționar la Galați — RO campioană', label_en: 'World Coarse Angling Championship in Galați — Romania champion' },
      { year: 1966, label: 'Decret pentru Combinatul Siderurgic · 12.000 muncitori la construcție', label_en: 'Decree for the Steel Combine · 12,000 workers on the construction site' },
      { year: 1967, label: 'Combinatul produce primul oțel', label_en: 'The Combine produces its first steel' },
      { year: 1969, label: 'Inaugurată Casa de Cultură a Sindicatelor (4 oct) · închinată lui Gheorghiu-Dej', label_en: 'Trade Unions House of Culture inaugurated (4 Oct) · dedicated to Gheorghiu-Dej' },
      { year: 1970, label: 'Inundațiile catastrofale ale Siretului (mai) · pagube imense în luncă', label_en: 'Catastrophic Siret floods (May) · huge damage on the floodplain' },
      { year: 1971, label: 'Pe esplanadă — bustul Gheorghe Gheorghiu-Dej', label_en: 'On the esplanade — the bust of Gheorghe Gheorghiu-Dej' },
      { year: 1972, label: 'Inaugurată Sala Sporturilor „Dunărea"', label_en: '"Dunărea" Sports Hall inaugurated' },
      { year: 1977, label: 'Cutremur Vrancea (4 mar) · M 7,4 · accelerează sistematizarea', label_en: 'Vrancea earthquake (4 March) · M 7.4 · accelerates systematisation' },
      { year: 1989, label: 'Revoluția (22 dec) · bustul Gheorghiu-Dej dărâmat de mulțime', label_en: 'The Revolution (22 Dec) · the Gheorghiu-Dej bust torn down by the crowd' },
      { year: 1990, label: 'Universitatea „Dunărea de Jos" își ia denumirea actuală', label_en: '"Dunărea de Jos" University takes its current name' },
      { year: 2001, label: 'Combinatul privatizat · LNM Holdings (devenit ArcelorMittal în 2006)', label_en: 'The Combine privatised · LNM Holdings (became ArcelorMittal in 2006)' },
      { year: 2007, label: 'România intră în Uniunea Europeană · 1 ianuarie', label_en: 'Romania joins the European Union · 1 January' },
      { year: 2010, label: 'Inundațiile Prutului (iulie) · stare de urgență · zeci de localități afectate', label_en: 'Prut floods (July) · state of emergency · dozens of villages affected' },
      { year: 2014, label: 'Restaurată Sinagoga Templul Meseriașilor (singura activă din 22)', label_en: "Craftsmen's Temple Synagogue restored (the only active one of 22)" },
      { year: 2018, label: 'Centenarul Marii Uniri — restaurări Palatul Comisiei Europene a Dunării', label_en: 'Centenary of the Great Union — restoration of the European Commission of the Danube Palace' },
    ];

    // ─── Flags by political entity ─────────────────────────────────
    // Simplified inline SVGs (~150 bytes each).
    // Galațiul a făcut parte succesiv din: Moldova princiară (până la Unirea
    // din 24 ian. 1859), Principatele Unite (1859-1881), Regatul României
    // (1881-1947), RPR/RSR (1947-1989), România modernă (1989-prezent).
    const FLAG_MOLDOVA = `<svg viewBox="0 0 30 20" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
      <rect width="30" height="20" fill="#c8102e"/>
      <ellipse cx="15" cy="11.5" rx="3.2" ry="3.6" fill="#fcd116"/>
      <path d="M12.3 9 Q9.5 5.5 11 3" stroke="#fcd116" stroke-width="1" fill="none" stroke-linecap="round"/>
      <path d="M17.7 9 Q20.5 5.5 19 3" stroke="#fcd116" stroke-width="1" fill="none" stroke-linecap="round"/>
      <circle cx="13.8" cy="11" r="0.45" fill="#1a1a1a"/>
      <circle cx="16.2" cy="11" r="0.45" fill="#1a1a1a"/>
      <circle cx="15" cy="6.5" r="0.7" fill="#fff"/>
    </svg>`;
    const FLAG_PRINCIPATE = `<svg viewBox="0 0 30 20" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
      <rect width="30" height="6.67" y="0"     fill="#ce1126"/>
      <rect width="30" height="6.67" y="6.67"  fill="#fcd116"/>
      <rect width="30" height="6.67" y="13.33" fill="#002b7f"/>
      <g fill="#7a4f12" stroke="#1a1a1a" stroke-width="0.15">
        <ellipse cx="15" cy="10" rx="2.6" ry="1.6" fill="#fcd116" stroke="#7a4f12" stroke-width="0.4"/>
        <text x="15" y="11.3" text-anchor="middle" font-size="2.4" font-family="serif" font-weight="bold" fill="#7a4f12">UPR</text>
      </g>
    </svg>`;
    const FLAG_REGAT = `<svg viewBox="0 0 30 20" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
      <rect width="10" height="20" x="0"  fill="#002b7f"/>
      <rect width="10" height="20" x="10" fill="#fcd116"/>
      <rect width="10" height="20" x="20" fill="#ce1126"/>
      <g stroke="#5d3a09" stroke-width="0.2">
        <path d="M11.5 11 L13 8 L14 10 L15 7 L16 10 L17 8 L18.5 11 L18.5 13 L11.5 13 Z" fill="#7a4f12"/>
        <circle cx="13" cy="8" r="0.5" fill="#fff"/>
        <circle cx="15" cy="7" r="0.5" fill="#fff"/>
        <circle cx="17" cy="8" r="0.5" fill="#fff"/>
      </g>
    </svg>`;
    const FLAG_RSR = `<svg viewBox="0 0 30 20" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
      <rect width="10" height="20" x="0"  fill="#002b7f"/>
      <rect width="10" height="20" x="10" fill="#fcd116"/>
      <rect width="10" height="20" x="20" fill="#ce1126"/>
      <circle cx="15" cy="10" r="3" fill="#fcd116" stroke="#5d3a09" stroke-width="0.4"/>
      <polygon points="15,7.6 15.65,9.4 17.45,9.4 16,10.5 16.55,12.3 15,11.2 13.45,12.3 14,10.5 12.55,9.4 14.35,9.4" fill="#ce1126"/>
    </svg>`;
    const FLAG_MODERN = `<svg viewBox="0 0 30 20" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
      <rect width="10" height="20" x="0"  fill="#002b7f"/>
      <rect width="10" height="20" x="10" fill="#fcd116"/>
      <rect width="10" height="20" x="20" fill="#ce1126"/>
    </svg>`;

    function flagFor(year) {
      if (year < 1859) return { name: 'Principatul Moldovei', svg: FLAG_MOLDOVA };
      if (year < 1881) return { name: 'Principatele Unite', svg: FLAG_PRINCIPATE };
      if (year < 1947) return { name: 'Regatul României', svg: FLAG_REGAT };
      if (year < 1965) return { name: 'Republica Populară Română', svg: FLAG_RSR };
      if (year < 1990) return { name: 'Republica Socialistă România', svg: FLAG_RSR };
      return { name: 'România', svg: FLAG_MODERN };
    }

    // Era ranges + display labels (matched to .timeline-eras .era-*)
    const eras = [
      { from: 1445, to: 1538, name: 'Medieval',          color: '#c2a988' },
      { from: 1538, to: 1829, name: 'Otoman',            color: '#c19972' },
      { from: 1829, to: 1916, name: 'Port liber · CED',  color: '#6ea58f' },
      { from: 1916, to: 1918, name: 'Primul Război',     color: '#c25a45' },
      { from: 1918, to: 1939, name: 'Interbelic',        color: '#d8b574' },
      { from: 1939, to: 1944, name: 'Al Doilea Război',  color: '#c25a45' },
      { from: 1944, to: 1989, name: 'Comunism',          color: '#997272' },
      { from: 1989, to: 2027, name: 'Modern',            color: '#8298b0' },
    ];
    function eraFor(year) {
      return eras.find(e => year >= e.from && year < e.to) || eras[eras.length - 1];
    }

    function updateTimelineDisplay() {
      if (timelineYear === null) {
        yearOverlay.hidden = true;
        timelineEl.classList.remove('engaged');
        timelineCurrentEvent.hidden = true;
        timelineEventEls.forEach(el => el.classList.remove('near'));
      } else {
        timelineEl.classList.add('engaged');
        yearOverlay.hidden = false;
        yearNumOut.textContent = timelineYear;
        // Flag + entity name (political affiliation of Galați at this year)
        const flag = flagFor(timelineYear);
        yearFlag.innerHTML = flag.svg;
        yearFlag.title = flag.name;
        yearEntityName.textContent = flag.name;
        // Era info (cultural period)
        const era = eraFor(timelineYear);
        yearEraDot.style.background = era.color;
        yearEraName.textContent = era.name;
        // Population
        const popInfo = populationAt(timelineYear);
        if (popInfo) {
          const prefix = popInfo.interpolated ? '~' : '';
          yearPopOut.innerHTML = `${prefix}${fmtPop(popInfo.pop)}<span class="pop-suffix">loc.</span>`;
          yearPopOut.title = popInfo.src;
          yearPopOut.hidden = false;
          yearMetaSep.hidden = false;
        } else {
          yearPopOut.hidden = true;
          yearMetaSep.hidden = true;
        }
        // Highlight visible circles within ±1 year of slider
        timelineEventEls.forEach((el) => {
          const ey = parseInt(el.dataset.year, 10);
          el.classList.toggle('near', Math.abs(ey - timelineYear) <= 1);
        });
        // Show events within ±1 year — curated list (allEvents) on top,
        // chronology entries below.
        const within = (e) => {
          const distStart = Math.abs(e.year - timelineYear);
          const distEnd = e.year_end ? Math.abs(e.year_end - timelineYear) : distStart;
          // Range entries (year–year_end) match if the slider is inside or within 1 year of either edge
          if (e.year_end && timelineYear >= e.year && timelineYear <= e.year_end) return 0;
          return Math.min(distStart, distEnd);
        };
        const curatedMatches = allEvents
          .map((e) => ({ ...e, _dist: within(e), _src: 'curated' }))
          .filter((e) => e._dist <= 1);
        const chronologyMatches = chronologyEvents
          .map((e) => ({ ...e, _dist: within(e), _src: 'chronology' }))
          .filter((e) => e._dist <= 1);
        const sortFn = (a, b) => a._dist - b._dist || a.year - b.year;
        curatedMatches.sort(sortFn);
        chronologyMatches.sort(sortFn);
        // Show curated headline(s) first (max 2), then chronology detail (max 2).
        const combined = [...curatedMatches.slice(0, 2), ...chronologyMatches.slice(0, 2)];
        const _lang = (typeof window.getLang === 'function') ? window.getLang() : 'ro';
        if (combined.length) {
          timelineCurrentEvent.innerHTML = combined
            .map((e) => {
              const yearLabel = e.year_end ? `${e.year}–${e.year_end}` : e.year;
              const cls = e._src === 'chronology' ? 'event-line from-chronology' : 'event-line';
              const lbl = (_lang === 'en' && e.label_en) ? e.label_en : e.label;
              return `<div class="${cls}"><strong>${yearLabel}</strong>${escapeHtml(lbl)}</div>`;
            })
            .join('');
          timelineCurrentEvent.hidden = false;
        } else {
          timelineCurrentEvent.hidden = true;
        }
      }
    }
    // Re-render timeline tooltip on language change (no need to move slider)
    window.addEventListener('langchange', () => {
      try { updateTimelineDisplay(); } catch (e) {}
    });
    timelineSlider.addEventListener('input', () => {
      timelineYear = parseInt(timelineSlider.value, 10);
      // Special: dacă slider-ul e la max (2026), considerăm „fără filtru"
      if (timelineYear >= 2026) timelineYear = null;
      updateTimelineDisplay();
      render();
      if (typeof refreshPubcrawlVisibility === 'function') refreshPubcrawlVisibility();
      if (typeof refreshTriviaVisibility === 'function') refreshTriviaVisibility();
      if (typeof refreshJudetLayer === 'function') refreshJudetLayer();
    });
    // Click pe un romb de eveniment → mutăm slider-ul la anul respectiv
    timelineEventEls.forEach((el) => {
      el.addEventListener('click', () => {
        const y = parseInt(el.dataset.year, 10);
        timelineYear = y;
        timelineSlider.value = y;
        updateTimelineDisplay();
        render();
        if (typeof refreshPubcrawlVisibility === 'function') refreshPubcrawlVisibility();
        if (typeof refreshJudetLayer === 'function') refreshJudetLayer();
      });
      el.style.cursor = 'pointer';
    });
    timelineReset.addEventListener('click', () => {
      timelineYear = null;
      timelineSlider.value = 2026;
      updateTimelineDisplay();
      render();
      if (typeof refreshPubcrawlVisibility === 'function') refreshPubcrawlVisibility();
      if (typeof refreshTriviaVisibility === 'function') refreshTriviaVisibility();
      if (typeof refreshJudetLayer === 'function') refreshJudetLayer();
    });
    updateTimelineDisplay();

    // ─── Historic map overlay (multi-layer eHarta) ───────────────
    const historicToggle = document.getElementById('toggle-historic-map');
    const historicOpaCtl = document.getElementById('historic-opacity-control');
    const historicOpaSlider = document.getElementById('historic-opacity-slider');
    const historicOpaOut = document.getElementById('historic-opacity-out');
    const historicSelect = document.getElementById('historic-layer-select');
    const historicMeta = document.getElementById('historic-meta');
    let historicLayer = null;
    let historicLayerName = historicSelect.value;
    function buildHistoricLayer(name) {
      const layer = L.tileLayer.wms('https://services.geo-spatial.org/geoserver/eharta/wms', {
        layers: name,
        format: 'image/png',
        transparent: true,
        version: '1.1.1',
        opacity: parseInt(historicOpaSlider.value, 10) / 100,
        attribution: '<a href="https://geo-spatial.org" target="_blank" rel="noopener">eHarta &copy; geo-spatial.org</a>',
      });
      // WMS-ul extern (geo-spatial.org) e adesea lent. Arătăm un spinner
      // cât tile-urile sunt în zbor — altfel pare că nu s-a întâmplat nimic.
      let pending = 0;
      const setLoading = (on) => {
        historicToggle.classList.toggle('is-loading', on);
        historicMeta.dataset.loading = on ? '1' : '';
      };
      layer.on('loading', () => { pending++; setLoading(true); });
      const done = () => { pending = Math.max(0, pending - 1); if (pending === 0) setLoading(false); };
      layer.on('load', done);
      layer.on('tileerror', done);
      return layer;
    }
    function updateHistoricMeta() {
      const opt = historicSelect.options[historicSelect.selectedIndex];
      historicMeta.textContent = opt ? (opt.dataset.period || '') : '';
    }
    function applyHistoricLayer() {
      if (historicLayer) {
        map.removeLayer(historicLayer);
        historicLayer = null;
      }
      historicToggle.classList.remove('is-loading');
      const pressed = historicToggle.getAttribute('aria-pressed') === 'true';
      if (pressed) {
        historicLayer = buildHistoricLayer(historicLayerName);
        historicLayer.addTo(map);
      }
    }
    historicToggle.addEventListener('click', () => {
      const pressed = historicToggle.getAttribute('aria-pressed') === 'true';
      const next = !pressed;
      historicToggle.setAttribute('aria-pressed', next ? 'true' : 'false');
      historicOpaCtl.hidden = !next;
      applyHistoricLayer();
    });
    historicSelect.addEventListener('change', () => {
      historicLayerName = historicSelect.value;
      updateHistoricMeta();
      applyHistoricLayer();
    });
    historicOpaSlider.addEventListener('input', () => {
      const v = parseInt(historicOpaSlider.value, 10);
      historicOpaOut.textContent = `${v}%`;
      if (historicLayer) historicLayer.setOpacity(v / 100);
    });
    updateHistoricMeta();

    // ─── Valul lui Traian (overlay polilină) ─────────────────────
    const valToggle = document.getElementById('toggle-valuri');
    let valLayer = null;
    let valGeoJsonCache = null;
    async function loadValGeoJson() {
      if (valGeoJsonCache) return valGeoJsonCache;
      try {
        const r = await fetch('valuri.geojson');
        valGeoJsonCache = await r.json();
        return valGeoJsonCache;
      } catch (e) {
        console.warn('Nu am putut încărca valuri.geojson:', e);
        return null;
      }
    }
    // Map între numele feature-ului din GeoJSON și pinul asociat din locations
    const geoFeaturePins = {
      'Valul lui Traian': 'loc-139',
      'Valul lui Atanaric': 'loc-198',
      'Cetatea Dinogeția': 'loc-140',
    };
    // Stiluri specifice per fortificație (deosebim vizual cele 2 valuri)
    const valStyles = {
      'Valul lui Traian': {
        color: '#8b6c2a',  // ocru roman
        weight: 4, opacity: 0.85, dashArray: '8 4',
        lineCap: 'round', lineJoin: 'round',
      },
      'Valul lui Atanaric': {
        color: '#5a3a8e',  // mov gotic — distinct de Traian
        weight: 4, opacity: 0.85, dashArray: '12 6',
        lineCap: 'round', lineJoin: 'round',
      },
    };
    const valTooltipMeta = {
      'Valul lui Traian': 'limes roman · sec. II d.Hr.',
      'Valul lui Atanaric': 'val gotic · 376 d.Hr.',
    };
    valToggle.addEventListener('click', async () => {
      const pressed = valToggle.getAttribute('aria-pressed') === 'true';
      const next = !pressed;
      valToggle.setAttribute('aria-pressed', next ? 'true' : 'false');
      if (next) {
        const geo = await loadValGeoJson();
        if (!geo) return;
        valLayer = L.geoJSON(geo, {
          style: (feature) => {
            const isLine = feature.geometry.type === 'LineString';
            const name = (feature.properties || {}).name;
            if (isLine) {
              return valStyles[name] || valStyles['Valul lui Traian'];
            }
            return {
              color: '#a0522d',
              weight: 2,
              opacity: 0.95,
              fillColor: '#cd853f',
              fillOpacity: 0.35,
            };
          },
          onEachFeature: (feature, layer) => {
            const p = feature.properties || {};
            const isLine = feature.geometry.type === 'LineString';
            let meta;
            if (isLine) {
              const tag = valTooltipMeta[p.name] || 'fortificație';
              meta = `${p.length_km || ''} km · ${tag}`;
            } else {
              meta = 'castru roman → cetate bizantină';
            }
            layer.bindTooltip(`<strong>${p.name || ''}</strong><br><small>${meta}</small>`, {
              sticky: true, direction: 'top'
            });
            const pinId = geoFeaturePins[p.name];
            if (pinId) {
              layer.on('click', () => {
                highlight(pinId, true);
                openDetail(pinId);
              });
            }
          }
        }).addTo(map);
        // Auto-fit la features
        map.fitBounds(valLayer.getBounds(), { padding: [40, 40] });
      } else if (valLayer) {
        map.removeLayer(valLayer);
        valLayer = null;
      }
    });

    // ─── Granița administrativă istorică (overlay polygon, sincronizată cu timeline) ─
    // Afișează zona Galațiului ca entitate administrativă în 6 epoci diferite:
    //   Ținutul Covurlui (sec. XV — 1864)
    //   Județul Covurlui (1864 — 1950)
    //   Regiunea Galați I (1950 — 1952)
    //   Regiunea Bârlad (1952 — 1956)
    //   Regiunea Galați II (1956 — 1968)
    //   Județul Galați (1968 — prezent)
    // Slider-ul timeline controlează care poligon se afișează.
    const judetToggle = document.getElementById('toggle-judet');
    let judetLayer = null;
    let judetGeoCache = null;
    let judetActiveFeature = null;  // numele feature-ului afișat acum
    async function loadJudetGeoJson() {
      if (judetGeoCache) return judetGeoCache;
      try {
        const r = await fetch('historical_boundaries.geojson');
        judetGeoCache = await r.json();
        return judetGeoCache;
      } catch (e) {
        console.warn('Nu am putut încărca historical_boundaries.geojson:', e);
        return null;
      }
    }
    function pickFeatureForYear(geo, year) {
      // year: integer (slider value); găsim feature-ul cu start_year ≤ year ≤ end_year
      // Dacă timeline e pe modul „prezent" (timelineYear === null), folosim 2026
      const y = (year === null || year === undefined) ? 2026 : year;
      const features = (geo && geo.features) || [];
      // În caz că două intervale se ating la limita anului, preferăm feature-ul
      // care începe mai târziu (mai recent). Sortăm după start_year descrescător.
      const sorted = [...features].sort((a, b) =>
        (b.properties.start_year || 0) - (a.properties.start_year || 0)
      );
      for (const f of sorted) {
        const s = f.properties.start_year, e = f.properties.end_year;
        if (s <= y && y <= e) return f;
      }
      // Fallback: cel modern
      return features.find(f => f.properties.name === 'Județul Galați') || features[0];
    }
    function styleForFeature(feat) {
      // Coduri de culoare pe epocă pentru a fi distincte vizual
      const palette = {
        'Ținutul Covurlui':    { color: '#7a2818', fill: '#a83a25' },  // medieval roșu-brun
        'Județul Covurlui':    { color: '#8b1e22', fill: '#b34128' },  // sec XIX-XX roșu burgund
        'Regiunea Galați (I)': { color: '#5a3a8e', fill: '#7a5fb0' },  // 1950 mov gotic
        'Regiunea Bârlad':     { color: '#1f2c4a', fill: '#3a4d77' },  // 1952 albastru-marin
        'Regiunea Galați (II)':{ color: '#5d3f1a', fill: '#8b6c2a' },  // 1956 ocru-cărămiziu
        'Județul Galați':      { color: '#2c6157', fill: '#2c6157' },  // azi verde-pin
      };
      const c = palette[feat.properties.name] || palette['Județul Galați'];
      return {
        color: c.color,
        weight: 3,
        opacity: 0.9,
        fillColor: c.fill,
        fillOpacity: 0.06,
        dashArray: '6 6',
        lineCap: 'round',
        lineJoin: 'round',
      };
    }
    function tooltipForFeature(feat) {
      const p = feat.properties || {};
      const period = p.end_year >= 9999
        ? `${p.start_year} — prezent`
        : `${p.start_year} — ${p.end_year}`;
      const note = p.approx_note ? `<br><small style="opacity:.75;font-style:italic">${p.approx_note}</small>` : '';
      return `<strong>${p.name || ''}</strong><br><small>${p.subtitle || period}</small>${note}`;
    }
    async function refreshJudetLayer() {
      if (judetToggle.getAttribute('aria-pressed') !== 'true') return;
      const geo = await loadJudetGeoJson();
      if (!geo) return;
      const feat = pickFeatureForYear(geo, timelineYear);
      if (!feat) return;
      const featName = feat.properties.name;
      // Dacă deja afișăm același feature, doar update tooltip (nu re-creăm DOM-ul)
      if (judetLayer && judetActiveFeature === featName) return;
      // Altfel, înlocuim
      if (judetLayer) {
        map.removeLayer(judetLayer);
        judetLayer = null;
      }
      judetActiveFeature = featName;
      judetLayer = L.geoJSON(feat, {
        style: () => styleForFeature(feat),
        onEachFeature: (f, layer) => {
          layer.bindTooltip(tooltipForFeature(f), { sticky: true, direction: 'top' });
        },
      }).addTo(map);
      if (judetLayer.bringToBack) judetLayer.bringToBack();
    }
    judetToggle.addEventListener('click', async () => {
      const pressed = judetToggle.getAttribute('aria-pressed') === 'true';
      const next = !pressed;
      judetToggle.setAttribute('aria-pressed', next ? 'true' : 'false');
      if (next) {
        const geo = await loadJudetGeoJson();
        if (!geo) return;
        await refreshJudetLayer();
        if (judetLayer) {
          map.fitBounds(judetLayer.getBounds(), { padding: [40, 40] });
        }
      } else if (judetLayer) {
        map.removeLayer(judetLayer);
        judetLayer = null;
        judetActiveFeature = null;
      }
    });

    // ─── Desktop layer bubbles ─────────────────────────────────
    // Bulele din colțul stânga-jos al hărții oglindesc 1:1 toggle-urile din
    // sidebar. Click pe bulă → click programatic pe toggle-ul-țintă. State-ul
    // (aria-pressed) e sincronizat în ambele direcții cu MutationObserver.
    (function wireLayerBubbles() {
      const bubbles = document.querySelectorAll('.layer-bubble[data-mirrors]');
      if (!bubbles.length) return;
      bubbles.forEach(bubble => {
        const targetId = bubble.dataset.mirrors;
        const target = document.getElementById(targetId);
        if (!target) return;
        // Initial state
        const sync = () => {
          const pressed = target.getAttribute('aria-pressed') === 'true';
          bubble.setAttribute('aria-pressed', pressed ? 'true' : 'false');
          if (target.classList.contains('is-loading')) {
            bubble.classList.add('is-loading');
          } else {
            bubble.classList.remove('is-loading');
          }
        };
        sync();
        // Observer pe target — orice schimbare a aria-pressed/class se reflectă
        new MutationObserver(sync).observe(target, {
          attributes: true,
          attributeFilter: ['aria-pressed', 'class'],
        });
        // Click pe bulă → forward la target (păstrează toată logica existentă)
        bubble.addEventListener('click', () => {
          target.click();
        });
      });
    })();

    // ─── „Galați de altădată" — colecția de fotografii istorice (buline mici portocalii) ─
    // Pozele sunt distribuite pe hartă după an + locație aproximativă, pentru a oferi un
    // strat istoric peste obiective. NU sunt legate de puncte specifice — fac parte dintr-o
    // colecție generală de imagini ale orașului.
    const pubcrawlMarkers = [];  // [{marker, photo}]
    let pubcrawlLayer = null;
    function pubcrawlIcon() {
      return L.divIcon({
        className: 'custom-marker',
        html: `<div class="pubcrawl-dot"></div>`,
        iconSize: [11, 11],
        iconAnchor: [5.5, 5.5],
      });
    }
    function passesPubcrawlTimeline(photo) {
      // Slider la capătul drept (2026) → toate vizibile
      if (timelineYear === null) return true;
      // Foto fără an documentat → afișată DOAR la capătul drept (deja prins mai sus)
      if (photo.year === null || photo.year === undefined) return false;
      // Foto cu an documentat → vizibilă doar dacă slider ≥ year
      return photo.year <= timelineYear;
    }
    function refreshPubcrawlVisibility() {
      // Cu clustering, controlăm vizibilitatea prin add/remove din cluster
      // (nu mai merge CSS opacity — markeri în cluster nu au DOM element).
      // Batch operations pentru perf: acumulăm diff-ul și-l aplicăm o dată.
      if (!pubcrawlLayer) return;
      const toAdd = [];
      const toRemove = [];
      pubcrawlMarkers.forEach(({marker, photo}) => {
        const visible = passesPubcrawlTimeline(photo);
        const inLayer = pubcrawlLayer.hasLayer(marker);
        if (visible && !inLayer) toAdd.push(marker);
        else if (!visible && inLayer) toRemove.push(marker);
      });
      if (toRemove.length) pubcrawlLayer.removeLayers(toRemove);
      if (toAdd.length) pubcrawlLayer.addLayers(toAdd);
    }

    // ─── Galați de altădată — lightbox navigation by nearest photo ───
    // Când utilizatorul deschide o fotografie cu click pe bulina portocalie,
    // construim o coadă sortată după distanță față de poza inițială. Săgețile
    // ‹/› + tastele Arrow + swipe-ul pe mobil avansează prin această coadă.
    // Distanța se calculează doar față de poza inițială (nu față de fiecare
    // nouă poză afișată) — așa coada rămâne stabilă în timpul răsfoirii.
    let lightboxQueue = [];      // [{photo, distance_m}]
    let lightboxIndex = 0;
    let lightboxAnchor = null;   // foto inițială pentru calculul distanței

    function haversineMeters(lat1, lon1, lat2, lon2) {
      const R = 6371000;
      const toRad = (d) => d * Math.PI / 180;
      const dLat = toRad(lat2 - lat1);
      const dLon = toRad(lon2 - lon1);
      const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon/2)**2;
      return R * 2 * Math.asin(Math.sqrt(a));
    }

    function openPhotoLightbox(photo) {
      // Light up the marker
      document.querySelectorAll('.pubcrawl-dot.lit').forEach(d => d.classList.remove('lit'));
      const marker = pubcrawlMarkers.find(x => x.photo === photo)?.marker;
      const el = marker?.getElement();
      if (el) el.querySelector('.pubcrawl-dot')?.classList.add('lit');

      // Build sorted queue (only first time / when anchor changes)
      lightboxAnchor = photo;
      lightboxQueue = pubcrawlMarkers
        .map(({photo: p}) => ({
          photo: p,
          distance_m: haversineMeters(photo.lat, photo.lon, p.lat, p.lon),
        }))
        .sort((a, b) => a.distance_m - b.distance_m);
      lightboxIndex = 0;
      displayLightboxPhoto(photo);
    }

    function displayLightboxPhoto(photo) {
      activePhoto = photo;
      lightboxImg.src = photo.src;
      const lang = (typeof window.getLang === 'function') ? window.getLang() : 'ro';
      const cap = (lang === 'en' && photo.caption_en) ? photo.caption_en : (photo.caption_ro || '');
      lightboxImg.alt = cap;
      const yearTag = photo.year ? `<span style="display:inline-block;background:#d97706;color:white;padding:1px 8px;border-radius:999px;font-size:11px;font-weight:700;letter-spacing:.05em;margin-right:8px">${photo.year}</span>` : '';
      const collectionTag = `<small style="opacity:.55;display:block;margin-top:6px;letter-spacing:.05em;text-transform:uppercase;font-size:10.5px">Galați de altădată</small>`;
      lightboxCaption.innerHTML = `${yearTag}${escapeHtml(cap)}${collectionTag}`;
      lightboxCaption.hidden = false;
      lightbox.dataset.open = '1';

      // Update nav buttons + counter
      const prev = document.getElementById('lightbox-prev');
      const next = document.getElementById('lightbox-next');
      const counter = document.getElementById('lightbox-counter');
      const total = lightboxQueue.length;
      if (total > 1) {
        prev.hidden = lightboxIndex <= 0;
        next.hidden = lightboxIndex >= total - 1;
        const dist = lightboxQueue[lightboxIndex]?.distance_m || 0;
        const distLabel = lightboxIndex === 0 ? 'punctul ales' :
          (dist < 1000 ? `${Math.round(dist)} m` : `${(dist/1000).toFixed(1)} km`);
        counter.textContent = `${lightboxIndex + 1} / ${total} · ${distLabel}`;
        counter.hidden = false;
      } else {
        prev.hidden = true;
        next.hidden = true;
        counter.hidden = true;
      }
    }

    function lightboxNavigate(direction) {
      // Gallery mode takes precedence — quieter UI (no pubcrawl markers)
      if (lightboxGalleryItems.length > 0) {
        const newIdx = lightboxGalleryIdx + direction;
        if (newIdx < 0 || newIdx >= lightboxGalleryItems.length) return;
        displayGalleryLightbox(newIdx);
        return;
      }
      // Pubcrawl photo flow
      if (!lightboxQueue.length) return;
      const newIdx = lightboxIndex + direction;
      if (newIdx < 0 || newIdx >= lightboxQueue.length) return;
      lightboxIndex = newIdx;
      const item = lightboxQueue[newIdx];
      displayLightboxPhoto(item.photo);
      // Light up the new marker too
      document.querySelectorAll('.pubcrawl-dot.lit').forEach(d => d.classList.remove('lit'));
      const marker = pubcrawlMarkers.find(x => x.photo === item.photo)?.marker;
      const el = marker?.getElement();
      if (el) el.querySelector('.pubcrawl-dot')?.classList.add('lit');
    }

    // Wire up nav buttons + keyboard + swipe
    document.getElementById('lightbox-prev').addEventListener('click', (e) => {
      e.stopPropagation();
      lightboxNavigate(-1);
    });
    document.getElementById('lightbox-next').addEventListener('click', (e) => {
      e.stopPropagation();
      lightboxNavigate(1);
    });
    document.addEventListener('keydown', (e) => {
      if (!lightbox.dataset.open) return;
      if (!lightboxQueue.length && !lightboxGalleryItems.length) return;
      if (e.key === 'ArrowLeft') { e.preventDefault(); lightboxNavigate(-1); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); lightboxNavigate(1); }
    });
    // Touch swipe (mobil)
    let touchStartX = null, touchStartY = null;
    lightbox.addEventListener('touchstart', (e) => {
      if (!lightboxQueue.length && !lightboxGalleryItems.length) return;
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    }, { passive: true });
    lightbox.addEventListener('touchend', (e) => {
      if (touchStartX === null) return;
      const dx = e.changedTouches[0].clientX - touchStartX;
      const dy = e.changedTouches[0].clientY - touchStartY;
      // Swipe orizontal predominant + minim 50 px
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.4) {
        lightboxNavigate(dx > 0 ? -1 : 1);
      }
      touchStartX = null; touchStartY = null;
    }, { passive: true });

    async function initPubcrawl() {
      try {
        const r = await fetch('galati-altadata.json');
        const data = await r.json();
        // Cluster pentru cele ~311 fotografii pubcrawl. Bulina portocalie
        // ascunde-se în cluster la zoom mic; spiderfy la max zoom.
        pubcrawlLayer = L.markerClusterGroup({
          maxClusterRadius: 50,
          disableClusteringAtZoom: 16,
          spiderfyOnMaxZoom: true,
          showCoverageOnHover: false,
          chunkedLoading: true,
          removeOutsideVisibleBounds: true,
          iconCreateFunction: (cluster) => {
            const n = cluster.getChildCount();
            const sz = n < 10 ? 'small' : n < 30 ? 'medium' : 'large';
            const dim = sz === 'small' ? 38 : sz === 'large' ? 46 : 42;
            return L.divIcon({
              html: `<div><span>${n}</span></div>`,
              className: `marker-cluster pubcrawl-cluster marker-cluster-${sz}`,
              iconSize: L.point(dim + 8, dim + 8),
            });
          },
        });
        data.forEach((photo) => {
          const m = L.marker([photo.lat, photo.lon], {
            icon: pubcrawlIcon(),
            zIndexOffset: -100,
            riseOnHover: true,
          });
          // Hover-preview cu fotografia (toate pubcrawl markers au src valid).
          // Pe mobil tooltip-ul e ascuns prin @media (hover: none) — tap deschide direct lightbox-ul.
          if (photo.src) {
            const yearBadge = photo.year
              ? `<span class="year-badge">${photo.year}</span>`
              : '';
            const _lang = (typeof window.getLang === 'function') ? window.getLang() : 'ro';
            const cap = (_lang === 'en' && photo.caption_en) ? photo.caption_en : (photo.caption_ro || '');
            const previewHtml =
              `<div class="marker-preview pubcrawl">
                 <img src="${escapeHtml(photo.src)}" alt="" loading="lazy" decoding="async">
                 ${yearBadge || cap ? `<div class="cap">${yearBadge}${cap ? escapeHtml(cap) : ''}</div>` : ''}
               </div>`;
            m.bindTooltip(previewHtml, {
              direction: 'top',
              offset: L.point(0, -6),
              opacity: 1,
              sticky: false,
              className: 'preview-tip',
            });
          }
          m.on('click', () => openPhotoLightbox(photo));
          pubcrawlMarkers.push({marker: m, photo});
        });
        pubcrawlLayer.addTo(map);
        // Aplică starea curentă a slider-ului — adaugă în cluster doar
        // marker-ele care trec filtrul.
        refreshPubcrawlVisibility();
      } catch (e) {
        console.warn('Nu pot încărca galati-altadata.json:', e);
      }
    }
    // Auto-load pe încărcarea hărții (deferred — vezi mai jos)
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => initPubcrawl(), { timeout: 2000 });
    } else {
      setTimeout(initPubcrawl, 1200);
    }

    // ─── „Știați că?" — curiozități pe hartă (pin violet cu „?") ─────────────
    // Citește din trivia.json. NU apare în sidebar — strict marker + click → modal text.
    // Click pe pin afișează modal-ul #text-modal cu meta + titlu + descriere.
    const triviaMarkers = []; // [{marker, item}]
    let triviaLayer = null;
    function triviaIcon() {
      return L.divIcon({
        className: 'custom-marker',
        html: '<div class="trivia-pin">?</div>',
        iconSize: [22, 22],
        iconAnchor: [11, 11],
      });
    }
    const legendaMarkers = []; // [{marker, item}]
    let legendaLayer = null;
    function legendaIcon() {
      // SVG mic de tip scroll/manuscris medieval
      const svg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 4a2 2 0 0 1 2-2h9l3 3v15a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2z"/><path d="M14 2v4h4"/><path d="M9 11h6M9 15h6M9 7h2"/></svg>';
      return L.divIcon({
        className: 'custom-marker',
        html: '<div class="legenda-pin">' + svg + '</div>',
        iconSize: [26, 26],
        iconAnchor: [13, 13],
      });
    }

    // Imagini placeholder folosite când entry-ul nu are imagine proprie.
    // Resolved relativ la galati_map/ → urcă o dată la /assets/.
    const TRIVIA_PLACEHOLDER = '../assets/images/placeholder-trivia.svg';
    const LEGENDA_PLACEHOLDER = '../assets/images/placeholder-legenda.svg';
    function resolveTextItemImage(kind, item) {
      return item && item.image ? item.image : (kind === 'legenda' ? LEGENDA_PLACEHOLDER : TRIVIA_PLACEHOLDER);
    }
    // EN-fallback helpers — entries stochează `title`/`title_en` (etc.); când
    // utilizatorul are limba EN și există *_en, îl folosim, altfel cădem pe RO.
    function localizedField(item, field) {
      if (!item) return '';
      const lang = (typeof window.getLang === 'function') ? window.getLang() : 'ro';
      const enKey = field + '_en';
      if (lang === 'en' && item[enKey]) return item[enKey];
      return item[field] || '';
    }

    // Modal text (folosit de ambele: trivia + legende)
    const textModal = document.getElementById('text-modal');
    const textModalBadge = document.getElementById('text-modal-badge');
    const textModalMeta = document.getElementById('text-modal-meta');
    const textModalTitle = document.getElementById('text-modal-title');
    const textModalBody = document.getElementById('text-modal-body');
    const textModalImg = document.getElementById('text-modal-img');
    const textModalClose = document.getElementById('text-modal-close');
    const textModalEdit = document.getElementById('text-modal-edit');
    let textModalContext = null; // { kind, id } pentru butonul edit
    function openTextModal(kind, item) {
      textModal.classList.remove('trivia', 'legenda');
      textModal.classList.add(kind === 'legenda' ? 'legenda' : 'trivia');
      const fallbackBadge = kind === 'legenda' ? 'Legendă' : 'Știați că?';
      textModalBadge.textContent = localizedField(item, 'category') || fallbackBadge;
      const metaText = localizedField(item, 'meta');
      textModalMeta.textContent = metaText;
      textModalMeta.hidden = !metaText;
      const titleText = localizedField(item, 'title');
      textModalTitle.textContent = titleText;
      textModalBody.textContent = localizedField(item, 'description');
      if (textModalImg) {
        textModalImg.src = resolveTextItemImage(kind, item);
        textModalImg.alt = titleText;
      }
      textModalContext = { kind, id: item.id };
      if (textModalEdit) textModalEdit.hidden = !item.id;
      textModal.dataset.open = '1';
      // Sync URL pentru share (?triv=ID / ?leg=ID)
      if (item.id && typeof window.__updateDeepLink === 'function') {
        window.__updateDeepLink(kind === 'legenda' ? { leg: item.id } : { triv: item.id });
      }
    }
    if (textModalEdit) {
      textModalEdit.addEventListener('click', () => {
        if (!textModalContext || !textModalContext.id) return;
        const url = `_admin/text_pins_editor.html?kind=${textModalContext.kind}&edit=${encodeURIComponent(textModalContext.id)}`;
        window.open(url, '_blank', 'noopener');
      });
    }
    // Click pe imaginea din modal (trivia sau legendă) → deschide lightbox-ul mare.
    if (textModalImg) {
      textModalImg.addEventListener('click', () => {
        if (!textModalContext) return;
        if (typeof openImageInLightbox === 'function' && textModalImg.src) {
          openImageInLightbox(textModalImg.src, textModalImg.alt || '', textModalImg.alt || '');
        }
      });
    }
    function closeTextModal() {
      textModal.removeAttribute('data-open');
      document.querySelectorAll('.trivia-pin.lit, .legenda-pin.lit').forEach(d => d.classList.remove('lit'));
      // Curăță URL-ul (scoate ?triv / ?leg)
      if (typeof window.__updateDeepLink === 'function') window.__updateDeepLink({});
    }
    textModalClose.addEventListener('click', closeTextModal);
    textModal.addEventListener('click', (e) => { if (e.target === textModal) closeTextModal(); });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && textModal.dataset.open) closeTextModal();
    });

    async function initTrivia() {
      try {
        const r = await fetch('trivia.json');
        const data = await r.json();
        triviaLayer = L.markerClusterGroup({
          maxClusterRadius: 40,
          disableClusteringAtZoom: 17,
          spiderfyOnMaxZoom: true,
          showCoverageOnHover: false,
          chunkedLoading: true,
          iconCreateFunction: (cluster) => {
            const n = cluster.getChildCount();
            const sz = n < 10 ? 'small' : n < 30 ? 'medium' : 'large';
            const dim = sz === 'small' ? 38 : sz === 'large' ? 46 : 42;
            return L.divIcon({
              html: `<div><span>${n}</span></div>`,
              className: `marker-cluster trivia-cluster marker-cluster-${sz}`,
              iconSize: L.point(dim + 8, dim + 8),
            });
          },
        });
        data.forEach((item) => {
          if (typeof item.lat !== 'number' || typeof item.lon !== 'number') return;
          const m = L.marker([item.lat, item.lon], {
            icon: triviaIcon(),
            zIndexOffset: 50,
            riseOnHover: true,
          });
          const imgSrc = resolveTextItemImage('trivia', item);
          const tooltipHtml =
            `<div class="marker-preview">
               <img src="${escapeHtml(imgSrc)}" alt="" loading="lazy" decoding="async">
               <div class="cap"><b>${escapeHtml(localizedField(item, 'title'))}</b></div>
             </div>`;
          m.bindTooltip(tooltipHtml, {
            direction: 'top',
            offset: L.point(0, -12),
            opacity: 1,
            sticky: false,
            className: 'preview-tip',
          });
          m.on('click', () => {
            document.querySelectorAll('.trivia-pin.lit, .legenda-pin.lit').forEach(d => d.classList.remove('lit'));
            const el = m.getElement();
            if (el) el.querySelector('.trivia-pin')?.classList.add('lit');
            openTextModal('trivia', item);
          });
          triviaMarkers.push({ marker: m, item });
          triviaLayer.addLayer(m);
        });
        triviaLayer.addTo(map);
        // Aplică filtrul curent al timeline-ului (sare entries cu year > slider)
        refreshTriviaVisibility();
      } catch (e) {
        console.warn('Nu pot încărca trivia.json:', e);
      }
    }

    async function initLegende() {
      try {
        const r = await fetch('legende.json');
        const data = await r.json();
        legendaLayer = L.markerClusterGroup({
          maxClusterRadius: 40,
          disableClusteringAtZoom: 17,
          spiderfyOnMaxZoom: true,
          showCoverageOnHover: false,
          chunkedLoading: true,
          iconCreateFunction: (cluster) => {
            const n = cluster.getChildCount();
            const sz = n < 10 ? 'small' : n < 30 ? 'medium' : 'large';
            const dim = sz === 'small' ? 38 : sz === 'large' ? 46 : 42;
            return L.divIcon({
              html: `<div><span>${n}</span></div>`,
              className: `marker-cluster legenda-cluster marker-cluster-${sz}`,
              iconSize: L.point(dim + 8, dim + 8),
            });
          },
        });
        data.forEach((item) => {
          if (typeof item.lat !== 'number' || typeof item.lon !== 'number') return;
          const m = L.marker([item.lat, item.lon], {
            icon: legendaIcon(),
            zIndexOffset: 60,
            riseOnHover: true,
          });
          const imgSrc = resolveTextItemImage('legenda', item);
          const tooltipHtml =
            `<div class="marker-preview">
               <img src="${escapeHtml(imgSrc)}" alt="" loading="lazy" decoding="async">
               <div class="cap"><b>${escapeHtml(localizedField(item, 'title'))}</b></div>
             </div>`;
          m.bindTooltip(tooltipHtml, {
            direction: 'top',
            offset: L.point(0, -14),
            opacity: 1,
            sticky: false,
            className: 'preview-tip',
          });
          m.on('click', () => {
            document.querySelectorAll('.trivia-pin.lit, .legenda-pin.lit').forEach(d => d.classList.remove('lit'));
            const el = m.getElement();
            if (el) el.querySelector('.legenda-pin')?.classList.add('lit');
            openTextModal('legenda', item);
          });
          legendaMarkers.push({ marker: m, item });
          legendaLayer.addLayer(m);
        });
        legendaLayer.addTo(map);
      } catch (e) {
        console.warn('Nu pot încărca legende.json:', e);
      }
    }

    // Trivia timeline filter — entries cu `year` setat dispar când slider-ul
    // e sub anul respectiv. Cele fără year (`null` / lipsește) apar mereu.
    function passesTriviaTimeline(item) {
      if (timelineYear === null) return true;
      const y = item.year;
      if (y === null || y === undefined) return true;
      return y <= timelineYear;
    }
    function refreshTriviaVisibility() {
      if (!triviaLayer) return;
      const toAdd = [];
      const toRemove = [];
      triviaMarkers.forEach(({ marker, item }) => {
        const visible = passesTriviaTimeline(item);
        const inLayer = triviaLayer.hasLayer(marker);
        if (visible && !inLayer) toAdd.push(marker);
        else if (!visible && inLayer) toRemove.push(marker);
      });
      if (toRemove.length) triviaLayer.removeLayers(toRemove);
      if (toAdd.length) triviaLayer.addLayers(toAdd);
    }
    // Expose pe window ca să poată fi apelat din timeline handler-ele setate mai sus.
    window.refreshTriviaVisibility = refreshTriviaVisibility;

    // La switch RO ↔ EN: actualizează in-place conținutul tooltip-urilor
    // (Tooltip.setContent — nu re-bind, nu atinge starea cluster-ului) și
    // re-deschide modal-ul cu textul nou dacă era afișat.
    function rebindTextItemTooltips() {
      try {
        const update = (arr, kind) => {
          arr.forEach(({ marker, item }) => {
            const tt = marker.getTooltip();
            if (!tt) return;
            const imgSrc = resolveTextItemImage(kind, item);
            tt.setContent(
              `<div class="marker-preview">
                 <img src="${escapeHtml(imgSrc)}" alt="" loading="lazy" decoding="async">
                 <div class="cap"><b>${escapeHtml(localizedField(item, 'title'))}</b></div>
               </div>`
            );
          });
        };
        update(triviaMarkers, 'trivia');
        update(legendaMarkers, 'legenda');
        if (textModal.dataset.open && textModalContext) {
          const arr = textModalContext.kind === 'trivia' ? triviaMarkers : legendaMarkers;
          const hit = arr.find(x => x.item.id === textModalContext.id);
          if (hit) openTextModal(textModalContext.kind, hit.item);
        }
      } catch (e) { /* nu sufoca alți listeneri */ }
    }
    window.addEventListener('langchange', rebindTextItemTooltips);

    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => { initTrivia(); initLegende(); }, { timeout: 2500 });
    } else {
      setTimeout(() => { initTrivia(); initLegende(); }, 1400);
    }

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
      if (tourId && typeof tours !== 'undefined') {
        const tour = tours.find(t => t.id === tourId);
        if (tour && typeof enterTour === 'function') {
          // Activăm tab-ul Tururi + deschidem turul
          const tourTabBtn = document.querySelector('.tab[data-tab="tours"]');
          if (tourTabBtn) tourTabBtn.click();
          setTimeout(() => enterTour(tour), 100);
          return;
        }
      }
      if (huntId && typeof hunts !== 'undefined') {
        const hunt = hunts.find(h => h.id === huntId);
        if (hunt && typeof enterHunt === 'function') {
          const huntTabBtn = document.querySelector('.tab[data-tab="hunts"]');
          if (huntTabBtn) huntTabBtn.click();
          setTimeout(() => enterHunt(hunt), 100);
          return;
        }
      }
      // Trivia / legendă deep-link — re-încercăm câteva ori până când
      // layer-ele lor sunt încărcate (au load deferred via requestIdleCallback).
      if (trivId || legId) {
        const targetKind = trivId ? 'trivia' : 'legenda';
        const targetId = trivId || legId;
        const findItem = () => {
          const arr = targetKind === 'trivia' ? triviaMarkers : legendaMarkers;
          return arr.find(x => x.item.id === targetId);
        };
        let tries = 0;
        const tick = () => {
          const hit = findItem();
          if (hit) {
            map.setView([hit.item.lat, hit.item.lon], Math.max(map.getZoom(), 17), { animate: true });
            setTimeout(() => openTextModal(targetKind, hit.item), 250);
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
          if (activeTour) exitTour();
          if (typeof exitHunt === 'function' && activeHunt) exitHunt();
        } else if (target === 'tours') {
          if (typeof exitHunt === 'function' && activeHunt) exitHunt();
          renderTourBrowse();
        } else if (target === 'hunts') {
          if (activeTour) exitTour();
          if (typeof renderHuntBrowse === 'function') renderHuntBrowse();
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

    function getTourLang() {
      try {
        const v = localStorage.getItem('tg.tour.lang');
        if (v && TOUR_LANGS.includes(v)) return v;
      } catch (e) {}
      return 'ro';
    }
    function setTourLang(lang) {
      if (!TOUR_LANGS.includes(lang)) return;
      try { localStorage.setItem('tg.tour.lang', lang); } catch (e) {}
      tourLang = lang;
      // Sync all language buttons
      document.querySelectorAll('.tour-lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === lang);
      });
      // Update UI labels
      const ui = TOUR_UI_STRINGS[lang] || TOUR_UI_STRINGS.ro;
      if (tourBrowseIntroEl) tourBrowseIntroEl.textContent = ui.browseIntro;
      if (exitTourBtn) exitTourBtn.textContent = ui.backToList;
      if (tourStopsHeadingLabelEl) tourStopsHeadingLabelEl.textContent = ui.stopsHeading;
      if (tourLangLabelBrowseEl) tourLangLabelBrowseEl.textContent = ui.langLabel;
      if (tourLangLabelActiveEl) tourLangLabelActiveEl.textContent = ui.langLabel;
      // Re-render whichever view is open
      if (activeTour) enterTour(activeTour, /*keepLang*/ true);
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

    // Wire up language buttons (delegated)
    document.querySelectorAll('.tour-lang-btn').forEach(btn => {
      btn.addEventListener('click', () => setTourLang(btn.dataset.lang));
    });
    // Apply persisted language on load
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
        const coverHtml = t.cover
          ? `<img class="cover" src="${escapeHtml(t.cover)}" alt="" loading="lazy" decoding="async">`
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
      activeTour = tour;
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
        activeId = null;
        render();
      }
      // Update deep link
      if (typeof window.__updateDeepLink === 'function') {
        window.__updateDeepLink({ tour: tour.id });
      }
    }

    function exitTour() {
      activeTour = null;
      tourBrowseEl.hidden = false;
      tourActiveEl.hidden = true;
      activeId = null;
      // Clear tour from URL
      if (typeof window.__updateDeepLink === 'function') {
        window.__updateDeepLink({});
      }
      render();
    }

    exitTourBtn.addEventListener('click', exitTour);

    // ─────────── Treasure Hunts ───────────
    // Single-player hunt engine: load hunts from treasure_hunts.json, render
    // browse list + active checkpoint UI, manage progress in localStorage.
    const hunts = (huntsData && huntsData.hunts) || [];
    (() => { const el = document.getElementById('tab-badge-hunts'); if (el) el.textContent = String(hunts.length); })();
    const huntCardsEl = document.getElementById('hunt-cards');
    const huntBrowseEl = document.getElementById('hunt-browse');
    const huntActiveEl = document.getElementById('hunt-active');
    const huntMetaEl = document.getElementById('hunt-meta');
    const huntTitleEl = document.getElementById('hunt-title');
    const huntSubtitleEl = document.getElementById('hunt-subtitle');
    const huntStoryEl = document.getElementById('hunt-story');
    const huntStoryWrap = document.getElementById('hunt-story-wrap');
    const huntProgressFill = document.getElementById('hunt-progress-fill');
    const huntProgressText = document.getElementById('hunt-progress-text');
    const huntCheckpointEl = document.getElementById('hunt-checkpoint');
    const huntStopsEl = document.getElementById('hunt-stops');
    const huntExitBtn = document.getElementById('hunt-exit');
    const huntResetBtn = document.getElementById('hunt-reset');

    let activeHunt = null;
    let huntLayer = null;          // markers
    let huntRouteLayer = null;     // polyline between solved/current

    function huntStorageKey(hunt) { return `tg.hunt.${hunt.id}`; }
    function loadHuntProgress(hunt) {
      try {
        const raw = localStorage.getItem(huntStorageKey(hunt));
        if (!raw) return null;
        return JSON.parse(raw);
      } catch (e) { return null; }
    }
    function saveHuntProgress(hunt, progress) {
      try { localStorage.setItem(huntStorageKey(hunt), JSON.stringify(progress)); }
      catch (e) { /* quota / private mode */ }
    }
    function clearHuntProgress(hunt) {
      try { localStorage.removeItem(huntStorageKey(hunt)); } catch (e) {}
    }
    function newHuntProgress() {
      return { solved: [], currentIdx: 0, score: 0, startedAt: Date.now() };
    }

    function renderHuntBrowse() {
      huntBrowseEl.hidden = false;
      huntActiveEl.hidden = true;
      huntCardsEl.innerHTML = '';
      if (huntLayer) { map.removeLayer(huntLayer); huntLayer = null; }
      if (huntRouteLayer) { map.removeLayer(huntRouteLayer); huntRouteLayer = null; }
      activeHunt = null;
      if (!hunts.length) {
        huntCardsEl.innerHTML = '<p class="tab-intro" style="text-align:center;color:var(--muted);font-style:italic;">Nicio aventură încă.</p>';
        return;
      }
      hunts.forEach(h => {
        const progress = loadHuntProgress(h);
        const total = h.checkpoints.length;
        const done = progress ? progress.solved.length : 0;
        const card = document.createElement('button');
        card.className = 'hunt-card';
        card.type = 'button';
        const initial = (h.title || '?').charAt(0).toUpperCase();
        const progressBadge = done > 0
          ? `<span class="badge-progress${done === total ? ' complete' : ''}">${done === total ? '✓ Complet' : `${done}/${total} obiective`}</span>`
          : '';
        // Cover image cu fallback la inițiala stilizată dacă lipsește fișierul
        const coverHtml = h.cover
          ? `<img class="cover" src="${escapeHtml(h.cover)}" alt="${escapeHtml(h.title)}" loading="lazy" decoding="async" onerror="this.outerHTML='<div class=&quot;cover-fallback&quot;>${escapeHtml(initial)}</div>'">`
          : `<div class="cover-fallback">${escapeHtml(initial)}</div>`;
        card.innerHTML = `
          ${coverHtml}
          <span class="body">
            <em>${escapeHtml(h.subtitle || '')}</em>
            <strong>${escapeHtml(h.title)}</strong>
            <span>${escapeHtml(h.description || '').slice(0, 160)}${(h.description || '').length > 160 ? '…' : ''}</span>
            ${progressBadge}
          </span>
        `;
        card.addEventListener('click', () => enterHunt(h));
        huntCardsEl.appendChild(card);
      });
    }

    function enterHunt(hunt) {
      activeHunt = hunt;
      huntBrowseEl.hidden = true;
      huntActiveEl.hidden = false;
      huntMetaEl.textContent = hunt.subtitle || '';
      huntTitleEl.textContent = hunt.title || '';
      huntSubtitleEl.textContent = hunt.description || '';
      huntSubtitleEl.hidden = !hunt.description;
      huntStoryEl.textContent = hunt.story || '';
      huntStoryWrap.hidden = !hunt.story;
      // Render the markers + initial state
      renderHuntMarkers();
      renderHuntCheckpoint();
      renderHuntStopList();
      // Fit map bounds to all checkpoints
      if (hunt.checkpoints && hunt.checkpoints.length) {
        const bounds = L.latLngBounds(hunt.checkpoints.map(c => [c.lat, c.lon]));
        map.fitBounds(bounds, { padding: [60, 60], maxZoom: 16 });
      }
      // Update deep link
      if (typeof window.__updateDeepLink === 'function') {
        window.__updateDeepLink({ hunt: hunt.id });
      }
    }

    function exitHunt() {
      activeHunt = null;
      huntBrowseEl.hidden = false;
      huntActiveEl.hidden = true;
      // Clear hunt from URL
      if (typeof window.__updateDeepLink === 'function') {
        window.__updateDeepLink({});
      }
      if (huntLayer) { map.removeLayer(huntLayer); huntLayer = null; }
      if (huntRouteLayer) { map.removeLayer(huntRouteLayer); huntRouteLayer = null; }
    }

    function renderHuntMarkers() {
      if (!activeHunt) return;
      if (huntLayer) { map.removeLayer(huntLayer); }
      huntLayer = L.layerGroup().addTo(map);
      const progress = loadHuntProgress(activeHunt) || newHuntProgress();
      // Pe hartă afișăm DOAR checkpoint-urile descoperite (rezolvate sau curent
      // dar verificat). Restul rămân ascunse — userul trebuie să le găsească
      // prin cifruri și verificare locație.
      const visiblePts = [];
      activeHunt.checkpoints.forEach((cp, idx) => {
        const isSolved = progress.solved.includes(cp.id);
        const isCurrent = idx === progress.currentIdx && !isSolved;
        const isVerifiedCurrent = isCurrent && progress.currentVerified === true;
        if (!isSolved && !isVerifiedCurrent) return;  // ascuns
        const cls = isSolved ? 'solved' : 'current';
        const icon = L.divIcon({
          className: 'custom-marker',
          html: `<div class="marker-bubble hunt-cp ${cls}" data-num="${idx + 1}" title="${escapeHtml(cp.title)}"></div>`,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });
        const m = L.marker([cp.lat, cp.lon], { icon }).addTo(huntLayer);
        m.on('click', () => {
          map.setView([cp.lat, cp.lon], Math.max(map.getZoom(), 17), { animate: true });
          // Pentru solved: deschidem detaliul locației (din locations.json)
          if (isSolved && cp.loc_id && typeof openDetail === 'function') {
            openDetail(cp.loc_id);
            return;
          }
          // Pentru current verificat: scroll spre ghicitoare în sidebar
          if (isCurrent && huntCheckpointEl) {
            huntCheckpointEl.scrollIntoView({ block: 'start', behavior: 'smooth' });
          }
        });
        visiblePts.push([cp.lat, cp.lon]);
      });
      // Polyline doar prin punctele descoperite
      if (huntRouteLayer) { map.removeLayer(huntRouteLayer); huntRouteLayer = null; }
      if (visiblePts.length >= 2) {
        huntRouteLayer = L.polyline(visiblePts, {
          color: activeHunt.color || '#8b1e22',
          weight: 4, opacity: 0.7, dashArray: '8 6'
        }).addTo(map);
      }
    }

    function renderHuntStopList() {
      if (!activeHunt) return;
      const progress = loadHuntProgress(activeHunt) || newHuntProgress();
      huntStopsEl.innerHTML = '';
      activeHunt.checkpoints.forEach((cp, idx) => {
        const isSolved = progress.solved.includes(cp.id);
        const isCurrent = idx === progress.currentIdx && !isSolved;
        const isLocked = idx > progress.currentIdx && !isSolved;
        const isVerifiedCurrent = isCurrent && progress.currentVerified === true;
        const cls = isSolved ? 'solved' : isCurrent ? 'current' : (isLocked ? 'locked' : '');
        // Anti-spoiler: titlul se vede doar dacă e rezolvat sau curent+verificat
        const showTitle = isSolved || isVerifiedCurrent;
        const displayName = showTitle
          ? escapeHtml(cp.title)
          : (isCurrent
              ? '<em style="color:var(--muted);font-style:italic">— de descoperit —</em>'
              : '<em style="color:var(--muted);font-style:italic">— încuiat —</em>');
        const li = document.createElement('li');
        li.className = cls;
        li.innerHTML = `
          <span class="num"><span>${idx + 1}</span></span>
          <span class="name">${displayName}</span>
        `;
        if (showTitle) {
          li.style.cursor = 'pointer';
          li.addEventListener('click', () => {
            map.setView([cp.lat, cp.lon], Math.max(map.getZoom(), 16), { animate: true });
            // Click pe checkpoint rezolvat → deschide detaliul locației pe map
            if (isSolved && cp.loc_id && typeof openDetail === 'function') {
              openDetail(cp.loc_id);
            }
          });
        } else {
          li.style.cursor = 'default';
        }
        huntStopsEl.appendChild(li);
      });
      // Progress bar
      const total = activeHunt.checkpoints.length;
      const done = progress.solved.length;
      huntProgressFill.style.width = `${(done / total) * 100}%`;
      huntProgressText.textContent = `${done} / ${total} obiective · ${progress.score} puncte`;
    }

    function renderHuntCheckpoint() {
      if (!activeHunt) return;
      const progress = loadHuntProgress(activeHunt) || newHuntProgress();
      const total = activeHunt.checkpoints.length;
      const done = progress.solved.length;
      huntCheckpointEl.innerHTML = '';
      // Completion screen
      if (done >= total) {
        const minutes = Math.round((Date.now() - (progress.startedAt || Date.now())) / 60000);
        huntCheckpointEl.innerHTML = `
          <div class="hunt-completed">
            <h3>${escapeHtml(activeHunt.treasure?.title || 'Comoara descoperită!')}</h3>
            <p>${escapeHtml(activeHunt.treasure?.narrative || 'Felicitări!')}</p>
            <div class="score">${progress.score} puncte</div>
            <p style="font-size:12px;color:#5d3f1a;margin:0;">finalizat în ~${minutes} minute</p>
          </div>
        `;
        return;
      }
      // Active checkpoint
      const cp = activeHunt.checkpoints[progress.currentIdx];
      if (!cp) return;
      // Render clue: dacă cp curent nu are clue propriu, folosim next_clue al
       // checkpoint-ului anterior (acela e indiciul care a condus aici).
      let displayClue = cp.clue;
      if (!displayClue && progress.currentIdx > 0) {
        const prev = activeHunt.checkpoints[progress.currentIdx - 1];
        if (prev && prev.next_clue) displayClue = prev.next_clue;
      }
      let cipherHtml = '';
      if (displayClue) {
        if (displayClue.image) {
          cipherHtml = `
            <img class="cp-clue-img" src="${escapeHtml(displayClue.image)}" alt="Indiciu ${escapeHtml(cp.title)}" loading="lazy" data-hunt-clue="1">
            <p class="cp-clue-img-caption">Tap pentru a deschide indiciul</p>
            ${displayClue.hint ? `<p class="cp-cipher-hint">${escapeHtml(displayClue.hint)}</p>` : ''}
          `;
        } else if (displayClue.label || displayClue.hint) {
          cipherHtml = `
            <div class="cp-cipher ${displayClue.kind === 'binary' ? 'binary' : displayClue.kind === 'morse' ? 'morse' : ''}">${escapeHtml(displayClue.label || displayClue.hint || '')}</div>
            ${displayClue.hint && displayClue.label ? `<p class="cp-cipher-hint">${escapeHtml(displayClue.hint)}</p>` : ''}
          `;
        }
      }
      // Gate ghicitoarea: dezvăluită doar după ce user-ul confirmă că e
      // la fața locului (pune pin pe harta de verificare).
      const isVerified = progress.currentVerified === true;
      const lockedSection = `
        <div class="cp-verify-cta">
          <p class="cp-verify-cta-title">📍 Ești la fața locului?</p>
          <p class="cp-verify-cta-text">Pentru a deschide ghicitoarea, marchează pe harta de mai jos unde se află obiectivul. Plasezi pinul, verificăm distanța și, dacă e aproape, intri în ghicitoare.</p>
          <button type="button" id="cp-verify-btn">Am ajuns la punct</button>
        </div>
      `;
      const unlockedSection = `
        ${cp.find_hint ? `<p class="cp-find-hint">${escapeHtml(cp.find_hint)}</p>` : ''}
        <div class="cp-riddle">
          <span class="label">Ghicitoarea</span>
          <p class="question">${escapeHtml(cp.riddle.question)}</p>
          <ul class="cp-options" id="cp-options-${cp.id}">
            ${cp.riddle.options.map((opt, i) => `
              <li><button type="button" class="cp-option" data-idx="${i}">${escapeHtml(opt)}</button></li>
            `).join('')}
          </ul>
          <div class="cp-feedback" id="cp-feedback-${cp.id}" hidden></div>
          <div class="cp-actions" id="cp-actions-${cp.id}"></div>
        </div>
      `;
      // Anti-spoiler: pre-verificare, ascundem titlul + intro-ul (ele descriu
      // momentul „post-sosire" și pot leak-ui locația). Userul are doar
      // imaginea-cifru și CTA-ul de verificare.
      const headingHtml = isVerified
        ? `<h3>${escapeHtml(cp.title)}</h3>`
        : `<h3 style="color:var(--muted);font-weight:700;font-style:italic">— Următorul obiectiv —</h3>`;
      const introHtml = (isVerified && cp.intro)
        ? `<p class="cp-intro">${escapeHtml(cp.intro)}</p>`
        : '';
      huntCheckpointEl.innerHTML = `
        <div class="cp-current">
          <div class="cp-num-row">Punct ${progress.currentIdx + 1} din ${total}</div>
          ${headingHtml}
          ${introHtml}
          ${cipherHtml}
          ${isVerified ? unlockedSection : lockedSection}
        </div>
      `;
      // Verify-location button (visible doar dacă currentVerified=false)
      const verifyBtn = huntCheckpointEl.querySelector('#cp-verify-btn');
      if (verifyBtn) verifyBtn.addEventListener('click', () => openVerifyModal(cp));
      // Dacă e verificat deja, returnăm — nu mai wire-uim ghicitoarea
      if (!isVerified) {
        map.setView([cp.lat, cp.lon], Math.max(map.getZoom(), 15), { animate: true });
        return;
      }
      // Wire up option buttons
      const optionsContainer = huntCheckpointEl.querySelector(`#cp-options-${cp.id}`);
      const feedback = huntCheckpointEl.querySelector(`#cp-feedback-${cp.id}`);
      const actions = huntCheckpointEl.querySelector(`#cp-actions-${cp.id}`);
      let selectedIdx = null;
      optionsContainer.querySelectorAll('button.cp-option').forEach(btn => {
        btn.addEventListener('click', () => {
          if (btn.disabled) return;
          // Ascundem feedback-ul de eroare anterior (dacă era) — retry curat
          if (feedback && !feedback.hidden && feedback.classList.contains('error')) {
            feedback.hidden = true;
          }
          // Toggle selection
          optionsContainer.querySelectorAll('button.cp-option').forEach(b => {
            if (!b.disabled) b.classList.remove('selected');
          });
          btn.classList.add('selected');
          selectedIdx = parseInt(btn.dataset.idx, 10);
          // Show submit button if not already
          if (!actions.querySelector('button.submit')) {
            actions.innerHTML = '<button type="button" class="submit">Verifică răspunsul</button>';
            actions.querySelector('button.submit').addEventListener('click', () => {
              submitRiddleAnswer(cp, selectedIdx, optionsContainer, feedback, actions);
            });
          }
        });
      });
      // Center map on this checkpoint
      map.setView([cp.lat, cp.lon], Math.max(map.getZoom(), 15), { animate: true });
    }

    // Penalitate per răspuns greșit. Nu dezvăluim răspunsul corect — doar
    // marcăm opțiunea aleasă ca greșită și permitem reîncercarea.
    const WRONG_ANSWER_PENALTY = 25;

    function submitRiddleAnswer(cp, selectedIdx, optionsContainer, feedback, actions) {
      const isCorrect = selectedIdx === cp.riddle.correct;
      const buttons = optionsContainer.querySelectorAll('button.cp-option');
      buttons.forEach((btn, i) => {
        btn.classList.remove('selected');
        if (isCorrect) {
          // Doar pe corect dezvăluim toate (corect + ce-a ales userul dacă e greșit)
          btn.disabled = true;
          if (i === cp.riddle.correct) btn.classList.add('correct');
          else if (i === selectedIdx) btn.classList.add('wrong');
        } else {
          // Pe greșit: marcăm doar opțiunea aleasă ca greșită, păstrăm
          // celelalte active (inclusiv corect) ca user-ul să poată reîncerca
          // fără să afle răspunsul.
          if (i === selectedIdx) {
            btn.classList.add('wrong');
            btn.disabled = true;
          }
        }
      });
      feedback.hidden = false;
      if (isCorrect) {
        feedback.className = 'cp-feedback success';
        let nextClueHtml = '';
        if (cp.next_clue) {
          const hintTxt = cp.next_clue.hint ? `<br><strong>Indiciu pentru următorul obiectiv:</strong> ${escapeHtml(cp.next_clue.hint)}` : '';
          const img = cp.next_clue.image
            ? `<img class="cp-clue-img" src="${escapeHtml(cp.next_clue.image)}" alt="Indiciu către următorul punct" loading="lazy" data-hunt-clue="1" style="margin-top:10px;">
               <p class="cp-clue-img-caption">Tap pentru a deschide indiciul</p>`
            : '';
          nextClueHtml = `<br>${hintTxt}${img}`;
        }
        feedback.innerHTML = `Răspuns corect! Ai câștigat ${cp.riddle.points} puncte.${nextClueHtml}`;
        // Save progress
        const progress = loadHuntProgress(activeHunt) || newHuntProgress();
        if (!progress.solved.includes(cp.id)) progress.solved.push(cp.id);
        progress.score += cp.riddle.points;
        progress.currentIdx = Math.min(progress.currentIdx + 1, activeHunt.checkpoints.length);
        progress.currentVerified = false;  // următorul cp începe locked
        saveHuntProgress(activeHunt, progress);
        // Show "next" button
        actions.innerHTML = '';
        const nextBtn = document.createElement('button');
        nextBtn.type = 'button';
        nextBtn.textContent = progress.solved.length >= activeHunt.checkpoints.length
          ? 'Vezi comoara'
          : 'Continuă spre următorul punct';
        nextBtn.addEventListener('click', () => {
          renderHuntCheckpoint();
          renderHuntMarkers();
          renderHuntStopList();
        });
        actions.appendChild(nextBtn);
      } else {
        // Răspuns greșit: scădem puncte și salvăm. Răspunsul corect nu se
        // dezvăluie — opțiunile rămase sunt active pentru retry direct.
        const progress = loadHuntProgress(activeHunt) || newHuntProgress();
        progress.score -= WRONG_ANSWER_PENALTY;
        saveHuntProgress(activeHunt, progress);
        feedback.className = 'cp-feedback error';
        feedback.innerHTML = `Răspuns greșit. <strong>−${WRONG_ANSWER_PENALTY} puncte.</strong> Mai încearcă.`;
        // Update bara de progres (scor afișat se schimbă)
        renderHuntStopList();
        // Curățăm action-urile — userul poate da click direct pe altă opțiune
        actions.innerHTML = '';
      }
    }

    huntExitBtn.addEventListener('click', () => {
      exitHunt();
      // Switch tab back to hunts list view (panel-hunts stays visible)
      panelHunts.hidden = false;
      panelLocations.hidden = true;
      panelTours.hidden = true;
      // Tab buttons stay as they are; no need to re-toggle
      renderHuntBrowse();
    });

    // Click pe imaginile de indiciu (clue/next_clue) → deschide lightbox-ul
    // existent (același folosit pentru fotografii pubcrawl). Permite zoom +
    // pan nativ pe mobil prin pinch.
    document.addEventListener('click', (e) => {
      const img = e.target.closest('img[data-hunt-clue]');
      if (!img) return;
      e.preventDefault();
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt || '';
      lightboxCaption.innerHTML = '<small style="opacity:.7;letter-spacing:.05em;text-transform:uppercase;font-size:11px">Indiciu hunt · pinch pentru zoom · tap în afară pentru închidere</small>';
      lightboxCaption.hidden = false;
      lightbox.dataset.open = '1';
      // Indiciile de hunt nu au navigare — ascundem săgețile
      if (typeof lightboxQueue !== 'undefined') {
        lightboxQueue = [];
        const prev = document.getElementById('lightbox-prev');
        const next = document.getElementById('lightbox-next');
        const counter = document.getElementById('lightbox-counter');
        if (prev) prev.hidden = true;
        if (next) next.hidden = true;
        if (counter) counter.hidden = true;
      }
    });

    // ─── Verify location modal (pin-drop pe mini-hartă) ──────────
    const verifyModal = document.getElementById('verify-modal');
    const verifyTitle = document.getElementById('verify-title');
    const verifyMapEl = document.getElementById('verify-map');
    const verifyCheck = document.getElementById('verify-check');
    const verifyClose = document.getElementById('verify-close');
    const verifyFeedback = document.getElementById('verify-feedback');
    const VERIFY_RADIUS_M = 120;  // raza generoasă pentru match

    let verifyMap = null;
    let verifyMarker = null;
    let verifyTargetCp = null;

    function openVerifyModal(cp) {
      verifyTargetCp = cp;
      // Anti-spoiler: nu menționăm numele obiectivului în titlu
      verifyTitle.textContent = 'Marchează pe hartă unde crezi că se află obiectivul';
      verifyFeedback.textContent = 'Click/tap pe hartă pentru a plasa pinul, apoi apasă Verifică.';
      verifyFeedback.className = '';
      verifyCheck.disabled = true;
      verifyModal.dataset.open = '1';
      // Așteptăm ca modalul să fie vizibil (display:flex aplicat) înainte
      // să inițializăm Leaflet — altfel containerul are 0×0 și tile-urile
      // nu se încarcă.
      requestAnimationFrame(() => requestAnimationFrame(() => {
        if (!verifyMap) {
          verifyMap = L.map(verifyMapEl, {
            center: [45.435, 28.058],
            zoom: 13,
            attributionControl: false,
          });
          // Aceeași URL ca harta principală (cartocdn rastertiles voyager).
          L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
            maxZoom: 19,
            subdomains: 'abcd',
            crossOrigin: true,
          }).addTo(verifyMap);
          verifyMap.on('click', (e) => {
            if (verifyMarker) verifyMap.removeLayer(verifyMarker);
            verifyMarker = L.marker(e.latlng, {
              icon: L.divIcon({
                className: 'custom-marker',
                html: '<div class="marker-bubble" style="background:#b34128;color:#fff;font-weight:800;border-color:#fff">?</div>',
                iconSize: [34, 34], iconAnchor: [17, 17],
              }),
            }).addTo(verifyMap);
            verifyCheck.disabled = false;
            verifyFeedback.className = '';
            verifyFeedback.textContent = 'Pin plasat. Apasă Verifică pentru a confirma.';
          });
        }
        // Reset view + șterge orice pin precedent
        verifyMap.setView([45.435, 28.058], 13);
        if (verifyMarker) { verifyMap.removeLayer(verifyMarker); verifyMarker = null; }
        // Forțăm recalculul layout-ului (modalul tocmai a apărut)
        verifyMap.invalidateSize();
        // Și încă o dată după 200ms — uneori sub-pixel snapping mai e nevoie
        setTimeout(() => verifyMap.invalidateSize(), 200);
      }));
    }

    function closeVerifyModal() {
      delete verifyModal.dataset.open;
      if (verifyMap && verifyMarker) {
        verifyMap.removeLayer(verifyMarker);
        verifyMarker = null;
      }
    }

    verifyClose.addEventListener('click', closeVerifyModal);
    verifyModal.addEventListener('click', (e) => {
      // click în overlay (nu în sheet) → close
      if (e.target === verifyModal) closeVerifyModal();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && verifyModal.dataset.open === '1') closeVerifyModal();
    });

    verifyCheck.addEventListener('click', () => {
      if (!verifyMarker || !verifyTargetCp || !activeHunt) return;
      const target = L.latLng(verifyTargetCp.lat, verifyTargetCp.lon);
      const dist = verifyMarker.getLatLng().distanceTo(target);
      if (dist <= VERIFY_RADIUS_M) {
        verifyFeedback.className = 'success';
        verifyFeedback.textContent = '✓ Excelent! Te afli la obiectiv. Se deschide ghicitoarea...';
        const progress = loadHuntProgress(activeHunt) || newHuntProgress();
        progress.currentVerified = true;
        saveHuntProgress(activeHunt, progress);
        setTimeout(() => {
          closeVerifyModal();
          renderHuntCheckpoint();
          renderHuntMarkers();   // marker-ul curent apare acum pe hartă
          renderHuntStopList();  // titlul apare în lista de etape
        }, 1200);
      } else {
        verifyFeedback.className = 'error';
        verifyFeedback.textContent = '✗ Nu chiar. Mai încearcă să găsești obiectivul pe hartă.';
      }
    });

    huntResetBtn.addEventListener('click', () => {
      if (!activeHunt) return;
      if (!confirm(`Sigur resetezi progresul pentru „${activeHunt.title}"? Vei pierde toate punctele și checkpoint-urile rezolvate.`)) return;
      clearHuntProgress(activeHunt);
      // Re-render
      renderHuntCheckpoint();
      renderHuntMarkers();
      renderHuntStopList();
    });

    render();

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
        onOpen: () => { if (typeof renderTourBrowse === 'function') renderTourBrowse(); } },
      { sheet: document.getElementById('mobile-hunts-panel'),
        fab:   document.getElementById('hunts-fab'),
        close: document.getElementById('hunts-sheet-close'),
        onOpen: () => { if (typeof renderHuntBrowse === 'function') renderHuntBrowse(); } },
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

    // ─── Events page: card grid + sub-routing ───────────────────
    // Source: Surse/candidati-articole.md (curated list of historical events).
    const EVENT_ARTICLES = [
      {
        id: '1821', year: '1821', title: 'Caravia și războiul care a aprins Grecia',
        eyebrow: 'Februarie 1821 · Galațiul, scânteia revoluției eteriste',
        hook: 'O poveste a Eteriei, sânge și libertate. Cum un căminar moldovean a transformat portul Galați în prima scânteie a revoluției grecești.',
        cover: '../assets/images/event-covers/1821-caravia-card.jpg',
        coverFull: '../assets/images/event-covers/1821-caravia.jpg',
        content: `
          <p class="article-lede">Anul 1821. Europa clocotea, dar nicăieri tensiunea nu era mai mare decât la marginea Imperiului Otoman. O societate secretă, <strong>Filiki Eteria</strong> (Societatea Prietenilor), plănuia o eliberare masivă a grecilor de sub stăpânirea otomană. Însă puțini știu că una dintre cele mai violente și decisive scântei ale acestei revoluții s-a aprins chiar în portul <strong>Galați</strong>, un loc strategic la Dunăre, unde ideile revoluționare găsiseră deja un teren fertil.</p>

          <h2>„S-a ridicat cu zorba!"</h2>
          <p>La începutul lunii februarie 1821, în Galați, autoritatea domnească moldoveană era reprezentată de un <strong>căminar</strong> (rang de curte) și căpitan al detașamentelor de arnăuți, pe nume <strong>Vasile Caravia</strong>. Fără ca otomanii să bănuiască amploarea conspirației, Caravia era în secret un eterist înfocat, gata să declanșeze infernul.</p>
          <p>Potrivit cronicilor din arhive (precum <em>Cronica revoluției din 1821</em> a biv-vel serdarului Ioan Dârzeanu), la București au ajuns rapoarte disperate de la isprăvnicatul Focșanilor: <em>„…venise știre într-acele zile cum că un Vasile Caravia […] s-a ridicat cu zorba [revoltă armată] asupra topciului [tunar] turc de acolo, adică zabitului [comandantul otoman al Galațiului]"</em>.</p>

          <h2>Măcelul garnizoanei și orașul în flăcări</h2>
          <p>Atacul nu a fost o simplă revoltă, ci o lovitură militară calculată. În fruntea a aproximativ <strong>700 de eteriști greci și arnăuți</strong> aflați în serviciul moldovenesc, căpitanul Vasile Caravia a luat cu asalt mica, dar bine înarmata garnizoană otomană din Galați. Elementul-surpriză a fost total. Eteriștii i-au ucis pe soldații turci, l-au eliminat pe zabit și au masacrat negustorii otomani din oraș.</p>
          <p>Pentru a instaura haosul total și a tăia rutele de scăpare, trupele lui Caravia au incendiat <strong>intenționat</strong> Galațiul în patru părți diferite. Noaptea, de pe malul celălalt al Dunării, flăcările orașului-port luminau cerul, semnalând că revoluția începuse.</p>

          <h2>Efectul de domino: Ipsilanti și Batalionul Sacru</h2>
          <p>Vestea acțiunii lui Caravia a avut un efect de domino. Generalul <strong>Alexandru Ipsilanti</strong>, liderul Eteriei, a trecut Prutul la Sculeni la 22 februarie / 6 martie 1821, intrând în Moldova. Câteva zile mai târziu, la <strong>1 martie / 13 martie 1821</strong>, depunea jurământul cu <strong>Batalionul Sacru</strong> (<em>Ieros Lochos</em>) la mănăstirea Sf. Trei Ierarhi din <strong>Iași</strong>, iar apoi a pornit spre Țara Românească pentru a face joncțiunea cu efectivele venite dinspre Galați. Domnitorul Moldovei, <strong>Mihail Șuțu</strong> — el însuși eterist — a pus la dispoziție resursele țării.</p>

          <h2>Prețul cumplit plătit de gălățeni</h2>
          <p>Eroismul și euforia eteriștilor au adus însă un blestem peste cetățenii de rând ai Galațiului. După plecarea trupelor lui Caravia, răzbunarea otomană a venit ca un tăvălug. <strong>Pașa din Brăila</strong> (aflată sub control direct turcesc, ca raia) a ordonat represalii devastatoare. Trupele de represiune otomane au trecut Dunărea și au pustiit complet Galațiul. Locuitorii, prinși la mijloc într-un război care nu era al lor, au fost supuși unui măcel cumplit, iar orașul a fost transformat pentru a doua oară în ruine în decurs de câteva luni.</p>
          <p>Astăzi, ecoul acestei bătălii ne amintește că Galațiul nu a fost doar un punct comercial, ci o adevărată „poartă a Europei" unde s-au jucat destinul și eliberarea unor întregi națiuni din Balcani.</p>

          <div class="sources">
            <p><strong>Surse</strong></p>
            <ul>
              <li>Ioan Dârzeanu, biv-vel serdar — <em>Cronica revoluției din 1821</em>, raportul către isprăvnicatul Focșanilor.</li>
              <li>Cilinca Victor, <em>Abecedar istoric gălățean</em> (capitolele despre Eterie).</li>
              <li><a href="https://ro.wikipedia.org/wiki/Filiki_Eteria" target="_blank" rel="noopener">Wikipedia: Filiki Eteria</a> — context organizațional.</li>
              <li><a href="https://ro.wikipedia.org/wiki/Alexandru_Ipsilanti_(1792-1828)" target="_blank" rel="noopener">Wikipedia: Alexandru Ipsilanti</a> — datele trecerii Prutului și jurământului Batalionului Sacru.</li>
              <li>Săndel Dumitru, <em>Galațiul, așa cum mi-l amintesc</em>, vol. V (perioada otomană).</li>
            </ul>
          </div>
        `,
      },
      {
        id: '1856', year: '1856', title: 'Comisia Europeană a Dunării · leagănul cooperării europene',
        eyebrow: '1856 · Tratatul de la Paris',
        hook: 'Cu 100 de ani înainte de fondarea Uniunii Europene, Galațiul găzduia deja prima instituție supranațională din lume — un experiment diplomatic fără precedent.',
        cover: '../assets/images/event-covers/1856-ced-card.jpg',
        coverFull: '../assets/images/event-covers/1856-ced.jpg',
        content: `
          <p class="article-lede">Dacă astăzi vorbim despre o Europă unită, cu instituții supranaționale și granițe deschise, trebuie să privim în urmă cu aproape 170 de ani. Mai exact, în <strong>1856</strong>. La finalul Războiului Crimeii, marile puteri ale lumii s-au reunit la Paris pentru a redesena harta continentului. Și acolo, la mii de kilometri distanță, au luat o decizie care avea să schimbe pentru totdeauna destinul unui oraș-port la Dunăre: au creat <strong>Comisia Europeană a Dunării (CED)</strong>.</p>

          <h2>Prima instituție supranațională din lume</h2>
          <p>CED nu a fost doar o altă agenție; a fost un <strong>experiment diplomatic fără precedent</strong>. Pentru prima dată în istoria omenirii, o organizație primea puteri supranaționale, cu autoritate care depășea statele membre. Cele <strong>7 mari puteri europene</strong> semnatare ale Tratatului de la Paris (Marea Britanie, Franța, Austria, Prusia, Rusia, Regatul Sardiniei și Imperiul Otoman) și-au dat mâna pentru a asigura libera navigație pe Dunăre până la Marea Neagră.</p>
          <p>Și unde au decis să își stabilească sediul? La <strong>Galați</strong>.</p>
          <p>Brusc, orașul a devenit un focar diplomatic internațional. CED funcționa ca un <strong>stat în stat</strong>: avea statut de <strong>extrateritorialitate</strong> (terenurile și sediile sale erau „pământ european", inviolabil), avea <strong>drapel propriu</strong> (pe care îl arborau navele de sub jurisdicția sa), un <strong>buget impresionant</strong>, <strong>poliție fluvială proprie</strong> și o <strong>flotilă tehnică</strong>. Cu 100 de ani înainte de fondarea Uniunii Europene, la Galați funcționa deja o organizație cu angajați din toate colțurile Europei, care lucrau împreună, vorbind <strong>franceza</strong> ca limbă oficială.</p>

          <h2>Sir Charles Hartley și transformarea Dunării</h2>
          <p>Banii și influența Comisiei au transformat orașul. Inginerii conduși de legendarul <strong>Sir Charles Hartley</strong> (supranumit „Părintele Dunării") au secționat buclele fluviului și au transformat <strong>brațul Sulina</strong> într-un canal navigabil pentru vasele maritime. Tot acest efort uriaș era coordonat de la Galați. Hartley însuși a locuit la Galați (vezi <a class="pin-link" href="#map" data-loc="loc-26">Casa Hartley</a> de pe str. Domnească nr. 98).</p>

          <h2>Palatul CED: o bucată de Europă pe Faleză</h2>
          <p>Sediul central, locul de unde se luau deciziile vitale pentru comerțul mondial cu cereale, a fost impunătorul <strong>Palat al Comisiei Europene a Dunării</strong>, ridicat falnic pe strada Domnească (cu vedere spre Faleză). Astăzi, dacă treci pe acolo, recunoști imediat arhitectura sa monumentală: este actualul <strong>sediu central al Bibliotecii „V. A. Urechia"</strong>.</p>
          <p>(Adesea confundat cu sediul rectoratului Universității „Dunărea de Jos" de pe Domnească 47 — care însă a fost <em>Palatul de Justiție</em>, nu Palatul CED.)</p>

          <h2>Zorii și apusul unei ere</h2>
          <p>Cât timp CED a funcționat la capacitate maximă, Galațiul a trăit o epocă de aur. Aici se aflau <strong>peste 20 de consulate și vice-consulate străine</strong> — la apogeu, 21 (cu 16 active înainte de Primul Război Mondial). Mai mulți ambasadori și diplomați pe cap de locuitor decât are astăzi Bruxelles-ul.</p>
          <p>După Primul Război Mondial, atribuțiile CED au fost diminuate treptat de noua suveranitate românească asupra Dunării. Sfârșitul celui de-Al Doilea Război Mondial și instaurarea Cortinei de Fier au alungat puterile vestice de la Gurile Dunării: în <strong>1948</strong>, prin <strong>Convenția de la Belgrad</strong>, CED a fost dizolvată oficial și înlocuită cu o nouă Comisie a Dunării, fără puteri occidentale.</p>
          <p>Dar zidurile fostului Palat CED stau și astăzi în picioare, pe buza falezei, amintindu-ne că a existat o vreme când, la Galați, se dădea ora exactă a Europei.</p>

          <div class="sources">
            <p><strong>Surse</strong></p>
            <ul>
              <li>Cilinca Victor, <em>Abecedar istoric gălățean</em> — capitolul despre CED și fotografia comparativă a Palatului CED / Bibliotecii „V. A. Urechia".</li>
              <li>Gh. N. Munteanu-Bârlad, <em>Galații</em>, monografie 1927 — citat de Cilinca pentru starea Dunării înainte de regularizare.</li>
              <li>Tratatul de la Paris (30 martie 1856), articolele 16-17 — actul fondator CED.</li>
              <li>Convenția de la Belgrad (1948) — actul de desființare CED.</li>
              <li><a href="https://en.wikipedia.org/wiki/European_Commission_of_the_Danube" target="_blank" rel="noopener">European Commission of the Danube (Wikipedia)</a> — pentru context internațional.</li>
            </ul>
          </div>
        `,
      },
      {
        id: '1907', year: '1907', title: 'Flăcările se extind în Covurlui · Răscoala din 1907',
        eyebrow: 'Februarie–martie 1907 · Dreptate și pământ!',
        hook: 'Cum a ajuns marea răscoală țărănească pornită din Flămânzi la porțile Galațiului — și cum un regiment local de elită a fost pus să tragă în propriii consăteni.',
        cover: '../assets/images/event-covers/1907-rascoala-card.jpg',
        coverFull: '../assets/images/event-covers/1907-rascoala.jpg',
        content: `
          <p class="article-lede">Anul <strong>1907</strong> a rămas întipărit în istoria României ca anul marii explozii de furie a satului românesc. Porniți din <strong>Flămânzi (Botoșani)</strong> la 8/21 februarie 1907, din cauza sărăciei extreme, a abuzurilor arendașilor și a lipsei de pământ, mii de țărani s-au ridicat la luptă. Ca un incendiu pe miriște, revolta s-a extins cu repeziciune spre sudul Moldovei, ajungând în luna martie la porțile Galațiului, în vechiul județ <strong>Covurlui</strong>.</p>

          <h2>Flăcările se extind în Covurlui</h2>
          <p>Furia țăranilor a lovit violent conacele boierești și fermele arendașilor din împrejurimile Galațiului. Arhivele consemnează că satele județului s-au ridicat rând pe rând. Un exemplu notabil este satul <strong>Țepu</strong>, unde țăranii s-au organizat și au susținut activ răscoala, cerând <em>„dreptate și pământ"</em>. Conacele incendiate, hambarele jefuite, registrele de arendă rupte — același tipar din toată Moldova.</p>
          <p>Galațiul era la acea vreme un <strong>pol de bogăție</strong>, cu peste 20 de consulate și o economie industrială înfloritoare datorită Comisiei Europene a Dunării <a class="pin-link" href="#stories/1856">vezi articol</a> și porto-francului recent încheiat. Dar satele din jurul său trăiau într-o sărăcie lucie, într-un contrast aproape medieval. Teama că masele de țărani înfuriați ar putea invada marele port comercial a forțat autoritățile locale să ceară <strong>intervenția imediată a armatei</strong>.</p>

          <h2>Tragedia Regimentului 11 Dorobanți „Siret"</h2>
          <p>Pentru a înăbuși revolta, guvernul de la București (sub conducerea lui Dimitrie A. Sturdza, format în martie 1907) a ordonat reprimarea armată fără milă a răsculaților. La Galați, această sarcină ingrată și tragică i-a revenit legendarei unități locale: <strong>Regimentul 11 Dorobanți „Siret"</strong>.</p>
          <p>Înființat în <strong>1872</strong>, acesta era regimentul de elită al orașului, glorificat pentru eroismul său la <strong>Grivița</strong> în Războiul de Independență (1877). Avea să participe ulterior la toate marile conflicte ale României: cele Două Războaie Balcanice, Primul Război Mondial (inclusiv Bătălia de la Galați din 1918 <a class="pin-link" href="#stories/1918">vezi articol</a>), campania din 1919 și Al Doilea Război Mondial.</p>
          <p>Tragedia anului 1907: în martie, ofițerii și soldații gălățeni — mulți dintre ei proveniți chiar din satele aflate în revoltă — au primit <strong>ordinul cumplit de a trage în frații și părinții lor</strong>.</p>

          <h2>Împușcarea în masă</h2>
          <p>Represiunea a fost cruntă. Documentele vorbesc despre „împușcarea în masă a țărănimii" la Galați și în comunele limitrofe. S-au folosit <strong>tunurile și armamentul de infanterie</strong> pentru a împrăștia cetele de răsculați. Multe conace fuseseră deja incendiate, dar răspunsul armatei a lăsat în urmă <strong>sute de morți</strong> în județ — cifrele exacte au fost mușamalizate ulterior de autorități, ca în restul țării. Bilanțul total neoficial al represiunii la nivel național ar fi ajuns la <strong>10.000 de victime</strong> (după estimările istoricilor postbelici; cifrele oficiale au fost mult mai mici).</p>

          <h2>Epilogul unui martie sângeros</h2>
          <p>Până la sfârșitul lunii martie, liniștea fusese restabilită — dar era liniștea mormintelor. Răscoala de la 1907 a lăsat o cicatrice adâncă în societatea românească. Soldații din Regimentul 11 Dorobanți au rămas cu trauma executării unui ordin nefiresc, iar țăranii din Covurlui au fost reduși la tăcere, așteptând încă un deceniu — până la <strong>Primul Război Mondial</strong> și <strong>reforma agrară din 1921</strong> (sub guvernul Averescu) — pentru a fi, în sfârșit, împroprietăriți cu pământ.</p>
          <p>Un paradox al istoriei: aceiași soldați care în martie 1907 reprimaseră răsculații aveau să devină, doar 11 ani mai târziu, eroii apărării Galațiului împotriva Corpului 4 Siberian bolșevizat <a class="pin-link" href="#stories/1918">vezi Bătălia 1918</a>. Tragedia de la 1907 a fost preludiul tăcut al unei mobilizări masive care a culminat în Marele Război.</p>

          <div class="sources">
            <p><strong>Surse</strong></p>
            <ul>
              <li>Cilinca Victor, <em>Abecedar istoric gălățean</em>.</li>
              <li>Săndel Dumitru, <em>Galațiul, așa cum mi-l amintesc</em>, vol. VI–VII (perioada belle époque și Marele Război).</li>
              <li>Documentele Regimentului 11 Dorobanți „Siret" (înființat 1872, sediu la Galați) — istoricul de unitate.</li>
              <li><a href="https://ro.wikipedia.org/wiki/R%C4%83scoala_din_1907" target="_blank" rel="noopener">Răscoala din 1907 (Wikipedia)</a> — context național, cifrele estimate ale victimelor.</li>
              <li>Arhivele Naționale, dosarele administrației județene Covurlui pentru anul 1907 (Direcția Județeană Galați).</li>
            </ul>
          </div>
        `,
      },
      {
        id: '1944', year: '1944', title: 'Sfârșitul Pieței Regale',
        eyebrow: '24–25 august 1944 · Retragere germană',
        hook: 'O noapte de foc la Galați. Inima cosmopolită a portului, „Micul Paris", e detonată sistematic de geniștii germani în retragere. Niciodată reconstruită.',
        cover: '../assets/images/event-covers/1944-piata-regala-card.jpg',
        coverFull: '../assets/images/event-covers/1944-piata-regala.jpg',
        content: `
          <p class="article-lede">Dacă astăzi ne-am plimba prin centrul Galațiului, pe locul străzilor moderne și al blocurilor anoste din epoca comunistă a existat cândva un loc de o vibrație uluitoare: <strong>Piața Regală</strong>. Numele său oficial fusese consfințit în <strong>1884</strong> de Consiliul Comunal, iar de-a lungul deceniilor devenise un autentic „Mic Paris" la Dunăre. Aici se aliniau, pe „Corso"-ul gălățean, cafenele selecte, cofetării cu prăjituri vieneze, magazine de lux, <strong>Casa Fanciotti</strong> și grandiosul <strong>Hotel Bristol</strong>. Din centrul pieței, de pe un piedestal impozant, statuia lui <strong>Costache Negri</strong> (inaugurată în <strong>1912</strong>) veghea asupra efervescenței cosmopolite a portului.</p>
          <p>Totul avea să fie șters de pe fața pământului într-o singură noapte.</p>

          <h2>Tensiunea întoarcerii armelor</h2>
          <p>Pentru a înțelege dezastrul, trebuie să privim calendarul: <strong>august 1944</strong>. După ani de alianță cu Germania, ziua de <strong>23 august 1944</strong> a adus șocul care avea să schimbe soarta României: lovitura de stat prin care Regele <strong>Mihai I</strong> a întors armele împotriva Germaniei Naziste și a alăturat țara Națiunilor Unite.</p>
          <p>La Galați, vestea a căzut ca un trăsnet peste garnizoana și spitalele militare germane. Până pe 22 august, orașul fusese plin de trupe germane, de răniți evacuați de pe Frontul de Est și de ofițeri care se plimbau liberi pe Corso. Acum, brusc, foștii lor aliați le deveniseră inamici, iar temuta Armată Roșie — care rupsese deja liniile româno-germane pe <strong>20 august</strong>, în <a href="https://en.wikipedia.org/wiki/Second_Jassy%E2%80%93Kishinev_offensive" target="_blank" rel="noopener">faimoasa ofensivă Iași–Chișinău</a> — se apropia periculos.</p>

          <h2>Pământul pârjolit de pe Corso</h2>
          <p>Confruntați cu înfrângerea și nevoiți să se retragă de urgență spre nord, trupele germane au aplicat o tactică nemiloasă, lăsând în urmă doar distrugere. <strong>În noaptea de 24 spre 25 august 1944</strong>, geniștii armatei germane în retragere au minat sistematic clădirile din centrul orașului.</p>
          <p>Conform mărturiilor soldaților germani aflați în spitalul orașului în acea noapte, a fost o noapte de teroare. Rând pe rând, superbele clădiri din Piața Regală — cu arhitectura lor eclectică și neoclasică — au fost detonate. Din „Micul Paris" a mai rămas doar o imensă grămadă de moloz fumegând, cratere, fiare contorsionate și ziduri prăbușite. Galațiul central devenise un peisaj selenar, pârjolit și pustiit.</p>
          <p>Când dimineața zilei de <strong>25 august</strong> a luminat orașul, gălățenii ieșiți din adăposturi au găsit inima comercială pulverizată. O singură prezență mai stătea în picioare, aproape miraculos, în mijlocul deșertului de moloz: <strong>statuia lui Costache Negri</strong>. Afumată de explozii, dar intactă, a devenit singura supraviețuitoare a nopții de foc.</p>

          <h2>Ceea ce războiul a distrus, comunismul a uitat</h2>
          <p>Câteva zile mai târziu, pe <strong>27 august 1944</strong>, trupele sovietice au intrat în Galați, capturând mii de prizonieri și găsind orașul sfâșiat.</p>
          <p>Deși imediat după război anumiți supraviețuitori ai familiilor burgheze gălățene au cerut refacerea vechilor clădiri, soarta Pieței Regale era deja pecetluită. Noul regim comunist instalat nu avea niciun interes să reconstruiască simbolurile „Micului Paris" și ale burgheziei comerciale. Ruinele au fost pur și simplu nivelate cu buldozerele, lăsând locul blocurilor gri din zilele noastre și sistematizării comuniste care i-a șters aproape complet forma inițială.</p>
          <p>Astfel, Piața Regală a murit de două ori: o dată sub explozibilul nemțesc și a doua oară sub uitarea impusă de autoritățile epocii care a urmat. Astăzi, frumusețea ei mai trăiește doar în fotografii de epocă sepia și în amintirile tot mai rare ale unui oraș-port la Dunăre care odată concura cu marile capitale ale Europei.</p>

          <div class="sources">
            <p><strong>Surse</strong></p>
            <ul>
              <li>Săndel Dumitru, <em>Galațiul, așa cum mi-l amintesc</em>, vol. IX (capitolul despre Piața Regală).</li>
              <li>Cilinca Victor, <em>Abecedar istoric gălățean</em>.</li>
              <li>„Royal Square and Corso of Galați" — articol academic privind urbanismul interbelic.</li>
              <li>Mărturii ale soldaților germani aflați în spitalul orașului în noaptea de 24/25 august 1944.</li>
              <li>Surse oficiale despre <a href="https://en.wikipedia.org/wiki/Second_Jassy%E2%80%93Kishinev_offensive" target="_blank" rel="noopener">ofensiva Iași–Chișinău</a> (20–29 august 1944).</li>
            </ul>
          </div>
        `,
      },
      {
        id: '1962', year: '1962–1963', title: 'Războiul cu istoria: bisericile-monument distruse de comuniști',
        eyebrow: 'Decembrie 1962 – decembrie 1963',
        hook: 'Doi ani. Două crime arhitecturale. O cicatrice care nu s-a vindecat. Cum a șters sistematizarea comunistă șapte secole de istorie a Galațiului.',
        cover: '../assets/images/event-covers/1962-demolari-card.jpg',
        coverFull: '../assets/images/event-covers/1962-demolari.jpg',
        content: `
          <p class="article-lede">Sistematizarea comunistă din anii '60 a lăsat răni adânci pe fața Galațiului. Sub pretextul modernizării și al construirii „noului oraș muncitoresc", autoritățile vremii au șters de pe hartă monumente cu o valoare inestimabilă, vechi de secole. Două dintre cele mai dramatice episoade de distrugere arhitecturală și spirituală s-au petrecut în <strong>1962</strong> și <strong>1963</strong>.</p>
          <p>A existat o vreme când profilul falezei Dunării la Galați era dominat de turlele unor biserici masive, construite din piatră de castru roman și rezistente la secole de invazii. Ceea ce nu au reușit otomanii și războaiele, a reușit febra sistematizării comuniste — în doar doi ani.</p>

          <h2>Sfântul Gheorghe: biserica trasă în Dunăre cu vapoarele</h2>
          <p class="ev-note">Octombrie–decembrie 1962</p>
          <p>Cea mai mare crimă culturală a Galațiului comunist rămâne demolarea Bisericii <strong>„Sfântul Gheorghe"</strong> <a class="pin-link" href="#map" data-loc="loc-96">vezi pin</a>. Sfințită la <strong>1 aprilie 1664</strong> prin osârdia lui Hagi Mihalachi din Galați, pe un promontoriu al falezei (în spatele actualului Hotel Vega), biserica forma o pereche defensivă perfectă cu Biserica fortificată <strong>Precista</strong>, situată la doar 300 de metri distanță.</p>
          <p>Aici, sub lespezile bisericii, au odihnit din <strong>martie 1710</strong> osemintele celebrului hatman cazac <strong>Ivan Mazepa</strong>, eroul național al Ucrainei. Mazepa murise la Bender după bătălia de la Poltava (1709) și fusese reînhumat aici cu finanțarea regelui Carol XII al Suediei.</p>
          <p>Zidurile sale erau atât de masive — construite parțial cu blocuri de piatră extrase din castrul roman de la <strong>Tirighina-Barboși</strong>, piatră veche de 1.500 de ani refolosită — încât atunci când autoritățile comuniste, prin Constantin Dăscălescu (viitor prim-ministru al regimului ceaușist), au ordonat demolarea în toamna lui 1962, constructorii au fost învinși de structură. S-a încercat <strong>injectarea a sute de tone de apă sub fundație</strong> pentru a o destabiliza. Zidurile au rezistat.</p>
          <p>Soluția finală a fost de un barbarism mecanic înfiorător: în <strong>noaptea de 29 spre 30 octombrie 1962</strong> (cu finalizarea în decembrie), comuniștii au adus remorcherele flotei <strong>Navrom</strong>. Au legat biserica cu cabluri groase de oțel trase de pe fluviu și, prin forța brută a motoarelor navale, au smuls clădirea de pe mal, trăgând-o direct în apele Dunării. Odată cu ea s-au pierdut pentru totdeauna osemintele lui Mazepa și peste 300 de ani de istorie. Astăzi, două cartiere ale Galațiului (<strong>Mazepa 1</strong> și <strong>Mazepa 2</strong>) îi poartă încă numele, deși mormântul nu mai e niciunde.</p>

          <h2>Sfânta Sofia: zidurile sfărâmate cu tancul</h2>
          <p class="ev-note">Decembrie 1963</p>
          <p>Doar un an mai târziu, în <strong>decembrie 1963</strong>, a urmat un alt act de forță împotriva patrimoniului orașului. Vizați erau acum locuitorii din zona mai centrală, unde se afla biserica <strong>„Sfânta Sofia"</strong> <a class="pin-link" href="#map" data-loc="loc-97">vezi pin</a>. Piatra de temelie a acestei biserici fusese pusă în <strong>1872</strong>, iar lăcașul fusese sfințit în <strong>1880</strong> (după Pr. Eugen Drăgoi, <em>Scurtă cronologie a istoriei bisericești</em>).</p>
          <p>Motivul demolării? Construirea noii <strong>Case de Cultură a Sindicatelor</strong>. Din nou, arhitectura veche s-a dovedit mai trainică decât utilajele de construcții ale anilor '60. Pentru a grăbi procesul de demolare, în plină iarnă, autoritățile au decis să folosească <strong>forța armatei</strong>. Conform memoriei locale și documentelor vremii, zidurile Sfintei Sofia au fost dărâmate efectiv lovite cu <strong>tancul</strong>.</p>
          <p>Peste ruinele ei s-a turnat rapid beton. Construcția Casei de Cultură a început în <strong>august 1966</strong> și s-a încheiat în <strong>4 octombrie 1969</strong>, când a fost inaugurată și închinată liderului comunist <strong>Gheorghe Gheorghiu-Dej</strong>. Pe esplanadă, din 1971 până la <strong>22 decembrie 1989</strong>, a tronat un bust masiv din bronz al lui Dej — dărâmat de mulțime în zilele Revoluției.</p>

          <h2>Miracolul supraviețuirii: bisericile salvate în ultima clipă</h2>
          <p>Același elan distructiv a vizat și alte lăcașuri:</p>
          <ul>
            <li><strong>Biserica Armenească</strong> — comunitate veche de două secole în Galați. Salvarea ei se datorează în mare parte presiunilor diplomatice și protestelor.</li>
            <li><strong>Biserica fortificată Precista</strong> (1647) — cea mai veche clădire a Galațiului, sora geamănă cu Sf. Gheorghe. Doar protestele vehemente ale unor oameni de cultură și probabil teama de a repeta efortul logistic uriaș au salvat-o în ultima clipă.</li>
            <li><strong>Mavromol</strong> (ctitorie Antioh Cantemir, începutul sec. XVIII) — încă în picioare.</li>
            <li><strong>Vovidenia</strong>, <strong>Sf. Spiridon</strong>, <strong>Sf. Apostoli</strong> — supraviețuiesc, deși ultimele două au fost vizate în diferite momente.</li>
          </ul>

          <h2>Și sinagogile: o pierdere uitată</h2>
          <p>Distrugerea patrimoniului religios al Galațiului nu a început în 1962. Mult mai devreme, în <strong>1942</strong>, faimosul <strong>Templu Coral</strong> (cea mai mare sinagogă a orașului) a fost dărâmat de regimul antonescian-legionar, în plină prigoană antisemită. Astăzi, dintre cele 22 de sinagogi active la apogeul comunității evreiești gălățene, mai funcționează <strong>una singură</strong>: <strong>Templul Meseriașilor</strong>, restaurat în 2014.</p>

          <h2>O cicatrice care nu s-a vindecat</h2>
          <p>Distrugerea Sfintei Sofia și a Sfântului Gheorghe au lăsat o gaură imensă în identitatea orașului Galați — o cicatrice urbană care nu s-a vindecat niciodată complet. Plăcuțe comemorative și două cartiere care îi poartă numele lui Mazepa sunt singurele urme ale celor două biserici care au definit silueta Dunării gălățene timp de trei secole.</p>

          <div class="sources">
            <p><strong>Surse</strong></p>
            <ul>
              <li>Pr. Eugen Drăgoi, <em>Scurtă cronologie a istoriei bisericești în spațiul gălățean</em> — datele de zidire/sfințire a bisericilor.</li>
              <li>Cilinca Victor, <em>Abecedar istoric gălățean</em>.</li>
              <li>Săndel Dumitru, <em>Galațiul, așa cum mi-l amintesc</em>, vol. VIII–IX.</li>
              <li>Mărturii orale ale gălățenilor martori ai demolării (1962–1963).</li>
              <li>Arhive municipale Galați — documentele privind autorizarea demolărilor și construcția Casei de Cultură.</li>
            </ul>
          </div>
        `,
      },
    ];
    // 1918 has a full article inline; 1821, 1856, 1907, 1944, 1962 have
    // structured content rendered dynamically via the `content` field below.
    const READY_EVENT_IDS = new Set(['1821', '1856', '1907', '1918', '1944', '1962']);

    const eventsGrid = document.getElementById('events-grid');
    const evSingle = document.getElementById('ev-single');
    const evHero = document.getElementById('events-hero');
    const evBack = document.getElementById('ev-back');
    const ev1918 = document.getElementById('ev-1918');
    const evSoon = document.getElementById('ev-soon');

    function renderEventsGrid() {
      if (!eventsGrid) return;
      // Curated card for 1918 first, then the rest in chronological order
      const items = [...EVENT_ARTICLES, {
        id: '1918', year: '1918', title: 'Bătălia de la Galați',
        eyebrow: '20 – 22 ianuarie 1918',
        hook: 'Cum o garnizoană fragmentară a oprit Corpul 4 Siberian bolșevizat și a schimbat soarta Europei.',
        cover: '../assets/images/comic-1918/cover.jpg',
      }].sort((a, b) => parseInt(a.id, 10) - parseInt(b.id, 10));
      eventsGrid.innerHTML = items.map((ev) => {
        const ready = READY_EVENT_IDS.has(ev.id);
        const status = ready ? 'Descoperă povestea' : 'În pregătire';
        const cover = ev.cover || (EVENT_ARTICLES.find(e => e.id === ev.id) || {}).cover;
        if (cover) {
          return `<button class="ev-card has-cover" type="button" data-event="${ev.id}" data-status="${ready ? 'ready' : 'soon'}">
            <img class="card-cover" src="${escapeHtml(cover)}" alt="${escapeHtml(ev.title)}" loading="lazy">
            <div class="card-body">
              <div class="card-year">${escapeHtml(ev.year)}</div>
              <h3 class="card-title">${escapeHtml(ev.title)}</h3>
              <p class="card-hook">${escapeHtml(ev.hook)}</p>
              <span class="card-status">${status} →</span>
            </div>
          </button>`;
        }
        return `<button class="ev-card" type="button" data-event="${ev.id}" data-status="${ready ? 'ready' : 'soon'}">
          <div class="card-year">${escapeHtml(ev.year)}</div>
          <h3 class="card-title">${escapeHtml(ev.title)}</h3>
          <p class="card-hook">${escapeHtml(ev.hook)}</p>
          <span class="card-status">${status} →</span>
        </button>`;
      }).join('');
      eventsGrid.querySelectorAll('.ev-card').forEach(card => {
        card.addEventListener('click', () => {
          const id = card.dataset.event;
          location.hash = '#stories/' + id;
        });
      });
    }

    // ─── Comic reader for 1918 article ───
    (function setupComicReader() {
      const reader = document.getElementById('comic-reader');
      if (!reader) return;
      const total = parseInt(reader.dataset.pages, 10) || 18;
      const pageImg = document.getElementById('comic-page');
      const prevBtn = document.getElementById('comic-prev');
      const nextBtn = document.getElementById('comic-next');
      const counter = document.getElementById('comic-counter');
      const thumbs = document.getElementById('comic-thumbs');
      const fsBtn = document.getElementById('comic-fullscreen');
      let currentPage = 1;
      const pad = (n) => String(n).padStart(2, '0');
      const pageUrl = (n) => `../assets/images/comic-1918/${pad(n)}.jpg`;
      const thumbUrl = (n) => `../assets/images/comic-1918/thumb-${pad(n)}.jpg`;

      // Build thumbs
      const thumbButtons = [];
      for (let i = 1; i <= total; i++) {
        const b = document.createElement('button');
        b.type = 'button';
        b.dataset.page = String(i);
        b.title = `Pagina ${i}`;
        const img = document.createElement('img');
        img.src = thumbUrl(i);
        img.alt = `Pagina ${i}`;
        img.loading = 'lazy';
        b.appendChild(img);
        b.addEventListener('click', () => goTo(i));
        thumbs.appendChild(b);
        thumbButtons.push(b);
      }

      function goTo(n) {
        if (n < 1 || n > total) return;
        currentPage = n;
        pageImg.src = pageUrl(n);
        pageImg.alt = `Bătălia de la Galați — pagina ${n}`;
        counter.textContent = `Pagina ${n} / ${total}`;
        prevBtn.disabled = (n === 1);
        nextBtn.disabled = (n === total);
        thumbButtons.forEach((b, idx) => b.classList.toggle('active', idx + 1 === n));
        // Scroll active thumb into view
        const active = thumbButtons[n - 1];
        if (active) active.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
      prevBtn.addEventListener('click', () => goTo(currentPage - 1));
      nextBtn.addEventListener('click', () => goTo(currentPage + 1));

      // Keyboard nav when reader is visible (1918 article open) or fullscreen
      document.addEventListener('keydown', (e) => {
        const onPage = !reader.closest('.ev-content[hidden]') && (
          reader.classList.contains('fullscreen') ||
          (location.hash || '').startsWith('#stories/1918')
        );
        if (!onPage) return;
        // Don't hijack arrows when typing in inputs
        const t = e.target;
        if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
        if (e.key === 'ArrowLeft') { e.preventDefault(); goTo(currentPage - 1); }
        else if (e.key === 'ArrowRight') { e.preventDefault(); goTo(currentPage + 1); }
        else if (e.key === 'Escape' && reader.classList.contains('fullscreen')) {
          toggleFullscreen(false);
        }
      });

      // Touch swipe
      let touchStartX = null;
      pageImg.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
      pageImg.addEventListener('touchend', (e) => {
        if (touchStartX === null) return;
        const dx = e.changedTouches[0].clientX - touchStartX;
        if (Math.abs(dx) > 40) goTo(currentPage + (dx < 0 ? 1 : -1));
        touchStartX = null;
      });

      function toggleFullscreen(force) {
        const want = (typeof force === 'boolean') ? force : !reader.classList.contains('fullscreen');
        reader.classList.toggle('fullscreen', want);
        fsBtn.textContent = want ? '× Închide' : '⤢ Fullscreen';
      }
      fsBtn.addEventListener('click', () => toggleFullscreen());

      goTo(1);
    })();
    renderEventsGrid();

    function showEventsGrid() {
      if (evHero) evHero.hidden = false;
      if (eventsGrid) eventsGrid.hidden = false;
      if (evSingle) evSingle.hidden = true;
    }
    function showEventArticle(id) {
      if (evHero) evHero.hidden = true;
      if (eventsGrid) eventsGrid.hidden = true;
      if (!evSingle) return;
      evSingle.hidden = false;
      const evFull = document.getElementById('ev-full');
      // Hide all article slots, then unhide the matching one
      [ev1918, evSoon, evFull].forEach(a => { if (a) a.hidden = true; });
      if (id === '1918' && ev1918) {
        ev1918.hidden = false;
      } else {
        const meta = EVENT_ARTICLES.find(e => e.id === id);
        if (!meta) {
          // Unknown id → fall back to grid
          location.hash = '#stories';
          return;
        }
        // Article with full HTML content (e.g. 1944) → use ev-full template
        if (meta.content && evFull) {
          const heroImg = evFull.querySelector('[data-slot="cover"]');
          if (heroImg) {
            if (meta.coverFull || meta.cover) {
              heroImg.src = meta.coverFull || meta.cover;
              heroImg.alt = meta.title;
              heroImg.hidden = false;
            } else {
              heroImg.hidden = true;
              heroImg.src = '';
            }
          }
          evFull.querySelector('[data-slot="eyebrow"]').textContent = meta.eyebrow || meta.year;
          evFull.querySelector('[data-slot="title"]').textContent = meta.title;
          evFull.querySelector('[data-slot="hook"]').textContent = meta.hook || '';
          evFull.querySelector('[data-slot="content"]').innerHTML = meta.content;
          evFull.hidden = false;
        } else if (evSoon) {
          // Fallback: schiță template (arc narativ + surse)
          evSoon.querySelector('[data-slot="eyebrow"]').textContent = meta.eyebrow || (meta.year + ' · în pregătire');
          evSoon.querySelector('[data-slot="title"]').textContent = meta.title;
          evSoon.querySelector('[data-slot="hook"]').textContent = meta.hook || '';
          const arcEl = evSoon.querySelector('[data-slot="arc"]');
          arcEl.innerHTML = (meta.arc || []).map(b => `<li>${escapeHtml(b)}</li>`).join('');
          evSoon.querySelector('[data-slot="sources"]').textContent = meta.sources || '';
          evSoon.hidden = false;
        }
      }
      // Scroll page to top after content swap
      const pg = document.getElementById('page-events');
      if (pg) pg.scrollTop = 0;
    }
    function syncEventsRoute() {
      const h = location.hash || '';
      const m = h.match(/^#stories\/([\w-]+)$/);
      if (m) {
        showEventArticle(m[1]);
      } else {
        showEventsGrid();
      }
    }
    if (evBack) evBack.addEventListener('click', () => { location.hash = '#stories'; });
    window.addEventListener('hashchange', syncEventsRoute);
    // Initial sync — preserve any sub-route the user may have landed on
    // (activatePage above may have stripped it via replaceState).
    {
      const subAtBoot = (typeof initialHash !== 'undefined') ? initialHash.split('/').slice(1).join('/') : '';
      const baseAtBoot = (typeof initialHash !== 'undefined') ? initialHash.split('/')[0] : '';
      if (baseAtBoot === 'stories' && subAtBoot) {
        if (history.replaceState) history.replaceState(null, '', '#stories/' + subAtBoot);
        showEventArticle(subAtBoot);
      } else {
        syncEventsRoute();
      }
    }

    // ─── Add-pin tool ───────────────────────────────────────────
    const apFab = document.getElementById('add-pin-fab');
    const apModal = document.getElementById('add-pin-modal');
    const apClose = document.getElementById('add-pin-close');
    const apCancel = document.getElementById('ap-cancel');
    const apForm = document.getElementById('add-pin-form');
    const apTitle = document.getElementById('ap-title');
    const apLocation = document.getElementById('ap-location');
    const apCategory = document.getElementById('ap-category');
    const apLat = document.getElementById('ap-lat');
    const apLon = document.getElementById('ap-lon');
    const apPick = document.getElementById('ap-pick');
    const apCoordStatus = document.getElementById('ap-coord-status');
    const apExcerpt = document.getElementById('ap-excerpt');
    const apDescription = document.getElementById('ap-description');
    const apCredit = document.getElementById('ap-credit');
    const apYearBuilt = document.getElementById('ap-year-built');
    const apYearDemolished = document.getElementById('ap-year-demolished');
    const apStatus = document.getElementById('ap-status');
    const apDemolishField = document.getElementById('ap-demolish-field');
    function syncDemolishVisibility() {
      const v = apStatus.value;
      apDemolishField.style.display = (v === 'demolished' || v === 'lost') ? 'block' : 'none';
      if (v === 'active' || v === 'ruin') apYearDemolished.value = '';
    }
    apStatus.addEventListener('change', syncDemolishVisibility);
    const apImage = document.getElementById('ap-image');
    const apPreview = document.getElementById('ap-preview');
    const apDropHint = document.getElementById('ap-drop-hint');
    const apSubmit = document.getElementById('ap-submit');
    const apFeedback = document.getElementById('ap-feedback');
    const apBanner = document.getElementById('add-pin-banner');
    const apCancelPlace = document.getElementById('add-pin-cancel-place');

    // Fill category dropdown from existing data
    function fillCategoryDropdown() {
      const cats = [...new Set(locations.map(l => l.category).filter(Boolean))].sort((a,b) => a.localeCompare(b,'ro'));
      apCategory.innerHTML = cats.map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('') +
        '<option value="Alte locuri">Alte locuri</option>';
      apCategory.value = 'Alte locuri';
    }
    fillCategoryDropdown();

    let editingLocationId = null;
    function openAddPinModal() {
      apFeedback.textContent = '';
      apFeedback.className = 'feedback';
      apModal.classList.add('open');
    }
    function closeAddPinModal() {
      apModal.classList.remove('open');
      exitPlaceMode();
      editingLocationId = null;
      const titleEl = document.getElementById('add-pin-title');
      if (titleEl) titleEl.textContent = 'Obiectiv nou';
      apSubmit.textContent = 'Salvează';
      const delBtn = document.getElementById('ap-delete');
      if (delBtn) delBtn.style.display = 'none';
    }
    function resetAddPinForm() {
      apForm.reset();
      apPreview.src = '';
      apPreview.style.display = 'none';
      apDropHint.textContent = 'Click sau drag & drop pentru a alege o imagine (max 25MB)';
      apCoordStatus.textContent = 'Click pe „Pe hartă" sau introdu lat/lon manual.';
      apCoordStatus.classList.remove('ok');
      apFeedback.textContent = '';
      apFeedback.className = 'feedback';
      fillCategoryDropdown();
      apStatus.value = 'active';
      syncDemolishVisibility();
      if (apGalleryThumbs) apGalleryThumbs.innerHTML = '';
      if (apGalleryHint) apGalleryHint.textContent = 'Click sau drag & drop pentru mai multe imagini · sub fiecare poți scrie o descriere';
      if (apGalleryExisting) {
        apGalleryExisting.innerHTML = '';
        apGalleryExisting.style.display = 'none';
      }
      galleryNewCaptions = [];
      // Reset before/after section
      const cmpToggle = document.getElementById('ap-compare-toggle');
      const cmpGroup  = document.getElementById('ap-compare-group');
      const thenPrev  = document.getElementById('ap-then-preview');
      const nowPrev   = document.getElementById('ap-now-preview');
      const thenYear  = document.getElementById('ap-image-then-year');
      const nowYear   = document.getElementById('ap-image-now-year');
      if (cmpToggle) cmpToggle.checked = false;
      if (cmpGroup)  cmpGroup.style.display = 'none';
      if (thenPrev) { thenPrev.src = ''; thenPrev.style.display = 'none'; }
      if (nowPrev)  { nowPrev.src  = ''; nowPrev.style.display  = 'none'; }
      if (thenYear) thenYear.value = '';
      if (nowYear)  nowYear.value  = '';
    }

    function renderExistingGallery(item) {
      if (!apGalleryExisting) return;
      const gal = Array.isArray(item.gallery) ? item.gallery : [];
      if (!gal.length) {
        apGalleryExisting.style.display = 'none';
        apGalleryExisting.innerHTML = '';
        return;
      }
      apGalleryExisting.style.display = 'grid';
      apGalleryExisting.innerHTML = gal.map((g) => {
        const src = (g && g.src) ? g.src : '';
        const caption = (g && (g.alt || g.caption)) || '';
        return `<div class="ge-item" data-src="${escapeHtml(src)}">
          <img src="${escapeHtml(src)}" alt="">
          <input type="text" class="ge-caption" value="${escapeHtml(caption)}" placeholder="Descriere imagine…">
          <button type="button" class="ge-rm" title="Șterge din galerie">×</button>
        </div>`;
      }).join('');
      apGalleryExisting.querySelectorAll('.ge-rm').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          const itemEl = btn.closest('.ge-item');
          if (itemEl) itemEl.classList.toggle('removed');
        });
      });
    }

    function openEditLocation(id) {
      const item = locations.find(l => l.id === id);
      if (!item) return;
      resetAddPinForm();
      editingLocationId = id;
      apTitle.value = item.title || '';
      apLocation.value = item.location || '';
      // Make sure category exists in dropdown (re-add if missing)
      if (item.category && ![...apCategory.options].some(o => o.value === item.category)) {
        const opt = document.createElement('option');
        opt.value = item.category;
        opt.textContent = item.category;
        apCategory.appendChild(opt);
      }
      apCategory.value = item.category || 'Alte locuri';
      apLat.value = (item.lat || '').toString();
      apLon.value = (item.lon || '').toString();
      apExcerpt.value = item.excerpt || '';
      apDescription.value = item.description || '';
      apCredit.value = item.local_credit || '';
      apYearBuilt.value = (item.year_built !== null && item.year_built !== undefined) ? String(item.year_built) : '';
      apYearDemolished.value = (item.year_demolished !== null && item.year_demolished !== undefined) ? String(item.year_demolished) : '';
      apStatus.value = item.status || 'active';
      syncDemolishVisibility();
      renderExistingGallery(item);
      // Show existing image as preview if any
      if (item.image) {
        apPreview.src = item.image;
        apPreview.style.display = 'block';
        apDropHint.textContent = 'Imagine existentă — alege una nouă pentru a o înlocui';
      }
      // Populate before/after section if the item has both images
      const cmpToggle = document.getElementById('ap-compare-toggle');
      const cmpGroup  = document.getElementById('ap-compare-group');
      const thenPrev  = document.getElementById('ap-then-preview');
      const nowPrev   = document.getElementById('ap-now-preview');
      const thenYear  = document.getElementById('ap-image-then-year');
      const nowYear   = document.getElementById('ap-image-now-year');
      const hasThen = !!item.image_then;
      const hasNow  = !!item.image_now;
      if (cmpToggle) cmpToggle.checked = hasThen || hasNow;
      if (cmpGroup)  cmpGroup.style.display = (hasThen || hasNow) ? 'block' : 'none';
      if (hasThen && thenPrev) { thenPrev.src = item.image_then; thenPrev.style.display = 'block'; }
      if (hasNow  && nowPrev)  { nowPrev.src  = item.image_now;  nowPrev.style.display  = 'block'; }
      if (thenYear) thenYear.value = (item.image_then_year != null) ? String(item.image_then_year) : '';
      if (nowYear)  nowYear.value  = (item.image_now_year  != null) ? String(item.image_now_year)  : '';
      refreshCoordStatus();
      const titleEl = document.getElementById('add-pin-title');
      if (titleEl) titleEl.textContent = 'Editează obiectivul';
      apSubmit.textContent = 'Salvează modificări';
      const delBtn = document.getElementById('ap-delete');
      if (delBtn) delBtn.style.display = 'inline-block';
      openAddPinModal();
    }

    apFab.addEventListener('click', () => { resetAddPinForm(); openAddPinModal(); });
    apClose.addEventListener('click', closeAddPinModal);
    apCancel.addEventListener('click', closeAddPinModal);
    const apDelete = document.getElementById('ap-delete');
    if (apDelete) apDelete.addEventListener('click', async () => {
      if (!editingLocationId) return;
      if (!confirm('Sigur ștergi pinul „' + (apTitle.value || editingLocationId) + '"? Acțiunea e ireversibilă.')) return;
      apDelete.disabled = true;
      apDelete.textContent = 'Șterg…';
      try {
        const fd = new FormData();
        fd.append('id', editingLocationId);
        const res = await fetch('/api/delete-location', { method: 'POST', body: fd });
        const data = await res.json();
        if (!res.ok || !data.ok) throw new Error(data.error || ('HTTP ' + res.status));
        const idx = locations.findIndex(l => l.id === editingLocationId);
        if (idx >= 0) locations.splice(idx, 1);
        if (typeof render === 'function') render();
        apFeedback.className = 'feedback success';
        apFeedback.textContent = 'Pin șters.';
        setTimeout(closeAddPinModal, 700);
      } catch (err) {
        apFeedback.className = 'feedback error';
        apFeedback.textContent = 'Eroare: ' + err.message;
      } finally {
        apDelete.disabled = false;
        apDelete.textContent = 'Șterge';
      }
    });
    apModal.addEventListener('click', (e) => { if (e.target === apModal) closeAddPinModal(); });

    // Manual coord typing → update status
    function refreshCoordStatus() {
      const a = parseFloat(apLat.value), b = parseFloat(apLon.value);
      if (Number.isFinite(a) && Number.isFinite(b)) {
        apCoordStatus.textContent = `Coordonate: ${a.toFixed(6)}, ${b.toFixed(6)}`;
        apCoordStatus.classList.add('ok');
      } else {
        apCoordStatus.textContent = 'Click pe „Pe hartă" sau introdu lat/lon manual.';
        apCoordStatus.classList.remove('ok');
      }
    }
    apLat.addEventListener('input', refreshCoordStatus);
    apLon.addEventListener('input', refreshCoordStatus);

    // Place-pin mode: hide modal, change cursor, single-click captures coords
    let placeModeActive = false;
    function enterPlaceMode() {
      placeModeActive = true;
      apModal.classList.remove('open');
      document.body.classList.add('add-pin-placing');
      map.once('click', onPlaceClick);
    }
    function exitPlaceMode() {
      if (!placeModeActive) return;
      placeModeActive = false;
      document.body.classList.remove('add-pin-placing');
      map.off('click', onPlaceClick);
    }
    function onPlaceClick(e) {
      placeModeActive = false;
      document.body.classList.remove('add-pin-placing');
      apLat.value = e.latlng.lat.toFixed(6);
      apLon.value = e.latlng.lng.toFixed(6);
      refreshCoordStatus();
      openAddPinModal();
    }
    apPick.addEventListener('click', enterPlaceMode);
    apCancelPlace.addEventListener('click', () => {
      exitPlaceMode();
      openAddPinModal();
    });

    // Image preview
    apImage.addEventListener('change', () => {
      const file = apImage.files && apImage.files[0];
      if (!file) {
        apPreview.style.display = 'none';
        apDropHint.textContent = 'Click sau drag & drop pentru a alege o imagine (max 25MB)';
        return;
      }
      const url = URL.createObjectURL(file);
      apPreview.src = url;
      apPreview.style.display = 'block';
      apDropHint.textContent = file.name + ' · ' + Math.round(file.size / 1024) + ' KB';
    });

    // ─── Before/After comparison toggle + previews ───
    const apCompareToggle = document.getElementById('ap-compare-toggle');
    const apCompareGroup  = document.getElementById('ap-compare-group');
    const apImageThen     = document.getElementById('ap-image-then');
    const apImageNow      = document.getElementById('ap-image-now');
    const apThenPreview   = document.getElementById('ap-then-preview');
    const apNowPreview    = document.getElementById('ap-now-preview');
    const apThenHint      = document.getElementById('ap-then-hint');
    const apNowHint       = document.getElementById('ap-now-hint');
    if (apCompareToggle && apCompareGroup) {
      apCompareToggle.addEventListener('change', () => {
        apCompareGroup.style.display = apCompareToggle.checked ? 'block' : 'none';
      });
    }
    const wireFilePreview = (input, preview, hint, defaultHint) => {
      if (!input || !preview) return;
      input.addEventListener('change', () => {
        const file = input.files && input.files[0];
        if (!file) {
          preview.style.display = 'none';
          if (hint) hint.textContent = defaultHint;
          return;
        }
        preview.src = URL.createObjectURL(file);
        preview.style.display = 'block';
        if (hint) hint.textContent = file.name + ' · ' + Math.round(file.size / 1024) + ' KB';
      });
    };
    wireFilePreview(apImageThen, apThenPreview, apThenHint, 'Click sau drag & drop · imaginea istorică');
    wireFilePreview(apImageNow,  apNowPreview,  apNowHint,  'Click sau drag & drop · imaginea actuală');

    // Drag & drop into the file-drop area (featured image)
    const apDrop = document.getElementById('ap-drop');
    ['dragenter','dragover'].forEach(ev => apDrop.addEventListener(ev, (e) => { e.preventDefault(); apDrop.style.background = 'var(--accent-soft)'; }));
    ['dragleave','drop'].forEach(ev => apDrop.addEventListener(ev, () => { apDrop.style.background = ''; }));
    apDrop.addEventListener('drop', (e) => {
      e.preventDefault();
      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
        apImage.files = e.dataTransfer.files;
        apImage.dispatchEvent(new Event('change'));
      }
    });

    // Gallery (multi-file)
    const apGallery = document.getElementById('ap-gallery');
    const apGalleryDrop = document.getElementById('ap-gallery-drop');
    const apGalleryThumbs = document.getElementById('ap-gallery-thumbs');
    const apGalleryHint = document.getElementById('ap-gallery-hint');
    const apGalleryExisting = document.getElementById('ap-gallery-existing');
    // Captions for new gallery files (in same order as apGallery.files)
    let galleryNewCaptions = [];
    function refreshGalleryThumbs() {
      const files = apGallery.files;
      apGalleryThumbs.innerHTML = '';
      if (!files || !files.length) {
        apGalleryHint.textContent = 'Click sau drag & drop pentru mai multe imagini · sub fiecare poți scrie o descriere';
        galleryNewCaptions = [];
        return;
      }
      apGalleryHint.textContent = files.length + ' imagine' + (files.length === 1 ? '' : 'i') + ' selectate · adaugă o descriere sub fiecare (opțional)';
      // Resize captions array to match file count, preserving entered values
      while (galleryNewCaptions.length < files.length) galleryNewCaptions.push('');
      galleryNewCaptions.length = files.length;
      [...files].forEach((f, idx) => {
        const item = document.createElement('div');
        item.className = 'gt-item';
        const img = document.createElement('img');
        img.src = URL.createObjectURL(f);
        img.alt = f.name;
        const inp = document.createElement('input');
        inp.type = 'text';
        inp.placeholder = 'Descriere imagine…';
        inp.value = galleryNewCaptions[idx] || '';
        inp.addEventListener('input', () => { galleryNewCaptions[idx] = inp.value; });
        item.append(img, inp);
        apGalleryThumbs.appendChild(item);
      });
    }
    apGallery.addEventListener('change', refreshGalleryThumbs);
    ['dragenter','dragover'].forEach(ev => apGalleryDrop.addEventListener(ev, (e) => { e.preventDefault(); apGalleryDrop.style.background = 'var(--accent-soft)'; }));
    ['dragleave','drop'].forEach(ev => apGalleryDrop.addEventListener(ev, () => { apGalleryDrop.style.background = ''; }));
    apGalleryDrop.addEventListener('drop', (e) => {
      e.preventDefault();
      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length) {
        // Merge with existing selection (DataTransfer for FileList rebuild)
        const dt = new DataTransfer();
        if (apGallery.files) [...apGallery.files].forEach(f => dt.items.add(f));
        [...e.dataTransfer.files].forEach(f => dt.items.add(f));
        apGallery.files = dt.files;
        refreshGalleryThumbs();
      }
    });

    // Submit handler
    apForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      apFeedback.className = 'feedback';
      apFeedback.textContent = '';
      const lat = parseFloat(apLat.value), lon = parseFloat(apLon.value);
      if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
        apFeedback.classList.add('error');
        apFeedback.textContent = 'Setează coordonate valide (click pe hartă sau introdu manual).';
        return;
      }
      apSubmit.disabled = true;
      const wasEditing = editingLocationId;
      apSubmit.textContent = wasEditing ? 'Salvez modificări…' : 'Salvez…';
      try {
        const fd = new FormData(apForm);
        // Replace the multi-file gallery_images entries (already in fd from
        // the form) with explicit per-file captions in matching order.
        // Note: FormData preserves order of appends; the file inputs are
        // already serialized first by the form. We append captions next.
        const newCount = (apGallery.files && apGallery.files.length) || 0;
        for (let i = 0; i < newCount; i++) {
          fd.append('gallery_images_caption', galleryNewCaptions[i] || '');
        }
        // Before/After comparison handling. Three signals the server respects:
        //   compare_enabled=1     → keep image_then/image_now on the entry
        //   compare_enabled=0     → strip image_then/image_now from the entry
        //   image_then / image_now files (when present) → uploaded
        const compareOn = apCompareToggle && apCompareToggle.checked;
        fd.set('compare_enabled', compareOn ? '1' : '0');
        if (!compareOn) {
          // Don't send empty files when the toggle is off (server treats absence
          // + compare_enabled=0 as "clear").
          fd.delete('image_then');
          fd.delete('image_now');
        }
        let url = '/api/add-location';
        if (wasEditing) {
          fd.append('id', wasEditing);
          url = '/api/update-location';
          // Send list of existing gallery items to keep + per-item captions
          if (apGalleryExisting) {
            apGalleryExisting.querySelectorAll('.ge-item').forEach((it) => {
              if (it.classList.contains('removed')) return;
              const src = it.dataset.src || '';
              if (!src) return;
              const cap = it.querySelector('.ge-caption');
              fd.append('gallery_keep', src);
              fd.append('gallery_keep_caption', cap ? cap.value : '');
            });
          }
        }
        const res = await fetch(url, { method: 'POST', body: fd });
        const data = await res.json();
        if (!res.ok || !data.ok) {
          throw new Error(data.error || ('HTTP ' + res.status));
        }
        const entry = data.entry;
        if (wasEditing) {
          const idx = locations.findIndex(l => l.id === wasEditing);
          if (idx >= 0) locations[idx] = entry;
        } else {
          locations.push(entry);
        }
        if (typeof render === 'function') render();
        apFeedback.classList.add('success');
        apFeedback.textContent = wasEditing
          ? 'Modificat. Pinul s-a actualizat pe hartă.'
          : 'Salvat ca ' + entry.id + '. Pin-ul apare imediat pe hartă.';
        map.setView([entry.lat, entry.lon], Math.max(map.getZoom(), 16), { animate: true });
        const m = markers.get(entry.id);
        if (m) setTimeout(() => m.openPopup(), 300);
        setTimeout(closeAddPinModal, 1200);
      } catch (err) {
        apFeedback.classList.add('error');
        apFeedback.textContent = 'Eroare: ' + err.message;
      } finally {
        apSubmit.disabled = false;
        apSubmit.textContent = wasEditing ? 'Salvează modificări' : 'Salvează';
      }
    });

    // Esc key → close modal / cancel place mode
    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;
      if (placeModeActive) { exitPlaceMode(); openAddPinModal(); }
      else if (apModal.classList.contains('open')) closeAddPinModal();
    });

    // ─── Add-photo tool ─────────────────────────────────────────
    const aphFab = document.getElementById('add-photo-fab');
    const aphModal = document.getElementById('add-photo-modal');
    const aphClose = document.getElementById('add-photo-close');
    const aphCancel = document.getElementById('aph-cancel');
    const aphForm = document.getElementById('add-photo-form');
    const aphImage = document.getElementById('aph-image');
    const aphPreview = document.getElementById('aph-preview');
    const aphDropHint = document.getElementById('aph-drop-hint');
    const aphDrop = document.getElementById('aph-drop');
    const aphCaption = document.getElementById('aph-caption');
    const aphYear = document.getElementById('aph-year');
    const aphFolder = document.getElementById('aph-folder');
    const aphLat = document.getElementById('aph-lat');
    const aphLon = document.getElementById('aph-lon');
    const aphPick = document.getElementById('aph-pick');
    const aphCoordStatus = document.getElementById('aph-coord-status');
    const aphSubmit = document.getElementById('aph-submit');
    const aphFeedback = document.getElementById('aph-feedback');

    let editingPhotoSrc = null;
    function openPhotoModal() {
      aphFeedback.textContent = '';
      aphFeedback.className = 'feedback';
      aphModal.classList.add('open');
    }
    function closePhotoModal() {
      aphModal.classList.remove('open');
      exitPhotoPlaceMode();
      editingPhotoSrc = null;
      const titleEl = document.getElementById('add-photo-title');
      if (titleEl) titleEl.textContent = 'Fotografie nouă';
      aphSubmit.textContent = 'Salvează foto';
      aphImage.required = true;
      const delBtn = document.getElementById('aph-delete');
      if (delBtn) delBtn.style.display = 'none';
    }
    function resetPhotoForm() {
      aphForm.reset();
      aphFolder.value = 'local';
      aphPreview.src = '';
      aphPreview.style.display = 'none';
      aphDropHint.textContent = 'Click sau drag & drop pentru a alege o imagine (max 25MB)';
      aphCoordStatus.textContent = 'Click pe „Pe hartă" sau introdu lat/lon manual.';
      aphCoordStatus.classList.remove('ok');
      aphFeedback.textContent = '';
      aphFeedback.className = 'feedback';
    }

    function openEditPhoto(photo) {
      if (!photo) return;
      resetPhotoForm();
      editingPhotoSrc = photo.src;
      aphCaption.value = photo.caption_ro || '';
      aphYear.value = photo.year != null ? photo.year : '';
      aphFolder.value = photo.folder || 'local';
      aphLat.value = (photo.lat || '').toString();
      aphLon.value = (photo.lon || '').toString();
      // Show existing image; new upload is OPTIONAL when editing
      aphPreview.src = photo.src;
      aphPreview.style.display = 'block';
      aphDropHint.textContent = 'Imagine existentă — alege una nouă pentru a o înlocui (opțional)';
      aphImage.required = false;
      refreshPhotoCoordStatus();
      const titleEl = document.getElementById('add-photo-title');
      if (titleEl) titleEl.textContent = 'Editează foto';
      aphSubmit.textContent = 'Salvează modificări';
      const delBtn = document.getElementById('aph-delete');
      if (delBtn) delBtn.style.display = 'inline-block';
      openPhotoModal();
    }

    // Wire lightbox edit button
    const lightboxEdit = document.getElementById('lightbox-edit');
    if (lightboxEdit) lightboxEdit.addEventListener('click', () => {
      if (!activePhoto) return;
      delete lightbox.dataset.open;
      openEditPhoto(activePhoto);
    });

    aphFab.addEventListener('click', () => { resetPhotoForm(); openPhotoModal(); });
    aphClose.addEventListener('click', closePhotoModal);
    aphCancel.addEventListener('click', closePhotoModal);
    const aphDelete = document.getElementById('aph-delete');
    if (aphDelete) aphDelete.addEventListener('click', async () => {
      if (!editingPhotoSrc) return;
      if (!confirm('Sigur ștergi această fotografie? Acțiunea e ireversibilă.')) return;
      aphDelete.disabled = true;
      aphDelete.textContent = 'Șterg…';
      try {
        const fd = new FormData();
        fd.append('src', editingPhotoSrc);
        const res = await fetch('/api/delete-photo', { method: 'POST', body: fd });
        const data = await res.json();
        if (!res.ok || !data.ok) throw new Error(data.error || ('HTTP ' + res.status));
        // Remove the marker
        const idx = pubcrawlMarkers.findIndex(r => r.photo.src === editingPhotoSrc);
        if (idx >= 0) {
          const rec = pubcrawlMarkers[idx];
          if (pubcrawlLayer) pubcrawlLayer.removeLayer(rec.marker);
          pubcrawlMarkers.splice(idx, 1);
        }
        aphFeedback.className = 'feedback success';
        aphFeedback.textContent = 'Foto șters.';
        setTimeout(closePhotoModal, 700);
      } catch (err) {
        aphFeedback.className = 'feedback error';
        aphFeedback.textContent = 'Eroare: ' + err.message;
      } finally {
        aphDelete.disabled = false;
        aphDelete.textContent = 'Șterge';
      }
    });
    aphModal.addEventListener('click', (e) => { if (e.target === aphModal) closePhotoModal(); });

    function refreshPhotoCoordStatus() {
      const a = parseFloat(aphLat.value), b = parseFloat(aphLon.value);
      if (Number.isFinite(a) && Number.isFinite(b)) {
        aphCoordStatus.textContent = `Coordonate: ${a.toFixed(6)}, ${b.toFixed(6)}`;
        aphCoordStatus.classList.add('ok');
      } else {
        aphCoordStatus.textContent = 'Click pe „Pe hartă" sau introdu lat/lon manual.';
        aphCoordStatus.classList.remove('ok');
      }
    }
    aphLat.addEventListener('input', refreshPhotoCoordStatus);
    aphLon.addEventListener('input', refreshPhotoCoordStatus);

    let photoPlaceModeActive = false;
    function enterPhotoPlaceMode() {
      photoPlaceModeActive = true;
      aphModal.classList.remove('open');
      document.body.classList.add('add-pin-placing');
      apBanner.style.display = 'block';
      map.once('click', onPhotoPlaceClick);
    }
    function exitPhotoPlaceMode() {
      if (!photoPlaceModeActive) return;
      photoPlaceModeActive = false;
      document.body.classList.remove('add-pin-placing');
      apBanner.style.display = '';
      map.off('click', onPhotoPlaceClick);
    }
    function onPhotoPlaceClick(e) {
      photoPlaceModeActive = false;
      document.body.classList.remove('add-pin-placing');
      apBanner.style.display = '';
      aphLat.value = e.latlng.lat.toFixed(6);
      aphLon.value = e.latlng.lng.toFixed(6);
      refreshPhotoCoordStatus();
      openPhotoModal();
    }
    aphPick.addEventListener('click', enterPhotoPlaceMode);

    aphImage.addEventListener('change', () => {
      const file = aphImage.files && aphImage.files[0];
      if (!file) {
        aphPreview.style.display = 'none';
        aphDropHint.textContent = 'Click sau drag & drop pentru a alege o imagine (max 25MB)';
        return;
      }
      const url = URL.createObjectURL(file);
      aphPreview.src = url;
      aphPreview.style.display = 'block';
      aphDropHint.textContent = file.name + ' · ' + Math.round(file.size / 1024) + ' KB';
    });

    ['dragenter','dragover'].forEach(ev => aphDrop.addEventListener(ev, (e) => { e.preventDefault(); aphDrop.style.background = 'var(--accent-soft)'; }));
    ['dragleave','drop'].forEach(ev => aphDrop.addEventListener(ev, () => { aphDrop.style.background = ''; }));
    aphDrop.addEventListener('drop', (e) => {
      e.preventDefault();
      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
        aphImage.files = e.dataTransfer.files;
        aphImage.dispatchEvent(new Event('change'));
      }
    });

    aphForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      aphFeedback.className = 'feedback';
      aphFeedback.textContent = '';
      const lat = parseFloat(aphLat.value), lon = parseFloat(aphLon.value);
      if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
        aphFeedback.classList.add('error');
        aphFeedback.textContent = 'Setează coordonate valide (click pe hartă sau introdu manual).';
        return;
      }
      const isEdit = !!editingPhotoSrc;
      if (!isEdit && (!aphImage.files || !aphImage.files[0])) {
        aphFeedback.classList.add('error');
        aphFeedback.textContent = 'Imaginea e obligatorie pentru un foto-pin.';
        return;
      }
      aphSubmit.disabled = true;
      aphSubmit.textContent = isEdit ? 'Salvez modificări…' : 'Salvez…';
      try {
        const fd = new FormData(aphForm);
        let url = '/api/add-photo';
        if (isEdit) {
          fd.append('src', editingPhotoSrc);
          url = '/api/update-photo';
        }
        const res = await fetch(url, { method: 'POST', body: fd });
        const data = await res.json();
        if (!res.ok || !data.ok) throw new Error(data.error || ('HTTP ' + res.status));
        const photo = data.photo;
        if (isEdit) {
          // Update existing marker in place
          const rec = pubcrawlMarkers.find(r => r.photo.src === editingPhotoSrc);
          if (rec) {
            rec.photo = photo;
            rec.marker.setLatLng([photo.lat, photo.lon]);
          }
          refreshPubcrawlVisibility();
          aphFeedback.classList.add('success');
          aphFeedback.textContent = 'Modificat.';
          map.setView([photo.lat, photo.lon], Math.max(map.getZoom(), 17), { animate: true });
          setTimeout(closePhotoModal, 900);
          return;
        }
        // Add a new dot on the map immediately
        const m = L.marker([photo.lat, photo.lon], {
          icon: pubcrawlIcon(),
          zIndexOffset: -100,
          riseOnHover: true,
        });
        m.on('click', () => openPhotoLightbox(photo));
        pubcrawlMarkers.push({marker: m, photo});
        // refreshPubcrawlVisibility adaugă în cluster doar dacă photo trece
        // filtrul de timeline curent (paritate cu init).
        refreshPubcrawlVisibility();
        aphFeedback.classList.add('success');
        aphFeedback.textContent = 'Salvat. Bulina apare imediat pe hartă.';
        map.setView([photo.lat, photo.lon], Math.max(map.getZoom(), 17), { animate: true });
        setTimeout(closePhotoModal, 1100);
      } catch (err) {
        aphFeedback.classList.add('error');
        aphFeedback.textContent = 'Eroare: ' + err.message;
      } finally {
        aphSubmit.disabled = false;
        aphSubmit.textContent = isEdit ? 'Salvează modificări' : 'Salvează foto';
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;
      if (photoPlaceModeActive) { exitPhotoPlaceMode(); openPhotoModal(); }
      else if (aphModal.classList.contains('open')) closePhotoModal();
    });
    })();
  
