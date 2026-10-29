// Full session in headless Chromium at phone width: plays every item with a scripted tapper,
// opens How to play mid-reading and returns, picks an archive year, reads the encore, replays.
// node session-test.js > session-log.txt
'use strict';
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 380, height: 760 }, deviceScaleFactor: 2, hasTouch: true });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto('file://' + path.resolve('live-from-brussels.html'));
  const shot = async n => { await page.screenshot({ path: 'screenshot-' + n + '.png' }); console.log('screenshot ' + n); };
  const noHScroll = async where => { const o = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth); console.log((o > 0 ? 'FAIL' : 'ok  ') + ' no horizontal scroll on ' + where + ' (' + o + ')'); };
  const visible = async id => page.evaluate(i => document.getElementById(i).classList.contains('on'), id);
  // a tapper: clicks Go live and schedules pointer taps from the mechanism's own timeline.
  // The taps come from the mechanism's model player (a careful one-thumb tapper); `miss` only varies the seed.
  async function read(miss, midShot) {
    await page.evaluate(miss => {
      const btn = document.getElementById('goLive'), pad = document.getElementById('pad');
      const words = window.__words = null;
      btn.click();
      const id = document.getElementById('playSlot').textContent;
      const t0 = performance.now();
      window.__readDone = false;
      // find the script by its slot label
      const M = window.MECH; let sid = Object.keys(M.SCRIPTS).find(k => M.SCRIPTS[k].slot === id || ('Archive · ' + M.SCRIPTS[k].year) === id);
      const ws = M.scriptWords(sid), tl = M.timeline(ws);
      // a careful one-thumb human, as modelled for the calibration check; `miss` picks the seed
      const taps = M.modelTaps(ws, M.SKILLS.steady, 11 + Math.round(miss * 10));
      for (const at of taps) setTimeout(() => pad.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true })), at * 1000 - (performance.now() - t0));
    }, miss);
    if (midShot) { await page.waitForTimeout(9000); await shot(midShot); }
    await page.waitForFunction(() => document.getElementById('result').classList.contains('on'), null, { timeout: 60000 });
    const head = await page.textContent('#resHead');
    const lit = await page.evaluate(() => document.querySelectorAll('#resBlock rect[fill="#FFB020"]').length);
    const facts = await page.textContent('#resFacts');
    console.log('  result: "' + head + '" — ' + lit + ' windows lit. ' + facts.replace(/\s+/g, ' ').trim());
  }

  await shot('start'); await noHScroll('start');
  await page.click('#goStudio'); await shot('rundown'); await noHScroll('rundown');
  await page.click('#toCard'); await shot('card-tabloid'); await noHScroll('card');
  console.log('item 1: tabloid'); await read(0, 'play-tabloid'); await shot('result-tabloid'); await noHScroll('result');
  await page.click('#resNext');
  console.log('item 2: UK'); await read(0.3); await page.click('#resNext');
  // Brussels: open help mid-reading, come back, read again
  await page.evaluate(() => document.getElementById('goLive').click());
  await page.waitForTimeout(4500);
  await shot('play-comm-help-before');
  await page.click('#play .help'); await page.waitForTimeout(300); await shot('help'); await noHScroll('help');
  console.log('help opened mid-reading; note: ' + await page.textContent('#helpNote'));
  await page.click('#howto [data-close]'); await page.waitForTimeout(200);
  console.log('returned to card: ' + await visible('card') + ' (' + await page.textContent('#cardTitle') + ')');
  console.log('item 3: Brussels'); await read(0.5, 'play-comm'); await shot('result-comm');
  await page.click('#resNext');
  console.log('item 4: professor'); await read(0.6); await shot('result-polsci');
  await page.click('#resNext'); await shot('archive'); await noHScroll('archive');
  await page.click('.tape-btn[data-a="y2020"]');
  console.log('archive: picked 2020'); await read(0.5); await shot('result-archive'); await noHScroll('archive result');
  await page.evaluate(() => document.getElementById('resYear').scrollIntoView()); await shot('result-archive-line');
  await page.click('#resNext'); await shot('end'); await noHScroll('end');
  console.log('END verdict: ' + (await page.textContent('#verdict')).replace(/\s+/g, ' ').trim());
  await page.evaluate(() => document.getElementById('bars').scrollIntoView()); await shot('end-bars');
  await page.click('#encore'); console.log('encore'); await read(0); await shot('result-encore');
  await page.click('#resNext'); console.log('back at end: ' + await visible('end'));
  await page.click('#end [data-open="about"]'); await shot('about'); await noHScroll('about');
  await page.click('#about [data-close]'); console.log('about closed, back at end: ' + await visible('end'));
  await page.click('#again'); console.log('play again → rundown: ' + await visible('rundown'));
  await page.click('#toCard'); console.log('retry item 1 card: ' + await page.textContent('#cardTitle'));
  console.log(errors.length ? 'ERRORS: ' + errors.join(' | ') : 'no page errors');
  await browser.close();
})();
