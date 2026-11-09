// Calibration check for Dear Household: runs mechanism.js headless against the paper's own numbers.
const M = require('./mechanism.js');
const C = M.CONFIG;
let fails = 0, out = [];
function check(name, ok, detail) { out.push((ok ? 'PASS ' : 'FAIL ') + name + (detail ? '  — ' + detail : '')); if (!ok) fails++; }
const f2 = x => (Math.round(x * 1000) / 1000).toFixed(3);
const histMean = h => h.reduce((a, p, v) => a + p * v, 0) / h.reduce((a, b) => a + b, 0);

// 1. the two histograms read off Table 2's right panel: percentages add to 100, means equal the reported means
check('HIST_BASE sums to 100', M.sum(C.HIST_BASE) === 100, M.sum(C.HIST_BASE));
check('HIST_INF sums to 100', M.sum(C.HIST_INF) === 100, M.sum(C.HIST_INF));
check('HIST_BASE mean = Table 2 constant 2.830 within 0.01', Math.abs(histMean(C.HIST_BASE) - C.BASE_MEAN) < 0.01, f2(histMean(C.HIST_BASE)));
check('HIST_INF mean = 2.830 + 0.477 within 0.01', Math.abs(histMean(C.HIST_INF) - (C.BASE_MEAN + C.INF11)) < 0.01, f2(histMean(C.HIST_INF)));
check('histogram: 0 and 5 are the two most frequent choices and 10 stands above its neighbours 8 and 9, in both (text, section 3.1)', [C.HIST_BASE, C.HIST_INF].every(h => { const top = h.map((p, v) => [p, v]).sort((a, b) => b[0] - a[0]).slice(0, 2).map(x => x[1]).sort().join(); return top === '0,5' && h[10] > h[9] && h[10] > h[8]; }));
check('histogram: fewer zeros and more fives and tens under INF-(1,1) than BASE (text)', C.HIST_INF[0] < C.HIST_BASE[0] && C.HIST_INF[5] > C.HIST_BASE[5] && C.HIST_INF[10] > C.HIST_BASE[10]);

// 2. the cells: Table 2 and Table 3 agree with each other, and the played values stay inside what the paper claims
check('Table 3 constant 3.307 = Table 2 constant 2.830 + INF-(1,1) 0.477', Math.abs(C.BASE_MEAN + C.INF11 - C.INF11_CONSTANT) < 0.001, f2(C.BASE_MEAN + C.INF11));
check('INF-(1,1) raises the plain pledge by about 17% (abstract)', Math.abs(C.INF11 / C.BASE_MEAN - 0.17) < 0.01, f2(C.INF11 / C.BASE_MEAN));
check('OBS-(1,1) point −0.014 is within one SE (0.211) of zero; played as zero', Math.abs(C.OBS11_POINT) < 0.211 && C.OBS11_PLAYED === 0);
check('INF-(20,1) point +0.131 is within one SE (0.414) of zero; played as zero', Math.abs(C.INF20_1_POINT) < 0.414 && C.INF20_1_PLAYED === 0);
check('INF-(1,20) vs BASE = 0.477 − 0.496 = −0.019, "no higher than baseline"; played at the plain mean', Math.abs(C.INF11 + C.INF1_20_POINT) < 0.03 && C.INF1_20_PLAYED_VS_BASE === 0, f2(C.INF11 + C.INF1_20_POINT));
check('INF-(20,20) vs BASE = 0.477 − 0.411 = +0.066, played at its point', Math.abs(C.INF11 + C.INF20_20_POINT - C.INF20_20_PLAYED_VS_BASE) < 0.001, f2(C.INF11 + C.INF20_20_POINT));
check('motive per letter matches the cells', M.motive('plain') === 0 && M.motive('after') === 0 && Math.abs(M.motive('pass') - 0.477) < 1e-9 && Math.abs(M.motive('sheet') - 0.066) < 1e-9 && M.motive('clip') === 0 && Math.abs(M.motive('spokes') - 0.477) < 1e-9);

