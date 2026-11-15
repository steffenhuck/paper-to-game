// Calibration check for Snow's Cloudy Glass (third build): runs mechanism.js headless against the paper's reported
// numbers, the shape of the map, the rules of a test, the evidence, the strategies and the words (memo, section 17).
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
  const DS = 4267, DL = 473, popS = 266516, popL = 173748; // Table V, non-ascertained distributed; Registrar-General's populations
  const obs = e => ((DS * (1 - e) + DL * e) / popS) / ((DL * (1 - e) + DS * e) / popL);
  let e = 0; while (obs(e) > 3.5 && e < 0.5) e += 0.0005;
  check('A list error of about one death in fourteen turns six to one into three and a half to one, nine mistakes in ten moving a death off the Southwark company (p. 7)', e > 0.06 && e < 0.08 && DS / (DS + DL) > 0.83, 'e = ' + pct(e));
})();
check('Salt: forty grains a gallon against one (p. 3)', P.saltBrown === 40 && P.saltBlue === 0.95);
const shares = [0.23, 0.16, 0.55, 0.57, 0.85, 0.98]; // Tables I and II, houses supplied
C.ROWS.forEach((row, r) => {
  const share = row.housesBrown / (row.housesBrown + row.housesBlue);
  check(row.name + ': share of houses on the town\'s water ' + pct(shares[r]) + ' from the row\'s houses supplied; ' + M.brownCount(row) + ' of 6 on the map', Math.abs(share - shares[r]) < 0.01 && Math.abs(M.brownCount(row) / 6 - share) < 0.1, pct(share));
});
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

// 3. the rules of a test, the evidence, the sentence
(function () {
  const g = M.makeMap(42);
  check('Same seed, same map', JSON.stringify(M.makeMap(42).rows) === JSON.stringify(g.rows));
  const r1 = M.test(g, 2, 0); check('A test spends one of eight, paints the door, and clouds the glass for the town\'s water only', r1.ok && g.tests === 7 && g.rows[2][0].tested && r1.milky === (g.rows[2][0].water === 'brown'));
  check('The same house cannot be tested twice', M.test(g, 2, 0).ok === false);
  check('No sentence before the tests are spent; then one, once', !M.canWrite(g) && !M.writeSentence(g, 'water') && (() => { for (let i = 1; i < 6; i++) M.test(g, 2, i); M.test(g, 3, 0); M.test(g, 3, 1); return g.tests === 0 && M.canWrite(g) && M.writeSentence(g, 'water') && !M.writeSentence(g, 'air') && !M.test(g, 3, 2).ok; })());
  const e = M.evidence(g); check('Evidence: all tests counted; same-street rows counted only where both colours were tested', e.tested === 8 && e.same.rows === g.rows.filter((hs, r) => M.rowTally(g, r).both).length);
  check('ratioOf: one colour untested cannot be told; no blue crape is beyond count; otherwise deaths over houses by colour', isNaN(M.ratioOf({ brown: 3, brownCrape: 1, blue: 0, blueCrape: 0 })) && M.ratioOf({ brown: 3, brownCrape: 1, blue: 2, blueCrape: 0 }) === Infinity && Math.abs(M.ratioOf({ brown: 4, brownCrape: 2, blue: 4, blueCrape: 1 }) - 2) < 1e-9);
  const h = M.makeMap(42); check('Evidence states: none; one colour; confounded (both colours, no shared street); clean (shared street, brown worse)', (() => {
    const s0 = M.evidence(h).state; const bi = [].concat.apply([], h.rows).filter(x => x.water === 'brown' && M.isInland(x.r))[0]; M.test(h, bi.r, bi.i); const s1 = M.evidence(h).state;
    const br = [].concat.apply([], h.rows).filter(x => x.water === 'blue' && M.isRiver(x.r))[0]; M.test(h, br.r, br.i); const s2 = M.evidence(h).state;
    const row = h.rows.find(hs => hs.some(x => x.crape && x.water === 'brown') && hs.some(x => !x.crape && x.water === 'blue')); const a = row.find(x => x.crape && x.water === 'brown'), b = row.find(x => !x.crape && x.water === 'blue'); M.test(h, a.r, a.i); M.test(h, b.r, b.i); const s3 = M.evidence(h).state;
    return s0 === 'none' && s1 === 'oneColour' && s2 === 'confounded' && s3 === 'clean'; })());
  check('The doctor objects to the confounded state with the side of town and concedes the clean one', M.doctor(h).indexOf('nothing to say') >= 0 && (() => { const k = M.makeMap(42); const bi = [].concat.apply([], k.rows).filter(x => x.water === 'brown' && M.isInland(x.r))[0]; M.test(k, bi.r, bi.i); const br = [].concat.apply([], k.rows).filter(x => x.water === 'blue' && M.isRiver(x.r))[0]; M.test(k, br.r, br.i); return M.doctor(k).indexOf('cannot tell') >= 0; })());
})();

