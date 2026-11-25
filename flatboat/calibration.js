// Calibration check for Leibniz's Flatboat (memo §17), revision 6. The mechanism is a toy built from the paper's method, so
// there are no reported numbers to hit; what is checked is (1) that the one rule the paper states is run as written, and
// the losses, the lost day and the replay; (2) that the two crossings' best loadings, found by exhaustive search, are the
// memo's and unique in the first push; (3) the heuristics table of build.md §3, with every wrong branch the memo names
// losing for the reason the paper names; (4) that the lessons survive moving the lines we drew; (5) the frames and the
// words: three or four frames a push, plain words, no decimals, the feet a shot needs never named on a through shot, and
// each frame's title block never ahead of the frame. Run: node calibration.js  (exit 1 on failure)
var M = require('./mechanism.js'), C = M.CONFIG;
var fails = 0, out = [];
function check(name, ok, detail) { out.push((ok ? 'PASS ' : 'FAIL ') + name + (detail !== undefined ? '  — ' + detail : '')); if (!ok) fails++; }
function play(k, strategy) { var s = M.newCrossing(k); while (!s.over) M.push(s, strategy(s, C.CROSSINGS[k], s.pushes + 1)); return s; }
function cr(k) { return C.CROSSINGS[k]; }
function pics(r) { return r.frames.map(function (f) { return f.pic; }).join(','); }

