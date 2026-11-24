// Calibration check for Leibniz's Register (memo §17). The mechanism is a toy; nothing in the paper is a number. What is
// checked, over many seeds: (1) the draw (four kinds, pairwise differences, every remedy helps somewhere, bark helps
// and harms); (2) the plan's promises (trusting last year is right at 1691, 1693, 1695, 1698 and loses thirty at 1692,
// 1696, 1699; the lost years at 1696 and 1699; the book year 1700); (3) memory and the register show what they should;
// (4) the doctors' table and its order; (5) robustness to noise and other effect sizes; (6) the words.
// Run: node calibration.js  (exit 1 on failure)
var M = require('./mechanism.js'), C = M.CONFIG;
var fails = 0, out = [];
function check(name, ok, detail) { out.push((ok ? 'PASS ' : 'FAIL ') + name + (detail !== undefined ? '  — ' + detail : '')); if (!ok) fails++; }
var SEEDS = 300, games = [];
for (var s = 1; s <= SEEDS; s++) games.push(M.newGame(s));
out.push('     ' + SEEDS + ' games drawn; reseeded: ' + games.filter(function (g) { return g.drawSeed !== g.seed; }).length);
check('every seed draws a game', games.every(function (g) { return g; }));

// 1. the draw
check('four kinds, four seasons each, weather from the list', games.every(function (g) { return ['A', 'B', 'C', 'D'].every(function (k) { return g.kinds[k].sig.length === 4 && g.kinds[k].sig.every(function (w) { return C.WEATHERS.indexOf(w) >= 0; }); }); }));
check('any two kinds differ in ' + C.MIN_DIFF + '..' + C.MAX_DIFF + ' seasons', games.every(function (g) { var K = ['A', 'B', 'C', 'D']; return K.every(function (a) { return K.every(function (b) { if (a === b) return true; var d = M.diff(g.kinds[a].sig, g.kinds[b].sig); return d >= C.MIN_DIFF && d <= C.MAX_DIFF; }); }); }));
check('each kind: one remedy helps, one does nothing, one harms', games.every(function (g) { return ['A', 'B', 'C', 'D'].every(function (k) { var e = g.kinds[k].effects, v = C.REMEDIES.map(function (r) { return e[r]; }).sort(); return v.join() === 'harms,helps,none'; }); }));
check('every remedy helps in some kind (rest and bleeding are live)', games.every(function (g) { return C.REMEDIES.every(function (r) { return ['A', 'B', 'C', 'D'].some(function (k) { return g.kinds[k].effects[r] === 'helps'; }); }); }));
check('bark helps in one kind and harms in another (black to white)', games.every(function (g) { var K = ['A', 'B', 'C', 'D']; return K.some(function (k) { return g.kinds[k].effects.bark === 'helps'; }) && K.some(function (k) { return g.kinds[k].effects.bark === 'harms'; }); }));
check('flavour lines distinct across kinds', games.every(function (g) { var f = ['A', 'B', 'C', 'D'].map(function (k) { return g.kinds[k].flavour; }); return new Set(f).size === 4; }));
var which = {}; games.forEach(function (g) { var h = C.REMEDIES.filter(function (r) { return g.kinds.A.effects[r] === 'helps'; })[0]; which[h] = (which[h] || 0) + 1; });
out.push('     which remedy helps in kind A, over seeds: ' + JSON.stringify(which));

