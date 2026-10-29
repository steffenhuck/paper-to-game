// Full session in a real headless browser at phone width: play, help mid-play, stamp, reveal, verdict, retry, about.
// Run: node session-test.js > session-log.txt
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 380, height: 760 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
  const errors = []; page.on('pageerror', e => errors.push(e.message)); page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  const log = s => console.log(s);
  const shot = async n => { await page.screenshot({ path: `screenshot-${n}.png`, fullPage: true }); log('  screenshot-' + n + '.png'); };
  const hscroll = async () => page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
  const t0 = Date.now();
  await page.goto('file://' + path.resolve('ask-first.html'));
  await page.waitForTimeout(400);
  log('start: aim = "' + (await page.textContent('.aimline')).trim() + '"'); await shot('start');
  await page.tap('#b-start', { force: true }); await page.waitForTimeout(350); log('brief shown'); await shot('brief');
  await page.tap('#b-street', { force: true }); await page.waitForTimeout(350); await shot('street-empty');
  const plan = ['income', 'income', 'italy', 'asylum', 'reach', 'uk', 'uk', 'pirates', 'uk', 'asylum', 'asylum', 'pirates'];
  for (let i = 0; i < plan.length; i++) {
    await page.tap(`#posters .poster[data-id="${plan[i]}"]`, { force: true });
    await page.waitForTimeout(1050);
    const say = await page.textContent('#they'), cap = await page.textContent('#notecap'), who = await page.textContent('#nameplate');
    log(`knock ${i + 1}: ${plan[i]} → ${who}: "${say.trim()}" | ${cap.trim()}`);
    if (i === 0) await shot('street-first');
    if (i === 4) { // help mid-play, then back
      await page.tap('#s-street .qbtn', { force: true }); await page.waitForTimeout(300); await shot('help');
      await page.tap('#b-helpback', { force: true }); await page.waitForTimeout(300);
      const back = await page.evaluate(() => document.querySelector('#s-street').classList.contains('on'));
      const notes = await page.$$eval('#posters .note', n => n.length);
      log(`help opened and closed mid-street: back on street = ${back}, notes kept = ${notes}`);
    }
  }
  await shot('street-full');
  const disabled = await page.$$eval('#posters .poster', b => b.every(x => x.disabled));
  log('after 12 knocks all posters disabled: ' + disabled);
  await page.tap('#b-tostamp', { force: true }); await page.waitForTimeout(350);
  // stamp from the notes: scrap where red outnumbers green
  const decisions = await page.evaluate(() => [...document.querySelectorAll('#slist .poster')].map((c, i) => {
    const n = [...c.querySelectorAll('.note')].map(x => x.classList.contains('green') ? 'g' : x.classList.contains('red') ? 'r' : 'w');
    return { i, n: n.join(''), scrap: n.filter(x => x === 'r').length > n.filter(x => x === 'g').length };
  }));
  for (const d of decisions) if (d.scrap) await page.tap(`#slist .poster:nth-child(${d.i + 1}) .stamp`);
  log('stamps: ' + decisions.map(d => d.n + (d.scrap ? '→SCRAP' : '→PRINT')).join(', '));
  await shot('stamp');
  await page.tap('#b-send', { force: true }); await page.waitForTimeout(5200); await shot('reveal');
  const calls = await page.$$eval('#results .res', r => r.map(x => x.querySelector('.tag').textContent + ': ' + x.querySelector('.line').textContent + ' ' + x.querySelector('.call').textContent));
  calls.forEach(c => log('  ' + c));
  await page.tap('#b-end', { force: true }); await page.waitForTimeout(350); await shot('end');
  log('verdict: ' + (await page.textContent('#v-you')));
  await page.tap('#s-end [data-about]', { force: true }); await page.waitForTimeout(300); await shot('about');
  await page.tap('#b-aboutback', { force: true }); await page.waitForTimeout(300);
  log('about → back to end: ' + await page.evaluate(() => document.querySelector('#s-end').classList.contains('on')));
  log('horizontal scroll at 380px: ' + await hscroll());
  // retry: walk another street, stamp at once without asking (Europe's draft)
  await page.tap('#b-again', { force: true }); await page.waitForTimeout(350);
  log('retry: knocks reset = ' + (await page.$$eval('#knocks .k.used', k => k.length) === 0));
  await page.tap('#b-tostamp', { force: true }); await page.waitForTimeout(300); await page.tap('#b-send', { force: true }); await page.waitForTimeout(5200);
  await page.tap('#b-end', { force: true }); await page.waitForTimeout(300); await shot('end-trusting');
  log('trusting verdict: ' + (await page.textContent('#v-you')));
  log('horizontal scroll at 380px: ' + await hscroll());
  log('errors: ' + (errors.length ? errors.join(' | ') : 'none'));
  log(`scripted session wall time: ${((Date.now() - t0) / 1000).toFixed(0)} s (not a human session length)`);
  await browser.close();
})();
