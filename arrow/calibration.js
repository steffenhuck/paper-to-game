// Calibration check for Voting with Arrow: the mechanism against Arrow (1950), statement by statement. Run: node calibration.js
const { MECH: M } = require('./mechanism.js');
const out = []; let fails = 0, n = 0;
function check(name, ok, detail) { n++; if (!ok) fails++; out.push((ok ? 'PASS  ' : 'FAIL  ') + name + (detail ? '  [' + detail + ']' : '')); }
const B = M.BALLOTS, X = 0, Y = 1, Z = 2;
const book = s => s.split('').map(c => c === '_' ? null : c);

// --- the objects
check('Axioms I-II: there are 13 weak orderings of three alternatives', M.LISTS.length === 13);
check('six strict ballots, 36 pairs of ballots', B.length === 6);

// --- the theorem, by exhaustion (Possibility Theorem, p. 342, for two voters and three alternatives on strict ballots)
const all = M.allBooks();
check('729 rule books satisfy Conditions 2-4 by construction', all.total === 729 && all.holds.length === 729);
check('exactly two rule books give a weak ordering for all 36 pairs of ballots', all.neverFail.length === 2, 'never fail: ' + all.neverFail.map(i => M.bookFromIndex(i).join('')).join(', '));
check('those two are dictatorial by Definition 5: one is voter 1, one is voter 2', all.neverFail.map(i => M.dictator(M.bookFromIndex(i))).sort().join('') === 'AB');
let dictOnly = true; for (let i = 0; i < 729; i++) { const d = M.dictator(M.bookFromIndex(i)); if ((d !== null) !== (all.holds[i] === 36)) dictOnly = false; }
check('a rule book is dictatorial if and only if it never fails (727 non-dictatorial books each fail somewhere)', dictOnly);

// --- Condition 2 (positive association, p. 336-337) holds for every one of the 729, so it excludes none of them
let mono = true;
for (let i = 0; i < 729 && mono; i++) { const bk = M.bookFromIndex(i);
  for (let a = 0; a < 6; a++) for (let b = 0; b < 6; b++) for (let a2 = 0; a2 < 6; a2++) for (let b2 = 0; b2 < 6; b2++) for (let x = 0; x < 3; x++) {
    // x rises or stays in each ballot with the others' relative order unchanged
    const ok1 = (o, o2) => { const r = M.rankOf(B[o]), r2 = M.rankOf(B[o2]); const rest = [0, 1, 2].filter(k => k !== x); return r2[x] <= r[x] && (r[rest[0]] < r[rest[1]]) === (r2[rest[0]] < r2[rest[1]]); };
    if (!ok1(a, a2) || !ok1(b, b2)) continue;
    for (let p = 0; p < 3; p++) { const [u, v] = M.PAIRS[p]; if (u !== x && v !== x) continue; const y = u === x ? v : u;
      const before = M.pairOutcome(bk, M.pairInfo(B[a], B[b], p)), after = M.pairOutcome(bk, M.pairInfo(B[a2], B[b2], p));
      if (before === x && after !== x) mono = false; }
  } }
check('Condition 2: in all 729 books, raising x in the ballots never turns "x above y" into anything else', mono);
// --- Condition 4 (not imposed, p. 338) and Consequence 1 (p. 340)
let unan = true; for (let i = 0; i < 729; i += 37) { const bk = M.bookFromIndex(i); for (let a = 0; a < 6; a++) { const s = M.readSunday(bk, B[a], B[a]); if (!s.list || !s.isAnnas || !s.isBeats) unan = false; } }
check('Consequence 1 / Condition 4: identical ballots always give that ballot as the list, so no pair is imposed', unan);

// --- Arrow's own examples
// Consequence 3 and eqs. (7)-(8), p. 341-342: if every disagreement is level, ballots x,y,z and z,x,y give xPy, yIz, xIz: no ordering.
{ const s = M.readSunday(book('EEEEEE'), [X, Y, Z], [Z, X, Y]);
  check('eqs. (7)-(8): all disagreements level, ballots x,y,z / z,x,y: xPy, yIz, xIz, and no ordering', s.pairs[0].top === X && s.pairs[1].top === -1 && s.pairs[2].top === -1 && s.list === null,
    'clash: ' + JSON.stringify(s.clash)); }
// eqs. (1)->(2), p. 341: if "x P1 y and y P2 x gives x P y" then ballots x,y,z / y,z,x force "x P1 z and z P2 x gives x P z".
{ const L = M.legalLists(book('A_____'), [X, Y, Z], [Y, Z, X]); const r = M.newRulings(book('A_____'), [X, Y, Z], [Y, Z, X], L[0]);
  check('eq. (1) forces eq. (2): one list left on ballots x,y,z / y,z,x, and it rules the x-z disagreement voter 1\'s way', L.length === 1 && r.length === 1 && r[0].cell === 4 && r[0].value === 'A'); }
