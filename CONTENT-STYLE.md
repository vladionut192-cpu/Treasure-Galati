# Formula de conținut — fișele de locație

*Sursă unică de adevăr pentru redactarea câmpului `description` din `locations.json`. Stabilită 9 august 2026. Verificată automat de `scripts/lint_content.py`.*

Scopul: toate cele 288 de fișe să arate și să sune la fel. Astăzi 37% sunt proză pură, 35% au subtitluri și liste, 17% au doar subtitluri. Cititorul nu poate anticipa ce găsește când deschide o fișă.

---

## 1. Ce știe aplicația să randeze

`description` e **text simplu**, nu HTML. Rendererul (`js/modules/core-map.js`, `renderBlock`) recunoaște o gramatică restrânsă. Nu inventa sintaxă în afara ei — orice altceva iese ca paragraf obișnuit.

| Scrii | Iese |
|---|---|
| linie goală dublă (`\n\n`) | separator de bloc |
| bloc cu ≥2 linii care încep cu `•` | `<ul>` |
| linie de intro, apoi linii cu `•` | `<p>` + `<ul>` |
| linie singură, scurtă, terminată cu `:` | `<h4>` subtitlu |
| linie singură, sub 60 de caractere, fără punctuație finală | `<h4>` subtitlu |
| `**text**` | **bold** |
| orice altceva | `<p>` |

Consecință practică: un subtitlu **trebuie** să stea singur în blocul lui, cu linie goală înainte și după.

---

## 2. Structura obligatorie

În această ordine, mereu:

```
[REZUMAT]          fără subtitlu, 2-4 fraze
REPERE:            fișa de date, 4-7 bullets
[SECȚIUNI]         2-4 secțiuni narative cu subtitlu
SURSE:             bullets, dacă există surse
```

### 2.1 Rezumatul

Primul bloc, fără subtitlu. Două până la patru fraze care răspund: **ce este, unde, când, de ce contează**. Trebuie să funcționeze singur — mulți cititori nu trec mai departe.

Nu începe cu „Astăzi,". Nu deschide cu o întrebare retorică. Nu anunța ce urmează („În cele ce urmează vom vedea…").

### 2.2 REPERE

Al doilea bloc, mereu. Subtitlul e exact `REPERE:`.

4-7 bullets, doar fapte verificabile, în această ordine când sunt disponibile.

