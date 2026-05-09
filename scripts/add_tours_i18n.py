#!/usr/bin/env python3
"""Adds i18n.en and i18n.fr fields to galati_map/tours.json for each tour and stop.

Run from project root: python3 scripts/add_tours_i18n.py
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TOURS = ROOT / "galati_map" / "tours.json"

# Translations keyed by tour id. For stops we use a list (same order as tours.json stops).
T = {
    "tour-pub-crawl-cultural": {
        "en": {
            "title": "Cultural Pub Crawl through Galați",
            "subtitle": "5 stages · ~4-4.5 h · from Țiglina to the Riverfront and back",
            "category": "Cultural",
            "description": "A 5-stage themed walk that blends the history of the port-city with a route of pubs along Hops Gallery → Bodega → Union Jack (Riverfront) → DAily → Craft → back to Hops Gallery. At each map stop you'll find the matching story — from the communist bricks of Țiglina to the Roman fortress of Tirighina, from Ploll beer to the free port, from the legend of the Danube tunnel to the Battle of Galați 1918.\n\nNarrative source: the official pub-crawl guide cheatsheet (Surse/cheatsheet.txt). Pace it as you wish — each stop is a milestone, not a constraint.",
            "stops": [
                "STAGE 1 — Hops Gallery (start). The Țiglina Cinema, opened on 13 April 1964, with an 800-seat Cinemascope hall and air conditioning — spectacular for its time. Above Hops Gallery there used to be the 'Galați' restaurant, nicknamed 'The Destroyer' because steelworkers walked in on payday and walked out destroyed.",
                "The 'Progresul' monumental column, raised in 1966 by Péter Balogh — sculpted registers with scenes of work in industry and agriculture. Classic 1960s propaganda visual language, but artistically interesting.",
                "(Looking south-west) Tirighina-Bărboși — the Roman fortress on Tirighina hill (1st-2nd c. AD), which controlled the confluence of the Siret with the Danube. The name 'Țiglina' does NOT come from the Romans, but from the old tile factories. Curiosity: above the Roman fort lies a paleontological reserve with mollusk fossils 400,000 years old.",
                "House of Culture of the Trade Unions, inaugurated 4 October 1969, dedicated at its opening to Gheorghe Gheorghiu-Dej. On the esplanade, between 1971-1989, stood the bust of Dej — torn down by the crowd on 22 December 1989.",
                "In front of today's House of Culture stood the 'Saint Sophia' Church — foundation stone laid in 1872, demolished 'with a tank' in December 1963, in the depths of winter. A typical victim of communist systematizations.",
                "'Costache Negri' National College — founded in 1877 in Ismail (today Ukraine) on the initiative of V. A. Urechia. Moved to Galați in 1878 after the reoccupation of southern Bessarabia. Spiru Haret secured one million lei for its own building.",
                "STAGE 2 — Ploll Brewery, the first brewery in Galați (1842, Marcu Schein), taken over after 1860 by the Czech Josef Ploll. By the end of the 19th century it was the most expensive Romanian beer — a litre cost double the price of wine. Delivery with 24 horses and 12 pairs of oxen. The Ploll factory → Petrina family → Trancu-Iași Hospital → Children's Home.",
                "Palace of the European Commission of the Danube (today the V.A. Urechia Library). The European Commission of the Danube began its activity in 1856 in Galați — the first European supranational organisation in Romania. Its own flag, employees from many countries, status of extraterritoriality. A piece of Galați was 'European soil' 100 years before the EU.",
                "Cuza Vodă House (Cuza Museum, Domnească 80). Before the Union, Cuza and Costache Negri seriously considered Galați as the new capital of the Principalities — the city was Moldavia's largest commercial port and host to the ECD.",
                "STAGE 3 — Precista Church (1643-1647, Vasile Lupu). The oldest building in Galați. Not just a church — a fortress: walls 1.80 m thick, fortified bridge with 28 loopholes, watchtower. THE LEGEND OF THE TUNNEL UNDER THE DANUBE: Moldavian boyars supposedly dug a tunnel under the Danube to keep their fortunes safe from the Turks. The kernel of truth: the Museum's director confirms a real 300 m gallery between Precista and St. George.",
                "St. George fortified church (vanished 1962). A pair with Precista, 300 m to the east. The Cossack hetman Ivan Mazepa, the anti-Russian Ukrainian hero, was buried here in 1709 (he appears today on the Ukrainian 10-hryvnia banknote). Brutal demolition: Navrom employees pulled the church into the Danube with tugboats after the walls resisted water injection under the foundation.",
                "Statue of Ion C. Brătianu, on the Riverfront. Free-port bonus: between 1837 and 1882 Galați was a free port — any ship could dock without taxes. Lines departed from here to Marseille, Genoa, Istanbul, Alexandria, Piraeus and even New York (with a stopover).",
                "Navigation Palace — the institution that coordinated river traffic. Galați had, at its peak, 21 consulates and vice-consulates, and before the First World War 16 were active — diplomatic density greater than many European capitals have today.",
                "Dockworkers' Monument — on the promenade, east side of the Navigation Palace. Around 1912, a young man named Gheorghe Gheorghiu-Dej worked as a dockworker in the port of Galați. He then went through the CFR workshops, the Grivița strike, and ended up leading communist Romania.",
                "Hotel Bristol (Domnească 30/34) — owned by Spirache Caravelas, vis-à-vis the Municipal Park. In 1907 it hosted the banquet in honour of G. Panu; in 1918 the victorious Romanian troops paraded down Domnească next to Bristol and the 'Prince Mihai' Pâtisserie.",
                "'Where do the elite of Galați meet? At Restaurant, Brewery and Bodega Suré!' — May 1931 ad in 'Vocea Galaţilor'. The Suré brothers had Luther beer and high prices. On 7 August 1932 a fire consumed part of the building — the rival pâtissier Manzavinatos was blamed. By 1 September Suré was reopening, 'Very low prices, entry through the garden'.",
                "Cinema Louvru — in Royal Square, the heart of the free-port city, officially named in 1884. In August 1914 it hosted a dance evening for Belgian refugees. Royal Square was devastated on the night of 24-25 August 1944 by the retreating German army and was never rebuilt.",
                "STAGE 4 — Greek Church 'Transfiguration' (begun 1866, consecrated 1872). Built to the plans of the German architect Knab, with German, Greek and Romanian workers — a symbol of Galați's multiculturalism. The Greek community was the spark of the 1821 revolution: Vasile Karavia's men attacked the Ottoman garrison in February.",
                "Café Trocadero — right opposite the Greek Church. 'A favoured meeting place for discreet, business encounters' (Sandel Dumitru). Frequented by grain exporters, consular agents, lawyers, marine officers.",
                "Synagogue 'Templul Meseriașilor' — the only one still active out of the 22 synagogues of the city. Built 1875, rebuilt 1927-1929, fully restored 2014. The Jewish community was over 20% of the population at its peak, controlling the Mendel shipyard, chemical factories and grain exports.",
                "Apostolic Armenian Church 'Saint Mary' (1858). Armenians have been present in Galați since the 17th c. The first church (wooden) was burned by the Turks in 1821. Many Galați Armenians are descendants of survivors of the 1915 Genocide. Armenian churches have no painted walls — Armenians took their saints with them across the world, in portable icons.",
                "Mavromol Church (1700, founded by Antioh Cantemir). The name comes from the Greek 'mavros molos' (black stone). Centre of the old Greek-merchant community. Mavromol Alley — leading to the church — keeps the name even after the 20th-century systematizations.",
                "STAGE 5 — '13 June 1916' Monument. The only 'triple' battle in Romanian history: in January 1918, 500 Romanian soldiers, sailors and firefighters defeated 12,000 Russian Bolshevik soldiers. The only time air, land and naval forces fought together in a single battle. Galați received 'Croce di Guerra' (Italy) and 'Croix de Guerre' (France).",
                "Union Monument / Cuza Statue, at the Public Garden roundabout. Cuza was pârcălab of Covurlui (with residence in Galați) between 1856 and 1859. Imagine: had the decision gone the other way, today's capital of Romania would be Galați.",
                "Statue of Mihai Eminescu by Frederic Storck — the first Eminescu statue in Romania. Storck is also the author of the 'Industria' and 'Agricultura' allegories on the façade of the Administrative Palace.",
                "'Eternitatea' Cemetery — cosmopolitan bonus: here is buried Shintaro Tsutsumi, a 24-year-old Japanese samurai, who arrived in Galați on the ship 'Kilimaru' three years after the First World War. The tombstone is written in Japanese and French. The Museum of History keeps the 'seppuku sword' said to have belonged to him. End: back to Hops Gallery — you have seen Galați of 1,800 years (from Roman Tirighina to the steel Combinat).",
            ],
        },
        "fr": {
            "title": "Pub Crawl Culturel à Galați",
            "subtitle": "5 étapes · ~4-4,5 h · de Țiglina au front de Danube et retour",
            "category": "Culturel",
            "description": "Une promenade thématique en 5 étapes qui mêle l'histoire de la ville-port à un parcours de bars : Hops Gallery → Bodega → Union Jack (front du Danube) → DAily → Craft → retour à Hops Gallery. À chaque arrêt sur la carte, l'histoire correspondante — des briques communistes de Țiglina au camp romain de Tirighina, de la bière Ploll au port franc, de la légende du tunnel sous le Danube à la Bataille de Galați 1918.\n\nSource narrative : le cheatsheet du guide officiel du pub-crawl (Surse/cheatsheet.txt). Adaptez le rythme — chaque arrêt est un jalon, pas une contrainte.",
            "stops": [
                "ÉTAPE 1 — Hops Gallery (départ). Le cinéma Țiglina, ouvert le 13 avril 1964, avec une salle Cinemascope de 800 places et l'air conditionné — spectaculaire pour l'époque. Au-dessus de Hops Gallery se trouvait le restaurant « Galați », surnommé « Le Destructeur » : les ouvriers du Combinat y entraient le jour de la paie et en ressortaient détruits.",
                "La colonne monumentale « Progresul », érigée en 1966 par Péter Balogh — registres sculptés avec des scènes de travail dans l'industrie et l'agriculture. Langage propagandiste classique des années 1960, mais artistiquement intéressant.",
                "(Vue vers le sud-ouest) Tirighina-Bărboși — le camp romain sur la colline de Tirighina (Ier-IIe s. ap. J.-C.), qui contrôlait la confluence du Siret avec le Danube. Le nom « Țiglina » ne vient PAS des Romains, mais des anciennes briqueteries. Curiosité : au-dessus du camp romain repose une réserve paléontologique avec des fossiles de mollusques vieux de 400 000 ans.",
                "Maison de la Culture des Syndicats, inaugurée le 4 octobre 1969, dédiée à son ouverture à Gheorghe Gheorghiu-Dej. Sur l'esplanade, entre 1971 et 1989, se trouvait le buste de Dej — abattu par la foule le 22 décembre 1989.",
                "Devant l'actuelle Maison de la Culture se trouvait l'église « Sainte Sophie » — pierre fondatrice posée en 1872, démolie « au tank » en décembre 1963, en plein hiver. Une victime typique des systematisations communistes.",
                "Collège National « Costache Negri » — fondé en 1877 à Ismaïl (aujourd'hui en Ukraine) sur l'initiative de V. A. Urechia. Transféré à Galați en 1878 après la réoccupation du sud de la Bessarabie. Spiru Haret a obtenu un million de lei pour son propre bâtiment.",
                "ÉTAPE 2 — Brasserie Ploll, première brasserie de Galați (1842, Marcu Schein), reprise après 1860 par le Tchèque Josef Ploll. À la fin du XIXe siècle, c'était la bière roumaine la plus chère — un litre coûtait le double du vin. Livraison avec 24 chevaux et 12 paires de bœufs. L'usine Ploll → famille Petrina → Hôpital Trancu-Iași → Maison de l'Enfant.",
                "Palais de la Commission Européenne du Danube (aujourd'hui Bibliothèque V.A. Urechia). La Commission Européenne du Danube a commencé son activité en 1856 à Galați — première organisation supranationale européenne en Roumanie. Drapeau propre, employés de plusieurs pays, statut d'extraterritorialité. Un morceau de Galați était « territoire européen » 100 ans avant l'UE.",
                "Maison Cuza Vodă (Musée Cuza, Domnească 80). Avant l'Union, Cuza et Costache Negri envisageaient sérieusement Galați comme nouvelle capitale des Principautés — la ville était le plus grand port commercial de Moldavie et siège de la CED.",
                "ÉTAPE 3 — Église Precista (1643-1647, Vasile Lupu). Le plus ancien bâtiment de Galați. Pas seulement une église — une forteresse : murs de 1,80 m d'épaisseur, pont fortifié avec 28 meurtrières, tour de guet. LA LÉGENDE DU TUNNEL SOUS LE DANUBE : les boyards moldaves auraient creusé un tunnel sous le Danube pour mettre leurs fortunes à l'abri des Turcs. Le noyau de vérité : le directeur du Musée confirme une véritable galerie de 300 m entre Precista et Saint-Georges.",
                "Église fortifiée Saint-Georges (disparue en 1962). Couplée avec Precista, à 300 m à l'est. Le hetman cosaque Ivan Mazepa, héros anti-russe ukrainien, y fut enterré en 1709 (il figure aujourd'hui sur le billet ukrainien de 10 hryvnias). Démolition brutale : les employés de Navrom ont tiré l'église dans le Danube avec des remorqueurs après que les murs aient résisté à l'injection d'eau sous la fondation.",
                "Statue d'Ion C. Brătianu, sur le front de Danube. Bonus port franc : entre 1837 et 1882, Galați était un port franc — tout navire pouvait accoster sans taxes. Des lignes partaient d'ici vers Marseille, Gênes, Istanbul, Alexandrie, Le Pirée et même New York (avec escale).",
                "Palais de la Navigation — l'institution qui coordonnait le trafic fluvial. Galați comptait, à son apogée, 21 consulats et vice-consulats, et avant la Première Guerre mondiale 16 étaient actifs — densité diplomatique supérieure à beaucoup de capitales européennes actuelles.",
                "Monument des Dockers — sur la promenade, côté est du Palais de la Navigation. Vers 1912, un jeune homme nommé Gheorghe Gheorghiu-Dej travaillait comme docker dans le port de Galați. Il passa ensuite par les ateliers CFR, par la grève de Grivița, et finit par diriger la Roumanie communiste.",
                "Hôtel Bristol (Domnească 30/34) — propriété de Spirache Caravelas, en face du Parc Municipal. En 1907, il accueillit le banquet en l'honneur de G. Panu ; en 1918, les troupes roumaines victorieuses défilèrent sur Domnească près du Bristol et de la pâtisserie « Prince Mihai ».",
                "« Où se rencontre l'élite de Galați ? Au Restaurant, Brasserie et Bodega Suré ! » — pub. de mai 1931 dans « Vocea Galaţilor ». Les frères Suré servaient de la bière Luther à des prix élevés. Le 7 août 1932, un incendie a consumé une partie de l'immeuble — le pâtissier rival Manzavinatos fut accusé. Le 1er septembre, Suré rouvrait déjà : « Prix très réduits, entrée par le jardin ».",
                "Cinéma Louvru — dans la Place Royale, cœur de la ville port-franc, baptisée officiellement en 1884. En août 1914, il a accueilli une soirée dansante pour les réfugiés belges. La Place Royale a été dévastée dans la nuit du 24 au 25 août 1944 par l'armée allemande en retraite et n'a jamais été reconstruite.",
                "ÉTAPE 4 — Église Grecque « Transfiguration » (commencée en 1866, consacrée en 1872). Construite sur les plans de l'architecte allemand Knab, avec des ouvriers allemands, grecs et roumains — symbole du multiculturalisme galatzien. La communauté grecque fut l'étincelle de la révolution de 1821 : les hommes de Vasile Karavia attaquèrent en février la garnison ottomane de la ville.",
                "Café Trocadero — juste en face de l'Église Grecque. « Lieu privilégié des rencontres discrètes, d'affaires » (Sandel Dumitru). Fréquenté par les exportateurs de céréales, agents consulaires, avocats, officiers de marine.",
                "Synagogue « Templul Meseriașilor » — la seule active des 22 synagogues de la ville. Construite en 1875, reconstruite en 1927-1929, restaurée intégralement en 2014. La communauté juive représentait plus de 20 % de la population à son apogée, contrôlant le chantier naval Mendel, les fabriques chimiques et les exports de céréales.",
                "Église Apostolique Arménienne « Sainte Marie » (1858). Les Arméniens sont présents à Galați depuis le XVIIe s. La première église (en bois) a été brûlée par les Turcs en 1821. De nombreux Arméniens galatziens sont les descendants des survivants du génocide de 1915. Les églises arméniennes n'ont pas de murs peints — les Arméniens ont emporté leurs saints avec eux à travers le monde, dans des icônes portatives.",
                "Église Mavromol (1700, fondation d'Antioh Cantemir). Le nom vient du grec « mavros molos » (pierre noire). Centre de la vieille communauté gréco-commerciale. L'allée Mavromol — qui mène à l'église — a gardé son nom malgré les systematisations du XXe siècle.",
                "ÉTAPE 5 — Monument « 13 juin 1916 ». La seule bataille « triple » de l'histoire roumaine : en janvier 1918, 500 soldats, marins et pompiers roumains ont vaincu 12 000 soldats bolcheviques russes. La seule fois où les forces aériennes, terrestres et navales ont combattu ensemble dans une seule bataille. Galați reçut la « Croce di Guerra » (Italie) et la « Croix de Guerre » (France).",
                "Monument de l'Union / Statue de Cuza, au rond-point du Jardin Public. Cuza fut pârcălab de Covurlui (avec résidence à Galați) entre 1856 et 1859. Imaginez : si la décision avait été autre, la capitale roumaine d'aujourd'hui serait Galați.",
                "Statue de Mihai Eminescu par Frederic Storck — première statue d'Eminescu en Roumanie. Storck est aussi l'auteur des allégories « Industria » et « Agricultura » sur la façade du Palais Administratif.",
                "Cimetière « Eternitatea » — bonus cosmopolite : ici repose Shintaro Tsutsumi, samouraï japonais de 24 ans, arrivé à Galați avec le navire « Kilimaru » trois ans après la Première Guerre mondiale. La pierre tombale est gravée en japonais et en français. Au Musée d'Histoire est conservé le « sabre de seppuku » qui lui aurait appartenu. Final : retour à Hops Gallery — vous avez vu Galați sur 1 800 ans (de la Tirighina romaine au Combinat sidérurgique).",
            ],
        },
    },

    "tour-palatele-galati": {
        "en": {
            "title": "The Palaces of Galați",
            "subtitle": "10 stops · ~3 h · on foot",
            "category": "architecture",
            "description": "A tour of Galați's historic palaces — the monumental buildings that defined the profile of the port-city in the 19th-20th centuries. From the Navigation Palace built for the Romanian river fleet to the Palace of the European Commission of the Danube (today the V. A. Urechia Library), the route covers the administrative, commercial and cultural institutions that were true 'palaces' of Galați.",
            "stops": [
                "1. Navigation Palace — seat of the Romanian River Navigation (1909-1912), architect Petre Antonescu.",
                "2. Postal Palace — the official post office building.",
                "3. Commercial Palace of Simion Gheorghiu.",
                "4. Administrative Palace — Domnească 56.",
                "5. ECD Palace — today the V. A. Urechia Library.",
                "6. Robescu Palace — today the Children's Palace, work of Ion Mincu.",
                "7. Theological Seminary.",
                "8. Episcopal Palace — today the Museum of Christian Spirituality.",
                "9. Catholic Institute 'Notre Dame de Sion' — founded 1867.",
                "10. Palace of Commercial Schools — Strada Gării 63-65.",
            ],
        },
        "fr": {
            "title": "Les Palais de Galați",
            "subtitle": "10 arrêts · ~3 h · à pied",
            "category": "architecture",
            "description": "Un parcours des palais historiques de Galați — les bâtiments monumentaux qui ont défini le profil de la ville-port aux XIXe-XXe siècles. Du Palais de la Navigation construit pour la flotte fluviale roumaine au Palais de la Commission Européenne du Danube (aujourd'hui la Bibliothèque V. A. Urechia), l'itinéraire couvre les institutions administratives, commerciales et culturelles qui ont été de véritables « palais » de Galați.",
            "stops": [
                "1. Palais de la Navigation — siège de la Navigation Fluviale Roumaine (1909-1912), architecte Petre Antonescu.",
                "2. Palais des Postes — bâtiment de la poste officielle.",
                "3. Palais Commercial de Simion Gheorghiu.",
                "4. Palais Administratif — Domnească 56.",
                "5. Palais de la CED — aujourd'hui Bibliothèque V. A. Urechia.",
                "6. Palais Robescu — aujourd'hui Palais des Enfants, œuvre d'Ion Mincu.",
                "7. Séminaire Théologique.",
                "8. Palais Épiscopal — aujourd'hui Musée de la Spiritualité Chrétienne.",
                "9. Institut Catholique « Notre Dame de Sion » — fondé en 1867.",
                "10. Palais des Écoles Commerciales — Strada Gării 63-65.",
            ],
        },
    },

    "tour-personalitatile-galati": {
        "en": {
            "title": "The Personalities of Galați",
            "subtitle": "22 stops · ~5 h · on foot",
            "category": "biographies",
            "description": "The most comprehensive city tour — 22 houses, monuments and places linked to great personalities: industrialists, doctors, artists, actors, politicians, merchants who shaped the city from the mid-19th to the mid-20th century.",
            "stops": [
                "1. Union Monument / Cuza Statue.",
                "2. Negroponte House — Domnească 82.",
                "3. Max Fischer Houses.",
                "4. Nae Leonard House — the Galați tenor (1886-1928).",
                "5. Ioan D. Prodrom House — mayor.",
                "6. Cavallioti Houses.",
                "7. Aburel Pharmacy.",
                "8. Hristo Botev House — commemorative plaque.",
                "9. Dr. Nicolae Alexandrescu House.",
                "10. Osias Auschnitt House.",
                "11. Max Auschnitt House.",
                "12. Plesnilă Houses.",
                "13. Dumitru Drăgănescu House.",
                "14. Malaxa Houses.",
                "15. Serfioti House.",
                "16. Monferatto House — PNL headquarters.",
                "17. Grand Hotel.",
                "18. Vincenzo Fanciotti House.",
                "19. Fernic Houses — founders of the Mechanical Works (1893).",
                "20. House and workshop of George Maksay — sculptor.",
                "21. Statue of Costache Negri.",
                "22. Statue of Ion C. Brătianu.",
            ],
        },
        "fr": {
            "title": "Les Personnalités de Galați",
            "subtitle": "22 arrêts · ~5 h · à pied",
            "category": "biographies",
            "description": "Le tour le plus complet de la ville — 22 maisons, monuments et lieux liés aux grandes personnalités : industriels, médecins, artistes, acteurs, hommes politiques, commerçants qui ont façonné la ville du milieu du XIXe au milieu du XXe siècle.",
            "stops": [
                "1. Monument de l'Union / Statue de Cuza.",
                "2. Maison Negroponte — Domnească 82.",
                "3. Maisons Max Fischer.",
                "4. Maison Nae Leonard — le ténor galatzien (1886-1928).",
                "5. Maison Ioan D. Prodrom — maire.",
                "6. Maisons Cavallioti.",
                "7. Pharmacie Aburel.",
                "8. Maison Hristo Botev — plaque commémorative.",
                "9. Maison du Dr. Nicolae Alexandrescu.",
                "10. Maison Osias Auschnitt.",
                "11. Maison Max Auschnitt.",
                "12. Maisons Plesnilă.",
                "13. Maison Dumitru Drăgănescu.",
                "14. Maisons Malaxa.",
                "15. Maison Serfioti.",
                "16. Maison Monferatto — siège du PNL.",
                "17. Grand Hôtel.",
                "18. Maison Vincenzo Fanciotti.",
                "19. Maisons Fernic — fondateurs des Usines Mécaniques (1893).",
                "20. Maison et atelier de George Maksay — sculpteur.",
                "21. Statue de Costache Negri.",
                "22. Statue d'Ion C. Brătianu.",
            ],
        },
    },

    "tour-masonic": {
        "en": {
            "title": "Galați's Masonic Heritage",
            "subtitle": "4 stops · ~1 h · on foot",
            "category": "freemasonry",
            "description": "A short tour through the buildings associated with the masonic lodge 'The Disciples of Pythagoras' — the only lodge in Romania whose statute, signed by Prince Cuza himself, is preserved intact at the County Library in Galați.",
            "stops": [
                "1. Balș House — boyar residence.",
                "2. Max Fischer Houses.",
                "3. Cuza Vodă House — Cuza Museum, signatory of the 'Disciples'' statute.",
                "4. Serfioti House — Dr. Aristide Serfioti, founder of the Philanthropic Committee.",
            ],
        },
        "fr": {
            "title": "Le patrimoine maçonnique de Galați",
            "subtitle": "4 arrêts · ~1 h · à pied",
            "category": "franc-maçonnerie",
            "description": "Un court parcours à travers les bâtiments associés à la loge maçonnique « Les Disciples de Pythagore » — la seule loge de Roumanie dont le statut, signé par le Prince Cuza lui-même, est conservé intact à la Bibliothèque Départementale de Galați.",
            "stops": [
                "1. Maison Balș — demeure boyarde.",
                "2. Maisons Max Fischer.",
                "3. Maison Cuza Vodă — Musée Cuza, signataire du statut des « Disciples ».",
                "4. Maison Serfioti — Dr. Aristide Serfioti, fondateur du Comité Philanthropique.",
            ],
        },
    },

    "tour-grec": {
        "en": {
            "title": "Galați's Greek Heritage",
            "subtitle": "5 stops · ~1.5 h · on foot",
            "category": "communities",
            "description": "A tour of the Greek heritage in Galați — a prosperous community with an essential role in maritime trade. The houses and hotels of the great Greek families shaped the central façade.",
            "stops": [
                "1. Gheorghiadis House.",
                "2. Serfioti House — Aristide Serfioti, doctor of Greek origin.",
                "3. Epaminonda Lambrinidi House.",
                "4. Grand Hotel — owner Elie Climi (Climis), Greek.",
                "5. Cavallioti Houses.",
            ],
        },
        "fr": {
            "title": "Le patrimoine grec de Galați",
            "subtitle": "5 arrêts · ~1,5 h · à pied",
            "category": "communautés",
            "description": "Un parcours du patrimoine grec à Galați — une communauté prospère ayant joué un rôle essentiel dans le commerce maritime. Les maisons et hôtels des grandes familles grecques ont façonné la façade centrale.",
            "stops": [
                "1. Maison Gheorghiadis.",
                "2. Maison Serfioti — Aristide Serfioti, médecin d'origine grecque.",
                "3. Maison Epaminonda Lambrinidi.",
                "4. Grand Hôtel — propriétaire Elie Climi (Climis), Grec.",
                "5. Maisons Cavallioti.",
            ],
        },
    },

    "tour-biserici": {
        "en": {
            "title": "Galați's Historic Churches",
            "subtitle": "14 stops · ~3.5 h · on foot",
            "category": "places of worship",
            "description": "A comprehensive tour of the historic places of worship — a cosmopolitan city with Orthodox, Catholic, Lipovan, Evangelical, Calvinist, Armenian Christian communities. The oldest church is Precista (17th c.).",
            "stops": [
                "1. Episcopal Cathedral of St. Nicholas.",
                "2. Lipovan Church — the Russian Old-Rite community.",
                "3. Protestant Evangelical Church.",
                "4. Roman Catholic Church.",
                "5. 'Sts. Apostles Peter and Paul' Church (of the Fishermen).",
                "6. 'Holy Archangels Michael and Gabriel' Church (Metoc).",
                "7. St. Spiridon Church.",
                "8. Mavromol Church — 'Black Stone' (1702).",
                "9. Greek Church (1872).",
                "10. Vovidenia Church.",
                "11. Calvinist Reformed Church.",
                "12. Bust of Spiridon Vrânceanu.",
                "13. Apostolic Armenian Church 'Saint Mary'.",
                "14. Fortified Church 'Saint Precista' (17th c.).",
            ],
        },
        "fr": {
            "title": "Les églises historiques de Galați",
            "subtitle": "14 arrêts · ~3,5 h · à pied",
            "category": "lieux de culte",
            "description": "Un parcours complet des lieux de culte historiques — une ville cosmopolite avec des communautés chrétiennes orthodoxes, catholiques, lipovanes, évangéliques, calvinistes, arméniennes. La plus ancienne église est Precista (XVIIe s.).",
            "stops": [
                "1. Cathédrale Épiscopale Saint-Nicolas.",
                "2. Église Lipovane — la communauté russe du vieux-rite.",
                "3. Église Protestante Évangélique.",
                "4. Église Romaine-Catholique.",
                "5. Église des Saints Apôtres Pierre et Paul (des Pêcheurs).",
                "6. Église des Saints Archanges Michel et Gabriel (Metoc).",
                "7. Église Saint-Spiridon.",
                "8. Église Mavromol — « Pierre Noire » (1702).",
                "9. Église Grecque (1872).",
                "10. Église Vovidenia.",
                "11. Église Réformée Calviniste.",
                "12. Buste de Spiridon Vrânceanu.",
                "13. Église Apostolique Arménienne « Sainte Marie ».",
                "14. Église fortifiée « Sainte Precista » (XVIIe s.).",
            ],
        },
    },

    "tour-consulate": {
        "en": {
            "title": "Galați's Historic Consulates",
            "subtitle": "11 stops · ~3 h · on foot",
            "category": "consulates",
            "description": "A tour of the former diplomatic seats. At the apogee of the free port (1837-1882), Galați hosted 21 consulates — a unique diplomatic density, greater than today's Brussels.",
            "stops": [
                "1. Consulate of Poland.",
                "2. Consulate of Sweden and Norway.",
                "3. Consulate of Switzerland.",
                "4. Consulate of France.",
                "5. Macri House.",
                "6. Consulate of Prussia (later Germany).",
                "7. Consulate of Russia.",
                "8. Consulate of Czechoslovakia.",
                "9. Consulate of Turkey.",
                "10. Consulate of Belgium.",
                "11. Consulate of Greece.",
            ],
        },
        "fr": {
            "title": "Les consulats historiques de Galați",
            "subtitle": "11 arrêts · ~3 h · à pied",
            "category": "consulats",
            "description": "Un parcours des anciens sièges diplomatiques. À l'apogée du port franc (1837-1882), Galați abritait 21 consulats — densité diplomatique unique, plus grande que le Bruxelles d'aujourd'hui.",
            "stops": [
                "1. Consulat de Pologne.",
                "2. Consulat de Suède et de Norvège.",
                "3. Consulat de Suisse.",
                "4. Consulat de France.",
                "5. Maison Macri.",
                "6. Consulat de Prusse (puis d'Allemagne).",
                "7. Consulat de Russie.",
                "8. Consulat de Tchécoslovaquie.",
                "9. Consulat de Turquie.",
                "10. Consulat de Belgique.",
                "11. Consulat de Grèce.",
            ],
        },
    },

    "tour-romanesc": {
        "en": {
            "title": "Romanian Heritage in Galați",
            "subtitle": "7 stops · ~2 h · on foot",
            "category": "heritage",
            "description": "A tour of emblematic Romanian institutions and buildings — the administrative palaces raised after the Great Union, the Orthodox seminary, the Public Garden laid out in English style.",
            "stops": [
                "1. Simion Gheorghiu Commercial Palace.",
                "2. Justice Palace — today the rectorate of UDJ.",
                "3. Fisheries Palace.",
                "4. Robescu Palace.",
                "5. Theological Seminary.",
                "6. Episcopal Palace.",
                "7. Public Garden (1846).",
            ],
        },
        "fr": {
            "title": "Le patrimoine roumain à Galați",
            "subtitle": "7 arrêts · ~2 h · à pied",
            "category": "patrimoine",
            "description": "Un parcours des institutions et bâtiments roumains emblématiques — les palais administratifs édifiés après la Grande Union, le séminaire orthodoxe, le Jardin Public aménagé à l'anglaise.",
            "stops": [
                "1. Palais Commercial Simion Gheorghiu.",
                "2. Palais de Justice — aujourd'hui rectorat de l'UDJ.",
                "3. Palais des Pêcheries.",
                "4. Palais Robescu.",
                "5. Séminaire Théologique.",
                "6. Palais Épiscopal.",
                "7. Jardin Public (1846).",
            ],
        },
    },

    "tour-comunism": {
        "en": {
            "title": "Communism in Galați",
            "subtitle": "4 stops · ~1.5 h · on foot or by tram",
            "category": "20th c.",
            "description": "A tour of the monuments and urban ensembles left by the communist regime (1945-1989) — from the Steel Combinat to the Țiglina and Mazepa neighbourhoods, the modernist fountains and the TV Tower.",
            "stops": [
                "1. '13 June 1916' Monument.",
                "2. 'Dandelion Puff' Fountain — modernist emblem.",
                "3. Țiglina urban-community project.",
                "4. Television Tower.",
            ],
        },
        "fr": {
            "title": "Le communisme à Galați",
            "subtitle": "4 arrêts · ~1,5 h · à pied ou en tram",
            "category": "XXe s.",
            "description": "Un parcours des monuments et ensembles urbains laissés par le régime communiste (1945-1989) — du Combinat sidérurgique aux quartiers Țiglina et Mazepa, en passant par les fontaines modernistes et la Tour TV.",
            "stops": [
                "1. Monument « 13 juin 1916 ».",
                "2. Fontaine « Pissenlit » — emblème moderniste.",
                "3. Projet urbain-communautaire Țiglina.",
                "4. Tour de Télévision.",
            ],
        },
    },

    "tour-diversitate-etnica": {
        "en": {
            "title": "Galați's Ethnic Diversity",
            "subtitle": "4 stops · ~1.5 h · on foot",
            "category": "communities",
            "description": "A short tour through the traces of the ethnic communities — Bulgarians, Jews, Italians, French. In 1900: 36.7% Romanians, 22% Jews, 7% Greeks, 3.4% Italians — cosmopolitan density rare for Eastern Europe.",
            "stops": [
                "1. Grand Hotel — founded by the Swiss Climi/Climis.",
                "2. Hristo Botev House — the Bulgarian poet-revolutionary (1871-1872).",
                "3. Catholic Institute 'Notre Dame de Sion' — French nuns.",
                "4. Atlantic Factory — cotton mill, founded by the Jewish community.",
            ],
        },
        "fr": {
            "title": "La diversité ethnique de Galați",
            "subtitle": "4 arrêts · ~1,5 h · à pied",
            "category": "communautés",
            "description": "Un court parcours à travers les traces des communautés ethniques — Bulgares, Juifs, Italiens, Français. En 1900 : 36,7 % Roumains, 22 % Juifs, 7 % Grecs, 3,4 % Italiens — densité cosmopolite rare pour l'Europe de l'Est.",
            "stops": [
                "1. Grand Hôtel — fondé par le Suisse Climi/Climis.",
                "2. Maison Hristo Botev — le poète-révolutionnaire bulgare (1871-1872).",
                "3. Institut Catholique « Notre Dame de Sion » — religieuses françaises.",
                "4. Usine Atlantic — filature de coton, fondée par la communauté juive.",
            ],
        },
    },

    "tour-scoli": {
        "en": {
            "title": "Galați's Historic Schools",
            "subtitle": "7 stops · ~2 h · on foot",
            "category": "education",
            "description": "A tour of the educational institutions that formed Galați's generations in the 19th-20th centuries — the Theological Seminary, Notre Dame de Sion, the Commercial High Schools, Vasile Alecsandri, the Normal School.",
            "stops": [
                "1. Theological Seminary.",
                "2. Notre Dame de Sion (for girls).",
                "3. Boys' high school 'Notre Dame de Sion'.",
                "4. German School / Evangelical Community School.",
                "5. Palace of Commercial Schools.",
                "6. 'Vasile Alecsandri' National College.",
                "7. 'Costache Negri' Normal School.",
            ],
        },
        "fr": {
            "title": "Les écoles historiques de Galați",
            "subtitle": "7 arrêts · ~2 h · à pied",
            "category": "éducation",
            "description": "Un parcours des établissements scolaires qui ont formé les générations galatziennes aux XIXe-XXe siècles — Séminaire Théologique, Notre Dame de Sion, lycées commerciaux, Vasile Alecsandri, École Normale.",
            "stops": [
                "1. Séminaire Théologique.",
                "2. Notre Dame de Sion (pour jeunes filles).",
                "3. Lycée de garçons « Notre Dame de Sion ».",
                "4. École Allemande / de la Communauté Évangélique.",
                "5. Palais des Écoles Commerciales.",
                "6. Collège National « Vasile Alecsandri ».",
                "7. École Normale « Costache Negri ».",
            ],
        },
    },

    "tour-antreprenoriat": {
        "en": {
            "title": "Galați Entrepreneurship",
            "subtitle": "10 stops · ~3 h · on foot",
            "category": "industry & trade",
            "description": "A tour of the factories, workshops and entrepreneurial houses that made Galați an industrial pole — Atlantic (cotton mill), Năvodul (ropes), Fleming (oil), Aburel pharmacy.",
            "stops": [
                "1. Atlantic Factory — cotton mill.",
                "2. 'Năvodul' Factory — Heinrich Juster ropes.",
                "3. Guiller House.",
                "4. Gheorghiadis House.",
                "5. Max Fischer Houses.",
                "6. Fleming oil factory ('Prutul').",
                "7. Grand Hotel.",
                "8. Epaminonda Lambrinidi House.",
                "9. Malaxa Houses.",
                "10. Aburel Pharmacy.",
            ],
        },
        "fr": {
            "title": "L'entrepreneuriat galatzien",
            "subtitle": "10 arrêts · ~3 h · à pied",
            "category": "industrie & commerce",
            "description": "Un parcours des fabriques, ateliers et maisons entrepreneuriales qui ont fait de Galați un pôle industriel — Atlantic (filature), Năvodul (cordages), Fleming (huile), pharmacie Aburel.",
            "stops": [
                "1. Usine Atlantic — filature de coton.",
                "2. Fabrique « Năvodul » — cordages Heinrich Juster.",
                "3. Maison Guiller.",
                "4. Maison Gheorghiadis.",
                "5. Maisons Max Fischer.",
                "6. Huilerie Fleming (« Prutul »).",
                "7. Grand Hôtel.",
                "8. Maison Epaminonda Lambrinidi.",
                "9. Maisons Malaxa.",
                "10. Pharmacie Aburel.",
            ],
        },
    },

    "tour-evreiesc": {
        "en": {
            "title": "Galați's Jewish Heritage",
            "subtitle": "7 stops · ~2 h · on foot",
            "category": "communities",
            "description": "A tour of the Jewish heritage — in 1900 the ~19,000 Jews out of 95,000 inhabitants (20%) made Galați one of the largest Jewish communities in the region. Today around 100 remain.",
            "stops": [
                "1. House of a Jewish merchant (to be identified).",
                "2. Osias Auschnitt House.",
                "3. Max Auschnitt House — Domnească 70.",
                "4. Max Fischer Houses.",
                "5. Consulate of France — building with Jewish history.",
                "6. Jewish Hospital.",
                "7. Jewish Cemetery.",
            ],
        },
        "fr": {
            "title": "Le patrimoine juif de Galați",
            "subtitle": "7 arrêts · ~2 h · à pied",
            "category": "communautés",
            "description": "Un parcours du patrimoine juif — en 1900, les ~19 000 Juifs sur 95 000 habitants (20 %) faisaient de Galați l'une des plus grandes communautés juives de la région. Aujourd'hui il en reste environ 100.",
            "stops": [
                "1. Maison d'un marchand juif (à identifier).",
                "2. Maison Osias Auschnitt.",
                "3. Maison Max Auschnitt — Domnească 70.",
                "4. Maisons Max Fischer.",
                "5. Consulat de France — bâtiment à histoire juive.",
                "6. Hôpital Juif.",
                "7. Cimetière Juif.",
            ],
        },
    },
}


def main():
    data = json.loads(TOURS.read_text(encoding="utf-8"))
    missing = []
    for tour in data["tours"]:
        tid = tour["id"]
        if tid not in T:
            missing.append(tid)
            continue
        i18n = {}
        for lang in ("en", "fr"):
            tr = T[tid][lang]
            stops_tr = tr["stops"]
            stops = []
            for i, stop in enumerate(tour.get("stops", [])):
                note = stops_tr[i] if i < len(stops_tr) else ""
                stops.append({"note": note})
            i18n[lang] = {
                "title": tr["title"],
                "subtitle": tr["subtitle"],
                "category": tr["category"],
                "description": tr["description"],
                "stops": stops,
            }
        tour["i18n"] = i18n

    TOURS.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote translations for {len(data['tours']) - len(missing)} tours.")
    if missing:
        print(f"Missing translations for: {', '.join(missing)}")


if __name__ == "__main__":
    main()
