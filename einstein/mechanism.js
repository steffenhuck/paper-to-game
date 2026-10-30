// The Light Post — mechanism. The single source of truth: every rule that turns a booster count into an outcome lives here.
// Executable unchanged in Node (calibration.js, loop.js) and in the browser (inlined verbatim by build.py).
//
// Where everyone is. The merchant (the player) is at home, in Bern, and keeps home time. The customer is at a star, d light-years
// away; the star's station clock has been set to agree with home's by light signals, the rule of §1 (p. 3), so "home time" is also
// the time the customer reads when the flowers arrive, and it is the time the merchant is paid. The flowers ride in the rocket and
// age by the rocket's own clock, §4: slower than home's, the faster the rocket goes.

const CONFIG = {
  // --- The paper's kinematics ----------------------------------------------------------------------------
  c: 1,               // §2 p. 3, postulate 2: light always moves at c. Units: light-years and years, so c = 1 (our choice of units)
  // Composition of parallel velocities, §5 p. 12:  V = (v + w) / (1 + v w / c^2)
  // Moving clock, §4 p. 10:                       tau = t * sqrt(1 - v^2 / c^2)
  // Kinetic energy of a moving body, §10 p. 22:   W = m c^2 (1 / sqrt(1 - v^2 / c^2) - 1), infinite as v -> c
  // Clocks at rest relative to each other, synchronised by light, §1 p. 3: the star's clock reads home time.

  // --- The game's choices ----------------------------------------------------------------------------------
  w: 0.5,             // our choice: every booster adds half light speed in the rocket's own frame, so "two halves" is the natural wrong guess
  maxBoost: 6,        // our choice: six boosters reach 99.7% of c
  fuelPrice: 10,      // our choice: francs per unit of W / (m c^2). One booster costs about 1½ francs, four about 36, six about 125. The shape is §10's; the price is ours.
  // Flowers live or die: alive if they have aged (by the rocket's clock) no more than the order's keep-time. Our choice, to keep one clock per question.
  // The fee is paid on arrival, by the station clock (= home time). The merchant discounts money that comes later: a franc paid t years from
  // now is worth (1 - rate)^t francs today. The rate is the merchant's, chosen at the start of the order book; nothing in the paper sets it.
  merchants: {
    PATIENT:  { rate: 0,    title: 'The patient merchant',  say: 'A franc in forty years is worth a franc today. You can wait.' },
    ORDINARY: { rate: 0.04, title: 'The ordinary merchant', say: 'Money later is worth less: 4% less for every year you wait for it.' },
    BORROWER: { rate: 0.10, title: 'The merchant with a loan', say: 'The bank wants 10% a year. Every year you wait for a fee, a tenth of it is gone.' },
  },
  // Test range: one star, unlimited tries, at the ordinary merchant's rate. Needs 4 boosters to arrive alive.
  range: { name: 'NEW BERN', d: 4, fee: 300, keep: 1 },     // our choice
  // The order book: four stars, the same under every merchant. Fee and keep-time are the customer's; d is the star's.
  //   Thun:  everyone sends with two; the borrower adds a third, to be paid sooner (a few francs: the near star is nearly indifferent).
  //   Olten: everyone sends, and exactly four boosters keep the flowers alive.
  //   Sion:  the patient and the ordinary merchant send; the borrower refuses (250 francs in 15 years is 50 to him).
  //   Brig:  only the patient merchant sends, and only with six; to the ordinary merchant 300 francs in 30 years is 88, less than the fuel.
  stars: [
    { name: 'THUN',  d: 2,  fee: 500, keep: 2 },   // our choice
    { name: 'OLTEN', d: 3,  fee: 500, keep: 1 },   // our choice
    { name: 'SION',  d: 15, fee: 250, keep: 3 },   // our choice
    { name: 'BRIG',  d: 30, fee: 300, keep: 3 },   // our choice
  ],
  // The ending: how you die, by the share of the best possible profit you made. Our choice of words; the shares are arbitrary.
  fates: [ [0.97, 'the richest merchant in Bern'], [0.75, 'a comfortable man'], [0.4, 'solvent, just'], [0, 'a poor man'], [-Infinity, 'a pauper'] ],
  // The long haul (encore): a museum a century away. Only a merchant who does not discount at all can take it.
  haul: { name: 'LOCARNO', d: 100, fee: 800, keep: 10 }, // our choice
};

// Speed after n boosters, each a §5 composition of w with the current speed. The paper: such parallel
// transformations "necessarily form a group" (p. 12), so each booster is the same step in the rocket's own frame.
function compose(v, w, c = CONFIG.c) { return (v + w) / (1 + v * w / (c * c)); }
function speedAfter(n, w = CONFIG.w) { let v = 0; for (let i = 0; i < n; i++) v = compose(v, w); return v; }
// §4: a clock moving at v runs at this fraction of the rate of the clock at rest.
function clockRate(v, c = CONFIG.c) { return Math.sqrt(1 - (v * v) / (c * c)); }
// §10: kinetic energy in units of m c^2. Grows without limit as v -> c.
function energy(v, c = CONFIG.c) { return 1 / Math.sqrt(1 - (v * v) / (c * c)) - 1; }
function fuelCost(n, price = CONFIG.fuelPrice) { return n <= 0 ? 0 : price * energy(speedAfter(n)); }
// A franc paid t home-years from now, in today's francs.
function discount(t, rate) { return Math.pow(1 - rate, t); }

