// calibration.js — the headless check for Leibniz's Even Hand (build.md §2–3). The text has no numbers, so the check
// verifies that the mechanism does what the memo and the screens say it does: the four readers' rules against an
// independent count; the page's invariants; every page of every quarrel (six, in three pools of two) enumerated, with the
// fair pages counted and their shape confirmed; the lessons of each round; the obvious ways of playing and where each
// goes wrong; the words; the draw's shape over thousands of seeds; and whether the central discovery survives changes
// to the designer's choices. Exit code 1 on any failure.
var M = require('./mechanism.js'), C = M.CONFIG;
var fails = 0, out = [];
function say(s) { out.push(s); console.log(s); }
function check(name, ok, detail) { say((ok ? 'ok   ' : 'FAIL ') + name + (detail ? ' — ' + detail : '')); if (!ok) fails++; }
function bySlug(slug) { return C.QUARRELS.filter(function (q) { return q.slug === slug; })[0]; }
var NR = C.READERS.length * 2;

// ---- 1. the readers' rules against an independent count, on random pages ----
var seed = 7; function rnd() { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; }
function independent(q, page) {
  var A = 0, B = 0, lo = [0, 0], un = [0, 0], first = null, last = null;
  page.forEach(function (it, i) {
    var r = q.reasons.filter(function (x) { return x.id === it.id; })[0];
    var spk = it.kind === 'reply' ? (r.side === 0 ? 1 : 0) : r.side;
    var n = it.kind === 'reply' ? 1 : (it.form === 'full' ? 2 : 1);
    if (spk === 0) A += n; else B += n;
    if (i === 0) first = spk; if (i === page.length - 1) last = spk;
  });
  q.reasons.forEach(function (r) {
    var on = page.some(function (it) { return it.id === r.id && it.kind === 'reason'; });
    var ans = page.some(function (it) { return it.id === r.id && it.kind === 'reply'; });
    if (!on) lo[r.side]++; else if (!ans) un[r.side]++;
  });
  var ends = [0, 0]; if (first !== null) { ends[first]++; ends[last]++; }
  return { lines: A - B, leftout: lo[1] - lo[0], unanswered: un[0] - un[1], ends: ends[0] - ends[1] };
}
function randomPage(q) {
  var page = [];
  for (var t = 0; t < 12; t++) {
    var r = q.reasons[Math.floor(rnd() * q.reasons.length)];
    var a = M.addItem(q, page, r.id, rnd() < 0.5 ? 'reason' : 'reply'); if (a.page) page = a.page;
    if (page.length && rnd() < 0.3) { var k = Math.floor(rnd() * page.length); page = M.toggleForm(q, page, k).page; }
    if (page.length && rnd() < 0.3) { var m = Math.floor(rnd() * page.length); page = M.moveItem(q, page, m, rnd() < 0.5 ? -1 : 1); }
    if (page.length && rnd() < 0.15) { page = M.removeItem(q, page, Math.floor(rnd() * page.length)); }
  }
  return page;
}
var agree = 0, tried = 0, overBudget = 0, orphan = 0;
C.QUARRELS.forEach(function (q) {
  for (var i = 0; i < 300; i++) {
    var page = randomPage(q), L = M.leans(M.sums(q, page)), I = independent(q, page); tried++;
    if (L.lines === I.lines && L.leftout === I.leftout && L.unanswered === I.unanswered && L.ends === I.ends) agree++;
    if (M.pageLines(q, page) > q.budget) overBudget++;
    page.forEach(function (it) { if (it.kind === 'reply' && M.indexOnPage(page, it.id, 'reason') < 0) orphan++; });
    var R = M.readPage(q, page), n = R.readers.filter(function (x) { return x.placed !== null; }).length;
    if (n !== R.couldTell) fails++;
    for (var k = 0; k < C.READERS.length; k++) if (R.readers[2 * k].placed !== R.readers[2 * k + 1].placed) fails++;
  }
});
check('four rules agree with an independent count on ' + tried + ' random pages over six quarrels', agree === tried, agree + ' of ' + tried);
check('no random page ever exceeds its budget', overBudget === 0);
check('no reply ever sits on a page without its point', orphan === 0);
check('eight readers, two per rule', NR === 8 && M.readPage(C.QUARRELS[0], []).readers.length === 8);
check('nine quarrels in three pools of three; every id unique within its quarrel', C.POOLS.length === 3 && C.POOLS.every(function (p) { return p.length === 3; }) && C.QUARRELS.every(function (q) { var ids = q.reasons.map(function (r) { return r.id; }); return ids.length === new Set(ids).size; }));
check('each pool\u2019s quarrels have the same budget and minimum', C.POOLS.every(function (p) { return p.every(function (q) { return q.budget === p[0].budget && q.min === p[0].min; }); }));
check('rounds 1 and 2 are even (three points a side); round 3 is four against two', C.POOLS[0].concat(C.POOLS[1]).every(function (q) { return q.reasons.filter(function (r) { return r.side === 0; }).length === 3 && q.reasons.length === 6; }) && C.POOLS[2].every(function (q) { var a = q.reasons.filter(function (r) { return r.side === 0; }).length; return q.reasons.length === 6 && (a === 4 || a === 2); }));

