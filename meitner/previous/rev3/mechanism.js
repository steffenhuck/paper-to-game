// Meitner's Drop: the mechanism. The single source of truth; inlined verbatim into the HTML by build.py.
// Runs unchanged in Node (module.exports) and in the browser (globals). No DOM in here.
// Mechanism kind: TOY, built to illustrate the argument of Meitner & Frisch, Nature 143, 239-240 (1939).
// Every number below is tagged with its source in the paper (page/sentence), or marked as ours.

var CONFIG = {
  // --- the drops (Z protons, N neutrons after the neutron is captured) ---
  URANIUM: { id: 'U', name: 'uranium', Z: 92, N: 147 },     // Z = 92, p. 239; 238U + n = 239 (p. 240, "239U"), so N = 147
  THORIUM: { id: 'Th', name: 'thorium', Z: 90, N: 143 },    // p. 239, thorium bombarded with neutrons; 232Th + n = 233 (common knowledge, not in the paper)
  LEAD:    { id: 'Pb', name: 'lead', Z: 82, N: 126 },       // opener only; 208Pb, the heaviest stable nucleus (not in the paper; a comparison drop)
  IMAGINED:{ id: 'X', name: 'an imagined drop', Z: 100, N: 154, imagined: true }, // p. 239: surface tension "may become zero for atomic numbers of the order of 100"; A = 254 extrapolated by us

  // --- the blast: kinetic energy of two touching charged spheres, "as calculated from nuclear radius and charge" (p. 239) ---
  E2_MEV_FM: 1.44,          // e^2 in MeV*fm, a physical constant
  R0_FM: 1.55,              // nuclear radius constant r0 (R = r0 * A^1/3), OURS: fitted so the equal split of 239U gives the paper's "c. 200 Mev" (p. 239); 1939 values ran 1.4-1.6 fm
  PAPER_E_MEV: 200,         // p. 239: "a total kinetic energy of c. 200 Mev"
  PROTON_MEV: 938,          // proton rest energy, physical constant; used only to say the lost weight in protons (p. 239: available from the packing fraction)

  // --- the climb: beta decay toward the valley of stability ---
  VALLEY_A: 1.98, VALLEY_B: 0.0155,  // Z*(A) = A / (1.98 + 0.0155 A^2/3), the semi-empirical valley of stability; OURS: the paper says only that the neutron/proton ratio "will tend to readjust itself by beta decay" (p. 239)

  // --- the skin: a charged drop's surface tension, lowered by its charge (p. 239) ---
  CRIT_Z2A: 39.4,           // OURS: Z^2/A at which the skin is gone, set so that it vanishes at Z = 100, A = 254 (p. 239: "of the order of 100"); Bohr & Wheeler later put it near 48
  SKIN_BARELY: 0.14,        // OURS: below this fraction of skin a drop necks and barely holds (uranium: 0.10); lead has 0.18
  SKIN_GONE: 0.03,          // OURS: below this the drop falls apart unprovoked

  // --- the pinch ---
  MIN_PIECE: 28,            // OURS: smallest piece the pinch allows; the paper discusses only "two nuclei of roughly equal size" (p. 239) and sets alpha-like chips aside via Gamow
  UNEVEN: 24,               // OURS: a pinch whose pieces differ by this many protons or more is called uneven in the verdict

  // --- play ---
  NEUTRONS_U: 4,            // OURS: three suffice when every pinch goes through (a pinch near 56, a pinch near 43, a hold); one spare for a pinch the skin pulls back (rev. 2)
  ODDS_HALF: 7.5,           // OURS (rev. 2): how far from the middle (in protons) a pinch must sit for the drop to split one time in two; the paper: "two nuclei of roughly equal size ... perhaps partly on chance" (p. 239)
  ODDS_FLAT: 3,             // OURS (rev. 2): a pinch within this many protons of the middle always goes through ("roughly equal size")
  ODDS_POWER: 2.5,          // OURS (rev. 2): how fast the odds fall off beyond that: p = 1 / (1 + ((a - FLAT) / (HALF - FLAT))^POWER), a = distance from the middle
  NEUTRONS_TH: 3,           // OURS: one thing to find; thorium's two tubes are lit only from pinches the skin pulls back about half the time, so three tries (rev. 2)

  // --- the chemists' shelf: what Hahn and Strassmann found, filed where the 1939 table put it ---
  // cellZ: the cell the chemists filed it in; col: the column (0-17) any landing piece lights it from; byHold: lit only by the drop that holds together;
  // wait: what the tube's card on the shelf says before it is explained (OURS, rev. 3); once explained the card says what the body really is (tubeAnswer)
  TUBES_U: [
    { id: 'u24', label: 'like uranium, 24 min', wait: 'uranium, 24 min', filed: 'uranium itself', cellZ: 92, col: 5, byHold: true,
      src: 'p. 240: the 24 min body chemically identified with uranium is probably really 239U, formed by a resonance process' },
    { id: 'eRe', label: 'like rhenium', wait: '93 · like rhenium', filed: 'eka-rhenium, element 93', cellZ: 93, col: 6, src: 'p. 240 names eka-rhenium; ref 2' },
    { id: 'eOs', label: 'like osmium', wait: '94 · like osmium', filed: 'eka-osmium, element 94', cellZ: 94, col: 7, src: 'p. 239: "eka-osmium (Z = 94) rather than osmium (Z = 76) or ruthenium (Z = 44)"' },
    { id: 'eIr', label: 'like iridium', wait: '95 · like iridium', filed: 'eka-iridium, element 95', cellZ: 95, col: 8, src: 'context: the 1937 scheme of ref 2 (Meitner, Hahn & Strassmann); the paper says "six ... assigned to elements beyond uranium"' },
    { id: 'ePt', label: 'like platinum', wait: '96 · like platinum', filed: 'eka-platinum, element 96', cellZ: 96, col: 9, src: 'context: ref 2' },
    { id: 'eAu', label: 'like gold', wait: '97 · like gold', filed: 'eka-gold, element 97', cellZ: 97, col: 10, src: 'context: ref 2' },
    { id: 'ba', label: 'like barium', wait: 'like barium', filed: 'barium', cellZ: 56, col: 1, src: 'p. 239, refs 4-5: impossible to separate from barium; at least three such bodies' },
    { id: 'la', label: 'like lanthanum', wait: 'like lanthanum', filed: 'lanthanum', cellZ: 57, col: 2, src: 'p. 239, ref 5: the barium-lanthanum(-cerium) chains' }
  ],
  TUBES_TH: [
    { id: 'ra', label: 'like radium', wait: 'like radium', filed: 'radium', cellZ: 88, col: 1, src: 'p. 239, ref 8: activities from thorium ascribed to radium isotopes' },
    { id: 'ac', label: 'like actinium', wait: 'like actinium', filed: 'actinium', cellZ: 89, col: 2, src: 'p. 239, ref 8: ... and actinium isotopes' }
  ],

  // --- the paper's own chains, for the calibration check ---
  PAPER_CHAINS: [
    { from: 36, reaches: 40, words: 'krypton ... through rubidium, strontium and yttrium to zirconium (p. 239)' },
    { from: 56, reaches: 58, words: 'barium-lanthanum-cerium chains (p. 239)' },
    { from: 43, reaches: 48, words: 'masurium isotopes (Z = 43) decaying through ruthenium, rhodium, palladium and silver into cadmium (p. 239)' }
  ],

  // element names, Z = 19..97, as the 1939 table had them (43 masurium, now technetium; 61, 85, 87 unnamed or just found; 93-97 the chemists' eka-names)
  NAMES: { 19: 'potassium', 20: 'calcium', 21: 'scandium', 22: 'titanium', 23: 'vanadium', 24: 'chromium', 25: 'manganese', 26: 'iron', 27: 'cobalt', 28: 'nickel', 29: 'copper', 30: 'zinc', 31: 'gallium', 32: 'germanium', 33: 'arsenic', 34: 'selenium', 35: 'bromine', 36: 'krypton',
    37: 'rubidium', 38: 'strontium', 39: 'yttrium', 40: 'zirconium', 41: 'niobium', 42: 'molybdenum', 43: 'masurium', 44: 'ruthenium', 45: 'rhodium', 46: 'palladium', 47: 'silver', 48: 'cadmium', 49: 'indium', 50: 'tin', 51: 'antimony', 52: 'tellurium', 53: 'iodine', 54: 'xenon',
    55: 'caesium', 56: 'barium', 57: 'lanthanum', 58: 'cerium', 59: 'praseodymium', 60: 'neodymium', 61: 'element 61', 62: 'samarium', 63: 'europium', 64: 'gadolinium', 65: 'terbium', 66: 'dysprosium', 67: 'holmium', 68: 'erbium', 69: 'thulium', 70: 'ytterbium', 71: 'lutetium',
    72: 'hafnium', 73: 'tantalum', 74: 'tungsten', 75: 'rhenium', 76: 'osmium', 77: 'iridium', 78: 'platinum', 79: 'gold', 80: 'mercury', 81: 'thallium', 82: 'lead', 83: 'bismuth', 84: 'polonium', 85: 'element 85', 86: 'radon',
    87: 'element 87', 88: 'radium', 89: 'actinium', 90: 'thorium', 91: 'protactinium', 92: 'uranium', 93: 'eka-rhenium', 94: 'eka-osmium', 95: 'eka-iridium', 96: 'eka-platinum', 97: 'eka-gold' },
  SYMBOLS: { 19: 'K', 20: 'Ca', 21: 'Sc', 22: 'Ti', 23: 'V', 24: 'Cr', 25: 'Mn', 26: 'Fe', 27: 'Co', 28: 'Ni', 29: 'Cu', 30: 'Zn', 31: 'Ga', 32: 'Ge', 33: 'As', 34: 'Se', 35: 'Br', 36: 'Kr',
    37: 'Rb', 38: 'Sr', 39: 'Y', 40: 'Zr', 41: 'Nb', 42: 'Mo', 43: 'Ma', 44: 'Ru', 45: 'Rh', 46: 'Pd', 47: 'Ag', 48: 'Cd', 49: 'In', 50: 'Sn', 51: 'Sb', 52: 'Te', 53: 'I', 54: 'Xe',
    55: 'Cs', 56: 'Ba', 57: 'La', 58: 'Ce', 59: 'Pr', 60: 'Nd', 61: '61', 62: 'Sm', 63: 'Eu', 64: 'Gd', 65: 'Tb', 66: 'Dy', 67: 'Ho', 68: 'Er', 69: 'Tm', 70: 'Yb', 71: 'Lu',
    72: 'Hf', 73: 'Ta', 74: 'W', 75: 'Re', 76: 'Os', 77: 'Ir', 78: 'Pt', 79: 'Au', 80: 'Hg', 81: 'Tl', 82: 'Pb', 83: 'Bi', 84: 'Po', 85: '85', 86: 'Rn',
    87: '87', 88: 'Ra', 89: 'Ac', 90: 'Th', 91: 'Pa', 92: 'U', 93: '93', 94: '94', 95: '95', 96: '96', 97: '97' }
};

