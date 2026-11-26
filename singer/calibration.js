// Calibration check for Draw a Line with Singer (revision 4). Run: node calibration.js. Exit code 1 on any failure.
// The mechanism is a TOY of an argument; the check verifies (1) that every ordering the 1974 paper states holds in the cast,
// (2) the paper's claim on this cast: the four-people set is a line on no ruler, and the everyone-who-feels set is a line on Suffer only,
// (3) that this rests on the paper's orderings, not our lengths: random casts keeping only the stated orderings behave the same,
// (4) that every one of the 1024 sets a player can make gets a shape, a name and words, and every reveal has words,
// (5) the experiment: every path ends and is judged, with the extra answer only when the baby is out, (6) a table of the shapes.
var m = require('./mechanism.js'), C = m.CONFIG, fails = 0, out = [];
function check(name, ok, detail) { out.push((ok ? 'ok   ' : 'FAIL ') + name + (detail ? ' — ' + detail : '')); if (!ok) fails++; }
var READ = ['reason', 'talk', 'aware'], H = m.humans(), F = m.feelers(), A = m.allIds();

// (1)
C.PAPER_ORDERINGS.forEach(function (o) {
  var ok = true;
  o.above.forEach(function (a) { o.below.forEach(function (b) { var ra = m.castById(a)[o.ruler], rb = m.castById(b)[o.ruler]; if (o.strict ? !(ra > rb) : !(ra >= rb)) ok = false; }); });
  check('ordering on ' + o.ruler + ': ' + o.above.join('/') + (o.strict ? ' > ' : ' >= ') + o.below.join('/'), ok, o.src);
});
check('Suffer reads the same for every being that can feel, and 0 for the stone', C.CAST.every(function (b) { return b.id === C.THING ? b.suffer === 0 : b.suffer === C.CAST[0].suffer; }));
check('four humans, five animals, one thing', H.length === 4 && F.length === 9 && A.length === 10);

// (2)
check('the four people are a line on no ruler', m.linesOn(H).length === 0, JSON.stringify(C.RULERS.map(function (r) { return m.testLine(H, r.id).clash; })));
check('everyone who feels is a line on Suffer and, in this cast, on no other ruler (the hurt grown-up reads none, like the stone: our length, not the paper\'s)', JSON.stringify(m.linesOn(F)) === '["suffer"]');
check('on each reading ruler the clash for the four people is a person in and an animal out', READ.every(function (r) { var t = m.testLine(H, r); return !t.line && m.castById(t.clash[0]).human && !m.castById(t.clash[1]).human; }));
check('on Suffer the clash for the four people is a tie', m.testLine(H, 'suffer').tie === true);
check('shape of the four people is species; of everyone who feels, singer; of all ten, everything; of nobody, nothing', m.shapeOf(H).id === 'species' && m.shapeOf(F).id === 'singer' && m.shapeOf(A).id === 'everything' && m.shapeOf([]).id === 'nothing');

// (3) robustness
function rnd(seed) { var x = seed >>> 0; return function () { x = (x * 1664525 + 1013904223) >>> 0; return x / 4294967296; }; }
var survived = 0, trials = 500, saved = C.CAST.map(function (b) { return { reason: b.reason, talk: b.talk, aware: b.aware }; });
for (var t = 0; t < trials; t++) {
  var R = rnd(t + 1), ok = true;
  READ.forEach(function (rid) {
    var found = false;
    for (var tries = 0; tries < 20000 && !found; tries++) {
      C.CAST.forEach(function (b) { if (b.id !== C.THING) b[rid] = Math.floor(R() * 11); });
      found = C.PAPER_ORDERINGS.filter(function (o) { return o.ruler === rid; }).every(function (o) { return o.above.every(function (a) { return o.below.every(function (bb) { var ra = m.castById(a)[rid], rb = m.castById(bb)[rid]; return o.strict ? ra > rb : ra >= rb; }); }); });
    }
    if (!found) ok = false;
  });
  if (ok && m.linesOn(H).length === 0 && m.linesOn(F).indexOf('suffer') >= 0) survived++;
  C.CAST.forEach(function (b, i) { b.reason = saved[i].reason; b.talk = saved[i].talk; b.aware = saved[i].aware; });
}
check('robustness: with random lengths that keep only the paper\'s orderings, the four people are a line on no ruler and everyone-who-feels is a line on Suffer', survived === trials, survived + ' of ' + trials);
check('cast restored after robustness runs', m.castById('chimp').aware === 8 && m.castById('disab').reason === 3 && m.castById('mouse').aware === 3);

