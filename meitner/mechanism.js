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
  MIN_PIECE: 1,             // OURS (rev. 4): the cut may go anywhere, 1 to 91; far out the odds are about nil (the paper discusses only "two nuclei of roughly equal size", p. 239, and sets alpha-like chips aside via Gamow)
  UNEVEN: 24,               // OURS: a pinch whose pieces differ by this many protons or more is called uneven in the verdict

  // --- play ---
  TRIES_GAME: 3,            // OURS (rev. 11): tries in the game as played: the five claims and the barium; a sure cut for the five, a riskier one for the barium
  NEUTRONS_U: 4,            // OURS: three suffice when every pinch goes through (a pinch near 56, a pinch near 43, a hold); one spare for a pinch the skin pulls back (rev. 2)
  ODDS_HALF: 7.5,           // OURS (rev. 2): how far from the middle (in protons) a pinch must sit for the drop to split one time in two; the paper: "two nuclei of roughly equal size ... perhaps partly on chance" (p. 239)
  ODDS_FLAT: 3,             // OURS (rev. 2): a pinch within this many protons of the middle always goes through ("roughly equal size")
  ODDS_POWER: 2.5,          // OURS (rev. 2): how fast the odds fall off beyond that: p = 1 / (1 + ((a - FLAT) / (HALF - FLAT))^POWER), a = distance from the middle
  NEUTRONS_TH: 3,           // OURS: one thing to find; thorium's two tubes are lit only from pinches the skin pulls back about half the time, so three tries (rev. 2)

  // --- the chemists' shelf: what Hahn and Strassmann found, filed where the 1939 table put it ---
  // cellZ: the cell the chemists filed it in; col: the column (0-17) any landing piece lights it from; byHold: lit only by the drop that holds together;
  // wait: what the tube's card on the shelf says before it is explained (OURS, rev. 3); once explained the card says what the body really is (tubeAnswer)
  TUBES_U: [
    { id: 'u24', short: '24 min', label: 'like uranium, 24 min', wait: 'uranium, 24 min', filed: 'uranium itself', cellZ: 92, col: 5, byHold: true,
      src: 'p. 240: the 24 min body chemically identified with uranium is probably really 239U, formed by a resonance process' },
    { id: 'eRe', short: '93', label: 'like rhenium', wait: '93 · like rhenium', filed: 'eka-rhenium, element 93', cellZ: 93, col: 6, src: 'p. 240 names eka-rhenium; ref 2' },
    { id: 'eOs', short: '94', label: 'like osmium', wait: '94 · like osmium', filed: 'eka-osmium, element 94', cellZ: 94, col: 7, src: 'p. 239: "eka-osmium (Z = 94) rather than osmium (Z = 76) or ruthenium (Z = 44)"' },
    { id: 'eIr', short: '95', label: 'like iridium', wait: '95 · like iridium', filed: 'eka-iridium, element 95', cellZ: 95, col: 8, src: 'context: the 1937 scheme of ref 2 (Meitner, Hahn & Strassmann); the paper says "six ... assigned to elements beyond uranium"' },
    { id: 'ePt', short: '96', label: 'like platinum', wait: '96 · like platinum', filed: 'eka-platinum, element 96', cellZ: 96, col: 9, src: 'context: ref 2' },
    { id: 'eAu', short: '97', label: 'like gold', wait: '97 · like gold', filed: 'eka-gold, element 97', cellZ: 97, col: 10, src: 'context: ref 2' },
    { id: 'ba', short: 'barium', label: 'like barium', wait: 'like barium', filed: 'barium', cellZ: 56, col: 1, src: 'p. 239, refs 4-5: impossible to separate from barium; at least three such bodies' },
    { id: 'la', short: 'lanthanum', label: 'like lanthanum', wait: 'like lanthanum', filed: 'lanthanum', cellZ: 57, col: 2, src: 'p. 239, ref 5: the barium-lanthanum(-cerium) chains' }
  ],
  TUBES_TH: [
    { id: 'ra', short: 'radium', label: 'like radium', wait: 'like radium', filed: 'radium', cellZ: 88, col: 1, src: 'p. 239, ref 8: activities from thorium ascribed to radium isotopes' },
    { id: 'ac', short: 'actinium', label: 'like actinium', wait: 'like actinium', filed: 'actinium', cellZ: 89, col: 2, src: 'p. 239, ref 8: ... and actinium isotopes' }
  ],

  // --- the paper's own chains, for the calibration check ---
  PAPER_CHAINS: [
    { from: 36, reaches: 40, words: 'krypton ... through rubidium, strontium and yttrium to zirconium (p. 239)' },
    { from: 56, reaches: 58, words: 'barium-lanthanum-cerium chains (p. 239)' },
    { from: 43, reaches: 48, words: 'masurium isotopes (Z = 43) decaying through ruthenium, rhodium, palladium and silver into cadmium (p. 239)' }
  ],

  // element names, Z = 19..97, as the 1939 table had them (43 masurium, now technetium; 61, 85, 87 unnamed or just found; 93-97 the chemists' eka-names)
  NAMES: { 1: 'hydrogen', 2: 'helium', 3: 'lithium', 4: 'beryllium', 5: 'boron', 6: 'carbon', 7: 'nitrogen', 8: 'oxygen', 9: 'fluorine', 10: 'neon', 11: 'sodium', 12: 'magnesium', 13: 'aluminium', 14: 'silicon', 15: 'phosphorus', 16: 'sulphur', 17: 'chlorine', 18: 'argon',
    19: 'potassium', 20: 'calcium', 21: 'scandium', 22: 'titanium', 23: 'vanadium', 24: 'chromium', 25: 'manganese', 26: 'iron', 27: 'cobalt', 28: 'nickel', 29: 'copper', 30: 'zinc', 31: 'gallium', 32: 'germanium', 33: 'arsenic', 34: 'selenium', 35: 'bromine', 36: 'krypton',
    37: 'rubidium', 38: 'strontium', 39: 'yttrium', 40: 'zirconium', 41: 'niobium', 42: 'molybdenum', 43: 'masurium', 44: 'ruthenium', 45: 'rhodium', 46: 'palladium', 47: 'silver', 48: 'cadmium', 49: 'indium', 50: 'tin', 51: 'antimony', 52: 'tellurium', 53: 'iodine', 54: 'xenon',
    55: 'caesium', 56: 'barium', 57: 'lanthanum', 58: 'cerium', 59: 'praseodymium', 60: 'neodymium', 61: 'element 61', 62: 'samarium', 63: 'europium', 64: 'gadolinium', 65: 'terbium', 66: 'dysprosium', 67: 'holmium', 68: 'erbium', 69: 'thulium', 70: 'ytterbium', 71: 'lutetium',
    72: 'hafnium', 73: 'tantalum', 74: 'tungsten', 75: 'rhenium', 76: 'osmium', 77: 'iridium', 78: 'platinum', 79: 'gold', 80: 'mercury', 81: 'thallium', 82: 'lead', 83: 'bismuth', 84: 'polonium', 85: 'element 85', 86: 'radon',
    87: 'element 87', 88: 'radium', 89: 'actinium', 90: 'thorium', 91: 'protactinium', 92: 'uranium', 93: 'eka-rhenium', 94: 'eka-osmium', 95: 'eka-iridium', 96: 'eka-platinum', 97: 'eka-gold' },
  SYMBOLS: { 1: 'H', 2: 'He', 3: 'Li', 4: 'Be', 5: 'B', 6: 'C', 7: 'N', 8: 'O', 9: 'F', 10: 'Ne', 11: 'Na', 12: 'Mg', 13: 'Al', 14: 'Si', 15: 'P', 16: 'S', 17: 'Cl', 18: 'Ar',
    19: 'K', 20: 'Ca', 21: 'Sc', 22: 'Ti', 23: 'V', 24: 'Cr', 25: 'Mn', 26: 'Fe', 27: 'Co', 28: 'Ni', 29: 'Cu', 30: 'Zn', 31: 'Ga', 32: 'Ge', 33: 'As', 34: 'Se', 35: 'Br', 36: 'Kr',
    37: 'Rb', 38: 'Sr', 39: 'Y', 40: 'Zr', 41: 'Nb', 42: 'Mo', 43: 'Ma', 44: 'Ru', 45: 'Rh', 46: 'Pd', 47: 'Ag', 48: 'Cd', 49: 'In', 50: 'Sn', 51: 'Sb', 52: 'Te', 53: 'I', 54: 'Xe',
    55: 'Cs', 56: 'Ba', 57: 'La', 58: 'Ce', 59: 'Pr', 60: 'Nd', 61: '61', 62: 'Sm', 63: 'Eu', 64: 'Gd', 65: 'Tb', 66: 'Dy', 67: 'Ho', 68: 'Er', 69: 'Tm', 70: 'Yb', 71: 'Lu',
    72: 'Hf', 73: 'Ta', 74: 'W', 75: 'Re', 76: 'Os', 77: 'Ir', 78: 'Pt', 79: 'Au', 80: 'Hg', 81: 'Tl', 82: 'Pb', 83: 'Bi', 84: 'Po', 85: '85', 86: 'Rn',
    87: '87', 88: 'Ra', 89: 'Ac', 90: 'Th', 91: 'Pa', 92: 'U', 93: '93', 94: '94', 95: '95', 96: '96', 97: '97' }
};

