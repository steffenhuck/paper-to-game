// Browser session test (build step 6): drives the-light-post.html at 380 px through a whole game: seed set to 7, the ordinary
// merchant, ten rounds with a first-timer's choices (two boosters, then what the clocks taught, refusing the far ones late),
// help opened mid-round and returned from, the verdict; then the same seed as the patient merchant with the optimal plan.
// Run: node session-test.js [outdir] > session-log.txt   (needs playwright)
const { chromium } = require('playwright'); const M = require('./mechanism.js');
const D = (process.argv[2] || __dirname) + '/';
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 380, height: 760 }, deviceScaleFactor: 2 });
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + __dirname + '/the-light-post.html'); await p.waitForTimeout(300);
  const txt = sel => p.$eval(sel, e => e.innerText.replace(/\n+/g, ' / '));
  const on = id => p.$eval(id, e => e.classList.contains('on'));
  const sw = async () => { const w = await p.evaluate(() => document.documentElement.scrollWidth); if (w > 380) errs.push('horizontal scroll ' + w); return w; };
  const shot = async (n, full = true) => { await p.screenshot({ path: D + 'screenshot-' + n + '.png', fullPage: full }); console.log(`  [screenshot-${n}.png] scrollWidth ${await sw()}`); };
  const idle = async () => { await p.waitForFunction(() => document.querySelector('#b-next').style.visibility === 'visible', null, { timeout: 15000 }); };
  const decimals = async () => { const t = await p.evaluate(() => [...document.querySelectorAll('.screen.on')].map(s => s.innerText).join(' ')); const m = t.match(/\d\.\d/); if (m) errs.push('decimal on screen: ' + m[0]); };
  const setN = async n => { if (n === 0) { await p.click('#k-refuse'); return; } while (+(await txt('#k-n')) < n) await p.click('#k-plus'); while (+(await txt('#k-n')) > n) await p.click('#k-minus'); };
  const playGame = async (who, plan, tag) => {
    await p.click('[data-who="' + who + '"]'); console.log('game as', who, 'seed', await p.$eval('#seed', e => e.value));
    for (let i = 0; i < 10; i++) {
      console.log(`  round ${i + 1}: ` + await txt('#f-name') + ' | ' + await txt('#f-cust')); if (i === 0 && tag === 'first') await shot('round1-decide');
      if (i === 2 && tag === 'first') { await p.click('#s-fly [data-help]'); console.log('    help on:', await on('#s-help')); await shot('help'); await p.click('#b-help-back'); console.log('    back on round:', await on('#s-fly')); }
      await setN(plan[i]); await p.click('#b-launch'); if (i === 0 && tag === 'first') { await p.waitForTimeout(900); await shot('round1-midflight', false); }
      await idle(); await p.waitForTimeout(400); console.log('    ' + await txt('#f-stamp') + ' | ' + await txt('#f-say') + ' | wealth ' + await txt('#r-wealth')); await decimals();
      if (tag === 'first' && (i === 0 || i === 1 || i === 5 || i === 9)) await shot('round' + (i + 1) + '-flown');
      await p.click('#b-next'); await p.waitForTimeout(150);
    }
    console.log('END on:', await on('#s-end')); console.log('VERDICT: ' + await txt('#verdict')); console.log('TALLY: ' + await txt('#tally')); await decimals(); await shot('end-' + tag);
  };
  console.log('START: ' + await txt('#aim-start')); await shot('start');
  await p.fill('#seed', '7'); await p.$eval('#seed', e => e.dispatchEvent(new Event('change')));
  await p.click('#b-start'); console.log('who on:', await on('#s-who')); await shot('who');
  // a first-timer: two boosters first, then four everywhere, refuses the last two far ones
  const os = M.drawGame(7); const naive = os.map((o, i) => i === 0 ? 2 : i === 9 ? 0 : (o.d >= 30 ? 0 : 4));
  await playGame('ORDINARY', naive, 'first');
  await p.click('#b-again'); console.log('again: who on', await on('#s-who'));
  const opt = os.map(o => M.best(o, 0).n); await playGame('PATIENT', opt, 'patient-optimal');
  await p.click('#s-end [data-about]'); console.log('about on', await on('#s-about')); await shot('about'); await p.click('#b-about-back'); console.log('back on end', await on('#s-end'));
  await p.click('#b-new'); console.log('new stars: who on', await on('#s-who'), 'seed now', await p.$eval('#seed', e => e.value));
  console.log('errors', errs); await b.close(); process.exitCode = errs.length ? 1 : 0;
})();
