// Headless play loop (build step 2), iteration 2: a stranger's session in tokens, printed after every action.
// Run: node loop.js > loop-log.txt
const M = require('./mechanism.js'); const C = M.CONFIG;
const f = x => x.toFixed(1);
const bars = e => M.CELLS.map(k => `${k} ${f(e.cells[k].tokens)}`).join(' | ') + `  ||  works in Big Five ${f(e.big.tokens)} vs elsewhere ${f(e.other.tokens)}${e.level ? '  LEVEL' : ''}`;
console.log('ROUND 1: seat the 15 judges you think are fair (no bars until the 15th)');
let s = M.newRound1();
for (const code of ['DE/DE', 'DE/DE', 'IT/IT', 'IT/IT', 'UK/UK', 'UK/UK', 'FR/FR', 'ES/ES', 'US/US', 'NL/NL', 'BE/BE', 'SE/SE', 'DE/CH', 'IT/UK', 'PL/PL']) {
  const j = s.pool.find(x => x.p + '/' + x.w === code && s.seated.indexOf(x.id) < 0);
  s = M.toggleSeat(s, j.id); console.log(`  seat ${code} -> ${s.seated.length}/15${s.revealed ? '  BARS REVEALED' : ''}`);
}
const e1 = M.evaluate(M.panelOf(s)); console.log('  ' + bars(e1)); console.log(`  ratio ${f(e1.ratio)}`);
console.log('\nROUND 2: level the tilted panel, four swaps');
let r = M.newRound2(); console.log('  start  ' + bars(M.evaluate(r.table)));
const sw = (o, i) => { r = M.swap(r, r.table.findIndex(j => j.p + '/' + j.w === o), r.bench.findIndex(j => j.p + '/' + j.w === i)); console.log(`  ${o} -> ${i}: ${bars(M.evaluate(r.table))}${r.done ? '  (round over)' : ''}`); };
sw('SE/SE', 'PT/PT'); sw('BE/BE', 'DK/DK');
console.log('  (swapping smaller-country judges for each other barely moves the gap) -> RESET');
r = M.newRound2(); sw('DE/DE', 'IL/IL'); sw('DE/DE', 'FI/FI'); sw('IT/IT', 'PT/PT');
if (!r.done) sw('IT/IT', 'PL/PL');
console.log(`  result: ${M.evaluate(r.table).level ? 'LEVEL' : 'NOT YET'} in ${r.swapsUsed} swaps`);
