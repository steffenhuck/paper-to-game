// Full session in headless Chromium at phone width: the walkthrough's strategy (talk, talk, then watching, one summer
// of the occasional policeman, watching), help opened mid-play, the eleventh summer, the verdict, About; then a second
// village with the daily policeman throughout, to its verdict. Screenshots along the way; errors and horizontal scroll
// are recorded in session-log.txt.
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 380, height: 760 }, deviceScaleFactor: 1 });
  const errors = []; page.on('pageerror', e => errors.push(e.message)); page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  const seedArg = Number(process.argv[2] || 1234);
  const url = 'file://' + path.resolve(__dirname, 'ostroms-pond.html') + '#v=' + seedArg;
  await page.goto(url); await page.waitForTimeout(900);
  const shot = async (n, full) => page.screenshot({ path: path.join(__dirname, 'screenshot-' + n + '.png'), fullPage: !!full });
  const shotOverlay = async (id, n) => { await page.evaluate(id => { const o = document.getElementById(id); o.style.position = 'absolute'; o.style.inset = 'auto'; o.style.top = '0'; o.style.left = '0'; o.style.right = '0'; document.querySelector('body > .wrap').style.visibility = 'hidden'; }, id); await page.evaluate(() => window.scrollTo(0, 0)); await shot(n, true); await page.evaluate(id => { const o = document.getElementById(id); o.style.position = ''; o.style.inset = ''; o.style.top = ''; o.style.left = ''; o.style.right = ''; document.querySelector('body > .wrap').style.visibility = ''; }, id); };
  const hscroll = async () => page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
  const log = [];
  const waitPhase = async (id) => page.waitForFunction(id => document.getElementById(id).style.display !== 'none', id, { timeout: 20000 });
  const txt = async (id) => page.evaluate(id => document.getElementById(id).innerText.replace(/\n+/g, ' / '), id);
  await shot('start', true);
  if (await hscroll()) errors.push('horizontal scroll on start');
  await page.click('#b-begin'); await page.waitForTimeout(400); await shot('a-1-pick-empty', true);
  const plan = ['talk', 'watch', 'watch', 'strong', 'watch', 'watch'];
  for (let i = 0; i < plan.length; i++) {
    if (i === 0) { for (const k of ['strong', 'none', 'watch']) { await page.click(`.card[data-key=${k}]`); await page.waitForTimeout(150); await shot(`a-1-preview-${k}`, false); } }
    if (i === 2) { await page.click('#q-play'); await page.waitForTimeout(300); await shotOverlay('help', 'help'); await page.click('#b-help-close'); if (await page.evaluate(() => document.body.classList.contains('lock'))) errors.push('body still locked after help'); }
    await page.click(`.card[data-key=${plan[i]}]`); await page.waitForTimeout(200);
    if (i < 4) await shot(`a-${i + 1}-picked-${plan[i]}`, true);
    log.push(`summer ${i + 1} picks ${plan[i]}: ` + await txt('desc'));
    await page.click('#b-fish'); await page.waitForTimeout(i === 3 ? 2600 : 1600); if (i < 4) await shot(`a-${i + 1}-fishing`, false);
    await waitPhase('ph-result'); await page.waitForTimeout(300); await shot(`a-${i + 1}-result`, true);
    log.push('  ' + await txt('result'));
    log.push('  shelf: ' + await txt('l-shelf') + ' | heading: ' + await txt('h-summer'));
    if (await hscroll()) errors.push('horizontal scroll in summer ' + (i + 1));
    await page.click('#b-next'); await page.waitForTimeout(400);
  }
  await shot('a-7-test', true);
  await page.click('#b-test'); await page.waitForTimeout(1800); await shot('a-7-fishing', false);
  await page.waitForFunction(() => document.getElementById('s-end').classList.contains('on'), null, { timeout: 20000 }); await page.waitForTimeout(400);
  await shot('a-end', true);
  log.push('END: ' + await txt('end-head') + ' | ' + await txt('end-lines') + ' | ' + await txt('end-paper'));
  if (await hscroll()) errors.push('horizontal scroll at the end');
  await page.click('#b-about'); await page.waitForTimeout(300); await shotOverlay('about', 'about'); await page.click('#b-about-close');
  // a second village: the daily policeman throughout
  await page.click('#b-again'); await page.waitForTimeout(400);
  for (let i = 0; i < 6; i++) {
    await page.click('.card[data-key=strong]'); await page.click('#b-fish'); await waitPhase('ph-result'); await page.waitForTimeout(100);
    if (i === 0) await shot('b-1-result', true);
    await page.click('#b-next'); await page.waitForTimeout(200);
  }
  await page.click('#b-test'); await page.waitForFunction(() => document.getElementById('s-end').classList.contains('on'), null, { timeout: 20000 }); await page.waitForTimeout(400);
  await shot('b-end', true);
  log.push('END B: ' + await txt('end-head') + ' | ' + await txt('end-lines') + ' | ' + await txt('end-paper'));
  fs.writeFileSync(path.join(__dirname, 'session-log.txt'), log.join('\n') + '\n\nERRORS: ' + (errors.length ? errors.join('\n') : 'none') + '\n');
  console.log(log.join('\n')); console.log('\nERRORS:', errors.length ? errors : 'none');
  await browser.close();
})();
