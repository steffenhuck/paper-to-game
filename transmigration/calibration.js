// Calibration check for Beam Me Up, Leibniz (memo §17). The mechanism is a toy built from the text's argument, so there are no
// reported numbers to hit; what is checked is that the five rules on screen hold in the mechanism as stated, over the
// fleet as configured and over random fleets and logs: (1) the exchange invariant (a supposed swap leaves everything the
// station can see identical, bit for bit); (2) every log line follows from an earlier line of the same log, including every
// mark and the memory; (3) a burn at every depth leaves a pod with the same pilot and the same window; (4) the diamond has no
// porthole; (5) only the memory writes the second book, and the original still claims the life; (6) the stick: no line on
// either tape refers to the other; (7) the bookings; (8) the shifts; (9) the words: no decimal anywhere, every path has a
// verdict. Run: node calibration.js  (exit 1 on failure)
var M = require('./mechanism.js'), C = M.CONFIG;
var fails = 0, out = [];
function check(name, ok, detail) { out.push((ok ? 'PASS ' : 'FAIL ') + name + (detail !== undefined ? '  — ' + detail : '')); if (!ok) fails++; }
function rnd(seed) { var x = seed; return function () { x = (x * 1103515245 + 12345) & 0x7fffffff; return x / 0x7fffffff; }; }

// 1. the exchange invariant, on the configured fleet and on random fleets with random logs
(function () {
  var s = M.newShift(1), ids = Object.keys(s.pods).filter(function (k) { return s.pods[k].porthole; }), n = 0, ok = true;
  ids.forEach(function (a) { ids.forEach(function (b) { if (a === b) return; var h = JSON.parse(JSON.stringify(s)); var p = h.pods[a].pilot; h.pods[a].pilot = h.pods[b].pilot; h.pods[b].pilot = p; n++; if (M.observe(h) !== M.observe(s)) ok = false; }); });
  check('a supposed exchange of pilots leaves every porthole and every log identical, bit for bit (' + n + ' pairs of the configured fleet)', ok);
  var r = M.swapQuiet(M.newShift(1), 'B'); check('the quiet swap reports the same observation before and after, and writes nothing', r.same && /Nothing written/.test(r.book) && !r.heap);
  var ok2 = true, m = 0;
  for (var seed = 1; seed <= 200; seed++) {
    var g = rnd(seed), t = M.newShift(1);
    Object.keys(t.pods).forEach(function (id) { t.pods[id].x = Math.round(g() * 340); t.pods[id].y = Math.round(g() * 190); t.pods[id].porthole = g() < 0.8; t.logs[id] = []; var L = 1 + Math.floor(g() * 6); for (var i = 0; i < L; i++) t.logs[id].push({ t: '3:' + (10 + i), ev: 'event ' + Math.floor(g() * 1000), cause: i === 0 ? null : Math.floor(g() * i), feel: 'feel ' + Math.floor(g() * 1000) }); });
    var ps = Object.keys(t.pods).filter(function (k) { return t.pods[k].porthole; });
    ps.forEach(function (a) { ps.forEach(function (b) { if (a === b) return; var h = JSON.parse(JSON.stringify(t)); var p = h.pods[a].pilot; h.pods[a].pilot = h.pods[b].pilot; h.pods[b].pilot = p; m++; if (M.observe(h) !== M.observe(t)) ok2 = false; }); });
  }
  check('the invariant holds on 200 random fleets with random positions, portholes and logs (' + m + ' pairs): the porthole belongs to the position and the log to the pod, so no swap can show', ok2);
  var t2 = M.newShift(1); t2.pods.B.x += 1; check('the station does see a pod move: a pod shifted one unit changes what it reads (the invariant is about pilots, not a blind book)', M.observe(t2) !== M.observe(M.newShift(1)));
})();