// 1. the carrying rule as written; the losses; the lost day; the replay
(function () {
  var g = cr(0), ok = true, n = 0;
  for (var f = 0; f <= C.MAX_FEET; f++) for (var gn = 0; gn <= C.MAX_GUNS; gn++) for (var m = 0; m <= C.MAX_MEN; m += C.MEN_STEP) {
    var ld = { feet: f, guns: gn, men: m }, w = f * C.FOOT_T + gn * C.GUN_T + m * C.MAN_T; n++;
    if (M.floats(g, ld) !== (w <= C.HULLS.great.tuns + 1e-9)) ok = false;
    if (M.floats(cr(1), ld) !== (w <= C.HULLS.shallow.tuns + 1e-9)) ok = false;
    if (w <= C.HULLS.great.tuns && Math.abs(M.draught(g, ld) - w / C.HULLS.great.tuns) > 1e-9) ok = false;
  }
  check('a boat carries the weight of the water it could hold: floats iff load ≤ tons, draught = load / tons (' + n + ' loadings, both hulls)', ok);
  check('earth is heavier than the hollow can hold: 6 ft of wall alone (' + 6 * C.FOOT_T + ' tons) sinks the shallow boat and fills the great one', !M.floats(cr(1), { feet: 6, guns: 0, men: 0 }) && M.floats(g, { feet: 6, guns: 0, men: 0 }) && !M.floats(g, { feet: 6, guns: 0, men: 10 }));
  var s = M.newCrossing(0), r = M.push(s, { feet: 6, guns: 1, men: 0, landing: 'front' });
  check('an overloaded boat sinks at the bank in one frame, nobody hurt, and the push is lost', r.outcome === 'sinks' && s.across === 0 && s.pushes === 1 && s.lost === 0 && pics(r) === 'sink');
  var o = M.newCrossing(0), ro = M.push(o, { feet: 0, guns: 0, men: 60, landing: 'front' }, { opening: true });
  check('the general’s opening boat is sunk with all sixty in three frames and changes nothing: no push used, nothing across, nothing in the tally, the bank untouched', ro.outcome === 'sunk' && ro.lost === 60 && o.pushes === 0 && o.across === 0 && o.lost === 0 && !o.lostDay && o.banks.front.men === 0 && o.openingDone && pics(ro) === 'push,through,sunk');
  check('the opening boat’s frames keep the title block at zero throughout (its dead are not the player’s)', ro.frames.every(function (f) { return f.tb.lost === 0 && f.tb.across === 0 && f.tb.pushesLeft === 3; }));
  var g4 = M.newGame(), s4 = g4.crossings[0], r4a = M.push(s4, { feet: 2, guns: 1, men: 40, landing: 'front' });
  check('a cannonball through sinks the boat: everyone aboard lost, the day over, nothing across, three frames', r4a.outcome === 'sunk' && r4a.lost === 40 && s4.lost === 40 && s4.lostDay && s4.over && s4.across === 0 && pics(r4a) === 'push,through,sunk');
  check('the dead appear in the title block only at the sunk frame, not before', r4a.frames[0].tb.lost === 0 && r4a.frames[1].tb.lost === 0 && r4a.frames[2].tb.lost === 40);
  check('a lost day’s verdict line says the day was lost on that push, not by dark', /^The day was lost on push 1: nobody across\. Lost: 40 soldiers\.$/.test(M.crossingVerdict(s4).lines[0]), M.crossingVerdict(s4).lines[0]);
  var c4 = M.replay(g4, 0);
  check('the crossing played again starts afresh but carries the dead, the attempts and the record', c4.pushes === 0 && c4.across === 0 && !c4.over && c4.lost === 0 && c4.lostBefore === 40 && c4.attempts === 2 && c4.known === g4.known && g4.known.field.throughAt === 2 && g4.crossings[0] === c4);
  var r4b = M.push(c4, { feet: 4, guns: 1, men: 20, landing: 'front' });
  check('the paper’s push plays in four frames: push, stuck, land (with the cannon driving the battery off), rest', pics(r4b) === 'push,stuck,land,rest' && r4b.frames[2].drive === true && r4b.frames[3].men === 600);
  check('the title block moves with the frames: nobody across until the landing, the rest counted only at the last frame', r4b.frames[0].tb.across === 0 && r4b.frames[1].tb.across === 0 && r4b.frames[1].tb.bank.men === 0 && r4b.frames[2].tb.across === 20 && r4b.frames[2].tb.bank.men === 20 && r4b.frames[2].tb.bank.batteryOff === true && r4b.frames[3].tb.across === 620);
  var v4 = M.crossingVerdict(c4);
  check('the verdict of a replayed crossing counts the dead over the attempts', v4.across === 620 && v4.lost === 40 && v4.attempts === 2 && /Lost on the way: 40 soldiers, over 2 attempts/.test(v4.lines[0]), v4.lines[0]);
  var s5 = g4.crossings[1], r5 = M.push(s5, { feet: 0, guns: 0, men: 60, landing: 'up' });
  check('musket fire through costs one in six and drives the rest back; the day goes on; three frames', r5.outcome === 'through' && r5.lost === 10 && s5.lost === 10 && !s5.over && !s5.lostDay && s5.across === 0 && pics(r5) === 'push,hit,back');
  var r5b = M.push(s5, { feet: 0, guns: 0, men: 10, landing: 'up' }); check('one in six rounds up: 10 soldiers lose 2', r5b.lost === 2);
  var r5c = M.push(s5, { feet: 1, guns: 0, men: 40, landing: 'up' });
  check('the last push of the day that makes the shore safe ends with the rest crossing at dawn (no soldiers counted)', pics(r5c) === 'push,stuck,land,rest' && r5c.frames[3].men === 0 && s5.across === 40 && s5.over);
  var s6 = M.newGame().crossings[1], r6 = M.push(s6, { feet: 1, guns: 0, men: 40, landing: 'front' });
  check('a small cannonball through sinks the shallow boat too', r6.outcome === 'sunk' && s6.lostDay && s6.lost === 40);
  var s7 = M.newGame().crossings[1], r7 = M.push(s7, { feet: 2, guns: 1, men: 0, landing: 'front' });
  check('the shallow boat with the wall and a cannon has nobody aboard: it drifts back, three frames', r7.outcome === 'nobody' && pics(r7) === 'push,stuck,back' && s7.across === 0);
  var s8 = M.newGame().crossings[1], r8 = M.push(s8, { feet: 2, guns: 0, men: 20, landing: 'front' });
  check('the shallow boat at A digs in without a cannon and the rest wait', r8.outcome === 'landed' && pics(r8) === 'push,stuck,land,wait' && !s8.restPassed && s8.across === 20);
  var gv4 = M.gameVerdict(g4);
  check('the game verdict adds the cost: men lost and crossings played again', gv4.lost === 52 && gv4.attempts === 3 && /It cost 52 soldiers, and 1 crossing played again/.test(gv4.cost), gv4.cost);
  var gv5 = (function () { var g = M.newGame(); g.crossings.forEach(function (s, k) { M.push(s, M.best(k).first); }); return M.gameVerdict(g); })();
  check('a perfect game costs nobody and is over by morning', gv5.lost === 0 && gv5.cost === ' Not a man lost.' && /over by morning/.test(gv5.fate));
})();

