// Browser session test (build step 6): drives on-the-record.html at 380 px through a full session.
// Run: node session-test.js [outdir]  (needs playwright)
const { chromium } = require('playwright');
const D = (process.argv[2] || __dirname) + '/';
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 380, height: 760 }, deviceScaleFactor: 2 });
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + __dirname + '/on-the-record.html'); await p.waitForTimeout(300);
  const txt = s => p.$eval(s, e => e.innerText.replace(/\s+/g, ' ').trim());
  const on = id => p.$eval(id, e => e.classList.contains('on'));
  const sw = async tag => { const w = await p.evaluate(() => document.documentElement.scrollWidth); if (w > 380) errs.push(`horizontal scroll ${w}px at ${tag}`); };
  const shot = async name => { await p.waitForTimeout(250); await p.screenshot({ path: D + `screenshot-${name}.png`, fullPage: true }); await sw(name); };
  await shot('start');
  await p.click('#b-start'); await shot('brief');
  await p.click('#b-day1'); await shot('day1');
  // a day: want 'imm' (with an answer kind) or 'other'
  async function day(want, kind, tag) {
    const forced = (await txt('#pick-lead')).startsWith('Every');
    if (want === 'imm' || forced) {
      await p.click('#questions .bub.imm'); if (tag) await shot(tag + '-answers');
      await p.click(`#answers .bub.${kind || 'oppose'}`);
    } else await p.click('#questions .bub:not(.imm)');
    await p.waitForTimeout(550);
    const line = `${await txt('#dayname')} | ${await txt('#hl')} | ${await txt('#note')}`;
    console.log(line);
    if (tag) await shot(tag);
    await p.click('#b-next');
  }
  // quiet year: the first-timer steals their issue, tries the usual line, then takes them on once
  await day('imm', 'copy', 'copy');
  // help mid-play, and back
  await p.click('#s-day [data-help]'); console.log('help on:', await on('#s-help')); await shot('help');
  await p.click('#b-help-back'); console.log('back on day:', await on('#s-day'), '|', await txt('#dayname'));
  // "take another question" returns to the three questions
  await p.click('#questions .bub.imm'); await p.click('#b-other-q'); console.log('back to questions:', !(await p.$eval('#pick', e => e.classList.contains('hidden'))));
  await day('imm', 'usual');
  await day('other');
  await day('imm', 'oppose', 'oppose');
  await day('other'); await day('other');
  console.log('NIGHT 1:', await txt('#night-stamp'), '|', await txt('#night-gain'), '|', await txt('#night-line')); await shot('night1');
  await p.click('#b-night-next'); console.log('crisis brief:', await txt('#s-crisis .panel')); await shot('crisis');
  await p.click('#b-crisis-go');
  console.log('crisis day 1 forced:', await txt('#pick-lead'), '| other-question hidden after pick:'); await shot('crisis-day1');
  await p.click('#questions .bub.imm'); console.log('  ', await p.$eval('#b-other-q', e => e.classList.contains('hidden')));
  await p.click('#answers .bub.oppose'); await p.waitForTimeout(550); console.log(`${await txt('#dayname')} | ${await txt('#hl')} | ${await txt('#note')}`); await p.click('#b-next');
  await day('other'); await day('other'); await day('imm', 'oppose'); await day('other'); await day('other');
  console.log('NIGHT 2:', await txt('#night-stamp'), '|', await txt('#night-gain'), '|', await txt('#night-line')); await shot('night2');
  await p.click('#b-night-next');
  console.log('\nVERDICT:\n' + await txt('#s-end .verdict')); console.log('WHAT IF:', await txt('#whatif')); await shot('end');
  await p.click('#b-about2'); await shot('about'); await p.click('#b-about-back'); console.log('back on end:', await on('#s-end'));
  // retry: copy every immigration question in the quiet year
  await p.click('#b-again'); await p.click('#b-day1');
  for (let i = 0; i < 6; i++) await day('imm', 'copy');
  console.log('RETRY NIGHT 1 (copy every day):', await txt('#night-stamp'), '|', await txt('#night-gain')); await shot('night-retry');
  console.log('errors', errs);
  await b.close();
})();
