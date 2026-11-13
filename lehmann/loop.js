// Headless play of the loop on placeholder graphics: prints, after each action, what the game says and where the player stands.
const M = require('./mechanism.js');
const C = M.CONFIG;
const row = st => C.POSTS.map(p => ({ lit: '*', quiver: '~', off: '.' })[st[p] || 'off']).join('');
const say = w => Object.values(w).filter(Boolean).join('\n        ');
const g = M.newGame();
console.log('posts: ' + C.POSTS.join(' ') + '   (* lights, ~ quivers, . silent)');
console.log('\nSTAGE 0, THE FACTS  ' + M.DATA.before);
C.PAPER.QUAKES.forEach((q, k) => console.log(`  earthquake ${k + 1}: ${q.place}, ${q.date}   ${row(M.record())}`));
console.log('  ' + M.DATA.head); M.DATA.after.forEach(l => console.log('  SAYS: ' + l));
console.log('\nSTAGE ONE  ' + M.AIM1);
for (const a of [45, 30, 34, 33.5, 20]) {
  const r = M.fire(g, a);
  console.log(`\n  go ${r.n}: dive ${M.fmtDive(a)} → ${r.ray.branch.padEnd(7)} up at ${r.ray.fold.toFixed(1).padStart(6)}`);
  console.log('  SAYS: ' + say(r.words) + (r.plea ? '\n  ASKS: ' + r.plea : ''));
}
const rv = M.reveal(g);
console.log('\n  [every direction at once, one core]  ' + row(rv.state) + '\n  ' + rv.head); rv.lines.forEach(l => console.log('  SAYS: ' + l));
M.CARD.forEach(l => console.log('  CARD: ' + l));
console.log('\nSTAGE TWO  ' + M.AIM2);
for (const a of [25, 10, 14]) {
  const r = M.fire2(g, a);
  console.log(`\n  go ${r.n}: dive ${M.fmtDive(a)} → ${r.ray.branch.padEnd(7)} up at ${r.ray.fold.toFixed(1).padStart(6)}   band: ${r.quivering.length ? 'quivering' : 'silent'}`);
  console.log('  SAYS: ' + say(r.words));
}
const r2 = M.reveal2(g);
console.log('\n  [every direction at once, a core within the core]  ' + row(r2.state) + '\n  ' + r2.head); r2.lines.forEach(l => console.log('  SAYS: ' + l));
const v = M.verdict(g);
console.log('\nVERDICT\n  ' + v.fate + '\n  ' + v.did + '\n  --\n  ' + v.paper + '\n  --\n  ' + v.means + '\n  "' + v.quote + '"\n\nREAD FURTHER'); v.more.forEach(m => console.log('  ' + m[0] + '\n    ' + m[1]));
