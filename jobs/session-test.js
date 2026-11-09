// Full session in headless Chromium at phone width: eight sessions with a plausible strategy, help opened mid-play and
// returned from, the reply, the verdict; screenshots along the way; no errors; no horizontal scroll. Run: node session-test.js
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 380, height: 740 }, deviceScaleFactor: 1 });
  const errors = []; page.on('pageerror', e => errors.push(e.message)); page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  const url = 'file://' + path.resolve(__dirname, 'one-number-please.html') + '?seed=2026';
  await page.goto(url); await page.waitForTimeout(600);
  const shot = (n, full = true) => page.screenshot({ path: path.join(__dirname, 'screenshot-' + n + '.png'), fullPage: full });
  const hscroll = () => page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
  const log = [];
  const check = async (where) => { if (await hscroll()) log.push('HORIZONTAL SCROLL at ' + where); };
  await shot('start'); await check('start');
  await page.click('#b-begin'); await page.waitForTimeout(300);
  await shot('1-empty'); await shot('view-1-empty', false); await check('play');
  const plan = [['sums', 'one'], ['price', 'one'], ['sums', 'flat'], ['price', 'flat'], ['price', 'flat'], ['sums', 'steep'], ['price', 'steep'], ['sums', 'one']];
  for (let i = 0; i < plan.length; i++) {
    const [t, p] = plan[i];
    if (i === 1) { // help mid-play, and back
      await page.click('#b-help-play'); await page.waitForTimeout(200); await shot('help'); await page.click('#b-help-close'); await page.waitForTimeout(200);
      const on = await page.evaluate(() => document.querySelector('.screen.on').id); if (on !== 's-play') log.push('help did not return to play');
    }
    await page.evaluate(([k, v]) => window.__act.pick(k, v), ['task', t]); await page.waitForTimeout(150);
    if (i === 0) await shot('1-task-only');
    await page.evaluate(([k, v]) => window.__act.pick(k, v), ['prizes', p]); await page.waitForTimeout(150);
    if (i < 4) await shot((i + 1) + '-' + t + '-' + p + '-set');
    const dis = await page.$eval('#b-run', b => b.disabled); if (dis) log.push('run disabled after both set, session ' + (i + 1));
    await page.click('#b-run'); await page.waitForTimeout(1200);
    if (i === 0) { await shot('1-running'); await shot('view-1-running', false); }
    await page.waitForFunction(() => window.__game().phase === 'result', null, { timeout: 15000 }); await page.waitForTimeout(900);
    await shot((i + 1) + '-' + t + '-' + p + '-result'); await check('result ' + (i + 1));
    const r = await page.evaluate(() => { const g = window.__game().last; return g.task + '/' + g.prizes + ' M' + Math.round(g.idx.men) + ' W' + Math.round(g.idx.women) + ' ' + g.words + ' | ' + g.topWords + ' | ' + g.earnWords; });
    log.push('session ' + (i + 1) + ': ' + r);
    await page.click('#b-log'); await page.waitForTimeout(300);
    if (i === 3) await shot('5-notebook');
  }
  const on = await page.evaluate(() => document.querySelector('.screen.on').id); if (on !== 's-reply') log.push('not on reply screen after 8 sessions: ' + on);
  await shot('reply'); await shot('view-reply', false); await check('reply');
  await page.evaluate(() => window.__act.pick('reply', 'depends')); await page.waitForTimeout(150);
  await page.click('#b-send'); await page.waitForTimeout(900);
  await shot('end'); await shot('view-end', false); await check('end');
  const verdict = await page.evaluate(() => document.getElementById('e-backed').textContent + ' ' + document.getElementById('e-why').textContent);
  log.push('verdict: ' + verdict);
  await page.click('#b-about-end'); await page.waitForTimeout(200); await shot('about'); await page.click('#b-about-close'); await page.waitForTimeout(200);
  const on2 = await page.evaluate(() => document.querySelector('.screen.on').id); if (on2 !== 's-end') log.push('about did not return to end');
  // a second play: sums only, reply "less"
  await page.goto('file://' + path.resolve(__dirname, 'one-number-please.html') + '?seed=77'); await page.waitForTimeout(400);
  await page.click('#b-begin'); await page.waitForTimeout(200);
  for (let i = 0; i < 8; i++) {
    await page.evaluate(() => window.__act.pick('task', 'sums')); await page.evaluate(() => window.__act.pick('prizes', 'one')); await page.waitForTimeout(80);
    await page.click('#b-run'); await page.waitForFunction(() => window.__game().phase === 'result', null, { timeout: 15000 }); await page.waitForTimeout(100); await page.click('#b-log'); await page.waitForTimeout(100);
  }
  await page.evaluate(() => window.__act.pick('reply', 'less')); await page.click('#b-send'); await page.waitForTimeout(600);
  await shot('b-end-sums-only');
  log.push('sums-only verdict: ' + await page.evaluate(() => document.getElementById('e-backed').textContent + ' ' + document.getElementById('e-why').textContent));
  await page.click('#b-again'); await page.waitForTimeout(500);
  log.push('again -> ' + await page.evaluate(() => document.querySelector('.screen.on').id + ' ' + location.search));
  log.push('errors: ' + (errors.length ? errors.join(' | ') : 'none'));
  require('fs').writeFileSync(path.join(__dirname, 'session-log.txt'), log.join('\n') + '\n');
  console.log(log.join('\n'));
  await browser.close();
})();