// ---- 2. the page's invariants ----
var q1 = bySlug('phones'), p = [];
check('a reply cannot go on before its point', !!M.addItem(q1, p, 'b1', 'reply').error);
p = M.addItem(q1, p, 'b1', 'reason').page; check('a point goes on in full when there is room', p[0].form === 'full');
p = M.addItem(q1, p, 'b1', 'reply').page; check('its reply goes on after it', p.length === 2 && p[1].kind === 'reply');
var p2 = M.removeItem(q1, p, 0); check('taking a point off takes its reply with it', p2.length === 0);
var full = []; ['b1', 'b2', 'b3', 'p1', 'p2'].forEach(function (id) { full = M.addItem(q1, full, id, 'reason').page; });
check('ten lines of full points fill the page', M.pageLines(q1, full) === 10);
check('a sixth point is refused on a full page', !!M.addItem(q1, full, 'p3', 'reason').error);
var nine = M.toggleForm(q1, full, 0).page; check('full to short frees a line', M.pageLines(q1, nine) === 9);
check('a point goes on short when only a short one fits', M.addItem(q1, nine, 'p3', 'reason').page.slice(-1)[0].form === 'brief');
check('short to full is refused without room', !!M.toggleForm(q1, M.addItem(q1, nine, 'p3', 'reason').page, 0).error);
check('an empty page cannot be published', !M.canPublish(q1, []));
check('a page under the minimum cannot be published', !M.canPublish(q1, [{ id: 'b1', kind: 'reason', form: 'full' }, { id: 'b1', kind: 'reply' }]));
check('a page at the minimum can be published', M.canPublish(q1, [{ id: 'b1', kind: 'reason', form: 'full' }, { id: 'b1', kind: 'reply' }, { id: 'p1', kind: 'reason', form: 'full' }, { id: 'p1', kind: 'reply' }]));

