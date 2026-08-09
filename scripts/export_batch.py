#!/usr/bin/env python3
"""Exportă loturi mici de fișe pentru rescriere (vezi CONTENT-STYLE.md).

`locations.json` are 2,5 MB — prea mult ca să fie citit întreg de fiecare dată.
Scriptul taie fișele neconforme în loturi de câte N și scrie fiecare lot ca
fișier separat, cu doar câmpurile necesare redactării.

Rulează:
    python3 scripts/export_batch.py --out DIR --size 12
    python3 scripts/export_batch.py --out DIR --size 12 --only-bad
    python3 scripts/export_batch.py --out DIR --ids loc-8,loc-12
"""
from __future__ import annotations
import argparse
import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
LOCATIONS = ROOT / "galati_map" / "locations.json"
FIELDS = ("id", "title", "location", "category", "status",
          "year_built", "year_demolished", "period", "excerpt", "description")


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", type=Path, required=True)
    ap.add_argument("--size", type=int, default=12)
    ap.add_argument("--only-bad", action="store_true",
                    help="doar fișele pe care lint_content.py le semnalează")
    ap.add_argument("--ids", help="listă explicită, separată prin virgulă")
    args = ap.parse_args()

    locs = json.loads(LOCATIONS.read_text(encoding="utf-8"))

    if args.ids:
        wanted = [i.strip() for i in args.ids.split(",") if i.strip()]
    elif args.only_bad:
        r = subprocess.run([sys.executable, str(ROOT / "scripts" / "lint_content.py"), "--list-bad"],
                           capture_output=True, text=True)
        wanted = [l.strip() for l in r.stdout.splitlines() if l.strip().startswith("loc-")]
    else:
        wanted = [l["id"] for l in locs]

    by_id = {l["id"]: l for l in locs}
    sel = [by_id[i] for i in wanted if i in by_id]
    sel.sort(key=lambda l: int(l["id"].split("-")[1]))

    args.out.mkdir(parents=True, exist_ok=True)
    for old in args.out.glob("batch-*.json"):
        old.unlink()

    n = 0
    for n, start in enumerate(range(0, len(sel), args.size), 1):
        chunk = sel[start:start + args.size]
        payload = [{k: l.get(k) for k in FIELDS} for l in chunk]
        path = args.out / f"batch-{n:02d}.json"
        path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        chars = sum(len(l.get("description") or "") for l in chunk)
        print(f"  {path.name}: {len(chunk)} fișe, {chars:,} car.")

    print(f"\n{len(sel)} fișe în {n} loturi → {args.out}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
