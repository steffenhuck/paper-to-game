// Headless play of the loop on placeholder graphics: prints, after each action, what the game says and where the player stands.
const M = require('./mechanism.js');
const C = M.CONFIG, F = M.faintPosts();
const ring = r => C.POSTS.map(p => r[p] !== undefined ? '*' : F.includes(p) ? ':' : '.').join('');
const say = w => Object.values(w).filter(Boolean).join('\n        ');
const g = M.newGame();
console.log('posts: ' + C.POSTS.join(' ') + '   (: = felt the quake only faintly)');
console.log('\nSTAGE ONE  aim: ' + M.AIM1);
for (const a of [45, 60, 30, 10, 34, 33.5, 33.7, 26]) {
  const r = M.fire(g, a);
  console.log(`\n  dive ${M.fmtDive(a)} → ${r.ray.branch.padEnd(7)} fold ${r.ray.fold.toFixed(1).padStart(6)}  ring ${ring(g.reached)}  ${r.reachedCount} of 18 reached`);
  console.log('  SAYS: ' + say(r.words));
}
const rv = M.reveal(g);
console.log('\n  [every dive at once, one core]  ' + rv.head); rv.lines.forEach(l => console.log('  SAYS: ' + l));
M.CARD.forEach(l => console.log('  CARD: ' + l));
console.log('\nSTAGE TWO  aim: ' + M.AIM2);
for (const a of [25, 10, 14, 15]) {
  const r = M.fire2(g, a);
  console.log(`\n  dive ${M.fmtDive(a)} → ${r.ray.branch.padEnd(7)} fold ${r.ray.fold.toFixed(1).padStart(6)}  faint posts reached ${r.faintReached.join(' ') || 'none'}`);
  console.log('  SAYS: ' + say(r.words));
}
const r2 = M.reveal2(g);
console.log('\n  [every dive at once, a core within the core]  ' + r2.head); r2.lines.forEach(l => console.log('  SAYS: ' + l));
console.log('  ASKS: ' + r2.question + '  [' + r2.options.map(o => o[1]).join(' | ') + ']');
for (const p of ['two', 'one']) { const v = M.choose(g, p); console.log('\nVERDICT (' + p + ')\n  ' + v.fate + '\n  ' + v.did + '\n  --\n  ' + v.paper + '\n  --\n  ' + v.means + '\n  "' + v.quote + '"'); }
