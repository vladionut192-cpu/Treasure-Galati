#!/usr/bin/env python3
"""Parse Galați chronology OCR text into structured JSON entries.

Heuristics for the OCR'd source:
  - Page-break markers: ``========== Pagina N ==========``
  - Year markers: lines that match ``\\d{4}`` or ``\\d{4}-\\d{2,4}`` exactly
  - Right-margin and left-margin column fragments often appear as short, broken
    lines around page breaks; we drop short noise fragments.
  - Body text is everything between two consecutive year markers (within a
    given page block).

Output: ``galati_map/cronologie.json`` with one record per year/event.
"""
from __future__ import annotations

import json
import re
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "Surse" / "cronologie-galati.txt"
OUT = ROOT / "galati_map" / "cronologie.json"

YEAR_LINE = re.compile(r"^(\d{4})(?:-(\d{2,4}))?$")
PAGE_BREAK = re.compile(r"^=+\s*Pagina\s+(\d+)\s*=+$")
NUMERIC_NOISE = re.compile(r"^\d{1,3}$")
DATE_PREFIX = re.compile(
    r"^(\d{1,2}\s+(ianuarie|februarie|martie|aprilie|mai|iunie|iulie|august|"
    r"septembrie|octombrie|noiembrie|decembrie)|"
    r"luna\s+(ianuarie|februarie|martie|aprilie|mai|iunie|iulie|august|"
    r"septembrie|octombrie|noiembrie|decembrie)|"
    r"toamna|primăvara|vara|iarna)",
    re.IGNORECASE,
)
PRIMARI_LINE = re.compile(r"^Primari?\s*[-:]\s*", re.IGNORECASE)
PARCALAB_LINE = re.compile(r"^Pârcălab\s*[-:]", re.IGNORECASE)


def fold(text: str) -> str:
    """Diacritic-insensitive lowercase form (for keyword matching)."""
    nfkd = unicodedata.normalize("NFKD", text)
    return "".join(ch for ch in nfkd if not unicodedata.combining(ch)).lower()


CATEGORY_RULES: list[tuple[str, list[str]]] = [
    ("cutremur", [
        "cutremur",
    ]),
    ("epidemie", [
        "ciuma", "holera", "epidemie", "molima", "tifos", "varsat",
    ]),
    ("incendiu", [
        "incendiu", "incendiat", "ardere", "ars de", "a ars", "au ars",
        "foc mare", "foc puternic", "mistuit de foc", "mistuit de flacari",
    ]),
    ("inundatie", [
        "inundatie", "inundatii", "inundat", "revarsare",
    ]),
    ("razboi", [
        "razboi", "razboiul", "navalir", "tatari", "turci au atacat",
        "armata rusa", "armata otomana", "armata turca",
    ]),
    ("biserica", [
        "biserica", "manastire", "manastir", "ctitori", "sfintit",
        "paraclis", "catedrala", "schit",
    ]),
    ("scoala", [
        "scoala", "scolar", "liceu", "gimnaz", "universit", "academ",
        "invatator", "institut",
    ]),
    ("fabrica", [
        "fabrica", "fabrici", "uzin", "atelier", "santier naval", "moara",
        "tipografie", "tipografia",
    ]),
    ("primar", [
        "primar -", "primari -", "primar:", "primari:", "primarie",
    ]),
    ("parcalab", [
        "parcalab",
    ]),
    ("port", [
        "port liber", "porto franco", "scheli", "schela", "vam", "vapor",
        "navigati",
    ]),
    ("evrei", [
        "evrei", "israelit", "sinagog", "comunitatea evreiasca",
    ]),
    ("teatru", [
        "teatru", "teatrul",
    ]),
    ("ziar", [
        "apare ziarul", "ziar", "publicati", "tipografi",
    ]),
    ("monument", [
        "statui", "monument", "bust",
    ]),
    ("spital", [
        "spital",
    ]),
    ("consulat", [
        "consul", "consulat",
    ]),
    ("tramvai", [
        "tramvai",
    ]),
    ("cimitir", [
        "cimitir",
    ]),
]


