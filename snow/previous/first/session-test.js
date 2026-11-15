// Full session in headless Chromium at phone width: the walkthrough's strategy (crape doors first, the rest on living
// doors), help opened mid-play and closed, the fourth street with five brown marks, the verdict, About; then a second
// game knocking only at crape doors, to its verdict. Screenshots along the way; errors and horizontal scroll are
// recorded in session-log.txt.
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
  const houses = async () => page.evaluate(() => { const g = window.__game.state; const s = g.streets[g.at]; return s.houses.map(h => ({ i: h.i, crape: h.crape, tested: h.tested, water: h.water })); });
  const tap = async (i) => { await page.click(`g.house[data-i="${i}"]`); await page.waitForTimeout(250); };
  await shot('start', true);
  if (await hscroll()) errors.push('horizontal scroll on start');
  await page.click('#b-begin'); await page.waitForTimeout(500); await shot('a-1-street', false);
  if (await hscroll()) errors.push('horizontal scroll on street 1');
  const panelFits = await page.evaluate(() => { const r = document.getElementById('panel').getBoundingClientRect(); return r.bottom <= window.innerHeight; });
  log.push('street 1: panel bottom within 760 px without scrolling: ' + panelFits);
  let shotsDone = { drawn: false, milky: false, clear: false };
  for (let si = 0; si < 3; si++) {
    const hs = await houses();
    const order = hs.filter(h => h.crape).map(h => h.i).concat(hs.filter(h => !h.crape).map(h => h.i));
    let k = 0;
    for (const i of order) {
      const left = await page.evaluate(() => window.__game.state.streets[window.__game.state.at].knocksLeft); if (left === 0) break;
      if (si === 1 && k === 2) { await page.click('#q-play'); await page.waitForTimeout(300); await shotOverlay('help', 'help'); await page.click('#b-help-close'); if (await page.evaluate(() => document.body.classList.contains('lock'))) errors.push('body still locked after help'); }
      await tap(i);
      if (!shotsDone.drawn) { await shot(`a-${si + 1}-drawn`, false); shotsDone.drawn = true; }
      const say = await txt('.knockp .say');
      await page.click('#b-drops'); await page.waitForTimeout(2000);
      const res = await txt('.knockp .say');
      const w = await txt('#wline');
      log.push(`street ${si + 1} door ${i + 1} (${hs[i].crape ? 'crape' : 'no crape'}): ${say} => ${res} | ${w}`);
      const milky = res.indexOf('milky') >= 0;
      if (milky && !shotsDone.milky) { await shot(`a-${si + 1}-milky`, false); shotsDone.milky = true; }
      if (!milky && !shotsDone.clear) { await shot(`a-${si + 1}-clear`, false); shotsDone.clear = true; }
      const leftNow = await page.evaluate(() => window.__game.state.streets[window.__game.state.at].knocksLeft);
      if (leftNow === 0) { await shot(`a-${si + 1}-done`, true); await page.click('#b-next'); await page.waitForTimeout(400); break; }
      await page.click('#b-next'); await page.waitForTimeout(400);
      k++;
    }
    if (await hscroll()) errors.push('horizontal scroll on street ' + (si + 2));
    if (si < 2) await shot(`a-${si + 2}-street`, false);
  }
  await shot('a-4-books', false);
  const hs4 = await houses(); const brown = hs4.filter(h => h.water === 'brown').slice(0, 5);
  for (const h of brown) await tap(h.i);
  await shot('a-4-marked', false);
  const marked = await page.evaluate(() => window.__game.state.streets[3].houses.filter(h => h.marked).length);
  log.push('street 4: marks placed ' + marked);
  await page.click('#b-month'); await page.waitForTimeout(1400); await shot('a-4-month', true);
  log.push('street 4: ' + await txt('#panel .do'));
  await page.click('#b-verdict'); await page.waitForTimeout(500); await shot('a-end', true);
  log.push('END: ' + await txt('#verdict'));
  if (await hscroll()) errors.push('horizontal scroll at the end');
  await page.click('#b-about'); await page.waitForTimeout(300); await shotOverlay('about', 'about'); await page.click('#b-about-close');
  // a second game: crape doors only, then unused knocks on nothing is impossible (the street ends only when knocks are spent),
  // so this player spends the leftover knocks at random living doors on street one only and at crape doors elsewhere
  await page.click('#b-again'); await page.waitForTimeout(500);
  for (let si = 0; si < 3; si++) {
    const hs = await houses();
    const order = hs.filter(h => h.crape).map(h => h.i).concat(hs.filter(h => !h.crape).map(h => h.i));
    for (const i of order) { await tap(i); await page.click('#b-drops'); await page.waitForTimeout(1900); const leftNow = await page.evaluate(() => window.__game.state.streets[window.__game.state.at].knocksLeft); await page.click('#b-next'); await page.waitForTimeout(200); if (leftNow === 0) break; }
  }
  const hsB = await houses(); for (const h of hsB.filter(h => h.water === 'blue').slice(0, 5)) await tap(h.i);
  await page.click('#b-month'); await page.waitForTimeout(1200); await page.click('#b-verdict'); await page.waitForTimeout(400); await shot('b-end', true);
  log.push('END B: ' + await txt('#verdict'));
  fs.writeFileSync(path.join(__dirname, 'session-log.txt'), log.join('\n') + '\n\nERRORS: ' + (errors.length ? errors.join('\n') : 'none') + '\n');
  console.log(log.join('\n')); console.log('\nERRORS:', errors.length ? errors : 'none');
  await browser.close();
})();
