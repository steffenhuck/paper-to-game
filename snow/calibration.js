// Calibration check for Snow's Cloudy Glass (fourth build): runs mechanism.js headless against the paper's reported
// numbers, the shape of the map, the rules of a test and the concession, the evidence, the strategies and the words.
const M = require('./mechanism.js');
const C = M.CONFIG;
let fails = 0, out = [];
function check(name, ok, detail) { out.push((ok ? 'PASS ' : 'FAIL ') + name + (detail !== undefined ? '  — ' + detail : '')); if (!ok) fails++; }
const f1 = x => (Math.round(x * 10) / 10).toFixed(1), f2 = x => (Math.round(x * 100) / 100).toFixed(2);
const pct = x => Math.round(100 * x) + '%';
const SEEDS = 3000;

// 1. the rates and the rows
const P = C.PAPER;
check('Rates: 507 of 16,038 houses and 98 of 20,554 (Table I totals, first seven weeks), about seven to one', C.DEATHS_BROWN === 507 && C.HOUSES_BROWN === 16038 && C.DEATHS_BLUE === 98 && C.HOUSES_BLUE === 20554 && Math.round(M.rate('brown') / M.rate('blue')) === 7, f1(M.rate('brown') / M.rate('blue')));
const t1b = P.table1.deathsBrown / P.table1.popBrown * 10000, t1l = P.table1.deathsBlue / P.table1.popBlue * 10000;
check('Table I totals: 47.2 and 6.8 per 10,000 from the same deaths over the supplied population', Math.abs(t1b - 47.2) <= 0.1 && Math.abs(t1l - 6.8) <= 0.1, f1(t1b) + ' / ' + f1(t1l));
check('Per-house chance of crape at compression 10: about a third for the town\'s water, about one in twenty for the upriver water', M.perHouseProb('brown') > 0.3 && M.perHouseProb('brown') < 0.34 && M.perHouseProb('blue') > 0.04 && M.perHouseProb('blue') < 0.055, pct(M.perHouseProb('brown')) + ' / ' + pct(M.perHouseProb('blue')));
const f4b = P.first4.deathsBrown / P.first4.popBrown * 100000, f4l = P.first4.deathsBlue / P.first4.popBlue * 100000;
check('First four weeks: 107 and 8 per 100,000; "between thirteen and fourteen times" (p. 4)', Math.round(f4b) === 107 && Math.round(f4l) === 8 && f4b / f4l > 13 && f4b / f4l < 14, f1(f4b / f4l));
check('Next three weeks eight to one, last ten more than five, whole epidemic six to one, the Board three and a half (pp. 4–7)', P.next3.ratio === 8 && P.last10.perBrown / P.last10.perBlue > 5 && Math.round(P.whole.perBrown / P.whole.perBlue) === 6 && Math.abs(P.board.perBrown / P.board.perBlue - 3.5) < 0.15);
(function () {
  const DS = 4267, DL = 473, popS = 266516, popL = 173748;
  const obs = e => ((DS * (1 - e) + DL * e) / popS) / ((DL * (1 - e) + DS * e) / popL);
  let e = 0; while (obs(e) > 3.5 && e < 0.5) e += 0.0005;
  check('A list error of about one death in fourteen turns six to one into three and a half to one, nine mistakes in ten moving a death off the Southwark company (p. 7)', e > 0.06 && e < 0.08 && DS / (DS + DL) > 0.83, 'e = ' + pct(e));
})();
check('Salt: forty grains a gallon against one (p. 3)', P.saltBrown === 40 && P.saltBlue === 0.95);
const shares = [0.23, 0.16, 0.55, 0.57, 0.85, 0.98];
C.ROWS.forEach((row, r) => { const share = row.housesBrown / (row.housesBrown + row.housesBlue); check(row.name + ': share of houses on the town\'s water ' + pct(shares[r]) + ' from the row\'s houses supplied; ' + M.brownCount(row) + ' of 6 on the map', Math.abs(share - shares[r]) < 0.01 && Math.abs(M.brownCount(row) / 6 - share) < 0.1, pct(share)); });
check('Riverside rows mostly on the upriver water, inland rows mostly on the town\'s water (p. 7), the middle rows mixed', M.brownCount(C.ROWS[0]) <= 2 && M.brownCount(C.ROWS[1]) <= 2 && M.brownCount(C.ROWS[4]) >= 4 && M.brownCount(C.ROWS[5]) >= 5 && M.brownCount(C.ROWS[2]) === 3 && M.brownCount(C.ROWS[3]) === 3);

