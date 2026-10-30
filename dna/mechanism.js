// Watson's Cardboard (formerly The Other Chain) — mechanism. The single source of truth: build.py inlines this file verbatim into the game,
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

  // --- Chargaff's measurements: the evidence on the desk for ladder one. The letter cites them (p. 737, refs 3 and 4: "the ratio of the
  // amounts of adenine to thymine, and the ratio of guanine to cytosine, are always very close to unity") but prints no numbers.
  // Percent of the four letters, as commonly tabulated from Chargaff's laboratory (e.g. Stanford Stats 366 notes; Pierce, Genetics,
  // table 10.1). Sources differ by a point or two (Pierce's 1955 table: human 30.3/30.3/19.5/19.9); some values postdate 1953. Check. ---
  JARS: [
    { name: 'human',          A: 30.9, T: 29.4, G: 19.9, C: 19.8 },
    { name: 'gut bacterium',  A: 24.7, T: 23.6, G: 26.0, C: 25.7 },   // E. coli: all four near a quarter, so it fits any pairing (the decoy)
    { name: 'yeast',          A: 31.3, T: 32.9, G: 18.7, C: 17.1 },
    { name: 'TB bacterium',   A: 15.1, T: 14.6, G: 34.9, C: 35.4 },   // Mycobacterium tuberculosis
  ],
  JAR_CLOSE: 3,           // our choice: two letters "match" in a jar when within 3 points (the largest true-pair gap is 1.6)

  // --- the game ---
  LADDER1_RUNGS: 6,       // our choice: a short first ladder; pieces face down, built from the jars' evidence, tested only by the zip
  LADDER2_RUNGS: 10,      // one full turn of the paper's helix (REPEAT_RESIDUES)
  LADDER2_MIN_EACH_SIDE: 3, // our choice: the given pieces sit on both rails (the paper's dyad), at least 3 on each
  // Ladder 2 arrives already built, wrongly: a model on the desk. Most rungs pair like with like, which is the model Watson built
  // first (Watson, The Double Helix, ch. 26; the letter itself says only that like-with-like does not fit). A few rungs are right
  // by accident and a couple have the right width but clashing ends, so the three faults are all on the desk. Our construction.
  LADDER2_LIKE: 5,        // our choice: rungs paired like with like (too wide or too narrow)
  LADDER2_CLASH: 2,       // our choice: rungs with the right width and a bump on a bump
  COPY_MS_FIRST: 3000,    // our choice: the fork waits this long at the first rung (two spots) and moves on as soon as both are filled
  COPY_MS_LAST: 1600,     // our choice: and at the last; linear in between
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
    l2 = Array.from({ length: CONFIG.LADDER2_RUNGS }, () => ({ given: pick(), side: r() < 0.5 ? 'L' : 'R' }));
    const nL = l2.filter(x => x.side === 'L').length, nR = l2.length - nL;
    const c = counts(complete(l2));
    if (nL >= CONFIG.LADDER2_MIN_EACH_SIDE && nR >= CONFIG.LADDER2_MIN_EACH_SIDE && c.A !== c.G) break;
  }
  // the model on the desk: which rungs are wrong, and how
  const idx = l2.map((_, i) => i); for (let i = idx.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [idx[i], idx[j]] = [idx[j], idx[i]]; }
  const like = idx.slice(0, CONFIG.LADDER2_LIKE), clash = idx.slice(CONFIG.LADDER2_LIKE, CONFIG.LADDER2_LIKE + CONFIG.LADDER2_CLASH);
  const prefill = l2.map((s, i) => like.includes(i) ? s.given : clash.includes(i) ? clashPartner(s.given) : partnerOf(s.given));
  return { seed, ladder1: l1, ladder2: l2, prefill };
}
// the piece with the right length and the wrong ends: the other base of the other ring class
function clashPartner(b) { return KEYS.find(y => y !== b && fit(b, y).fault === 'clash'); }

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

