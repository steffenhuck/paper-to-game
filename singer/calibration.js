// Calibration check for Draw a Line with Singer. Run: node calibration.js. Exit code 1 on any failure.
// The mechanism is a TOY of an argument; the check verifies (1) that every ordering the 1974 paper states holds in the cast,
// (2) that the paper's claim holds on this cast: on every ruler you can read, every legal line has a misfit, and Species has none,
// (3) that the claim rests on the paper's orderings and not on our lengths: random casts that keep only the stated orderings all fail the same way,
// (4) that each ruler finds something of its own, (5) the experiment: every path ends, every subject is reachable, each status is reachable,
// (6) the heuristics table of build.md section 3.
var m = require('./mechanism.js'), C = m.CONFIG, fails = 0, out = [];
function check(name, ok, detail) { out.push((ok ? 'ok   ' : 'FAIL ') + name + (detail ? ' — ' + detail : '')); if (!ok) fails++; }
var READ = C.RULERS.map(function (r) { return r.id; }).filter(function (id) { return id !== 'suffer'; });

// (1) the paper's stated orderings
C.PAPER_ORDERINGS.forEach(function (o) {
  var ok = true;
  o.above.forEach(function (a) { o.below.forEach(function (b) { var ra = m.castById(a)[o.ruler], rb = m.castById(b)[o.ruler]; if (o.strict ? !(ra > rb) : !(ra >= rb)) ok = false; }); });
  check('ordering on ' + o.ruler + ': ' + o.above.join('/') + (o.strict ? ' > ' : ' >= ') + o.below.join('/'), ok, o.src);
});
check('Suffer reads the same for every being that can feel, and 0 for the stone', C.CAST.every(function (b) { return b.id === C.THING ? b.suffer === 0 : b.suffer === C.CAST[0].suffer; }));
check('four humans, five animals, one thing', m.humansCount() === 4 && C.CAST.filter(function (b) { return !b.human && b.id !== C.THING; }).length === 5);

// (2) the claim on this cast
C.RULERS.forEach(function (r) {
  var cuts = m.legalCuts(r.id).map(function (k) { return m.cut(r.id, k); });
  check('every legal line on ' + r.label + ' has a misfit (' + cuts.length + ' legal lines, fewest misfits ' + m.bestCut(r.id).misfits + ')', m.rulerFails(r.id));
});
check('Species: exactly one legal line has no misfit', m.legalCuts('species').filter(function (k) { return m.cut('species', k).misfits === 0; }).length === 1);
var n = C.CAST.length;
check('Suffer: the only legal lines are above the lot, under everyone who can suffer, and under the lot', JSON.stringify(m.legalCuts('suffer')) === JSON.stringify([0, n - 1, n]));

// (3) robustness: random casts that keep only the paper's stated orderings (and Suffer the same for all that feel)
function rnd(seed) { var x = seed >>> 0; return function () { x = (x * 1664525 + 1013904223) >>> 0; return x / 4294967296; }; }
var survived = 0, trials = 500, saved = C.CAST.map(function (b) { return { reason: b.reason, talk: b.talk, aware: b.aware }; });
for (var t = 0; t < trials; t++) {
  var R = rnd(t + 1), ok = true;
  READ.forEach(function (rid) { // per ruler: draw readings 0..10 until every ordering the paper states on that ruler holds
    var found = false;
    for (var tries = 0; tries < 20000 && !found; tries++) {
      C.CAST.forEach(function (b) { if (b.id !== C.THING) b[rid] = Math.floor(R() * 11); });
      found = C.PAPER_ORDERINGS.filter(function (o) { return o.ruler === rid; }).every(function (o) { return o.above.every(function (a) { return o.below.every(function (bb) { var ra = m.castById(a)[rid], rb = m.castById(bb)[rid]; return o.strict ? ra > rb : ra >= rb; }); }); });
    }
    if (!found) ok = false;
  });
  if (ok && C.RULERS.every(function (r) { return m.rulerFails(r.id); }) && m.bestCut('species').misfits === 0) survived++;
  C.CAST.forEach(function (b, i) { b.reason = saved[i].reason; b.talk = saved[i].talk; b.aware = saved[i].aware; });
}
check('robustness: with random lengths that keep only the paper\'s orderings, every reading ruler still fails and Species still works', survived === trials, survived + ' of ' + trials + ' random casts');
check('cast restored after robustness runs', m.castById('chimp').aware === 8 && m.castById('disab').reason === 3 && m.castById('mouse').aware === 3);