// ---------- the table as drawn in 1939: four rows (periods 4-7), eighteen columns; the rare earths collapsed into lanthanum's cell;
// thorium, protactinium and uranium under hafnium, tantalum and tungsten; 93-97 in the next five columns, dashed ----------
function cellOf(Z) {
  if (Z >= 19 && Z <= 36) return { row: 0, col: Z - 19 };
  if (Z >= 37 && Z <= 54) return { row: 1, col: Z - 37 };
  if (Z === 55) return { row: 2, col: 0 };
  if (Z === 56) return { row: 2, col: 1 };
  if (Z >= 57 && Z <= 71) return { row: 2, col: 2 };
  if (Z >= 72 && Z <= 86) return { row: 2, col: Z - 69 };
  if (Z >= 87 && Z <= 97) return { row: 3, col: Z - 87 };
  return null;
}
function isDashed(Z) { return Z >= 93; }           // elements nobody has ever seen
function nameOf(Z) { return CONFIG.NAMES[Z] || ('element ' + Z); }
function symbolOf(Z) { return CONFIG.SYMBOLS[Z] || String(Z); }

// ---------- the skin ----------
function skin(nuc) {                                // fraction of surface tension left, 0..1 (OURS, see CONFIG.CRIT_Z2A)
  var A = nuc.Z + nuc.N;
  return Math.max(0, 1 - (nuc.Z * nuc.Z / A) / CONFIG.CRIT_Z2A);
}
function skinClass(nuc) {                           // 'holds' | 'barely' | 'gone'
  var s = skin(nuc);
  return s < CONFIG.SKIN_GONE ? 'gone' : (s < CONFIG.SKIN_BARELY ? 'barely' : 'holds');
}