// ---------- the table as drawn in 1939: four rows (periods 4-7), eighteen columns; the rare earths collapsed into lanthanum's cell;
// thorium, protactinium and uranium under hafnium, tantalum and tungsten; 93-97 in the next five columns, dashed ----------
function cellOf(Z) {
  if (Z >= 1 && Z <= 18) return { row: -1, col: Z - 1, strip: true };   // rev. 4: the light elements, a thin strip above the table; they stand in no tube's column
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
function oddsLabel(p) {                              // rev. 4: the chance as a percent, for the bar and the lines
  if (p >= 0.995) return '100%';
  if (p < 0.01) return '<1%';
  return Math.round(p * 100) + '%';
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
    var first = null, exact = null;       // rev. 11: if a piece is the very element the tube is filed under (barium for the barium tube), that is what lights it
    for (var p = 0; p < move.pieces.length; p++) {
      var path = move.pieces[p].path;
      for (var i = 0; i < path.length; i++) {
        var c = cellOf(path[i]);
        if (c && !c.strip && c.col === t.col && !isDashed(path[i])) {
          var hit = { id: t.id, atZ: path[i], piece: p, step: i };
          if (!first) first = hit;
          if (path[i] === t.cellZ && !exact) exact = hit;
          break;
        }
      }
    }
    if (exact || first) lit.push(exact || first);
  });
  return lit;
}
function tubeById(tubes, id) { for (var i = 0; i < tubes.length; i++) if (tubes[i].id === id) return tubes[i]; return null; }

