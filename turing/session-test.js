// Full session in headless Chromium at phone width: five rounds with the stranger's picks, help opened mid-play, both
// checks beyond words, the convention adopted, screenshots along the way; then a second game with the opposite picks and
// a solipsist ending. Fails on any page error or horizontal scroll at 380 px.
const { chromium } = require('playwright');
const path = require('path'); const fs = require('fs');
const main = async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 380, height: 760 }, deviceScaleFactor: 1 });
  const errors = []; page.on('pageerror', e => errors.push(e.message)); page.on('console', m => { if (m.type() === 'error' && !/ERR_TUNNEL_CONNECTION_FAILED|gc\.zgo\.at/.test(m.text())) errors.push(m.text()); }); // the counter script is blocked by the sandbox proxy; not a page error
  const url = 'file://' + path.resolve(__dirname, 'turings-witnesses.html');
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

  const playGame = async (tag, crits, chooser, shots) => {
    await until('#form'); if (shots) await shot(`${tag}-1-form`, true);
    log.push(`${tag} PRELUDE: ` + (await newLines()).slice(0, 3).join(' / '));
    for (let i = 0; i < 5; i++) {
      if (shots && i === 2) { await page.click('#q-play'); await page.waitForTimeout(200); await shotOverlay('help', 'help-mid'); await page.click('#b-help-close'); if (await page.evaluate(() => document.body.classList.contains('lock'))) errors.push('body locked after help'); }
      await page.click(`#crit .tick[data-key=${crits[i]}]`); await page.waitForTimeout(100);
      if (shots && i === 0) await shot(`${tag}-1-ticked`, true);
      log.push(`${tag} ROUND ${i + 1}: status="${await text('#status')}" went by ${crits[i]}; send=${await page.evaluate(() => document.getElementById('b-send').className)}`);
      await page.click('#b-send'); await page.waitForTimeout(900);
      if (shots && i < 2) await shot(`${tag}-${i + 1}-arriving`, false);
      await hurry(); await until('#pickrow'); if (shots) await shot(`${tag}-${i + 1}-answers`, true);
      const lines = await newLines(); const X = lines.find(l => /^X: /.test(l)) || '', Y = lines.find(l => /^Y: /.test(l)) || '';
      log.push('  ' + lines.filter(l => /^[CXY]: /.test(l)).join('\n  ').replace(/\n(?![CXY]: )/g, ' | '));
      const side = chooser(X, Y);
      await page.click(side === 'X' ? '#b-pick-x' : '#b-pick-y'); await page.waitForTimeout(600); await hurry();
      if (i < 4) { await until('#after'); } else { await until('#beyondrow'); }
      if (shots) await shot(`${tag}-${i + 1}-reveal`, true);
      const after = await newLines(); log.push('  picked ' + side + ' -> ' + after.filter(l => /^REVEAL|was the machine|You went by/.test(l)).join(' | ') + '\n  STATUS: ' + await text('#status'));
      if (await hscroll()) errors.push('horizontal scroll in round ' + (i + 1));
      if (i < 4) { await page.click('#b-next'); await page.waitForTimeout(300); }
    }
    for (const k of tag === 'A' ? ['open', 'be'] : ['be', 'open']) {
      await page.click(`#beyond .btn[data-key=${k}]`); await page.waitForTimeout(600); await hurry();
      if (k === (tag === 'A' ? 'open' : 'be')) { await until('#beyondrow'); if (shots) await shot(`${tag}-5-${k}`, true); } else { await until('#after'); if (shots) await shot(`${tag}-5-${k}`, true); }
      log.push(`  BEYOND ${k}: ` + (await newLines()).filter(l => /^RESULT|^Turing, on this/.test(l)).join(' | '));
    }
    log.push('  verdict button: ' + await text('#b-next'));
    await page.click('#b-next'); await until('#conv'); await hurry(); await page.waitForTimeout(300);
    if (shots) { await page.evaluate(() => window.scrollTo(0, 0)); await shot(`${tag}-end-verdict`, false); await shot(`${tag}-end-full`, true); }
    log.push(`${tag} END: ` + await text('#end-log'));
  };

  await page.click('#b-begin');
  await playGame('A', ['feel', 'wrong', 'surprise', 'feel', 'sound'], (X, Y) => X.length <= Y.length ? 'X' : 'Y', true);
  await page.click('#cands .tick[data-key=B]'); await page.click('#cands .tick[data-key=A]'); await page.click('#grounds .tick[data-key=polite]'); await page.waitForTimeout(100);
  await shot('A-end-convention-set', true);
  await page.click('#b-adopt'); await page.waitForTimeout(600); await hurry(); await until('#end-btns'); await shot('A-end-readback', true);
  log.push('A READBACK: ' + await text('#read-log'));
  if (await hscroll()) errors.push('horizontal scroll at the end');
  await page.click('#b-about'); await page.waitForTimeout(200); await shotOverlay('about', 'about'); await page.click('#b-about-close');

  await page.click('#b-again');
  await playGame('B', ['sound', 'sound', 'limits', 'limits', 'feel'], (X, Y) => X.length > Y.length ? 'X' : 'Y', false);
  await page.click('#grounds .tick[data-key=does]'); await page.click('#b-adopt'); await hurry(); await until('#end-btns'); await shot('B-end', true);
  log.push('B READBACK: ' + await text('#read-log'));

  fs.writeFileSync(path.join(__dirname, 'session-log.txt'), log.join('\n') + '\n\nERRORS: ' + (errors.length ? errors.join('\n') : 'none') + '\n');
  console.log(log.join('\n')); console.log('\nERRORS:', errors.length ? errors : 'none');
  await browser.close();
  process.exit(errors.length ? 1 : 0);
};
main().catch(e => { console.error('SESSION FAILED:', e); fs.writeFileSync(path.join(__dirname, 'session-log.txt'), 'SESSION FAILED: ' + e.stack + '\n'); process.exit(2); });
