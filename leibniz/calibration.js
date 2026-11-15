// Calibration check for Leibniz's Worlds (memo §17). The mechanism is a toy built from the paper's argument, so there are
// no reported numbers to hit; what is checked, over many seeds, is (1) that the solver is exact; (2) that every drawn
// world carries the lesson it is there to show, and that nothing is chosen for the player; (3) the layout rule (no line
// through a star, no crossing lines, no touching stars); (4) the lamp world: the same opening in both skies, one the
// fullest and one short by exactly the big star less the small; (5) robustness of the lessons to the toy's one big
// assumption, claim = weight; (6) the heuristics table; (7) the words. Run: node calibration.js  (exit 1 on failure)
var M = require('./mechanism.js'), C = M.CONFIG;
var fails = 0, out = [];
function check(name, ok, detail) { out.push((ok ? 'PASS ' : 'FAIL ') + name + (detail !== undefined ? '  — ' + detail : '')); if (!ok) fails++; }
var SEEDS = 200, games = [];
var t0 = Date.now(); for (var s = 1; s <= SEEDS; s++) games.push(M.newGame(s)); var dt = Date.now() - t0;
out.push('     ' + SEEDS + ' games drawn in ' + dt + ' ms; ' + games.filter(function (g, i) { return g.seed !== i + 1; }).length + ' needed a reseed');

// 1. the solver is exact: independent recursion
function indep(world) {
  var n = world.stars.length, best = 0;
  function ok(set, i) { var id = world.stars[i].id; return set.every(function (j) { return !world.pairs.some(function (p) { return (p[0] === id && p[1] === world.stars[j].id) || (p[1] === id && p[0] === world.stars[j].id); }); }); }
  function rec(i, set, L) { if (L > best) best = L; if (i === n) return; rec(i + 1, set, L); if (ok(set, i)) rec(i + 1, set.concat([i]), L + world.stars[i].w); }
  rec(0, [], 0); return best;
}
check('solver exact on every drawn sky (' + SEEDS * 5 + ' skies)', games.every(function (g) { return g.worlds.concat(g.judge.skies).every(function (w) { return w.best.light === indep(w); }); }));

// 2. the lessons, on every draw
(function () {
  var bad = [];
  games.forEach(function (g) {
    var w1 = g.worlds[0], w2 = g.worlds[1], w3 = g.worlds[2];
    if (w1.stars.length - w1.best.ids.length < C.GEN.world1.minOut) bad.push(g.seed + ': w1 best leaves too little out');
    if (!w1.best.unique) bad.push(g.seed + ': w1 best not unique');
    if (M.letItBe(M.makeWorld({ k: 0, stars: w1.stars, pairs: w1.pairs }))) bad.push(g.seed + ': w1 can be ended with nothing lit');
    var big = M.biggest(w2);
    if (w2.best.ids.indexOf(big.id) >= 0) bad.push(g.seed + ': w2 best holds the big one');
    if (M.conflicts(w2, big.id).reduce(function (a, id) { return a + M.star(w2, id).w; }, 0) <= big.w) bad.push(g.seed + ': w2 holders not worth more than the big one');
    var gr = M.playGreedy(M.makeWorld({ k: 1, stars: w2.stars, pairs: w2.pairs }));
    if (gr.light > w2.best.light - C.GEN.world2.gap) bad.push(g.seed + ': w2 heaviest-first too close to best');
    if (M.light(w3) >= w3.best.light) bad.push(g.seed + ': w3 filled by weight is already best');
    if (w3.stars.some(function (x) { return x.status === 'wait'; })) bad.push(g.seed + ': w3 something still waits');
    if (!w3.key || M.star(w3, w3.key).status !== 'lit' || w3.key === M.biggest(w3).id) bad.push(g.seed + ': w3 key missing or is the biggest');
    var spec = { k: 2, stars: w3.stars, pairs: w3.pairs, prefill: true, key: w3.key };
    var c = M.makeWorld(spec); M.putOut(c, w3.key); c.stars.filter(function (x) { return x.status === 'wait' && x.id !== w3.key; }).forEach(function (x) { M.letBe(c, x.id); });
    if (M.light(c) !== w3.best.light) bad.push(g.seed + ': w3 putting the key out and lighting what it frees is not the best');
    var cb = M.makeWorld(spec); M.putOut(cb, M.biggest(w3).id);
    if (cb.stars.some(function (x) { return x.status === 'wait' && x.id !== M.biggest(w3).id; })) bad.push(g.seed + ': w3 putting the biggest out frees something');
    var keys = M.lit(M.makeWorld(spec)).filter(function (st) { var w = M.makeWorld(spec); M.putOut(w, st.id); var set = M.lit(w).map(function (x) { return x.id; }).concat(w.stars.filter(function (x) { return x.status === 'wait' && x.id !== st.id; }).map(function (x) { return x.id; })).sort().join(','); return set === w3.best.ids.slice().sort().join(','); });
    if (keys.length !== 1) bad.push(g.seed + ': w3 has ' + keys.length + ' keys');
  });
  var f = function (re) { return bad.filter(function (b) { return re.test(b); }); };
  check('world 1 on every draw: the best leaves at least two out, is unique, and nothing can be ended unlit', f(/w1/).length === 0, f(/w1/).slice(0, 3).join('; '));
  check('world 2 on every draw: the big one is out of the best, its holders outweigh it, heaviest-first falls short', f(/w2/).length === 0, f(/w2/).slice(0, 3).join('; '));
  check('world 3 on every draw: filled by weight is short, one key star (not the biggest) opens the way, the biggest opens nothing', f(/w3/).length === 0, f(/w3/).slice(0, 3).join('; '));
  var g0 = games[0], w = M.makeWorld({ k: 0, stars: g0.worlds[0].stars, pairs: g0.worlds[0].pairs });
  check('nothing is chosen for the player: Let it be ends a world with exactly what was lit', (function () { M.letBe(w, w.stars[0].id); var r = M.letItBe(w); return r.light === w.stars[0].w && M.lit(w).length === 1; })());
})();

