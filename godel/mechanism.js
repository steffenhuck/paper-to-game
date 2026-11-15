// Gödel's Endgame — mechanism. The single source of truth: build.py inlines this file verbatim into the game,
// and calibration.js runs against it. No DOM. Runs unchanged in Node and in the browser.
//
// The world (a toy, built to illustrate the paper's argument; see memo.md section 16):
// Hilbert's machine prints sentences typed from four keys: NOT, PRINTS, TWICE and a box [ ].
//   PRINTS [X]        says: the machine prints X.
//   PRINTS TWICE [X]  says: the machine prints "X [X]" (X, then a box with X in it).
//   NOT in front      turns "prints" into "never prints".
// The machine is honest: it never prints a false sentence.
// TWICE is the paper's substitution: a sentence with a hole, filled with its own name ([R(n); n], p. 175).

var GODEL_CONFIG = {
  // Keys. label = what is printed on the key; code = the number the paper's coding gives the sign.
  // NOT is the paper's ~ (5) and the box is the paper's brackets (11, 13). PRINTS and TWICE are not signs in the
  // paper but long formulas (Bew and Sb, built from definitions 1-46); they get the next free odd primes, 17 and 19,
  // and PRINTS II gets 23. Source: the sign table of section 2 of the paper.
  keys: {
    NOT:   { label: 'NOT',       code: 5 },
    P1:    { label: 'PRINTS',    code: 17, machine: 1 },
    P2:    { label: 'PRINTS II', code: 23, machine: 2 },
    TWICE: { label: 'TWICE',     code: 19 }
  },
  boxOpen: 11, boxClose: 13,
  // The puzzles, in order. front = the keys already typed and fixed; keys = what the player may put in the box;
  // target = 'self' (make the sentence talk about itself) or a string to hit. maxBox = keys the box holds.
  // hintAfter / showAfter = wrong tries before the game points at the fronts / offers to show the answer
  // (ours, so that nobody is stuck; they move nothing in the mechanism).
  puzzles: {
    nothis: { front: ['NOT', 'P1'],          keys: ['NOT', 'P1'],               target: 'self', maxBox: 6, hintAfter: 99, showAfter: 99 },
    twiceA: { front: ['P1', 'TWICE'],        keys: ['NOT', 'P1'],               target: { front: ['NOT'], box: ['NOT'] }, maxBox: 4, hintAfter: 2, showAfter: 4 },
    twiceB: { front: ['NOT', 'P1', 'TWICE'], keys: ['NOT', 'P1'],               target: { front: ['NOT', 'P1'], box: ['NOT', 'P1'] }, maxBox: 4, hintAfter: 2, showAfter: 4 },
    self1:  { front: ['NOT', 'P1', 'TWICE'], keys: ['NOT', 'P1', 'TWICE'],      target: 'self', maxBox: 4, hintAfter: 3, showAfter: 6 },
    self2:  { front: ['NOT', 'P2', 'TWICE'], keys: ['NOT', 'P1', 'P2', 'TWICE'], target: 'self', maxBox: 4, hintAfter: 2, showAfter: 4 }
  },
  // Machine II = Machine I plus one new rule: it prints Machine I's sentence (the paper's c + 17 Gen r, p. 190).
  machine2Rule: { front: ['NOT', 'P1', 'TWICE'], box: ['NOT', 'P1', 'TWICE'] }
};

// ---------- strings and sentences ----------
// A string is { front: [keys], box: [keys] | null }. A sentence is a string whose front parses.

function gStr(front, box) { return { front: front.slice(), box: box == null ? null : box.slice() }; }

function gSame(a, b) {
  if (!a || !b) return false;
  if (a.front.join(' ') !== b.front.join(' ')) return false;
  if ((a.box == null) !== (b.box == null)) return false;
  return a.box == null || a.box.join(' ') === b.box.join(' ');
}

function gPieces(s) { return s.front.length + (s.box ? s.box.length : 0); }

function gText(s) {
  var K = GODEL_CONFIG.keys, f = s.front.map(function (k) { return K[k].label; }).join(' ');
  if (s.box == null) return f;
  return (f ? f + ' ' : '') + '[' + s.box.map(function (k) { return K[k].label; }).join(' ') + ']';
}

// Front grammar: [NOT] (PRINTS | PRINTS II) [TWICE]. Returns null if the front is not a sentence's front.
function gParse(front) {
  var i = 0, neg = false, twice = false, machine = 0;
  if (front[i] === 'NOT') { neg = true; i++; }
  if (front[i] === 'P1') machine = 1; else if (front[i] === 'P2') machine = 2; else return null;
  i++;
  if (front[i] === 'TWICE') { twice = true; i++; }
  if (i !== front.length) return null;
  return { neg: neg, machine: machine, twice: twice };
}

// What the sentence talks about. PRINTS [X] talks about X; PRINTS TWICE [X] talks about X [X].
function gSubject(s) {
  var p = gParse(s.front);
  if (!p || s.box == null) return null;
  return p.twice ? gStr(s.box, s.box) : gStr(s.box, null);
}

