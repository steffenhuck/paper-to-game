// Calibration check for Granovetter's Dashed Line. Run: node calibration.js. Exit code 1 on any failure.
// The mechanism is a TOY of the paper's argument. The check verifies:
//  (1) the rules the paper states hold in the town: strong ties pass on more readily than weak ones; retelling dampens; inside a circle
//      everyone is tied often; every tie between circles is weak (no strong tie is a bridge, p. 1364); Home has no line out except yours;
//  (2) the forbidden triad never occurs after any week: two people you see often are always tied (Fig. 1, p. 1363, exaggerated as the paper does);
//  (3) the Boston "how often did you see the contact" table (p. 1371) under the reference week, within tolerance;
//  (4) the Boston "hands passed through" table (p. 1372), read as the paper reads it: ego, his contacts and their contacts suffice in most cases;
//  (5) the heuristics table of build.md section 3, and the discovery: spreading evenings across circles beats keeping them in the circle,
//      and the circle's news reaches you more than once while a dashed line's news reaches you once;
//  (6) the discovery survives plausible changes to our own choices (pass probabilities, damping, the finite-time rule, the news rate, the floor);
//  (7) the draw: week one's floor, distinct origins, chance meetings and introductions as declared; the lines as states; (8) determinism and the same coins for every strategy;
//  (9) a clairvoyant best week (with hindsight) found by search, read for loopholes.
var m = require('./mechanism.js'), C = m.CONFIG, fails = 0, out = [];
function check(name, ok, detail) { out.push((ok ? 'ok   ' : 'FAIL ') + name + (detail ? ' — ' + detail : '')); if (!ok) fails++; }
function r1(x) { return Math.round(x * 10) / 10; }
var N = 400;
function avg(strat, n) { n = n || N; var sum = 0, seen = { often: 0, occ: 0, rare: 0 }, hands = { h0: 0, h1: 0, h2: 0, h3: 0 }, tellHome = [], tellOut = [];
  for (var i = 0; i < n; i++) { var s = m.runStrategy('s' + i, strat), t = m.tally(s); sum += t.heard; for (var k in seen) seen[k] += t.seen[k]; for (var k2 in hands) hands[k2] += t.hands[k2];
    s.weeks.forEach(function (w) { w.pieces.forEach(function (p) { if (p.heard) (p.originCircle === 'home' ? tellHome : tellOut).push(p.tellers.length); }); }); }
  var mean = function (a) { return a.length ? a.reduce(function (x, y) { return x + y; }, 0) / a.length : 0; };
  return { heard: sum / n, seen: m.shares(seen), hands: m.shares(hands), tellHome: mean(tellHome), tellOut: mean(tellOut) }; }
function f(o) { return Object.keys(o).map(function (k) { return k + ' ' + r1(o[k]); }).join(' '); }

// (1) the paper's stated rules
check('strong ties pass on more readily than weak ones: often > now and then > rarely', C.P_PASS.often > C.P_PASS.occ && C.P_PASS.occ > C.P_PASS.rare, f(C.P_PASS));
check('retelling dampens: 0 < DAMP < 1 (n. 11)', C.DAMP > 0 && C.DAMP < 1, String(C.DAMP));
var town = m.townTies(), inside = true, between = true, homeOut = true;
for (var k in town) { var ab = k.split('~'), same = m.circleOf(ab[0]) === m.circleOf(ab[1]); if (same && town[k] !== 'often') inside = false; if (!same && town[k] !== 'rare') between = false; if (!same && (m.circleOf(ab[0]) === 'home' || m.circleOf(ab[1]) === 'home')) homeOut = false; }
C.CIRCLES.forEach(function (c) { for (var i = 0; i < c.people.length; i++) for (var j = i + 1; j < c.people.length; j++) if (!town[m.key(c.people[i], c.people[j])]) inside = false; });
check('inside every circle everyone is tied often (the circle is a clique)', inside);
check('every tie between circles is weak: no strong tie is a bridge (p. 1364)', between);
check('Home has no line out except yours (p. 1370)', homeOut);
check('no forbidden triad in the town as drawn: two often-ties with no third tie never occur', (function () { var nb = {}; for (var k in town) { if (town[k] !== 'often') continue; var ab = k.split('~'); (nb[ab[0]] = nb[ab[0]] || []).push(ab[1]); (nb[ab[1]] = nb[ab[1]] || []).push(ab[0]); } for (var a in nb) for (var i = 0; i < nb[a].length; i++) for (var j = i + 1; j < nb[a].length; j++) if (!town[m.key(nb[a][i], nb[a][j])]) return false; return true; })());
check('all names distinct, you not among them', (function () { var e = m.everyone(); return new Set(e).size === e.length && e.indexOf(C.YOU) < 0; })());
check('the paper\'s tables sum to about 100', Math.abs(C.BOSTON_SEEN.often + C.BOSTON_SEEN.occ + C.BOSTON_SEEN.rare - 100) < 0.5 && Math.abs(C.BOSTON_HANDS.h0 + C.BOSTON_HANDS.h1 + C.BOSTON_HANDS.h2 + C.BOSTON_HANDS.h3 - 100) < 0.5);

