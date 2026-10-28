// Loop check (build step 2): plays the mechanism headlessly and prints what the player would see after each action.
// Run: node loop.js
const M = require('./mechanism.js');
const fmt = (t, v) => t.fmt === 'ush' ? Math.round(v) + ' USh' : Math.round(v * 100) + ' in 100';
function session(label, plan, bets, calls) {
  console.log(`\n=== ${label} ===`);
  const g = M.newGame();
  plan.forEach((id, i) => {
    const r = M.runTest(g, id, bets[i]);
    console.log(`TEST ${r.test.name} | bet "${r.test.bet}" -> ${bets[i] ? 'yes' : 'no'} (${r.betRight ? 'right' : 'wrong'}) | left ${r.left}`);
    (r.test.rows || []).forEach(x => console.log(`   ${x.label}: own ${fmt(r.test, x.own)} vs other ${fmt(r.test, x.other)} [${x.clear}]`));
    if (r.test.dots) console.log('   p-values', r.test.dots.join(' '));
    console.log('   says:', r.test.say);
  });
  for (const [s, c] of Object.entries(calls)) M.call(g, s, c);
  const sc = M.score(g);
  console.log(`VERDICT: proven ${sc.proven}/5 (right ${sc.right}, hunches ${sc.hunches}/${g.run.length})`);
  sc.per.forEach(p => console.log(`   ${p.suspect}: called ${p.call}, paper ${p.paper} -> ${p.why}`));
}
const intuitive = { tastes: 'not', kind: 'guilty', team: 'cant', find: 'guilty', watched: 'cant' };
session('first-timer: seen first, believes kindness', ['dgSeen', 'pd', 'survey', 'network', 'puzzle'], [true, true, false, true, true], intuitive);
session('second try: the paper\'s route', ['dgHidden', 'dgSeen', 'survey', 'puzzle', 'network'], [true, true, false, false, true], { tastes: 'not', kind: 'not', team: 'cant', find: 'guilty', watched: 'guilty' });
