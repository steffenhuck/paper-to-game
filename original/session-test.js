// Browser session test (build step 6): drives the-original-or-the-copy.html at 380 px through a full session and a retry.
// Run: node session-test.js [outdir]  (needs playwright)
const { chromium } = require('playwright');
const D = (process.argv[2] || require('os').tmpdir()) + '/';
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 380, height: 760 }, deviceScaleFactor: 2 });
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + __dirname + '/the-original-or-the-copy.html');
  const txt = s => p.$eval(s, e => e.innerText);
  const on = id => p.$eval(id, e => e.classList.contains('on'));
  const sw = () => p.evaluate(() => document.documentElement.scrollWidth);
  await p.screenshot({ path: D + 'screenshot-start.png', fullPage: true });
  await p.click('#b-start');
  // first-timer: "hit hard = fight", but suspects Switzerland
  const bets = { AT: 1, GR: 1, PL: 0, DE: 1, CH: 1, IE: 0, HU: 1, NL: 0 };
  for (const [c, v] of Object.entries(bets)) await p.click(`.seg[data-c=${c}] button[data-v="${v}"]`);
  await p.screenshot({ path: D + 'screenshot-bets.png', fullPage: true });
  await p.click('#s-act1 button.q'); console.log('help on:', await on('#s-help')); await p.click('#b-help-back'); console.log('back on act1:', await on('#s-act1'));
  await p.click('#b-reveal'); await p.waitForTimeout(1500);
  console.log('ACT1:', (await txt('#a1-sum')).split('\n').slice(0, 3).join(' | '));
  await p.screenshot({ path: D + 'screenshot-reveal.png', fullPage: true });
  console.log('scrollWidth act1', await sw());
  await p.click('#b-reveal');
  const plays = [[2, 0], [0, 0], [1, 2]];
  for (let i = 0; i < 3; i++) {
    const [t, l] = plays[i];
    if (i === 2) { console.log('camp3 "Same" disabled:', await p.$eval('#d-talk button[data-i="0"]', e => e.disabled)); }
    if (i === 1) { console.log('camp2 lean "Hold" disabled:', await p.$eval('#d-lean button[data-i="1"]', e => e.disabled)); }
    await p.click(`#d-talk button[data-i="${t}"]`);
    if (i !== 1) await p.click(`#d-lean button[data-i="${l}"]`);
    if (i === 0) await p.screenshot({ path: D + 'screenshot-campaign.png', fullPage: true });
    await p.click('#b-run'); await p.waitForTimeout(1900);
    console.log(`camp${i + 1}:`, await txt('#r-verdict'), '|', await txt('#r-av'), '|', (await txt('#r-say')).slice(0, 80));
    if (i === 0) await p.screenshot({ path: D + 'screenshot-result.png', fullPage: true });
    if (i === 2) await p.screenshot({ path: D + 'screenshot-result3.png', fullPage: true });
    await p.click('#b-next');
  }
  console.log('VERDICT:\n' + await txt('#verdict'));
  await p.screenshot({ path: D + 'screenshot-end.png', fullPage: true });
  console.log('scrollWidth end', await sw());
  await p.click('#b-about2'); console.log('about on', await on('#s-about')); console.log('scrollWidth about', await sw());
  await p.screenshot({ path: D + 'screenshot-about.png', fullPage: true });
  await p.click('#b-about-back'); console.log('back on end', await on('#s-end'));
  // retry: never copy
  await p.click('#b-again'); await p.click('#b-start');
  for (const c of Object.keys(bets)) await p.click(`.seg[data-c=${c}] button[data-v="${['AT','DE','HU','CH','NL','PL'].includes(c) ? 1 : 0}"]`);
  await p.click('#b-reveal'); await p.waitForTimeout(300); console.log('retry act1:', (await txt('#a1-sum')).split('\n')[1]); await p.click('#b-reveal');
  for (const [t, l] of [[0, 1], [0, 0], [2, 2]]) { await p.click(`#d-talk button[data-i="${t}"]`); if (!(await p.$eval(`#d-lean button[data-i="${l}"]`, e => e.disabled))) await p.click(`#d-lean button[data-i="${l}"]`); await p.click('#b-run'); await p.waitForTimeout(1700); await p.click('#b-next'); }
  console.log('VERDICT 2:', (await txt('#verdict')).split('\n')[0]);
  await p.screenshot({ path: D + 'screenshot-end-retry.png', fullPage: true });
  for (const id of ['s-help', 's-camp', 's-res']) { await p.evaluate(i => { document.querySelectorAll('.screen').forEach(s => s.classList.toggle('on', s.id === i)); }, id); console.log(id, 'scrollWidth', await sw()); }
  await p.evaluate(() => { document.querySelectorAll('.screen').forEach(s => s.classList.toggle('on', s.id === 's-help')); }); await p.screenshot({ path: D + 'screenshot-help.png', fullPage: true });
  console.log('errors', errs); await b.close();
})();
