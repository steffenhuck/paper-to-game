// Calibration check for Draw a Line with Singer (revision 12). Run: node calibration.js. Exit code 1 on any failure.
// The mechanism is a TOY of an argument; the check verifies (1) that every ordering the 1974 paper states holds in the cast, and that the
// three menus cover the nine creatures that can suffer once each, each menu with a person and an animal; (2) the claims on this cast: the
// team's choices (every animal used, every person spared, in every experiment) are explained by Species and by no rule with a ranking, and
// Suffer, the fourth rule with equal marks, objects to them; (3) that the objection to the team's choices rests on the paper's own orderings,
// not on our lengths, over 500 random casts; (4) that every one of the 512 sets of choices gets a pattern, a shape, a name, words for each of
// the four rules and a verdict, and that the per-experiment test has the properties it claims; (5) the stories; (6) a table of the shapes.
var m = require('./mechanism.js'), C = m.CONFIG, fails = 0, out = [];
function check(name, ok, detail) { out.push((ok ? 'ok   ' : 'FAIL ') + name + (detail ? ' — ' + detail : '')); if (!ok) fails++; }
var S = C.SUBJECTS;

// (1)
C.PAPER_ORDERINGS.forEach(function (o) {
  var ok = true;
  o.above.forEach(function (a) { o.below.forEach(function (b) { var ra = m.castById(a)[o.ruler], rb = m.castById(b)[o.ruler]; if (o.strict ? !(ra > rb) : !(ra >= rb)) ok = false; }); });
  check('ordering on ' + o.ruler + ': ' + o.above.join('/') + (o.strict ? ' > ' : ' >= ') + o.below.join('/'), ok, o.src);
});
var all = [].concat(C.MENUS[1], C.MENUS[2], C.MENUS[3]);
check('the three menus hold the nine creatures that can suffer, each once, and not the stone', all.length === 9 && S.every(function (id) { return all.indexOf(id) >= 0; }) && all.indexOf('stone') < 0);
check('each menu has a person and an animal', [1, 2, 3].every(function (k) { return C.MENUS[k].some(function (id) { return m.castById(id).human; }) && C.MENUS[k].some(function (id) { return !m.castById(id).human; }); }));
check('the third menu is the paper\'s own test: the baby, to save many lives, with Bentham\'s dog beside it', C.MENUS[3].indexOf('infant') >= 0 && C.MENUS[3].indexOf('dog') >= 0);
check('four rules, the fourth Suffer, whose marks are equal for the nine and zero for the stone', C.RULES.length === 4 && C.RULES[3].id === 'suffer' && S.every(function (id) { return m.castById(id).suffer === 10; }) && m.castById('stone').suffer === 0);

// (2) the team's choices
function ticksFrom(mask) { var t = { 1: [], 2: [], 3: [] }; S.forEach(function (id, i) { if (mask & (1 << i)) t[m.rungOf(id)].push(id); }); return t; }
var team = { 1: [], 2: [], 3: [] }; S.forEach(function (id) { if (!m.castById(id).human) team[m.rungOf(id)].push(id); });
check('the team\'s choices are explained by Species and by no rule with a ranking', m.ruleTest(team, 'species').ok && m.rulesExplaining(team).length === 0 && m.shapeOf(team).id === 'species');
check('Suffer objects to the team\'s choices, in all three experiments', !m.ruleTest(team, 'suffer').ok && m.ruleTest(team, 'suffer').bad.length === 3);
check('Suffer explains a choice exactly when all three or nobody are used', (function () { for (var mask = 0; mask < 512; mask++) { var t = ticksFrom(mask), rt = m.ruleTest(t, 'suffer'); for (var k = 1; k <= 3; k++) { var n = t[k].length; if (rt.cols[k].ok !== (n === 0 || n === 3)) return false; } } return true; })());
check('everyone from one life on, nobody for a child\'s year, is Singer\'s line', m.shapeOf({ 1: [], 2: ['braindam', 'chimp', 'pig'], 3: ['adult', 'infant', 'dog'] }).id === 'singer');
check('nobody at any price is refuse, and its verdict points to Foot', m.shapeOf({ 1: [], 2: [], 3: [] }).id === 'refuse' && /Foot/.test(m.verdict({ ticks: { 1: [], 2: [], 3: [] } }).part));
check('the mouse first, then the hurt grown-up, then the baby, is explained by Reason (and the others)', m.shapeOf({ 1: ['mouse'], 2: ['braindam'], 3: ['infant'] }).id === 'line');
check('the dog used to save a thousand lives and the baby spared draws an objection from Reason, Talk and Aware', (function () { var t = { 1: [], 2: [], 3: ['dog'] }; return C.MARKS.every(function (r) { return !m.ruleTest(t, r.id).ok; }); })());
check('the chimpanzee used to save a life and the hurt grown-up spared draws an objection from Reason, Talk and Aware', (function () { var t = { 1: [], 2: ['chimp'], 3: [] }; return C.MARKS.every(function (r) { return !m.ruleTest(t, r.id).ok; }); })());

