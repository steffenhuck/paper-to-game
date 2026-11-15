// Calibration check for Gödel's Endgame. Run: node calibration.js. Exit code 1 on any failure.
var M = require('./mechanism.js'), C = M.GODEL_CONFIG;
var fails = 0, out = [];
function check(name, ok, detail) { out.push((ok ? 'PASS ' : 'FAIL ') + name + (detail ? ' — ' + detail : '')); if (!ok) fails++; }

function boxes(keys, max) {
  var all = [[]], layer = [[]];
  for (var n = 1; n <= max; n++) {
    var next = [];
    layer.forEach(function (b) { keys.forEach(function (k) { next.push(b.concat([k])); }); });
    all = all.concat(next); layer = next;
  }
  return all;
}

// 1. Without TWICE no sentence can talk about itself: what it talks about is always shorter than the sentence.
(function () {
  var P = C.puzzles.nothis, bs = boxes(P.keys, P.maxBox), self = 0, shorter = 0;
  bs.forEach(function (b) {
    var s = M.gStr(P.front, b), t = M.gSubject(s);
    if (M.gSelf(s)) self++;
    if (M.gPieces(t) < M.gPieces(s)) shorter++;
  });
  check('no TWICE: no box makes the sentence talk about itself', self === 0, bs.length + ' boxes up to ' + P.maxBox + ' keys');
  check('no TWICE: the thing talked about is always shorter', shorter === bs.length);
  check('no TWICE: no answer exists to show', M.gAnswer('nothis') === null);
})();

// 2. Each puzzle has exactly one answer within its box size, and it is the one gAnswer gives.
['twiceA', 'twiceB', 'self1', 'self2'].forEach(function (id) {
  var P = C.puzzles[id], bs = boxes(P.keys, P.maxBox);
  var hits = bs.filter(function (b) { return M.gHit(id, b); });
  check(id + ': exactly one answer among ' + bs.length + ' boxes', hits.length === 1,
    hits.map(function (b) { return '[' + b.join(' ') + ']'; }).join(', '));
  check(id + ': the shown answer is that answer', hits.length === 1 && hits[0].join(' ') === M.gAnswer(id).join(' '));
});

// 3. The diagonal, in general: for every front of the grammar and every box up to 3 keys,
//    the sentence talks about itself exactly when the front has TWICE and the box repeats the front.
(function () {
  var fronts = [];
  [false, true].forEach(function (neg) { ['P1', 'P2'].forEach(function (m) { [false, true].forEach(function (tw) {
    var f = []; if (neg) f.push('NOT'); f.push(m); if (tw) f.push('TWICE'); fronts.push(f);
  }); }); });
  var bad = 0, n = 0;
  fronts.forEach(function (f) { boxes(['NOT', 'P1', 'P2', 'TWICE'], 4).forEach(function (b) {
    n++;
    var s = M.gStr(f, b), expect = f.indexOf('TWICE') >= 0 && b.join(' ') === f.join(' ');
    if (M.gSelf(s) !== expect) bad++;
  }); });
  check('diagonal: self-reference iff TWICE and box = front', bad === 0, n + ' sentences, 8 fronts');
})();

// 4. The doors, for Machine I's sentence.
(function () {
  var G = M.gStr(C.puzzles.self1.front, M.gAnswer('self1'));
  check('G is the Gödel kind', M.gStatus(G) === 'goedel', M.gText(G));
  var a = M.gDoor(G, true), b = M.gDoor(G, false);
  check('door "prints it": the sentence is false and the machine not honest', !a.sentenceTrue && !a.honest);
  check('door "never prints it": the sentence is true and the machine honest', b.sentenceTrue && b.honest);
  var praise = M.gStr(['P1', 'TWICE'], ['P1', 'TWICE']);
  check('the self-praising sentence is the other kind, not settled by the doors', M.gStatus(praise) === 'praise' && M.gDoor(praise, true) === null);
})();

// 5. Machine II.
(function () {
  var G1 = C.machine2Rule, G2 = M.gStr(C.puzzles.self2.front, M.gAnswer('self2'));
  check('Machine II: its own sentence is the Gödel kind', M.gStatus(G2) === 'goedel', M.gText(G2));
  check('Machine II: its sentence is not Machine I\'s', !M.gSame(G1, G2));
  var old = M.gStr(['NOT', 'P2', 'TWICE'], ['NOT', 'P1', 'TWICE']);
  check('Machine II: the old box gives a false sentence (it prints the old one now)', M.gStatus(old) === 'ruleFalse', M.gText(old));
  check('Machine II cannot print its certificate either', M.gCertificatePrintable() === false);
})();

// 6. Mirror: the screen's piece-by-piece comparison agrees with gSelf.
(function () {
  var bad = 0;
  boxes(['NOT', 'P1', 'TWICE'], 4).forEach(function (b) {
    var s = M.gStr(['NOT', 'P1', 'TWICE'], b), m = M.gMirror(s);
    var allSame = m.sentence.length === m.subject.length && m.sentence.every(function (x) { return x.same; });
    if (allSame !== m.equal) bad++;
  });
  check('mirror: all pieces match exactly when the sentence talks about itself', bad === 0);
})();

// 7. Gödel numbers.
(function () {
  var G = M.gStr(C.puzzles.self1.front, M.gAnswer('self1')), g = M.gNumber(G);
  check('G has 8 signs', g.factors.length === 8, g.factors.map(function (f) { return f.p + '^' + f.e; }).join(' x '));
  check('G\'s number is large', g.digits > 50, g.digits + ' digits, begins ' + g.lead);
  out.push('INFO G = ' + M.gText(G) + ' ; number has ' + g.digits + ' digits, begins ' + g.lead + '..., ends ...' + g.tail);
})();

// 8. Playing it in numbers: ways of filling the box in the self1 puzzle, tries to the answer.
(function () {
  var P = C.puzzles.self1, bs = boxes(P.keys, P.maxBox).filter(function (b) { return b.length; });
  function rnd(seed) { return function () { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; }; }
  var r = rnd(7), tries = [];
  for (var i = 0; i < 1000; i++) {
    var t = 0, hit = false;
    while (!hit && t < 200) { t++; hit = M.gHit('self1', bs[Math.floor(r() * bs.length)]); }
    tries.push(t);
  }
  tries.sort(function (a, b) { return a - b; });
  out.push('TABLE self1, random boxes (1000 players): median ' + tries[500] + ' tries, within ' + P.showAfter + ' tries: ' +
    tries.filter(function (t) { return t <= P.showAfter; }).length / 10 + '%');
  out.push('TABLE self1, copy the front into the box: 1 try');
  out.push('TABLE self1, carry over twiceB\'s answer [NOT PRINTS]: miss — talks about NOT PRINTS [NOT PRINTS], one key short');
  out.push('TABLE self1, put TWICE alone or first: miss — the subject starts with TWICE, the sentence with NOT');
  check('random filling rarely finds it inside the show-me budget (it is a puzzle, not a lottery)',
    tries.filter(function (t) { return t <= P.showAfter; }).length < 200);
})();

out.push(fails ? fails + ' FAILED' : 'all checks passed');
console.log(out.join('\n'));
process.exit(fails ? 1 : 0);
