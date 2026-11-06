// Calibration check for Leavitt's Cloud: runs mechanism.js headless against the circular's own numbers.
const M = require('./mechanism.js');
const C = M.CONFIG;
let fails = 0, out = [];
function check(name, ok, detail) { out.push((ok ? 'PASS ' : 'FAIL ') + name + (detail ? '  — ' + detail : '')); if (!ok) fails++; }
const S = M.allStars();

// 1. the slope, from the transcribed table
check('25 stars transcribed', S.length === 25);
const T = M.tableLines();
const sMax = -T.max.b, sMin = -T.min.b; // magnitudes per decade of period (positive: longer = brighter)
check('LSQ slope of maxima on log P within ±0.25 of 1/0.48', Math.abs(sMax - 1 / C.SLOPE_LOGP_PER_MAG) < 0.25, sMax.toFixed(3) + ' mag/dex → ' + (1 / sMax).toFixed(3) + ' in log P per mag');
check('LSQ slope of minima on log P within ±0.25 of 1/0.48', Math.abs(sMin - 1 / C.SLOPE_LOGP_PER_MAG) < 0.25, sMin.toFixed(3) + ' mag/dex → ' + (1 / sMin).toFixed(3));
const H = M.herLines();
check('her lines (from printed residuals) give about 0.48', Math.abs(-1 / H.max.b - 0.48) < 0.04 && Math.abs(-1 / H.min.b - 0.48) < 0.06, 'max ' + (-1 / H.max.b).toFixed(3) + ', min ' + (-1 / H.min.b).toFixed(3));

// 2. printed residuals re-derived (misread-digit check)
let worstM = 0, worstm = 0, who = '';
S.forEach(s => {
  const x = Math.log10(s.period);
  const rM = s.max - (H.max.a + H.max.b * x), rm = s.min - (H.min.a + H.min.b * x);
  const dM = Math.abs(rM - s.resM), dm = Math.abs(rm - s.resm);
  if (dM > worstM) { worstM = dM; who = 'M at ' + s.h; }
  if (dm > worstm) { worstm = dm; who += ', m at ' + s.h; }
});
check('printed Res. M reproduced within 0.25', worstM < 0.25, 'worst ' + worstM.toFixed(3));
// Harvard 1374: printed Res. m is -0.3, but its own min (15.2, clearly legible) sits +0.3 off the line: a slip in the
// 1912 table, not in our transcription (every other Res. m agrees). Checked excluding it, and the slip reported.
let worstm2 = 0; S.forEach(s => { if (s.h === 1374) return; const x = Math.log10(s.period); worstm2 = Math.max(worstm2, Math.abs(s.min - (H.min.a + H.min.b * x) - s.resm)); });
check('printed Res. m reproduced within 0.25 (all but Harvard 1374)', worstm2 < 0.25, 'worst ' + worstm2.toFixed(3) + '; Harvard 1374 off by ' + worstm.toFixed(2) + ' (sign slip in the original)');
// against the plain LSQ lines too (a stricter test of the transcription would be a pure refit)
let wM = 0; S.forEach(s => { const x = Math.log10(s.period); wM = Math.max(wM, Math.abs((s.max - (T.max.a + T.max.b * x)) - s.resM)); });
check('printed Res. M vs our own LSQ line within 0.3', wM < 0.3, 'worst ' + wM.toFixed(3));

// 3. average range
const rng = S.reduce((a, s) => a + (s.min - s.max), 0) / S.length;
check('average range 1.2 ± 0.15 mag', Math.abs(rng - C.AVERAGE_RANGE_MAG) < 0.15, rng.toFixed(3));

// 4. the plates: folding at her period is the best non-multiple fold
function grid() { const g = []; for (let lp = 0; lp <= 7; lp += 0.0005) g.push(Math.pow(2, lp)); return g; }
const G = grid();
function isMultiple(P, her) { const r = P / her; for (const k of [2, 3, 4, 5, 6]) if (Math.abs(r / k - 1) < 0.05) return true; return false; }
function bestFold(rec, her) {
  let best = null, bd = 9;
  for (const P of G) { if (isMultiple(P, her)) continue; const d = M.roughness(rec, P); if (d < bd) { bd = d; best = P; } }
  return best;
}
function plateTest(label, opts, seeds) {
  let okBest = 0, okHalf = 0, okTol = 0, n = 0, worstTol = 0;
  for (const h of C.ROUNDS) {
    const her = M.star(h).period;
    for (let sd = 1; sd <= seeds; sd++) {
      const rec = M.makePlates(h, sd, opts); n++;
      const b = bestFold(rec, her);
      if (Math.abs(b / her - 1) < 0.04) okBest++;
      const dH = M.roughness(rec, her), dHalf = M.roughness(rec, her / 2);
      if (dHalf > dH + 0.2) okHalf++;
      const dTol = Math.max(M.roughness(rec, her * 1.015), M.roughness(rec, her * 0.985));
      worstTol = Math.max(worstTol, dTol);
      if (dTol < 0.75) okTol++;
    }
  }
  return { n, okBest, okHalf, okTol, worstTol };
}
const base = plateTest('base', {}, 40);
check('cleanest non-multiple fold within 4% of her period (≥98% of 280 star-seeds)', base.okBest / base.n >= 0.98, base.okBest + '/' + base.n);
check('fold at half her period visibly worse (≥95%)', base.okHalf / base.n >= 0.95, base.okHalf + '/' + base.n);
check('fold within 1.5% of her period still recognisable (≥90%, roughness < 0.75)', base.okTol / base.n >= 0.9, base.okTol + '/' + base.n + ', worst ' + base.worstTol.toFixed(2));
// her period clean in absolute terms
let clean = 0, cn = 0; for (const h of C.ROUNDS) for (let sd = 1; sd <= 40; sd++) { cn++; if (M.roughness(M.makePlates(h, sd), M.star(h).period) < 0.7) clean++; }
check('fold at her period is clean (roughness < 0.7, ≥95%)', clean / cn >= 0.95, clean + '/' + cn);

