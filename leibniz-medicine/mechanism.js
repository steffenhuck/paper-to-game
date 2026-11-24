// Leibniz's Register — the mechanism. The single source of truth: every rule that moves anything on screen is here,
// and the HTML embeds this file verbatim (build.py checks). Runs unchanged in Node (calibration.js) and in the browser.
// The paper (Leibniz 1694, on perfecting medicine) gives an argument and no numbers; this is a TOY built to let a
// player operate it (memo §16). Every number below is tagged with its source or its reason.
(function (root) {
  'use strict';

  var CONFIG = {
    YEARS: [1690, 1691, 1692, 1693, 1694, 1695, 1696, 1697, 1698, 1699, 1700], // our choice: eleven years, one tap each, to the turn of the century; the letter is dated 1694
    REGISTER_FROM: 1694,          // the letter in the Journal des sçavans, 26 July 1694: the register begins the year it arrives
    SICK: 100,                    // our choice: "a hundred sick" a year, so every count on screen is out of a hundred
    DEAD: { helps: 5, none: 20, harms: 30 },   // our choice: the paper says "black to white", "incomparably better"; these are the sizes (memo §18 for why not closer)
    // The plan: which kind of year comes when (memo §11). Kinds are letters; what each letter looks like is drawn per game.
    PLAN: ['A', 'A', 'B', 'B', 'C', 'C', 'B', 'D', 'D', 'A', 'B'],   // chosen from the table in memo §18: four repeats, two lost years, one book year
    // Memory (memo §12): what a doctor's head holds of a year, by how many years ago it was. The paper says only that
    // without the record one learns "almost always from scratch"; the steps are ours.
    MEMORY: { 1: 'whole', 2: 'cards-and-remedy', 3: 'cards-faded', 4: 'blank' },
    REMEDIES: ['bark', 'bleed', 'rest'],   // bark is the paper's (quinquina, note 3); bleeding and rest are ours, so the choice has three live options
    SEASONS: ['winter', 'spring', 'summer', 'autumn'],   // Ramazzini's order begins with the seasons and the air
    WEATHERS: ['wet', 'hot', 'cold', 'mild'],            // four kinds of weather a season square can show
    MIN_DIFF: 2,                  // our choice: any two kinds of year differ in at least two of their four seasons (matching by eye, with partial lookalikes)
    MAX_DIFF: 3,                  // our choice: and agree in at least one, so a nearest-year temptation exists
    // Grains and beasts: one line per kind, Ramazzini's second and third headings, as colour and as a second cue
    FLAVOURS: [
      'the corn rotted in the field; the sheep sickened',
      'the corn came early and small; the cattle were well',
      'the vines did well; the pigs sickened',
      'the fruit froze on the tree; the horses coughed',
      'the hay was good; the hens stopped laying',
      'the harvest was late; the goats were well'
    ],
    OTHER_RUNS: 60,               // our choice: the verdict's other doctors are averaged over this many runs of their random tries on the same years
    ROBUST: { NOISE: 6, EFFECT_ALTS: [{ helps: 10, none: 20, harms: 30 }, { helps: 5, none: 15, harms: 40 }] } // calibration only (memo §17)
  };

  // ---- random -------------------------------------------------------------------------------------------------
  function rng(seed) { var s = seed >>> 0; return function () { s += 0x6D2B79F5; var t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  function shuffle(a, r) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(r() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function pick(a, r) { return a[Math.floor(r() * a.length)]; }

  // ---- the draw -----------------------------------------------------------------------------------------------
  function diff(a, b) { var d = 0; for (var i = 0; i < a.length; i++) if (a[i] !== b[i]) d++; return d; }

  // Four signatures of four seasons, pairwise differing in MIN_DIFF..MAX_DIFF squares.
  function drawSignatures(r) {
    for (var tries = 0; tries < 1000; tries++) {
      var sigs = [];
      while (sigs.length < 4) {
        var s = [0, 1, 2, 3].map(function () { return pick(CONFIG.WEATHERS, r); });
        var ok = sigs.every(function (o) { var d = diff(o, s); return d >= CONFIG.MIN_DIFF && d <= CONFIG.MAX_DIFF; });
        if (ok) sigs.push(s); else if (r() < 0.02) break;
      }
      if (sigs.length === 4) return sigs;
    }
    return null;
  }

  // The remedy map (memo §11, §17). The plan needs: A's helper harms in B (1692), C's helper harms in B (1696) so A and C
  // share a helper r1 which harms in B; D's helper r2 harms in A (1699); B's helper r3 is not A's helper. Every remedy
  // helps somewhere, so r1, r2, r3 are the three remedies. Bark harms somewhere.
  function drawEffects(r) {
    for (var tries = 0; tries < 1000; tries++) {
      var p = shuffle(CONFIG.REMEDIES, r), r1 = p[0], r2 = p[1], r3 = p[2];
      var E = { A: {}, B: {}, C: {}, D: {} };
      E.A[r1] = 'helps'; E.A[r2] = 'harms'; E.A[r3] = 'none';
      E.B[r3] = 'helps'; E.B[r1] = 'harms'; E.B[r2] = 'none';
      var c = r() < 0.5; E.C[r1] = 'helps'; E.C[r2] = c ? 'harms' : 'none'; E.C[r3] = c ? 'none' : 'harms';
      var d = r() < 0.5; E.D[r2] = 'helps'; E.D[r1] = d ? 'harms' : 'none'; E.D[r3] = d ? 'none' : 'harms';
      var barkHarms = ['A', 'B', 'C', 'D'].some(function (k) { return E[k].bark === 'harms'; });
      if (barkHarms) return E;
    }
    return null;
  }

  function newGame(seed) {
    var baseSeed = seed;
    for (var attempt = 0; attempt < 50; attempt++) {
      var r = rng(seed + attempt * 7919);
      var sigs = drawSignatures(r), E = drawEffects(r);
      if (!sigs || !E) continue;
      var fl = shuffle(CONFIG.FLAVOURS, r);
      var kinds = {};
      ['A', 'B', 'C', 'D'].forEach(function (k, i) { kinds[k] = { id: k, sig: sigs[i], flavour: fl[i], effects: E[k] }; });
      return { seed: baseSeed, drawSeed: seed + attempt * 7919, kinds: kinds, plan: CONFIG.PLAN.slice(), years: CONFIG.YEARS.slice(), history: [] };
    }
    return null;
  }

  // ---- play ---------------------------------------------------------------------------------------------------
  function kindAt(game, t) { return game.kinds[game.plan[t]]; }
  function yearAt(game, t) { return game.years[t]; }
  function hasRegister(game, t) { return yearAt(game, t) >= CONFIG.REGISTER_FROM; }
  function effectOf(game, t, remedy) { return kindAt(game, t).effects[remedy]; }
  function deadFor(effect, DEAD) { return (DEAD || CONFIG.DEAD)[effect]; }

  // The player's one act: give this year's remedy. Appends to history and returns the record.
  function give(game, remedy) {
    var t = game.history.length;
    if (t >= game.plan.length) throw new Error('the years are over');
    if (CONFIG.REMEDIES.indexOf(remedy) < 0) throw new Error('no such remedy: ' + remedy);
    var effect = effectOf(game, t, remedy);
    var rec = { t: t, year: yearAt(game, t), kind: game.plan[t], remedy: remedy, effect: effect, dead: deadFor(effect), written: hasRegister(game, t), lookup: lookup(game, t) };
    game.history.push(rec);
    return rec;
  }

  // What the past holds about THIS year's kind, from the player's position: before the act, this is what they could
  // have used; after it, the game says it in the round's verdict. Memory reaches back by CONFIG.MEMORY; the register
  // holds every written year.
  function lookup(game, t) {
    var kind = game.plan[t], prev = game.history.slice(0, t);
    var same = prev.filter(function (h) { return h.kind === kind; });
    var inBook = same.filter(function (h) { return h.written; });
    var last = prev.length ? prev[prev.length - 1] : null;
    var status;
    if (!same.length) status = 'new';
    else if (last && last.kind === kind) status = 'last';
    else if (inBook.length) status = 'book';
    else if (same.some(function (h) { return memoryLevel(t - h.t) === 'cards-and-remedy'; })) status = 'half-remembered';
    else status = 'lost';
    return { status: status, same: same.map(function (h) { return h.year; }), inBook: inBook.map(function (h) { return h.year; }) };
  }

  function memoryLevel(age) { return CONFIG.MEMORY[age] || 'blank'; }

  // The memory strip at time t: the last three years, each with only what the head holds.
  function memoryView(game, t) {
    var out = [];
    for (var age = 1; age <= 3; age++) {
      var h = game.history[t - age];
      if (!h) { out.push(null); continue; }
      var lv = memoryLevel(age);
      out.push({ year: h.year, age: age, level: lv,
        sig: lv === 'blank' ? null : game.kinds[h.kind].sig,
        flavour: lv === 'whole' ? game.kinds[h.kind].flavour : null,
        remedy: (lv === 'whole' || lv === 'cards-and-remedy') ? h.remedy : null,
        effect: lv === 'whole' ? h.effect : null, dead: lv === 'whole' ? h.dead : null });
    }
    return out;
  }

  // The register at time t: every written year, whole, newest first.
  function registerPages(game, t) {
    return game.history.slice(0, t).filter(function (h) { return h.written; }).map(function (h) {
      return { year: h.year, sig: game.kinds[h.kind].sig, flavour: game.kinds[h.kind].flavour, remedy: h.remedy, effect: h.effect, dead: h.dead };
    }).reverse();
  }

  // What the game says after the act, in its own voice (memo §12): the move, the count, the effect, and what the same
  // remedy did the last time the player could know of.
  function roundVerdict(game, rec) {
    var t = rec.t, prev = game.history.slice(0, t);
    var lines = [];
    lines.push('You gave ' + remedyName(rec.remedy) + '. Of a hundred sick, ' + numberWord(rec.dead) + ' died. ' + capital(remedyName(rec.remedy)) + ' ' + effectWord(rec.effect) + ' this year.');
    var last = prev.length ? prev[prev.length - 1] : null;
    if (last && last.remedy === rec.remedy) {
      if (last.kind === rec.kind) lines.push('Last year, the same kind of year, it ' + effectWord(last.effect) + ' too.');
      else lines.push('Last year, a different kind of year, it ' + effectWord(last.effect) + ': ' + numberWord(last.dead) + ' died. The same ' + remedyName(rec.remedy) + ', a different year.');
    }
    var lk = rec.lookup;
    if (lk.status === 'book') lines.push('This kind of year was in your register: ' + listYears(lk.inBook) + '.');
    else if (lk.status === 'lost') lines.push('This kind of year came before, in ' + listYears(lk.same) + '. Nobody wrote it down, and your head no longer holds it.');
    else if (lk.status === 'half-remembered') lines.push('This kind of year came before, in ' + listYears(lk.same) + '. You remembered the cards, not what came of them.');
    else if (lk.status === 'new') lines.push('A kind of year you had not seen. Nothing could have told you.');
    else if (lk.status === 'last') lines.push('The same kind of year as last year.');
    return lines;
  }

  // ---- the doctors (memo §18): ways of playing, run headless ----------------------------------------------------
  // Each is a function (game, t, r) -> remedy, seeing only what the role could see.
  function lastYearRule(game, t, r, excluded) {
    var prev = game.history.slice(0, t), last = prev.length ? prev[prev.length - 1] : null;
    var options = CONFIG.REMEDIES.filter(function (x) { return excluded.indexOf(x) < 0; });
    if (!options.length) options = CONFIG.REMEDIES.slice();
    if (last && last.effect === 'helps' && options.indexOf(last.remedy) >= 0) return last.remedy;
    var others = options.filter(function (x) { return !last || x !== last.remedy; });
    return pick(others.length ? others : options, r);
  }
  var DOCTORS = {
    // trusts the remembered year: repeats what helped last year, otherwise tries another
    memory: function (game, t, r) { return lastYearRule(game, t, r, []); },
    // the standard practice of the time
    bleeding: function () { return 'bleed'; },
    bark: function () { return 'bark'; },
    rest: function () { return 'rest'; },
    // keeps the register from 1694 and reads it: a matching page that helped decides; pages that harmed or did nothing
    // are excluded; then the memory rule
    register: function (game, t, r) { return registerRule(game, t, r, function (h) { return h.written; }); },
    // Leibniz's counterfactual: the register "done for a while now", from 1690
    registerFrom1690: function (game, t, r) { return registerRule(game, t, r, function () { return true; }); },
    // knows the map
    oracle: function (game, t) { var e = kindAt(game, t).effects; return CONFIG.REMEDIES.filter(function (x) { return e[x] === 'helps'; })[0]; }
  };
  function registerRule(game, t, r, inBook) {
    var kind = game.plan[t], pages = game.history.slice(0, t).filter(function (h) { return inBook(h) && h.kind === kind; });
    var helped = pages.filter(function (h) { return h.effect === 'helps'; });
    if (helped.length) return helped[helped.length - 1].remedy;
    var excluded = pages.map(function (h) { return h.remedy; });
    return lastYearRule(game, t, r, excluded);
  }

  function playDoctor(seed, name, opts) {
    opts = opts || {};
    var game = newGame(seed), r = rng(seed * 31 + 7 + 1000003 * (opts.run || 0));
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
    var H = game.history, total = 0, inBook = 0, lost = 0, fromScratch = 0, last = 0, half = 0;
    H.forEach(function (h) { total += h.dead; if (h.lookup.status === 'book') inBook++; else if (h.lookup.status === 'lost') lost++; else if (h.lookup.status === 'new') fromScratch++; else if (h.lookup.status === 'last') last++; else half++; });
    // the other doctors on the same years: their random tries averaged over many runs, rounded to five (memo §18)
    var others = {};
    ['memory', 'register', 'registerFrom1690', 'oracle'].forEach(function (n) { var tot = 0; for (var k = 0; k < CONFIG.OTHER_RUNS; k++) tot += playDoctor(game.seed, n, { run: k }).total; others[n] = 5 * Math.round(tot / CONFIG.OTHER_RUNS / 5); });
    var written = H.filter(function (h) { return h.written; }).length;
    return { total: total, sick: CONFIG.SICK * H.length, inBook: inBook, lost: lost, fromScratch: fromScratch, last: last, halfRemembered: half, others: others, written: written, unwritten: H.length - written };
  }

  // ---- words (build.md §4.4: no decimals, rough sizes in words) ------------------------------------------------
  var NUM = { 0: 'none', 5: 'five', 20: 'twenty', 30: 'thirty' };
  function numberWord(n) { if (NUM[n] !== undefined) return NUM[n]; return String(n); }
  function remedyName(r) { return { bark: 'bark', bleed: 'bleeding', rest: 'rest' }[r]; }
  function effectWord(e) { return { helps: 'helped', none: 'did nothing', harms: 'harmed' }[e]; }
  function capital(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  function listYears(ys) { if (ys.length === 1) return String(ys[0]); return ys.slice(0, -1).join(', ') + ' and ' + ys[ys.length - 1]; }
  function roughOf(dead, sick) { // the verdict's size words
    var p = dead / sick;
    if (p <= 0.07) return 'hardly any';
    if (p <= 0.13) return 'about one in ten';
    if (p <= 0.2) return 'about one in six';
    if (p <= 0.27) return 'about one in four';
    return 'about one in three';
  }

  var M = { CONFIG: CONFIG, rng: rng, newGame: newGame, give: give, lookup: lookup, memoryView: memoryView, registerPages: registerPages, roundVerdict: roundVerdict, kindAt: kindAt, yearAt: yearAt, hasRegister: hasRegister, effectOf: effectOf, DOCTORS: DOCTORS, playDoctor: playDoctor, summary: summary, numberWord: numberWord, remedyName: remedyName, effectWord: effectWord, listYears: listYears, roughOf: roughOf, diff: diff, memoryLevel: memoryLevel };
  if (typeof module !== 'undefined' && module.exports) module.exports = M; else root.MECH = M;
})(typeof window !== 'undefined' ? window : this);
