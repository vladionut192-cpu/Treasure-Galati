# Treasure Galați — Structura proiectului și sugestii de îmbunătățire

*Document generat la 10 iunie 2026. Cifrele (număr de locații, linii de cod, dimensiuni) reflectă starea repo-ului la această dată.*

---

## 1. Ce este proiectul

Hartă interactivă de patrimoniu pentru municipiul Galați: **288 de locații** documentate, **12 tururi tematice**, **4 aventuri de tip treasure hunt**, cronologie interactivă 1445–2026, fotografii istorice geolocate, suprapuneri de hărți istorice (eHarta WMS) și articole narative (Bătălia de la Galați 1918, legende, curiozități).

Aplicația este **100% statică** — HTML + CSS + JavaScript vanilla + Leaflet, cu datele în fișiere JSON. Nu există backend, bază de date sau framework. Se deployează automat pe `ionpeblog.ro` prin GitHub Actions.

---

## 2. Structura pe foldere

```
Treasure-Galati/
├── galati_map/                  ★ APLICAȚIA WEB (tot ce ajunge pe site)
├── assets/images/               ~327 MB poze (commons/, local/, pubcrawl/, comic 1918)
├── scripts/                     unelte Python de mentenanță și build
├── Surse/                       cercetare documentară (OCR .txt din cărți/PDF-uri)
├── deploy/                      arhivă cPanel + instrucțiuni (deploy manual, istoric)
├── .github/workflows/           deploy.yml — pipeline CI/CD
│
│  — foldere de lucru, NU ajung pe site —
├── Aplicatia Treasure Galati/   prototip vechi (backend Node + frontend React Native)
├── Batalia de la Galati/        surse imagini + benzi desenate pentru articolul 1918
├── Poze galati/                 pool de fotografii brute, înainte de optimizare
├── Branding si Grafice/         surse de design (.psd, .svg)
├── Pub Crawl - Traseu/          poze full-res traseu
├── design inspiration/          proiect React/Tailwind folosit ca referință vizuală
└── ocr/                         artefacte de procesare OCR
```

### 2.1 `galati_map/` — aplicația propriu-zisă

**Pagini HTML:**

| Fișier | Rol |
|---|---|
| `index.html` | SPA principal: hartă + sidebar + timeline + pagini interne (Povești, Despre, Contribuie) comutate prin hash routing (`#map`, `#stories`…) |
| `lists.html` | pagina „Liste" — primari, prefecți, recensăminte (cronologia ca riglă) |
| `maps.html` | galerie cronologică de hărți istorice cu lightbox |
| `batalia-galati-1918.html` | articol narativ + comic reader despre bătălia din 1918 |
| `piata-regala-ar.html` | pilot AR — reconstrucția Pieței Regale |
| `loc/loc-*.html` (268), `tour/`, `hunt/`, `leg/`, `triv/` | **pagini statice generate** de `scripts/generate_static_pages.py` pentru SEO — fiecare locație/tur/aventură/legendă/curiozitate are un URL indexabil care redirectează spre SPA |
| `_admin/` | editoare locale (add_location, editor, digitizer, tours_editor, pubcrawl_editor, text_pins_editor) — vizibile doar pe `localhost` (clasa `local-dev`) |

**Date (sursa de adevăr e JSON, nu HTML):**

| Fișier | Conținut |
|---|---|
| `locations.json` | ★ 288 locații: coordonate, categorie, descriere RO/EN, `year_built`/`year_demolished`, galerii foto, credit Commons |
| `manual_overrides.json` | patch-uri aplicate peste locații (corecturi de coordonate/descrieri) |
| `tours.json` + `tours_routes.json` | 12 tururi tematice + polilinii de traseu |
| `treasure_hunts.json` | 4 aventuri cu ghicitori, indicii, checkpoint-uri |
| `cronologie.json` | 161 intrări de cronologie (alimentează tooltip-ul timeline-ului) |
| `galati-altadata.json` | 202 fotografii istorice geolocate (bulinele portocalii) |
| `trivia.json` / `legende.json` | 15 curiozități / 11 legende — pinuri text pe hartă |
| `cartiere.geojson`, `valuri.geojson`, `historical_boundaries.geojson`, `piata_regala_buildings.geojson` | straturi vectoriale (cartiere Voronoi, Valul lui Traian/Atanaric, granițe administrative pe epoci, clădirile Pieței Regale) |
| `geocode_cache.json` | cache Nominatim (folosit de scripturi, nu de site) |

**JavaScript (`js/`, fără framework, fără bundler — module ES native, refactor 2026-06-10):**

