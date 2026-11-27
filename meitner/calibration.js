// Calibration check for Meitner's Drop (build.md section 2). Run: node calibration.js. Exits 1 on any failure.
var m = require('./mechanism.js'), C = m.CONFIG, U = C.URANIUM, TH = C.THORIUM;
var fails = 0;
function ok(cond, what) { console.log((cond ? 'ok   ' : 'FAIL ') + what); if (!cond) fails++; }
function reach(path) { return path[path.length - 1]; }
function clearsU(actions) {               // with every pinch going through (the odds are checked separately)
  var st = m.newStage(U, C.TUBES_U, actions.length); st.rng = function () { return 0; };
  actions.forEach(function (a) { m.play(st, a); });
  return C.TUBES_U.every(function (t) { return st.lit[t.id]; });
}
function range(lo, hi) { var a = []; for (var z = lo; z <= hi; z++) a.push(z); return a; }
var Z1s = range(C.MIN_PIECE, U.Z - C.MIN_PIECE);
// rev. 4: the cut may go anywhere (1 to 91), but a cut far out has a chance of about nil. The claims about where the tubes light are made for the cuts with a real chance (5% or more), which are the 29 to 63 of the earlier builds.
var REAL = Z1s.filter(function (z) { return m.splitOdds(U, z) >= 0.05; });

// 1. the paper's numbers
var eq = m.split(U, 46);
ok(Math.abs(eq.energyMeV - C.PAPER_E_MEV) / C.PAPER_E_MEV < 0.05, 'equal split of 239U flies apart with ' + eq.energyMeV.toFixed(0) + ' Mev (paper, p. 239: c. 200 Mev; tolerance 5%)');
ok(C.R0_FM >= 1.2 && C.R0_FM <= 1.6, 'the fitted radius constant r0 = ' + C.R0_FM + ' fm lies in the range 1939 used (1.2-1.6 fm)');
ok(eq.lostProtons > 0.18 && eq.lostProtons < 0.24, 'the two pieces lose about a fifth of a proton between them (' + eq.lostProtons.toFixed(2) + '), E = mc^2 on the paper\'s 200 Mev');
ok(U.Z - 56 === 36, 'barium\'s partner is krypton: 92 - 56 = 36 (p. 239)');
ok(Math.abs(m.skin(C.IMAGINED)) < 0.02, 'the skin is gone at Z = 100 (p. 239: surface tension may become zero for Z of the order of 100): ' + m.skin(C.IMAGINED).toFixed(3));
ok(m.skinClass(C.LEAD) === 'holds' && m.skinClass(U) === 'barely' && m.skinClass(C.IMAGINED) === 'gone', 'lead holds, uranium barely holds (p. 239: "only small stability of form"), the imagined drop falls apart: ' + [m.skin(C.LEAD), m.skin(U), m.skin(C.IMAGINED)].map(function (s) { return s.toFixed(2); }).join(' / '));
var h = m.hold(U);
ok(h.pieces[0].path.length === 2 && reach(h.pieces[0].path) === 93, '239U climbs exactly one step, to element 93 (p. 240: 239U goes over into an eka-rhenium; "cannot be expected to give more than one or two beta decays")');

// 2. the paper's chains
C.PAPER_CHAINS.forEach(function (ch) {
  var s = m.split(U, ch.from), p = s.pieces[0].path;
  ok(reach(p) >= ch.reaches && reach(p) <= ch.reaches + 3, 'from ' + m.nameOf(ch.from) + ' the climb reaches ' + m.nameOf(reach(p)) + ' (' + (p.length - 1) + ' steps); the paper: ' + ch.words);
});
var s43 = m.split(U, 43);
ok(reach(s43.pieces[0].path) === 48, 'the masurium piece climbs exactly into cadmium (p. 239: "... silver into cadmium")');
ok(REAL.every(function (z) { var s = m.split(U, z); return s.pieces.every(function (p) { return p.path.length - 1 >= 3 && p.path.length - 1 <= 6; }); }), 'every piece of a cut with a real chance changes 3 to 6 times');

// 3. the table
C.TUBES_U.concat(C.TUBES_TH).forEach(function (t) { ok(m.cellOf(t.cellZ).col === t.col, 'tube "' + t.label + '" stands in column ' + (t.col + 1) + ' of the 1939 table, cell ' + t.cellZ); });
ok(m.cellOf(92).col === m.cellOf(74).col && m.cellOf(93).col === m.cellOf(75).col && m.cellOf(94).col === m.cellOf(76).col, 'uranium under tungsten, 93 under rhenium, 94 under osmium: the 1939 placement that made the eka-names fit their chemistry');
ok(m.cellOf(56).col === m.cellOf(38).col && m.cellOf(57).col === m.cellOf(39).col, 'strontium under barium, yttrium under lanthanum (p. 239: Sr-Y-Zr chains mistaken for Ba-La-Ce)');

