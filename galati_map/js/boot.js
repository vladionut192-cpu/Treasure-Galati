// Heritage Galați — boot / setup (rulează ÎNAINTE de js/main.js)
// Extras din capul lui main.js (refactor 2026-06-02). Conține blocuri
// independente de closure-ul core: detecție local-dev, wire-up i18n picker,
// onboarding tooltips, înregistrare service-worker. Comunică cu core-ul DOAR
// prin window.* (ex. window.__render) cu guard typeof, deci ordinea i18n.js →
// boot.js → main.js e suficientă.


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

    // ─── Onboarding — ghid pas cu pas (walkthrough) ───
    // Un singur tooltip vizibil pe rând, cu spotlight peste secțiunea curentă
    // (restul ecranului întunecat), butoane Înapoi / Următor și închidere oricând
    // (X sau Esc). Persistent printr-un singur flag localStorage `tg.tour.seen`.
    // Pe mobil rămâne sheet-ul dedicat (#mobile-help-sheet).
    (function () {
      const TOUR_SEEN_KEY = 'tg.tour.seen';
      // Ordinea narativă a pașilor (după data-tip-id); restul, în ordinea din DOM.
      const STEP_ORDER = ['header', 'timeline', 'tabs', 'layers', 'map-point', 'help'];

      function isTourSeen() {
        try { return localStorage.getItem(TOUR_SEEN_KEY) === '1'; }
        catch (e) { return false; }
      }
      function markTourSeen() {
        try { localStorage.setItem(TOUR_SEEN_KEY, '1'); } catch (e) {}
      }

      // Lista ordonată de pași (tooltip-uri)
      function tipList() {
        const tips = Array.from(document.querySelectorAll('.tour-tip[data-tip-id]'));
        tips.sort((a, b) => {
          const ia = STEP_ORDER.indexOf(a.dataset.tipId);
          const ib = STEP_ORDER.indexOf(b.dataset.tipId);
          return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
        });
        return tips;
      }

      // Overlay (blochează interacțiunea cu UI-ul de dedesubt) + spotlight
      // (gaura luminoasă + întunericul din jur). Create lazy, o singură dată.
      let overlayEl = null, spotlightEl = null;
      function ensureChrome() {
        if (!overlayEl) {
          overlayEl = document.createElement('div');
          overlayEl.className = 'tour-overlay';
          overlayEl.hidden = true;
          document.body.appendChild(overlayEl);
        }
        if (!spotlightEl) {
          spotlightEl = document.createElement('div');
          spotlightEl.className = 'tour-spotlight';
          spotlightEl.hidden = true;
          document.body.appendChild(spotlightEl);
        }
      }

      // Injectează footer-ul de navigare (Înapoi · contor · Următor) o singură dată.
      function ensureNav(tip) {
        if (tip.querySelector('.tip-nav')) return;
        const nav = document.createElement('div');
        nav.className = 'tip-nav';
        nav.innerHTML =
          '<button type="button" class="tip-back"></button>' +
          '<span class="tip-step"></span>' +
          '<button type="button" class="tip-next"></button>';
        tip.appendChild(nav);
        nav.querySelector('.tip-back').addEventListener('click', () => goToStep(current - 1));
        nav.querySelector('.tip-next').addEventListener('click', () => {
          if (current >= steps.length - 1) endTour(true);
          else goToStep(current + 1);
        });
      }

      let steps = [];
      let current = -1;

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
          case 'below-right':
            left = r.right - tipR.width;
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

      // Poziționează spotlight-ul (gaura luminoasă) peste o țintă.
      function positionSpotlight(target) {
        const r = target.getBoundingClientRect();
        const pad = 6;
        spotlightEl.hidden = false;
        spotlightEl.style.left = Math.max(0, r.left - pad) + 'px';
        spotlightEl.style.top = Math.max(0, r.top - pad) + 'px';
        spotlightEl.style.width = Math.min(window.innerWidth, r.width + pad * 2) + 'px';
        spotlightEl.style.height = Math.min(window.innerHeight, r.height + pad * 2) + 'px';
      }

      function showOnly(tip) {
        steps.forEach(t => { if (t !== tip) t.hidden = true; });
      }

      function targetVisible(target) {
        if (!target) return false;
        const rr = target.getBoundingClientRect();
        return rr.width > 0 || rr.height > 0;
      }

      // Mută ghidul la pasul `i`, sărind peste pașii cu țintă lipsă/invizibilă.
      function goToStep(i) {
        if (!steps.length) return;
        const dir = i >= current ? 1 : -1;
        let idx = i;
        while (idx >= 0 && idx < steps.length) {
          const target = document.querySelector(steps[idx].dataset.target);
          if (targetVisible(target)) break;
          idx += dir;
        }
        if (idx < 0 || idx >= steps.length) { endTour(true); return; }
        current = idx;
        const tip = steps[current];
        const target = document.querySelector(tip.dataset.target);
        showOnly(tip);
        ensureNav(tip);
        positionTip(tip);
        positionSpotlight(target);

        const tt = (typeof window.t === 'function') ? window.t : (k) => k;
        const back = tip.querySelector('.tip-back');
        const next = tip.querySelector('.tip-next');
        const stepEl = tip.querySelector('.tip-step');
        back.textContent = '‹ ' + tt('tour.back');
        back.disabled = current === 0;
        const last = current === steps.length - 1;
        next.textContent = last ? tt('tour.done') : (tt('tour.next') + ' ›');
        stepEl.textContent = tt('tour.step', { i: current + 1, n: steps.length });
      }

      function startTour() {
        if (isMobileViewport()) { openMobileHelpSheet(); return; }
        ensureChrome();
        steps = tipList();
        if (!steps.length) return;
        overlayEl.hidden = false;
        spotlightEl.hidden = false;
        current = -1;
        goToStep(0);
      }

      function endTour(seen) {
        steps.forEach(t => { t.hidden = true; });
        if (overlayEl) overlayEl.hidden = true;
        if (spotlightEl) spotlightEl.hidden = true;
        current = -1;
        if (seen) markTourSeen();
      }

      function tourActive() {
        return !!(overlayEl && !overlayEl.hidden);
      }

      // Reposiționează pasul curent la resize / scroll (timeline, sidebar etc.)
      let positionTimer = null;
      function scheduleReposition() {
        if (!tourActive() || current < 0) return;
        clearTimeout(positionTimer);
        positionTimer = setTimeout(() => {
          const tip = steps[current];
          if (!tip) return;
          const target = document.querySelector(tip.dataset.target);
          if (!targetVisible(target)) return;
          positionTip(tip);
          positionSpotlight(target);
        }, 60);
      }
      window.addEventListener('resize', scheduleReposition);
      window.addEventListener('scroll', scheduleReposition, true);

      // X pe oricare tooltip închide tot ghidul (oricând).
      tipList().forEach(tip => {
        const x = tip.querySelector('.tip-close');
        if (x) x.addEventListener('click', () => endTour(true));
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
      // Pornește automat ghidul la prima vizită — DOAR pe desktop. Pe mobil
      // rămâne disponibil la cerere prin butonul „?".
      if (!isMobileViewport() && !isTourSeen()) {
        setTimeout(startTour, 800);
      }
      // Safeguard: la resize spre mobil, dacă ghidul e activ, îl închidem.
      window.addEventListener('resize', () => {
        if (isMobileViewport() && tourActive()) endTour(true);
      }, { passive: true });

      // Buton „?" (top-right pe hartă):
      //   • pe mobil            → deschide sheet-ul dedicat
      //   • dacă ghidul e activ → îl închide
      //   • altfel              → repornește ghidul de la primul pas
      const helpFab = document.getElementById('help-fab');
      const mobileSheet = document.getElementById('mobile-help-sheet');
      function openMobileHelpSheet() {
        if (!mobileSheet) return;
        mobileSheet.hidden = false;
        mobileSheet.querySelectorAll('[data-close="1"]').forEach(el => {
          el.onclick = () => { mobileSheet.hidden = true; };
        });
      }
      if (helpFab) {
        helpFab.addEventListener('click', () => {
          if (isMobileViewport()) { openMobileHelpSheet(); return; }
          if (tourActive()) endTour(true);
          else startTour();
        });
      }
      // Esc închide ghidul (oricând) sau sheet-ul mobil.
      document.addEventListener('keydown', (e) => {
        if (e.key !== 'Escape') return;
        if (tourActive()) endTour(true);
        else if (mobileSheet && !mobileSheet.hidden) mobileSheet.hidden = true;
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
