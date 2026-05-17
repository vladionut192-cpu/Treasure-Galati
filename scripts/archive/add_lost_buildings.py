#!/usr/bin/env python3
"""Adaugă 16 clădiri istorice dispărute / distruse din Galați.

Surse principale:
- Marius Mitrof, „Piața Regală și corso-ul gălățean", Historia Urbana XXV/2017
- Sandel Dumitru, „Galațiul așa cum mi-l amintesc", vol V-X
- galati.wiki, viata-libera.ro, bvau.ro infoghid
"""
import json
from pathlib import Path

PATH = Path(__file__).resolve().parent.parent / "galati_map" / "locations.json"

NEW = [
    # ─── 1. SINAGOGA MARE ───
    {
        "title": "Sinagoga Mare (prima sinagogă din Galați)",
        "lat": 45.4356,
        "lon": 28.0540,
        "location": "Str. Podul de Piatră — zona Vovidenia",
        "category": "Lăcașuri de cult",
        "year_built": 1780,
        "year_demolished": 1960,
        "status": "demolished",
        "article": "../assets/articles/sinagoga-mare-galati/index.html",
        "excerpt": "Prima sinagogă din Galați, atestată documentar la 1780. În curte avea o mikwe cu baie de aburi. Sediul inițial al Comunității Evreilor (epitropia). Una dintre cele 22 de sinagogi ale orașului interbelic. Astăzi: doar Templul Meseriașilor (1875) mai funcționează.",
        "description": """Sinagoga Mare a fost prima sinagogă atestată documentar din Galați, una dintre cele mai vechi din Moldova de Sud.

ÎNCEPUTURILE:

• 1730: prima atestare documentară a unei case de rugăciuni a evreilor din Galați.
• ~1780: ridicarea Sinagogii Mari pe str. Podul de Piatră — confirmată ca prima sinagogă propriu-zisă a comunității.

CURTEA SINAGOGII:

În curtea Sinagogii Mari era amenajată și o mikwe (baie rituală evreiască) cu baie de aburi — element esențial pentru viața religioasă tradițională. Tot aici a funcționat și PRIMUL SEDIU AL COMUNITĂȚII EVREILOR DIN GALAȚI (epitropia) — instituția de auto-guvernare comunitară.

CONTEXTUL COMUNITĂȚII:

• 1805: epitropia se constituie oficial
• Apogeu interbelic: peste 22.000 de evrei trăiau în Galați (>20% din populație)
• 22 (sau 23 după unele surse) de temple și sinagogi funcționau în oraș la apogeu

SOARTA — DESFIINȚAREA:

Sinagoga Mare a supraviețuit ambelor războaie mondiale, dar nu a rezistat sistematizărilor comuniste din anii '50-'60. A fost demolată odată cu transformarea zonei portuare și a comunității evreiești puternic redusă după Holocaust și emigrarea în Israel.

Astăzi din cele 22 de sinagogi ale orașului mai funcționează DOAR Templul Meseriașilor (str. Dornei nr. 7-11, construit 1875, restaurat 2014).

Sursa: Sandel Dumitru, vol VI.""",
    },

    # ─── 2. BISERICA SFÂNTA VINERI ───
    {
        "title": "Biserica „Sfânta Vineri” (distrusă 1944)",
        "lat": 45.4280,
        "lon": 28.0470,
        "location": "Zona dealul Țiglina, pe direcția de zbor a avioanelor",
        "category": "Lăcașuri de cult",
        "year_built": 1700,
        "year_demolished": 1944,
        "status": "demolished",
        "article": "../assets/articles/biserica-sfanta-vineri-galati/index.html",
        "excerpt": "Biserică veche distrusă în raidul aerian american din 6 iunie 1944 alături de aeroportul militar și casele civile aflate pe direcția de zbor. Mănăstirea cu același nume era atestată din epoca medievală.",
        "description": """Biserica „Sfânta Vineri” din Galați a fost una dintre clădirile de cult cu cea mai dramatică soartă din timpul celui de-al Doilea Război Mondial.

ATESTAREA MEDIEVALĂ:

Mănăstirea Sf. Vineri era atestată documentar încă din epoca lui Vasile Lupu și a lui Gheorghe Rákóczi al II-lea (sec. XVII). Pecetea Sf. Vineri era închinată Muntelui Sinai, ceea ce sugerează un statut de metoc al unui așezământ monahal levantin (vezi Nicolae Iorga, „Studii și documente cu privire la istoria românilor”, vol. V — cărți domnești).

CONTEXT URBAN:

În jurul mănăstirii Sf. Vineri se afla un „medean” (= teren liber / piață deschisă) folosit ca aprozar și piață de mărfuri — atestat de Sandel Dumitru pe lângă tradiția vistiernicului Petrache Sturza care a înființat un bazar acolo în jurul lui 1820. Era nucleul comercial vechi al cartierului Țiglina.

DISTRUGEREA — 6 IUNIE 1944:

În contextul celui de-al Doilea Război Mondial, aviația americană a lovit Galațiul în mai multe raiduri (aprilie + iunie + august). Pe 6 IUNIE 1944, raidul american a distrus parțial:
• AEROPORTUL MILITAR (loc-109)
• Biserica „Sfânta Vineri”
• Casele civile aflate pe direcția de zbor a avioanelor (Sandel, vol VII)

Biserica nu a mai fost reconstruită. La sistematizările comuniste din anii 1960-1980, urmele au fost șterse complet.

Surse: Sandel Dumitru vol V + VII, Mitrof 2017 (articolul Faleza Dunării — RDJ 214/2019), Nicolae Iorga.""",
    },

    # ─── 3. HALA CENTRALĂ / PLAZA CANTACUZINO ───
    {
        "title": "Hala Centrală / Piața Veche („Plaza Cantacuzino”)",
        "lat": 45.4338,
        "lon": 28.0590,
        "location": "Zona „La răspântie” — intersecția veche Brăilei × Mare × Făinăriei",
        "category": "Comerț istoric",
        "year_built": 1700,
        "year_demolished": 1960,
        "status": "demolished",
        "article": "../assets/articles/hala-centrala-piata-veche-galati/index.html",
        "excerpt": "Piața veche a târgului Galați, prezentă pe planul inginerului Rizer din 1857 ca „Plaza prințului D. Kantacuzino”. Nucleul comercial-medieval al orașului, treptat înlocuit de Piața Regală (la nord) și sistematizat complet în comunism.",
        "description": """Hala Centrală sau „Piața Veche” a Galațiului a fost nucleul comercial-medieval al orașului, mai veche decât celebra Piața Regală.

PRIMA REPREZENTARE CARTOGRAFICĂ:

Pe Planul orașului Galați întocmit de inginerul Ignat Rizer în 1857, în zona „La răspântie” apare un patrulater cu inscripția „Plaza prințului D. Kantacuzino” — o suprafață destul de extinsă la mijlocul secolului al XIX-lea.

ETIMOLOGIE: numele „Cantacuzino” provine de la unul dintre boierii moldoveni care deținea drepturi de monopol comercial în zonă. Denumirea oficială însă NU a prins; locul a rămas cunoscut popular ca „La răspântie” și apoi ca „Piața Veche”.

FUNCȚIA URBANĂ:

Era zona în care se întâlneau drumurile comerciale importante:
• Uliţa Brăilei (spre sud — port)
• Uliţa Bârladului
• Uliţa Făinăriei (devenită ulterior Independenţei)
• Uliţa Braşoveniei
• Uliţa Mare

Aici se făceau tranzacțiile zilnice — pâine, carne, lapte, legume, mărfuri textile, ceramică. Hanul lui Paraschiv (sec. XVIII-XIX, viitorul Hotel Imperial) era pe acest pol.

SOARTA — ÎNLOCUIREA TREPTATĂ:

• După Hrisovul lui Mihail Sturdza din 1836 și statutul porto-franco (1837), centrul comercial s-a deplasat spre nord — pe noua Piață Regală.
• Piața Veche a rămas activă pentru comerțul popular până în interbelic.
• La 1944, zona a fost parțial distrusă odată cu Piața Regală.
• 1953-1960: sistematizarea comunistă a Bulevardului Republicii (fostă Domnească) a rasolit complet zona pentru a face loc blocurilor de 3 etaje cu cărămidă aparentă (200 apartamente).

Sursa: Mitrof 2017, p. 69-73; SJANG Colecția Planuri 1841.""",
    },

    # ─── 4. HOTEL IMPERIAL (Piața Regală) ───
    {
        "title": "Hotel Imperial (pe locul Hanului lui Paraschiv)",
        "lat": 45.4350,
        "lon": 28.0552,
        "location": "Piața Regală — latura vest/NV",
        "category": "Comerț istoric",
        "year_built": 1880,
        "year_demolished": 1944,
        "status": "demolished",
        "article": "../assets/articles/hotel-imperial-galati/index.html",
        "excerpt": "Hotel construit la sfârșitul sec. XIX pe locul faimosului Han al lui Paraschiv (paharnicul Paraschiv Șerban, proprietar moșia Băleni). Aici venea tânărul Alexandru Cuza să se întâlnească cu prietenii săi. Distrus în noaptea de 24-25 august 1944 de armata germană.",
        "description": """Hotel Imperial era unul dintre hotelurile-emblemă ale Pieței Regale a Galațiului, construit pe un teren cu istorie deosebită.

ETAPA 1 — HANUL LUI PARASCHIV (sec. XIX timpuriu și mijlociu):

Proprietatea aparținuse paharnicului PARASCHIV ȘERBAN, proprietar al moșiei Băleni și ag-prezident al alegerilor pentru Divanul Ad-Hoc al Moldovei. Hanul construit pe acest teren era cunoscut popular ca „Hanul lui Paraschiv” — un loc faimos al sec. XIX descris în Munteanu-Bârlad („Galaţii”, 1927):

„Aici se adunau marii cartofori ai târgului și feciorii de bani gata, cari risipeau averi, sănătate și vreme în chefuri și orgii cu femei desfrânate, zile și nopți, până la deplină îndobitocire.”

PRINTRE OASPEȚI:
• Tânărul ALEXANDRU CUZA — viitorul domnitor al Principatelor Române, venea aici să se întâlnească cu prietenii săi Alexandru Chiparis (dragoman la Consulatul Austriei) și Librecht (cel care peste ani avea să-l trădeze)
• Italienii Delvechio și bătrânul Fanciotti
• Dumitru Rodocanachi (președintele Comunității elene)
• Sachiari și Gheorghe Vlasto — mari negustori ai târgului

ETAPA 2 — HOTEL IMPERIAL (1880-1944):

În jurul anului 1880, hanul a fost reconstruit ca Hotel Imperial — clădire de 2 etaje în stil eclectic-urban. Devine reper al Pieței Regale (denumită oficial la 14 decembrie 1884).

Pe fotografia istorică din 1912 (înainte de dezvelirea statuii Costache Negri), Hotel Imperial apare în stânga, alături de Bazarul Român și Magazinul de băuturi Leon Lilienfeld. Lângă el — Sala Alcazar.

SOARTA:

Distrus complet în noaptea de 24-25 august 1944 prin minare germană, împreună cu tot centrul orașului delimitat de strada Domnească, Parcul Municipal, strada General Berthelot (azi Nicolae Bălcescu), strada Brăilei și Piața Regală.

Surse: Mitrof 2017 (Historia Urbana XXV); Munteanu-Bârlad „Galaţii” 1927.""",
    },

    # ─── 5. HOTEL SPLENDID ───
    {
        "title": "Hotel Splendid",
        "lat": 45.4348,
        "lon": 28.0560,
        "location": "Piața Regală — latura EST/SE",
        "category": "Comerț istoric",
        "year_built": 1890,
        "year_demolished": 1944,
        "status": "demolished",
        "article": "../assets/articles/hotel-splendid-galati/index.html",
        "excerpt": "Unul dintre cele mai mari hoteluri din Piața Regală — 3 etaje neoclasice cu firmă SPLENDID pe acoperiș. De pe balconul lui, fotograful gălățean E. Balaș a făcut majoritatea ilustratelor Pieței Regale. Tramvaiul venea din portul Galați pe str. Speranței și trecea pe lângă el. Distrus 1944.",
        "description": """Hotel Splendid era unul dintre cele mai mari și mai înalte hoteluri ale Pieței Regale a Galațiului — cu 3 etaje neoclasice, firmă mare „SPLENDID” pe acoperiș, vizibilă în zeci de fotografii istorice.

POZIȚIA — LATURA ESTICĂ A PIEȚEI:

Aflat pe latura est-sud-est a Pieței Regale, Hotel Splendid avea fereastra principală spre piață și balconul artistic într-o frumoasă curbă neoclasică. Tramvaiul orașului venea din Portul Galați, urca pe strada Speranței, trecea pe lângă Hotelul Splendid în drumul lui spre strada Mavromol și strada Portului.

BALCONUL FOTOGRAFULUI E. BALAȘ:

Hotel Splendid a intrat în istoria fotografică a Galațiului datorită balconului său. Fotograful gălățean E. BALAȘ a folosit acest balcon ca punct privilegiat pentru a realiza ZECILE DE ILUSTRATE care au făcut din Piața Regală o emblemă a orașului-port. Multe dintre fotografiile interbelice ale orașului au fost făcute „de pe balconul Hotelului Splendid”.

În Anuarele Volbură 1931-1932 și 1936-1938, Hotel Splendid apare consecvent ca unul dintre principalele hoteluri ale orașului, alături de Imperial, Metropol, Continental, Concordia, Bristol și Paolu.

SOARTA:

Distrus în noaptea de 24-25 august 1944 prin minare germană, împreună cu tot centrul Pieței Regale. Refacerea a fost împiedicată după 1947 de regimul comunist. Astăzi pe locul lui sunt blocuri de 3 etaje cu cărămidă aparentă.

Surse: Mitrof 2017; Sandel Dumitru vol VII.""",
    },

    # ─── 6. CASA HELDER ───
    {
        "title": "Casa & Bijuteria „Helder” (turnul cu ceasul vienez)",
        "lat": 45.4350,
        "lon": 28.0558,
        "location": "Str. Domnească nr. 14, lângă Piața Regală",
        "category": "Case istorice",
        "year_built": 1900,
        "year_demolished": 1944,
        "status": "demolished",
        "article": "../assets/articles/casa-helder-galati/index.html",
        "excerpt": "Clădire spectaculoasă de 2 etaje + parter + TURN cu ceas „cât o roată de car” care mergea cu precizie astronomică — tot orașul își potrivea ceasul după ea. Stil vienez, proprietar Moritz Helder (evreu n. Austria, atestat 1910). Furnizor al casei regale. Distrusă 1944.",
        "description": """Casa Helder era una dintre cele mai distinctive clădiri ale Galațiului interbelic — un veritabil turn vienez ridicat pe Domnească 14, lângă Piața Regală.

ARHITECTURĂ — UN TURN VIENEZ ÎN GALAȚI:

Clădirea avea 2 etaje + parter + TURN cu ceas, descrisă de contemporani drept „o casă mare, cu două etaje şi cu turn, parcă ar fi fost unul din turnurile primăverii vieneze, şi-n turn un ceas mare cât o roată de car, care bătea orele şi jumătăţile de oră” (citat de dr. Cristian Mușețeanu).

CEASUL — REPER URBAN AL ORAȘULUI:

Ceasul mergea „cu precizie astronomică” și TOT ORAȘUL ÎȘI POTRIVEA CEASUL DUPĂ EL. Era cel mai cunoscut reper temporal public al Galațiului — un fel de Big Ben local. „Cum făcea el să-i meargă așa ceasul, era secretul său” — scria același dr. Mușețeanu.

PROPRIETARUL — MORITZ HELDER:

Bijutier de origine evreiască, născut în Austria. Atestat ca proprietar pe str. Domnească nr. 14 la 1910 — vecin la sud cu proprietatea Crissoveloni. Era „bogat şi serios ovreiul. Vorbea românește corect, dar se vedea că-i vine peste mână, că a învățat românește dintr-un manual cu gramatică şi cuvinte aşezate după alfabet. Era îmbrăcat întotdeauna în negru ca un cioclu, cu cămașă albă scrobită şi cu cravată fiong” (Sandel vol VII).

FURNIZOR AL CASEI REGALE:

D-l M. Helder era furnizor al Casei Regale Române — fapt scris pe marea vitrină a magazinului, SUB STEMA CASEI REGALE ROMÂNE: coroana de monarh, închisă deasupra și ținută de lei. „Mai toți gălățenii veneau la Helder, cei din protipendadă pentru bijuterii scumpe.”

CITAT IORGU IORDAN (din „Memorii”):

„un magazin Helder, pe strada principală a orașului, putea face figură frumoasă nu numai la București, ci şi într-o metropolă occidentală, prin aspectul lor foarte civilizat, şi nu numai în ce priveşte exteriorul.”

SOARTA:

Distrusă în noaptea de 24-25 august 1944 — surprinsă „sub cenuşa flăcărilor ultimului război” într-una din puținele fotografii cu Casa Helder + Casa Crissoveloni în ruină.

Surse: Sandel Dumitru vol VII (citat dr. Cristian Mușețeanu); Iorgu Iordan „Memorii”; Mitrof 2017.""",
    },

    # ─── 7. BAZARUL ROMÂN ───
    {
        "title": "Bazarul Român",
        "lat": 45.4350,
        "lon": 28.0554,
        "location": "Piața Regală — latura nord-vestică, lângă Hotel Imperial",
        "category": "Comerț istoric",
        "year_built": 1880,
        "year_demolished": 1944,
        "status": "demolished",
        "article": "../assets/articles/bazarul-roman-galati/index.html",
        "excerpt": "Mare magazin general („bazar”) din Piața Regală, vizibil în fotografia-cheie din 1912 alături de Hotel Imperial și Magazinul de băuturi Leon Lilienfeld. Distrus în noaptea de 24-25 august 1944.",
        "description": """Bazarul Român era unul dintre cele mai mari magazine generale ale Galațiului — un veritabil „univers comercial” în Piața Regală.

POZIȚIA:

În centrul fotografiei istorice din 1912 (cu legenda „Cadru cu Piața Regală înainte de 1912, Hotel Imperial, Bazarul Român, Magazinul de băuturi Leon Lilienfeld, tramvaiul intra pe str. Brăilei”), Bazarul Român apare ca o clădire LARGĂ cu fațadă neoclasică, cu firma vizibilă „BAZARUL ROMÂN” pe sigla din colțul superior.

Era adiacent Hotelului Imperial (vest) și Magazinului Lilienfeld (dreapta).

TIPOLOGIE — UN „BAZAR” COMERCIAL:

Termenul „bazar” desemna la 1900 un magazin universal cu departamente multiple — manufactură, articole de menaj, ceramică, textile, jucării, papetărie. Era precursorul magazinelor universale moderne. La Galați, „Bazarul Român” concura cu alte magazine generale precum „La Mascota” și „La Bosfor”.

CONTEXTUL PIEȚEI REGALE LA 1908:

Conform Guid-Anuarului George Atanasiu, 1908 (citat de Mitrof), zona Piața Regală + Domnească până la Biserica Greacă concentra:
• 6 hoteluri (Imperial, Metropol, Continental, Bristol, Concordia, Paolu)
• 4 cofetării (Universelle, Vladimir, Central, Gologan)
• Berăria Central + Restaurantul Dienst + Grădina și teatrul „Varieté Central”
• Cercul Militar + Intim Club + Club Central
• Zeci de magazine de manufactură și bijuterii

Bazarul Român era unul dintre pilonii comerciali ai zonei.

SOARTA:

Distrus în noaptea de 24-25 august 1944 prin minare germană, împreună cu tot complexul Pieței Regale.

Surse: Mitrof 2017; fotografia istorică pubcrawl 11-piata-regala_06.jpg.""",
    },

    # ─── 8. CINEMA TRIANON → REPUBLICA ───
    {
        "title": "Cinema Trianon (devenit Cinema Republica)",
        "lat": 45.4348,
        "lon": 28.0562,
        "location": "Piața Regală — latura estică",
        "category": "Comerț istoric",
        "year_built": 1905,
        "year_demolished": 1990,
        "status": "demolished",
        "article": "../assets/articles/cinema-trianon-republica-galati/index.html",
        "excerpt": "Cinematograf inaugurat la începutul sec. XX în Piața Regală, parte din valul de cinematografe ale corso-ului gălățean. Transformat după 1944 în Cinema Republica (comunist). Demolat post-1989. Trei vieți pentru aceeași clădire.",
        "description": """Cinema Trianon din Piața Regală a Galațiului a avut o istorie tipic gălățeană — trei „vieți” în 90 de ani, fiecare cu identitate diferită.

ETAPA 1 — CINEMA TRIANON (1905-1944):

Inaugurat la începutul secolului XX, Cinema Trianon făcea parte din valul de cinematografe care a făcut din Piața Regală + corso-ul gălățean unul dintre cele mai dinamice centre culturale ale României interbelice.

Sandel Dumitru vol VII enumeră în Piața Regală cinematografele:
• Cinema Trianon
• Cinema Louvru (loc-135 — alt pin pe hartă)
• Sala Alcazar

În fotografia istorică din 1937 (pubcrawl_11-piata-regala_18), firma „CINEMA TRIANON” apare clar vizibilă pe latura estică a pieței, alături de Hermes (loto), La Menage și Loteria Stat.

Repertoriul Trianon-ului acoperea producțiile americane și europene ale anilor 1920-1930 — Chaplin, filme romantice franceze, melodrame.

ETAPA 2 — CINEMA REPUBLICA (1944-1989):

În timpul minării germane din 24-25 august 1944, clădirea Trianon-ului a fost grav afectată, dar nu complet distrusă. După 1948, regimul comunist a reconstruit-o și a redenumit-o CINEMA REPUBLICA — devine cinematograful-flagship al orașului în epoca comunistă, proiectând filme sovietice, est-europene și producții românești cenzurate. Sala avea peste 600 de locuri.

ETAPA 3 — ABANDON ȘI DEMOLARE (post-1989):

După Revoluția din 1989, declinul cinematografelor de cartier (concurența VHS-ului apoi a internetului) a făcut ca Cinema Republica să rămână abandonat. Clădirea a fost demolată la mijlocul anilor '90 - 2000 odată cu modernizările zonei centrale.

CONTEXT MORE BROADLY — Sandel pomenește „cinema Trianon (astăzi Republica)” într-un fragment despre vânzarea unei tipăriri cu „Cuza, regele şi regină” — confirmând că aceeași clădire fizică a trecut prin ambele identități.

Surse: Sandel Dumitru vol VII; Mitrof 2017.""",
    },

    # ─── 9. HANUL LUI ȚIGĂNUȘ ───
    {
        "title": "Hanul lui Țigănuș (Teodor Atanasiu)",
        "lat": 45.4352,
        "lon": 28.0550,
        "location": "Piața Regală — la nord de Hanul lui Paraschiv",
        "category": "Comerț istoric",
        "year_built": 1840,
        "year_demolished": 1900,
        "status": "demolished",
        "article": "../assets/articles/hanul-lui-tiganus-galati/index.html",
        "excerpt": "Han cu 38 de odăi pe terenul Pieței Regale (sec. XIX). Proprietar: Teodor Atanasiu, zis „Țigănuș” — favorit al domnitorului Mihail Sturza. În 1853, la începutul Războiului Crimeei, odăile au fost ocupate de ofițerii armatei ruse.",
        "description": """Hanul lui Țigănuș a fost unul dintre cele 2 hanuri-emblemă ale Pieței Regale a Galațiului în secolul XIX, alături de Hanul lui Paraschiv (viitorul Hotel Imperial).

PROPRIETARUL — TEODOR ATANASIU „ȚIGĂNUȘ”:

Proprietatea agăi Paraschiv se continua spre nord cu proprietatea lui Teodor Atanasiu, deținătorul moșiei Voinești de lângă Berești. Era „înalt, spătos şi negricios la ten — de unde şi porecla Ţigănuş” (Mitrof 2017, p. 70, citând Munteanu-Bârlad).

Datorită „vredniciei, dar şi a şireteniei de care dădea dovadă, Teodor Atanasiu a câştigat repede încrederea domnitorului Mihail Sturza, devenind favoritul său”.

HANUL — 38 ODĂI:

Pe proprietatea sa din Galați, Atanasiu și-a construit un han cunoscut sub numele de „Hanul lui Țigănuș”. Avea 38 DE ODĂI — un complex impresionant pentru epocă, mai mare decât majoritatea hanurilor moldovenești.

EPISODUL 1853 — RĂZBOIUL CRIMEEI:

La începutul Războiului Crimeei (1853), cele 38 de odăi ale Hanului lui Țigănuș au fost OCUPATE DE OFIȚERII ARMATEI RUSE care „au chefuit straşnic şi au adus pagube numeroase” (Mitrof, citat din arhiva primăriei).

Acest moment marchează un episod-cheie al ocupației rusești a Moldovei dinaintea războiului: 38 de odăi ocupate într-un singur han transformat în barăcăment ofițeresc.

FAMILIA:

Teodor Atanasiu a avut o fată, Smaranda, măritată cu aga Gheorghe Hermeziu. Căsătoria a fost de scurtă durată; Smaranda a divorțat „foarte repede, fără ca motivele să ne fie cunoscute” (Mitrof).

SOARTA:

Hanul a fost demolat la sfârșitul secolului XIX, odată cu modernizarea Pieței Regale (denumită oficial la 14 decembrie 1884) și înlocuirea hanurilor cu hoteluri propriu-zise (Hotel Imperial, Splendid etc.).

Sursa: Mitrof 2017, Historia Urbana XXV, p. 70.""",
    },

    # ─── 10. CASA CRISSOVELONI ───
    {
        "title": "Casa & Banca Crissoveloni",
        "lat": 45.4348,
        "lon": 28.0559,
        "location": "Str. Domnească (la sud de Casa Helder)",
        "category": "Case istorice",
        "year_built": 1848,
        "year_demolished": 1944,
        "status": "demolished",
        "article": "../assets/articles/casa-banca-crissoveloni-galati/index.html",
        "excerpt": "Casa familiei Crissoveloni — bancheri greci originari din Bizanț și insula Chios, stabiliți la Galați în 1848. Elena Crissoveloni (1879-1958) — născută aici, viitoare figură proeminentă a aristocrației interbelice. Sediu al „Chrissoveloni Fils, maison d’exportation et de banque” — precursorul Băncii Crissoveloni de la București (1920). Distrusă 1944.",
        "description": """Casa și Banca Crissoveloni au reprezentat unul dintre cele mai distinse colțuri ale aristocrației comerciale gălățene — locul unde a fost FONDATĂ una dintre cele mai importante bănci ale României interbelice.

FAMILIA — ORIGINEA BIZANTINĂ ȘI INSULARĂ:

„Familia Chrissoveloni este originară din Bizanţ şi insula Chios şi a început să facă afaceri în Ţările Române, la Galaţi, în jurul anului 1848.” (Sandel vol VII).

FONDAREA — ZANNI MANOLIS CHRISSOVELONI:

În 1848, Zanni Manolis Chrissoveloni deschide la Galați contoarul numit „Chrissoveloni Fils, maison d’exportation et de banque” — un birou de comerț + bancă privată, primul de acest tip al unei familii grecești în România. Acest contoar va deveni nucleul Băncii Crissoveloni de la București (înființată oficial în 1920).

Pe Domnească 14 + casa adiacentă (la sud de Casa Helder), familia avea proprietatea principală.

ELENA CRISSOVELONI (1879-1958):

Elena Chrissoveloni s-a născut în această casă în 1879. Va deveni una dintre cele mai cosmopolite figuri ale aristocrației interbelice românești:
• Soția lui John N. Chrissoveloni, moștenitorul băncii
• Vizitatoare a curților europene
• Una dintre primele femei români să conducă afaceri financiare la nivel internațional

Zane Chrissoveloni — un alt membru al familiei — a fost ulterior proprietarul moșiei Ghidigeni (care a inspirat și conacul cu același nume, prezent în jud. Galați).

EXPANSIUNEA:

Banca Crissoveloni de la București a devenit, după 1920, una dintre cele mai importante instituții financiare ale României interbelice — cu sucursale internaționale (inclusiv la Paris și New York). Spectaculos: o bancă pornită dintr-o casă din Galați a ajuns să facă afaceri pe trei continente.

PARTICIPAREA LA VIAȚA CULTURALĂ:

În august 1914, la o seară dansantă organizată la Cinema Louvru pentru refugiații belgieni (după invazia germană a Belgiei), printre participanții din protipendadă figurează „Z. Chrissoveloni” alături de M. Basarabeanu, A. Vuccino ș.a. (Mitrof 2017).

SOARTA:

Casa Crissoveloni a fost distrusă în noaptea de 24-25 august 1944 împreună cu vecina Casă Helder — surprinsă „sub cenuşa flăcărilor ultimului război”. Refacerea a fost împiedicată după 1947.

Surse: Sandel Dumitru vol VII + V; Mitrof 2017.""",
    },

    # ─── 11. SPITALUL VECHI SF. SPIRIDON ───
    {
        "title": "Spitalul vechi „Sf. Spiridon”",
        "lat": 45.4332,
        "lon": 28.0578,
        "location": "Zona Vovidenia, str. Sf. Spiridon",
        "category": "Comerț istoric",
        "year_built": 1836,
        "year_demolished": 1960,
        "status": "demolished",
        "article": "../assets/articles/spitalul-vechi-sf-spiridon-galati/index.html",
        "excerpt": "Primul spital public din Galați (1836 sau 1840), construit sub domnia lui Mihail Sturdza odată cu legile de modernizare sanitară a Moldovei. Funcționa până la sistematizările comuniste; numele s-a păstrat pe strada actuală Sf. Spiridon.",
        "description": """Spitalul „Sf. Spiridon” din Galați a fost prima instituție medicală publică a orașului, parte din valul de modernizare sanitară a Moldovei sub domnitorul Mihail Sturdza.

FONDAREA — CONTEXT REFORMIST (1836):

În contextul Regulamentului Organic (1832-1834) și a modernizării administrative a Moldovei, Mihail Sturdza a impus construirea de spitale publice în orașele importante. La Galați, planurile pentru spital sunt menționate în:
• Hurmuzaki, XXI, p. 922 — „despre construirea spitalului, 1833”
• Hurmuzaki, S.116, p. 289-291 — „plan pentru construirea spitalului”
• Al.R., 13 aprilie 1841 — „spitalul exista” (deja funcțional)

Datarea oscilează între 1836 și 1840, dar la 1841 spitalul era deja operațional (Sandel vol X — bibliografie).

NUME — SF. SPIRIDON:

Patronajul era cel al Sfântului Spiridon (cult răspândit la moldoveni), aceeași tradiție cu Spitalul Sf. Spiridon din Iași (mănăstirea omonimă din 1755 sub domnitorul Constantin Cehan Racoviță).

POZIȚIONARE:

Spitalul era în zona mahalalei Vovidenia (vechi cartier istoric al Galațiului, atestat din 1821). Strada actuală „Sf. Spiridon” (Pub Crawl menționează biserica omonimă pe nr. 13) păstrează numele.

FUNCȚIONAREA:

A deservit populația până la apariția spitalelor moderne (Spitalul Israelit 1848, Spitalul Județean ulterior). În interbelic, funcționa ca spital secundar / azil de bătrâni, ulterior unitate medicală minoră.

SOARTA:

Demolat în anii 1960 la sistematizările cartierului Vovidenia. Pe locul lui — astăzi blocuri rezidențiale.

Surse: Sandel Dumitru vol X (bibliografie); Hurmuzaki vol XXI și suplimente.""",
    },

    # ─── 12. BANCA MARMOROSCH BLANK (sediul central) ───
    {
        "title": "Banca „Marmorosch Blank & Co.” Galați (sediul central)",
        "lat": 45.4374,
        "lon": 28.0555,
        "location": "Str. Domnească (unul din 3 sedii Marmorosch din Galați)",
        "category": "Comerț istoric",
        "year_built": 1880,
        "year_demolished": 1948,
        "status": "demolished",
        "article": "../assets/articles/banca-marmorosch-blank-galati/index.html",
        "excerpt": "Banca Marmorosch Blank & Co. — una dintre cele mai mari bănci ale României de la sfârșitul sec. XIX până la 1948. Avea 3 sedii la Galați. Finanțase Fabrica Goetz în 1895 cu capital de 8 milioane franci. Naționalizată 1948.",
        "description": """Banca „Marmorosch Blank & Co.” a fost una dintre cele mai importante instituții financiare ale României dintre 1880 și 1948, cu o puternică prezență la Galați — orașul-port care a făcut din ea „Anversul Orientului” financiar.

FONDAREA:

Banca Marmorosch Blank & Co. a fost fondată în 1874 la București de Iacob Marmorosch (n. Ungaria) și Maurice Blank (n. Germania) — doi finanțatori evrei care au creat prima bancă comercială pe acțiuni a României.

SEDIILE DIN GALAȚI (3):

Sandel Dumitru vol VI menționează explicit: „Banca Marmorosch Blank care avea TREI SEDII ÎN GALAȚI”. Concentrarea era impresionantă — sugerează volumul comercial uriaș al orașului-port. Cele 3 sedii erau:
• Sediul principal (probabil pe Domnească, în zona Piaței Regale)
• Filiala portuară (lângă str. Portului)
• Filiala administrativă (zona centrală pentru cont curent)

OPERAȚIUNI MAJORE LA GALAȚI:

• 1895: BANCA FINANȚEAZĂ FABRICA GOETZ & Co. (cherestea) — capital de 8.000.000 franci. (loc-141 — Fabrica Goetz e deja pe hartă)
• 1882-1892: Banca Marmorosch Blank participă la finanțarea Societății Anonime Române de Navigație pe Dunăre (S.R.D.)
• 1914 iunie: Marmorosch Blank intră în consorțiul fondator al S.R.D. alături de Banca Agricolă, Banca Comercială Română, Banca Generală Română, Banca de Scont București, Banca de Credit Român, Banca Comerțului, Firma Fratelli Bach, Firma G. Fernic

CONFRAȚII:

Crissoveloni cât şi Marmorosch Blank „nu au sedii foarte cunoscute în Galaţi, deşi au fost cu adevărat importante” (Sandel vol VII) — discreția aristocratică a finanțatorilor.

SOARTA — 1948:

Banca Marmorosch Blank & Co. a fost NAȚIONALIZATĂ la 11 iunie 1948 odată cu toate marile bănci private ale României. Sediile din Galați au trecut în proprietatea Băncii Naționale a României, apoi unele clădiri au fost demolate, altele transformate.

Maurice Blank moare în 1929 — un eveniment care a marcat începutul declinului băncii (împreună cu marea criză economică 1929-1933).

Surse: Sandel Dumitru vol VI + VII; Statutele S.R.D., Cartea Românească București 1927.""",
    },

    # ─── 13. BUSTUL GHEORGHIU-DEJ ───
    {
        "title": "Bustul lui Gheorghe Gheorghiu-Dej (dărâmat 22 decembrie 1989)",
        "lat": 45.4321,
        "lon": 28.0394,
        "location": "Esplanada Casei de Cultură a Sindicatelor (str. Brăilei nr. 134)",
        "category": "Monumente",
        "year_built": 1971,
        "year_demolished": 1989,
        "status": "demolished",
        "article": "../assets/articles/bust-gheorghiu-dej-galati/index.html",
        "excerpt": "Bustul liderului comunist Gheorghe Gheorghiu-Dej (n. 8 noiembrie 1901, Bârlad — d. 19 martie 1965, București), pus pe esplanada Casei de Cultură a Sindicatelor la 1971. Dărâmat de mulțime în noaptea de 22 decembrie 1989, în timpul Revoluției — moment-cheie al evenimentelor revoluționare gălățene.",
        "description": """Bustul lui Gheorghe Gheorghiu-Dej de pe esplanada Casei de Cultură a Sindicatelor din Galați a fost una dintre cele mai vizibile statui comuniste ale orașului — și unul dintre primele monumente dărâmate în timpul Revoluției din 1989.

PERSONAJUL — GHEORGHE GHEORGHIU-DEJ:

• Născut: 8 noiembrie 1901 la Bârlad
• Decedat: 19 martie 1965 la București
• Pe la 1912, tânărul Gheorghe Gheorghiu lucra ca HAMAL ÎN PORTUL GALAȚI (legătura cu orașul!)
• A trecut apoi prin atelierele CFR și prin greva de la Grivița (1933)
• Lider comunist român 1944-1965, prim-secretar al PMR/PCR
• Inițiatorul Decretului 218 (1948) și al represiunilor staliniste românești

POZIȚIONAREA — CASA DE CULTURĂ:

Bustul a fost ridicat în 1971 — la moartea lui Dej (1965) plus reabilitarea sa parțială în primii ani ai regimului Ceaușescu. Era amplasat pe ESPLANADA Casei de Cultură a Sindicatelor (inaugurată 4 octombrie 1969, str. Brăilei nr. 134) — clădire închinată inițial chiar lui Gheorghiu-Dej.

Bustul era o lucrare în bronz pe soclu de granit, probabil ~3 metri înălțime cu tot cu soclu. Era PUNCT OBLIGATORIU al excursiilor școlare și al manifestațiilor oficiale (1 mai, 23 august, 30 decembrie etc.).

DĂRÂMAREA — 22 DECEMBRIE 1989:

În noaptea de 22 decembrie 1989, după ce Nicolae și Elena Ceaușescu au fugit cu elicopterul de pe acoperișul CC al PCR la București, valul revoluționar a ajuns și la Galați. Mulțimea s-a adunat pe esplanada Casei de Cultură. Bustul lui Gheorghiu-Dej a fost dărâmat cu funii și lanțuri — un moment simbolic capturat în mărturii orale.

Statuia a fost lăsată într-o uzină timp de câteva zile, apoi topită sau aruncată — soarta exactă rămâne neclară. Soclul a fost demolat în 1990.

Casa de Cultură a Sindicatelor a fost redenumită pur și simplu „Casa de Cultură” după 1990.

CONTEXT — RUTĂ PUB CRAWL:

Cheatsheet-ul tururilor Heritage Galați menționează acest moment în Etapa 1 a Pub Crawl Cultural (loc lângă loc-105 Casa de Cultură): „Pe esplanadă, între 1971-1989, era bustul lui Dej — dărâmat de mulțime pe 22 decembrie 1989.”

Surse: Sandel Dumitru vol VII; Pub Crawl cheatsheet (Surse/); mărturii orale ale revoluționarilor gălățeni.""",
    },

    # ─── 14. VILA ELISA STOICOVICI ───
    {
        "title": "Vila Elisa Stoicovici (10.000 mp grădină stil Versailles)",
        "lat": 45.4365,
        "lon": 28.0530,
        "location": "Str. Mihai Bravu — azi sala de repetiții Teatrul N. Leonard",
        "category": "Case istorice",
        "year_built": 1880,
        "year_demolished": 1990,
        "status": "demolished",
        "article": "../assets/articles/vila-elisa-stoicovici-galati/index.html",
        "excerpt": "Una dintre cele mai impresionante reședințe ale Galațiului interbelic — proprietatea negustorului Ioan Stoicovici (fiul lui Vasile Stoicovici 1818-1885). Grădină de 10.000 mp comparată cu Versailles. Donjon octogonal cu acoperiș de dom. Naționalizată 1950, transformată în Sala de Repetiții Teatru N. Leonard.",
        "description": """Vila Elisa de pe str. Mihai Bravu a fost una dintre cele mai sofisticate reședințe ale Galațiului — un veritabil mic Versailles la malul Dunării.

PROPRIETARUL — IOAN STOICOVICI:

Ioan Stoicovici (fiul lui Vasile Stoicovici, mare negustor 1818-1885) a fost o figură cosmopolită a Galațiului interbelic:
• Mulți ani președintele Consiliului de Administrație al Societății Anonime Brutăria Mecanică din Galați
• 1912: primul director al sucursalei din Galați a BĂNCII ROMÂNEȘTI (înființată în acel an)
• Membru al Camerei de Comerț din Galați, ulterior președintele acesteia

Numele „Elisa” vine de la SOȚIA SA — Elisa Constantin, fiica unui bogat agricultor.

GRĂDINA — 10.000 MP STIL VERSAILLES:

Atracția principală a Vilei Elisa era IMENSA GRĂDINĂ care împrejmuia imobilul — „amintea de celebrele grădini de la Palatul Versailles”, scria un ziar local la 1902.

Conform mărturiilor din epocă:
• 10.000 metri pătrați amenajați minuțios
• „Fiecare metru pătrat din cei 10.000 ai grădinii se afla în armonie cu restul spațiului”
• „Rar se poate găsi în țară o grădină egală cu a lui Ioan Stoicovici” (ziar local, 1902)
• Cărți poștale ilustrate erau tipărite cu imaginea grădinii și trimise în țară

ARHITECTURA VILEI:

• Corp central cu intrare monumentală în pridvor deschis
• Pridvor cu acoperiș sprijinit pe COLOANE DE ZIDĂRIE
• ATIC decorativ deasupra (etaj scund sub acoperiș)
• Fațadă cu ELEMENTE BOSATE imitând pilaștri și boluri
• DONJON ALIPIT PE PARTEA DE NORD — formă octogonală, acoperiș tip dom, depășea mult înălțimea casei

Donjonul îi dădea Vilei Elisa un aer de castel medieval bavarez/scoțian — neobișnuit pentru arhitectura Galațiului.

SOARTA:

• 1950: naționalizată de regimul comunist
• Post-naționalizare: vila a fost transformată în SALĂ DE REPETIȚII A TEATRULUI „N. LEONARD” (denumirea oficială a teatrului gălățean post-comunist)
• Grădina cu 10.000 mp a fost parțial parcelată — au apărut clădiri noi în jur
• Astăzi: clădirea principală a fost demolată sau e într-un stadiu avansat de degradare; doar segmente ale fostei reședințe mai supraviețuiesc

Aurul familiei Stoicovici a fost între timp dispersat — vila supraviețuiește doar în fotografiile de epocă și în mențiunile lui Sandel Dumitru.

Surse: Sandel Dumitru vol IX (citat din Paul Păltănea „Negustori de odinioară: familia Vasile Stoicovici”, Acțiunea 1991-1993, și Nicolae Angelescu „Vasile Stoicovici și fiii săi 1818-1885”, București 1934).""",
    },

    # ─── 15. CAZARMELE DE INFANTERIE ───
    {
        "title": "Cazarmele de Infanterie din Galați (sfârșit sec. XIX)",
        "lat": 45.4292,
        "lon": 28.0395,
        "location": "Faleza Dunării — partea vestică a platoului orașului",
        "category": "Comerț istoric",
        "year_built": 1880,
        "year_demolished": 1980,
        "status": "demolished",
        "article": "../assets/articles/cazarmele-infanterie-galati/index.html",
        "excerpt": "Cazărmi militare ridicate la sfârșitul sec. XIX pe platoul Falezei Dunării, pe terenul cedat de edilii orașului. Au găzduit Regimentul 11 Siret. Demolate în anii 1960-1980 la sistematizarea Falezei comuniste.",
        "description": """Cazarmele de Infanterie de pe Faleza Dunării au fost una dintre cele mai mari edificări militare ale Galațiului epocii moderne — o garnizoană strategică pe malul fluviului.

EDIFICAREA — SFÂRȘIT SEC. XIX:

Mitrof (articolul Faleza Dunării, RDJ 214/2019, p. 14-18) menționează:

„Tot spre sfârșitul sec. al-XIX-lea, în partea vestică a platoului, pe malul Dunării, edilii orașului cedează teren pentru construirea cazărmilor de infanterie.”

Decizia se înscria în efortul de modernizare militară al României post-Independenței (1877) — fortificarea zonei de frontieră dunăreană contra unei eventuale agresiuni rusești sau austro-ungare.

UNITĂȚILE GĂZDUITE:

Cazarmele au găzduit, printre altele:
• REGIMENTUL 11 SIRET — unitatea militară emblematică a Galațiului
  • A participat la Războiul de Independență (1877-1878)
  • La Primul Război Mondial — pierderi mari în Mărășești
  • Mitrof menționează „un cadru militar de la Regimentul 11 Siret din Galați” într-o anecdotă tragică post-1918 (Hotel Bristol)
• Posibil și unități de geniu, transmisiuni, intendență

ARHITECTURĂ TIPICĂ:

Cazarmele militare românești de sfârșit de sec. XIX urmau modelul german/austriac — clădiri lungi, rectangulare, cu mai multe etaje, ferestre uniforme. Erau construite din cărămidă, cu ziduri groase. Aveau curte interioară pentru exerciții și un acaret pentru cai.

SOARTA:

• Primul Război Mondial: bombardamente bulgaro-otomane de pe malul opus al Dunării (din Dobrogea), care au afectat și cazarmele
• Interbelic: refacere și extindere
• 1944: bombardamente americane (6 iunie) și germane (24-25 august)
• 1948-1989: utilizate de Armata Română Populară
• 1967 ÎNAINTE — TALUZAREA FALEZEI: sistematizarea Falezei a presupus demolarea „clădirilor mici existente pe malul râpei (falezei)” — cazarmele au fost printre primele structuri eliminate
• 1980s: rest de structuri demolate odată cu Combinatul Siderurgic și industrialilizarea zonei

ASTĂZI:

Pe locul cazărmilor — blocuri rezidențiale moderniste (5-10 etaje) și amenajări parcuri/promenadă. Doar fotografiile de epocă mai amintesc de prezența militară de pe Falezei.

Surse: Mitrof 2017 + 2019 (Faleza Dunării, RDJ 214); Sandel Dumitru vol V.""",
    },

    # ─── 16. TIPOGRAFIA „BUCIUMUL ROMÂNESC” ───
    {
        "title": "Tipografia „Buciumul Românesc” (P.P. Stănescu)",
        "lat": 45.4360,
        "lon": 28.0556,
        "location": "Str. Domnească — prima casă pe dreapta ieșind din Piața Regală spre Parcul Municipal",
        "category": "Comerț istoric",
        "year_built": 1890,
        "year_demolished": 1944,
        "status": "demolished",
        "article": "../assets/articles/tipografia-buciumul-romanesc-galati/index.html",
        "excerpt": "Tipografia condusă de Petru P. Stănescu — unul dintre cele mai active centre editoriale ale Galațiului interbelic. Aici se tipăreau lucrările profesorului Moise N. Pacu (1901-1912). Prima casă pe Domnească ieșind din Piața Regală spre Parc. Distrusă 1944.",
        "description": """Tipografia „Buciumul Românesc” a fost una dintre cele mai active centre editoriale ale Galațiului epocii moderne — sursa principală a literaturii didactice și religioase locale.

PROPRIETARUL — PETRU P. STĂNESCU:

Petru P. Stănescu era unul dintre tipografii-imprimători importanți ai Galațiului. Tipografia sa funcționa sub denumirea „Buciumul Românesc” — nume cu rezonanță națională/patriotică (buciumul = instrument muzical tradițional românesc, simbol al unirii).

POZIȚIONAREA:

Sandel Dumitru vol VIII menționează explicit:

„Suntem pe strada Domnească la câțiva pași după ce am părăsit Piața Regală și ne îndreptăm spre Parcul Municipal. Prima casă pe dreapta imaginii era SEDIUL TIPOGRAFIEI BUCIUMUL ROMÂNESC, casă aparținând domnului Petru P. Stănescu.”

— deci poziția era pe prima clădire de pe Domnească, partea dreaptă, ieșind din Piața Regală spre nord (direcția Parc Municipal). Coordonatele aproximative: 45.4360, 28.0556.

LUCRĂRI EMBLEMATICE TIPĂRITE:

Tipografia a tipărit lucrările profesorului Moise N. Pacu (figură proeminentă a învățământului gălățean și a culturii române ortodoxe):

• 1901: „Elemente de morală creștină”
• 1902: „Manual de învățătură Evangelică” (Galați)
• 1903: „Elemente de instrucție civică, drept și economie politică”
• 1912: „Cuvântări diverse cu conținut religios-moral, didactic”

Iuliu Scriban îl descria pe Moise N. Pacu drept o personalitate culturală remarcabilă a epocii — figură pedagogică gălățeană.

ROLUL CULTURAL:

Pe lângă tipăriturile didactice și religioase, tipografia probabil edita și:
• Cărți poștale ilustrate (Galațiul era mare centru de cartofilie interbelică)
• Anuare comerciale
• Reglementări de tramvai și transport public
• Cataloage de prețuri pentru hotelurile + restaurantele Pieței Regale

CONTEXT — VECINĂTATEA:

Tipografia era practic la intersecția dintre Piața Regală (sud) și corso-ul gălățean (nord, spre Biserica Greacă) — unul dintre cele mai animate puncte ale orașului. Mușteriii pasivi care treceau pe Domnească aruncau o privire în vitrina cu noutățile editoriale ale săptămânii.

SOARTA:

Distrusă în noaptea de 24-25 august 1944 prin minarea germană, împreună cu toată zona Pieței Regale. Refacerea a fost împiedicată după 1947. Astăzi pe locul ei sunt blocuri postbelice.

Sursa: Sandel Dumitru vol VIII; Iuliu Scriban (citat pentru Moise N. Pacu).""",
    },
]


