// The play loop on placeholder graphics (build.md §4.2): drives mechanism.js headless and prints, after every test,
// what changed and where the player stands. Strategy: the walkthrough's (two inland crape doors, one riverside house,
// then a middle-street crape house and its neighbour, then the other middle street).
const M = require('./mechanism.js'); const C = M.CONFIG;
const seed = Number(process.argv[2] || 7);
const g = M.makeMap(seed); const L = [];
const map = () => { let t = ''; for (let r = C.ROWS.length - 1; r >= 0; r--) { const hs = g.rows[r]; t += '   ' + C.ROWS[r].name.padEnd(15) + hs.map(h => (h.crape ? 'X' : '.') + (h.tested ? (h.water === 'brown' ? 'B' : 'U') : '-')).join(' ') + '   ' + JSON.stringify(M.rowTally(g, r)).replace(/"/g, '') + '\n'; } return t + '   ~~~~~ the river ~~~~~\n'; };
L.push(`SEED ${seed}. AIM: Find out what does it, the water or the side of town: test houses so that the doctor cannot say "that is just the inland air".`);
L.push(map()); L.push('DOCTOR: ' + M.doctor(g));
const doTest = (r, i) => { const h = g.rows[r][i]; L.push(`TEST ${C.ROWS[r].name} no. ${i + 1} (${h.crape ? 'crape' : 'no crape'}) [Add the silver drops]`); const res = M.test(g, r, i); L.push(`   -> ${res.milky ? 'MILKY: Battersea water' : 'CLEAR: Thames Ditton water'}. ${C.ROWS[r].name}: ` + JSON.stringify(res.rowTally).replace(/"/g, '')); L.push('   LINE: ' + M.line(g)); L.push('   DOCTOR: ' + M.doctor(g)); L.push('   tests left ' + g.tests); };
const inlandCrape = [].concat.apply([], g.rows).filter(h => h.crape && M.isInland(h.r));
inlandCrape.slice(0, 2).forEach(h => doTest(h.r, h.i));
doTest(0, 2);
const midCrape = [].concat.apply([], g.rows).filter(h => h.crape && C.ROWS[h.r].side === 'middle');
if (midCrape.length) { const h = midCrape[0]; doTest(h.r, h.i); const j = h.i > 0 ? h.i - 1 : h.i + 1; doTest(h.r, j); }
const other = midCrape.length ? (midCrape[0].r === 2 ? 3 : 2) : 2;
for (let i = 0; i < 6 && g.tests > 0; i++) if (!g.rows[other][i].tested) doTest(other, i);
L.push(map());
M.writeSentence(g, 'water'); const v = M.verdict(g);
L.push(`VERDICT (${v.band})\n  SNOW: ${v.snow}\n  YOU: ${v.you}\n  PART: ${v.part}\n  SIDE: ${v.sideLine}\n  HAD: ${v.had}`);
console.log(L.join('\n')); require('fs').writeFileSync(__dirname + '/loop-log.txt', L.join('\n') + '\n');
