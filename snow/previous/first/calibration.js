// Calibration check for Snow's Cloudy Glass: runs mechanism.js headless against the paper's reported numbers
// (memo, section 17). The mechanism is reconstructed from Tables I and II, so the checks are of the rows it carries,
// the aggregates it quotes, the shape of the draw over many seeds, the estimator, and the words.
const M = require('./mechanism.js');
const C = M.CONFIG;
let fails = 0, out = [];
function check(name, ok, detail) { out.push((ok ? 'PASS ' : 'FAIL ') + name + (detail !== undefined ? '  — ' + detail : '')); if (!ok) fails++; }
const f1 = x => (Math.round(x * 10) / 10).toFixed(1), f2 = x => (Math.round(x * 100) / 100).toFixed(2);
const pct = x => Math.round(100 * x) + '%';
const SEEDS = 3000;

// 1. every street row: deaths over persons supplied reproduces the table's mortality per 10,000 (within rounding)
C.STREETS.forEach(s => {
  const rb = s.deathsBrown / s.popBrown * 10000;
  check(s.name + ': Southwark & Vauxhall rate ' + s.rateBrown + ' per 10,000 from ' + s.deathsBrown + ' deaths among ' + s.popBrown, Math.abs(rb - s.rateBrown) <= 0.15, f2(rb));
  if (s.rateBlue !== null) { const rl = s.deathsBlue / s.popBlue * 10000; check(s.name + ': Lambeth rate ' + s.rateBlue + ' per 10,000 from ' + s.deathsBlue + ' deaths among ' + s.popBlue, Math.abs(rl - s.rateBlue) <= 0.15, f2(rl)); }
  else check(s.name + ': Lambeth rate not reported (no deaths among ' + s.popBlue + '); the mixed-subdistrict Lambeth figure is used', s.deathsBlue === 0 && Math.abs(C.LAMBETH_OVERALL_DEATHS / C.LAMBETH_OVERALL_HOUSES * 10000 / (143901 / 20554) - 6.8) < 0.1);
  const phB = s.popBrown / s.housesBrown, phL = s.popBlue / (s.housesBlue || 1);
  check(s.name + ': the supplied population is houses times one constant for both companies (so deaths over houses carries the table\'s ratio)', Math.abs(phB - phL) < 0.15 || s.housesBlue === 0, f2(phB) + ' / ' + f2(phL) + ' (printed ' + s.perHouse + ')');
});

// 2. the aggregates the verdict quotes
const P = C.PAPER;
const t1b = P.table1.deathsBrown / P.table1.popBrown * 10000, t1l = P.table1.deathsBlue / P.table1.popBlue * 10000;
check('Table I totals: 47.2 and 6.8 per 10,000 from 507 of 107,290 and 98 of 143,901', Math.abs(t1b - 47.2) <= 0.1 && Math.abs(t1l - 6.8) <= 0.1, f1(t1b) + ' / ' + f1(t1l));
check('Table I totals: "about seven times" (the verdict\'s word for these seven weeks)', Math.round(t1b / t1l) === 7, f1(t1b / t1l));
check('Table I totals: 98 deaths over 20,554 houses is the figure used for Battersea\'s Lambeth house', C.LAMBETH_OVERALL_DEATHS === 98 && C.LAMBETH_OVERALL_HOUSES === 20554);
const f4b = P.first4.deathsBrown / P.first4.popBrown * 100000, f4l = P.first4.deathsBlue / P.first4.popBlue * 100000;
check('First four weeks: 107 and 8 per 100,000 from 286 of 266,516 and 14 of 173,748', Math.round(f4b) === 107 && Math.round(f4l) === 8, f1(f4b) + ' / ' + f1(f4l));
check('First four weeks: "between thirteen and fourteen times" (p. 4)', f4b / f4l > 13 && f4b / f4l < 14, f1(f4b / f4l));
check('Last ten weeks: 916 against 180 per 100,000 is "more than five times" (p. 5)', P.last10.perBrown / P.last10.perBlue > 5, f1(P.last10.perBrown / P.last10.perBlue));
check('Whole epidemic: 160 against 27 per 10,000 is "six to one" (p. 7)', Math.round(P.whole.perBrown / P.whole.perBlue) === 6, f1(P.whole.perBrown / P.whole.perBlue));
check('The Board\'s inquiry: 125 against 37 is "three and a half to one" (p. 7)', Math.abs(P.board.perBrown / P.board.perBlue - 3.5) < 0.15, f2(P.board.perBrown / P.board.perBlue));
// the mistakes run one way: with a share e of deaths put on the wrong company's list, the Board's ratio follows from Snow's
(function () {
  const DS = 4267, DL = 473, popS = 266516, popL = 173748; // Table V, non-ascertained distributed; Registrar-General's populations
  const obs = e => ((DS * (1 - e) + DL * e) / popS) / ((DL * (1 - e) + DS * e) / popL);
  let e = 0; while (obs(e) > 3.5 && e < 0.5) e += 0.0005;
  check('A list error of about one death in fourteen turns six to one into three and a half to one (p. 7, "five would transfer a death from the former company to the latter")', e > 0.06 && e < 0.08, 'e = ' + pct(e) + '; 5 of 6 mistakes move a death from S&V to Lambeth: ' + f2(DS / (DS + DL)));
  check('Residents\' wrong-word rate is that error doubled, within rounding (our choice)', Math.abs(C.RESIDENT_WRONG - 2 * e) < 0.01, f2(C.RESIDENT_WRONG) + ' vs ' + f2(2 * e));
})();
check('Salt: Southwark & Vauxhall water about forty grains a gallon, Lambeth under one (p. 3)', P.saltBrown === 40 && P.saltBlue === 0.95);