// 4. what the moves light
var st = m.newStage(U, C.TUBES_U, 5, 7); // seed 7: the barium pinch goes through
var mv = m.play(st, { kind: 'split', Z1: 56 });
ok(mv.lit.map(function (l) { return l.id; }).sort().join() === 'ba,la', 'the pinch at 56 | 36 lights barium and lanthanum: ' + mv.lit.map(function (l) { return l.id + '@' + l.atZ; }).join(' '));
ok(mv.lookalikes.some(function (k) { return k.Z === 38 && k.tube === 'ba'; }) && mv.lookalikes.some(function (k) { return k.Z === 39 && k.tube === 'la'; }), 'the krypton piece passes strontium and yttrium, which act like barium and lanthanum');
mv = m.play(st, { kind: 'split', Z1: 43 });
ok(mv.lit.map(function (l) { return l.id; }).sort().join() === 'eAu,eIr,eOs,ePt,eRe', 'the pinch at 43 | 49 lights all five tubes filed beyond uranium: ' + mv.lit.map(function (l) { return l.id + '@' + l.atZ; }).join(' '));
mv = m.play(st, { kind: 'hold' });
ok(mv.lit.length === 1 && mv.lit[0].id === 'u24', 'the hold lights the 24-minute tube and nothing else');
ok(m.stageDone(st) && st.used === 3, 'the shelf is clear after three neutrons');
ok(Z1s.every(function (z) { var s = m.split(U, z); return !m.lightTubes(s, C.TUBES_U, U.Z).some(function (l) { return l.id === 'u24'; }); }), 'no pinch lights the 24-minute tube (p. 240: it is 239U, a resonance capture)');
ok(Z1s.every(function (z) { var s = m.split(U, z); return s.pieces.every(function (p) { return p.path.every(function (Z) { return !m.isDashed(Z); }); }); }), 'no piece of any pinch ever lands in or climbs into the dashed row');
var any2 = false; Z1s.forEach(function (a) { Z1s.forEach(function (b) { if (clearsU([{ kind: 'split', Z1: a }, { kind: 'split', Z1: b }])) any2 = true; }); if (clearsU([{ kind: 'split', Z1: a }, { kind: 'hold' }])) any2 = true; });
ok(!any2, 'no two neutrons clear the uranium shelf; three is the minimum (the verdict says "where three would do")');
var ways3 = 0; Z1s.forEach(function (a) { Z1s.forEach(function (b) { if (a <= b && clearsU([{ kind: 'split', Z1: a }, { kind: 'split', Z1: b }, { kind: 'hold' }])) ways3++; }); });
ok(ways3 > 0, ways3 + ' pairs of pinches plus a hold clear the shelf in three neutrons');
var fiveEka = REAL.filter(function (z) { var s = m.split(U, z); return m.lightTubes(s, C.TUBES_U, U.Z).filter(function (l) { return m.isDashed(m.tubeById(C.TUBES_U, l.id).cellZ); }).length === 5; });
ok(fiveEka.length >= 1 && fiveEka.length <= 4 && fiveEka.indexOf(43) >= 0, 'the cuts (5% chance or better) that bring all five ghosts down at once are ' + fiveEka.join(', ') + ': near masurium, as the paper has it (p. 239), and not many');
var baLa = REAL.filter(function (z) { var s = m.split(U, z); var ids = m.lightTubes(s, C.TUBES_U, U.Z).map(function (l) { return l.id; }); return ids.indexOf('ba') >= 0 && ids.indexOf('la') >= 0; });
ok(baLa.length >= 2 && baLa.length <= 20 && baLa.indexOf(46) < 0, 'the cuts (5% chance or better) that light barium and lanthanum are ' + baLa.join(', ') + ' (some ways, not every way, and not the exactly equal pinch)');
var eqLit = m.lightTubes(eq, C.TUBES_U, U.Z);
ok(eqLit.length === 2 && !eqLit.some(function (l) { return l.id === 'ba' || l.id === 'la'; }), 'the exactly equal pinch, the obvious first move, lights only two tubes and neither barium nor lanthanum: the paper\'s "roughly equal" is not "equal"');
ok(Z1s.filter(function (z) { return m.lightTubes(m.split(U, z), C.TUBES_U, U.Z).length <= 1; }).length > 0, 'some pinches light one tube or none: ' + Z1s.filter(function (z) { return m.lightTubes(m.split(U, z), C.TUBES_U, U.Z).length <= 1; }).join(', '));
ok(m.split(U, 28).energyMeV < eq.energyMeV && m.split(U, 36).energyMeV < eq.energyMeV, 'an uneven pinch gives a smaller blast than an even one (our Coulomb rule; the paper computes only the equal case)');