| Fișier | Rol |
|---|---|
| `boot.js` | setup independent încărcat primul: detecție local-dev, onboarding/ghid pas-cu-pas, înregistrare service worker |
| `i18n.js` | dicționar RO/EN, `t()`, `getLang()`, aplicare `data-i18n`, eveniment `langchange` |
| `main.js` (~110 linii) | entry point ES: încarcă datele, construiește contextul partajat `ctx` și inițializează modulele în ordine |
| `modules/core-map.js` | hartă Leaflet + markere/clustere + `render()` + panou detaliu + lightbox-galerie + filtre + căutare Fuse.js |
| `modules/timeline.js` | cronologia + overlay an + lupa touch + gradații generate din `timeline_events.json` |
| `modules/overlays.js` | hărți istorice WMS, fortificații, granița administrativă, bule desktop |
| `modules/altadata.js` | fotografii istorice geolocate + navigare lightbox după distanță |
| `modules/text-pins.js` | „Știați că?" + Legende + modal text |
| `modules/deep-links.js` | `?loc / ?tour / ?hunt / ?triv / ?leg` |
| `modules/tours.js`, `modules/hunts.js` | tururi tematice; treasure hunts cu verificare locație |
| `modules/chrome.js`, `modules/events-page.js`, `modules/admin.js` | navigare pagini + UI mobil; pagina Povești + comic 1918; unelte admin local-dev |
| `lists.js`, `maps.js` + `*.head.js` | logica paginilor secundare |

Contractul dintre module: obiectul partajat `ctx` (creat în `main.js`) ține starea comună (`activeId`, `activeTour`, `timelineYear`, cozile lightbox…) și serviciile publicate de fiecare modul (`ctx.render`, `ctx.openDetail`, `ctx.refreshPubcrawlVisibility`…). Modulele inițializate mai devreme folosesc `ctx.fn?.()` pentru serviciile publicate mai târziu.

**CSS (`styles/`, importate de `main.css` prin `@import`):**
`base.css` (variabile + chrome Leaflet) → `topbar.css`, `pages.css` (layout + sidebar + timeline strip), `widgets.css` (timeline track + lupă + lightbox + FAB-uri), `onboarding.css` (ghid + **media queries mobile principale**), `hunts.css`, `lists.css`, `maps.css`, `polish.css` (rafinări finale), `tooltip.css`, `layer-bubbles.css`, `language-picker.css`.

**Altele:** `sw.js` (service worker cu cache versionat manual — `tg-v116`), `vendor/` (Leaflet, MarkerCluster, Fuse, fontul Inter — toate self-hosted), `robots.txt`, `sitemap.xml`, `_headers`.

### 2.2 `scripts/` — pipeline de conținut (Python)

* `validate_data.py` — validează JSON-urile (rulează și în CI, blochează deploy-ul la date corupte)
* `generate_static_pages.py` — generează paginile SEO `loc/`, `tour/`, `hunt/`, `leg/`, `triv/`
* `build.py`, `enrich_metadata.py`, `parse_chronology.py` — sincronizare și îmbogățire date
* `find_images.py` → `review_images.py` → `apply_images.py` — pipeline de curatare poze de pe Wikimedia Commons (căutare → review vizual HTML → descărcare + sync)
* `add_photo.py` — adăugare poze proprii; `make_og_image.py`, `make_deploy_archive.py`, `serve.py` — utilitare

### 2.3 Deploy

`push pe main` → GitHub Actions (`deploy.yml`): validare JSON → generare pagini SEO → upload FTP pe `ionpeblog.ro`. Există și o arhivă cPanel manuală în `deploy/` (istoric).

---

## 3. Cum curge aplicația (arhitectura runtime)

1. `index.html` încarcă `boot.js` (sync) → onboarding, i18n picker, service worker.
2. `main.js` (IIFE async) face `Promise.all` pe `locations.json`, `cartiere.geojson`, `tours.json`, `tours_routes.json`, `treasure_hunts.json`, apoi inițializează harta și UI-ul.
3. Starea de filtrare e ținută în closure-uri (`timelineYear`, chip-uri, căutare); orice schimbare cheamă `render()` care reconstruiește lista + markerele.
4. Timeline-ul e un `<input type="range">` 1445–2026; valoarea 2026 = „fără filtru". Pe touch, gestul e preluat de lupa de precizie (vezi `initTimelineLoupe` în `main.js`).
5. Navigarea între „pagini" e hash routing în interiorul SPA; paginile statice generate există doar pentru crawlere și redirectează spre SPA.
6. Service worker-ul face cache-first pe shell + stale-while-revalidate pe JSON — **orice modificare de cod cere bump la `CACHE_VERSION` în `sw.js`**, altfel utilizatorii recurenți primesc versiunea veche.

---

## 4. Sugestii de îmbunătățire

Ordonate pe priorități; primele au cel mai bun raport efort/impact.

### 🔴 Prioritate mare