**Atenție la linia goală după `REPERE:`.** Fără ea, rendererul tratează titlul ca linie de intro și scoate `<p>REPERE:</p>` în loc de subtitlu (vezi §1, regula „linie de intro, apoi bullets"). Aceeași regulă pentru `SURSE:`.

```
REPERE:

• Adresă: str. Eroilor nr. 58 (fostă Ulița Codreanu)
• Ridicată: 1868, primul lăcaș; 1924-1927, clădirea actuală
• Arhitect: [nume], dacă se cunoaște
• Stil: [stil], dacă e relevant
• Stare: în funcțiune / demolată în 1987 / ruină
• Statut: monument istoric, cod LMI GL-II-m-B-03042
• Particularitate: o singură propoziție, ce o face distinctă
```

Reguli:
- Etichetă scurtă, două puncte, apoi valoarea. Fără frază completă în bullet.
- Nu inventa. Dacă nu știi arhitectul, sari peste rând, nu scrie „necunoscut".
- Nu repeta în REPERE o frază care apoi apare identic în narativ.
- Datele din REPERE trebuie să fie coerente cu câmpurile `year_built`, `year_demolished`, `status`, `location` din JSON.

### 2.3 Secțiunile narative

Între 2 și 4 pentru o fișă normală. Fiecare are subtitlu pe linia lui, cu **MAJUSCULE și două puncte**:

```
ÎNCEPUTURILE:

Proză, 1-3 paragrafe.
```

Subtitlul e un substantiv sau o sintagmă scurtă, sub 40 de caractere. Descrie conținutul, nu îl dramatiza. Bun: `ÎNCEPUTURILE:`, `LEGĂTURA CU CLUJUL:`, `DEMOLAREA:`, `CE A MAI RĂMAS:`. Rău: `O POVESTE FASCINANTĂ:`, `UN DESTIN ZBUCIUMAT:`.

Bullets în interiorul unei secțiuni **doar când textul chiar enumeră** (etape, valuri de imigrație, funcții succesive ale clădirii). Nu transforma proza în bullets ca să pară structurată.

#### Forma scurtă

50 de fișe au sub 1.200 de caractere, iar 36 sunt între 1.200 și 1.800. Materialul lor nu susține 2-4 secțiuni. Pentru ele formula se oprește mai devreme:

```
[rezumat]

REPERE:

• …

[o singură secțiune, sau niciuna]
```

**Nu inventa o a doua secțiune ca să atingi forma completă.** O fișă de 700 de caractere, corectă și onestă, e mai bună decât una de 2.000 umflată cu generalități despre „efervescența portului dunărean". Linterul acceptă 0-4 secțiuni sub 1.500 de caractere și cere 2-4 peste acest prag.

> **„Prea scurtă" nu e abatere de redactare.** Regula de lungime minimă (1.200) și regula anti-umplutură se excludeau reciproc pentru fișele cu sursă mică: un original de 900 de caractere nu poate ajunge la 1.200 fără să adauge ceva ce nu era acolo. Linterul marchează acum aceste cazuri cu `cercetare:` și **nu** le numără ca abateri — apar separat, ca datorie de cercetare. 48 de fișe sunt în această situație. Cazul cel mai frapant: `loc-107`, Combinatul Siderurgic, cel mai mare obiectiv industrial al țării, are sub 1.000 de caractere de sursă.

Fișele scurte sunt o problemă de **cercetare**, nu de redactare. Cele mai sărace, pentru o listă de lucru viitoare: `loc-171` (101 car.), `loc-164`, `loc-157`, `loc-124`, `loc-129`, `loc-128`.

### 2.4 SURSE

Ultimul bloc, **doar dacă fișa citează deja surse**. Un bullet per sursă:

```
SURSE:

• Dumitru, Sandel, Galațiul, așa cum mi-l amintesc, vol. VII, p. 142
• Cilinca, Victor, Abecedar istoric gălățean
• Revista Dunărea de Jos, nr. 214, decembrie 2019
```

Autor, titlu, volum și pagină când se știu. Fără URL-uri goale ca sursă unică dacă există o sursă tipărită.

> **Nu inventa surse.** Dacă textul original nu citează nimic, fișa nu primește bloc `SURSE:`. O bibliografie plauzibilă dar neverificată e mai gravă decât lipsa ei: transformă o fișă onestă într-una care pare documentată și nu e. Doar 24 din 288 de fișe au azi o sursă, iar 81 au o secțiune `SURSE:` în text — acelea se păstrează și se reformatează, restul rămân fără.

---

## 3. Tonul

Fraze declarative. Faptul înaintea adjectivului. Dacă o propoziție ar supraviețui ștergerii adjectivelor, adjectivele erau de prisos.

### 3.1 Interzis — tipare AI

Acestea sunt cele găsite efectiv în text, cu numărul de fișe afectate:

| Tipar | Fișe | În loc |
|---|---|---|
| `—` em dash | 176 | virgulă, două puncte, paranteze sau punct |
| „nu doar… ci și" | 23 | enumeră direct |
| „nu este/era doar" | 30 | spune ce este |
| „mărturie a / mărturie vie" | 32 | spune ce dovedește concret |
| „impunător", „impresionant" | 37 | dă dimensiunea reală |
| „un adevărat", „o adevărată" | 17 | scoate cuvântul |
| „veritabil" | 14 | scoate cuvântul |
| „rămâne un simbol / martor" | 10 | spune ce se vede azi |
| deschidere cu „Astăzi," | 38 | reformulează |
| „de-a lungul anilor / timpului" | 19 | dă intervalul |
| „în inima" | 8 | dă strada |
| „deopotrivă", „nu întâmplător" | 2 | scoate |
| „își deschidea porțile", „magnet pentru" | — | descrie faptul |
| „farmec", „miraj", „forfotă" | — | concret sau scos |

Regula generală: dacă propoziția ar merge la fel de bine despre orice altă clădire din orice alt oraș, nu spune nimic. Rescrie-o cu ceva specific.

### 3.1b Reziduuri de conversație

Categorie aparte, găsită în date: fragmente în care textul i se adresează **proprietarului site-ului**, nu cititorului. Nu sunt o chestiune de ton, sunt replici rămase dintr-o sesiune de redactare asistată. **Se șterg complet**, nu se reformulează.

| Tipar | Fișe | Exemplu real |
|---|---|---|
| adresare directă | 3 | `loc-54`: „Dacă **vrei să** construiești ceva în jurul identității orașului, gen tururi, VR sau storytelling…" |
| deschidere „Iată …" | 11 | `loc-149`: „**Iată** principalele repere din istoria comunei" |
| „cele mai fascinante secrete" | — | `loc-183`: „**Iată câteva dintre cele mai fascinante** secrete ale istoriei satului" |
| listă numerotată brută `1. Titlu` | — | `loc-149`: „**1. Perioada Veche: Satul Zaclău**" → devine secțiune cu subtitlu sau bullets |

Listele numerotate de forma `1. Titlu` sunt structură de ciornă: se convertesc în secțiuni cu subtitlu (când fiecare punct are proză) sau în bullets `•` (când sunt enumerări scurte).

> **Citatele nu se rescriu.** Interdicțiile de mai sus privesc vocea redactorului, nu sursele citate. Un citat din Iorgu Iordan care conține „nu numai… ci şi", sau o pisanie cu topică de secol XIX, rămân exact cum sunt. Linterul ignoră conținutul dintre `„ ”` la verificarea formulărilor; păstrează însă verificările de punctuație peste tot, pentru că tipografia e a site-ului, nu a sursei.

### 3.2 Punctuație

- **Fără em dash (`—`)**. Niciodată, nici în RO, nici în EN.
- **`–` (en dash) doar în intervale numerice**: `1924-1927`, `sec. XVII-XVIII`. Nu între cuvinte.
- **Ghilimele românești `„ ”`**, niciodată drepte (`"`). În EN, ghilimele englezești `“ ”`.
- Fără `§`, fără `→` în proză, fără emoji.
- Fără puncte de suspensie decorative.

### 3.3 Bold

`**text**` doar pentru un nume propriu cheie sau o cifră care e miezul secțiunii. Maximum 2-3 per fișă. Bold-ul pe o frază întreagă nu e permis.

---

## 4. Lungimi

| Bloc | Țintă |
|---|---|
| Rezumat | 250-450 caractere |
| REPERE | 4-7 bullets, fiecare sub 90 de caractere |
| O secțiune | 1-3 paragrafe, 300-900 caractere |
| Total fișă | 1.800-4.000 caractere (plafon dur 5.000) |

Mediana actuală e 2.987. Fișele foarte scurte (sub 1.200) au nevoie de cercetare, nu de umplutură: mai bine o fișă scurtă și onestă decât una lungită cu generalități.

Plafonul e 5.000, nu 4.000, pentru un motiv concret: câteva surse au 6.000-9.000 de caractere de cercetare reală. `loc-63` (familia Fernic) are 9.260 în original; comprimat la 5.167 înseamnă deja −44%. A forța 4.000 ar însemna să tai fapte, ceea ce §5 interzice. **Peste 4.000 se trece doar când sursa chiar are materialul**, niciodată prin adăugare.

Regula care contează de fapt nu e plafonul, ci direcția: **o fișă rescrisă nu trebuie să câștige conținut.** Linterul o verifică pe fiecare lot, comparând cu textul original din git (`--baseline`, implicit `HEAD`).

Toleranța e `+10% și +400 de caractere`, pentru că blocul `REPERE` **repetă intenționat** fapte din narativ: șapte bullets cu etichete înseamnă ~350 de caractere de structură. La o fișă de 1.300 de caractere asta e deja +11% fără să se fi adăugat nimic. Peste ambele praguri simultan, însă, e conținut nou.

---

## 5. Ce nu se schimbă

- **Faptele, numele, datele, cifrele.** Restructurarea nu inventează și nu corectează istorie. Dacă o dată pare greșită, se semnalează, nu se schimbă tăcut.
- **Citările existente.** Se mută în `SURSE:`, nu se elimină.
- Câmpurile `title`, `excerpt`, `location`, `year_built` etc. — separate de `description`.

---

## 6. Exemplu complet

Înainte (`loc-8`, formă „proză pură", 2.983 caractere) — fișa începe cu un rând de metadate înghesuit, are subtitluri fără două puncte, „nu doar… ci și", „magnet", „mirajul prosperității", „rămâne un martor demn".

După:

```
Comunitatea maghiară reformată din Galați s-a format în prima jumătate a
secolului XIX, odată cu deschiderea portului către comerțul internațional.
Biserica de pe strada Eroilor a fost singurul lăcaș calvin din fostul județ
Covurlui, iar pastorii ei veneau de la Cluj.

REPERE:

• Adresă: str. Eroilor nr. 58 (fostă Ulița Codreanu)
• Ridicată: 1868, primul lăcaș; 1924-1927, clădirea actuală
• Comunitate: maghiară reformată (calvină)
• Stare: în funcțiune, cca 20 de enoriași
• Particularitate: singura biserică reformată din județul istoric Covurlui

ÎNCEPUTURILE:

Primul lăcaș a fost ridicat în 1868 pe Ulița Codreanu, prin eforturile
pastorului **Czelder Marton**. Pe măsură ce comunitatea a crescut, vechea
clădire a fost înlocuită: biserica actuală s-a construit între 1924 și 1927,
păstrând simplitatea arhitecturii calvine.

LEGĂTURA CU CLUJUL:

Parohia răspundea direct episcopatului calvin din Ardeal și era coordonată
prin protopopul misionar de la București. Pastorii nu erau localnici, ci
trimiși periodic de la Cluj.

Pe lângă biserică a funcționat, la începutul secolului XX, o școală
confesională cu patru clase primare, activă și în anii 1920.

CE A MAI RĂMAS:

Sistematizările comuniste și plecările de după 1989 au redus comunitatea la
aproximativ 20 de enoriași. Biserica nu mai are pastor rezident; slujbele se
țin o dată la două săptămâni, cu un preot care vine de la Constanța.
```

Fișa aceasta **nu** primește bloc `SURSE:`, pentru că textul original nu cita nicio sursă. Vezi §2.4.

---

## 7. Verificare

```bash
python3 scripts/lint_content.py              # toate fișele
python3 scripts/lint_content.py --id loc-8   # una singură
python3 scripts/lint_content.py --strict     # eșuează la orice abatere (CI)
```

Linterul verifică mecanic: marcatorii din §3.1, punctuația din §3.2, ordinea blocurilor din §2 și lungimile din §4. Nu poate verifica tonul — acela rămâne la redactare.

Distincția care contează în raport: **abatere** (defect de redactare, se repară) vs. **`ℹ cercetare:`** (sursă prea subțire, nu se repară prin adăugare de text).

---

## 8. Stare

**288 din 288 de fișe RO sunt în formula nouă** (9 august 2026). Româna e completă.

Rezultatul măsurat, înainte → după:

| marcator | fișe | ocurențe |
|---|---|---|
| em dash `—` | 176 → **0** | 2.436 → **0** |
| ghilimele drepte `"` | 49 → **0** | 407 → **0** |
| săgeți `→` în proză | 28 → **0** | 81 → **0** |
| „nu doar… ci și" | 23 → **0** | |
| „nu era doar" | 30 → **0** | |
| „mărturie" | 32 → **0** | |
| „impunător / impresionant" | 26 → **0** | |
| „un adevărat" | 17 → **0** | |
| „veritabil" | 14 → **0** | |
| deschidere cu „Astăzi," | 38 → **0** | |
| „de-a lungul anilor" | 21 → **0** | |
| „în inima" | 8 → **0** | |
| reziduuri de chat | 3 → **0** | |
| deschidere cu „Iată" | 11 → **0** | |
| liste numerotate brute | 14 → **0** | |

### Îmbogățire din surse (9 august 2026)

După rescriere, cele 37 de fișe marcate `ℹ cercetare:` au fost documentate din corpusul OCR din `Surse/`, cu `scripts/search_sources.py`. Rezultat:

| | înainte | după |
|---|---|---|
| fișe sub 1.200 caractere | 49 | **2** |
| fișe cu bloc `SURSE:` | 96 | **147** |
| total caractere | 958.691 | 816.900 |

Au rămas scurte doar `loc-171` (Casa de pe strada Instrucției) și `loc-157` (Poarta de han turcesc): corpusul de 11,5 MB nu conține nimic despre ele, iar agenții au căutat toate variantele de scriere. Sunt datorie de cercetare de teren sau de arhivă, nu de redactare.

Regula respectată la îmbogățire: **fără sursă citită, fără fapt.** Nimic din memoria modelului. Un agent a găsit un han cu poartă boltită ridicat de Iosef Ekstein în 1882 pe Cuza Vodă 43 și **nu l-a folosit** pentru `loc-157`, pentru că e altă adresă și altă datare; suprapunerea ar fi fost speculație. Alt agent a refuzat să citeze `Surse/cheatsheet.txt`, fiind fișă internă de proiect, nu bibliografie.

### Câmpul `excerpt`

Sincronizat cu rezumatul din `description` (`scripts/sync_excerpts.py`), pentru că rămăsese în urmă: avea 203 em dash-uri, 38 de ghilimele drepte și contrazicea descrierile îmbogățite. Acum cele două câmpuri sunt consecvente prin construcție.

Consecință: meta-descrierile paginilor statice se scurtează la fraze întregi (`meta_description()` în `generate_static_pages.py`). Mediană 144 de caractere, 3 peste 160, față de 276 înainte.

Ce urmează:

- **Engleza (`description_en`) nu a fost atinsă.** Se regenerează din româna finală. Are 2.665 em dash-uri și 216 ghilimele drepte, deci are nevoie de aceeași trecere. Verificare: `python3 scripts/lint_content.py --lang en`.
- Contradicțiile de date sunt în [DATE-DE-VERIFICAT.md](DATE-DE-VERIFICAT.md), necorectate în `locations.json`. E o decizie separată, de conținut.
- Conținutul tăiat de plafonul de lungime la `loc-71` și `loc-73` e recuperabil din git (vezi §4a din același document).

Pentru fișe noi sau modificări ulterioare:

```bash
python3 scripts/lint_content.py --id loc-N     # o fișă
python3 scripts/lint_content.py --strict       # exit 1 la orice abatere (CI)
```

Verificarea de umplutură compară cu `git HEAD`. După comiterea acestei rescrieri, baza devine textul nou — corect pentru modificările viitoare.
