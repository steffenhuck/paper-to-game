// Play it in numbers (build.md §3): the obvious ways of ruling, run against the mechanism, before any screen exists;
// then the loop on placeholder graphics: a full run printed beat by beat, read as the stranger.
const M = require('./mechanism.js');
const Q = M.quarrels();
const strategies = {
  'the fair instinct: make the harmer pay, every time': [1, 1, 1, 1, 1, 1],
  'let them carry on, every time': [0, 0, 0, 0, 0, 0],
  'ban the harmful thing, every time': [2, 2, 2, 2, 2, 2],
  'pay in the farm, let the big ones spark': [1, 1, 1, 0, 0, 0],
  'Coase overlearned: pay until the lawyer, then let them be': [1, 1, 0, 0, 0, 0],
  'the paper\'s reading (best ruling each time)': Q.map(q => M.bestRuling(q).best),
  'ruling by coin (seed 1)': [0, 2, 1, 0, 1, 2]
};
const lines = ['strategy | per quarrel (yours / best) | total / possible | share'];
for (const [name, rs] of Object.entries(strategies)) {
  const g = M.newGame(); const per = [];
  rs.forEach(r => { const x = M.rule(g, r); per.push(Math.round(x.outcome.total) + '/' + Math.round(x.bestTotal)); });
  const v = M.verdict(g);
  lines.push(name + ' | ' + per.join(' ') + ' | ' + Math.round(v.mine) + '/' + Math.round(v.possible) + ' | ' + Math.round(v.share * 100) + '% | ' + v.fate);
}
console.log(lines.join('\n'));
console.log('\n--- loop on placeholder graphics: a stranger\'s run (pay, roam, roam, pay, pay, pay) ---');
const g = M.newGame();
[1, 0, 0, 1, 1, 1].forEach((r, i) => {
  const q = Q[i];
  console.log('\n[quarrel ' + q.n + ' of 6: ' + q.title + ']  sign: (blank)  picture: ' + q.kind + ' scene level ' + q.scene.level);
  q.facts.forEach(f => console.log('  fact (' + f.icon + '): ' + f.text));
  q.rulings.forEach((t, k) => console.log('  ruling ' + k + ': ' + t + '  -> sign "' + q.signs[k] + '"'));
  console.log('  > player taps ruling ' + r + '; sign reads "' + q.signs[r] + '"; presses rule');
  const x = M.rule(g, r);
  x.outcome.beats.forEach(b => console.log('    beat: ' + b.text + '   [picture: level ' + b.state.level + ' ' + JSON.stringify(b.state.choices) + (b.state.device ? ' device' : '') + (b.state.coins ? ' coins ' + b.state.coins : '') + ']'));
  console.log('  purses: ' + q.a.name + ' ' + M.dollars(x.outcome.payA) + ', ' + q.b.name + ' ' + M.dollars(x.outcome.payB) + (x.outcome.fee ? ', the lawyer ' + M.dollars(x.outcome.fee) : '') + ' | valley ' + M.dollars(x.outcome.total) + ' of ' + M.dollars(x.bestTotal));
  x.result.forEach(l => console.log('  result: ' + l));
  x.others.forEach(o => console.log('  ghost: "' + o.sign + '": ' + o.summary.text + '; valley ' + M.dollars(o.summary.total)));
});
const v = M.verdict(g);
console.log('\n[verdict]\n  ' + v.didText + '\n  ' + v.paper + '\n  ' + v.means + '\n  fate: ' + v.fate);
v.did.forEach(d => console.log('  ' + d.title + ': ' + d.line + ' (' + M.dollars(d.total) + ' of ' + M.dollars(d.best) + ')'));