// 2. the map over many seeds
(function () {
  let bd = 0, bh = 0, ld = 0, lh = 0, crapes = [], inlandMore = 0, cleanRow = 0, bound = 0, mixedNeighbourMiddle = 0, middleCrape = 0;
  for (let seed = 1; seed <= SEEDS; seed++) {
    const g = M.makeMap(seed, { noFloors: true }); const all = [].concat.apply([], g.rows);
    all.forEach(h => { if (h.water === 'brown') { bh++; if (h.crape) bd++; } else { lh++; if (h.crape) ld++; } });
    const inl = all.filter(h => h.crape && M.isInland(h.r)).length, riv = all.filter(h => h.crape && M.isRiver(h.r)).length; if (inl > riv) inlandMore++;
    if (g.rows.some(hs => hs.some(h => h.crape && h.water === 'brown') && hs.some(h => !h.crape && h.water === 'blue'))) cleanRow++;
    const g2 = M.makeMap(seed); crapes.push([].concat.apply([], g2.rows).filter(h => h.crape).length); if (g2.redraws > 0) bound++;
    g2.rows.forEach((hs, r) => { if (C.ROWS[r].side !== 'middle') return; hs.forEach((h, i) => { if (!h.crape) return; middleCrape++; if ([hs[i - 1], hs[i + 1]].filter(Boolean).some(n => n.water !== h.water)) mixedNeighbourMiddle++; }); });
  }
  const rr = (bd / bh) / (ld / lh);
  check('Realised rate ratio over ' + SEEDS + ' unconstrained maps within 10% of the paper\'s ' + f1(M.rate('brown') / M.rate('blue')), Math.abs(rr / (M.rate('brown') / M.rate('blue')) - 1) < 0.1, f1(rr));
  check('Unconstrained: more crape inland than by the river in at least four maps in five (the doctor\'s pattern is the tables\', not the floors\')', inlandMore / SEEDS >= 0.8, pct(inlandMore / SEEDS));
  check('Unconstrained: a street with a brown crape house and a blue house without exists in at least nine maps in ten', cleanRow / SEEDS >= 0.9, pct(cleanRow / SEEDS));
  check('Crape within floors 5–10 over ' + SEEDS + ' seeds', Math.min(...crapes) >= C.CRAPE_MIN && Math.max(...crapes) <= C.CRAPE_MAX, Math.min(...crapes) + '–' + Math.max(...crapes) + ', mean ' + f1(crapes.reduce((p, q) => p + q, 0) / crapes.length) + '; some floor bound in ' + pct(bound / SEEDS) + ' of seeds');
  check('Position is real: a crape house in a middle street has a neighbour on the other pipe in at least two cases in three', mixedNeighbourMiddle / middleCrape >= 0.66, pct(mixedNeighbourMiddle / middleCrape));
})();

