// Heritage Galați — logica paginii AR „Piața Regală, așa cum a fost".
//
// Extras din `<script>`-ul inline al paginii în august 2026, ca politica CSP să
// poată fi `script-src 'self' 'unsafe-eval' …` fără `unsafe-inline`. A-Frame
// cere `unsafe-eval` fiindcă își compilează shaderele la runtime, dar codul
// nostru nu are nevoie să stea în pagină.
let buildingsData = null;

// ── Load building data ─────────────────────────────────────
async function loadBuildings() {
  try {
    const r = await fetch('piata_regala_buildings.geojson');
    if (!r.ok) throw new Error('Nu pot încărca clădirile (HTTP ' + r.status + ')');
    buildingsData = await r.json();
    renderWalkList();
  } catch (e) {
    console.error(e);
    showError('Eroare la încărcare', e.message);
  }
}

// ── Splash screen toggle ───────────────────────────────────
function showSplash() {
  document.getElementById('splash').style.display = 'flex';
  document.getElementById('walk-mode').hidden = true;
  document.getElementById('hud').hidden = true;
  document.getElementById('ar-container').hidden = true;
  // Stop AR scene if active
  const scene = document.querySelector('a-scene');
  if (scene) scene.parentNode.removeChild(scene);
  hideInfo();
}

function hideSplash() {
  document.getElementById('splash').style.display = 'none';
}

// ── Walk mode (fallback) ───────────────────────────────────
function showWalkMode() {
  hideSplash();
  document.getElementById('walk-mode').hidden = false;
}

function renderWalkList() {
  if (!buildingsData) return;
  const wrap = document.getElementById('walk-list');
  wrap.innerHTML = '';
  buildingsData.features.forEach(f => {
    const p = f.properties;
    const card = document.createElement('div');
    card.className = 'building-card';
    card.innerHTML = `
      <img src="${escapeHtml(p.historic_image)}" alt="${escapeHtml(p.name)}" loading="lazy">
      <div class="body">
        <div class="sub">${escapeHtml(p.subtitle || p.category || '')}</div>
        <h3>${escapeHtml(p.name)}</h3>
        <p>${escapeHtml((p.description || '').slice(0, 200))}…</p>
      </div>
    `;
    card.addEventListener('click', () => showInfo(f));
    wrap.appendChild(card);
  });
}

// ── Info card (apare la tap pe billboard sau în walk-mode) ─
function showInfo(feature) {
  const p = feature.properties;
  document.getElementById('ic-sub').textContent = p.subtitle || p.category || '';
  document.getElementById('ic-title').textContent = p.name;
  document.getElementById('ic-body').textContent = p.description || '';
  const fateEl = document.getElementById('ic-fate');
  if (p.fate) {
    fateEl.textContent = '⚠ ' + p.fate;
    fateEl.style.display = 'block';
  } else {
    fateEl.style.display = 'none';
  }
  const ul = document.getElementById('ic-facts');
  ul.innerHTML = '';
  (p.facts || []).forEach(f => {
    const li = document.createElement('li');
    li.textContent = f;
    ul.appendChild(li);
  });
  const cit = document.getElementById('ic-citation');
  cit.textContent = p.citation ? 'Sursă: ' + p.citation : '';
  document.getElementById('info-card').classList.add('show');
}

function hideInfo() {
  document.getElementById('info-card').classList.remove('show');
}

// ── AR mode ────────────────────────────────────────────────
async function startAR() {
  hideSplash();
  document.getElementById('loader').style.display = 'flex';
  document.getElementById('loader-text').textContent = 'Cer permisiuni cameră + locație…';

  // 1. Verifică suport
  if (!navigator.geolocation) {
    showError('Browser nesuportat', 'Browserul tău nu suportă API-ul de geolocație. Folosește Chrome sau Safari recent.');
    return;
  }

  // 2. Cere permisiune cameră
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    stream.getTracks().forEach(t => t.stop());  // Doar test — AR.js cere singur
  } catch (e) {
    showError('Acces cameră refuzat',
      'Pentru AR avem nevoie de cameră. ' +
      (e.name === 'NotAllowedError'
        ? 'Acceptă din setările browserului.'
        : 'Este browserul tău compatibil HTTPS?')
    );
    return;
  }

  // 3. Cere permisiune compas pe iOS 13+ (Apple necesită explicit)
  if (typeof DeviceOrientationEvent !== 'undefined' &&
      typeof DeviceOrientationEvent.requestPermission === 'function') {
    try {
      const result = await DeviceOrientationEvent.requestPermission();
      if (result !== 'granted') {
        showError('Compas refuzat', 'AR-ul are nevoie de busolă pentru orientare. Reîncearcă și acceptă.');
        return;
      }
    } catch (e) {
      console.warn('Compas permission failed:', e);
    }
  }

  // 4. Cere primul fix GPS (test — nu blochează)
  document.getElementById('loader-text').textContent = 'Caut locația GPS…';
  try {
    await new Promise((resolve, reject) => {
      const id = navigator.geolocation.watchPosition(
        (pos) => {
          navigator.geolocation.clearWatch(id);
          resolve(pos);
        },
        (err) => {
          navigator.geolocation.clearWatch(id);
          reject(err);
        },
        { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
      );
    });
  } catch (e) {
    showError('Locație indisponibilă',
      'Nu pot obține locația GPS. ' +
      (e.code === 1 ? 'Acceptă din browser.' : 'Verifică setările telefonului.'));
    return;
  }

  // 5. Construiește scena AR
  buildARScene();
  document.getElementById('loader').style.display = 'none';
  document.getElementById('hud').hidden = false;
  document.getElementById('ar-container').hidden = false;

  // 6. Watch position pentru HUD
  navigator.geolocation.watchPosition(
    (pos) => {
      const acc = Math.round(pos.coords.accuracy || 0);
      document.getElementById('gps-status').textContent =
        `${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)} (±${acc}m)`;
    },
    () => {
      document.getElementById('gps-status').textContent = '⚠ pierdut';
    },
    { enableHighAccuracy: true, maximumAge: 1000 }
  );

  // 7. Compass for HUD
  window.addEventListener('deviceorientation', (e) => {
    let heading = e.webkitCompassHeading || (e.alpha != null ? 360 - e.alpha : null);
    if (heading != null) {
      const cardinal = ['N', 'NE', 'E', 'SE', 'S', 'SV', 'V', 'NV'][Math.round(heading / 45) % 8];
      document.getElementById('compass-deg').textContent = `${Math.round(heading)}° ${cardinal}`;
    }
  }, true);
}

