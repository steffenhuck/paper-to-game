// Snow's Cloudy Glass — mechanism. The single source of truth: plain functions, no DOM; every rule that affects an
// outcome (the streets, the deaths, the test, the residents, the window, the estimate, the prediction, the verdict's
// bands and words) lives here. Runs unchanged in Node (module.exports) and in the browser (window.SNOW).
//
// Mechanism kind: RECONSTRUCTED. Each street is a data-generating process built from one subdistrict row of
// John Snow (1856), "Cholera and the Water Supply in the South Districts of London in 1854", Tables I and II:
// the subdistrict's share of houses on each company's water, and its deaths per 10,000 persons supplied by each
// company in the first seven weeks of the epidemic (9 July to 26 August 1854), turned into a per-house probability
// and drawn ten times as thick so that one street of eighteen shows it. The knock budget, the residents' words, the
// floors on crape, the prediction street and the window are ours and tagged as such. Source: the Project Gutenberg
// transcription of the typeset text (eBook 66507), so no number was read off a figure or a scan.
(function (root) {
  'use strict';

  var CONFIG = {
    HOUSES: 18,            // our choice: houses on a street; three terraces of six fit a phone
    KNOCKS: 7,             // our choice: knocks per street, so crape doors and living doors compete for shoe leather
    MARKS: 5,              // our choice: doors to mark on the prediction street
    COMPRESSION: 10,       // our choice: deaths drawn ten times as thick as the seven-week rates, so a street shows them
    RESIDENT_WRONG: 1 / 7, // our choice: a resident who names a company names the wrong one this often (p. 7: the
                           //   Board's list-matching error, backed out of 160/27 vs 125/37, is about 1 in 14; doubled)
    RESIDENT_UNSURE: 1 / 4,// our choice: a resident who cannot say (pp. 3, 7: tenants "not acquainted with the water supply")
    LAMBETH_OVERALL_DEATHS: 98, LAMBETH_OVERALL_HOUSES: 20554, // Table I totals: Lambeth Co. deaths and houses supplied, first seven weeks
                           //   (6.8 per 10,000 persons); the rate for Battersea's one Lambeth house, where Table II reports no deaths
    // The four streets, in play order. houses/pop: "Number of houses, and estimated number of persons, supplied in
    // 1854"; deaths: "Water supply of the houses in which fatal attacks of cholera took place during first seven
    // weeks"; rate: "Mortality per 10,000 supplied"; perHouse: "Estimated constant population per house" (1851 census; the
    // supplied population over supplied houses is 6.1 for Trinity and within 0.1 of the printed figure elsewhere). A house's
    // chance of crape is deaths over houses supplied for its water, which is the same as the rate times persons per house.
    STREETS: [
      { key: 'trinity', name: 'Trinity, Newington', phrase: 'a street where the two companies’ pipes run side by side', kind: 'plain',
        role: 'knock', housesBrown: 1661, housesBlue: 1372, popBrown: 10132, popBlue: 8370, deathsBrown: 52, deathsBlue: 6,
        rateBrown: 51.3, rateBlue: 7.1, perHouse: 6.5, crapeMin: 2, crapeMax: 5, source: 'Table I, Newington 1. Trinity' },
      { key: 'battersea', name: 'Battersea', phrase: '“thinly peopled, comparatively genteel” (Snow)', kind: 'genteel',
        role: 'knock', housesBrown: 1046, housesBlue: 46, popBrown: 6276, popBlue: 270, deathsBrown: 42, deathsBlue: 0,
        rateBrown: 66.9, rateBlue: null, perHouse: 6.0, crapeMin: 4, crapeMax: 9, source: 'Table II, Wandsworth 2. Battersea; p. 7' },
      { key: 'lambethchurch', name: 'Lambeth Church', phrase: '“crowded, dirty, and very poor”, by the river (Snow)', kind: 'crowded',
        role: 'knock', housesBrown: 415, housesBlue: 2117, popBrown: 3113, popBlue: 15878, deathsBrown: 6, deathsBlue: 9,
        rateBrown: 19.2, rateBlue: 5.6, perHouse: 7.5, crapeMin: 1, crapeMax: 3, source: 'Table I, Lambeth 3. Lambeth church, pt. 1; p. 7' },
      { key: 'borough', name: 'Borough Road', phrase: 'with the companies’ books open', kind: 'plain',
        role: 'predict', housesBrown: 1176, housesBlue: 878, popBrown: 8937, popBlue: 6672, deathsBrown: 61, deathsBlue: 7,
        rateBrown: 68.2, rateBlue: 10.4, perHouse: 7.7, crapeMin: 0, crapeMax: 18, source: 'Table I, St. George Southwark 2. Borough Road' }
    ],
    // The paper's headline numbers, for the verdict and the calibration check.
    PAPER: {
      first4: { deathsBrown: 286, deathsBlue: 14, popBrown: 266516, popBlue: 173748, perBrown: 107, perBlue: 8 }, // p. 4, per 100,000
      table1: { deathsBrown: 507, deathsBlue: 98, housesBrown: 16038, housesBlue: 20554, popBrown: 107290, popBlue: 143901, perBrown: 47.2, perBlue: 6.8 }, // Table I totals, per 10,000
      next3: { ratio: 8 },                   // p. 4: "nearly eight times"
      last10: { perBrown: 916, perBlue: 180 }, // p. 5, per 100,000
      whole: { perBrown: 160, perBlue: 27 },  // Table V and p. 7, per 10,000
      board: { perBrown: 125, perBlue: 37 },  // p. 7: the Board of Health's list-matching inquiry
      saltBrown: 40, saltBlue: 0.95          // p. 3: grains of common salt per gallon
    },
    // Verdict bands for the player's "times as often" (our choice): Snow's own ratios run from 3.4 (Lambeth Church) to 14 (first four weeks);
    // a player's number inside these counts as agreeing with him.
    AGREE_LO: 3.5, AGREE_HI: 20,
    // Residents' names (ours), drawn without replacement per street.
    NAMES: ['Mrs Hollis', 'Mr Pryor', 'Mrs Catchpole', 'Mr Dunn', 'Mrs Agnew', 'Mr Tolley', 'Mrs Marsh', 'Mr Quick', 'Mrs Bevan', 'Mr Sillitoe',
      'Mrs Ford', 'Mr Haggis', 'Mrs Pike', 'Mr Lacey', 'Mrs Nye', 'Mr Rudd', 'Mrs Cope', 'Mr Vokes']
  };
  var C = CONFIG;

  // ---------------- random ----------------
  function makeRng(seed) {
    var a = (seed >>> 0) || 1;
    return function () { a = (a + 0x6D2B79F5) | 0; var t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }
  function shuffle(rng, xs) { var a = xs.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rng() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }

  // ---------------- the street as a data-generating process ----------------
  // deaths over houses supplied, for one water on one street, in the first seven weeks (Battersea's Lambeth houses had no
  // deaths among 270 people, so they take the Lambeth figure over all twenty-one mixed subdistricts)
  function rate(st, water) {
    if (water === 'brown') return st.deathsBrown / st.housesBrown;
    if (st.rateBlue === null) return C.LAMBETH_OVERALL_DEATHS / C.LAMBETH_OVERALL_HOUSES;
    return st.deathsBlue / st.housesBlue;
  }
  // probability that a house on this water wears crape by the end of the seven weeks, drawn COMPRESSION times as thick
  function perHouseProb(st, water, compression) {
    var k = compression === undefined ? C.COMPRESSION : compression;
    var p = rate(st, water) * k; return p > 1 ? 1 : p;
  }
  function brownCount(st) {
    var share = st.housesBrown / (st.housesBrown + st.housesBlue);
    var n = Math.round(share * C.HOUSES); if (n < 1) n = 1; if (n > C.HOUSES - 1) n = C.HOUSES - 1; return n;
  }
  // one street: waters placed at random, a death drawn per house, redrawn while the crape count is outside the floor and cap
  function makeStreet(rng, idx, opts) {
    opts = opts || {};
    var st = C.STREETS[idx], nb = brownCount(st);
    var waters = []; for (var i = 0; i < C.HOUSES; i++) waters.push(i < nb ? 'brown' : 'blue');
    waters = shuffle(rng, waters);
    var names = shuffle(rng, C.NAMES);
    var pb = perHouseProb(st, 'brown', opts.compression), pl = perHouseProb(st, 'blue', opts.compression);
    var houses, crape, tries = 0;
    do {
      houses = waters.map(function (w, i) {
        var dead = rng() < (w === 'brown' ? pb : pl);
        var u = rng(), word;
        if (u < C.RESIDENT_UNSURE) word = null; else if (u < C.RESIDENT_UNSURE + (1 - C.RESIDENT_UNSURE) * C.RESIDENT_WRONG) word = (w === 'brown' ? 'blue' : 'brown'); else word = w;
        return { i: i, water: w, crape: dead, word: word, name: names[i], tested: false, marked: false };
      });
      crape = houses.filter(function (h) { return h.crape; }).length;
      tries++;
    } while (!opts.noFloors && (crape < st.crapeMin || crape > st.crapeMax) && tries < 500);
    return { idx: idx, key: st.key, name: st.name, phrase: st.phrase, kind: st.kind, role: st.role, houses: houses, crape: crape, brown: nb, blue: C.HOUSES - nb, knocksLeft: st.role === 'knock' ? C.KNOCKS : 0, redraws: tries - 1, done: false };
  }

  function newGame(seed, opts) {
    var rng = makeRng(seed);
    var streets = C.STREETS.map(function (s, i) { return makeStreet(rng, i, opts); });
    return { seed: seed, streets: streets, at: 0, window: { crapeBrown: 0, crapeBlue: 0, liveBrown: 0, liveBlue: 0 }, knocks: [], prediction: null };
  }
  function current(g) { return g.streets[g.at]; }

  // ---------------- a knock ----------------
  // the resident's word, then the glass: Battersea water, salt with the tide, turns milky with the silver drops (p. 3)
  function knock(g, houseIndex) {
    var s = current(g); if (s.role !== 'knock') return { ok: false, why: 'not a knock street' };
    if (s.knocksLeft <= 0) return { ok: false, why: 'no knocks left' };
    var h = s.houses[houseIndex]; if (!h || h.tested) return { ok: false, why: 'already tested' };
    h.tested = true; s.knocksLeft--;
    var milky = h.water === 'brown';
    if (h.crape) { if (milky) g.window.crapeBrown++; else g.window.crapeBlue++; } else { if (milky) g.window.liveBrown++; else g.window.liveBlue++; }
    var rec = { street: s.key, house: houseIndex, crape: h.crape, water: h.water, milky: milky, word: h.word, name: h.name, wordWrong: h.word !== null && h.word !== h.water };
    g.knocks.push(rec);
    if (s.knocksLeft === 0) s.done = true;
    return { ok: true, rec: rec, streetDone: s.done, window: windowCopy(g) };
  }
  function windowCopy(g) { var w = g.window; return { crapeBrown: w.crapeBrown, crapeBlue: w.crapeBlue, liveBrown: w.liveBrown, liveBlue: w.liveBlue }; }
  // the line under the window, descriptive only
  function windowLine(g) {
    var w = g.window, tc = w.crapeBrown + w.crapeBlue, tl = w.liveBrown + w.liveBlue;
    var a = tc === 0 ? 'Crape doors tried: none yet.' : 'Crape doors tried: ' + tc + ', of them ' + w.crapeBrown + ' brown.';
    var b = tl === 0 ? 'Living doors tried: none yet.' : 'Living doors tried: ' + tl + ', of them ' + w.liveBrown + ' brown.';
    return a + ' ' + b;
  }
  function streetSummary(g, idx) {
    var s = g.streets[idx]; var t = s.houses.filter(function (h) { return h.tested; });
    var cr = t.filter(function (h) { return h.crape; }), li = t.filter(function (h) { return !h.crape; });
    var cb = cr.filter(function (h) { return h.water === 'brown'; }).length, lb = li.filter(function (h) { return h.water === 'brown'; }).length;
    return { name: s.name, crapeDoors: s.crape, tested: t.length, crapeTried: cr.length, crapeBrown: cb, liveTried: li.length, liveBrown: lb };
  }
  function nextStreet(g) { if (g.at < g.streets.length - 1) { g.at++; return true; } return false; }

  // ---------------- the prediction street ----------------
  function mark(g, houseIndex) {
    var s = current(g); if (s.role !== 'predict') return false; var h = s.houses[houseIndex]; if (!h) return false;
    if (h.marked) { h.marked = false; return true; }
    var n = s.houses.filter(function (x) { return x.marked; }).length; if (n >= C.MARKS) return false;
    h.marked = true; return true;
  }
  function marksPlaced(g) { return current(g).houses.filter(function (x) { return x.marked; }).length; }
  function monthPasses(g) {
    var s = current(g); if (s.role !== 'predict' || g.prediction) return null;
    var H = s.houses;
    var r = {
      crape: H.filter(function (h) { return h.crape; }).length,
      crapeBrown: H.filter(function (h) { return h.crape && h.water === 'brown'; }).length,
      crapeBlue: H.filter(function (h) { return h.crape && h.water === 'blue'; }).length,
      brown: s.brown, blue: s.blue,
      marksBrown: H.filter(function (h) { return h.marked && h.water === 'brown'; }).length,
      marksBlue: H.filter(function (h) { return h.marked && h.water === 'blue'; }).length,
      hits: H.filter(function (h) { return h.marked && h.crape; }).length,
      missed: H.filter(function (h) { return !h.marked && h.crape; }).length
    };
    s.done = true; g.prediction = r; return r;
  }

  // ---------------- the estimate: deaths by water over houses by water, as Snow divided them ----------------
  // Per knock street the crape doors and the living doors are counted by eye; the share of brown among each is estimated from
  // the doors tested there; a street with no tested door of one kind borrows the share pooled over the other streets.
  function estimate(g) {
    var ks = g.streets.filter(function (s) { return s.role === 'knock'; });
    var pc = { b: 0, n: 0 }, pl = { b: 0, n: 0 };
    ks.forEach(function (s) { s.houses.forEach(function (h) { if (!h.tested) return; var o = h.crape ? pc : pl; o.n++; if (h.water === 'brown') o.b++; }); });
    if (pc.n === 0 && pl.n === 0) return { kind: 'nothing' };
    if (pl.n === 0) return { kind: 'noLiving', crapeTried: pc.n, crapeBrownShare: pc.b / pc.n };
    if (pc.n === 0) return { kind: 'noCrape', liveTried: pl.n, liveBrownShare: pl.b / pl.n };
    var bd = 0, bh = 0, ld = 0, lh = 0;
    ks.forEach(function (s) {
      var tc = s.houses.filter(function (h) { return h.tested && h.crape; }), tl = s.houses.filter(function (h) { return h.tested && !h.crape; });
      var sc = tc.length ? tc.filter(function (h) { return h.water === 'brown'; }).length / tc.length : pc.b / pc.n;
      var sl = tl.length ? tl.filter(function (h) { return h.water === 'brown'; }).length / tl.length : pl.b / pl.n;
      var crape = s.crape, live = C.HOUSES - s.crape;
      bd += crape * sc; ld += crape * (1 - sc); bh += crape * sc + live * sl; lh += crape * (1 - sc) + live * (1 - sl);
    });
    var rb = bh > 0 ? bd / bh : 0, rl = lh > 0 ? ld / lh : 0;
    var ratio = rl > 0 ? rb / rl : (rb > 0 ? Infinity : NaN);
    return { kind: 'both', crapeTried: pc.n, liveTried: pl.n, crapeBrownShare: pc.b / pc.n, liveBrownShare: pl.b / pl.n, rateBrown: rb, rateBlue: rl, ratio: ratio };
  }
  // the true per-house rates pooled over the three knock streets as drawn (for the checks and the About screen)
  function truth(g) {
    var bd = 0, bh = 0, ld = 0, lh = 0;
    g.streets.filter(function (s) { return s.role === 'knock'; }).forEach(function (s) { s.houses.forEach(function (h) { if (h.water === 'brown') { bh++; if (h.crape) bd++; } else { lh++; if (h.crape) ld++; } }); });
    return { brownDead: bd, brownHouses: bh, blueDead: ld, blueHouses: lh, ratio: ld > 0 ? (bd / bh) / (ld / lh) : Infinity };
  }
  // expected ratio of per-house death rates over the three knock streets, from the tables (no draw)
  function expectedRatio(compression) {
    var bd = 0, bh = 0, ld = 0, lh = 0;
    C.STREETS.filter(function (s) { return s.role === 'knock'; }).forEach(function (s) { var nb = brownCount(s); bh += nb; lh += C.HOUSES - nb; bd += nb * perHouseProb(s, 'brown', compression); ld += (C.HOUSES - nb) * perHouseProb(s, 'blue', compression); });
    return (bd / bh) / (ld / lh);
  }

  // ---------------- words ----------------
  function shareWord(x) { return x >= 0.85 ? 'nearly all' : x >= 0.6 ? 'most' : x >= 0.4 ? 'about half' : x >= 0.15 ? 'a few' : 'hardly any'; }
  // the clause after "By your knocks, a house on Battersea water wore crape ..."
  function timesWord(r) {
    if (r === Infinity) return 'and no house on Thames Ditton water wore it at all, so the gap is wider than your knocks can count';
    if (isNaN(r)) return 'no more often than a house on Thames Ditton water, as far as your knocks can tell';
    if (r >= 10) return 'more than ten times as often as a house on Thames Ditton water';
    if (r >= 1.75) return 'about ' + numberWord(Math.round(r)) + ' times as often as a house on Thames Ditton water';
    if (r >= 1.25) return 'about one and a half times as often as a house on Thames Ditton water';
    if (r >= 0.8) return 'about as often as a house on Thames Ditton water';
    return 'less often than a house on Thames Ditton water';
  }
  function numberWord(n) { var W = ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty']; if (n <= 20) return W[n]; if (n < 30) return 'twenty-' + W[n - 20]; return String(n); }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  function ofWord(n) { return n === 0 ? 'none' : numberWord(n); }

  // ---------------- the verdict ----------------
  function verdict(g) {
    var e = estimate(g), w = g.window;
    var band = e.kind === 'both' ? (e.ratio === Infinity || e.ratio > C.AGREE_HI ? 'high' : e.ratio >= C.AGREE_LO ? 'agree' : 'low') : e.kind;
    var snow = 'On the same streets, a house on Battersea water lost someone about seven times as often as a house on Thames Ditton water in these seven weeks, and fourteen times as often in the first four. Crowded or genteel, by the river or on the hill: once the water was known, the parish made no difference.';
    var you, part;
    if (e.kind === 'nothing') {
      you = 'You knocked at no door, so the glass said nothing.';
      part = 'Snow knocked at six hundred and fifty-eight.';
    } else if (e.kind === 'noLiving') {
      you = 'Behind the crape doors you tried, ' + shareWord(e.crapeBrownShare) + ' drank Battersea water. You tried no living door, so whether the living drank it too cannot be told from your knocks.';
      part = 'Your list says that the dead drank Battersea water. The Board of Health could answer that so did most of the living, and from your knocks you could not reply. Snow could: he had the houses supplied by each company from the return made to Parliament, forty thousand against twenty-six.';
    } else if (e.kind === 'noCrape') {
      you = 'You tried only living doors: ' + shareWord(e.liveBrownShare) + ' drank Battersea water. You never asked what the dead drank.';
      part = 'The second row of the window is the one Snow had from Parliament; the first is the one he walked for.';
    } else {
      you = 'Behind the crape doors you tried, ' + shareWord(e.crapeBrownShare) + ' drank Battersea water; behind the living doors, ' + shareWord(e.liveBrownShare) + '. By your knocks, a house on Battersea water wore crape ' + timesWord(e.ratio) + '.';
      if (band === 'agree') part = 'Your three streets agree with his twenty-one subdistricts.';
      else if (band === 'high') part = 'Your knocks found the gap even wider than his. Three streets are few; his were six hundred and fifty-eight deaths, and a death behind a blue door turns up about once in fifteen.';
      else part = 'Your knocks found a narrower gap than his. Three streets are few, and the knocks you spent on the living were ' + (e.liveTried < 4 ? 'fewer than the second row needed.' : 'well spent; the draw of crape on these streets was unlucky for you.');
    }
    var had;
    if (e.kind === 'noLiving' || e.kind === 'nothing') had = 'Had the question been left there, the air would have kept the blame. Had it been answered from the companies’ lists instead of at the door, as the Board of Health answered it, the gap would have shrunk to three and a half to one, because with deaths six times as common behind one company’s doors, five mistakes in six move a death from the guilty company to the innocent one.';
    else had = 'Had the question been answered from the companies’ lists instead of at the door, as the Board of Health answered it, the gap would have shrunk to three and a half to one: with deaths six times as common behind one company’s doors, five mistakes in six move a death from the guilty company to the innocent one. Your knocks were made at the door.';
    var bat = g.streets[1], lam = g.streets[2];
    var parish = 'Battersea, airy and well-to-do, had crape on ' + numberWord(bat.crape) + ' door' + (bat.crape === 1 ? '' : 's') + '; Lambeth Church, crowded and poor by the river, on ' + numberWord(lam.crape) + '. The parish did not decide it. The pipe did.';
    var p = g.prediction, pred = null;
    if (p) {
      pred = 'On Borough Road, with the books open, crape came to ' + ofWord(p.crapeBrown) + ' of the ' + numberWord(p.brown) + ' brown doors and ' + ofWord(p.crapeBlue) + ' of the ' + numberWord(p.blue) + ' blue. You marked ' + numberWord(p.marksBrown) + ' brown and ' + numberWord(p.marksBlue) + ' blue; crape came to ' + ofWord(p.hits) + ' of your ' + numberWord(p.marksBrown + p.marksBlue) + '.';
    }
    var wrong = g.knocks.filter(function (k) { return k.wordWrong; }).length, unsure = g.knocks.filter(function (k) { return k.word === null; }).length, said = g.knocks.length - unsure;
    var residents = g.knocks.length === 0 ? '' : 'Of the ' + numberWord(g.knocks.length) + ' doors you knocked at, ' + (unsure === 0 ? 'everyone named a company' : numberWord(unsure) + ' could not say whose water they drank') + (said === 0 ? '.' : ', and of those who named one, ' + (wrong === 0 ? 'none was wrong' : numberWord(wrong) + (wrong === 1 ? ' was' : ' were') + ' wrong') + '. Snow did not rest content with the reply: he asked for the water-rate receipt, and he carried the silver drops.');
    var later = 'As the epidemic went on the gap narrowed: fourteen to one in the first four weeks, eight to one in the next three, five to one in the last ten, as other ways of catching it, from hand to mouth in crowded rooms, joined the water. And it was not dirt in general: thousands drank from foul cisterns that summer unharmed. It was the specific matter of the disease in the specific water.';
    return { band: band, estimate: e, snow: snow, you: you, part: part, had: had, parish: parish, prediction: pred, residents: residents, later: later, truth: truth(g), window: windowCopy(g) };
  }

  // ---------------- strategies, for playing it in numbers and the checks ----------------
  // key: 'crapeOnly' (crape doors, unused knocks left), 'crapeThenLiving' (crape first, the rest on living doors),
  // 'halfHalf' (alternate, crape first), 'livingOnly', 'random'; prediction: 'brown' marks brown doors, 'blue' blue, 'random'
  function runStrategy(seed, key, predictKey, opts) {
    var g = newGame(seed, opts), rng = makeRng(seed * 7 + 3);
    for (var si = 0; si < 3; si++) {
      var s = current(g), order;
      var cr = s.houses.filter(function (h) { return h.crape; }).map(function (h) { return h.i; }), li = s.houses.filter(function (h) { return !h.crape; }).map(function (h) { return h.i; });
      cr = shuffle(rng, cr); li = shuffle(rng, li);
      if (key === 'crapeOnly') order = cr;
      else if (key === 'crapeThenLiving') order = cr.concat(li);
      else if (key === 'livingOnly') order = li;
      else if (key === 'halfHalf') { order = []; for (var k = 0; k < C.HOUSES; k++) { if (k % 2 === 0 && cr.length) order.push(cr.shift()); else if (li.length) order.push(li.shift()); else if (cr.length) order.push(cr.shift()); } }
      else order = shuffle(rng, cr.concat(li));
      for (var j = 0; j < order.length && s.knocksLeft > 0; j++) knock(g, order[j]);
      nextStreet(g);
    }
    var ps = current(g), cand = ps.houses.filter(function (h) { return predictKey === 'random' ? true : h.water === predictKey; }).map(function (h) { return h.i; });
    cand = shuffle(rng, cand); for (var m = 0; m < C.MARKS && m < cand.length; m++) mark(g, cand[m]);
    monthPasses(g);
    return { game: g, verdict: verdict(g) };
  }

  var API = { CONFIG: CONFIG, makeRng: makeRng, rate: rate, perHouseProb: perHouseProb, brownCount: brownCount, makeStreet: makeStreet, newGame: newGame, current: current,
    knock: knock, windowLine: windowLine, streetSummary: streetSummary, nextStreet: nextStreet, mark: mark, marksPlaced: marksPlaced, monthPasses: monthPasses,
    estimate: estimate, truth: truth, expectedRatio: expectedRatio, shareWord: shareWord, timesWord: timesWord, numberWord: numberWord, ofWord: ofWord, cap: cap, verdict: verdict, runStrategy: runStrategy };
  if (typeof module !== 'undefined' && module.exports) module.exports = API; else root.SNOW = API;
})(typeof window !== 'undefined' ? window : this);
