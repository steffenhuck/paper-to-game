// Full session in headless Chromium at phone width: plays a whole game, opens help mid-play, retries, screenshots.
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 380, height: 740 }, deviceScaleFactor: 1 });
  const errors = []; page.on('pageerror', e => errors.push(e.message)); page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  const url = 'file://' + path.resolve(__dirname, 'me-and-my-friends.html') + '?seed=2025';
  await page.goto(url); await page.waitForTimeout(600);
  const shot = async (n, full) => page.screenshot({ path: path.join(__dirname, 'screenshot-' + n + '.png'), fullPage: full !== false });
  const hscroll = async () => page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
  const log = [];
  const pick = async (scope, dial, v) => page.click(`${scope} .cards[data-dial="${dial}"] .card[data-v="${v}"]`);
  const res = async (id) => page.evaluate(id => document.getElementById(id).innerText.replace(/\n+/g, ' / '), id);
  await shot('start');
  await page.click('#b-begin'); await page.waitForTimeout(300); await shot('a-1-set-start');
  // help mid-play and back
  await page.click('#s-country .q'); await page.waitForTimeout(200); await shot('help'); await page.click('#b-help-close'); await page.waitForTimeout(100);
  if (await page.evaluate(() => !document.getElementById('s-country').classList.contains('on') || document.getElementById('main').classList.contains('off'))) errors.push('help did not return to the country screen');
  const countries = [[1, 1, 1], [1, 1, -1], [-1, -1, -1]];
  for (let i = 0; i < 3; i++) {
    const [m, j, l] = countries[i];
    await pick('#s-country', 'money', m); await pick('#s-country', 'jobs', j); await pick('#s-country', 'learn', l);
    await page.waitForTimeout(150); await shot(`a-${i + 1}-set`); if (i === 0) await shot('view-a-1-set', false);
    await page.click('#b-bell'); await page.waitForTimeout(900); if (i === 0) await shot('a-1-drawing', false);
    await page.waitForFunction(() => document.getElementById('c-result').innerText.length > 20, null, { timeout: 20000 });
    await page.waitForTimeout(200); await shot(`a-${i + 1}-result`); if (i === 0) await shot('view-a-1-result', false);
    log.push(`country ${i + 1}: ` + await res('c-result'));
    if (await hscroll()) errors.push('hscroll country ' + (i + 1));
    if (i < 2) await page.click('#b-another'); else await page.click('#b-enough');
    await page.waitForTimeout(200);
  }
  await shot('a-reveal'); log.push('reveal: ' + await res('r-text'));
  await page.click('#b-inside'); await page.waitForTimeout(300); await shot('a-street'); log.push('street: ' + await res('st-text'));
  await page.click('#b-try'); await page.waitForTimeout(300); await shot('a-levers-1-start');
  const tries = [[-1, -1, 1], [1, -1, 1], [1, 1, -1]];
  for (let i = 0; i < 3; i++) {
    const [a, b, c] = tries[i];
    await pick('#s-levers', 'mums', a); await pick('#s-levers', 'learn2', b); await pick('#s-levers', 'week', c);
    await page.waitForTimeout(150); await shot(`b-${i + 1}-set`);
    if (i === 1) { await page.click('#s-levers .q'); await page.waitForTimeout(150); await page.click('#b-help-close'); }
    await page.click('#b-draw');
    await page.waitForFunction(() => document.getElementById('l-result').innerText.length > 20, null, { timeout: 20000 });
    await page.waitForTimeout(200); await shot(`b-${i + 1}-result`); if (i === 0) await shot('view-b-1-result', false);
    log.push(`try ${i + 1}: ` + await res('l-result'));
    if (await hscroll()) errors.push('hscroll levers ' + (i + 1));
    if (i < 2) await page.click('#b-again'); else await page.click('#b-enough2');
    await page.waitForTimeout(200);
  }
  await shot('a-short'); log.push('short: ' + await res('sh-text'));
  await page.click('#b-verdict'); await page.waitForTimeout(300); await shot('a-end');
  log.push('VERDICT: ' + await res('v-did') + ' // ' + await res('v-paper') + ' // ' + await res('v-means'));
  await page.click('#s-verdict [data-about]'); await page.waitForTimeout(200); await shot('about'); await page.click('#b-about-close');
  await page.click('#b-restart'); await page.waitForTimeout(300); await shot('c-restart');
  const ok = await page.evaluate(() => window.__game().game.countries.length === 0 && window.__game().phase === 'country');
  if (!ok) errors.push('restart did not restart');
  if (await hscroll()) errors.push('hscroll at restart');
  console.log(log.join('\n'));
  console.log(errors.length ? 'ERRORS:\n' + errors.join('\n') : 'no errors; no horizontal scroll');
  await browser.close();
})();
