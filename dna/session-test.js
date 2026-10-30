// Browser session test (build step 6): drives watsons-cardboard.html at 380 px through a whole game: game number 1,
// ladder 1 built one try at a time by a reasoner (A G T C in order, remembering what fit; a width fault rules out the ring class),
// ladder 2 as the model on the desk: zipped as found, then mended with the rule, help opened mid-copy and returned from, the copy with
// one missed rung and one slip, the copies copied again, the verdict,
// About; then a new game. Run: node session-test.js [outdir] > session-log.txt   (needs playwright)
const { chromium } = require('playwright'); const M = require('./mechanism.js');
const D = (process.argv[2] || __dirname) + '/';
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 380, height: 760 }, deviceScaleFactor: 2 });
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + __dirname + '/watsons-cardboard.html'); await p.waitForTimeout(300);
  const txt = sel => p.$eval(sel, e => e.innerText.replace(/\n+/g, ' / '));
  const on = id => p.$eval(id, e => e.classList.contains('on'));
  const sw = async () => { const w = await p.evaluate(() => document.documentElement.scrollWidth); if (w > 380) errs.push('horizontal scroll ' + w); return w; };
  const shot = async (n, full = true) => { await p.screenshot({ path: D + 'screenshot-' + n + '.png', fullPage: full }); console.log(`  [screenshot-${n}.png] scrollWidth ${await sw()}`); };
  const decimals = async () => { const t = await p.evaluate(() => [...document.querySelectorAll('.screen.on')].filter(s => s.id !== 's-about').map(s => s.innerText).join(' ')); const m = t.match(/\d\.\d/); if (m) errs.push('decimal on screen: ' + m[0]); };
  console.log('START aim: ' + await txt('#aim-start')); await shot('start');
  await p.click('#b-start'); console.log('ladder on:', await on('#s-lad'), '|', await txt('#l-kick'));
  await shot('l1-empty');
  const g = M.drawGame(1);
  // ladder one, one try at a time: a reasoner who tries A G T C in order against each new letter, remembering what fit
  const known = {}, ruled = {};
  for (let i = 0; i < g.ladder1.length; i++) {
    const gv = g.ladder1[i].given;
    if (known[gv]) { await p.click(`#tray [data-p="${known[gv]}"]`); await p.waitForTimeout(250); continue; }
    for (const y of ['A', 'G', 'T', 'C']) {
      if ((ruled[gv] || {})[y]) continue;
      const dis = await p.$eval(`#tray [data-p="${y}"]`, e => e.disabled); if (dis) continue;
      await p.click(`#tray [data-p="${y}"]`);
      if (M.fit(gv, y).held) { known[gv] = y; known[y] = gv; await p.waitForTimeout(250); break; }
      if (i === 0) { await p.waitForTimeout(300); await shot('l1-fail', false); }
      await p.waitForTimeout(1300); (ruled[gv] = ruled[gv] || {})[y] = true;
    }
  }
  console.log('  ladder 1 built:', await txt('#l-count'), '| zip enabled:', !(await p.$eval('#b-zip', e => e.disabled)));
  await shot('l1-built');
  await p.click('#b-zip'); await p.waitForTimeout(1400); await shot('l1-zipping', false); await p.waitForTimeout(2600);
  console.log('  ' + await txt('#r-big') + ' | ' + await txt('#r-why') + ' | ' + await txt('#r-chg')); await decimals(); await shot('l1-zipped');
  await p.click('#b-next'); console.log('ladder 2:', await txt('#l-kick'), '|', await txt('#l-orient')); await shot('l2-desk');
  // the model on the desk: zip it as found
  await p.click('#b-zip'); await p.waitForTimeout(5200);
  console.log('  as found: ' + await txt('#r-big') + ' | ' + await txt('#r-why') + ' | ' + await txt('#r-chg')); await decimals(); await shot('l2-asfound');
  await p.click('#b-mend'); console.log('  mending:', await txt('#l-orient'));
  const z0 = M.zip(g.ladder2, g.prefill);
  for (let i = 0; i < z0.rungs.length; i++) { if (z0.rungs[i].fit.held) continue; await p.click(`[data-swap="${i}"]`); await p.click(`#tray [data-p="${M.partnerOf(g.ladder2[i].given)}"]`); }
  await shot('l2-mended-pinned'); await p.click('#b-zip'); await p.waitForTimeout(5200);
  console.log('  mended: ' + await txt('#r-big') + ' | ' + await txt('#r-why') + ' | ' + await txt('#r-chg')); await decimals(); await shot('l2-zipped');
  await p.click('#b-next'); console.log('copy on:', await on('#s-copy')); await shot('copy-ready');
  await p.click('#b-go');
  const full = M.complete(g.ladder2), spots = M.copySpots(full);
  for (let k = 0; k < spots.length; k++) {
    const s = spots[k];
    if (s.rung === 6) { if (s.copy === 0) { console.log('  waiting out rung 7'); await p.waitForTimeout(M.copyMs(6) + 300); } continue; }
    if (k === 6) { await p.click('#s-copy [data-help]'); console.log('  help on:', await on('#s-help')); await p.waitForTimeout(1500); await p.click('#b-help-back'); console.log('  back on copy:', await on('#s-copy')); await shot('copy-mid', false); }
    let key = M.partnerOf(s.template); if (k === 17) key = key === 'A' ? 'G' : 'A';
    await p.click(`#keys [data-k="${key}"]`); await p.waitForTimeout(250);
  }
  await p.waitForTimeout(600); console.log('  ' + await txt('#c-big') + ' | ' + await txt('#c-why')); await decimals(); await shot('copy-done');
  await p.click('#b-again'); await p.waitForTimeout(300); console.log('  grandchildren: ' + await txt('#g-big') + ' | ' + await txt('#g-why')); await decimals(); await shot('grandchildren');
  await p.click('#b-end'); await p.waitForTimeout(1300); await shot('end-twisting', false); await p.waitForTimeout(2000);
  console.log('END on:', await on('#s-end')); console.log('VERDICT: ' + await txt('#verdict')); console.log('TALLY: ' + await txt('#tally')); await decimals(); await shot('end');
  await p.click('#s-end [data-about]'); console.log('about on', await on('#s-about')); await shot('about'); await p.click('#b-about-back'); console.log('back on end', await on('#s-end'));
  await p.click('#s-end [data-help]'); await shot('help'); await p.click('#b-help-back');
  await p.click('#b-new'); console.log('new game: start on', await on('#s-start'), 'game number now', await p.$eval('#seed', e => e.value));
  await p.click('#b-start'); console.log('  new ladder 1 given:', await p.evaluate(() => window.__OC.state().ladders[0].map(s => s.given).join(' ')));
  console.log('errors', errs); await b.close(); process.exitCode = errs.length ? 1 : 0;
})();
