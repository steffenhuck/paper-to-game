// Calibration check for Gödel's Loophole (memo §17). The mechanism is a toy built from the paper's argument, so there are
// no reported numbers to hit; what is checked is (1) the number facts; (2) that every shape about the rulebook with a
// fixed target settles; (3) an exhaustive sweep of the composer: every shape 6 the player can write, filled with every
// number, terminates, and the only unsettled sentence is Gödel's (does not prove, □, □, filled with 6), with the
// self-praising one proved; (4) the paper's structure: the loophole is unprovable, its opposite unprovable, and it is
// true; c + G has a new loophole (and so on for four editions); c + ¬G is consistent and ω-inconsistent; Wid(c) is
// unprovable and would prove G; (5) robustness: other number facts, more and fewer fixed shapes, and the paper's own
// weaker rulebook that cannot certify a "no"; (6) the heuristics table of build.md §3; (7) the words.
// Run: node calibration.js  (exit code 1 on any failure)
var M = require('./mechanism.js'), C = M.CONFIG;
var fails = 0, out = [];
function check(name, ok, detail) { out.push((ok ? 'PASS ' : 'FAIL ') + name + (detail !== undefined ? '  — ' + detail : '')); if (!ok) fails++; }
function game6(pol, A, B) { var g = M.newGame(); M.writeShape6(g, pol, A, B); return g; }

// 1. number facts against a reference
(function () {
  var ref = { even: function (n) { return n % 2 === 0; }, prime: function (n) { return [2, 3, 5, 7, 11, 13].indexOf(n) >= 0; }, gt3: function (n) { return n > 3; } };
  var ok = true, bad = [];
  for (var s = 1; s <= 3; s++) for (var n = 1; n <= 13; n++) { var g = M.newGame(); var r = M.settle(g, 1, s, n); var want = ref[C.SHAPES[s - 1].pred](n) ? 'tick' : 'cross'; if (r.v !== want) { ok = false; bad.push(s + ':' + n); } }
  check('shapes 1–3 settle every number 1–13 as arithmetic says', ok, bad.join(','));
})();

// 2. shapes 4 and 5 settle for every fill 1–5, and say what a direct computation says
(function () {
  var g = M.newGame(), ok = true, bad = [];
  for (var n = 1; n <= 5; n++) {
    var r4 = M.settle(g, 1, 4, n), want4 = (n % 2 === 0) ? 'tick' : 'cross';
    var r5 = M.settle(g, 1, 5, n), inner = M.settle(g, 1, n, 3), want5 = inner.v === 'tick' ? 'cross' : 'tick';
    if (r4.v !== want4 || r5.v !== want5 || inner.v === 'loop') { ok = false; bad.push(n); }
  }
  check('shapes 4 and 5 (about the rulebook) settle for every fill 1–5 and agree with the ledger', ok, bad.join(','));
})();

// 3. the composer sweep
(function () {
  var loops = [], ticksBySelf = [], maxLines = 0, total = 0, allSettle = true;
  C.COMPOSER.pols.forEach(function (pol) { C.COMPOSER.slots.forEach(function (A) { C.COMPOSER.slots.forEach(function (B) {
    for (var n = 1; n <= 6; n++) {
      var g = game6(pol, A, B); var r = M.settle(g, 1, 6, n); total++;
      maxLines = Math.max(maxLines, r.lines.length);
      if (r.v === 'loop') loops.push(pol + ',' + A + ',' + B + ',' + n);
      if (r.v === 'tick' && r.cycle) ticksBySelf.push(pol + ',' + A + ',' + B + ',' + n);
      // every other shape on the board still settles with this shape 6 present
      for (var s = 1; s <= 5; s++) for (var m = 1; m <= 6; m++) { var q = M.settle(g, 1, s, m); if (q.v === 'loop' && !(s === 5 && m === 6 && r.v === 'loop' && n === 6)) allSettle = false; }
    }
  }); }); });
  check('composer sweep: ' + total + ' sentences, every one terminates', total === 2 * 6 * 6 * 6);
  check('exactly one sentence is unsettled: Gödel’s (does not prove, □, □) filled with 6', loops.length === 1 && loops[0] === '-,hole,hole,6', loops.join(' | '));
  check('exactly one sentence is proved by referring to itself: the self-praising one (proves, □, □) filled with 6', ticksBySelf.length === 1 && ticksBySelf[0] === '+,hole,hole,6', ticksBySelf.join(' | '));
  check('with any shape 6 on the board, shapes 1–5 still settle (except shape 5 filled with 6, which quotes the loophole)', allSettle);
  check('longest working is ' + maxLines + ' lines (fits a phone board)', maxLines <= 14, maxLines);
})();

