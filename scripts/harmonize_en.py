#!/usr/bin/env python3
"""Uniformizează convențiile din versiunea engleză a fișelor.

Traducerea s-a făcut în 24 de loturi, de agenți care nu se vedeau între ei, așa
că au apărut patru convenții pentru același lucru: „Strada Domnească", „Str.
Domnească", „Domnească Street" și „Domnească St.". La fel, aceeași persoană
apărea și ca „King Mihai", și ca „King Michael".

Convenția aleasă (august 2026):
    străzi         →  «Nume St. no. N»   (Domnească St. no. 56)
    suverani       →  forma engleză consacrată (King Michael, nu King Mihai)
    toponime       →  forma engleză consacrată (Kyiv, Chernivtsi, Chernihiv)

Ce NU atinge, intenționat:
  - blocul `SOURCES:`, fiindcă titlurile de carte sunt titluri românești și nu
    se traduc (CONTENT-STYLE.md); „Strada Domnească în imagini" rămâne așa;
  - textul dintre ghilimele, fiindcă citatele istorice se redau cum au fost
    scrise, nu cum am uniformiza noi azi;
  - `Piața`, `Calea`, `Bulevardul`, `Faleza`, care sunt tratate ca nume proprii
    întregi și nu au fost în decizia de uniformizare.

Rulează:
    python3 scripts/harmonize_en.py --dry-run
    python3 scripts/harmonize_en.py
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
FIELDS = ("description_en", "excerpt_en", "title_en", "location_en")

# Un „token" de nume propriu românesc: fie o abreviere cunoscută cu punct, fie
# un cuvânt cu majusculă de cel puțin două litere. Punctul NU e opțional la
# cuvintele obișnuite, altfel „Strada Domnească. The building…" ar înghiți
# punctul de final de frază și ar produce „Domnească. St.".
ABBR = r"(?:Sf|Sft|Gen|Col|Dr|Cpt|Lt|Mr|Av|Prof|Mihail)\."
# Inițiala cu un singur caracter e un token de sine stătător: „Str. A. I. Cuza",
# „Str. V. Alecsandri". Fără ea numele începea abia de la primul cuvânt întreg.
INIT = r"[A-ZȘȚĂÂÎ]\."
TOK = rf"(?:{ABBR}|{INIT}|[A-ZȘȚĂÂÎ][\w'’-]+)"
CONN = r"(?:cel|de|din|lui|și|al|ai|a|la)"
# Spațiu orizontal, NU `\s`: cu `\s+` numele trecea peste sfârșitul de bloc și
# înghițea începutul următorului, așa că „Strada General Iacob Lahovary" urmată
# de subtitlul „WHAT TOWN GAS…" producea „Lahovary\n\nWHAT TOWN GAS St.".
SP = r"[^\S\n]"
NAME = rf"{TOK}(?:{SP}+(?:{CONN}{SP}+)?{TOK}){{0,3}}"

# Gradele militare apar în date și cu literă mică („Strada col. Holban"). Lăsate
# așa, ar deschide fraza cu minusculă după inversiune: „col. Holban St. is one of
# the old streets…". Le ridicăm la majusculă înainte de regula principală.
RANK_LOWER = re.compile(rf"\b(Strada|Str\.){SP}+((?:col|gen|lt|cpt|mr|dr|av|prof|sf|maior)\.)")
PRE_RULES = [
    (RANK_LOWER, lambda m: f"{m.group(1)} {m.group(2).capitalize()}"),
]

# Ordinea contează: întâi formele lungi, ca „Strada" să nu fie prinsă de „Str.".
STREET_RULES = [
    (re.compile(rf"\bStrada{SP}+({NAME})"), r"\1 St."),
    (re.compile(rf"\bStr\.{SP}+({NAME})"), r"\1 St."),
    (re.compile(rf"\b({NAME}){SP}+Street\b"), r"\1 St."),
    (re.compile(rf"\b({NAME}){SP}+St\.{SP}+St\."), r"\1 St."),   # idempotență
    # Numele de stradă la final de frază: punctul abrevierii și cel al frazei se
    # contopesc, altfel rămâne „on Lozoveni St.. In 1941…".
    (re.compile(r"\bSt\.\.(?!\.)"), "St."),
]

# Numerotarea imobilelor: româna folosește „nr.", engleza „no.".
NUMBER_RULES = [
    (re.compile(r"\bnr\.\s*(\d)"), r"no. \1"),
]

# Nume proprii cu formă engleză consacrată. Cuvinte întregi, ca să nu stricăm
# „Kievan" sau numele de familie „Mihai" folosit ca antroponim de sine stătător
# (regula cere „King" înainte).
NAME_RULES = [
    (re.compile(r"\bKing Mihai\b"), "King Michael"),
    (re.compile(r"\bKing Mihai I\b"), "King Michael I"),
    (re.compile(r"\bKiev\b"), "Kyiv"),
    (re.compile(r"\bCernăuți\b"), "Chernivtsi"),
    (re.compile(r"\bCernihiv\b"), "Chernihiv"),
    (re.compile(r"\bCernigov\b"), "Chernihiv"),
]

QUOTE_RE = re.compile(r"„[^”]{0,600}”|“[^”]{0,600}”")
SENTINEL = "\x00Q%d\x00"


def transform(text: str, counter: Counter) -> str:
    """Aplică regulile pe partea „redacțională" a textului."""
    if not text:
        return text

    # 1. Blocul SOURCES: e ultimul și rămâne neatins.
    blocks = re.split(r"(\n{2,})", text.replace("\r\n", "\n"))
    cut = len(blocks)
    for i, b in enumerate(blocks):
        if b.strip().startswith("SOURCES:"):
            cut = i
            break
    head, tail = "".join(blocks[:cut]), "".join(blocks[cut:])

    # 2. Citatele se scot din calea regulilor și se pun la loc la final.
    quotes: list[str] = []

    def stash(m: re.Match) -> str:
        quotes.append(m.group(0))
        return SENTINEL % (len(quotes) - 1)

    head = QUOTE_RE.sub(stash, head)

    for rules, label in ((PRE_RULES, "grad militar"), (STREET_RULES, "stradă"),
                         (NUMBER_RULES, "nr.→no."), (NAME_RULES, "nume propriu")):
        for rx, rep in rules:
            head, n = rx.subn(rep, head)
            if n:
                counter[label] += n

    for i, q in enumerate(quotes):
        head = head.replace(SENTINEL % i, q)
    return head + tail


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--samples", type=int, default=8)
    args = ap.parse_args()

    locs = json.loads(LOCATIONS.read_text(encoding="utf-8"))
    counter: Counter = Counter()
    touched = 0
    samples: list[tuple[str, str, str, str]] = []

    for l in locs:
        hit = False
        for f in FIELDS:
            old = l.get(f)
            if not isinstance(old, str) or not old:
                continue
            new = transform(old, counter)
            if new != old:
                hit = True
                if len(samples) < args.samples:
                    # Prima linie în care textul chiar diferă, ca să se vadă schimbarea.
                    for a, b in zip(old.split("\n"), new.split("\n")):
                        if a != b:
                            samples.append((l["id"], f, a.strip()[:96], b.strip()[:96]))
                            break
                if not args.dry_run:
                    l[f] = new
        touched += hit

    total = sum(counter.values())
    print(f"{total} înlocuiri în {touched} fișe")
    for k, v in counter.most_common():
        print(f"  {v:>4}  {k}")
    for lid, f, a, b in samples:
        print(f"\n  {lid} · {f}\n    vechi: {a}\n    nou  : {b}")

    if args.dry_run:
        print("\n(dry-run, nimic scris)")
        return 0
    if not total:
        print("\nNimic de schimbat.")
        return 0

    tmp = LOCATIONS.with_suffix(".json.tmp")
    tmp.write_text(json.dumps(locs, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    tmp.replace(LOCATIONS)
    print(f"\n✓ Scris atomic. Rulează: python3 scripts/build_data_index.py && "
          f"python3 scripts/validate_data.py")
    return 0


if __name__ == "__main__":
    sys.exit(main())
