// Full session in headless Chromium at phone width: plays four years, opens help mid-play, switches views, retries, screenshots.
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 380, height: 760 }, deviceScaleFactor: 1 });
  const errors = []; page.on('pageerror', e => errors.push(e.message)); page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  const url = 'file://' + path.resolve(__dirname, 'the-creche-counter.html');
  await page.goto(url); await page.waitForTimeout(600);
  const shot = async (n, full) => page.screenshot({ path: path.join(__dirname, 'screenshot-' + n + '.png'), fullPage: !!full });
  // an overlay is fixed; to capture all of it, lay it out as the page for the shot
  const shotOverlay = async (id, n) => { await page.evaluate(id => { const o = document.getElementById(id); o.style.position = 'absolute'; o.style.inset = 'auto'; o.style.top = '0'; o.style.left = '0'; o.style.right = '0'; document.querySelector('body > .wrap').style.visibility = 'hidden'; }, id); await page.evaluate(() => window.scrollTo(0, 0)); await shot(n, true); await page.evaluate(id => { const o = document.getElementById(id); o.style.position = ''; o.style.inset = ''; o.style.top = ''; o.style.left = ''; o.style.right = ''; document.querySelector('body > .wrap').style.visibility = ''; }, id); };
  const hscroll = async () => page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
  const log = [];
  await shot('start', true);
  await page.click('#b-begin'); await page.waitForTimeout(400); await shot('a-ward', true);
  if (await hscroll()) errors.push('horizontal scroll on ward');
  await page.click('#b-year1'); await page.waitForTimeout(400); await shot('a-1-order-empty', true);
  const plan = [['videos', 'all'], ['calls', 'nodegree'], ['calls', 'lowknow'], ['calls', 'all']];
  for (let i = 0; i < 4; i++) {
    const [tool, target] = plan[i];
    if (i === 1) { await page.click('#s-year .q'); await page.waitForTimeout(300); await shotOverlay('help', 'help'); await page.click('#b-help-close'); if (await page.evaluate(() => document.body.classList.contains('lock'))) errors.push('body still locked after help'); }
    if (i === 0) { // an unaffordable order first: calls to everyone in year 1
      await page.click('.stub[data-tool=calls]'); await page.click('.stub[data-target=all]'); await page.waitForTimeout(150); await shot('a-1-unaffordable', true);
      log.push('year 1 unaffordable: ' + await page.evaluate(() => document.getElementById('cost-say').innerText) + ' | send dim: ' + await page.evaluate(() => document.getElementById('b-send').classList.contains('dim')));
    }
    await page.click(`.stub[data-tool=${tool}]`); await page.click(`.stub[data-target=${target}]`); await page.waitForTimeout(150);
    await shot(`a-${i + 1}-order-set`, true);
    log.push(`year ${i + 1} order: ` + await page.evaluate(() => document.getElementById('cost-say').innerText));
    await page.click('#b-send'); await page.waitForTimeout(1300); await shot(`a-${i + 1}-running`, false);
    await page.waitForFunction(() => window.__game().phase === 'result', null, { timeout: 10000 }); await page.waitForTimeout(200);
    await shot(`a-${i + 1}-result`, true);
    log.push('  result: ' + await page.evaluate(() => document.querySelector('#result .result').innerText.replace(/\n+/g, ' / ')));
    log.push('  board: ' + await page.evaluate(() => { const g = window.__game().last; return 'degree ' + JSON.stringify(g.gaps.degree) + ' birthplace ' + JSON.stringify(g.gaps.birthplace) + ' purse ' + window.__game().game.purse; }));
    if (await hscroll()) errors.push('horizontal scroll in year ' + (i + 1));
    if (i === 1) { await page.click('#view-sw [data-view=birthplace]'); await page.waitForTimeout(200); await shot('a-2-birthplace', true); await page.click('#view-sw [data-view=target]'); await page.waitForTimeout(200); await shot('a-2-target', true); }
    if (i === 2) { await page.click('#view-sw [data-view=target]'); await page.waitForTimeout(200); await shot('a-3-target', true); await page.click('#view-sw [data-view=degree]'); }
    await page.click('#b-next'); await page.waitForTimeout(400);
  }
  await shot('a-end', true);
  log.push('VERDICT: ' + await page.evaluate(() => document.getElementById('v-lines').innerText.replace(/\n+/g, ' / ')));
  await page.click('#s-verdict [data-about]'); await page.waitForTimeout(200); await shotOverlay('about', 'about'); await page.click('#b-about-close');
  // retry
  await page.click('#b-again'); await page.waitForTimeout(300); await page.click('#b-year1'); await page.waitForTimeout(300);
  const ok = await page.evaluate(() => window.__game().game.year === 1 && window.__game().game.purse === 3000 && window.__game().phase === 'order');
  if (!ok) errors.push('retry did not restart');
  // a saving run: save, calls to all
  await page.click('#b-save'); await page.waitForFunction(() => window.__game().phase === 'result'); await shot('b-1-saved', true);
  log.push('B year 1 saved: ' + await page.evaluate(() => document.querySelector('#result .result').innerText.replace(/\n+/g, ' / ')));
  await page.click('#b-next'); await page.waitForTimeout(300);
  await page.click('.stub[data-tool=calls]'); await page.click('.stub[data-target=all]'); await page.waitForTimeout(150); await shot('b-2-order-all', true);
  await page.click('#b-send'); await page.waitForFunction(() => window.__game().phase === 'result', null, { timeout: 10000 }); await page.waitForTimeout(200); await shot('b-2-result', true);
  log.push('B year 2: ' + await page.evaluate(() => document.querySelector('#result .result').innerText.replace(/\n+/g, ' / ')));
  console.log(log.join('\n'));
  console.log(errors.length ? 'ERRORS:\n' + errors.join('\n') : 'no errors; no horizontal scroll');
  await browser.close();
})();
