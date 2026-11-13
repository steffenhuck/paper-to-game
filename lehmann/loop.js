// Headless play of the loop on placeholder graphics: prints, after each action, what the game says and where the player stands.
const M = require('./mechanism.js');
const C = M.CONFIG;
const ring = heard => C.POSTS.map(p => heard[p] !== undefined ? '*' : '.').join('');
const say = w => Object.values(w).filter(Boolean).join('\n        ');
const g = M.newGame();
console.log('ACT ONE  posts: ' + C.POSTS.join(' '));
console.log('aim: Light as many listening posts as you can with twelve waves. (After six: hit the ringed post at 130°.)');
for (const a of [45, 60, 30, 80, 10, 20, 34, 33.5, 33.7, 26, 22.5, 0]) {
  const r = M.fire(g, a);
  console.log(`\n  dive ${M.fmtDive(a)} → ${r.ray.branch.padEnd(7)} Δ ${r.ray.delta.toFixed(1).padStart(6)} fold ${r.ray.fold.toFixed(1).padStart(6)}  ring ${ring(g.heard)}  ${r.heardCount} of 18 lit`);
  console.log('  SAYS: ' + say(r.words));
}
const rv = M.reveal(g);
console.log('\n  [every dive at once] fan ' + rv.fan.length + ' rays a side; reachable ' + rv.reach.length + ', got ' + rv.got.length + '; shadow ' + rv.shadow.join(' '));
rv.lines.forEach(l => console.log('  SAYS: ' + l));
M.RECORDS.before.forEach(l => console.log('  CARD: ' + l));
C.PAPER.RECORDS.forEach(r => console.log(`  CARD: [${r.name} ${r.deg}°: up-down ${r.upDown}, sideways ${r.sideways}]`));
M.RECORDS.after.forEach(l => console.log('  CARD: ' + l));
console.log('\nACT TWO  aim: Something sends waves into the shadow. Find it: light the four ringed posts.');
for (const a of [30, 20, 10, 13, 14, 15, 14.5, 15.5]) {
  const r = M.fire2(g, a);
  console.log(`\n  dive ${M.fmtDive(a)} → ${r.ray.branch.padEnd(7)} fold ${r.ray.fold.toFixed(1).padStart(6)}  marks ${r.marks.length}  shadow posts lit ${r.lit.join(' ') || 'none'}`);
  console.log('  SAYS: ' + say(r.words));
  if (r.last) break;
}
const r2 = M.reveal2(g);
console.log('\n  [the ball drawn, every dive at once]');
r2.lines.forEach(l => console.log('  SAYS: ' + l));
const v = M.verdict(g);
console.log('\nVERDICT\n  ' + v.fate + '\n  ' + v.did + '\n  --\n  ' + v.paper + '\n  --\n  ' + v.means + '\n  "' + v.quote + '"');
