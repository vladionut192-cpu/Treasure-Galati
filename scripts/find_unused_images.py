#!/usr/bin/env python3
"""Găsește imagini neutilizate / duplicate în assets/images/.

Verifică toate fișierele imagine din `assets/images/` (recursiv) împotriva
referințelor din:
  - galati_map/locations.json (`image`, `gallery[].src`)
  - galati_map/galati-altadata.json (`src`)
  - galati_map/tours.json (`cover`)
  - assets/articles/**/*.html (img src)
  - galati_map/index.html (img src inline)

Apoi grupează duplicatele (același conținut, hash SHA256) și raportează
spațiu recuperabil.

Rulează din rădăcina proiectului:
    python3 scripts/find_unused_images.py            # raport (read-only)
    python3 scripts/find_unused_images.py --delete   # șterge neutilizate + duplicate
    python3 scripts/find_unused_images.py --json     # output mașină-citibil
"""
import argparse
import hashlib
import json
import re
import sys
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
IMAGES_DIR = ROOT / "assets" / "images"
LOC_JSON = ROOT / "galati_map" / "locations.json"
TOURS_JSON = ROOT / "galati_map" / "tours.json"
PUBCRAWL_JSON = ROOT / "galati_map" / "galati-altadata.json"
ARTICLES_DIR = ROOT / "assets" / "articles"
INDEX_HTML = ROOT / "galati_map" / "index.html"

IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"}


def sha256_of(path: Path) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(65536), b""):
            h.update(chunk)
    return h.hexdigest()


def collect_referenced() -> set[str]:
    """Set de basename-uri (just filename) de imagini referite."""
    refs: set[str] = set()

    def add_path(p: str | None):
        if not p:
            return
        # Normalizează la basename — comparăm pe nume de fișier
        name = Path(p.split("?")[0]).name
        if name:
            refs.add(name)

    # locations.json
    if LOC_JSON.exists():
        with open(LOC_JSON, encoding="utf-8") as f:
            locs = json.load(f)
        for loc in locs:
            add_path(loc.get("image"))
            for g in loc.get("gallery", []) or []:
                if isinstance(g, dict):
                    add_path(g.get("src"))
                elif isinstance(g, str):
                    add_path(g)

    # tours.json
    if TOURS_JSON.exists():
        with open(TOURS_JSON, encoding="utf-8") as f:
            tours = json.load(f)
        for t in tours.get("tours", []):
            add_path(t.get("cover"))

    # galati-altadata.json
    if PUBCRAWL_JSON.exists():
        with open(PUBCRAWL_JSON, encoding="utf-8") as f:
            photos = json.load(f)
        for p in photos:
            add_path(p.get("src"))

    # Articole HTML — caută <img src="...">
    if ARTICLES_DIR.exists():
        img_re = re.compile(r'<img[^>]+src=["\']([^"\']+)["\']', re.IGNORECASE)
        for html_file in ARTICLES_DIR.rglob("*.html"):
            try:
                txt = html_file.read_text(encoding="utf-8", errors="ignore")
            except OSError:
                continue
            for m in img_re.finditer(txt):
                add_path(m.group(1))

    # index.html (inline img src + background-image)
    if INDEX_HTML.exists():
        txt = INDEX_HTML.read_text(encoding="utf-8")
        for m in re.finditer(r'(?:src|href)=["\']([^"\']+\.(?:jpg|jpeg|png|webp|gif|avif))["\']', txt, re.IGNORECASE):
            add_path(m.group(1))
        for m in re.finditer(r'url\(["\']?([^"\')]+\.(?:jpg|jpeg|png|webp|gif|avif))["\']?\)', txt, re.IGNORECASE):
            add_path(m.group(1))

    return refs


def collect_image_files() -> list[Path]:
    if not IMAGES_DIR.exists():
        return []
    return [
        p for p in IMAGES_DIR.rglob("*")
        if p.is_file() and p.suffix.lower() in IMAGE_EXTS
    ]


