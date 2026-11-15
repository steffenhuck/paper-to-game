// Full session in headless Chromium at phone width (build.md §4.6): sky 1 by hand with one dark tap and one step back;
// sky 2 taking the coral star first and letting it be; sky 3 putting the coral star out, back in, then the amber star out
// and letting it be; help opened mid-play and closed; the verdict; About. Then Play again with the best play on every sky.
// Taps are real clicks on the stars. Errors and horizontal scroll go to session-log.txt.
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 380, height: 760 }, deviceScaleFactor: 1 });
  const errors = [], log = [];
  page.on('pageerror', e => errors.push(e.message)); page.on('console', m => { if (m.type() === 'error' && m.text().indexOf('Failed to load resource') < 0) errors.push(m.text()); });
  await page.goto('file://' + path.resolve(__dirname, 'leibnizs-worlds.html')); await page.waitForTimeout(700);
  const shot = (n, full) => page.screenshot({ path: path.join(__dirname, 'screenshot-' + n + '.png'), fullPage: !!full });
  const shotOverlay = async (id, n) => { await page.evaluate(id => { const o = document.getElementById(id); o.style.position = 'absolute'; o.style.inset = 'auto'; o.style.top = '0'; o.style.left = '0'; o.style.right = '0'; document.querySelector('body > .wrap').style.visibility = 'hidden'; }, id); await page.evaluate(() => window.scrollTo(0, 0)); await shot(n, true); await page.evaluate(id => { const o = document.getElementById(id); o.style.position = ''; o.style.inset = ''; o.style.top = ''; o.style.left = ''; o.style.right = ''; document.querySelector('body > .wrap').style.visibility = ''; }, id); };
  const hscroll = async (where) => { if (await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1)) errors.push('horizontal scroll at ' + where); };
  const say = () => page.$eval('#say', e => e.textContent); const stat = () => page.$eval('#stat', e => e.textContent);
  const tap = async (id) => { await page.click('#sky .hit[data-id="' + id + '"]'); await page.waitForTimeout(200); log.push('tap ' + id + ': ' + await say() + ' | ' + await stat()); };
  const letItBe = async (n) => { await page.click('#b-let'); await page.waitForTimeout(2800); await shot(n, true); log.push('LET IT BE: ' + await page.$eval('#resultarea', e => e.innerText.replace(/\n+/g, ' / '))); };
  const best = async (n) => { await page.click('#b-best'); await page.waitForTimeout(3000); await page.evaluate(() => window.scrollTo(0, 0)); await shot(n, true); log.push('BEST: ' + await page.$eval('#resultarea', e => e.innerText.replace(/\n+/g, ' / '))); };
  const next = async () => { await page.click('#b-next'); await page.waitForTimeout(500); };
  const fits700 = async (where) => { const ok = await page.evaluate(() => document.getElementById('b-let').getBoundingClientRect().bottom <= 700); log.push(where + ': Let it be within 700 px without scrolling: ' + ok); if (!ok) errors.push('Let it be below 700 px at ' + where); };

  await shot('start', true); await hscroll('start');
  await page.click('#b-begin'); await page.waitForTimeout(500); await shot('a-1-sky'); await hscroll('sky 1'); await fits700('sky 1');
  await tap('amber'); await shot('a-1-amber'); await tap('mint'); await shot('a-1-dark'); await tap('amber'); await shot('a-1-back'); await tap('mint'); await tap('coral'); await tap('rose');
  await page.click('#b-help-play'); await page.waitForTimeout(300); await shotOverlay('help', 'help'); await page.click('#b-help-close'); await page.waitForTimeout(200);
  await letItBe('a-1-let'); await best('a-1-best'); await next();
  await shot('a-2-sky'); await fits700('sky 2'); await tap('coral'); await shot('a-2-coral'); await tap('rose'); await tap('ice'); await shot('a-2-stuck'); await letItBe('a-2-let'); await best('a-2-best'); await next();
  await shot('a-3-sky'); await fits700('sky 3'); await tap('coral'); await shot('a-3-coral-out'); await tap('coral'); await tap('amber'); await shot('a-3-amber-out'); await tap('mint'); await shot('a-3-mint'); await letItBe('a-3-let'); await best('a-3-best'); await next();
  await page.waitForTimeout(400); await shot('a-4-window'); await hscroll('window 1');
  const jfits = await page.evaluate(() => document.getElementById('b-unsure').getBoundingClientRect().bottom <= 700); log.push('window: buttons within 700 px: ' + jfits); if (!jfits) errors.push('window buttons below 700 px');
  await page.click('#b-short'); await page.waitForTimeout(400); await shot('a-4-wide'); log.push('WIDE 1: ' + await page.$eval('#jsay', e => e.textContent));
  await page.click('#b-full'); await page.waitForTimeout(600); await page.evaluate(() => window.scrollTo(0, 0)); await shot('a-4-lifted', true); log.push('WINDOW 1: ' + await page.$eval('#jsay', e => e.textContent));
  await page.click('#b-jnext'); await page.waitForTimeout(400); await shot('a-4-window-2');
  await page.click('#b-unsure'); await page.waitForTimeout(400); await shot('a-4-wide-2');
  await page.click('#b-short'); await page.waitForTimeout(600); await page.evaluate(() => window.scrollTo(0, 0)); await shot('a-4-lifted-2', true); log.push('WINDOW 2: ' + await page.$eval('#jsay', e => e.textContent) + ' / ' + await page.$eval('#jresult h3', e => e.textContent));
  await page.click('#b-jnext'); await page.waitForTimeout(400); await shot('a-end', true); await hscroll('end');
  log.push('VERDICT: ' + await page.$eval('#s-end', e => e.innerText.replace(/\n+/g, ' / ').slice(0, 1500)));
  await page.click('#b-about'); await page.waitForTimeout(300); await shotOverlay('about', 'about'); await page.click('#b-about-close'); await page.waitForTimeout(200);

  // best play on every sky
  await page.click('#b-again'); await page.waitForTimeout(500);
  await tap('coral'); await tap('amber'); await tap('rose'); await letItBe('b-1-let'); await best('b-1-best'); await next();
  await tap('amber'); await tap('mint'); await tap('azure'); await tap('lilac'); await tap('rose'); await shot('b-2-full'); await letItBe('b-2-let'); await best('b-2-best'); await next();
  await tap('amber'); await letItBe('b-3-let'); await best('b-3-best'); await next();
  await page.waitForTimeout(400); await page.click('#b-unsure'); await page.waitForTimeout(300); await page.click('#b-full'); await page.waitForTimeout(500); await page.click('#b-jnext'); await page.waitForTimeout(400); await page.click('#b-unsure'); await page.waitForTimeout(300); await page.click('#b-short'); await page.waitForTimeout(500); await page.click('#b-jnext'); await page.waitForTimeout(400); await shot('b-end', true);
  log.push('VERDICT B: ' + await page.$eval('#s-end', e => e.innerText.replace(/\n+/g, ' / ').slice(0, 800)));

  fs.writeFileSync(path.join(__dirname, 'session-log.txt'), (errors.length ? 'ERRORS:\n' + errors.join('\n') + '\n\n' : 'no page errors, no horizontal scroll\n\n') + log.join('\n') + '\n');
  await browser.close();
  console.log(errors.length ? 'ERRORS: ' + errors.join(' | ') : 'session ok'); console.log(log.slice(0, 40).join('\n'));
})();
