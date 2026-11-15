// Playing it in numbers (build.md §3): the obvious ways of knocking, over 600 seeds, against the mechanism.
const M = require('./mechanism.js'); const C = M.CONFIG;
const N = Number(process.argv[2] || 600);
const strategies = ['crapeOnly', 'crapeThenLiving', 'halfHalf', 'livingOnly', 'random'];
const f1 = x => (Math.round(x * 10) / 10).toFixed(1);
function med(xs) { const a = xs.filter(x => isFinite(x)).sort((p, q) => p - q); return a.length ? a[Math.floor(a.length / 2)] : NaN; }
console.log('expected pooled ratio from the tables (k=10):', f1(M.expectedRatio()), ' k=5:', f1(M.expectedRatio(5)), ' k=20:', f1(M.expectedRatio(20)));
let out = [];
for (const s of strategies) {
  const bands = {}, ratios = [], living = [], crapeT = [], truths = []; let inf = 0;
  for (let seed = 1; seed <= N; seed++) {
    const r = M.runStrategy(seed, s, 'brown'); const v = r.verdict; bands[v.band] = (bands[v.band] || 0) + 1;
    if (v.estimate.kind === 'both') { if (v.estimate.ratio === Infinity) inf++; ratios.push(v.estimate.ratio); living.push(v.estimate.liveTried); crapeT.push(v.estimate.crapeTried); }
    truths.push(v.truth.ratio);
  }
  out.push([s, JSON.stringify(bands), 'median ratio ' + f1(med(ratios)), 'infinite ' + inf, 'median true ratio ' + f1(med(truths)), 'living tried ' + f1(living.reduce((a, b) => a + b, 0) / (living.length || 1)), 'crape tried ' + f1(crapeT.reduce((a, b) => a + b, 0) / (crapeT.length || 1))].join(' | '));
}
console.log(out.join('\n'));
// the streets: crape per street, redraws
const cr = [[], [], [], []], rd = [0, 0, 0, 0];
for (let seed = 1; seed <= N; seed++) { const g = M.newGame(seed); g.streets.forEach((s, i) => { cr[i].push(s.crape); rd[i] += s.redraws > 0 ? 1 : 0; }); }
C.STREETS.forEach((s, i) => { const a = cr[i]; console.log(s.name, '| brown', M.brownCount(s), '| p brown', f1(100 * M.perHouseProb(s, 'brown')) + '%', 'blue', f1(100 * M.perHouseProb(s, 'blue')) + '%', '| crape mean', f1(a.reduce((p, q) => p + q, 0) / a.length), 'min', Math.min(...a), 'max', Math.max(...a), '| floor or cap bound in', Math.round(100 * rd[i] / N) + '% of seeds'); });
// prediction: marking brown vs blue vs random
for (const pk of ['brown', 'blue', 'random']) { let hits = 0; for (let seed = 1; seed <= N; seed++) hits += M.runStrategy(seed, 'crapeThenLiving', pk).game.prediction.hits; console.log('mark five ' + pk + ': mean hits', f1(hits / N)); }
// parish ordering without floors
let ord = 0; for (let seed = 1; seed <= N; seed++) { const g = M.newGame(seed, { noFloors: true }); if (g.streets[1].crape > g.streets[2].crape) ord++; } console.log('Battersea crape > Lambeth Church crape without floors:', Math.round(100 * ord / N) + '%');
// a sample game printed
const r = M.runStrategy(7, 'crapeThenLiving', 'brown'); console.log('\nSEED 7 verdict:', r.verdict.band, '\n', r.verdict.you, '\n', r.verdict.part, '\n', r.verdict.parish, '\n', r.verdict.prediction, '\n', r.verdict.residents);