// 4b. the odds (rev. 2)
var odds = Z1s.map(function (z) { return m.splitOdds(U, z); });
ok(odds.every(function (p, i) { return i === 0 || (Z1s[i] <= 46 ? p >= odds[i - 1] - 1e-9 : p <= odds[i - 1] + 1e-9); }), 'the odds of splitting rise toward the middle and fall away from it, symmetrically');
ok(m.splitOdds(U, 43) === 1 && m.splitOdds(U, 49) === 1 && m.splitOdds(U, 46) === 1, 'pinches within three of the middle (43 to 49, the ghosts\' pinches) always go through: "roughly equal size"');
ok(m.splitOdds(U, 56) > 0.2 && m.splitOdds(U, 56) < 0.3 && m.splitOdds(U, 36) === m.splitOdds(U, 56), 'the pinch aimed at barium\'s own cell (56 | 36) splits about one time in four: ' + m.splitOdds(U, 56).toFixed(2));
ok(m.splitOdds(U, 52) > 0.62 && m.splitOdds(U, 52) < 0.85, 'the climb-aware pinch (52 | 40, tellurium climbs to barium) splits about three times in four: ' + m.splitOdds(U, 52).toFixed(2));
ok(m.splitOdds(U, 54) > 0.35 && m.splitOdds(U, 54) < 0.5, 'the pinch at 54 | 38 (strontium and tellurium, three tubes) splits about one time in two: ' + m.splitOdds(U, 54).toFixed(2));
ok(m.splitOdds(U, 28) < 0.1, 'the most uneven pinch allowed (28 | 64) hardly ever splits: ' + m.splitOdds(U, 28).toFixed(2));
var wins = 0, N = 2000; for (var sd = 1; sd <= N; sd++) { var s1 = m.newStage(U, C.TUBES_U, 1, sd); if (m.play(s1, { kind: 'split', Z1: 54 }).kind === 'split') wins++; }
ok(Math.abs(wins / N - m.splitOdds(U, 54)) < 0.04, 'over ' + N + ' seeds the 54 | 38 pinch went through ' + (wins / N * 100).toFixed(0) + '% of the time against stated odds of ' + (m.splitOdds(U, 54) * 100).toFixed(0) + '% (the draw matches the words)');
var r1 = m.newStage(U, C.TUBES_U, 4, 5), mvR = null; for (var sd2 = 1; sd2 < 500 && !mvR; sd2++) { var s2 = m.newStage(U, C.TUBES_U, 4, sd2); var mm = m.play(s2, { kind: 'split', Z1: 60 }); if (mm.kind === 'rang') mvR = { st: s2, mv: mm }; }
ok(mvR && mvR.mv.lit.length === 1 && mvR.mv.lit[0].id === 'u24' && mvR.mv.pieces[0].path[1] === 93, 'a pinch the skin pulls back keeps the neutron: it lights the 24-minute tube and climbs to 93, like a hold');
ok(mvR && m.moveWords(mvR.st, mvR.mv).length >= 2 && m.moveWords(mvR.st, mvR.mv)[0].indexOf('it failed (the chance was') > 0, 'the failed cut has words that say it failed and what the chance was');
function clearProb(acts, n) { var c2 = 0; for (var sd3 = 1; sd3 <= n; sd3++) { var s3 = m.newStage(U, C.TUBES_U, C.NEUTRONS_U, sd3); acts.forEach(function (a) { if (!m.stageDone(s3)) m.play(s3, a); }); if (C.TUBES_U.every(function (t) { return s3.lit[t.id]; })) c2++; } return c2 / n; }
var pSafe = clearProb([{ kind: 'split', Z1: 43 }, { kind: 'hold' }, { kind: 'split', Z1: 56 }, { kind: 'split', Z1: 56 }], 1000);
var pBold = clearProb([{ kind: 'split', Z1: 43 }, { kind: 'hold' }, { kind: 'split', Z1: 52 }, { kind: 'split', Z1: 52 }], 1000);
var pEven = clearProb([{ kind: 'split', Z1: 46 }, { kind: 'split', Z1: 46 }, { kind: 'split', Z1: 46 }, { kind: 'split', Z1: 46 }], 1000);
ok(pSafe > 0.3 && pSafe < 0.6, 'ghosts first, hold, then two tries aimed at barium\'s own cell clears the shelf ' + (pSafe * 100).toFixed(0) + '% of the time: reachable, far from guaranteed');
ok(pBold > 0.8 && pBold < 0.97, 'the climb-aware path (43 | 49, hold, then 52 | 40 twice) clears the shelf ' + (pBold * 100).toFixed(0) + '% of the time: knowing the climb is worth about ' + ((pBold - pSafe) * 100).toFixed(0) + ' points');
ok(pEven === 0, 'the exactly equal pinch four times never clears the shelf');

