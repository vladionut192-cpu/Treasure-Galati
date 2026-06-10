// Heritage Galați — modul: straturi suprapuse — hărți istorice (eHarta WMS),
// fortificații antice (Valul lui Traian/Atanaric, Dinogeția), granița
// administrativă istorică (sincronizată cu timeline) + bulele desktop.
export function initOverlays(ctx) {
  const { map, highlight, openDetail } = ctx;
    // ─── Historic map overlay (multi-layer eHarta) ───────────────
    const historicToggle = document.getElementById('toggle-historic-map');
    const historicOpaCtl = document.getElementById('historic-opacity-control');
    const historicOpaSlider = document.getElementById('historic-opacity-slider');
    const historicOpaOut = document.getElementById('historic-opacity-out');
    const historicSelect = document.getElementById('historic-layer-select');
    const historicMeta = document.getElementById('historic-meta');
    let historicLayer = null;
    let historicLayerName = historicSelect.value;

    // ─── Banner „serviciul extern nu răspunde" (eHarta) ──────────
    // Spinner-ul există deja, dar când geo-spatial.org e căzut spinner-ul se
    // învârte la nesfârșit și pare că aplicația e blocată. Un watchdog arată
    // un mesaj clar dacă niciun tile nu sosește în timp util.
    const HISTORIC_TIMEOUT_MS = 15000;
    let historicNotice = null;
    function showHistoricNotice() {
      const t = (typeof window.t === 'function') ? window.t : (k) => k;
      if (!historicNotice) {
        historicNotice = document.createElement('div');
        historicNotice.className = 'map-service-notice';
        historicNotice.setAttribute('role', 'status');
        const mapArea = document.querySelector('.map-area') || document.body;
        mapArea.appendChild(historicNotice);
      }
      historicNotice.innerHTML = `<span></span><button type="button" aria-label="Închide">×</button>`;
      historicNotice.querySelector('span').textContent = t('layer.historic.timeout');
      historicNotice.querySelector('button').addEventListener('click', hideHistoricNotice);
      historicNotice.hidden = false;
    }
    function hideHistoricNotice() {
      if (historicNotice) historicNotice.hidden = true;
    }

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
      // Watchdog: dacă în HISTORIC_TIMEOUT_MS nu a sosit NICIUN tile valid
      // (sau toate au eșuat), serviciul e probabil indisponibil → mesaj.
      let gotTile = false;
      let errored = 0;
      let watchdog = null;
      const giveUp = () => {
        setLoading(false);
        pending = 0;
        showHistoricNotice();
      };
      layer.on('add', () => {
        clearTimeout(watchdog);
        watchdog = setTimeout(() => { if (!gotTile) giveUp(); }, HISTORIC_TIMEOUT_MS);
      });
      layer.on('tileload', () => {
        gotTile = true;
        clearTimeout(watchdog);
        hideHistoricNotice();
      });
      layer.on('remove', () => {
        clearTimeout(watchdog);
        hideHistoricNotice();
      });
      layer.on('loading', () => { pending++; setLoading(true); });
      const done = () => { pending = Math.max(0, pending - 1); if (pending === 0) setLoading(false); };
      layer.on('load', done);
      layer.on('tileerror', () => {
        done();
        // Toate primele tile-uri au eșuat → nu mai aștepta tot timeout-ul.
        errored++;
        if (!gotTile && errored >= 6) giveUp();
      });
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
      // Dacă timeline e pe modul „prezent" (ctx.timelineYear === null), folosim 2026
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
      const feat = pickFeatureForYear(geo, ctx.timelineYear);
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


    ctx.refreshJudetLayer = refreshJudetLayer;
}
