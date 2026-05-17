# Scripts archive

One-off scripts run during initial data bootstrapping (March-May 2026).
Data they produced is already in `galati_map/locations.json`,
`galati_map/tours.json`, etc. — running them again would create duplicates.

Kept for historical reference + audit trail of data provenance.

## Files

- `add_county_locations.py` — 15 obiective județ Galați (mănăstiri, situri, conace)
- `add_lost_buildings.py` — 16 clădiri dispărute (Sinagoga Mare, Hotel Imperial, Helder, etc.)
- `add_archaeological_sites.py` — 11 situri LMI grupa B (Foltești, Cosițeni, Barcea, etc.)
- `add_tours_i18n.py` — traduceri EN/FR pentru cele 13 tururi
- `build_piata_regala_geojson.py` — pilotul AR Piața Regală
- `build_historical_boundaries.py` — 6 contururi județ pe timeline (Covurlui → Galați)

## Active scripts (in `scripts/`)

- `serve.py` — dev server cu API endpoints pentru add/edit
- `make_deploy_archive.py` — build pachet pentru cPanel
- `generate_static_pages.py` — generează HTML SEO + sitemap
- `validate_data.py` — validare JSON pre-commit
- `add_photo.py` — adaugă o fotografie în galati-altadata.json
- `apply_images.py` — bulk update image fields
- `build_tour_routes.py` — recalculează polilinii pentru tururi
- `build_tours.py` — extrage tururi din content
- `make_og_image.py` — generează og-default.jpg
- `find_unused_images.py` — detectare assets neutilizate
- `find_images.py` — căutare imagini după query
- `parse_chronology.py` — parsare evenimente istorice
- `enrich_metadata.py` — îmbogățire metadata
- `review_images.py` — UI review imagini
- `clean_unplaced.py` — cleanup
