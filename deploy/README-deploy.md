# Heritage Galați — deploy pe cPanel

Arhivă: **heritage-galati-deploy.zip** (~146 MB)

## Conținut

```
heritage-galati-deploy.zip
├── galati_map/        (HTML + JS + JSON, ~1.5 MB)
│   ├── index.html
│   ├── cronologie.html
│   ├── batalia-galati-1918.html
│   ├── sw.js
│   ├── robots.txt
│   ├── sitemap.xml
│   ├── _headers       (Cloudflare/Netlify; ignored on Apache)
│   ├── *.json + *.geojson (date)
│   └── vendor/        (Leaflet + Inter font, self-hosted)
└── assets/            (~144 MB)
    ├── images/        (poze locații, comic 1918, covere)
    ├── downloads/     (PDF Bătălia 1918, ~4 MB)
    └── logo-sigiliu.svg
```

**NU include:** `_admin/` (uneltele de editare locală), `Surse/` (PDF-uri, txt-uri), `scripts/`, `Pub Crawl - Traseu/`, `geocode_cache.json`.

## Pași de upload

### 1. Extract

Pe cPanel **File Manager** sau prin SSH:

```bash
# după upload
cd public_html
unzip heritage-galati-deploy.zip
```

Structura finală în `public_html/`:
```
public_html/
├── galati_map/
└── assets/
```

URL-ul site-ului: `https://heritage-galati.ro/galati_map/index.html`

### 2. (Opțional) redirect la rădăcină

Dacă vrei ca `https://heritage-galati.ro/` să ducă direct pe hartă, creează `public_html/.htaccess` cu:

```apache
RewriteEngine On
RewriteRule ^$ /galati_map/index.html [L]
```

Sau pune un `public_html/index.html` simplu cu meta-refresh:

```html
<!doctype html>
<meta http-equiv="refresh" content="0; url=/galati_map/index.html">
```

### 3. Domeniul

Toate referințele `heritage-galati.ro` sunt placeholder. Dacă vei deploya pe alt domeniu, fă find+replace **înainte de upload**:

```bash
# de ex.: domeniul real e patrimoniugalati.ro
grep -rl "heritage-galati.ro" galati_map/ assets/ | xargs sed -i '' 's|heritage-galati.ro|patrimoniugalati.ro|g'
```

Apoi reconstruiești arhiva: `python3 scripts/make_deploy_archive.py`

Fișiere afectate de înlocuire:
- `galati_map/index.html` (canonical + OG tags)
- `galati_map/cronologie.html` (canonical + OG tags)
- `galati_map/batalia-galati-1918.html` (canonical + OG tags)
- `galati_map/sitemap.xml`
- `galati_map/robots.txt`

### 4. SSL

Asigură-te că ai SSL activ (Let's Encrypt din cPanel SSL/TLS Status).
Asseturile sunt referite cu paths relative (`vendor/`, `../assets/`), deci nu sunt mixed-content issues. Singurul link extern HTTPS este `https://ionpeblog.ro/`.

### 5. Verificare după deploy

| URL | Așteptat |
|---|---|
| `/galati_map/index.html` | Harta cu pinii |
| `/galati_map/cronologie.html` | Liste pe ani |
| `/galati_map/batalia-galati-1918.html` | Animația bătăliei |
| `/galati_map/robots.txt` | Text plain cu Disallow `_admin/` |
| `/galati_map/sitemap.xml` | XML cu URL-urile principale |
| `/galati_map/_admin/editor.html` | **403 Forbidden** (dacă `.htaccess` deny e respectat) |

Dacă `_admin/` e accesibil public, șterge folderul de pe server — uneltele oricum nu funcționează fără `serve.py` local.

## Service Worker

`sw.js` cache-uiește offline-first cu `CACHE_VERSION = 'tg-v3'`. Dacă faci o actualizare semnificativă, bumpează versiunea (`tg-v4`, `tg-v5`...) ca să forțezi clienții să reîncarce.

## Performanță

- **Imagini:** 144 MB necomprimate. Pentru încărcare mai rapidă pe 3G, ar putea fi rescalate la max 1280px (recomand WebP cu fallback JPEG). Ai în `scripts/find_unused_images.py` o bază de start.
- **Font Inter + Leaflet CSS:** încărcate non-blocking via `rel="preload"` + `onload`. Paint-ul inițial nu e blocat.
- **Service Worker:** prima vizită pre-cache-uiește shell-ul + 4 fonturi Inter; vizite ulterioare folosesc cache-ul.
- **CDN:** harta de bază vine de la `basemaps.cartocdn.com` (DNS-prefetched).

## Probleme cunoscute

- Limita de upload pe cPanel poate fi sub 146MB. Soluții:
  - **FTP/SFTP** (FileZilla, Cyberduck) — fără limită, recomandat
  - **SSH + scp/rsync** dacă ai acces shell
  - **Spargi în 2 zip-uri**: unul cu `galati_map/` (1.5MB), unul cu `assets/` (144MB)
