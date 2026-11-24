// Calibration check for Leibniz's Flatboat (memo §17). The mechanism is a toy built from the paper's method, so there are
// no reported numbers to hit; what is checked is (1) that the one rule the paper states is run as written; (2) that the
// three crossings' best loadings, found by exhaustive search, are the memo's and (where the memo says so) unique in the first
// push; (3) the heuristics table of build.md §3, with every wrong branch the memo names losing for the reason the paper
// names; (4) that the lessons survive moving the lines we drew; (5) the words. Run: node calibration.js  (exit 1 on failure)
var M = require('./mechanism.js'), C = M.CONFIG;
var fails = 0, out = [];
function check(name, ok, detail) { out.push((ok ? 'PASS ' : 'FAIL ') + name + (detail !== undefined ? '  — ' + detail : '')); if (!ok) fails++; }
function play(k, strategy) { var s = M.newCrossing(k); while (!s.over) M.push(s, strategy(s, C.CROSSINGS[k], s.pushes + 1)); return s; }
function cr(k) { return C.CROSSINGS[k]; }

// 1. the carrying rule as written
(function () {
  var g = cr(0), ok = true, n = 0;
  for (var f = 0; f <= C.MAX_FEET; f++) for (var gn = 0; gn <= C.MAX_GUNS; gn++) for (var m = 0; m <= C.MAX_MEN; m += C.MEN_STEP) {
    var ld = { feet: f, guns: gn, men: m }, w = f * C.FOOT_T + gn * C.GUN_T + m * C.MAN_T; n++;
    if (M.floats(g, ld) !== (w <= C.HULLS.great.tuns + 1e-9)) ok = false;
    if (M.floats(cr(2), ld) !== (w <= C.HULLS.shallow.tuns + 1e-9)) ok = false;
    if (w <= C.HULLS.great.tuns && Math.abs(M.draught(g, ld) - w / C.HULLS.great.tuns) > 1e-9) ok = false;
  }
  check('a boat carries the weight of the water it could hold: floats iff load ≤ tons, draught = load / tons (' + n + ' loadings, both hulls)', ok);
  check('earth is heavier than the hollow can hold: 6 ft of wall alone (' + 6 * C.FOOT_T + ' tons) sinks the shallow boat and fills the great one', !M.floats(cr(2), { feet: 6, guns: 0, men: 0 }) && M.floats(g, { feet: 6, guns: 0, men: 0 }) && !M.floats(g, { feet: 6, guns: 0, men: 10 }));
  var s = M.newCrossing(0), r = M.push(s, { feet: 6, guns: 1, men: 0, landing: 'front' });
  check('an overloaded boat sinks at the bank and the push is lost', r.outcome === 'sinks' && s.across === 0 && s.pushes === 1);
  var o = M.newCrossing(0), ro = M.push(o, { feet: 0, guns: 0, men: 60, landing: 'front' }, { opening: true });
  check('the general’s opening boat is shot through and changes nothing: no push used, nothing across, the bank untouched', ro.outcome === 'through' && o.pushes === 0 && o.across === 0 && o.banks.front.men === 0 && o.openingDone && ro.frames.length === 4);
})();

