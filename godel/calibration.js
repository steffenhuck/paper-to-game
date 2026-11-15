// Calibration check for Gödel's Endgame (three acts). Run: node calibration.js. Exit code 1 on any failure.
var M = require('./mechanism.js'), C = M.GODEL_CONFIG;
var fails = 0, out = [];
function check(name, ok, detail) { out.push((ok ? 'PASS ' : 'FAIL ') + name + (detail ? ' — ' + detail : '')); if (!ok) fails++; }
function T(s) { return s.split(' '); }

// 1. Grammar.
[['1 + 1 = 2', true], ['NOT 5 = 6', true], ['NOT NOT 2 = 2', true], ['1 2 = 3 × 4', true], ['0 = 0', true],
 ['1 + 1', false], ['= 2', false], ['2 = 2 = 2', false], ['2 + = 4', false], ['2 = NOT 2', false], ['0 1 = 1', false],
 ['+ 2 = 2', false], ['2 × = 2', false]
].forEach(function (c) {
  var p = M.gParse(T(c[0]));
  check('grammar: "' + c[0] + '" ' + (c[1] ? 'is' : 'is not') + ' a sentence', p.ok === c[1], p.ok ? '' : p.why);
});

// 2. Truth, with x before +.
[['1 + 1 = 2', true], ['2 + 2 × 3 = 8', true], ['2 + 2 × 3 = 1 2', false], ['NOT 5 = 6', true], ['NOT NOT 3 = 3', true],
 ['1 2 = 3 × 4', true], ['7 + 7 = 1 5', false]
].forEach(function (c) { check('truth: ' + c[0], M.gTrue(T(c[0])) === c[1]); });
check('first sentence is a true sentence', M.gTrue(C.firstSentence) === true);
check('every dealt sentence is a sentence', C.dealt.every(function (t) { return M.gTrue(t) !== null; }));
check('dealt sentences need both buttons', C.dealt.some(function (t) { return M.gRightButton(t) === 'print'; }) && C.dealt.some(function (t) { return M.gRightButton(t) === 'not'; }));

// 3. Act 1 in numbers: every sentence the keypad can make up to 5 symbols is either not a sentence, or settled
//    by exactly one button. (Hilbert's promise holds for all of them.)
(function () {
  var keys = C.keypad, n = 0, sentences = 0, bad = 0;
  (function rec(t) {
    if (t.length) { n++; var v = M.gTrue(t); if (v !== null) { sentences++; if (['print', 'not'].indexOf(M.gRightButton(t)) < 0) bad++; } }
    if (t.length < 5) keys.forEach(function (k) { rec(t.concat([k])); });
  })([]);
  check('Act 1: every keypad sentence up to 5 symbols is settled by exactly one button', bad === 0, n + ' strings, ' + sentences + ' sentences');
})();

// 4. Act 2: packing and unpacking.
(function () {
  var steps = M.gPackSteps(C.packSentence), num = M.gPack(C.packSentence);
  check('pack 1+1=2', num === '11530778490', steps.map(function (s) { return s.prime + '^' + s.code + '=' + s.value; }).join(', '));
  check('unpack returns 1+1=2', M.gUnpack(num).join(' ') === C.packSentence.join(' '));
  var u = M.gPack(C.unpackSentence);
  check('the unpack puzzle number', u === '72900', u);
  check('unpack 72900 = 2 = 2', M.gUnpack(u).join(' ') === '2 = 2');
  // every string over the code symbols up to length 4 round-trips
  var syms = Object.keys(C.codes), bad = 0, n = 0;
  (function rec(t) { if (t.length) { n++; if ((M.gUnpack(M.gPack(t)) || []).join(' ') !== t.join(' ')) bad++; } if (t.length < 4) syms.forEach(function (s) { rec(t.concat([s])); }); })([]);
  check('every string up to 4 symbols packs and unpacks to itself', bad === 0, n + ' strings');
  check('a number with a gap in its primes is not a packed sentence', M.gUnpack('10') === null);
  check('division steps: 72900 / 2 = 36450', M.gDivide('72900', 2) === '36450' && M.gDivide('729', 2) === null);
})();

// 5. Act 3: exactly one gap choice makes the sentence talk about itself, and it is the frame's own opening words.
(function () {
  var hits = C.gapChoices.filter(function (x) { return M.gSelf(C.frame, x); });
  check('Act 3: exactly one gap choice talks about itself', hits.length === 1, hits[0]);
  check('Act 3: it is the frame itself', hits[0] === C.frame);
  check('Act 3: the recipe of the frame gives the whole sentence back', M.gDouble(C.frame) === M.gSentence(C.frame, C.frame));
  check('Act 4: same for Machine II', M.gSelf(C.frame2, C.frame2) && !M.gSelf(C.frame2, C.frame));
  ['print', 'not'].forEach(function (c) { var d = M.gDilemma(c); check('dilemma: "' + c + '" prints a false slip', d.slipTrue === false && d.honest === false); });
  var d = M.gDilemma('neither');
  check('dilemma: "neither" leaves the sentence true and breaks the promise', d.sentenceTrue && d.honest && d.promiseKept === false);
})();

out.push(fails ? fails + ' FAILED' : 'all checks passed');
console.log(out.join('\n'));
process.exit(fails ? 1 : 0);
