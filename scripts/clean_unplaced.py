#!/usr/bin/env python3
"""Curăță `galati_map/unplaced_locations.json`:
1. Elimină intrările care sunt deja pe hartă (sub același nume sau ca variantă)
2. Adaugă câmpul `kind` pentru cele rămase: place|person|family|topic|event

Hartă manuală a duplicatelor — bazată pe analiza din `unplaced_review.md`.
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
UNPLACED = ROOT / "galati_map" / "unplaced_locations.json"

# Duplicate explicite — corespondent pe hartă (cheia e slug-ul fișierului article)
PLACED_DUPLICATES = {
    # slug-from-unplaced → loc-id pe hartă (sau notă)
    "casa-cavallioti": "loc-* Casele Cavallioti",
    "catedrala-episcopala-din-galati": "loc-116 Catedrala Episcopală Sf. Nicolae",
    "catedrala-episcopala-din-gala": "duplicat al rândului anterior",
    "palatul-de-justitie-universitatea": "loc-* Palatul de Justiție (UDJ)",
    "palatul-prefectural": "loc-* Palatul Administrativ",
    "casa-bals": "loc-* Casa Balș",
    "casa-gheorghiadis": "loc-* Casa Gheorghiadis",
    "casa-auschnitt": "loc-* OSIAS / MAX AUSCHNITT",
    "pescarille-statului": "loc-* Palatul Pescăriilor Statului",
    "rezidenta-regala-la-galati-in-timpul-dictaturii-carliste": "loc-* Palatul Robescu",
    "ioan-d-prodrom-str-domneasca-nr-23-25": "loc-* Casa Ioan D. Prodrom",
    "familia-si-casele-plesnila": "loc-* Casa Plesnilă",
    "casa-gheorghe-radu-banica-grigorescu": "loc-* Casa Bănică Grigorescu",
    "foscolo-comercianti-si-diplomati": "loc-* Casa Charles Foscolo",
    "casa-sebastian-eustatiu-str-melchisedec-stefanescu-cc-mihai-bravu": "loc-* Casa Amiralului Eustațiu Sebastian",
    "grand-hotel-ridicat-de-elie-climis-str-domneasca-nr-30-36": "loc-* Grand Hotel",
    "biserica-fortificata-sf-gheorghe-disparuta-initial-aflata-pe-promontoriul-falezei-dunarii-in-linie-directa-v-e-cu-biserica-sf-precista": "loc-96 Biserica fortificată Sf. Gheorghe",
    "institutul-catolic-pensionul-de-fete-notre-dame-de-sion-in-prezent-sediul-mai-multor-facultati-din-cadrul-universitatii-dunarea-de-jos-din-galati": "loc-117 Institutul Catolic Notre Dame de Sion",
    "fantina-arteziana-puful-de-papadie-str-brailei-intersectia-cu-str-cosbuc": "loc-121 Fântâna Puful de Păpădie",
    # Note: alegoriile Storck sunt pe Palatul Administrativ (deja pe hartă) — pot fi eliminate
    "alegoriile-industria-si-agricultura-sculptor-frederic-storck-galati": "loc-* Palatul Administrativ (alegorii pe fațadă)",
}

# Categorisire pentru intrările care rămân
KINDS = {
    # Persoane (biografii fără clădire-pin separată)
    "dimitrie-frigator": "person",
    "ioan-d-prodrom": "person",
    "medicul-aristide-serfioti": "person",
    # Familii (despre familie, nu o casă specifică)
    "figuri-din-familia-draganescu": "family",
    "dallorso": "family",
    # Subiecte / eseuri (fără pin natural)
    "proiectul-edilitar-al-tiglinei": "topic",
    "vadurile-galatiului": "topic",
    "despre-consulatul-rusesc-din-galati": "topic",
    "despre-charles-cunningham-si-reprezentanta-consulara-britanica-la-galati-in-secolul-al-xix-lea": "topic",
    # Evenimente
    "batalia-de-la-galati-1918": "event",
    # Foto
    "foto-vaporul-principesa-maria-in-portul-galati": "photo",
    # Place — candidate cu adresă, dar lipsă cercetare suplimentară
    "casa-draganescu": "place",
    "casa-carp": "place",
    "casa-cordali": "place",
    "mandanis-si-berila": "place",
    "casa-lui-nicolae-dumitrescu-maican-contra-amiral-al-marinei-militare-romane-str-domneasca-nr-89bis": "place",
    "palatul-scolilor-comerciale": "place",
    # Approximative — adăugate din research_round2 (au sursă, dar adresa e imprecisă)
    "hotel-dacia-casele-calergi": "place",
    "hotel-victoria-strada-brasoveni": "place",
    "sala-alcazar-fratii-antachi": "place",
    "cinema-trianon-republica": "place",
    "cinema-scala-strada-bratianu": "place",
    "banca-marmorosch-blank-co": "place",
    "fabrica-cherestea-goetz-co": "place",
    "fabrica-albina-max-fischer": "place",
    "templul-coral-sinagoga-cuza-voda": "place",
    "sinagoga-strada-razboieni-israelita": "place",
}


def slug_of(article: str) -> str:
    parts = article.strip("/").split("/")
    if len(parts) >= 2 and parts[-1] == "index.html":
        return parts[-2]
    return ""


def main():
    with open(UNPLACED, encoding="utf-8") as f:
        unplaced = json.load(f)

    kept = []
    removed = []
    untagged = []

    for entry in unplaced:
        slug = slug_of(entry.get("article", ""))
        if slug in PLACED_DUPLICATES:
            entry_with_reason = dict(entry, _reason=PLACED_DUPLICATES[slug])
            removed.append(entry_with_reason)
            continue
        kind = KINDS.get(slug)
        if kind:
            new_entry = dict(entry, kind=kind)
            kept.append(new_entry)
        else:
            kept.append(entry)
            untagged.append(slug or entry.get("title"))

    with open(UNPLACED, "w", encoding="utf-8") as f:
        json.dump(kept, f, ensure_ascii=False, indent=2)

    print(f"📋 Pornit cu {len(unplaced)} intrări neplasate")
    print(f"🗑️  Eliminat {len(removed)} duplicate ale unor pinuri pe hartă:")
    for r in removed:
        print(f"    - {r['title'][:65]} → {r['_reason']}")
    print(f"✅ Păstrat {len(kept)} intrări (cu câmp `kind` pe cele {len(kept) - len(untagged)} cunoscute)")
    if untagged:
        print(f"⚠️  {len(untagged)} fără `kind` (slug nedetectat în KINDS):")
        for s in untagged:
            print(f"    - {s}")

    # Stats by kind
    from collections import Counter
    kc = Counter(e.get("kind") for e in kept)
    print("\nDistribuție pe `kind`:")
    for k, n in sorted(kc.items(), key=lambda x: (-x[1], x[0] or "")):
        print(f"  {k or '(none)':>12}: {n}")


if __name__ == "__main__":
    main()