def human_size(n: int) -> str:
    for unit in ("B", "KB", "MB", "GB"):
        if n < 1024:
            return f"{n:.1f} {unit}"
        n /= 1024
    return f"{n:.1f} TB"


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--delete", action="store_true", help="Șterge fișierele neutilizate și duplicatele (rescrie referințele la canonicul).")
    parser.add_argument("--json", action="store_true", help="Output JSON pentru consum programatic.")
    parser.add_argument("--keep-duplicates", action="store_true", help="Nu șterge duplicate, doar fișiere neutilizate.")
    parser.add_argument("-y", "--yes", action="store_true", help="Skip confirmation prompt.")
    args = parser.parse_args()

    refs = collect_referenced()
    files = collect_image_files()

    # 1) Unreferenced — fișiere de pe disc care NU sunt referite
    unreferenced = [f for f in files if f.name not in refs]

    # 2) Duplicate detection — hash files că să găsim conținut identic
    by_hash: dict[str, list[Path]] = defaultdict(list)
    for f in files:
        try:
            h = sha256_of(f)
        except OSError:
            continue
        by_hash[h].append(f)

    duplicate_groups = {h: paths for h, paths in by_hash.items() if len(paths) > 1}

    # Pentru fiecare grup de duplicate, păstrăm fișierul referit (sau pe primul).
    duplicates_to_remove: list[Path] = []
    for h, paths in duplicate_groups.items():
        # Sortează: cele referite primele, apoi cea mai scurtă cale (păstrată)
        keep = None
        for p in paths:
            if p.name in refs:
                keep = p
                break
        if keep is None:
            keep = sorted(paths, key=lambda x: (len(str(x)), str(x)))[0]
        for p in paths:
            if p != keep:
                duplicates_to_remove.append(p)

    # Calculează economiile
    unref_bytes = sum(f.stat().st_size for f in unreferenced)
    dup_bytes = sum(f.stat().st_size for f in duplicates_to_remove)

    if args.json:
        result = {
            "stats": {
                "total_files": len(files),
                "unreferenced": len(unreferenced),
                "duplicate_groups": len(duplicate_groups),
                "duplicates_to_remove": len(duplicates_to_remove),
                "unref_bytes": unref_bytes,
                "dup_bytes": dup_bytes,
            },
            "unreferenced": [str(f.relative_to(ROOT)) for f in unreferenced],
            "duplicates": {
                h: [str(p.relative_to(ROOT)) for p in paths]
                for h, paths in duplicate_groups.items()
            },
        }
        print(json.dumps(result, indent=2, ensure_ascii=False))
        return

    print(f"📂 {len(files)} fișiere imagine în assets/images/")
    print(f"📋 {len(refs)} imagini referite din JSON / HTML")
    print()
    print(f"🗑️  {len(unreferenced)} neutilizate ({human_size(unref_bytes)})")
    print(f"🔁 {len(duplicate_groups)} grupuri duplicate, {len(duplicates_to_remove)} fișiere extra ({human_size(dup_bytes)})")
    total_saveable = unref_bytes + (0 if args.keep_duplicates else dup_bytes)
    print(f"💾 Total recuperabil: {human_size(total_saveable)}")

    if not args.delete:
        if unreferenced:
            print("\nPrimele 30 neutilizate:")
            for f in sorted(unreferenced, key=lambda x: -x.stat().st_size)[:30]:
                print(f"  {human_size(f.stat().st_size):>9}  {f.relative_to(ROOT)}")
        if duplicate_groups and not args.keep_duplicates:
            print("\nPrimele 20 grupuri duplicate:")
            for i, (h, paths) in enumerate(list(duplicate_groups.items())[:20], 1):
                size = paths[0].stat().st_size
                print(f"  [{i}] {human_size(size)} × {len(paths)}:")
                for p in paths:
                    marker = " (referit)" if p.name in refs else ""
                    print(f"        {p.relative_to(ROOT)}{marker}")
        print("\n💡 Rulează cu --delete pentru a șterge.")
        return

    # Delete mode — rewrite references so that all dupes point to the canonical, then unlink the rest.
    rename_map: dict[str, str] = {}  # old_basename → canonical_basename
    if not args.keep_duplicates:
        for h, paths in duplicate_groups.items():
            keep = None
            for p in paths:
                if p.name in refs:
                    keep = p
                    break
            if keep is None:
                keep = sorted(paths, key=lambda x: (len(str(x)), str(x)))[0]
            for p in paths:
                if p != keep:
                    rename_map[p.name] = keep.name

    to_delete = list(unreferenced)
    if not args.keep_duplicates:
        to_delete += duplicates_to_remove

    if not to_delete:
        print("Nimic de șters.")
        return

    total_size = unref_bytes + (0 if args.keep_duplicates else dup_bytes)
    print(f"\n🚨 Voi șterge {len(to_delete)} fișiere ({human_size(total_size)})")
    if rename_map:
        print(f"   + rescriu {len(rename_map)} referințe în JSON/HTML.")
    if not args.yes:
        confirm = input("Confirmi? [y/N] ").strip().lower()
        if confirm != "y":
            print("Anulat.")
            return

    # 1) Rewrite references in JSON + HTML files
    if rename_map:
        # JSON files: load → walk → rewrite → save
        def rewrite_in_text(text: str) -> tuple[str, int]:
            count = 0
            for old, new in rename_map.items():
                if old in text:
                    text = text.replace(old, new)
                    count += 1
            return text, count

        for json_file in (LOC_JSON, TOURS_JSON, PUBCRAWL_JSON):
            if not json_file.exists():
                continue
            txt = json_file.read_text(encoding="utf-8")
            new_txt, n = rewrite_in_text(txt)
            if new_txt != txt:
                json.loads(new_txt)  # sanity-check JSON validity
                json_file.write_text(new_txt, encoding="utf-8")
                print(f"  ✏️  {json_file.relative_to(ROOT)}: {n} referințe rescrise")

        # HTML files (articles + index)
        html_files = list(ARTICLES_DIR.rglob("*.html")) if ARTICLES_DIR.exists() else []
        if INDEX_HTML.exists():
            html_files.append(INDEX_HTML)
        html_changed = 0
        for html_file in html_files:
            try:
                txt = html_file.read_text(encoding="utf-8", errors="ignore")
            except OSError:
                continue
            new_txt, n = rewrite_in_text(txt)
            if new_txt != txt:
                html_file.write_text(new_txt, encoding="utf-8")
                html_changed += 1
        if html_changed:
            print(f"  ✏️  {html_changed} fișiere HTML actualizate")

    # 2) Delete files
    deleted = 0
    for f in to_delete:
        try:
            f.unlink()
            deleted += 1
        except OSError as e:
            print(f"  ⚠️  {f.relative_to(ROOT)}: {e}")
    print(f"✅ Șterse {deleted} fișiere ({human_size(total_size)} recuperat)")


if __name__ == "__main__":
    main()
