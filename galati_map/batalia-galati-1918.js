// Bătălia de la Galați (12-22 ianuarie 1918) — animație cartografică
// Stil: hartă istorică ilustrativă (referință vizuală: assets/images/battle/battle-galati-1918.png)
// Documentare: Cilinca, Abecedar istoric gălățean (pp. 147-184); George Munteanu,
// Galaţii în timpul Marelui Războiu 1916-1918; Constantin Kiriţescu, Istoria
// războiului pentru întregirea României, vol. III.

class BattleGalatiAnimation extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.duration = Number(this.getAttribute('duration') || 90);
    this.running = true;
    this.startedAt = 0;
    this.elapsed = 0;
    this.raf = null;
    this.sceneIndex = -1;

    // Coords în spațiul SVG (1200×620). Layoutul aproximează harta între
    // 27.78..28.30 lon, 45.30..45.60 lat, cu nordul în sus.
    this.places = {
      galati:        [560, 360],
      tiglina:       [495, 400],
      barbosi:       [450, 470],
      filesti:       [430, 220],
      movileni:      [380, 250],
      smardan:       [350, 160],
      fantanele:     [205, 140],
      catusa:        [225, 385],
      malina:        [115, 410],
      lojnita:       [780, 470],
      brates_c:      [820, 165],
      senderni:      [310, 485],
      grindu:        [905, 555],
      prut_giurgiul: [1080, 445],
      reni:          [1140, 510],
      siret_pod:     [450, 485],
      airbase:       [325,  85]
    };

    // Periferiile referinței (etichete „To X")
    this.directions = [
      { label: 'spre PECHEA',          x: 25,   y: 110 },
      { label: 'spre IAȘI &',          x: 290,  y: 25  },
      { label: 'FÂNTÂNELE',            x: 290,  y: 42  },
      { label: 'spre TECUCI',          x: 25,   y: 290 },
      { label: 'spre RENI',            x: 1192, y: 60, anchor: 'end' }
    ];

    // Dealuri (clustere de puncte cafenii — orientative față de reperele istorice)
    this.hills = [
      // Țiglina ridge
      [475, 405], [490, 415], [505, 410], [515, 420], [495, 425],
      // Movileni / nord
      [365, 270], [380, 280], [395, 275], [385, 295],
      // Cătușa ridge (vest)
      [255, 365], [275, 360], [290, 355], [305, 370],
      // Barboși / sud
      [445, 485], [430, 495], [460, 490],
      // Grindu / sud-est
      [890, 540], [910, 545], [925, 555],
      // Smârdan
      [340, 175], [355, 170], [365, 180]
    ];

    // Unități: poziția (start→end), perioada, etichetă, parte
    const P = this.places;
    this.units = [
      // ROMÂNI — defensiva inițială
      { id: 'ro-marina',    side: 'ro', type: 'navy',  label: 'Marina',         shortcode: 'Rom Mar',  start: P.galati,    end: P.galati,    from: 0,    to: 1.0, persist: true, offset: [30, 24] },
      { id: 'ro-tiglina',   side: 'ro', type: 'art',   label: 'Bat. Țiglina',   shortcode: 'Rom Art',  start: P.tiglina,   end: P.tiglina,   from: 0.10, to: 1.0, persist: true, offset: [-30, -10] },
      { id: 'ro-50inf',     side: 'ro', type: 'inf',   label: 'Reg. 50 Inf.',   shortcode: 'Rom 50',   start: P.galati,    end: P.galati,    from: 0,    to: 1.0, persist: true, offset: [-30, -25] },
      { id: 'ro-filesti',   side: 'ro', type: 'inf',   label: 'Filești',        shortcode: 'Rom F',    start: P.filesti,   end: P.filesti,   from: 0,    to: 1.0, persist: true, offset: [25, -10] },
      { id: 'ro-prut',      side: 'ro', type: 'inf',   label: 'Linia Prut',     shortcode: 'Rom 21B',  start: [945, 410],  end: [945, 410],  from: 0,    to: 1.0, persist: true, offset: [0, -22] },

      // ROMÂNI — întăriri & atacul final
      { id: 'ro-8brigade',  side: 'ro', type: 'inf',   label: 'Brigada 8',      shortcode: 'Rom 8B',   start: P.fantanele, end: P.movileni,  from: 0.62, to: 0.86, persist: true, offset: [0, -18] },
      { id: 'ro-aviation',  side: 'ro', type: 'air',   label: 'Aviația',        shortcode: 'Rom Av',   start: P.airbase,   end: [555, 280],  from: 0.66, to: 0.88, offset: [0, -18] },
      { id: 'ro-flotilla',  side: 'ro', type: 'navy',  label: 'Vedete',         shortcode: 'Rom Mr',   start: [705, 555],  end: [575, 420],  from: 0.66, to: 0.92, persist: true, offset: [12, 18] },

      // RUȘI — Corpul Siberian
      { id: 'ru-9siberian', side: 'ru', type: 'inf',   label: 'Div. 9 Sib.',    shortcode: 'Rus 9D',   start: P.fantanele, end: P.movileni,  from: 0,    to: 0.32, offset: [0, -18] },
      { id: 'ru-10div',     side: 'ru', type: 'inf',   label: 'Div. 10',        shortcode: 'Rus 10D',  start: [620, 305],  end: [620, 305],  from: 0,    to: 0.74, offset: [-50, -8] },
      { id: 'ru-movileni',  side: 'ru', type: 'art',   label: 'Bat. Movileni',  shortcode: 'Rus Art',  start: P.movileni,  end: P.movileni,  from: 0.20, to: 0.78, offset: [0, 22] },
      { id: 'ru-catusa',    side: 'ru', type: 'inf',   label: 'Cătușa',         shortcode: 'Rus C',    start: [225, 380],  end: [320, 365],  from: 0.45, to: 0.78, offset: [0, 22] },
      { id: 'ru-filesti',   side: 'ru', type: 'inf',   label: 'Reg. 34',        shortcode: 'Rus 34R',  start: [310, 165],  end: P.filesti,   from: 0.45, to: 0.76, offset: [-40, -10] },
      { id: 'ru-giurgiul',  side: 'ru', type: 'art',   label: 'Giurgiulești',   shortcode: 'Rus Art',  start: [1115, 470], end: P.prut_giurgiul, from: 0.50, to: 0.80, offset: [0, -18] },
      { id: 'ru-reni',      side: 'ru', type: 'navy',  label: 'Vapor Reni',     shortcode: 'Rus Mar',  start: [1175, 555], end: [1055, 510], from: 0.52, to: 0.78, offset: [12, 18] },

      // RUȘI — retragere
      { id: 'ru-retreat-s', side: 'ru', type: 'inf',   label: 'Retragere',      shortcode: 'Rus 10D',  start: [620, 305],  end: P.siret_pod, from: 0.78, to: 0.96, offset: [0, -18] },
      { id: 'ru-retreat-p', side: 'ru', type: 'inf',   label: 'Dezarmați',      shortcode: 'Rus DZ',   start: P.prut_giurgiul, end: [1175, 460], from: 0.80, to: 1.0, offset: [0, -18] }
    ];

    // Săgeți block-style (path SVG).  Lățime mai mare, cu marker și etichetă.
    this.arrows = [
      { id: 'a-9siberian',     side: 'ru',      from: 0.04, to: 0.32, label: 'Rus 9D',  labelAt: 0.5, d: `M${P.fantanele[0]} ${P.fantanele[1]} C 245 195, 305 230, ${P.movileni[0]} ${P.movileni[1]}` },
      { id: 'a-mov-fire',      side: 'fire-ru', from: 0.22, to: 0.50, label: '',         d: `M${P.movileni[0]} ${P.movileni[1]} C 440 285, 500 325, ${P.galati[0]} ${P.galati[1]}` },
      { id: 'a-tig-fire',      side: 'fire-ro', from: 0.34, to: 0.58, label: '',         d: `M${P.tiglina[0]} ${P.tiglina[1]} C 440 340, 405 295, ${P.movileni[0]} ${P.movileni[1]}` },
      { id: 'a-catusa',        side: 'ru',      from: 0.46, to: 0.74, label: 'Rus C',   labelAt: 0.5, d: `M225 380 C 260 376, 290 370, 320 365` },
      { id: 'a-filesti-attack',side: 'ru',      from: 0.46, to: 0.74, label: 'Rus 34R', labelAt: 0.5, d: `M310 165 C 350 185, 390 205, ${P.filesti[0]} ${P.filesti[1]}` },
      { id: 'a-giurgiul',      side: 'ru',      from: 0.52, to: 0.76, label: 'Rus Art', labelAt: 0.45, d: `M1115 470 C 1100 460, 1090 450, ${P.prut_giurgiul[0]} ${P.prut_giurgiul[1]}` },
      { id: 'a-reni',          side: 'ru',      from: 0.54, to: 0.78, label: 'Rus Mar', labelAt: 0.5, d: `M1175 555 C 1135 540, 1095 525, 1055 510` },

      { id: 'a-8brigade',      side: 'ro',      from: 0.66, to: 0.85, label: 'Rom 8B',  labelAt: 0.5, d: `M${P.fantanele[0]} ${P.fantanele[1]} C 245 195, 310 225, ${P.movileni[0]} ${P.movileni[1]}` },
      { id: 'a-aviation',      side: 'air',     from: 0.68, to: 0.88, label: 'Rom Av',  labelAt: 0.5, d: `M${P.airbase[0]} ${P.airbase[1]} C 410 130, 490 200, 555 280` },
      { id: 'a-flotilla',      side: 'ro',      from: 0.68, to: 0.91, label: 'Rom Mr',  labelAt: 0.5, d: `M705 555 C 655 510, 615 465, 575 420` },

      { id: 'a-retreat-siret', side: 'retreat', from: 0.78, to: 0.96, label: 'Retragere', labelAt: 0.5, d: `M620 305 C 555 350, 495 410, ${P.siret_pod[0]} ${P.siret_pod[1]}` },
      { id: 'a-retreat-prut',  side: 'retreat', from: 0.80, to: 1.0,  label: '',         d: `M${P.prut_giurgiul[0]} ${P.prut_giurgiul[1]} C 1115 450, 1145 455, 1175 460` }
    ];

    this.scenes = [
      {
        at: 0,
        date: '12-18 ian. 1918',
        title: 'Corpul Siberian se rupe de front',
        note: 'Diviziile 9 Siberiană și 10 ale Corpului Siberian — ostași de elită aliați cu românii — devin bolșevizate, își ucid ofițerii nobiliari și pornesc spre est. Ținta: trecerea peste Prut spre Rusia revoluționară.',
        forces: '500 apărători români · 12.000 ruși bolșevizați · ~zeci de tunuri ruse vs. câteva piese românești'
      },
      {
        at: 0.20,
        date: '19 ian.',
        title: 'Ultimatumul Movileni',
        note: 'Comandamentul rus emite ultimatum: „Lăsați-ne să trecem armați spre Basarabia". Românii refuză. Bateriile ruse de la Movileni încep imediat bombardamentul Galațiului.',
        forces: 'Pe soldații ruși deja încartiruiți s-au găsit liste de gălățeni de ucis și un plan de incendiere a orașului folosind cisternele pompierilor umplute cu păcură.'
      },
      {
        at: 0.34,
        date: '20 ian.',
        title: 'Țiglina răspunde',
        note: 'Tunurile românești de pe Dealul Țiglina — piesele scoase de pe crucișătorul „Elisabeta" și artileria portuară — răspund focului. Duele de artilerie peste oraș, civilii ascunși în pivnițe.',
        forces: 'Comandant general: gen. Eremia Grigorescu (Divizia 4 Inf.). Marina: contraamiral Eustațiu Sebastian.'
      },
      {
        at: 0.46,
        date: '21 ian.',
        title: 'Asediu din trei direcții',
        note: 'Vest: forțe ruse intră prin mlaștinile Lacului Cătușa. Nord: Reg. 34 atacă Filești. Est: tunuri rusești la Giurgiulești și un vapor militar la Reni deschid focul peste Prut și Dunăre.',
        forces: 'Apărarea perimetrală e scăzută la limită. Linia Prut, dincolo de oraș, e ținută de o singură companie românească.'
      },
      {
        at: 0.62,
        date: '22 ian.',
        title: 'Contraatacul triplu',
        note: 'Brigada 8 Infanterie lovește dinspre Fântânele. Aviația română bombardează concentrările ruse — prima dată în istoria României când aerul, pământul și apa luptă împreună într-o singură bătălie. Vedetele de pe Dunăre sprijină cu foc.',
        forces: 'Atacurile la baionetă rup moralul Corpului Siberian. „Șpanga" — pumnalul lung pe puscă — îi îngrozise deja pe nemți la Mărășești.'
      },
      {
        at: 0.78,
        date: '22 ian. seara',
        title: 'Retragere haotică',
        note: 'Corpul Siberian, care aproape cucerise orașul, fuge de români. Paradox absolut: preferă să se predea foștilor dușmani — nemților de pe Siret. Restul se retrag spre Gara Barboși și Prut.',
        forces: 'Sunt dezarmați și împinși peste Prut în Basarabia. Niciun rus nu mai amenință Galațiul.'
      },
      {
        at: 0.94,
        date: 'Aftermath',
        title: 'Decorațiile și consecințele',
        note: 'Galațiul primește „Croce di Guerra" (Italia, 1921) și „Croix de Guerre" (Franța, 1922). Basarabia cere protecția Armatei Române și se unește cu țara la 27 martie 1918. Bolșevismul nu trece spre Béla Kun.',
        forces: 'Doar 3 orașe românești au primit Crucea de Război franceză: Giurgiu, Iași, Galați. Ambele decorații sunt astăzi pierdute.'
      }
    ];
  }

  connectedCallback() {
    this.render();
    this.cache();
    this.bind();
    this.startedAt = performance.now();
    this.tick(this.startedAt);
  }

  disconnectedCallback() {
    cancelAnimationFrame(this.raf);
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          color: #2a221a;
          font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          --paper: #f1e3b8;
          --paper-edge: #d8c690;
          --land-ro: #f1e3b8;
          --land-ru: #b59cc7;
          --land-de: #ecb89f;
          --water: #a9cbe2;
          --water-deep: #7ba6c4;
          --hills: #8a6a3d;
          --ink: #2a221a;
          --label: #1c1611;
          --ro: #2f6b3e;
          --ro-deep: #1a3f25;
          --ru: #b62e3a;
          --ru-deep: #6f1820;
          --gold: #d7b46a;
        }
        * { box-sizing: border-box; }
        .battle-shell {
          background: #1c1812;
          border: 1px solid rgba(255,255,255,.14);
          overflow: hidden;
        }
        .briefing {
          display: grid;
          grid-template-columns: minmax(220px, .85fr) minmax(280px, 1.4fr) minmax(220px, .85fr);
          gap: 22px;
          align-items: start;
          padding: 20px clamp(16px, 3vw, 28px);
          background: #1d1813;
          border-bottom: 1px solid rgba(255,255,255,.10);
          color: #f3e8cf;
        }
        .briefing h2 {
          margin: 0;
          font-size: clamp(22px, 2.6vw, 30px);
          font-weight: 800;
          letter-spacing: -0.01em;
          color: #fbf3dd;
          font-family: "Playfair Display", "Cormorant Garamond", "Georgia", serif;
        }
        .briefing .eyebrow {
          margin: 0 0 8px;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: .17em;
          text-transform: uppercase;
          color: var(--gold);
        }
        .scene-title {
          margin: 0 0 8px;
          font-size: clamp(16px, 1.9vw, 21px);
          font-weight: 800;
          color: #fff4d2;
          line-height: 1.25;
        }
        .scene-note {
          margin: 0 0 8px;
          color: rgba(255,249,233,.86);
          font-size: clamp(13px, 1.45vw, 14.5px);
          line-height: 1.55;
        }
        .scene-forces {
          margin: 0;
          color: rgba(228, 215, 174, .68);
          font-size: 12.5px;
          line-height: 1.45;
          font-style: italic;
        }
        .legend {
          display: grid;
          gap: 7px;
          color: rgba(255,249,233,.82);
          font-size: 12px;
          line-height: 1.3;
        }
        .legend-title {
          color: var(--gold);
          font-weight: 900;
          letter-spacing: .12em;
          text-transform: uppercase;
          font-size: 10px;
          margin-bottom: 2px;
        }
        .legend-item {
          display: grid;
          grid-template-columns: 26px 1fr;
          gap: 8px;
          align-items: center;
        }
        .swatch {
          width: 22px;
          height: 14px;
          border: 1px solid rgba(0,0,0,.35);
          box-shadow: 0 1px 2px rgba(0,0,0,.25);
        }
        .swatch.ro-land { background: var(--land-ro); }
        .swatch.ru-land { background: var(--land-ru); }
        .swatch.de-land { background: var(--land-de); }
        .swatch.water { background: var(--water); }
        .swatch.hills {
          background:
            radial-gradient(circle at 25% 60%, var(--hills) 0 2px, transparent 3px),
            radial-gradient(circle at 60% 40%, var(--hills) 0 2px, transparent 3px),
            radial-gradient(circle at 85% 70%, var(--hills) 0 2px, transparent 3px),
            var(--paper);
        }
        .swatch.ru-arrow {
          background: var(--ru);
          height: 6px;
          border: 1px solid #fff;
          box-shadow: 0 0 0 1px rgba(0,0,0,.35);
        }
        .swatch.ro-arrow {
          background: var(--ro);
          height: 6px;
          border: 1px solid #fff;
          box-shadow: 0 0 0 1px rgba(0,0,0,.35);
        }
        .calibration-note {
          margin: 6px 0 0;
          color: rgba(255,249,233,.46);
          font-size: 10.5px;
          line-height: 1.4;
        }
        .stage {
          position: relative;
          background: #2a2418;
        }
        svg.map {
          display: block;
          width: 100%;
          height: auto;
          aspect-ratio: 60 / 31;
        }
        .land-paper { fill: var(--paper); }
        .land-ru { fill: var(--land-ru); }
        .land-de { fill: var(--land-de); }
        .water-fill {
          fill: var(--water);
          stroke: var(--water-deep);
          stroke-width: 1.2;
        }
        .danube {
          fill: var(--water);
          stroke: var(--water-deep);
          stroke-width: 1.5;
          stroke-linejoin: round;
        }
        .danube-axis {
          fill: none;
          stroke: var(--water-deep);
          stroke-width: 1;
          stroke-dasharray: 2 5;
          opacity: .5;
        }
        .frontline {
          fill: none;
          stroke: #b56b6b;
          stroke-width: 2.5;
          stroke-dasharray: 2 5;
        }
        .border-prut {
          fill: none;
          stroke: rgba(40, 30, 20, .35);
          stroke-width: 1;
          stroke-dasharray: 2 4;
        }
        .road {
          fill: none;
          stroke: rgba(80, 55, 30, .35);
          stroke-width: 1.4;
          stroke-dasharray: 4 4;
          stroke-linecap: round;
        }
        .hill {
          fill: var(--hills);
        }
        .compass-dial {
          fill: rgba(255,255,255,.7);
          stroke: rgba(60,40,20,.6);
          stroke-width: 1;
        }
        .compass-needle {
          fill: #b62e3a;
          stroke: #1a1007;
          stroke-width: 1;
        }
        .compass-text {
          fill: #1a1007;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: .14em;
        }
        .scalebar { stroke: #1a1007; stroke-width: 1.2; }
        .scalebar-fill { fill: #1a1007; }
        .scalebar-empty { fill: #f8efd4; stroke: #1a1007; stroke-width: 1.2; }
        .scalebar-text {
          fill: #1a1007;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: .08em;
        }
        /* Map labels */
        .label-place {
          font-size: 12px;
          font-weight: 800;
          fill: var(--label);
          paint-order: stroke;
          stroke: rgba(248,239,212,.85);
          stroke-width: 3;
          stroke-linejoin: round;
          letter-spacing: .04em;
        }
        .label-place.major {
          font-size: 14px;
          letter-spacing: .12em;
          text-transform: uppercase;
        }
        .label-place.dir {
          font-size: 11px;
          font-style: italic;
          fill: rgba(40,28,18,.78);
          letter-spacing: .05em;
        }
        .label-river {
          font-size: 12px;
          font-weight: 700;
          font-style: italic;
          fill: #2c4f6b;
          paint-order: stroke;
          stroke: rgba(220, 235, 245, .9);
          stroke-width: 3;
          stroke-linejoin: round;
          letter-spacing: .08em;
        }
        .title-stencil {
          font-family: "Stencil Std", "Anton", "Arial Black", "Helvetica", sans-serif;
          font-weight: 900;
          font-size: 26px;
          letter-spacing: .08em;
          fill: rgba(40,28,18,.78);
          stroke: rgba(248,239,212,.7);
          stroke-width: 2.5;
          paint-order: stroke;
          text-anchor: middle;
        }
        .title-stencil.sub {
          font-size: 13px;
          letter-spacing: .12em;
          font-weight: 700;
        }
        .city-shape {
          fill: rgba(212, 175, 95, .55);
          stroke: rgba(120, 80, 30, .45);
          stroke-width: 1;
        }
        .landmark-dot {
          fill: var(--ink);
          stroke: rgba(248,239,212,.9);
          stroke-width: 1.4;
        }

        /* Arrows — block-style with white edge halo */
        .arrow {
          fill: none;
          stroke-width: 9;
          stroke-linecap: round;
          stroke-linejoin: round;
          opacity: 0;
          paint-order: stroke fill;
          pointer-events: none;
        }
        .arrow-halo {
          fill: none;
          stroke: rgba(255,253,245,.95);
          stroke-width: 13;
          stroke-linecap: round;
          stroke-linejoin: round;
          opacity: 0;
          pointer-events: none;
        }
        .arrow.ru { stroke: var(--ru); marker-end: url(#arrow-ru); }
        .arrow.ro { stroke: var(--ro); marker-end: url(#arrow-ro); }
        .arrow.air { stroke: #c98a1f; stroke-width: 6; stroke-dasharray: 6 8; marker-end: url(#arrow-air); }
        .arrow.air + .arrow-halo, .arrow-halo.air { display: none; }
        .arrow.retreat { stroke: #7a5a3a; stroke-width: 7; stroke-dasharray: 10 7; marker-end: url(#arrow-retreat); }
        .arrow.fire-ru { stroke: #c25a3a; stroke-width: 5; stroke-dasharray: 2 8; marker-end: url(#arrow-fire-ru); }
        .arrow.fire-ro { stroke: #b58730; stroke-width: 5; stroke-dasharray: 2 8; marker-end: url(#arrow-fire-ro); }

        .arrow-label {
          font-size: 11px;
          font-weight: 800;
          letter-spacing: .04em;
          paint-order: stroke;
          stroke: rgba(255,253,245,.95);
          stroke-width: 3.5;
          stroke-linejoin: round;
          opacity: 0;
        }
        .arrow-label.ru { fill: var(--ru-deep); }
        .arrow-label.ro { fill: var(--ro-deep); }
        .arrow-label.air { fill: #6e4d12; }
        .arrow-label.retreat { fill: #4a361f; font-style: italic; }

        /* Units (flag icons) */
        .unit {
          opacity: 0;
          pointer-events: none;
        }
        .unit-pole {
          stroke: #4a3520;
          stroke-width: 1.5;
          stroke-linecap: round;
        }
        .unit-shadow {
          fill: rgba(0,0,0,.22);
        }
        .unit-flag {
          stroke: #1a1007;
          stroke-width: 0.8;
        }
        .unit-label {
          font-size: 10px;
          fill: #1a1611;
          font-weight: 800;
          text-anchor: middle;
          paint-order: stroke;
          stroke: rgba(248,239,212,.95);
          stroke-width: 3;
          stroke-linejoin: round;
          letter-spacing: 0.02em;
        }
        .impact circle {
          fill: none;
          stroke: #c25a3a;
          stroke-width: 2.5;
        }

        /* Controls */
        .controls {
          display: grid;
          grid-template-columns: auto 1fr auto auto;
          gap: 10px;
          align-items: center;
          padding: 12px clamp(16px, 3vw, 28px);
          background: #1d1813;
          border-top: 1px solid rgba(255,255,255,.10);
        }
        button {
          border: 1px solid rgba(255,255,255,.22);
          background: rgba(255,255,255,.06);
          color: #fff9e9;
          height: 36px;
          min-width: 36px;
          border-radius: 4px;
          font: inherit;
          font-weight: 800;
          font-size: 13px;
          cursor: pointer;
          padding: 0 12px;
        }
        button:hover { background: rgba(255,255,255,.13); }
        button.replay { background: var(--gold); color: #1a1209; border-color: var(--gold); }
        button.replay:hover { background: #eac679; }
        input[type="range"] {
          width: 100%;
          accent-color: var(--gold);
        }
        .time {
          font-variant-numeric: tabular-nums;
          color: rgba(255,249,233,.74);
          font-size: 12px;
          white-space: nowrap;
        }
        .chapters {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 1px;
          background: rgba(255,255,255,.10);
          border-top: 1px solid rgba(255,255,255,.10);
        }
        .chapter {
          min-height: 56px;
          border: 0;
          border-radius: 0;
          background: #1c1813;
          color: rgba(255,249,233,.66);
          padding: 10px 10px;
          text-align: left;
          font-size: 11px;
          line-height: 1.25;
          font-weight: 700;
        }
        .chapter:hover { background: #251f15; color: #fff; }
        .chapter.active {
          background: #2c2517;
          color: #fff7dc;
          box-shadow: inset 0 3px 0 var(--gold);
        }
        .chapter span {
          display: block;
          color: var(--gold);
          font-size: 9.5px;
          letter-spacing: .08em;
          text-transform: uppercase;
          margin-bottom: 3px;
        }
        @media (max-width: 760px) {
          .briefing { grid-template-columns: 1fr; gap: 14px; }
          .controls { grid-template-columns: auto 1fr auto; }
          .controls .time { display: none; }
          .chapters { grid-template-columns: repeat(2, 1fr); }
        }
      </style>

      <section class="battle-shell" aria-label="Animație cartografică despre Bătălia de la Galați din 1918">
        <div class="briefing" aria-live="polite">
          <div>
            <p class="eyebrow">12 – 22 ianuarie 1918</p>
            <h2>Bătălia de la Galați</h2>
          </div>
          <div>
            <p class="scene-title"></p>
            <p class="scene-note"></p>
            <p class="scene-forces"></p>
          </div>
          <div class="legend" aria-label="Legendă">
            <div class="legend-title">Teritorii</div>
            <div class="legend-item"><span class="swatch ro-land"></span><span>România</span></div>
            <div class="legend-item"><span class="swatch ru-land"></span><span>Moldova (Imperiul Rus)</span></div>
            <div class="legend-item"><span class="swatch de-land"></span><span>România ocupată germană</span></div>
            <div class="legend-item"><span class="swatch water"></span><span>Ape</span></div>
            <div class="legend-item"><span class="swatch hills"></span><span>Dealuri</span></div>
            <div class="legend-title" style="margin-top:6px">Forțe</div>
            <div class="legend-item"><span class="swatch ru-arrow"></span><span>Atac rus / bolșevizat</span></div>
            <div class="legend-item"><span class="swatch ro-arrow"></span><span>Apărare / contraatac român</span></div>
            <p class="calibration-note">Stilul reproduce harta istorică „Battle of Galați, January 12-22, 1918". Pozițiile sunt aproximative, ancorate pe reperele majore.</p>
          </div>
        </div>

        <div class="stage">
          <svg class="map" viewBox="0 0 1200 620" role="img" aria-labelledby="battle-title battle-desc">
            <title id="battle-title">Bătălia de la Galați, 12-22 ianuarie 1918</title>
            <desc id="battle-desc">Hartă cartografică animată cu deplasările forțelor române și ruse în jurul Galațiului.</desc>
            <defs>
              <pattern id="paperGrain" x="0" y="0" width="160" height="160" patternUnits="userSpaceOnUse">
                <rect width="160" height="160" fill="#f1e3b8"/>
                <circle cx="20" cy="40" r=".7" fill="rgba(120,90,40,.08)"/>
                <circle cx="78" cy="22" r=".6" fill="rgba(120,90,40,.07)"/>
                <circle cx="120" cy="90" r=".7" fill="rgba(120,90,40,.08)"/>
                <circle cx="50" cy="120" r=".6" fill="rgba(120,90,40,.07)"/>
                <circle cx="140" cy="150" r=".7" fill="rgba(120,90,40,.08)"/>
              </pattern>
              <filter id="mapShadow" x="-5%" y="-5%" width="110%" height="110%">
                <feDropShadow dx="0" dy="3" stdDeviation="4" flood-color="#000" flood-opacity=".35"/>
              </filter>
              <marker id="arrow-ru" viewBox="0 0 12 12" refX="6" refY="6" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M0 0 L12 6 L0 12 L3 6 Z" fill="#b62e3a" stroke="#fff" stroke-width=".8"/>
              </marker>
              <marker id="arrow-ro" viewBox="0 0 12 12" refX="6" refY="6" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M0 0 L12 6 L0 12 L3 6 Z" fill="#2f6b3e" stroke="#fff" stroke-width=".8"/>
              </marker>
              <marker id="arrow-air" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M0 0 L10 5 L0 10 Z" fill="#c98a1f"/>
              </marker>
              <marker id="arrow-retreat" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M0 0 L10 5 L0 10 Z" fill="#7a5a3a"/>
              </marker>
              <marker id="arrow-fire-ru" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M0 0 L10 5 L0 10 Z" fill="#c25a3a"/>
              </marker>
              <marker id="arrow-fire-ro" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M0 0 L10 5 L0 10 Z" fill="#b58730"/>
              </marker>
            </defs>

            <!-- Paper / land base -->
            <rect width="1200" height="620" fill="url(#paperGrain)"/>

            <!-- Russian Moldova (east of Prut) -->
            <path class="land-ru" d="M1095 0 L1200 0 L1200 620 L1090 620 C 1090 540, 1090 460, 1095 380 C 1100 250, 1095 100, 1095 0 Z"/>

            <!-- German-occupied Romania (SW corner, south of Siret) -->
            <path class="land-de" d="M0 620 L520 620 L500 600 C 460 595, 420 580, 380 555 C 320 525, 240 510, 150 525 C 80 540, 30 565, 0 595 Z"/>

            <!-- Lakes (filled) -->
            <!-- Lake Brateș (large, NE of Galați) -->
            <path class="water-fill" d="M690 70 C 780 58, 880 65, 960 95 C 1015 120, 1020 165, 1000 205 C 970 240, 900 250, 820 240 C 740 230, 685 200, 670 165 C 660 130, 668 90, 690 70 Z"/>
            <!-- Lake Cătușa -->
            <ellipse class="water-fill" cx="225" cy="385" rx="55" ry="20"/>
            <!-- Lake Mălina -->
            <ellipse class="water-fill" cx="115" cy="410" rx="45" ry="16"/>
            <!-- Lake Lojnița -->
            <ellipse class="water-fill" cx="780" cy="470" rx="42" ry="18"/>

            <!-- Rivers -->
            <!-- Dunărea: from west (Brăila approach) curves SE through Galați port and continues to Reni -->
            <path class="danube" d="M0 480 L 200 472 C 380 470, 480 478, 540 488 C 620 500, 720 515, 820 525 C 920 535, 1020 545, 1200 555 L 1200 575 C 1020 565, 920 555, 820 545 C 720 535, 620 522, 540 510 C 480 500, 380 492, 200 494 L 0 502 Z"/>
            <!-- Prut: comes from north, joins Danube near Giurgiulești -->
            <path class="danube" d="M1078 0 L 1090 0 C 1088 100, 1092 220, 1083 360 C 1080 410, 1078 440, 1078 540 L 1068 540 C 1068 440, 1070 410, 1073 360 C 1082 220, 1078 100, 1078 0 Z"/>
            <!-- Siret: comes from west, joins Danube SW of Galați -->
            <path class="danube" d="M0 590 L 100 558 C 220 535, 320 520, 400 510 C 440 506, 470 500, 490 490 L 495 500 C 475 511, 444 517, 404 521 C 324 531, 224 547, 110 568 L 0 600 Z"/>

            <!-- Frontline (German front line / armistice — pink dashed, SW only) -->
            <path class="frontline" d="M0 595 C 80 540, 160 522, 250 520 C 330 520, 400 545, 470 580 C 490 595, 510 610, 525 620"/>

            <!-- Border Prut (subtle dashed) -->
            <path class="border-prut" d="M1078 0 L1078 540"/>

            <!-- City of Galați (schematic outline) -->
            <path class="city-shape" d="M512 330 Q 540 318, 595 322 Q 622 332, 618 372 Q 600 405, 555 405 Q 510 405, 502 370 Z"/>

            <!-- Hills layer -->
            <g class="hills"></g>

            <!-- Roads -->
            <path class="road" d="M${this.places.fantanele[0]} ${this.places.fantanele[1]} L ${this.places.movileni[0]} ${this.places.movileni[1]} L ${this.places.galati[0]} ${this.places.galati[1]}"/>
            <path class="road" d="M${this.places.galati[0]} ${this.places.galati[1]} L ${this.places.tiglina[0]} ${this.places.tiglina[1]} L ${this.places.barbosi[0]} ${this.places.barbosi[1]}"/>
            <path class="road" d="M${this.places.galati[0]} ${this.places.galati[1]} L ${this.places.prut_giurgiul[0]} ${this.places.prut_giurgiul[1]}"/>
            <path class="road" d="M${this.places.smardan[0]} ${this.places.smardan[1]} L ${this.places.filesti[0]} ${this.places.filesti[1]}"/>

            <!-- River labels -->
            <text class="label-river" x="180" y="498">Râul Dunărea</text>
            <text class="label-river" x="1090" y="80" transform="rotate(-90 1090 80)">Râul Prut</text>
            <text class="label-river" x="120" y="585">Râul Siret</text>
            <text class="label-river" x="785" y="155">Lacul Brateș</text>
            <text class="label-river" x="170" y="412">L. Cătușa</text>
            <text class="label-river" x="60" y="442">L. Mălina</text>
            <text class="label-river" x="745" y="498">L. Lojnița</text>

            <!-- Title overlay (stencil-style, placed over Danube SE) -->
            <g>
              <text class="title-stencil" x="800" y="555">BĂTĂLIA DE LA GALAȚI</text>
              <text class="title-stencil sub" x="800" y="578">12–22 ianuarie 1918</text>
            </g>

            <!-- Compass -->
            <g transform="translate(60 80)">
              <circle class="compass-dial" r="22"/>
              <path class="compass-needle" d="M0 -16 L4 0 L0 16 L-4 0 Z"/>
              <text class="compass-text" x="0" y="-26" text-anchor="middle">N</text>
            </g>

            <!-- Scale bar (5 km ≈ 165 SVG units) -->
            <g transform="translate(960 568)">
              <rect class="scalebar-empty" x="0" y="0" width="40" height="6"/>
              <rect class="scalebar-fill" x="40" y="0" width="40" height="6"/>
              <rect class="scalebar-empty" x="80" y="0" width="40" height="6"/>
              <rect class="scalebar-fill" x="120" y="0" width="40" height="6"/>
              <text class="scalebar-text" x="0" y="22">0</text>
              <text class="scalebar-text" x="76" y="22">2.5 km</text>
              <text class="scalebar-text" x="148" y="22">5</text>
            </g>

            <!-- Landmarks layer -->
            <g class="landmarks">
              <g transform="translate(${this.places.galati[0]} ${this.places.galati[1]})"><circle class="landmark-dot" r="4.5"/><text class="label-place major" x="-10" y="-12">GALAȚI</text></g>
              <g transform="translate(${this.places.tiglina[0]} ${this.places.tiglina[1]})"><circle class="landmark-dot" r="3"/><text class="label-place" x="-72" y="6">Țiglina</text></g>
              <g transform="translate(${this.places.movileni[0]} ${this.places.movileni[1]})"><circle class="landmark-dot" r="3"/><text class="label-place" x="-66" y="6">MOVILENI</text></g>
              <g transform="translate(${this.places.filesti[0]} ${this.places.filesti[1]})"><circle class="landmark-dot" r="3"/><text class="label-place" x="10" y="-6">FILEȘTI</text></g>
              <g transform="translate(${this.places.smardan[0]} ${this.places.smardan[1]})"><circle class="landmark-dot" r="3"/><text class="label-place" x="-78" y="-6">SMÂRDAN</text></g>
              <g transform="translate(${this.places.fantanele[0]} ${this.places.fantanele[1]})"><circle class="landmark-dot" r="3"/><text class="label-place" x="10" y="-6">Fântânele</text></g>
              <g transform="translate(${this.places.catusa[0]} ${this.places.catusa[1]})"><circle class="landmark-dot" r="2.5"/></g>
              <g transform="translate(${this.places.barbosi[0]} ${this.places.barbosi[1]})"><circle class="landmark-dot" r="3"/><text class="label-place" x="10" y="20">Gara Barboși</text></g>
              <g transform="translate(${this.places.senderni[0]} ${this.places.senderni[1]})"><circle class="landmark-dot" r="3"/><text class="label-place" x="-78" y="6">ȘENDRENI</text></g>
              <g transform="translate(${this.places.grindu[0]} ${this.places.grindu[1]})"><circle class="landmark-dot" r="3"/><text class="label-place" x="10" y="6">Grindu</text></g>
              <g transform="translate(${this.places.prut_giurgiul[0]} ${this.places.prut_giurgiul[1]})"><circle class="landmark-dot" r="3"/><text class="label-place" x="-95" y="-6">GIURGIULEȘTI</text></g>
              <g transform="translate(${this.places.reni[0]} ${this.places.reni[1]})"><circle class="landmark-dot" r="3"/><text class="label-place" x="10" y="6">RENI</text></g>
            </g>

            <!-- Edge directions ("spre Pechea" etc.) -->
            <g class="directions"></g>

            <!-- Animated layers -->
            <g class="arrow-halos"></g>
            <g class="arrows"></g>
            <g class="arrow-labels"></g>
            <g class="impacts">
              <g class="impact" data-from="0.30" data-to="0.58" transform="translate(${this.places.galati[0]} ${this.places.galati[1]})">
                <circle r="11"/><circle r="22"/><circle r="35"/>
              </g>
              <g class="impact" data-from="0.68" data-to="0.88" transform="translate(${this.places.movileni[0]} ${this.places.movileni[1]})">
                <circle r="9"/><circle r="20"/><circle r="32"/>
              </g>
              <g class="impact" data-from="0.69" data-to="0.88" transform="translate(555 280)">
                <circle r="9"/><circle r="18"/><circle r="28"/>
              </g>
            </g>
            <g class="units"></g>
          </svg>
        </div>

        <div class="controls">
          <button class="play" type="button" aria-label="Pauză" title="Pauză / Redă">❚❚</button>
          <input class="scrub" type="range" min="0" max="1000" value="0" step="1" aria-label="Derulează animația">
          <span class="time">00:00 / 01:30</span>
          <button class="replay" type="button" hidden title="Reia animația de la început">↻ Reia</button>
        </div>
        <div class="chapters"></div>
      </section>
    `;
  }

  cache() {
    this.$ = {
      play: this.shadowRoot.querySelector('.play'),
      replay: this.shadowRoot.querySelector('.replay'),
      scrub: this.shadowRoot.querySelector('.scrub'),
      time: this.shadowRoot.querySelector('.time'),
      title: this.shadowRoot.querySelector('.scene-title'),
      note: this.shadowRoot.querySelector('.scene-note'),
      forces: this.shadowRoot.querySelector('.scene-forces'),
      units: this.shadowRoot.querySelector('.units'),
      arrows: this.shadowRoot.querySelector('.arrows'),
      arrowHalos: this.shadowRoot.querySelector('.arrow-halos'),
      arrowLabels: this.shadowRoot.querySelector('.arrow-labels'),
      hills: this.shadowRoot.querySelector('.hills'),
      directions: this.shadowRoot.querySelector('.directions'),
      chapters: this.shadowRoot.querySelector('.chapters'),
      impacts: [...this.shadowRoot.querySelectorAll('.impact')],
    };
    this.$.impacts.forEach((g) => {
      g.dataset.baseTransform = g.getAttribute('transform') || '';
    });
    this.drawHills();
    this.drawDirections();
    this.drawArrows();
    this.drawUnits();
    this.drawChapters();
  }

  bind() {
    this.$.play.addEventListener('click', () => this.toggle());
    this.$.replay.addEventListener('click', () => this.restart());
    this.$.scrub.addEventListener('input', (event) => {
      this.elapsed = (Number(event.target.value) / 1000) * this.duration;
      this.startedAt = performance.now() - this.elapsed * 1000;
      if (this.elapsed < this.duration - 0.05 && !this.running) this.toggle();
      this.setProgress(this.elapsed / this.duration);
    });
  }

  drawHills() {
    this.hills.forEach(([x, y]) => {
      const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      dot.setAttribute('class', 'hill');
      dot.setAttribute('cx', x);
      dot.setAttribute('cy', y);
      dot.setAttribute('r', '2');
      this.$.hills.append(dot);
    });
  }

  drawDirections() {
    this.directions.forEach((dir) => {
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('class', 'label-place dir');
      text.setAttribute('x', dir.x);
      text.setAttribute('y', dir.y);
      if (dir.anchor) text.setAttribute('text-anchor', dir.anchor);
      text.textContent = dir.label;
      this.$.directions.append(text);
    });
  }

  drawArrows() {
    this.arrows.forEach((arrow) => {
      // Halo (white edge underneath, only for ru/ro main attack arrows)
      if (arrow.side === 'ru' || arrow.side === 'ro') {
        const halo = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        halo.setAttribute('d', arrow.d);
        halo.setAttribute('class', `arrow-halo ${arrow.side}`);
        halo.dataset.id = arrow.id;
        halo.dataset.from = arrow.from;
        halo.dataset.to = arrow.to;
        this.$.arrowHalos.append(halo);
        const haloLen = halo.getTotalLength();
        halo.style.strokeDasharray = `${haloLen}`;
        halo.style.strokeDashoffset = `${haloLen}`;
        halo.dataset.length = haloLen;
      }

      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', arrow.d);
      path.setAttribute('class', `arrow ${arrow.side}`);
      path.dataset.id = arrow.id;
      path.dataset.from = arrow.from;
      path.dataset.to = arrow.to;
      this.$.arrows.append(path);
      const length = path.getTotalLength();
      path.style.strokeDasharray = `${length}`;
      path.style.strokeDashoffset = `${length}`;
      path.dataset.length = length;

      // Label at midpoint of path
      if (arrow.label) {
        const labelAt = arrow.labelAt ?? 0.5;
        const point = path.getPointAtLength(length * labelAt);
        const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        label.setAttribute('class', `arrow-label ${arrow.side}`);
        label.setAttribute('x', point.x);
        label.setAttribute('y', point.y - 11);
        label.setAttribute('text-anchor', 'middle');
        label.textContent = arrow.label;
        label.dataset.id = arrow.id;
        label.dataset.from = arrow.from;
        label.dataset.to = arrow.to;
        this.$.arrowLabels.append(label);
      }
    });
  }

  drawUnits() {
    this.units.forEach((unit) => {
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.setAttribute('class', `unit ${unit.side}`);
      g.dataset.id = unit.id;

      // Pole
      const pole = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      pole.setAttribute('class', 'unit-pole');
      pole.setAttribute('x1', '0');
      pole.setAttribute('y1', '6');
      pole.setAttribute('x2', '0');
      pole.setAttribute('y2', '-22');
      g.append(pole);

      // Shadow under flag
      const shadow = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
      shadow.setAttribute('class', 'unit-shadow');
      shadow.setAttribute('cx', '0');
      shadow.setAttribute('cy', '7');
      shadow.setAttribute('rx', '9');
      shadow.setAttribute('ry', '2');
      g.append(shadow);

      // Flag (Romanian tricolor for RO; Russian Imperial white-blue-red for RU)
      const flagW = 18;
      const flagH = 11;
      const stripeW = flagW / 3;
      const flagY = -22;
      let stripes;
      if (unit.side === 'ro') {
        // Romanian tricolor: blue, yellow, red (left→right)
        stripes = [
          { x: 0, y: flagY, w: stripeW, h: flagH, fill: '#1c4493' },
          { x: stripeW, y: flagY, w: stripeW, h: flagH, fill: '#f0d23a' },
          { x: stripeW * 2, y: flagY, w: stripeW, h: flagH, fill: '#b62e3a' }
        ];
      } else {
        // Russian Imperial / pre-Soviet flag: white-blue-red (horizontal stripes)
        const stripeH = flagH / 3;
        stripes = [
          { x: 0, y: flagY, w: flagW, h: stripeH, fill: '#f6f1e0' },
          { x: 0, y: flagY + stripeH, w: flagW, h: stripeH, fill: '#1c4493' },
          { x: 0, y: flagY + stripeH * 2, w: flagW, h: stripeH, fill: '#b62e3a' }
        ];
      }
      stripes.forEach((s) => {
        const r = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        r.setAttribute('class', 'unit-flag');
        r.setAttribute('x', s.x);
        r.setAttribute('y', s.y);
        r.setAttribute('width', s.w);
        r.setAttribute('height', s.h);
        r.setAttribute('fill', s.fill);
        g.append(r);
      });

      // Branch glyph below flag (small marker so the unit type is readable)
      const glyph = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      glyph.setAttribute('font-size', '8');
      glyph.setAttribute('font-weight', '900');
      glyph.setAttribute('text-anchor', 'middle');
      glyph.setAttribute('x', flagW / 2);
      glyph.setAttribute('y', flagY + flagH - 2);
      glyph.setAttribute('fill', 'rgba(0,0,0,.55)');
      glyph.setAttribute('paint-order', 'stroke');
      glyph.setAttribute('stroke', 'rgba(255,255,255,.7)');
      glyph.setAttribute('stroke-width', '1.5');
      glyph.textContent = unit.type === 'inf' ? 'I' : unit.type === 'art' ? '●' : unit.type === 'navy' ? '⚓' : '✈';
      g.append(glyph);

      // Label below pole
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('class', 'unit-label');
      text.setAttribute('y', 18);
      text.textContent = unit.shortcode || unit.label;
      g.append(text);

      this.$.units.append(g);
    });
  }

  drawChapters() {
    this.scenes.forEach((scene, index) => {
      const button = document.createElement('button');
      button.className = 'chapter';
      button.type = 'button';
      button.innerHTML = `<span>${scene.date}</span>${scene.title}`;
      button.addEventListener('click', () => {
        this.elapsed = scene.at * this.duration;
        this.startedAt = performance.now() - this.elapsed * 1000;
        if (!this.running) this.toggle();
        this.setProgress(scene.at);
      });
      if (index === 0) button.classList.add('active');
      this.$.chapters.append(button);
    });
  }

  toggle() {
    this.running = !this.running;
    this.$.play.textContent = this.running ? '❚❚' : '▶';
    this.$.play.setAttribute('aria-label', this.running ? 'Pauză' : 'Redă');
    if (this.running) {
      this.startedAt = performance.now() - this.elapsed * 1000;
      this.tick(performance.now());
    }
  }

  restart() {
    this.elapsed = 0;
    this.startedAt = performance.now();
    this.$.replay.hidden = true;
    if (!this.running) this.toggle();
    else this.setProgress(0);
  }

  tick(now) {
    if (!this.running) return;
    this.elapsed = (now - this.startedAt) / 1000;
    if (this.elapsed >= this.duration) {
      this.elapsed = this.duration;
      this.setProgress(1);
      this.running = false;
      this.$.play.textContent = '▶';
      this.$.play.setAttribute('aria-label', 'Redă');
      this.$.replay.hidden = false;
      return;
    }
    this.setProgress(this.elapsed / this.duration);
    this.raf = requestAnimationFrame((next) => this.tick(next));
  }

  setProgress(progress) {
    const p = Math.max(0, Math.min(1, progress));
    this.$.scrub.value = Math.round(p * 1000);
    this.$.time.textContent = `${this.formatTime(p * this.duration)} / ${this.formatTime(this.duration)}`;
    this.updateScene(p);
    this.updateArrows(p);
    this.updateUnits(p);
    this.updateImpacts(p);
  }

  updateScene(progress) {
    let nextIndex = 0;
    for (let i = 0; i < this.scenes.length; i += 1) {
      if (progress >= this.scenes[i].at) nextIndex = i;
    }
    if (nextIndex !== this.sceneIndex) {
      this.sceneIndex = nextIndex;
      const scene = this.scenes[nextIndex];
      this.$.title.textContent = `${scene.date}: ${scene.title}`;
      this.$.note.textContent = scene.note;
      this.$.forces.textContent = scene.forces || '';
      [...this.$.chapters.children].forEach((button, index) => {
        button.classList.toggle('active', index === nextIndex);
      });
    }
  }

  updateArrows(progress) {
    const apply = (sel) => {
      this.shadowRoot.querySelectorAll(sel).forEach((path) => {
        const from = Number(path.dataset.from);
        const to = Number(path.dataset.to);
        const local = this.clamp((progress - from) / (to - from));
        const length = Number(path.dataset.length);
        const visible = local > 0 && progress < to + 0.06;
        path.style.opacity = visible ? String(0.32 + local * 0.68) : '0';
        path.style.strokeDashoffset = String(length * (1 - local));
      });
    };
    apply('.arrow-halo');
    apply('.arrow');

    this.shadowRoot.querySelectorAll('.arrow-label').forEach((label) => {
      const from = Number(label.dataset.from);
      const to = Number(label.dataset.to);
      const local = this.clamp((progress - from) / (to - from));
      const visible = local > 0.35 && progress < to + 0.06;
      label.style.opacity = visible ? String(Math.min(1, (local - 0.35) * 3)) : '0';
    });
  }

  updateUnits(progress) {
    this.units.forEach((unit) => {
      const g = this.shadowRoot.querySelector(`.unit[data-id="${unit.id}"]`);
      if (!g) return;
      const local = this.clamp((progress - unit.from) / (unit.to - unit.from));
      const isRetreat = unit.id.startsWith('ru-retreat');
      const persist = unit.persist === true && progress >= unit.to;
      const active = progress >= unit.from && (progress <= unit.to + 0.05 || persist);
      let x = this.lerp(unit.start[0], unit.end[0], local);
      let y = this.lerp(unit.start[1], unit.end[1], local);
      if (unit.offset) {
        x += unit.offset[0];
        y += unit.offset[1];
      }
      const moving = local > 0 && local < 1;
      const sway = moving ? Math.sin(progress * Math.PI * 18) * 0.03 : 0;
      const scale = 1 + sway;
      g.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${scale.toFixed(3)})`);
      const opacity = active
        ? (persist ? 0.95 : (isRetreat ? Math.max(0.30, 1 - (progress - unit.from) / (unit.to - unit.from) * 0.4) : Math.max(0.32, local)))
        : 0;
      g.style.opacity = opacity.toFixed(2);
    });
  }

  updateImpacts(progress) {
    this.$.impacts.forEach((impact) => {
      const from = Number(impact.dataset.from);
      const to = Number(impact.dataset.to);
      const local = this.clamp((progress - from) / (to - from));
      const visible = local > 0 && local < 1;
      impact.style.opacity = visible ? String(Math.sin(local * Math.PI) * 0.86) : '0';
      const scale = 1 + (visible ? Math.sin(local * Math.PI * 6) * 0.12 + local * 0.18 : 0);
      impact.setAttribute('transform', `${impact.dataset.baseTransform} scale(${scale.toFixed(3)})`);
    });
  }

  formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  lerp(a, b, t) {
    return a + (b - a) * t;
  }

  clamp(value) {
    return Math.max(0, Math.min(1, value || 0));
  }
}

customElements.define('battle-galati-animation', BattleGalatiAnimation);