// (2) the forbidden triad after random weeks; introductions and closure as declared
var R = m.rng('triads'), triadOk = true, introOk = true, closureOk = true, timeOk = true;
for (var t = 0; t < 300; t++) {
  var s = m.newGame('t' + t);
  while (!m.isOver(s)) {
    var ev = {}, left = C.EVENINGS; s.known.slice().sort(function () { return R() - .5; }).forEach(function (n) { var e = Math.min(left, Math.floor(R() * (C.CAP + 1))); if (e) { ev[n] = e; left -= e; } });
    var probe = Object.assign({}, s, { revived: {} }), often = s.known.filter(function (n) { return m.weekCat(probe, n, ev) === 'often'; });
    var rec = m.playWeek(s, ev), ties = rec.ties;
    for (var i = 0; i < often.length; i++) for (var j = i + 1; j < often.length; j++) if (!ties[m.key(often[i], often[j])]) triadOk = false;
    rec.closures.forEach(function (c) { if (often.indexOf(c[0]) < 0 || often.indexOf(c[1]) < 0) closureOk = false; });
    rec.intros.forEach(function (x) { if (often.indexOf(x.by) < 0 || m.circleOf(x.who) !== m.circleOf(x.by)) introOk = false; });
    often.forEach(function (n) { var c = m.circleOf(n); if (c === 'home') return; C.CIRCLES.filter(function (x) { return x.id === c; })[0].people.forEach(function (mate) { if (mate !== n && ties[m.key(n, mate)] !== 'occ') timeOk = false; }); });
  }
}
check('after any week, two people you see often are tied: the forbidden triad never occurs (Fig. 1)', triadOk, '300 random games');
check('closures are only between people you see often', closureOk);
check('introductions come only from people you see often, and only from their own circle (Gans, p. 1374)', introOk);
check('a person you see often sees their own circle less that week (strength is time, p. 1361)', timeOk);

// (3) Boston: how often the contact was seen (p. 1371, N = 54)
var ref = avg(function () { return C.REFERENCE_WEEK; });
['often', 'occ', 'rare'].forEach(function (k) { check('reference week: share of news first told by someone seen ' + m.catWord(k) + ' within ' + C.TOL_SEEN + ' points of the paper', Math.abs(ref.seen[k] - C.BOSTON_SEEN[k]) <= C.TOL_SEEN, r1(ref.seen[k]) + ' vs ' + C.BOSTON_SEEN[k]); });
check('reference week: the order of the three is the paper\'s (now and then > rarely > often)', ref.seen.occ > ref.seen.rare && ref.seen.rare > ref.seen.often, f(ref.seen));

// (4) Boston: hands passed through (p. 1372, N = 64), read as the paper reads it
var le1 = ref.hands.h0 + ref.hands.h1, paperLe1 = C.BOSTON_HANDS.h0 + C.BOSTON_HANDS.h1;
check('reference week: news that reached you straight from the source or through one pair of hands, within 8 points of the paper\'s ' + r1(paperLe1), Math.abs(le1 - paperLe1) <= 8, r1(le1) + ' (' + f(ref.hands) + ')');
check('reference week: news through more than two pairs of hands is rare (at most 10%)', ref.hands.h3 <= 10, r1(ref.hands.h3));
check('reference week: straight from the source is the largest or second largest share (p. 1372)', ref.hands.h0 >= ref.hands.h2 && ref.hands.h0 >= ref.hands.h3);

