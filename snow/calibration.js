// Calibration check for Snow's Cloudy Glass (rebuild): runs mechanism.js headless against the paper's reported
// numbers, the shape of the draw, the rules of a pair, the window, the strategies and the words (memo, section 17).
const M = require('./mechanism.js');
const C = M.CONFIG;
let fails = 0, out = [];
function check(name, ok, detail) { out.push((ok ? 'PASS ' : 'FAIL ') + name + (detail !== undefined ? '  — ' + detail : '')); if (!ok) fails++; }
const f1 = x => (Math.round(x * 10) / 10).toFixed(1), f2 = x => (Math.round(x * 100) / 100).toFixed(2);
const pct = x => Math.round(100 * x) + '%';
const SEEDS = 3000;

// 1. the two rows
C.STREETS.forEach(s => {
  const rb = s.deathsBrown / s.popBrown * 10000;
  check(s.name + ': Southwark & Vauxhall rate ' + s.rateBrown + ' per 10,000 from ' + s.deathsBrown + ' deaths among ' + s.popBrown + ' (within 0.3; Snow\'s own rounding puts Waterloo Road at 25.6 where the division gives 25.4)', Math.abs(rb - s.rateBrown) <= 0.3, f2(rb));
  if (s.rateBlue !== null) { const rl = s.deathsBlue / s.popBlue * 10000; check(s.name + ': Lambeth rate ' + s.rateBlue + ' per 10,000 from ' + s.deathsBlue + ' deaths among ' + s.popBlue, Math.abs(rl - s.rateBlue) <= 0.15, f2(rl)); }
  else check(s.name + ': Lambeth rate not reported (no deaths among ' + s.popBlue + '); the mixed-subdistrict figure 98 of 20,554 is used', s.deathsBlue === 0 && C.LAMBETH_OVERALL_DEATHS === 98 && C.LAMBETH_OVERALL_HOUSES === 20554);
  const phB = s.popBrown / s.housesBrown, phL = s.popBlue / (s.housesBlue || 1);
  check(s.name + ': the supplied population is houses times one constant for both companies (so deaths over houses carries the row\'s ratio)', Math.abs(phB - phL) < 0.15, f2(phB) + ' / ' + f2(phL) + ' (printed ' + s.perHouse + ')');
  const nb = M.brownCount(s), share = s.housesBrown / (s.housesBrown + s.housesBlue);
  check(s.name + ': ' + nb + ' of 12 houses on the town\'s water (row share ' + pct(share) + ')', Math.abs(nb / 12 - share) < 0.06, pct(nb / 12));
  const r = M.perHouseProb(s, 'brown') / M.perHouseProb(s, 'blue'), tr = M.rate(s, 'brown') / M.rate(s, 'blue');
  check(s.name + ': per-house odds ratio equals the row\'s deaths-over-houses ratio (' + f1(tr) + ')', Math.abs(r - tr) < 0.01, f1(r));
  check(s.name + ': per-house probabilities under one at compression ' + C.COMPRESSION, M.perHouseProb(s, 'brown') < 1 && M.perHouseProb(s, 'blue') < 1, pct(M.perHouseProb(s, 'brown')) + ' / ' + pct(M.perHouseProb(s, 'blue')));
});
check('Waterloo Road is the mixed street (a quarter of its houses on the town\'s water) and Battersea nearly all on it (p. 3, p. 7)', M.brownCount(C.STREETS[1]) === 3 && M.brownCount(C.STREETS[0]) === 11);

