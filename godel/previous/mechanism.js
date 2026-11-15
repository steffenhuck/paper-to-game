// Gödel's Loophole — the mechanism, headless, and the only copy (build.md §4.1).
// Runs unchanged in Node (module.exports) and in the browser (window.GL). The HTML is generated from this file by
// build.py and never re-implements any of it. Toy mechanism (memo §16): a rulebook that settles sentences about whole
// numbers, shapes with a hole in them numbered by their line on the board, and the diagonal fill of Gödel (1931) §1.
// No random draws anywhere: the game is deterministic.
(function (root) {
  'use strict';

  var CONFIG = {
    // Rulebook 1's board. Line number = shape number (paper §1: the class-signs "arranged in a series", R(n)).
    // Shapes 1–3 are number facts the rulebook works out (paper: recursive relations, Proposition V).
    // Shapes 4–5 are sentences about the rulebook itself (paper: Bew, definition 46, representable by Proposition V).
    SHAPES: [
      { kind: 'arith', pred: 'even' },                     // our choice: a fact every stranger can check
      { kind: 'arith', pred: 'prime' },                    // our choice
      { kind: 'arith', pred: 'gt3' },                      // our choice: ticks for 4, 5, 6 so the board has both marks
      { kind: 'meta', rb: 1, pol: '+', A: 1, B: 'hole' },  // "Rulebook 1 proves shape 1 filled with □": about the rulebook, settles
      { kind: 'meta', rb: 1, pol: '-', A: 'hole', B: 3 }   // "Rulebook 1 does not prove shape □ filled with 3": a "does not" that still settles
    ],
    GODEL: { kind: 'meta', rb: 1, pol: '-', A: 'hole', B: 'hole' }, // the paper's S = R(q): "n is in K" = "[R(n); n] is not provable"
    COMPOSER: { pols: ['+', '-'], slots: ['hole', 1, 2, 3, 4, 5] }, // the parts of shape 6; 6 itself is not offered: a shape has no number until it is written
    BUDGET: {
      beforeComposer: 3,  // our choice: runs on shapes 1–5 before "Write shape 6" appears (the player sees number facts and shapes 4/5 settle)
      composerRuns: 6,    // our choice: runs in the composer before Gödel's chalk writes shape 6
      findRb2: 3,         // our choice: runs to find Rulebook 2's loophole before Gödel fills it
      pages: 4            // our choice: ledger pages the player shows Rulebook 2′ before "and every page after"
    },
    GENEROUS_LEDGER: true, // true: the toy rulebook may read "refuted" off its ledger and certify "does not prove" (memo §15).
                           // false: the paper's rulebook, which can certify a proof it has but never a "no" (Proposition XI);
                           // the calibration check runs the game both ways and the loophole opens in both.
    MAX_DEPTH: 40 // a guard; no legal board can reach it (the calibration check sweeps every composer shape)
  };

  // ---------- arithmetic ----------
  var PREDS = {
    even: { text: function (n) { return n + ' is even'; }, test: function (n) { return n % 2 === 0; },
      why: function (n) { return n % 2 === 0 ? n + ' = 2 × ' + (n / 2) + '.' : n + ' = 2 × ' + ((n - 1) / 2) + ' + 1, so ' + n + ' is odd.'; } },
    prime: { text: function (n) { return n + ' is a prime'; }, test: function (n) { return isPrime(n); },
      why: function (n) { if (n < 2) return n + ' is not counted as a prime.'; if (isPrime(n)) return n + ' divides by nothing but 1 and ' + n + '.'; var d = smallestDivisor(n); return n + ' = ' + d + ' × ' + (n / d) + '.'; } },
    gt3: { text: function (n) { return n + ' is bigger than 3'; }, test: function (n) { return n > 3; },
      why: function (n) { return n > 3 ? n + ' comes after 3.' : (n === 3 ? '3 is not bigger than itself.' : n + ' comes before 3.'); } }
  };
  function isPrime(n) { if (n < 2) return false; for (var d = 2; d * d <= n; d++) if (n % d === 0) return false; return true; }
  function smallestDivisor(n) { for (var d = 2; d * d <= n; d++) if (n % d === 0) return d; return n; }

  // ---------- shapes and sentences ----------
  function holeText(x, n) { return x === 'hole' ? (n === undefined ? '□' : String(n)) : String(x); }
  // The text of a shape with its hole shown (n undefined) or filled with n.
  function shapeText(shape, n) {
    if (!shape) return '';
    if (shape.kind === 'arith') return PREDS[shape.pred].text(n === undefined ? '□' : n);
    return 'Rulebook ' + shape.rb + (shape.pol === '+' ? ' proves' : ' does not prove') + ' shape ' + holeText(shape.A, n) + ' filled with ' + holeText(shape.B, n);
  }
  function sentenceText(game, s, n) { return shapeText(game.shapes[s - 1], n); }
  function innerOf(shape, n) { return { s: shape.A === 'hole' ? n : shape.A, n: shape.B === 'hole' ? n : shape.B }; }
  function sameShape(a, b) { return !!a && !!b && a.kind === b.kind && a.rb === b.rb && a.pol === b.pol && a.A === b.A && a.B === b.B; }

  // ---------- rulebooks ----------
  // A rulebook: an edition, the standing rules (work out number facts; read the ledger), and added rules, each a sentence
  // (shape s filled with n) with the verdict the rule gives it. Edition 2 and 2′ are both built from edition 1.
  function newRulebook(edition, label, rules, base) { return { edition: edition, label: label, rules: rules || [], base: base || null }; }
  // A rule of an edition holds in every later edition built on it (paper: c ⊂ c′, Flg(c) ⊂ Flg(c′)).
  function ruleFor(rb, s, n, rulebooks) { for (var r = rb; r; r = r.base ? rulebooks[r.base] : null) for (var i = 0; i < r.rules.length; i++) if (r.rules[i].s === s && r.rules[i].n === n) return r.rules[i]; return null; }

  // ---------- settling ----------
  // settle(game, rbKey, s, n): the rulebook named by rbKey works out shape s filled with n.
  // Returns { v: 'tick' | 'cross' | 'loop', lines: [{t, d, who}] } where lines is the chalk working, d the indent,
  // who 'rb' for the rulebook's chalk and 'you' for a quoted line the player wrote.
  // The cycle rule (memo §15): if settling needs the sentence being settled, read the cycle; every link "proves" → proved
  // (it says only that it is proved, which proving makes true; Löb 1955); any link "does not prove" → unsettled, and so is
  // every sentence that depends on it (the real system could prove such a sentence only by proving its own consistency).
  function settle(game, rbKey, s, n) {
    var stack = [];
    function key(e, s2, n2) { return e + ':' + s2 + ':' + n2; }
    function go(e, s2, n2, d) {
      var rb = game.rulebooks[e];
      var shape = game.shapes[s2 - 1];
      var lines = [];
      if (d > CONFIG.MAX_DEPTH) return { v: 'loop', lines: [{ t: 'This has no end.', d: d }] };
      if (!shape) return { v: 'cross', lines: [{ t: 'There is no shape ' + s2 + ' on the board, so nothing is proved.', d: d }] };
      var rule = ruleFor(rb, s2, n2, game.rulebooks);
      if (rule) {
        lines.push({ t: 'Rule ' + rule.no + ' of Rulebook ' + rule.of + ' settles it outright: ' + (rule.v === 'tick' ? 'proved.' : 'refuted.'), d: d });
        return { v: rule.v, lines: lines };
      }
      if (shape.kind === 'arith') {
        var p = PREDS[shape.pred], ok = p.test(n2);
        lines.push({ t: p.why(n2) + ' ' + (ok ? 'Proved.' : 'Refuted.'), d: d });
        return { v: ok ? 'tick' : 'cross', lines: lines };
      }
      // meta: Rulebook shape.rb [pol] shape A filled with B
      var inner = innerOf(shape, n2), ie = shape.rb;
      var innerShape = game.shapes[inner.s - 1];
      var k = key(ie, inner.s, inner.n), idx = -1, self = k === key(e, s2, n2);
      for (var i = 0; i < stack.length; i++) if (stack[i].k === k) { idx = i; break; }
      if (self || idx >= 0) {
        // a cycle: the sentence refers to itself, or to a sentence still being settled (links from stack[idx] to here, plus this link)
        var allPos = shape.pol === '+';
        if (!self) for (var j = idx; j < stack.length; j++) if (stack[j].pol === '-') allPos = false;
        if (self) lines.push({ t: 'Shape ' + inner.s + ' filled with ' + inner.n + ' is: this very sentence.', d: d, mark: 'self' });
        else lines.push({ t: 'Shape ' + inner.s + ' filled with ' + inner.n + ' is a sentence already waiting to be settled: a circle.', d: d, mark: 'self' });
        if (allPos) {
          lines.push({ t: 'If I prove it, it says I prove it: true. Proved.', d: d });
          return { v: 'tick', lines: lines, cycle: true };
        }
        lines.push({ t: 'If I prove it, it says I do not: I would have proved a false sentence.', d: d });
        lines.push({ t: 'If I refute it, I am saying that I prove it: false too.', d: d });
        lines.push({ t: 'Neither. Unsettled.', d: d, mark: 'loop' });
        return { v: 'loop', lines: lines, cycle: true };
      }
      lines.push({ t: 'Shape ' + inner.s + ' filled with ' + inner.n + ' is: ' + (innerShape ? shapeText(innerShape, inner.n) : '(empty)') + '.', d: d, who: (innerShape && innerShape.you) ? 'you' : 'rb' });
      stack.push({ k: key(e, s2, n2), pol: shape.pol });
      var r = go(ie, inner.s, inner.n, d + 1);
      stack.pop();
      lines = lines.concat(r.lines);
      if (r.v === 'loop') {
        lines.push({ t: 'That one has no end, so this one has none either. Unsettled.', d: d, mark: 'loop' });
        return { v: 'loop', lines: lines, cycle: !!r.cycle };
      }
      if (r.v === 'cross' && !CONFIG.GENEROUS_LEDGER) {
        lines.push({ t: 'I refuted it, but to certify that I never prove it I would need my own certificate. Unsettled.', d: d, mark: 'loop' });
        return { v: 'loop', lines: lines };
      }
      var proves = r.v === 'tick';
      lines.push({ t: 'So Rulebook ' + game.rulebooks[ie].label + (proves ? ' proves' : ' does not prove') + ' shape ' + inner.s + ' filled with ' + inner.n + '.', d: d });
      var v = (shape.pol === '+') === proves ? 'tick' : 'cross';
      lines.push({ t: v === 'tick' ? 'Proved.' : 'Refuted.', d: d });
      return { v: v, lines: lines };
    }
    return go(rbKey, s, n, 0);
  }

  // The certificate: "Rulebook e never proves a sentence and its opposite" (paper: Wid(c), Proposition XI).
  // Settled by the chain Wid(c) → 17 Gen r: to prove the certificate the rulebook would have to prove its loophole.
  function settleCertificate(game, rbKey) {
    var rb = game.rulebooks[rbKey], g = loopholeOf(game, rbKey);
    var lines = [];
    if (!g) return { v: 'loop', lines: [{ t: 'Unsettled.', d: 0, mark: 'loop' }] };
    var r = settle(game, rbKey, g.s, g.n);
    lines.push({ t: 'Suppose Rulebook ' + rb.label + ' never contradicts itself.', d: 0 });
    lines.push({ t: 'Then it never proves shape ' + g.s + ' filled with ' + g.n + ': proving that would contradict what it says.', d: 0 });
    lines.push({ t: 'So what shape ' + g.s + ' filled with ' + g.n + ' says is so, and the certificate would prove it.', d: 0 });
    if (r.v === 'loop') {
      lines.push({ t: 'Rulebook ' + rb.label + ' cannot prove shape ' + g.s + ' filled with ' + g.n + ', so it cannot prove the certificate.', d: 0 });
      lines.push({ t: 'Unsettled.', d: 0, mark: 'loop' });
      return { v: 'loop', lines: lines };
    }
    lines.push({ t: 'But Rulebook ' + rb.label + ' proves shape ' + g.s + ' filled with ' + g.n + ' outright, so it proves a sentence that says it does not: it contradicts itself. The certificate is false.', d: 0 });
    return { v: 'cross', lines: lines };
  }
  // The loophole sentence of a rulebook: its own "does not prove shape □ filled with □" shape, filled with that shape's number.
  function loopholeOf(game, rbKey) {
    var rb = game.rulebooks[rbKey];
    for (var i = 0; i < game.shapes.length; i++) {
      var sh = game.shapes[i];
      if (sh && sh.kind === 'meta' && sh.rb === rb.edition && sh.pol === '-' && sh.A === 'hole' && sh.B === 'hole') return { s: i + 1, n: i + 1 };
    }
    return null;
  }

  // ---------- the game ----------
  function newGame() {
    var g = {
      shapes: CONFIG.SHAPES.map(function (s) { return Object.assign({}, s); }),
      rulebooks: { 1: newRulebook(1, '1', [], null) },
      current: 1,          // the rulebook on the board
      ledger: [],          // every run: {rb, s, n, v, text, scene}
      act: 1, scene: 1,    // 1.1 the rulebook; 1.2 the composer; 1.3 the loophole; 2.1 first rule; 2.2 second rule; 2.3 certificate; 3 verdict
      runsInScene: 0,
      record: { toLoophole: 0, foundBy: null, triedPraise: false, firstRule: null, rb2: {}, bet: null, pagesShown: 0 },
      composer: null,      // the last written shape 6, for the composer's chips
      rulesTried: []
    };
    g.yourLine = g.shapes.length; // the index of the line the player writes (line 6 on the paper's board)
    g.shapes.push(null); // line 6, to be written
    return g;
  }
  function shapeCount(game) { return game.shapes.length; }
  function numbersOffered(game) { var out = [], n = game.shapes.filter(function (s) { return !!s; }).length; for (var i = 1; i <= n; i++) out.push(i); return out; }

  // Run shape s filled with n on the rulebook on the board. Returns the result with the lines and where the player stands.
  function run(game, s, n) {
    var shape = game.shapes[s - 1];
    if (!shape) return { ok: false, line: 'Shape ' + s + ' is empty.' };
    var r = settle(game, game.current, s, n);
    var rec = { rb: game.current, s: s, n: n, v: r.v, text: sentenceText(game, s, n), scene: game.act + '.' + game.scene };
    game.ledger.push(rec);
    game.runsInScene++;
    var out = { ok: true, s: s, n: n, v: r.v, lines: r.lines, text: rec.text, status: status(game), next: null };
    if (game.act === 1) {
      game.record.toLoophole++;
      if (r.v === 'tick' && r.cycle) game.record.triedPraise = true;
      if (game.scene === 1 && game.runsInScene >= CONFIG.BUDGET.beforeComposer) { game.scene = 2; game.runsInScene = 0; out.next = 'composer'; }
      else if (game.scene === 2) {
        if (r.v === 'loop') { game.scene = 3; game.record.foundBy = game.record.foundBy || 'you'; out.next = 'loophole'; }
        else if (game.runsInScene >= CONFIG.BUDGET.composerRuns) { out.next = 'godel'; }
      }
    } else if (game.act === 2 && game.rb2hunt) {
      var h = game.rb2hunt; h.runs++;
      if (r.v === 'loop') { h.found = h.found || 'you'; out.next = 'rb2found'; }
      else if (h.runs >= CONFIG.BUDGET.findRb2) out.next = 'rb2godel';
    }
    return out;
  }
  function status(game) {
    var runs = game.ledger.filter(function (e) { return e.scene.charAt(0) === String(game.act); });
    var un = runs.filter(function (e) { return e.v === 'loop'; }).length;
    return { run: runs.length, settled: runs.length - un, unsettled: un };
  }

  // Write shape 6 from the composer's parts (pol '+'/'-', A and B each 'hole' or 1–5). Returns the shape's text.
  function writeShape6(game, pol, A, B) {
    var sh = { kind: 'meta', rb: 1, pol: pol, A: A, B: B, you: true };
    game.shapes[game.yourLine] = sh; game.composer = { pol: pol, A: A, B: B };
    return shapeText(sh);
  }
  // Gödel's chalk writes shape 6 (after the composer budget).
  function godelWrites(game) {
    var sh = Object.assign({}, CONFIG.GODEL); game.shapes[game.yourLine] = sh; game.record.foundBy = 'godel';
    return shapeText(sh);
  }
  function enterLoophole(game) { game.scene = 3; }

  // ---------- Act II ----------
  function startActTwo(game) { game.act = 2; game.scene = 1; game.runsInScene = 0; }
  // Add a rule to Rulebook 1: which = 'loop' (the loophole sentence, proved) or 'opp' (its opposite: the sentence refuted).
  function addRule(game, which) {
    var g = loopholeOf(game, 1);
    var rules = [{ no: 3, of: which === 'loop' ? '2' : '2\u2032', s: g.s, n: g.n, v: which === 'loop' ? 'tick' : 'cross', text: which === 'loop' ? sentenceText(game, g.s, g.n) : 'Rulebook 1 proves shape ' + g.s + ' filled with ' + g.n }];
    if (!game.record.firstRule) game.record.firstRule = which;
    game.rulesTried.push(which);
    var key, label;
    if (which === 'loop') {
      key = 2; label = '2';
      game.rulebooks[key] = newRulebook(2, label, rules, 1);
      // every rulebook gets a shape about itself: the paper's construction run again for c + 17 Gen r
      game.shapes.push({ kind: 'meta', rb: 2, pol: '-', A: 'hole', B: 'hole' });
      game.current = key;
      game.rb2hunt = { runs: 0, found: null };
      game.record.rb2 = game.rb2hunt;
      return { key: key, label: label, newShape: game.shapes.length, newShapeText: shapeText(game.shapes[game.shapes.length - 1]), ruleText: rules[0].text };
    }
    key = 'opp'; label = '2′';
    game.rulebooks[key] = newRulebook(2, label, rules, 1);
    game.current = key;
    return { key: key, label: label, ruleText: rules[0].text, exists: 'Some page of Rulebook 1’s ledger proves shape ' + g.s + ' filled with ' + g.n };
  }
  // Gödel fills Rulebook 2's loophole when the player's runs are spent.
  function godelFillsRb2(game) { var g = loopholeOf(game, 2); game.rb2hunt.found = 'godel'; var r = settle(game, 2, g.s, g.n); game.ledger.push({ rb: 2, s: g.s, n: g.n, v: r.v, text: sentenceText(game, g.s, g.n), scene: '2.g' }); return { s: g.s, n: g.n, v: r.v, lines: r.lines, text: sentenceText(game, g.s, g.n) }; }
  // Rulebook 2′: show page k of Rulebook 1's ledger (the player's own Act I runs). Each is refuted as a proof of the loophole.
  function pages(game) { return game.ledger.filter(function (e) { return e.rb === 1; }); }
  function showPage(game, k) {
    var p = pages(game), g = loopholeOf(game, 1), e = p[k - 1];
    game.record.pagesShown = Math.max(game.record.pagesShown, k);
    if (!e) return { k: k, v: 'cross', lines: [{ t: 'Page ' + k + ' and every page after: Rulebook 1 has no end of pages, and none proves shape ' + g.s + ' filled with ' + g.n + ', since Rulebook 1 never settles it. Refuted, every one.', d: 0 }] };
    var what = e.v === 'tick' ? 'a proof of “' + e.text + '”' : (e.v === 'cross' ? 'a refutation of “' + e.text + '”' : 'the sentence “' + e.text + '”, left unsettled');
    return { k: k, v: 'cross', lines: [{ t: 'Page ' + k + ' is ' + what + ': not a proof of shape ' + g.s + ' filled with ' + g.n + '. Refuted.', d: 0 }] };
  }
  // The other rule, after the first: rebuild from Rulebook 1.
  function otherRule(game) { return game.rulesTried[0] === 'loop' ? 'opp' : 'loop'; }
  // Back to Rulebook 1's board: Rulebook 2's own shape goes with it (it is about a rulebook that is no longer on the board).
  function leaveRulebook2(game) { var last = game.shapes[game.shapes.length - 1]; if (game.current === 2 && last && last.kind === 'meta' && last.rb === 2) game.shapes.pop(); game.current = 1; game.rb2hunt = null; game.scene++; game.runsInScene = 0; }

  // The certificate round.
  function placeBet(game, yes) { game.record.bet = yes ? 'yes' : 'no'; }
  function runCertificate(game) { game.current = 1; var r = settleCertificate(game, 1); game.ledger.push({ rb: 1, s: 'cert', n: 0, v: r.v, text: certificateText(game, 1), scene: '2.3' }); return r; }
  function certificateText(game, rbKey) { return 'Rulebook ' + game.rulebooks[rbKey].label + ' never proves a sentence and its opposite'; }

  // ---------- the verdict, in words ----------
  function verdict(game) {
    var R = game.record, g = loopholeOf(game, 1), L = [];
    L.push({ h: 'What the paper found', t: 'Any rulebook for whole numbers that works by fixed rules has a sentence it can neither prove nor refute, and that sentence is true. Add it as a rule and the new rulebook has a loophole of its own. Add its opposite and the rulebook says a page proves it and refutes every page. And no such rulebook can certify that it never contradicts itself.' });
    var you = [];
    if (R.foundBy === 'you') you.push('You found Rulebook 1’s loophole yourself, on your ' + ordinal(R.toLoophole) + ' sentence: shape ' + g.s + ' filled with ' + g.n + '.');
    else you.push('You ran ' + R.toLoophole + ' sentences, and Gödel’s chalk wrote shape ' + g.s + ' for you; you filled it with its own number and watched the loop.');
    if (R.triedPraise) you.push('You tried the sentence that only says it is proved, and the rulebook proved it: a cheap tick.');
    if (R.firstRule) you.push('You added ' + (R.firstRule === 'loop' ? 'the loophole sentence first: Rulebook 2 got a shape of its own, ' + (R.rb2.found === 'you' ? 'and you found its loophole ' + (R.rb2.runs === 1 ? 'at once' : 'on your ' + ordinal(R.rb2.runs) + ' run') : 'and Gödel had to fill its loophole for you') + '.' : 'the opposite first: Rulebook 2′ proved that a page of the ledger proves the sentence and refuted every page you showed it.'));
    if (R.bet) you.push('You bet that Rulebook 1 ' + (R.bet === 'yes' ? 'would' : 'would not') + ' prove its own certificate. It ' + (R.bet === 'yes' ? 'did not.' : 'did not: your bet stood.'));
    L.push({ h: 'What you found', t: you.join(' ') });
    var part = [];
    if (R.foundBy !== 'you') part.push('Gödel found the shape in 1930 with no parts to choose from; you had the parts and the budget ran out. The idea the paper adds to the parts: a shape cannot name its own number, so leave the number as a hole and fill the hole with the shape’s line.');
    if (R.bet === 'yes') part.push('You expected the rulebook to vouch for itself. The paper’s last proposition is that it cannot.');
    if (!part.length) part.push('Nowhere: every loophole you met, you opened yourself, and your bet on the certificate was the paper’s.');
    L.push({ h: 'Where you part', t: part.join(' ') });
    L.push({ h: 'Had yours stood', t: R.bet === 'yes' ? 'Had Rulebook 1 proved its own certificate, it would have proved the loophole sentence too, and a rulebook that proves a sentence saying it does not prove it contradicts itself: the only rulebook that certifies itself is a broken one.' : 'Had a rule closed the loophole for good, Hilbert would have been right and the paper would not exist: every rule you added gave the chalk a new sentence to write.' });
    return L;
  }
  function ordinal(n) { return n + (n % 10 === 1 && n !== 11 ? 'st' : n % 10 === 2 && n !== 12 ? 'nd' : n % 10 === 3 && n !== 13 ? 'rd' : 'th'); }

  var API = { CONFIG: CONFIG, newGame: newGame, shapeText: shapeText, sentenceText: sentenceText, settle: settle, settleCertificate: settleCertificate, loopholeOf: loopholeOf, run: run, status: status, writeShape6: writeShape6, godelWrites: godelWrites, enterLoophole: enterLoophole, startActTwo: startActTwo, addRule: addRule, godelFillsRb2: godelFillsRb2, pages: pages, showPage: showPage, otherRule: otherRule, leaveRulebook2: leaveRulebook2, placeBet: placeBet, runCertificate: runCertificate, certificateText: certificateText, verdict: verdict, numbersOffered: numbersOffered, shapeCount: shapeCount, sameShape: sameShape, PREDS: PREDS, newRulebook: newRulebook };
  if (typeof module !== 'undefined' && module.exports) module.exports = API; else root.GL = API;
})(typeof window !== 'undefined' ? window : this);