// ---- 3. every page of every quarrel ----
var fairPages = {};
C.QUARRELS.forEach(function (q) {
  var all = M.enumeratePages(q), fair = all.filter(function (x) { return x.reading.couldTell === 0; });
  fairPages[q.slug] = fair;
  check(q.slug + ': ' + all.length + ' page shapes within ' + q.min + '–' + q.budget + ' lines, ' + fair.length + ' that no reader can place', fair.length > 0);
  var shaped = fair.every(function (x) { var s = x.reading.sums; return s.lines[0] === s.lines[1] && s.leftOut[0] === s.leftOut[1] && s.unanswered[0] === s.unanswered[1] && s.ends[0] === s.ends[1]; });
  check(q.slug + ': every fair page has equal lines, equal left-outs, equal unanswered and split ends (every cut mirrored)', shaped);
  check(q.slug + ': no enumerated page is under the minimum', !all.some(function (x) { return M.pageLines(q, x.page) < q.min; }));
  var sizes = {}; fair.forEach(function (x) { var n = M.pageLines(q, x.page); sizes[n] = (sizes[n] || 0) + 1; });
  var byReasons = {}; fair.forEach(function (x) { var c = [0, 0]; x.page.forEach(function (it) { if (it.kind === 'reason') c[M.speakerOf(q, it)]++; }); var k = c[0] + 'v' + c[1]; byReasons[k] = (byReasons[k] || 0) + 1; });
  say('     fair pages by length ' + JSON.stringify(sizes) + ', by points on the page (side 0 v side 1) ' + JSON.stringify(byReasons) + '; ' + Math.round(100 * (all.length - fair.length) / all.length) + ' per cent of shapes are placed');
});

var H = M.HEURISTICS;
// ---- 4. the lessons of each round ----
// Round 1: two point-and-reply pairs stacked give one side both ends; the same items in another order give nobody anything.
C.POOLS[0].forEach(function (q) {
  var a = q.reasons.filter(function (r) { return r.side === 0; })[0].id, b = q.reasons.filter(function (r) { return r.side === 1; })[0].id;
  var trap = [{ id: a, kind: 'reason', form: 'full' }, { id: a, kind: 'reply' }, { id: b, kind: 'reason', form: 'full' }, { id: b, kind: 'reply' }];
  var tr = M.readPage(q, trap), fx = M.readPage(q, M.arrange(q, trap, 0, 1));
  check(q.slug + ': two stacked pairs are caught by the first-and-last readers only, and the same four items reordered by nobody', tr.couldTell === 2 && tr.caught.join() === 'ends' && tr.direction === 0 && fx.couldTell === 0, tr.statement);
});
// Round 2: six lines. Fair pages at four lines and at six, none at five; one point each in full with both answers among the fullest.
C.POOLS[1].forEach(function (q) {
  var f = fairPages[q.slug];
  var whole = f.filter(function (x) { var s = x.reading.sums; return M.pageLines(q, x.page) === q.budget && s.unanswered[0] === 0 && s.unanswered[1] === 0 && s.leftOut[0] === 2; });
  check(q.slug + ': fair pages at four lines and at six, none at five; one point each in full with both answers is among the fullest', whole.length > 0 && f.some(function (x) { return M.pageLines(q, x.page) === 4; }) && !f.some(function (x) { return M.pageLines(q, x.page) === 5; }));
});
// Round 3: four points against two. Equal left-outs by count, not share: a fair page leaves out none, or one of each, and gives the louder side more of the page.
C.POOLS[2].forEach(function (q) {
  var f = fairPages[q.slug], big = q.reasons.filter(function (r) { return r.side === 0; }).length > 3 ? 0 : 1;
  var lo = {}; f.forEach(function (x) { var s = x.reading.sums; var k = s.leftOut[0] + '/' + s.leftOut[1]; lo[k] = (lo[k] || 0) + 1; });
  check(q.slug + ': every fair page leaves out none or one of each (' + JSON.stringify(lo) + ')', Object.keys(lo).every(function (k) { return k === '0/0' || k === '1/1'; }) && lo['0/0'] > 0 && lo['1/1'] > 0);
  var mp = H.mirror(q), ms = M.sums(q, mp);
  check(q.slug + ': the mirror of counts (two a side, both answered) is caught by the left-out readers alone', ms.leftOut[big] === 2 && ms.leftOut[1 - big] === 0 && M.readPage(q, mp).caught.join() === 'leftout');
  check(q.slug + ': every fair page gives the side with more to say more points on the page', f.every(function (x) { var c = [0, 0]; x.page.forEach(function (it) { if (it.kind === 'reason') c[M.speakerOf(q, it)]++; }); return c[big] > c[1 - big]; }));
});

