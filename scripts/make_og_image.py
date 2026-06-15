"""
Generează imaginea OG default pentru SEO + share pe social.

Design: split-panel ca o carte de vizită.
  - Panou stânga (40%): accent verde închis cu sigiliul în crem
  - Panou dreapta (60%): paper background cu titlu + tagline + domeniu
  - Cromatică aliniată cu app-ul (--paper, --accent-deep, --ink)

Output: assets/og-default.jpg (1200x630, ~80-150 KB)
"""

from __future__ import annotations
import subprocess
import sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageOps

ROOT = Path(__file__).resolve().parent.parent
LOGO_SVG = ROOT / "assets" / "logo-sigiliu-v2.svg"
OUT      = ROOT / "assets" / "og-default.jpg"

W, H = 1200, 630
LEFT_PANEL_W = int(W * 0.42)   # ~504px
LOGO_SIZE = 280

# Cromatica app-ului
PAPER       = (239, 238, 234)
PAPER_DEEP  = (227, 225, 218)
INK         = (15, 15, 14)
INK_SOFT    = (42, 42, 40)
MUTED       = (138, 135, 128)
ACCENT      = (44, 97, 87)
ACCENT_DEEP = (29, 67, 60)
ACCENT_SOFT = (220, 230, 225)

FONT_BOLD = "/System/Library/Fonts/HelveticaNeue.ttc"
FONT_SANS = "/System/Library/Fonts/Helvetica.ttc"


def rasterize_logo(size: int) -> Image.Image:
    """Use qlmanage (macOS QuickLook) pentru a rasteriza SVG-ul în PNG."""
    out_dir = Path("/tmp")
    subprocess.run(
        ["qlmanage", "-t", "-s", str(size * 2), "-o", str(out_dir), "-f", "1", str(LOGO_SVG)],
        capture_output=True, check=True,
    )
    raster = out_dir / f"{LOGO_SVG.name}.png"
    img = Image.open(raster).convert("RGBA")
    img.thumbnail((size, size), Image.LANCZOS)
    return img


def colored_logo(size: int, color: tuple[int, int, int]) -> Image.Image:
    """Recolorează logo-ul rasterizat în culoarea dorită (qlmanage produce
    fundal alb opac, deci facem invert pe luminance pentru mască)."""
    raw = rasterize_logo(size * 2)
    raw.thumbnail((size, size), Image.LANCZOS)
    gray = raw.convert("L")
    mask = ImageOps.invert(gray)
    out = Image.new("RGBA", raw.size, (*color, 0))
    out.putalpha(mask)
    return out


def main() -> int:
    print(f"[1/3] Canvas split-panel")
    canvas = Image.new("RGB", (W, H), PAPER)
    draw = ImageDraw.Draw(canvas)
    # Panou stânga: accent-deep solid
    draw.rectangle([0, 0, LEFT_PANEL_W, H], fill=ACCENT_DEEP)
    # Linie subțire de separare în accent (visual touch)
    draw.rectangle([LEFT_PANEL_W, 0, LEFT_PANEL_W + 2, H], fill=ACCENT)

    print(f"[2/3] Logo (qlmanage rasterize → recolor)")
    logo = colored_logo(LOGO_SIZE, PAPER)
    # Centrăm logo-ul în panoul stâng, ușor mai sus de centru optic
    lx = (LEFT_PANEL_W - LOGO_SIZE) // 2
    ly = (H - LOGO_SIZE) // 2 - 10
    canvas.paste(logo, (lx, ly), logo)

    # Sub logo: o etichetă mică
    label_font = ImageFont.truetype(FONT_BOLD, 16)
    label_text = "SIGILIUL HERITAGE GALAȚI"
    bbox = draw.textbbox((0, 0), label_text, font=label_font)
    lbl_w = bbox[2] - bbox[0]
    draw.text(
        ((LEFT_PANEL_W - lbl_w) // 2, ly + LOGO_SIZE + 28),
        label_text,
        fill=(*PAPER, 200),
        font=label_font,
    )

    print(f"[3/3] Text panel dreapta")
    eyebrow_font = ImageFont.truetype(FONT_BOLD, 22)
    title_font   = ImageFont.truetype(FONT_BOLD, 78)
    sub_font     = ImageFont.truetype(FONT_SANS, 28)
    bold_sub     = ImageFont.truetype(FONT_BOLD, 28)
    domain_font  = ImageFont.truetype(FONT_BOLD, 18)

    text_x = LEFT_PANEL_W + 60
    text_right = W - 60

    # Eyebrow
    draw.text(
        (text_x, 130),
        "PATRIMONIU · GALAȚI · 1445 — PREZENT",
        fill=ACCENT,
        font=eyebrow_font,
    )

    # Title (two-line layout)
    draw.text(
        (text_x, 175),
        "Heritage",
        fill=INK,
        font=title_font,
    )
    draw.text(
        (text_x, 175 + 90),
        "Galați",
        fill=INK,
        font=title_font,
    )

    # Decorative rule under title (accent)
    draw.rectangle(
        [text_x, 175 + 90 + 100, text_x + 80, 175 + 90 + 102],
        fill=ACCENT,
    )

    # Tagline
    draw.text(
        (text_x, 175 + 90 + 120),
        "Hartă interactivă · 148 de locații",
        fill=INK_SOFT,
        font=sub_font,
    )
    draw.text(
        (text_x, 175 + 90 + 158),
        "povești · cronologie · fototecă",
        fill=INK_SOFT,
        font=sub_font,
    )

    # Domain bottom-right
    draw.text(
        (text_right, H - 45),
        "ionpeblog.ro/galati_map",
        fill=MUTED,
        font=domain_font,
        anchor="rs",
    )

    # Save
    canvas.save(OUT, "JPEG", quality=88, optimize=True, progressive=True)
    kb = OUT.stat().st_size / 1024
    print(f"\n  Output: {OUT.relative_to(ROOT)} ({kb:.0f} KB, {W}×{H})")
    return 0


if __name__ == "__main__":
    sys.exit(main())
