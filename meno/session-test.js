// Full sessions in a headless browser at phone width (build.md §4.6). Run: node session-test.js
// Five players, one per fate; help opened and closed mid-play; a retry from the end screen; screenshots at 2x.
const { chromium } = require('playwright');
const path = require('path');
const URL = 'file://' + path.resolve(__dirname, 'double-the-square-with-plato.html');
const PEG = { flat1: 0, flat2: 1, flat3: 2, flat4: 3, slant1: 4, slant2: 5 }; // order of allowedLines()
const SESSIONS = [
  { name: 'stranger', guess: 'flat4', moves: ['ask', 'ask', ['slant1', 'ask'], ['slant2', 'ask']], expect: 'found', shots: true },
  { name: 'teller', guess: 'slant2', moves: [['slant2', 'tell']], expect: 'sure' },
  { name: 'lateteller', guess: 'slant2', moves: ['ask', 'ask', ['slant2', 'tell']], expect: 'opinion' },
  { name: 'purist', guess: 'flat3', moves: ['ask', 'ask', 'ask', 'ask', 'ask'], expect: 'stuck' },
  { name: 'shower', guess: 'slant2', moves: [['slant2', 'ask'], ['slant2', 'ask'], ['slant2', 'ask']], expect: 'found' },
];
const HEAD = { found: 'I found it, and I found it again.', opinion: 'I had it yesterday.', sure: 'Twice the line, Meno!', stuck: 'I do not know, Meno.' };
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 380, height: 700 }, deviceScaleFactor: 2 });
  const pg = await ctx.newPage();
  const errs = [];
  pg.on('pageerror', e => errs.push('pageerror: ' + e));
  pg.on('console', m => { if (m.type() === 'error' && !/Failed to load resource|goatcounter|gc\.zgo/.test(m.text())) errs.push('console: ' + m.text()); });
  const W = ms => pg.waitForTimeout(ms);
  const shot = (n, full) => pg.screenshot({ path: path.join(__dirname, 'screenshot-' + n + '.png'), fullPage: !!full });
  const nohs = async l => { const w = await pg.evaluate('document.documentElement.scrollWidth'); if (w > 380) errs.push('hscroll ' + l + ': ' + w); };
  const idle = async () => { for (let k = 0; k < 200; k++) { if (!(await pg.evaluate('window.__G.busy'))) return; await W(100); } };
  await pg.goto(URL); await W(400); await shot('start'); await nohs('start');
  await pg.click('#b-help-start'); await W(150); await shot('help', true); await pg.click('#b-help-close'); await W(100);
  await pg.click('#b-about-start'); await W(150); await shot('about', true); await pg.click('#b-about-close'); await W(100);
  for (const S of SESSIONS) {
    if (S !== SESSIONS[0]) { await pg.click('#b-again'); await W(200); }
    await pg.click('#b-begin'); await W(200);
    await pg.click('#floor-guess .peg[data-k="' + PEG[S.guess] + '"]'); await W(120);
    if (S.shots) { await shot('guess'); await nohs('guess'); }
    await pg.click('#b-guess'); await W(250);
    if (S.shots) {
      await shot('play-0'); await nohs('play');
      const bottom = await pg.evaluate("document.getElementById('b-ask').getBoundingClientRect().bottom");
      console.log('ask button bottom at 380x700:', Math.round(bottom));
      const fl = await pg.evaluate("document.getElementById('floor-play').getBoundingClientRect().top");
      if (bottom > 700 || fl > 700) errs.push('control or floor off screen');
    }
    let k = 0;
    for (const mv of S.moves) {
      k++;
      if (Array.isArray(mv)) {
        await pg.click('#floor-play .peg[data-k="' + PEG[mv[0]] + '"]'); await W(120);
        if (S.shots && k === 3) await shot('play-' + k + '-laid');
        await pg.click(mv[1] === 'tell' ? '#b-tell' : '#b-ask');
      } else await pg.click('#b-ask');
      await W(200); await idle(); await W(1900);
      const now = await pg.textContent('#p-now'), res = await pg.textContent('#p-result'), words = await pg.textContent('#p-words');
      console.log('[' + S.name + '] ' + k + ': ' + now + ' | ' + res + ' | boy: ' + words);
      if (S.shots) { await shot('play-' + k); await nohs('play-' + k); }
      if (S.name === 'shower' && k === 1) await shot('shower-ignored');
      if (S.name === 'teller' && k === 1) await shot('teller-told');
      if (S.shots && k === 2) { // help mid-play, and back to the same place
        const before = await pg.evaluate('JSON.stringify([window.__G.s.purse, window.__G.s.phase])');
        await pg.click('#b-help-play'); await W(150);
        if (!(await pg.evaluate("document.getElementById('help').classList.contains('on')"))) errs.push('help did not open');
        await pg.click('#b-help-close'); await W(100);
        const after = await pg.evaluate('JSON.stringify([window.__G.s.purse, window.__G.s.phase])');
        if (before !== after) errs.push('help lost the lesson state');
      }
    }
    if (!(await pg.isVisible('#b-morning'))) errs.push(S.name + ': no Next morning button');
    await pg.click('#b-morning'); await W(300);
    if (S.shots) await shot('morning-0');
    await pg.click('#b-meno'); await W(200);
    for (let t = 0; t < 120; t++) { if (await pg.isVisible('#b-end')) break; await W(100); }
    await W(300);
    console.log('[' + S.name + '] morning: ' + await pg.textContent('#m-result') + ' | boy: ' + await pg.textContent('#m-words'));
    await shot('morning-' + S.name);
    await pg.click('#b-end'); await W(300);
    const head = await pg.textContent('#v-head');
    console.log('[' + S.name + '] VERDICT ' + head + ' | ' + await pg.textContent('#v-plinth') + ' | ' + await pg.textContent('#v-rungtxt'));
    if (head.replace(/"/g, '') !== HEAD[S.expect]) errs.push(S.name + ': expected ' + S.expect + ', got ' + head);
    await shot('end-' + S.name, true); await nohs('end-' + S.name);
  }
  await pg.click('#b-about-end'); await W(150); await pg.click('#b-about-close');
  console.log(errs.length ? 'ERRORS:\n' + errs.join('\n') : 'no errors; no horizontal scroll at 380 px; five fates reached; help returns to the same place');
  await b.close();
  process.exit(errs.length ? 1 : 0);
})();
