// Browser session test (build step 6): drives watsons-cardboard.html at 380 px through three whole games, two ladders each: game 1 a learner who guesses on ladder 1 and follows the rule on ladder 2;
// game 1 a guesser (school memory for A-T, like with like for G, any short piece for the rest), with a piece taken back, help opened
// mid-ladder and returned from, the score screen, About; game 2 a player who reads only the lengths;
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
  const play = async (seed, chooses, tag, extras) => {
    await p.fill('#seed', String(seed)); await p.click('#b-start');
    const G = M.drawGame(seed);
    for (let li = 0; li < G.ladders.length; li++) {
      const L = G.ladders[li], choose = chooses[li]; console.log(`GAME ${seed} (${tag}) ` + await txt('#l-kick') + ' | given ' + L.map(s => s.given).join('') + ' | ' + await txt('#l-orient'));
      if (extras && li === 0) await shot('ladder-empty', false);
      for (let i = 0; i < L.length; i++) {
        await p.click(`#tray [data-p="${choose(L[i].given)}"]`);
        if (extras && li === 0 && i === 2) { await p.click('[data-un="2"]'); console.log('  took back rung 3:', await txt('#l-count')); await p.click(`#tray [data-p="${choose(L[i].given)}"]`); }
        if (extras && li === 0 && i === 5) { await p.click('#s-lad [data-help]'); console.log('  help on:', await on('#s-help')); await shot('help'); await p.click('#b-help-back'); console.log('  back on ladder:', await on('#s-lad')); }
      }
      await p.click('#b-zip'); await p.waitForTimeout(4800);
      console.log('  ' + await txt('#l-count') + ' | ' + await txt('#l-say') + ' | button: ' + await txt('#b-next')); await decimals(); await shot(`ladder${li + 1}-zipped-` + tag);
      await p.click('#b-next');
    }
    if (extras) { await p.waitForTimeout(500); await shot('end-twisting', false); } await p.waitForTimeout(2600);
    console.log('  END on:', await on('#s-end'));
    console.log('  SCORE: ' + await txt('#sc-num') + '/100 | ' + await txt('#sc-rounds'));
    console.log('  VERDICT: ' + await txt('#verdict') + ' | ' + await txt('#r-chg') + ' | ' + await txt('#v-copy') + ' | ' + await txt('#v-paper'));
    console.log('  TALLY: ' + await txt('#tally')); await decimals(); await shot('end-' + tag);
  };
  const guess = g => g === 'A' ? 'T' : g === 'T' ? 'A' : g === 'G' ? 'G' : 'T';
  await play(1, [guess, g => M.partnerOf(g)], 'learner', true);
  await p.click('#s-end [data-about]'); console.log('about on', await on('#s-about')); await shot('about'); await p.click('#b-about-back'); console.log('back on end', await on('#s-end'));
  await p.click('#b-new'); console.log('play again: ladder on', await on('#s-lad'), 'game number now', await p.$eval('#seed', e => e.value)); await p.click('#s-lad [data-help]'); await p.click('#b-help-back'); await p.evaluate(() => { document.querySelector('#s-lad').classList.remove('on'); document.querySelector('#s-start').classList.add('on'); });
  const len = g => ({ A: 'C', G: 'T', T: 'G', C: 'A' })[g]; await play(2, [len, len], 'lengths-only');
  await p.click('#b-new'); await p.evaluate(() => { document.querySelector('#s-lad').classList.remove('on'); document.querySelector('#s-start').classList.add('on'); }); await play(3, [g => M.partnerOf(g), g => M.partnerOf(g)], 'both');
  console.log('errors', errs); await b.close(); process.exitCode = errs.length ? 1 : 0;
})();
