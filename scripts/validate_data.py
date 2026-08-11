#!/usr/bin/env python3
"""Validează datele proiectului — folosit ca pre-commit hook.

Verifică:
  - Toate fișierele JSON / GeoJSON din galati_map/ parsează corect
  - locations.json: IDs unice, articole unice
  - Romanian quote escape bugs (ghilimelele „...” cu " ASCII în loc de ”)
  - Referințe orfane între tours.json / treasure_hunts.json / locations.json

Folosire:
  python3 scripts/validate_data.py [--fix]
    --fix: încearcă să corecteze automat (ghilimele românești, etc.)
"""
from __future__ import annotations
import json
import re
import sys
from pathlib import Path
from collections import Counter

ROOT = Path(__file__).resolve().parent.parent
GMAP = ROOT / "galati_map"

# Vocabular controlat pentru locații (pct. 3 din audit — previne dublurile gen
# „ruin"/„ruins" sau „Lăcașuri de Cult"/„de cult" care sparg filtrele).
#   STATUS_ENUM: vocabular ÎNCHIS — codul face switch pe el (un status nou
#     ar fi randat greșit, silențios) → orice valoare în afară e EROARE.
#   CATEGORY_SET: setul curent cunoscut — o categorie nouă e permisă, dar
#     produce WARNING (ca o variantă cu typo/case să fie vizibilă la commit).
STATUS_ENUM = {"active", "demolished", "lost", "ruin"}
# Taxonomia rearanjată în august 2026 (vezi scripts/fix_categories.py). Erau 15
# categorii, cu patru perechi practic identice: „Clădiri Istorice" lângă „Case
# istorice", „Industrial / Tehnic" lângă „Industrie", „Monumente Comemorative"
# lângă „Monumente", „Spații verzi" lângă „Natură și Agrement". Cele patru
# dublate au dispărut, iar trei teme care erau împrăștiate au primit categorie
# proprie: Sănătate, Cultură, Sport.
#
# Fiecare categorie de aici trebuie să aibă iconiță în `core-map.js` (ICON_PATHS)
# și chei `cat.<nume>` în `i18n.js`, pentru ambele limbi. Altfel pinul cade pe
# iconița generică, iar chipsul de filtrare afișează cheia brută în engleză.
CATEGORY_SET = {
    "Alte locuri", "Case istorice", "Comerț istoric", "Consulate", "Cultură",
    "Educație", "Industrie", "Lăcașuri de cult", "Monumente",
    "Natură și Agrement", "Palate", "Sănătate", "Sate Istorice", "Sport",
}

errors: list[str] = []
warnings: list[str] = []


def err(msg: str) -> None:
    errors.append(msg)
    print(f"  ✗ {msg}")


def warn(msg: str) -> None:
    warnings.append(msg)
    print(f"  ⚠ {msg}")


def validate_json_syntax() -> dict[str, dict | list]:
    """Parse all JSON / GeoJSON files. Returnează dict cu cele valide."""
    valid = {}
    files = sorted(GMAP.glob("*.json")) + sorted(GMAP.glob("*.geojson"))
    for f in files:
        rel = f.relative_to(ROOT)
        text = f.read_text(encoding="utf-8")
        try:
            valid[str(rel)] = json.loads(text)
        except json.JSONDecodeError as e:
            err(f"{rel}: line {e.lineno} col {e.colno}: {e.msg}")
            # Show context to help debug Romanian quote bugs
            lines = text.split("\n")
            if 0 < e.lineno <= len(lines):
                col_min = max(0, e.colno - 40)
                col_max = e.colno + 40
                ctx = lines[e.lineno - 1][col_min:col_max]
                print(f"      Context: ...{ctx}...")
    return valid