// 3. wave 2: Table 4 and the text
check('seeing £10 instead of £0 adds 75 pence (text) = slope × 10', Math.abs(C.IMITATION_SLOPE * 10 - 0.75) < 1e-9);
check('a reader who sees an ordinary pledge gives about the plain amount under Table 4 itself (2.536 + 0.075 × 2.83 within 0.1 of 2.83), so centring on the plain pledge is a small liberty', Math.abs(C.IMITATION_CONSTANT + C.IMITATION_SLOPE * C.BASE_MEAN - C.BASE_MEAN) < 0.1, f2(C.IMITATION_CONSTANT + C.IMITATION_SLOPE * C.BASE_MEAN));
check('social multiplier 1/(1 − 0.075) ≈ 1.1 (footnote 14)', Math.abs(1 / (1 - C.IMITATION_SLOPE) - C.MULTIPLIER_TEXT) < 0.03, f2(1 / (1 - C.IMITATION_SLOPE)));
check('beliefs: £2 → £5 seen, Table 4 slope gives +0.225, the text’s raw +0.27, within 0.05', Math.abs(C.IMITATION_SLOPE * 3 - C.BELIEF_2_TO_5.actual) < 0.05);
check('beliefs: participants expected about six times the actual for £2 → £5', C.BELIEF_2_TO_5.expected / C.BELIEF_2_TO_5.actual > 5 && C.BELIEF_2_TO_5.expected / C.BELIEF_2_TO_5.actual < 7, f2(C.BELIEF_2_TO_5.expected / C.BELIEF_2_TO_5.actual));
check('type shares add to one', Math.abs(Object.values(C.TYPE_SHARES).reduce((a, b) => a + b, 0) - 1) < 1e-9);

// 4. streets: totals in saplings (one pound = one sapling)
const plain = M.plainTotal();
check('a plain street plants 56.6 → 57 saplings', Math.round(plain) === 57, f2(plain));
const pass = M.thisStreetMeans('pass');
check('pass it on: this street plants 66 (20 × 3.307)', Math.round(M.sum(pass)) === 66, f2(M.sum(pass)));
const passNext = M.nextStreetMeans('pass', pass);
check('pass it on: next street ripple = 0.075 × 9.54 = 0.72 saplings', Math.abs(M.sum(passNext) - plain - C.IMITATION_SLOPE * (M.sum(pass) - plain)) < 1e-9, f2(M.sum(passNext) - plain));
check('pass it on: the pair’s multiplier is about 1.075 (the paper: 1.1 for a long chain)', Math.abs((M.sum(pass) - plain + M.sum(passNext) - plain) / (M.sum(pass) - plain) - 1.075) < 0.001);
const sp = M.thisStreetMeans('spokes');
check('spokesperson: one household at 3.307, nineteen at 2.830', sp.filter(x => Math.abs(x - 3.307) < 1e-9).length === 1 && sp.filter(x => Math.abs(x - 2.83) < 1e-9).length === 19);
check('spokesperson: next street ripple = 20 × 0.075 × 0.477 = 0.72, the same as pass it on’s', Math.abs(M.sum(M.nextStreetMeans('spokes', sp)) - plain - 20 * C.IMITATION_SLOPE * C.INF11) < 1e-9);
const sh = M.thisStreetMeans('sheet');
check('sheet: this street 57.9 → 58; next street sees the mean and barely moves', Math.round(M.sum(sh)) === 58 && Math.abs(M.sum(M.nextStreetMeans('sheet', sh)) - plain) < 0.2, f2(M.sum(M.nextStreetMeans('sheet', sh)) - plain));
check('clipboard: this street plain; one reader sees the mean; next street plain', Math.round(M.sum(M.thisStreetMeans('clip'))) === 57 && M.seenByNext('clip', M.thisStreetMeans('clip')).filter(x => x !== null).length === 1 && Math.abs(M.sum(M.nextStreetMeans('clip', M.thisStreetMeans('clip'))) - plain) < 1e-9);
check('afterwards and plain send nothing before deciding', M.seenByNext('after', pass).every(x => x === null) && M.seenByNext('plain', pass).every(x => x === null) && !M.needsBet('after') && !M.needsBet('plain'));