// 2. every line follows from an earlier line of the same log
function causesOk(s) { var ok = true; Object.keys(s.logs).forEach(function (id) { s.logs[id].forEach(function (l, i) { if (i === 0) { if (l.cause !== null) ok = false; } else if (typeof l.cause !== 'number' || l.cause >= i || l.cause < 0) ok = false; }); }); return ok; }
(function () {
  check('the configured logs: the first line of each has no cause, every other line a cause earlier in the same log', causesOk(M.newShift(1)) && causesOk(M.newShift(2)));
  Object.keys(C.MARKS).forEach(function (k) {
    var s = M.newShift(k === 'memory' ? 2 : 1), before = s.logs.B.length, r = M.swapMark(s, k);
    check('mark “' + C.MARKS[k].key + '”: two lines go into pod B’s log (the cause, then the sign) and the sign’s cause is the line before it', s.logs.B.length === before + 2 && s.logs.B[before + 1].cause === before && causesOk(s), JSON.stringify(s.logs.B.slice(-2)));
    check('mark “' + C.MARKS[k].key + '”: the frames show the sign and then the arrow to its cause', r.frames.some(function (f) { return f.pic === 'arrow'; }) && r.frames[r.frames.length - 1].pic !== 'cross');
    check('mark “' + C.MARKS[k].key + '”: pod A’s pilot is still in pod A and pod B’s is still in B', s.pods.A.pilot === (k === 'memory' ? 'you' : 'the dog') && s.pods.B.pilot === (k === 'memory' ? 'the far pilot' : 'the cat'));
  });
  var s3 = M.newShift(1); M.swapMark(s3, 'lamp'); var r2 = M.swapMark(s3, 'roll'); check('after two mechanical marks the key is exhausted, and the logs still cause themselves', r2.exhausted && causesOk(s3));
})();

// 3. the burn
(function () {
  C.DEPTHS.forEach(function (d, i) {
    var s = M.newShift(1), v0 = JSON.stringify(M.view(s, 'A')), r = M.burn(s, i);
    check('burn ' + d.key + ': ' + r.n + ' layers, a pod remains with the same pilot and the same window; the outside scorched', r.n === Math.min(d.n, C.BURN_CAP) && s.pods.A.pilot === 'the dog' && JSON.stringify(M.view(s, 'A')) === v0 && s.pods.A.scorched === 1 && r.frames[r.frames.length - 1].pic === 'remains');
  });
  var s = M.newShift(1); M.burn(s, 0); var r = M.burn(s, 3); check('a second burn exhausts the key; all the way is capped at the station’s million', r.exhausted && r.all && r.n === C.BURN_CAP && s.pods.A.scorched === 2);
})();

// 4. the diamond
(function () {
  var s = M.newShift(1), r = M.swapQuiet(s, 'D');
  check('the diamond has no porthole: no pilot found, nothing written, the dog in pod A', r.heap && M.view(s, 'D') === null && /no porthole found/.test(r.book) && s.pods.A.pilot === 'the dog');
  check('every other pod has a porthole and a pilot (rule 4)', Object.keys(s.pods).every(function (k) { return k === 'D' || (s.pods[k].porthole && s.pods[k].pilot); }));
})();

// 5. the memory and the second book
(function () {
  var s = M.newShift(2); M.swapMark(s, 'lamp'); check('a mechanical mark in shift 2 writes nothing in the second book', s.moral.length === 0 && s.claimants.A.length === 1);
  var r = M.swapMark(s, 'memory');
  check('the memory writes the second book, and two pilots claim the one life', r.moral && s.moral.length === 1 && s.claimants.A.length === 2 && r.claimants === 2 && r.frames.map(function (f) { return f.pic; }).join(',') === 'cross,speak,arrow,moral,speakA');
  check('the memory has a mechanical cause too: the first book writes the words from the pod’s own works', /from its own works/.test(r.book) && causesOk(s));
  check('you are still in your pod', s.pods.A.pilot === 'you');
})();

// 6. the stick
(function () {
  var s = M.newShift(2), r1 = M.steer(s, 'left'), p = M.pullStick(s), r2 = M.steer(s, 'right');
  var a = s.logs.A.slice(-4);
  check('a push of the stick adds the thruster line and the roll to the pod’s log, and the wanting to the pilot’s tape, each its own', a[0].ev.indexOf('thruster') >= 0 && a[1].ev === 'rolls left' && a[0].feel === 'I want to go left' && a[2].feel === 'I want to go right' && a[3].ev === 'rolls right' && causesOk(s));
  check('with the stick out the pod still rolls as wanted, and the text says the stick is attached to nothing', s.stickOut && /attached to nothing/.test(r2.text) && r2.stickOut && !r1.stickOut && /comes out/.test(p.text));
  check('no line of a pilot’s tape names the pod’s works, and no line of a pod’s log names the pilot (no wire)', s.logs.A.every(function (l) { return !/thruster|heater|timer/.test(l.feel) && !/want|glad|pang/.test(l.ev); }));
})();

