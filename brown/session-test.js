// Full session in a real headless browser at phone width. Run: node session-test.js  (writes session-log.txt and screenshots)
// Strategy: the physicist's week (Sphinx, open drop, oil, one speck, skin, coarse, asbestos), help opened mid-play and returned from,
// the verdict, About, then a second week (the vitalist's) to the verdict.
const { chromium } = require('playwright'); const path = require('path'), fs = require('fs');
const L = []; const say = s => { L.push(s); console.log(s); };
(async () => {
  const browser = await chromium.launch(); const page = await browser.newPage({ viewport: { width: 380, height: 760 }, deviceScaleFactor: 2 });
  const errors = []; page.on('pageerror', e => errors.push(String(e))); page.on('console', m => { if (m.type() === 'error' && !/gc\.zgo\.at|goatcounter|net::ERR/.test(m.text())) errors.push(m.text()); });
  await page.goto('file://' + path.join(__dirname, 'browns-restless-dust.html')); await page.waitForTimeout(600);
  const shot = async (name, full) => { await page.screenshot({ path: path.join(__dirname, `screenshot-${name}.png`), fullPage: full !== false }); say('  shot ' + name); };
  const noScroll = async () => { const w = await page.evaluate(() => document.documentElement.scrollWidth); if (w > 380) say(`  !! horizontal scroll: ${w}px`); };
  const text = async sel => (await page.$eval(sel, e => e.innerText)).replace(/\n+/g, ' | ');
  const t0 = Date.now();
  await shot('start'); await noScroll();
  await page.click('#begin'); await page.waitForTimeout(800);
  say('day 0: ' + await text('#yard') + ' — ' + (await text('#what')).slice(0, 80) + '…'); await noScroll();
  const week = async (plan, tag) => {
    for (let i = 0; i < plan.length; i++) {
      const id = plan[i];
      if (await page.$eval('#look', b => !b.disabled)) say('  !! LOOK enabled before a label was tapped');
      if (await page.$('.exp.chosen')) say('  !! a label is pre-chosen at the start of the day');
      await page.click(`.exp[data-id="${id}"]`); await page.waitForTimeout(150);
      say(`\n== ${await text('#benchhead')} → tapped "${id}": ${await text('#willdo')}`);
      if (i === 0 && tag === 'a') { await shot(`${tag}-day1-chosen`); }
      if (i === 2 && tag === 'a') { // help mid-play and back
        await page.click('#play .help-q'); await page.waitForTimeout(200); await shot('help'); await page.click('#helpback'); await page.waitForTimeout(200);
        const back = await page.$eval('#play', e => e.classList.contains('on')), stillChosen = await page.$('.exp.chosen');
        say(`  help opened and returned: on play=${back}, choice kept=${!!stillChosen}`);
      }
      await page.click('#look'); await page.waitForTimeout(900); await shot(`${tag}-day${i + 1}-vignette`, false);
      await page.waitForTimeout(3600); await shot(`${tag}-day${i + 1}-mid`, false);
      const bodyEarly = await page.$eval('#afterwrap', e => !e.classList.contains('hidden')); if (bodyEarly) say('  !! NEXT shown before the look ended');
      await page.waitForTimeout(6000);
      const shown = await page.$eval('#afterwrap', e => !e.classList.contains('hidden')); if (!shown) say('  !! NEXT not shown after the look');
      say('  yard: ' + await text('#yard')); say('  line: ' + await text('#what'));
      say('  shelf: ' + await page.$$eval('.sus', es => es.map(e => (e.classList.contains('aside') ? '[' : '') + e.innerText.split('\n')[0] + (e.classList.contains('aside') ? ' — set aside]' : '')).join(' | ')));
      await shot(`${tag}-day${i + 1}-result`); await noScroll();
      say('  button: ' + await text('#next')); await page.click('#next'); await page.waitForTimeout(400);
    }
  };
  await week(['sphinx', 'wait', 'oil', 'onespeck', 'surface', 'coarse', 'asbestos'], 'a');
  say('\nEND: ' + await text('#headline')); say((await text('#verdictbody')).slice(0, 600)); await shot('a-end'); await noScroll();
  await page.click('#end [data-go="about"]'); await page.waitForTimeout(200); await shot('about'); await page.click('#aboutback'); await page.waitForTimeout(200);
  say('about returned to: ' + await page.$eval('.screen.on', e => e.id));
  say(`session a: ${((Date.now() - t0) / 1000).toFixed(0)} s of script time (eight-second looks; a person reads between)`);
  await page.click('#again'); await page.waitForTimeout(600);
  say('\nplay again: ' + await text('#dayband') + ' / ' + await text('#benchhead') + ' / shelf cleared=' + !(await page.$('.sus.aside')));
  await week(['herbarium', 'burn', 'glass', 'sugar', 'sulphur', 'meteorite', 'soot'], 'b');
  say('\nEND B: ' + await text('#headline')); say((await text('#verdictbody')).slice(0, 700)); await shot('b-end');
  say('\nerrors: ' + (errors.length ? errors.join(' / ') : 'none'));
  fs.writeFileSync(path.join(__dirname, 'session-log.txt'), L.join('\n') + '\n'); await browser.close();
})();
