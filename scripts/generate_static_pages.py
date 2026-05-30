#!/usr/bin/env python3
"""Generate static HTML pages for each location/tour/hunt — pentru SEO + share preview.

De ce: Facebook, Twitter, WhatsApp NU execută JavaScript când scrape-uiesc o pagină
pentru preview. Văd doar HTML-ul static din `<head>`. Pentru deep-link-urile noastre
SPA (`?loc=loc-113`), nu ar arăta preview corect.

Soluție pentru cPanel (static hosting): generăm câte un fișier HTML minim pentru
fiecare locație/tur/hunt, cu Open Graph tags + JSON-LD. Fișierul redirectează
JS-side spre SPA (`/galati_map/?loc=<id>`).

Output:
  galati_map/loc/<id>.html      (~226 fișiere)
  galati_map/tour/<id>.html     (~13 fișiere)
  galati_map/hunt/<id>.html     (~4 fișiere)
  galati_map/sitemap.xml        (index pentru Google)

Rulează:
  python3 scripts/generate_static_pages.py
"""
from __future__ import annotations
import json
import os
import re
import unicodedata
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
GMAP = ROOT / "galati_map"
# Override via env var when moving to a different host (e.g. heritage-galati.ro).
BASE_URL = os.environ.get("HG_BASE_URL", "https://ionpeblog.ro").rstrip("/")
DEFAULT_IMAGE = f"{BASE_URL}/assets/og-default.jpg"

# ─────────────────────────────────────────────────────────────────────────


def escape_html(s: str) -> str:
    if s is None:
        return ""
    return (
        str(s)
        .replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace('"', "&quot;")
        .replace("'", "&#39;")
    )


def trim(text: str, limit: int = 200) -> str:
    """Trim description for OG, preserve word boundary."""
    if not text:
        return ""
    text = re.sub(r"\s+", " ", text).strip()
    if len(text) <= limit:
        return text
    cut = text[:limit].rsplit(" ", 1)[0]
    return cut + "…"


def resolve_image(image_path: str) -> str:
    """Convert relative image path to absolute URL."""
    if not image_path:
        return DEFAULT_IMAGE
    if image_path.startswith("http"):
        return image_path
    # Path like "../assets/images/Casa-X.jpg" → /assets/images/Casa-X.jpg
    cleaned = image_path.lstrip("./").lstrip("/")
    if cleaned.startswith("../"):
        cleaned = cleaned[3:]
    return f"{BASE_URL}/{cleaned}"


# ─────────────────────────────────────────────────────────────────────────

PAGE_TEMPLATE = """<!doctype html>
<html lang="ro">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{title} — Heritage Galați</title>
  <meta name="description" content="{description}">
  <link rel="canonical" href="{canonical}">

  <!-- Open Graph -->
  <meta property="og:type" content="{og_type}">
  <meta property="og:title" content="{title}">
  <meta property="og:description" content="{description}">
  <meta property="og:url" content="{canonical}">
  <meta property="og:image" content="{image}">
  <meta property="og:locale" content="ro_RO">
  <meta property="og:site_name" content="Heritage Galați">

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="{title}">
  <meta name="twitter:description" content="{description}">
  <meta name="twitter:image" content="{image}">

  <!-- JSON-LD structured data -->
  <script type="application/ld+json">{jsonld}</script>

  <link rel="icon" type="image/svg+xml" href="../../assets/logo-sigiliu.svg">
  <style>
    body {{
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      max-width: 540px; margin: 60px auto; padding: 24px;
      color: #1f2c4a; background: #efeeea;
      text-align: center;
    }}
    .logo {{ font-size: 14px; letter-spacing: .14em; text-transform: uppercase; color: #8a8780; font-weight: 700; }}
    h1 {{ font-size: 26px; margin: 14px 0 8px; }}
    p {{ color: #555; line-height: 1.5; margin: 10px 0; }}
    img.hero {{ max-width: 100%; max-height: 260px; object-fit: cover; border-radius: 8px; margin: 20px 0; }}
    a {{ color: #2c6157; text-decoration: none; font-weight: 600; }}
    a:hover {{ text-decoration: underline; }}
    .loader {{ margin-top: 24px; font-size: 13px; color: #999; }}
  </style>

  <!-- Redirect to SPA after a moment (JS-side; preserves the deep-link context). -->
  <script>
    (function () {{
      // Don't redirect bots/crawlers — let them see the static page with OG tags.
      var ua = navigator.userAgent || "";
      var isBot = /bot|crawler|spider|facebookexternalhit|twitterbot|whatsapp|telegram|linkedin|slack/i.test(ua);
      if (!isBot) {{
        var target = "{spa_url}";
        // Quick redirect (50ms) — short enough to feel instant, long enough for
        // crawlers that DO render JS to capture OG.
        setTimeout(function () {{ window.location.replace(target); }}, 50);
      }}
    }})();
  </script>
</head>
<body>
  <p class="logo">Heritage Galați</p>
  <h1>{title}</h1>
  {hero_img}
  <p>{description}</p>
  <p class="loader"><a href="{spa_url}">→ Deschide pe hartă</a></p>
</body>
</html>
"""


