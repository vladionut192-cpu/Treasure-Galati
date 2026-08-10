// Heritage Galați — modul: „Galați de altădată" — fotografii istorice geolocate
// (buline portocalii, cluster propriu) + navigarea lightbox-ului după distanță.
export function initAltadata(ctx) {
  const { map, escapeHtml, lightbox, lightboxImg, lightboxCaption } = ctx;
    // ─── „Galați de altădată" — colecția de fotografii istorice (buline mici portocalii) ─
    // Pozele sunt distribuite pe hartă după an + locație aproximativă, pentru a oferi un
    // strat istoric peste obiective. NU sunt legate de puncte specifice — fac parte dintr-o
    // colecție generală de imagini ale orașului.
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
      if (ctx.timelineYear === null) return true;
      // Foto fără an documentat → afișată DOAR la capătul drept (deja prins mai sus)
      if (photo.year === null || photo.year === undefined) return false;
      // Foto cu an documentat → vizibilă doar dacă slider ≥ year
      return photo.year <= ctx.timelineYear;
    }
    function refreshPubcrawlVisibility() {
      // Cu clustering, controlăm vizibilitatea prin add/remove din cluster
      // (nu mai merge CSS opacity — markeri în cluster nu au DOM element).
      // Batch operations pentru perf: acumulăm diff-ul și-l aplicăm o dată.
      if (!ctx.pubcrawlLayer) return;
      const toAdd = [];
      const toRemove = [];
      ctx.pubcrawlMarkers.forEach(({marker, photo}) => {
        const visible = passesPubcrawlTimeline(photo);
        const inLayer = ctx.pubcrawlLayer.hasLayer(marker);
        if (visible && !inLayer) toAdd.push(marker);
        else if (!visible && inLayer) toRemove.push(marker);
      });
      if (toRemove.length) ctx.pubcrawlLayer.removeLayers(toRemove);
      if (toAdd.length) ctx.pubcrawlLayer.addLayers(toAdd);
    }

    // ─── Galați de altădată — lightbox navigation by nearest photo ───
    // Când utilizatorul deschide o fotografie cu click pe bulina portocalie,
    // construim o coadă sortată după distanță față de poza inițială. Săgețile
    // ‹/› + tastele Arrow + swipe-ul pe mobil avansează prin această coadă.
    // Distanța se calculează doar față de poza inițială (nu față de fiecare
    // nouă poză afișată) — așa coada rămâne stabilă în timpul răsfoirii.

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
      const marker = ctx.pubcrawlMarkers.find(x => x.photo === photo)?.marker;
      const el = marker?.getElement();
      if (el) el.querySelector('.pubcrawl-dot')?.classList.add('lit');

      // Build sorted queue (only first time / when anchor changes)
      ctx.lightboxAnchor = photo;
      ctx.lightboxQueue = ctx.pubcrawlMarkers
        .map(({photo: p}) => ({
          photo: p,
          distance_m: haversineMeters(photo.lat, photo.lon, p.lat, p.lon),
        }))
        .sort((a, b) => a.distance_m - b.distance_m);
      ctx.lightboxIndex = 0;
      displayLightboxPhoto(photo);
      if (typeof ctx.focusLightbox === 'function') ctx.focusLightbox();
    }

    function displayLightboxPhoto(photo) {
      ctx.activePhoto = photo;
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
      const total = ctx.lightboxQueue.length;
      if (total > 1) {
        prev.hidden = ctx.lightboxIndex <= 0;
        next.hidden = ctx.lightboxIndex >= total - 1;
        const dist = ctx.lightboxQueue[ctx.lightboxIndex]?.distance_m || 0;
        const distLabel = ctx.lightboxIndex === 0 ? 'punctul ales' :
          (dist < 1000 ? `${Math.round(dist)} m` : `${(dist/1000).toFixed(1)} km`);
        counter.textContent = `${ctx.lightboxIndex + 1} / ${total} · ${distLabel}`;
        counter.hidden = false;
      } else {
        prev.hidden = true;
        next.hidden = true;
        counter.hidden = true;
      }
    }

    function lightboxNavigate(direction) {
      // Gallery mode takes precedence — quieter UI (no pubcrawl markers)
      if (ctx.lightboxGalleryItems.length > 0) {
        const newIdx = ctx.lightboxGalleryIdx + direction;
        if (newIdx < 0 || newIdx >= ctx.lightboxGalleryItems.length) return;
        ctx.displayGalleryLightbox(newIdx);
        return;
      }
      // Pubcrawl photo flow
      if (!ctx.lightboxQueue.length) return;
      const newIdx = ctx.lightboxIndex + direction;
      if (newIdx < 0 || newIdx >= ctx.lightboxQueue.length) return;
      ctx.lightboxIndex = newIdx;
      const item = ctx.lightboxQueue[newIdx];
      displayLightboxPhoto(item.photo);
      // Light up the new marker too
      document.querySelectorAll('.pubcrawl-dot.lit').forEach(d => d.classList.remove('lit'));
      const marker = ctx.pubcrawlMarkers.find(x => x.photo === item.photo)?.marker;
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
      if (!ctx.lightboxQueue.length && !ctx.lightboxGalleryItems.length) return;
      if (e.key === 'ArrowLeft') { e.preventDefault(); lightboxNavigate(-1); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); lightboxNavigate(1); }
    });
    // Touch swipe (mobil)
    let touchStartX = null, touchStartY = null;
    lightbox.addEventListener('touchstart', (e) => {
      if (!ctx.lightboxQueue.length && !ctx.lightboxGalleryItems.length) return;
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
        const rawData = await r.json();
        // Hărțile/vederile aeriene generale ale orașului (folder „0. Galati")
        // NU mai apar ca buline portocalii pe hartă — au pagina lor dedicată,
        // maps.html, unde sunt afișate cronologic. Vezi js/maps.js.
        const data = rawData.filter(p => (p.folder || '').trim() !== '0. Galati');
        // Cluster pentru cele ~311 fotografii pubcrawl. Bulina portocalie
        // ascunde-se în cluster la zoom mic; spiderfy la max zoom.
        ctx.pubcrawlLayer = L.markerClusterGroup({
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
          const numeAccesibil = (photo.caption_ro || photo.caption || photo.caption_en || 'Fotografie de arhivă');
            // Leaflet pune role="button" și tabindex="0" pe marker, dar numele
            // accesibil vine doar din `options.title`. Fără el, cititorul de
            // ecran anunța doar „button".
          const m = L.marker([photo.lat, photo.lon], {
            icon: pubcrawlIcon(),
            zIndexOffset: -100,
            riseOnHover: true,
            title: numeAccesibil,
            alt: numeAccesibil,
          });
          m.on('add', function () {
            const el = this.getElement();
            if (el) el.setAttribute('aria-label', numeAccesibil);
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
                 <img src="${escapeHtml((ctx.thumbUrl && ctx.thumbUrl(photo.src)) || photo.src)}" alt="" loading="lazy" decoding="async">
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
          ctx.pubcrawlMarkers.push({marker: m, photo});
        });
        ctx.pubcrawlLayer.addTo(map);
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


    ctx.refreshPubcrawlVisibility = refreshPubcrawlVisibility;
    ctx.openPhotoLightbox = openPhotoLightbox;
    ctx.pubcrawlIcon = pubcrawlIcon;
}
