// Full session in headless Chromium at phone width (build.md §4.6). Session A, a plausible stranger: crossing 1 pushed
// three times (guns and men: through; four feet and forty men: dug in, the rest wait; four feet, a gun, twenty men: the
// battery drawn off at dark); the help page opened mid-play and closed; crossing 2 loaded right first time; crossing 3 sent
// at A with a sinking preview first, then at A with two feet and twenty men, then at B with a foot and forty. Session B,
// the paper's loading everywhere. Screenshots at the moments that matter; errors and horizontal scroll go to session-log.txt.
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
    await page.evaluate(() => { const g = window.__game.get(); });
    // reset by pressing minus to zero, then plus
    for (let i = 0; i < 6; i++) await page.click('#feet-minus', { force: true }).catch(() => {});
    for (let i = 0; i < 3; i++) await page.click('#guns-minus', { force: true }).catch(() => {});
    for (let i = 0; i < 6; i++) await page.click('#men-minus', { force: true }).catch(() => {});
    if (landing) await page.click('#land-' + landing);
    for (let i = 0; i < feet; i++) await page.click('#feet-plus');
    for (let i = 0; i < guns; i++) await page.click('#guns-plus');
    for (let i = 0; i < men / 10; i++) await page.click('#men-plus');
    await page.waitForTimeout(150);
  };
  const fits700 = async (where) => { const b = await page.evaluate(() => document.getElementById('b-push').getBoundingClientRect().bottom); log.push(where + ': Push off bottom at ' + Math.round(b) + ' px'); if (b > 700) errors.push('Push off below 700 px at ' + where + ' (' + Math.round(b) + ')'); };
  const pushAndWatch = async (name, times) => {
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.click('#b-push');
    for (const [t, label] of times) { await page.waitForTimeout(t); await page.evaluate(() => window.scrollTo(0, 0)); await shot(name + '-' + label); }
    await page.waitForFunction(() => window.__game.get().phase === 'result', null, { timeout: 20000 });
    await page.waitForTimeout(700);
    await shot(name + '-result', true);
    log.push(name + ': ' + await text('#result'));
  };

  await page.goto('file://' + path.resolve(__dirname, 'leibnizs-flatboat.html')); await page.waitForTimeout(600);
  await shot('start', true); await hscroll('start');
  log.push('START: ' + await text('#s-start'));
  await page.click('#b-begin'); await page.waitForTimeout(400);
  await shot('a-1-empty', true); await hscroll('crossing 1'); await fits700('crossing 1, empty');
  const pushDisabled = await page.$eval('#b-push', b => b.disabled); log.push('empty boat: Push off disabled: ' + pushDisabled); if (!pushDisabled) errors.push('Push off live with nothing aboard');
  await setLoad(0, 2, 40); await shot('a-1-guns'); await fits700('crossing 1, loaded');
  log.push('sum: ' + await text('#sum'));
  await pushAndWatch('a-1-p1', [[1900, 'shot'], [2800, 'through']]);
  await page.click('#b-next'); await page.waitForTimeout(300);
  await setLoad(6, 1, 0); await shot('a-1-sinkpreview'); log.push('sink preview sum: ' + await text('#sum') + ' | button: ' + await text('#b-push'));
  await setLoad(4, 0, 40); await shot('a-1-earth');
  await pushAndWatch('a-1-p2', [[2200, 'stops'], [3600, 'landed']]);
  await page.click('#b-next'); await page.waitForTimeout(300);
  await setLoad(4, 1, 20); await shot('a-1-paper');
  await pushAndWatch('a-1-p3', [[3600, 'landed'], [5000, 'drive']]);
  log.push('C1 VERDICT: ' + await text('#cverdict'));
  await shot('a-1-verdict', true);
  await page.click('#b-nextcross'); await page.waitForTimeout(400);
  await shot('a-2-empty', true); await fits700('crossing 2');
  await page.click('#b-help-play'); await page.waitForTimeout(300); await shot('help', true); await page.click('#b-help-close'); await page.waitForTimeout(200);
  const backOnSheet = await page.$eval('#s-play', e => e.classList.contains('on')) && !(await page.$eval('#help', e => e.classList.contains('on'))); log.push('help closed back to the sheet: ' + backOnSheet); if (!backOnSheet) errors.push('help did not return to play');
  await setLoad(1, 0, 60); await shot('a-2-loaded');
  await pushAndWatch('a-2-p1', [[2200, 'stops'], [3600, 'landed'], [5400, 'rest']]);
  log.push('C2 VERDICT: ' + await text('#cverdict'));
  await page.click('#b-nextcross'); await page.waitForTimeout(400);
  await shot('a-3-empty', true); await fits700('crossing 3');
  await setLoad(4, 0, 0, 'front'); await shot('a-3-sinks'); log.push('C3 4 ft on the shallow boat: ' + await text('#sum'));
  await setLoad(2, 1, 0, 'front'); log.push('C3 2 ft + a gun: ' + await text('#sum') + ' | men sub: ' + await text('#d-men-sub'));
  await setLoad(2, 0, 20, 'front'); await shot('a-3-A');
  await pushAndWatch('a-3-p1', [[3600, 'landed']]);
  await page.click('#b-next'); await page.waitForTimeout(300);
  await setLoad(1, 0, 40, 'up'); await shot('a-3-B'); await fits700('crossing 3, B');
  await pushAndWatch('a-3-p2', [[2200, 'stops'], [5400, 'rest']]);
  log.push('C3 VERDICT: ' + await text('#cverdict'));
  await page.click('#b-nextcross'); await page.waitForTimeout(500);
  await shot('a-end', true); await hscroll('end');
  log.push('END: ' + await text('#s-end'));
  await page.click('#b-about-end'); await page.waitForTimeout(300); await shot('about', true); await page.click('#b-about-close'); await page.waitForTimeout(200);

  // Session B: the paper's loading everywhere
  await page.click('#b-again'); await page.waitForTimeout(400);
  await setLoad(4, 1, 20); await pushAndWatch('b-1', [[5000, 'drive'], [7200, 'rest']]);
  await page.click('#b-nextcross'); await page.waitForTimeout(300);
  await setLoad(1, 0, 60); await pushAndWatch('b-2', []);
  await page.click('#b-nextcross'); await page.waitForTimeout(300);
  await setLoad(1, 0, 40, 'up'); await pushAndWatch('b-3', []);
  await page.click('#b-nextcross'); await page.waitForTimeout(500);
  await shot('b-end', true);
  log.push('END B: ' + await text('#s-end'));

  log.push(''); log.push(errors.length ? 'ERRORS: ' + errors.join(' | ') : 'no errors, no horizontal scroll');
  fs.writeFileSync(path.join(__dirname, 'session-log.txt'), log.join('\n') + '\n');
  console.log(log.join('\n'));
  await browser.close();
  process.exit(errors.length ? 1 : 0);
})();
