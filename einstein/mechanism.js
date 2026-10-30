// The Light Post — mechanism. The single source of truth: every rule that turns a booster count into an outcome lives here.
// Executable unchanged in Node (calibration.js, loop.js) and in the browser (inlined verbatim by build.py).

const CONFIG = {
  // --- The paper's kinematics ----------------------------------------------------------------------------
  c: 1,               // §2 p. 3, postulate 2: light always moves at c. Units: light-years and years, so c = 1 (our choice of units)
  // Composition of parallel velocities, §5 p. 12:  V = (v + w) / (1 + v w / c^2)
  // Moving clock, §4 p. 10:                       tau = t * sqrt(1 - v^2 / c^2)
  // Kinetic energy of a moving body, §10 p. 22:   W = m c^2 (1 / sqrt(1 - v^2 / c^2) - 1), infinite as v -> c
  // Arrival on the far station's clock: t = d / v, the station's clock synchronised with home by §1's light rule (p. 3)

  // --- The game's choices ----------------------------------------------------------------------------------
  w: 0.5,             // our choice: every booster adds half light speed in the rocket's own frame, so "two halves" is the natural wrong guess
  maxBoost: 6,        // our choice: six boosters reach 99.7% of c
  fuelPrice: 10,      // our choice: francs per unit of W / (m c^2). One booster costs about 1½ francs, six about 130. The shape is §10's; the price is ours.
  // Customers. Each pays a fee for a perfect delivery and discounts it for two things the paper's clocks measure:
  //   freshness: the flowers' own clock, tau. A customer who pays for freshness pays fee * (1 - tau / keep), nothing once tau >= keep.
  //   promptness: the wait on the home clock beyond the light-time d (nothing can arrive sooner than light). Pays fee * (1 - (t - d) / patience).
  // The weight wf says how much of the fee is for freshness; the rest is for promptness. Fees, keep, patience and the weights are ours.
  customers: {
    FLORIST:  { wf: 1,   line: 'pays for freshness' },
    HOSPITAL: { wf: 0,   line: 'pays for speed' },
    GALLERY:  { wf: 0.5, line: 'pays for both' },
    MUSEUM:   { wf: 1,   line: 'pays for freshness' },
  },
  // Test range: one florist, unlimited tries. Best: 4 boosters.
  range: { name: 'NEW BERN', who: 'FLORIST', d: 4, fee: 150, keep: 3, patience: 1 },   // our choice
  // Order books. The player chooses whom to fly for; the four stars are the same under every valuation.
  //   Florists' guild: every order pays for freshness. Hospital service: every order pays for speed. A mixed book: four customers, four rules.
  // Under the florists the far stars want the late boosters (bests 4,5,6,5); under the hospitals they stop at four (3,4,4,4). The mixed book has one order to refuse.
  stars: [
    { name: 'THUN',  d: 2  },
    { name: 'OLTEN', d: 10 },
    { name: 'SION',  d: 15 },
    { name: 'BRIG',  d: 20 },
  ],
  employers: {
    FLORISTS:  { title: 'The florists’ guild', them: 'the florists’ guild', say: 'Every order pays for freshness: the full fee for flowers that have not aged, less as they age, nothing once they are past keeping.',
      orders: [ { who: 'FLORIST', fee: 300, keep: 3.5, patience: 1 }, { who: 'FLORIST', fee: 300, keep: 3.5, patience: 1 }, { who: 'FLORIST', fee: 300, keep: 3.5, patience: 1 }, { who: 'FLORIST', fee: 250, keep: 8, patience: 1 } ] }, // our choice; bests 4, 5, 6, 5 — Brig's flowers are hardier, so the sixth booster overshoots there
    HOSPITALS: { title: 'The hospital service', them: 'the hospital service', say: 'Every order pays for speed: the full fee if the rocket arrives when light could, less for every year after, nothing once their patience is gone.',
      orders: [ { who: 'HOSPITAL', fee: 150, keep: 1, patience: 3 }, { who: 'HOSPITAL', fee: 150, keep: 1, patience: 3 }, { who: 'HOSPITAL', fee: 150, keep: 1, patience: 3 }, { who: 'HOSPITAL', fee: 150, keep: 1, patience: 3 } ] }, // our choice; bests 3, 4, 4, 4
    MIXED:     { title: 'A mixed book', them: 'the mixed book', say: 'Four customers, four rules, and one order that no rocket can make pay.',
      orders: [ { who: 'HOSPITAL', fee: 100, keep: 1, patience: 2 }, { who: 'FLORIST', fee: 200, keep: 10, patience: 1 }, { who: 'FLORIST', fee: 150, keep: 5, patience: 1 }, { who: 'FLORIST', fee: 150, keep: 2, patience: 1 } ] }, // our choice; bests 3, 4, 5, refuse
  },
  // The long haul (encore): a museum a century away pays for freshness only.
  haul: { orders: [{ name: 'LOCARNO', who: 'MUSEUM', d: 100, fee: 800, keep: 10, patience: 1 }] }, // our choice; best 6
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

// One rocket to one order with n boosters. n = 0 refuses the order: nothing earned, nothing spent.
function fly(order, n) {
  const cust = CONFIG.customers[order.who], tLight = order.d / CONFIG.c;
  if (n <= 0) return { refused: true, n: 0, tLight, revenue: 0, cost: 0, profit: 0, fresh: 0, prompt: 0 };
  const v = speedAfter(n), rate = clockRate(v), tHome = order.d / v, tCargo = tHome * rate;
  const fresh = Math.max(0, 1 - tCargo / order.keep);                 // the flowers' clock, against what the customer will tolerate
  const prompt = Math.max(0, 1 - (tHome - tLight) / order.patience);  // the wait beyond light's own arrival
  const revenue = order.fee * (cust.wf * fresh + (1 - cust.wf) * prompt);
  const cost = fuelCost(n);
  return { refused: false, n, v, rate, tHome, tCargo, tLight, fresh, prompt, revenue, cost, profit: revenue - cost };
}
// The booster count that earns the most on an order (0 if nothing earns a franc).
function best(order) {
  let b = fly(order, 0);
  for (let n = 1; n <= CONFIG.maxBoost; n++) { const f = fly(order, n); if (f.profit > b.profit + 1e-9) b = f; }
  return b;
}
// The order book for an employer: the shared stars with that employer's customers on them.
function bookFor(key) {
  const e = CONFIG.employers[key];
  return { key, title: e.title, them: e.them, say: e.say, orders: CONFIG.stars.map((s, i) => Object.assign({ name: s.name, d: s.d }, e.orders[i])) };
}
// A whole order book: every order flown with its allocated boosters; the profit, and the best profit, summed.
function runBook(book, alloc) {
  if (alloc.length !== book.orders.length || alloc.some(n => n < 0 || n > CONFIG.maxBoost || n !== Math.floor(n))) return { error: 'bad allocation' };
  const flights = book.orders.map((o, i) => fly(o, alloc[i]));
  const bests = book.orders.map(best);
  const profit = flights.reduce((s, f) => s + f.profit, 0), bestProfit = bests.reduce((s, f) => s + f.profit, 0);
  return { flights, bests, profit, bestProfit };
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
  if (x >= 0.97) return 'all of it'; if (x >= 0.8) return 'most of it'; if (x >= 0.55) return 'over half'; if (x >= 0.3) return 'a third'; if (x > 0.05) return 'a little'; return 'nothing';
}

const MECH = { CONFIG, compose, speedAfter, clockRate, energy, fuelCost, fly, best, bookFor, runBook, fmtYears, fmtLimit, fmtSpeed, fmtRate, fmtFrancs, fmtShare };
if (typeof module !== 'undefined') module.exports = MECH;
