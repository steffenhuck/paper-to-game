// Calibration check for Hubble's Twelve Nights. Run: node calibration.js  (writes calibration-result.txt)
// Tests mechanism.js against the paper's own numbers (Hubble 1929, PNAS 15:168–173):
//   (P1) the brightest-star criterion with M = -6.3 reproduces Table 1's distances from its m_s column;
//   (P2) Hubble's 4-parameter solution on Table 1 (with catalogue coordinates) reproduces K = 465 ± 50, V0 ≈ 306,
//        X, Y, Z within their printed errors, and residuals of about 150 km/s;
//   (P3) the fit through the origin on corrected velocities lands in the span of his two solutions;
//   (P4) Humason's NGC 7619: correction 3779 → about 3910, and 3910 / 500 ≈ 7.8 million parsecs (p. 173);
//   (P5) the spectrograph: shift → velocity round-trips; 1000 km/s moves the K line by about 13 Å;
//   (P6) correcting Table 1 for solar motion turns most 'approaching' nebulae into receding or standing ones (Fig. 1);
// then the game's framing: costs and budget, the heuristics table (memo section 17), the words, and seeds.
const M = require('./mechanism.js');
const C = M.CONFIG, N = C.NEBULAE;
const out = []; let pass = 0, fail = 0;
function check(name, ok, detail) { (ok ? pass++ : fail++); out.push(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? '  [' + detail + ']' : ''}`); }
const r1 = x => Math.round(x * 10) / 10;

// ---- P1: brightest-star criterion
let worst = 0; const p1 = [];
for (const n of N) if (n.ms !== null) { const r = M.distanceFromMag(n.ms); const rel = Math.abs(r / n.r - 1); worst = Math.max(worst, rel); p1.push(`${n.short}: m=${n.ms} → ${r.toFixed(2)} (table ${n.r})`); }
check('P1 brightest-star criterion reproduces Table 1 distances within 12% for all 14 nebulae with m_s', worst < 0.12, 'worst ' + (worst * 100).toFixed(1) + '%');
out.push('      ' + p1.join('; '));
check('P1b m_s = 17.0 gives 0.457 million parsecs (table 0.45)', Math.abs(M.distanceFromMag(17.0) - 0.457) < 0.005, M.distanceFromMag(17.0).toFixed(3));
check('P1c criterion inverts: magFromDistance(distanceFromMag(m)) = m', Math.abs(M.magFromDistance(M.distanceFromMag(18.5)) - 18.5) < 1e-9);

// ---- P2: Hubble's solution
const sol = M.solveHubble(N);
out.push(`      4-parameter solution on Table 1: K=${sol.K.toFixed(0)} X=${sol.X.toFixed(0)} Y=${sol.Y.toFixed(0)} Z=${sol.Z.toFixed(0)} V0=${sol.V0.toFixed(0)} mean|res|=${sol.meanAbsResidual.toFixed(0)}  (paper: K=465±50 X=-65±50 Y=+226±95 Z=-195±40 V0=306 res≈150)`);
check('P2 K within 465 ± 50', Math.abs(sol.K - C.K_24) <= C.K_24_ERR, sol.K.toFixed(0));
check('P2 X within -65 ± 50', Math.abs(sol.X - C.SOLAR.X) <= 50, sol.X.toFixed(0));
check('P2 Y within 226 ± 95', Math.abs(sol.Y - C.SOLAR.Y) <= 95, sol.Y.toFixed(0));
check('P2 Z within -195 ± 40', Math.abs(sol.Z - C.SOLAR.Z) <= 40, sol.Z.toFixed(0));
check('P2 V0 within 306 ± 60', Math.abs(sol.V0 - C.V0_24) <= 60, sol.V0.toFixed(0));
check('P2 mean residual 150 ± 40 km/s', Math.abs(sol.meanAbsResidual - C.RESIDUAL_24) <= 40, sol.meanAbsResidual.toFixed(0));
check('P2b the printed solar motion has speed about 306', Math.abs(Math.hypot(C.SOLAR.X, C.SOLAR.Y, C.SOLAR.Z) - C.V0_24) < 5, Math.hypot(C.SOLAR.X, C.SOLAR.Y, C.SOLAR.Z).toFixed(0));

// ---- P3: fit through origin on corrected velocities (the plate after the Sun's motion is taken out)
const corrPts = N.map(n => ({ r: n.r, v: M.correctedVelocity(n.v, n.ra, n.dec) }));
const K0 = M.fitK(corrPts), rho = M.correlation(corrPts), rhoRaw = M.correlation(N.map(n => ({ r: n.r, v: n.v })));
check('P3 fit through origin on all 24 corrected lands between 415 and 573', K0 >= C.WITHIN_HUBBLE_LO && K0 <= C.WITHIN_HUBBLE_HI, K0.toFixed(0));
check('P3b correlation of corrected velocities with distance is strong (> 0.75)', rho > 0.75, rho.toFixed(2) + ' (raw ' + rhoRaw.toFixed(2) + ')');

// ---- P4: Humason's nebula
const H = C.HUMASON;
const vc = M.correctedVelocity(H.v, 350.1, 8.2); // NGC 7619: RA 23h20.2m = 350.1°, Dec +8.2° (catalogue)
check('P4 NGC 7619 corrected velocity about 3910 (± 60)', Math.abs(vc - H.v_corr) <= 60, vc.toFixed(0));
check('P4b 3910 / 500 = 7.8 million parsecs (p. 173)', Math.abs(H.v_corr / C.K_ROUND - H.r_from_K) < 0.05, (H.v_corr / C.K_ROUND).toFixed(2));
check('P4c absolute magnitude at 7.8 million parsecs from m = 11.8 is -17.65 (p. 173)', Math.abs((H.m - 5 * Math.log10(H.r_from_K * 1e6) + 5) - (-17.65)) < 0.02, (H.m - 5 * Math.log10(H.r_from_K * 1e6) + 5).toFixed(2));

// ---- P5: spectrograph
const lam = M.shiftedLambda(C.LINES[0].lambda, 1000);
check('P5 1000 km/s shifts the K line by about 13 Å', Math.abs((lam - C.LINES[0].lambda) - 13.1) < 0.2, (lam - C.LINES[0].lambda).toFixed(2) + ' Å');
let rt = true; for (const v of [-300, -30, 0, 170, 1090, 3779]) if (Math.abs(M.velocityFromShift(C.LINES[0].lambda, M.shiftedLambda(C.LINES[0].lambda, v)) - v) > 1e-6) rt = false;
check('P5b shift → velocity round-trips', rt);
check('P5c Humason\'s shift keeps both lines inside the window', M.shiftedLambda(C.LINES[1].lambda, H.v) < C.WINDOW.hi && M.shiftedLambda(C.LINES[0].lambda, -300) > C.WINDOW.lo, M.shiftedLambda(C.LINES[1].lambda, H.v).toFixed(1));
const lpBright = M.lineProfile(N[6]), lpFaint = M.lineProfile(N[19]);
check('P5d fainter nebula has wider, shallower lines (p. 168)', lpFaint.widthA > lpBright.widthA && lpFaint.depth < lpBright.depth, `M101 w=${lpBright.widthA.toFixed(1)} d=${lpBright.depth.toFixed(2)}; 4151 w=${lpFaint.widthA.toFixed(1)} d=${lpFaint.depth.toFixed(2)}`);

// ---- P6: the Sun's motion and the approaching nebulae
const approachingRaw = N.filter(n => n.v < 0).length;
const approachingCorr = corrPts.filter(p => p.v < -100).length;
out.push('      corrected velocities: ' + N.map((n, i) => `${n.short} ${n.v}→${corrPts[i].v.toFixed(0)}`).join(', '));
check('P6 five nebulae approach in the raw table; after correction none is below -100 km/s', approachingRaw === 5 && approachingCorr <= 1, `${approachingRaw} raw, ${approachingCorr} below -100 after`);
check('P6b M31 (-220) corrected sits above -120 (Fig. 1 shows it near zero)', corrPts[5].v > -120, corrPts[5].v.toFixed(0));

// ---- Game framing
const costs = N.map(n => M.cost(n));
const total = costs.reduce((a, b) => a + b, 0);
check('G1 costs: 1 night for m_s < 18, 2 for 18–19.4, 3 for fainter and for Virgo', costs[6] === 1 && costs[10] === 2 && costs[18] === 3 && costs[20] === 3, costs.join(''));
check('G2 twelve nights cannot buy the whole table', total > C.NIGHTS, 'whole table costs ' + total);
check('G3 twelve nights buy at least four far nebulae (cost 3)', Math.floor(C.NIGHTS / 3) >= 4);
const st = M.newGame(5);
check('G4 observing a Virgo nebula costs three nights and lands on the plate', (M.observe(st, 20, 2.0, 500), st.nightsLeft === 9 && M.platePoints(st).length === 1));
let threw = false; try { M.observe(st, 20, 2, 500); } catch (e) { threw = true; }
check('G5 a nebula cannot be observed twice', threw);
for (let i = 0; i < 9; i++) if (M.canObserve(st, i)) M.observe(st, i, N[i].r, N[i].v);
check('G6 nights run out and nightsOver is true', M.nightsOver(st) && st.nightsLeft === 0, 'left ' + st.nightsLeft);
check('G7 tolerance rings: 15% in distance, 40 km/s in velocity', M.eyeMatch(N[7], 0.56) && !M.eyeMatch(N[7], 0.6) && M.specMatch(N[7], 320) && !M.specMatch(N[7], 340));

// ---- Heuristics (memo, section 17)
const h = M.heuristics(7);
out.push('      heuristics (noisy readings within the rings; K through origin after the Sun is taken out):');
for (const k in h) out.push(`        ${k.padEnd(34)} n=${String(h[k].n).padStart(2)}  farthest=${h[k].maxR.toFixed(2)}  K=${h[k].K.toFixed(0).padStart(4)}  corr=${h[k].corr.toFixed(2)}`);
check('H1 nearest-and-cheapest never reaches a far nebula (farthest < 1.3)', h['nearest and cheapest first'].maxR < 1.3);
check('H2 four Virgo only: all at one distance, no correlation to see', Math.abs(h['four Virgo only'].corr) < 0.3);
check('H3 alternating far and near shows the relation most clearly (corr > 0.9) with K between 300 and 650', h['alternate far and near'].corr > 0.9 && h['alternate far and near'].K > 300 && h['alternate far and near'].K < 650, `K=${h['alternate far and near'].K.toFixed(0)}`);
check('H3b the strategies spread: correlations differ by more than 0.5 between some pair', Math.max(...Object.values(h).map(x => x.corr)) - Math.min(...Object.values(h).map(x => x.corr)) > 0.5);
// the near-only player's discovery is the Sun's motion: raw cloud, corrected line
const near = (() => { const s = M.newGame(1); const byCost = [...Array(N.length).keys()].sort((a, b) => M.cost(N[a]) - M.cost(N[b]) || M.brightestStarMag(N[a]) - M.brightestStarMag(N[b])); for (const i of byCost) if (M.canObserve(s, i)) M.observe(s, i, N[i].r, N[i].v); const raw = M.correlation(M.platePoints(s)); M.takeOutSun(s); return { raw, corr: M.correlation(M.platePoints(s)), K: M.fitK(M.platePoints(s)) }; })();
check('H4 near-only, exact readings: raw correlation weak (< 0.5), corrected strong (> 0.7)', near.raw < 0.5 && near.corr > 0.7, `raw ${near.raw.toFixed(2)} → corrected ${near.corr.toFixed(2)}, K=${near.K.toFixed(0)}`);
// robustness of the central discovery to the designer's choices: budget 9 and 15
for (const budget of [9, 15]) { const save = C.NIGHTS; C.NIGHTS = budget; const hh = M.heuristics(11); C.NIGHTS = save; check(`H5 with ${budget} nights, alternating still shows the relation (corr > 0.6, K 300–650)`, hh['alternate far and near'].corr > 0.6 && hh['alternate far and near'].K > 300 && hh['alternate far and near'].K < 650, `K=${hh['alternate far and near'].K.toFixed(0)} corr=${hh['alternate far and near'].corr.toFixed(2)}`); }
// noise over seeds
let ks = [], cs = []; for (let s = 1; s <= 300; s++) { const x = M.heuristics(s)['alternate far and near']; ks.push(x.K); cs.push(x.corr); }
check('H6 over 300 seeds of reading noise, alternating K stays within 300–600 and corr > 0.8', Math.min(...ks) > 300 && Math.max(...ks) < 600 && Math.min(...cs) > 0.8, `K ${Math.min(...ks).toFixed(0)}–${Math.max(...ks).toFixed(0)}, corr min ${Math.min(...cs).toFixed(2)}`);
let fs = []; for (let s = 1; s <= 300; s++) fs.push(M.heuristics(s)['nearest and cheapest first']);
check('H7 over 300 seeds, near-only corrected K stays within 350–650', Math.min(...fs.map(x => x.K)) > 350 && Math.max(...fs.map(x => x.K)) < 650, `${Math.min(...fs.map(x => x.K)).toFixed(0)}–${Math.max(...fs.map(x => x.K)).toFixed(0)}`);

// ---- Words
const st2 = M.newGame(3); for (const i of [5, 7, 8, 20]) M.observe(st2, i, N[i].r, N[i].v);
check('W1 plate words after three nearby raw reads say cloud', /cloud/i.test((() => { const s = M.newGame(1); for (const i of [2, 5, 7, 11]) M.observe(s, i, N[i].r, N[i].v); return M.plateWords(s); })()));
check('W2 plate words with three near and a Virgo nebula say climb or lean', /climb|lean/i.test(M.plateWords(st2)), M.plateWords(st2));
const stV = M.newGame(2); for (const i of [20, 21, 22, 23]) M.observe(stV, i, 2.0, N[i].v);
check('W2b plate words with Virgo only say nothing to compare', /same distance/.test(M.plateWords(stV)), M.plateWords(stV));
M.takeOutSun(st2); M.setRate(st2, 480); M.commitPrediction(st2, M.predictHumason(st2));
const v = M.verdict(st2);
check('W3 verdict: within Hubble\'s two solutions at 480', /within/.test(v.rate), v.rate);
check('W4 verdict: prediction at 480 × 7 = 3360 is called close to 3779', /Close/.test(v.test), v.test);
M.setRate(st2, 0); M.commitPrediction(st2, 0);
check('W5 rate 0 reads as "do not depend on distance"', /do not depend/.test(M.rateWords(st2)));
check('W6 no decimals in the verdict lines', !/\d\.\d/.test(v.did + v.rate + v.test + v.plate + v.meaning), v.did);

// ---- Seeds
let same = true; for (let s = 1; s <= 50; s++) { const a = M.makeRng(s), b = M.makeRng(s); for (let i = 0; i < 20; i++) if (a() !== b()) same = false; }
check('S1 seeds are replayable', same);

out.unshift(`Hubble's Twelve Nights — calibration against Hubble (1929). ${pass} passed, ${fail} failed.`);
require('fs').writeFileSync(__dirname + '/calibration-result.txt', out.join('\n') + '\n');
console.log(out.join('\n'));
process.exit(fail ? 1 : 0);
