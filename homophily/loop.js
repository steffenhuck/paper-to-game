// Headless play loop (build step 2): a stranger's session, printed after every action.
// Run: node loop.js > loop-log.txt
const M = require('./mechanism.js'); const C = M.CONFIG;
const f = x => x.toFixed(1);
const jars = e => `jars: BIG FIVE ${f(e.big.stars)} ★  |  EVERYONE ELSE ${f(e.other.stars)} ★  (gap ${f(e.gap)}${e.level ? ', LEVEL' : ''})`;
const who = j => { const v = M.favours(j); return `${j.p}/${j.w}: full ★ for ${f(v.both)}% of applicants, ½ for ${f(v.citz)}%, ⅓ for ${f(v.country)}%`; };
console.log('ROUND 1: seat the panel you think is fair (jars covered)');
let s = M.newRound1();
// a first-timer mirrors who applies: big countries first, then a spread of small ones
const order = ['DE/DE', 'DE/DE', 'UK/UK', 'UK/UK', 'FR/FR', 'IT/IT', 'ES/ES', 'IT/UK', 'NL/NL', 'PL/PL', 'SE/SE', 'PT/PT', 'GR/GR', 'IL/IL', 'DE/CH'];
for (const code of order) {
  const j = s.pool.find(x => x.p + '/' + x.w === code && s.seated.indexOf(x.id) < 0);
  s = M.toggleSeat(s, j.id);
  console.log(`  seat ${who(j)}  -> ${s.seated.length}/15${s.revealed ? '  COVERS OFF' : ''}`);
}
const e1 = M.evaluate(M.panelOf(s)), t2 = M.table2Stars();
console.log('  ' + jars(e1));
console.log(`  "Your panel gives big-five applicants ${f(e1.ratio)}x the home advantage of everyone else. Real ERC panels: about ${f(t2.ratio)}x."`);
console.log('  tapping after reveal does nothing:', M.toggleSeat(s, s.pool[0].id) === s);

console.log('\nROUND 2: level the jars on a panel built like the ERC\'s, 4 swaps');
let r = M.newRound2(); console.log('  ' + jars(M.evaluate(r.table)));
const doSwap = (outCode, inCode) => {
  const i = r.table.findIndex(j => j.p + '/' + j.w === outCode), b = r.bench.findIndex(j => j.p + '/' + j.w === inCode);
  const before = M.evaluate(r.table); r = M.swap(r, i, b); const e = M.evaluate(r.table);
  console.log(`  swap ${outCode} -> ${inCode}: big ${e.big.stars - before.big.stars >= 0 ? '+' : ''}${(e.big.stars - before.big.stars).toFixed(2)}, ` +
    `other ${e.other.stars - before.other.stars >= 0 ? '+' : ''}${(e.other.stars - before.other.stars).toFixed(2)}  | ${jars(e)} | swaps left ${r.swapsLeft}${r.done ? ' DONE' : ''}`);
};
// naive attempt: add small countries in place of small countries
doSwap('GR/GR', 'PT/PT'); doSwap('BE/BE', 'HU/HU');
console.log('  (the teal jar barely moves: each small country sends few applicants) -> RESET');
r = M.newRound2();
doSwap('DE/DE', 'PT/PT'); doSwap('IT/UK', 'FI/FI'); doSwap('UK/UK', 'NO/NO'); 
if (!r.done) doSwap('IT/IT', 'DK/DK');
console.log(`  result: ${M.evaluate(r.table).level ? 'LEVEL' : 'NOT YET'} in ${r.swapsUsed} swaps; history ${JSON.stringify(r.history)}`);
console.log('  swap after done is ignored:', M.swap(r, 0, 0) === r);