// 3. the rules of a test, the concession, the evidence, the sentence
(function () {
  const g = M.makeMap(42);
  check('Same seed, same map', JSON.stringify(M.makeMap(42).rows) === JSON.stringify(g.rows));
  const r1 = M.test(g, 2, 0); check('A test spends one of ten, paints the door, and clouds the glass for the town\'s water only', r1.ok && g.tests === 9 && g.used === 1 && g.rows[2][0].tested && r1.milky === (g.rows[2][0].water === 'brown'));
  check('The same house cannot be tested twice', M.test(g, 2, 0).ok === false);
  check('A sentence can be written after the first glass, once, and then no more tests', M.canWrite(g) && !M.writeSentence(g, 'nonsense') && M.writeSentence(g, 'water') && !M.writeSentence(g, 'air') && !M.test(g, 2, 1).ok);
  check('No sentence before the first glass', !M.canWrite(M.makeMap(42)));
  const h = M.makeMap(42);
  const seq = (() => {
    const s0 = M.evidence(h).state; const bi = [].concat.apply([], h.rows).filter(x => x.water === 'brown' && M.isInland(x.r))[0]; M.test(h, bi.r, bi.i); const s1 = M.evidence(h).state;
    const br = [].concat.apply([], h.rows).filter(x => x.water === 'blue' && M.isRiver(x.r))[0]; M.test(h, br.r, br.i); const s2 = M.evidence(h).state; const c2 = h.concededAt;
    const row = h.rows.find(hs => hs.some(x => x.crape && x.water === 'brown') && hs.some(x => !x.crape && x.water === 'blue')); const a = row.find(x => x.crape && x.water === 'brown'), b = row.find(x => !x.crape && x.water === 'blue'); M.test(h, a.r, a.i); const r = M.test(h, b.r, b.i);
    return { s0, s1, s2, c2, s3: M.evidence(h).state, conceded: r.conceded, at: h.concededAt };
  })();
  check('Evidence states in sequence: none; one colour; confounded (both colours, no shared street); clean (shared street, crape at the brown)', seq.s0 === 'none' && seq.s1 === 'oneColour' && seq.s2 === 'confounded' && seq.s3 === 'clean', JSON.stringify(seq));
  check('The doctor concedes at the glass that makes the evidence clean, and the count is fixed there', seq.c2 === null && seq.at !== null && seq.at >= 3 && seq.at <= 4, JSON.stringify({ at: seq.at }));
  check('The doctor objects to the confounded state with the side of town', (() => { const k = M.makeMap(42); const bi = [].concat.apply([], k.rows).filter(x => x.water === 'brown' && M.isInland(x.r))[0]; M.test(k, bi.r, bi.i); const br = [].concat.apply([], k.rows).filter(x => x.water === 'blue' && M.isRiver(x.r))[0]; M.test(k, br.r, br.i); return M.doctor(k).indexOf('cannot tell') >= 0; })());
  check('After the concession the doctor says so, and more tests do not move the count', (() => { const at = h.concededAt; let n = 0; [].concat.apply([], h.rows).forEach(x => { if (!x.tested && h.tests > 0 && n < 3) { M.test(h, x.r, x.i); n++; } }); return M.doctor(h).indexOf('conceded') >= 0 && h.concededAt === at && h.used === at + 3; })());
  check('ratioOf: one colour untested cannot be told; no blue crape is beyond count; otherwise deaths over houses by colour', isNaN(M.ratioOf({ brown: 3, brownCrape: 1, blue: 0, blueCrape: 0 })) && M.ratioOf({ brown: 3, brownCrape: 1, blue: 2, blueCrape: 0 }) === Infinity && Math.abs(M.ratioOf({ brown: 4, brownCrape: 2, blue: 4, blueCrape: 1 }) - 2) < 1e-9);
})();

// 4. the verdict judges the tests, not the answer
(function () {
  const right = M.runStrategy(3, 'anchorHunt').verdict; check('Identified and wrote the water: band identified, headline "stands alone", sentence carried', right.identified && right.band === 'identified' && right.head.indexOf('stands alone') >= 0 && right.sentenceLine.indexOf('carry it') >= 0);
  let guessed = null; for (let seed = 1; seed <= 200 && !guessed; seed++) { const v = M.runStrategy(seed, 'crapeFirst').verdict; if (!v.identified) guessed = v; }
  check('Wrote the water without identification: band guessed, and the sentence line says a right answer is not identification', guessed && guessed.band === 'guessed' && guessed.sentenceLine.indexOf('not identification') >= 0 && guessed.head.indexOf('tangled') >= 0);
  let air = null; for (let seed = 1; seed <= 200 && !air; seed++) { const g = M.runStrategy(seed, 'anchorHunt').game; if (g.concededAt) { g.sentence = null; g.sentence = 'air'; const v = M.verdict(g); air = v; } }
  check('Identified but wrote the air: band identifiedWroteAir; own tests say otherwise', air && air.band === 'identifiedWroteAir' && air.sentenceLine.indexOf('your own tests say so') >= 0);
  check('Speed names the glass of concession', right.speed.indexOf(M.ordinal(right.concededAt)) >= 0);
})();

