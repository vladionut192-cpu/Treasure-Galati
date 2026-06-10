// Heritage Galați — modul: cronologia (slider 1445–2026) + overlay-ul de an
// (steag/eră/populație) + lupa touch pentru mobil + gradațiile generate din
// timeline_events.json (sursa unică de adevăr pentru evenimente).
export function initTimeline(ctx) {
  const { escapeHtml, render } = ctx;
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
    // Gradațiile de pe riglă — generate din timeline_events.json (track_years),
    // nu mai sunt hardcodate în index.html. Anii „majori" (granițe de ere)
    // primesc clasa .major — stilizată în polish.css.
    const timelineEventsBox = document.querySelector('.timeline-events');
    {
      const tMin = parseInt(timelineSlider.min, 10);
      const tSpan = parseInt(timelineSlider.max, 10) - tMin;
      const trackYears = (ctx.timelineEvents && ctx.timelineEvents.track_years) || [];
      const majorYears = new Set((ctx.timelineEvents && ctx.timelineEvents.major_years) || []);
      if (timelineEventsBox) {
        timelineEventsBox.innerHTML = '';
        trackYears.forEach((y) => {
          const el = document.createElement('span');
          el.className = majorYears.has(y) ? 'event major' : 'event';
          el.dataset.year = String(y);
          el.style.left = `${(((y - tMin) / tSpan) * 100).toFixed(2)}%`;
          timelineEventsBox.appendChild(el);
        });
      }
    }
    const timelineEventEls = timelineEventsBox ? [...timelineEventsBox.children] : [];

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
        if (ctx.timelineYear !== null) updateTimelineDisplay();
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

    // Lista curatoriată de evenimente — SURSA UNICĂ: timeline_events.json
    // (încărcat în main.js → ctx.timelineEvents). Alimentează overlay-ul de
    // evenimente de lângă hartă și romburile din lupa mobilă.
    const allEvents = (ctx.timelineEvents && ctx.timelineEvents.events) || [];

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

    // ARIA: slider-ul anunță anul + contextul istoric, nu doar numărul brut.
    function _ariaT(key, fallback) {
      return (typeof window.t === 'function') ? window.t(key) : fallback;
    }
    function refreshSliderAria() {
      timelineSlider.setAttribute('aria-label', _ariaT('timeline.aria.label', 'Selectează anul pe cronologie'));
      if (ctx.timelineYear === null) {
        timelineSlider.setAttribute('aria-valuetext', _ariaT('timeline.aria.present', 'prezent — fără filtru de an'));
      } else {
        const flag = flagFor(ctx.timelineYear);
        const era = eraFor(ctx.timelineYear);
        timelineSlider.setAttribute('aria-valuetext', `${ctx.timelineYear} — ${flag.name} · ${era.name}`);
      }
    }
    function updateTimelineDisplay() {
      refreshSliderAria();
      if (ctx.timelineYear === null) {
        yearOverlay.hidden = true;
        timelineEl.classList.remove('engaged');
        timelineCurrentEvent.hidden = true;
        timelineEventEls.forEach(el => el.classList.remove('near'));
      } else {
        timelineEl.classList.add('engaged');
        yearOverlay.hidden = false;
        yearNumOut.textContent = ctx.timelineYear;
        // Flag + entity name (political affiliation of Galați at this year)
        const flag = flagFor(ctx.timelineYear);
        yearFlag.innerHTML = flag.svg;
        yearFlag.title = flag.name;
        yearEntityName.textContent = flag.name;
        // Era info (cultural period)
        const era = eraFor(ctx.timelineYear);
        yearEraDot.style.background = era.color;
        yearEraName.textContent = era.name;
        // Population
        const popInfo = populationAt(ctx.timelineYear);
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
          el.classList.toggle('near', Math.abs(ey - ctx.timelineYear) <= 1);
        });
        // Show events within ±1 year — curated list (allEvents) on top,
        // chronology entries below.
        const within = (e) => {
          const distStart = Math.abs(e.year - ctx.timelineYear);
          const distEnd = e.year_end ? Math.abs(e.year_end - ctx.timelineYear) : distStart;
          // Range entries (year–year_end) match if the slider is inside or within 1 year of either edge
          if (e.year_end && ctx.timelineYear >= e.year && ctx.timelineYear <= e.year_end) return 0;
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
    // Partea grea a unei schimbări de an: re-render listă+markere (≈290 carduri
    // DOM + recompute de cluster) + refresh-ul straturilor sincronizate.
    function applyTimelineFilters() {
      render();
      if (typeof ctx.refreshPubcrawlVisibility === 'function') ctx.refreshPubcrawlVisibility();
      if (typeof ctx.refreshTriviaVisibility === 'function') ctx.refreshTriviaVisibility();
      if (typeof ctx.refreshJudetLayer === 'function') ctx.refreshJudetLayer();
    }
    // La glisare, 'input' vine pentru FIECARE an parcurs — pe mobil re-render-ul
    // per-an producea sacadări. Overlay-ul de an rămâne instant; partea grea
    // rulează debounced (80ms trailing), deci starea finală e mereu aplicată.
    let filtersDebounce = null;
    timelineSlider.addEventListener('input', () => {
      ctx.timelineYear = parseInt(timelineSlider.value, 10);
      // Special: dacă slider-ul e la max (2026), considerăm „fără filtru"
      if (ctx.timelineYear >= 2026) ctx.timelineYear = null;
      updateTimelineDisplay();
      clearTimeout(filtersDebounce);
      filtersDebounce = setTimeout(applyTimelineFilters, 80);
    });
    // Click pe un romb de eveniment → mutăm slider-ul la anul respectiv
    timelineEventEls.forEach((el) => {
      el.addEventListener('click', () => {
        const y = parseInt(el.dataset.year, 10);
        ctx.timelineYear = y;
        timelineSlider.value = y;
        updateTimelineDisplay();
        clearTimeout(filtersDebounce);
        applyTimelineFilters();
      });
      el.style.cursor = 'pointer';
    });
    timelineReset.addEventListener('click', () => {
      ctx.timelineYear = null;
      timelineSlider.value = 2026;
      updateTimelineDisplay();
      clearTimeout(filtersDebounce);
      applyTimelineFilters();
    });
    updateTimelineDisplay();

    // ─── Timeline touch loupe (mobil) ────────────────────────────
    // Pe telefon, track-ul de ~360px acoperă 581 de ani (~1,6 ani/px) —
    // imposibil de nimerit un an anume cu degetul. Cât timp ții apăsat pe
    // cronologie apare o „lupă" deasupra degetului: anul curent mare, era
    // și o riglă mărită (10px/an) cu evenimentele marcate. Tragi degetul
    // ÎN SUS, departe de track → modul precizie: mișcarea orizontală e
    // demultiplicată progresiv (până la ~×12), deci poți selecta anul exact.
    (function initTimelineLoupe() {
      // Activă pe device-uri touch; ?loupe=1 forțează activarea pe desktop
      // (debugging — gesturile se pot simula cu TouchEvent sintetic).
      const wantsLoupe = window.matchMedia('(pointer: coarse)').matches
        || 'ontouchstart' in window
        || new URLSearchParams(location.search).has('loupe');
      if (!wantsLoupe) return;
      const YEAR_MIN = parseInt(timelineSlider.min, 10);
      const YEAR_MAX = parseInt(timelineSlider.max, 10);
      const PX_PER_YEAR = 10;        // zoom-ul riglei din lupă
      const FINE_DEADZONE = 28;      // px deasupra track-ului fără efect
      const FINE_RATE = 22;          // cât de repede crește demultiplicarea
      const MIN_GAIN = 0.08;         // plafonul preciziei (~×12)

      const loupe = document.createElement('div');
      loupe.className = 'timeline-loupe';
      loupe.hidden = true;
      loupe.setAttribute('aria-hidden', 'true');
      loupe.innerHTML = `
        <div class="loupe-head">
          <span class="loupe-year"></span>
          <span class="loupe-zoom" hidden></span>
        </div>
        <div class="loupe-era"><span class="loupe-era-dot"></span><span class="loupe-era-name"></span></div>
        <div class="loupe-scale">
          <div class="loupe-strip"></div>
          <div class="loupe-needle"></div>
        </div>
        <div class="loupe-hint"></div>`;
      document.body.appendChild(loupe);

      const yearEl = loupe.querySelector('.loupe-year');
      const zoomEl = loupe.querySelector('.loupe-zoom');
      const eraDotEl = loupe.querySelector('.loupe-era-dot');
      const eraNameEl = loupe.querySelector('.loupe-era-name');
      const scaleEl = loupe.querySelector('.loupe-scale');
      const stripEl = loupe.querySelector('.loupe-strip');
      const hintEl = loupe.querySelector('.loupe-hint');

      // ── Construim rigla o singură dată: benzi de eră + decade + evenimente
      stripEl.style.width = `${(YEAR_MAX - YEAR_MIN) * PX_PER_YEAR}px`;
      eras.forEach((e) => {
        const band = document.createElement('span');
        band.className = 'loupe-era-band';
        band.style.left = `${(e.from - YEAR_MIN) * PX_PER_YEAR}px`;
        band.style.width = `${(Math.min(e.to, YEAR_MAX) - e.from) * PX_PER_YEAR}px`;
        band.style.background = e.color;
        stripEl.appendChild(band);
      });
      for (let y = Math.ceil(YEAR_MIN / 10) * 10; y <= YEAR_MAX; y += 10) {
        const lbl = document.createElement('span');
        lbl.className = 'loupe-decade';
        lbl.style.left = `${(y - YEAR_MIN) * PX_PER_YEAR}px`;
        lbl.textContent = y;
        stripEl.appendChild(lbl);
      }
      const eventYears = new Set(allEvents.map((e) => e.year));
      eventYears.forEach((y) => {
        const dot = document.createElement('span');
        dot.className = 'loupe-event-dot';
        dot.style.left = `${(y - YEAR_MIN) * PX_PER_YEAR}px`;
        stripEl.appendChild(dot);
      });
      // Gradațiile (an + decadă) — pattern repetitiv; decada e offsetată ca să
      // pice pe anii rotunzi (1450, 1460…), nu pe 1445.
      stripEl.style.backgroundPosition = `${(Math.ceil(YEAR_MIN / 10) * 10 - YEAR_MIN) * PX_PER_YEAR}px 0, 0 0`;

      let fineMode = false;
      function updateHint() {
        const key = fineMode ? 'timeline.loupe.fine' : 'timeline.loupe.hint';
        hintEl.textContent = (typeof window.t === 'function')
          ? window.t(key)
          : 'trage degetul în sus pentru precizie';
      }
      updateHint();
      window.addEventListener('langchange', updateHint);

      let active = false;
      let yearFloat = YEAR_MAX;
      let lastX = 0;
      let yearsPerPx = 1;
      let trackCenterY = 0;
      let lastCommitted = null;

      const clampYear = (v) => Math.max(YEAR_MIN, Math.min(YEAR_MAX, v));

      function setLoupe(touch) {
        const year = Math.round(yearFloat);
        yearEl.textContent = year;
        const era = eraFor(year);
        eraDotEl.style.background = era.color;
        eraNameEl.textContent = era.name;
        stripEl.style.transform =
          `translateX(${scaleEl.clientWidth / 2 - (yearFloat - YEAR_MIN) * PX_PER_YEAR}px)`;
        const w = loupe.offsetWidth;
        const x = Math.max(8, Math.min(window.innerWidth - w - 8, touch.clientX - w / 2));
        loupe.style.left = `${x}px`;
      }

      function commitYear() {
        const year = Math.round(yearFloat);
        if (year === lastCommitted) return;
        lastCommitted = year;
        timelineSlider.value = year;
        timelineSlider.dispatchEvent(new Event('input', { bubbles: true }));
        // Haptic discret (Android): puls mai apăsat pe un an cu eveniment,
        // abia simțit la trecerea de decadă.
        if (navigator.vibrate) {
          if (eventYears.has(year)) navigator.vibrate(16);
          else if (year % 10 === 0) navigator.vibrate(5);
        }
      }

      // Preluăm noi gestul în întregime — touch-action:none face touchmove
      // anulabil (cu pan-x browserul ar consuma el drag-ul orizontal).
      timelineSlider.style.touchAction = 'none';
      timelineSlider.addEventListener('touchstart', (ev) => {
        if (ev.touches.length !== 1) return;
        ev.preventDefault();
        const t = ev.touches[0];
        const rect = timelineSlider.getBoundingClientRect();
        trackCenterY = rect.top + rect.height / 2;
        yearsPerPx = (YEAR_MAX - YEAR_MIN) / Math.max(1, rect.width);
        // Sărim direct la anul de sub deget (comportamentul nativ al slider-ului)
        yearFloat = clampYear(YEAR_MIN + (t.clientX - rect.left) * yearsPerPx);
        lastX = t.clientX;
        lastCommitted = null;
        active = true;
        const tlRect = timelineEl.getBoundingClientRect();
        loupe.style.bottom = `${window.innerHeight - tlRect.top + 10}px`;
        loupe.hidden = false;
        requestAnimationFrame(() => loupe.classList.add('on'));
        setLoupe(t);
        commitYear();
      }, { passive: false });

      timelineSlider.addEventListener('touchmove', (ev) => {
        if (!active) return;
        ev.preventDefault();
        const t = ev.touches[0];
        const dy = Math.max(0, trackCenterY - t.clientY);
        let gain = 1;
        if (dy > FINE_DEADZONE) {
          gain = Math.max(MIN_GAIN, 1 / (1 + (dy - FINE_DEADZONE) / FINE_RATE));
        }
        yearFloat = clampYear(yearFloat + (t.clientX - lastX) * yearsPerPx * gain);
        lastX = t.clientX;
        const nowFine = gain < 0.85;
        if (nowFine) {
          zoomEl.hidden = false;
          zoomEl.textContent = `×${Math.max(2, Math.round(1 / gain))}`;
          loupe.classList.add('fine');
        } else {
          zoomEl.hidden = true;
          loupe.classList.remove('fine');
        }
        if (nowFine !== fineMode) { fineMode = nowFine; updateHint(); }
        setLoupe(t);
        commitYear();
      }, { passive: false });

      const endLoupe = () => {
        if (!active) return;
        active = false;
        loupe.classList.remove('on', 'fine');
        zoomEl.hidden = true;
        if (fineMode) { fineMode = false; updateHint(); }
        setTimeout(() => { if (!active) loupe.hidden = true; }, 160);
      };
      timelineSlider.addEventListener('touchend', endLoupe);
      timelineSlider.addEventListener('touchcancel', endLoupe);
    })();

}
