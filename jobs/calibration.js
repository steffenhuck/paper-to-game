// Calibration check for One Number, Please. Runs mechanism.js in Node against the paper's reported numbers (the price
// apparatus) and against the literature as the paper cites it (the sums apparatus), then checks that the central
// discovery survives alternative decompositions of the sums gap. Run: node calibration.js  (writes calibration-result.txt)
const M = require('./mechanism.js');
const C = M.CONFIG;
const out = [];
let pass = 0, fail = 0;
function check(name, value, lo, hi, source) {
  const ok = value >= lo && value <= hi;
  ok ? pass++ : fail++;
  out.push((ok ? 'PASS' : 'FAIL') + '  ' + name + ': ' + (typeof value === 'number' ? value.toFixed(2) : value) + '  [' + lo + ', ' + hi + ']  ' + source);
}
function cellStats(task, prizes, n, seed0) {
  const acc = { idxM: 0, idxW: 0, topsM: 0, topsW: 0, earnM: 0, earnW: 0, topE: 0, midE: 0, gaps: {} };
  for (let s = 0; s < n; s++) {
    const r = M.runSession(task, prizes, seed0 + s * 7919);
    acc.idxM += r.idx.men; acc.idxW += r.idx.women; acc.topsM += r.tops.men; acc.topsW += r.tops.women;
    acc.earnM += r.earn.men; acc.earnW += r.earn.women; acc.topE += r.topEarn; acc.midE += r.midEarn || 0;
    acc.gaps[r.gap] = (acc.gaps[r.gap] || 0) + 1;
  }
  for (const k of Object.keys(acc)) if (k !== 'gaps') acc[k] /= n;
  for (const k of Object.keys(acc.gaps)) acc.gaps[k] /= n;
  return acc;
}
function bidDevStats(prizes, n) {   // mean deviation of bids from the benchmark, by position and gender
  const rng = M.makeRng(2026), P = C.prizes[prizes];
  const acc = { TM: 0, TW: 0, MM: 0, MW: 0 }, cnt = { TM: 0, TW: 0, MM: 0, MW: 0 };
  for (let i = 0; i < n; i++) {
    const g = M.drawGroup(rng);
    g.forEach(s => {
      const b = M.bidsFor(s, prizes, rng), k = s.gender === 'men' ? 'M' : 'W';
      acc['T' + k] += b.top - (P.T - P.U); cnt['T' + k]++;
      if (b.mid !== null) { acc['M' + k] += b.mid - (P.M - P.U); cnt['M' + k]++; }
    });
  }
  return { TM: acc.TM / cnt.TM, TW: acc.TW / cnt.TW, MM: acc.MM / cnt.MM, MW: acc.MW / cnt.MW };
}
function beliefStats(n) {
  const rng = M.makeRng(7); let bm = 0, bw = 0, em = 0, ew = 0, cnt = 0;
  for (let i = 0; i < n; i++) {
    const g = M.drawGroup(rng);
    g.forEach(s => { const b = M.beliefs(s).best > 0.5, e = M.choosesContest(s, 'one'); if (s.gender === 'men') { bm += b; em += e; } else { bw += b; ew += e; } });
    cnt += C.menPerGroup;
  }
  return { bestMen: bm / cnt, bestWomen: bw / cnt, entryMen: em / cnt, entryWomen: ew / cnt };
}