function buildARScene() {
  const container = document.getElementById('ar-container');
  container.innerHTML = '';
  const scene = document.createElement('a-scene');
  scene.setAttribute('vr-mode-ui', 'enabled: false');
  scene.setAttribute('renderer', 'logarithmicDepthBuffer: true; antialias: true; alpha: true');
  scene.setAttribute('arjs', 'sourceType: webcam; debugUIEnabled: false; videoTexture: true');
  scene.setAttribute('embedded', '');

  // Camera GPS
  const cam = document.createElement('a-camera');
  cam.setAttribute('gps-projected-camera', 'gpsMinDistance: 5; gpsMinAccuracy: 100');
  cam.setAttribute('rotation-reader', '');
  cam.setAttribute('look-controls', 'enabled: false');
  cam.setAttribute('arjs-look-controls', 'smoothingFactor: 0.1');
  scene.appendChild(cam);

  // Pentru fiecare clădire, adaug un billboard cu fotografia
  buildingsData.features.forEach((f) => {
    const p = f.properties;
    const [lon, lat] = f.geometry.coordinates;
    const ar = p.ar || {};
    const w = ar.billboard_width_m || 8;
    const h = ar.billboard_height_m || 6;

    // Wrapper entity cu poziție GPS
    const wrap = document.createElement('a-entity');
    wrap.setAttribute('gps-projected-entity-place', `latitude: ${lat}; longitude: ${lon}`);
    wrap.dataset.bid = f.id;

    // Plane cu fotografia istorică
    const plane = document.createElement('a-image');
    plane.setAttribute('src', p.historic_image);
    plane.setAttribute('width', w);
    plane.setAttribute('height', h);
    plane.setAttribute('opacity', '0.92');
    plane.setAttribute('look-at', '[gps-projected-camera]');
    plane.setAttribute('class', 'clickable');
    plane.setAttribute('cursor-listener', '');
    plane.dataset.bid = f.id;
    plane.addEventListener('click', () => {
      // Find feature
      const feat = buildingsData.features.find(x => x.id === f.id);
      if (feat) showInfo(feat);
    });
    wrap.appendChild(plane);

    // Title text floating above
    const text = document.createElement('a-text');
    text.setAttribute('value', p.name);
    text.setAttribute('align', 'center');
    text.setAttribute('width', w * 1.5);
    text.setAttribute('color', '#ffe9b5');
    text.setAttribute('position', `0 ${h/2 + 1} 0`);
    text.setAttribute('look-at', '[gps-projected-camera]');
    text.setAttribute('shader', 'msdf');
    wrap.appendChild(text);

    scene.appendChild(wrap);
  });

  container.appendChild(scene);
}

// ── Util ───────────────────────────────────────────────────
function escapeHtml(s) {
  return String(s || '').replace(/[&<>"']/g, c => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

function showError(title, msg) {
  document.getElementById('loader').style.display = 'none';
  document.getElementById('error-panel').style.display = 'flex';
  document.getElementById('error-title').textContent = title;
  document.getElementById('error-msg').textContent = msg;
}

// ── Init ───────────────────────────────────────────────────
loadBuildings();
document.getElementById('btn-ar').addEventListener('click', startAR);
document.getElementById('btn-walk').addEventListener('click', showWalkMode);

// Butoanele foloseau atribute onclick, blocate de CSP. Le legăm aici.
for (const [sel, fn] of [
  ['[data-act="splash"]', showSplash],
  ['[data-act="hide-info"]', hideInfo],
  ['[data-act="reload"]', () => location.reload()],
]) {
  document.querySelectorAll(sel).forEach((b) => b.addEventListener('click', fn));
}