// ---------- the pinch ----------
function clampZ1(nuc, Z1) {
  var lo = CONFIG.MIN_PIECE, hi = nuc.Z - CONFIG.MIN_PIECE;
  return Math.max(lo, Math.min(hi, Math.round(Z1)));
}
function shareNeutrons(nuc, Z1) {                   // both pieces keep the drop's mix: N1 = N * Z1 / Z, rounded (deterministic; the paper allows "varying proportions")
  var N1 = Math.round(nuc.N * Z1 / nuc.Z);
  return [N1, nuc.N - N1];
}
function stableZ(A) { return CONFIG.VALLEY_A ? A / (CONFIG.VALLEY_A + CONFIG.VALLEY_B * Math.pow(A, 2 / 3)) : 0; }
function climb(Z, A) {                              // the path of cells a piece visits, first its landing cell, then one step right per beta decay
  var target = Math.round(stableZ(A)), path = [Z], z = Z;
  while (z < target && z < 97) { z += 1; path.push(z); }
  return path;
}
function blastMeV(Z1, A1, Z2, A2) {                 // Coulomb energy of two touching spheres
  var R = CONFIG.R0_FM * (Math.pow(A1, 1 / 3) + Math.pow(A2, 1 / 3));
  return CONFIG.E2_MEV_FM * Z1 * Z2 / R;
}
function roundTen(x) { return Math.round(x / 10) * 10; }

