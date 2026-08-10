// Heritage Galați — i18n dictionary RO + EN
// Limba implicită: ro. Toggle în topbar (drapele RO/UK).
// Toate string-urile UI sunt aici. Conținutul locațiilor rămâne în RO (Phase 2).
(function () {
  'use strict';

  const I18N = {
    ro: {
      // ──────── NAV / TOPBAR ────────
      'a11y.skip': 'Sari la conținut',
      'nav.map': 'Hartă',
      'nav.stories': 'Povești',
      'nav.lists': 'Liste',
      'nav.maps': 'Hărți',
      'nav.about': 'Despre',
      'nav.contribute': 'Contribuie',
      'nav.menu': 'Meniu',
      'tour.next': 'Următor',
      'tour.back': 'Înapoi',
      'tour.done': 'Am înțeles',
      'tour.step': '{i} / {n}',
      'tour.close': 'Închide ghidul',
      'lang.switch': 'Schimbă limba',
      'lang.romanian': 'Română',
      'lang.english': 'Engleză',

      // ──────── TIMELINE ────────
      'timeline.title': 'Cronologie · 1445 → 2026',
      'timeline.sub': 'trage cursorul pentru a vedea cum arăta orașul în orice an',
      'timeline.loupe.hint': 'trage degetul în sus pentru precizie',
      'timeline.loupe.fine': 'precizie fină — mișcă lateral pentru anul exact',
      'timeline.aria.label': 'Selectează anul pe cronologie',
      'timeline.aria.present': 'prezent — fără filtru de an',

      // ──────── SIDEBAR INTRO ────────
      'intro.kicker': 'Galați, port cosmopolit',
      'intro.title': 'Explorează orașul pe epoci, povești și trasee.',
      'intro.body': 'Alege un loc de pe hartă, filtrează clădirile dispărute sau pornește un tur. Timeline-ul arată ce exista în oraș în anul selectat.',

      // ──────── TABS ────────
      'tab.locations': 'Locații',
      'tab.tours': 'Tururi',
      'tab.hunts': 'Aventuri',
      'tab.locations.title': 'Toate obiectivele documentate',
      'tab.tours.title': 'Trasee tematice pe jos',
      'tab.hunts.title': 'Aventuri ghidate cu mistere',

      // ──────── SEARCH / FILTERS ────────
      'search.label': 'Caută',
      'search.placeholder': 'Caută un loc, o stradă, un articol…',
      'category.label': 'Categorie',
      'category.all': 'Toate categoriile',
      'filter.all': 'Toate',
      'filter.active': 'Existente',
      'filter.demolished': 'Dispărute',
      'results.count': 'din {total} obiective',
      'results.count.tour': '{n} opriri în tur',

      // ──────── LAYER BUBBLES ────────
      'layer.cartiere': 'Cartiere',
      'layer.cartiere.full': 'Afișează cartierele',
      'layer.historic': 'Hartă istorică',
      'layer.historic.full': 'Hartă istorică suprapusă',
      'layer.historic.timeout': 'Serviciul extern de hărți istorice (eHarta · geo-spatial.org) nu răspunde momentan. Încearcă din nou mai târziu.',
      'layer.fortif': 'Fortificații',
      'layer.fortif.full': 'Fortificații antice',
      'layer.judet': 'Granița',
      'layer.judet.full': 'Granița administrativă (timeline)',
      'layer.opacity': 'Opacitate:',
      'layer.zones': 'zone',

      // ──────── CATEGORII LOCAȚII ────────
      'cat.Case istorice': 'Case istorice',
      'cat.Clădiri Istorice': 'Clădiri istorice',
      'cat.Lăcașuri de cult': 'Lăcașuri de cult',
      'cat.Monumente': 'Monumente',
      'cat.Palate': 'Palate',
      'cat.Consulate': 'Consulate',
      'cat.Educație': 'Educație',
      'cat.Industrie': 'Industrie',
      'cat.Industrial / Tehnic': 'Industrial / tehnic',
      'cat.Comerț istoric': 'Comerț istoric',
      'cat.Alte locuri': 'Alte locuri',
      'cat.Natură și Agrement': 'Natură și agrement',
      'cat.Sate Istorice': 'Sate istorice',
      'cat.Spații verzi': 'Spații verzi',
      'cat.Monumente Comemorative': 'Monumente comemorative',

      // ──────── STATUS ────────
      'status.active': 'existentă',
      'status.demolished': 'dispărută',
      'status.lost': 'dispărută',
      'status.ruin': 'în ruină',

      // ──────── DETAIL PANEL ────────
      'detail.close': 'Închide',
      'detail.read': 'Citește mai mult',
      'detail.edit': '✎ Editează',
      'detail.gallery': 'Galerie',
      'detail.gallery.image': 'imagine',
      'detail.gallery.images': 'imagini',
      'detail.image.placeholder': 'fotografie nedisponibilă',
      'detail.hero.placeholder': 'fotografia acestui loc lipsește încă din arhivă',
      'detail.no_translation': '🇷🇴 Descrierea acestui obiectiv este disponibilă doar în română. Traducerea în engleză va fi adăugată într-o etapă viitoare.',
      'detail.no_translation.en': null,  // intentionally null in RO

      // ──────── HELP / TOOLTIPS ────────
      'help.fab': 'Reia ghidul (tooltip-uri)',
      'help.label': 'Reia ghidul',

      // ──────── PAGINI STATICE ────────
      'maps.eyebrow': 'Hărți și vederi · Galați 1540 – 1968',
      'maps.title': 'Galațiul în hărți și vederi aeriene',
      'maps.lead': 'O colecție de hărți istorice, planuri de oraș și vederi aeriene ale Galațiului, în ordine cronologică — de la atlasele renascentiste până la machetele de sistematizare comunistă.',
      'maps.loading': 'Se încarcă…',
      'maps.count': '{n} hărți și vederi · {from} – {to}',
      'maps.undated': 'Nedatat',
      'maps.empty': 'Nu există hărți de afișat.',
      'maps.lightbox': 'Imagine mărită',
      'maps.prev': 'Imaginea anterioară',
      'maps.next': 'Imaginea următoare',
      'maps.close': 'Închide',
      'page.about.eyebrow': 'Despre proiect',
      'page.about.title': 'Galațiul, palmă cu palmă.',
      'page.about.lead': 'Heritage Galați este o platformă cu obiective de patrimoniu, clădiri istorice, monumente și locuri de interes din municipiul Galați.',
      'page.about.sources.eyebrow': 'Surse',
      'page.about.sources.h2': 'Documentare',
      'page.about.sources.intro': 'Fiecare clădire are o descriere narativă, citate textuale din surse, fotografii (când există) și metadate structurate (an de construcție, status actual, perioadă).',
      'page.about.author.eyebrow': 'Autor',
      'page.about.author.h2': 'Realizat de',
      'page.about.disclaimer.eyebrow': 'Disclaimer',
      'page.about.disclaimer.h2': 'Despre conținut și drepturi',

      'page.stories.eyebrow': 'Povești · Galați',
      'page.stories.title': 'Povești care au scris orașul',

      'page.contribute.title': 'Patrimoniul nu se face singur.',
      'page.contribute.eyebrow': 'Contribuie',

      // ──────── LISTS PAGE ────────
      'lists.title': 'Pârcălabi, primari, populație, fabrici, consulate, școli și dezastre.',
      'lists.loading': 'Se încarcă…',
      'lists.section.parcalabi': 'Pârcălabi',
      'lists.section.primari': 'Primari',
      'lists.section.populatie': 'Populație',
      'lists.section.scoli': 'Școli / educație',
      'lists.section.spitale': 'Spitale / sănătate',
      'lists.section.consulate': 'Consulate',
      'lists.section.presa': 'Presă / tipografii',
      'lists.section.biserici': 'Lăcașuri de cult',
      'lists.section.port-transport': 'Port / transport',
      'lists.section.monumente': 'Monumente / spații publice',
      'lists.section.comunitati': 'Comunități',
      'lists.section.cultura': 'Teatru / cultură',
      'lists.section.case': 'Nr. case',
      'lists.section.cutremure': 'Cutremure',
      'lists.section.razboaie': 'Războaie / invazii',
      'lists.section.epidemii': 'Epidemii',
      'lists.section.incendii': 'Incendii',
      'lists.section.inundatii': 'Inundații',
      'lists.section.fabrici': 'Fabrici / uzine',
      'lists.toc.title': 'Categorii',
      // Section descriptions (visible when a list is expanded)
      'lists.desc.parcalabi': 'Reprezentanții domnești care administrau ținutul Covurlui din scaunul de la Galați. Funcția — moștenită din evul mediu moldovenesc — combina autoritatea militară, judiciară și fiscală peste port și ținut, până când reformele moderne (1832-1864) au desființat-o, înlocuind-o cu prefectul și primarul.',
      'lists.desc.primari': 'Primii aleși și aleșii Galațiului din 1864 — anul Legii comunale a lui Cuza — până astăzi. Lista arată cum s-a alternat conducerea liberală cu cea conservatoare în Belle Époque, cum a fost suspendată în regimul carlist și legionar, transformată în comitet executiv comunist după 1948 și redevenită funcție electivă din 1990.',
      'lists.desc.populatie': 'Numărul de locuitori ai Galațiului prin secole — de la târgul pescăresc moldovean de câteva mii de suflete, la portul liber cosmopolit de 80.000 din Belle Époque, la orașul industrial de peste 300.000 în comunism, până la declinul demografic post-1989. Fiecare cifră este o oglindă a momentului: pace sau război, port liber sau vamă, prosperitate sau exod.',
      'lists.desc.scoli': 'De la prima școală domnească din Metoc (sec. XVIII), la rețeaua complexă de școli confesionale ale comunităților (greci, evrei, germani, armeni, italieni, lipoveni), la liceele clasice ale Belle Époque-ului — „Vasile Alecsandri", „Costache Negri", Notre Dame de Sion — și până la sistematizarea învățământului în era comunistă. Educația a fost dintotdeauna mizele cele mai mari ale Galațiului cosmopolit.',
      'lists.desc.spitale': 'Sistemul medical al unui port care a fost dintotdeauna prima poartă de intrare a epidemiilor pe Dunăre — ciumă, holeră, tifos. Primele spitale (Sf. Spiridon, Israelit, Militar), farmaciile epocii (Ținc, Helder, Reichmann), igiena publică, vaccinarea modernă și marile așezăminte ale secolului XX, până la Spitalul Județean.',
      'lists.desc.consulate': 'În 1837, când a fost declarat port liber, Galațiul a devenit oraș cu cea mai densă rețea consulară din Principate — peste 20 de state aveau aici reprezentanți. Comisia Europeană a Dunării (CED, 1856-1948), prima organizație supranațională europeană, a avut sediul aici. Lista urmărește această rețea diplomatică unică, marca portului cosmopolit.',
      'lists.desc.presa': 'Presa gălățeană a oglindit pulsul unui port liber: ziare politice de toate culorile (Vocea Galaților, Acțiunea, Curierul), reviste culturale (Dunărea de Jos), buletine comerciale și gazete în limbile comunităților (grecești, evreiești, italiene). Tipografiile locale au scos de la cărți școlare la cărți de literatură interbelică.',
      'lists.desc.biserici': 'Galațiul a fost unul dintre cele mai multi-confesionale orașe ale României: biserici ortodoxe moldovenești (Sf. Precista, Mavromol, Sf. Nicolae), greci, lipoveni, armeni, catolici, anglicani, evanghelici, plus 23 de sinagogi în interbelic. Fiecare comunitate avea în jurul lăcașului propria școală, propriul spital și cimitir — adevărate cartiere identitare.',
      'lists.desc.port-transport': 'Galațiul a trăit prin Dunăre. Cronologia infrastructurii care a dus portul de la caice și șlepuri la cargouri internaționale: vapoare cu aburi, șantiere navale, telegraf, calea ferată Galați-București (1872), tramvaiul cu cai (1893) și apoi electric, șoseaua de centură, aeroportul 1920-1958 și marea modernizare portuară din anii \'60-\'70.',
      'lists.desc.monumente': 'Galațiul a construit, a dărâmat și a reconstruit ritualic spațiile sale publice. Piața Regală (distrusă 1944, niciodată reconstruită), Grădina Publică, Faleza Dunării, palatele primăriei și prefecturii, statuile lui Eminescu, Cuza, Costache Negri — fiecare epocă a pus și a scos monumente, lăsând straturi de memorie urbană suprapuse.',
      'lists.desc.comunitati': 'Greci, evrei, armeni, italieni, germani, bulgari, lipoveni, francezi, englezi — Galațiul a fost timp de un secol cel mai cosmopolit oraș al României. Fiecare comunitate a lăsat instituții (școli, spitale, cimitire), profesii (negustori, marinari, meșteșugari, bancheri) și uneori și răni — pogromuri, evacuări, naționalizări. Lista urmărește această țesătură umană.',
      'lists.desc.cultura': 'Trupele itinerante grecești și italiene ale secolului XIX, teatrele Papadopol și Nationale, marile turnee ale lui Caragiale și Vlahuță, prima trupă permanentă (Fani Tardini), Teatrul Dramatic de astăzi — și viața culturală secundară care le-a hrănit: cenacluri, cafenele, librării, conferințe publice.',
      'lists.desc.case': 'Câte case avea Galațiul prin secole. De la sub o mie de gospodării în târgul moldovean al secolului XVIII, la cele câteva mii de la mijlocul XIX, la zecile de mii de locuințe ale orașului interbelic, până la blocurile masive Țiglina și Micro construite pentru a primi muncitorii de la Combinat. Fiecare salt arată o schimbare radicală a orașului.',
      'lists.desc.cutremure': 'Galațiul stă în zona de propagare a Vrancei, una dintre cele mai active falii din Europa. Marile seisme — 1738, 1802, 1940, 1977, 1990 — au remodelat orașul de fiecare dată: clădiri prăbușite, ziduri crăpate, ocazii pentru sistematizări urbane. Cronologia cutremurelor este și cronologia reconstrucțiilor.',
      'lists.desc.razboaie': 'Ca port la frontiera dintre imperii (otoman, rus, austriac), Galațiul a fost cucerit, asediat și incendiat repetat — în războaiele ruso-turce (1769, 1789, 1828), în Eteria 1821, în Primul Război Mondial (Bătălia de la Galați 1918), iar în 1944 armata germană în retragere a aruncat în aer Piața Regală și o parte mare a centrului.',
      'lists.desc.epidemii': 'Ca port internațional, Galațiul a fost prima poartă a marilor epidemii pe Dunăre: ciuma orientală (1652, 1729-1739, 1758), holera importată din Rusia (1830, 1873, 1893), tifosul soldaților în Primul Război Mondial, gripa spaniolă 1918-1920 și apoi pandemia COVID-19. Fiecare a impus carantine, lazaretsuri și schimbări în igiena publică.',
      'lists.desc.incendii': 'Oraș construit secole întregi din lemn, Galațiul a ars de zeci de ori. Marile incendii — 1789 (războiul ruso-turc), 1821 (Eteria), 1851 (centrul comercial), 1908 (Teatrul Papadopol) — au șters cartiere întregi și au împins primăria să adopte regulamente moderne de construcție, paveaj și apărare împotriva focului.',
      'lists.desc.inundatii': 'Orașul de la confluența celor trei mari ape — Dunărea, Siretul și Prutul — a fost periodic inundat de viiturile lor. Marile ape din 1837, 1897, 1932, 1970, 2005, 2010 au inundat zonele joase (Bădălan, Faleza Inferioară, lunca Siretului), au impus construcția digurilor și a stației de pompare și au remodelat cartiere întregi.',
      'lists.desc.fabrici': 'Galațiul a fost a doua mare platformă industrială a României, după București. De la primele mori de aburi și șantiere navale din Belle Époque (Fernic, Năvodul, Atlantic), la marile naționalizări din 1948, la mamutul siderurgic construit din temelii în 1966 (Combinatul, primii 12.000 muncitori), până la dezindustrializarea anilor \'90-2000 — fiecare epocă a lăsat coșuri și hale.',
      // Lists table headers (used by all the renderTable calls)
      'lists.col.year': 'An',
      'lists.col.year_term': 'An / mandat',
      'lists.col.name': 'Nume',
      'lists.col.term': 'Mandat',
      'lists.col.profession_party': 'Profesie / Partid',
      'lists.col.population': 'Locuitori',
      'lists.col.source': 'Sursă',
      'lists.col.houses': 'Case',
      'lists.col.context': 'Context',
      'lists.col.attestation': 'Atestare',
      'lists.col.unit.inhabitants': 'loc.',
      'lists.col.unit.houses': 'case',
      'lists.empty': 'Nimic în această listă.',
      'lists.meta': '{years} ani documentați · {entries} înregistrări extrase pe {sections} liste',

      // ──────── TOURS / HUNTS ────────
      'tours.intro': 'Tururi gândite pentru o singură poveste, parcurse pe jos. Click pe un tur ca să-l urmărești pe hartă.',
      'tours.duration': 'durată',
      'tours.stops': 'opriri',
      'tours.minutes': 'min',
      'tours.km': 'km',
      'tours.exit': 'Ieși din tur',
      'hunts.intro': 'Aventuri narative cu ghicitori și descoperiri. Activează un hunt și urmărește indicii pe hartă.',
      'hunts.start': 'Pornește aventura',
      'hunts.exit': 'Ieși din aventură',
      'hunts.reset': 'Resetează',
      'hunts.solved': 'rezolvat',
      'hunts.checkpoint': 'punct',
      'hunts.checkpoints': 'puncte',

      // ──────── MISC ────────
      'common.year': 'anul',
      'common.built': 'construit',
      'common.demolished': 'demolat',
      'common.source': 'sursa',
      'common.sources': 'surse',
      'common.address': 'adresa',
      'common.close': 'Închide',
      'common.open_map': 'Deschide pe hartă',
      'common.share': 'Distribuie',
      'common.loading': 'Se încarcă…',
      'common.error': 'A apărut o eroare',
      'common.back_to_map': 'Înapoi la hartă',

      // ──────── BATTLE OF GALAȚI 1918 PAGE ────────
      'battle1918.page_title': 'Bătălia de la Galați 1918 · animație top view',
      'battle1918.back': 'Înapoi la hartă',
      'battle1918.embed_intro': 'Pentru inserare în alt front-end: include',
      'battle1918.embed_and_use': 'și folosește',
      'battle1918.embed_iframe': 'Alternativ, pagina aceasta poate fi introdusă direct într-un iframe.',

      // ──────── PIAȚA REGALĂ AR PAGE ────────
      'ar.crumb': 'Heritage Galați · Pilot AR',
      'ar.back_full': '← Înapoi la hartă',
      'ar.splash_title': '🥽 Piața Regală — Așa cum a fost',
      'ar.splash_lede': 'Reconstrucție în Realitate Augmentată a celor 5 clădiri-pilot din Piața Regală a Galațiului (1880-1944), distrusă de armata germană în noaptea de 24-25 august 1944 și niciodată reconstruită.',
      'ar.btn_ar': '📱 Pornește experiența AR',
      'ar.btn_walk': '🚶‍♂️ Modul „Tur virtual" (fără AR)',
      'ar.how_title': 'Cum funcționează AR-ul:',
      'ar.how_body': 'Mergi fizic în zona Bălcescu × Brăilei (centrul actual al fostei piețe). Permite accesul la cameră + locație, apoi îndreaptă telefonul spre clădirile cu poveste. Vei vedea fotografiile istorice „plutind" peste imaginea camerei, ancorate la coordonatele unde au fost cândva.',
      'ar.requirements': 'Cerințe: telefon cu Android sau iOS, browser modern (Chrome/Safari), HTTPS, permisiuni cameră + locație.',
      'ar.compat': 'Pentru desktop sau dacă AR nu pornește, alege „Tur virtual" — vezi galeria de clădiri pe ecranul tău.',
      'ar.walk_title': '🚶‍♂️ Tur virtual al Pieței Regale',
      'ar.walk_lede': 'Cele 5 clădiri-emblemă ale fostei piețe, cu povestea fiecăreia. Click pe un card pentru detalii.',
      'ar.badge_label': '🥽 AR · Piața Regală 1908',
      'ar.gps_wait': 'aștept...',
      'ar.compass_label': 'Compas',
      'ar.loader': 'Pornesc AR-ul…',
      'ar.error_title': 'Eroare',
      'ar.error_msg': 'Ceva nu a mers bine.',
      'ar.retry': 'Reîncearcă',
      'ar.back': '← Înapoi',
    },
    en: {
      // ──────── NAV / TOPBAR ────────
      'a11y.skip': 'Skip to content',
      'nav.map': 'Map',
      'nav.stories': 'Stories',
      'nav.lists': 'Lists',
      'nav.maps': 'Maps',
      'nav.about': 'About',
      'nav.contribute': 'Contribute',
      'nav.menu': 'Menu',
      'tour.next': 'Next',
      'tour.back': 'Back',
      'tour.done': 'Got it',
      'tour.step': '{i} / {n}',
      'tour.close': 'Close guide',
      'lang.switch': 'Switch language',
      'lang.romanian': 'Romanian',
      'lang.english': 'English',

      // ──────── TIMELINE ────────
      'timeline.title': 'Chronology · 1445 → 2026',
      'timeline.sub': 'drag the slider to see how the city looked in any given year',
      'timeline.loupe.hint': 'slide your finger up for precision',
      'timeline.loupe.fine': 'fine precision — move sideways to pick the exact year',
      'timeline.aria.label': 'Select the year on the chronology',
      'timeline.aria.present': 'present — no year filter',

      // ──────── SIDEBAR INTRO ────────
      'intro.kicker': 'Galați, cosmopolitan Danube port',
      'intro.title': 'Explore the city by eras, stories and routes.',
      'intro.body': 'Pick a place on the map, filter for lost buildings, or take a themed walk. The timeline shows what stood in the city at any chosen year.',

      // ──────── TABS ────────
      'tab.locations': 'Sites',
      'tab.tours': 'Tours',
      'tab.hunts': 'Adventures',
      'tab.locations.title': 'All documented heritage sites',
      'tab.tours.title': 'Themed walking routes',
      'tab.hunts.title': 'Guided GPS adventures with mysteries',

      // ──────── SEARCH / FILTERS ────────
      'search.label': 'Search',
      'search.placeholder': 'Search a place, street, or article…',
      'category.label': 'Category',
      'category.all': 'All categories',
      'filter.all': 'All',
      'filter.active': 'Standing',
      'filter.demolished': 'Lost',
      'results.count': 'of {total} sites',
      'results.count.tour': '{n} tour stops',

      // ──────── LAYER BUBBLES ────────
      'layer.cartiere': 'Districts',
      'layer.cartiere.full': 'Show city districts',
      'layer.historic': 'Historic map',
      'layer.historic.full': 'Overlay historic map',
      'layer.historic.timeout': 'The external historic-map service (eHarta · geo-spatial.org) is not responding right now. Please try again later.',
      'layer.fortif': 'Fortifications',
      'layer.fortif.full': 'Ancient fortifications',
      'layer.judet': 'Boundary',
      'layer.judet.full': 'County boundary (timeline)',
      'layer.opacity': 'Opacity:',
      'layer.zones': 'zones',

      // ──────── CATEGORII ────────
      'cat.Case istorice': 'Historic houses',
      'cat.Clădiri Istorice': 'Historic buildings',
      'cat.Lăcașuri de cult': 'Religious sites',
      'cat.Monumente': 'Monuments',
      'cat.Palate': 'Palaces',
      'cat.Consulate': 'Consulates',
      'cat.Educație': 'Education',
      'cat.Industrie': 'Industry',
      'cat.Industrial / Tehnic': 'Industrial / technical',
      'cat.Comerț istoric': 'Historic commerce',
      'cat.Alte locuri': 'Other places',
      'cat.Natură și Agrement': 'Nature & leisure',
      'cat.Sate Istorice': 'Historic villages',
      'cat.Spații verzi': 'Green spaces',
      'cat.Monumente Comemorative': 'Commemorative monuments',

      // ──────── STATUS ────────
      'status.active': 'standing',
      'status.demolished': 'lost',
      'status.lost': 'lost',
      'status.ruin': 'in ruin',

      // ──────── DETAIL PANEL ────────
      'detail.close': 'Close',
      'detail.read': 'Read more',
      'detail.edit': '✎ Edit',
      'detail.gallery': 'Gallery',
      'detail.gallery.image': 'image',
      'detail.gallery.images': 'images',
      'detail.image.placeholder': 'photo unavailable',
      'detail.hero.placeholder': 'no photo of this place yet in our archive',
      'detail.no_translation': '🇷🇴 This site’s description is currently available only in Romanian. An English translation will be added in a future stage.',

      // ──────── HELP / TOOLTIPS ────────
      'help.fab': 'Reopen the guide (tooltips)',
      'help.label': 'Reopen guide',

      // ──────── PAGINI STATICE ────────
      'maps.eyebrow': 'Maps & views · Galați 1540 – 1968',
      'maps.title': 'Galați in maps and aerial views',
      'maps.lead': 'A chronological collection of historical maps, city plans and aerial views of Galați — from Renaissance atlases to the communist-era urban-planning models.',
      'maps.loading': 'Loading…',
      'maps.count': '{n} maps & views · {from} – {to}',
      'maps.undated': 'Undated',
      'maps.empty': 'No maps to display.',
      'maps.lightbox': 'Enlarged image',
      'maps.prev': 'Previous image',
      'maps.next': 'Next image',
      'maps.close': 'Close',
      'page.about.eyebrow': 'About the project',
      'page.about.title': 'Galați, palm by palm.',
      'page.about.lead': 'Heritage Galați is an interactive map of heritage sites, historic buildings, monuments and places of interest from the city of Galați, Romania.',
      'page.about.sources.eyebrow': 'Sources',
      'page.about.sources.h2': 'Documentation',
      'page.about.sources.intro': 'Each building has a narrative description, textual citations from sources, photographs (when available) and structured metadata (year built, current status, period).',
      'page.about.author.eyebrow': 'Author',
      'page.about.author.h2': 'Made by',
      'page.about.disclaimer.eyebrow': 'Disclaimer',
      'page.about.disclaimer.h2': 'On content and rights',

      'page.stories.eyebrow': 'Stories · Galați',
      'page.stories.title': 'Stories that shaped the city',

      'page.contribute.title': 'Heritage doesn’t make itself.',
      'page.contribute.eyebrow': 'Contribute',

      // ──────── LISTS PAGE ────────
      'lists.title': 'County governors, mayors, population, factories, consulates, schools and disasters.',
      'lists.loading': 'Loading…',
      'lists.section.parcalabi': 'County governors',
      'lists.section.primari': 'Mayors',
      'lists.section.populatie': 'Population',
      'lists.section.scoli': 'Schools / education',
      'lists.section.spitale': 'Hospitals / health',
      'lists.section.consulate': 'Consulates',
      'lists.section.presa': 'Press / printing',
      'lists.section.biserici': 'Religious sites',
      'lists.section.port-transport': 'Port / transport',
      'lists.section.monumente': 'Monuments / public spaces',
      'lists.section.comunitati': 'Communities',
      'lists.section.cultura': 'Theatre / culture',
      'lists.section.case': 'Number of houses',
      'lists.section.cutremure': 'Earthquakes',
      'lists.section.razboaie': 'Wars / invasions',
      'lists.section.epidemii': 'Epidemics',
      'lists.section.incendii': 'Fires',
      'lists.section.inundatii': 'Floods',
      'lists.section.fabrici': 'Factories / industrial',
      'lists.toc.title': 'Categories',
      // Section descriptions
      'lists.desc.parcalabi': 'The princely representatives who administered the Covurlui region from the seat of Galați. The function — inherited from the medieval Moldavian period — combined military, judicial and fiscal authority over the port and the region, until modern reforms (1832-1864) abolished it, replacing it with the prefect and the mayor.',
      'lists.desc.primari': "Galați's first elected officials, from 1864 — the year of Cuza's Communal Law — to the present. The list shows how Liberal and Conservative leadership alternated during the Belle Époque, was suspended under the Carlist and Iron Guard regimes, became a communist executive committee after 1948, and returned to elected office in 1990.",
      'lists.desc.populatie': "The number of inhabitants of Galați through the centuries — from a Moldavian fishing market of a few thousand souls, to the cosmopolitan free port of 80,000 of the Belle Époque, to the industrial city of over 300,000 under communism, to the post-1989 demographic decline. Each number is a mirror of its moment: peace or war, free port or customs, prosperity or exodus.",
      'lists.desc.scoli': 'From the first princely school at Metoc (18th century), to the complex network of confessional schools of the communities (Greek, Jewish, German, Armenian, Italian, Lipovan), to the classic Belle Époque high schools — "Vasile Alecsandri", "Costache Negri", Notre Dame de Sion — and on to the standardisation of education in the communist era. Education has always been one of the great stakes of cosmopolitan Galați.',
      'lists.desc.spitale': 'The medical system of a port that has always been the first gate of entry for epidemics on the Danube — plague, cholera, typhus. The first hospitals (St. Spyridon, Israelite, Military), the great pharmacies of the era (Ținc, Helder, Reichmann), public hygiene, modern vaccination, and the great institutions of the 20th century, all the way to the County Hospital.',
      'lists.desc.consulate': 'In 1837, when it was declared a free port, Galați became the city with the densest consular network in the Principalities — over 20 states had representatives here. The European Commission of the Danube (CED, 1856-1948), the first supranational European organisation, was headquartered here. The list traces this unique diplomatic network, the hallmark of the cosmopolitan port.',
      'lists.desc.presa': 'The Galați press mirrored the pulse of a free port: political newspapers of every stripe (Vocea Galaților, Acțiunea, Curierul), cultural magazines (Dunărea de Jos), commercial bulletins and gazettes in the languages of the communities (Greek, Hebrew, Italian). The local printing presses produced everything from school books to interwar literature.',
      'lists.desc.biserici': 'Galați was one of the most multi-confessional cities in Romania: Moldavian Orthodox churches (St. Precista, Mavromol, St. Nicholas), Greek, Lipovan, Armenian, Catholic, Anglican, Evangelical, plus 23 synagogues in the interwar period. Each community had its own school, hospital and cemetery around its place of worship — true identity neighbourhoods.',
      'lists.desc.port-transport': "Galați lived through the Danube. The chronology of the infrastructure that took the port from caiques and barges to international cargo ships: steamships, shipyards, the telegraph, the Galați-Bucharest railway (1872), the horse-drawn tram (1893) and then the electric one, the bypass road, the airport (1920-1958) and the great port modernisation of the 1960s-'70s.",
      'lists.desc.monumente': 'Galați has built, torn down and ritually rebuilt its public spaces. The Royal Square (destroyed in 1944, never rebuilt), the Public Garden, the Danube Promenade, the City Hall and Prefecture palaces, the statues of Eminescu, Cuza, Costache Negri — each era erected and removed monuments, leaving layers of overlapping urban memory.',
      'lists.desc.comunitati': 'Greeks, Jews, Armenians, Italians, Germans, Bulgarians, Lipovans, French, English — for a century Galați was the most cosmopolitan city in Romania. Each community left institutions (schools, hospitals, cemeteries), professions (merchants, sailors, craftsmen, bankers) and sometimes wounds — pogroms, evacuations, nationalisations. The list traces this human fabric.',
      'lists.desc.cultura': 'The itinerant Greek and Italian troupes of the 19th century, the Papadopol and National theatres, the great tours of Caragiale and Vlahuță, the first permanent troupe (Fani Tardini), the Dramatic Theatre of today — and the secondary cultural life that fed them: literary circles, cafés, bookshops, public lectures.',
      'lists.desc.case': 'How many houses Galați had through the centuries. From under a thousand households in the 18th-century Moldavian market town, to a few thousand at the mid-19th century, to the tens of thousands of dwellings of the interwar city, to the massive Țiglina and Micro blocks built to house the Combine workers. Each leap shows a radical change in the city.',
      'lists.desc.cutremure': "Galați lies in the propagation zone of the Vrancea seismic source, one of the most active faults in Europe. The major earthquakes — 1738, 1802, 1940, 1977, 1990 — reshaped the city every time: collapsed buildings, cracked walls, and opportunities for urban systematisation. The chronology of earthquakes is also the chronology of reconstructions.",
      'lists.desc.razboaie': 'As a port at the frontier between empires (Ottoman, Russian, Austrian), Galați was repeatedly conquered, besieged and burned — in the Russo-Turkish wars (1769, 1789, 1828), in the 1821 Heterist uprising, in the First World War (Battle of Galați 1918), and in 1944 the retreating German army blew up the Royal Square and a large part of the centre.',
      'lists.desc.epidemii': 'As an international port, Galați was the first gate of the great Danubian epidemics: oriental plague (1652, 1729-1739, 1758), cholera imported from Russia (1830, 1873, 1893), soldiers\' typhus in the First World War, the 1918-1920 Spanish flu, and then the COVID-19 pandemic. Each one imposed quarantines, lazaretsuri and changes in public hygiene.',
      'lists.desc.incendii': "Built for centuries entirely of wood, Galați burned down dozens of times. The great fires — 1789 (Russo-Turkish war), 1821 (Heterist uprising), 1851 (the commercial centre), 1908 (Papadopol Theatre) — wiped out whole neighbourhoods and pushed the city hall to adopt modern regulations on construction, paving and fire defence.",
      'lists.desc.inundatii': "The city at the confluence of three great waters — the Danube, the Siret and the Prut — was periodically flooded by their surges. The major floods of 1837, 1897, 1932, 1970, 2005, 2010 inundated the low-lying areas (Bădălan, Lower Promenade, Siret floodplain), forced the construction of dikes and pumping stations, and reshaped entire neighbourhoods.",
      'lists.desc.fabrici': "Galați was Romania's second largest industrial platform, after Bucharest. From the first steam mills and Belle Époque shipyards (Fernic, Năvodul, Atlantic), to the great nationalisations of 1948, to the steel mammoth built from scratch in 1966 (the Combine, with its first 12,000 workers), to the deindustrialisation of the 1990s-2000s — every era left chimneys and halls.",
      // Lists table headers
      'lists.col.year': 'Year',
      'lists.col.year_term': 'Year / term',
      'lists.col.name': 'Name',
      'lists.col.term': 'Term',
      'lists.col.profession_party': 'Profession / Party',
      'lists.col.population': 'Inhabitants',
      'lists.col.source': 'Source',
      'lists.col.houses': 'Houses',
      'lists.col.context': 'Context',
      'lists.col.attestation': 'Attestation',
      'lists.col.unit.inhabitants': 'inh.',
      'lists.col.unit.houses': 'houses',
      'lists.empty': 'Nothing in this list.',
      'lists.meta': '{years} documented years · {entries} records extracted across {sections} lists',

      // ──────── TOURS / HUNTS ────────
      'tours.intro': 'Tours built around a single story, walked on foot. Click a tour to follow it on the map.',
      'tours.duration': 'duration',
      'tours.stops': 'stops',
      'tours.minutes': 'min',
      'tours.km': 'km',
      'tours.exit': 'Exit tour',
      'hunts.intro': 'Narrative adventures with riddles and discoveries. Start a hunt and follow clues on the map.',
      'hunts.start': 'Start adventure',
      'hunts.exit': 'Exit adventure',
      'hunts.reset': 'Reset',
      'hunts.solved': 'solved',
      'hunts.checkpoint': 'checkpoint',
      'hunts.checkpoints': 'checkpoints',

      // ──────── MISC ────────
      'common.year': 'year',
      'common.built': 'built',
      'common.demolished': 'demolished',
      'common.source': 'source',
      'common.sources': 'sources',
      'common.address': 'address',
      'common.close': 'Close',
      'common.open_map': 'Open on map',
      'common.share': 'Share',
      'common.loading': 'Loading…',
      'common.error': 'An error occurred',
      'common.back_to_map': 'Back to map',

      // ──────── BATTLE OF GALAȚI 1918 PAGE ────────
      'battle1918.page_title': 'Battle of Galați 1918 · top-view animation',
      'battle1918.back': 'Back to map',
      'battle1918.embed_intro': 'To embed in another front-end: include',
      'battle1918.embed_and_use': 'and use',
      'battle1918.embed_iframe': 'Alternatively, this page can be inserted directly into an iframe.',

      // ──────── PIAȚA REGALĂ AR PAGE ────────
      'ar.crumb': 'Heritage Galați · AR Pilot',
      'ar.back_full': '← Back to map',
      'ar.splash_title': '🥽 Royal Square — As It Was',
      'ar.splash_lede': 'Augmented Reality reconstruction of the 5 pilot buildings of the Royal Square in Galați (1880-1944), destroyed by the German army on the night of August 24-25, 1944, and never rebuilt.',
      'ar.btn_ar': '📱 Start the AR experience',
      'ar.btn_walk': '🚶‍♂️ "Virtual Tour" mode (no AR)',
      'ar.how_title': 'How AR works:',
      'ar.how_body': 'Physically walk to the Bălcescu × Brăilei area (the current centre of the former square). Allow access to camera + location, then point your phone at the buildings with stories. You will see the historical photographs "floating" over the camera image, anchored to the coordinates where they once stood.',
      'ar.requirements': 'Requirements: Android or iOS phone, modern browser (Chrome/Safari), HTTPS, camera + location permissions.',
      'ar.compat': 'For desktop or if AR doesn\'t launch, choose "Virtual Tour" — see the gallery of buildings on your screen.',
      'ar.walk_title': '🚶‍♂️ Virtual tour of the Royal Square',
      'ar.walk_lede': 'The 5 emblematic buildings of the former square, each with its story. Click on a card for details.',
      'ar.badge_label': '🥽 AR · Royal Square 1908',
      'ar.gps_wait': 'waiting...',
      'ar.compass_label': 'Compass',
      'ar.loader': 'Starting AR…',
      'ar.error_title': 'Error',
      'ar.error_msg': 'Something went wrong.',
      'ar.retry': 'Try again',
      'ar.back': '← Back',
    },
  };

  // Limba curentă din localStorage sau default
  // Seed o singură dată din `?lang=` (linkuri partajabile/crawlabile pentru EN,
  // ex. hreflang). URL-ul are prioritate la prima încărcare, apoi localStorage
  // preia controlul, ca toggle-ul din picker să nu fie suprascris de URL.
  (function seedLangFromUrl() {
    try {
      const u = new URLSearchParams(location.search).get('lang');
      if (u === 'ro' || u === 'en') localStorage.setItem('tg.lang', u);
    } catch (e) {}
  })();
  function getLang() {
    try {
      const stored = localStorage.getItem('tg.lang');
      if (stored === 'ro' || stored === 'en') return stored;
    } catch (e) {}
    return 'ro';
  }
  function setLang(lang) {
    if (lang !== 'ro' && lang !== 'en') return;
    try { localStorage.setItem('tg.lang', lang); } catch (e) {}
    document.documentElement.setAttribute('lang', lang);
    applyTranslations();
    // Eveniment custom — alte module pot reacționa (re-render markeri, popup-uri, etc.)
    window.dispatchEvent(new CustomEvent('langchange', { detail: { lang } }));
  }
  function t(key, params) {
    const lang = getLang();
    const dict = I18N[lang] || I18N.ro;
    let str = dict[key];
    if (str == null) str = I18N.ro[key] || key;
    if (params && typeof params === 'object') {
      for (const k in params) {
        str = str.replace('{' + k + '}', params[k]);
      }
    }
    return str;
  }
  function applyTranslations() {
    // 1. Elementele cu data-i18n primesc textContent tradus
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (!key) return;
      el.textContent = t(key);
    });
    // 2. Generic data-i18n-<attr> → setează atributul `<attr>` cu valoarea tradusă
    //    Suportă: data-i18n-placeholder, data-i18n-aria-label, data-i18n-title,
    //    data-i18n-label, data-i18n-alt, etc.
    document.querySelectorAll('*').forEach(el => {
      for (const attr of el.attributes) {
        if (!attr.name.startsWith('data-i18n-')) continue;
        if (attr.name === 'data-i18n-aria-label') {
          el.setAttribute('aria-label', t(attr.value));
        } else {
          const target = attr.name.slice('data-i18n-'.length); // e.g. "placeholder", "title", "label"
          el.setAttribute(target.startsWith('aria-') ? target : target, t(attr.value));
          // Pentru data-label (folosit la layer-bubble ::after) setăm atributul «data-label»
          if (target === 'label') el.setAttribute('data-label', t(attr.value));
        }
      }
    });
    // 3. Picker de limbă: bifează opțiunea activă (aria-selected) + actualizează
    //    butonul-curent (flag + cod RO/EN)
    const lang = getLang();
    document.querySelectorAll('[data-lang-btn]').forEach(btn => {
      const isActive = btn.getAttribute('data-lang-btn') === lang;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });
    // Sincronizează drapelul de pe butonul current cu limba activă
    const currentFlag = document.getElementById('lang-current-flag');
    const currentCode = document.getElementById('lang-current-code');
    if (currentFlag && currentCode) {
      const activeOption = document.querySelector('[data-lang-btn="' + lang + '"]');
      if (activeOption) {
        const flagSvg = activeOption.querySelector('.flag');
        if (flagSvg) currentFlag.innerHTML = flagSvg.innerHTML;
        currentCode.textContent = (lang === 'en' ? 'EN' : 'RO');
      }
    }
    // 4. Notă pentru utilizatori EN despre descrierile încă în română
    const noteEl = document.getElementById('detail-ro-notice');
    if (noteEl) {
      const lang = getLang();
      noteEl.hidden = (lang !== 'en');
      noteEl.textContent = t('detail.no_translation');
    }
  }

  // Expose
  window.I18N = I18N;
  window.t = t;
  window.getLang = getLang;
  window.setLang = setLang;
  window.applyTranslations = applyTranslations;

  // Set lang attribute la HTML la load
  document.documentElement.setAttribute('lang', getLang());
})();
