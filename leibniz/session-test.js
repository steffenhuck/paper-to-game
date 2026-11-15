// Full session in headless Chromium at phone width (build.md §4.6): the walkthrough of memo §9 (world 1 by hand with one
// misplaced drag and one step back; world 2 taking the big square first and letting it be; world 3 pulling the big square,
// putting it back, pulling the long bar and filling the hole), help opened mid-play and closed, the verdict, the cover
// lifted, About; then Play again with the best play on every world, to its verdict. Drags are real pointer drags; a few
// placements go through the page's API to keep the script short. Errors and horizontal scroll go to session-log.txt.
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 380, height: 760 }, deviceScaleFactor: 1 });
  const errors = [], log = [];
  page.on('pageerror', e => errors.push(e.message)); page.on('console', m => { if (m.type() === 'error' && m.text().indexOf('Failed to load resource') < 0) errors.push(m.text()); });
  await page.goto('file://' + path.resolve(__dirname, 'leibnizs-tiles.html')); await page.waitForTimeout(700);
  const shot = (n, full) => page.screenshot({ path: path.join(__dirname, 'screenshot-' + n + '.png'), fullPage: !!full });
  const shotOverlay = async (id, n) => { await page.evaluate(id => { const o = document.getElementById(id); o.style.position = 'absolute'; o.style.inset = 'auto'; o.style.top = '0'; o.style.left = '0'; o.style.right = '0'; document.querySelector('body > .wrap').style.visibility = 'hidden'; }, id); await page.evaluate(() => window.scrollTo(0, 0)); await shot(n, true); await page.evaluate(id => { const o = document.getElementById(id); o.style.position = ''; o.style.inset = ''; o.style.top = ''; o.style.left = ''; o.style.right = ''; document.querySelector('body > .wrap').style.visibility = ''; }, id); };
  const hscroll = async (where) => { if (await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1)) errors.push('horizontal scroll at ' + where); };
  const say = () => page.$eval('#say', e => e.textContent); const stat = () => page.$eval('#stat', e => e.textContent);
  const geom = async () => { const bb = await (await page.$('#board svg')).boundingBox(); const W = await page.evaluate(() => window.__game.world.W); const cell = (bb.width - 4 * (W + 1)) / W; return { bb, cell, step: cell + 4 }; };
  async function drag(id, r, c, opts) {
    const tp = await page.$('.tray .tp[data-id="' + id + '"]'); const tb = await tp.boundingBox();
    const g = await geom(); const R = await page.evaluate(id => { const p = window.__game.world.pieces[id]; const R = p.rots[p.ri]; return { w: R.w, h: R.h }; }, id);
    const pw = R.w * g.cell + (R.w - 1) * 4, ph = R.h * g.cell + (R.h - 1) * 4;
    const tx = g.bb.x + 4 + c * g.step + pw / 2, ty = g.bb.y + 4 + r * g.step + ph / 2;
    await page.mouse.move(tb.x + tb.width / 2, tb.y + tb.height / 2); await page.mouse.down();
    await page.mouse.move(tx - 30, ty - 30, { steps: 5 }); await page.mouse.move(tx, ty, { steps: 5 }); await page.waitForTimeout(120);
    if (opts && opts.shotWhileDragging) await shot(opts.shotWhileDragging);
    await page.mouse.up(); await page.waitForTimeout(380);
    log.push('drag piece ' + id + ' to (' + r + ',' + c + '): ' + await say() + ' | ' + await stat());
  }
  const tapTray = async (id) => { await page.click('.tray .tp[data-id="' + id + '"]'); await page.waitForTimeout(150); log.push('tap tray ' + id + ': ' + await say()); };
  const pull = async (id) => { await page.click('#board g.piece[data-id="' + id + '"]'); await page.waitForTimeout(350); log.push('pull ' + id + ': ' + await say() + ' | ' + await stat()); };
  const letItBe = async (n) => { await page.click('#b-let'); await page.waitForTimeout(2600); await shot(n, true); log.push('LET IT BE: ' + await page.$eval('#resultarea', e => e.innerText.replace(/\n+/g, ' / '))); };
  const best = async (n) => { await page.click('#resultarea button'); await page.waitForTimeout(2200); await shot(n, true); log.push('BEST: ' + await page.$eval('#resultarea', e => e.innerText.replace(/\n+/g, ' / ')) + ' | intro: ' + await page.$eval('#intro', e => e.textContent)); };
  const next = async () => { await page.click('#resultarea button'); await page.waitForTimeout(500); };

  await shot('start', true); await hscroll('start');
  await page.click('#b-begin'); await page.waitForTimeout(500); await shot('a-1-board'); await hscroll('world 1');
  const fits = await page.evaluate(() => { const r = document.getElementById('b-let').getBoundingClientRect(); return r.bottom <= window.innerHeight; });
  log.push('world 1: Let it be within 760 px without scrolling: ' + fits);
  const fits700 = async (where) => { const ok = await page.evaluate(() => document.getElementById('b-let').getBoundingClientRect().bottom <= 700); log.push(where + ': Let it be within 700 px without scrolling: ' + ok); if (!ok) errors.push('Let it be below 700 px at ' + where); };
  await fits700('world 1');
  // world 1 by hand: rectangle top-left, square under it, bar of two turned upright at the right, bar of three misplaced, L
  await drag(0, 0, 0, { shotWhileDragging: 'a-1-drag' }); await shot('a-1-placed');
  await drag(1, 2, 0);
  await tapTray(4); await drag(4, 0, 3);
  await drag(3, 2, 2); // the bar of three does not fit at (2,2): goes back
  await drag(2, 2, 2); await shot('a-1-nearly');
  await pull(1); await shot('a-1-pulled'); await drag(1, 2, 0);
  await letItBe('a-1-let'); await best('a-1-best'); await next();
  // world 2: the big square first
  await shot('a-2-board'); await hscroll('world 2'); await fits700('world 2');
  await drag(0, 0, 0); await shot('a-2-square');
  await tapTray(1); await drag(1, 0, 3); await tapTray(2); await drag(2, 0, 5);
  await page.click('#q-play'); await page.waitForTimeout(300); await shotOverlay('help', 'help'); await page.click('#b-help-close'); await page.waitForTimeout(200);
  if (await page.evaluate(() => document.body.classList.contains('lock'))) errors.push('body still locked after help');
  await drag(4, 3, 0); await drag(5, 3, 2); await tapTray(3); await drag(3, 4, 2); await drag(6, 4, 4); await shot('a-2-stuck');
  await letItBe('a-2-let'); await best('a-2-best'); await next();
  // world 3: pull the big square, put it back, pull the long bar, fill
  await shot('a-3-board'); await hscroll('world 3'); await fits700('world 3');
  await pull(1); await shot('a-3-pull-square'); await drag(1, 2, 0);
  await pull(2); await shot('a-3-pull-bar');
  await tapTray(4); await drag(4, 2, 3); await drag(5, 5, 0); await tapTray(6); await tapTray(6); await drag(6, 4, 4);
  log.push('world 3 after fill: ' + await stat());
  await shot('a-3-full');
  await letItBe('a-3-let'); await best('a-3-best'); await next();
  await page.waitForTimeout(400); await shot('a-end', true); await hscroll('end');
  log.push('VERDICT: ' + await page.$eval('#s-end', e => e.innerText.split('\n').slice(0, 14).join(' / ')));
  await page.click('#b-lift'); await page.waitForTimeout(1200); await shot('a-end-lifted', true);
  await page.click('#b-about'); await page.waitForTimeout(300); await shotOverlay('about', 'about'); await page.click('#b-about-close');
  // play again: the best play everywhere, through the API, to the verdict
  await page.click('#b-again'); await page.waitForTimeout(500);
  for (let i = 0; i < 3; i++) {
    await page.evaluate(() => { const G = window.__game, w = G.world; if (w.index === 2) G.pull(2); w.best.placement.forEach(pl => { if (!w.pieces[pl.id].placed) { w.pieces[pl.id].ri = pl.ri; G.place(pl.id, pl.r, pl.c); } }); });
    await page.waitForTimeout(200);
    await letItBe('b-' + (i + 1) + '-let'); await best('b-' + (i + 1) + '-best'); await next();
  }
  await page.waitForTimeout(400); await shot('b-end', true);
  log.push('VERDICT B: ' + await page.$eval('#s-end', e => e.innerText.split('\n').slice(0, 10).join(' / ')));
  fs.writeFileSync(path.join(__dirname, 'session-log.txt'), log.join('\n') + '\n\nerrors: ' + (errors.length ? errors.join('\n') : 'none') + '\n');
  console.log(log.join('\n')); console.log('errors:', errors);
  await browser.close();
})();
