// Browser session test (build step 6): drives the-wall-in-the-head.html at 380 px through a full session.
// Run: node session-test.js [outdir]  (needs playwright)
const { chromium } = require('playwright');
const D = (process.argv[2] || require('os').tmpdir()) + '/';
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 380, height: 760 }, deviceScaleFactor: 2 });
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + __dirname + '/the-wall-in-the-head.html');
  const t0 = Date.now();
  const txt = id => p.$eval(id, e => e.innerText);
  const on = id => p.$eval(id, e => e.classList.contains('on'));
  await p.screenshot({ path: D + 'screenshot-start.png', fullPage: true });
  await p.click('#b-start');
  await p.click('[data-bet=less]'); await p.waitForTimeout(2100);
  console.log('BET:', await txt('#bet-head'));
  await p.screenshot({ path: D + 'screenshot-bet.png', fullPage: true });
  await p.click('#b-to-play');
  const plan = [['income'], ['panel', 'cohort'], ['before'], ['movers', 'ballot'], ['ballot'], ['beliefs']]; // objection 4 is lost on purpose
  for (let i = 0; i < plan.length; i++) {
    console.log(`\nOBJ ${i + 1}: ${await txt('#say')}`);
    if (i === 1) { await p.click('#s-play button.q'); console.log('  help on:', await on('#s-help')); await p.click('#b-help-back'); console.log('  back to play:', await on('#s-play'), '| cards visible:', await p.$eval('#pick', e => e.style.display !== 'none')); }
    for (const c of plan[i]) {
      await p.click(`[data-card=${c}]`); await p.waitForTimeout(500);
      console.log(`  ${c}: ${await txt('#yard')} — ${await txt('#reply')}`);
      if (i === 1 && c === 'cohort') await p.screenshot({ path: D + 'screenshot-cohort.png', fullPage: true });
      if (i === 3 && c === 'ballot') await p.screenshot({ path: D + 'screenshot-lost.png', fullPage: true });
      
      await p.click('#b-next');
    }
  }
  console.log('\nforecast on:', await on('#s-fore'));
  await p.$eval('#year', e => { e.value = 2050; e.dispatchEvent(new Event('input')); });
  await p.click('#b-lock'); console.log('FORECAST:', await txt('#fore-head'));
  await p.screenshot({ path: D + 'screenshot-forecast.png', fullPage: true });
  await p.click('#b-end');
  console.log('VERDICT:\n' + await txt('#verdict'));
  await p.screenshot({ path: D + 'screenshot-end.png', fullPage: true });
  console.log('scrollWidth', await p.evaluate(() => document.documentElement.scrollWidth), '; machine seconds', Math.round((Date.now() - t0) / 1000));
  // retry
  await p.click('#b-again'); console.log('retry: bet screen on', await on('#s-bet'), '| buttons visible', await p.$eval('#bet-btns', e => e.style.display !== 'none'));
  await p.click('[data-bet=more]'); await p.waitForTimeout(300); await p.click('#b-to-play');
  console.log('retry: objection 1 pips reset', await p.$eval('#pips', e => e.querySelectorAll('.first,.later').length === 0));
  await p.click('#b-about1').catch(() => {}); // not on this screen; about is reached from start/end
  console.log('errors', errs); await b.close();
})();
