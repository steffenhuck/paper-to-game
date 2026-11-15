// Leibniz's Worlds: the mechanism, headless and the only copy. Runs unchanged in Node (module.exports) and in the
// browser (window.LeibnizMechanism). Everything that moves an outcome lives here: the three worlds, letting a thing be,
// putting it out, the striving at "Let it be" (the rush-in), the exact solver that finds the best possible world, the
// heuristics the calibration check plays, and the words of the per-world lines and the verdict. The interface only
// passes actions in and draws what comes back.
(function (root) {
'use strict';

// ---------------------------------------------------------------------------------------------------------------
// CONFIG: every tunable number and word, tagged with its source in the paper (Strickland's translation, 2014; page
// numbers are the PDF's) or with the design reason. The paper has no numbers; the toy's numbers are all ours and say so.
// ---------------------------------------------------------------------------------------------------------------
var CONFIG = {
  // A world is a set of possibles. Each possible has a weight (p. 2: possibles "strive with equal right for existence in
  // proportion to their quantity of essence or reality"), and some pairs cannot both exist (p. 2: not all possibles are
  // compossible; "unless you use some skill, you will in the end be excluded from certain spaces"). The weights, the
  // pairs and the three worlds are ours, chosen so that each world holds exactly one thing to find out; the calibration
  // check proves the properties stated here. Colours name the stars on screen; x, y place them in a 320 x 300 sky.
  WORLDS: [
    { title: 'Light up the sky.',
      stars: [
        { id: 'coral', w: 5, x: 80, y: 80 },
        { id: 'amber', w: 4, x: 240, y: 80 },
        { id: 'mint', w: 3, x: 262, y: 205 },
        { id: 'azure', w: 3, x: 62, y: 215 },
        { id: 'rose', w: 2, x: 160, y: 150 },
        { id: 'lilac', w: 1, x: 165, y: 262 }
      ],
      pairs: [['coral', 'azure'], ['amber', 'mint'], ['rose', 'lilac']],
      prefill: false,
      // 18 of light wants to be; the best world holds 11 and leaves three things dark (p. 2, not all possibles are
      // compossible: "forced to leave more spaces empty than you could have or wished to").
      lesson: 'Not everything that could exist can exist together.' },
    { title: 'Light up the sky.',
      stars: [
        { id: 'coral', w: 9, x: 160, y: 150 },
        { id: 'amber', w: 4, x: 60, y: 70 },
        { id: 'mint', w: 4, x: 260, y: 70 },
        { id: 'azure', w: 4, x: 60, y: 235 },
        { id: 'lilac', w: 4, x: 260, y: 235 },
        { id: 'rose', w: 3, x: 100, y: 32 },
        { id: 'ice', w: 2, x: 225, y: 32 }
      ],
      pairs: [['coral', 'amber'], ['coral', 'mint'], ['coral', 'azure'], ['coral', 'lilac'], ['rose', 'ice']],
      prefill: false,
      // 30 of light wants to exist. With the coral star (the most of anything) the most a world can hold is 12; without it
      // the four it shuts out light 16, and with the rose star the world holds 19. The heaviest-first player ends
      // at 12 (p. 2, "unless you use some skill").
      lesson: 'The grandest thing need not be in the best world.' },
    { title: 'Make this world fuller.',
      stars: [
        { id: 'coral', w: 8, x: 75, y: 95 },
        { id: 'amber', w: 6, x: 215, y: 90 },
        { id: 'mint', w: 4, x: 275, y: 180 },
        { id: 'azure', w: 4, x: 240, y: 260 },
        { id: 'lilac', w: 3, x: 175, y: 262 },
        { id: 'rose', w: 5, x: 60, y: 235 },
        { id: 'ice', w: 5, x: 140, y: 160 }
      ],
      pairs: [['amber', 'mint'], ['amber', 'azure'], ['amber', 'lilac'], ['rose', 'ice']],
      prefill: true,
      // 35 of light wants to exist. Filled by weight, heaviest first (our picture of "heavy bodies ... in proportion to
      // their weight", p. 3): coral, amber and rose are lit, 19; mint, azure, lilac and ice are shut out; nothing left
      // can be. Put the amber star out and the three it shut out come in: 24, the best possible world (p. 6, "stepping
      // back in order to make a leap forward with greater force"). Put the coral star out and nothing comes in; put the
      // rose star out and the ice star takes its place, no fuller.
      lesson: 'A step back can be the way to a fuller world.' }
  ],
  // World 4: the window (p. 4–5: men "in the subterranean salt mines of Sarmatia" judge the world by their torchlight;
  // "look at a very beautiful picture, then cover up all but a small part ... a confused chaos of colours"). Two worlds,
  // the same stars in the same places, each already made; through the window the player sees the same thing in both:
  // a lit 2, a dark 9, a red line between them. The player may light a torch TORCHES times, anywhere, to see more, and
  // then either puts the 2 out (so that the 9 may be) or leaves the world as it is. In the first world the 9 is also
  // held down by three 4s, so putting the 2 out gains nothing and loses 2; in the second nothing but the 2 holds the 9,
  // and putting it out lets the 9 in. Stars, pairs, the window and the torch are ours.
  JUDGE: {
    window: { x: 90, y: 95, w: 140, h: 110 },
    TORCHES: 2, TORCH_RADIUS: 62,
    stars: [
      { id: 'ice', w: 2, x: 115, y: 150 },
      { id: 'coral', w: 9, x: 205, y: 150 },
      { id: 'mint', w: 4, x: 298, y: 88 },
      { id: 'azure', w: 4, x: 300, y: 150 },
      { id: 'lilac', w: 4, x: 298, y: 212 },
      { id: 'rose', w: 3, x: 48, y: 45 },
      { id: 'amber', w: 5, x: 50, y: 255 }
    ],
    lit: ['ice', 'mint', 'azure', 'lilac', 'rose', 'amber'],
    skies: [
      { pairs: [['coral', 'ice'], ['coral', 'mint'], ['coral', 'azure'], ['coral', 'lilac']], full: true,
        whole: 'The whole: the 9 was being held down by the 2 and by three 4s. Without it the sky holds 22; with it, at most 17. This world was as full as it can be.' },
      { pairs: [['coral', 'ice']], full: false,
        whole: 'The whole: nothing but the 2 was holding the 9 down. With the 2 out and the 9 in, the sky holds 29 instead of 22. This world was 7 short.' }
    ],
    lesson: 'The same window, two worlds. In one the dark 9 was the price of a fuller sky; in the other it was a mistake. Nothing in the window told them apart. Only more light could, and you had to go and get it.'
  },
  // Star colours by id (memo §13: existence is light). Our choice.
  COLOURS: { coral: '#FF5C5C', amber: '#FFB830', mint: '#2FE3A3', azure: '#4F9DFF', lilac: '#B48CFF', rose: '#FF7AB6', ice: '#9FE8FF' },
  // Star size on screen: radius in px for weight w (memo §13; the eye reads area, so weight 9 is three times the radius of
  // weight 1). Our choice.
  radius: function (w) { return 9 + 2.6 * w; },
  // What the player is shown (design, 15 Nov): a pair's line appears only once one of the two has shut the other out, and
  // a star's number only once it has been lit; before that, a ring and its size. The possibles' claims and exclusions
  // are found by letting things be, not read off the screen. The best possible world, once shown, shows everything.
  SHOWN: 'lines and numbers are found, not given',
  // The striving at "Let it be": whatever still can exist comes to be, heaviest first, ties by order in the sky (p. 2,
  // possibles "strive with equal right for existence in proportion to their quantity of essence"; p. 3, "even if nothing
  // further is determined, there exists as much as is possible"). The order is ours. A thing the player put out stays
  // out: "Let it be" means the player's decisions stand and only the undecided come in (design; otherwise the step back
  // of world 3 would be undone by the striving the moment the world ends).
  RUSH_ORDER: 'heaviest first; what the player put out stays out',
  // What the calibration check expects (memo §11 and §17); the solver is what establishes them.
  EXPECT: { best: [11, 19, 24], totals: [18, 30, 35], judgeLit: [22, 22], judgeBest: [22, 29], world2WithCoralMax: 12, world2GreedyLit: 12,
    world3PrefillLit: 19, world3PutOutAmber: 24, world3PutOutCoral: 11, world3PutOutRose: 19 },
  // Words for how much of the best world's light a world lacks (memo §3 "Numbers on screen": direction first, rough
  // size). Fractions of the best. Our choice.
  SHORT_WORDS: [[0, 'as full as it can be'], [0.12, 'a little short'], [0.2, 'about a sixth short'], [0.29, 'about a quarter short'],
    [0.4, 'about a third short'], [0.6, 'about half short'], [1.01, 'mostly dark']]
};

// ---------------------------------------------------------------------------------------------------------------
// State. A game is three worlds played in order; a world is the stars with a status each: 'lit' (exists), 'dark'
// (shut out by a lit star), 'wait' (could exist, does not yet).
// ---------------------------------------------------------------------------------------------------------------
function newWorld(k) {
  var w = CONFIG.WORLDS[k];
  var stars = w.stars.map(function (s, i) { return { id: s.id, w: s.w, x: s.x, y: s.y, i: i, status: 'wait', by: [], known: false }; });
  var world = { k: k, title: w.title, lesson: w.lesson, stars: stars, pairs: w.pairs.slice(), ended: false, stepsBack: 0,
    putOut: [], history: [], prefilled: !!w.prefill, best: null, rushed: [], knownPairs: [] };
  if (w.prefill) prefillByWeight(world);
  world.best = solve(world);
  return world;
}
function judgeSky(j) {
  var J = CONFIG.JUDGE, S = J.skies[j];
  var stars = J.stars.map(function (s, i) { return { id: s.id, w: s.w, x: s.x, y: s.y, i: i, status: J.lit.indexOf(s.id) >= 0 ? 'lit' : 'wait', by: [], known: true }; });
  var world = { k: 3, j: j, stars: stars, pairs: S.pairs.slice(), ended: false, full: S.full, whole: S.whole, torches: [], act: null, before: 0, after: 0, stepsBack: 0, putOut: [], history: [], rushed: [] };
  settle(world); world.best = solve(world); world.before = light(world); return world;
}
function newJudge() { return { kind: 'judge', skies: [judgeSky(0), judgeSky(1)], lesson: CONFIG.JUDGE.lesson, window: CONFIG.JUDGE.window, torches: CONFIG.JUDGE.TORCHES, radius: CONFIG.JUDGE.TORCH_RADIUS }; }
// Light a torch at (x, y) in sky j: a circle of the cover lifts there. Returns false when no torch is left.
function look(J, j, x, y) {
  var s = J.skies[j]; if (s.act || s.torches.length >= J.torches) return false;
  s.torches.push({ x: x, y: y }); return true;
}
// Decide: 'out' puts the 2 out and lets whatever then can be come in; 'leave' leaves the world. Ends the sky.
function decide(J, j, act) {
  var s = J.skies[j]; if (s.act) return null;
  s.act = act;
  var came = [];
  if (act === 'out') { putOut(s, 'ice'); came = rushIn(s); }
  s.ended = true; s.after = light(s); s.came = came;
  return judgeReveal(J, j);
}
// What the game says when the cover lifts on sky j.
function judgeReveal(J, j) {
  var s = J.skies[j], line;
  var looked = s.torches.length === 0 ? 'You lit no torch.' : s.torches.length === 1 ? 'You lit one torch.' : 'You lit ' + s.torches.length + ' torches.';
  if (s.act === 'out') {
    line = s.came.length ? 'You put the 2 out, and the 9 came in: the sky holds ' + s.after + ' now, ' + (s.after - s.before) + ' more than it did.'
      : 'You put the 2 out, and nothing came in: the 9 stayed dark. The sky holds ' + s.after + ' now, ' + (s.before - s.after) + ' less than it did.';
  } else {
    line = s.full ? 'You left it, and it holds ' + s.after + ': all it could.' : 'You left it, and it holds ' + s.after + ' where it could hold ' + s.best.light + '.';
  }
  return { line: s.whole + ' ' + looked + ' ' + line, good: s.after === s.best.light };
}
function newGame() { return { worlds: [newWorld(0), newWorld(1), newWorld(2)], judge: newJudge(), current: 0 }; }
function star(world, id) { for (var i = 0; i < world.stars.length; i++) if (world.stars[i].id === id) return world.stars[i]; return null; }
function conflicts(world, id) {
  var out = [];
  world.pairs.forEach(function (p) { if (p[0] === id) out.push(p[1]); else if (p[1] === id) out.push(p[0]); });
  return out;
}
// Recompute who is shut out by whom from the lit set alone (so putting a star out frees exactly what only it held down).
function pairKey(a, b) { return a < b ? a + '|' + b : b + '|' + a; }
function settle(world) {
  world.stars.forEach(function (s) { if (s.status !== 'lit') { s.status = 'wait'; s.by = []; } else s.known = true; });
  world.stars.forEach(function (s) {
    if (s.status !== 'lit') return;
    conflicts(world, s.id).forEach(function (o) { var t = star(world, o); if (t.status !== 'lit') { t.status = 'dark'; t.by.push(s.id); var k = pairKey(s.id, o); if (world.knownPairs && world.knownPairs.indexOf(k) < 0) world.knownPairs.push(k); } });
  });
}
function pairKnown(world, p) { return !world.knownPairs || world.knownPairs.indexOf(pairKey(p[0], p[1])) >= 0; }
function lit(world) { return world.stars.filter(function (s) { return s.status === 'lit'; }); }
function light(world) { return lit(world).reduce(function (a, s) { return a + s.w; }, 0); }
function total(world) { return world.stars.reduce(function (a, s) { return a + s.w; }, 0); }
function name(s) { return 'the ' + s.id + ' star'; }
function list(names) {
  if (names.length === 0) return 'nothing';
  if (names.length === 1) return names[0];
  return names.slice(0, -1).join(', ') + ' and ' + names[names.length - 1];
}

// ---------------------------------------------------------------------------------------------------------------
// Actions. Each returns { ok, line } where line is the sentence the game says, before anything else, about what the
// move did (build.md §4: the result of a move stated by the game itself).
// ---------------------------------------------------------------------------------------------------------------
function letBe(world, id) {
  var s = star(world, id);
  if (world.ended || !s) return { ok: false, line: '' };
  if (s.status === 'lit') return putOut(world, id);
  if (s.status === 'dark') {
    var holders = s.by.map(function (b) { return name(star(world, b)); });
    return { ok: false, line: name(s) + ' cannot be: ' + list(holders) + (s.by.length > 1 ? ' shut it out. Put them out first.' : ' shut it out. Put it out first.') };
  }
  s.status = 'lit'; s.by = []; s.out = false;
  var before = world.stars.filter(function (t) { return t.status === 'dark'; }).map(function (t) { return t.id; });
  settle(world);
  var shut = world.stars.filter(function (t) { return t.status === 'dark' && before.indexOf(t.id) < 0; }).map(name);
  world.history.push({ act: 'let', id: id, shut: shut.length });
  var line = name(s) + ' exists.';
  if (shut.length) line += ' It shut out ' + list(shut) + '.';
  else line += ' It shut nothing out.';
  return { ok: true, line: line };
}
function putOut(world, id) {
  var s = star(world, id);
  if (world.ended || !s || s.status !== 'lit') return { ok: false, line: '' };
  s.status = 'wait'; s.by = []; s.out = true;
  var before = world.stars.filter(function (t) { return t.status === 'wait'; }).map(function (t) { return t.id; });
  settle(world);
  var freed = world.stars.filter(function (t) { return t.status === 'wait' && before.indexOf(t.id) < 0 && t.id !== id; }).map(name);
  world.stepsBack++; world.putOut.push(id);
  world.history.push({ act: 'out', id: id, freed: freed.length });
  var line = 'You put ' + name(s) + ' out: a step back.';
  if (freed.length) line += ' Now ' + list(freed) + (freed.length > 1 ? ' can be.' : ' can be.');
  else line += ' Nothing new can be.';
  return { ok: true, line: line };
}
// The striving: whatever still can exist comes to be, heaviest first. Returns the ids that rushed in, in order.
function rushIn(world) {
  var came = [];
  for (;;) {
    var cands = world.stars.filter(function (s) { return s.status === 'wait' && !s.out; });
    if (!cands.length) break;
    cands.sort(function (a, b) { return b.w - a.w || a.i - b.i; });
    cands[0].status = 'lit'; cands[0].by = []; came.push(cands[0].id);
    settle(world);
  }
  return came;
}
function prefillByWeight(world) { rushIn(world); }
function letItBe(world) {
  if (world.ended) return null;
  world.rushed = rushIn(world);
  world.ended = true;
  return result(world);
}

// ---------------------------------------------------------------------------------------------------------------
// The solver: exact maximum of total weight over sets with no excluded pair (brute force over every subset; the worlds
// have at most seven stars, so 128 sets). Returns { light, ids }.
// ---------------------------------------------------------------------------------------------------------------
function solve(world, weightOf) {
  var n = world.stars.length, best = { light: -1, ids: [] };
  var wf = weightOf || function (s) { return s.w; };
  var idx = {}; world.stars.forEach(function (s, i) { idx[s.id] = i; });
  var bad = world.pairs.map(function (p) { return [idx[p[0]], idx[p[1]]]; });
  for (var m = 0; m < (1 << n); m++) {
    var ok = true;
    for (var b = 0; b < bad.length; b++) if ((m >> bad[b][0] & 1) && (m >> bad[b][1] & 1)) { ok = false; break; }
    if (!ok) continue;
    var L = 0, ids = [];
    for (var i = 0; i < n; i++) if (m >> i & 1) { L += wf(world.stars[i]); ids.push(world.stars[i].id); }
    if (L > best.light) best = { light: L, ids: ids };
  }
  return best;
}
// The most a world can hold with a given star forced in.
function solveWith(world, id) {
  var n = world.stars.length, best = -1;
  var idx = {}; world.stars.forEach(function (s, i) { idx[s.id] = i; });
  var bad = world.pairs.map(function (p) { return [idx[p[0]], idx[p[1]]]; });
  for (var m = 0; m < (1 << n); m++) {
    if (!(m >> idx[id] & 1)) continue;
    var ok = true;
    for (var b = 0; b < bad.length; b++) if ((m >> bad[b][0] & 1) && (m >> bad[b][1] & 1)) { ok = false; break; }
    if (!ok) continue;
    var L = 0; for (var i = 0; i < n; i++) if (m >> i & 1) L += world.stars[i].w;
    if (L > best) best = L;
  }
  return best;
}

// ---------------------------------------------------------------------------------------------------------------
// Words: the per-world result and the verdict.
// ---------------------------------------------------------------------------------------------------------------
function shortWords(L, best) {
  var gap = best > 0 ? (best - L) / best : 0;
  for (var i = 0; i < CONFIG.SHORT_WORDS.length; i++) if (gap <= CONFIG.SHORT_WORDS[i][0] + 1e-9) return CONFIG.SHORT_WORDS[i][1];
  return CONFIG.SHORT_WORDS[CONFIG.SHORT_WORDS.length - 1][1];
}
function biggest(world) { return world.stars.slice().sort(function (a, b) { return b.w - a.w || a.i - b.i; })[0]; }
function result(world) {
  var L = light(world), B = world.best.light;
  var out = world.stars.filter(function (s) { return s.status !== 'lit'; }).map(name);
  var big = biggest(world), bigIn = world.best.ids.indexOf(big.id) >= 0, bigLit = star(world, big.id).status === 'lit';
  var lines = [];
  var rushed = world.rushed.map(function (id) { return name(star(world, id)); });
  if (rushed.length) lines.push('Nothing stopped ' + list(rushed) + ', so ' + (rushed.length > 1 ? 'they' : 'it') + ' came to be.');
  var heads = ['Your world holds ' + L + ' of light. The best possible world holds ' + B + '.'];
  if (world.k === 0) {
    lines.push('Left out of yours: ' + list(out) + '.');
    lines.push(L === B ? 'Yours is as full as a world can be, and it still leaves something out: ' + world.lesson.toLowerCase()
      : 'Even the best possible world leaves something out: ' + world.lesson.toLowerCase());
  } else if (world.k === 1) {
    lines.push('The best possible world is ' + (bigIn ? 'built around ' : 'full, and ') + name(big) + (bigIn ? '.' : ', the most of anything, is not in it.'));
    if (bigLit) lines.push('You kept the grandest thing, and it is what left the sky dark: it shut out ' + list(conflicts(world, big.id).map(function (o) { return name(star(world, o)); })) + '.');
    else if (L === B) lines.push('You left the grandest thing out, and four lesser things lit more than it ever could.');
    else lines.push('You left the grandest thing out, but something else stayed dark: ' + list(out) + '.');
  } else {
    if (world.stepsBack === 0) lines.push('You put nothing out, so nothing could come in. ' + world.lesson);
    else {
      var amber = world.putOut.indexOf('amber') >= 0;
      lines.push('You stepped back ' + (world.stepsBack === 1 ? 'once' : world.stepsBack === 2 ? 'twice' : world.stepsBack + ' times') + '.' +
        (L === B ? ' Putting ' + name(star(world, 'amber')) + ' out let three lesser things in, and the world is full.' :
          amber ? ' The world got fuller, but something was lost on the way.' : ' Nothing you put out let more in than it took away.'));
    }
  }
  return { light: L, best: B, lines: heads.concat(lines), words: shortWords(L, B), leftOut: out, lit: lit(world).map(function (s) { return s.id; }) };
}
function verdict(game) {
  var W = game.worlds, full = W.filter(function (w) { return light(w) === w.best.light; }).length;
  var head = full === 3 ? 'All three of your worlds are as full as they can be.' : full === 0 ? 'None of your worlds is as full as it could be.' :
    (full === 1 ? 'One' : 'Two') + ' of your three worlds ' + (full === 1 ? 'is' : 'are') + ' as full as ' + (full === 1 ? 'it' : 'they') + ' can be.';
  var says = 'Leibniz: the world that exists is the set of possible things that holds the most together. Not everything possible can exist; the grandest thing need not be in the best world; a step back can be the way to a fuller world; and from a part you cannot tell whether the whole is well made.';
  var found = W.map(function (w, k) {
    var L = light(w), B = w.best.light, out = w.stars.filter(function (s) { return s.status !== 'lit'; }).map(name);
    if (k === 0) return 'World 1: your world held ' + L + ' of light' + (L === B ? ', as much as it could,' : '') + ' and left out ' + list(out) + '.';
    if (k === 1) { var big = biggest(w); return 'World 2: ' + (star(w, big.id).status === 'lit' ? 'you kept ' + name(big) + ', the grandest thing, and your world was ' + shortWords(L, B) + '.' : 'you left ' + name(big) + ' out, and your world ' + (L === B ? 'was full.' : 'was ' + shortWords(L, B) + '.')); }
    if (k === 2) return 'World 3: ' + (w.stepsBack === 0 ? 'you put nothing out, and the world stayed as weight had made it.' : 'you stepped back ' + (w.stepsBack === 1 ? 'once' : w.stepsBack === 2 ? 'twice' : w.stepsBack + ' times') + ', and the world ended ' + (L === B ? 'full: the step back was the way forward.' : shortWords(L, B) + '.'));
  });
  var J = game.judge;
  var jl = J.skies.map(function (s, j) {
    var what = s.act === 'out' ? 'put the 2 out' : 'left it';
    var got = s.act === 'out' ? (s.came.length ? 'and the 9 came in: 7 gained' : 'and nothing came in: 2 lost') : (s.full ? 'and it was as full as it can be' : 'and it stayed 7 short');
    return 'in the ' + (j === 0 ? 'first' : 'second') + ' you ' + (s.torches.length ? 'lit ' + (s.torches.length === 1 ? 'a torch' : s.torches.length + ' torches') + ' and ' : '') + what + ', ' + got;
  });
  found.push('World 4: through the same window, ' + jl[0] + '; ' + jl[1] + '.');
  var part = W.map(function (w, k) { return light(w) < w.best.light ? 'world ' + (k + 1) + ' (' + (w.best.light - light(w)) + ' of light short)' : null; }).filter(Boolean);
  var where = part.length ? 'On ' + list(part) + ', the best possible world holds more than yours.' : 'Nowhere. On every world, yours holds all that could be.';
  var stood = part.length ? 'A world with less in it than there could have been. Leibniz says that cannot be the one that exists: the possibles push, and the fullest set is what comes through, the way weights settle.' : 'Yours is the one Leibniz says exists: the fullest set of things that can be together.';
  var cover = 'Leibniz: take a very beautiful picture and cover all but a small part. What you see is a confused chaos of colours, and the closer you look the worse it gets. Lift the cover and the whole is the work of a master. Every dark star in the best world is the price of a brighter sky; but a dark star in a world that is not the best is just a mistake, and the two look the same up close.';
  return { head: head, says: says, found: found, where: where, stood: stood, cover: cover, full: full };
}

// ---------------------------------------------------------------------------------------------------------------
// Heuristics the calibration check plays (build.md §3): heaviest-first, random, and the best play.
// ---------------------------------------------------------------------------------------------------------------
function playGreedy(world) { // let the heaviest waiting star be until nothing waits; never step back
  for (;;) { var c = world.stars.filter(function (s) { return s.status === 'wait'; }); if (!c.length) break; c.sort(function (a, b) { return b.w - a.w || a.i - b.i; }); letBe(world, c[0].id); }
  return letItBe(world);
}
function playRandom(world, rnd) {
  var n = 3 + Math.floor(rnd() * 5);
  for (var t = 0; t < n; t++) { var c = world.stars.filter(function (s) { return s.status !== 'dark'; }); if (!c.length) break; var s = c[Math.floor(rnd() * c.length)]; letBe(world, s.id); }
  return letItBe(world);
}
function playBest(world) {
  lit(world).forEach(function (s) { if (world.best.ids.indexOf(s.id) < 0) putOut(world, s.id); });
  world.best.ids.forEach(function (id) { if (star(world, id).status !== 'lit') letBe(world, id); });
  return letItBe(world);
}

var M = { CONFIG: CONFIG, newGame: newGame, newWorld: newWorld, newJudge: newJudge, look: look, decide: decide, judgeReveal: judgeReveal, pairKnown: pairKnown, letBe: letBe, putOut: putOut, letItBe: letItBe, result: result, verdict: verdict,
  solve: solve, solveWith: solveWith, light: light, total: total, lit: lit, star: star, conflicts: conflicts, name: name, list: list,
  shortWords: shortWords, playGreedy: playGreedy, playRandom: playRandom, playBest: playBest, rushIn: rushIn };
if (typeof module !== 'undefined' && module.exports) module.exports = M; else root.LeibnizMechanism = M;
})(typeof window !== 'undefined' ? window : this);
