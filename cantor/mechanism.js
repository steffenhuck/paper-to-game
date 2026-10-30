// Not in the Book — mechanism. The single source of truth: every rule that affects outcomes
// lives here, headless, runnable unchanged in Node (calibration.js, loop.js) and in the browser
// (inlined verbatim by build.py). The interface only passes taps in and draws what comes back.
//
// Paper: Georg Cantor, "Über eine elementare Frage der Mannigfaltigkeitslehre",
// Jahresbericht der Deutschen Mathematiker-Vereinigung 1 (1890-91): 75-78.
// Mechanism kind: PORTED. The construction of E0 (b_v != a_{v,v}) is the paper's, run as written.
// The books, the rounds and the Lister who reacts are this game's framing (memo, section 15).

const CONFIG = {
  CHARS: ['m', 'w'],          // the paper's two characters m and w ("zwei einander ausschliessende Charaktere")
  // Round 1: the small book
  R1_ROWS: 5,                 // our choice: five rows, the paper's three examples plus two
  R1_WIDTH: 6,                // our choice: letters shown per row; the contest runs on the shown letters
  R1_FIXED: [                 // the paper's E_I, E_II, E_III, as the first three rows of the first book
    ['m', 'm', 'm', 'm', 'm', 'm'],
    ['w', 'w', 'w', 'w', 'w', 'w'],
    ['m', 'w', 'm', 'w', 'm', 'w'],
  ],
  // Round 2: the endless book
  R2_WINDOW: 9,               // our choice: rows on the page at once
  R2_WIDTH: 6,                // our choice: letters shown per row
  R2_LETTERS: 5,              // our choice: letters the player writes before the Lister's card
  R2_GAP_MIN: 1,              // our choice: smallest gap between successive agreeing row numbers (density halves per letter)
  // Round 3: Cantor's bargain
  R3_ROWS: 10,                // our choice: rows = letters; the diagonal is square (b_u vs a_{u,u})
  // Seeds
  SEED_MAX: 9000,             // our choice: book numbers 1000..9999 so they read as four digits
};