// the copies copied again, without the player: every chain rebuilds its partner by the rule (the letter's last sentence).
// A rung the player got wrong has a changed letter on one chain; that chain's grandchild pairs it correctly, and so the change
// is inherited: the grandchildren hold, and differ from the original. A spot the fork passed (null) stays a gap.
function copyAgain(copies, full) {
  return copies.map(cp => cp.map((g, i) => {
    const chain = g.left && g.right ? (g.left === full[i].left ? g.right : g.left) : (g.left || g.right); // the new chain of this copy
    if (!chain) return { left: null, right: null, held: false, changed: true };
    const p = partnersOf(chain)[0] || null;
    const changed = chain !== full[i].left && chain !== full[i].right;
    return { left: chain, right: p, held: !!p, changed };
  }));
}

// Chargaff's jars: the three ways to split the four letters into two couples, and what each jar says about each.
const PAIRINGS = [['AT', 'GC'], ['AG', 'TC'], ['AC', 'GT']];
function jarGap(jar, couple) { return Math.abs(jar[couple[0]] - jar[couple[1]]); }
// for each pairing: the jars it fits (both couples within JAR_CLOSE) and the largest gap anywhere
function readJars(jars) {
  jars = jars || CONFIG.JARS;
  return PAIRINGS.map(p => {
    const fits = jars.map(j => p.every(c => jarGap(j, c) <= CONFIG.JAR_CLOSE));
    return { pairing: p, fits, all: fits.every(Boolean), worst: Math.max(...jars.map(j => Math.max(...p.map(c => jarGap(j, c))))) };
  });
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
  const f2 = s.l2.held === s.l2.n;
  const rule = 'a long piece needs a short one, and the ends must grip: a bump needs a dent. Only A with T and G with C.';
  const h1 = s.l1.held, n1 = s.l1.n;
  if (h1 === n1) lines.push('You read Chargaff\'s jars: A always comes with as much T, and G with as much C. Your first ladder held on every rung, and the cardboard showed why: ' + rule + (f2 ? ' Then you mended the model on the desk.' : ''));
  else if (h1 >= n1 - 2) lines.push('Your first ladder held ' + howMany(h1, n1) + ' rung' + (n1 - h1 === 1 ? '' : 's') + '. The jars said it all along: A always comes with as much T, and G with as much C. The cardboard shows why: ' + rule + (f2 ? ' Then you mended the model on the desk.' : ''));
  else lines.push('Your first ladder held ' + howMany(h1, n1) + ' of its rungs. The jars said it all along: A always comes with as much T, and G with as much C. The cardboard shows why: ' + rule + (f2 ? ' Then you mended the model on the desk.' : ''));
  const c = s.copy, both = c.same[0] && c.same[1], g = s.grand;
  if (both) lines.push('Then you pulled the ladder apart and each half rebuilt the other: two ladders, letter for letter the same as the first. Copied again, without you, they stayed the same.');
  else { const ch = g ? g.reduce((n, cp) => n + cp.filter(x => x.changed).length, 0) : 0;
    lines.push('Then you pulled the ladder apart and each half rebuilt the other. Your copies got ' + howMany(c.right, c.n) + ' new piece' + (c.right === 1 ? '' : 's') + ' right' + (c.missed ? '; the fork passed ' + c.missed + ' empty spot' + (c.missed === 1 ? '' : 's') : '') + '. Copied again, without you, ' + (ch ? 'the grandchildren hold on every rung, and ' + ch + ' rung' + (ch === 1 ? '' : 's') + ' of them differ from the ladder you built: a slip, once copied, breeds true.' : 'the grandchildren are the same as the first.')); }
  lines.push('Watson built his first model with like paired to like. Most of it was wrong; a colleague told him the textbooks had drawn the shapes of the pieces wrongly, and he rebuilt it in a morning.');
  lines.push('Watson and Crick, 1953: one chain fixes the other. That is why DNA always holds as much A as T and as much G as C, and it "immediately suggests a possible copying mechanism".');
  return lines;
}

const api = { CONFIG, KEYS, rng, fit, contact, partnersOf, partnerOf, clashPartner, drawGame, rungOf, zip, complete, counts, chargaff,
  copySpots, copyMs, scoreCopy, copyAgain, PAIRINGS, jarGap, readJars, helixPoint, howMany, verdict };
if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.MECH = api;
})(typeof window !== 'undefined' ? window : this);
