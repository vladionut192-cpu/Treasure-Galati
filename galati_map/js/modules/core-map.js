// Heritage Galați — modul: hartă Leaflet + markere/clustere + render() + panou detaliu
// + lightbox-galerie + before/after + filtre + căutare Fuse.js.
// Extras din main.js la refactorul în module ES (2026-06-10). Publică pe ctx
// serviciile partajate (render, openDetail, highlight, escapeHtml, ...).
export function initCoreMap(ctx) {
  const { locations, cartiere, toursData, toursRoutes } = ctx;
    const ICON_PATHS = {
      'Case istorice':       '<path d="M4 11l8-7 8 7v9a1 1 0 0 1-1 1h-4v-7H9v7H5a1 1 0 0 1-1-1z"/><path d="M4 11l8-7 8 7"/>',
      'Lăcașuri de cult':    '<path d="M12 2v4M10 4h4"/><path d="M5 22V12l7-4 7 4v10"/><path d="M9 22v-6h6v6"/>',
      'Palate':              '<path d="M3 10l9-6 9 6"/><path d="M5 10v10M19 10v10M9 10v10M15 10v10"/><path d="M3 21h18"/>',
      'Consulate':           '<path d="M5 21V4M5 4l11 1-2 4 2 4-11 1"/><path d="M5 21h6"/>',
      'Educație':            '<path d="M3 7l9-4 9 4-9 4-9-4z"/><path d="M7 9v5c0 2 2.5 3 5 3s5-1 5-3V9"/><path d="M21 7v6"/>',
      'Monumente':           '<path d="M10 2h4l-1 4h0v15h-2V6h0z"/><path d="M7 21h10"/>',
      'Industrie':           '<path d="M3 21V11l5 3v-3l5 3V8l5 3V21z"/><path d="M3 21h18"/>',
      'Comerț istoric':      '<path d="M3 8l1.5-4h15L21 8"/><path d="M3 8v13h18V8"/><path d="M3 8h18M9 14h6v7H9z"/>',
      'Natură și Agrement':  '<path d="M12 3l-4 6h2l-3 5h3l-2 3h8l-2-3h3l-3-5h2z"/><path d="M12 17v4"/>',
      // Mască de teatru: acoperă teatre, cinematografe și muzee.
      'Cultură':             '<path d="M4 5h16v7a8 8 0 0 1-16 0z"/><circle cx="9" cy="10" r="1"/><circle cx="15" cy="10" r="1"/><path d="M9 14c1 1 5 1 6 0"/>',
      // Cruce medicală într-un scut.
      'Sănătate':            '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M12 8v7M8.5 11.5h7"/>',
      // Cupă, cel mai lizibil simbol de sport la 18px.
      'Sport':               '<path d="M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M7 6H4v1a3 3 0 0 0 3 3M17 6h3v1a3 3 0 0 1-3 3"/><path d="M10 14v3h4v-3M8 21h8"/>',
      // Grup de case cu acoperiș, pentru satele istorice.
      'Sate Istorice':       '<path d="M3 12l4-3 4 3v7H3z"/><path d="M13 10l4-3 4 3v9h-8z"/><path d="M2 19h20"/>',
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
    const tours = (toursData && toursData.tours) || [];
    // Tururile leagă opririle prin `loc_id`. Până în august 2026 legătura se făcea
    // prin `article`, o cale de fișier către un folder care nu există: orice
    // redenumire sau ștergere de locație rupea opriri de tur în tăcere, iar un
    // grep după id-ul locației nu le găsea (vezi DATE-DE-VERIFICAT.md §3d).
    const locsById = Object.fromEntries(locations.map(l => [l.id, l]));

    // Total locații — afișat lângă chips (text-ul exact e pus de render())
    function _tt(key, params) {
      return (typeof window.t === 'function') ? window.t(key, params) : key;
    }
    // Miniatura de 480px pentru contextele mici (card în listă, popup pe hartă).
    // `assets/images/x/foo.jpg` → `assets/thumbs/x/foo.jpg.webp`, generate de
    // scripts/build_thumbnails.py. Aceeași transformare, în ambele sensuri.
    // Dacă miniatura lipsește, ascultătorul din `js/inline-shims.js` cade înapoi
    // pe originalul din `data-full`, deci o imagine nouă neprocesată încă arată
    // corect, doar mai greu. Rezerva stătea într-un atribut `onerror` până în
    // august 2026, dar un `script-src` strict blochează codul din atribute.
    // Detaliul și lightbox-ul folosesc mai departe originalul (vor rezoluție).
    function thumbUrl(src) {
      if (typeof src !== 'string' || !src.includes('/assets/images/')) return null;
      return src.replace('/assets/images/', '/assets/thumbs/') + '.webp';
    }
    function _catLabel(cat) {
      if (!cat) return '';
      // t() întoarce CHEIA când nu găsește traducerea, iar cheia e truthy — deci
      // un `|| cat` nu se declanșa niciodată și utilizatorul vedea literal
      // „cat.Industrial / Tehnic". Comparăm explicit cu cheia.
      const key = 'cat.' + cat;
      const label = _tt(key);
      return (label === key) ? cat : label;
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
      if (ctx.activeTour) {
        const idx = ctx.activeTour.stops.findIndex(s => s.loc_id === item.id);
        if (idx >= 0) {
          const first = idx === 0;
          const last = idx === ctx.activeTour.stops.length - 1;
          const cls = `marker-bubble tour-stop${first ? ' first' : (last ? ' last' : '')}${isActive ? ' active' : ''}`;
          const bg = ctx.activeTour.color || '';
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
      const popThumb = thumbUrl(item.image);
      const img = item.image
        ? `<img class="pop-img" src="${escapeHtml(popThumb || item.image)}" data-full="${escapeHtml(item.image)}" alt="${escapeHtml(title)}" loading="lazy" decoding="async">`
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

    function passesFilter(item) {
      switch (activeFilter) {
        case 'all': return true;
        case 'active': return item.status === 'active';
        case 'demolished': return item.status === 'demolished' || item.status === 'lost';
        default: return true;
      }
    }

    function passesTimeline(item) {
      if (ctx.timelineYear === null) return true;
      const built = item.year_built;
      const demolished = item.year_demolished;
      // Pinul există în anul X dacă: construit <= X și (nu e demolat sau demolit > X)
      if (built === null || built === undefined) {
        // Fără year_built nu putem plasa pinul în timp. Prezumția „e modern"
        // e rezonabilă pentru ce stă în picioare, dar era falsă pentru ce a
        // dispărut: Hotel Metropol, Café Trocadero și Palatul Foresta apăreau
        // pe harta anului 2026 ca și cum ar exista, fiindcă ramura asta nu se
        // uita nici la year_demolished, nici la status.
        if (item.status === 'demolished' || item.status === 'lost') return false;
        return ctx.timelineYear >= 1990;
      }
      if (built > ctx.timelineYear) return false;
      if (demolished !== null && demolished !== undefined && demolished < ctx.timelineYear) return false;
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
      if (ctx.activeTour) {
        return ctx.activeTour.stops.some(s => s.loc_id === item.id);
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

    // Draws the tour polyline. When detail panel is open AND ctx.activeId is a stop
    // in the active tour, shows only the leg from that stop to the next.
    // Otherwise shows the full route.
    function drawTourRoute() {
      if (tourRouteLayer) { map.removeLayer(tourRouteLayer); tourRouteLayer = null; }
      if (!ctx.activeTour) return;
      const stopIds = ctx.activeTour.stops.map(s => s.loc_id);
      const stopLocs = stopIds.map(id => locsById[id]).filter(Boolean);
      if (stopLocs.length < 2) return;

      const precomputed = (toursRoutes && toursRoutes.tours && toursRoutes.tours[ctx.activeTour.id]) || null;
      const color = ctx.activeTour.color || '#2c6157';
      const isDetailOpen = detail.dataset.open === '1';

      let activeStopIdx = -1;
      if (isDetailOpen && ctx.activeId) {
        const activeLoc = locations.find(l => l.id === ctx.activeId);
        if (activeLoc) activeStopIdx = stopIds.indexOf(activeLoc.id);
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
      if (ctx.activeTour) {
        const order = new Map(ctx.activeTour.stops.map((s, i) => [s.loc_id, i]));
        filtered = filtered.slice().sort((a, b) => (order.get(a.id) ?? 999) - (order.get(b.id) ?? 999));
        count.textContent = _tt('results.count.tour', {n: filtered.length});
      } else {
        count.textContent = `${filtered.length} ${_tt('results.count', {total: locations.length})}`;
      }

      // Batch toate marker-ele într-un array și le adăugăm cu addLayers (mult
      // mai eficient decât addLayer pentru 148 markers — un singur recompute
      // de cluster în loc de 148).
      const batch = [];
      filtered.forEach(item => {
        // Leaflet pune `role="button"` și `tabindex="0"` pe elementul
        // markerului, dar numele accesibil îl dă doar `options.title`. Fără el,
        // un cititor de ecran anunța „button" de 251 de ori la rând, fiindcă
        // titlul nostru stătea pe div-ul interior, nu pe cel focalizabil.
        // `aria-label` se pune mai jos, la adăugare, ca să bată `title`-ul.
        const numeAccesibil = _locField(item, 'title');
        const marker = L.marker([item.lat, item.lon], {
          icon: buildIcon(item, item.id === ctx.activeId),
          title: numeAccesibil,
          alt: numeAccesibil,
        }).bindPopup(popupHtml(item), { closeButton: true, autoPan: true });
        marker.on('add', function () {
          const el = this.getElement();
          if (el) el.setAttribute('aria-label', numeAccesibil);
        });
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
            if (ctx.openEditLocation) ctx.openEditLocation(item.id);
          });
        });
        marker.on('click', () => highlight(item.id, false));

        const li = document.createElement('li');
        const btn = document.createElement('button');
        const statusCls = item.status === 'demolished' || item.status === 'lost' ? ' is-demolished'
                       : item.status === 'ruin' ? ' is-ruin' : '';
        const hasImage = !!item.image;
        btn.className = 'item' + (item.id === ctx.activeId ? ' active' : '') + statusCls + (hasImage ? ' has-image' : '');
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
        // Sursa e MINIATURA de 480px (~29 KB), nu originalul (~218 KB): cardul are
        // ~367px lățime. `data-full` + onerror = fallback dacă miniatura lipsește.
        const bgThumb = thumbUrl(item.image);
        const bgImg = hasImage
          ? `<img class="item-bg" src="${escapeHtml(bgThumb || item.image)}" data-full="${escapeHtml(item.image)}" loading="lazy" decoding="async" alt="" aria-hidden="true">`
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
      if (ctx.activeTour && filtered.length >= 2 && !opts.preserveView) {
        const coords = filtered.map(l => [l.lat, l.lon]);
        map.fitBounds(coords, { padding: [60, 60], maxZoom: 16 });
      } else if (filtered.length && !ctx.activeId && window.__renderHasRunOnce && !opts.preserveView) {
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
      if (ctx.activeId && typeof openDetail === 'function') {
        const wasOpen = detail && detail.dataset.open;
        openDetail(ctx.activeId);
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
      ctx.activeId = id;
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
      // Datele complete (descriere + galerie) se încarcă lazy. Dacă încă nu au
      // sosit, le declanșăm; la merge, ensureFullData cheamă __rerenderActiveDetail
      // care re-deschide acest detaliu cu textul integral. Până atunci se vede
      // excerpt-ul (fallback în randarea de mai jos).
      if (typeof ctx.ensureFullData === 'function' && !ctx.fullDataLoaded) ctx.ensureFullData();
      // Pe mobil, dacă un bottom-sheet (straturi/tururi) e deschis, îl închidem
      // ca să fie vizibil panel-ul detail care alunecă din dreapta.
      if (typeof ctx.closeAllSheets === 'function') ctx.closeAllSheets();
      ctx.activeId = id;
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
                 const capSrc = (langEn && g.caption_en) ? g.caption_en : g.caption;
                 const cap = (capSrc || (isMeaningfulAlt(g.alt) ? g.alt : '')).trim();
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
        if (ctx.activeTour) params.tour = ctx.activeTour.id;
        // Intrare nouă în istoric doar când chiar se schimbă fișa afișată, ca
        // Back să închidă panoul în loc să scoată utilizatorul de pe site.
        // Fără condiție, o re-randare a aceleiași fișe ar umple istoricul cu
        // duplicate și Back ar trebui apăsat de mai multe ori.
        const alta = new URLSearchParams(location.search).get('loc') !== id;
        window.__updateDeepLink(params, alta);
      }
      if (ctx.activeTour) drawTourRoute();
      // NB: hero + gallery image clicks are handled by a single delegated
      // listener attached once on detailScroll (see below, outside render).
    }

    // ── Lightbox: gallery mode ─────────────────────────────────────────
    // The hero + gallery photos of the active detail form a queue the user can
    // swipe through (mobile) or step with ‹/› buttons + arrow keys (desktop).
    // Coexists with the pubcrawl queue (ctx.lightboxQueue): only one is active at a
    // time. `ctx.lightboxGalleryItems.length > 0` means gallery mode is active.

    // Build items for the active detail: hero first, then gallery (deduped).
    function buildDetailLightboxItems() {
      const it = locations.find(l => l.id === ctx.activeId);
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

    // Focus management lightbox: la deschidere mutăm focusul pe containerul
    // lightbox-ului (tabindex=-1 în HTML) ca Escape/săgețile să fie la îndemână
    // și cititoarele de ecran să intre în context; la închidere îl restaurăm.
    let _lightboxLastFocus = null;
    function focusLightbox() {
      if (!lightbox.dataset.open) return;
      if (!lightbox.contains(document.activeElement)) {
        _lightboxLastFocus = document.activeElement;
        try { lightbox.focus(); } catch (e) {}
      }
    }
    function openLightboxGallery(items, startIdx) {
      if (!items || !items.length) return;
      ctx.lightboxGalleryItems = items;
      ctx.lightboxGalleryIdx = Math.max(0, Math.min(items.length - 1, startIdx || 0));
      // Clear pubcrawl state so navigation routes to gallery
      if (typeof ctx.lightboxAnchor !== 'undefined') ctx.lightboxAnchor = null;
      if (typeof ctx.lightboxQueue !== 'undefined') ctx.lightboxQueue = [];
      displayGalleryLightbox(ctx.lightboxGalleryIdx);
      lightbox.dataset.open = '1';
      focusLightbox();
    }

    function displayGalleryLightbox(idx) {
      const item = ctx.lightboxGalleryItems[idx];
      if (!item) return;
      ctx.lightboxGalleryIdx = idx;
      lightboxImg.src = item.src;
      lightboxImg.alt = item.alt || item.caption || '';
      const yearTag = item.year ? `<span class="lb-year-tag">${escapeHtml(String(item.year))}</span>` : '';
      const text = item.caption || '';
      lightboxCaption.innerHTML = `${yearTag}${escapeHtml(text)}`;
      lightboxCaption.hidden = !text && !item.year;

      const total = ctx.lightboxGalleryItems.length;
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
      focusLightbox();
      ctx.lightboxGalleryItems = [];
      if (typeof ctx.lightboxQueue !== 'undefined') {
        ctx.lightboxQueue = [];
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
      if (ctx.activeTour) drawTourRoute();
      // Reset deep link (păstrăm doar tour/hunt activ, dacă există)
      // Dacă intrarea curentă din istoric e una împinsă de noi la deschidere,
      // o consumăm cu `back()` în loc să o suprascriem: altfel ar rămâne un
      // duplicat, iar prima apăsare de Back după închidere n-ar face nimic.
      // Marcajul din `history.state` ne ferește de cazul în care utilizatorul a
      // intrat direct pe un link cu ?loc=, unde `back()` l-ar scoate de pe site.
      const alNostru = history.state && history.state.tg && history.state.tg.loc;
      if (alNostru && !ctx.activeTour) {
        history.back();
        return;
      }
      if (typeof window.__updateDeepLink === 'function') {
        const params = {};
        if (ctx.activeTour) params.tour = ctx.activeTour.id;
        window.__updateDeepLink(params);
      }
    }

    closeBtn.addEventListener('click', closeDetail);
    // Track which pubcrawl photo (if any) is currently shown in lightbox so
    // the "Editează" button can pre-fill the modal.
    function closeLightbox() {
      delete lightbox.dataset.open;
      ctx.lightboxGalleryItems = [];
      if (_lightboxLastFocus && document.contains(_lightboxLastFocus)) {
        try { _lightboxLastFocus.focus(); } catch (e) {}
        _lightboxLastFocus = null;
      }
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

    // La prima căutare, ne asigurăm că descrierile sunt încărcate (Fuse le
    // indexează cu weight 0.5); ensureFullData reconstruiește indexul la sosire.
    search.addEventListener('input', () => {
      if (typeof ctx.ensureFullData === 'function' && !ctx.fullDataLoaded) ctx.ensureFullData();
      render();
    });
    category.addEventListener('change', render);

    // ─── Filter chips ────────────────────────────────────────────
    const chipsEl = document.getElementById('filter-chips');
    chipsEl.querySelectorAll('.chip').forEach(chip => {
      chip.addEventListener('click', () => {
        activeFilter = chip.dataset.filter;
        // Containerul e #filter-chips. (Până la 2026-08 se căuta `.filter-group-row`,
        // clasă care nu există nicăieri — deci `.active`/`aria-pressed` nu se mutau
        // niciodată: lista se filtra corect, dar „Toate" rămânea evidențiat.)
        chipsEl.querySelectorAll('.chip').forEach(c => {
          const isActive = c === chip;
          c.classList.toggle('active', isActive);
          c.setAttribute('aria-pressed', isActive ? 'true' : 'false');
        });
        render();
      });
    });


    // ── Servicii publicate pe ctx pentru celelalte module ──
    ctx.map = map;
    ctx.markers = markers;
    ctx.tours = tours;
    ctx.locsById = locsById;
    ctx.escapeHtml = escapeHtml;
    ctx.thumbUrl = thumbUrl;
    ctx.tt = _tt;
    ctx.catLabel = _catLabel;
    ctx.iconSvg = iconSvg;
    ctx.render = render;
    ctx.highlight = highlight;
    ctx.openDetail = openDetail;
    // Expus pentru main.js: după ce datele complete se îmbină în ctx.locations,
    // reconstruim indexul Fuse ca să caute și în descrieri.
    ctx.rebuildFuseIndex = () => { fuseIndex = null; rebuildFuseIndex(); };
    ctx.closeDetail = closeDetail;
    ctx.closeLightbox = closeLightbox;
    ctx.openImageInLightbox = openImageInLightbox;
    ctx.focusLightbox = focusLightbox;
    ctx.displayGalleryLightbox = displayGalleryLightbox;
    ctx.lightbox = lightbox;
    ctx.lightboxImg = lightboxImg;
    ctx.lightboxCaption = lightboxCaption;
}
