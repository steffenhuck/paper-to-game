// Full session in headless Chromium at phone width: the stranger's six tests from the memo (section 9), help opened
// mid-play, the convention adopted, screenshots along the way; then a second game that never leaves the chair (the forced
// run) and a third with the separation hunter's tests. Fails on any page error or horizontal scroll at 380 px.
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
  const settled = async () => { await page.waitForFunction(() => !document.querySelector('.cur') || true); await page.waitForTimeout(150); };
  // wait until the typing queue is idle: the cursor sits inside the element we expect to be visible
  const until = async (sel, ms) => { await page.waitForSelector(sel, { state: 'visible', timeout: ms || 60000 }); await page.waitForTimeout(200); };
  const text = async sel => page.evaluate(s => (document.querySelector(s) || { innerText: '' }).innerText.replace(/\n+/g, ' / '), sel);

  await page.goto(url); await page.waitForTimeout(500);
  await shot('start-typing', false);
  await hurry(); await page.waitForTimeout(400); await shot('start', true);
  if (await hscroll()) errors.push('horizontal scroll on start');
  log.push('START: ' + await text('#start-log'));

  // How to play from the start screen
  await page.click('#b-help-start'); await page.waitForTimeout(200); await shotOverlay('help', 'help'); await page.click('#b-help-close');

  await page.click('#b-begin'); await until('#form'); await shot('1-prelude', true);
  log.push('PRELUDE: ' + await text('#log'));
  const plan = [['joke', 'chair'], ['moral', 'chair'], ['feel', 'chair'], ['feel', 'open'], ['feel', 'be'], ['godel', 'chair']];
  const runOne = async (d, c, i, shots) => {
    await page.click('#b-slot'); await page.waitForTimeout(150);
    if (shots) await shot(`${i}-menu`, true);
    await page.click(`#menu .mi:nth-child(${['sonnet','sum','chess','joke','moral','learn','new','straw','feel','know','soul','viva','godel','esp','flesh'].indexOf(d) + 1})`);
    await page.waitForTimeout(100);
    await page.click(`#checks .btn[data-key=${c}]`); await page.waitForTimeout(150);
    if (shots) await shot(`${i}-set`, true);
    log.push(`TEST ${i}: slot="${await text('#b-slot')}" check=${c} does="${await text('#check-does')}" run=${await page.evaluate(() => document.getElementById('b-run').className)}`);
    await page.click('#b-run'); await page.waitForTimeout(900);
    if (shots) await shot(`${i}-arriving`, false);
    await hurry(); await until('#after'); await page.waitForTimeout(250);
    if (shots) await shot(`${i}-result`, true);
    const lines = await page.evaluate(() => [...document.querySelectorAll('#log .ln:not(.old)')].map(x => x.innerText));
    log.push('  ' + lines.slice(1).join('\n  '));
    log.push('  STATUS: ' + await text('#status') + ' | next button: ' + await text('#b-next'));
    if (await hscroll()) errors.push('horizontal scroll in test ' + i);
  };
  for (let i = 0; i < plan.length; i++) {
    if (i === 2) { await page.click('#q-play'); await page.waitForTimeout(200); await shotOverlay('help', 'help-mid'); await page.click('#b-help-close'); if (await page.evaluate(() => document.body.classList.contains('lock'))) errors.push('body locked after help'); }
    await runOne(plan[i][0], plan[i][1], i + 1, i < 6);
    await page.click('#b-next'); await page.waitForTimeout(300);
  }
  await until('#conv'); await hurry(); await page.waitForTimeout(300);
  await page.evaluate(() => window.scrollTo(0, 0)); await shot('end-verdict', false); await shot('end-full', true);
  log.push('END: ' + await text('#end-log'));
  await page.click('#cands .tick[data-key=B]'); await page.click('#cands .tick[data-key=elephant]'); await page.click('#grounds .tick[data-key=polite]'); await page.waitForTimeout(100);
  await shot('end-convention-set', true);
  await page.click('#b-adopt'); await page.waitForTimeout(600); await hurry(); await until('#end-btns'); await shot('end-readback', true);
  log.push('READBACK: ' + await text('#read-log'));
  if (await hscroll()) errors.push('horizontal scroll at the end');
  await page.click('#b-about'); await page.waitForTimeout(200); await shotOverlay('about', 'about'); await page.click('#b-about-close');

  // game B: never leaves the chair
  await page.click('#b-again'); await until('#form');
  for (const d of ['sonnet', 'sum', 'chess', 'new', 'esp', 'flesh']) { await runOne(d, 'chair', 'B', false); if (await page.evaluate(() => document.getElementById('b-next').innerText) !== 'THE VERDICT') await page.click('#b-next'); await page.waitForTimeout(200); }
  await shot('b-forced', true);
  await page.click('#b-next'); await until('#conv'); await hurry(); await page.waitForTimeout(300);
  log.push('END B: ' + await text('#end-log'));
  await page.click('#grounds .tick[data-key=does]'); await page.click('#b-adopt'); await hurry(); await until('#end-btns'); await shot('b-end', true);
  log.push('READBACK B: ' + await text('#read-log'));

  // game C: the separation hunter, with a solipsist ending
  await page.click('#b-again'); await until('#form');
  for (const [d, c] of [['godel', 'chair'], ['straw', 'chair'], ['flesh', 'open'], ['straw', 'open'], ['viva', 'chair'], ['soul', 'be']]) { await runOne(d, c, 'C', false); if (await page.evaluate(() => document.getElementById('b-next').innerText) !== 'THE VERDICT') await page.click('#b-next'); await page.waitForTimeout(200); }
  await page.click('#b-next'); await until('#conv'); await hurry(); await page.waitForTimeout(300);
  log.push('END C: ' + await text('#end-log'));
  await page.click('#grounds .tick[data-key=says]'); await page.click('#b-adopt'); await hurry(); await until('#end-btns'); await shot('c-end', true);
  log.push('READBACK C: ' + await text('#read-log'));

  fs.writeFileSync(path.join(__dirname, 'session-log.txt'), log.join('\n') + '\n\nERRORS: ' + (errors.length ? errors.join('\n') : 'none') + '\n');
  console.log(log.join('\n')); console.log('\nERRORS:', errors.length ? errors : 'none');
  await browser.close();
  process.exit(errors.length ? 1 : 0);
};
main().catch(e => { console.error('SESSION FAILED:', e); fs.writeFileSync(path.join(__dirname, 'session-log.txt'), 'SESSION FAILED: ' + e.stack + '\n'); process.exit(2); });