// 5. thorium
var stT = m.newStage(TH, C.TUBES_TH, 3); stT.rng = function () { return 0; };
mv = m.play(stT, { kind: 'split', Z1: 56 });
ok(mv.lit.map(function (l) { return l.id; }).sort().join() === 'ac,ra', 'thorium pinched at 56 | 34 lights the radium and actinium tubes from barium and lanthanum (p. 239: thorium\'s periods equal barium\'s and lanthanum\'s)');
var thZ = range(C.MIN_PIECE, TH.Z - C.MIN_PIECE);
ok(thZ.some(function (z) { return m.lightTubes(m.split(TH, z), C.TUBES_TH, TH.Z).length === 0; }), 'some thorium pinches light neither tube');
var thLit = thZ.filter(function (z) { return m.lightTubes(m.split(TH, z), C.TUBES_TH, TH.Z).length === 2; });
ok(thLit.length > 0 && thLit.every(function (z) { return m.splitOdds(TH, z) < 0.6; }), 'every thorium pinch that lights both tubes (' + thLit.join(', ') + ') is one the skin pulls back at least two times in five: thorium needs its three neutrons');
var pTh = 0; for (var sd4 = 1; sd4 <= 1000; sd4++) { var s4 = m.newStage(TH, C.TUBES_TH, C.NEUTRONS_TH, sd4); [38, 38, 38].forEach(function (z) { if (!m.stageDone(s4)) m.play(s4, { kind: 'split', Z1: z }); }); if (C.TUBES_TH.every(function (t) { return s4.lit[t.id]; })) pTh++; }
ok(pTh / 1000 > 0.75, 'three tries at 38 | 52 light both thorium tubes ' + (pTh / 10).toFixed(0) + '% of the time');

// 6. robustness of the central discovery (build.md section 1): the ghosts come down from the middle rows under other plausible rules
var saved = { A: C.VALLEY_A, B: C.VALLEY_B, M: C.MIN_PIECE };
// alternatives are admitted only if they still reproduce the paper's own chains: masurium reaching silver to indium (p. 239: into cadmium), krypton reaching yttrium to niobium (p. 239: to zirconium)
var alt = [[1.98, 0.0124], [2.1, 0.012], [1.9, 0.019], [2.05, 0.0135], [1.95, 0.0165], [2.0, 0.0150]];
var admitted = 0;
var robust = alt.every(function (ab) {
  C.VALLEY_A = ab[0]; C.VALLEY_B = ab[1];
  var ma = m.split(U, 43).pieces[0].path, kr = m.split(U, 36).pieces[0].path;
  var top = function (p) { return p[p.length - 1]; };
  if (top(ma) < 47 || top(ma) > 49 || top(kr) < 39 || top(kr) > 41) return true; // not admitted: it does not reproduce the paper's chains
  admitted++;
  var zs = range(C.MIN_PIECE, U.Z - C.MIN_PIECE);
  var five = zs.some(function (z) { return m.lightTubes(m.split(U, z), C.TUBES_U, U.Z).filter(function (l) { return m.isDashed(m.tubeById(C.TUBES_U, l.id).cellZ); }).length === 5; });
  var bl = zs.some(function (z) { var ids = m.lightTubes(m.split(U, z), C.TUBES_U, U.Z).map(function (l) { return l.id; }); return ids.indexOf('ba') >= 0 && ids.indexOf('la') >= 0; });
  var none = zs.some(function (z) { return m.lightTubes(m.split(U, z), C.TUBES_U, U.Z).length <= 1; });
  var no24 = zs.every(function (z) { return !m.lightTubes(m.split(U, z), C.TUBES_U, U.Z).some(function (l) { return l.id === 'u24'; }); });
  return five && bl && none && no24;
});
C.VALLEY_A = saved.A; C.VALLEY_B = saved.B;
ok(robust && admitted >= 4, 'under ' + admitted + ' other valley-of-stability rules that still reproduce the paper\'s own chains, some pinch still brings all five ghosts down, some pinch lights barium and lanthanum, some pinch lights one tube or none, and no pinch lights the 24-minute tube');
var robust2 = [24, 26, 30, 32].every(function (mp) {
  C.MIN_PIECE = mp; var zs = range(mp, U.Z - mp);
  return zs.some(function (z) { return m.lightTubes(m.split(U, z), C.TUBES_U, U.Z).filter(function (l) { return m.isDashed(m.tubeById(C.TUBES_U, l.id).cellZ); }).length === 5; }) && !zs.some(function (a) { return zs.some(function (b) { return clearsU([{ kind: 'split', Z1: a }, { kind: 'split', Z1: b }]); }); });
});
C.MIN_PIECE = saved.M;
ok(robust2, 'with the smallest piece set anywhere from 24 to 32 protons, the five ghosts still come down together and no two pinches clear the shelf');
// the neutron share: give the light piece a few neutrons more or fewer than its proportional share
var origShare = m.shareNeutrons;
ok([-3, -2, 2, 3].every(function (d) {
  var s = m.split(U, 43); var N1 = s.pieces[0].N + d, A1 = 43 + N1; var p = m.climb(43, A1);
  return m.lightTubes({ kind: 'split', pieces: [{ Z: 43, A: A1, path: p }, { Z: 49, A: 239 - A1, path: m.climb(49, 239 - A1) }] }, C.TUBES_U, U.Z).filter(function (l) { return m.isDashed(m.tubeById(C.TUBES_U, l.id).cellZ); }).length >= 4;
}), 'if the masurium piece gets 2-3 neutrons more or fewer than its share (p. 239: "varying proportions of neutrons"), at least four of the five ghosts still come down');

