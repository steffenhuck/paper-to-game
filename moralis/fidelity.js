// Fidelity check for The Balance (structural level). Runs against mechanism.js, the only copy.
const M = require('./mechanism.js');
const C = M.CONFIG, f3 = v => v.toFixed(3);
let fails = 0; const check = (ok, label) => { console.log(`  [${ok ? 'PASS' : 'FAIL'}] ${label}`); if (!ok) fails++; };
const pd = M.gameCoefs(C.games.pd), hd = M.gameCoefs(C.games.hawkDove), pg = M.gameCoefs(C.games.publicGood);
const grid = n => Array.from({ length: n + 1 }, (_, i) => i / n);

console.log('(a) Resident behaviour against the paper\'s closed forms (tolerance 1e-9)');
let e1 = 0, e2 = 0, e3 = 0;
for (const k of grid(100)) {
  const xpd = Math.max(0, Math.min(1, (2 + 7 * k - 3 * (1 + k)) / ((1 + k) * (2 + 7 - 5 - 3))));   // Prop. 2(c), eq. 19, Fig. 1
  const xhd = (1 - k) / (1 + k) * 4 / 6;                                                         // Section 4: (1-κ)/(1+κ)·v/c
  const xpg = 3 * (1 + k) / (3 + k);                                                             // Example 1: C'(x) = (1+κ)B'(2x)
  e1 = Math.max(e1, Math.abs(M.residentBehaviour(pd, k) - xpd));
  e2 = Math.max(e2, Math.abs(M.residentBehaviour(hd, k) - xhd));
  e3 = Math.max(e3, Math.abs(M.residentBehaviour(pg, k) - xpg));
}
check(e1 < 1e-9, `prisoners' dilemma vs Fig. 1 / eq. 19: max error ${e1.toExponential(1)}`);
check(e2 < 1e-9, `hawk–dove vs Section 4 closed form: max error ${e2.toExponential(1)}`);
check(e3 < 1e-9, `public good vs Example 1 first-order condition: max error ${e3.toExponential(1)}`);
check(M.residentBehaviour(pd, 0.25) < 1e-9 && Math.abs(M.residentBehaviour(pd, 2 / 3) - 1) < 1e-9,
  'Fig. 1 kinks: cooperation 0 up to κ = (P−S)/(T−P) = 1/4, 1 from κ = (T−R)/(R−S) = 2/3');

console.log('\n(b) Theorem 1, first claim: a resident with κ = σ is beaten by no mutant (201-point mutant grid, tolerance 1e-9)');
for (let i = 0; i < C.societies.length; i++) {
  const s = M.society(i); let worst = -Infinity;
  for (const kM of grid(200)) worst = Math.max(worst, M.duel(s.g, s.sigma, kM, s.sigma).edge);
  check(worst <= 1e-9, `${s.name}: best mutant edge ${worst.toExponential(1)}`);
}

console.log('\n(c) Theorem 1, second claim, on the game\'s own lever and gauntlet: beaten by someone iff behaviour differs from homo hamiltonensis');
for (let i = 0; i < C.societies.length; i++) {
  const s = M.society(i), xH = M.residentBehaviour(s.g, s.sigma); const row = []; let ok = true;
  for (let j = 0; j <= 20; j++) {
    const k = j / 20, t = M.runTest(i, k, 0);
    if (t.held !== (Math.abs(M.residentBehaviour(s.g, k) - xH) < 1e-6)) ok = false;
    row.push(t.beatenBy);
  }
  check(ok, `${s.name.padEnd(27)} beaten-by count at balance 0, .05, …, 1: ${row.join(' ')}`);
}

console.log('\n(d) Direction: every invader sits on the σ side of the resident (all lever positions, all societies)');
let dirOk = true;
for (let i = 0; i < C.societies.length; i++) { const s = M.society(i);
  for (let j = 0; j <= 20; j++) { const t = M.runTest(i, j / 20, 0);
    if (j / 20 < s.sigma && t.lessMoral) dirOk = false; if (j / 20 > s.sigma && t.moreMoral) dirOk = false; } }
check(dirOk, 'no invader on the far side of the resident from σ');

