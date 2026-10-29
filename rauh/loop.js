// Loop check (build step 2): plays the mechanism headlessly and prints what the player would see after each action.
// Run: node loop.js
const M = require('./mechanism.js');
const b1 = M.placeBet(35); console.log(`BET 1: placed 35 -> Commission at ${b1.truth} (${b1.grade}, ${b1.dir}, off by ${b1.err.toFixed(1)})`);
const b2 = M.trendBet('easier'); console.log(`BET 2: "easier" -> ${b2.truth} (${b2.right ? 'right' : 'wrong'}) ${b2.first} -> ${b2.last}`);
function session(label, plan) {
  console.log(`\n=== ${label} ===`);
  const d = M.newDraft(); console.log(`start: ${M.draftScore(d).ease.toFixed(1)}  | edits left ${M.left(d)}`);
  for (const [i, k] of plan) {
    const r = M.edit(d, i, k);
    const s = M.standing(r.after);
    console.log(`edit ${M.RELEASE.paras[i].id} -> ${M.KINDS[r.kind]}: ${r.before.toFixed(1)} -> ${r.after.toFixed(1)} (${r.delta >= 0 ? '+' : ''}${r.delta.toFixed(1)}) | now past: ${s ? s.short : 'nobody'} | left ${r.left}`);
  }
  const v = M.verdict(d); console.log(`VERDICT: ${v.ease.toFixed(1)} ${v.hit ? 'HIT the UK line' : 'missed by ' + v.gap.toFixed(1)}`);
}
session('first-timer: split the long first sentence, then the quote', [[0, 0], [3, 1]]);
session('second try: the quote, then the procedure paragraph in everyday words', [[3, 1], [4, 0]]);
session('splitter: shorter sentences everywhere', [[0, 0], [1, 0]]);
