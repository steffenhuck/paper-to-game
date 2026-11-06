// Calibration check (build step 1), iteration 2: runs against mechanism.js, the file build.py inlines into the game.
// Run: node calibration.js > calibration-result.txt
const fs = require('fs');
const M = require('./mechanism.js');
const C = M.CONFIG;
let fails = 0;
const ok = (cond, msg) => { console.log((cond ? 'PASS ' : 'FAIL ') + msg); if (!cond) fails++; };
const f = (x, d = 2) => x.toFixed(d);
const P = s => M.parseJudges(s, 'x');
const key = j => j.p + '/' + j.w;

console.log('== 1. Data');
const fileCSV = fs.readFileSync(__dirname + '/applicant_country_citizenship.csv', 'utf8').trim();
ok(C.applicantCSV.trim() === fileCSV, 'embedded applicant data is identical to applicant_country_citizenship.csv');
ok(M.APPLICANTS.length === fileCSV.split('\n').length - 1, `all ${M.APPLICANTS.length} applicant rows kept`);
ok(M.APPLICANTS.every(a => a.p && a.w && C.names[a.p] && C.people[a.p] && C.names[a.w]), 'every applicant country and passport has a code, a name and an adjective');
const tot = M.APPLICANTS.reduce((s, a) => s + a.s, 0);
ok(Math.abs(tot - 1) < 1e-9, `applicant shares sum to ${f(tot, 6)}`);
const panelRows = fs.readFileSync(__dirname + '/panel_member_country_citizenship.csv', 'utf8').trim().split('\n').slice(1)
  .map(l => { const [c, p, s] = l.split(','); return { w: C.codes[c], p: C.codes[p], s: +s }; });
ok(panelRows.every(r => r.p && r.w && C.names[r.p] && C.people[r.p]), `all ${panelRows.length} panel-member rows map to codes`);

console.log('\n== 2. Token rule');
ok(C.tokens.both === 3 && C.tokens.one === 1 && C.tokens.none === 0, 'tokens: both match 3, one match 1, no match 0');
ok(M.tokensFor(M.matchType({ p: 'DE', w: 'UK' }, { p: 'DE', w: 'UK' })) === 3 && M.tokensFor(M.matchType({ p: 'DE', w: 'UK' }, { p: 'DE', w: 'FR' })) === 1 &&
  M.tokensFor(M.matchType({ p: 'DE', w: 'UK' }, { p: 'IT', w: 'UK' })) === 1 && M.tokensFor(M.matchType({ p: 'DE', w: 'UK' }, { p: 'UK', w: 'DE' })) === 0,
  'German in the UK: 3 from a German in the UK, 1 from a German in France, 1 from an Italian in the UK, 0 from a Brit in Germany');
ok(M.matchType({ p: 'DE', w: 'FR' }, { p: 'FR', w: 'DE' }) === null, '"same" means the same named country, not two Big Five countries');

console.log('\n== 3. The four applicant-group bars');
const tilted = P(C.tilted), te = M.evaluate(tilted);
const c = te.cells;
ok(M.CELLS.every(k => c[k].weight > 0) && Math.abs(M.CELLS.reduce((s, k) => s + c[k].weight, 0) - 1) < 1e-9,
  'the four groups partition the applicants: ' + M.CELLS.map(k => `${k} ${f(100 * c[k].weight, 1)}%`).join(', '));
const wavg = (a, b) => (c[a].tokens * c[a].weight + c[b].tokens * c[b].weight) / (c[a].weight + c[b].weight);
ok(Math.abs(wavg('bigP_bigW', 'othP_bigW') - te.big.tokens) < 1e-9 && Math.abs(wavg('bigP_othW', 'othP_othW') - te.other.tokens) < 1e-9,
  `share-weighted bars reproduce the success measure (works in Big Five ${f(te.big.tokens)}, elsewhere ${f(te.other.tokens)})`);
// by hand, for one applicant: a German working in Germany facing the tilted panel
const hand = 4.2 * (3 + 3 + 1 /* DE/CH passport */) / 15;
const deDe = M.APPLICANTS.find(a => a.p === 'DE' && a.w === 'DE');
const one = M.evaluate(tilted, { applicants: [deDe] }).big.tokens;
ok(Math.abs(one - hand) < 1e-9, `by hand: a German in Germany meets 2 German home judges and 1 German working in Switzerland: 4.2 × 7 / 15 = ${f(hand)} = ${f(one)}`);
for (const seed of [1, 2]) {
  const s = M.simulate(tilted, 200000, seed);
  ok(Math.abs(s.big - te.big.tokens) / te.big.tokens < 0.03 && Math.abs(s.other - te.other.tokens) / te.other.tokens < 0.05,
    `seed ${seed}: simulated random juries ${f(s.big)} / ${f(s.other)} vs expected ${f(te.big.tokens)} / ${f(te.other.tokens)}`);
}

