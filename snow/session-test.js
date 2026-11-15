// Full session in headless Chromium at phone width: a stranger's game (an inland crape door, a riverside house, help
// opened and closed, then a crape door in a middle street and its neighbours until the doctor concedes, one more glass
// after the concession, the sentence), the verdict, About; then a second map tested the doctor's way to the cap and
// written as the water (a right guess without identification). Screenshots along the way; errors and horizontal scroll
// are recorded in session-log.txt.
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
  const st = async () => page.evaluate(() => { const g = window.__game.state; return { used: g.used, tests: g.tests, concededAt: g.concededAt, rows: g.rows.map(hs => hs.map(h => ({ r: h.r, i: h.i, crape: h.crape, water: h.water, tested: h.tested }))) }; });
  const side = (r) => ['river', 'river', 'middle', 'middle', 'inland', 'inland'][r];
  const btnFits = async () => page.evaluate(() => { const b = document.querySelector('#panel .btn'); if (!b) return true; const r = b.getBoundingClientRect(); const m = document.querySelector('#mapbox svg').getBoundingClientRect(); return r.bottom <= window.innerHeight && m.top >= 0 && m.top + 200 <= window.innerHeight; });
  const testHouse = async (r, i, tag) => {
    await page.click(`g.house[data-r="${r}"][data-i="${i}"]`); await page.waitForTimeout(250);
    if (tag) { await shot(tag + '-drawn', false); log.push(tag + ': drops button within 760: ' + await btnFits()); }
    await page.click('#b-drops'); await page.waitForTimeout(1950);
    if (tag) await shot(tag + '-result', true);
    const s = await st();
    log.push(`glass ${s.used} (${['Waterloo', 'Lambeth Ch', 'Trinity', 'Borough', 'Kennington', 'Clapham'][r]} no. ${i + 1}): ` + await txt('#panel .say') + ' | ' + await txt('#wline') + ' | ' + await txt('#dline'));
    if (await hscroll()) errors.push('horizontal scroll after glass ' + s.used);
    return s;
  };
  await shot('start', true); if (await hscroll()) errors.push('horizontal scroll on start');
  await page.click('#b-begin'); await page.waitForTimeout(500); await shot('a-map', false);
  log.push('map: ' + await txt('#dline'));
  let s = await st(); const all = [].concat(...s.rows);
  const ic = all.find(h => h.crape && side(h.r) === 'inland');
  await testHouse(ic.r, ic.i, 'a-1'); await page.click('#b-next'); await page.waitForTimeout(300);
  await testHouse(0, 2, 'a-2'); await page.click('#b-next'); await page.waitForTimeout(300);
  await page.click('#q-play'); await page.waitForTimeout(300); await shotOverlay('help', 'help'); await page.click('#b-help-close'); if (await page.evaluate(() => document.body.classList.contains('lock'))) errors.push('body still locked after help');
  // anchor and hunt in the middle streets
  const mc = all.filter(h => h.crape && side(h.r) === 'middle');
  let conceded = false, n = 3;
  for (const anchor of mc) {
    s = await testHouse(anchor.r, anchor.i, 'a-' + n); n++;
    if (s.concededAt) { conceded = true; break; }
    await page.click('#b-next'); await page.waitForTimeout(300);
    const others = s.rows[anchor.r].filter(h => !h.crape && !h.tested).sort((a, b) => Math.abs(a.i - anchor.i) - Math.abs(b.i - anchor.i));
    for (const o of others) { s = await testHouse(o.r, o.i, 'a-' + n); n++; if (s.concededAt) { conceded = true; break; } if (s.tests === 0) break; await page.click('#b-next'); await page.waitForTimeout(300); }
    if (conceded || s.tests === 0) break;
  }
  if (conceded) { await shot('a-conceded', true); log.push('CONCEDED: ' + await txt('#panel'));
    await page.click('#b-next'); await page.waitForTimeout(300); await shot('a-after', false); log.push('after concession, pick panel: ' + await txt('#panel .do'));
    const left = (await st()).rows.flat().find(h => !h.tested); await testHouse(left.r, left.i, null); await page.click('#b-write'); await page.waitForTimeout(400); }
  else { await page.click('#b-write'); await page.waitForTimeout(400); }
  await shot('a-sentence', true); log.push('sentence: ' + await txt('#sentline') + ' | ' + await txt('#sentdoc'));
  await page.click('.sent[data-s="water"]'); await page.waitForTimeout(200); await page.click('#b-send'); await page.waitForTimeout(500);
  await shot('a-end', true); log.push('END A: ' + await txt('#verdict'));
  if (await hscroll()) errors.push('horizontal scroll at the end');
  await page.click('#b-about'); await page.waitForTimeout(300); await shotOverlay('about', 'about'); await page.click('#b-about-close');
  // the doctor's way, to the cap, then a right guess
  await page.click('#b-again'); await page.waitForTimeout(500);
  s = await st(); const all2 = [].concat(...s.rows);
  const inl = all2.filter(h => side(h.r) === 'inland' && h.crape), riv = all2.filter(h => side(h.r) === 'river' && !h.crape);
  for (let k = 0; k < 10; k++) { const h = k % 2 === 0 ? inl[Math.floor(k / 2) % inl.length] : riv[Math.floor(k / 2) % riv.length]; s = await st(); if (s.tests === 0 || s.concededAt) break; if ((s.rows[h.r][h.i]).tested) { const alt = s.rows.flat().find(x => !x.tested); await testHouse(alt.r, alt.i, null); } else await testHouse(h.r, h.i, k === 5 ? 'b-6' : null); s = await st(); if (s.tests > 0 && !s.concededAt) { await page.click('#b-next'); await page.waitForTimeout(250); } }
  await page.click('#b-write'); await page.waitForTimeout(400);
  await page.click('.sent[data-s="water"]'); await page.click('#b-send'); await page.waitForTimeout(500); await shot('b-end', true);
  log.push('END B: ' + await txt('#verdict'));
  fs.writeFileSync(path.join(__dirname, 'session-log.txt'), log.join('\n') + '\n\nERRORS: ' + (errors.length ? errors.join('\n') : 'none') + '\n');
  console.log(log.join('\n')); console.log('\nERRORS:', errors.length ? errors : 'none');
  await browser.close();
})();
