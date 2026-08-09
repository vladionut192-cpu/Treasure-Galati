#!/usr/bin/env python3
"""Verifică fișele de locație față de CONTENT-STYLE.md.

Ce poate: marcatorii AI, punctuația, ordinea blocurilor, lungimile.
Ce NU poate: tonul. Un text poate trece linterul și tot să sune a robot.

Rulează:
    python3 scripts/lint_content.py                 # raport pe toate
    python3 scripts/lint_content.py --id loc-8      # o singură fișă
    python3 scripts/lint_content.py --lang en       # verifică description_en
    python3 scripts/lint_content.py --strict        # exit 1 la orice abatere (CI)
    python3 scripts/lint_content.py --list-bad      # doar id-urile neconforme
    python3 scripts/lint_content.py --show loc-8    # textul, cu problemele marcate
"""
from __future__ import annotations
import argparse
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
LOCATIONS = ROOT / "galati_map" / "locations.json"

# ── §3.1 Tipare AI ────────────────────────────────────────────────────────
# (etichetă, regex, se aplică la RO, se aplică la EN)
#
# Tiparele de FORMULARE (mărturie, „nu doar… ci și", impunător …) se verifică
# doar în vocea redactorului, adică în afara citatelor „…”. Un citat din Iorgu
# Iordan sau dintr-o pisanie nu se rescrie ca să treacă linterul. Tiparele de
# PUNCTUAȚIE (em dash, ghilimele drepte, săgeți) rămân verificate peste tot,
# pentru că țin de tipografia site-ului, nu de vocea sursei citate.
QUOTE_RE = re.compile(r"„[^”]{0,600}”|“[^”]{0,600}”")
PUNCT_LABELS = {"em dash", "en dash între cuvinte", "semnul §", "săgeată în proză",
                "ghilimele drepte", "listă numerotată brută"}
AI_PATTERNS = [
    ("em dash",              r"—",                                            1, 1),
    ("en dash între cuvinte", r"(?<=\w)\s–\s(?=\w)",                           1, 1),
    ("semnul §",             r"§",                                            1, 1),
    ("săgeată în proză",     r"→",                                            1, 1),
    ("ghilimele drepte",     r'"',                                            1, 1),
    ("nu doar… ci și",       r"nu (doar|numai)[^.]{0,80}\bci (și|si)\b",       1, 0),
    ("nu este/era doar",     r"nu (este|era|a fost|erau|au fost) (doar|numai)\b", 1, 0),
    ("mărturie",             r"\bmărturi[ea]\b",                              1, 0),
    ("impunător/impresionant", r"\bimpun[ăa]tor|\bimpresionant",              1, 0),
    ("un adevărat",          r"\b(un adevărat|o adevărată)\b",                1, 0),
    ("veritabil",            r"\bveritabil",                                  1, 0),
    ("rămâne un simbol/martor", r"\brămâne un (simbol|martor|reper)\b",        1, 0),
    ("deschidere cu Astăzi", r"(?m)^Astăzi,",                                 1, 0),
    ("de-a lungul anilor",   r"\bde-a lungul (anilor|timpului|deceniilor|secolelor)\b", 1, 0),
    ("în inima",             r"\bîn inima\b",                                 1, 0),
    ("deopotrivă",           r"\bdeopotrivă\b",                               1, 0),
    ("nu întâmplător",       r"\bnu întâmplător\b",                           1, 0),
    ("miraj/farmec/forfotă", r"\bmiraj\w*|\bfarmec\w*|\bforfot\w*",           1, 0),
    ("își deschidea porțile", r"\bdeschidea porțile\b",                       1, 0),
    ("magnet pentru",        r"\bmagnet\b",                                   1, 0),
    ("trecut și prezent",    r"\btrecut(ul)? și prezent",                     1, 0),
    ("exemplu elocvent",     r"\bexemplu (elocvent|grăitor)\b",               1, 0),
    # Reziduuri de conversație cu asistentul, lăsate în date la redactare.
    # Nu sunt „ton AI", sunt replici întregi adresate proprietarului site-ului
    # (ex. loc-54: „Dacă vrei să construiești ceva… gen tururi, VR sau
    # storytelling"). Se șterg, nu se reformulează.
    ("adresare către cititor", r"\b(spune-mi|vrei să|dorești să|doriți să|să continuăm)\b", 1, 0),
    ("«Iată …» de asistent",  r"(?m)^\s*Iată\b|\bIată (principalele|câteva|cele mai)\b", 1, 0),
    ("«cele mai fascinante»", r"\bcele mai (fascinante|interesante|spectaculoase)\b", 1, 0),
    ("listă numerotată brută", r"(?m)^\s*\d+\.\s+[A-ZĂÂÎȘȚ]",                 1, 0),
    ("not merely / not just", r"\bnot (just|merely|only)\b[^.]{0,80}\bbut\b",  0, 1),
    ("testament to",         r"\b(a )?testament to\b",                        0, 1),
    ("stands as",            r"\bstands as\b",                               0, 1),
    ("nestled",              r"\bnestled\b",                                  0, 1),
    ("rich tapestry",        r"\b(rich )?tapestry\b",                         0, 1),
    ("bustling",             r"\bbustling\b",                                 0, 1),
]

