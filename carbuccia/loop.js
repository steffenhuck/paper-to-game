// Headless play of the loop on placeholder graphics: prints, after each action, what changed and where the player stands.
const M = require('./mechanism.js');
const bar = (x, w) => '#'.repeat(Math.round(x * w)).padEnd(w, '.');
function stairs(r, cut) {
  const { a, b } = M.CUTS[cut]; const L = r.ladders, K = r.control; const lines = [];
  for (const k of ['wants', 'apply', 'access']) {
    lines.push(`  ${k.padEnd(7)} ${a.padEnd(9)} [${bar(L[a][k], 30)}] ${Math.round(L[a][k] * 100)}  (ghost ${Math.round(K[a][k] * 100)})`);
    lines.push(`          ${b.padEnd(9)} [${bar(L[b][k], 30)}] ${Math.round(L[b][k] * 100)}  (ghost ${Math.round(K[b][k] * 100)})`);
  }
  return lines.join('\n');
}
const plan = [['videos', 'all'], ['calls', 'nodegree'], ['calls', 'lowknow'], ['calls', 'all']];
const g = M.newGame();
console.log('WARD WITH NO HELP: gaps by degree', M.gaps('degree', null), 'by birthplace', M.gaps('birthplace', null));
for (const s of plan) {
  const o = { tool: s[0], target: s[1] };
  console.log(`\n=== YEAR ${g.year}  purse €${g.purse}  order: ${o.tool} to ${M.GROUP_NAME[o.target]}  cost €${M.cost(o)}  affordable: ${M.canAfford(g, o)}`);
  const r = M.runYear(g, M.canAfford(g, o) ? o : null);
  console.log(stairs(r, 'degree'));
  console.log('  BOARD by degree   APPLIED', r.gaps.degree.apply, ' PLACES', r.gaps.degree.access, '  (no help:', r.gaps.control.degree.apply, '/', r.gaps.control.degree.access + ')');
  console.log('  BOARD birthplace  APPLIED', r.gaps.birthplace.apply, ' PLACES', r.gaps.birthplace.access);
  if (r.ladders.target) console.log('  the ones you called: apply', Math.round(r.ladders.target.apply * 100), 'was', Math.round(r.control.target.apply * 100), '; place', Math.round(r.ladders.target.access * 100), 'was', Math.round(r.control.target.access * 100));
  console.log('  SAYS: ' + r.words.what + '\n        ' + r.words.steps + '\n        ' + r.words.paper);
  console.log('  purse now €' + g.purse + (g.done ? '  — game over' : ''));
}
const v = M.verdict(g);
console.log('\nVERDICT\n  ' + v.lines.join('\n  '));
