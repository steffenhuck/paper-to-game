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
  DIVE_MIN: 0, DIVE_MAX: 90, DIVE_STEP: 0.1, DIVE_START: 45,   // ours: the dive's resolution (the − and + buttons move one step); the first wave starts at 45°, after that the dial stays where the player left it
  DIVE_SLIDER_STEP: 0.5,      // ours: the slider's own step; finer work is done with − and +
  JUMP_DEG: 15,               // ours: a landing that moves this much for a dive that moved a degree or less is called a jump in the words after the shot
  SAME_DEG: 6,                // ours: a landing within this of the last one, for a dive within a degree, is called the same place
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
  function inBall(ratio) { return speedWords(ratio).replace('than the core', 'in the ball than in the core').replace('the same speed as the core', 'the same speed in the ball as in the core'); }
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
  function bounceWords(i0) { return { strong: 'big', middling: 'small', weak: 'hardly any' }[steepWords(i0)]; } // the drum's caption
  function steepSentence(i0) {
    return { strong: 'You came up steeply, so the ground there bounced up and down hard.', middling: 'You came up at a slant, so the ground there bounced up and down a little.', weak: 'You came up almost flat, so the ground there hardly bounced up and down at all.' }[steepWords(i0)];
  }
  function deg(x) { return Math.round(x) + '°'; }
  function listPosts(ps) { return ps.map(deg).join(', ').replace(/, ([^,]*)$/, ' and $1'); }
  function countPosts(n) { return n === 4 ? 'all four shadow posts' : n === 0 ? 'none of the four shadow posts' : ['', 'one', 'two', 'three'][n] + ' of the four shadow posts'; }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  // ---- the game -----------------------------------------------------------------------------------------
  function newGame() { return { act: 1, shots: [], heard: {}, quakes: [], done: false }; }
  var INTRO1 = 'Wave 1 of ' + CONFIG.WAVES + '. Pick a dive: 0° is straight down through the middle, 90° is along the ground; − and + move a tenth of a degree. Then fire, and watch where you come out.';
  var INTRO2 = 'The ringed ball in the middle is Lehmann’s ball. Choose: do waves run slower in it than in the core around it, the same, or faster? Then fire the quake.';

  // Act one: fire one wave at dive i0 into Lehmann's two-shell Earth. The dial stays where the player left it.
  function fire(game, i0) {
    i0 = round(Math.max(CONFIG.DIVE_MIN, Math.min(CONFIG.DIVE_MAX, i0)), CONFIG.DIVE_STEP);
    var ray = trace(i0, twoShell()), hit = postsHeardBy([ray]), posts = Object.keys(hit).map(Number), newPosts = [];
    posts.forEach(function (P) { if (!game.heard[P]) { game.heard[P] = i0; newPosts.push(P); } });
    var prev = game.shots.length ? game.shots[game.shots.length - 1] : null;
    game.shots.push({ i0: i0, fold: ray.fold, branch: ray.branch, posts: posts });
    var what = 'You dived in at ' + fmtDive(i0) + (ray.branch === 'mantle' ? ', missed the core, ' : ', went through the core and got bent twice, ') +
      (ray.delta > 180 ? 'and came up ' + deg(ray.delta) + ' round the Earth from the quake: that is past the far point, so ' + deg(ray.fold) + ' round the other way.' : 'and came up ' + deg(ray.fold) + ' round the Earth from the quake.');
    var heardLine, steep = null;
    if (posts.length) { heardLine = 'That is right by the post at ' + deg(posts[0]) + ', so it felt you' + (newPosts.length ? '.' : ' again.'); steep = steepSentence(i0); }
    else { var near = nearestPost(ray.fold); heardLine = 'No post is there. The nearest, at ' + deg(near) + ', is ' + fmtGap(Math.abs(near - ray.fold)) + ' away: too far to feel you.'; }
    var compare = null;
    if (prev) {
      var di = Math.abs(i0 - prev.i0), df = Math.abs(ray.fold - prev.fold);
      if (di <= 1 && di > 0 && df >= CONFIG.JUMP_DEG) compare = 'Only ' + fmtDive(di) + ' away from your last dive, and you came up ' + deg(df) + ' further ' + (ray.fold > prev.fold ? 'round' : 'back') + '. Something big happens between ' + fmtDive(Math.min(i0, prev.i0)) + ' and ' + fmtDive(Math.max(i0, prev.i0)) + '. Try dives in between: − and + move a tenth of a degree.';
      else if (di <= 1 && df < CONFIG.SAME_DEG) compare = 'Almost the same dive as last time, and almost the same place. Nothing new here: try a very different dive.';
    }
    var left = CONFIG.WAVES - game.shots.length;
    var next = left > 0 ? 'Now wave ' + (game.shots.length + 1) + ' of ' + CONFIG.WAVES + ': set a new dive, then fire.' : 'That was your last wave. Now every dive at once.';
    return { ray: ray, posts: posts, newPosts: newPosts, heardCount: Object.keys(game.heard).length, left: left, last: left <= 0, words: { what: what, heard: heardLine, steep: steep, compare: compare, next: next }, steep: steepWords(i0), bounce: bounceWords(i0), vertical: verticalShare(i0) };
  }
  function fmtGap(g) { var h = Math.ceil(g * 2) / 2; return (h < 1 ? 'under 1' : h.toString().replace(/\.5$/, '½')) + '°'; } // rounded up to the half degree, so a gap of 3.2 reads 3½, never 3
  function nearestPost(f) { var best = CONFIG.POSTS[0]; CONFIG.POSTS.forEach(function (P) { if (Math.abs(P - f) < Math.abs(best - f)) best = P; }); return best; }
  function fmtDive(a) { var r = Math.round(a * 10) / 10; return (Number.isInteger(r) ? r : r.toFixed(1)) + '°'; }

  // Act one ends after the last wave: the whole fan fires and the shadow is named.
  function reveal(game) {
    var earth = twoShell(), reach = reachablePosts(earth), shadow = shadowPosts(earth);
    var got = reach.filter(function (P) { return game.heard[P]; }), missed = reach.filter(function (P) { return !game.heard[P]; });
    var missedWith = missed.map(function (P) { return { post: P, dive: diveFor(P, earth) }; });
    var cov = coverage(earth), graze = trace(asinDeg(earth.coreFrac), earth, true);
    var lines = [];
    lines.push('This is every dive at once, from 0° to 90°: the picture Inge Lehmann drew in 1936.');
    lines.push('Look at the right-hand edge. Between ' + deg(cov.mantle[1]) + ' and ' + deg(cov.core[0]) + ' round, no wave comes up at all. The four posts there, at ' + listPosts(shadow) + ', can never feel a quake from here. Lehmann called this band the shadow.');
    lines.push('Why: a wave that just misses the core comes up at ' + deg(cov.mantle[1]) + '. A wave that just catches the core is bent so hard it comes up near the far point, ' + deg(graze.fold) + ' round. Every dive in between lands beyond ' + deg(cov.core[0]) + '. The bend swallows the band.');
    lines.push('Your ' + game.shots.length + ' waves lit ' + got.length + ' of the ' + reach.length + ' posts that can be lit.' + (missed.length ? ' A dive of ' + fmtDive(missedWith[0].dive) + ' would have lit the post at ' + deg(missed[0]) + '.' : ''));
    game.act = 2; game.reveal = { reach: reach, got: got, missed: missedWith, shadow: shadow, coverage: cov };
    return { fan: fan(earth, CONFIG.FAN_STEP_DRAW), reach: reach, got: got, missed: missedWith, shadow: shadow, coverage: cov, lines: lines };
  }
  var TWIST = [
    'But in 1936 the posts in the shadow did feel something. Faint, and the ground there bounced mostly up and down, as if a wave had come up steeply.',
    'Inge Lehmann had an idea: inside the core sits a smaller ball of different stuff, where waves run at a different speed. Build it: choose how fast waves run in the ball. Then a quake fires at every angle at once. Make the four shadow posts feel it.'
  ];

  // Act two: set the speed in the ball (its size is Lehmann's unless a size is passed) and fire a quake at every angle.
  function quake(game, speedRatio, sizeFrac) {
    sizeFrac = sizeFrac == null ? CONFIG.INNER_FRAC : sizeFrac;
    speedRatio = round(Math.max(CONFIG.SPEED_MIN, Math.min(CONFIG.SPEED_MAX, speedRatio)), CONFIG.SPEED_STEP);
    var earth = threeShell(sizeFrac, speedRatio), heard = heardByQuake(earth);
    var shadow = game.reveal ? game.reveal.shadow : shadowPosts(twoShell());
    var lit = shadow.filter(function (P) { return heard[P]; }), dark = shadow.filter(function (P) { return !heard[P]; });
    var cov = coverage(earth), how;
    if (speedRatio > 1 + 1e-9) {
      how = cov.reflect ? 'Waves that hit your ball at a glancing angle bounced off it and came up from ' + deg(cov.reflect[0]) + ' round: inside the shadow. Waves that went through it were bent away from the middle and came up there too.'
        : 'Waves that went through your ball were bent away from the middle and came up from ' + deg(cov.inner[0]) + ' round.';
    } else if (speedRatio < 1 - 1e-9) {
      var wrapped = fan(earth, CONFIG.FAN_STEP_HEAR).some(function (r) { return r.branch === 'inner' && r.delta > 180 + CONFIG.EAR_DEG; });
      how = 'Waves that went through your ball were bent even more toward the middle' + (wrapped ? '. They went past the far point and came back round the other side, as far as ' + deg(cov.inner[0]) + '.' : ', and came up where waves already came up.');
    } else how = 'Waves run the same speed in your ball as around it, so it bends nothing. Every wave went through as if the ball were not there.';
    var result = lit.length === 4 ? 'All four shadow posts felt it: ' + listPosts(lit) + '.' : lit.length === 0 ? 'None of the four shadow posts felt anything.' : (lit.length === 1 ? 'Only the post at ' + deg(lit[0]) + ' felt it. ' : 'The posts at ' + listPosts(lit) + ' felt it. ') + 'The ' + (dark.length === 1 ? 'post at ' + deg(dark[0]) + ' felt nothing.' : 'other ' + ['', '', 'two', 'three'][dark.length] + ' shadow posts felt nothing.');
    var q = { n: game.quakes.length + 1, sizeFrac: sizeFrac, speedRatio: speedRatio, heard: heard, lit: lit, coverage: cov };
    game.quakes.push(q);
    if (game.quakes.length >= CONFIG.QUAKES) game.done = true;
    var next = game.done ? 'That was the last quake. See the verdict.' : 'Now quake ' + (game.quakes.length + 1) + ' of ' + CONFIG.QUAKES + ': set a new speed, then fire.';
    return { quake: q, fan: fan(earth, CONFIG.FAN_STEP_DRAW), heard: heard, lit: lit, shadow: shadow, left: CONFIG.QUAKES - game.quakes.length, words: { ball: 'You made waves run ' + inBall(speedRatio) + '. The quake fired at every angle at once.', result: result, how: how, next: next } };
  }
  function finish(game) { game.done = true; return verdict(game); }

  function verdict(game) {
    var last = game.quakes[game.quakes.length - 1], shadow = game.reveal ? game.reveal.shadow : shadowPosts(twoShell());
    var best = game.quakes.reduce(function (b, q) { return !b || q.lit.length > b.lit.length ? q : b; }, null);
    var L = lehmannEarth(), lCov = coverage(L);
    var did = 'You were the earthquake. You fired ' + game.shots.length + ' waves into an Earth made of two layers: a mantle, where waves run fast, and a core, where they run slower. Each time you chose the direction, and the listening posts told you where your wave came out. Waves that missed the core came out on your side of the Earth, no further than ' + deg(game.reveal ? game.reveal.coverage.mantle[1] : 112.5) + ' round. Waves that went through the core were bent so hard they came out near the far side. And a band in between, from ' + deg(shadow[0]) + ' to ' + deg(shadow[shadow.length - 1]) + ' round, never got a wave at all: the shadow.';
    if (last) {
      did += ' Then you built a smaller ball inside the core where waves run ' + inBall(last.speedRatio) + ', and fired a quake at every angle: ' + countPosts(last.lit.length) + ' felt it.';
      if (best && best !== last && best.lit.length > last.lit.length) did += ' Your best ball, where waves ran ' + inBall(best.speedRatio) + ', reached ' + countPosts(best.lit.length).replace(' shadow posts', '') + '.';
    } else did += ' You never built the ball.';
    var paper = 'In 1936 the posts inside the shadow had felt something after all: weak, but real, and the ground there bounced mostly up and down, the way it does when a wave comes up steeply. Most scientists said the waves had crept round the outside of the core. Inge Lehmann worked out, by hand, that creeping waves could not come up steeply and would not get stronger further round. So she tried another idea: a smaller ball inside the core, ' + sizeWords(CONFIG.INNER_FRAC) + ' (about ' + Math.round(CONFIG.INNER_FRAC * CONFIG.R0_KM / 100) * 100 + ' km from its centre to its edge), where waves run ' + inBall(CONFIG.V_INNER / CONFIG.V_CORE).replace('in the ball', 'in it') + ' around it. A wave that hits faster rock at a glancing angle bounces off it, and her bounced waves come up from about ' + deg(lCov.reflect[0]) + ' round: right inside the shadow, steeply, and stronger the further round they land. That matched what the posts had felt. She wrote that the idea seemed likely, but could not be proved with what she had.';
    var means = 'She was right. Two years later Gutenberg and Richter worked out the ball\u2019s size from the times the waves took: about ' + CONFIG.PAPER.GUTENBERG_RICHTER_KM + ' km from centre to edge. In 1939 Jeffreys showed that creeping waves could not explain the shadow posts at all. For about twenty years people argued over whether waves really run faster in the ball; they do. By 1946 everyone agreed on the picture we still have: a rocky mantle, a liquid core, and a solid ball in the middle, the inner core. Lehmann found it with cardboard cards, oatmeal boxes and a pencil, in her garden in Copenhagen, in a job where research was not even part of her duties.';
    var fate;
    if (!last) fate = 'You found the shadow, and never built the ball.';
    else if (last.lit.length === 4 && last.speedRatio > 1) fate = 'Your ball does what hers does.';
    else if (last.lit.length === 4 && last.speedRatio < 1) fate = 'Your ball fills the shadow the wrong way round: waves plunge through it, cross the far point and come back. In this model that works too. But the shadow posts felt waves that came up steeply and got stronger further round, and only a bounce off a faster ball gives that. Later work found the ball faster.';
    else if (last.lit.length > 0 && last.speedRatio < 1) fate = 'Your ball fills part of the shadow, the wrong way round: waves plunged through it, crossed the far point and came back.';
    else if (last.lit.length > 0) fate = 'Your ball fills part of the shadow.';
    else fate = 'Your ball leaves the shadow dark.';
    return { did: did, fate: fate, paper: paper, means: means, lehmann: { sizeFrac: CONFIG.INNER_FRAC, speedRatio: CONFIG.V_INNER / CONFIG.V_CORE }, last: last, quote: 'We take it that, as before, the Earth consists of a core and a mantle, but that inside the core there is an inner core in which the velocity is larger than in the outer one.' };
  }

  return { CONFIG: CONFIG, twoShell: twoShell, threeShell: threeShell, lehmannEarth: lehmannEarth, trace: trace, fold: fold, fan: fan, postsHeardBy: postsHeardBy, heardByQuake: heardByQuake, reachablePosts: reachablePosts, shadowPosts: shadowPosts, diveFor: diveFor, coverage: coverage, verticalShare: verticalShare, sizeWords: sizeWords, speedWords: speedWords, steepWords: steepWords, bounceWords: bounceWords, fmtDive: fmtDive, deg: deg, INTRO1: INTRO1, INTRO2: INTRO2, newGame: newGame, fire: fire, reveal: reveal, TWIST: TWIST, quake: quake, finish: finish, verdict: verdict };
})();
if (typeof module !== 'undefined') module.exports = MECH;