// 3. layout on every draw
(function () {
  var bad = 0; games.forEach(function (g) { g.worlds.concat(g.judge.skies).forEach(function (w) { if (!M.layoutOk(w.stars, w.pairs)) bad++; }); });
  check('layout on every drawn sky: no line through a star, no crossing lines, no touching stars', bad === 0, bad + ' bad');
  var sizes = games.map(function (g) { return g.worlds.map(function (w) { return w.stars.length; }).join('/'); });
  out.push('     star counts (w1/w2/w3), first eight games: ' + sizes.slice(0, 8).join('  '));
})();

// 4. the torch world
(function () {
  var bad = [];
  games.forEach(function (g) {
    var J = g.judge, A = J.skies.filter(function (s) { return s.full; })[0], B = J.skies.filter(function (s) { return !s.full; })[0];
    if (!A || !B) { bad.push(g.seed + ': not one full and one short'); return; }
    if (M.light(A) !== A.best.light) bad.push(g.seed + ': full sky not best');
    if (M.light(B) >= B.best.light) bad.push(g.seed + ': short sky is best');
    var sm = M.star(B, B.small), bg = M.star(B, B.big);
    if (B.best.light - M.light(B) !== bg.w - sm.w) bad.push(g.seed + ': short sky not short by big less small');
    if (M.light(A) !== M.light(B)) bad.push(g.seed + ': the two skies open with different light');
    if (A.stars.map(function (s) { return s.id + s.x + s.y + s.status; }).join() !== B.stars.map(function (s) { return s.id + s.x + s.y + s.status; }).join()) bad.push(g.seed + ': the two skies differ in what is lit or where');
    if (M.conflicts(A, A.big).length < 3 || M.conflicts(B, B.big).length !== 1) bad.push(g.seed + ': holders wrong');
    var lits = M.lit(A).map(function (s) { return s.id; });
    var a2 = M.makeLampWorld({ stars: A.stars, pairs: A.pairs, lit: lits, small: A.small, big: A.big, full: true });
    M.decide({ skies: [a2], radius: C.TORCH.radius }, 0, 'out'); if (a2.came.length || a2.after !== a2.before - sm.w) bad.push(g.seed + ': in the full sky, putting the small one out should lose it and gain nothing');
    var b2 = M.makeLampWorld({ stars: B.stars, pairs: B.pairs, lit: lits, small: B.small, big: B.big, full: false });
    M.decide({ skies: [b2], radius: C.TORCH.radius }, 0, 'out'); if (b2.came.length !== 1 || b2.after !== b2.best.light) bad.push(g.seed + ': in the short sky, putting the small one out should let the big one in and reach the best');
    // a torch struck on the big star lights at least one holder line in the full sky
    var a3 = M.makeLampWorld({ stars: A.stars, pairs: A.pairs, lit: lits, small: A.small, big: A.big, full: true }), J3 = { skies: [a3], radius: C.TORCH.radius };
    var bg3 = M.star(a3, a3.big); M.strike(J3, 0, bg3.x, bg3.y); if (!M.torchSawHolders(J3, 0)) bad.push(g.seed + ': a torch on the big star does not reach its holders\' lines');
  });
  check('torch world on every draw: same opening, one sky the fullest, the other short by exactly the big star less the small, the hand works, a torch on the big one lights a holder line', bad.length === 0, bad.slice(0, 3).join('; '));
  var J = games[0].judge, s0 = J.skies[0];
  check('one torch only', M.strike(J, 0, 10, 10) && !M.strike(J, 0, 20, 20) && !!s0.torch);
  check('decide after the torch still works', M.decide(J, 0, 'leave') !== null);
})();

