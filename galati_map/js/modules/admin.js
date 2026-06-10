// Heritage Galați — modul: unelte admin (vizibile doar pe localhost / local-dev):
// add-pin + editare obiectiv, comparație before/after, add-photo. Vorbesc cu
// API-ul serverului local de dev (scripts/serve.py).
export function initAdminTools(ctx) {
  const { map, markers, locations, render, escapeHtml, lightbox } = ctx;
    // ─── Add-pin tool ───────────────────────────────────────────
    const apFab = document.getElementById('add-pin-fab');
    const apModal = document.getElementById('add-pin-modal');
    const apClose = document.getElementById('add-pin-close');
    const apCancel = document.getElementById('ap-cancel');
    const apForm = document.getElementById('add-pin-form');
    const apTitle = document.getElementById('ap-title');
    const apLocation = document.getElementById('ap-location');
    const apCategory = document.getElementById('ap-category');
    const apLat = document.getElementById('ap-lat');
    const apLon = document.getElementById('ap-lon');
    const apPick = document.getElementById('ap-pick');
    const apCoordStatus = document.getElementById('ap-coord-status');
    const apExcerpt = document.getElementById('ap-excerpt');
    const apDescription = document.getElementById('ap-description');
    const apCredit = document.getElementById('ap-credit');
    const apYearBuilt = document.getElementById('ap-year-built');
    const apYearDemolished = document.getElementById('ap-year-demolished');
    const apStatus = document.getElementById('ap-status');
    const apDemolishField = document.getElementById('ap-demolish-field');
    function syncDemolishVisibility() {
      const v = apStatus.value;
      apDemolishField.style.display = (v === 'demolished' || v === 'lost') ? 'block' : 'none';
      if (v === 'active' || v === 'ruin') apYearDemolished.value = '';
    }
    apStatus.addEventListener('change', syncDemolishVisibility);
    const apImage = document.getElementById('ap-image');
    const apPreview = document.getElementById('ap-preview');
    const apDropHint = document.getElementById('ap-drop-hint');
    const apSubmit = document.getElementById('ap-submit');
    const apFeedback = document.getElementById('ap-feedback');
    const apBanner = document.getElementById('add-pin-banner');
    const apCancelPlace = document.getElementById('add-pin-cancel-place');

    // Fill category dropdown from existing data
    function fillCategoryDropdown() {
      const cats = [...new Set(locations.map(l => l.category).filter(Boolean))].sort((a,b) => a.localeCompare(b,'ro'));
      apCategory.innerHTML = cats.map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('') +
        '<option value="Alte locuri">Alte locuri</option>';
      apCategory.value = 'Alte locuri';
    }
    fillCategoryDropdown();

    let editingLocationId = null;
    function openAddPinModal() {
      apFeedback.textContent = '';
      apFeedback.className = 'feedback';
      apModal.classList.add('open');
    }
    function closeAddPinModal() {
      apModal.classList.remove('open');
      exitPlaceMode();
      editingLocationId = null;
      const titleEl = document.getElementById('add-pin-title');
      if (titleEl) titleEl.textContent = 'Obiectiv nou';
      apSubmit.textContent = 'Salvează';
      const delBtn = document.getElementById('ap-delete');
      if (delBtn) delBtn.style.display = 'none';
    }
    function resetAddPinForm() {
      apForm.reset();
      apPreview.src = '';
      apPreview.style.display = 'none';
      apDropHint.textContent = 'Click sau drag & drop pentru a alege o imagine (max 25MB)';
      apCoordStatus.textContent = 'Click pe „Pe hartă" sau introdu lat/lon manual.';
      apCoordStatus.classList.remove('ok');
      apFeedback.textContent = '';
      apFeedback.className = 'feedback';
      fillCategoryDropdown();
      apStatus.value = 'active';
      syncDemolishVisibility();
      if (apGalleryThumbs) apGalleryThumbs.innerHTML = '';
      if (apGalleryHint) apGalleryHint.textContent = 'Click sau drag & drop pentru mai multe imagini · sub fiecare poți scrie o descriere';
      if (apGalleryExisting) {
        apGalleryExisting.innerHTML = '';
        apGalleryExisting.style.display = 'none';
      }
      galleryNewCaptions = [];
      // Reset before/after section
      const cmpToggle = document.getElementById('ap-compare-toggle');
      const cmpGroup  = document.getElementById('ap-compare-group');
      const thenPrev  = document.getElementById('ap-then-preview');
      const nowPrev   = document.getElementById('ap-now-preview');
      const thenYear  = document.getElementById('ap-image-then-year');
      const nowYear   = document.getElementById('ap-image-now-year');
      if (cmpToggle) cmpToggle.checked = false;
      if (cmpGroup)  cmpGroup.style.display = 'none';
      if (thenPrev) { thenPrev.src = ''; thenPrev.style.display = 'none'; }
      if (nowPrev)  { nowPrev.src  = ''; nowPrev.style.display  = 'none'; }
      if (thenYear) thenYear.value = '';
      if (nowYear)  nowYear.value  = '';
    }

    function renderExistingGallery(item) {
      if (!apGalleryExisting) return;
      const gal = Array.isArray(item.gallery) ? item.gallery : [];
      if (!gal.length) {
        apGalleryExisting.style.display = 'none';
        apGalleryExisting.innerHTML = '';
        return;
      }
      apGalleryExisting.style.display = 'grid';
      apGalleryExisting.innerHTML = gal.map((g) => {
        const src = (g && g.src) ? g.src : '';
        const caption = (g && (g.alt || g.caption)) || '';
        return `<div class="ge-item" data-src="${escapeHtml(src)}">
          <img src="${escapeHtml(src)}" alt="">
          <input type="text" class="ge-caption" value="${escapeHtml(caption)}" placeholder="Descriere imagine…">
          <button type="button" class="ge-rm" title="Șterge din galerie">×</button>
        </div>`;
      }).join('');
      apGalleryExisting.querySelectorAll('.ge-rm').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          const itemEl = btn.closest('.ge-item');
          if (itemEl) itemEl.classList.toggle('removed');
        });
      });
    }

    function openEditLocation(id) {
      const item = locations.find(l => l.id === id);
      if (!item) return;
      resetAddPinForm();
      editingLocationId = id;
      apTitle.value = item.title || '';
      apLocation.value = item.location || '';
      // Make sure category exists in dropdown (re-add if missing)
      if (item.category && ![...apCategory.options].some(o => o.value === item.category)) {
        const opt = document.createElement('option');
        opt.value = item.category;
        opt.textContent = item.category;
        apCategory.appendChild(opt);
      }
      apCategory.value = item.category || 'Alte locuri';
      apLat.value = (item.lat || '').toString();
      apLon.value = (item.lon || '').toString();
      apExcerpt.value = item.excerpt || '';
      apDescription.value = item.description || '';
      apCredit.value = item.local_credit || '';
      apYearBuilt.value = (item.year_built !== null && item.year_built !== undefined) ? String(item.year_built) : '';
      apYearDemolished.value = (item.year_demolished !== null && item.year_demolished !== undefined) ? String(item.year_demolished) : '';
      apStatus.value = item.status || 'active';
      syncDemolishVisibility();
      renderExistingGallery(item);
      // Show existing image as preview if any
      if (item.image) {
        apPreview.src = item.image;
        apPreview.style.display = 'block';
        apDropHint.textContent = 'Imagine existentă — alege una nouă pentru a o înlocui';
      }
      // Populate before/after section if the item has both images
      const cmpToggle = document.getElementById('ap-compare-toggle');
      const cmpGroup  = document.getElementById('ap-compare-group');
      const thenPrev  = document.getElementById('ap-then-preview');
      const nowPrev   = document.getElementById('ap-now-preview');
      const thenYear  = document.getElementById('ap-image-then-year');
      const nowYear   = document.getElementById('ap-image-now-year');
      const hasThen = !!item.image_then;
      const hasNow  = !!item.image_now;
      if (cmpToggle) cmpToggle.checked = hasThen || hasNow;
      if (cmpGroup)  cmpGroup.style.display = (hasThen || hasNow) ? 'block' : 'none';
      if (hasThen && thenPrev) { thenPrev.src = item.image_then; thenPrev.style.display = 'block'; }
      if (hasNow  && nowPrev)  { nowPrev.src  = item.image_now;  nowPrev.style.display  = 'block'; }
      if (thenYear) thenYear.value = (item.image_then_year != null) ? String(item.image_then_year) : '';
      if (nowYear)  nowYear.value  = (item.image_now_year  != null) ? String(item.image_now_year)  : '';
      refreshCoordStatus();
      const titleEl = document.getElementById('add-pin-title');
      if (titleEl) titleEl.textContent = 'Editează obiectivul';
      apSubmit.textContent = 'Salvează modificări';
      const delBtn = document.getElementById('ap-delete');
      if (delBtn) delBtn.style.display = 'inline-block';
      openAddPinModal();
    }

    apFab.addEventListener('click', () => { resetAddPinForm(); openAddPinModal(); });
    apClose.addEventListener('click', closeAddPinModal);
    apCancel.addEventListener('click', closeAddPinModal);
    const apDelete = document.getElementById('ap-delete');
    if (apDelete) apDelete.addEventListener('click', async () => {
      if (!editingLocationId) return;
      if (!confirm('Sigur ștergi pinul „' + (apTitle.value || editingLocationId) + '"? Acțiunea e ireversibilă.')) return;
      apDelete.disabled = true;
      apDelete.textContent = 'Șterg…';
      try {
        const fd = new FormData();
        fd.append('id', editingLocationId);
        const res = await fetch('/api/delete-location', { method: 'POST', body: fd });
        const data = await res.json();
        if (!res.ok || !data.ok) throw new Error(data.error || ('HTTP ' + res.status));
        const idx = locations.findIndex(l => l.id === editingLocationId);
        if (idx >= 0) locations.splice(idx, 1);
        if (typeof render === 'function') render();
        apFeedback.className = 'feedback success';
        apFeedback.textContent = 'Pin șters.';
        setTimeout(closeAddPinModal, 700);
      } catch (err) {
        apFeedback.className = 'feedback error';
        apFeedback.textContent = 'Eroare: ' + err.message;
      } finally {
        apDelete.disabled = false;
        apDelete.textContent = 'Șterge';
      }
    });
    apModal.addEventListener('click', (e) => { if (e.target === apModal) closeAddPinModal(); });

    // Manual coord typing → update status
    function refreshCoordStatus() {
      const a = parseFloat(apLat.value), b = parseFloat(apLon.value);
      if (Number.isFinite(a) && Number.isFinite(b)) {
        apCoordStatus.textContent = `Coordonate: ${a.toFixed(6)}, ${b.toFixed(6)}`;
        apCoordStatus.classList.add('ok');
      } else {
        apCoordStatus.textContent = 'Click pe „Pe hartă" sau introdu lat/lon manual.';
        apCoordStatus.classList.remove('ok');
      }
    }
    apLat.addEventListener('input', refreshCoordStatus);
    apLon.addEventListener('input', refreshCoordStatus);

    // Place-pin mode: hide modal, change cursor, single-click captures coords
    let placeModeActive = false;
    function enterPlaceMode() {
      placeModeActive = true;
      apModal.classList.remove('open');
      document.body.classList.add('add-pin-placing');
      map.once('click', onPlaceClick);
    }
    function exitPlaceMode() {
      if (!placeModeActive) return;
      placeModeActive = false;
      document.body.classList.remove('add-pin-placing');
      map.off('click', onPlaceClick);
    }
    function onPlaceClick(e) {
      placeModeActive = false;
      document.body.classList.remove('add-pin-placing');
      apLat.value = e.latlng.lat.toFixed(6);
      apLon.value = e.latlng.lng.toFixed(6);
      refreshCoordStatus();
      openAddPinModal();
    }
    apPick.addEventListener('click', enterPlaceMode);
    apCancelPlace.addEventListener('click', () => {
      exitPlaceMode();
      openAddPinModal();
    });

    // Image preview
    apImage.addEventListener('change', () => {
      const file = apImage.files && apImage.files[0];
      if (!file) {
        apPreview.style.display = 'none';
        apDropHint.textContent = 'Click sau drag & drop pentru a alege o imagine (max 25MB)';
        return;
      }
      const url = URL.createObjectURL(file);
      apPreview.src = url;
      apPreview.style.display = 'block';
      apDropHint.textContent = file.name + ' · ' + Math.round(file.size / 1024) + ' KB';
    });

    // ─── Before/After comparison toggle + previews ───
    const apCompareToggle = document.getElementById('ap-compare-toggle');
    const apCompareGroup  = document.getElementById('ap-compare-group');
    const apImageThen     = document.getElementById('ap-image-then');
    const apImageNow      = document.getElementById('ap-image-now');
    const apThenPreview   = document.getElementById('ap-then-preview');
    const apNowPreview    = document.getElementById('ap-now-preview');
    const apThenHint      = document.getElementById('ap-then-hint');
    const apNowHint       = document.getElementById('ap-now-hint');
    if (apCompareToggle && apCompareGroup) {
      apCompareToggle.addEventListener('change', () => {
        apCompareGroup.style.display = apCompareToggle.checked ? 'block' : 'none';
      });
    }
    const wireFilePreview = (input, preview, hint, defaultHint) => {
      if (!input || !preview) return;
      input.addEventListener('change', () => {
        const file = input.files && input.files[0];
        if (!file) {
          preview.style.display = 'none';
          if (hint) hint.textContent = defaultHint;
          return;
        }
        preview.src = URL.createObjectURL(file);
        preview.style.display = 'block';
        if (hint) hint.textContent = file.name + ' · ' + Math.round(file.size / 1024) + ' KB';
      });
    };
    wireFilePreview(apImageThen, apThenPreview, apThenHint, 'Click sau drag & drop · imaginea istorică');
    wireFilePreview(apImageNow,  apNowPreview,  apNowHint,  'Click sau drag & drop · imaginea actuală');

    // Drag & drop into the file-drop area (featured image)
    const apDrop = document.getElementById('ap-drop');
    ['dragenter','dragover'].forEach(ev => apDrop.addEventListener(ev, (e) => { e.preventDefault(); apDrop.style.background = 'var(--accent-soft)'; }));
    ['dragleave','drop'].forEach(ev => apDrop.addEventListener(ev, () => { apDrop.style.background = ''; }));
    apDrop.addEventListener('drop', (e) => {
      e.preventDefault();
      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
        apImage.files = e.dataTransfer.files;
        apImage.dispatchEvent(new Event('change'));
      }
    });

    // Gallery (multi-file)
    const apGallery = document.getElementById('ap-gallery');
    const apGalleryDrop = document.getElementById('ap-gallery-drop');
    const apGalleryThumbs = document.getElementById('ap-gallery-thumbs');
    const apGalleryHint = document.getElementById('ap-gallery-hint');
    const apGalleryExisting = document.getElementById('ap-gallery-existing');
    // Captions for new gallery files (in same order as apGallery.files)
    let galleryNewCaptions = [];
    function refreshGalleryThumbs() {
      const files = apGallery.files;
      apGalleryThumbs.innerHTML = '';
      if (!files || !files.length) {
        apGalleryHint.textContent = 'Click sau drag & drop pentru mai multe imagini · sub fiecare poți scrie o descriere';
        galleryNewCaptions = [];
        return;
      }
      apGalleryHint.textContent = files.length + ' imagine' + (files.length === 1 ? '' : 'i') + ' selectate · adaugă o descriere sub fiecare (opțional)';
      // Resize captions array to match file count, preserving entered values
      while (galleryNewCaptions.length < files.length) galleryNewCaptions.push('');
      galleryNewCaptions.length = files.length;
      [...files].forEach((f, idx) => {
        const item = document.createElement('div');
        item.className = 'gt-item';
        const img = document.createElement('img');
        img.src = URL.createObjectURL(f);
        img.alt = f.name;
        const inp = document.createElement('input');
        inp.type = 'text';
        inp.placeholder = 'Descriere imagine…';
        inp.value = galleryNewCaptions[idx] || '';
        inp.addEventListener('input', () => { galleryNewCaptions[idx] = inp.value; });
        item.append(img, inp);
        apGalleryThumbs.appendChild(item);
      });
    }
    apGallery.addEventListener('change', refreshGalleryThumbs);
    ['dragenter','dragover'].forEach(ev => apGalleryDrop.addEventListener(ev, (e) => { e.preventDefault(); apGalleryDrop.style.background = 'var(--accent-soft)'; }));
    ['dragleave','drop'].forEach(ev => apGalleryDrop.addEventListener(ev, () => { apGalleryDrop.style.background = ''; }));
    apGalleryDrop.addEventListener('drop', (e) => {
      e.preventDefault();
      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length) {
        // Merge with existing selection (DataTransfer for FileList rebuild)
        const dt = new DataTransfer();
        if (apGallery.files) [...apGallery.files].forEach(f => dt.items.add(f));
        [...e.dataTransfer.files].forEach(f => dt.items.add(f));
        apGallery.files = dt.files;
        refreshGalleryThumbs();
      }
    });

    // Submit handler
    apForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      apFeedback.className = 'feedback';
      apFeedback.textContent = '';
      const lat = parseFloat(apLat.value), lon = parseFloat(apLon.value);
      if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
        apFeedback.classList.add('error');
        apFeedback.textContent = 'Setează coordonate valide (click pe hartă sau introdu manual).';
        return;
      }
      apSubmit.disabled = true;
      const wasEditing = editingLocationId;
      apSubmit.textContent = wasEditing ? 'Salvez modificări…' : 'Salvez…';
      try {
        const fd = new FormData(apForm);
        // Replace the multi-file gallery_images entries (already in fd from
        // the form) with explicit per-file captions in matching order.
        // Note: FormData preserves order of appends; the file inputs are
        // already serialized first by the form. We append captions next.
        const newCount = (apGallery.files && apGallery.files.length) || 0;
        for (let i = 0; i < newCount; i++) {
          fd.append('gallery_images_caption', galleryNewCaptions[i] || '');
        }
        // Before/After comparison handling. Three signals the server respects:
        //   compare_enabled=1     → keep image_then/image_now on the entry
        //   compare_enabled=0     → strip image_then/image_now from the entry
        //   image_then / image_now files (when present) → uploaded
        const compareOn = apCompareToggle && apCompareToggle.checked;
        fd.set('compare_enabled', compareOn ? '1' : '0');
        if (!compareOn) {
          // Don't send empty files when the toggle is off (server treats absence
          // + compare_enabled=0 as "clear").
          fd.delete('image_then');
          fd.delete('image_now');
        }
        let url = '/api/add-location';
        if (wasEditing) {
          fd.append('id', wasEditing);
          url = '/api/update-location';
          // Send list of existing gallery items to keep + per-item captions
          if (apGalleryExisting) {
            apGalleryExisting.querySelectorAll('.ge-item').forEach((it) => {
              if (it.classList.contains('removed')) return;
              const src = it.dataset.src || '';
              if (!src) return;
              const cap = it.querySelector('.ge-caption');
              fd.append('gallery_keep', src);
              fd.append('gallery_keep_caption', cap ? cap.value : '');
            });
          }
        }
        const res = await fetch(url, { method: 'POST', body: fd });
        const data = await res.json();
        if (!res.ok || !data.ok) {
          throw new Error(data.error || ('HTTP ' + res.status));
        }
        const entry = data.entry;
        if (wasEditing) {
          const idx = locations.findIndex(l => l.id === wasEditing);
          if (idx >= 0) locations[idx] = entry;
        } else {
          locations.push(entry);
        }
        if (typeof render === 'function') render();
        apFeedback.classList.add('success');
        apFeedback.textContent = wasEditing
          ? 'Modificat. Pinul s-a actualizat pe hartă.'
          : 'Salvat ca ' + entry.id + '. Pin-ul apare imediat pe hartă.';
        map.setView([entry.lat, entry.lon], Math.max(map.getZoom(), 16), { animate: true });
        const m = markers.get(entry.id);
        if (m) setTimeout(() => m.openPopup(), 300);
        setTimeout(closeAddPinModal, 1200);
      } catch (err) {
        apFeedback.classList.add('error');
        apFeedback.textContent = 'Eroare: ' + err.message;
      } finally {
        apSubmit.disabled = false;
        apSubmit.textContent = wasEditing ? 'Salvează modificări' : 'Salvează';
      }
    });

    // Esc key → close modal / cancel place mode
    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;
      if (placeModeActive) { exitPlaceMode(); openAddPinModal(); }
      else if (apModal.classList.contains('open')) closeAddPinModal();
    });

    // ─── Add-photo tool ─────────────────────────────────────────
    const aphFab = document.getElementById('add-photo-fab');
    const aphModal = document.getElementById('add-photo-modal');
    const aphClose = document.getElementById('add-photo-close');
    const aphCancel = document.getElementById('aph-cancel');
    const aphForm = document.getElementById('add-photo-form');
    const aphImage = document.getElementById('aph-image');
    const aphPreview = document.getElementById('aph-preview');
    const aphDropHint = document.getElementById('aph-drop-hint');
    const aphDrop = document.getElementById('aph-drop');
    const aphCaption = document.getElementById('aph-caption');
    const aphYear = document.getElementById('aph-year');
    const aphFolder = document.getElementById('aph-folder');
    const aphLat = document.getElementById('aph-lat');
    const aphLon = document.getElementById('aph-lon');
    const aphPick = document.getElementById('aph-pick');
    const aphCoordStatus = document.getElementById('aph-coord-status');
    const aphSubmit = document.getElementById('aph-submit');
    const aphFeedback = document.getElementById('aph-feedback');

    let editingPhotoSrc = null;
    function openPhotoModal() {
      aphFeedback.textContent = '';
      aphFeedback.className = 'feedback';
      aphModal.classList.add('open');
    }
    function closePhotoModal() {
      aphModal.classList.remove('open');
      exitPhotoPlaceMode();
      editingPhotoSrc = null;
      const titleEl = document.getElementById('add-photo-title');
      if (titleEl) titleEl.textContent = 'Fotografie nouă';
      aphSubmit.textContent = 'Salvează foto';
      aphImage.required = true;
      const delBtn = document.getElementById('aph-delete');
      if (delBtn) delBtn.style.display = 'none';
    }
    function resetPhotoForm() {
      aphForm.reset();
      aphFolder.value = 'local';
      aphPreview.src = '';
      aphPreview.style.display = 'none';
      aphDropHint.textContent = 'Click sau drag & drop pentru a alege o imagine (max 25MB)';
      aphCoordStatus.textContent = 'Click pe „Pe hartă" sau introdu lat/lon manual.';
      aphCoordStatus.classList.remove('ok');
      aphFeedback.textContent = '';
      aphFeedback.className = 'feedback';
    }

    function openEditPhoto(photo) {
      if (!photo) return;
      resetPhotoForm();
      editingPhotoSrc = photo.src;
      aphCaption.value = photo.caption_ro || '';
      aphYear.value = photo.year != null ? photo.year : '';
      aphFolder.value = photo.folder || 'local';
      aphLat.value = (photo.lat || '').toString();
      aphLon.value = (photo.lon || '').toString();
      // Show existing image; new upload is OPTIONAL when editing
      aphPreview.src = photo.src;
      aphPreview.style.display = 'block';
      aphDropHint.textContent = 'Imagine existentă — alege una nouă pentru a o înlocui (opțional)';
      aphImage.required = false;
      refreshPhotoCoordStatus();
      const titleEl = document.getElementById('add-photo-title');
      if (titleEl) titleEl.textContent = 'Editează foto';
      aphSubmit.textContent = 'Salvează modificări';
      const delBtn = document.getElementById('aph-delete');
      if (delBtn) delBtn.style.display = 'inline-block';
      openPhotoModal();
    }

    // Wire lightbox edit button
    const lightboxEdit = document.getElementById('lightbox-edit');
    if (lightboxEdit) lightboxEdit.addEventListener('click', () => {
      if (!ctx.activePhoto) return;
      delete lightbox.dataset.open;
      openEditPhoto(ctx.activePhoto);
    });

    aphFab.addEventListener('click', () => { resetPhotoForm(); openPhotoModal(); });
    aphClose.addEventListener('click', closePhotoModal);
    aphCancel.addEventListener('click', closePhotoModal);
    const aphDelete = document.getElementById('aph-delete');
    if (aphDelete) aphDelete.addEventListener('click', async () => {
      if (!editingPhotoSrc) return;
      if (!confirm('Sigur ștergi această fotografie? Acțiunea e ireversibilă.')) return;
      aphDelete.disabled = true;
      aphDelete.textContent = 'Șterg…';
      try {
        const fd = new FormData();
        fd.append('src', editingPhotoSrc);
        const res = await fetch('/api/delete-photo', { method: 'POST', body: fd });
        const data = await res.json();
        if (!res.ok || !data.ok) throw new Error(data.error || ('HTTP ' + res.status));
        // Remove the marker
        const idx = ctx.pubcrawlMarkers.findIndex(r => r.photo.src === editingPhotoSrc);
        if (idx >= 0) {
          const rec = ctx.pubcrawlMarkers[idx];
          if (ctx.pubcrawlLayer) ctx.pubcrawlLayer.removeLayer(rec.marker);
          ctx.pubcrawlMarkers.splice(idx, 1);
        }
        aphFeedback.className = 'feedback success';
        aphFeedback.textContent = 'Foto șters.';
        setTimeout(closePhotoModal, 700);
      } catch (err) {
        aphFeedback.className = 'feedback error';
        aphFeedback.textContent = 'Eroare: ' + err.message;
      } finally {
        aphDelete.disabled = false;
        aphDelete.textContent = 'Șterge';
      }
    });
    aphModal.addEventListener('click', (e) => { if (e.target === aphModal) closePhotoModal(); });

    function refreshPhotoCoordStatus() {
      const a = parseFloat(aphLat.value), b = parseFloat(aphLon.value);
      if (Number.isFinite(a) && Number.isFinite(b)) {
        aphCoordStatus.textContent = `Coordonate: ${a.toFixed(6)}, ${b.toFixed(6)}`;
        aphCoordStatus.classList.add('ok');
      } else {
        aphCoordStatus.textContent = 'Click pe „Pe hartă" sau introdu lat/lon manual.';
        aphCoordStatus.classList.remove('ok');
      }
    }
    aphLat.addEventListener('input', refreshPhotoCoordStatus);
    aphLon.addEventListener('input', refreshPhotoCoordStatus);

    let photoPlaceModeActive = false;
    function enterPhotoPlaceMode() {
      photoPlaceModeActive = true;
      aphModal.classList.remove('open');
      document.body.classList.add('add-pin-placing');
      apBanner.style.display = 'block';
      map.once('click', onPhotoPlaceClick);
    }
    function exitPhotoPlaceMode() {
      if (!photoPlaceModeActive) return;
      photoPlaceModeActive = false;
      document.body.classList.remove('add-pin-placing');
      apBanner.style.display = '';
      map.off('click', onPhotoPlaceClick);
    }
    function onPhotoPlaceClick(e) {
      photoPlaceModeActive = false;
      document.body.classList.remove('add-pin-placing');
      apBanner.style.display = '';
      aphLat.value = e.latlng.lat.toFixed(6);
      aphLon.value = e.latlng.lng.toFixed(6);
      refreshPhotoCoordStatus();
      openPhotoModal();
    }
    aphPick.addEventListener('click', enterPhotoPlaceMode);

    aphImage.addEventListener('change', () => {
      const file = aphImage.files && aphImage.files[0];
      if (!file) {
        aphPreview.style.display = 'none';
        aphDropHint.textContent = 'Click sau drag & drop pentru a alege o imagine (max 25MB)';
        return;
      }
      const url = URL.createObjectURL(file);
      aphPreview.src = url;
      aphPreview.style.display = 'block';
      aphDropHint.textContent = file.name + ' · ' + Math.round(file.size / 1024) + ' KB';
    });

    ['dragenter','dragover'].forEach(ev => aphDrop.addEventListener(ev, (e) => { e.preventDefault(); aphDrop.style.background = 'var(--accent-soft)'; }));
    ['dragleave','drop'].forEach(ev => aphDrop.addEventListener(ev, () => { aphDrop.style.background = ''; }));
    aphDrop.addEventListener('drop', (e) => {
      e.preventDefault();
      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
        aphImage.files = e.dataTransfer.files;
        aphImage.dispatchEvent(new Event('change'));
      }
    });

    aphForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      aphFeedback.className = 'feedback';
      aphFeedback.textContent = '';
      const lat = parseFloat(aphLat.value), lon = parseFloat(aphLon.value);
      if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
        aphFeedback.classList.add('error');
        aphFeedback.textContent = 'Setează coordonate valide (click pe hartă sau introdu manual).';
        return;
      }
      const isEdit = !!editingPhotoSrc;
      if (!isEdit && (!aphImage.files || !aphImage.files[0])) {
        aphFeedback.classList.add('error');
        aphFeedback.textContent = 'Imaginea e obligatorie pentru un foto-pin.';
        return;
      }
      aphSubmit.disabled = true;
      aphSubmit.textContent = isEdit ? 'Salvez modificări…' : 'Salvez…';
      try {
        const fd = new FormData(aphForm);
        let url = '/api/add-photo';
        if (isEdit) {
          fd.append('src', editingPhotoSrc);
          url = '/api/update-photo';
        }
        const res = await fetch(url, { method: 'POST', body: fd });
        const data = await res.json();
        if (!res.ok || !data.ok) throw new Error(data.error || ('HTTP ' + res.status));
        const photo = data.photo;
        if (isEdit) {
          // Update existing marker in place
          const rec = ctx.pubcrawlMarkers.find(r => r.photo.src === editingPhotoSrc);
          if (rec) {
            rec.photo = photo;
            rec.marker.setLatLng([photo.lat, photo.lon]);
          }
          ctx.refreshPubcrawlVisibility();
          aphFeedback.classList.add('success');
          aphFeedback.textContent = 'Modificat.';
          map.setView([photo.lat, photo.lon], Math.max(map.getZoom(), 17), { animate: true });
          setTimeout(closePhotoModal, 900);
          return;
        }
        // Add a new dot on the map immediately
        const m = L.marker([photo.lat, photo.lon], {
          icon: ctx.pubcrawlIcon(),
          zIndexOffset: -100,
          riseOnHover: true,
        });
        m.on('click', () => ctx.openPhotoLightbox(photo));
        ctx.pubcrawlMarkers.push({marker: m, photo});
        // refreshPubcrawlVisibility adaugă în cluster doar dacă photo trece
        // filtrul de timeline curent (paritate cu init).
        ctx.refreshPubcrawlVisibility();
        aphFeedback.classList.add('success');
        aphFeedback.textContent = 'Salvat. Bulina apare imediat pe hartă.';
        map.setView([photo.lat, photo.lon], Math.max(map.getZoom(), 17), { animate: true });
        setTimeout(closePhotoModal, 1100);
      } catch (err) {
        aphFeedback.classList.add('error');
        aphFeedback.textContent = 'Eroare: ' + err.message;
      } finally {
        aphSubmit.disabled = false;
        aphSubmit.textContent = isEdit ? 'Salvează modificări' : 'Salvează foto';
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;
      if (photoPlaceModeActive) { exitPhotoPlaceMode(); openPhotoModal(); }
      else if (aphModal.classList.contains('open')) closePhotoModal();
    });

}
