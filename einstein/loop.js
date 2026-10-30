// The Light Post — loop on placeholder output (build step 2). Plays a first-timer's game against mechanism.js and prints, after each
// action, what changed and where the player stands. Run: node loop.js > loop-log.txt
const M = require('./mechanism.js'); const { CONFIG, fly, best, drawGame, fate, fmtYears, fmtSpeed, fmtFrancs, fmtShare } = M;
const show = (o, n, r) => { const f = fly(o, n, r); if (f.refused) return `  ${o.name}: refused. Light would have arrived after ${fmtYears(f.tLight)}.`;
  return `  ${o.name} with ${n}: ${fmtSpeed(f.v)}; station clock ${fmtYears(f.tHome)} (light ${fmtYears(f.tLight)}), rocket clock ${fmtYears(f.tCargo)} (keep ${fmtYears(o.keep)}) ${f.alive ? 'ALIVE' : 'DEAD'}; fee ${fmtFrancs(f.fee)} worth ${fmtFrancs(f.today)} today (${fmtShare(f.disc)}); fuel ${fmtFrancs(f.cost)} → ${fmtFrancs(f.profit)} today`; };
console.log('AIM: Sell flowers to the stars. Die rich.');
for (const [k, m] of Object.entries(CONFIG.merchants)) {
  const os = drawGame(7); console.log(`\nGAME NO. 7 as ${m.title} (rate ${m.rate})`);
  const naive = os.map((o, i) => i === 0 ? 2 : o.d >= 30 ? 0 : 4); let w = 0, bw = 0;
  os.forEach((o, i) => { const f = fly(o, naive[i], m.rate), b = best(o, m.rate); w += f.profit; bw += b.profit; console.log(`> round ${i + 1}: ${o.name}, ${o.d} ly, fee ${o.fee}, keep ${fmtYears(o.keep)}; set ${naive[i]}`); console.log(show(o, naive[i], m.rate) + `   [wealth ${Math.round(w)}; best here ${b.n || 'refuse'}]`); });
  console.log(`  YOU DIE ${fate(w, bw).toUpperCase()}: ${fmtFrancs(w)} of a possible ${fmtFrancs(bw)}`);
}