console.log('\n== 4. Rosters, guided by the panel-member file');
const inPanelFile = j => panelRows.some(r => r.p === j.p && r.w === j.w);
const pool = P(C.pool), bench = P(C.bench);
ok([...pool, ...tilted, ...bench].every(inPanelFile), 'every roster judge is a passport/work combination that occurs in the panel-member file');
const top6 = panelRows.slice().sort((a, b) => b.s - a.s).slice(0, 6).map(key);
console.log(`     panel-member file, six largest combinations: ${top6.join(', ')}`);
const count = (list, k) => list.filter(j => key(j) === k).length;
ok(C.bigFive.every(b => count(pool, b + '/' + b) === 2), 'pool: each Big Five home combination appears twice');
const smaller = pool.filter(j => !M.isBig(j.p) && !M.isBig(j.w));
ok(smaller.every(j => count(pool, key(j)) === 1) && smaller.length >= 10, `pool: ${smaller.length} judges from smaller countries, one each`);
ok(pool.length === 24 && tilted.length === 15 && bench.length === 10, 'pool 24, panel 15, bench 10');
const bigHomePool = pool.filter(j => j.p === j.w && M.isBig(j.w)).length;
ok(bigHomePool - (24 - 15) <= 1, `a Round 1 player must seat at least ${Math.max(0, bigHomePool - 9)} Big Five home judge(s), so a balanced panel is possible`);
const mirror = P('DE/DE DE/DE IT/IT IT/IT UK/UK UK/UK FR/FR ES/ES US/US NL/NL BE/BE SE/SE DE/CH IT/UK PL/PL');
const balanced = P('DE/DE US/US NL/NL BE/BE SE/SE PL/PL IL/IL DK/DK FI/FI PT/PT CZ/CZ GR/GR AT/AT DE/CH IT/UK');
const em = M.evaluate(mirror), eb = M.evaluate(balanced);
ok(em.gap > 0.8, `Round 1, a panel that mirrors the panel-member file: works in Big Five ${f(em.big.tokens)}, elsewhere ${f(em.other.tokens)} (tilted)`);
ok(Math.abs(eb.gap) < Math.abs(em.gap) / 2, `Round 1, a balanced panel from the same pool: ${f(eb.big.tokens)} vs ${f(eb.other.tokens)} (gap ${f(eb.gap)})`);

console.log('\n== 5. Round 2: the GAP meter and the four-swap puzzle');
const comb = (a, k) => k === 0 ? [[]] : a.flatMap((x, i) => comb(a.slice(i + 1), k - 1).map(r => [x].concat(r)));
const apply = (outs, ins, o) => { const t = tilted.slice(); outs.forEach((i, k) => { t[i] = bench[ins[k]]; }); return M.evaluate(t, o); };
function rate(k, outSet, o, tol) {
  let n = 0, l = 0;
  for (const outs of comb(outSet || tilted.map((_, i) => i), k)) for (const ins of comb(bench.map((_, i) => i), k)) { n++; if (Math.abs(apply(outs, ins, o).gap) <= tol) l++; }
  return [l, n];
}
ok(!te.level && te.gap > 3 * C.levelTol, `the starting panel is tilted: gap ${f(te.gap)} tokens, LEVEL zone ±${C.levelTol}`);
const [l1] = rate(1, null, {}, C.levelTol), [l2] = rate(2, null, {}, C.levelTol), [l4, n4] = rate(4, null, {}, C.levelTol);
ok(l1 === 0 && l2 === 0, 'no plan of 1 or 2 swaps reaches LEVEL');
ok(l4 > 0, `${l4} of ${n4} four-swap plans reach LEVEL (${f(100 * l4 / n4, 1)}%; at least one solution exists)`);
const bigHomeIdx = tilted.map((j, i) => i).filter(i => tilted[i].p === tilted[i].w && M.isBig(tilted[i].w));
const smallIdx = tilted.map((j, i) => i).filter(i => !M.isBig(tilted[i].p) && !M.isBig(tilted[i].w));
const [lh, nh] = rate(4, bigHomeIdx, {}, C.levelTol), [ls] = rate(4, smallIdx, {}, C.levelTol);
ok(lh / nh > 0.5, `plans that bench four Big Five home judges: ${lh}/${nh} reach LEVEL (${f(100 * lh / nh, 0)}%)`);
ok(ls === 0, 'plans that only bench judges from smaller countries never reach LEVEL');
let shown = 0;
for (const outs of comb(bigHomeIdx, 4)) for (const ins of comb(bench.map((_, i) => i), 4)) {
  const e = apply(outs, ins, {}); if (e.level && shown < 1) { shown++; console.log(`     e.g. ${outs.map((o, k) => key(tilted[o]) + '->' + key(bench[ins[k]])).join(', ')}: ${f(e.big.tokens)} vs ${f(e.other.tokens)}`); }
}
ok(Math.abs(te.gap) < C.gapMax, `the meter's range (±${C.gapMax}) holds the starting gap`);

console.log('\n== 6. Robustness: the paper\'s own relative sizes instead of 3 / 1 / 0, and exactly 4 judges');
for (const [name, o] of [['paper relative sizes (3 / 1.37 / 1.02)', { rule: C.tokensPaper }], ['exactly 4 judges per applicant', { reviewers: 4 }]]) {
  const e0 = M.evaluate(tilted, o), em2 = M.evaluate(mirror, o), eb2 = M.evaluate(balanced, o);
  const tol = C.levelTol * e0.gap / te.gap; // the target scales with the starting gap under this variant
  const [v1] = rate(1, null, o, tol), [vh, vn] = rate(4, bigHomeIdx, o, tol);
  ok(em2.gap > 0 && Math.abs(eb2.gap) < Math.abs(em2.gap) / 2 && v1 === 0 && vh > 0,
    `${name}: mirror gap ${f(em2.gap)}, balanced ${f(eb2.gap)}, start ${f(e0.gap)}, 1-swap levels ${v1}, big-home four-swap plans level ${f(100 * vh / vn, 0)}%`);
}

console.log(`\n${fails ? 'FAILURES: ' + fails : 'ALL PASS'}`);
process.exitCode = fails ? 1 : 0;
