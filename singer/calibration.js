// Calibration check for Singer's Chalk Line. Run: node calibration.js. Exit code 1 on any failure.
// The mechanism is a TOY of an argument; the check verifies (1) that every ordering the paper states holds in the cast,
// (2) that the paper's claim holds on this cast: on every ruler you can read, every legal line has a misfit, and Species has none,
// (3) that the claim rests on the paper's orderings and not on our lengths: random casts that keep only the stated orderings all fail the same way,
// (4) the scenes return the paper's answers, (5) the heuristics table of build.md section 3.
var m = require('./mechanism.js'), C = m.CONFIG, fails = 0, out = [];
function check(name, ok, detail) { out.push((ok ? 'ok   ' : 'FAIL ') + name + (detail ? ' — ' + detail : '')); if (!ok) fails++; }

// (1) the paper's stated orderings
C.PAPER_ORDERINGS.forEach(function (o) {
  var ok = true;
  o.above.forEach(function (a) { o.below.forEach(function (b) { var ra = m.castById(a)[o.ruler], rb = m.castById(b)[o.ruler]; if (o.strict ? !(ra > rb) : !(ra >= rb)) ok = false; }); });
  check('ordering on ' + o.ruler + ': ' + o.above.join('/') + (o.strict ? ' > ' : ' >= ') + o.below.join('/'), ok, o.src);
});
check('Pain reads the same for every being that can feel, and 0 for the oak', C.CAST.every(function (b) { return b.id === 'oak' ? b.pain === 0 : b.pain === C.CAST[0].pain; }));
check('five humans, five animals, one thing', C.CAST.filter(function (b) { return b.human; }).length === 5 && C.CAST.filter(function (b) { return !b.human && b.id !== 'oak'; }).length === 5);

// (2) the claim on this cast
C.RULERS.forEach(function (r) {
  var cuts = m.legalCuts(r.id).map(function (k) { return m.cut(r.id, k); });
  check('every legal line on ' + r.label + ' has a misfit (' + cuts.length + ' legal lines, fewest misfits ' + m.bestCut(r.id).misfits + ')', m.rulerFails(r.id));
  check(r.label + ': the line with fewest misfits is unique or tied, and never 0', cuts.every(function (c) { return c.misfits > 0; }));
});
check('Species: exactly one legal line has no misfit', m.legalCuts('species').filter(function (k) { return m.cut('species', k).misfits === 0; }).length === 1);
check('Pain: the only legal lines are above the lot, under everyone who can feel, and under the lot', JSON.stringify(m.legalCuts('pain')) === JSON.stringify([0, 10, 11]));
// each reading ruler finds something different: the set of people the best line leaves out differs across rulers
var bestOuts = C.RULERS.filter(function (r) { return r.id !== 'pain'; }).map(function (r) { return m.bestCut(r.id).humansOut.slice().sort().join(','); });
check('the three reading rulers cost different people at their best line', new Set(bestOuts).size === 3, bestOuts.join(' | '));

// (3) robustness: random casts that keep only the paper's stated orderings (and Pain the same for all that feel)
function rnd(seed) { var x = seed >>> 0; return function () { x = (x * 1664525 + 1013904223) >>> 0; return x / 4294967296; }; }
var survived = 0, trials = 500;
for (var t = 0; t < trials; t++) {
  var R = rnd(t + 1), saved = C.CAST.map(function (b) { return { reason: b.reason, plans: b.plans, ties: b.ties }; });
  var ok = true;
  for (var tries = 0; tries < 20000; tries++) { // draw readings 0..10 until every stated ordering holds
    C.CAST.forEach(function (b) { if (b.id !== 'oak') { b.reason = Math.floor(R() * 11); b.plans = Math.floor(R() * 11); b.ties = Math.floor(R() * 11); } });
    var holds = C.PAPER_ORDERINGS.every(function (o) { return o.above.every(function (a) { return o.below.every(function (bb) { var ra = m.castById(a)[o.ruler], rb = m.castById(bb)[o.ruler]; return o.strict ? ra > rb : ra >= rb; }); }); });
    if (holds) break;
    if (tries === 19999) ok = false;
  }
  if (ok && ['reason', 'plans', 'ties', 'pain'].every(function (r) { return m.rulerFails(r); }) && m.bestCut('species').misfits === 0) survived++;
  C.CAST.forEach(function (b, i) { b.reason = saved[i].reason; b.plans = saved[i].plans; b.ties = saved[i].ties; });
}
check('robustness: with random lengths that keep only the paper\'s orderings, every reading ruler still fails and Species still works', survived === trials, survived + ' of ' + trials + ' random casts');
check('cast restored after robustness runs', m.castById('chimp').plans === 7 && m.castById('disab').reason === 4 && m.castById('disab').plans === 8);

