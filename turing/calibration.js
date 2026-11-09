// Calibration check for Turing's Witnesses: runs against mechanism.js (the only copy) in Node.
// The mechanism is a toy built from an argument, so most checks test that the sorting rule says what the paper says,
// cell by cell, and that the one piece of arithmetic in the paper is handled as the paper's own text requires.
const M = require('./mechanism.js');
const C = M.CONFIG;
let pass = 0, fail = 0; const out = [];
function ok(cond, msg) { if (cond) { pass++; out.push('ok   ' + msg); } else { fail++; out.push('FAIL ' + msg); } }

// 1. The specimen sum (p. 434) and the paper's answer, which is wrong (p. 448 licenses deliberate mistakes).
ok(C.sumA + C.sumB === 105721, `34957 + 70764 = 105721 (the mechanism's sum: ${C.sumA + C.sumB})`);
ok(C.sumPaperAnswer === 105621 && C.sumPaperAnswer !== C.sumA + C.sumB, 'the paper\'s specimen answer 105621 is kept and differs from the true sum');
ok(C.sumA + C.sumB - C.sumPaperAnswer === 100, 'the paper\'s answer is wrong by exactly 100 (the game says "by a hundred")');

// 2. The forecast (p. 442).
ok(C.forecastYear + C.forecastHorizon === 2000, 'forecast: 1950 + about fifty years = about 2000');
ok(C.forecastPct === 70 && C.forecastMinutes === 5 && C.forecastStorage === '10^9', 'forecast: 70 per cent, five minutes, 10^9');

// 3. E.S.P. (p. 453): the paper's numbers, and our forty-card run at chance over many seeds.
ok(C.espPaperTelepath / C.espPaperCards > 1 / C.espSuits && Math.abs(C.espPaperMachine / C.espPaperCards - 1 / C.espSuits) < 0.02, 'paper: telepath 130/400 above chance, machine 104/400 at chance');
{
  let sumA = 0, sumB = 0, n = 0, maxA = 0;
  for (let seed = 1; seed <= 500; seed++) {
    const g = M.newGame(seed); const r = M.runTest(g, 'esp', 'chair');
    const a = +r.lines[1].text.match(/(\d+) of/)[1], b = +r.lines[2].text.match(/(\d+) of/)[1];
    sumA += a; sumB += b; n++; maxA = Math.max(maxA, a);
    if (seed === 1) ok(r.lines[1].text.indexOf('of 40') > 0, 'esp line shows "of 40"');
  }
  const meanA = sumA / n, meanB = sumB / n;
  ok(Math.abs(meanA - 10) < 0.6 && Math.abs(meanB - 10) < 0.6, `esp over 500 seeds: mean hits A ${meanA.toFixed(2)}, B ${meanB.toFixed(2)} (chance 10)`);
  ok(maxA < 25, `esp: no seed gives A a telepath's score (max ${maxA} of 40; the paper's telepath rate would be 13)`);
}

// 4. Every demand and check carries its page and its text.
for (const d of M.DEMANDS) ok(d.page && d.line && d.insideA && d.insideB && ['does', 'inner', 'body', 'godel', 'esp'].indexOf(d.kind) >= 0, `demand ${d.key}: page ${d.page}, kind ${d.kind}`);
for (const c of M.CHECKS) ok(c.page && c.does, `check ${c.key}: page ${c.page}`);
ok(M.DEMANDS.length === 15 && M.CHECKS.length === 3, 'fifteen demands, three checks');

// 5. The chair: behaviour passes; the three exceptions are the paper's; claims come back as claims; nothing holds.
for (const d of M.DEMANDS) {
  const g = M.newGame(3); const r = M.runTest(g, d.key, 'chair');
  const expectA = d.key === 'godel' || d.key === 'straw' ? 'fail' : (d.kind === 'inner' || d.key === 'flesh') ? 'says' : 'pass';
  ok(r.A === expectA, `chair/${d.key}: A ${r.A} (expected ${expectA})`);
  const expectSep = d.key === 'godel' || d.key === 'straw';
  ok(r.separated === expectSep && r.holds === false, `chair/${d.key}: separated ${r.separated}, holds ${r.holds}`);
  if (d.key === 'sonnet' || d.key === 'viva') ok(r.B === 'fail' && /wrong way round/.test(r.resultLine), `chair/${d.key}: the person fails, "the wrong way round"`);
  if (d.key === 'godel') ok(r.lines.some(l => /rebuilt/.test(l.text)) && r.lines.filter(l => l.who === 'A').pop().text === 'No.', 'chair/godel: A is rebuilt and the rebuilt machine answers (p. 445)');
  if (d.key === 'sum') ok(r.lines.some(l => l.who === 'A' && l.text.indexOf(String(C.sumPaperAnswer)) === 0 || l.text.indexOf(String(C.sumPaperAnswer)) > 0) && r.lines.some(l => l.who === 'A' && l.text.indexOf(String(C.sumA + C.sumB)) === 0), 'chair/sum: A gives the paper\'s wrong answer first and the right one on the second run');
  if (d.key === 'straw') ok(/beauty competitions/.test(r.lines.map(l => l.text).join(' ')), 'chair/straw: the beauty-competitions condition (p. 435) is stated at the moment it applies');
  if (d.key === 'new') ok(/Lovelace/.test(r.lines.map(l => l.text).join(' ')) && /surprise/.test(r.lines.map(l => l.text).join(' ')), 'chair/new: Lady Lovelace\'s objection and Turing\'s surprise reply (pp. 450-451)');
}

