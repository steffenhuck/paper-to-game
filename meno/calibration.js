// Calibration check for Double the Square with Plato (build.md §2–3). Run: node calibration.js
// Checks the mechanism against the paper's numbers (Plato, Meno, tr. Jowett; PDF pages), then the toy's rules,
// then plays the obvious strategies in numbers. Exit code 1 on any failure.
const M = require('./mechanism.js');
const C = M.CONFIG;
let fails = 0, passes = 0;
function check(name, ok, detail) {
  if (ok) { passes++; console.log('PASS  ' + name + (detail ? '  [' + detail + ']' : '')); }
  else { fails++; console.log('FAIL  ' + name + (detail ? '  [' + detail + ']' : '')); }
}
const L = (d, n, a) => M.makeLine(d, n, a);
const cnt = l => M.countTiles(l);

console.log('== 1. The paper\'s figure ==');
check('the first square holds four (p. 14, "Four, Socrates")', cnt(M.originalSquare()).total === C.AREA0, cnt(M.originalSquare()).total);
check('the double line gives sixteen (p. 15–16, "four times four are sixteen")', cnt(L('flat', 4)).total === 16, cnt(L('flat', 4)).total);
check('sixteen is four times, not twice (p. 15, "Four times as much")', cnt(L('flat', 4)).total === 4 * C.AREA0);
check('the line of three gives nine (p. 17, "Nine")', cnt(L('flat', 3)).total === 9);
check('the corner-to-corner line gives eight (p. 19, "Of eight feet… From this")', cnt(L('slant', 2)).total === C.TARGET, cnt(L('slant', 2)).total);
check('the boy\'s guesses are the paper\'s: double, then three', C.BOY_GUESSES[0].len === 2 * C.SIDE0 && C.BOY_GUESSES[1].len === 3 && C.BOY_GUESSES.every(g => g.dir === 'flat'));
// the paper counts the tilted square as four halves of four-foot squares: check that decomposition on our floor
(function () {
  const sq = M.squareOn(L('slant', 2));
  // the 4x4 box of the paper's figure is x in [1,5], y in [0,4]; its four 2x2 quarters
  const quarters = [[1, 0], [3, 0], [1, 2], [3, 2]];
  const inside = (p) => { // point-in-square for the tilted square (convex, anticlockwise)
    for (let k = 0; k < 4; k++) { const a = sq[k], b = sq[(k + 1) % 4]; if ((b[0] - a[0]) * (p[1] - a[1]) - (b[1] - a[1]) * (p[0] - a[0]) < 0) return false; } return true;
  };
  const N = 200; let ok = true; const shares = [];
  for (const [qx, qy] of quarters) {
    let k = 0; for (let u = 0; u < N; u++) for (let v = 0; v < N; v++) if (inside([qx + 2 * (u + .5) / N, qy + 2 * (v + .5) / N])) k++;
    const share = k / (N * N); shares.push(share.toFixed(3)); if (Math.abs(share - 0.5) > 0.01) ok = false;
  }
  check('the tilted square covers half of each of the four squares of four (p. 18–19, "each interior line cut off half")', ok, shares.join(' '));
  check('the original square is one of the four quarters of the paper\'s figure', C.ANCHOR.x === 3 && C.ANCHOR.y === 0);
})();
check('eight is four whole tiles and eight halves', cnt(L('slant', 2)).whole.length === 4 && cnt(L('slant', 2)).half.length === 8);
check('no line along the floor gives eight (8 is not a square number): the boy\'s straight search cannot succeed',
  [1, 2, 3, 4, 5, 6].every(k => cnt(L('flat', k)).total !== 8));
check('of the lines the player can lay, exactly one gives eight, and it is the paper\'s',
  M.allowedLines().filter(l => cnt(l).total === 8).length === 1 && M.sameLine(M.allowedLines().find(l => cnt(l).total === 8), L(C.ANSWER.dir, C.ANSWER.len)));
