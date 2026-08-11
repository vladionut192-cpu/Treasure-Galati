#!/usr/bin/env python3
"""Generate static HTML pages for each location/tour/hunt — pentru SEO + share preview.

De ce: Facebook, Twitter, WhatsApp NU execută JavaScript când scrape-uiesc o pagină
pentru preview. Văd doar HTML-ul static din `<head>`. Pentru deep-link-urile noastre
SPA (`?loc=loc-113`), nu ar arăta preview corect.

Soluție pentru cPanel (static hosting): generăm câte un fișier HTML pentru
fiecare locație/tur/hunt, cu Open Graph tags + JSON-LD. Fișierul redirectează
JS-side spre SPA (`/galati_map/?loc=<id>`), dar numai pentru oameni: crawlerele
primesc pagina ca atare.

Din august 2026 pagina de locație conține **textul complet al fișei**, nu doar
titlul și 155 de caractere de meta-description. Înainte, cele 4.000 de caractere
de conținut documentat trăiau doar în JSON-ul încărcat de aplicație și nu
ajungeau niciodată în indexul motoarelor de căutare.

Tot de atunci se generează și versiunea engleză, la `loc/en/<id>.html`, legată
de cea românească prin `hreflang`. Fără pagină proprie, cele 287 de fișe traduse
nu erau indexabile: engleza trăia doar în `?lang=en`, un parametru pe care
Google nu îl tratează ca pagină separată.

Output:
  galati_map/loc/<id>.html      (287 fișiere, RO)
  galati_map/loc/en/<id>.html   (287 fișiere, EN)
  galati_map/tour/<id>.html     (~12 fișiere)
  galati_map/hunt/<id>.html     (~4 fișiere)
  galati_map/sitemap.xml        (620 URL-uri)

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


def meta_description(text: str, limit: int = 155) -> str:
    """Meta-description pentru <head>: fraze întregi, sub limita afișată de Google.

    Google taie snippetul în jur de 155-160 de caractere. `excerpt` e acum
    rezumatul fișei (250-450 car., vezi CONTENT-STYLE.md §2.1), deci trebuie
    scurtat. Tăiem la graniță de frază, nu la mijloc de cuvânt cu „…”: un
    snippet care se termină cu punct se citește ca text, nu ca fragment rupt.
    """
    if not text:
        return ""
    text = re.sub(r"\s+", " ", text).strip()
    if len(text) <= limit:
        return text
    out = ""
    for sent in re.split(r"(?<=[.!?])\s+", text):
        if not out:
            out = sent
            if len(out) > limit:          # prima frază e deja prea lungă
                return trim(out, limit)
            continue
        if len(out) + 1 + len(sent) > limit:
            break
        out += " " + sent
    return out


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

BULLET_RE = re.compile(r"^[•▪‣]\s*")
BOLD_RE = re.compile(r"\*\*(.+?)\*\*")


def render_prose(text: str) -> str:
    """Descrierea completă, ca HTML. Oglindă a `renderBlock` din core-map.js.

    Până în august 2026 paginile din `loc/` erau cioturi de redirect: titlu,
    imagine și 155 de caractere de meta-description. Textul fișei, 4.000 de
    caractere de conținut unic și documentat, nu ajungea niciodată în indexul
    motoarelor de căutare, fiindcă trăia doar în JSON-ul încărcat de aplicație.

    Aceleași reguli ca în renderer, ca să nu apară două gramatici de conținut:
    un bloc cu două sau mai multe linii care încep cu bullet devine listă, o
    linie singură terminată cu două puncte devine subtitlu, restul e paragraf.
    """
    if not text:
        return ""
    out = []
    for block in re.split(r"\n{2,}", text.replace("\r\n", "\n")):
        lines = [l.strip() for l in block.split("\n") if l.strip()]
        if not lines:
            continue
        bullets = [l for l in lines if BULLET_RE.match(l)]

        def inline(s: str) -> str:
            return BOLD_RE.sub(r"<strong>\1</strong>", escape_html(s))

        # Pragul e 1, nu 2: un bloc cu o singură linie-bullet e tot o listă.
        if len(bullets) >= 1 and len(bullets) == len(lines):
            items = "".join(f"<li>{inline(BULLET_RE.sub('', l))}</li>" for l in lines)
            out.append(f"<ul>{items}</ul>")
        elif len(bullets) >= 2 and not BULLET_RE.match(lines[0]):
            idx = next(i for i, l in enumerate(lines) if BULLET_RE.match(l))
            intro = " ".join(lines[:idx])
            items = "".join(f"<li>{inline(BULLET_RE.sub('', l))}</li>"
                            for l in lines[idx:] if BULLET_RE.match(l))
            out.append(f"<p>{inline(intro)}</p><ul>{items}</ul>")
        elif len(lines) == 1 and len(lines[0]) < 140 and lines[0].endswith(":"):
            out.append(f"<h2>{inline(lines[0].rstrip(':'))}</h2>")
        elif len(lines) == 1 and len(lines[0]) < 60 and not re.search(r"[.!?:]$", lines[0]):
            out.append(f"<h2>{inline(lines[0])}</h2>")
        else:
            out.append("<p>" + "<br>".join(inline(l) for l in lines) + "</p>")
    return "\n  ".join(out)


PAGE_TEMPLATE = """<!doctype html>
<html lang="{lang}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{title} — Heritage Galați</title>
  <meta name="description" content="{description}">
  <link rel="canonical" href="{canonical}">
{alternates}

  <!-- Open Graph -->
  <meta property="og:type" content="{og_type}">
  <meta property="og:title" content="{title}">
  <meta property="og:description" content="{description}">
  <meta property="og:url" content="{canonical}">
  <meta property="og:image" content="{image}">
  <meta property="og:locale" content="{og_locale}">
  <meta property="og:site_name" content="Heritage Galați">

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="{title}">
  <meta name="twitter:description" content="{description}">
  <meta name="twitter:image" content="{image}">

  <!-- JSON-LD structured data -->
  <script type="application/ld+json">{jsonld}</script>

  <link rel="icon" type="image/svg+xml" href="{asset_path}assets/logo-sigiliu.svg">
  <style>
    body {{
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      max-width: 680px; margin: 48px auto; padding: 24px;
      color: #1f2c4a; background: #efeeea;
    }}
    .logo {{ font-size: 14px; letter-spacing: .14em; text-transform: uppercase; color: #8a8780; font-weight: 700; }}
    h1 {{ font-size: 28px; margin: 14px 0 6px; line-height: 1.25; }}
    h2 {{ font-size: 15px; letter-spacing: .08em; text-transform: uppercase; color: #2c6157; margin: 26px 0 8px; }}
    p {{ color: #3d4658; line-height: 1.65; margin: 12px 0; }}
    ul {{ color: #3d4658; line-height: 1.6; padding-left: 20px; margin: 12px 0; }}
    li {{ margin: 5px 0; }}
    .where {{ color: #6b7280; font-size: 14px; margin: 0 0 18px; }}
    img.hero {{ max-width: 100%; max-height: 320px; object-fit: cover; border-radius: 8px; margin: 20px 0; }}
    a {{ color: #2c6157; text-decoration: none; font-weight: 600; }}
    a:hover {{ text-decoration: underline; }}
    .loader {{ margin-top: 30px; padding-top: 18px; border-top: 1px solid #d8d6cf; font-size: 14px; }}
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
  {where}
  {hero_img}
  {prose}
  <p class="loader"><a href="{spa_url}">{cta}</a></p>
</body>
</html>
"""


CTA = {"ro": "Deschide pe hartă", "en": "Open on the map"}
OG_LOCALE = {"ro": "ro_RO", "en": "en_US"}


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
    lang: str = "ro",
    prose: str = "",
    where: str = "",
    alternates: dict[str, str] | None = None,
    asset_depth: int = 2,
) -> None:
    out_path.parent.mkdir(parents=True, exist_ok=True)
    hero = ""
    if image and image != DEFAULT_IMAGE:
        hero = f'<img class="hero" src="{image}" alt="{escape_html(title)}" loading="lazy">'
    # hreflang: fără el, Google tratează versiunea engleză drept conținut
    # duplicat în loc de traducere, iar niciuna nu se clasează bine.
    alt_lines = []
    for code, href in (alternates or {}).items():
        alt_lines.append(f'  <link rel="alternate" hreflang="{code}" href="{href}">')
    if alternates and "ro" in alternates:
        alt_lines.append(f'  <link rel="alternate" hreflang="x-default" href="{alternates["ro"]}">')
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
        lang=lang,
        # Tururile, vânătorile, trivia și legendele nu au text lung de randat;
        # pentru ele corpul rămâne descrierea scurtă, ca înainte.
        prose=prose or f"<p>{escape_html(description)}</p>",
        where=f'<p class="where">{escape_html(where)}</p>' if where else "",
        cta=CTA.get(lang, CTA["ro"]),
        og_locale=OG_LOCALE.get(lang, OG_LOCALE["ro"]),
        alternates="\n".join(alt_lines),
        asset_path="../" * asset_depth,
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
        # JSON-LD: TouristAttraction pentru obiectivele care mai există (Google
        # le poate afișa ca rich results); Place generic pentru cele dispărute —
        # o clădire demolată nu e o „atracție" vizitabilă.
        status = (L.get("status") or "").lower()
        gone = status in ("demolished", "lost")
        jsonld = {
            "@context": "https://schema.org",
            "@type": "Place" if gone else ["TouristAttraction", "LandmarksOrHistoricalBuildings"],
            "name": title_clean,
            "description": excerpt,
            "url": canonical,
            "containedInPlace": {
                "@type": "City",
                "name": "Galați",
                "address": {"@type": "PostalAddress", "addressCountry": "RO"},
            },
        }
        if image != DEFAULT_IMAGE:
            jsonld["image"] = image
        if not gone:
            # Obiectivele de patrimoniu de pe hartă se văd liber, din stradă.
            jsonld["isAccessibleForFree"] = True
        if L.get("lat") and L.get("lon"):
            jsonld["geo"] = {
                "@type": "GeoCoordinates",
                "latitude": L["lat"],
                "longitude": L["lon"],
            }
        if L.get("location"):
            jsonld["address"] = {"@type": "PostalAddress", "addressLocality": "Galați", "streetAddress": L["location"]}

        # Versiunea engleză stă la `loc/en/<id>.html`, ca traducere declarată
        # prin hreflang. Fără o pagină proprie, cele 287 de fișe traduse nu erau
        # indexabile deloc: engleza trăia doar în `?lang=en`, un parametru pe
        # care Google nu îl tratează ca pagină separată.
        title_en = (L.get("title_en") or "").replace("„", "").replace("”", "").strip()
        has_en = bool(title_en and (L.get("description_en") or "").strip())
        canonical_en = f"{BASE_URL}/galati_map/loc/en/{lid}.html"
        alternates = {"ro": canonical}
        if has_en:
            alternates["en"] = canonical_en

        make_page(
            out_path=out_dir / f"{lid}.html",
            title=title_clean,
            # Meta-description scurtată la fraze întregi: `excerpt` e acum
            # rezumatul fișei (250-450 car.), iar Google taie pe la 155.
            # JSON-LD-ul de mai sus păstrează varianta completă.
            description=meta_description(excerpt),
            canonical=canonical,
            spa_url=spa_url,
            image=image,
            og_type="place",
            jsonld=jsonld,
            lang="ro",
            prose=render_prose(L.get("description") or ""),
            where=L.get("location") or "",
            alternates=alternates,
            asset_depth=2,
        )
        urls.append(canonical)
        count += 1

        if has_en:
            jsonld_en = dict(jsonld)
            jsonld_en["name"] = title_en
            jsonld_en["description"] = L.get("excerpt_en") or ""
            jsonld_en["url"] = canonical_en
            if L.get("location_en"):
                jsonld_en["address"] = {"@type": "PostalAddress",
                                        "addressLocality": "Galați",
                                        "streetAddress": L["location_en"]}
            make_page(
                out_path=out_dir / "en" / f"{lid}.html",
                title=title_en,
                description=meta_description(L.get("excerpt_en") or ""),
                canonical=canonical_en,
                spa_url=f"{BASE_URL}/galati_map/?loc={lid}&lang=en",
                image=image,
                og_type="place",
                jsonld=jsonld_en,
                lang="en",
                prose=render_prose(L.get("description_en") or ""),
                where=L.get("location_en") or "",
                alternates=alternates,
                asset_depth=3,
            )
            urls.append(canonical_en)
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
    # Titlurile opririlor (pentru itinerariul JSON-LD) vin din locations.json,
    # prin `loc_id`. Legătura se făcea până în august 2026 prin `article`, o cale
    # de fișier către un folder inexistent, care rupea tăcut opriri de tur.
    loc_data = json.loads((GMAP / "locations.json").read_text(encoding="utf-8"))
    locs = loc_data if isinstance(loc_data, list) else loc_data.get("locations", [])
    loc_by_id = {L["id"]: L for L in locs if L.get("id")}
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
        if image != DEFAULT_IMAGE:
            jsonld["image"] = image
        # Itinerariul: lista ordonată a opririlor, cu numele locațiilor.
        stop_names = []
        for s in t.get("stops", []):
            loc = loc_by_id.get(s.get("loc_id"))
            name = loc.get("title") if loc else None
            if not name:
                # Fallback: nota începe cu „N. Numele opririi — …"
                note = (s.get("note") or "").strip()
                name = re.sub(r"^\d+\.\s*", "", note).split("—")[0].strip()
            if name:
                stop_names.append(name)
        if stop_names:
            jsonld["itinerary"] = {
                "@type": "ItemList",
                "numberOfItems": len(stop_names),
                "itemListElement": [
                    {"@type": "ListItem", "position": i + 1, "name": nm}
                    for i, nm in enumerate(stop_names)
                ],
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
            # Event fără location e respins de validatorul Google de rich results.
            "location": {
                "@type": "City",
                "name": "Galați",
                "address": {"@type": "PostalAddress", "addressLocality": "Galați", "addressCountry": "RO"},
            },
        }
        if image != DEFAULT_IMAGE:
            jsonld["image"] = image
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
