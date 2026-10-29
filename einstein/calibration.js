// The Light Post — calibration check (build step 1). Runs against mechanism.js, the only copy of the mechanism.
// Checks the game's arithmetic against the paper's own equations and limiting cases, then the designer's choices.
// Run: node calibration.js > calibration-result.txt
const M = require('./mechanism.js');
const { CONFIG, compose, speedAfter, clockRate, fly, minBoosts, runBook, fmtYears } = M;
let pass = 0, fail = 0;
const ok = (cond, msg) => { console.log((cond ? 'PASS ' : 'FAIL ') + msg); cond ? pass++ : fail++; };
const near = (a, b, tol) => Math.abs(a - b) <= tol;
const rnd = (seed => () => (seed = (seed * 16807) % 2147483647) / 2147483647);

console.log('--- 1. §5 composition of velocities (p. 12) ---');
ok(near(compose(0.5, 0.5), 0.8, 1e-12), 'half on half = 4/5 c: ' + compose(0.5, 0.5));
ok(near(compose(1, 0.3), 1, 1e-12) && near(compose(0.7, 1), 1, 1e-12), '"the velocity of light c cannot be altered by composition with a velocity less than that of light"');
{ const r = rnd(7); let worst = 0, sym = 0;
  for (let i = 0; i < 10000; i++) { const v = r() * 0.999, w = r() * 0.999; const V = compose(v, w); worst = Math.max(worst, V); sym = Math.max(sym, Math.abs(V - compose(w, v)));
    // the paper's κ, λ form: v = c − κ, w = c − λ  →  V = c (2c − κ − λ)/(2c − κ − λ + κλ/c)
    const k = 1 - v, l = 1 - w; if (!near(V, (2 - k - l) / (2 - k - l + k * l), 1e-12)) { worst = 9; break; } }
  ok(worst < 1, 'two sub-light velocities always compose below c, and match the paper\'s κ, λ form (10,000 random pairs; max ' + worst.toFixed(6) + ')');
  ok(sym < 1e-12, 'v and w "enter ... in a symmetrical manner"'); }
{ // group property: n boosters of w equal one boost of speedAfter(n) — composing in any grouping gives the same speed
  let dev = 0; for (let a = 0; a <= 6; a++) for (let b = 0; a + b <= 6; b++) dev = Math.max(dev, Math.abs(compose(speedAfter(a), speedAfter(b)) - speedAfter(a + b)));
  ok(dev < 1e-12, 'the boosts "form a group": a then b boosters = a+b boosters (max deviation ' + dev.toExponential(1) + ')');
  // rapidity check: n boosts of w = tanh(n artanh w)
  let d2 = 0; for (let n = 0; n <= 6; n++) d2 = Math.max(d2, Math.abs(speedAfter(n) - Math.tanh(n * Math.atanh(CONFIG.w)))); ok(d2 < 1e-12, 'speedAfter(n) = tanh(n artanh w), independent closed form'); }
const table = []; for (let n = 0; n <= 6; n++) { const v = speedAfter(n); table.push(v); }
console.log('    boosters → speed:', table.map((v, n) => n + ':' + v.toFixed(5)).join('  '));
ok(table.every((v, i) => i === 0 || (v > table[i - 1] && v < 1)), 'each booster adds speed, none reaches c');
ok(table.slice(2).every((v, i) => v - table[i + 1] < table[i + 1] - table[i]), 'each booster adds less speed than the one before');

