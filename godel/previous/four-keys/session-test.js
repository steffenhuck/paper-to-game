// Full session in a headless browser at 380 x 760. Run: node session-test.js (needs playwright).
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
(async () => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome' });
  const log = [];
  async function run(tag, plan) {
    const page = await browser.newPage({ viewport: { width: 380, height: 760 }, deviceScaleFactor: 1 });
    const errors = [];
    page.on('pageerror', e => errors.push(String(e)));
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    await page.route('**/*', r => r.request().url().startsWith('file:') ? r.continue() : r.abort());
    await page.goto('file://' + path.resolve('godels-endgame.html'));
    const shot = async n => { await page.waitForTimeout(350); await page.screenshot({ path: `screenshot-${tag}-${n}.png`, fullPage: true }); };
    const W = { NOT: 'NOT', PRINTS: 'P1', 'PRINTS II': 'P2', TWICE: 'TWICE', P1: 'P1', P2: 'P2' };
    const key = async label => { if (label === 'RUB') await page.click('#w-back'); else await page.click('#w-' + (W[label] || label)); await page.waitForTimeout(80); };
    const type = async text => {
      await page.click('#w-clear').catch(() => {}); await page.waitForTimeout(40);
      const ws = text.toUpperCase().replace(/PRINTS II/g, 'P2').split(/\s+/).filter(Boolean);
      for (const w of ws) { if (await page.$eval('#w-NOT', e => e.disabled)) break; await key(w === 'PRINTS' ? 'P1' : w); }
    };
    const within = async sel => {
      const b = await page.$eval(sel, e => { const r = e.getBoundingClientRect(); return { top: r.top + window.scrollY, h: r.height, vis: e.offsetParent !== null }; });
      return b.vis && b.top + b.h <= 700;
    };
    const hscroll = async () => page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    const now = async () => page.$eval('.screen.on', s => (s.querySelector('h2') || {}).innerText || s.id);
    await plan({ page, shot, key, type, within, hscroll, now, log: s => log.push(tag + ': ' + s) });
    log.push(tag + ': errors: ' + (errors.length ? errors.join(' | ') : 'none') + '; horizontal scroll: ' + (await hscroll()));
    await page.close();
  }

  // A: a plausible player who gets things right after some trying
  await run('a', async ({ page, shot, key, type, within, now, log }) => {
    await shot('0-start');
    await page.click('#b-begin');
    await shot('1-empty');
    log('step 1 button within 700: ' + await within('#b-nest'));
    log('step 1 pad hidden: ' + await page.$eval('#p-pad', e => e.classList.contains('hide')));
    await page.click('#b-nest'); await shot('1-once');
    await page.click('#b-nest'); await page.click('#b-nest');
    await shot('1-nest');
    await page.click('#b-next');
    log('-> ' + await now());
    await shot('2a-empty');
    log('step 2a pad within 700: ' + await within('#w-clear'));
    await type('prints'); await shot('2a-miss');
    await type('not');
    log('2a after rub: ' + await page.$eval('#p-says', e => e.innerText));
    await shot('2a-hit');
    await page.click('#b-next');
    await type('NOT'); await shot('2b-partial');
    await type('NOT PRINTS'); await shot('2b-hit');
    // help mid-play and back
    await page.click('#b-next');
    await page.click('#s-play .qbtn'); await shot('help');
    await page.click('#b-help-back');
    log('back from help: ' + await now());
    log('step 3 pad within 700: ' + await within('#w-clear'));
    await type('not prints'); await shot('3-miss');
    await type('prints'); await type('twice');
    await shot('3-hint');
    log('3 hint: ' + await page.$eval('#p-msg', e => e.innerText));
    await type('not prints twice');
    await shot('3-hit');
    log('3 hit: ' + await page.$eval('#p-says', e => e.innerText));
    await page.click('#b-next');
    await shot('4-doors');
    log('doors buttons within 700: ' + await within('#b-no'));
    await page.click('#b-no'); await page.waitForTimeout(1300);
    await shot('4-never');
    await page.click('#b-d-next');
    await shot('5-empty');
    log('step 5 pad within 700: ' + await within('#w-clear'));
    await type('NOT PRINTS TWICE');
    await shot('5-old');
    log('5 old box: ' + await page.$eval('#p-msg', e => e.innerText));
    await type('not prints ii twice');
    await shot('5-hit');
    await page.click('#b-next');
    await shot('6-cert');
    await page.click('#b-c-yes'); await page.waitForTimeout(500);
    await shot('6-why');
    await page.click('#b-c-next');
    await shot('7-nums');
    await page.click('#b-n-turn'); await page.waitForTimeout(1800);
    await shot('7-turned');
    await page.click('#b-n-next');
    await shot('end');
    log('VERDICT: ' + (await page.$eval('#e-vd', e => e.innerText)).replace(/\n+/g, ' / '));
    await page.click('#b-about'); await shot('about');
  });

  // B: a player who gets stuck, uses Show me, and says "prints it" at the doors
  await run('b', async ({ page, shot, key, type, now, log }) => {
    await page.click('#b-begin');
    await page.click('#b-nest'); await page.click('#b-nest'); await page.click('#b-nest'); await page.click('#b-next');
    for (let i = 0; i < 5; i++) await key('PRINTS');
    log('full: ' + await page.$eval('#p-msg', e => e.innerText));
    await page.click('#w-clear');
    for (let i = 0; i < 4; i++) { await key('P1'); await key('RUB'); }
    await shot('2a-show');
    log('show button visible: ' + await page.$eval('#b-show', e => !e.classList.contains('hide')));
    await page.click('#b-show'); await page.click('#b-next');
    for (let i = 0; i < 4; i++) { await key('NOT'); await key('RUB'); }
    await page.click('#b-show'); await page.click('#b-next');
    for (let i = 0; i < 6; i++) { await key('TWICE'); await key('RUB'); }
    await page.click('#b-show'); await shot('3-shown'); await page.click('#b-next');
    await page.click('#b-yes'); await page.waitForTimeout(1900);
    await shot('4-prints');
    await page.click('#b-d-next');
    for (let i = 0; i < 4; i++) { await key('P2'); await key('RUB'); }
    await page.click('#b-show'); await page.click('#b-next');
    await page.click('#b-c-no'); await page.waitForTimeout(400); await page.click('#b-c-next');
    await page.click('#b-n-turn'); await page.waitForTimeout(1800); await page.click('#b-n-next');
    await shot('end');
    log('VERDICT: ' + (await page.$eval('#e-vd', e => e.innerText)).replace(/\n+/g, ' / '));
    await page.click('#b-again');
    log('play again -> ' + await now());
  });

  fs.writeFileSync('session-log.txt', log.join('\n') + '\n');
  console.log(log.join('\n'));
  await browser.close();
})();
