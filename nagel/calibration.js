// Calibration check for Nagel’s Camera (formerly Zoom Out with Nagel) (build.md §2-3). The mechanism is a toy of an argument with no numbers in
// it, so the check tests the properties the paper states (direction only), the rules the screen states, the strategy
// table, the robustness of the best stop to every fraction we chose, and the words. Run: node calibration.js
var M = require('./mechanism.js'); var C = M.CONFIG;
var n = 0, fails = 0;
function check(name, ok, detail) { n++; if (!ok) fails++; console.log((ok ? 'ok   ' : 'FAIL ') + name + (detail ? '  [' + detail + ']' : '')); }
var R = C.ROUNDS;

console.log('== the rounds');
check('three rounds, in the memo’s order', R.map(function (r) { return r.id; }).join(',') === 'sunset,lightning,red');
check('three stops', C.STOPS.length === 3 && C.STOPS[0].id === 'inside' && C.STOPS[2].id === 'physics');

console.log('== readability (the rule the reader’s card states)');
var expectRead = { sunset: [1, 1, 1], lightning: [0, 1, 1], red: [0, 1, 1] };
R.forEach(function (r, k) { var got = C.STOPS.map(function (s) { return M.canRead(k, s.id) ? 1 : 0; }); check(r.id + ' readable ' + got.join(''), got.join('') === expectRead[r.id].join('')); });
check('the inside frame needs the sense the thing is in', M.needs(0, 'inside') === 'eyes' && M.needs(1, 'inside') === 'eyes' && M.needs(2, 'inside') === 'eyes');
check('the shape needs a mind, the physics instruments and sums', M.needs(2, 'shape') === 'mind' && M.needs(2, 'physics') === 'sums');

console.log('== what each frame holds (pp. 443-445, fn. 10, p. 449: direction only; fractions ours)');
R.forEach(function (r, k) {
  var h = C.STOPS.map(function (s) { return M.holds(k, s.id); });
  if (r.kind === 'experience') check(r.id + ': all inside, part as shape, none as physics', h[0] === 1 && h[1] > 0 && h[1] < 1 && h[2] === 0, h.join('/'));
  else check(r.id + ': its look inside, part as shape, all as physics', h[0] > 0 && h[0] < h[1] && h[1] < 1 && h[2] === 1, h.join('/'));
});

console.log('== the best stop per round, and the discovery');
var expectBest = { sunset: 'inside', lightning: 'physics', red: 'shape' };
R.forEach(function (r, k) { var b = M.best(k); check(r.id + ': best is ' + expectBest[r.id], b.stop === expectBest[r.id], b.stop + ' ' + b.arrived); });
check('round 3 (red to Ada): the readable frames are the ones red has left', !M.canRead(2, 'inside') && M.holds(2, 'inside') === 1 && M.best(2).arrived < 1 && M.best(2).arrived > 0);
check('round 3 (red, physics): readable, and none of the red', M.send(2, 'physics').readable && M.send(2, 'physics').arrived === 0);
check('every send carries what left the picture on the way', R.every(function (r, k) { return C.STOPS.every(function (s) { return M.send(k, s.id).left.length > 20; }); }));

console.log('== strategy table (build.md §3)');
var table = {};
Object.keys(M.STRATEGIES).forEach(function (name) { var p = M.play(M.STRATEGIES[name]); table[name] = p.total; console.log('   ' + name.padEnd(32) + p.total.toFixed(2) + '   ' + p.sends.map(function (s) { return s.arrived; }).join(' ')); });
check('always physics (the reductionist) gets lightning and nothing else', M.play(M.STRATEGIES['always physics']).sends.map(function (s) { return s.arrived; }).join(',') === '0,1,0');
check('always the naked eye gets the sunset and nothing else', M.play(M.STRATEGIES['always inside']).sends.map(function (s) { return s.arrived; }).join(',') === '1,0,0');
check('nearest the reader can read loses only on lightning', (function () { var a = M.play(M.STRATEGIES['nearest the reader can read']).sends, b = M.play(M.STRATEGIES['best']).sends; for (var i = 0; i < 3; i++) if ((a[i].arrived !== b[i].arrived) !== (i === 1)) return false; return true; })());
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

console.log('== the evidence panel');
check('the naked-eye frame is the unread one for lightning and red, and none for the sunset', M.evidence(0).unread === null && M.evidence(1).unread === 'inside' && M.evidence(2).unread === 'inside');
check('Ada\u2019s line', /Ada could not read this frame. You can/.test(M.evidence(2).line));

