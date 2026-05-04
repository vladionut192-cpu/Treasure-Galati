#!/usr/bin/env python3
"""Generează `scripts/image_review.html` — pagină statică unde poți vedea
toate candidatele de imagini (din Wikimedia Commons), și marca per pin
care imagine să fie aplicată sau dacă să o sari.

Workflow:
1. python3 scripts/find_images.py                # produce image_candidates.json
2. python3 scripts/review_images.py              # produce image_review.html
3. open scripts/image_review.html                # browseză + click pe „Use" / „Skip"
4. (în pagină: butonul „Exportă selecții" descarcă image_decisions.json)
5. python3 scripts/apply_images.py               # citește decisions și aplică
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CANDIDATES = Path(__file__).resolve().parent / "image_candidates.json"
OUT = Path(__file__).resolve().parent / "image_review.html"


HTML = """<!doctype html>
<html lang="ro">
<head>
<meta charset="utf-8">
<title>Review imagini Wikimedia Commons</title>
<style>
* { box-sizing: border-box; }
body { font: 14px/1.5 system-ui, -apple-system, "Segoe UI", sans-serif; margin: 0; background: #fafafa; color: #222; }
header { position: sticky; top: 0; background: #fff; border-bottom: 1px solid #ddd; padding: 12px 18px; display: flex; gap: 16px; align-items: center; z-index: 10; }
header h1 { font-size: 16px; margin: 0; }
header .count { color: #666; font-size: 12px; }
header button { padding: 7px 14px; border: 1px solid #888; background: #fff; cursor: pointer; border-radius: 6px; font-size: 13px; }
header button:hover { background: #eef; }
header button.primary { background: #245; color: #fff; border-color: #245; }
header button.primary:hover { background: #135; }
main { max-width: 1100px; margin: 18px auto; padding: 0 18px; }
.pin { background: #fff; border: 1px solid #ddd; border-radius: 10px; padding: 14px 16px; margin-bottom: 16px; }
.pin h2 { margin: 0 0 4px; font-size: 16px; }
.pin .meta { color: #666; font-size: 12px; margin-bottom: 12px; }
.pin .meta code { background: #f4f4f4; padding: 1px 5px; border-radius: 3px; }
.candidates { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 10px; }
.cand { border: 2px solid transparent; border-radius: 8px; padding: 8px; background: #fafafa; cursor: pointer; transition: all 0.1s; }
.cand:hover { border-color: #888; }
.cand.selected { border-color: #2a8; background: #eafef0; }
.cand img { width: 100%; height: 160px; object-fit: cover; border-radius: 4px; background: #eee; display: block; }
.cand .info { font-size: 11px; line-height: 1.35; margin-top: 6px; }
.cand .info .score { display: inline-block; padding: 1px 6px; border-radius: 3px; background: #245; color: #fff; font-weight: bold; }
.cand .info .lic { color: #888; }
.cand .info a { color: #245; text-decoration: none; }
.cand .info a:hover { text-decoration: underline; }
.skip-btn { display: inline-block; margin-top: 6px; font-size: 11px; color: #c33; cursor: pointer; padding: 3px 6px; border: 1px solid #c33; border-radius: 4px; background: transparent; }
.skip-btn.active { background: #c33; color: #fff; }
.help { color: #888; font-size: 12px; margin: 14px 0; }
</style>
</head>
<body>
<header>
  <h1>Review imagini Wikimedia Commons</h1>
  <span class="count" id="count">0 selectate · 0 sărite</span>
  <span style="flex:1"></span>
  <button id="btn-export" class="primary">⬇ Descarcă image_decisions.json</button>
</header>
<main>
<p class="help">Click pe o imagine pentru a o selecta pentru pinul respectiv. Click „Skip" dacă niciuna nu e potrivită. Decizia se persistă în localStorage; click-ul „Descarcă image_decisions.json" la final.</p>
<div id="pins"></div>
</main>
<script>
const candidatesData = __DATA__;

const decisions = JSON.parse(localStorage.getItem('img-decisions') || '{}');

function persist() {
  localStorage.setItem('img-decisions', JSON.stringify(decisions));
  updateCount();
}

function updateCount() {
  let sel = 0, skip = 0;
  for (const k in decisions) {
    if (decisions[k] === 'skip') skip++;
    else if (decisions[k]) sel++;
  }
  document.getElementById('count').textContent = `${sel} selectate · ${skip} sărite`;
}

function thumbUrl(fileTitle) {
  // Wikimedia thumbnail URL via Special:Filepath
  const t = fileTitle.replace(/^File:/, '').replace(/ /g, '_');
  return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(t)}?width=400`;
}

function render() {
  const container = document.getElementById('pins');
  container.innerHTML = '';
  const ids = Object.keys(candidatesData.candidates);
  ids.sort((a, b) => candidatesData.candidates[b].matches[0].score - candidatesData.candidates[a].matches[0].score);

  for (const pinId of ids) {
    const p = candidatesData.candidates[pinId];
    const decided = decisions[pinId];
    const pinEl = document.createElement('div');
    pinEl.className = 'pin';
    pinEl.innerHTML = `
      <h2>${p.title}</h2>
      <div class="meta">
        <code>${pinId}</code> · ${p.location || '—'} · tokens: ${p.tokens.join(', ')}
      </div>
      <div class="candidates" id="c-${pinId}"></div>
      <button class="skip-btn ${decided === 'skip' ? 'active' : ''}" data-pin="${pinId}">${decided === 'skip' ? '✓ Skip' : 'Skip toate'}</button>
    `;
    container.appendChild(pinEl);
    const candWrap = pinEl.querySelector(`#c-${pinId}`);
    p.matches.forEach((m, idx) => {
      const fileShort = m.file.replace(/^File:/, '');
      const isSel = decisions[pinId] === m.file;
      const card = document.createElement('div');
      card.className = 'cand' + (isSel ? ' selected' : '');
      card.innerHTML = `
        <img src="${thumbUrl(m.file)}" alt="${fileShort}" loading="lazy">
        <div class="info">
          <span class="score">${m.score}</span>
          <strong>${fileShort.slice(0, 70)}</strong><br>
          <span class="lic">${m.license || '?'} · ${m.date || '?'}</span><br>
          <a href="${m.descriptionurl}" target="_blank" rel="noopener">→ Commons</a>
        </div>
      `;
      card.addEventListener('click', () => {
        decisions[pinId] = m.file;
        persist();
        render();
      });
      candWrap.appendChild(card);
    });
    pinEl.querySelector('.skip-btn').addEventListener('click', () => {
      if (decisions[pinId] === 'skip') {
        delete decisions[pinId];
      } else {
        decisions[pinId] = 'skip';
      }
      persist();
      render();
    });
  }
  updateCount();
}

document.getElementById('btn-export').addEventListener('click', () => {
  const out = {};
  for (const pinId in decisions) {
    if (decisions[pinId] && decisions[pinId] !== 'skip') {
      const cand = candidatesData.candidates[pinId];
      const m = cand.matches.find(x => x.file === decisions[pinId]);
      if (m) out[pinId] = {
        file: m.file, url: m.url, descriptionurl: m.descriptionurl,
        license: m.license, credit: m.credit, date: m.date, uploader: m.uploader
      };
    } else if (decisions[pinId] === 'skip') {
      out[pinId] = 'skip';
    }
  }
  const blob = new Blob([JSON.stringify(out, null, 2)], {type: 'application/json'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'image_decisions.json';
  a.click();
});

render();
</script>
</body>
</html>
"""


def main():
    with open(CANDIDATES, encoding="utf-8") as f:
        data = json.load(f)

    html = HTML.replace("__DATA__", json.dumps(data, ensure_ascii=False))
    OUT.write_text(html, encoding="utf-8")
    print(f"✏️  {OUT.relative_to(ROOT)}")
    print(f"    {data['pins_with_matches']} pinuri cu candidate, descurcate cu thumbnails")
    print(f"\nDeschide:")
    print(f"    file://{OUT}")
    print(f"  sau prin server local:")
    print(f"    http://localhost:8000/scripts/image_review.html")


if __name__ == "__main__":
    main()