// (5) the heuristics table and the discovery
var table = {}; for (var name in m.STRATEGIES) table[name] = avg(m.STRATEGIES[name]);
out.push('');
out.push('     heuristics (mean over ' + N + ' seeds; heard of ' + (C.WEEKS * C.NEWS_PER_WEEK) + '; told = times a piece reached you; seen = share by how often you saw the first teller; hands = intermediaries)');
out.push('     ' + 'strategy'.padEnd(14) + 'heard'.padStart(6) + '  told(home/out)' + '  seen often/now and then/rarely' + '  hands 0/1/2/3+');
for (var nm in table) { var x = table[nm]; out.push('     ' + nm.padEnd(14) + r1(x.heard).toFixed(1).padStart(6) + '  ' + (r1(x.tellHome) + '/' + r1(x.tellOut)).padEnd(14) + '  ' + (Math.round(x.seen.often) + '/' + Math.round(x.seen.occ) + '/' + Math.round(x.seen.rare)).padEnd(30) + '  ' + Math.round(x.hands.h0) + '/' + Math.round(x.hands.h1) + '/' + Math.round(x.hands.h2) + '/' + Math.round(x.hands.h3)); }
out.push('     ' + 'reference'.padEnd(14) + r1(ref.heard).toFixed(1).padStart(6) + '  ' + (r1(ref.tellHome) + '/' + r1(ref.tellOut)).padEnd(14) + '  ' + (Math.round(ref.seen.often) + '/' + Math.round(ref.seen.occ) + '/' + Math.round(ref.seen.rare)).padEnd(30) + '  ' + Math.round(ref.hands.h0) + '/' + Math.round(ref.hands.h1) + '/' + Math.round(ref.hands.h2) + '/' + Math.round(ref.hands.h3));
out.push('     ' + 'Boston (paper)'.padEnd(14) + ''.padStart(6) + '  ' + ''.padEnd(14) + '  ' + (C.BOSTON_SEEN.often + '/' + C.BOSTON_SEEN.occ + '/' + C.BOSTON_SEEN.rare).padEnd(30) + '  ' + C.BOSTON_HANDS.h0 + '/' + C.BOSTON_HANDS.h1 + '/' + C.BOSTON_HANDS.h2 + '/' + C.BOSTON_HANDS.h3);
out.push('');
check('the discovery: spreading evenings across circles beats every evening in the circle, by at least 3 of ' + (C.WEEKS * C.NEWS_PER_WEEK), table.spreader.heard - table.homebody.heard >= 3, r1(table.spreader.heard) + ' vs ' + r1(table.homebody.heard));
check('the loyal week (circle often, one acquaintance) is between the two', table.loyal.heard > table.homebody.heard && table.loyal.heard < table.spreader.heard);
check('everything into one circle loses to spreading', table.oneCircle.heard < table.spreader.heard);
check('no evenings at all is the floor', table.stayIn.heard <= table.homebody.heard && table.stayIn.heard <= table.spreader.heard);
check('strong bridges (two evenings on one person per circle) do not beat spreading by more than 1: a strong bridge costs its evenings', table.bridgesOften.heard - table.spreader.heard <= 1, r1(table.bridgesOften.heard) + ' vs ' + r1(table.spreader.heard));
check('the circle tells you its news more than twice on average; a dashed line tells you once or so (homebody)', table.homebody.tellHome > 2 && table.homebody.tellOut < 1.5, r1(table.homebody.tellHome) + ' / ' + r1(table.homebody.tellOut));
check('the spreader\'s news comes mostly from people seen now and then, and little from people seen often (Home thick lines that held)', table.spreader.seen.occ > 70 && table.spreader.seen.often < 15, Math.round(table.spreader.seen.occ) + ' / ' + Math.round(table.spreader.seen.often));
check('every strategy takes a live option: no strategy hears fewer than a third, none hears all', Object.keys(table).every(function (k) { return table[k].heard > C.WEEKS * C.NEWS_PER_WEEK / 3 && table[k].heard < C.WEEKS * C.NEWS_PER_WEEK; }));
check('hindsight (the best week found knowing the news) beats the spreader and hears fewer than all', table.hindsight.heard > table.spreader.heard && table.hindsight.heard < C.WEEKS * C.NEWS_PER_WEEK, r1(table.hindsight.heard));
// the lines as states (revision 4): a tended line is what the evenings make it; an untended line thins by one step and never vanishes
var stateOk = true, R3 = m.rng('states');
for (var q3 = 0; q3 < 200; q3++) {
  var g3 = m.newGame('st' + q3);
  if (!['Ann', 'Ben', 'Cal'].every(function (n) { return g3.strength[n] === 'often'; }) || !g3.known.slice(3).every(function (n) { return g3.strength[n] === 'rare'; })) stateOk = false;
  while (!m.isOver(g3)) {
    var ev3 = {}, left3 = C.EVENINGS; g3.known.slice().sort(function () { return R3() - .5; }).forEach(function (n) { var e = Math.min(left3, Math.floor(R3() * (C.CAP + 1))); if (e) { ev3[n] = e; left3 -= e; } });
    var before3 = Object.assign({}, g3.strength), rec3 = m.playWeek(g3, ev3);
    Object.keys(before3).forEach(function (n) { var now = g3.strength[n], e = ev3[n] || 0, rev = rec3.chance && rec3.chance.revive && rec3.chance.who === n; if (e) { if (now !== m.catOf(e)) stateOk = false; } else if (rev) { if (now !== 'often') stateOk = false; } else if (now !== before3[n] && now !== m.down(before3[n])) stateOk = false; });
    g3.known.forEach(function (n) { if (!g3.strength[n]) stateOk = false; });
  }
}
check('at the start Home is thick and the eight others dashed; a tended line is what its evenings make it; an untended line holds or thins by one step; no line vanishes', stateOk, '200 random games');
var thinTries = 0, thinned = 0, revWeeks = 0, revived = 0, reviveOk = true, R4 = m.rng('coins');
for (var q4 = 0; q4 < 300; q4++) { var g4 = m.newGame('cn' + q4); while (!m.isOver(g4)) { var ev4 = {}, left4 = C.EVENINGS; g4.known.slice().sort(function () { return R4() - .5; }).forEach(function (n) { var e = Math.min(left4, Math.floor(R4() * (C.CAP + 1))); if (e) { ev4[n] = e; left4 -= e; } });
  var rec4 = m.playWeek(g4, ev4); thinTries += rec4.thinned.length + rec4.held.length; thinned += rec4.thinned.length;
  if (rec4.week >= C.CHANCE_FROM_WEEK) { revWeeks++; if (rec4.chance && rec4.chance.revive) { revived++; if (rec4.ties[m.key(C.YOU, rec4.chance.who)] !== 'often' || g4.strength[rec4.chance.who] !== 'often') reviveOk = false; } } } }