// 2. the aggregates the verdict quotes
const P = C.PAPER;
const t1b = P.table1.deathsBrown / P.table1.popBrown * 10000, t1l = P.table1.deathsBlue / P.table1.popBlue * 10000;
check('Table I totals: 47.2 and 6.8 per 10,000 from 507 of 107,290 and 98 of 143,901', Math.abs(t1b - 47.2) <= 0.1 && Math.abs(t1l - 6.8) <= 0.1, f1(t1b) + ' / ' + f1(t1l));
check('Table I totals: "about seven times" (the verdict\'s word for these seven weeks)', Math.round(t1b / t1l) === 7, f1(t1b / t1l));
const f4b = P.first4.deathsBrown / P.first4.popBrown * 100000, f4l = P.first4.deathsBlue / P.first4.popBlue * 100000;
check('First four weeks: 107 and 8 per 100,000 from 286 of 266,516 and 14 of 173,748; "between thirteen and fourteen times" (p. 4)', Math.round(f4b) === 107 && Math.round(f4l) === 8 && f4b / f4l > 13 && f4b / f4l < 14, f1(f4b / f4l));
check('Next three weeks "nearly eight times", last ten "more than five times" (pp. 4–5)', P.next3.ratio === 8 && P.last10.perBrown / P.last10.perBlue > 5, f1(P.last10.perBrown / P.last10.perBlue));
check('Whole epidemic: 160 against 27 per 10,000 is "six to one"; the Board\'s 125 against 37 is "three and a half to one" (p. 7)', Math.round(P.whole.perBrown / P.whole.perBlue) === 6 && Math.abs(P.board.perBrown / P.board.perBlue - 3.5) < 0.15, f1(P.whole.perBrown / P.whole.perBlue) + ' / ' + f2(P.board.perBrown / P.board.perBlue));
(function () {
  const DS = 4267, DL = 473, popS = 266516, popL = 173748; // Table V, non-ascertained distributed; Registrar-General's populations
  const obs = e => ((DS * (1 - e) + DL * e) / popS) / ((DL * (1 - e) + DS * e) / popL);
  let e = 0; while (obs(e) > 3.5 && e < 0.5) e += 0.0005;
  check('A list error of about one death in fourteen turns six to one into three and a half to one; nine mistakes in ten move a death off the Southwark company (p. 7: "five would transfer a death from the former company to the latter")', e > 0.06 && e < 0.08 && DS / (DS + DL) > 0.83, 'e = ' + pct(e) + '; share of deaths behind S&V doors ' + pct(DS / (DS + DL)));
  check('Residents\' wrong-word rate is that error doubled, within rounding (our choice)', Math.abs(C.RESIDENT_WRONG - 2 * e) < 0.01, f2(C.RESIDENT_WRONG) + ' vs ' + f2(2 * e));
})();
check('Salt: Southwark & Vauxhall water about forty grains a gallon, Lambeth under one (p. 3)', P.saltBrown === 40 && P.saltBlue === 0.95);

// 3. the draw over many seeds
(function () {
  const dead = C.STREETS.map(() => ({ bd: 0, bh: 0, ld: 0, lh: 0 })), crape = C.STREETS.map(() => []), bound = [0, 0];
  let wrong = 0, unsure = 0, said = 0, tested = 0, wrongFloorMet = 0, mixedNeighbourW = 0, crapeW = 0, mixedNeighbourB = 0, crapeB = 0;
  for (let seed = 1; seed <= SEEDS; seed++) {
    const g = M.newGame(seed, { noFloors: true });
    g.streets.forEach((s, i) => { s.houses.forEach(h => { if (h.water === 'brown') { dead[i].bh++; if (h.crape) dead[i].bd++; } else { dead[i].lh++; if (h.crape) dead[i].ld++; } if (h.word === null) unsure++; else { said++; if (h.word !== h.water) wrong++; } tested++; }); });
    const g2 = M.newGame(seed);
    g2.streets.forEach((s, i) => { crape[i].push(s.crape); if (s.redraws > 0) bound[i]++; s.houses.forEach((h, k) => { if (!h.crape) return; const nb = [s.houses[k - 1], s.houses[k + 1]].filter(Boolean); const mixed = nb.some(n => n.water !== h.water); if (i === 1) { crapeW++; if (mixed) mixedNeighbourW++; } else { crapeB++; if (mixed) mixedNeighbourB++; } }); });
    if (g2.streets[0].houses.some(h => h.crape && h.word !== null && h.word !== h.water)) wrongFloorMet++;
  }
  C.STREETS.forEach((s, i) => {
    const d = dead[i], rr = (d.bd / d.bh) / (d.ld / d.lh), tr = M.rate(s, 'brown') / M.rate(s, 'blue');
    const tol = 0.2; // one blue house on Battersea and three brown on Waterloo Road: few of one colour to count
    check(s.name + ': realised rate ratio over ' + SEEDS + ' unconstrained streets within ' + pct(tol) + ' of ' + f1(tr), Math.abs(rr / tr - 1) < tol, f1(rr));
    const a = crape[i], mn = Math.min(...a), mx = Math.max(...a);
    check(s.name + ': crape doors within floor ' + s.crapeMin + ' and cap ' + s.crapeMax + ' over ' + SEEDS + ' seeds', mn >= s.crapeMin && mx <= s.crapeMax, mn + '–' + mx + ', mean ' + f1(a.reduce((p, q) => p + q, 0) / a.length) + '; some floor bound in ' + pct(bound[i] / SEEDS) + ' of seeds');
  });
  check('Every game has at least one Battersea crape door with a wrong word (the floor, so the drift can be met)', wrongFloorMet === SEEDS, pct(wrongFloorMet / SEEDS));
  check('Residents: about one in four cannot say; of those who can, about one in seven is wrong (unconstrained)', Math.abs(unsure / tested - C.RESIDENT_UNSURE) < 0.02 && Math.abs(wrong / said - C.RESIDENT_WRONG) < 0.02, pct(unsure / tested) + ' / ' + pct(wrong / said));
  check('Position is real: a Waterloo Road crape door has a neighbour on the other pipe in at least three games in four; a Battersea one in fewer than one in four', mixedNeighbourW / crapeW >= 0.75 && mixedNeighbourB / crapeB < 0.25, pct(mixedNeighbourW / crapeW) + ' / ' + pct(mixedNeighbourB / crapeB));
})();