// ---- 5. the obvious ways of playing (build.md §3) ----
say('');
var rows = [
  ['partisan 0', function (q) { return H.partisan(q, 0); }],
  ['partisan 1', function (q) { return H.partisan(q, 1); }],
  ['wall', function (q) { return H.alternate(q); }],
  ['completist', function (q) { return H.completist(q); }],
  ['mirror', function (q) { return H.mirror(q); }],
  ['over-correct 0', function (q) { return H.overcorrect(q, 0); }]
];
var table = {};
C.QUARRELS.forEach(function (q) {
  var cells = [];
  rows.forEach(function (row) {
    var page = row[1](q), r = M.readPage(q, page);
    table[row[0] + '|' + q.slug] = r;
    var dir = r.direction === null ? '—' : r.direction === 'split' ? 'split' : q.sides[r.direction].name;
    cells.push(row[0] + ' ' + r.couldTell + '/' + dir + (r.caught.length ? ' [' + r.caught.join(',') + ']' : ''));
  });
  say('     ' + (q.slug + '          ').slice(0, 10) + cells.join('; '));
});
check('the partisan is always placed, with his own side', C.QUARRELS.every(function (q) { return table['partisan 0|' + q.slug].direction === 0 && table['partisan 1|' + q.slug].direction === 1; }));
check('the over-corrector is placed with the side he bent towards', C.QUARRELS.every(function (q) { return table['over-correct 0|' + q.slug].direction === 1; }));
check('the wall of points is caught in round 1 by the line count and the ends (ploys 2 and 1): a fifth point breaks the count', C.POOLS[0].every(function (q) { var r = table['wall|' + q.slug]; return r.caught.indexOf('lines') >= 0 && r.caught.indexOf('ends') >= 0 && r.direction === 0; }));
check('the completist is caught in round 1 by the unanswered points (ploy 4)', C.POOLS[0].every(function (q) { return table['completist|' + q.slug].caught.indexOf('unanswered') >= 0; }));
check('the mirror passes the even rounds', C.POOLS[0].concat(C.POOLS[1]).every(function (q) { return table['mirror|' + q.slug].couldTell === 0; }));
check('the mirror fails the uneven round, by what was left out (note 5)', C.POOLS[2].every(function (q) { var r = table['mirror|' + q.slug]; return r.couldTell === 2 && r.caught.join() === 'leftout'; }));
check('some way of playing goes wrong in every quarrel, and some way passes', C.QUARRELS.every(function (q) { return rows.some(function (row) { return table[row[0] + '|' + q.slug].couldTell > 0; }) && fairPages[q.slug].length > 0; }));

