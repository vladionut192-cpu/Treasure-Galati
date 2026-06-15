#!/usr/bin/env python3
"""Generează locations-index.json — varianta UȘOARĂ a locations.json.

De ce: locations.json e 2,4 MB, din care ~1,9 MB sunt descrierile lungi
(`description`/`description_en`) + galeriile — necesare DOAR când deschizi
panoul de detaliu. Harta, lista, căutarea, filtrele și timeline-ul au nevoie
doar de metadatele ușoare. Încărcând întâi indexul (~400 KB), harta se randează
de ~6× mai repede; datele complete se aduc în fundal (vezi js/main.js).

Strategie SIGURĂ: indexul = locations.json MINUS doar cele 5 câmpuri grele.
Toate celelalte câmpuri rămân (article, period, source, architect, …), deci
niciun consumator de la încărcare (tururi prin `article`, timeline prin
`year_built`, etc.) nu se rupe.

Rulează (sau lasă CI / serve.py să-l regenereze):
    python3 scripts/build_data_index.py
"""
from __future__ import annotations
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "galati_map" / "locations.json"
OUT = ROOT / "galati_map" / "locations-index.json"

# Câmpurile grele, încărcate lazy (doar la deschiderea detaliului).
HEAVY = {
    "description", "description_en", "gallery",
    "image_then", "image_now", "image_then_year", "image_now_year",
}


def build_index(locs: list) -> list:
    return [{k: v for k, v in L.items() if k not in HEAVY} for L in locs]


def main() -> int:
    locs = json.loads(SRC.read_text(encoding="utf-8"))
    if not isinstance(locs, list):
        locs = locs.get("locations", [])
    index = build_index(locs)
    OUT.write_text(json.dumps(index, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    full_kb = SRC.stat().st_size / 1024
    idx_kb = OUT.stat().st_size / 1024
    print(f"✓ locations-index.json: {len(index)} locații, "
          f"{full_kb:.0f}KB → {idx_kb:.0f}KB (−{100*(1-idx_kb/full_kb):.0f}%)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
