// Drives the built game through headless Chromium at phone width: a full session, help opened mid-play, a retry, screenshots.
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 380, height: 760 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
  const shots = [];
  async function shot(name, full) { const f = path.join(__dirname, 'screenshot-' + name + '.png'); await page.screenshot({ path: f, fullPage: !!full }); shots.push(name); }
  async function noHScroll(label) { const w = await page.evaluate(() => document.documentElement.scrollWidth); if (w > 380) errors.push('horizontal scroll at ' + label + ': ' + w); }
  await page.goto('file://' + path.join(__dirname, 'singers-chalk-line.html'));
  await page.waitForTimeout(300);
  await shot('start'); await noHScroll('start');
  await page.click('#b-begin'); await page.waitForTimeout(200);
  await shot('one-empty'); await noHScroll('board one');
  const bottom = await page.evaluate(() => document.getElementById('b-chalk').getBoundingClientRect().bottom);
  console.log('Chalk it button bottom at', Math.round(bottom), 'px (viewport 760)');
  const plan = [['Reasoning', 0], ['Plans', 1], ['Ties', 1], ['Pain', 9]]; // row index tapped (0-based) → line under it
  for (const [label, row] of plan) {
    await page.click(`button.rb:has-text("${label}")`); await page.waitForTimeout(200);
    if (label === 'Reasoning') { await shot('one-reasoning-sorted'); }
    await page.click(`.rowtap[data-j="${row}"]`); await page.waitForTimeout(200);
    if (label === 'Reasoning') { await shot('one-reasoning-preview'); await page.click('#b-help-one'); await page.waitForTimeout(200); await shot('help', true); await page.click('#b-help-close'); await page.waitForTimeout(200); }
    await page.click('#b-chalk'); await page.waitForTimeout(1800);
    await shot('one-' + label.toLowerCase() + '-chalked');
    console.log(label, '|', await page.textContent('#now1'), '|', await page.textContent('#said1'), '|', await page.textContent('#find1'));
    await page.click('button:has-text("Sponge")'); await page.waitForTimeout(800);
  }
  await shot('one-species-offered');
  await page.click('button.rb.species'); await page.waitForTimeout(200);
  await page.click('.rowtap[data-j="4"]'); await page.waitForTimeout(200);
  await page.click('#b-chalk'); await page.waitForTimeout(1500);
  await shot('one-species-chalked'); console.log('Species |', await page.textContent('#said1'));
  await page.click('button:has-text("And then")'); await page.waitForTimeout(900); await shot('one-race');
  await page.click('button:has-text("And then")'); await page.waitForTimeout(900); await shot('one-sex');
  await page.click('button:has-text("So where is the line")'); await page.waitForTimeout(900); await shot('one-reply');
  await page.click('button:has-text("So is a mouse")'); await page.waitForTimeout(300);
  await shot('two-slap'); await noHScroll('board two');
  const picks = ['adult', 'adult', 'adult', 'infant'];
  for (let i = 0; i < 4; i++) {
    await page.click(`.fig[data-id="${picks[i]}"]`); await page.waitForTimeout(150);
    if (i === 0) await shot('two-slap-picked');
    await page.click('#b-commit'); await page.waitForTimeout(1200);
    await shot('two-scene' + (i + 1) + '-result');
    console.log('scene', i + 1, '|', await page.textContent('#said2'), '|', await page.textContent('#paper2'));
    await page.click('#btns2 button'); await page.waitForTimeout(300);
  }
  await shot('end', true); await noHScroll('end');
  console.log('FATE:', await page.textContent('#fate'));
  console.log('PART:', await page.textContent('#v-part'));
  await page.click('#b-about-end'); await page.waitForTimeout(200); await shot('about', true); await page.click('#b-about-close');
  // retry: play again, the paper's way
  await page.click('#b-again'); await page.waitForTimeout(200);
  for (const [label, row] of [['Pain', 9], ['Ties', 1], ['Plans', 1], ['Reasoning', 0]]) { await page.click(`button.rb:has-text("${label}")`); await page.click(`.rowtap[data-j="${row}"]`); await page.click('#b-chalk'); await page.waitForTimeout(1500); if (label === 'Pain') await shot('b-pain-first'); await page.click('button:has-text("Sponge")'); await page.waitForTimeout(800); }
  await page.click('button.rb.species'); await page.click('.rowtap[data-j="4"]'); await page.click('#b-chalk'); await page.waitForTimeout(1400);
  await page.click('button:has-text("And then")'); await page.waitForTimeout(800); await page.click('button:has-text("And then")'); await page.waitForTimeout(800); await page.click('button:has-text("So where is the line")'); await page.waitForTimeout(800); await page.click('button:has-text("So is a mouse")'); await page.waitForTimeout(300);
  for (const p of ['pig', 'disab', 'adult', 'chimp']) { await page.click(`.fig[data-id="${p}"]`); await page.click('#b-commit'); await page.waitForTimeout(1100); await page.click('#btns2 button'); await page.waitForTimeout(200); }
  await shot('b-end', true); console.log('FATE B:', await page.textContent('#fate')); console.log('PART B:', await page.textContent('#v-part'));
  console.log('shots:', shots.join(', '));
  console.log(errors.length ? 'ERRORS:\n' + errors.join('\n') : 'no errors, no horizontal scroll');
  await browser.close();
})();
