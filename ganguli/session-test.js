// Full session in headless Chromium at phone width: plays six pairs with the stranger's strategy, opens help mid-play,
// bets, screenshots along the way, then a second run (pass it on everywhere) to the verdict.
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 380, height: 760 }, deviceScaleFactor: 1 });
  const errors = []; page.on('pageerror', e => errors.push(e.message)); page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  const url = 'file://' + path.resolve(__dirname, 'gangulis-letters.html');
  await page.goto(url); await page.waitForTimeout(700);
  const shot = async (n, full) => page.screenshot({ path: path.join(__dirname, 'screenshot-' + n + '.png'), fullPage: !!full });
  const shotOverlay = async (id, n) => { await page.evaluate(id => { const o = document.getElementById(id); o.style.position = 'absolute'; o.style.inset = 'auto'; o.style.top = '0'; o.style.left = '0'; o.style.right = '0'; document.querySelector('body > .wrap').style.visibility = 'hidden'; }, id); await page.evaluate(() => window.scrollTo(0, 0)); await shot(n, true); await page.evaluate(id => { const o = document.getElementById(id); o.style.position = ''; o.style.inset = ''; o.style.top = ''; o.style.left = ''; o.style.right = ''; document.querySelector('body > .wrap').style.visibility = ''; }, id); };
  const hscroll = async () => page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
  const log = [];
  const waitPhase = async (id) => page.waitForFunction(id => document.getElementById(id).style.display !== 'none', id, { timeout: 15000 });
  await shot('start', true);
  await page.click('#b-begin'); await page.waitForTimeout(300); await shot('a-plain', true);
  if (await hscroll()) errors.push('horizontal scroll on plain street');
  await page.click('#b-first'); await page.waitForTimeout(300); await shot('a-1-letter-empty', false);
  const plan = [['sheet', 75], ['spokes', 70], ['pass', 60], ['after', null], ['pass', 58], ['clip', 57]];
  for (let i = 0; i < plan.length; i++) {
    const [key, bet] = plan[i];
    if (i === 0) { // preview every letter on the first pair
      for (const k of ['plain', 'pass', 'after', 'spokes', 'clip']) { await page.click(`.env[data-key=${k}]`); await page.waitForTimeout(120); await shot(`a-1-preview-${k}`, false); }
    }
    if (i === 2) { await page.click('#q-play'); await page.waitForTimeout(300); await shotOverlay('help', 'help'); await page.click('#b-help-close'); if (await page.evaluate(() => document.body.classList.contains('lock'))) errors.push('body still locked after help'); }
    await page.click(`.env[data-key=${key}]`); await page.waitForTimeout(150); await shot(`a-${i + 1}-letter-set`, true);
    log.push(`pair ${i + 1} letter ${key}: ` + await page.evaluate(() => document.getElementById('desc').innerText.replace(/\n+/g, ' ')));
    await page.click('#b-plant'); await page.waitForTimeout(700); await shot(`a-${i + 1}-planting`, false);
    await waitPhase('ph-this'); await page.waitForTimeout(250); await shot(`a-${i + 1}-this-result`, true);
    log.push('  this: ' + await page.evaluate(() => document.getElementById('res-this').innerText.replace(/\n+/g, ' / ')));
    if (await hscroll()) errors.push('horizontal scroll in pair ' + (i + 1));
    const needsBet = await page.evaluate(() => document.getElementById('betwrap').style.display !== 'none');
    if ((bet !== null) !== needsBet) errors.push(`bet expectation mismatch on ${key}`);
    if (needsBet) {
      await page.evaluate(v => { const s = document.getElementById('bet'); s.value = v; s.dispatchEvent(new Event('input', { bubbles: true })); }, bet);
      await page.waitForTimeout(150); if (i < 2) await shot(`a-${i + 1}-bet-set`, true);
      log.push('  bet set to ' + await page.evaluate(() => document.getElementById('bet-num').innerText) + ' | marker shown: ' + await page.evaluate(() => document.getElementById('tn-bet').className));
      await page.click('#b-send');
    } else { await page.click('#b-nobet'); }
    await page.waitForTimeout(700); if (i < 3) await shot(`a-${i + 1}-next-planting`, false);
    await waitPhase('ph-next'); await page.waitForTimeout(250); await shot(`a-${i + 1}-next-result`, true);
    log.push('  next: ' + await page.evaluate(() => document.getElementById('res-next').innerText.replace(/\n+/g, ' / ')));
    log.push('  pair: ' + await page.evaluate(() => document.getElementById('pairsay').innerText) + ' | tallies ' + await page.evaluate(() => document.getElementById('tt-n').innerText + ' / ' + document.getElementById('tn-n').innerText));
    await page.click('#b-nextpair'); await page.waitForTimeout(400);
  }
  await shot('a-end', true);
  log.push('END: ' + await page.evaluate(() => document.getElementById('end-head').innerText + ' | ' + document.getElementById('n-you').innerText + ' / ' + document.getElementById('n-plain').innerText + ' / ' + document.getElementById('n-best').innerText + ' | ' + document.getElementById('end-lines').innerText.replace(/\n+/g, ' / ')));
  await page.click('#b-about'); await page.waitForTimeout(300); await shotOverlay('about', 'about'); await page.click('#b-about-close');
  // a second town: pass it on everywhere, bet 58 each time
  await page.click('#b-again'); await page.waitForTimeout(300);
  for (let i = 0; i < 6; i++) {
    await page.click('.env[data-key=pass]'); await page.click('#b-plant'); await waitPhase('ph-this');
    await page.evaluate(() => { const s = document.getElementById('bet'); s.value = 58; s.dispatchEvent(new Event('input', { bubbles: true })); });
    await page.click('#b-send'); await waitPhase('ph-next'); await page.click('#b-nextpair'); await page.waitForTimeout(200);
  }
  await shot('b-end', true);
  log.push('END B: ' + await page.evaluate(() => document.getElementById('end-head').innerText + ' | ' + document.getElementById('n-you').innerText + ' | ' + document.getElementById('end-lines').innerText.replace(/\n+/g, ' / ')));
  if (await hscroll()) errors.push('horizontal scroll at the end');
  require('fs').writeFileSync(path.join(__dirname, 'session-log.txt'), log.join('\n') + '\n\nERRORS: ' + (errors.length ? errors.join('\n') : 'none') + '\n');
  console.log(log.join('\n')); console.log('\nERRORS:', errors.length ? errors : 'none');
  await browser.close();
  process.exit(errors.length ? 1 : 0);
})();
