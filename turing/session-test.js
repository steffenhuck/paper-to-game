// Full session in headless Chromium at phone width: fifteen questions judged by a rule of thumb, help opened mid-play,
// the verdict, the convention adopted, screenshots along the way; then a second game judged the other way round, ending
// on a different band of the scale. Fails on any page error or horizontal scroll at 380 px.
const { chromium } = require('playwright');
const path = require('path'); const fs = require('fs');
const main = async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 380, height: 760 }, deviceScaleFactor: 1 });
  const errors = []; page.on('pageerror', e => errors.push(e.message)); page.on('console', m => { if (m.type() === 'error' && !/ERR_TUNNEL_CONNECTION_FAILED|gc\.zgo\.at/.test(m.text())) errors.push(m.text()); }); // the counter script is blocked by the sandbox proxy; not a page error
  const url = 'file://' + path.resolve(__dirname, 'test-it-like-turing.html');
  const log = [];
  const shot = async (n, full) => page.screenshot({ path: path.join(__dirname, 'screenshot-' + n + '.png'), fullPage: !!full });
  const shotOverlay = async (id, n) => { await page.evaluate(id => { const o = document.getElementById(id); o.style.position = 'absolute'; o.style.inset = 'auto'; o.style.top = '0'; o.style.left = '0'; o.style.right = '0'; o.style.overflow = 'visible'; document.body.classList.remove('lock'); document.querySelectorAll('body > .wrap').forEach(w => w.style.display = 'none'); }, id); await page.evaluate(() => window.scrollTo(0, 0)); await shot(n, true); await page.evaluate(id => { const o = document.getElementById(id); o.style.position = ''; o.style.inset = ''; o.style.top = ''; o.style.left = ''; o.style.right = ''; o.style.overflow = ''; document.querySelectorAll('body > .wrap').forEach(w => w.style.display = ''); document.body.classList.add('lock'); }, id); };
  const hscroll = async () => page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
  const hurry = async () => { await page.mouse.click(5, 5); }; // the top-left padding: never a button
  const until = async (sel, ms) => { await page.waitForSelector(sel, { state: 'visible', timeout: ms || 60000 }); await page.waitForTimeout(200); };
  const text = async sel => page.evaluate(s => (document.querySelector(s) || { innerText: '' }).innerText.replace(/\n+/g, ' / '), sel);
  const newLines = async () => page.evaluate(() => [...document.querySelectorAll('#log .ln:not(.old)')].map(x => x.innerText));

  await page.goto(url); await page.waitForTimeout(500);
  await shot('start-typing', false);
  await hurry(); await page.waitForTimeout(400); await shot('start', true);
  if (await hscroll()) errors.push('horizontal scroll on start');
  log.push('START: ' + await text('#start-log'));
  await page.click('#b-help-start'); await page.waitForTimeout(200); await shotOverlay('help', 'help'); await page.click('#b-help-close');

  const playGame = async (tag, chooser, shots) => {
    await hurry(); await until('#pickrow'); if (shots) await shot(`${tag}-1-answers`, true);
    log.push(`${tag} PRELUDE: ` + (await newLines()).slice(0, 3).join(' / '));
    for (let i = 0; i < 15; i++) {
      if (i > 0) { await hurry(); await until('#pickrow'); }
      if (shots && i === 2) { await page.click('#q-play'); await page.waitForTimeout(200); await shotOverlay('help', 'help-mid'); await page.click('#b-help-close'); if (await page.evaluate(() => document.body.classList.contains('lock'))) errors.push('body locked after help'); }
      if (shots && (i === 5 || i === 10)) await shot(`${tag}-${i + 1}-answers`, true);
      const lines = await newLines(); const X = (lines.find(l => /^X: /.test(l)) || '').slice(3), Y = (lines.find(l => /^Y: /.test(l)) || '').slice(3);
      log.push(`${tag} Q${i + 1}: status="${await text('#status')}"\n  ` + lines.filter(l => /^[CXY]: |^> MODULE/.test(l)).join('\n  ').replace(/\n(?![CXY]: |> )/g, ' | '));
      const side = chooser(X, Y);
      await page.click(side === 'X' ? '#b-pick-x' : '#b-pick-y'); await page.waitForTimeout(500); await hurry(); await until('#after');
      if (shots && (i === 0 || i === 5 || i === 10 || i === 14)) await shot(`${tag}-${i + 1}-reveal`, true);
      const after = await newLines(); log.push('  said ' + side + ' -> ' + after.filter(l => /^(RIGHT|WRONG)\./.test(l)).join(' | ') + '\n  STATUS: ' + await text('#status') + ' | button: ' + await text('#b-next'));
      if (await hscroll()) errors.push('horizontal scroll at question ' + (i + 1));
      await page.click('#b-next'); await page.waitForTimeout(300);
    }
    await until('#end-btns'); await hurry(); await page.waitForTimeout(300);
    if (shots) { await page.evaluate(() => window.scrollTo(0, 0)); await shot(`${tag}-end-verdict`, false); await shot(`${tag}-end-full`, true); }
    log.push(`${tag} END: ` + await text('#end-log'));
  };

  await page.click('#b-begin');
  await playGame('A', (X, Y) => X.length < Y.length ? 'X' : 'Y', true);
  if (await hscroll()) errors.push('horizontal scroll at the end');
  await page.click('#b-about'); await page.waitForTimeout(200); await shotOverlay('about', 'about'); await page.click('#b-about-close');

  await page.click('#b-again');
  await playGame('B', (X, Y) => X.length >= Y.length ? 'X' : 'Y', false);
  await shot('B-end', true);

  fs.writeFileSync(path.join(__dirname, 'session-log.txt'), log.join('\n') + '\n\nERRORS: ' + (errors.length ? errors.join('\n') : 'none') + '\n');
  console.log(log.join('\n')); console.log('\nERRORS:', errors.length ? errors : 'none');
  await browser.close();
  process.exit(errors.length ? 1 : 0);
};
main().catch(e => { console.error('SESSION FAILED:', e); fs.writeFileSync(path.join(__dirname, 'session-log.txt'), 'SESSION FAILED: ' + e.stack + '\n'); process.exit(2); });
