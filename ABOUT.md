# Heritage Galați — What It Is, How It Works

An interactive heritage map of Galați, Romania — a Danube port city with 581 years
of recorded history. The app turns dry inventory data (226 documented sites,
13 thematic tours, 4 treasure-hunt adventures) into something a curious visitor,
a local on a weekend walk, or a school class can actually use on a phone.

It is a **static web app**: no backend, no database, no login. Everything lives
in JSON files served from cPanel shared hosting at
[heritage-galati.ro](https://heritage-galati.ro).

---

## What the user sees

### 1. The Map (`index.html`)

The main page is a Leaflet map centered on the Mihai Eminescu statue (downtown).
A left sidebar holds the navigation; the map fills the rest of the viewport.

**Sidebar — three tabs**, rendered as a prominent pill-segmented control with
live counts:

| Tab | What it is |
|-----|------------|
| 📍 **Locații** (226) | All documented sites — churches, palaces, lost buildings, monuments, industrial heritage, archaeological sites. Each opens a detail panel with story, photos, year built / demolished, address, and links to Wikipedia / Wikimedia. |
| 🚶 **Tururi** (13) | Themed walking routes — "On the Trails of the Princes", "Belle Époque", "Communist-Era Architecture", "Jewish Galați", etc. Each tour has an ordered list of stops, drawn as a polyline on the map. |
| 🗝️ **Aventuri** (4) | Treasure hunts — single-player narrative games with checkpoints. The player walks to a real location, the GPS detects arrival, the next clue unlocks. Progress is stored in `localStorage`. |

**Top-strip — the Chronology timeline** spans the full width above the map.
A range slider goes from **1445** (the city's first written mention, in a charter
of Stephen II of Moldavia) to **2026**. As the user drags, pins appear and
disappear: a building built in 1838 only shows when the slider is at 1838 or
later; a church demolished in 1962 disappears for years after 1962. Eras are
colour-banded along the track (Medieval / Ottoman vassalage / Free Port / WWI /
Interbellum / WWII / Communism / Modern), and 22 major events are marked as
clickable dots with tooltips.

**Search & filters** in the sidebar:

- Fuzzy text search (Fuse.js) across title, address, excerpt, description —
  forgiving of typos and Romanian diacritics.
- Category dropdown (Lăcașuri de cult, Case istorice, Palate, Industrie, etc.)
- Status chips: All / Still standing / Lost (demolished).

**Map overlay toggles** (pill-styled cards):

- **Cartiere** — 38 neighborhood polygons, Voronoi-tessellated.
- **Hartă istorică suprapusă** — historical maps from `geo-spatial.org` (WMS):
  Interbellum 1916–1959, Austrian ~1900, Romanian charta 1865, Soviet ~1950.
  Opacity slider. Shows a spinner while tiles load (the WMS is slow).
- **Fortificații antice** — Traianic limes (22 km line) + Dinogetia fortress.

**Help system** — a `?` button toggles persistent tooltips that label every
non-obvious UI element on hover.

### 2. Other top-bar pages

- **Povești** — long-form historical essays embedded in the SPA.
- **Liste** (`lists.html`) — sortable tables for users who prefer browsing by
  data rather than by map.
- **Despre** — credits, sources, methodology.
- **Știați că?** — trivia carousel.
- **Contribuie** — how to submit a correction or new site.

### 3. Standalone immersive pages

- `batalia-galati-1918.html` — illustrated narrative of the 1918 Battle of Galați
  (3,000 Romanian soldiers held off 12,000 German-Bulgarian troops).
- `piata-regala-ar.html` — augmented-reality reconstruction of Royal Square,
  destroyed in the 1944 German retreat and never rebuilt.

---

## How it works under the hood

### Stack

- **No framework.** Vanilla JavaScript (ES modules in one big file:
  `galati_map/js/main.js`, ~195 KB).
- **Leaflet 1.9** for the map, with `leaflet.markercluster` for pin clustering.
- **Fuse.js 7** for fuzzy search.
- **CARTO basemaps** (Positron / Voyager) — free tile provider, no API key.
- **Static deployment** to cPanel. No server-side code. Hosting cost ~€2/month.

### Data model

Everything is JSON files in `galati_map/`:

| File | Purpose |
|------|---------|
| `locations.json` | The 226 documented sites — source of truth. Each entry: `id`, `title`, `lat`, `lon`, `category`, `excerpt`, `description`, `year_built`, `year_demolished`, `status`, `image`, optional `gallery`, `article` (rich HTML body), Wikipedia / Wikimedia credits. |
| `tours.json` | The 13 themed walking tours. Each has `id`, `title`, `subtitle`, `description`, ordered `stops[]` (each stop references a location by `article` path), and i18n EN/FR translations. |
| `treasure_hunts.json` | The 4 single-player adventures: `story`, `checkpoints[]` with GPS coords + clue text + reveal text. |
| `cronologie.json` | 581 years of historical events for the timeline. |
| `cartiere.geojson` | 38 neighborhood polygons (Voronoi over location centroids). |
| `valuri.geojson` | Traianic limes (LineString) + Dinogetia fortress (Polygon). |
| `historical_boundaries.geojson` | 6 county-boundary contours over the timeline (Covurlui → Galați). |
| `galati-altadata.json` | Photo archive with EXIF/source metadata. |
| `tours_routes.json` | Pre-computed walking polylines for tours (so the map doesn't hit a routing API at runtime). |

### Page lifecycle

1. **HTML** (`index.html`, ~1,000 lines) preloads Inter font, Leaflet CSS, and the
   `locations.json` fetch.
2. **CSS** (`styles/main.css`, ~105 KB) is a single hand-written file.
3. **JS** (`js/main.js`) boots after `DOMContentLoaded`:
   - `fetch()` the 3 main JSONs in parallel.
   - Initialize Leaflet, set view to Eminescu statue (zoom 16).
   - Build the Fuse search index, the category dropdown, the timeline.
   - Render pins (clustered above zoom ~14, individual below).
   - Bind URL deep links: `?loc=loc-113`, `?tour=tour-evreiesc`, `?hunt=visteria`.
4. **Service worker** (`sw.js`) caches the shell + tiles + images with versioned
   cache buckets (`tg-v54-static`, `-tiles`, `-images`, `-data`). On version bump,
   old caches are evicted. Strategies:
   - Static (HTML, vendor, fonts): cache-first → network fallback.
   - JSON data: stale-while-revalidate.
   - Tiles & images: cache-first with long TTL.

### SEO & social previews

Facebook, WhatsApp, and Twitter crawlers do **not** execute JavaScript.
A deep link like `?loc=loc-113` would show no preview.

Fix: at build time, `scripts/generate_static_pages.py` writes one tiny HTML
file per location / tour / hunt under `galati_map/loc/`, `tour/`, `hunt/`.
Each contains:

- `<title>`, `<meta description>`, canonical URL.
- Full Open Graph + Twitter Card meta tags (title, description, hero image).
- JSON-LD structured data (`Place` / `TouristTrip` / `Event` schemas).
- A 50 ms JavaScript redirect to the SPA — **except** for known bot user agents
  (`facebookexternalhit`, `twitterbot`, `whatsapp`, etc.), which see the static
  page as-is.

`sitemap.xml` is regenerated with all 243+ URLs.

### Editing flow (admin only, local dev)

When `localhost` or `127.0.0.1` is detected, `<html>` gets a `local-dev` class
and admin floating-action-buttons appear:

- **Add pin** — click on the map, fill a modal, the new location is sent to
  the dev server (`scripts/serve.py`), which patches `locations.json`.
- **Edit pin** — pencil icon inside each popup.
- **Add photo** — uploads to `assets/images/local/`, updates `image` and
  optionally `gallery[]`.

Admin UI is completely invisible on the public deployment (no `local-dev` class).

---

## How a release is built

A single command:

```bash
python3 scripts/make_deploy_archive.py
```

does, in order:

1. **Validate** every JSON file (parse, check for duplicate IDs, orphan article
   paths, broken location references in tours/hunts). Aborts on hard errors.
2. **Regenerate** the 243+ static SEO pages and `sitemap.xml`.
3. **Auto-bump** the service-worker cache version (`tg-vN` → `tg-vN+1`) so
   returning users get the new build instead of stale cache.
4. **Zip** `galati_map/` (minus admin tools, geocode cache, manual overrides)
   plus `assets/` into `deploy/heritage-galati-deploy.zip` (~220 MB, ~1,100
   files).

That zip is uploaded to cPanel and extracted at the document root. No build
step, no Node.js, no transpilation.

---

## Project layout

```
.
├── galati_map/                    # the deployed app
│   ├── index.html                 # SPA shell (~1,000 lines after CSS/JS extract)
│   ├── styles/main.css            # single stylesheet (~105 KB)
│   ├── js/main.js                 # single JS file (~195 KB)
│   ├── sw.js                      # service worker (cache versioning)
│   ├── locations.json             # 226 sites — source of truth
│   ├── tours.json                 # 13 themed walks
│   ├── treasure_hunts.json        # 4 GPS adventures
│   ├── cronologie.json            # timeline events
│   ├── cartiere.geojson           # 38 neighborhood polygons
│   ├── valuri.geojson             # Traianic limes + Dinogetia
│   ├── historical_boundaries.geojson  # 6 county boundaries through time
│   ├── tours_routes.json          # pre-computed walking polylines
│   ├── galati-altadata.json       # photo archive with metadata
│   ├── loc/  tour/  hunt/         # generated static SEO pages
│   ├── sitemap.xml                # auto-generated
│   ├── batalia-galati-1918.html   # standalone narrative page
│   ├── piata-regala-ar.html       # AR reconstruction
│   ├── lists.html                 # data tables (sortable)
│   ├── vendor/                    # Leaflet, Fuse.js, Inter font (self-hosted)
│   └── _admin/                    # local-only admin editors (not deployed)
│
├── assets/
│   ├── images/                    # ~700 photos (~150 MB)
│   │   ├── commons/               # Wikimedia, with attribution
│   │   └── local/                 # user-contributed
│   ├── logo-sigiliu.svg           # the seal-style logo (SVG mask)
│   └── og-default.jpg             # fallback social preview
│
├── scripts/                       # active maintenance tools
│   ├── make_deploy_archive.py     # validate → SEO → SW bump → zip
│   ├── generate_static_pages.py   # SEO HTML + sitemap
│   ├── validate_data.py           # pre-commit JSON sanity
│   ├── serve.py                   # dev server + edit endpoints
│   ├── build_tour_routes.py       # recompute walking polylines
│   ├── build_tours.py             # rebuild tours.json from research
│   ├── add_photo.py               # CLI: ingest a photo
│   ├── apply_images.py            # bulk-update image fields
│   ├── find_images.py             # search Wikimedia for candidates
│   ├── review_images.py           # visual review UI
│   ├── parse_chronology.py        # build timeline JSON from notes
│   ├── enrich_metadata.py         # extract year_built/status from prose
│   ├── make_og_image.py           # render og-default.jpg
│   ├── find_unused_images.py      # detect orphan assets
│   └── archive/                   # one-off bootstrap scripts (kept for audit)
│
├── Surse/                         # research source material (PDFs, notes)
└── deploy/heritage-galati-deploy.zip   # the build artifact
```

---

## Design choices worth knowing

- **Single-file CSS and single-file JS.** No bundler. Edits are immediate, the
  service worker handles cache invalidation. Trade-off accepted: a 195 KB
  JS file is fine for a city-scale heritage app.
- **No framework.** React / Vue / Svelte would bring 100+ KB before any feature.
  Vanilla works because the data is small (226 pins) and the interactions are
  shallow (open detail, filter, drag timeline).
- **Romanian quotes everywhere.** The content uses `„` (U+201E) and `”`
  (U+201D), not ASCII `"`. Editing source code that contains Romanian text
  inside Python strings has bitten the project enough times that there is
  now a pre-commit JSON validator (`scripts/validate_data.py`).
- **The map *always* opens at the Eminescu statue, zoom 16.** A `fitBounds`
  call would frame all 226 pins and dump the user into a county-wide view
  with no sense of place. A `__renderHasRunOnce` guard prevents this on
  initial load.
- **Static maps over dynamic routing.** Walking routes between tour stops are
  pre-computed once and stored in `tours_routes.json`. Saves a Mapbox /
  GraphHopper API key, saves a runtime dependency, and the routes don't
  change.
- **No analytics, no cookies, no tracking.** The site loads with zero
  third-party JS beyond the CARTO basemap tiles and (optionally) the
  geo-spatial.org WMS overlay.

---

## At a glance

| | |
|---|---|
| Documented sites | 226 |
| Themed walking tours | 13 |
| Treasure-hunt adventures | 4 |
| Historical events on the timeline | 22 |
| Years of history covered | 581 (1445 → 2026) |
| Neighborhood polygons | 38 |
| Historical map overlays | 6 |
| Static SEO pages generated per build | 243 |
| Total deploy archive | ~220 MB |
| Backend services | 0 |
| Monthly hosting cost | ~€2 |