// (4) the scenes
var expect = { slap: 'pig', ward: 'either', fire: 'adult', fire2: 'chimp' };
C.SCENES.forEach(function (s) {
  check('scene ' + s.id + ': the paper\'s answer is ' + expect[s.id], s.paper === expect[s.id]);
  if (s.scale === 'pain') { var pa = s.painNow[s.a], pb = s.painNow[s.b]; check('scene ' + s.id + ': the answer goes by pain now (' + pa + ' vs ' + pb + ')', s.paper === 'either' ? pa === pb : s.painNow[s.paper] === Math.max(pa, pb)); }
  else { var qa = m.castById(s.a).plans, qb = m.castById(s.b).plans; check('scene ' + s.id + ': the answer goes by Plans (' + qa + ' vs ' + qb + ')', m.castById(s.paper).plans === Math.max(qa, qb) && qa !== qb); }
  [s.a, s.b].forEach(function (p) { var j = m.judge(s.id, p); check('scene ' + s.id + ' pick ' + p + ' judged ' + j.status, s.paper === 'either' ? j.status === 'either' : (p === s.paper ? j.status === 'agree' : j.status === 'part')); });
});
check('the species chooser parts from the paper on slap and fire2; the plans-for-everything chooser parts on slap alone; pain-by-amount-then-plans parts nowhere', (function () {
  var sp = C.SCENES.filter(function (s) { return m.judge(s.id, m.castById(s.a).human ? s.a : s.b).status === 'part'; }).map(function (s) { return s.id; }).join(',');
  var pl = C.SCENES.filter(function (s) { var pick = m.castById(s.a).plans >= m.castById(s.b).plans ? s.a : s.b; return m.judge(s.id, pick).status === 'part'; }).map(function (s) { return s.id; }).join(',');
  var ok = C.SCENES.filter(function (s) { var pick = s.scale === 'pain' ? (s.painNow[s.a] >= s.painNow[s.b] ? s.a : s.b) : (m.castById(s.a).plans >= m.castById(s.b).plans ? s.a : s.b); return m.judge(s.id, pick).status === 'part'; }).length;
  return sp === 'slap,fire2' && pl === 'slap' && ok === 0; })());

// (5) heuristics table (build.md section 3): board one lines, board two choosers
out.push('');
out.push('Heuristics, board one (misfits = people out + animals in + the oak in):');
var H = {
  'keep every person (lowest line that leaves no person out)': function (r) { var ks = m.legalCuts(r).filter(function (k) { return m.cut(r, k).humansOut.length === 0; }); return m.cut(r, Math.min.apply(null, ks)); },
  'keep every animal out (highest line that lets no animal in)': function (r) { var ks = m.legalCuts(r).filter(function (k) { return m.cut(r, k).animalsIn.length === 0; }); return m.cut(r, Math.max.apply(null, ks)); },
  'fewest misfits': function (r) { return m.bestCut(r); },
  'under the adult only': function (r) { return m.cut(r, 1); }
};
['reason', 'plans', 'ties', 'pain', 'species'].forEach(function (r) {
  var line = '  ' + m.rulerById(r).label.padEnd(10);
  Object.keys(H).forEach(function (h) { var c = H[h](r); line += ' | ' + h.split(' (')[0] + ': ' + c.misfits + (c.legal ? '' : ' (illegal)'); });
  out.push(line);
});
out.push('Heuristics, board two (parts from the paper on which scenes):');
var CH = {
  'always the human': function (s) { return m.castById(s.a).human ? s.a : s.b; },
  'by pain now, then by plans': function (s) { if (s.scale === 'pain') return s.painNow[s.a] >= s.painNow[s.b] ? s.a : s.b; return m.castById(s.a).plans >= m.castById(s.b).plans ? s.a : s.b; },
  'always by plans': function (s) { return m.castById(s.a).plans >= m.castById(s.b).plans ? s.a : s.b; },
  'always the animal': function (s) { return m.castById(s.a).human ? s.b : s.a; },
  'the paper': function (s) { return s.paper === 'either' ? s.a : s.paper; }
};
Object.keys(CH).forEach(function (h) {
  var parts = C.SCENES.filter(function (s) { return m.judge(s.id, CH[h](s)).status === 'part'; }).map(function (s) { return s.id; });
  out.push('  ' + h.padEnd(28) + ' parts on: ' + (parts.length ? parts.join(', ') : 'none'));
});
// every option in every scene is taken by some heuristic (no dead option)
var dead = [];
C.SCENES.forEach(function (s) { [s.a, s.b].forEach(function (p) { if (!Object.keys(CH).some(function (h) { return CH[h](s) === p; })) dead.push(s.id + ':' + p); }); });
check('no dead option on board two: every being in every scene is picked by some way of playing', dead.length === 0, dead.join(' '));

out.push('');
out.push(fails ? fails + ' FAILED' : 'all checks passed');
console.log(out.join('\n'));
process.exit(fails ? 1 : 0);
