#!/usr/bin/env python3
"""Caută imagini libere pe Wikimedia Commons pentru pinurile fără imagine
din `galati_map/locations.json`.

Două faze:
1. Indexare — culege toate fișierele din categoriile relevante Commons
   (Historical monuments in Galați, Buildings in Galați, Postcards of Galați,
   History of Galați și sub-categoriile lor) cu URL, licență, autor.
2. Potrivire — scorează fiecare fișier vs fiecare pin după token-uri din titlu.
   Top 5 candidate per pin.

Output: `scripts/image_candidates.json` — pentru review manual înainte de
descărcare. Apoi `apply_images.py` le aplică efectiv (separat).

Folosește `curl` ca să evite probleme de SSL pe macOS Python.
"""
import json
import re
import subprocess
import time
import unicodedata
import urllib.parse
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
LOC_JSON = ROOT / "galati_map" / "locations.json"
OUT = Path(__file__).resolve().parent / "image_candidates.json"
CACHE = Path(__file__).resolve().parent / ".commons_cache.json"

API = "https://commons.wikimedia.org/w/api.php"
USER_AGENT = "TreasureGalati/1.0 (image research; https://github.com/...)"

# Categorii „seed" + sub-categorii recursiv (depth=2)
SEED_CATS = [
    "Category:Historical monuments in Galați",
    "Category:Buildings in Galați",
    "Category:Postcards of Galați",
    "Category:History of Galați",
    "Category:Galați by year",
    "Category:Galați by century",
    "Category:Galați by decade",
    "Category:Galați on stamps",
    "Category:Education in Galați",
    "Category:Religious buildings in Galați",
    "Category:Streets in Galați",
]

# Cuvinte de eliminat din token-set (zgomot, prepoziții)
STOPWORDS = {
    "casa", "galati", "galați", "din", "de", "la", "lui", "al", "a",
    "str", "strada", "nr", "blvd", "bd", "bulevardul", "and", "the",
    "fostă", "azi", "astăzi", "cc", "colț", "in", "în", "pe", "cu",
    "după", "către", "spre", "fost", "comp", "co", "calea", "piața",
    "biserica", "biserică", "fortificată", "schimbarea", "fata", "față",
    "monument", "monumentul", "statuie", "statuia", "palat", "palatul",
    "hotel", "fabrica", "școala", "scoala", "cinema", "templul", "sinagoga",
    "casinoul", "cofetăria", "cofetaria", "restaurantul", "berăria", "beraria",
    "bodega", "cafe", "café", "confiserie", "confiseria", "universelle",
    "ii", "iii", "iv", "vi", "vii",
}

LMI_CODE_RE = re.compile(r"GL-[IVX]+-m-B-\d+(?:\.\d+)?", re.IGNORECASE)


def curl_json(url, timeout=20):
    r = subprocess.run(
        ["curl", "-sS", "-A", USER_AGENT, url],
        capture_output=True, text=True, timeout=timeout,
    )
    if r.returncode != 0 or not r.stdout.strip():
        return {}
    try:
        return json.loads(r.stdout)
    except json.JSONDecodeError:
        return {}


def api_call(params):
    url = API + "?" + urllib.parse.urlencode(params)
    return curl_json(url)


def normalize_token(s):
    s = unicodedata.normalize("NFKD", s)
    s = "".join(c for c in s if not unicodedata.combining(c))
    return s.lower()


def tokenize(text):
    text = normalize_token(text)
    tokens = re.findall(r"[a-z0-9]+", text)
    return [t for t in tokens if len(t) >= 3 and t not in STOPWORDS]


# ─────────────────────────────────────────────────────────────────
# Phase 1: index Commons
# ─────────────────────────────────────────────────────────────────
def get_category_members(category, cmtype="file|subcat", limit=500):
    """Yield (title, ns) tuples."""
    params = {
        "action": "query", "list": "categorymembers",
        "cmtitle": category, "cmtype": cmtype, "cmlimit": limit,
        "format": "json",
    }
    while True:
        d = api_call(params)
        for m in d.get("query", {}).get("categorymembers", []):
            yield m["title"], m["ns"]
        cont = d.get("continue", {}).get("cmcontinue")
        if not cont:
            break
        params["cmcontinue"] = cont
        time.sleep(0.5)


def crawl_categories(seed_cats, max_depth=2):
    """BFS through subcategories, return set of file titles."""
    visited = set()
    files = set()
    queue = [(c, 0) for c in seed_cats]

    while queue:
        cat, depth = queue.pop(0)
        if cat in visited:
            continue
        visited.add(cat)
        try:
            for title, ns in get_category_members(cat):
                if ns == 6:  # File
                    files.add(title)
                elif ns == 14 and depth < max_depth:  # Category
                    queue.append((title, depth + 1))
        except Exception as e:
            print(f"  ! eroare la {cat}: {e}")
        time.sleep(0.3)
    return sorted(files)


def get_file_info(file_titles, batch_size=50):
    """Returnează dict: title → {url, descriptionurl, author, license, date}."""
    out = {}
    for i in range(0, len(file_titles), batch_size):
        batch = file_titles[i:i+batch_size]
        params = {
            "action": "query", "titles": "|".join(batch),
            "prop": "imageinfo",
            "iiprop": "url|extmetadata|size|user|timestamp",
            "iilimit": 1,
            "format": "json",
        }
        d = api_call(params)
        pages = d.get("query", {}).get("pages", {})
        for pid, page in pages.items():
            if "imageinfo" not in page:
                continue
            info = page["imageinfo"][0]
            md = info.get("extmetadata", {})
            out[page["title"]] = {
                "url": info.get("url"),
                "descriptionurl": info.get("descriptionurl"),
                "thumbnail": info.get("url"),  # full URL; for thumb use Special:Filepath
                "width": info.get("width"),
                "height": info.get("height"),
                "uploader": info.get("user"),
                "timestamp": info.get("timestamp"),
                "license": (md.get("LicenseShortName", {}).get("value")
                            or md.get("UsageTerms", {}).get("value")
                            or "?"),
                "credit": md.get("Artist", {}).get("value") or "",
                "description": md.get("ImageDescription", {}).get("value") or "",
                "date": md.get("DateTimeOriginal", {}).get("value") or "",
            }
        time.sleep(0.4)
    return out