def validate_locations(data: dict | list) -> None:
    """Check unique IDs, articles, cross-references."""
    locs = data if isinstance(data, list) else data.get("locations", [])
    ids = Counter(L.get("id") for L in locs)
    dup_ids = [k for k, v in ids.items() if v > 1]
    if dup_ids:
        err(f"locations.json: duplicate IDs: {dup_ids}")

    arts = Counter(L.get("article") for L in locs if L.get("article"))
    dup_arts = [k for k, v in arts.items() if v > 1]
    if dup_arts:
        err(f"locations.json: duplicate article paths ({len(dup_arts)})")

    no_id = [L.get("title", "?") for L in locs if not L.get("id")]
    if no_id:
        err(f"locations.json: {len(no_id)} entries without ID: {no_id[:3]}…")

    no_coords = [L.get("id") for L in locs if not L.get("lat") or not L.get("lon")]
    if no_coords:
        err(f"locations.json: {len(no_coords)} entries missing lat/lon: {no_coords[:3]}…")

    # Vocabular controlat — status (enum închis) + categorie (set cunoscut).
    bad_status = {}
    for L in locs:
        s = L.get("status")
        if s is not None and s not in STATUS_ENUM:
            bad_status.setdefault(s, []).append(L.get("id"))
    for val, who in bad_status.items():
        err(f"locations.json: status necunoscut {val!r} ({len(who)}×, ex: {who[:3]}) — permise: {sorted(STATUS_ENUM)}")

    new_cats = {}
    for L in locs:
        c = L.get("category")
        if c and c not in CATEGORY_SET:
            new_cats.setdefault(c, []).append(L.get("id"))
    for val, who in new_cats.items():
        warn(f"locations.json: categorie nouă {val!r} ({len(who)}×, ex: {who[:3]}) — dacă e intenționată, adaug-o în CATEGORY_SET; altfel e typo/variantă")


def validate_cross_references(valid: dict) -> None:
    """Verify tours.json + treasure_hunts.json refer to existing locations."""
    if "galati_map/locations.json" not in valid:
        return
    locs = valid["galati_map/locations.json"]
    locs_list = locs if isinstance(locs, list) else locs.get("locations", [])
    id_set = {L.get("id") for L in locs_list if L.get("id")}
    art_set = {L.get("article") for L in locs_list if L.get("article")}

    # tours.json — opririle se leagă prin `loc_id`. EROARE, nu avertisment:
    # `tours.js` filtrează tăcut opririle nerezolvate, deci un tur pierde
    # puncte fără ca nimeni să observe (tour-comunism pierdea 1 din 4).
    # Migrarea de la `article` la `loc_id` s-a făcut în august 2026; câmpul
    # `article` nu mai are rol de cheie străină.
    tp = "galati_map/tours.json"
    if tp in valid:
        for t in valid[tp].get("tours", []):
            seen: dict[str, int] = {}
            for i, s in enumerate(t.get("stops", [])):
                lid_dup = s.get("loc_id")
                if lid_dup and lid_dup in seen:
                    # Două opriri către aceeași fișă: turul afișează un contor
                    # mai mare decât numărul de puncte de pe hartă.
                    warn(f"tours.json {t['id']}: opririle {seen[lid_dup] + 1} și {i + 1} "
                         f"indică aceeași locație ({lid_dup})")
                elif lid_dup:
                    seen[lid_dup] = i
                lid = s.get("loc_id")
                if not lid:
                    err(f"tours.json {t['id']}: oprirea {i + 1} nu are loc_id")
                elif lid not in id_set:
                    err(f"tours.json {t['id']}: oprirea {i + 1} indică {lid}, care nu există")
                if "article" in s:
                    warn(f"tours.json {t['id']}: oprirea {i + 1} mai are câmpul „article” "
                         f"(rămășiță din vechea legătură; se poate șterge)")

    # treasure_hunts.json — `loc_id` e opțional (checkpoint-urile au lat/lon
    # proprii), dar dacă există trebuie să rezolve.
    hp = "galati_map/treasure_hunts.json"
    if hp in valid:
        for h in valid[hp].get("hunts", []):
            for cp in h.get("checkpoints", []):
                lid = cp.get("loc_id")
                if lid and lid not in id_set:
                    err(f"treasure_hunts.json {h['id']}.{cp.get('id')}: "
                        f"loc_id {lid} nu există")