// 3. the street as drawn: composition and per-house odds carry the table's ratio
C.STREETS.forEach(s => {
  const nb = M.brownCount(s), share = s.housesBrown / (s.housesBrown + s.housesBlue);
  check(s.name + ': ' + nb + ' of 18 houses on Southwark & Vauxhall water (table share ' + pct(share) + ')', Math.abs(nb / 18 - share) < 0.06, pct(nb / 18));
  const r = M.perHouseProb(s, 'brown') / M.perHouseProb(s, 'blue'), tr = M.rate(s, 'brown') / M.rate(s, 'blue');
  check(s.name + ': per-house odds ratio equals the table\'s ratio of rates (' + f1(tr) + ')', Math.abs(r - tr) < 0.01, f1(r));
  check(s.name + ': per-house probability under one at compression ' + C.COMPRESSION, M.perHouseProb(s, 'brown') < 1 && M.perHouseProb(s, 'blue') < 1, pct(M.perHouseProb(s, 'brown')) + ' / ' + pct(M.perHouseProb(s, 'blue')));
});
check('Compression does not change the expected ratio over the three knock streets (5, 10, 20)', Math.abs(M.expectedRatio(5) - M.expectedRatio(20)) < 0.01, f1(M.expectedRatio()));

// 4. the draw over many seeds, unconstrained: the realised rate ratio per street is the table's within 10%, and the floors bind rarely
(function () {
  const dead = C.STREETS.map(() => ({ bd: 0, bh: 0, ld: 0, lh: 0 })), bound = C.STREETS.map(() => 0), crape = C.STREETS.map(() => []), order = { ok: 0 };
  let wrong = 0, unsure = 0, said = 0, tested = 0;
  for (let seed = 1; seed <= SEEDS; seed++) {
    const g = M.newGame(seed, { noFloors: true });
    g.streets.forEach((s, i) => { s.houses.forEach(h => { if (h.water === 'brown') { dead[i].bh++; if (h.crape) dead[i].bd++; } else { dead[i].lh++; if (h.crape) dead[i].ld++; } if (h.word === null) unsure++; else { said++; if (h.word !== h.water) wrong++; } tested++; }); });
    if (g.streets[1].crape > g.streets[2].crape) order.ok++;
    const g2 = M.newGame(seed); g2.streets.forEach((s, i) => { crape[i].push(s.crape); if (s.redraws > 0) bound[i]++; });
  }
  C.STREETS.forEach((s, i) => {
    const d = dead[i], rr = (d.bd / d.bh) / (d.ld / d.lh), tr = M.rate(s, 'brown') / M.rate(s, 'blue');
    const tol = d.lh * M.perHouseProb(s, 'blue') < 300 ? 0.2 : 0.1; // Battersea has one blue house: few blue deaths to count
    check(s.name + ': realised rate ratio over ' + SEEDS + ' unconstrained streets within ' + pct(tol) + ' of ' + f1(tr), Math.abs(rr / tr - 1) < tol, f1(rr));
    const a = crape[i], mn = Math.min(...a), mx = Math.max(...a);
    check(s.name + ': crape doors stay within floor ' + s.crapeMin + ' and cap ' + s.crapeMax + ' over ' + SEEDS + ' seeds', mn >= s.crapeMin && mx <= s.crapeMax, mn + '–' + mx + ', mean ' + f1(a.reduce((p, q) => p + q, 0) / a.length) + '; a floor or cap bound in ' + pct(bound[i] / SEEDS) + ' of seeds');
  });
  check('Battersea has more crape than Lambeth Church in at least 95% of unconstrained draws (the parish line is not made by the floors)', order.ok / SEEDS >= 0.95, pct(order.ok / SEEDS));
  check('Residents: about one in four cannot say; of those who can, about one in seven is wrong', Math.abs(unsure / tested - C.RESIDENT_UNSURE) < 0.02 && Math.abs(wrong / said - C.RESIDENT_WRONG) < 0.02, pct(unsure / tested) + ' / ' + pct(wrong / said));
  check('Street one leaves at least two knocks for living doors (crape cap 5 under 7 knocks)', C.STREETS[0].crapeMax <= C.KNOCKS - 2);
})();

