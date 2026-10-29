// The Light Post — the mechanism. The single source of truth: build.py inlines this file verbatim into the-light-post.html,
// and calibration.js runs against this same file. Plain functions, no DOM. Runs unchanged in Node and in the browser.
//
// Paper: A. Einstein, "On the Electrodynamics of Moving Bodies" (1905), Annalen der Physik 17:891, in the 1923
// Perrett–Jeffery translation as edited by J. Walker (Fourmilab). Page numbers are that 26-page PDF's.
// Kind: ported. The game computes the paper's own equations (§4, §5) exactly. Orders, budgets and the booster
// size are game choices. See memo.md §16.

const CONFIG = {
  // --- The paper's kinematics ----------------------------------------------------------------------------
  c: 1,               // §2 p. 3, postulate 2: light always moves at c. Units: light-years and years, so c = 1 (our choice of units)
  // Composition of parallel velocities, §5 p. 12:  V = (v + w) / (1 + v w / c^2)
  // Moving clock, §4 p. 10:                       tau = t * sqrt(1 - v^2 / c^2)
  // Arrival on the far station's clock: t = d / v, the station's clock synchronised with home by §1's light rule (p. 3)

  // --- The game's choices ----------------------------------------------------------------------------------
  w: 0.5,             // our choice: every booster adds half light speed in the rocket's own frame, so "two halves" is the natural wrong guess
  maxBoost: 6,        // our choice: six boosters reach 99.7% of c, enough for the long haul
  scoreRefusal: true, // our choice: refusing an order that even light could not deliver in time scores as a delivery

  // Test range (one order, unlimited tries). Needs 4 boosters: two are late and wilted, three still wilted.
  range: { name: 'NEW BERN', d: 4, deadline: 4.5, fresh: 1 },      // our choice

  // Order books. Each needs exactly its budget if no booster is wasted; one order in each is impossible.
  books: {
    A: { budget: 11, orders: [                                       // our choice; minimum boosters 2 + 4 + 0 + 5 = 11
      { name: 'THUN',  d: 1,  deadline: 2.5, fresh: 1 },   // needs 2
      { name: 'OLTEN', d: 10, deadline: 11,  fresh: 2.5 }, // needs 4
      { name: 'BRIG',  d: 6,  deadline: 5,   fresh: 3 },   // impossible: light takes 6 years
      { name: 'SION',  d: 20, deadline: 21,  fresh: 3 },   // needs 5
    ] },
    B: { budget: 11, orders: [                                       // our choice; minimum boosters 3 + 0 + 2 + 6 = 11
      { name: 'AARAU', d: 2,  deadline: 3,   fresh: 1 },   // needs 3
      { name: 'CHUR',  d: 3,  deadline: 3,   fresh: 2 },   // impossible: light arrives exactly on the deadline, a rocket never can
      { name: 'BIEL',  d: 8,  deadline: 12,  fresh: 7 },   // needs 2
      { name: 'ZUG',   d: 50, deadline: 52,  fresh: 5 },   // needs 6
    ] },
  },
  // The long haul (encore): one order, crate of six.
  haul: { budget: 6, orders: [{ name: 'LOCARNO', d: 100, deadline: 101, fresh: 10 }] }, // our choice; needs 6
};

// Speed after n boosters, each a §5 composition of w with the current speed. The paper: such parallel
// transformations "necessarily form a group" (p. 12), so each booster is the same step in the rocket's own frame.
function compose(v, w, c = CONFIG.c) { return (v + w) / (1 + v * w / (c * c)); }
function speedAfter(n, w = CONFIG.w) { let v = 0; for (let i = 0; i < n; i++) v = compose(v, w); return v; }
// The factor by which a moving clock runs slow, §4 p. 10: tau / t = sqrt(1 - v^2/c^2)
function clockRate(v, c = CONFIG.c) { return Math.sqrt(1 - (v * v) / (c * c)); }

