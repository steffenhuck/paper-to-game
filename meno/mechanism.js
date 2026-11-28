// Double the Square with Plato — the mechanism. The single source of truth: the HTML inlines this file verbatim
// (build.py checks it byte for byte), and calibration.js runs against this file in Node.
// Paper: Plato, Meno (c. 385 BCE), tr. Benjamin Jowett; page numbers are those of the Internet Classics Archive
// printout (classics.mit.edu/Plato/meno.html, 33 pp.). Mechanism kind: TOY (an argument formalised; see memo §16).
'use strict';

const CONFIG = {
  // --- the paper's figure -------------------------------------------------------------------------
  SIDE0: 2,            // p. 14: "if one side of the figure be of two feet, and the other side be of two feet"
  AREA0: 4,            // p. 14: "how many are twice two feet?" "Four, Socrates."
  TARGET: 8,           // p. 14: "another square twice as large as this… Of eight feet."
  BOY_GUESSES: [       // the boy's own answers, in order
    { dir: 'flat', len: 4 },   // p. 14: "Clearly, Socrates, it will be double."  (sixteen, p. 15–16)
    { dir: 'flat', len: 3 },   // p. 16: "Three feet."                             (nine, p. 17)
  ],
  ANSWER: { dir: 'slant', len: 2 }, // p. 19: "from the line which extends from corner to corner of the figure of four feet"
  // --- the floor (our choice: the paper's figure, a 4x4 square of four 2x2 squares, with room for the next morning) ---
  FIELD_W: 7,          // our choice: tiles across; fits the boy's square of sixteen and the next morning's eighteen
  FIELD_H: 6,          // our choice: tiles up
  ANCHOR: { x: 3, y: 0 }, // our choice: the original square's corner; the original square is the lower-right quarter of the paper's 4x4 figure
  MAX_FLAT: 4,         // our choice: lines along the floor, 1..4 tiles
  MAX_SLANT: 2,        // our choice: lines corner to corner of the tiles, 1..2 tiles. Not 3: three corner to corner is the
                       // next morning's answer, and a boy told it on the first day would be right next morning by luck
  // --- the lesson -----------------------------------------------------------------------------------
  QUESTIONS: 5,        // our choice for Meno's hurry ("compelled to go away before the mysteries", p. 8): two for his own answers,
                       // three for the search among four untried lines; see memo §18
  // --- the next morning ----------------------------------------------------------------------------
  NEXT_SIDE: 3,        // our choice of "the same questions, in different forms" (p. 19): a square of three, nine feet
  // --- the record (the dialogue's own boy) -------------------------------------------------------------
  TRANSCRIPT_REPLIES: 52, // our count of the boy's replies, pp. 13–19
  TRANSCRIPT_OWN: 15,     // our coding: replies that are his own number, guess or "I do not know" (the other 37 are assent)
};

