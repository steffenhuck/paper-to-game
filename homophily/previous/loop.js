// Headless play of the loop (build step 2): a plausible first-timer strategy, printed as the player would see it.
const M = require('./mechanism.js');
const g = M.newGame(+(process.argv[2] || 3));
const name = id => M.CONFIG.suspects.find(s => s.id === id).name;
for (let k = 0; k < 4; k++) {
  const c = M.openCase(g);
  console.log(`\nCASE ${k + 1}: ${c.country}  headline: compatriot judges' marks +${c.head.gap.toFixed(2)} vs other marks`);
  const alive = new Set(['quality', 'lenient', 'info', 'favour']);
  for (const t of ['proposal', 'judge', 'spread']) {
    const r = M.test(g, t);
    if (t === 'spread') { console.log(`  test ${t}: ${r.pattern}  [${r.diff.map(v => (v * 100).toFixed(1)).join(' ')}]`); if (r.pattern === 'smile') { alive.clear(); alive.add('info'); } else alive.delete('info'); if (r.pattern === 'flat') { alive.clear(); alive.add('quality'); } }
    else { console.log(`  test ${t}: ${r.gone ? 'GONE' : 'still there'} ${r.gap.toFixed(2)} [${r.lo.toFixed(2)}, ${r.hi.toFixed(2)}]`); if (t === 'proposal') { if (r.gone) { alive.clear(); alive.add('quality'); } else alive.delete('quality'); } if (t === 'judge') { if (r.gone) { alive.clear(); alive.add('lenient'); } else alive.delete('lenient'); } }
    console.log(`    player now suspects: ${[...alive].map(name).join(', ')}`);
    if (alive.size === 1) break;
  }
  const res = M.accuse(g, [...alive][0]);
  console.log(`  ACCUSE ${name(res.suspect)} → ${res.correct ? 'SOLVED' : 'NOT SOLVED, it was ' + name(res.truth)} in ${res.tests} test(s).  Running: ${M.solved(g)} of ${g.results.length} solved`);
}
console.log('\nBET "About 5 points":', JSON.stringify(M.judgeBet('five')));
console.log(`END: solved ${M.solved(g)} of 4`);
