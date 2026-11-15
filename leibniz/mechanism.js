// Leibniz's Worlds: the mechanism, headless and the only copy. Runs unchanged in Node (module.exports) and in the
// browser (window.LeibnizMechanism). Everything that moves an outcome lives here: the generator that draws the four
// worlds for a game (seeded, so a draw can be replayed), the solver that proves each draw carries its lesson, letting
// a thing be, putting it out, ending a world, the lamp, and the words of the per-world lines and the verdict. The
// interface only passes actions in and draws what comes back.
(function (root) {
'use strict';

// ---------------------------------------------------------------------------------------------------------------
// CONFIG: every tunable number and word, tagged with its source in the paper (Strickland's translation, 2014; page
// numbers are the PDF's) or with the design reason. The paper has no numbers; the toy's numbers are all ours and say so.
// ---------------------------------------------------------------------------------------------------------------
var CONFIG = {
  // A world is a set of possibles. Each has a weight (p. 2: possibles "strive with equal right for existence in
  // proportion to their quantity of essence or reality"), and some pairs cannot both exist (p. 2: not all possibles are
  // compossible; "unless you use some skill, you will in the end be excluded from certain spaces"). The worlds are drawn
  // fresh for every game by the generator below (design, 15 Nov: a fixed arrangement gives its answer away on the second
  // play), each draw checked by the solver for the one thing its world is there to show.
  SKY: { W: 320, H: 300, margin: 10, gap: 16 },        // the sky in px; gap: least space between two stars' edges
  COLOURS: { coral: '#FF5C5C', amber: '#FFB830', mint: '#2FE3A3', azure: '#4F9DFF', lilac: '#B48CFF', rose: '#FF7AB6', ice: '#9FE8FF', gold: '#F6E27A' },
  // Star size on screen: radius in px for weight w (memo §13; weight 9 is three times the radius of weight 1). Our choice.
  radius: function (w) { return 9 + 2.6 * w; },
  // Generator ranges (all ours). Each world's lesson, from the paper, is the condition the solver checks on every draw.
  GEN: {
    // World 1: more wants to be than can be together; even the best world leaves things out (p. 2, "forced to leave
    // more spaces empty than you could have or wished to"). n stars, m disjoint pairs; the best leaves at least minOut out.
    world1: { n: [5, 7], pairs: [2, 3], minOut: 2 },
    // World 2: the grandest thing need not be in the best world (p. 4–5, the best whole is not the sum of the best
    // parts). One big star that cannot be with k lesser ones worth more together, plus a few others; the heaviest-first
    // player ends at least `gap` below the best.
    world2: { big: [8, 9], k: [3, 5], small: [2, 4], extra: [1, 3], extraW: [1, 4], gap: 4 },
    // World 3: a step back can be the way to a fuller world (p. 6, "stepping back in order to make a leap forward").
    // A sky filled by weight, heaviest first; exactly one lit star whose putting-out opens the way to the best, and it is
    // not the biggest; putting the biggest out opens nothing.
    world3: { n: [7, 8], weights: [2, 8], pairs: [4, 6], minDark: 3 },
    // World 4, the lamp: Leibniz's covered picture (p. 4–5: "cover up all but a small part ... a confused chaos of
    // colours"; the men in the salt mines of Sarmatia who take their torchlight for all the light there is). Two worlds
    // already made, on the same sky: a small lit star holds a big dark one down. In one the big one is also held by
    // holders worth more together; in the other nothing but the small one holds it. The player has two torches for the
    // two worlds, strikes them where they choose and sees faintly for a moment; says what they saw; then chooses the other
    // star, or leaves the world; sees what that did, in the dark; then the cover lifts.
    lamp: { n: [7, 8], small: [1, 3], big: [7, 9], holders: [2, 3], holderW: [3, 5], otherW: [2, 6], dist: [80, 110] }
  },
  // The torch (design, 15 Nov, his): one tap places it; for a few seconds the stars and lines inside its glow show
  // faintly, then it dies. radius in px; seconds it burns; how bright the lines and rings show (1 = as in daylight). Ours.
  TORCH: { count: 2, radius: 115, full: 3, fade: 3, lineLight: 0.3, starLight: 0.35 },   // two torches for the two worlds; seconds at full strength, seconds fading
  // Words for how much of the best world's light a world lacks (memo §3: direction first, rough size). Ours.
  SHORT_WORDS: [[0, 'as full as it can be'], [0.12, 'a little short'], [0.2, 'about a sixth short'], [0.29, 'about a quarter short'],
    [0.4, 'about a third short'], [0.6, 'about half short'], [1.01, 'mostly dark']]
};

// ---------------------------------------------------------------------------------------------------------------
// Random numbers (seeded, so a game can be replayed and the check can run many draws).
// ---------------------------------------------------------------------------------------------------------------
function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function rint(rng, lo, hi) { return lo + Math.floor(rng() * (hi - lo + 1)); }
function shuffle(rng, a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rng() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
function pick(rng, a) { return a[Math.floor(rng() * a.length)]; }

// ---------------------------------------------------------------------------------------------------------------
// Worlds. A world: stars [{id, w, x, y, i, status, by, known}], pairs [[id, id]], and bookkeeping.
// status: 'lit' (exists), 'dark' (shut out by a lit star), 'wait' (could exist, does not yet).
// ---------------------------------------------------------------------------------------------------------------
var TITLES = ['Light up the sky.', 'Light up the sky.', 'Make this world fuller.'];
var LESSONS = ['Not everything that could exist can exist together.', 'The grandest thing need not be in the best world.', 'A step back can be the way to a fuller world.'];
function pairKey(a, b) { return a < b ? a + '|' + b : b + '|' + a; }
function makeWorld(spec) {
  var stars = spec.stars.map(function (s, i) { return { id: s.id, w: s.w, x: s.x, y: s.y, i: i, status: 'wait', by: [], known: false }; });
  var world = { k: spec.k, title: spec.title || TITLES[spec.k], lesson: spec.lesson || LESSONS[spec.k], stars: stars, pairs: spec.pairs.map(function (p) { return p.slice(); }),
    ended: false, stepsBack: 0, putOut: [], acted: 0, prefilled: !!spec.prefill, best: null, knownPairs: [], key: spec.key || null };
  if (spec.prefill) fillByWeight(world);
  world.best = solve(world);
  return world;
}
function star(world, id) { for (var i = 0; i < world.stars.length; i++) if (world.stars[i].id === id) return world.stars[i]; return null; }
function conflicts(world, id) { var out = []; world.pairs.forEach(function (p) { if (p[0] === id) out.push(p[1]); else if (p[1] === id) out.push(p[0]); }); return out; }
function settle(world) {
  world.stars.forEach(function (s) { if (s.status !== 'lit') { s.status = 'wait'; s.by = []; } else s.known = true; });
  world.stars.forEach(function (s) {
    if (s.status !== 'lit') return;
    conflicts(world, s.id).forEach(function (o) { var t = star(world, o); if (t.status !== 'lit') { t.status = 'dark'; t.by.push(s.id); var k = pairKey(s.id, o); if (world.knownPairs.indexOf(k) < 0) world.knownPairs.push(k); } });
  });
}
function pairKnown(world, p) { return world.knownPairs.indexOf(pairKey(p[0], p[1])) >= 0; }
function lit(world) { return world.stars.filter(function (s) { return s.status === 'lit'; }); }
function light(world) { return lit(world).reduce(function (a, s) { return a + s.w; }, 0); }
function total(world) { return world.stars.reduce(function (a, s) { return a + s.w; }, 0); }
function name(s) { return 'the ' + s.id + ' star'; }
function list(names) { if (names.length === 0) return 'nothing'; if (names.length === 1) return names[0]; return names.slice(0, -1).join(', ') + ' and ' + names[names.length - 1]; }
function biggest(world) { return world.stars.slice().sort(function (a, b) { return b.w - a.w || a.i - b.i; })[0]; }
// Fill by weight: heaviest first, whatever can still be (our picture of "heavy bodies ... in proportion to their weight",
// p. 3). Used only to make world 3's starting sky; the player's own worlds hold exactly what the player lit.
function fillByWeight(world) {
  for (;;) {
    var c = world.stars.filter(function (s) { return s.status === 'wait'; }); if (!c.length) break;
    c.sort(function (a, b) { return b.w - a.w || a.i - b.i; }); c[0].status = 'lit'; settle(world);
  }
}

// ---------------------------------------------------------------------------------------------------------------
// Actions. Each returns { ok, line }: the sentence the game says first about what the move did.
// ---------------------------------------------------------------------------------------------------------------
function letBe(world, id) {
  var s = star(world, id);
  if (world.ended || !s) return { ok: false, line: '' };
  if (s.status === 'lit') return putOut(world, id);
  if (s.status === 'dark') {
    var holders = s.by.map(function (b) { return name(star(world, b)); });
    return { ok: false, line: name(s) + ' cannot be: ' + list(holders) + ' shut it out. Put ' + (s.by.length > 1 ? 'them' : 'it') + ' out first.' };
  }
  s.status = 'lit'; s.by = [];
  var before = world.stars.filter(function (t) { return t.status === 'dark'; }).map(function (t) { return t.id; });
  settle(world); world.acted++;
  var shut = world.stars.filter(function (t) { return t.status === 'dark' && before.indexOf(t.id) < 0; }).map(name);
  return { ok: true, line: name(s) + ' exists.' + (shut.length ? ' It shut out ' + list(shut) + '.' : ' It shut nothing out.') };
}
function putOut(world, id) {
  var s = star(world, id);
  if (world.ended || !s || s.status !== 'lit') return { ok: false, line: '' };
  s.status = 'wait'; s.by = [];
  var before = world.stars.filter(function (t) { return t.status === 'wait'; }).map(function (t) { return t.id; });
  settle(world); world.acted++;
  var freed = world.stars.filter(function (t) { return t.status === 'wait' && before.indexOf(t.id) < 0 && t.id !== id; }).map(name);
  world.stepsBack++; world.putOut.push(id);
  return { ok: true, line: 'You put ' + name(s) + ' out: a step back.' + (freed.length ? ' Now ' + list(freed) + ' can be.' : ' Nothing new can be.') };
}
// Let it be: the world is what you lit, no more (design, 15 Nov: nothing is chosen for the player). In the first two
// skies it needs at least one thing lit by hand; in the third, leaving the sky as weight made it is itself the decision.
function canEnd(world) { return !world.ended && (world.prefilled || world.acted > 0); }
function letItBe(world) { if (!canEnd(world)) return null; world.ended = true; return result(world); }

// ---------------------------------------------------------------------------------------------------------------
// The solver: exact maximum of total weight over sets with no excluded pair (every subset; at most 2^8). Returns
// { light, ids, unique } where unique says no other set reaches the maximum.
// ---------------------------------------------------------------------------------------------------------------
function solve(world, weightOf) {
  var n = world.stars.length, best = { light: -1, ids: [], unique: true };
  var wf = weightOf || function (s) { return s.w; };
  var idx = {}; world.stars.forEach(function (s, i) { idx[s.id] = i; });
  var bad = world.pairs.map(function (p) { return [idx[p[0]], idx[p[1]]]; });
  for (var m = 0; m < (1 << n); m++) {
    var ok = true;
    for (var b = 0; b < bad.length; b++) if ((m >> bad[b][0] & 1) && (m >> bad[b][1] & 1)) { ok = false; break; }
    if (!ok) continue;
    var L = 0, ids = [];
    for (var i = 0; i < n; i++) if (m >> i & 1) { L += wf(world.stars[i]); ids.push(world.stars[i].id); }
    if (L > best.light + 1e-9) best = { light: L, ids: ids, unique: true }; else if (Math.abs(L - best.light) < 1e-9) best.unique = false;
  }
  return best;
}
function solveWith(world, id) {
  var n = world.stars.length, best = -1, idx = {}; world.stars.forEach(function (s, i) { idx[s.id] = i; });
  var bad = world.pairs.map(function (p) { return [idx[p[0]], idx[p[1]]]; });
  for (var m = 0; m < (1 << n); m++) {
    if (!(m >> idx[id] & 1)) continue;
    var ok = true; for (var b = 0; b < bad.length; b++) if ((m >> bad[b][0] & 1) && (m >> bad[b][1] & 1)) { ok = false; break; }
    if (!ok) continue;
    var L = 0; for (var i = 0; i < n; i++) if (m >> i & 1) L += world.stars[i].w;
    if (L > best) best = L;
  }
  return best;
}
// Heaviest-first play by hand: let the heaviest waiting star be until nothing waits; never step back.
function playGreedy(world) { for (;;) { var c = world.stars.filter(function (s) { return s.status === 'wait'; }); if (!c.length) break; c.sort(function (a, b) { return b.w - a.w || a.i - b.i; }); letBe(world, c[0].id); } return letItBe(world); }
function playBest(world) { lit(world).forEach(function (s) { if (world.best.ids.indexOf(s.id) < 0) putOut(world, s.id); }); world.best.ids.forEach(function (id) { if (star(world, id).status !== 'lit') letBe(world, id); }); return letItBe(world); }
function playRandom(world, rnd) { var n = 3 + Math.floor(rnd() * 5); for (var t = 0; t < n; t++) { var c = world.stars.filter(function (s) { return s.status !== 'dark'; }); if (!c.length) break; letBe(world, c[Math.floor(rnd() * c.length)].id); } if (!canEnd(world)) letBe(world, world.stars[0].id); return letItBe(world); }

// ---------------------------------------------------------------------------------------------------------------
// Layout: stars placed at random in the sky so that no two touch, no line passes through a third star's glow, and no
// two lines cross (the eye reads a line through a star as that star's line; design, 15 Nov). Returns positions or null.
// ---------------------------------------------------------------------------------------------------------------
function segDist(p, a, b) { var dx = b.x - a.x, dy = b.y - a.y; var tt = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / (dx * dx + dy * dy || 1))); return Math.hypot(p.x - (a.x + tt * dx), p.y - (a.y + tt * dy)); }
function segCross(a, b, c, d) { var o = function (p, q, r) { return Math.sign((q.x - p.x) * (r.y - p.y) - (q.y - p.y) * (r.x - p.x)); }; return o(a, b, c) !== o(a, b, d) && o(c, d, a) !== o(c, d, b); }
function layoutOk(stars, pairs) {
  var R = CONFIG.radius, idx = {}; stars.forEach(function (s, i) { idx[s.id] = i; });
  for (var i = 0; i < stars.length; i++) for (var j = i + 1; j < stars.length; j++) if (Math.hypot(stars[i].x - stars[j].x, stars[i].y - stars[j].y) < R(stars[i].w) + R(stars[j].w) + CONFIG.SKY.gap) return false;
  var P = pairs.map(function (p) { return [stars[idx[p[0]]], stars[idx[p[1]]]]; });
  for (i = 0; i < P.length; i++) {
    for (j = 0; j < stars.length; j++) { var s = stars[j]; if (s === P[i][0] || s === P[i][1]) continue; if (segDist(s, P[i][0], P[i][1]) < R(s.w) * 1.7 + 6) return false; }
    for (j = i + 1; j < P.length; j++) { var a = P[i][0], b = P[i][1], c = P[j][0], d = P[j][1]; if (a !== c && a !== d && b !== c && b !== d && segCross(a, b, c, d)) return false; }
  }
  return true;
}
// fixed: {id: {x, y}} positions to keep (the lamp world's two opening stars).
function layout(rng, stars, pairs, fixed, tries) {
  var S = CONFIG.SKY, R = CONFIG.radius;
  for (var t = 0; t < (tries || 120); t++) {
    var placed = [], ok = true;
    for (var i = 0; i < stars.length && ok; i++) {
      var s = stars[i], r = R(s.w), done = false;
      if (fixed && fixed[s.id]) { placed.push({ id: s.id, w: s.w, x: fixed[s.id].x, y: fixed[s.id].y }); continue; }
      for (var a = 0; a < 60 && !done; a++) {
        var x = S.margin + r + rng() * (S.W - 2 * (S.margin + r)), y = S.margin + r + rng() * (S.H - 2 * (S.margin + r));
        var clear = placed.every(function (q) { return Math.hypot(q.x - x, q.y - y) >= R(q.w) + r + S.gap; });
        if (clear) { placed.push({ id: s.id, w: s.w, x: Math.round(x), y: Math.round(y) }); done = true; }
      }
      if (!done) ok = false;
    }
    if (ok && layoutOk(placed, pairs)) return placed;
  }
  return null;
}
function colours(rng, n) { return shuffle(rng, Object.keys(CONFIG.COLOURS)).slice(0, n); }

// ---------------------------------------------------------------------------------------------------------------
// The generator. Each function draws until a draw passes its lesson's test (rejection sampling); the test is what the
// calibration check re-runs over many seeds.
// ---------------------------------------------------------------------------------------------------------------
function genWorld1(rng) {
  var G = CONFIG.GEN.world1;
  for (var t = 0; t < 400; t++) {
    var n = rint(rng, G.n[0], G.n[1]), m = rint(rng, G.pairs[0], G.pairs[1]);
    var ws = shuffle(rng, [1, 2, 3, 4, 5, 6, 7]).slice(0, n), ids = colours(rng, n);
    var order = shuffle(rng, ids), pairs = [];
    for (var i = 0; i < m && 2 * i + 1 < n; i++) pairs.push([order[2 * i], order[2 * i + 1]]);
    var stars = ids.map(function (id, j) { return { id: id, w: ws[j] }; });
    var pos = layout(rng, stars, pairs); if (!pos) continue;
    var spec = { k: 0, title: 'Light up the sky.', lesson: 'Not everything that could exist can exist together.', stars: pos, pairs: pairs };
    var w = makeWorld(spec);
    if (w.stars.length - w.best.ids.length < G.minOut || !w.best.unique) continue;
    return spec;
  }
  return null;
}
function genWorld2(rng) {
  var G = CONFIG.GEN.world2;
  for (var t = 0; t < 400; t++) {
    var B = rint(rng, G.big[0], G.big[1]), k = rint(rng, G.k[0], G.k[1]), e = rint(rng, G.extra[0], G.extra[1]);
    var n = 1 + k + e; if (n > 8) continue;
    var ids = colours(rng, n), ws = [B];
    for (var i = 0; i < k; i++) ws.push(rint(rng, G.small[0], G.small[1]));
    for (i = 0; i < e; i++) ws.push(rint(rng, G.extraW[0], G.extraW[1]));
    var smallSum = ws.slice(1, 1 + k).reduce(function (a, b) { return a + b; }, 0); if (smallSum < B + 3) continue;
    var pairs = []; for (i = 1; i <= k; i++) pairs.push([ids[0], ids[i]]);
    // one or two pairs among the others, or from an other to a small, so the big one is not the only thing to find
    var others = ids.slice(1 + k), extraPairs = rint(rng, 1, Math.min(2, Math.max(1, others.length)));
    for (i = 0; i < extraPairs; i++) { var a = pick(rng, others), b = pick(rng, ids.slice(1)); if (a !== b && !pairs.some(function (p) { return pairKey(p[0], p[1]) === pairKey(a, b); })) pairs.push([a, b]); }
    var stars = ids.map(function (id, j) { return { id: id, w: ws[j] }; });
    var pos = layout(rng, stars, pairs); if (!pos) continue;
    var spec = { k: 1, title: 'Light up the sky.', lesson: 'The grandest thing need not be in the best world.', stars: pos, pairs: pairs };
    var w = makeWorld(spec);
    if (w.best.ids.indexOf(ids[0]) >= 0 || !w.best.unique) continue;
    if (biggest(w).id !== ids[0] || w.stars.filter(function (s) { return s.w === B; }).length !== 1) continue;
    var g = playGreedy(makeWorld(spec)); if (g.light > w.best.light - G.gap) continue;
    return spec;
  }
  return null;
}
function genWorld3(rng) {
  var G = CONFIG.GEN.world3;
  for (var t = 0; t < 2000; t++) {
    var n = rint(rng, G.n[0], G.n[1]), m = rint(rng, G.pairs[0], G.pairs[1]);
    var ids = colours(rng, n), ws = [];
    for (var i = 0; i < n; i++) ws.push(rint(rng, G.weights[0], G.weights[1]));
    var mx = Math.max.apply(null, ws); if (ws.filter(function (x) { return x === mx; }).length !== 1) continue;
    var all = []; for (i = 0; i < n; i++) for (var j = i + 1; j < n; j++) all.push([ids[i], ids[j]]);
    var pairs = shuffle(rng, all).slice(0, m);
    var stars = ids.map(function (id, j) { return { id: id, w: ws[j] }; });
    var spec = { k: 2, title: 'Make this world fuller.', lesson: 'A step back can be the way to a fuller world.', stars: stars, pairs: pairs, prefill: true };
    var w = makeWorld(spec);
    if (!w.best.unique || light(w) >= w.best.light) continue;
    if (w.stars.filter(function (s) { return s.status === 'dark'; }).length < G.minDark) continue;
    // exactly one lit star whose putting-out frees exactly the stars that, lit, make the best world
    var keys = [], bigOpens = false, big = biggest(w);
    lit(w).forEach(function (s) {
      var w2 = makeWorld(spec); putOut(w2, s.id);
      var freed = w2.stars.filter(function (x) { return x.status === 'wait' && x.id !== s.id; }).map(function (x) { return x.id; });
      if (s.id === big.id && freed.length) bigOpens = true;
      var set = lit(w2).map(function (x) { return x.id; }).concat(freed).sort().join(',');
      if (set === w.best.ids.slice().sort().join(',')) keys.push(s.id);
    });
    if (keys.length !== 1 || keys[0] === big.id || star(w, big.id).status !== 'lit' || bigOpens) continue;
    var pos = layout(rng, stars, pairs); if (!pos) continue;
    spec.stars = pos; spec.key = keys[0];
    return spec;
  }
  return null;
}
// The lamp world: two worlds on one sky. Returns { skies: [specA, specB] } in random order, each spec carrying `full`.
function genLamp(rng) {
  var G = CONFIG.GEN.lamp, S = CONFIG.SKY;
  for (var t = 0; t < 600; t++) {
    var n = rint(rng, G.n[0], G.n[1]), h = rint(rng, G.small[0], G.small[1]), B = rint(rng, G.big[0], G.big[1]), nh = rint(rng, G.holders[0], G.holders[1]);
    var ids = colours(rng, n), ws = [h, B];
    for (var i = 0; i < nh; i++) ws.push(rint(rng, G.holderW[0], G.holderW[1]));
    for (i = 2 + nh; i < n; i++) ws.push(rint(rng, G.otherW[0], G.otherW[1]));
    var holdSum = ws.slice(2, 2 + nh).reduce(function (a, b) { return a + b; }, 0); if (holdSum <= B) continue;
    if (ws.slice(2).some(function (x) { return x >= B; })) continue;
    // the two opening stars near the middle, a set distance apart, at a random angle
    var ang = rng() * Math.PI * 2, d = rint(rng, G.dist[0], G.dist[1]);
    var cx = S.W / 2 + (rng() - .5) * 40, cy = S.H / 2 + (rng() - .5) * 30;
    var fixed = {}; fixed[ids[0]] = { x: Math.round(cx - Math.cos(ang) * d / 2), y: Math.round(cy - Math.sin(ang) * d / 2) };
    fixed[ids[1]] = { x: Math.round(cx + Math.cos(ang) * d / 2), y: Math.round(cy + Math.sin(ang) * d / 2) };
    var pairsA = [[ids[1], ids[0]]]; for (i = 0; i < nh; i++) pairsA.push([ids[1], ids[2 + i]]);
    var pairsB = [[ids[1], ids[0]]];
    var stars = ids.map(function (id, j) { return { id: id, w: ws[j] }; });
    var pos = layout(rng, stars, pairsA, fixed); if (!pos) continue;
    var R = CONFIG.radius; if (pos.some(function (s) { return s.x - R(s.w) < 2 || s.x + R(s.w) > S.W - 2 || s.y - R(s.w) < 2 || s.y + R(s.w) > S.H - 2; })) continue;
    var litIds = ids.filter(function (id) { return id !== ids[1]; });
    var mk = function (pairs, full) { return { k: 3, stars: pos, pairs: pairs, lit: litIds, small: ids[0], big: ids[1], full: full }; };
    var A = makeLampWorld(mk(pairsA, true)), Bw = makeLampWorld(mk(pairsB, false));
    if (light(A) !== A.best.light || !A.best.unique) continue;
    if (light(Bw) >= Bw.best.light || !Bw.best.unique || Bw.best.ids.indexOf(ids[1]) < 0 || Bw.best.light - light(Bw) !== B - h) continue;
    var skies = rng() < .5 ? [mk(pairsA, true), mk(pairsB, false)] : [mk(pairsB, false), mk(pairsA, true)];
    return { skies: skies };
  }
  return null;
}
function makeLampWorld(spec) {
  var stars = spec.stars.map(function (s, i) { return { id: s.id, w: s.w, x: s.x, y: s.y, i: i, status: spec.lit.indexOf(s.id) >= 0 ? 'lit' : 'wait', by: [], known: false }; });
  var w = { k: 3, stars: stars, pairs: spec.pairs.map(function (p) { return p.slice(); }), ended: false, full: spec.full, small: spec.small, big: spec.big,
    torches: [], reading: null, act: null, before: 0, after: 0, stepsBack: 0, putOut: [], acted: 0, knownPairs: [], prefilled: true };
  settle(w); w.best = solve(w); w.before = light(w); return w;
}
function newJudge(rng) { var g = genLamp(rng); if (!g) return null; return { kind: 'torch', skies: g.skies.map(makeLampWorld), torchesLeft: CONFIG.TORCH.count, radius: CONFIG.TORCH.radius, full: CONFIG.TORCH.full, fade: CONFIG.TORCH.fade }; }
// Strike a torch at (x, y) in sky j. Torches are shared across the two skies. Returns false if none is left or the sky is past looking.
function strike(J, j, x, y) {
  var s = J.skies[j]; if (s.reading || s.act || J.torchesLeft <= 0) return false;
  s.torches.push({ x: x, y: y }); J.torchesLeft--; return true;
}
// Whether any torch struck in sky j lit a line from the big star to one of its holders (not the small one).
function torchSawHolders(J, j) {
  var s = J.skies[j], bg = star(s, s.big);
  return s.torches.some(function (tc) { return conflicts(s, s.big).filter(function (id) { return id !== s.small; }).some(function (id) { return segDist(tc, bg, star(s, id)) <= J.radius; }); });
}
// What the player says they saw: 'lines', 'none' or 'unsure'. Ends the looking.
function read(J, j, answer) { var s = J.skies[j]; if (s.reading || s.act) return false; s.reading = answer; return true; }
function readingWord(a) { return a === 'lines' ? 'you saw lines' : a === 'none' ? 'you saw none' : "you couldn't tell"; }
// Decide: 'other' chooses the other star (the small one goes out; the big one comes in if nothing else holds it);
// 'leave' leaves the world. A reading must have been given first.
function decide(J, j, act) {
  var s = J.skies[j]; if (s.act || !s.reading) return null;
  s.act = act; s.came = [];
  if (act === 'other') { putOut(s, s.small); var b = star(s, s.big); if (b.status === 'wait') { letBe(s, s.big); s.came = [s.big]; } }
  s.ended = true; s.after = light(s);
  return { consequence: consequence(J, j), reveal: lampReveal(J, j) };
}
// What the act did, said in the dark, before the cover lifts.
function consequence(J, j) {
  var s = J.skies[j];
  if (s.act === 'leave') return 'You left it. The world stays as it was.';
  return s.came.length ? 'The small star went out, and the big one came in. Nothing else was holding it.' : 'The small star went out. The big one stayed dark: something else is holding it.';
}
function lampReveal(J, j) {
  var s = J.skies[j], sm = star(s, s.small), bg = star(s, s.big);
  var holders = conflicts(s, s.big).filter(function (id) { return id !== s.small; }).map(function (id) { return star(s, id).w; });
  var whole = s.full ? 'The whole: the ' + bg.w + ' was held down by the ' + sm.w + ' and by ' + holders.length + ' more things worth ' + holders.join(' + ') + ' together. Without it the sky holds ' + s.before + '; with it, less. This world was as full as it can be.'
    : 'The whole: nothing but the ' + sm.w + ' held the ' + bg.w + ' down. With the ' + sm.w + ' out and the ' + bg.w + ' in, the sky holds ' + s.best.light + ' instead of ' + s.before + '. This world was ' + (s.best.light - s.before) + ' short.';
  var n = s.torches.length;
  var used = (n === 0 ? 'You struck no torch here.' : (n === 1 ? 'Your torch ' : 'Your torches ') + (torchSawHolders(J, j) ? 'lit the lines that mattered, for a moment.' : (s.full ? 'burned where the lines that mattered were not.' : 'showed no line to the big one but the one you knew; there was none.'))) +
    ' You said ' + readingWord(s.reading) + (s.reading === 'lines' ? (s.full ? ', and there were.' : ', but there were none.') : s.reading === 'none' ? (s.full ? ', but there were.' : ', and there were none.') : '.');
  var line = s.act === 'other' ? (s.came.length ? 'You chose the other star: the ' + sm.w + ' went out and the ' + bg.w + ' came in, ' + (s.after - s.before) + ' more light than before.'
      : 'You chose the other star: the ' + sm.w + ' went out and the ' + bg.w + ' stayed dark, ' + (s.before - s.after) + ' less light than before.')
    : (s.full ? 'You left it, and it holds all it could.' : 'You left it, and it holds ' + s.after + ' where it could hold ' + s.best.light + '.');
  return { line: whole + ' ' + used + ' ' + line, good: s.after === s.best.light };
}

// ---------------------------------------------------------------------------------------------------------------
// A game: three skies and the lamp, drawn from a seed.
// ---------------------------------------------------------------------------------------------------------------
function newGame(seed) {
  if (seed === undefined || seed === null) seed = Math.floor(Math.random() * 1e9);
  var rng = mulberry32(seed);
  var specs = [genWorld1(rng), genWorld2(rng), genWorld3(rng)];
  if (specs.some(function (s) { return !s; })) return newGame(seed + 7919);
  var judge = newJudge(rng); if (!judge) return newGame(seed + 7919);
  return { seed: seed, worlds: specs.map(makeWorld), judge: judge, current: 0 };
}

// ---------------------------------------------------------------------------------------------------------------
// Words: the per-world result and the verdict.
// ---------------------------------------------------------------------------------------------------------------
function shortWords(L, best) { var gap = best > 0 ? (best - L) / best : 0; for (var i = 0; i < CONFIG.SHORT_WORDS.length; i++) if (gap <= CONFIG.SHORT_WORDS[i][0] + 1e-9) return CONFIG.SHORT_WORDS[i][1]; return CONFIG.SHORT_WORDS[CONFIG.SHORT_WORDS.length - 1][1]; }
function result(world) {
  var L = light(world), B = world.best.light, out = world.stars.filter(function (s) { return s.status !== 'lit'; }).map(name);
  var lines = ['Your world holds ' + L + ' of light. The best possible world holds ' + B + '.'];
  if (world.k === 0) {
    var bestOut = world.stars.length - world.best.ids.length;
    lines.push('Left out of yours: ' + list(out) + '.');
    lines.push((L === B ? 'Yours is as full as a world can be, and it still leaves ' : 'Even the best possible world leaves ') + (bestOut === 1 ? 'one thing' : bestOut + ' things') + ' dark: ' + world.lesson.toLowerCase());
  } else if (world.k === 1) {
    var big = biggest(world), bigLit = star(world, big.id).status === 'lit', held = conflicts(world, big.id).map(function (o) { return name(star(world, o)); });
    lines.push('The best possible world does not hold ' + name(big) + ', the most of anything.');
    if (bigLit) lines.push('You kept the grandest thing, and it is what left the sky dark: it shut out ' + list(held) + '.');
    else if (L === B) lines.push('You left the grandest thing out, and the lesser things it would have shut out lit more than it ever could.');
    else lines.push('You left the grandest thing out, but something else stayed dark: ' + list(out) + '.');
  } else {
    var key = star(world, world.key), stepped = world.putOut.indexOf(world.key) >= 0;
    if (world.stepsBack === 0) lines.push('You put nothing out, so nothing could come in. ' + world.lesson);
    else lines.push('You stepped back ' + (world.stepsBack === 1 ? 'once' : world.stepsBack === 2 ? 'twice' : world.stepsBack + ' times') + '.' +
      (L === B ? ' Putting ' + name(key) + ' out opened the way, and the world is full.' : stepped ? ' Putting ' + name(key) + ' out opened the way, but not everything it freed was lit.' : ' Nothing you put out opened more than it closed. Putting ' + name(key) + ' out would have.'));
  }
  return { light: L, best: B, lines: lines, words: shortWords(L, B), leftOut: out, lit: lit(world).map(function (s) { return s.id; }) };
}
function verdict(game) {
  var W = game.worlds, full = W.filter(function (w) { return light(w) === w.best.light; }).length;
  var head = full === 3 ? 'All three of your skies are as full as they can be.' : full === 0 ? 'None of your skies is as full as it could be.' :
    (full === 1 ? 'One' : 'Two') + ' of your three skies ' + (full === 1 ? 'is' : 'are') + ' as full as ' + (full === 1 ? 'it' : 'they') + ' can be.';
  var says = 'Leibniz: the world that exists is the set of possible things that holds the most together. Not everything possible can exist; the grandest thing need not be in the best world; a step back can be the way to a fuller world; and from a part you cannot tell whether the whole is well made.';
  var found = W.map(function (w, k) {
    var L = light(w), B = w.best.light, out = w.stars.filter(function (s) { return s.status !== 'lit'; }).map(name);
    if (k === 0) return 'World 1: your world held ' + L + ' of light' + (L === B ? ', as much as it could,' : '') + ' and left out ' + list(out) + '.';
    if (k === 1) { var big = biggest(w); return 'World 2: ' + (star(w, big.id).status === 'lit' ? 'you kept ' + name(big) + ', the grandest thing, and your world was ' + shortWords(L, B) + '.' : 'you left ' + name(big) + ' out, and your world ' + (L === B ? 'was full.' : 'was ' + shortWords(L, B) + '.')); }
    return 'World 3: ' + (w.stepsBack === 0 ? 'you put nothing out, and the world stayed as weight had made it.' : 'you stepped back ' + (w.stepsBack === 1 ? 'once' : w.stepsBack === 2 ? 'twice' : w.stepsBack + ' times') + ', and the world ended ' + (L === B ? 'full: the step back was the way forward.' : shortWords(L, B) + '.'));
  });
  var J = game.judge;
  var jl = J.skies.map(function (s, j) {
    var looked = (s.torches.length === 0 ? 'without a torch' : s.torches.length === 1 ? 'by one torch' : 'by two torches') + ' (' + readingWord(s.reading) + ')';
    var what = s.act === 'other' ? 'chose the other star' : 'left it';
    var got = s.act === 'other' ? (s.came.length ? 'and the big one came in' : 'and the big one stayed dark') : (s.full ? 'and it was as full as it can be' : 'and it stayed short');
    return 'in the ' + (j === 0 ? 'first' : 'second') + ', ' + looked + ', you ' + what + ', ' + got;
  });
  found.push('World 4: the same small star holding the same big one down in both; ' + jl[0] + '; ' + jl[1] + '.');
  var part = W.map(function (w, k) { return light(w) < w.best.light ? 'world ' + (k + 1) + ' (' + (w.best.light - light(w)) + ' of light short)' : null; }).filter(Boolean);
  var where = part.length ? 'On ' + list(part) + ', the best possible world holds more than yours.' : 'Nowhere among the skies you made. On every one, yours holds all that could be.';
  var stood = part.length ? 'A world with less in it than there could have been. Leibniz says that cannot be the one that exists: the possibles push, and the fullest set is what comes through, the way weights settle.' : 'Yours is the one Leibniz says exists: the fullest set of things that can be together.';
  var cover = 'Leibniz: take a very beautiful picture and cover all but a small part. What you see is a confused chaos of colours, and the closer you look the worse it gets. Lift the cover and the whole is the work of a master. Every dark star in the best world is the price of a brighter sky; but a dark star in a world that is not the best is just a mistake, and the two look the same by torchlight.';
  return { head: head, says: says, found: found, where: where, stood: stood, cover: cover, full: full };
}

var M = { CONFIG: CONFIG, newGame: newGame, makeWorld: makeWorld, makeLampWorld: makeLampWorld, genWorld1: genWorld1, genWorld2: genWorld2, genWorld3: genWorld3, genLamp: genLamp,
  mulberry32: mulberry32, letBe: letBe, putOut: putOut, letItBe: letItBe, canEnd: canEnd, result: result, verdict: verdict, solve: solve, solveWith: solveWith,
  light: light, total: total, lit: lit, star: star, conflicts: conflicts, name: name, list: list, biggest: biggest, shortWords: shortWords, pairKnown: pairKnown,
  layoutOk: layoutOk, playGreedy: playGreedy, playRandom: playRandom, playBest: playBest, strike: strike, torchSawHolders: torchSawHolders, read: read, readingWord: readingWord, decide: decide, consequence: consequence, lampReveal: lampReveal, segDist: segDist };
if (typeof module !== 'undefined' && module.exports) module.exports = M; else root.LeibnizMechanism = M;
})(typeof window !== 'undefined' ? window : this);
