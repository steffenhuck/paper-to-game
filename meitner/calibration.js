// Calibration check for Meitner's Drop (build.md section 2). Run: node calibration.js. Exits 1 on any failure.
var m = require('./mechanism.js'), C = m.CONFIG, U = C.URANIUM, TH = C.THORIUM;
var fails = 0;
function ok(cond, what) { console.log((cond ? 'ok   ' : 'FAIL ') + what); if (!cond) fails++; }
function reach(path) { return path[path.length - 1]; }
function clearsU(actions) {
  var st = m.newStage(U, C.TUBES_U, actions.length);
  actions.forEach(function (a) { m.play(st, a); });
  return C.TUBES_U.every(function (t) { return st.lit[t.id]; });
}
function range(lo, hi) { var a = []; for (var z = lo; z <= hi; z++) a.push(z); return a; }
var Z1s = range(C.MIN_PIECE, U.Z - C.MIN_PIECE);

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
ok(Z1s.every(function (z) { var s = m.split(U, z); return s.pieces.every(function (p) { return p.path.length - 1 >= 3 && p.path.length - 1 <= 6; }); }), 'every allowed piece climbs 3 to 6 steps (the on-screen rule says "about four or five")');

// 3. the table
C.TUBES_U.concat(C.TUBES_TH).forEach(function (t) { ok(m.cellOf(t.cellZ).col === t.col, 'tube "' + t.label + '" stands in column ' + (t.col + 1) + ' of the 1939 table, cell ' + t.cellZ); });
ok(m.cellOf(92).col === m.cellOf(74).col && m.cellOf(93).col === m.cellOf(75).col && m.cellOf(94).col === m.cellOf(76).col, 'uranium under tungsten, 93 under rhenium, 94 under osmium: the 1939 placement that made the eka-names fit their chemistry');
ok(m.cellOf(56).col === m.cellOf(38).col && m.cellOf(57).col === m.cellOf(39).col, 'strontium under barium, yttrium under lanthanum (p. 239: Sr-Y-Zr chains mistaken for Ba-La-Ce)');

// 4. what the moves light
var st = m.newStage(U, C.TUBES_U, 5);
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
var fiveEka = Z1s.filter(function (z) { var s = m.split(U, z); return m.lightTubes(s, C.TUBES_U, U.Z).filter(function (l) { return m.isDashed(m.tubeById(C.TUBES_U, l.id).cellZ); }).length === 5; });
ok(fiveEka.length >= 1 && fiveEka.length <= 4 && fiveEka.indexOf(43) >= 0, 'the pinches that bring all five ghosts down at once are ' + fiveEka.join(', ') + ': near masurium, as the paper has it (p. 239), and not many');
var baLa = Z1s.filter(function (z) { var s = m.split(U, z); var ids = m.lightTubes(s, C.TUBES_U, U.Z).map(function (l) { return l.id; }); return ids.indexOf('ba') >= 0 && ids.indexOf('la') >= 0; });
ok(baLa.length >= 2 && baLa.length <= 20 && baLa.indexOf(46) < 0, 'the pinches that light barium and lanthanum are ' + baLa.join(', ') + ' (some ways, not every way, and not the exactly equal pinch)');
var eqLit = m.lightTubes(eq, C.TUBES_U, U.Z);
ok(eqLit.length === 2 && !eqLit.some(function (l) { return l.id === 'ba' || l.id === 'la'; }), 'the exactly equal pinch, the obvious first move, lights only two tubes and neither barium nor lanthanum: the paper\'s "roughly equal" is not "equal"');
ok(Z1s.filter(function (z) { return m.lightTubes(m.split(U, z), C.TUBES_U, U.Z).length <= 1; }).length > 0, 'some pinches light one tube or none: ' + Z1s.filter(function (z) { return m.lightTubes(m.split(U, z), C.TUBES_U, U.Z).length <= 1; }).join(', '));
ok(m.split(U, 28).energyMeV < eq.energyMeV && m.split(U, 36).energyMeV < eq.energyMeV, 'an uneven pinch gives a smaller blast than an even one (our Coulomb rule; the paper computes only the equal case)');

// 5. thorium
var stT = m.newStage(TH, C.TUBES_TH, 2);
mv = m.play(stT, { kind: 'split', Z1: 56 });
ok(mv.lit.map(function (l) { return l.id; }).sort().join() === 'ac,ra', 'thorium pinched at 56 | 34 lights the radium and actinium tubes from barium and lanthanum (p. 239: thorium\'s periods equal barium\'s and lanthanum\'s)');
var thZ = range(C.MIN_PIECE, TH.Z - C.MIN_PIECE);
ok(thZ.some(function (z) { return m.lightTubes(m.split(TH, z), C.TUBES_TH, TH.Z).length === 0; }), 'some thorium pinches light neither tube');

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
ok(Z1s.every(function (z) { var s2 = m.newStage(U, C.TUBES_U, 5); var mv2 = m.play(s2, { kind: 'split', Z1: z }); return m.moveWords(s2, mv2).length >= 3; }), 'every pinch has at least three lines of result in the game\'s voice');
var sH = m.newStage(U, C.TUBES_U, 5); ok(m.moveWords(sH, m.play(sH, { kind: 'hold' })).length >= 2, 'the hold has words');
var paths = [[{ kind: 'split', Z1: 56 }, { kind: 'split', Z1: 43 }, { kind: 'hold' }], [{ kind: 'split', Z1: 46 }, { kind: 'split', Z1: 46 }, { kind: 'split', Z1: 46 }, { kind: 'split', Z1: 46 }, { kind: 'split', Z1: 46 }], [{ kind: 'hold' }, { kind: 'hold' }, { kind: 'hold' }, { kind: 'hold' }, { kind: 'hold' }], [{ kind: 'split', Z1: 28 }, { kind: 'split', Z1: 64 }, { kind: 'split', Z1: 30 }, { kind: 'split', Z1: 33 }, { kind: 'split', Z1: 60 }], [{ kind: 'split', Z1: 56 }, { kind: 'split', Z1: 44 }, { kind: 'split', Z1: 38 }, { kind: 'hold' }, { kind: 'split', Z1: 42 }]];
paths.forEach(function (p, i) {
  var a = m.newStage(U, C.TUBES_U, 5); p.forEach(function (x) { m.play(a, x); });
  var b = m.newStage(TH, C.TUBES_TH, 2); m.play(b, { kind: 'split', Z1: i % 2 ? 45 : 56 });
  var v = m.verdict(a, b);
  ok(v.fate && v.paper && v.found.length >= 4 && v.part.length >= 1 && v.stood, 'verdict path ' + (i + 1) + ': "' + v.fate + '" with ' + v.found.length + ' findings and ' + v.part.length + ' partings');
});
console.log(fails ? '\n' + fails + ' FAILED' : '\nall checks passed');
process.exit(fails ? 1 : 0);
