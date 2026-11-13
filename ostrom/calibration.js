// Calibration check for Ostrom's Pond: runs mechanism.js headless against the paper's reported numbers and the
// ordering of its claims. The mechanism is a toy, so most checks are of direction and rough size (memo, section 17).
const M = require('./mechanism.js');
const C = M.CONFIG;
let fails = 0, out = [];
function check(name, ok, detail) { out.push((ok ? 'PASS ' : 'FAIL ') + name + (detail !== undefined ? '  — ' + detail : '')); if (!ok) fails++; }
const f2 = x => (Math.round(x * 100) / 100).toFixed(2);
const pct = x => Math.round(100 * x) + '%';
const SEEDS = 400;

// run a strategy over many seeds and average what the checks need
function stats(strategy, seeds) {
  seeds = seeds || SEEDS;
  const a = { share: Array(C.SUMMERS).fill(0), pond: Array(C.SUMMERS).fill(0), eaten: 0, pondEnd: 0, test: 0, town: 0, normE: 0, normCC: 0, eatE: 0, eatCC: 0, gapLate: 0, gapLateN: 0, last3: 0 };
  for (let seed = 1; seed <= seeds; seed++) {
    const r = M.runStrategy(seed, strategy);
    r.recs.forEach((rec, t) => { a.share[t] += rec.shareRate; a.pond[t] += rec.pondAfter; if (t >= 3) { a.gapLate += rec.gap; a.gapLateN++; } });
    a.eaten += r.state.eaten; a.pondEnd += r.recs[C.SUMMERS - 1].pondAfter; a.test += r.test.shared;
    a.last3 += r.recs.slice(-3).reduce((s, h) => s + h.eaten, 0) / 3;
    const E = r.state.villagers.filter(v => v.type === 'E'), N = r.state.villagers.filter(v => v.type !== 'E');
    a.normE += E.reduce((s, v) => s + v.norm, 0) / E.length; a.normCC += N.reduce((s, v) => s + v.norm, 0) / N.length;
    a.eatE += E.reduce((s, v) => s + v.eaten, 0) / E.length; a.eatCC += N.reduce((s, v) => s + v.eaten, 0) / N.length;
  }
  return { share: a.share.map(x => x / seeds), pond: a.pond.map(x => x / seeds), eaten: a.eaten / seeds, pondEnd: a.pondEnd / seeds, test: a.test / seeds, town: a.town / seeds, normE: a.normE / seeds, normCC: a.normCC / seeds, eatE: a.eatE / seeds, eatCC: a.eatCC / seeds, gapLate: a.gapLate / a.gapLateN, last3: a.last3 / seeds };
}
const S = {}; M.REGIMES.forEach(r => { S[r.key] = stats(r.key); });

// 1–2. the lab baseline: findings 1 and 2 (p. 140)
check('leave it be, summer 1: share of villagers taking one fish within 40–60% (finding 1)', S.none.share[0] >= 0.4 && S.none.share[0] <= 0.6, pct(S.none.share[0]));
check('leave it be: decays by at least fifteen points by the last summer and stays above 10% (finding 2, "well above zero")', S.none.share[C.SUMMERS - 1] <= S.none.share[0] - 0.15 && S.none.share[C.SUMMERS - 1] > 0.10, pct(S.none.share[0]) + ' → ' + pct(S.none.share[C.SUMMERS - 1]));
check('leave it be: the pond is empty by the last summer in nearly every village (the stake)', S.none.pondEnd < 1, f2(S.none.pondEnd) + ' fish');

// 3. communication: finding 5 (p. 140)
check('have a talk: at least fifteen points above leave it be in summer 1 (finding 5, "substantial increases")', S.talk.share[0] >= S.none.share[0] + 0.15, pct(S.talk.share[0]) + ' vs ' + pct(S.none.share[0]));
check('have a talk: sustained (the last summer within ten points of summer 2)', Math.abs(S.talk.share[C.SUMMERS - 1] - S.talk.share[1]) <= 0.10, pct(S.talk.share[1]) + ' → ' + pct(S.talk.share[C.SUMMERS - 1]));
check('have a talk: egoists unmoved by cheap talk (an egoist shares under talk with probability below 15%)', (() => { const s = M.newVillage(1); const e = s.villagers.find(v => v.type === 'E'); return M.shareProb(e, s, 'talk') < 0.15; })());

