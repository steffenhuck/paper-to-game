// Browser session test (build step 6): drives the-balance.html at 380 px through a full session.
// Run: node session-test.js (needs playwright). Screenshots go to the system temp folder.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 380, height: 800 }, deviceScaleFactor: 2 });
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + __dirname + '/the-balance.html');
  const t0 = Date.now(), D = require('os').tmpdir() + '/';
  const greek = async id => (await p.$eval(id, e => e.innerText)).match(/[κσπφθτεΠΘ]/g);
  const setLever = v => p.$eval('#lever', (el, v) => { el.value = v; el.dispatchEvent(new Event('input')); }, v);
  const waitAfter = () => p.waitForFunction(() => document.getElementById('after').style.display === 'flex', null, { timeout: 60000 });
  await p.screenshot({ path: D + 'a-start.png', fullPage: true });
  console.log('greek on start:', await greek('#s-start'));
  await p.click('#b-start');
  await p.screenshot({ path: D + 'b-play-fresh.png', fullPage: true });
  const plan = [[0.5, 0.2, 0], [0, 1, 0.5], [0.5], [0.3], [0.2]];
  let helped = false;
  for (let s = 0; s < plan.length; s++) {
    for (let t = 0; t < plan[s].length; t++) {
      await setLever(plan[s][t]);
      await p.click('#b-release');
      if (s === 1 && t === 0) { await p.waitForTimeout(2500); await p.screenshot({ path: D + 'b-mid-test.png', fullPage: true }); }
      await waitAfter();
      const y = await p.$eval('#yard', e => e.innerText), m = await p.$eval('#msg', e => e.innerText);
      console.log(`soc ${s + 1} test ${t + 1} balance ${plan[s][t]}: ${y} — ${m}`);
      await p.screenshot({ path: `${D}c-${s + 1}-${t + 1}.png`, fullPage: true });
      if (!helped && s === 1 && t === 0) {
        await p.click('#s-play button.q'); await p.screenshot({ path: D + 'd-help.png', fullPage: true });
        await p.click('#b-help-back');
        console.log('  back from help on play:', await p.$eval('#s-play', e => e.classList.contains('on')), '; test-again visible:', await p.$eval('#b-again', e => e.style.display !== 'none'));
        helped = true;
      }
      if (await p.$eval('#reveal', e => e.style.display === 'block')) break;
      await p.click('#b-again');
    }
    console.log('  greek on play:', await greek('#s-play'));
    await p.click('#b-next');
  }
  await p.screenshot({ path: D + 'e-end.png', fullPage: true });
  console.log('VERDICT:', await p.$eval('#verdict', e => e.innerText));
  console.log('greek on end:', await greek('#s-end'), '; help:', await greek('#s-help'), '; about:', await greek('#s-about'));
  console.log('scrollWidth', await p.evaluate(() => document.documentElement.scrollWidth), '; session seconds (machine, no thinking time)', Math.round((Date.now() - t0) / 1000));
  await p.click('#b-replay'); await p.click('#presets button:nth-child(2)'); await p.click('#b-start');
  for (const v of [0, 0.1, 0.2]) { await setLever(v); await p.click('#b-release'); await waitAfter(); if (v < 0.2) await p.click('#b-again'); }
  console.log('answer button visible after 3 fails:', await p.$eval('#b-answer', e => e.style.display !== 'none'));
  await p.click('#b-answer'); console.log('reveal head:', await p.$eval('#reveal .rv', e => e.innerText));
  console.log('errors', errs); await b.close();
})();
