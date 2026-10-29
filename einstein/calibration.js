// Calibration check for The Light Post: the mechanism against Einstein (1905), §4, §5 and §10, with explicit tolerances;
// then the robustness of the game's pattern to the game's own prices. Run: node calibration.js
const M = require('./mechanism.js');
const { CONFIG, compose, speedAfter, clockRate, energy, fuelCost, fly, best } = M;
let pass = 0, fail = 0; const out = [];
function check(name, ok, detail) { (ok ? pass++ : fail++); out.push((ok ? 'ok   ' : 'FAIL ') + name + (detail ? '  [' + detail + ']' : '')); }
const near = (a, b, tol) => Math.abs(a - b) <= tol;

// §5, p. 12: V = (v + w) / (1 + v w / c^2). Worked values, and the paper's own remark that V < c for v, w < c.
check('§5: half + half = 0.8c', near(compose(0.5, 0.5), 0.8, 1e-12), compose(0.5, 0.5));
check('§5: 0.8c + 0.5c = 13/14 c', near(compose(0.8, 0.5), 13 / 14, 1e-12), compose(0.8, 0.5));
check('§5: c + w = c (light is light)', near(compose(1, 0.5), 1, 1e-12), compose(1, 0.5));
check('§5: symmetric in v, w', near(compose(0.3, 0.7), compose(0.7, 0.3), 1e-12));
let below = true; for (let n = 1; n <= 12; n++) if (speedAfter(n) >= 1) below = false;
check('§5: twelve boosters still below c', below, speedAfter(12));
// §5, p. 12: parallel transformations form a group — composing boosts is associative.
check('§5 group: (a∘b)∘c = a∘(b∘c)', near(compose(compose(0.3, 0.5), 0.6), compose(0.3, compose(0.5, 0.6)), 1e-12));

// §4, p. 10: the moving clock runs slow by sqrt(1 - v^2/c^2). At v = 0.6c the rate is 0.8; at 0.8c it is 0.6.
check('§4: rate at 0.6c = 0.8', near(clockRate(0.6), 0.8, 1e-12));
check('§4: rate at 0.8c = 0.6', near(clockRate(0.8), 0.6, 1e-12));
check('§4: rate at 0 = 1', near(clockRate(0), 1, 1e-12));
// §4, p. 11: a clock sent round a closed curve at v comes back behind by ½ t v²/c² seconds, to first order.
const vs = 0.01; check('§4: first-order lag ½ t v²', near(1 - clockRate(vs), 0.5 * vs * vs, 1e-7), 1 - clockRate(vs));

// §10, p. 22: W = m c^2 (1/sqrt(1 - v^2/c^2) - 1). At 0.6c, W/mc² = 0.25; at 0.8c, 2/3. Grows without limit.
check('§10: W at 0.6c = 0.25 mc²', near(energy(0.6), 0.25, 1e-12));
check('§10: W at 0.8c = 2/3 mc²', near(energy(0.8), 2 / 3, 1e-12));
check('§10: W at 0.999c > 20 mc²', energy(0.999) > 20, energy(0.999));
check('§10: W is ½ m v² at low v, to first order', near(energy(0.01), 0.5 * 1e-4, 1e-8), energy(0.01));
check('fuel: cost rises with every booster', [1, 2, 3, 4, 5, 6].every((n, i, a) => i === 0 || fuelCost(n) > fuelCost(a[i - 1])));

// The orders. The mixed book: best counts all different, exactly one to refuse. The florists and hospitals: the same four stars,
// and star by star the florists want at least as many boosters as the hospitals, more at the far stars.
const { bookFor } = M;
for (const key of Object.keys(CONFIG.employers)) {
  const b = bookFor(key), bests = b.orders.map(o => best(o).n);
  if (key === 'MIXED') { check(`mixed book: best counts all different (${bests.join(',')})`, new Set(bests).size === bests.length); check('mixed book: exactly one order to refuse', bests.filter(n => n === 0).length === 1); }
  else check(`${key}: every order pays at its best (${bests.join(',')})`, bests.every(n => n > 0));
  for (const o of b.orders) { const bn = best(o).n; if (bn) {
    const p = [...Array(7).keys()].map(n => fly(o, n).profit); const s = [...p].sort((x, y) => y - x);
    check(`${key} ${o.name}: best is unique by ≥ 4 francs`, s[0] - s[1] >= 4, (s[0] - s[1]).toFixed(1)); } }
}
{ const F = bookFor('FLORISTS').orders.map(o => best(o).n), H = bookFor('HOSPITALS').orders.map(o => best(o).n);
  check(`florists vs hospitals, star by star: ${F.join(',')} vs ${H.join(',')} — florists never fewer, more at the far stars`, F.every((n, i) => n >= H[i]) && F[3] > H[3] && F[2] > H[2]); }
check('range: best count is 4', best(CONFIG.range).n === 4);
check('range: two boosters lose money (the natural first try)', fly(CONFIG.range, 2).profit < 0);

// The pattern the game stages, and whether it comes from the paper or from our prices:
//   a customer who pays for speed stops early; a customer who pays for freshness, far away, pays for late boosters.
// Reason in the paper: near c, the wait beyond light-time shrinks like (1 - v) while the flowers' ageing shrinks like sqrt(1 - v):
// promptness saturates first. Check it survives any sensible fuel price and fee, with equal keep and patience.
let holds = true, tried = 0;
for (const price of [3, 5, 10, 20, 40]) for (const fee of [60, 100, 200, 400]) for (const d of [2, 5, 10, 20]) for (const span of [0.5, 1, 2, 4]) {
  const saved = CONFIG.fuelPrice; CONFIG.fuelPrice = price;
  const nF = best({ who: 'FLORIST', d, fee, keep: span, patience: span }).n, nH = best({ who: 'HOSPITAL', d, fee, keep: span, patience: span }).n;
  CONFIG.fuelPrice = saved; tried++;
  if (nF && nH && nF < nH) holds = false;
}
check(`pattern: freshness-buyer never wants fewer boosters than speed-buyer (${tried} price/fee/distance cases)`, holds);
let farther = true;
for (const fee of [150, 300, 600]) { let last = 0; for (const d of [2, 5, 10, 20, 40]) { const n = best({ who: 'FLORIST', d, fee, keep: d / 3, patience: 1 }).n; if (n && n < last) farther = false; if (n) last = n; } }
check('pattern: for a freshness-buyer, farther stars want at least as many boosters (keep scaled with distance)', farther);

const summary = `${pass} passed, ${fail} failed`;
console.log(out.join('\n') + '\n' + summary);
require('fs').writeFileSync('calibration-result.txt', out.join('\n') + '\n' + summary + '\n');
if (fail) process.exit(1);