function gSelf(s) { var t = gSubject(s); return !!t && gSame(t, s); }

// The status of a sentence, as far as the toy can say it.
//   goedel     — talks about itself and says it is never printed: true and never printed by an honest machine.
//   praise     — talks about itself and says it is printed: honesty alone does not settle it (see memo, Löb 1955).
//   ruleTrue   — "Machine II prints" Machine I's sentence: true, by Machine II's new rule.
//   ruleFalse  — "Machine II never prints" Machine I's sentence: false, by the same rule.
//   other      — talks about some other string.
function gStatus(s) {
  var p = gParse(s.front), t = gSubject(s);
  if (!p || !t) return 'none';
  if (gSame(t, s)) return p.neg ? 'goedel' : 'praise';
  if (p.machine === 2 && gSame(t, GODEL_CONFIG.machine2Rule)) return p.neg ? 'ruleFalse' : 'ruleTrue';
  return 'other';
}

// Compare the sentence with what it talks about, piece by piece, for the screen's "mirror".
// Returns { sentence: [..], subject: [..] } where each piece is { k, inBox, same }.
function gMirror(s) {
  var t = gSubject(s);
  function flat(x) {
    var out = x.front.map(function (k) { return { k: k, inBox: false }; });
    if (x.box) x.box.forEach(function (k) { out.push({ k: k, inBox: true }); });
    return out;
  }
  var a = flat(s), b = t ? flat(t) : [];
  a.forEach(function (x, i) { x.same = !!b[i] && b[i].k === x.k && b[i].inBox === x.inBox; });
  b.forEach(function (x, i) { x.same = !!a[i] && a[i].k === x.k && a[i].inBox === x.inBox; });
  return { sentence: a, subject: b, equal: gSelf(s) };
}

// Did the player's box hit the puzzle's target?
function gHit(puzzleId, box) {
  var P = GODEL_CONFIG.puzzles[puzzleId], s = gStr(P.front, box);
  if (P.target === 'self') return gSelf(s);
  return gSame(gSubject(s), P.target);
}

// The answer, for "show me".
function gAnswer(puzzleId) {
  var P = GODEL_CONFIG.puzzles[puzzleId];
  if (P.target === 'self') return gParse(P.front).twice ? P.front.slice() : null; // no TWICE: there is none
  return P.target.front.slice();
}

// ---------- the doors: what an honest machine can do with the sentence ----------
// Suppose the machine prints G. G says it never prints G. Then it printed a false sentence: not honest.
// So an honest machine never prints G; and then what G says is so: G is true.
function gDoor(s, printed) {
  var st = gStatus(s);
  if (st !== 'goedel') return null;
  var saysPrinted = !gParse(s.front).neg; // G says "never printed"
  var gTrue = (saysPrinted === printed);
  return { printed: printed, sentenceTrue: gTrue, honest: !(printed && !gTrue) };
}

// ---------- the certificate (Proposition XI) ----------
// "Machine I never prints a false sentence." If the machine could print that, it could follow the four steps of
// the doors (all of them are steps a machine can follow) and print G. It never prints G. So it cannot print it.
function gCertificatePrintable() { return false; }

// ---------- Gödel numbering ----------
function gPrimes(n) { var p = [], k = 2; while (p.length < n) { if (p.every(function (q) { return k % q; })) p.push(k); k++; } return p; }

function gSigns(s) {
  var out = s.front.map(function (k) { return { label: GODEL_CONFIG.keys[k].label, code: GODEL_CONFIG.keys[k].code }; });
  if (s.box != null) {
    out.push({ label: '[', code: GODEL_CONFIG.boxOpen });
    s.box.forEach(function (k) { out.push({ label: GODEL_CONFIG.keys[k].label, code: GODEL_CONFIG.keys[k].code }); });
    out.push({ label: ']', code: GODEL_CONFIG.boxClose });
  }
  return out;
}

// The paper's coding of a string of signs: 2^(first sign) x 3^(second) x 5^(third) ... (p. 179).
function gNumber(s) {
  var signs = gSigns(s), ps = gPrimes(signs.length), n = BigInt(1);
  var factors = signs.map(function (g, i) { n = n * (BigInt(ps[i]) ** BigInt(g.code)); return { p: ps[i], e: g.code, label: g.label }; });
  var str = n.toString();
  return { factors: factors, digits: str.length, lead: str.slice(0, 12), tail: str.slice(-6) };
}

if (typeof module !== 'undefined') module.exports = {
  GODEL_CONFIG: GODEL_CONFIG, gStr: gStr, gSame: gSame, gPieces: gPieces, gText: gText, gParse: gParse,
  gSubject: gSubject, gSelf: gSelf, gStatus: gStatus, gMirror: gMirror, gHit: gHit, gAnswer: gAnswer,
  gDoor: gDoor, gCertificatePrintable: gCertificatePrintable, gNumber: gNumber, gSigns: gSigns
};