def categorize(text: str) -> list[str]:
    folded = fold(text)
    cats: list[str] = []
    for label, keys in CATEGORY_RULES:
        for key in keys:
            if key in folded:
                cats.append(label)
                break
    return cats


SHORT_OK = {
    # Romanian stop / short words that legitimately end short fragments
    "a", "o", "e", "ai", "au", "da", "nu", "să", "sa", "se", "el", "ea",
    "de", "la", "în", "si", "și", "cu", "pe", "ce", "un", "din", "fie",
    "ca", "iar", "ne", "le", "mi", "ti", "tu", "vă", "ți", "lor", "este",
    "era", "fost", "anul", "luna", "ziua",
    # Common short Romanian words that show up mid-sentence
    "eu", "or", "ori", "sau", "cum", "cei", "cea", "cele", "cel", "ale",
    "vor", "ci", "ești", "fii", "său", "sai", "ne-", "ți-", "mi-", "s-",
    "sub", "vino", "vine", "însuși", "deja", "alt", "alți", "alta",
    "doi", "trei", "patru", "cinci", "șase", "noi",
    "voi", "lui", "are", "i-a", "i-am",
    "asta", "ăsta", "asa", "așa", "aici", "acolo", "acel", "acea",
    "doar", "tot", "toți", "toate", "ele", "ei",
    "mai", "mult", "multe", "mulți", "puțin", "vai",
    # Common Romanian abbreviations (kept here so the anomaly detector below
    # doesn't penalise legitimate text containing ``Sf. Ioan``, ``Pr. Eugen``,
    # ``vol. III``, ``sec. al XV-lea`` etc.)
    "sf", "pr", "dr", "mr", "st", "vol", "nr", "art", "etc", "cca",
    "sec", "tip", "et", "al", "pp", "fig", "fol", "cap",
}


# Split at sentence boundaries, but skip three common abbreviation patterns:
#   1. Period preceded by a single uppercase letter (initials: ``I. L. Caragiale``,
#      citation ``(C. G. Marinescu``).
#   2. Period preceded by an uppercase letter, with the next sentence starting
#      lowercase (avoids splitting inside ``Sf. Apostoli``, ``Dr. Negel``).
#   3. Period followed by a lowercase letter (Romanian abbreviations like
#      ``sec. al XV-lea``, ``vol. III``, ``p. 105`` — the regex below requires
#      the next sentence to start with uppercase or an opening quote).
SENTENCE_SPLIT = re.compile(r"(?<=[.!?])\s+")
LEAD_PUNCT = re.compile(r"^[\W_]+", re.UNICODE)
ABBREV_TAIL = re.compile(r"\b([A-ZĂÎȘȚÂa-zăîșțâ]{1,3})\.$", re.UNICODE)


def split_sentences(text: str) -> list[str]:
    """Split into sentences with abbreviation-aware merging.

    Strategy: split eagerly at every ``[.!?] `` boundary, then walk through
    the fragments and re-merge whenever the previous fragment ends with a
    1–3 letter abbreviation/initial followed by a period (``Sf.``, ``Dr.``,
    ``Pr.``, ``vol.``, ``sec.``, ``I. L. Caragiale``, ``(C. G. Marinescu``).

    This recovers truncated sentences split at abbreviations *without* gluing
    legitimate sentences ending in a real word ( ``...Vrancea.``) to garbage
    that follows ( ``...nu se gă gul...``).
    """
    raw = SENTENCE_SPLIT.split(text)
    merged: list[str] = []
    for chunk in raw:
        chunk = chunk.strip()
        if not chunk:
            continue
        if merged:
            prev = merged[-1]
            # If previous sentence has an open ``(`` without a matching ``)``,
            # the period that triggered the split was *inside* a parenthetical
            # (e.g. ``(febr. 1619-sept. 1620)``) — merge to keep the citation
            # intact.
            if prev.count("(") > prev.count(")"):
                merged[-1] = prev + " " + chunk
                continue
            if ABBREV_TAIL.search(prev):
                merged[-1] = prev + " " + chunk
                continue
        merged.append(chunk)
    return merged


