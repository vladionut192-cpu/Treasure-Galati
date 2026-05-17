#!/usr/bin/env python3
"""Construiește 6 granițe administrative istorice ale zonei Galațiului.

Surse:
- OSM relations (current boundaries, for unioning post-1950 entities)
- Aproximații pentru Covurlui pre-1950 (clipare a poligonului actual Galați)

Output: galati_map/historical_boundaries.geojson cu 6 features:
  1. Ținutul Covurlui     (~1500 — 1864)
  2. Județul Covurlui     (1864 — 1950)
  3. Regiunea Galați I    (1950 — 1952): Galați+Brăila+Vrancea (parțial)
  4. Regiunea Bârlad      (1952 — 1956): Galați+Vaslui+Bacău (parțial)
  5. Regiunea Galați II   (1956 — 1968): Galați+Brăila+Vrancea+Tulcea
  6. Județul Galați       (1968 — prezent)
"""
import json
from pathlib import Path
from shapely.geometry import Polygon, MultiPolygon, mapping, box
from shapely.ops import unary_union

ROOT = Path(__file__).resolve().parent.parent
OSM_DIR = Path("/tmp/judete")
OUT = ROOT / "galati_map" / "historical_boundaries.geojson"


def load_county_polygon(rel_id: int):
    """Asamblează poligonul județului dintr-un relation OSM cu outers."""
    osm = json.loads((OSM_DIR / f"{rel_id}.json").read_text())
    rel = osm["elements"][0]
    outers = [m for m in rel["members"] if m.get("role") == "outer" and m.get("geometry")]

    def way_endpoints(w):
        g = w["geometry"]
        return (g[0]["lon"], g[0]["lat"]), (g[-1]["lon"], g[-1]["lat"])

    remaining = list(outers)
    rings = []
    while remaining:
        cur = remaining.pop(0)
        ring = [(p["lon"], p["lat"]) for p in cur["geometry"]]
        while True:
            end = ring[-1]
            matched = None
            for i, w in enumerate(remaining):
                s, e = way_endpoints(w)
                if abs(s[0] - end[0]) < 1e-7 and abs(s[1] - end[1]) < 1e-7:
                    matched = (i, w, False)
                    break
                if abs(e[0] - end[0]) < 1e-7 and abs(e[1] - end[1]) < 1e-7:
                    matched = (i, w, True)
                    break
            if not matched:
                # Try matching start
                start = ring[0]
                for i, w in enumerate(remaining):
                    s, e = way_endpoints(w)
                    if abs(s[0] - start[0]) < 1e-7 and abs(s[1] - start[1]) < 1e-7:
                        g = [(p["lon"], p["lat"]) for p in w["geometry"]]
                        ring = list(reversed(g)) + ring
                        remaining.pop(i)
                        matched = True
                        break
                    if abs(e[0] - start[0]) < 1e-7 and abs(e[1] - start[1]) < 1e-7:
                        g = [(p["lon"], p["lat"]) for p in w["geometry"]]
                        ring = g + ring
                        remaining.pop(i)
                        matched = True
                        break
                if not matched:
                    break
            else:
                i, w, reverse = matched
                g = [(p["lon"], p["lat"]) for p in w["geometry"]]
                if reverse:
                    g = list(reversed(g))
                ring.extend(g[1:])
                remaining.pop(i)
        # Close
        if ring[0] != ring[-1]:
            ring.append(ring[0])
        if len(ring) >= 4:
            rings.append(ring)

    polys = [Polygon(r) for r in rings if len(r) >= 4]
    polys = [p for p in polys if p.is_valid and p.area > 1e-6]
    if len(polys) == 1:
        return polys[0]
    # Sort by area; biggest is the main outer
    polys.sort(key=lambda p: p.area, reverse=True)
    return polys[0]  # use main county polygon (skip enclaves)


def feature(geom, props):
    """Build a GeoJSON Feature."""
    if isinstance(geom, (Polygon, MultiPolygon)) and not geom.is_empty:
        return {
            "type": "Feature",
            "geometry": mapping(geom),
            "properties": props,
        }
    return None