def validate_timeline_events(valid: dict) -> None:
    """timeline_events.json — sursa unică pentru evenimentele cronologiei.

    Structura e consumată direct de js/modules/timeline.js: orice an de pe
    riglă (track_years) trebuie să existe în events, iar anii majori trebuie
    să fie un subset al celor de pe riglă — altfel apar gradații fără tooltip
    sau stiluri .major orfane.
    """
    tp = "galati_map/timeline_events.json"
    if tp not in valid:
        err("timeline_events.json missing or invalid")
        return
    data = valid[tp]
    y_min = data.get("min_year")
    y_max = data.get("max_year")
    events = data.get("events", [])
    if not isinstance(y_min, int) or not isinstance(y_max, int) or y_min >= y_max:
        err(f"timeline_events.json: min_year/max_year invalide ({y_min}/{y_max})")
        return
    if not events:
        err("timeline_events.json: lista events e goală")
        return
    ev_years = set()
    for e in events:
        y = e.get("year")
        if not isinstance(y, int) or not (y_min <= y <= y_max):
            err(f"timeline_events.json: an în afara intervalului [{y_min},{y_max}]: {y!r}")
        else:
            ev_years.add(y)
        if not (e.get("label") or "").strip():
            err(f"timeline_events.json: eveniment fără label la anul {y!r}")
    track = data.get("track_years", [])
    major = data.get("major_years", [])
    missing_track = [y for y in track if y not in ev_years]
    if missing_track:
        err(f"timeline_events.json: track_years fără eveniment corespunzător: {missing_track}")
    not_on_track = [y for y in major if y not in track]
    if not_on_track:
        err(f"timeline_events.json: major_years care nu sunt în track_years: {not_on_track}")
    print(f"  {len(events)} events, {len(track)} track, {len(major)} major — OK"
          if not (missing_track or not_on_track) else "")


def validate_image_references(valid: dict) -> None:
    """Fiecare imagine referențiată în date trebuie să existe pe disc —
    altfel e un 404 garantat în producție. Warning (non-blocant) ca să nu
    blocheze deploy-ul pe goluri istorice; de promovat la error când lista
    ajunge la zero."""
    refs: list[tuple[str, str]] = []  # (sursă, cale)

    def add(src_file: str, path: str | None) -> None:
        if path and not path.startswith(("http://", "https://", "data:")):
            refs.append((src_file, path))

    lp = "galati_map/locations.json"
    if lp in valid:
        locs = valid[lp] if isinstance(valid[lp], list) else valid[lp].get("locations", [])
        for L in locs:
            for fld in ("image", "image_then", "image_now"):
                add(f"locations.json {L.get('id')}", L.get(fld))
            for g in L.get("gallery") or []:
                add(f"locations.json {L.get('id')} gallery", g.get("src"))
    tp = "galati_map/tours.json"
    if tp in valid:
        for t in valid[tp].get("tours", []):
            add(f"tours.json {t.get('id')}", t.get("cover"))
    hp = "galati_map/treasure_hunts.json"
    if hp in valid:
        for h in valid[hp].get("hunts", []):
            add(f"treasure_hunts.json {h.get('id')}", h.get("cover"))
            for cp in h.get("checkpoints", []):
                for clue_key in ("clue", "next_clue"):
                    clue = cp.get(clue_key) or {}
                    add(f"treasure_hunts.json {h.get('id')}.{cp.get('id')}", clue.get("image"))
    ap = "galati_map/galati-altadata.json"
    if ap in valid and isinstance(valid[ap], list):
        for p in valid[ap]:
            add("galati-altadata.json", p.get("src"))
    for name in ("trivia", "legende"):
        kp = f"galati_map/{name}.json"
        if kp in valid and isinstance(valid[kp], list):
            for item in valid[kp]:
                add(f"{name}.json {item.get('id')}", item.get("image"))

    missing = [(src, p) for src, p in refs if not (GMAP / p).resolve().exists()]
    print(f"  {len(refs)} referințe de imagini verificate")
    if missing:
        warn(f"{len(missing)} imagini referențiate lipsesc de pe disc:")
        for src, p in missing[:10]:
            print(f"      • {src} → {p}")
        if len(missing) > 10:
            print(f"      … și încă {len(missing) - 10}")