// 6. The case off: mechanism on both sides; the two body findings are the paper's; nothing holds.
for (const d of M.DEMANDS) {
  const g = M.newGame(3); const r = M.runTest(g, d.key, 'open');
  const expectSep = d.key === 'straw' || d.key === 'flesh';
  ok(r.separated === expectSep && r.holds === false && (expectSep ? r.A === 'fail' && r.B === 'pass' : r.A === 'none' && r.B === 'none'), `open/${d.key}: separated ${r.separated} (${r.note || 'nothing found'})`);
  if (!expectSep) ok(/onion/.test(r.lines.map(l => l.text).join(' ')), `open/${d.key}: the onion (pp. 454-455)`);
}

// 7. Being it: cannot be run on either witness, for every demand; Turing's reply typed once per game.
for (const d of M.DEMANDS) { const g = M.newGame(3); const r = M.runTest(g, d.key, 'be'); ok(r.A === 'none' && r.B === 'none' && !r.separated && /running now/.test(r.lines[2].text), `be/${d.key}: could not be run on A or B`); }
{ const g = M.newGame(3); const r1 = M.runTest(g, 'feel', 'be'); const r2 = M.runTest(g, 'soul', 'be'); ok(r1.reply && r1.reply.length === 2 && /polite convention/.test(r1.reply[1]) && r2.reply === null, 'the reply to Jefferson (p. 446) is typed on the first BE IT only'); }

// 8. The counter never moves: all 45 cells, and 300 random six-test games.
{
  let held = 0; for (const d of M.DEMANDS) for (const c of M.CHECKS) { const g = M.newGame(5); held += M.runTest(g, d.key, c.key).holds ? 1 : 0; }
  ok(held === 0, 'no cell of the 45 holds a separation');
  let bad = 0, heads = new Set();
  for (let seed = 1; seed <= 300; seed++) {
    const g = M.newGame(seed); const r = (function () { let s = seed; return () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; }; })();
    for (let i = 0; i < C.tests; i++) M.runTest(g, M.DEMANDS[Math.floor(r() * 15)].key, M.CHECKS[Math.floor(r() * 3)].key);
    if (g.holds !== 0 || M.available(g)) bad++;
    heads.add(M.summary(g).head);
  }
  ok(bad === 0 && heads.size === 1 && heads.has('SIX TESTS. NONE HELD.'), '300 random games: six tests, none held, the same headline');
}

// 9. The forced run when the player never left the chair.
{
  const g = M.newGame(2); for (const k of ['joke', 'moral', 'learn', 'know', 'esp', 'chess']) M.runTest(g, k, 'chair');
  ok(M.needsForced(g), 'six chair tests: the terminal must run the other two checks');
  const f = M.forcedTests(g); ok(f.demand === 'know' && f.tests.length === 2 && f.tests[1].reply, 'forced run uses the player\'s inner demand and types the reply');
  const s = M.summary(g); ok(s.did.length === 3 && /run for you/.test(s.did[1]) && /run for you/.test(s.did[2]), 'the verdict says which lines were run for the player');
  const g2 = M.newGame(2); for (const k of ['joke', 'moral', 'learn', 'sum', 'esp', 'chess']) M.runTest(g2, k, 'chair');
  ok(M.forcedTests(g2).demand === 'feel', 'forced run falls back to "feel pleasure" when no inner demand was tried');
  const g3 = M.newGame(2); for (const k of ['joke', 'moral', 'learn', 'sum', 'esp']) M.runTest(g3, k, 'chair'); M.runTest(g3, 'feel', 'be');
  ok(!M.needsForced(g3), 'one BE IT among six: no forced run');
}

// 10. Coverage of section 6's objections by the demand list.
const cover = { theological: ['soul'], mathematical: ['godel'], consciousness: ['feel', 'know', 'viva'], disabilities: ['joke', 'moral', 'learn', 'straw'], lovelace: ['new'], continuity: ['flesh'], esp: ['esp'] };
for (const k in cover) ok(cover[k].every(d => M.demand(d)), `objection ${k}: played by ${cover[k].join(', ')}`);