def drop_fragment_sentences(text: str) -> str:
    """Keep only well-formed sentences (start capital/digit, end with .!?).

    Page-break OCR noise produces both kinds of garbage:
      - Lines that start mid-word in lowercase (e.g. ``gul Galaților:``)
      - Lines that look like a normal capital-starting sentence but are
        truncated (e.g. ``Pe atunci Galați existau vreo sută de``).
      - Concatenated noise fragments that *technically* start with a digit
        and end with ``.!?`` (e.g. ``10 159( - Ia (Herşcovic evreilor di 15!``)
        — these are caught by the paren-balance check below.

    Requiring a terminal ``[.!?]`` on every kept sentence drops the first two
    classes; the paren-balance check drops the third.
    """
    if not text:
        return text
    parts = split_sentences(text)
    keep: list[str] = []
    for p in parts:
        p_stripped = p.strip()
        if not p_stripped:
            continue
        head = LEAD_PUNCT.sub("", p_stripped)
        if not head:
            continue
        first = head[0]
        starts_ok = first.isupper() or first.isdigit() or p_stripped.startswith(("-", "•", "–"))
        if not starts_ok:
            continue
        if not re.search(r'[.!?:;"”\)]$', p_stripped):
            continue
        # Reject sentences with unmatched brackets/quotes — page-flip OCR
        # often glues fragments that have ``(`` without a closing ``)``.
        if p_stripped.count("(") != p_stripped.count(")"):
            continue
        if p_stripped.count("[") != p_stripped.count("]"):
            continue
        # Reject sentences with too many fragment-looking tokens. An
        # "anomaly" is a short (≤3 char) token that isn't a Romanian stop
        # word, isn't a pure digit, and isn't a single-letter initial like
        # ``I.`` or ``L.``. OCR right-margin captures cluster these
        # (``gă``, ``gul``, ``ruit``, ``cea``…) and trip this check.
        words = [w for w in re.split(r"\s+", p_stripped) if w]
        if len(words) >= 4:
            anomaly = 0
            for w in words:
                bare = re.sub(r"[^\w]", "", w, flags=re.UNICODE)
                if not bare:
                    continue
                if bare.isdigit():
                    continue
                if len(bare) <= 3 and bare.lower() not in SHORT_OK:
                    # Single uppercase letter (initial) — usually OK in
                    # citations like ``I. L. Caragiale`` or ``(C. G. Marinescu)``.
                    if len(bare) == 1 and bare.isupper():
                        continue
                    anomaly += 1
            if anomaly >= 2 and anomaly / len(words) > 0.15:
                continue
        keep.append(p_stripped)
    return " ".join(keep)


def is_fragment(line: str) -> bool:
    """Detect a partial OCR fragment (broken margin capture).

    Markers of fragmentation:
      - short total length (< 8 chars) without bullet/date/year
      - last word too short and not a Romanian stop word
      - very few words and no terminal punctuation
    """
    s = line.strip()
    if not s:
        return True
    if NUMERIC_NOISE.fullmatch(s):
        return True
    if len(s) < 8:
        if s.startswith(("-", "•", "–")):
            return False
        if DATE_PREFIX.match(s):
            return False
        if re.search(r"[.!?]$", s):
            return False
        return True
    words = s.split()
    if len(words) <= 2 and not re.search(r"[.!?:;]$", s):
        return True
    return False