// 2. the best loadings
(function () {
  var want = [620, 640], firsts = [{ feet: 4, guns: 1, men: 20, landing: 'front' }, { feet: 1, guns: 0, men: 40, landing: 'up' }];
  for (var k = 0; k < 2; k++) {
    var b = M.best(k);
    check('crossing ' + (k + 1) + ' (' + cr(k).title + '): best by exhaustive search = ' + want[k], b.across === want[k], 'got ' + b.across + ' with ' + JSON.stringify(b.seq));
    check('crossing ' + (k + 1) + ': the best is reached on the first push', b.seq.length === 1);
    check('crossing ' + (k + 1) + ': the memo’s first push is the best, and unique', b.firsts.length === 1 && b.firsts.some(function (f) { return f.feet === firsts[k].feet && f.guns === firsts[k].guns && f.men === firsts[k].men && f.landing === firsts[k].landing; }), JSON.stringify(b.firsts));
    check('crossing ' + (k + 1) + ': the best first push weighs exactly the hull', Math.abs(M.weight(b.first) - M.hull(cr(k)).tuns) < 1e-9);
  }
  // the best at A in the narrows, for the record: the wall and a cannon do not fit with anyone aboard
  var bestA = 0; M.loadings(cr(1)).filter(function (l) { return l.landing === 'front'; }).forEach(function (l) { var s = M.newCrossing(1); M.push(s, l); while (!s.over) M.push(s, l); if (s.across > bestA) bestA = s.across; });
  check('the narrows at A: no loading of the shallow boat lets the rest cross (best at A = 60, three boats of twenty)', bestA === 60, 'best at A ' + bestA);
})();

// 3. the heuristics table (build.md §3): nine ways of playing, three pushes a crossing
var H = [
  ['best possible', function (s, c, p) { return M.best(s.k).first; }],
  ['all men (60, no earth, no gun)', function (s, c) { return { feet: 0, guns: 0, men: 60, landing: c.landings[0].id }; }],
  ['firepower (as many guns as float, then men)', function (s, c) { var t = M.hull(c).tuns, g = Math.min(C.MAX_GUNS, Math.floor(t / C.GUN_T)), m = Math.min(60, Math.floor((t - g * C.GUN_T) / C.MAN_T / 10) * 10); return { feet: 0, guns: g, men: m, landing: c.landings[0].id }; }],
  ['earth to the brim (no men)', function (s, c) { return { feet: Math.min(C.MAX_FEET, Math.floor(M.hull(c).tuns / C.FOOT_T)), guns: 0, men: 0, landing: c.landings[0].id }; }],
  ['the spreader (2 ft, a gun, the rest men)', function (s, c) { var t = M.hull(c).tuns, m = Math.max(0, Math.min(60, Math.floor((t - 2 * C.FOOT_T - C.GUN_T) / C.MAN_T / 10) * 10)); return { feet: 2, guns: 1, men: m, landing: c.landings[0].id }; }],
  ['the physicist (just enough wall, then men, no gun)', function (s, c) { var l = c.landings[0], f = C.STOPS[l.fire], t = M.hull(c).tuns, m = Math.min(60, Math.floor((t - f * C.FOOT_T) / C.MAN_T / 10) * 10); return { feet: f, guns: 0, men: m, landing: l.id }; }],
  ['the paper (just enough wall, a gun where there is a battery, then men)', function (s, c) { var l = c.landings[0], f = C.STOPS[l.fire], g = l.battery && !s.banks[l.id].batteryOff ? 1 : 0, t = M.hull(c).tuns, m = Math.max(0, Math.min(60, Math.floor((t - f * C.FOOT_T - g * C.GUN_T) / C.MAN_T / 10) * 10)); return { feet: f, guns: g, men: m, landing: l.id }; }],
  ['the crossing-1 recipe everywhere (4 ft, a gun, 20 men)', function (s, c) { return { feet: 4, guns: 1, men: 20, landing: c.landings[0].id }; }],
  ['the paper, and upstream where offered', function (s, c) { var l = c.landings[c.landings.length - 1], f = C.STOPS[l.fire], g = l.battery && !s.banks[l.id].batteryOff ? 1 : 0, t = M.hull(c).tuns, m = Math.max(0, Math.min(60, Math.floor((t - f * C.FOOT_T - g * C.GUN_T) / C.MAN_T / 10) * 10)); return { feet: f, guns: g, men: m, landing: l.id }; }],
  ['learns: wrong once, then the paper', function (s, c, p) { var l = c.landings[c.landings.length - 1]; if (p === 1) return { feet: 0, guns: 1, men: 40, landing: l.id }; var f = C.STOPS[l.fire], g = l.battery && !s.banks[l.id].batteryOff ? 1 : 0, t = M.hull(c).tuns, m = Math.max(0, Math.min(60, Math.floor((t - f * C.FOOT_T - g * C.GUN_T) / C.MAN_T / 10) * 10)); return { feet: f, guns: g, men: m, landing: l.id }; }]
];
var table = {};
(function () {
  out.push(''); out.push('heuristics (men across by dark, three pushes a crossing):');
  out.push('strategy'.padEnd(70) + 'c1    c2    total');
  H.forEach(function (h) {
    var row = [], tot = 0;
    for (var k = 0; k < 2; k++) { var s = play(k, h[1]); row.push(s.across); tot += s.across; }
    table[h[0]] = row;
    out.push(h[0].padEnd(70) + row.map(function (x) { return String(x).padEnd(6); }).join('') + tot);
  });
  out.push('');
  check('all men: nobody across anywhere (a boat of planks to a cannonball; muskets at the bend drive it back)', table['all men (60, no earth, no gun)'].every(function (x) { return x === 0; }));
  check('firepower: nobody across anywhere (a gun keeps nothing off on the water)', table['firepower (as many guns as float, then men)'].every(function (x) { return x === 0; }));
  check('earth to the brim: nobody across (no hands)', table['earth to the brim (no men)'].every(function (x) { return x === 0; }));
  check('the spreader (2 ft and a gun) is shot through under field pieces and sinks the shallow boat', table['the spreader (2 ft, a gun, the rest men)'].every(function (x) { return x === 0; }));
  check('the physicist, who armours and forgets the gun, digs in under the battery and the rest never pass: 120 against 620', table['the physicist (just enough wall, then men, no gun)'][0] === 120);
  check('the paper’s loading at the battery is best (620); sent at A with the shallow boat, the wall and the gun fill the hull and nobody is aboard to land: 0', table['the paper (just enough wall, a gun where there is a battery, then men)'][0] === 620 && table['the paper (just enough wall, a gun where there is a battery, then men)'][1] === 0);
  check('the crossing-1 recipe sinks the shallow boat (0 in the narrows)', table['the crossing-1 recipe everywhere (4 ft, a gun, 20 men)'][1] === 0);
  check('the paper, and upstream where offered, is the best in both crossings (1260)', table['the paper, and upstream where offered'][0] === 620 && table['the paper, and upstream where offered'][1] === 640);
  check('learning after one sunk boat costs the day in crossing 1 (the boat sinks) and one push in the narrows', table['learns: wrong once, then the paper'][0] === 0 && table['learns: wrong once, then the paper'][1] === 340);
})();

