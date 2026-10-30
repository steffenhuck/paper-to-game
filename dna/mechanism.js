// Watson's Cardboard — mechanism. The single source of truth: build.py inlines this file verbatim into the game,
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
  LADDER_RUNGS: 10,       // each ladder is one full turn of the paper's helix (REPEAT_RESIDUES)
  ROUNDS: 2,              // our choice after play: a second ladder, so a player who missed one clue on the first zip can use it; the second scores
  // What other ways of playing score on a ladder of ten, from the heuristic simulation in calibration.js (2000 games each):
  // random about 2.5, reading one clue (lengths or ends) about 5, remembering A-T from school and guessing the rest about 6;
  // all ten held: under 1% for every one of them, 100% for a player who reads both. Shown to the player in words.
  BENCH_RANDOM: 2.5,      // calibration.js: mean rungs held by a random player
  BENCH_ONE_CLUE: 5,      // calibration.js: mean rungs held by a player who reads lengths only or ends only
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
  const ladders = [];
  while (ladders.length < CONFIG.ROUNDS) {
    let lad;
    for (let tries = 0; ; tries++) {   // floor: all four letters, and unequal A and G when finished (so the bars show A = T without A = G)
      lad = Array.from({ length: CONFIG.LADDER_RUNGS }, () => ({ given: pick(), side: 'L' }));
      const c = counts(complete(lad));
      if (KEYS.every(k => lad.some(x => x.given === k)) && c.A !== c.G) break;
    }
    ladders.push(lad);
  }
  return { seed, ladders, ladder: ladders[0] };
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
// the halves fill themselves: each gap takes the one piece that fits its old partner
function copyByRule(full) { return scoreCopy(full, copySpots(full).map(s => partnerOf(s.template))); }
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

// what the player's zipped ladder says about how they chose: the fault pattern tells which clue they read.
// In the simulation (calibration.js) each pattern identifies its kind of player in every game: only bump-on-bump faults = read the
// lengths; only width faults = read the ends (or paired like with like, which holds nothing); both kinds = no clue, i.e. guessing.
function reading(z) {
  if (z.held === z.n) return 'both';
  if (z.rungs.every(g => g.left === g.right)) return 'like';
  const w = z.rungs.some(g => g.fit.width !== 'ok'), e = z.rungs.some(g => g.fit.width === 'ok' && !g.fit.held);
  return w && e ? 'guess' : w ? 'ends' : 'lengths';
}

// the score: ten points a rung that holds, out of 100
function score(z) { return Math.round(100 * z.held / z.n); }

// the verdict, in words. s = { z: the zipped ladder }
// what the first ladder showed, in a phrase, for the verdict after the second
const FIRST = {
  like: 'paired like with like, as Watson first did, and bulged',
  lengths: 'had the right widths but met bump on bump',
  ends: 'gripped at the ends but bulged or pinched where two long or two short pieces met',
  guess: 'failed both ways, too wide or narrow and bump on bump',
};
// the verdict, in words. s = { z1, z2: the two zipped ladders }; the second is the one that scores
function verdict(s) {
  const z1 = s.z1, z2 = s.z2, k = reading(z2), lines = [];
  const rule = 'a long piece needs a short one, and a bump needs a dent. That leaves only A with T and G with C.';
  if (k === 'both' && z1.held === z1.n) lines.push('You had it from the start: ' + rule + ' Both ladders held on every rung. Someone pinning pieces at random almost never manages that.');
  else if (k === 'both') lines.push('Your first ladder ' + FIRST[reading(z1)] + '. Your second held on every rung. You found what Watson found on the morning of 28 February: ' + rule);
  else {
    const better = score(z2) > score(z1) ? 'Better than your first ladder, but not there yet. ' : '';
    if (k === 'like') lines.push(better + 'You paired like with like, which was Watson\'s first idea too. It bulged for him as well. The answer: ' + rule);
    else if (k === 'lengths') lines.push(better + 'Every rung on your second ladder had the right width: one long piece, one short. But some ends met bump on bump. The ends are the other half of the clue: ' + rule);
    else if (k === 'ends') lines.push(better + 'Every end on your second ladder gripped. But some rungs were two long pieces or two short ones, and the rails bulged or pinched. The lengths are the other half of the clue: ' + rule);
    else lines.push(better + 'Your rungs failed both ways: too wide or too narrow, and bump on bump. That is what pinning without a rule looks like. The clue is in the pieces: ' + rule);
  }
  lines.push('And this is why it matters. Pull such a ladder apart and each half can take only one piece in each gap: one ladder becomes two, letter for letter the same. Below, your second ladder' + (z2.held === z2.n ? '' : ' with its loose rungs fixed') + ', copied and twisted into the real shape.');
  lines.push('Watson and Crick, 1953: one chain fixes the other. That is why DNA always holds as much A as T and as much G as C, and it "immediately suggests a possible copying mechanism".');
  return lines;
}

const api = { CONFIG, KEYS, rng, fit, contact, partnersOf, partnerOf, drawGame, rungOf, zip, complete, counts, chargaff,
  copySpots, copyByRule, scoreCopy, reading, score, helixPoint, howMany, verdict };
if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.MECH = api;
})(typeof window !== 'undefined' ? window : this);
