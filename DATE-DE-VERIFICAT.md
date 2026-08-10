# Date de verificat

*Contradicții găsite în timpul rescrierii fișelor (august 2026). Nimic de aici nu a fost „corectat" tăcut: regula din [CONTENT-STYLE.md](CONTENT-STYLE.md) §5 e că redactarea nu schimbă istorie. Textul păstrează varianta din sursă, iar discrepanța ajunge aici, ca listă de lucru.*

Se completează pe măsură ce avansează rescrierea.

---

## 1. `year_built` contrazis de textul fișei

Câmpul `year_built` alimentează filtrul de cronologie: dacă e greșit, pinul apare sau dispare la anul greșit când tragi de riglă.

| Fișă | `year_built` | Ce spune textul | Observație |
|---|---|---|---|
| `loc-6` Mănăstirea Sf. Arhangheli (Metoc) | **1853** | teren cumpărat 1798, construcție **1801-1805** | 1853 e anul inaugurării *școlii* ridicate pe terenul donat în 1846, nu al bisericii. Cea mai clară eroare din lot. |
| `loc-32` Casa Maksay | **1911** | „Abia în **1922**, după consolidarea succesului profesional, Maksay a construit imobilul propriu" | textul spune 1922 de două ori |
| `loc-40` Casa Vincenzo Fanciotti | **1851** | clădire „de la jumătatea secolului XIX", cumpărată în **1867** | 1851 e anul înființării firmei, nu al clădirii |
| `loc-19` Casa Charles Foscolo | **1887** | niciun an de construcție | 1887 e anul în care Foscolo devine gerant al reprezentanței Spaniei |
| `loc-16` Casa Balș | **1913** | teren cumpărat 1913, clădire ridicată **1915** | |
| `loc-18` Casa Bănică Grigorescu | **1911** | „ridicată în 1911", apoi „finalizată… în jurul anului **1916**" | contradicție internă în text |
| `loc-10` Biserica Sf. Nicolae | **1845** | zidărie încheiată **1840**, sfințire **1845** | ambele păstrate în fișă |
| `loc-24` Casa Gheorghiadis | `null` | datare oficială ~1880 vs. documente 1898-1913 | textul semnalează singur conflictul |
| `loc-13` Bustul lui Spiridon Vrânceanu | **1958** | titlul conține „(1916)" | 1916 = anul morții, 1958 = dezvelirea. Nu e eroare, dar induce în eroare. |
| `loc-46` Liceul „C. Angelescu" | **1925** | sediul de pe N. Bălcescu s-a construit **1888-1890** | 1925 e inaugurarea *internatului*, ridicat în altă zonă |
| `loc-48` Consulatul Cehoslovaciei | **1926** | „ridicată **înainte de** anul 1926" | |

### 1b. Tipar sistematic: la consulate, `year_built` e anul instituției, nu al clădirii

Șase fișe confirmate până acum. Efectul e același: pinul apare pe hartă la anul greșit când tragi de cronologie.