check('an untended thick or thin line thins about one week in two (P_THIN ' + C.P_THIN + ')', Math.abs(thinned / thinTries - C.P_THIN) < 0.06, r1(100 * thinned / thinTries) + '% of ' + thinTries);
check('about one chance meeting in three is with someone you know (P_REVIVE ' + C.P_REVIVE + '), and the old line is thick that week', Math.abs(revived / revWeeks - C.P_REVIVE) < 0.08 && reviveOk, r1(100 * revived / revWeeks) + '% of ' + revWeeks + ' weeks');

// (6) robustness of the discovery to our own choices
var saved = JSON.stringify({ P: C.P_PASS, D: C.DAMP, T: C.TIME_IS_FINITE, NW: C.NEWS_PER_WEEK, F: C.WEEK1_FLOOR, MH: C.MAX_HOPS });
var variants = [
  { name: 'now and then 0.6', set: function () { C.P_PASS.occ = 0.6; } }, { name: 'now and then 0.9', set: function () { C.P_PASS.occ = 0.9; } },
  { name: 'rarely 0.2', set: function () { C.P_PASS.rare = 0.2; } }, { name: 'rarely 0.45', set: function () { C.P_PASS.rare = 0.45; } },
  { name: 'damping 0.6', set: function () { C.DAMP = 0.6; } }, { name: 'damping 0.95', set: function () { C.DAMP = 0.95; } },
  { name: 'time not finite', set: function () { C.TIME_IS_FINITE = false; } }, { name: 'four openings a week', set: function () { C.NEWS_PER_WEEK = 4; } },
  { name: 'nine openings a week', set: function () { C.NEWS_PER_WEEK = 9; } }, { name: 'no week-one floor', set: function () { C.WEEK1_FLOOR = false; } },
  { name: 'news dies after three hands', set: function () { C.MAX_HOPS = 3; } }
];
variants.forEach(function (v) {
  var sv = JSON.parse(saved); C.P_PASS = JSON.parse(JSON.stringify(sv.P)); C.DAMP = sv.D; C.TIME_IS_FINITE = sv.T; C.NEWS_PER_WEEK = sv.NW; C.WEEK1_FLOOR = sv.F; C.MAX_HOPS = sv.MH; v.set();
  var sp = avg(m.STRATEGIES.spreader, 150), hb = avg(m.STRATEGIES.homebody, 150), lo = avg(m.STRATEGIES.loyal, 150), br = avg(m.STRATEGIES.bridgesOften, 150);
  check('robust (' + v.name + '): spreading beats the circle and the loyal week; the circle tells you its news more than once', sp.heard > hb.heard && sp.heard > lo.heard && hb.tellHome > 1.5, 'spread ' + r1(sp.heard) + ', loyal ' + r1(lo.heard) + ', home ' + r1(hb.heard) + ', strong bridges ' + r1(br.heard) + ', told ' + r1(hb.tellHome));
});
var sv = JSON.parse(saved); C.P_PASS = sv.P; C.DAMP = sv.D; C.TIME_IS_FINITE = sv.T; C.NEWS_PER_WEEK = sv.NW; C.WEEK1_FLOOR = sv.F; C.MAX_HOPS = sv.MH;
check('config restored after the robustness runs', JSON.stringify({ P: C.P_PASS, D: C.DAMP, T: C.TIME_IS_FINITE, NW: C.NEWS_PER_WEEK, F: C.WEEK1_FLOOR, MH: C.MAX_HOPS }) === saved);

