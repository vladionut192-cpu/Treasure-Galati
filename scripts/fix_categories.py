#!/usr/bin/env python3
"""Rearanjează categoriile: unifică duplicatele și scoate temele îngropate.

Categoriile sunt chipsurile de filtrare de pe hartă, deci se văd la fiecare
vizitator. Erau 15, dintre care patru perechi practic identice:

    Case istorice (53)  vs  Clădiri Istorice (9)
    Industrie (17)      vs  Industrial / Tehnic (14)
    Monumente (42)      vs  Monumente Comemorative (3)
    Natură și Agrement  vs  Spații verzi (2)

„Industrial / Tehnic" devenise coș de gunoi: conținea Stadionul Oțelul, Bazinul
Olimpic de Înot și patru spitale. Cinci categorii nu aveau iconiță proprie și
cădeau pe pinul generic.

Trei teme erau împrăștiate fără să existe ca atare: 8 fișe de sănătate în patru
categorii diferite, 15 de cultură în șase, 7 de sport în trei.

Decizia (august 2026): unificăm duplicatele și adăugăm Sănătate, Cultură, Sport.

Clasificarea se face în trei trepte, în ordine: întâi excepțiile explicite, apoi
regulile pe titlu, apoi unificarea. Excepțiile există fiindcă regula oarbă
greșește: „Bazinul Olimpic de Înot" nu e industrie, „Închisoarea Centrală" nu e
industrie, iar o cazarmă, o baie comunală și vechea primărie nu sunt case.

Rulează:
    python3 scripts/fix_categories.py --dry-run
    python3 scripts/fix_categories.py
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

# Treapta 1: fișe unde regula pe titlu ar da un rezultat greșit.
EXCEPTII = {
    # „Clădiri Istorice" nu se poate turna în „Case istorice": doar două din
    # cele nouă sunt case.
    "loc-220": ("Comerț istoric", "fostul Hotel Union, nu casă"),
    "loc-240": ("Alte locuri", "baie comunală, nu casă"),
    "loc-257": ("Alte locuri", "cazarmă, nu casă"),
    "loc-260": ("Comerț istoric", "centru social-comercial, nu casă"),
    "loc-261": ("Alte locuri", "cămin municipal, nu casă"),
    "loc-263": ("Alte locuri", "vechea primărie, nu casă"),
    # „Industrial / Tehnic": ce rămâne după ce ies sănătatea și sportul.
    "loc-267": ("Sport", "bazin olimpic de înot"),
    "loc-270": ("Alte locuri", "penitenciar, nu unitate industrială"),
    # „Monumente Comemorative": două chiar sunt monumente, al treilea e un loc.
    "loc-307": ("Alte locuri", "cap de pod, localitate, nu monument"),
    # Casa Ținc a fost farmacie, azi e muzeu; regula prinde „farmacia" prima.
    "loc-153": ("Cultură", "azi Muzeul Colecțiilor"),
}

# Treapta 2: teme recunoscute după titlu. Ordinea contează.
TEME = [
    ("Sănătate", r"spital|sanator|azil de b|dispensar|farmac|policlin|maternit"),
    ("Sport", r"stadion|patinoar|sal[ăa] (de )?sport|bazinul? (olimpic|de înot)"
              r"|hipodrom|karting|kartodrom|complex sportiv"),
    ("Cultură", r"teatr|cinema|cinemat|filarmon|ateneu|muzeu|bibliotec|casa de cultur"),
]

# Treapta 3: perechile duplicate.
UNIFICARI = {
    "Clădiri Istorice": "Case istorice",
    "Industrial / Tehnic": "Industrie",
    "Monumente Comemorative": "Monumente",
    "Spații verzi": "Natură și Agrement",
}


def clasifica(loc: dict) -> tuple[str, str]:
    lid = loc.get("id")
    if lid in EXCEPTII:
        return EXCEPTII[lid]
    titlu = loc.get("title") or ""
    for tema, rx in TEME:
        if re.search(rx, titlu, re.I):
            return tema, "după titlu"
    veche = loc.get("category")
    if veche in UNIFICARI:
        return UNIFICARI[veche], "unificare"
    return veche, ""


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    locs = json.loads(LOCATIONS.read_text(encoding="utf-8"))
    mutate: list = []
    dupa: Counter = Counter()
    for l in locs:
        noua, motiv = clasifica(l)
        # Numărăm din clasificare, nu din date: altfel `--dry-run`, care nu
        # scrie nimic, ar raporta taxonomia veche și ar părea că nu s-a schimbat.
        dupa[noua or l.get("category")] += 1
        if noua and noua != l.get("category"):
            mutate.append((l["id"], l.get("category"), noua, motiv, l.get("title", "")))
            if not args.dry_run:
                l["category"] = noua
    print(f"{len(mutate)} fișe își schimbă categoria\n")
    for tema in ("Sănătate", "Cultură", "Sport"):
        sub = [m for m in mutate if m[2] == tema]
        print(f"  → {tema} ({len(sub)}): " + ", ".join(m[0] for m in sub))
    print("\nTaxonomia rezultată:")
    for k, v in dupa.most_common():
        print(f"    {v:>3}  {k}")
    print(f"    ── {len(dupa)} categorii (erau 15)")

    ramase = [k for k in UNIFICARI if dupa.get(k)]
    if ramase:
        print(f"\n  ⚠ categorii care trebuiau să dispară dar au rămas: {ramase}")

    if args.dry_run:
        print("\n(dry-run, nimic scris)")
        return 0
    if not mutate:
        return 0
    tmp = LOCATIONS.with_suffix(".json.tmp")
    tmp.write_text(json.dumps(locs, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    tmp.replace(LOCATIONS)
    print("\n✓ Scris atomic. Rulează: python3 scripts/build_data_index.py && "
          "python3 scripts/validate_data.py")
    return 0


if __name__ == "__main__":
    sys.exit(main())
