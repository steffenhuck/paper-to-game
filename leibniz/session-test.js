// Full session in headless Chromium at phone width (build.md §4.6), on a fixed draw (?seed=42) so the walkthrough can
// read the sky it gets: world 1 by hand with one dark tap and one step back, ending at the best; world 2 taking the
// biggest first and letting it be; world 3 putting the key star out, lighting what it frees, letting it be; the lamp
// dragged in a circle round the big star and on towards the right, then "put the small one out"; the second world
// left; the verdict; About. Then a second draw (seed 43) with heaviest-first on every sky. Errors and horizontal
// scroll go to session-log.txt.
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 380, height: 760 }, deviceScaleFactor: 1 });
  const errors = [], log = [];
  page.on('pageerror', e => errors.push(e.message)); page.on('console', m => { if (m.type() === 'error' && m.text().indexOf('Failed to load resource') < 0) errors.push(m.text()); });
  await page.goto('file://' + path.resolve(__dirname, 'leibnizs-worlds.html') + '?seed=42'); await page.waitForTimeout(700);
  const shot = (n, full) => page.screenshot({ path: path.join(__dirname, 'screenshot-' + n + '.png'), fullPage: !!full });
  const shotOverlay = async (id, n) => { await page.evaluate(id => { const o = document.getElementById(id); o.style.position = 'absolute'; o.style.inset = 'auto'; o.style.top = '0'; o.style.left = '0'; o.style.right = '0'; document.querySelector('body > .wrap').style.visibility = 'hidden'; }, id); await page.evaluate(() => window.scrollTo(0, 0)); await shot(n, true); await page.evaluate(id => { const o = document.getElementById(id); o.style.position = ''; o.style.inset = ''; o.style.top = ''; o.style.left = ''; o.style.right = ''; document.querySelector('body > .wrap').style.visibility = ''; }, id); };
  const hscroll = async (where) => { if (await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1)) errors.push('horizontal scroll at ' + where); };
  const say = () => page.$eval('#say', e => e.textContent); const stat = () => page.$eval('#stat', e => e.textContent);
  const tap = async (id) => { await page.click('#sky .hit[data-id="' + id + '"]'); await page.waitForTimeout(200); log.push('tap ' + id + ': ' + await say() + ' | ' + await stat()); };
  const letItBe = async (n) => { await page.click('#b-let'); await page.waitForTimeout(500); await shot(n, true); log.push('LET IT BE: ' + await say()); };
  const best = async (n) => { await page.click('#b-best'); await page.waitForTimeout(3600); await page.evaluate(() => window.scrollTo(0, 0)); await shot(n, true); log.push('BEST: ' + await page.$eval('#resultarea', e => e.innerText.replace(/\n+/g, ' / '))); };
  const next = async () => { await page.click('#b-next'); await page.waitForTimeout(500); };
  const fits700 = async (where) => { const ok = await page.evaluate(() => document.getElementById('b-let').getBoundingClientRect().bottom <= 700); log.push(where + ': Let it be within 700 px without scrolling: ' + ok); if (!ok) errors.push('Let it be below 700 px at ' + where); };
  const W = async (k) => page.evaluate(k => { const w = window.__game.worlds[k]; return { ids: w.stars.map(s => s.id), lit: w.stars.filter(s => s.status === 'lit').map(s => s.id), best: w.best.ids, key: w.key, pairs: w.pairs, big: w.stars.slice().sort((a, b) => b.w - a.w)[0].id, w: Object.fromEntries(w.stars.map(s => [s.id, s.w])) }; }, k);
  const status = (k, id) => page.evaluate(([k, id]) => window.__game.worlds[k].stars.find(s => s.id === id).status, [k, id]);

  await shot('start', true); await hscroll('start');
  await page.click('#b-begin'); await page.waitForTimeout(500); await shot('a-1-sky'); await hscroll('sky 1'); await fits700('sky 1');
  log.push('seed: ' + await page.evaluate(() => window.__game.seed));
  let w1 = await W(0);
  const disabledAtStart = await page.$eval('#b-let', b => b.disabled); log.push('sky 1: Let it be disabled before any tap: ' + disabledAtStart); if (!disabledAtStart) errors.push('Let it be live before any tap');
  const p = w1.pairs[0], lesser = w1.w[p[0]] < w1.w[p[1]] ? p[0] : p[1], greater = lesser === p[0] ? p[1] : p[0];
  await tap(lesser); await shot('a-1-first'); await tap(greater); await shot('a-1-dark'); await tap(lesser); await shot('a-1-back');
  for (const id of w1.best) if (await status(0, id) !== 'lit') await tap(id);
  await page.click('#b-help-play'); await page.waitForTimeout(300); await shotOverlay('help', 'help'); await page.click('#b-help-close'); await page.waitForTimeout(200);
  await letItBe('a-1-let'); await best('a-1-best'); await next();
  await shot('a-2-sky'); await fits700('sky 2'); let w2 = await W(1); await tap(w2.big); await shot('a-2-big');
  for (const id of w2.ids) if (await status(1, id) === 'wait') await tap(id);
  await shot('a-2-stuck'); await letItBe('a-2-let'); await best('a-2-best'); await next();
  await shot('a-3-sky'); await fits700('sky 3'); let w3 = await W(2);
  await tap(w3.big); await shot('a-3-big-out'); await tap(w3.big); await tap(w3.key); await shot('a-3-key-out');
  for (const id of w3.ids) if (await status(2, id) === 'wait' && id !== w3.key) await tap(id);
  await shot('a-3-full'); await letItBe('a-3-let'); await best('a-3-best'); await next();
  // the torch
  await page.waitForTimeout(400); await shot('a-4-dark'); await hscroll('torch');
  const jfits = await page.evaluate(() => document.getElementById('b-leave').getBoundingClientRect().bottom <= 700); log.push('torch: buttons within 700 px: ' + jfits); if (!jfits) errors.push('torch buttons below 700 px');
  const sb = await (await page.$('#jsky')).boundingBox(); const sx = (x) => sb.x + sb.width * x / 320, sy = (y) => sb.y + sb.height * y / 300;
  const J0 = await page.evaluate(() => { const s = window.__game.judge.skies[0]; const b = s.stars.find(x => x.id === s.big); return { x: b.x, y: b.y, full: s.full }; });
  const fl = await page.evaluate(() => { const m = /translate\(([\d.]+) ([\d.]+)\)/.exec(document.querySelector('#jsky .flame').getAttribute('transform')); return { x: +m[1], y: +m[2] }; });
  await page.mouse.move(sx(fl.x), sy(fl.y)); await page.mouse.down(); await page.mouse.move(sx(J0.x), sy(J0.y), { steps: 8 }); await page.mouse.up(); await page.waitForTimeout(800);
  await shot('a-4-torch'); log.push('TORCH: ' + await page.$eval('#jkey', e => e.textContent));
  await page.waitForTimeout(6500); await shot('a-4-torch-out'); log.push('TORCH OUT: ' + await page.$eval('#jkey', e => e.textContent));
  await page.click('#b-done'); await page.waitForTimeout(300); await shot('a-4-read', true); await page.click('#b-r-lines'); await page.waitForTimeout(300); await shot('a-4-choose', true);
  await page.click('#b-other'); await page.waitForTimeout(1800); await shot('a-4-consequence', true); log.push('CONSEQUENCE: ' + await page.$eval('#jsay', e => e.textContent));
  await page.click('#b-lift'); await page.waitForTimeout(1500); await shot('a-4-lifting'); await page.waitForTimeout(2800); await page.evaluate(() => window.scrollTo(0, 0)); await shot('a-4-lifted', true); log.push('TORCH 1 (full=' + J0.full + '): ' + await page.$eval('#jsay', e => e.textContent));
  await page.click('#b-twin'); await page.waitForTimeout(400); await page.evaluate(() => window.scrollTo(0, 0)); await shot('a-4-twin', true); log.push('TWIN: ' + await page.$eval('#jresult .lesson', e => e.textContent));
  await page.click('#b-jnext'); await page.waitForTimeout(400); await shot('a-end', true); await hscroll('end');
  log.push('VERDICT: ' + await page.$eval('#s-end', e => e.innerText.replace(/\n+/g, ' / ').slice(0, 1600)));
  await page.click('#b-about'); await page.waitForTimeout(300); await shotOverlay('about', 'about'); await page.click('#b-about-close'); await page.waitForTimeout(200);

  // a second draw: heaviest-first everywhere, no torch
  await page.goto('file://' + path.resolve(__dirname, 'leibnizs-worlds.html') + '?seed=43'); await page.waitForTimeout(500); await page.click('#b-begin'); await page.waitForTimeout(400);
  for (let k = 0; k < 3; k++) {
    const w = await W(k); const order = w.ids.slice().sort((a, b) => w.w[b] - w.w[a]);
    for (const id of order) if (await status(k, id) === 'wait') await tap(id);
    await letItBe('b-' + (k + 1) + '-let'); await best('b-' + (k + 1) + '-best'); await next();
  }
  await page.waitForTimeout(400);
  await page.click('#b-done'); await page.waitForTimeout(300); await page.click('#b-r-none'); await page.waitForTimeout(300); await page.click('#b-leave'); await page.waitForTimeout(1200); await page.click('#b-lift'); await page.waitForTimeout(4200); await page.click('#b-twin'); await page.waitForTimeout(400); await page.click('#b-jnext'); await page.waitForTimeout(400);
  await shot('b-end', true);
  log.push('VERDICT B: ' + await page.$eval('#s-end', e => e.innerText.replace(/\n+/g, ' / ').slice(0, 900)));

  fs.writeFileSync(path.join(__dirname, 'session-log.txt'), (errors.length ? 'ERRORS:\n' + errors.join('\n') + '\n\n' : 'no page errors, no horizontal scroll\n\n') + log.join('\n') + '\n');
  await browser.close();
  console.log(errors.length ? 'ERRORS: ' + errors.join(' | ') : 'session ok'); console.log(log.slice(0, 40).join('\n'));
})();
