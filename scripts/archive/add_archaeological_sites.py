#!/usr/bin/env python3
"""Adăugă cetățile dacice + 9 situri arheologice de importanță locală (LMI grupa B).

Bazat pe LMI 2015 (jud. Galați, coduri GL-I-s-B-02976 până la 02997) și
informații publice despre culturi arheologice (Gumelnița, Cucuteni, Hallstatt,
Sântana de Mureș-Cerneahov, Noua, Latène).
"""
import json
from pathlib import Path

PATH = Path(__file__).resolve().parent.parent / "galati_map" / "locations.json"

# Coordonate verificate din OSM (10 mai 2026)
NEW = [
    # ─── CETĂȚI DE PĂMÂNT GETO-DACICE (Latène, sec. IV-III î.Hr.) ───
    {
        "title": "Fortificație Căuiești",
        "lat": 46.0107,
        "lon": 27.7053,
        "location": "Sat Căuiești, comuna Drăgușeni",
        "category": "Monumente",
        "year_built": -400,
        "year_demolished": -200,
        "status": "ruins",
        "article": "../assets/articles/fortificatie-cauiesti/index.html",
        "excerpt": "Cetate de pământ Latène-getică (sec. IV-III î.Hr.). Cod LMI: GL-I-s-B-02982. Una din cele 3 cetăți dacice de altitudine din jud. Galați.",
        "description": (
            "Fortificația de la Căuiești este una dintre cele 3 cetăți de pământ getice (Latène) identificate pe teritoriul actual al județului Galați, alături de Cosițeni (Brăhășești) și sectorul fortificat de la Stoicani. Cod LMI: GL-I-s-B-02982 (grupa B, valoare locală).\n\n"
            "LOCALIZARE: pe teritoriul satului Căuiești, una dintre cele 7 sate ale comunei Drăgușeni (alături de Adam, Drăgușeni, Fundeanu, Ghinghești, Nicopole, Știețești). Comuna Drăgușeni: 5.255 locuitori; satul Adam (cu mănăstirea omonimă) e la 6 km nord-vest.\n\n"
            "DATARE: Latène, sec. IV-III î.Hr. — perioadă de înflorire a culturii geto-dace, contemporan cu marea epocă a regalității dace în Carpați (Burebista va consolida statul dac un secol mai târziu).\n\n"
            "ROL STRATEGIC: cetățile dacice de pământ aveau rol de refugiu (nu de așezare permanentă) — o populație rurală dispersată se aduna în interiorul fortificației doar la nevoie (incursiuni, război). Tipologic, sunt mai degrabă „cetățui de pământ” — val de pământ și șanț pe conturul natural al unui deal sau promontoriu.\n\n"
            "STATUS: situl este nepublicat în detaliu, fără cercetări arheologice extinse. Vizibile sunt doar urmele șanțurilor de apărare și posibile fragmente ceramice de suprafață. Acces: DN26 → DJ251A → drum local către Căuiești."
        ),
    },
    {
        "title": "Așezare fortificată Stoicani",
        "lat": 45.7080,
        "lon": 28.0700,
        "location": "Sat Stoicani, comuna Foltești",
        "category": "Monumente",
        "year_built": -3500,
        "year_demolished": -1500,
        "status": "ruins",
        "article": "../assets/articles/asezare-fortificata-stoicani/index.html",
        "excerpt": "Sit complex la Stoicani: așezare fortificată + necropolă, neolitic-bronz (eneolitic-bronz timpuriu). Pe malul Prutului, la capătul estic al Valului lui Atanaric.",
        "description": (
            "Așezarea fortificată de la Stoicani este unul dintre cele mai importante situri preistorice din sudul Moldovei, cu locuire neîntreruptă din neolitic până în epoca bronzului — o continuitate de circa 2.000 de ani.\n\n"
            "LOCALIZARE: pe malul Prutului, în satul Stoicani, comuna Foltești (45°42′N, 28°04′E). Așezarea ocupă un promontoriu fluvial cu vizibilitate strategică asupra Prutului.\n\n"
            "PERIODIZARE:\n• Neolitic târziu / Eneolitic — cultura Gumelnița (mileniul IV î.Hr.)\n• Bronzul timpuriu — cultura Horodiștea-Foltești (2500-1800 î.Hr., satul Foltești fiind eponimul!)\n• Locuire continuă peste 2 milenii\n\n"
            "DESCOPERIRI: cercetările arheologice au identificat:\n• Necropolă tumulară (specific bronzului timpuriu)\n• Așezare fortificată cu val de pământ și șanț\n• Ceramică Gumelnița (vase pictate, statuete antropomorfe)\n• Ceramică Horodiștea-Foltești (vase de uz cotidian, ușor decorate)\n• Inventar litic (silex, obsidian — comerț la distanță)\n\n"
            "CONTEXT GEOGRAFIC: tot la Stoicani începe (peste 2.000 de ani mai târziu) Valul lui Atanaric (376 d.Hr.), capătul estic pe Prut. Zona este astfel un palimpsest arheologic spectaculos: aceleași dealuri au fost folosite în mod strategic de la neolitic până în antichitatea târzie.\n\n"
            "STATUTUL ACTUAL: situl nu este amenajat turistic; informațiile sunt limitate la rapoartele arheologice publicate."
        ),
    },

    # ─── AȘEZĂRI ARHEOLOGICE B (importanță locală) ───
    {
        "title": "Sit arheologic Barcea",
        "lat": 45.7502,
        "lon": 27.4760,
        "location": "Sat Barcea, comuna Barcea",
        "category": "Monumente",
        "year_built": 300,
        "year_demolished": 400,
        "status": "ruins",
        "article": "../assets/articles/sit-barcea/index.html",
        "excerpt": "Așezare și necropolă din sec. IV d.Hr., cultura Sântana de Mureș-Cerneahov. Cod LMI: GL-I-s-B-02976. Perioada migrațiilor — populații mixte gotice-sarmatice-dacice.",
        "description": (
            "Situl de la Barcea este unul din siturile-cheie pentru înțelegerea epocii migrațiilor în sudul Moldovei. Cod LMI: GL-I-s-B-02976.\n\n"
            "LOCALIZARE: pe teritoriul satului și comunei Barcea, în partea centrală a județului Galați, în apropiere de Tecuci.\n\n"
            "DATARE: secolul IV d.Hr. — perioada de maxim a culturii Sântana de Mureș-Cerneahov (numită după siturile eponime de la Sântana de Mureș, jud. Mureș, și Cerneahov în Ucraina). Cultura este atribuită amestecului populațiilor gotice (vizigote și ostrogote), sarmate, dacice romanizate care trăiau în spațiul Moldovei și sudului Ucrainei înainte de invazia hunică din 376.\n\n"
            "TIPOLOGIE: cuprinde așezare deschisă (locuințe modeste de tip semibordei, cuptoare casnice) plus necropolă cu inhumări — ritual mixt cu elemente gotice (orientare N-S, inventar funerar bogat: fibule, ace, ceramică).\n\n"
            "DESCOPERIRI: ceramică tipică (negru-cenușie lustruită, cu motive geometrice), unelte agricole de fier, monede romane (sec. III-IV — perioada Constantin cel Mare).\n\n"
            "SEMNIFICAȚIE: situl Barcea documentează viața cotidiană pre-hunică în zona care va fi ulterior protejată de Valul lui Atanaric (376 d.Hr.) — populațiile de aici sunt exact cele care au făcut Marea Migrație după 376."
        ),
    },
    {
        "title": "Sit arheologic Băneasa",
        "lat": 45.9472,
        "lon": 27.9358,
        "location": "Sat Băneasa, comuna Băneasa",
        "category": "Monumente",
        "year_built": -3500,
        "year_demolished": 1100,
        "status": "ruins",
        "article": "../assets/articles/sit-baneasa/index.html",
        "excerpt": "Sit cu mai multe straturi arheologice — eneolitic, bronz, Hallstatt, sec. IV d.Hr., medieval timpuriu (sec. X-XII). Cod LMI: GL-I-s-B-02977. Locuire continuă ~5.000 de ani.",
        "description": (
            "Situl arheologic de la Băneasa este un palimpsest arheologic exemplar — un loc folosit aproape neîntrerupt din epoca neolitică până în Evul Mediu timpuriu. Cod LMI: GL-I-s-B-02977.\n\n"
            "LOCALIZARE: comuna Băneasa, în partea centrală a județului Galați (45.95, 27.94), pe terasele înalte ale Bârladului.\n\n"
            "STRATIGRAFIE — 5 PERIOADE LOCUITE:\n• Eneolitic (mileniul IV î.Hr.) — cultura Gumelnița\n• Epoca bronzului (mileniul II î.Hr.) — cultura Noua\n• Hallstatt (sec. X-V î.Hr.) — populații tracice timpurii\n• Sec. III-IV d.Hr. — cultura Sântana-Cerneahov (perioada migrațiilor)\n• Sec. X-XII d.Hr. — așezare medievală timpurie românească\n\n"
            "DESCOPERIRI: ceramică din toate epocile (Gumelnița pictată, Noua, Hallstatt cu decor în val, Cerneahov lustruită, ceramică „Dridu” medieval-timpurie), unelte litice și de bronz, monede bizantine din sec. XI.\n\n"
            "SEMNIFICAȚIE: continuitatea de locuire ~5.000 de ani este excepțională și sprijină teza continuității populației autohtone în spațiul carpato-dunărean prin toate marile valuri de migrații (goți, huni, slavi, pecenegi)."
        ),
    },
    {
        "title": "Siturile Berești („Dealul Bulgarului\” și „La Bâzan\”)",
        "lat": 46.0965,
        "lon": 27.8862,
        "location": "Orașul Berești",
        "category": "Monumente",
        "year_built": -100000,  # Paleolitic
        "year_demolished": 1600,
        "status": "ruins",
        "article": "../assets/articles/situri-beresti/index.html",
        "excerpt": "Trei situri în Berești — paleolitic (sec. 100.000-10.000 î.Hr.) până sec. XVI. Cele mai vechi urme de locuire umană din jud. Galați. Cod LMI: GL-I-s-B-02978-02980.",
        "description": (
            "Berești este un nod arheologic remarcabil — pe teritoriul orașului și împrejurimi se găsesc 3 situri distincte în 2 puncte arheologice principale („Dealul Bulgarului” și „La Bâzan”), cu locuire ce acoperă circa 100.000 de ani — de la paleolitic până în epoca medievală timpurie. Coduri LMI: GL-I-s-B-02978, 02979, 02980.\n\n"
            "LOCALIZARE: Berești este un mic oraș (sub 3.000 locuitori) situat în partea de nord a județului Galați, lângă granița cu jud. Vaslui (46.10, 27.89).\n\n"
            "STRATIGRAFIE — DE LA PIATRA CIOPLITĂ LA EVUL MEDIU:\n• Paleolitic (sec. 100.000-10.000 î.Hr.) — primii oameni vânători-culegători (Homo sapiens, posibil și Neanderthal); unelte de silex cioplit\n• Mezolitic — vânători specializați\n• Neolitic și eneolitic — culturi Cucuteni, Gumelnița\n• Epoca bronzului\n• Hallstatt și Latène (epoca dacilor)\n• Roman + perioada migrațiilor\n• Medieval (sec. XV-XVI) — sat documentat\n\n"
            "DESCOPERIRI EMBLEMATICE:\n• Unelte paleolitice de silex (răzuitoare, vârfuri de suliță)\n• Ceramică Cucuteni cu decor pictat tricrom (alb-negru-roșu)\n• Topoare de bronz Noua\n• Necropolă geto-dacă Latène\n• Vase medievale „Dridu”\n\n"
            "Berești este astfel cel mai vechi loc cu urme de locuire umană din județul Galați."
        ),
    },
    {
        "title": "Sit arheologic Ijdileni",
        "lat": 45.6352,
        "lon": 28.0570,
        "location": "Sat Ijdileni, comuna Frumușița",
        "category": "Monumente",
        "year_built": -1000,
        "year_demolished": 1500,
        "status": "ruins",
        "article": "../assets/articles/sit-ijdileni/index.html",
        "excerpt": "Sit multistratigrafic — Hallstatt (sec. X-V î.Hr.) → medieval (sec. XV). Cod LMI: GL-I-s-B-02986. Pe traseul Galați-Bârlad, lângă Frumușița.",
        "description": (
            "Situl arheologic de la Ijdileni este un sit multistratigrafic important pentru înțelegerea continuității populației tracice/dacice în partea de sud a județului Galați. Cod LMI: GL-I-s-B-02986.\n\n"
            "LOCALIZARE: satul Ijdileni este parte a comunei Frumușița (45.63, 28.06), în partea de sud-est a județului Galați, lângă DN26.\n\n"
            "PERIODIZARE: epocile reprezentate sunt Hallstatt (sec. X-V î.Hr.), Latène (sec. IV-I î.Hr.), Roman (sec. I-III d.Hr.), Migrații (sec. IV-VI), medieval timpuriu (sec. X-XII), medieval (sec. XV-XVI).\n\n"
            "DESCOPERIRI: ceramică cu decor în val (Hallstatt), monede dacice (Latène), monede romane (Antoninus, Hadrian), inventar funerar gotic (sec. IV), ceramică „Dridu” și culturi medievale târzii.\n\n"
            "Ca multe situri din jud. Galați, Ijdileni demonstrează continuitatea de locuire prin toate epocile istorice până la documentarea sa medievală."
        ),
    },
    {
        "title": "Sit arheologic Negrilești",
        "lat": 45.9573,
        "lon": 27.4809,
        "location": "Sat Negrilești, comuna Negrilești",
        "category": "Monumente",
        "year_built": -3500,
        "year_demolished": 1600,
        "status": "ruins",
        "article": "../assets/articles/sit-negrilesti/index.html",
        "excerpt": "Sit cu mai multe straturi — eneolitic (Gumelnița) → sec. XVI. Cod LMI: GL-I-s-B-02988. În zona centrală a județului, pe Bârlad.",
        "description": (
            "Situl arheologic de la Negrilești este un sit complex multistratigrafic situat pe valea Bârladului, în zona centrală a județului Galați. Cod LMI: GL-I-s-B-02988.\n\n"
            "LOCALIZARE: satul și comuna Negrilești (45.96, 27.48), pe DN24A.\n\n"
            "PERIODIZARE — DE LA NEOLITIC LA RENAȘTERE:\n• Eneolitic (mileniul IV î.Hr.) — cultura Gumelnița sau Cucuteni\n• Bronz timpuriu (mileniul III-II î.Hr.) — cultura Horodiștea-Foltești\n• Hallstatt (sec. X-V î.Hr.) — populații tracice\n• Latène (sec. IV-I î.Hr.) — geto-dacii\n• Roman & migrații (sec. I-VI d.Hr.)\n• Medieval timpuriu (sec. X-XII)\n• Medieval mijlociu (sec. XIV-XVI) — sat documentat în acte de domnie\n\n"
            "DESCOPERIRI: ceramică Gumelnița pictată, vase Horodiștea-Foltești, fibule dacice, monede romane, ceramică Dridu, vase medievale moldovenești cu smalț.\n\n"
            "Reprezintă unul din cele mai bogate situri de tip multistrat de pe valea Bârladului."
        ),
    },
    {
        "title": "Sit arheologic Puricani",
        "lat": 46.1206,
        "lon": 27.9392,
        "location": "Sat Puricani, comuna Berești-Meria",
        "category": "Monumente",
        "year_built": -100000,
        "year_demolished": -500,
        "status": "ruins",
        "article": "../assets/articles/sit-puricani/index.html",
        "excerpt": "Sit cu locuiri din paleolitic + Hallstatt (sec. X-V î.Hr.). Cod LMI: GL-I-s-B-02990. Vânători-culegători preistorici lângă Berești.",
        "description": (
            "Situl arheologic de la Puricani este unul dintre puținele situri din județul Galați cu urme paleolitice clare, alături de Berești. Cod LMI: GL-I-s-B-02990.\n\n"
            "LOCALIZARE: satul Puricani este parte a comunei Berești-Meria, la nord de orașul Berești (46.12, 27.94), aproape de granița cu jud. Vaslui.\n\n"
            "DATARE — DOUĂ ORIZONTURI DISTINCTE:\n• Paleolitic (sec. 100.000-10.000 î.Hr.) — populații vânători-culegători Homo sapiens; posibil și Neanderthal în straturile cele mai vechi\n• Hallstatt (sec. X-V î.Hr.) — sat traci timpuriu\n\n"
            "Între cele două orizonturi există un hiatus de mii de ani — locul a fost folosit, abandonat, apoi reocupat în epoca fierului.\n\n"
            "DESCOPERIRI: unelte paleolitice de silex cioplit (răzuitoare, lame, vârfuri); ceramică Hallstatt cu decor în val și brâu alveolar; resturi de fier (cuie, unelte agricole).\n\n"
            "Situl este important pentru documentarea celor mai vechi urme de prezență umană continuă din nord-vestul județului Galați."
        ),
    },
    {
        "title": "Sit arheologic Suceveni",
        "lat": 46.0095,
        "lon": 28.0223,
        "location": "Sat Suceveni, comuna Suceveni",
        "category": "Monumente",
        "year_built": -3500,
        "year_demolished": -2500,
        "status": "ruins",
        "article": "../assets/articles/sit-suceveni/index.html",
        "excerpt": "Așezare eneolitic târzie (mileniul IV î.Hr.), cultura Gumelnița. Cod LMI: GL-I-s-B-02993. Lângă lacul Pochina și Prut, în zona Lunca Joasă.",
        "description": (
            "Situl arheologic de la Suceveni este un sit eneolitic important pentru cunoașterea culturii Gumelnița în nord-estul județului Galați. Cod LMI: GL-I-s-B-02993.\n\n"
            "LOCALIZARE: satul și comuna Suceveni se află în partea de NE a județului, lângă Prut și lacul Pochina (46.01, 28.02). Comuna face parte din bazinul de pasaj migratoriu al Parcului Natural Lunca Joasă a Prutului Inferior.\n\n"
            "DATARE: eneolitic târziu — sfârșitul mileniului IV î.Hr. (circa 3500-2500 î.Hr.), perioada de maximă înflorire a culturii Gumelnița în spațiul carpato-dunărean.\n\n"
            "CULTURA GUMELNIȚA: una dintre cele mai sofisticate civilizații neolitice europene — populații sedentare cu așezări permanente (tell-uri), agricultură intensivă, metalurgie a aramei începătoare, ceramică pictată cu motive complexe geometrice și antropomorfe.\n\n"
            "DESCOPERIRI: locuințe de suprafață (case de chirpici cu schelet de lemn), ceramică pictată tricromă, vase antropomorfe (figurine feminine — „zeițe-mame”), unelte litice și de aramă, oase de animale domestice (oi, capre, vite, porci) și sălbatice.\n\n"
            "Suceveni este unul din cele câteva situri Gumelnița din jud. Galați, alături de Umbrărești, Foltești și parțial Băneasa."
        ),
    },
    {
        "title": "Sit arheologic Umbrărești",
        "lat": 45.7095,
        "lon": 27.4997,
        "location": "Sat Umbrărești, comuna Umbrărești",
        "category": "Monumente",
        "year_built": -3500,
        "year_demolished": -2500,
        "status": "ruins",
        "article": "../assets/articles/sit-umbraresti/index.html",
        "excerpt": "Așezare eneolitic târzie, cultura Gumelnița (mileniul IV î.Hr.). Cod LMI: GL-I-s-B-02996. Lângă Tecuci, podgorie viticolă tradițională.",
        "description": (
            "Situl arheologic de la Umbrărești este o așezare eneolitică Gumelnița importantă, situată într-o zonă astăzi cunoscută pentru viticultură (podgoria Dealul Bujorului). Cod LMI: GL-I-s-B-02996.\n\n"
            "LOCALIZARE: satul și comuna Umbrărești (45.71, 27.50), la sud-est de Tecuci, pe terasele Bârladului.\n\n"
            "DATARE: eneolitic târziu — sfârșitul mileniului IV î.Hr. (circa 3500-2500 î.Hr.), faza finală a culturii Gumelnița. Această perioadă marchează tranziția de la societatea neolitică sedentară la primele forme de viață indo-europeană din epoca bronzului timpuriu.\n\n"
            "CULTURA GUMELNIȚA — DETALII LA UMBRĂREȘTI:\n• Așezare de tip „tell” (movilă artificială formată prin reconstrucții succesive)\n• Locuințe rectangulare de chirpici, cu pereți pictați\n• Ceramică pictată cu motive complexe (spirale, meandre, antropomorfe)\n• Unelte de silex, os, corn de cerb și aramă (metalurgie nascentă)\n• Statuete de lut antropomorfe — divinități feminine ale fertilității\n\n"
            "DESCOPERIRI: vase de provizii, oale de gătit, vase de cult, unelte agricole, oase de animale domestice (caprine + bovine), grăunțe de cereale carbonizate (grâu, orz).\n\n"
            "Importanța sitului: împreună cu Suceveni, Foltești și Băneasa, formează rețeaua eneolitică Gumelnița din sudul Moldovei."
        ),
    },
    {
        "title": "Sit arheologic Gârbovăț",
        "lat": 46.0219,
        "lon": 27.5197,
        "location": "Sat Gârbovăț, comuna Ghidigeni",
        "category": "Monumente",
        "year_built": -1300,
        "year_demolished": -1100,
        "status": "ruins",
        "article": "../assets/articles/sit-garbovat/index.html",
        "excerpt": "Așezare bronz târziu, cultura Noua (sec. XIII-XII î.Hr.). Cod LMI: GL-I-s-B-02985. Sit eponim parțial — Garbovăț prezintă un facies tipic culturii Noua moldovenești.",
        "description": (
            "Situl arheologic de la Gârbovăț este un sit important pentru epoca bronzului târziu în nord-vestul județului Galați. Cod LMI: GL-I-s-B-02985.\n\n"
            "LOCALIZARE: satul Gârbovăț este parte a comunei Ghidigeni (46.02, 27.52), în nord-vestul județului. Comuna Ghidigeni cuprinde și satul Tălpigi (cu mănăstirea omonimă).\n\n"
            "DATARE: bronz târziu — sec. XIII-XII î.Hr. (circa 1300-1100 î.Hr.). Aparține culturii Noua, una dintre cele mai răspândite culturi de epoca bronzului din Moldova și estul Munteniei.\n\n"
            "CULTURA NOUA: numită după satul Noua de lângă Brașov, este o cultură de păstori-agricultori semi-sedentari, care trăiau în așezări extinse („zollerwerke” — cu cenușare circulare).\n\n"
            "TRĂSĂTURI:\n• Cenușare („Aschenhügel”) — movile circulare formate prin acumularea de cenușă, oase de animale și ceramică sparta de-a lungul generațiilor\n• Locuințe ușoare semibordeie\n• Ceramică nepictată dar cu profile distinctive (vase cu două torți, decor cu brâu alveolar)\n• Unelte de bronz — celturi (topoare cu manșon), seceri, ace\n• Economie pastorală preponderentă (oi, capre)\n\n"
            "DESCOPERIRI LA GÂRBOVĂȚ: cenușare cu material ceramic și osteologic; piese de bronz; unelte litice de prelucrare a pielii."
        ),
    },
]


def main():
    data = json.loads(PATH.read_text(encoding='utf-8'))
    locs = data if isinstance(data, list) else data.get('locations', [])

    next_n = 1 + max(int(L['id'].split('-')[1]) for L in locs if (L.get('id') or '').startswith('loc-'))

    added = 0
    for entry in NEW:
        new_id = f"loc-{next_n}"
        next_n += 1
        full = {
            "id": new_id,
            "title": entry["title"],
            "location": entry.get("location", ""),
            "lat": entry["lat"],
            "lon": entry["lon"],
            "geocoded_as": "Adăugat din script (situri arheologice — research 2026-05-10)",
            "category": entry["category"],
            "excerpt": entry["excerpt"],
            "description": entry["description"],
            "status": entry.get("status", "active"),
            "year_built": entry.get("year_built"),
            "year_demolished": entry.get("year_demolished"),
            "article": entry["article"],
        }
        locs.append(full)
        added += 1
        print(f"  + {new_id}: {entry['title']}")

    if isinstance(data, list):
        data = locs
    else:
        data['locations'] = locs

    PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(f"\nAdded {added} locations. Total now: {len(locs)}")


if __name__ == '__main__':
    main()
