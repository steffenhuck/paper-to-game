// Fidelity check for The More the Better? (statistical level). Runs against mechanism.js, the only copy.
// Run: node fidelity.js > fidelity-result.txt
const M = require('./mechanism.js');
const C = M.CONFIG;
let fails = 0; const check = (ok, label) => { console.log(`  [${ok ? 'PASS' : 'FAIL'}] ${label}`); if (!ok) fails++; };
const ids = Object.keys(C.measures);
const f2 = v => v.toFixed(2);

console.log('(a) Values on the 1–7 scale, inside each Fig. 5 panel\'s own axis window, first band highest');
for (const id of ids) {
  const m = C.measures[id], v = m.values;
  const inScale = v.every(x => x >= 1 && x <= 7), inAxis = v.every(x => x >= m.axis[0] && x <= m.axis[1]);
  const firstHighest = v.slice(1).every(x => x < v[0]);
  check(inScale && inAxis && firstHighest, `${m.paperName.padEnd(44)} ${v.map(f2).join(' ')}  axis ${m.axis.join('–')}`);
}

console.log('\n(b) The text\'s classification (pp. 210–11): integrity and job involvement fall uninterrupted; the other four have a tipping point past 40%');
for (const id of ids) {
  const v = C.measures[id].values, noRec = C.paperSaysNoRecovery.includes(id);
  const monotone = v.slice(1).every((x, i) => x <= v[i] + 1e-9);
  const minAt = v.indexOf(Math.min(...v));
  const tipping = (minAt === 2 || minAt === 3) && v[4] > v[minAt];
  const risesInto5 = v[4] > v[3];
  check(noRec ? monotone : (tipping && risesInto5),
    `${id.padEnd(14)} ${noRec ? 'monotone non-increasing' : `minimum in band ${minAt + 1} (${C.bands[minAt].label}), rises into band 5`}`);
}

console.log('\n(c) The classifier agrees with the text for every dead zone 0.1–0.3, and under the segment-sign rule with no dead zone');
let agreeAll = true;
for (let tol = 0.1; tol <= 0.3001; tol += 0.05) {
  for (const id of ids) {
    const s = M.classifyShape(C.measures[id].values, tol), noRec = C.paperSaysNoRecovery.includes(id);
    if (!(s.falls && s.recovers === !noRec)) { agreeAll = false; console.log(`    disagreement at tol ${tol.toFixed(2)}: ${id} ${JSON.stringify(s)}`); }
  }
}
check(agreeAll, 'dead zones 0.10, 0.15, 0.20, 0.25, 0.30: all six fall at first; exactly integrity and involvement do not recover');
let segOk = true;
for (const id of ids) {
  const s = M.classifyBySegments(C.measures[id].values), noRec = C.paperSaysNoRecovery.includes(id);
  if (!(s.falls && s.recovers === !noRec)) segOk = false;
}
check(segOk, 'segment-sign rule: same four recover, same two do not');

console.log('\n(d) Scoring: the discovery comes from the curves, not from the rule');
const line = (id, slope) => { const v0 = C.measures[id].values[0]; return [0, 1, 2, 3, 4].map(i => v0 + slope * i); };
let ownOk = true, flatOk = true, riseOk = true, fallOk = true;
for (const id of ids) {
  const own = M.scoreDrawing(id, C.measures[id].values.slice());
  if (!(own.miss === 0 && own.shapeRight)) ownOk = false;
  if (M.scoreDrawing(id, line(id, 0)).shapeRight) flatOk = false;
  if (M.scoreDrawing(id, line(id, 0.3)).shapeRight) riseOk = false;
  const fall = M.scoreDrawing(id, line(id, -0.3)).shapeRight;
  if (fall !== C.paperSaysNoRecovery.includes(id)) fallOk = false;
}
check(ownOk, 'drawing the paper\'s own line: miss 0.0 and shape right on all six');
check(flatOk, 'a flat line ("nothing changes"): shape wrong on all six');
check(riseOk, 'a straight rise ("the more the better"): shape wrong on all six');
check(fallOk, 'a straight fall ("the more the worse"): shape right only on integrity and involvement');
const r = M.scoreDrawing('relationships', [5.3, 5.4, 5.6, 5.7, 5.8]);
check(Math.abs(r.miss - 1.0) < 1e-9 && r.yours.rises && !r.shapeRight, `walkthrough example (gentle rise on relationships): miss ${r.miss.toFixed(1)}, ${r.verdict}`);
const lvl = M.classifyShape([5.3, 5.4, 5.5, 5.4, 5.5]);
check(!lvl.falls && !lvl.rises && !lvl.recovers, 'a wobble within the dead zone reads as level (5.5 − 5.3 is exactly the dead zone, not over it)');
check(M.sessionVerdict([r, M.scoreDrawing('security', C.measures.security.values)]).right === 1, 'session verdict counts shapes right');

console.log('\n(e) The opener, from the table on p. 209 and the medians on p. 207');
const o = M.openerAnswer();
check(o.answer === 'regional', `regional share exceeds major share in all four countries: ${o.rows.map(x => `${x.country} ${x.major}/${x.regional}`).join('; ')}`);
check(C.medianShare['United States'] === 36 && C.medianShare['United Kingdom'] === 30 && C.medianShare['Germany'] === 16, 'medians: US 36, UK 30, Germany 16');
check(C.sampleMedian === 21 && C.sampleRange[0] === 2 && C.sampleRange[1] === 59 && C.orchestras === 78, 'sample: 78 orchestras, median 21%, range 2–59%');
check(C.rounds.concat(C.replayRounds).every(id => ids.includes(id)) && new Set(C.rounds.concat(C.replayRounds)).size === 6, 'the six measures are played exactly once across the two sets');

console.log(`\n${fails === 0 ? 'ALL CHECKS PASSED' : fails + ' CHECK(S) FAILED'}`);
process.exit(fails ? 1 : 0);
