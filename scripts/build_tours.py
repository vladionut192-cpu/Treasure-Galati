#!/usr/bin/env python3
"""Generează `galati_map/tours.json` din narativul „Pub Crawl Cultural"
disponibil în `Surse/cheatsheet.txt`. Tururile referă pin-urile din
`locations.json` prin câmpul `article`.
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
LOC_JSON = ROOT / "galati_map" / "locations.json"
TOURS_JSON = ROOT / "galati_map" / "tours.json"


def find_article_by_id(locations, loc_id):
    for loc in locations:
        if loc["id"] == loc_id:
            return loc["article"]
    raise ValueError(f"Nu am găsit {loc_id}")


def main():
    with open(LOC_JSON, encoding="utf-8") as f:
        locations = json.load(f)

    A = lambda lid: find_article_by_id(locations, lid)

    # ─────────────────────────────────────────────────────────────
    # Pub Crawl Cultural — 5 etape, ~4-4.5h
    # Bazat pe Surse/cheatsheet.txt (traseu Hops → Bodega → Union Jack → Daily → Craft → Hops)
    # ─────────────────────────────────────────────────────────────
    pub_crawl = {
        "id": "tour-pub-crawl-cultural",
        "title": "Pub Crawl Cultural prin Galați",
        "subtitle": "5 etape · ~4-4.5 ore · de la Țiglina la Faleză și înapoi",
        "description": (
            "Tur tematic în 5 etape care îmbină istoria orașului-port cu o "
            "rută de baruri pe traseul Hops Gallery → Bodega → Union Jack "
            "(Faleză) → DAily → Craft → înapoi la Hops Gallery. La fiecare "
            "oprire pe hartă vei găsi povestea aferentă — de la cărămizi "
            "comuniste din Țiglina la castrul roman Tirighina, de la berea "
            "Ploll la portul liber, de la legenda tunelului de sub Dunăre la "
            "Bătălia de la Galați 1918.\n\n"
            "Sursa narativă: cheatsheet-ul ghidului oficial al pub-crawl-ului "
            "(Surse/cheatsheet.txt). Adaptează ritmul cum vrei — fiecare "
            "oprire e o piatră de hotar, nu o constrângere."
        ),
        "cover": "",
        "category": "Cultural",
        "color": "#c44d2e",
        "stops": [
            # ── ETAPA 1: Țiglina (Hops Gallery → Bodega) ~30 min
            {
                "article": A("loc-112"),
                "note": (
                    "ETAPA 1 — Hops Gallery (start). Cinematograful Țiglina, "
                    "deschis pe 13 aprilie 1964, cu sală Cinemascop de 800 de "
                    "locuri și aer condiționat — spectacular pentru epocă. "
                    "Deasupra Hops Gallery era restaurantul „Galați”, poreclit "
                    "„Distrugătorul” pentru că salariații Combinatului intrau "
                    "în ziua de salariu și ieșeau distruși."
                ),
            },
            {
                "article": A("loc-111"),
                "note": (
                    "Coloana monumentală „Progresul”, ridicată în 1966 de "
                    "Péter Balogh — registre sculptate cu scene de muncă din "
                    "industrie și agricultură. Limbaj propagandistic clasic "
                    "anilor ’60, dar interesant artistic."
                ),
            },
            {
                "article": A("loc-115"),
                "note": (
                    "(Privire spre sud-vest) Tirighina-Bărboși — castrul roman "
                    "de pe dealul Tirighina (sec. I-II d.Hr.), care controla "
                    "confluența Siretului cu Dunărea. Numele „Țiglina” NU vine "
                    "de la romani, ci de la fabricile vechi de țiglă. Curiozitate: "
                    "peste castrul roman zace o rezervație paleontologică cu "
                    "fosile de moluște vechi de 400.000 de ani."
                ),
            },
            {
                "article": A("loc-21"),
                "note": (
                    "Casa de Cultură a Sindicatelor, inaugurată 4 octombrie "
                    "1969, închinată la deschidere lui Gheorghe Gheorghiu-Dej. "
                    "Pe esplanadă, între 1971-1989, era bustul lui Dej — "
                    "dărâmat de mulțime pe 22 decembrie 1989."
                ),
            },
            {
                "article": A("loc-97"),
                "note": (
                    "În fața actualei Case de Cultură era Biserica „Sfânta "
                    "Sofia” — piatra de temelie pusă în 1872, dărâmată „cu "
                    "tancul” în decembrie 1963, în plină iarnă. O victimă "
                    "tipică a sistematizărilor comuniste."
                ),
            },
            {
                "article": A("loc-90"),
                "note": (
                    "Colegiul Național „Costache Negri” — fondat în 1877 la "
                    "Ismail (azi Ucraina) după inițiativa lui V. A. Urechia. "
                    "Mutat la Galați în 1878 după reocuparea sudului Basarabiei. "
                    "Spiru Haret a obținut un milion de lei pentru sediul "
                    "propriu."
                ),
            },
            # ── ETAPA 2: spre Faleză (Bodega → Union Jack) ~45 min
            {
                "article": A("loc-110"),
                "note": (
                    "ETAPA 2 — Fabrica de Bere Ploll, prima fabrică de bere "
                    "din Galați (1842, Marcu Schein), preluată după 1860 de "
                    "cehul Josef Ploll. La sfârșitul sec. XIX era cea mai "
                    "scumpă bere românească — un litru costa dublu față de "
                    "vin. Livrare cu 24 cai și 12 perechi de boi. "
                    "Fabrica Ploll → fam. Petrina → Spitalul Trancu-Iași → "
                    "Casa Copilului."
                ),
            },
            {
                "article": A("loc-73"),
                "note": (
                    "Palatul Comisiunii Europene a Dunării (azi Biblioteca "
                    "V.A. Urechia). Comisia Europeană a Dunării și-a început "
                    "activitatea în 1856 la Galați — prima organizație "
                    "supranațională europeană din România. Drapel propriu, "
                    "angajați din multe țări, statut de extrateritorialitate. "
                    "O bucată din Galați era „pământ european” cu 100 de ani "
                    "înainte de UE."
                ),
            },
            {
                "article": A("loc-99"),
                "note": (
                    "Casa Cuza Vodă (Muzeul Cuza, Domnească 80). Înainte de "
                    "Unire, Cuza și Costache Negri se gândeau serios la "
                    "Galați ca nouă capitală a Principatelor — orașul era "
                    "cel mai mare port comercial al Moldovei și gazda CED."
                ),
            },
            # ── ETAPA 3: Union Jack → DAily ~50 min — bogat în legende
            {
                "article": A("loc-4"),
                "note": (
                    "ETAPA 3 — Biserica Precista (1643-1647, Vasile Lupu). "
                    "Cea mai veche clădire din Galați. Nu e doar biserică — "
                    "e o cetate: ziduri de 1,80 m grosime, pod fortificat cu "
                    "28 metereze, turn de strajă. LEGENDA TUNELULUI DE SUB "
                    "DUNĂRE: boierii moldoveni ar fi săpat un tunel pe sub "
                    "Dunăre pentru a-și feri averile de turci. Sâmburele de "
                    "adevăr: directorul Muzeului confirmă o galerie reală de "
                    "300 m între Precista și Sf. Gheorghe."
                ),
            },
            {
                "article": A("loc-96"),
                "note": (
                    "Biserica fortificată Sf. Gheorghe (dispărută 1962). "
                    "Pereche cu Precista, la 300 m est. Hatmanul cazac Ivan "
                    "Mazepa, eroul antirus ucrainean, a fost îngropat aici "
                    "în 1709 (apare azi pe bancnota ucraineană de 10 grivne). "
                    "Demolare brutală: angajații Navrom au tras biserica cu "
                    "remorcherele în Dunăre după ce zidurile au rezistat la "
                    "injectarea de apă sub fundație."
                ),
            },
            {
                "article": A("loc-85"),
                "note": (
                    "Statuia lui Ion C. Brătianu, pe Faleză. Bonus port-liber: "
                    "între 1837 și 1882 Galațiul a fost port liber — orice "
                    "vapor putea acosta fără taxe. Plecau curse de aici "
                    "spre Marsilia, Genova, Istanbul, Alexandria, Pireu și "
                    "chiar New York (cu escală)."
                ),
            },
            {
                "article": A("loc-76"),
                "note": (
                    "Palatul Navigației — instituția care coordona traficul "
                    "fluvial. Galațiul avea, la apogeu, 21 de consulate și "
                    "vice-consulate, iar înainte de Primul Război Mondial "
                    "erau active 16 — densitate diplomatică mai mare decât "
                    "au astăzi multe capitale europene."
                ),
            },
            {
                "article": A("loc-103"),
                "note": (
                    "Monumentul Docherilor — pe promenadă, lateral est al "
                    "Palatului Navigației. În jurul lui 1912, un tânăr pe "
                    "nume Gheorghe Gheorghiu-Dej lucra ca hamal în portul "
                    "Galați. A trecut apoi prin atelierele CFR, prin greva "
                    "de la Grivița și a ajuns să conducă România comunistă."
                ),
            },
            {
                "article": A("loc-122"),
                "note": (
                    "Hotel Bristol (Domnească 30/34) — proprietate Spirache "
                    "Caravelas, vis-à-vis de Parcul Municipal. În 1907 a "
                    "găzduit banchetul în onoarea lui G. Panu; în 1918 "
                    "trupele române victorioase au defilat pe Domnească "
                    "lângă Bristol și Cofetăria „Principele Mihai”."
                ),
            },
            {
                "article": A("loc-127"),
                "note": (
                    "„Unde se întâlnește elita gălățeană? La Restaurantul, "
                    "Berăria și Bodega Suré!” — reclamă din mai 1931 în "
                    "„Vocea Galaţilor”. Frații Suré aveau bere Luther și "
                    "tarif urcat. La 7 august 1932 un incendiu a mistuit o "
                    "parte din imobil — învinuit a fost cofetarul rival "
                    "Manzavinatos. La 1 septembrie Suré se redeschidea "
                    "deja, „Preţuri foarte reduse, intrarea prin grădină”."
                ),
            },
            {
                "article": A("loc-135"),
                "note": (
                    "Cinema Louvru — în Piața Regală, inima orașului "
                    "port-liber, denumită oficial în 1884. În august 1914 "
                    "a găzduit o seară dansantă pentru refugiații belgieni. "
                    "Piața Regală a fost devastată în noaptea de 24-25 "
                    "august 1944 de armata germană în retragere și nu a "
                    "mai fost reconstruită."
                ),
            },
            # ── ETAPA 4: DAily → CRAFT — comunități etnice ~35 min
            {
                "article": A("loc-5"),
                "note": (
                    "ETAPA 4 — Biserica Greacă „Schimbarea la Față” "
                    "(începută 1866, sfințită 1872). Ridicată după planurile "
                    "arhitectului german Knab, cu lucrători germani, greci "
                    "și români — un simbol al multiculturalismului gălățean. "
                    "Comunitatea greacă a fost scânteia revoluției din 1821: "
                    "oamenii lui Vasile Karavia au atacat în februarie "
                    "garnizoana otomană din oraș."
                ),
            },
            {
                "article": A("loc-133"),
                "note": (
                    "Café Trocadero — chiar în fața Bisericii Greci. "
                    "„Loc predilect al întâlnirilor discrete, de afaceri” "
                    "(Sandel Dumitru). Frecventat de exportatori de cereale, "
                    "agenți consulari, avocați, ofițeri de marină."
                ),
            },
            {
                "article": A("loc-91"),
                "note": (
                    "Sinagoga „Templul Meseriașilor” — singura activă din "
                    "cele 22 de sinagogi ale orașului. Construită 1875, "
                    "reconstruită 1927-1929, restaurată complet 2014. "
                    "Comunitatea evreiască a fost peste 20% din populație "
                    "la apogeu, controlând șantierul naval Mendel, "
                    "fabricile chimice și exporturile de cereale."
                ),
            },
            {
                "article": A("loc-93"),
                "note": (
                    "Biserica Apostolică Armeană „Sfânta Maria” (1858). "
                    "Armenii sunt prezenți la Galați din sec. XVII. Prima "
                    "biserică (din lemn) a fost arsă de turci în 1821. "
                    "Mulți gălățeni armeni sunt urmași ai supraviețuitorilor "
                    "Genocidului din 1915. Bisericile armenești n-au pereți "
                    "pictați — armenii și-au luat sfinții cu ei prin lume, "
                    "în icoane portabile."
                ),
            },
            {
                "article": A("loc-92"),
                "note": (
                    "Biserica Mavromol (1700, ctitorie Antioh Cantemir). "
                    "Numele vine din grecescul „mavros molos” (piatra "
                    "neagră). Centru al comunității greco-comerciale "
                    "vechi. Aleea Mavromol — care duce la biserică — "
                    "păstrează numele și după sistematizările secolului XX."
                ),
            },
            # ── ETAPA 5: CRAFT → înapoi la Hops Gallery ~30 min
            {
                "article": A("loc-104"),
                "note": (
                    "ETAPA 5 — Monumentul „13 Iunie 1916”. Singura bătălie "
                    "„triplă” din istoria României: în ianuarie 1918, "
                    "500 de soldați, marinari și pompieri români au învins "
                    "12.000 de soldați ruși bolșevici. Singura dată când "
                    "forțele aeriene, terestre și navale au luptat împreună "
                    "într-o singură bătălie. Galațiul a primit „Croce di "
                    "Guerra” (Italia) și „Croix de Guerre” (Franța)."
                ),
            },
            {
                "article": A("loc-102"),
                "note": (
                    "Monumentul Unirii / Statuia Cuza, la rondoul Grădinii "
                    "Publice. Cuza a fost pârcălab de Covurlui (cu reședința "
                    "la Galați) între 1856 și 1859. Imaginează-ți: dacă "
                    "decizia era alta, capitala României de azi era Galați."
                ),
            },
            {
                "article": A("loc-113"),
                "note": (
                    "Statuia lui Mihai Eminescu de Frederic Storck — prima "
                    "statuie Eminescu din România. Storck este și autorul "
                    "alegoriilor „Industria” și „Agricultura” de pe fațada "
                    "Palatului Administrativ."
                ),
            },
            {
                "article": A("loc-108"),
                "note": (
                    "Cimitirul „Eternitatea” — bonus cosmopolit: aici e "
                    "îngropat Shintaro Tsutsumi, samurai japonez de 24 de "
                    "ani, ajuns la Galați cu nava „Kilimaru” la 3 ani după "
                    "Primul Război Mondial. Piatra de mormânt e scrisă în "
                    "japoneză și franceză. La Muzeul de Istorie se păstrează "
                    "„sabia de seppuku” care i-ar fi aparținut. "
                    "Final: înapoi la Hops Gallery — ai văzut Galațiul de "
                    "1.800 de ani (de la Tirighina romană la Combinat)."
                ),
            },
        ],
    }

    out = {"tours": [pub_crawl]}

    with open(TOURS_JSON, "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, indent=2)

    print(f"✏️  Scris {TOURS_JSON.relative_to(ROOT)}")
    print(f"    1 tur: „{pub_crawl['title']}”")
    print(f"    {len(pub_crawl['stops'])} opriri")


if __name__ == "__main__":
    main()
