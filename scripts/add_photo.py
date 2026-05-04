#!/usr/bin/env python3
"""Adaugă una sau mai multe imagini la un pin din `locations.json`.

Workflow tipic:
    # 1 imagine — devine primară (câmpul `image`)
    python3 scripts/add_photo.py loc-99 ~/Desktop/cuza.jpg

    # mai multe imagini — prima primară, restul în `gallery[]`
    python3 scripts/add_photo.py loc-99 photo1.jpg photo2.jpg photo3.jpg

    # explicit în galerie, fără atinge primara
    python3 scripts/add_photo.py --gallery loc-99 detail.jpg

    # cu credit (autor + sursă) — păstrat în câmpul `local_credit`
    python3 scripts/add_photo.py loc-99 photo.jpg \\
        --credit "foto: Vlad Popescu, 2024" \\
        --source "https://example.com/photo"

Imaginile sunt:
- redimensionate la max 1280px lățime (cu `sips` pe macOS, fallback no-op)
- copiate în `assets/images/local/<pin-id>_<seq>.jpg`
- `image` și `gallery[]` actualizate în `locations.json`
- `index.html` resincronizat automat la final
"""
import argparse
import json
import re
import shutil
import subprocess
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
LOC_JSON = ROOT / "galati_map" / "locations.json"
IMG_DIR = ROOT / "assets" / "images" / "local"
MAX_WIDTH = 1280


def slugify(text):
    text = unicodedata.normalize("NFKD", text)
    text = "".join(c for c in text if not unicodedata.combining(c))
    text = re.sub(r"[^a-zA-Z0-9]+", "-", text).strip("-").lower()
    return text[:40]


def has_sips():
    try:
        subprocess.run(["sips", "--help"], capture_output=True, timeout=2)
        return True
    except (FileNotFoundError, subprocess.TimeoutExpired):
        return False


def optimize(src, dest, max_width=MAX_WIDTH):
    """Resize la max_width dacă mai mare. Folosește `sips` (macOS) sau fallback la copy."""
    if has_sips():
        # Citește lățimea curentă
        r = subprocess.run(
            ["sips", "-g", "pixelWidth", str(src)],
            capture_output=True, text=True,
        )
        m = re.search(r"pixelWidth:\s*(\d+)", r.stdout)
        width = int(m.group(1)) if m else 0
        if width > max_width:
            # Redimensionare cu păstrarea aspectului
            subprocess.run(
                ["sips", "--resampleWidth", str(max_width),
                 "--setProperty", "format", "jpeg",
                 "--setProperty", "formatOptions", "85",
                 str(src), "--out", str(dest)],
                capture_output=True, check=True,
            )
            return f"{width}px → {max_width}px"
        else:
            shutil.copy2(src, dest)
            return f"{width}px (copiat ca atare)"
    else:
        shutil.copy2(src, dest)
        return "copiat (sips lipsește, fără redimensionare)"


def next_filename(pin_id, ext):
    """Returnează primul nume liber: pin-id_01.jpg, pin-id_02.jpg, ..."""
    for n in range(1, 100):
        candidate = IMG_DIR / f"{pin_id}_{n:02d}.{ext}"
        if not candidate.exists():
            return candidate
    raise RuntimeError(f"Prea multe fișiere pentru {pin_id}")


def main():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("pin_id", help="ID-ul pinului (ex. loc-99)")
    p.add_argument("paths", nargs="+", type=Path, help="Una sau mai multe imagini")
    p.add_argument("--gallery", action="store_true",
                   help="Adaugă DOAR în gallery[], nu atinge câmpul `image` primar")
    p.add_argument("--replace", action="store_true",
                   help="Înlocuiește imaginea primară (chiar dacă pinul are deja una)")
    p.add_argument("--credit", default="", help="Atribuire foto (ex. 'foto: X, 2024')")
    p.add_argument("--source", default="", help="URL sursă (opțional)")
    p.add_argument("--no-build", action="store_true", help="Nu rula build.py la final")
    args = p.parse_args()

    if not args.pin_id.startswith("loc-"):
        p.error(f"pin_id invalid: {args.pin_id} (format așteptat: loc-N)")

    for path in args.paths:
        if not path.exists():
            p.error(f"Fișier inexistent: {path}")

    with open(LOC_JSON, encoding="utf-8") as f:
        locations = json.load(f)
    loc = next((x for x in locations if x["id"] == args.pin_id), None)
    if not loc:
        p.error(f"Pin necunoscut: {args.pin_id}")

    IMG_DIR.mkdir(parents=True, exist_ok=True)

    if args.gallery and args.replace:
        p.error("--gallery și --replace sunt mutual exclusive")

    set_primary_first = (not args.gallery) and (args.replace or not loc.get("image"))
    added = []

    for i, src in enumerate(args.paths):
        ext = src.suffix.lstrip(".").lower()
        if ext in ("jpeg", "jpg"):
            ext = "jpg"
        elif ext not in ("png", "webp", "gif"):
            print(f"⚠️  {src.name}: extensie {ext!r} neuzuală — copiez fără modificări")

        dest = next_filename(args.pin_id, ext)
        result = optimize(src, dest)
        rel = f"../assets/images/local/{dest.name}"
        size_kb = dest.stat().st_size / 1024
        print(f"📷 {src.name} → {dest.name} ({result}, {size_kb:.0f} KB)")
        added.append((rel, src.name))

        if set_primary_first and i == 0:
            loc["image"] = rel
            print(f"   ↪ setat ca imagine primară pe {args.pin_id}")
        else:
            gal = loc.setdefault("gallery", [])
            entry = {"src": rel, "alt": src.stem.replace("-", " ").replace("_", " ")}
            gal.append(entry)
            print(f"   ↪ adăugat în gallery (index {len(gal)})")

    # Atribuire — dacă există, o salvăm într-un câmp dedicat
    if args.credit or args.source:
        credits = loc.setdefault("local_credits", [])
        credits.append({
            "files": [name for _, name in added],
            "credit": args.credit,
            "source": args.source,
        })

    with open(LOC_JSON, "w", encoding="utf-8") as f:
        json.dump(locations, f, ensure_ascii=False, indent=2)
    print(f"\n✅ {len(added)} imagine{'a' if len(added)>1 else ''} adăugat{'e' if len(added)>1 else 'ă'} la {args.pin_id} ({loc['title']})")

    if not args.no_build:
        print("\n🔧 Rulez build.py să sincronizez index.html...")
        r = subprocess.run(["python3", str(ROOT / "scripts" / "build.py")],
                           capture_output=True, text=True)
        print(r.stdout)


if __name__ == "__main__":
    main()
