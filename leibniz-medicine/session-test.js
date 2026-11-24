// Full session in headless Chromium at phone width (build.md §4.6), on a fixed draw (?seed=42): ten winters played the
// way a careful stranger might (read the collection when it has the remedy that helped in this kind of winter, avoid
// what it says harmed, otherwise repeat what helped last winter or try another), How to play opened and returned from
// in 1692, the collection opened in 1695 and 1698, the letter in 1694, the verdict, About. Then a second draw (seed 7)
// played by the own-winters rule alone. Errors, fit checks and horizontal scroll go to session-log.txt.
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
(async () => {
  const browser = await chromium.launch();
  const errors = [], log = [];
  async function session(seed, policy, tag, full) {
    const page = await browser.newPage({ viewport: { width: 380, height: 760 }, deviceScaleFactor: 1 });
    page.on('pageerror', e => errors.push(tag + ': ' + e.message)); page.on('console', m => { if (m.type() === 'error' && m.text().indexOf('Failed to load resource') < 0) errors.push(tag + ': ' + m.text()); });
    await page.goto('file://' + path.resolve(__dirname, 'leibnizs-register.html') + '?seed=' + seed); await page.waitForTimeout(600);
    const shot = (n, fp) => page.screenshot({ path: path.join(__dirname, 'screenshot-' + tag + '-' + n + '.png'), fullPage: !!fp });
    const hscroll = async (where) => { if (await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1)) errors.push(tag + ': horizontal scroll at ' + where); };
    const say = () => page.$eval('#say', e => e.innerText.replace(/\n+/g, ' / '));
    if (full) { await shot('start', true); await hscroll('start'); }
    await page.click('#b-begin'); await page.waitForTimeout(400);
    for (let t = 0; t < 10; t++) {
      const year = 1690 + t;
      if (year === 1694) { if (full) { await shot('letter', true); await hscroll('letter'); } log.push(tag + ' LETTER: ' + await page.$eval('.memo', e => e.innerText.slice(0, 100).replace(/\n/g, ' '))); await page.click('#b-register'); await page.waitForTimeout(400); }
      await hscroll(year);
      const fit = await page.evaluate(() => { const g = document.getElementById('b-give').getBoundingClientRect(), c = document.getElementById('crowd').getBoundingClientRect(); return { give: Math.round(g.bottom), crowdTop: Math.round(c.top), crowdBottom: Math.round(c.bottom) }; });
      if (t === 0 || t === 4 || t === 9) log.push(tag + ' ' + year + ' fit at 380 wide: Give bottom ' + fit.give + ' px, crowd ' + fit.crowdTop + '–' + fit.crowdBottom + ' px');
      if (fit.give > 700) errors.push(tag + ': Give below 700 px at ' + year);
      if (fit.crowdTop > 640) errors.push(tag + ': crowd not visible with Give at ' + year);
      if (full && (year === 1690 || year === 1692 || year === 1695 || year === 1697 || year === 1699)) await shot(year + '-choose', true);
      if (full && year === 1692) { await page.click('#b-help-play'); await page.waitForTimeout(300); await shot('help', true); await page.click('#b-help-close'); await page.waitForTimeout(200); }
      if (full && (year === 1695 || year === 1698)) { await page.click('#b-book'); await page.waitForTimeout(300); await shot(year + '-collection', true); await hscroll('collection ' + year); log.push(tag + ' ' + year + ' collection: ' + await page.$eval('#bookintro', e => e.innerText) + ' | ' + await page.$eval('#thisw', e => e.innerText)); await page.click('#b-book-close'); await page.waitForTimeout(200); }
      const dis = await page.$eval('#b-book', b => b.disabled); if (year <= 1694 && !dis) errors.push(tag + ': collection live at ' + year); if (year >= 1695 && dis) errors.push(tag + ': collection dead at ' + year);
      if (year === 1694) log.push(tag + ' 1694 book button: ' + await page.$eval('#b-book', e => e.innerText.replace(/\n/g, ' ')));
      const r = await page.evaluate(([pol, t]) => window.MECH.DOCTORS[pol](window.__game, t, window.MECH.rng(99 + t)), [policy, t]);
      const giveDim = await page.$eval('#b-give', b => b.classList.contains('dim')); if (!giveDim) errors.push(tag + ': Give live before a remedy was chosen at ' + year);
      await page.click('#rem button[data-r="' + r + '"]'); await page.waitForTimeout(150);
      if (full && year === 1690) await shot('1690-preview', true);
      await page.click('#b-give'); await page.waitForTimeout(1800);
      const dead = await page.$$eval('#crowd .f.d', els => els.length);
      log.push(tag + ' ' + year + ' gave ' + r + ': ' + dead + ' lying; ' + await say() + ' / ' + await page.$eval('#kept', e => e.innerText.replace(/\n/g, ' ')));
      if (full && (year === 1690 || year === 1692 || year === 1694 || year === 1695 || year === 1697)) { await page.evaluate(() => window.scrollTo(0, 0)); await shot(year + '-result', true); }
      await page.click('#b-next'); await page.waitForTimeout(400);
    }
    await page.waitForTimeout(300); await shot('end', true); await hscroll('end');
    log.push(tag + ' VERDICT: ' + await page.$eval('#s-end', e => e.innerText.replace(/\n+/g, ' / ').slice(0, 1600)));
    if (full) { await page.click('#b-about-end'); await page.waitForTimeout(300); await shot('about', true); await page.click('#b-about-close'); await page.waitForTimeout(200); }
    await page.close();
  }
  await session(42, 'reader', 'a', true);
  await session(7, 'memory', 'b', false);
  const lp = await browser.newPage({ viewport: { width: 1280, height: 640 }, deviceScaleFactor: 1 });
  await lp.goto('file://' + path.resolve(__dirname, 'leibnizs-register.html') + '?seed=42'); await lp.waitForTimeout(500); await lp.click('#b-begin'); await lp.waitForTimeout(300);
  await lp.screenshot({ path: path.join(__dirname, 'screenshot-laptop-1690.png') }); await lp.close();
  await browser.close();
  log.push(errors.length ? 'ERRORS:\n' + errors.join('\n') : 'no page errors, no horizontal scroll');
  fs.writeFileSync(path.join(__dirname, 'session-log.txt'), log.join('\n') + '\n');
  console.log(log.join('\n'));
  process.exit(errors.length ? 1 : 0);
})();