// 2. the plan's promises
function helper(g, k) { return C.REMEDIES.filter(function (r) { return g.kinds[k].effects[r] === 'helps'; })[0]; }
check('plan is the plan', games.every(function (g) { return g.plan.join() === C.PLAN.join() && g.years.length === g.plan.length; }));
check('1692: the remedy that helped in 1691 (A) harms in 1692 (B)', games.every(function (g) { return g.kinds.B.effects[helper(g, 'A')] === 'harms'; }));
check('1696: the remedy that helped in 1695 (C) harms in 1696 (B)', games.every(function (g) { return g.kinds.B.effects[helper(g, 'C')] === 'harms'; }));
check('1699: the remedy that helped in 1698 (D) harms in 1699 (A)', games.every(function (g) { return g.kinds.A.effects[helper(g, 'D')] === 'harms'; }));
// the trusting doctor: knows the helper up to t-1 (the oracle) and then gives last year's remedy at t
function trust(g, t) { var game = M.newGame(g.seed); for (var u = 0; u < t; u++) M.give(game, M.DOCTORS.oracle(game, u)); return M.give(game, game.history[t - 1].remedy).dead; }
check('trusting last year is right at 1691, 1693, 1695, 1698 (five die) on every seed', games.every(function (g) { return [1, 3, 5, 8].every(function (t) { return trust(g, t) === C.DEAD.helps; }); }));
check('trusting last year loses thirty at 1692, 1696, 1699 on every seed', games.every(function (g) { return [2, 6, 9].every(function (t) { return trust(g, t) === C.DEAD.harms; }); }));
// lookup statuses along the plan, for any way of playing (they depend on the plan and the register, not the remedy)
var statuses = (function () { var g = M.newGame(1); var st = []; for (var t = 0; t < g.plan.length; t++) { st.push(M.give(g, 'bark').lookup.status); } return st; })();
check('lookup along the plan: new, last, new, last, new, last, lost, new, last, lost, book', statuses.join() === 'new,last,new,last,new,last,lost,new,last,lost,book', statuses.join());
check('the register begins in 1694 (year 5)', games.every(function (g) { return g.years.map(function (y, t) { return M.hasRegister(g, t); }).join() === 'false,false,false,false,true,true,true,true,true,true,true'; }));

// 3. memory and the register
(function () {
  var g = M.newGame(5); for (var t = 0; t < 6; t++) M.give(g, C.REMEDIES[t % 3]);
  var mv = M.memoryView(g, 6);
  check('memory at 1696: last year whole, two years ago cards and remedy, three years ago cards faded', mv[0].level === 'whole' && mv[0].dead !== null && mv[1].level === 'cards-and-remedy' && mv[1].dead === null && mv[1].remedy !== null && mv[2].level === 'cards-faded' && mv[2].remedy === null && mv[2].sig !== null);
  check('four years ago is blank', M.memoryLevel(4) === 'blank' && M.memoryLevel(9) === 'blank');
  var pages = M.registerPages(g, 6);
  check('register at 1696 holds 1694 and 1695, whole, newest first', pages.length === 2 && pages[0].year === 1695 && pages[1].year === 1694 && pages.every(function (p) { return p.dead !== null && p.remedy && p.sig; }));
  check('register at 1693 is empty', M.registerPages(g, 3).length === 0);
  var g2 = M.newGame(5); for (var u = 0; u < 11; u++) M.give(g2, 'rest');
  var thrown = false; try { M.give(g2, 'rest'); } catch (e) { thrown = true; }
  check('a twelfth year is refused', thrown);
  check('an unknown remedy is refused', (function () { try { M.give(M.newGame(2), 'leeches'); return false; } catch (e) { return true; } })());
})();

