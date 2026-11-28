// Full sessions in a headless browser at 380 x 760, clicks only. Run: node session-test.js (needs playwright).
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
(async () => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome' });
  const log = [];
  async function run(tag, vp, plan) {
    const page = await browser.newPage({ viewport: vp, deviceScaleFactor: 1 });
    const errors = [];
    page.on('pageerror', e => errors.push(String(e)));
    await page.route('**/*', r => r.request().url().startsWith('file:') ? r.continue() : r.abort());
    await page.goto('file://' + path.resolve('godels-endgame.html'));
    const shot = async n => { await page.waitForTimeout(400); await page.screenshot({ path: `screenshot-${tag}-${n}.png`, fullPage: true }); };
    const k = async t => { await page.click(`#a1-write .k[data-t="${t}"]`); };
    const text = async sel => (await page.$eval(sel, e => e.innerText)).replace(/\n+/g, ' / ');
    const within = async sel => page.$eval(sel, e => { const r = e.getBoundingClientRect(); return r.top + window.scrollY + r.height <= 700; });
    await plan({ page, shot, k, text, within, log: s => log.push(tag + ': ' + s) });
    const hs = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    log.push(tag + ': page errors: ' + (errors.join(' | ') || 'none') + '; horizontal scroll: ' + hs);
    await page.close();
  }
  const phone = { width: 380, height: 760 };

  await run('a', phone, async ({ page, shot, k, text, within, log }) => {
    await shot('0-start');
    await page.click('#b-begin'); await shot('1-first');
    log('act 1 hand button within 700: ' + await within('#a1-hand'));
    await page.click('#a1-hand'); await shot('1-judge');
    await page.click('#a1-print'); await shot('1-printed');
    await page.click('#a1-next');
    // nonsense
    await k('2'); await k('+'); await k('='); await k('4'); await page.click('#a1-hand'); await shot('1-nonsense');
    log('nonsense: ' + await text('#a1-msg'));
    await page.click('#k-clear');
    await k('3'); await k('×'); await k('3'); await k('='); await k('1'); await k('0'); await page.click('#a1-hand');
    await page.click('#a1-print'); await shot('1-wrong');
    log('wrong button: ' + await text('#a1-msg'));
    await page.click('#a1-not'); await page.click('#a1-next');
    await page.click('#k-deal'); await page.click('#a1-hand');
    const right = await page.evaluate(() => gRightButton(window.__G.state().current));
    await page.click(right === 'print' ? '#a1-print' : '#a1-not'); await shot('1-done');
    log('after 3: ' + await text('#a1-msg'));
    await page.click('#a1-next'); await shot('2-codes');
    for (let i = 0; i < 5; i++) { await page.click(`#a2-tiles .tile[data-i="${i}"]`); if (i === 1) await shot('2-packing'); }
    log('packed: ' + await text('#a2-num'));
    await shot('2-packed');
    await page.click('#a2-to-unpack'); await shot('2-unpack');
    for (const p of [2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 5, 5]) { const b = await page.$(`#a2-cols button[data-p="${p}"]:not([disabled])`); if (b) await b.click(); if (await page.$eval('#a2-unum', e => e.innerText) === '1') break; }
    await shot('2-unpacked');
    log('unpacked: ' + await text('#a2-unpack-msg'));
    await page.click('#a2-to-punch'); await page.click('#a2-print'); await shot('2-punch');
    log('punch: ' + await text('#a2-punch-msg'));
    await page.click('#a2-next'); await shot('3-gap');
    await page.click('#a3-choices .btn[data-i="0"]'); await shot('3-miss');
    await page.click('#a3-choices .btn[data-i="2"]'); await shot('3-hint');
    log('hint: ' + await text('#a3-msg'));
    await page.click('#a3-choices .btn[data-i="3"]'); await shot('3-hit');
    await page.click('#a3-feed'); await shot('4-dilemma');
    log('dilemma buttons within 700: ' + await within('#a3-not'));
    await page.click('#a3-print'); await shot('4-print');
    await page.click('#a3-not'); await shot('4-not');
    await page.click('#a3-neither'); await shot('4-neither');
    await page.click('#a3-repair'); await shot('5-repair');
    await page.click('#r-next'); await shot('end');
    log('VERDICT: ' + await text('#e-vd'));
    await page.click('#b-about'); await shot('about'); await page.click('#b-about-back');
    await page.click('#s-end [data-help]'); await shot('help');
  });

  await run('b', { width: 1280, height: 640 }, async ({ page, shot, text, log }) => {
    await page.click('#b-begin'); await page.click('#a1-hand'); await page.click('#a1-print'); await page.click('#a1-next');
    for (let r = 0; r < 2; r++) {
      await page.click('#k-deal'); await page.click('#a1-hand');
      const right = await page.evaluate(() => gRightButton(window.__G.state().current));
      await page.click(right === 'print' ? '#a1-print' : '#a1-not'); await page.click('#a1-next');
    }
    for (let i = 0; i < 5; i++) await page.click(`#a2-tiles .tile[data-i="${i}"]`);
    await page.click('#a2-to-unpack');
    for (let i = 0; i < 20; i++) { const b = await page.$('#a2-cols button:not([disabled])'); if (!b) break; await b.click(); }
    await page.click('#a2-to-punch'); await page.click('#a2-not'); await page.click('#a2-print'); await page.click('#a2-next');
    await page.click('#a3-choices .btn[data-i="3"]'); await page.click('#a3-feed'); await page.click('#a3-not');
    await page.click('#a3-neither'); await page.click('#a3-repair'); await page.click('#r-next');
    await shot('end');
    log('VERDICT: ' + await text('#e-vd'));
    await page.click('#b-again'); log('play again -> ' + await page.$eval('.screen.on', e => e.id));
  });

  fs.writeFileSync('session-log.txt', log.join('\n') + '\n');
  console.log(log.join('\n'));
  await browser.close();
})();
