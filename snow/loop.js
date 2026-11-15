// The play loop on placeholder graphics (build.md §4.2): drives mechanism.js headless and prints, after every glass,
// what changed and where the player stands. Strategy: a stranger's (an inland crape door, a riverside house, then the
// anchor-and-hunt plan once the doctor has said why those two tell nothing), stopping at the concession.
const M = require('./mechanism.js'); const C = M.CONFIG;
const seed = Number(process.argv[2] || 7);
const g = M.makeMap(seed); const L = [];
const map = () => { let t = ''; for (let r = C.ROWS.length - 1; r >= 0; r--) { const hs = g.rows[r]; t += '   ' + C.ROWS[r].name.padEnd(15) + hs.map(h => (h.crape ? 'X' : '.') + (h.tested ? (h.water === 'brown' ? 'B' : 'U') : '-')).join(' ') + '   ' + JSON.stringify(M.rowTally(g, r)).replace(/"/g, '') + '\n'; } return t + '   ~~~~~ the river ~~~~~\n'; };
L.push(`SEED ${seed}. AIM: Make the water stand alone: test houses so that the doctor cannot say "that is just the inland air", with as few glasses as you can.`);
L.push(map()); L.push('DOCTOR: ' + M.doctor(g));
const doTest = (r, i) => { const h = g.rows[r][i]; L.push(`GLASS ${g.used + 1}: ${C.ROWS[r].name} no. ${i + 1} (${h.crape ? 'crape' : 'no crape'}) [Add the silver drops]`); const res = M.test(g, r, i); L.push(`   -> ${res.milky ? 'MILKY: Battersea water' : 'CLEAR: Thames Ditton water'}. ${C.ROWS[r].name}: ` + JSON.stringify(res.rowTally).replace(/"/g, '') + (res.conceded ? '   *** THE DOCTOR CONCEDES ***' : '')); L.push('   LINE: ' + M.line(g)); L.push('   DOCTOR: ' + M.doctor(g)); };
const inlandCrape = [].concat.apply([], g.rows).filter(h => h.crape && M.isInland(h.r));
doTest(inlandCrape[0].r, inlandCrape[0].i);
doTest(0, 2);
const rng = M.makeRng(99);
while (g.concededAt === null && g.tests > 0) { const h = M.STRATEGIES.anchorHunt(g, rng); doTest(h.r, h.i); }
L.push(map());
M.writeSentence(g, 'water'); const v = M.verdict(g);
L.push(`VERDICT (${v.band})\n  HEAD: ${v.head}\n  IDENT: ${v.ident}\n  SENTENCE: ${v.sentenceLine}\n  SPEED: ${v.speed}\n  HAD: ${v.had}`);
console.log(L.join('\n')); require('fs').writeFileSync(__dirname + '/loop-log.txt', L.join('\n') + '\n');