check('every allowed line\'s count equals its area (tiles and halves add up)', M.allowedLines().every(l => cnt(l).total === M.areaOf(l)), M.allowedLines().map(l => M.lineName(l) + '=' + cnt(l).total).join('; '));
check('every allowed square fits on the floor', M.allowedLines().every(l => cnt(l).inField), M.allowedLines().length + ' lines');
check('the player has six lines: four along, two corner to corner', M.allowedLines().length === 6);
check('no line the player can lay on the first day is the next morning\'s answer (so no told line is right next morning by luck)', M.allowedLines().every(l => !M.sameLine(l, L('slant', C.NEXT_SIDE))));
check('next morning: the square of three holds nine, and its corner-to-corner square eighteen, twice nine',
  cnt(L('flat', 3)).total === 9 && cnt(L('slant', 3)).total === 18 && cnt(L('slant', 3)).inField);
check('next morning: yesterday\'s line gives eight, not eighteen', cnt(L('slant', 2)).total === 8);
check('next morning: double the side gives thirty-six', cnt(L('flat', 6)).total === 36);
check('the record: 15 of the boy\'s 52 replies are his own words', C.TRANSCRIPT_OWN === 15 && C.TRANSCRIPT_REPLIES === 52);

console.log('\n== 2. The boy\'s rules ==');
const s0 = M.newLesson(L('flat', 4));
let r = M.act(s0, { type: 'which' });
check('asked which line, he lays double and counts sixteen; no longer sure', r.event.kind === 'own' && r.event.count === 16 && r.state.phase === 'guessing', r.event.result);
let r2 = M.act(r.state, { type: 'which' });
check('asked again, he lays three and counts nine; stuck', r2.event.count === 9 && r2.state.phase === 'stuck', r2.event.words);
let r3 = M.act(r2.state, { type: 'which' });
check('stuck and asked which line: "I do not know", a question used, still stuck', r3.event.kind === 'idk' && r3.state.phase === 'stuck' && r3.state.purse === C.QUESTIONS - 3);
let rh = M.act(s0, { type: 'how', line: L('slant', 2) });
check('while sure, shown the right line, he ignores it and counts his own (p. 17: no enquiry while he fancies he knows)', rh.event.kind === 'ignored' && rh.event.count === 16 && rh.state.phase === 'guessing');
let rs = M.act(r2.state, { type: 'how', line: L('slant', 1) });
check('stuck, asked about a line: he counts the square on it', rs.event.kind === 'count' && rs.event.count === 2 && rs.state.phase === 'stuck');
let rf = M.act(r2.state, { type: 'how', line: L('slant', 2) });
check('stuck, asked about the corner-to-corner line: eight; found, by his count', rf.state.phase === 'found' && rf.state.answerBy === 'him');
let rt = M.act(s0, { type: 'tell', line: L('slant', 2) });
check('told: he agrees, whatever his state', rt.state.phase === 'told' && rt.event.words.startsWith('Yes'));
// purse
(function () {
  let s = M.newLesson(null); let n = 0;
  while (!M.isOver(s)) { s = M.act(s, { type: 'which' }).state; n++; }
  check('asking only "which line?" empties the purse: Meno goes, the boy stuck', s.phase === 'out' && n === C.QUESTIONS);
})();

console.log('\n== 3. The next morning ==');
const fates = {};
fates.found = M.nextMorning(rf.state);
check('found -> lays the new square\'s corner-to-corner line and counts eighteen', fates.found.fate === 'found' && fates.found.count === 18 && fates.found.right);
let toldStuck = M.act(r2.state, { type: 'tell', line: L('slant', 2) }).state;
fates.opinion = M.nextMorning(toldStuck);
check('told the right line while stuck -> repeats yesterday\'s line, eight, wrong (the statue runs off)', fates.opinion.fate === 'opinion' && fates.opinion.count === 8 && !fates.opinion.right);
fates.sure = M.nextMorning(rt.state);
check('told while sure -> back to double the side, thirty-six', fates.sure.fate === 'sure' && fates.sure.count === 36 && !fates.sure.right);
let toldGuess = M.act(r.state, { type: 'tell', line: L('slant', 2) }).state;
check('told while guessing -> also back to double (he had not yet said "I do not know")', M.nextMorning(toldGuess).fate === 'sure');
let toldWrong = M.act(r2.state, { type: 'tell', line: L('slant', 1) }).state;
check('told a wrong line while stuck -> wrong', M.nextMorning(toldWrong).fate === 'wrong' && !M.nextMorning(toldWrong).right);
let outS = M.newLesson(null); while (!M.isOver(outS)) outS = M.act(outS, { type: 'which' }).state;
check('out -> "I do not know", no line laid', M.nextMorning(outS).fate === 'stuck' && M.nextMorning(outS).line === null);
check('only the boy who counted it himself succeeds next morning', ['found', 'opinion', 'sure', 'wrong', 'stuck'].every(f => {
  const st = { found: rf.state, opinion: toldStuck, sure: rt.state, wrong: toldWrong, stuck: outS }[f];
  return M.nextMorning(st).right === (f === 'found');
}));
check('the ladder: sure < stuck < told-right < found', M.rungOf('sure') === 0 && M.rungOf('wrong') === 0 && M.rungOf('stuck') === 1 && M.rungOf('opinion') === 2 && M.rungOf('found') === 3);