// 7. the bookings, 8. the shifts
(function () {
  Object.keys(C.WAYS).forEach(function (w) {
    var g = M.newGame(); M.burn(g.shift, 2); M.swapQuiet(g.shift, 'B'); M.swapMark(g.shift, 'lamp'); check('shift 1 ends only after all three keys (' + w + ')', M.shiftDone(g.shift));
    M.nextShift(g); check('shift 2 is not done before the booking', !M.shiftDone(g.shift));
    M.swapMark(g.shift, 'memory'); var r = M.bookPassage(g.shift, w), v = M.verdict(g);
    check('booking ' + w + ': claimants ' + (w === 'pod' ? 1 : 2) + ', the shift over, a verdict with the four parts', r.claimants === (w === 'pod' ? 1 : 2) && M.shiftDone(g.shift) && v.paper && v.found.length === 5 && v.part && v.followed, v.found.join(' | '));
  });
  var g1 = M.newGame(); M.burn(g1.shift, 0); M.swapQuiet(g1.shift, 'D'); check('shift 1 is not done with one key unused', !M.shiftDone(g1.shift));
  M.swapQuiet(g1.shift, 'C'); M.swapMark(g1.shift, 'course'); check('…and is done once the third is used, with the diamond and the fern both tried', M.shiftDone(g1.shift));
  M.nextShift(g1); M.swapMark(g1.shift, 'roll'); M.swapMark(g1.shift, 'memory'); M.bookPassage(g1.shift, 'beamburn');
  var v = M.verdict(g1); check('a long path (two quiets, a mechanical beam, then the memory, then beam-and-burn) has a verdict', v.found.length === 5 && /diamond/.test(v.found[1]) && /no bottom/.test(v.part), v.found[1]);
})();

// 9. the words
(function () {
  var strings = [], g = M.newGame();
  function grab(r) { (r.frames || []).forEach(function (f) { strings.push(f.text); }); [r.voice, r.book, r.leibniz].forEach(function (x) { if (x !== undefined) strings.push(x); }); }
  C.DEPTHS.forEach(function (d, i) { grab(M.burn(M.newShift(1), i)); });
  ['B', 'C', 'D', 'E'].forEach(function (t) { grab(M.swapQuiet(M.newShift(1), t)); });
  ['lamp', 'roll', 'course'].forEach(function (k) { grab(M.swapMark(M.newShift(1), k)); });
  ['lamp', 'roll', 'course', 'memory'].forEach(function (k) { grab(M.swapMark(M.newShift(2), k)); });
  var s2 = M.newShift(2); strings.push(M.steer(s2, 'left').text, M.pullStick(s2).text, M.steer(s2, 'right').text);
  Object.keys(C.WAYS).forEach(function (w) { var gg = M.newGame(); M.burn(gg.shift, 1); M.swapQuiet(gg.shift, 'B'); M.swapMark(gg.shift, 'lamp'); M.nextShift(gg); M.swapMark(gg.shift, 'memory'); grab(M.bookPassage(gg.shift, w)); var v = M.verdict(gg); strings.push(v.paper, v.part, v.followed); strings.push.apply(strings, v.found); });
  C.RULES.forEach(function (r) { strings.push(r); });
  var dec = strings.filter(function (t) { return /\d\.\d/.test(t); });
  check('no sentence anywhere contains a decimal (' + strings.length + ' strings)', dec.length === 0, dec.join(' | '));
  var empty = strings.filter(function (t) { return !t || !t.trim(); });
  check('no sentence is empty', empty.length === 0);
  check('the rules are five sentences', C.RULES.length === 5 && C.RULES.every(function (r) { return /\.$/.test(r); }));
})();

out.push('', fails ? fails + ' FAILED' : 'ALL ' + out.length + ' CHECKS PASS');
console.log(out.join('\n'));
process.exit(fails ? 1 : 0);
