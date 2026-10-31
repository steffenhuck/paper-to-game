// The play loop on placeholder graphics. Run: node loop.js  (writes loop-log.txt). Prints, after each action, what changed and where the
// player stands, for the builder to read as the stranger: did something visible change, did it say whether it worked, was there a reason to think?
const M = require('./mechanism.js'); const C = M.CONFIG, fs = require('fs'); const L = []; const say = s => { L.push(s); console.log(s); };
const plan = process.argv.slice(2).length ? process.argv.slice(2) : ['sphinx', 'wait', 'oil', 'onespeck', 'surface', 'coarse', 'asbestos'];
say('AIM: Dust is dancing in a drop of water. Make it lie still.');
say('STAGE, day 0: fresh pollen of Clarckia; 10 oblong particles turning slowly, 34 round specks trembling fast.  [Dancing.]');
say('SHELF: ' + C.SUSPECTS.map(s => s.label.toUpperCase()).join(' | ') + '   (what people have said makes it move)');
const g = M.newGame();
for (const id of plan) {
  say(`\nDAY ${g.day + 1} OF ${C.DAYS}. BENCH: ` + M.available(g).map(e => e.label).join(' / '));
  const exp = M.expById(id); say(`  tap "${exp.label}" -> "You will: ${exp.act}"  [LOOK enabled]`);
  const d = M.playDay(g, id); const st = d.state; let frames = 0; const seen = [];
  while (!st.done && frames++ < 3000) { M.step(st, 1 / 60); if (frames % 120 === 0) seen.push(`t=${st.t.toFixed(0)}s r=${st.radius.toFixed(2)} cur=${st.current.toFixed(2)} water=${st.water}`); }
  say('  LOOK: ' + (seen.join(' | ') || 'eight seconds of the drop'));
  const movers = st.specks.filter(s => s.v > 0).length, still = st.specks.filter(s => s.v === 0).length;
  say(`  PICTURE: ${st.specks.length} specks (${movers} dancing, ${still} still), vessel ${st.vessel}, water ${st.water}, beads ${st.beads.length}`);
  say(`  YARD: ${d.reading.yard}`); say(`  LINE: ${d.reading.what}`);
  say('  SHELF: ' + C.SUSPECTS.map(s => g.setAside[s.id] ? `[${s.label.toUpperCase()} — set aside]` : s.label.toUpperCase()).join(' | '));
  if (d.reading.answers.length) say('  slips land on: ' + d.reading.answers.join(', ')); else say('  no slip lands');
  if (d.over) break;
}
const v = M.verdict(g);
say(`\nVERDICT: ${v.headline}`);
say(`  You tried: ${v.tried.join('; ')}.`); say(`  Set aside: ${v.aside.join(', ') || 'none'}. Still standing: ${v.standing.join(', ') || 'none'}.`);
say(`  Size lever ${v.leverFound ? 'found' : 'never looked for'}. Quiet drops: ${v.quiet.map(q => q.label + ' (' + q.how + ')').join(', ') || 'none'}.`);
fs.writeFileSync('loop-log.txt', L.join('\n') + '\n');