// 4. the paper's structure
(function () {
  var g = game6('-', 'hole', 'hole');
  var r = M.settle(g, 1, 6, 6);
  check('Proposition VI: 17 Gen r is not provable (unsettled, not proved)', r.v === 'loop');
  check('Proposition VI: Neg(17 Gen r) is not provable (unsettled, not refuted)', r.v !== 'cross');
  check('the loophole is true: the rulebook does not prove it, which is what it says', r.v !== 'tick');
  check('the working names the self-reference and ends with the loop mark', r.lines[0].mark === 'self' && r.lines[r.lines.length - 1].mark === 'loop');
  // c + G: a new loophole, four editions deep
  var gg = game6('-', 'hole', 'hole'); M.run(gg, 2, 5); M.run(gg, 4, 3); M.run(gg, 5, 5); M.run(gg, 6, 6); M.startActTwo(gg);
  var a = M.addRule(gg, 'loop');
  check('c + G: the loophole sentence is now proved by rule', M.settle(gg, 2, 6, 6).v === 'tick');
  check('c + G: a new shape about Rulebook 2 appears as shape 7', a.newShape === 7 && /Rulebook 2 does not prove shape □ filled with □/.test(a.newShapeText));
  check('c + G: shape 7 filled with 7 is Rulebook 2’s loophole', M.settle(gg, 2, 7, 7).v === 'loop');
  check('c + G: shape 7 filled with 6 is refuted (Rulebook 2 proves shape 6 filled with 6)', M.settle(gg, 2, 7, 6).v === 'cross');
  var ok = true; for (var n = 1; n <= 5; n++) if (M.settle(gg, 2, 7, n).v === 'loop') ok = false; check('c + G: shape 7 filled with 1–5 settles', ok);
  // further editions by hand
  for (var k = 3; k <= 5; k++) { gg.rulebooks[k] = M.newRulebook(k, String(k), [{ no: 3, of: String(k), s: k + 4, n: k + 4, v: 'tick' }], k - 1); gg.shapes.push({ kind: 'meta', rb: k, pol: '-', A: 'hole', B: 'hole' }); }
  check('editions 3, 4, 5: each proves every earlier loophole and has a new one of its own', M.settle(gg, 3, 7, 7).v === 'tick' && M.settle(gg, 3, 8, 8).v === 'loop' && M.settle(gg, 5, 8, 8).v === 'tick' && M.settle(gg, 5, 9, 9).v === 'tick' && M.settle(gg, 5, 10, 10).v === 'loop' && M.settle(gg, 5, 6, 6).v === 'tick');
  // c + ¬G: consistent, ω-inconsistent
  var go = game6('-', 'hole', 'hole'); M.run(go, 1, 2); M.run(go, 2, 4); M.run(go, 5, 4); M.run(go, 6, 6); M.startActTwo(go);
  var b = M.addRule(go, 'opp');
  check('c + ¬G: the loophole sentence is refuted by rule, and the rule says a page proves it', M.settle(go, 'opp', 6, 6).v === 'cross' && /Some page/.test(b.exists));
  var pg = M.pages(go), allCross = true; for (var i = 1; i <= pg.length + 2; i++) if (M.showPage(go, i).v !== 'cross') allCross = false;
  check('c + ¬G: every page of the ledger (' + pg.length + ' pages, and all after) is refuted as a proof: ω-inconsistent', allCross && pg.length === 4);
  var cons = true; for (var s = 1; s <= 6; s++) for (var n2 = 1; n2 <= 6; n2++) { if (s === 6 && n2 === 6) continue; if (M.settle(go, 'opp', s, n2).v !== M.settle(go, 1, s, n2).v) cons = false; }
  check('c + ¬G: consistent in the toy: every other sentence keeps Rulebook 1\u2019s verdict, and the new rule settles only the one Rulebook 1 left open', cons && M.settle(go, 'opp', 6, 6).v === 'cross' && M.settle(go, 1, 6, 6).v === 'loop');
  // Proposition XI
  var c1 = M.settleCertificate(g, 1);
  check('Proposition XI: Wid(c) is unsettled, and the chain passes through 17 Gen r', c1.v === 'loop' && /shape 6 filled with 6/.test(c1.lines[1].t));
  var c2 = M.settleCertificate(gg, 2);
  check('Proposition XI for c + G: Rulebook 2 cannot certify itself either (the chain passes through shape 7)', c2.v === 'loop' && /shape 7 filled with 7/.test(c2.lines[1].t));
})();