// 4. the strategies (the numbers table, build.md §3)
(function () {
  const N = 600, res = {};
  ['crapeOnly', 'sides', 'random', 'column', 'middle', 'pairs'].forEach(k => { const bands = {}, states = {}; for (let seed = 1; seed <= N; seed++) { const v = M.runStrategy(seed, k).verdict; bands[v.band] = (bands[v.band] || 0) + 1; states[v.state] = (states[v.state] || 0) + 1; } res[k] = { bands, states }; });
  const sh = (k, b) => (res[k].bands[b] || 0) / N, st = (k, s) => (res[k].states[s] || 0) / N;
  check('The doctor\'s comparison (inland crape against riverside houses) and the air: wrong in every game, and unable to answer him (confounded, or no crape where both waters met) in at least nine in ten', sh('sides', 'air') === 1 && st('sides', 'confounded') + st('sides', 'nocrape') + st('sides', 'oneColour') >= 0.9, JSON.stringify(res.sides.states));
  check('Testing the crape houses only: the sentence unsupported in at least two games in five (nothing to compare with, or confounded)', sh('crapeOnly', 'unsupported') >= 0.4, JSON.stringify(res.crapeOnly.bands));
  check('A crape house in a middle street and its neighbours: agrees with Snow in at least seven games in ten', sh('pairs', 'agree') >= 0.7, JSON.stringify(res.pairs.bands));
  check('The middle streets at random: agrees in at least six games in ten', sh('middle', 'agree') >= 0.6, JSON.stringify(res.middle.bands));
  check('Where you test matters: the middle streets agree at least twice as often as houses anywhere at random, and three times as often as one house per street', sh('middle', 'agree') >= 2 * sh('random', 'agree') && sh('middle', 'agree') >= 3 * sh('column', 'agree'), pct(sh('middle', 'agree')) + ' vs random ' + pct(sh('random', 'agree')) + ' vs column ' + pct(sh('column', 'agree')));
  check('A same-street comparison finds the upriver water the worse in fewer than 5% of games (flat, with crape at the blue houses only)', (() => { let n = 0; for (let seed = 1; seed <= N; seed++) { const v = M.runStrategy(seed, 'middle').verdict; if (v.state === 'flat' && v.evidence.ratioSame < 1) n++; } return n / N < 0.05; })());
})();

// 5. robustness of the discovery to the designer's choices
(function () {
  const N = 300;
  [5, 20].forEach(k => { let pairs = 0, col = 0; for (let seed = 1; seed <= N; seed++) { if (M.runStrategy(seed, 'pairs', { compression: k, noFloors: true }).verdict.band === 'agree') pairs++; if (M.runStrategy(seed, 'column', { compression: k, noFloors: true }).verdict.band === 'agree') col++; } check('Compression ' + k + ', no floors: the neighbour strategy still agrees with Snow more often than one house per street', pairs > col, pct(pairs / N) + ' vs ' + pct(col / N)); });
  [6, 12].forEach(t => { const save = C.TESTS; C.TESTS = t; let mid = 0, rnd = 0; for (let seed = 1; seed <= N; seed++) { if (M.runStrategy(seed, 'middle').verdict.band === 'agree') mid++; if (M.runStrategy(seed, 'random').verdict.band === 'agree') rnd++; } C.TESTS = save; check(t + ' tests: the middle streets still beat random placement', mid > rnd, pct(mid / N) + ' vs ' + pct(rnd / N)); });
})();

// 6. words
(function () {
  let bad = 0, n = 0;
  for (let seed = 1; seed <= 200; seed++) ['crapeOnly', 'sides', 'random', 'column', 'middle', 'pairs'].forEach(k => { const r = M.runStrategy(seed, k); const v = r.verdict; [v.snow, v.you, v.part, v.had, v.sideLine, v.later, M.line(r.game), M.doctor(r.game)].forEach(t => { n++; if (/\d\.\d/.test(t) || /NaN|undefined|Infinity/.test(t)) { bad++; if (bad < 3) out.push('   bad line: ' + t); } }); });
  check('No decimal, NaN, Infinity or undefined in any verdict, map line or doctor\'s line over 1200 games', bad === 0, n + ' lines');
})();

const summary = (fails === 0 ? 'ALL PASSED' : fails + ' FAILED') + ' (' + out.filter(l => /^(PASS|FAIL)/.test(l)).length + ' checks)';
out.push(summary); console.log(out.join('\n'));
require('fs').writeFileSync(__dirname + '/calibration-result.txt', out.join('\n') + '\n');
process.exit(fails ? 1 : 0);
