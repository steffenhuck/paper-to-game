// Lehmann's Shadow — mechanism. The single source of truth: plain functions, no DOM, no randomness.
// Runs unchanged in Node (calibration.js, loop.js) and in the browser (inlined verbatim by build.py).
// Kind: PORTED. Inge Lehmann's simplified Earth of 1936: straight rays, one constant P-wave speed per shell,
// the law of refraction at each boundary, total reflection where it applies. Everything the paper gives is
// here with its page; everything ours (the posts, the ear, the dials' ranges, the words) says so.
//
// Paper: Lehmann (1936), "P′", Publ. Bureau Central Séismologique International A14:87–115, read in full from
// a scan of the original (revision 4), with Kölbl-Ebert (2001), "Inge Lehmann's paper: 'P′' (1936)", Episodes
// 24(4):262–267 for what came after. Page numbers are the Episodes pages of the first build, with Lehmann's own
// in brackets; numbers tagged [p. …] alone were taken from the original.
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
    TABLE_II: [[14, 144.3], [13, 150.7], [12, 154.7], [11, 157.7], [10, 160.3], [8, 164.8], [5, 170.8], [1, 178.2]], // Lehmann's own table of rays through the inner core: take-off angle, Δ [p. 98]; used by the check only
    QUAKE_DATE: '16 June 1929', // the Buller earthquake, New Zealand, whose P′3 records are her Figure 3 [p. 95–96]
    RECORDS: [                  // the three stations of Figure 3, with their distances [p. 96]; upDown and sideways are OURS: rough sizes read off the figure by eye, for a sketch, not measurements
      { name: 'Irkutsk', deg: 110.8, upDown: 0.3, sideways: 0.14 },
      { name: 'Sverdlovsk', deg: 135.0, upDown: 1.0, sideways: 0.3 },
      { name: 'Baku', deg: 137.4, upDown: 0.9, sideways: 0.5 },
    ],
    SOLID_PROPOSED: 1940,     // Birch (1940): the inner core proposed to be solid (not in Lehmann's paper, which never says solid)
    SOLID_SHOWN: 1971,        // Dziewonski & Gilbert (1971), Nature 234:465: solidity from the Earth's ringing after great quakes
    MODERN_KM: 1220,          // the inner core's radius as measured today, km
  },

  // ---- ours: the posts and the ear ------------------------------------------------------------------
  POSTS: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160, 170, 180], // ours: 18 listening posts, degrees round from the quake; with the ear below, exactly four (120–150) sit in the model's shadow and Lehmann's ball reaches all four (her arrivals begin at 118.8°)
  EAR_DEG: 3,                 // ours: a post hears a ray that comes up within this many degrees of it (110 hears the 112.5° grazing ray; 150 does not hear the 153.9° caustic)
  FAN_STEP_HEAR: 0.05,        // ours: take-off step of the fine fan that decides what a quake's posts hear
  FAN_STEP_DRAW: 0.5,         // ours: take-off step of the fan that is drawn (180 rays a side)

  // ---- ours: the dials --------------------------------------------------------------------------------
  WAVES: 12,                  // ours: waves in the first act; after the last the whole fan fires by itself
  FREE_WAVES: 6,              // ours: after this many waves the first act sets a job: hit one post inside the shadow
  TARGET_POST: 130,           // ours: that post; no dive reaches it in the two-shell Earth
  WAVES2: 12,                 // ours: waves in the second act (the same Earth with Lehmann's ball hidden in it); it ends early once the four shadow posts are lit
  DIVE_MIN: 0, DIVE_MAX: 90, DIVE_STEP: 0.1, DIVE_START: 45,   // ours: the dive's resolution (the − and + buttons move one step); the first wave starts at 45°, after that the dial stays where the player left it
  DIVE_SLIDER_STEP: 0.5,      // ours: the slider's own step; finer work is done with − and +
  JUMP_DEG: 15,               // ours: a landing that moves this much for a dive that moved a degree or less is called a jump in the words after the shot
  SAME_DEG: 6,                // ours: a landing within this of the last one, for a dive within a degree, is called the same place
  SPEED_MIN: 0.75, SPEED_MAX: 1.25, SPEED_STEP: 0.01, SPEED_START: 1.00, // ours, the author's tool only since revision 4: the range quake() accepts for a ball's speed as a multiple of the core's; Lehmann's 8.6/8 = 1.075 is inside
  QUAKES: 3,                  // ours, the author's tool only since revision 4: quake() is no longer played; it feeds the size-by-speed table in the check

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
  function newGame() { return { act: 1, shots: [], heard: {}, shots2: [], lit2: {}, touches: 0, quakes: [], done: false }; }
  var INTRO1 = 'Wave 1 of ' + CONFIG.WAVES + '. Pick a dive: 0° is straight down through the middle, 90° is along the ground; − and + move a tenth of a degree. Then fire, and watch where you come out.';
  var INTRO2 = 'Wave 1 of ' + CONFIG.WAVES2 + '. The same Earth, the same dial. The four ringed posts are the shadow posts. The clue: they felt a wave that came up steeply, and a wave comes up as steeply as it dived.';

  // Act one: fire one wave at dive i0 into Lehmann's two-shell Earth. The dial stays where the player left it.
  function fire(game, i0) {
    i0 = round(Math.max(CONFIG.DIVE_MIN, Math.min(CONFIG.DIVE_MAX, i0)), CONFIG.DIVE_STEP);
    var ray = trace(i0, twoShell()), hit = postsHeardBy([ray]), posts = Object.keys(hit).map(Number), newPosts = [];
    posts.forEach(function (P) { if (!game.heard[P]) { game.heard[P] = i0; newPosts.push(P); } });
    var prev = game.shots.length ? game.shots[game.shots.length - 1] : null;
    var T = CONFIG.TARGET_POST, onJob = game.shots.length >= CONFIG.FREE_WAVES; // this wave was fired with the job set
    game.shots.push({ i0: i0, fold: ray.fold, branch: ray.branch, posts: posts });
    var what = 'You dived in at ' + fmtDive(i0) + (ray.branch === 'mantle' ? ', missed the core, ' : ', went through the core and got bent twice, ') +
      (ray.delta > 180 ? 'and came up ' + deg(ray.delta) + ' round the Earth from the quake: that is past the far point, so ' + deg(ray.fold) + ' round the other way.' : 'and came up ' + deg(ray.fold) + ' round the Earth from the quake.');
    var heardLine, steep = null;
    if (posts.length) { heardLine = 'That is right by the post at ' + deg(posts[0]) + ', so it felt you' + (newPosts.length ? '.' : ' again.'); steep = steepSentence(i0); }
    else { var near = nearestPost(ray.fold); heardLine = 'No post is there. The nearest, at ' + deg(near) + ', is ' + fmtGap(Math.abs(near - ray.fold)) + ' away: too far to feel you.'; }
    var compare = compareLine(prev, i0, ray.fold, newPosts.length > 0);
    var left = CONFIG.WAVES - game.shots.length;
    var job = null, jobNow = game.shots.length >= CONFIG.FREE_WAVES && left > 0; // the next wave is fired with the job set
    if (onJob) job = 'The ringed post at ' + deg(T) + ' is still dark. You came up ' + deg(Math.abs(ray.fold - T)) + (ray.fold < T ? ' short of it.' : ' past it.');
    else if (jobNow) job = 'Now a job. One post has a ring round it: the post at ' + deg(T) + '. Hit it. You have ' + numberWord(left) + ' waves left.';
    var next = left > 0 ? 'Now wave ' + (game.shots.length + 1) + ' of ' + CONFIG.WAVES + ': set a new dive, then fire.' : 'That was your last wave. Now every dive at once.';
    var head = posts.length ? 'You came up at ' + deg(ray.fold) + '. The post at ' + deg(posts[0]) + ' felt you' + (newPosts.length ? '.' : ' again.') : 'You came up at ' + deg(ray.fold) + '. No post felt you.';
    if (onJob) head = 'You came up at ' + deg(ray.fold) + ': ' + deg(Math.abs(ray.fold - T)) + (ray.fold < T ? ' short of' : ' past') + ' the ringed post.';
    else if (jobNow) head = 'Now a job: hit the ringed post at ' + deg(T) + '.';
    return { ray: ray, posts: posts, newPosts: newPosts, heardCount: Object.keys(game.heard).length, left: left, last: left <= 0, target: jobNow ? T : null, words: { head: head, what: what, heard: heardLine, steep: steep, compare: compare, job: job, next: next }, steep: steepWords(i0), bounce: bounceWords(i0), vertical: verticalShare(i0) };
  }
  // What the game says when two dives close together land far apart, or in the same place. Used in both acts.
  function compareLine(prev, i0, f, lit) {
    if (!prev) return null;
    var di = Math.abs(i0 - prev.i0), df = Math.abs(f - prev.fold);
    if (di <= 1 && di > 0 && df >= CONFIG.JUMP_DEG) return 'Only ' + fmtDive(di) + ' away from your last dive, and you came up ' + deg(df) + ' further ' + (f > prev.fold ? 'round' : 'back') + '. Something big happens between ' + fmtDive(Math.min(i0, prev.i0)) + ' and ' + fmtDive(Math.max(i0, prev.i0)) + '. Try dives in between: − and + move a tenth of a degree.';
    if (!lit && di <= 1 && df < CONFIG.SAME_DEG) return 'Almost the same dive as last time, and almost the same place. Nothing new here: try a different dive.';
    return null;
  }
  function numberWord(n) { return ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'][n] || String(n); }
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
    if (game.shots.length > CONFIG.FREE_WAVES) lines.push('You could not hit the post at ' + deg(CONFIG.TARGET_POST) + '. Nobody can.');
    lines.push('This is every dive at once, from 0° to 90°: the picture Inge Lehmann drew in 1936.');
    lines.push('Look at the right-hand edge. Between ' + deg(cov.mantle[1]) + ' and ' + deg(cov.core[0]) + ' round, no wave comes up at all. The four posts there, at ' + listPosts(shadow) + ', can never feel a quake from here. Lehmann called this band the shadow.');
    lines.push('Why: a wave that just misses the core comes up at ' + deg(cov.mantle[1]) + '. A wave that just catches the core is bent so hard it comes up near the far point, ' + deg(graze.fold) + ' round. Every dive in between lands beyond ' + deg(cov.core[0]) + '. The bend swallows the band.');
    lines.push('Your ' + game.shots.length + ' waves lit ' + got.length + ' of the ' + reach.length + ' posts that can be lit.');
    game.act = 2; game.reveal = { reach: reach, got: got, missed: missedWith, shadow: shadow, coverage: cov };
    return { fan: fan(earth, CONFIG.FAN_STEP_DRAW), reach: reach, got: got, missed: missedWith, shadow: shadow, coverage: cov, lines: lines };
  }
  // The card between the acts: what the real posts wrote. Lehmann's Figure 3 [p. 96] and section 7 [p. 95].
  var RECORDS = {
    before: [
      'So much for the drawing. Now the real Earth. On ' + CONFIG.PAPER.QUAKE_DATE + ' a great earthquake shook New Zealand, and listening posts all over the world wrote down what the ground did.',
      'Three of them stood inside the shadow. They should have felt nothing. This is what they wrote:'
    ],
    after: [
      'They felt it. Not much sideways, but the ground went up and down, and harder the further round the post stood.',
      'Most scientists shrugged: a little shaking must creep round the edge of the core. Inge Lehmann, in Copenhagen, did not believe it. Ground that goes up and down means a wave that came up steeply. And in this Earth a wave comes up exactly as steeply as it dived.',
      'So something deep down must be sending steep waves into the shadow. Go back in and find it. ' + cap(numberWord(CONFIG.WAVES2)) + ' more waves: light the four shadow posts.'
    ],
    note: 'Sketches after Lehmann’s Figure 3, not the real traces.'
  };

  // Act two: fire one wave at dive i0 into the same Earth with Lehmann's ball in it. The ball is not drawn: the
  // wave finds it by being bent where no colour changes. Every touch leaves marks (points on the ball's edge).
  function fire2(game, i0) {
    i0 = round(Math.max(CONFIG.DIVE_MIN, Math.min(CONFIG.DIVE_MAX, i0)), CONFIG.DIVE_STEP);
    var ray = trace(i0, lehmannEarth()), was = trace(i0, twoShell());
    var shadow = game.reveal ? game.reveal.shadow : shadowPosts(twoShell()), band = CONFIG.PAPER.SHADOW;
    var hit = postsHeardBy([ray]), posts = Object.keys(hit).map(Number), newLit = [];
    posts.forEach(function (P) { if (shadow.indexOf(P) >= 0 && !game.lit2[P]) { game.lit2[P] = i0; newLit.push(P); } });
    var touched = ray.branch === 'reflect' || ray.branch === 'inner', straight = touched && i0 < 0.05;
    var marks = !touched ? [] : ray.branch === 'reflect' ? [ray.pts[2]] : [ray.pts[2], ray.pts[3]];
    var first = touched && game.touches === 0; if (touched) game.touches++;
    var prev = game.shots2.length ? game.shots2[game.shots2.length - 1] : null;
    game.shots2.push({ i0: i0, fold: ray.fold, branch: ray.branch, posts: posts, touched: touched });
    var came = 'You came up ' + deg(ray.fold) + ' round.', what;
    if (ray.branch === 'mantle') what = 'You dived in at ' + fmtDive(i0) + ', missed the core, and came up ' + deg(ray.fold) + ' round, just as in the first Earth. You never went near the middle.';
    else if (ray.branch === 'core') what = 'You dived in at ' + fmtDive(i0) + ', went through the core, and came up ' + deg(ray.fold) + ' round, just as in the first Earth. Nothing new touched you.';
    else if (straight) what = 'You dived straight down through the middle. A wave that hits something head-on is not bent, so you came up at the far point, 180° round, as before.';
    else if (ray.branch === 'reflect') what = 'You dived in at ' + fmtDive(i0) + ', went into the core, and deep inside it you hit something and bounced off it, though the colour never changed. ' + came + ' In the first Earth this dive came up at ' + deg(was.fold) + '.';
    else what = 'You dived in at ' + fmtDive(i0) + ', went into the core, and deep inside it something bent you away from the middle, going in and again coming out, though the colour never changed. ' + came + ' In the first Earth this dive came up at ' + deg(was.fold) + '.';
    var found = first ? 'Something is hidden inside the core. Each wave that touches it leaves a white mark where it was bent. Find more of its edge.' : null;
    var heardLine, steep = null, inBand = ray.fold > band[0] && ray.fold < band[1];
    if (newLit.length) { heardLine = 'That is right by the shadow post at ' + deg(newLit[0]) + '. It felt you: the first wave ever to reach it.'; steep = steepSentence(i0); }
    else if (posts.length && shadow.indexOf(posts[0]) >= 0) heardLine = 'That is right by the shadow post at ' + deg(posts[0]) + ', which felt you again.';
    else if (posts.length) heardLine = 'That is by the post at ' + deg(posts[0]) + ', which is no shadow post.';
    else { var near = nearestPost(ray.fold); heardLine = (inBand ? 'You came up inside the shadow, where no wave could come up before. But no post is there: the nearest, at ' : 'No post is there. The nearest, at ') + deg(near) + ', is ' + fmtGap(Math.abs(near - ray.fold)) + ' away.'; }
    var clue = touched ? null : ray.branch === 'mantle' ? 'Remember the clue: the shadow posts felt a wave that came up steeply. This dive is far too flat.' : 'Remember the clue: the shadow posts felt a wave that came up steeply. Try a steeper dive, nearer to straight down.';
    var compare = compareLine(prev, i0, ray.fold, newLit.length > 0);
    var lit = shadow.filter(function (P) { return game.lit2[P] !== undefined; }), all = lit.length === shadow.length;
    var left = CONFIG.WAVES2 - game.shots2.length, last = all || left <= 0;
    var next = all ? 'All four shadow posts are lit. Now see what you found.' : left <= 0 ? 'That was your last wave. Now see what is in there.' : 'Now wave ' + (game.shots2.length + 1) + ' of ' + CONFIG.WAVES2 + ': set a new dive, then fire.';
    var head = newLit.length ? 'Shadow post ' + deg(newLit[0]) + ' is lit: ' + lit.length + ' of 4.' : first ? 'Something bent you where no colour changed.' : touched && !straight ? (ray.branch === 'reflect' ? 'You bounced off the hidden thing and came up at ' : 'The hidden thing bent you. You came up at ') + deg(ray.fold) + '.' : 'You came up at ' + deg(ray.fold) + ', as before. Nothing new touched you.';
    return { ray: ray, posts: posts, newLit: newLit, lit: lit, shadow: shadow, touched: touched, first: first, marks: marks, left: left, last: last, words: { head: head, what: what, found: found, heard: heardLine, steep: steep, clue: clue, compare: compare, next: next }, steep: steepWords(i0), bounce: bounceWords(i0), vertical: verticalShare(i0) };
  }
  // The points on the ball's edge that a game's second-act waves touched: [theta, r] pairs, for redrawing.
  function marksOf(game) {
    var out = [], E = lehmannEarth();
    game.shots2.forEach(function (sh) { if (!sh.touched) return; var r = trace(sh.i0, E); out.push(r.pts[2]); if (r.branch === 'inner') out.push(r.pts[3]); });
    return out;
  }
  // Act two ends: the ball is drawn through the marks and the whole fan fires through the three-shell Earth.
  function reveal2(game) {
    var E = lehmannEarth(), cov = coverage(E), heard = heardByQuake(E);
    var shadow = game.reveal ? game.reveal.shadow : shadowPosts(twoShell());
    var lit = shadow.filter(function (P) { return game.lit2[P] !== undefined; });
    var km = Math.round(CONFIG.INNER_FRAC * CONFIG.R0_KM / 100) * 100, crit = asinDeg((CONFIG.V_CORE / CONFIG.V_INNER) * Math.sin(CONFIG.PAPER.INNER_GRAZE_I0 * D));
    var lines = [];
    lines.push((game.touches > 1 ? 'Your white marks lie on a circle. ' : game.touches === 1 ? 'Your white mark lies on a circle. ' : 'Your waves never touched it, but it is there. ') + 'There is a ball inside the core, about ' + km + ' km from its centre to its edge: ' + sizeWords(CONFIG.INNER_FRAC) + '.');
    lines.push('This is every dive at once through an Earth of three layers. Any wave that dives steeper than ' + deg(CONFIG.PAPER.INNER_GRAZE_I0) + ' meets the ball. Between ' + deg(CONFIG.PAPER.INNER_GRAZE_I0) + ' and about ' + deg(crit) + ' it bounces off, like a stone skipping on water. Steeper than that it goes in, and is bent away from the middle.');
    lines.push('The core bent you toward the middle, because waves run slower there. The ball bends you away from it. So in the ball waves run faster again. And every wave it turns aside comes up between ' + deg(cov.inner[0]) + ' and 180° round: right across the shadow.');
    lines.push(game.touches ? 'Your ' + game.shots2.length + ' waves touched the ball ' + timesWord(game.touches) + ' and lit ' + countPosts(lit.length) + '.' : 'Your ' + game.shots2.length + ' waves never dived steeply enough to touch it.');
    game.act = 3; game.done = true; game.reveal2 = { lit: lit, heard: heard, coverage: cov };
    return { fan: fan(E, CONFIG.FAN_STEP_DRAW), heard: heard, lit: lit, shadow: shadow, coverage: cov, lines: lines, marks: marksOf(game) };
  }
  function timesWord(n) { return n === 0 ? 'never' : n === 1 ? 'once' : n === 2 ? 'twice' : numberWord(n) + ' times'; }

  // The author's tool (not played since revision 4): a ball of any speed and size, a quake at every angle. Feeds the check's table.
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
    var next = '';
    return { quake: q, fan: fan(earth, CONFIG.FAN_STEP_DRAW), heard: heard, lit: lit, shadow: shadow, left: CONFIG.QUAKES - game.quakes.length, words: { ball: 'You made waves run ' + inBall(speedRatio) + '. The quake fired at every angle at once.', result: result, how: how, next: next } };
  }
  function verdict(game) {
    var shadow = game.reveal ? game.reveal.shadow : shadowPosts(twoShell());
    var lit = shadow.filter(function (P) { return game.lit2[P] !== undefined; });
    var L = lehmannEarth(), lCov = coverage(L), km = Math.round(CONFIG.INNER_FRAC * CONFIG.R0_KM / 100) * 100;
    var crit = asinDeg((CONFIG.V_CORE / CONFIG.V_INNER) * Math.sin(CONFIG.PAPER.INNER_GRAZE_I0 * D));
    var did = 'You were the earthquake. You fired ' + numberWord(game.shots.length) + ' waves into an Earth of two layers: a mantle, where waves run fast, and a core, where they run slower. Waves that missed the core came out on your own side of the Earth, no further than ' + deg(game.reveal ? game.reveal.coverage.mantle[1] : 112.5) + ' round. Waves that went through the core were bent so hard that they came out near the far side. The band in between, with the posts from ' + deg(shadow[0]) + ' to ' + deg(shadow[shadow.length - 1]) + ', never got a wave at all: the shadow.';
    if (game.shots2.length) did += ' Then you saw what real posts in the shadow had written, and went back in. ' + (game.touches ? 'Diving steeply, you were bent deep inside the core, where no colour changed: you touched a hidden ball ' + timesWord(game.touches) + ', and lit ' + countPosts(lit.length) + '.' : 'Your ' + numberWord(game.shots2.length) + ' waves never dived steeply enough to touch what is hidden there, and the shadow posts stayed dark.');
    else did += ' You never went back in.';
    var paper = 'Inge Lehmann could not ride a wave. She had only what the posts wrote down. After the New Zealand earthquake of ' + CONFIG.PAPER.QUAKE_DATE + ', posts inside the shadow had felt a wave: hardly any sideways push, but a clear up-and-down, and stronger the further round they stood. The usual answer was that a little shaking creeps round the edge of the core. She thought that could hardly be right any more. So she drew the Earth you have just played in, with one speed in the mantle and a slower one in the core, and then put a third layer inside it: a ball about ' + km + ' km from its centre to its edge, ' + sizeWords(CONFIG.INNER_FRAC) + ', where waves run a little faster again. Then she worked out by hand where every dive comes up. Waves steeper than ' + deg(CONFIG.PAPER.INNER_GRAZE_I0) + ' meet the ball. A few bounce off it, faintly. The rest go through, are bent away from the middle, and come up between ' + deg(lCov.inner[0]) + ' and 180° round: steeply, right across the shadow, and stronger the further round they land. That is what the posts had felt. She did not claim more than that. She called the ball a hypothesis that seemed fairly probable but could not be proved from the records she had, and she ended by asking others to look.';
    var means = 'They looked, and the ball was there. Two years later Gutenberg and Richter worked out its size from the times the waves took: about ' + CONFIG.PAPER.GUTENBERG_RICHTER_KM + ' km from centre to edge. Today it is measured at about ' + CONFIG.PAPER.MODERN_KM + ' km. In 1939 Jeffreys showed that creeping waves could not explain the shadow posts at all. One thing Lehmann never said is that the ball is solid: her paper only says that waves run faster in it. That idea came in ' + CONFIG.PAPER.SOLID_PROPOSED + ', from Francis Birch: iron squeezed so hard that it freezes, inside a core of liquid iron. It was shown to be right only in ' + CONFIG.PAPER.SOLID_SHOWN + ', from the way the whole Earth rings after a great earthquake. So the picture we have now is a rocky mantle, a liquid core, and a solid ball in the middle, the inner core. Lehmann found it by hand, with her records on cardboard cards kept in oatmeal boxes.';
    var fate = !game.shots2.length ? 'You found the shadow.' : lit.length === shadow.length ? 'You found the ball.' : game.touches ? 'You touched the ball.' : 'The ball stayed hidden.';
    return { did: did, fate: fate, paper: paper, means: means, lit: lit, touches: game.touches, marks: marksOf(game), lehmann: { sizeFrac: CONFIG.INNER_FRAC, speedRatio: CONFIG.V_INNER / CONFIG.V_CORE }, quote: 'inside the core there is an inner core in which the velocity is larger', quoteBy: 'Lehmann, 1936, on what her hypothesis takes the Earth to be' };
  }

  return { CONFIG: CONFIG, twoShell: twoShell, threeShell: threeShell, lehmannEarth: lehmannEarth, trace: trace, fold: fold, fan: fan, postsHeardBy: postsHeardBy, heardByQuake: heardByQuake, reachablePosts: reachablePosts, shadowPosts: shadowPosts, diveFor: diveFor, coverage: coverage, verticalShare: verticalShare, sizeWords: sizeWords, speedWords: speedWords, steepWords: steepWords, bounceWords: bounceWords, fmtDive: fmtDive, deg: deg, numberWord: numberWord, INTRO1: INTRO1, INTRO2: INTRO2, newGame: newGame, fire: fire, reveal: reveal, RECORDS: RECORDS, fire2: fire2, marksOf: marksOf, reveal2: reveal2, quake: quake, verdict: verdict };
})();
if (typeof module !== 'undefined') module.exports = MECH;