# ─────────────────────────────────────────────────────────────────
# Phase 2: match pins to files
# ─────────────────────────────────────────────────────────────────
def score_match(pin_tokens, file_title, file_desc):
    """Token-overlap cu precizie + recall.

    Folosim Jaccard pe seturile de token-uri „distinctive" (>= 4 caractere),
    plus bonus pentru codul LMI prezent în titlu și pentru match exact al
    unui token rar (ex. nume propriu cu 5+ caractere).
    """
    if not pin_tokens:
        return 0
    distinctive_pin = {t for t in pin_tokens if len(t) >= 4}
    if not distinctive_pin:
        return 0

    file_text = f"{file_title} {file_desc}"
    file_tokens = set(tokenize(file_text))
    distinctive_file = {t for t in file_tokens if len(t) >= 4}
    if not distinctive_file:
        return 0

    overlap = distinctive_pin & distinctive_file
    if not overlap:
        return 0

    # Jaccard: overlap / union — penalizează file-urile cu tokens irelevante
    union = distinctive_pin | distinctive_file
    base = len(overlap) / len(union)

    # Bonus dacă cel puțin un token „rar" (>= 6 chars) e în overlap — e probabil
    # un nume propriu (Plesnila, Demetrescu, Mavromol)
    rare_overlap = {t for t in overlap if len(t) >= 6}
    if rare_overlap:
        base += 0.20

    # Bonus pentru cod LMI în titlul fișierului (semnal puternic că e clădire monument)
    if LMI_CODE_RE.search(file_title):
        base += 0.10

    return min(base, 1.0)


def main():
    with open(LOC_JSON, encoding="utf-8") as f:
        locations = json.load(f)

    pins_without_image = [
        loc for loc in locations
        if not loc.get("image") or loc.get("image") in ("", None)
    ]
    print(f"📍 {len(locations)} pinuri totale, {len(pins_without_image)} fără imagine")

    # ── Phase 1: indexare (cu cache local) ──────────────────
    if CACHE.exists():
        print(f"\n📦 Folosesc cache: {CACHE.relative_to(ROOT)}")
        with open(CACHE, encoding="utf-8") as f:
            file_info = json.load(f)
        print(f"    {len(file_info)} fișiere în cache")
    else:
        print("\n🔍 Indexare Commons...")
        file_titles = crawl_categories(SEED_CATS)
        print(f"    {len(file_titles)} fișiere descoperite în {len(SEED_CATS)} categorii seed")

        print("\n📦 Aduc metadate (URL, licență, autor)...")
        file_info = get_file_info(file_titles)
        print(f"    metadata pentru {len(file_info)} fișiere")
        with open(CACHE, "w", encoding="utf-8") as f:
            json.dump(file_info, f, ensure_ascii=False, indent=2)
        print(f"    💾 cache salvat: {CACHE.relative_to(ROOT)}")

    # ── Phase 2: match ───────────────────────────────────────
    print("\n🎯 Potrivire pinuri vs fișiere...")
    candidates_per_pin = {}
    for pin in pins_without_image:
        pin_title = pin.get("title", "")
        pin_loc = pin.get("location", "")
        # Folosim DOAR titlul pentru tokens — locația/adresa generează prea
        # multe false positive (ex. „Domnească" e în zeci de fișiere).
        pin_tokens = set(tokenize(pin_title))

        scored = []
        for file_title, info in file_info.items():
            file_short = file_title.replace("File:", "")
            score = score_match(pin_tokens, file_short, info.get("description", ""))
            if score >= 0.40:  # prag mai strict
                scored.append({
                    "file": file_title,
                    "url": info["url"],
                    "descriptionurl": info["descriptionurl"],
                    "license": info["license"],
                    "credit": info["credit"][:200],
                    "date": info["date"],
                    "uploader": info["uploader"],
                    "width": info["width"],
                    "height": info["height"],
                    "score": round(score, 3),
                })
        scored.sort(key=lambda x: -x["score"])
        if scored:
            candidates_per_pin[pin["id"]] = {
                "title": pin_title,
                "location": pin_loc,
                "tokens": sorted(pin_tokens),
                "matches": scored[:5],
            }

    # ── Output ───────────────────────────────────────────────
    out_data = {
        "indexed_files": len(file_info),
        "pins_total": len(pins_without_image),
        "pins_with_matches": len(candidates_per_pin),
        "candidates": candidates_per_pin,
    }
    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(out_data, f, ensure_ascii=False, indent=2)

    print(f"\n✅ {len(candidates_per_pin)}/{len(pins_without_image)} pinuri au cel puțin un candidat")
    print(f"📄 Raport: {OUT.relative_to(ROOT)}")

    # Top picks
    print("\n🏆 Top 10 potriviri (după scor):")
    flat = []
    for pin_id, p in candidates_per_pin.items():
        if p["matches"]:
            top = p["matches"][0]
            flat.append((top["score"], pin_id, p["title"], top["file"]))
    flat.sort(reverse=True)
    for score, pid, title, fname in flat[:15]:
        print(f"  {score:.2f}  {pid:8}  {title[:45]:45}  ← {fname.replace('File:','')[:60]}")


if __name__ == "__main__":
    main()
