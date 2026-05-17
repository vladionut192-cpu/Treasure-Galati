"""
Build a deploy archive for cPanel.

Pachetează:
  - galati_map/     (fără _admin/, fără geocode_cache.json)
  - assets/         (logo + downloads + toate imaginile, fără battle/)

Ignoră: .DS_Store, *.pyc, __pycache__/.

Output: deploy/heritage-galati-deploy.zip
"""

from __future__ import annotations
import os
import sys
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT_DIR = ROOT / "deploy"
OUT_FILE = OUT_DIR / "heritage-galati-deploy.zip"

# Foldere/files care intră în arhivă (relative la ROOT)
INCLUDE = [
    "galati_map",
    "assets",
]

# Excluse din includere (sub-paths relative la ROOT)
EXCLUDE_DIRS = {
    "galati_map/_admin",
}
# Pattern-uri de fișiere de exclus
EXCLUDE_FILES_EXACT = {
    "galati_map/geocode_cache.json",
    "galati_map/manual_overrides.json",
    "galati_map/unplaced_locations.json",
}
EXCLUDE_NAMES = {".DS_Store", "Thumbs.db"}
EXCLUDE_SUFFIXES = {".pyc", ".pyo", ".swp", ".log"}


def should_skip(rel_path: Path) -> bool:
    s = str(rel_path).replace(os.sep, "/")
    if s in EXCLUDE_FILES_EXACT:
        return True
    for d in EXCLUDE_DIRS:
        if s == d or s.startswith(d + "/"):
            return True
    if rel_path.name in EXCLUDE_NAMES:
        return True
    if rel_path.suffix in EXCLUDE_SUFFIXES:
        return True
    if any(part == "__pycache__" for part in rel_path.parts):
        return True
    return False


def auto_bump_sw_cache() -> str | None:
    """Auto-incrementează versiunea SW (`tg-vXX` → `tg-v{XX+1}`) la fiecare build.

    Evită bug-ul recurent „de ce nu se actualizează site-ul după modificări?"
    Returnează noua versiune (sau None dacă nu a fost modificat).
    """
    import re
    sw = ROOT / "galati_map" / "sw.js"
    if not sw.exists():
        return None
    content = sw.read_text(encoding="utf-8")
    m = re.search(r"const CACHE_VERSION = 'tg-v(\d+)'", content)
    if not m:
        return None
    old_n = int(m.group(1))
    new_n = old_n + 1
    new_content = content.replace(
        f"'tg-v{old_n}'", f"'tg-v{new_n}'", 1
    )
    sw.write_text(new_content, encoding="utf-8")
    return f"tg-v{old_n} → tg-v{new_n}"


def validate_json_files() -> int:
    """Validează toate JSON-urile din galati_map/. Returnează nr. erori găsite.

    Bug-uri vizate: ghilimele românești ASCII neescapate, duplicate IDs,
    referințe orfane (article paths).
    """
    import json as jsonlib
    errors = 0
    json_files = sorted((ROOT / "galati_map").glob("*.json")) + sorted(
        (ROOT / "galati_map").glob("*.geojson")
    )
    for f in json_files:
        try:
            jsonlib.loads(f.read_text(encoding="utf-8"))
        except jsonlib.JSONDecodeError as e:
            print(f"  ✗ JSON invalid: {f.relative_to(ROOT)} — line {e.lineno} col {e.colno}: {e.msg}")
            errors += 1
    # locations.json: check for duplicate IDs / articles
    loc_path = ROOT / "galati_map" / "locations.json"
    if loc_path.exists():
        try:
            data = jsonlib.loads(loc_path.read_text(encoding="utf-8"))
            locs = data if isinstance(data, list) else data.get("locations", [])
            from collections import Counter
            ids = Counter(L.get("id") for L in locs)
            dup_ids = [k for k, v in ids.items() if v > 1]
            if dup_ids:
                print(f"  ✗ locations.json: duplicate IDs: {dup_ids}")
                errors += 1
            arts = Counter(L.get("article") for L in locs if L.get("article"))
            dup_arts = [k for k, v in arts.items() if v > 1]
            if dup_arts:
                print(f"  ✗ locations.json: duplicate article paths: {dup_arts[:3]}{'…' if len(dup_arts) > 3 else ''}")
                errors += 1
        except Exception as e:
            print(f"  ✗ locations.json analysis failed: {e}")
            errors += 1
    return errors


def main() -> int:
    # 1. Validate JSON files (fail fast)
    print("Validating JSON files…")
    n_errors = validate_json_files()
    if n_errors:
        print(f"\n✗ Build BLOCKED: {n_errors} JSON errors. Fix and retry.")
        return 1
    print("  ✓ All JSON files valid")

    # 2. Generate static SEO pages (Open Graph + sitemap) for share previews
    print("Generating SEO pages…")
    import subprocess
    seo_result = subprocess.run(
        [sys.executable, str(ROOT / "scripts" / "generate_static_pages.py")],
        cwd=ROOT, capture_output=True, text=True,
    )
    if seo_result.returncode != 0:
        print(f"  ⚠ SEO generation failed (continuing anyway): {seo_result.stderr.strip()}")
    else:
        # Show last line (count summary)
        last = seo_result.stdout.strip().split("\n")[-1]
        print(f"  ✓ {last}")

    # 3. Auto-bump SW cache version
    bump = auto_bump_sw_cache()
    if bump:
        print(f"  ✓ SW cache: {bump}")

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    if OUT_FILE.exists():
        OUT_FILE.unlink()

    file_count = 0
    total_bytes = 0

    with zipfile.ZipFile(OUT_FILE, "w", zipfile.ZIP_DEFLATED, compresslevel=6) as zf:
        for top in INCLUDE:
            top_path = ROOT / top
            if not top_path.exists():
                print(f"[skip] Missing: {top}")
                continue
            for path in sorted(top_path.rglob("*")):
                rel = path.relative_to(ROOT)
                if should_skip(rel):
                    continue
                if path.is_file():
                    zf.write(path, arcname=str(rel))
                    file_count += 1
                    total_bytes += path.stat().st_size

    mb = total_bytes / 1024 / 1024
    zip_mb = OUT_FILE.stat().st_size / 1024 / 1024
    print(f"  Files: {file_count}")
    print(f"  Raw size: {mb:.1f} MB")
    print(f"  Archive: {OUT_FILE.relative_to(ROOT)} ({zip_mb:.1f} MB)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
