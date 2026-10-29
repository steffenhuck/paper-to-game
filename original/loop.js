// Headless loop (build step 2): plays a plausible first-timer through the mechanism and prints what the player would see.
const M = require('./mechanism.js'); const C = M.CONFIG;
const calls = M.naiveCalls(); calls.CH = true;   // a first-timer: "hit hard = fight", but suspects Switzerland
const a1 = M.scoreAct1(calls);
a1.rows.forEach(r => console.log(`${r.name.padEnd(12)} you: ${r.call ? 'fight' : 'quiet'}  paper: ${r.fight ? 'fight' : 'quiet'}  ${r.right ? 'RIGHT' : 'wrong'}`));
console.log(`ACT 1: ${a1.right} of ${a1.of}\n`);
const plays = [[2, 0], [0, 0], [1, 2]];   // copy loudly; then tough-but-quiet; then loud-but-open
const res = plays.map(([t, l], i) => { const r = M.runCampaign(i, t, l);
  console.log(`${C.campaigns[i].title} (${C.campaigns[i].rule}) talk +${C.talk[t] * 100} pts, lean ${['tougher', 'hold', 'open'][l]}: RR ${r.before}% -> ${r.after.toFixed(1)}% (${r.delta >= 0 ? '+' : ''}${r.delta.toFixed(1)}) ${r.held ? 'HELD' : 'NOT HELD'}  | options held: ${r.options.filter(o => o.held).length}/${r.options.length}`);
  return r; });
console.log('\nVERDICT', M.verdict(a1, res));
