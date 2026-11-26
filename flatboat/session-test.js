// Full session in headless Chromium at phone width (build.md §4.6), revision 6. Session A, a plausible stranger: the
// general's boat watched; crossing 1 pushed with two cannons and forty men (sunk, the day lost), played again with five
// feet and twenty (stuck, dug in, the rest wait) and then four feet, a cannon and twenty (the battery driven off, the rest
// cross); the help page opened mid-play and closed; crossing 2 overloaded once (sinks at the bank), sent at A with two
// feet and twenty (dug in, the rest wait), then at B with a foot and forty (dark: the rest cross at dawn). Session B, the
// paper's loading everywhere. Session C, the musket case: no earth at B (hit, driven back). A screenshot of every frame;
// errors, horizontal scroll and the title block showing the future go to session-log.txt.
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 380, height: 760 }, deviceScaleFactor: 1 });
  const errors = [], log = [];
  page.on('pageerror', e => errors.push(e.message)); page.on('console', m => { if (m.type() === 'error' && m.text().indexOf('Failed to load resource') < 0) errors.push(m.text()); });
  const shot = (n, full) => page.screenshot({ path: path.join(__dirname, 'screenshot-' + n + '.png'), fullPage: !!full });
  const hscroll = async (where) => { if (await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1)) errors.push('horizontal scroll at ' + where); };
  const text = (sel) => page.$eval(sel, e => e.innerText.replace(/\n+/g, ' / '));
  const setLoad = async (feet, guns, men, landing) => {
    for (let i = 0; i < 6; i++) await page.click('#feet-minus', { force: true }).catch(() => {});
    for (let i = 0; i < 3; i++) await page.click('#guns-minus', { force: true }).catch(() => {});
    for (let i = 0; i < 6; i++) await page.click('#men-minus', { force: true }).catch(() => {});
    if (landing) await page.click('#land-' + landing);
    for (let i = 0; i < feet; i++) await page.click('#feet-plus');
    for (let i = 0; i < guns; i++) await page.click('#guns-plus');
    for (let i = 0; i < men / 10; i++) await page.click('#men-plus');
    await page.waitForTimeout(150);
  };
  const fits700 = async (where) => { const b = await page.evaluate(() => { const e = document.getElementById('b-push'); return e.classList.contains('hide') ? document.getElementById('landings').getBoundingClientRect().bottom : e.getBoundingClientRect().bottom; }); log.push(where + ': Push off bottom at ' + Math.round(b) + ' px'); if (b > 700) errors.push('Push off below 700 px at ' + where + ' (' + Math.round(b) + ')'); };
  const tb = () => page.evaluate(() => ({ pushes: document.getElementById('tb-pushes').textContent, across: document.getElementById('tb-across').textContent, lost: document.getElementById('tb-lost').textContent, bank: document.getElementById('tb-bank').textContent + ' ' + document.getElementById('tb-bank2').textContent }));
  // push off and step through every frame; the title block at the START of each frame must be the one before the push's
  // events (never the future), and at the end of the last frame it must equal the state
  const pushAndWatch = async (name) => {
    await page.evaluate(() => window.scrollTo(0, 0));
    const before = await tb();
    await page.click('#b-push');
    let n = 0, first = true;
    while (true) {
      const early = await tb();
      const g0 = await page.evaluate(() => { const x = window.__game.get(); return { fi: x.fi, pic: x.frames[x.fi].pic }; });
      if (first) { if (early.across !== before.across || early.lost !== before.lost || early.bank !== before.bank) errors.push('title block changed before the first frame played at ' + name + ': ' + JSON.stringify(before) + ' -> ' + JSON.stringify(early)); first = false; }
      await page.waitForTimeout(g0.pic === 'land' ? 5200 : 3600); await page.evaluate(() => window.scrollTo(0, 0));
      const g = await page.evaluate(() => { const x = window.__game.get(); return { fi: x.fi, n: x.frames.length, phase: x.phase, pic: x.frames[x.fi] && x.frames[x.fi].pic, tb: x.frames[x.fi].tb }; });
      const late = await tb();
      await shot(name + '-' + (g.fi + 1) + '-' + g.pic);
      log.push(name + ' frame ' + (g.fi + 1) + '/' + g.n + ' [' + g.pic + ']: ' + await text('#frame-text') + '  | tb at start ' + JSON.stringify(early) + ' | tb at end ' + JSON.stringify(late));
      if (String(g.tb.across) !== late.across || String(g.tb.lost) !== late.lost) errors.push('title block after frame ' + g.pic + ' at ' + name + ' is not the frame’s own: ' + JSON.stringify(late) + ' vs ' + JSON.stringify(g.tb));
      n++; if (n > 8) { errors.push('frames did not end at ' + name); break; }
      await page.click('#b-step');
      const ph = await page.evaluate(() => window.__game.get().phase);
      if (ph === 'result') break;
    }
    await page.waitForTimeout(500);
    await shot(name + '-result', true);
    log.push(name + ' RESULT: ' + await text('#result'));
  };

  await page.goto('file://' + path.resolve(__dirname, 'leibnizs-flatboat.html')); await page.waitForTimeout(600);
  await shot('start', true); await hscroll('start');
  log.push('START: ' + await text('#s-start'));
  await page.click('#b-begin'); await page.waitForTimeout(400);
  await shot('a-0-general', true); await hscroll('opening'); await fits700('the general’s boat');
  log.push('OPENING donow: ' + await text('#donow'));
  await pushAndWatch('a-0');
  await page.click('#b-next'); await page.waitForTimeout(300);
  await shot('a-1-empty', true); await hscroll('crossing 1'); await fits700('crossing 1, empty');
  const pushDisabled = await page.$eval('#b-push', b => b.disabled); log.push('empty boat: Push off disabled: ' + pushDisabled); if (!pushDisabled) errors.push('Push off live with nothing aboard');
  await setLoad(0, 2, 40); await shot('a-1-guns'); await fits700('crossing 1, loaded');
  log.push('sum: ' + await text('#sum'));
  await pushAndWatch('a-1-p1');
  await shot('a-1-lostday', true); const cvHidden = await page.$eval('#cverdict', e => e.classList.contains('hide')); log.push('LOST DAY: ' + await text('#result') + ' | verdict hidden: ' + cvHidden + ' | replay visible: ' + await page.$eval('#b-replay', e => !e.classList.contains('hide'))); if (!cvHidden) errors.push('a lost day showed the crossing verdict');
  const lostText = await text('#s-play'); if (/most this boat could|By dark/.test(lostText)) errors.push('a lost day gave away the best loading or said by dark');
  await page.click('#b-replay'); await page.waitForTimeout(400); await shot('a-1b-empty', true);
  log.push('REPLAY tb: ' + await text('.tb'));
  await setLoad(5, 0, 20); await shot('a-1b-five');
  await pushAndWatch('a-1b-p1');
  await page.click('#b-next'); await page.waitForTimeout(300); await shot('a-1b-next', true);
  log.push('after a measured shot, the Earth dial says: ' + await text('#d-feet-sub') + ' | record: ' + await page.$eval('#record', e => e.textContent));
  await setLoad(4, 1, 20); await shot('a-1b-paper');
  await pushAndWatch('a-1b-p2');
  log.push('C1 VERDICT: ' + await text('#cverdict'));
  await shot('a-1b-verdict', true);
  await page.click('#b-nextcross'); await page.waitForTimeout(400);
  await shot('a-2-empty', true); await fits700('crossing 2'); await hscroll('crossing 2');
  await page.click('#b-help-play'); await page.waitForTimeout(300); await shot('help', false); await page.click('#b-help-close'); await page.waitForTimeout(200);
  const backOnSheet = await page.$eval('#s-play', e => e.classList.contains('on')) && !(await page.$eval('#help', e => e.classList.contains('on'))); log.push('help closed back to the sheet: ' + backOnSheet); if (!backOnSheet) errors.push('help did not return to play');
  await setLoad(4, 0, 0, 'front'); await shot('a-2-sinkpreview'); log.push('sink preview sum: ' + await text('#sum') + ' | button: ' + await text('#b-push'));
  await pushAndWatch('a-2-p1'); await page.click('#b-next'); await page.waitForTimeout(300);
  await setLoad(2, 0, 20, 'front'); await shot('a-2-A'); await fits700('crossing 2 at A, loaded');
  await pushAndWatch('a-2-p2'); await page.click('#b-next'); await page.waitForTimeout(300);
  await setLoad(1, 0, 40, 'up'); await shot('a-2-B'); await fits700('crossing 2 at B, loaded');
  await pushAndWatch('a-2-p3');
  log.push('C2 VERDICT: ' + await text('#cverdict'));
  await page.click('#b-nextcross'); await page.waitForTimeout(500);
  await shot('a-end', true); await hscroll('end');
  log.push('END: ' + await text('#s-end'));
  await page.click('#b-about-end'); await page.waitForTimeout(300); await shot('about', false); await page.click('#b-about-close'); await page.waitForTimeout(200);

  // session B: the paper's loading everywhere
  await page.click('#b-again'); await page.waitForTimeout(400);
  await pushAndWatch('b-0'); await page.click('#b-next'); await page.waitForTimeout(300);
  await setLoad(4, 1, 20); await pushAndWatch('b-1');
  log.push('B C1 VERDICT: ' + await text('#cverdict'));
  await page.click('#b-nextcross'); await page.waitForTimeout(400);
  await setLoad(1, 0, 40, 'up'); await pushAndWatch('b-2');
  log.push('B C2 VERDICT: ' + await text('#cverdict'));
  await page.click('#b-nextcross'); await page.waitForTimeout(500);
  await shot('b-end', true); log.push('B END: ' + await text('#fate') + ' / ' + await text('#endbody'));
  if (!/over by morning/i.test(await text('#fate'))) errors.push('the paper’s loading did not get the best fate');

  // session C: the musket case at B with no earth, then a day's third push to see dark
  await page.click('#b-again'); await page.waitForTimeout(400);
  await pushAndWatch('c-0'); await page.click('#b-next'); await page.waitForTimeout(300);
  await setLoad(4, 1, 20); await pushAndWatch('c-1'); await page.click('#b-nextcross'); await page.waitForTimeout(400);
  await setLoad(0, 0, 60, 'up'); await pushAndWatch('c-2-p1'); await page.click('#b-next'); await page.waitForTimeout(300);
  log.push('after muskets through, the Earth dial says: ' + await text('#d-feet-sub'));
  await setLoad(1, 0, 40, 'up'); await pushAndWatch('c-2-p2');
  await page.click('#b-nextcross'); await page.waitForTimeout(500); await shot('c-end', true); log.push('C END: ' + await text('#fate'));

  // laptop width
  const lp = await browser.newPage({ viewport: { width: 1000, height: 900 } });
  await lp.goto('file://' + path.resolve(__dirname, 'leibnizs-flatboat.html')); await lp.waitForTimeout(500); await lp.click('#b-begin'); await lp.waitForTimeout(300);
  await lp.screenshot({ path: path.join(__dirname, 'screenshot-laptop-general.png') });

  fs.writeFileSync(path.join(__dirname, 'session-log.txt'), (errors.length ? 'ERRORS:\n' + errors.join('\n') + '\n\n' : 'no errors, no horizontal scroll, the title block never ahead of the frames\n\n') + log.join('\n') + '\n');
  console.log(errors.length ? 'ERRORS: ' + errors.join(' | ') : 'session clean'); console.log(log.length + ' log lines');
  await browser.close();
  process.exit(errors.length ? 1 : 0);
})();
