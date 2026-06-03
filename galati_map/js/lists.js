    const data = await fetch('./cronologie.json').then(r => r.json());
    const entries = data.entries;
    const r = data.rosters;

    // ───────── Population augmentation ─────────
    // Curated population data lives in index.html for the map tooltip; we
    // rebuild the same source-of-truth here so the Liste page is consistent.
    const curatedPopulation = [
      {year: 1800, pop: 7000,   src: 'Populația Galațiului: 7.000 (cronologie)'},
      {year: 1818, pop: 5000,   src: 'Populația oraşului: 5.000 (cronologie 1818)'},
      {year: 1829, pop: 7000,   src: 'Populația oraşului: 7.000 (cronologie 1829)'},
      {year: 1831, pop: 8605,   src: 'statistica administrației Kiseleff (cronologie 1831)'},
      {year: 1836, pop: 9908,   src: 'Populația oraşului: 9.908 (cronologie 1836)'},
      {year: 1842, pop: 18066,  src: 'Populația oraşului era de 18.066 (cronologie 1842)'},
      {year: 1843, pop: 20000,  src: 'Populația orașului trecea de 20.000 (cronologie 1843)'},
      {year: 1845, pop: 24000,  src: 'catagrafia 1845'},
      {year: 1859, pop: 40105,  src: 'primul recensământ serios (Moise Pacu, Cartea jud. Covurlui)'},
      {year: 1861, pop: 30000,  src: 'Populația Galaților numără 30.000 (cronologie 1861)'},
      {year: 1866, pop: 48799,  src: 'recensământ 1866'},
      {year: 1871, pop: 48789,  src: '48.789 locuitori (raport Alex. Moruzzi 1871)'},
      {year: 1879, pop: 40022,  src: 'populație stabilă de 40.022 (cronologie 1879)'},
      {year: 1881, pop: 40022,  src: 'recensământ 1881'},
      {year: 1885, pop: 44096,  src: 'recensământ 1885'},
      {year: 1895, pop: 56420,  src: 'recensământ 1895'},
      {year: 1899, pop: 62545,  src: 'catagrafia 1899'},
      {year: 1900, pop: 62678,  src: 'Populația oraşului: 62.678 (cronologie 1900)'},
      {year: 1912, pop: 71641,  src: 'recensământ 1912'},
      {year: 1930, pop: 100611, src: 'recensământ 1930'},
      {year: 1941, pop: 95545,  src: 'recensământ 1941'},
      {year: 1948, pop: 80411,  src: 'recensământ 1948'},
      {year: 1956, pop: 95646,  src: 'recensământ 1956'},
      {year: 1966, pop: 151412, src: 'recensământ 1966'},
      {year: 1977, pop: 238292, src: 'recensământ 1977'},
      {year: 1992, pop: 326141, src: 'recensământ 1992'},
      {year: 2002, pop: 298861, src: 'recensământ 2002'},
      {year: 2011, pop: 249432, src: 'recensământ 2011'},
      {year: 2021, pop: 217851, src: 'RPL 2021, populație rezidentă'},
    ];
    const curatedHouseholds = [
      {
        year: 1832,
        value: 1821,
        ctx: 'Din totalul de 1.821 case, 694 erau în ciasta a patra, 562 în ciasta întâi, 366 în ciasta a treia și 299 în ciasta a doua.',
      },
      {
        year: 1840,
        value: 3000,
        ctx: '18.000 de locuitori și 3.000 de case, după socotelile sârbului Ioachim Vuici, citat de P. Păltănea.',
      },
      {
        year: 1842,
        value: 2882,
        ctx: '18.066 locuitori și 2.882 case; aceeași statistică mai notează 31 hoteluri, 5 fabrici, 8 bancheri și 63 comercianți.',
      },
      {
        year: 1881,
        value: 6386,
        ctx: 'Total recalculat din recensământ: 5.016 case de zid cu un rând, 641 cu două rânduri, 14 cu trei rânduri; 21 case de piatră; 445 case de lemn; 249 bordeie.',
      },
      {
        year: 1895,
        value: 10627,
        ctx: 'Din cele 10.627 case din oraș, 2.714 erau construite din nuiele lipite cu pământ și 108 erau bordeie.',
      },
    ];

    const curatedWarEvents = [
      { year: '1484', sort: 1484, text: 'Căderea Chiliei și Cetății Albe sub stăpânire otomană crește importanța strategică și comercială a Galațiului ca port moldovenesc la Dunăre.' },
      { year: '1612', sort: 1612, text: 'Orașul este afectat de incursiuni tătare; cronologia notează că tătarii pârjoliseră totul cu câteva luni înainte.' },
      { year: '1675', sort: 1675, text: 'Incursiuni tătare în zonă; medicul italian Giovanni Mascellini moare la Galați și este îngropat pe malul Dunării.' },
      { year: '1678', sort: 1678, text: 'În timpul războiului polono-turc, turcii năvălesc și incendiază orașul; mulți gălățeni se refugiază.' },
      { year: '1711', sort: 1711, text: 'După înfrângerea de la Stănilești, turcii și tătarii atacă Galațiul, jefuiesc mănăstirile Precista și Sf. Gheorghe, iau robi și ard Sf. Nicolae.' },
      { year: '1735-1739', sort: 1735, text: 'În războiul ruso-turc, turcii incendiază orașul; ard din nou Precista și pivnița bisericii catolice de pe malul Dunării.' },
      { year: '1768-1774', sort: 1768, text: 'Războiul ruso-turc aduce ocupații și lupte în zonă; la 20 noiembrie 1769 Galațiul este cucerit de armata rusă a colonelului Fabricius.' },
      { year: '1787-1792', sort: 1787, text: 'În războiul austro-ruso-turc, orașul este ocupat de ruși și ars din temelii de trupele generalului Mihail Kamensky; rămân întregi mai ales zidurile bisericilor.' },
      { year: '1806-1812', sort: 1806, text: 'Războiul ruso-turc aduce Galațiul sub ocupație rusească; după pacea de la București, Basarabia este anexată de Imperiul Rus.' },
      { year: '1821', sort: 1821, text: 'Eteria ajunge la Galați: căpitanul grec Vasile Caravia atacă garnizoana turcească, apoi târgul este incendiat; represaliile otomane din toamnă pustiesc orașul.' },
      { year: '1828-1829', sort: 1828, text: 'În noul război ruso-turc, orașul suferă distrugeri din partea taberelor aflate în conflict; Pacea de la Adrianopol redeschide navigația pe Dunăre.' },
      { year: '1853-1856', sort: 1853, text: 'Războiul Crimeii oprește lucrările de pavare și aliniere; în 1854 generalul rus Lüders trece Dunărea pe la Galați, iar orașul este ocupat de austrieci.' },
      { year: '1877-1878', sort: 1877, text: 'Războiul de Independență: Galațiul susține logistic trupele din zonă, găzduiește spitale rusești afectate de tifos și primește, prin consulul rus, decorația „Crucea Sfântului Stanislav”.' },
      { year: '1916-1918', sort: 1916, text: 'Primul Război Mondial transformă Galațiul într-un oraș de spate al frontului româno-rus din Moldova, cu refugiați, unități militare, spitale și presiune logistică majoră.' },
      { year: '20-22 ian. 1918', sort: 1918, text: 'Bătălia de la Galați: unități ruse bolșevizate înconjoară și bombardează orașul pentru a trece armate spre Basarabia; trupele române, marinarii și pompierii apără orașul și îi resping.' },
      { year: '1940', sort: 1940, text: 'Ultimatumul sovietic și anexarea Basarabiei și Bucovinei de Nord transformă din nou Galațiul într-un oraș de frontieră sensibil, pe Prut și Dunăre.' },
      { year: '6 iun. 1944', sort: 1944.1, text: 'Al Doilea Război Mondial: în cadrul Operațiunii „Frantic”, aviația aliată bombardează Galațiul și aeroportul; sunt lovite pista, hangarele, casele din vecinătate și Spitalul „Izolarea”.' },
      { year: '24-26 aug. 1944', sort: 1944.2, text: 'După întoarcerea armelor, aviația sovietică bombardează Galațiul rămas în mâna germanilor, iar trupele germane în retragere minează, incendiază și distrug centrul istoric al orașului.' },
      { year: '1944-1958', sort: 1944.3, text: 'Perioada postbelică este marcată de prezența militară sovietică în România; pentru Galați sunt documentate relațiile autorităților locale cu trupele sovietice, iar aeroportul este desființat în 1958, în contextul presiunii sovietice asupra zonei de frontieră.' },
      { year: '2022-prezent', sort: 2022, text: 'Războiul declanșat de Rusia împotriva Ucrainei nu aduce lupte în Galați, dar orașul devine punct de sprijin umanitar pentru refugiați, cu spații de cazare și centru „Blue Dot” susținut de UNHCR/UNICEF/OIM/OMS.' },
    ];

    const curatedEpidemicEvents = [
      { year: '1652', sort: 1652, kind: 'ciumă', text: 'Ciumă la Galați, una dintre primele mențiuni explicite din cronologie.' },
      { year: '1677', sort: 1677, kind: 'ciumă', text: 'Ciuma bântuie în Balcani; Galațiul apare în contextul circulației comerciale și militare de la Dunăre.' },
      { year: '1729-1739', sort: 1729, kind: 'ciumă', text: 'Episod lung de ciumă, întins până în 1739.' },
      { year: '1758', sort: 1758, kind: 'ciumă', text: '„Ciuma lui Calimachi”: călătorul Borzysławski nota înmormântări zilnice și multe case contaminate.' },
      { year: '1769', sort: 1769, kind: 'ciumă', text: 'Ciumă în contextul războiului ruso-turc; mobilitatea trupelor și comerțul sporesc riscul epidemiologic.' },
      { year: '1796', sort: 1796, kind: 'ciumă', text: 'Ciuma se abate peste târgul Galaților.' },
      { year: '1813-1815', sort: 1813, kind: 'ciumă', text: '„Ciuma lui Caragea”, declanșată în 1813 în Țara Românească, intră și în Moldova prin portul Galați și ține aproape doi ani.' },
      { year: '1823-1824', sort: 1823, kind: 'ciumă', text: 'Noi măsuri împotriva ciumei; boala bântuie în târgurile Moldovei, mai ales Iași și Galați.' },
      { year: '1831', sort: 1831, kind: 'ciumă / holeră', text: 'Ciuma izbucnește din nou, întâi în Basarabia, apoi spre Iași; același an intră în memoria locală ca început al valurilor de holeră.' },
      { year: '1838', sort: 1838, kind: 'holeră', text: 'Epidemia de holeră face la Galați 99 de victime, majoritatea persoane sărace aflate în condiții precare.' },
      { year: '1847', sort: 1847, kind: 'holeră', text: 'Holera pornită din India ajunge în estul Europei și este adusă în portul Galați de un vas turcesc; de aici se răspândește spre târgurile moldovene.' },
      { year: '1848', sort: 1848, kind: 'holeră', text: 'Holera revine: între 10 aprilie și 3 mai sunt 252 cazuri și 99 decese; într-o lună, din 22.000 locuitori, 677 se îmbolnăvesc și 192 mor.' },
      { year: '1853', sort: 1853, kind: 'holeră', text: 'O nouă epidemie de holeră începe să bântuie orașul, în paralel cu tensiunile și mobilitatea din timpul Războiului Crimeii.' },
      { year: '1865', sort: 1865, kind: 'holeră', text: 'Apare o nouă epidemie de holeră; orașul avea deja puncte publice de distribuție a apei, dar salubritatea rămânea fragilă.' },
      { year: '1872', sort: 1872, kind: 'holeră', text: 'Holera continuă să fie semnalată în cronologie.' },
      { year: '1878', sort: 1878, kind: 'tifos', text: 'În timpul Războiului de Independență, spitalele rusești din Galați sunt bântuite de tifos; în oraș izbucnește și tifos exantematic.' },
      { year: '1892', sort: 1892, kind: 'boli infecțioase', text: 'Raport sanitar: holeră (29 cazuri), sifilis (317), TBC (208 cazuri și 191 morți), dizenterie (123), pelagră (21).' },
      { year: '1893', sort: 1893, kind: 'holeră', text: 'Epidemia de holeră face din nou ravagii; sunt aduși medici de specialitate, iar bolnavii sunt tratați într-un spital de izolare din afara orașului.' },
      { year: '1895-1896', sort: 1895, kind: 'scarlatină / TBC / dizenterie', text: 'Raportările sanitare consemnează epidemie de scarlatină (166 cazuri și 48 decese în 1895; 191 cazuri și 52 decese în 1896), plus mortalitate ridicată prin TBC și dizenterie.' },
      { year: '1918-1919', sort: 1918, kind: 'gripă spaniolă', text: 'Pandemia de gripă spaniolă lovește România în contextul postbelic; Galațiul, oraș-port și nod de refugiați, trupe și spitale, aparține rețelei de localități vulnerabile, chiar dacă lista locală nu păstrează aici un bilanț numeric sigur.' },
      { year: '2018-2019', sort: 2018, kind: 'gripă', text: 'Sezon gripal sever în România; în Galați apar raportări locale constante de gripă, viroze și pneumonii, cu supraveghere DSP.' },
      { year: 'mart. 2020', sort: 2020, kind: 'COVID-19', text: 'Primele cazuri confirmate de COVID-19 în Galați apar în martie 2020; începe perioada restricțiilor, izolării și raportărilor zilnice.' },
      { year: '2020-2022', sort: 2020.1, kind: 'COVID-19', text: 'Pandemia COVID-19 afectează masiv județul Galați, cu valuri succesive, focare în spitale și centre sociale, campanii de vaccinare și presiune asupra Spitalului Județean.' },
      { year: '2023', sort: 2023, kind: 'gripă / COVID-19', text: 'După faza acută a pandemiei, raportările DSP Galați continuă să urmărească gripa, virozele, pneumoniile și cazurile COVID-19 în aceeași supraveghere sezonieră.' },
      { year: '2023-2024', sort: 2023.1, kind: 'rujeolă', text: 'România declară epidemie națională de rujeolă; Galațiul confirmă cazuri locale, inclusiv primul caz semnalat public la un copil de opt ani.' },
      { year: '2024-2025', sort: 2024, kind: 'gripă', text: 'Sezon gripal activ în Galați: presa locală citează DSP cu sute de cazuri de gripă într-o singură săptămână, alături de mii de viroze și pneumonii.' },
      { year: '2025-prezent', sort: 2025, kind: 'supraveghere sezonieră', text: 'Nu mai există o urgență pandemică declarată, dar DSP monitorizează în continuare gripa, infecțiile respiratorii, rujeola și COVID-19 prin raportări sezoniere.' },
    ];

    const curatedCategoryAdditions = {
      scoala: [
        { year: '1948', sort: 1948, text: 'Se pun bazele învățământului superior gălățean prin Institutul de Îmbunătățiri Funciare.' },
        { year: '1951', sort: 1951, text: 'Se înființează Institutul Mecano-Naval, nucleu al specializărilor tehnice legate de șantier, port și industrie.' },
        { year: '1959', sort: 1959, text: 'Se înființează Institutul Pedagogic din Galați, cu facultăți de filologie, matematică, fizică-chimie, științe naturale și educație fizică.' },
        { year: '1974', sort: 1974, text: 'Este înființată Universitatea din Galați prin Decretul 105/1974, prin unirea institutelor politehnic și pedagogic.' },
        { year: '1991', sort: 1991, text: 'Universitatea primește denumirea „Dunărea de Jos” din Galați.' },
        { year: 'prezent', sort: 2026, text: 'Galațiul funcționează ca centru universitar regional, cu Universitatea „Dunărea de Jos” drept instituție principală de învățământ superior.' },
      ],
      spital: [
        { year: '1972', sort: 1972, text: 'Se înființează Spitalul Județean Unificat Nr. 1 Galați, actualul Spital Clinic Județean de Urgență „Sf. Apostol Andrei”.' },
        { year: '2001', sort: 2001, text: 'Spitalul Județean „Sf. Apostol Andrei” devine spital de urgență.' },
        { year: '2020-2022', sort: 2020, text: 'Pandemia COVID-19 pune presiune majoră pe spitalele gălățene, cu focare și circuite speciale în unitățile medicale.' },
        { year: 'prezent', sort: 2026, text: 'Spitalul Clinic Județean de Urgență „Sf. Apostol Andrei” rămâne unitatea medicală de referință a regiunii de sud-est.' },
      ],
      consulat: [
        { year: '1914-1918', sort: 1914, text: 'Primul Război Mondial reduce rolul Galațiului ca oraș consular de tip porto-franco; multe reprezentanțe istorice își pierd funcția inițială.' },
        { year: 'după 1945', sort: 1945, text: 'După Al Doilea Război Mondial și schimbarea regimului politic, Galațiul nu mai funcționează ca nod consular rezident comparabil cu secolul XIX.' },
        { year: 'prezent', sort: 2026, text: 'Serviciile consulare pentru locuitorii Galațiului sunt acoperite în principal prin ambasade și consulate aflate în București sau în alte centre regionale; lista rămâne mai ales una istorică.' },
      ],
      ziar: [
        { year: '1949', sort: 1949, text: 'Apare cotidianul local care va deveni, după 1989, „Viața liberă”, una dintre principalele publicații gălățene.' },
        { year: '1989', sort: 1989, text: 'După Revoluție, presa locală se restructurează; „Viața liberă” devine publicație locală postcomunistă.' },
        { year: '1990-2000', sort: 1990, text: 'Presa gălățeană se diversifică prin ziare locale, radio/TV locale și, ulterior, publicații online.' },
        { year: 'prezent', sort: 2026, text: 'Presa locală funcționează preponderent digital, prin publicații precum „Viața liberă”, „Monitorul de Galați” și alte platforme regionale.' },
      ],
      biserica: [
        { year: '1906-1917', sort: 1906, text: 'Se construiește Catedrala arhiepiscopală „Sf. Apostol Andrei și Sf. Ierarh Nicolae”, unul dintre reperele religioase majore ale orașului modern.' },
        { year: '1944', sort: 1944, text: 'Bombardamentele și incendiile din război afectează mai multe lăcașuri de cult și țesutul istoric din zona centrală.' },
        { year: '2009', sort: 2009, text: 'Eparhia Dunării de Jos este ridicată la rang de arhiepiscopie, întărind rolul Galațiului ca centru bisericesc regional.' },
        { year: 'prezent', sort: 2026, text: 'Galațiul păstrează un patrimoniu religios divers: ortodox, romano-catolic, armean, grec, lipovenesc, evreiesc și protestant, cu clădiri istorice și comunități active sau memoriale.' },
      ],
      port: [
        { year: '1926', sort: 1926, text: 'Se deschide traficul aerian intern București-Galați; aeroportul completează rolul portuar și feroviar al orașului.' },
        { year: '1958', sort: 1958, text: 'Aeroportul Galați este desființat, în contextul sensibilității de frontieră față de RSS Moldovenească.' },
        { year: '1960-1970', sort: 1960, text: 'Industrializarea și Combinatul Siderurgic schimbă logistica orașului, legând portul, calea ferată și platforma industrială.' },
        { year: 'prezent', sort: 2026, text: 'Galațiul rămâne cel mai mare port românesc de pe Dunărea maritimă și un nod logistic lângă Republica Moldova și Ucraina.' },
      ],
      tramvai: [
        { year: '1970-1980', sort: 1970, text: 'Rețeaua de tramvai este extinsă în orașul industrial, legând cartierele muncitorești, zona centrală și platformele economice.' },
        { year: '2010-2020', sort: 2010, text: 'Transportul public trece prin modernizări succesive, cu reabilitări de trasee și material rulant nou.' },
        { year: 'prezent', sort: 2026, text: 'Tramvaiul rămâne parte a transportului public local, alături de autobuze și troleibuze.' },
      ],
      monument: [
        { year: '1918-1922', sort: 1918, text: 'După Bătălia de la Galați, orașul primește decorații de război din Italia și Franța, iar memoria luptei intră în patrimoniul civic local.' },
        { year: '1944', sort: 1944, text: 'Războiul distruge o parte importantă a centrului vechi, schimbând radical memoria urbană și patrimoniul construit.' },
        { year: '1989-prezent', sort: 1989, text: 'După Revoluție apar și se consolidează monumente și locuri de memorie dedicate eroilor, personalităților locale și patrimoniului dispărut.' },
        { year: 'prezent', sort: 2026, text: 'Patrimoniul monumental al orașului este administrat prin Lista Monumentelor Istorice și prin inițiative locale de restaurare, digitizare și memorie urbană.' },
      ],
      evrei: [
        { year: '1941-1944', sort: 1941, text: 'Al Doilea Război Mondial și legislația antisemită afectează puternic comunitatea evreiască gălățeană.' },
        { year: '1948-1989', sort: 1948, text: 'În perioada comunistă, comunitatea evreiască se reduce numeric prin emigrare și schimbări sociale, dar memoria ei rămâne legată de sinagogi, cimitire, școli și filantropie.' },
        { year: 'prezent', sort: 2026, text: 'Cimitirul evreiesc și clădirile comunitare rămase sunt repere ale memoriei multiculturale a Galațiului.' },
      ],
      cimitir: [
        { year: 'sec. XX', sort: 1900, text: 'Cimitirul Eternitatea devine principalul spațiu memorial urban, cu morminte ale unor personalități locale și comunități diverse.' },
        { year: 'prezent', sort: 2026, text: 'Cimitirele istorice ale Galațiului, inclusiv cel evreiesc, sunt surse importante pentru cercetarea socială și genealogică a orașului.' },
      ],
      teatru: [
        { year: '1955', sort: 1955, text: 'Se înființează Teatrul de Stat Galați, actualul Teatru Dramatic „Fani Tardini”.' },
        { year: '1956', sort: 1956, text: 'Are loc primul spectacol al teatrului; în decembrie 1956 se joacă primul spectacol pe scena actualei săli de pe Domnească.' },
        { year: '1973', sort: 1973, text: 'Teatrul de Stat primește denumirea de Teatrul Dramatic Galați.' },
        { year: '2000', sort: 2000, text: 'Instituția devine Teatrul Dramatic „Fani Tardini” Galați.' },
        { year: '2025-2026', sort: 2025, text: 'Stagiunea marchează 70 de ani de la înființarea Teatrului de Stat Galați.' },
      ],
      fabrica: [
        { year: '1961', sort: 1961, text: 'Începe construcția Combinatului Siderurgic Galați, proiectul industrial care schimbă definitiv orașul.' },
        { year: '1966', sort: 1966, text: 'Este inaugurat Combinatul Siderurgic Galați; intră în funcțiune primele capacități majore.' },
        { year: '1968', sort: 1968, text: 'Este inaugurat fluxul siderurgic integrat și se elaborează prima șarjă de oțel.' },
        { year: '1991', sort: 1991, text: 'Combinatul devine societate comercială sub numele Sidex Galați.' },
        { year: '2001', sort: 2001, text: 'Sidex este privatizat și cumpărat de grupul LNM/Mittal.' },
        { year: '2006', sort: 2006, text: 'După fuziunea Mittal Steel-Arcelor, combinatul devine ArcelorMittal Galați.' },
        { year: '2019', sort: 2019, text: 'Combinatul este preluat de Liberty House Group și devine Liberty Galați.' },
        { year: '2025-2026', sort: 2025, text: 'Liberty Galați traversează o criză industrială și financiară majoră, cu proceduri de restructurare și discuții privind vânzarea activelor.' },
      ],
    };

    const curatedEarthquakes = [
      ...r.disasters.filter(d => d.kind === 'cutremur').map(d => ({ year: String(d.year), sort: d.year, text: d.text })),
      { year: '1908', sort: 1908, text: 'Cutremur vrâncean puternic (aprox. M 6,8), resimțit în sudul Moldovei.' },
      { year: '10 nov. 1940', sort: 1940, text: 'Cutremurul vrâncean major din 1940 afectează grav centrul și sudul Moldovei; Galațiul este menționat printre orașele cu efecte severe.' },
      { year: '4 mar. 1977', sort: 1977, text: 'Cutremurul vrâncean din 1977 este resimțit puternic la Galați, ca în toată partea de sud-est a țării.' },
      { year: '30/31 aug. 1986', sort: 1986, text: 'Cutremur vrâncean major, resimțit la Galați și în Republica Moldova.' },
      { year: '30-31 mai 1990', sort: 1990, text: 'Două cutremure vrâncene puternice sunt resimțite în Galați.' },
      { year: '27 oct. 2004', sort: 2004, text: 'Cutremur vrâncean de magnitudine importantă, resimțit în Galați.' },
    ];

    const curatedFloods = [
      ...r.disasters.filter(d => d.kind === 'inundație').map(d => ({ year: String(d.year), sort: d.year, text: d.text })),
      { year: '2010', sort: 2010, text: 'Viiturile de pe Dunăre și Prut pun presiune pe diguri și pe zona joasă a orașului și județului.' },
      { year: '11-13 sept. 2013', sort: 2013, text: 'Inundații catastrofale în județul Galați: 39 de unități administrativ-teritoriale afectate, 8.265 persoane evacuate și mii de locuințe inundate.' },
      { year: '14 sept. 2024', sort: 2024, text: 'Noi inundații majore în județul Galați: peste 5.000 de gospodării afectate în primele raportări, persoane evacuate și victime; ulterior sunt inventariate 28 de localități afectate.' },
    ];

    const curatedFires = [
      ...r.disasters.filter(d => d.kind === 'incendiu').map(d => ({ year: String(d.year), sort: d.year, text: d.text })),
      { year: '24-26 aug. 1944', sort: 1944, text: 'Trupele germane în retragere incendiază și minează centrul istoric al Galațiului, producând una dintre cele mai mari pierderi urbane moderne.' },
      { year: '2022', sort: 2022, text: 'Explozie urmată de incendiu la un rezervor de carburanți din municipiul Galați; ISU intervine fără victime raportate.' },
      { year: '2024', sort: 2024, text: 'Incendiu la groapa de gunoi de lângă Galați, cu mesaj RO-ALERT din cauza fumului dens.' },
      { year: '2025', sort: 2025, text: 'Incendiu puternic cu degajări mari de fum într-un complex de depozite din Galați; este transmis mesaj RO-ALERT.' },
    ];

    // ───────── Curated mayor list ─────────
    // Source: https://ro.wikipedia.org/wiki/Lista_primarilor_din_Galați
    // (1864 → present). Replaces the partial OCR-extracted list from the
    // chronology, which only covered 1864-1900 and was sometimes garbled.
    const curatedPrimari = [
      { start: '1864', end: '1865', name: 'Ion Vizzu', role: 'institutor' },
      { start: '1866', end: '1867', name: 'Mantu Rufu', role: 'comerciant' },
      { start: '1867', end: '1868', name: 'Procopie S. Grumala', role: 'profesor' },
      { start: '1869', end: '1870', name: 'Iancu Panaitescu' },
      { start: '1870', end: '1871', name: 'P. Zamaria', role: 'comerciant' },
      { start: '1872', end: '1874', name: 'Alexandru D. Moruzi', role: 'proprietar rural' },
      { start: '1874', end: '1875', name: 'Gheorghe Voleti', role: 'avocat' },
      { start: '1875', end: '1876', name: 'Petrache Botezatu' },
      { start: '1876', end: '1876', name: 'Ștefan V. Nenițescu', role: 'comerciant' },
      { start: '1877', end: '1879', name: 'Gheorghe P. Mantu', role: 'comerciant' },
      { start: '1880', end: '1881', name: 'Costache Vârlan', role: 'avocat' },
      { start: '1881', end: 'ian. 1883', name: 'Dumitru Vizzu', role: 'avocat' },
      { start: 'feb. 1883', end: 'mar. 1883', name: 'Gheorghe Mihăilescu', role: 'profesor' },
      { start: 'mar. 1883', end: 'apr. 1884', name: 'Gheorghe Fulger', role: 'proprietar rural, comerciant' },
      { start: 'apr. 1884', end: 'feb. 1885', name: 'Gheorghe N. Cavallioti', role: 'avocat, proprietar urban' },
      { start: 'feb. 1885', end: 'feb. 1885', name: 'Costin Vârlan', role: 'avocat' },
      { start: 'feb. 1885', end: 'feb. 1885', name: 'Andreiaș Panaitescu', role: 'fost perceptor fiscal' },
      { start: 'apr. 1885', end: 'nov. 1886', name: 'M. Hagi Nicola', role: 'comerciant' },
      { start: 'nov. 1886', end: 'mar. 1887', name: 'Constantin A. Ressu', role: 'avocat' },
      { start: 'mar. 1887', end: 'iun. 1887', name: 'M. Hagi Nicola', role: 'comerciant' },
      { start: 'iun. 1887', end: 'iul. 1888', name: 'Limeoleon Nebunelli', role: 'librar' },
      { start: 'iul. 1888', end: 'sep. 1890', name: 'Constantin A. Ressu', role: 'avocat' },
      { start: 'sep. 1890', end: 'feb. 1891', name: 'Constantin A. Ressu', role: 'avocat' },
      { start: 'feb. 1891', end: 'aug. 1892', name: 'Gheorghe C. Robescu', role: 'avocat' },
      { start: 'aug. 1892', end: 'nov. 1892', name: 'Stavrică Mantu', role: 'proprietar urban' },
      { start: 'nov. 1892', end: 'sep. 1894', name: 'Virgil G. Poenaru', role: 'avocat' },
      { start: 'sep. 1894', end: 'oct. 1895', name: 'Constantin A. Ressu', role: 'avocat' },
      { start: 'oct. 1895', end: 'oct. 1896', name: 'Costache P. Malaxa', role: 'proprietar rural' },
      { start: 'oct. 1896', end: 'dec. 1899', name: 'Gheorghe Nicolescu', role: 'avocat' },
      { start: 'dec. 1896', end: 'mar. 1898', name: 'Costache G. Plesnilă', role: 'avocat' },
      { start: 'mar. 1898', end: 'iun. 1899', name: 'Constantin Ținc', role: 'farmacist' },
      { start: 'nov. 1898', end: 'iun. 1899', name: 'Mihail G. Orleanu', role: 'avocat' },
      { start: 'iun. 1899', end: 'nov. 1899', name: 'Zaharia Chiriac', role: 'avocat' },
      { start: 'nov. 1899', end: 'feb. 1901', name: 'Gheorghe L. Aslan' },
      { start: 'feb. 1901', end: 'nov. 1902', name: 'Mihail G. Orleanu' },
      { start: 'nov. 1902', end: 'sep. 1904', name: 'Ion E. Bastache', role: 'avocat' },
      { start: 'sep. 1904', end: 'dec. 1904', name: 'Constantin Ținc', role: 'farmacist' },
      { start: 'ian. 1905', end: 'iul. 1905', name: 'Alexandru Nicolescu', role: 'profesor' },
      { start: 'iul. 1905', end: 'apr. 1907', name: 'Emil Vulpe', role: 'avocat' },
      { start: 'apr. 1907', end: 'ian. 1909', name: 'Gheorghe N. Gamulea', role: 'avocat' },
      { start: 'feb. 1909', end: 'ian. 1911', name: 'Pandeli D. Petrovici', role: 'profesor' },
      { start: 'ian. 1911', end: 'mar. 1911', name: 'Costache G. Plesnilă' },
      { start: 'mar. 1911', end: 'oct. 1912', name: 'Alexandru G. Nicolescu' },
      { start: 'oct. 1912', end: 'ian. 1914', name: 'Nicolae Filipide', role: 'profesor' },
      { start: 'ian. 1914', end: 'mar. 1914', name: 'August Frățilă', role: 'profesor' },
      { start: 'mar. 1914', end: 'oct. 1917', name: 'Constantin Ținc', role: 'farmacist' },
      { start: 'oct. 1917', end: 'feb. 1918', name: 'Vasile Bălășescu' },
      { start: 'feb. 1918', end: 'mar. 1918', name: 'Eugeniu M. Bonache', role: 'jurist' },
      { start: 'mar. 1918', end: 'sep. 1918', name: 'Teodor Missir', role: 'avocat' },
      { start: 'sep. 1918', end: 'sep. 1918', name: 'Ion N. Coltofeanu', role: 'comerciant' },
      { start: 'sep. 1918', end: 'nov. 1918', name: 'Al. Sideri', role: 'ofițer' },
      { start: 'nov. 1918', end: 'ian. 1919', name: 'Nae Dumitrescu', role: 'jurist' },
      { start: 'ian. 1919', end: 'mar. 1919', name: 'Alecu Ignat', role: 'avocat' },
      { start: 'mar. 1919', end: 'ian. 1920', name: 'Zamfir Filoti', role: 'avocat' },
      { start: 'ian. 1920', end: 'apr. 1920', name: 'Ion Tohăneanu', role: 'profesor' },
      { start: 'apr. 1920', end: 'iul. 1920', name: 'Nicolae Alexandrescu', role: 'medic' },
      { start: 'iul. 1920', end: 'nov. 1920', name: 'Ion Sachetari', role: 'farmacist' },
      { start: 'nov. 1920', end: 'dec. 1921', name: 'Gheorghe H. Iorgala', role: 'avocat' },
      { start: 'dec. 1921', end: 'ian. 1922', name: 'Ion D. Popovici', role: 'inginer' },
      { start: 'ian. 1922', end: 'mar. 1923', name: 'Teodor I. Thenea', role: 'avocat' },
      { start: 'mar. 1923', end: 'ian. 1925', name: 'Iancu D. Prodom', role: 'comerciant' },
      { start: 'ian. 1925', end: 'iul. 1926', name: 'Ștefan H. Ștefan', role: 'avocat' },
      { start: 'iul. 1926', end: 'iul. 1926', name: 'Eugen Răutu', role: 'medic' },
      { start: 'iul. 1926', end: 'nov. 1927', name: 'Grigore P. Mihăilescu', role: 'avocat' },
      { start: 'nov. 1927', end: 'dec. 1928', name: 'Emil Codreanu', role: 'avocat' },
      { start: 'dec. 1928', end: 'mai 1931', name: 'Christache Teodoru', role: 'avocat' },
      { start: 'mai 1931', end: 'iun. 1932', name: 'Emil Codreanu', role: 'avocat' },
      { start: 'iun. 1932', end: 'oct. 1932', name: 'Gheorghe C. Plesnilă' },
      { start: 'oct. 1932', end: 'nov. 1933', name: 'Christache Teodoru', role: 'avocat' },
      { start: 'feb. 1936', end: 'ian. 1937', name: 'Al. Nestor Măcelaru', role: 'medic' },
      { start: 'ian. 1937', end: 'ian. 1938', name: 'Gh. H. Dumitrescu' },
      { start: '5 ian. 1938', end: '11 feb. 1938', name: 'Grigore P. Mihăilescu' },
      { start: '11 feb. 1938', end: '16 feb. 1938', name: 'Dimitrie C. Nanu' },
      { start: 'feb. 1938', end: 'oct. 1938', name: 'Theodor Atanasiu' },
      { start: 'oct. 1938', end: 'iun. 1940', name: 'Traian Gruescu' },
      { start: 'nov. 1940', end: 'dec. 1940', name: 'Constantin Stoiov' },
      { start: 'dec. 1940', end: 'ian. 1941', name: 'Aurel Ibrăileanu', party: 'Legiune' },
      { start: 'ian. 1941', end: 'feb. 1942', name: 'Romulus Burbea' },
      { start: 'feb. 1942', end: 'dec. 1942', name: 'Ghiță Vasiliu' },
      { start: 'dec. 1942', end: 'aug. 1944', name: 'Dan Sărățeanu' },
      { start: 'aug. 1944', end: 'sep. 1944', name: 'Ilie Gheorghiu' },
      { start: 'aug. 1944', end: 'sep. 1944', name: 'Gheorghe Ullea' },
      { start: 'nov. 1944', end: 'iun. 1945', name: 'Ilie Gheorghiu' },
      { start: 'iul. 1945', end: 'iun. 1946', name: 'Constantin Mârza' },
      { start: 'iun. 1946', end: 'apr. 1948', name: 'Ilie D. Rainici' },
      { start: 'apr. 1948', end: 'mar. 1949', name: 'Sandu D. Constantin', party: 'PCR' },
      { start: 'apr. 1949', end: 'dec. 1950', name: 'Ionescu Istrate', party: 'PCR' },
      { start: 'ian. 1951', end: 'aug. 1951', name: 'Hristache Scarlat', party: 'PCR' },
      { start: 'sep. 1951', end: 'aug. 1952', name: 'Radu Hrehoreț', party: 'PCR' },
      { start: 'aug. 1952', end: 'ian. 1954', name: 'Hristache Scarlat', party: 'PCR' },
      { start: 'ian. 1954', end: 'nov. 1954', name: 'Nicolae Nicola', party: 'PMR' },
      { start: 'nov. 1954', end: 'sep. 1955', name: 'Vasiliu Alexandru', party: 'PMR' },
      { start: 'sep. 1955', end: 'mar. 1956', name: 'Nicolae Nicola', party: 'PMR' },
      { start: 'mar. 1956', end: 'dec. 1957', name: 'State Aurel', party: 'PMR' },
      { start: 'ian. 1958', end: 'feb. 1961', name: 'Rusu Nicolae', party: 'PMR' },
      { start: 'feb. 1961', end: 'mai 1963', name: 'Zapis Vasile', party: 'PMR' },
      { start: 'mai 1963', end: 'feb. 1968', name: 'Stan Alecu', party: 'PMR / PCR' },
      { start: 'feb. 1968', end: '1972', name: 'Chiriță George', party: 'PCR' },
      { start: '1972', end: '1979', name: 'Bejan Ioan', party: 'PCR' },
      { start: '1979', end: '1982', name: 'Cojocaru Vasile', party: 'PCR' },
      { start: '1982', end: '1984', name: 'Dumitru Vasile', party: 'PCR' },
      { start: '1984', end: '1989', name: 'Caranghel Ion', party: 'PCR' },
      { start: 'ian. 1990', end: 'ian. 1990', name: 'Ion Mușat', role: 'inginer', party: 'CFSN' },
      { start: 'ian. 1990', end: 'mar. 1990', name: '— vacanț —' },
      { start: 'mar. 1990', end: 'aug. 1990', name: 'Florea Oprea', role: 'profesor universitar', party: 'FSN' },
      { start: 'aug. 1990', end: 'mar. 1992', name: 'Samoilă Pătrașcu', role: 'inginer', party: 'FSN' },
      { start: '1992', end: '2000', name: 'Eugen Durbacă', role: 'inginer', party: 'ApR / PUR / PC' },
      { start: '2000', end: '2012', name: 'Dumitru Nicolae', role: 'inginer', party: 'PSD' },
      { start: '2012', end: '2016', name: 'Marius Stan', role: 'inginer metalurg', party: 'PNL' },
      { start: '2016', end: 'prezent', name: 'Ionuț-Florin Pucheanu', role: 'jurist; reales în 2024', party: 'PSD' },
    ];

    const curatedParcalabi = [
      { span: '1812-1819', name: 'Ștefan Vogoride' },
      { span: '1820-1827', name: 'Stolnicul Ioan M. Cuza' },
      { span: '1829', name: 'Alecu Rosetti' },
      { span: '1830-1837', name: 'Banu Iancu Miclescu' },
      { span: '1837-1839', name: 'Col. Toderiță Balș' },
      { span: '1839-1841', name: 'Vasile Beldiman' },
      { span: '1842-1849', name: 'Vasile Ghica' },
      { span: '1849-1851', name: 'Nicolae Vogoridi' },
      { span: '1851-1853', name: 'Costache Negri' },
      { span: '19.01.1854-5.11.1854', name: 'Lascăr Catargiu' },
      { span: '5.11.1854-6.06.1856', name: 'Iorgu Ghica' },
      { span: '8.06.1856-19.09.1856', name: 'Vornicul Alecu Cuza' },
      { span: '19.09.1856-1860', name: 'D. Mavrocordat' },
      { span: '1860-14.10.1861', name: 'Prințul Ioan A. Cantacuzino' },
      { span: '14.10.1861-3.07.1862', name: 'G. Rășcanu' },
      { span: '3.07.1862-dec. 1862', name: 'Prințul Ioan A. Cantacuzino' },
      { span: 'dec. 1862-14.07.1864', name: 'Leon Ghica' },
    ];

    const curatedEducationEvents = [
      { year: '1671', sort: 1671, text: 'La biserica romano-catolică de pe malul Dunării funcționa o școală condusă de preotul Antonio Rossi.' },
      { year: '1675', sort: 1675, text: 'Medicul italian Giovanni Mascellini moare la Galați; piatra sa funerară a păstrat date biografice copiate ulterior de V.A. Urechia.' },
      { year: '1765', sort: 1765, text: 'Domnitorul Grigore al III-lea Ghica înființează Școala Domnească de la Mănăstirea Mavromol.' },
      { year: '1803', sort: 1803, text: 'Școala de la Mavromol este atestată ca școală elinească și românească, administrată de o epitropie locală.' },
      { year: '1832', sort: 1832, text: 'Se deschide Școala „Sfinții Arhangheli Mihail și Gavriil”, prima școală românească din județ.' },
      { year: '1846', sort: 1846, text: 'Studenții români de la Paris fondează o societate culturală la care participă și personalități legate de generația pașoptistă.' },
      { year: '1852', sort: 1852, text: 'Se înființează Școala Bulgară pentru copiii imigranților bulgari și sârbi din Galați.' },
      { year: '1857', sort: 1857, text: 'Se înființează Institutul elen Venieris, cu secții primară, comercială și liceală.' },
      { year: '1858', sort: 1858, text: 'Ia ființă un gimnaziu clasic de băieți, cu predare în limba română.' },
      { year: '1864', sort: 1864, text: 'Se deschide Școala nr. 6 de băieți, pe strada Roșiori; legea instrucțiunii prevede și școli comerciale.' },
      { year: '1865', sort: 1865, text: 'Apare ideea unei școli de meserii pentru nevoile economice ale orașului.' },
      { year: '1867', sort: 1867, text: 'Se consolidează instituțiile de învățământ ale orașului în jurul gimnaziului și al școlilor primare.' },
      { year: '1868', sort: 1868, text: 'Gimnaziul cere fonduri pentru material didactic; încep cursuri de alfabetizare la gimnaziu și la școlile elementare.' },
      { year: '1870', sort: 1870, text: 'Se deschide Școala nr. 5 de fete în cartierul Bădălan.' },
      { year: '1872', sort: 1872, text: 'Comunitatea elenă continuă să susțină școala proprie, legată de biserica greacă.' },
      { year: '1873', sort: 1873, text: 'Școala comercială devine tot mai importantă pentru orașul-port și pentru economia locală.' },
      { year: '1877', sort: 1877, text: 'În contextul războiului, școlile și instituțiile publice sunt afectate de încartiruiri și nevoi militare.' },
      { year: '1878', sort: 1878, text: 'Profesorii și absolvenții locali apar în viața civică și în presa orașului.' },
      { year: '1879', sort: 1879, text: 'Școala secundară de fete grad I se mută într-un local din Târgul Nou, cu dotare modestă.' },
      { year: '1881', sort: 1881, text: 'Biblioteca publică și inițiativele culturale încep să completeze rețeaua școlară a orașului.' },
      { year: '1882', sort: 1882, text: 'Școala de marină și bricul „Mircea” leagă educația tehnică de port și de marina română.' },
      { year: '1884', sort: 1884, text: 'Apar discuții despre școli practice și pregătire profesională pentru nevoile orașului modern.' },
      { year: '1885', sort: 1885, text: 'Consiliul de igienă cere măsuri de igienă și salubritate în școli.' },
      { year: '1887', sort: 1887, text: 'Se încearcă reorganizarea școlii bulgare; lipsa fondurilor duce la închiderea ei.' },
      { year: '1888', sort: 1888, text: 'Donațiile și societățile locale susțin biblioteci, școli și instituții culturale.' },
      { year: '1889', sort: 1889, text: 'Se deschide Școala de băieți nr. 10 și școala evreiască „Talmud Thora”; este înființată Biblioteca „V.A. Urechia”.' },
      { year: '1890', sort: 1890, text: 'Recensământul menționează populația școlară și persoanele aflate în instituții de educație.' },
      { year: '1891', sort: 1891, text: 'Rapoartele sanitare semnalează bolile copiilor și nevoia de igienă în spațiile școlare.' },
      { year: '1892', sort: 1892, text: 'Școala secundară de fete primește casele donate de George Ulise Negroponte; gimnaziul devine Liceul „Vasile Alecsandri”.' },
      { year: '1893', sort: 1893, text: 'Seminarul Teologic ortodox de la Galați este desființat, în ciuda protestelor locale.' },
      { year: '1895', sort: 1895, text: 'Rapoartele sanitare urmăresc scarlatina și alte boli care afectau în special copiii de vârstă școlară.' },
      { year: '1896', sort: 1896, text: 'Episcopul Partenie Clinceni donează cărți Bibliotecii „V.A. Urechia”.' },
      { year: '1899', sort: 1899, text: 'Sunt adoptate statute și regulamente pentru instituții culturale și educaționale locale.' },
      { year: '1900', sort: 1900, text: 'Se cere înființarea unei școli de meserii, adaptată dezvoltării industriale a orașului.' },
      ...curatedCategoryAdditions.scoala,
    ];

    const curatedHealthEvents = [
      { year: '1757', sort: 1757, text: 'Spitalul Sf. Spiridon din Iași primește uzufructul moșiilor Brateș și Bădălan din Galați.' },
      { year: '1837', sort: 1837, text: 'În perioada porto-franco apar condițiile pentru dezvoltarea instituțiilor sanitare urbane.' },
      { year: '1838', sort: 1838, text: 'Încep lucrările la spitalul Spiridoniei; miliția pământeană primește local propriu pentru Spitalul Militar.' },
      { year: '1841', sort: 1841, text: 'Spitalul „Spiridonia” este dat în folosință, cu 24 de paturi și personal medical propriu.' },
      { year: '1845', sort: 1845, text: 'Comunitatea israelită cere aprobarea pentru înființarea unui spital propriu.' },
      { year: '1846', sort: 1846, text: 'Domnitorul Mihail Sturza aprobă înființarea spitalului evreiesc din Galați.' },
      { year: '1853', sort: 1853, text: 'Medicul Iacob Felix este numit doctor al orașului și al carantinei Galați.' },
      { year: '1857', sort: 1857, text: 'Dr. Aristide Serfioti devine medic șef al Spitalului Militar din Galați.' },
      { year: '1860', sort: 1860, text: 'Mihail Kogălniceanu recomandă un spital pentru tratarea sifilisului; se înființează Spitalul Comunal.' },
      { year: '1862', sort: 1862, text: 'Elena Cuza donează 1.000 de galbeni pentru un nou local al Spitalului Spiridoniei, anexă cu 92 de paturi.' },
      { year: '1863', sort: 1863, text: 'Sunt menționate practici medicale populare și vindecători ambulanți în oraș.' },
      { year: '1869', sort: 1869, text: 'Evreilor li se acordă unele drepturi civile, favorizând și organizarea instituțiilor comunitare de sănătate.' },
      { year: '1871', sort: 1871, text: 'Orașul avea 11 medici, 5 farmaciști, 10 moașe și un spital comunal, potrivit raportului Moruzzi.' },
      { year: '1873', sort: 1873, text: 'Se deschid spitale pentru holerici; Primăria contractează localuri pentru Spitalul Comunal.' },
      { year: '1875', sort: 1875, text: 'Spitalul „Izolarea” primește o aripă nouă pentru dalac, difterie, tetanos și boli contagioase.' },
      { year: '1878', sort: 1878, text: 'Spitalele rusești din Galați sunt afectate de tifos în timpul Războiului de Independență.' },
      { year: '1879', sort: 1879, text: 'Se discută extinderea serviciilor medicale și sanitare în contextul dezvoltării urbane.' },
      { year: '1882', sort: 1882, text: 'Spitalul „Elisabeta Doamna” organizează o casă de sănătate.' },
      { year: '1884', sort: 1884, text: 'Se construiește Spitalul Militar al Corpului III de Armată, cu 88 de paturi.' },
      { year: '1885', sort: 1885, text: 'Consiliul de igienă stabilește măsuri pentru prevenirea holerei, salubritate, școli și serviciul sanitar public.' },
      { year: '1886', sort: 1886, text: 'Spitalul „Elisabeta Doamna” își extinde patrimoniul și urmărește construirea unui local nou.' },
      { year: '1888', sort: 1888, text: 'Spitalul „Elisabeta Doamna” primește donații importante pentru susținerea activității.' },
      { year: '1889', sort: 1889, text: 'Farmaciile și serviciile medicale locale sunt tot mai prezente în viața urbană.' },
      { year: '1891', sort: 1891, text: 'Spitalul „Elisabeta Doamna” raportează 4.479 de pacienți internați în cinci ani.' },
      { year: '1892', sort: 1892, text: 'Raportul sanitar consemnează holeră, sifilis, TBC, dizenterie și pelagră.' },
      { year: '1893', sort: 1893, text: 'Bolnavii de holeră sunt tratați într-un spital de izolare aflat în afara orașului.' },
      { year: '1895', sort: 1895, text: 'Galațiul avea patru spitale, 202 paturi și personal sanitar numeros: medici, moașe, dentiști, veterinari și farmaciști.' },
      { year: '1896', sort: 1896, text: 'Epidemia de scarlatină continuă; rapoartele sanitare urmăresc mortalitatea infantilă și bolile contagioase.' },
      { year: '1899', sort: 1899, text: 'Constantin Ținc primește autorizație pentru o clădire cu farmacie, laborator și locuință.' },
      { year: '1900', sort: 1900, text: 'Uzinele Comunale modernizează infrastructura de apă, electricitate și tramvai, cu impact asupra igienei urbane.' },
      ...curatedCategoryAdditions.spital,
    ];

    const curatedConsulateEvents = [
      { year: '1760', sort: 1760, text: 'Consulul francez Claude-Charles de Peyssonnel descrie șantierele navale din Galați și rolul lor comercial.' },
      { year: '1775', sort: 1775, text: 'Imperiul Rus înființează primul consulat la Galați.' },
      { year: '1783', sort: 1783, text: 'Consulul austriac Ignațiu Ștefan Raicevich notează construcția continuă de nave comerciale și militare în șantierele gălățene.' },
      { year: '1805', sort: 1805, text: 'Franța și Anglia înființează vice-consulate la Galați.' },
      { year: '1822', sort: 1822, text: 'Consulul austriac Stephen Raicevich menționează numeroase vase turcești ancorate vara la Galați și Brăila.' },
      { year: '1830', sort: 1830, text: 'Se deschid mai multe consulate străine, semn al creșterii importanței portului.' },
      { year: '1835', sort: 1835, text: 'Este înființat Consulatul Greciei, cu rang de vice-consulat.' },
      { year: '1837', sort: 1837, text: 'Regimul de porto-franco amplifică rolul consular și comercial al Galațiului.' },
      { year: '1838', sort: 1838, text: 'Baronul Roussin, ambasadorul Franței pe lângă Înalta Poartă, descrie Galațiul ca centru al comerțului Moldovei și Basarabiei.' },
      { year: '1842', sort: 1842, text: 'Consulul Franței oferă o estimare demografică și economică a orașului, folosită ulterior în istoriografia locală.' },
      { year: '1848', sort: 1848, text: 'Consulii străini intervin în contextul holerei și al tensiunilor revoluționare.' },
      { year: '1850', sort: 1850, text: 'Statele Unite înființează un viceconsulat la Galați.' },
      { year: '1853', sort: 1853, text: 'Consulatele urmăresc incidentele antisemite generate de marinari străini în port.' },
      { year: '1855', sort: 1855, text: 'Comisia Europeană a Dunării își stabilește sediul la Galați, consolidând prezența diplomatică internațională.' },
      { year: '1857', sort: 1857, text: 'Este înființat un viceconsulat american la Galați.' },
      { year: '1858', sort: 1858, text: 'Viceconsulatul Statelor Unite este ridicat la rang de consulat.' },
      { year: '1861', sort: 1861, text: 'Consulul francez Bouillot notează refacerea orașului datorită regimului de port franc.' },
      { year: '1867', sort: 1867, text: 'Vizita principelui Carol la Galați are loc într-un cadru diplomatic și consular activ.' },
      { year: '1869', sort: 1869, text: 'Prințul Carol trece prin Galați alături de baronul Offenberg, consulul Rusiei la București.' },
      { year: '1878', sort: 1878, text: 'Consulul Rusiei decorează orașul Galați cu „Crucea Sfântului Stanislav” pentru sprijinul din Războiul de Independență.' },
      { year: '1896', sort: 1896, text: 'Este recepționat Palatul Comisiei Europene a Dunării, sediu al secretariatului, arhivei și ședințelor comisiei.' },
      { year: '1899', sort: 1899, text: 'Comunitatea elenă își consolidează statutul juridic, în continuitatea prezenței consulare și comerciale grecești.' },
      ...curatedCategoryAdditions.consulat,
    ];

    const curatedPressEvents = [
      { year: '1832', sort: 1832, text: 'Primele mențiuni tipărite despre instituțiile locale apar în contextul Regulamentului Organic și al administrației moderne.' },
      { year: '1840', sort: 1840, text: 'Galațiul apare în presa comercială a epocii ca oraș de tranzacție și port în creștere.' },
      { year: '1847', sort: 1847, text: 'Francisc Monferrato deschide „Tipografia jurnalului de Galați”, prima tipografie locală importantă.' },
      { year: '1857', sort: 1857, text: 'Presa străină și corespondențele consulare urmăresc incidentele și tensiunile din orașul-port.' },
      { year: '1863', sort: 1863, text: 'Apar relatări memorialistice despre viața cotidiană, iernile grele și administrația urbană.' },
      { year: '1867', sort: 1867, text: 'Vizita principelui Carol și conflictele locale intră în circuitul știrilor politice.' },
      { year: '1871', sort: 1871, text: 'Raportul Moruzzi descrie orașul în detaliu și devine sursă de referință pentru presa și administrația locală.' },
      { year: '1873', sort: 1873, text: 'Apare Tipografia „Comercială” a lui Isidor Schenk, devenită ulterior Institutul Grafic „Schenk-Burbea”.' },
      { year: '1876', sort: 1876, text: '„Vocea Covurluiului” publică știri despre concentrarea trupelor și viața publică locală.' },
      { year: '1877', sort: 1877, text: 'Presa relatează efectele Războiului de Independență asupra portului, cerealelor și armatei.' },
      { year: '1878', sort: 1878, text: '„Vocea Covurluiului” publică articole despre iluminat, siguranță și probleme de cartier.' },
      { year: '1879', sort: 1879, text: 'Presa urmărește mutările instituțiilor, reparațiile navale și viața eparhială.' },
      { year: '1882', sort: 1882, text: 'Apare ziarul „Galații”, unul dintre titlurile importante ale presei locale de secol XIX.' },
      { year: '1885', sort: 1885, text: 'Raportul consiliului de igienă este tipărit la Ion Nebunelli, semn al rolului tipografiilor în administrația publică.' },
      { year: '1886', sort: 1886, text: '„Gazeta de Focșani” devine „Gazeta de Galați”, foaie a publicațiilor oficiale ale Curții de Apel Galați.' },
      { year: '1887', sort: 1887, text: 'Timoleon Nebuneli, tipograf, librar și scriitor, ajunge primar al orașului.' },
      { year: '1888', sort: 1888, text: 'Apar „Le Danube” și „Bursa de Galați”, publicații legate de viața comercială și politică a portului.' },
      { year: '1889', sort: 1889, text: 'Apare publicația bilunară „Biserica”; Biblioteca „V.A. Urechia” este înființată prin decret regal.' },
      { year: '1890', sort: 1890, text: 'Ziarul „Galații” publică apeluri filantropice și știri civice.' },
      { year: '1892', sort: 1892, text: '„Bursa de Galați” apare la Tipografia „Unirea” până în august.' },
      { year: '1893', sort: 1893, text: 'Ziarele publică buletine zilnice despre epidemia de holeră și măsurile sanitare.' },
      { year: '1895', sort: 1895, text: 'Rapoartele sanitare și administrative continuă să fie publicate prin tipografiile locale.' },
      { year: '1896', sort: 1896, text: 'Presa și rapoartele oficiale documentează epidemii, instituții publice și activitatea Comisiei Europene a Dunării.' },
      { year: '1897', sort: 1897, text: 'Apar mai multe titluri: „Clopotul”, „Vocea Orientului”, „Pământeanul”, „Ciuperca” și „Sfârșit de veac”.' },
      { year: '1899', sort: 1899, text: '„Foaia Populară” publică știri politice și necrologuri ale personalităților locale.' },
      ...curatedCategoryAdditions.ziar,
    ];

    const curatedCultEvents = [
      { year: '1445', sort: 1445, text: 'Prima atestare a târgului Galați apare într-un uric legat de Mănăstirea Humor.' },
      { year: '1581', sort: 1581, text: 'Sava Topa ctitorește mănăstirea Sf. Ioan Botezătorul de la Tiglina, ulterior dispărută prin surparea malului.' },
      { year: '1618', sort: 1618, text: 'Este atestată mănăstirea Sf. Dumitru, ctitorită de marele vornic Cârstea.' },
      { year: '1631-1633', sort: 1631, text: 'Catolicii ridică prima biserică romano-catolică din lemn, pe malul Dunării.' },
      { year: '1639-1641', sort: 1639, text: 'Vasile Lupu zidește mănăstirea domnească Sf. Dimitrie, aproape de schele.' },
      { year: '1641', sort: 1641, text: 'Moaștele Sf. Parascheva trec prin Galați; clopotele bisericii Sf. Dumitru bat pentru eveniment.' },
      { year: '1642', sort: 1642, text: 'Patriarhul Atanasie Patelarie se refugiază la biserica Sf. Nicolae din Galați.' },
      { year: '1643', sort: 1643, text: 'Bartolomeo Basetti menționează șase biserici ortodoxe și o mănăstire cu opt călugări.' },
      { year: '1647', sort: 1647, text: 'Este terminată Biserica fortificată Precista, una dintre cele mai importante clădiri istorice ale orașului.' },
      { year: '1648', sort: 1648, text: 'Este ridicată o altă biserică Sf. Dimitrie, arsă în timpul Eteriei.' },
      { year: '1653', sort: 1653, text: 'Patriarhul Macarie al III-lea Zaim este găzduit la mănăstirea Sf. Dimitrie.' },
      { year: '1660', sort: 1660, text: 'Mănăstirea Sf. Nicolae este închinată Mănăstirii Sf. Ecaterina de pe Sinai.' },
      { year: '1664', sort: 1664, text: 'Este sfințită mănăstirea Sf. Gheorghe, de pe malul Dunării, vecină cu Precista.' },
      { year: '1669', sort: 1669, text: 'Încep lucrările la Mavromol și este construită prima biserică armenească.' },
      { year: '1671', sort: 1671, text: 'La biserica romano-catolică funcționa o școală condusă de preotul Antonio Rossi.' },
      { year: '1702', sort: 1702, text: 'Este terminată biserica mănăstirii Mavromol, singura biserică domnească păstrată până azi în Galați.' },
      { year: '1709', sort: 1709, text: 'Trupul hatmanului Ivan Mazepa este depus temporar la Precista, apoi la Sf. Gheorghe.' },
      { year: '1710', sort: 1710, text: 'Mazepa este reînhumat la mănăstirea Sf. Gheorghe.' },
      { year: '1711', sort: 1711, text: 'După Stănilești, mănăstirile Precista și Sf. Gheorghe sunt jefuite și profanate.' },
      { year: '1712', sort: 1712, text: 'Pe locul vechii mănăstiri Sf. Nicolae se ridică biserica păstrată până astăzi.' },
      { year: '1739', sort: 1739, text: 'Războiul ruso-turc aduce un nou incendiu: ard Precista și pivnița bisericii catolice.' },
      { year: '1740', sort: 1740, text: 'Mănăstirea Sf. Nicolae devine metoc al Mănăstirii Neamț.' },
      { year: '1758', sort: 1758, text: 'Călătorul Borzysławski notează înmormântări zilnice într-o mănăstire grecească, în timpul ciumei.' },
      { year: '1765', sort: 1765, text: 'Mănăstirea Mavromol primește școala domnească organizată prin hrisov.' },
      { year: '1790', sort: 1790, text: 'Se ridică Biserica Vovidenia, în jurul căreia se formează Mahalaua Vovideniei.' },
      { year: '1800', sort: 1800, text: 'Preotul Gh. Avram de la Vovidenia devine protopop al județului Covurlui.' },
      { year: '1802', sort: 1802, text: 'Începe zidirea bisericii Sf. Arhangheli Metoc; cutremurul afectează mai multe biserici.' },
      { year: '1803', sort: 1803, text: 'Mavromol este atestată ca centru școlar, iar Sf. Mihail și Gavril apare ca biserică prădată în război.' },
      { year: '1804', sort: 1804, text: 'Biserica Sf. Dumitru a Badiului primește scutiri domnești pentru venituri.' },
      { year: '1805', sort: 1805, text: 'Este terminată biserica Sf. Arhangheli Metoc.' },
      { year: '1808', sort: 1808, text: 'Mănăstirea Badiului, situată mai sus de Precista, este consemnată ca ruinată.' },
      { year: '1809', sort: 1809, text: 'Generalul rus Prozorovski este înmormântat la mănăstirea Sf. Nicolae.' },
      { year: '1821', sort: 1821, text: 'Eteria și represaliile otomane incendiază aproape toate lăcașurile de cult din oraș.' },
      { year: '1826', sort: 1826, text: 'Litografiile vieneze redau silueta bisericilor de pe faleza Galațiului.' },
      { year: '1827', sort: 1827, text: 'Este sfințită biserica Sf. Arhangheli-Mantu, iar Mahalaua Sf. Voievozi începe să se contureze.' },
      { year: '1829', sort: 1829, text: 'După războiul ruso-turc se desființează Mitropolia Proilaviei.' },
      { year: '1832', sort: 1832, text: 'Orașul avea 14 biserici; la Sf. Arhangheli-Metoc se deschide prima școală românească din județ.' },
      { year: '1836', sort: 1836, text: 'Se fixează parcela pentru noua biserică catolică, viitoarea catedrală romano-catolică.' },
      { year: '1837', sort: 1837, text: 'Bisericile Sf. Spiridon și Sf. Nicolae apar în documentele de organizare urbană.' },
      { year: '1841', sort: 1841, text: 'Mavromol este restaurată după degradările provocate de vechime și cutremure.' },
      { year: '1844', sort: 1844, text: 'Este menționată biserica catolică în contextul cartierelor și instituțiilor portuare.' },
      { year: '1846', sort: 1846, text: 'Se construiește din zid biserica Sf. Ioan de pe strada Brăilei.' },
      { year: '1847', sort: 1847, text: 'Biserica Precista este rezidită din piatră.' },
      { year: '1848', sort: 1848, text: 'Sunt semnalate lucrări și comunități în jurul bisericilor catolice, ortodoxe și armenești.' },
      { year: '1853', sort: 1853, text: 'Marinari străini provoacă incidente antisemite, urmărite de autorități și consulate.' },
      { year: '1854', sort: 1854, text: 'Se formează Mahalaua Movilei, în apropierea bisericii Sf. Haralambie.' },
      { year: '1855', sort: 1855, text: 'Biserica Precista și alte lăcașuri apar în relatări despre port și despre refacerea orașului.' },
      { year: '1857', sort: 1857, text: 'Sunt menționate instituții ale Eparhiei Dunării de Jos și restaurări la Precista și Mavromol.' },
      { year: '1858', sort: 1858, text: 'Se încheie contractul de restaurare a bisericii Mavromol; biserica primește forma păstrată azi.' },
      { year: '1860', sort: 1860, text: 'Comunitatea bulgară cere aprobarea pentru biserica Sf. Pantelimon.' },
      { year: '1861', sort: 1861, text: 'Începe construcția bisericii bulgărești Sf. Pantelimon și a bisericii lipovenești Sf. Nicolae.' },
      { year: '1863', sort: 1863, text: 'Este sfințit Cimitirul Eternitatea, iar comunitățile religioase primesc spațiu comun de înhumare.' },
      { year: '1864', sort: 1864, text: 'Legea interzice înmormântările lângă biserici și impune cimitire comunale la marginea orașului.' },
      { year: '1865', sort: 1865, text: 'Melchisedec Ștefănescu devine titularul Episcopiei Dunării de Jos; la Mavromol se toarnă clopotul cel mare.' },
      { year: '1867', sort: 1867, text: 'Sunt semnalate tensiuni în jurul templului evreiesc și al lăcașurilor comunitare.' },
      { year: '1868', sort: 1868, text: 'Bisericile și școlile confesionale rămân repere ale organizării cartierelor.' },
      { year: '1871', sort: 1871, text: 'Biserica bulgărească Sf. Pantelimon devine reper pentru comunitatea bulgară.' },
      { year: '1872', sort: 1872, text: 'Este sfințită biserica elenă „Schimbarea la Față”.' },
      { year: '1873', sort: 1873, text: 'Uzina de apă este proiectată cu puncte de distribuție lângă biserici și piețe.' },
      { year: '1875', sort: 1875, text: 'Episcopul Melchisedec sfințește biserica Nașterea Maicii Domnului din Vadu Ungurului.' },
      { year: '1878', sort: 1878, text: 'Eparhia Dunării de Jos și episcopul Melchisedec apar în viața publică postbelică.' },
      { year: '1879', sort: 1879, text: 'Teritoriul Eparhiei Dunării de Jos este reorganizat prin includerea districtelor de peste Dunăre.' },
      { year: '1881', sort: 1881, text: 'Comunitatea elenă și instituțiile ei confesionale sunt menționate în viața urbană.' },
      { year: '1886', sort: 1886, text: 'Biserica Sf. Dumitru este închisă din cauza degradării; este sfințită biserica Trei Ierarhi.' },
      { year: '1887', sort: 1887, text: 'Biserica bulgărească Sf. Pantelimon este sfințită după lucrări începute cu decenii înainte.' },
      { year: '1889', sort: 1889, text: 'Apare publicația „Biserica”; comunitatea israelită organizează școala Talmud Thora lângă sinagogă.' },
      { year: '1893', sort: 1893, text: 'Legea clerului mirean duce la desființarea Seminarului Teologic ortodox din Galați.' },
      { year: '1898', sort: 1898, text: 'Episcopul Partenie Clinceni pune piatra de temelie a Palatului Episcopal; la Mavromol se repară icoana hramului.' },
      { year: '1900', sort: 1900, text: 'Palatul Episcopal este finalizat, iar instituțiile eparhiale se consolidează în centrul orașului.' },
      ...curatedCategoryAdditions.biserica,
    ];

    const curatedPortTransportEvents = [
      { year: '1445', sort: 1445, text: 'Prima atestare a Galațiului este legată de transportul peștelui din schela dunăreană spre Mănăstirea Humor.' },
      { year: '1595', sort: 1595, text: 'Harta „Moldaviae finitimarumque regionum typus” notează Galațiul ca așezare dunăreană și schelă comercială.' },
      { year: '1647', sort: 1647, text: 'Precista primește inclusiv un caiac în schelă, semn al legăturii dintre mănăstiri și activitatea portuară.' },
      { year: '1733', sort: 1733, text: 'Vama Galațiului apare ca sursă de venit pentru biserica Sf. Dumitru a Badiului.' },
      { year: '1760', sort: 1760, text: 'Mendel înființează ateliere de reparații navale, iar consulul francez Peyssonnel descrie șantierele navale locale.' },
      { year: '1829', sort: 1829, text: 'Pacea de la Adrianopol redeschide navigația liberă pe Dunăre și schimbă rolul Galațiului.' },
      { year: '1836', sort: 1836, text: 'Extinderea orașului spre deal urmărește organizarea modernă a târgului și a zonei portuare.' },
      { year: '1837', sort: 1837, text: 'Galațiul devine port franc; portul se dezvoltă rapid prin cheiuri, magazii și trafic comercial intens.' },
      { year: '1855', sort: 1855, text: 'Se construiește prima linie telegrafică Galați-Iași, extinsă ulterior spre Sulina și Ismail.' },
      { year: '1862', sort: 1862, text: 'Se finalizează șoseaua Galați-Brăila și încep curse fluviale zilnice de pasageri între cele două orașe.' },
      { year: '1872', sort: 1872, text: 'Greva căruțașilor din port arată tensiunile sociale create de munca portuară.' },
      { year: '1878', sort: 1878, text: 'Portul și transporturile locale sunt puternic influențate de Războiul de Independență și de circulația militară.' },
      { year: '1879', sort: 1879, text: 'Statul alocă fonduri pentru repararea navelor, șlepurilor și extinderea Arsenalului Flotilei.' },
      { year: '1883', sort: 1883, text: 'Statutul de porto-franco încetează; Vlahuță descrie portul cu sute de vase, docuri, gări și magazii.' },
      { year: '1887', sort: 1887, text: 'Încep lucrările la docuri; se inaugurează prima linie telefonică între instituțiile locale.' },
      { year: '1890', sort: 1890, text: 'Recensământul arată un oraș portuar divers, cu numeroase comunități implicate în comerț și servicii.' },
      { year: '1895', sort: 1895, text: 'Se discută concesionarea tramvaiului electric și modernizarea transportului urban.' },
      { year: '1899', sort: 1899, text: 'Comunitățile comerciale își consolidează statutul juridic într-un oraș-port tot mai modernizat.' },
      { year: '1900', sort: 1900, text: 'Se înființează Uzinele Comunale Galați, cu apă, electricitate și tramvai.' },
      ...curatedCategoryAdditions.port,
      ...curatedCategoryAdditions.tramvai,
    ];

    const curatedMonumentEvents = [
      { year: '1841', sort: 1841, text: 'Țiglina este propusă ca spațiu public pentru tabere, târgoveți și activități ale orașului.' },
      { year: '1855', sort: 1855, text: 'Modernizarea centrului începe prin demolarea dughenelor de lemn și înlocuirea lor cu construcții de zid.' },
      { year: '1861', sort: 1861, text: 'Grădina Publică este parcelată, plantată și amenajată cu seră, fântâni, bazin, bufet și pavilion pentru fanfară.' },
      { year: '1863', sort: 1863, text: 'Conflictul de la Costangalia intră în memoria militară locală prin răniți, morți și mobilizarea trupelor din Galați.' },
      { year: '1875', sort: 1875, text: 'Uzina de Apă și punctele publice de distribuție devin repere ale modernizării urbane.' },
      { year: '1879', sort: 1879, text: 'Se înființează Arsenalul Flotilei, reper militar și industrial al orașului.' },
      { year: '1881', sort: 1881, text: 'Reședința Episcopiei Dunării de Jos este stabilită la Galați, consolidând rolul civic al orașului.' },
      { year: '1892', sort: 1892, text: 'George Ulise Negroponte donează case pentru Școala secundară de fete și, ulterior, teren pentru Monumentul Eroilor de la Mărășești.' },
      { year: '1893', sort: 1893, text: 'Cimitirul Eternitatea devine reper de izolare sanitară și memorie urbană, în contextul epidemiei de holeră.' },
      ...curatedCategoryAdditions.monument,
    ];

    const curatedCommunityEvents = [
      { year: '1590', sort: 1590, text: 'Ia ființă primul cimitir evreiesc, în valea orașului.' },
      { year: '1629', sort: 1629, text: 'Este amenajat al doilea cimitir evreiesc, pe strada Pescarilor din Bădălan.' },
      { year: '1675', sort: 1675, text: 'Medicul italian Giovanni Mascellini moare la Galați și este îngropat în cimitirul bisericii romano-catolice.' },
      { year: '1769', sort: 1769, text: 'Sursele menționează prezența evreilor în viața comercială a orașului.' },
      { year: '1780', sort: 1780, text: 'Este ridicată Sinagoga Mare pe strada Podul de Piatră, sediu timpuriu al Epitropiei israelite.' },
      { year: '1802', sort: 1802, text: 'Călătorul englez Wittman descrie un oraș cu români, greci, evrei, armeni, turci, unguri și italieni.' },
      { year: '1821', sort: 1821, text: 'Incendiile și luptele din timpul Eteriei afectează și sinagogile orașului.' },
      { year: '1836', sort: 1836, text: 'Extinderea spre Târgul Nou schimbă așezarea comunităților și a mahalalelor.' },
      { year: '1845', sort: 1845, text: 'Catagrafia notează 208 familii evreiești, cu negustori, bancheri, meșteri, slugi și persoane nevoiașe.' },
      { year: '1846', sort: 1846, text: 'Domnitorul Mihail Sturza aprobă înființarea unui spital evreiesc la Galați.' },
      { year: '1847', sort: 1847, text: 'Tipografia Monferrato publică lucrări legate de istoria și memoria cimitirelor europene.' },
      { year: '1848', sort: 1848, text: 'Cimitirul de holerici devine locul pe care este ridicată biserica Sf. Haralambie.' },
      { year: '1852', sort: 1852, text: 'Comunitatea evreiască ridică Sinagoga Mare pe strada Marc Aureliu.' },
      { year: '1853', sort: 1853, text: 'Sunt consemnate manifestări antisemite în port, oprite de autorități înainte să se extindă.' },
      { year: '1855', sort: 1855, text: 'Orașul-port adună negustori, marinari și comunități străine active în comerțul dunărean.' },
      { year: '1857', sort: 1857, text: 'Autoritățile intervin împotriva obiceiului violent al „evreilor de paie”, practicat de unii corăbieri.' },
      { year: '1860', sort: 1860, text: 'Viața economică a orașului include prăvălii românești, grecești, evreiești, armenești și turcești.' },
      { year: '1863', sort: 1863, text: 'Cimitirele și zona sanitară de la marginea orașului apar tot mai des în rapoartele publice.' },
      { year: '1864', sort: 1864, text: 'Cimitirul ortodox Eternitatea intră în procesul de organizare ca spațiu memorial urban.' },
      { year: '1867', sort: 1867, text: '„Înecurile de la Galați” provoacă proteste consulare și rămân un episod grav de violență antisemită.' },
      { year: '1869', sort: 1869, text: 'Măsurile guvernului Kogălniceanu permit întoarcerea unor evrei expulzați și favorizează școlile israelite.' },
      { year: '1876', sort: 1876, text: 'Comunitatea israelită hotărăște înființarea unei noi școli primare.' },
      { year: '1879', sort: 1879, text: 'Cimitirele și instituțiile comunitare sunt prinse în modernizarea administrativă a orașului.' },
      { year: '1885', sort: 1885, text: 'Rapoartele sanitare menționează cimitire, spații insalubre și măsuri de igienă publică.' },
      { year: '1889', sort: 1889, text: 'Pe strada Română se deschide școala Talmud Thora, sprijinită de societatea culturală omonimă.' },
      { year: '1890', sort: 1890, text: 'Recensământul notează un oraș foarte divers: români, evrei, greci, unguri, germani, bulgari, ruși, italieni, armeni și alte comunități.' },
      { year: '1891', sort: 1891, text: 'Valea orașului este descrisă ca spațiu dens și multicultural, cu locuitori, prăvălii și ateliere de numeroase origini.' },
      { year: '1892', sort: 1892, text: 'Comunitățile comerciale și filantropice apar frecvent în presa și rapoartele locale.' },
      { year: '1893', sort: 1893, text: 'Societatea israelită „Maimonides” distribuie reguli și ajutoare preventive în timpul holerei.' },
      { year: '1895', sort: 1895, text: 'Comunitatea Israelită înființează pe strada Dinogeției un azil de trecători.' },
      { year: '1897', sort: 1897, text: 'Apare „Pământeanul”, organ al Asociațiunii Generale a Israeliților Pământeni.' },
      { year: '1899', sort: 1899, text: 'Sunt adoptate Statutele Comunității Elene, iar comunitatea israelită organizează prima școală israelito-română de fete.' },
      ...curatedCategoryAdditions.evrei,
      ...curatedCategoryAdditions.cimitir,
    ];

    const curatedCultureEvents = [
      { year: '1847', sort: 1847, text: 'Franz Liszt trece prin Galați, unde este primit festiv în drumul său spre Odessa.' },
      { year: '1853', sort: 1853, text: 'Profesorul Luigi Ademolo deschide un mic teatru pe locul Hanului Ventura, cu piese și operete.' },
      { year: '1860', sort: 1860, text: 'Fany Tardini joacă la Galați cu trupa sa, readucând teatrul românesc în atenția publicului local.' },
      { year: '1870', sort: 1870, text: 'Fany Tardini revine în oraș cu spectacolul „Nebuna de la șapte turnuri”.' },
      { year: '1879', sort: 1879, text: 'În timpul vizitei principelui Carol, elitele locale participă la un spectacol de teatru grec.' },
      { year: '1900', sort: 1900, text: 'La Teatrul Papadopol, Fani Tardini dă ultima reprezentație, iar I. L. Caragiale ține o conferință.' },
      ...curatedCategoryAdditions.teatru,
    ];

    function eventRows(categoryOrCategories) {
      const categories = Array.isArray(categoryOrCategories) ? categoryOrCategories : [categoryOrCategories];
      const extracted = entries
        .filter(e => categories.some(cat => (e.categories || []).includes(cat)))
        .map(e => ({ ...e, sort: e.year || 0 }));
      const curated = categories.flatMap(cat => (curatedCategoryAdditions[cat] || []).map(e => ({
        year: e.year,
        year_end: null,
        text: e.text,
        categories: [cat],
        sort: e.sort,
      })));
      return [...extracted, ...curated].sort((a,b) => (a.sort || 0) - (b.sort || 0));
    }

    function factoryRows() {
      return [
        ...r.factories.map(f => ({ year: String(f.year), sort: f.year, text: f.text })),
        ...curatedCategoryAdditions.fabrica,
      ].sort((a,b) => (a.sort || 0) - (b.sort || 0));
    }

    const SECTION_ICONS = {
      parcalabi: 'shield',
      primari: 'landmark',
      populatie: 'users',
      scoli: 'graduation-cap',
      spitale: 'cross',
      consulate: 'flag',
      presa: 'newspaper',
      biserici: 'church',
      'port-transport': 'anchor',
      monumente: 'columns',
      comunitati: 'network',
      cultura: 'theater',
      case: 'house',
      cutremure: 'activity',
      razboaie: 'swords',
      epidemii: 'virus',
      incendii: 'flame',
      inundatii: 'waves',
      fabrici: 'factory',
    };

    const ICON_PATHS = {
      activity: '<path d="M22 12h-4l-3 8-6-16-3 8H2"/>',
      anchor: '<path d="M12 22V8"/><path d="M5 12H2a10 10 0 0 0 20 0h-3"/><circle cx="12" cy="5" r="3"/>',
      church: '<path d="M10 9h4"/><path d="M12 7v5"/><path d="M6 21V10l6-5 6 5v11"/><path d="M9 21v-6h6v6"/><path d="M4 21h16"/>',
      columns: '<path d="M4 21h16"/><path d="M6 18V9"/><path d="M10 18V9"/><path d="M14 18V9"/><path d="M18 18V9"/><path d="M3 9h18L12 3 3 9Z"/>',
      cross: '<path d="M12 5v14"/><path d="M5 12h14"/>',
      factory: '<path d="M3 21h18"/><path d="M5 21V9l5 4V9l5 4V5h4v16"/><path d="M9 18h1"/><path d="M14 18h1"/>',
      flag: '<path d="M5 22V4"/><path d="M5 4h11l-1.5 4L16 12H5"/>',
      flame: '<path d="M12 22c4 0 7-3 7-7 0-3-2-5-4-7 .2 2-.7 3.2-2 4-1.7-2-2-4-1-7-3 2-6 5-6 10 0 4 3 7 6 7Z"/><path d="M12 22c-1.7 0-3-1.3-3-3 0-1.4.9-2.4 2-3 .2 1.3.9 2.1 2 2.7.7-.5 1.1-1.2 1.2-2 .8.8 1.3 1.8 1.3 3.1 0 1.7-1.6 2.2-3.5 2.2Z"/>',
      'graduation-cap': '<path d="M22 10 12 5 2 10l10 5 10-5Z"/><path d="M6 12v5c3 2 9 2 12 0v-5"/><path d="M22 10v6"/>',
      house: '<path d="m3 11 9-8 9 8"/><path d="M5 10v11h14V10"/><path d="M9 21v-6h6v6"/>',
      landmark: '<path d="M3 21h18"/><path d="M5 18h14"/><path d="M6 18V9"/><path d="M10 18V9"/><path d="M14 18V9"/><path d="M18 18V9"/><path d="m12 3 9 6H3l9-6Z"/>',
      network: '<circle cx="6" cy="7" r="3"/><circle cx="18" cy="7" r="3"/><circle cx="12" cy="17" r="3"/><path d="M8.6 9.2 10.5 14"/><path d="m15.4 9.2-1.9 4.8"/><path d="M9 7h6"/>',
      newspaper: '<path d="M4 19.5A2.5 2.5 0 0 1 1.5 17V5h16v14.5"/><path d="M17.5 8H22v9a2.5 2.5 0 0 1-5 0"/><path d="M5 9h8"/><path d="M5 13h8"/><path d="M5 17h5"/>',
      shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/>',
      swords: '<path d="m14.5 17.5 3 3 3-3-3-3"/><path d="M3 21 21 3"/><path d="m6.5 17.5-3 3-3-3 3-3"/><path d="M21 21 3 3"/>',
      theater: '<path d="M3 6c4-2 7-2 11 0v6c0 4-2.5 7-5.5 8C5.5 19 3 16 3 12V6Z"/><path d="M10 5c3-1 6-1 11 1v6c0 4-2.5 7-5.5 8-1-.3-2-.8-2.8-1.5"/><path d="M7 10h.01"/><path d="M11 10h.01"/><path d="M7 15c1.2.8 2.8.8 4 0"/>',
      users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
      virus: '<circle cx="12" cy="12" r="5"/><path d="M12 2v3"/><path d="M12 19v3"/><path d="m4.22 4.22 2.12 2.12"/><path d="m17.66 17.66 2.12 2.12"/><path d="M2 12h3"/><path d="M19 12h3"/><path d="m4.22 19.78 2.12-2.12"/><path d="m17.66 6.34 2.12-2.12"/><path d="M10 10h.01"/><path d="M14 14h.01"/>',
      waves: '<path d="M2 12c2 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2 2-2 4-2"/><path d="M2 17c2 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2 2-2 4-2"/>',
    };

    function sectionIcon(id) {
      const name = SECTION_ICONS[id];
      const paths = ICON_PATHS[name];
      if (!paths) return '';
      return `<svg class="cat-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;
    }

    // Section definitions: id, label, description, render function.
    const SECTIONS = [
      {
        id: 'parcalabi',
        label: 'Pârcălabi',
        desc: 'Reprezentanții domnești care administrau ținutul Covurlui din scaunul de la Galați. Funcția — moștenită din evul mediu moldovenesc — combina autoritatea militară, judiciară și fiscală peste port și ținut, până când reformele moderne (1832-1864) au desființat-o, înlocuind-o cu prefectul și primarul.',
        count: curatedParcalabi.length,
        render: () => renderTable(
          [_tcol('year_term', 'An / mandat'), _tcol('name', 'Nume')],
          curatedParcalabi.map(p => [
            { class: 'year', html: `<span class="span">${escapeHtml(p.span)}</span>` },
            { class: 'text', html: escapeHtml(p.name) },
          ])
        )
      },
      {
        id: 'primari',
        label: 'Primari',
        desc: 'Primii aleși și aleșii Galațiului din 1864 — anul Legii comunale a lui Cuza — până astăzi. Lista arată cum s-a alternat conducerea liberală cu cea conservatoare în Belle Époque, cum a fost suspendată în regimul carlist și legionar, transformată în comitet executiv comunist după 1948 și redevenită funcție electivă din 1990.',
        count: curatedPrimari.length,
        render: () => renderTable(
          [_tcol('term', 'Mandat'), _tcol('name', 'Nume'), _tcol('profession_party', 'Profesie / Partid')],
          curatedPrimari.map(p => {
            const span = p.start === p.end ? p.start : `${p.start} – ${p.end}`;
            const meta = [p.role, p.party].filter(Boolean).join(' · ');
            return [
              { class: 'year', html: `<span class="span">${escapeHtml(span)}</span>` },
              { class: 'text', html: `<strong>${escapeHtml(p.name)}</strong>` },
              { class: 'text', html: escapeHtml(meta) || '—' },
            ];
          })
        )
      },
      {
        id: 'populatie',
        label: 'Populație',
        desc: 'Numărul de locuitori ai Galațiului prin secole — de la târgul pescăresc moldovean de câteva mii de suflete, la portul liber cosmopolit de 80.000 din Belle Époque, la orașul industrial de peste 300.000 în comunism, până la declinul demografic post-1989. Fiecare cifră este o oglindă a momentului: pace sau război, port liber sau vamă, prosperitate sau exod.',
        count: curatedPopulation.length,
        render: () => renderTable(
          [_tcol('year', 'An'), _tcol('population', 'Locuitori'), _tcol('source', 'Sursă')],
          curatedPopulation.map(p => [
            { class: 'year', html: String(p.year) },
            { class: 'value', html: `${formatNum(p.pop)}<span class="unit">${_tcol('unit.inhabitants', 'loc.')}</span>` },
            { class: 'text', html: escapeHtml(p.src) },
          ])
        )
      },
      {
        id: 'scoli',
        label: 'Școli / educație',
        desc: 'De la prima școală domnească din Metoc (sec. XVIII), la rețeaua complexă de școli confesionale ale comunităților (greci, evrei, germani, armeni, italieni, lipoveni), la liceele clasice ale Belle Époque-ului — „Vasile Alecsandri”, „Costache Negri”, Notre Dame de Sion — și până la sistematizarea învățământului în era comunistă. Educația a fost dintotdeauna mizele cele mai mari ale Galațiului cosmopolit.',
        count: curatedEducationEvents.length,
        render: () => renderChronologyTable(curatedEducationEvents)
      },
      {
        id: 'spitale',
        label: 'Spitale / sănătate',
        desc: 'Sistemul medical al unui port care a fost dintotdeauna prima poartă de intrare a epidemiilor pe Dunăre — ciumă, holeră, tifos. Primele spitale (Sf. Spiridon, Israelit, Militar), farmaciile epocii (Ținc, Helder, Reichmann), igiena publică, vaccinarea modernă și marile așezăminte ale secolului XX, până la Spitalul Județean.',
        count: curatedHealthEvents.length,
        render: () => renderChronologyTable(curatedHealthEvents)
      },
      {
        id: 'consulate',
        label: 'Consulate',
        desc: 'În 1837, când a fost declarat port liber, Galațiul a devenit oraș cu cea mai densă rețea consulară din Principate — peste 20 de state aveau aici reprezentanți. Comisia Europeană a Dunării (CED, 1856-1948), prima organizație supranațională europeană, a avut sediul aici. Lista urmărește această rețea diplomatică unică, marca portului cosmopolit.',
        count: curatedConsulateEvents.length,
        render: () => renderChronologyTable(curatedConsulateEvents)
      },
      {
        id: 'presa',
        label: 'Presă / tipografii',
        desc: 'Presa gălățeană a oglindit pulsul unui port liber: ziare politice de toate culorile (Vocea Galaților, Acțiunea, Curierul), reviste culturale (Dunărea de Jos), buletine comerciale și gazete în limbile comunităților (grecești, evreiești, italiene). Tipografiile locale au scos de la cărți școlare la cărți de literatură interbelică.',
        count: curatedPressEvents.length,
        render: () => renderChronologyTable(curatedPressEvents)
      },
      {
        id: 'biserici',
        label: 'Lăcașuri de cult',
        desc: 'Galațiul a fost unul dintre cele mai multi-confesionale orașe ale României: biserici ortodoxe moldovenești (Sf. Precista, Mavromol, Sf. Nicolae), greci, lipoveni, armeni, catolici, anglicani, evanghelici, plus 23 de sinagogi în interbelic. Fiecare comunitate avea în jurul lăcașului propria școală, propriul spital și cimitir — adevărate cartiere identitare.',
        count: curatedCultEvents.length,
        render: () => renderChronologyTable(curatedCultEvents)
      },
      {
        id: 'port-transport',
        label: 'Port / transport',
        desc: 'Galațiul a trăit prin Dunăre. Cronologia infrastructurii care a dus portul de la caice și șlepuri la cargouri internaționale: vapoare cu aburi, șantiere navale, telegraf, calea ferată Galați-București (1872), tramvaiul cu cai (1893) și apoi electric, șoseaua de centură, aeroportul 1920-1958 și marea modernizare portuară din anii ’60-’70.',
        count: curatedPortTransportEvents.length,
        render: () => renderChronologyTable(curatedPortTransportEvents)
      },
      {
        id: 'monumente',
        label: 'Monumente / spații publice',
        desc: 'Galațiul a construit, a dărâmat și a reconstruit ritualic spațiile sale publice. Piața Regală (distrusă 1944, niciodată reconstruită), Grădina Publică, Faleza Dunării, palatele primăriei și prefecturii, statuile lui Eminescu, Cuza, Costache Negri — fiecare epocă a pus și a scos monumente, lăsând straturi de memorie urbană suprapuse.',
        count: curatedMonumentEvents.length,
        render: () => renderChronologyTable(curatedMonumentEvents)
      },
      {
        id: 'comunitati',
        label: 'Comunități',
        desc: 'Greci, evrei, armeni, italieni, germani, bulgari, lipoveni, francezi, englezi — Galațiul a fost timp de un secol cel mai cosmopolit oraș al României. Fiecare comunitate a lăsat instituții (școli, spitale, cimitire), profesii (negustori, marinari, meșteșugari, bancheri) și uneori și răni — pogromuri, evacuări, naționalizări. Lista urmărește această țesătură umană.',
        count: curatedCommunityEvents.length,
        render: () => renderChronologyTable(curatedCommunityEvents)
      },
      {
        id: 'cultura',
        label: 'Teatru / cultură',
        desc: 'Trupele itinerante grecești și italiene ale secolului XIX, teatrele Papadopol și Nationale, marile turnee ale lui Caragiale și Vlahuță, prima trupă permanentă (Fani Tardini), Teatrul Dramatic de astăzi — și viața culturală secundară care le-a hrănit: cenacluri, cafenele, librării, conferințe publice.',
        count: curatedCultureEvents.length,
        render: () => renderChronologyTable(curatedCultureEvents)
      },
      {
        id: 'case',
        label: 'Nr. case',
        desc: 'Câte case avea Galațiul prin secole. De la sub o mie de gospodării în târgul moldovean al secolului XVIII, la cele câteva mii de la mijlocul XIX, la zecile de mii de locuințe ale orașului interbelic, până la blocurile masive Țiglina și Micro construite pentru a primi muncitorii de la Combinat. Fiecare salt arată o schimbare radicală a orașului.',
        count: curatedHouseholds.length,
        render: () => renderTable(
          [_tcol('year', 'An'), _tcol('houses', 'Case'), _tcol('context', 'Context')],
          curatedHouseholds.map(p => [
            { class: 'year', html: String(p.year) },
            { class: 'value', html: `${formatNum(p.value)}<span class="unit">${_tcol('unit.houses', 'case')}</span>` },
            { class: 'text', html: escapeHtml(p.ctx) },
          ])
        )
      },
      {
        id: 'cutremure',
        label: 'Cutremure',
        desc: 'Galațiul stă în zona de propagare a Vrancei, una dintre cele mai active falii din Europa. Marile seisme — 1738, 1802, 1940, 1977, 1990 — au remodelat orașul de fiecare dată: clădiri prăbușite, ziduri crăpate, ocazii pentru sistematizări urbane. Cronologia cutremurelor este și cronologia reconstrucțiilor.',
        count: curatedEarthquakes.length,
        render: () => renderChronologyTable(curatedEarthquakes)
      },
      {
        id: 'razboaie',
        label: 'Războaie / invazii',
        desc: 'Ca port la frontiera dintre imperii (otoman, rus, austriac), Galațiul a fost cucerit, asediat și incendiat repetat — în războaiele ruso-turce (1769, 1789, 1828), în Eteria 1821, în Primul Război Mondial (Bătălia de la Galați 1918), iar în 1944 armata germană în retragere a aruncat în aer Piața Regală și o parte mare a centrului.',
        count: curatedWarEvents.length,
        render: () => renderWarTable()
      },
      {
        id: 'epidemii',
        label: 'Epidemii',
        desc: 'Ca port internațional, Galațiul a fost prima poartă a marilor epidemii pe Dunăre: ciuma orientală (1652, 1729-1739, 1758), holera importată din Rusia (1830, 1873, 1893), tifosul soldaților în Primul Război Mondial, gripa spaniolă 1918-1920 și apoi pandemia COVID-19. Fiecare a impus carantine, lazaretsuri și schimbări în igiena publică.',
        count: curatedEpidemicEvents.length,
        render: () => renderEpidemicTable()
      },
      {
        id: 'incendii',
        label: 'Incendii',
        desc: 'Oraș construit secole întregi din lemn, Galațiul a ars de zeci de ori. Marile incendii — 1789 (războiul ruso-turc), 1821 (Eteria), 1851 (centrul comercial), 1908 (Teatrul Papadopol) — au șters cartiere întregi și au împins primăria să adopte regulamente moderne de construcție, paveaj și apărare împotriva focului.',
        count: curatedFires.length,
        render: () => renderChronologyTable(curatedFires)
      },
      {
        id: 'inundatii',
        label: 'Inundații',
        desc: 'Orașul de la confluența celor trei mari ape — Dunărea, Siretul și Prutul — a fost periodic inundat de viiturile lor. Marile ape din 1837, 1897, 1932, 1970, 2005, 2010 au inundat zonele joase (Bădălan, Faleza Inferioară, lunca Siretului), au impus construcția digurilor și a stației de pompare și au remodelat cartiere întregi.',
        count: curatedFloods.length,
        render: () => renderChronologyTable(curatedFloods)
      },
      {
        id: 'fabrici',
        label: 'Fabrici / uzine',
        desc: 'Galațiul a fost a doua mare platformă industrială a României, după București. De la primele mori de aburi și șantiere navale din Belle Époque (Fernic, Năvodul, Atlantic), la marile naționalizări din 1948, la mamutul siderurgic construit din temelii în 1966 (Combinatul, primii 12.000 muncitori), până la dezindustrializarea anilor ’90-2000 — fiecare epocă a lăsat coșuri și hale.',
        count: factoryRows().length,
        render: () => renderTable(
          [_tcol('year', 'An'), _tcol('attestation', 'Atestare')],
          factoryRows()
            .map(f => [
              { class: 'year', html: String(f.year) },
              { class: 'text', html: escapeHtml(f.text) },
            ])
        )
      },
    ];

    // Render TOC + sections
    // Helper i18n: dacă există cheia lists.section.<id>, folosim traducere; altfel label-ul nativ
    function _slabel(s) {
      const key = 'lists.section.' + s.id;
      if (typeof window.t === 'function') {
        const tr = window.t(key);
        if (tr && tr !== key) return tr;
      }
      return s.label;
    }
    // Helper i18n: descriere tradusă a unei secțiuni (lists.desc.<id>)
    function _sdesc(s) {
      const key = 'lists.desc.' + s.id;
      if (typeof window.t === 'function') {
        const tr = window.t(key);
        if (tr && tr !== key) return tr;
      }
      return s.desc;
    }
    // Helper i18n: titlu coloană dintr-o tabelă (lists.col.<key>); fallback la valoarea originală.
    function _tcol(key, fallback) {
      if (typeof window.t === 'function') {
        const full = 'lists.col.' + key;
        const tr = window.t(full);
        if (tr && tr !== full) return tr;
      }
      return fallback;
    }
    const tocEl = document.getElementById('toc');
    function _renderTOC() {
      const tocTitle = (typeof window.t === 'function') ? window.t('lists.toc.title') : 'Categorii';
      tocEl.innerHTML = '<p class="toc-title">' + escapeHtml(tocTitle) + '</p><ul>' +
        SECTIONS.map(s => `<li><a href="#${s.id}" data-id="${s.id}">${sectionIcon(s.id)}<span>${escapeHtml(_slabel(s))}</span><span class="n">${s.count}</span></a></li>`).join('') +
        '</ul>';
    }
    _renderTOC();

    const listsEl = document.getElementById('lists');
    function _renderSections() {
      listsEl.innerHTML = SECTIONS.map(s => `
        <details class="list-section" id="${s.id}">
          <summary>
            <span class="ls-label">${sectionIcon(s.id)}<span>${escapeHtml(_slabel(s))}</span></span>
            <span class="ls-count">${s.count}</span>
            <span class="ls-chevron" aria-hidden="true"></span>
          </summary>
          <div class="list-body" data-id="${s.id}">
            <p class="desc">${escapeHtml(_sdesc(s))}</p>
            <div class="list-body-table" data-id="${s.id}"></div>
          </div>
        </details>
      `).join('');
      SECTIONS.forEach(s => {
        const slot = listsEl.querySelector(`.list-body-table[data-id="${s.id}"]`);
        if (slot) slot.innerHTML = s.render();
      });
    }
    _renderSections();
    // Expun pentru re-render la langchange
    window.__renderListsTOC = function () { _renderTOC(); _renderSections(); };

    // Meta
    const totalEntries = entries.length;
    const totalRecords = SECTIONS.reduce((acc,s) => acc+s.count, 0);
    function _renderMeta() {
      const tr = (typeof window.t === 'function') ? window.t('lists.meta', { years: totalEntries, entries: totalRecords, sections: SECTIONS.length }) : null;
      document.getElementById('meta').textContent = (tr && tr !== 'lists.meta')
        ? tr
        : `${totalEntries} ani documentați · ${totalRecords} înregistrări extrase pe ${SECTIONS.length} liste`;
    }
    _renderMeta();
    // Re-render meta + secțiuni la schimbare de limbă
    window.addEventListener('langchange', () => {
      try {
        _renderMeta();
        if (typeof window.__renderListsTOC === 'function') window.__renderListsTOC();
      } catch (e) {}
    });

    // TOC navigation — open accordion + scroll to it
    const tocLinks = [...tocEl.querySelectorAll('a')];
    const sectionEls = SECTIONS.map(s => document.getElementById(s.id));
    tocLinks.forEach((a) => {
      a.addEventListener('click', (e) => {
        const id = a.dataset.id;
        const sec = document.getElementById(id);
        if (!sec) return;
        e.preventDefault();
        sec.open = true;
        // Defer scroll until details has expanded so offsetTop is accurate
        requestAnimationFrame(() => {
          const top = sec.getBoundingClientRect().top + window.scrollY - 80;
          window.scrollTo({ top, behavior: 'smooth' });
        });
        if (history.replaceState) history.replaceState(null, '', '#' + id);
      });
    });
    function updateActive() {
      const fromTop = window.scrollY + 100;
      let activeIdx = 0;
      sectionEls.forEach((el, i) => {
        if (el && el.offsetTop <= fromTop) activeIdx = i;
      });
      tocLinks.forEach((a, i) => a.classList.toggle('active', i === activeIdx));
    }
    window.addEventListener('scroll', updateActive, { passive: true });
    updateActive();
    // Honour URL hash on load: open the matching section
    const initialId = (location.hash || '').replace('#', '');
    if (initialId) {
      const sec = document.getElementById(initialId);
      if (sec && sec.tagName === 'DETAILS') sec.open = true;
    }

    function renderTable(headers, rows) {
      if (!rows.length) {
        const emptyTxt = (typeof window.t === 'function') ? window.t('lists.empty') : 'Nimic în această listă.';
        return `<div class="empty">${escapeHtml(emptyTxt)}</div>`;
      }
      return `<table class="list">
        <thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>
        <tbody>${rows.map(cells =>
          '<tr>' + cells.map(c => `<td class="${c.class || ''}">${c.html}</td>`).join('') + '</tr>'
        ).join('')}</tbody>
      </table>`;
    }

    function renderDisasterTable(kindOrKinds) {
      const kinds = Array.isArray(kindOrKinds) ? kindOrKinds : [kindOrKinds];
      const rows = r.disasters
        .filter(d => kinds.includes(d.kind))
        .sort((a,b) => a.year - b.year)
        .map(d => [
          { class: 'year', html: String(d.year) },
          ...(kinds.length > 1 ? [{ class: 'kind', html: escapeHtml(d.kind) }] : []),
          { class: 'text', html: escapeHtml(d.text) },
        ]);
      const headers = kinds.length > 1
        ? ['An', 'Tip', 'Descriere']
        : ['An', 'Descriere'];
      return renderTable(headers, rows);
    }

    function renderChronologyTable(items) {
      return renderTable(
        ['An / perioadă', 'Descriere'],
        items
          .sort((a,b) => (a.sort || 0) - (b.sort || 0))
          .map(e => [
            { class: 'year', html: escapeHtml(e.year) },
            { class: 'text', html: escapeHtml(e.text) },
          ])
      );
    }

    function renderWarTable() {
      return renderTable(
        ['An / perioadă', 'Descriere'],
        curatedWarEvents
          .sort((a,b) => a.sort - b.sort)
          .map(e => [
            { class: 'year', html: escapeHtml(e.year) },
            { class: 'text', html: escapeHtml(e.text) },
          ])
      );
    }

    function renderEpidemicTable() {
      return renderTable(
        ['An / perioadă', 'Tip', 'Descriere'],
        curatedEpidemicEvents
          .sort((a,b) => a.sort - b.sort)
          .map(e => [
            { class: 'year', html: escapeHtml(e.year) },
            { class: 'kind', html: escapeHtml(e.kind) },
            { class: 'text', html: escapeHtml(e.text) },
          ])
      );
    }

    function renderEventTable(categoryOrCategories) {
      const categories = Array.isArray(categoryOrCategories) ? categoryOrCategories : [categoryOrCategories];
      const rows = eventRows(categories).map(e => {
        const hitCategories = categories.filter(cat => (e.categories || []).includes(cat));
        return [
          { class: 'year', html: e.year_end ? `${e.year} – ${e.year_end}` : String(e.year) },
          ...(categories.length > 1 ? [{ class: 'kind', html: escapeHtml(hitCategories.join(', ')) }] : []),
          { class: 'text', html: escapeHtml(e.text) },
        ];
      });
      const headers = categories.length > 1
        ? ['An', 'Tip', 'Atestare']
        : ['An', 'Atestare'];
      return renderTable(headers, rows);
    }

    function formatNum(n) {
      return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    }
    function escapeHtml(s) {
      return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    }