def parse() -> list[dict]:
    raw = SRC.read_text(encoding="utf-8").splitlines()

    entries: list[dict] = []
    current_year: str | None = None
    current_year_end: str | None = None
    current_page = 0
    buf: list[str] = []

    def flush() -> None:
        nonlocal buf
        if not current_year or not buf:
            buf = []
            return
        trimmed = list(buf)
        while trimmed and trimmed[-1][0] == "frag":
            trimmed.pop()
        cleaned: list[str] = []
        i = 0
        while i < len(trimmed):
            if trimmed[i][0] == "frag":
                j = i
                while j < len(trimmed) and trimmed[j][0] == "frag":
                    j += 1
                if j - i >= 3:
                    i = j
                    continue
                cleaned.extend(t for _, t in trimmed[i:j])
                i = j
            else:
                cleaned.append(trimmed[i][1])
                i += 1
        text = " ".join(s.strip() for s in cleaned if s.strip())
        text = re.sub(r"\s+", " ", text).strip()
        text = drop_fragment_sentences(text)
        if not text:
            buf = []
            return
        entries.append(
            {
                "year": int(current_year),
                "year_end": int(current_year_end) if current_year_end else None,
                "page": current_page,
                "text": text,
                "categories": categorize(text),
            }
        )
        buf = []

    for line in raw:
        m_pg = PAGE_BREAK.match(line.strip())
        if m_pg:
            current_page = int(m_pg.group(1))
            continue

        s = line.rstrip()
        m_y = YEAR_LINE.match(s.strip())
        if m_y:
            # Avoid mistaking 4-digit page numbers or stray years that don't
            # fit Galați's chronology (1400-1925).
            year = int(m_y.group(1))
            if 1400 <= year <= 1925:
                # If the same year heading reappears (page-break duplicate),
                # the first chunk under this year is right-margin fragments
                # captured at the end of the previous page. Discard it; the
                # proper content begins after the second occurrence.
                if current_year and int(current_year) == year:
                    buf = []
                    continue
                flush()
                current_year = m_y.group(1)
                current_year_end = m_y.group(2)
                if current_year_end and len(current_year_end) == 2:
                    # Expand "1639-41" → "1641"
                    current_year_end = current_year[:2] + current_year_end
                continue

        if current_year is None:
            continue

        if is_fragment(s):
            buf.append(("frag", s.strip()))
        else:
            buf.append(("ok", s.strip()))

    flush()

    # Deduplicate by year. Page-flip OCR captures right-margin fragments
    # *before* the proper content for the next page is reached, so the LATER
    # occurrence of a year heading almost always carries the clean text. We
    # rank candidates by mean word length (a coarse "OCR-cleanliness" proxy)
    # to break ties when noise outpaces proper content.
    def cleanliness(text: str) -> float:
        words = [w for w in re.split(r"\s+", text) if w]
        if not words:
            return 0.0
        return sum(len(w) for w in words) / len(words)

    by_year: dict[int, dict] = {}
    for e in entries:
        prev = by_year.get(e["year"])
        if prev is None:
            by_year[e["year"]] = e
            continue
        # Prefer the candidate with longer text *unless* the longer one is
        # significantly noisier (lower mean word length).
        prev_score = cleanliness(prev["text"])
        new_score = cleanliness(e["text"])
        if new_score >= prev_score - 0.3:
            by_year[e["year"]] = e
    deduped = sorted(by_year.values(), key=lambda x: x["year"])
    return deduped


PARCALAB_LINE_RE = re.compile(
    r"^P[âa]rc[ăa]lab\s*[-–]\s*(.+?)(?:\s*\(\s*(\d{4})\s*[-–]\s*(\d{4})\s*\))?\s*$",
    re.IGNORECASE,
)


def extract_parcalabi() -> list[dict]:
    """Read raw source line-by-line and capture every `Pârcălab - Name (yyyy-yyyy)` line.

    Avoids the OCR-cleaned entry text where punctuation has been stripped or
    sentences merged.
    """
    raw_lines = SRC.read_text(encoding="utf-8").splitlines()
    seen: dict[str, dict] = {}
    for line in raw_lines:
        s = line.strip()
        if not s or len(s) < 12:
            continue
        m = PARCALAB_LINE_RE.match(s)
        if not m:
            continue
        name = m.group(1).strip(" .,-")
        # Drop name candidates that are too short or look like fragments
        if len(name) < 6 or len(name.split()) > 7:
            continue
        # Drop obvious OCR fragments (single-letter starts, all-lowercase,
        # or trailing partial words like "Vasi")
        if re.match(r"^[a-zăîșțâ]", name):
            continue
        last_word = name.split()[-1].rstrip(".,)")
        if len(last_word) < 3:
            continue
        # Drop unclosed parens like "Cantacuzino (1860"
        if name.count("(") != name.count(")"):
            continue
        start = m.group(2)
        end = m.group(3)
        key = name
        rec = seen.setdefault(key, {"name": name, "spans": []})
        if start and end:
            span = f"{start}-{end}"
            if span not in rec["spans"]:
                rec["spans"].append(span)
    rosters = list(seen.values())
    rosters.sort(key=lambda r: (
        int(r["spans"][0].split("-")[0]) if r["spans"] else 9999,
    ))
    return rosters