**1. ✅ Spargerea `main.js` (4 660 de linii) în module ES.** — *implementat 2026-06-10.*
Monolitul a fost spart în 11 module sub `js/modules/` (vezi tabelul din §2.1), cu un `main.js` de ~110 linii care doar încarcă datele și inițializează modulele în ordinea vechiului IIFE. Fără bundler — `<script type="module">` nativ.

**2. ✅ Automatizarea versiunii service worker-ului.** — *exista deja parțial; întărit 2026-06-10.*
CI-ul avea deja pasul care adaugă SHA-ul commitului la `CACHE_VERSION` la fiecare deploy (deci în producție cache-ul se împrospăta corect — analiza inițială a fost prea pesimistă; problema apare doar pe local). Întărit: dacă pattern-ul `CACHE_VERSION` nu mai e găsit în `sw.js`, deploy-ul **eșuează** în loc să continue silențios cu versiunea veche.

**3. Optimizarea imaginilor (327 MB).**
Cea mai mare frână de performanță pe mobil. Recomandat: conversie în WebP/AVIF cu fallback (`<picture>`), generare de 2–3 dimensiuni (`srcset`) pentru galerii vs. thumbnail-uri, și un script `optimize_images.py` în pipeline. La 4G, o galerie de pin se poate ușura de la mai mulți MB la câteva sute de KB.

**4. ✅ Eliminarea dublei surse de adevăr pentru evenimentele din timeline.** — *implementat 2026-06-10.*
Acum există un singur `timeline_events.json` (72 evenimente + `track_years` + `major_years`); `js/modules/timeline.js` generează din el gradațiile de pe riglă (procentul `left` e calculat), romburile din lupa mobilă și textele overlay-ului. Span-urile hardcodate din `index.html` și array-ul `allEvents` din JS au dispărut; selectorii pe `data-year` din `polish.css` au devenit clasa `.major`.

### 🟡 Prioritate medie

