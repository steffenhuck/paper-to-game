// Full session in headless Chromium at phone width: the walkthrough (decline the doctor; a Battersea pair by word; a
// Battersea pair by glass; help opened and closed mid-play; the Waterloo Road crape door against its neighbour by glass;
// the doctor's second offer declined; a check of a word; a last asked pair if knocks remain; close the book; the water),
// the verdict, About; then a second morning the doctor's way (take both offers, pairs across the streets by word, the
// marsh) to its verdict. Screenshots along the way; errors and horizontal scroll are recorded in session-log.txt.
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
  const state = async () => page.evaluate(() => { const g = window.__game.state; return { knocks: g.knocks, phase: window.__game.phase, streets: g.streets.map(s => s.houses.map(h => ({ i: h.i, crape: h.crape, water: h.water, known: h.known, word: h.word }))) }; });
  const tap = async (s, i) => { await page.click(`g.house[data-s="${s}"][data-i="${i}"]`); await page.waitForTimeout(250); };
  const nb = (houses, i) => { const c = [i - 1, i + 1].filter(k => Math.floor(k / 6) === Math.floor(i / 6) && k >= 0 && k < 12 && !houses[k].crape); return c.length ? c[0] : houses.findIndex(h => !h.crape); };
  const panelFits = async () => page.evaluate(() => { const r = document.getElementById('panel').getBoundingClientRect(); return r.bottom <= window.innerHeight; });
  const pair = async (s, a, b, how, tag) => {
    await tap(s, a); if (tag) await shot(tag + '-a', false);
    await tap(s, b); if (tag) await shot(tag + '-how', false);
    log.push(`pair ${tag || ''}: ` + await txt('#panel .diff'));
    await page.click(how === 'glass' ? '#b-glass' : '#b-ask'); await page.waitForTimeout(how === 'glass' ? 2000 : 400);
    if (tag) await shot(tag + '-result', true);
    log.push('   => ' + await txt('#panel .do') + ' | ' + await txt('#wline'));
    if (await hscroll()) errors.push('horizontal scroll after pair ' + tag);
    await page.click('#b-next'); await page.waitForTimeout(400);
    if ((await state()).phase === 'offer') { log.push('   doctor again: ' + await txt('#panel .doc')); await shot('a-offer-2', true); await page.click('#b-decline'); await page.waitForTimeout(300); }
  };
  await shot('start', true);
  if (await hscroll()) errors.push('horizontal scroll on start');
  await page.click('#b-begin'); await page.waitForTimeout(500); await shot('a-offer-1', true);
  log.push('offer 1: ' + await txt('#panel .doc'));
  log.push('offer panel fits within 760: ' + await panelFits());
  await page.click('#b-decline'); await page.waitForTimeout(300); await shot('a-pick', false);
  log.push('pick panel fits within 760: ' + await panelFits());
  let st = await state(); const B = st.streets[0], Wt = st.streets[1];
  const crB = B.filter(h => h.crape).map(h => h.i), crW = Wt.filter(h => h.crape).map(h => h.i);
  await pair(0, crB[0], nb(B, crB[0]), 'ask', 'a-1');
  await page.click('#q-play'); await page.waitForTimeout(300); await shotOverlay('help', 'help'); await page.click('#b-help-close'); if (await page.evaluate(() => document.body.classList.contains('lock'))) errors.push('body still locked after help');
  await pair(0, crB[1], nb(B, crB[1]), 'glass', 'a-2');
  await pair(1, crW[0], nb(Wt, crW[0]), 'glass', 'a-3');
  st = await state();
  const wordy = st.streets[0].find(h => h.known === 'word' && h.crape) || st.streets[0].find(h => h.known === 'word');
  if (wordy && st.knocks >= 1) { await tap(0, wordy.i); await shot('a-check-how', false); log.push('check: ' + await txt('#panel .do')); await page.click('#b-check'); await page.waitForTimeout(2000); await shot('a-check-result', true); log.push('   => ' + await txt('#panel .do') + ' | ' + await txt('#wline')); await page.click('#b-next'); await page.waitForTimeout(400); if ((await state()).phase === 'offer') { await page.click('#b-decline'); await page.waitForTimeout(300); } }
  st = await state();
  if (st.knocks >= 1 && crB[2] !== undefined) await pair(0, crB[2], nb(st.streets[0], crB[2]), 'ask', 'a-4');
  st = await state();
  if (st.phase === 'pick') { await shot('a-close', false); await page.click('#b-close'); await page.waitForTimeout(400); }
  await shot('a-sentence', true);
  log.push('sentence screen: ' + await txt('#sentline'));
  await page.click('.sent[data-s="water"]'); await page.waitForTimeout(200); await page.click('#b-send'); await page.waitForTimeout(500);
  await shot('a-end', true);
  log.push('END A: ' + await txt('#verdict'));
  if (await hscroll()) errors.push('horizontal scroll at the end');
  await page.click('#b-about'); await page.waitForTimeout(300); await shotOverlay('about', 'about'); await page.click('#b-about-close');
  // the doctor's way
  await page.click('#b-again'); await page.waitForTimeout(500);
  await page.click('#b-take'); await page.waitForTimeout(300); await shot('b-taken', false);
  log.push('B after taking: ' + await txt('#dline'));
  st = await state();
  const crB2 = st.streets[0].filter(h => h.crape).map(h => h.i), liW2 = st.streets[1].filter(h => !h.crape).map(h => h.i);
  for (let k = 0; k < 8; k++) {
    st = await state(); if (st.phase === 'offer') { await page.click('#b-take'); await page.waitForTimeout(300); }
    st = await state(); if (st.knocks === 0 || st.phase !== 'pick') break;
    await tap(0, crB2[k % crB2.length]); if (await page.$('#b-asA')) { await page.click('#b-asA'); await page.waitForTimeout(200); } await tap(1, liW2[k % liW2.length]);
    if (k === 0) { await shot('b-1-how', false); }
    await page.click('#b-ask'); await page.waitForTimeout(400); if (k === 0) { await shot('b-1-result', true); log.push('B pair 1: ' + await txt('#panel .do')); }
    await page.click('#b-next'); await page.waitForTimeout(300);
  }
  st = await state(); if (st.phase === 'pick') { await page.click('#b-close'); await page.waitForTimeout(300); }
  await page.click('.sent[data-s="air"]'); await page.click('#b-send'); await page.waitForTimeout(500); await shot('b-end', true);
  log.push('END B: ' + await txt('#verdict'));
  fs.writeFileSync(path.join(__dirname, 'session-log.txt'), log.join('\n') + '\n\nERRORS: ' + (errors.length ? errors.join('\n') : 'none') + '\n');
  console.log(log.join('\n')); console.log('\nERRORS:', errors.length ? errors : 'none');
  await browser.close();
})();
