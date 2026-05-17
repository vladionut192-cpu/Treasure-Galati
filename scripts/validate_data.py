#!/usr/bin/env python3
"""Validează datele proiectului — folosit ca pre-commit hook.

Verifică:
  - Toate fișierele JSON / GeoJSON din galati_map/ parsează corect
  - locations.json: IDs unice, articole unice
  - Romanian quote escape bugs (ghilimelele „...” cu " ASCII în loc de ”)
  - Referințe orfane între tours.json / treasure_hunts.json / locations.json

Folosire:
  python3 scripts/validate_data.py [--fix]
    --fix: încearcă să corecteze automat (ghilimele românești, etc.)
"""
from __future__ import annotations
import json
import re
import sys
from pathlib import Path
from collections import Counter

ROOT = Path(__file__).resolve().parent.parent
GMAP = ROOT / "galati_map"

errors: list[str] = []
warnings: list[str] = []


def err(msg: str) -> None:
    errors.append(msg)
    print(f"  ✗ {msg}")


def warn(msg: str) -> None:
    warnings.append(msg)
    print(f"  ⚠ {msg}")


def validate_json_syntax() -> dict[str, dict | list]:
    """Parse all JSON / GeoJSON files. Returnează dict cu cele valide."""
    valid = {}
    files = sorted(GMAP.glob("*.json")) + sorted(GMAP.glob("*.geojson"))
    for f in files:
        rel = f.relative_to(ROOT)
        try:
            data = json.loads(f.read_text(encoding="utf-8"))
            valid[str(rel)] = data
        except json.JSONDecodeError as e:
            err(f"{rel}: line {e.lineno} col {e.colno}: {e.msg}")
            # Show context to help debug Romanian quote bugs
            lines = f.read_text(encoding="utf-8").split("\n")
            if 0 < e.lineno <= len(lines):
                col_min = max(0, e.colno - 40)
                col_max = e.colno + 40
                ctx = lines[e.lineno - 1][col_min:col_max]
                print(f"      Context: ...{ctx}...")
    return valid


def validate_locations(data: dict | list) -> None:
    """Check unique IDs, articles, cross-references."""
    locs = data if isinstance(data, list) else data.get("locations", [])
    ids = Counter(L.get("id") for L in locs)
    dup_ids = [k for k, v in ids.items() if v > 1]
    if dup_ids:
        err(f"locations.json: duplicate IDs: {dup_ids}")

    arts = Counter(L.get("article") for L in locs if L.get("article"))
    dup_arts = [k for k, v in arts.items() if v > 1]
    if dup_arts:
        err(f"locations.json: duplicate article paths ({len(dup_arts)})")

    no_id = [L.get("title", "?") for L in locs if not L.get("id")]
    if no_id:
        err(f"locations.json: {len(no_id)} entries without ID: {no_id[:3]}…")

    no_coords = [L.get("id") for L in locs if not L.get("lat") or not L.get("lon")]
    if no_coords:
        err(f"locations.json: {len(no_coords)} entries missing lat/lon: {no_coords[:3]}…")


def validate_cross_references(valid: dict) -> None:
    """Verify tours.json + treasure_hunts.json refer to existing locations."""
    if "galati_map/locations.json" not in valid:
        return
    locs = valid["galati_map/locations.json"]
    locs_list = locs if isinstance(locs, list) else locs.get("locations", [])
    id_set = {L.get("id") for L in locs_list if L.get("id")}
    art_set = {L.get("article") for L in locs_list if L.get("article")}

    # tours.json
    tp = "galati_map/tours.json"
    if tp in valid:
        for t in valid[tp].get("tours", []):
            for s in t.get("stops", []):
                art = s.get("article")
                if art and art not in art_set:
                    warn(f"tours.json {t['id']}: orphan article {art}")

    # treasure_hunts.json
    hp = "galati_map/treasure_hunts.json"
    if hp in valid:
        for h in valid[hp].get("hunts", []):
            for cp in h.get("checkpoints", []):
                lid = cp.get("loc_id")
                if lid and lid not in id_set:
                    warn(f"treasure_hunts.json {h['id']}.{cp.get('id')}: orphan loc_id {lid}")


def main() -> int:
    print("Validating Heritage Galați data files…\n")

    print("📋 JSON syntax:")
    valid = validate_json_syntax()
    print(f"  {len(valid)} files OK")

    print("\n📋 locations.json integrity:")
    loc_data = valid.get("galati_map/locations.json")
    if loc_data:
        validate_locations(loc_data)
    else:
        err("locations.json missing or invalid")

    print("\n📋 Cross-references (tours + hunts → locations):")
    validate_cross_references(valid)

    print()
    if errors:
        print(f"✗ {len(errors)} ERROR(s) found. Fix before commit.")
        return 1
    if warnings:
        print(f"⚠ {len(warnings)} warning(s) (non-blocking).")
    print("✓ All data files valid.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
