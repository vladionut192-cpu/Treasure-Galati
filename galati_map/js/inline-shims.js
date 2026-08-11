// Heritage Galați — înlocuitorii handlerelor inline.
//
// Existau două tipare de atribute inline în markup: `onerror` pe imaginile cu
// miniatură (rezerva WebP → JPEG) și `onload` pe cele două `<link rel=preload
// as=style>` care încarcă CSS-ul Leaflet fără să blocheze randarea. Ambele sunt
// cod executabil scris în atribut, deci un `script-src` strict le-ar bloca:
// imaginile ar rămâne rupte, iar harta ar apărea nestilizată.
//
// Mutate aici, politica poate fi `script-src 'self'`, fără `unsafe-inline` și
// fără `unsafe-hashes`. Scriptul rulează devreme, înaintea încărcării imaginilor.
(function () {
  'use strict';

  // ─── Rezerva pentru imagini ──────────────────────────────────────────────
  // `error` nu se propagă în sus, dar se poate prinde în faza de captură, așa
  // că un singur ascultător pe document acoperă toate imaginile, inclusiv pe
  // cele adăugate ulterior de randare.
  //
  // Trei situații, în ordinea încercărilor:
  //   1. miniatura .webp lipsește  → încearcă originalul din `data-full`;
  //   2. originalul lipsește și el → dacă există `data-initial`, îl înlocuim
  //      cu o casetă cu inițiala (cardurile de vânătoare);
  //   3. altfel, lăsăm imaginea ruptă, ca până acum.
  document.addEventListener('error', function (e) {
    var img = e.target;
    if (!img || img.tagName !== 'IMG') return;
    var n = (parseInt(img.dataset.err, 10) || 0) + 1;
    img.dataset.err = String(n);
    if (n === 1 && img.dataset.full && img.src !== img.dataset.full) {
      img.src = img.dataset.full;
      return;
    }
    if (img.dataset.initial) {
      var d = document.createElement('div');
      d.className = 'cover-fallback';
      d.textContent = img.dataset.initial;
      if (img.parentNode) img.replaceWith(d);
    }
  }, true);

  // ─── CSS-ul încărcat asincron ────────────────────────────────────────────
  // `rel=preload as=style` descarcă fișierul fără să blocheze randarea; abia
  // trecerea la `rel=stylesheet` îl aplică. Dacă preload-ul s-a terminat deja
  // când ajungem aici, evenimentul `load` nu mai vine, deci comutăm direct.
  function aplicaStiluri() {
    var linkuri = document.querySelectorAll('link[data-async-style]');
    for (var i = 0; i < linkuri.length; i++) {
      (function (l) {
        if (l.rel === 'stylesheet') return;
        l.addEventListener('load', function () { l.rel = 'stylesheet'; }, { once: true });
        // Preload deja încheiat: `sheet` e populat sau resursa e în cache.
        l.rel = 'stylesheet';
      })(linkuri[i]);
    }
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', aplicaStiluri);
  } else {
    aplicaStiluri();
  }
  aplicaStiluri();
})();