console.log('== the nights (the second half)');
check('three nights, one per round, in order', C.NIGHTS.length === 3 && C.NIGHTS.map(function (n) { return n.thing; }).join(',') === 'the sunset,lightning,red');
C.NIGHTS.forEach(function (N, n) {
  var ins = N.pieces.filter(function (p) { return p.in; }).length;
  check(N.id + ': six pieces, between three and five in, every piece with a reason', N.pieces.length === 6 && ins >= 3 && ins <= 5 && N.pieces.every(function (p) { return p.why.length > 20 && p.label.length > 3; }));
  check(N.id + ': every light-piece is out and every sound, echo, smell and warmth piece is in', N.pieces.every(function (p) { return (p.idiom === 'light' || p.idiom === 'self') ? !p.in : p.in; }));
  var all = M.grade(n, N.pieces.map(function (p) { return p.id; })), none = M.grade(n, []), best = M.grade(n, N.pieces.filter(function (p) { return p.in; }).map(function (p) { return p.id; }));
  check(N.id + ': all pieces chosen finds everything and adds what does not belong; none finds nothing; the right set is clean', all.found === all.inCount && all.wrong.length === 6 - all.inCount && none.found === 0 && none.wrong.length === 0 && best.found === best.inCount && best.wrong.length === 0 && best.words === 'All of');
  check(N.id + ': the status of every piece is one of kept, faded, missed, left', all.pieces.every(function (p) { return p.status === 'kept' || p.status === 'faded'; }) && none.pieces.every(function (p) { return p.status === 'missed' || p.status === 'left'; }));
});
check('the verdict carries one line per night after the three prints', M.verdict(M.play(M.STRATEGIES.best).sends, [M.grade(0, []), M.grade(1, []), M.grade(2, [])], 'something').found.length === 6);

console.log('== the words');
var bad = [], lines = [];
R.forEach(function (r, k) { C.STOPS.forEach(function (s) { var x = M.send(k, s.id); lines.push(x.line, x.reply, x.why || '', x.frame, x.left, M.evidence(k).line); check(r.id + ' ' + s.id + ': a line, a reply, and a rule when read', x.line.length > 20 && x.reply.length > 5 && (!x.readable || x.why.length > 10)); }); });
var v = M.verdict(M.play(M.STRATEGIES.best).sends, [M.grade(0, []), M.grade(1, []), M.grade(2, [])]); lines.push(v.head); lines = lines.concat(v.found, v.nagel, v.opening); C.READINGS.forEach(function (r) { lines.push(r.label, r.says); });
check('verdict: a head, three opening sentences, six found lines, three readings', v.head.length > 10 && v.opening.length === 3 && v.found.length === 6 && v.readings.length === 3);

console.log('== the verdict\u2019s opening over every path');
// Every first-half path: 27 sentences, printed in full for the memo.
var stops = ['inside', 'shape', 'physics'], firstHalf = [], badSent = [];
function wellFormed(s) { return /^[A-Z].*\.$/.test(s) && !/,,|, ,|,\.|: \.|;\.|  |\band and\b|\bthe the\b|undefined|NaN|\d/.test(s) && !/, and\.|:$/.test(s); }
stops.forEach(function (a) { stops.forEach(function (b) { stops.forEach(function (d) { var o = M.opening([M.send(0, a), M.send(1, b), M.send(2, d)], []); firstHalf.push(o[0]); if (!wellFormed(o[0])) badSent.push(o[0]); }); }); });
firstHalf.forEach(function (s) { console.log('   ' + s); });
check('all 27 first-half sentences are well formed', badSent.length === 0, badSent.join(' | '));
check('every first-half sentence ends with the red not crossing', firstHalf.every(function (s) { return /not the red\.$|could not\.$/.test(s); }));
// Every way of filling the three windows: 2^18 night sentences, each checked; twenty printed, spread across the range.
var N = C.NIGHTS, ids = N.map(function (n) { return n.pieces.map(function (p) { return p.id; }); }), total = 1 << 18, badNight = [], seen = {}, printed = 0;
var sends = M.play(M.STRATEGIES.best).sends;
for (var mask = 0; mask < total; mask++) {
  var grades = [0, 1, 2].map(function (n) { var ch = []; for (var i = 0; i < 6; i++) if (mask & (1 << (n * 6 + i))) ch.push(ids[n][i]); return M.grade(n, ch); });
  var o = M.opening(sends, grades);
  if (!wellFormed(o[1]) || !wellFormed(o[2])) { if (badNight.length < 5) badNight.push(o[1] + ' || ' + o[2]); }
  var key = o[1]; if (!seen[key]) seen[key] = o[2];
}
var distinct = Object.keys(seen); for (var q = 0; q < 20; q++) { var pick = distinct[Math.floor(q * (distinct.length - 1) / 19)]; console.log('   ' + pick + ' ' + seen[pick]); }
check('all ' + total + ' night sentences are well formed (' + Object.keys(seen).length + ' distinct)', badNight.length === 0, badNight.join(' | '));
check('the colour praise appears only when no colour piece was put in', (function () { var g = [M.grade(0, ['warm']), M.grade(1, []), M.grade(2, [])]; var h = [M.grade(0, ['warm', 'colour']), M.grade(1, []), M.grade(2, [])]; return /and no colour\./.test(M.opening(sends, g)[1]) && !/no colour/.test(M.opening(sends, h)[1]) && /gave it colour/.test(M.opening(sends, h)[1]); })());
C.NIGHTS.forEach(function (N, n) { [[], N.pieces.map(function (p) { return p.id; }), [N.pieces[0].id, N.pieces[2].id]].forEach(function (ch) { var g = M.grade(n, ch); lines.push(g.line, M.nightLine(g)); g.pieces.forEach(function (p) { lines.push(p.why); }); }); });
lines.forEach(function (l) { if (/undefined|NaN|Infinity|\d\.\d/.test(l)) bad.push(l); });
check('no decimal, NaN, undefined or Infinity in ' + lines.length + ' lines', bad.length === 0, bad.join(' | '));
check('no "no a body"', !lines.some(function (l) { return /no a /.test(l); }));

console.log('\n' + n + ' checks, ' + fails + ' failed');
process.exit(fails ? 1 : 0);
