// Calibration check for Zoom Out with Nagel (build.md §2-3). The mechanism is a toy of an argument with no numbers in
// it, so the check tests the properties the paper states (direction only), the rules the screen states, the strategy
// table, the robustness of the best stop to every fraction we chose, and the words. Run: node calibration.js
var M = require('./mechanism.js'); var C = M.CONFIG;
var n = 0, fails = 0;
function check(name, ok, detail) { n++; if (!ok) fails++; console.log((ok ? 'ok   ' : 'FAIL ') + name + (detail ? '  [' + detail + ']' : '')); }
var R = C.ROUNDS;

console.log('== the rounds');
check('four rounds, in the memo’s order', R.map(function (r) { return r.id; }).join(',') === 'sunset,lightning,red,bat');
check('three stops', C.STOPS.length === 3 && C.STOPS[0].id === 'inside' && C.STOPS[2].id === 'physics');

console.log('== readability (the rule the reader’s card states)');
var expectRead = { sunset: [1, 1, 1], lightning: [0, 1, 1], red: [0, 1, 1], bat: [0, 1, 1] };
R.forEach(function (r, k) { var got = C.STOPS.map(function (s) { return M.canRead(k, s.id) ? 1 : 0; }); check(r.id + ' readable ' + got.join(''), got.join('') === expectRead[r.id].join('')); });
check('the inside frame needs the sense the thing is in', M.needs(0, 'inside') === 'eyes' && M.needs(1, 'inside') === 'eyes' && M.needs(3, 'inside') === 'sonar');
check('the shape needs a mind, the physics instruments and sums', M.needs(2, 'shape') === 'mind' && M.needs(2, 'physics') === 'sums');

console.log('== what each frame holds (pp. 443-445, fn. 10, p. 449: direction only; fractions ours)');
R.forEach(function (r, k) {
  var h = C.STOPS.map(function (s) { return M.holds(k, s.id); });
  if (r.kind === 'experience') check(r.id + ': all inside, part as shape, none as physics', h[0] === 1 && h[1] > 0 && h[1] < 1 && h[2] === 0, h.join('/'));
  else check(r.id + ': its look inside, part as shape, all as physics', h[0] > 0 && h[0] < h[1] && h[1] < 1 && h[2] === 1, h.join('/'));
});

console.log('== the best stop per round, and the discovery');
var expectBest = { sunset: 'inside', lightning: 'physics', red: 'shape', bat: 'shape' };
R.forEach(function (r, k) { var b = M.best(k); check(r.id + ': best is ' + expectBest[r.id], b.stop === expectBest[r.id], b.stop + ' ' + b.arrived); });
check('round 3 (red to Ada): the readable frames are the ones red has left', !M.canRead(2, 'inside') && M.holds(2, 'inside') === 1 && M.best(2).arrived < 1 && M.best(2).arrived > 0);
check('round 3 (red, physics): readable, and none of the red', M.send(2, 'physics').readable && M.send(2, 'physics').arrived === 0);
check('round 4 (the bat, inside): blank to you', !M.send(3, 'inside').readable);
check('every send carries what left the picture on the way', R.every(function (r, k) { return C.STOPS.every(function (s) { return M.send(k, s.id).left.length > 20; }); }));

console.log('== strategy table (build.md §3)');
var table = {};
Object.keys(M.STRATEGIES).forEach(function (name) { var p = M.play(M.STRATEGIES[name]); table[name] = p.total; console.log('   ' + name.padEnd(32) + p.total.toFixed(2) + '   ' + p.sends.map(function (s) { return s.arrived; }).join(' ')); });
check('always physics (the reductionist) gets lightning and nothing else', M.play(M.STRATEGIES['always physics']).sends.map(function (s) { return s.arrived; }).join(',') === '0,1,0,0');
check('always the naked eye gets the sunset and nothing else', M.play(M.STRATEGIES['always inside']).sends.map(function (s) { return s.arrived; }).join(',') === '1,0,0,0');
check('nearest the reader can read loses only on lightning', (function () { var a = M.play(M.STRATEGIES['nearest the reader can read']).sends, b = M.play(M.STRATEGIES['best']).sends; for (var i = 0; i < 4; i++) if ((a[i].arrived !== b[i].arrived) !== (i === 1)) return false; return true; })());
check('best beats every other strategy', Object.keys(table).every(function (k) { return k === 'best' || table[k] < table.best; }));
check('every strategy but best goes wrong somewhere', Object.keys(table).every(function (k) { return k === 'best' || table[k] < table.best; }));

console.log('== robustness: the best stop per round under every fraction we chose');
var saved = JSON.stringify(C.HOLDS), robust = true, tried = 0;
for (var es = 0.02; es < 1; es += 0.04) for (var wi = 0; wi < 1; wi += 0.1) for (var ws = wi + 0.02; ws < 0.99; ws += 0.08) {
  C.HOLDS.experience.shape = es; C.HOLDS.world.inside = wi; C.HOLDS.world.shape = ws; tried++;
  R.forEach(function (r, k) { if (M.best(k).stop !== expectBest[r.id]) robust = false; });
  var t = {}; Object.keys(M.STRATEGIES).forEach(function (name) { t[name] = M.play(M.STRATEGIES[name]).total; });
  if (!(t['always physics'] < t.best && t['always inside'] < t.best && t['nearest the reader can read'] < t.best)) robust = false;
}
var h0 = JSON.parse(saved); C.HOLDS.experience.shape = h0.experience.shape; C.HOLDS.world.inside = h0.world.inside; C.HOLDS.world.shape = h0.world.shape;
check('best stop unchanged, and the three wrong strategies still wrong, over ' + tried + ' settings of the fractions', robust);
check('fractions restored', JSON.stringify(C.HOLDS) === saved);
// What would break the lesson: an experience holding something in the physics frame (the paper says none, fn. 10).
C.HOLDS.experience.physics = 0.5; var broke = M.best(2).stop !== 'shape'; C.HOLDS.experience.physics = 0;
check('the lesson rests on the paper’s claim that the physics frame holds none of an experience (set it to half and the best stop for red moves)', broke);

console.log('== the words');
var bad = [], lines = [];
R.forEach(function (r, k) { C.STOPS.forEach(function (s) { var x = M.send(k, s.id); lines.push(x.line, x.reply, x.why || '', x.frame, x.left); check(r.id + ' ' + s.id + ': a line, a reply, and a rule when read', x.line.length > 20 && x.reply.length > 5 && (!x.readable || x.why.length > 10)); }); });
C.ANSWERS.forEach(function (a) { var v = M.verdict(M.play(M.STRATEGIES.best).sends, a.id); lines.push(v.head, v.part, v.stood); lines = lines.concat(v.found, v.nagel); check('verdict for "' + a.id + '": head, four found lines, where you part, had yours stood', v.head.length > 10 && v.found.length === 4 && v.part.length > 40 && v.stood.length > 40); });
check('Nagel’s answer is the third', C.NAGEL_ANSWER === 'something' && C.ANSWERS[2].id === 'something');
lines.forEach(function (l) { if (/undefined|NaN|Infinity|\d\.\d/.test(l)) bad.push(l); });
check('no decimal, NaN, undefined or Infinity in ' + lines.length + ' lines', bad.length === 0, bad.join(' | '));
check('no "no a body"', !lines.some(function (l) { return /no a /.test(l); }));

console.log('\n' + n + ' checks, ' + fails + ' failed');
process.exit(fails ? 1 : 0);
