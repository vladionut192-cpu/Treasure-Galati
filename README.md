# Treasure Galați

Hartă interactivă cu obiective de patrimoniu, clădiri istorice și locuri din municipiul Galați. Aplicație 100% statică (HTML + JSON + Leaflet) — fără backend, fără bază de date.

**139 locații** documentate pe hartă · pin-uri pe categorii (Case istorice, Palate, Lăcașuri de cult, Monumente, Industrie, Comerț istoric, Educație, Spații verzi, Consulate, Alte locuri) · 1 tur tematic (Pub Crawl Cultural, 26 opriri) · timeline 1500–2026 cu populația interpolată · overlay-uri istorice (Plan Director Tragere 1916, hărți austriece 1900, sovietice 1950, Charta telegrafo-poștală 1865) · poligon Valul lui Traian (22,4 km) și Cetatea Dinogeția.

## Structura proiectului

```
.
├── galati_map/                  # aplicația web statică
│   ├── index.html               # SPA cu 4 pagini (Hartă, Despre, Știați că?, Contribuie)
│   ├── add_location.html        # admin: adaugă locație nouă (export JSON)
│   ├── editor.html              # admin: editează locațiile existente
│   ├── digitizer.html           # admin: redesenează poligoanele de cartiere
│   ├── tours_editor.html        # admin: construiește tururi tematice
│   ├── locations.json           # SURSĂ DE ADEVĂR — 139 locații cu metadate
│   ├── manual_overrides.json    # patch-uri peste locații (descrieri/coords corectate)
│   ├── unplaced_locations.json  # 27 entități fără pin geografic, clasificate (place/person/family/topic/event/photo)
│   ├── cartiere.geojson         # 38 poligoane cartiere (Voronoi peste centroide)
│   ├── valuri.geojson           # Valul lui Traian (LineString) + Dinogeția (Polygon)
│   ├── geocode_cache.json       # cache Nominatim
│   └── tours.json               # tururi tematice (Pub Crawl Cultural)
├── scripts/                     # unelte de mentenanță
│   ├── build.py                 # validează + sincronizează locations.json → index.html
│   ├── enrich_metadata.py       # extrage year_built/period/status din descrieri
│   ├── clean_unplaced.py        # elimină duplicate; clasifică pe `kind`
│   ├── build_tours.py           # regenerează tours.json din Surse/cheatsheet.txt
│   ├── add_photo.py             # CLI pentru adăugare poze locale
│   ├── find_images.py           # caută candidate pe Wikimedia Commons
│   ├── review_images.py         # generează HTML pentru review vizual
│   └── apply_images.py          # descarcă selecțiile + sync locations.json
├── assets/images/               # ~250 imagini locale (~70 MB)
│   ├── commons/                 # poze din Wikimedia (cu commons_credit per pin)
│   └── local/                   # poze proprii adăugate via add_photo.py
└── Surse/                       # cercetare (PDF-uri ignorate de git, .txt extras)
    ├── *.txt                    # OCR extras din PDF-uri (folosit pentru grep)
    ├── cheatsheet.txt           # ghid pub-crawl cultural compilat manual
    └── extract_pdfs.py          # script extragere OCR (pypdf)
```

## Cum rulez harta local

Aplicație 100% statică, dar `fetch()` cere un server HTTP. Din rădăcina proiectului:

```bash
python3 -m http.server 8000
```

Apoi:

- **harta** — http://localhost:8000/galati_map/index.html
- **#about** — Despre proiect
- **#trivia** — Știați că? (18 carduri de curiozități)
- **#contribute** — cum poți contribui
- adaugă locație — http://localhost:8000/galati_map/add_location.html
- editor locații — http://localhost:8000/galati_map/editor.html
- digitizer cartiere — http://localhost:8000/galati_map/digitizer.html
- editor tururi — http://localhost:8000/galati_map/tours_editor.html
- **editor poziții fototecă** — http://localhost:8000/galati_map/pubcrawl_editor.html (drag-and-drop pentru cele 299 buline portocalii)

## Feature-uri pe hartă

