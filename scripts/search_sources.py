#!/usr/bin/env python3
"""Caută în corpusul de surse OCR din `Surse/` și întoarce fragmente cu context.

De ce nu `grep`: fișierele sunt extracții OCR de 1-3 MB în care o pagină întreagă
e adesea o singură linie. `grep -o` cu context devine patologic de lent, iar
`grep` simplu întoarce o linie de 200.000 de caractere. Aici căutăm pe text
normalizat (fără diacritice, ca să prindem și OCR-ul stricat) și tăiem context
de lungime fixă în jurul fiecărei potriviri.

Sursele sunt cele din bibliografia proiectului: Sandel Dumitru vol. V-X, Cilinca
„Abecedar istoric gălățean", Dunărea de Jos nr. 214, cronologia, plus articolul
despre Piața Regală.

Rulează:
    python3 scripts/search_sources.py "Hristo Botev"
    python3 scripts/search_sources.py "Trianon" --context 400
    python3 scripts/search_sources.py "farmacia Aburel" --max 20
    python3 scripts/search_sources.py "Canellos" --files "Cilinca,RDJ"
"""
from __future__ import annotations
import argparse
import re
import sys
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SURSE = ROOT / "Surse"


def strip_diacritics(s: str) -> str:
    s = unicodedata.normalize("NFKD", s)
    return "".join(c for c in s if not unicodedata.combining(c))


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("query")
    ap.add_argument("--context", type=int, default=320,
                    help="caractere de context de fiecare parte (implicit 320)")
    ap.add_argument("--max", type=int, default=12, help="maximum de potriviri afișate")
    ap.add_argument("--files", help="filtrează fișierele după subșir, separate prin virgulă")
    ap.add_argument("--regex", action="store_true", help="tratează query ca expresie regulată")
    args = ap.parse_args()

    if not SURSE.exists():
        print(f"Nu există {SURSE}", file=sys.stderr)
        return 1

    files = sorted(SURSE.glob("*.txt"))
    if args.files:
        keys = [k.strip().lower() for k in args.files.split(",") if k.strip()]
        files = [f for f in files if any(k in f.name.lower() for k in keys)]
    if not files:
        print("Niciun fișier de căutat.", file=sys.stderr)
        return 1

    pat = args.query if args.regex else re.escape(strip_diacritics(args.query))
    rx = re.compile(pat, re.I)

    total = 0
    for f in files:
        try:
            raw = f.read_text(encoding="utf-8", errors="replace")
        except Exception as e:
            print(f"  ✗ {f.name}: {e}", file=sys.stderr)
            continue
        # Căutăm pe textul fără diacritice, dar afișăm din cel original: OCR-ul
        # confundă frecvent ș/s, ț/t, ă/a, iar o căutare „corectă" ar rata tocmai
        # paginile prost scanate.
        flat = strip_diacritics(raw)
        hits = list(rx.finditer(flat))
        if not hits:
            continue
        print(f"\n{'=' * 78}\n{f.name}  ({len(hits)} potriviri)\n{'=' * 78}")
        for m in hits[:args.max]:
            s = max(0, m.start() - args.context)
            e = min(len(raw), m.end() + args.context)
            frag = re.sub(r"\s+", " ", raw[s:e]).strip()
            print(f"\n  …{frag}…")
            total += 1
            if total >= args.max:
                break
        if total >= args.max:
            break

    if not total:
        print(f"Nicio potrivire pentru „{args.query}”.")
    else:
        print(f"\n\n{total} fragment(e) afișate.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
