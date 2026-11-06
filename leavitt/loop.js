// Headless play of the loop: prints what the player sees after each act (placeholder for the skin).
const M = require('./mechanism.js'), C = M.CONFIG;
const g = M.newGame(1912);
const H = M.herLines();
g.rounds.forEach((r, i) => {
  g.round = i; const s = M.star(r.h);
  console.log(`\nSTAR ${i + 1} OF 7 · HARVARD ${r.h} · dot at brightest ${s.max}, faintest ${s.min} · plates span ${M.beatWords(r.rec.span)}`);
  if (i === C.PREDICT_ROUND) { const gp = Math.pow(10, (s.max - H.max.a) / H.max.b); console.log('  set from its light:', M.beatWords(gp), '->', M.guess(g, gp).line, ' roughness at guess', M.roughness(r.rec, gp).toFixed(2)); }
  [8, s.period * 0.97, s.period * 2, s.period].forEach(P => console.log(`  dial ${M.beatWords(P).padEnd(18)} roughness ${M.roughness(r.rec, P).toFixed(2)}`));
  const P = i === 1 ? s.period * 2 : s.period * 1.004;
  console.log('  WRITE IT DOWN at', M.beatWords(P), '| hers', M.beatWords(s.period), '|', M.write(g, P).line);
  console.log(`  chart: stroke at x=${M.chartX01(P).toFixed(2)} from y=${M.chartY01(s.max).toFixed(2)} to ${M.chartY01(s.min).toFixed(2)}`);
});
const v = M.verdict(g); console.log('\nVERDICT\n ', v.did, '\n ', v.paper, '\n ', v.means);