// ---------- what each outcome teaches (rev. 5: said before the cut, in the preview, and after it) ----------
var TEACH_GHOST = 'pieces from the middle can pass for new elements';
var TEACH = { u24: 'a neutron can just get caught: uranium-239', eRe: TEACH_GHOST, eOs: TEACH_GHOST, eIr: TEACH_GHOST, ePt: TEACH_GHOST, eAu: TEACH_GHOST,
  ba: 'barium comes out of uranium, with krypton as its partner (56 + 36 = 92)', la: 'barium comes out of uranium, with krypton as its partner (56 + 36 = 92)',
  ra: 'thorium splits too, into the same kind of pieces', ac: 'thorium splits too, into the same kind of pieces' };
function lessonText(ids, none) {
  var out = []; ids.forEach(function (id) { var t = TEACH[id]; if (t && out.indexOf(t) < 0) out.push(t); });
  return out.length ? out.join(', and ') : none;
}
function pctWords(label) { return label === '<1%' ? 'under 1%' : label; }
// the line under the table before you fire: what the cut lights and what you will learn, if it splits and if it fails
function previewWords(st, Z1) {
  var pv = preview(st, Z1), T = st.tubes, sure = pv.p >= 0.995;
  var claims = T.filter(function (t) { return isDashed(t.cellZ); }), hasBa = T.some(function (t) { return t.id === 'ba'; });
  var cl = pv.lights.filter(function (l) { return isDashed(tubeById(T, l.id).cellZ); }).map(function (l) { return tubeById(T, l.id).short; });
  var ba = pv.lights.some(function (l) { return l.id === 'ba'; });
  var ids = pv.lights.map(function (l) { return l.id; });
  var what = !cl.length ? 'explain none of the ' + countWord(claims.length) + ' "new elements"' : (cl.length === claims.length ? 'explain all ' + countWord(claims.length) + ' "new elements": ' : 'explain ' + (cl.length === 1 ? 'one "new element": ' : countWord(cl.length) + ' "new elements": ')) + (cl.length ? listAnd(cl) : '');
  if (hasBa) what += ba ? (cl.length ? ', and the barium' : ', but it would explain the barium') : (cl.length ? ', but not the barium' : ', and not the barium');
  var learn = ids.length ? ' <b>You will learn:</b> ' + lessonText(ids, '') + '.' : ' You would learn nothing new from it.';
  if (sure) return '<b>The uranium splits here for sure.</b> It would ' + what + '.' + learn;
  return '<b>The uranium splits here ' + pctWords(pv.label) + ' of the time.</b> If it does, it would ' + what + '.' + learn + (pv.failLights ? ' <b>Otherwise the cut fails</b> and lights the 24-min tube. <b>You will learn:</b> ' + TEACH.u24 + '.' : ' <b>Otherwise the cut fails</b> and nothing is explained.');
}
// after the cut: the one thing it showed
function lessonOf(st, move) {
  var ids = move.lit.map(function (l) { return l.id; });
  if (move.kind === 'split') return ids.length ? lessonText(ids, '') + '.' : 'nothing new this time. Try a different cut.';
  return ids.length ? lessonText(ids, '') + '.' : 'nothing new this time. The neutron is spent, but you now know a cut can fail.';
}
// before each cut: what to watch for on the first one, then what is still dark and where to look
function coachWords(st) {
  var left = st.tubes.filter(function (t) { return !st.lit[t.id]; });
  if (st.used === 0) return st.nuc.name === 'uranium' ?
    'You are Meitner and Frisch. The chemists found five "new elements", 93 to 97, and also barium, an ordinary element that nobody expected in uranium. Your idea: the uranium split in two.</p>' +
    '<p>A "new element" is explained when one of your pieces turns into an old element that acts just like it: the same column of the table, the same chemistry. Barium is explained when one of your pieces acts like barium.' :
    cap(st.nuc.name) + ' (' + st.nuc.Z + '): same game, two new tubes, three neutrons. A tube lights when one of your pieces ends up in its column. Drag the red line, then press Test this cut.';
  if (!left.length) return '';
  var eka = left.filter(function (t) { return isDashed(t.cellZ); }), mid = left.filter(function (t) { return !isDashed(t.cellZ) && !t.byHold; }), u24 = left.filter(function (t) { return t.byHold; });
  var parts = [];
  if (eka.length) parts.push(eka.length === left.length ? eka.map(function (t) { return t.short; }).join(', ') + ' (try the middle of the table, where a cut always works)' : 'the dashed tubes (try the middle, where a cut always works)');
  if (mid.length) parts.push(mid.map(function (t) { return t.short; }).join(' and ') + ' (try a little off the middle)');
  if (u24.length) parts.push('the 24-min tube (it lights when a cut fails, so risk a cut far from the middle)');
  return 'Still to explain: ' + parts.join('; ') + '.';
}

