// Calibration check for Leibniz's Register, second build (memo §17). The mechanism is a toy; nothing in the paper is a
// number. What is checked, over many seeds: (1) the draw (four kinds of winter, one remedy helps, one is no better than the fever alone,
// one harms in each; every remedy helps somewhere; bark harms somewhere; the plan's kinds are neighbours as promised);
// (2) the plan's promises (trusting last winter is right at 1691 and 1693 and loses thirty at 1692 and 1697); (3) the
// floors on the letters (the helper of your 1695 winter is in the letters of 1694; every kind's helper is in the
// letters by 1696); (4) the collection and the lookup; (5) the doctors' table and its order; (6) robustness to noise
// and other effect sizes; (7) the words. Run: node calibration.js  (exit 1 on failure)
var M = require('./mechanism.js'), C = M.CONFIG, K = M.KINDS;
var fails = 0, out = [];
function check(name, ok, detail) { out.push((ok ? 'PASS ' : 'FAIL ') + name + (detail !== undefined ? '  — ' + detail : '')); if (!ok) fails++; }
var SEEDS = 300, games = [];
for (var s = 1; s <= SEEDS; s++) games.push(M.newGame(s));
var reseeded = games.filter(function (g) { return g && g.drawSeed !== g.seed; }).length;
out.push('     ' + SEEDS + ' games drawn; reseeded for a floor: ' + reseeded);
check('every seed draws a game', games.every(function (g) { return g; }));

// 1. the draw
check('each kind of winter: one remedy helps, one is no better than the fever alone, one harms', games.every(function (g) { return K.every(function (k) { var v = C.REMEDIES.map(function (r) { return g.effects[k][r]; }).sort(); return v.join() === 'harms,helps,none'; }); }));
check('every remedy helps in some kind (rest and bleeding are live)', games.every(function (g) { return C.REMEDIES.every(function (r) { return K.some(function (k) { return g.effects[k][r] === 'helps'; }); }); }));
check('bark helps in one kind and harms in another (black to white)', games.every(function (g) { return K.some(function (k) { return g.effects[k].bark === 'helps'; }) && K.some(function (k) { return g.effects[k].bark === 'harms'; }); }));
check('A and B share the temperature and differ in wetness (the lookalike); C differs from A in temperature only; D in both', games.every(function (g) { var L = g.letters; return M.temp(L.A) === M.temp(L.B) && M.wet(L.A) !== M.wet(L.B) && M.temp(L.A) !== M.temp(L.C) && M.wet(L.A) === M.wet(L.C) && M.temp(L.A) !== M.temp(L.D) && M.wet(L.A) !== M.wet(L.D); }));
var whichA = {}; games.forEach(function (g) { whichA[g.letters.A] = (whichA[g.letters.A] || 0) + 1; }); out.push('     which winter is A, over seeds: ' + JSON.stringify(whichA));
var whichH = {}; games.forEach(function (g) { var h = M.helper(g.effects, g.letters.A); whichH[h] = (whichH[h] || 0) + 1; }); out.push('     which remedy helps in A, over seeds: ' + JSON.stringify(whichH));
check('plan is the plan', games.every(function (g) { return g.plan.length === 10 && g.plan.join() === C.PLAN.map(function (x) { return g.letters[x]; }).join(); }));
check('twelve letters a year from 1694, none before', games.every(function (g) { return g.years.every(function (y) { return y < C.LETTER_YEAR ? !g.mail[y] : g.mail[y].length === 12; }); }));

// 2. the plan's promises
function trust(g, t) { var game = M.newGame(g.seed); for (var u = 0; u < t; u++) M.give(game, M.DOCTORS.oracle(game, u)); return M.give(game, game.history[t - 1].remedy).dead; }
check('trusting last winter is right at 1691 and 1693 (five die) on every seed', games.every(function (g) { return [1, 3].every(function (t) { return trust(g, t) === C.DEAD.helps; }); }));
check('trusting last winter loses thirty at 1692 and 1697, the lookalike winters, on every seed', games.every(function (g) { return [2, 7].every(function (t) { return trust(g, t) === C.DEAD.harms; }); }));