// 2. the best loadings
(function () {
  var want = [620, 660, 640], firsts = [{ feet: 4, guns: 1, men: 20, landing: 'front' }, { feet: 1, guns: 0, men: 60, landing: 'front' }, { feet: 1, guns: 0, men: 40, landing: 'up' }];
  for (var k = 0; k < 3; k++) {
    var b = M.best(k);
    check('crossing ' + (k + 1) + ' (' + cr(k).title + '): best by exhaustive search = ' + want[k], b.across === want[k], 'got ' + b.across + ' with ' + JSON.stringify(b.seq));
    check('crossing ' + (k + 1) + ': the best is reached on the first push', b.seq.length === 1);
    check('crossing ' + (k + 1) + ': the memo’s first push is among the best', b.firsts.some(function (f) { return f.feet === firsts[k].feet && f.guns === firsts[k].guns && f.men === firsts[k].men && f.landing === firsts[k].landing; }), JSON.stringify(b.firsts));
    if (k !== 1) check('crossing ' + (k + 1) + ': that first push is unique', b.firsts.length === 1, b.firsts.length + ' loadings tie');
    else check('crossing 2: every best first push carries 60 men and a wall of at least 1 ft (guns and extra feet are neutral here)', b.firsts.every(function (f) { return f.men === 60 && f.feet >= 1; }));
    check('crossing ' + (k + 1) + ': the best first push weighs exactly the hull or less', M.floats(cr(k), b.first));
  }
  check('crossing 1: the best first push fills the hull to the tun (4 ft + a gun + 20 men = 12)', Math.abs(M.weight({ feet: 4, guns: 1, men: 20 }) - 12) < 1e-9);
  check('crossing 3: the shallow boat cannot carry the wall their small cannons need, a cannon, and any soldiers (2 ft + a cannon = ' + (2 * C.FOOT_T + C.GUN_T) + ' tons of 6)', !M.floats(cr(2), { feet: 2, guns: 1, men: 10 }));
  check('crossing 3: the shallow boat cannot be made proof against field pieces at all (4 ft = ' + 4 * C.FOOT_T + ' tons of 6)', !M.floats(cr(2), { feet: 4, guns: 0, men: 0 }));
})();