// 4. robustness: the lessons with the lines moved
(function () {
  function withConfig(mut, fn) { var saved = JSON.stringify(C); mut(); try { return fn(); } finally { var back = JSON.parse(saved); for (var k in back) C[k] = back[k]; } }
  function lessons() {
    var b0 = M.best(0), b1 = M.best(1);
    var phys = play(0, H[5][1]).across, paper0 = play(0, H[6][1]).across, paperA = play(1, H[6][1]).across, up = play(1, H[8][1]).across;
    return { earthThenGun: b0.first.feet === C.STOPS.field && b0.first.guns === 1 && b0.first.men > 0 && paper0 === b0.across, wallAlone: phys < b0.across, upstream: b1.first.landing === 'up' && b1.first.feet === C.STOPS.musket && up === b1.across && paperA < up };
  }
  var base = lessons();
  check('base: earth then a gun at the battery; a wall without a gun leaves the rest waiting; a thin wall and a boat of men upstream', base.earthThenGun && base.wallAlone && base.upstream, JSON.stringify(base));
  var r3 = withConfig(function () { C.STOPS.field = 3; }, lessons);
  check('field piece needs 3 ft instead of 4: the lessons hold', r3.earthThenGun && r3.wallAlone && r3.upstream, JSON.stringify(r3));
  var r5 = withConfig(function () { C.STOPS.field = 5; }, lessons);
  check('field piece needs 5 ft: the wall, a gun and soldiers no longer fit the great hull (5·2 + 2 = 12), so the earth-then-gun lesson falls, as the memo says', !r5.earthThenGun, JSON.stringify(r5));
  var g1 = withConfig(function () { C.GUN_T = 1; }, lessons);
  check('a gun of 1 ton: the battery lessons hold; the shallow-boat lesson changes (a 1-ton gun fits at A), as the memo says', g1.earthThenGun && g1.wallAlone, JSON.stringify(g1));
  var g3 = withConfig(function () { C.GUN_T = 3; }, lessons);
  check('a gun of 3 tons: the lessons hold', g3.earthThenGun && g3.wallAlone && g3.upstream, JSON.stringify(g3));
  var ob30 = withConfig(function () { C.OPEN_BOAT = 30; }, lessons), ob90 = withConfig(function () { C.OPEN_BOAT = 90; }, lessons);
  check('the rest at thirty or ninety a boat: the lessons hold', ob30.earthThenGun && ob30.wallAlone && ob30.upstream && ob90.earthThenGun && ob90.wallAlone && ob90.upstream);
  var f1 = withConfig(function () { C.FLEET = 1; }, lessons);
  check('a fleet of one: the lessons hold', f1.earthThenGun && f1.wallAlone && f1.upstream, JSON.stringify(f1));
})();

