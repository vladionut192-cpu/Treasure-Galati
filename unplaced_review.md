# Recenzie locații neplasate

37 de intrări rămase în [galati_map/unplaced_locations.json](galati_map/unplaced_locations.json), grupate pe situație ca să poți decide rapid ce vrei pentru fiecare.

Legenda recomandărilor:
- ✅ **DEJA PE HARTĂ** — articolul corespunde unei locații existente (poate fi șters din unplaced)
- 👤 **BIOGRAFIC** — e despre o persoană, nu o clădire unică
- 📚 **TEMATIC** — articol-eseu fără un punct fix pe hartă
- 🔁 **DUPLICAT** — apare dublat în lista neplasată
- 📍 **CANDIDAT cu adresă** — are adresă clară în titlu, pot adăuga imediat
- 🔍 **CANDIDAT, necesită cercetare** — entitate reală, dar fără adresă explicită

---

## ✅ Deja pe hartă (15) — pot fi șterse din unplaced

| # | Intrare unplaced | Corespondent pe hartă |
|---|---|---|
| 3 | Catedrala Episcopală din Galați | [loc-116 Catedrala Episcopală „Sfântul Nicolae"](galati_map/locations.json) (Domnească 104) |
| 4 | Palatul de Justiție - Universitatea | Palatul de Justiție (rectoratul UDJ) — deja pe hartă |
| 5 | Palatul Prefectural | „Palatul Administrativ" — deja pe hartă |
| 7 | Casa BALȘ | „Casa Balș" — deja pe hartă |
| 8 | Casa Gheorghiadis | „Casa Gheorghiadis" — deja pe hartă |
| 9 | Casa Auschnitt | „OSIAS AUSCHNITT … MAX AUSCHNITT" — deja pe hartă |
| 11 | Pescărille statului | „Palatul Pescăriilor Statului" — deja pe hartă |
| 13 | Rezidența Regală în timpul dictaturii carliste | Casa Robescu (Mihai Bravu 28) este același loc — deja pe hartă ca „Palatul Robescu" |
| 14 | Catedrala Episcopală din Galați (slug `…-din-gala`) | 🔁 **duplicat al #3** |
| 18 | Fântâna arteziană „Puful de Păpădie" | [loc-121](galati_map/locations.json) — adăugată în această sesiune |
| 21 | IOAN D. PRODROM (Domnească 23-25) | „Casa Ioan D. Prodrom" — deja pe hartă |
| 22 | Familia și casele Plesnilă | „Casa Plesnilă" — deja pe hartă |
| 23 | Casa Gheorghe Radu / Bănică Grigorescu | „Casa Bănică Grigorescu" — deja pe hartă |
| 26 | Foscolo, comercianți și diplomați | „Casa Charles Foscolo" — deja pe hartă |
| 28 | Casa Sebastian Eustațiu (Melchisedec × Mihai Bravu) | „Casa Amiralului Eustațiu Sebastian" — deja pe hartă |
| 30 | Grand Hotel ridicat de Elie Climis (Domnească 30-36) | „Grand Hotel" — deja pe hartă |
| 31 | Biserica fortificată Sf. Gheorghe (dispărută) | [loc-96](galati_map/locations.json) — adăugată în această sesiune |
| 35 | Institutul Catolic / Pensionul Notre Dame de Sion | [loc-117](galati_map/locations.json) — adăugată în această sesiune |
| 1 | Casa Cavallioti | „Casele Cavallioti" — deja pe hartă (verifică dacă e aceeași — articolul Cavallioti e probabil despre familia, nu o casă specifică) |

> **Acțiune sugerată:** confirmă și le scot din `unplaced_locations.json` cu un singur script.

---

## 👤 Biografice — despre persoane, nu locații (5)

Pot rămâne ca articole în arhiva textelor, dar nu au sens ca pin pe hartă. Fiecare are deja, opțional, o casă/cavou ca pin pe hartă.

| # | Intrare | Notă |
|---|---|---|
| 2 | Dimitrie Frigator | Avem deja [loc-106 Azilul Frigator](galati_map/locations.json) ca pin geografic |
| 15 | Ioan D. Prodrom – primar al Galațiului | Casa Prodrom există deja pe hartă |
| 29 | Figuri din familia Drăgănescu | Casa Drăgănescu e separată (vezi #6 mai jos) |
| 33 | Medicul Aristide Serfioti | Avem „Cavoul Serfioti" și „Casa Serfioti" pe hartă |
| 25 | Dall'Orso (familie de comercianți) | Familie de italieni, nu o singură casă identificată |

> **Acțiune sugerată:** le marchez ca „articole biografice" (un câmp `kind: "person"` într-o listă separată), sau pur și simplu le ascund din editor.

---

## 📚 Tematice — articole-eseu fără un punct fix pe hartă (5)

| # | Intrare | Comentariu |
|---|---|---|
| 19 | Proiectul edilitar al Țiglinei | Ar putea fi atașat de un poligon (cartierul Țiglina, deja delimitat în [cartiere.geojson](galati_map/cartiere.geojson)) — nu un pin |
| 20 | Vadurile Galațiului | E vorba de cele 3-4 vaduri istorice (Vadul Cazărmii, Vadul Țiganilor, Vadul Ungurului…). Ar putea deveni 3-4 pinuri, dacă vrei |
| 24 | Despre Consulatul Rusesc | Consulatul rusesc (din 1775) este primul consulat străin din Galați. Adresa istorică nu apare în titlu, dar poate fi cercetată |
| 27 | Despre Charles Cunningham și reprezentanța consulară britanică | La fel — consulatul britanic exista din 1805, dar adresa nu e în titlu |
| 32 | (Foto) Vaporul „Principesa Maria" în Portul Galați | Fotografie, nu o locație fixă |
| 34 | Bătălia de la Galați – 1918 | Articol istoric — avem deja [loc-104 Monumentul „13 Iunie 1916"](galati_map/locations.json) ca reper geografic |
| 37 | Alegoriile Industria și Agricultura – sculptor Frederic Storck | Sunt sculpturile decorative de pe fațada Palatului Administrativ (deja pe hartă) — nu un pin separat |

> **Acțiune sugerată:** dacă vrei, transform „Vadurile Galațiului" și consulatele rus + britanic în pinuri (cu cercetare de adresă). Restul rămân doar ca articole tematice.

---

## 📍 Candidat real cu adresă (1)

| # | Intrare | Adresă | Recomandare |
|---|---|---|---|
| 16 | Casa Nicolae Dumitrescu-Maican (contra-amiral) | str. Domnească nr. 89bis | **Adăugare directă** — am deja coordonatele Domnească 89 (≈ 45.4310, 28.0552). Confirm și o pun? |

---

## 🔍 Candidat real, fără adresă în titlu (4)

Sunt clădiri/familii distincte care merită pin pe hartă, dar trebuie să găsesc adresa în Surse:

| # | Intrare | Ce caut |
|---|---|---|
| 6 | Casa Drăgănescu | adresa exactă (familia Drăgănescu avea mai multe imobile) |
| 10 | Casa Carp | adresa (fam. Carp este o familie boierească moldoveană cu legături la Galați) |
| 12 | Casa Cordali | adresa (familie greacă comercială) |
| 17 | Mandanis și Berilă | adresa (probabil casă comercială pe Domnească sau Brăilei) |
| 36 | Palatul Școlilor Comerciale | localizare exactă (era pe str. Domnească sau în zona Liceului Comercial?) |

> **Acțiune sugerată:** dacă spui „cercetează", scanez vol. V–X Dumitru Săndel + Cilinca Victor după aceste nume și revin cu adrese.

---

## Sumar

- **20 deja pe hartă** (pot fi șterse din `unplaced_locations.json`)
- **5 biografice** (despre persoane, fără pin propriu)
- **7 tematice** (articole-eseu, fără pin natural)
- **1 candidat cu adresă clară** → Casa Dumitrescu-Maican
- **5 candidați care necesită cercetare** → Drăgănescu, Carp, Cordali, Mandanis-Berilă, Palatul Școlilor Comerciale

**Total: 38 intrări** (37 + 1 duplicat #14).

---

## Pașii pe care îi pot face în continuare (alege)

1. Curăț `unplaced_locations.json` de toate cele 20 care sunt deja pe hartă (sigur și reversibil).
2. Adaug **Casa Dumitrescu-Maican** (Domnească 89bis) — un singur pin nou.
3. Cercetez în Surse pentru cele 5 case fără adresă.
4. Fac pinuri separate pentru **Vadurile Galațiului** (3-4 pinuri).
5. Cercetez adresa **Consulatului Rusesc** și **Consulatului Britanic** pentru pinuri.
6. Decid ce fac cu intrările biografice — le mut într-o listă separată sau le las acolo.

Spune-mi ce vrei pe fiecare punct și execut.