// ---------- the odds (rev. 2): the skin fights an uneven pinch ----------
function asym(nuc, Z1) { return Math.abs(clampZ1(nuc, Z1) - nuc.Z / 2); }
function splitOdds(nuc, Z1) { var a = Math.max(0, asym(nuc, Z1) - CONFIG.ODDS_FLAT); return 1 / (1 + Math.pow(a / (CONFIG.ODDS_HALF - CONFIG.ODDS_FLAT), CONFIG.ODDS_POWER)); }
function oddsWords(p) {
  if (p >= 0.999) return 'every time';
  if (p >= 0.85) return 'nearly every time';
  if (p >= 0.62) return 'about three times in four';
  if (p >= 0.42) return 'about one time in two';
  if (p >= 0.29) return 'about one time in three';
  if (p >= 0.17) return 'about one time in four';
  if (p >= 0.08) return 'about one time in ten';
  return 'hardly ever';
}
// a small seeded generator (mulberry32), so a session's draws can be replayed by its seed
function makeRng(seed) {
  var t = (seed >>> 0) || 1;
  return function () { t = (t + 0x6D2B79F5) >>> 0; var r = Math.imul(t ^ (t >>> 15), 1 | t); r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r; return ((r ^ (r >>> 14)) >>> 0) / 4294967296; };
}
function rang(nuc, Z1) {                            // the pinch failed: the skin pulled the drop back; it kept the neutron, as in a hold
  var h = hold(nuc); h.kind = 'rang'; h.Z1 = clampZ1(nuc, Z1); h.Z2 = nuc.Z - h.Z1; h.uneven = Math.abs(h.Z1 - h.Z2) >= CONFIG.UNEVEN; return h;
}