// 5. the frames and the words
(function () {
  var old = /\b(ball|tun|tuns|battery|batteries|parapet|men|gun|guns|foot soldiers)\b/i, dec = /\d\.\d/;
  var bad = [], nFrames = 0, maxFrames = 0, minFrames = 99, aheadBad = [];
  for (var k = 0; k < 2; k++) {
    var L = M.loadings(cr(k));
    L.forEach(function (ld) {
      var s = M.newCrossing(k); var r = M.push(s, ld);
      nFrames += r.frames.length; maxFrames = Math.max(maxFrames, r.frames.length); minFrames = Math.min(minFrames, r.frames.length);
      var l = M.landing(cr(k), ld.landing), need = C.STOPS[l.fire];
      var prev = M.titleBlock(M.newCrossing(k), ld.landing);
      r.frames.forEach(function (f, i) {
        if (old.test(f.text)) bad.push('old word in [' + f.pic + ']: ' + f.text);
        if (dec.test(f.text)) bad.push('decimal in [' + f.pic + ']: ' + f.text);
        if ((f.pic === 'through' || f.pic === 'hit') && new RegExp('needs ' + need + ' ft|stops only in ' + need).test(f.text)) bad.push('through shot names the feet needed: ' + f.text);
        // the title block never runs ahead: nobody across before a landing, nobody lost before the shot
        if (f.tb.across > prev.across && f.pic !== 'land' && f.pic !== 'rest') aheadBad.push('across rose at [' + f.pic + ']');
        if (f.tb.lost > prev.lost && f.pic !== 'sunk' && f.pic !== 'hit') aheadBad.push('lost rose at [' + f.pic + ']');
        if (f.tb.bank.men > prev.bank.men && f.pic !== 'land') aheadBad.push('the far shore filled at [' + f.pic + ']');
        prev = f.tb;
      });
      var last = r.frames[r.frames.length - 1].tb;
      if (last.across !== s.across || last.lost !== s.lost || last.pushesLeft !== C.PUSHES - s.pushes) aheadBad.push('the last frame’s title block is not the state after the push for ' + JSON.stringify(ld));
    });
  }
  check('every push plays in one to four frames (' + minFrames + ' to ' + maxFrames + ' over every loading of both crossings)', minFrames >= 1 && maxFrames <= 4);
  check('plain words only (no ball, tun, battery, parapet, men, gun) and no decimals in any frame', bad.length === 0, bad.slice(0, 3).join(' | '));
  check('no through-shot frame names the feet a shot needs', !bad.some(function (b) { return /names the feet/.test(b); }));
  check('the title block is never ahead of the frames, and ends at the state after the push', aheadBad.length === 0, aheadBad.slice(0, 3).join(' | '));
  var rec = M.record({}, 'field'); check('the record before any shot does not name the feet', !rec.known && !/\d/.test(rec.text), rec.text);
  var g = M.newGame(); M.push(g.crossings[0], { feet: 2, guns: 0, men: 20, landing: 'front' }); var rec2 = M.record(g.known, 'field');
  check('after a through shot the record says only what it went through', rec2.known && /went through 2 ft/.test(rec2.text) && !/4/.test(rec2.text), rec2.text);
  M.replay(g, 0); M.push(g.crossings[0], { feet: 5, guns: 0, men: 20, landing: 'front' }); var rec3 = M.record(g.known, 'field');
  check('after a stuck shot the record says how far it went in (the feet needed less a half)', /3½ ft/.test(rec3.text), rec3.text);
  var v = M.gameVerdict(g), vw = [v.fate, v.cost].concat(v.per.map(function (p) { return p.lines.join(' ') + ' ' + p.paperLine; })).join(' '); check('the verdict’s words carry no decimal', !dec.test(vw));
  var sum = M.sumLine(cr(0), { feet: 1, guns: 1, men: 10 }); check('the sum line reads in plain words: ' + sum, /earth 1 ft \+ 1 cannon \+ 10 soldiers = 5 tons of 12/.test(sum));
})();

out.push(''); out.push(fails ? fails + ' FAILED' : 'all checks pass (' + out.filter(function (l) { return /^PASS/.test(l); }).length + ')');
console.log(out.join('\n'));
process.exit(fails ? 1 : 0);
