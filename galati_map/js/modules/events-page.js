// Heritage Galați — modul: pagina „Povești" — grid de articole istorice,
// articolul 1918 cu comic reader, sub-routing pe hash (#stories/<id>).
export function initEventsPage(ctx) {
  const { escapeHtml } = ctx;
    // ─── Events page: card grid + sub-routing ───────────────────
    // Source: Surse/candidati-articole.md (curated list of historical events).
    const EVENT_ARTICLES = [
      {
        id: '1821', year: '1821', title: 'Caravia și războiul care a aprins Grecia',
        eyebrow: 'Februarie 1821 · Galațiul, scânteia revoluției eteriste',
        hook: 'O poveste a Eteriei, sânge și libertate. Cum un căminar moldovean a transformat portul Galați în prima scânteie a revoluției grecești.',
        cover: '../assets/images/event-covers/1821-caravia-card.jpg',
        coverFull: '../assets/images/event-covers/1821-caravia.jpg',
        content: `
          <p class="article-lede">Anul 1821. Europa clocotea, dar nicăieri tensiunea nu era mai mare decât la marginea Imperiului Otoman. O societate secretă, <strong>Filiki Eteria</strong> (Societatea Prietenilor), plănuia o eliberare masivă a grecilor de sub stăpânirea otomană. Însă puțini știu că una dintre cele mai violente și decisive scântei ale acestei revoluții s-a aprins chiar în portul <strong>Galați</strong>, un loc strategic la Dunăre, unde ideile revoluționare găsiseră deja un teren fertil.</p>

          <h2>„S-a ridicat cu zorba!"</h2>
          <p>La începutul lunii februarie 1821, în Galați, autoritatea domnească moldoveană era reprezentată de un <strong>căminar</strong> (rang de curte) și căpitan al detașamentelor de arnăuți, pe nume <strong>Vasile Caravia</strong>. Fără ca otomanii să bănuiască amploarea conspirației, Caravia era în secret un eterist înfocat, gata să declanșeze infernul.</p>
          <p>Potrivit cronicilor din arhive (precum <em>Cronica revoluției din 1821</em> a biv-vel serdarului Ioan Dârzeanu), la București au ajuns rapoarte disperate de la isprăvnicatul Focșanilor: <em>„…venise știre într-acele zile cum că un Vasile Caravia […] s-a ridicat cu zorba [revoltă armată] asupra topciului [tunar] turc de acolo, adică zabitului [comandantul otoman al Galațiului]"</em>.</p>

          <h2>Măcelul garnizoanei și orașul în flăcări</h2>
          <p>Atacul nu a fost o simplă revoltă, ci o lovitură militară calculată. În fruntea a aproximativ <strong>700 de eteriști greci și arnăuți</strong> aflați în serviciul moldovenesc, căpitanul Vasile Caravia a luat cu asalt mica, dar bine înarmata garnizoană otomană din Galați. Elementul-surpriză a fost total. Eteriștii i-au ucis pe soldații turci, l-au eliminat pe zabit și au masacrat negustorii otomani din oraș.</p>
          <p>Pentru a instaura haosul total și a tăia rutele de scăpare, trupele lui Caravia au incendiat <strong>intenționat</strong> Galațiul în patru părți diferite. Noaptea, de pe malul celălalt al Dunării, flăcările orașului-port luminau cerul, semnalând că revoluția începuse.</p>

          <h2>Efectul de domino: Ipsilanti și Batalionul Sacru</h2>
          <p>Vestea acțiunii lui Caravia a avut un efect de domino. Generalul <strong>Alexandru Ipsilanti</strong>, liderul Eteriei, a trecut Prutul la Sculeni la 22 februarie / 6 martie 1821, intrând în Moldova. Câteva zile mai târziu, la <strong>1 martie / 13 martie 1821</strong>, depunea jurământul cu <strong>Batalionul Sacru</strong> (<em>Ieros Lochos</em>) la mănăstirea Sf. Trei Ierarhi din <strong>Iași</strong>, iar apoi a pornit spre Țara Românească pentru a face joncțiunea cu efectivele venite dinspre Galați. Domnitorul Moldovei, <strong>Mihail Șuțu</strong> — el însuși eterist — a pus la dispoziție resursele țării.</p>

          <h2>Prețul cumplit plătit de gălățeni</h2>
          <p>Eroismul și euforia eteriștilor au adus însă un blestem peste cetățenii de rând ai Galațiului. După plecarea trupelor lui Caravia, răzbunarea otomană a venit ca un tăvălug. <strong>Pașa din Brăila</strong> (aflată sub control direct turcesc, ca raia) a ordonat represalii devastatoare. Trupele de represiune otomane au trecut Dunărea și au pustiit complet Galațiul. Locuitorii, prinși la mijloc într-un război care nu era al lor, au fost supuși unui măcel cumplit, iar orașul a fost transformat pentru a doua oară în ruine în decurs de câteva luni.</p>
          <p>Astăzi, ecoul acestei bătălii ne amintește că Galațiul nu a fost doar un punct comercial, ci o adevărată „poartă a Europei" unde s-au jucat destinul și eliberarea unor întregi națiuni din Balcani.</p>

          <div class="sources">
            <p><strong>Surse</strong></p>
            <ul>
              <li>Ioan Dârzeanu, biv-vel serdar — <em>Cronica revoluției din 1821</em>, raportul către isprăvnicatul Focșanilor.</li>
              <li>Cilinca Victor, <em>Abecedar istoric gălățean</em> (capitolele despre Eterie).</li>
              <li><a href="https://ro.wikipedia.org/wiki/Filiki_Eteria" target="_blank" rel="noopener">Wikipedia: Filiki Eteria</a> — context organizațional.</li>
              <li><a href="https://ro.wikipedia.org/wiki/Alexandru_Ipsilanti_(1792-1828)" target="_blank" rel="noopener">Wikipedia: Alexandru Ipsilanti</a> — datele trecerii Prutului și jurământului Batalionului Sacru.</li>
              <li>Săndel Dumitru, <em>Galațiul, așa cum mi-l amintesc</em>, vol. V (perioada otomană).</li>
            </ul>
          </div>
        `,
      },
      {
        id: '1856', year: '1856', title: 'Comisia Europeană a Dunării · leagănul cooperării europene',
        eyebrow: '1856 · Tratatul de la Paris',
        hook: 'Cu 100 de ani înainte de fondarea Uniunii Europene, Galațiul găzduia deja prima instituție supranațională din lume — un experiment diplomatic fără precedent.',
        cover: '../assets/images/event-covers/1856-ced-card.jpg',
        coverFull: '../assets/images/event-covers/1856-ced.jpg',
        content: `
          <p class="article-lede">Dacă astăzi vorbim despre o Europă unită, cu instituții supranaționale și granițe deschise, trebuie să privim în urmă cu aproape 170 de ani. Mai exact, în <strong>1856</strong>. La finalul Războiului Crimeii, marile puteri ale lumii s-au reunit la Paris pentru a redesena harta continentului. Și acolo, la mii de kilometri distanță, au luat o decizie care avea să schimbe pentru totdeauna destinul unui oraș-port la Dunăre: au creat <strong>Comisia Europeană a Dunării (CED)</strong>.</p>

          <h2>Prima instituție supranațională din lume</h2>
          <p>CED nu a fost doar o altă agenție; a fost un <strong>experiment diplomatic fără precedent</strong>. Pentru prima dată în istoria omenirii, o organizație primea puteri supranaționale, cu autoritate care depășea statele membre. Cele <strong>7 mari puteri europene</strong> semnatare ale Tratatului de la Paris (Marea Britanie, Franța, Austria, Prusia, Rusia, Regatul Sardiniei și Imperiul Otoman) și-au dat mâna pentru a asigura libera navigație pe Dunăre până la Marea Neagră.</p>
          <p>Și unde au decis să își stabilească sediul? La <strong>Galați</strong>.</p>
          <p>Brusc, orașul a devenit un focar diplomatic internațional. CED funcționa ca un <strong>stat în stat</strong>: avea statut de <strong>extrateritorialitate</strong> (terenurile și sediile sale erau „pământ european", inviolabil), avea <strong>drapel propriu</strong> (pe care îl arborau navele de sub jurisdicția sa), un <strong>buget impresionant</strong>, <strong>poliție fluvială proprie</strong> și o <strong>flotilă tehnică</strong>. Cu 100 de ani înainte de fondarea Uniunii Europene, la Galați funcționa deja o organizație cu angajați din toate colțurile Europei, care lucrau împreună, vorbind <strong>franceza</strong> ca limbă oficială.</p>

          <h2>Sir Charles Hartley și transformarea Dunării</h2>
          <p>Banii și influența Comisiei au transformat orașul. Inginerii conduși de legendarul <strong>Sir Charles Hartley</strong> (supranumit „Părintele Dunării") au secționat buclele fluviului și au transformat <strong>brațul Sulina</strong> într-un canal navigabil pentru vasele maritime. Tot acest efort uriaș era coordonat de la Galați. Hartley însuși a locuit la Galați (vezi <a class="pin-link" href="#map" data-loc="loc-26">Casa Hartley</a> de pe str. Domnească nr. 98).</p>

          <h2>Palatul CED: o bucată de Europă pe Faleză</h2>
          <p>Sediul central, locul de unde se luau deciziile vitale pentru comerțul mondial cu cereale, a fost impunătorul <strong>Palat al Comisiei Europene a Dunării</strong>, ridicat falnic pe strada Domnească (cu vedere spre Faleză). Astăzi, dacă treci pe acolo, recunoști imediat arhitectura sa monumentală: este actualul <strong>sediu central al Bibliotecii „V. A. Urechia"</strong>.</p>
          <p>(Adesea confundat cu sediul rectoratului Universității „Dunărea de Jos" de pe Domnească 47 — care însă a fost <em>Palatul de Justiție</em>, nu Palatul CED.)</p>

          <h2>Zorii și apusul unei ere</h2>
          <p>Cât timp CED a funcționat la capacitate maximă, Galațiul a trăit o epocă de aur. Aici se aflau <strong>peste 20 de consulate și vice-consulate străine</strong> — la apogeu, 21 (cu 16 active înainte de Primul Război Mondial). Mai mulți ambasadori și diplomați pe cap de locuitor decât are astăzi Bruxelles-ul.</p>
          <p>După Primul Război Mondial, atribuțiile CED au fost diminuate treptat de noua suveranitate românească asupra Dunării. Sfârșitul celui de-Al Doilea Război Mondial și instaurarea Cortinei de Fier au alungat puterile vestice de la Gurile Dunării: în <strong>1948</strong>, prin <strong>Convenția de la Belgrad</strong>, CED a fost dizolvată oficial și înlocuită cu o nouă Comisie a Dunării, fără puteri occidentale.</p>
          <p>Dar zidurile fostului Palat CED stau și astăzi în picioare, pe buza falezei, amintindu-ne că a existat o vreme când, la Galați, se dădea ora exactă a Europei.</p>

          <div class="sources">
            <p><strong>Surse</strong></p>
            <ul>
              <li>Cilinca Victor, <em>Abecedar istoric gălățean</em> — capitolul despre CED și fotografia comparativă a Palatului CED / Bibliotecii „V. A. Urechia".</li>
              <li>Gh. N. Munteanu-Bârlad, <em>Galații</em>, monografie 1927 — citat de Cilinca pentru starea Dunării înainte de regularizare.</li>
              <li>Tratatul de la Paris (30 martie 1856), articolele 16-17 — actul fondator CED.</li>
              <li>Convenția de la Belgrad (1948) — actul de desființare CED.</li>
              <li><a href="https://en.wikipedia.org/wiki/European_Commission_of_the_Danube" target="_blank" rel="noopener">European Commission of the Danube (Wikipedia)</a> — pentru context internațional.</li>
            </ul>
          </div>
        `,
      },
      {
        id: '1907', year: '1907', title: 'Flăcările se extind în Covurlui · Răscoala din 1907',
        eyebrow: 'Februarie–martie 1907 · Dreptate și pământ!',
        hook: 'Cum a ajuns marea răscoală țărănească pornită din Flămânzi la porțile Galațiului — și cum un regiment local de elită a fost pus să tragă în propriii consăteni.',
        cover: '../assets/images/event-covers/1907-rascoala-card.jpg',
        coverFull: '../assets/images/event-covers/1907-rascoala.jpg',
        content: `
          <p class="article-lede">Anul <strong>1907</strong> a rămas întipărit în istoria României ca anul marii explozii de furie a satului românesc. Porniți din <strong>Flămânzi (Botoșani)</strong> la 8/21 februarie 1907, din cauza sărăciei extreme, a abuzurilor arendașilor și a lipsei de pământ, mii de țărani s-au ridicat la luptă. Ca un incendiu pe miriște, revolta s-a extins cu repeziciune spre sudul Moldovei, ajungând în luna martie la porțile Galațiului, în vechiul județ <strong>Covurlui</strong>.</p>

          <h2>Flăcările se extind în Covurlui</h2>
          <p>Furia țăranilor a lovit violent conacele boierești și fermele arendașilor din împrejurimile Galațiului. Arhivele consemnează că satele județului s-au ridicat rând pe rând. Un exemplu notabil este satul <strong>Țepu</strong>, unde țăranii s-au organizat și au susținut activ răscoala, cerând <em>„dreptate și pământ"</em>. Conacele incendiate, hambarele jefuite, registrele de arendă rupte — același tipar din toată Moldova.</p>
          <p>Galațiul era la acea vreme un <strong>pol de bogăție</strong>, cu peste 20 de consulate și o economie industrială înfloritoare datorită Comisiei Europene a Dunării <a class="pin-link" href="#stories/1856">vezi articol</a> și porto-francului recent încheiat. Dar satele din jurul său trăiau într-o sărăcie lucie, într-un contrast aproape medieval. Teama că masele de țărani înfuriați ar putea invada marele port comercial a forțat autoritățile locale să ceară <strong>intervenția imediată a armatei</strong>.</p>

          <h2>Tragedia Regimentului 11 Dorobanți „Siret"</h2>
          <p>Pentru a înăbuși revolta, guvernul de la București (sub conducerea lui Dimitrie A. Sturdza, format în martie 1907) a ordonat reprimarea armată fără milă a răsculaților. La Galați, această sarcină ingrată și tragică i-a revenit legendarei unități locale: <strong>Regimentul 11 Dorobanți „Siret"</strong>.</p>
          <p>Înființat în <strong>1872</strong>, acesta era regimentul de elită al orașului, glorificat pentru eroismul său la <strong>Grivița</strong> în Războiul de Independență (1877). Avea să participe ulterior la toate marile conflicte ale României: cele Două Războaie Balcanice, Primul Război Mondial (inclusiv Bătălia de la Galați din 1918 <a class="pin-link" href="#stories/1918">vezi articol</a>), campania din 1919 și Al Doilea Război Mondial.</p>
          <p>Tragedia anului 1907: în martie, ofițerii și soldații gălățeni — mulți dintre ei proveniți chiar din satele aflate în revoltă — au primit <strong>ordinul cumplit de a trage în frații și părinții lor</strong>.</p>

          <h2>Împușcarea în masă</h2>
          <p>Represiunea a fost cruntă. Documentele vorbesc despre „împușcarea în masă a țărănimii" la Galați și în comunele limitrofe. S-au folosit <strong>tunurile și armamentul de infanterie</strong> pentru a împrăștia cetele de răsculați. Multe conace fuseseră deja incendiate, dar răspunsul armatei a lăsat în urmă <strong>sute de morți</strong> în județ — cifrele exacte au fost mușamalizate ulterior de autorități, ca în restul țării. Bilanțul total neoficial al represiunii la nivel național ar fi ajuns la <strong>10.000 de victime</strong> (după estimările istoricilor postbelici; cifrele oficiale au fost mult mai mici).</p>

          <h2>Epilogul unui martie sângeros</h2>
          <p>Până la sfârșitul lunii martie, liniștea fusese restabilită — dar era liniștea mormintelor. Răscoala de la 1907 a lăsat o cicatrice adâncă în societatea românească. Soldații din Regimentul 11 Dorobanți au rămas cu trauma executării unui ordin nefiresc, iar țăranii din Covurlui au fost reduși la tăcere, așteptând încă un deceniu — până la <strong>Primul Război Mondial</strong> și <strong>reforma agrară din 1921</strong> (sub guvernul Averescu) — pentru a fi, în sfârșit, împroprietăriți cu pământ.</p>
          <p>Un paradox al istoriei: aceiași soldați care în martie 1907 reprimaseră răsculații aveau să devină, doar 11 ani mai târziu, eroii apărării Galațiului împotriva Corpului 4 Siberian bolșevizat <a class="pin-link" href="#stories/1918">vezi Bătălia 1918</a>. Tragedia de la 1907 a fost preludiul tăcut al unei mobilizări masive care a culminat în Marele Război.</p>

          <div class="sources">
            <p><strong>Surse</strong></p>
            <ul>
              <li>Cilinca Victor, <em>Abecedar istoric gălățean</em>.</li>
              <li>Săndel Dumitru, <em>Galațiul, așa cum mi-l amintesc</em>, vol. VI–VII (perioada belle époque și Marele Război).</li>
              <li>Documentele Regimentului 11 Dorobanți „Siret" (înființat 1872, sediu la Galați) — istoricul de unitate.</li>
              <li><a href="https://ro.wikipedia.org/wiki/R%C4%83scoala_din_1907" target="_blank" rel="noopener">Răscoala din 1907 (Wikipedia)</a> — context național, cifrele estimate ale victimelor.</li>
              <li>Arhivele Naționale, dosarele administrației județene Covurlui pentru anul 1907 (Direcția Județeană Galați).</li>
            </ul>
          </div>
        `,
      },
      {
        id: '1944', year: '1944', title: 'Sfârșitul Pieței Regale',
        eyebrow: '24–25 august 1944 · Retragere germană',
        hook: 'O noapte de foc la Galați. Inima cosmopolită a portului, „Micul Paris", e detonată sistematic de geniștii germani în retragere. Niciodată reconstruită.',
        cover: '../assets/images/event-covers/1944-piata-regala-card.jpg',
        coverFull: '../assets/images/event-covers/1944-piata-regala.jpg',
        content: `
          <p class="article-lede">Dacă astăzi ne-am plimba prin centrul Galațiului, pe locul străzilor moderne și al blocurilor anoste din epoca comunistă a existat cândva un loc de o vibrație uluitoare: <strong>Piața Regală</strong>. Numele său oficial fusese consfințit în <strong>1884</strong> de Consiliul Comunal, iar de-a lungul deceniilor devenise un autentic „Mic Paris" la Dunăre. Aici se aliniau, pe „Corso"-ul gălățean, cafenele selecte, cofetării cu prăjituri vieneze, magazine de lux, <strong>Casa Fanciotti</strong> și grandiosul <strong>Hotel Bristol</strong>. Din centrul pieței, de pe un piedestal impozant, statuia lui <strong>Costache Negri</strong> (inaugurată în <strong>1912</strong>) veghea asupra efervescenței cosmopolite a portului.</p>
          <p>Totul avea să fie șters de pe fața pământului într-o singură noapte.</p>

          <h2>Tensiunea întoarcerii armelor</h2>
          <p>Pentru a înțelege dezastrul, trebuie să privim calendarul: <strong>august 1944</strong>. După ani de alianță cu Germania, ziua de <strong>23 august 1944</strong> a adus șocul care avea să schimbe soarta României: lovitura de stat prin care Regele <strong>Mihai I</strong> a întors armele împotriva Germaniei Naziste și a alăturat țara Națiunilor Unite.</p>
          <p>La Galați, vestea a căzut ca un trăsnet peste garnizoana și spitalele militare germane. Până pe 22 august, orașul fusese plin de trupe germane, de răniți evacuați de pe Frontul de Est și de ofițeri care se plimbau liberi pe Corso. Acum, brusc, foștii lor aliați le deveniseră inamici, iar temuta Armată Roșie — care rupsese deja liniile româno-germane pe <strong>20 august</strong>, în <a href="https://en.wikipedia.org/wiki/Second_Jassy%E2%80%93Kishinev_offensive" target="_blank" rel="noopener">faimoasa ofensivă Iași–Chișinău</a> — se apropia periculos.</p>

          <h2>Pământul pârjolit de pe Corso</h2>
          <p>Confruntați cu înfrângerea și nevoiți să se retragă de urgență spre nord, trupele germane au aplicat o tactică nemiloasă, lăsând în urmă doar distrugere. <strong>În noaptea de 24 spre 25 august 1944</strong>, geniștii armatei germane în retragere au minat sistematic clădirile din centrul orașului.</p>
          <p>Conform mărturiilor soldaților germani aflați în spitalul orașului în acea noapte, a fost o noapte de teroare. Rând pe rând, superbele clădiri din Piața Regală — cu arhitectura lor eclectică și neoclasică — au fost detonate. Din „Micul Paris" a mai rămas doar o imensă grămadă de moloz fumegând, cratere, fiare contorsionate și ziduri prăbușite. Galațiul central devenise un peisaj selenar, pârjolit și pustiit.</p>
          <p>Când dimineața zilei de <strong>25 august</strong> a luminat orașul, gălățenii ieșiți din adăposturi au găsit inima comercială pulverizată. O singură prezență mai stătea în picioare, aproape miraculos, în mijlocul deșertului de moloz: <strong>statuia lui Costache Negri</strong>. Afumată de explozii, dar intactă, a devenit singura supraviețuitoare a nopții de foc.</p>

          <h2>Ceea ce războiul a distrus, comunismul a uitat</h2>
          <p>Câteva zile mai târziu, pe <strong>27 august 1944</strong>, trupele sovietice au intrat în Galați, capturând mii de prizonieri și găsind orașul sfâșiat.</p>
          <p>Deși imediat după război anumiți supraviețuitori ai familiilor burgheze gălățene au cerut refacerea vechilor clădiri, soarta Pieței Regale era deja pecetluită. Noul regim comunist instalat nu avea niciun interes să reconstruiască simbolurile „Micului Paris" și ale burgheziei comerciale. Ruinele au fost pur și simplu nivelate cu buldozerele, lăsând locul blocurilor gri din zilele noastre și sistematizării comuniste care i-a șters aproape complet forma inițială.</p>
          <p>Astfel, Piața Regală a murit de două ori: o dată sub explozibilul nemțesc și a doua oară sub uitarea impusă de autoritățile epocii care a urmat. Astăzi, frumusețea ei mai trăiește doar în fotografii de epocă sepia și în amintirile tot mai rare ale unui oraș-port la Dunăre care odată concura cu marile capitale ale Europei.</p>

          <div class="sources">
            <p><strong>Surse</strong></p>
            <ul>
              <li>Săndel Dumitru, <em>Galațiul, așa cum mi-l amintesc</em>, vol. IX (capitolul despre Piața Regală).</li>
              <li>Cilinca Victor, <em>Abecedar istoric gălățean</em>.</li>
              <li>„Royal Square and Corso of Galați" — articol academic privind urbanismul interbelic.</li>
              <li>Mărturii ale soldaților germani aflați în spitalul orașului în noaptea de 24/25 august 1944.</li>
              <li>Surse oficiale despre <a href="https://en.wikipedia.org/wiki/Second_Jassy%E2%80%93Kishinev_offensive" target="_blank" rel="noopener">ofensiva Iași–Chișinău</a> (20–29 august 1944).</li>
            </ul>
          </div>
        `,
      },
      {
        id: '1940', year: '1940', title: 'Eroul de la Giurgiulești: căpitanul Napoleon Popescu',
        eyebrow: '2 iulie 1940 · Incidentul armat de la Giurgiulești',
        hook: 'Cu șase ore înainte de cedarea oficială a Basarabiei, un singur ofițer a nesocotit ordinele Marelui Stat Major, a trecut Prutul și a oprit o coloană de 70 de blindate sovietice care se îndreptau spre Galați.',
        content: `
          <p class="article-lede">În data de <strong>2 iulie 1940</strong>, cu doar șase ore înainte de cedarea oficială a Basarabiei, Bucovinei de Nord și ținutului Herța, căpitanul <strong>Napoleon Alexandru Popescu</strong> — comandantul Companiei a V-a din Regimentul V Care de Luptă de la Galați — a trecut Prutul și a oprit o coloană de tancuri sovietice care se îndrepta spre Galați. A nesocotit ordinele înaltului stat major al armatei române pentru că așa a simțit să apere pământul românesc, oprindu-i pe sovietici să treacă și să anexeze teritorii la vest de Prut.</p>

          <h2>Contextul: ultimatumul și invazia</h2>
          <p>Ultimatumul sovietic cerea ca Armata Română să evacueze Basarabia și nordul Bucovinei în patru zile, începând cu <strong>28 iunie 1940</strong>. Chiar și așa, trupele sovietice au invadat teritoriile cerute încă din noaptea de 27/28 iunie, unitățile motorizate și de cavalerie înaintând rapid spre Prut și devansând formațiunile românești aflate în curs de evacuare.</p>
          <p>Sovieticii au aplicat tactici agresive: au instalat puncte de control, i-au dezarmat, umilit și uneori arestat pe soldații români — în special pe cei basarabeni — punându-i în situații periculoase sau fatale. Au existat numeroase incidente, morți și răniți. În dimineața de 28 iunie, Marele Stat Major român a dispus ca trupele să <strong>nu deschidă focul</strong> și să nu reacționeze la provocări, iar comandanții să ia contact cu trupele sovietice.</p>

          <h2>Misiunea: capul de pod de la Giurgiulești</h2>
          <p>Hotărând să-și evacueze trupele din Basarabia și să organizeze rezistența pe aliniamentul Prutului, Marele Stat Major a instalat servicii de pază la toate trecerile peste râu, cu misiunea de a asigura evacuarea pe jos a trupelor, securitatea căilor ferate, a podurilor, depozitelor și aerodromurilor, precum și protecția împotriva sabotajelor.</p>
          <p>La <strong>Giurgiulești</strong> — la extremitatea sudică a județului Cahul, unde Prutul se varsă în Dunăre — un pod cu două fire de circulație (unul de cale ferată) lega județul Cahul de Galați. Printr-o directivă a colonelului <strong>Eftimiu</strong>, șeful de Stat Major al Corpului de Cavalerie (2 iulie 1940), trupele române trebuiau să mențină capul de pod de la est de Prut până în dimineața de 3 iulie, iar orice tentativă de dezarmare urma să primească <em>„ripostă cu foc"</em>. În capul de pod rămâneau un batalion din Regimentul 46 Infanterie, un batalion de infanterie ușoară, o secție de artilerie și o companie de care de luptă sub comanda căpitanului Popescu — dotată cu mașini de luptă <strong>Škoda</strong>. Culoarul spre Galați urma blocat la poduri cu artilerie și armament anticar, podurile fiind distruse în caz de tentativă de trecere.</p>
          <p>La Galați se afla în același timp comunistul <strong>Gheorghe Apostol</strong>, cu sarcina de a aștepta trupele ruse pentru a le preda orașul.</p>
          <p>Carele de luptă au fost dispuse la marginea satului și camuflate sub copacii din grădinile sătenilor, terenul plan permițând observarea la câțiva kilometri:</p>
          <ul>
            <li><strong>Plutonul 1</strong> (lt. Mihail Pană) — intrările dinspre <strong>est</strong>;</li>
            <li><strong>Plutonul 2</strong> (lt. Mihai Teodorescu) — intrarea dinspre <strong>nord</strong>;</li>
            <li><strong>Plutonul 3</strong> — în rezervă, cu 5 tancuri, la capătul podului.</li>
          </ul>
          <p>Un agent motociclist asigura legătura dintre căpitan și comandanții de plutoane. În dimineața de 1 iulie, divizionul de cavalerie purtată a părăsit capul de pod — în apărare a rămas doar compania de tancuri.</p>

          <h2>2 iulie 1940 — duelul de la pod</h2>
          <p>În dimineața de 2 iulie, o coloană de <strong>70 de vehicule blindate</strong> ale Armatei Roșii, mergând spre Galați, s-a îndreptat spre pod — cu șase ore înainte de predarea oficială a Basarabiei. Confruntat cu înaintarea agresivă, căpitanul Popescu a ordonat încărcarea de proiectile perforante în toate tunurile și tragerea de la <strong>sub 300 m, în foc plin, fără somație</strong>.</p>
          <p>Tanchiștii români au tras aproximativ <strong>80 de proiectile</strong> (plutonul de est al lt. Pană, sprijinit de rezervă). Rușii au ripostat ineficient, cu proiectile explozive brizante care nu străpungeau blindajul. Rezultatul: <strong>4 mașini de luptă inamice distruse</strong> (3 tanchete și un tanc, incendiate). O companie de infanterie română, pe cale să fie tăiată de la retragere, s-a retras în ordine pe sub malul râului și a trecut podul spre Galați. Retragerea trupelor de la vest de Prut s-a făcut sub protecția tancurilor — infanteria și celelalte unități fiind salvate.</p>

          <h2>Parlamentarii și podul aruncat în aer</h2>
          <p>După retragerea infanteriei, dinspre coloana sovietică au venit, cu steag alb și un țăran translator, trei ofițeri ruși (un căpitan de aviație, unul de parașutiști și unul de tancuri) ca să negocieze oprirea focului și salvarea podului. Între timp a sosit și șeful de Stat Major al diviziei române, colonelul <strong>Vasiliu</strong>, împreună cu căpitanul Dămăceanu, care a preluat tratativele; rușii s-au retras, iar compania a primit ordin să se retragă peste pod.</p>
          <p>Geniștii români voiau să arunce podul în aer imediat, dar Popescu a întors tancurile spre ei, amenințând că deschide focul dacă nu e lăsat să-și retragă tehnica peste pod. Retragerea s-a făcut <strong>tanc cu tanc</strong>, așteptându-se și ultimii refugiați; abia apoi podul minat a fost detonat. Detașamentul a fost dislocat la cazarma aerodromului Galați, pentru a apăra aeroportul de eventualele tancuri amfibii sovietice care ar fi încercat să treacă peste Brateș. <a class="pin-link" href="#map" data-loc="loc-307">Vezi locul pe hartă</a>.</p>

          <h2>Versiunea rusă (istoricul Meltiukhov)</h2>
          <p>Istoricul militar rus <strong>Mihail Meltiukhov</strong> dă o altă versiune. În zona Cahul–Reni se aflau Brigada 204 Aeropurtată și Divizia a 9-a Cavalerie (tancuri). Devansând retragerea românească, sovieticii au instalat la Reni un punct de control, confiscând materiale. Unitățile române aflate în traversarea Prutului ar fi deschis foc răzleț spre parașutiști; în cursul zilei un parașutist rus și un soldat român au fost uciși. În noaptea de 2 iulie s-a tras 30 de minute de pe malul românesc, fără ripostă rusă. La 1,5 km est de Giurgiulești o companie română a deschis foc cu puști și mitraliere, fiind apoi retrasă peste Prut. La 18:30–19:00, 5–6 monitoare fluviale românești au deschis focul în timp ce ultimele subunități se retrăgeau; sovieticii s-au oprit la 250 m, fără să riposteze. La 19:45, după retragerea completă, podul a fost distrus de patru explozii (două pe firul auto, două pe cel feroviar). Românii au susținut că distrugerea a fost efectul atacului tancurilor ruse. În jurnalul de seară din 2 iulie 1940, radioul național de la București a anunțat evenimentul.</p>

          <h2>Mărturia veteranului Nicolae Bacalbașa</h2>
          <p>Singurul veteran al luptei care mai trăia la inaugurarea monumentului, fostul ofițer de legătură (pe atunci plutonier) <strong>Nicolae Bacalbașa</strong>, povestea:</p>
          <blockquote>
            Rușii voiau să pună mâna pe Galați. Noi, România, eram o piesă măruntă în jocul lor — piesa cea mare era Istanbulul. Doar cucerind Galațiul puteau intra ușor în Turcia. (…) Comandantul, un mare erou, Napoleon Popescu, a trecut podul cu tancurile și i-a așteptat pe ruși. Cu șase ore înainte ca România să predea oficial Basarabia, la poduri a apărut o coloană de 70 de blindate. Norocul nostru a fost că rușii aveau doar proiectile brizante, care nu străpungeau blindajul. Noi eram pregătiți! (…) Rușii s-au retras de frica unui măcel, dar și de teama unui scandal internațional. După aceea, geniștii au vrut să arunce podul în aer — a întors tancurile spre ei și i-a amenințat că deschide focul dacă nu îi lasă să revină peste pod!
            <cite>— Nicolae Bacalbașa, veteran</cite>
          </blockquote>
          <p>Tancul amfibiu sovietic <strong>T-40</strong>, pe care rușii voiau să-l folosească la Galați, intrase în dotare la 19 decembrie 1939 — în aceeași zi cu T-34 și KV-1 — și fusese ținut secret. Despre forța blindată sovietică, generalul Heinz Guderian spunea: <em>„Dacă aș fi știut că rușii au o asemenea cantitate de tancuri, probabil nu aș fi început războiul!"</em></p>

          <h2>Eroul: căpitanul Napoleon Alexandru Popescu</h2>
          <p>Considerat un adevărat strateg militar, Napoleon Alexandru Popescu s-a născut în ianuarie 1909 la Pietroșița (Dâmbovița). Absolvent al Școlii Superioare de Comerț și al Școlii Superioare de Infanterie nr. 1, ajunge în 1929 sublocotenent comandant de pluton la Regimentul Care de Luptă I; în 1940 este avansat căpitan.</p>
          <p>Cariera i se axează pe luptele din Basarabia. Fondul de Memorii Originale din Arhivele Militare Pitești notează că <em>„buna judecată și discernământ"</em> i-au permis la Giurgiulești să facă față atacului carelor rusești, <strong>salvând un batalion de infanterie</strong> și alte unități în timpul evacuării. În 1941 luptă la Lipnic (ocupă gara, salvând-o de la distrugere), Soroca, Chișinău, Kremdovsko și Argirovskaia. La 18 august 1941 străpunge poziția de la Doncevo–Karpovo, la nord de Odesa, ușurând operațiunile Regimentului III Dorobanți — faptă pentru care e decorat cu <strong>Steaua României</strong> clasa a V-a cu spade. A fost decorat și cu Virtutea Militară de Pace (1940), Steaua României (1940 și 1942) și cu <strong>Crucea de Fier</strong> germană, clasa a II-a (1940). Părăsește armata în 1947, în grad de locotenent-colonel. A murit la 3 decembrie 1996.</p>

          <h2>Monumentul (octombrie 2014)</h2>
          <p>Un monument format dintr-o <strong>troiță</strong> și o placă comemorativă, dedicat soldaților români din Al Doilea Război Mondial, a fost inaugurat la <strong>3 octombrie 2014</strong> la intrarea în Punctul de trecere a frontierei Galați-Rutier (Giurgiulești), în amintirea luptelor de aici. A fost ridicat de comunitatea locală, la inițiativa Muzeului de Istorie „Paul Păltănea" din Galați.</p>
          <blockquote>
            In memoriam căpitanului Napoleon Alexandru Popescu, comandantul Companiei a V-a Regimentul V Care de Luptă de la Galați, 26.01.1909 – 03.12.1996. În ziua de 2 iulie 1940, cu șase ore înainte de evacuarea și cedarea oficială a Basarabiei, Bucovinei de Nord și ținutului Herței, căpitanul Napoleon Alexandru Popescu a fost singurul ofițer român care a oprit înaintarea trupelor sovietice de ocupație din Basarabia, la capul de pod de peste Prut, Galați-Giurgiulești.
            <cite>— inscripția de pe placa comemorativă</cite>
          </blockquote>
          <p>La ceremonie, Cristian Căldăraru, directorul Muzeului „Paul Păltănea", a rezumat miza: <em>„N-am fost autoritate sovietică datorită acestui om care a nesocotit ordinele înaltului stat major, a trecut de la sine, pentru că așa a simțit să apere pământul românesc, și i-a oprit pe ruși de a trece și de a ne ocupa."</em> A fost prezent și fiul eroului, <strong>Gabriel Popescu</strong>: <em>„Nu a făcut lucruri deosebite, ci pur și simplu și-a servit țara."</em></p>

          <div class="sources">
            <p><strong>Surse</strong></p>
            <ul>
              <li>Dumitru, Sandel — <em>Galațiul, așa cum mi-l amintesc</em>, vol. IX (episodul căpitanului Napoleon Popescu și monumentul din 2014).</li>
              <li><em>Jurnalul de operații al Corpului de Cavalerie</em>, directiva colonelului Eftimiu (2 iulie 1940), Arhivele Militare.</li>
              <li>Fondul de Memorii Originale, Arhivele Militare Naționale Pitești (fișa căpitanului N. A. Popescu).</li>
              <li>Mărturia veteranului Nicolae Bacalbașa (interviu la inaugurarea monumentului, 2014).</li>
              <li>Mihail Meltiukhov — versiunea rusă a evenimentelor din 1–2 iulie 1940.</li>
              <li>Muzeul de Istorie „Paul Păltănea" Galați (Cristian Căldăraru) — ceremonia din octombrie 2014.</li>
            </ul>
          </div>
        `,
      },
      {
        id: '1962', year: '1962–1963', title: 'Războiul cu istoria: bisericile-monument distruse de comuniști',
        eyebrow: 'Decembrie 1962 – decembrie 1963',
        hook: 'Doi ani. Două crime arhitecturale. O cicatrice care nu s-a vindecat. Cum a șters sistematizarea comunistă șapte secole de istorie a Galațiului.',
        cover: '../assets/images/event-covers/1962-demolari-card.jpg',
        coverFull: '../assets/images/event-covers/1962-demolari.jpg',
        content: `
          <p class="article-lede">Sistematizarea comunistă din anii '60 a lăsat răni adânci pe fața Galațiului. Sub pretextul modernizării și al construirii „noului oraș muncitoresc", autoritățile vremii au șters de pe hartă monumente cu o valoare inestimabilă, vechi de secole. Două dintre cele mai dramatice episoade de distrugere arhitecturală și spirituală s-au petrecut în <strong>1962</strong> și <strong>1963</strong>.</p>
          <p>A existat o vreme când profilul falezei Dunării la Galați era dominat de turlele unor biserici masive, construite din piatră de castru roman și rezistente la secole de invazii. Ceea ce nu au reușit otomanii și războaiele, a reușit febra sistematizării comuniste — în doar doi ani.</p>

          <h2>Sfântul Gheorghe: biserica trasă în Dunăre cu vapoarele</h2>
          <p class="ev-note">Octombrie–decembrie 1962</p>
          <p>Cea mai mare crimă culturală a Galațiului comunist rămâne demolarea Bisericii <strong>„Sfântul Gheorghe"</strong> <a class="pin-link" href="#map" data-loc="loc-96">vezi pin</a>. Sfințită la <strong>1 aprilie 1664</strong> prin osârdia lui Hagi Mihalachi din Galați, pe un promontoriu al falezei (în spatele actualului Hotel Vega), biserica forma o pereche defensivă perfectă cu Biserica fortificată <strong>Precista</strong>, situată la doar 300 de metri distanță.</p>
          <p>Aici, sub lespezile bisericii, au odihnit din <strong>martie 1710</strong> osemintele celebrului hatman cazac <strong>Ivan Mazepa</strong>, eroul național al Ucrainei. Mazepa murise la Bender după bătălia de la Poltava (1709) și fusese reînhumat aici cu finanțarea regelui Carol XII al Suediei.</p>
          <p>Zidurile sale erau atât de masive — construite parțial cu blocuri de piatră extrase din castrul roman de la <strong>Tirighina-Barboși</strong>, piatră veche de 1.500 de ani refolosită — încât atunci când autoritățile comuniste, prin Constantin Dăscălescu (viitor prim-ministru al regimului ceaușist), au ordonat demolarea în toamna lui 1962, constructorii au fost învinși de structură. S-a încercat <strong>injectarea a sute de tone de apă sub fundație</strong> pentru a o destabiliza. Zidurile au rezistat.</p>
          <p>Soluția finală a fost de un barbarism mecanic înfiorător: în <strong>noaptea de 29 spre 30 octombrie 1962</strong> (cu finalizarea în decembrie), comuniștii au adus remorcherele flotei <strong>Navrom</strong>. Au legat biserica cu cabluri groase de oțel trase de pe fluviu și, prin forța brută a motoarelor navale, au smuls clădirea de pe mal, trăgând-o direct în apele Dunării. Odată cu ea s-au pierdut pentru totdeauna osemintele lui Mazepa și peste 300 de ani de istorie. Astăzi, două cartiere ale Galațiului (<strong>Mazepa 1</strong> și <strong>Mazepa 2</strong>) îi poartă încă numele, deși mormântul nu mai e niciunde.</p>

          <h2>Sfânta Sofia: zidurile sfărâmate cu tancul</h2>
          <p class="ev-note">Decembrie 1963</p>
          <p>Doar un an mai târziu, în <strong>decembrie 1963</strong>, a urmat un alt act de forță împotriva patrimoniului orașului. Vizați erau acum locuitorii din zona mai centrală, unde se afla biserica <strong>„Sfânta Sofia"</strong> <a class="pin-link" href="#map" data-loc="loc-97">vezi pin</a>. Piatra de temelie a acestei biserici fusese pusă în <strong>1872</strong>, iar lăcașul fusese sfințit în <strong>1880</strong> (după Pr. Eugen Drăgoi, <em>Scurtă cronologie a istoriei bisericești</em>).</p>
          <p>Motivul demolării? Construirea noii <strong>Case de Cultură a Sindicatelor</strong>. Din nou, arhitectura veche s-a dovedit mai trainică decât utilajele de construcții ale anilor '60. Pentru a grăbi procesul de demolare, în plină iarnă, autoritățile au decis să folosească <strong>forța armatei</strong>. Conform memoriei locale și documentelor vremii, zidurile Sfintei Sofia au fost dărâmate efectiv lovite cu <strong>tancul</strong>.</p>
          <p>Peste ruinele ei s-a turnat rapid beton. Construcția Casei de Cultură a început în <strong>august 1966</strong> și s-a încheiat în <strong>4 octombrie 1969</strong>, când a fost inaugurată și închinată liderului comunist <strong>Gheorghe Gheorghiu-Dej</strong>. Pe esplanadă, din 1971 până la <strong>22 decembrie 1989</strong>, a tronat un bust masiv din bronz al lui Dej — dărâmat de mulțime în zilele Revoluției.</p>

          <h2>Miracolul supraviețuirii: bisericile salvate în ultima clipă</h2>
          <p>Același elan distructiv a vizat și alte lăcașuri:</p>
          <ul>
            <li><strong>Biserica Armenească</strong> — comunitate veche de două secole în Galați. Salvarea ei se datorează în mare parte presiunilor diplomatice și protestelor.</li>
            <li><strong>Biserica fortificată Precista</strong> (1647) — cea mai veche clădire a Galațiului, sora geamănă cu Sf. Gheorghe. Doar protestele vehemente ale unor oameni de cultură și probabil teama de a repeta efortul logistic uriaș au salvat-o în ultima clipă.</li>
            <li><strong>Mavromol</strong> (ctitorie Antioh Cantemir, începutul sec. XVIII) — încă în picioare.</li>
            <li><strong>Vovidenia</strong>, <strong>Sf. Spiridon</strong>, <strong>Sf. Apostoli</strong> — supraviețuiesc, deși ultimele două au fost vizate în diferite momente.</li>
          </ul>

          <h2>Și sinagogile: o pierdere uitată</h2>
          <p>Distrugerea patrimoniului religios al Galațiului nu a început în 1962. Mult mai devreme, în <strong>1942</strong>, faimosul <strong>Templu Coral</strong> (cea mai mare sinagogă a orașului) a fost dărâmat de regimul antonescian-legionar, în plină prigoană antisemită. Astăzi, dintre cele 22 de sinagogi active la apogeul comunității evreiești gălățene, mai funcționează <strong>una singură</strong>: <strong>Templul Meseriașilor</strong>, restaurat în 2014.</p>

          <h2>O cicatrice care nu s-a vindecat</h2>
          <p>Distrugerea Sfintei Sofia și a Sfântului Gheorghe au lăsat o gaură imensă în identitatea orașului Galați — o cicatrice urbană care nu s-a vindecat niciodată complet. Plăcuțe comemorative și două cartiere care îi poartă numele lui Mazepa sunt singurele urme ale celor două biserici care au definit silueta Dunării gălățene timp de trei secole.</p>

          <div class="sources">
            <p><strong>Surse</strong></p>
            <ul>
              <li>Pr. Eugen Drăgoi, <em>Scurtă cronologie a istoriei bisericești în spațiul gălățean</em> — datele de zidire/sfințire a bisericilor.</li>
              <li>Cilinca Victor, <em>Abecedar istoric gălățean</em>.</li>
              <li>Săndel Dumitru, <em>Galațiul, așa cum mi-l amintesc</em>, vol. VIII–IX.</li>
              <li>Mărturii orale ale gălățenilor martori ai demolării (1962–1963).</li>
              <li>Arhive municipale Galați — documentele privind autorizarea demolărilor și construcția Casei de Cultură.</li>
            </ul>
          </div>
        `,
      },
    ];
    // 1918 has a full article inline; 1821, 1856, 1907, 1944, 1962 have
    // structured content rendered dynamically via the `content` field below.
    const READY_EVENT_IDS = new Set(['1821', '1856', '1907', '1918', '1940', '1944', '1962']);

    const eventsGrid = document.getElementById('events-grid');
    const evSingle = document.getElementById('ev-single');
    const evHero = document.getElementById('events-hero');
    const evBack = document.getElementById('ev-back');
    const ev1918 = document.getElementById('ev-1918');
    const evSoon = document.getElementById('ev-soon');

    function renderEventsGrid() {
      if (!eventsGrid) return;
      // Curated card for 1918 first, then the rest in chronological order
      const items = [...EVENT_ARTICLES, {
        id: '1918', year: '1918', title: 'Bătălia de la Galați',
        eyebrow: '20 – 22 ianuarie 1918',
        hook: 'Cum o garnizoană fragmentară a oprit Corpul 4 Siberian bolșevizat și a schimbat soarta Europei.',
        cover: '../assets/images/comic-1918/cover.jpg',
      }].sort((a, b) => parseInt(a.id, 10) - parseInt(b.id, 10));
      eventsGrid.innerHTML = items.map((ev) => {
        const ready = READY_EVENT_IDS.has(ev.id);
        const status = ready ? 'Descoperă povestea' : 'În pregătire';
        const cover = ev.cover || (EVENT_ARTICLES.find(e => e.id === ev.id) || {}).cover;
        if (cover) {
          return `<button class="ev-card has-cover" type="button" data-event="${ev.id}" data-status="${ready ? 'ready' : 'soon'}">
            <img class="card-cover" src="${escapeHtml(cover)}" alt="${escapeHtml(ev.title)}" loading="lazy">
            <div class="card-body">
              <div class="card-year">${escapeHtml(ev.year)}</div>
              <h3 class="card-title">${escapeHtml(ev.title)}</h3>
              <p class="card-hook">${escapeHtml(ev.hook)}</p>
              <span class="card-status">${status} →</span>
            </div>
          </button>`;
        }
        return `<button class="ev-card" type="button" data-event="${ev.id}" data-status="${ready ? 'ready' : 'soon'}">
          <div class="card-year">${escapeHtml(ev.year)}</div>
          <h3 class="card-title">${escapeHtml(ev.title)}</h3>
          <p class="card-hook">${escapeHtml(ev.hook)}</p>
          <span class="card-status">${status} →</span>
        </button>`;
      }).join('');
      eventsGrid.querySelectorAll('.ev-card').forEach(card => {
        card.addEventListener('click', () => {
          const id = card.dataset.event;
          location.hash = '#stories/' + id;
        });
      });
    }

    // ─── Comic reader for 1918 article ───
    (function setupComicReader() {
      const reader = document.getElementById('comic-reader');
      if (!reader) return;
      const total = parseInt(reader.dataset.pages, 10) || 18;
      const pageImg = document.getElementById('comic-page');
      const prevBtn = document.getElementById('comic-prev');
      const nextBtn = document.getElementById('comic-next');
      const counter = document.getElementById('comic-counter');
      const thumbs = document.getElementById('comic-thumbs');
      const fsBtn = document.getElementById('comic-fullscreen');
      let currentPage = 1;
      const pad = (n) => String(n).padStart(2, '0');
      const pageUrl = (n) => `../assets/images/comic-1918/${pad(n)}.jpg`;
      const thumbUrl = (n) => `../assets/images/comic-1918/thumb-${pad(n)}.jpg`;

      // Build thumbs
      const thumbButtons = [];
      for (let i = 1; i <= total; i++) {
        const b = document.createElement('button');
        b.type = 'button';
        b.dataset.page = String(i);
        b.title = `Pagina ${i}`;
        const img = document.createElement('img');
        img.src = thumbUrl(i);
        img.alt = `Pagina ${i}`;
        img.loading = 'lazy';
        b.appendChild(img);
        b.addEventListener('click', () => goTo(i));
        thumbs.appendChild(b);
        thumbButtons.push(b);
      }

      function goTo(n) {
        if (n < 1 || n > total) return;
        currentPage = n;
        pageImg.src = pageUrl(n);
        pageImg.alt = `Bătălia de la Galați — pagina ${n}`;
        counter.textContent = `Pagina ${n} / ${total}`;
        prevBtn.disabled = (n === 1);
        nextBtn.disabled = (n === total);
        thumbButtons.forEach((b, idx) => b.classList.toggle('active', idx + 1 === n));
        // Scroll active thumb into view
        const active = thumbButtons[n - 1];
        if (active) active.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
      prevBtn.addEventListener('click', () => goTo(currentPage - 1));
      nextBtn.addEventListener('click', () => goTo(currentPage + 1));

      // Keyboard nav when reader is visible (1918 article open) or fullscreen
      document.addEventListener('keydown', (e) => {
        const onPage = !reader.closest('.ev-content[hidden]') && (
          reader.classList.contains('fullscreen') ||
          (location.hash || '').startsWith('#stories/1918')
        );
        if (!onPage) return;
        // Don't hijack arrows when typing in inputs
        const t = e.target;
        if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
        if (e.key === 'ArrowLeft') { e.preventDefault(); goTo(currentPage - 1); }
        else if (e.key === 'ArrowRight') { e.preventDefault(); goTo(currentPage + 1); }
        else if (e.key === 'Escape' && reader.classList.contains('fullscreen')) {
          toggleFullscreen(false);
        }
      });

      // Touch swipe
      let touchStartX = null;
      pageImg.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
      pageImg.addEventListener('touchend', (e) => {
        if (touchStartX === null) return;
        const dx = e.changedTouches[0].clientX - touchStartX;
        if (Math.abs(dx) > 40) goTo(currentPage + (dx < 0 ? 1 : -1));
        touchStartX = null;
      });

      function toggleFullscreen(force) {
        const want = (typeof force === 'boolean') ? force : !reader.classList.contains('fullscreen');
        reader.classList.toggle('fullscreen', want);
        fsBtn.textContent = want ? '× Închide' : '⤢ Fullscreen';
      }
      fsBtn.addEventListener('click', () => toggleFullscreen());

      goTo(1);
    })();
    renderEventsGrid();

    function showEventsGrid() {
      if (evHero) evHero.hidden = false;
      if (eventsGrid) eventsGrid.hidden = false;
      if (evSingle) evSingle.hidden = true;
    }
    function showEventArticle(id) {
      if (evHero) evHero.hidden = true;
      if (eventsGrid) eventsGrid.hidden = true;
      if (!evSingle) return;
      evSingle.hidden = false;
      const evFull = document.getElementById('ev-full');
      // Hide all article slots, then unhide the matching one
      [ev1918, evSoon, evFull].forEach(a => { if (a) a.hidden = true; });
      if (id === '1918' && ev1918) {
        ev1918.hidden = false;
      } else {
        const meta = EVENT_ARTICLES.find(e => e.id === id);
        if (!meta) {
          // Unknown id → fall back to grid
          location.hash = '#stories';
          return;
        }
        // Article with full HTML content (e.g. 1944) → use ev-full template
        if (meta.content && evFull) {
          const heroImg = evFull.querySelector('[data-slot="cover"]');
          if (heroImg) {
            if (meta.coverFull || meta.cover) {
              heroImg.src = meta.coverFull || meta.cover;
              heroImg.alt = meta.title;
              heroImg.hidden = false;
            } else {
              heroImg.hidden = true;
              heroImg.src = '';
            }
          }
          evFull.querySelector('[data-slot="eyebrow"]').textContent = meta.eyebrow || meta.year;
          evFull.querySelector('[data-slot="title"]').textContent = meta.title;
          evFull.querySelector('[data-slot="hook"]').textContent = meta.hook || '';
          evFull.querySelector('[data-slot="content"]').innerHTML = meta.content;
          evFull.hidden = false;
        } else if (evSoon) {
          // Fallback: schiță template (arc narativ + surse)
          evSoon.querySelector('[data-slot="eyebrow"]').textContent = meta.eyebrow || (meta.year + ' · în pregătire');
          evSoon.querySelector('[data-slot="title"]').textContent = meta.title;
          evSoon.querySelector('[data-slot="hook"]').textContent = meta.hook || '';
          const arcEl = evSoon.querySelector('[data-slot="arc"]');
          arcEl.innerHTML = (meta.arc || []).map(b => `<li>${escapeHtml(b)}</li>`).join('');
          evSoon.querySelector('[data-slot="sources"]').textContent = meta.sources || '';
          evSoon.hidden = false;
        }
      }
      // Scroll page to top after content swap
      const pg = document.getElementById('page-events');
      if (pg) pg.scrollTop = 0;
    }
    function syncEventsRoute() {
      const h = location.hash || '';
      const m = h.match(/^#stories\/([\w-]+)$/);
      if (m) {
        showEventArticle(m[1]);
      } else {
        showEventsGrid();
      }
    }
    if (evBack) evBack.addEventListener('click', () => { location.hash = '#stories'; });
    window.addEventListener('hashchange', syncEventsRoute);
    // Initial sync — preserve any sub-route the user may have landed on
    // (activatePage above may have stripped it via replaceState).
    {
      const _ih = ctx.initialHash || '';
      const subAtBoot = _ih.split('/').slice(1).join('/');
      const baseAtBoot = _ih.split('/')[0];
      if (baseAtBoot === 'stories' && subAtBoot) {
        if (history.replaceState) history.replaceState(null, '', '#stories/' + subAtBoot);
        showEventArticle(subAtBoot);
      } else {
        syncEventsRoute();
      }
    }

}
