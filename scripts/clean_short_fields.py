#!/usr/bin/env python3
"""Aplică politica de punctuație pe câmpurile scurte: `title` și `location`.

Curățarea de ton din august 2026 a trecut prin `description` și `excerpt`, dar
nu și prin titluri și adrese, care au rămas cu 224 de semne interzise: 56 de
ghilimele drepte în `title_en`, 69 de em dash-uri, 30 de en dash-uri și 28 de
ghilimele românești rătăcite în engleză. `loc-303` le aduna pe toate deodată:
„Casa Max Auschnitt — reședința „Regelui Oțelului"".

Câmpurile astea sunt vizibile peste tot: titlul e `<h1>`-ul paginii statice,
textul din popup-ul hărții și din lista laterală, iar `location` apare sub el.

Reguli:
  - liniuța dintre cuvinte devine virgulă, fiindcă în titluri e mereu apoziție
    („Biserica Bulgărească – Sfântul Mare Mucenic Pantelimon");
  - liniuța dintre cifre e interval și devine cratimă, ca restul corpusului,
    care scrie „1861-1872", nu „1861–1872";
  - ghilimelele se normalizează alternând deschis/închis, ceea ce repară și
    perechile stricate de tipul ”Titan” sau „Danubius";
  - româna primește „ ”, engleza primește “ ”.

Excepțiile care nu se pot deduce dintr-o regulă sunt enumerate în `EXCEPTIONS`.

Rulează:
    python3 scripts/clean_short_fields.py --dry-run
    python3 scripts/clean_short_fields.py
"""
from __future__ import annotations
import argparse
import json
import re
import sys
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
LOCATIONS = ROOT / "galati_map" / "locations.json"
FIELDS = ("title", "title_en", "location", "location_en")

# Cazuri unde regula generală ar da un rezultat greșit. Valoarea e textul final,
# scris explicit, ca să se vadă în diff ce s-a decis și de ce.
EXCEPTIONS = {
    # Latura din dreapta are deja virgule; încă una ar face titlul ambiguu,
    # de parcă „Atlantic" ar fi primul element dintr-o enumerare.
    ("loc-1", "title_en"): "Atlantic: Cotton Spinning, Ginning and Weaving Factory (today DLC Grup headquarters)",
    # Șir de nume proprii, nu apoziție: virgula ar sugera trei case diferite.
    ("loc-17", "title"): "Casa Bozini-Gheorghiev-Geshov",
    ("loc-17", "title_en"): "Bozini-Gheorghiev-Geshov House",
    # Liniuța e urmată de paranteză; virgula ar dubla pauza.
    ("loc-7", "title"): "Biserica Protestantă Evanghelică (astăzi Biserica Baptistă „Golgota”)",
    # „Oțel" e steel, nu iron. Auschnitt era Regele Oțelului.
    ("loc-303", "title_en"): "Max Auschnitt House, the “King of Steel’s” residence",
    # Calc după română: „Lunca Joasă" e luncă inundabilă, nu „lower meadow".
    ("loc-201", "title_en"): "Lower Prut Floodplain Natural Park",
    # location_en descria promenada și pierdea adresa din `location`.
    ("loc-86", "location_en"): "Victor Vâlcovici St. no. 2, on the Danube cliff near the Public Garden",
}

DASH_WORDS = re.compile(r"\s*[—–]\s+")          # liniuță între cuvinte
DASH_NUMS = re.compile(r"(?<=\d)\s*[—–]\s*(?=\d)")  # interval de ani
QUOTE_CHARS = "\"„“”"
# Adresă în stil american: „253 George Coșbuc Blvd." în loc de „George Coșbuc
# Blvd. no. 253". Numărul se mută după numele arterei, ca la celelalte 117.
LEADING_NUM = re.compile(r"\b(\d+[A-Za-z]?)\s+((?:[A-ZȘȚĂÂÎ][\w'’-]+(?:\s+[A-ZȘȚĂÂÎ][\w'’-]+){0,3})\s+(?:St|Blvd|Rd|Sq)\.)")


def fix_quotes(s: str, lang: str) -> str:
    """Alternează deschis/închis, indiferent de ce glifă era acolo."""
    op, cl = ("„", "”") if lang == "ro" else ("“", "”")
    out, is_open = [], True
    for ch in s:
        if ch in QUOTE_CHARS:
            out.append(op if is_open else cl)
            is_open = not is_open
        else:
            out.append(ch)
    return "".join(out)


def clean(s: str, lang: str, counter: Counter) -> str:
    before = s
    s, n = DASH_NUMS.subn("-", s)
    counter["interval de ani"] += n
    s, n = DASH_WORDS.subn(", ", s)
    counter["liniuță → virgulă"] += n
    if any(c in s for c in QUOTE_CHARS):
        q = fix_quotes(s, lang)
        if q != s:
            counter["ghilimele"] += 1
            s = q
    if lang == "en":
        s, n = LEADING_NUM.subn(r"\2 no. \1", s)
        counter["adresă cu număr în față"] += n
    # Virgula pusă în locul liniuței poate ajunge lângă alta deja existentă.
    s = re.sub(r",\s*,", ",", s)
    s = re.sub(r"\s{2,}", " ", s).strip()
    return s


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--show-all", action="store_true", help="afișează toate modificările")
    args = ap.parse_args()

    locs = json.loads(LOCATIONS.read_text(encoding="utf-8"))
    counter: Counter = Counter()
    changes: list[tuple[str, str, str, str]] = []

    for l in locs:
        for f in FIELDS:
            old = l.get(f)
            if not isinstance(old, str) or not old:
                continue
            key = (l["id"], f)
            if key in EXCEPTIONS:
                new = EXCEPTIONS[key]
                if new != old:
                    counter["excepție explicită"] += 1
            else:
                new = clean(old, "en" if f.endswith("_en") else "ro", counter)
            if new != old:
                changes.append((l["id"], f, old, new))
                if not args.dry_run:
                    l[f] = new

    print(f"{len(changes)} câmpuri modificate")
    for k, v in counter.most_common():
        if v:
            print(f"  {v:>4}  {k}")
    shown = changes if args.show_all else changes[:10]
    for lid, f, o, n in shown:
        print(f"\n  {lid} · {f}\n    vechi: {o[:104]}\n    nou  : {n[:104]}")
    if not args.show_all and len(changes) > 10:
        print(f"\n  … încă {len(changes) - 10} (--show-all)")

    if args.dry_run:
        print("\n(dry-run, nimic scris)")
        return 0
    if not changes:
        return 0

    tmp = LOCATIONS.with_suffix(".json.tmp")
    tmp.write_text(json.dumps(locs, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    tmp.replace(LOCATIONS)
    print("\n✓ Scris atomic. Rulează: python3 scripts/build_data_index.py && "
          "python3 scripts/validate_data.py")
    return 0


if __name__ == "__main__":
    sys.exit(main())