// (4) each ruler finds something of its own: no two rulers sort the cast the same way, and no two say the same thing after the line
var orders = C.RULERS.map(function (r) { return m.sortBy(r.id).map(function (x) { return x.id; }).join('>'); });
check('no two rulers sort the cast the same way', new Set(orders).size === C.RULERS.length);
var finds = C.RULERS.map(function (r) { return m.rulerFind(r.id); });
check('no two rulers say the same thing after the line', new Set(finds).size === C.RULERS.length);
check('on Reason the chimpanzee is second', m.sortBy('reason')[1].id === 'chimp');
check('on Reason the dog and the adult with a severe intellectual disability read the same (the paper on Benn)', m.castById('dog').reason === m.castById('disab').reason);
check('on Aware the mouse stands above the infant (p. 110)', m.castById('mouse').aware > m.castById('infant').aware);
check('on Talk only two of them read above the animals\' best', m.sortBy('talk').filter(function (x) { return x.human && x.r > m.castById('chimp').talk; }).length === 2);

// (5) the experiment: every path terminates and is judged; every subject can be used; every status is reachable
var statuses = {}, paths = 0;
function walk(path) {
  var q = m.nextQuestion(path);
  if (!q) { var j = m.judgeExperiment(path); statuses[j.status] = (statuses[j.status] || 0) + 1; paths++; check('path ' + JSON.stringify(path) + ' judged ' + j.status + ' with words', !!j.said && !!j.paper && j.paper.length > 40); return; }
  (q.id === 'pick' ? C.EXPERIMENT.subjects.concat(['nobody']).map(function (s) { return { id: s }; }) : q.options).forEach(function (o) {
    var p = {}; for (var k in path) p[k] = path[k]; p[q.id] = o.id; walk(p);
  });
}
walk({ pick: null, infant: null, why: null, braindam: null });
check('the experiment has a finite set of paths (' + paths + ')', paths > 0 && paths < 40);
check('every status is reachable: species, potential, read, refuse', ['species', 'potential', 'read', 'refuse'].every(function (s) { return statuses[s] > 0; }), JSON.stringify(statuses));
check('a subject chosen by species alone is judged species', m.judgeExperiment({ pick: 'chimp', infant: 'no', why: 'human', braindam: null }).status === 'species');
check('an animal chosen with the infant also usable is judged read', m.judgeExperiment({ pick: 'mouse', infant: 'yes', why: null, braindam: null }).status === 'read');
check('every subject the paper names is above or level with the infant on every ruler but Suffer, for the animals', ['chimp', 'mouse'].every(function (id) { return READ.every(function (r) { return m.castById(id)[r] >= m.castById('infant')[r]; }); }));

// (6) heuristics table, board one (misfits = people out + animals in + the stone in)
out.push('\nHeuristics, board one (misfits = people out + animals in + the stone in):');
C.RULERS.concat([C.SPECIES]).forEach(function (r) {
  var rows = m.sortBy(r.id), legal = m.legalCuts(r.id);
  function mis(k) { return legal.indexOf(k) >= 0 ? m.cut(r.id, k).misfits : m.cut(r.id, k).misfits + ' (illegal)'; }
  var lastHumanIn = 0; rows.forEach(function (x, j) { if (x.human) lastHumanIn = j + 1; }); // keep every person: line under the lowest person
  var firstAnimal = rows.length; rows.forEach(function (x, j) { if (!x.human && j < firstAnimal) firstAnimal = j; }); // keep every animal out: line above the highest animal
  out.push('  ' + r.label.padEnd(8) + ' | keep every person: ' + mis(lastHumanIn) + ' | keep every animal out: ' + mis(firstAnimal) + ' | fewest misfits: ' + m.bestCut(r.id).misfits + ' | under the adult only: ' + mis(1));
});
out.push('Heuristics, board two (how each way of playing is judged):');
[['the species chooser (chimp; not the infant; one of us)', { pick: 'chimp', infant: 'no', why: 'human', braindam: null }],
 ['the potential chooser (chimp; not the infant; it will grow; yes to the brain-damaged adult)', { pick: 'chimp', infant: 'no', why: 'grow', braindam: 'yes' }],
 ['the half-potential chooser (chimp; it will grow; no to the brain-damaged adult)', { pick: 'chimp', infant: 'no', why: 'grow', braindam: 'no' }],
 ['the reader (mouse; yes to the infant)', { pick: 'mouse', infant: 'yes', why: null, braindam: null }],
 ['the reader (the infant)', { pick: 'infant', infant: null, why: null, braindam: null }],
 ['the abolitionist (nobody)', { pick: 'nobody', infant: null, why: null, braindam: null }]].forEach(function (h) { out.push('  ' + h[0].padEnd(78) + ' -> ' + m.judgeExperiment(h[1]).status); });

console.log(out.join('\n'));
console.log(fails ? '\n' + fails + ' CHECK(S) FAILED' : '\nall checks passed');
process.exit(fails ? 1 : 0);