// ---------- small deterministic rng (mulberry32) ----------
function makeRng(seed) {
  let a = (seed >>> 0) || 1;
  return function () {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function randChar(rng) { return CONFIG.CHARS[rng() < 0.5 ? 0 : 1]; }
function randRow(rng, width) { const r = []; for (let i = 0; i < width; i++) r.push(randChar(rng)); return r; }
function sameRow(a, b) { if (a.length !== b.length) return false; for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false; return true; }

// ---------- the paper ----------
// The other character: if a_{v,v} = m then b_v = w, and the other way round.
function flip(c) { return c === CONFIG.CHARS[0] ? CONFIG.CHARS[1] : CONFIG.CHARS[0]; }

// Cantor's E0 for a list of rows: b_v = flip(a_{v,v}), for v = 1..n where n = min(rows, width).
function diagonal(rows) {
  const n = Math.min(rows.length, rows.length ? rows[0].length : 0);
  const b = [];
  for (let v = 0; v < n; v++) b.push(flip(rows[v][v]));
  return b;
}

// The strike: for each row, the first position where it disagrees with the player's row so far
// (or -1 if it agrees with everything written). A row is "alive" while it agrees.
function strike(rows, yours) {
  return rows.map(row => {
    for (let v = 0; v < yours.length && v < row.length; v++) if (row[v] !== yours[v]) return v;
    return -1;
  });
}
function aliveCount(rows, yours) { return strike(rows, yours).filter(s => s < 0).length; }

// ---------- round 1: the small book ----------
function round1Book(seed) {
  const rng = makeRng(seed * 7 + 1);
  const rows = CONFIG.R1_FIXED.map(r => r.slice(0, CONFIG.R1_WIDTH));
  while (rows.length < CONFIG.R1_ROWS) {
    const r = randRow(rng, CONFIG.R1_WIDTH);
    if (!rows.some(x => sameRow(x, r))) rows.push(r);   // rows are distinct
  }
  return rows;
}
// Round 1 state after the player's letters: struck per row, alive count, and whether the round is over.
function round1Status(rows, yours) {
  const s = strike(rows, yours);
  const alive = s.filter(x => x < 0).length;
  const done = alive === 0 || yours.length >= CONFIG.R1_WIDTH;
  return { struck: s, alive, done, won: alive === 0, letters: yours.length,
           caughtBy: done && alive > 0 ? s.findIndex(x => x < 0) : -1 };
}

// ---------- round 2: the endless book ----------
// The Lister's book is generated on demand and remembered, so a row number always shows the same letters.
// The claim the Lister makes is that every row is in it somewhere; so for any prefix the player has
// written there are rows further down that agree. The book supplies them with growing row numbers
// (the gap doubles with each letter written, as the share of agreeing rows halves).
function makeEndlessBook(seed) {
  const rng = makeRng(seed * 13 + 5);
  const rows = new Map();      // rowNumber (1-based) -> letters
  let maxIndex = 0;
  const width = CONFIG.R2_WIDTH;
  function row(n) {
    if (!rows.has(n)) { rows.set(n, randRow(rng, width)); if (n > maxIndex) maxIndex = n; }
    return rows.get(n);
  }
  // Rows further down that agree with the prefix: new rows beyond everything shown so far.
  function fetchAgreeing(prefix, count) {
    const out = [];
    const gapMax = CONFIG.R2_GAP_MIN + Math.pow(2, prefix.length);   // density halves per letter
    for (let i = 0; i < count; i++) {
      const n = maxIndex + CONFIG.R2_GAP_MIN + Math.floor(rng() * gapMax);
      const r = prefix.slice();
      while (r.length < width) r.push(randChar(rng));
      rows.set(n, r); maxIndex = n;
      out.push({ n, row: r });
    }
    return out;
  }
  return { row, fetchAgreeing, rows, get maxIndex() { return maxIndex; } };
}
// Round 2 play: the page holds a window of rows; after each letter, struck rows leave and agreeing
// rows from further down arrive. Returns the full state so the interface can animate the change.
function round2Start(book) {
  const page = [];
  for (let n = 1; n <= CONFIG.R2_WINDOW; n++) page.push({ n, row: book.row(n) });
  return { page, yours: [], struckTotal: 0, done: false };
}
function round2Write(book, state, c) {
  const yours = state.yours.concat([c]);
  const s = strike(state.page.map(p => p.row), yours);
  const struck = state.page.filter((p, i) => s[i] >= 0).map((p, i) => ({ ...p }));
  const kept = state.page.filter((p, i) => s[i] < 0);
  const arrivals = book.fetchAgreeing(yours, state.page.length - kept.length);
  const page = kept.concat(arrivals);
  const struckTotal = state.struckTotal + struck.length;
  return { page, yours, struckTotal, done: yours.length >= CONFIG.R2_LETTERS,
           struckNow: struck.map(p => p.n), struckAt: s, arrived: arrivals.map(a => a.n) };
}

// ---------- round 3: Cantor's bargain ----------
// The Lister writes row u when the player reaches letter u: the first u-1 letters copy the player,
// the rest are his. The only cell that can strike row u by letter u is the diagonal cell (u,u).
function makeLister3(seed) {
  const rng = makeRng(seed * 31 + 17);
  return function writeRow(u, yours) {     // u is 0-based row index; yours has u letters
    const r = yours.slice(0, u);
    while (r.length < CONFIG.R3_ROWS) r.push(randChar(rng));
    return r;
  };
}
function round3Start(lister) { return { rows: [lister(0, [])], yours: [], slipped: [], done: false }; }
function round3Write(lister, state, c) {
  const u = state.yours.length;
  const yours = state.yours.concat([c]);
  const rows = state.rows.slice();
  const slippedNow = rows[u][u] === c;      // row u still agrees at its own letter: it slipped
  const slipped = slippedNow ? state.slipped.concat([u]) : state.slipped;
  const done = yours.length >= CONFIG.R3_ROWS;
  if (!done) rows.push(lister(u + 1, yours));
  return { rows, yours, slipped, done, slippedNow, struck: strike(rows, yours) };
}
// The end: the Lister puts your row into the book as row 1; the rule runs again on its own.
function addToBookAndRerun(rows, yours) {
  const w = rows[0].length;
  const newRows = [yours.slice(0, w)].concat(rows.map(r => r.slice(0, w))).slice(0, w);
  return { rows: newRows, e0: diagonal(newRows) };
}

// ---------- verdict ----------
function verdictKey(r1, r3) {
  // r1: round1Status at the end; r3: final round-3 state
  if (r3.slipped.length === 0) return r1.won ? 'clean' : 'clean_after_r1_loss';
  if (r3.slipped.length <= 2) return 'few_slipped';
  return 'many_slipped';
}

// ---------- heuristic players, for the calibration and the memo's table ----------
const PLAYERS = {
  random: (ctx, rng) => randChar(rng),
  // writes the letter that strikes the most rows still alive on the page at the next position
  majority: (ctx) => {
    const v = ctx.yours.length; let m = 0, w = 0;
    ctx.aliveRows.forEach(r => { if (r[v] === 'm') m++; else w++; });
    if (m === w) return 'm';
    return m > w ? 'w' : 'm';
  },
  // the paper's rule: look at the cell on the line and write the other letter
  diagonal: (ctx) => ctx.lineCell !== undefined ? flip(ctx.lineCell) : 'm',
  // always the same letter
  allM: () => 'm',
};

function playRound1(rows, player, rng) {
  let yours = [];
  for (;;) {
    const st = round1Status(rows, yours);
    if (st.done) return st;
    const alive = rows.filter((r, i) => st.struck[i] < 0);
    const lineCell = yours.length < rows.length ? rows[yours.length][yours.length] : undefined;
    yours = yours.concat([player({ yours, aliveRows: alive, lineCell }, rng)]);
  }
}
function playRound3(lister, player, rng) {
  let st = round3Start(lister);
  while (!st.done) {
    const u = st.yours.length;
    const alive = st.rows.filter((r, i) => st.struck ? st.struck[i] < 0 : true);
    st = round3Write(lister, st, player({ yours: st.yours, aliveRows: alive, lineCell: st.rows[u][u] }, rng));
  }
  return st;
}

const Mechanism = { CONFIG, makeRng, flip, diagonal, strike, aliveCount, sameRow,
  round1Book, round1Status, makeEndlessBook, round2Start, round2Write,
  makeLister3, round3Start, round3Write, addToBookAndRerun, verdictKey, PLAYERS, playRound1, playRound3 };
if (typeof module !== 'undefined') module.exports = Mechanism;
