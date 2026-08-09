#!/usr/bin/env python3
"""Generează miniaturi WebP de 480px pentru imaginile folosite ca THUMBNAIL.

De ce, pe scurt (audit 2026-08): lista din sidebar și popup-urile hărții afișau
imaginea ORIGINALĂ (până la 1920×1280) într-un chenar de ~367×99 px. Chiar și cu
negocierea WebP din `assets/.htaccess`, asta însemna ~218 KB per miniatură.
La 480px lățime aceeași imagine are ~29 KB — cu 87% mai puțin, la aceeași
calitate percepută (chenarul are 367px CSS, deci 480px acoperă și ecranele 1.3x).

Diferența față de `optimize_images.py`: acela produce `foo.jpg.webp`, o variantă
de FORMAT la aceeași rezoluție, servită transparent prin `Accept: image/webp`.
Aici producem o imagine ALTA (mai mică), deci trebuie un URL distinct — nu se
poate face prin negociere de conținut.

Convenție de cale (transformare pură, fără ambiguitate):
    assets/images/local/foo.jpg  →  assets/thumbs/local/foo.jpg.webp
adică `/assets/images/` → `/assets/thumbs/` + sufix `.webp`. Extensia originală
se păstrează în nume ca să nu existe coliziuni între `foo.jpg` și `foo.png`.
JS-ul face exact aceeași transformare (vezi `thumbUrl()` din core-map.js) și are
fallback pe `onerror` către original, deci o miniatură lipsă nu strică nimic.

NU se generează miniaturi pentru galerii sau pentru lightbox — acolo se vrea
rezoluția mare. Doar pentru câmpurile care ajung în listă/popup/carduri.

Rulează:
    python3 scripts/build_thumbnails.py
    python3 scripts/build_thumbnails.py --width 480 --quality 82
    python3 scripts/build_thumbnails.py --skip-existing     # CI
    python3 scripts/build_thumbnails.py --dry-run
"""
from __future__ import annotations
import argparse
import json
import sys
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    print("Pillow lipsește: pip install Pillow", file=sys.stderr)
    sys.exit(1)

ROOT = Path(__file__).resolve().parent.parent
MAP = ROOT / "galati_map"
IMAGES_DIR = "assets/images/"
THUMBS_DIR = "assets/thumbs/"


def human(n: float) -> str:
    for unit in ("B", "KB", "MB", "GB"):
        if n < 1024:
            return f"{n:.0f}{unit}"
        n /= 1024
    return f"{n:.0f}TB"


def norm(src: str | None) -> str | None:
    """`../assets/images/x/foo.jpg` → `assets/images/x/foo.jpg` (relativ la ROOT)."""
    if not src or not isinstance(src, str):
        return None
    s = src.lstrip("./")
    while s.startswith("../"):
        s = s[3:]
    if not s.startswith(IMAGES_DIR):
        return None          # imagini din afara assets/images (ex. absolute) — ignorate
    return s


def collect() -> set[str]:
    """Adună doar imaginile care se randează ca miniatură."""
    out: set[str] = set()

    def add(v):
        n = norm(v)
        if n:
            out.add(n)

    # locations.json → `image` (card în listă + popup pe hartă + hero în detaliu)
    locs = json.loads((MAP / "locations.json").read_text(encoding="utf-8"))
    for l in locs:
        add(l.get("image"))

    # tours.json / treasure_hunts.json → coperțile cardurilor
    for fname, key in (("tours.json", "tours"), ("treasure_hunts.json", "hunts")):
        p = MAP / fname
        if not p.exists():
            continue
        data = json.loads(p.read_text(encoding="utf-8"))
        items = data.get(key, data) if isinstance(data, dict) else data
        for it in items or []:
            add(it.get("cover"))

    # galati-altadata.json → bulinele portocalii (tooltip + card mic)
    p = MAP / "galati-altadata.json"
    if p.exists():
        data = json.loads(p.read_text(encoding="utf-8"))
        photos = data.get("photos", data) if isinstance(data, dict) else data
        for ph in photos or []:
            add(ph.get("src"))

    return out


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--width", type=int, default=480)
    ap.add_argument("--quality", type=int, default=82)
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--skip-existing", action="store_true",
                    help="CI: sare la simpla existență (determinist, mtime-ul de la "
                         "checkout git e impredictibil)")
    ap.add_argument("--prune", action="store_true",
                    help="șterge miniaturile fără sursă în date")
    args = ap.parse_args()

    wanted = collect()
    print(f"Imagini folosite ca miniatură: {len(wanted)}")

    made = skipped = missing = failed = 0
    src_total = thumb_total = 0
    expected: set[Path] = set()

    for rel in sorted(wanted):
        src = ROOT / rel
        dst = ROOT / (THUMBS_DIR + rel[len(IMAGES_DIR):] + ".webp")
        expected.add(dst)
        if not src.exists():
            missing += 1
            continue
        if dst.exists() and (args.skip_existing or dst.stat().st_mtime >= src.stat().st_mtime):
            skipped += 1
            src_total += src.stat().st_size
            thumb_total += dst.stat().st_size
            continue
        if args.dry_run:
            made += 1
            continue
        try:
            im = Image.open(src)
            if im.mode in ("P", "LA"):
                im = im.convert("RGBA")
            elif im.mode == "CMYK":
                im = im.convert("RGB")
            # Nu mărim niciodată o imagine mică — doar micșorăm.
            if im.width > args.width:
                h = round(im.height * args.width / im.width)
                im = im.resize((args.width, h), Image.LANCZOS)
            dst.parent.mkdir(parents=True, exist_ok=True)
            im.save(dst, "WEBP", quality=args.quality, method=6)
        except Exception as e:
            print(f"  ✗ {rel}: {e}")
            failed += 1
            continue
        made += 1
        src_total += src.stat().st_size
        thumb_total += dst.stat().st_size

    pruned = 0
    if args.prune:
        troot = ROOT / THUMBS_DIR.rstrip("/")
        if troot.exists():
            for p in troot.rglob("*.webp"):
                if p not in expected:
                    if not args.dry_run:
                        p.unlink()
                    pruned += 1

    print(f"{'(dry-run) ' if args.dry_run else ''}Miniaturi generate: {made} | "
          f"sărite: {skipped} | sursă lipsă: {missing} | eșuate: {failed}"
          + (f" | șterse: {pruned}" if args.prune else ""))
    if src_total:
        saved = src_total - thumb_total
        print(f"Transfer miniaturi: {human(src_total)} → {human(thumb_total)}  "
              f"(−{100 * saved / src_total:.0f}%)")
    # Sursele lipsă sunt deja raportate de validate_data.py; aici nu blocăm.
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
