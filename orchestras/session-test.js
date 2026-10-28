// Browser session test (build step 6): drives the-more-the-better.html at 380 px through a full session.
// Run: node session-test.js (needs playwright). Screenshots go to the system temp folder, or to the folder given as argv[2].
const { chromium } = require('playwright');
const M = require('./mechanism.js');
(async () => {
  const D = (process.argv[2] || require('os').tmpdir()) + '/';
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 380, height: 760 }, deviceScaleFactor: 2 });
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + __dirname + '/the-more-the-better.html');
  const t0 = Date.now();
  const shot = name => p.screenshot({ path: D + name + '.png', fullPage: true });
  const noHScroll = async () => p.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth);
  const on = id => p.$eval('#' + id, e => e.classList.contains('on'));
  await shot('a-start');
  console.log('start screen text:', (await p.$eval('#s-start', e => e.innerText)).replace(/\n+/g, ' | ').slice(0, 400));
  await p.click('#b-start');
  await shot('b-bet');
  await p.click('#b-major');
  await p.waitForTimeout(900);
  console.log('bet verdict:', await p.$eval('#opener-verdict', e => e.innerText));
  await shot('c-bet-reveal');
  await p.click('#b-opener-next');

  // draw by tapping in the chart: column i at value v
  const C = M.CONFIG, [YMIN, YMAX] = C.yWindow;
  async function tap(i, v) {
    const box = await p.$eval('#chart', e => { const r = e.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; });
    const sx = box.w / 360, sy = box.h / 318;
    const X0 = 44, XSTEP = 72, YTOP = 18, YBOT = 212;
    const x = box.x + (X0 + i * XSTEP) * sx, y = box.y + (YBOT - (v - YMIN) / (YMAX - YMIN) * (YBOT - YTOP)) * sy;
    await p.mouse.click(x, y);
  }
  const plans = {
    relationships: [null, 5.4, 5.6, 5.7, 5.8],
    security:      [null, 5.0, 4.6, 4.4, 4.9],
    stability:     [null, 6.1, 5.7, 5.4, 6.0],
    involvement:   [null, 5.4, 4.8, 4.6, 5.2],
    structure:     [null, 5.0, 4.6, 4.5, 4.9],
    integrity:     [null, 5.3, 4.9, 4.6, 4.9],
  };
  async function playSet(ids, tag) {
    for (let r = 0; r < ids.length; r++) {
      const id = ids[r];
      console.log(`\nround ${tag}${r + 1}: ${await p.$eval('#measure-name', e => e.innerText)} — ${await p.$eval('#round-label', e => e.innerText)}`);
      console.log('  show enabled before drawing:', !(await p.$eval('#b-show', e => e.disabled)));
      if (r === 0 && tag === '') { await shot('d-draw-empty'); }
      // drag across two columns, then tap the rest
      for (let i = 1; i < 5; i++) await tap(i, plans[id][i]);
      if (r === 0 && tag === '') {
        await shot('e-draw-done');
        // help mid-play and back
        await p.click('#b-q-play'); await shot('f-help');
        console.log('  help open:', await on('s-help'));
        await p.click('#b-help-back');
        console.log('  back on play with dots kept:', await on('s-play'), await p.$eval('#b-show', e => !e.disabled));
      }
      console.log('  show enabled after drawing:', !(await p.$eval('#b-show', e => e.disabled)));
      await p.click('#b-show');
      await p.waitForFunction(() => document.getElementById('after').style.display === 'block', null, { timeout: 10000 });
      console.log('  verdict:', await p.$eval('#verdict', e => e.innerText));
      await shot(`g-${tag}reveal-${r + 1}`);
      console.log('  horizontal scroll ok:', await noHScroll());
      await p.click('#b-next');
    }
  }
  await playSet(C.rounds, '');
  console.log('\nEND:', await p.$eval('#end-you', e => e.innerText));
  await shot('h-end');
  await p.click('#b-more');
  await playSet(C.replayRounds, 's');
  console.log('\nEND after second set:', await p.$eval('#end-you', e => e.innerText));
  console.log('two-more button hidden now:', await p.$eval('#b-more', e => e.style.display === 'none'));
  await shot('i-end-2');
  await p.click('#b-about2'); await shot('j-about'); await p.click('#b-about-back');
  console.log('back from about lands on end:', await on('s-end'));
  await p.click('#b-again'); console.log('play again lands on start:', await on('s-start'));
  console.log('\nerrors:', errs.length ? errs : 'none', '| scripted session took', ((Date.now() - t0) / 1000).toFixed(0), 's (a person reads and thinks; estimate 3–5 min)');
  await b.close();
  if (errs.length) process.exit(1);
})();
