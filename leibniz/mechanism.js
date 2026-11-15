// Leibniz's Tiles: the mechanism, headless and the only copy. Runs unchanged in Node (module.exports) and in the browser
// (window.LeibnizMechanism). Everything that moves an outcome lives here: the three worlds, placing, turning, pulling,
// the striving at "Let it be" (the rush-in), the exact solver that finds the best possible world, the heuristics the
// calibration check plays, and the words of the per-world lines and the verdict. The interface only passes actions in.
(function (root) {
'use strict';

// ---------------------------------------------------------------------------------------------------------------
// CONFIG: every tunable number and word, tagged with its source in the paper (Strickland's translation, 2014; page
// numbers are the PDF's) or with the design reason. The paper has no numbers; the toy's numbers are all ours and say so.
// ---------------------------------------------------------------------------------------------------------------
var CONFIG = {
  // Shapes a possible can have. Cells are [row, col] from the shape's top-left. The name is what the game calls the
  // shape when a sentence needs it ("Left out: the big square"); names are chosen so that in each world no two
  // different shapes share a name. Essence is the number of cells (memo §15: "essence is area"; paper p. 2,
  // "perfection is nothing other than quantity of essence", and p. 3, "as many as possible occupy a given area").
  SHAPES: {
    '1x1': { cells: [[0, 0]], name: 'the single', plural: 'singles' },
    '1x2': { cells: [[0, 0], [0, 1]], name: 'the bar of two', plural: 'bars of two' },
    '1x3': { cells: [[0, 0], [0, 1], [0, 2]], name: 'the bar of three', plural: 'bars of three' },
    '1x4': { cells: [[0, 0], [0, 1], [0, 2], [0, 3]], name: 'the thin bar', plural: 'thin bars' },
    'L3': { cells: [[0, 0], [1, 0], [1, 1]], name: 'the L', plural: 'Ls' },
    '2x2': { cells: [[0, 0], [0, 1], [1, 0], [1, 1]], name: 'the small square', plural: 'small squares' },
    '2x3': { cells: [[0, 0], [0, 1], [0, 2], [1, 0], [1, 1], [1, 2]], name: 'the rectangle', plural: 'rectangles' },
    '2x4': { cells: [[0, 0], [0, 1], [0, 2], [0, 3], [1, 0], [1, 1], [1, 2], [1, 3]], name: 'the long bar', plural: 'long bars' },
    '2x5': { cells: [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4], [1, 0], [1, 1], [1, 2], [1, 3], [1, 4]], name: 'the longest bar', plural: 'longest bars' },
    '3x3': { cells: [[0, 0], [0, 1], [0, 2], [1, 0], [1, 1], [1, 2], [2, 0], [2, 1], [2, 2]], name: 'the big square', plural: 'big squares' }
  },
  // The three worlds (memo §11). A world is a board (the "capacity of the world", p. 2, "the land on which a building
  // is to be constructed") and a tray of possibles whose total exceeds the board (p. 2, "forced to leave more spaces
  // empty than you could have or wished to"). Piece sets are ours, found by search so that each world holds exactly
  // one thing to find out; the calibration check proves the properties stated here.
  WORLDS: [
    { W: 4, H: 4, pieces: ['2x3', '2x2', 'L3', '1x3', '1x2', '1x1'], prefill: null,
      // 19 cells for 16: the best world is full and still leaves something out (p. 2, not all possibles are compossible).
      lesson: 'Not everything that could exist can exist together.' },
    { W: 6, H: 6, pieces: ['3x3', '2x4', '2x4', '2x4', '2x2', '2x2', '2x2'], prefill: null,
      // 45 cells for 36: with the big square on the board at most 29 can be lit; without it the land is full. The
      // heaviest-first player ends at 29 (p. 2, "unless you use some skill").
      lesson: 'The grandest thing need not be in the best world.' },
    { W: 6, H: 6, pieces: ['2x5', '3x3', '2x4', '1x4', '2x3', '1x4', 'L3'], prefill: 'byWeight',
      // 44 cells for 36, placed heaviest first, first fit (our picture of "heavy bodies ... in proportion to their
      // weight", p. 3): 31 lit, and none of the three waiting shapes fits anywhere. Pull the long bar out and the three
      // fill the 13 cells it opens: 36 (p. 6, "stepping back in order to make a leap forward with greater force").
      lesson: 'A step back can be the way to a fuller world.' }
  ],
  // Tile colours, one per possible in tray order, cycling (memo §13). Our choice.
  COLOURS: ['#FF5C5C', '#FFB830', '#2FE3A3', '#4F9DFF', '#B48CFF'],
  // The striving at "Let it be": whatever still fits comes to be, heaviest first, at the first place it fits, scanning
  // the board row by row (p. 2, possibles "strive with equal right for existence in proportion to their quantity of
  // essence"; p. 3, "even if nothing further is determined, there exists as much as is possible"). The order is ours.
  RUSH_ORDER: 'heaviest first, first fit',
  // What the calibration check expects (memo §11 and §17); the solver is what establishes them.
  EXPECT: { best: [16, 36, 36], totals: [19, 45, 44], world2WithSquareMax: 29, world2GreedyLit: 29,
    world3PrefillLit: 31, world3PullLongBar: 36, world3PullBigSquare: 32, world3PullLongestBar: 31 },
  // Words for how much of the land is dark (memo §3 "Numbers on screen": direction first, rough size). Our choice.
  DARK_WORDS: [[0, 'full'], [1, 'one cell dark'], [2, 'two cells dark'], [0.1, 'a few cells dark'], [0.15, 'about a tenth dark'],
    [0.22, 'about a fifth dark'], [0.29, 'about a quarter dark'], [0.4, 'about a third dark'], [0.6, 'about half dark'], [1.01, 'mostly dark']]
};

// ---------------------------------------------------------------------------------------------------------------
// Shapes and rotations (a quarter turn each; no reflection, memo §15)
// ---------------------------------------------------------------------------------------------------------------
function norm(cs) {
  var mr = Infinity, mc = Infinity, i;
  for (i = 0; i < cs.length; i++) { if (cs[i][0] < mr) mr = cs[i][0]; if (cs[i][1] < mc) mc = cs[i][1]; }
  var out = cs.map(function (c) { return [c[0] - mr, c[1] - mc]; });
  out.sort(function (a, b) { return a[0] - b[0] || a[1] - b[1]; });
  return out;
}
function rotations(cells) {
  var out = [], seen = {}, cur = norm(cells), k, key;
  for (k = 0; k < 4; k++) {
    key = JSON.stringify(cur);
    if (!seen[key]) { seen[key] = 1; out.push({ cells: cur, h: maxOf(cur, 0) + 1, w: maxOf(cur, 1) + 1 }); }
    cur = norm(cur.map(function (c) { return [c[1], -c[0]]; }));
  }
  return out;
}
function maxOf(cs, j) { var m = -Infinity, i; for (i = 0; i < cs.length; i++) if (cs[i][j] > m) m = cs[i][j]; return m; }

// ---------------------------------------------------------------------------------------------------------------
// The exact solver: the best possible world. Depth-first over the first empty cell: either some unused piece covers
// it (any rotation, anchored so that its first cell in row-major order is that cell) or the cell stays dark for good.
// Bound: lit so far plus what could still be lit cannot beat the best found. Pieces are {area, rots}; holes are cells
// already taken by fixed tiles. Returns the maximum lit and one placement reaching it.
// ---------------------------------------------------------------------------------------------------------------
function solve(W, H, pieces, holes, weight) {
  var N = W * H, board = [], k, i;
  for (k = 0; k < N; k++) board.push(-1);
  if (holes) for (k = 0; k < holes.length; k++) board[holes[k]] = -3;
  var P = pieces.map(function (p, idx) { return { idx: idx, area: p.cells.length, w: weight ? weight(p.cells.length) : p.cells.length, rots: rotations(p.cells) }; });
  P.sort(function (a, b) { return b.area - a.area; });
  var free = 0; for (k = 0; k < N; k++) if (board[k] === -1) free++;
  var totalW = 0; for (i = 0; i < P.length; i++) totalW += P[i].w;
  var best = -1, bestPl = null, pl = [], used = [];
  for (i = 0; i < P.length; i++) used.push(false);
  // with weights, the bound uses the largest weight per cell among remaining pieces (a loose but valid bound)
  var maxWPerCell = 0; for (i = 0; i < P.length; i++) if (P[i].w / P[i].area > maxWPerCell) maxWPerCell = P[i].w / P[i].area;
  function rec(lit, litW, remainW, empties) {
    var room = free - lit - empties;
    if (litW + Math.min(remainW, room * maxWPerCell) <= best) return;
    var e = -1; for (var c = 0; c < N; c++) { if (board[c] === -1) { e = c; break; } }
    if (e < 0) { if (litW > best) { best = litW; bestPl = pl.slice(); } return; }
    var er = Math.floor(e / W), ec = e % W, pi, ri, R, a, r0, c0, j, ok, cs;
    for (pi = 0; pi < P.length; pi++) {
      if (used[pi]) continue;
      for (ri = 0; ri < P[pi].rots.length; ri++) {
        R = P[pi].rots[ri]; a = R.cells[0]; r0 = er - a[0]; c0 = ec - a[1];
        if (r0 < 0 || c0 < 0 || r0 + R.h > H || c0 + R.w > W) continue;
        cs = R.cells; ok = true;
        for (j = 0; j < cs.length; j++) { if (board[(r0 + cs[j][0]) * W + c0 + cs[j][1]] !== -1) { ok = false; break; } }
        if (!ok) continue;
        for (j = 0; j < cs.length; j++) board[(r0 + cs[j][0]) * W + c0 + cs[j][1]] = pi;
        used[pi] = true; pl.push({ idx: P[pi].idx, ri: ri, r: r0, c: c0 });
        rec(lit + P[pi].area, litW + P[pi].w, remainW - P[pi].w, empties);
        pl.pop(); used[pi] = false;
        for (j = 0; j < cs.length; j++) board[(r0 + cs[j][0]) * W + c0 + cs[j][1]] = -1;
      }
    }
    board[e] = -2; rec(lit, litW, remainW, empties + 1); board[e] = -1;
  }
  rec(0, 0, totalW, 0);
  var litCells = 0; if (bestPl) for (i = 0; i < bestPl.length; i++) litCells += pieces[bestPl[i].idx].cells.length;
  return { best: weight ? best : litCells, lit: litCells, placement: bestPl || [] };
}

// Heaviest first, first fit (the picture of heavy bodies settling, p. 3): places each piece, in order of size, at the
// first place it fits scanning row by row, trying its rotations in order. Pieces that fit nowhere are skipped.
function greedyFill(W, H, pieces, board) {
  var N = W * H, k, placed = [];
  if (!board) { board = []; for (k = 0; k < N; k++) board.push(-1); }
  var order = pieces.map(function (p, idx) { return { idx: idx, a: p.cells.length }; });
  order.sort(function (a, b) { return b.a - a.a || a.idx - b.idx; });
  order.forEach(function (o) {
    var R = rotations(pieces[o.idx].cells), done = false, k2, ri, r0, c0, cs, j, ok;
    for (k2 = 0; k2 < N && !done; k2++) {
      r0 = Math.floor(k2 / W); c0 = k2 % W;
      for (ri = 0; ri < R.length && !done; ri++) {
        cs = R[ri].cells; ok = true;
        for (j = 0; j < cs.length; j++) { var r = r0 + cs[j][0], c = c0 + cs[j][1]; if (r >= H || c >= W || board[r * W + c] !== -1) { ok = false; break; } }
        if (ok) { for (j = 0; j < cs.length; j++) board[(r0 + cs[j][0]) * W + c0 + cs[j][1]] = o.idx; placed.push({ idx: o.idx, ri: ri, r: r0, c: c0 }); done = true; }
      }
    }
  });
  return { board: board, placed: placed };
}

// ---------------------------------------------------------------------------------------------------------------
// A world in play
// ---------------------------------------------------------------------------------------------------------------
function makeWorld(cfg, index) {
  var w = { index: index, W: cfg.W, H: cfg.H, lesson: cfg.lesson, pieces: [], ended: false, result: null, pulls: 0, placesByHand: 0, byWeight: !!cfg.prefill };
  cfg.pieces.forEach(function (shape, i) {
    var S = CONFIG.SHAPES[shape];
    w.pieces.push({ id: i, shape: shape, name: S.name, plural: S.plural, cells: S.cells, area: S.cells.length, rots: rotations(S.cells), ri: 0,
      colour: CONFIG.COLOURS[i % CONFIG.COLOURS.length], placed: null, byWeight: false, rushed: false, ghost: false });
  });
  var sol = solve(cfg.W, cfg.H, w.pieces.map(function (p) { return { cells: p.cells }; }));
  w.best = { lit: sol.best, placement: sol.placement.map(function (pl) { return { id: pl.idx, ri: pl.ri, r: pl.r, c: pl.c }; }) };
  w.total = w.pieces.reduce(function (s, p) { return s + p.area; }, 0);
  if (cfg.prefill === 'byWeight') {
    var g = greedyFill(cfg.W, cfg.H, w.pieces.map(function (p) { return { cells: p.cells }; }));
    g.placed.forEach(function (pl) { var p = w.pieces[pl.idx]; p.ri = pl.ri; p.placed = { r: pl.r, c: pl.c }; p.byWeight = true; });
  }
  return w;
}
function newGame() {
  return { worlds: CONFIG.WORLDS.map(makeWorld), at: 0, done: false };
}
function currentCells(p) { return p.rots[p.ri]; }
function occupancy(w) {
  var N = w.W * w.H, board = [], k;
  for (k = 0; k < N; k++) board.push(-1);
  w.pieces.forEach(function (p) { if (p.placed) { var R = currentCells(p); R.cells.forEach(function (c) { board[(p.placed.r + c[0]) * w.W + p.placed.c + c[1]] = p.id; }); } });
  return board;
}
function fits(w, p, ri, r0, c0) {
  var R = p.rots[ri], board = occupancy(w), j;
  if (r0 < 0 || c0 < 0 || r0 + R.h > w.H || c0 + R.w > w.W) return false;
  for (j = 0; j < R.cells.length; j++) { var k = (r0 + R.cells[j][0]) * w.W + c0 + R.cells[j][1]; if (board[k] !== -1 && board[k] !== p.id) return false; }
  return true;
}
function anyFit(w, p) {
  var ri, r, c;
  for (ri = 0; ri < p.rots.length; ri++) for (r = 0; r < w.H; r++) for (c = 0; c < w.W; c++) if (fits(w, p, ri, r, c)) return { ri: ri, r: r, c: c };
  return null;
}
function place(w, id, r0, c0) {
  var p = w.pieces[id];
  if (w.ended || p.placed) return { ok: false, why: p.placed ? 'already on the board' : 'the world has ended' };
  if (!fits(w, p, p.ri, r0, c0)) return { ok: false, why: 'does not fit there' };
  p.placed = { r: r0, c: c0 }; p.byWeight = false; w.placesByHand++;
  return { ok: true, status: status(w) };
}
function turn(w, id) {
  var p = w.pieces[id];
  if (w.ended || p.placed) return { ok: false };
  p.ri = (p.ri + 1) % p.rots.length;
  return { ok: true, ri: p.ri };
}
function pull(w, id) {
  var p = w.pieces[id];
  if (w.ended || !p.placed) return { ok: false };
  p.placed = null; w.pulls++;
  return { ok: true, status: status(w) };
}
function status(w) {
  var lit = 0, waiting = 0;
  w.pieces.forEach(function (p) { if (p.placed) lit += p.area; else waiting++; });
  return { lit: lit, dark: w.W * w.H - lit, waiting: waiting, total: w.W * w.H };
}
// "Let it be": the striving. Whatever still fits comes to be, heaviest first, at the first place it fits; then the
// world is judged against the best possible one.
function letItBe(w) {
  if (w.ended) return w.result;
  var waiting = w.pieces.filter(function (p) { return !p.placed; });
  waiting.sort(function (a, b) { return b.area - a.area || a.id - b.id; });
  var rushed = [];
  waiting.forEach(function (p) {
    var f = anyFit(w, p);
    if (f) { p.ri = f.ri; p.placed = { r: f.r, c: f.c }; p.rushed = true; rushed.push({ id: p.id, name: p.name }); }
  });
  w.pieces.forEach(function (p) { if (!p.placed) p.ghost = true; });
  w.ended = true;
  var st = status(w);
  var leftOut = w.pieces.filter(function (p) { return !p.placed; });
  var bestIds = {}; w.best.placement.forEach(function (pl) { bestIds[pl.id] = true; });
  var bestLeftOut = w.pieces.filter(function (p) { return !bestIds[p.id]; });
  w.result = { lit: st.lit, dark: st.dark, total: st.total, rushed: rushed, leftOut: leftOut.map(function (p) { return { id: p.id, name: p.name, shape: p.shape } }),
    best: w.best.lit, bestLeftOut: bestLeftOut.map(function (p) { return { id: p.id, name: p.name, shape: p.shape } }), pulls: w.pulls, placesByHand: w.placesByHand,
    matchedBest: st.lit === w.best.lit };
  w.result.lines = worldLines(w);
  return w.result;
}
function nextWorld(g) {
  if (g.at < g.worlds.length - 1) { g.at++; return g.worlds[g.at]; }
  g.done = true; return null;
}

// ---------------------------------------------------------------------------------------------------------------
// Words
// ---------------------------------------------------------------------------------------------------------------
function darkWords(dark, total) {
  if (dark === 0) return 'full';
  if (dark === 1) return 'one cell dark';
  if (dark === 2) return 'two cells dark';
  var f = dark / total, i;
  for (i = 3; i < CONFIG.DARK_WORDS.length; i++) if (f < CONFIG.DARK_WORDS[i][0]) return CONFIG.DARK_WORDS[i][1];
  return 'mostly dark';
}
function listNames(pieces) {
  // "the big square", "two long bars and the single"
  var groups = {}, order = [];
  pieces.forEach(function (p) { if (!groups[p.shape]) { groups[p.shape] = []; order.push(p.shape); } groups[p.shape].push(p); });
  var parts = order.map(function (s) { var g = groups[s]; return g.length === 1 ? g[0].name : numberWord(g.length) + ' ' + (CONFIG.SHAPES[s].plural); });
  if (parts.length === 0) return 'nothing';
  if (parts.length === 1) return parts[0];
  return parts.slice(0, -1).join(', ') + ' and ' + parts[parts.length - 1];
}
function timesWord(n) { return n === 1 ? 'once' : n === 2 ? 'twice' : numberWord(n) + ' times'; }
function numberWord(n) { return ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven'][n] || String(n); }
function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
function worldLines(w) {
  var r = w.result, lines = [], i;
  // 1. what happened at Let it be
  if (r.rushed.length) lines.push(cap(listNames(w.pieces.filter(function (p) { return p.rushed; }))) + ' still fitted, and nothing stopped ' + (r.rushed.length > 1 ? 'them' : 'it') + ', so ' + (r.rushed.length > 1 ? 'they' : 'it') + ' came to be.');
  // 2. the world as it stands, in the aim's units
  var dw = darkWords(r.dark, r.total);
  lines.push('Your world holds ' + r.lit + ' of ' + r.total + ': ' + dw + '.' + (r.leftOut.length ? ' Left out: ' + listNames(r.leftOut) + '.' : ' Nothing is left out.'));
  // 3. the best possible world
  var bdw = darkWords(r.total - r.best, r.total);
  var bestLine = 'The best possible world is ' + bdw;
  if (w.index === 0) bestLine += (r.bestLeftOut.length ? ', and it also leaves something out (' + listNames(r.bestLeftOut) + '): not everything that could exist can exist together.' : '.');
  else if (w.index === 1) { var sq = r.bestLeftOut.some(function (p) { return p.shape === '3x3'; }); bestLine += sq ? ', and the big square is not in it.' : '.'; }
  else bestLine += (r.bestLeftOut.length ? '; it leaves out ' + listNames(r.bestLeftOut) + '.' : '.');
  lines.push(bestLine);
  // 4. where you stand
  if (r.matchedBest) lines.push('Yours holds as much as any world can.');
  else lines.push('Yours holds ' + (r.best - r.lit) + ' cells less than the best possible world.');
  // 5. world-specific, from what the player did
  if (w.index === 1) {
    var sqIn = w.pieces[0].placed;
    if (sqIn && !r.matchedBest) lines.push('You kept the grandest thing, and it is what left the land dark.');
    if (!sqIn) lines.push('You left the grandest thing out' + (r.matchedBest ? ', and the land is full.' : '.'));
  }
  if (w.index === 2) {
    if (r.pulls === 0) lines.push('You never stepped back; the world stayed as weight made it.');
    else if (r.matchedBest) lines.push('You pulled something out, and more came to be where it was: the step back was the way forward.');
    else lines.push('You stepped back ' + timesWord(r.pulls) + ', and the world is no fuller for it this time.');
  }
  return lines;
}
function verdict(g) {
  var ws = g.worlds, r = ws.map(function (w) { return w.result; }), i;
  var paper = 'Leibniz: the world that exists is the arrangement of possible things that fits the most together, like tiles filling a board. Not everything possible can exist; the grandest thing need not be in the best world; the small, awkward things are; and a step back can be the way to a fuller world.';
  var found = [];
  found.push('World 1: your world was ' + darkWords(r[0].dark, r[0].total) + (r[0].leftOut.length ? ', with ' + listNames(r[0].leftOut) + ' left out.' : '.'));
  var sq = ws[1].pieces[0].placed;
  found.push('World 2: ' + (sq ? 'you kept the big square, and your world was ' + darkWords(r[1].dark, r[1].total) + '.' : 'you left the big square out, and your world was ' + darkWords(r[1].dark, r[1].total) + '.'));
  var w3 = ws[2];
  found.push('World 3: ' + (r[2].pulls === 0 ? 'you never stepped back, and the world stayed ' + darkWords(r[2].dark, r[2].total) + '.' : 'you stepped back ' + timesWord(r[2].pulls) + ', and the world ended ' + darkWords(r[2].dark, r[2].total) + (r[2].matchedBest ? ': the step back was the way forward.' : '.')));
  var part = [];
  for (i = 0; i < 3; i++) if (!r[i].matchedBest) part.push('world ' + (i + 1) + ' (' + (r[i].best - r[i].lit) + ' cells short)');
  var partLine = part.length === 0 ? 'Nowhere: on every board yours holds as much as any world can.' : 'On ' + part.join(', ') + ', the best possible world holds more than yours.';
  var stood = part.length === 0 ? 'Yours is the one Leibniz says exists: the fullest arrangement that could be.' :
    'A world with less in it than there could have been. Leibniz says that cannot be the one that exists: the possibles push, and the fullest arrangement is what comes through, the way weights settle.';
  var matched = r.filter(function (x) { return x.matchedBest; }).length;
  var fate = matched === 3 ? 'You packed every world as full as it can be.' : matched === 2 ? 'Two of your three worlds are as full as they can be.' : matched === 1 ? 'One of your three worlds is as full as it can be.' : 'None of your worlds is as full as it could have been.';
  return { paper: paper, found: found, part: partLine, stood: stood, fate: fate, matched: matched };
}

var M = { CONFIG: CONFIG, rotations: rotations, solve: solve, greedyFill: greedyFill, newGame: newGame, makeWorld: makeWorld, occupancy: occupancy, fits: fits, anyFit: anyFit,
  place: place, turn: turn, pull: pull, status: status, letItBe: letItBe, nextWorld: nextWorld, worldLines: worldLines, verdict: verdict, darkWords: darkWords, listNames: listNames };
if (typeof module !== 'undefined' && module.exports) module.exports = M; else root.LeibnizMechanism = M;
})(typeof window !== 'undefined' ? window : this);