function split(nuc, Z1) {
  Z1 = clampZ1(nuc, Z1);
  var Z2 = nuc.Z - Z1, Ns = shareNeutrons(nuc, Z1);
  var A1 = Z1 + Ns[0], A2 = Z2 + Ns[1];
  var E = blastMeV(Z1, A1, Z2, A2);
  return {
    kind: 'split', Z1: Z1, Z2: Z2,
    pieces: [ { Z: Z1, N: Ns[0], A: A1, path: climb(Z1, A1) }, { Z: Z2, N: Ns[1], A: A2, path: climb(Z2, A2) } ],
    energyMeV: E, energyShown: roundTen(E),
    lostProtons: E / CONFIG.PROTON_MEV,             // the weight the two pieces lose between them, in protons (E = mc^2 on the paper's 200 Mev)
    uneven: Math.abs(Z1 - Z2) >= CONFIG.UNEVEN
  };
}
function hold(nuc) {                                // the drop takes the neutron in and rings evenly: 239U (233Th), then one beta step
  var A = nuc.Z + nuc.N;
  return { kind: 'hold', pieces: [ { Z: nuc.Z, N: nuc.N, A: A, path: climb(nuc.Z, A), quiet: true } ], energyMeV: 0, energyShown: 0 };
}

// ---------- the shelf ----------
// Which tubes a move lights, and from which cell. A tube lights when a split piece lands in or climbs into its column (any row);
// a byHold tube lights only when the drop it stands in holds together.
function lightTubes(move, tubes, nucZ) {
  var lit = [];
  tubes.forEach(function (t) {
    if (t.byHold) {
      if ((move.kind === 'hold' || move.kind === 'rang') && nucZ === t.cellZ) lit.push({ id: t.id, atZ: nucZ, piece: 0 });
      return;
    }
    if (move.kind !== 'split') return;
    for (var p = 0; p < move.pieces.length; p++) {
      var path = move.pieces[p].path;
      for (var i = 0; i < path.length; i++) {
        var c = cellOf(path[i]);
        if (c && c.col === t.col && !isDashed(path[i])) { lit.push({ id: t.id, atZ: path[i], piece: p, step: i }); return; }
      }
    }
  });
  return lit;
}
function tubeById(tubes, id) { for (var i = 0; i < tubes.length; i++) if (tubes[i].id === id) return tubes[i]; return null; }

// ---------- a stage: one drop, one shelf, a budget of neutrons ----------
function newStage(nuc, tubes, neutrons, seed) {
  return { nuc: nuc, tubes: tubes, neutrons: neutrons, used: 0, moves: [], lit: {}, seed: seed === undefined ? 1 : seed, rng: makeRng(seed === undefined ? 1 : seed) };
}
function stageDone(st) {
  var all = st.tubes.every(function (t) { return st.lit[t.id]; });
  return all || st.used >= st.neutrons;
}
function play(st, action) {                         // action: {kind:'split', Z1} | {kind:'hold'}; returns the move with what it lit (new tubes only)
  if (stageDone(st)) return null;
  var move;
  if (action.kind === 'hold') move = hold(st.nuc);
  else {
    var p = splitOdds(st.nuc, action.Z1), u = st.rng();
    move = u < p ? split(st.nuc, action.Z1) : rang(st.nuc, action.Z1);
    move.odds = p; move.draw = u;
  }
  var lit = lightTubes(move, st.tubes, st.nuc.Z);
  move.lit = lit.filter(function (l) { return !st.lit[l.id]; });
  move.relit = lit.filter(function (l) { return st.lit[l.id]; });
  move.lit.forEach(function (l) { st.lit[l.id] = l; });
  move.lookalikes = lookalikes(move, st.tubes);
  st.moves.push(move); st.used += 1;
  return move;
}
// a piece that stands in a tube's column but is not the element on the tube: the chemists could not have told them apart (p. 239, Sr-Y-Zr for Ba-La-Ce)
function m_cell(Z) { return cellOf(Z); }
function lookalikes(move, tubes) {
  var out = [];
  if (move.kind !== 'split') return out;
  move.pieces.forEach(function (pc, p) {
    pc.path.forEach(function (Z) {
      var c = cellOf(Z); if (!c || isDashed(Z)) return;
      tubes.forEach(function (t) { var tc = m_cell(t.cellZ); if (!t.byHold && t.col === c.col && Z !== t.cellZ && !(tc.row === c.row && tc.col === c.col)) out.push({ Z: Z, tube: t.id, piece: p }); });
    });
  });
  return out;
}

