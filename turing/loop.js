// Headless play of the loop on placeholder graphics: prints, after each action, what changed and where the player stands.
const M = require('./mechanism.js');
const g = M.newGame(7);
const plan = [['joke', 'chair'], ['moral', 'chair'], ['feel', 'chair'], ['feel', 'open'], ['feel', 'be'], ['godel', 'chair']];
console.log('AIM: Write a test that the machine fails and the person passes.');
console.log('Witness A is a machine, built this year. Witness B is a person. A slow line carries typed words, nothing else. You know which is which.');
for (const [d, c] of plan) {
  console.log(`\n--- TEST ${g.tests.length + 1} OF ${M.CONFIG.tests} · SEPARATIONS THAT HOLD: ${g.holds}`);
  console.log(`> THE WITNESS MUST ${M.demand(d).line}`);
  console.log(`> CHECKED BY ${M.check(c).label}: ${M.check(c).does}`);
  console.log('> RUN');
  const r = M.runTest(g, d, c);
  for (const l of r.lines) console.log((l.who === 'T' ? '   ' : l.who + ': ') + l.text);
  console.log('   ' + r.resultLine);
  if (r.reply) r.reply.forEach(t => console.log('   ' + t));
  console.log(`   [status now] TEST ${g.tests.length} OF ${M.CONFIG.tests} DONE · SEPARATIONS THAT HOLD: ${g.holds}`);
}
if (M.needsForced(g)) { const f = M.forcedTests(g); console.log('\n' + f.intro); f.tests.forEach(t => { t.lines.forEach(l => console.log('   ' + l.text)); console.log('   ' + t.resultLine); }); }
const s = M.summary(g);
console.log('\n=== ' + s.head);
s.did.forEach(t => console.log('  ' + t)); console.log('  --'); s.paper.forEach(t => console.log('  ' + t)); console.log('  --'); s.means.forEach(t => console.log('  ' + t));
console.log('\n  ' + 'no  test                                   check           A                     B                     held');
s.table.forEach(t => console.log('  ' + String(t.n).padEnd(4) + t.line.slice(0, 38).padEnd(39) + t.check.padEnd(16) + t.A.padEnd(22) + t.B.padEnd(22) + t.held));
console.log('\nTHE POLITE CONVENTION. Extend it to: [x] you  [ ] witness B  [ ] witness A  [ ] an elephant.  Grounds: what it does / what it is made of / what it says it feels / politeness.');
const cv = M.convention(['B', 'elephant'], 'polite');
console.log('  ' + cv.yours + '\n  ' + cv.turing + '\n  ' + cv.his + '\n  ' + cv.last);
