// Playing it in numbers (build.md §3): five ways of placing the glasses, adaptive, each stopping at the doctor's concession
// or at the cap of ten; 3,000 maps. The count to concession is the score.
const M = require('./mechanism.js'); const C = M.CONFIG;
const N = Number(process.argv[2] || 3000);
const f1 = x => (Math.round(x * 10) / 10).toFixed(1);
console.log('Bayes before a test, by street:');
C.ROWS.forEach(r => { const nb = M.brownCount(r), pb = nb / 6, pB = M.perHouseProb('brown'), pL = M.perHouseProb('blue'); const pbc = pb * pB / (pb * pB + (1 - pb) * pL), pbn = pb * (1 - pB) / (pb * (1 - pB) + (1 - pb) * (1 - pL)); console.log('  ' + r.name.padEnd(15), 'P(brown | crape) ' + pbc.toFixed(2) + '   P(blue | no crape) ' + (1 - pbn).toFixed(2)); });
console.log('\nstrategy      | conceded by glass 2 / 3 / 4 / 6 / 10 | never within 10 | median glass of concession | identified & wrote water');
for (const k of Object.keys(M.STRATEGIES)) {
  const by = Array(C.TESTS + 1).fill(0); let never = 0, ids = []; let identifiedWater = 0;
  for (let seed = 1; seed <= N; seed++) { const v = M.runStrategy(seed, k).verdict; if (v.identified) { for (let t = v.concededAt; t <= C.TESTS; t++) by[t]++; ids.push(v.concededAt); } else never++; if (v.band === 'identified') identifiedWater++; }
  ids.sort((a, b) => a - b);
  console.log(k.padEnd(13) + ' | ' + [2, 3, 4, 6, 10].map(t => Math.round(100 * by[t] / N) + '%').join(' / ') + ' | ' + Math.round(100 * never / N) + '% | ' + (ids.length ? ids[Math.floor(ids.length / 2)] : '—') + ' | ' + Math.round(100 * identifiedWater / N) + '%');
}
const crape = [], inl = [], riv = [], rd = []; const rowCrape = C.ROWS.map(() => 0);
for (let seed = 1; seed <= 600; seed++) { const g = M.makeMap(seed); const all = [].concat.apply([], g.rows); crape.push(all.filter(h => h.crape).length); inl.push(all.filter(h => h.crape && M.isInland(h.r)).length); riv.push(all.filter(h => h.crape && M.isRiver(h.r)).length); rd.push(g.redraws > 0 ? 1 : 0); g.rows.forEach((hs, r) => { rowCrape[r] += hs.filter(h => h.crape).length; }); }
const mean = a => f1(a.reduce((p, q) => p + q, 0) / a.length);
console.log('\ncrape per map (600 seeds): mean', mean(crape), 'min', Math.min(...crape), 'max', Math.max(...crape), '| inland', mean(inl), 'riverside', mean(riv), '| some floor bound in', Math.round(100 * rd.reduce((p, q) => p + q, 0) / 600) + '% of seeds');
C.ROWS.forEach((r, i) => console.log('  ' + r.name.padEnd(15), 'brown', M.brownCount(r), 'of 6 | crape mean', f1(rowCrape[i] / 600)));
const r = M.runStrategy(7, 'anchorHunt'); const v = r.verdict;
console.log('\nSEED 7 anchorHunt:', v.band, '\n HEAD:', v.head, '\n IDENT:', v.ident, '\n SENTENCE:', v.sentenceLine, '\n SPEED:', v.speed);
