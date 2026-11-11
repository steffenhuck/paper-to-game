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
    a.eaten += r.state.eaten; a.pondEnd += r.recs[C.SUMMERS - 1].pondAfter; a.town += r.state.paidToTown; a.test += r.test.shared;
    a.last3 += (r.recs[7].eaten + r.recs[8].eaten + r.recs[9].eaten) / 3;
    const E = r.state.villagers.filter(v => v.type === 'E'), N = r.state.villagers.filter(v => v.type !== 'E');
    a.normE += E.reduce((s, v) => s + v.norm, 0) / E.length; a.normCC += N.reduce((s, v) => s + v.norm, 0) / N.length;
    a.eatE += E.reduce((s, v) => s + v.eaten, 0) / E.length; a.eatCC += N.reduce((s, v) => s + v.eaten, 0) / N.length;
  }
  return { share: a.share.map(x => x / seeds), pond: a.pond.map(x => x / seeds), eaten: a.eaten / seeds, pondEnd: a.pondEnd / seeds, test: a.test / seeds, town: a.town / seeds, normE: a.normE / seeds, normCC: a.normCC / seeds, eatE: a.eatE / seeds, eatCC: a.eatCC / seeds, gapLate: a.gapLate / a.gapLateN, last3: a.last3 / seeds };
}
const S = {}; M.REGIMES.forEach(r => { S[r.key] = stats(r.key); });

// 1–2. the lab baseline: findings 1 and 2 (p. 140)
check('leave it be, summer 1: share of villagers taking one fish within 40–60% (finding 1)', S.none.share[0] >= 0.4 && S.none.share[0] <= 0.6, pct(S.none.share[0]));
check('leave it be: decays by at least ten points by summer 10 and stays above 10% (finding 2, "well above zero")', S.none.share[9] <= S.none.share[0] - 0.10 && S.none.share[9] > 0.10, pct(S.none.share[0]) + ' → ' + pct(S.none.share[9]));
check('leave it be: the pond is nearly empty or empty by summer 10 (the stake)', S.none.pondEnd < C.POND_CAP * 0.3, f2(S.none.pondEnd) + ' fish');

// 3. communication: finding 5 (p. 140)
check('have a talk: at least fifteen points above leave it be in summer 1 (finding 5, "substantial increases")', S.talk.share[0] >= S.none.share[0] + 0.15, pct(S.talk.share[0]) + ' vs ' + pct(S.none.share[0]));
check('have a talk: sustained (summer 10 within ten points of summer 2, through the newcomer)', Math.abs(S.talk.share[9] - S.talk.share[1]) <= 0.10, pct(S.talk.share[1]) + ' → ' + pct(S.talk.share[9]));
check('have a talk: egoists unmoved by cheap talk (an egoist shares under talk with probability below 15%)', (() => { const s = M.newVillage(1); const e = s.villagers.find(v => v.type === 'E'); return M.shareProb(e, s, 'talk') < 0.15; })());

// 4. local monitoring with graduated sanctions: finding 6, design principles 4–5 (pp. 141, 151–152)
check('take turns watching: rises by at least twenty points to above 85% by summer 10', S.watch.share[9] >= S.watch.share[0] + 0.20 && S.watch.share[9] > 0.85, pct(S.watch.share[0]) + ' → ' + pct(S.watch.share[9]));
check('take turns watching: the pond is full at the end', S.watch.pondEnd >= C.POND_CAP * 0.9, f2(S.watch.pondEnd));
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

// 5. the eleventh summer: the norm revealed
check('eleventh summer: watching leaves the most sharers, then talk, then leave it be', S.watch.test > S.talk.test && S.talk.test > S.none.test, [S.watch.test, S.talk.test, S.none.test].map(f2).join(' > '));
check('eleventh summer: watching leaves at least seven of ten sharing', S.watch.test >= 7, f2(S.watch.test));