const EPS = 1e-9;
// One rocket: order {d, deadline, fresh}, n boosters. Zero boosters = the order is refused.
function fly(order, n, w = CONFIG.w) {
  const tLight = order.d / CONFIG.c;
  const possible = tLight < order.deadline - EPS; // a rocket is always slower than light, so this is the hard limit
  if (n <= 0) return { refused: true, n: 0, possible, tLight, ok: !possible && CONFIG.scoreRefusal, outcome: possible ? 'REFUSED' : 'REFUSED_RIGHT' };
  const v = speedAfter(n, w), rate = clockRate(v);
  const tHome = order.d / v, tCargo = tHome * rate;
  const onTime = tHome <= order.deadline + EPS, fresh = tCargo <= order.fresh + EPS;
  const outcome = onTime && fresh ? 'DELIVERED' : !onTime && !fresh ? 'LATE_WILTED' : !onTime ? 'LATE' : 'WILTED';
  return { refused: false, n, v, rate, tLight, tHome, tCargo, onTime, fresh, possible, ok: onTime && fresh, outcome };
}
// Fewest boosters that deliver an order (0 if it should be refused, null if nothing up to maxBoost works).
function minBoosts(order, w = CONFIG.w, max = CONFIG.maxBoost) {
  if (!fly(order, 0, w).possible) return 0;
  for (let n = 1; n <= max; n++) if (fly(order, n, w).ok) return n;
  return null;
}
// A whole book: alloc is an array of booster counts. Over-budget allocations are rejected, not clipped.
function runBook(book, alloc) {
  const used = alloc.reduce((a, b) => a + b, 0);
  if (used > book.budget || alloc.length !== book.orders.length || alloc.some(n => n < 0 || n > CONFIG.maxBoost || n !== Math.floor(n)))
    return { error: 'bad allocation' };
  const flights = book.orders.map((o, i) => fly(o, alloc[i]));
  return { flights, used, left: book.budget - used, score: flights.filter(f => f.ok).length, of: flights.length };
}

// ---- Words for the screen (here, so that what is shown always agrees with what was judged) ----------------
// A measured time: the two largest units, the larger one never rounded up, so a late arrival never reads as on time.
function fmtYears(y) {
  let Y = Math.floor(y + 1e-9), remD = (y - Y) * 365.25, M = Math.floor(remD / 30.44 + 1e-9), D = Math.round(remD - M * 30.44);
  if (D >= 30) { M++; D = 0; }
  if (M >= 12) { Y++; M = 0; }
  const u = (k, one) => k + ' ' + one + (k === 1 ? '' : 's');
  const parts = [];
  if (Y) parts.push(u(Y, 'year'));
  if (M) parts.push(u(M, 'month'));
  if (D && parts.length < 2 && !(Y && M)) parts.push(u(D, 'day'));
  return parts.slice(0, 2).join(' ') || 'no time';
}
// A requirement (deadline, freshness): whole and half years
function fmtLimit(y) { const w = Math.floor(y), h = y - w; return (w || '') + (h ? '½' : '') + (y === 1 ? ' year' : ' years'); }
function fmtSpeed(v) {
  const p = v * 100;
  if (p >= 99.5) return 'nearly all of light speed';
  return Math.round(p) + '% of light speed';
}
// How fast the flowers age compared with home: rate 1 = the same, 0.6 = 'three-fifths as fast'
function fmtRate(rate) {
  if (rate > 0.995) return 'as fast as at home';
  const k = 1 / rate;
  const named = [[0.875, 'seven-eighths'], [0.8, 'four-fifths'], [0.75, 'three-quarters'], [0.6, 'three-fifths'], [0.5, 'half']];
  for (const [r, wd] of named) if (Math.abs(rate - r) < 0.015) return wd + ' as fast';
  const o = ordinal(Math.round(k));
  return (/^[aeiou]/.test(o) ? 'an ' : 'a ') + o + ' as fast';
}
function ordinal(k) {
  const m = { 2: 'half', 3: 'third', 4: 'quarter', 5: 'fifth', 6: 'sixth', 7: 'seventh', 8: 'eighth', 9: 'ninth', 10: 'tenth',
    11: 'eleventh', 12: 'twelfth', 13: 'thirteenth', 14: 'fourteenth', 15: 'fifteenth' };
  return m[k] || k + 'th';
}

const MECH = { CONFIG, compose, speedAfter, clockRate, fly, minBoosts, runBook, fmtYears, fmtLimit, fmtSpeed, fmtRate };
if (typeof module !== 'undefined') module.exports = MECH;
