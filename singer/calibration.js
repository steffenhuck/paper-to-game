// Calibration check for Draw a Line with Singer (revision 8). Run: node calibration.js. Exit code 1 on any failure.
// The mechanism is a TOY of an argument; the check verifies (1) that every ordering the 1974 paper states holds in the cast,
// (2) the claim on this cast: whenever the player would use an animal sooner than every person (the species pattern), all three rules with
// marks object, and Suffer objects as soon as the player says the beings can suffer; (3) that the Aware objection rests on the paper's own
// orderings (apes and mice above the baby), not on our lengths; (4) that every one of the 256 lines the three experiments can reveal, with every
// one of the 16 answer sets to "can they suffer?", gets a pattern, a shape, a name, words for each rule, Suffer words and a verdict;
// (5) the stories: three rungs, three stories each, drawn reproducibly; (6) a table of the shapes.
var m = require('./mechanism.js'), C = m.CONFIG, N = m.NEVER, fails = 0, out = [];
function check(name, ok, detail) { out.push((ok ? 'ok   ' : 'FAIL ') + name + (detail ? ' — ' + detail : '')); if (!ok) fails++; }
var S = C.SUBJECTS, LV = [1, 2, 3, N];

// (1)
C.PAPER_ORDERINGS.forEach(function (o) {
  var ok = true;
  o.above.forEach(function (a) { o.below.forEach(function (b) { var ra = m.castById(a)[o.ruler], rb = m.castById(b)[o.ruler]; if (o.strict ? !(ra > rb) : !(ra >= rb)) ok = false; }); });
  check('ordering on ' + o.ruler + ': ' + o.above.join('/') + (o.strict ? ' > ' : ' >= ') + o.below.join('/'), ok, o.src);
});
check('the four subjects are the paper\'s: the baby, the hurt grown-up, the chimpanzee, the mouse', JSON.stringify(S) === '["infant","braindam","chimp","mouse"]');
check('every subject can suffer in the paper\'s reading (suffer mark 10)', S.every(function (id) { return m.castById(id).suffer === 10; }));

// (4) every line × every answer set
var shapes = {}, patterns = {}, bad = 0, speciesLines = 0, speciesAllObject = 0;
var allYes = {}; S.forEach(function (id) { allYes[id] = true; });
function thOf(vals) { var th = {}; S.forEach(function (id, i) { th[id] = vals[i]; }); return th; }
function ticksOf(th) { var t = { 1: [], 2: [], 3: [] }; S.forEach(function (id) { for (var n = 1; n <= 3; n++) if (th[id] !== N && th[id] <= n) t[n].push(id); }); return t; }
for (var a = 0; a < 4; a++) for (var b = 0; b < 4; b++) for (var c = 0; c < 4; c++) for (var d = 0; d < 4; d++) {
  var th = thOf([LV[a], LV[b], LV[c], LV[d]]), p = m.pattern(th);
  patterns[p] = (patterns[p] || 0) + 1;
  if (JSON.stringify(m.thresholds(ticksOf(th))) !== JSON.stringify(th)) bad++; // thresholds round-trip through ticks
  if (!m.didWords(th)) bad++;
  C.RULES.forEach(function (r) { var w = m.ruleWords(th, r.id); if (!w || w.length < 40) bad++; });
  if (p === 'species') { speciesLines++; if (C.RULES.every(function (r) { return !m.ruleTest(th, r.id).agrees; })) speciesAllObject++; }
  for (var mask = 0; mask < 16; mask++) {
    var ans = {}; S.forEach(function (id, i) { ans[id] = !!(mask & (1 << i)); });
    var w = m.shapeWords(th, ans); shapes[w.shape.id] = (shapes[w.shape.id] || 0) + 1;
    if (!w.name || !w.headline || !w.who || w.who.length < 40) bad++;
    if (w.shape.id !== 'species' && (!w.singer || w.singer.length < 40)) bad++;
    var sw = m.sufferWords(th, ans); if (!sw || sw.length < 30) bad++;
    var v = m.verdict({ ticks: ticksOf(th), answers: ans }); if (!v.fate || v.did.length !== 5 || v.found.length !== 1 || !v.part.length || !v.stood.length) bad++;
    var st = m.sufferTest(th, ans);
    var yesVals = S.filter(function (id) { return ans[id]; }).map(function (id) { return th[id]; });
    var shouldObject = yesVals.length >= 2 && Math.min.apply(null, yesVals) !== Math.max.apply(null, yesVals);
    if (st.objects !== shouldObject) bad++;
  }
}
check('all 256 lines x 16 answer sets get a pattern, a shape, a name, words for each rule, Suffer words and a verdict; thresholds round-trip; Suffer objects exactly when it should', bad === 0, bad + ' problems');
check('patterns: refuse 1, equal 3, and the rest species / reverse / mixed', patterns.refuse === 1 && patterns.equal === 3, JSON.stringify(patterns));
check('every species-pattern line draws an objection from all three rules with marks (' + speciesLines + ' such lines)', speciesLines > 0 && speciesAllObject === speciesLines, speciesAllObject + ' of ' + speciesLines);
check('all six shapes occur', ['refuse', 'singer', 'equal-no', 'line', 'species', 'own'].every(function (k) { return shapes[k] > 0; }), JSON.stringify(shapes));
check('the paper\'s own case, the chimpanzee to save a life and the baby only for a thousand, is species and no rule agrees', (function () { var t = thOf([3, 3, 2, 2]); return m.pattern(t) === 'species' && m.rulesAgreeing(t).length === 0 && m.shapeOf(t, allYes).id === 'species'; })());
check('the mouse alone, to save a life, is species: Aware and Reason object on marks, Talk on a tie', (function () { var t = thOf([N, N, N, 2]); return m.pattern(t) === 'species' && !m.ruleTest(t, 'aware').agrees && !m.ruleTest(t, 'reason').agrees && m.ruleTest(t, 'talk').tie === true; })());
check('people before animals, hurt grown-up first, is a Reason line', (function () { var t = thOf([2, 1, 3, 2]); var s = m.shapeOf(t, allYes); return m.pattern(t) === 'reverse' && s.id === 'line' && s.lines.indexOf('reason') >= 0; })());
check('all four at the same rung, all can suffer, is Singer\'s line; with one "no" it is equal-no', m.shapeOf(thOf([2, 2, 2, 2]), allYes).id === 'singer' && m.shapeOf(thOf([2, 2, 2, 2]), { infant: true, braindam: true, chimp: true, mouse: false }).id === 'equal-no');
check('nobody at any price is refuse, and its verdict points to Foot', m.shapeOf(thOf([N, N, N, N]), allYes).id === 'refuse' && /Foot/.test(m.verdict({ ticks: { 1: [], 2: [], 3: [] }, answers: allYes }).stood[0]));