// (4) every set of choices
var shapes = {}, patterns = {}, bad = 0, nRules = {};
for (var mask = 0; mask < 512; mask++) {
  var t = ticksFrom(mask), p = m.pattern(t);
  patterns[p] = (patterns[p] || 0) + 1;
  if (!m.didWords(t)) bad++;
  var L = m.rulesExplaining(t); nRules[L.length] = (nRules[L.length] || 0) + 1;
  C.RULES.forEach(function (r) {
    var w = m.ruleWords(t, r.id); if (!w || w.length < 30) bad++;
    // property: a rule explains the choices iff, in each experiment on its own, some cutoff reproduces the choice
    var mk = m.marksOf(r.id), rt = m.ruleTest(t, r.id), ok2 = true;
    for (var k = 1; k <= 3 && ok2; k++) {
      var found = false;
      for (var cut = -1; cut <= 10 && !found; cut++) if (m.menuOf(k).every(function (id) { return (t[k].indexOf(id) >= 0) === (mk(id) <= cut); })) found = true;
      if (!found) ok2 = false;
    }
    if (rt.ok !== ok2) bad++;
    // every violating pair is (used, spared) on the same menu; each bad column's worst pair is among its pairs; violators are exactly the creatures in the pairs
    [1, 2, 3].forEach(function (k) { var c = rt.cols[k]; if (c.ok) { if (c.pairs.length) bad++; return; } var inv = {}; c.pairs.forEach(function (pr) { inv[pr[0]] = 1; inv[pr[1]] = 1; if (!m.tickedAt(t, pr[0]) || m.tickedAt(t, pr[1]) || m.rungOf(pr[0]) !== k || m.rungOf(pr[1]) !== k) bad++; }); if (!inv[c.clash[0]] || !inv[c.clash[1]] || Object.keys(inv).length !== c.violators.length) bad++; });
    if (rt.ok !== (rt.bad.length === 0)) bad++;
  });
  var w = m.shapeWords(t); shapes[w.shape.id] = (shapes[w.shape.id] || 0) + 1;
  if (!w.name || !w.headline || !w.who || w.who.length < 40 || !w.singer || w.singer.length < 40) bad++;
  var v = m.verdict({ ticks: t }); if (!v.fate || !v.name || !v.part || !v.two || !v.singerLine || !v.line || v.line.used.length + v.line.spared.length !== 9) bad++;
  if (v.line.used.some(function (id) { return !m.tickedAt(t, id); }) || v.line.spared.some(function (id) { return m.tickedAt(t, id); })) bad++;
}
check('all 512 sets of choices get a pattern, a shape, a name, words for each of the four rules and a verdict with the line drawn; the per-experiment test matches a brute-force search for a cutoff in each experiment; every violating pair is (used, spared) on one menu', bad === 0, bad + ' problems');
check('patterns: refuse 1, all 1, the rest mixed', patterns.refuse === 1 && patterns.all === 1, JSON.stringify(patterns));
check('all five shapes occur', ['refuse', 'singer', 'line', 'species', 'own'].every(function (k) { return shapes[k] > 0; }), JSON.stringify(shapes));

// (3) robustness: with random marks that keep only the paper's orderings, no rule with a ranking explains the team's choices
function rnd(seed) { var x = seed >>> 0; return function () { x = (x * 1664525 + 1013904223) >>> 0; return x / 4294967296; }; }
var trials = 500, survived = 0, saved = C.CAST.map(function (b) { return { reason: b.reason, talk: b.talk, aware: b.aware }; });
for (var tr = 0; tr < trials; tr++) {
  var R = rnd(tr + 1), ok = true;
  ['reason', 'talk', 'aware'].forEach(function (rid) {
    var found = false;
    for (var tries = 0; tries < 20000 && !found; tries++) {
      C.CAST.forEach(function (b) { if (b.id !== 'stone') b[rid] = Math.floor(R() * 11); });
      found = C.PAPER_ORDERINGS.filter(function (o) { return o.ruler === rid; }).every(function (o) { return o.above.every(function (x) { return o.below.every(function (y) { var ra = m.castById(x)[rid], rb = m.castById(y)[rid]; return o.strict ? ra > rb : ra >= rb; }); }); });
    }
    if (!found) ok = false;
  });
  if (ok && m.rulesExplaining(team).length === 0) survived++;
  C.CAST.forEach(function (b, i) { b.reason = saved[i].reason; b.talk = saved[i].talk; b.aware = saved[i].aware; });
}
check('robustness: with random marks that keep only the paper\'s orderings, no rule with a ranking explains the team\'s choices', survived === trials, survived + ' of ' + trials);
check('cast restored', m.castById('chimp').aware === 8 && m.castById('mouse').aware === 3 && m.castById('infant').reason === 1);

// (5) stories
check('three rungs of rising stakes, three stories each, and a fixed cost', C.LEVELS.length === 3 && C.LEVELS.every(function (L) { return L.skins.length === 3 && L.skins.every(function (s) { return s.length > 60; }); }) && C.COST.length > 40);
check('stories draw reproducibly, and seed 0 gives the first of each rung', JSON.stringify(m.drawSkins(7)) === JSON.stringify(m.drawSkins(7)) && m.drawSkins(0).every(function (s, i) { return s === C.LEVELS[i].skins[0]; }) && (function () { var seen = {}; for (var k = 1; k < 60; k++) seen[m.drawSkins(k).join('|')] = 1; return Object.keys(seen).length > 5; })());

// (6)
out.push('\nShapes over 512 sets of choices:'); Object.keys(shapes).forEach(function (k) { out.push('  ' + k.padEnd(10) + shapes[k]); });
out.push('Sets of choices by how many rules with a ranking explain them:'); Object.keys(nRules).forEach(function (k) { out.push('  ' + k + ' rules: ' + nRules[k]); });
console.log(out.join('\n'));
console.log(fails ? '\n' + fails + ' CHECK(S) FAILED' : '\nall checks passed');
process.exit(fails ? 1 : 0);