console.log('\n(e) Finite ε (eqs. 11–12 with φ = σ): sign of the edge at ε = 0.01 agrees with the ε → 0 limit, for edges above 1e-3');
let agree = 0, tot = 0;
for (let i = 0; i < C.societies.length; i++) { const s = M.society(i);
  for (const k of grid(10)) for (const kM of C.mutantKappas) {
    const d = M.duel(s.g, k, kM, s.sigma); if (d.clone || Math.abs(d.edge) < 1e-3) continue;
    const p = M.payoffsAtEps(s.g, d.x, d.y, s.sigma, 0.01); tot++; if ((p.PM > p.PR) === d.invades) agree++; } }
check(agree === tot, `${agree}/${tot} duels agree`);

console.log('\n(f) Robustness: the discovery (unbeatable balance = σ) does not depend on our choices of payoffs, mutant grid or σ');
// alternative games satisfying the paper's conditions, alternative σ, finer mutant grid
const rnd = M.mulberry32(97);
let robustOk = 0, robustN = 0, worstGap = 0;
for (let trial = 0; trial < 60; trial++) {
  let g;
  const kind = trial % 3;
  if (kind === 0) { // public good B(s) = b s - s^2/4·q, C(x) = c x^2 with Example 1's conditions checked
    const b = 2 + 3 * rnd(), q = 0.5 + rnd(), c = 0.6 + rnd(), m = 2;
    if (!(b - q * 2 * m / 2 > 0) || !(2 * c * m > 2 * (b - q * 2 * m / 2))) { trial--; continue; }
    g = { m, c0: 0, c1: b, c2: b, c11: -q / 4 - c, c12: -q / 2, c22: -q / 4 };
  } else if (kind === 1) { const c = 2 + 6 * rnd(), v = c * (0.1 + 0.8 * rnd()); g = M.gameCoefs({ m: 1, bimatrix: [[(v - c) / 2, v], [0, v / 2]] }); }
  else { const P = 1 + rnd(), S = P - 0.2 - rnd(), R = P + 0.5 + 2 * rnd(), T = R + 0.5 + 2 * rnd(); if (R + P >= S + T) { trial--; continue; } g = M.gameCoefs({ m: 1, bimatrix: [[R, S], [T, P]] }); }
  const sigma = Math.round(rnd() * 20) / 20;
  // find the lever position(s) on a 0.01 grid that no mutant on a 101-point grid beats
  const xH = M.residentBehaviour(g, sigma);
  let ok = true;
  for (const k of grid(100)) {
    let beaten = false;
    for (const kM of grid(100)) if (M.duel(g, k, kM, sigma).invades) { beaten = true; break; }
    const clone = Math.abs(M.residentBehaviour(g, k) - xH) < 1e-6;
    if (beaten === clone) { ok = false; worstGap = Math.max(worstGap, Math.abs(k - sigma)); }
  }
  robustN++; if (ok) robustOk++;
}
check(robustOk === robustN, `${robustOk}/${robustN} random alternative games and σ: unbeatable set = behaviour of κ = σ exactly`);

console.log('\n(g) Scoring and order: outcomes do not depend on the arrival-order seed; boundary balances 0 and 1');
let seedOk = true;
for (let i = 0; i < C.societies.length; i++) for (const k of [0, 0.35, 1]) {
  const a = M.runTest(i, k, 0), b = M.runTest(i, k, 7);
  if (a.beatenBy !== b.beatenBy || a.order.join() === b.order.join()) seedOk = false;
}
check(seedOk, 'different seeds change the order only, never the count');
check(M.runTest(1, 0, 0).moreMoral === 10 && M.runTest(1, 1, 0).lessMoral === 8, 'siblings: selfish beaten by 10 more-moral types; Kantian by 8 less-moral types');
check(M.runTest(0, 0, 0).held && M.runTest(4, 0, 0).held && M.runTest(4, 0.25, 0).held && !M.runTest(4, 0.3, 0).held,
  'strangers: selfish holds (Corollary 2); classmates: every balance up to 1/4 holds (behavioural clones after Fig. 1), 0.3 does not');

console.log(`\n${fails === 0 ? 'ALL CHECKS PASS' : fails + ' CHECK(S) FAILED'}`);
process.exitCode = fails ? 1 : 0;
