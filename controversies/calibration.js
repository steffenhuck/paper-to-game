// calibration.js — the headless check for Leibniz's Even Hand (build.md §2–3). The text has no numbers, so the check
// verifies that the mechanism does what the memo and the screens say it does: the four readers' rules against an
// independent count; the page's invariants; every page of every quarrel enumerated, with the fair pages counted and
// their shape confirmed; the obvious ways of playing and where each goes wrong; the words; and whether the central
// discovery survives changes to the designer's choices. Exit code 1 on any failure.
var M = require('./mechanism.js'), C = M.CONFIG;
var fails = 0, out = [];
function say(s) { out.push(s); console.log(s); }
function check(name, ok, detail) { say((ok ? 'ok   ' : 'FAIL ') + name + (detail ? ' — ' + detail : '')); if (!ok) fails++; }
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
  for (var i = 0; i < 400; i++) {
    var page = randomPage(q), L = M.leans(M.sums(q, page)), I = independent(q, page); tried++;
    if (L.lines === I.lines && L.leftout === I.leftout && L.unanswered === I.unanswered && L.ends === I.ends) agree++;
    if (M.pageLines(q, page) > q.budget) overBudget++;
    page.forEach(function (it) { if (it.kind === 'reply' && M.indexOnPage(page, it.id, 'reason') < 0) orphan++; });
    var R = M.readPage(q, page), n = R.readers.filter(function (x) { return x.placed !== null; }).length;
    if (n !== R.couldTell) fails++;
    for (var k = 0; k < C.READERS.length; k++) if (R.readers[2 * k].placed !== R.readers[2 * k + 1].placed) fails++; // both sides' readers of one rule read the same lean
  }
});
check('four rules agree with an independent count on ' + tried + ' random pages', agree === tried, agree + ' of ' + tried);
check('no random page ever exceeds its budget', overBudget === 0);
check('no reply ever sits on a page without its point', orphan === 0);
check('eight readers, two per rule', NR === 8 && M.readPage(C.QUARRELS[0], []).readers.length === 8);

// ---- 2. the page's invariants ----
var q1 = C.QUARRELS[0], p = [];
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
  var underMin = all.some(function (x) { return M.pageLines(q, x.page) < q.min; });
  check(q.slug + ': no enumerated page is under the minimum', !underMin);
  var sizes = {}; fair.forEach(function (x) { var n = M.pageLines(q, x.page); sizes[n] = (sizes[n] || 0) + 1; });
  say('     fair pages by length: ' + JSON.stringify(sizes));
  var byReasons = {}; fair.forEach(function (x) { var c = [0, 0]; x.page.forEach(function (it) { if (it.kind === 'reason') c[M.speakerOf(q, it)]++; }); var k = c[0] + 'v' + c[1]; byReasons[k] = (byReasons[k] || 0) + 1; });
  say('     fair pages by points on the page (side 0 v side 1): ' + JSON.stringify(byReasons));
  var placedShare = Math.round(100 * (all.length - fair.length) / all.length);
  say('     ' + placedShare + ' per cent of page shapes are placed by at least one reader');
});