// (7) the draw
var floorOk = true, distinctOk = true, chanceOk = true, chanceFar = 0, chanceCount = 0;
for (var d = 0; d < 300; d++) {
  var o1 = m.drawOrigins('d' + d, 1), circles = {}; o1.forEach(function (p) { circles[m.circleOf(p)] = true; });
  if (Object.keys(circles).length !== C.CIRCLES.length) floorOk = false;
  for (var w = 1; w <= C.WEEKS; w++) { var o = m.drawOrigins('d' + d, w); if (new Set(o).size !== C.NEWS_PER_WEEK || o.indexOf(C.YOU) >= 0) distinctOk = false; }
  var g = m.newGame('d' + d), before;
  while (!m.isOver(g)) { before = g.known.slice(); var rec = m.playWeek(g, m.STRATEGIES.spreader(g)); if (rec.chance) { chanceCount++; if (rec.chance.revive ? before.indexOf(rec.chance.who) < 0 : before.indexOf(rec.chance.who) >= 0) chanceOk = false; if (rec.chance.far) chanceFar++; } else if (rec.week >= C.CHANCE_FROM_WEEK && m.everyone().length > before.length) chanceOk = false; }
}
check('week one\'s openings include one in every circle (the floor), over 300 seeds', floorOk);
check('every week: ' + C.NEWS_PER_WEEK + ' distinct origins, never you', distinctOk);
check('a chance meeting every week from week ' + C.CHANCE_FROM_WEEK + ': someone new, or an old line revived', chanceOk, chanceCount + ' meetings');

// (8) determinism and the same coins for every strategy
var a1 = m.tally(m.runStrategy('same', m.STRATEGIES.spreader)), a2 = m.tally(m.runStrategy('same', m.STRATEGIES.spreader));
check('the same seed and the same weeks give the same game', JSON.stringify(a1) === JSON.stringify(a2));
check('the same coin for the same tie, piece and week whatever the week\'s evenings', m.unit(['x', 'coin', 1, 2, 'Dee', 'You']) === m.unit(['x', 'coin', 1, 2, 'Dee', 'You']) && m.unit(['x', 'coin', 1, 2, 'Dee', 'You']) !== m.unit(['x', 'coin', 1, 3, 'Dee', 'You']));
var sameOrigins = true; for (var q = 0; q < 50; q++) { var ga = m.runStrategy('o' + q, m.STRATEGIES.homebody), gb = m.runStrategy('o' + q, m.STRATEGIES.spreader); for (var w2 = 0; w2 < C.WEEKS; w2++) if (ga.weeks[w2].pieces.map(function (p) { return p.origin; }).join() !== gb.weeks[w2].pieces.map(function (p) { return p.origin; }).join()) sameOrigins = false; }
check('the ghosts meet the same news as the player on the same seed', sameOrigins);

