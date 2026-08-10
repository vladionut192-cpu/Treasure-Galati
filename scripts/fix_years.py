#!/usr/bin/env python3
"""Separă anul clădirii de anul instituției și completează golurile din `year_built`.

`year_built` alimentează filtrul cronologic (`core-map.js`, `passesTimeline`),
care e o întrebare pur fizică: „lucrul din pin exista în anul X?". Pentru vreo
20 de fișe câmpul conținea altceva, iar la două chiar anul nașterii fondatorului:
`loc-106` avea 1838, anul nașterii lui Dimitrie Frigator, iar `loc-59` avea 1866,
anul nașterii lui Ludwig Josiek. Pinul apărea pe hartă cu decenii înainte ca
clădirea să existe.

Decizia (august 2026): `year_built` = anul clădirii. Anul instituției trece în
`year_founded`, câmp nou, ca informația să nu se piardă.

A doua problemă: 50 de fișe aveau `year_built` gol, iar `passesTimeline` le
afișează atunci doar de la 1990 încolo (`core-map.js:261`). Erau invizibile pe
toată rigla istorică, deși textul lor dădea anul. Nouă dintre ele se completează
din propriul `REPERE`.

Fiecare valoare de mai jos are ca sursă bullet-ul din fișa respectivă, citat în
comentariu. Nimic dedus din altă parte.

Rulează:
    python3 scripts/fix_years.py --dry-run
    python3 scripts/fix_years.py
"""
from __future__ import annotations
import argparse
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
LOCATIONS = ROOT / "galati_map" / "locations.json"

# (id, an nou, dovada din REPERE-ul fișei)
YEAR_BUILT = [
    ("loc-6",   1801, "Construită: 1801-1805 (1853 era școala de alături)"),
    ("loc-10",  1840, "Zidărie încheiată: 1840; sfințire: 1845"),
    ("loc-24",  1880, "Ridicată: datare oficială în jurul lui 1880"),
    ("loc-32",  1922, "Ridicată: 1922, ca locuință și atelier fotografic"),
    ("loc-40",  1850, "Ridicată: la jumătatea secolului al XIX-lea (1851 era firma)"),
    ("loc-41",  1883, "Ridicată: 1883, casa cu anexe; 1914, clădirea nouă"),
    ("loc-44",  1898, "Sediul din Galați: dat în folosință în jurul anilor 1898-1899"),
    ("loc-45",  1867, "Înființat: 1867, pe teren cumpărat de comunitatea evreiască"),
    ("loc-46",  1888, "Sediul propriu: construit între 1888 și 1890"),
    ("loc-54",  1909, "Ridicată: 1909-1912, pentru familia Macri"),
    ("loc-56",  1923, "Sediul de pe str. Gării: cumpărat în 1923 (singurul an legat de clădire)"),
    ("loc-57",  1930, "Adresă: str. Domnească nr. 79 (sediul din anii 1930)"),
    ("loc-59",  1894, "fabrica inaugurată în ianuarie 1894 (1866 era nașterea fondatorului)"),
    ("loc-90",  1898, "Clădirea actuală: 1898-1902, firma Bertolero & Moreschi"),
    ("loc-95",  1817, "Ridicată: 1817-1828"),
    ("loc-96",  1600, "Ridicată: secolul XVII (secolul reprezentat prin anul de început)"),
    ("loc-102", 1972, "Amplasată: din 1972, statuia actuală"),
    ("loc-103", 1956, "Dezvelit: 1956, la 50 de ani de la greva portuară din 1906"),
    ("loc-106", 1905, "Arhitect: proiect din 1 septembrie 1905; Terminat: 10 iulie 1908"),
    ("loc-118", 1921, "Ridicat: 1921-1925"),
    ("loc-119", 1900, "Construcție inițială: hală metalică, din jurul anului 1900"),
    ("loc-123", 1897, "Atestat: 1897, în lista hotelurilor din zona Pieței Regale"),
    ("loc-143", 1922, "Palatul: construit între 1922 și 1932"),
    ("loc-144", 1900, "Vila Elisa: proprietatea lui Ioan Stoicovici, început de secol XX"),
    # Demolate, dar fără an de construcție: apăreau pe harta anului 2026 ca și
    # cum ar sta în picioare (vezi nota despre `passesTimeline` de mai jos).
    ("loc-124", 1903, "Atestare: ilustrate din 1903 și 1906 cu strada Domnească"),
    ("loc-253", 1935, "Atestare: fotografie din 1935, Biblioteca „V.A. Urechia”"),
    ("loc-261", 1920, "Ridicată: perioada interbelică (reprezentată prin anul de început)"),
    ("loc-262", 1920, "Deschis: în jurul anului 1920, prin achiziția unui local de SONFR"),
]

