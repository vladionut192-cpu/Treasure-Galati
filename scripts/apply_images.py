#!/usr/bin/env python3
"""Aplică deciziile din `scripts/image_decisions.json` (exportat din
image_review.html):
- descarcă fiecare imagine selectată în `assets/images/commons/`
- actualizează `locations.json` cu câmpul `image` și `commons_credit`
- rulează `build.py` la final ca să sincronizeze `index.html`

Convenție de nume: `commons_<pinId>_<fileslug>.jpg` — slug e ultima parte
din titlul Commons, transliterat și cu max. 60 caractere.
"""
import json
import re
import subprocess
import unicodedata
import urllib.parse
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DECISIONS = Path(__file__).resolve().parent / "image_decisions.json"
LOC_JSON = ROOT / "galati_map" / "locations.json"
IMG_DIR = ROOT / "assets" / "images" / "commons"


def slugify(text):
    text = unicodedata.normalize("NFKD", text)
    text = "".join(c for c in text if not unicodedata.combining(c))
    text = re.sub(r"[^a-zA-Z0-9]+", "-", text).strip("-").lower()
    return text[:60]


THUMB_WIDTH = 1280


def thumb_url(file_title, width=THUMB_WIDTH):
    """Construiește URL-ul de thumbnail Wikimedia (Special:FilePath)."""
    name = file_title.replace("File:", "").replace(" ", "_")
    return f"https://commons.wikimedia.org/wiki/Special:FilePath/{urllib.parse.quote(name)}?width={width}"


def download(url, dest):
    """Descarcă URL-ul la dest. Raise on failure."""
    r = subprocess.run(
        ["curl", "-sSL", "-A", "TreasureGalati/1.0", "-o", str(dest), url],
        capture_output=True, text=True, timeout=60,
    )
    if r.returncode != 0:
        raise RuntimeError(f"curl failed: {r.stderr}")
    if not dest.exists() or dest.stat().st_size < 1000:
        raise RuntimeError(f"image too small or missing: {dest.stat().st_size if dest.exists() else 'missing'}")


def main():
    if not DECISIONS.exists():
        print(f"❌ Lipsește {DECISIONS}. Generează-l din image_review.html ('Descarcă image_decisions.json').")
        raise SystemExit(1)

    with open(DECISIONS, encoding="utf-8") as f:
        decisions = json.load(f)

    with open(LOC_JSON, encoding="utf-8") as f:
        locations = json.load(f)
    locations_by_id = {loc["id"]: loc for loc in locations}

    IMG_DIR.mkdir(parents=True, exist_ok=True)

    applied = 0
    skipped = 0
    errors = []

    for pin_id, decision in decisions.items():
        if decision == "skip":
            skipped += 1
            continue
        loc = locations_by_id.get(pin_id)
        if not loc:
            errors.append(f"{pin_id}: pin necunoscut")
            continue

        d = decision
        file_short = d["file"].replace("File:", "")
        slug = slugify(file_short.rsplit(".", 1)[0])
        ext = file_short.rsplit(".", 1)[-1].lower()
        filename = f"commons_{pin_id}_{slug}.{ext}"
        dest = IMG_DIR / filename

        if not dest.exists():
            try:
                print(f"⬇  {pin_id}: {file_short} (thumb {THUMB_WIDTH}px)")
                download(thumb_url(d["file"]), dest)
            except Exception as e:
                errors.append(f"{pin_id}: download fail - {e}")
                if dest.exists():
                    dest.unlink()
                continue

        rel_path = f"../assets/images/commons/{filename}"
        loc["image"] = rel_path
        loc["commons_credit"] = {
            "file": file_short,
            "license": d.get("license", ""),
            "credit": re.sub(r"<[^>]+>", "", d.get("credit", "")).strip(),
            "source_url": d.get("descriptionurl", ""),
            "date": d.get("date", ""),
            "uploader": d.get("uploader", ""),
        }
        applied += 1

    with open(LOC_JSON, "w", encoding="utf-8") as f:
        json.dump(locations, f, ensure_ascii=False, indent=2)

    print(f"\n✅ {applied} imagini aplicate (descărcate în {IMG_DIR.relative_to(ROOT)}/)")
    print(f"⏭  {skipped} sărite manual")
    if errors:
        print(f"❌ {len(errors)} erori:")
        for e in errors:
            print(f"    {e}")

    # Auto-run build pentru sync index.html
    print(f"\n🔧 Rulez build.py să sincronizez index.html...")
    r = subprocess.run(["python3", str(ROOT / "scripts" / "build.py")], capture_output=True, text=True)
    print(r.stdout)
    if r.returncode != 0:
        print(f"⚠️  Build eșuat: {r.stderr}")


if __name__ == "__main__":
    main()