console.log('\n== 4. Every sequence of moves (exhaustive) ==');
(function () {
  const lines = M.allowedLines();
  const moves = [{ type: 'which' }].concat(lines.map(l => ({ type: 'how', line: l }))).concat(lines.map(l => ({ type: 'tell', line: l })));
  let n = 0, bad = 0; const tally = { found: 0, opinion: 0, sure: 0, wrong: 0, stuck: 0 };
  function rec(s) {
    if (M.isOver(s)) {
      n++; const m = M.nextMorning(s); tally[m.fate]++;
      const countedEightHimself = s.history.some(e => (e.kind === 'count' || e.kind === 'own') && e.count === 8);
      if ((m.fate === 'found') !== countedEightHimself) bad++;
      if (m.right !== (m.fate === 'found')) bad++;
      if (s.purse < 0) bad++;
      return;
    }
    for (const mv of moves) rec(M.act(s, mv).state);
  }
  rec(M.newLesson(null));
  check('in every one of ' + n + ' complete lessons: found next morning iff he counted eight himself; the purse never goes below zero', bad === 0, JSON.stringify(tally));
})();

console.log('\n== 5. Playing it in numbers (build.md §3) ==');
function run(name, plan) {
  let s = M.newLesson(plan.guess ? L(plan.guess[0], plan.guess[1]) : null);
  const seq = plan.moves.slice();
  while (!M.isOver(s)) {
    const mv = seq.length ? seq.shift() : { type: 'which' };
    s = M.act(s, mv).state;
  }
  const m = M.nextMorning(s);
  console.log('  ' + name.padEnd(46) + ' questions used ' + (C.QUESTIONS - s.purse) + '  fate: ' + m.fate.padEnd(8) + ' next morning ' + (m.count === null ? '—' : m.count) + (m.right ? ' (right)' : ''));
  return m.fate;
}
const H = (d, n) => ({ type: 'how', line: L(d, n) }), T = (d, n) => ({ type: 'tell', line: L(d, n) }), W = { type: 'which' };
const table = {
  'Socratic: ask, ask, then the corner line': run('Socratic: ask, ask, then the corner line', { guess: ['flat', 4], moves: [W, W, H('slant', 2)] }),
  'Knower who tells at once': run('Knower who tells at once', { guess: ['slant', 2], moves: [T('slant', 2)] }),
  'Corrector: one count, then tells': run('Corrector: one count, then tells', { guess: ['slant', 2], moves: [W, T('slant', 2)] }),
  'Late teller: two counts, then tells': run('Late teller: two counts, then tells', { guess: ['slant', 2], moves: [W, W, T('slant', 2)] }),
  'Shower: lays the corner line from the start': run('Shower: lays the corner line from the start', { guess: ['slant', 2], moves: [H('slant', 2), H('slant', 2), H('slant', 2)] }),
  'Straight-line searcher (1, 2 along, then which)': run('Straight-line searcher (1, 2 along, then which)', { guess: ['flat', 4], moves: [W, W, H('flat', 1), H('flat', 2), W, W] }),
  'Slant searcher, small first': run('Slant searcher, small first', { guess: ['flat', 4], moves: [W, W, H('slant', 1), H('slant', 2)] }),
  'Purist: only ever asks which line': run('Purist: only ever asks which line', { guess: ['flat', 4], moves: [W, W, W, W, W] }),
  'Checker: the first square, then slants': run('Checker: the first square, then slants', { guess: ['flat', 3], moves: [W, W, H('flat', 2), H('slant', 1), H('slant', 2)] }),
  'Panicker: tells the first slant he sees': run('Panicker: tells the first slant he sees', { guess: ['flat', 4], moves: [W, W, T('slant', 1)] }),
  'Waster: one more which, then straight lines': run('Waster: one more which, then straight lines', { guess: ['flat', 4], moves: [W, W, W, H('flat', 1), H('flat', 2)] }),
};
// a searcher who does not know: after the two forced counts, tries untried lines in a random order
(function () {
  const lines = M.allowedLines().filter(l => !(l.dir === 'flat' && (l.len === 4 || l.len === 3)));
  for (const Q of [4, 5, 6, 7, 8]) {
    // exact: probability that the answer is among the first (Q-2) of a random order of the untried lines
    const p = Math.min(1, (Q - 2) / lines.length);
    console.log('  random searcher, ' + Q + ' questions: finds it with probability ' + (100 * p).toFixed(0) + '% (' + lines.length + ' untried lines, ' + (Q - 2) + ' tries)');
  }
  check('with the chosen purse a random searcher usually finds it, and not always', (C.QUESTIONS - 2) / lines.length >= 0.6 && (C.QUESTIONS - 2) / lines.length < 1, (C.QUESTIONS - 2) + '/' + lines.length);
})();
const fatesSeen = new Set(Object.values(table));
check('the obvious ways of playing reach all five fates', ['found', 'opinion', 'sure', 'wrong', 'stuck'].every(f => fatesSeen.has(f)), [...fatesSeen].join(', '));
check('some sensible ways get it wrong for a reason the paper names (telling: p. 17, p. 31; straight lines only: p. 17)',
  table['Knower who tells at once'] === 'sure' && table['Late teller: two counts, then tells'] === 'opinion' && table['Straight-line searcher (1, 2 along, then which)'] === 'stuck');

