// Gödel's Endgame — mechanism. The single source of truth: build.py inlines this file verbatim into the game,
// and calibration.js runs against it. No DOM. Runs unchanged in Node and in the browser.
//
// The world (a toy, built to illustrate the paper's argument; see memo.md):
//   Act 1  Hilbert's promise. Sentences about whole numbers with + and x. A grammar decides what is a sentence.
//          For every sentence, the honest machine prints it or prints its NOT.
//   Act 2  The filing trick (the paper's section 2): every symbol has a code, a string of symbols is packed into one
//          number as 2^code1 x 3^code2 x 5^code3 ..., and unpacked again by dividing out the primes. So "the machine
//          has printed sentence number N" is itself a sentence about numbers.
//   Act 3  The sentence: "The machine never prints the following words, written twice, the second time in quotes:
//          "...""  with one gap. Filled with its own opening words, it talks about itself (the paper's [R(q); q]).
//          The honest machine can print neither it nor its NOT.

var GODEL_CONFIG = {
  // Act 1. The keypad, the first sentence Hilbert hands over, and the sentences "Give me one" deals.
  keypad: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '+', '×', '=', 'NOT'],
  maxTokens: 14,
  firstSentence: ['1', '+', '1', '=', '2'],
  dealt: [
    ['2', '×', '3', '=', '6'], ['3', '+', '4', '=', '8'], ['NOT', '5', '=', '6'], ['2', '×', '2', '×', '2', '=', '8'],
    ['9', '=', '3', '×', '3'], ['7', '+', '7', '=', '1', '5'], ['1', '2', '=', '3', '×', '4'], ['NOT', '2', '+', '2', '=', '4']
  ],
  roundsToSettle: 3,               // sentences settled before Act 2 opens (ours; the paper has no rounds)
  // Act 2. Symbol codes. The paper gives each basic sign an odd number (0 -> 1, f -> 3, ~ -> 5, ...); the game uses
  // small codes for its own symbols so that the numbers stay readable. Source of the method: section 2 of the paper.
  codes: { '1': 1, '2': 2, '3': 3, '+': 4, '×': 5, '=': 6, 'NOT': 7 },
  packSentence: ['1', '+', '1', '=', '2'],   // Hilbert's first sentence, printed in Act 1
  unpackSentence: ['2', '=', '2'],
  // Act 3. The frame and the choices for its gap.
  frame: 'The machine never prints the following words, written twice, the second time in quotes:',
  gapChoices: [
    '1 + 1 = 2',
    'the following words',
    'The machine never prints',
    'The machine never prints the following words, written twice, the second time in quotes:'
  ],
  hintAfter: 2,                     // wrong gap choices before the game points at the opening words (ours)
  // Act 4. Hilbert's repair.
  frame2: 'Machine II never prints the following words, written twice, the second time in quotes:'
};

// ---------- Act 1: grammar and truth ----------
// sentence := NOT* expr '=' expr ;  expr := num (('+' | '×') num)* ;  num := digit+ (no leading zero unless "0")
function gTokensToText(t) {
  var out = '';
  t.forEach(function (x, i) {
    var isDigit = /^[0-9]$/.test(x), prevDigit = i > 0 && /^[0-9]$/.test(t[i - 1]);
    out += (i === 0 || (isDigit && prevDigit)) ? x : ' ' + x;
  });
  return out;
}

function gParse(t) {
  var i = 0, nots = 0;
  if (!t.length) return { ok: false, why: 'Nothing written yet.' };
  while (t[i] === 'NOT') { nots++; i++; }
  if (t.slice(i).indexOf('NOT') >= 0) return { ok: false, why: 'NOT can only go at the front.' };
  var eq = t.filter(function (x) { return x === '='; }).length;
  if (eq === 0) return { ok: false, why: 'A sentence needs an = sign: it has to claim that two things are equal.' };
  if (eq > 1) return { ok: false, why: 'Only one = sign: a sentence makes one claim.' };
  function expr(from, to) {
    var parts = [], cur = '', ops = [];
    for (var j = from; j < to; j++) {
      var x = t[j];
      if (/^[0-9]$/.test(x)) cur += x;
      else if (x === '+' || x === '×') {
        if (!cur) return { ok: false, why: 'Two signs in a row, or a sign with no number before it.' };
        parts.push(cur); ops.push(x); cur = '';
      } else return { ok: false, why: 'That is not a symbol of the machine.' };
    }
    if (!cur) return { ok: false, why: 'Each side of = has to end with a number.' };
    parts.push(cur);
    for (var k = 0; k < parts.length; k++) if (parts[k].length > 1 && parts[k][0] === '0') return { ok: false, why: 'A number cannot start with 0.' };
    return { ok: true, nums: parts, ops: ops };
  }
  var e = t.indexOf('=', i), L = expr(i, e), R = expr(e + 1, t.length);
  if (!L.ok) return L;
  if (!R.ok) return R;
  return { ok: true, nots: nots, left: L, right: R };
}

