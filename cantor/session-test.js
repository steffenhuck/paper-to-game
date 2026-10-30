// Drives not-in-the-book.html through headless Chromium at phone width: a full session with a plausible
// strategy (round 1 by majority, round 2 anything, round 3 one slip then the rule), help opened and
// returned from mid-play, the end screen's rerun, play again; screenshots along the way; no console errors,
// no horizontal scroll. Run: node session-test.js > session-log.txt
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 380, height: 760 }, deviceScaleFactor: 2 });
  const errors = [];
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
  const url = 'file://' + path.join(__dirname, 'not-in-the-book.html') + '#4821';
  await page.goto(url); await page.waitForTimeout(400);
  const shot = async name => { await page.screenshot({ path: path.join(__dirname, `screenshot-${name}.png`), fullPage: true }); console.log('shot', name); };
  const noHScroll = async () => { const w = await page.evaluate(() => document.documentElement.scrollWidth); if (w > 380) errors.push(`horizontal scroll: ${w}`); };
  const text = async sel => (await page.textContent(sel)).replace(/\s+/g, ' ').trim();
  const G = () => page.evaluate(() => { const g = window.__game.G; return { round: g.round, r1: g.r1 && g.r1.st, r2: g.r2 && g.r2.st && { yours: g.r2.st.yours, struckTotal: g.r2.st.struckTotal, done: g.r2.st.done, page: g.r2.st.page.map(p => p.n) }, r3: g.r3 && g.r3.st && { yours: g.r3.st.yours, slipped: g.r3.st.slipped, done: g.r3.st.done, rows: g.r3.st.rows } }; });

  console.log('START:', await text('#start .aimline'));
  await shot('start'); await noHScroll();
  await page.click('[data-go="help"]'); await page.waitForTimeout(200); await shot('help');
  console.log('HELP first line:', await text('#help .aimline'));
  await page.click('#btn-help-back'); await page.waitForTimeout(200);
  console.log('back to', await page.evaluate(() => document.querySelector('.screen.on').id));

  // ---- Round 1 by the majority trick
  await page.click('#btn-start'); await page.waitForTimeout(300);
  console.log('\nROUND 1:', await text('#roundname'), '|', await text('#orient'));
  await shot('round1-start'); await noHScroll();
  for (let k = 0; k < 6; k++) {
    const s = await G(); if (s.r1 && s.r1.done) break;
    const c = await page.evaluate(() => { const g = window.__game.G; const st = Mechanism.round1Status(g.r1.rows, g.r1.yours); const alive = g.r1.rows.filter((r, i) => st.struck[i] < 0); return Mechanism.PLAYERS.majority({ yours: g.r1.yours, aliveRows: alive }); });
    await page.click('#tap-' + c); await page.waitForTimeout(450);
    console.log(`  tap ${c} ->`, await text('#count'));
    if (k === 0) await shot('round1-first-tap');
  }
  await shot('round1-done');
  console.log('  after:', await text('#after'));

  // ---- Round 2: alternate letters
  await page.click('#btn-r2'); await page.waitForTimeout(300);
  console.log('\nROUND 2:', await text('#roundname'), '|', await text('#orient'));
  await shot('round2-start'); await noHScroll();
  for (let k = 0; k < 6; k++) {
    const c = k % 2 ? 'm' : 'w';
    await page.click('#tap-' + c); await page.waitForTimeout(300);
    console.log(`  tap ${c} ->`, await text('#count'));
    if (k === 0) await shot('round2-first-tap-striking');
    await page.waitForTimeout(1100);
    console.log(`         ->`, await text('#count'));
    if (k === 2) {
      // help mid-play and back
      await page.click('#play .qbtn'); await page.waitForTimeout(150);
      console.log('  help opened mid-play:', await page.evaluate(() => document.querySelector('.screen.on').id));
      await page.click('#btn-help-back'); await page.waitForTimeout(150);
      console.log('  back to:', await page.evaluate(() => document.querySelector('.screen.on').id), '| page rows', JSON.stringify((await G()).r2.page));
    }
  }
  await shot('round2-done');
  console.log('  after:', await text('#after'));
  await page.click('#btn-bargain'); await page.waitForTimeout(300);
  await shot('bargain'); await noHScroll();

  // ---- Round 3: slip on row 2, then the rule
  await page.click('#btn-r3'); await page.waitForTimeout(300);
  console.log('\nROUND 3:', await text('#roundname'), '|', await text('#orient'));
  console.log('  count:', await text('#count'));
  await shot('round3-start'); await noHScroll();
  for (let u = 0; u < 10; u++) {
    const line = await page.evaluate(u => window.__game.G.r3.st.rows[u][u], u);
    const c = u === 1 ? line : Mechanism_flip(line);
    await page.click('#tap-' + c); await page.waitForTimeout(450);
    console.log(`  row ${u + 1}: line ${line}, tap ${c} ->`, await text('#count'));
    if (u === 1) await shot('round3-slipped');
    if (u === 4) await shot('round3-midway');
  }
  await shot('round3-done');
  console.log('  state:', JSON.stringify((await G()).r3.slipped));
  await page.click('#btn-end'); await page.waitForTimeout(300);
  console.log('\nEND:', await text('#verdict-1'));
  console.log('     ', await text('#verdict-2'));
  await shot('end-top'); await noHScroll();
  await page.click('#btn-rerun'); await page.waitForTimeout(5200);
  console.log('  last try:', await text('#lasttry-result'));
  await shot('end-rerun');
  await page.click('#end [data-go="about"]'); await page.waitForTimeout(200); await shot('about'); await noHScroll();
  await page.click('#btn-about-back'); await page.waitForTimeout(200);

  // ---- play again: a new book; a clean round 3 straight away (skip quickly through 1 and 2)
  const oldSeed = await page.evaluate(() => window.__game.seed);
  await page.click('#btn-again'); await page.waitForTimeout(300);
  const newSeed = await page.evaluate(() => window.__game.seed);
  console.log(`\nPLAY AGAIN: seed ${oldSeed} -> ${newSeed}; screen ${await page.evaluate(() => document.querySelector('.screen.on').id)}; round ${(await G()).round}`);
  // round 1 by always-m (loses: row 1 is all m)
  for (let k = 0; k < 6; k++) { await page.click('#tap-m'); await page.waitForTimeout(350); }
  console.log('  round 1 by all-m:', await text('#count'));
  await shot('round1-caught');
  await page.click('#btn-r2'); await page.waitForTimeout(300);
  for (let k = 0; k < 6; k++) { await page.click('#tap-m'); await page.waitForTimeout(1500); }
  await page.click('#btn-bargain'); await page.waitForTimeout(200); await page.click('#btn-r3'); await page.waitForTimeout(300);
  for (let u = 0; u < 10; u++) { const line = await page.evaluate(u => window.__game.G.r3.st.rows[u][u], u); await page.click('#tap-' + Mechanism_flip(line)); await page.waitForTimeout(350); }
  console.log('  round 3 clean:', await text('#count'));
  await page.click('#btn-end'); await page.waitForTimeout(300);
  console.log('  END:', await text('#verdict-1'));
  console.log('  note:', await text('#verdict-3'));
  await shot('end-clean-after-r1-loss');

  console.log('\nerrors:', errors.length ? errors : 'none');
  await browser.close();
  process.exit(errors.length ? 1 : 0);
})();
function Mechanism_flip(c) { return c === 'm' ? 'w' : 'm'; }