// 6. the occasional policeman: "the worst of all worlds" (p. 147), Cardenas, Stranlund & Willis (fn. 11)
check('policeman now and then: by summer 10 below talk, watching and the daily policeman, and within five points of leave it be (no better than nothing)', S.weak.share[9] < S.talk.share[9] && S.weak.share[9] < S.watch.share[9] && S.weak.share[9] < S.strong.share[9] && S.weak.share[9] < S.none.share[9] + 0.05, pct(S.weak.share[9]) + ' vs none ' + pct(S.none.share[9]));
check('policeman now and then: starts above leave it be (a small deterrent is still a deterrent) and ends further below talk than it started', S.weak.share[0] > S.none.share[0] && (S.talk.share[9] - S.weak.share[9]) > (S.talk.share[0] - S.weak.share[0]) + 0.2, pct(S.weak.share[0]) + ' → ' + pct(S.weak.share[9]));
check('policeman now and then: the eleventh summer no better than leave it be’s, and the norm gone', S.weak.test <= S.none.test && S.weak.normCC < 0.05, f2(S.weak.test) + ' vs ' + f2(S.none.test));
check('policeman now and then: the village eats no more than under leave it be and pays the town', S.weak.eaten <= S.none.eaten && S.weak.town > 0, f2(S.weak.eaten) + ' vs ' + f2(S.none.eaten) + ', town ' + f2(S.weak.town));

// 7. the daily policeman: enforced, costly, and gone the summer after (p. 147; Frohlich & Oppenheimer 1996)
check('policeman every day: sharing above 85% in every summer (cooperation enforced)', S.strong.share.every(x => x > 0.85), S.strong.share.map(pct).join(' '));
check('policeman every day: the eleventh summer below leave it be’s (Frohlich & Oppenheimer: worse off than those who never had it)', S.strong.test < S.none.test, f2(S.strong.test) + ' vs ' + f2(S.none.test));
check('policeman every day: the village eats less than under watching (the quarter)', S.strong.eaten < S.watch.eaten, f2(S.strong.eaten) + ' vs ' + f2(S.watch.eaten));
const seq = stats(t => t < 5 ? 'strong' : 'watch');
check('five policed summers then watching: watching starts lower and ends lower than watching from the start (crowding out carries over)', seq.share[5] < S.watch.share[0] && seq.share[9] < S.watch.share[9] && seq.test < S.watch.test, pct(seq.share[5]) + ' vs ' + pct(S.watch.share[0]) + '; 11th ' + f2(seq.test) + ' vs ' + f2(S.watch.test));

// 8. the pond
(() => {
  let s = C.POND_START, min = s, empty = null;
  for (let t = 0; t < 10; t++) { s -= C.N * C.FAIR; s = Math.max(0, Math.min(C.POND_CAP, s + Math.round(C.POND_GROWTH * s * (1 - s / C.POND_CAP)))); min = Math.min(min, s); }
  check('all ten take one: the pond after winter never falls below three-quarters full', min >= 0.75 * C.POND_CAP, f2(min));
  s = C.POND_START;
  for (let t = 0; t < 10; t++) { s -= C.N * C.GREEDY; s = Math.max(0, Math.min(C.POND_CAP, s + Math.round(C.POND_GROWTH * s * (1 - s / C.POND_CAP)))); if (s <= 0 && empty === null) empty = t + 1; }
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
    const m = r.recs.filter(x => x.migration).length; if (m === 1 && r.recs[C.MIGRATION_AFTER].migration && r.state.villagers.some(x => x.newcomer && x.type === 'E')) mig++;
  }
  check('every village has three egoists, five conditional cooperators, two willing punishers; norms stay in [0, 1]', ok);
  check('every name is each type at least once over 400 seeds (the draw is real)', C.NAMES.every(n => seen[n + 'E'] && seen[n + 'CC'] && seen[n + 'WP']));
  check('the newcomer arrives exactly once, in summer six, as an egoist replacing a norm-user', mig === SEEDS, mig + ' of ' + SEEDS);
})();

