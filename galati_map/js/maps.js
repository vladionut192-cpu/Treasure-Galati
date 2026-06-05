// ─────────────────────────────────────────────────────────────────────────
//  maps.js — pagina „Hărți" (maps.html)
//  Afișează cronologic colecția de hărți istorice, planuri de oraș și vederi
//  aeriene ale Galațiului. Sursa de date este aceeași ca pentru bulinele
//  portocalii de pe hartă — galati-altadata.json — dar filtrată pe folderul
//  „0. Galati". Aceste imagini NU mai apar pe hartă (vezi js/main.js), ci doar
//  aici, scoase din clusterul care aglomera Dunărea.
// ─────────────────────────────────────────────────────────────────────────

const FOLDER = '0. Galati';

// i18n helpers — i18n.js se încarcă „defer" înaintea acestui modul, dar
// rămânem defensivi în caz de ordine neașteptată.
function t(key, params) {
  if (typeof window.t === 'function') return window.t(key, params);
  return key;
}
function lang() {
  return (typeof window.getLang === 'function') ? window.getLang() : 'ro';
}

function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

let photos = [];   // colecția sortată cronologic

function caption(photo) {
  const en = lang() === 'en' && photo.caption_en;
  return en ? photo.caption_en : (photo.caption_ro || photo.caption_en || '');
}

// ─── Randare galerie ───────────────────────────────────────────────────────
function renderGallery() {
  const gallery = document.getElementById('maps-gallery');
  const meta = document.getElementById('maps-meta');
  if (!gallery) return;

  if (!photos.length) {
    gallery.innerHTML = '';
    if (meta) meta.textContent = t('maps.empty');
    return;
  }

  gallery.innerHTML = photos.map((p, i) => {
    const cap = caption(p);
    const yr = (p.year != null && p.year !== '') ? p.year : t('maps.undated');
    return `
      <figure class="map-card" data-index="${i}">
        <button class="map-card-btn" type="button" aria-label="${escapeHtml(cap || yr)}">
          <span class="map-card-thumb">
            <img src="${escapeHtml(p.src)}" alt="${escapeHtml(cap)}" loading="lazy" decoding="async">
          </span>
          <span class="map-card-year">${escapeHtml(String(yr))}</span>
        </button>
        <figcaption class="map-card-cap">${escapeHtml(cap)}</figcaption>
      </figure>`;
  }).join('');

  // Meta: număr + interval cronologic (doar din cele datate)
  if (meta) {
    const years = photos.map(p => p.year).filter(y => y != null && y !== '').map(Number);
    if (years.length) {
      meta.textContent = t('maps.count', {
        n: photos.length,
        from: Math.min(...years),
        to: Math.max(...years),
      });
    } else {
      meta.textContent = t('maps.count', { n: photos.length, from: '?', to: '?' });
    }
  }
}

// Expus pentru maps.head.js — re-randare la schimbarea limbii (RO ↔ EN)
window.__renderMapsGallery = renderGallery;
window.addEventListener('langchange', renderGallery);

// ─── Lightbox cu navigare prev/next ──────────────────────────────────────────
const lb = {
  el: null, img: null, cap: null, index: -1,
};

function openLightbox(index) {
  lb.el = lb.el || document.getElementById('maps-lightbox');
  lb.img = lb.img || document.getElementById('maps-lb-img');
  lb.cap = lb.cap || document.getElementById('maps-lb-caption');
  if (!lb.el) return;
  showLightbox(index);
  lb.el.hidden = false;
  document.body.style.overflow = 'hidden';
}

function showLightbox(index) {
  const n = photos.length;
  if (!n) return;
  lb.index = (index + n) % n; // wrap-around
  const p = photos[lb.index];
  const cap = caption(p);
  const yr = (p.year != null && p.year !== '') ? p.year : '';
  lb.img.src = p.src;
  lb.img.alt = cap;
  lb.cap.innerHTML = `${yr ? `<span class="lb-year">${escapeHtml(String(yr))}</span>` : ''}${cap ? escapeHtml(cap) : ''}`;
}

function closeLightbox() {
  if (!lb.el) return;
  lb.el.hidden = true;
  lb.img.src = '';
  document.body.style.overflow = '';
}

function wireLightbox() {
  const gallery = document.getElementById('maps-gallery');
  gallery?.addEventListener('click', (e) => {
    const fig = e.target.closest('.map-card');
    if (!fig) return;
    openLightbox(Number(fig.dataset.index));
  });

  document.getElementById('maps-lb-close')?.addEventListener('click', closeLightbox);
  document.getElementById('maps-lb-prev')?.addEventListener('click', (e) => { e.stopPropagation(); showLightbox(lb.index - 1); });
  document.getElementById('maps-lb-next')?.addEventListener('click', (e) => { e.stopPropagation(); showLightbox(lb.index + 1); });

  // Click pe fundal (nu pe imagine / butoane) închide
  document.getElementById('maps-lightbox')?.addEventListener('click', (e) => {
    if (e.target.id === 'maps-lightbox') closeLightbox();
  });

  document.addEventListener('keydown', (e) => {
    const open = lb.el && !lb.el.hidden;
    if (!open) return;
    if (e.key === 'Escape') closeLightbox();
    else if (e.key === 'ArrowLeft') showLightbox(lb.index - 1);
    else if (e.key === 'ArrowRight') showLightbox(lb.index + 1);
  });
}

// ─── Init ────────────────────────────────────────────────────────────────────
async function init() {
  wireLightbox();
  try {
    const r = await fetch('galati-altadata.json');
    const data = await r.json();
    const list = data.filter(p => (p.folder || '').trim() === FOLDER);
    // Sortare cronologică: cele datate crescător, nedatatele la final.
    list.sort((a, b) => {
      const ya = (a.year == null || a.year === '') ? Infinity : Number(a.year);
      const yb = (b.year == null || b.year === '') ? Infinity : Number(b.year);
      return ya - yb;
    });
    photos = list;
  } catch (e) {
    console.warn('Nu pot încărca galati-altadata.json:', e);
    photos = [];
  }
  renderGallery();
}

init();