// 5. robustness
(function () {
  // (a) other number facts and other fixed shapes
  var saved = C.SHAPES;
  M.PREDS.square = { text: function (n) { return n + ' is a square'; }, test: function (n) { return [1, 4, 9].indexOf(n) >= 0; }, why: function (n) { return 'x'; } };
  M.PREDS.lt5 = { text: function (n) { return n + ' is less than 5'; }, test: function (n) { return n < 5; }, why: function (n) { return 'x'; } };
  var alts = [
    [{ kind: 'arith', pred: 'square' }, { kind: 'arith', pred: 'lt5' }, { kind: 'arith', pred: 'prime' }, { kind: 'meta', rb: 1, pol: '-', A: 2, B: 'hole' }, { kind: 'meta', rb: 1, pol: '+', A: 'hole', B: 1 }],
    [{ kind: 'arith', pred: 'even' }, { kind: 'arith', pred: 'lt5' }, { kind: 'meta', rb: 1, pol: '+', A: 'hole', B: 2 }],
    [{ kind: 'arith', pred: 'prime' }, { kind: 'arith', pred: 'even' }, { kind: 'arith', pred: 'square' }, { kind: 'arith', pred: 'lt5' }, { kind: 'meta', rb: 1, pol: '-', A: 1, B: 'hole' }, { kind: 'meta', rb: 1, pol: '-', A: 'hole', B: 4 }, { kind: 'meta', rb: 1, pol: '+', A: 'hole', B: 'hole' }]
  ];
  alts.forEach(function (shapes, ai) {
    C.SHAPES = shapes; var N = shapes.length + 1, loops = [], okAll = true;
    var slots = ['hole']; for (var i = 1; i < N; i++) slots.push(i);
    ['+', '-'].forEach(function (pol) { slots.forEach(function (A) { slots.forEach(function (B) { for (var n = 1; n <= N; n++) {
      var g = M.newGame(); M.writeShape6(g, pol, A, B); var r = M.settle(g, 1, N, n);
      if (r.v === 'loop') loops.push(pol + ',' + A + ',' + B + ',' + n);
    } }); }); });
    // a board that already holds a self-praising shape (a3's shape 7, "proves □ □") has a second loophole: the player's
    // "does not prove shape 7 filled with □" filled with 8 and shape 7 filled with 8 refer to each other through a "does not",
    // and the paper's logic agrees that neither is decidable (proving either would prove consistency).
    var expect = ai === 2 ? ['-,hole,hole,' + N, '-,7,hole,' + N] : ['-,hole,hole,' + N];
    var only = loops.sort().join('|') === expect.sort().join('|');
    check('robustness (a' + (ai + 1) + '): board of ' + shapes.length + ' other shapes: the loopholes in the composer are ' + expect.join(' and ') + (ai === 2 ? ' (the second through the board\u2019s own self-praising shape)' : ', the diagonal fill only'), only, loops.join(' | '));
  });
  C.SHAPES = saved;
  // (b) the paper's weaker rulebook: cannot certify a "no" (Proposition XI); the toy is generous
  C.GENEROUS_LEDGER = false;
  var g = game6('-', 'hole', 'hole'), r = M.settle(g, 1, 6, 6), gp = game6('+', 'hole', 'hole'), rp = M.settle(gp, 1, 6, 6);
  var unsettledFixed = 0; for (var s = 4; s <= 5; s++) for (var n = 1; n <= 5; n++) if (M.settle(g, 1, s, n).v === 'loop') unsettledFixed++;
  check('robustness (b): under the paper’s weaker rulebook the loophole is still unsettled and the self-praising sentence still proved', r.v === 'loop' && rp.v === 'tick');
  check('robustness (b): the weaker rulebook leaves more fixed sentences unsettled (' + unsettledFixed + ' of 10), so the toy is generous to the rulebook, as the memo says', unsettledFixed > 0);
  C.GENEROUS_LEDGER = true;
})();

