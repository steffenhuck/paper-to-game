// Snow's Cloudy Glass (third build) — mechanism. The single source of truth: plain functions, no DOM; every rule that
// affects an outcome (the map, the deaths, a test, the evidence, the doctor's line, the sentence, the verdict's bands and
// words) lives here. Runs unchanged in Node (module.exports) and in the browser (window.SNOW).
//
// Mechanism kind: RECONSTRUCTED. The map is six real subdistricts of John Snow (1856), "Cholera and the Water Supply in
// the South Districts of London in 1854", ordered from the river inland, six houses each; each row's share of houses on
// the Southwark & Vauxhall Company's water is the row's in Table I or II, the pipes are placed at random within the row,
// and each house wears crape at the paper's deaths-over-houses rate for its water (Table I totals, first seven weeks),
// drawn ten times as thick. The tests, the doctor, the floors and the sentence are ours and tagged as such. Source: the
// Project Gutenberg transcription of the typeset text (eBook 66507).
(function (root) {
  'use strict';

  var CONFIG = {
    PER_ROW: 6,            // our choice: houses per street; six rows of six fit a phone
    TESTS: 8,              // our choice: a morning's tests
    COMPRESSION: 10,       // our choice: deaths drawn ten times as thick as the seven-week rates
    DEATHS_BROWN: 507, HOUSES_BROWN: 16038, // Table I totals: Southwark & Vauxhall, first seven weeks, twenty-one mixed subdistricts
    DEATHS_BLUE: 98, HOUSES_BLUE: 20554,    // Table I totals: Lambeth Co.
    CRAPE_MIN: 5, CRAPE_MAX: 10, // our choice: floors on crape over the map, so there is something to point at and not too much
    // The rows, riverside first. housesBrown/housesBlue: "Number of houses ... supplied in 1854" by each company, Table I
    // (Table II for Clapham). side and phrase: p. 7 ("crowded, dirty, and very poor subdistricts of Lambeth Church, first
    // part, and Waterloo, first part, lying by the river side"; "thinly peopled, and comparatively genteel subdistricts of
    // Clapham and Battersea"); Kennington's phrase and the middle rows' are ours.
    ROWS: [
      { key: 'waterloo', name: 'Waterloo Road', side: 'river', kind: 'crowded', housesBrown: 438, housesBlue: 1474, phrase: 'by the river; crowded, poor', source: 'Table I, Lambeth 1. Waterloo, part 1' },
      { key: 'lambethchurch', name: 'Lambeth Church', side: 'river', kind: 'crowded', housesBrown: 415, housesBlue: 2117, phrase: 'by the river; crowded, poor', source: 'Table I, Lambeth 3. Lambeth church, pt. 1' },
      { key: 'trinity', name: 'Trinity', side: 'middle', kind: 'plain', housesBrown: 1661, housesBlue: 1372, phrase: 'the middle of town', source: 'Table I, Newington 1. Trinity' },
      { key: 'borough', name: 'Borough Road', side: 'middle', kind: 'plain', housesBrown: 1176, housesBlue: 878, phrase: 'the middle of town', source: 'Table I, St. George Southwark 2. Borough Road' },
      { key: 'kennington', name: 'Kennington', side: 'inland', kind: 'genteel', housesBrown: 2586, housesBlue: 444, phrase: 'inland; gardens, railings', source: 'Table I, Lambeth 5. Kennington, part 1' },
      { key: 'clapham', name: 'Clapham', side: 'inland', kind: 'genteel', housesBrown: 1106, housesBlue: 22, phrase: 'inland; thinly peopled, genteel', source: 'Table II, Wandsworth 1. Clapham' }
    ],
    PAPER: {
      first4: { deathsBrown: 286, deathsBlue: 14, popBrown: 266516, popBlue: 173748, perBrown: 107, perBlue: 8 }, // p. 4, per 100,000
      table1: { deathsBrown: 507, deathsBlue: 98, housesBrown: 16038, housesBlue: 20554, popBrown: 107290, popBlue: 143901, perBrown: 47.2, perBlue: 6.8 },
      next3: { ratio: 8 }, last10: { perBrown: 916, perBlue: 180 }, whole: { perBrown: 160, perBlue: 27 }, board: { perBrown: 125, perBlue: 37 }, // pp. 4–7
      saltBrown: 40, saltBlue: 0.95 // p. 3, grains of common salt per gallon
    },
    AGREE_LO: 3.5 // our choice: a same-row ratio at least this counts as the paper's gap (Snow's subdistrict ratios run 3.4 to 32)
  };
  var C = CONFIG;

  function makeRng(seed) {
    var a = (seed >>> 0) || 1;
    return function () { a = (a + 0x6D2B79F5) | 0; var t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }
  function shuffle(rng, xs) { var a = xs.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rng() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }

  // ---------------- the map ----------------
  function rate(water) { return water === 'brown' ? C.DEATHS_BROWN / C.HOUSES_BROWN : C.DEATHS_BLUE / C.HOUSES_BLUE; }
  function perHouseProb(water, k) { var p = rate(water) * (k === undefined ? C.COMPRESSION : k); return p > 1 ? 1 : p; }
  function brownCount(row) { return Math.round(row.housesBrown / (row.housesBrown + row.housesBlue) * C.PER_ROW); }
  function isInland(r) { return C.ROWS[r].side === 'inland'; }
  function isRiver(r) { return C.ROWS[r].side === 'river'; }
  function makeMap(seed, opts) {
    opts = opts || {};
    var rng = makeRng(seed), rows, tries = 0, ok;
    do {
      rows = C.ROWS.map(function (row, r) {
        var nb = brownCount(row), waters = [];
        for (var i = 0; i < C.PER_ROW; i++) waters.push(i < nb ? 'brown' : 'blue');
        waters = shuffle(rng, waters); // "a single house often had a different supply from that on either side" (p. 3)
        return waters.map(function (w, i) { return { r: r, i: i, water: w, crape: rng() < perHouseProb(w, opts.compression), tested: false }; });
      });
      var all = [].concat.apply([], rows);
      var crape = all.filter(function (h) { return h.crape; }).length;
      var inland = all.filter(function (h) { return h.crape && isInland(h.r); }).length, river = all.filter(function (h) { return h.crape && isRiver(h.r); }).length;
      var cleanRow = rows.some(function (hs) { return hs.some(function (h) { return h.crape && h.water === 'brown'; }) && hs.some(function (h) { return !h.crape && h.water === 'blue'; }); });
      ok = opts.noFloors || (crape >= C.CRAPE_MIN && crape <= C.CRAPE_MAX && inland > river && cleanRow);
      tries++;
    } while (!ok && tries < 2000);
    return { seed: seed, rows: rows, tests: C.TESTS, log: [], sentence: null, redraws: tries - 1 };
  }
  function house(g, r, i) { return g.rows[r][i]; }

  // ---------------- a test: the glass ----------------
  function test(g, r, i) {
    var h = house(g, r, i); if (!h) return { ok: false, why: 'no such house' };
    if (g.sentence !== null) return { ok: false, why: 'the book is closed' };
    if (g.tests <= 0) return { ok: false, why: 'no tests left' }; if (h.tested) return { ok: false, why: 'already tested' };
    h.tested = true; g.tests--; g.log.push({ r: r, i: i, water: h.water, crape: h.crape });
    return { ok: true, house: h, milky: h.water === 'brown', rowTally: rowTally(g, r) };
  }
  function rowTally(g, r) {
    var t = { brown: 0, brownCrape: 0, blue: 0, blueCrape: 0 };
    g.rows[r].forEach(function (h) { if (!h.tested) return; if (h.water === 'brown') { t.brown++; if (h.crape) t.brownCrape++; } else { t.blue++; if (h.crape) t.blueCrape++; } });
    t.both = t.brown > 0 && t.blue > 0; return t;
  }

  // ---------------- the evidence ----------------
  function ratioOf(w) {
    var bh = w.brown, lh = w.blue, bd = w.brownCrape, ld = w.blueCrape;
    if (bh === 0 || lh === 0) return NaN;
    var rb = bd / bh, rl = ld / lh;
    if (rl === 0) return rb > 0 ? Infinity : NaN;
    return rb / rl;
  }
  function evidence(g) {
    var all = { brown: 0, brownCrape: 0, blue: 0, blueCrape: 0 }, same = { brown: 0, brownCrape: 0, blue: 0, blueCrape: 0, rows: 0 };
    var side = { brownInland: 0, brownInlandCrape: 0, brownRiver: 0, brownRiverCrape: 0 };
    var brownInland = 0, blueRiver = 0, tested = 0;
    g.rows.forEach(function (hs, r) {
      var t = rowTally(g, r);
      all.brown += t.brown; all.brownCrape += t.brownCrape; all.blue += t.blue; all.blueCrape += t.blueCrape;
      if (t.both) { same.rows++; same.brown += t.brown; same.brownCrape += t.brownCrape; same.blue += t.blue; same.blueCrape += t.blueCrape; }
      hs.forEach(function (h) { if (!h.tested) return; tested++; if (h.water === 'brown' && isInland(r)) brownInland++; if (h.water === 'blue' && isRiver(r)) blueRiver++;
        if (h.water === 'brown') { if (isInland(r)) { side.brownInland++; if (h.crape) side.brownInlandCrape++; } else if (isRiver(r)) { side.brownRiver++; if (h.crape) side.brownRiverCrape++; } } });
    });
    var state;
    if (tested === 0) state = 'none';
    else if (all.brown === 0 || all.blue === 0) state = 'oneColour';
    else if (same.rows === 0) state = 'confounded';
    else if (same.brownCrape + same.blueCrape === 0) state = 'nocrape';
    else { var r = ratioOf(same); state = (r === Infinity || r >= C.AGREE_LO) ? 'clean' : r > 1 ? 'weak' : 'flat'; }
    return { tested: tested, all: all, same: same, side: side, state: state, ratioAll: ratioOf(all), ratioSame: ratioOf(same),
      brownMostlyInland: all.brown > 0 && brownInland / all.brown >= 0.5, blueMostlyRiver: all.blue > 0 && blueRiver / all.blue >= 0.5 };
  }

  // ---------------- words ----------------
  function numberWord(n) { var W = ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty']; if (n <= 20) return W[n]; if (n < 30) return 'twenty-' + W[n - 20]; return String(n); }
  function timesWord(r) {
    if (r >= 10) return 'more than ten times as often as'; if (r >= 1.75) return 'about ' + numberWord(Math.round(r)) + ' times as often as';
    if (r >= 1.25) return 'about one and a half times as often as'; if (r >= 0.8) return 'about as often as'; return 'less often than';
  }
  function countWords(w) { return 'brown ' + w.brownCrape + ' of ' + w.brown + ' with crape, blue ' + w.blueCrape + ' of ' + w.blue; }
  function sameRowSays(e) {
    var s = e.same, r = e.ratioSame;
    if (s.rows === 0) return 'You have not yet tested a brown house and a blue house in the same street.';
    var head = 'Same street, both waters (' + numberWord(s.rows) + ' street' + (s.rows === 1 ? '' : 's') + '): ' + countWords(s) + '. ';
    if (r === Infinity) return head + 'No blue house in the same street wears crape; the brown ones do.';
    if (isNaN(r)) return head + 'None of these houses has crape, so there is nothing to compare yet.';
    return head + 'On the same street, a brown house wears crape ' + timesWord(r) + ' a blue one.';
  }
  // the line under the map, in the game's voice: descriptive only
  function line(g) {
    var e = evidence(g);
    if (e.tested === 0) return 'No house tested yet.';
    return 'All tests: ' + countWords(e.all) + '. ' + sameRowSays(e);
  }
  // the doctor, after each test
  function doctor(g) {
    var e = evidence(g);
    if (e.state === 'none') return 'Look where the crape is. Inland, away from the river. Something in the inland air; that is what does it.';
    if (e.state === 'oneColour') return e.all.blue === 0 ? 'Every house you have tested is on the town’s water. So is nearly every house inland. You have found nothing the map did not show.' : 'Every house you have tested is on the upriver water. So is nearly every house by the river. Test inland and you will find the town’s water there, and the crape, and the air.';
    if (e.state === 'confounded') return 'Your brown houses are ' + (e.brownMostlyInland ? 'inland' : 'on one side') + ' and your blue houses ' + (e.blueMostlyRiver ? 'by the river' : 'on the other') + ', just like the map. Inland is where the crape is. The water and the side of town go together, so you cannot tell which of them does it.';
    if (e.state === 'nocrape') return 'Both waters in one street, I grant you, but none of those houses has crape. Nothing to compare.';
    if (e.state === 'clean') return 'In the same street you have a brown house and a blue house, the same air at both doors, and the crape is at the brown one. I have nothing to say to that.';
    if (e.state === 'weak') return 'Same street, same air, and the brown houses only a little worse. I call that chance.';
    return 'Same street, same air, and no difference between the two waters. There you are: it is not the water.';
  }

  // ---------------- the sentence and the verdict ----------------
  function canWrite(g) { return g.sentence === null && g.tests === 0; }
  function writeSentence(g, s) { if (!canWrite(g) || ['air', 'water', 'cannot'].indexOf(s) < 0) return false; g.sentence = s; return true; }
  function verdict(g) {
    var e = evidence(g), s = g.sentence;
    var snow = 'Snow compared houses on the same streets, where the only thing different was the pipe. The town’s water killed about seven times as often as the upriver water in these seven weeks, and fourteen times as often in the first four. And once the water was known, whether a street was by the river or inland, crowded or genteel, made no difference at all.';
    var sent = { air: 'It is the inland air.', water: 'It is the Southwark and Vauxhall Company’s water.', cannot: 'These tests cannot say.' }[s] || '(no sentence)';
    var you = 'You wrote: “' + sent + '” ';
    if (e.tested === 0) you += 'You tested no house.';
    else {
      you += 'Over all your tests: ' + countWords(e.all) + '. ';
      if (e.state === 'oneColour') you += 'Every house you tested was on the same water, so there was nothing to compare it with.';
      else if (e.state === 'confounded') you += 'But your brown houses were ' + (e.brownMostlyInland ? 'mostly inland' : 'on one side') + ' and your blue houses ' + (e.blueMostlyRiver ? 'mostly by the river' : 'on the other') + ', like the map itself, so those tests cannot tell the water from the side of town.';
      else if (e.state === 'nocrape') you += 'In the streets where you tested both waters, none of the houses you tested had crape, so they could not compare anything.';
      else you += sameRowSays(e).replace('Same street, both waters', 'In the same street, where the side of town is the same for both');
    }
    var part;
    if (s === 'water' && e.state === 'clean') part = 'Your sentence is his, and your tests can carry it: in the same street, with the same air at both doors, the crape was at the houses on the town’s water.';
    else if (s === 'water' && e.state === 'weak') part = 'Your sentence is his, but your same-street tests show only a small gap. Eight tests are few; his were six hundred and fifty-eight deaths.';
    else if (s === 'water' && e.state === 'flat') part = 'Your sentence is his, but your same-street tests do not show it this time: the houses you happened to test on the upriver water died too. Eight tests are few; his were six hundred and fifty-eight deaths.';
    else if (s === 'water' && e.state === 'nocrape') part = 'Your sentence is his, but your tests cannot carry it: where you tested both waters there was no crape to compare. Snow\u2019s answer was a crape door and the door beside it, on the same street, on the other pipe.';
    else if (s === 'water') part = 'Your sentence is his, but your tests cannot carry it: the Board can answer that your brown houses were inland and inland is where the crape is. Snow’s answer was a brown house and a blue house in the same street.';
    else if (s === 'air') part = e.state === 'clean' ? 'You wrote the air, and your own tests say otherwise: in the same street, the same air at both doors, the crape was at the brown houses.' : 'You wrote the air. Snow tested houses in the same street, where the air was the same, and the crape followed the pipe. ' + (e.state === 'confounded' ? 'Your tests never put a brown house and a blue house in the same street.' : 'Your tests could not have told you.');
    else part = e.state === 'clean' ? 'You wrote that the tests cannot say. Yours could: in the same street the crape was at the brown houses.' : 'You wrote that the tests cannot say. Snow’s could, because he compared neighbours.';
    var had;
    if (s === 'air') had = 'Had your sentence stood, the air would have kept the blame a while longer, and the Southwark and Vauxhall Company would have gone on pumping from the sewers’ reach.';
    else if (s === 'water' && e.state !== 'clean' && e.state !== 'weak') had = 'Had your tests stood for the proof, the Board would have answered that inland houses differ from riverside ones in a hundred ways, and the air would have kept its share of the blame. The proof that stood was the one from the same street.';
    else if (s === 'cannot') had = 'Had it been left there, the air would have kept the blame. The tests that could say were the ones on the same street.';
    else had = 'Had the question been answered from lists instead of at the door, as the Board of Health answered it, the gap would have shrunk to three and a half to one, because with deaths six times as common behind one company’s doors, five mistakes in six move a death from the guilty water to the innocent one. Yours was answered at the door, with the glass, in the same street.';
    var sideLine = '';
    var sd = e.side;
    if (sd.brownInland >= 2 && sd.brownRiver >= 2) {
      var ri = sd.brownInlandCrape / sd.brownInland, rr = sd.brownRiverCrape / sd.brownRiver;
      sideLine = 'Among the brown houses you tested, inland ' + sd.brownInlandCrape + ' of ' + sd.brownInland + ' had crape and by the river ' + sd.brownRiverCrape + ' of ' + sd.brownRiver + ': ' + (Math.abs(ri - rr) <= 0.34 ? 'about alike. Once the water is known, the side of town does not matter.' : 'different this time, with so few houses; Snow found no difference once the water was known.');
    }
    var later = 'As the epidemic went on the gap narrowed: fourteen to one in the first four weeks, eight to one in the next three, five to one in the last ten, as other ways of catching it, from hand to mouth in crowded rooms, joined the water. And it was not dirt in general: thousands drank from foul cisterns that summer unharmed. It was the specific matter of the disease in the specific water.';
    var band = s === 'water' ? (e.state === 'clean' ? 'agree' : e.state === 'weak' ? 'weak' : e.state === 'flat' ? 'flat' : 'unsupported') : s;
    return { band: band, state: e.state, sentence: s, snow: snow, you: you, part: part, had: had, sideLine: sideLine, later: later, evidence: e };
  }

  // ---------------- strategies, for the numbers table and the checks ----------------
  // 'crapeOnly': the crape houses, inland first, then anywhere; 'sides': inland crape houses against riverside houses
  // without crape, write air (the doctor's comparison); 'random': anywhere; 'column': one house per street, then random;
  // 'middle': crape houses in the middle streets first, then the rest of those streets; 'pairs': a crape house in a middle
  // street, then the houses beside it, then the next. All write water except 'sides' (air).
  function runStrategy(seed, key, opts) {
    var g = makeMap(seed, opts), rng = makeRng(seed * 7 + 3), order = [];
    var all = [].concat.apply([], g.rows);
    var pick = function (hs) { return shuffle(rng, hs); };
    if (key === 'crapeOnly') order = pick(all.filter(function (h) { return h.crape; })).sort(function (a, b) { return b.r - a.r; }).concat(pick(all));
    else if (key === 'sides') { var ic = pick(all.filter(function (h) { return isInland(h.r) && h.crape; })), rl = pick(all.filter(function (h) { return isRiver(h.r) && !h.crape; })); for (var q = 0; q < 4; q++) { if (ic[q]) order.push(ic[q]); if (rl[q]) order.push(rl[q]); } order = order.concat(pick(all)); }
    else if (key === 'random') order = pick(all);
    else if (key === 'middle') { var mid = all.filter(function (h) { return C.ROWS[h.r].side === 'middle'; }); order = pick(mid.filter(function (h) { return h.crape; })).concat(pick(mid.filter(function (h) { return !h.crape; })), pick(all)); }
    else if (key === 'pairs') {
      var cr = pick(all.filter(function (h) { return h.crape && C.ROWS[h.r].side === 'middle'; })).concat(pick(all.filter(function (h) { return h.crape && C.ROWS[h.r].side !== 'middle'; })));
      cr.forEach(function (h) { order.push(h); [h.i - 1, h.i + 1].forEach(function (j) { if (j >= 0 && j < C.PER_ROW) order.push(g.rows[h.r][j]); }); });
      order = order.concat(pick(all));
    } else { // column
      for (var r = 0; r < C.ROWS.length; r++) order.push(g.rows[r][Math.floor(rng() * C.PER_ROW)]);
      order = order.concat(pick(all));
    }
    for (var k = 0; k < order.length && g.tests > 0; k++) test(g, order[k].r, order[k].i);
    writeSentence(g, key === 'sides' ? 'air' : 'water');
    return { game: g, verdict: verdict(g) };
  }

  var API = { CONFIG: CONFIG, makeRng: makeRng, rate: rate, perHouseProb: perHouseProb, brownCount: brownCount, isInland: isInland, isRiver: isRiver, makeMap: makeMap, house: house, test: test, rowTally: rowTally,
    ratioOf: ratioOf, evidence: evidence, numberWord: numberWord, timesWord: timesWord, countWords: countWords, line: line, doctor: doctor, canWrite: canWrite, writeSentence: writeSentence, verdict: verdict, runStrategy: runStrategy };
  if (typeof module !== 'undefined' && module.exports) module.exports = API; else root.SNOW = API;
})(typeof window !== 'undefined' ? window : this);