var H = M.HEURISTICS;
// ---- 4. the lessons of each quarrel ----
// Quarrel 1: two point-and-reply pairs stacked give one side both ends; the same items in another order give nobody anything.
var trap = [{ id: 'b1', kind: 'reason', form: 'full' }, { id: 'b1', kind: 'reply' }, { id: 'p1', kind: 'reason', form: 'full' }, { id: 'p1', kind: 'reply' }];
var tr = M.readPage(q1, trap);
check('phones: two stacked pairs are caught by the first-and-last readers only', tr.couldTell === 2 && tr.caught.join() === 'ends' && tr.direction === 0, tr.statement);
var fixed = M.readPage(q1, M.arrange(q1, trap, 0, 1));
check('phones: the same four items reordered are placed by nobody', fixed.couldTell === 0, M.arrange(q1, trap, 0, 1).map(function (i) { return i.id + (i.kind === 'reply' ? '-reply' : ''); }).join(' '));
// Quarrel 2: six lines. Fair pages exist at four and six lines; one point each in full with both answers is among the fullest.
var q2 = C.QUARRELS[1], f2 = fairPages.pets;
var fullest = f2.filter(function (x) { return M.pageLines(q2, x.page) === q2.budget; });
var whole = fullest.filter(function (x) { var s = x.reading.sums; return s.unanswered[0] === 0 && s.unanswered[1] === 0 && s.leftOut[0] === 2; });
check('pets: a six-line page nobody can place exists, and among the fullest, one point each in full with both answers is one', whole.length > 0, fullest.length + ' fullest fair shapes');
check('pets: fair pages exist at four lines and at six, and none at five (five lines cannot be even)', f2.some(function (x) { return M.pageLines(q2, x.page) === 4; }) && f2.some(function (x) { return M.pageLines(q2, x.page) === 6; }) && !f2.some(function (x) { return M.pageLines(q2, x.page) === 5; }));
check('pets: every fair page has the same number of points a side', f2.every(function (x) { var c = [0, 0]; x.page.forEach(function (it) { if (it.kind === 'reason') c[M.speakerOf(q2, it)]++; }); return c[0] === c[1]; }));
// Quarrel 3: four points against two. Equal left-outs by count, not share: the fair pages leave out none, or one of each.
var q3 = C.QUARRELS[2], f3 = fairPages.homework;
var lo = {}; f3.forEach(function (x) { var s = x.reading.sums; var k = s.leftOut[0] + '/' + s.leftOut[1]; lo[k] = (lo[k] || 0) + 1; });
say('     homework: fair pages by points left out (scrap/keep): ' + JSON.stringify(lo));
check('homework: every fair page leaves out the same number on each side, none or one of each; never both keep points', Object.keys(lo).every(function (k) { return k === '0/0' || k === '1/1'; }) && lo['0/0'] > 0 && lo['1/1'] > 0);
check('homework: the mirror of counts (two a side, both answered) is not fair, because two scrap points are left out against none', (function () { var p = H.mirror(q3); var s = M.sums(q3, p); return s.leftOut[0] === 2 && s.leftOut[1] === 0 && M.readPage(q3, p).caught.join() === 'leftout'; })());
check('homework: a fair page gives the side with more to say more points on the page', f3.every(function (x) { var c = [0, 0]; x.page.forEach(function (it) { if (it.kind === 'reason') c[M.speakerOf(q3, it)]++; }); return c[0] > c[1]; }));

// ---- 5. the obvious ways of playing (build.md §3) ----
say('');
say('     heuristic           phones                     pets                       homework');
var rows = [
  ['partisan, side 0', function (q) { return H.partisan(q, 0); }],
  ['partisan, side 1', function (q) { return H.partisan(q, 1); }],
  ['wall of points', function (q) { return H.alternate(q); }],
  ['completist', function (q) { return H.completist(q); }],
  ['mirror', function (q) { return H.mirror(q); }],
  ['over-correct, for 0', function (q) { return H.overcorrect(q, 0); }]
];
var table = {};
rows.forEach(function (row) {
  var cells = [];
  C.QUARRELS.forEach(function (q) {
    var page = row[1](q), r = M.readPage(q, page), ok = M.canPublish(q, page);
    table[row[0] + '|' + q.slug] = { r: r, ok: ok, lines: M.pageLines(q, page) };
    var dir = r.direction === null ? '—' : r.direction === 'split' ? 'split' : q.sides[r.direction].name;
    cells.push((ok ? '' : '(short) ') + r.couldTell + ' could tell, ' + dir + ' [' + r.caught.join(',') + '] ' + M.pageLines(q, page) + 'l');
  });
  say('     ' + (row[0] + '                    ').slice(0, 20) + cells.map(function (c) { return (c + '                           ').slice(0, 27); }).join(''));
});
check('the partisan is always placed, with his own side', C.QUARRELS.every(function (q) { return table['partisan, side 0|' + q.slug].r.direction === 0 && table['partisan, side 1|' + q.slug].r.direction === 1; }));
check('the over-corrector is placed with the side he bent towards', C.QUARRELS.every(function (q) { return table['over-correct, for 0|' + q.slug].r.direction === 1; }));
check('the stranger’s wall of points is caught in the first quarrel by the line count and the ends (ploys 2 and 1): a fifth point breaks the count', table['wall of points|phones'].r.caught.indexOf('lines') >= 0 && table['wall of points|phones'].r.caught.indexOf('ends') >= 0 && table['wall of points|phones'].r.direction === 0);
check('the completist is caught in the first quarrel by the unanswered points (ploy 4)', table['completist|phones'].r.caught.indexOf('unanswered') >= 0);
check('the mirror passes the even quarrels', table['mirror|phones'].r.couldTell === 0 && table['mirror|pets'].r.couldTell === 0);
check('the mirror fails the uneven quarrel, by what was left out (note 5)', table['mirror|homework'].r.couldTell === 2 && table['mirror|homework'].r.caught.join() === 'leftout');
check('some way of playing goes wrong in every quarrel', C.QUARRELS.every(function (q) { return rows.some(function (row) { return table[row[0] + '|' + q.slug].r.couldTell > 0; }); }));
check('some way of playing passes every quarrel', C.QUARRELS.every(function (q) { return fairPages[q.slug].length > 0; }));

