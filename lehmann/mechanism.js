// Lehmann's Shadow — mechanism. The single source of truth: plain functions, no DOM, no randomness.
// Runs unchanged in Node (calibration.js, loop.js) and in the browser (inlined verbatim by build.py).
// Kind: PORTED. Inge Lehmann's simplified Earth of 1936: straight rays, one constant P-wave speed per shell,
// the law of refraction at each boundary, total reflection where it applies. Everything the paper gives is
// here with its page; everything ours (the posts, the ear, the dials' ranges, the words) says so.
//
// Paper: Kölbl-Ebert (2001), "Inge Lehmann's paper: 'P′' (1936)", Episodes 24(4):262–267, quoting and
// summarising Lehmann (1936), "P′", Publ. Bureau Central Séismologique International A14:87–115. Only the
// Episodes PDF was available; page numbers below are Episodes pages, with Lehmann's own in brackets.
//
// Geometry: a ray leaves the quake at the surface at take-off angle i0 from the downward vertical ("dive").
// Its ray parameter p = r·sin(i)/v is conserved; in a shell of constant speed the ray is a chord. At a boundary
// the angle of incidence i satisfies r_boundary·sin(i) = r0·sin(i0) (same perpendicular distance), and the
// refracted angle i' has sin(i') = (v_in/v_out)·sin(i). A chord at angle a from the radius at its ends
// subtends 180 − 2a at the centre. The epicentral distance Δ is the sum of the central angles of the legs.

var CONFIG = {
  // ---- Lehmann's model Earth (p. 263 [p. 87–88]; Figure 2a, 2b) ------------------------------------
  R0_KM: 6370,                // radius of the Earth, km (p. 263)
  CORE_FRAC: 5 / 9,           // radius of the core as a fraction of r0 (p. 263); 3539 km
  V_MANTLE: 10,               // P-wave speed in the mantle, km/s (p. 263)
  V_CORE: 8,                  // P-wave speed in the core, km/s (p. 263)
  INNER_FRAC: 0.8 * Math.sin(16 * Math.PI / 180), // inner core radius 8/10·r0·sin16° = 0.2205 r0 (p. 264 [p. 97]); 1405 km
  V_INNER: 8.6,               // P-wave speed in the inner core, km/s (p. 264 [p. 97])

  // ---- the paper's own ray results, used by the calibration check only ------------------------------
  PAPER: {
    GRAZE_I0: 33.75,          // take-off angle of the ray that just grazes the core (p. 263 [p. 88])
    GRAZE_DELTA: 112.5,       // where it comes up without entering the core (p. 263 [p. 90])
    CORE_GRAZE_DELTA: 186.2,  // where the same ray comes up after refraction through the core (p. 263 [p. 90])
    CAUSTIC_I0: 26,           // "as i0 decreases from 33.75 to about 26°" (p. 263 [p. 90])
    CAUSTIC_DELTA: 153.9,     // the nearest the core rays come back: the far edge of the shadow (p. 263 [p. 90])
    SHADOW: [112.5, 153.9],   // "a shadow zone, between 112.5 and 153.9" (p. 263)
    INNER_GRAZE_I0: 16,       // the ray that just touches the inner core (p. 264 [p. 97])
    INNER_GRAZE_DELTA: 160.7, // where it comes up (p. 264 [p. 98])
    CRIT_I0: 14.85,           // the ray totally reflected at the inner core (p. 264 [p. 98])
    CRIT_DELTA: 118.8,        // where it comes up: the near edge of the inner-core arrivals (p. 264 [p. 98])
    OBS_P_WEAK_BEYOND: 105,   // P beyond about 105° weak, long thought absent (p. 264 [p. 93–94])
    OBS_PPRIME_DOWN_TO: 105,  // P′ observed, smaller, "at smaller distances down to about 105°" (p. 264 [p. 93])
    REAL_FOCAL: 143,          // the real Earth's focal distance, upper limit of the shadow (p. 264 [p. 93])
    GUTENBERG_RICHTER_KM: 1200, // inner core radius two years later (p. 267)
  },

  // ---- ours: the posts and the ear ------------------------------------------------------------------
  POSTS: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160, 170, 180], // ours: 18 listening posts, degrees round from the quake; with the ear below, exactly four (120–150) sit in the model's shadow and Lehmann's ball reaches all four (her arrivals begin at 118.8°)
  EAR_DEG: 3,                 // ours: a post hears a ray that comes up within this many degrees of it (110 hears the 112.5° grazing ray; 150 does not hear the 153.9° caustic)
  FAN_STEP_HEAR: 0.05,        // ours: take-off step of the fine fan that decides what a quake's posts hear
  FAN_STEP_DRAW: 0.5,         // ours: take-off step of the fan that is drawn (180 rays a side)

  // ---- ours: the dials --------------------------------------------------------------------------------
  WAVES: 12,                  // ours: waves in the first act; after the last the whole fan fires by itself
  DIVE_MIN: 0, DIVE_MAX: 90, DIVE_STEP: 0.5, DIVE_START: 45,   // ours: the dive dial; the first wave starts at 45°, after that the dial stays where the player left it
  SPEED_MIN: 0.75, SPEED_MAX: 1.25, SPEED_STEP: 0.01, SPEED_START: 1.00, // ours: the ball's speed as a multiple of the core's; Lehmann's 8.6/8 = 1.075 is inside
  QUAKES: 3,                  // ours: quakes in the second act; the third is final. The ball's size is Lehmann's (INNER_FRAC); quake() takes a size for an author who wants the dial back

  // ---- ours: words ------------------------------------------------------------------------------------
  MOON_KM: 1737,              // radius of the Moon, km, the yardstick for the ball's size in words
  STEEP_STRONG: 0.85,         // ours: cos(arrival angle) above this is "strong" up-and-down; the paper's P′3 arrive steeply (p. 264–266 [p. 100])
  STEEP_WEAK: 0.5,            // ours: below this, "weak"
};