// ---- 6. the words ----
var trap1 = [{ id: 'b1', kind: 'reason', form: 'full' }, { id: 'b1', kind: 'reply' }, { id: 'p1', kind: 'reason', form: 'full' }, { id: 'p1', kind: 'reply' }];
check('statement: nobody', M.statement(q1, 0, null) === C.WORDS.nobody);
check('statement: four, with the ban', M.statement(q1, 4, 0) === '4 of 8 could tell. Your page leaned to the ban.');
check('statement: all eight', M.statement(q1, 8, 1) === 'All eight could tell. Your page leaned to the phones.');
check('statement: split', M.statement(q1, 2, 'split').indexOf(C.WORDS.split) > 0);
check('readers’ calls: ours / theirs / can’t tell', (function () { var r = M.readPage(q1, trap1).readers; return r[6].call === C.WORDS.ours && r[7].call === C.WORDS.theirs && r[0].call === C.WORDS.cant; })());
function playGame(draw, pageOf, stances) {
  var g = M.newGame(1); for (var r = 0; r < 3; r++) M.choose(g, r, draw[r]); M.start(g);
  for (var i = 0; i < 3; i++) { M.setStance(g, stances[i]); g.page = pageOf(M.quarrel(g)); M.publish(g); M.next(g); }
  return g;
}
var cleanGame = playGame([0, 0, 0], function (q) { return fairPages[q.slug][0].page; }, [0, 1, null]);
check('a clean game ends done, with the all-clear headline', cleanGame.done && M.verdict(cleanGame).headline.indexOf('not one could place you') > 0, M.verdict(cleanGame).headline);
check('a clean game: every quarrel line says no reader could tell', M.verdict(cleanGame).quarrels.every(function (l) { return l.indexOf('no reader could tell') > 0; }), M.verdict(cleanGame).quarrels[0]);
check('a clean game on the other draws too', (function () { var g = playGame([1, 1, 1], function (q) { return fairPages[q.slug][0].page; }, [1, 0, 1]); var v = M.verdict(g); var g2 = playGame([2, 2, 2], function (q) { return fairPages[q.slug][0].page; }, [0, 0, 0]); var v2 = M.verdict(g2); return v.clean === 3 && v.quarrels[0].indexOf('cars') > 0 && v.stood[2].indexOf('home') > 0 && v2.clean === 3 && v2.quarrels[0].indexOf('uniforms') > 0 && v2.quarrels[2].indexOf('sixteen') > 0; })());
check('choosing works before start and not after; an index outside the pool is ignored', (function () { var g = M.newGame(5); M.choose(g, 0, 2); M.choose(g, 1, 7); var before = g.draw.slice(); M.start(g); M.choose(g, 0, 0); return before[0] === 2 && before[1] === M.newGame(5).draw[1] && g.draw[0] === 2 && g.stage === 'stance'; })());
check('the stance cannot be set before the game starts', (function () { var g = M.newGame(5); M.setStance(g, 0); return g.stage === 'choose'; })());
check('one page a quarrel: a second publish in the same quarrel is refused', (function () { var g = M.newGame(14); M.start(g); M.setStance(g, 0); g.page = fairPages[M.quarrel(g).slug][0].page; var a = M.publish(g); var b = M.publish(g); return a && b === null && g.stage === 'read'; })());
check('next before publishing does nothing', (function () { var g = M.newGame(14); M.start(g); M.setStance(g, 0); M.next(g); return g.q === 0 && g.stage === 'write'; })());
check('a clean game: the stance lines say nobody could tell', M.verdict(cleanGame).stood[0] === 'You are for the ban. Nobody could tell.' && M.verdict(cleanGame).stood[2].indexOf('found none') > 0);
var dirtyGame = playGame([0, 0, 0], function (q) { return H.partisan(q, 1); }, [0, 1, 0]);
var dv = M.verdict(dirtyGame);
check('a partisan game: the readers could tell every time', dv.headline === 'The readers could tell every time.');
check('a partisan game: found out / bent over backwards', dv.stood[1].indexOf('found you out') > 0 && dv.stood[0].indexOf('Bending over backwards') > 0, dv.stood[0]);
var mixedGame = playGame([0, 0, 0], function (q) { return q.slug === 'phones' ? H.alternate(q) : q.slug === 'pets' ? fairPages.pets[0].page : H.mirror(q); }, [0, 0, 1]);
var mv = M.verdict(mixedGame);
check('a mixed game: headline counts the quarrels the readers could tell', mv.headline === 'The readers could tell in two of your three quarrels.', mv.headline);
check('a mixed game: the quarrel line names what caught the page', mv.quarrels[0].indexOf('the line count') > 0 && mv.quarrels[0].indexOf('the first word and the last') > 0 && mv.quarrels[2].indexOf('what you left out') > 0 && mv.quarrels[1].indexOf('no reader could tell') > 0, mv.quarrels[2]);
check('no decimals in any word the game says', !/\d\.\d/.test(JSON.stringify(mv) + JSON.stringify(dv) + JSON.stringify(M.readPage(q1, trap1))));