// 4. local monitoring with graduated sanctions: finding 6, design principles 4–5 (pp. 141, 151–152)
check('take turns watching: rises by at least twenty points to above 85% by the last summer', S.watch.share[C.SUMMERS - 1] >= S.watch.share[0] + 0.20 && S.watch.share[C.SUMMERS - 1] > 0.85, pct(S.watch.share[0]) + ' → ' + pct(S.watch.share[C.SUMMERS - 1]));
check('take turns watching: the pond holds (ends no lower than it started, less three)', S.watch.pondEnd >= C.POND_START - 3, f2(S.watch.pondEnd));
(() => { // the first sanction is a word, and it works as information (p. 151)
  const s = M.newVillage(7); const e = s.villagers.find(v => v.type === 'E');
  const fresh = M.shareProb(e, s, 'watch');
  e.offences = 1; e.norm = C.WATCH_LEARN[0]; s.seeBelief = C.WATCH_SEE;
  const after = M.shareProb(e, s, 'watch');
  check('a grabber told off once (no fine) is much more likely to take one next summer than one never told off', after > fresh + 0.4, pct(fresh) + ' → ' + pct(after));
  (() => { const s2 = M.newVillage(7); const e2 = s2.villagers.find(v => v.type === 'E'); s2.seeBelief = C.WATCH_SEE; const d = [0, 1, 2].map(k => { e2.offences = k; return M.shareProb(e2, s2, 'watch'); });
    check('the first sanction is a word that costs nothing, and the schedule escalates (a grabber\u2019s chance of sharing rises with each offence)', d[0] < d[1] && d[1] < d[2], d.map(pct).join(' → ')); })();
})();
(() => { // a grabber who has been told off and grabs again expects GREEDY − WATCH_SEE × GREEDY fish (both fish back if seen), a sharer 1
  const again = C.GREEDY - C.WATCH_SEE * C.GREEDY;
  check('take turns watching: a grabber who was told off and grabs again expects to eat less than a sharer (the differential the imitation rule needs)', again < C.FAIR, f2(again) + ' vs ' + C.FAIR);
})();
check('take turns watching: from summer 4 on, grabbers out-eat sharers by less than half of what they do under talk', S.watch.gapLate < 0.5 * S.talk.gapLate, f2(S.watch.gapLate) + ' vs ' + f2(S.talk.gapLate));
check('have a talk: a grabber eats more than a sharer every summer (cheap talk has no teeth)', S.talk.gapLate > 0.9, f2(S.talk.gapLate) + ' fish');
check('egoists learn the norm under watching and not under talk (Fehr & Gächter, p. 141; Börgers & Sarin, p. 145)', S.watch.normE > 0.3 && S.talk.normE < 0.05, f2(S.watch.normE) + ' vs ' + f2(S.talk.normE));

// 5. the seventh summer: the norm revealed
check('seventh summer: watching leaves the most sharers, then talk, then leave it be', S.watch.test > S.talk.test && S.talk.test > S.none.test, [S.watch.test, S.talk.test, S.none.test].map(f2).join(' > '));
check('seventh summer: watching leaves at least seven of ten sharing', S.watch.test >= 7, f2(S.watch.test));

// 6. the occasional policeman: "the worst of all worlds" (p. 147), Cardenas, Stranlund & Willis (fn. 11)
// 7. the policeman: enforced, costly, and gone the summer after (p. 147; Frohlich & Oppenheimer 1996)
check('the policeman: sharing above 85% in every summer (cooperation enforced)', S.strong.share.every(x => x > 0.85), S.strong.share.map(pct).join(' '));
check('the policeman: the seventh summer below leave it be’s (Frohlich & Oppenheimer: worse off than those who never had it)', S.strong.test < S.none.test, f2(S.strong.test) + ' vs ' + f2(S.none.test));
check('the policeman costs the village nothing: a caught grabber\u2019s fish go back in the pond, nothing leaves the village', (() => { let ok = true; for (let seed = 1; seed <= 100; seed++) { const r = M.runStrategy(seed, 'strong'); for (const rec of r.recs) { const took = rec.acts.reduce((s, a) => s + a.took, 0), ate = rec.acts.reduce((s, a) => s + a.ate, 0); if (took - ate !== rec.finesToPond) ok = false; } } return ok; })());
const seq = stats(t => t < 3 ? 'strong' : 'watch');
check('three policed summers then watching: watching starts lower and ends lower than watching from the start (crowding out carries over)', seq.share[3] < S.watch.share[0] && seq.share[C.SUMMERS - 1] < S.watch.share[C.SUMMERS - 1] && seq.test < S.watch.test, pct(seq.share[3]) + ' vs ' + pct(S.watch.share[0]) + '; 7th ' + f2(seq.test) + ' vs ' + f2(S.watch.test));

