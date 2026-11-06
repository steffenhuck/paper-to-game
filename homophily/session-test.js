// Browser session test (build step 6), iteration 2: drives home-judges.html at 380 × 760 through a full session.
// Checks on every screen: no vertical or horizontal page scrolling, every control inside the viewport, badges at least
// 44 px tap targets. Run: node session-test.js [outdir] > session-log.txt   (needs playwright)
const { chromium } = require('playwright');
const D = (process.argv[2] || __dirname) + '/';
const W = 380, H = 760;
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 2 });
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + __dirname + '/home-judges.html'); await p.waitForTimeout(300);
  const txt = sel => p.$eval(sel, e => e.innerText.replace(/\n+/g, ' / '));
  const fit = async (name) => {
    const r = await p.evaluate(([W, H]) => {
      const s = document.querySelector('.screen.on'), de = document.documentElement;
      const out = [];
      if (de.scrollWidth > W) out.push('page scrollWidth ' + de.scrollWidth);
      if (de.scrollHeight > H) out.push('page scrollHeight ' + de.scrollHeight);
      if (s.scrollHeight > s.clientHeight + 1) out.push(`screen content ${s.scrollHeight} > ${s.clientHeight}`);
      s.querySelectorAll('button').forEach(e => { const q = e.getBoundingClientRect(); if (q.width && (q.bottom > H + 1 || q.right > W + 1 || q.left < -1)) out.push('off-screen button: ' + (e.getAttribute('aria-label') || e.innerText).slice(0, 30)); });
      s.querySelectorAll('.jc').forEach(e => { const q = e.getBoundingClientRect(); if (q.width && !e.closest('.example') && (q.width < 44 || q.height < 44)) out.push(`small badge ${Math.round(q.width)}x${Math.round(q.height)}`); });
      return out;
    }, [W, H]);
    r.forEach(x => errs.push(name + ': ' + x));
    console.log(`  [${name}] fits 380×760: ${r.length ? 'NO ' + r.join('; ') : 'yes'}`);
  };
  const shot = async n => { await p.screenshot({ path: D + 'screenshot-' + n + '.png' }); await fit(n); };
  const vis = sel => p.$eval(sel, e => !!(e.offsetWidth || e.offsetHeight));
  console.log('START: ' + await txt('#s-start .aim')); await shot('start');
  console.log('  badge label: ' + await p.$eval('#ex1 .jc', e => e.getAttribute('aria-label')));
  console.log('  help screen or ? button present:', await p.$$eval('#s-help, .q, [data-help]', x => x.length));
  await p.click('#b-play'); await p.waitForTimeout(150); await shot('rules');
  await p.click('#b-r1'); await p.waitForTimeout(150); await shot('r1-empty');
  const mirror = ['DE/DE', 'DE/DE', 'IT/IT', 'IT/IT', 'UK/UK', 'UK/UK', 'FR/FR', 'ES/ES', 'US/US', 'NL/NL', 'BE/BE', 'SE/SE', 'DE/CH', 'IT/UK', 'PL/PL'];
  const seat = async code => { const [pp, ww] = code.split('/'); const id = await p.$eval(`#pool .jc:not(.ghost)[data-p="${pp}"][data-w="${ww}"]`, e => e.dataset.id); await p.click(`#pool .jc[data-id="${id}"]`); await p.waitForTimeout(40); };
  for (let k = 0; k < 14; k++) await seat(mirror[k]);
  console.log('  after 14 judges: bars visible', await vis('#bars1'), '| reveal visible', await vis('#r1-reveal'), '| any text feedback element:', await p.$$eval('#s-r1 .info', x => x.length));
  // unseat and reseat one, to check tapping a seated badge
  await p.click('#table1 .jc[data-seat="0"]'); await p.waitForTimeout(40); console.log('  unseat one ->', await txt('#cnt1'));
  await seat('DE/DE'); await shot('r1-14');
  await seat(mirror[14]); await p.waitForTimeout(900);
  console.log('REVEAL: ' + await txt('#r1-reveal')); await shot('r1-reveal');
  await p.click('#b-r2'); await p.waitForTimeout(800);
  console.log('ROUND 2: bars ' + await txt('#bars2') + ' | instr: ' + await txt('#instr'));
  const meterPos = () => p.$eval('#meter .mmark', e => e.style.left);
  console.log('  meter marker at', await meterPos(), '| level?', await p.$eval('#meter', e => e.classList.contains('won'))); await shot('r2-start');
  const seatOf = code => { const [a, w] = code.split('/'); return p.$eval(`#table2 .jc[data-p="${a}"][data-w="${w}"]`, e => e.dataset.seat); };
  const benchOf = code => { const [a, w] = code.split('/'); return p.$eval(`#bench .jc[data-p="${a}"][data-w="${w}"]`, e => e.dataset.bench); };
  const doSwap = async (o, i, snap) => {
    await p.click(`#table2 .jc[data-seat="${await seatOf(o)}"]`); await p.waitForTimeout(100);
    if (snap) { console.log('  after selecting a panel judge: bench pulses', await p.$eval('#benchbox', e => e.classList.contains('next')), '| instruction visible', await vis('#instr')); await shot(snap); }
    await p.click(`#bench .jc[data-bench="${await benchOf(i)}"]`); await p.waitForTimeout(700);
    console.log(`  swap ${o} -> ${i}: marker ${await meterPos()} | bars ${await txt('#bars2')}`);
  };
  await doSwap('SE/SE', 'PT/PT', 'r2-selected');
  await p.click('#b-reset'); await p.waitForTimeout(300); console.log('  RESET: marker', await meterPos(), '| swaps used', await p.$$eval('.pip.used', x => x.length));
  await doSwap('DE/DE', 'IL/IL'); await doSwap('DE/DE', 'FI/FI'); await doSwap('IT/IT', 'PT/PT'); await doSwap('IT/IT', 'PL/PL');
  await p.waitForTimeout(500); console.log('RESULT: ' + await txt('#r2-result')); await shot('r2-level');
  await p.click('#b-end'); await p.waitForTimeout(200); console.log('VERDICT: ' + await txt('#s-end')); await shot('end');
  await p.click('#b-about-end'); await p.waitForTimeout(100); await shot('about'); await p.click('#b-about-back'); console.log('  back on verdict', await vis('#s-end'));
  // replay: a balanced first panel, then DONE without swapping
  await p.click('#b-again'); await p.click('#b-r1'); await p.waitForTimeout(150);
  for (const c of ['DE/DE', 'US/US', 'NL/NL', 'BE/BE', 'SE/SE', 'PL/PL', 'IL/IL', 'DK/DK', 'FI/FI', 'PT/PT', 'CZ/CZ', 'GR/GR', 'AT/AT', 'DE/CH', 'IT/UK']) await seat(c);
  await p.waitForTimeout(900); console.log('REPLAY REVEAL: ' + await txt('#r1-result'));
  await p.click('#b-r2'); await p.waitForTimeout(300); await p.click('#b-done'); await p.waitForTimeout(400);
  console.log('REPLAY RESULT: ' + await txt('#r2-result')); await shot('r2-notyet');
  await p.click('#b-end'); await p.waitForTimeout(200); console.log('REPLAY VERDICT: ' + await txt('#v-did'));
  console.log('errors', errs); await b.close(); process.exitCode = errs.length ? 1 : 0;
})();