// 3. the heuristics table (build.md §3)
(function () {
  var H = {
    'all men (60, no earth, no gun)':                 function (s, c) { return { feet: 0, guns: 0, men: 60, landing: 'front' }; },
    'firepower (as many guns as float, then men)':    function (s, c) { var g = Math.min(C.MAX_GUNS, Math.floor(M.hull(c).tuns / C.GUN_T)); var m = Math.min(60, Math.floor((M.hull(c).tuns - g * C.GUN_T) / C.MAN_T / 10) * 10); return { feet: 0, guns: g, men: m, landing: 'front' }; },
    'earth to the brim (no men)':                     function (s, c) { return { feet: Math.min(C.MAX_FEET, Math.floor(M.hull(c).tuns / C.FOOT_T)), guns: 0, men: 0, landing: 'front' }; },
    'the spreader (2 ft, a gun, the rest men)':        function (s, c) { var m = Math.min(60, Math.floor((M.hull(c).tuns - 2 * C.FOOT_T - C.GUN_T) / C.MAN_T / 10) * 10); return { feet: 2, guns: 1, men: Math.max(0, m), landing: 'front' }; },
    'the physicist (just enough wall, then men, no gun)': function (s, c) { var l = c.landings[0], f = C.STOPS[l.fire]; var m = Math.min(60, Math.floor((M.hull(c).tuns - f * C.FOOT_T) / C.MAN_T / 10) * 10); return { feet: f, guns: 0, men: Math.max(0, m), landing: 'front' }; },
    'the paper (just enough wall, a gun where there is a battery, then men)': function (s, c) { var l = c.landings[0], f = C.STOPS[l.fire], g = l.battery ? 1 : 0; var m = Math.min(60, Math.floor((M.hull(c).tuns - f * C.FOOT_T - g * C.GUN_T) / C.MAN_T / 10) * 10); if (m < 10) { g = 0; m = Math.min(60, Math.floor((M.hull(c).tuns - f * C.FOOT_T) / C.MAN_T / 10) * 10); } return { feet: f, guns: g, men: Math.max(0, m), landing: 'front' }; },
    'the crossing-1 recipe everywhere (4 ft, a gun, 20 men)': function (s, c) { return { feet: 4, guns: 1, men: 20, landing: 'front' }; },
    'the paper, and upstream where offered':          function (s, c) { var l = c.landings[c.landings.length - 1], f = C.STOPS[l.fire], g = l.battery ? 1 : 0; var m = Math.min(60, Math.floor((M.hull(c).tuns - f * C.FOOT_T - g * C.GUN_T) / C.MAN_T / 10) * 10); return { feet: f, guns: g, men: m, landing: l.id }; },
    'learns: wrong once, then the paper':             function (s, c, p) { var l = c.landings[c.landings.length - 1]; if (p === 1) return { feet: 0, guns: 1, men: 60, landing: 'front' }; var f = C.STOPS[l.fire], g = l.battery ? 1 : 0; var m = Math.min(60, Math.floor((M.hull(c).tuns - f * C.FOOT_T - g * C.GUN_T) / C.MAN_T / 10) * 10); return { feet: f, guns: g, men: m, landing: l.id }; }
  };
  var bests = [M.best(0).across, M.best(1).across, M.best(2).across], table = [];
  table.push('     strategy'.padEnd(74) + 'c1    c2    c3    total');
  table.push('     ' + 'best possible'.padEnd(69) + bests.map(function (b) { return String(b).padEnd(6); }).join('') + bests.reduce(function (a, b) { return a + b; }, 0));
  var res = {};
  Object.keys(H).forEach(function (name) {
    var row = [0, 1, 2].map(function (k) { return play(k, H[name]).across; }); res[name] = row;
    table.push('     ' + name.padEnd(69) + row.map(function (b) { return String(b).padEnd(6); }).join('') + row.reduce(function (a, b) { return a + b; }, 0));
  });
  out.push('     heuristics (men across by dark, three pushes a crossing):'); out = out.concat(table);
  check('all men: nothing across under cannon or musket (a boat of men is a boat of planks to a ball)', res['all men (60, no earth, no gun)'][0] === 0 && res['all men (60, no earth, no gun)'][1] === 0 && res['all men (60, no earth, no gun)'][2] === 0);
  check('firepower: nothing across anywhere (guns keep nothing off on the water)', res['firepower (as many guns as float, then men)'].every(function (x) { return x === 0; }));
  check('earth to the brim: nothing across (nobody aboard to carry it ashore)', res['earth to the brim (no men)'].every(function (x) { return x === 0; }));
  check('the spreader: through under field pieces; passes under muskets', res['the spreader (2 ft, a gun, the rest men)'][0] === 0 && res['the spreader (2 ft, a gun, the rest men)'][1] === bests[1]);
  check('the physicist (wall but no gun) digs in under the battery but the rest never pass: 120 < 620', res['the physicist (just enough wall, then men, no gun)'][0] === 120);
  check('the physicist is best where there is no battery (crossing 2)', res['the physicist (just enough wall, then men, no gun)'][1] === bests[1]);
  check('the paper’s loading is best in crossings 1 and 2', res['the paper (just enough wall, a gun where there is a battery, then men)'][0] === bests[0] && res['the paper (just enough wall, a gun where there is a battery, then men)'][1] === bests[1]);
  check('the paper’s loading sent at the battery with a shallow boat cannot carry the cannon and any soldiers, so it goes without: dug in, and the rest wait (60 < 640)', res['the paper (just enough wall, a gun where there is a battery, then men)'][2] === 60);
  check('the crossing-1 recipe everywhere: best in 1, short in 2 (four feet where one would do: 20 men instead of 60), sinks in 3', res['the crossing-1 recipe everywhere (4 ft, a gun, 20 men)'][0] === bests[0] && res['the crossing-1 recipe everywhere (4 ft, a gun, 20 men)'][1] === 620 && res['the crossing-1 recipe everywhere (4 ft, a gun, 20 men)'][2] === 0);
  check('the paper, upstream where offered: best everywhere', res['the paper, and upstream where offered'].every(function (x, k) { return x === bests[k]; }));
  check('learning costs one push: ' + res['learns: wrong once, then the paper'].join('/') + ' against ' + bests.join('/'), res['learns: wrong once, then the paper'].every(function (x, k) { return x === bests[k] - C.FLEET * C.OPEN_BOAT; }));
  check('some way of playing goes wrong in every crossing, for a reason the paper names', [0, 1, 2].every(function (k) { return Object.keys(H).some(function (n) { return res[n][k] < bests[k]; }); }));
  // every dial option is taken by some sensible loading in some crossing
  var bestsAll = [0, 1, 2].map(function (k) { return M.best(k).firsts; }).reduce(function (a, b) { return a.concat(b); }, []);
  check('guns: a sensible loading takes 0 and 1 (crossings 2 and 1)', bestsAll.some(function (f) { return f.guns === 0; }) && bestsAll.some(function (f) { return f.guns === 1; }));
  check('earth: sensible loadings take 1 ft and 4 ft', bestsAll.some(function (f) { return f.feet === 1; }) && bestsAll.some(function (f) { return f.feet === 4; }));
  check('men: sensible loadings take 20, 40 and 60', [20, 40, 60].every(function (m) { return bestsAll.some(function (f) { return f.men === m; }); }));
  check('landing: in crossing 3 both landings can land a boat that digs in (A: 2 ft + 20 men; B: 1 ft + 40 men)', (function () { var a = M.newCrossing(2), b = M.newCrossing(2); return M.push(a, { feet: 2, guns: 0, men: 20, landing: 'front' }).landed && M.push(b, { feet: 1, guns: 0, men: 40, landing: 'up' }).landed; })());
})();

