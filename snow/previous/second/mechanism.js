// Snow's Cloudy Glass (rebuild) — mechanism. The single source of truth: plain functions, no DOM; every rule that
// affects an outcome (the two streets, the deaths, the words, the doctor's offers, a pair and its card, the window and
// the line under it, a check, the sentence, the verdict) lives here. Runs unchanged in Node (module.exports) and in
// the browser (window.SNOW).
//
// Mechanism kind: RECONSTRUCTED. Each street is a data-generating process built from one subdistrict row of
// John Snow (1856), "Cholera and the Water Supply in the South Districts of London in 1854", Tables I and II: the
// row's share of houses on each company's water, and deaths over houses supplied for each water in the first seven
// weeks (9 July to 26 August 1854), drawn ten times as thick so that a street of twelve shows it. The knocks, the
// doctor, the residents' words, the floors on crape and on wrong words, the pair card and the sentence are ours and
// tagged as such. Source: the Project Gutenberg transcription of the typeset text (eBook 66507).
(function (root) {
  'use strict';

  var CONFIG = {
    HOUSES: 12,            // our choice: houses on a street; two rows of six, both streets on one phone screen
    KNOCKS: 8,             // our choice: a morning's knocks
    COST_ASK: 1,           // our choice: ask at both doors of a pair for one knock (the resident's word)
    COST_GLASS: 2,         // our choice: a glass at each door of a pair, one knock a door
    COST_CHECK: 1,         // our choice: a glass at one door already answered by word
    COMPRESSION: 10,       // our choice: deaths drawn ten times as thick as the seven-week rates
    RESIDENT_WRONG: 1 / 7, // our choice: a resident who names a company names the wrong one this often (p. 7: the Board's
                           //   list-matching error, backed out of 160/27 vs 125/37, is about 1 in 14; doubled so it is met)
    RESIDENT_UNSURE: 1 / 4,// our choice: a resident who cannot say (pp. 3, 7: tenants "not acquainted with the water supply")
    WRONG_WORD_FLOOR: 1,   // our choice: at least this many Battersea crape doors carry a wrong word, so the drift can be met
    DOCTOR_FIRST: 1,       // our choice: pairs the doctor offers at the start, for nothing
    DOCTOR_SECOND: 3,      // our choice: pairs he offers after KNOCKS_BEFORE_SECOND knocks are spent
    KNOCKS_BEFORE_SECOND: 4,
    MIN_PAIRS_TO_CLOSE: 2, // our choice: the book can be closed once two pairs are in it
    LAMBETH_OVERALL_DEATHS: 98, LAMBETH_OVERALL_HOUSES: 20554, // Table I totals: Lambeth Co. deaths and houses, first seven weeks
    // The two streets. houses/pop: "Number of houses, and estimated number of persons, supplied in 1854"; deaths: "Water
    // supply of the houses in which fatal attacks of cholera took place during first seven weeks"; rate: per 10,000 supplied.
    STREETS: [
      { key: 'battersea', name: 'Battersea', phrase: 'thinly peopled, comparatively genteel; Battersea Fields are marsh', kind: 'genteel', air: 'marsh air, railings and gardens',
        housesBrown: 1046, housesBlue: 46, popBrown: 6276, popBlue: 270, deathsBrown: 42, deathsBlue: 0, rateBrown: 66.9, rateBlue: null, perHouse: 6.0,
        crapeMin: 3, crapeMax: 7, source: 'Table II, Wandsworth 2. Battersea; p. 7 ("thinly peopled, and comparatively genteel")' },
      { key: 'waterloo', name: 'Waterloo Road', phrase: 'crowded, dirty, and very poor; by the river', kind: 'crowded', air: 'river air, crowded rooms',
        housesBrown: 438, housesBlue: 1474, popBrown: 3548, popBlue: 11939, deathsBrown: 9, deathsBlue: 1, rateBrown: 25.6, rateBlue: 0.8, perHouse: 8.1,
        crapeMin: 1, crapeMax: 2, source: 'Table I, Lambeth 1. Waterloo, part 1; p. 7 ("crowded, dirty, and very poor ... by the river side")' }
    ],
    PAPER: {
      first4: { deathsBrown: 286, deathsBlue: 14, popBrown: 266516, popBlue: 173748, perBrown: 107, perBlue: 8 }, // p. 4, per 100,000
      table1: { deathsBrown: 507, deathsBlue: 98, housesBrown: 16038, housesBlue: 20554, popBrown: 107290, popBlue: 143901, perBrown: 47.2, perBlue: 6.8 }, // Table I totals
      next3: { ratio: 8 }, last10: { perBrown: 916, perBlue: 180 }, whole: { perBrown: 160, perBlue: 27 }, board: { perBrown: 125, perBlue: 37 }, // pp. 4–7
      saltBrown: 40, saltBlue: 0.95 // p. 3, grains of common salt per gallon
    },
    AGREE_LO: 3.5, AGREE_HI: 40, // our choice: the player's "times as often" inside this counts as Snow's (his rows run 3.4 to 32)
    NAMES: ['Mrs Hollis', 'Mr Pryor', 'Mrs Catchpole', 'Mr Dunn', 'Mrs Agnew', 'Mr Tolley', 'Mrs Marsh', 'Mr Quick', 'Mrs Bevan', 'Mr Sillitoe',
      'Mrs Ford', 'Mr Haggis', 'Mrs Pike', 'Mr Lacey', 'Mrs Nye', 'Mr Rudd', 'Mrs Cope', 'Mr Vokes', 'Mrs Teale', 'Mr Ambler', 'Mrs Orme', 'Mr Gaunt', 'Mrs Lusk', 'Mr Penn']
  };
  var C = CONFIG;

  function makeRng(seed) {
    var a = (seed >>> 0) || 1;
    return function () { a = (a + 0x6D2B79F5) | 0; var t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }
  function shuffle(rng, xs) { var a = xs.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rng() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }

  // ---------------- the streets ----------------
  // deaths over houses supplied for one water on one street (Battersea's Lambeth houses had no deaths among 270 people, so
  // they take the Lambeth figure over the twenty-one mixed subdistricts)
  function rate(st, water) {
    if (water === 'brown') return st.deathsBrown / st.housesBrown;
    if (st.rateBlue === null) return C.LAMBETH_OVERALL_DEATHS / C.LAMBETH_OVERALL_HOUSES;
    return st.deathsBlue / st.housesBlue;
  }
  function perHouseProb(st, water, k) { var p = rate(st, water) * (k === undefined ? C.COMPRESSION : k); return p > 1 ? 1 : p; }
  function brownCount(st) { var n = Math.round(st.housesBrown / (st.housesBrown + st.housesBlue) * C.HOUSES); return n < 1 ? 1 : n > C.HOUSES - 1 ? C.HOUSES - 1 : n; }
  function drawWord(rng, w) {
    var u = rng();
    if (u < C.RESIDENT_UNSURE) return null;
    if (u < C.RESIDENT_UNSURE + (1 - C.RESIDENT_UNSURE) * C.RESIDENT_WRONG) return w === 'brown' ? 'blue' : 'brown';
    return w;
  }
  // the doors beside a door: left and right in its row of six
  function neighbours(houses, i) { var out = []; if (i % 6 > 0) out.push(houses[i - 1]); if (i % 6 < 5) out.push(houses[i + 1]); return out; }
  function makeStreet(rng, idx, names, opts) {
    opts = opts || {};
    var st = C.STREETS[idx], nb = brownCount(st);
    var pb = perHouseProb(st, 'brown', opts.compression), pl = perHouseProb(st, 'blue', opts.compression);
    var houses, crape, wrongCrape, tries = 0;
    do {
      var waters = []; for (var i = 0; i < C.HOUSES; i++) waters.push(i < nb ? 'brown' : 'blue');
      waters = shuffle(rng, waters); // irregular: "a single house often had a different supply from that on either side" (p. 3)
      houses = waters.map(function (w, i) {
        var dead = rng() < (w === 'brown' ? pb : pl);
        return { i: i, s: idx, water: w, crape: dead, word: drawWord(rng, w), name: names[i], known: null }; // known: null | 'word' | 'glass'
      });
      crape = houses.filter(function (h) { return h.crape; }).length;
      wrongCrape = houses.filter(function (h) { return h.crape && h.word !== null && h.word !== h.water; }).length;
      // the mixed street's lesson needs one brown crape door with a blue door beside it (left or right in its row)
      var cleanPairPossible = houses.some(function (h) { return h.crape && h.water === 'brown' && neighbours(houses, h.i).some(function (n) { return !n.crape && n.water === 'blue'; }); });
      tries++;
    } while (!opts.noFloors && (crape < st.crapeMin || crape > st.crapeMax || (st.key === 'battersea' && wrongCrape < C.WRONG_WORD_FLOOR) || (st.key === 'waterloo' && !cleanPairPossible)) && tries < 2000);
    return { idx: idx, key: st.key, name: st.name, phrase: st.phrase, kind: st.kind, air: st.air, houses: houses, crape: crape, brown: nb, blue: C.HOUSES - nb, redraws: tries - 1 };
  }
  function newGame(seed, opts) {
    var rng = makeRng(seed), names = shuffle(rng, C.NAMES);
    var streets = C.STREETS.map(function (s, i) { return makeStreet(rng, i, names.slice(i * C.HOUSES, (i + 1) * C.HOUSES), opts); });
    var g = { seed: seed, streets: streets, knocks: C.KNOCKS, pairs: [], doctor: [], checks: [], offers: { first: null, second: null }, secondOffered: false, closed: false, sentence: null, rng: makeRng(seed * 31 + 7) };
    g.offers.first = doctorOffer(g, C.DOCTOR_FIRST);
    return g;
  }
  function house(g, ref) { return g.streets[ref.s].houses[ref.i]; }

  // ---------------- the doctor's offers: crape doors of Battersea against living doors of Waterloo Road, by the word ----------------
  function doctorOffer(g, n) {
    var cr = g.streets[0].houses.filter(function (h) { return h.crape; }), li = g.streets[1].houses.filter(function (h) { return !h.crape; });
    var pref = function (xs, w) { var a = xs.filter(function (h) { return h.word === w; }), b = xs.filter(function (h) { return h.word !== null && h.word !== w; }), c = xs.filter(function (h) { return h.word === null; }); return shuffle(g.rng, a).concat(shuffle(g.rng, b), shuffle(g.rng, c)); };
    cr = pref(cr, 'brown'); li = pref(li, 'blue'); // he brings the pairs that fit his story and gave him a word
    var out = [];
    for (var k = 0; k < n && k < cr.length && k < li.length; k++) out.push({ a: { s: 0, i: cr[k].i }, b: { s: 1, i: li[k].i } });
    return out;
  }
  // the resident's word as the doctor reports it (he asked; the same word the house would give)
  function acceptOffer(g, which) {
    var pairs = g.offers[which]; if (!pairs || g.offers[which + 'Taken'] !== undefined) return null;
    g.offers[which + 'Taken'] = true;
    pairs.forEach(function (p) {
      var A = house(g, p.a), B = house(g, p.b);
      if (!A.known) A.known = 'word'; if (!B.known) B.known = 'word';
      g.doctor.push({ a: p.a, b: p.b, how: 'word', card: card(g, p.a, p.b) });
    });
    return g.doctor.slice(-pairs.length);
  }
  function declineOffer(g, which) { if (g.offers[which + 'Taken'] === undefined) g.offers[which + 'Taken'] = false; }

  // ---------------- what a door's water is, as the player knows it ----------------
  function knownWater(h) { if (h.known === 'glass') return h.water; if (h.known === 'word') return h.word; return null; } // null: unknown or "could not say"

  // ---------------- a pair and its card ----------------
  // what differs between two doors: the street (air, people), the water (as known), or nothing
  function card(g, a, b) {
    var A = house(g, a), B = house(g, b), wa = knownWater(A), wb = knownWater(B);
    var street = a.s !== b.s;
    var water = (wa && wb) ? (wa !== wb ? 'different' : 'same') : 'unknown';
    var kind = street ? 'muddled' : water === 'different' ? 'clean' : water === 'same' ? 'nothing' : 'open';
    return { street: street, water: water, kind: kind };
  }
  function canPair(g, a, b) {
    if (g.closed) return 'closed'; var A = house(g, a), B = house(g, b);
    if (!A || !B) return 'no such door'; if (!A.crape) return 'first door must have crape'; if (B.crape) return 'second door must not'; if (a.s === b.s && a.i === b.i) return 'same door';
    return null;
  }
  function pairCost(how) { return how === 'glass' ? C.COST_GLASS : C.COST_ASK; }
  // make a pair by 'ask' or 'glass'; spends knocks; returns the record
  function makePair(g, a, b, how) {
    var why = canPair(g, a, b); if (why) return { ok: false, why: why };
    var cost = pairCost(how); if (g.knocks < cost) return { ok: false, why: 'not enough knocks' };
    g.knocks -= cost;
    var A = house(g, a), B = house(g, b);
    [A, B].forEach(function (h) { if (how === 'glass') h.known = 'glass'; else if (h.known !== 'glass') h.known = 'word'; });
    var rec = { a: a, b: b, how: how, card: card(g, a, b), wordsA: A.word, wordsB: B.word, milkyA: A.water === 'brown', milkyB: B.water === 'brown' };
    g.pairs.push(rec);
    maybeSecondOffer(g);
    return { ok: true, rec: rec };
  }
  // a glass at one door already answered by word
  function check(g, ref) {
    if (g.closed) return { ok: false, why: 'closed' }; var h = house(g, ref);
    if (h.known !== 'word') return { ok: false, why: 'nothing to check' }; if (g.knocks < C.COST_CHECK) return { ok: false, why: 'not enough knocks' };
    g.knocks -= C.COST_CHECK; var before = knownWater(h); h.known = 'glass';
    g.checks.push({ ref: ref, wordWas: before, wasWrong: before !== null && before !== h.water, wasUnsure: before === null, crape: h.crape });
    g.pairs.forEach(function (p) { p.card = card(g, p.a, p.b); }); g.doctor.forEach(function (p) { p.card = card(g, p.a, p.b); });
    maybeSecondOffer(g);
    return { ok: true, house: h, milky: h.water === 'brown', wordWas: h.word, wasWrong: before !== null && before !== h.water, wasUnsure: before === null };
  }
  function maybeSecondOffer(g) { if (!g.secondOffered && C.KNOCKS - g.knocks >= C.KNOCKS_BEFORE_SECOND) { g.secondOffered = true; g.offers.second = doctorOffer(g, C.DOCTOR_SECOND); } }
  function canClose(g) { return !g.closed && (g.pairs.length >= C.MIN_PAIRS_TO_CLOSE || g.knocks === 0); }
  function closeBook(g) { if (!canClose(g)) return false; g.closed = true; return true; }
  function writeSentence(g, s) { if (!g.closed || ['air', 'water', 'cannot'].indexOf(s) < 0) return false; g.sentence = s; return true; }

  // ---------------- the window: same-street pairs, as the player knows them (or as they truly are) ----------------
  function windowFrom(g, truth) {
    var w = { crapeBrown: 0, crapeBlue: 0, liveBrown: 0, liveBlue: 0, crapeUnknown: 0, liveUnknown: 0, byWord: 0, byGlass: 0, pairs: 0 };
    g.pairs.forEach(function (p) {
      if (p.a.s !== p.b.s) return; w.pairs++;
      var A = house(g, p.a), B = house(g, p.b);
      var wa = truth ? A.water : knownWater(A), wb = truth ? B.water : knownWater(B);
      if (wa === 'brown') w.crapeBrown++; else if (wa === 'blue') w.crapeBlue++; else w.crapeUnknown++;
      if (wb === 'brown') w.liveBrown++; else if (wb === 'blue') w.liveBlue++; else w.liveUnknown++;
      if (A.known === 'glass') w.byGlass++; else w.byWord++; if (B.known === 'glass') w.byGlass++; else w.byWord++;
    });
    return w;
  }
  // how many times as often a brown door wears crape as a blue one, from a window (deaths over doors, by colour)
  function ratioOf(w) {
    var bd = w.crapeBrown, bh = w.crapeBrown + w.liveBrown, ld = w.crapeBlue, lh = w.crapeBlue + w.liveBlue;
    if (bh === 0 || lh === 0) return NaN; // one colour never seen: cannot be told
    var rb = bd / bh, rl = ld / lh;
    if (rl === 0) return rb > 0 ? Infinity : NaN;
    return rb / rl;
  }
  // the line under the window, in words, descriptive only
  function line(g) {
    var w = windowFrom(g, false);
    if (w.pairs === 0) return 'Nothing set side by side in the same street yet.';
    var top = w.crapeBrown + w.crapeBlue + w.crapeUnknown, s = 'In the same street, ' + plural(w.pairs, 'pair') + '. Of the crape doors, ' + colourWords(w.crapeBrown, w.crapeBlue, w.crapeUnknown, top) + '; of the doors beside them, ' + colourWords(w.liveBrown, w.liveBlue, w.liveUnknown, w.liveBrown + w.liveBlue + w.liveUnknown) + '. ';
    s += ratioLine(ratioOf(w), w);
    return s;
  }
  function colourWords(b, l, u, n) {
    if (n === 0) return 'none';
    var parts = [];
    if (b === n) return 'all brown'; if (l === n) return 'all blue';
    if (b) parts.push(b + ' brown'); if (l) parts.push(l + ' blue'); if (u) parts.push(u + ' not known');
    return parts.join(', ');
  }
  function ratioLine(r, w) {
    if (isNaN(r)) {
      if (w.crapeBlue + w.liveBlue === 0 && w.crapeUnknown + w.liveUnknown === 0) return 'Every door in these pairs is brown, so they cannot tell brown from blue.';
      if (w.crapeBrown + w.liveBrown === 0 && w.crapeUnknown + w.liveUnknown === 0) return 'Every door in these pairs is blue, so they cannot tell brown from blue.';
      return 'They cannot yet say how much more often a brown door wears crape than a blue one.';
    }
    if (r === Infinity) return 'No blue door in these pairs wears crape: as far as they go, it is the brown water.';
    return 'A brown door wears crape ' + timesWord(r) + ' a blue one.';
  }
  // ends with "as" or "than", so that "... a blue one" follows
  function timesWord(r) {
    if (r >= 10) return 'more than ten times as often as'; if (r >= 1.75) return 'about ' + numberWord(Math.round(r)) + ' times as often as';
    if (r >= 1.25) return 'about one and a half times as often as'; if (r >= 0.8) return 'about as often as'; return 'less often than';
  }
  function numberWord(n) { var W = ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty']; if (n <= 20) return W[n]; if (n < 30) return 'twenty-' + W[n - 20]; return String(n); }
  function plural(n, w) { return n + ' ' + w + (n === 1 ? '' : 's'); }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  // ---------------- the verdict ----------------
  function verdict(g) {
    var w = windowFrom(g, false), wt = windowFrom(g, true), r = ratioOf(w), rt = ratioOf(wt);
    var clean = g.pairs.filter(function (p) { return p.card.kind === 'clean'; }).length, nothing = g.pairs.filter(function (p) { return p.card.kind === 'nothing'; }).length;
    var muddled = g.pairs.filter(function (p) { return p.card.kind === 'muddled'; }).length + g.doctor.length;
    // words that were wrong among the doors in the player's same-street pairs, by the record the player took
    var wrongCrape = 0, wrongLive = 0, seen = {};
    g.pairs.forEach(function (p) { if (p.a.s !== p.b.s) return; [p.a, p.b].forEach(function (ref) { var k = ref.s + ':' + ref.i; if (seen[k]) return; seen[k] = true; var h = house(g, ref); if (h.known === 'word' && h.word !== null && h.word !== h.water) { if (h.crape) wrongCrape++; else wrongLive++; } }); });
    var wrong = wrongCrape + wrongLive;
    var evidence = w.pairs === 0 ? 'none' : (r === Infinity || r >= C.AGREE_LO) ? 'water' : isNaN(r) ? 'none' : 'narrow';
    var snow = 'On the same streets, a house on the town’s water lost someone about seven times as often as a house on the upriver water in these seven weeks, and fourteen times as often in the first four. Marsh or hill, crowded or genteel: once the water was known, the parish made no difference. And he knew the water by the rate-book and the glass, not by what people said at the door.';
    var sent = { air: 'It is the marsh air of Battersea Fields.', water: 'It is the Southwark and Vauxhall Company’s water.', cannot: 'These doors cannot say.' }[g.sentence] || '(no sentence)';
    var you = 'You wrote: “' + sent + '” ';
    if (w.pairs === 0) you += 'Your book has no pair in the same street' + (muddled ? ', only ' + plural(muddled, 'pair') + ' across the two streets, each different in the street as well as the water, which could be read as the marsh or as the water and cannot choose.' : '.');
    else {
      you += 'Your book has ' + plural(w.pairs, 'pair') + ' in the same street: ' + (clean ? plural(clean, 'pair') + ' different in the water alone' : 'none different in the water alone') + (nothing ? ', ' + numberWord(nothing) + ' different in nothing' : '') + '. ' + ratioLine(r, w);
      if (muddled) you += ' The ' + plural(muddled, 'pair') + ' across the two streets could be read either way.';
    }
    var part;
    if (g.sentence === 'water' && evidence === 'water') part = 'Your sentence is his, and your book can carry it: in the same street, with the same air and the same people, the crape was behind the brown doors.';
    else if (g.sentence === 'water' && evidence === 'none') part = 'Your sentence is his, but your book cannot carry it: ' + (w.pairs === 0 ? 'every pair in it differs in the street as well as the water, and the doctor can answer that it is the marsh.' : 'the pairs in it never set a brown door beside a blue one in the same street.');
    else if (g.sentence === 'water') part = 'Your sentence is his, but your book says a narrower gap than his: ' + ratioLine(r, w).toLowerCase();
    else if (g.sentence === 'air') part = evidence === 'water' ? 'You wrote the marsh, and your own book says otherwise: in the same street, the same air at both doors, the crape was behind the brown water.' : 'You wrote the marsh. Snow set a crape door beside the door next to it, where the air is the same, and the only thing different was the water. ' + (w.pairs === 0 ? 'Your book has no such pair.' : 'Your book’s pairs did not say so.');
    else part = evidence === 'water' ? 'You wrote that the doors cannot say. Yours could: ' + ratioLine(r, w).toLowerCase() : 'You wrote that the doors cannot say. Snow’s could, because he chose the two doors that differed in one thing and knew their water by the glass.';
    var words = '';
    if (wrong) {
      words = 'Among the doors in your same-street pairs, ' + plural(wrong, 'word') + ' ' + (wrong === 1 ? 'was' : 'were') + ' wrong' + (wrongCrape ? ', ' + numberWord(wrongCrape) + ' of them at a crape door' : '') + '. By the words your book says: ' + ratioLine(r, w).toLowerCase() + ' By the glass it would say: ' + ratioLine(rt, wt).toLowerCase() + (wrongCrape ? ' A wrong word at a crape door nearly always moves a death from the brown water to the blue, because nearly every crape door is brown; that is how the Board of Health’s lists turned six to one into three and a half.' : '');
    } else if (w.byWord > 0) words = 'The words you took and did not check were all right this time. One time in seven they are not, and at a crape door a wrong word nearly always moves a death from the brown water to the blue.';
    var checkedWrong = g.checks.filter(function (c) { return c.wasWrong; }).length, checkedUnsure = g.checks.filter(function (c) { return c.wasUnsure; }).length;
    if (g.checks.length) words = (words ? words + ' ' : '') + 'You checked ' + numberWord(g.checks.length) + ' door' + (g.checks.length === 1 ? '' : 's') + ' with the glass' + (checkedWrong ? ', and ' + numberWord(checkedWrong) + ' of the words ' + (checkedWrong === 1 ? 'was' : 'were') + ' wrong' : checkedUnsure ? ', where the resident could not say' : ', and the words were right') + '.';
    var had;
    if (g.sentence === 'air') had = 'Had your sentence stood, the marsh air would have kept the blame a while longer, and the Southwark and Vauxhall Company would have gone on pumping from the sewers’ reach.';
    else if (wrongCrape || (g.sentence === 'water' && evidence === 'narrow')) had = 'Had the question been settled by what people said at the door, as the Board of Health settled it from the companies’ lists, the gap would have shrunk to three and a half to one, and the air would have kept a share of the blame.';
    else if (g.sentence === 'cannot' || evidence === 'none') had = 'Had it been left there, the air would have kept the blame. Had it been answered from lists, as the Board of Health answered it, the gap would have shrunk to three and a half to one, because five mistakes in six move a death from the guilty water to the innocent one.';
    else had = 'Had it been answered from the companies’ lists instead of at the door, as the Board of Health answered it, the gap would have shrunk to three and a half to one, because with deaths six times as common behind one company’s doors, five mistakes in six move a death from the guilty water to the innocent one. Yours was answered at the door, with the glass.';
    var later = 'As the epidemic went on the gap narrowed: fourteen to one in the first four weeks, eight to one in the next three, five to one in the last ten, as other ways of catching it, from hand to mouth in crowded rooms, joined the water. And it was not dirt in general: thousands drank from foul cisterns that summer unharmed. It was the specific matter of the disease in the specific water.';
    var band = g.sentence === 'water' ? (evidence === 'water' ? 'agree' : evidence === 'narrow' ? 'narrow' : 'unsupported') : g.sentence === 'air' ? 'air' : 'cannot';
    return { band: band, sentence: g.sentence, evidence: evidence, snow: snow, you: you, part: part, words: words, had: had, later: later, window: w, windowTruth: wt, ratio: r, ratioTruth: rt, clean: clean, nothing: nothing, muddled: muddled, wrong: wrong, wrongCrape: wrongCrape, doctorTaken: g.doctor.length };
  }

  // ---------------- strategies, for the numbers table and the checks ----------------
  // 'doctor': take every offer, own pairs across the streets by word, write air
  // 'askNext': decline offers, next-door pairs by word, Waterloo first, write water
  // 'glassNext': decline, next-door pairs by glass, Waterloo first, write water
  // 'glassBattersea': decline, glass pairs on Battersea only, write water
  // 'askThenCheck': next-door pairs by word, then glass-check any crape door whose word said blue, write water
  // 'random': random crape door, random living door anywhere, random method, random sentence
  function neighbour(g, s, i, rng) {
    var cands = neighbours(g.streets[s].houses, i).filter(function (h) { return !h.crape; }).map(function (h) { return h.i; });
    if (!cands.length) { for (var k = 0; k < C.HOUSES; k++) if (!g.streets[s].houses[k].crape) cands.push(k); }
    if (!cands.length) return null;
    return cands[Math.floor(rng() * cands.length)];
  }
  function runStrategy(seed, key, opts) {
    var g = newGame(seed, opts), rng = makeRng(seed * 7 + 3), turn = 0;
    // crape doors in rotation: Waterloo Road's first, then Battersea's (Battersea only for glassBattersea; shuffled for random)
    var crapeRefs = [];
    (key === 'glassBattersea' ? [0] : [1, 0]).forEach(function (s) { g.streets[s].houses.forEach(function (h) { if (h.crape) crapeRefs.push({ s: s, i: h.i }); }); });
    if (key === 'random') crapeRefs = shuffle(rng, crapeRefs);
    if (key === 'doctor') acceptOffer(g, 'first'); else declineOffer(g, 'first');
    var guard = 0;
    while (g.knocks > 0 && guard++ < 40 && crapeRefs.length) {
      if (g.offers.second && g.offers.secondTaken === undefined) { if (key === 'doctor') acceptOffer(g, 'second'); else declineOffer(g, 'second'); }
      var a = crapeRefs[turn % crapeRefs.length], b, how; turn++;
      if (key === 'doctor') { var li = g.streets[1 - a.s].houses.filter(function (h) { return !h.crape; }); b = { s: 1 - a.s, i: li[Math.floor(rng() * li.length)].i }; how = 'ask'; }
      else if (key === 'random') { var s2 = Math.floor(rng() * 2); var li2 = g.streets[s2].houses.filter(function (h) { return !h.crape; }); b = { s: s2, i: li2[Math.floor(rng() * li2.length)].i }; how = rng() < 0.5 ? 'ask' : 'glass'; }
      else { b = { s: a.s, i: neighbour(g, a.s, a.i, rng) }; how = (key === 'glassNext' || key === 'glassBattersea') ? 'glass' : 'ask'; }
      if (b.i === null || b.i === undefined) break;
      if (g.knocks < pairCost(how)) how = 'ask';
      var r = makePair(g, a, b, how); if (!r.ok) break;
      if (key === 'askThenCheck') { var A = house(g, a); if (A.known === 'word' && knownWater(A) !== 'brown' && g.knocks >= C.COST_CHECK) check(g, a); }
    }
    closeBook(g);
    writeSentence(g, key === 'doctor' ? 'air' : key === 'random' ? ['air', 'water', 'cannot'][Math.floor(rng() * 3)] : 'water');
    return { game: g, verdict: verdict(g) };
  }

  var API = { CONFIG: CONFIG, makeRng: makeRng, rate: rate, perHouseProb: perHouseProb, brownCount: brownCount, makeStreet: makeStreet, newGame: newGame, house: house,
    doctorOffer: doctorOffer, acceptOffer: acceptOffer, declineOffer: declineOffer, knownWater: knownWater, card: card, canPair: canPair, pairCost: pairCost, makePair: makePair, check: check,
    canClose: canClose, closeBook: closeBook, writeSentence: writeSentence, windowFrom: windowFrom, ratioOf: ratioOf, line: line, ratioLine: ratioLine, timesWord: timesWord, numberWord: numberWord, plural: plural, cap: cap, verdict: verdict, runStrategy: runStrategy };
  if (typeof module !== 'undefined' && module.exports) module.exports = API; else root.SNOW = API;
})(typeof window !== 'undefined' ? window : this);
