// Full session in headless Chromium at phone width (build.md §4.6), revision 1: the best play (naked eye, physics, shape,
// shape) with the third answer; every scene screenshotted at five ring positions on the way (0, 25, 50, 75, 100 %);
// What that means opened after each send; help opened and closed mid-round; a real drag on the ring with a snap; then
// the reductionist (always the physics, second answer) and the player who stays at the naked eye (first answer); a
// laptop window last. Errors and horizontal scroll go to session-log.txt.
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 380, height: 760 }, deviceScaleFactor: 1 });
  const errors = [], log = [];
  page.on('pageerror', e => errors.push(e.message)); page.on('console', m => { if (m.type() === 'error' && m.text().indexOf('Failed to load resource') < 0) errors.push(m.text()); });
  await page.goto('file://' + path.resolve(__dirname, 'nagels-camera.html')); await page.waitForTimeout(600);
  const shot = (n, full) => page.screenshot({ path: path.join(__dirname, 'screenshot-' + n + '.png'), fullPage: !!full });
  const hscroll = async (where) => { if (await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1)) errors.push('horizontal scroll at ' + where); };
  const fits = async (where) => { const b = await page.evaluate(() => document.getElementById('b-send').getBoundingClientRect().bottom); log.push(where + ': Send bottom at ' + Math.round(b) + ' px (within 700: ' + (b <= 700) + ')'); if (b > 700) errors.push('Send below 700 px at ' + where); };
  const now = () => page.$eval('#now', e => e.textContent);
  const plan = [0, 2, 1], ids = ['sunset', 'lightning', 'red'];

  await shot('start', true); await hscroll('start');
  await page.click('#b-start'); await page.waitForTimeout(400);
  for (let k = 0; k < 3; k++) {
    await hscroll('round ' + (k + 1)); await fits('round ' + (k + 1));
    log.push('round ' + (k + 1) + ': ' + await now() + ' | ask: ' + await page.$eval('#ask', e => e.textContent) + ' | reach: ' + await page.$$eval('#ring .reach', es => es.map(e => e.className).join(',')));
    for (const z of [0, 0.25, 0.5, 0.75, 1]) { await page.evaluate(z => window.__api.setZ(z), z); await page.waitForTimeout(120); await shot('a-' + (k + 1) + '-' + ids[k] + '-' + Math.round(z * 100)); log.push('  z=' + z + ': tag=' + await page.$eval('#tag', e => e.textContent) + ' · ' + await page.$eval('#needs', e => e.textContent)); }
    if (k === 0) { // a real drag on the ring, released at 38 %, which must snap to the middle detent
      const rc = await page.$eval('#ring', e => { const r = e.getBoundingClientRect(); return { x: r.left, y: r.top + r.height / 2, w: r.width }; });
      await page.mouse.move(rc.x + rc.w * 0.1, rc.y); await page.mouse.down(); await page.mouse.move(rc.x + rc.w * 0.3, rc.y, { steps: 6 }); await page.mouse.move(rc.x + rc.w * (0.06 + 0.88 * 0.38), rc.y, { steps: 6 }); await page.mouse.up(); await page.waitForTimeout(400);
      const z = await page.evaluate(() => window.__game.z); log.push('  drag released at 38 %: ring settled at z=' + z); if (Math.abs(z - 0.5) > 0.001) errors.push('ring did not snap to the middle detent (z=' + z + ')');
      await page.click('#stops span[data-i="0"]'); await page.waitForTimeout(400); log.push('  tap "Naked eye": z=' + await page.evaluate(() => window.__game.z));
      await page.mouse.click(rc.x + rc.w * 0.5, rc.y); await page.waitForTimeout(80); const zMid = await page.evaluate(() => window.__game.z); await page.waitForTimeout(500); const zEnd = await page.evaluate(() => window.__game.z);
      log.push('  tap at the middle: z after 80 ms = ' + zMid.toFixed(2) + ' (gliding), settled at ' + zEnd); if (Math.abs(zEnd - 0.5) > 0.001) errors.push('tap did not settle at the middle detent'); if (zMid >= 0.5) errors.push('tap jumped instead of gliding');
      await page.click('#stops span[data-i="0"]'); await page.waitForTimeout(400);
    }
    if (k === 2) { await page.click('.help-btn'); await page.waitForTimeout(300); await shot('help', true); await page.click('#help [data-close]'); await page.waitForTimeout(200); log.push('  help opened and closed mid-round; z still ' + await page.evaluate(() => window.__game.z)); }
    await page.evaluate(i => window.__api.setStop(i), plan[k]); await page.waitForTimeout(150);
    await page.click('#b-send'); await page.waitForTimeout(500); await shot('a-' + (k + 1) + '-' + ids[k] + '-developing');
    await page.waitForTimeout(2600); await shot('a-' + (k + 1) + '-' + ids[k] + '-sent', true);
    log.push('  SENT stop ' + plan[k] + ': ' + await page.$eval('#line', e => e.textContent)); log.push('  now: ' + await now() + ' | icon: ' + await page.$eval('#thingbox svg', e => e.getAttribute('class')) + ' ' + await page.$eval('#thingcap', e => e.textContent));
    const nb = await page.evaluate(() => document.getElementById('b-next').getBoundingClientRect().bottom); log.push('  Next bottom at ' + Math.round(nb) + ' px');
    await page.click('#b-means'); await page.waitForTimeout(300); await shot('a-' + (k + 1) + '-' + ids[k] + '-means', true);
    log.push('  MEANS: ' + await page.$eval('#mtitle', e => e.textContent) + ' | ' + await page.$eval('#mleft', e => e.textContent) + ' | ' + await page.$eval('#mwhy', e => e.textContent) + ' | ' + await page.$eval('#mreply', e => e.textContent));
    await page.click('#means [data-close]'); await page.waitForTimeout(200);
    await page.click('#b-next'); await page.waitForTimeout(400);
  }
  await hscroll('turn'); await shot('a-turn', true); log.push('turn: ' + await page.$eval('#turn .now', e => e.textContent));
  await page.click('#b-night'); await page.waitForTimeout(400);
  const picks = [['colour', 'warm', 'sea', 'moths'], ['crack', 'bang', 'rain', 'flinch', 'petrichor'], ['shapes', 'smell', 'rustle', 'bees']];
  for (let n = 0; n < 3; n++) {
    await hscroll('night ' + (n + 1)); await shot('n-' + (n + 1) + '-empty');
    const bb = await page.evaluate(() => document.getElementById('b-bat').getBoundingClientRect().bottom); log.push('night ' + (n + 1) + ': ' + await page.$eval('#nightnow', e => e.textContent) + ' | That\u2019s my bat bottom at ' + Math.round(bb) + ' px'); if (bb > 760) errors.push('That\u2019s my bat below 760 px on night ' + (n + 1));
    for (const p of picks[n]) { await page.click('#tray button[data-piece="' + p + '"]'); await page.waitForTimeout(120); }
    await shot('n-' + (n + 1) + '-built'); log.push('  chosen: ' + await page.evaluate(() => window.__game.chosen.join(',')));
    await page.click('#b-bat'); await page.waitForTimeout(600); await shot('n-' + (n + 1) + '-settling'); await page.waitForTimeout(2400); await shot('n-' + (n + 1) + '-graded', true);
    log.push('  GRADED: ' + await page.$eval('#nightline', e => e.textContent)); log.push('  grades: ' + await page.$$eval('#grades .g', es => es.map(e => e.textContent.slice(0, 60)).join(' / ')));
    await page.click('#b-nightnext'); await page.waitForTimeout(400);
  }
  await hscroll('end'); await shot('a-end-1', true);
  await page.click('#steps .w[data-win="0"]').catch(() => {});
  log.push('END: ' + await page.$eval('#ehead', e => e.textContent) + ' | ' + await page.$eval('#eopening', e => e.textContent));
  for (let i = 2; i <= 5; i++) { await page.click('#b-goon'); await page.waitForTimeout(500); if (i === 3 || i === 5) await shot('a-end-' + i, true); }
  log.push('steps shown: ' + await page.$$eval('#steps .step', es => es.length) + '; Go on hidden: ' + await page.$eval('#goon', e => e.style.display === 'none') + '; readings: ' + await page.$$eval('#steps .step:last-child p b', es => es.length));
  await page.click('#steps .w[data-win="0"]'); await page.waitForTimeout(300); await shot('a-window-panel', true); log.push('window panel: ' + await page.$eval('#etitle', e => e.textContent) + ' | ' + await page.$eval('#eline', e => e.textContent)); await page.click('#evidence [data-close]'); await page.waitForTimeout(200);
  await page.click('#steps .mini[data-ev="2"]'); await page.waitForTimeout(300); log.push('end print tapped: ' + await page.$eval('#etitle', e => e.textContent)); await page.click('#evidence [data-close]'); await page.waitForTimeout(200);
  await page.click('#b-further'); await page.waitForTimeout(300); await shot('a-end-further', true);
  await page.click('#end [data-open="about"]'); await page.waitForTimeout(300); await shot('about', true); await page.click('#about [data-close]'); await page.waitForTimeout(200);
  // session B: the reductionist
  await page.click('#b-again'); await page.waitForTimeout(300);
  for (let k = 0; k < 3; k++) { await page.evaluate(() => window.__api.setStop(2)); await page.waitForTimeout(100); await page.click('#b-send'); await page.waitForTimeout(3000); if (k === 2) await shot('b-3-red-physics-sent', true); log.push('B round ' + (k + 1) + ' physics: ' + await page.$eval('#line', e => e.textContent)); await page.click('#b-next'); await page.waitForTimeout(300); }
  await page.click('#b-night'); await page.waitForTimeout(300);
  for (let n = 0; n < 3; n++) { await page.$$eval('#tray button', bs => bs.forEach(b => b.click())); await page.waitForTimeout(150); await page.click('#b-bat'); await page.waitForTimeout(2900); log.push('B night ' + (n + 1) + ' all pieces: ' + await page.$eval('#nightline', e => e.textContent)); await page.click('#b-nightnext'); await page.waitForTimeout(300); }

  for (let i = 2; i <= 5; i++) { await page.click('#b-goon'); await page.waitForTimeout(150); } await shot('b-end', true); log.push('B END: ' + await page.$eval('#eopening', e => e.textContent));
  // session C: the naked eye throughout
  await page.click('#b-again'); await page.waitForTimeout(300);
  for (let k = 0; k < 3; k++) { await page.click('#b-send'); await page.waitForTimeout(3000); if (k === 1) await shot('c-' + (k + 1) + '-' + ids[k] + '-eye-sent', true); log.push('C round ' + (k + 1) + ' naked eye: ' + await page.$eval('#line', e => e.textContent)); await page.click('#b-next'); await page.waitForTimeout(300); }
  await page.click('#b-night'); await page.waitForTimeout(300);
  for (let n = 0; n < 3; n++) { await page.click('#b-bat'); await page.waitForTimeout(2900); log.push('C night ' + (n + 1) + ' no pieces: ' + await page.$eval('#nightline', e => e.textContent)); await page.click('#b-nightnext'); await page.waitForTimeout(300); }

  for (let i = 2; i <= 5; i++) { await page.click('#b-goon'); await page.waitForTimeout(150); } await shot('c-end', true); log.push('C END: ' + await page.$eval('#eopening', e => e.textContent));
  await page.setViewportSize({ width: 1280, height: 720 }); await page.click('#b-again'); await page.waitForTimeout(300); await page.evaluate(() => window.__api.setZ(0.5)); await page.waitForTimeout(120); await shot('laptop-round1'); await hscroll('laptop');
  log.push('errors: ' + (errors.length ? errors.join(' | ') : 'none'));
  fs.writeFileSync(path.join(__dirname, 'session-log.txt'), log.join('\n') + '\n');
  console.log(log.join('\n'));
  await browser.close();
  process.exit(errors.length ? 1 : 0);
})();
