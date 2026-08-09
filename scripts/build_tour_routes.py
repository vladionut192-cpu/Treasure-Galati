#!/usr/bin/env python3
"""Pre-calculează rute pe străzi pentru tururile tematice.

Folosește serverul public OSRM (router.project-osrm.org) pentru a obține
rutele de mers pe jos între opririle consecutive ale fiecărui tur. Rezultatul
e salvat în `galati_map/tours_routes.json` ca:

    {
      "tour-id-1": [[[lat, lon], ...], [[lat, lon], ...], ...],  # 1 polilinie per leg
      "tour-id-2": [[...], [...]],
      ...
    }

Frontend-ul îl încarcă opțional și înlocuiește liniile drepte cu rutele reale.

Rulare:
    python3 scripts/build_tour_routes.py            # construiește/actualizează cache-ul
    python3 scripts/build_tour_routes.py --force    # reconstruiește totul (ignoră cache)

Notă: OSRM Demo e free dar are rate limit moderat. Scriptul așteaptă 200 ms
între request-uri pentru curtoazie. La 100 de leg-uri totale, durează ~20 sec.
"""
import argparse
import json
import subprocess
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
LOC_JSON = ROOT / "galati_map" / "locations.json"
TOURS_JSON = ROOT / "galati_map" / "tours.json"
ROUTES_JSON = ROOT / "galati_map" / "tours_routes.json"

# OSRM public demo — endpoint mers pe jos
OSRM_URL = "https://router.project-osrm.org/route/v1/foot/{lon1},{lat1};{lon2},{lat2}?geometries=geojson&overview=full"
DELAY_S = 0.20  # politețe față de demo public


def fetch_route(lat1, lon1, lat2, lon2, timeout=10):
    """Returnează lista de [lat, lon] sau None la eșec.

    Folosește curl ca să evităm probleme de cert pe macOS Python.
    """
    url = OSRM_URL.format(lat1=lat1, lon1=lon1, lat2=lat2, lon2=lon2)
    try:
        r = subprocess.run(
            ["curl", "-sSL", "--max-time", str(timeout),
             "-A", "Treasure-Galati/1.0", url],
            check=True, capture_output=True, text=True,
        )
        data = json.loads(r.stdout)
    except (subprocess.CalledProcessError, json.JSONDecodeError) as e:
        print(f"  ⚠️  OSRM error ({e}); folosesc linie dreaptă")
        return None
    if data.get("code") != "Ok" or not data.get("routes"):
        print(f"  ⚠️  OSRM no route ({data.get('code')}); folosesc linie dreaptă")
        return None
    coords = data["routes"][0]["geometry"]["coordinates"]  # GeoJSON: [lon, lat]
    return [[lat, lon] for lon, lat in coords]


def leg_key(lat1, lon1, lat2, lon2):
    """Cheie stabilă (rotunjită) pentru cache pe leg."""
    return f"{round(lat1,5)},{round(lon1,5)}->{round(lat2,5)},{round(lon2,5)}"


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--force", action="store_true", help="Recalculează tot (ignoră cache).")
    args = parser.parse_args()

    if not TOURS_JSON.exists():
        print(f"❌ {TOURS_JSON.relative_to(ROOT)} nu există.")
        sys.exit(1)

    locs = json.loads(LOC_JSON.read_text(encoding="utf-8"))
    tours = json.loads(TOURS_JSON.read_text(encoding="utf-8")).get("tours", [])
    # Opririle se leagă prin `loc_id` (migrare august 2026; înainte se folosea
    # `article`, o cale de fișier care rupea tăcut opriri de tur).
    locs_by_id = {l["id"]: l for l in locs if l.get("id")}

    cache = {}
    leg_cache = {}  # cache leg-by-leg ca să reluăm dacă scriptul a fost întrerupt
    if ROUTES_JSON.exists() and not args.force:
        try:
            existing = json.loads(ROUTES_JSON.read_text(encoding="utf-8"))
            cache = existing.get("tours", {}) or {}
            leg_cache = existing.get("_leg_cache", {}) or {}
        except (json.JSONDecodeError, OSError):
            pass

    new_cache = {}
    total_legs = 0
    fetched_legs = 0
    for t in tours:
        tid = t["id"]
        stops = []
        for s in t.get("stops", []):
            loc = locs_by_id.get(s.get("loc_id"))
            if loc:
                stops.append((float(loc["lat"]), float(loc["lon"])))
        if len(stops) < 2:
            new_cache[tid] = []
            continue

        legs = []
        for i in range(len(stops) - 1):
            lat1, lon1 = stops[i]
            lat2, lon2 = stops[i + 1]
            key = leg_key(lat1, lon1, lat2, lon2)
            total_legs += 1
            if key in leg_cache and not args.force:
                legs.append(leg_cache[key])
                continue
            print(f"  → {tid} leg {i+1}/{len(stops)-1}: {lat1:.4f},{lon1:.4f} → {lat2:.4f},{lon2:.4f}")
            route = fetch_route(lat1, lon1, lat2, lon2)
            if route is None:
                route = [[lat1, lon1], [lat2, lon2]]  # fallback line
            legs.append(route)
            leg_cache[key] = route
            fetched_legs += 1
            time.sleep(DELAY_S)

        new_cache[tid] = legs
        print(f"✅ {tid}: {len(legs)} leg-uri")

    output = {
        "_generator": "scripts/build_tour_routes.py (OSRM foot)",
        "_leg_cache": leg_cache,
        "tours": new_cache,
    }
    ROUTES_JSON.write_text(json.dumps(output, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"\n💾 Salvat în {ROUTES_JSON.relative_to(ROOT)}")
    print(f"   {total_legs} leg-uri totale, {fetched_legs} fetched (rest din cache).")


if __name__ == "__main__":
    main()
