// Calibration check for Leibniz's Tiles (memo §17). The mechanism is a toy built from the paper's own analogy, so there
// are no reported numbers to hit; what is checked is (1) that the solver is exact, against brute force; (2) that each
// world has the property the memo claims for it, which the solver establishes; (3) the striving at "Let it be";
// (4) robustness of the two discoveries to the toy's one big assumption, essence = area; (5) the heuristics table of
// build.md §3; (6) the words. Run: node calibration.js  (exit code 1 on any failure)
var M = require('./mechanism.js'), C = M.CONFIG, E = C.EXPECT;
var fails = 0, out = [];
function check(name, ok, detail) { out.push((ok ? 'PASS ' : 'FAIL ') + name + (detail !== undefined ? '  — ' + detail : '')); if (!ok) fails++; }
function rng(seed) { var s = seed >>> 0; return function () { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
function piecesOf(w) { return w.pieces.map(function (p) { return { cells: p.cells }; }); }

// 1. the solver is exact: brute force over every subset and every placement on small boards
(function () {
  var shapes = Object.keys(C.SHAPES).filter(function (s) { return C.SHAPES[s].cells.length <= 4; });
  var R = rng(11), worst = 0, n = 0;
  function brute(W, H, pieces) {
    var N = W * H, best = 0;
    var rots = pieces.map(function (p) { return M.rotations(p.cells); });
    function rec(i, board, lit) {
      if (lit > best) best = lit;
      if (i === pieces.length) return;
      rec(i + 1, board, lit); // leave it out
      rots[i].forEach(function (Rt) {
        for (var r0 = 0; r0 + Rt.h <= H; r0++) for (var c0 = 0; c0 + Rt.w <= W; c0++) {
          var ok = true, j, b2 = board.slice();
          for (j = 0; j < Rt.cells.length; j++) { var k = (r0 + Rt.cells[j][0]) * W + c0 + Rt.cells[j][1]; if (b2[k]) { ok = false; break; } b2[k] = 1; }
          if (ok) rec(i + 1, b2, lit + Rt.cells.length);
        }
      });
    }
    var board = []; for (var k = 0; k < N; k++) board.push(0);
    rec(0, board, 0); return best;
  }
  for (var t = 0; t < 60; t++) {
    var W = 3 + Math.floor(R() * 2), H = 3 + Math.floor(R() * 2), np = 3 + Math.floor(R() * 2), pieces = [];
    for (var i = 0; i < np; i++) pieces.push({ cells: C.SHAPES[shapes[Math.floor(R() * shapes.length)]].cells });
    var a = M.solve(W, H, pieces).best, b = brute(W, H, pieces);
    if (a !== b) worst++; n++;
  }
  check('Solver equals brute force on ' + n + ' random small instances (3–4 by 3–4, 3–4 pieces of up to 4 cells)', worst === 0, worst + ' mismatches');
  var counts = { '1x1': 1, '2x2': 1, '3x3': 1, '1x2': 2, '1x3': 2, '1x4': 2, '2x3': 2, '2x4': 2, '2x5': 2, 'L3': 4 };
  var bad = Object.keys(counts).filter(function (s) { return M.rotations(C.SHAPES[s].cells).length !== counts[s]; });
  check('Each shape has the expected number of distinct quarter turns (no reflections)', bad.length === 0, bad.join(','));
})();

// 2. the three worlds
var g = M.newGame();
g.worlds.forEach(function (w, i) {
  check('World ' + (i + 1) + ': tray holds ' + w.total + ' cells for a board of ' + w.W * w.H + ' (more than fits: the paper\'s "forced to leave more spaces empty")', w.total > w.W * w.H && w.total === E.totals[i], 'expected ' + E.totals[i]);
  check('World ' + (i + 1) + ': best possible world lights ' + w.best.lit + ' (memo §11 says ' + E.best[i] + ')', w.best.lit === E.best[i]);
  var pl = w.best.placement, occ = {}, overlap = false;
  pl.forEach(function (p) { var P = w.pieces[p.id]; P.rots[p.ri].cells.forEach(function (c) { var k = (p.r + c[0]) * w.W + p.c + c[1]; if (occ[k]) overlap = true; occ[k] = 1; }); });
  check('World ' + (i + 1) + ': the stored best placement is a legal packing (no overlaps, inside the board)', !overlap && Object.keys(occ).length === w.best.lit);
});
// world 1: the best world is full and leaves something out
(function () {
  var w = g.worlds[0], ids = {}; w.best.placement.forEach(function (p) { ids[p.id] = 1; });
  var left = w.pieces.filter(function (p) { return !ids[p.id]; });
  check('World 1: the best world is full (16 of 16) and still leaves ' + left.length + ' possible(s) out: ' + M.listNames(left), w.best.lit === 16 && left.length >= 1);
})();
// world 2: with the big square the most is 29; the heaviest-first player gets 29; without it, full
(function () {
  var w = g.worlds[1], sq = w.pieces[0], others = w.pieces.slice(1).map(function (p) { return { cells: p.cells }; });
  var withMax = 0;
  for (var r = 0; r + 3 <= w.H; r++) for (var c = 0; c + 3 <= w.W; c++) {
    var holes = []; sq.cells.forEach(function (cc) { holes.push((r + cc[0]) * w.W + c + cc[1]); });
    var b = M.solve(w.W, w.H, others, holes).best + 9; if (b > withMax) withMax = b;
  }
  check('World 2: with the big square on the board, the most that can be lit over all its ' + 16 + ' positions is ' + withMax + ' (memo: 29, "a fifth dark")', withMax === E.world2WithSquareMax);
  check('World 2: without the big square the land is full', M.solve(w.W, w.H, others).best === 36);
  var gr = M.greedyFill(w.W, w.H, piecesOf(w)), lit = 0; gr.placed.forEach(function (p) { lit += w.pieces[p.idx].area; });
  check('World 2: heaviest first, first fit lights ' + lit + ' (memo: 29)', lit === E.world2GreedyLit);
  check('World 2: so every full world leaves the grandest thing out (the paper\'s point: the maximum is of the whole)', withMax < 36 && w.best.lit === 36);
  check('World 2: 29 of 36 reads as "' + M.darkWords(7, 36) + '"', M.darkWords(7, 36) === 'about a fifth dark');
})();
// world 3: the pre-filled world, the dead end, and the step back
(function () {
  var w = g.worlds[2], st = M.status(w);
  check('World 3: filled by weight, ' + st.lit + ' lit, ' + st.waiting + ' waiting (memo: 31 and 3)', st.lit === E.world3PrefillLit && st.waiting === 3);
  var waiting = w.pieces.filter(function (p) { return !p.placed; });
  check('World 3: none of the waiting shapes (' + M.listNames(waiting) + ') fits anywhere as the board stands', waiting.every(function (p) { return !M.anyFit(w, p); }));
  var pullMax = {};
  w.pieces.filter(function (p) { return p.placed; }).forEach(function (p) {
    var holes = []; w.pieces.forEach(function (q) { if (q.placed && q.id !== p.id) q.rots[q.ri].cells.forEach(function (c) { holes.push((q.placed.r + c[0]) * w.W + q.placed.c + c[1]); }); });
    var avail = w.pieces.filter(function (q) { return !q.placed || q.id === p.id; }).map(function (q) { return { cells: q.cells }; });
    pullMax[p.shape] = M.solve(w.W, w.H, avail, holes).best + holes.length;
  });
  check('World 3: pull the long bar (2×4) and the most is ' + pullMax['2x4'] + ' (memo: 36, full)', pullMax['2x4'] === E.world3PullLongBar);
  check('World 3: pull the big square instead and the most is ' + pullMax['3x3'] + ' (memo: 32; the lesson of world 2 misapplied)', pullMax['3x3'] === E.world3PullBigSquare);
  check('World 3: pull the longest bar and the most is ' + pullMax['2x5'] + '; pull the thin bar and the most is ' + pullMax['1x4'] + ' (memo: 31, 31)', pullMax['2x5'] === E.world3PullLongestBar && pullMax['1x4'] === 31);
  // the full world after the right pull leaves the long bar out: the three humbler shapes take its place
  var ids = {}; w.best.placement.forEach(function (p) { ids[p.id] = 1; });
  var left = w.pieces.filter(function (p) { return !ids[p.id]; });
  check('World 3: the best possible world leaves out exactly ' + M.listNames(left) + ' (what was destroyed is not rebuilt; three humbler things stand there)', left.length === 1 && left[0].shape === '2x4');
})();

// 3. the striving at "Let it be"
(function () {
  var g2 = M.newGame(), w = g2.worlds[0];
  // place the 2x3 (id 0) across the top rows, 2x2 (id 1) bottom-left, L (id 2) bottom-right turned so one cell stays dark, 1x2 (id 4) upright at the right
  check('World 1 setup: 2×3 at (0,0)', M.place(w, 0, 0, 0).ok);
  M.turn(w, 4); check('World 1 setup: bar of two upright at (0,3)', M.place(w, 4, 0, 3).ok);
  check('World 1 setup: small square at (2,0)', M.place(w, 1, 2, 0).ok);
  check('World 1 setup: L at (2,2)', M.place(w, 2, 2, 2).ok);
  var st = M.status(w); check('World 1 setup: 15 lit, one dark, the single and the bar of three waiting', st.lit === 15 && st.dark === 1 && st.waiting === 2);
  var r = M.letItBe(w);
  check('Let it be: the single still fits, so it comes to be; the bar of three does not', r.rushed.length === 1 && r.rushed[0].name === 'the single' && r.lit === 16 && r.leftOut.length === 1 && r.leftOut[0].shape === '1x3');
  check('Let it be: the first line says so in the game\'s voice', /The single still fitted, and nothing stopped it, so it came to be\./.test(r.lines[0]), r.lines[0]);
  check('Let it be: a world cannot be changed after it ends', !M.place(w, 3, 0, 0).ok && !M.pull(w, 0).ok && !M.turn(w, 3).ok);
  var w3 = g2.worlds[2], r3 = M.letItBe(w3);
  check('World 3 untouched: Let it be rushes nothing (nothing fits) and the world stays at 31', r3.rushed.length === 0 && r3.lit === 31 && r3.pulls === 0);
  check('World 3 untouched: the line says the player never stepped back', r3.lines.some(function (l) { return /never stepped back/.test(l); }));
  // heaviest first in the rush: world 2 with only the big square placed; the rush places bars before small squares
  var w2 = g2.worlds[1]; M.place(w2, 0, 0, 0); var r2 = M.letItBe(w2);
  check('World 2, square only then Let it be: the rush comes heaviest first (' + r2.rushed.map(function (x) { return x.name; }).join(', ') + ') and ends at ' + r2.lit, r2.rushed[0].name === 'the long bar' && r2.lit <= 29);
})();

// 4. robustness of the discoveries to essence = area (build.md §1): weight a possible by cells^k and find where each lesson flips
(function () {
  var w2 = g.worlds[1], w3 = g.worlds[2];
  function squareInOptimum(k) { var s = M.solve(w2.W, w2.H, piecesOf(w2), null, function (a) { return Math.pow(a, k); }); return s.placement.some(function (p) { return p.idx === 0; }); }
  var flip2 = null; for (var k = 1; k <= 3.0001; k += 0.05) { if (squareInOptimum(k)) { flip2 = Math.round(k * 100) / 100; break; } }
  check('World 2 under essence = cells^k: the big square enters the best world once k reaches about ' + flip2 + ' (at k = 1, Leibniz\'s own criterion of spaces filled, it is out)', !squareInOptimum(1) && flip2 !== null && flip2 > 1.0, 'reported on About: the lesson rests on the paper\'s criterion');
  function stepBackWins(k) {
    var wgt = function (a) { return Math.pow(a, k); };
    var pre = 0; w3.pieces.forEach(function (p) { if (p.placed) pre += wgt(p.area); });
    return M.solve(w3.W, w3.H, piecesOf(w3), null, wgt).best > pre + 1e-9;
  }
  var flip3 = null; for (var k3 = 1; k3 <= 4.0001; k3 += 0.05) { if (!stepBackWins(k3)) { flip3 = Math.round(k3 * 100) / 100; break; } }
  check('World 3 under essence = cells^k: a fuller world than the one made by weight exists for every k below about ' + (flip3 || '4+') + ' (the step back survives weighting size more than proportionally)', stepBackWins(1) && (flip3 === null || flip3 > 1.5));
})();

// 5. play it in numbers (build.md §3): the obvious ways of playing, against the mechanism
(function () {
  var R = rng(2026), table = [];
  function randomPlay(w, R, order) {
    // order: 'random' | 'light' ; places each piece at a random legal spot and rotation if one exists
    var ids = w.pieces.map(function (p) { return p.id; }).filter(function (id) { return !w.pieces[id].placed; });
    if (order === 'light') ids.sort(function (a, b) { return w.pieces[a].area - w.pieces[b].area; }); else ids.sort(function () { return R() - 0.5; });
    ids.forEach(function (id) {
      var p = w.pieces[id], spots = [];
      for (var ri = 0; ri < p.rots.length; ri++) for (var r = 0; r < w.H; r++) for (var c = 0; c < w.W; c++) if (M.fits(w, p, ri, r, c)) spots.push([ri, r, c]);
      if (spots.length) { var s = spots[Math.floor(R() * spots.length)]; p.ri = s[0]; M.place(w, id, s[1], s[2]); }
    });
    return M.letItBe(w).lit;
  }
  function stats(f, n) { var xs = []; for (var i = 0; i < n; i++) xs.push(f()); xs.sort(function (a, b) { return a - b; }); var m = xs.reduce(function (s, x) { return s + x; }, 0) / n; return { mean: Math.round(m * 10) / 10, min: xs[0], max: xs[n - 1], full: xs.filter(function (x) { return x === xs[n - 1]; }).length }; }
  [0, 1].forEach(function (wi) {
    var gg = M.newGame(), w = gg.worlds[wi];
    var gr = M.greedyFill(w.W, w.H, piecesOf(w)); gr.placed.forEach(function (p) { w.pieces[p.idx].ri = p.ri; M.place(w, p.idx, p.r, p.c); });
    var heavy = M.letItBe(w).lit;
    var light = stats(function () { return randomPlay(M.newGame().worlds[wi], R, 'light'); }, 300);
    var rand = stats(function () { return randomPlay(M.newGame().worlds[wi], R, 'random'); }, 300);
    table.push('World ' + (wi + 1) + ' (best ' + w.best.lit + '): heaviest first, first fit ' + heavy + '; lightest first at random spots mean ' + light.mean + ' (min ' + light.min + ', max ' + light.max + '); random order, random spots mean ' + rand.mean + ' (min ' + rand.min + ', max ' + rand.max + ', reaches ' + rand.max + ' in ' + rand.full + ' of 300)');
    if (wi === 1) check('World 2 numbers: heaviest first ends a fifth dark (29), random play on average well short of full, and full is reachable', heavy === 29 && rand.mean < 33 && rand.max === 36, 'random mean ' + rand.mean);
    if (wi === 0) check('World 1 numbers: heaviest first and random play both leave something out, and full is reachable', heavy <= 16 && rand.max === 16);
  });
  // world 3: never step back; pull each tile then play best; pull the right one then random play
  var gg3 = M.newGame(), w3 = gg3.worlds[2];
  var never = M.letItBe(M.newGame().worlds[2]).lit;
  var pulls = w3.pieces.filter(function (p) { return p.placed; }).map(function (p) { var ww = M.newGame().worlds[2]; M.pull(ww, p.id); var holes = []; ww.pieces.forEach(function (q) { if (q.placed) q.rots[q.ri].cells.forEach(function (c) { holes.push((q.placed.r + c[0]) * ww.W + q.placed.c + c[1]); }); }); var avail = ww.pieces.filter(function (q) { return !q.placed; }).map(function (q) { return { cells: q.cells }; }); return p.name + ' then the best play: ' + (M.solve(ww.W, ww.H, avail, holes).best + holes.length); });
  var rightRandom = stats(function () { var ww = M.newGame().worlds[2]; M.pull(ww, 2); return randomPlay(ww, R, 'random'); }, 300);
  var rightHeavy = (function () { var ww = M.newGame().worlds[2]; M.pull(ww, 2); var avail = ww.pieces.filter(function (q) { return !q.placed; }); var board = M.occupancy(ww); var gr = M.greedyFill(ww.W, ww.H, ww.pieces.map(function (p) { return { cells: p.cells }; }), board.map(function (x) { return x; })); return M.letItBe(ww).lit; })();
  table.push('World 3 (best 36): never step back ' + never + '; ' + pulls.join('; ') + '; pull the long bar then random spots mean ' + rightRandom.mean + ' (min ' + rightRandom.min + ', max ' + rightRandom.max + '); pull the long bar then Let it be (the rush alone) ' + rightHeavy);
  check('World 3 numbers: never stepping back stays at 31; one pull is enough for 36; the wrong pulls give 31 or 32', never === 31 && pulls.some(function (s) { return /long bar then the best play: 36/.test(s); }) && pulls.every(function (s) { return /: (31|32|36)$/.test(s); }));
  out.push('TABLE ' + table.join('\nTABLE '));
})();

// 6. words: no decimals anywhere, the verdict for three plausible games
(function () {
  function fullGame(strategy) {
    var gg = M.newGame();
    gg.worlds.forEach(function (w, i) {
      if (strategy === 'heavy' || (strategy === 'mixed' && i === 1)) { var gr = M.greedyFill(w.W, w.H, piecesOf(w), M.occupancy(w)); gr.placed.forEach(function (p) { if (!w.pieces[p.idx].placed) { w.pieces[p.idx].ri = p.ri; M.place(w, p.idx, p.r, p.c); } }); }
      else { if (i === 2) M.pull(w, 2); w.best.placement.forEach(function (p) { if (!w.pieces[p.id].placed) { w.pieces[p.id].ri = p.ri; M.place(w, p.id, p.r, p.c); } }); }
      M.letItBe(w); M.nextWorld(gg);
    });
    return gg;
  }
  ['heavy', 'best', 'mixed'].forEach(function (s) {
    var gg = fullGame(s), v = M.verdict(gg), text = [v.paper, v.part, v.stood, v.fate].concat(v.found).concat(gg.worlds.map(function (w) { return w.result.lines.join(' '); })).join(' ');
    check('Full game (' + s + '): every line is words with no decimals; verdict matched ' + v.matched + ' of 3', !/\d\.\d/.test(text) && text.length > 200 && v.found.length === 3, v.fate);
    if (s === 'best') check('Full game (best): the player who matches every world is told theirs is the one Leibniz says exists', /Yours is the one Leibniz says exists/.test(v.stood) && v.matched === 3);
    if (s === 'heavy') check('Full game (heavy): the heaviest-first player is told the best world is full and the big square is not in it', gg.worlds[1].result.lines.some(function (l) { return /big square is not in it/.test(l); }) && /cannot be the one that exists/.test(v.stood));
  });
  check('Dark words: 0 → full; 1 → one cell; 7 of 36 → about a fifth; 5 of 36 → about a tenth; 4 of 16 → about a quarter', M.darkWords(0, 36) === 'full' && M.darkWords(1, 36) === 'one cell dark' && M.darkWords(7, 36) === 'about a fifth dark' && M.darkWords(5, 36) === 'about a tenth dark' && M.darkWords(4, 16) === 'about a quarter dark', [M.darkWords(5, 36), M.darkWords(4, 16)].join(' / '));
  check('Names: two long bars and the single', M.listNames([{ shape: '2x4', name: 'the long bar' }, { shape: '2x4', name: 'the long bar' }, { shape: '1x1', name: 'the single' }]) === 'two long bars and the single', M.listNames([{ shape: '2x4', name: 'the long bar' }, { shape: '2x4', name: 'the long bar' }, { shape: '1x1', name: 'the single' }]));
})();

var summary = out.filter(function (l) { return /^(PASS|FAIL)/.test(l); }).length + ' checks, ' + fails + ' failing';
console.log(out.join('\n') + '\n' + summary);
if (fails) process.exit(1);
