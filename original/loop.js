// Placeholder loop (build step 2): plays a plausible first-timer session headlessly and prints what the player would see.
const M = require('./mechanism.js');
const g = M.newGame();
// A first-timer: steals their issue on day 1, tries the usual line, then pensions, then takes them on; dodges after.
const plan = [['imm', 'copy'], ['imm', 'usual'], ['other'], ['imm', 'oppose'], ['other'], ['other'],
              // crisis: has learnt; dodges when possible, takes them on when forced
              ['imm', 'oppose'], ['other'], ['other'], ['imm', 'oppose'], ['other'], ['other']];
let step = 0;
for (let c = 0; c < 2; c++) {
  console.log(`\n=== ${M.current(g).name} (they start at ${g.start}%) ===`);
  while (!M.campaignOver(g)) {
    const qs = M.today(g), [want, kind] = plan[step++];
    console.log(`DAY ${g.day + 1}${M.forced(g) ? ' (every question is about immigration)' : ''}: ` + qs.map(q => `[${q.topic}] ${q.text}`).join(' | '));
    let i = qs.findIndex(q => (want === 'imm') === q.imm); if (i < 0) i = 0;
    const r = M.answer(g, i, kind || 'oppose');
    console.log(`  YOU (${r.kind}): "${r.said}"  -> ${r.headline}\n  RIVAL: "${r.reaction}"  balloon ${M.fmt(r.change)} -> ${r.share.toFixed(1)}% (from your campaign ${M.fmt(r.after)}; ${r.held ? 'under' : 'OVER'} the 1-point line)`);
  }
  const n = M.electionNight(g);
  console.log(`ELECTION NIGHT: ${n.held ? 'HELD' : 'NOT HELD'} ${M.fmt(n.gain)} points -> ${n.end.toFixed(1)}%. ${n.line}`);
  if (c === 0) M.nextCampaign(g);
}
console.log('\nVERDICT', M.verdict(g));
console.log('WHAT IF', M.whatIf().map(w => `${w.label} ${M.fmt(w.gain)}`).join(' | '));
