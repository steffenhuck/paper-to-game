// Loop test (build step 2): plays the game's loop headlessly against mechanism.js and prints, after each action,
// what changed and where the player stands. Run: node loop.js
const M = require('./mechanism.js');
const C = M.CONFIG;
console.log('BET: which kind had more women?  player picks: major');
const o = M.openerAnswer();
console.log(`  card turns: ${o.answer} in every country — ${o.rows.map(r => `${r.country} ${r.major}% vs ${r.regional}%`).join(', ')}`);
console.log('  player stands: wrong, and has learned where women entered first.\n');

// A plausible stranger: believes "the more the better" at first, then adopts the dip-and-recovery theory.
const plans = {
  relationships: [5.3, 5.4, 5.6, 5.7, 5.8],   // gentle rise
  security:      [5.4, 5.0, 4.6, 4.4, 4.9],   // dip, bottom in band 4
  stability:     [6.5, 6.1, 5.7, 5.4, 6.0],   // dip, bottom in band 4
  involvement:   [5.9, 5.4, 4.8, 4.6, 5.2],   // dip — but this one keeps falling
};
const results = [];
for (const id of C.rounds) {
  const m = C.measures[id];
  console.log(`ROUND ${results.length + 1}: ${m.name}. Given: band 1 = ${m.values[0].toFixed(1)}. Player draws ${plans[id].slice(1).map(v => v.toFixed(1)).join(' ')}`);
  const r = M.scoreDrawing(id, plans[id]); results.push(r);
  console.log(`  study's line: ${m.values.map(v => v.toFixed(2)).join(' ')}`);
  console.log(`  verdict: ${r.verdict}`);
  console.log(`  player stands: ${results.filter(x => x.shapeRight).length} of ${results.length} shapes right so far.\n`);
}
console.log('END:', M.sessionVerdict(results).line);
console.log('\nSECOND SET');
for (const id of C.replayRounds) {
  const m = C.measures[id];
  const guess = [m.values[0], m.values[0] - 0.5, m.values[0] - 0.9, m.values[0] - 1.0, m.values[0] - 0.5];
  const r = M.scoreDrawing(id, guess); results.push(r);
  console.log(`  ${m.name}: ${r.verdict}`);
}
console.log('END:', M.sessionVerdict(results).line);