PRIMARI_HEADING = re.compile(r"^Primari?\s*[-:]\s*", re.IGNORECASE)


def extract_primari(entries: list[dict]) -> list[dict]:
    """Pick the first sentence after a `Primari:` heading inside each entry.

    Primari sequences follow each annual heading from 1857 onward in the form
    ``Primari: Name1, role (until X); Name2, role (Y); ... * Prefect - Name``
    """
    out: list[dict] = []
    for entry in entries:
        text = entry["text"]
        m = PRIMARI_HEADING.search(text)
        if not m:
            continue
        rest = text[m.end():]
        # Stop at sentence boundary or " * " separator (used in source for prefect)
        # Take up to the first period followed by space+capital, or first " * "
        cut = len(rest)
        for marker in (" * ", " Prefec", " Populați", " Pârcălab", " Pârcălab"):
            i = rest.find(marker)
            if 0 <= i < cut:
                cut = i
        # Also clip at first sentence end (period + space + capital)
        m_end = re.search(r"\.\s+[A-ZĂÎȘȚ]", rest)
        if m_end and m_end.start() < cut:
            cut = m_end.start() + 1
        chunk = rest[:cut].strip(" .;,-")
        if not chunk:
            continue
        # Split mayors by ";"
        mayors = [m.strip(" .,-") for m in chunk.split(";") if m.strip(" .,-")]
        out.append({"year": entry["year"], "mayors": mayors, "raw": chunk})
    return out


POP_RES = [
    re.compile(r"[Pp]opula[țt]i[aei][^.]{0,120}?[\s:]([\d\.\,]+)\b", re.UNICODE),
    re.compile(r"\b([\d\.\,]+)\s+(?:de\s+)?locuitori\b", re.UNICODE),
    re.compile(r"\b([\d\.\,]+)\s+(?:de\s+)?suflete\b", re.UNICODE),
]
CASE_RE = re.compile(r"\b([\d\.\,]+)\s+(?:de\s+)?case\b", re.UNICODE)


def parse_num(raw: str) -> int | None:
    s = raw.replace(".", "").replace(",", "").strip()
    if not s.isdigit():
        return None
    try:
        return int(s)
    except ValueError:
        return None


def extract_population(entries: list[dict]) -> list[dict]:
    """Pull every plausible population mention from chronology entries.

    Heuristic: take the FIRST non-deduplicated number per (year, source-type)
    that falls within a plausible range. We classify:
      - ``population`` (souls)        — 100..500.000
      - ``households`` (case)         — 50..50.000
    Out-of-range or stray small numbers (deaths, taxes) are skipped.
    """
    out: list[dict] = []
    for e in entries:
        text = e["text"]
        year = e["year"]
        seen_pop = False
        for pat in POP_RES:
            for m in pat.finditer(text):
                n = parse_num(m.group(1))
                if n is None or not (300 <= n <= 500_000):
                    continue
                ctx = text[max(0, m.start() - 60):min(len(text), m.end() + 60)]
                # Filter out ranges of deaths/illnesses
                if re.search(r"murit|îmbolnăvit|deces|deceda", ctx, re.IGNORECASE):
                    continue
                out.append({
                    "year": year,
                    "kind": "population",
                    "value": n,
                    "ctx": " ".join(ctx.split())[:240],
                })
                seen_pop = True
                break
            if seen_pop:
                break
        for m in CASE_RE.finditer(text):
            n = parse_num(m.group(1))
            if n is None or not (50 <= n <= 50_000):
                continue
            # Skip if the number is actually a year (look back: was it preceded by "anul"?)
            ctx = text[max(0, m.start() - 30):min(len(text), m.end() + 60)]
            if re.search(r"anul\s+\d", ctx, re.IGNORECASE):
                continue
            # Reject 4-digit years (1800-2026) as house counts
            if 1500 <= n <= 2030 and len(m.group(1).replace(",", "").replace(".", "")) == 4:
                # Likely a stray year, skip
                continue
            out.append({
                "year": year,
                "kind": "households",
                "value": n,
                "ctx": " ".join(ctx.split())[:240],
            })
            break
    return out


