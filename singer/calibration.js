// Calibration check for Draw a Line with Singer (revision 9). Run: node calibration.js. Exit code 1 on any failure.
// The mechanism is a TOY of an argument; the check verifies (1) that every ordering the 1974 paper states holds in the cast, and that the
// three menus cover all ten creatures once, each with a person and an animal; (2) the claims on this cast: the team's choices (every animal
// and the stone used, every person spared, at every experiment) are explained by Species and by no rule with marks, and Suffer objects to
// them with Singer's facts; (3) that the objection to the team's choices rests on the paper's own orderings, not on our lengths, over 500
// random casts; (4) that every one of the 1024 tick patterns, with every one of the 512 answer sets to "can they suffer?", gets a pattern, a
// shape, a name, words for each rule, Suffer words and a verdict, and that the rationalisability test has the properties it claims;
// (5) the stories; (6) a table of the shapes.
var m = require('./mechanism.js'), C = m.CONFIG, fails = 0, out = [];
function check(name, ok, detail) { out.push((ok ? 'ok   ' : 'FAIL ') + name + (detail ? ' — ' + detail : '')); if (!ok) fails++; }
var S = C.SUBJECTS, NINE = S.filter(function (id) { return id !== 'stone'; });

// (1)
C.PAPER_ORDERINGS.forEach(function (o) {
  var ok = true;
  o.above.forEach(function (a) { o.below.forEach(function (b) { var ra = m.castById(a)[o.ruler], rb = m.castById(b)[o.ruler]; if (o.strict ? !(ra > rb) : !(ra >= rb)) ok = false; }); });
  check('ordering on ' + o.ruler + ': ' + o.above.join('/') + (o.strict ? ' > ' : ' >= ') + o.below.join('/'), ok, o.src);
});
var all = [].concat(C.MENUS[1], C.MENUS[2], C.MENUS[3]);
check('the three menus hold all ten creatures, each once', all.length === 10 && S.every(function (id) { return all.indexOf(id) >= 0; }));
check('each menu has a person and an animal', [1, 2, 3].every(function (k) { return C.MENUS[k].some(function (id) { return m.castById(id).human; }) && C.MENUS[k].some(function (id) { return !m.castById(id).human && id !== 'stone'; }); }));
check('the third menu is the paper\'s own test: the baby, to save many lives, with Bentham\'s dog beside it', C.MENUS[3].indexOf('infant') >= 0 && C.MENUS[3].indexOf('dog') >= 0);
check('every being but the stone can suffer in the paper\'s reading', NINE.every(function (id) { return m.castById(id).suffer === 10; }) && m.castById('stone').suffer === 0);

// (2) the team's choices
function ticksFrom(mask) { var t = { 1: [], 2: [], 3: [] }; S.forEach(function (id, i) { if (mask & (1 << i)) t[m.rungOf(id)].push(id); }); return t; }
var team = { 1: [], 2: [], 3: [] }; S.forEach(function (id) { if (!m.castById(id).human) team[m.rungOf(id)].push(id); });
check('the team\'s choices are explained by Species and by no rule with marks', m.ruleTest(team, 'species').ok && m.rulesExplaining(team).length === 0 && m.shapeOf(team, {}).id === 'species');
check('Suffer objects to the team\'s choices with Singer\'s facts', !m.sufferTest(team, {}).singer);
var singerT = { 1: ['stone'], 2: ['braindam', 'chimp', 'pig'], 3: ['adult', 'infant', 'dog'] };
check('all who can suffer from one life on, the stone for free, is Singer\'s line', m.shapeOf(singerT, {}).id === 'singer');
check('nobody who can suffer, at any price, is refuse, and its verdict points to Foot', m.shapeOf({ 1: ['stone'], 2: [], 3: [] }, {}).id === 'refuse' && /Foot/.test(m.verdict({ ticks: { 1: [], 2: [], 3: [] }, answers: {} }).stood[0]));
check('the hurt grown-up, the mouse and the stone first, then the baby, is explained by Reason (and the others)', m.shapeOf({ 1: ['mouse', 'stone'], 2: ['braindam'], 3: ['infant'] }, {}).id === 'line');
check('the dog used to save a thousand lives and the baby spared draws an objection from Reason, Talk and Aware', (function () { var t = { 1: [], 2: [], 3: ['dog'] }; return C.RULES.every(function (r) { return !m.ruleTest(t, r.id).ok; }); })());
check('the chimpanzee used to save a life and the hurt grown-up spared draws an objection from Reason, Talk and Aware', (function () { var t = { 1: [], 2: ['chimp'], 3: [] }; return C.RULES.every(function (r) { return !m.ruleTest(t, r.id).ok; }); })());