// (4) every set
var shapes = {}, bad = 0, n = A.length;
for (var mask = 0; mask < (1 << n); mask++) {
  var set = A.filter(function (id, i) { return mask & (1 << i); });
  var w = m.shapeWords(set), s = w.shape;
  shapes[s.id] = (shapes[s.id] || 0) + 1;
  if (!w.name || !w.headline || !w.who || w.who.length < 40 || (s.id !== 'species' && (!w.singer || w.singer.length < 40))) bad++;
  C.RULERS.forEach(function (r) { if (!m.revealWords(set, r.id) || m.revealWords(set, r.id).length < 20) bad++; });
  var v = m.verdict({ lines: [set, set, set, set, set], path: { pick: 'chimp', why: 'human', braindam: null } }); if (!v.fate || v.found.length !== 6 || !v.part.length || v.synthesis.kind !== 'unmoved') bad++;
  s.lines.forEach(function (rid) { var rows = m.sortBy(rid); for (var i = 1; i < rows.length; i++) { var inA = set.indexOf(rows[i - 1].id) >= 0, inB = set.indexOf(rows[i].id) >= 0; if (!inA && inB) bad++; if (inA !== inB && rows[i - 1].r === rows[i].r) bad++; } });
}
check('all 1024 sets get a shape, a name, words, four reveals and a verdict (unmoved); every line is a true threshold', bad === 0, bad + ' problems');
// (4b) trajectories
var rl = [H, ['adult'], ['adult', 'disab'], ['adult', 'chimp'], F]; // the four people, then each ruler's own line
var synR = m.synthesis(rl);
check('a player who takes each ruler\'s line is ruler-led and ends on Singer\'s line', synR.kind === 'ruler-led' && synR.last.shape.id === 'singer', synR.text);
var synM = m.synthesis([H, H, H, H, F]);
check('a player moved only by Suffer is mixed, with three "did not move you" and one move', synM.kind === 'mixed' && synM.movedRounds === 1 && /Suffer moved you: you let in/.test(synM.text), synM.text);
var synU = m.synthesis([F, F, F, F, F]);
check('Singer\'s line kept five times is unmoved', synU.kind === 'unmoved' && /from the start/.test(synU.text));
var vM = m.verdict({ lines: [H, H, H, H, F], path: { pick: 'mouse', why: 'none', braindam: null } });
check('the verdict reads the last line (Singer\'s) and reports the trajectory', /Singer/.test(vM.fate) && vM.found.length === 6 && /Suffer moved you/.test(vM.found.join(' ')), vM.fate);
check('eight shapes occur', Object.keys(shapes).length === 8, JSON.stringify(shapes));
check('the grown-up alone is a Reason, Talk and Aware line', JSON.stringify(m.linesOn(['adult'])) === '["reason","talk","aware"]');
check('the four people plus the dog is species-with-favourites', m.shapeOf(H.concat(['dog'])).id === 'species-plus');
check('the four people minus the hurt grown-up is species-with-exceptions', m.shapeOf(['adult', 'infant', 'disab']).id === 'species-minus');
check('everyone but the baby and the stone is own, nearest Singer, with the baby dropped', (function () { var s = m.shapeOf(F.filter(function (x) { return x !== 'infant'; })); return s.id === 'own' && s.nearest === 'singer' && JSON.stringify(s.dropped) === '["infant"]'; })());

// (5) the experiment
var statuses = {}, paths = 0;
function walk(path, set) {
  var q = m.nextQuestion(path, set);
  if (!q) { var j = m.judgeExperiment(path, set); statuses[j.status] = (statuses[j.status] || 0) + 1; paths++; if (!j.said || !j.paper || j.paper.length < 40) check('path ' + JSON.stringify(path) + ' has words', false); return; }
  (q.id === 'pick' ? C.EXPERIMENT.subjects.concat(['nobody']).map(function (s) { return { id: s }; }) : q.options).forEach(function (o) { var p = {}; for (var k in path) p[k] = path[k]; p[q.id] = o.id; walk(p, set); });
}
walk({ pick: null, why: null, braindam: null }, H); var p1 = paths;
walk({ pick: null, why: null, braindam: null }, ['adult']); var p2 = paths - p1;
check('the experiment ends on every path (' + p1 + ' with the baby in, ' + p2 + ' with the baby out)', p1 === 13 && p2 === 15);
check('"the baby is out on my line too" is offered only when the baby is out', m.whyOptions(H).length === 4 && m.whyOptions(['adult']).length === 5 && m.whyOptions(['adult'])[0].id === 'out');
check('every status is reachable', ['species', 'potential', 'read', 'refuse'].every(function (s) { return statuses[s] > 0; }), JSON.stringify(statuses));

// (6) table
out.push('\nShapes (how many of the 1024 sets fall in each):');
Object.keys(shapes).forEach(function (k) { out.push('  ' + k.padEnd(14) + shapes[k]); });
out.push('Named sets:');
[['the four people', H], ['everyone who feels', F], ['the grown-up alone', ['adult']], ['the four people + dog', H.concat(['dog'])], ['the four people - hurt grown-up', ['adult', 'infant', 'disab']], ['grown-up + chimpanzee', ['adult', 'chimp']], ['animals only', ['chimp', 'dog', 'pig', 'horse', 'mouse']]].forEach(function (h) {
  var w = m.shapeWords(h[1]); out.push('  ' + h[0].padEnd(34) + ' -> ' + w.name.padEnd(26) + ' lines: ' + (w.shape.lines.join(',') || 'none'));
});
console.log(out.join('\n'));
console.log(fails ? '\n' + fails + ' CHECK(S) FAILED' : '\nall checks passed');
process.exit(fails ? 1 : 0);
