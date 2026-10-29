// One of Us — mechanism (the single source of truth).
// Everything that decides an outcome lives here: the worlds (who is behind the gap), the simulated reviews,
// the three tests, the scoring of accusations, the closing bet. The page only passes taps in and draws what comes back.
// Runs unchanged in Node (require) and in the browser (window.MECH). No DOM.
(function (root) {
'use strict';

const CONFIG = {
  // --- The real ERC (Fuchs-Schündeln & Holub) ---
  erc: {
    seed: 12,                  // our choice: the one reconstruction every player sees; picked from seeds 1-24 because its eq. 1 estimate (0.166) is closest to the paper's 0.164 (fidelity.js)
    proposals: 37073,          // p. 5: all ERC applications 2019-2023
    reviewsPer: 4.2,           // p. 5: Step 1 average panel reviewers per proposal
    judges: 3969,              // Methods p. 18: panel members in the data
    matchShare: 0.031,         // Table 2: share of panel members sharing country and citizenship, 4.6% (top five, N=19,938) and 1.5% (others, N=17,135), weighted; assumed equal for assigned reviewers
    base: 3.30,                // calibrated so the Step 1 project score mean is 3.29 (Supp. Table 2 col. 1) after rounding and clipping
    sdQuality: 0.83,           // calibrated: proposal share of variance ~ R² 0.555 (Supp. Table 2 col. 1) minus reviewer part
    skew: 1,                   // our choice: left-skewed proposal quality (minus an exponential), so that a 5.0 is as rare as reported, P = 0.047 (p. 9)
    sdJudge: 0.30,             // calibrated: reviewer leniency spread (part of the same R²)
    sdNoise: 0.64,             // calibrated: residual so that the score SD is 0.99 (Supp. Table 2 col. 1)
    bonus: 0.164,              // Supp. Table 2 col. 1 / p. 7: same country & same citizenship, Step 1 project score (the target)
    top5: { c: 4.4, s: 1.0 },  // our choice: judges are sparing with a 5. Brings a match's effect on P(5.0) from ~0.033 (plain rounding) to ~0.020; the paper's is 0.010 (p. 9), a known miss (memo §16)
    bonusLatent: 0.186,        // calibrated: the bonus before rounding and clipping, so that eq. 1 estimated on the 1-5 marks gives 0.164 (fidelity.js)
    bonusCI: [0.135, 0.193],   // Supp. Table 2 col. 1
    otherBonuses: [            // shown in the reveal only
      { label: 'Same country and same citizenship', v: 0.164, ci: [0.135, 0.193] }, // Supp. Table 2 col. 1
      { label: 'Same citizenship only', v: 0.075, ci: [0.048, 0.101] },             // Supp. Table 2 col. 1
      { label: 'Same country of work only', v: 0.056, ci: [0.027, 0.086] },         // Supp. Table 2 col. 1
      { label: 'Same gender', v: 0.024, ci: [0.013, 0.035] },                       // Supp. Table 1 col. 1
    ],
    tails: { p5: 0.047, d5: 0.010, d5ci: [0.002, 0.017], d1: -0.006, d1ci: [-0.011, -0.001] }, // pp. 9-10, Step 1 project score, both match
  },
  // --- The closing bet: Table 2 (correlational; predicted funding boost from panel matches) ---
  bet: {
    topFive: 1.7,              // Table 2: predicted effect, top-five countries, p.p.
    others: 0.8,               // Table 2: other countries, p.p.
    gap: 0.9,                  // Table 2: difference, p.p.
    baseline: 14.2,            // p. 13: baseline funding probability in the sample, %
    shareRatio: 3.1,           // Table 2: 4.6% vs 1.5% same country & citizenship panel members
    options: [                 // our choice: four bands for the bet, in p.p. of funding chance
      { id: 'none', label: 'None at all', lo: -Infinity, hi: 0.2 },
      { id: 'one', label: 'About 1 point', lo: 0.2, hi: 2.5 },
      { id: 'five', label: 'About 5 points', lo: 2.5, hi: 7.5 },
      { id: 'fifteen', label: '15 points or more', lo: 7.5, hi: Infinity },
    ],
  },
  // --- Training panels (invented; our choices throughout) ---
  train: {
    proposals: 4000,           // our choice: enough that 0.4-point effects and the spread stand clear of noise
    judges: 100,               // our choice
    reviewsPer: 4,             // our choice, close to the ERC's 4.2
    homeApplicants: 0.30,      // our choice: share of applicants from the case's country
    homeJudges: 0.30,          // our choice: share of judges from the case's country
    base: 3.30,                // our choice, near the ERC Step 1 mean
    sdQuality: 0.70, sdJudge: 0.25, sdNoise: 0.55, // our choice, near the ERC reconstruction
    effect: 0.40,              // our choice: exaggerated (ERC 0.164) so a stranger can see it in 4,000 proposals
    favour: 0.30,              // our choice: favouritism bonus (ERC 0.164)
    // Information world: a Bayesian judge; compatriots read a precise signal, others a noisy one, and both shrink to the mean.
    infoHomeQuality: 0.25,     // our choice: the case country's proposals are a little better than the judges expect
    infoSigmaHome: 0.10,       // our choice: compatriot judges' signal noise
    infoSigmaOther: 2.00,      // our choice: other judges' signal noise (they know little, so they mark near the middle)
    infoNoise: 0.20,           // our choice: rounding noise on top of the Bayesian mark
  },
  countries: ['Norland', 'Vestria', 'Ostrava', 'Kalmar', 'Belmont', 'Sundby'], // invented, so no real country is implied
  suspects: [
    { id: 'quality', name: 'Better proposals', line: 'Applicants from this country simply sent better work.' },
    { id: 'lenient', name: 'Generous judges', line: 'These judges mark everybody high, not just compatriots.' },
    { id: 'info', name: 'Knows them better', line: 'A judge from home can tell more precisely how good the work is.' },
    { id: 'favour', name: 'Favours their own', line: 'The very same work gets a higher mark from a compatriot.' },
  ],
  // What each test shows when each explanation is true: [same proposal, same judge, whole spread]. This is the logic of the
  // paper's design (pp. 6, 9-10), verified on simulated panels in fidelity.js. A practice panel whose test lands on the wrong side of the
  // line by chance (about 1 draw in 40) is re-drawn, so the practice cases teach the method cleanly (our choice).
  design: { quality: ['gone', 'still', 'flat'], lenient: ['still', 'gone', 'ramp'], info: ['still', 'still', 'smile'], favour: ['still', 'still', 'ramp'] },
  trainingCases: 3,            // our choice: three practice panels, drawn without replacement from the four suspects, then the ERC
  bins: [[1, 1.5], [2, 2.5], [3, 3.5], [4, 4.5], [5, 5]], // our choice: five bins of the paper's half-point scale (Fig. 3 uses nine)
  binLabels: ['1', '2', '3', '4', '5'],
  jackGroups: 20,              // our choice: groups of proposals for the jackknife standard error
  gapZ: 2.58,                  // our choice: the range shown is a 99% interval; the gap is 'gone' when it reaches zero
  spread: { z: 2.5 },         // our choice: compatriots give 'more' low or top marks if the difference is over 2.5 standard errors
};

// ---------- random numbers ----------
function rng(seed) {
  let a = seed >>> 0;
  const u = () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  let spare = null;
  const n = () => { if (spare !== null) { const s = spare; spare = null; return s; } let x, y, r; do { x = 2 * u() - 1; y = 2 * u() - 1; r = x * x + y * y; } while (r >= 1 || r === 0); const f = Math.sqrt(-2 * Math.log(r) / r); spare = y * f; return x * f; };
  return { u, n };
}
// Standardised left-skewed draw (mean 0, SD 1): minus a gamma variable of integer shape k (sum of k exponentials).
function skewed(R, k) {
  let g = 0; for (let i = 0; i < k; i++) g -= Math.log(1 - R.u());
  return -(g - k) / Math.sqrt(k);
}
// The ERC's 1-5 scale in half points (p. 4). With top = {c, s, u}, a judge above 4.75 writes a 5 only with probability
// 1/(1+exp(-(x-c)/s)), u a uniform draw; otherwise a 4.5. Without it, plain rounding.
const mark = (x, top) => {
  if (x >= 4.75) return !top || top.u < 1 / (1 + Math.exp(-(x - top.c) / top.s)) ? 5 : 4.5;
  return Math.max(1, Math.round(x * 2) / 2);
};

// ---------- worlds ----------
// A world is a list of reviews: proposal index, judge index, mark, matched (judge and applicant share the country).
// kind: 'quality' | 'lenient' | 'info' | 'favour' (training) or 'erc' (reconstruction). opts.confound adds sorting to the ERC world (robustness check only).
function makeWorld(kind, seed, opts) {
  opts = opts || {};
  const R = rng(seed);
  const reviews = { p: [], j: [], m: [], x: [] };
  if (kind === 'erc') {
    const C = Object.assign({}, CONFIG.erc, opts.erc || {});
    const lenJ = []; for (let j = 0; j < C.judges; j++) lenJ.push(C.sdJudge * R.n());
    const conf = opts.confound || { quality: 0, lenient: 0 }; // robustness only: matches more likely for better proposals / more generous judges
    for (let i = 0; i < C.proposals; i++) {
      const k = R.u() < C.reviewsPer - 4 ? 5 : 4;           // 4.2 on average
      const q = C.sdQuality * skewed(R, C.skew);
      const used = new Set();
      for (let r = 0; r < k; r++) {
        let j; do { j = Math.floor(R.u() * C.judges); } while (used.has(j)); used.add(j);
        const odds = Math.exp(conf.quality * q / C.sdQuality + conf.lenient * lenJ[j] / C.sdJudge);
        const matched = R.u() < C.matchShare * odds;
        const y = C.base + q + lenJ[j] + (matched ? C.bonusLatent : 0) + C.sdNoise * R.n();
        reviews.p.push(i); reviews.j.push(j); reviews.m.push(mark(y, { c: C.top5.c, s: C.top5.s, u: R.u() })); reviews.x.push(matched ? 1 : 0);
      }
    }
    return { kind, seed, reviews, nP: C.proposals, nJ: C.judges, country: 'ERC' };
  }
  const T = Object.assign({}, CONFIG.train, opts.train || {});
  const homeJ = [], lenJ = [];
  for (let j = 0; j < T.judges; j++) { homeJ.push(j < Math.round(T.judges * T.homeJudges)); lenJ.push(T.sdJudge * R.n()); }
  // Our choice: centre leniency within each group of judges, so that chance alone never makes one group look generous.
  for (const g of [true, false]) { const idx = homeJ.map((h, j) => h === g ? j : -1).filter(j => j >= 0); const m = idx.reduce((a, j) => a + lenJ[j], 0) / idx.length; for (const j of idx) lenJ[j] -= m; }
  for (let i = 0; i < T.proposals; i++) {
    const home = R.u() < T.homeApplicants;
    let q = T.sdQuality * R.n();
    if (kind === 'quality' && home) q += T.effect;
    if (kind === 'info' && home) q += T.infoHomeQuality;
    const used = new Set();
    for (let r = 0; r < T.reviewsPer; r++) {
      let j; do { j = Math.floor(R.u() * T.judges); } while (used.has(j)); used.add(j);
      const matched = home && homeJ[j];
      let y;
      if (kind === 'info') {
        const s = matched ? T.infoSigmaHome : T.infoSigmaOther;
        const w = T.sdQuality * T.sdQuality / (T.sdQuality * T.sdQuality + s * s); // Bayesian weight on the signal
        y = T.base + lenJ[j] + w * (q + s * R.n()) + T.infoNoise * R.n();
      } else {
        y = T.base + q + lenJ[j] + T.sdNoise * R.n();
        if (kind === 'lenient' && homeJ[j]) y += T.effect;
        if (kind === 'favour' && matched) y += T.favour;
      }
      reviews.p.push(i); reviews.j.push(j); reviews.m.push(mark(y)); reviews.x.push(matched ? 1 : 0);
    }
  }
  return { kind, seed, reviews, nP: T.proposals, nJ: T.judges };
}

// ---------- the observation and the tests ----------
function gapResult(ms) {
  const z = CONFIG.gapZ, lo = ms.mean - z * ms.se, hi = ms.mean + z * ms.se;
  return { gap: ms.mean, lo, hi, n: ms.n, gone: lo <= 0 }; // gone: no compatriot advantage left (interval reaches zero or below)
}
// Headline: average mark from compatriot judges minus average of all other marks (the naive comparison).
function headline(w) {
  const R = w.reviews; let s1 = 0, n1 = 0, s0 = 0, n0 = 0;
  for (let k = 0; k < R.m.length; k++) { if (R.x[k]) { s1 += R.m[k]; n1++; } else { s0 += R.m[k]; n0++; } }
  return { gap: s1 / n1 - s0 / n0, nMatched: n1, nReviews: R.m.length };
}
// Group differences: for each group (proposal or judge) with both matched and unmatched marks, matched mean minus unmatched mean,
// weighted by the number of matched marks in the group, so every matched review counts once. skip: leave out proposals with p % G === skip.
function withinGap(w, key, skip, G) {
  const R = w.reviews, n = key === 'p' ? w.nP : w.nJ;
  const s1 = new Float64Array(n), n1 = new Float64Array(n), s0 = new Float64Array(n), n0 = new Float64Array(n);
  for (let k = 0; k < R.m.length; k++) {
    if (skip >= 0 && R.p[k] % G === skip) continue;
    const g = R[key][k]; if (R.x[k]) { s1[g] += R.m[k]; n1[g]++; } else { s0[g] += R.m[k]; n0[g]++; }
  }
  let W = 0, S = 0, groups = 0;
  for (let g = 0; g < n; g++) if (n1[g] && n0[g]) { W += n1[g]; S += n1[g] * (s1[g] / n1[g] - s0[g] / n0[g]); groups++; }
  return { mean: S / W, groups };
}
// Standard error by a delete-a-group jackknife over proposals (marks of one proposal are never split), so the range is honest
// even when one proposal's quality enters several judges' comparisons.
function jackGap(w, key) {
  const G = CONFIG.jackGroups, full = withinGap(w, key, -1, G), parts = [];
  for (let g = 0; g < G; g++) parts.push(withinGap(w, key, g, G).mean);
  const m = parts.reduce((a, b) => a + b) / G; let v = 0; for (const p of parts) v += (p - m) * (p - m);
  return { mean: full.mean, se: Math.sqrt((G - 1) / G * v), n: full.groups };
}
function testProposal(w) { return gapResult(jackGap(w, 'p')); }
function testJudge(w) { return gapResult(jackGap(w, 'j')); }
// Whole spread: within proposals that have both kinds of mark, share of compatriot marks in each bin minus share of other marks.
function testSpread(w) {
  const R = w.reviews; const hasM = new Uint8Array(w.nP), hasU = new Uint8Array(w.nP);
  for (let k = 0; k < R.m.length; k++) { if (R.x[k]) hasM[R.p[k]] = 1; else hasU[R.p[k]] = 1; }
  const B = CONFIG.bins.length, c1 = new Array(B).fill(0), c0 = new Array(B).fill(0); let n1 = 0, n0 = 0;
  const binOf = v => CONFIG.bins.findIndex(b => v >= b[0] && v <= b[1]);
  for (let k = 0; k < R.m.length; k++) { const p = R.p[k]; if (!(hasM[p] && hasU[p])) continue; const b = binOf(R.m[k]); if (R.x[k]) { c1[b]++; n1++; } else { c0[b]++; n0++; } }
  const diff = [], se = [];
  for (let b = 0; b < B; b++) { const p1 = c1[b] / n1, p0 = c0[b] / n0; diff.push(p1 - p0); se.push(Math.sqrt(p1 * (1 - p1) / n1 + p0 * (1 - p0) / n0)); }
  // Low marks = bins 1 and 2; top marks = bins 4 and 5. A smile: compatriots give more of both; a ramp: more top marks only.
  const end = bs => { let a = 0, b = 0, c = 0; for (const k of bs) { a += c1[k]; b += c0[k]; } const p1 = a / n1, p0 = b / n0; return { d: p1 - p0, se: Math.sqrt(p1 * (1 - p1) / n1 + p0 * (1 - p0) / n0) }; };
  const big = e => e.d > CONFIG.spread.z * e.se;
  const lowUp = big(end([0, 1])), topUp = big(end([3, 4]));
  const pattern = topUp && lowUp ? 'smile' : topUp ? 'ramp' : 'flat';
  return { diff, se, n1, n0, pattern };
}
function shows(w) { return [testProposal(w).gone ? 'gone' : 'still', testJudge(w).gone ? 'gone' : 'still', testSpread(w).pattern]; }
function runTest(w, id) { return id === 'proposal' ? testProposal(w) : id === 'judge' ? testJudge(w) : testSpread(w); }

// Two-way fixed effects (eq. 1), by alternating projections: the paper's estimator, used in the fidelity check.
function twoWayFE(w, iters) {
  const R = w.reviews, N = R.m.length; let y = Float64Array.from(R.m), x = Float64Array.from(R.x);
  const demean = (v, key, n) => { const s = new Float64Array(n), c = new Float64Array(n); for (let k = 0; k < N; k++) { s[R[key][k]] += v[k]; c[R[key][k]]++; } for (let k = 0; k < N; k++) v[k] -= s[R[key][k]] / c[R[key][k]]; };
  for (let t = 0; t < (iters || 30); t++) { demean(y, 'p', w.nP); demean(y, 'j', w.nJ); demean(x, 'p', w.nP); demean(x, 'j', w.nJ); }
  let sxy = 0, sxx = 0; for (let k = 0; k < N; k++) { sxy += x[k] * y[k]; sxx += x[k] * x[k]; }
  return sxy / sxx;
}

// ---------- game ----------
function newGame(seed) {
  const R = rng(seed);
  const ids = CONFIG.suspects.map(s => s.id);
  for (let i = ids.length - 1; i > 0; i--) { const k = Math.floor(R.u() * (i + 1)); [ids[i], ids[k]] = [ids[k], ids[i]]; }
  const names = CONFIG.countries.slice();
  for (let i = names.length - 1; i > 0; i--) { const k = Math.floor(R.u() * (i + 1)); [names[i], names[k]] = [names[k], names[i]]; }
  const cases = ids.slice(0, CONFIG.trainingCases).map((kind, i) => {
    let s = (seed * 7919 + i * 104729) >>> 0, world;
    for (;;) { world = makeWorld(kind, s); if (shows(world).join() === CONFIG.design[kind].join()) break; s = (s + 1) >>> 0; }
    return { kind, country: names[i], seed: s, world };
  });
  cases.push({ kind: 'erc', country: 'ERC', seed: CONFIG.erc.seed });
  return { seed, cases, at: 0, results: [] };
}
function openCase(game) {
  const c = game.cases[game.at];
  c.world = c.world || makeWorld(c.kind, c.seed);
  c.head = headline(c.world); c.tests = c.tests || {};
  return c;
}
function test(game, id) {
  const c = game.cases[game.at];
  if (!c.tests[id]) c.tests[id] = runTest(c.world, id);
  return c.tests[id];
}
// The truth of the ERC case, by the paper: favouritism (homophily) survives every check.
function accuse(game, suspect) {
  const c = game.cases[game.at];
  const truth = c.kind === 'erc' ? 'favour' : c.kind;
  const res = { correct: suspect === truth, truth, suspect, tests: Object.keys(c.tests).length, country: c.country, erc: c.kind === 'erc' };
  game.results.push(res); game.at++;
  return res;
}
function solved(game) { return game.results.filter(r => r.correct).length; }
function judgeBet(id) {
  const o = CONFIG.bet.options.find(o => o.id === id); const g = CONFIG.bet.gap;
  return { right: g >= o.lo && g < o.hi, picked: o.label, gap: g };
}

const api = { CONFIG, rng, mark, makeWorld, headline, runTest, shows, testProposal, testJudge, testSpread, twoWayFE, newGame, openCase, test, accuse, solved, judgeBet };
if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.MECH = api;
})(typeof window !== 'undefined' ? window : this);