| Fișă | `year_built` | Ce reprezintă de fapt |
|---|---|---|
| `loc-44` Cercul Militar | 1876 | înființarea instituției; sediul din str. Eroilor, dat în folosință **1898-1899** |
| `loc-50` Consulatul Franței | 1802 | numirea primului sub-comisar francez, nu construcția imobilului „Casele Mendl" |
| `loc-49` Consulat | 1881 | înființarea consulatului |
| `loc-51` Viceconsulat | 1832 | deschiderea viceconsulatului („1832 **sau** 1835" în text) |
| `loc-19` Casa Charles Foscolo | 1887 | anul în care Foscolo devine gerant al reprezentanței Spaniei |
| `loc-40` Casa Fanciotti | 1851 | înființarea firmei Vincenzo Fanciotti & Co. |

**De decis:** dacă `year_built` înseamnă „anul clădirii" (cum îl folosește filtrul de cronologie), aceste valori sunt greșite. Alternativa e un câmp separat pentru anul instituției.

### 1c. `year_built` lipsă deși textul dă anul

| Fișă | `year_built` | Ce spune textul |
|---|---|---|
| `loc-41` | `null` | 1883, extins 1914 |
| `loc-45` | `null` | 1867, extins 1926 |

### 1d. Loturile 08-12

| Fișă | `year_built` | Ce spune textul |
|---|---|---|
| `loc-90` | **1907** | clădirea s-a construit **1898-1902**; 1907 e redeschiderea după desființarea din 1905 |
| `loc-95` | **1820** | textul și fișa LMI GL-II-m-B-03067 dau **1817-1828** |
| `loc-106` Azilul Frigator | **1838** | **anul nașterii lui Dimitrie Frigator** (1838-1907) |
| `loc-59` Fabrica Josiek | **1866** | **anul nașterii lui Ludwig Josiek**; companie fondată 1890, fabrică inaugurată 1894 |
| `loc-57` Consulatul Spaniei | **1881** | stabilirea relațiilor România-Spania; clădirea cumpărată **1929** |
| `loc-56` Consulatul Italiei | **1833** | înființarea viceconsulatului; clădirea de pe str. Gării cumpărată **1923** |
| `loc-143` Palatul Școlilor | **1864** | înființarea școlii; Palatul s-a construit **1922-1932** |
| `loc-144` Teatrul | **1956** | anul instituției; pe teren exista Vila Elisa de la început de secol XX |
| `loc-123` Hotel Continental | **1938** | anul în care Bodega „Azuga" devine Restaurant, nu al construcției |
| `loc-125` | **1926** | data celei mai vechi cărți poștale circulate |
| `loc-126` Hotel Metropolitan | **1927** | anul în care hotelul e menționat ca „nou și mare" |
| `loc-122` Hotel Bristol | **1880** | **nu apare nicăieri în text** (textul dă doar proprietatea 1900-1940) |
| `loc-54` Consulatul Portugaliei | `null` | textul datează construcția **1909-1912** |
| `loc-102`, `loc-103` | `null` | statuia din 1972, respectiv dezvelirea din 1956 |
| `loc-118`, `loc-119` | `null` | „sfârșitul secolului al XIX-lea" |
| `loc-96` | `null` | secolul XVII |

### 1e. `status` contrazis de text

| Fișă | `status` | Ce spune textul |
|---|---|---|
| `loc-114` Gara | `demolished`, `year_demolished: 1945` | „clădirea actuală păstrează volumul și aspectul gării interbelice" |
| `loc-110` | `demolished` | ansamblul a supraviețuit: familia Petrina → Spitalul Trancu-Iași → Casa Copilului |
| `loc-150` | `active` | clădire închisă și abandonată după anii 1990, scoasă la vânzare |
| `loc-112` | `active` | „deasupra **fostei** săli" — nu mai funcționează ca cinematograf |
| `loc-141` | `lost`, fără `year_demolished` | textul nu dă niciun an de dispariție |

### 1f. `category` greșită

| Fișă | `category` | Ce este de fapt |
|---|---|---|
| `loc-98` | Educație | spital |
| `loc-106` | Educație | azil de bătrâni |
| `loc-144` | Case istorice | teatru în funcțiune |

## 2. Câmpul `location` conține numele clădirii, nu adresa

Adresa reală apare doar în corpul textului. Afectează afișarea sub titlu și `streetAddress` din JSON-LD.

| Fișă | `location` actual | Adresa reală din text |
|---|---|---|
| `loc-15` | „Casa Sebastian Eustațiu" | nu apare nicăieri |
| `loc-18` | numele clădirii | str. Domnească nr. 100 |
| `loc-19` | numele clădirii | str. Domnească nr. 49 |
| `loc-20` | numele clădirii | str. Logofăt Tăutu |
| `loc-22` | numele clădirii | nu apare nicăieri |
| `loc-25` | numele clădirii | str. Mihai Bravu nr. 44 |
| `loc-52` | „Str. Domnească nr. 106" | adresa **nu apare nicăieri în text**; textul dă Domnească nr. 90 bis (Norvegia), Serfioti nr. 2 (Suedia) și, din 1937, Mihai Bravu nr. 9. De verificat de unde vine nr. 106. |

Igienă: titlurile `loc-43`, `loc-48`, `loc-49`, `loc-50`, `loc-51`, `loc-52` au spațiu final.

## 3. Contradicții interne în text

| Fișă | Problemă |
|---|---|
| `loc-28` Casa Ioan D. Prodrom | mandatul de primar apare ca „martie 1923 - ianuarie **1924**" în corp și „martie 1923 - ianuarie **1925**" în final |
| `loc-21` Casa de Cultură | arhitecta apare cu două nume: „Sara Likyardopol" și „Sara Marcovici-Lichiardopol" |
| `loc-2` BNR Galați | adresa e pe str. Fraternității, dar terenul e descris ca fiind cumpărat „pe strada Municipală" |
| `loc-36` Casa Negroponte | primul consulat american (1850) a funcționat la casa lui Anton Negroponte de pe actuala str. Alexandru Ioan Cuza, **nu** la Domnească 82 (casa ramurii lui Ulise, teren cumpărat 1866). Capcană ușor de propagat greșit. |
| `loc-139` | textul atribuie lui **Ștefan cel Mare** danii din „1467, **1515-1526**". Domnia lui se încheie în 1504, deci intervalul nu poate fi al lui. |
| `loc-61` Casa Anastasiu | afacerea ar fi trecut la fii „după 1924", dar Nikola moare **în 1924** |
| `loc-54` | „Fiica **Alexandrei** Macri", deși soția introdusă anterior e **Elena** Macri (n. Climis); Alexandra nu apare nicăieri altundeva |
| `loc-58` | geamia apare ca „Hamidie" în subtitlu și „Hamide" în corp |
| `loc-63` Familia Fernic | anul nașterii lui George Fernic oscilează (1897 sau 1900), la fel anul morții lui Gheorghe (1942 sau 1943) |
| `loc-94` | „schisma rusă din 1656" în titlu vs. reforma Nikon **1652-1666** în corp |
| `loc-96` | demolarea ar fi pulverizat „șapte secole de istorie", deși biserica e datată în secolul XVII (circa 360 de ani) |
| `loc-104` | titlul spune „13 Iunie 1916", textul spune că evenimentul comemorat e din **ianuarie 1918** (calendar iulian) |

### 3a bis. Afirmații eliminate pentru că se contraziceau în același text

Singurele cazuri în care redactarea a **scos o afirmație factuală**, nu doar ton. Ambele sunt contradicții interne, nu corecturi față de o sursă externă.

| Fișă | Ce s-a scos | De ce |
|---|---|---|
| `loc-214` Puricani | „prezență umană **continuă**" | textul afirmă în aceeași frază un „hiatus de mii de ani" între orizontul paleolitic și cel Hallstatt; cele două nu pot fi ambele adevărate |
| `loc-152` | „REABILITAREA 2026 — 10 MILIOANE EURO" din subtitlu | corpul textului și `excerpt` dau **10,3 milioane lei** dintr-un total de peste 14 milioane lei |
| `loc-161` | a doua atribuire a numelor de la Mausoleul Mărăști | originalul le atribuia și Războiului de Independență 1877-1878, și Primului Război Mondial; Mărăști e monument de Primul Război Mondial |
| `loc-96` | „șapte secole de istorie" | biserica e datată în secolul XVII, deci circa 360 de ani |

De verificat dacă alegerea e cea corectă în fiecare caz; alternativa ar fi păstrarea ambelor variante, marcate ca incerte.

### 3b. Câmp `location` gol, deși textul dă adresa

`loc-141`, `loc-146` (poalele Dealului Tirighina), `loc-147`, `loc-148` (intersecția bd. Dunărea cu bd. Galați), `loc-149`, `loc-150` (str. Domnească 23-25).

## 4. Fișe care au nevoie de cercetare, nu de redactare

Material insuficient pentru forma completă. Au primit forma scurtă din §2.3, fără umplutură.

| Fișă | Situația |
|---|---|
| `loc-171` Casa de pe strada Instrucției | 101 caractere în total |
| `loc-27` Casa Inginer Theodor Demetrescu | sursa e o notă de documentare; Săndel Dumitru vol. V-X și Cilinca verificați, fără rezultat |
| `loc-22` Casa Dr. Dumitru Lazăr | aproape tot textul e ipoteză: „cel mai probabil", „prin analogie". Fără an, adresă, arhitect sau traseu de proprietate |
| `loc-19` Casa Charles Foscolo | sursa admite singură că „informațiile arhitecturale detaliate sunt limitate" |
| `loc-6` Metoc | ~1.400 caractere de conținut real |
| `loc-164`, `loc-157`, `loc-124`, `loc-129`, `loc-128` | sub 800 de caractere fiecare |

## 3c. Duplicate

Am comparat toate perechile de locații aflate la sub 400 m una de alta, cu titluri și conținut suprapuse. Din 155 de candidați bruți, **unul singur** era duplicat real.

**Rezolvat: `loc-68` fuzionat în `loc-242` și eliminat** (9 august 2026). Ambele descriau aceeași clădire, căsuța din curtea Bisericii Bulgărești de la str. N. Bălcescu nr. 33, unde a funcționat Școala Bulgară și unde a locuit Hristo Botev în 1871-1872. S-a păstrat `loc-242`, care are cod LMI, statut de monument, bloc de surse și starea actuală documentată; din `loc-68` s-au preluat numele ziarului lansat în 1871 și biografia lui Botev dinainte de Galați, plus o imagine de galerie. Câmpul `article` al lui `loc-68` a fost transferat la `loc-242`, ca să nu se rupă opririle din `tour-personalitatile-galati` și `tour-diversitate-etnica`.

> Lecția: **tururile leagă locațiile prin câmpul `article`, nu prin `id`.** Ștergerea unei locații rupe tăcut opriri de tur, iar `grep loc-68` nu le găsește. Vezi §3d.

**Verificate și păstrate separat**, deși păreau duplicate:

| Pereche | De ce nu sunt duplicate |
|---|---|
| `loc-3` (Biserica Bulgărească) vs `loc-242` | clădiri distincte la aceeași adresă: biserica și căsuța din curtea ei |
| `loc-124` (Hotel Metropol, pe Domnească) vs `loc-126` (Hotel Metropolitan, Fraternității 3) | hoteluri diferite; textul lui `loc-124` le enumeră pe amândouă |
| `loc-67` (Grădina Publică) vs `loc-296` (Kartodromul din Grădina Publică) | parcul și pista de karting din el |
| `loc-115` (Castrul roman Tirighina) vs `loc-184` (Barboși) | situl arheologic și localitatea |

### Conflict nerezolvat: două „Cinema Republica"

`loc-150` și `loc-231` pretind amândouă numele, dar se exclud:

| | `loc-150` | `loc-231` |
|---|---|---|
| adresă | str. Domnească nr. 23-25 | Piața Regală, latura estică |
| origine | Teatrul Odeon, 1911, Apostol P. Papadopol | Cinema Trianon, 1905 |
| stare | `active` | `demolished`, 1990 |

Sandel Dumitru vol. VII spune explicit: grădina Palatului Cuza a fost „vândută pentru cinema **Trianon (astăzi Republica)**", iar alt fragment plasează Trianonul pe traseul corsoului, pornind din Piața Regală. Asta susține varianta din `loc-231`. Nu explică însă de ce `loc-150` revendică același nume pentru clădirea de pe Domnească. Fie au existat succesiv două săli numite Republica, fie una dintre fișe atribuie greșit numele. **Necesită verificare într-o sursă locală; nu am modificat niciuna.**

### 3d. `article` ca cheie străină — rezolvat

221 de locații aveau un câmp `article` care indica `../assets/articles/<slug>/index.html`, un folder care **nu există**. Câmpul nu era randat nicăieri ca link, dar era singura cheie prin care `tours.json` lega opririle de locații. Consecințe: ștergerea sau redenumirea unei locații rupea opriri de tur în tăcere (`tours.js` filtrează fără mesaj), iar `grep <loc-id>` nu găsea legăturile.

**Migrat pe `loc_id` (9 august 2026).** Cele 101 opriri rezolvabile au trecut la `{loc_id, note}`; `core-map.js`, `tours.js`, `generate_static_pages.py` și `build_tour_routes.py` folosesc acum join pe `id`. Validatorul dă **eroare**, nu avertisment, la o oprire fără `loc_id` sau cu unul inexistent, și avertizează dacă două opriri indică aceeași fișă.

**Patru opriri au fost scoase**, fiind nerezolvabile — erau planificate, dar locațiile nu au fost create niciodată. Se pot readăuga când apar fișele:

| Tur | Nota opririi |
|---|---|
| `tour-consulate` | „5. Casa Macri." (familia Macri apare doar în textul altor fișe, nu are fișă proprie) |
| `tour-comunism` | „3. Proiectul urban-comunitar Țiglina." (concept, nu clădire anume) |
| `tour-scoli` | „3. Liceul de băieți «Notre Dame de Sion»." (`loc-142` e institutul de fete, nu se potrivește) |
| `tour-evreiesc` | „1. Casa unui negustor evreu (de identificat)." (marcat explicit neidentificat în original) |

**Două opriri duplicate unite.** În `tour-personalitatile-galati` și `tour-evreiesc`, „Casa Osias Auschnitt" și „Casa Max Auschnitt" indicau amândouă `loc-71`, care acoperă ambii frați. Contorul turului arăta cu una mai mult decât punctele de pe hartă. Notele au fost păstrate ambele.

> Soluția de fond ar fi **împărțirea lui `loc-71` în două locații** (Osias, N. Bălcescu 82; Max, Domnească 70). Ar reface cele două opriri distincte și ar recupera și conținutul tăiat de plafonul de lungime (§4a).

**Checkpoint-ul rupt** din `pe-urmele-domnesti.cp7` („Consiliul Județean Galați") indica `loc-154`, inexistent, iar nicio locație din date nu corespunde clădirii. `loc_id` a fost scos; checkpoint-ul are lat/lon proprii, deci jocul funcționează neschimbat.

## 3e. Numere de pagină fabricate în citări — corectat

Zece fișe citau pagini care nu pot exista: `vol. VII, p. 17507`, `vol. X, p. 13468-13476`, `vol. VI, p. 14881`. Volumele lui Sandel Dumitru au câteva sute de pagini, nu zeci de mii. Sunt **offset-uri de caractere din fișierele OCR**, notate greșit ca pagini de carte, probabil la o trecere anterioară de redactare asistată. Doi agenți le-au identificat independent.

Erau **moștenite din datele originale**, nu introduse la rescriere (verificat față de `git HEAD`).

**Corectat pe 9 august 2026:** numerele imposibile (peste 1.000) au fost eliminate, volumul și subiectul citării rămân. `loc-92`, `loc-125`, `loc-130`, `loc-133`, `loc-136`, `loc-253`, `loc-255`, `loc-257`, `loc-272`, `loc-275`.

Înainte:
```
• Dumitru, Sandel, vol. VII, p. 17507 (platforma de est, Sf. Spiridon)
```
După:
```
• Dumitru, Sandel, vol. VII (platforma de est, Sf. Spiridon)
```

Motivul: un număr de pagină inventat face citarea să pară verificabilă când nu e. Volumul singur e corect și onest. Paginile reale se pot adăuga la o verificare în volumele tipărite.

## 4a. Conținut tăiat de plafonul de lungime (de recuperat)

Singurele două fișe unde rescrierea a pierdut **fapte cercetate**, nu retorică. Cauza nu e redactarea, ci plafonul dur de 5.500 de caractere din CONTENT-STYLE §4, pe care l-am stabilit pentru lizibilitate. Textul integral e păstrat în istoricul git, deci nimic nu e pierdut definitiv.

**`loc-71` Auschnitt** (12.825 → 5.494 caractere). Au căzut:
- ambiguitatea surselor privind ordinea celor cinci copii ai lui Osias
- digresiunea despre dinastia Rajahilor Albi ai Sarawakului și logodna cu Eleonore Brooke, împreună cu sursa Nigel Barley / *The Telegraph*
- legătura cu Vickers
- calitatea de membru în conducerea Societății Române de Telefoane

**`loc-73`** (8.858 → 5.500 caractere). A căzut blocul „Alte repere":
- loja „Discipolii lui Pythagora", 1865
- moartea secretarului Henri Bellenger, 1892
- înlocuirea lui Ion Bălăceanu cu generalul Pencovici și familia acestuia

**De decis.** Trei variante: (a) se acceptă pierderea, (b) se ridică plafonul pentru aceste două fișe, (c) materialul se mută în intrări separate, ceea ce ar fi cea mai bună soluție pentru `loc-71`, unde textul acoperă de fapt mai multe biografii din familia Auschnitt. Aceeași observație a apărut și la `loc-63` (familia Fernic), unde sursa acoperă trei biografii.

Recuperarea textului original:
```bash
git show <sha-de-dinainte>:galati_map/locations.json | python3 -c "import json,sys; print([l for l in json.load(sys.stdin) if l['id']=='loc-71'][0]['description'])"
```

## 4b. Erori factuale prinse la rescriere

Afirmații care nu se susțin. Faptele verificabile din jurul lor au rămas.

| Fișă | Ce spunea | Problema |
|---|---|---|
| `loc-278` | Sf. Apostol Andrei, „30 noiembrie, Ziua Națională a României" | Ziua Națională e **1 decembrie** |
| `loc-204` Conacul Conachi | Costache Conachi, mort la 4 februarie 1849, e „gazda" întâlnirilor pentru Mica Unire **din 1859** | imposibil cronologic |
| `loc-192` Mănăstirea Adam | turcii distrug biserica de lemn în **1630**, mănăstirea e ctitorită la 14 octombrie **1652** | distrugerea precede fondarea cu 22 de ani |
| `loc-139` | danii de la Ștefan cel Mare „1467, **1515-1526**" | domnia se încheie în 1504 |
| `loc-206` Dealul Bujorului | „documente din sec. XV (Petru Rareș, Irimia Movilă, Grigore Alexandru Ghica)" | Rareș e sec. XVI, Movilă XVI/XVII, Ghica XVIII |
| `loc-305` Cuca | „un nume care îl va însoți **581 de ani**" | de la 1448 la 2026 sunt 578 |
| `loc-273` | „45 de ani de muncă" distruși în 1944 | incompatibil cu nașterea în 1890 și casa din 1929 |
| `loc-280` | clădirile din **1882-1884** numite „pavilioane medicale **interbelice**" | anacronism |
| `loc-170` | cifrele din **1891** ilustrează „urbanizarea Galațiului **interbelic**" | 1891 nu e interbelic |
| `loc-255` | anunță „6 hoteluri" și „4 cofetării", enumeră **7**, respectiv **5** | |
| `loc-291` | „150 profesori" + „150 cercetători", dar „personal total: 200" | |
| `loc-291` | „7 facultăți" | includ un departament și un liceu; sunt de fapt 5 facultăți |

### Atribuiri contradictorii între `excerpt` și `description`

| Fișă | `excerpt` | `description` |
|---|---|---|
| `loc-255` | statuia lui Costache Negri e a lui **Frederic Storck** | e a lui **Ioan Iordănescu** (probabil confuzie cu statuia lui Eminescu, `loc-259`, care chiar e a lui Storck) |
| `loc-256` | „**semifinalistă** a Cupei României 1976" | **finala** 1975-1976 cu Steaua |
| `loc-168` | 1976 | `year_built` = **1966** |

## 5. Reziduuri de conversație eliminate

Fragmente în care textul i se adresa proprietarului site-ului, nu cititorului. Șterse, nu reformulate.

| Fișă | Ce conținea |
|---|---|
| `loc-1` | „Spune-mi, care este următorul punct de interes de pe listă?" |
| `loc-54` Consulatul Portugaliei | „Dacă vrei să construiești ceva în jurul identității orașului, gen tururi, VR sau storytelling, asta e genul de loc care poate ține singur un capitol întreg." |
| `loc-55` Consulatul Prusiei | formulare similară |
| `loc-149`, `loc-151`, `loc-174`, `loc-181`, `loc-182`, `loc-183`, `loc-184`, `loc-185` și încă 3 | deschidere „Iată principalele repere…" / „Iată câteva dintre cele mai fascinante secrete…" |

Linterul le prinde acum automat (`scripts/lint_content.py`, secțiunea „Reziduuri de conversație").

### 5b. Alte categorii găsite în valul 2

**Note către proprietarul site-ului**, vizibile publicului:

| Fișă | Text |
|---|---|
| `loc-183` | „Ai dori să adaugi o mențiune despre «Castelul de la Movileni (ruine)» în harta digitală? Este un punct de atracție excelent pentru vânătorii de comori istorice!" |
| `loc-300` | „Tu, ca utilizator local, poți corecta prin admin dacă ai o referință mai bună." |
| `loc-303` | formulare identică |
| `loc-248`, `loc-253` | „NOTĂ: Această intrare e creată pe baza datelor LMI…" / „…pe baza dovezii fotografice…" |
| `loc-255` | „Mergi fizic în zona Bălcescu × Brăilei, deschide pagina… pe telefon, permite accesul la cameră și locație" |

**Metadate interne și note de redactare** rămase în textul public:

| Fișă | Ce conținea |
|---|---|
| `loc-236` | secțiune întreagă `CONTEXT — RUTĂ PUB CRAWL`, citând cheatsheet-ul intern („Etapa 1 a Pub Crawl Cultural, loc lângă loc-105") |
| `loc-235` | „(loc-141 — Fabrica Goetz e deja pe hartă)" |
| `loc-289`, `loc-290`, `loc-291` | „loc-? în trivia: tr-17", „vezi triv-17", „loc-?" |
| `loc-293` | „acum loc-276 în datele tale, «Ostrovul Prut»" |
| `loc-295`, `loc-296`, plus tot lotul 12 | blocuri „J. LEGĂTURI CU ALTE LOCAȚII" / „LEGĂTURI CU ALTE LOCAȚII", construite din id-uri interne |
| `loc-239`, `loc-272`, `loc-274`, `loc-275` | coordonate GPS lăsate în proză, referințe rupte `(loc-?)` |
| `loc-194` | „Coordonatele pinului sunt aproximative, pot fi rafinate când se obțin date GPS precise" |
| `loc-231` | subtitlu rămas în engleză: „CONTEXT MORE BROADLY" |
| `loc-197` | fragment în engleză: „(composed of villages: Brăhășești, Corcioveni…)" |

**Greșeli de tipar corectate:** `loc-226` „a rasolit complet zona" → „a ras locul"; `loc-254` „Întreprinderea Întreprinderea de Întreprinderi Metalurgice de Stat"; `loc-297` „pisicultura" → „piscicultură"; `loc-138` „Industrași" păstrat neatins, fiind într-o citare.

---

## 6. Ridicate la traducerea în engleză (loturile 01-24, august 2026)

Traducerea a pus româna sub o a doua pereche de ochi: ca să redea o frază în
altă limbă, agentul trebuie mai întâi să o înțeleagă, iar unde nu se putea a
semnalat în loc să inventeze. Nimic din ce urmează nu a fost corectat tacit.

### 6a. Trimiteri interne greșite — CORECTAT

Singurele reparate direct, fiindcă sunt erori de pointer verificabile din date,
nu chestiuni de istorie. Validatorul le prinde de acum (`validate_text_hygiene`).

| Fișă | Scria | Este | De ce era greșit |
|---|---|---|---|
| `loc-266` | „Stadionul Dunărea (loc-167)", de două ori | `loc-218` | `loc-167` e Foișorul de pe Faleză; cititorul ajungea pe un foișor |
| `loc-258` | „George Maksay (loc-81)" | `loc-32` | `loc-81` nu există; Casa Maksay e `loc-32` |
| `loc-262` | „Institutul «Notre Dame de Sion» (loc-179)" | `loc-142` | `loc-179` nu există |

### 6b. Datări care se bat cap în cap în aceeași fișă

| Fișă | Contradicția |
|---|---|
| `loc-114` | gara: „distrusă în Al Doilea Război Mondial" vs. „demolată în 2005" (vol. VII). Fișa spune explicit că sursele nu se acordă |
| `loc-118` | palatul: 1923-1925 la Sandel Dumitru, 1921-1923 în descrierea de arhivă, iar `REPERE` dă 1921-1925, interval care le acoperă pe amândouă |
| `loc-261` | demolarea: cutremurul din 1977 vs. „demolată în anii '70"; și profilul sportiv „două decenii din 1958", abandonat abia în 1982, deși școala e redenumită în 1977 |
| `loc-254` | „fabrica «Titan», din 1912" în `REPERE`, „a început ca fabrică de cuie" în rezumat, iar textul nu dă anul deschiderii fabricii Coltifeanu |

### 6c. Adrese duble

| Fișă | Contradicția |
|---|---|
| `loc-273` | Bd. George Coșbuc nr. 207 **sau** 203, după Decretul 92/1950 |
| `loc-254` | Str. Portului nr. 203, „azi 213" |

### 6d. Afirmații de verificat în sursă

| Fișă | Ce e de verificat |
|---|---|
| `loc-116` | „primul consul al Austro-Ungariei la Galați", cu osemintele așezate în 1825. Austro-Ungaria există din 1867: anacronism, tradus fidel |
| `loc-291` | „Rectorul este profesorul William B. Harvey" la o universitate privată românească. Neobișnuit, posibil învechit |
| `loc-280` | secțiunea se cheamă `ÎN CELE DOUĂ RĂZBOAIE:` dar acoperă trei |
| `loc-253` | firma apare și `Götz`, și `Goetz`, în aceeași fișă. Ambele grafii păstrate acolo unde erau |
| `loc-268` | inscripția latină scrie „redivivea", nu „redivivae". Reprodusă verbatim, fiind citat |
| `loc-296` | comparația finală cu cele 355 de milioane de lei ale patinoarului e juxtapunere redacțională, nu fapt din sursă |

### 6e. Formulări românești ambigue, traduse fidel fără a fi rezolvate

| Fișă | Ambiguitatea |
|---|---|
| `loc-251` | citatul din Sandel Dumitru, vol. VI, p. 351: „…petrecea în mod curent datorită prezenței active a zarafilor…". Subiectul lipsește, iar „petrecea" poate însemna și „își petrecea timpul", și „chefuia" |
| `loc-292` | „au mai rămas Zătunul și Brateșul mic, redus la circa 2.000 de hectare": cele 2.000 ha sunt doar ale Brateșului mic sau ale amândurora? |
| `loc-285` | „cu publicul așezat și pe scenă" la galele de kickboxing: „scenă" e ciudat pentru un patinoar |
| `loc-254` | „trei mașini de plumbuit tabla" (1924, din Anglia): acoperire cu plumb sau cositorire? |
| `loc-257` | „tovarășul care urma să aterizeze cu elicopterul «La pastila»": „La pastila" pare poreclă locală de loc, nelămurită în text |
| `loc-295` | „decontaminarea… estimată la încă milioane de euro": vag în original, păstrat vag |

### 6f. Convenții stabilite pentru engleză

Decise de utilizator și aplicate mecanic prin `scripts/harmonize_en.py`
(856 de înlocuiri) și `scripts/clean_short_fields.py` (225 de câmpuri).

- **Adrese:** `Domnească St. no. 56`. Erau patru convenții concurente în paralel
  (`Strada X` 131 de fișe, `Str. X` 32, `X St.` 32, `X Street` 39), plus încă
  patru în `title_en`/`location_en`.
- **Nume proprii:** forma engleză consacrată. `King Michael` (nu `King Mihai`),
  `Kyiv`, `Chernivtsi`, `Chernihiv`.
- **Neatinse deliberat:** blocul `SOURCES:`, fiindcă titlurile de carte sunt
  titluri românești; și textul din ghilimele, fiindcă citatele se redau cum au
  fost scrise. 23 de reziduuri în citate și 8 în `SOURCES:` sunt corecte așa.
- **`Piața`, `Calea`, `Bulevardul`, `Faleza`** rămân nume proprii întregi; nu au
  făcut obiectul deciziei.

### 6g. Defect de randare găsit în trecere — CORECTAT

`loc-264` … `loc-271` aveau terminatoare de linie Windows în `description_en`.
Rendererul (`core-map.js`, `renderBlock`) taie blocurile pe `\n\n`, secvență care
nu apare niciodată în `\r\n\r\n`, așa că engleza acestor opt fișe se afișa pe
site ca **un singur bloc** de text în loc de 29-31: fără titlul `KEY FACTS`, fără
liste, fără subtitluri. `lint_content.py` le dădea „conforme" fiindcă el
normalizează `\r\n` înainte de a valida, iar rendererul nu. Reparat de
traducerea lotului 21; validatorul îl prinde de acum.

---

## 7. Punctuația din restul datelor (august 2026)

Curățarea de ton trecuse doar prin `description` și `excerpt` din
`locations.json`. Toate celelalte date au rămas neatinse și mai purtau **1.190
de semne interzise** în 969 de câmpuri: cronologia, trivia, tururile, vânătorile
de comori, legendele, evenimentele de pe timeline, legendele de galerie și cele
din Alta Data. Curățate cu `scripts/clean_punctuation.py`.

Cel mai vizibil caz erau legendele de galerie: `caption`/`caption_en` ajung în
`<figcaption>` și în lightbox (`core-map.js:657-660`), iar `alt` e citit de
cititoarele de ecran și e rezervă pentru legendă când aceasta lipsește.

`manual_overrides.json` (318 semne), `unplaced_locations.json` și
`geocode_cache.json` au fost lăsate neatinse: nu sunt încărcate de front-end.
La fel câmpul `geocoded_as` (81), unde liniuța face parte din notația de
provenență, nu din proză.

### 7a. Ghilimele neîmperecheate

51 de câmpuri aveau un număr **impar** de ghilimele, adică o pereche care nu se
închide în datele sursă. Normalizarea alternează deschis/închis, deci pe un
număr impar ar fi produs un semn de deschidere fără pereche. Scriptul le sare și
le raportează, în loc să strice textul.

| Fișier și câmp | Câmpuri |
|---|---|
| `cronologie.json` · `entries[].text` | 31 |
| `cronologie.json` · `rosters.disasters[].text` | 6 |
| `cronologie.json` · `rosters.factories[].text` | 5 |
| `cronologie.json` · `rosters.population[].ctx` | 4 |
| `cronologie.json` · `entries[].label_en` | 2 |
| `locations.json` · `gallery[].alt` și `gallery[].caption` | 2 |
| `galati-altadata.json` · `caption_ro` | 1 |

**Șase reparate**, acolo unde perechea se deducea fără să ghicesc:

| Câmp | Ce era | Ce s-a făcut |
|---|---|---|
| `loc-110` · `caption` și `alt` | trei ghilimele drepte pe două nume de instituții | împerecheate: „Grigore Trancu-Iași”, „Casa Copilu” |
| `galati-altadata.json` · `caption_ro` | citatul se închidea după „Seminarul Teologic." dar nu se deschidea nicăieri | deschis la început, atribuirea „Text și foto: prof. Ion Ca…" rămâne în afara citatului |
| `cronologie.json` 1596 · `text` și `label_en` | la fel, citat închis după „români neaoși." fără deschidere, în ambele limbi | deschis la început |
| `cronologie.json` 1852 · `label_en` | începea cu resturi de curățare, „Negri., «When at the head…", și citatul rămânea deschis | prefixul scos, citatul închis |

**Rămân 45**, toate în câmpurile lungi din `cronologie.json`. Sunt texte
OCR-izate din surse tipărite, unde ghilimelele lipsesc din scanare, iar
cronologia amestecă și ghilimele franceze « » cu cele românești. Se repară
citind sursa, nu ghicind unde se închidea citatul.

### 7c. `label_en` din cronologie NU e incomplet

La prima verificare a părut că engleza cronologiei e trunchiată: 77 din 161 de
intrări au `label_en` sub 50% din lungimea lui `text`, iar anul 1879 are 157 de
caractere de engleză față de 7.485 de română. **Nu e un defect.** `label_en` e
prin construcție eticheta de tooltip a riglei cronologice, pretrunchiată și
pretradusă (`timeline.js:119`), iar româna trece la randare prin
`chronologyLabel`, care taie la 260 de caractere la graniță de frază. Cele
141-294 de caractere sunt exact ținta. Notat aici ca să nu se mai „repare".

### 7b. Săgeți păstrate intenționat

Două săgeți din `treasure_hunts.json` NU au fost înlocuite: în cifrul vânătorii
de comori, `→` înseamnă „se substituie cu" (`ABCDEFGH...XYZ →
XCVISPBDHAWLROQFKTNYJZEUMG`, `F=23, I=34, etc. → FINAL FOISOR FALEZA`). Acolo e
notație, nu punctuație. Scriptul înlocuiește doar săgețile dintre cifre și pe
cele patru enumerate explicit în `ARROW_TEXT`.

---

## 8. `year_built`, `year_founded` și `status` — REZOLVAT (august 2026)

Punctele 1, 1b, 1c, 1d, 1e și parțial 1f de mai sus au fost rezolvate. Aplicat cu
`scripts/fix_years.py`, unde fiecare valoare are ca sursă bullet-ul din propria
fișă, citat în cod.

### 8a. Decizia

`year_built` **înseamnă anul clădirii**. Alimentează `passesTimeline` din
`core-map.js`, care e o întrebare pur fizică: „lucrul din pin exista în anul X?".
Anul instituției trece într-un câmp nou, `year_founded`, ca să nu se piardă.

Motivul e concret: pinul stă pe o adresă. Consulatul Italiei, înființat în 1833,
avea `year_built: 1833`, dar sediul de pe strada Gării a fost cumpărat în 1923.
Cine trăgea rigla la 1840 vedea un consulat la o adresă unde nu era nimic al lor.

### 8b. Ce s-a schimbat

**24 de valori `year_built` corectate.** Cele mai grave erau două ani de naștere
folosiți ca ani de clădire: `loc-106` avea 1838, anul nașterii lui Dimitrie
Frigator, deși azilul e proiectat în 1905 și terminat în 1908; `loc-59` avea
1866, anul nașterii lui Ludwig Josiek, deși fabrica s-a inaugurat în 1894.

Nouă fișe s-au mutat pe riglă cu 22 până la 90 de ani:

| Fișă | Era | Este | De ce |
|---|---|---|---|
| `loc-56` Consulatul Italiei | 1833 | 1923 | anul instituției vs. cumpărarea sediului |
| `loc-106` Azilul Frigator | 1838 | 1905 | nașterea fondatorului vs. proiectul clădirii |
| `loc-143` Palatul Școlilor | 1864 | 1922 | înființarea școlii vs. construcția palatului |
| `loc-6` Biserica Metoc | 1853 | 1801 | 1853 era școala de alături |
| `loc-144` Teatrul Nae Leonard | 1956 | 1900 | instituția vs. Vila Elisa, clădirea reală |
| `loc-57` Consulatul Spaniei | 1881 | 1930 | 1881 nu corespundea nici instituției (1870) |
| `loc-123` Hotel Continental | 1938 | 1897 | 1938 era trecerea bodegii la restaurant |
| `loc-46` Colegiul V. Alecsandri | 1925 | 1888 | 1925 era internatul, ridicat în altă zonă |
| `loc-59` Fabrica Josiek | 1866 | 1894 | nașterea fondatorului vs. inaugurarea fabricii |

**13 câmpuri `year_founded` adăugate**, pentru consulate, școli și teatru.

**13 goluri completate.** Din 50 de fișe fără `year_built` au rămas 37. Contează
fiindcă `passesTimeline` afișează fișele fără an doar de la 1990 încolo
(`core-map.js:261`): erau invizibile pe toată rigla istorică, deși textul lor
dădea anul.

**`status`:** `loc-110` de la `demolished` la `lost` (fabrica de bere a dispărut,
dar clădirile stau în picioare cu alte funcțiuni), `loc-150` de la `active` la
`ruin` (închisă și abandonată după anii 1990).

**`category`:** `loc-98` (spital) și `loc-106` (azil) scoase din „Educație".

### 8c. Defect de randare găsit în trecere — CORECTAT

Ramura „fără `year_built`" din `passesTimeline` întorcea `timelineYear >= 1990`
**fără să se uite nici la `year_demolished`, nici la `status`**. Opt clădiri
demolate apăreau pe harta anilor 1990-2020 ca și cum ar sta în picioare: Hotel
Metropol, Café Trocadero, Cofetăria Centrală, Restaurant Canellos, Palatul
Foresta și altele.

Patru s-au reparat prin date, primind anul din propriul text. Pentru celelalte
patru, care nu au niciun an în surse, ramura verifică acum `status`: dacă nu
știm când a apărut, dar știm că nu mai există, nu o mai afișăm ca existentă.
Test de regresie în `tests/smoke.spec.js`.

### 8d. Rămâne de decis

**Taxonomia de categorii e inconsecventă**, dincolo de cele două fișe corectate.
Nu există categorie de sănătate, iar cele 9 fișe de spital sau azil stau în cinci
categorii diferite: „Industrial / Tehnic" (4), „Educație" (2, acum mutate),
„Alte locuri", „Case istorice", „Comerț istoric". La fel cele 9 fișe de teatru
sau cinema, împrăștiate în cinci categorii. Reparația cere două categorii noi
(„Sănătate", „Cultură"), cu chei `cat.*` în `i18n.js` pentru ambele limbi, și
reclasificarea a circa 18 fișe.

**Demolate cu an de construcție dar fără an de demolare.** Rămân vizibile pe
riglă până în prezent, fiindcă `year_demolished` e gol. Nu e defect de logică, ci
gol de date: se repară aflând anul din surse, nu schimbând filtrul.

**37 de fișe fără `year_built`**, vizibile doar de la 1990. Textul lor nu dă
niciun an.
