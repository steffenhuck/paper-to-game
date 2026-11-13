// Voting with Arrow: the mechanism. The only copy; build.py inlines this file verbatim into the game.
// Paper: Arrow, K. J. (1950), "A Difficulty in the Concept of Social Welfare", Journal of Political Economy 58(4): 328-346.
// Kind: PORTED. Arrow's own small case (Part III, sec. 1; Part IV, sec. 2): two individuals, three alternatives.
// A "rule book" here is a social welfare function that satisfies Conditions 2, 3 and 4 by construction, on strict ballots:
//   Condition 3 (independence of irrelevant alternatives, p. 337): each pair is settled from the two ballots' order of that pair alone;
//   Consequence 1 (p. 340, from Conditions 2-4): where both put x above y, so does the commune;
//   so the rule book is six rulings: for each of three pairs and each of the two ways the voters can disagree about it,
//   Anna's way, Beat's way, or level (social indifference). 3^6 = 729 rule books.
// Condition 1 with Axioms I-II (p. 331-332, 336) asks that the outcome be a weak ordering ("a list") for every pair of ballots.
// Condition 5 with Definition 5 (p. 339): no voter i such that x P_i y implies x P y whatever the other voter's ballot.
(function (root) {
  'use strict';

  var CONFIG = {
    voters: ['Anna', 'Beat'],                 // our choice: names for Arrow's individuals 1 and 2 (p. 340)
    plans: ['Fountain', 'Tower', 'Tree'],     // our choice: names for Arrow's alternatives x, y, z (p. 340); drawn as circle, square, triangle
    nVoters: 2,                               // Part III sec. 1 (p. 336): "the society under study contains only two individuals"
    nPlans: 3,                                // Part III sec. 1 (p. 336): "the total number of alternatives which are conceivable is three"
    // Opening ballots, as [Anna, Beat], each best to worst. The first is Arrow's own last step, eq. (7) (p. 342):
    // individual 1 has x, y, z and individual 2 has z, x, y. The other two are the same pair with the plans renamed
    // (our choice: so that a second and third game do not open on the same picture; chosen among the renamings for which three what-ifs always complete the book).
    openings: [[[0, 1, 2], [2, 0, 1]], [[0, 2, 1], [1, 0, 2]], [[2, 0, 1], [1, 2, 0]]],
    whatIfs: 3,                               // our choice: three what-ifs, each opening two new ties, complete the six-line book (checked over every path)
    valuesPerRuling: 3,                       // Anna's way, level, Beat's way: P, I, and the reverse P (Definitions 1-2, p. 332)
    clara: [0, 1, 2]                          // our choice: the ballot the hired tie-breaker, a third voter who never changes her mind, starts with
  };

  // ---------- the paper's objects ----------
  var PAIRS = [[0, 1], [1, 2], [0, 2]];
  var BALLOTS = [[0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0]];   // strict orderings, best to worst
  // All weak orderings of three things (Axioms I and II), as rank arrays: rank[plan] = step, 0 is the top step; equal rank = level.
  var LISTS = (function () {
    var out = [], a, b, c;
    for (a = 0; a < 3; a++) for (b = 0; b < 3; b++) for (c = 0; c < 3; c++) {
      var r = [a, b, c], used = [false, false, false]; r.forEach(function (v) { used[v] = true; });
      var top = Math.max(a, b, c), ok = true; for (var k = 0; k <= top; k++) if (!used[k]) ok = false;
      if (ok) out.push(r);
    }
    return out;   // 13 of them
  })();
  function rankOf(ballot) { var r = []; ballot.forEach(function (x, i) { r[x] = i; }); return r; }
  function ballotIndex(ballot) { for (var i = 0; i < 6; i++) if (BALLOTS[i].join() === ballot.join()) return i; return -1; }
  function sameList(rank, ballot) { var r = rankOf(ballot); return r[0] === rank[0] && r[1] === rank[1] && r[2] === rank[2]; }
  function tiers(rank) { var t = []; rank.forEach(function (s, plan) { (t[s] = t[s] || []).push(plan); }); return t; }

  // How the two ballots stand on pair p. Either they agree, or they disagree in one of two ways (a "cell" of the rule book).
  // cell = 2*p + d, d = 0 when Anna puts the pair's first plan above its second (and Beat the reverse), d = 1 the other way round.
  function pairInfo(anna, beat, p) {
    var a = PAIRS[p][0], b = PAIRS[p][1], ra = rankOf(anna), rb = rankOf(beat);
    var A = ra[a] < ra[b], B = rb[a] < rb[b];
    if (A === B) return { pair: p, agree: true, winner: A ? a : b, loser: A ? b : a };
    return { pair: p, agree: false, cell: 2 * p + (A ? 0 : 1), annaFor: A ? a : b, beatFor: A ? b : a };
  }
  // What the rule book says about pair p for these ballots: the plan on top, or -1 for level, or null where the ruling is still open.
  function pairOutcome(book, info) {
    if (info.agree) return info.winner;
    var v = book[info.cell];
    if (v == null) return null;
    return v === 'A' ? info.annaFor : v === 'B' ? info.beatFor : -1;
  }
  function relIn(rank, p) { var a = PAIRS[p][0], b = PAIRS[p][1]; return rank[a] < rank[b] ? a : rank[a] > rank[b] ? b : -1; }

  // The lists that can be posted on a Sunday: every weak ordering that agrees with the two voters where they agree
  // and with every ruling already in the book. Open rulings leave their pair free.
  function legalLists(book, anna, beat) {
    return LISTS.filter(function (rank) {
      for (var p = 0; p < 3; p++) {
        var o = pairOutcome(book, pairInfo(anna, beat, p));
        if (o !== null && relIn(rank, p) !== o) return false;
      }
      return true;
    });
  }
  // The rulings a list would add to the book: for each open pair, whose way the list goes.
  function newRulings(book, anna, beat, rank) {
    var out = [];
    for (var p = 0; p < 3; p++) {
      var info = pairInfo(anna, beat, p);
      if (info.agree || book[info.cell] != null) continue;
      var top = relIn(rank, p);
      out.push({ cell: info.cell, pair: p, value: top === -1 ? 'E' : top === info.annaFor ? 'A' : 'B', top: top, annaFor: info.annaFor, beatFor: info.beatFor });
    }
    return out;
  }
  function post(book, anna, beat, rank) {
    var b = book.slice(); newRulings(book, anna, beat, rank).forEach(function (r) { b[r.cell] = r.value; }); return b;
  }
  function emptyBook() { return [null, null, null, null, null, null]; }
  function isComplete(book) { return book.every(function (v) { return v != null; }); }
  function openCount(book, anna, beat) {
    var n = 0; for (var p = 0; p < 3; p++) { var i = pairInfo(anna, beat, p); if (!i.agree && book[i.cell] == null) n++; } return n;
  }

  // ---------- Arrow's calendar (ours: which pair of ballots he brings as each what-if) ----------
  // What-if 1: an opening from CONFIG (Arrow's eq. 7 ballots). After that: among the pairs of ballots that agree on one pair of plans
  // and open exactly two new ties, the one that leaves the most rankings possible (always five). Ties go to the first in reading order.
  // Returns null when the book is complete.
  function nextBallots(book, sunday, game) {
    if (sunday === 0) { var o = CONFIG.openings[(game || 0) % CONFIG.openings.length]; return { anna: o[0], beat: o[1] }; }
    if (isComplete(book)) return null;
    var cands = [];
    for (var i = 0; i < 6; i++) for (var j = 0; j < 6; j++) {
      if (i === j) continue;
      var f = openCount(book, BALLOTS[i], BALLOTS[j]); if (f !== 2) continue;
      var L = legalLists(book, BALLOTS[i], BALLOTS[j]).length; if (!L) continue;
      cands.push({ i: i, j: j, L: L });
    }
    if (!cands.length) return null;   // never happens from the openings (calibration checks every path)
    cands.sort(function (x, y) { return y.L - x.L || (x.i * 6 + x.j) - (y.i * 6 + y.j); });
    return { anna: BALLOTS[cands[0].i], beat: BALLOTS[cands[0].j] };
  }

  // ---------- Arrow's own argument (pp. 340-342), as a chain of forced what-ifs ----------
  // Start with one tie given to a voter. Repeatedly bring a pair of ballots that opens exactly one new tie and leaves exactly one
  // ranking; that ranking gives the new tie to the same voter. After five steps all six ties are that voter's: Definition 5.
  function chain(voter, cell) {
    var book = emptyBook(); book[cell] = voter; var steps = [];
    while (!isComplete(book)) {
      var found = null;
      for (var i = 0; i < 6 && !found; i++) for (var j = 0; j < 6 && !found; j++) {
        if (i === j || openCount(book, BALLOTS[i], BALLOTS[j]) !== 1) continue;
        var L = legalLists(book, BALLOTS[i], BALLOTS[j]); if (L.length !== 1) continue;
        var nr = newRulings(book, BALLOTS[i], BALLOTS[j], L[0]);
        found = { anna: BALLOTS[i], beat: BALLOTS[j], list: L[0], cell: nr[0].cell, value: nr[0].value, annaFor: nr[0].annaFor, beatFor: nr[0].beatFor };
      }
      if (!found) return null;
      book = post(book, found.anna, found.beat, found.list); found.book = book.slice(); steps.push(found);
    }
    return { steps: steps, book: book };
  }
  // The real Sunday: one of the 36 pairs of ballots, drawn by chance. rnd is a function returning a number in [0, 1).
  function drawSunday(rnd) { var k = Math.floor(rnd() * 36); if (k > 35) k = 35; return { k: k, anna: BALLOTS[Math.floor(k / 6)], beat: BALLOTS[k % 6] }; }

  // ---------- one Sunday read against a complete book ----------
  // Why three pair results make no list: find plans a, b, c with a at least as good as b, b at least as good as c,
  // and the book saying something else about a and c than follows (Axiom II, transitivity; Lemma (c), (d), (f), p. 332).
  function clashOf(top) {   // top[p] = plan on top for pair p, or -1 level
    function rel(a, b) {    // '>' a above b, '<' below, '=' level
      for (var p = 0; p < 3; p++) {
        if ((PAIRS[p][0] === a && PAIRS[p][1] === b) || (PAIRS[p][0] === b && PAIRS[p][1] === a)) return top[p] === -1 ? '=' : top[p] === a ? '>' : '<';
      }
    }
    var best = null;
    BALLOTS.forEach(function (o) {
      var a = o[0], b = o[1], c = o[2], ab = rel(a, b), bc = rel(b, c), ac = rel(a, c);
      if (ab === '<' || bc === '<') return;
      var expect = (ab === '=' && bc === '=') ? '=' : '>';
      if (ac === expect) return;
      var c1 = { a: a, b: b, c: c, ab: ab, bc: bc, expect: expect, actual: ac, circle: ab === '>' && bc === '>' && ac === '<' };
      // prefer a full circle; then a chain that starts with a strict step
      var score = (c1.circle ? 4 : 0) + (ab === '>' ? 2 : 0) + (bc === '>' ? 1 : 0);
      if (!best || score > best.score) { best = c1; best.score = score; }
    });
    return best;
  }
  function readSunday(book, anna, beat) {
    var infos = [], top = [];
    for (var p = 0; p < 3; p++) { var info = pairInfo(anna, beat, p); info.top = pairOutcome(book, info); info.value = info.agree ? null : book[info.cell]; infos.push(info); top.push(info.top); }
    var lists = legalLists(book, anna, beat);
    var list = lists.length === 1 ? lists[0] : null;
    return {
      anna: anna, beat: beat, pairs: infos, list: list, clash: list ? null : clashOf(top),
      isAnnas: !!list && sameList(list, anna), isBeats: !!list && sameList(list, beat)
    };
  }
  // All 36 Sundays that could ever come, read against a complete book. Row = Anna's ballot, column = Beat's.
  function audit(book) {
    var cells = [], holds = 0, annas = 0, beats = 0;
    for (var i = 0; i < 6; i++) for (var j = 0; j < 6; j++) {
      var s = readSunday(book, BALLOTS[i], BALLOTS[j]); s.row = i; s.col = j; cells.push(s);
      if (s.list) holds++; if (s.isAnnas) annas++; if (s.isBeats) beats++;
    }
    return { cells: cells, holds: holds, broken: 36 - holds, annas: annas, beats: beats };
  }

  // ---------- what kind of rule book it is ----------
  // Definition 5 (p. 339), checked as written: voter i is a dictator if on every pair of ballots, whenever i puts x above y, so does the commune.
  function dictator(book) {
    var who = [true, true];
    for (var i = 0; i < 6; i++) for (var j = 0; j < 6; j++) for (var p = 0; p < 3; p++) {
      var info = pairInfo(BALLOTS[i], BALLOTS[j], p), o = pairOutcome(book, info);
      var annaTop = info.agree ? info.winner : info.annaFor, beatTop = info.agree ? info.winner : info.beatFor;
      if (o !== annaTop) who[0] = false; if (o !== beatTop) who[1] = false;
    }
    return who[0] ? 'A' : who[1] ? 'B' : null;
  }
  // A "custom" book (our word): the same plan wins every disagreement about a pair, whoever is for it. customOrder gives, for each
  // pair, the plan that always wins, when all three pairs are like that; and the order itself when the three winners make one.
  function custom(book) {
    var wins = [];
    for (var p = 0; p < 3; p++) {
      var v0 = book[2 * p], v1 = book[2 * p + 1];
      // d = 0: Anna is for the pair's first plan. 'A' then means the first plan wins; at d = 1 'B' means the first plan wins.
      var w0 = v0 === 'A' ? PAIRS[p][0] : v0 === 'B' ? PAIRS[p][1] : -1, w1 = v1 === 'B' ? PAIRS[p][0] : v1 === 'A' ? PAIRS[p][1] : -1;
      if (w0 === -1 || w0 !== w1) return null;
      wins.push(w0);
    }
    var score = [0, 0, 0]; wins.forEach(function (w) { score[w]++; });
    var order = [0, 1, 2].sort(function (x, y) { return score[y] - score[x]; });
    return { wins: wins, order: (score[order[0]] === 2 && score[order[1]] === 1) ? order : null };
  }
  function counts(book) { var c = { A: 0, E: 0, B: 0 }; book.forEach(function (v) { if (v) c[v]++; }); return c; }
  function bookIndex(book) { var n = 0; for (var k = 5; k >= 0; k--) n = n * 3 + (book[k] === 'A' ? 0 : book[k] === 'E' ? 1 : 2); return n; }
  function bookFromIndex(n) { var b = []; for (var k = 0; k < 6; k++) { b.push(['A', 'E', 'B'][n % 3]); n = Math.floor(n / 3); } return b; }

  // Every rule book there is (729), with the number of the 36 Sundays on which it gives a list. Computed once.
  var _all = null;
  function allBooks() {
    if (_all) return _all;
    var holds = [], hist = {}, never = [], bestOpen = 0;
    for (var n = 0; n < 729; n++) {
      var b = bookFromIndex(n), h = audit(b).holds; holds.push(h); hist[h] = (hist[h] || 0) + 1;
      if (h === 36) never.push(n); else if (h > bestOpen) bestOpen = h;
    }
    _all = { holds: holds, hist: hist, neverFail: never, bestWithoutBoss: bestOpen, total: 729 };
    return _all;
  }
  // The verdict's facts for a complete book. The words are the interface's; the facts are here.
  function verdict(book) {
    var a = audit(book), all = allBooks(), d = dictator(book), cu = custom(book), c = counts(book);
    var fate = d ? 'boss' : (cu && cu.order && a.holds === all.bestWithoutBoss) ? 'custom' : a.holds === all.bestWithoutBoss ? 'best' : c.E === 6 ? 'level' : 'patchwork';
    return { holds: a.holds, broken: a.broken, of: 36, boss: d, custom: cu, counts: c, fate: fate, best: all.bestWithoutBoss, index: bookIndex(book), annas: a.annas, beats: a.beats };
  }

  // ---------- hired tie-breakers (ours: the second act) ----------
  // A tie-breaker is a rule book. If Anna or Beat breaks every tie, the book is that voter's six times over.
  // If Clara, a third voter whose ballot never changes, joins and each pair goes to the majority of three, then Anna and Beat
  // win where they agree (2 of 3) and Clara's ballot decides where they do not: the book in which her order settles every disagreement.
  function voterBook(v) { return [v, v, v, v, v, v]; }
  function clarasBook(clara) {
    var r = rankOf(clara), b = [];
    for (var p = 0; p < 3; p++) {
      var first = PAIRS[p][0], second = PAIRS[p][1], w = r[first] < r[second] ? first : second;
      b.push(w === first ? 'A' : 'B'); b.push(w === second ? 'A' : 'B');
    }
    return b;
  }
  // One Sunday counted as a plain majority of three ballots, pair by pair (the method of the paper's first page, p. 329).
  function majorityOfThree(anna, beat, clara) {
    var ballots = [anna, beat, clara], ranks = ballots.map(rankOf), pairs = [], top = [];
    for (var p = 0; p < 3; p++) {
      var a = PAIRS[p][0], b = PAIRS[p][1], forA = [], forB = [];
      ranks.forEach(function (r, i) { (r[a] < r[b] ? forA : forB).push(i); });
      var w = forA.length > forB.length ? a : b;
      pairs.push({ pair: p, top: w, votes: Math.max(forA.length, forB.length), winners: forA.length > forB.length ? forA : forB }); top.push(w);
    }
    var lists = LISTS.filter(function (rank) { return relIn(rank, 0) === top[0] && relIn(rank, 1) === top[1] && relIn(rank, 2) === top[2]; });
    return { pairs: pairs, list: lists.length ? lists[0] : null, clash: lists.length ? null : clashOf(top) };
  }

  root.MECH = {
    CONFIG: CONFIG, PAIRS: PAIRS, BALLOTS: BALLOTS, LISTS: LISTS,
    rankOf: rankOf, ballotIndex: ballotIndex, sameList: sameList, tiers: tiers,
    pairInfo: pairInfo, pairOutcome: pairOutcome, legalLists: legalLists, newRulings: newRulings, post: post,
    emptyBook: emptyBook, isComplete: isComplete, nextBallots: nextBallots, chain: chain, drawSunday: drawSunday, openCount: openCount,
    readSunday: readSunday, audit: audit, clashOf: clashOf, dictator: dictator, custom: custom, counts: counts,
    bookIndex: bookIndex, bookFromIndex: bookFromIndex, allBooks: allBooks, verdict: verdict,
    voterBook: voterBook, clarasBook: clarasBook, majorityOfThree: majorityOfThree
  };
})(typeof module !== 'undefined' && module.exports ? module.exports : this);
