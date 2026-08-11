// Analytics privacy-friendly (GoatCounter) — fără cookieuri, fără date personale,
// fără cookie banner necesar (GoatCounter nu setează cookieuri și nu colectează PII).
//
// ACTIVARE (o singură dată):
//   1. Creează un site gratuit pe https://www.goatcounter.com (cont non-comercial).
//      Primești un cod, ex. „heritage-galati" → https://heritage-galati.goatcounter.com
//   2. Pune codul în GC_CODE mai jos. Atât — devine activ pe toate paginile
//      (toate includ acest script).
//
// Cât timp GC_CODE e gol, scriptul NU face nimic (zero requesturi externe),
// deci e safe să fie deployat ca atare până îți faci contul.
(function () {
  'use strict';
  // Când completezi codul, adaugă și originile în CSP-ul din
  // galati_map/.htaccess: `script-src … https://gc.zgo.at` și
  // `connect-src … https://*.goatcounter.com`. Altfel scriptul e blocat
  // tăcut și pare că analytics-ul pur și simplu nu numără.
  var GC_CODE = '';  // ex: 'heritage-galati'
  if (!GC_CODE) return;

  var endpoint = 'https://' + GC_CODE + '.goatcounter.com/count';
  var s = document.createElement('script');
  s.async = true;
  s.src = '//gc.zgo.at/count.js';
  s.setAttribute('data-goatcounter', endpoint);
  document.head.appendChild(s);

  // SPA: index.html schimbă „paginile" prin hash (#stories, #about, …) fără
  // reload, deci GoatCounter ar număra o singură vizualizare. Trimitem manual
  // un count la fiecare schimbare de hash, cu calea = hash-ul.
  window.addEventListener('hashchange', function () {
    if (window.goatcounter && window.goatcounter.count) {
      window.goatcounter.count({
        path: location.pathname + location.hash,
        event: false,
      });
    }
  });
})();