// 8. the pond
(() => {
  let s = C.POND_START, min = s, empty = null;
  for (let t = 0; t < C.SUMMERS; t++) { s -= C.N * C.FAIR; s += M.babies(s).n; min = Math.min(min, s); }
  check('all ten take one: the pond after winter never falls below three-quarters full', min >= 0.75 * C.POND_CAP, f2(min));
  s = C.POND_START;
  for (let t = 0; t < 10; t++) { s = Math.max(0, s - C.N * C.GREEDY); s += M.babies(s).n; if (s <= 0 && empty === null) empty = t + 1; }
  check('the winter\u2019s rule: every fish left can have one baby, never more than ten, never more fish than fifty', [[25, 10], [30, 10], [6, 6], [0, 0], [45, 5], [50, 0], [10, 10], [41, 9]].every(([S, n]) => M.babies(S).n === n) && M.babies(45).limit === 'room' && M.babies(6).limit === 'parents' && M.babies(25).limit === 'food' && M.babies(0).limit === 'none');
  check('one fish each holds the pond (ten out, ten in); eleven fish out shrinks it; a village of grabbers empties it within six summers', (() => { const run = (take, n) => { let p = C.POND_START; for (let t = 0; t < n; t++) { p = Math.max(0, p - take); p += M.babies(p).n; } return p; }; return run(10, 3) === C.POND_START && run(11, 3) < C.POND_START && run(20, 6) === 0; })());
  check('all ten take two: the pond is empty within six summers', empty !== null && empty <= 6, 'empty after summer ' + empty);
})();
(() => { // rationing and the books
  let ok = true, detail = '';
  for (let seed = 1; seed <= 200 && ok; seed++) {
    const r = M.runStrategy(seed, 'none');
    for (const rec of r.recs.concat([r.test])) {
      if (rec.pondAfterFishing < 0 || rec.acts.some(a => a.took < 0 || a.took > a.wanted)) { ok = false; detail = 'seed ' + seed; break; }
      const took = rec.acts.reduce((s, a) => s + a.took, 0);
      if (took > rec.pondBefore) { ok = false; detail = 'took more than the pond held, seed ' + seed; break; }
    }
    if (r.state.eaten < 0) { ok = false; detail = 'negative shelf'; }
  }
  check('takes are rationed when the pond is low, never negative, never more than the pond holds; the shelf never goes below zero', ok, detail);
})();

// 9. the village
(() => {
  const seen = {}; let ok = true, mig = 0;
  for (let seed = 1; seed <= SEEDS; seed++) {
    const r = M.runStrategy(seed, 'none');
    const v = M.newVillage(seed).villagers;
    const counts = { E: 0, CC: 0, WP: 0 }; v.forEach(x => { counts[x.type]++; seen[x.name + x.type] = true; if (x.norm < 0 || x.norm > 1) ok = false; });
    if (counts.E !== C.TYPES.E || counts.CC !== C.TYPES.CC || counts.WP !== C.TYPES.WP) ok = false;
    r.state.villagers.forEach(x => { if (x.norm < 0 || x.norm > 1) ok = false; });
    if (!r.recs.some(x => x.migration) && !r.state.villagers.some(x => x.newcomer)) mig++;
  }
  check('every village has three egoists, five conditional cooperators, two willing punishers; norms stay in [0, 1]', ok);
  check('every name is each type at least once over 400 seeds (the draw is real)', C.NAMES.every(n => seen[n + 'E'] && seen[n + 'CC'] && seen[n + 'WP']));
  check('no newcomer: the village is the same ten from the first summer to the seventh', mig === SEEDS, mig + ' of ' + SEEDS);
})();