console.log('\n== 6. Robustness: the discovery against the designer\'s choices ==');
(function () {
  // the purse and the next-morning square are ours; the claims (telling does not transfer, counting does; no looking while sure)
  // must not depend on them. Re-run the key paths with other values.
  const orig = { Q: C.QUESTIONS, N: C.NEXT_SIDE };
  let ok = true; const notes = [];
  for (const Q of [4, 6, 8, 10]) for (const N of [3]) {
    C.QUESTIONS = Q; C.NEXT_SIDE = N;
    const soc = (() => { let s = M.newLesson(null); for (const mv of [W, W, H('slant', 2)]) if (!M.isOver(s)) s = M.act(s, mv).state; return M.isOver(s) ? M.nextMorning(s) : null; })();
    const tel = (() => { let s = M.newLesson(null); s = M.act(s, W).state; s = M.act(s, W).state; if (!M.isOver(s)) s = M.act(s, T('slant', 2)).state; return M.isOver(s) ? M.nextMorning(s) : null; })();
    if (Q >= 3) { if (!(soc && soc.right && tel && !tel.right)) ok = false; }
    notes.push('Q=' + Q + ': asked ' + (soc ? soc.count : '-') + ', told ' + (tel ? tel.count : '-'));
  }
  C.QUESTIONS = orig.Q; C.NEXT_SIDE = orig.N;
  check('purse of 4, 6, 8 or 10: the asked boy finds it again, the told boy does not', ok, notes.join('; '));
  check('next-morning square of three is the only one that fits the floor with its double (four would need a larger floor)',
    M.countTiles(L('slant', 3)).inField && !M.countTiles(L('slant', 4)).inField);
  console.log('  note: the fates follow from the toy\'s rules (memo §16), not from the purse or the square chosen; the rules are ours, built on pp. 17, 19, 30–31.');
})();

console.log('\n' + passes + ' passed, ' + fails + ' failed');
process.exit(fails ? 1 : 0);
