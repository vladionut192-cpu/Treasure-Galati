#!/usr/bin/env python3
"""Aplică descrieri rescrise peste locations.json, în siguranță.

Intrarea e un JSON de forma:
    { "loc-8": { "description": "…" }, "loc-12": { "description_en": "…" } }

De ce un script și nu editare directă: `locations.json` are 2,5 MB și e sursa de
adevăr. Scrierile directe cu `json.dump` peste fișier îl trunchiază dacă procesul
moare la mijloc (vezi auditul, §6.2). Aici scriem într-un `.tmp` și abia apoi
facem `replace()`, care e atomic pe același filesystem.

Verificări înainte de scriere:
  • fiecare id există;
  • câmpul e unul permis (description / description_en);
  • textul nu e gol și nu a scăzut sub 40% din lungimea veche fără --allow-shrink
    (o rescriere care taie jumătate din conținut e aproape sigur o greșeală).

Rulează:
    python3 scripts/apply_content.py patch.json
    python3 scripts/apply_content.py patch.json --dry-run
    python3 scripts/apply_content.py patch.json --allow-shrink
"""
from __future__ import annotations
import argparse
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
LOCATIONS = ROOT / "galati_map" / "locations.json"
ALLOWED = {"description", "description_en"}
SHRINK_FLOOR = 0.40


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("patch", type=Path)
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--allow-shrink", action="store_true")
    args = ap.parse_args()

    patch = json.loads(args.patch.read_text(encoding="utf-8"))
    locs = json.loads(LOCATIONS.read_text(encoding="utf-8"))
    by_id = {l["id"]: l for l in locs}

    errors: list[str] = []
    planned: list[tuple[str, str, int, int]] = []

    for lid, fields in patch.items():
        loc = by_id.get(lid)
        if loc is None:
            errors.append(f"{lid}: nu există în locations.json")
            continue
        for field, value in fields.items():
            if field not in ALLOWED:
                errors.append(f"{lid}: câmp nepermis „{field}”")
                continue
            if not isinstance(value, str) or not value.strip():
                errors.append(f"{lid}.{field}: text gol")
                continue
            old = len(loc.get(field) or "")
            new = len(value)
            if old and new < old * SHRINK_FLOOR and not args.allow_shrink:
                errors.append(
                    f"{lid}.{field}: {old} → {new} car. "
                    f"(−{100 - 100 * new // old}%); folosește --allow-shrink dacă e intenționat")
                continue
            planned.append((lid, field, old, new))

    if errors:
        print("✗ Refuz să scriu:", file=sys.stderr)
        for e in errors:
            print(f"   • {e}", file=sys.stderr)
        return 1

    for lid, field, old, new in planned:
        delta = f"{old} → {new}"
        print(f"  {lid}.{field}: {delta}")
    print(f"\n{len(planned)} câmp(uri) de actualizat în {len({p[0] for p in planned})} fișe.")

    if args.dry_run:
        print("(dry-run — nimic scris)")
        return 0

    for lid, fields in patch.items():
        for field, value in fields.items():
            if field in ALLOWED:
                by_id[lid][field] = value

    tmp = LOCATIONS.with_suffix(".json.tmp")
    tmp.write_text(json.dumps(locs, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    tmp.replace(LOCATIONS)
    print(f"✓ Scris atomic în {LOCATIONS.relative_to(ROOT)}")
    print("  Rulează acum: python3 scripts/validate_data.py && python3 scripts/lint_content.py")
    return 0


if __name__ == "__main__":
    sys.exit(main())
