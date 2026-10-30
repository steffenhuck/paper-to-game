// Calibration check for The Light Post: the mechanism against Einstein (1905), §1, §4, §5 and §10, with explicit tolerances;
// then the robustness of the game's pattern to the game's own prices and rates. Run: node calibration.js
const M = require('./mechanism.js');
const { CONFIG, compose, speedAfter, clockRate, energy, fuelCost, discount, fly, best, minAlive } = M;
let pass = 0, fail = 0; const out = [];
function check(name, ok, detail) { (ok ? pass++ : fail++); out.push((ok ? 'ok   ' : 'FAIL ') + name + (detail !== undefined ? '  [' + detail + ']' : '')); }
const near = (a, b, tol) => Math.abs(a - b) <= tol;

// §5, p. 12: V = (v + w) / (1 + v w / c^2). Worked values, and the paper's own remark that V < c for v, w < c.
check('§5: half + half = 0.8c', near(compose(0.5, 0.5), 0.8, 1e-12), compose(0.5, 0.5));
check('§5: 0.8c + 0.5c = 13/14 c', near(compose(0.8, 0.5), 13 / 14, 1e-12), compose(0.8, 0.5));
check('§5: c + w = c (light is light)', near(compose(1, 0.5), 1, 1e-12), compose(1, 0.5));
check('§5: symmetric in v, w', near(compose(0.3, 0.7), compose(0.7, 0.3), 1e-12));
let below = true; for (let n = 1; n <= 12; n++) if (speedAfter(n) >= 1) below = false;
check('§5: twelve boosters still below c', below, speedAfter(12));
check('§5 group: (a∘b)∘c = a∘(b∘c)', near(compose(compose(0.3, 0.5), 0.6), compose(0.3, compose(0.5, 0.6)), 1e-12));

// §4, p. 10: the moving clock runs slow by sqrt(1 - v^2/c^2). At v = 0.6c the rate is 0.8; at 0.8c it is 0.6.
check('§4: rate at 0.6c = 0.8', near(clockRate(0.6), 0.8, 1e-12));
check('§4: rate at 0.8c = 0.6', near(clockRate(0.8), 0.6, 1e-12));
check('§4: rate at 0 = 1', near(clockRate(0), 1, 1e-12));
const vs = 0.01; check('§4: first-order lag ½ t v²', near(1 - clockRate(vs), 0.5 * vs * vs, 1e-7), 1 - clockRate(vs));
// §1, p. 3: the far station's clock agrees with home's; a rocket at v over d arrives at station time d/v, the flowers at d/v · sqrt(1 - v²).
{ const f = fly({ d: 4, fee: 1, keep: 99 }, 2, 0); check('§1+§4: 4 ly at 0.8c arrives at station time 5 y, rocket clock 3 y', near(f.tHome, 5, 1e-9) && near(f.tCargo, 3, 1e-9), f.tHome + ', ' + f.tCargo); }

// §10, p. 22: W = m c^2 (1/sqrt(1 - v^2/c^2) - 1). At 0.6c, W/mc² = 0.25; at 0.8c, 2/3. Grows without limit.
check('§10: W at 0.6c = 0.25 mc²', near(energy(0.6), 0.25, 1e-12));
check('§10: W at 0.8c = 2/3 mc²', near(energy(0.8), 2 / 3, 1e-12));
check('§10: W at 0.999c > 20 mc²', energy(0.999) > 20, energy(0.999));
check('§10: W is ½ m v² at low v, to first order', near(energy(0.01), 0.5 * 1e-4, 1e-8), energy(0.01));
check('fuel: cost rises with every booster', [1, 2, 3, 4, 5, 6].every((n, i, a) => i === 0 || fuelCost(n) > fuelCost(a[i - 1])));

// Discounting (ours): (1 - r)^t.
check('discount: 4% over 10 years ≈ 0.665', near(discount(10, 0.04), 0.6648, 1e-3), discount(10, 0.04));
check('discount: rate 0 is no discount', discount(37, 0) === 1);

