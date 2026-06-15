#!/usr/bin/env python3
"""Self-host fonturile (GDPR + performanță) — descarcă woff2 de la Google Fonts
și generează vendor/fonts/fonts.css local.

De ce: încărcarea de la fonts.googleapis.com adaugă 2 conexiuni externe (DNS +
TLS spre googleapis + gstatic) la primul load și trimite IP-ul vizitatorului la
Google (problematic GDPR în UE). Self-hosting → zero requesturi terțe, cache sub
controlul nostru (vezi galati_map/vendor/.htaccess: imutabil 1 an).

Păstrăm DOAR subseturile `latin` + `latin-ext` (latin-ext acoperă ă/î/ș/ț/â).
Vollkorn SC a fost scos — `--font-slab` nu e folosit nicăieri în CSS.

Rulează o singură dată (sau când schimbi familiile/greutățile):
    python3 scripts/fetch_fonts.py
"""
from __future__ import annotations
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "galati_map" / "vendor" / "fonts"
UA = "Mozilla/5.0 (X11; Linux x86_64; rv:121.0) Gecko/20100101 Firefox/121.0"

# Familiile + greutățile EXACTE folosite în cod (vezi tokens.css). Parametrul e
# partea de după `family=` din URL-ul css2.
FAMILIES = {
    "Playfair Display": "Playfair+Display:wght@700;800",
    "Vollkorn":         "Vollkorn:ital,wght@0,400;0,600;0,700;1,400",
    "DM Sans":          "DM+Sans:wght@400;500;600;700",
    "IBM Plex Mono":    "IBM+Plex+Mono:wght@400;500",
}
KEEP_SUBSETS = {"latin", "latin-ext"}

BLOCK_RE = re.compile(r"/\*\s*([\w-]+)\s*\*/\s*(@font-face\s*\{.*?\})", re.S)
FIELD = lambda name, block: (re.search(rf"{name}:\s*([^;]+);", block) or [None, ""])[1].strip()
URL_RE = re.compile(r"url\((https://[^)]+\.woff2)\)")


def slug(s: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")


def fetch(url: str) -> bytes:
    # curl, nu urllib: pe unele instalări Python lipsesc certificatele root.
    return subprocess.run(
        ["curl", "-sSL", "--max-time", "30", "-A", UA, url],
        check=True, capture_output=True,
    ).stdout


def main() -> int:
    OUT.mkdir(parents=True, exist_ok=True)
    css_out: list[str] = [
        "/* Fonturi self-hosted — generat de scripts/fetch_fonts.py. NU edita manual. */\n"
    ]
    total_files = 0
    for family, param in FAMILIES.items():
        url = f"https://fonts.googleapis.com/css2?family={param}&display=swap"
        css = fetch(url).decode("utf-8")
        kept = 0
        for subset, block in BLOCK_RE.findall(css):
            if subset not in KEEP_SUBSETS:
                continue
            weight = FIELD("font-weight", block)
            style = FIELD("font-style", block)
            urange = FIELD("unicode-range", block)
            m = URL_RE.search(block)
            if not m:
                continue
            woff_url = m.group(1)
            ital = "-italic" if style == "italic" else ""
            fname = f"{slug(family)}-{weight}{ital}-{subset}.woff2"
            (OUT / fname).write_bytes(fetch(woff_url))
            total_files += 1
            kept += 1
            css_out.append(
                "@font-face {\n"
                f"  font-family: '{family}';\n"
                f"  font-style: {style};\n"
                f"  font-weight: {weight};\n"
                "  font-display: swap;\n"
                f"  src: url({fname}) format('woff2');\n"
                f"  unicode-range: {urange};\n"
                "}"
            )
        print(f"  ✓ {family}: {kept} fișiere")
    (OUT / "fonts.css").write_text("\n".join(css_out) + "\n", encoding="utf-8")
    print(f"\n✓ {total_files} woff2 + fonts.css → {OUT.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