// ---------------------------------------------------------------- geometry ----------------------------------
function makeLine(dir, len, anchor) {
  const a = anchor || CONFIG.ANCHOR;
  const ex = a.x + len, ey = dir === 'slant' ? a.y + len : a.y;
  return { dir, len, ax: a.x, ay: a.y, ex, ey };
}
function sameLine(p, q) { return !!p && !!q && p.dir === q.dir && p.len === q.len && p.ax === q.ax && p.ay === q.ay; }
function lineName(l) {
  const n = ['', 'one', 'two', 'three', 'four', 'five', 'six'][l.len] || String(l.len);
  return l.dir === 'flat' ? n + ' tile' + (l.len > 1 ? 's' : '') + ' along' : n + ' tile' + (l.len > 1 ? 's' : '') + ' corner to corner';
}
// The square built on a line, turning left (anticlockwise): A, A+v, A+v+rot(v), A+rot(v), rot(x,y) = (-y,x).
function squareOn(l) {
  const vx = l.ex - l.ax, vy = l.ey - l.ay;
  return [[l.ax, l.ay], [l.ax + vx, l.ay + vy], [l.ax + vx - vy, l.ay + vy + vx], [l.ax - vy, l.ay + vx]];
}
function areaOf(l) { return l.dir === 'flat' ? l.len * l.len : 2 * l.len * l.len; }
// signed position of point p against the square: 1 inside, 0 on the edge, -1 outside (square is convex, anticlockwise)
function side(poly, p) {
  let onEdge = false;
  for (let k = 0; k < 4; k++) {
    const a = poly[k], b = poly[(k + 1) % 4];
    const c = (b[0] - a[0]) * (p[1] - a[1]) - (b[1] - a[1]) * (p[0] - a[0]);
    if (c < -1e-9) return -1;
    if (Math.abs(c) <= 1e-9) onEdge = true;
  }
  return onEdge ? 0 : 1;
}
// The boy's count: every one-foot tile under the square, whole or cut in half by a corner-to-corner edge.
// Edges run along grid lines or through grid corners at 45 degrees, so a tile is whole (centre inside),
// halved (centre on an edge), or out. Returned in the order he lays them: whole tiles from the bottom row up,
// then the halves, paired.
function countTiles(l) {
  const poly = squareOn(l);
  const xs = poly.map(p => p[0]), ys = poly.map(p => p[1]);
  const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
  const whole = [], half = [];
  for (let j = y0; j < y1; j++) for (let i = x0; i < x1; i++) {
    const s = side(poly, [i + 0.5, j + 0.5]);
    if (s === 1) whole.push({ i, j });
    else if (s === 0) {
      const corners = [[i, j], [i + 1, j], [i + 1, j + 1], [i, j + 1]];
      const tri = corners.filter(c => side(poly, c) >= 0);
      half.push({ i, j, tri });
    }
  }
  // pair halves that make a whole: order them around the square so neighbours pair up
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
  half.sort((a, b) => Math.atan2(a.j + 0.5 - cy, a.i + 0.5 - cx) - Math.atan2(b.j + 0.5 - cy, b.i + 0.5 - cx));
  const total = whole.length + half.length / 2;
  return { whole, half, total, inField: x0 >= 0 && y0 >= 0 && x1 <= CONFIG.FIELD_W && y1 <= CONFIG.FIELD_H };
}
// Lines the player can lay on the first day: from the corner of the original square, along the floor or corner to corner.
function allowedLines() {
  const out = [];
  for (let k = 1; k <= CONFIG.MAX_FLAT; k++) out.push(makeLine('flat', k));
  for (let k = 1; k <= CONFIG.MAX_SLANT; k++) out.push(makeLine('slant', k));
  return out.filter(l => countTiles(l).inField);
}
function originalSquare() { return makeLine('flat', CONFIG.SIDE0); }

