// Headless play of the loop on placeholder graphics: prints, after each action, what changed and where the player stands.
const M = require('./mechanism.js');
const g = M.newGame(11);
console.log('AIM: Say which of two answers has a mind behind it, five times, and what you went by.');
console.log(`LINE ${g.seed} OPEN. Two witnesses in the next room: one a person, one a machine. The line carries words only.`);
const plan = ['feel', 'wrong', 'surprise', 'feel', 'sound'];
for (let i = 0; i < 5; i++) {
  const o = M.ask(g, plan[i]);
  console.log(`\n--- ROUND ${o.round} OF 5. ${o.name}.   mind found in: person ${M.counts(g).person} · machine ${M.counts(g).machine}`);
  console.log('   ' + o.intro);
  console.log(`> I will go by: ${M.criterion(plan[i]).label}`);
  console.log('C: ' + o.q);
  console.log('X: ' + o.X.replace(/\n/g, '\n   '));
  console.log('Y: ' + o.Y.replace(/\n/g, '\n   '));
  const side = o.X.length > o.Y.length ? 'Y' : 'X';
  console.log(`> [ X HAS THE MIND ] [ Y HAS THE MIND ]  -> player picks ${side}`);
  const r = M.pick(g, side);
  console.log('   ' + r.reveal); r.lines.forEach(l => console.log('   ' + l));
  console.log(`   [status now] mind found in: person ${r.counts.person} · machine ${r.counts.machine}` + (r.last ? '  (last question)' : ''));
}
console.log('\n--- BEYOND WORDS: [ OPEN IT UP ] [ BE IT ]');
for (const k of ['open', 'be']) { const b = M.beyond(g, k); console.log(`> ${b.label}`); b.lines.forEach(l => console.log('   ' + l)); console.log('   ' + b.result); if (b.reply) b.reply.forEach(l => console.log('   ' + l)); }
const s = M.summary(g);
console.log('\n=== ' + s.head); s.did.forEach(t => console.log('  ' + t)); console.log('  --'); s.paper.forEach(t => console.log('  ' + t)); console.log('  --'); s.means.forEach(t => console.log('  ' + t));
s.table.forEach(t => console.log(`  ${t.n} ${t.name}: ${t.q.slice(0, 40)} | went by ${t.criterion} | found in the ${t.found}`));
const cv = M.convention(['B', 'A'], 'polite'); console.log('\n  ' + cv.yours + '\n  ' + cv.turing + '\n  ' + cv.his);