def make_page(
    *,
    out_path: Path,
    title: str,
    description: str,
    canonical: str,
    spa_url: str,
    image: str,
    og_type: str = "article",
    jsonld: dict | None = None,
) -> None:
    out_path.parent.mkdir(parents=True, exist_ok=True)
    hero = ""
    if image and image != DEFAULT_IMAGE:
        hero = f'<img class="hero" src="{image}" alt="{escape_html(title)}" loading="lazy">'
    # Defensively escape </ inside JSON-LD so a malformed title/description can't
    # break out of the <script> tag. (XSS hardening — unlikely in our data but cheap.)
    jsonld_text = json.dumps(jsonld or {"@context": "https://schema.org", "@type": "WebPage", "name": title})
    jsonld_text = jsonld_text.replace("</", "<\\/")
    html = PAGE_TEMPLATE.format(
        title=escape_html(title),
        description=escape_html(description),
        canonical=canonical,
        spa_url=spa_url,
        image=image,
        og_type=og_type,
        hero_img=hero,
        jsonld=jsonld_text,
    )
    out_path.write_text(html, encoding="utf-8")


# ─────────────────────────────────────────────────────────────────────────


def generate_locations(urls: list) -> int:
    """One static page per location. Returns count."""
    data = json.loads((GMAP / "locations.json").read_text(encoding="utf-8"))
    locs = data if isinstance(data, list) else data.get("locations", [])
    out_dir = GMAP / "loc"
    out_dir.mkdir(parents=True, exist_ok=True)
    count = 0
    for L in locs:
        lid = L.get("id")
        if not lid:
            continue
        title = L.get("title") or "(fără titlu)"
        # Strip Romanian quotes for cleaner OG title
        title_clean = title.replace("„", "").replace("”", "").strip()
        excerpt = L.get("excerpt") or trim(L.get("description") or "", 200)
        canonical = f"{BASE_URL}/galati_map/loc/{lid}.html"
        spa_url = f"{BASE_URL}/galati_map/?loc={lid}"
        image = resolve_image(L.get("image") or "")
        # JSON-LD: Place
        jsonld = {
            "@context": "https://schema.org",
            "@type": "Place",
            "name": title_clean,
            "description": excerpt,
            "url": canonical,
        }
        if L.get("lat") and L.get("lon"):
            jsonld["geo"] = {
                "@type": "GeoCoordinates",
                "latitude": L["lat"],
                "longitude": L["lon"],
            }
        if L.get("location"):
            jsonld["address"] = {"@type": "PostalAddress", "addressLocality": "Galați", "streetAddress": L["location"]}

        make_page(
            out_path=out_dir / f"{lid}.html",
            title=title_clean,
            description=excerpt,
            canonical=canonical,
            spa_url=spa_url,
            image=image,
            og_type="place",
            jsonld=jsonld,
        )
        urls.append(canonical)
        count += 1
    return count


def generate_tours(urls: list) -> int:
    """One static page per tour."""
    p = GMAP / "tours.json"
    if not p.exists():
        return 0
    data = json.loads(p.read_text(encoding="utf-8"))
    out_dir = GMAP / "tour"
    out_dir.mkdir(parents=True, exist_ok=True)
    count = 0
    for t in data.get("tours", []):
        tid = t.get("id")
        if not tid:
            continue
        title = t.get("title") or "(fără titlu)"
        subtitle = t.get("subtitle") or ""
        description = subtitle + (" — " if subtitle else "") + trim(t.get("description") or "", 180)
        canonical = f"{BASE_URL}/galati_map/tour/{tid}.html"
        spa_url = f"{BASE_URL}/galati_map/?tour={tid}"
        image = resolve_image(t.get("cover") or "")
        jsonld = {
            "@context": "https://schema.org",
            "@type": "TouristTrip",
            "name": title,
            "description": description,
            "url": canonical,
        }
        make_page(
            out_path=out_dir / f"{tid}.html",
            title=title,
            description=description,
            canonical=canonical,
            spa_url=spa_url,
            image=image,
            og_type="article",
            jsonld=jsonld,
        )
        urls.append(canonical)
        count += 1
    return count


def generate_hunts(urls: list) -> int:
    """One static page per hunt."""
    p = GMAP / "treasure_hunts.json"
    if not p.exists():
        return 0
    data = json.loads(p.read_text(encoding="utf-8"))
    out_dir = GMAP / "hunt"
    out_dir.mkdir(parents=True, exist_ok=True)
    count = 0
    for h in data.get("hunts", []):
        hid = h.get("id")
        if not hid:
            continue
        title = h.get("title") or "(fără titlu)"
        description = h.get("subtitle") or trim(h.get("story") or h.get("description") or "", 180)
        canonical = f"{BASE_URL}/galati_map/hunt/{hid}.html"
        spa_url = f"{BASE_URL}/galati_map/?hunt={hid}"
        image = resolve_image(h.get("cover") or "")
        jsonld = {
            "@context": "https://schema.org",
            "@type": "Event",
            "name": title,
            "description": description,
            "url": canonical,
            "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
        }
        make_page(
            out_path=out_dir / f"{hid}.html",
            title=title,
            description=description,
            canonical=canonical,
            spa_url=spa_url,
            image=image,
            og_type="article",
            jsonld=jsonld,
        )
        urls.append(canonical)
        count += 1
    return count


