// Playing it in numbers (build.md §3): the obvious ways of placing eight tests, over 600 seeds, against the mechanism.
const M = require('./mechanism.js'); const C = M.CONFIG;
const N = Number(process.argv[2] || 600);
const f1 = x => (Math.round(x * 10) / 10).toFixed(1);
const out = [];
for (const k of ['crapeOnly', 'sides', 'random', 'column', 'middle', 'pairs']) {
  const bands = {}, states = {}; let rows = 0, inf = 0, fin = [];
  for (let seed = 1; seed <= N; seed++) { const v = M.runStrategy(seed, k).verdict; bands[v.band] = (bands[v.band] || 0) + 1; states[v.state] = (states[v.state] || 0) + 1; rows += v.evidence.same.rows; if (v.evidence.ratioSame === Infinity) inf++; else if (isFinite(v.evidence.ratioSame)) fin.push(v.evidence.ratioSame); }
  fin.sort((a, b) => a - b);
  out.push([k.padEnd(10), 'bands ' + JSON.stringify(bands), 'evidence ' + JSON.stringify(states), 'same-street rows ' + f1(rows / N), 'no blue crape in same street ' + inf, 'median finite same-street ratio ' + (fin.length ? f1(fin[Math.floor(fin.length / 2)]) : '—')].join(' | '));
}
console.log(out.join('\n'));
const crape = [], inl = [], riv = [], rd = []; const rowCrape = C.ROWS.map(() => 0);
for (let seed = 1; seed <= N; seed++) { const g = M.makeMap(seed); const all = [].concat.apply([], g.rows); crape.push(all.filter(h => h.crape).length); inl.push(all.filter(h => h.crape && M.isInland(h.r)).length); riv.push(all.filter(h => h.crape && M.isRiver(h.r)).length); rd.push(g.redraws > 0 ? 1 : 0); g.rows.forEach((hs, r) => { rowCrape[r] += hs.filter(h => h.crape).length; }); }
const mean = a => f1(a.reduce((p, q) => p + q, 0) / a.length);
console.log('crape per map: mean', mean(crape), 'min', Math.min(...crape), 'max', Math.max(...crape), '| inland', mean(inl), 'riverside', mean(riv), '| some floor bound in', Math.round(100 * rd.reduce((p, q) => p + q, 0) / N) + '% of seeds');
C.ROWS.forEach((r, i) => console.log(r.name.padEnd(15), 'brown', M.brownCount(r), 'of 6 | crape mean', f1(rowCrape[i] / N)));
console.log('per-house chance of crape: brown', Math.round(100 * M.perHouseProb('brown')) + '%', 'blue', Math.round(100 * M.perHouseProb('blue')) + '%');
const r = M.runStrategy(7, 'pairs'); const v = r.verdict;
console.log('\nSEED 7 pairs:', v.band, '\n YOU:', v.you, '\n PART:', v.part, '\n SIDE:', v.sideLine, '\n HAD:', v.had, '\n DOCTOR:', M.doctor(r.game));