// The orders, merchant by merchant.
const R = Object.fromEntries(Object.entries(CONFIG.merchants).map(([k, m]) => [k, m.rate]));
const bests = k => CONFIG.stars.map(o => best(o, R[k]).n);
check(`patient merchant sends to every star (${bests('PATIENT').join(',')})`, bests('PATIENT').every(n => n > 0));
check(`ordinary merchant refuses exactly one star (${bests('ORDINARY').join(',')})`, bests('ORDINARY').filter(n => n === 0).length === 1);
check(`merchant with a loan refuses exactly two stars (${bests('BORROWER').join(',')})`, bests('BORROWER').filter(n => n === 0).length === 2);
check('the borrower adds a booster at the near star, to be paid sooner', best(CONFIG.stars[0], R.BORROWER).n > best(CONFIG.stars[0], R.PATIENT).n);
check('every star the patient sends to is sent with at least the fewest alive boosters', CONFIG.stars.every(o => best(o, 0).n >= minAlive(o)));
check('at the far stars the sender uses exactly the fewest alive boosters (fuel, not speed, decides)', [2, 3].every(i => best(CONFIG.stars[i], 0).n === minAlive(CONFIG.stars[i])));
for (const k of Object.keys(R)) for (const o of CONFIG.stars) { const bn = best(o, R[k]).n; if (bn) {
  const p = [...Array(7).keys()].map(n => fly(o, n, R[k]).profit); const s = [...p].sort((x, y) => y - x);
  const need = o.name === 'THUN' ? 3 : 4; // the near star is nearly indifferent by design: one booster more or less barely matters there
  check(`${k} ${o.name}: best is unique by ≥ ${need} francs`, s[0] - s[1] >= need, (s[0] - s[1]).toFixed(1)); } }
check('range: four boosters is the fewest that arrive alive', minAlive(CONFIG.range) === 4);
check('range: two boosters arrive dead (the natural first try)', !fly(CONFIG.range, 2, 0).alive);
check('long haul: only the patient merchant can make it pay', best(CONFIG.haul, 0).n === 6 && best(CONFIG.haul, R.ORDINARY).n === 0);

// The pattern the game stages, and whether it comes from the paper or from our prices:
//   (a) the money is bound by the light limit: no booster count brings the fee sooner than d years, so a far star's fee is discounted
//       to nothing whatever the merchant does; (b) the flowers are not bound: boosters can make the rocket's clock as short as you like.
// Check across fuel prices, fees and rates: the home-time never falls below light-time; the flowers' time falls with every booster.
let a = true, b = true;
for (const o of [{ d: 1, fee: 300, keep: 1 }, { d: 10, fee: 300, keep: 1 }, { d: 40, fee: 300, keep: 1 }]) for (let n = 1; n <= 6; n++) {
  const f = fly(o, n, 0); if (f.tHome < f.tLight) a = false; if (n > 1 && f.tCargo >= fly(o, n - 1, 0).tCargo) b = false; }
check('pattern (a): the fee never arrives before light would', a);
check('pattern (b): every booster makes the flowers younger on arrival', b);
// (c) the impatient refuse the far before the near: for any prices, the set of stars a merchant sends to shrinks as the rate rises, far ones first.
let c = true, tried = 0;
for (const price of [3, 10, 30]) for (const fee of [100, 300, 1000]) for (const keep of [1, 3]) {
  const saved = CONFIG.fuelPrice; CONFIG.fuelPrice = price;
  const ds = [1, 3, 10, 30]; let prev = null;
  for (const rate of [0, 0.02, 0.05, 0.1, 0.2]) { const sent = ds.map(d => best({ d, fee, keep }, rate).n > 0); tried++;
    if (prev && sent.some((s, i) => s && !prev[i])) c = false;              // nobody starts sending as the rate rises
    if (sent.some((s, i) => s && ds.slice(0, i).some((_, j) => !sent[j]))) c = false; // nobody sends far while refusing near
    prev = sent; }
  CONFIG.fuelPrice = saved; }
check(`pattern (c): as the rate rises merchants drop the far stars first, never the near (${tried} cases)`, c);

const summary = `${pass} passed, ${fail} failed`;
console.log(out.join('\n') + '\n' + summary);
require('fs').writeFileSync('calibration-result.txt', out.join('\n') + '\n' + summary + '\n');
if (fail) process.exit(1);
