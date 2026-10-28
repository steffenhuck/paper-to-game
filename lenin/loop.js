// Placeholder loop (build step 2): plays a plausible session headlessly and prints what the player would see.
const M = require('./mechanism.js');
const b = M.betResult('less'); console.log('BET less →', b.head, '|', b.line);
const s = M.newSession();
const plan = [['income'], ['panel', 'cohort'], ['before'], ['movers', 'panel'], ['ballot'], ['income', 'beliefs']];
plan.forEach((cards, i) => {
  console.log(`\nOBJECTION ${i + 1}: ${M.OBJECTIONS[i].say}`);
  for (const c of cards) { const r = M.play(s, c); console.log(`  play ${c}: ${r.ok ? '✓' : '✗'} (try ${r.tries}) — ${r.line}`); }
  M.advance(s);
});
const f = M.forecastResult(2050); console.log('\nFORECAST 2050 →', f.head, '|', f.line);
console.log('\nVERDICT', M.verdict(s));