// ---------------------------------------------------------------- the boy -----------------------------------
// Phases: 'sure' (he believes his first answer), 'guessing' (his first was refuted; he believes his second),
// 'stuck' ("I do not know"), and the lesson's ends: 'found' (he counted eight on a line himself), 'told' (you told him
// a line and he agreed), 'out' (Meno had to go).
// Rules (stated on screen):
//   1. He counts truly: whole tiles, and two halves make one.
//   2. While he thinks he knows (sure, guessing), any question gets his own line, laid and counted by him.
//   3. Once stuck, he counts the square on whatever line you ask him about; if it holds eight, that line is his answer.
//   4. He agrees with whatever you tell him.
function newLesson(yourGuess) {
  return {
    phase: 'sure', guessIdx: 0, purse: CONFIG.QUESTIONS, yourGuess: yourGuess || null,
    history: [], answer: null, answerBy: null, toldWhen: null, shocks: 0, tried: [],
  };
}
function isOver(s) { return s.phase === 'found' || s.phase === 'told' || s.phase === 'out'; }
function nf(n) {
  return ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve',
    'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty'][n] || ({ 36: 'thirty-six' })[n] || String(n);
}
function times(n) { // how the count compares with the first square of four
  if (n === CONFIG.TARGET) return 'twice the first square';
  if (n === 4 * CONFIG.AREA0) return 'four times the first square, not twice';
  if (n === CONFIG.AREA0) return 'the same as the first square';
  return n > CONFIG.TARGET ? 'more than eight' : 'less than eight';
}
// action: { type: 'which' } | { type: 'how', line } | { type: 'tell', line }
function act(s0, action) {
  if (isOver(s0)) throw new Error('lesson is over');
  if (s0.purse <= 0) throw new Error('no questions left');
  const s = JSON.parse(JSON.stringify(s0));
  const ev = { type: action.type, before: s.phase, line: action.line || null, by: 'him', count: null, laid: null };
  s.purse -= 1;
  const believing = s.phase === 'sure' || s.phase === 'guessing';
  if (action.type === 'tell') {
    ev.kind = 'told'; ev.by = 'you';
    s.answer = action.line; s.answerBy = 'you'; s.toldWhen = s.phase; s.phase = 'told';
    ev.result = 'You told him: ' + lineName(action.line) + '. He agreed. He has not counted it.';
    ev.words = believing ? 'Yes, Socrates.' : 'Yes, Socrates. That line.';
  } else if (believing) {
    // rule 2: his own line, whatever you asked
    const g = CONFIG.BOY_GUESSES[s.guessIdx];
    const l = makeLine(g.dir, g.len);
    const c = countTiles(l);
    const sameAsYours = action.type === 'how' && sameLine(action.line, l);
    ev.kind = action.type === 'how' && !sameAsYours ? 'ignored' : 'own';
    ev.laid = l; ev.laidBy = 'him'; ev.count = c.total; ev.tiles = c;
    s.tried.push({ line: l, count: c.total, by: 'him' });
    const first = s.guessIdx === 0;
    ev.say1 = ev.kind === 'ignored'
      ? 'But the double square comes from ' + (first ? 'the double line' : 'my line') + ', Socrates. Look.'
      : first ? 'Twice the square? Then twice the line, Socrates: four.' : 'Then three, Socrates. Between two and four.';
    if (c.total === CONFIG.TARGET) { // never happens with the paper's guesses; kept so the rule is total
      s.phase = 'found'; s.answer = l; s.answerBy = 'him';
    } else {
      s.shocks += 1; s.guessIdx += 1;
      s.phase = s.guessIdx < CONFIG.BOY_GUESSES.length ? 'guessing' : 'stuck';
    }
    ev.result = (ev.kind === 'ignored' ? 'He would not look at your line: he still thinks he knows. ' : '')
      + 'He laid his own line, ' + lineName(l) + ', and counted the square on it: ' + nf(c.total) + ', ' + times(c.total) + '. '
      + (s.phase === 'guessing' ? 'He is no longer sure.' : 'He has run out of answers.');
    ev.words = s.phase === 'guessing' ? nf(c.total)[0].toUpperCase() + nf(c.total).slice(1) + '… that is four times, Socrates. Not twice.'
      : nf(c.total)[0].toUpperCase() + nf(c.total).slice(1) + '. Still more than eight. I do not know, Socrates.';
  } else if (action.type === 'which') {
    ev.kind = 'idk';
    ev.result = 'You asked him which line. He has no line left that he believes in. That used a question.';
    ev.words = 'I do not know, Socrates.';
  } else { // 'how', and he is stuck: rule 3
    const l = action.line, c = countTiles(l);
    ev.kind = 'count'; ev.laid = l; ev.laidBy = 'you'; ev.count = c.total; ev.tiles = c;
    s.tried.push({ line: l, count: c.total, by: 'you' });
    if (c.total === CONFIG.TARGET) {
      s.phase = 'found'; s.answer = l; s.answerBy = 'him';
      ev.result = 'He counted the square on your line: ' + nf(c.whole.length) + ' whole tiles and ' + nf(c.half.length)
        + ' halves, which make ' + nf(c.total) + '. Twice the first square. He takes the line as his answer.';
      ev.words = 'Eight! Twice four. It is this line, Socrates, from corner to corner.';
    } else {
      ev.result = 'He counted the square on your line: ' + nf(c.total) + ', ' + times(c.total) + '.';
      ev.words = 'That one holds ' + nf(c.total) + ', Socrates. Not eight.';
    }
  }
  if (!isOver(s) && s.purse <= 0) { s.phase = 'out'; ev.out = true; }
  ev.after = s.phase; ev.purse = s.purse;
  s.history.push(ev);
  return { state: s, event: ev };
}

