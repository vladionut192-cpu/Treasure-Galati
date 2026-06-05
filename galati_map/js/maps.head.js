    // Hamburger menu — același pattern ca index.html / lists.html
    (function () {
      const burger = document.getElementById('topbar-burger');
      const nav = document.getElementById('topbar-nav');
      if (!burger || !nav) return;
      function close() {
        nav.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
      }
      burger.addEventListener('click', () => {
        const open = nav.classList.toggle('open');
        burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
      nav.addEventListener('click', (e) => { if (e.target.closest('a')) close(); });
      document.addEventListener('click', (e) => {
        if (!nav.classList.contains('open')) return;
        if (e.target.closest('.topbar')) return;
        close();
      });
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && nav.classList.contains('open')) close();
      });
    })();
    // i18n: aplicare la load + handler picker limbă (dropdown)
    (function () {
      function setup() {
        if (typeof window.applyTranslations !== 'function') {
          return setTimeout(setup, 30);
        }
        window.applyTranslations();
        const currentBtn = document.getElementById('lang-current-btn');
        const menu = document.getElementById('lang-menu');
        function positionMenu() {
          if (!menu || !currentBtn) return;
          const r = currentBtn.getBoundingClientRect();
          let top = r.bottom + 6;
          let left = r.right - menu.offsetWidth;
          const margin = 8;
          if (left < margin) left = margin;
          const maxRight = window.innerWidth - margin;
          if (left + menu.offsetWidth > maxRight) left = maxRight - menu.offsetWidth;
          menu.style.top = top + 'px';
          menu.style.left = left + 'px';
        }
        function openMenu() {
          if (!menu) return;
          menu.hidden = false;
          currentBtn.setAttribute('aria-expanded', 'true');
          requestAnimationFrame(() => requestAnimationFrame(positionMenu));
        }
        function closeMenu() { if (menu) { menu.hidden = true; currentBtn.setAttribute('aria-expanded', 'false'); } }
        window.addEventListener('resize', () => { if (menu && !menu.hidden) positionMenu(); }, { passive: true });
        window.addEventListener('scroll', () => { if (menu && !menu.hidden) positionMenu(); }, { passive: true });
        if (currentBtn && menu) {
          currentBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (menu.hidden) openMenu(); else closeMenu();
          });
          document.addEventListener('click', (e) => {
            if (menu.hidden) return;
            if (e.target.closest('#lang-picker')) return;
            closeMenu();
          });
          document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !menu.hidden) closeMenu();
          });
        }
        document.querySelectorAll('[data-lang-btn]').forEach(btn => {
          btn.addEventListener('click', () => {
            window.setLang(btn.getAttribute('data-lang-btn'));
            closeMenu();
            // Re-randează galeria ca să comute legendele RO ↔ EN.
            if (typeof window.__renderMapsGallery === 'function') window.__renderMapsGallery();
          });
        });
      }
      setup();
    })();
