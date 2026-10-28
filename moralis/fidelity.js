const M = require('./mechanism.js');
const C = M.CONFIG, f3 = v => v.toFixed(3);
const pd = M.gameCoefs(C.games.pd), hd = M.gameCoefs(C.games.hawkDove), pg = M.gameCoefs(C.games.publicGood);

console.log('(a) Behaviour of homo moralis residents vs the paper\'s closed forms');
let maxErr = 0;
for (let k = 0; k <= 1.0001; k += 0.05) {
  // Fig. 1 / Prop. 2(c): x̂(κ) = min{1, (S+κT-(1+κ)P)/((1+κ)(S+T-R-P))}, floored at 0
  const xpd = Math.max(0, Math.min(1, (2 + 7 * k - 3 * (1 + k)) / ((1 + k) * (2 + 7 - 5 - 3))));
  const xhd = (1 - k) / (1 + k) * 4 / 6;                     // Section 4: x_κ = (1-κ)/(1+κ)·v/c
  const xpg = 3 * (1 + k) / (3 + k);                          // Example 1 FOC: 2x = (1+κ)(3 - x)
  const e = Math.max(Math.abs(M.residentBehaviour(pd, k) - xpd), Math.abs(M.residentBehaviour(hd, k) - xhd), Math.abs(M.residentBehaviour(pg, k) - xpg));
  maxErr = Math.max(maxErr, e);
}
console.log('  max |engine - closed form| over κ grid, three games:', maxErr.toExponential(2));
console.log('  PD (Fig. 1): x̂ =', [0, 0.25, 0.3, 0.5, 0.667, 1].map(k => `κ=${k}:${f3(M.residentBehaviour(pd, k))}`).join('  '));

console.log('\n(b) Theorem 1: resident κ = σ against 201 mutant κ in [0,1]');
for (let i = 0; i < C.societies.length; i++) {
  const s = M.society(i); let worst = -Infinity, inv = 0;
  for (let j = 0; j <= 200; j++) { const d = M.duel(s.g, s.sigma, j / 200, s.sigma); worst = Math.max(worst, d.edge); if (d.invades) inv++; }
  console.log(`  ${s.name.padEnd(28)} σ=${f3(s.sigma)}  invaders ${inv}/201  best mutant edge ${worst.toExponential(2)}`);
}

console.log('\n(c) Every resident κ on the lever grid: invaded by at least one of the 11 gauntlet mutants unless a behavioural clone of homo hamiltonensis');
for (let i = 0; i < C.societies.length; i++) {
  const s = M.society(i), xH = M.residentBehaviour(s.g, s.sigma); const row = [];
  let ok = true;
  for (let k = 0; k <= 1.0001; k += C.leverStep) {
    const kk = Math.round(k * 100) / 100;
    const n = M.gauntlet(i, kk).filter(d => d.invades).length;
    const cloneOfH = Math.abs(M.residentBehaviour(s.g, kk) - xH) < 1e-6;
    if ((n === 0) !== cloneOfH) ok = false;
    row.push(n);
  }
  console.log(`  ${s.name.padEnd(28)} invaders by κ=0..1 step .05: ${row.join(' ')}   ${ok ? 'OK' : 'MISMATCH'}`);
}

console.log('\n(d) Direction: invaders always lie on the σ side of the resident κ');
for (const [i, kR] of [[1, 0], [1, 1], [3, 0.8], [0, 0.6]]) {
  const s = M.society(i); const inv = M.gauntlet(i, kR).filter(d => d.invades).map(d => d.kM);
  console.log(`  ${s.name.padEnd(28)} resident κ=${kR}, σ=${f3(s.sigma)}: invaders at κ = ${inv.join(', ')}`);
}

console.log('\n(e) Finite ε check (eqs. 11–12 with φ=σ): sign of the edge at ε = 0.01 agrees with the limit');
let agree = 0, tot = 0;
for (let i = 0; i < C.societies.length; i++) {
  const s = M.society(i);
  for (let k = 0; k <= 1.0001; k += 0.1) for (const kM of C.mutantKappas) {
    const d = M.duel(s.g, k, kM, s.sigma); if (d.clone || Math.abs(d.edge) < 1e-3) continue;
    const p = M.payoffsAtEps(s.g, d.x, d.y, s.sigma, 0.01); tot++; if ((p.PM > p.PR) === d.invades) agree++;
  }
}
console.log(`  ${agree}/${tot} non-marginal duels agree (behaviour held at its ε=0 value)`);
