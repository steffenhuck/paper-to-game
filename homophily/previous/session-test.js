// Browser session test (build step 6): drives one-of-us.html at 380 px through a full session, the help page mid-play, and a retry.
// Run: node session-test.js [outdir]  (needs playwright)
const { chromium } = require('playwright');
const D = (process.argv[2] || __dirname) + '/';
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 380, height: 760 }, deviceScaleFactor: 2 });
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + __dirname + '/one-of-us.html');
  const txt = sel => p.$eval(sel, e => e.innerText);
  const on = id => p.$eval(id, e => e.classList.contains('on'));
  const sw = () => p.evaluate(() => document.documentElement.scrollWidth);
  await p.screenshot({ path: D + 'screenshot-start.png', fullPage: true });
  await p.click('#b-start'); await p.waitForTimeout(300);
  await p.screenshot({ path: D + 'screenshot-case.png', fullPage: true });
  for (let k = 0; k < 4; k++) {
    await p.waitForSelector('#tests .tbtn'); await p.waitForTimeout(150);
    console.log(`\n${await txt('#case-t')} | ${(await txt('#case-head')).replace(/\n+/g, ' / ')}`);
    const alive = new Set(['quality', 'lenient', 'info', 'favour']);
    for (const t of ['proposal', 'judge', 'spread']) {
      await p.click(`.tbtn[data-t=${t}]`); await p.waitForTimeout(250);
      const r = await txt('#res-' + t); console.log('  ' + r.replace(/\n+/g, ' | '));
      const gone = /^.*\n?Gone/m.test(r) || r.includes('Gone:');
      if (t === 'proposal') { if (gone) { alive.clear(); alive.add('quality'); } else alive.delete('quality'); }
      if (t === 'judge') { if (gone) { alive.clear(); alive.add('lenient'); } else alive.delete('lenient'); }
      if (t === 'spread') { if (r.includes('Both ends')) { alive.clear(); alive.add('info'); } else if (r.includes('No difference')) { alive.clear(); alive.add('quality'); } else alive.delete('info'); }
      if (k === 0 && t === 'proposal') { await p.click(`[data-x=quality]`); await p.screenshot({ path: D + 'screenshot-case-test.png', fullPage: true });
        await p.click('#b-q'); console.log('  help on:', await on('#s-help')); await p.click('#b-help-back'); console.log('  back on case:', await on('#s-case'), '| results kept:', await p.$$eval('.res', x => x.length)); }
      if (k === 3) await p.screenshot({ path: D + `screenshot-erc-${t}.png`, fullPage: true });
      if (alive.size === 1) break;
    }
    if (k === 0) { const guess = 'favour'; await p.click(`[data-a=${guess}]`); }   // first-timer accuses too early on case 1
    else await p.click(`[data-a=${[...alive][0]}]`);
    await p.waitForTimeout(250);
    console.log('  VERDICT: ' + (await txt('#case-verdict')).replace(/\n+/g, ' | '));
    await p.screenshot({ path: D + `screenshot-verdict-${k + 1}.png`, fullPage: true });
    console.log('  scrollWidth', await sw());
    await p.click('#b-next'); await p.waitForTimeout(300);
  }
  console.log('bet on:', await on('#s-bet')); await p.screenshot({ path: D + 'screenshot-bet.png', fullPage: true });
  await p.click('[data-o=five]'); await p.waitForTimeout(400);
  console.log('BET: ' + (await txt('#bet-res')).replace(/\n+/g, ' | '));
  await p.screenshot({ path: D + 'screenshot-bet-reveal.png', fullPage: true });
  await p.click('#b-end'); console.log('VERDICT:\n' + await txt('#verdict') + '\n' + await txt('#elog'));
  await p.screenshot({ path: D + 'screenshot-end.png', fullPage: true }); console.log('scrollWidth end', await sw());
  await p.click('#b-about2'); console.log('about on', await on('#s-about')); await p.screenshot({ path: D + 'screenshot-about.png', fullPage: true }); await p.click('#b-about-back'); console.log('back on end', await on('#s-end'));
  // retry
  await p.click('#b-again'); await p.waitForTimeout(300); console.log('retry:', await txt('#case-t'), '|', (await txt('#case-head')).split('\n')[0]);
  await p.click('.tbtn[data-t=spread]'); await p.waitForTimeout(200); console.log('retry spread: ' + (await txt('#res-spread')).split('\n')[1]);
  await p.click('#b-q'); await p.click('#b-help-back');
  await p.screenshot({ path: D + 'screenshot-help-return.png', fullPage: false });
  for (const id of ['s-help', 's-about', 's-start']) { await p.evaluate(i => { document.querySelectorAll('.screen').forEach(s => s.classList.toggle('on', s.id === i)); }, id); console.log(id, 'scrollWidth', await sw()); if (id === 's-help') await p.screenshot({ path: D + 'screenshot-help.png', fullPage: true }); }
  console.log('errors', errs); await b.close();
})();