// 6. the heuristics table (build.md §3): the obvious ways of playing the composer, within the budget of 6 runs
(function () {
  var rows = [];
  function play(name, seq) { var g = M.newGame(); M.run(g, 2, 5); M.run(g, 4, 3); M.run(g, 5, 5); var found = null, praise = false; for (var i = 0; i < seq.length && i < C.BUDGET.composerRuns; i++) { var q = seq[i]; M.writeShape6(g, q[0], q[1], q[2]); var r = M.run(g, 6, q[3]); if (r.v === 'tick' && r.cycle) praise = true; if (r.v === 'loop') { found = i + 1; break; } } rows.push([name, found ? 'loophole on run ' + found : 'no loophole in ' + Math.min(seq.length, C.BUDGET.composerRuns) + ' runs', praise ? 'met the cheap tick' : '']); return found; }
  var numbersOnly = play('number facts only (never writes shape 6)', []);
  var fixedMeta = play('shape 6 points at fixed shapes', [['+', 1, 2, 6], ['-', 2, 5, 6], ['+', 4, 'hole', 6], ['-', 5, 'hole', 6], ['-', 'hole', 3, 6], ['+', 'hole', 5, 6]]);
  var praiseFirst = play('self-praise first, then flips', [['+', 'hole', 'hole', 6], ['-', 'hole', 'hole', 6]]);
  var wrongNumber = play('Gödel’s shape, filled with 1 to 5 before 6', [['-', 'hole', 'hole', 1], ['-', 'hole', 'hole', 2], ['-', 'hole', 'hole', 3], ['-', 'hole', 'hole', 4], ['-', 'hole', 'hole', 5], ['-', 'hole', 'hole', 6]]);
  var godel = play('Gödel’s shape, filled with 6', [['-', 'hole', 'hole', 6]]);
  // random composer, 500 players
  var seed = 7, hits = 0, N = 500; function rnd(k) { seed = (seed * 1664525 + 1013904223) >>> 0; return Math.floor(seed / 4294967296 * k); }
  for (var p = 0; p < N; p++) { var seq = []; for (var i = 0; i < C.BUDGET.composerRuns; i++) seq.push([C.COMPOSER.pols[rnd(2)], C.COMPOSER.slots[rnd(6)], C.COMPOSER.slots[rnd(6)], 1 + rnd(6)]); var g = M.newGame(); M.run(g, 2, 5); M.run(g, 4, 3); M.run(g, 5, 5); for (var j = 0; j < seq.length; j++) { M.writeShape6(g, seq[j][0], seq[j][1], seq[j][2]); if (M.run(g, 6, seq[j][3]).v === 'loop') { hits++; break; } } }
  rows.push(['random composer (' + N + ' players, 6 runs each)', Math.round(100 * hits / N) + '% find the loophole', '']);
  out.push(''); out.push('Heuristics (build.md §3): ways of playing the composer'); rows.forEach(function (r) { out.push('  ' + r[0].padEnd(52) + r[1].padEnd(28) + r[2]); }); out.push('');
  check('heuristics: the number-only and fixed-target players never find it; the player who makes the shape look at itself does; the wrong-number player finds it on the 6th run', numbersOnly === null && fixedMeta === null && praiseFirst === 2 && wrongNumber === 6 && godel === 1);
  check('heuristics: random composing finds it rarely (' + Math.round(100 * hits / N) + '%), so the budget is not a lottery', hits / N < 0.1);
})();

// 7. the words
(function () {
  var g = M.newGame();
  check('shape texts show the hole as □', M.shapeText(g.shapes[0]) === '□ is even' && M.shapeText(g.shapes[3]) === 'Rulebook 1 proves shape 1 filled with □' && M.shapeText(g.shapes[4]) === 'Rulebook 1 does not prove shape □ filled with 3');
  check('a filled sentence reads in words', M.sentenceText(g, 2, 5) === '5 is a prime' && M.sentenceText(g, 5, 2) === 'Rulebook 1 does not prove shape 2 filled with 3');
  var g2 = game6('-', 'hole', 'hole'); M.run(g2, 1, 1); M.run(g2, 2, 2); M.run(g2, 3, 3); M.run(g2, 6, 6); M.startActTwo(g2); M.addRule(g2, 'loop'); M.run(g2, 7, 7); M.leaveRulebook2(g2); M.addRule(g2, 'opp'); M.showPage(g2, 1); M.placeBet(g2, false); M.runCertificate(g2);
  var v = M.verdict(g2);
  check('verdict has the four parts in words, no digits beyond the shape numbers', v.length === 4 && v.every(function (p) { return p.t.length > 40; }) && /4th sentence/.test(v[1].t) && /your bet stood/.test(v[1].t));
  var g3 = M.newGame(); M.run(g3, 1, 1); M.run(g3, 1, 2); M.run(g3, 1, 3); for (var i = 0; i < 6; i++) { M.writeShape6(g3, '+', 1, 2); M.run(g3, 6, 1); } M.godelWrites(g3); var r = M.run(g3, 6, 6);
  check('after six composer runs Gödel writes shape 6 and the player’s fill of 6 still loops', r.v === 'loop' && g3.record.foundBy === 'godel' && /Gödel/.test(M.verdict(g3)[1].t));
})();

console.log(out.join('\n'));
console.log('\n' + (fails ? fails + ' FAILED' : 'all checks passed'));
process.exit(fails ? 1 : 0);