- **Filtre rapide (chips):** Toate / Active / Dispărute / Port liber / Belle Époque / Interbelic / Comunist
- **Timeline 1500–2026:** trage de slider, pinurile apar/dispar conform `year_built`/`year_demolished`. Lângă an apare și **populația interpolată** (19 puncte de referință: catagrafii 1683–1899, recensăminte 1948–2021).
- **Overlay-uri istorice:** 6 hărți georeferențiate de la [eHarta · geo-spatial.org](https://geo-spatial.org) — Plan Director Tragere 1:20k (1916–1959), hărți austriece 1:200k (~1900), Charta telegrafo-poștală 1865, hărți sovietice 1:100k și 1:200k (~1950).
- **Polilină Valul lui Traian + poligon Dinogeția:** toggle în sidebar afișează 22,4 km de val antic + incinta cetății Dinogeția (62 puncte din OpenStreetMap).
- **Cartiere:** toggle pentru 38 poligoane Voronoi cu denumirile cartierelor.
- **Tururi tematice:** Pub Crawl Cultural cu 26 opriri pe 5 etape (Țiglina → Faleză → Piața Regală → comunități etnice → Bătălia 1918).

## Date — schemă locație

```json
{
  "id": "loc-99",
  "title": "Casa Cuza Vodă (Muzeul Casa Cuza)",
  "location": "str. Alexandru Ioan Cuza nr. 80",
  "lat": 45.4412876, "lon": 28.0577872,
  "category": "Case istorice",
  "excerpt": "Scurt rezumat …",
  "description": "Text complet …",
  "image": "../assets/images/commons/commons_loc-99_….jpg",
  "gallery": [],
  "article": "../assets/articles/casa-cuza-strada-al-i-cuza-nr-80/index.html",
  "year_built": 1862,
  "year_demolished": null,
  "status": "active",       // active | demolished | ruin | altered | lost
  "period": "port-liber",   // ancient | medieval | early-modern | port-liber | belle-epoque | interbelic | communist | modern
  "architect": null,
  "owner": null,
  "style": null,
  "commons_credit": { "license": "CC BY-SA 3.0 ro", "uploader": "The1", "source_url": "..." }
}
```

`unplaced_locations.json` are aceeași structură + un câmp `kind: "place" | "person" | "family" | "topic" | "event" | "photo"` pentru clasificarea entităților fără coordonate.

## Workflow de editare

`locations.json` este sursa de adevăr; array-ul inline din `index.html` este artefact generat. **Nu edita manual array-ul** — modificările se pierd la următorul build.

```bash
# editează locations.json (manual sau via galati_map/editor.html → exportă)
# apoi:
python3 scripts/build.py            # validează + sincronizează index.html
python3 scripts/build.py --check    # doar validează (potrivit pentru pre-commit)
```

`build.py` verifică:
- ID-uri unice și formatul `loc-N`
- Câmpurile obligatorii (`id`, `title`, `lat`, `lon`, `category`)
- Categoria în lista permisă (10 categorii)
- `status` în {active, demolished, ruin, altered, lost, unknown}
- `period` în {ancient, medieval, early-modern, port-liber, belle-epoque, interbelic, communist, modern}
- Coordonatele în județul Galați (45.30-45.65 lat, 27.80-28.20 lon)
- Coerență `year_built` ≤ `year_demolished` (warning)
- Duplicate de titlu sau slug articol (warning)

Pentru auto-extragere metadate, tururi și curățare unplaced:

```bash
python3 scripts/enrich_metadata.py  # auto-detect year_built/period din descrieri
python3 scripts/build_tours.py      # regenerează tours.json din cheatsheet
python3 scripts/clean_unplaced.py   # curăță unplaced_locations.json
```

## Adăugare imagini locale (foto proprii)

```bash
# 1 imagine — devine primară (dacă pinul nu are deja una)
python3 scripts/add_photo.py loc-99 ~/Desktop/cuza.jpg

# mai multe — prima primară, restul în gallery[]
python3 scripts/add_photo.py loc-99 a.jpg b.jpg c.jpg

# explicit doar în galerie (păstrează primara existentă)
python3 scripts/add_photo.py --gallery loc-99 detail.jpg

# înlocuiește forțat imaginea primară
python3 scripts/add_photo.py --replace loc-99 better.jpg

# cu credit (autor + sursă)
python3 scripts/add_photo.py loc-99 photo.jpg \
    --credit "foto: Vlad Ionescu, 2026" \
    --source "https://example.com/photo"
```

Imaginile sunt redimensionate la max 1280px (cu `sips` pe macOS), salvate în `assets/images/local/`, atașate în `image` sau `gallery[]`, iar `index.html` sincronizat automat.

## Imagini din Wikimedia Commons (workflow în 3 pași)

Pentru pinurile fără imagine, un pipeline care caută candidate pe Commons și le lasă să le selectezi vizual:

```bash
python3 scripts/find_images.py     # → scripts/image_candidates.json (top 5 per pin)
python3 scripts/review_images.py   # → scripts/image_review.html — click vizual
# (în browser: descarcă image_decisions.json când ești gata)
python3 scripts/apply_images.py    # descarcă imagini la 1280px + actualizează locations.json
```

Sursele: [Historical monuments in Galați](https://commons.wikimedia.org/wiki/Category:Historical_monuments_in_Galați), Buildings, Postcards, History — toate cu licențe libere (CC-BY, CC-BY-SA, public domain). Atribuirea se păstrează în `commons_credit` per pin.

## Surse documentare

Cercetarea pinurilor s-a bazat pe:

- **Dumitru, Sandel** — *Galațiul, așa cum mi-l amintesc* (vol. V–X, ~25.000 pagini scanate)
- **Cilinca, Victor** — *Abecedar istoric gălățean*
- Revista *Dunărea de Jos* nr. 214 / decembrie 2019
- *„Royal Square and Corso of Galați”* (articol academic)
- [galati.wiki](https://www.galati.wiki/) — articole stub-uri
- [OpenStreetMap](https://www.openstreetmap.org) — geometrii Valul lui Traian, Dinogeția, Castrul Tirighina
- [Wikimedia Commons](https://commons.wikimedia.org/wiki/Category:Galați) — fototecă publică

PDF-urile sunt ignorate de git (108MB), dar extracțiile OCR `.txt` (~11MB) sunt commit-ate pentru `grep`. Pentru regenerare:

```bash
cd Surse && python3 -m venv venv && source venv/bin/activate
pip install pypdf
python3 extract_pdfs.py
```

## Licență

Codul: MIT.
Datele: variabile per intrare — `commons_credit` și `local_credits` per locație păstrează atribuirea originală.
