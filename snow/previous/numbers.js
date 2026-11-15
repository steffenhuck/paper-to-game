// Playing it in numbers (build.md §3): the obvious ways of playing, over 600 seeds, against the mechanism.
const M = require('./mechanism.js'); const C = M.CONFIG;
const N = Number(process.argv[2] || 600);
const f1 = x => (Math.round(x * 10) / 10).toFixed(1);
function med(xs) { const a = xs.filter(x => isFinite(x)).sort((p, q) => p - q); return a.length ? a[Math.floor(a.length / 2)] : NaN; }
const out = [];
for (const k of ['doctor', 'askNext', 'askThenCheck', 'glassNext', 'glassBattersea', 'random']) {
  const bands = {}, ev = {}, ratios = [], truths = []; let inf = 0, pairs = 0, clean = 0, nothing = 0, muddled = 0, wrong = 0, wrongCrape = 0;
  for (let seed = 1; seed <= N; seed++) {
    const r = M.runStrategy(seed, k); const v = r.verdict; bands[v.band] = (bands[v.band] || 0) + 1; ev[v.evidence] = (ev[v.evidence] || 0) + 1;
    if (v.ratio === Infinity) inf++; ratios.push(v.ratio); truths.push(v.ratioTruth); pairs += v.window.pairs; clean += v.clean; nothing += v.nothing; muddled += v.muddled; wrong += v.wrong; wrongCrape += v.wrongCrape;
  }
  out.push([k.padEnd(15), 'bands ' + JSON.stringify(bands), 'evidence ' + JSON.stringify(ev), 'median finite ratio by record ' + f1(med(ratios)), 'infinite ' + inf, 'median true ' + f1(med(truths)), 'same-street pairs ' + f1(pairs / N), 'clean ' + f1(clean / N), 'nothing ' + f1(nothing / N), 'muddled ' + f1(muddled / N), 'wrong words ' + f1(wrong / N), 'at crape doors ' + f1(wrongCrape / N)].join(' | '));
}
console.log(out.join('\n'));
const cr = [[], []], rd = [0, 0], wrongB = [];
for (let seed = 1; seed <= N; seed++) { const g = M.newGame(seed); g.streets.forEach((s, i) => { cr[i].push(s.crape); rd[i] += s.redraws > 0 ? 1 : 0; }); wrongB.push(g.streets[0].houses.filter(h => h.crape && h.word && h.word !== h.water).length); }
C.STREETS.forEach((s, i) => { const a = cr[i]; console.log(s.name, '| brown', M.brownCount(s), 'of', C.HOUSES, '| p brown', f1(100 * M.perHouseProb(s, 'brown')) + '%', 'blue', f1(100 * M.perHouseProb(s, 'blue')) + '%', '| crape mean', f1(a.reduce((p, q) => p + q, 0) / a.length), 'min', Math.min(...a), 'max', Math.max(...a), '| floor, cap or word floor bound in', Math.round(100 * rd[i] / N) + '% of seeds'); });
console.log('Battersea crape doors with a wrong word: mean', f1(wrongB.reduce((p, q) => p + q, 0) / N));
// a sample game
const r = M.runStrategy(7, 'askThenCheck'); const v = r.verdict;
console.log('\nSEED 7 askThenCheck:', v.band, '\n YOU:', v.you, '\n PART:', v.part, '\n WORDS:', v.words, '\n HAD:', v.had);
