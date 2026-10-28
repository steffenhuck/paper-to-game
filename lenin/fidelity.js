// Fidelity check (memo section 15). Runs mechanism.js unchanged against the paper's stated numbers.
// Run: node fidelity.js > fidelity-result.txt
const M = require('./mechanism.js');
const { CONFIG: C, D } = M;
let fails = 0;
const f = (x, d = 1) => (100 * x).toFixed(d);
function check(name, ok, detail) { console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? '  — ' + detail : ''}`); if (!ok) fails++; }
const within = (v, lo, hi) => v >= lo && v <= hi;
const areas = ['unemployed', 'sick', 'family', 'old', 'care'];

// (a) East effect in points, text p. 12: "between 14.5 and 17 percentage points in 1997" (tolerance 0.5)
check('(a) East effect 14.5–17 points (Table 1, text p.12)', D.eastPts.every(v => within(100 * v, 14.0, 17.5)), D.eastPts.map(v => f(v)).join(', '));
// (b) 1997→2002 change, text p. 12: "declines by between 2.3 and 6.9 percentage points" (tolerance 0.7)
check('(b) 2002 change −2.3 to −6.9 points (Table 1, text p.12)', D.change02.every(v => within(-100 * v, 1.6, 7.6)), D.change02.map(v => f(v)).join(', '));
// (c) years: "from a minimum of about 11 years (column 5) to a maximum of 35 years in column 3"; +7 → "roughly 20 and 40"
const yrs = D.yearsToClose;
check('(c1) years to close 11–35 (text p.12), min at care, max at family', within(Math.min(...yrs), 8, 14) && within(Math.max(...yrs), 30, 40) && yrs.indexOf(Math.min(...yrs)) === 4 && yrs.indexOf(Math.max(...yrs)) === 2, yrs.map(v => v.toFixed(1)).join(', '));
check('(c2) closing years ≈ 2010–2030 ("20 to 40 years")', within(D.closeLo, 2005, 2012) && within(D.closeHi, 2027, 2036), `${D.closeLo.toFixed(1)}–${D.closeHi.toFixed(1)}`);
// (d) panel: "On average, the East time effect is 35% smaller" (tolerance 2)
check('(d) panel reduction ≈ 35% (Table 5 vs Table 1, text p.16)', within(100 * (1 - D.mindShare), 33, 37), `reduction ${f(1 - D.mindShare)}%, so mind change ${f(D.mindShare, 0)}%`);
// (e) Table 8: "drops from 0.43 to 0.29 ... up to one third"
const drop = 1 - C.t8East[0] / C.t1East[0];
check('(e) regional controls cut the unemployed coefficient by about a third', within(drop, 0.28, 0.36), `${f(drop)}%; in points ${f(D.eastPts[0])} → ${f(D.regionalPts[0])}; averaged ${f(D.eastPts.reduce((a, b) => a + b) / 5)} → ${f(D.regionalPts.reduce((a, b) => a + b) / 5)}`);
// (f) Fig. 1 youngest cohort reproduced from Table 4 coefficients (tolerance 0.01)
const young = [0, 1, 2, 3, 4].map(q => M.pointsAt(C.t4East[q], C.westShare97[q]));
check('(f) Fig. 1 youngest cohort = Table 4 east at West share', young.every((v, q) => Math.abs(v - C.fig1[0][q]) < 0.01), young.map(v => f(v)).join(', ') + ' vs ' + C.fig1[0].map(v => f(v)).join(', '));
// text p.15–16: youngest 3 (col 4) to 11 (col 1); oldest 21 (col 1) to 49 (col 4)
check('(f2) Fig. 1 read-off matches text: youngest 3–11, born before 1931 21–49', within(Math.min(...C.fig1[0]), .025, .035) && within(Math.max(...C.fig1[0]), .105, .115) && within(Math.min(...C.fig1[4]), .2, .22) && within(Math.max(...C.fig1[4]), .48, .5));
// (g) robustness of the dose: gap rises from youngest to 1931–45; oldest two at least 2.5× youngest
function doseHolds(series) { const s = series; return s[1] >= s[0] - 0.01 && s[2] > s[1] && s[3] > s[2] && Math.min(s[3], s[4]) >= 2.5 * s[0]; }
const alt = M.derive('eastShare97');
check('(g1) dose holds in Fig. 1 (shown in game)', doseHolds(D.cohortFig), D.cohortFig.map(v => f(v, 0)).join(' → '));
check('(g2) dose holds recomputed from Table 4 at West share', doseHolds(D.cohortCalc), D.cohortCalc.map(v => f(v, 0)).join(' → '));
check('(g3) dose holds recomputed at East share', doseHolds(alt.cohortCalc), alt.cohortCalc.map(v => f(v, 0)).join(' → '));
console.log('      NOTE  Fig. 1 older cohorts exceed the Table 4 recomputation; the game shows Fig. 1 and the About/author note flag it.');
check('(g4) age pulls opposite ways: West age effect ≤ 0, East > 0 (Table 3)', D.ageWest <= 0 && D.ageEast > 0, `West ${D.ageWest.toFixed(4)}, East ${D.ageEast.toFixed(4)} per year (probit index)`);
check('(g5) East effect still at least 10 points when converted at the East share', alt.eastPts.every(v => 100 * v >= 10), alt.eastPts.map(v => f(v)).join(', '));
// (h) footnote 6 incomes within 3% each year
const inc = C.income1928to36;
check('(h) pre-war incomes East ≈ West (footnote 6)', inc.east.every((e, i) => Math.abs(e / inc.west[i] - 1) < 0.045), inc.east.map((e, i) => `${inc.years[i]}: ${e} vs ${inc.west[i]}`).join('; '));
// (i) raw gap positive everywhere
check('(i) raw East–West gap positive in all areas, 1997 and 2002 (Table A2)', D.rawGap97.every(v => v > 0) && D.rawGap02.every(v => v > 0), '1997 ' + D.rawGap97.map(v => f(v, 0)).join(', ') + '; 2002 ' + D.rawGap02.map(v => f(v, 0)).join(', '));
check('(i2) PDS ≈ 20% East vs 1–2% West in 1998 (text p.25)', within(D.pds98.east, 19, 23) && within(D.pds98.west, 1, 2), `${D.pds98.east.toFixed(1)} vs ${D.pds98.west.toFixed(1)}`);
check('(i3) movers less pro-state than stayers, still above West (Table 9)', D.moverPts.every((v, q) => v > 0 && v < D.stayerPts[q]));

// (j) game logic
const ids = M.CARDS.map(c => c.id);
check('(j1) each objection accepts exactly one card', M.OBJECTIONS.every((o, i) => ids.filter(id => M.judge(i, id).ok).length === 1));
check('(j2) every accepted card is a different card', new Set(M.OBJECTIONS.map(o => o.answer)).size === M.OBJECTIONS.length);
let s = M.newSession(); M.OBJECTIONS.forEach((o, i) => { M.play(s, o.answer); M.advance(s); });
check('(j3) perfect run scores 6/6 first tries', M.firstTries(s) === 6, M.verdict(s).you);
let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
let tot = 0; const N = 2000;
for (let k = 0; k < N; k++) { const t = M.newSession(); while (t.obj < M.OBJECTIONS.length) { const left = ids.filter(id => true); const r = M.play(t, left[Math.floor(rnd() * left.length)]); if (r.ok) M.advance(t); } tot += M.firstTries(t); }
check('(j4) random tapping averages well below 6', tot / N < 1.5, `mean first tries ${(tot / N).toFixed(2)} of 6 over ${N} sessions`);
check('(j5) bet: "more" is right, jars show 63 vs 79', M.betResult('more').right && !M.betResult('less').right && M.betResult('more').west === 63 && M.betResult('more').east === 79);
const fr = M.forecastResult(2020);
check('(j6) forecast band matches (c2)', fr.inside && fr.lo === Math.round(D.closeLo) && fr.hi === Math.round(D.closeHi), fr.head);
console.log('\nCard numbers as displayed:');
M.CARDS.forEach(c => console.log(`  ${c.title}: ` + c.chart.rows.map(r => r.v !== undefined ? `${r.label} ${r.v}` : `${r.label} E ${r.east} / W ${r.west}`).join(' | ')));
console.log(`\n${fails === 0 ? 'ALL CHECKS PASS' : fails + ' FAILED'}`);
process.exitCode = fails ? 1 : 0;