// the chain (1)..(6): one ruling in voter 1's favour forces all six (p. 341)
{ let bk = book('A_____'); const steps = [[[X, Y, Z], [Y, Z, X]], [[Y, X, Z], [Z, Y, X]], [[Y, Z, X], [Z, X, Y]], [[Z, Y, X], [X, Z, Y]], [[Z, X, Y], [X, Y, Z]]]; let forced = true;
  steps.forEach(([a, b]) => { const L = M.legalLists(bk, a, b); if (L.length !== 1) forced = false; bk = M.post(bk, a, b, L[0]); });
  check('eqs. (1)-(6): on Arrow\'s five pairs of ballots each list is forced, and the book ends as voter 1 deciding everything', forced && bk.join('') === 'AAAAAA', bk.join('')); }
// The paradox of voting, p. 329: three voters A>B>C, B>C>A, C>A>B; majorities A>B, B>C, C>A.
{ const v = [[0, 1, 2], [1, 2, 0], [2, 0, 1]]; const maj = (a, b) => v.filter(o => o.indexOf(a) < o.indexOf(b)).length >= 2;
  check('p. 329, paradox of voting: majorities prefer A to B, B to C and C to A', maj(0, 1) && maj(1, 2) && maj(2, 0)); }
// The rank-order example, p. 337-338: weights 4,3,2,1; voters 1 and 2: x,y,z,w; voter 3: z,w,x,y. x wins; delete y, and x and z tie.
{ const v = [['x', 'y', 'z', 'w'], ['x', 'y', 'z', 'w'], ['z', 'w', 'x', 'y']];
  const score = (vs) => { const s = {}; vs.forEach(o => o.forEach((c, i) => s[c] = (s[c] || 0) + (4 - i))); return s; };
  const s1 = score(v), s2 = score(v.map(o => o.filter(c => c !== 'y')));
  check('p. 337-338, rank-order method: x is chosen from four; with y deleted, x and z tie', s1.x > s1.y && s1.x > s1.z && s1.x > s1.w && s2.x === s2.z && s2.x > s2.w, JSON.stringify(s1) + ' -> ' + JSON.stringify(s2)); }

// --- the game's own shape (ours), over every path from every opening
const hist = {}; let paths = 0, shapeOk = true, stuck = false, ends = {}; const optShape = {};
M.CONFIG.openings.forEach((o, g) => {
  (function go(bk, t, opts) {
    const nb = M.nextBallots(bk, t, g);
    if (!nb) { if (!M.isComplete(bk)) stuck = true; paths++; const v = M.verdict(bk); hist[v.holds] = (hist[v.holds] || 0) + 1; ends[g + ':' + v.fate] = (ends[g + ':' + v.fate] || 0) + 1; optShape[opts.join(',')] = (optShape[opts.join(',')] || 0) + 1; if (t !== M.CONFIG.whatIfs) shapeOk = false; return; }
    const L = M.legalLists(bk, nb.anna, nb.beat); if (!L.length) { stuck = true; return; }
    L.forEach(w => go(M.post(bk, nb.anna, nb.beat, w), t + 1, opts.concat(L.length)));
  })(M.emptyBook(), 0, []);
});
check('every path from every opening is three what-ifs long and ends with a complete book (never a what-if without a ranking)', shapeOk && !stuck, paths + ' paths');
check('rankings on offer are 5, 5, 5 on every path (two new ties each time)', Object.keys(optShape).join('|') === '5,5,5', JSON.stringify(optShape));
check('each opening is Arrow\'s eq. (7) pair up to renaming: one pair agreed, two disputed, five lists possible',
  M.CONFIG.openings.every(o => M.legalLists(M.emptyBook(), o[0], o[1]).length === 5) && M.CONFIG.openings[0][0].join('') === '012' && M.CONFIG.openings[0][1].join('') === '201');
const reach = Object.keys(hist).map(Number);
check('the player can reach both a dictator (36) and the best book without one', hist[36] > 0 && hist[all.bestWithoutBoss] > 0, 'best without a boss = ' + all.bestWithoutBoss);
check('spread of outcomes: at least six different scores are reachable', reach.length >= 6, JSON.stringify(hist));

// --- robustness: the discovery does not depend on Arrow's calendar. Under any calendar the book ends as one of the 729; only 2 never fail.
check('robustness: whatever ballots come first, a complete non-dictatorial book fails on at least ' + (36 - all.bestWithoutBoss) + ' of 36 Sundays', all.bestWithoutBoss < 36);
// --- the best books without a boss
const bestIdx = []; for (let i = 0; i < 729; i++) if (all.holds[i] === all.bestWithoutBoss) bestIdx.push(i);
const customs = []; for (let i = 0; i < 729; i++) { const c = M.custom(M.bookFromIndex(i)); if (c && c.order) customs.push(i); }
check('the six books in which a fixed order of the plans wins every disagreement are all among the best without a boss', customs.length === 6 && customs.every(i => all.holds[i] === all.bestWithoutBoss),
  'best: ' + bestIdx.length + ' books at ' + all.bestWithoutBoss + '; fixed-order books: ' + customs.map(i => all.holds[i]).join(','));