// 4. robustness: the lessons survive moving the lines we drew (the core three must; the two crossing-3 lessons are reported)
(function () {
  function lessons() {
    var b0 = M.best(0), b1 = M.best(1), b2 = M.best(2);
    return {
      earthThenGun: b0.firsts.every(function (f) { return f.feet >= C.STOPS.field && f.guns >= 1; }),
      noGunLoses: (function () { var s = M.newCrossing(0); M.push(s, { feet: C.STOPS.field, guns: 0, men: 10, landing: 'front' }); return !s.restPassed; })(),
      thinWhereMuskets: b1.firsts.every(function (f) { return f.men === 60; }) && b1.firsts.some(function (f) { return f.feet === C.STOPS.musket && f.guns === 0; }),
      upstreamBest: b2.firsts.every(function (f) { return f.landing === 'up'; }),
      shallowCannot: !M.floats(cr(2), { feet: C.STOPS.light, guns: 1, men: 10 })
    };
  }
  function core(L) { return L.earthThenGun && L.noGunLoses && L.thinWhereMuskets; }
  function words(L) { return Object.keys(L).map(function (k) { return k + ':' + (L[k] ? 'holds' : 'CHANGES'); }).join(' '); }
  var base = JSON.parse(JSON.stringify({ STOPS: C.STOPS, GUN_T: C.GUN_T, FOOT_T: C.FOOT_T, OPEN_BOAT: C.OPEN_BOAT, FLEET: C.FLEET }));
  function restore() { C.STOPS = JSON.parse(JSON.stringify(base.STOPS)); C.GUN_T = base.GUN_T; C.FOOT_T = base.FOOT_T; C.OPEN_BOAT = base.OPEN_BOAT; C.FLEET = base.FLEET; }
  var L = lessons(); check('baseline: all five lessons hold', core(L) && L.upstreamBest && L.shallowCannot, words(L));
  function vary(name, set, level) { set(); var L = lessons(); check(name, level === 'all' ? (core(L) && L.upstreamBest && L.shallowCannot) : level === 'report' ? true : core(L), words(L)); restore(); }
  vary('field pieces stopped by 3 ft instead of 4: core lessons hold', function () { C.STOPS.field = 3; });
  vary('field pieces need 5 ft: the great boat can no longer carry wall, gun and crew (10 + 2 + half a tun > 12), so the earth-then-gun lesson needs the wall to fit in the hull with a gun and its crew; reported, not required', function () { C.STOPS.field = 5; }, 'report');
  vary('a gun weighs 1 tun: core lessons hold; the shallow boat can then carry wall and gun, so the crossing-3 lesson changes (reported)', function () { C.GUN_T = 1; });
  vary('a gun weighs 3 tons: all lessons hold', function () { C.GUN_T = 3; }, true);
  vary('light pieces stopped by 1 ft: core lessons hold; the crossing-3 lesson needs light pieces to need 2 ft (reported)', function () { C.STOPS.light = 1; });
  vary('the rest pass at 30 a boat: all lessons hold', function () { C.OPEN_BOAT = 30; }, 'all');
  vary('the rest pass at 90 a boat: all lessons hold', function () { C.OPEN_BOAT = 90; }, 'all');
  vary('a fleet of one open boat: all lessons hold', function () { C.FLEET = 1; }, 'all');
  vary('a foot of wall weighs 1 tun: core lessons hold (the shallow boat can then carry wall and gun; reported)', function () { C.FOOT_T = 1; });
  check('restored', JSON.stringify(C.STOPS) === JSON.stringify(base.STOPS) && C.GUN_T === base.GUN_T && C.FOOT_T === base.FOOT_T);
})();

