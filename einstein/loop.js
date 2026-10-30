// The Light Post — loop on placeholder output (build step 2). Plays a first-timer's session against mechanism.js and
// prints, after each action, what changed and where the player stands. Run: node loop.js > loop-log.txt
const M = require('./mechanism.js'); const { CONFIG, fly, best, runBook, fmtYears, fmtLimit, fmtSpeed, fmtFrancs, fmtShare } = M;
const show = (o, n, r) => { const f = fly(o, n, r); if (f.refused) { const b = best(o, r); return `  ${o.name}: refused (${b.n ? 'but ' + b.n + ' boosters would have made ' + fmtFrancs(b.profit) + ' today' : 'right: nothing pays here'})`; }
  return `  ${o.name} with ${n}: ${fmtSpeed(f.v)}; station clock ${fmtYears(f.tHome)} (light ${fmtYears(f.tLight)}), rocket clock ${fmtYears(f.tCargo)} (keep ${fmtLimit(o.keep)}) ${f.alive ? 'ALIVE' : 'DEAD'}; fee ${fmtFrancs(f.fee)} worth ${fmtFrancs(f.today)} today (${fmtShare(f.disc)}); fuel ${fmtFrancs(f.cost)} → PROFIT TODAY ${fmtFrancs(f.profit)}`; };
console.log('AIM: Sell flowers to the stars. Make money today.\n\nTEST RANGE (ordinary merchant, 4%): ' + CONFIG.range.name + ', ' + CONFIG.range.d + ' light-years; fee ' + CONFIG.range.fee + ', keep ' + fmtLimit(CONFIG.range.keep));
for (const n of [2, 3, 4, 5, 6]) { console.log(`> slide to ${n}, launch`); console.log(show(CONFIG.range, n, 0.04)); }
for (const [k, m] of Object.entries(CONFIG.merchants)) {
  console.log(`\nORDER BOOK as ${m.title} (rate ${m.rate})`);
  CONFIG.stars.forEach(o => console.log(`  card ${o.name}: ${o.d} light-years; fee ${o.fee}, keep ${fmtLimit(o.keep)}; best = ${best(o, m.rate).n || 'refuse'}`));
  for (const p of [[3, 3, 3, 3], CONFIG.stars.map(o => best(o, m.rate).n)]) { const r = runBook(CONFIG.stars, p, m.rate); console.log(`> LAUNCH ALL ${p.join('-')}`); r.flights.forEach((f, i) => console.log(show(CONFIG.stars[i], p[i], m.rate))); console.log(`  profit today ${fmtFrancs(r.profit)} of a possible ${fmtFrancs(r.bestProfit)}`); }
}
console.log('\nTHE LONG HAUL'); for (const [k, m] of Object.entries(CONFIG.merchants)) console.log(`  as ${m.title}:` + show(CONFIG.haul, 6, m.rate));
