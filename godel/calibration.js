// Calibration check for Gödel's Loophole, second build (memo R6). The mechanism is a toy built from the paper's argument,
// so there are no reported numbers to hit; what is checked is (1) the number facts; (2) every line about an earlier line is
// marked, and marked as the board says; (3) an exhaustive sweep of the composer at every line position: every line the
// player can write is marked except "Marker 1 will never tick this line", and "will tick this line" is ticked;
// (4) the paper's structure: G unmarked and true, lines about G unmarked; Marker 2 ticks G by rule and has an unmarkable
// line of its own (and so on for versions 3–5 built by hand); Marker 3 crosses G by rule, keeps every other mark, and says
// no to every day; the promise is unmarked, through G; (5) robustness: other start lines, the paper's weaker Marker, and
// the budget; (6) the heuristics table of build.md §3; (7) the words. Run: node calibration.js (exit 1 on any failure).
var M = require('./mechanism.js'), C = M.CONFIG;
var fails = 0, out = [];
function check(name, ok, detail) { out.push((ok ? 'PASS ' : 'FAIL ') + name + (detail !== undefined ? '  — ' + detail : '')); if (!ok) fails++; }

// 1. number facts
(function () {
  var ref = { even: function (n) { return n % 2 === 0; }, prime: function (n) { return [2, 3, 5, 7].indexOf(n) >= 0; }, gt3: function (n) { return n > 3; } };
  var ok = true, bad = [];
  C.PRED_ORDER.forEach(function (p) { C.NUMBERS.forEach(function (n) { var g = M.newGame(); var r = M.write(g, { kind: 'num', n: n, pred: p }); if (r.v !== (ref[p](n) ? 'tick' : 'cross')) { ok = false; bad.push(p + n); } }); });
  check('number facts: every chip pair marked as arithmetic says', ok, bad.join(','));
  var g = M.newGame();
  check('the class’s two lines: one tick, one cross on the board from the start', g.marks[1][1] === 'tick' && g.marks[1][2] === 'cross');
})();

// 2. lines about earlier lines
(function () {
  var g = M.newGame(); M.write(g, { kind: 'num', n: 5, pred: 'prime' }); M.write(g, { kind: 'num', n: 2, pred: 'gt3' });
  var ok = true;
  for (var t = 1; t <= 4; t++) [true, false].forEach(function (will) { var gg = JSON.parse(JSON.stringify(g)); var r = M.write(gg, { kind: 'mk', will: will, target: t }); var want = (will ? gg.marks[1][t] === 'tick' : gg.marks[1][t] !== 'tick') ? 'tick' : 'cross'; if (r.v !== want) ok = false; });
  check('a line about Marker 1’s mark on an earlier line is marked, and as the board says', ok);
})();

// 3. the composer sweep, at every line position the player can reach
(function () {
  var unmarked = [], selfTicks = [], total = 0;
  for (var pos = 0; pos < C.BUDGET.lines; pos++) {
    var base = M.newGame(); for (var i = 0; i < pos; i++) M.write(base, { kind: 'num', n: 3 + i, pred: C.PRED_ORDER[i % 3] });
    var specs = [];
    C.NUMBERS.forEach(function (n) { C.PRED_ORDER.forEach(function (p) { specs.push({ kind: 'num', n: n, pred: p }); }); });
    M.targets(base).forEach(function (t) { [true, false].forEach(function (w) { specs.push({ kind: 'mk', will: w, target: t }); }); });
    specs.forEach(function (s) { var g = JSON.parse(JSON.stringify(base)); var r = M.write(g, s); total++; var self = s.kind === 'mk' && s.target === r.no; if (r.v === 'none') unmarked.push(pos + ':' + JSON.stringify(s)); if (self && r.v === 'tick') selfTicks.push(pos + ':' + (s.will ? 'will' : 'never')); });
  }
  check('composer sweep: ' + total + ' lines at ' + C.BUDGET.lines + ' positions, every one marked except the self-referring "will never tick"', unmarked.length === C.BUDGET.lines && unmarked.every(function (u) { return /"will":false,"target":(\d+)/.test(u); }), unmarked.join(' | '));
  check('"will tick this line" is ticked at every position (Löb), and no other self line is', selfTicks.length === C.BUDGET.lines && selfTicks.every(function (s) { return /will$/.test(s); }), selfTicks.join(' | '));
})();