// 5. the strategies (the numbers table, build.md §3)
(function () {
  const N = 1000, res = {};
  Object.keys(M.STRATEGIES).forEach(k => { const by = Array(C.TESTS + 1).fill(0); let never = 0; for (let seed = 1; seed <= N; seed++) { const v = M.runStrategy(seed, k).verdict; if (v.identified) { for (let t = v.concededAt; t <= C.TESTS; t++) by[t]++; } else never++; } res[k] = { by: by.map(x => x / N), never: never / N }; });
  check('Anchor and hunt (a crape door in a mixed street, then its street until a blue): conceded by the third glass in at least four games in five, by the fourth in nine in ten', res.anchorHunt.by[3] >= 0.8 && res.anchorHunt.by[4] >= 0.9, pct(res.anchorHunt.by[3]) + ' / ' + pct(res.anchorHunt.by[4]));
  check('Anchor and hunt: never fails within ten in more than 2% of games', res.anchorHunt.never <= 0.02, pct(res.anchorHunt.never));
  check('The crape doors first: conceded by the fourth glass in fewer than 5% of games, and never within ten in more than half', res.crapeFirst.by[4] < 0.05 && res.crapeFirst.never > 0.5, pct(res.crapeFirst.by[4]) + ' / never ' + pct(res.crapeFirst.never));
  check('The doctor\'s comparison (inland crape against riverside houses): never conceded within ten in at least nine games in ten', res.sides.never >= 0.9, pct(res.sides.never));
  check('Random placement: never within ten in at least half the games; one house per street likewise', res.random.never >= 0.5 && res.column.never >= 0.5, pct(res.random.never) + ' / ' + pct(res.column.never));
  check('The benchmarks the verdict quotes hold: best plan at the second or third glass in most games; crape first at nine or more when at all', res.anchorHunt.by[3] >= 0.8 && res.crapeFirst.by[8] < 0.3, pct(res.crapeFirst.by[8]) + ' of crape-first games conceded by the eighth');
})();

// 6. robustness of the discovery to the designer's choices
(function () {
  const N = 300;
  [5, 20].forEach(k => { let ah = 0, cf = 0; for (let seed = 1; seed <= N; seed++) { if (M.runStrategy(seed, 'anchorHunt', { compression: k, noFloors: true }).verdict.identified) ah++; if (M.runStrategy(seed, 'crapeFirst', { compression: k, noFloors: true }).verdict.identified) cf++; } check('Compression ' + k + ', no floors: anchor and hunt still identifies far more often than the crape doors first', ah >= cf + N * 0.3, pct(ah / N) + ' vs ' + pct(cf / N)); });
  [6, 14].forEach(t => { const save = C.TESTS; C.TESTS = t; let ah = 0, rd = 0; for (let seed = 1; seed <= N; seed++) { if (M.runStrategy(seed, 'anchorHunt').verdict.identified) ah++; if (M.runStrategy(seed, 'random').verdict.identified) rd++; } C.TESTS = save; check('Cap of ' + t + ' glasses: anchor and hunt still beats random placement by thirty points', ah >= rd + N * 0.3, pct(ah / N) + ' vs ' + pct(rd / N)); });
})();

// 7. words
(function () {
  let bad = 0, n = 0;
  for (let seed = 1; seed <= 200; seed++) Object.keys(M.STRATEGIES).forEach(k => { const r = M.runStrategy(seed, k); const v = r.verdict; [v.head, v.ident, v.sentenceLine, v.speed, v.snow, v.had, v.sideLine, v.later, M.line(r.game), M.doctor(r.game)].forEach(t => { n++; if (/\d\.\d/.test(t) || /NaN|undefined|Infinity/.test(t)) { bad++; if (bad < 3) out.push('   bad line: ' + t); } }); });
  check('No decimal, NaN, Infinity or undefined in any verdict, map line or doctor\'s line over 1000 games', bad === 0, n + ' lines');
})();

const summary = (fails === 0 ? 'ALL PASSED' : fails + ' FAILED') + ' (' + out.filter(l => /^(PASS|FAIL)/.test(l)).length + ' checks)';
out.push(summary); console.log(out.join('\n'));
require('fs').writeFileSync(__dirname + '/calibration-result.txt', out.join('\n') + '\n');
process.exit(fails ? 1 : 0);
