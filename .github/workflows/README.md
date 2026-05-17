# GitHub Actions — Auto-deploy la ionpeblog.ro

Workflow-ul `deploy.yml` urcă automat site-ul pe ionpeblog.ro la fiecare `git push` pe `main`.

## Ce face workflow-ul

La fiecare push pe `main` (sau lansat manual din UI):

1. **Validează** toate JSON-urile (`scripts/validate_data.py`)
2. **Generează** cele ~245 pagini SEO statice (`scripts/generate_static_pages.py` → `galati_map/loc/`, `galati_map/tour/`, `galati_map/hunt/`, `galati_map/sitemap.xml`)
3. **Bumpează** versiunea cache a service-worker-ului (`tg-vNN` → `tg-v(NN+1)`) ca utilizatorii să primească ultima versiune
4. **Urcă prin FTP** doar fișierele modificate:
   - `galati_map/` → server `./galati_map/`
   - `assets/` → server `./assets/`

Exclude automat: `_admin/`, `__pycache__/`, `geocode_cache.json`, `manual_overrides.json`, `unplaced_locations.json`, `.DS_Store`, `battle/` (din assets).

## Configurare inițială (one-time)

### Pas 1 — Găsește credentialele FTP în cPanel

1. Intri în **cPanel** la `https://ionpeblog.ro/cpanel` (sau prin providerul tău)
2. Caută secțiunea **„FTP Accounts"**
3. Fie folosești contul principal (același user ca cPanel), fie creezi unul nou:
   - **Username**: ex. `deploy@ionpeblog.ro`
   - **Password**: generează unul tare (16+ caractere)
   - **Directory**: `public_html` (sau directorul corect pentru ionpeblog.ro)
   - **Quota**: Unlimited
4. Notează:
   - **Server FTP** (host): de obicei `ftp.ionpeblog.ro` sau `ionpeblog.ro`
   - **Username** (cu @ și domeniul)
   - **Password**

### Pas 2 — Adaugă secrets în GitHub

1. Mergi la `https://github.com/vladionut192-cpu/Treasure-Galati/settings/secrets/actions`
2. Apasă **„New repository secret"** pentru fiecare:

| Nume secret | Valoare |
|-------------|---------|
| `FTP_SERVER` | `ftp.ionpeblog.ro` (sau ce-ți spune cPanel) |
| `FTP_USERNAME` | `deploy@ionpeblog.ro` (sau username-ul tău FTP) |
| `FTP_PASSWORD` | parola FTP |

### Pas 3 — (Opțional) Variabile de configurare

La `https://github.com/vladionut192-cpu/Treasure-Galati/settings/variables/actions` poți seta (NU secrets, ci variables):

| Variabilă | Default | Când să o schimbi |
|-----------|---------|-------------------|
| `FTP_PROTOCOL` | `ftps` | `ftp` dacă hostul tău nu suportă TLS (rar). `sftp` dacă ai SSH. |
| `FTP_PORT` | `21` | `22` pentru SFTP. |
| `FTP_TARGET_GALATI_MAP` | `./galati_map/` | Calea pe server dacă FTP user-ul tău nu e jail-uit în `public_html` |
| `FTP_TARGET_ASSETS` | `./assets/` | Idem pentru assets |

**Tipic pe cPanel**: FTP user-ul aterizează direct în `public_html`, deci default-urile (`./galati_map/`, `./assets/`) funcționează.

## Cum verifici că merge

1. Fă o modificare mică (ex. un commit pe README)
2. `git push origin main`
3. Mergi la `https://github.com/vladionut192-cpu/Treasure-Galati/actions`
4. Vezi job-ul „Deploy to ionpeblog.ro" rulând
5. La final, deschide `https://ionpeblog.ro/galati_map/index.html` — ar trebui să vezi modificarea

## Troubleshooting

- **„ECONNREFUSED" / „Connection timed out"** → host/port greșit. Verifică `FTP_SERVER`. Încearcă variabila `FTP_PROTOCOL=ftp` (fără S) sau port `21`.
- **„530 Login authentication failed"** → user/parolă greșite. La cPanel FTP, username-ul include uneori `@domeniu.ro`.
- **„550 Permission denied"** → user-ul FTP nu are acces la directorul țintă. Verifică Directory-ul setat în cPanel când ai creat contul.
- **Fișierele se urcă în loc greșit** (ex. în `/public_html/public_html/galati_map/`) → user-ul nu e jail-uit. Setează `FTP_TARGET_GALATI_MAP=./public_html/galati_map/` și `FTP_TARGET_ASSETS=./public_html/assets/` ca variabile.
- **Deploy lent** → primul push e încet (urcă tot). Următoarele sunt rapide (doar diff-uri). FTP-Deploy-Action ține un manifest `.ftp-deploy-sync-state.json` pe server ca să știe ce-i schimbat.

## Lansare manuală

Din `https://github.com/vladionut192-cpu/Treasure-Galati/actions/workflows/deploy.yml` apasă **„Run workflow"** → ramura `main` → **Run**. Util când vrei să forțezi un redeploy fără un commit nou.