// 11. Transcript lengths (the slow line at 40 characters a second, untapped) and no decimals anywhere on screen.
{
  let maxLen = 0, dec = 0;
  const texts = [];
  for (const d of M.DEMANDS) for (const c of M.CHECKS) { const g = M.newGame(9); const r = M.runTest(g, d.key, c.key); const len = r.lines.reduce((a, l) => a + l.text.length, 0); maxLen = Math.max(maxLen, len); r.lines.forEach(l => texts.push(l.text)); texts.push(r.resultLine); }
  M.REPLY.forEach(t => texts.push(t)); M.GROUNDS.forEach(g => texts.push(g.turing)); M.CHECKS.forEach(c => texts.push(c.does)); M.DEMANDS.forEach(d => texts.push(d.line));
  const g = M.newGame(1); ['sonnet', 'godel', 'feel', 'feel', 'feel', 'straw'].forEach((k, i) => M.runTest(g, k, ['chair', 'chair', 'chair', 'open', 'be', 'open'][i]));
  const s = M.summary(g); s.did.concat(s.paper, s.means).forEach(t => texts.push(t)); const cv = M.convention(['B'], 'does'); texts.push(cv.yours, cv.turing, cv.his, cv.last);
  texts.forEach(t => { if (/\d\.\d/.test(t)) dec++; });
  ok(maxLen <= 1500, `longest transcript ${maxLen} characters (under ${Math.round(maxLen / C.charsPerSecond)} s at ${C.charsPerSecond} a second, tap to hurry)`);
  ok(dec === 0, 'no decimal number in any line the player can read');
}

// 12. The convention: four grounds, each with Turing's line; solipsism named only when the player extends it to nobody.
for (const g of M.GROUNDS) { const c = M.convention(['A', 'B', 'elephant'], g.key); ok(/Turing/.test(c.turing) && /YOUR CONVENTION/.test(c.yours) && c.only === null, `ground ${g.key}: readback with Turing's line`); }
ok(M.convention([], 'polite').only !== null && /solipsist/.test(M.convention([], 'polite').only), 'extended to nobody: the solipsist position is named, in Turing\'s words');
ok(M.convention(['A'], 'does').yours === 'YOUR CONVENTION: You and witness A think, on the grounds of what it does.', 'readback sentence');

// --- play it in numbers (build.md section 3): the obvious ways of playing, against the mechanism ---
const strategies = {
  'chair only, things it does': [['sonnet', 'chair'], ['chess', 'chair'], ['joke', 'chair'], ['moral', 'chair'], ['learn', 'chair'], ['new', 'chair']],
  'chair only, things it has': [['feel', 'chair'], ['know', 'chair'], ['soul', 'chair'], ['flesh', 'chair'], ['viva', 'chair'], ['sum', 'chair']],
  'the separation hunter': [['godel', 'chair'], ['straw', 'chair'], ['flesh', 'open'], ['straw', 'open'], ['sum', 'chair'], ['esp', 'chair']],
  'open only': [['feel', 'open'], ['soul', 'open'], ['sonnet', 'open'], ['new', 'open'], ['flesh', 'open'], ['godel', 'open']],
  'be only': [['feel', 'be'], ['know', 'be'], ['soul', 'be'], ['joke', 'be'], ['new', 'be'], ['chess', 'be']],
  'the stranger (memo, section 9)': [['joke', 'chair'], ['moral', 'chair'], ['feel', 'chair'], ['feel', 'open'], ['feel', 'be'], ['godel', 'chair']],
};
out.push('\nPLAY IT IN NUMBERS: strategy | separations seen (transient) | separations that hold | tests that could not be run | forced run?');
for (const name in strategies) {
  const g = M.newGame(11); let seen = 0, none = 0;
  for (const [d, c] of strategies[name]) { const r = M.runTest(g, d, c); if (r.separated) seen++; if (r.A === 'none') none++; }
  out.push(`  ${name.padEnd(32)} | ${seen} | ${g.holds} | ${none} | ${M.needsForced(g) ? 'yes' : 'no'}`);
}
out.push('  Every strategy ends at 0 held; the hunter sees four transient separations (two by a body, one for one machine, one on purpose), which is the paper\'s point, and the chair-only player is run through the other two checks before the verdict.');

out.push(`\n${pass} checks passed, ${fail} failed.`);
console.log(out.join('\n'));
require('fs').writeFileSync(__dirname + '/calibration-result.txt', out.join('\n') + '\n');
process.exit(fail ? 1 : 0);