function gValue(ex) { // x before +
  var sum = BigInt(0), prod = BigInt(ex.nums[0]);
  for (var k = 0; k < ex.ops.length; k++) {
    if (ex.ops[k] === '×') prod = prod * BigInt(ex.nums[k + 1]);
    else { sum = sum + prod; prod = BigInt(ex.nums[k + 1]); }
  }
  return sum + prod;
}

// Is the sentence true? (null if it is not a sentence)
function gTrue(t) {
  var p = gParse(t);
  if (!p.ok) return null;
  var eq = gValue(p.left) === gValue(p.right);
  return (p.nots % 2 === 0) ? eq : !eq;
}

// The honest machine: which button settles it. 'print' = print it; 'not' = print its NOT.
function gRightButton(t) { var v = gTrue(t); return v === null ? null : (v ? 'print' : 'not'); }

// ---------- Act 2: the filing trick ----------
function gPrimes(n) { var p = [], k = 2; while (p.length < n) { if (p.every(function (q) { return k % q; })) p.push(k); k++; } return p; }

// Pack step by step: returns the running number after each symbol.
function gPackSteps(t) {
  var ps = gPrimes(t.length), n = BigInt(1), steps = [];
  t.forEach(function (x, i) {
    var c = GODEL_CONFIG.codes[x];
    n = n * (BigInt(ps[i]) ** BigInt(c));
    steps.push({ symbol: x, code: c, prime: ps[i], value: n.toString() });
  });
  return steps;
}
function gPack(t) { var s = gPackSteps(t); return s[s.length - 1].value; }

// Unpack: divide out 2, 3, 5, ... in turn; the number of times each divides is the code.
function gUnpack(numStr) {
  var n = BigInt(numStr), ps = gPrimes(20), out = [], byCode = {};
  Object.keys(GODEL_CONFIG.codes).forEach(function (s) { byCode[GODEL_CONFIG.codes[s]] = s; });
  for (var i = 0; i < ps.length && n > BigInt(1); i++) {
    var p = BigInt(ps[i]), c = 0;
    while (n % p === BigInt(0)) { n = n / p; c++; }
    if (c === 0) return null;            // a gap in the primes: not a packed sentence
    out.push(byCode[c] || '?');
  }
  return n === BigInt(1) ? out : null;
}

// One division, for the player's buttons: can p divide n? returns the new number or null.
function gDivide(numStr, p) { var n = BigInt(numStr), q = BigInt(p); return n % q === BigInt(0) ? (n / q).toString() : null; }

// ---------- Act 3: the recipe and the sentence about itself ----------
function gDouble(x) { return x + ' “' + x + '”'; }                         // X, then X in quotes
function gSentence(frame, x) { return frame + ' “' + x + '”'; }           // the frame with its gap filled
function gTalksAbout(frame, x) { return gDouble(x); }                                // what the filled sentence is about
function gSelf(frame, x) { return gTalksAbout(frame, x) === gSentence(frame, x); }  // true iff x is the frame itself

// The dilemma. The machine is honest: it never prints a false sentence.
//   print : the slip says the machine never prints it, and it has just printed it -> a false slip.
//   not   : the NOT says the machine does print it; it printed the NOT instead -> a false slip.
//   neither: nothing printed; what the sentence says is so -> true, and the promise "it or its NOT" is broken.
function gDilemma(choice) {
  if (choice === 'print') return { printed: 'it', slipTrue: false, honest: false };
  if (choice === 'not') return { printed: 'its NOT', slipTrue: false, honest: false };
  return { printed: 'nothing', sentenceTrue: true, honest: true, promiseKept: false };
}

if (typeof module !== 'undefined') module.exports = {
  GODEL_CONFIG: GODEL_CONFIG, gTokensToText: gTokensToText, gParse: gParse, gValue: gValue, gTrue: gTrue,
  gRightButton: gRightButton, gPrimes: gPrimes, gPackSteps: gPackSteps, gPack: gPack, gUnpack: gUnpack,
  gDivide: gDivide, gDouble: gDouble, gSentence: gSentence, gTalksAbout: gTalksAbout, gSelf: gSelf, gDilemma: gDilemma
};
