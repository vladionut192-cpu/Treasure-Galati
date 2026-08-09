#!/usr/bin/env python3
"""Sincronizează `excerpt` cu rezumatul din `description`.

De ce: după rescrierea din august 2026, primul bloc al fiecărei descrieri ESTE
rezumatul, scris exact pentru rolul de sinteză (2-4 fraze, 250-450 caractere,
vezi CONTENT-STYLE.md §2.1). Câmpul `excerpt` rămăsese însă în forma veche și
ajunsese să contrazică descrierea: la `loc-105` spunea „sfârșitul secolului al
XIX-lea" acolo unde sursele dau 1930-1949, la `loc-106` dădea moartea lui
Dimitrie Frigator în 1907 acolo unde arhiva dă 12 noiembrie 1902. Conținea și
136 de em dash-uri și 29 de ghilimele drepte, adică exact ce s-a curățat din
descrieri.

`excerpt` e vizibil: alimentează popup-ul de pe hartă (`core-map.js:217`),
intră în indexul de căutare cu greutate 1 (`core-map.js:277`) și devine
meta-description în paginile statice (`generate_static_pages.py:196`).

Derivarea din rezumat face cele două câmpuri consecvente prin construcție.

Rulează:
    python3 scripts/sync_excerpts.py --dry-run
    python3 scripts/sync_excerpts.py
    python3 scripts/sync_excerpts.py --lang en    # după regenerarea EN
"""
from __future__ import annotations
import argparse
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
LOCATIONS = ROOT / "galati_map" / "locations.json"
HEAD_RE = re.compile(r"^[A-ZĂÂÎȘȚ0-9][^.\n]{1,60}:$")


def rezumat(text: str) -> str | None:
    """Primul bloc, dacă e proză și nu subtitlu."""
    blocks = [b.strip() for b in re.split(r"\n{2,}", (text or "").replace("\r\n", "\n")) if b.strip()]
    if not blocks:
        return None
    first = blocks[0]
    lines = first.split("\n")
    if len(lines) == 1 and HEAD_RE.match(lines[0].strip()):
        return None            # începe cu subtitlu: fișă neconformă, o sărim
    if first.lstrip().startswith(("•", "▪", "‣")):
        return None
    # Rezumatul e proză pe una sau mai multe linii; le unim.
    return " ".join(l.strip() for l in lines if l.strip())


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--lang", choices=["ro", "en"], default="ro")
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    dfield = "description" if args.lang == "ro" else "description_en"
    efield = "excerpt" if args.lang == "ro" else "excerpt_en"

    locs = json.loads(LOCATIONS.read_text(encoding="utf-8"))
    changed = skipped = same = 0
    samples = []

    for l in locs:
        r = rezumat(l.get(dfield) or "")
        if not r:
            skipped += 1
            continue
        old = l.get(efield) or ""
        if old.strip() == r.strip():
            same += 1
            continue
        if len(samples) < 3:
            samples.append((l["id"], old[:90], r[:90]))
        if not args.dry_run:
            l[efield] = r
        changed += 1

    print(f"{efield}: {changed} actualizate, {same} deja identice, {skipped} sărite")
    for lid, o, n in samples:
        print(f"\n  {lid}\n    vechi: {o}…\n    nou  : {n}…")

    if args.dry_run:
        print("\n(dry-run — nimic scris)")
        return 0

    tmp = LOCATIONS.with_suffix(".json.tmp")
    tmp.write_text(json.dumps(locs, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    tmp.replace(LOCATIONS)
    print(f"\n✓ Scris atomic. Rulează: python3 scripts/build_data_index.py && "
          f"python3 scripts/validate_data.py")
    return 0


if __name__ == "__main__":
    sys.exit(main())