def generate_trivia(urls: list) -> int:
    """One static page per trivia entry (Știați că?)."""
    p = GMAP / "trivia.json"
    if not p.exists():
        return 0
    data = json.loads(p.read_text(encoding="utf-8"))
    items = data if isinstance(data, list) else []
    out_dir = GMAP / "triv"
    out_dir.mkdir(parents=True, exist_ok=True)
    count = 0
    for t in items:
        tid = t.get("id")
        if not tid:
            continue
        title = t.get("title") or "(fără titlu)"
        title_clean = title.replace("„", "").replace("”", "").strip()
        description = trim(t.get("description") or "", 200)
        canonical = f"{BASE_URL}/galati_map/triv/{tid}.html"
        spa_url = f"{BASE_URL}/galati_map/?triv={tid}"
        image = resolve_image(t.get("image") or "")
        jsonld = {
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": title_clean,
            "description": description,
            "url": canonical,
            "articleSection": t.get("category") or "Știați că?",
        }
        if t.get("lat") and t.get("lon"):
            jsonld["contentLocation"] = {
                "@type": "Place",
                "geo": {"@type": "GeoCoordinates", "latitude": t["lat"], "longitude": t["lon"]},
            }
        make_page(
            out_path=out_dir / f"{tid}.html",
            title=title_clean,
            description=description,
            canonical=canonical,
            spa_url=spa_url,
            image=image,
            og_type="article",
            jsonld=jsonld,
        )
        urls.append(canonical)
        count += 1
    return count


def generate_legende(urls: list) -> int:
    """One static page per legendă."""
    p = GMAP / "legende.json"
    if not p.exists():
        return 0
    data = json.loads(p.read_text(encoding="utf-8"))
    items = data if isinstance(data, list) else []
    out_dir = GMAP / "leg"
    out_dir.mkdir(parents=True, exist_ok=True)
    count = 0
    for L in items:
        lid = L.get("id")
        if not lid:
            continue
        title = L.get("title") or "(fără titlu)"
        title_clean = title.replace("„", "").replace("”", "").strip()
        description = trim(L.get("description") or "", 200)
        canonical = f"{BASE_URL}/galati_map/leg/{lid}.html"
        spa_url = f"{BASE_URL}/galati_map/?leg={lid}"
        image = resolve_image(L.get("image") or "")
        jsonld = {
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": title_clean,
            "description": description,
            "url": canonical,
            "articleSection": L.get("category") or "Legende",
        }
        if L.get("lat") and L.get("lon"):
            jsonld["contentLocation"] = {
                "@type": "Place",
                "geo": {"@type": "GeoCoordinates", "latitude": L["lat"], "longitude": L["lon"]},
            }
        make_page(
            out_path=out_dir / f"{lid}.html",
            title=title_clean,
            description=description,
            canonical=canonical,
            spa_url=spa_url,
            image=image,
            og_type="article",
            jsonld=jsonld,
        )
        urls.append(canonical)
        count += 1
    return count


def generate_sitemap(urls: list[str]) -> None:
    today = datetime.now().strftime("%Y-%m-%d")
    body = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    # Root URLs
    for root in [
        f"{BASE_URL}/galati_map/index.html",
        f"{BASE_URL}/galati_map/lists.html",
        f"{BASE_URL}/galati_map/batalia-galati-1918.html",
        f"{BASE_URL}/galati_map/piata-regala-ar.html",
    ]:
        body += f"  <url><loc>{root}</loc><lastmod>{today}</lastmod><priority>0.9</priority></url>\n"
    # Generated URLs
    for u in urls:
        body += f"  <url><loc>{u}</loc><lastmod>{today}</lastmod><priority>0.6</priority></url>\n"
    body += "</urlset>\n"
    (GMAP / "sitemap.xml").write_text(body, encoding="utf-8")


def main() -> int:
    print("Generating static pages for SEO + share preview…")
    urls: list[str] = []
    nl = generate_locations(urls)
    print(f"  ✓ {nl} location pages → galati_map/loc/")
    nt = generate_tours(urls)
    print(f"  ✓ {nt} tour pages     → galati_map/tour/")
    nh = generate_hunts(urls)
    print(f"  ✓ {nh} hunt pages     → galati_map/hunt/")
    ntr = generate_trivia(urls)
    print(f"  ✓ {ntr} trivia pages   → galati_map/triv/")
    nlg = generate_legende(urls)
    print(f"  ✓ {nlg} legendă pages  → galati_map/leg/")
    generate_sitemap(urls)
    print(f"  ✓ sitemap.xml ({len(urls) + 4} URLs)")
    print(f"\nTotal: {nl + nt + nh + ntr + nlg} static pages + 1 sitemap.")
    return 0


if __name__ == "__main__":
    import sys
    sys.exit(main())
