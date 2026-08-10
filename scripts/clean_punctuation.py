#!/usr/bin/env python3
"""Aplică politica de punctuație pe TOATE fișierele de date vizibile.

Curățarea de ton din august 2026 a trecut prin `description` și `excerpt` din
`locations.json`. Restul datelor au rămas neatinse și mai purtau circa 1.700 de
semne interzise: cronologia, trivia, tururile, vânătorile de comori, legendele,
evenimentele de pe timeline, legendele de galerie și cele din Alta Data.

Legendele de galerie sunt cazul cel mai vizibil: `caption`/`caption_en` ajung în
`<figcaption>` și în lightbox (`core-map.js:657-660`), iar `alt` e citit de
cititoarele de ecran și e rezervă pentru legendă când aceasta lipsește.

Reguli, aceleași ca în `CONTENT-STYLE.md` §3.2:
  - liniuța dintre cuvinte devine virgulă;
  - liniuța dintre cifre devine cratimă, fiind interval;
  - ghilimelele se normalizează alternând deschis/închis, ceea ce repară și
    perechile stricate; româna primește „ ”, engleza “ ”.

Ce NU atinge:
  - fișierele care nu ajung în front-end (`manual_overrides.json`,
    `unplaced_locations.json`, `geocode_cache.json`);
  - câmpurile tehnice (`geocoded_as`, `src`, `id`, coordonate), unde liniuța
    face parte din notația de provenență, nu din proză;
  - franceza: acolo se repară doar liniuțele, fiindcă ghilimelele franceze
    corecte sunt « », iar trecerea la ele e o decizie tipografică separată.

Rulează:
    python3 scripts/clean_punctuation.py --dry-run
    python3 scripts/clean_punctuation.py --dry-run --file trivia.json
    python3 scripts/clean_punctuation.py
"""
from __future__ import annotations
import argparse
import json
import re
import sys
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
GMAP = ROOT / "galati_map"

# Fișierele încărcate de aplicație. Cele lipsă de aici (`manual_overrides`,
# `unplaced_locations`, `geocode_cache`) nu ajung niciodată la utilizator.
FILES = [
    "locations.json", "cronologie.json", "galati-altadata.json", "tours.json",
    "treasure_hunts.json", "trivia.json", "timeline_events.json",
    "legende.json", "manifest.json",
]

# Chei tehnice: acolo liniuța e notație, nu punctuație de proză.
SKIP_KEYS = {
    "geocoded_as", "src", "url", "href", "path", "id", "article", "image",
    "thumb", "icon", "display_name", "coords", "lat", "lon", "lng", "slug",
    "start_url", "scope", "loc_id", "file", "filename", "type", "category",
}

DASH_WORDS = re.compile(r"\s*[—–]\s+")
DASH_NUMS = re.compile(r"(?<=\d)\s*[—–]\s*(?=\d)")
# Liniuță fără spații de o parte și de alta: e compus sau interval, nu pauză de
# frază. „Galați–Berești–Bârlad", „sec. XVIII–XIX", „'63–'64", „1891–august 1892".
DASH_TIGHT = re.compile(r"(?<!\s)[—–](?!\s)")
ARROW_NUMS = re.compile(r"(?<=\d)\s*→\s*(?=\d)")
QUOTE_CHARS = "\"„“”"

# Săgețile din proză nu se pot înlocui mecanic: „Galați → Ispahan" e un traseu,
# nu un interval. Enumerate explicit, ca decizia să se vadă în diff. Ce nu e
# aici rămâne neatins, ceea ce protejează notația din cifrul vânătorii de
# comori (`ABCDEFGH...XYZ → XCVISPBDHAWLROQFKTNYJZEUMG`), unde săgeata chiar
# înseamnă „se substituie cu" și nu e punctuație.
ARROW_TEXT = {
    "Galați → Ispahan": "Galați-Ispahan",
    "Galați → Isfahan": "Galați-Isfahan",
    "Daily → Parc Eminescu": "Daily-Parc Eminescu",
    "Imperiul Roman → Bizantin": "Imperiul Roman, apoi Bizantin",
}


def lang_of(path: str) -> str:
    """Limba se citește din calea JSON: `label_en`, `i18n.en.`, `caption_ro`."""
    if re.search(r"_en\b|\.en\.", path):
        return "en"
    if re.search(r"_fr\b|\.fr\.", path):
        return "fr"
    return "ro"


