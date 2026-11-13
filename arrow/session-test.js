// Full sessions in headless Chromium at phone width: a fair-minded game, help opened mid-play, a second game that makes a boss, screenshots.
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 380, height: 760 }, deviceScaleFactor: 2 });
  const errors = []; page.on('pageerror', e => errors.push(e.message)); page.on('console', m => { if (m.type() === 'error' && !/goatcounter|gc\.zgo|ERR_FAILED|net::/.test(m.text())) errors.push(m.text()); });
  await page.route(/gc\.zgo\.at/, r => r.abort());
  await page.goto('file://' + path.resolve(__dirname, 'voting-with-arrow.html')); await page.waitForTimeout(800);
  const shot = async (n, full = true) => page.screenshot({ path: path.join(__dirname, 'screenshot-' + n + '.png'), fullPage: full });
  const hscroll = async (w) => { if (await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1)) errors.push('horizontal scroll at ' + w); };
  const idle = async () => page.waitForFunction(() => !window.__game().busy, null, { timeout: 20000 });
  const log = []; const say = async (id) => (await page.evaluate((id) => document.getElementById(id).innerText.replace(/\n+/g, ' / '), id));
  await shot('start'); await hscroll('start');
  await page.click('#b-begin'); await page.waitForTimeout(1200); await shot('a-1-reading', false);
  // game A: a stranger who tries to be fair. picks[k] = index of the card touched on Sunday k+1
  const picksA = [3, 1, 2, 0, 0];
  for (let k = 0; k < 5; k++) {
    await idle(); await page.waitForTimeout(150);
    const n = await page.evaluate(() => window.__game().lists.length); log.push(`Sunday ${k + 1}: ${n} list(s) on offer; ${await say('lists-note')}`);
    if (k === 0) { await shot('a-1-ready'); if (await page.isEnabled('#b-post')) errors.push('Post enabled before a ranking is touched'); }
    const pickList = async (i) => { const keys = await page.evaluate((i) => { const M = window.MECH, r = window.__game().lists[i]; return M.tiers(r).map(t => t.slice().sort().join(',')); }, i); await page.click(`#opts1 .opt[data-key="${keys[0]}"]`); await page.waitForTimeout(80); if (keys[1] !== undefined && await page.isVisible('#step2')) { await page.click(`#opts2 .opt[data-key="${keys[1]}"]`); await page.waitForTimeout(80); } };
    if (k === 0) { await pickList(2); await page.waitForTimeout(100); await shot('a-1-preview-annas'); }
    if (k === 1) { await page.click('#q-play'); await page.waitForTimeout(150); await shot('help'); await page.click('#b-help-close'); await page.waitForTimeout(100); }
    if (k === 3) await shot('a-4-one-list');
    await pickList(Math.min(picksA[k], n - 1)); await page.waitForTimeout(100);
    if (!(await page.isEnabled('#b-post'))) errors.push('Post not enabled after both answers on Sunday ' + (k + 1));
    log.push('   touched: ' + await say('say'));
    if (k === 0) await shot('a-1-preview');
    if (k === 2) await shot('a-3-preview');
    await page.click('#b-post'); await page.waitForTimeout(700);
    log.push('   ' + await say('res'));
    if (k === 0) await shot('a-1-posted');
    if (k === 3) await shot('a-4-posted');
    if (k === 4) await shot('a-5-posted');
    await hscroll('sunday ' + (k + 1));
    await page.click('#b-next'); await page.waitForTimeout(250);
  }
  await shot('a-check-empty'); await hscroll('check');
  await page.click('#b-check'); await page.waitForTimeout(1500); await shot('a-check-reading', false);
  await idle(); await page.waitForTimeout(200); await shot('a-check-first'); log.push('check, first: ' + await say('read') + ' // ' + await say('check-say'));
  await page.click('#q-check'); await page.waitForTimeout(100); await page.click('#b-help-close');
  await page.click('#b-check'); await page.waitForTimeout(900); await shot('a-check-running', false);
  await idle(); await page.waitForTimeout(200); await shot('a-check-done'); log.push('check, done: ' + await say('check-say'));
  // touch a square with a list and one without
  const ks = await page.evaluate(() => { const c = window.__game().audit.cells; return [c.findIndex(x => x.list && !x.isAnnas && !x.isBeats), c.findIndex(x => x.isAnnas && !x.isBeats), c.map((x, i) => x.list ? -1 : i).filter(i => i >= 0).pop()]; });
  for (const k of ks) { if (k < 0) continue; await page.click('#sq-' + k); await page.waitForTimeout(150); log.push(`square ${k}: ` + await say('read')); }
  await shot('a-check-touched'); await hscroll('check done');
  // hire a tie-breaker: Clara, Clara with another ballot, then Anna
  await page.click('#b-tohire'); await page.waitForTimeout(250); await shot('a-hire-empty');
  if (await page.isVisible('#b-verdict')) errors.push('verdict offered before any tie-breaker was tried');
  await page.click('#h-C'); await page.waitForTimeout(100); await shot('a-hire-clara-picked');
  await page.click('#b-hire'); await idle(); await page.waitForTimeout(500); await shot('a-hire-clara'); log.push('HIRE Clara: ' + await say('hire-say') + ' // ' + await say('hread'));
  await page.click('.chip[data-i="3"]'); await page.waitForTimeout(100); await page.click('#b-hire'); await idle(); await page.waitForTimeout(300); log.push('HIRE Clara, other ballot: ' + await say('hire-say'));
  await page.click('#q-hire'); await page.waitForTimeout(100); await page.click('#b-help-close');
  await page.click('#h-A'); await page.click('#b-hire'); await idle(); await page.waitForTimeout(500); await shot('a-hire-anna'); log.push('HIRE Anna: ' + await say('hire-say')); await hscroll('hire');
  await page.click('#b-verdict'); await page.waitForTimeout(300); await shot('a-end'); await shot('view-a-end', false); await hscroll('end');
  log.push('END A: ' + await say('v1') + ' | ' + await say('v2') + ' | ' + await say('v3'));
  await page.click('#b-about1'); await page.waitForTimeout(150); await shot('about'); await page.click('#b-about-close');
  // game B: everything Anna's way (second opening)
  await page.click('#b-again'); await page.waitForTimeout(300);
  if ((await page.evaluate(() => window.__game().book.filter(x => x).length)) !== 0) errors.push('second game does not start from an empty rule book');
  await page.evaluate(() => { window.__fast = true; });
  for (let k = 0; k < 5; k++) {
    await idle(); await page.waitForTimeout(80);
    const i = await page.evaluate(() => { const g = window.__game(), M = window.MECH; let best = 0, bs = -1; g.lists.forEach((w, i) => { const s = M.newRulings(g.book, g.nb.anna, g.nb.beat, w).filter(r => r.value === 'A').length; if (s > bs) { bs = s; best = i; } }); return best; });
    if (k === 0) await shot('b-1-ready');
    { const keys = await page.evaluate((i) => { const M = window.MECH, r = window.__game().lists[i]; return M.tiers(r).map(t => t.slice().sort().join(',')); }, i); await page.click(`#opts1 .opt[data-key="${keys[0]}"]`); if (keys[1] !== undefined && await page.isVisible('#step2')) await page.click(`#opts2 .opt[data-key="${keys[1]}"]`); }
    await page.click('#b-post'); await page.waitForTimeout(80);
    log.push(`B Sunday ${k + 1}: ` + await say('res'));
    if (k === 4) await shot('b-5-posted');
    await page.click('#b-next'); await page.waitForTimeout(80);
  }
  await page.click('#b-check'); await idle(); await shot('b-check-first'); log.push('B check, first: ' + await say('read') + ' // ' + await say('check-say'));
  await page.click('#b-check'); await idle(); await page.waitForTimeout(100); await shot('b-check-done'); log.push('B check, done: ' + await say('check-say'));
  await page.click('#b-tohire'); await page.waitForTimeout(100); await page.click('#h-A'); await page.click('#b-hire'); await idle(); log.push('B HIRE Anna: ' + await say('hire-say'));
  await page.click('#b-verdict'); await page.waitForTimeout(200); await shot('b-end'); await hscroll('end B');
  log.push('END B: ' + await say('v1') + ' | ' + await say('v2') + ' | ' + await say('v3'));
  // the embedded mechanism answers as the file does
  const emb = await page.evaluate(() => JSON.stringify(window.MECH.allBooks().hist)); const file = JSON.stringify(require('./mechanism.js').MECH.allBooks().hist);
  if (emb !== file) errors.push('embedded mechanism disagrees with mechanism.js');
  log.push('', errors.length ? 'ERRORS: ' + errors.join(' ; ') : 'no errors, no horizontal scroll at 380 px');
  const txt = log.join('\n'); console.log(txt); require('fs').writeFileSync(path.join(__dirname, 'session-log.txt'), txt + '\n');
  await browser.close(); process.exit(errors.length ? 1 : 0);
})();