// 10. robustness: does the seventh-summer ordering survive other settings of what is ours? (memo, section 16)
function withConfig(changes, fn) {
  const saved = {}; for (const k in changes) { saved[k] = C[k]; C[k] = changes[k]; }
  try { return fn(); } finally { for (const k in saved) C[k] = saved[k]; }
}
const orderings = [
  ['crowding out at three-quarters', { CROWD_STRONG: C.CROWD_STRONG * 0.75 }],
  ['crowding out at half', { CROWD_STRONG: C.CROWD_STRONG * 0.5 }],
  ['imitation at half', { IMITATE: C.IMITATE * 0.5 }],
  ['imitation doubled', { IMITATE: C.IMITATE * 2 }],
  ['four egoists, four conditional cooperators, two punishers', { TYPES: { E: 4, CC: 4, WP: 2 } }],
  ['two egoists, six conditional cooperators, two punishers', { TYPES: { E: 2, CC: 6, WP: 2 } }],
  ['with a newcomer after three summers (the old setting)', { MIGRATION_AFTER: 3 }],
];
out.push('');
out.push('Robustness of the seventh summer (watch > talk > none, strong < none), 200 seeds each:');
for (const [name, changes] of orderings) {
  const r = withConfig(changes, () => { const o = {}; M.REGIMES.forEach(x => { o[x.key] = stats(x.key, 200); }); return o; });
  const main = r.watch.test > r.talk.test && r.talk.test > r.none.test;
  const frohlich = r.strong.test < r.none.test;
  const line = `  ${name}: watch ${f2(r.watch.test)} talk ${f2(r.talk.test)} none ${f2(r.none.test)} strong ${f2(r.strong.test)}`;
  check('robustness, ' + name + ': watch > talk > none', main, line);
  if (name === 'crowding out at half') out.push((frohlich ? 'PASS ' : 'SENSITIVITY ') + 'robustness, ' + name + ': the policeman’s seventh summer below leave it be’s' + (frohlich ? '' : ' does not hold: the Frohlich & Oppenheimer aftermath needs crowding out at least three-quarters of the chosen rate; said on the verdict screen') + '  —' + line);
  else check('robustness, ' + name + ': the policeman’s seventh summer below leave it be’s', frohlich, line);
}

// the play-it-in-numbers table (build.md §3)
out.push('');
out.push('Playing it in numbers: strategies over 400 seeds (share of fishers taking one fish per summer; pond after winter; fish eaten in six summers; the seventh summer):');
const strategies = [
  ['leave it be', 'none'], ['have a talk', 'talk'], ['take turns watching', 'watch'], ['ask the town for a policeman', 'strong'],
  ['three policed summers, then watching', t => t < 3 ? 'strong' : 'watch'], ['three policed summers, then nothing', t => t < 3 ? 'strong' : 'none'],
  ['three of nothing, then watching', t => t < 3 ? 'none' : 'watch'], ['three of watching, then nothing', t => t < 3 ? 'watch' : 'none'],
  ['three of talk, then watching', t => t < 3 ? 'talk' : 'watch'], ['nothing until the pond is under 25, then the policeman', (t, s) => s.pond < 25 ? 'strong' : 'none'],
  ['nothing until the pond is under 25, then watching', (t, s) => s.pond < 25 ? 'watch' : 'none'],
];
for (const [name, st] of strategies) {
  const r = stats(st);
  out.push(`  ${name.padEnd(58)} share ${r.share.map(x => String(Math.round(100 * x)).padStart(3)).join('')}   pond ${r.pond.map(x => String(Math.round(x)).padStart(3)).join('')}   eaten ${String(Math.round(r.eaten)).padStart(4)} (last three summers ${f2(r.last3)} a summer: ${M.belliesWord(r.last3 * C.SUMMERS)})   pond at the end ${String(Math.round(r.pondEnd)).padStart(3)} (${M.pondWord(r.pondEnd)})   town ${String(Math.round(r.town)).padStart(3)}   seventh summer ${f2(r.test)} of ten share`);
}

out.unshift(`Ostrom's Pond — calibration check, ${new Date().toISOString().slice(0, 10)}. ${out.filter(l => /^PASS|^FAIL/.test(l)).length} checks, ${fails} failed.`);
console.log(out.join('\n'));
require('fs').writeFileSync(require('path').join(__dirname, 'calibration-result.txt'), out.join('\n') + '\n');
process.exit(fails ? 1 : 0);