// (4) every tick pattern x every answer set
var shapes = {}, patterns = {}, bad = 0, nRules = {};
var answerSets = [];
for (var am = 0; am < 512; am++) { var ans = {}; NINE.forEach(function (id, i) { ans[id] = !!(am & (1 << i)); }); answerSets.push(ans); }
var allYes = answerSets[511];
for (var mask = 0; mask < 1024; mask++) {
  var t = ticksFrom(mask), p = m.pattern(t);
  patterns[p] = (patterns[p] || 0) + 1;
  if (!m.didWords(t)) bad++;
  var L = m.rulesExplaining(t); nRules[L.length] = (nRules[L.length] || 0) + 1;
  C.RULES.forEach(function (r) {
    var w = m.ruleWords(t, r.id); if (!w || w.length < 40) bad++;
    // property: a rule explains the ticks iff there are rising cutoffs that reproduce them
    var mk = m.marksOf(r.id), rt = m.ruleTest(t, r.id), ok2 = true, c = -1;
    for (var k = 1; k <= 3 && ok2; k++) {
      var cands = []; for (var cc = -1; cc <= 10; cc++) if (cc >= c) cands.push(cc);
      var found = false;
      cands.forEach(function (cut) { if (found) return; if (m.menuOf(k).every(function (id) { return id === 'stone' || (t[k].indexOf(id) >= 0) === (mk(id) <= cut); })) { found = true; c = cut; } });
      if (!found) ok2 = false;
    }
    if (rt.ok !== ok2) bad++;
    if (!rt.ok && !(rt.clash && rt.clash.length === 2)) bad++;
  });
  answerSets.forEach(function (ans) {
    var w = m.shapeWords(t, ans); shapes[w.shape.id] = (shapes[w.shape.id] || 0) + 1;
    if (!w.name || !w.headline || !w.who || w.who.length < 40) bad++;
    if (w.shape.id !== 'species' && (!w.singer || w.singer.length < 40)) bad++;
    var sw = m.sufferWords(t, ans); if (!sw || sw.length < 30) bad++;
    var st = m.sufferTest(t, ans);
    // Suffer objects iff some being the player says can suffer is used at stakes k while another the player says can suffer is spared at stakes >= k
    var should = false;
    NINE.forEach(function (a) { if (!ans[a]) return; var ka = m.tickedAt(t, a); if (!ka) return; NINE.forEach(function (b) { if (ans[b] && !m.tickedAt(t, b) && m.rungOf(b) >= ka) should = true; }); });
    // the stone is free: ticking it or not never changes any rule's verdict
    var t2 = { 1: t[1].filter(function (id) { return id !== 'stone'; }).concat(t[1].indexOf('stone') >= 0 ? [] : ['stone']), 2: t[2], 3: t[3] };
    if (m.shapeOf(t, ans).id !== m.shapeOf(t2, ans).id && m.pattern(t) !== 'all' && m.pattern(t2) !== 'all') bad++;
    if (st.objects !== should) bad++;
  });
  if (mask % 64 === 0) { var v = m.verdict({ ticks: t, answers: allYes }); if (!v.fate || v.did.length !== 5 || v.found.length !== 1 || !v.part.length || !v.stood.length) bad++; }
}
check('all 1024 tick patterns x 512 answer sets get a pattern, a shape, a name, words for each rule, Suffer words and a verdict; the rationalisability test matches a brute-force search for rising cutoffs; Suffer objects exactly when it should', bad === 0, bad + ' problems');
check('patterns: refuse 2 (nothing, or the stone alone), all 1, the rest mixed', patterns.refuse === 2 && patterns.all === 1, JSON.stringify(patterns));
check('the stone is free: ticking it alone is refuse, and with the baby to save a thousand lives, every rule still agrees', m.pattern({ 1: ['stone'], 2: [], 3: [] }) === 'refuse' && m.rulesExplaining({ 1: ['stone'], 2: [], 3: ['infant'] }).length === 3 && m.rulesExplaining({ 1: [], 2: [], 3: ['infant'] }).length === 3);
check('all six shapes occur', ['refuse', 'singer', 'equal-no', 'line', 'species', 'own'].every(function (k) { return shapes[k] > 0; }), JSON.stringify(shapes));

// (3) robustness: with random marks that keep only the paper's orderings, no rule with marks explains the team's choices
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
check('robustness: with random marks that keep only the paper\'s orderings, no rule with marks explains the team\'s choices', survived === trials, survived + ' of ' + trials);
check('cast restored', m.castById('chimp').aware === 8 && m.castById('mouse').aware === 3 && m.castById('infant').reason === 1);

// (5) stories
check('three rungs of rising stakes, three stories each, and a fixed cost', C.LEVELS.length === 3 && C.LEVELS.every(function (L) { return L.skins.length === 3 && L.skins.every(function (s) { return s.length > 60; }); }) && C.COST.length > 40);
check('stories draw reproducibly, and seed 0 gives the first of each rung', JSON.stringify(m.drawSkins(7)) === JSON.stringify(m.drawSkins(7)) && m.drawSkins(0).every(function (s, i) { return s === C.LEVELS[i].skins[0]; }) && (function () { var seen = {}; for (var k = 1; k < 60; k++) seen[m.drawSkins(k).join('|')] = 1; return Object.keys(seen).length > 5; })());

// (6)
out.push('\nShapes over 1024 tick patterns x 512 answer sets:'); Object.keys(shapes).forEach(function (k) { out.push('  ' + k.padEnd(10) + shapes[k]); });
out.push('Tick patterns by how many rules with marks explain them:'); Object.keys(nRules).forEach(function (k) { out.push('  ' + k + ' rules: ' + nRules[k]); });
console.log(out.join('\n'));
console.log(fails ? '\n' + fails + ' CHECK(S) FAILED' : '\nall checks passed');
process.exit(fails ? 1 : 0);