// (3) robustness: the Aware objection to the species pattern rests on the paper's orderings (chimp, mouse > infant on aware)
function rnd(seed) { var x = seed >>> 0; return function () { x = (x * 1664525 + 1013904223) >>> 0; return x / 4294967296; }; }
var trials = 500, survived = 0, saved = C.CAST.map(function (b) { return { reason: b.reason, talk: b.talk, aware: b.aware }; });
var speciesTh = []; for (var a2 = 0; a2 < 4; a2++) for (var b2 = 0; b2 < 4; b2++) for (var c2 = 0; c2 < 4; c2++) for (var d2 = 0; d2 < 4; d2++) { var t2 = thOf([LV[a2], LV[b2], LV[c2], LV[d2]]); if (m.pattern(t2) === 'species') speciesTh.push(t2); }
for (var t = 0; t < trials; t++) {
  var R = rnd(t + 1), ok = true;
  ['reason', 'talk', 'aware'].forEach(function (rid) {
    var found = false;
    for (var tries = 0; tries < 20000 && !found; tries++) {
      C.CAST.forEach(function (b) { if (b.id !== 'stone') b[rid] = Math.floor(R() * 11); });
      found = C.PAPER_ORDERINGS.filter(function (o) { return o.ruler === rid; }).every(function (o) { return o.above.every(function (x) { return o.below.every(function (y) { var ra = m.castById(x)[rid], rb = m.castById(y)[rid]; return o.strict ? ra > rb : ra >= rb; }); }); });
    }
    if (!found) ok = false;
  });
  if (ok && speciesTh.every(function (th3) { return !m.ruleTest(th3, 'aware').agrees; })) survived++;
  C.CAST.forEach(function (b, i) { b.reason = saved[i].reason; b.talk = saved[i].talk; b.aware = saved[i].aware; });
}
check('robustness: with random marks that keep only the paper\'s orderings, Aware objects to every species-pattern line', survived === trials, survived + ' of ' + trials);
check('cast restored', m.castById('chimp').aware === 8 && m.castById('mouse').aware === 3 && m.castById('infant').reason === 1);

// (5) stories
check('three rungs of rising stakes, three stories each, and a fixed cost', C.LEVELS.length === 3 && C.LEVELS.every(function (L) { return L.skins.length === 3 && L.skins.every(function (s) { return s.length > 60; }); }) && C.COST.length > 40);
check('stories draw reproducibly, and seed 0 gives the first of each rung', JSON.stringify(m.drawSkins(7)) === JSON.stringify(m.drawSkins(7)) && m.drawSkins(0).every(function (s, i) { return s === C.LEVELS[i].skins[0]; }) && (function () { var seen = {}; for (var k = 1; k < 60; k++) seen[m.drawSkins(k).join('|')] = 1; return Object.keys(seen).length > 5; })());

// (6)
out.push('\nShapes over 256 lines x 16 answer sets:'); Object.keys(shapes).forEach(function (k) { out.push('  ' + k.padEnd(10) + shapes[k]); });
out.push('Patterns over 256 lines:'); Object.keys(patterns).forEach(function (k) { out.push('  ' + k.padEnd(10) + patterns[k]); });
console.log(out.join('\n'));
console.log(fails ? '\n' + fails + ' CHECK(S) FAILED' : '\nall checks passed');
process.exit(fails ? 1 : 0);