const N = 3000;
out.push('One Number, Please: calibration check, ' + new Date().toISOString().slice(0, 10) + ', ' + N + ' sessions per cell');
out.push('');
out.push('--- The price apparatus (the paper\'s design, phase 1 rules): RECONSTRUCTED ---');
const dF = bidDevStats('flat', 20000), dS = bidDevStats('steep', 20000);
check('mean bid deviation, top, flat, men', dF.TM, -46, -34, 'read off Fig. 4 TF phase 1 (about -40)');
check('mean bid deviation, top, flat, women', dF.TW, -33, -21, 'Fig. 4 TF; Table 1 Female +13.99* (10% level)');
check('women minus men, top, flat', dF.TW - dF.TM, 9, 19, 'Table 1, NormBidTF, Female 13.99');
check('mean bid deviation, top, steep, men', dS.TM, -53, -41, 'read off Fig. 4 TS phase 1 (about -47)');
check('women minus men, top, steep', dS.TW - dS.TM, 3, 13, 'Table 1, NormBidTS, Female 8.44 (n.s.)');
check('mean bid deviation, middle, flat (all)', (dF.MM + dF.MW) / 2, -14, -2, 'read off Fig. 4 MF phase 1 (about -8); Sect. 4.1 "close to the prediction"');
check('mean bid deviation, middle, steep (all)', (dS.MM + dS.MW) / 2, -1, 11, 'read off Fig. 4 MS phase 1 (about +5); Sect. 4.1 "slight over bidding"');
const pf = cellStats('price', 'flat', N, 11), ps = cellStats('price', 'steep', N, 13), po = cellStats('price', 'one', N, 17);
check('women\'s share of top jobs, flat', pf.topsW / C.groupsPerSession, 0.52, 0.62, 'Fig. 5 TF phase 1: 52% actual vs 44% expected (+8); here expected is 50%');
check('women\'s share of top jobs, steep', ps.topsW / C.groupsPerSession, 0.49, 0.58, 'Fig. 5 TS phase 1: 47% actual vs 44% expected (+3); Table 2 Female 0.363* (phase 1, 10%)');
check('earnings of the top job, flat', pf.topE, 50, 75, 'read off Fig. 8 phase 1 TF (about 60) and Fig. 10 TF periods 2-4 (about 55)');
check('earnings of a middle job, flat', pf.midE, 90, 112, 'read off Fig. 8 phase 1 MF (about 100)');
check('earnings of the top job, steep', ps.topE, 50, 75, 'read off Fig. 8 phase 1 TS (about 58) and Fig. 10 TS periods 2-4 (about 60)');
check('earnings of a middle job, steep', ps.midE, 75, 97, 'read off Fig. 8 phase 1 MS (about 84)');
check('middle pays more than top, flat', pf.midE - pf.topE, 20, 60, 'Sect. 4.3: "earnings appear to be much higher in the middle than in the top"; Table 3 model 2: MF 35.4 vs TF 3.5');
check('middle pays more than top, steep', ps.midE - ps.topE, 8, 45, 'Table 3 model 2: MS 28.5 vs TS 5.2');
check('gender difference in earnings, flat (men minus women)', pf.earnM - pf.earnW, -6, 6, 'Table 3: Female -2.0 (n.s.)');
check('gender difference in earnings, steep (men minus women)', ps.earnM - ps.earnW, -6, 6, 'Table 3: Female -2.0 (n.s.)');
check('one-session verdict "about the same" or "women a little higher", flat', (pf.gaps.same || 0) + (pf.gaps['women+'] || 0) + (pf.gaps['women++'] || 0), 0.8, 1.0, 'Sect. 4.1: no significant differences, women somewhat higher for TF');
check('one-session verdict "about the same", steep', (ps.gaps.same || 0) + (ps.gaps['women+'] || 0) + (ps.gaps['men+'] || 0), 0.9, 1.0, 'Sect. 4.1: none of the other differences significant');
out.push('');
out.push('--- The one-job price cell: TOY (a second-price auction for one job) ---');
check('men minus women, one-job price index', po.idxM - po.idxW, -3, 3, 'Chen, Katuščák & Ozdenoren 2013 as cited in Sect. 2: no gender difference in second-price bidding');
out.push('');
out.push('--- The sums apparatus: RECONSTRUCTED FROM THE LITERATURE the paper cites (Niederle & Vesterlund 2007) ---');
const b = beliefStats(20000);
check('men who believe they are the best of four', b.bestMen, C.targets.bestMen - 0.05, C.targets.bestMen + 0.05, 'NV 2007 (75%), as described in Sect. 1-2');
check('women who believe they are the best of four', b.bestWomen, C.targets.bestWomen - 0.05, C.targets.bestWomen + 0.05, 'NV 2007 (43%)');
check('men who choose the contest (one winner)', b.entryMen, C.targets.entryMen - 0.05, C.targets.entryMen + 0.05, 'NV 2007 (73%)');
check('women who choose the contest (one winner)', b.entryWomen, C.targets.entryWomen - 0.05, C.targets.entryWomen + 0.05, 'NV 2007 (35%)');
const so = cellStats('sums', 'one', N, 19), sf = cellStats('sums', 'flat', N, 23), ss = cellStats('sums', 'steep', N, 29);
check('one-session verdict "men about twice as often" or "clearly more", sums one winner', (so.gaps.men2x || 0) + (so.gaps['men++'] || 0), 0.85, 1.0, 'NV 2007: the gap is large and robust');
check('women earn at least as much as men, sums one winner (men minus women)', so.earnM - so.earnW, -20, 2, 'NV 2007 as cited: men enter too much, women too little; over-entry does not pay');
check('men\'s share of top jobs, sums one winner', so.topsM / (so.topsM + so.topsW), 0.58, 0.72, 'follows from entry: more men enter, more men win (no gender difference in performance, NV 2007)');
out.push('');
out.push('--- The crossed cells (sums with a ladder): TOY, the paper never ran them ---');
check('the gap is still there with a flat ladder (men minus women, points)', sf.idxM - sf.idxW, 15, 50, 'our model: a ladder dilutes the gamble a little; the view of one\'s own rank still decides');
check('the gap is still there with a steep ladder (men minus women, points)', ss.idxM - ss.idxW, 15, 50, 'our model');
out.push('');
out.push('--- The central discovery: a gap wherever competing means sums, none wherever it means a price ---');
check('gap, sums one winner (men minus women, points)', so.idxM - so.idxW, 25, 55, 'NV 2007: 73 vs 35');
check('gap, price flat (men minus women, points)', pf.idxM - pf.idxW, -8, 2, 'Fig. 4, Table 1: none; women a little higher at the top');
check('gap, price steep (men minus women, points)', ps.idxM - ps.idxW, -6, 2, 'Fig. 4, Table 1: none');
out.push('');
out.push('--- Robustness: does the discovery survive other decompositions of the sums gap? (build.md, section 1) ---');
const saved = JSON.parse(JSON.stringify({ confidence: C.confidence, gambleAversion: C.gambleAversion }));
function altRun(label) {
  const o = cellStats('sums', 'one', 1000, 31), f = cellStats('sums', 'flat', 1000, 37), p = cellStats('price', 'flat', 1000, 41);
  out.push('  ' + label + ': sums one winner gap ' + (o.idxM - o.idxW).toFixed(1) + '; sums flat ladder gap ' + (f.idxM - f.idxW).toFixed(1) + '; price flat gap ' + (p.idxM - p.idxW).toFixed(1));
  return { o, f, p };
}
// (a) all confidence: no gender difference in gamble aversion, confidence widened to hold the entry gap
C.gambleAversion = { men: 0.65, women: 0.65 }; C.confidence = { men: 2.1, women: 0.3 };
const A = altRun('(a) all confidence, no risk difference');
check('(a) sums gap survives', A.o.idxM - A.o.idxW, 20, 60, 'alternative decomposition');
check('(a) price gap still absent', A.p.idxM - A.p.idxW, -8, 2, 'the price apparatus loads on neither trait by construction');
// (b) all risk: no gender difference in confidence, aversion widened
C.confidence = { men: 1.3, women: 1.3 }; C.gambleAversion = { men: 0.2, women: 1.4 };
const B = altRun('(b) all risk, no confidence difference');
check('(b) sums gap survives', B.o.idxM - B.o.idxW, 20, 60, 'alternative decomposition');
check('(b) price gap still absent', B.p.idxM - B.p.idxW, -8, 2, 'by construction');
C.confidence = saved.confidence; C.gambleAversion = saved.gambleAversion;
out.push('  Under (a) the ladder cells shrink the gap less; under (b) more (a ladder is a smaller gamble). The direction of the');
out.push('  crossed cells is the one thing that depends on the decomposition; the game\'s central contrast does not.');
out.push('');
out.push('--- The draw (build.md, section 3): shape over seeds ---');
let worst = 0, flips = 0;
for (let s = 1; s <= 500; s++) { const r = M.runSession('sums', 'one', s); if (r.gap === 'same' || r.gap.startsWith('women')) worst++; const q = M.runSession('price', 'flat', s); if (q.gap === 'men++' || q.gap === 'men2x') flips++; }
check('share of sums-one-winner sessions that fail to show the gap (noise)', worst / 500, 0, 0.08, 'our choice: a session of 24 is noisy, but not often misleading');
check('share of price-flat sessions that show the men clearly higher (noise)', flips / 500, 0, 0.05, 'our choice');
out.push('');
out.push('--- Verdict logic ---');
const nb = [M.runSession('sums', 'one', 1), M.runSession('sums', 'one', 2), M.runSession('price', 'flat', 3), M.runSession('price', 'steep', 4)];
check('both columns run: "depends" is backed', M.verdict(nb, 'depends').backed ? 1 : 0, 1, 1, 'design');
check('both columns run: "less" is not backed', M.verdict(nb, 'less').backed ? 1 : 0, 0, 0, 'design');
const nbL = [M.runSession('sums', 'one', 1), M.runSession('sums', 'steep', 2)];
check('sums only: "less" is backed', M.verdict(nbL, 'less').backed ? 1 : 0, 1, 1, 'design');
check('sums only: "depends" is not backed', M.verdict(nbL, 'depends').backed ? 1 : 0, 0, 0, 'design');
const nbR = [M.runSession('price', 'flat', 5), M.runSession('price', 'one', 6)];
check('price only: "same" is backed', M.verdict(nbR, 'same').backed ? 1 : 0, 1, 1, 'design');
out.push('');
out.push(pass + ' passed, ' + fail + ' failed');
require('fs').writeFileSync(__dirname + '/calibration-result.txt', out.join('\n') + '\n');
console.log(out.join('\n'));
process.exit(fail ? 1 : 0);
