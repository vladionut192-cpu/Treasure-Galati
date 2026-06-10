import { trapModalFocus } from './a11y.js';

// Heritage Galați — modul: pinurile text — „Știați că?" (trivia) + Legende,
// cu modalul text comun și filtrarea pe anul din timeline.
export function initTextPins(ctx) {
  const { map, escapeHtml } = ctx;
    // ─── „Știați că?" — curiozități pe hartă (pin violet cu „?") ─────────────
    // Citește din trivia.json. NU apare în sidebar — strict marker + click → modal text.
    // Click pe pin afișează modal-ul #text-modal cu meta + titlu + descriere.
    let triviaLayer = null;
    function triviaIcon() {
      return L.divIcon({
        className: 'custom-marker',
        html: '<div class="trivia-pin">?</div>',
        iconSize: [22, 22],
        iconAnchor: [11, 11],
      });
    }
    let legendaLayer = null;
    function legendaIcon() {
      // Scroll/pergament: două ruloi laterale + corpul derulant cu linii
      // de text — silueta cea mai recognoscibilă pentru „legendă\" /
      // manuscris medieval. Pe pinul redus la 20×20 (de la 26×26), forma e
      // mai subtilă, fără a pierde lizibilitatea.
      const svg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' +
        '<path d="M5 5.5c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2s-.9 2-2 2"/>' + // top roll
        '<path d="M7 3.5v15"/>' +                                         // body left
        '<path d="M17 7.5v11"/>' +                                        // body right (shifted)
        '<path d="M5 18.5c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2s-.9-2-2-2"/>' + // bottom roll
        '<path d="M10 10.5h5M10 13.5h5M10 16.5h3"/>' +                    // text lines
        '</svg>';
      return L.divIcon({
        className: 'custom-marker',
        html: '<div class="legenda-pin">' + svg + '</div>',
        iconSize: [22, 22],
        iconAnchor: [11, 11],
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
    // Focus trap (WCAG): Tab rămâne în modal cât e deschis; la închidere
    // focusul revine pe elementul de unde a venit utilizatorul.
    const textModalTrap = trapModalFocus(textModal, { initialFocus: '#text-modal-close' });
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
      textModalTrap.activate();
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
        if (typeof ctx.openImageInLightbox === 'function' && textModalImg.src) {
          ctx.openImageInLightbox(textModalImg.src, textModalImg.alt || '', textModalImg.alt || '');
        }
      });
    }
    function closeTextModal() {
      textModal.removeAttribute('data-open');
      textModalTrap.deactivate();
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
          ctx.triviaMarkers.push({ marker: m, item });
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
            offset: L.point(0, -12),
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
          ctx.legendaMarkers.push({ marker: m, item });
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
      if (ctx.timelineYear === null) return true;
      const y = item.year;
      if (y === null || y === undefined) return true;
      return y <= ctx.timelineYear;
    }
    function refreshTriviaVisibility() {
      if (!triviaLayer) return;
      const toAdd = [];
      const toRemove = [];
      ctx.triviaMarkers.forEach(({ marker, item }) => {
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
        update(ctx.triviaMarkers, 'trivia');
        update(ctx.legendaMarkers, 'legenda');
        if (textModal.dataset.open && textModalContext) {
          const arr = textModalContext.kind === 'trivia' ? ctx.triviaMarkers : ctx.legendaMarkers;
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


    ctx.openTextModal = openTextModal;
    ctx.refreshTriviaVisibility = refreshTriviaVisibility;
}
