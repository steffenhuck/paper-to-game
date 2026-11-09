// Headless play of the loop on placeholder graphics: prints, after each action, what changed and where the player stands.
const M = require('./mechanism.js');
const plots = p => p.map(v => v === 0 ? '.' : v === 10 ? 'X' : String(v)).join(' ');
const plan = [['sheet', 75], ['spokes', 70], ['pass', 60], ['after', null], ['pass', 58], ['pass', 58]];
const g = M.newGame();
console.log('A PLAIN STREET: ' + plots(M.drawStreet(M.thisStreetMeans('plain'))) + '  = ' + Math.round(M.plainTotal()) + ' saplings');
for (const [key, bet] of plan) {
  console.log(`\n=== STREETS ${g.pair * 2 - 1} & ${g.pair * 2} of 12   letter: ${M.LETTER[key].name} (${M.LETTER[key].cell})`);
  console.log('  letter says: ' + M.LETTER[key].line);
  const r = M.plantThis(g, key);
  console.log('  THIS STREET  ' + plots(r.thisPledges) + '  = ' + Math.round(r.thisTotal) + '  (plain 57)' + (r.spokes >= 0 ? '  spokesperson at plot ' + (r.spokes + 1) : ''));
  console.log('  SAYS: ' + r.thisWords.what + '\n        ' + r.thisWords.came + '\n        ' + r.thisWords.paper);
  if (g.phase === 'bet') console.log('  BET: how many saplings will the next street plant? (slider from 57) → player says ' + bet);
  else console.log('  (no bet: nothing is sent before the next street decides)');
  const r2 = M.plantNext(g, bet);
  console.log('  NEXT STREET  ' + plots(r2.nextPledges) + '  = ' + Math.round(r2.nextTotal) + '  (plain 57)');
  console.log('  SAYS: ' + r2.nextWords.saw + '\n        ' + r2.nextWords.came + (r2.nextWords.bet ? '\n        ' + r2.nextWords.bet : '') + '\n        ' + r2.nextWords.paper);
  console.log('  PAIR: ' + Math.round(r2.pairTotal) + ' saplings; plain pair 113' + (r2.betType ? '; bet type: ' + r2.betType : ''));
  M.nextPair(g);
}
const v = M.verdict(g);
console.log('\nVERDICT\n  ' + v.lines.join('\n  ') + '\n  --\n  ' + v.paper.join('\n  ') + '\n  --\n  ' + v.boundary);
