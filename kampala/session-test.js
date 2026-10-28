// Browser session test (build step 6): drives the-mixed-street.html at 380 px through a full session and a retry.
// Run: node session-test.js [outdir]  (needs playwright)
const { chromium } = require('playwright');
const D = (process.argv[2] || require('os').tmpdir()) + '/';
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 380, height: 760 }, deviceScaleFactor: 2 });
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + __dirname + '/the-mixed-street.html');
  const txt = id => p.$eval(id, e => e.innerText);
  const on = id => p.$eval(id, e => e.classList.contains('on'));
  await p.screenshot({ path: D + 'screenshot-start.png', fullPage: true });
  await p.click('#b-start');
  await p.screenshot({ path: D + 'screenshot-lab.png', fullPage: true });
  // first session: a plausible first-timer, seen before hidden, help opened mid-play
  const plan = [['dgSeen', 'yes'], ['pd', 'yes'], ['survey', 'no'], ['network', 'yes'], ['puzzle', 'yes']];
  for (let i = 0; i < plan.length; i++) {
    await p.click(`[data-test=${plan[i][0]}]`);
    if (i === 0) { await p.screenshot({ path: D + 'screenshot-bet.png', fullPage: true }); await p.click('#s-test button.q'); console.log('help on:', await on('#s-help')); await p.click('#b-help-back'); console.log('back on test:', await on('#s-test')); }
    await p.click(`#s-test [data-bet=${plan[i][1]}]`); await p.waitForTimeout(1300);
    console.log(`${plan[i][0]}: ${await txt('#t-hit')} | ${await txt('#t-say')}`);
    if (i === 0) await p.screenshot({ path: D + 'screenshot-result.png', fullPage: true });
    if (i === 2) await p.screenshot({ path: D + 'screenshot-survey.png', fullPage: true });
    await p.click('#b-back');
  }
  console.log('budget:', await txt('#budget'), '| disabled cards:', await p.$$eval('.tcard:disabled', x => x.length));
  await p.click('#b-tocall');
  for (const [s, v] of [['tastes', 'not'], ['kind', 'guilty'], ['team', 'cant'], ['find', 'guilty'], ['watched', 'cant']]) await p.click(`[data-s=${s}][data-v=${v}]`);
  await p.screenshot({ path: D + 'screenshot-calls.png', fullPage: true });
  await p.click('#b-reveal');
  console.log('VERDICT 1:\n' + await txt('#verdict'));
  console.log(await txt('#judged'));
  await p.screenshot({ path: D + 'screenshot-end-first.png', fullPage: true });
  console.log('scrollWidth', await p.evaluate(() => document.documentElement.scrollWidth));
  // retry: the paper's route
  await p.click('#b-again');
  for (const [id, bet] of [['dgHidden', 'yes'], ['dgSeen', 'yes'], ['survey', 'no'], ['puzzle', 'no'], ['network', 'yes']]) {
    await p.click(`[data-test=${id}]`); await p.click(`#s-test [data-bet=${bet}]`); await p.waitForTimeout(300); await p.click('#b-back');
  }
  await p.click('#b-tocall');
  for (const [s, v] of [['tastes', 'not'], ['kind', 'not'], ['team', 'not'], ['find', 'guilty'], ['watched', 'guilty']]) await p.click(`[data-s=${s}][data-v=${v}]`);
  await p.click('#b-reveal');
  console.log('VERDICT 2:', (await txt('#verdict')).split('\n')[0]);
  await p.screenshot({ path: D + 'screenshot-end.png', fullPage: true });
  await p.click('#b-about2'); console.log('about on', await on('#s-about')); await p.click('#b-about-back'); console.log('back on end', await on('#s-end'));
  for (const id of ['s-help', 's-about']) { await p.evaluate(i => { document.querySelectorAll('.screen').forEach(s => s.classList.toggle('on', s.id === i)); }, id); console.log(id, 'scrollWidth', await p.evaluate(() => document.documentElement.scrollWidth)); }
  console.log('errors', errs); await b.close();
})();