let rr=0,rn=0; for (const h of C.ROUNDS) for (let sd=1; sd<=20; sd++){ const rec=M.makePlates(h,sd); rr+=M.roughness(rec, M.star(h).period*1.37); rn++; }
check('a wrong beat (1.37 x hers) is rough (mean roughness > 0.85)', rr/rn > 0.85, (rr/rn).toFixed(2));
// 5. robustness to our choices
const sine = plateTest('sine', { shape: 'sine' }, 15);
check('robust: symmetric light curve, best fold still hers (≥95%)', sine.okBest / sine.n >= 0.95, sine.okBest + '/' + sine.n);
const noisy = plateTest('noisy', { noise: 2 * C.EYE_NOISE_MAG }, 15);
check('robust: noise doubled, best fold still hers (≥90%)', noisy.okBest / noisy.n >= 0.90, noisy.okBest + '/' + noisy.n);
const fewer = plateTest('fewer', { n: 20 }, 15);
check('robust: 20 plates instead of 26, best fold still hers (≥90%)', fewer.okBest / fewer.n >= 0.9, fewer.okBest + '/' + fewer.n);
// the chart discovery does not depend on our plates: the played seven alone, at her periods, give a slope near hers
const P7 = C.ROUNDS.map(h => M.star(h)); const L7 = M.fitLine(P7.map(s => Math.log10(s.period)), P7.map(s => s.max));
check('the seven played stars alone show the slope (0.35–0.65 in log P per mag)', -1 / L7.b > 0.35 && -1 / L7.b < 0.65, (-1 / L7.b).toFixed(3));
const P3 = C.ROUNDS.slice(0, 3).map(h => M.star(h)); const L3 = M.fitLine(P3.map(s => Math.log10(s.period)), P3.map(s => s.max));
check('the first three already slope the right way', L3.b < 0, (-1 / L3.b).toFixed(3));

// 6. words
const words = [[1.25336, '1 day 6 hours'], [4.547, '4 days 13 hours'], [127, '127 days'], [31.94, '32 days'], [0.5, '12 hours'], [8, '8 days'], [1.999, '2 days']];
words.forEach(([d, w]) => check('beatWords(' + d + ') = "' + w + '"', M.beatWords(d) === w, M.beatWords(d)));
let decimals = 0; for (let d = 1; d <= 128; d *= 1.01) if (/\d\.\d/.test(M.beatWords(d))) decimals++;
check('no decimals in any beat', decimals === 0);
const cases = [[4.55, 4.547, 'same'], [4.68, 4.547, 'near'], [9.1, 4.547, 'multiple'], [2.27, 4.547, 'multiple'], [6.5, 4.547, 'off'], [127.5, 127, 'same'], [3.76, 1.25336, 'multiple']];
cases.forEach(([p, h, k]) => check('compare(' + p + ', ' + h + ') is ' + k, M.compare(p, h).kind === k, M.compare(p, h).line));
[[17, 16.75, 'close'], [25, 16.75, 'fair'], [8, 16.75, 'far'], [40, 16.75, 'far'], [10, 16.75, 'wide']].forEach(([g, h, k]) => check('guessWords(' + g + ') is ' + k, M.guessWords(g, h).kind === k, M.guessWords(g, h).line));
// dial
check('dial start is 8 days', Math.abs(M.dialToDays(M.daysToCoarse(C.DIAL_START), 0.5) - 8) < 1e-9);
check('dial reaches 1 and 128 days', Math.abs(M.dialToDays(0, 0.5) - 1) < 1e-9 && Math.abs(M.dialToDays(1, 0.5) - 128) < 1e-9);
// the fine dial resolves her tolerance: one pixel of a 300 px fine slider
const finePx = 2 * C.FINE_SPAN / 300; check('fine dial step (1 px of 300) well under 1.5%', finePx < 0.005, (finePx * 100).toFixed(3) + '% per px');

// 7. simulated players over whole games
function play(strategy, seed) {
  const g = M.newGame(seed);
  for (let i = 0; i < g.rounds.length; i++) {
    g.round = i; const her = M.star(g.rounds[i].h).period;
    if (i === C.PREDICT_ROUND) M.guess(g, strategy.guess(g));
    M.write(g, strategy.beat(her, g.rounds[i].rec));
  }
  return M.verdict(g);
}
const H7 = M.herLines();
const strategies = {
  'careful (best fold)': { beat: (her, rec) => bestFold(rec, her), guess: g => { const s = M.star(822); return Math.pow(10, (s.max - H7.max.a) / H7.max.b); } },
  'doubler (always 2x)': { beat: her => her * 2, guess: () => 30 },
  'sloppy (3% off)': { beat: her => her * 1.03, guess: () => 80 },
  'random': { beat: () => Math.pow(2, Math.random() * 7), guess: () => 8 }
};
for (const [name, st] of Object.entries(strategies)) { const v = play(st, 7); out.push('  player ' + name + ': ' + v.did); }
const v0 = play(strategies['careful (best fold)'], 3);
check('careful player: beats were hers, guess close', /hers, to within hours|hers, or close/.test(v0.did) && /within a few days/.test(v0.did), v0.did);

console.log(out.join('\n'));
console.log('\n' + (fails ? fails + ' FAILED' : 'ALL ' + out.filter(l => l.startsWith('PASS')).length + ' CHECKS PASSED'));
process.exitCode = fails ? 1 : 0;
