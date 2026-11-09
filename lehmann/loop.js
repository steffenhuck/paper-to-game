// Headless play of the loop on placeholder graphics: prints, after each action, what changed and where the player stands.
const M = require('./mechanism.js');
const C = M.CONFIG;
const ring = heard => C.POSTS.map(p => heard[p] ? '*' : '.').join('');
const g = M.newGame();
console.log('ACT ONE  posts: ' + C.POSTS.join(' '));
console.log('aim: Reach every listening post on the far side of the Earth with a wave.');
for (const a of [45, 50, 60, 30, 34, 33.5, 33.75, 26, 22.5, 10, 2.5, 80, 0]) {
  const r = M.fire(g, a);
  console.log(`\n  dive ${M.fmtDive(a)} → ${r.ray.branch.padEnd(7)} Δ ${r.ray.delta.toFixed(1).padStart(6)} fold ${r.ray.fold.toFixed(1).padStart(6)}  ring ${ring(g.heard)}  ${r.heardCount} of 18 heard`);
  console.log('  SAYS: ' + r.words.what + ' ' + r.words.came + '\n        ' + r.words.heard);
}
console.log('\n  [That’s every post I can reach]');
const rv = M.reveal(g);
console.log('  fan drawn: ' + rv.fan.length + ' rays a side; reachable ' + rv.reach.length + ', got ' + rv.got.length + ', missed ' + rv.missed.map(m => m.post + '(' + m.dive + ')').join(' ') + '; shadow ' + rv.shadow.join(' '));
rv.lines.forEach(l => console.log('  SAYS: ' + l));
M.TWIST.forEach(l => console.log('  CARD: ' + l));
console.log('\nACT TWO  aim: Build the inside of the Earth so the posts in the shadow hear the quake too.');
for (const [s, v] of [[0.25, 0.9], [0.25, 1.1], [0.1, 1.08], [0.22, 1.075]]) {
  const q = M.quake(g, s, v);
  console.log(`\n  ball ${s} × ${v} → lit ${q.lit.join(' ') || 'none'}   ring ${ring(q.heard)}   quakes left ${q.left}`);
  console.log('  SAYS: ' + q.words.ball + '\n        ' + q.words.result + '\n        ' + q.words.how);
}
const v = M.verdict(g);
console.log('\nVERDICT\n  ' + v.fate + '\n  ' + v.did + '\n  --\n  ' + v.paper + '\n  --\n  ' + v.means + '\n  "' + v.quote + '"');