DISASTER_RES = [
    ("cutremur",  re.compile(r"[Cc]utremur[^.]*\.", re.UNICODE)),
    ("ciumă",     re.compile(r"[Cc]ium[ăa][^.]*\.", re.UNICODE)),
    ("holeră",    re.compile(r"[Hh]oler[ăa][^.]*\.", re.UNICODE)),
    ("incendiu",  re.compile(r"(?:[Ii]ncendi|[Ff]oc(?:\s+mare|\s+puternic)|ars\s+de\s+t[ăa]tari|au\s+ars|a\s+ars)[^.]*\.", re.UNICODE)),
    ("inundație", re.compile(r"[Ii]nundați[^.]*\.", re.UNICODE)),
    ("război",    re.compile(r"R[ăa]zboiul?[^.]*\.|t[ăa]tari[^.]{0,80}?[^.]*\.", re.UNICODE)),
]


def extract_disasters(entries: list[dict]) -> list[dict]:
    """First short sentence mentioning each disaster keyword, per year."""
    out: list[dict] = []
    for e in entries:
        text = e["text"]
        year = e["year"]
        for kind, pat in DISASTER_RES:
            m = pat.search(text)
            if not m:
                continue
            sentence = " ".join(m.group(0).split())
            if len(sentence) < 8 or len(sentence) > 320:
                continue
            out.append({"year": year, "kind": kind, "text": sentence})
    return out


FABRICA_PHRASE = re.compile(
    r"(?:[Ff]abric[aei]|[Uu]zin[ae]|[Tt]ipografi[ae]|[Şş]antier[ul]?\s+naval|[Mm]oar[ăa])\b[^.]*?\.",
    re.UNICODE,
)


def extract_factories(entries: list[dict]) -> list[dict]:
    """First sentence per entry that names a factory/plant/printing house."""
    out: list[dict] = []
    for e in entries:
        text = e["text"]
        year = e["year"]
        for m in FABRICA_PHRASE.finditer(text):
            sentence = " ".join(m.group(0).split())
            if 12 <= len(sentence) <= 320:
                out.append({"year": year, "text": sentence})
    return out


def extract_holders(entries: list[dict]) -> dict[str, list]:
    return {
        "parcalabi":   extract_parcalabi(),
        "primari":     extract_primari(entries),
        "population":  extract_population(entries),
        "disasters":   extract_disasters(entries),
        "factories":   extract_factories(entries),
    }


def main() -> None:
    entries = parse()
    rosters = extract_holders(entries)
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(
        json.dumps(
            {"entries": entries, "rosters": rosters},
            ensure_ascii=False,
            indent=2,
        ),
        encoding="utf-8",
    )

    # Summary
    by_year_count = len({e["year"] for e in entries})
    cat_counts: dict[str, int] = {}
    for e in entries:
        for c in e["categories"]:
            cat_counts[c] = cat_counts.get(c, 0) + 1
    print(f"Wrote {len(entries)} entries spanning {by_year_count} years to {OUT}")
    print("Categories:")
    for cat, n in sorted(cat_counts.items(), key=lambda kv: -kv[1]):
        print(f"  {cat:<14} {n}")
    print(f"Pârcălabi: {len(rosters['parcalabi'])}")
    print(f"Primari intrări: {len(rosters['primari'])}")


if __name__ == "__main__":
    main()
