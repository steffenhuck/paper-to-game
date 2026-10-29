// Fidelity check (build step 1): runs mechanism.js in Node against the paper's reported numbers.
// Run: node fidelity.js > fidelity-result.txt
const M = require('./mechanism.js'); const C = M.CONFIG;
let fails = 0;
function check(name, got, want, tol) {
  const ok = Math.abs(got - want) <= tol; if (!ok) fails++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}: got ${got.toFixed(3)}, paper ${want} (tol ${tol})`);
}
function truth(name, ok) { if (!ok) fails++; console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`); }
const T = i => C.talk.indexOf(i), L = i => C.lean.indexOf(i);
const f = (s, p) => C.bSal * s + C.bPos * p + C.bInt * s * p;   // Model 3 at any point, for comparison with Fig. 5

console.log('== Act 2: Table 3 Model 3 against Fig. 5 (values read off the figure) ==');
check('Fig. 5, pos -1: slope of the line (pp per unit salience)', (f(0.2, -1) - f(-0.2, -1)) / 0.4, 65, 8);       // line runs ~-11 to ~+15
check('Fig. 5, pos -1: value at salience +0.2', f(0.2, -1), 15, 2.5);
check('Fig. 5, pos -1: value at salience -0.2', f(-0.2, -1), -11, 2.5);
check('Fig. 5, pos +1: slope (flat)', (f(0.2, 1) - f(-0.2, 1)) / 0.4, -0.75, 3);
check('Fig. 5, gap between lines at salience 0', f(0, -1) - f(0, 1), 1.6, 1.5);
console.log('== Act 2: the paper\'s sentences (p. 355) ==');
truth('"whether accommodating or adversarial", with no rise in attention the position shift moves the RR by under 1 point',
  Math.abs(M.rrEffect(T(0), L(-1))) < 1 && Math.abs(M.rrEffect(T(0), L(1))) < 1);
truth('"accommodating ... contributes to the radical right\'s success, provided ... increasing attention": loud+tough is the largest gain of all nine',
  M.effectGrid().flat().every(v => v <= M.rrEffect(T(0.2), L(-1))) && M.rrEffect(T(0.2), L(-1)) > 10);
truth('adversarial + more attention: no gain (Fig. 5 flat line)', M.rrEffect(T(0.1), L(1)) <= 0 && M.rrEffect(T(0.2), L(1)) <= 0);
truth('more attention alone (hold position) raises the RR (Model 2/3 salience effect)', M.rrEffect(T(0.1), L(0)) > 0);
console.log('== Act 1: Fig. 3 read-offs against the paper\'s text (p. 350) ==');
const fight = id => M.isFight(C.countries.find(c => c.id === id));
truth('"Austria, Germany, Hungary ... heavy politicisation"', fight('AT') && fight('DE') && fight('HU'));
truth('"another strongly affected like Greece did not"', !fight('GR'));
truth('"Netherlands and Switzerland ... or ... Poland did so nevertheless"', fight('NL') && fight('CH') && fight('PL'));
truth('"immigration was not politicised in Ireland"', !fight('IE'));
const naive = M.scoreAct1(M.naiveCalls());
truth(`"neither necessary nor sufficient": "hit hard = fight" scores ${naive.right}/${naive.of}, no better than a coin`, naive.right === 4);
console.log('== Robustness: does the discovery depend on our design choices? ==');
// Act 1: the fight line
let lo = 0, hi = 10; const base = JSON.stringify(C.countries.map(M.isFight));
for (let x = 0; x <= 10; x += 0.05) { const old = C.fightLine; C.fightLine = x; const same = JSON.stringify(C.countries.map(M.isFight)) === base; C.fightLine = old; if (same && !lo) lo = x; if (!same && lo && hi === 10 && x > old) hi = x; }
console.log(`  Act 1 classification identical for any fight line from ${lo.toFixed(2)} to ${(hi - 0.05).toFixed(2)} (we use ${C.fightLine}, the paper's mean+1sd).`);
truth('Act 1 robust: same split at the paper\'s lower benchmark (1.3) and at 5', lo <= 1.3 && hi > 5);
// Act 2: the hold limit
const outcomes = lim => C.campaigns.map((_, ci) => { const o = []; C.talk.forEach((_, t) => C.lean.forEach((_, l) => { if (M.allowed(ci, t, l)) o.push(M.rrEffect(t, l) <= lim); })); return o.join(); }).join('|');
const ref = outcomes(C.holdLimit); const ok = [0.8, 1.5, 2, 3.1].every(x => outcomes(x) === ref);
truth('Act 2 wins and losses identical for any hold limit in 0.8–3.1 (we use 1)', ok);
truth('Act 2 robust to dropping the interaction (Model 2): loud+tough still the largest gain', M.effectGrid().every((row, t) => row.every((_, l) => M.rrEffectModel2(t, l) <= M.rrEffectModel2(T(0.2), L(-1)))));
const m2open = M.rrEffectModel2(T(0.1), L(1));
console.log(`  NOT robust: under Model 2 (no interaction), talking more while leaning open gives ${m2open.toFixed(2)} pp, not ~-0.9. That half of the`);
console.log('  discovery rests on Model 3\'s interaction term (t = -2.18, 37 elections); the game says so at the moment it shows it.');
console.log('== Determinism ==');
truth('no randomness: two runs identical', JSON.stringify(M.effectGrid()) === JSON.stringify(M.effectGrid()));
console.log('\nEffect grid (pp change in RR vote; rows talk same/+10/+20, cols tougher/hold/open):');
M.effectGrid().forEach(r => console.log('  ' + r.map(v => v.toFixed(2).padStart(7)).join('')));
console.log(fails ? `\n${fails} FAILED` : '\nALL PASS');
process.exit(fails ? 1 : 0);
