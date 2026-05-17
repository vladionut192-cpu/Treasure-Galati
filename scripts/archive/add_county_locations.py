#!/usr/bin/env python3
"""Adaugă obiective din județul Galați (în afara orașului) în locations.json.

Bazat pe cercetarea din Surse/obiective-judet-galati.md:
- 4 mănăstiri (Vladimirești, Adam, Buciumeni, Tălpigi)
- 3 situri arheologice (Poiana/Piroboridava, Așezarea Foltești, Cetate Cosițeni)
- 2 fortificații (Valul lui Atanaric)
- 4 zone naturale (Lacul Brateș, Pădurea Adam, Lunca Joasă Prut, Lacul Pochina)
- 1 muzeu (Tecuci „Teodor Cincu”)
- 1 conac (Costache Conachi, Țigănești)
- 1 casă memorială (Hortensia Papadat-Bengescu, Ivești)
- 1 podgorie (Dealul Bujorului)

Rulează din root: python3 scripts/add_county_locations.py
"""
import json
from pathlib import Path

PATH = Path(__file__).resolve().parent.parent / "galati_map" / "locations.json"


# Fiecare entry: id se atribuie automat continuând după max-ul curent.
NEW = [
    # ─── MĂNĂSTIRI ───
    {
        "title": "Mănăstirea Vladimirești",
        "lat": 45.594506,
        "lon": 27.663712,
        "location": "Comuna Tudor Vladimirescu",
        "category": "Lăcașuri de cult",
        "year_built": 1939,
        "year_demolished": None,
        "status": "active",
        "article": "../assets/articles/manastirea-vladimiresti/index.html",
        "excerpt": "Mănăstire de călugărițe ridicată în 1939-1943 în urma vedeniilor maicii Veronica Gurău. Desființată brutal de comuniști în 1955; refondată în 1990. Hramul: Adormirea Maicii Domnului.",
        "description": (
            "Mănăstirea Vladimirești este una dintre cele mai dramatice ctitorii religioase din România secolului XX. Așezată la circa 4 km de comuna Tudor Vladimirescu, între Galați și Tecuci, mănăstirea a luat naștere dintr-o vedenie: la 5 august 1938, tânăra Vasilica Gurău (viitoarea maică Veronica), atunci în vârstă de 16 ani, a relatat că a primit o poruncă dumnezeiască pentru a ridica un lăcaș de cult pe pământul familiei sale.\n\n"
            "Lucrările de construcție au început în 1939, iar complexul monahal a fost finalizat în 1943, în plin Război Mondial. Hramul: Adormirea Maicii Domnului (15 august).\n\n"
            "Comunitatea a crescut rapid și a devenit, după 1945, unul dintre cele mai puternice centre de rezistență spirituală anticomunistă. Părintele duhovnic Ioan Iovan a fost hirotonit aici la 18 decembrie 1949 și a transformat mănăstirea într-un fenomen religios — pelerinaje cu zeci de mii de credincioși, săvârșirea zilnică a Sfintei Liturghii, împărtășanie deasă, predici dure împotriva ateismului oficial.\n\n"
            "REPRESIUNEA DIN 1955: în ianuarie 1955, părintele Ioan Iovan a redactat celebrul „Memoriu către Sfântul Sinod al BOR”, denunțând complicitatea ierarhiei cu regimul comunist. Răspunsul a venit pe 29 martie 1955, când sute de soldați înarmați au asediat mănăstirea. Maica Veronica și părintele Iovan au fost arestați, iar cele 318 maici au fost dispersate forțat în toată țara.\n\n"
            "La procesul de la Galați (5-7 decembrie 1955), maica Veronica a primit 15 ani muncă silnică, iar părintele Iovan 25 de ani. Mănăstirea a fost desființată oficial.\n\n"
            "După 1990, maica Veronica s-a întors pe terenul ei și a refondat mănăstirea. Astăzi este loc de pelerinaj activ, cu sute de mii de vizitatori anual."
        ),
    },
    {
        "title": "Mănăstirea „Adormirea Maicii Domnului\” - Adam",
        "lat": 46.0281,
        "lon": 27.7319,
        "location": "Sat Adam, comuna Drăgușeni",
        "category": "Lăcașuri de cult",
        "year_built": 1813,
        "year_demolished": None,
        "status": "active",
        "article": "../assets/articles/manastirea-adam/index.html",
        "excerpt": "Mănăstire de maici fondată la 14 octombrie 1652 de căpitanul Adam (călugărit ca Varvara) și frații săi. Biserica actuală în formă de cruce, stil moldovenesc, cu ziduri de 1,5 m, finalizată în 1813.",
        "description": (
            "Mănăstirea Adam este una dintre cele mai vechi vetre monastice din sudul Moldovei, situată pe „Dealul Apărătura” — cea mai înaltă cotă din pădurile locale, în satul Adam din comuna Drăgușeni. Accesul: DN26, DJ251A și DJ242.\n\n"
            "FONDAREA: ctitorită la 14 octombrie 1652 de către căpitanul Adam (intrat ulterior în călugărie sub numele de Varvara) și frații săi Costi, Movilă și Dabija. Numele satului a rămas legat de ctitor.\n\n"
            "ARHITECTURA: biserica are plan în cruce, stil moldovenesc, cu ziduri de 1,5 metri grosime. Cuprinde altar, naos, pronaos și pridvor închis. Clopotnița este construită la 70 de metri de biserică. Picturile în ulei și tempera datează din secolul XVIII; au fost restaurate în 2006-2007.\n\n"
            "ETAPELE ISTORICE:\n• 1630: turcii au distrus biserica originală din lemn\n• 1802: cutremurul a prăbușit clădirea veche\n• 1813: biserica actuală a fost finalizată de stareții Ioanichie Greceanu și Metodie Gociu\n• 1826-1835: călugărițele au fost relocate temporar la Mănăstirea Florești, apoi readuse\n• 1860-1885: în mănăstire a funcționat un spital neuropsihiatric\n• 1918: a fost înființată o școală de fete în incintă\n• 1991-2001: refondată ca mănăstire prin inițiativa episcopului Casian\n\n"
            "STATUTUL ACTUAL: comunitate monahală feminină de circa 11 maici, sub conducerea stavroforei Anastasia Cimbru. Mănăstirea adăpostește o icoană considerată făcătoare de minuni, atrăgând pelerini din întreaga țară. Este una dintre favoritele de altădată ale lui Nicolae Ceaușescu pentru vânătoare în Pădurea Adam din vecinătate."
        ),
    },
    {
        "title": "Mănăstirea „Sfânta Treime\” - Buciumeni",
        "lat": 46.002,
        "lon": 27.305,
        "location": "Comuna Buciumeni (25 km NV de Tecuci)",
        "category": "Lăcașuri de cult",
        "year_built": 1602,
        "year_demolished": None,
        "status": "active",
        "article": "../assets/articles/manastirea-buciumeni/index.html",
        "excerpt": "Cea mai veche mănăstire activă din sudul Moldovei, atestată documentar la 1602 dar cu tradiție din vremea lui Alexandru cel Bun (1420-1430). Aproape 6 secole de viață monahală neîntreruptă.",
        "description": (
            "Mănăstirea Buciumeni este una dintre cele mai vechi vetre monastice din Moldova, atestată documentar din 1602 dar cu tradiție orală care urcă până la 1420-1430, în vremea domniei lui Alexandru cel Bun. Este situată pe teritoriul comunei Buciumeni, la 25 km nord-vest de Tecuci, în inima Pădurii Buciumeni — una dintre cele mai întinse păduri de fag și tei din județ (peste 800 ha).\n\n"
            "ÎNCEPUTURILE: călugărițele de aici au construit la început o biserică din lemn, închinată Sfântului Nicolae, cu câteva chilii mici.\n\n"
            "REPERELE ISTORICE:\n• 1602: prima atestare documentară\n• 1700: structura originală reconstruită de serdarul Manolache Radovici și sfințită de episcopul Sava al Romanului\n• 1750: relocată într-un schit nou înființat; devine metoc al Episcopiei Romanului\n• 1840-1844: ridicarea bisericii din cărămidă și a clopotniței\n• 1860: legile secularizării au desființat schitul; majoritatea maicilor au fost transferate în alte mănăstiri, rămânând doar 12 vârstnice\n• 1879: restaurarea bisericii și pictura interioară de Stoica Ioniță Gheorghe\n• 1925: incendiu care a distrus parțial biserica; reconstrucție de starețul Glicherie Lovin\n• 1957-1959: repictarea interiorului în stil neobizantin de Anatolie Cudinof\n• 1950-1990: comuniștii au transformat mănăstirea într-o fermă zootehnică pentru tabăra de copii\n• 1990 înainte: revitalizare monastică cu reconstrucții importante\n\n"
            "STATUTUL ACTUAL: aproximativ 40 de maici, comunitate feminină. Hramul Sfintei Treimi se prăznuiește în lunea a doua după Rusalii. Pădurea Buciumeni — o porțiune din mijloc a fost declarată rezervație naturală în 1994."
        ),
    },
    {
        "title": "Mănăstirea Tălpigi",
        "lat": 46.10,
        "lon": 27.30,
        "location": "Sat Tălpigi, comuna Ghidigeni",
        "category": "Lăcașuri de cult",
        "year_built": None,
        "year_demolished": None,
        "status": "active",
        "article": "../assets/articles/manastirea-talpigi/index.html",
        "excerpt": "Schit ortodox în satul Tălpigi din comuna Ghidigeni, una dintre cele 5 mănăstiri active din județul Galați. Detalii suplimentare urmează (cercetare locală).",
        "description": (
            "Schitul/Mănăstirea Tălpigi este una dintre cele cinci mănăstiri active din județul Galați, alături de Adam, Buciumeni, Vladimirești și Tudor Vladimirescu.\n\n"
            "Localizarea: satul Tălpigi, comuna Ghidigeni, în nord-vestul județului. Este o așezare monahală mai discretă decât celelalte patru mari, fără documentație online amplă; necesită cercetare în arhivele locale (Episcopia Dunării de Jos, Direcția pentru Cultură Galați).\n\n"
            "Coordonatele sunt aproximative — pin-ul trebuie ajustat când se obține locația exactă a complexului monahal."
        ),
    },

    # ─── SITURI ARHEOLOGICE ───
    {
        "title": "Cetatea dacică Poiana („Piroboridava\”)",
        "lat": 45.99222,
        "lon": 27.25583,
        "location": "Sat Poiana, comuna Poiana",
        "category": "Monumente",
        "year_built": -1600,  # Bronz Age
        "year_demolished": 200,  # End of Roman occupation
        "status": "ruins",
        "article": "../assets/articles/cetatea-poiana-piroboridava/index.html",
        "excerpt": "Cetate dacică majoră — capitala regelui costoboc Pieporus. Locuită din epoca bronzului (1600 î.Hr.) până în sec. II d.Hr. Cod LMI: GL-I-s-A-02989. Situată la 246 m altitudine.",
        "description": (
            "Situl arheologic de la Poiana este unul dintre cele mai importante centre dacice din sudul Moldovei și a fost identificat de cercetători cu „Piroboridava” — capitala regelui costoboc Pieporus, menționat în izvoare romane. Cod LMI: GL-I-s-A-02989 (grupa A, valoare națională).\n\n"
            "POZIȚIONARE: 45°59′32″N 27°15′21″E, la 246 metri altitudine, pe malul Siretului. Prima atestare documentară a satului Poiana datează din 1522.\n\n"
            "PERIODIZARE:\n• Epoca bronzului — sec. II d.Hr. (locuire neîntreruptă peste 1500 de ani)\n• Perioada dacică: capitala costobocilor — cetate de pământ și lemn cu rol comercial și militar\n• Perioada romană: fortificația dacică a fost convertită într-un castru roman\n\n"
            "ROL STRATEGIC: castrul roman supraveghea drumul imperial de pe valea Siretului care lega cetatea Brețcu (Carpați) de castrul Bărboși (Galați) — un coridor militar esențial pentru apărarea limesului dacic.\n\n"
            "DESCOPERIRI: o amforă din Thasos descoperită aici dovedește legăturile comerciale cu insula greacă Thasos. Săpături sistematice au scos la lumină ceramică dacică, monede romane, fibule, arme și fragmente arhitecturale.\n\n"
            "Astăzi situl nu este amenajat turistic — vizibile sunt doar urmele șanțurilor de apărare și fragmente ceramice de suprafață."
        ),
    },
    {
        "title": "Așezarea eponimă Foltești (cultura Horodiștea-Foltești)",
        "lat": 45.74444,
        "lon": 28.06111,
        "location": "Sat Foltești, comuna Foltești",
        "category": "Monumente",
        "year_built": -2500,
        "year_demolished": -1800,
        "status": "ruins",
        "article": "../assets/articles/asezarea-foltesti/index.html",
        "excerpt": "Eponimul culturii arheologice Horodiștea-Foltești (2500-1800 î.Hr.), tranziția de la eneolitic la bronzul timpuriu. Cod LMI: GL-I-s-A-02984. Marchează apariția populațiilor indo-europene în Moldova.",
        "description": (
            "Așezarea de la Foltești este situl-tip al culturii arheologice Horodiștea-Foltești — una dintre cele mai importante culturi de tranziție din preistoria României, datată între circa 2500 și 1800 î.Hr. Cod LMI: GL-I-s-A-02984 (grupa A, valoare națională).\n\n"
            "LOCALIZARE: 45°44′40″N 28°03′40″E, în satul Foltești, comuna Foltești, județul Galați, pe malul Prutului.\n\n"
            "ROLUL ÎN ARHEOLOGIA ROMÂNEASCĂ: cultura Horodiștea-Foltești marchează sfârșitul eneoliticului și începutul bronzului timpuriu. Reprezintă perioada de tranziție când culturile neolitice locale (Cucuteni, Gumelnița) au asimilat noi elemente aduse de migrațiile indo-europene din stepă.\n\n"
            "CARACTERISTICI:\n• Ceramică de calitate inferioară față de Cucuteni, dar cu influențe externe pronunțate\n• Ritualuri funerare specifice (înmormântări tumulare cu schelete chircite)\n• Așezări fortificate poziționate pe terase înalte cu vizibilitate pe văi\n• Inventar de cupru și bronz primitiv — primii pași spre metalurgie\n\n"
            "EXTINDERE: cultura Horodiștea-Foltești s-a dezvoltat în Moldova și nord-estul Munteniei, cu analogii în Republica Moldova (Erbiceni-Gordinești) și Ucraina (Kasperovcy). Este unul din cele trei mari complexe culturale din perioada de tranziție.\n\n"
            "Situl este prezervat parțial — straturile arheologice rămân subterane."
        ),
    },
    {
        "title": "Cetatea de pământ Cosițeni",
        "lat": 46.033,
        "lon": 27.367,
        "location": "Sat Cosițeni, comuna Brăhășești",
        "category": "Monumente",
        "year_built": -400,
        "year_demolished": -200,
        "status": "ruins",
        "article": "../assets/articles/cetatea-cositeni/index.html",
        "excerpt": "Fortificație geto-dacică Latène (sec. IV-III î.Hr.), pe Dealul „Cetățuia\”, la confluența râurilor Zeletin și Berheci. Cod LMI: GL-I-s-B-02983. La marginea Valului lui Atanaric.",
        "description": (
            "Cetatea de pământ de la Cosițeni este unul dintre cele mai bine conservate situri dacice de altitudine din sudul Moldovei. Cod LMI: GL-I-s-B-02983.\n\n"
            "LOCALIZARE: pe Dealul „Cetățuia”, la confluența râurilor Zeletin și Berheci, la 300 metri nord de drumul Gohor-Brăhășești. Aparține satului Cosițeni din comuna Brăhășești (composed of villages: Brăhășești, Corcioveni, Cosițeni, Toflea).\n\n"
            "DATARE: Latène, sec. IV-III î.Hr. — perioada culturii geto-dacice. Cetatea a funcționat ca punct strategic în rețeaua de fortificații dacice care controlau valea Siretului.\n\n"
            "DESCRIERE: fortificația prezintă val de pământ și șanț de apărare săpate pe conturul natural al dealului. Suprafața fortificată este redusă (cetate-refugiu, nu așezare permanentă), tipică pentru cetățile dacice de margine.\n\n"
            "DESCOPERIRI ÎN ZONĂ: la „Vatra satului” Brăhășești a fost identificată o așezare deschisă geto-dacică cu ceramică locală și fragmente de amfore grecești importate — semn al schimburilor comerciale cu coloniile pontice.\n\n"
            "CONTEXT GEOGRAFIC: marginea de vest a Valului lui Atanaric trece prin zona Brăhășești-Toflea, ceea ce face din Cosițeni un punct nodal pentru două sisteme defensive diferite: unul dacic (sec. IV î.Hr.) și unul gotic (sec. IV d.Hr.) — la 700 de ani distanță, dar pe același prag geografic."
        ),
    },

    # ─── FORTIFICAȚII ───
    {
        "title": "Valul lui Atanaric (sector Țigănești-Brăhășești)",
        "lat": 45.94,
        "lon": 27.40,
        "location": "Traseu prin 16+ comune (Țigănești, Brăhășești, Munteni, Țepu, Frunzeasca, Toflea, Ploscuțeni etc.)",
        "category": "Monumente",
        "year_built": 376,
        "year_demolished": None,
        "status": "ruins",
        "article": "../assets/articles/valul-lui-atanaric/index.html",
        "excerpt": "Cea mai vastă fortificație antică din Moldova — 90 km de la Stoicani (Prut) la Ploscuțeni (Siret). Construit în 376 d.Hr. de regele got Athanaric ca apărare contra hunilor. Cod LMI: GL-I-s-A-02975.",
        "description": (
            "Valul lui Atanaric (sau Athanaric) este cea mai vastă fortificație militară antică din zona Moldovei și unul dintre cele mai impresionante monumente arheologice din județul Galați. Cod LMI: GL-I-s-A-02975 (grupa A) cu 16 sectoare individuale (GL-I-m-A-02975.01-16).\n\n"
            "DATA ȘI CONTEXTUL: ridicat în anul 376 d.Hr. de Athanaric, regele goților vizigoți (tervingi), ca răspuns la atacurile devastatoare ale hunilor pe Nistrul mijlociu. Athanaric, surprins de invazia hunică, s-a retras în sudul Moldovei și a ridicat acest val masiv de pământ pentru a-și apăra ultima zonă de control.\n\n"
            "DIMENSIUNI: lungime totală 90 km, de la Stoicani (pe Prut) până la Ploscuțeni (pe Siret, jud. Vrancea). Excavarea a presupus mutarea a peste 1,5 milioane de metri cubi de pământ.\n\n"
            "STRUCTURĂ: cercetările arheologice au identificat:\n• Val de pământ compact\n• Palisadă din lemn deasupra valului (urme de incendiu)\n• Capcane în fața șanțului — gropi adânci și dese\n• Posibile turnuri de observație la intervale regulate\n\n"
            "TRASEU PRIN JUD. GALAȚI: începe la Prut în satul Stoicani (com. Foltești) și trece prin satele Fântânele, Scânteiești, Cuca, urcând la nord de satul Oasele (com. Rediu), la sud de Băleni, la nord de Cudalbi și Valea Mărului, între Corod și Matca, prin Țigănești, peste apa Bârladului prin Frunzeasca, Țepu, valea râului Tecucel, Vizurești, Brăhășești, Toflea, terminându-se la livada din Ploscuțeni.\n\n"
            "REZULTATUL ISTORIC: în pofida valului, hunii au rupt liniile gotice; mulți goți s-au refugiat în Imperiul Roman (declanșând migrația care va culmina cu bătălia de la Adrianopol, 378 d.Hr.). Athanaric însuși a murit în exil, primit de împăratul Theodosius I.\n\n"
            "ASTĂZI: zace în anonimat și ruină — mare parte e abia vizibilă, vegetația și agricultura au erodat traseul. Sectoarele cele mai bine păstrate sunt în zonele împădurite (Brăhășești, Țepu)."
        ),
    },

    # ─── ZONE NATURALE ───
    {
        "title": "Lacul Brateș",
        "lat": 45.480767,
        "lon": 28.070878,
        "location": "Nord-est Galați, confluența Prut-Dunăre",
        "category": "Natură și Agrement",
        "year_built": None,
        "year_demolished": None,
        "status": "active",
        "article": "../assets/articles/lacul-brates/index.html",
        "excerpt": "Cel mai mare lac de luncă din România — supranumit „Balatonul românesc\”. Suprafața inițială de 7.420 ha, redusă la 2.400 ha după desecările din 1948. Adâncime medie 1,5 m. Pescuit, plajă, agrement.",
        "description": (
            "Lacul Brateș este cel mai mare lac de luncă din România, situat în Câmpia Covurluiului, în zona de confluență a Prutului cu Dunărea, la nord-est de orașul Galați. Coordonate: 45°28′51″N 28°04′15″E.\n\n"
            "DIMENSIUNI:\n• Suprafață actuală: 2.400 hectare\n• Suprafață inițială (până la 1948): 7.420 hectare — o reducere dramatică de 68% datorită lucrărilor agrotehnice socialiste de desecare pentru recuperarea de teren agricol\n• Adâncime medie: 1,5 metri\n• Avea o insulă în zona „Agrement Brateș” până în anii '80\n\n"
            "POREClA „BALATONUL ROMÂNESC”: înainte de desecare, întinderea sa de aproape 75 km² și plajele nisipoase îl făceau comparabil cu lacul ungar Balaton — destinație de vacanță pentru gălățeni, cu restaurante, debarcadere și plajă amenajată.\n\n"
            "FUNCȚII ACTUALE:\n• Pescuit recreativ (specii: crap, plătică, somn, știucă, șalău)\n• Agrement (plajă, restaurante, plimbări cu barca)\n• Habitat pentru păsări de apă (parțial integrat în Parcul Natural Lunca Joasă a Prutului Inferior)\n• Sursă de apă pentru irigații\n\n"
            "CONTEXT ECOLOGIC: face parte din coridoarele de migrație ale păsărilor de la Marea Neagră și Delta Dunării către Eurasia."
        ),
    },
    {
        "title": "Pădurea Adam",
        "lat": 46.020,
        "lon": 27.730,
        "location": "Sat Adam, comuna Drăgușeni",
        "category": "Natură și Agrement",
        "year_built": None,
        "year_demolished": None,
        "status": "active",
        "article": "../assets/articles/padurea-adam/index.html",
        "excerpt": "Rezervație naturală în nord-vestul județului, la 25 km de Bârlad. Pădure favorită a lui Nicolae Ceaușescu pentru vânătoare. Adăpostește Mănăstirea Adam și icoană făcătoare de minuni.",
        "description": (
            "Pădurea Adam (Codrul Adam) este una dintre cele mai mari rezervații naturale ale județului Galați, situată în partea de nord-vest, la limita cu județul Vaslui, la circa 25 km de Bârlad.\n\n"
            "STATUT: rezervație naturală mixtă — combinație de pădure de fag, gorun, tei și carpen, cu zone de pajiște și apă. Adăpostește o faună variată: cerbi, mistreți, căprioare, vulpi, păsări de pădure.\n\n"
            "ISTORIE: a fost una dintre pădurile favorite ale lui Nicolae Ceaușescu pentru partidele de vânătoare prezidențiale, alături de Codrii Slătioarei. Acest lucru a asigurat, paradoxal, o protecție strictă în perioada comunistă — accesul restricționat și gestionarea silvică intensivă au păstrat ecosistemul.\n\n"
            "ATRACȚII:\n• Mănăstirea Adam — în mijlocul pădurii (vezi entry separat); găzduiește o icoană considerată făcătoare de minuni\n• Trasee de drumeție și mountain-bike\n• Vânătoare (organizată, în sezon, cu permise)\n• Spațiu de picnic și recreere\n\n"
            "Pădurea aparține zonei colinare a Moldovei de Sud și face parte dintr-un coridor ecologic mai amplu împreună cu Pădurea Buciumeni."
        ),
    },
    {
        "title": "Parcul Natural Lunca Joasă a Prutului Inferior",
        "lat": 45.65,
        "lon": 28.20,
        "location": "Lungă bandă pe Prut, de la Galați spre nord (16 comune)",
        "category": "Natură și Agrement",
        "year_built": 2004,
        "year_demolished": None,
        "status": "active",
        "article": "../assets/articles/parcul-natural-lunca-joasa-prut/index.html",
        "excerpt": "Parc natural de 8.247 ha pe 145 km de luncă a Prutului. Înființat prin HG 2151/2004. Peste 230 de specii de păsări — coridoare majore de migrație. Poartă spre Delta Dunării.",
        "description": (
            "Parcul Natural Lunca Joasă a Prutului Inferior este una dintre cele mai importante arii protejate din sudul Moldovei, înființat prin Hotărârea de Guvern nr. 2151/2004 pentru protecția biodiversității din lunca inferioară a Prutului.\n\n"
            "DIMENSIUNI:\n• Lungime: 145 km, de la Galați spre nord\n• Suprafață totală: 8.247 hectare, dintre care:\n  – 4.925 ha — mlaștini, lacuri, zone umede\n  – 2.627 ha — păduri și pajiști umede\n\n"
            "ISTORIE: în urma unui studiu regional finanțat de Biroul RAMSAR în 1999-2001, Prutul Inferior a fost propus pentru includerea în programul Coridorul Verde al Dunării de Jos, implementat cu sprijinul WWF. Structura administrativă a parcului a fost stabilită în martie 2010 și operează în cadrul Asociației Județene a Pescarilor Sportivi Galați.\n\n"
            "IMPORTANȚA ECOLOGICĂ:\n• Caracter de poartă spre Rezervația Biosferei Delta Dunării\n• Pe traseul a 3 mari coridoare de migrație a păsărilor din spațiul eurasiatic\n• Adăpostește peste 230 de specii de păsări (stârci, egrete, lopătari, rațe, gâște, pelicani — vizibili în pasajele de migrație)\n\n"
            "OBIECTIVE INCLUSE: lacurile Brateș, Pochina, Vlăscuța, Mălina, Talabasca, plus multe alte bălți și zone umede. Specii de pești: crap, somn, știucă, șalău, plătică.\n\n"
            "VIZITARE: birdwatching, plimbări cu barca, pescuit sportiv (cu permis), foto-tură. Sediul administrativ: Galați."
        ),
    },
    {
        "title": "Lacul Pochina",
        "lat": 45.85,
        "lon": 28.15,
        "location": "Sat Rogojeni, comuna Suceveni",
        "category": "Natură și Agrement",
        "year_built": None,
        "year_demolished": None,
        "status": "active",
        "article": "../assets/articles/lacul-pochina/index.html",
        "excerpt": "Lac mlăștinos de 74,8 ha pe Prut, rezervație mixtă cu valoare ornitologică deosebită. Stârci, egrete, rațe, lopătari în pasaj. Pește: crap, plătică, somn, știucă, șalău. Parte din Lunca Joasă Prut.",
        "description": (
            "Lacul Pochina este una dintre cele mai importante zone umede din nord-estul județului Galați, integrată în Parcul Natural Lunca Joasă a Prutului Inferior.\n\n"
            "LOCALIZARE: bazinul Prutului inferior, în zona satului Rogojeni din comuna Suceveni. Reprezintă un fost meandru al Prutului, izolat hidrologic în lacul de meandru actual.\n\n"
            "DIMENSIUNI ȘI STATUT:\n• Suprafață: 74,8 hectare\n• Statut: rezervație naturală mixtă cu importanță ornitologică deosebită\n• Apartenență: face parte din Parcul Natural Lunca Joasă a Prutului Inferior\n\n"
            "VALOARE ORNITOLOGICĂ: zonă de excepțională importanță avifaunistică în bazinul Prutului inferior. În perioadele de migrație, aici se înregistrează populații importante de păsări acvatice:\n• Stârci, egrete, lopătari\n• Rațe sălbatice (rață mare, rață cu cap castaniu)\n• Lișițe și cocosari\n• Pescăruși și chirighițe\n• Rândunici și lăstuni\n\n"
            "FAUNĂ PISCICOLĂ: lacul este populat cu crap, plătică, somn, știucă și șalău — face parte din traseele de pescuit sportiv organizat ale Asociației Pescarilor Galați.\n\n"
            "VIZITARE: birdwatching, fotografie de natură, pescuit sportiv (cu permis). Acces din DN26 spre Suceveni-Rogojeni."
        ),
    },

    # ─── MUZEU ───
    {
        "title": "Muzeul Mixt Tecuci „Teodor Cincu\”",
        "lat": 45.8497,
        "lon": 27.4255,
        "location": "Tecuci",
        "category": "Educație",
        "year_built": 1935,
        "year_demolished": None,
        "status": "active",
        "article": "../assets/articles/muzeul-mixt-tecuci/index.html",
        "excerpt": "Inaugurat la 21 noiembrie 1935 ca „Muzeul Comunal Mihail Dimitriu de Arheologie și Științe Naturale\”. Adăpostit în palatul donat de Teodor Cincu. Colecții arheologice (neolitic-bizantin) și paleontologice.",
        "description": (
            "Muzeul Mixt Tecuci este una dintre cele mai importante instituții culturale din nordul județului Galați, reunind colecții arheologice, istorice și de științe naturale.\n\n"
            "FONDAREA: la 20 mai 1934, Primăria orașului Tecuci a emis decizia de înființare a muzeului. Inaugurarea oficială a avut loc la 21 noiembrie 1935 sub denumirea „Muzeul Comunal Mihail Dimitriu de Arheologie și Științe Naturale”. Inaugurarea a coincis cu dezvelirea statuii lui Spiru Haret în fața liceului de fete, în prezența Ministrului Instrucțiunii Publice.\n\n"
            "SEDIUL: muzeul funcționează în palatul donat de Teodor Cincu, alături de Biblioteca Municipală (redenumită „Ștefan Petică” în 1994), în cadrul Fundației Culturale „Teodor și Maria Cincu”. Teodor Cincu — figură proeminentă a Tecuciului interbelic — a finanțat și a donat clădirea, asigurând patrimoniu și venit pentru funcționare.\n\n"
            "COLECȚII:\n• Arheologie: artefacte neolitice → bizantine — ceramică Cucuteni, tezaure dacice, inscripții grecești\n• Științe naturale și paleontologie\n• Istorie locală: rolul Tecuciului în comerțul moldovenesc medieval (oraș-târg pe Bârlad)\n• Etnografie regională\n\n"
            "REZERVAȚIA „LOCUL FOSILIFER RATEȘ”: din colecțiile muzeului face parte și mențiunea ariei protejate paleontologice Rateș-Tecuci — important sit pentru fauna pleistocenă din regiune.\n\n"
            "Tecuciul a fost și locul de naștere al poetului Ștefan Petică (1877-1904); muzeul include o secțiune dedicată acestuia."
        ),
    },

    # ─── CONACE ȘI CASE MEMORIALE ───
    {
        "title": "Conacul Costache Conachi (Țigănești)",
        "lat": 45.901464,
        "lon": 27.434424,
        "location": "Sat Țigănești, comuna Țepu (la 7 km de Tecuci)",
        "category": "Palate",
        "year_built": 1840,
        "year_demolished": None,
        "status": "ruins",
        "article": "../assets/articles/conacul-costache-conachi/index.html",
        "excerpt": "Palat neoclasic cu poartă neogotică, 12.900 mp construit, parc de 70 ha. Locul nașterii poetului Costache Conachi (1777-1849). Aici s-a plănuit Unirea Principatelor (Cuza, Alecsandri, Kogălniceanu, Negruzzi).",
        "description": (
            "Conacul Costache Conachi de la Țigănești este unul dintre cele mai importante monumente istorice și literare din județul Galați — locul unde s-a născut și a trăit poetul-precursor al literaturii române moderne, Costache Conachi.\n\n"
            "POETUL: Costache Conachi (n. 14 octombrie 1777 — d. 4 februarie 1849) s-a născut chiar în acest conac. A purtat ranguri boierești importante (ispravnic, logofăt) și este considerat un precursor al poeziei române moderne — primul mare poet care a demonstrat că versurile pot fi scrise în limba română, nu doar în greacă (cum era moda înaltei societăți). Istoricul Papadopol Calimah l-a poreclit „privighetoarea de la Țigănești”. A scris cele mai multe dintre poeziile sale erotice aici, dedicate iubirii pentru Smaranda (apoi Catinca) Vogoride.\n\n"
            "ARHITECTURA: nu este propriu-zis un „conac”, ci un palat veritabil:\n• Stil neoclasic\n• Poartă monumentală în stil neogotic\n• Suprafață construită: 12.900 metri pătrați\n• Parc generos: 70 de hectare\n• 3 niveluri\n• A fost reconstruit în jurul anului 1840 (forma actuală)\n\n"
            "ISTORIA UNIRII: aici, în conacul Conachi, s-au întâlnit în secret unioniștii care au pus la cale Mica Unire din 1859: Alexandru Ioan Cuza, Vasile Alecsandri, Mihail Kogălniceanu, Costache Negruzzi și Costache Conachi (gazda). Conacul este astfel locul unde s-a „plănuit” Unirea Principatelor.\n\n"
            "STATUT ACTUAL: în paragină vreme de decenii, conacul a fost preluat în 2023 de Consiliul Județean Galați de la Academia Română. CJ Galați a aprobat în 2025 un program de restaurare cu peste 44 milioane lei (fonduri UE), urmând ca palatul să fie redat circuitului public ca muzeu / centru cultural.\n\n"
            "ACCES: la 7 km de Tecuci, satul Țigănești (com. Țepu), DJ243."
        ),
    },
    {
        "title": "Casa Memorială „Hortensia Papadat-Bengescu\” (Ivești)",
        "lat": 45.6833,
        "lon": 27.5167,
        "location": "Comuna Ivești",
        "category": "Case istorice",
        "year_built": 1876,
        "year_demolished": None,
        "status": "active",
        "article": "../assets/articles/casa-papadat-bengescu/index.html",
        "excerpt": "Casa scriitoarei Hortensia Papadat-Bengescu (1876-1955), creatoarea romanului modern de analiză din literatura română — „Balzac feminin\”. Inaugurată ca muzeu pe 20 iulie 2009.",
        "description": (
            "Casa Memorială „Hortensia Papadat-Bengescu” din comuna Ivești comemorează una dintre cele mai importante prozatoare ale literaturii române interbelice și pioniera romanului modern de analiză psihologică.\n\n"
            "SCRIITOAREA: Hortensia Papadat-Bengescu (n. 8 decembrie 1876, Ivești — d. 5 martie 1955, București) este considerată creatoarea romanului modern de analiză din literatura română. Critica i-a atribuit titulaturile „Balzac feminin al literaturii noastre” și „mare europeană”, alături de alte mari scriitoare ale Europei moderne (Virginia Woolf, Colette).\n\n"
            "OPERA PRINCIPALĂ:\n• Femei — între ele (1919, debut)\n• Ciclul Hallipa (Concert din muzică de Bach, Drumul ascuns, Rădăcini, Logodnicul) — pictura unei familii burgheze pe parcursul unei generații\n• Bizantinii — proză de tinerețe\n\n"
            "CASA ȘI MUZEUL: clădirea în care scriitoarea a locuit pentru o perioadă îndelungată găzduiește astăzi obiecte personale, manuscrise, fotografii și materiale documentare. Casa Memorială a fost inaugurată oficial pe 20 iulie 2009.\n\n"
            "EXPOZIȚIA „PERSONALITĂȚILE IVEȘTIULUI”: odată cu deschiderea muzeului a fost lansată și expoziția „Personalitățile Iveștiului”, cu materiale și obiecte aparținând atât scriitoarei, cât și altor figuri culturale și istorice importante din Ivești.\n\n"
            "ACCES: în centrul comunei Ivești; la circa 30 km vest de Galați."
        ),
    },

    # ─── PODGORII ───
    {
        "title": "Podgoria „Dealul Bujorului\”",
        "lat": 45.8722,
        "lon": 28.0136,
        "location": "Târgu Bujor + comune adiacente (Smulți, Oancea, Berești)",
        "category": "Alte locuri",
        "year_built": 1775,
        "year_demolished": None,
        "status": "active",
        "article": "../assets/articles/podgoria-dealul-bujorului/index.html",
        "excerpt": "Podgorie istorică pe dealurile paralele cu Prutul — aproape 4.000 ha de viță-de-vie. Atestată din sec. XV, tradiția vinurilor „Dealul Bujorului\” începe în 1775. SCDVV Bujoru — 350 ha, 13 medalii internaționale.",
        "description": (
            "Podgoria Dealul Bujorului este una dintre cele mai vechi și prestigioase regiuni viticole din sudul Moldovei, situată pe dealurile paralele cu Prutul, în partea de est a județului Galați.\n\n"
            "DIMENSIUNI: aproape 4.000 hectare de viță-de-vie, distribuite în patru centre viticole:\n• Bujoru (centrul tradițional)\n• Smulți\n• Oancea\n• Berești\n\n"
            "ETIMOLOGIA: numele „Dealul Bujorului” este învăluit în legende:\n• Posibil de la haiducul Bujor („Lupu lui Bujor”)\n• De la un cioban pe nume Bujor\n• De la un han cu același nume\n• Cea mai plauzibilă: de la frumoasa floare roșie de bujor sălbatic românesc, ornament al pădurilor xerotermice de pe dealurile învecinate\n\n"
            "ISTORIE:\n• Documente din sec. XV (Petru Rareș, Irimia Movilă, Grigore Alexandru Ghica) atestă existența unor vii mici în regiune\n• 1775: prima atestare a viilor în zona Târgu Bujor — începutul tradiției „Dealul Bujorului”\n• 1977: prin decret de stat se înființează Stațiunea de Cercetare-Dezvoltare pentru Viticultură și Vinificație Bujoru (SCDVV Bujoru)\n• Astăzi: SCDVV Bujoru gestionează 350 hectare de vii productive\n\n"
            "SOIURI ȘI VINURI:\n• Vinuri roșii: Merlot, Cabernet Sauvignon, Fetească Neagră, Băbeasca Neagră (varietate locală)\n• Vinuri albe superioare: Fetească Albă, Riesling Italian, Muscat Ottonel, Sarba\n• Vinuri de consum curent\n\n"
            "RECUNOAȘTERE: vinurile „Dealul Bujorului” au obținut 13 medalii la concursuri naționale și internaționale, fiind reintroduse pe piață sub denumirea originală.\n\n"
            "VIZITARE: degustări la cramele SCDVV Bujoru și la cramele mici din Berești-Meria; turism gastronomic și viticol."
        ),
    },
]


def slug_from(title):
    """Slugify util pentru fallback (deși articolul e specificat manual mai sus)."""
    import unicodedata, re
    n = unicodedata.normalize('NFKD', title)
    n = ''.join(c for c in n if not unicodedata.combining(c))
    n = n.replace('ț','t').replace('ș','s').replace('Ț','t').replace('Ș','s')
    n = re.sub(r'[^a-zA-Z0-9]+', '-', n.lower()).strip('-')
    return n


def main():
    data = json.loads(PATH.read_text(encoding='utf-8'))
    locs = data if isinstance(data, list) else data.get('locations', [])

    # Find next free ID
    used = set(L.get('id') for L in locs)
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
            "geocoded_as": "Adăugat din script (research județ Galați 2026-05-10)",
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
