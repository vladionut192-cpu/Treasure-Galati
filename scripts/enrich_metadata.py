#!/usr/bin/env python3
"""Auto-extragere de metadate structurate din descrieri + corectări manuale.

Adaugă/actualizează în `locations.json`:
- year_built (int sau null) — primul an „de construire" detectat în descriere
- year_demolished (int sau null) — doar pentru clădiri din lista DEMOLISHED
- status: "active" | "demolished" | "ruin" | "altered" | "lost" | "unknown"
- period: "ancient" | "medieval" | "early-modern" | "port-liber" | "belle-epoque" | "interbelic" | "communist" | "modern"

Strategie: auto-detect doar pentru year_built (regex strict). Status și
year_demolished vin din liste manual-curate ca să nu marcăm greșit clădiri
existente.
"""
import json
import re
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
LOC_JSON = ROOT / "galati_map" / "locations.json"

# ─── Liste manuale curate ─────────────────────────────────────────────────

# Clădiri demolate / dispărute (cu an opțional)
DEMOLISHED = {
    "loc-96": 1962,   # Biserica Sf. Gheorghe
    "loc-97": 1963,   # Biserica Sfânta Sofia
    "loc-109": 1958,  # Aeroportul (1920-1958)
    "loc-134": None,  # Teatrul Papadopol / Passalacqua (incendiu, ~1909)
    "loc-135": 1944,  # Cinema Louvru (Piața Regală devastată)
    "loc-122": None,  # Hotel Bristol (sistematizare postbelică)
    "loc-123": 1953,  # Hotel Continental (înlocuit cu bloc 1953)
    "loc-124": None,  # Hotel Metropol (sistematizare postbelică)
    "loc-127": None,  # Restaurant Suré
    "loc-128": None,  # Bodega Azuga (la parterul Continental)
    "loc-129": None,  # Restaurant Canellos
    "loc-130": None,  # Cofetăria Ettinger
    "loc-131": None,  # Confiserie Universelle
    "loc-132": None,  # Manzavinatos Elysée
    "loc-133": None,  # Café Trocadero
}

# Ruine / vestigii arheologice
RUINS = {
    "loc-115": "Castrul roman Tirighina (sec. I-II d.Hr.) — vestigii arheologice",
}

# Clădiri puternic alterate / reconstruite (păstrează amplasamentul, nu și clădirea)
ALTERED = set()  # gol — adaugă manual când e cazul

# An de construire confirmat manual (overrides extracție automată)
YEAR_BUILT_OVERRIDES = {
    "loc-4": 1647,   # Precista 1643-1647 (al doilea an)
    "loc-92": 1700,  # Mavromol — ctitorie Antioh Cantemir
    "loc-93": 1858,  # Biserica Armenească
    "loc-91": 1875,  # Templul Meseriașilor (reconstr. 1927-29)
    "loc-99": 1862,  # Casa Cuza
    "loc-115": -100, # Castrul Tirighina (sec. I a.Hr. – aprox.)
    "loc-122": 1880, # Hotel Bristol (estimat — mențiuni 1907)
    "loc-110": 1842, # Fabrica Ploll
    "loc-114": 1872, # Gara Galați
    "loc-116": 1906, # Catedrala Sf. Nicolae (1906-1917)
    "loc-117": 1867, # Notre Dame de Sion
    "loc-107": 1961, # Combinatul Siderurgic (constr. 1961+)
    "loc-109": 1920, # Aeroportul (1920-1958)
    "loc-111": 1966, # Coloana Țiglina
    "loc-112": 1964, # Cinematograful Țiglina
    "loc-113": None, # Statuie Eminescu — primă din RO, an exact necunoscut
    "loc-103": None, # Monumentul Docherilor
    "loc-104": 1918, # Bătălia 1918
    "loc-102": None, # Monumentul Unirii — diverse mutări
    "loc-21":  1969, # Casa de Cultură Sindicatelor (1966-1969)
}

# ─── Patterns regex pentru extracție automată ──────────────────────────────

YEAR_RE = re.compile(r"\b(1[5-9]\d{2}|20[0-2]\d)\b")

# Pattern-uri ordonate de la cele mai precise la mai laxe
BUILT_PATTERNS = [
    # „Construcție: 1885" / „Construcție: 1885 – 1888" / „Construcție: aprox. 1872"
    re.compile(r"Construc[țt]ie:\s*(?:aprox\.?\s*|în\s*jurul\s*anului\s*|după\s*anul\s*|începutul\s*anilor\s*|anii\s*)?\b(1[5-9]\d{2}|20[0-1]\d)\b", re.IGNORECASE),
    # „Piatra de temelie: 1866" / „Sfințire: 17 septembrie 1872"
    re.compile(r"(?:Piatra\s+de\s+temelie|Sfin[țt]ire|Inaugurare|Inaugurat|Dezvelire|Fondat[ăa]?\s+în\s+anul|Anul\s+înființării):[^\n]{0,80}?\b(1[5-9]\d{2}|20[0-1]\d)\b", re.IGNORECASE),
    # „construit/ridicat/inaugurat/deschis/fondat/înființat/edificat/sfințit … 1888"
    re.compile(r"(?:construit[ăa]?|ridicat[ăa]?|inaugurat[ăa]?|deschis[ăa]?|fondat[ăa]?|înființat[ăa]?|edificat[ăa]?|sfin[țt]it[ăa]?|datează\s+din)\s+(?:în\s+|la\s+(?:anul\s+)?|în\s+jurul\s+(?:anului\s+)?|pe\s+la\s+|în\s+anul\s+)?\b(1[5-9]\d{2}|20[0-1]\d)\b", re.IGNORECASE),
    # „1888 — construit" / „1888-construit"
    re.compile(r"\b(1[5-9]\d{2}|20[0-1]\d)\s*[-–—]\s*(?:construit|ridicat|inaugurat|deschis|fondat|înființat|edificat|sfin[țt]it)", re.IGNORECASE),
    # „a început construirea în 1898"
    re.compile(r"a\s+început\s+(?:construirea\s+)?(?:în|la)\s+(?:anul\s+|august\s+)?\b(1[5-9]\d{2}|20[0-1]\d)\b", re.IGNORECASE),
    # „fondată în 1842 de" / „fost fondată în"
    re.compile(r"(?:fondat[ăa]?\s+în|fost\s+fondat[ăa]?\s+în)\s+\b(1[5-9]\d{2}|20[0-1]\d)\b", re.IGNORECASE),
    # „din 1885" la începutul unei propoziții despre construcție
    re.compile(r"(?:Începând\s+din|Existent[ăa]?\s+din|Operative?\s+din)\s+(?:anul\s+)?\b(1[5-9]\d{2}|20[0-1]\d)\b", re.IGNORECASE),
    # „A fost construit în 1898"
    re.compile(r"A\s+fost\s+(?:construit|ridicat|inaugurat|deschis|fondat|înființat)[ăa]?\s+(?:în\s+(?:anul\s+)?)?\b(1[5-9]\d{2}|20[0-1]\d)\b", re.IGNORECASE),
]