// 5. the drawn streets: whole saplings, sum to the rounded total, lumps where the paper has them
for (const l of M.LETTERS) {
  const m = M.thisStreetMeans(l.key), d = M.drawStreet(m);
  check(`drawn street (${l.key}): 20 plots, each 0..10, summing to the rounded total`, d.length === 20 && d.every(v => Number.isInteger(v) && v >= 0 && v <= 10) && M.sum(d) === Math.round(M.sum(m)), M.sum(d) + ' vs ' + Math.round(M.sum(m)));
  const n = M.nextStreetMeans(l.key, m), dn = M.drawStreet(n);
  check(`drawn next street (${l.key}): sums to the rounded total`, M.sum(dn) === Math.round(M.sum(n)), M.sum(dn) + ' vs ' + Math.round(M.sum(n)));
}
const dPlain = M.drawStreet(M.thisStreetMeans('plain'));
check('plain street: about five plots bare, three or four at five, one at ten (histogram × 20)', dPlain.filter(v => v === 0).length === 5 && dPlain.filter(v => v === 5).length >= 3 && dPlain.filter(v => v === 10).length === 1, JSON.stringify(dPlain));
const dPass = M.drawStreet(pass);
check('pass it on street: fewer bare plots than plain, more at five or ten', dPass.filter(v => v === 0).length <= dPlain.filter(v => v === 0).length && dPass.filter(v => v >= 5).length > dPlain.filter(v => v >= 5).length, JSON.stringify(dPass));
check('spokesperson plot is drawn with 3 saplings (its mean 3.307)', M.drawStreet(sp)[C.SPOKES_INDEX] === 3, M.drawStreet(sp)[C.SPOKES_INDEX]);

// 6. the bet
check('bet: expecting 57 or 58 for a ripple of 0.72 is accurate', M.betType(0, 0.72) === 'accurate' && M.betType(1, 0.72) === 'accurate');
check('bet: expecting 54 is under; 63 is mild; 70 is substantial', M.betType(-3, 0.72) === 'under' && M.betType(6, 0.72) === 'mild' && M.betType(13, 0.72) === 'substantial');
check('bet: the paper’s average expectation for a step of 0.477 seen (1.62/3 × 0.477 per household × 20 ≈ 5 saplings) lands as mild, its extreme as substantial', M.betType(5.2, 0.72) === 'mild' && M.betType(10, 0.72) === 'substantial');

// 7. the game: six pairs, then the verdict; the best letter is pass it on, by the paper's own cells
const g = M.newGame(); const keys = ['sheet', 'spokes', 'pass', 'after', 'pass', 'pass'];
for (const k of keys) { const r = M.plantThis(g, k); check(`plantThis(${k}) returns a result`, !!r); M.plantNext(g, M.needsBet(k) ? 70 : null); M.nextPair(g); }
check('six pairs end the game', g.done && g.pairs.length === 6);
check('plantThis refused after the end', M.plantThis(g, 'pass') === null);
const v = M.verdict(g);
check('verdict: plain town 679, best town 741 with pass it on (6 × 123.46)', v.plain === 679 && v.best === 741 && v.bestLetter === 'pass', v.plain + ' ' + v.best + ' ' + v.bestLetter);
check('verdict: this path lands between plain and best', v.town > v.plain && v.town < v.best, v.town);
check('verdict has three lines and five paper lines and the no-names boundary', v.lines.length === 3 && v.paper.length === 5 && /name/.test(v.boundary));
check('verdict: a bet of 70 on every letter that sends is a substantial overestimate', v.type === 'substantial', v.type);
const g2 = M.newGame(); for (let i = 0; i < 6; i++) { M.plantThis(g2, 'pass'); M.plantNext(g2, 58); M.nextPair(g2); }
const v2 = M.verdict(g2);
check('pass it on everywhere with a bet of 58: town = best, type accurate', v2.town === v2.best && v2.type === 'accurate', v2.town + ' ' + v2.type);
const g3 = M.newGame(); for (let i = 0; i < 6; i++) { M.plantThis(g3, 'plain'); M.plantNext(g3, null); M.nextPair(g3); }
check('plain everywhere: town = plain, no bet, no type', M.verdict(g3).town === 679 && M.verdict(g3).type === null);
check('no decimal in any verdict line', [...v.lines, ...v.paper, v.boundary].every(s => !/\d\.\d/.test(s)));
for (const k of keys) { const w = M.LETTER[k]; check(`no decimal in the words for ${k}`, ![...Object.values(M.LETTER[k])].some(s => typeof s === 'string' && /\d\.\d/.test(s))); }
const gw = M.newGame(); for (const k of ['plain', 'sheet', 'spokes', 'pass', 'after', 'clip']) { const r = M.plantThis(gw, k); const r2 = M.plantNext(gw, M.needsBet(k) ? 64 : null); check(`words for ${k} carry no decimals`, ![r.thisWords.what, r.thisWords.came, r.thisWords.paper, r2.nextWords.saw, r2.nextWords.came, r2.nextWords.bet || '', r2.nextWords.paper].some(s => /\d\.\d/.test(s))); M.nextPair(gw); }

