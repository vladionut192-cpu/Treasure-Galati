# Treasure Galați

Hartă interactivă cu obiective de patrimoniu, clădiri istorice și locuri din municipiul Galați. Aplicație statică (HTML + JSON + Leaflet) servită local, cu unelte pentru editarea datelor.

## Structura proiectului

```
.
├── galati_map/                  # aplicația web statică
│   ├── index.html               # harta principală (UI public)
│   ├── add_location.html        # admin: adaugă locație nouă
│   ├── editor.html              # admin: editează locațiile existente
│   ├── digitizer.html           # admin: redesenează poligoanele de cartiere
│   ├── tours_editor.html        # admin: construiește tururi tematice
│   ├── locations.json           # date principale (≈90 locații pe hartă)
│   ├── manual_overrides.json    # corecții manuale aplicate locațiilor
│   ├── unplaced_locations.json  # locații cu titlu/descriere, fără coordonate încă
│   ├── cartiere.geojson         # poligoane cartiere (Voronoi peste centroide)
│   ├── geocode_cache.json       # cache Nominatim (re-rulări instant)
│   └── tours.json               # tururi tematice
├── assets/images/               # 206 imagini referite de hartă (~65 MB)
└── custom_locations.json        # locații noi cu imagini embedded (base64)
```

## Cum rulez harta local

Aplicația e statică, dar `fetch()` din browser cere un server HTTP (nu `file://`). Din rădăcina proiectului:

```bash
python3 -m http.server 8000
```

Apoi deschide:

- **harta publică** — http://localhost:8000/galati_map/index.html
- adaugă locație — http://localhost:8000/galati_map/add_location.html
- editor locații — http://localhost:8000/galati_map/editor.html
- digitizer cartiere — http://localhost:8000/galati_map/digitizer.html
- editor tururi — http://localhost:8000/galati_map/tours_editor.html

## Date — pe scurt

- `locations.json` — sursa de adevăr pentru hartă. Fiecare locație are: `id`, `title`, `lat`, `lon`, `category`, `excerpt`, `description`, `image`, `gallery[]`, `article` (ID intern).
- `manual_overrides.json` — patch peste o locație după `article`-ID. Modifici aici dacă vrei să corectezi coordonate, descriere sau imagine fără să atingi datele originale.
- `unplaced_locations.json` — listă de locații care au text dar n-au încă coordonate confirmate. Pe măsură ce le plasezi (din `add_location.html` sau editor), migrează în `locations.json`.
- `custom_locations.json` — locații complet custom, cu imagini embedded ca base64 (autonome).

## Imagini

Toate imaginile servite în hartă sunt în `assets/images/`. Repository-ul conține doar imaginile efectiv referite din `locations.json`, `manual_overrides.json` și `index.html`. Pentru a adăuga o locație nouă cu imagine externă: copiază fișierul în `assets/images/` și folosește calea relativă `../assets/images/<nume>.jpg` în câmpul `image` sau `gallery`.
