// Fidelity check for One of Us (build step 1). Runs mechanism.js, the only copy of the mechanism, against the paper's numbers.
// Run: node fidelity.js  > fidelity-result.txt
const M = require('./mechanism.js');
const C = M.CONFIG;
let fails = 0;
const check = (name, ok, detail) => { console.log((ok ? 'PASS ' : 'FAIL ') + name + (detail ? '  — ' + detail : '')); if (!ok) fails++; };
const f3 = v => v.toFixed(3);
const SEEDS = [11, 22, 33, 44, 55];

console.log('== 1. ERC reconstruction against Supp. Table 2 col. 1 and p. 9 (Step 1 project score) ==');
const ercW = SEEDS.map(s => M.makeWorld('erc', s));
const stats = ercW.map(w => { const m = w.reviews.m; let s = 0, s2 = 0, p5 = 0; for (const v of m) { s += v; s2 += v * v; if (v === 5) p5++; } const n = m.length, mu = s / n; return { n, mu, sd: Math.sqrt(s2 / n - mu * mu), p5: p5 / n }; });
stats.forEach((s, i) => console.log(`  seed ${SEEDS[i]}: reviews ${s.n}, mean ${f3(s.mu)}, SD ${f3(s.sd)}, P(5.0) ${f3(s.p5)}`));
const avg = k => stats.reduce((a, s) => a + s[k], 0) / stats.length;
check('reviews ≈ 155,000 (paper: 153,736)', Math.abs(avg('n') - 155000) < 3000, Math.round(avg('n')));
check('mean score 3.29 ± 0.05', Math.abs(avg('mu') - 3.289) < 0.05, f3(avg('mu')));
check('SD of score 0.99 ± 0.05', Math.abs(avg('sd') - 0.989) < 0.05, f3(avg('sd')));
check('P(5.0) 0.047 ± 0.015', Math.abs(avg('p5') - C.erc.tails.p5) < 0.015, f3(avg('p5')));
const fe = ercW.map(w => M.twoWayFE(w, 30));
console.log('  two-way FE (eq. 1) estimates: ' + fe.map(f3).join(', '));
check('eq. 1 recovers 0.164 within the paper CI [0.135, 0.193] on every seed', fe.every(v => v >= C.erc.bonusCI[0] && v <= C.erc.bonusCI[1]));
check('mean eq. 1 estimate within ±0.01 of 0.164', Math.abs(fe.reduce((a, b) => a + b) / fe.length - 0.164) < 0.01, f3(fe.reduce((a, b) => a + b) / fe.length));
const tp = ercW.map(M.testProposal), tj = ercW.map(M.testJudge);
console.log('  same-proposal test: ' + tp.map(t => `${f3(t.gap)} [${f3(t.lo)}, ${f3(t.hi)}]`).join('; '));
console.log('  same-judge test:    ' + tj.map(t => `${f3(t.gap)} [${f3(t.lo)}, ${f3(t.hi)}]`).join('; '));
check('same-proposal test: still there on every seed; its 99% range covers 0.164 on ≥ 4 of 5', tp.every(t => !t.gone) && tp.filter(t => t.lo <= 0.164 && t.hi >= 0.164).length >= 4);
check('same-judge test: still there on every seed; its 99% range covers 0.164 on ≥ 4 of 5', tj.every(t => !t.gone) && tj.filter(t => t.lo <= 0.164 && t.hi >= 0.164).length >= 4);
{ const w = M.makeWorld('erc', C.erc.seed), fe1 = M.twoWayFE(w, 30), a = M.testProposal(w), b = M.testJudge(w), sp1 = M.testSpread(w);
  console.log(`  the game's ERC case (seed ${C.erc.seed}): eq. 1 ${f3(fe1)}, headline ${f3(M.headline(w).gap)}, same proposal ${f3(a.gap)} [${f3(a.lo)}, ${f3(a.hi)}], same judge ${f3(b.gap)} [${f3(b.lo)}, ${f3(b.hi)}], spread ${sp1.pattern}`);
  check("the game's ERC case: eq. 1 within ±0.005 of 0.164, both tests still there and covering 0.164, spread a ramp", Math.abs(fe1 - 0.164) < 0.005 && !a.gone && !b.gone && a.lo <= 0.164 && a.hi >= 0.164 && b.lo <= 0.164 && b.hi >= 0.164 && sp1.pattern === 'ramp'); }