// 4. the rules of a pair, a check, the offers, the book
(function () {
  const g = M.newGame(42), s0 = g.streets[0], s1 = g.streets[1];
  check('Same seed, same streets', JSON.stringify(M.newGame(42).streets) === JSON.stringify(g.streets));
  const o = g.offers.first; check('The doctor\'s first offer: one pair, a Battersea crape door against a Waterloo Road living door', o.length === 1 && o[0].a.s === 0 && M.house(g, o[0].a).crape && o[0].b.s === 1 && !M.house(g, o[0].b).crape);
  check('His pair\'s card: different in the street', M.card(g, o[0].a, o[0].b).street === true && M.card(g, o[0].a, o[0].b).kind === 'muddled');
  const cr = s1.houses.find(h => h.crape), li = s1.houses.find(h => !h.crape && h.water !== cr.water), same = s1.houses.find(h => !h.crape && h.water === cr.water);
  check('A pair needs a crape door first and a door without crape second', M.canPair(g, { s: 1, i: li.i }, { s: 1, i: cr.i }) !== null && M.canPair(g, { s: 1, i: cr.i }, { s: 1, i: li.i }) === null);
  const r1 = M.makePair(g, { s: 1, i: cr.i }, { s: 1, i: li.i }, 'glass');
  check('A glass pair costs two knocks, knows both doors by the glass, and its card reads clean when the waters differ', r1.ok && g.knocks === C.KNOCKS - 2 && cr.known === 'glass' && li.known === 'glass' && r1.rec.card.kind === 'clean');
  const r2 = M.makePair(g, { s: 1, i: cr.i }, { s: 1, i: same.i }, 'ask');
  check('An asked pair costs one knock and knows the doors by word', r2.ok && g.knocks === C.KNOCKS - 3 && same.known === 'word');
  check('Same-street same-water pair reads nothing (by the glass)', (() => { const h = M.newGame(42); const c = h.streets[0].houses.find(x => x.crape); const n = h.streets[0].houses.find(x => !x.crape && x.water === c.water); return M.makePair(h, { s: 0, i: c.i }, { s: 0, i: n.i }, 'glass').rec.card.kind === 'nothing'; })());
  check('A check needs a door known by word and costs one knock; afterwards the door is known by the glass', (() => { const h = M.newGame(42); const c = h.streets[0].houses.find(x => x.crape); const n = h.streets[0].houses.find(x => !x.crape); M.makePair(h, { s: 0, i: c.i }, { s: 0, i: n.i }, 'ask'); const bad = M.check(h, { s: 1, i: 0 }); const ok = M.check(h, { s: 0, i: c.i }); return bad.ok === false && ok.ok && h.knocks === C.KNOCKS - 2 && c.known === 'glass' && M.check(h, { s: 0, i: c.i }).ok === false; })());
  check('The second offer comes once four knocks are spent, three pairs across the streets', (() => { const h = M.newGame(42); const c = h.streets[0].houses.filter(x => x.crape), n = h.streets[0].houses.filter(x => !x.crape); M.makePair(h, { s: 0, i: c[0].i }, { s: 0, i: n[0].i }, 'glass'); const before = !h.offers.second; M.makePair(h, { s: 0, i: c[0].i }, { s: 0, i: n[1].i }, 'glass'); return before && h.offers.second && h.offers.second.length === 3 && h.offers.second.every(p => p.a.s === 0 && p.b.s === 1); })());
  check('The book closes after two pairs or at no knocks; a sentence needs a closed book', (() => { const h = M.newGame(42); const c = h.streets[0].houses.filter(x => x.crape), n = h.streets[0].houses.filter(x => !x.crape); const c0 = M.canClose(h); M.makePair(h, { s: 0, i: c[0].i }, { s: 0, i: n[0].i }, 'ask'); const c1 = M.canClose(h); M.makePair(h, { s: 0, i: c[0].i }, { s: 0, i: n[1].i }, 'ask'); const w0 = M.writeSentence(h, 'water'); return !c0 && !c1 && M.canClose(h) && !w0 && M.closeBook(h) && M.writeSentence(h, 'water') && !M.makePair(h, { s: 0, i: c[0].i }, { s: 0, i: n[2].i }, 'ask').ok; })());
  check('The doctor\'s pairs stay out of the window (same-street pairs only)', (() => { const h = M.newGame(42); M.acceptOffer(h, 'first'); return M.windowFrom(h, false).pairs === 0 && h.doctor.length === 1; })());
  check('Knocks cannot go below zero', (() => { const h = M.newGame(5); const c = h.streets[0].houses.filter(x => x.crape), n = h.streets[0].houses.filter(x => !x.crape); let k = 0; for (let t = 0; t < 20; t++) { const r = M.makePair(h, { s: 0, i: c[0].i }, { s: 0, i: n[t % n.length].i }, 'glass'); if (r.ok) k++; } return h.knocks === 0 && k === 4; })());
})();

