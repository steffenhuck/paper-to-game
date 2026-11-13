// Full session in headless Chromium at phone width: plays a whole game, opens help mid-play, retries, screenshots.
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 380, height: 760 }, deviceScaleFactor: 1, hasTouch: true });
  const errors = []; page.on('pageerror', e => errors.push(e.message)); page.on('console', m => { if (m.type() === 'error' && !/goatcounter|gc\.zgo|ERR_FAILED|net::/.test(m.text())) errors.push(m.text()); });
  await page.route(/gc\.zgo\.at/, r => r.abort());
  await page.goto('file://' + path.resolve(__dirname, 'find-your-inner-core-with-lehmann.html')); await page.waitForTimeout(1200);
  const shot = async (n, full) => page.screenshot({ path: path.join(__dirname, 'screenshot-' + n + '.png'), fullPage: !!full });
  const hscroll = async () => page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
  const idle = async () => page.waitForFunction(() => !window.__game().busy, null, { timeout: 15000 });
  const setRange = async (id, v) => page.evaluate(([id, v]) => { const e = document.getElementById(id); e.step = 'any'; e.value = v; e.dispatchEvent(new Event('input')); }, [id, v]);
  const text = async id => page.evaluate(id => document.getElementById(id).innerText.replace(/\n+/g, ' / '), id);
  const says = async () => '[' + await text('head') + '] ' + await text('res') + '   {' + await text('cue') + ' | ' + await text('b-fire') + ' | ' + await text('tally') + '}';
  const filled = async () => page.evaluate(() => [...document.querySelectorAll('#plate svg circle[fill="#F2C14E"][filter], #plate svg circle[fill="#9C7F3A"]')].length);
  const log = [];
  await shot('start', true); await shot('view-start', false);
  await page.click('#b-begin'); await page.waitForTimeout(300); await shot('a-1-ready', true); await shot('view-1-ready', false);
  if (!/fire wave 1 of 8/i.test(await text('b-fire'))) errors.push('the gold button should read Fire wave 1 of 8, reads ' + await text('b-fire'));
  if (await page.evaluate(() => document.querySelectorAll('#plate svg circle[stroke-dasharray="2.6 2.2"]').length) !== 4) errors.push('four posts should carry the broken ring of a faint record');
  const fits = await page.evaluate(() => document.getElementById('b-fire').getBoundingClientRect().bottom <= window.innerHeight);
  if (!fits) errors.push('picture, cue, dial and FIRE should fit one 380 x 760 screen');
  await page.click('#q-play'); await page.waitForTimeout(200); await shot('help', true); await page.click('#b-help-close');
  // aiming by dragging on the picture: the point straight below the quake is 0°, the right-hand end of the equator is 45°
  const box = await page.evaluate(() => { const r = document.querySelector('#plate svg').getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; });
  const toScreen = (sx, sy) => [box.x + sx / 360 * box.w, box.y + sy / 380 * box.h];
  let [mx, my] = toScreen(180 + 146, 38 + 146); await page.mouse.move(mx, my); await page.mouse.down(); await page.mouse.up();
  if (await text('dive-read') !== '45°') errors.push('dragging to the right-hand end of the equator should set a dive of 45°, reads ' + await text('dive-read'));
  [mx, my] = toScreen(180, 300); await page.mouse.move(mx, my); await page.mouse.down(); [mx, my] = toScreen(180 + 100, 38 + 100 / Math.tan(30 * Math.PI / 180)); await page.mouse.move(mx, my, { steps: 5 }); await page.mouse.up();
  if (await text('dive-read') !== '30°') errors.push('dragging should follow the finger to 30°, reads ' + await text('dive-read'));
  await shot('a-aim-drag', false);
  // stage one: eight waves into an Earth with one core, with the jump at the grazing angle
  const dives = [45, 60, 30, 10, 34, 33.5, 33.7, 26];
  for (let k = 0; k < dives.length; k++) {
    await setRange('dive', dives[k]); await page.waitForTimeout(100);
    await page.click('#b-fire'); await page.waitForTimeout(400);
    if (k === 0) await shot('a-1-travelling', false);
    if (k < dives.length - 1) { await idle(); await page.waitForTimeout(150); log.push(await says()); }
    else { await page.waitForFunction(() => window.__game().phase === 'reveal', null, { timeout: 15000 }); await page.waitForTimeout(600); await shot('a-fan-firing', false); await idle(); await page.waitForTimeout(200); log.push('[' + await text('head') + '] ' + await text('res') + '   {' + await text('tally') + '}'); }
    if (k === 0) { await shot('a-1-result', true); await shot('view-1-result', false); if (!/now choose your next dive/i.test(await text('cue')) || !/fire wave 2 of 8/i.test(await text('b-fire'))) errors.push('after a wave the cue should invite the next one, reads: ' + await text('cue') + ' | ' + await text('b-fire')); }
    if (k === 5) { await shot('a-6-graze-core', true); await shot('view-6-graze-core', false); }
    if (await hscroll()) errors.push('horizontal scroll after wave ' + (k + 1));
  }
  await shot('a-reveal', true); await shot('view-a-reveal', false);
  if (await filled() !== 14) errors.push('with one core the fan should reach 14 posts and leave the four faint ones empty, found ' + await filled());
  await page.click('#b-next'); await page.waitForTimeout(300); await shot('a-card', true);
  await page.click('#b-build'); await page.waitForTimeout(1100); await shot('b-1-ready', true); await shot('view-b-1-ready', false);
  if (!/fire wave 1 of 4/i.test(await text('b-fire'))) errors.push('stage two should open with Fire wave 1 of 4');
  // stage two: one miss, one through the inner core, one into the shadow between posts, one bounce onto a faint post
  const dives2 = [25, 10, 14, 15];
  for (let k = 0; k < dives2.length; k++) {
    await setRange('dive', dives2[k]); await page.waitForTimeout(100);
    await page.click('#b-fire'); await page.waitForTimeout(400);
    if (k < dives2.length - 1) { await idle(); await page.waitForTimeout(150); log.push(await says()); }
    else { await page.waitForTimeout(900); log.push('[' + await text('head') + '] ' + await text('res')); await shot('b-4-bounce', true); await shot('view-b-4-bounce', false); await page.waitForFunction(() => window.__game().phase === 'reveal2', null, { timeout: 15000 }); await page.waitForTimeout(700); await shot('b-fan-firing', false); await idle(); await page.waitForTimeout(900); log.push('[' + await text('head') + '] ' + await text('res') + '   {' + await text('tally') + '}'); }
    if (k === 0) await shot('b-1-miss', true);
    if (k === 2) { await shot('b-3-into-shadow', true); await shot('view-b-3-into-shadow', false); }
    if (await hscroll()) errors.push('horizontal scroll after stage-two wave ' + (k + 1));
  }
  await shot('b-reveal', true); await shot('view-b-reveal', false);
  if (await filled() !== 18) errors.push('with a core within the core the fan should reach all 18 posts, found ' + await filled());
  if (await page.evaluate(() => document.getElementById('panel-choice').classList.contains('hide'))) errors.push('the choice between the two Earths should be on screen');
  await page.click('#b-pick-two'); await page.waitForTimeout(400); await shot('end', true); await shot('view-end', false);
  log.push('VERDICT: ' + await page.evaluate(() => document.querySelector('.verdict').innerText.replace(/\n+/g, ' / ')));
  const words = await page.evaluate(() => ['v-did', 'v-paper', 'v-means'].map(id => document.getElementById(id).innerText.split(/\s+/).length));
  if (words.some(w => w > 110)) errors.push('each verdict paragraph should stay short, word counts ' + words);
  if (await hscroll()) errors.push('horizontal scroll on the end screen');
  await page.click('#b-about'); await page.waitForTimeout(200); await shot('about', true); await page.click('#b-about-close');
  // retry, and a player who never dives steeply and then chooses one core
  await page.click('#b-again'); await page.waitForTimeout(300);
  const ok = await page.evaluate(() => { const g = window.__game(); return g.phase === 'act1' && g.game.shots.length === 0 && document.getElementById('dive').value === '45' && document.querySelector('#plate svg circle[stroke-width="1"][stroke="#EEE3C8"]:not([fill="none"])').classList.contains('hide'); });
  if (!ok) errors.push('retry did not restart cleanly');
  if (await filled() !== 0) errors.push('after a retry no post should be filled');
  await shot('c-restart', true);
  for (let k = 0; k < 8; k++) { await setRange('dive', 40 + k * 3); await page.click('#b-fire'); if (k < 7) await idle(); }
  await page.waitForFunction(() => window.__game().phase === 'reveal', null, { timeout: 15000 }); await idle();
  await page.click('#b-next'); await page.waitForTimeout(200); await page.click('#b-build');
  for (let k = 0; k < 4; k++) { await setRange('dive', 20 + k * 5); await page.click('#b-fire'); if (k < 3) await idle(); }
  await page.waitForFunction(() => window.__game().phase === 'reveal2', null, { timeout: 15000 }); await idle(); await page.waitForTimeout(900);
  await page.click('#b-pick-one'); await page.waitForTimeout(300); await shot('c-end-one-core', true);
  log.push('ONE CORE VERDICT: ' + await text('v-fate') + ' / ' + await text('v-did'));
  console.log(log.join('\n'));
  console.log(errors.length ? 'ERRORS:\n' + errors.join('\n') : 'no errors; no horizontal scroll');
  await browser.close();
  process.exit(errors.length ? 1 : 0);
})();