// ---- 6. the words ----
check('statement: nobody', M.statement(q1, 0, null) === C.WORDS.nobody);
check('statement: four, with the ban', M.statement(q1, 4, 0) === '4 of 8 could tell. Your page leaned to the ban.');
check('statement: all eight', M.statement(q1, 8, 1) === 'All eight could tell. Your page leaned to the phones.');
check('statement: split', M.statement(q1, 2, 'split').indexOf(C.WORDS.split) > 0);
check('readers’ calls: ours / theirs / can’t tell', (function () { var r = M.readPage(q1, trap).readers; return r[6].call === C.WORDS.ours && r[7].call === C.WORDS.theirs && r[0].call === C.WORDS.cant; })());
function playGame(pages, stances) {
  var g = M.newGame();
  for (var i = 0; i < 3; i++) { M.setStance(g, stances[i]); g.page = pages[i]; M.publish(g); M.next(g); }
  return g;
}
var cleanGame = playGame(C.QUARRELS.map(function (q) { return fairPages[q.slug][0].page; }), [0, 1, null]);
check('a clean game ends done, with the all-clear headline', cleanGame.done && M.verdict(cleanGame).headline.indexOf('not one could place you') > 0, M.verdict(cleanGame).headline);
check('a clean game: every quarrel line says no reader could tell', M.verdict(cleanGame).quarrels.every(function (l) { return l.indexOf('no reader could tell') > 0; }), M.verdict(cleanGame).quarrels[0]);
check('one page a quarrel: a second publish in the same quarrel is refused', (function () { var g = M.newGame(); M.setStance(g, 0); g.page = fairPages.phones[0].page; var a = M.publish(g); var b = M.publish(g); return a && b === null && g.stage === 'read'; })());
check('next before publishing does nothing', (function () { var g = M.newGame(); M.setStance(g, 0); M.next(g); return g.q === 0 && g.stage === 'write'; })());
check('a clean game: the stance lines say nobody could tell', M.verdict(cleanGame).stood[0] === 'You are for the ban. Nobody could tell.' && M.verdict(cleanGame).stood[2].indexOf('found none') > 0);
var dirtyGame = playGame(C.QUARRELS.map(function (q) { return H.partisan(q, 1); }), [0, 1, 0]);
var dv = M.verdict(dirtyGame);
check('a partisan game: the readers could tell every time', dv.headline === 'The readers could tell every time.');
check('a partisan game: found out / bent over backwards', dv.stood[1].indexOf('found you out') > 0 && dv.stood[0].indexOf('Bending over backwards') > 0, dv.stood[0]);
var mixedGame = playGame([H.alternate(q1), fairPages.pets[0].page, H.mirror(q3)], [0, 0, 1]);
var mv = M.verdict(mixedGame);
check('a mixed game: headline counts the quarrels the readers could tell', mv.headline === 'The readers could tell in two of your three quarrels.', mv.headline);
check('a mixed game: the quarrel line names what caught the page', mv.quarrels[0].indexOf('the line count') > 0 && mv.quarrels[0].indexOf('the first word and the last') > 0 && mv.quarrels[2].indexOf('what you left out') > 0 && mv.quarrels[1].indexOf('no reader could tell') > 0, mv.quarrels[2]);
check('no decimals in any word the game says', !/\d\.\d/.test(JSON.stringify(mv) + JSON.stringify(dv) + JSON.stringify(M.readPage(q1, trap))));