// What a cut at Z1 would do, before it is made (rev. 4: the bench shows this live): the chance, the pieces and their walks,
// the tubes it would light if it works, and the tube a failed cut would light (the drop keeps its neutron).
function preview(st, Z1) {
  var nuc = st.nuc, mv = split(nuc, Z1), p = splitOdds(nuc, mv.Z1);
  var lit = lightTubes(mv, st.tubes, nuc.Z), failTube = null;
  st.tubes.forEach(function (t) { if (t.byHold && !st.lit[t.id] && t.cellZ === nuc.Z) failTube = t.id; });
  return { Z1: mv.Z1, Z2: mv.Z2, p: p, label: oddsLabel(p), pieces: mv.pieces,
           lights: lit.filter(function (l) { return !st.lit[l.id]; }), again: lit.filter(function (l) { return st.lit[l.id]; }),
           failLights: (p < 0.995 && failTube) ? failTube : null };
}

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
      var c = cellOf(Z); if (!c || c.strip || isDashed(Z)) return;
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
function pieceLine(pc) {
  var steps = pc.path.length - 1;
  if (!steps) return cap(nameOf(pc.Z)) + ' stays as it is.';
  return cap(nameOf(pc.Z)) + ' changes ' + (steps === 1 ? 'once' : countWord(steps) + ' times') + ' and ends as ' + endName(pc.path) + '.';
}
function moveWords(st, move) {
  var T = st.tubes, lines = [], nuc = st.nuc;
  if (move.kind === 'hold' || move.kind === 'rang') {
    var pc = move.pieces[0], made = nuc.name + '-' + pc.A;
    if (move.kind === 'rang') lines.push('Cut at ' + move.Z1 + ' | ' + move.Z2 + ': it failed (the chance was ' + oddsLabel(move.odds) + '). The drop kept the neutron and is ' + made + ' now.');
    else lines.push('The drop caught the neutron and did not split. It is ' + made + ' now.');
    if (!T.some(function (t) { return t.byHold; })) lines.push('That explains nothing. Try a cut nearer the middle, where a cut always works.');
    else if (move.lit.length) lines.push('That lights the "24 min" tube: it is uranium itself.');
    else if (move.relit.length) lines.push('The "24 min" tube was already lit. Nothing new.');
    else lines.push('No tube on this shelf is like that.');
    return lines;
  }
  var p0 = move.pieces[0], p1 = move.pieces[1], same = p0.Z === p1.Z;
  lines.push('Cut at ' + move.Z1 + ' | ' + move.Z2 + (move.odds !== undefined && move.odds < 0.995 ? ' (chance ' + oddsLabel(move.odds) + ', and it worked)' : '') + ': ' + (same ? 'two pieces of ' + nameOf(p0.Z) : nameOf(p0.Z) + ' and ' + nameOf(p1.Z)) + '.');
  lines.push(pieceLine(p0) + ' ' + pieceLine(p1));
  var ghosts = move.lit.filter(function (l) { return isDashed(tubeById(T, l.id).cellZ); });
  if (move.lit.length) {
    var parts = move.lit.map(function (l) { var t = tubeById(T, l.id); return (isDashed(t.cellZ) ? t.cellZ : 'like ' + t.short) + ' = ' + nameOf(l.atZ); });
    lines.push('Explained: ' + parts.join('; ') + '.');
    if (ghosts.length) lines.push('So ' + (ghosts.length === 1 ? 'that "new element" is' : 'those "new elements" are') + ' ordinary elements from the middle of the table.');
  } else lines.push('None of the five is explained by these pieces' + (move.relit.length ? ' that was not explained already' : '') + '.');
  var look = move.lookalikes.filter(function (k) { return move.lit.some(function (l) { return l.id === k.tube; }) || move.relit.some(function (l) { return l.id === k.tube; }); });
  if (look.length && !ghosts.length) {
    var litAt = {}; move.lit.concat(move.relit).forEach(function (l) { litAt[l.id] = l.atZ; });
    look.sort(function (a, b) { return (a.Z === litAt[a.tube] ? -1 : 0) - (b.Z === litAt[b.tube] ? -1 : 0) || a.Z - b.Z; });
    var seen = {}, nm = [], fd = [];
    look.forEach(function (k) { if (seen[k.tube]) return; seen[k.tube] = 1; nm.push(nameOf(k.Z)); fd.push(tubeById(T, k.tube).filed); });
    lines.push(cap(nm.join(' and ')) + (nm.length > 1 ? ' act' : ' acts') + ' like ' + fd.join(' and ') + ', so the chemists could not tell them apart.');
  }
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
function claimTubes() { return CONFIG.TUBES_U.filter(function (t) { return isDashed(t.cellZ); }); }   // the five "new elements"
function gameTubes() { return claimTubes().concat(CONFIG.TUBES_U.filter(function (t) { return t.id === 'ba'; })); }   // rev. 11: the game as played: the five claims, and barium, the chemists' firm finding
function listAnd(a) { return a.length <= 1 ? (a[0] || '') : a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1]; }
// rev. 6: the verdict is a scoreboard (how many of the chemists' five "new elements" were taken away: by the player, by the paper)
// followed by a short story of the run, in plain sentences. No more four fixed sections.
function verdict(stU, stTh) {
  var TU = stU.tubes, eka = TU.filter(function (t) { return isDashed(t.cellZ); });
  var ekaDown = eka.filter(function (t) { return stU.lit[t.id]; }).length;
  var ekaLeft = eka.length - ekaDown;
  var chips = eka.map(function (t) { var l = stU.lit[t.id]; return { Z: t.cellZ, real: l ? nameOf(l.atZ) : null }; });
  var baLa = ['ba', 'la'].filter(function (id) { return stU.lit[id]; }).length;
  var holdFound = !!stU.lit.u24;
  var allU = TU.every(function (t) { return stU.lit[t.id]; });
  var thLit = stTh ? stTh.tubes.filter(function (t) { return stTh.lit[t.id]; }).length : 0;
  var thAll = stTh ? thLit === stTh.tubes.length : false;
  var splits = stU.moves.filter(function (m) { return m.kind === 'split'; });
  var caught = stU.moves.filter(function (m) { return m.kind === 'rang' || m.kind === 'hold'; });
  var rangs = stU.moves.filter(function (m) { return m.kind === 'rang'; });
  var unevens = splits.concat(rangs).filter(function (m) { return m.uneven; });
  var hasBaT = TU.some(function (t) { return t.id === 'ba'; }), baLit = !!stU.lit.ba;
  var fate = (ekaLeft === 0 ? (allU ? 'THE "NEW ELEMENTS" WERE NEVER THERE' : (hasBaT && !baLit ? 'THE "NEW ELEMENTS" ARE GONE, BUT THE BARIUM IS NOT EXPLAINED' : 'THE "NEW ELEMENTS" ARE GONE, BUT TUBES STILL WAIT')) : (ekaLeft === 1 ? 'ONE "NEW ELEMENT" STILL STANDS' : countWord(ekaLeft).toUpperCase() + ' "NEW ELEMENTS" STILL STAND'));
  var story = [];
  // 1. what the player did
  var cuts = splits.map(function (m) { return nameOf(m.Z1) + ' and ' + nameOf(m.Z2); });
  var p1 = splits.length ? 'You split the uranium into ' + cuts.join(', then into ') + '.' : 'None of your cuts split the drop.';
  var hasU24 = TU.some(function (t) { return t.byHold; });
  if (caught.length) p1 += ' ' + cap(countWord(caught.length)) + (caught.length === 1 ? ' cut' : ' cuts') + ' failed. When a cut fails the drop keeps its neutron and becomes uranium-239, so ' + (caught.length === 1 ? 'that try' : 'those tries') + ' explained nothing.';
  else if (splits.length) p1 += ' Every cut worked.';
  if (hasU24) p1 += holdFound ? ' That is what lit the 24-minute tube: a drop that has caught a neutron is still uranium, and the chemists had found that too.' : ' The 24-minute tube stayed dark. It only lights when a drop keeps its neutron, and none of yours did.';
  story.push(p1);
  // 2. barium, the one sure fact
  var hasBa = TU.some(function (t) { return t.id === 'ba' || t.id === 'la'; });
  if (hasBaT && !TU.some(function (t) { return t.id === 'la'; })) {
    var bz = baLit ? stU.lit.ba.atZ : null;
    story.push(baLit ? (bz === 56 ? 'Barium came out of your uranium, as it did for Hahn and Strassmann. Barium is an old element, but nobody had expected it there. If barium itself is one piece, the other has to be krypton (36), because the two pieces always add up to 92 (56 + 36).' :
      'A piece of ' + nameOf(bz) + ' came out of your uranium, and it acts just like barium, so the chemists would have taken it for barium. (The paper notes that some of the supposed barium may really be strontium.) Real barium would come with krypton as its partner, because 56 + 36 = 92.') :
      'Your cuts never made barium. Barium was the one fact the chemists were sure of, and it is where the paper starts: barium is an old element that nobody expected in uranium. Its partner would be krypton (36), because 56 + 36 = 92. Only cuts away from the middle make it, and those cuts can fail.');
  } else if (!hasBa) story.push('The clue was barium. Hahn and Strassmann had found it in the bombarded uranium. Barium is 56, and 56 + 36 = 92, so its partner would be krypton (36): a split in two.');
  else story.push(baLa === 2 ? 'Barium and lanthanum both came out of your uranium. When barium (56) comes out, its partner has to be krypton (36), because the two pieces always add up to 92. Barium was the one fact the chemists were sure of, and it is where the paper starts.' :
    baLa === 1 ? 'One of barium and lanthanum came out of your uranium; the other did not. Barium was the one fact the chemists were sure of, and it is where the paper starts. Its partner is always krypton (56 + 36 = 92).' :
    'Barium and lanthanum never came out of your uranium. Barium was the one fact the chemists were sure of, and it is where the paper starts. Its partner is always krypton (56 + 36 = 92).');
  // 3. the five "new elements"
  var idea = 'The paper takes all five away with one idea: a piece that starts near masurium changes five times, and so it passes through five columns.';
  story.push(ekaDown === eka.length ? 'All five of the chemists\' "new elements" turned out to be old ones: ' + ekaNames(stU) + '. A piece from the middle of the table changes a few times after the split. On the way it stands in the same column as an element the chemists thought was new, and a tube cannot tell two elements of one column apart.' :
    ekaDown ? cap(countWord(ekaDown)) + ' of the five "new elements" turned out to be old ones: ' + ekaNames(stU) + '. ' + cap(countWord(ekaLeft)) + (ekaLeft === 1 ? ' still stands' : ' still stand') + ' in the dashed row on your shelf, an element nobody has ever seen. ' + idea :
    'None of the five "new elements" turned out to be old ones. They still stand in the dashed row on your shelf, elements nobody has ever seen. ' + idea);
  // 4. thorium
  if (stTh) story.push(thAll ? 'Thorium split the same way. Its "radium" and "actinium" turned out to be barium and lanthanum, or their column-mates.' : (thLit ? 'Thorium: one of its two tubes lit, the other did not. The paper suggests that thorium splits like uranium and gives partly the same products.' : 'Thorium: neither of its two tubes lit. The paper suggests that thorium splits like uranium and gives partly the same products; your thorium cuts did not show it.'));
  // 5. where the player parted from the paper, and the neutrons
  if (unevens.length) story.push('You cut far from the middle ' + countWord(unevens.length) + (unevens.length === 1 ? ' time' : ' times') + '. The paper speaks of "two nuclei of roughly equal size"; in this game such a cut fails more often than not.');
  var nTxt;
  if (!hasU24 && !stTh) {
    nTxt = 'You used ' + countWord(stU.used) + (stU.used === 1 ? ' try' : ' tries') + ' of ' + countWord(stU.neutrons) + '.';
    if (allU) nTxt += hasBaT ? (stU.used === 1 ? ' One cut was enough.' : ' The sure cuts near the middle explain the five. The barium needs a riskier cut away from the middle: that is the trade-off.') : (stU.used === 1 ? ' One cut was enough. That is the point: one split explains all five.' : ' One well-chosen cut near the middle is enough to explain all five. That is the point.');
  } else {
    nTxt = 'You used ' + countWord(stU.used) + ' neutrons on uranium' + (stTh ? ' and ' + countWord(stTh.used) + ' on thorium' : '') + '.';
    if (allU) nTxt += stU.used <= 3 ? ' Three is the fewest that can light all eight tubes.' : (rangs.length ? ' Failed cuts took ' + countWord(rangs.length) + ' of them, which used up your spare.' : ' Three would have done.');
  }
  story.push(nTxt);
  // 6. what Meitner and Frisch saw
  story.push('<b>What Meitner and Frisch saw.</b> Uranium does not just chip. A neutron can make it split in two, like a drop that barely holds together, and the halves fly apart with a huge shove. They had no new element to show for it: they took all five away. They left one thing open: a uranium nucleus that simply catches a neutron may turn into a real element 93, the one element beyond uranium their paper allows. Meitner had found a real element before, protactinium (91), together with Otto Hahn in 1918. This time she found that five were not there.');
  return { barium: { present: hasBaT, lit: baLit, name: baLit ? nameOf(stU.lit.ba.atZ) : null }, fate: fate, chips: chips, claimed: eka.length, you: ekaDown, paperDown: eka.length, story: story, allU: allU, ekaLeft: ekaLeft, holdFound: holdFound, thAll: thAll, seed: stU.seed };
}
function ekaNames(stU) {
  var out = [];
  stU.tubes.forEach(function (t) { if (isDashed(t.cellZ) && stU.lit[t.id]) out.push(t.cellZ + ' is ' + nameOf(stU.lit[t.id].atZ)); });
  return out.join(', ');
}

var MECH = { CONFIG: CONFIG, claimTubes: claimTubes, gameTubes: gameTubes, splitOdds: splitOdds, oddsWords: oddsWords, oddsLabel: oddsLabel, preview: preview, previewWords: previewWords, lessonOf: lessonOf, coachWords: coachWords, TEACH: TEACH, asym: asym, makeRng: makeRng, rang: rang, cellOf: cellOf, isDashed: isDashed, nameOf: nameOf, symbolOf: symbolOf, skin: skin, skinClass: skinClass, clampZ1: clampZ1, shareNeutrons: shareNeutrons, stableZ: stableZ, climb: climb, blastMeV: blastMeV, split: split, hold: hold, lightTubes: lightTubes, tubeById: tubeById, tubeAnswer: tubeAnswer, newStage: newStage, stageDone: stageDone, play: play, moveWords: moveWords, verdict: verdict, lookalikes: lookalikes };
if (typeof module !== 'undefined' && module.exports) module.exports = MECH;