// 5. determinism and the rules of a knock
(function () {
  const a = M.newGame(42), b = M.newGame(42);
  check('Same seed, same streets', JSON.stringify(a.streets) === JSON.stringify(b.streets));
  const g = M.newGame(42); const s = M.current(g);
  const first = M.knock(g, 0); check('A knock spends one of seven and puts one house in one pane', first.ok && s.knocksLeft === 6 && Object.values(g.window).reduce((p, q) => p + q, 0) === 1);
  check('The same door cannot be tested twice', M.knock(g, 0).ok === false);
  check('The glass clouds for Southwark & Vauxhall water and only then', first.rec.milky === (s.houses[0].water === 'brown'));
  for (let i = 1; i < 18 && s.knocksLeft > 0; i++) M.knock(g, i);
  check('Seven knocks end the street', s.knocksLeft === 0 && s.done && M.knock(g, 17).ok === false);
  M.nextStreet(g); M.nextStreet(g); M.nextStreet(g);
  check('Marks: at most five, toggled off by a second tap', M.mark(g, 0) && M.mark(g, 1) && M.mark(g, 2) && M.mark(g, 3) && M.mark(g, 4) && !M.mark(g, 5) && M.mark(g, 0) && M.marksPlaced(g) === 4);
  const r = M.monthPasses(g); check('The month passes once', r !== null && M.monthPasses(g) === null && r.hits + r.missed === r.crape);
})();