// 5. robustness: claim = weight^k, how far the world-2 and world-3 lessons survive, over the draws
(function () {
  var kIn = [], kStep = [];
  games.slice(0, 60).forEach(function (g) {
    var w2 = g.worlds[1], w3 = g.worlds[2], big = M.biggest(w2), a = null, b = null;
    for (var k = 1; k <= 4.001; k += 0.05) {
      if (a === null && M.solve(w2, function (s) { return Math.pow(s.w, k); }).ids.indexOf(big.id) >= 0) a = k;
      var Lw = M.lit(w3).reduce(function (acc, s) { return acc + Math.pow(s.w, k); }, 0);
      if (b === null && M.solve(w3, function (s) { return Math.pow(s.w, k); }).light <= Lw + 1e-9) b = k;
    }
    kIn.push(a === null ? 4 : a); kStep.push(b === null ? 4 : b);
  });
  var minIn = Math.min.apply(null, kIn), minStep = Math.min.apply(null, kStep);
  check('world 2 lesson holds for claim = weight^k up to at least k ≈ ' + minIn.toFixed(2) + ' on every draw tried', minIn > 1.1, 'least k where the big one enters the best: ' + minIn.toFixed(2));
  check('world 3 lesson holds for claim = weight^k up to at least k ≈ ' + minStep.toFixed(2) + ' on every draw tried', minStep > 1.1, 'least k where the step back stops paying: ' + minStep.toFixed(2));
})();

// 6. heuristics (build.md §3): heaviest-first, random, best, averaged over draws
(function () {
  var R = M.mulberry32(7), agg = [[], [], []];
  games.slice(0, 50).forEach(function (g) {
    [0, 1, 2].forEach(function (k) {
      var w = g.worlds[k], spec = { k: k, stars: w.stars, pairs: w.pairs, prefill: k === 2, key: w.key };
      var gr = M.playGreedy(M.makeWorld(spec)).light, be = M.playBest(M.makeWorld(spec)).light, rs = [];
      for (var t = 0; t < 20; t++) rs.push(M.playRandom(M.makeWorld(spec), R).light);
      agg[k].push({ gr: gr / w.best.light, be: be / w.best.light, rnd: rs.reduce(function (a, b) { return a + b; }, 0) / rs.length / w.best.light, max: Math.max.apply(null, rs) <= w.best.light });
    });
  });
  agg.forEach(function (a, k) {
    var mean = function (f) { return (a.reduce(function (x, y) { return x + f(y); }, 0) / a.length).toFixed(2); };
    out.push('     world ' + (k + 1) + ', as a share of the best: heaviest-first ' + mean(function (y) { return y.gr; }) + ' · random ' + mean(function (y) { return y.rnd; }) + ' · best play ' + mean(function (y) { return y.be; }));
    check('world ' + (k + 1) + ': best play reaches the best on every draw; random play never beats it', a.every(function (y) { return y.be === 1 && y.max; }));
  });
  check('world 2: heaviest-first is beaten by best play on every draw', agg[1].every(function (y) { return y.gr < 1; }));
})();

// 7. words
(function () {
  check('words: full', M.shortWords(21, 21) === 'as full as it can be');
  check('words: 12 of 19 is about a third short', M.shortWords(12, 19) === 'about a third short', M.shortWords(12, 19));
  var g = M.newGame(3); M.playGreedy(g.worlds[0]); M.playGreedy(g.worlds[1]); M.letItBe(g.worlds[2]); M.strike(g.judge, 0, 100, 100); M.decide(g.judge, 0, 'out'); M.decide(g.judge, 1, 'leave');
  var v = M.verdict(g);
  check('verdict has four found lines and a world-4 line about the torch', v.found.length === 4 && /World 4: .*torch/.test(v.found[3]), v.found[3]);
  var g3 = M.newGame(4); M.playBest(g3.worlds[0]); M.playBest(g3.worlds[1]); M.playBest(g3.worlds[2]); M.decide(g3.judge, 0, 'leave'); M.decide(g3.judge, 1, 'leave');
  check('verdict head for the best player', M.verdict(g3).head === 'All three of your skies are as full as they can be.', M.verdict(g3).head);
  check('no sky has two stars of one colour', games.every(function (g) { return g.worlds.concat(g.judge.skies).every(function (w) { var ids = w.stars.map(function (s) { return s.id; }); return ids.length === new Set(ids).size; }); }));
})();

console.log(out.join('\n'));
console.log(fails ? '\n' + fails + ' FAILED' : '\nALL PASSED');
process.exit(fails ? 1 : 0);