// every clash explanation is a real violation
let clashOk = true; for (let i = 0; i < 729; i++) { const a = M.audit(M.bookFromIndex(i)); a.cells.forEach(c => { if (!c.list && (!c.clash || c.clash.actual === c.clash.expect)) clashOk = false; if (c.list && c.clash) clashOk = false; }); }
check('every Sunday without a list comes with a chain "a over-or-level b, b over-or-level c, but not a over c" taken from its own pair results', clashOk);

// --- Arrow's chain (pp. 340-342) from every possible start: one tie to a voter forces all six to that voter in five forced steps
{ let ok = true; ['A', 'B'].forEach(v => { for (let c = 0; c < 6; c++) { const ch = M.chain(v, c); if (!ch || ch.steps.length !== 5 || ch.book.join('') !== v.repeat(6) || ch.steps.some(st => st.value !== v)) ok = false; } });
  check('chain: from any one tie given to a voter, five what-ifs each with one ranking left make that voter the dictator (12 starts)', ok); }
{ let hist = {}; const rnd = (() => { let x = 12345; return () => { x = (x * 1103515245 + 12345) % 2147483648; return x / 2147483648; }; })();
  for (let i = 0; i < 36000; i++) { const d = M.drawSunday(rnd); hist[d.k] = (hist[d.k] || 0) + 1; }
  check('the real Sunday is drawn from all 36 pairs of ballots, each about equally often', Object.keys(hist).length === 36 && Math.max(...Object.values(hist)) < 1300 && Math.min(...Object.values(hist)) > 700); }
// --- the hired tie-breakers (ours), against the paper's first page
{ let same = true, n34 = true, condorcet = true;
  B.forEach(cl => { const bk = M.clarasBook(cl); const au = M.audit(bk); if (au.holds !== 34) n34 = false;
    au.cells.forEach(c => { const m = M.majorityOfThree(c.anna, c.beat, cl);
      if (m.pairs.some((q, p) => q.top !== c.pairs[p].top) || (!!m.list) !== (!!c.list)) same = false;
      if (!c.list) { const pos = [0, 1, 2].map(x => [c.anna, c.beat, cl].map(o => o.indexOf(x)).sort().join('')); if (pos.some(s => s !== '012') || !m.clash.circle || m.pairs.some(q => q.votes !== 2)) condorcet = false; } }); });
  check('a third voter with a fixed ballot and majority of three is the rule book in which her order settles every disagreement (all 6 ballots, all 36 Sundays)', same);
  check('each such tie-breaker gives a ranking on 34 of 36 Sundays', n34);
  check('its two failures are the paradox of voting (p. 329): each plan first on one ballot, second on one, third on one; a circle of 2-1 majorities', condorcet); }
{ const m = M.majorityOfThree([0, 1, 2], [1, 2, 0], [2, 0, 1]); check('p. 329 through majorityOfThree: A>B>C, B>C>A, C>A>B gives no ordering, a circle', m.list === null && m.clash.circle); }
{ let n = 0; B.forEach(a => B.forEach(b => B.forEach(c => { if (!M.majorityOfThree(a, b, c).list) n++; }))); check('three free voters and a simple majority: 12 of the 216 sets of ballots give no ordering', n === 12, String(n)); }
check('with two voters, a draw on every disagreement fails on 12 of 36 Sundays', M.audit(M.voterBook('E')).broken === 12);
check('a voter as tie-breaker is that voter as dictator', M.dictator(M.voterBook('A')) === 'A' && M.dictator(M.voterBook('B')) === 'B');
{ const o = M.CONFIG.openings[0], s = M.readSunday(M.emptyBook(), o[0], o[1]); // a coin on Sunday 1: Tower over Tree (Anna's side) and Tree over Fountain (Beat's side)
  check('a coin can land in a circle on Sunday 1: Fountain over Tower (both), Tower over Tree, Tree over Fountain', M.clashOf([0, 1, 2]).circle && s.pairs[0].agree && s.pairs[0].winner === 0 && !s.pairs[1].agree && !s.pairs[2].agree); }

out.push('');
out.push('Sundays that hold, over all 729 rule books: ' + JSON.stringify(all.hist));
out.push('Sundays that hold, over the ' + paths + ' paths of play (three openings): ' + JSON.stringify(hist));
out.push('Fates by opening: ' + JSON.stringify(ends));
out.push('Books at the best score without a boss (' + all.bestWithoutBoss + '): ' + bestIdx.map(i => M.bookFromIndex(i).join('')).join(' '));
out.push('');
out.push(n + ' checks, ' + fails + ' failed');
const txt = out.join('\n'); console.log(txt); require('fs').writeFileSync(__dirname + '/calibration-result.txt', txt + '\n');
process.exit(fails ? 1 : 0);