// 4. the doctors' table (memo §18)
var NAMES = ['oracle', 'registerFrom1690', 'register', 'memory', 'bark', 'bleeding', 'rest'];
var table = {}, perYear = {};
NAMES.forEach(function (n) { var tot = 0, py = []; games.forEach(function (g) { var r = M.playDoctor(g.seed, n); tot += r.total; r.perYear.forEach(function (d, i) { py[i] = (py[i] || 0) + d; }); }); table[n] = tot / games.length; perYear[n] = py.map(function (d) { return d / games.length; }); });
out.push('     dead over eleven years (of eleven hundred sick), mean over ' + SEEDS + ' seeds:');
NAMES.forEach(function (n) { out.push('       ' + (n + '                ').slice(0, 18) + Math.round(table[n]) + '   by year: ' + perYear[n].map(function (d) { return Math.round(d); }).join(' ')); });
check('order: oracle < register from 1690 < register from 1694 < memory alone', table.oracle < table.registerFrom1690 && table.registerFrom1690 < table.register && table.register < table.memory, Math.round(table.oracle) + ' < ' + Math.round(table.registerFrom1690) + ' < ' + Math.round(table.register) + ' < ' + Math.round(table.memory));
check('oracle loses exactly fifty-five', table.oracle === 55);
check('the memory doctor loses fewer on the repeat years than on the years before them', [1, 3, 5, 8].every(function (t) { return perYear.memory[t] < perYear.memory[t - 1]; }));
check('the memory doctor loses most on the lost years 1696 and 1699', [6, 9].every(function (t) { return perYear.memory[t] > 24; }), perYear.memory.map(Math.round).join(' '));
check('the register doctor reads the book at 1700 and loses fewer there than the memory doctor', perYear.register[10] < perYear.memory[10]);
check('the register doctor loses as much as the memory doctor at 1696 and 1699: the matching year was never written', perYear.register[6] === perYear.memory[6] && perYear.register[9] === perYear.memory[9]);
check('the register from 1690 loses far fewer at 1696 and 1699', perYear.registerFrom1690[6] < perYear.memory[6] - 10 && perYear.registerFrom1690[9] < perYear.memory[9] - 10);
// a fixed remedy averages (5 + 20 + 30) / 3 a year whatever happens; recorded, not required (memo §18)
out.push('     a fixed remedy against the memory doctor: ' + Math.round(table.bleeding) + ' vs ' + Math.round(table.memory) + ' (the plan has as many flips as a trusting doctor can profit from repeats; memo §18)');
// a wrong path a sensible player takes: repeating what helped last year at 1692, 1696, 1699 is the paper's own failure
check('spread: the memory doctor loses at least three times what the best possible loses', table.memory >= 3 * table.oracle, Math.round(table.memory) + ' vs ' + table.oracle);

// 5. robustness
C.ROBUST.EFFECT_ALTS.forEach(function (alt, i) {
  var t = {}; ['oracle', 'registerFrom1690', 'register', 'memory'].forEach(function (n) { var tot = 0; games.forEach(function (g) { tot += M.playDoctor(g.seed, n, { DEAD: alt }).total; }); t[n] = tot / games.length; });
  check('other effect sizes ' + JSON.stringify(alt) + ': the order holds', t.oracle < t.registerFrom1690 && t.registerFrom1690 < t.register && t.register < t.memory, [t.oracle, t.registerFrom1690, t.register, t.memory].map(Math.round).join(' < '));
});
(function () { var t = {}; ['oracle', 'registerFrom1690', 'register', 'memory'].forEach(function (n) { var tot = 0; games.forEach(function (g) { tot += M.playDoctor(g.seed, n, { noise: C.ROBUST.NOISE }).total; }); t[n] = tot / games.length; });
  check('noise of plus or minus ' + C.ROBUST.NOISE + ' on every count: the order holds', t.oracle < t.registerFrom1690 && t.registerFrom1690 < t.register && t.register < t.memory, [t.oracle, t.registerFrom1690, t.register, t.memory].map(Math.round).join(' < ')); })();

// 6. the words
check('number words for the three counts', M.numberWord(5) === 'five' && M.numberWord(20) === 'twenty' && M.numberWord(30) === 'thirty');
check('the verdict lines name the lost years at 1696', (function () { var g = M.newGame(3); for (var t = 0; t < 6; t++) M.give(g, M.DOCTORS.oracle(g, t)); var rec = M.give(g, g.history[5].remedy); var v = M.roundVerdict(g, rec).join(' '); return v.indexOf('1692 and 1693') >= 0 && v.indexOf('Nobody wrote it down') >= 0 && v.indexOf('thirty died') >= 0; })());
check('the summary counts the kinds of year', (function () { var g = M.newGame(4); for (var t = 0; t < 11; t++) M.give(g, M.DOCTORS.register(g, t, M.rng(9))); var s = M.summary(g); return s.sick === 1100 && s.inBook === 1 && s.lost === 2 && s.fromScratch === 4 && s.last === 4 && s.halfRemembered === 0 && s.written === 7 && s.unwritten === 4 && s.others.oracle === 55; })());

out.push(fails ? 'FAILED: ' + fails : 'ALL PASSED');
console.log(out.join('\n'));
process.exit(fails ? 1 : 0);
