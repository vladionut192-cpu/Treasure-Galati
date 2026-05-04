#!/usr/bin/env python3
"""Build script — sincronizează `galati_map/locations.json` în array-ul
embedded `const locations = [...]` din `galati_map/index.html` și validează
datele.

Rulează din rădăcina proiectului:
    python3 scripts/build.py            # validează + sync
    python3 scripts/build.py --check    # doar validează (exit 1 dacă probleme)

`locations.json` este sursa de adevăr. `index.html` este artefact generat —
modificările directe în array-ul lui se pierd la următorul build.
"""
import argparse
import json
import re
import sys
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
LOC_JSON = ROOT / "galati_map" / "locations.json"
INDEX_HTML = ROOT / "galati_map" / "index.html"

# Constrângeri de validare — includ și județul Galați (Tirighina la sud-vest,
# Valul lui Traian la nord, plus enclavele istorice peste Dunăre — Dinogetia
# la Garvăn, com. Jijila, jud. Tulcea, parte din sistemul defensiv roman)
LAT_BOUNDS = (45.30, 45.65)
LON_BOUNDS = (27.80, 28.20)
ALLOWED_CATEGORIES = {
    "Alte locuri",
    "Case istorice",
    "Comerț istoric",
    "Consulate",
    "Educație",
    "Industrie",
    "Lăcașuri de cult",
    "Monumente",
    "Palate",
    "Spații verzi",
}
ALLOWED_STATUSES = {"active", "demolished", "ruin", "altered", "lost", "unknown"}
ALLOWED_PERIODS = {
    "ancient", "medieval", "early-modern", "port-liber",
    "belle-epoque", "interbelic", "communist", "modern",
}
REQUIRED_FIELDS = {"id", "title", "lat", "lon", "category"}


class ValidationError(Exception):
    pass


def validate(locations):
    """Returnează lista de probleme. Nu ridică excepție — caller decide."""
    issues = []

    # Duplicate IDs
    ids = [loc.get("id") for loc in locations]
    dup_ids = [i for i, n in Counter(ids).items() if n > 1]
    if dup_ids:
        issues.append(("error", f"ID-uri duplicate: {dup_ids}"))

    # ID format
    for loc in locations:
        if not re.fullmatch(r"loc-\d+", str(loc.get("id", ""))):
            issues.append(("error", f"ID invalid: {loc.get('id')!r} (format așteptat: loc-N)"))

    # Per-entry checks
    for loc in locations:
        loc_id = loc.get("id", "<no-id>")
        for f in REQUIRED_FIELDS:
            if f not in loc:
                issues.append(("error", f"{loc_id}: lipsește câmpul '{f}'"))

        cat = loc.get("category")
        if cat and cat not in ALLOWED_CATEGORIES:
            issues.append(("error", f"{loc_id}: categorie necunoscută: {cat!r}"))

        status = loc.get("status")
        if status and status not in ALLOWED_STATUSES:
            issues.append(("error", f"{loc_id}: status necunoscut: {status!r}"))

        period = loc.get("period")
        if period and period not in ALLOWED_PERIODS:
            issues.append(("error", f"{loc_id}: period necunoscut: {period!r}"))

        yb = loc.get("year_built")
        yd = loc.get("year_demolished")
        if yb is not None and yd is not None:
            try:
                if int(yb) > int(yd):
                    issues.append(("warn", f"{loc_id}: year_built ({yb}) > year_demolished ({yd})"))
            except (TypeError, ValueError):
                pass

        try:
            lat = float(loc.get("lat", 0))
            lon = float(loc.get("lon", 0))
            if not (LAT_BOUNDS[0] <= lat <= LAT_BOUNDS[1]):
                issues.append(("error", f"{loc_id}: lat în afara Galațiului: {lat}"))
            if not (LON_BOUNDS[0] <= lon <= LON_BOUNDS[1]):
                issues.append(("error", f"{loc_id}: lon în afara Galațiului: {lon}"))
        except (TypeError, ValueError):
            issues.append(("error", f"{loc_id}: lat/lon non-numerice"))

    # Title duplicates (warning, nu eroare — există cazuri legitime ca cele două „Casa Monferatto")
    title_counts = Counter(loc.get("title", "").strip().lower() for loc in locations)
    dup_titles = [(t, n) for t, n in title_counts.items() if n > 1 and t]
    for t, n in dup_titles:
        issues.append(("warn", f"Titlu duplicat ({n}x): {t!r}"))

    # Article slug duplicates (warning) — pot apărea legitim (ex. două case ale aceleiași familii)
    article_counts = Counter(
        loc.get("article", "") for loc in locations if loc.get("article")
    )
    for a, n in article_counts.items():
        if n > 1:
            issues.append(("warn", f"Articol duplicat ({n}x): {a}"))

    return issues


def sync_index_html(locations):
    html = INDEX_HTML.read_text(encoding="utf-8")
    pattern = re.compile(r"const locations = (\[.*?\]);", re.DOTALL)
    m = pattern.search(html)
    if not m:
        raise ValidationError(
            "Nu am găsit `const locations = [...];` în index.html — fișierul a fost editat?"
        )
    new_array = json.dumps(locations, ensure_ascii=False, separators=(", ", ": "))
    new_html = html[: m.start()] + f"const locations = {new_array};" + html[m.end() :]
    if new_html == html:
        return False  # no change
    INDEX_HTML.write_text(new_html, encoding="utf-8")
    return True


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--check",
        action="store_true",
        help="Validează și ieși; nu modifica fișiere.",
    )
    args = parser.parse_args()

    with open(LOC_JSON, encoding="utf-8") as f:
        locations = json.load(f)

    issues = validate(locations)
    errors = [i for i in issues if i[0] == "error"]
    warnings = [i for i in issues if i[0] == "warn"]

    print(f"📍 {len(locations)} locații în locations.json")
    if warnings:
        print(f"⚠️  {len(warnings)} avertizări:")
        for _, msg in warnings:
            print(f"    {msg}")
    if errors:
        print(f"❌ {len(errors)} erori:")
        for _, msg in errors:
            print(f"    {msg}")
        sys.exit(1)

    if args.check:
        print("✅ Validare OK")
        return

    changed = sync_index_html(locations)
    if changed:
        print(f"✏️  index.html sincronizat ({INDEX_HTML.relative_to(ROOT)})")
    else:
        print("✅ index.html era deja la zi")


if __name__ == "__main__":
    main()
