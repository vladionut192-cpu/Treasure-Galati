#!/usr/bin/env python3
"""Generează variante WebP de calitate înaltă pentru imagini — FĂRĂ pierdere
vizibilă de calitate și FĂRĂ a atinge originalele.

Strategia (vezi assets/.htaccess): „WebP transparent prin negociere de conținut".
Pentru fiecare `foo.jpg` generăm `foo.jpg.webp`. Apache servește automat `.webp`
browserelor care trimit `Accept: image/webp` (toate cele moderne), iar restul
primesc JPEG-ul/PNG-ul original. Astfel:
  • `src`-urile din JSON/HTML rămân NEATINSE (tot `.jpg`);
  • originalul rămâne fallback + sursa de calitate maximă (lightbox full-res);
  • transferul scade ~30% (din JPEG) până la ~85% (din PNG-uri foto), la aceleași
    dimensiuni — deci ZERO pierdere de detaliu pe ecran.

Calitate: WebP q=88 (method 6) — considerat vizual fără pierdere pentru foto.
Reglabil prin --quality. Idempotent: sare peste cele deja generate și actuale.

Rulează:
    python3 scripts/optimize_images.py            # tot assets/images
    python3 scripts/optimize_images.py --quality 90
    python3 scripts/optimize_images.py --dir assets/images/local --dry-run
"""
from __future__ import annotations
import argparse
import sys
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    print("Pillow lipsește: pip install Pillow", file=sys.stderr)
    sys.exit(1)

ROOT = Path(__file__).resolve().parent.parent
SRC_EXT = {".jpg", ".jpeg", ".png"}


def human(n: int) -> str:
    for unit in ("B", "KB", "MB", "GB"):
        if n < 1024:
            return f"{n:.0f}{unit}"
        n /= 1024
    return f"{n:.0f}TB"


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--dir", default="assets/images")
    ap.add_argument("--quality", type=int, default=88)
    ap.add_argument("--dry-run", action="store_true")
    # CI: sare peste orice .webp deja existent (determinist — nu depinde de mtime,
    # care la checkout git e impredictibil). Completează doar imaginile NOI.
    ap.add_argument("--skip-existing", action="store_true")
    args = ap.parse_args()

    base = (ROOT / args.dir).resolve()
    if not base.exists():
        print(f"Nu există: {base}", file=sys.stderr)
        return 1

    src_total = web_total = 0
    made = skipped = bigger = 0
    for path in sorted(base.rglob("*")):
        if path.suffix.lower() not in SRC_EXT or path.is_symlink():
            continue
        webp = path.with_suffix(path.suffix + ".webp")  # foo.jpg → foo.jpg.webp
        # CI: sare la simpla existență. Local: sare dacă .webp e mai nou ca sursa
        # (deci o imagine actualizată cu același nume se re-generează).
        if args.skip_existing and webp.exists():
            skipped += 1
            src_total += path.stat().st_size
            web_total += webp.stat().st_size
            continue
        if webp.exists() and webp.stat().st_mtime >= path.stat().st_mtime:
            skipped += 1
            src_total += path.stat().st_size
            web_total += webp.stat().st_size
            continue
        if args.dry_run:
            made += 1
            continue
        try:
            im = Image.open(path)
            # WebP suportă alpha; pentru moduri exotice (P, CMYK) convertim.
            if im.mode in ("P", "LA"):
                im = im.convert("RGBA")
            elif im.mode == "CMYK":
                im = im.convert("RGB")
            im.save(webp, "WEBP", quality=args.quality, method=6)
        except Exception as e:
            print(f"  ✗ {path.relative_to(ROOT)}: {e}")
            continue
        # Dacă WebP nu e mai mic (imagini deja minuscule), îl ștergem ca să nu
        # servim ceva mai mare prin negociere.
        if webp.stat().st_size >= path.stat().st_size:
            webp.unlink()
            bigger += 1
            src_total += path.stat().st_size
            web_total += path.stat().st_size
            continue
        made += 1
        src_total += path.stat().st_size
        web_total += webp.stat().st_size

    print(f"\n{'(dry-run) ' if args.dry_run else ''}WebP generate: {made} | "
          f"sărite (actuale): {skipped} | fără câștig (șterse): {bigger}")
    if not args.dry_run and (src_total or web_total):
        saved = src_total - web_total
        pct = 100 * saved / src_total if src_total else 0
        print(f"Transfer (unde se servește WebP): {human(src_total)} → "
              f"{human(web_total)}  (−{pct:.0f}%)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