console.log('\n== 2. ERC tails against Fig. 3 / pp. 9-10 ==');
// The paper's estimates: change in P(score = 5.0) and P(score = 1.0) for a match. Estimated here as a two-way FE regression of the indicator.
const indicatorFE = (w, val) => { const r = w.reviews; const ww = { nP: w.nP, nJ: w.nJ, reviews: { p: r.p, j: r.j, x: r.x, m: r.m.map(v => v === val ? 1 : 0) } }; return M.twoWayFE(ww, 30); };
const d5 = ercW.map(w => indicatorFE(w, 5)), d1 = ercW.map(w => indicatorFE(w, 1));
console.log('  ΔP(5.0): ' + d5.map(f3).join(', ') + '   (paper +0.010, CI [0.002, 0.017])');
console.log('  ΔP(1.0): ' + d1.map(f3).join(', ') + '   (paper −0.006, CI [−0.011, −0.001])');
const m5 = d5.reduce((a, b) => a + b) / d5.length, m1 = d1.reduce((a, b) => a + b) / d1.length;
// Known miss: an additive bonus cannot put as little of its weight on 5.0 as the paper finds (memo §16). We check the direction and bound the size.
check('mean ΔP(5.0) positive and within 0.015 of the paper (+0.010; known miss: the paper CI ends at 0.017)', m5 > 0 && Math.abs(m5 - C.erc.tails.d5) < 0.015, f3(m5) + (m5 > C.erc.tails.d5ci[1] ? '  — OUTSIDE the paper CI: the reconstruction puts more of the bonus on 5.0 than the data do' : ''));
check('mean ΔP(1.0) inside the paper CI', m1 >= C.erc.tails.d1ci[0] && m1 <= C.erc.tails.d1ci[1], f3(m1));
const sp = ercW.map(M.testSpread);
sp.forEach((s, i) => console.log(`  spread seed ${SEEDS[i]}: ${s.pattern}  [${s.diff.map(v => (v * 100).toFixed(1)).join(' ')}] p.p.`));
check('ERC spread reads as a ramp (top marks up, low marks not) on every seed', sp.every(s => s.pattern === 'ramp'));

console.log('\n== 3. Training worlds: each test gives its designed answer, every seed ==');
const design = C.design;
const heads = [];
for (const k of Object.keys(design)) {
  let ok = 0; const seen = [];
  for (let s = 1; s <= 30; s++) {
    const w = M.makeWorld(k, s * 101); heads.push([k, M.headline(w).gap]);
    const got = [M.testProposal(w).gone ? 'gone' : 'still', M.testJudge(w).gone ? 'gone' : 'still', M.testSpread(w).pattern];
    if (got.join() === design[k].join()) ok++; else seen.push(s + ':' + got.join('/'));
  }
  check(`${k}: [same proposal, same judge, spread] = [${design[k].join(', ')}] on ≥ 28 of 30 raw draws (the game re-draws the rest)`, ok >= 28, ok + '/30' + (seen.length ? ' misses ' + seen.join(' ') : ''));
}
const hv = heads.map(h => h[1]);
console.log('  headline gaps by world: ' + Object.keys(design).map(k => { const v = heads.filter(h => h[0] === k).map(h => h[1]); return `${k} ${f3(Math.min(...v))}–${f3(Math.max(...v))}`; }).join('; '));
check('all training headlines in 0.15–0.5 (the headline does not reveal the truth on its own)', hv.every(v => v > 0.15 && v < 0.5));