def main():
    data = json.loads(PATH.read_text(encoding="utf-8"))
    locs = data if isinstance(data, list) else data.get("locations", [])

    max_n = max(
        int(L["id"].split("-")[1])
        for L in locs
        if (L.get("id") or "").startswith("loc-")
    )
    next_n = max_n + 1

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
            "geocoded_as": "Adăugat din script (clădiri dispărute — research 2026-05-11)",
            "category": entry["category"],
            "excerpt": entry["excerpt"],
            "description": entry["description"],
            "status": entry.get("status", "demolished"),
            "year_built": entry.get("year_built"),
            "year_demolished": entry.get("year_demolished"),
            "article": entry["article"],
        }
        locs.append(full)
        added += 1
        print(f"  + {new_id}: {entry['title'][:60]}")

    if isinstance(data, list):
        data = locs
    else:
        data["locations"] = locs

    PATH.write_text(
        json.dumps(data, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )

    # Verify
    from collections import Counter
    ids = Counter(L["id"] for L in locs)
    arts = Counter(L.get("article") for L in locs if L.get("article"))
    dup_ids = [k for k, v in ids.items() if v > 1]
    dup_arts = [k for k, v in arts.items() if v > 1]
    print(f"\nAdded {added} locations. Total now: {len(locs)}")
    print(f"  Duplicate IDs: {dup_ids or 'none'}")
    print(f"  Duplicate articles: {dup_arts or 'none'}")


if __name__ == "__main__":
    main()
