// Browser session test (build step 6): drives say-it-plainly.html at 380 px through a full session and a retry.
// Run: node session-test.js [outdir]  (needs playwright)
const { chromium } = require('playwright');
const D = (process.argv[2] || __dirname) + '/';
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 380, height: 760 }, deviceScaleFactor: 2 });
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + __dirname + '/say-it-plainly.html');
  const txt = id => p.$eval(id, e => e.innerText);
  const on = id => p.$eval(id, e => e.classList.contains('on'));
  const sw = () => p.evaluate(() => document.documentElement.scrollWidth);
  await p.screenshot({ path: D + 'screenshot-start.png', fullPage: true });
  await p.click('#b-start');
  // guess 1: tap the ruler around 35
  const box = await p.$eval('#r1', e => { const r = e.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; });
  await p.mouse.click(box.x + box.w * (22 + 35 / 70 * 316) / 360, box.y + box.h * 0.33);
  console.log('lock enabled:', !(await p.$eval('#b-lock1', e => e.disabled)));
  await p.screenshot({ path: D + 'screenshot-bet1.png', fullPage: true });
  await p.click('#b-lock1'); await p.waitForTimeout(500);
  console.log('BET1:', await txt('#bet1-say'));
  await p.screenshot({ path: D + 'screenshot-bet1-reveal.png', fullPage: true });
  console.log('scrollWidth bet1', await sw());
  await p.click('#b-to2');
  await p.screenshot({ path: D + 'screenshot-bet2.png', fullPage: true });
  await p.click('[data-tr=easier]'); await p.waitForTimeout(3400);
  console.log('BET2:', await txt('#bet2-say'));
  await p.screenshot({ path: D + 'screenshot-bet2-reveal.png', fullPage: true });
  await p.click('#b-to-edit'); await p.waitForTimeout(300);
  console.log('start ease', await txt('#ease'));
  await p.screenshot({ path: D + 'screenshot-edit.png', fullPage: true });
  // first-timer: split the first paragraph, help mid-play, then the quote
  await p.click('.para[data-p="0"]'); await p.waitForTimeout(300);
  await p.screenshot({ path: D + 'screenshot-edit-open.png', fullPage: false });
  await p.click('#s-edit button.q'); console.log('help on:', await on('#s-help')); await p.click('#b-help-back'); console.log('back on edit:', await on('#s-edit'), '| para still open:', await p.$$eval('.opts', x => x.length));
  await p.click('.opt[data-k="0"]'); await p.waitForTimeout(1000);
  console.log('after edit 1:', await txt('#ease'), await txt('#delta'), '|', await txt('#edit-orient'));
  await p.screenshot({ path: D + 'screenshot-edit-after1.png', fullPage: false });
  await p.click('.para[data-p="3"]'); await p.waitForTimeout(300); await p.click('.opt[data-k="1"]'); await p.waitForTimeout(1000);
  console.log('after edit 2:', await txt('#ease'), await txt('#delta'), '|', await txt('#edit-orient'));
  await p.click('.para[data-p="1"]'); console.log('opts disabled when out of edits:', await p.$$eval('.opt[data-k="0"], .opt[data-k="1"]', x => x.map(e => e.disabled)));
  await p.click('.opt[data-k="close"]');
  await p.click('#b-send');
  console.log('VERDICT 1:\n' + await txt('#verdict')); console.log(await txt('#elog'));
  await p.screenshot({ path: D + 'screenshot-end-first.png', fullPage: true });
  console.log('scrollWidth end', await sw());
  // retry: the best route
  await p.click('#b-again'); console.log('retry ease', await txt('#ease'));
  await p.click('.para[data-p="3"]'); await p.click('.opt[data-k="1"]'); await p.waitForTimeout(300);
  await p.click('.para[data-p="4"]'); await p.click('.opt[data-k="0"]'); await p.waitForTimeout(1000);
  await p.screenshot({ path: D + 'screenshot-edit-best.png', fullPage: false });
  await p.click('#b-send');
  console.log('VERDICT 2:\n' + await txt('#verdict')); console.log(await txt('#elog'));
  await p.screenshot({ path: D + 'screenshot-end.png', fullPage: true });
  await p.click('#b-about2'); console.log('about on', await on('#s-about')); await p.screenshot({ path: D + 'screenshot-about.png', fullPage: true }); await p.click('#b-about-back'); console.log('back on end', await on('#s-end'));
  await p.click('#b-restart'); console.log('restart on start', await on('#s-start'));
  for (const id of ['s-help', 's-about', 's-edit']) { await p.evaluate(i => { document.querySelectorAll('.screen').forEach(s => s.classList.toggle('on', s.id === i)); }, id); console.log(id, 'scrollWidth', await sw()); }
  console.log('errors', errs); await b.close();
})();