// 5. the window and its ratio
(function () {
  check('ratioOf: all brown cannot be told; no blue crape is beyond count; a mixed window gives deaths over doors by colour', isNaN(M.ratioOf({ crapeBrown: 3, crapeBlue: 0, liveBrown: 3, liveBlue: 0 })) && M.ratioOf({ crapeBrown: 3, crapeBlue: 0, liveBrown: 1, liveBlue: 2 }) === Infinity && Math.abs(M.ratioOf({ crapeBrown: 4, crapeBlue: 1, liveBrown: 4, liveBlue: 3 }) - (0.5 / 0.25)) < 1e-9);
  check('A wrong word at a crape door narrows the window: one brown crape door called blue turns "beyond count" into "about twice"', (() => { const a = M.ratioOf({ crapeBrown: 4, crapeBlue: 0, liveBrown: 3, liveBlue: 2 }); const b = M.ratioOf({ crapeBrown: 3, crapeBlue: 1, liveBrown: 3, liveBlue: 2 }); return a === Infinity && b > 1 && b < 3; })(), f1(M.ratioOf({ crapeBrown: 3, crapeBlue: 1, liveBrown: 3, liveBlue: 2 })));
})();

// 6. the strategies (the numbers table, build.md §3)
(function () {
  const N = 600, res = {};
  ['doctor', 'askNext', 'askThenCheck', 'glassNext', 'glassBattersea', 'random'].forEach(k => {
    const bands = {}, ev = {}; let wrongCrape = 0;
    for (let seed = 1; seed <= N; seed++) { const v = M.runStrategy(seed, k).verdict; bands[v.band] = (bands[v.band] || 0) + 1; ev[v.evidence] = (ev[v.evidence] || 0) + 1; wrongCrape += v.wrongCrape; }
    res[k] = { bands, ev, wrongCrape: wrongCrape / N };
  });
  const sh = (k, b) => (res[k].bands[b] || 0) / N;
  check('The doctor\'s way (his pairs, across the streets, by the word; the marsh): wrong for the paper\'s reason in every game, with no pair that can choose', sh('doctor', 'air') === 1 && res.doctor.ev.none === N, JSON.stringify(res.doctor.bands));
  check('Next door by the word: the window drifts to a narrower gap than Snow\'s in at least four games in five (the Board\'s reason)', sh('askNext', 'narrow') >= 0.8, JSON.stringify(res.askNext.bands) + '; wrong words at crape doors per game ' + f1(res.askNext.wrongCrape));
  check('Next door by the glass: agrees with Snow in at least seven games in ten', sh('glassNext', 'agree') >= 0.7, JSON.stringify(res.glassNext.bands));
  check('The gap between word and glass is wide: glass agrees at least three times as often as the word', sh('glassNext', 'agree') >= 3 * sh('askNext', 'agree'), pct(sh('glassNext', 'agree')) + ' vs ' + pct(sh('askNext', 'agree')));
  check('Checking the words with the glass recovers most of it', sh('askThenCheck', 'agree') >= 0.55 && sh('askThenCheck', 'agree') > sh('askNext', 'agree') + 0.3, JSON.stringify(res.askThenCheck.bands));
  check('Pairs on Battersea alone (every door brown) cannot carry the sentence in at least two games in five: where you compare matters', sh('glassBattersea', 'unsupported') >= 0.4, JSON.stringify(res.glassBattersea.bands));
  check('Random play lands in every band', Object.keys(res.random.bands).length >= 4, JSON.stringify(res.random.bands));
})();

