// Full session in headless Chromium at phone width (build.md §4.6): the best play (sunset inside, lightning physics,
// red shape, trumpet inside, pain shape, bat shape) with the third answer; every frame at every stop screenshotted on
// the way; help opened and returned from mid-play; a second session by the reductionist (always physics) with the
// second answer, and a third with the first answer. Errors and horizontal scroll go to session-log.txt.
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 380, height: 760 }, deviceScaleFactor: 1 });
  const errors = [], log = [];
  page.on('pageerror', e => errors.push(e.message)); page.on('console', m => { if (m.type() === 'error' && m.text().indexOf('Failed to load resource') < 0) errors.push(m.text()); });
  await page.goto('file://' + path.resolve(__dirname, 'zoom-out-with-nagel.html')); await page.waitForTimeout(600);
  const shot = (n, full) => page.screenshot({ path: path.join(__dirname, 'screenshot-' + n + '.png'), fullPage: !!full });
  const hscroll = async (where) => { if (await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1)) errors.push('horizontal scroll at ' + where); };
  const fits = async (where) => { const b = await page.evaluate(() => document.getElementById('b-send').getBoundingClientRect().bottom); log.push(where + ': Send bottom at ' + Math.round(b) + ' px (within 700: ' + (b <= 700) + ')'); if (b > 700) errors.push('Send below 700 px at ' + where); };
  const now = () => page.$eval('#now', e => e.textContent);
  const stops = ['inside', 'shape', 'physics'];
  const plan = ['inside', 'physics', 'shape', 'inside', 'shape', 'shape'];
  const ids = ['sunset', 'lightning', 'red', 'trumpet', 'pain', 'bat'];

  await shot('start', true); await hscroll('start');
  await page.click('#b-start'); await page.waitForTimeout(400);
  for (let k = 0; k < 6; k++) {
    await hscroll('round ' + (k + 1)); await fits('round ' + (k + 1));
    log.push('round ' + (k + 1) + ': ' + await now() + ' | ask: ' + await page.$eval('#ask', e => e.textContent));
    for (let i = 0; i < 3; i++) {
      await page.evaluate(i => window.__api.setStop(i), i); await page.waitForTimeout(150);
      await shot('a-' + (k + 1) + '-' + ids[k] + '-' + stops[i]);
      log.push('  stop ' + stops[i] + ': tag=' + await page.$eval('#tag', e => e.textContent) + ' · ' + await page.$eval('#needs', e => e.textContent));
    }
    if (k === 2) { await page.click('.help-btn'); await page.waitForTimeout(300); await shot('help', true); await page.click('#help [data-close]'); await page.waitForTimeout(200); log.push('  help opened and closed mid-round; stop still ' + await page.$eval('#tag', e => e.textContent)); }
    const pi = stops.indexOf(plan[k]); await page.evaluate(i => window.__api.setStop(i), pi); await page.waitForTimeout(150);
    await page.click('#b-send'); await page.waitForTimeout(600); await shot('a-' + (k + 1) + '-' + ids[k] + '-developing');
    await page.waitForTimeout(3100); await shot('a-' + (k + 1) + '-' + ids[k] + '-sent', true);
    log.push('  SENT ' + plan[k] + ': ' + await page.$eval('#line', e => e.textContent)); log.push('  rule: ' + await page.$eval('#why', e => e.textContent)); log.push('  reply: ' + await page.$eval('#reply', e => e.textContent)); log.push('  now: ' + await now() + ' | icon: ' + await page.$eval('#thingbox svg', e => e.getAttribute('class')) + ' ' + await page.$eval('#thingcap', e => e.textContent));
    const nb = await page.evaluate(() => document.getElementById('b-next').getBoundingClientRect().bottom); log.push('  Next bottom at ' + Math.round(nb) + ' px');
    await page.click('#b-next'); await page.waitForTimeout(400);
  }
  await hscroll('question'); await shot('a-question', true); log.push('question: ' + await page.$eval('#qtext', e => e.textContent));
  await page.click('button[data-a="something"]'); await page.waitForTimeout(400); await hscroll('end'); await shot('a-end', true);
  log.push('END: ' + await page.$eval('#ehead', e => e.textContent)); log.push('found: ' + await page.$eval('#efound', e => e.innerText.replace(/\n+/g, ' / ')));
  await page.click('#end [data-open="about"]'); await page.waitForTimeout(300); await shot('about', true); await page.click('#about [data-close]'); await page.waitForTimeout(200);
  // session B: the reductionist, always physics, second answer
  await page.click('#b-again'); await page.waitForTimeout(300);
  for (let k = 0; k < 6; k++) { await page.evaluate(() => window.__api.setStop(2)); await page.waitForTimeout(100); await page.click('#b-send'); await page.waitForTimeout(3500); if (k === 2 || k === 4) await shot('b-' + (k + 1) + '-' + ids[k] + '-physics-sent', true); log.push('B round ' + (k + 1) + ' physics: ' + await page.$eval('#line', e => e.textContent)); await page.click('#b-next'); await page.waitForTimeout(300); }
  await page.click('button[data-a="physics"]'); await page.waitForTimeout(300); await shot('b-end', true); log.push('B END: ' + await page.$eval('#ehead', e => e.textContent));
  // session C: always inside, first answer
  await page.click('#b-again'); await page.waitForTimeout(300);
  for (let k = 0; k < 6; k++) { await page.click('#b-send'); await page.waitForTimeout(3500); if (k === 1 || k === 5) await shot('c-' + (k + 1) + '-' + ids[k] + '-inside-sent', true); log.push('C round ' + (k + 1) + ' inside: ' + await page.$eval('#line', e => e.textContent)); await page.click('#b-next'); await page.waitForTimeout(300); }
  await page.click('button[data-a="nothing"]'); await page.waitForTimeout(300); await shot('c-end', true); log.push('C END: ' + await page.$eval('#ehead', e => e.textContent));
  // laptop width
  await page.setViewportSize({ width: 1280, height: 720 }); await page.click('#b-again'); await page.waitForTimeout(300); await shot('laptop-round1'); await hscroll('laptop');
  log.push('errors: ' + (errors.length ? errors.join(' | ') : 'none'));
  fs.writeFileSync(path.join(__dirname, 'session-log.txt'), log.join('\n') + '\n');
  console.log(log.join('\n'));
  await browser.close();
  process.exit(errors.length ? 1 : 0);
})();