console.log('\n== 4. Robustness of the central discovery ==');
// (a) the information world still smiles, and the others still do not, when our parameters move by ±50%.
const alt = [
  ['info', { infoSigmaHome: 0.15 }], ['info', { infoSigmaOther: 1.5 }], ['info', { infoHomeQuality: 0.15 }], ['info', { infoNoise: 0.3 }],
  ['favour', { favour: 0.45 }], ['favour', { favour: 0.2 }], ['lenient', { effect: 0.6 }], ['lenient', { effect: 0.25 }], ['quality', { effect: 0.6 }],
];
for (const [k, o] of alt) {
  let n = 0; for (let s = 1; s <= 10; s++) { const p = M.testSpread(M.makeWorld(k, s * 17, { train: o })).pattern; if ((k === 'info') === (p === 'smile')) n++; }
  check(`${k} with ${JSON.stringify(o)}: ${k === 'info' ? 'smile' : 'no smile'} on ≥ 8 of 10 seeds`, n >= 8, n + '/10');
}
// (b) add confounding sorting to the ERC world: matches become more likely for better proposals and for more generous judges
// (odds × e^(0.5 z) on each). The naive gap now overstates the bonus; eq. 1 (proposal and judge effects) should not.
const cw = M.makeWorld('erc', 11, { confound: { quality: 0.5, lenient: 0.5 } }), naive = M.headline(cw).gap, feC = M.twoWayFE(cw, 30);
console.log(`  with sorting: naive gap ${f3(naive)}, eq. 1 estimate ${f3(feC)}`);
check('eq. 1 stays within the paper CI under sorting while the naive gap moves well above it', feC >= 0.135 && feC <= 0.193 && naive > 0.25, `naive ${f3(naive)} vs eq. 1 ${f3(feC)}`);

console.log('\n== 5. Gate cross-check (memo only, not displayed) ==');
{ const w = ercW[0], r = w.reviews; const s = new Float64Array(w.nP), c = new Float64Array(w.nP), mt = new Uint8Array(w.nP);
  for (let k = 0; k < r.m.length; k++) { s[r.p[k]] += r.m[k]; c[r.p[k]]++; if (r.x[k]) mt[r.p[k]] = 1; }
  const avgs = Array.from(s).map((v, i) => v / c[i]); const sorted = avgs.slice().sort((a, b) => b - a); const cut = sorted[Math.floor(0.32 * w.nP)];
  let a1 = 0, n1 = 0, a0 = 0, n0 = 0; for (let i = 0; i < w.nP; i++) { const pass = avgs[i] > cut ? 1 : 0; if (mt[i]) { a1 += pass; n1++; } else { a0 += pass; n0++; } }
  console.log(`  top 32% by average mark: with a matched reviewer ${(100 * a1 / n1).toFixed(1)}%, without ${(100 * a0 / n0).toFixed(1)}%: +${(100 * (a1 / n1 - a0 / n0)).toFixed(1)} p.p. for one matched reviewer among ~4.`);
  console.log('  Paper (correlational, Table 1): +1.7 p.p. chance of an A per extra same-country/citizenship panel member (of 15.1), assigned or not.'); }

console.log('\n== 6. The bet ==');
check('bet key: the 0.9 p.p. gap falls in "About 1 point"', M.judgeBet('one').right && !M.judgeBet('five').right && !M.judgeBet('none').right);
const g = M.newGame(7); check('a game has 3 training cases drawn without repeats, then the ERC', g.cases.length === 4 && new Set(g.cases.slice(0, 3).map(c => c.kind)).size === 3 && g.cases[3].kind === 'erc');

console.log(`\n${fails === 0 ? 'ALL PASS' : fails + ' FAIL(S)'}`);
process.exitCode = fails ? 1 : 0;