INDEX_HEAVY_FIELDS = {
    "description", "description_en", "gallery",
    "image_then", "image_now", "image_then_year", "image_now_year",
}


def validate_thumbnails(valid: dict) -> None:
    """Miniaturile de 480px (assets/thumbs/) există pentru imaginile din listă?

    Sursa de adevăr e `scripts/build_thumbnails.py`; aici doar verificăm că a fost
    rulat. Lipsa unei miniaturi NU e eroare — `thumbUrl()` din core-map.js are
    fallback `onerror` pe original, deci pagina arată corect, doar transferă mai
    mult. Rămâne warning ca să fie vizibil la commit.
    """
    IMAGES_DIR, THUMBS_DIR = "assets/images/", "assets/thumbs/"

    def norm(src):
        if not src or not isinstance(src, str):
            return None
        s = src.lstrip("./")
        while s.startswith("../"):
            s = s[3:]
        return s if s.startswith(IMAGES_DIR) else None

    wanted = set()
    lp = "galati_map/locations.json"
    if lp in valid:
        locs = valid[lp] if isinstance(valid[lp], list) else valid[lp].get("locations", [])
        for L in locs:
            if (n := norm(L.get("image"))):
                wanted.add(n)
    for fname, key in (("tours.json", "tours"), ("treasure_hunts.json", "hunts")):
        p = f"galati_map/{fname}"
        if p in valid:
            for it in valid[p].get(key, []) or []:
                if (n := norm(it.get("cover"))):
                    wanted.add(n)
    ap = "galati_map/galati-altadata.json"
    if ap in valid and isinstance(valid[ap], list):
        for ph in valid[ap]:
            if (n := norm(ph.get("src"))):
                wanted.add(n)

    missing = [r for r in sorted(wanted)
               if not (ROOT / (THUMBS_DIR + r[len(IMAGES_DIR):] + ".webp")).exists()]
    print(f"  {len(wanted)} miniaturi așteptate, {len(wanted) - len(missing)} prezente")
    if missing:
        warn(f"{len(missing)} miniaturi lipsesc — rulează: python3 scripts/build_thumbnails.py")
        for r in missing[:5]:
            print(f"      • {r}")
        if len(missing) > 5:
            print(f"      … și încă {len(missing) - 5}")


