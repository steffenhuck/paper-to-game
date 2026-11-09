// Full session in headless Chromium at phone width: a whole game with a plausible strategy (the fair instinct, then
// a change of mind on the lawyer), help opened mid-play and returned from, About, a retry; screenshots along the way.
const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 380, height: 740 }, deviceScaleFactor: 1 });
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error' && !/zgo\.at|goatcounter|net::ERR/.test(m.text())) errors.push(m.text()); });
  await page.goto('file://' + path.resolve(__dirname, 'coases-cows.html')); await page.waitForTimeout(500);
  const shot = (n, full) => page.screenshot({ path: path.join(__dirname, 'screenshot-' + n + '.png'), fullPage: full !== false });
  const hscroll = () => page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
  const text = (sel) => page.evaluate(s => document.querySelector(s).innerText.replace(/\n+/g, ' / '), sel);
  const tallyUp = () => page.evaluate(() => document.getElementById('c-tally').style.display !== 'none');
  const log = [];
  await shot('start');
  // help from the start screen and back
  await page.click('#b-help-start'); await page.waitForTimeout(200); await shot('help');
  await page.click('#b-help-close');
  if (await page.evaluate(() => document.getElementById('s-help').classList.contains('on') || !document.getElementById('s-start').classList.contains('on'))) errors.push('help did not return to start');
  await page.click('#b-begin'); await page.waitForTimeout(400);
  const rulings = [1, 1, 0, 1, 1, 1];
  for (let i = 0; i < 6; i++) {
    const r = rulings[i];
    if (await page.evaluate(() => !document.getElementById('b-rule').disabled)) errors.push('rule enabled before a ruling was touched, quarrel ' + (i + 1));
    if (i === 2) { // help mid-play from the play screen, return to the same quarrel
      await page.click('#b-help-play'); await page.waitForTimeout(150); await page.click('#b-help-close');
      if (await page.evaluate(() => !document.getElementById('s-play').classList.contains('on') || document.getElementById('s-help').classList.contains('on'))) errors.push('help did not return to play');
      if ((await text('#p-sub')).indexOf('quarrel 3') < 0) errors.push('help lost the quarrel');
    }
    // touch two rulings: the sign must follow the touch, the preview must change
    await page.click('.ruling[data-r="' + ((r + 1) % 3) + '"]'); await page.waitForTimeout(100);
    const s1 = await page.evaluate(() => document.getElementById('signtext').textContent);
    await page.click('.ruling[data-r="' + r + '"]'); await page.waitForTimeout(150);
    const s2 = await page.evaluate(() => document.getElementById('signtext').textContent);
    if (s1 === s2 || !s2) errors.push('sign did not follow the touch, quarrel ' + (i + 1));
    if (i === 0) await shot('q1-chosen', false);
    await page.click('#b-rule'); await page.waitForTimeout(300);
    if (i === 0) await shot('q1-beat0', false);
    let n = 0; const beats = [];
    while (!(await tallyUp())) { beats.push(await text('#p-beat')); await page.click('#b-next'); await page.waitForTimeout(900); n++; if (n > 12) { errors.push('beats never ended'); break; } if (i === 0 && n === 2) await shot('q1-beat2', false); if (i === 4 && n === 2) await shot('q5-beat2', false); }
    await page.waitForTimeout(600);
    log.push('quarrel ' + (i + 1) + ' ruling ' + r + ': ' + beats.join(' | '));
    log.push('   tally: ' + await text('#purses') + ' // ' + await text('#p-barlabel') + ' // ' + await text('#p-result'));
    if (i === 0) await shot('q1-tally'); if (i === 1) await shot('q2-tally'); if (i === 2) await shot('q3-tally'); if (i === 3) await shot('q4-tally'); if (i === 4) await shot('q5-tally'); if (i === 5) await shot('q6-tally');
    if (await hscroll()) errors.push('hscroll at quarrel ' + (i + 1));
    await page.click('#b-nextq'); await page.waitForTimeout(500);
  }
  await shot('verdict');
  log.push('VERDICT: ' + await text('#v-did') + ' // ' + await text('#v-paper') + ' // ' + await text('#v-means') + ' // ' + await text('#v-fate'));
  if (await hscroll()) errors.push('hscroll at verdict');
  await page.click('#b-about'); await page.waitForTimeout(200); await shot('about'); await page.click('#b-about-close');
  await page.click('#b-help-end'); await page.waitForTimeout(150); await page.click('#b-help-close');
  // retry
  await page.click('#b-again'); await page.waitForTimeout(400); await shot('restart', false);
  const ok = await page.evaluate(() => window.__game().game.rulings.length === 0 && window.__game().phase === 'choose');
  if (!ok) errors.push('rule again did not restart');
  // a second run, the other way round, to see the purses change where the valley does not
  await page.click('.ruling[data-r="0"]'); await page.click('#b-rule'); await page.waitForTimeout(300);
  let m = 0; while (!(await tallyUp())) { await page.click('#b-next'); await page.waitForTimeout(700); if (++m > 12) break; }
  log.push('second run, quarrel 1 ruling 0 tally: ' + await text('#purses'));
  // no decimals anywhere on the play or verdict screens
  const body = await page.evaluate(() => document.getElementById('main').innerText);
  if (/\d\.\d/.test(body)) errors.push('a decimal on screen');
  console.log(log.join('\n'));
  console.log(errors.length ? 'ERRORS:\n' + errors.join('\n') : 'no errors; no horizontal scroll');
  await browser.close();
})();
