// Heritage Galați — config Playwright pentru testul smoke (tests/smoke.spec.js).
// Site static → webServer e doar un http.server Python pe galati_map/.
// Local: `npm run test:local` folosește Chrome-ul instalat (fără download);
// CI: instalează chromium-ul Playwright (vezi .github/workflows/deploy.yml).
const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  timeout: 45_000,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: 'http://127.0.0.1:8787',
    channel: process.env.PW_CHANNEL || undefined,
    // CRITIC: blocăm service worker-ul la nivel de context. La prima vizită
    // SW-ul se instalează și boot.js face un reload pe controllerchange —
    // reload care pică NEDETERMINIST în mijlocul testului (page.route pe
    // sw.js NU e suficient: înregistrarea SW nu trece prin rutele paginii).
    serviceWorkers: 'block',
    // La eșec păstrăm dovezi pentru debugging
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  webServer: {
    // Server static Node propriu (tests/static-server.js) — python http.server
    // scapă conexiuni sub rafale și producea eșecuri aleatorii (ERR_ABORTED).
    command: 'node tests/static-server.js 8787 galati_map',
    port: 8787,
    reuseExistingServer: !process.env.CI,
  },
});