console.log('--- 2. §4 the moving clock (p. 10) ---');
{ let dev = 0; for (const v of [0.1, 0.5, 0.8, 0.9286, 0.99]) { const t = 7.3, x = v * t, b = 1 / Math.sqrt(1 - v * v);
    const tauLorentz = b * (t - v * x); dev = Math.max(dev, Math.abs(tauLorentz - t * clockRate(v))); }
  ok(dev < 1e-12, 'τ = t√(1−v²/c²) agrees with the §3 transformation τ = β(t − vx/c²) at x = vt (max deviation ' + dev.toExponential(1) + ')'); }
{ const v = 0.01, t = 1000; const lag = t - t * clockRate(v); ok(near(lag, 0.5 * t * v * v, 1e-6 * t), 'slow speeds: lag ≈ ½ t v²/c² ("neglecting magnitudes of fourth and higher order"): ' + lag.toFixed(6) + ' vs ' + (0.5 * t * v * v).toFixed(6)); }
{ const g = table.map(v => 1 / clockRate(v)); console.log('    boosters → clock slowing factor:', g.map((x, n) => n + ':' + x.toFixed(3)).join('  '));
  ok(g.slice(2).every((x, i) => x - g[i + 1] > g[i + 1] - g[i]), 'each booster slows the cargo clock MORE than the one before (the discovery: speed gains shrink, clock gains grow)'); }

console.log('--- 3. fly(): arrivals and the light limit ---');
{ const f = fly({ d: 4, deadline: 99, fresh: 99 }, 2); ok(near(f.tHome, 5, 1e-12) && near(f.tCargo, 3, 1e-12), 'two boosters to 4 ly: 5 years at home, 3 on the flowers (exact)'); }
{ const r = rnd(11); let beaten = 0; for (let i = 0; i < 5000; i++) { const d = 0.1 + r() * 200, n = 1 + Math.floor(r() * 6); if (fly({ d, deadline: 1e9, fresh: 1e9 }, n).tHome <= d) beaten++; }
  ok(beaten === 0, 'no rocket ever arrives as early as light (5,000 random flights)'); }
for (const k of ['A', 'B']) for (const o of CONFIG.books[k].orders) if (o.d >= o.deadline) {
  const all = [1, 2, 3, 4, 5, 6].map(n => fly(o, n)); ok(all.every(f => !f.onTime) && fly(o, 0).ok, `${o.name}: impossible for every booster count; refusing it scores`); }
{ // the traveller is not bound by c: enough boosts deliver fresh flowers over any distance (with more boosters allowed)
  const far = { d: 1000, deadline: 1e9, fresh: 1 }; let n = 1; while (fly(far, n).tCargo > 1 && n < 40) n++; ok(n < 40, `1,000 ly with flowers fresh for 1 year: possible with ${n} boosters (cargo clock ${fly(far, n).tCargo.toFixed(3)} y, home ${fly(far, n).tHome.toFixed(1)} y)`); }

console.log('--- 4. display words agree with judgement ---');
{ let bad = 0; const toY = s => { let y = 0; const m = s.match(/(\d+) year/); if (m) y += +m[1]; const mo = s.match(/(\d+) month/); if (mo) y += mo[1] / 12; const dd = s.match(/(\d+) day/); if (dd) y += dd[1] / 365.25; return y; };
  const r = rnd(5); for (let i = 0; i < 20000; i++) { const y = r() * 120; const s = fmtYears(y); const e = y - toY(s); if (e < -1 / 365 || e > 1 / 12 + 1e-6 || /\./.test(s) || /30 day|12 month/.test(s)) { bad++; if (bad < 4) console.log('    ', y, s); } }
  ok(bad === 0, 'fmtYears never shows more than the truth (beyond a rounded day) and is within a month below it, no decimals, no "30 days"/"12 months" (20,000 values)'); }
{ let bad = 0; const toY = s => { let y = 0; const m = s.match(/(\d+) year/); if (m) y += +m[1]; const mo = s.match(/(\d+) month/); if (mo) y += mo[1] / 12; const dd = s.match(/(\d+) day/); if (dd) y += dd[1] / 365.25; return y; };
  for (const b of [CONFIG.range].map(o => ({ orders: [o] })).concat([CONFIG.books.A, CONFIG.books.B, CONFIG.haul])) for (const o of b.orders) for (let n = 1; n <= 6; n++) {
    const f = fly(o, n); if ((toY(fmtYears(f.tHome)) <= o.deadline) !== f.onTime || (toY(fmtYears(f.tCargo)) <= o.fresh) !== f.fresh) { bad++; console.log('    mismatch', o.name, n); } }
  ok(bad === 0, 'for every order and booster count, the shown times sit on the same side of the limit as the judged ones'); }