// 3. the floors
check('the letters of 1694 hold the remedy that helps in your 1695 winter', games.every(function (g) { return M.known(g.mail, [1694], g.plan[5])[M.helper(g.effects, g.plan[5])] === 'helps'; }));
check('the letters of 1694 and 1695 hold the helper of every kind of winter', games.every(function (g) { return K.every(function (k) { return M.known(g.mail, [1694, 1695], k)[M.helper(g.effects, k)] === 'helps'; }); }));
(function () { var n = 0, tot = 0; games.forEach(function (g) { K.forEach(function (k) { var seen = M.known(g.mail, [1694], k); tot++; if (seen[M.helper(g.effects, k)] === 'helps') n++; }); }); out.push('     share of kinds whose helper the letters of 1694 alone show: ' + Math.round(100 * n / tot) + '% (the floor guarantees your 1695 winter; by 1696 all four)'); })();

// 4. the collection and the lookup
(function () {
  var g = M.newGame(3); for (var t = 0; t < 6; t++) M.give(g, 'bark');
  check('no letters held before 1695', M.collection(g, 4).count === 0 && M.mailYears(g, 4).length === 0);
  var c5 = M.collection(g, 5);
  check('at 1695 the collection holds the twelve letters of 1694 and your own 1694', c5.count === 13 && c5.years.join() === '1694' && K.reduce(function (a, k) { return a + c5.groups[k].rows.length; }, 0) === 13);
  var c6 = M.collection(g, 6);
  check('at 1696 it holds twenty-six', c6.count === 26);
  check('tallies add up', K.every(function (k) { var t = c6.groups[k].tally; return C.REMEDIES.every(function (x) { return t[x].helps + t[x].none + t[x].harms === t[x].n; }); }));
  var statuses = (function () { var h = M.newGame(1); var st = []; for (var t = 0; t < 10; t++) st.push(M.give(h, 'rest').lookup.status); return st; })();
  check('lookup along the plan: new, last, new, last, new, then collection every year', statuses.join() === 'new,last,new,last,new,collection,collection,collection,collection,collection', statuses.join());
  check('an eleventh winter is refused', (function () { var h = M.newGame(5); for (var u = 0; u < 10; u++) M.give(h, 'rest'); try { M.give(h, 'rest'); return false; } catch (e) { return true; } })());
  check('an unknown remedy is refused', (function () { try { M.give(M.newGame(2), 'leeches'); return false; } catch (e) { return true; } })());
})();

// 5. the doctors' table (memo §18)
var NAMES = ['oracle', 'readerFrom1690', 'reader', 'memory', 'bark', 'bleeding', 'rest'];
var table = {}, perYear = {};
NAMES.forEach(function (n) { var tot = 0, py = []; games.forEach(function (g) { var r = M.playDoctor(g.seed, n); tot += r.total; r.perYear.forEach(function (d, i) { py[i] = (py[i] || 0) + d; }); }); table[n] = tot / games.length; perYear[n] = py.map(function (d) { return d / games.length; }); });
out.push('     dead over ten winters (of a thousand sick), mean over ' + SEEDS + ' seeds:');
NAMES.forEach(function (n) { out.push('       ' + (n + '                ').slice(0, 18) + Math.round(table[n]) + '   by year: ' + perYear[n].map(function (d) { return Math.round(d); }).join(' ')); });
check('order: oracle < collection from 1690 < collection from 1694 < memory alone', table.oracle < table.readerFrom1690 && table.readerFrom1690 < table.reader && table.reader < table.memory, Math.round(table.oracle) + ' < ' + Math.round(table.readerFrom1690) + ' < ' + Math.round(table.reader) + ' < ' + Math.round(table.memory));
check('oracle loses exactly fifty', table.oracle === 50);
check('the reader loses five every winter from 1695: near perfect information', [5, 6, 7, 8, 9].every(function (t) { return perYear.reader[t] === 5; }));
check('the reader is the memory doctor until 1694', [0, 1, 2, 3, 4].every(function (t) { return perYear.reader[t] === perYear.memory[t]; }));
check('the memory doctor loses most on the lookalike winters 1692 and 1697', [2, 7].every(function (t) { return perYear.memory[t] > 22 && perYear.memory[t] > perYear.memory[t - 1]; }), perYear.memory.map(Math.round).join(' '));
check('the collection from 1690 loses five from 1691 on, or nearly', [1, 2, 3, 4].every(function (t) { return perYear.readerFrom1690[t] < 9; }), perYear.readerFrom1690.map(Math.round).join(' '));
out.push('     a fixed remedy against the memory doctor: ' + Math.round(table.bleeding) + ' vs ' + Math.round(table.memory));
check('spread: the memory doctor loses at least three times what the best possible loses', table.memory >= 3 * table.oracle, Math.round(table.memory) + ' vs ' + table.oracle);

