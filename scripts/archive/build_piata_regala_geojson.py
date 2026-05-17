#!/usr/bin/env python3
"""Construiește galati_map/piata_regala_buildings.geojson din date Python.

Avantaj: scapă de bugurile de quoting român cu " (U+201D) vs " (ASCII)
care apar la editare manuală.
"""
import json
from pathlib import Path

OUT = Path(__file__).resolve().parent.parent / "galati_map" / "piata_regala_buildings.geojson"

# Folosim ”...” (Romanian curly quotes U+201E + U+201D) sau ‘...’ pentru ghilimele interne.
# Asta evită conflictul cu ghilimelele JSON.

DATA = {
    "type": "FeatureCollection",
    "metadata": {
        "title": "Piața Regală — clădiri pilot pentru AR",
        "description": "Cele 5 clădiri-pilot din Piața Regală a Galațiului (1880-1944), distrusă de armata germană în noaptea de 24-25 august 1944. Surse: Mitrof 2017 (Historia Urbana XXV), Sandel Dumitru, fotografii pubcrawl.",
        "historic_center": {
            "lat": 45.4348,
            "lon": 28.0556,
            "note": "Centrul istoric estimat al Pieței Regale (1912-1944). Statuia Costache Negri se afla aici înainte de 1944. După distrugere a fost mutată în Parc Spicul (45.4331, 28.0557).",
        },
        "destruction_zone_polygon": [
            [28.0540, 45.4340],
            [28.0570, 45.4340],
            [28.0570, 45.4395],
            [28.0540, 45.4395],
            [28.0540, 45.4340],
        ],
        "destruction_date": "1944-08-24/25 (noapte)",
        "destruction_actor": "Armata germană în retragere — minare + bombe incendiare",
    },
    "features": [
        # ─── 1. STATUIA COSTACHE NEGRI ───
        {
            "type": "Feature",
            "id": "pr-statuie-negri",
            "geometry": {"type": "Point", "coordinates": [28.0556, 45.4348]},
            "properties": {
                "name": "Statuia Costache Negri",
                "subtitle": "Centrul Pieței Regale",
                "year_built": 1912,
                "year_destroyed": None,
                "fate": "Frântă de explozii 1944, repoziționată ulterior în Parc Spicul",
                "category": "Monument",
                "historic_image": "../assets/images/pubcrawl/11-piata-regala_05.jpg",
                "historic_image_caption": "Dezvelirea statuii — 17 iunie 1912",
                "ar": {"billboard_height_m": 5, "billboard_width_m": 4, "facing_bearing": 0, "altitude_m": 2},
                "description": "Bronz 2,80 m pe soclu de piatră de Câmpulung. Sculptor: Ioan Iordăchescu. Inițiator: primarul Pantelimon D. Petrovici (martie 1909). Dezvelită la 17 iunie 1912, la 100 de ani de la nașterea lui Negri, în prezența lui Nicolae Iorga, Duiliu Zamfirescu, ministrul D.S. Nenițescu.",
                "facts": [
                    "Costache Negri: pârcălab de Covurlui 1851-1855",
                    "Vasile Alecsandri visase această statuie pe cheiul Galațiului",
                    "Sub-1912: în mijloc era doar un felinar de stradă cu 4 brațe",
                    "Astăzi: în Parc Spicul (str. Domnească 12), 150m mai la sud",
                ],
                "citation": None,
                "linked_loc_id": "loc-84",
            },
        },
        # ─── 2. HOTEL IMPERIAL + BAZARUL ROMÂN ───
        {
            "type": "Feature",
            "id": "pr-hotel-imperial",
            "geometry": {"type": "Point", "coordinates": [28.0552, 45.4350]},
            "properties": {
                "name": "Hotel Imperial + Bazarul Român",
                "subtitle": "Pe locul fostului Han al lui Paraschiv",
                "year_built": None,
                "year_destroyed": 1944,
                "fate": "Distrus la 24-25 august 1944 prin minare germană",
                "category": "Hotel + magazin",
                "historic_image": "../assets/images/pubcrawl/11-piata-regala_06.jpg",
                "historic_image_caption": "Piața Regală anterior 1912 — Hotel Imperial (stânga), Bazarul Român (centru), Magazinul de băuturi Leon Lilienfeld (dreapta), tramvai pe str. Brăilei",
                "ar": {"billboard_height_m": 8, "billboard_width_m": 12, "facing_bearing": 90, "altitude_m": 5},
                "description": "Hotelul Imperial s-a edificat pe locul Hanului lui Paraschiv (proprietate a paharnicului Paraschiv Șerban, propr. moșia Băleni) — un han faimos al sec. XIX unde se adunau italienii Delvechio, Fanciotti, Dumitru Rodocanachi, Sachiari, Vlasto. Tânărul Alexandru Cuza venea aici să se întâlnească cu Alexandru Chiparis (dragoman Consulatul Austriei) și Librecht.",
                "facts": [
                    "Bazarul Român — magazin general extins",
                    "Magazinul Leon Lilienfeld — băuturi, „Prima Specialitate Licor[uri]”",
                    "Toate trei distruse simultan în noaptea de 24-25 august 1944",
                    "Refacerea împiedicată după 1947 de regimul comunist",
                ],
                "citation": "Mitrof 2017, p. 70-72",
                "linked_loc_id": None,
            },
        },
        # ─── 3. CASA HELDER ───
        {
            "type": "Feature",
            "id": "pr-casa-helder",
            "geometry": {"type": "Point", "coordinates": [28.0558, 45.4350]},
            "properties": {
                "name": "Casa & Bijuteria Helder",
                "subtitle": "Domnească 14 — turnul cu ceasul vienez",
                "year_built": None,
                "year_destroyed": 1944,
                "fate": "Distrusă la 24-25 august 1944 — surprinsă „sub cenușa flăcărilor ultimului război” (Sandel)",
                "category": "Casă comercială + bijuterie",
                "historic_image": "../assets/images/pubcrawl/11-piata-regala_17.jpg",
                "historic_image_caption": "Strada Domnească anii ’30 — vedere spre statuia Costache Negri",
                "ar": {"billboard_height_m": 14, "billboard_width_m": 10, "facing_bearing": 270, "altitude_m": 7},
                "description": "Casa Helder era o clădire spectaculoasă în Piața Regală: 2 etaje + parter + TURN cu ceas „cât o roată de car, care mergea cu precizie astronomică”. Stil vienez — „unul din turnurile primăverii vieneze”. Tot orașul își potrivea ceasul după ea. Proprietar: Moritz Helder, evreu născut în Austria, atestat 1910. Furnizor al casei regale (sub coroana ținută de lei pe vitrină).",
                "facts": [
                    "Adresa: str. Domnească nr. 14",
                    "2 etaje + parter + turn cu ceas — stil vienez",
                    "Vecin la sud cu Casa Crissoveloni",
                    "Iorgu Iordan (Memorii): „un magazin Helder putea face figură frumoasă într-o metropolă occidentală”",
                ],
                "citation": "Sandel Dumitru vol VII; Iorgu Iordan, Memorii",
                "linked_loc_id": None,
            },
        },
        # ─── 4. HOTEL SPLENDID ───
        {
            "type": "Feature",
            "id": "pr-hotel-splendid",
            "geometry": {"type": "Point", "coordinates": [28.0560, 45.4348]},
            "properties": {
                "name": "Hotel Splendid",
                "subtitle": "3 etaje neoclasice, balconul fotografului E. Balaș",
                "year_built": None,
                "year_destroyed": 1944,
                "fate": "Distrus la 24-25 august 1944",
                "category": "Hotel",
                "historic_image": "../assets/images/pubcrawl/11-piata-regala_01.jpg",
                "historic_image_caption": "Piața Regală — Anii 1900, cu firma SPLENDID vizibilă pe acoperiș",
                "ar": {"billboard_height_m": 12, "billboard_width_m": 14, "facing_bearing": 270, "altitude_m": 6},
                "description": "Hotel Splendid era unul dintre cele mai mari hoteluri de pe Piața Regală. De pe balconul lui, fotograful gălățean E. Balaș a făcut o serie întreagă de ilustrate care au făcut din piață o emblemă a orașului-port. Tramvaiul venea din Portul Galați pe str. Speranței și trecea pe lângă el spre str. Mavromol și str. Portului, înainte de 1912.",
                "facts": [
                    "Firmă mare „SPLENDID” pe acoperiș (vizibilă în foto 1900)",
                    "Punctul preferat al fotografului E. Balaș pentru ilustrate",
                    "Tramvaiul Portul → Bursa → Piața Regală → Traian → Spital trecea pe lângă el",
                    "Distrus 1944",
                ],
                "citation": "Sandel Dumitru vol VII",
                "linked_loc_id": None,
            },
        },
        # ─── 5. BODEGA SURÉ ───
        {
            "type": "Feature",
            "id": "pr-sure",
            "geometry": {"type": "Point", "coordinates": [28.05607, 45.43628]},
            "properties": {
                "name": "Restaurant, Berărie & Bodega Suré",
                "subtitle": "„Unde se întâlnește elita gălățeană”",
                "year_built": None,
                "year_destroyed": 1944,
                "fate": "Distrus la 24-25 august 1944. Refacere blocată după 1947.",
                "category": "Restaurant + brasserie",
                "historic_image": "../assets/images/pubcrawl/11-piata-regala_18.jpg",
                "historic_image_caption": "Strada Domnească 1937 — corso-ul gălățean",
                "ar": {"billboard_height_m": 10, "billboard_width_m": 12, "facing_bearing": 180, "altitude_m": 5},
                "description": "Bodega Suré era reperul nordic al corso-ului gălățean. Plimbarea de duminică îi ducea pe gălățeni „de la Grădina Publică până la Suré”, după mărturia lui Ethel Greening Pantazzi (Romania in Light and Shadow, 1921). Reclamă din mai 1931, „Vocea Galaţilor”: „Unde se întâlnește elita gălățeană? La Restaurantul, Berăria și Bodega Suré! Bere Luther. Seara concertează Jazul Weinstein.”",
                "facts": [
                    "Mese așezate direct pe stradă, blocând pasajul în mai-iunie",
                    "Bere Luther + Jazul Weinstein în serile interbelice",
                    "Iorgu Iordan: „Suré putea face figură frumoasă într-o metropolă occidentală”",
                    "Pe 7 august 1932 — incendiu care a distrus parțial imobilul",
                ],
                "citation": "Mitrof 2017; Pantazzi 1921; Iorgu Iordan",
                "linked_loc_id": "loc-127",
            },
        },
    ],
}


def main():
    OUT.write_text(
        json.dumps(DATA, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(f"Wrote {OUT.relative_to(OUT.parent.parent)} — {len(DATA['features'])} features")
    # Validate
    json.loads(OUT.read_text(encoding="utf-8"))
    print("JSON syntax: OK")


if __name__ == "__main__":
    main()