// 7. words for every move and every verdict path
ok(Z1s.every(function (z) { var s2 = m.newStage(U, C.TUBES_U, 5); s2.rng = function () { return 0; }; var mv2 = m.play(s2, { kind: 'split', Z1: z }); return m.moveWords(s2, mv2).length >= 3; }), 'every pinch that goes through has at least three lines of result in the game\'s voice');
function wc(a) { return a.join(' ').split(/\s+/).length; }
var longest = 0; Z1s.forEach(function (z) { var s2 = m.newStage(U, C.TUBES_U, 5); s2.rng = function () { return 0; }; var mv2 = m.play(s2, { kind: 'split', Z1: z }); longest = Math.max(longest, wc(m.moveWords(s2, mv2))); });
ok(longest <= 80, 'rev. 3: the longest result after a split is ' + longest + ' words (the second build said about 127): short enough to read at the bench');
var rr = m.newStage(U, C.TUBES_U, 4, 1); rr.rng = function () { return 0.9999; }; var mR = m.play(rr, { kind: 'split', Z1: 56 }); var hh = m.newStage(U, C.TUBES_U, 4, 1); var mH = m.play(hh, { kind: 'hold' });
ok(wc(m.moveWords(rr, mR)) <= 80 && wc(m.moveWords(hh, mH)) <= 80, 'rev. 3: the pulled-back and the hold results are short too (' + wc(m.moveWords(rr, mR)) + ' and ' + wc(m.moveWords(hh, mH)) + ' words)');
// the shelf cards (rev. 3): every card's text, waiting or explained, must fit its card at phone width (about 22 characters at 13.5 px)
var longestCard = 0, cardsFit = true;
C.TUBES_U.concat(C.TUBES_TH).forEach(function (t) { longestCard = Math.max(longestCard, t.wait.length); if (t.wait.length > 21) cardsFit = false; });
[[U, C.TUBES_U, Z1s], [TH, C.TUBES_TH, range(C.MIN_PIECE, TH.Z - C.MIN_PIECE)]].forEach(function (a) { a[2].forEach(function (z) { m.lightTubes(m.split(a[0], z), a[1], a[0].Z).forEach(function (l) { var ans = m.tubeAnswer(m.tubeById(a[1], l.id), l.atZ); longestCard = Math.max(longestCard, ans.length); if (ans.length > 21) cardsFit = false; }); }); });
ok(cardsFit, 'rev. 3: every shelf card, waiting or explained by any pinch, is at most 21 characters (longest ' + longestCard + '), so it fits the card at 380 px');
ok(m.tubeAnswer(m.tubeById(C.TUBES_U, 'eRe'), 43) === '93 = masurium' && m.tubeAnswer(m.tubeById(C.TUBES_U, 'ba'), 38) === '= strontium' && m.tubeAnswer(m.tubeById(C.TUBES_U, 'ba'), 56) === '= barium itself' && m.tubeAnswer(m.tubeById(C.TUBES_U, 'u24'), 92) === '= uranium itself', 'rev. 3: an explained card says what the body really is (93 = masurium, = strontium, = barium itself, = uranium itself)');
// the preview (rev. 3): the climb trail drawn before the pinch is exactly the path the pinch then takes, and it never enters the dashed row
ok(Z1s.every(function (z) { var pv = m.split(U, z); var st9 = m.newStage(U, C.TUBES_U, 5); st9.rng = function () { return 0; }; var mv9 = m.play(st9, { kind: 'split', Z1: z }); return JSON.stringify(pv.pieces.map(function (p) { return p.path; })) === JSON.stringify(mv9.pieces.map(function (p) { return p.path; })); }), 'rev. 3: the trail shown for a pinch is the very path the pinch takes (the preview calls the mechanism, not a copy of it)');
// the verdict is fair about luck (rev. 3): a clear shelf in four neutrons with pinches the skin took does not say that three would have done
var vs = m.newStage(U, C.TUBES_U, 4, 2); [56, 56, 43, 52].forEach(function (z) { m.play(vs, { kind: 'split', Z1: z }); });
var vv = m.verdict(vs, null);
ok(vv.allU && vs.moves.some(function (x) { return x.kind === 'rang'; }) && vv.story.join(' ').indexOf('used up your spare') > 0 && vv.story.join(' ').indexOf('Three would have done') < 0, 'rev. 3: a shelf cleared in four neutrons after the skin took some says so, and does not say that three would have done (seed 2)');
ok(Z1s.every(function (z) { var s2 = m.newStage(U, C.TUBES_U, 5); s2.rng = function () { return 0.9999; }; var mv2 = m.play(s2, { kind: 'split', Z1: z }); return mv2.kind === 'split' ? m.splitOdds(U, z) === 1 : m.moveWords(s2, mv2).length >= 2; }), 'every pinch the skin can pull back has words for that too');
var sH = m.newStage(U, C.TUBES_U, 5); ok(m.moveWords(sH, m.play(sH, { kind: 'hold' })).length >= 2, 'the hold has words');
var paths = [[{ kind: 'split', Z1: 56 }, { kind: 'split', Z1: 43 }, { kind: 'hold' }], [{ kind: 'split', Z1: 46 }, { kind: 'split', Z1: 46 }, { kind: 'split', Z1: 46 }, { kind: 'split', Z1: 46 }], [{ kind: 'hold' }, { kind: 'hold' }, { kind: 'hold' }, { kind: 'hold' }], [{ kind: 'split', Z1: 28 }, { kind: 'split', Z1: 64 }, { kind: 'split', Z1: 30 }, { kind: 'split', Z1: 33 }], [{ kind: 'split', Z1: 56 }, { kind: 'split', Z1: 44 }, { kind: 'split', Z1: 38 }, { kind: 'hold' }], [{ kind: 'split', Z1: 60 }, { kind: 'split', Z1: 60 }, { kind: 'split', Z1: 60 }, { kind: 'split', Z1: 60 }]];
paths.forEach(function (p, i) {
  var a = m.newStage(U, C.TUBES_U, C.NEUTRONS_U, 11 + i); p.forEach(function (x) { m.play(a, x); });
  var b = m.newStage(TH, C.TUBES_TH, 2); m.play(b, { kind: 'split', Z1: i % 2 ? 45 : 56 });
  var v = m.verdict(a, b);
  var txt = v.story.join(' ');
  ok(v.fate && v.chips.length === 5 && v.claimed === 5 && v.paperDown === 5 && v.you >= 0 && v.you <= 5 && v.chips.filter(function (c) { return c.real; }).length === v.you && v.story.length >= 5 && /What Meitner and Frisch saw/.test(txt) && /protactinium/.test(txt) && v.seed !== undefined && (v.you === 5 ? /All five/.test(txt) : (v.you === 0 ? /None of the five/.test(txt) : /still stands? in the dashed row/.test(txt))), 'rev. 6 verdict path ' + (i + 1) + ': "' + v.fate + '", you took away ' + v.you + ' of 5, the story has ' + v.story.length + ' paragraphs');
});

