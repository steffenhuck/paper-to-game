// Calibration check for Cantor's Bargain. Run: node calibration.js  (writes calibration-result.txt)
// Tests the mechanism against the paper's own construction and claims (Cantor 1891, pp. 75-77):
//   (P1) b_v differs from a_{v,v} for every v, for any list;
//   (P2) E0 = (b_1, b_2, ...) agrees with no E_u, for any list;
//   (P3) the paper's own three elements E_I, E_II, E_III give E0 = (w, m, w, ...);
//   (P4) adding E0 to the list and re-running gives a new E0 not in the new list (the end screen);
// and then the game's own framing: the books, the Lister, the heuristics table (memo, section 17).
const M = require('./mechanism.js');
const C = M.CONFIG;
const out = []; let pass = 0, fail = 0;
function check(name, ok, detail) { (ok ? pass++ : fail++); out.push(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? '  [' + detail + ']' : ''}`); }

// ---- P1, P2: random square lists, many seeds and sizes
let p1 = true, p2 = true;
for (let seed = 1; seed <= 500; seed++) {
  const rng = M.makeRng(seed);
  const n = 2 + Math.floor(rng() * 40);
  const rows = []; for (let i = 0; i < n; i++) rows.push(Array.from({ length: n }, () => (rng() < 0.5 ? 'm' : 'w')));
  const e0 = M.diagonal(rows);
  for (let v = 0; v < n; v++) if (e0[v] === rows[v][v]) p1 = false;
  if (M.strike(rows, e0).some(s => s < 0)) p2 = false;
}
check('P1  b_v != a_{v,v} for all v, 500 random lists of 2..41 rows', p1);
check('P2  E0 agrees with no row, 500 random lists', p2);

// ---- P1, P2 against adversarial lists built to catch common strategies
{
  let ok = true;
  const n = 12;
  const adversaries = [
    Array.from({ length: n }, () => Array(n).fill('m')),                                   // all E_I
    Array.from({ length: n }, (_, u) => Array.from({ length: n }, (_, v) => (v < u ? 'w' : 'm'))), // staircase
    Array.from({ length: n }, (_, u) => Array.from({ length: n }, (_, v) => ((u + v) % 2 ? 'w' : 'm'))), // checkerboard
    Array.from({ length: n }, (_, u) => Array.from({ length: n }, (_, v) => (((u >> v) & 1) ? 'w' : 'm'))), // binary counting
  ];
  for (const rows of adversaries) {
    const e0 = M.diagonal(rows);
    if (e0.some((c, v) => c === rows[v][v])) ok = false;
    if (M.strike(rows, e0).some(s => s < 0)) ok = false;
  }
  check('P1+P2 against all-m, staircase, checkerboard and binary-counting lists', ok);
}

// ---- P3: the paper's own E_I, E_II, E_III
{
  const rows = C.R1_FIXED.map(r => r.slice(0, 3));
  const e0 = M.diagonal(rows);
  check("P3  E_I, E_II, E_III (m m m / w w w / m w m) give E0 = (w, m, w)", e0.join('') === 'wmw', e0.join(''));
  check('P3  the first book opens with the paper\'s three elements', JSON.stringify(M.round1Book(4242).slice(0, 3)) === JSON.stringify(C.R1_FIXED.map(r => r.slice(0, C.R1_WIDTH))));
}

// ---- P4: add E0 as row 1, rerun
{
  let ok = true;
  for (let seed = 1; seed <= 300; seed++) {
    const lister = M.makeLister3(seed);
    const st = M.playRound3(lister, M.PLAYERS.diagonal);
    const again = M.addToBookAndRerun(st.rows, st.yours);
    if (M.strike(again.rows, again.e0).some(s => s < 0)) ok = false;
    if (again.rows.length !== C.R3_ROWS || !M.sameRow(again.rows[0], st.yours)) ok = false;
    if (again.e0.some((c, v) => c === again.rows[v][v])) ok = false;
  }
  check('P4  your row added as row 1, the rule runs again: new E0 not in the new book (300 seeds)', ok);
}

// ---- Round 1 book shape
{
  let distinct = true, fixedFirst = true, diagWins = true, lettersMax = 0;
  for (let seed = 1000; seed < 1000 + 400; seed++) {
    const rows = M.round1Book(seed);
    if (rows.length !== C.R1_ROWS) distinct = false;
    for (let i = 0; i < rows.length; i++) for (let j = i + 1; j < rows.length; j++) if (M.sameRow(rows[i], rows[j])) distinct = false;
    for (let i = 0; i < 3; i++) if (!M.sameRow(rows[i], C.R1_FIXED[i].slice(0, C.R1_WIDTH))) fixedFirst = false;
    const st = M.playRound1(rows, M.PLAYERS.diagonal);
    if (!st.won) diagWins = false;
    lettersMax = Math.max(lettersMax, st.letters);
  }
  check('R1  five distinct rows, 400 book numbers', distinct);
  check('R1  rows 1-3 are the paper\'s E_I, E_II, E_III', fixedFirst);
  check('R1  the diagonal rule always strikes all five, in at most 5 letters', diagWins && lettersMax <= 5, `max letters ${lettersMax}`);
}

// ---- Round 2: the endless book never finishes, rows are consistent, numbers grow
{
  let allAgree = true, growing = true, consistent = true, neverDone = true, windowKept = true;
  for (let seed = 1000; seed < 1300; seed++) {
    const book = M.makeEndlessBook(seed);
    let st = M.round2Start(book);
    const rng = M.makeRng(seed);
    for (let k = 0; k < C.R2_LETTERS; k++) {
      const c = k % 2 ? M.PLAYERS.majority({ yours: st.yours, aliveRows: st.page.map(p => p.row) }) : M.PLAYERS.random({}, rng);
      const prevMax = book.maxIndex;
      st = M.round2Write(book, st, c);
      if (st.page.length !== C.R2_WINDOW) windowKept = false;
      if (M.aliveCount(st.page.map(p => p.row), st.yours) !== C.R2_WINDOW) allAgree = false;
      for (const n of st.arrived) if (n <= prevMax) growing = false;
      for (const p of st.page) if (!M.sameRow(book.row(p.n), p.row)) consistent = false;
      if (st.done !== (k === C.R2_LETTERS - 1)) neverDone = false;
    }
    if (M.aliveCount(st.page.map(p => p.row), st.yours) === 0) neverDone = false;
  }
  check('R2  after every letter the page is full of rows that agree with you (300 seeds)', allAgree && windowKept);
  check('R2  arriving rows carry strictly larger row numbers', growing);
  check('R2  a row number always shows the same letters', consistent);
  check('R2  the round ends after the set number of letters, never by striking everything', neverDone);
}

// ---- Round 3: the Lister copies; only the diagonal strikes in time
{
  let copies = true, diagClean = true;
  for (let seed = 1000; seed < 1300; seed++) {
    const lister = M.makeLister3(seed);
    const st = M.playRound3(lister, M.PLAYERS.diagonal);
    if (st.slipped.length) diagClean = false;
    if (st.struck.some(s => s < 0)) diagClean = false;
    for (let u = 0; u < st.rows.length; u++) for (let v = 0; v < u; v++) if (st.rows[u][v] !== st.yours[v]) copies = false;
  }
  check('R3  each row copies your first u-1 letters', copies);
  check('R3  the diagonal rule lets no row slip and leaves no row agreeing (300 seeds)', diagClean);
}

// ---- Heuristic players (memo, section 17)
{
  const N = 2000;
  const table = [];
  for (const name of ['random', 'allM', 'majority', 'diagonal']) {
    let r1won = 0, r1letters = 0, r3slipped = 0, r3alive = 0;
    for (let seed = 1; seed <= N; seed++) {
      const rng = M.makeRng(seed * 101);
      const st1 = M.playRound1(M.round1Book(seed), M.PLAYERS[name], rng);
      if (st1.won) r1won++; r1letters += st1.letters;
      const st3 = M.playRound3(M.makeLister3(seed), M.PLAYERS[name], rng);
      r3slipped += st3.slipped.length; r3alive += st3.struck.filter(s => s < 0).length;
    }
    table.push({ name, r1win: r1won / N, r1letters: r1letters / N, r3slipped: r3slipped / N, r3alive: r3alive / N });
  }
  out.push('');
  out.push('Heuristic players, 2000 book numbers each:');
  out.push('player     | R1 strikes all five | R1 letters used | R3 rows slipped (of 10) | R3 rows still agreeing at the end');
  for (const t of table) out.push(`${t.name.padEnd(10)} | ${(t.r1win * 100).toFixed(0).padStart(18)}% | ${t.r1letters.toFixed(2).padStart(15)} | ${t.r3slipped.toFixed(2).padStart(23)} | ${t.r3alive.toFixed(2).padStart(10)}`);
  out.push('');
  const T = Object.fromEntries(table.map(t => [t.name, t]));
  check('H   random play slips about half the rows in round 3 (4 to 6 of 10)', T.random.r3slipped > 4 && T.random.r3slipped < 6, T.random.r3slipped.toFixed(2));
  check('H   always-m slips about half the rows too', T.allM.r3slipped > 4 && T.allM.r3slipped < 6, T.allM.r3slipped.toFixed(2));
  check('H   the diagonal slips none', T.diagonal.r3slipped === 0);
  check('H   majority striking wins round 1 almost always and in fewer letters than the diagonal', T.majority.r1win > 0.95 && T.majority.r1letters < T.diagonal.r1letters, `${(T.majority.r1win * 100).toFixed(0)}%, ${T.majority.r1letters.toFixed(2)} vs ${T.diagonal.r1letters.toFixed(2)}`);
  check('H   random play sometimes loses round 1 (a row is you after six letters)', T.random.r1win < 1 && T.random.r1win > 0.5, `${(T.random.r1win * 100).toFixed(0)}%`);
  check('H   always-m loses round 1 every time (row 1 is all m)', T.allM.r1win === 0);
}

// ---- Verdict keys
{
  const r1w = { won: true }, r1l = { won: false };
  check('V   verdict keys', M.verdictKey(r1w, { slipped: [] }) === 'clean' && M.verdictKey(r1l, { slipped: [] }) === 'clean_after_r1_loss'
    && M.verdictKey(r1w, { slipped: [1] }) === 'few_slipped' && M.verdictKey(r1w, { slipped: [1, 2, 3] }) === 'many_slipped');
}

out.push('');
out.push(`${pass} passed, ${fail} failed`);
const text = out.join('\n');
console.log(text);
require('fs').writeFileSync(__dirname + '/calibration-result.txt', text + '\n');
process.exit(fail ? 1 : 0);
