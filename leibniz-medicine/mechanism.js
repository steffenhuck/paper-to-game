// Leibniz's Register — the mechanism (second build). The single source of truth: every rule that moves anything on
// screen is here, and the HTML embeds this file verbatim (build.py checks). Runs unchanged in Node (calibration.js)
// and in the browser. The paper (Leibniz 1694, on perfecting medicine) gives an argument and no numbers; this is a TOY
// built to let a player operate it (memo §16). Every number below is tagged with its source or its reason.
(function (root) {
  'use strict';

  var CONFIG = {
    YEARS: [1690, 1691, 1692, 1693, 1694, 1695, 1696, 1697, 1698, 1699], // our choice: ten winters, one tap each; the letter is dated 1694
    LETTER_YEAR: 1694,            // the letter in the Journal des sçavans, 26 July 1694: from this year every doctor writes; the letters of a year reach you the next year
    SICK: 100,                    // our choice: "a hundred sick" a winter, so every count on screen is out of a hundred
    DEAD: { helps: 5, none: 20, harms: 30 },   // our choice: the paper says "black to white", "incomparably better"; these are the sizes. 'none' is the fever's own toll, left to itself, and is shown to the player as the baseline
    TEMPS: ['cold', 'mild'],      // our choice: a winter fever; all that matters is the winter, in two things the player can see
    WETS: ['dry', 'wet'],
    REMEDIES: ['bark', 'bleed', 'rest'],   // bark is the paper's (quinquina, note 3); bleeding and rest are ours, so the choice has three live options
    // The plan of your own winters (memo §11), as letters over four kinds drawn per game: A any kind, B its neighbour
    // with the other wetness (one card the same), C its neighbour with the other temperature, D the opposite.
    PLAN: ['A', 'A', 'B', 'B', 'C', 'D', 'A', 'B', 'C', 'D'],
    PROVINCES: ['Burgundy', 'Normandy', 'Brittany', 'Picardy', 'Champagne', 'Guyenne', 'Provence', 'Languedoc', 'Dauphiné', 'Auvergne', 'Poitou', 'Lorraine', 'Anjou', 'Maine', 'Touraine', 'Berry', 'Orléanais', 'Nivernais', 'Bourbonnais', 'Lyonnais', 'Limousin', 'Béarn', 'Gascony', 'Artois'], // our choice: twenty-four other provinces write (revision 0c)
    OTHERS_READ: true,            // revision 0c: from the second year of letters the other doctors give what the collection shows helped in their kind, and choose at random only where it shows nothing yet
    // Floors on the draw (build.md §3): the other doctors choose at random, but the lesson must be able to appear:
    FLOOR: { helperKnownAt1695: true,   // the letters of 1694 hold the remedy that helps in your 1695 winter
             allHelpersKnownBy1696: true }, // the letters of 1694 and 1695 together hold the helper of every kind of winter
    OTHER_RUNS: 60,               // our choice: the verdict's other doctors are averaged over this many runs of their random tries on the same winters
    ROBUST: { NOISE: 6, EFFECT_ALTS: [{ helps: 10, none: 20, harms: 30 }, { helps: 5, none: 15, harms: 40 }] } // calibration only (memo §17)
  };

  // ---- random -------------------------------------------------------------------------------------------------
  function rng(seed) { var s = seed >>> 0; return function () { s += 0x6D2B79F5; var t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  function shuffle(a, r) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(r() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function pick(a, r) { return a[Math.floor(r() * a.length)]; }

  // ---- kinds of winter -------------------------------------------------------------------------------------------
  var KINDS = ['cold-dry', 'cold-wet', 'mild-dry', 'mild-wet'];
  function temp(k) { return k.split('-')[0]; }
  function wet(k) { return k.split('-')[1]; }
  function flipWet(k) { return temp(k) + '-' + (wet(k) === 'dry' ? 'wet' : 'dry'); }
  function flipTemp(k) { return (temp(k) === 'cold' ? 'mild' : 'cold') + '-' + wet(k); }

  // The remedy map (memo §11, §17). The plan needs A's helper to harm in B (1692 and 1697: the lookalike winter).
  // Every remedy helps somewhere; bark harms somewhere.
  function drawEffects(r, A, B) {
    for (var tries = 0; tries < 1000; tries++) {
      var E = {};
      KINDS.forEach(function (k) { var p = shuffle(['helps', 'none', 'harms'], r); E[k] = {}; CONFIG.REMEDIES.forEach(function (x, i) { E[k][x] = p[i]; }); });
      var helperA = helper(E, A);
      if (E[B][helperA] !== 'harms') continue;
      if (!CONFIG.REMEDIES.every(function (x) { return KINDS.some(function (k) { return E[k][x] === 'helps'; }); })) continue;
      if (!KINDS.some(function (k) { return E[k].bark === 'harms'; })) continue;
      return E;
    }
    return null;
  }
  function helper(E, k) { return CONFIG.REMEDIES.filter(function (x) { return E[k][x] === 'helps'; })[0]; }

  // The other provinces: each year each has a winter at random and a doctor who gives something: in the first year of
  // letters at random; after that (OTHERS_READ) what the letters so far show helped in his kind, else at random.
  function drawLetters(r, E, fromYear) {
    var L = {}, held = [];
    CONFIG.YEARS.forEach(function (y) {
      if (y < fromYear) return;
      L[y] = CONFIG.PROVINCES.map(function (p) {
        var k = pick(KINDS, r), x = null;
        if (CONFIG.OTHERS_READ && held.length) { var seen = known(L, held, k); x = CONFIG.REMEDIES.filter(function (q) { return seen[q] === 'helps'; })[0] || null; }
        if (!x) x = pick(CONFIG.REMEDIES, r);
        return { province: p, year: y, kind: k, remedy: x, effect: E[k][x], dead: CONFIG.DEAD[E[k][x]] };
      });
      held.push(y);
    });
    return L;
  }
  function known(letters, years, kind) { // which remedies the letters of these years show for this kind, and whether the helper is among them
    var seen = {}; years.forEach(function (y) { (letters[y] || []).forEach(function (l) { if (l.kind === kind) seen[l.remedy] = l.effect; }); }); return seen;
  }

  function newGame(seed) {
    var baseSeed = seed;
    for (var attempt = 0; attempt < 200; attempt++) {
      var r = rng(seed + attempt * 7919);
      var A = pick(KINDS, r), B = flipWet(A), C = flipTemp(A), D = flipWet(flipTemp(A));
      var map = { A: A, B: B, C: C, D: D };
      var E = drawEffects(r, A, B); if (!E) continue;
      var letters = drawLetters(r, E, CONFIG.LETTER_YEAR);
      var plan = CONFIG.PLAN.map(function (x) { return map[x]; });
      // floors
      var k95 = plan[5], s94 = known(letters, [1694], k95);
      if (CONFIG.FLOOR.helperKnownAt1695 && s94[helper(E, k95)] !== 'helps') continue;
      if (CONFIG.FLOOR.allHelpersKnownBy1696 && !KINDS.every(function (k) { return known(letters, [1694, 1695], k)[helper(E, k)] === 'helps'; })) continue;
      return { seed: baseSeed, drawSeed: seed + attempt * 7919, letters: map, kinds: KINDS.slice(), effects: E, plan: plan, years: CONFIG.YEARS.slice(), mail: letters, history: [] };
    }
    return null;
  }

  // ---- play ---------------------------------------------------------------------------------------------------
  function kindAt(game, t) { return game.plan[t]; }
  function yearAt(game, t) { return game.years[t]; }
  function hasRegister(game, t) { return yearAt(game, t) >= CONFIG.LETTER_YEAR; }   // from 1694 you write
  function nowYear(game, t) { return t < game.years.length ? yearAt(game, t) : Infinity; }   // after the last winter, everything is held
  function mailYears(game, t) { return game.years.filter(function (y) { return y >= CONFIG.LETTER_YEAR && y < nowYear(game, t); }); } // the letters you hold: every year written, before this one
  function effectOf(game, t, remedy) { return game.effects[kindAt(game, t)][remedy]; }
  function deadFor(effect, DEAD) { return (DEAD || CONFIG.DEAD)[effect]; }

  // The collection at time t: every letter you hold, with your own written winters, grouped by kind of winter, with
  // a count per remedy of how many letters said it helped, was no better than the fever alone, or harmed.
  function collection(game, t) {
    var ys = mailYears(game, t), rows = [];
    ys.forEach(function (y) { game.mail[y].forEach(function (l) { rows.push(l); }); });
    game.history.forEach(function (h) { if (h.written && h.year < nowYear(game, t)) rows.push({ province: 'you', year: h.year, kind: h.kind, remedy: h.remedy, effect: h.effect, dead: h.dead }); });
    var groups = {};
    KINDS.forEach(function (k) {
      var g = { kind: k, rows: rows.filter(function (l) { return l.kind === k; }).sort(function (a, b) { return b.year - a.year || (a.province === 'you' ? -1 : 1); }), tally: {} };
      CONFIG.REMEDIES.forEach(function (x) { g.tally[x] = { helps: 0, none: 0, harms: 0, n: 0 }; });
      g.rows.forEach(function (l) { g.tally[l.remedy][l.effect]++; g.tally[l.remedy].n++; });
      groups[k] = g;
    });
    return { years: ys, count: rows.length, groups: groups };
  }

  // What the past holds about THIS winter's kind, from the player's position: before the act, this is what they could
  // have used; after it, the game says it in the round's verdict.
  function lookup(game, t) {
    var kind = kindAt(game, t), prev = game.history.slice(0, t), last = prev.length ? prev[prev.length - 1] : null;
    var own = prev.filter(function (h) { return h.kind === kind; }).map(function (h) { return h.year; });
    var col = collection(game, t), g = col.groups[kind];
    var hlp = helper(game.effects, kind), helperShown = g.tally[hlp].helps > 0, seen = CONFIG.REMEDIES.filter(function (x) { return g.tally[x].n > 0; });
    var status;
    if (helperShown) status = 'collection';
    else if (last && last.kind === kind) status = 'last';
    else if (own.length) status = 'own';
    else if (seen.length) status = 'partial';
    else status = 'new';
    return { status: status, own: own, provinces: g.rows.filter(function (l) { return l.province !== 'you'; }).length, helpsShown: g.tally[hlp].helps, seen: seen, helper: hlp };
  }

  // The player's one act: give this winter's remedy. Appends to history and returns the record.
  function give(game, remedy) {
    var t = game.history.length;
    if (t >= game.plan.length) throw new Error('the winters are over');
    if (CONFIG.REMEDIES.indexOf(remedy) < 0) throw new Error('no such remedy: ' + remedy);
    var effect = effectOf(game, t, remedy);
    var rec = { t: t, year: yearAt(game, t), kind: kindAt(game, t), remedy: remedy, effect: effect, dead: deadFor(effect), written: hasRegister(game, t), lookup: lookup(game, t) };
    game.history.push(rec);
    return rec;
  }

  // What the game says after the act, in its own voice (memo §12).
  function roundVerdict(game, rec) {
    var t = rec.t, prev = game.history.slice(0, t), lines = [];
    lines.push('You gave ' + remedyName(rec.remedy) + '. Of a hundred sick, ' + numberWord(rec.dead) + ' died. ' + capital(remedyName(rec.remedy)) + ' ' + effectWord(rec.effect) + ' this winter.');
    var last = prev.length ? prev[prev.length - 1] : null;
    if (last && last.remedy === rec.remedy) {
      if (last.kind === rec.kind) lines.push('Last winter, the same kind of winter, it ' + effectWord(last.effect) + ' too.');
      else lines.push('Last winter was ' + kindName(last.kind) + ', and it ' + effectWord(last.effect) + ' there: ' + numberWord(last.dead) + ' died. This one is ' + kindName(rec.kind) + '. The same ' + remedyName(rec.remedy) + ', a different winter' + (temp(last.kind) === temp(rec.kind) || wet(last.kind) === wet(rec.kind) ? ' on one card' : '') + '.');
    }
    var lk = rec.lookup;
    if (lk.status === 'collection') lines.push('The letters had this winter: ' + numberWordAny(lk.helpsShown) + ' ' + (lk.helpsShown === 1 ? 'province' : 'provinces') + ' had given ' + remedyName(lk.helper) + ' in a ' + kindName(rec.kind) + ' winter and seen it help.');
    else if (lk.status === 'last') lines.push('The same kind of winter as last year.');
    else if (lk.status === 'own') lines.push('You had this kind of winter in ' + listYears(lk.own) + '. Nobody else’s winters were written down then.');
    else if (lk.status === 'partial') lines.push('The letters had this winter in ' + numberWordAny(lk.provinces) + ' ' + (lk.provinces === 1 ? 'province' : 'provinces') + ', but none had tried ' + remedyName(lk.helper) + '.');
    else lines.push('A kind of winter you had not seen, and no letters. Nothing could have told you.');
    return lines;
  }

  // ---- the doctors (memo §18): ways of playing, run headless ----------------------------------------------------
  function lastYearRule(game, t, r, excluded) {
    var prev = game.history.slice(0, t), last = prev.length ? prev[prev.length - 1] : null;
    var options = CONFIG.REMEDIES.filter(function (x) { return excluded.indexOf(x) < 0; });
    if (!options.length) options = CONFIG.REMEDIES.slice();
    if (last && last.effect === 'helps' && options.indexOf(last.remedy) >= 0) return last.remedy;
    var others = options.filter(function (x) { return !last || x !== last.remedy; });
    return pick(others.length ? others : options, r);
  }
  function readRule(game, t, r, fromYear) { // reads the letters held (from fromYear on) and your own winters since then
    var kind = kindAt(game, t), tally = {};
    CONFIG.REMEDIES.forEach(function (x) { tally[x] = null; });
    game.years.forEach(function (y) { if (y >= fromYear && y < yearAt(game, t) && game.mail[y]) game.mail[y].forEach(function (l) { if (l.kind === kind) tally[l.remedy] = l.effect; }); });
    game.history.slice(0, t).forEach(function (h) { if (h.year >= fromYear && h.kind === kind) tally[h.remedy] = h.effect; });
    var hel = CONFIG.REMEDIES.filter(function (x) { return tally[x] === 'helps'; });
    if (hel.length) return hel[0];
    return lastYearRule(game, t, r, CONFIG.REMEDIES.filter(function (x) { return tally[x] !== null; }));
  }
  var DOCTORS = {
    memory: function (game, t, r) { return lastYearRule(game, t, r, []); },       // trusts the remembered winter: repeats what helped last year, otherwise tries another
    bleeding: function () { return 'bleed'; }, bark: function () { return 'bark'; }, rest: function () { return 'rest'; },
    reader: function (game, t, r) { return readRule(game, t, r, CONFIG.LETTER_YEAR); },   // reads the collection from 1694
    readerFrom1690: function (game, t, r) { return readRule(game, t, r, 1690); },         // Leibniz's counterfactual: every doctor writing "for a while now"
    oracle: function (game, t) { return helper(game.effects, kindAt(game, t)); }
  };

  // For the counterfactual the mail must exist from 1690: a game with letters for every year, drawn from the same seed.
  function withMailFrom1690(game) {
    var r = rng(game.drawSeed + 17), g = {}; for (var k in game) g[k] = game[k];
    g.mail = drawLetters(r, game.effects, game.years[0]);
    g.history = []; return g;
  }

  function playDoctor(seed, name, opts) {
    opts = opts || {};
    var game = newGame(seed); if (name === 'readerFrom1690') game = withMailFrom1690(game);
    var r = rng(seed * 31 + 7 + 1000003 * (opts.run || 0));
    var DEAD = opts.DEAD || CONFIG.DEAD, total = 0, perYear = [];
    for (var t = 0; t < game.plan.length; t++) {
      var rem = DOCTORS[name](game, t, r), rec = give(game, rem);
      var d = deadFor(rec.effect, DEAD);
      if (opts.noise) d = Math.max(0, Math.min(CONFIG.SICK, d + Math.round((r() * 2 - 1) * opts.noise)));
      rec.dead = d; total += d; perYear.push(d);
    }
    return { total: total, perYear: perYear, history: game.history };
  }

  // ---- the end (memo §7) ---------------------------------------------------------------------------------------
  function summary(game) {
    var H = game.history, total = 0, before = 0, after = 0, nBefore = 0, nAfter = 0, st = { collection: 0, last: 0, own: 0, partial: 0, 'new': 0 };
    // before: the winters with nothing to read (1690 to 1694, the first letters come back in 1695); after: with the letters
    H.forEach(function (h) { total += h.dead; st[h.lookup.status]++; if (h.year <= CONFIG.LETTER_YEAR) { before += h.dead; nBefore++; } else { after += h.dead; nAfter++; } });
    var others = {};
    ['memory', 'reader', 'readerFrom1690', 'oracle'].forEach(function (n) { var tot = 0; for (var k = 0; k < CONFIG.OTHER_RUNS; k++) tot += playDoctor(game.seed, n, { run: k }).total; others[n] = 5 * Math.round(tot / CONFIG.OTHER_RUNS / 5); });
    var word = after * nBefore < before * nAfter / 2 ? 'letters' : (after * nBefore >= before * nAfter ? 'ignored' : 'some');
    return { total: total, sick: CONFIG.SICK * H.length, before: before, after: after, sickBefore: nBefore * CONFIG.SICK, sickAfter: nAfter * CONFIG.SICK, status: st, others: others, letters: collection(game, H.length).count, word: word };
  }

  // ---- words (build.md §4.4: no decimals, rough sizes in words) ------------------------------------------------
  var NUM = { 0: 'none', 5: 'five', 20: 'twenty', 30: 'thirty' };
  var SMALL = ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty'];
  function numberWord(n) { if (NUM[n] !== undefined) return NUM[n]; return String(n); }
  function numberWordAny(n) { return SMALL[n] !== undefined ? SMALL[n] : String(n); }
  function remedyName(r) { return { bark: 'bark', bleed: 'bleeding', rest: 'rest' }[r]; }
  function effectWord(e) { return { helps: 'helped', none: 'was no better than the fever alone', harms: 'harmed' }[e]; }   // the middle word is judged against the fever's own toll, which the screen states
  function effectShort(e) { return { helps: 'helped', none: 'no better', harms: 'harmed' }[e]; }   // for small cards and tallies; 'no better' is defined on screen as 'no better than the fever alone'
  function kindName(k) { return temp(k) + ', ' + wet(k); }
  function capital(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  function listYears(ys) { if (ys.length === 1) return String(ys[0]); return ys.slice(0, -1).join(', ') + ' and ' + ys[ys.length - 1]; }
  function roughOf(dead, sick) {
    var p = dead / sick;
    if (p <= 0.07) return 'hardly any';
    if (p <= 0.13) return 'about one in ten';
    if (p <= 0.2) return 'about one in six';
    if (p <= 0.27) return 'about one in four';
    return 'about one in three';
  }

  var M = { CONFIG: CONFIG, KINDS: KINDS, rng: rng, newGame: newGame, give: give, lookup: lookup, collection: collection, roundVerdict: roundVerdict, kindAt: kindAt, yearAt: yearAt, hasRegister: hasRegister, mailYears: mailYears, effectOf: effectOf, helper: helper, temp: temp, wet: wet, DOCTORS: DOCTORS, playDoctor: playDoctor, withMailFrom1690: withMailFrom1690, summary: summary, numberWord: numberWord, numberWordAny: numberWordAny, remedyName: remedyName, effectWord: effectWord, effectShort: effectShort, kindName: kindName, listYears: listYears, roughOf: roughOf, known: known };
  if (typeof module !== 'undefined' && module.exports) module.exports = M; else root.MECH = M;
})(typeof window !== 'undefined' ? window : this);
