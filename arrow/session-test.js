// Full sessions in headless Chromium at phone width: a fair-minded game, help opened mid-play, the real Sunday, the debrief, then a game that makes a boss.
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
  const keysOf = (i) => page.evaluate((i) => { const M = window.MECH, r = window.__game().lists[i]; return M.tiers(r).map(t => t.slice().sort().join(',')); }, i);
  const pickList = async (i) => { const keys = await keysOf(i);
    if (await page.locator('#opts1').count()) { await page.click(`#opts1 .opt[data-key="${keys[0]}"]`); await page.waitForTimeout(80); }
    if (keys[1] !== undefined && await page.isVisible('#step2')) { await page.click(`#opts2 .opt[data-key="${keys[1]}"]`); await page.waitForTimeout(80); }
    const sel = await page.evaluate(() => window.__game().sel); if (sel !== i) errors.push('wanted ranking ' + i + ', got ' + sel); };
  await shot('start'); await hscroll('start');
  await page.click('#b-begin'); await page.waitForTimeout(300);
  // game A: a stranger who tries to be fair: one tie each way, then whatever balances
  const picksA = [3, 1, 2];
  for (let k = 0; k < 3; k++) {
    await idle(); await page.waitForTimeout(100);
    const n = await page.evaluate(() => window.__game().lists.length); log.push(`What-if ${k + 1}: ${n} rankings possible; ${await say('lists-note')}`);
    if (n !== 5) errors.push('expected 5 rankings on what-if ' + (k + 1) + ', got ' + n);
    if (k === 0) { if (await page.isEnabled('#b-post')) errors.push('Write enabled before an answer');
      await pickList(0); if (await page.isVisible('#step2')) errors.push('second question shown after a draw at the top'); await shot('a-1-draw');
      await pickList(2); await shot('a-1-annas'); }
    if (k === 1) { await page.click('#q-play'); await page.waitForTimeout(150); await shot('help'); await page.click('#b-help-close'); await page.waitForTimeout(100); }
    await pickList(picksA[k]); await page.waitForTimeout(100); log.push('   answered: ' + await say('say'));
    if (k === 0) await shot('a-1-answered');
    await page.click('#b-post'); await page.waitForTimeout(600); log.push('   ' + await say('res'));
    if (k === 0) await shot('a-1-written'); if (k === 2) await shot('a-3-written');
    await hscroll('what-if ' + (k + 1));
    await page.click('#b-next'); await page.waitForTimeout(250);
  }
  await shot('a-check-empty'); await hscroll('check');
  await page.click('#b-check'); await page.waitForTimeout(1500); await shot('a-check-reading', false);
  await idle(); await page.waitForTimeout(200); log.push('check, first: ' + await say('read') + ' // ' + await say('check-say'));
  await page.click('#q-check'); await page.waitForTimeout(100); await page.click('#b-help-close');
  await page.click('#b-check'); await idle(); await page.waitForTimeout(200); await shot('a-check-done'); log.push('check, done: ' + await say('check-say'));
  const kNo = await page.evaluate(() => window.__game().audit.cells.findIndex(x => !x.list));
  if (kNo >= 0) { await page.click('#sq-' + kNo); await page.waitForTimeout(150); log.push('square ' + kNo + ': ' + await say('read')); await shot('a-check-touched'); }
  await hscroll('check done');
  // Sunday, the real vote
  await page.click('#b-toreal'); await page.waitForTimeout(250); await shot('a-sunday'); await hscroll('sunday');
  await page.click('#b-count'); await page.waitForTimeout(200); await shot('a-sunday-counted'); log.push('SUNDAY: ' + await say('real-out'));
  // force the other outcome for a screenshot
  const other = await page.evaluate(() => { const g = window.__game(), c = g.audit.cells; const want = c[g.real.k].list ? c.findIndex(x => !x.list) : c.findIndex(x => x.list); return want; });
  if (other >= 0) { await page.evaluate((k) => { const g = window.__game(); g.real = { k: k, anna: window.MECH.BALLOTS[Math.floor(k / 6)], beat: window.MECH.BALLOTS[k % 6] }; document.getElementById('b-count').click(); }, other); await page.waitForTimeout(100); log.push('SUNDAY (other case): ' + await say('real-out')); await shot('a-sunday-other'); }
  await page.click('#b-debrief'); await page.waitForTimeout(600); await shot('a-end'); await shot('view-a-end', false); await hscroll('end');
  log.push('END A: ' + await say('v1') + ' | ' + await say('v2') + ' | ' + await say('v3'));
  log.push('MINIS: ' + await say('minis-say'));
  log.push('STRIP: ' + await say('strip'));
  log.push('TRIES: ' + await say('tries') + ' / ' + await say('ring'));
  await page.click('#b-about1'); await page.waitForTimeout(150); await shot('about'); await page.click('#b-about-close');
  // game B: everything Anna's way, second opening
  await page.click('#b-again'); await page.waitForTimeout(300);
  if ((await page.evaluate(() => window.__game().book.filter(x => x).length)) !== 0) errors.push('second game does not start from an empty book');
  await page.evaluate(() => { window.__fast = true; });
  for (let k = 0; k < 3; k++) {
    await idle(); await page.waitForTimeout(80);
    const i = await page.evaluate(() => { const g = window.__game(), M = window.MECH; let best = 0, bs = -1; g.lists.forEach((w, i) => { const s = M.newRulings(g.book, g.nb.anna, g.nb.beat, w).filter(r => r.value === 'A').length; if (s > bs) { bs = s; best = i; } }); return best; });
    await pickList(i); await page.click('#b-post'); await page.waitForTimeout(80); log.push(`B what-if ${k + 1}: ` + await say('res'));
    await page.click('#b-next'); await page.waitForTimeout(80);
  }
  await page.click('#b-check'); await idle(); await page.click('#b-check'); await idle(); await page.waitForTimeout(100); await shot('b-check-done'); log.push('B check: ' + await say('check-say'));
  await page.click('#b-toreal'); await page.waitForTimeout(100); await page.click('#b-count'); await page.waitForTimeout(100); log.push('B SUNDAY: ' + await say('real-out'));
  await page.click('#b-debrief'); await page.waitForTimeout(400); await shot('b-end'); await hscroll('end B');
  log.push('END B: ' + await say('v1') + ' | ' + await say('v2') + ' | ' + await say('v3'));
  const emb = await page.evaluate(() => JSON.stringify(window.MECH.allBooks().hist)); const file = JSON.stringify(require('./mechanism.js').MECH.allBooks().hist);
  if (emb !== file) errors.push('embedded mechanism disagrees with mechanism.js');
  log.push('', errors.length ? 'ERRORS: ' + errors.join(' ; ') : 'no errors, no horizontal scroll at 380 px');
  const txt = log.join('\n'); console.log(txt); require('fs').writeFileSync(path.join(__dirname, 'session-log.txt'), txt + '\n');
  await browser.close(); process.exit(errors.length ? 1 : 0);
})();
