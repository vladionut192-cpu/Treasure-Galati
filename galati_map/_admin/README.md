# Admin tools — local only

Aceste pagini sunt pentru editare locală a datelor (locații, tururi, fotografii):

- `editor.html` — editor de locații (locations.json)
- `digitizer.html` — digitizator hărți istorice
- `add_location.html` — formular rapid pentru adăugare locație
- `pubcrawl_editor.html` — editor pub-crawl photos (pubcrawl_photos.json)
- `tours_editor.html` — editor tururi (tours.json)
- `text_pins_editor.html?kind=trivia` — editor curiozități „Știați că?" (trivia.json)
- `text_pins_editor.html?kind=legenda` — editor legende (legende.json)

## Cum se folosesc

Au nevoie de `scripts/serve.py` rulând local (pentru endpoint-urile `/api/*`):

```bash
python3 scripts/serve.py
# apoi → http://localhost:8000/galati_map/_admin/editor.html
```

## Deploy

`.htaccess` din acest folder restricționează accesul la `127.0.0.1` pe Apache/cPanel.
Dacă serverul de prod nu suportă `.htaccess`, **nu uploadați acest folder pe domeniu**.