// 8. robustness of the central discovery: pass it on beats every other letter on the pair, under alternative choices
function pairTotalsUnder(patch) {
  const saved = {}; for (const k in patch) { saved[k] = C[k]; C[k] = patch[k]; }
  const t = {}; for (const l of M.LETTERS) t[l.key] = M.pairTotalFor(l.key);
  for (const k in saved) C[k] = saved[k];
  return t;
}
function passWins(t, margin) { return M.LETTERS.every(l => l.key === 'pass' || t.pass - t[l.key] >= margin); }
const base = pairTotalsUnder({});
check('baseline: pass it on beats every other letter by at least 7 saplings a pair', passWins(base, 7), JSON.stringify(Object.fromEntries(Object.entries(base).map(([k, v]) => [k, f2(v)]))));
check('with the extensive margin at its point (+0.131): pass it on still wins (the spokesperson is one household)', passWins(pairTotalsUnder({ INF20_1_PLAYED: C.INF20_1_POINT }), 7));
check('with OBS and INF-(1,20) at their points: pass it on still wins', passWins(pairTotalsUnder({ OBS11_PLAYED: C.OBS11_POINT, INF1_20_PLAYED_VS_BASE: C.INF11 + C.INF1_20_POINT }), 7));
check('with the ripple centred on Table 4’s own constant (readers of an ordinary pledge give 2.75): pass it on still wins', passWins(pairTotalsUnder({ IMITATION_CENTRE: (C.BASE_MEAN - C.IMITATION_CONSTANT) / C.IMITATION_SLOPE }), 7));
check('with twice the imitation slope (0.15): pass it on still wins', passWins(pairTotalsUnder({ IMITATION_SLOPE: 0.15 }), 7));
check('with the sheet’s readers copying the mode (5) instead of the mean: pass it on still wins', (() => { const t = pairTotalsUnder({}); const sheetMode = M.sum(M.thisStreetMeans('sheet')) + plain + 20 * C.IMITATION_SLOPE * (5 - C.IMITATION_CENTRE); return t.pass - sheetMode >= 4; })());
check('the discovery is the paper’s: it rests on INF-(1,1) × 20 households, not on the ripple (pass it on wins even with no ripple at all)', passWins(pairTotalsUnder({ IMITATION_SLOPE: 0 }), 7));
check('with INF-(1,1) at the bottom of its 95% interval (0.477 − 1.96 × 0.209 = 0.067): pass it on still edges the sheet', (() => { const t = pairTotalsUnder({ INF11: 0.067, INF20_20_PLAYED_VS_BASE: 0.066 }); return t.pass >= t.sheet - 1; })());

// 9. play it in numbers (build.md §3)
const strategies = {
  'the sheet every time': ['sheet', 'sheet', 'sheet', 'sheet', 'sheet', 'sheet'],
  'the spokesperson every time': ['spokes', 'spokes', 'spokes', 'spokes', 'spokes', 'spokes'],
  'afterwards every time': ['after', 'after', 'after', 'after', 'after', 'after'],
  'the clipboard every time': ['clip', 'clip', 'clip', 'clip', 'clip', 'clip'],
  'plain every time': ['plain', 'plain', 'plain', 'plain', 'plain', 'plain'],
  'one of each': ['plain', 'sheet', 'spokes', 'pass', 'after', 'clip'],
  'the stranger (sheet, spokesperson, then pass it on)': ['sheet', 'spokes', 'pass', 'after', 'pass', 'pass'],
  'pass it on every time': ['pass', 'pass', 'pass', 'pass', 'pass', 'pass']
};
let table = ['Play it in numbers: the town’s saplings after six pairs (plain town ' + Math.round(plain * 12) + ')'];
for (const [name, ks] of Object.entries(strategies)) {
  const gg = M.newGame(); const pairs = [];
  for (const k of ks) { M.plantThis(gg, k); const r = M.plantNext(gg, null); pairs.push(Math.round(r.pairTotal)); M.nextPair(gg); }
  table.push('  ' + name.padEnd(52) + pairs.map(x => String(x).padStart(4)).join('') + '   town ' + M.verdict(gg).town);
}
out.push(''); out.push(...table);
out.push(''); out.push(fails ? fails + ' CHECK(S) FAILED' : 'ALL CHECKS PASSED');
require('fs').writeFileSync(__dirname + '/calibration-result.txt', out.join('\n') + '\n');
console.log(out.join('\n'));
process.exit(fails ? 1 : 0);