// 6. the estimator and the bands, over strategies (the numbers table, build.md §3)
(function () {
  const N = 600, res = {};
  ['crapeOnly', 'crapeThenLiving', 'halfHalf', 'livingOnly', 'random'].forEach(k => {
    const bands = {}, ratios = [], truths = [];
    for (let seed = 1; seed <= N; seed++) { const v = M.runStrategy(seed, k, 'brown').verdict; bands[v.band] = (bands[v.band] || 0) + 1; if (v.estimate.kind === 'both' && isFinite(v.estimate.ratio)) ratios.push(v.estimate.ratio); truths.push(v.truth.ratio); }
    ratios.sort((p, q) => p - q); res[k] = { bands, median: ratios.length ? ratios[Math.floor(ratios.length / 2)] : NaN };
  });
  check('Knocking only at crape doors never yields a number (the trap: no second row)', res.crapeOnly.bands.noLiving === N, JSON.stringify(res.crapeOnly.bands));
  check('Knocking only at living doors never yields a number', res.livingOnly.bands.noCrape === N, JSON.stringify(res.livingOnly.bands));
  check('Crape first, then living: the median finite estimate within 5 and 10 (Snow\'s seven; pooled expectation ' + f1(M.expectedRatio()) + ')', res.crapeThenLiving.median >= 5 && res.crapeThenLiving.median <= 10, f1(res.crapeThenLiving.median) + ' ' + JSON.stringify(res.crapeThenLiving.bands));
  check('Crape first, then living: agrees with Snow or finds the gap wider in at least three games in four', (res.crapeThenLiving.bands.agree + res.crapeThenLiving.bands.high) / N >= 0.75, pct((res.crapeThenLiving.bands.agree + res.crapeThenLiving.bands.high) / N));
  check('Half and half: median estimate within 3.5 and 10', res.halfHalf.median >= 3.5 && res.halfHalf.median <= 10, f1(res.halfHalf.median) + ' ' + JSON.stringify(res.halfHalf.bands));
  check('No strategy with both rows finds Battersea water the safer (band low with ratio under 1 in fewer than 3% of games)', (() => { let n = 0; for (let seed = 1; seed <= N; seed++) { const v = M.runStrategy(seed, 'random', 'brown').verdict; if (v.estimate.kind === 'both' && v.estimate.ratio < 1) n++; } return n / N < 0.03; })());
  let hb = 0, hl = 0; for (let seed = 1; seed <= N; seed++) { hb += M.runStrategy(seed, 'crapeThenLiving', 'brown').game.prediction.hits; hl += M.runStrategy(seed, 'crapeThenLiving', 'blue').game.prediction.hits; }
  check('Prediction street: five brown marks hit about six times as often as five blue (Borough Road 68.2 against 10.4)', hb / hl > 4 && hb / hl < 9, f1(hb / N) + ' vs ' + f1(hl / N) + ' hits');
})();

// 7. robustness of the discovery to the designer's choices
(function () {
  const N = 400;
  [5, 20].forEach(k => {
    const ratios = []; for (let seed = 1; seed <= N; seed++) { const v = M.runStrategy(seed, 'crapeThenLiving', 'brown', { compression: k, noFloors: true }).verdict; if (v.estimate.kind === 'both' && isFinite(v.estimate.ratio)) ratios.push(v.estimate.ratio); }
    ratios.sort((p, q) => p - q); const med = ratios[Math.floor(ratios.length / 2)];
    check('Compression ' + k + ', no floors: the sensible player\'s median finite estimate stays within 3.5 and 20', med >= 3.5 && med <= 20, f1(med) + ' from ' + ratios.length + ' finite of ' + N);
  });
  const ks = [5, 9]; ks.forEach(kn => { let agreeOrHigh = 0; const save = C.KNOCKS; C.KNOCKS = kn; for (let seed = 1; seed <= N; seed++) { const v = M.runStrategy(seed, 'crapeThenLiving', 'brown', { noFloors: true }).verdict; if (v.band === 'agree' || v.band === 'high') agreeOrHigh++; } C.KNOCKS = save; check(kn + ' knocks a street, no floors: the sensible player still finds the water guilty in at least 70% of games', agreeOrHigh / N >= 0.7, pct(agreeOrHigh / N)); });
})();

// 8. words: no decimal anywhere the player reads
(function () {
  let bad = 0, n = 0;
  for (let seed = 1; seed <= 300; seed++) ['crapeOnly', 'crapeThenLiving', 'random', 'livingOnly'].forEach(k => { const v = M.runStrategy(seed, k, 'random').verdict; [v.snow, v.you, v.part, v.had, v.parish, v.prediction || '', v.residents, v.later, M.windowLine(M.newGame(seed))].forEach(t => { n++; if (/\d\.\d/.test(t) || /NaN|undefined|Infinity/.test(t)) bad++; }); });
  check('No decimal, NaN or undefined in any verdict or window line over 1200 games', bad === 0, n + ' lines');
  check('Number words to twenty-nine', M.numberWord(21) === 'twenty-one' && M.numberWord(7) === 'seven' && M.numberWord(0) === 'no');
})();

const summary = (fails === 0 ? 'ALL PASSED' : fails + ' FAILED') + ' (' + out.length + ' checks)';
out.push(summary); console.log(out.join('\n'));
require('fs').writeFileSync(__dirname + '/calibration-result.txt', out.join('\n') + '\n');
process.exit(fails ? 1 : 0);