# Anul instituției, mutat din `year_built` sau preluat din text.
YEAR_FOUNDED = [
    ("loc-44",  1876, "Instituție înființată: 1876"),
    ("loc-46",  1867, "Înființat: 1867, ca gimnaziu cu o singură clasă"),
    ("loc-49",  1881, "Consulat înființat: 1881"),
    ("loc-50",  1802, "numirea primului sub-comisar francez"),
    ("loc-51",  1832, "Viceconsulat deschis: în jurul anului 1832 sau 1835"),
    ("loc-56",  1833, "Înființat: 1833, ca viceconsulat"),
    ("loc-57",  1870, "Înființat: 1870, ca viceconsulat onorific"),
    ("loc-59",  1890, "Companie fondată: 1890"),
    ("loc-90",  1877, "Înființată: 1877, la Ismail"),
    ("loc-106", 1902, "Act fondator: testamentul din 6 iulie 1902"),
    ("loc-119", 1889, "Fondare: 1889, sub mandatul primarului Constantin Ressu"),
    ("loc-143", 1864, "Școala: înființată la 26 octombrie 1864"),
    ("loc-144", 1956, "Teatru: din 1956, Teatrul de Operetă și Estradă Regional"),
]

# `status` contrazis de propriul text. Vocabularul e {active, demolished, ruin, lost}.
STATUS = [
    ("loc-110", "lost", "Stare: dispărută, clădirile au primit alte funcțiuni "
                        "(fabrica nu mai există, dar clădirile stau în picioare)"),
    ("loc-150", "ruin", "Stare: închisă și abandonată după anii 1990 (nu „active”)"),
]

# `category` clar greșită. Taxonomia are o problemă mai mare, notată separat:
# nu există categorie de sănătate, iar spitalele stau în cinci categorii diferite.
CATEGORY = [
    ("loc-98",  "Alte locuri", "spital, nu unitate de învățământ"),
    ("loc-106", "Alte locuri", "azil de bătrâni, nu unitate de învățământ"),
]


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    locs = json.loads(LOCATIONS.read_text(encoding="utf-8"))
    by = {l["id"]: l for l in locs}
    n = 0

    print("year_built (anul clădirii)")
    for lid, year, why in YEAR_BUILT:
        l = by.get(lid)
        if l is None:
            print(f"  ✗ {lid} lipsește")
            continue
        old = l.get("year_built")
        if old == year:
            continue
        print(f"  {lid:<9} {str(old):>6} → {year}   {why[:64]}")
        if not args.dry_run:
            l["year_built"] = year
        n += 1

    print("\nyear_founded (anul instituției, câmp nou)")
    for lid, year, why in YEAR_FOUNDED:
        l = by.get(lid)
        if l is None or l.get("year_founded") == year:
            continue
        print(f"  {lid:<9} {year}   {why[:64]}")
        if not args.dry_run:
            # Îl punem imediat după year_built, ca perechea să se citească împreună.
            items = list(l.items())
            l.clear()
            for k, v in items:
                l[k] = v
                if k == "year_built":
                    l["year_founded"] = year
            if "year_founded" not in l:
                l["year_founded"] = year
        n += 1

    print("\nstatus")
    for lid, st, why in STATUS:
        l = by.get(lid)
        if l is None or l.get("status") == st:
            continue
        print(f"  {lid:<9} {l.get('status'):>10} → {st:<10} {why[:56]}")
        if not args.dry_run:
            l["status"] = st
        n += 1

    print("\ncategory")
    for lid, cat, why in CATEGORY:
        l = by.get(lid)
        if l is None or l.get("category") == cat:
            continue
        print(f"  {lid:<9} {l.get('category'):>14} → {cat:<14} {why[:48]}")
        if not args.dry_run:
            l["category"] = cat
        n += 1

    # Câte fișe rămân invizibile pe rigla dinainte de 1990.
    blind = [l["id"] for l in locs if l.get("year_built") is None]
    print(f"\n{n} modificări; {len(blind)} fișe rămân fără year_built "
          f"(vizibile doar de la 1990, core-map.js:261)")

    if args.dry_run:
        print("\n(dry-run, nimic scris)")
        return 0
    if not n:
        return 0
    tmp = LOCATIONS.with_suffix(".json.tmp")
    tmp.write_text(json.dumps(locs, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    tmp.replace(LOCATIONS)
    print("\n✓ Scris atomic. Rulează: python3 scripts/build_data_index.py && "
          "python3 scripts/validate_data.py")
    return 0


if __name__ == "__main__":
    sys.exit(main())