console.log('--- 5. balance (designer\'s choices) ---');
const range = CONFIG.range; console.log('    test range needs', minBoosts(range), '— two boosters:', fly(range, 2).outcome);
ok(minBoosts(range) === 4 && fly(range, 2).outcome === 'LATE_WILTED', 'test range: the "two halves" launch is late and wilted; four boosters deliver');
const allAllocs = (k, cap) => { const out = []; const rec = (a) => { if (a.length === k) { out.push(a.slice()); return; } for (let n = 0; n <= CONFIG.maxBoost; n++) { a.push(n); if (a.reduce((x, y) => x + y, 0) <= cap) rec(a); a.pop(); } }; rec([]); return out; };
for (const k of ['A', 'B']) {
  const book = CONFIG.books[k], mins = book.orders.map(o => minBoosts(o));
  ok(mins.reduce((a, b) => a + b, 0) === book.budget && mins.every(m => m !== null), `book ${k}: minimum boosters ${mins.join('+')} = budget ${book.budget}`);
  const all = allAllocs(4, book.budget), scores = all.map(a => runBook(book, a).score);
  const perfect = all.filter((a, i) => scores[i] === 4);
  console.log(`    book ${k}: ${all.length} legal allocations; perfect: ${perfect.map(a => a.join('-')).join(', ')}; mean score ${(scores.reduce((a, b) => a + b, 0) / all.length).toFixed(2)}`);
  ok(perfect.length >= 1 && perfect.length <= 3, `book ${k}: few perfect plans (${perfect.length})`);
  // Newtonian intuition: speeds add (0.5 n), clocks agree. Boosters the player would think each order needs.
  const newton = book.orders.map(o => { for (let n = 0; n <= 6; n++) { if (n === 0) continue; const v = 0.5 * n, t = o.d / v; if (t <= o.deadline && t <= o.fresh) return n; } return 0; });
  const nb = newton.slice(); let s = nb.reduce((a, b) => a + b, 0); for (let i = nb.length - 1; s > book.budget; i = (i + nb.length - 1) % nb.length) if (nb[i] > 0) { nb[i]--; s--; }
  const rn = runBook(book, nb); console.log(`    book ${k}: Newtonian plan ${newton.join('-')} → playable ${nb.join('-')} scores ${rn.score}/4 (${rn.flights.map(f => f.outcome).join(', ')})`);
  ok(rn.score <= 2, `book ${k}: a player who believes speeds add scores at most 2 of 4`);
  // no single-order "all eggs" plan wins: spending everything on the farthest order
  const greedy = book.orders.map(() => 0); greedy[book.orders.reduce((bi, o, i, a) => o.d > a[bi].d ? i : bi, 0)] = Math.min(6, book.budget); ok(runBook(book, greedy).score <= 2, `book ${k}: all boosters on the farthest order scores ≤ 2`);
}
ok(minBoosts(CONFIG.haul.orders[0]) === 6, 'long haul needs all six boosters');

console.log('--- 6. robustness: the discoveries do not depend on the booster size w ---');
for (const w of [0.3, 0.4, 0.6, 0.7]) {
  const vs = [], gs = []; for (let n = 0; n <= 12; n++) { const v = speedAfter(n, w); vs.push(v); gs.push(1 / clockRate(v)); }
  const sub = vs.every(v => v < 1), shrink = vs.slice(2).every((v, i) => v - vs[i + 1] < vs[i + 1] - vs[i]), grow = gs.slice(2).every((g, i) => g - gs[i + 1] > gs[i + 1] - gs[i]);
  const twoBelowNewton = speedAfter(2, w) < Math.min(1, 2 * w);
  ok(sub && shrink && grow && twoBelowNewton, `w = ${w}c: never reaches c; speed gains shrink; clock-slowing gains grow; two boosters < 2w`);
}
console.log(`\n${fail ? 'FAILURES: ' + fail : 'ALL PASS'}, ${pass + fail} checks.`);
process.exitCode = fail ? 1 : 0;