// (9) a clairvoyant best week by search: week one exhaustive (every legal week over the eleven you know), later weeks by hill-climbing
//     from the spreader's week, with hindsight on the week's news; read for loopholes
var heardOf = m.heardOf;
var clair = 0, clairN = 6, firstWeeks = {}, week1Cands = m.allWeeks(C.KNOWN_AT_START);
for (var c = 0; c < clairN; c++) {
  var g2 = m.newGame('c' + c), sum = 0;
  while (!m.isOver(g2)) {
    var best = null, bestH = -1;
    if (g2.week === 1) { week1Cands.forEach(function (ev) { var h = heardOf(g2, ev); if (h > bestH) { bestH = h; best = ev; } }); var desc = Object.keys(best).map(function (n) { return n + ':' + best[n]; }).join(' '); firstWeeks[desc] = (firstWeeks[desc] || 0) + 1; }
    else { best = m.hindsightWeek(g2).ev; }
    sum += m.playWeek(g2, best).heard;
  }
  clair += sum;
}
out.push('     clairvoyant (best week with hindsight; ' + week1Cands.length + ' legal weeks searched in week one; ' + clairN + ' seeds): ' + r1(clair / clairN) + ' of ' + (C.WEEKS * C.NEWS_PER_WEEK) + '; week-one picks: ' + JSON.stringify(firstWeeks));
check('the clairvoyant best beats the spreader (there is luck to read), and hears fewer than all', clair / clairN > table.spreader.heard && clair / clairN < C.WEEKS * C.NEWS_PER_WEEK, r1(clair / clairN));

// (10) the best plan without foreknowledge. Week one, by exhaustive search (every one of the 17,469 legal first weeks scored on 40 towns,
//      the top 60 rescored on 300; memo, revisions 3 and 4): the best first weeks give one evening to one person in each outer circle and
//      the seventh as a second evening to one of them (5.80 of 7), since Home thins anyway in week one; the named plan's first week scores 5.56.
//      Over three weeks, the named plan (one evening to one person in each circle, no one twice) is checked against that family of plans.
function outerOne(s) { var ev = {}, byC = {}; s.known.forEach(function (n) { var c = m.circleOf(n); if (c !== 'home') (byC[c] = byC[c] || []).push(n); }); var order = Object.keys(byC).sort(function (a, b) { return m.sizeOf(b) - m.sizeOf(a); }); order.forEach(function (c) { ev[byC[c][0]] = 1; }); return { ev: ev, order: order, byC: byC }; }
var PLANS = {
  spreader: m.STRATEGIES.spreader,
  outerSecond: function (s) { var o = outerOne(s), ev = o.ev, left = C.EVENINGS - Object.keys(ev).length; o.order.forEach(function (c) { if (left > 0 && o.byC[c][1] && !ev[o.byC[c][1]]) { ev[o.byC[c][1]] = 1; left--; } }); return ev; },
  outerThenAnn: function (s) { var o = outerOne(s), ev = o.ev; if (s.week === 1) ev[o.byC[o.order[0]][0]] = 2; else ev.Ann = 1; return ev; }
};
function plan3(f) { var sum = 0; for (var i = 0; i < 300; i++) sum += m.tally(m.runStrategy('p' + i, f)).heard; return sum / 300; }
var named3 = plan3(m.STRATEGIES[C.BEST_PLAN]), others3 = Object.keys(PLANS).map(function (k) { return plan3(PLANS[k]); });
check('the named best plan (' + C.BEST_PLAN + ') is within 0.3 of ' + (C.WEEKS * C.NEWS_PER_WEEK) + ' of every other plan in the family (one per circle with Ann; a second outer person; Ann from week two)', others3.every(function (w) { return named3 >= w - 0.3; }), r1(named3 * 10) / 10 + ' vs ' + others3.map(function (w) { return Math.round(w * 100) / 100; }).join(', '));
check('the score: the ceiling is never below the player\'s own count, over 200 towns and three strategies', (function () { for (var i = 0; i < 200; i++) { var g = m.runStrategy('sc' + i, [m.STRATEGIES.spreader, m.STRATEGIES.bridgesOften, m.STRATEGIES.homebody][i % 3]); var sc = m.scoreOf(g); if (sc.ceiling < sc.heard || sc.pct > 100 || sc.pct < 0) return false; } return true; })());
check('the score bands: the best plan lands in the top two bands most of the time, the circle in the bottom two most of the time', (function () { var a = 0, b = 0; for (var i = 0; i < 200; i++) { if (m.scoreOf(m.runStrategy('bd' + i, m.STRATEGIES.spreader)).band >= 1) a++; if (m.scoreOf(m.runStrategy('bd' + i, m.STRATEGIES.homebody)).band <= 1) b++; } return a >= 150 && b >= 150; })());

out.push('');
out.push(fails ? fails + ' FAILED' : 'all checks passed');
console.log(out.join('\n'));
process.exit(fails ? 1 : 0);
