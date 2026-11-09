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
  // act one: a plausible stranger's sequence, with the jump at the grazing angle
  const dives = [45, 50, 60, 30, 34, 33.5, 26, 22.5, 10, 80, 70, 0, 85, 75, 65, 55, 40, 16.5];
  for (let k = 0; k < dives.length; k++) {
    await setRange('dive', dives[k]); await page.waitForTimeout(100);
    if (k === 0) await shot('a-1-preview', true);
    await page.click('#b-fire'); await page.waitForTimeout(400);
    if (k === 0) await shot('a-1-travelling', false);
    await idle(); await page.waitForTimeout(150);
    log.push(await page.evaluate(() => document.getElementById('res1').innerText.replace(/\n/g, ' / ')) + '   [' + await page.evaluate(() => document.getElementById('status').innerText) + ']');
    if (k === 0) await shot('a-1-result', true);
    if (k === 4) await shot('a-5-graze-mantle', true);
    if (k === 5) { await shot('a-6-graze-core', true); await shot('view-6-graze-core', false); }
    if (await hscroll()) errors.push('horizontal scroll after shot ' + (k + 1));
  }
  await shot('a-fan-before-done', true);
  await page.click('#b-done1'); await page.waitForTimeout(600); await shot('a-fan-firing', false); await idle(); await page.waitForTimeout(200);
  await shot('a-reveal', true);
  log.push('REVEAL: ' + await page.evaluate(() => document.getElementById('res-reveal').innerText.replace(/\n/g, ' / ')));
  await page.click('#b-twist'); await page.waitForTimeout(200); await shot('a-twist', true);
  await page.click('#b-build'); await page.waitForTimeout(200); await shot('b-1-ready', true); await shot('view-b-1-ready', false);
  // act two: slower first (the wrong way), then a faster ball, then a tiny one, then Lehmann's
  const balls = [[0.25, 0.9], [0.25, 1.1], [0.1, 1.05], [0.22, 1.075]];
  for (let k = 0; k < balls.length; k++) {
    await setRange('size', balls[k][0]); await setRange('speed', balls[k][1]); await page.waitForTimeout(100);
    if (k === 0) await shot('b-1-set', true);
    await page.click('#b-quake'); await page.waitForTimeout(700);
    if (k === 1) await shot('b-2-firing', false);
    await idle(); await page.waitForTimeout(200);
    log.push(await page.evaluate(() => document.getElementById('res2').innerText.replace(/\n/g, ' / ')) + '   [' + await page.evaluate(() => document.getElementById('status').innerText) + ']');
    await shot('b-' + (k + 1) + '-result', true);
    if (k === 1) await shot('view-b-2-result', false);
    if (await hscroll()) errors.push('horizontal scroll after quake ' + (k + 1));
  }
  const btn = await page.evaluate(() => document.getElementById('b-done2').innerText);
  if (!/verdict/i.test(btn)) errors.push('after four quakes the quiet button should read See the verdict, reads: ' + btn);
  await page.click('#b-done2'); await page.waitForTimeout(400); await shot('end', true); await shot('view-end', false);
  log.push('VERDICT: ' + await page.evaluate(() => document.querySelector('.verdict').innerText.replace(/\n+/g, ' / ')));
  if (await hscroll()) errors.push('horizontal scroll on the end screen');
  await page.click('#b-about'); await page.waitForTimeout(200); await shot('about', true); await page.click('#b-about-close');
  // retry
  await page.click('#b-again'); await page.waitForTimeout(300);
  const ok = await page.evaluate(() => { const g = window.__game(); return g.phase === 'act1' && g.game.shots.length === 0 && document.getElementById('dive').value === '45'; });
  if (!ok) errors.push('retry did not restart cleanly');
  await shot('c-restart', true);
  // early finish path: one quake then That's my Earth
  await setRange('dive', 40); await page.click('#b-fire'); await idle(); await page.click('#b-done1'); await idle(); await page.click('#b-twist'); await page.click('#b-build');
  await setRange('size', 0.3); await setRange('speed', 0.8); await page.click('#b-quake'); await idle(); await page.waitForTimeout(100);
  log.push('EARLY: ' + await page.evaluate(() => document.getElementById('res2').innerText.replace(/\n/g, ' / ')));
  await page.click('#b-done2'); await page.waitForTimeout(300); await shot('c-end-slow', true);
  log.push('EARLY VERDICT: ' + await page.evaluate(() => document.getElementById('v-fate').innerText + ' / ' + document.getElementById('v-did').innerText));
  console.log(log.join('\n'));
  console.log(errors.length ? 'ERRORS:\n' + errors.join('\n') : 'no errors; no horizontal scroll');
  await browser.close();
  process.exit(errors.length ? 1 : 0);
})();
