#!/usr/bin/env python3
"""Aplatizează @import-urile CSS într-un singur fișier — pentru producție.

De ce: `styles/main.css` e un manifest de `@import url("partial.css")` (10 fișiere
+ tokens.css imbricat). E plăcut pentru dezvoltare (editezi parțiala direct,
refresh), dar la primul load browserul trebuie să descarce main.css, să-l parseze,
ABIA APOI descoperă și cere parțialele — un round-trip în plus + 11 cereri.

Acest script înlocuiește `@import` cu conținutul efectiv (recursiv), producând un
singur fișier. Rulat în CI ÎNAINTE de deploy (ca bump-ul versiunii SW din sw.js),
suprascrie copiile din workspace — NU se comite înapoi, deci repo-ul păstrează
manifestul cu @import pentru dezvoltare locală.

Toate parțialele stau în `styles/`, deci `url(...)`-urile relative (ex.
`url(../../assets/...)`) se rezolvă identic după concatenare — nicio rescriere
de cale necesară.

Folosire:
    python3 scripts/build_css.py            # dry-run: raportează economia
    python3 scripts/build_css.py --write     # suprascrie fișierele (CI)
"""
from __future__ import annotations
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
STYLES = ROOT / "galati_map" / "styles"

# Fișierele linkuite direct de pagini (fiecare devine un bundle de sine stătător).
ENTRYPOINTS = ["main.css", "lists.css", "maps.css"]

IMPORT_RE = re.compile(r"""@import\s+url\(\s*["']?([^"')]+)["']?\s*\)\s*;""")


def flatten(path: Path, seen: set[Path]) -> str:
    """Returnează conținutul `path` cu @import-urile inlinate recursiv."""
    real = path.resolve()
    if real in seen:
        # Deja inclus în acest bundle (ex. tokens.css importat de mai multe
        # parțiale) — îl sărim ca să nu dublăm regulile.
        return ""
    seen.add(real)
    text = path.read_text(encoding="utf-8")

    def repl(m: re.Match) -> str:
        target = (path.parent / m.group(1)).resolve()
        if not target.exists():
            # Lasă @import-ul intact dacă ținta lipsește (ex. URL extern) —
            # mai bine un import rămas decât o regulă pierdută.
            return m.group(0)
        return f"\n/* ↓ inlined: {target.name} */\n" + flatten(target, seen)

    return IMPORT_RE.sub(repl, text)


# Punctuație în jurul căreia spațiul e ÎNTOTDEAUNA nesemnificativ în CSS.
# Deliberat NU includem `:` (`a :hover` ≠ `a:hover`) și nici `+ - > ~`
# (`calc(1px + 2px)` are nevoie de spații). Câștigul pierdut e neglijabil,
# riscul evitat nu.
_TRIM = {"{", "}", ";", ","}


def minify(css: str) -> str:
    """Minificare conservatoare: scoate comentariile, colapsează spațiul alb.

    Conștientă de string-uri — `content: "/* nu e comentariu */"` și `url("a,b")`
    trec neatinse. Nu atinge ordinea, nu rescrie valori, nu unește reguli:
    singurul scop e să nu mai livrăm 18 KB de comentarii și ~31 KB de indentare
    care nu se comprimă bine.
    """
    out: list[str] = []
    i, n = 0, len(css)
    pending_space = False
    while i < n:
        c = css[i]
        # Comentariu /* … */ → dispare, dar separă tokenii
        if c == "/" and i + 1 < n and css[i + 1] == "*":
            j = css.find("*/", i + 2)
            i = n if j == -1 else j + 2
            pending_space = True
            continue
        # String '…' / "…" → copiat verbatim, cu escape-uri
        if c in ("'", '"'):
            j = i + 1
            while j < n:
                if css[j] == "\\":
                    j += 2
                    continue
                if css[j] == c:
                    break
                j += 1
            if pending_space and out and out[-1] not in _TRIM:
                out.append(" ")
            pending_space = False
            out.append(css[i:j + 1])
            i = j + 1
            continue
        if c.isspace():
            pending_space = True
            i += 1
            continue
        if pending_space:
            if out and out[-1] not in _TRIM and c not in _TRIM:
                out.append(" ")
            pending_space = False
        out.append(c)
        i += 1
    return "".join(out).replace(";}", "}").strip()


def main() -> int:
    write = "--write" in sys.argv
    do_minify = "--minify" in sys.argv
    total_saved = 0
    unresolved_total = 0
    for name in ENTRYPOINTS:
        entry = STYLES / name
        if not entry.exists():
            print(f"  ⚠ {name} nu există — sărit")
            continue
        before = entry.read_text(encoding="utf-8")
        n_imports = len(IMPORT_RE.findall(before))
        if n_imports == 0:
            print(f"  • {name}: deja aplatizat (0 @import)")
            continue
        bundled = flatten(entry, set())
        remaining = len(IMPORT_RE.findall(bundled))
        unresolved_total += remaining
        flat_size = len(bundled)
        if do_minify:
            bundled = minify(bundled)
        note = f" → minificat {flat_size} → {len(bundled)}" if do_minify else ""
        print(f"  ✓ {name}: {n_imports} @import → {remaining} rămase "
              f"({len(before)} → {flat_size} bytes){note}")
        total_saved += n_imports - remaining
        if write:
            entry.write_text(bundled, encoding="utf-8")

    # Un @import nerezolvat înseamnă o parțială redenumită/ștearsă: în producție
    # ar deveni o cerere către un fișier inexistent, iar blocul acela de stiluri
    # ar dispărea tăcut. Până acum scriptul returna 0 și deploy-ul trecea verde.
    if unresolved_total:
        print(f"\n✗ {unresolved_total} @import nerezolvat(e) — parțiale lipsă. "
              f"Deploy-ul ar livra CSS incomplet.", file=sys.stderr)
        return 1

    if write:
        print(f"\n✓ Scris. {total_saved} cereri CSS eliminate la primul load.")
    else:
        print(f"\n(dry-run) {total_saved} cereri CSS s-ar elimina. "
              f"Rulează cu --write pentru a aplica (CI).")
    return 0


if __name__ == "__main__":
    sys.exit(main())
