// Full session in headless Chromium at phone width: plays a whole game, opens help mid-play, retries, screenshots.
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 380, height: 700 }, deviceScaleFactor: 1 }); // a small phone, browser chrome taken off
  const errors = []; page.on('pageerror', e => errors.push(e.message)); page.on('console', m => { if (m.type() === 'error' && !/goatcounter|gc\.zgo|ERR_FAILED/.test(m.text())) errors.push(m.text()); });
  await page.route(/gc\.zgo\.at/, r => r.abort());
  const url = 'file://' + path.resolve(__dirname, 'blink-with-leavitt.html') + '?seed=1912';
  await page.goto(url); await page.waitForTimeout(800);
  const shot = async (n, full) => page.screenshot({ path: path.join(__dirname, 'screenshot-' + n + '.png'), fullPage: !!full });
  const hscroll = async () => page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
  const log = [];
  await shot('start', true);
  await page.click('#b-begin'); await page.waitForTimeout(2200); await shot('a-1-arriving', true);
  await page.waitForFunction(() => window.__game().phase === 'tuning', null, { timeout: 60000 }); await page.waitForTimeout(300); await shot('a-1-tuning-start', true);
  await shot('view-1-tuning', false); // what the phone shows without scrolling: the box and the dial must both be here
  const setBeat = async (days, fine) => page.evaluate(([d, f]) => { const c = document.getElementById('coarse'); c.value = MECH.daysToCoarse(d); c.dispatchEvent(new Event('input')); if (f != null) { const e = document.getElementById('fine'); e.value = f; e.dispatchEvent(new Event('input')); } }, [days, fine]);
  // help opened mid-play and returned from
  await page.click('#s-round .q'); await page.waitForTimeout(300); await shot('help', true); await page.click('#b-help-close');
  const plan = [1, 2, 1, 1.4, 0.99, 1, 1]; // round 2: twice her beat; round 4: far too long
  for (let i = 0; i < 7; i++) {
    const st = await page.evaluate(() => { const g = window.__game().game; return { h: g.rounds[g.round].h, P: MECH.star(g.rounds[g.round].h).period, round: g.round }; });
    if (i === 6) {
      await page.waitForFunction(() => window.__game().phase === 'guess');
      await page.waitForTimeout(300); await shot('a-7-guess-start', true);
      await setBeat(19); await page.waitForTimeout(200); await shot('a-7-guess-set', true);
      await shot('view-7-guess', false);
      await page.click('#b-act');
    }
    await page.waitForFunction(() => window.__game().phase === 'tuning', null, { timeout: 60000 });
    if (i < 3 || i === 6) { await setBeat(st.P * 1.37); await page.waitForTimeout(i === 0 ? 900 : 150); await shot(`a-${i + 1}-wrong`, true); }
    if (i === 0 || i === 2) await shot(`view-${i + 1}-wrong`, false);
    // the fine dial as a thumb would: coarse near, fine to the exact place
    const want = st.P * plan[i], coarseDays = want * 1.04;
    await setBeat(coarseDays);
    const fine = (want / MECH_dial(coarseDays) - 1) / 0.10 / 2 + 0.5;
    await setBeat(coarseDays, fine); await page.waitForTimeout(150);
    if (i < 3 || i === 6) await shot(`a-${i + 1}-tuned`, true);
    const vis = await page.evaluate(() => { const r = document.getElementById('r-dial').getBoundingClientRect(), b = (document.getElementById('r-record-box').classList.contains('hide') ? document.getElementById('c-guess') : document.getElementById('c-record')).getBoundingClientRect(); return { dialBottom: r.bottom, boxTop: b.top, h: window.innerHeight, y: window.scrollY }; });
    if (vis.y !== 0 || vis.dialBottom > vis.h || vis.boxTop < 0) errors.push('round ' + (i + 1) + ': box and dial not both on screen without scrolling: ' + JSON.stringify(vis));
    await page.click('#b-act'); await page.waitForTimeout(500); await shot(`a-${i + 1}-written`, true);
    log.push(await page.evaluate(() => document.getElementById('r-result').innerText.replace(/\n/g, ' / ')));
    await page.click('#b-act'); await page.waitForTimeout(900); await shot(`a-${i + 1}-chart`, true);
    log.push('  chart: ' + await page.evaluate(() => document.getElementById('ch-say').innerText));
    if (await hscroll()) errors.push('horizontal scroll at round ' + (i + 1));
    await page.click('#b-chart'); await page.waitForTimeout(i === 6 ? 1200 : 400);
  }
  await shot('a-others', true);
  await page.click('#fig-sw button[data-fig="1"]'); await page.waitForTimeout(200); await shot('a-others-fig1', true);
  await page.click('#fig-sw button[data-fig="2"]');
  await page.click('#b-chart'); await page.waitForTimeout(500); await shot('a-end', true);
  log.push('VERDICT: ' + await page.evaluate(() => document.getElementById('v-lines').innerText.replace(/\n+/g, ' / ')));
  if (!(await page.evaluate(() => /If your numbers had stood/i.test(document.getElementById('v-lines').innerText)))) errors.push('verdict lacks the what-if');
  await page.click('#s-verdict [data-about]'); await page.waitForTimeout(200); await shot('about', true); await page.click('#b-about-close');
  // retry: another night
  await page.click('#b-again'); await page.waitForTimeout(1500); await shot('b-1-arriving', true);
  const ok = await page.evaluate(() => window.__game().game.round === 0);
  if (!ok) errors.push('retry did not restart');
  console.log(log.join('\n'));
  console.log(errors.length ? 'ERRORS:\n' + errors.join('\n') : 'no errors; no horizontal scroll');
  await browser.close();
  function MECH_dial(d) { const M = require('./mechanism.js'); return M.dialToDays(M.daysToCoarse(d), 0.5); }
})();
