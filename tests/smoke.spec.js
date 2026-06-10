// Heritage Galați — smoke test: pagina principală se încarcă, harta randează,
// timeline-ul filtrează, detaliul se deschide. Rulează în CI înaintea
// deploy-ului (gate) — dacă pică, nu se livrează nimic.
//
// Principiu: aserțiuni pe COMPORTAMENT (apare/dispare/filtrează), nu pe
// valori exacte din date (numărul de locații crește săptămânal).
const { test, expect } = require('@playwright/test');

let consoleErrors;

test.beforeEach(async ({ page }) => {
  consoleErrors = [];
  page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()); });
  page.on('pageerror', (e) => consoleErrors.push(String(e)));
  // Determinism: service worker-ul e blocat din config (serviceWorkers:
  // 'block') — altfel la prima vizită boot.js face un reload automat pe
  // controllerchange, care pică nedeterminist în mijlocul testului. Aici
  // marcăm doar ghidul de onboarding ca văzut, ca overlay-ul lui să nu
  // consume primul Escape și să nu acopere UI-ul.
  await page.addInitScript(() => {
    try { localStorage.setItem('tg.tour.seen', '1'); } catch (e) {}
  });
  await page.goto('/index.html#map');
  // Aplicația e gata când lista de locații s-a populat
  await expect(page.locator('#list .item').first()).toBeVisible({ timeout: 20_000 });
});

test('harta se încarcă cu tile-uri, pinuri și listă — fără erori de consolă', async ({ page }) => {
  await expect(page.locator('#map .leaflet-tile').first()).toBeVisible({ timeout: 20_000 });
  expect(await page.locator('#list .item').count()).toBeGreaterThan(100);
  await expect(page.locator('#map .marker-bubble, #map .marker-cluster').first()).toBeVisible();
  // Filtrăm zgomotul de rețea (tile-uri externe care pot da timeout în CI)
  const realErrors = consoleErrors.filter((e) => !/net::|Failed to load resource/.test(e));
  expect(realErrors).toEqual([]);
});

test('timeline-ul are gradații generate din JSON și filtrează locațiile', async ({ page }) => {
  // Gradațiile vin din timeline_events.json (generate de JS, nu hardcodate)
  const events = page.locator('.timeline-events .event');
  expect(await events.count()).toBeGreaterThan(10);
  expect(await page.locator('.timeline-events .event.major').count()).toBeGreaterThan(3);

  const items = page.locator('#list .item');
  const initialItems = await items.count();
  await page.locator('#timeline-slider').evaluate((el) => {
    el.value = 1918;
    el.dispatchEvent(new Event('input', { bubbles: true }));
  });
  // Overlay-ul de an apare instant; filtrarea rulează debounced (~80ms),
  // deci numărul de locații din listă scade la scurt timp după.
  await expect(page.locator('#map-year-overlay')).toBeVisible();
  await expect(page.locator('#year-num')).toHaveText('1918');
  await expect.poll(() => items.count(), { timeout: 5_000 }).toBeLessThan(initialItems);

  // Reset → înapoi la starea inițială
  await page.locator('#timeline-reset').click();
  await expect(page.locator('#map-year-overlay')).toBeHidden();
  await expect.poll(() => items.count(), { timeout: 5_000 }).toBe(initialItems);
});

test('click pe o locație deschide panoul de detaliu; Escape îl închide', async ({ page }) => {
  await page.locator('#list .item').first().click();
  const detail = page.locator('#detail');
  await expect(detail).toHaveAttribute('data-open', '1');
  await expect(detail.locator('h2')).not.toBeEmpty();
  // Click-ul deschide și popup-ul Leaflet al markerului, care (dacă apucă să
  // preia focusul) consumă primul Escape. Două apăsări acoperă ambele stări;
  // dacă gestionarea Escape e stricată de tot, nici a doua nu închide panoul.
  await page.waitForTimeout(400);
  await page.keyboard.press('Escape');
  await page.keyboard.press('Escape');
  await expect(detail).not.toHaveAttribute('data-open', '1');
});

test('deep link ?loc= deschide direct detaliul locației', async ({ page }) => {
  await page.goto('/index.html?loc=loc-113#map');
  const detail = page.locator('#detail');
  await expect(detail).toHaveAttribute('data-open', '1', { timeout: 15_000 });
  await expect(detail.locator('h2')).toContainText('Eminescu');
});
