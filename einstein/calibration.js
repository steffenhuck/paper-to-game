// Calibration check for Einstein's Flower Merchant: the mechanism against Einstein (1905), §1, §4, §5 and §10, with explicit tolerances;
// then the robustness of the game's pattern to the game's own prices and rates. Run: node calibration.js
const M = require('./mechanism.js');
const { CONFIG, compose, speedAfter, clockRate, energy, fuelCost, discount, fly, best, minAlive, drawGame } = M;
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

// The draw. Across many seeds: every game has the shape the design wants (this is a check on our rounds table, not on the paper),
// and the mechanism's patterns hold on every one of them.
const R = Object.fromEntries(Object.entries(CONFIG.merchants).map(([k, m]) => [k, m.rate]));
let shapeOk = true, seeds = 300, firstRef = { ORDINARY: [], BORROWER: [] }, ks = {};
for (let seed = 1; seed <= seeds; seed++) {
  const os = drawGame(seed);
  if (os.length !== 10 || os[9].d !== 100) shapeOk = false;
  if (!os.every(o => best(o, R.PATIENT).n > 0)) shapeOk = false;                        // the patient merchant can profit on every order
  if (os.every(o => best(o, R.BORROWER).n > 0)) shapeOk = false;                       // the borrower refuses something
  if (best(os[9], R.ORDINARY).n !== 0 || best(os[9], R.PATIENT).n !== 6) shapeOk = false; // the long haul is the patient merchant's alone
  if (os[0].d > 2 || minAlive(os[0]) > 2) shapeOk = false;                              // round one: near, alive from two boosters
  if (os.slice(1, 9).filter(o => o.d >= CONFIG.pool.far).length < CONFIG.pool.minFar) shapeOk = false; // at least two far stars
  if (os.some(o => o.keep > 10.001)) shapeOk = false;                                   // no flower keeps longer than the museum's
  os.forEach(o => { ks[minAlive(o)] = (ks[minAlive(o)] || 0) + 1; });
  for (const k of ['ORDINARY', 'BORROWER']) { const i = os.findIndex(o => best(o, R[k]).n === 0); firstRef[k].push(i < 0 ? 11 : i + 1); }
}
check(`draw: every one of ${seeds} seeds has the designed shape (patient profits everywhere; borrower refuses something; long haul is the patient's; round one near and forgiving; two far stars; keep-times bounded)`, shapeOk);
check('draw: the cheapest alive count spans 2 to 6 across seeds', [2, 3, 4, 5, 6].every(k => ks[k] > 0), JSON.stringify(ks));
const spread = a => new Set(a).size; check('draw: the first refusal lands in different rounds on different seeds, for both discounting merchants', spread(firstRef.ORDINARY) >= 4 && spread(firstRef.BORROWER) >= 4, 'ordinary ' + spread(firstRef.ORDINARY) + ' rounds, borrower ' + spread(firstRef.BORROWER));
check('draw: the same seed draws the same game', JSON.stringify(drawGame(99)) === JSON.stringify(drawGame(99)));
check('draw: different seeds draw different games', JSON.stringify(drawGame(1)) !== JSON.stringify(drawGame(2)));
check('fate: every franc is the richest merchant; a small share is a pauper; a loss is broke; the score is the share out of 100, floored at 0', M.fate(100, 100) === 'the richest merchant in Bern' && M.fate(10, 100) === 'a pauper' && M.fate(-5, 100) === 'broke' && M.score(79, 100) === 79 && M.score(-5, 100) === 0);
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