var MECH = (function () {
  var D = Math.PI / 180;
  function asinDeg(x) { return Math.asin(Math.max(-1, Math.min(1, x))) / D; }
  function round(x, s) { return Math.round(x / s) * s; }

  // The Earth as the player has built it. Two shells, or three when innerFrac > 0.
  function twoShell() { return { coreFrac: CONFIG.CORE_FRAC, vMantle: CONFIG.V_MANTLE, vCore: CONFIG.V_CORE, innerFrac: 0, vInner: CONFIG.V_CORE }; }
  function threeShell(innerFrac, speedRatio) {
    var e = twoShell(); e.innerFrac = innerFrac; e.vInner = CONFIG.V_CORE * speedRatio; return e;
  }
  function lehmannEarth() { return threeShell(CONFIG.INNER_FRAC, CONFIG.V_INNER / CONFIG.V_CORE); }

  // Trace one ray. Returns { i0, branch, delta (unfolded, may exceed 180), fold (0..180), pts: [[theta, r], ...] }
  // where theta is the central angle from the quake (degrees, clockwise) and r the radius as a fraction of r0.
  // branch: 'mantle' (never meets the core), 'core' (through the core), 'reflect' (off the inner ball),
  // 'inner' (through the inner ball). Set forceCore to evaluate the core branch at the grazing angle itself.
  function trace(i0, earth, forceCore) {
    earth = earth || twoShell();
    var RC = earth.coreFrac, p = Math.sin(i0 * D), pts = [[0, 1]];
    if (forceCore) p = Math.min(p, RC);
    if (!forceCore && p >= RC - 1e-12) {
      var d = 180 - 2 * i0; pts.push([d, 1]);
      return { i0: i0, branch: 'mantle', delta: d, fold: fold(d), pts: pts };
    }
    var i = asinDeg(p / RC);                              // incidence at the core, from outside
    var ip = asinDeg((earth.vCore / earth.vMantle) * Math.sin(i * D)); // refracted into the slower core: toward the middle
    var a1 = i - i0;                                      // central angle of the mantle leg
    pts.push([a1, RC]);
    var p1 = RC * Math.sin(ip * D);                       // perpendicular distance of the core chord
    if (!(earth.innerFrac > 0) || p1 >= earth.innerFrac) {
      var coreLeg = 180 - 2 * ip, d2 = 2 * a1 + coreLeg;
      pts.push([a1 + coreLeg, RC]); pts.push([d2, 1]);
      return { i0: i0, branch: 'core', delta: d2, fold: fold(d2), pts: pts };
    }
    var r1 = earth.innerFrac, i1 = asinDeg(p1 / r1);     // incidence at the inner ball, from the core
    var a2 = i1 - ip;                                     // central angle of the core leg to the ball
    pts.push([a1 + a2, r1]);
    var s = (earth.vInner / earth.vCore) * Math.sin(i1 * D);
    if (s >= 1) {                                         // total reflection: the ball is faster and the slant shallow
      var d3 = 2 * a1 + 2 * a2;
      pts.push([a1 + 2 * a2, RC]); pts.push([d3, 1]);
      return { i0: i0, branch: 'reflect', delta: d3, fold: fold(d3), pts: pts };
    }
    var i1p = asinDeg(s), innerLeg = 180 - 2 * i1p, d4 = 2 * a1 + 2 * a2 + innerLeg;
    pts.push([a1 + a2 + innerLeg, r1]); pts.push([a1 + 2 * a2 + innerLeg, RC]); pts.push([d4, 1]);
    return { i0: i0, branch: 'inner', delta: d4, fold: fold(d4), pts: pts };
  }
  // A ray that comes up past the antipode is read on the mirror side (Lehmann's 186.2° ray is her point 2a).
  function fold(d) { d = ((d % 360) + 360) % 360; return d > 180 ? 360 - d : d; }

  function fan(earth, step) { var out = []; for (var k = 1; k * step < 90; k++) out.push(trace(k * step, earth)); return out; }
  // The take-off angles at which a ray changes branch, where the landing distance is steepest; each branch's
  // end is evaluated there exactly so that no sliver of coverage is lost to the fan's step.
  function limitRays(earth) {
    var out = [], eps = 1e-9, RC = earth.coreFrac, g = asinDeg(RC);
    out.push(trace(g + eps, earth)); out.push(trace(g, earth, true)); out.push(trace(g - eps, earth));
    if (earth.innerFrac > 0) {
      var sG = earth.innerFrac * earth.vMantle / earth.vCore; // the ray whose core chord just touches the ball
      if (sG < RC) { var aG = asinDeg(sG); out.push(trace(aG + eps, earth)); out.push(trace(aG - eps, earth)); }
      if (earth.vInner > earth.vCore) { var sC = earth.innerFrac * earth.vMantle / earth.vInner; var aC = asinDeg(sC); out.push(trace(aC + eps, earth)); out.push(trace(aC - eps, earth)); } // total reflection sets in
    }
    out.push(trace(eps, earth));
    return out;
  }
  function postsHeardBy(rays) {
    var heard = {}; for (var k = 0; k < rays.length; k++) { var f = rays[k].fold; for (var j = 0; j < CONFIG.POSTS.length; j++) { var P = CONFIG.POSTS[j]; if (Math.abs(f - P) <= CONFIG.EAR_DEG) heard[P] = heard[P] || rays[k].branch; } }
    return heard; // post -> the branch that first reached it
  }
  // What a quake, firing at every angle, reaches: each branch's landings form a continuous stretch of the rim
  // (the landing distance is continuous in the take-off angle within a branch), so a post hears the quake if
  // its ear overlaps any branch's stretch.
  var BRANCHES = ['mantle', 'core', 'reflect', 'inner'];
  function heardByQuake(earth) {
    var cov = coverage(earth), heard = {};
    CONFIG.POSTS.forEach(function (P) { for (var b = 0; b < BRANCHES.length; b++) { var c = cov[BRANCHES[b]]; if (c && P + CONFIG.EAR_DEG >= c[0] && P - CONFIG.EAR_DEG <= c[1]) { heard[P] = BRANCHES[b]; return; } } });
    return heard;
  }
  function reachablePosts(earth) { var h = heardByQuake(earth); return CONFIG.POSTS.filter(function (P) { return h[P]; }); }
  function shadowPosts(earth) { var h = heardByQuake(earth); return CONFIG.POSTS.filter(function (P) { return !h[P]; }); }
  // The dive, to the dial's step, that comes up nearest a post (null if nothing comes within the ear).
  function diveFor(post, earth) {
    var best = null, bestGap = 1e9;
    for (var a = CONFIG.DIVE_MIN; a <= CONFIG.DIVE_MAX; a += CONFIG.DIVE_STEP) { var g = Math.abs(trace(a, earth).fold - post); if (g < bestGap) { bestGap = g; best = a; } }
    return bestGap <= CONFIG.EAR_DEG ? best : null;
  }
  // Which branches cover which range of folded distance, for a given Earth.
  function coverage(earth) {
    var rays = fan(earth, CONFIG.FAN_STEP_HEAR).concat(limitRays(earth)), c = {};
    rays.forEach(function (r) { var k = r.branch; if (!c[k]) c[k] = [r.fold, r.fold]; c[k][0] = Math.min(c[k][0], r.fold); c[k][1] = Math.max(c[k][1], r.fold); });
    return c;
  }
  function verticalShare(i0) { return Math.cos(i0 * D); } // the arrival angle equals the dive, by symmetry; up-and-down ∝ cos

  // ---- words ------------------------------------------------------------------------------------------
  function sizeWords(frac) {
    var m = frac * CONFIG.R0_KM / CONFIG.MOON_KM;
    if (m < 0.45) return 'much smaller than the Moon';
    if (m < 0.7) return 'about half the size of the Moon';
    if (m < 0.93) return 'a bit smaller than the Moon';
    if (m < 1.08) return 'about the size of the Moon';
    if (m < 1.5) return 'bigger than the Moon';
    return 'far bigger than the Moon';
  }
  function speedWords(ratio) {
    if (ratio < 0.85) return 'much slower than the core';
    if (ratio < 0.97) return 'a little slower than the core';
    if (ratio <= 1.03) return 'the same speed as the core';
    if (ratio <= 1.15) return 'a little faster than the core';
    return 'much faster than the core';
  }
  function steepWords(i0) {
    var v = verticalShare(i0);
    return v >= CONFIG.STEEP_STRONG ? 'strong' : v >= CONFIG.STEEP_WEAK ? 'middling' : 'weak';
  }
  function deg(x) { return Math.round(x) + '°'; }
  function listPosts(ps) { return ps.map(deg).join(', ').replace(/, ([^,]*)$/, ' and $1'); }
  function countPosts(n) { return n === 4 ? 'all four shadow posts' : n === 0 ? 'none of the four shadow posts' : ['', 'one', 'two', 'three'][n] + ' of the four shadow posts'; }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  // ---- the game -----------------------------------------------------------------------------------------
  function newGame() { return { act: 1, shots: [], heard: {}, quakes: [], done: false }; }

  // Act one: fire one wave at dive i0 into Lehmann's two-shell Earth. The dial stays where the player left it.
  function fire(game, i0) {
    i0 = round(Math.max(CONFIG.DIVE_MIN, Math.min(CONFIG.DIVE_MAX, i0)), CONFIG.DIVE_STEP);
    var ray = trace(i0, twoShell()), hit = postsHeardBy([ray]), posts = Object.keys(hit).map(Number), newPosts = [];
    posts.forEach(function (P) { if (!game.heard[P]) { game.heard[P] = i0; newPosts.push(P); } });
    game.shots.push({ i0: i0, fold: ray.fold, branch: ray.branch, posts: posts });
    var what = 'Dived at ' + fmtDive(i0) + (ray.branch === 'mantle' ? ', missed the core' : ', bent through the core') + ', came up at ' + deg(ray.fold) + (ray.delta > 180 ? ' (past the far point and back round)' : '') + '.';
    var heardLine;
    if (posts.length) heardLine = 'Post ' + deg(posts[0]) + ' heard it' + (newPosts.length ? '' : ' again') + '. Up-and-down: ' + steepWords(i0) + '.';
    else { var near = nearestPost(ray.fold); heardLine = 'Nobody heard it. The nearest post, ' + deg(near) + ', is ' + fmtGap(Math.abs(near - ray.fold)) + ' away.'; }
    var left = CONFIG.WAVES - game.shots.length;
    return { ray: ray, posts: posts, newPosts: newPosts, heardCount: Object.keys(game.heard).length, left: left, last: left <= 0, words: { what: what, heard: heardLine }, steep: steepWords(i0), vertical: verticalShare(i0) };
  }
  function fmtGap(g) { var h = Math.ceil(g * 2) / 2; return (h < 1 ? 'under 1' : h.toString().replace(/\.5$/, '½')) + '°'; } // rounded up to the half degree, so a gap of 3.2 reads 3½, never 3
  function nearestPost(f) { var best = CONFIG.POSTS[0]; CONFIG.POSTS.forEach(function (P) { if (Math.abs(P - f) < Math.abs(best - f)) best = P; }); return best; }
  function fmtDive(a) { return (Math.round(a * 2) / 2).toString().replace(/\.5$/, '½') + '°'; }

  // Act one ends after the last wave: the whole fan fires and the shadow is named.
  function reveal(game) {
    var earth = twoShell(), reach = reachablePosts(earth), shadow = shadowPosts(earth);
    var got = reach.filter(function (P) { return game.heard[P]; }), missed = reach.filter(function (P) { return !game.heard[P]; });
    var missedWith = missed.map(function (P) { return { post: P, dive: diveFor(P, earth) }; });
    var cov = coverage(earth);
    var lines = [];
    lines.push('Your ' + game.shots.length + ' waves lit ' + got.length + ' of the ' + reach.length + ' posts a wave can reach.' + (missed.length ? ' A dive of ' + fmtDive(missedWith[0].dive) + ' would have lit ' + deg(missed[0]) + '.' : ''));
    lines.push('No angle reaches the posts at ' + listPosts(shadow) + '. Waves that miss the core come up no further than ' + deg(cov.mantle[1]) + '; waves bent through it, no nearer than ' + deg(cov.core[0]) + '. Between them lies the shadow.');
    game.act = 2; game.reveal = { reach: reach, got: got, missed: missedWith, shadow: shadow, coverage: cov };
    return { fan: fan(earth, CONFIG.FAN_STEP_DRAW), reach: reach, got: got, missed: missedWith, shadow: shadow, coverage: cov, lines: lines };
  }
  var TWIST = [
    'In 1936 the posts in the shadow had heard something anyway: faint, and mostly up-and-down, as if the wave had come up steeply.',
    'Inge Lehmann’s idea: a second ball, inside the core, in which waves run at a different speed. Build it. A quake fires at every angle at once; make the four shadow posts hear it.'
  ];

  // Act two: set the speed in the ball (its size is Lehmann's unless a size is passed) and fire a quake at every angle.
  function quake(game, speedRatio, sizeFrac) {
    sizeFrac = sizeFrac == null ? CONFIG.INNER_FRAC : sizeFrac;
    speedRatio = round(Math.max(CONFIG.SPEED_MIN, Math.min(CONFIG.SPEED_MAX, speedRatio)), CONFIG.SPEED_STEP);
    var earth = threeShell(sizeFrac, speedRatio), heard = heardByQuake(earth);
    var shadow = game.reveal ? game.reveal.shadow : shadowPosts(twoShell());
    var lit = shadow.filter(function (P) { return heard[P]; });
    var cov = coverage(earth), how;
    if (speedRatio > 1 + 1e-9) {
      how = cov.reflect ? 'Waves meeting the ball at a shallow slant bounced off it and came up from ' + deg(cov.reflect[0]) + '; waves going through it bent away from the middle.'
        : 'Waves going through the ball bent away from the middle and came up from ' + deg(cov.inner[0]) + '.';
    } else if (speedRatio < 1 - 1e-9) {
      var wrapped = fan(earth, CONFIG.FAN_STEP_HEAR).some(function (r) { return r.branch === 'inner' && r.delta > 180 + CONFIG.EAR_DEG; });
      how = 'Waves going through the ball bent further toward the middle' + (wrapped ? ', crossed the far point and came back round as far as ' + deg(cov.inner[0]) + '.' : ' and came up where waves already came up.');
    } else how = 'A ball at the same speed as the core bends nothing: every wave went through as if it were not there.';
    var result = cap(countPosts(lit.length)) + ' heard the quake' + (lit.length ? ': ' + listPosts(lit) + '.' : '.');
    var q = { n: game.quakes.length + 1, sizeFrac: sizeFrac, speedRatio: speedRatio, heard: heard, lit: lit, coverage: cov };
    game.quakes.push(q);
    if (game.quakes.length >= CONFIG.QUAKES) game.done = true;
    return { quake: q, fan: fan(earth, CONFIG.FAN_STEP_DRAW), heard: heard, lit: lit, shadow: shadow, left: CONFIG.QUAKES - game.quakes.length, words: { ball: 'The ball ran ' + speedWords(speedRatio) + '.', result: result, how: how } };
  }
  function finish(game) { game.done = true; return verdict(game); }

  function verdict(game) {
    var last = game.quakes[game.quakes.length - 1], shadow = game.reveal ? game.reveal.shadow : shadowPosts(twoShell());
    var best = game.quakes.reduce(function (b, q) { return !b || q.lit.length > b.lit.length ? q : b; }, null);
    var L = lehmannEarth(), lCov = coverage(L);
    var did = 'You fired ' + game.shots.length + ' waves into Lehmann’s Earth of two shells and found the shadow: four posts, from ' + deg(shadow[0]) + ' to ' + deg(shadow[shadow.length - 1]) + ' round from the quake, that no angle could reach.';
    if (last) {
      did += ' Then you put a ball inside the core running ' + speedWords(last.speedRatio) + ', and ' + countPosts(last.lit.length) + ' heard the quake.';
      if (best && best !== last && best.lit.length > last.lit.length) did += ' Your best ball, ' + speedWords(best.speedRatio) + ', reached ' + countPosts(best.lit.length).replace(' shadow posts', '') + '.';
    }
    var paper = 'Lehmann’s ball was ' + sizeWords(CONFIG.INNER_FRAC) + ' (about ' + Math.round(CONFIG.INNER_FRAC * CONFIG.R0_KM / 100) * 100 + ' km from its centre to its edge) and ran ' + speedWords(CONFIG.V_INNER / CONFIG.V_CORE) + '. Waves bounce off it and come up from about ' + deg(lCov.reflect[0]) + ' round, right inside the shadow, arriving steeply, with a strong up-and-down, and stronger the further round they land: what the posts had recorded. She called it a hypothesis that seemed probable and could not be proved from the data at hand.';
    var means = 'It held. Two years later Gutenberg and Richter computed an inner core about ' + CONFIG.PAPER.GUTENBERG_RICHTER_KM + ' km from centre to edge; in 1939 Jeffreys showed the creeping-round explanation could not work; by 1946 the inner ball was agreed to be solid. The Earth is a ball inside a ball inside a ball, and the innermost was found with cardboard cards, oatmeal boxes and a pencil.';
    var fate;
    if (!last) fate = 'You never built the ball.';
    else if (last.lit.length === 4 && last.speedRatio > 1) fate = 'Your ball does what hers does.';
    else if (last.lit.length === 4 && last.speedRatio < 1) fate = 'Your ball fills the shadow the other way round: waves plunge through it, cross the far point and come back round. In this model that works; the posts, though, recorded waves arriving stronger the further round they stood, and a bounce off a faster ball gives that where a plunge through a slower one does not. Later work found the ball faster.';
    else if (last.lit.length > 0 && last.speedRatio < 1) fate = 'Your ball fills part of the shadow from the far side: waves plunged through it, crossed the far point and came back round.';
    else if (last.lit.length > 0) fate = 'Your ball fills part of the shadow.';
    else fate = 'Your ball leaves the shadow dark.';
    return { did: did, fate: fate, paper: paper, means: means, lehmann: { sizeFrac: CONFIG.INNER_FRAC, speedRatio: CONFIG.V_INNER / CONFIG.V_CORE }, last: last, quote: 'We take it that, as before, the Earth consists of a core and a mantle, but that inside the core there is an inner core in which the velocity is larger than in the outer one.' };
  }

  return { CONFIG: CONFIG, twoShell: twoShell, threeShell: threeShell, lehmannEarth: lehmannEarth, trace: trace, fold: fold, fan: fan, postsHeardBy: postsHeardBy, heardByQuake: heardByQuake, reachablePosts: reachablePosts, shadowPosts: shadowPosts, diveFor: diveFor, coverage: coverage, verticalShare: verticalShare, sizeWords: sizeWords, speedWords: speedWords, steepWords: steepWords, fmtDive: fmtDive, deg: deg, newGame: newGame, fire: fire, reveal: reveal, TWIST: TWIST, quake: quake, finish: finish, verdict: verdict };
})();
if (typeof module !== 'undefined') module.exports = MECH;