**5. ✅ Reducerea greutății repo-ului git.** — *implementat 2026-06-10.*
Curățare locală: `git gc` + expirarea obiectelor de neatins a redus `.git` de la **1,3 GB la 350 MB** (restul de „greutate" erau obiecte orfane din operații întrerupte, nu istoricul propriu-zis). PDF-urile de hunt din rădăcină (4 × ~4 MB) au fost mutate în `Surse/` (gitignored) și scoase din tracking. Migrarea `assets/images/` pe Git LFS rămâne o decizie separată — cere rescriere de istorie + coordonare la force-push și complică deploy-ul FTP (checkout cu LFS); la 350 MB nu se mai justifică urgența.

**6. ✅ Teste automate minime.** — *implementat 2026-06-10.*
(a) **Smoke test Playwright** (`tests/smoke.spec.js`, 4 teste): harta se încarcă fără erori de consolă, timeline-ul are gradațiile generate din JSON și filtrează lista, detaliul se deschide/închide (incl. Escape), deep link `?loc=` funcționează. Rulează în CI ca **gate înaintea deploy-ului** (job-ul `smoke` din `deploy.yml`); local: `npm run test:local` (folosește Chrome-ul instalat). Lecții codificate în config: service worker-ul e blocat (`serviceWorkers: 'block'` — altfel reload-ul lui de la prima vizită pica nedeterminist în mijlocul testului), serverul static e unul propriu pe Node (`tests/static-server.js` — `python http.server` scăpa conexiuni sub rafale). (b) **Validatorul extins**: `validate_data.py` verifică acum și existența pe disc a fiecărei imagini referențiate (1 216 referințe, toate valide la implementare) + structura `timeline_events.json` (track ⊆ events, major ⊆ track).

**7. ✅ Performanța `render()` la glisarea timeline-ului.** — *implementat 2026-06-10.*
Overlay-ul de an rămâne instant; partea grea (re-render listă + markere + refresh straturi) rulează cu debounce de 80 ms trailing în `timeline.js` — starea finală e mereu aplicată, dar glisarea rapidă nu mai re-randează la fiecare an parcurs.

**8. ✅ PWA completă.** — *implementat 2026-06-10.*
`manifest.json` (standalone, RO, culori temă) + iconițe generate din sigiliul SVG (`icons/`: 192/512/maskable/apple-touch) + `theme-color` pe toate cele 3 pagini + precache în service worker. Site-ul e acum instalabil („Add to Home Screen").

**9. ✅ Unificarea variabilelor CSS.** — *implementat 2026-06-10.*
Noul `styles/tokens.css` e sursa unică pentru paletă + tipografie; `base.css`, `lists.css` și `maps.css` îl importă, păstrând local doar override-urile intenționate (`--burgundy` roșu pe paginile secundare, `--max-w`, `--orange`). O ajustare de brand se face acum într-un singur loc.

**10. ✅ Accesibilitate.** — *implementat 2026-06-10.*
Slider-ul cronologiei are `aria-label` + `aria-valuetext` cu context („1918 — Regatul României · Interbelic"), actualizat la input și tradus RO/EN. Modalele text și de verificare a locației au **focus trap** (modulul `a11y.js`: Tab ciclează în interior, la închidere focusul revine de unde a venit); lightbox-ul primește focus la deschidere și îl restaurează la închidere. Contrastul `--muted` a fost ridicat de la `.50` la `.65` (4,57:1 pe `--paper` — trece WCAG AA pentru text mic; înainte era 3,06:1).

### 🟢 De avut în vedere (nice to have)

**11. ✅ i18n complet pentru conținut.** — *implementat 2026-06-10.*
Auditul a arătat o acoperire mult mai bună decât estimarea inițială: `title_en`/`description_en` **100%**, `excerpt_en`/`location_en` 100% acolo unde există conținut RO. Golurile reale erau legendele foto: 29 de `caption_en` lipsă în `galati-altadata.json` (completate) și legendele de galerie (cele cu text RO erau deja 100% traduse; 541 de imagini pur și simplu nu au legendă). Auditul e acum **permanent**: `validate_data.py` are secțiunea „Acoperire traduceri EN" — o locație nouă fără `description_en` devine warning vizibil la fiecare commit. Bonus: reparat un bug prin care figcaption-urile galeriei afișau mereu RO chiar și pe interfața EN (`core-map.js` ignora `caption_en`).

**12. ✅ Date structurate SEO.** — *implementat 2026-06-10.*
JSON-LD exista deja în paginile generate, dar generic. Acum: locațiile existente sunt `TouristAttraction` + `LandmarksOrHistoricalBuildings` (cele demolate rămân `Place` — nu poți „vizita" o clădire dispărută), cu `image`, `geo`, `containedInPlace` și `isAccessibleForFree`; tururile (`TouristTrip`) au `image` + `itinerary` (ItemList cu numele opririlor, rezolvate din `locations.json`); hunturile (`Event`) au `location` (obligatoriu pentru rich results Google) + `image`. Paginile principale au primit blocuri statice: `WebSite` pe index.html, `CollectionPage` pe lists.html și maps.html.

**13. Analytics privacy-friendly.** Un Plausible/GoatCounter (fără cookie banner) ar arăta ce locații/tururi sunt populare — informație utilă pentru prioritizarea conținutului.

**14. ✅ Curățenie în rădăcina repo-ului.** — *implementat 2026-06-10.*
Ambele foldere erau deja gitignored (cu explicații în `.gitignore`), dar lipseau din tabelul „Foldere de lucru" al README-ului rădăcină — adăugate, marcate explicit **arhivă**. În plus, fiecare a primit un README *în interiorul folderului* (force-add peste gitignore, deci versionat și vizibil în clone): `Aplicatia Treasure Galati/README.md` și `design inspiration/README-ARHIVA.md` (numit așa ca să nu intre în conflict cu README-ul proiectului React) spun explicit „arhivă — nu face parte din site" și unde e versiunea live.

**15. ✅ Monitorizare a dependențelor externe.** — *implementat 2026-06-10.*
Watchdog pe stratul eHarta în `overlays.js`: dacă în 15 s nu sosește niciun tile valid (sau primele ≥6 tile-uri eșuează — drum scurt, fără așteptat tot timeout-ul), spinner-ul se oprește și apare un banner dismissibil pe hartă: „Serviciul extern de hărți istorice (eHarta · geo-spatial.org) nu răspunde momentan" (tradus RO/EN, cheia `layer.historic.timeout`). Banner-ul dispare singur la primul tile reușit. Testat cu un nume de strat WMS inexistent: banner la eroare, recuperare curată la revenirea pe strat valid. Tile-urile CARTO sunt folosite cu atribuire (conform politicii lor de fair-use pentru proiecte necomerciale); la trafic semnificativ crescut, de luat în calcul un provider dedicat.

---

## 5. Pe scurt

| Aspect | Stare actuală | Verdict |
|---|---|---|
| Arhitectură | static, vanilla JS, zero dependențe de build | ✅ alegere sănătoasă pentru proiect |
| Conținut | 288 locații + tururi + aventuri + cronologie, bilingv parțial | ✅ punctul forte al proiectului |
| Cod | funcțional, comentat în RO, dar `main.js` monolitic | ⚠️ de modularizat |
| Performanță | bună pe desktop; pozele și `render()` trag în jos mobilul | ⚠️ optimizare imagini = prioritate |
| Deploy | CI automat cu validare de date | ✅ solid; de automatizat versiunea SW |
| Testare | doar validare de date | ⚠️ de adăugat smoke test |
