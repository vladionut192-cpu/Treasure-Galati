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


def validate_cross_references(valid: dict) -> None:
    """Verify tours.json + treasure_hunts.json refer to existing locations."""
    if "galati_map/locations.json" not in valid:
        return
    locs = valid["galati_map/locations.json"]
    locs_list = locs if isinstance(locs, list) else locs.get("locations", [])
    id_set = {L.get("id") for L in locs_list if L.get("id")}
    art_set = {L.get("article") for L in locs_list if L.get("article")}

    # tours.json
    tp = "galati_map/tours.json"
    if tp in valid:
        for t in valid[tp].get("tours", []):
            for s in t.get("stops", []):
                art = s.get("article")
                if art and art not in art_set:
                    warn(f"tours.json {t['id']}: orphan article {art}")

    # treasure_hunts.json
    hp = "galati_map/treasure_hunts.json"
    if hp in valid:
        for h in valid[hp].get("hunts", []):
            for cp in h.get("checkpoints", []):
                lid = cp.get("loc_id")
                if lid and lid not in id_set:
                    warn(f"treasure_hunts.json {h['id']}.{cp.get('id')}: orphan loc_id {lid}")


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
