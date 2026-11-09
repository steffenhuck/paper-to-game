// The play loop on placeholder graphics: a scripted stranger plays eight sessions and writes back, and after every
// action this prints what changed and where the player stands. Run: node loop.js [seed]
const M = require('./mechanism.js');
const C = M.CONFIG;
const seed = +(process.argv[2] || 2026);
const rng = M.makeRng(seed);
const notebook = [];
const bar = (v, w = 20) => '[' + '#'.repeat(Math.round(v / 100 * w)).padEnd(w, '.') + ']';
function show(r) {
  console.log('  RESULT  ' + (r.task === 'sums' ? 'sums' : 'price') + ' + ' + C.prizes[r.prizes].label);
  console.log('    men   ' + bar(r.idx.men) + ' ' + Math.round(r.idx.men) + '  ' + M.indexLabel(r.task, r.prizes));
  console.log('    women ' + bar(r.idx.women) + ' ' + Math.round(r.idx.women));
  console.log('    ' + r.words + '  ' + r.topWords + '  ' + r.earnWords);
  console.log('    measured: ' + M.measuredLine(r.task, r.prizes));
  const g = M.ghostLine(r.task, r.prizes); if (g) console.log('    ghost: ' + g);
}
const plan = [['sums', 'one'], ['price', 'one'], ['sums', 'flat'], ['price', 'flat'], ['price', 'flat'], ['sums', 'steep'], ['price', 'steep'], ['sums', 'one']];
console.log('AIM: Find out, in eight lab sessions, whether women are less competitive than men, and write back.');
plan.forEach(([task, prizes], i) => {
  console.log('\nSESSION ' + (i + 1) + ' of ' + C.sessions + '  (budget left: EUR ' + (C.sessions - i) * C.sessionCostEuro + ')');
  console.log('  apparatus unset -> player picks: ' + task + ' / ' + prizes);
  console.log('  subjects\' screen: ' + (task === 'sums' ? 'You have 5 minutes. Solve as many sums as you can.' : 'Enter the most you would pay for each job.') + ' Prizes ' + M.prizeVector(prizes).join(' / '));
  const sessionSeed = Math.floor(rng() * 1e9);
  const r = M.runSession(task, prizes, sessionSeed);
  notebook.push(r);
  show(r);
  console.log('  NOTEBOOK now ' + notebook.length + ' rows: ' + notebook.map(x => (x.task === 'sums' ? 'S' : 'P') + x.prizes[0] + ':' + x.gap).join('  '));
});
console.log('\nWRITE BACK: three sentences; the player picks "depends"');
['less', 'same', 'depends'].forEach(rep => { const v = M.verdict(notebook, rep); console.log('  ' + rep.padEnd(8) + (v.backed ? 'BACKED   ' : 'not backed  ') + v.why); });
const v = M.verdict(notebook, 'depends');
console.log('\nVERDICT: what you did:'); v.did.forEach(d => console.log('  ' + d.text));
