// The Light Post — loop on placeholder output (build step 2). Plays a first-timer's session against mechanism.js and
// prints, after each action, what changed and where the player stands. Run: node loop.js > loop-log.txt
const M = require('./mechanism.js'); const { CONFIG, fly, runBook, fmtYears, fmtLimit, fmtSpeed, fmtRate, speedAfter, clockRate } = M;
const show = (o, n) => { const f = fly(o, n); if (f.refused) return `  ${o.name}: refused (${f.possible ? 'it was possible' : 'right: light itself would be late'})`;
  return `  ${o.name} with ${n}: rocket at ${fmtSpeed(f.v)}; light lands at ${fmtYears(f.tLight)}; rocket lands at ${fmtYears(f.tHome)} (deadline ${fmtLimit(o.deadline)}) ${f.onTime ? 'ON TIME' : 'LATE'}; flowers aged ${fmtYears(f.tCargo)} (keep ${fmtLimit(o.fresh)}) ${f.fresh ? 'FRESH' : 'WILTED'} → ${f.outcome}`; };
console.log('AIM: Deliver the flowers on time and still fresh.\n\nTEST RANGE: ' + CONFIG.range.name + ', ' + CONFIG.range.d + ' light-years; light takes ' + fmtLimit(CONFIG.range.d));
for (const n of [2, 3, 5, 4]) { console.log(`> launch with ${n} boosters`); console.log(show(CONFIG.range, n)); console.log(`  log row: ${n} boosters = ${fmtSpeed(speedAfter(n))}, flowers age ${fmtRate(clockRate(speedAfter(n)))}`); }
for (const k of ['A', 'B']) {
  const b = CONFIG.books[k]; console.log(`\nORDER BOOK ${k}: ${b.budget} boosters in the crate`);
  b.orders.forEach(o => console.log(`  card ${o.name}: ${o.d} light-years (light takes ${fmtLimit(o.d)}); arrive within ${fmtLimit(o.deadline)}; flowers keep ${fmtLimit(o.fresh)}`));
  const plans = k === 'A' ? [[2, 3, 2, 4], [2, 4, 0, 5]] : [[2, 3, 2, 4], [3, 0, 2, 6]];
  for (const p of plans) { const r = runBook(b, p); console.log(`> LAUNCH ALL ${p.join('-')} (${r.left} left over)`); r.flights.forEach((f, i) => console.log(show(b.orders[i], p[i]))); console.log(`  score ${r.score} of ${r.of}`); }
}
const h = CONFIG.haul.orders[0]; console.log('\nTHE LONG HAUL'); for (const n of [5, 6]) console.log(show(h, n));