// 7. robustness of the discovery to the designer's choices
(function () {
  const N = 300;
  [5, 20].forEach(k => { let ga = 0, gn = 0, aa = 0, an = 0; for (let seed = 1; seed <= N; seed++) { const g = M.runStrategy(seed, 'glassNext', { compression: k, noFloors: true }).verdict.band, a = M.runStrategy(seed, 'askNext', { compression: k, noFloors: true }).verdict.band; if (g === 'agree') ga++; if (g === 'narrow') gn++; if (a === 'agree') aa++; if (a === 'narrow') an++; } check('Compression ' + k + ', no floors: the glass agrees with Snow more often than the word, and the word drifts at least twice as often as the glass (the size of the gap depends on the word floor and the thickness; its direction does not)', ga > aa && an >= 2 * gn, 'glass agree ' + pct(ga / N) + ' word agree ' + pct(aa / N) + '; word narrow ' + pct(an / N) + ' glass narrow ' + pct(gn / N)); });
  [6, 10].forEach(kn => { const save = C.KNOCKS; C.KNOCKS = kn; let agree = 0, narrow = 0; for (let seed = 1; seed <= N; seed++) { if (M.runStrategy(seed, 'glassNext').verdict.band === 'agree') agree++; if (M.runStrategy(seed, 'askNext').verdict.band === 'narrow') narrow++; } C.KNOCKS = save; check(kn + ' knocks: the glass agrees in more than half the games and the word drifts in more than half', agree / N > 0.5 && narrow / N > 0.5, pct(agree / N) + ' / ' + pct(narrow / N)); });
})();

// 8. words
(function () {
  let bad = 0, n = 0;
  for (let seed = 1; seed <= 200; seed++) ['doctor', 'askNext', 'askThenCheck', 'glassNext', 'glassBattersea', 'random'].forEach(k => { const r = M.runStrategy(seed, k); const v = r.verdict; [v.snow, v.you, v.part, v.words, v.had, v.later, M.line(r.game)].forEach(t => { n++; if (/\d\.\d/.test(t) || /NaN|undefined|Infinity/.test(t)) { bad++; if (bad < 3) out.push('   bad line: ' + t); } }); });
  check('No decimal, NaN, Infinity or undefined in any verdict or window line over 1200 games', bad === 0, n + ' lines');
  check('Number words to twenty-nine', M.numberWord(21) === 'twenty-one' && M.numberWord(7) === 'seven' && M.numberWord(0) === 'no');
})();

const summary = (fails === 0 ? 'ALL PASSED' : fails + ' FAILED') + ' (' + out.filter(l => /^(PASS|FAIL)/.test(l)).length + ' checks)';
out.push(summary); console.log(out.join('\n'));
require('fs').writeFileSync(__dirname + '/calibration-result.txt', out.join('\n') + '\n');
process.exit(fails ? 1 : 0);