def validate_locations_index(valid: dict) -> None:
    """locations-index.json (varianta ușoară, încărcată la primul paint) trebuie
    să fie sincron cu locations.json — altfel prod ar servi un index învechit.
    E un fișier DERIVAT: dacă diferă, rulează `python3 scripts/build_data_index.py`."""
    lp = "galati_map/locations.json"
    if lp not in valid:
        return
    idx_path = GMAP / "locations-index.json"
    if not idx_path.exists():
        err("locations-index.json lipsește — rulează scripts/build_data_index.py")
        return
    locs = valid[lp] if isinstance(valid[lp], list) else valid[lp].get("locations", [])
    expected = [{k: v for k, v in L.items() if k not in INDEX_HEAVY_FIELDS} for L in locs]
    try:
        actual = json.loads(idx_path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as e:
        err(f"locations-index.json invalid: {e}")
        return
    if actual != expected:
        err("locations-index.json e DESINCRONIZAT cu locations.json — "
            "rulează scripts/build_data_index.py și comite rezultatul")
    else:
        print(f"  locations-index.json: sincron ({len(actual)} locații)")


def validate_text_hygiene(valid: dict) -> None:
    """Două clase de defecte care au trecut nevăzute pe lângă lint_content.py.

    1. Terminatoarele de linie Windows. Rendererul (`core-map.js`, `renderBlock`)
       taie blocurile pe `\\n\\n`, secvență care nu apare NICIODATĂ în `\\r\\n\\r\\n`.
       Opt fișe aveau CRLF în `description_en` și se afișau ca un singur bloc:
       fără `KEY FACTS`, fără liste, fără subtitluri. Linterul le trecea drept
       conforme fiindcă el normalizează `\\r\\n` înainte de a valida, iar
       rendererul nu.

    2. Punctuația din `title` și `location`. `lint_content.py` verifică doar
       `description`, așa că titlurile au rămas cu em dash-uri și ghilimele
       drepte, adică exact ce s-a curățat din descrieri. Se repară cu
       `scripts/clean_short_fields.py`.
    """
    lp = "galati_map/locations.json"
    if lp not in valid:
        return
    locs = valid[lp] if isinstance(valid[lp], list) else valid[lp].get("locations", [])

    crlf = [f"{L.get('id')}.{f}" for L in locs
            for f in ("title", "description", "excerpt", "location",
                      "title_en", "description_en", "excerpt_en", "location_en")
            if isinstance(L.get(f), str) and "\r" in L[f]]
    if crlf:
        err(f"{len(crlf)} câmpuri cu CRLF (rendererul le vede ca un singur bloc): "
            + ", ".join(crlf[:5]) + ("…" if len(crlf) > 5 else ""))

    # Trimiterile „(loc-N)" din proză sunt scrise de mână și nu erau verificate
    # nicăieri: `loc-258` trimitea la `loc-81` și `loc-262` la `loc-179`, fișe
    # care nu există, iar `loc-266` numea „Stadionul Dunărea (loc-167)", unde
    # `loc-167` e Foișorul de pe Faleză. Cititorul ajungea pe altă fișă.
    ids = {L.get("id") for L in locs}
    dead = sorted({(L.get("id"), m.group(0)) for L in locs
                   for f in ("description", "description_en", "excerpt", "excerpt_en")
                   for m in re.finditer(r"\bloc-\d+\b", L.get(f) or "")
                   if m.group(0) not in ids})
    if dead:
        err(f"{len(dead)} trimiteri către fișe inexistente: "
            + ", ".join(f"{a}→{b}" for a, b in dead[:5])
            + ("…" if len(dead) > 5 else ""))

    checks = (("—", "em dash"), ("–", "en dash"), ("→", "săgeată"))
    dirty: list[str] = []
    for L in locs:
        for f in ("title", "title_en", "location", "location_en"):
            v = L.get(f)
            if not isinstance(v, str) or not v:
                continue
            for ch, label in checks:
                # Liniuța dintre cifre e interval de ani, nu punctuație de proză.
                if re.search(rf"(?<!\d)\s*{re.escape(ch)}|{re.escape(ch)}\s*(?!\d)", v):
                    dirty.append(f"{L.get('id')}.{f} ({label})")
                    break
            else:
                bad_q = '"' in v or ("„" in v if f.endswith("_en") else "“" in v)
                if bad_q:
                    dirty.append(f"{L.get('id')}.{f} (ghilimele)")
    if dirty:
        warn(f"{len(dirty)} titluri/adrese cu punctuație interzisă — rulează "
             f"scripts/clean_short_fields.py: " + ", ".join(dirty[:5])
             + ("…" if len(dirty) > 5 else ""))
    if not crlf and not dirty and not dead:
        print(f"  igienă text: {len(locs)} fișe, fără CRLF, fără punctuație interzisă, "
              f"trimiteri (loc-N) valide")


def audit_i18n_coverage(valid: dict) -> None:
    """Raport de acoperire a traducerilor EN (pct. 11 din STRUCTURA).

    Câmpurile de bază (title/description/excerpt) sunt complet traduse —
    o locație NOUĂ fără description_en devine warning, ca regresia să fie
    vizibilă la commit. Legendele de galerie/foto sunt gol cunoscut: doar
    raportăm procentul, fără warning.
    """
    def has(v) -> bool:
        return bool((v or "").strip())

    lp = "galati_map/locations.json"
    if lp in valid:
        locs = valid[lp] if isinstance(valid[lp], list) else valid[lp].get("locations", [])
        n = len(locs)
        for fld in ("title", "description", "excerpt", "location"):
            # Numărăm doar intrările care AU conținut RO — un câmp gol în RO
            # nu are ce traducere să primească.
            with_ro = [L for L in locs if has(L.get(fld))]
            missing = [L.get("id") for L in with_ro if not has(L.get(f"{fld}_en"))]
            pct = 100 * (len(with_ro) - len(missing)) // max(1, len(with_ro))
            print(f"  locations.{fld}_en: {len(with_ro) - len(missing)}/{len(with_ro)} ({pct}%)")
            if missing and fld in ("title", "description"):
                warn(f"locations.json: {len(missing)} intrări cu {fld} RO dar fără {fld}_en: {missing[:5]}…")
        gal = [(L.get("id"), g) for L in locs for g in (L.get("gallery") or []) if has(g.get("caption_ro") or g.get("caption"))]
        gal_en = sum(1 for _, g in gal if has(g.get("caption_en")))
        if gal:
            print(f"  locations.gallery caption_en: {gal_en}/{len(gal)} ({100 * gal_en // len(gal)}%)")

    ap = "galati_map/galati-altadata.json"
    if ap in valid and isinstance(valid[ap], list):
        photos = [p for p in valid[ap] if has(p.get("caption_ro"))]
        a_en = sum(1 for p in photos if has(p.get("caption_en")))
        print(f"  altadata caption_en: {a_en}/{len(photos)} ({100 * a_en // max(1, len(photos))}%)")

    tp = "galati_map/tours.json"
    if tp in valid:
        tours = valid[tp].get("tours", [])
        t_en = sum(1 for t in tours if (t.get("i18n") or {}).get("en"))
        print(f"  tours i18n.en: {t_en}/{len(tours)}")
        if t_en < len(tours):
            warn(f"tours.json: {len(tours) - t_en} tururi fără i18n.en")


def main() -> int:
    print("Validating Heritage Galați data files…\n")

    print("📋 JSON syntax:")
    valid = validate_json_syntax()
    print(f"  {len(valid)} files OK")

    print("\n📋 locations.json integrity:")
    loc_data = valid.get("galati_map/locations.json")
    if loc_data:
        validate_locations(loc_data)
    else:
        err("locations.json missing or invalid")

    print("\n📋 Cross-references (tours + hunts → locations):")
    validate_cross_references(valid)

    print("\n📋 timeline_events.json (sursa cronologiei):")
    validate_timeline_events(valid)

    print("\n📋 Imagini referențiate → există pe disc:")
    validate_image_references(valid)

    print("\n📋 Miniaturi 480px (assets/thumbs/) → există pe disc:")
    validate_thumbnails(valid)

    print("\n📋 locations-index.json sincron cu locations.json:")
    validate_locations_index(valid)

    print("\n📋 Igienă text (CRLF, punctuație în titluri și adrese):")
    validate_text_hygiene(valid)

    print("\n📋 Acoperire traduceri EN (i18n):")
    audit_i18n_coverage(valid)

    print()
    if errors:
        print(f"✗ {len(errors)} ERROR(s) found. Fix before commit.")
        return 1
    if warnings:
        print(f"⚠ {len(warnings)} warning(s) (non-blocking).")
    print("✓ All data files valid.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