// ---- 7. the draw ----
var counts = [[0, 0, 0], [0, 0, 0], [0, 0, 0]], N = 0;
for (var s = 10000; s < 100000; s += 3) { var g = M.newGame(s); for (var i = 0; i < 3; i++) counts[i][g.draw[i]]++; N++; }
check('over ' + N + ' seeds each quarrel is the default pick between 30 and 37 per cent of the time', counts.every(function (c) { return c.every(function (n) { return n / N > 0.30 && n / N < 0.37; }); }), JSON.stringify(counts));
check('the same seed gives the same draw; neighbouring seeds differ somewhere', M.newGame(4242).draw.join() === M.newGame(4242).draw.join() && (function () { var d = 0; for (var s = 1; s < 200; s++) if (M.newGame(s).draw.join() !== M.newGame(s + 1).draw.join()) d++; return d > 50; })());
check('a game has three different rounds whatever the seed, and the end names its three quarrels', (function () { for (var s = 1; s < 300; s++) { var g = M.newGame(s); if (M.gameQuarrels(g).length !== 3 || g.draw.some(function (d) { return d < 0 || d > 2; })) return false; } return true; })());

// ---- 8. does the discovery survive the designer's choices? ----
function altRead(q, page) {
  var s = M.sums(q, page), nA = q.reasons.filter(function (r) { return r.side === 0; }).length, nB = q.reasons.length - nA;
  return { lines: s.lines[0] - s.lines[1], leftout: Math.round((s.leftOut[1] / nB - s.leftOut[0] / nA) * 1000) / 1000, unanswered: s.unanswered[0] - s.unanswered[1], ends: s.ends[0] - s.ends[1] };
}
C.QUARRELS.forEach(function (q) {
  var all = M.enumeratePages(q), fairAlt = all.filter(function (x) { var L = altRead(q, x.page); return L.lines === 0 && L.leftout === 0 && L.unanswered === 0 && L.ends === 0; });
  var both = fairAlt.filter(function (x) { return x.reading.couldTell === 0; });
  check(q.slug + ': with a share-counting left-out reader, fair pages still exist (' + fairAlt.length + '), ' + both.length + ' of them fair under both rules', fairAlt.length > 0 && both.length > 0);
});
var saved = C.LINES.full; C.LINES.full = 3;
C.QUARRELS.forEach(function (q) {
  var fair = M.enumeratePages(q).filter(function (x) { return x.reading.couldTell === 0; });
  check(q.slug + ': with a full point at three lines, fair pages still exist (' + fair.length + ') and the partisan is still placed', fair.length > 0 && M.readPage(q, H.partisan(q, 0)).direction === 0);
});
C.LINES.full = saved;
C.QUARRELS.forEach(function (q) {
  var L = M.leans(M.sums(q, H.partisan(q, 1)));
  check(q.slug + ': the partisan’s page leans by more than one on lines or on unanswered points, so a tolerant reader would catch it too', Math.abs(L.lines) > 1 || Math.abs(L.unanswered) > 1, JSON.stringify(L));
});
(function () {
  var q = q1, a = M.readPage(q, M.arrange(q, [{ id: 'b1', kind: 'reason', form: 'full' }, { id: 'b1', kind: 'reply' }, { id: 'p1', kind: 'reason', form: 'full' }, { id: 'p1', kind: 'reply' }], 0, 1));
  var b = M.readPage(q, M.arrange(q, [{ id: 'b3', kind: 'reason', form: 'full' }, { id: 'b3', kind: 'reply' }, { id: 'p2', kind: 'reason', form: 'full' }, { id: 'p2', kind: 'reply' }], 0, 1));
  check('the readers cannot weigh: two mirrored pages with different points chosen are both fair', a.couldTell === 0 && b.couldTell === 0);
})();

say('');
say(fails === 0 ? 'ALL CHECKS PASS' : fails + ' CHECK(S) FAILED');
process.exit(fails ? 1 : 0);
