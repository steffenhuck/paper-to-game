// The Light Post — loop on placeholder output (build step 2). Plays a first-timer's session against mechanism.js and
// prints, after each action, what changed and where the player stands. Run: node loop.js > loop-log.txt
const M = require('./mechanism.js'); const { CONFIG, fly, best, runBook, fmtYears, fmtLimit, fmtSpeed, fmtRate, fmtFrancs, fmtShare } = M;
const WHO = { FLORIST: 'florist', HOSPITAL: 'hospital', GALLERY: 'gallery', MUSEUM: 'museum' };
const show = (o, n) => { const f = fly(o, n); if (f.refused) { const b = best(o); return `  ${o.name}: refused (${b.n ? 'but ' + b.n + ' boosters would have made ' + fmtFrancs(b.profit) : 'right: nothing pays here'})`; }
  return `  ${o.name} with ${n}: ${fmtSpeed(f.v)}; light lands at ${fmtYears(f.tLight)}, rocket at ${fmtYears(f.tHome)}; flowers aged ${fmtYears(f.tCargo)} (keep ${fmtLimit(o.keep)}); the ${WHO[o.who]} paid ${fmtFrancs(f.revenue)} of ${o.fee} (freshness worth ${fmtShare(f.fresh)}, speed worth ${fmtShare(f.prompt)}); fuel ${fmtFrancs(f.cost)} → PROFIT ${fmtFrancs(f.profit)}`; };
console.log('AIM: Deliver flowers to the stars at a profit.\n\nTEST RANGE: ' + CONFIG.range.name + ', ' + CONFIG.range.d + ' light-years; the florist pays up to ' + CONFIG.range.fee);
for (const n of [2, 3, 5, 4, 6]) { console.log(`> slide to ${n}, launch`); console.log(show(CONFIG.range, n)); }
for (const k of ['A', 'B']) {
  const b = CONFIG.books[k]; console.log(`\nORDER BOOK ${k}`);
  b.orders.forEach(o => console.log(`  card ${o.name}: ${o.d} light-years; the ${WHO[o.who]} pays up to ${o.fee}, keep ${fmtLimit(o.keep)}, patience ${fmtLimit(o.patience)}; best = ${best(o).n}`));
  const plans = k === 'A' ? [[3, 3, 3, 3], [3, 4, 0, 5]] : [[3, 3, 3, 3], [4, 3, 0, 6]];
  for (const p of plans) { const r = runBook(b, p); console.log(`> LAUNCH ALL ${p.join('-')}`); r.flights.forEach((f, i) => console.log(show(b.orders[i], p[i]))); console.log(`  profit ${fmtFrancs(r.profit)} of a possible ${fmtFrancs(r.bestProfit)}`); }
}
const h = CONFIG.haul.orders[0]; console.log('\nTHE LONG HAUL'); for (const n of [5, 6]) console.log(show(h, n));