def main():
    print("Loading county polygons...")
    galati = load_county_polygon(2260192)
    braila = load_county_polygon(2355512)
    vrancea = load_county_polygon(2260187)
    tulcea = load_county_polygon(2367044)
    vaslui = load_county_polygon(2256753)
    bacau = load_county_polygon(2248681)
    print(f"  Galați: bbox {galati.bounds}")
    print(f"  Brăila: bbox {braila.bounds}")
    print(f"  Vrancea: bbox {vrancea.bounds}")
    print(f"  Vaslui: bbox {vaslui.bounds}")
    print(f"  Bacău: bbox {bacau.bounds}")

    # Galați boundary spans roughly lat 45.39-46.16. Tecuci (45.85) was the
    # historical boundary between Covurlui (south) and Tecuci (north). For
    # pre-1950 Covurlui approximation, we clip current Galați at lat ~45.83.
    minx, miny, maxx, maxy = galati.bounds
    south_clip = box(minx - 0.1, miny - 0.1, maxx + 0.1, 45.83)
    covurlui_approx = galati.intersection(south_clip)

    # Ținutul Covurlui pre-1864 — roughly same as Județul Covurlui
    # (medieval boundaries varied; modern Galați south is the best proxy)
    tinutul = covurlui_approx

    # Regiunea Galați 1950-1952 — Galați + parts of Brăila + Vrancea (south)
    # Approximation: Galați + Brăila + Vrancea (full) — Vrancea was administered
    # from Galați for short period
    reg_galati_1 = unary_union([galati, braila, vrancea])

    # Regiunea Bârlad 1952-1956 — Galați + Vaslui + Bacău south + Vrancea north
    # Approximation: Galați + Vaslui + Bacău (south part). Bacău covered Bârlad area.
    # Using Vaslui + Galați is the safest (Bârlad is in Vaslui today).
    reg_barlad = unary_union([galati, vaslui])

    # Regiunea Galați 1956-1968 — Galați + Brăila + Tulcea + Vrancea (Tecuci+Focșani)
    # Most extensive Romanian region of the era
    reg_galati_2 = unary_union([galati, braila, vrancea, tulcea])

    # Județul Galați 1968-prezent (current OSM)
    judet_modern = galati

    features = []
    items = [
        (tinutul, {
            "name": "Ținutul Covurlui",
            "start_year": 1500,
            "end_year": 1864,
            "subtitle": "Principatul Moldovei (sec. XV — 1864)",
            "approx_note": "Aproximat din poligonul actual Galați, clipat la nord de Tecuci (lat 45.83). Granițele istorice variau pe perioade.",
        }),
        (covurlui_approx, {
            "name": "Județul Covurlui",
            "start_year": 1864,
            "end_year": 1950,
            "subtitle": "Reforma Cuza · 1864 — 1950",
            "approx_note": "Aproximat din poligonul actual Galați, clipat la nord de Tecuci (lat 45.83). Tecuciul era județ separat. Cuprindea plasele Galați, Bujor, Prutul, Covurlui.",
        }),
        (reg_galati_1, {
            "name": "Regiunea Galați (I)",
            "start_year": 1950,
            "end_year": 1952,
            "subtitle": "Reforma comunistă · 1950 — 1952",
            "approx_note": "Uniune aproximativă: Galați + Brăila + Vrancea (poligoanele actuale). Granițele exacte ale raioanelor sovietice nu sunt în OSM.",
        }),
        (reg_barlad, {
            "name": "Regiunea Bârlad",
            "start_year": 1952,
            "end_year": 1956,
            "subtitle": "1952 — 1956 (reședință Bârlad)",
            "approx_note": "Uniune aproximativă: Galați + Vaslui (include Bârlad, Huși). Regiunea includea și nordul Vrancei.",
        }),
        (reg_galati_2, {
            "name": "Regiunea Galați (II)",
            "start_year": 1956,
            "end_year": 1968,
            "subtitle": "1956 — 1968 (cea mai extinsă)",
            "approx_note": "Uniune aproximativă: Galați + Brăila + Vrancea + Tulcea — cea mai mare regiune din SE Moldovei și Dobrogea de N.",
        }),
        (judet_modern, {
            "name": "Județul Galați",
            "start_year": 1968,
            "end_year": 9999,
            "subtitle": "Reforma Ceaușescu · 1968 — prezent",
            "approx_note": "Granița reală OSM. Combină fostul Covurlui (sud) cu mare parte din fostul jud. Tecuci (nord).",
            "iso": "RO-GL",
            "nuts": "RO224",
        }),
    ]

    # Simplify all polygons (0.0008° ≈ 80 m at lat 45) to reduce file size
    # while keeping shape recognizable. Each county boundary is fine at this scale.
    SIMPLIFY_TOLERANCE = 0.0008
    items = [(g.simplify(SIMPLIFY_TOLERANCE, preserve_topology=True), p) for g, p in items]

    for geom, props in items:
        feat = feature(geom, props)
        if feat:
            features.append(feat)
            # Ensure polygon coords are wrapped properly
            geom_type = feat["geometry"]["type"]
            if geom_type == "Polygon":
                pts = sum(len(r) for r in feat["geometry"]["coordinates"])
            else:  # MultiPolygon
                pts = sum(len(r) for poly in feat["geometry"]["coordinates"] for r in poly)
            print(f"  ✓ {props['name']}: {pts} puncte, bbox {geom.bounds}")

    out = {"type": "FeatureCollection", "features": features}
    OUT.write_text(json.dumps(out, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    size_kb = OUT.stat().st_size // 1024
    print(f"\nWritten {OUT.relative_to(ROOT)} — {len(features)} features, {size_kb} KB")


if __name__ == "__main__":
    main()