// 4. the paper's structure
(function () {
  var g = M.newGame(); M.write(g, { kind: 'num', n: 7, pred: 'prime' }); M.write(g, { kind: 'mk', will: true, target: 1 });
  var r = M.write(g, { kind: 'mk', will: false, target: 'this' }); var G = r.no;
  check('Proposition VI: the line "Marker 1 will never tick this line" gets no mark (neither tick nor cross)', r.v === 'none' && r.next === 'loophole');
  check('the loophole is true: not ticked, which is what it says', g.marks[1][G] !== 'tick');
  check('the working names the self-reference and ends with the no-mark line', r.lines[0].mark === 'self' && r.lines[r.lines.length - 1].mark === 'loop');
  var g2 = JSON.parse(JSON.stringify(g)); var a = M.write(g2, { kind: 'mk', will: true, target: G }), b = M.write(g2, { kind: 'mk', will: false, target: G });
  check('lines about the loophole’s mark are unmarked too (a sentence equivalent to G is not ticked)', a.v === 'none' && b.v === 'none');
  // Marker 2
  var h = JSON.parse(JSON.stringify(g)); M.startActTwo(h); var ar = M.addRule(h, 'loop');
  check('c + G: Marker 2 ticks the loophole by rule', ar.ver === 2 && M.mark(h, 2, G).v === 'tick');
  var r2 = M.write(h, { kind: 'mk', will: false, target: 'this' });
  check('c + G: Marker 2’s own "will never tick this line" is unmarked: a new loophole', r2.v === 'none' && r2.next === 'mk2found');
  var r3 = M.write(JSON.parse(JSON.stringify(h)), { kind: 'mk', will: false, target: G });
  check('c + G: "Marker 2 will never tick line G" is crossed (Marker 2 ticks G)', r3.v === 'cross');
  // versions 3–5 by hand
  var v = JSON.parse(JSON.stringify(h)); var last = r2.no;
  for (var k = 3; k <= 5; k++) { v.markers[k] = M.newMarker(k, [{ no: last, mark: 'tick', text: 'x' }], k - 1); v.current = k; v.marks[k] = {}; v.lines.push({ kind: 'mk', ver: k, will: false, target: 'this' }); var rr = M.mark(v, k, v.lines.length); v.marks[k][v.lines.length] = rr.v; if (rr.v !== 'none' || M.mark(v, k, last).v !== 'tick' || M.mark(v, k, G).v !== 'tick') fails++, out.push('FAIL version ' + k); last = v.lines.length; }
  check('versions 3, 4, 5: each ticks every earlier loophole by rule and has an unmarkable line of its own', true);
  // Marker 3
  var o = JSON.parse(JSON.stringify(g)); M.startActTwo(o); var br = M.addRule(o, 'opp');
  check('c + ¬G: Marker 3 crosses the loophole by rule (holds "Marker 1 will tick line G")', br.ver === 3 && M.mark(o, 3, G).v === 'cross' && /will tick line/.test(br.ruleText));
  var keep = true; for (var i = 1; i < G; i++) if (M.mark(o, 3, i).v !== M.mark(o, 1, i).v) keep = false;
  check('c + ¬G: every other line keeps Marker 1’s mark', keep);
  var days = true; for (var d = 1; d <= C.BUDGET.days + 2; d++) if (M.day(o, d).v !== 'cross') days = false;
  check('c + ¬G: every day asked about is a no, while the rule says it happens: ω-inconsistent', days);
  // Proposition XI
  var p = M.promise(g, 1);
  check('Proposition XI: the promise "Marker 1 never marks wrong" is unmarked, and the chain passes through line G', p.v === 'none' && new RegExp('line ' + G).test(p.lines[1].t));
  var p2 = M.promise(h, 2);
  check('Proposition XI for Marker 2: unmarked, through its own line', p2.v === 'none' && new RegExp('line ' + r2.no).test(p2.lines[1].t));
})();

// 5. robustness
(function () {
  var saved = C.START_LINES;
  [[], [{ kind: 'num', n: 3, pred: 'gt3' }], [{ kind: 'num', n: 2, pred: 'even' }, { kind: 'num', n: 8, pred: 'prime' }, { kind: 'mk', ver: 1, will: true, target: 1 }, { kind: 'mk', ver: 1, will: false, target: 2 }]].forEach(function (start, i) {
    C.START_LINES = start; var g = M.newGame(); var marked = Object.keys(g.marks[1]).every(function (k) { return g.marks[1][k] !== 'none'; });
    var r1 = M.write(g, { kind: 'mk', will: true, target: 'this' }), r2 = M.write(g, { kind: 'mk', will: false, target: 'this' });
    check('robustness (a' + (i + 1) + '): with ' + start.length + ' start lines, the start lines are marked, self-praise is ticked and Gödel’s line is unmarked', marked && r1.v === 'tick' && r2.v === 'none');
  });
  C.START_LINES = saved;
  C.GENEROUS = false;
  var g = M.newGame(); var w1 = M.write(g, { kind: 'mk', will: false, target: 2 }), w2 = M.write(g, { kind: 'mk', will: true, target: 1 }), w3 = M.write(g, { kind: 'mk', will: false, target: 'this' }), w4 = M.write(g, { kind: 'mk', will: true, target: 'this' });
  check('robustness (b): the paper’s weaker Marker cannot vouch for a "never" about a crossed line (unmarked), still ticks a true "will tick", and the loophole and the cheap tick are unchanged', w1.v === 'none' && w2.v === 'tick' && w3.v === 'none' && w4.v === 'tick');
  C.GENEROUS = true;
})();

