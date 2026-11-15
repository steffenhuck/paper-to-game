// Full session in headless Chromium at phone width: the walkthrough (two inland crape doors, a riverside house, help
// opened and closed mid-play, a middle-street crape house and its neighbour, the rest of that street), the sentence,
// the verdict, About; then a second map tested inland only and written as the air, to its verdict. Screenshots along
// the way; errors and horizontal scroll are recorded in session-log.txt.
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 380, height: 760 }, deviceScaleFactor: 1 });
  const errors = []; page.on('pageerror', e => errors.push(e.message)); page.on('console', m => { if (m.type() === 'error' && m.text().indexOf('Failed to load resource') < 0) errors.push(m.text()); }); // the counter script cannot load offline
  const seedArg = Number(process.argv[2] || 7);
  const url = 'file://' + path.resolve(__dirname, 'snows-cloudy-glass.html') + '#v=' + seedArg;
  await page.goto(url); await page.waitForTimeout(900);
  const shot = async (n, full) => page.screenshot({ path: path.join(__dirname, 'screenshot-' + n + '.png'), fullPage: !!full });
  const shotOverlay = async (id, n) => { await page.evaluate(id => { const o = document.getElementById(id); o.style.position = 'absolute'; o.style.inset = 'auto'; o.style.top = '0'; o.style.left = '0'; o.style.right = '0'; document.querySelector('body > .wrap').style.visibility = 'hidden'; }, id); await page.evaluate(() => window.scrollTo(0, 0)); await shot(n, true); await page.evaluate(id => { const o = document.getElementById(id); o.style.position = ''; o.style.inset = ''; o.style.top = ''; o.style.left = ''; o.style.right = ''; document.querySelector('body > .wrap').style.visibility = ''; }, id); };
  const hscroll = async () => page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
  const log = [];
  const txt = async (sel) => page.evaluate(sel => (document.querySelector(sel) || { innerText: '' }).innerText.replace(/\n+/g, ' / '), sel);
  const rows = async () => page.evaluate(() => window.__game.state.rows.map(hs => hs.map(h => ({ r: h.r, i: h.i, crape: h.crape, water: h.water, tested: h.tested }))));
  const side = async (r) => page.evaluate(r => window.SNOW.CONFIG.ROWS[r].side, r);
  const panelFits = async () => page.evaluate(() => { const b = document.querySelector('#panel .btn') || document.getElementById('panel'); const r = b.getBoundingClientRect(); return r.bottom <= window.innerHeight; });
  let n = 0;
  const testHouse = async (r, i, tag) => {
    await page.click(`g.house[data-r="${r}"][data-i="${i}"]`); await page.waitForTimeout(250);
    if (tag) { await shot(tag + '-drawn', false); log.push(tag + ' drawn panel fits within 760: ' + await panelFits()); }
    await page.click('#b-drops'); await page.waitForTimeout(1950); n++;
    if (tag) await shot(tag + '-result', true);
    log.push(`test ${n} (row ${r}, no. ${i + 1}): ` + await txt('#panel .say') + ' | ' + await txt('#wline') + ' | ' + await txt('#dline'));
    if (await hscroll()) errors.push('horizontal scroll after test ' + n);
    await page.click('#b-next'); await page.waitForTimeout(350);
  };
  await shot('start', true); if (await hscroll()) errors.push('horizontal scroll on start');
  await page.click('#b-begin'); await page.waitForTimeout(500); await shot('a-map', false);
  log.push('map: ' + await txt('#dline') + ' | pick panel fits: ' + await panelFits());
  let R = await rows(); const all = [].concat(...R);
  const inlandCrape = []; for (const h of all) if (h.crape && (await side(h.r)) === 'inland') inlandCrape.push(h);
  await testHouse(inlandCrape[0].r, inlandCrape[0].i, 'a-1');
  if (inlandCrape[1]) await testHouse(inlandCrape[1].r, inlandCrape[1].i, 'a-2');
  await testHouse(0, 2, 'a-3');
  await page.click('#q-play'); await page.waitForTimeout(300); await shotOverlay('help', 'help'); await page.click('#b-help-close'); if (await page.evaluate(() => document.body.classList.contains('lock'))) errors.push('body still locked after help');
  const midCrape = []; for (const h of all) if (h.crape && (await side(h.r)) === 'middle') midCrape.push(h);
  let other = 2;
  if (midCrape.length) { const h = midCrape[0]; await testHouse(h.r, h.i, 'a-4'); await testHouse(h.r, h.i > 0 ? h.i - 1 : h.i + 1, 'a-5'); other = h.r === 2 ? 3 : 2; }
  R = await rows();
  for (let i = 0; i < 6; i++) { const left = await page.evaluate(() => window.__game.state.tests); if (left === 0) break; if (!R[other][i].tested) await testHouse(other, i, left === 1 ? 'a-last' : null); }
  await shot('a-sentence', true); log.push('sentence: ' + await txt('#sentline') + ' | ' + await txt('#sentdoc'));
  await page.click('.sent[data-s="water"]'); await page.waitForTimeout(200); await page.click('#b-send'); await page.waitForTimeout(500);
  await shot('a-end', true); log.push('END A: ' + await txt('#verdict'));
  if (await hscroll()) errors.push('horizontal scroll at the end');
  await page.click('#b-about'); await page.waitForTimeout(300); await shotOverlay('about', 'about'); await page.click('#b-about-close');
  // the doctor's way: inland only
  await page.click('#b-again'); await page.waitForTimeout(500); n = 0;
  R = await rows(); const inl = [];
  for (const h of [].concat(...R)) if ((await side(h.r)) === 'inland') inl.push(h);
  for (let k = 0; k < 8; k++) await testHouse(inl[k].r, inl[k].i, k === 3 ? 'b-4' : null);
  await page.click('.sent[data-s="air"]'); await page.click('#b-send'); await page.waitForTimeout(500); await shot('b-end', true);
  log.push('END B: ' + await txt('#verdict'));
  fs.writeFileSync(path.join(__dirname, 'session-log.txt'), log.join('\n') + '\n\nERRORS: ' + (errors.length ? errors.join('\n') : 'none') + '\n');
  console.log(log.join('\n')); console.log('\nERRORS:', errors.length ? errors : 'none');
  await browser.close();
})();
