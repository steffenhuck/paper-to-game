// Full session in a real headless browser at phone width. Run: node session-test.js  (writes session-log.txt and screenshots)
// Strategy: three bright nearby nebulae, then far ones; help opened mid-play and returned from; a new game at the end.
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const L = []; const say = s => { L.push(s); console.log(s); };
(async () => {
  const browser = await chromium.launch(); const page = await browser.newPage({ viewport: { width: 380, height: 760 }, deviceScaleFactor: 2 });
  const errors = []; page.on('pageerror', e => errors.push(String(e))); page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto('file://' + path.join(__dirname, 'hubbles-twelve-nights.html') + '#g42'); await page.waitForTimeout(600);
  const shot = async name => { await page.screenshot({ path: path.join(__dirname, `screenshot-${name}.png`), fullPage: true }); say('  shot ' + name); };
  const noScroll = async () => { const w = await page.evaluate(() => document.documentElement.scrollWidth); if (w > 380) say(`  !! horizontal scroll: ${w}px`); };
  await shot('start'); await noScroll();
  await page.click('#begin'); await page.waitForTimeout(300); await shot('sky-night1'); await noScroll();
  // helpers to read the nebula list and positions from the page
  const picks = [5, 7, 11, 22, 19, 16, 4]; // M31, M94, M81, M87 (Virgo), 4151, 1068 (M77), then an unaffordable one
  const setRange = async (sel, v) => page.$eval(sel, (e, v) => { e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); }, String(v));
  let n = 0;
  for (const idx of picks) {
    const can = await page.evaluate(i => { const g = document.querySelector(`#skysvg g[data-idx="${i}"]`); return !!g; }, idx);
    if (!can) { say(`nebula ${idx} not on sky`); continue; }
    await page.$eval(`#skysvg g[data-idx="${idx}"] circle:last-child`, el => el.dispatchEvent(new MouseEvent('click', { bubbles: true })));
    await page.waitForTimeout(200);
    const panel = await page.$eval('#skypanel', e => e.innerText.replace(/\n/g, ' | '));
    say(`tap ${idx}: ${panel}`);
    if (n === 0) await shot('sky-selected');
    const btn = await page.$('#skypanel button.primary');
    if (!btn || (await btn.innerText()).toLowerCase().includes('over')) { say('  cannot point: ' + (btn ? await btn.innerText() : 'no button')); continue; }
    await btn.click(); await page.waitForTimeout(1300);
    if (n === 0) { // night one: the eyepiece assembles in three pictures
      await shot('eyepiece-stage1'); say('  eye stage 1: ' + await page.$eval('#eyeorient', e => e.innerText) + ' | ' + await page.$eval('#eyestage button', e => e.innerText));
      await page.click('#eyestage button'); await page.waitForTimeout(300); await shot('eyepiece-stage2'); say('  eye stage 2: ' + await page.$eval('#eyestage button', e => e.innerText));
      await page.click('#eyestage button'); await page.waitForTimeout(300); await shot('eyepiece-stage3'); say('  eye stage 3: orient "' + await page.$eval('#eyeorient', e => e.innerText) + '", READ enabled ' + !(await page.$eval('#eyeread', e => e.disabled)));
    }
    // eyepiece: scan the dial until the ring glows (what a player does by eye)
    // a player's judgement: the true distance times a small error (the dial is logarithmic between 0.02 and 3.0)
    const rTrue = await page.evaluate(i => window.HUBBLE.CONFIG.NEBULAE[i].r, idx);
    const rRead = rTrue * [0.9, 1.1, 0.95, 0.85, 1.05, 0.9, 1.0][n % 7];
    await setRange('#eyedial', Math.round(1000 * (Math.log10(rRead) - Math.log10(0.02)) / (Math.log10(3.0) - Math.log10(0.02))));
    const eyeTxt = await page.$eval('#eyereadout', e => e.innerText);
    if (/match|fainter|brighter|near|close/.test(eyeTxt)) say('  !! eyepiece readout grades the player: ' + eyeTxt);
    if (await page.$eval('#eyeread', e => e.disabled)) say('  !! READ THE DISTANCE disabled after the demonstration');
    say(`  eyepiece: ${eyeTxt}`);
    if (n === 0) { await shot('eyepiece'); await noScroll(); }
    if (n === 1) { await page.click('.screen.on .qbtn'); await page.waitForTimeout(200); await shot('help'); await page.click('#helpback'); await page.waitForTimeout(200); say('  help opened and returned to ' + await page.$eval('.screen.on', e => e.id)); }
    await page.click('#eyeread'); await page.waitForTimeout(400);
    if (n === 0) { // night one: the spectrograph assembles in three pictures
      await shot('spectrograph-stage1'); say('  spec stage 1: ' + await page.$eval('#specorient', e => e.innerText));
      await page.click('#specstage button'); await page.waitForTimeout(1200); await shot('spectrograph-stage2'); say('  spec stage 2: ' + await page.$eval('#specorient', e => e.innerText));
      await page.click('#specstage button'); await page.waitForTimeout(300); await shot('spectrograph-stage3'); say('  spec stage 3: ' + await page.$eval('#specorient', e => e.innerText) + ' | readout ' + await page.$eval('#specreadout', e => e.innerText) + ' | READ enabled ' + !(await page.$eval('#specread', e => e.disabled)));
    }
    const vTrue = await page.evaluate(i => window.HUBBLE.CONFIG.NEBULAE[i].v, idx);
    await setRange('#specdial', Math.round((vTrue + [60, -40, 30, 120, -80, 50, 0][n % 7]) / 5) * 5);
    const specTxt = await page.$eval('#specreadout', e => e.innerText);
    if (/on the bars|match|close/.test(specTxt)) say('  !! spectrograph readout grades the player: ' + specTxt);
    if (await page.$eval('#specread', e => e.disabled)) say('  !! READ THE SPEED disabled after the demonstration');
    const glowing = await page.$$eval('#specsvg .glow, #eyesvg .glow, #specsvg [stroke-dasharray="3 3"]', g => g.length);
    if (glowing) say('  !! glow visible during play');
    say(`  spectrograph: ${specTxt}`);
    if (n === 0 || idx === 22) { await shot(idx === 22 ? 'spectrograph-virgo' : 'spectrograph'); await noScroll(); }
    await page.click('#specread'); await page.waitForTimeout(1200);
    say(`  plate: ${await page.$eval('#platenight', e => e.innerText)} // ${await page.$eval('#platewords', e => e.innerText)}`);
    if (n === 2 || idx === 22) await shot(idx === 22 ? 'plate-first-far' : 'plate-near');
    await page.click('#platenext'); await page.waitForTimeout(400);
    n++;
    say(`  now on ${await page.$eval('.screen.on', e => e.id)}; lamps lit ${await page.$$eval('.lamp.lit', l => l.length)}`);
  }
  if (await page.$eval('.screen.on', e => e.id) === 'sky') { await shot('sky-late'); const b = await page.$('#skypanel button'); if (b) { await b.click(); await page.waitForTimeout(300); } }
  say('on ' + await page.$eval('.screen.on', e => e.id));
  await shot('sun-before'); await page.click('#sunbtn'); await page.waitForTimeout(2000); await shot('sun-after');
  say('sun: ' + await page.$eval('#sunwords', e => e.innerText) + ' // ' + await page.$eval('#sunorient', e => e.innerText));
  await page.click('#sunbtn'); await page.waitForTimeout(300);
  await setRange('#ratedial', 470); await page.waitForTimeout(200); say('rate: ' + await page.$eval('#ratereadout', e => e.innerText)); await shot('rate');
  await page.click('#ratecommit'); await page.waitForTimeout(300);
  say('humason: ' + await page.$eval('#humreadout', e => e.innerText)); await shot('humason-predict');
  await page.click('#humcommit'); await page.waitForTimeout(4200); await shot('humason-spectrum');
  say('humason spectrum: ' + await page.$eval('#humspecreadout', e => e.innerText));
  await page.click('#toverdict'); await page.waitForTimeout(400); await shot('end'); await noScroll();
  say('VERDICT: ' + await page.$eval('#vhead', e => e.innerText) + ' // ' + await page.$eval('#vbody', e => e.innerText.replace(/\n/g, ' | ')));
  await page.click('#end [data-go="about"]'); await page.waitForTimeout(200); await shot('about'); await page.click('#aboutback'); await page.waitForTimeout(200);
  say('about returned to ' + await page.$eval('.screen.on', e => e.id));
  await page.click('#newgame'); await page.waitForTimeout(300); say('new game: on ' + await page.$eval('.screen.on', e => e.id) + ', lamps ' + await page.$$eval('.lamp.lit', l => l.length) + ', ' + location_hash(await page.url()));
  say(errors.length ? 'ERRORS: ' + errors.join(' | ') : 'no page errors');
  fs.writeFileSync(path.join(__dirname, 'session-log.txt'), L.join('\n') + '\n');
  await browser.close();
  function location_hash(u) { return u.split('#')[1] || ''; }
})();