// ---------------------------------------------------------------- the next morning ---------------------------
// Meno lays a square of three and asks for its double. What the boy does depends on how he came by his answer.
//   found (he counted eight himself)      -> he lays the corner-to-corner line of the new square and counts it.
//   told while stuck                      -> he lays the line he was told, where it was yesterday, and counts it.
//   told while he still thought he knew   -> he goes back to his own: double the side.
//   out (Meno left while he was stuck)    -> "I do not know."
function fateOf(s) {
  if (s.phase === 'found') return 'found';
  if (s.phase === 'out') return 'stuck';
  if (s.phase === 'told') {
    if (s.toldWhen === 'sure' || s.toldWhen === 'guessing') return 'sure';
    return sameLine(s.answer, makeLine(CONFIG.ANSWER.dir, CONFIG.ANSWER.len)) ? 'opinion' : 'wrong';
  }
  return null;
}
function nextMorning(s) {
  const fate = fateOf(s);
  const sq = makeLine('flat', CONFIG.NEXT_SIDE);
  const base = countTiles(sq).total;
  const out = { fate, square: sq, base, target: 2 * base, line: null, count: null, tiles: null, right: false };
  if (fate === 'found') {
    out.line = makeLine('slant', CONFIG.NEXT_SIDE);
    out.say1 = 'Corner to corner, Meno.';
  } else if (fate === 'opinion' || fate === 'wrong') {
    out.line = s.answer;
    out.say1 = 'The line Socrates told me. This one.';
  } else if (fate === 'sure') {
    out.line = makeLine('flat', 2 * CONFIG.NEXT_SIDE);
    out.say1 = 'Twice the line, Meno: six.';
  }
  if (out.line) {
    out.tiles = countTiles(out.line); out.count = out.tiles.total; out.right = out.count === out.target;
  }
  out.result = {
    found: 'He laid the corner-to-corner line of the new square himself and counted it: ' + nf(out.count || 0) + ', twice nine. He found it again.',
    opinion: 'He laid the line you told him, where it was yesterday. Its square holds ' + nf(out.count || 0) + ': twice yesterday\'s square, not twice this one. What he was told did not fit a new square.',
    wrong: 'He laid the line you told him, where it was yesterday. Its square holds ' + nf(out.count || 0) + '. It was not the answer yesterday either.',
    sure: 'He went back to what he thought before you told him: double the side. His square holds ' + nf(out.count || 0) + ', four times nine.',
    stuck: 'He did not guess. He knows he does not know, and says so.',
  }[fate];
  out.words = {
    found: 'Eighteen. Twice nine.',
    opinion: 'Eight… that was yesterday\'s. I do not know, Meno.',
    wrong: nf(out.count || 0)[0].toUpperCase() + nf(out.count || 0).slice(1) + '. I do not know, Meno.',
    sure: 'Thirty-six? That is four times nine…',
    stuck: 'I do not know, Meno.',
  }[fate];
  return out;
}

