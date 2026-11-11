// Headless play of the loop on placeholder graphics: prints, after each action, what changed and where the player stands.
const M = require('./mechanism.js');
const g = M.newGame(11);
console.log('AIM: Fifteen times, two sentences: say which one the person wrote.');
console.log(`LINE ${g.seed} OPEN. Three modules of five. The score is the machine's; Turing's bar is ${M.BAR} of ${M.TOTAL}.`);
for (let i = 0; i < 15; i++) {
  const o = M.ask(g);
  if (o.intro) console.log(`\n=== MODULE ${o.module} OF 3. ${o.moduleName}.\n   ${o.intro}`);
  console.log(`\n--- ${o.inModule} OF ${o.perModule}   machine taken for the person so far: ${M.score(g).fooled} of ${M.score(g).asked}`);
  console.log('C: ' + o.q); console.log('X: ' + o.X.replace(/\n/g, '\n   ')); console.log('Y: ' + o.Y.replace(/\n/g, '\n   '));
  const side = o.X.length < o.Y.length ? 'X' : 'Y';
  console.log(`> [ X IS THE PERSON ] [ Y IS THE PERSON ]  -> player says ${side}`);
  const r = M.judge(g, side); console.log('   ' + r.reveal);
}
const s = M.summary(g);
console.log('\n=== ' + s.head + '\n  ' + s.band + '\n  ' + s.machine + '\n  ' + s.yours); s.modules.forEach(t => console.log('  ' + t)); console.log('  --'); s.witnesses.forEach(t => console.log('  ' + t)); console.log('  --'); s.paper.forEach(t => console.log('  ' + t));
console.log('\nTHE POLITE CONVENTION. ' + M.REPLY[1]);
const cv = M.convention(['B', 'A'], 'polite'); console.log('  ' + cv.yours + '\n  ' + cv.turing + '\n  ' + cv.his);
