// Browser session test (build step 6): drives watsons-cardboard.html at 380 px through three whole games, one ladder each:
// game 1 a guesser (school memory for A-T, like with like for G, any short piece for the rest), with a piece taken back, help opened
// mid-ladder and returned from, the ladder pulled apart and watched, the verdict, About; game 2 a player who reads only the lengths;
// game 3 a player who reads both clues. Run: node session-test.js [outdir] > session-log.txt   (needs playwright)
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
  console.log('WELCOME: ' + await txt('#s-welcome h1')); await shot('welcome'); await p.click('#b-desk');
  console.log('DESK aim: ' + await txt('#aim-start')); await shot('start');
  const play = async (seed, choose, tag, extras) => {
    await p.fill('#seed', String(seed)); await p.click('#b-start');
    const L = M.drawGame(seed).ladder; console.log(`GAME ${seed} (${tag}): ` + await txt('#l-kick') + ' | given ' + L.map(s => s.given).join(''));
    if (extras) await shot('ladder-empty', false);
    for (let i = 0; i < L.length; i++) {
      await p.click(`#tray [data-p="${choose(L[i].given)}"]`);
      if (extras && i === 2) { await p.click('[data-un="2"]'); console.log('  took back rung 3:', await txt('#l-count')); await p.click(`#tray [data-p="${choose(L[i].given)}"]`); }
      if (extras && i === 5) { await shot('ladder-half', false); await p.click('#s-lad [data-help]'); console.log('  help on:', await on('#s-help')); await shot('help'); await p.click('#b-help-back'); console.log('  back on ladder:', await on('#s-lad')); }
    }
    await p.click('#b-zip'); if (extras) { await p.waitForTimeout(1500); await shot('ladder-zipping', false); } await p.waitForTimeout(4600);
    console.log('  ' + await txt('#r-big') + ' | ' + await txt('#r-why')); console.log('  ' + await txt('#r-chg')); await decimals(); await shot('ladder-zipped-' + tag);
    console.log('  button: ' + await txt('#b-next')); await p.click('#b-next'); console.log('  pulled apart:', await txt('#c-orient'));
    if (extras) { await p.waitForTimeout(2500); await shot('apart-filling', false); }
    await p.waitForSelector('#c-done', { state: 'visible', timeout: 15000 }); console.log('  ' + await txt('#c-big') + ' | ' + await txt('#c-why')); await shot('apart-done-' + tag);
    await p.click('#b-end'); if (extras) { await p.waitForTimeout(1200); await shot('end-twisting', false); } await p.waitForTimeout(2600);
    console.log('  END on:', await on('#s-end')); console.log('  VERDICT: ' + await txt('#verdict')); console.log('  TALLY: ' + await txt('#tally')); await decimals(); await shot('end-' + tag);
    const z = M.zip(L, L.map(s => choose(s.given))); console.log('  mechanism reads this player as: ' + M.reading(z));
  };
  const guess = g => g === 'A' ? 'T' : g === 'T' ? 'A' : g === 'G' ? 'G' : 'T';
  await play(1, guess, 'guesser', true);
  await p.click('#s-end [data-about]'); console.log('about on', await on('#s-about')); await shot('about'); await p.click('#b-about-back'); console.log('back on end', await on('#s-end'));
  await p.click('#b-new'); console.log('new game: desk on', await on('#s-start'), 'game number now', await p.$eval('#seed', e => e.value));
  await play(2, g => ({ A: 'C', G: 'T', T: 'G', C: 'A' })[g], 'lengths-only');
  await p.click('#b-new'); await play(3, g => M.partnerOf(g), 'both');
  console.log('errors', errs); await b.close(); process.exitCode = errs.length ? 1 : 0;
})();