// One rocket to one order with n boosters, for a merchant with this discount rate. n = 0 refuses: nothing earned, nothing spent.
function fly(order, n, rate) {
  const tLight = order.d / CONFIG.c;
  if (n <= 0) return { refused: true, n: 0, tLight, alive: false, fee: 0, today: 0, cost: 0, profit: 0 };
  const v = speedAfter(n), rateClock = clockRate(v), tHome = order.d / v, tCargo = tHome * rateClock;
  const alive = tCargo <= order.keep + 1e-9;                 // the rocket's clock against the flowers' keep-time
  const fee = alive ? order.fee : 0;                          // paid on arrival, station clock
  const disc = discount(tHome, rate), today = fee * disc;     // what that fee is worth to the merchant now
  const cost = fuelCost(n);
  return { refused: false, n, v, rateClock, tHome, tCargo, tLight, alive, fee, disc, today, cost, profit: today - cost };
}
// The booster count that earns the most on an order for this merchant (0 if nothing earns a franc).
function best(order, rate) {
  let b = fly(order, 0, rate);
  for (let n = 1; n <= CONFIG.maxBoost; n++) { const f = fly(order, n, rate); if (f.profit > b.profit + 1e-9) b = f; }
  return b;
}
// The fewest boosters that get the flowers there alive (0 if none does).
function minAlive(order) { for (let n = 1; n <= CONFIG.maxBoost; n++) if (fly(order, n, 0).alive) return n; return 0; }
// How the merchant dies, given the profit made and the best possible.
function fate(profit, bestProfit) { if (profit < -0.5) return CONFIG.fates[CONFIG.fates.length - 1][1]; const share = bestProfit > 0 ? profit / bestProfit : 0; for (const [s, w] of CONFIG.fates) if (share >= s) return w; return CONFIG.fates[CONFIG.fates.length - 1][1]; }
// A whole order book for one merchant: every order flown with its allocated boosters; the profit, and the best profit, summed.
function runBook(orders, alloc, rate) {
  if (alloc.length !== orders.length || alloc.some(n => n < 0 || n > CONFIG.maxBoost || n !== Math.floor(n))) return { error: 'bad allocation' };
  const flights = orders.map((o, i) => fly(o, alloc[i], rate)), bests = orders.map(o => best(o, rate));
  return { flights, bests, profit: flights.reduce((s, f) => s + f.profit, 0), bestProfit: bests.reduce((s, f) => s + f.profit, 0) };
}

// ---- formatting (plain words, rounded; the decimals stay in here) ----
function fmtYears(y) {
  if (y === Infinity) return 'never';
  if (y < 1 / 365) return 'no time at all';
  const days = Math.round(y * 365);
  if (days < 60) return days + (days === 1 ? ' day' : ' days');
  const months = Math.round(y * 12);
  if (months < 24) return months + ' months';
  const w = Math.floor(y), m = Math.round((y - w) * 12);
  if (m === 12) return (w + 1) + ' years';
  return w + (w === 1 ? ' year' : ' years') + (m ? ' ' + m + (m === 1 ? ' month' : ' months') : '');
}
function fmtLimit(y) { const w = Math.floor(y), h = y - w; return (w || '') + (h ? '½' : '') + (y === 1 ? ' year' : ' years'); }
function fmtSpeed(v) {
  const p = v * 100;
  if (p >= 99.5) return 'all but light speed';
  if (p >= 95) return 'about ' + Math.round(p) + '% of light speed';
  return 'about ' + Math.round(p / 5) * 5 + '% of light speed';
}
function fmtRate(rate) {
  if (rate > 0.95) return 'as fast as at home';
  if (rate > 0.7) return 'a little slower than at home';
  if (rate > 0.55) return 'half as fast';
  if (rate > 0.3) return 'a third as fast';
  if (rate > 0.17) return 'a fifth as fast';
  if (rate > 0.1) return 'a tenth as fast';
  return 'hardly at all';
}
function fmtFrancs(x) { const r = Math.round(x); return (r < 0 ? '−' : '') + Math.abs(r) + (Math.abs(r) === 1 ? ' franc' : ' francs'); }
function fmtShare(x) { // 0..1 as words
  if (x >= 0.97) return 'all of it'; if (x >= 0.8) return 'most of it'; if (x >= 0.55) return 'over half'; if (x >= 0.3) return 'a third'; if (x > 0.05) return 'a little'; return 'next to nothing';
}

const MECH = { CONFIG, compose, speedAfter, clockRate, energy, fuelCost, discount, fly, best, minAlive, fate, runBook, fmtYears, fmtLimit, fmtSpeed, fmtRate, fmtFrancs, fmtShare };
if (typeof module !== 'undefined') module.exports = MECH;