// 6. heuristics (build.md §3): ways of playing Act 1 within the budget
(function () {
  var rows = [];
  function play(name, seq) { var g = M.newGame(); var found = null, praise = false; for (var i = 0; i < seq.length && i < C.BUDGET.lines; i++) { var r = M.write(g, seq[i]); if (seq[i].kind === 'mk' && seq[i].target === 'this' && r.v === 'tick') praise = true; if (r.next === 'loophole') { found = i + 1; break; } } rows.push([name, found ? 'loophole on line ' + (found + 2) + ' (their ' + found + ordinalSuffix(found) + ')' : 'no loophole in ' + Math.min(seq.length, C.BUDGET.lines) + ' lines', praise ? 'met the cheap tick' : '']); return found; }
  function ordinalSuffix(n) { return n === 1 ? 'st' : n === 2 ? 'nd' : n === 3 ? 'rd' : 'th'; }
  var numbers = play('number facts only', [1, 2, 3, 4, 5, 6].map(function (n) { return { kind: 'num', n: n, pred: 'prime' }; }));
  var others = play('about the Marker, earlier lines only', [{ kind: 'mk', will: true, target: 1 }, { kind: 'mk', will: false, target: 2 }, { kind: 'mk', will: true, target: 3 }, { kind: 'mk', will: false, target: 4 }, { kind: 'mk', will: true, target: 5 }, { kind: 'mk', will: false, target: 6 }]);
  var praise = play('self-praise first, then flips', [{ kind: 'mk', will: true, target: 'this' }, { kind: 'mk', will: false, target: 'this' }]);
  var godel = play('Gödel’s line straight away', [{ kind: 'mk', will: false, target: 'this' }]);
  var seed = 11, hits = 0, N = 500; function rnd(k) { seed = (seed * 1664525 + 1013904223) >>> 0; return Math.floor(seed / 4294967296 * k); }
  for (var p = 0; p < N; p++) { var g = M.newGame(); for (var i = 0; i < C.BUDGET.lines; i++) { var s = rnd(2) ? { kind: 'num', n: C.NUMBERS[rnd(C.NUMBERS.length)], pred: C.PRED_ORDER[rnd(3)] } : { kind: 'mk', will: !!rnd(2), target: M.targets(g)[rnd(M.targets(g).length)] }; if (M.write(g, s).next === 'loophole') { hits++; break; } } }
  rows.push(['random writing (' + N + ' players, ' + C.BUDGET.lines + ' lines each)', Math.round(100 * hits / N) + '% find the loophole', '']);
  out.push(''); out.push('Heuristics (build.md §3): ways of writing lines in Act 1'); rows.forEach(function (r) { out.push('  ' + r[0].padEnd(46) + r[1].padEnd(36) + r[2]); }); out.push('');
  check('heuristics: number-only and earlier-lines-only players never find it; the self-referrer does, on the first or second try', numbers === null && others === null && praise === 2 && godel === 1);
  check('heuristics: random writing finds it sometimes but not usually (' + Math.round(100 * hits / N) + '%): the chips make self-reference reachable without making it a lottery win', hits / N > 0.1 && hits / N < 0.6);
})();

// 7. the words
(function () {
  var g = M.newGame();
  check('line texts read in words, with "(this line)" on a self line', M.lineText(g.lines[0], 1) === '4 is even' && M.lineText({ kind: 'mk', ver: 1, will: false, target: 'this' }, 6) === 'Marker 1 will never tick line 6 (this line)' && M.plainText({ kind: 'mk', ver: 1, will: true, target: 2 }, 5) === 'Marker 1 will tick line 2');
  M.write(g, { kind: 'num', n: 7, pred: 'prime' }); M.write(g, { kind: 'mk', will: true, target: 'this' }); M.write(g, { kind: 'mk', will: false, target: 'this' }); M.startActTwo(g); M.addRule(g, 'opp'); M.day(g, 1); M.day(g, 2); M.leaveMarker(g); M.addRule(g, 'loop'); M.write(g, { kind: 'mk', will: false, target: 'this' }); M.leaveMarker(g); M.placeBet(g, false); M.runPromise(g);
  var v = M.verdict(g);
  check('verdict has the four parts in words', v.length === 4 && v.every(function (p) { return p.t.length > 40; }) && /3rd line/.test(v[1].t) && /cheap tick/.test(v[1].t) && /your bet stood/.test(v[1].t));
  var g3 = M.newGame(); for (var i = 0; i < C.BUDGET.lines; i++) M.write(g3, { kind: 'num', n: 2, pred: 'even' }); var r = M.godelWrites(g3);
  check('after the budget Gödel writes the line and it is unmarked; the verdict says so', r.v === 'none' && g3.record.foundBy === 'godel' && /Gödel/.test(M.verdict(g3)[1].t));
})();

console.log(out.join('\n'));
console.log('\n' + (fails ? fails + ' FAILED' : 'all checks passed'));
process.exit(fails ? 1 : 0);
