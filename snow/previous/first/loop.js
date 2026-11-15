// The play loop on placeholder graphics (build.md §4.2): drives mechanism.js headless and prints, after every action,
// what changed and where the player stands, as the stranger would read it. Strategy: the walkthrough's (crape doors
// first, the rest on living doors; five brown marks).
const M = require('./mechanism.js'); const C = M.CONFIG;
const seed = Number(process.argv[2] || 7);
const g = M.newGame(seed); const L = [];
const row = (s) => { let t = ''; for (let r = 0; r < 3; r++) { let line = ''; for (let c = 0; c < 6; c++) { const h = s.houses[r * 6 + c]; line += (h.crape ? 'X' : '.') + (h.tested ? (h.water === 'brown' ? 'b' : 'u') : (h.marked ? '*' : (s.role === 'predict' ? (h.water === 'brown' ? 'B' : 'U') : '?'))) + ' '; } t += '   ' + line + '\n'; } return t; };
const win = () => { const w = g.window; return `   WINDOW  crape: brown ${w.crapeBrown} blue ${w.crapeBlue} | living: brown ${w.liveBrown} blue ${w.liveBlue}\n   ${M.windowLine(g)}`; };
L.push(`SEED ${seed}. AIM: Find out whether the water makes the difference between the doors with crape and the doors without.`);
for (let si = 0; si < 3; si++) {
  const s = M.current(g);
  L.push(`\nSTREET ${si + 1} of 4: ${s.name} — ${s.phrase}. Crape on ${s.crape} doors. Knock at a door. ${s.knocksLeft} knocks left.`);
  L.push(row(s));
  const order = s.houses.filter(h => h.crape).map(h => h.i).concat(s.houses.filter(h => !h.crape).map(h => h.i));
  for (const i of order) {
    if (s.knocksLeft === 0) break;
    const h = s.houses[i];
    L.push(`   tap door ${i + 1} (${h.crape ? 'crape' : 'no crape'}): ${h.name} says: ${h.word === null ? 'could not say' : h.word === 'brown' ? 'Southwark and Vauxhall, I think' : 'the Lambeth, I think'}. A glass is drawn. [Add the silver drops]`);
    const r = M.knock(g, i);
    L.push(`   -> ${r.rec.milky ? 'The glass turned MILKY: Battersea water, from the river inside the town.' : 'The glass stayed CLEAR: Thames Ditton water, from above the town.'}${r.rec.wordWrong ? ' (' + h.name + ' was wrong.)' : ''} Door marked ${r.rec.milky ? 'brown' : 'blue'}. ${s.knocksLeft} knocks left.`);
    L.push(win());
  }
  const sm = M.streetSummary(g, si);
  L.push(`   STREET DONE: on ${sm.name} you knocked at ${sm.tested} doors: ${sm.crapeTried} with crape (${sm.crapeBrown} brown), ${sm.liveTried} without (${sm.liveBrown} brown). [Next street]`);
  M.nextStreet(g);
}
const p = M.current(g);
L.push(`\nSTREET 4 of 4: ${p.name} — ${p.phrase}. Every doorstep is brown or blue. Mark the five doors you think will wear crape by the end of the month.`);
L.push(row(p));
p.houses.filter(h => h.water === 'brown').slice(0, 5).forEach(h => M.mark(g, h.i));
L.push(`   marks placed: ${M.marksPlaced(g)} of ${C.MARKS}. [Come back in a month]`);
const r = M.monthPasses(g);
L.push(row(p));
L.push(`   -> Crape came to ${r.crape} doors: ${r.crapeBrown} brown, ${r.crapeBlue} blue. Of your five marks, ${r.hits} wear crape. [The verdict]`);
const v = M.verdict(g);
L.push(`\nVERDICT (band: ${v.band})\n  SNOW: ${v.snow}\n  YOU: ${v.you}\n  PART: ${v.part}\n  HAD: ${v.had}\n  PARISH: ${v.parish}\n  PREDICTION: ${v.prediction}\n  RESIDENTS: ${v.residents}\n  LATER: ${v.later}`);
L.push(`  truth on the three streets: brown ${v.truth.brownDead} of ${v.truth.brownHouses}, blue ${v.truth.blueDead} of ${v.truth.blueHouses}`);
console.log(L.join('\n')); require('fs').writeFileSync(__dirname + '/loop-log.txt', L.join('\n') + '\n');
