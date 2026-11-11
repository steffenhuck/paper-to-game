// Headless play of the loop on placeholder graphics: prints, after each action, what changed and where the player stands.
const M = require('./mechanism.js');
const g = M.newGame(11);
console.log('AIM: Eleven questions, two answers each. Say which answer the person wrote.');
console.log(`LINE ${g.seed} OPEN. Turing's bar: right ${M.BAR} times or fewer and the machine passes.`);
for (let i = 0; i < 11; i++) {
  const o = M.ask(g);
  console.log(`\n--- ${o.n} OF 11. ${o.group}.   right so far: ${M.score(g).right} of ${M.score(g).asked}`);
  if (o.intro) console.log('   ' + o.intro);
  console.log('C: ' + o.q);
  console.log('X: ' + o.X.replace(/\n/g, '\n   '));
  console.log('Y: ' + o.Y.replace(/\n/g, '\n   '));
  const side = /\.$/.test(o.X) && !/\.$/.test(o.Y) ? 'Y' : 'X';
  console.log(`> [ X IS THE PERSON ] [ Y IS THE PERSON ]  -> player says ${side}`);
  const r = M.judge(g, side);
  console.log('   ' + r.reveal + '\n   ' + r.paper);
  console.log(`   [status now] right ${r.score.right}, wrong ${r.score.wrong}, of ${r.score.asked}; bar ${r.score.bar} of ${r.score.of}` + (r.last ? '  (last question)' : ''));
}
const s = M.summary(g);
console.log('\n=== ' + s.head + '\n  ' + s.machine); s.lines.forEach(t => console.log('  ' + t)); console.log('  --'); s.paper.forEach(t => console.log('  ' + t));
s.table.forEach(t => console.log(`  ${t.n} ${t.group}: ${t.q.slice(0, 40)} | ${t.right ? 'right' : 'wrong'}`));
console.log('\nTHE POLITE CONVENTION. ' + M.REPLY[1]);
const cv = M.convention(['B', 'A'], 'polite'); console.log('  ' + cv.yours + '\n  ' + cv.turing + '\n  ' + cv.his);
