// Calibration check for Leibniz's Worlds (memo §17). The mechanism is a toy built from the paper's argument, so there are
// no reported numbers to hit; what is checked is (1) that the solver is exact, against an independent search; (2) that
// each sky has the property the memo claims for it; (3) the striving at "Let it be" and the step back; (4) robustness of
// the two discoveries to the toy's one big assumption, claim = weight; (5) the heuristics table of build.md §3;
// (6) the words. Run: node calibration.js  (exit code 1 on any failure)
var M = require('./mechanism.js'), C = M.CONFIG, E = C.EXPECT;
var fails = 0, out = [];
function check(name, ok, detail) { out.push((ok ? 'PASS ' : 'FAIL ') + name + (detail !== undefined ? '  — ' + detail : '')); if (!ok) fails++; }
function rng(seed) { var s = seed >>> 0; return function () { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }

// 1. the solver is exact: an independent recursive branch-and-bound over the same worlds
function indep(world, k) {
  var n = world.stars.length, best = 0;
  function ok(set, i) { var id = world.stars[i].id; return set.every(function (j) { return !world.pairs.some(function (p) { return (p[0] === id && p[1] === world.stars[j].id) || (p[1] === id && p[0] === world.stars[j].id); }); }); }
  function rec(i, set, L) { if (L > best) best = L; if (i === n) return; rec(i + 1, set, L); if (ok(set, i)) rec(i + 1, set.concat([i]), L + Math.pow(world.stars[i].w, k || 1)); }
  rec(0, [], 0); return best;
}
var g = M.newGame();
g.worlds.forEach(function (w, i) { check('solver exact on sky ' + (i + 1), Math.abs(w.best.light - indep(w)) < 1e-9, w.best.light + ' vs ' + indep(w)); });
g.worlds.forEach(function (w, i) { check('sky ' + (i + 1) + ' total wanting to be = ' + E.totals[i], M.total(w) === E.totals[i], M.total(w)); check('sky ' + (i + 1) + ' best = ' + E.best[i], w.best.light === E.best[i], w.best.light); });

// 2. the properties
(function () {
  var w = M.newWorld(0);
  check('sky 1: best leaves something out', w.best.ids.length < w.stars.length, 'left out: ' + w.stars.filter(function (s) { return w.best.ids.indexOf(s.id) < 0; }).map(function (s) { return s.id; }));
  w = M.newWorld(1);
  var big = w.stars.slice().sort(function (a, b) { return b.w - a.w; })[0];
  check('sky 2: the grandest thing is the coral star', big.id === 'coral');
  check('sky 2: best world does not contain it', w.best.ids.indexOf('coral') < 0, w.best.ids.join(','));
  check('sky 2: most with coral forced in = ' + E.world2WithCoralMax, M.solveWith(w, 'coral') === E.world2WithCoralMax, M.solveWith(w, 'coral'));
  check('sky 2: the four it shuts out hold more than it', M.conflicts(w, 'coral').reduce(function (a, id) { return a + M.star(w, id).w; }, 0) > big.w);
  var r = M.playGreedy(M.newWorld(1));
  check('sky 2: heaviest-first play ends at ' + E.world2GreedyLit, r.light === E.world2GreedyLit, r.light);
  w = M.newWorld(2);
  check('sky 3: filled by weight lights ' + E.world3PrefillLit, M.light(w) === E.world3PrefillLit, M.light(w) + ' (' + M.lit(w).map(function (s) { return s.id; }) + ')');
  check('sky 3: nothing left can be', w.stars.every(function (s) { return s.status !== 'wait'; }));
  check('sky 3: filled by weight is not the best', M.light(w) < w.best.light, M.light(w) + ' < ' + w.best.light);
  var w3 = M.newWorld(2); M.putOut(w3, 'amber'); var r3 = M.letItBe(w3);
  check('sky 3: put out amber, let it be = ' + E.world3PutOutAmber + ' (best)', r3.light === E.world3PutOutAmber && r3.light === w3.best.light, r3.light);
  check('sky 3: three things came in for it', w3.rushed.length === 3, w3.rushed.join(','));
  w3 = M.newWorld(2); M.putOut(w3, 'coral'); r3 = M.letItBe(w3);
  check('sky 3: put out coral (the grandest), let it be = ' + E.world3PutOutCoral, r3.light === E.world3PutOutCoral, r3.light);
  check('sky 3: nothing came in for it', w3.rushed.length === 0);
  w3 = M.newWorld(2); M.putOut(w3, 'rose'); r3 = M.letItBe(w3);
  check('sky 3: put out rose, let it be = ' + E.world3PutOutRose + ' (no fuller)', r3.light === E.world3PutOutRose, r3.light);
  check('sky 3: the right thing to put out is not the grandest', 'amber' !== big.id && M.star(M.newWorld(2), 'amber').w < M.star(M.newWorld(2), 'coral').w);
})();

// 3. the striving and the step back
(function () {
  var w = M.newWorld(0); var r = M.letItBe(w);
  check('sky 1: let it be with nothing done fills by weight to ' + r.light, r.light === 12 && w.rushed.length === 4, w.rushed.join(','));
  w = M.newWorld(0); M.letBe(w, 'amber'); var a = M.letBe(w, 'mint');
  check('a dark thing cannot be let be', a.ok === false && /cannot be/.test(a.line), a.line);
  M.putOut(w, 'amber'); a = M.letBe(w, 'mint');
  check('after the step back it can', a.ok === true, a.line);
  r = M.letItBe(w);
  check('what the player put out stays out at let it be', M.star(w, 'amber').status !== 'lit' && r.light === 11, r.light);
  w = M.newWorld(1); M.letBe(w, 'coral'); M.putOut(w, 'coral'); r = M.letItBe(w);
  check('sky 2: put the coral star out and let it be = best', r.light === w.best.light, r.light);
})();

// 4. robustness: claim = weight^k. At what k does the coral star enter the best second sky, and the step back stop paying?
(function () {
  var kIn = null, kStep = null;
  for (var k = 1; k <= 4.001; k += 0.05) {
    var w = M.newWorld(1), b = M.solve(w, function (s) { return Math.pow(s.w, k); });
    if (kIn === null && b.ids.indexOf('coral') >= 0) kIn = k;
    var w3 = M.newWorld(2); // filled by weight is the same set for any k>0 (order by weight is unchanged)
    var Lw = M.lit(w3).reduce(function (a, s) { return a + Math.pow(s.w, k); }, 0), b3 = M.solve(w3, function (s) { return Math.pow(s.w, k); });
    if (kStep === null && b3.light <= Lw + 1e-9) kStep = k;
  }
  check('sky 2 lesson holds for claim = weight^k up to k ≈ ' + (kIn ? kIn.toFixed(2) : '>4'), kIn === null || kIn > 1.4, 'coral enters the best world at k = ' + (kIn ? kIn.toFixed(2) : 'never'));
  check('sky 3 lesson (a fuller world than weight made exists) holds up to k ≈ ' + (kStep ? kStep.toFixed(2) : '>4'), kStep === null || kStep > 1.9, 'step back stops paying at k = ' + (kStep ? kStep.toFixed(2) : 'never'));
})();

// 5. heuristics (build.md §3): greedy, random, best, on each sky
(function () {
  var R = rng(7);
  [0, 1, 2].forEach(function (k) {
    var gr = M.playGreedy(M.newWorld(k)).light, be = M.playBest(M.newWorld(k)).light;
    var rs = []; for (var t = 0; t < 200; t++) rs.push(M.playRandom(M.newWorld(k), R).light);
    var mean = rs.reduce(function (a, b) { return a + b; }, 0) / rs.length, min = Math.min.apply(null, rs), max = Math.max.apply(null, rs);
    out.push('     sky ' + (k + 1) + ': heaviest-first ' + gr + ' · random mean ' + mean.toFixed(1) + ' [' + min + ', ' + max + '] · best play ' + be + ' · best ' + M.newWorld(k).best.light);
    check('sky ' + (k + 1) + ': best play reaches the best', be === M.newWorld(k).best.light);
    check('sky ' + (k + 1) + ': random play never beats the best', max <= M.newWorld(k).best.light);
  });
  check('sky 2: heaviest-first is beaten by best play', M.playGreedy(M.newWorld(1)).light < M.playBest(M.newWorld(1)).light);
})();

// 6. words
(function () {
  check('words: full', M.shortWords(21, 21) === 'as full as it can be');
  check('words: 14 of 21 is about a third short', M.shortWords(14, 21) === 'about a third short', M.shortWords(14, 21));
  check('words: 19 of 24 is about a quarter short', M.shortWords(19, 24) === 'about a quarter short', M.shortWords(19, 24));
  var g2 = M.newGame(); M.playGreedy(g2.worlds[0]); M.playGreedy(g2.worlds[1]); M.letItBe(g2.worlds[2]);
  var v = M.verdict(g2);
  check('verdict head for the heaviest-first player', v.head === 'One of your three worlds is as full as it can be.', v.head);
  check('verdict found lines are three', v.found.length === 3);
  var g3 = M.newGame(); M.playBest(g3.worlds[0]); M.playBest(g3.worlds[1]); M.playBest(g3.worlds[2]);
  check('verdict head for the best player', M.verdict(g3).head === 'All three of your worlds are as full as they can be.', M.verdict(g3).head);
  check('every star has a colour', g.worlds.every(function (w) { return w.stars.every(function (s) { return !!C.COLOURS[s.id]; }); }));
  check('no sky has two stars of one colour', g.worlds.every(function (w) { var ids = w.stars.map(function (s) { return s.id; }); return ids.length === new Set(ids).size; }));
})();

console.log(out.join('\n'));
console.log(fails ? '\n' + fails + ' FAILED' : '\nALL PASSED');
process.exit(fails ? 1 : 0);
