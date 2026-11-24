// Full session in headless Chromium at phone width (build.md §4.6), revision 2: the stranger's session (a ban-heavy page in
// the phones quarrel, a mirrored page in the short quarrel, the mirror of counts in the uneven quarrel), with help
// opened and closed mid-play and every tool exercised; then a second game played clean (every page one nobody can place)
// and a third played as a partisan; a laptop window last. Errors and horizontal scroll go to session-log.txt.
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 380, height: 760 }, deviceScaleFactor: 1 });
  const errors = [], log = [];
  page.on('pageerror', e => errors.push(e.message)); page.on('console', m => { if (m.type() === 'error' && m.text().indexOf('Failed to load resource') < 0) errors.push(m.text()); });
  await page.goto('file://' + path.resolve(__dirname, 'leibnizs-even-hand.html')); await page.waitForTimeout(600);
  const shot = (n, full) => page.screenshot({ path: path.join(__dirname, 'screenshot-' + n + '.png'), fullPage: !!full });
  const hscroll = async (where) => { if (await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1)) errors.push('horizontal scroll at ' + where); };
  const txt = (sel) => page.$eval(sel, e => e.textContent.trim());
  const add = async (id, kind) => { await page.click('.card[data-id="' + id + '"][data-kind="' + kind + '"]'); await page.waitForTimeout(80); };
  const act = async (i, a) => { await page.evaluate(([i, a]) => window.__api.act(i, a), [i, a]); await page.waitForTimeout(80); };
  const publish = async (tag) => {
    const b = await page.evaluate(() => document.getElementById('b-publish').getBoundingClientRect().bottom); log.push('  publish bottom at ' + Math.round(b) + ' px, enabled: ' + !(await page.$eval('#b-publish', e => e.disabled)));
    await page.click('#b-publish'); await page.waitForTimeout(900); await shot(tag + '-reading'); await page.waitForTimeout(4200); await shot(tag + '-placards', true);
    const r = await page.evaluate(() => window.__api.last()); log.push('  PUBLISHED ' + tag + ': ' + r.statement + ' | caught: ' + r.caught.join(',') + ' | now: ' + await txt('#rnow') + ' | buttons: ' + await page.$$eval('#rbtns .btn', es => es.map(e => e.textContent).join(',')));
    if (await page.$('#b-revise')) errors.push('a Revise button appeared at ' + tag);
    return r;
  };
  const pageWords = async () => page.$$eval('#page .ln:not(.empty)', es => es.map(e => e.className.replace(/ln |sel/g, '').trim() + ':' + e.textContent.slice(0, 22)).join(' / '));

  await shot('start', true); await hscroll('start');
  await page.click('#b-help-start'); await page.waitForTimeout(300); await shot('help', true); await page.click('#help [data-close]'); await page.waitForTimeout(200);
  await page.click('#b-begin'); await page.waitForTimeout(300); await shot('stance'); await hscroll('stance');
  log.push('stance: ' + await txt('#stq') + ' | ' + await txt('#b-st0') + ' / ' + await txt('#b-st1') + ' / ' + await txt('#b-st2'));
  await page.click('#b-st0'); await page.waitForTimeout(300); await hscroll('write 1'); await shot('a-1-empty'); await shot('a-1-empty-full', true);
  log.push('write 1: ' + await txt('#wno') + ' | ' + await txt('#now') + ' | ' + await txt('#bt'));
  // the ban-heavy page of memo §9, with every tool tried on the way
  await add('b1', 'reason'); log.push('  after b1: ' + await txt('#say'));
  await add('b1', 'reply'); log.push('  after b1 reply: ' + await txt('#say'));
  await add('b2', 'reason'); await add('p1', 'reason'); await add('p1', 'reply'); await add('b3', 'reason');
  await add('b3', 'reply'); log.push('  b3 reply on a full page: ' + await txt('#say'));
  await add('b1', 'reason'); log.push('  b1 again: ' + await txt('#say'));
  await act(2, 'form'); log.push('  b2 short: ' + await txt('#say'));
  await act(2, 'form'); log.push('  b2 full again: ' + await txt('#say'));
  await act(0, 'up'); log.push('  up at top: ' + await txt('#say'));
  await act(3, 'down'); log.push('  down: ' + await txt('#say'));
  await act(3, 'up'); log.push('  up: ' + await txt('#say'));
  await act(1, 'form'); log.push('  form on a reply: ' + await txt('#say'));
  await act(5, 'off'); log.push('  off b3: ' + await txt('#say'));
  await add('b3', 'reason'); log.push('  b3 back: ' + await txt('#say'));
  await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(100); await shot('a-1-page'); log.push('  page: ' + await pageWords() + ' | ' + await txt('#bt') + ' | now: ' + await txt('#now'));
  await page.click('#page .ln[data-i="2"]'); await page.waitForTimeout(150); await shot('a-1-selected'); log.push('  selected line 2; tools: ' + await page.$$eval('#tools .t', es => es.map(e => e.textContent).join(' ')));
  await page.click('#page .ln[data-i="2"]'); await page.waitForTimeout(100);
  const r1 = await publish('a-1');
  if (r1.couldTell !== 8) errors.push('the ban-heavy page should be placed by all eight');
  if ((await page.$$('#bench .seat')).length !== 8) errors.push('the bench should seat eight readers');
  log.push('  bench placards: ' + await page.$$eval('#bench .plac div', es => es.map(e => e.textContent + (e.classList.contains('up') ? '' : '(down)')).join(' ')));
  log.push('  readers: ' + r1.readers.map(x => x.text).join(' || '));
  await page.click('#b-help-read'); await page.waitForTimeout(200); await page.click('#help [data-close]'); await page.waitForTimeout(200); log.push('  help opened and closed on the reading screen; statement still: ' + await txt('#rstate'));
  await page.click('#b-next'); await page.waitForTimeout(300);
  // quarrel 2: dogs or cats, six lines, mirrored: one reason each in full, both answers, reasons first
  log.push('stance 2: ' + await txt('#stq')); await page.click('#b-st1'); await page.waitForTimeout(300); await hscroll('write 2'); await shot('a-2-empty');
  log.push('write 2: ' + await txt('#now') + ' | ' + await txt('#bt'));
  await add('d1', 'reason'); await add('c1', 'reason'); await add('d2', 'reason'); await add('d1', 'reply'); log.push('  reply on a full page: ' + await txt('#say'));
  await act(2, 'off'); await add('d1', 'reply'); await add('c1', 'reply'); await act(3, 'up'); await page.evaluate(() => window.scrollTo(0, 0)); await shot('a-2-page'); log.push('  page: ' + await pageWords());
  const r2 = await publish('a-2'); if (r2.couldTell !== 0) errors.push('quarrel 2 page should be clean');
  await page.click('#b-next'); await page.waitForTimeout(300);
  // quarrel 3: the office, uneven: the mirror of counts, which the gaps catch
  log.push('stance 3: ' + await txt('#stq')); await page.click('#b-st2'); await page.waitForTimeout(300); await hscroll('write 3'); await shot('a-3-empty-full', true);
  await add('s1', 'reason'); await add('k1', 'reason'); await add('s2', 'reason'); await add('k2', 'reason');
  for (let i = 0; i < 4; i++) await act(i, 'form');
  await add('k1', 'reply'); await add('s1', 'reply'); await add('k2', 'reply'); await add('s2', 'reply'); await page.evaluate(() => window.scrollTo(0, 0)); await shot('a-3-page'); log.push('  page: ' + await pageWords());
  const r3 = await publish('a-3'); if (r3.caught.join() !== 'leftout') errors.push('quarrel 3 mirror of counts should be caught by the left-out readers alone: ' + r3.caught.join());
  await hscroll('reading'); await page.click('#b-next'); await page.waitForTimeout(400); await hscroll('end'); await shot('a-end', true);
  log.push('END: ' + await txt('#vhead')); log.push('  found: ' + await page.$$eval('#vfound p', es => es.map(e => e.textContent).join(' // '))); log.push('  stood: ' + await page.$$eval('#vstood p', es => es.map(e => e.textContent).join(' // ')));
  log.push('  part: ' + await txt('#vpart')); log.push('  had: ' + await txt('#vhad'));
  await page.click('#b-about'); await page.waitForTimeout(300); await shot('about', true); await page.click('#about [data-close]'); await page.waitForTimeout(200);

  // session B: clean, by the mirror with the ends split; in the uneven quarrel one office reason brief with three home reasons brief and every reply
  await page.click('#b-again'); await page.waitForTimeout(300);
  const clean = [
    [0, [['b1', 'reason'], ['p1', 'reason'], ['b2', 'reason'], ['p2', 'reason'], ['p1', 'reply'], ['b1', 'reply'], ['p2', 'reply'], ['b2', 'reply']], [[0, 'form'], [1, 'form']]],
    [1, [['d1', 'reason'], ['c1', 'reason'], ['c1', 'reply'], ['d1', 'reply']], []],
    [null, [['s1', 'reason'], ['s2', 'reason'], ['s3', 'reason'], ['k1', 'reason'], ['k1', 'reply'], ['s1', 'reply'], ['s2', 'reply'], ['s3', 'reply']], [[0, 'form'], [1, 'form'], [2, 'form'], [3, 'form']]]
  ];
  for (let k = 0; k < 3; k++) {
    await page.evaluate(s => window.__api.stance(s), clean[k][0]); await page.waitForTimeout(200);
    const briefs = clean[k][2].map(x => x[0]);
    for (const [id, kind] of clean[k][1]) { await add(id, kind); const n = await page.evaluate(() => window.__game.page.length); const it = await page.evaluate(() => window.__game.page[window.__game.page.length - 1]); if (kind === 'reason' && briefs.indexOf(n - 1) >= 0 && it.form === 'full') await act(n - 1, 'form'); }
    const d = await publish('b-' + (k + 1)); log.push('B quarrel ' + (k + 1) + ': ' + d.statement + ' | ' + d.readers.map(x => x.sum).filter((x, i) => i % 2 === 0).join(' | '));
    if (d.couldTell !== 0) errors.push('B quarrel ' + (k + 1) + ' should be clean: ' + d.readers.map(x => x.text).join(' || '));
    await page.click('#b-next'); await page.waitForTimeout(300);
  }
  await shot('b-end', true); log.push('B END: ' + await txt('#vhead') + ' | ' + await txt('#vpart'));
  // session C: the partisan, for side 0 every time, declared for side 1
  await page.click('#b-again'); await page.waitForTimeout(300);
  for (let k = 0; k < 3; k++) {
    await page.evaluate(() => window.__api.stance(1)); await page.waitForTimeout(150);
    const ids = await page.evaluate(() => quarrel(window.__game).reasons.map(r => [r.id, r.side]));
    for (const [id, s] of ids) if (s === 0) await add(id, 'reason');
    for (const [id, s] of ids) if (s === 1) { await add(id, 'reason'); const n = await page.evaluate(() => window.__game.page.length); const it = await page.evaluate(() => window.__game.page[window.__game.page.length - 1]); if (it && it.id === id && it.form === 'full') await act(n - 1, 'form'); await add(id, 'reply'); }
    await publish('c-' + (k + 1)); await page.click('#b-next'); await page.waitForTimeout(300);
  }
  await shot('c-end', true); log.push('C END: ' + await txt('#vhead') + ' | stood: ' + await page.$$eval('#vstood p', es => es.map(e => e.textContent).join(' // ')));
  // laptop
  await page.setViewportSize({ width: 1280, height: 720 }); await page.click('#b-again'); await page.waitForTimeout(200); await page.click('#b-st0'); await page.waitForTimeout(200); await add('b1', 'reason'); await shot('laptop-write'); await hscroll('laptop');
  await browser.close();
  fs.writeFileSync(path.join(__dirname, 'session-log.txt'), log.join('\n') + '\n\nERRORS: ' + (errors.length ? errors.join('\n') : 'none') + '\n');
  console.log(log.join('\n')); console.log('\nERRORS:', errors.length ? errors : 'none');
  process.exit(errors.length ? 1 : 0);
})();