// ---------- words: the game's own voice after a move (rev. 3: short, plain, for a smart eleven-year-old) ----------
function endName(path) { return nameOf(path[path.length - 1]); }
function tubeAnswer(t, atZ) {                       // what a tube's card says once it is explained
  if (t.byHold) return '= uranium itself';
  var nm = nameOf(atZ);
  return (isDashed(t.cellZ) ? t.cellZ + ' = ' + nm : '= ' + nm + (atZ === t.cellZ ? ' itself' : ''));
}
function moveWords(st, move) {
  var T = st.tubes, lines = [], nuc = st.nuc;
  if (move.kind === 'hold' || move.kind === 'rang') {
    var pc = move.pieces[0], made = nuc.name + '-' + pc.A;
    if (move.kind === 'rang') lines.push('You pinched at ' + move.Z1 + ' | ' + move.Z2 + '. This far from the middle a pinch goes through ' + oddsWords(move.odds) + ', and this time the skin pulled it back. No split: the drop kept the neutron and is ' + made + ' now.');
    else lines.push('The drop swallowed the neutron and just rings. No split. It is ' + made + ' now.');
    if (move.lit.length) lines.push('That explains the "uranium, 24 min" tube: it is uranium itself, made when a drop swallows a neutron instead of splitting' + (move.kind === 'rang' ? ' (this time by accident)' : '') + '.');
    else if (move.relit.length) lines.push('The "uranium, 24 min" tube was already explained. Nothing new.');
    else lines.push('No tube on this shelf is like that.');
    if (nuc.id === 'U') lines.push('Then it changes one cell, into element 93, and sits there quiet.');
    return lines;
  }
  var p0 = move.pieces[0], p1 = move.pieces[1];
  lines.push('You pinched at ' + move.Z1 + ' | ' + move.Z2 + (move.odds !== undefined && move.odds < 0.9 ? ' (it goes through ' + oddsWords(move.odds) + ', and this time it did)' : '') + ': a piece of ' + nameOf(p0.Z) + ' and a piece of ' + nameOf(p1.Z) + '.');
  lines.push(cap(nameOf(p0.Z)) + ' climbs to ' + endName(p0.path) + '. ' + cap(nameOf(p1.Z)) + ' climbs to ' + endName(p1.path) + '.');
  var ghosts = move.lit.filter(function (l) { return isDashed(tubeById(T, l.id).cellZ); });
  if (move.lit.length) {
    var parts = move.lit.map(function (l) { var t = tubeById(T, l.id); return isDashed(t.cellZ) ? t.cellZ + ' is ' + nameOf(l.atZ) : '"' + t.label + '" is ' + nameOf(l.atZ); });
    lines.push((ghosts.length ? 'Explained, and the "new elements" come down: ' : 'Explained: ') + parts.join('; ') + '.');
  } else lines.push('No tube on the shelf is like any of these' + (move.relit.length ? ', apart from ones already explained' : '') + '.');
  var look = move.lookalikes.filter(function (k) { return move.lit.some(function (l) { return l.id === k.tube; }) || move.relit.some(function (l) { return l.id === k.tube; }); });
  if (look.length && !ghosts.length) {
    // one lookalike per tube: the piece that lit it if that piece is not the tube's own element, else the first in order of charge
    var litAt = {}; move.lit.concat(move.relit).forEach(function (l) { litAt[l.id] = l.atZ; });
    look.sort(function (a, b) { return (a.Z === litAt[a.tube] ? -1 : 0) - (b.Z === litAt[b.tube] ? -1 : 0) || a.Z - b.Z; });
    var seen = {}, nm = [], fd = [];
    look.forEach(function (k) { if (seen[k.tube]) return; seen[k.tube] = 1; nm.push(nameOf(k.Z)); fd.push(tubeById(T, k.tube).filed); });
    lines.push(cap(nm.join(' and ')) + (nm.length > 1 ? ' act' : ' acts') + ' like ' + fd.join(' and ') + ', so the chemists could not tell them apart.');
  }
  var u6 = move.pieces.some(function (pc) { return pc.path.some(function (Z) { var c = cellOf(Z); return c && c.col === 5 && Z < 92; }); });
  if (u6 && nuc.id === 'U' && !st.lit.u24) lines.push('Passing uranium\'s column does not make the 24-minute stuff: that needs a hold.');
  return lines;
}
function lostWords(p) {
  if (p > 0.18) return 'a fifth';
  if (p > 0.14) return 'a sixth';
  if (p > 0.11) return 'an eighth';
  return 'a tenth';
}
function cap(s) { return s.replace(/^./, function (c) { return c.toUpperCase(); }); }
function uniq(a) { return a.filter(function (x, i) { return a.indexOf(x) === i; }); }

