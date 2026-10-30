// The Other Chain — mechanism. The single source of truth: build.py inlines this file verbatim into the game,
// and calibration.js tests this file. No DOM. Runs unchanged in Node and in the browser.
// Kind: TOY. It formalises the argument of Watson & Crick (1953), Nature 171:737, as cut-out pieces on a ladder.
(function (root) {
'use strict';

const CONFIG = {
  // --- the paper's numbers (scan, checked against published transcriptions; the OCR reads 3.4 as "3-4") ---
  RISE_A: 3.4,          // p. 737: "a residue on each chain every 3.4 A. in the z-direction"
  TWIST_DEG: 36,        // p. 737: "an angle of 36° between adjacent residues in the same chain"
  REPEAT_RESIDUES: 10,  // p. 737: "the structure repeats after 10 residues on each chain"
  REPEAT_A: 34,         // p. 737: "that is, after 34 A."
  P_RADIUS_A: 10,       // p. 737: "The distance of a phosphorus atom from the fibre axis is 10 A."

  // --- the pieces. Ring class from the paper (p. 737: adenine and guanine purines, thymine and cytosine pyrimidines).
  // Contact points at the paper's positions 6 and 1 (p. 737: "purine position 1 to pyrimidine position 1; purine position 6
  // to pyrimidine position 6"), in the keto forms the paper assumes. bump = hydrogen donor, dent = acceptor:
  // standard chemistry, not printed in the letter (A: 6-amino donor, N1 acceptor; G: O6 acceptor, N1-H donor;
  // T: O4 acceptor, N3-H donor; C: 4-amino donor, N3 acceptor). ---
  BASES: {
    A: { name: 'adenine',  ring: 'purine',     p6: 'bump', p1: 'dent' },
    G: { name: 'guanine',  ring: 'purine',     p6: 'dent', p1: 'bump' },
    T: { name: 'thymine',  ring: 'pyrimidine', p6: 'dent', p1: 'bump' },
    C: { name: 'cytosine', ring: 'pyrimidine', p6: 'bump', p1: 'dent' },
  },
  // enol forms, for the robustness check only (p. 737: "with the keto rather than the enol configurations"):
  // the enol hydroxyl turns the acceptor at position 6 of G and T into a donor, and the donor at 1 into an acceptor.
  ENOL: { G: { p6: 'bump', p1: 'dent' }, T: { p6: 'bump', p1: 'dent' } },

  // --- lengths: our units. The paper says only that one purine and one pyrimidine are needed (p. 737). ---
  LEN: { purine: 3, pyrimidine: 2 },   // our choice: a purine (two rings) is the longer piece
  RAIL_GAP: 5,                         // our choice: the fixed rail distance = one purine + one pyrimidine

  // --- the game ---
  LADDER1_RUNGS: 8,       // our choice: short first ladder
  LADDER2_RUNGS: 10,      // one full turn of the paper's helix (REPEAT_RESIDUES)
  LADDER2_BOTH_RAILS: false, // our choice after play-testing: the given chain on the left rail, as in ladder 1 (true: given pieces on both rails, the paper's dyad)
  LADDER2_MIN_EACH_SIDE: 3, // used only when LADDER2_BOTH_RAILS: at least 3 given pieces on each rail
  COPY_MS_FIRST: 3400,    // our choice: most time the fork waits at the first rung (two spots); it moves on as soon as both are filled
  COPY_MS_LAST: 2000,     // our choice: and at the last; linear in between
};

const KEYS = ['A', 'G', 'T', 'C'];

// seeded draws (mulberry32)
function rng(seed) {
  let a = (seed >>> 0) || 1;
  return function () { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

function piece(b, bases) { return (bases || CONFIG.BASES)[b]; }

// one contact point meeting another
function contact(u, v) {
  if (u !== v) return 'grip';          // bump into dent
  return u === 'bump' ? 'clash' : 'loose';
}

// x pinned to the left rail, y to the right rail; their ends meet in the middle, 6 against 6, 1 against 1
function fit(x, y, opts) {
  opts = opts || {};
  const bases = opts.bases || CONFIG.BASES, len = opts.len || CONFIG.LEN, gap = opts.gap || CONFIG.RAIL_GAP;
  const a = piece(x, bases), b = piece(y, bases);
  const span = len[a.ring] + len[b.ring];
  const width = span > gap ? 'wide' : span < gap ? 'narrow' : 'ok';
  const p6 = contact(a.p6, b.p6), p1 = contact(a.p1, b.p1);
  let fault = null;
  if (width !== 'ok') fault = width;
  else if (p6 === 'clash' || p1 === 'clash') fault = 'clash';
  else if (p6 === 'loose' || p1 === 'loose') fault = 'loose';
  return { held: fault === null, width, p6, p1, fault, bulge: span - gap };
}

// the partner is not written down anywhere: it is found by trying all four
function partnersOf(b, opts) { return KEYS.filter(y => fit(b, y, opts).held); }
function partnerOf(b) { const p = partnersOf(b); if (p.length !== 1) throw new Error('no unique partner for ' + b); return p[0]; }

// a game: two ladders drawn from the game number. Each rung: which rail carries the given piece, and the piece.
function drawGame(seed) {
  const r = rng(seed * 7919 + 13);
  const pick = () => KEYS[Math.floor(r() * 4)];
  let l1, l2;
  for (let tries = 0; ; tries++) {   // floor: ladder 1 shows all four letters
    l1 = Array.from({ length: CONFIG.LADDER1_RUNGS }, () => ({ given: pick(), side: 'L' }));
    if (KEYS.every(k => l1.some(x => x.given === k))) break;
  }
  for (let tries = 0; ; tries++) {   // floor: pieces on both rails; finished ladder has unequal A and G (so the bars can show A=T without A=G)
    l2 = Array.from({ length: CONFIG.LADDER2_RUNGS }, () => ({ given: pick(), side: (r() < 0.5 || !CONFIG.LADDER2_BOTH_RAILS) ? 'L' : 'R' }));
    const nL = l2.filter(x => x.side === 'L').length, nR = l2.length - nL;
    const c = counts(complete(l2));
    const sidesOk = !CONFIG.LADDER2_BOTH_RAILS || (nL >= CONFIG.LADDER2_MIN_EACH_SIDE && nR >= CONFIG.LADDER2_MIN_EACH_SIDE);
    if (sidesOk && c.A !== c.G) break;
  }
  return { seed, ladder1: l1, ladder2: l2 };
}

// a rung as left/right letters, given the player's piece for the empty side (null = empty)
function rungOf(spot, placed) {
  return spot.side === 'L' ? { left: spot.given, right: placed } : { left: placed, right: spot.given };
}

// the zip: every rung tested; nothing is tested before it
function zip(ladder, placed) {
  const rungs = ladder.map((s, i) => { const g = rungOf(s, placed[i]); return Object.assign(g, { fit: fit(g.left, g.right) }); });
  const held = rungs.filter(x => x.fit.held).length;
  return { rungs, held, n: rungs.length, counts: counts(rungs), chargaff: chargaff(rungs) };
}

function complete(ladder) { return ladder.map(s => rungOf(s, partnerOf(s.given))); }
function counts(rungs) { const c = { A: 0, T: 0, G: 0, C: 0 }; rungs.forEach(g => { [g.left, g.right].forEach(b => { if (b) c[b]++; }); }); return c; }
function chargaff(rungs) { const c = counts(rungs); return { AT: c.A === c.T, GC: c.G === c.C, both: c.A === c.T && c.G === c.C }; }

// the copy: the finished ladder is pulled apart. Copy 1 keeps the old left chain and needs a new right piece on every rung;
// copy 2 keeps the old right chain and needs a new left piece. Spots in the order the fork reaches them.
function copySpots(full) {
  const spots = [];
  full.forEach((g, i) => {
    spots.push({ rung: i, copy: 0, side: 'R', template: g.left });
    spots.push({ rung: i, copy: 1, side: 'L', template: g.right });
  });
  return spots;
}
function copyMs(rung) {
  const n = CONFIG.LADDER2_RUNGS; return Math.round(CONFIG.COPY_MS_FIRST + (CONFIG.COPY_MS_LAST - CONFIG.COPY_MS_FIRST) * rung / Math.max(1, n - 1));
}
// entries[k] is the letter the player put in spot k, or null if the fork passed first
function scoreCopy(full, entries) {
  const spots = copySpots(full);
  const res = spots.map((s, k) => {
    const e = entries[k] == null ? null : entries[k];
    const f = e === null ? null : (s.side === 'R' ? fit(s.template, e) : fit(e, s.template));
    return { spot: s, entry: e, held: !!(f && f.held), fault: e === null ? 'missed' : f.fault };
  });
  const copies = [0, 1].map(c => full.map((g, i) => {
    const r = res.find(x => x.spot.rung === i && x.spot.copy === c);
    return c === 0 ? { left: g.left, right: r.entry, held: r.held } : { left: r.entry, right: g.right, held: r.held };
  }));
  const same = copies.map(cp => cp.every((g, i) => g.left === full[i].left && g.right === full[i].right));
  const right = res.filter(x => x.held).length;
  return { res, copies, same, right, n: res.length, missed: res.filter(x => x.fault === 'missed').length };
}

// the closing twist: residue i turned TWIST_DEG further round the axis and RISE_A further along it
function helixPoint(i) {
  return { angleDeg: (i * CONFIG.TWIST_DEG) % 360, zA: i * CONFIG.RISE_A, radiusA: CONFIG.P_RADIUS_A };
}

// words for a count
function howMany(k, n) {
  if (k === n) return 'every';
  if (k === n - 1) return 'all but one';
  if (k === n - 2 && n >= 8) return 'all but two';
  if (k === 0) return 'none';
  if (k >= 0.7 * n) return 'most';
  if (k >= 0.4 * n) return 'about half';
  return 'only a few';
}

// the verdict, in words. s = { l1: zip result, l2: zip result, copy: scoreCopy result }
function verdict(s) {
  const lines = [];
  const f2 = s.l2.held === s.l2.n, f1 = s.l1.held === s.l1.n;
  const rule = 'a long piece needs a short one, and a bump needs a dent. Only A with T and G with C.';
  if (f1 && f2) lines.push('You had the rule from the first ladder: ' + rule);
  else if (f2) lines.push('Your first ladder failed in places; your second held all the way down. You found the rule: ' + rule);
  else if (s.l2.held >= s.l2.n - 2) lines.push('Your second ladder held ' + howMany(s.l2.held, s.l2.n) + ' rung' + (s.l2.n - s.l2.held === 1 ? '' : 's') + '. Nearly there. The rule: ' + rule);
  else lines.push('Your rungs kept failing to the end. The rule: ' + rule);
  const c = s.copy, both = c.same[0] && c.same[1];
  if (both) lines.push('Then you pulled the ladder apart and each half rebuilt the other: two ladders, letter for letter the same as the first.');
  else lines.push('Then you pulled the ladder apart and each half rebuilt the other. Your two copies got ' + howMany(c.right, c.n) + ' new piece' + (c.right === 1 ? '' : 's') + ' right' + (c.missed ? ', and the fork passed ' + c.missed + ' empty spot' + (c.missed === 1 ? '' : 's') : '') + '. You never had to be told what went where: each half said it.');
  lines.push('Watson and Crick, 1953: one chain fixes the other. That is why DNA always holds as much A as T and as much G as C, and it "immediately suggests a possible copying mechanism".');
  return lines;
}

const api = { CONFIG, KEYS, rng, fit, contact, partnersOf, partnerOf, drawGame, rungOf, zip, complete, counts, chargaff,
  copySpots, copyMs, scoreCopy, helixPoint, howMany, verdict };
if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.MECH = api;
})(typeof window !== 'undefined' ? window : this);
