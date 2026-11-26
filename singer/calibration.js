// Calibration check for Draw a Line with Singer (revision 2). Run: node calibration.js. Exit code 1 on any failure.
// The mechanism is a TOY of an argument; the check verifies (1) that every ordering the 1974 paper states holds in the cast,
// (2) that the paper's claim holds on this cast: on every ruler, no line is both the ruler's own (not between equal marks) and clean; the species line is clean but by hand,
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
  var own = m.rulerCuts(r.id);
  check('no line on ' + r.label + ' is both the ruler\'s own and clean (' + own.length + ' lines the ruler draws, fewest on the wrong side ' + m.bestCut(r.id).misfits + ')', m.rulerFails(r.id));
});
var n = C.CAST.length;
check('the species line (under the ' + m.humansCount() + ' people, no ruler) is clean but by hand', (function () { var c = m.cut('hand', m.humansCount()); return c.misfits === 0 && c.byHand; })());
check('Suffer: the only lines the ruler itself draws are above the lot, under everyone who can feel, and under the lot', JSON.stringify(m.rulerCuts('suffer').map(function (c) { return c.k; })) === JSON.stringify([0, n - 1, n]));
check('Suffer: the line under the four people is by hand, between two equal marks', (function () { var c = m.cut('suffer', m.humansCount()); return c.byHand && c.misfits === 0 && !c.clean; })());
check('every cut on every ruler is allowed and judged with words', C.RULERS.concat([{ id: 'hand' }]).every(function (r) { return m.allCuts(r.id).every(function (c) { return typeof m.cutWords(c) === 'string' && m.cutWords(c).length > 10 && m.headline(c).length > 5; }); }));
check('the hand round has words for every line', [0, 1, 4, 5, 9, 10].every(function (k) { var h = m.handWords(m.cut('hand', k)); return h.text.length > 20 && (k === 4) === h.species; }));

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
  if (ok && C.RULERS.every(function (r) { return m.rulerFails(r.id); }) && m.cut('hand', m.humansCount()).misfits === 0) survived++;
  C.CAST.forEach(function (b, i) { b.reason = saved[i].reason; b.talk = saved[i].talk; b.aware = saved[i].aware; });
}
check('robustness: with random lengths that keep only the paper\'s orderings, no ruler draws a clean line of its own', survived === trials, survived + ' of ' + trials + ' random casts');
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
walk({ pick: null, why: null, braindam: null });
check('the experiment has a finite set of paths (' + paths + ')', paths > 0 && paths < 40);
check('every status is reachable: species, potential, read, refuse', ['species', 'potential', 'read', 'refuse'].every(function (s) { return statuses[s] > 0; }), JSON.stringify(statuses));
check('an animal kept over the baby because it is one of us is judged species', m.judgeExperiment({ pick: 'chimp', why: 'human', braindam: null }).status === 'species');
check('"matters less" is judged species, with the first board as the answer', (function () { var j = m.judgeExperiment({ pick: 'mouse', why: 'less', braindam: null }); return j.status === 'species' && /first board/.test(j.paper); })());
check('"either would have done" is judged read', m.judgeExperiment({ pick: 'mouse', why: 'none', braindam: null }).status === 'read');
check('every animal the paper names is above or level with the baby on every ruler', ['chimp', 'mouse'].every(function (id) { return READ.concat(['suffer']).every(function (r) { return m.castById(id)[r] >= m.castById('infant')[r]; }); }));

// (6) heuristics table, board one (wrong side = people out + animals in + the stone in; "hand" = the line runs between equal marks)
out.push('\nHeuristics, board one:');
C.RULERS.forEach(function (r) {
  var rows = m.sortBy(r.id);
  function w(k) { var c = m.cut(r.id, k); return c.misfits + (c.byHand ? ' (hand)' : ''); }
  var lastHumanIn = 0; rows.forEach(function (x, j) { if (x.human) lastHumanIn = j + 1; });
  var firstAnimal = rows.length; rows.forEach(function (x, j) { if (!x.human && j < firstAnimal) firstAnimal = j; });
  out.push('  ' + r.label.padEnd(8) + ' | keep every person: ' + w(lastHumanIn) + ' | keep every animal out: ' + w(firstAnimal) + ' | under the grown-up only: ' + w(1) + ' | under the four people: ' + w(m.humansCount()) + ' | fewest, ruler\'s own line: ' + m.bestCut(r.id).misfits);
});
out.push('Heuristics, board two (how each way of playing is judged):');
[['one of us (chimp)', { pick: 'chimp', why: 'human', braindam: null }],
 ['matters less (mouse)', { pick: 'mouse', why: 'less', braindam: null }],
 ['will grow, yes to the hurt grown-up (chimp)', { pick: 'chimp', why: 'grow', braindam: 'yes' }],
 ['will grow, no to the hurt grown-up (chimp)', { pick: 'chimp', why: 'grow', braindam: 'no' }],
 ['either would have done (mouse)', { pick: 'mouse', why: 'none', braindam: null }],
 ['the baby', { pick: 'infant', why: null, braindam: null }],
 ['nobody', { pick: 'nobody', why: null, braindam: null }]].forEach(function (h) { out.push('  ' + h[0].padEnd(48) + ' -> ' + m.judgeExperiment(h[1]).status); });

console.log(out.join('\n'));
console.log(fails ? '\n' + fails + ' CHECK(S) FAILED' : '\nall checks passed');
process.exit(fails ? 1 : 0);
