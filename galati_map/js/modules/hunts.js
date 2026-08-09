import { trapModalFocus } from './a11y.js';

// Heritage Galați — modul: treasure hunts — progres în localStorage, ghicitori
// cu anti-spoiler, verificare locație pe mini-hartă (Leaflet secundar).
export function initHunts(ctx) {
  const { map, escapeHtml, openDetail, huntsData, lightbox, lightboxImg, lightboxCaption } = ctx;
  // Panourile de tab (din index.html) — referențiate la exit hunt.
  const panelLocations = document.getElementById('panel-locations');
  const panelTours = document.getElementById('panel-tours');
  const panelHunts = document.getElementById('panel-hunts');
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
      ctx.activeHunt = null;
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
        // Coperta: miniatura de 480px → original → inițiala stilizată.
        // Inițiala trece prin `dataset`, nu interpolată într-un string JS din
        // atributul onerror: acolo `escapeHtml` produce `&#039;`, pe care parserul
        // HTML îl decodează înapoi în `'` ÎN INTERIORUL literalului JS, deci un
        // titlu care începe cu apostrof rupea handler-ul.
        const coverThumb = ctx.thumbUrl ? ctx.thumbUrl(h.cover) : null;
        const coverHtml = h.cover
          ? `<img class="cover" src="${escapeHtml(coverThumb || h.cover)}" data-full="${escapeHtml(h.cover)}" data-initial="${escapeHtml(initial)}" alt="${escapeHtml(h.title)}" loading="lazy" decoding="async" onerror="this.dataset.err=(+this.dataset.err||0)+1;if(this.dataset.err==1&amp;&amp;this.dataset.full){this.src=this.dataset.full}else{this.onerror=null;var d=document.createElement('div');d.className='cover-fallback';d.textContent=this.dataset.initial||'';this.replaceWith(d)}">`
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
      ctx.activeHunt = hunt;
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
      ctx.activeHunt = null;
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
      if (!ctx.activeHunt) return;
      if (huntLayer) { map.removeLayer(huntLayer); }
      huntLayer = L.layerGroup().addTo(map);
      const progress = loadHuntProgress(ctx.activeHunt) || newHuntProgress();
      // Pe hartă afișăm DOAR checkpoint-urile descoperite (rezolvate sau curent
      // dar verificat). Restul rămân ascunse — userul trebuie să le găsească
      // prin cifruri și verificare locație.
      const visiblePts = [];
      ctx.activeHunt.checkpoints.forEach((cp, idx) => {
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
          color: ctx.activeHunt.color || '#8b1e22',
          weight: 4, opacity: 0.7, dashArray: '8 6'
        }).addTo(map);
      }
    }

    function renderHuntStopList() {
      if (!ctx.activeHunt) return;
      const progress = loadHuntProgress(ctx.activeHunt) || newHuntProgress();
      huntStopsEl.innerHTML = '';
      ctx.activeHunt.checkpoints.forEach((cp, idx) => {
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
      const total = ctx.activeHunt.checkpoints.length;
      const done = progress.solved.length;
      huntProgressFill.style.width = `${(done / total) * 100}%`;
      huntProgressText.textContent = `${done} / ${total} obiective · ${progress.score} puncte`;
    }

    function renderHuntCheckpoint() {
      if (!ctx.activeHunt) return;
      const progress = loadHuntProgress(ctx.activeHunt) || newHuntProgress();
      const total = ctx.activeHunt.checkpoints.length;
      const done = progress.solved.length;
      huntCheckpointEl.innerHTML = '';
      // Completion screen
      if (done >= total) {
        const minutes = Math.round((Date.now() - (progress.startedAt || Date.now())) / 60000);
        huntCheckpointEl.innerHTML = `
          <div class="hunt-completed">
            <h3>${escapeHtml(ctx.activeHunt.treasure?.title || 'Comoara descoperită!')}</h3>
            <p>${escapeHtml(ctx.activeHunt.treasure?.narrative || 'Felicitări!')}</p>
            <div class="score">${progress.score} puncte</div>
            <p style="font-size:12px;color:#5d3f1a;margin:0;">finalizat în ~${minutes} minute</p>
          </div>
        `;
        return;
      }
      // Active checkpoint
      const cp = ctx.activeHunt.checkpoints[progress.currentIdx];
      if (!cp) return;
      // Render clue: dacă cp curent nu are clue propriu, folosim next_clue al
       // checkpoint-ului anterior (acela e indiciul care a condus aici).
      let displayClue = cp.clue;
      if (!displayClue && progress.currentIdx > 0) {
        const prev = ctx.activeHunt.checkpoints[progress.currentIdx - 1];
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
        const progress = loadHuntProgress(ctx.activeHunt) || newHuntProgress();
        if (!progress.solved.includes(cp.id)) progress.solved.push(cp.id);
        progress.score += cp.riddle.points;
        progress.currentIdx = Math.min(progress.currentIdx + 1, ctx.activeHunt.checkpoints.length);
        progress.currentVerified = false;  // următorul cp începe locked
        saveHuntProgress(ctx.activeHunt, progress);
        // Show "next" button
        actions.innerHTML = '';
        const nextBtn = document.createElement('button');
        nextBtn.type = 'button';
        nextBtn.textContent = progress.solved.length >= ctx.activeHunt.checkpoints.length
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
        const progress = loadHuntProgress(ctx.activeHunt) || newHuntProgress();
        progress.score -= WRONG_ANSWER_PENALTY;
        saveHuntProgress(ctx.activeHunt, progress);
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
      if (typeof ctx.focusLightbox === 'function') ctx.focusLightbox();
      // Indiciile de hunt nu au navigare — ascundem săgețile
      if (typeof ctx.lightboxQueue !== 'undefined') {
        ctx.lightboxQueue = [];
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

    // Focus trap (WCAG) pe dialogul de verificare a locației.
    const verifyTrap = trapModalFocus(verifyModal, { initialFocus: '#verify-close' });
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
      verifyTrap.activate();
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
      verifyTrap.deactivate();
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
      if (!verifyMarker || !verifyTargetCp || !ctx.activeHunt) return;
      const target = L.latLng(verifyTargetCp.lat, verifyTargetCp.lon);
      const dist = verifyMarker.getLatLng().distanceTo(target);
      if (dist <= VERIFY_RADIUS_M) {
        verifyFeedback.className = 'success';
        verifyFeedback.textContent = '✓ Excelent! Te afli la obiectiv. Se deschide ghicitoarea...';
        const progress = loadHuntProgress(ctx.activeHunt) || newHuntProgress();
        progress.currentVerified = true;
        saveHuntProgress(ctx.activeHunt, progress);
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
      if (!ctx.activeHunt) return;
      if (!confirm(`Sigur resetezi progresul pentru „${ctx.activeHunt.title}"? Vei pierde toate punctele și checkpoint-urile rezolvate.`)) return;
      clearHuntProgress(ctx.activeHunt);
      // Re-render
      renderHuntCheckpoint();
      renderHuntMarkers();
      renderHuntStopList();
    });


    ctx.hunts = hunts;
    ctx.enterHunt = enterHunt;
    ctx.exitHunt = exitHunt;
    ctx.renderHuntBrowse = renderHuntBrowse;
}