// ---------- rev. 4: the whole range, the chance in percent, the preview that tells the truth ----------
ok(m.clampZ1(U, -5) === 1 && m.clampZ1(U, 500) === 91 && m.clampZ1(TH, 500) === 89, 'rev. 4: the cut may go anywhere from 1 to 91 on uranium (1 to 89 on thorium)');
ok(Z1s.length === 91 && Z1s.every(function (z) { var sp = m.split(U, z); return sp.pieces.every(function (p) { return p.path.every(function (Z) { return m.nameOf(Z).length > 0 && m.cellOf(Z); }); }); }), 'rev. 4: every cut from 1 to 91 has named pieces that all stand on the table or on the light-element strip');
ok(m.oddsLabel(m.splitOdds(U, 46)) === '100%' && m.oddsLabel(m.splitOdds(U, 56)) === '25%' && m.oddsLabel(m.splitOdds(U, 1)) === '<1%' && Z1s.every(function (z) { return /^(100%|<1%|\d+%)$/.test(m.oddsLabel(m.splitOdds(U, z))); }), 'rev. 4: the chance reads 100% in the middle, 25% at 56 | 36 and under 1% at the very edge');
ok(Z1s.every(function (z) { var pv = m.preview(m.newStage(U, C.TUBES_U, 4, 1), z), s9 = m.newStage(U, C.TUBES_U, 4, 1); s9.rng = function () { return 0; }; var mv9 = m.play(s9, { kind: 'split', Z1: z }); return JSON.stringify(pv.lights.map(function (l) { return l.id; })) === JSON.stringify(mv9.lit.map(function (l) { return l.id; })); }), 'rev. 4: the tubes the preview says a cut will light are exactly the tubes it lights when it works');
ok(Z1s.every(function (z) { var pv = m.preview(m.newStage(U, C.TUBES_U, 4, 1), z); return (pv.p < 0.995) === (pv.failLights === 'u24'); }) && m.preview((function () { var x = m.newStage(U, C.TUBES_U, 4, 1); x.lit.u24 = { id: 'u24' }; return x; })(), 56).failLights === null, 'rev. 4: a cut that can fail says so, and says the failure lights the 24-minute tube, until that tube is lit');
ok(Z1s.every(function (z) { var pv = m.preview(m.newStage(TH, C.TUBES_TH, 3, 1), Math.min(z, 89)); return pv.failLights === null; }), 'rev. 4: on thorium a failed cut lights nothing, and the preview does not promise it');
ok((function () { var bad = 0; Z1s.forEach(function (z) { var s9 = m.newStage(U, C.TUBES_U, 4, 3); s9.rng = function () { return 0; }; var mv9 = m.play(s9, { kind: 'split', Z1: z }); var w = m.moveWords(s9, mv9).join(' '); if (/pinch|skin|charge|climb/i.test(w)) bad++; }); return bad === 0; })(), 'rev. 4: the result lines use the plain words: no pinch, skin, charge or climb');