// 6. robustness
C.ROBUST.EFFECT_ALTS.forEach(function (alt) {
  var t = {}; ['oracle', 'readerFrom1690', 'reader', 'memory'].forEach(function (n) { var tot = 0; games.forEach(function (g) { tot += M.playDoctor(g.seed, n, { DEAD: alt }).total; }); t[n] = tot / games.length; });
  check('other effect sizes ' + JSON.stringify(alt) + ': the order holds', t.oracle < t.readerFrom1690 && t.readerFrom1690 < t.reader && t.reader < t.memory, [t.oracle, t.readerFrom1690, t.reader, t.memory].map(Math.round).join(' < '));
});
(function () { var t = {}; ['oracle', 'readerFrom1690', 'reader', 'memory'].forEach(function (n) { var tot = 0; games.forEach(function (g) { tot += M.playDoctor(g.seed, n, { noise: C.ROBUST.NOISE }).total; }); t[n] = tot / games.length; });
  check('noise of plus or minus ' + C.ROBUST.NOISE + ' on every count: the order holds', t.oracle < t.readerFrom1690 && t.readerFrom1690 < t.reader && t.reader < t.memory, [t.oracle, t.readerFrom1690, t.reader, t.memory].map(Math.round).join(' < ')); })();
// without the floors: the reader still beats memory (the floors only make the lesson certain on every draw)
(function () { var save = C.FLOOR; C.FLOOR = { helperKnownAt1695: false, allHelpersKnownBy1696: false }; var t = {}; ['reader', 'memory'].forEach(function (n) { var tot = 0; for (var s = 1; s <= 150; s++) tot += M.playDoctor(s, n).total; t[n] = tot / 150; }); C.FLOOR = save;
  check('without the floors on the letters the reader still beats memory', t.reader < t.memory, Math.round(t.reader) + ' < ' + Math.round(t.memory)); })();

// 7. the words
check('number words for the three counts', M.numberWord(5) === 'five' && M.numberWord(20) === 'twenty' && M.numberWord(30) === 'thirty');
check('the middle word names the baseline', M.effectWord('none') === 'was no better than the fever alone' && M.effectShort('none') === 'no better');
check('the verdict lines name the lookalike at 1692', (function () { var g = M.newGame(3); for (var t = 0; t < 2; t++) M.give(g, M.DOCTORS.oracle(g, t)); var rec = M.give(g, g.history[1].remedy); var v = M.roundVerdict(g, rec).join(' '); return v.indexOf('thirty died') >= 0 && v.indexOf('a different winter') >= 0 && v.indexOf('Nothing could have told you') >= 0; })());
check('the verdict lines name the letters at 1695', (function () { var g = M.newGame(3); for (var t = 0; t < 5; t++) M.give(g, M.DOCTORS.oracle(g, t)); var rec = M.give(g, M.DOCTORS.reader(g, 5, M.rng(1))); var v = M.roundVerdict(g, rec).join(' '); return v.indexOf('The letters had this winter') >= 0 && v.indexOf('five died') >= 0; })());
check('the summary counts before and after the letter', (function () { var g = M.newGame(4); for (var t = 0; t < 10; t++) M.give(g, M.DOCTORS.reader(g, t, M.rng(9))); var s = M.summary(g); return s.sick === 1000 && s.sickBefore === 400 && s.sickAfter === 600 && s.before + s.after === s.total && s.status.collection === 5 && s.others.oracle === 50 && s.letters === 72 + 6; })());

out.push(fails ? 'FAILED: ' + fails : 'ALL PASSED');
console.log(out.join('\n'));
process.exit(fails ? 1 : 0);