def fix_quotes(s: str, lang: str) -> str:
    op, cl = ("“", "”") if lang == "en" else ("„", "”")
    out, is_open = [], True
    for ch in s:
        if ch in QUOTE_CHARS:
            out.append(op if is_open else cl)
            is_open = not is_open
        else:
            out.append(ch)
    return "".join(out)


def clean(s: str, lang: str, counter: Counter, odd: list[str], path: str) -> str:
    for a, b in ARROW_TEXT.items():
        if a in s:
            s = s.replace(a, b)
            counter["săgeată în proză"] += 1
    s, n = ARROW_NUMS.subn("-", s)
    counter["săgeată între cifre"] += n
    s, n = DASH_NUMS.subn("-", s)
    counter["interval de ani"] += n
    s, n = DASH_TIGHT.subn("-", s)
    counter["liniuță în compus"] += n
    s, n = DASH_WORDS.subn(", ", s)
    counter["liniuță → virgulă"] += n
    if lang != "fr" and any(c in s for c in QUOTE_CHARS):
        # Un număr impar de ghilimele înseamnă o pereche neînchisă în date.
        # Alternarea ar produce un semn de deschidere fără pereche, așa că
        # raportăm în loc să stricăm.
        if sum(s.count(c) for c in QUOTE_CHARS) % 2:
            odd.append(f"{path}: {s[:70]}")
        else:
            q = fix_quotes(s, lang)
            if q != s:
                counter["ghilimele"] += 1
                s = q
    s = re.sub(r",\s*,", ",", s)
    s = re.sub(r"[ \t]{2,}", " ", s)
    return s


def walk(node, path: str, counter: Counter, odd: list[str], changes: list):
    if isinstance(node, dict):
        for k, v in node.items():
            if k in SKIP_KEYS:
                continue
            p = f"{path}.{k}" if path else k
            if isinstance(v, str):
                new = clean(v, lang_of(p), counter, odd, p)
                if new != v:
                    changes.append((p, v, new))
                    node[k] = new
            else:
                walk(v, p, counter, odd, changes)
    elif isinstance(node, list):
        for i, v in enumerate(node):
            p = f"{path}[]"
            if isinstance(v, str):
                new = clean(v, lang_of(p), counter, odd, p)
                if new != v:
                    changes.append((p, v, new))
                    node[i] = new
            else:
                walk(v, p, counter, odd, changes)


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--file", help="doar un fișier")
    ap.add_argument("--samples", type=int, default=3)
    args = ap.parse_args()

    files = [args.file] if args.file else FILES
    grand = Counter()
    all_odd: list[str] = []
    total = 0

    for name in files:
        p = GMAP / name
        if not p.exists():
            print(f"  ✗ lipsește {name}")
            continue
        data = json.loads(p.read_text(encoding="utf-8"))
        counter: Counter = Counter()
        odd: list[str] = []
        changes: list = []
        walk(data, "", counter, odd, changes)
        if not changes and not odd:
            continue
        n = sum(counter.values())
        total += len(changes)
        grand.update(counter)
        all_odd.extend(f"{name} · {o}" for o in odd)
        print(f"\n{name}: {len(changes)} câmpuri, {n} înlocuiri")
        for k, v in counter.most_common():
            if v:
                print(f"    {v:>4}  {k}")
        for pth, o, nw in changes[:args.samples]:
            print(f"      {pth}\n        vechi: {o[:92]}\n        nou  : {nw[:92]}")
        if not args.dry_run:
            tmp = p.with_suffix(".json.tmp")
            tmp.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n",
                           encoding="utf-8")
            tmp.replace(p)

    print(f"\n{'=' * 60}\nTOTAL: {total} câmpuri, {sum(grand.values())} înlocuiri")
    for k, v in grand.most_common():
        if v:
            print(f"  {v:>5}  {k}")
    if all_odd:
        print(f"\n⚠ {len(all_odd)} câmpuri cu număr IMPAR de ghilimele, lăsate neatinse "
              f"(pereche neînchisă în date, de reparat manual):")
        for o in all_odd[:12]:
            print(f"    {o}")
    if args.dry_run:
        print("\n(dry-run, nimic scris)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