// ---------- rev. 5: handholding, what you will learn ----------
function plain(txt) { return !/pinch|skin|charge|climb|ghost/i.test(txt); }
function nt(h) { return h.replace(/<[^>]+>/g, ''); }
ok(Z1s.every(function (z) { var w = nt(m.previewWords(m.newStage(U, m.claimTubes(), 4, 1), z)); return /You will learn|learn nothing new/.test(w) && plain(w) && w.split(/\s+/).length <= 50; }), 'rev. 5: every cut from 1 to 91 has a preview that says what you will learn and is 50 words or fewer');
ok(/splits here for sure/.test(nt(m.previewWords(m.newStage(U, C.TUBES_U, 4, 1), 46))) && /splits here 25% of the time/.test(nt(m.previewWords(m.newStage(U, C.TUBES_U, 4, 1), 56))) && /Otherwise the cut fails and lights the 24-min tube\. You will learn: a neutron can just get caught/.test(nt(m.previewWords(m.newStage(U, C.TUBES_U, 4, 1), 56))) && /Otherwise the cut fails and nothing is explained/.test(nt(m.previewWords(m.newStage(TH, C.TUBES_TH, 3, 1), 56))) && !/24-min/.test(nt(m.previewWords(m.newStage(TH, C.TUBES_TH, 3, 1), 56))), 'rev. 5: the preview says whether the cut splits for sure or at what chance, and what a failure lights (the 24-minute tube on uranium, nothing on thorium)');
ok((function () { var bad = 0; Z1s.forEach(function (z) { [0, 0.9999].forEach(function (r) { var s9 = m.newStage(U, C.TUBES_U, 4, 3); s9.rng = function () { return r; }; var mv9 = m.play(s9, { kind: 'split', Z1: z }); var l = m.lessonOf(s9, mv9); if (!l || !plain(l) || l.split(/\s+/).length > 40) bad++; }); }); return bad === 0; })(), 'rev. 5: every outcome, split or failed, ends with a short lesson in plain words');
ok(/You are Meitner and Frisch/.test(m.coachWords(m.newStage(U, m.claimTubes(), 4, 1))) && /acts just like it/.test(m.coachWords(m.newStage(U, m.claimTubes(), 4, 1))) && /Barium is explained when one of your pieces acts like barium/.test(m.coachWords(m.newStage(U, m.claimTubes(), 4, 1))) && !/same game/.test(m.coachWords(m.newStage(U, m.claimTubes(), 4, 1))) && /Thorium \(90\): same game/.test(m.coachWords(m.newStage(TH, C.TUBES_TH, 3, 1))), 'rev. 10: the first try says who you are, what explains a "new element", and what to press');
// ---------- rev. 10: the minimal game, the five claims only, as Meitner and Frisch ----------
(function () {
  var ct = m.claimTubes(), st = m.newStage(U, ct, C.NEUTRONS_U, 1);
  ok(ct.length === 5 && ct.every(function (t) { return m.isDashed(t.cellZ); }), 'rev. 10: the game has exactly the five claimed tubes, 93 to 97');
  var pv = m.preview(st, 43);
  ok(pv.lights.length === 5 && pv.p >= 0.995 && pv.failLights === null, 'rev. 10: one cut in the middle (43 | 49) explains all five, for sure');
  var w = nt(m.previewWords(st, 43));
  ok(/explain all five "new elements": 93, 94, 95, 96 and 97/.test(w) && !/24-min|barium|thorium|lanthanum/i.test(w), 'rev. 10: the preview says it in plain words and mentions no other tube');
  var s2 = m.newStage(U, ct, 4, 2); s2.rng = function () { return 0.9999; }; var mv = m.play(s2, { kind: 'split', Z1: 56 });
  ok(mv.kind === 'rang' && /explains nothing/.test(m.moveWords(s2, mv).join(' ')) && !/24 min/.test(m.moveWords(s2, mv).join(' ')), 'rev. 10: a failed cut says it explained nothing and does not mention a 24-minute tube');
  var s3 = m.newStage(U, ct, 4, 3); m.play(s3, { kind: 'split', Z1: 43 });
  var v = m.verdict(s3, null), tx = v.story.join(' ');
  ok(v.you === 5 && /One cut was enough/.test(tx) && /The clue was barium/.test(tx) && !/24-minute tube|thorium|Thorium/.test(tx.replace(/<b>What Meitner and Frisch saw[\s\S]*$/, '')), 'rev. 10: the verdict for the one-cut win names barium as the clue and mentions no tube that is not in the game');
})();
(function () { var st = m.newStage(U, C.TUBES_U, 4, 1); st.rng = function () { return 0; }; m.play(st, { kind: 'split', Z1: 43 }); var c1 = m.coachWords(st); ok(/barium and lanthanum \(try a little off the middle\)/.test(c1) && /24-min tube/.test(c1) && !/dashed/.test(c1), 'rev. 5: after the middle cut the coach names what is still dark and where to look, and no longer the dashed tubes'); st.rng = function () { return 0.9999; }; m.play(st, { kind: 'split', Z1: 56 }); ok(!/24-min/.test(m.coachWords(st)), 'rev. 5: once the 24-minute tube is lit the coach stops mentioning it'); })();

