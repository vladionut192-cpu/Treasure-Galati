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