// ---------- the verdict ----------
function countWord(n) { return ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight'][n] || String(n); }
function verdict(stU, stTh) {
  var TU = stU.tubes, eka = TU.filter(function (t) { return isDashed(t.cellZ); });
  var ekaDown = eka.filter(function (t) { return stU.lit[t.id]; }).length;
  var ekaLeft = eka.length - ekaDown;
  var baLa = ['ba', 'la'].filter(function (id) { return stU.lit[id]; }).length;
  var holdFound = !!stU.lit.u24;
  var allU = TU.every(function (t) { return stU.lit[t.id]; });
  var thLit = stTh ? stTh.tubes.filter(function (t) { return stTh.lit[t.id]; }).length : 0;
  var thAll = stTh ? thLit === stTh.tubes.length : false;
  var splits = stU.moves.filter(function (m) { return m.kind === 'split'; });
  var rangs = stU.moves.filter(function (m) { return m.kind === 'rang'; });
  var unevens = splits.concat(rangs).filter(function (m) { return m.uneven; });
  var fate = (ekaLeft === 0 ? (allU ? 'THE "NEW ELEMENTS" WERE NEVER THERE' : 'THE "NEW ELEMENTS" ARE GONE, BUT TUBES STILL WAIT') : (ekaLeft === 1 ? 'ONE "NEW ELEMENT" STILL STANDS' : countWord(ekaLeft).toUpperCase() + ' "NEW ELEMENTS" STILL STAND'));
  var paper = 'Uranium does not just chip. Hit by a neutron, it can pinch and split in two, like a drop whose skin has nearly given up, because its charge has almost cancelled its surface tension. The halves fly apart with a huge shove: far more than any ordinary chemical change. If one half is barium, the other is krypton. So the chemists\' "new elements" were very probably never there: they are middle-weight elements that behave the same in chemistry. The 24-minute stuff is uranium itself, after it swallowed a neutron. And thorium splits the same way.';
  var found = [];
  if (splits.length) found.push('Your splits: ' + splits.map(function (m) { return m.Z1 + ' | ' + m.Z2 + ' (' + nameOf(m.Z1) + ' and ' + nameOf(m.Z2) + ')'; }).join('; ') + '.');
  if (rangs.length) found.push('The skin pulled back ' + countWord(rangs.length) + ' of your pinches (' + rangs.map(function (m) { return m.Z1 + ' | ' + m.Z2; }).join(', ') + '). A pulled-back drop keeps its neutron, so ' + (rangs.length === 1 ? 'that neutron was' : 'those neutrons were') + ' spent without a split.');
  else if (splits.length) found.push('Every pinch went through.');
  if (baLa === 2) found.push('Barium and lanthanum: explained. Whichever piece did it, its partner was forced: the two halves always add up to 92, so barium (56) goes with krypton (36).');
  else if (baLa === 1) found.push('One of barium and lanthanum: explained; the other not.');
  else found.push('Barium and lanthanum: not explained. Barium coming out of uranium is the paper\'s first fact, and your pinches never made it.');
  if (ekaDown === eka.length) found.push('All five "new elements" came down into the middle of the table: ' + ekaNames(stU) + '.');
  else if (ekaDown) found.push(cap(countWord(ekaDown)) + ' of the five "new elements" came down (' + ekaNames(stU) + '); ' + countWord(ekaLeft) + ' still stand' + (ekaLeft === 1 ? 's' : '') + ' in the dashed row.');
  else found.push('None of the five "new elements" came down. They still stand in the dashed row as elements nobody has ever seen.');
  var holdHow = stU.lit.u24 && stU.moves.some(function (m) { return m.kind === 'hold'; }) ? 'hold' : (stU.lit.u24 ? 'rang' : null);
  found.push(holdHow === 'hold' ? 'You found the hold: the 24-minute stuff is a drop that swallowed its neutron, uranium-239.' : (holdHow === 'rang' ? 'The 24-minute stuff came to you by accident: a pinch the skin pulled back is a drop that kept its neutron, uranium-239.' : 'You never held the drop together, and no pinch was pulled back, so the 24-minute stuff is still unexplained.'));
  if (stTh) found.push(thAll ? 'Thorium: both tubes explained. Its "radium" and "actinium" are barium and lanthanum, or their column-mates.' : (thLit ? 'Thorium: one of its two tubes explained.' : 'Thorium: neither tube explained; its "radium" and "actinium" are still a mystery on your shelf.'));
  var nTxt = 'Neutrons: ' + countWord(stU.used) + ' on uranium' + (stTh ? ' and ' + countWord(stTh.used) + ' on thorium' : '') + '.';
  if (allU) nTxt += stU.used <= 3 ? ' Three is the fewest that can work.' : (rangs.length ? ' The skin took ' + (rangs.length === 1 ? 'one' : countWord(rangs.length)) + ' of them, which used up your spare.' : ' Three would have done.');
  found.push(nTxt);
  var part = [];
  if (allU && thAll) part.push('Nowhere that matters. Your shelf is the paper\'s shelf: every body the chemists found is a middle-weight element or uranium itself, and the only thing beyond uranium is a quiet element 93.');
  if (ekaLeft) part.push('The paper brings all five "new elements" down with one idea: a piece near masurium climbs through five columns. On your shelf ' + countWord(ekaLeft) + ' still stand' + (ekaLeft === 1 ? 's' : '') + ' beyond uranium.');
  if (baLa < 2) part.push('The paper starts from barium, the one fact the chemists were sure of. Your pinches did not make it.');
  if (!holdFound) part.push('The paper keeps one body as genuine uranium-239, made by a drop that held. You never had one hold.');
  if (unevens.length) part.push('You pinched far from the middle ' + countWord(unevens.length) + (unevens.length === 1 ? ' time' : ' times') + '. The paper speaks of "two nuclei of roughly equal size"; in this game the skin pulls such a pinch back more often than not.');
  if (stTh && !thAll) part.push('The paper suggests thorium splits like uranium and gives partly the same products. Your thorium pinches did not show it.');
  var stood = allU ? 'Nothing: the row beyond uranium is empty, as the paper leaves it, except one quiet element 93. Four years of "new elements" go back into the middle of the table, and the chemists\' barium is the ordinary barium it always was.' :
    (countWord(ekaLeft + (holdFound ? 0 : 1) + (2 - baLa)).replace(/^./, function (c) { return c.toUpperCase(); }) + ' of the chemists\' bodies would still be ' + (ekaLeft ? 'elements nobody has ever seen' : 'a mystery') + ', and their long chains of changes would still need "nuclear isomerism" to account for them. The drop would have split on your shelf, but the chemists\' table would not have been corrected.');
  return { fate: fate, paper: paper, found: found, part: part, stood: stood, allU: allU, ekaLeft: ekaLeft, holdFound: holdFound, thAll: thAll, seed: stU.seed };
}
function ekaNames(stU) {
  var out = [];
  stU.tubes.forEach(function (t) { if (isDashed(t.cellZ) && stU.lit[t.id]) out.push(t.cellZ + ' is ' + nameOf(stU.lit[t.id].atZ)); });
  return out.join(', ');
}

var MECH = { CONFIG: CONFIG, splitOdds: splitOdds, oddsWords: oddsWords, asym: asym, makeRng: makeRng, rang: rang, cellOf: cellOf, isDashed: isDashed, nameOf: nameOf, symbolOf: symbolOf, skin: skin, skinClass: skinClass, clampZ1: clampZ1, shareNeutrons: shareNeutrons, stableZ: stableZ, climb: climb, blastMeV: blastMeV, split: split, hold: hold, lightTubes: lightTubes, tubeById: tubeById, tubeAnswer: tubeAnswer, newStage: newStage, stageDone: stageDone, play: play, moveWords: moveWords, verdict: verdict, lookalikes: lookalikes };
if (typeof module !== 'undefined' && module.exports) module.exports = MECH;