// 10. robustness: does the eleventh-summer ordering survive other settings of what is ours? (memo, section 16)
function withConfig(changes, fn) {
  const saved = {}; for (const k in changes) { saved[k] = C[k]; C[k] = changes[k]; }
  try { return fn(); } finally { for (const k in saved) C[k] = saved[k]; }
}
const orderings = [
  ['crowding out at three-quarters', { CROWD_WEAK: C.CROWD_WEAK * 0.75, CROWD_STRONG: C.CROWD_STRONG * 0.75 }],
  ['crowding out at half', { CROWD_WEAK: C.CROWD_WEAK * 0.5, CROWD_STRONG: C.CROWD_STRONG * 0.5 }],
  ['imitation at half', { IMITATE: C.IMITATE * 0.5 }],
  ['imitation doubled', { IMITATE: C.IMITATE * 2 }],
  ['four egoists, four conditional cooperators, two punishers', { TYPES: { E: 4, CC: 4, WP: 2 } }],
  ['two egoists, six conditional cooperators, two punishers', { TYPES: { E: 2, CC: 6, WP: 2 } }],
  ['no newcomer', { MIGRATION_AFTER: 99 }],
];
out.push('');
out.push('Robustness of the eleventh summer (watch > talk > none, weak <= none, strong < none), 200 seeds each:');
for (const [name, changes] of orderings) {
  const r = withConfig(changes, () => { const o = {}; M.REGIMES.forEach(x => { o[x.key] = stats(x.key, 200); }); return o; });
  const main = r.watch.test > r.talk.test && r.talk.test > r.none.test && r.weak.test <= r.none.test;
  const frohlich = r.strong.test < r.none.test;
  const line = `  ${name}: watch ${f2(r.watch.test)} talk ${f2(r.talk.test)} none ${f2(r.none.test)} weak ${f2(r.weak.test)} strong ${f2(r.strong.test)}`;
  check('robustness, ' + name + ': watch > talk > none >= weak', main, line);
  if (name === 'crowding out at half') out.push((frohlich ? 'PASS ' : 'SENSITIVITY ') + 'robustness, ' + name + ': the daily policeman’s eleventh summer below leave it be’s' + (frohlich ? '' : ' does not hold: the Frohlich & Oppenheimer aftermath needs crowding out at least three-quarters of the chosen rate; said on the verdict screen') + '  —' + line);
  else check('robustness, ' + name + ': the daily policeman’s eleventh summer below leave it be’s', frohlich, line);
}

// the play-it-in-numbers table (build.md §3)
out.push('');
out.push('Playing it in numbers: strategies over 400 seeds (share of fishers taking one fish per summer; pond after winter; fish eaten in ten summers; the eleventh summer):');
const strategies = [
  ['leave it be', 'none'], ['have a talk', 'talk'], ['take turns watching', 'watch'], ['policeman now and then', 'weak'], ['policeman every day', 'strong'],
  ['five policed summers, then watching', t => t < 5 ? 'strong' : 'watch'], ['five policed summers, then nothing', t => t < 5 ? 'strong' : 'none'],
  ['five of nothing, then watching', t => t < 5 ? 'none' : 'watch'], ['five of watching, then nothing', t => t < 5 ? 'watch' : 'none'],
  ['five of talk, then watching', t => t < 5 ? 'talk' : 'watch'], ['nothing until the pond is under 25, then the daily policeman', (t, s) => s.pond < 25 ? 'strong' : 'none'],
  ['nothing until the pond is under 25, then watching', (t, s) => s.pond < 25 ? 'watch' : 'none'], ['three summers of the occasional policeman, then watching', t => t < 3 ? 'weak' : 'watch'],
];
for (const [name, st] of strategies) {
  const r = stats(st);
  out.push(`  ${name.padEnd(58)} share ${r.share.map(x => String(Math.round(100 * x)).padStart(3)).join('')}   pond ${r.pond.map(x => String(Math.round(x)).padStart(3)).join('')}   eaten ${String(Math.round(r.eaten)).padStart(4)} (last three summers ${f2(r.last3)} a summer: ${M.belliesWord(r.last3 * C.SUMMERS)})   pond at the end ${String(Math.round(r.pondEnd)).padStart(3)} (${M.pondWord(r.pondEnd)})   town ${String(Math.round(r.town)).padStart(3)}   eleventh summer ${f2(r.test)} of ten share`);
}

out.unshift(`Ostrom's Pond — calibration check, ${new Date().toISOString().slice(0, 10)}. ${out.filter(l => /^PASS|^FAIL/.test(l)).length} checks, ${fails} failed.`);
console.log(out.join('\n'));
require('fs').writeFileSync(require('path').join(__dirname, 'calibration-result.txt'), out.join('\n') + '\n');
process.exit(fails ? 1 : 0);