HEAD_RE = re.compile(r"^[A-ZĂÂÎȘȚ0-9][^.\n]{1,60}:$")
BULLET_RE = re.compile(r"^\s*[•▪‣]\s*")


def blocks_of(text: str) -> list[str]:
    return [b.strip() for b in re.split(r"\n{2,}", text.replace("\r\n", "\n")) if b.strip()]


def is_heading(block: str) -> bool:
    lines = block.split("\n")
    return len(lines) == 1 and bool(HEAD_RE.match(lines[0].strip()))


def is_research_debt(problem: str) -> bool:
    """Datorie de cercetare, nu abatere de redactare — nu contează la conformitate."""
    return problem.startswith("cercetare:")


def defects(problems: list[str]) -> list[str]:
    return [p for p in problems if not is_research_debt(p)]


def check(loc: dict, field: str, lang: str) -> list[str]:
    """Returnează lista de probleme pentru o fișă."""
    text = (loc.get(field) or "").replace("\r\n", "\n")
    problems: list[str] = []
    if not text.strip():
        return ["(gol)"]

    # ── marcatori ──
    voice = QUOTE_RE.sub(" ", text)   # textul fără citate: vocea redactorului
    for label, pat, ro_on, en_on in AI_PATTERNS:
        if (lang == "ro" and not ro_on) or (lang == "en" and not en_on):
            continue
        haystack = text if label in PUNCT_LABELS else voice
        hits = re.findall(pat, haystack, re.I)
        if hits:
            problems.append(f"marcator: {label} ×{len(hits)}")

    # ── structură ──
    bl = blocks_of(text)
    heads = [i for i, b in enumerate(bl) if is_heading(b)]
    head_names = [bl[i].rstrip(":") for i in heads]

    if not bl:
        return problems + ["structură: fără conținut"]

    if is_heading(bl[0]):
        problems.append("structură: începe cu subtitlu, nu cu rezumat")

    if "REPERE" not in head_names:
        problems.append("structură: lipsește blocul REPERE:")
    else:
        idx = head_names.index("REPERE")
        if heads[idx] != 1:
            problems.append(f"structură: REPERE: e blocul {heads[idx] + 1}, ar trebui al 2-lea")
        # bullets imediat după
        nxt = bl[heads[idx] + 1] if heads[idx] + 1 < len(bl) else ""
        bullets = [l for l in nxt.split("\n") if BULLET_RE.match(l)]
        if len(bullets) < 4:
            problems.append(f"REPERE: {len(bullets)} bullets (minim 4)")
        elif len(bullets) > 7:
            problems.append(f"REPERE: {len(bullets)} bullets (maxim 7)")
        for b in bullets:
            v = BULLET_RE.sub("", b).strip()
            if len(v) > 90:
                problems.append(f"REPERE: bullet peste 90 car. ({len(v)})")
                break
            if ":" not in v:
                problems.append("REPERE: bullet fără etichetă „Etichetă: valoare”")
                break

    # Forma scurtă (§2.3): sub 1.500 de caractere materialul nu susține 2-4
    # secțiuni, iar a cere asta ar produce umplutură inventată. Peste prag,
    # secțiunile devin obligatorii.
    narrative = [n for n in head_names if n not in ("REPERE", "SURSE")]
    total_len = len(text)
    if total_len >= 1500 and len(narrative) < 2:
        problems.append(f"structură: {len(narrative)} secțiuni narative (minim 2 peste 1.500 car.)")
    elif len(narrative) > 4:
        problems.append(f"structură: {len(narrative)} secțiuni narative (maxim 4)")

    if "SURSE" in head_names and head_names[-1] != "SURSE":
        problems.append("structură: SURSE: nu e ultimul bloc")

    for n in narrative:
        if len(n) > 40:
            problems.append(f"subtitlu prea lung ({len(n)}): {n[:45]}")

    # ── lungimi ──
    total = len(text)
    if total < 1200:
        # NU e defect de redactare. O sursă de 900 de caractere nu poate produce
        # 1.200 fără să inventeze, iar regula anti-umplutură interzice exact asta.
        # Cele două se excludeau reciproc. Marcăm „cercetare:", iar contorul de
        # conformitate ignoră aceste intrări (vezi is_research_debt).
        problems.append(f"cercetare: {total} car. — sursă subțire, nu defect de redactare")
    elif total > 5500:
        # Plafon de lizibilitate. Ținta rămâne 4.000, dar câteva surse au
        # 6.000-9.000 de caractere de cercetare reală, iar a le forța sub 4.000
        # ar însemna să tăiem fapte (§5 interzice). Garda împotriva umpluturii
        # nu e plafonul, ci comparația cu originalul — vezi --patch. Vezi §4.
        problems.append(f"lungime: {total} car. (plafon 5.500)")

    rezumat = bl[0] if bl and not is_heading(bl[0]) else ""
    if rezumat and not (200 <= len(rezumat) <= 600):
        problems.append(f"rezumat: {len(rezumat)} car. (țintă 250-450, tolerat 200-600)")

    # ── bold ──
    nbold = len(re.findall(r"\*\*[^*\n]+\*\*", text))
    if nbold > 3:
        problems.append(f"bold: {nbold} (maxim 3)")

    return problems


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--lang", choices=["ro", "en"], default="ro")
    ap.add_argument("--id")
    ap.add_argument("--strict", action="store_true")
    ap.add_argument("--list-bad", action="store_true")
    ap.add_argument("--show")
    ap.add_argument("--patch", type=Path,
                    help="verifică un fișier de patch ({id: {description: …}}) "
                         "fără să-l aplice — pentru autoverificare înainte de scriere")
    ap.add_argument("--baseline", default="HEAD",
                    help="revizia git față de care se măsoară umplutura (implicit HEAD)")
    ap.add_argument("--allow-growth", action="store_true",
                    help="dezactivează verificarea anti-umplutură. Se folosește DOAR la "
                         "îmbogățirea din surse, unde textul crește legitim; fiecare fapt "
                         "nou trebuie să aibă citare în blocul SURSE:")
    args = ap.parse_args()

    field = "description" if args.lang == "ro" else "description_en"

    if args.patch:
        patch = json.loads(args.patch.read_text(encoding="utf-8"))
        # Baza pentru detecția de umplutură. Trebuie să fie textul ORIGINAL, luat
        # din git, nu `locations.json` de pe disc: loturile se aplică pe măsură ce
        # sosesc, iar un lot deja aplicat s-ar compara cu el însuși. Un agent care
        # apoi restaurează fapte tăiate ar fi acuzat pe nedrept de umplutură.
        current = None
        try:
            import subprocess
            out = subprocess.run(["git", "show", f"{args.baseline}:galati_map/locations.json"],
                                 cwd=ROOT, capture_output=True, text=True, timeout=60)
            if out.returncode == 0:
                current = {l["id"]: l for l in json.loads(out.stdout)}
        except Exception:
            pass
        if current is None:
            print(f"(atenție: nu am putut citi baza {args.baseline} din git; "
                  f"compar cu locations.json de pe disc)", file=sys.stderr)
            current = {l["id"]: l for l in json.loads(LOCATIONS.read_text(encoding="utf-8"))}
        bad = 0
        for lid, fields in patch.items():
            if field not in fields:
                continue
            probs = check({"id": lid, field: fields[field]}, field, args.lang)
            old = len(current.get(lid, {}).get(field) or "")
            new = len(fields[field])
            # Toleranța de 400 de caractere e structura, nu conținut: blocul
            # REPERE repetă intenționat fapte din narativ (7 bullets cu etichete
            # ≈ 350 car.), plus subtitlurile. La o fișă scurtă asta înseamnă
            # +20% fără să se fi adăugat nimic. Peste 10% ȘI peste 400 de
            # caractere, însă, e conținut nou.
            if old and new > old * 1.10 + 400 and not args.allow_growth:
                probs.append(f"umplutură: {old} → {new} car. (+{100 * new // old - 100}%), "
                             f"peste structura așteptată; rescrierea nu poate adăuga conținut")
            hard = defects(probs)
            if hard:
                bad += 1
                print(f"✗ {lid}")
            else:
                print(f"✓ {lid}")
            for p in probs:
                print(f"     {'•' if not is_research_debt(p) else 'ℹ'} {p}")
        debt = sum(1 for lid, f in patch.items() if field in f
                   and any(is_research_debt(p)
                           for p in check({"id": lid, field: f[field]}, field, args.lang)))
        print(f"\n{len(patch) - bad}/{len(patch)} conforme"
              + (f"  ({debt} cu sursă subțire — datorie de cercetare, nu abatere)" if debt else ""))
        return 1 if bad else 0

    locs = json.loads(LOCATIONS.read_text(encoding="utf-8"))

    if args.show:
        loc = next((l for l in locs if l["id"] == args.show), None)
        if not loc:
            print(f"nu există {args.show}", file=sys.stderr)
            return 1
        print(f"── {loc['id']}: {loc['title']}\n")
        print(loc.get(field) or "(gol)")
        print("\n── probleme:")
        for p in check(loc, field, args.lang) or ["(niciuna)"]:
            print(f"   • {p}")
        return 0

    targets = [l for l in locs if l["id"] == args.id] if args.id else locs
    if args.id and not targets:
        print(f"nu există {args.id}", file=sys.stderr)
        return 1

    results = {l["id"]: check(l, field, args.lang) for l in targets}
    bad = {k: v for k, v in results.items() if defects(v)}
    debt = {k for k, v in results.items() if any(is_research_debt(p) for p in v)}

    if args.list_bad:
        for k in bad:
            print(k)
        return 1 if (args.strict and bad) else 0

    if args.id:
        loc = targets[0]
        print(f"── {loc['id']}: {loc['title']}")
        for p in results[loc["id"]] or ["✓ conform"]:
            print(f"   • {p}")
        return 1 if (args.strict and bad) else 0

    # agregat
    counts: dict[str, int] = {}
    for probs in results.values():
        for p in probs:
            key = p.split(":")[0] + ": " + p.split(": ", 1)[1].split(" ×")[0] if p.startswith("marcator") else p.split(":")[0]
            counts[key] = counts.get(key, 0) + 1

    ok = len(targets) - len(bad)
    print(f"Fișe verificate ({args.lang.upper()}): {len(targets)}")
    print(f"  ✓ conforme : {ok} ({100 * ok // len(targets)}%)")
    print(f"  ✗ cu abateri: {len(bad)}")
    print(f"  ℹ sursă subțire (cercetare, nu abatere): {len(debt)}\n")
    print("Abateri pe tip (număr de fișe):")
    for k, v in sorted(counts.items(), key=lambda kv: -kv[1]):
        print(f"  {v:>4}  {k}")

    return 1 if (args.strict and bad) else 0


if __name__ == "__main__":
    sys.exit(main())
