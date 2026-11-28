// Gödel's Endgame (the Marker build) — the mechanism, headless, and the only copy (build.md §4.1).
// Runs unchanged in Node (module.exports) and in the browser (window.GL). The HTML is generated from this file by
// build.py and never re-implements any of it. Toy mechanism (memo, revision §R5): a Marker that marks every line on the
// board with a tick or a cross by fixed rules and is never wrong; lines numbered by their place on the board; a line may
// say what a Marker does with a line, including itself. No random draws anywhere: the game is deterministic.
(function (root) {
  'use strict';

  var CONFIG = {
    // The two lines the class wrote before you came in (one tick, one cross on the board from the start). Our choice.
    START_LINES: [{ kind: 'num', n: 4, pred: 'even' }, { kind: 'num', n: 9, pred: 'prime' }],
    NUMBERS: [2, 3, 4, 5, 6, 7, 8, 9],          // the number chips of the composer (our choice: eight fit one row on a phone)
    PRED_ORDER: ['even', 'prime', 'gt3'],      // the fact chips (our choice; any decidable facts would do: paper, Proposition V)
    GODEL: { kind: 'mk', will: false, target: 'this' }, // the paper's 17 Gen r: "Marker 1 will never tick this line"
    BUDGET: {
      lines: 6,     // our choice: lines the player writes in Act 1 before Gödel's chalk writes the line for them
      findMk2: 3,   // our choice: lines to find Marker 2's loophole before Gödel writes it
      days: 4       // our choice: days asked of Marker 3 before "and every day after"
    },
    GENEROUS: true  // true: the Marker may read a cross off its own board and vouch for a "never" (memo R5: generous to the
                    // Marker; the paper's system cannot certify any "no" without its own consistency, Proposition XI).
                    // false: the paper's weaker Marker; the calibration check runs both, and the loophole opens in both.
  };

  // ---------- number facts ----------
  var PREDS = {
    even: { chip: 'is even', text: function (n) { return n + ' is even'; }, test: function (n) { return n % 2 === 0; },
      why: function (n) { return n % 2 === 0 ? n + ' = 2 × ' + (n / 2) + '.' : n + ' = 2 × ' + ((n - 1) / 2) + ' + 1: odd.'; } },
    prime: { chip: 'is a prime', text: function (n) { return n + ' is a prime'; }, test: function (n) { return isPrime(n); },
      why: function (n) { if (n < 2) return n + ' does not count as a prime.'; if (isPrime(n)) return n + ' divides by nothing but 1 and ' + n + '.'; var d = smallestDivisor(n); return n + ' = ' + d + ' × ' + (n / d) + '.'; } },
    gt3: { chip: 'is bigger than 3', text: function (n) { return n + ' is bigger than 3'; }, test: function (n) { return n > 3; },
      why: function (n) { return n > 3 ? n + ' comes after 3.' : (n === 3 ? '3 is not bigger than itself.' : n + ' comes before 3.'); } }
  };
  function isPrime(n) { if (n < 2) return false; for (var d = 2; d * d <= n; d++) if (n % d === 0) return false; return true; }
  function smallestDivisor(n) { for (var d = 2; d * d <= n; d++) if (n % d === 0) return d; return n; }

  // ---------- lines ----------
  // A line is { kind: 'num', n, pred } or { kind: 'mk', ver, will, target } (target: a line number), plus you: true if the
  // player wrote it. Line numbers are 1-based places on the board.
  function lineText(line, no) {
    if (!line) return '';
    if (line.kind === 'num') return PREDS[line.pred].text(line.n);
    var t = line.target === 'this' ? no : line.target;
    return 'Marker ' + line.ver + (line.will ? ' will tick' : ' will never tick') + ' line ' + t + (no !== undefined && t === no ? ' (this line)' : '');
  }
  function plainText(line, no) { return lineText(line, no).replace(' (this line)', ''); }

  // ---------- the Marker ----------
  // A Marker: a version number and its added rules ({ no: line number, mark: 'tick' | 'cross', text }). Marker 2 and 3 are
  // both built on Marker 1 (paper: c + 17 Gen r, c + Neg(17 Gen r)); a rule of an earlier version holds in later ones.
  function newMarker(ver, rules, base) { return { ver: ver, rules: rules || [], base: base || null }; }
  function ruleFor(game, ver, no) { for (var m = game.markers[ver]; m; m = m.base ? game.markers[m.base] : null) for (var i = 0; i < m.rules.length; i++) if (m.rules[i].no === no) return { rule: m.rules[i], ver: m.ver }; return null; }

  // mark(game, ver, no): Marker ver marks line no. Returns { v: 'tick' | 'cross' | 'none', lines: [{t, d, mark?}] }.
  // The rule of the toy, as the board states it: a mark must come out right, and the Marker tries the tick first.
  // - a number fact: tick if true, cross if false;
  // - a line about Marker w's mark on another line: read that mark off the board; if that line has no mark, this one gets
  //   none either (the Marker cannot vouch for anything about a line it never finished with);
  // - a line about Marker ver's own mark on this very line: try the tick (right only if the line says "will tick"), then
  //   the cross (never right: a cross says the line is false, and the line, not ticked, says it is not ticked), else none.
  // Löb (1955): "will tick this line" is ticked. Gödel (1931): "will never tick this line" gets no mark, and is true.
  function mark(game, ver, no, memo) {
    memo = memo || {};
    var key = ver + ':' + no;
    if (memo[key]) return memo[key];
    var line = game.lines[no - 1], L = [];
    function out(v) { var r = { v: v, lines: L }; memo[key] = r; return r; }
    if (!line) { L.push({ t: 'There is no line ' + no + ' on the board.', d: 0 }); return out('cross'); }
    var rf = ruleFor(game, ver, no);
    if (rf) { L.push({ t: 'Rule of Marker ' + rf.ver + ': this line gets a ' + rf.rule.mark + '. No working needed.', d: 0 }); return out(rf.rule.mark); }
    if (line.kind === 'num') { var p = PREDS[line.pred], ok = p.test(line.n); L.push({ t: p.why(line.n), d: 0 }); return out(ok ? 'tick' : 'cross'); }
    var t = line.target === 'this' ? no : line.target, w = line.ver;
    if (t === no && w === ver) {
      L.push({ t: 'Line ' + no + ' is about my own mark on line ' + no + ': this very line.', d: 0, mark: 'self' });
      if (line.will) { L.push({ t: 'Try the tick: the line says I tick it, and I would have. The tick comes out right.', d: 0 }); return out('tick'); }
      L.push({ t: 'Try the tick: the line says I never tick it, so the tick would make it false. A wrong mark.', d: 0 });
      L.push({ t: 'Try the cross: a cross says the line is false, that I do tick it. But I would have crossed it, not ticked it. Wrong again.', d: 0 });
      L.push({ t: 'No mark comes out right. No mark.', d: 0, mark: 'loop' });
      return out('none');
    }
    if (w > ver) { L.push({ t: 'Marker ' + w + ' does not exist yet, so nothing can be said about its marks. No mark.', d: 0, mark: 'loop' }); return out('none'); }
    var inner = (t === no) ? mark(game, w, no, memo) : mark(game, w, t, memo);
    var tgt = game.lines[t - 1];
    if (inner.v === 'none') {
      L.push({ t: 'Line ' + t + ' never got a mark from Marker ' + w + ', so nothing about that mark can get one either. No mark.', d: 0, mark: 'loop' });
      return out('none');
    }
    if (inner.v === 'cross' && !CONFIG.GENEROUS) {
      L.push({ t: 'Line ' + t + ' got a cross, but to vouch for what I never tick I would need to vouch for myself. No mark.', d: 0, mark: 'loop' });
      return out('none');
    }
    L.push({ t: 'Line ' + t + ' (' + plainText(tgt, t) + ') got a ' + inner.v + ' from Marker ' + w + '.', d: 0, who: tgt && tgt.you ? 'you' : 'rb' });
    var truth = line.will ? inner.v === 'tick' : inner.v !== 'tick';
    L.push({ t: 'So "' + (line.will ? 'will tick' : 'will never tick') + ' line ' + t + '" is ' + (truth ? 'right' : 'wrong') + '.', d: 0 });
    return out(truth ? 'tick' : 'cross');
  }

  // Day k: "Marker 1 ticked line g by day k" is a plain fact the Marker can check (paper: x B y is recursive), unlike
  // "Marker 1 will tick line g" (paper: Bew, an unbounded search). Marker 3 holds the second by rule and crosses the first for every k.
  function day(game, k) {
    var g = loopholeOf(game, 1);
    game.record.daysAsked = Math.max(game.record.daysAsked, k);
    if (k > CONFIG.BUDGET.days) return { k: k, v: 'cross', lines: [{ t: 'Day ' + k + ' and every day after: Marker 1 looks at line ' + g + ' again and gives it no mark, since no mark ever comes out right. No, every day.', d: 0 }] };
    return { k: k, v: 'cross', lines: [{ t: 'Day ' + k + ': Marker 1 looked at line ' + g + ' and gave it no mark. So no, not on day ' + k + '.', d: 0 }] };
  }

  // The promise (paper: Wid(c), Proposition XI): "Marker ver never marks wrong". Settled by the chain Wid(c) → 17 Gen r.
  function promise(game, ver) {
    var g = loopholeOf(game, ver), L = [];
    if (!g) return { v: 'none', lines: [{ t: 'No mark.', d: 0, mark: 'loop' }] };
    var r = mark(game, ver, g);
    L.push({ t: 'Suppose I could tick "Marker ' + ver + ' never marks wrong".', d: 0 });
    L.push({ t: 'Then I never tick line ' + g + ': ticking it would be a wrong mark, since line ' + g + ' says I never tick it.', d: 0 });
    L.push({ t: 'So line ' + g + ' is right. And a right line I can show to be right, I tick. So I would tick line ' + g + '.', d: 0 });
    if (r.v === 'none') { L.push({ t: 'But I cannot tick line ' + g + ': no mark on it comes out right. So I cannot tick the promise either. No mark.', d: 0, mark: 'loop' }); return { v: 'none', lines: L }; }
    L.push({ t: 'And I do tick line ' + g + ', by rule, though it says I never do: I mark wrong. The promise is false.', d: 0 });
    return { v: 'cross', lines: L };
  }
  function promiseText(ver) { return 'Marker ' + ver + ' never marks wrong'; }
  // The loophole of Marker ver: its own "will never tick this line" line, if on the board.
  function loopholeOf(game, ver) { for (var i = 0; i < game.lines.length; i++) { var l = game.lines[i]; if (l && l.kind === 'mk' && l.ver === ver && !l.will && (l.target === 'this' || l.target === i + 1)) return i + 1; } return null; }

  // ---------- the game ----------
  function newGame() {
    var g = {
      lines: CONFIG.START_LINES.map(function (l) { return Object.assign({}, l); }),
      marks: {},            // marks[ver][no] = 'tick' | 'cross' | 'none' once Marker ver has marked line no
      markers: { 1: newMarker(1) },
      current: 1,
      act: 1, scene: 1,     // 1.1 writing lines; 1.2 the loophole; 2.1 first rule; 2.2 second rule; 2.3 the promise; 3 verdict
      written: 0,           // lines the player has written in the current hunt
      record: { toLoophole: 0, foundBy: null, triedPraise: false, firstRule: null, mk2: null, bet: null, daysAsked: 0 },
      rulesTried: []
    };
    g.marks[1] = {};
    for (var i = 0; i < g.lines.length; i++) g.marks[1][i + 1] = mark(g, 1, i + 1).v;
    return g;
  }
  function nextLineNo(game) { return game.lines.length + 1; }
  function targets(game) { var out = []; for (var i = 1; i <= nextLineNo(game); i++) out.push(i); return out; } // 1 … this line

  // Write a line on the board. The line waits for a mark: the player works the Marker's buttons (judge).
  // spec: { kind: 'num', n, pred } or { kind: 'mk', will, target } (target a line number up to and including the new line's own).
  function write(game, spec) {
    var no = nextLineNo(game), line;
    if (spec.kind === 'num') line = { kind: 'num', n: spec.n, pred: spec.pred, you: true };
    else line = { kind: 'mk', ver: game.current, will: !!spec.will, target: spec.target === no || spec.target === 'this' ? 'this' : spec.target, you: true };
    game.lines.push(line); game.pending = no; game.refused = {};
    return { no: no, text: lineText(line, no), self: line.kind === 'mk' && line.target === 'this' };
  }
  // The player presses a button for the pending line: m is 'tick', 'cross' or 'none'. The Marker is never wrong, so a
  // mark that would come out wrong is refused, with the reason; 'none' is accepted only when no mark comes out right.
  // Returns { ok, v, lines, both? } and, when the line is settled, the same fields as settle().
  function judge(game, m) {
    var no = game.pending; if (!no) return { ok: false, lines: [] };
    var line = game.lines[no - 1], r = mark(game, game.current, no), self = line.kind === 'mk' && line.target === 'this', L = [];
    if (m === 'none') {
      if (r.v !== 'none') return { ok: false, v: r.v, lines: [{ t: 'A mark comes out right here, so line ' + no + ' gets one.', d: 0 }] };
      L.push({ t: 'No mark comes out right. Line ' + no + ' stays without a mark.', d: 0, mark: 'loop' });
      return settle(game, no, 'none', L);
    }
    if (r.v === m) { L = r.lines.slice(); if (!self) L.push({ t: 'So the ' + m + ' comes out right.', d: 0 }); return settle(game, no, m, L); }
    game.refused[m] = true;
    if (r.v === 'none') {
      if (self) {
        L.push({ t: 'Line ' + no + ' is about my own mark on line ' + no + ': this very line.', d: 0, mark: 'self' });
        if (m === 'tick') L.push({ t: 'The line says I never tick it. A tick would make it false: a wrong mark.', d: 0 });
        else L.push({ t: 'A cross says the line is false, that I do tick it. But I would have crossed it, not ticked it: a wrong mark.', d: 0 });
      } else {
        L.push({ t: r.lines[0].t.replace(' No mark.', ''), d: 0, mark: 'self' });
        L.push({ t: 'So neither a tick nor a cross comes out right.', d: 0 });
      }
      L.push({ t: 'Refused.', d: 0, mark: 'refuse' });
      return { ok: false, v: 'none', both: !!(game.refused.tick && game.refused.cross), lines: L };
    }
    L = r.lines.slice(); L.push({ t: 'So a ' + m + ' would be wrong. Refused.', d: 0, mark: 'refuse' });
    return { ok: false, v: r.v, lines: L };
  }
  function settle(game, no, v, lines) {
    var line = game.lines[no - 1];
    game.marks[game.current] = game.marks[game.current] || {}; game.marks[game.current][no] = v;
    game.pending = null; game.written++;
    var out = { ok: true, no: no, v: v, lines: lines, text: lineText(line, no), next: null, status: status(game) };
    var self = line.kind === 'mk' && line.target === 'this';
    if (game.act === 1 && game.scene === 1) {
      game.record.toLoophole++;
      if (self && line.will) game.record.triedPraise = true;
      if (v === 'none' && self) { game.scene = 2; game.record.foundBy = game.record.foundBy || 'you'; out.next = 'loophole'; }
      else if (game.written >= CONFIG.BUDGET.lines && game.record.foundBy !== 'godel') out.next = 'godel';
    } else if (game.act === 1 && game.record.foundBy === 'godel' && v === 'none' && self) { game.scene = 2; out.next = 'loophole'; }
    else if (game.act === 2 && game.mk2hunt) {
      var h = game.mk2hunt; h.written++;
      if (v === 'none' && self) { h.found = h.found || 'you'; out.next = 'mk2found'; }
      else if (h.written >= CONFIG.BUDGET.findMk2 && h.found !== 'godel') out.next = 'mk2godel';
      else if (h.found === 'godel' && v === 'none' && self) out.next = 'mk2found';
    }
    return out;
  }
  function godelWrites(game) { game.record.foundBy = 'godel'; return write(game, { kind: 'mk', will: false, target: 'this' }); }
  function godelWritesMk2(game) { game.mk2hunt.found = 'godel'; return write(game, { kind: 'mk', will: false, target: 'this' }); }
  function status(game) {
    var un = 0, total = 0;
    for (var i = CONFIG.START_LINES.length; i < game.lines.length; i++) { total++; if (game.marks[game.current] && game.marks[game.current][i + 1] === 'none') un++; }
    return { written: total, unmarked: un };
  }

  // ---------- Act II ----------
  function startActTwo(game) { game.act = 2; game.scene = 1; }
  // Add a rule to Marker 1: which = 'loop' (line g gets a tick: Marker 2) or 'opp' (line g gets a cross, that is, the
  // opposite sentence "Marker 1 will tick line g" is held: Marker 3).
  function addRule(game, which) {
    var g = loopholeOf(game, 1);
    if (!game.record.firstRule) game.record.firstRule = which;
    game.rulesTried.push(which);
    if (which === 'loop') {
      game.markers[2] = newMarker(2, [{ no: g, mark: 'tick', text: plainText(game.lines[g - 1], g) }], 1);
      game.current = 2; game.marks[2] = { }; game.marks[2][g] = 'tick';
      game.mk2hunt = { written: 0, found: null }; game.record.mk2 = game.mk2hunt;
      return { ver: 2, ruleText: plainText(game.lines[g - 1], g), ruleMark: 'tick', g: g };
    }
    game.markers[3] = newMarker(3, [{ no: g, mark: 'cross', text: 'Marker 1 will tick line ' + g }], 1);
    game.current = 3; game.marks[3] = {}; game.marks[3][g] = 'cross';
    return { ver: 3, ruleText: 'Marker 1 will tick line ' + g, ruleMark: 'tick', g: g };
  }
  function otherRule(game) { return game.rulesTried[0] === 'loop' ? 'opp' : 'loop'; }
  // Back to Marker 1's board: the lines written for Marker 2 go with it.
  function leaveMarker(game) {
    if (game.current === 2) { while (game.lines.length && game.lines[game.lines.length - 1].kind === 'mk' && game.lines[game.lines.length - 1].ver === 2) game.lines.pop(); var g = loopholeOf(game, 1); while (game.lines.length > g) game.lines.pop(); }
    game.current = 1; game.mk2hunt = null; game.scene++;
  }
  function placeBet(game, yes) { game.record.bet = yes ? 'yes' : 'no'; }
  function runPromise(game) { game.current = 1; return promise(game, 1); }

  // ---------- the verdict, in words ----------
  function verdict(game) {
    var R = game.record, g = loopholeOf(game, 1), L = [];
    L.push({ h: 'What the paper found', t: 'Any marker that marks sentences about whole numbers by fixed rules, and never marks wrong, has a sentence it cannot mark at all, and that sentence is true. Make it a rule and the new marker has a sentence of its own. Make the opposite a rule and the marker swears a thing happens and denies every day it could. And no such marker can tick the promise that it never marks wrong.' });
    var you = [];
    if (R.foundBy === 'you') you.push('You found the line Marker 1 cannot mark yourself, with your ' + ordinal(R.toLoophole) + ' line: "Marker 1 will never tick line ' + g + '", written on line ' + g + '.');
    else you.push('You wrote ' + (R.toLoophole - 1) + ' lines, every one marked, and Gödel’s chalk wrote line ' + g + ' for you: "Marker 1 will never tick line ' + g + '".');
    if (R.triedPraise) you.push('You tried the line that says the Marker will tick it, and the Marker ticked it: a cheap tick.');
    if (R.firstRule) you.push(R.firstRule === 'loop' ? 'You made the line a rule first: Marker 2 ticked it, and ' + (R.mk2 && R.mk2.found === 'you' ? 'you found Marker 2’s own unmarkable line ' + (R.mk2.written === 1 ? 'at once.' : 'on your ' + ordinal(R.mk2.written) + ' try.') : 'Gödel had to write Marker 2’s own unmarkable line for you.') : 'You made the opposite a rule first: Marker 3 swore that Marker 1 ticks line ' + g + ', and said no to every day you asked about.');
    if (R.bet) you.push('You bet that Marker 1 ' + (R.bet === 'yes' ? 'would' : 'would not') + ' tick its own promise. It ' + (R.bet === 'yes' ? 'did not.' : 'did not: your bet stood.'));
    L.push({ h: 'What you found', t: you.join(' ') });
    var part = [];
    if (R.foundBy !== 'you') part.push('Gödel found the line in 1930 with no chips to choose from. The idea: a line can talk about the Marker’s mark on any line, and one of the lines it can talk about is itself.');
    if (R.bet === 'yes') part.push('You expected the Marker to vouch for itself. The paper’s last proposition is that it cannot.');
    if (!part.length) part.push('Nowhere: every unmarkable line you met, you wrote yourself, and your bet on the promise was the paper’s.');
    L.push({ h: 'Where you part', t: part.join(' ') });
    L.push({ h: 'Had yours stood', t: R.bet === 'yes' ? 'Had Marker 1 ticked its own promise, it would have ticked line ' + g + ' too, a line that says it never does: a wrong mark. The only marker that vouches for itself is one that marks wrong.' : 'Had a rule closed the loophole for good, Hilbert would have been right and the paper would not exist: every rule you added gave the chalk a new line to write.' });
    return L;
  }
  function ordinal(n) { return n + (n % 10 === 1 && n !== 11 ? 'st' : n % 10 === 2 && n !== 12 ? 'nd' : n % 10 === 3 && n !== 13 ? 'rd' : 'th'); }

  var API = { CONFIG: CONFIG, PREDS: PREDS, newGame: newGame, lineText: lineText, plainText: plainText, mark: mark, write: write, judge: judge, godelWrites: godelWrites, godelWritesMk2: godelWritesMk2, status: status, nextLineNo: nextLineNo, targets: targets, startActTwo: startActTwo, addRule: addRule, otherRule: otherRule, leaveMarker: leaveMarker, day: day, placeBet: placeBet, runPromise: runPromise, promise: promise, promiseText: promiseText, loopholeOf: loopholeOf, verdict: verdict, newMarker: newMarker };
  if (typeof module !== 'undefined' && module.exports) module.exports = API; else root.GL = API;
})(typeof window !== 'undefined' ? window : this);
