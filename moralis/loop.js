// Headless play loop (build step 2): a plausible naive strategy, printed action by action.
const M = require('./mechanism.js');
const plan = { strangers: [0.5, 0.2, 0], siblings: [0, 1, 0.5], siblingsHD: [0.5], halfsib: [0.3], classmates: [0.2] };
const rounds = [];
M.CONFIG.societies.forEach((s, si) => {
  console.log(`\n== ${s.name} (${s.mode}) — ${s.story}`);
  const tests = []; let k;
  for (k of plan[s.id]) {
    const t = M.runTest(si, k, tests.length); tests.push(t);
    const side = t.moreMoral && !t.lessMoral ? 'all more moral' : t.lessMoral && !t.moreMoral ? 'all less moral' : '';
    console.log(`  set balance ${k.toFixed(2)} → beaten by ${t.beatenBy} of 11 ${side}${t.held ? '  HELD' : ''}`);
    if (M.roundOver(si, tests, false)) break;
  }
  const v = M.roundVerdict(si, tests, false); rounds.push(v);
  console.log(`  round verdict: ${v.held ? `held on test ${v.tests}` : 'not held'}; the unbeatable balance: ${s.sigma.toFixed(2)}`);
});
console.log('\nsession verdict', M.sessionVerdict(rounds));