// ---------- rev. 11: the game as played, five claims and the barium, three tries ----------
(function () {
  var gt = m.gameTubes(), st = m.newStage(U, gt, C.TRIES_GAME, 1);
  ok(gt.length === 6 && gt.filter(function (t) { return t.id === 'ba'; }).length === 1 && C.TRIES_GAME === 3, 'rev. 11: the game has the five claims and one barium tube, and three tries');
  var p43 = m.preview(st, 43), p40 = m.preview(st, 40), p36 = m.preview(st, 36);
  var ids = function (pv) { return pv.lights.map(function (l) { return l.id; }).sort().join(','); };
  ok(p43.p >= 0.995 && ids(p43) === 'eAu,eIr,eOs,ePt,eRe' && !/ba/.test(ids(p43).replace(/eRe|ePt/g, '')), 'rev. 11: the sure cut at 43 | 49 explains the five and not the barium');
  ok(Math.abs(p40.p - 0.73) < 0.02 && /ba/.test(ids(p40)) && /eRe/.test(ids(p40)) && !/eAu/.test(ids(p40)), 'rev. 11: the cut at 40 | 52 explains the barium and three claims, but only about three times in four');
  ok(Math.abs(p36.p - 0.25) < 0.02 && ids(p36) === 'ba', 'rev. 11: the cut at 36 | 56 explains only the barium, one time in four');
  var none = true; for (var z = 1; z <= 91; z++) { if (m.preview(st, z).lights.length === 6) none = false; }
  ok(none, 'rev. 11: no single cut explains all six, so you must choose: the sure cut, the riskier cut, or both');
  var w = nt(m.previewWords(st, 40));
  ok(/explain three "new elements": 93, 94 and 95, and the barium/.test(w) && /73% of the time/.test(w) && /nt|learn/.test(w), 'rev. 11: the preview at 40 | 52 says three claims and the barium, with the chance');
  ok(/but not the barium/.test(nt(m.previewWords(st, 43))) && /but it would explain the barium/.test(nt(m.previewWords(st, 36))), 'rev. 11: the preview says plainly when the barium is left out or covered');
  var s4 = m.newStage(U, gt, 3, 5); s4.rng = function () { return 0; }; m.play(s4, { kind: 'split', Z1: 40 }); m.play(s4, { kind: 'split', Z1: 43 });
  var v = m.verdict(s4, null), tx = v.story.join(' ');
  ok(v.you === 5 && v.barium.lit && /trade-off/.test(tx) && /If barium itself is one piece/.test(tx) && /Barium came out/.test(tx), 'rev. 11: the verdict for two cuts says the barium came out and names the trade-off');
  var s5 = m.newStage(U, gt, 3, 6); m.play(s5, { kind: 'split', Z1: 43 }); var v5 = m.verdict(s5, null);
  ok(v5.you === 5 && !v5.barium.lit && /GONE, BUT THE BARIUM IS NOT EXPLAINED/.test(v5.fate) && /Your cuts never made barium/.test(v5.story.join(' ')), 'rev. 11: the sure cut alone gives "gone, but the barium is not explained"');
})();

console.log(fails ? '\n' + fails + ' FAILED' : '\nall checks passed');
process.exit(fails ? 1 : 0);
