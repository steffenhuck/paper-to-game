// Browser session test (build step 6): drives the-honest-billboard.html at 380 px through a full session.
// Run: node session-test.js [outdir]  (needs playwright)
const { chromium } = require('playwright');
const D = (process.argv[2] || __dirname) + '/';
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 380, height: 760 }, deviceScaleFactor: 2 });
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + __dirname + '/the-honest-billboard.html');
  const txt = id => p.$eval(id, e => e.innerText);
  const on = id => p.$eval(id, e => e.classList.contains('on'));
  const sw = async tag => { const w = await p.evaluate(() => document.documentElement.scrollWidth); if (w > 380) errs.push(`horizontal scroll ${w}px at ${tag}`); };
  await p.screenshot({ path: D + 'screenshot-start.png', fullPage: true }); await sw('start');
  await p.click('#b-start'); await p.screenshot({ path: D + 'screenshot-brief.png', fullPage: true }); await sw('brief');
  await p.click('#b-to-pick');
  console.log('put disabled with 0:', await p.$eval('#b-put', e => e.disabled));
  for (const id of ['italy', 'uk', 'income', 'income', 'reach']) await p.click(`[data-board=${id}]`); // income toggled on and off
  console.log('count:', await txt('#pick-count'), '| put enabled:', !(await p.$eval('#b-put', e => e.disabled)));
  await p.screenshot({ path: D + 'screenshot-pick.png', fullPage: true }); await sw('pick');
  // help mid-play
  await p.click('#s-pick button.q'); console.log('help on:', await on('#s-help')); await p.click('#b-help-back');
  console.log('back on pick:', await on('#s-pick'), '| selection kept:', await p.$$eval('.board.sel', e => e.length));
  await p.click('#b-put');
  for (let i = 0; i < 3; i++) {
    console.log(`\nREVEAL ${await txt('#rev-head')}: ${await txt('#rev-fact')}`);
    await p.click('#b-flip'); await p.waitForTimeout(1300);
    console.log('  ', await txt('#rev-net'), '|', (await txt('#n-warn')), (await txt('#n-knew')), (await txt('#n-back')));
    if (i === 0) await p.screenshot({ path: D + 'screenshot-reveal-italy.png', fullPage: true });
    if (i === 2) { console.log('  SCORE:', (await txt('#rev-score')).replace(/\n/g, ' ')); await p.screenshot({ path: D + 'screenshot-reveal-road.png', fullPage: true }); }
    await sw('reveal' + i);
    await p.click('#b-next');
  }
  console.log('\ncampaign 2 on pick:', await on('#s-pick'), '| head:', await txt('#pick-head'), '| badges:', await p.$$eval('.badge', e => e.map(x => x.innerText).join(' ')));
  await p.screenshot({ path: D + 'screenshot-pick2.png', fullPage: true });
  for (const id of ['reach', 'asylum', 'pirates']) await p.click(`[data-board=${id}]`);
  await p.click('#b-put');
  for (let i = 0; i < 3; i++) {
    await p.click('#b-flip'); await p.waitForTimeout(1300);
    console.log(`REVEAL2 ${await txt('#rev-tag')}: ${await txt('#rev-net')}`);
    if (i === 1) await p.screenshot({ path: D + 'screenshot-reveal-asylum.png', fullPage: true });
    if (i === 2) console.log('  SCORE:', (await txt('#rev-score')).replace(/\n/g, ' '), '| next:', await txt('#b-next'));
    await p.click('#b-next');
  }
  console.log('\nVERDICT:\n' + await txt('#verdict'));
  await p.screenshot({ path: D + 'screenshot-end.png', fullPage: true }); await sw('end');
  await p.click('#b-about2'); await p.screenshot({ path: D + 'screenshot-about.png', fullPage: true }); await p.click('#b-about-back');
  console.log('back on end:', await on('#s-end'));
  // retry: perfect first campaign skips campaign 2
  await p.click('#b-again'); await p.click('#b-to-pick');
  console.log('retry: no badges', (await p.$$('.badge')).length === 0);
  for (const id of ['reach', 'asylum', 'pirates']) await p.click(`[data-board=${id}]`);
  await p.click('#b-put'); for (let i = 0; i < 3; i++) { await p.click('#b-flip'); if (i < 2) await p.click('#b-next'); }
  console.log('perfect first campaign → button:', await txt('#b-next')); await p.click('#b-next');
  console.log('end on:', await on('#s-end'), '|', (await txt('#verdict')).split('\n')[0]);
  console.log('errors', errs); await b.close();
})();
