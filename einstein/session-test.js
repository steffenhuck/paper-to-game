// Browser session test (build step 6): drives the-light-post.html at 380 px through a full session:
// the test range (two boosters first, a slide to four previewed, then three, five, four launched), help opened mid-range and returned from, a first-timer's order
// book (spread evenly), the verdict, a new order book played well, the long haul, About.
// Run: node session-test.js [outdir] > session-log.txt   (needs playwright)
const { chromium } = require('playwright');
const D = (process.argv[2] || __dirname) + '/';
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 380, height: 760 }, deviceScaleFactor: 2 });
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + __dirname + '/the-light-post.html'); await p.waitForTimeout(300);
  const txt = sel => p.$eval(sel, e => e.innerText.replace(/\n+/g, ' / '));
  const on = id => p.$eval(id, e => e.classList.contains('on'));
  const sw = async () => { const w = await p.evaluate(() => document.documentElement.scrollWidth); if (w > 380) errs.push('horizontal scroll ' + w); return w; };
  const shot = async (n, full = true) => { await p.screenshot({ path: D + 'screenshot-' + n + '.png', fullPage: full }); console.log(`  [screenshot-${n}.png] scrollWidth ${await sw()}`); };
  const idle = async () => { await p.waitForFunction(() => !document.querySelector('#f-stamp').innerHTML === false, null, { timeout: 15000 }); await p.waitForTimeout(150); };
  const decimals = async () => { const t = await p.evaluate(() => [...document.querySelectorAll('.screen.on')].map(s => s.innerText).join(' ')); const m = t.match(/\d\.\d/); if (m) errs.push('decimal on screen: ' + m[0]); };
  console.log('START: ' + await txt('#aim-start')); await shot('start');
  await p.click('#b-start'); console.log('range on:', await on('#s-fly'), '|', await txt('#f-orient')); await shot('range-empty');
  // first launch at the suggested two boosters
  await p.click('#b-launch'); await p.waitForTimeout(700); await shot('range-midflight', false); await idle();
  console.log('LAUNCH 2: ' + await txt('#f-stamp') + ' | ' + await txt('#f-say') + ' | home ' + await txt('#rd-home') + ' | flowers ' + await txt('#rd-fl')); await decimals(); await shot('range-2');
  await p.click('#s-fly [data-help]'); console.log('  help on:', await on('#s-help')); await shot('help'); await p.click('#b-help-back'); console.log('  back on range:', await on('#s-fly'), '| stamp kept:', await txt('#f-stamp'));
  const slide = async n => { await p.$eval('#k-range', (e, v) => { e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); }, String(n)); await p.waitForTimeout(150); };
  await slide(4); console.log('  preview at 4: till ' + await txt('#till') + ' | home ' + await txt('#rd-home') + ' | flowers ' + await txt('#rd-fl')); await decimals(); await shot('range-preview-4'); await slide(2);
  for (const n of [3, 5, 4]) { await slide(n);
    await p.click('#b-launch'); await p.waitForTimeout(300); await idle(); console.log(`LAUNCH ${n}: ` + await txt('#f-stamp') + ' | ' + await txt('#f-say')); await decimals(); }
  await shot('range-log');
  console.log('LOG: ' + await txt('#log'));
  await p.click('#b-tobook'); console.log('who on:', await on('#s-who')); await shot('who'); await p.click('[data-who="ORDINARY"]'); console.log('book on:', await on('#s-book'), '|', await txt('#bk-title')); await shot('book-empty');
  // a first-timer spreads boosters fairly evenly: 3 each, two left over
  const set = async alloc => { for (let i = 0; i < alloc.length; i++) for (let k = 0; k < alloc[i]; k++) await p.click(`#cards .key[data-i="${i}"][data-d="1"]`); };
  await set([3, 3, 3, 3]); await decimals(); await shot('book-set');
  await p.click('#b-log'); console.log('  log page on:', await on('#s-log')); await p.click('#b-log-back'); console.log('  back on book:', await on('#s-book'));
  await p.click('#b-launchall');
  for (let i = 0; i < 4; i++) { await idle(); console.log(`  rocket ${i + 1}: ` + await txt('#f-name') + ' | ' + await txt('#f-stamp') + ' | ' + await txt('#f-say')); if (i === 1) await shot('flight-olten'); await p.click('#b-nextrocket'); await p.waitForTimeout(200); }
  console.log('END on:', await on('#s-end')); console.log('VERDICT: ' + await txt('#verdict')); console.log('TALLY: ' + await txt('#tally')); await decimals(); await shot('end-first');
  // the patient merchant, played well: 2-4-5-6
  await p.click('#b-again'); await p.click('[data-who="PATIENT"]'); console.log('patient book:', await txt('#bk-orient')); await set([2, 4, 5, 6]); await shot('book-patient-set');
  await p.click('#b-launchall');
  for (let i = 0; i < 4; i++) { await idle(); console.log(`  rocket ${i + 1}: ` + await txt('#f-name') + ' | ' + await txt('#f-stamp') + ' | ' + await txt('#f-say')); if (i === 1) await shot('flight-refused'); if (i === 3) await shot('flight-zug'); await p.click('#b-nextrocket'); await p.waitForTimeout(200); }
  console.log('VERDICT PATIENT: ' + await txt('#verdict')); await shot('end');
  // the merchant with a loan, flying the patient merchant's plan: the far fees are worth nothing today
  await p.click('#b-again'); await p.click('[data-who="BORROWER"]'); await set([2, 4, 5, 6]); await p.click('#b-launchall');
  for (let i = 0; i < 4; i++) { await idle(); await p.click('#b-nextrocket'); await p.waitForTimeout(200); }
  console.log('VERDICT BORROWER (patient\'s plan): ' + await txt('#verdict')); await decimals(); await shot('end-borrower');
  // the long haul: five first, then six
  await p.click('#b-haul'); await set([5]); await shot('haul-set'); await p.click('#b-launchall'); await idle(); console.log('HAUL 5: ' + await txt('#f-stamp') + ' | ' + await txt('#f-say'));
  await p.click('#b-nextrocket'); console.log('HAUL END: ' + await txt('#haulverdict'));
  await p.click('#b-haulagain'); await set([6]); await p.click('#b-launchall'); await idle(); console.log('HAUL 6: ' + await txt('#f-stamp') + ' | ' + await txt('#f-say')); await shot('haul-flight');
  await p.click('#b-nextrocket'); console.log('HAUL END: ' + await txt('#haulverdict')); await decimals(); await shot('haul-end');
  await p.click('#s-haulend [data-about]'); console.log('about on', await on('#s-about')); await shot('about'); await p.click('#b-about-back'); console.log('back on haul end', await on('#s-haulend'));
  console.log('errors', errs); await b.close(); process.exitCode = errs.length ? 1 : 0;
})();
