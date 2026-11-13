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
  const log = [];
  await shot('start', true); await shot('view-start', false);
  const lit = async () => page.evaluate(() => document.querySelectorAll('#plate svg circle[fill="#F2C14E"][filter]').length);
  const quiv = async () => page.evaluate(() => document.querySelectorAll('#plate svg circle[fill="#9C7F3A"]').length);
  const band = async () => page.evaluate(() => { const p = document.querySelector('#plate svg path[fill^="url(#hatch"]'); return p && !p.classList.contains('hide'); });
  // stage 0: the facts. Three real earthquakes, nothing to do but watch
  await page.click('#b-begin'); await page.waitForTimeout(300); await shot('d-1-before', false);
  if (await page.evaluate(() => !document.getElementById('panel1').classList.contains('hide'))) errors.push('no dial while the facts are shown');
  if (await band()) errors.push('the band should not be marked before the three earthquakes have been watched');
  if (await page.evaluate(() => document.querySelectorAll('#records .rrow').length) !== 3) errors.push('three rows should wait for the three earthquakes');
  for (let k = 1; k <= 3; k++) {
    if (!new RegExp('show earthquake ' + k + ' of 3', 'i').test(await text('b-next'))) errors.push('the button should offer earthquake ' + k + ', reads ' + await text('b-next'));
    if (await lit() !== (k === 1 ? 0 : 14)) errors.push('nothing should run before the button is pressed');
    await page.click('#b-next'); await page.waitForTimeout(2600);
    if (!new RegExp('earthquake ' + k + ' of 3', 'i').test(await text('aimline'))) errors.push('the top of the screen should read Earthquake ' + k + ' of 3, reads ' + await text('aimline'));
    const top = await page.evaluate(() => document.getElementById('aimline').getBoundingClientRect().top); if (top > 60) errors.push('the earthquake number should stand at the top of the screen');
    if (k === 1) await shot('d-2a-waves-running', false);
    await idle(); await page.waitForTimeout(300);
    if (k === 1) await shot('d-2b-after-first', false);
    if (await page.evaluate(() => document.querySelectorAll('#records .rrow.on').length) !== k) errors.push('row ' + k + ' should be kept after earthquake ' + k);
  }
  if (await page.evaluate(() => document.querySelectorAll('#records i.quiver').length) !== 12 || await page.evaluate(() => document.querySelectorAll('#records i.lit').length) !== 42) errors.push('each of the three rows should keep 14 lit dots and 4 quivering ones');
  await idle(); await page.waitForTimeout(800); await shot('d-3-after', true); await shot('view-d-3-after', false);
  if (await lit() !== 14 || await quiv() !== 4 || !(await band())) errors.push('after the third earthquake 14 posts are lit, 4 quiver and the band is marked: ' + [await lit(), await quiv(), await band()]);
  log.push('FACTS [' + await text('head') + '] ' + await text('res'));
  await page.click('#b-next'); await page.waitForTimeout(300); await shot('a-1-ready', true); await shot('view-1-ready', false);
  if (!/go 1 of 4/i.test(await text('b-fire'))) errors.push('the gold button should read Fire · go 1 of 4, reads ' + await text('b-fire'));
  if (await lit() !== 0 || await quiv() !== 0 || !(await band())) errors.push('stage one should start with every post dark and the band still marked');
  const fits = await page.evaluate(() => document.getElementById('b-fire').getBoundingClientRect().bottom <= window.innerHeight);
  if (!fits) errors.push('picture, cue, dial and FIRE should fit one 380 x 760 screen');
  await page.click('#q-play'); await page.waitForTimeout(200); await shot('help', true); await page.click('#b-help-close');
  // aiming by dragging on the picture: the right-hand end of the equator is 45°
  const box = await page.evaluate(() => { const r = document.querySelector('#plate svg').getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; });
  const toScreen = (sx, sy) => [box.x + sx / 360 * box.w, box.y + sy / 380 * box.h];
  let [mx, my] = toScreen(180 + 146, 38 + 146); await page.mouse.move(mx, my); await page.mouse.down(); await page.mouse.up();
  if (await text('dive-read') !== '45°') errors.push('dragging to the right-hand end of the equator should set a dive of 45°, reads ' + await text('dive-read'));
  // stage one: imagine one core. Four goes, the question, one last try
  const dives = [45, 30, 34, 33.5, 20];
  for (let k = 0; k < dives.length; k++) {
    await setRange('dive', dives[k]); await page.waitForTimeout(100);
    await page.click('#b-fire'); await page.waitForTimeout(400);
    if (k < dives.length - 1) { await idle(); await page.waitForTimeout(150); log.push(await says()); }
    else { await page.waitForFunction(() => window.__game().phase === 'reveal', null, { timeout: 15000 }); await page.waitForTimeout(900); await shot('a-fan-firing', false); await idle(); await page.waitForTimeout(200); log.push('[' + await text('head') + '] ' + await text('res')); }
    if (k === 0) { await shot('a-1-result', true); await shot('view-1-result', false); if (!/now choose your next direction/i.test(await text('cue')) || !/go 2 of 4/i.test(await text('b-fire'))) errors.push('after a go the cue should invite the next one, reads: ' + await text('cue') + ' | ' + await text('b-fire')); if (!/can you make the band quiver/i.test(await text('aimline'))) errors.push('after the first go the aim should be to make the band quiver'); }
    if (k === 3) { await shot('a-4-what-is-wrong', true); await shot('view-a-4-what-is-wrong', false); if (!/could not make the band quiver/i.test(await text('head')) || !/what is wrong/i.test(await text('cue')) || !/one last try/i.test(await text('cue')) || !/one last try/i.test(await text('b-fire'))) errors.push('after the fourth go the game should ask what is wrong and offer one last try: ' + await text('head') + ' | ' + await text('cue') + ' | ' + await text('b-fire')); }
    if (await hscroll()) errors.push('horizontal scroll after go ' + (k + 1));
  }
  await shot('a-reveal', true); await shot('view-a-reveal', false);
  if (await lit() !== 14 || await quiv() !== 0) errors.push('one core, every direction at once: 14 posts light and the band stays silent, found ' + [await lit(), await quiv()]);
  if (!/trap/i.test(await text('head'))) errors.push('the reveal should own up to the trap');
  await page.click('#b-next'); await page.waitForTimeout(300); await shot('a-card', true);
  await page.click('#b-build'); await page.waitForTimeout(1100); await shot('b-1-ready', true); await shot('view-b-1-ready', false);
  if (!/go 1 of 3/i.test(await text('b-fire'))) errors.push('stage two should open with Fire · go 1 of 3');
  // stage two: imagine a core within the core. A miss, through but outside the band, then into the band
  const dives2 = [25, 10, 14];
  for (let k = 0; k < dives2.length; k++) {
    await setRange('dive', dives2[k]); await page.waitForTimeout(100);
    await page.click('#b-fire'); await page.waitForTimeout(400);
    if (k < dives2.length - 1) { await idle(); await page.waitForTimeout(150); log.push(await says()); }
    else { await page.waitForTimeout(1200); log.push('[' + await text('head') + '] ' + await text('res')); await shot('b-3-band-quivers', true); await shot('view-b-3-band-quivers', false); if (await quiv() !== 1) errors.push('a wave in the band should make one post there quiver, found ' + await quiv()); await page.waitForFunction(() => window.__game().phase === 'reveal2', null, { timeout: 15000 }); await page.waitForTimeout(900); await shot('b-fan-firing', false); await idle(); await page.waitForTimeout(300); log.push('[' + await text('head') + '] ' + await text('res')); }
    if (k === 0) await shot('b-1-miss', true);
    if (await hscroll()) errors.push('horizontal scroll after stage-two go ' + (k + 1));
  }
  await shot('b-reveal', true); await shot('view-b-reveal', false);
  if (await lit() !== 14 || await quiv() !== 4) errors.push('a core within the core, every direction at once: 14 posts light and the band quivers, found ' + [await lit(), await quiv()]);
  if (!/verdict/i.test(await text('b-next'))) errors.push('the gold button should read See the verdict');
  await page.click('#b-next'); await page.waitForTimeout(400); await shot('end', true); await shot('view-end', false);
  log.push('VERDICT: ' + await page.evaluate(() => ['v-fate', 'v-did', 'v-paper', 'v-means'].map(id => document.getElementById(id).innerText).join(' / ')));
  const words = await page.evaluate(() => ['v-did', 'v-paper', 'v-means'].map(id => document.getElementById(id).innerText.split(/\s+/).length));
  if (words.some(w => w > 110)) errors.push('each verdict paragraph should stay short, word counts ' + words);
  if (await page.evaluate(() => document.getElementById('v-more').open)) errors.push('Read further should start closed');
  await page.click('#v-more summary'); await page.waitForTimeout(200); await shot('end-read-further', true);
  if (await page.evaluate(() => document.querySelectorAll('#v-more-body h4').length) !== 7) errors.push('Read further should hold seven notes');
  if (await hscroll()) errors.push('horizontal scroll on the end screen');
  await page.click('#b-about'); await page.waitForTimeout(200); await shot('about', true); await page.click('#b-about-close');
  // retry from the facts, and a player who never dives steeply
  await page.click('#b-again'); await page.waitForTimeout(300);
  if (await page.evaluate(() => window.__game().phase) !== 'data') errors.push('a retry should start with the facts again');
  if (await band()) errors.push('on a retry the band should be unmarked until the three earthquakes have been watched');
  for (let k = 0; k < 3; k++) { await page.click('#b-next'); await page.waitForTimeout(500); await page.waitForFunction(() => !window.__game().busy, null, { timeout: 60000 }); }
  await page.click('#b-next'); await page.waitForTimeout(300);
  if (await page.evaluate(() => !document.getElementById('records').classList.contains('hide'))) errors.push('the three rows belong to stage 0 only');
  const ok = await page.evaluate(() => { const g = window.__game(); return g.phase === 'act1' && g.game.shots.length === 0 && document.getElementById('dive').value === '45' && document.querySelector('#plate svg circle[stroke-width="1"][stroke="#EEE3C8"]:not([fill="none"])').classList.contains('hide'); });
  if (!ok || await lit() !== 0) errors.push('retry did not restart cleanly');
  await shot('c-restart', true);
  for (let k = 0; k < 5; k++) { await setRange('dive', 40 + k * 5); await page.click('#b-fire'); if (k < 4) await idle(); }
  await page.waitForFunction(() => window.__game().phase === 'reveal', null, { timeout: 15000 }); await idle();
  await page.click('#b-next'); await page.waitForTimeout(200); await page.click('#b-build');
  for (let k = 0; k < 3; k++) { await setRange('dive', 20 + k * 5); await page.click('#b-fire'); if (k < 2) await idle(); }
  await page.waitForFunction(() => window.__game().phase === 'reveal2', null, { timeout: 15000 }); await idle(); await page.waitForTimeout(300);
  await page.click('#b-next'); await page.waitForTimeout(300); await shot('c-end-never-steep', true);
  log.push('NEVER STEEP: ' + await text('v-fate') + ' / ' + await text('v-did'));
  console.log(log.join('\n'));
  console.log(errors.length ? 'ERRORS:\n' + errors.join('\n') : 'no errors; no horizontal scroll');
  await browser.close();
  process.exit(errors.length ? 1 : 0);
})();
