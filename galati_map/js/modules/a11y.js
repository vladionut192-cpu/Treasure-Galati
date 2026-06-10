// Heritage Galați — modul: utilitare de accesibilitate.
// trapModalFocus(modal): cât timp modalul e activ, Tab / Shift+Tab ciclează
// doar prin elementele focusabile din interior (focus trap — cerință WCAG
// pentru dialoguri). La activate() focusăm ținta inițială și memorăm de unde
// a venit utilizatorul; la deactivate() restaurăm focusul acolo.

const FOCUSABLE = [
  'a[href]', 'button:not([disabled])', 'input:not([disabled])',
  'select:not([disabled])', 'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

export function trapModalFocus(modal, opts) {
  const initialFocus = (opts && opts.initialFocus) || null;
  let lastActive = null;
  let active = false;

  function focusables() {
    // offsetParent null = ascuns (display:none pe el sau pe un părinte)
    return [...modal.querySelectorAll(FOCUSABLE)]
      .filter((el) => el.offsetParent !== null || el === document.activeElement);
  }

  // Capture-phase ca să batem alți listeneri de keydown din pagină.
  document.addEventListener('keydown', (e) => {
    if (!active || e.key !== 'Tab') return;
    const els = focusables();
    if (!els.length) return;
    const first = els[0];
    const last = els[els.length - 1];
    const inside = modal.contains(document.activeElement);
    if (e.shiftKey && (document.activeElement === first || !inside)) {
      last.focus();
      e.preventDefault();
    } else if (!e.shiftKey && (document.activeElement === last || !inside)) {
      first.focus();
      e.preventDefault();
    }
  }, true);

  return {
    activate() {
      if (active) return;
      active = true;
      lastActive = document.activeElement;
      const target = (initialFocus && modal.querySelector(initialFocus))
        || focusables()[0] || modal;
      try { target.focus(); } catch (e) { /* element nefocusabil — ignorăm */ }
    },
    deactivate() {
      if (!active) return;
      active = false;
      if (lastActive && document.contains(lastActive)) {
        try { lastActive.focus(); } catch (e) {}
      }
      lastActive = null;
    },
  };
}