// ---- 7. does the discovery survive the designer's choices? ----
// (a) a left-out reader who counts the share of each side's points left out, not the number
function altRead(q, page) {
  var s = M.sums(q, page), nA = q.reasons.filter(function (r) { return r.side === 0; }).length, nB = q.reasons.length - nA;
  return { lines: s.lines[0] - s.lines[1], leftout: Math.round((s.leftOut[1] / nB - s.leftOut[0] / nA) * 1000) / 1000, unanswered: s.unanswered[0] - s.unanswered[1], ends: s.ends[0] - s.ends[1] };
}
C.QUARRELS.forEach(function (q) {
  var all = M.enumeratePages(q), fairAlt = all.filter(function (x) { var L = altRead(q, x.page); return L.lines === 0 && L.leftout === 0 && L.unanswered === 0 && L.ends === 0; });
  var both = fairAlt.filter(function (x) { return x.reading.couldTell === 0; });
  check(q.slug + ': with a share-counting left-out reader, fair pages still exist (' + fairAlt.length + '), ' + both.length + ' of them fair under both rules', fairAlt.length > 0 && both.length > 0);
});
// (b) a full point three lines long instead of two
var saved = C.LINES.full; C.LINES.full = 3;
C.QUARRELS.forEach(function (q) {
  var fair = M.enumeratePages(q).filter(function (x) { return x.reading.couldTell === 0; });
  check(q.slug + ': with a full point at three lines, fair pages still exist (' + fair.length + ') and the partisan is still placed', fair.length > 0 && M.readPage(q, H.partisan(q, 0)).direction === 0);
});
C.LINES.full = saved;
// (c) a reader with a tolerance of one would still catch the partisan
C.QUARRELS.forEach(function (q) {
  var L = M.leans(M.sums(q, H.partisan(q, 1)));
  check(q.slug + ': the partisan’s page leans by more than one on lines or on unanswered points, so a tolerant reader would catch it too', Math.abs(L.lines) > 1 || Math.abs(L.unanswered) > 1, JSON.stringify(L));
});
// (d) the readers count, they cannot weigh: a page that leaves out each side's point in mirrored number is fair whichever points go,
//     which is the game's declared limit (verdict, "What the readers cannot see")
(function () {
  var q = q1, a = M.readPage(q, M.arrange(q, [{ id: 'b1', kind: 'reason', form: 'full' }, { id: 'b1', kind: 'reply' }, { id: 'p1', kind: 'reason', form: 'full' }, { id: 'p1', kind: 'reply' }], 0, 1));
  var b = M.readPage(q, M.arrange(q, [{ id: 'b3', kind: 'reason', form: 'full' }, { id: 'b3', kind: 'reply' }, { id: 'p2', kind: 'reason', form: 'full' }, { id: 'p2', kind: 'reply' }], 0, 1));
  check('the readers cannot weigh: two mirrored pages with different points chosen are both fair', a.couldTell === 0 && b.couldTell === 0);
})();

say('');
say(fails === 0 ? 'ALL CHECKS PASS' : fails + ' CHECK(S) FAILED');
process.exit(fails ? 1 : 0);