// 5. the words
(function () {
  var bad = [], n = 0, dec = /\d\.\d/;
  for (var k = 0; k < 3; k++) {
    var L = M.loadings(cr(k));
    L.forEach(function (ld) { for (var p = 0; p < 2; p++) { var s = M.newCrossing(k); var r = M.push(s, ld); n++; if (!r.frames.length) bad.push('no frames'); r.frames.forEach(function (fr) { var t = fr.text; if (!fr.pic) bad.push('frame without a picture'); if (dec.test(t)) bad.push(t); if (!t.trim()) bad.push('empty line'); if (/\b(ball|tun|tons|battery|foot|men)\b/.test(t)) bad.push('jargon: ' + t); }); M.crossingVerdict(s).lines.forEach(function (t) { if (dec.test(t)) bad.push(t); }); if (M.sumLine(cr(k), ld).match(dec)) bad.push(M.sumLine(cr(k), ld)); } });
    cr(k).landings.forEach(function (l) { var s = M.newCrossing(k); M.push(s, { feet: 6, guns: 1, men: 60, landing: l.id }); if (s.pushes !== 1) bad.push('sink not counted'); });
  }
  check('every push has frames, each with a picture and a plain sentence; no decimal and no jargon (ball, tun, battery, foot, men) in any frame (' + n + ' pushes, every floating loading, plus the verdicts)', bad.length === 0, bad.slice(0, 3).join(' | '));
  var g = M.newGame(); g.crossings.forEach(function (s, k) { M.push(s, M.best(k).first); });
  var v = M.gameVerdict(g);
  check('a perfect game is the sum of the bests and gets the first fate', v.total === 1920 && v.best === 1920 && v.fate === C.FATES[0].line);
  var g2 = M.newGame(); var v2 = M.gameVerdict(g2);
  check('a game with nothing across gets the last fate', v2.total === 0 && v2.fate === C.FATES[C.FATES.length - 1].line);
  check('tons in words', M.words.tuns(1) === 'a ton' && M.words.tuns(2) === '2 tons' && M.words.tuns(0.1) === 'a tenth of a ton' && M.words.tuns(2.5) === '2 and a half tons' && M.words.tuns(0.5) === 'half a ton');
  out.push('     sample: ' + M.words.tuns(2.5) + ' / ' + M.words.tuns(0.1) + ' / ' + M.words.tuns(11.7));
  var fr = M.push(M.newCrossing(0), { feet: 4, guns: 1, men: 20, landing: 'front' }).frames.map(function (f) { return f.pic; });
  check('the paper’s push plays as: push, fire, stuck, land, wall, drive, rest', fr.join(',') === 'push,fire,stuck,land,wall,drive,rest', fr.join(','));
  var fr2 = M.push(M.newCrossing(0), { feet: 0, guns: 2, men: 40, landing: 'front' }).frames.map(function (f) { return f.pic; });
  check('a boat of cannons and soldiers plays as: push, fire, through, back', fr2.join(',') === 'push,fire,through,back', fr2.join(','));
})();

out.push(''); out.push(fails ? fails + ' FAILED' : 'ALL PASSED (' + out.filter(function (l) { return l.indexOf('PASS') === 0; }).length + ' checks)');
console.log(out.join('\n'));
process.exit(fails ? 1 : 0);
