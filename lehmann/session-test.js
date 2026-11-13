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
  const setRange = async (id, v) => page.evaluate(([id, v]) => { const e = document.getElementById(id); e.step = 'any'; e.value = v; e.dispatchEvent(new Event('input')); }, [id, v]);
  const says = async () => await page.evaluate(() => document.getElementById('res').innerText.replace(/\n+/g, ' / ')) + '   [' + await page.evaluate(() => document.getElementById('status').innerText) + ']';
  const log = [];
  await shot('start', true); await shot('view-start', false);
  await page.click('#b-begin'); await page.waitForTimeout(300); await shot('a-1-ready', true); await shot('view-1-ready', false);
  await page.click('#q-play'); await page.waitForTimeout(200); await shot('help', true); await page.click('#b-help-close');
  // act one: twelve waves, with the jump at the grazing angle
  const dives = [45, 60, 30, 80, 10, 20, 34, 33.5, 33.7, 26, 22.5, 0];
  for (let k = 0; k < dives.length; k++) {
    await setRange('dive', dives[k]); await page.waitForTimeout(100);
    await page.click('#b-fire'); await page.waitForTimeout(400);
    if (k === 0) await shot('a-1-travelling', false);
    if (k < dives.length - 1) { await idle(); await page.waitForTimeout(150); }
    else { await page.waitForFunction(() => window.__game().phase === 'reveal', null, { timeout: 15000 }); await page.waitForTimeout(600); await shot('a-fan-firing', false); await idle(); await page.waitForTimeout(200); }
    log.push(await says());
    if (k === 0) { await shot('a-1-result', true); await shot('view-1-result', false); }
    if (k === 5) { const cue = await page.evaluate(() => document.getElementById('status').innerText); if (!/now wave 7 of 12: choose your next dive/i.test(cue)) errors.push('the cue above the dial should invite the next wave, reads: ' + cue); if (await page.evaluate(() => document.querySelectorAll('#plate .ring:not(.hide)').length) !== 0) errors.push('no post should be ringed in act one'); }
    if (k === 7) { await shot('a-8-graze-core', true); await shot('view-8-graze-core', false); }
    if (await hscroll()) errors.push('horizontal scroll after wave ' + (k + 1));
  }
  const dialKept = await page.evaluate(() => document.getElementById('dive').value);
  if (dialKept !== '0') errors.push('the dial should stay where the player left it (0), reads ' + dialKept);
  await shot('a-reveal', true);
  await page.click('#b-next'); await page.waitForTimeout(3600); await shot('a-records', true); await shot('view-records', false);
  if (await page.evaluate(() => document.querySelectorAll('#twist-card .rec').length) !== 3) errors.push('the records card should draw three posts');
  await page.click('#b-build'); await page.waitForTimeout(300); await shot('b-1-ready', true); await shot('view-b-1-ready', false);
  if (await page.evaluate(() => document.querySelectorAll('#plate .ring:not(.hide)').length) !== 4) errors.push('act two should ring the four shadow posts');
  const nudged = await page.evaluate(() => { const e = document.getElementById('dive'); e.step = 'any'; e.value = 14.4; e.dispatchEvent(new Event('input')); document.getElementById('dive-plus').click(); return document.getElementById('dive-read').innerText; });
  if (nudged !== '14.5°') errors.push('the + button should move a tenth of a degree, reads ' + nudged);
  // act two: the inner ball is drawn; one miss, then the four shadow posts
  if (!(await page.evaluate(() => !document.querySelector('#plate svg circle[stroke-width="1"][stroke="#EEE3C8"]').classList.contains('hide')))) errors.push('act two should draw the inner ball');
  const dives2 = [30, 10, 13, 14, 15, 14.5, 15.5];
  for (let k = 0; k < dives2.length; k++) {
    await setRange('dive', dives2[k]); await page.waitForTimeout(100);
    await page.click('#b-fire'); await page.waitForTimeout(400);
    if (k < dives2.length - 1) { await idle(); await page.waitForTimeout(150); }
    else { await page.waitForFunction(() => window.__game().phase === 'reveal2', null, { timeout: 15000 }); await page.waitForTimeout(1500); await shot('b-fan-firing', false); await idle(); await page.waitForTimeout(300); }
    log.push(await says());
    if (k === 0) await shot('b-1-miss', true);
    if (k === 2) { await shot('b-3-through', true); await shot('view-b-3-through', false); }
    if (k === 4) { await shot('b-5-bounce', true); await shot('view-b-5-bounce', false); }
    if (await hscroll()) errors.push('horizontal scroll after act-two wave ' + (k + 1));
  }
  await shot('b-reveal', true); await shot('view-b-reveal', false);
  const btn = await page.evaluate(() => document.getElementById('b-next').innerText);
  if (!/verdict/i.test(btn)) errors.push('after the second act the gold button should read See the verdict, reads: ' + btn);
  await page.click('#b-next'); await page.waitForTimeout(400); await shot('end', true); await shot('view-end', false);
  log.push('VERDICT: ' + await page.evaluate(() => document.querySelector('.verdict').innerText.replace(/\n+/g, ' / ')));
  if (await hscroll()) errors.push('horizontal scroll on the end screen');
  await page.click('#b-about'); await page.waitForTimeout(200); await shot('about', true); await page.click('#b-about-close');
  // retry
  await page.click('#b-again'); await page.waitForTimeout(300);
  const ok = await page.evaluate(() => { const g = window.__game(); return g.phase === 'act1' && g.game.shots.length === 0 && document.getElementById('dive').value === '45' && document.querySelectorAll('#plate .ring:not(.hide)').length === 0; });
  if (!ok) errors.push('retry did not restart cleanly');
  await shot('c-restart', true);
  // a player who never dives steeply: the shadow stays dark, the game still ends
  for (let k = 0; k < 12; k++) { await setRange('dive', 40 + k * 2); await page.click('#b-fire'); if (k < 11) await idle(); }
  await page.waitForFunction(() => window.__game().phase === 'reveal', null, { timeout: 15000 }); await idle();
  await page.click('#b-next'); await page.waitForTimeout(200); await page.click('#b-build');
  for (let k = 0; k < 8; k++) { await setRange('dive', 20 + k * 3); await page.click('#b-fire'); if (k < 7) await idle(); }
  await page.waitForFunction(() => window.__game().phase === 'reveal2', null, { timeout: 15000 }); await idle(); await page.waitForTimeout(200);
  log.push('HIDDEN: ' + await says()); await shot('c-hidden-reveal', true);
  await page.click('#b-next'); await page.waitForTimeout(300); await shot('c-end-hidden', true);
  log.push('HIDDEN VERDICT: ' + await page.evaluate(() => document.getElementById('v-fate').innerText + ' / ' + document.getElementById('v-did').innerText));
  console.log(log.join('\n'));
  console.log(errors.length ? 'ERRORS:\n' + errors.join('\n') : 'no errors; no horizontal scroll');
  await browser.close();
  process.exit(errors.length ? 1 : 0);
})();
