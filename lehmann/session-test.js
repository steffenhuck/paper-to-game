// Full session in headless Chromium at phone width: plays a whole game, opens help mid-play, retries, screenshots.
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 380, height: 760 }, deviceScaleFactor: 1 });
  const errors = []; page.on('pageerror', e => errors.push(e.message)); page.on('console', m => { if (m.type() === 'error' && !/goatcounter|gc\.zgo|ERR_FAILED|net::/.test(m.text())) errors.push(m.text()); });
  await page.route(/gc\.zgo\.at/, r => r.abort());
  await page.goto('file://' + path.resolve(__dirname, 'lehmanns-shadow.html')); await page.waitForTimeout(1200);
  const shot = async (n, full) => page.screenshot({ path: path.join(__dirname, 'screenshot-' + n + '.png'), fullPage: !!full });
  const hscroll = async () => page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
  const idle = async () => page.waitForFunction(() => !window.__game().busy, null, { timeout: 15000 });
  const setRange = async (id, v) => page.evaluate(([id, v]) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('input')); }, [id, v]);
  const log = [];
  await shot('start', true); await shot('view-start', false);
  await page.click('#b-begin'); await page.waitForTimeout(300); await shot('a-1-ready', true); await shot('view-1-ready', false);
  // help opened mid-play and returned from
  await page.click('#q-play'); await page.waitForTimeout(200); await shot('help', true); await page.click('#b-help-close');
  // act one: a plausible stranger's sequence, with the jump at the grazing angle; the twelfth wave ends the act by itself
  const dives = [45, 50, 60, 30, 34, 33.5, 26, 22.5, 10, 80, 70, 0];
  for (let k = 0; k < dives.length; k++) {
    await setRange('dive', dives[k]); await page.waitForTimeout(100);
    if (k === 0) await shot('a-1-preview', true);
    await page.click('#b-fire'); await page.waitForTimeout(400);
    if (k === 0) await shot('a-1-travelling', false);
    if (k < dives.length - 1) { await idle(); await page.waitForTimeout(150); }
    else { await page.waitForFunction(() => window.__game().phase === 'reveal', null, { timeout: 15000 }); await page.waitForTimeout(600); await shot('a-fan-firing', false); await idle(); await page.waitForTimeout(200); }
    log.push(await page.evaluate(() => document.getElementById('res').innerText.replace(/\n/g, ' / ')) + '   [' + await page.evaluate(() => document.getElementById('status').innerText) + ']');
    if (k === 0) { await shot('a-1-result', true); await shot('view-1-result', false); }
    if (k === 4) await shot('a-5-graze-mantle', true);
    if (k === 5) { await shot('a-6-graze-core', true); await shot('view-6-graze-core', false); }
    if (await hscroll()) errors.push('horizontal scroll after shot ' + (k + 1));
  }
  const dialKept = await page.evaluate(() => document.getElementById('dive').value);
  if (dialKept !== '0') errors.push('the dial should stay where the player left it (0), reads ' + dialKept);
  await shot('a-reveal', true);
  await page.click('#b-twist'); await page.waitForTimeout(200); await shot('a-twist', true);
  await page.click('#b-build'); await page.waitForTimeout(200); await shot('b-1-ready', true); await shot('view-b-1-ready', false);
  // act two: slower first (the wrong way), the same, then faster
  const speeds = [0.9, 1.0, 1.1];
  for (let k = 0; k < speeds.length; k++) {
    await setRange('speed', speeds[k]); await page.waitForTimeout(100);
    if (k === 0) await shot('b-1-set', true);
    await page.click('#b-quake'); await page.waitForTimeout(700);
    if (k === 2) await shot('b-3-firing', false);
    await idle(); await page.waitForTimeout(200);
    log.push(await page.evaluate(() => document.getElementById('res').innerText.replace(/\n/g, ' / ')) + '   [' + await page.evaluate(() => document.getElementById('status').innerText) + ']');
    await shot('b-' + (k + 1) + '-result', true);
    if (k === 2) await shot('view-b-3-result', false);
    if (await hscroll()) errors.push('horizontal scroll after quake ' + (k + 1));
  }
  const btn = await page.evaluate(() => document.getElementById('b-quake').innerText);
  if (!/verdict/i.test(btn)) errors.push('after three quakes the gold button should read See the verdict, reads: ' + btn);
  await page.click('#b-quake'); await page.waitForTimeout(400); await shot('end', true); await shot('view-end', false);
  log.push('VERDICT: ' + await page.evaluate(() => document.querySelector('.verdict').innerText.replace(/\n+/g, ' / ')));
  if (await hscroll()) errors.push('horizontal scroll on the end screen');
  await page.click('#b-about'); await page.waitForTimeout(200); await shot('about', true); await page.click('#b-about-close');
  // retry
  await page.click('#b-again'); await page.waitForTimeout(300);
  const ok = await page.evaluate(() => { const g = window.__game(); return g.phase === 'act1' && g.game.shots.length === 0 && document.getElementById('dive').value === '45'; });
  if (!ok) errors.push('retry did not restart cleanly');
  await shot('c-restart', true);
  // early finish path: twelve quick waves, one slow quake, then the quiet button
  for (let k = 0; k < 12; k++) { await setRange('dive', 40 + k * 2); await page.click('#b-fire'); if (k < 11) await idle(); }
  await page.waitForFunction(() => window.__game().phase === 'reveal', null, { timeout: 15000 }); await idle();
  await page.click('#b-twist'); await page.click('#b-build');
  await setRange('speed', 0.8); await page.click('#b-quake'); await idle(); await page.waitForTimeout(100);
  log.push('EARLY: ' + await page.evaluate(() => document.getElementById('res').innerText.replace(/\n/g, ' / ')));
  await page.click('#b-done2'); await page.waitForTimeout(300); await shot('c-end-slow', true);
  log.push('EARLY VERDICT: ' + await page.evaluate(() => document.getElementById('v-fate').innerText + ' / ' + document.getElementById('v-did').innerText));
  console.log(log.join('\n'));
  console.log(errors.length ? 'ERRORS:\n' + errors.join('\n') : 'no errors; no horizontal scroll');
  await browser.close();
  process.exit(errors.length ? 1 : 0);
})();