def extract_year_built(text):
    """Întâi încearcă pattern-uri stricte. Dacă nimic, fallback la primul
    an plauzibil din primul paragraf (descriere structurată „Construcție: X" etc.)."""
    for pattern in BUILT_PATTERNS:
        m = pattern.search(text)
        if m:
            return int(m.group(1))
    # Fallback: primul an din primii 300 caractere (zone de „header" structurat)
    head = text[:300]
    m = YEAR_RE.search(head)
    if m:
        y = int(m.group(1))
        if 1500 <= y <= 1980:
            return y
    return None


def derive_period(year_built, status, title):
    if year_built is not None:
        if year_built < 0:
            return "ancient"
        if year_built < 1700:
            return "medieval"
        if year_built < 1830:
            return "early-modern"
        if year_built < 1880:
            return "port-liber"
        if year_built < 1914:
            return "belle-epoque"
        if year_built < 1945:
            return "interbelic"
        if year_built < 1990:
            return "communist"
        return "modern"
    # Inferențe din titlu pentru cele fără an
    t = (title or "").lower()
    if any(k in t for k in ["castr", "tirighina", "gherghina"]):
        return "ancient"
    if any(k in t for k in ["combinat", "țiglina", "siderurg", "casa de cultură", "aeroport", "puful de păpădie", "tabără de sculptură"]):
        return "communist"
    if any(k in t for k in ["consulat", "comisiun"]):
        return "port-liber"
    return None


def main():
    with open(LOC_JSON, encoding="utf-8") as f:
        locations = json.load(f)

    stats = Counter()
    suspicious = []

    for loc in locations:
        text = (loc.get("description", "") or "")
        title = loc.get("title", "")
        loc_id = loc.get("id")

        # year_built — overrides câștigă, altfel extracție automată
        if loc_id in YEAR_BUILT_OVERRIDES:
            loc["year_built"] = YEAR_BUILT_OVERRIDES[loc_id]
            stats["yb_override"] += 1
        else:
            yb = extract_year_built(text)
            loc["year_built"] = yb
            if yb:
                stats["yb_auto"] += 1

        # status + year_demolished — doar din liste manuale
        if loc_id in DEMOLISHED:
            loc["status"] = "demolished"
            loc["year_demolished"] = DEMOLISHED[loc_id]
            stats["demolished"] += 1
        elif loc_id in RUINS:
            loc["status"] = "ruin"
            loc["year_demolished"] = None
            stats["ruin"] += 1
        elif loc_id in ALTERED:
            loc["status"] = "altered"
            loc["year_demolished"] = None
            stats["altered"] += 1
        else:
            loc["status"] = "active"
            loc["year_demolished"] = None
            stats["active"] += 1

        # period derivat
        loc["period"] = derive_period(loc.get("year_built"), loc["status"], title)
        if loc["period"]:
            stats[f"period_{loc['period']}"] += 1
        else:
            stats["period_none"] += 1

        # Câmpuri suplimentare (gol pentru populare manuală ulterioară)
        for f in ("architect", "owner", "style"):
            if f not in loc:
                loc[f] = None

        # Validări
        if loc.get("year_built") and loc.get("year_demolished"):
            if loc["year_built"] > loc["year_demolished"]:
                suspicious.append((loc_id, loc["title"][:55],
                                   loc["year_built"], loc["year_demolished"]))

    with open(LOC_JSON, "w", encoding="utf-8") as f:
        json.dump(locations, f, ensure_ascii=False, indent=2)

    print(f"📊 Pe {len(locations)} locații:")
    print(f"   year_built auto:     {stats['yb_auto']}")
    print(f"   year_built override: {stats['yb_override']}")
    print(f"   active:              {stats['active']}")
    print(f"   demolished:          {stats['demolished']}")
    print(f"   ruin:                {stats['ruin']}")
    print(f"   altered:             {stats['altered']}")

    if suspicious:
        print(f"\n⚠️  {len(suspicious)} potențial suspecte:")
        for s in suspicious:
            print(f"    {s[0]} {s[1]}: {s[2]} → {s[3]}")

    print(f"\nDistribuție period:")
    for k in sorted(stats.keys()):
        if k.startswith("period_"):
            label = k.replace("period_", "")
            print(f"  {label or '(none)':>14}: {stats[k]}")


if __name__ == "__main__":
    main()
