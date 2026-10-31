// Hubble's Twelve Nights — mechanism. The single source of truth: runs unchanged in Node and in the browser.
// Built from Hubble (1929), PNAS 15:168–173, doi:10.1073/pnas.15.3.168. Every number below is tagged with its source
// or its design rationale. The paper is the authority where the two disagree.
(function (root) {
'use strict';

const CONFIG = {
  // ---- Table 1 (p. 169): the 24 nebulae with estimated distances. ms = photographic magnitude of brightest stars
  // involved (".." in the table = not given); r = distance in millions of parsecs; v = measured radial velocity, km/s.
  // Transcribed by hand from the scanned PDF (OCR layer unreliable); checked against standard transcriptions.
  // ra/dec (degrees, J2000, from standard catalogues) are NOT in the paper; Hubble used them but did not print them.
  // They enter only the solar-motion term. Precession since 1929 moves them by well under a degree: negligible here.
  NEBULAE: [
    { name: 'Small Magellanic Cloud', short: 'S. Mag.',   ms: null, r: 0.032, v:  170, ra:  13.2, dec: -72.8 }, // Table 1; r is Shapley's
    { name: 'Large Magellanic Cloud', short: 'L. Mag.',   ms: null, r: 0.034, v:  290, ra:  80.9, dec: -69.8 }, // Table 1; r is Shapley's
    { name: 'NGC 6822',               short: '6822',      ms: null, r: 0.214, v: -130, ra: 296.2, dec: -14.8 }, // Table 1; v by Humason
    { name: 'NGC 598 (M33)',          short: '598',       ms: null, r: 0.263, v:  -70, ra:  23.5, dec:  30.7 }, // Table 1
    { name: 'NGC 221 (M32)',          short: '221',       ms: null, r: 0.275, v: -185, ra:  10.7, dec:  40.9 }, // Table 1; v by Humason
    { name: 'NGC 224 (M31)',          short: '224',       ms: null, r: 0.275, v: -220, ra:  10.7, dec:  41.3 }, // Table 1; v by Humason
    { name: 'NGC 5457 (M101)',        short: '5457',      ms: 17.0, r: 0.45,  v:  200, ra: 210.8, dec:  54.3 }, // Table 1; v by Humason
    { name: 'NGC 4736 (M94)',         short: '4736',      ms: 17.3, r: 0.5,   v:  290, ra: 192.7, dec:  41.1 }, // Table 1
    { name: 'NGC 5194 (M51)',         short: '5194',      ms: 17.3, r: 0.5,   v:  270, ra: 202.5, dec:  47.2 }, // Table 1
    { name: 'NGC 4449',               short: '4449',      ms: 17.8, r: 0.63,  v:  200, ra: 187.0, dec:  44.1 }, // Table 1
    { name: 'NGC 4214',               short: '4214',      ms: 18.3, r: 0.8,   v:  300, ra: 183.9, dec:  36.3 }, // Table 1
    { name: 'NGC 3031 (M81)',         short: '3031',      ms: 18.5, r: 0.9,   v:  -30, ra: 148.9, dec:  69.1 }, // Table 1
    { name: 'NGC 3627 (M66)',         short: '3627',      ms: 18.5, r: 0.9,   v:  650, ra: 170.1, dec:  13.0 }, // Table 1
    { name: 'NGC 4826 (M64)',         short: '4826',      ms: 18.5, r: 0.9,   v:  150, ra: 194.2, dec:  21.7 }, // Table 1
    { name: 'NGC 5236 (M83)',         short: '5236',      ms: 18.5, r: 0.9,   v:  500, ra: 204.3, dec: -29.9 }, // Table 1
    { name: 'NGC 1068 (M77)',         short: '1068',      ms: 18.7, r: 1.0,   v:  920, ra:  40.7, dec:  -0.0 }, // Table 1
    { name: 'NGC 5055 (M63)',         short: '5055',      ms: 19.0, r: 1.1,   v:  450, ra: 198.9, dec:  42.0 }, // Table 1
    { name: 'NGC 7331',               short: '7331',      ms: 19.0, r: 1.1,   v:  500, ra: 339.3, dec:  34.4 }, // Table 1
    { name: 'NGC 4258 (M106)',        short: '4258',      ms: 19.5, r: 1.4,   v:  500, ra: 184.7, dec:  47.3 }, // Table 1
    { name: 'NGC 4151',               short: '4151',      ms: 20.0, r: 1.7,   v:  960, ra: 182.6, dec:  39.4 }, // Table 1
    { name: 'NGC 4382 (M85), Virgo',  short: '4382',      ms: null, r: 2.0,   v:  500, ra: 186.3, dec:  18.2 }, // Table 1; cluster distance (p. 170)
    { name: 'NGC 4472 (M49), Virgo',  short: '4472',      ms: null, r: 2.0,   v:  850, ra: 187.4, dec:   8.0 }, // Table 1; cluster distance
    { name: 'NGC 4486 (M87), Virgo',  short: '4486',      ms: null, r: 2.0,   v:  800, ra: 187.7, dec:  12.4 }, // Table 1; cluster distance
    { name: 'NGC 4649 (M60), Virgo',  short: '4649',      ms: null, r: 2.0,   v: 1090, ra: 190.9, dec:  11.6 }, // Table 1; cluster distance
  ],
  M_BRIGHTEST_STAR: -6.3,   // p. 168: uniform upper limit of stellar luminosity, M(photographic) = -6.3
  M_NEBULA_MEAN: -15.2,     // p. 169: average absolute visual magnitude of nebulae (not used by the instruments; About only)
  // ---- The solution for solar motion and K (p. 170), 24 objects individually
  SOLAR: { X: -65, Y: 226, Z: -195 },   // p. 170, "24 objects" column, km/s
  K_24: 465, K_24_ERR: 50,              // p. 170: K = +465 ± 50 km/s per 10^6 parsecs (24 objects)
  K_9: 513,  K_9_ERR: 60,               // p. 170: K = +513 ± 60 (9 groups)
  K_ROUND: 500,                         // p. 170: Hubble's round value
  V0_24: 306,                           // p. 170: speed of solar motion, 24-object solution, km/s
  RESIDUAL_24: 150,                     // p. 171: average residual, 24 objects (peculiar motions)
  K_FROM_TABLE2: 530,                   // p. 172: mean of 22 nebulae without distances implies K about 530
  // ---- Humason's nebula (p. 173 and the preceding note, PNAS 15:167)
  HUMASON: { name: 'NGC 7619', v: 3779, v_corr: 3910, r_cluster: 7.0, r_from_K: 7.8, m: 11.8 }, // p. 173
  // ---- The spectrograph: the Ca II K and H lines, which dominate the absorption spectra of these nebulae (p. 167–168
  // describes the lines in NGC 7619). Wavelengths in Ångström are standard laboratory values, not in the paper.
  LINES: [ { name: 'K', lambda: 3933.66 }, { name: 'H', lambda: 3968.47 } ],
  C_KMS: 299792.458,                    // speed of light, km/s
  WINDOW: { lo: 3880, hi: 4040 },       // our choice: the strip shows 160 Å around H and K so 1000 km/s is a visible slide
  // ---- The game
  NIGHTS: 12,                           // our choice: the budget; see memo section 17 (heuristics) for why 12
  COST: [ { maxMs: 17.95, nights: 1 }, { maxMs: 19.45, nights: 2 }, { maxMs: 99, nights: 3 } ], // our choice: exposure grows with faintness
  VIRGO_COST: 3,                        // our choice: the Virgo four, the farthest, cost most (p. 173: the far ones need Humason's programme)
  RATE_MAX: 1000,                       // our choice: the rate dial runs from 0 (no relation) to 1000 km/s per 10^6 parsecs
  EYE_TOL_LOG: 0.06,                    // our choice: the reading error assumed for the heuristics (memo 17), ±15% in distance; nothing on screen uses it
  SPEC_TOL_KMS: 40,                     // our choice: the reading error assumed for the heuristics, ±40 km/s (about 0.5 Å at H and K); nothing on screen uses it
  WITHIN_HUBBLE_LO: 415, WITHIN_HUBBLE_HI: 573, // p. 170: the span of his two solutions with their errors (465-50 to 513+60)
  SEED_MAX: 9999,                       // our choice: seeds vary graininess and lamp flicker only; the sky is the paper's
};

// ---------------------------------------------------------------- helpers
function makeRng(seed) { // mulberry32
  let a = (seed >>> 0) || 1;
  return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}
const D2R = Math.PI / 180;

// The solar-motion term of p. 170: X cos a cos d + Y sin a cos d + Z sin d
function solarTerm(ra, dec, S) {
  S = S || CONFIG.SOLAR;
  return S.X * Math.cos(ra * D2R) * Math.cos(dec * D2R) + S.Y * Math.sin(ra * D2R) * Math.cos(dec * D2R) + S.Z * Math.sin(dec * D2R);
}
function correctedVelocity(v, ra, dec, S) { return v - solarTerm(ra, dec, S); }

// The brightest-star criterion (p. 168–169): m - M = 5 log10(r_pc) - 5  →  r in millions of parsecs
function distanceFromMag(ms, M) { M = (M === undefined) ? CONFIG.M_BRIGHTEST_STAR : M; return Math.pow(10, (ms - M + 5) / 5) / 1e6; }
function magFromDistance(rMpc, M) { M = (M === undefined) ? CONFIG.M_BRIGHTEST_STAR : M; return M + 5 * Math.log10(rMpc * 1e6) - 5; }
// Apparent magnitude of a nebula's brightest star as the eyepiece shows it: the table's value, or the criterion run backwards
function brightestStarMag(neb) { return neb.ms !== null ? neb.ms : magFromDistance(neb.r); }
// Relative brightness of a star of magnitude m, on a scale where m0 is 1
function relBrightness(m, m0) { return Math.pow(10, -0.4 * (m - m0)); }

// The spectrograph: observed wavelength of a line at radial velocity v (first-order Doppler, as in 1929)
function shiftedLambda(lambda0, v) { return lambda0 * (1 + v / CONFIG.C_KMS); }
function velocityFromShift(lambda0, lambdaObs) { return CONFIG.C_KMS * (lambdaObs / lambda0 - 1); }
// Line profile for drawing: depth and width scale with faintness of the nebula (p. 168: "wide shallow absorption lines ...
// more pronounced among the smaller and fainter nebulae"). Our mapping: width 1.5–6 Å, depth 0.75–0.3 as ms runs 15–21.
function lineProfile(neb) {
  const ms = brightestStarMag(neb);
  const t = Math.min(1, Math.max(0, (ms - 15) / 6));
  return { widthA: 1.5 + 4.5 * t, depth: 0.75 - 0.45 * t, grain: 0.05 + 0.25 * t };
}

// Cost in nights
function cost(neb) {
  if (neb.r >= 2.0) return CONFIG.VIRGO_COST;
  const ms = brightestStarMag(neb);
  for (const c of CONFIG.COST) if (ms <= c.maxMs) return c.nights;
  return CONFIG.COST[CONFIG.COST.length - 1].nights;
}

// Least squares through the origin: v = K r
function fitK(points) { let sr2 = 0, srv = 0; for (const p of points) { sr2 += p.r * p.r; srv += p.r * p.v; } return sr2 > 0 ? srv / sr2 : 0; }
function correlation(points) {
  const n = points.length; if (n < 3) return 0;
  let mr = 0, mv = 0; for (const p of points) { mr += p.r; mv += p.v; } mr /= n; mv /= n;
  let srv = 0, sr = 0, sv = 0; for (const p of points) { srv += (p.r - mr) * (p.v - mv); sr += (p.r - mr) ** 2; sv += (p.v - mv) ** 2; }
  return (sr > 0 && sv > 0) ? srv / Math.sqrt(sr * sv) : 0;
}
// Hubble's own 4-parameter solution (p. 170): v = K r + X cos a cos d + Y sin a cos d + Z sin d, by normal equations
function solveHubble(nebs) {
  const rows = nebs.map(n => [n.r, Math.cos(n.ra * D2R) * Math.cos(n.dec * D2R), Math.sin(n.ra * D2R) * Math.cos(n.dec * D2R), Math.sin(n.dec * D2R), n.v]);
  const A = [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]], b = [0, 0, 0, 0];
  for (const row of rows) for (let i = 0; i < 4; i++) { b[i] += row[i] * row[4]; for (let j = 0; j < 4; j++) A[i][j] += row[i] * row[j]; }
  // gaussian elimination
  const M = A.map((r, i) => r.concat([b[i]]));
  for (let i = 0; i < 4; i++) {
    let p = i; for (let k = i + 1; k < 4; k++) if (Math.abs(M[k][i]) > Math.abs(M[p][i])) p = k;
    [M[i], M[p]] = [M[p], M[i]];
    for (let k = 0; k < 4; k++) if (k !== i) { const f = M[k][i] / M[i][i]; for (let j = i; j < 5; j++) M[k][j] -= f * M[i][j]; }
  }
  const x = M.map((r, i) => r[4] / r[i]);
  const res = rows.map(row => row[4] - (x[0] * row[0] + x[1] * row[1] + x[2] * row[2] + x[3] * row[3]));
  const meanAbs = res.reduce((s, e) => s + Math.abs(e), 0) / res.length;
  return { K: x[0], X: x[1], Y: x[2], Z: x[3], V0: Math.hypot(x[1], x[2], x[3]), meanAbsResidual: meanAbs };
}

// ---------------------------------------------------------------- game state
function newGame(seed) {
  seed = (seed === undefined || seed === null) ? 1 + Math.floor(Math.random() * CONFIG.SEED_MAX) : seed;
  return { seed, nightsLeft: CONFIG.NIGHTS, observed: [], // {idx, r (read), v (read), rTrue, vTrue, vCorr}
    corrected: false, rate: null, prediction: null, finished: false };
}
function canObserve(state, idx) {
  const neb = CONFIG.NEBULAE[idx];
  return !state.observed.some(o => o.idx === idx) && state.nightsLeft >= cost(neb);
}
function affordable(state) { return CONFIG.NEBULAE.map((n, i) => canObserve(state, i)); }
function nightsOver(state) { return !affordable(state).some(Boolean); }
// The player's two readings for one nebula: rRead from the eyepiece dial, vRead from the spectrograph slide
function observe(state, idx, rRead, vRead) {
  if (!canObserve(state, idx)) throw new Error('cannot observe ' + idx);
  const neb = CONFIG.NEBULAE[idx];
  state.nightsLeft -= cost(neb);
  const o = { idx, r: rRead, v: vRead, rTrue: neb.r, vTrue: neb.v, vCorr: correctedVelocity(vRead, neb.ra, neb.dec), cost: cost(neb) };
  state.observed.push(o);
  return o;
}
// What the plate shows: raw readings before the Sun's motion is taken out, corrected ones after
function platePoints(state) { return state.observed.map(o => ({ r: o.r, v: state.corrected ? o.vCorr : o.v, idx: o.idx })); }
function takeOutSun(state) { state.corrected = true; return platePoints(state); }
function setRate(state, K) { state.rate = Math.max(0, Math.min(CONFIG.RATE_MAX, K)); return state.rate; }
function predictHumason(state) { return state.rate * CONFIG.HUMASON.r_cluster; }
function commitPrediction(state, v) { state.prediction = v; return v; }

// Match tests, kept for the author and the calibration; the game never calls them. The reading is the player's.
function eyeMatch(neb, rTrial) { return Math.abs(Math.log10(rTrial / neb.r)) <= CONFIG.EYE_TOL_LOG; }
function specMatch(neb, vTrial) { return Math.abs(vTrial - neb.v) <= CONFIG.SPEC_TOL_KMS; }

// ---------------------------------------------------------------- words
function fmtK(k) { return Math.round(k / 10) * 10; }
function roundV(v) { return Math.round(v / 50) * 50; }
// The sentence under the plate after each night, in the aim's units
function plateWords(state) {
  // Describes the plate; never concludes. "The farther, the faster" is the verdict's line, after the rate is set.
  const pts = platePoints(state), n = pts.length;
  if (n === 0) return 'Nothing on the plate yet.';
  if (n === 1) return 'One nebula. Nothing to compare it with yet.';
  if (n === 2) return 'Two nebulae. Too few to see anything.';
  const rs = pts.map(p => p.r), spread = Math.max(...rs) - Math.min(...rs), c = correlation(pts);
  const far = pts.reduce((a, p) => p.r > a.r ? p : a), high = pts.reduce((a, p) => p.v > a.v ? p : a);
  const count = n === 3 ? 'Three' : n === 4 ? 'Four' : n === 5 ? 'Five' : n === 6 ? 'Six' : n === 7 ? 'Seven' : n === 8 ? 'Eight' : n === 9 ? 'Nine' : n === 10 ? 'Ten' : n === 11 ? 'Eleven' : 'Twelve';
  if (spread < 0.5) return `${count} nebulae, all at about the same distance. Nothing to compare yet.`;
  if (Math.max(...rs) < 1.3) return `${count} nebulae, all nearby. ${c > 0.6 ? 'The dots rise a little from left to right.' : 'A cloud so far.'}`;
  if (far === high) return `Your farthest dot is also your highest.${c > 0.6 ? ' The others rise toward it.' : ' The others scatter.'}`;
  if (c > 0.6) return 'The dots rise from left to right, with some scatter.';
  return state.corrected ? 'Still a cloud: dots high and low at every distance.' : 'A cloud: dots high and low at every distance.';
}
// Hubble's own readings for the nebulae the player observed: Table 1, raw or corrected like the player's (the ghost dots)
function hubblePoints(state) { return state.observed.map(o => { const n = CONFIG.NEBULAE[o.idx]; return { r: n.r, v: state.corrected ? correctedVelocity(n.v, n.ra, n.dec) : n.v, idx: o.idx }; }); }
// One sentence comparing the player's plate with Hubble's, in words
function comparisonWords(state) {
  const o = state.observed; if (o.length < 2) return 'Too few dots to set beside Hubble\'s.';
  const logR = o.reduce((s, p) => s + Math.log10(p.r / p.rTrue), 0) / o.length;
  const far = o.filter(p => p.rTrue >= 1.0), near = o.filter(p => p.rTrue < 1.0);
  const vErr = arr => arr.length ? arr.reduce((s, p) => s + (p.v - p.vTrue), 0) / arr.length : 0;
  const farErr = vErr(far), nearErr = vErr(near), allErr = vErr(o);
  const parts = [];
  if (logR > 0.04) parts.push('your distances ran long'); else if (logR < -0.04) parts.push('your distances ran short');
  if (far.length && Math.abs(farErr) > 60) parts.push(farErr > 0 ? 'your far ones ran fast' : 'your far ones ran slow');
  else if (!far.length && Math.abs(nearErr) > 60) parts.push(nearErr > 0 ? 'your speeds ran fast' : 'your speeds ran slow');
  else if (far.length && Math.abs(allErr) > 60) parts.push(allErr > 0 ? 'your speeds ran fast' : 'your speeds ran slow');
  if (!parts.length) return 'Set beside Hubble\'s plate, your dots sat near his.';
  const s = parts.join(' and ');
  return 'Set beside Hubble\'s plate, ' + s.charAt(0) + s.slice(1) + '.';
}
// Distances in words, never decimals (the author finds the decimals in CONFIG)
function distanceWords(r) {
  if (r < 0.06) return 'a few hundredths of a million parsecs';
  if (r < 0.16) return 'about a tenth of a million parsecs';
  if (r < 0.36) return 'about a quarter of a million parsecs';
  if (r < 0.58) return 'about half a million parsecs';
  if (r < 0.72) return 'about two thirds of a million parsecs';
  if (r < 1.25) return 'about a million parsecs';
  if (r < 1.62) return 'about one and a half million parsecs';
  if (r < 2.5) return 'about two million parsecs';
  return 'more than two million parsecs';
}
function speedWords(v) {
  const a = Math.abs(roundV(v));
  if (a < 50) return 'hardly moving';
  return `about ${a.toLocaleString('en')} km/s ${v >= 0 ? 'going away' : 'coming toward us'}`;
}
// The measuring screw's readout: from zero at the lamp's lines, as a speed with direction
function screwWords(v) {
  const a = Math.abs(roundV(v));
  if (a === 0) return 'zero';
  return `about ${a.toLocaleString('en')} km/s, ${v > 0 ? 'going away' : 'coming toward us'}`;
}
function nightWords(o, state) {
  const neb = CONFIG.NEBULAE[o.idx];
  const nights = state.nightsLeft === 0 ? 'No nights left.' : state.nightsLeft === 1 ? 'One night left.' : state.nightsLeft + ' nights left.';
  return `${neb.name}: ${speedWords(o.v)}, ${distanceWords(o.r)} out. ${nights}`;
}
function rateWords(state) {
  const K = state.rate;
  if (K < 60) return 'You say the speeds do not depend on distance.';
  if (K >= CONFIG.WITHIN_HUBBLE_LO && K <= CONFIG.WITHIN_HUBBLE_HI) return `You set the rate at about ${fmtK(K)} km/s for every million parsecs. That is within Hubble's two solutions.`;
  if (K > CONFIG.WITHIN_HUBBLE_HI) return `You set the rate at about ${fmtK(K)} km/s for every million parsecs. Hubble's was lower, about 500.`;
  return `You set the rate at about ${fmtK(K)} km/s for every million parsecs. Hubble's was higher, about 500.`;
}
function verdict(state) {
  const H = CONFIG.HUMASON, pts = platePoints(state);
  const n = pts.length, maxR = n ? Math.max(...pts.map(p => p.r)) : 0;
  const bestK = fitK(pts);
  const did = `You read ${n} nebula${n === 1 ? '' : 'e'}, the farthest ${distanceWords(maxR)} out. ${comparisonWords(state)}`;
  const rate = rateWords(state);
  const err = state.prediction - H.v;
  let test;
  if (state.rate < 60) test = `Humason's nebula, seven million parsecs out, you called standing still. The spectrograph said about ${roundV(H.v).toLocaleString('en')} km/s, going away.`;
  else test = `Humason's nebula, seven million parsecs out: you said about ${roundV(state.prediction).toLocaleString('en')} km/s; the spectrograph said about ${roundV(H.v).toLocaleString('en')}. ${Math.abs(err) <= 800 ? 'Close.' : err > 0 ? 'You were high.' : 'You were low.'} Hubble's own rate would have said about ${roundV(CONFIG.K_ROUND * H.r_cluster).toLocaleString('en')}.`;
  let plate;
  const spread = n ? Math.max(...pts.map(p => p.r)) - Math.min(...pts.map(p => p.r)) : 0, c = correlation(pts);
  if (n >= 3 && spread >= 0.5 && c > 0.45) plate = `Your plate shows it: the far ones are the fast ones. Your own dots, on their own, fit a rate of about ${fmtK(bestK)}.`;
  else if (n >= 3 && spread < 0.5) plate = 'Your plate could not show it: every nebula on it sits at about the same distance, so there was nothing to compare. The relation needs near ones and far ones together.';
  else plate = 'Your plate is thin. Hubble needed the whole table, and called it scanty even then.';
  const showed = n >= 3 && spread >= 0.5 && c > 0.45;
  const headline = state.rate < 60 ? 'The nebulae do not drift at random.' : showed ? 'The farther, the faster.' : 'The far ones were where the answer was.';
  const meaning = 'The farther a nebula, the faster it recedes, about 500 km/s for every million parsecs on Hubble\'s distances. The ones that seemed to approach were mostly the Sun\'s own motion. Hubble stopped there; others would call it the expanding universe.';
  return { headline, did, rate, test, plate, meaning, bestK, n, maxR, comparison: comparisonWords(state) };
}

// ---------------------------------------------------------------- heuristics (memo, section 17): simple ways of spending the nights
function playStrategy(order, noise, rng) {
  const st = newGame(1);
  for (const idx of order) {
    if (!canObserve(st, idx)) continue;
    const neb = CONFIG.NEBULAE[idx];
    const rRead = neb.r * Math.pow(10, noise ? (rng() * 2 - 1) * CONFIG.EYE_TOL_LOG : 0);
    const vRead = neb.v + (noise ? (rng() * 2 - 1) * CONFIG.SPEC_TOL_KMS : 0);
    observe(st, idx, rRead, vRead);
  }
  takeOutSun(st);
  const pts = platePoints(st);
  return { n: pts.length, maxR: Math.max(...pts.map(p => p.r)), K: fitK(pts), corr: correlation(pts), nightsUsed: CONFIG.NIGHTS - st.nightsLeft };
}
function heuristics(seed) {
  const rng = makeRng(seed || 7), N = CONFIG.NEBULAE.length, idx = [...Array(N).keys()];
  const byCost = idx.slice().sort((a, b) => cost(CONFIG.NEBULAE[a]) - cost(CONFIG.NEBULAE[b]) || brightestStarMag(CONFIG.NEBULAE[a]) - brightestStarMag(CONFIG.NEBULAE[b]));
  const byFar = idx.slice().sort((a, b) => CONFIG.NEBULAE[b].r - CONFIG.NEBULAE[a].r);
  const bright = byCost.slice(0, 6), far = byFar.slice(0, 6);
  const alternating = []; for (let i = 0; i < 12; i++) alternating.push(i % 2 ? byCost[i >> 1] : byFar[i >> 1]);
  const shuffled = idx.slice(); for (let i = N - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]; }
  return {
    'nearest and cheapest first': playStrategy(byCost, true, rng),
    'farthest first': playStrategy(byFar, true, rng),
    'alternate far and near': playStrategy(alternating, true, rng),
    'random order': playStrategy(shuffled, true, rng),
    'four Virgo only': playStrategy(byFar.slice(0, 4), true, rng),
    'all 24, exact (Hubble\'s table)': (() => { const st = newGame(1); st.nightsLeft = 999; for (const i of idx) observe(st, i, CONFIG.NEBULAE[i].r, CONFIG.NEBULAE[i].v); takeOutSun(st); const p = platePoints(st); return { n: p.length, maxR: 2, K: fitK(p), corr: correlation(p), nightsUsed: 999 }; })(),
  };
}

const API = { CONFIG, makeRng, solarTerm, correctedVelocity, distanceFromMag, magFromDistance, brightestStarMag, relBrightness,
  shiftedLambda, velocityFromShift, lineProfile, cost, fitK, correlation, solveHubble, newGame, canObserve, affordable, nightsOver,
  observe, platePoints, takeOutSun, setRate, predictHumason, commitPrediction, eyeMatch, specMatch, plateWords, nightWords, rateWords,
  verdict, heuristics, fmtK, roundV, distanceWords, speedWords, screwWords, hubblePoints, comparisonWords };
if (typeof module !== 'undefined' && module.exports) module.exports = API; else root.HUBBLE = API;
})(typeof window !== 'undefined' ? window : globalThis);