// ---------------------------------------------------------------- the verdict -------------------------------
const RUNGS = [ // Plato's ladder, bottom to top; the order is the paper's (p. 17, p. 30–31), the ladder is ours
  { key: 'sure', name: 'Sure, and wrong', text: 'He thinks he knows, and does not. He would never look for what he thinks he already has.' },
  { key: 'stuck', name: 'Stuck', text: 'He knows he does not know. Socrates: he is better off, because now he will look.' },
  { key: 'opinion', name: 'Right, but told', text: 'A true opinion. As good a guide as knowledge while it stays, but it runs away like the statues of Daedalus.' },
  { key: 'found', name: 'Right, and found', text: 'He counted it himself, so he could count it again in a new square. Socrates calls this tying down recollection: asked often enough, in different forms, he will know.' },
];
function rungOf(fate) { return fate === 'wrong' ? 0 : RUNGS.findIndex(r => r.key === fate); }
function verdict(s, m) {
  const fate = m.fate;
  const headline = {
    found: 'I found it, and I found it again.',
    opinion: 'I had it yesterday.',
    wrong: 'Socrates told me this one.',
    sure: 'Twice the line, Meno!',
    stuck: 'I do not know, Meno.',
  }[fate];
  const plinth = {
    found: 'His statue stands, tied down.', opinion: 'His statue walked off in the night.', wrong: 'The statue you gave him was the wrong one.',
    sure: 'His old statue, double the line, is still standing.', stuck: 'His plinth is empty, and he knows it.',
  }[fate];
  // what you did
  const did = [];
  const g = s.yourGuess;
  if (g) {
    const gc = countTiles(g).total;
    if (sameLine(g, makeLine(CONFIG.ANSWER.dir, CONFIG.ANSWER.len))) did.push('You knew the answer before he said a word: ' + lineName(g) + '.');
    else if (sameLine(g, makeLine('flat', 4))) did.push('Your own first answer was his: four tiles along, a square of sixteen.');
    else did.push('Your own first answer was ' + lineName(g) + ', a square of ' + nf(gc) + '.');
  }
  const h = s.history;
  const told = h.find(e => e.kind === 'told');
  if (s.shocks === 0 && told) did.push('You told him before he had counted anything. He said yes, and kept what he believed.');
  else if (s.shocks === 1 && told) did.push('You let him count one mistake, then told him while he still had a guess he believed.');
  else if (s.shocks >= 2) did.push('You let him count both of his mistakes, sixteen and nine, until he said "I do not know".');
  const ign = h.filter(e => e.kind === 'ignored').length;
  if (ign) did.push(ign === 1 ? 'Once you showed him a line while he still thought he knew; he did not look at it.' : 'Twice you showed him a line while he still thought he knew; he did not look.');
  const yours = h.filter(e => e.kind === 'count');
  if (yours.length) did.push('You laid ' + (yours.length === 1 ? 'one line' : nf(yours.length) + ' lines') + ' for him to count: ' + yours.map(e => lineName(e.laid) + ' (' + nf(e.count) + ')').join(', ') + '.');
  if (told && s.shocks >= 2) did.push('Then you told him ' + lineName(told.line) + ', and he agreed without counting it.');
  if (fate === 'found') did.push('The line was yours; every count was his.');
  if (fate === 'stuck') did.push('Meno had to go before he found it.');
  const used = CONFIG.QUESTIONS - s.purse;
  did.push('You used ' + nf(used) + ' of Meno\'s ' + nf(CONFIG.QUESTIONS) + ' questions.');
  return {
    fate, headline, plinth, rung: rungOf(fate), rungs: RUNGS, did,
    dialogue: 'The boy said double: sixteen. Three: nine. Then "I do not know". '
      + 'Socrates drew three more squares round the first and the four lines from corner to corner, and the boy counted the halves: eight, "from this". '
      + 'Socrates drew every line; the boy did every count. Plato calls what the boy has at the end true notions "stirred up as in a dream", which would become knowledge if he were asked again, often, in different forms.',
    follows: 'Meno had asked whether goodness can be taught. If it were knowledge, says Socrates, it could be drawn out like this. '
      + 'But the best men of Athens could not make their own sons good, though they had them taught riding, music and wrestling. '
      + 'So their goodness was right opinion, not knowledge: a gift of the gods, as good a guide as knowledge while it lasts. '
      + 'And no one will know for sure, he ends, until someone finds out what goodness is.',
  };
}

const MECH = { CONFIG, makeLine, sameLine, lineName, squareOn, areaOf, countTiles, allowedLines, originalSquare,
  newLesson, act, isOver, fateOf, nextMorning, verdict, RUNGS, rungOf, nf };
if (typeof module !== 'undefined' && module.exports) module.exports = MECH;
