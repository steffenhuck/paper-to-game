// Find Your Inner Core with Lehmann (first built as Lehmann's Shadow) — mechanism. The single source of truth: plain functions, no DOM, no randomness.
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
  WAVES: 8,                   // ours: waves in the first stage (an Earth with one core); after the last the whole fan fires by itself
  WAVES2: 4,                  // ours: waves in the second stage (an Earth with a core within the core)
  DIVE_MIN: 0, DIVE_MAX: 90, DIVE_STEP: 0.1, DIVE_START: 45,   // ours: the dive's resolution (the − and + buttons move one step); the first wave starts at 45°, after that the dial stays where the player left it
  DIVE_START2: 25,            // ours: where the dial stands when the second stage opens (outside the inner core's reach, so the first move is the player's)
  DIVE_SLIDER_STEP: 0.5,      // ours: the slider's own step; finer work is done with − and +, or by dragging on the picture
  JUMP_DEG: 15,               // ours: a landing that moves this much for a dive that moved a degree or less is called a jump in the words after the shot
  SAME_DEG: 6,                // ours: a landing within this of the last one, for a dive within a degree, is called the same place

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
  // Two possibilities, and one record to judge them by. The record (ours, after the paper's observation that
  // P′ is seen "with smaller amplitudes" inside the shadow [p. 93] and its Figure 3 [p. 96]): in a real
  // earthquake most posts shake and light up; the posts inside the one-core Earth's shadow only quiver.
  // The player watches that first, then tries an Earth with ONE CORE, then an Earth with A CORE WITHIN THE CORE.
  function faintPosts() { return shadowPosts(twoShell()); }
  // What each post did in the real earthquake the game opens with: 'lit' or 'quiver'.
  function record() { var f = faintPosts(), out = {}; CONFIG.POSTS.forEach(function (P) { out[P] = f.indexOf(P) >= 0 ? 'quiver' : 'lit'; }); return out; }
  function startStage1(game) { game.act = 1; return game; }
  function newGame() { return { act: 0, shots: [], reached: {}, shots2: [], reached2: {}, quivers: {}, inShadow: 0, touches: 0, done: false }; }
  var WATCH = {
    before: 'First, watch a real earthquake. Keep your eye on the listening posts round the right-hand edge.',
    head: 'Most posts lit up. Four only quivered.',
    after: ['That is what real listening posts recorded: a strong shake almost everywhere, and in one band on the far side only a faint quiver. The four posts that quivered now carry a small ~ mark.', 'Nobody can look inside the Earth. So you will try two Earths and see which one does the same: one with a single core, and one with a core within the core.']
  };
  var AIM1 = 'One core. Can you make the four ~ posts quiver?';
  var AIM2 = 'A core within the core. Can you make the ~ posts quiver now?';
  var INTRO1 = 'This Earth has one core. Choose your direction and fire. The post where you come up lights.';
  var INTRO2 = 'The pale ball is the core within the core. Only a steep dive, less than ' + CONFIG.PAPER.INNER_GRAZE_I0 + '°, gets that deep.';

  function fmtGap(g) { var h = Math.ceil(g * 2) / 2; return (h < 1 ? 'under 1' : h.toString().replace(/\.5$/, '½')) + '°'; } // rounded up to the half degree, so a gap of 3.2 reads 3½, never 3
  function nearestPost(f) { var best = CONFIG.POSTS[0]; CONFIG.POSTS.forEach(function (P) { if (Math.abs(P - f) < Math.abs(best - f)) best = P; }); return best; }
  function fmtDive(a) { var r = Math.round(a * 10) / 10; return (Number.isInteger(r) ? r : r.toFixed(1)) + '°'; }
  function numberWord(n) { return ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'][n] || String(n); }
  function clampDive(i0) { return round(Math.max(CONFIG.DIVE_MIN, Math.min(CONFIG.DIVE_MAX, i0)), CONFIG.DIVE_STEP); }
  // What the game says when two dives close together land far apart, or in the same place. Used in both stages.
  function compareLine(prev, i0, f, lit) {
    if (!prev) return null;
    var di = Math.abs(i0 - prev.i0), df = Math.abs(f - prev.fold);
    if (di <= 1 && di > 0 && df >= CONFIG.JUMP_DEG) return 'Only ' + fmtDive(di) + ' away from your last dive, and you came up ' + deg(df) + ' further ' + (f > prev.fold ? 'round' : 'back') + '. Something big happens between ' + fmtDive(Math.min(i0, prev.i0)) + ' and ' + fmtDive(Math.max(i0, prev.i0)) + '. Try dives in between: − and + move a tenth of a degree.';
    if (!lit && di <= 1 && df < CONFIG.SAME_DEG) return 'Almost the same dive as last time, and almost the same place. Try a different dive.';
    return null;
  }
  function postLine(fold, posts, isNew, faint) {
    if (posts.length) return 'That is right by the post at ' + deg(posts[0]) + (isNew ? ': it lights.' : ', which was lit already.');
    var near = nearestPost(fold); return 'No post is there. The nearest, at ' + deg(near) + ', is ' + fmtGap(Math.abs(near - fold)) + ' away: too far.';
  }

  // Stage one: fire one wave at dive i0 into an Earth with one core (Lehmann's two-shell Earth).
  function fire(game, i0) {
    i0 = clampDive(i0);
    var ray = trace(i0, twoShell()), hit = postsHeardBy([ray]), posts = Object.keys(hit).map(Number), newPosts = [], faint = faintPosts();
    posts.forEach(function (P) { if (game.reached[P] === undefined) { game.reached[P] = i0; newPosts.push(P); } });
    var prev = game.shots.length ? game.shots[game.shots.length - 1] : null;
    game.shots.push({ i0: i0, fold: ray.fold, branch: ray.branch, posts: posts });
    var what = 'You dived in at ' + fmtDive(i0) + (ray.branch === 'mantle' ? ', missed the core, ' : ', went through the core and were bent twice, ') +
      (ray.delta > 180 ? 'and came up ' + deg(ray.delta) + ' round the Earth: that is past the far point, so ' + deg(ray.fold) + ' round the other way.' : 'and came up ' + deg(ray.fold) + ' round the Earth.');
    var head = 'You came up at ' + deg(ray.fold) + '. ' + (posts.length ? 'The post at ' + deg(posts[0]) + (newPosts.length ? ' lights.' : ' lights again.') : 'No post there.');
    var left = CONFIG.WAVES - game.shots.length;
    return { ray: ray, posts: posts, newPosts: newPosts, reachedCount: Object.keys(game.reached).length, faintReached: 0, left: left, last: left <= 0, act1: true, words: { head: head, what: what, post: postLine(ray.fold, posts, newPosts.length > 0, faint), compare: compareLine(prev, i0, ray.fold, newPosts.length > 0) } };
  }
  // Stage one ends after the last go: every direction at once, and the four ~ posts stay dead.
  function reveal(game) {
    var earth = twoShell(), reach = reachablePosts(earth), shadow = shadowPosts(earth), cov = coverage(earth);
    var got = reach.filter(function (P) { return game.reached[P] !== undefined; });
    var lines = [
      'This is every direction at once through an Earth with one core.',
      'The core bends the waves so hard that none comes up between ' + deg(cov.mantle[1]) + ' and ' + deg(cov.core[0]) + '. That empty band is called the shadow, and the four ~ posts sit inside it.',
      'In the real earthquake those four quivered. Here they stay dead. An Earth with one core does not do what the real Earth did.'
    ];
    game.act = 2; game.reveal = { reach: reach, got: got, shadow: shadow, coverage: cov };
    var state = {}; CONFIG.POSTS.forEach(function (P) { state[P] = shadow.indexOf(P) >= 0 ? 'off' : 'lit'; });
    return { fan: fan(earth, CONFIG.FAN_STEP_DRAW), reach: reach, got: got, shadow: shadow, coverage: cov, state: state, head: 'One core: the four ~ posts stay dead. No match.', lines: lines };
  }
  // The card between the stages: the idea [p. 97].
  var CARD = [
    'In 1936 Inge Lehmann, in Copenhagen, had an idea. The core is not the innermost thing. Inside it sits a second, smaller core, where waves run faster again.',
    'A core within the core.',
    'Try it. ' + cap(numberWord(CONFIG.WAVES2)) + ' goes. Dive steeply and see where you come up.'
  ];
  function listNames(rs) { return rs.map(function (r) { return r.name; }).join(', ').replace(/, ([^,]*)$/, ' and $1'); }

  // Stage two: fire one wave at dive i0 into an Earth with a core within the core (Lehmann's three-shell Earth).
  // A liberty, ours, said in Read further: a wave that comes up anywhere inside the shadow makes the nearest ~
  // post quiver, however far along the band it is. Without it three of the four need a dive right to a tenth of a degree.
  function fire2(game, i0) {
    i0 = clampDive(i0);
    var ray = trace(i0, lehmannEarth()), was = trace(i0, twoShell()), faint = faintPosts(), band = CONFIG.PAPER.SHADOW;
    var touched = ray.branch === 'reflect' || ray.branch === 'inner', straight = touched && i0 < 0.05;
    var inBand = ray.fold > band[0] && ray.fold < band[1], quiver = null, isNew = false, posts = [], newPosts = [];
    if (inBand) { quiver = faint[0]; faint.forEach(function (P) { if (Math.abs(P - ray.fold) < Math.abs(quiver - ray.fold)) quiver = P; }); isNew = game.quivers[quiver] === undefined; game.quivers[quiver] = i0; game.inShadow++; }
    else { posts = Object.keys(postsHeardBy([ray])).map(Number).filter(function (P) { return faint.indexOf(P) < 0; }); posts.forEach(function (P) { if (game.reached2[P] === undefined) { game.reached2[P] = i0; newPosts.push(P); } }); }
    if (touched) game.touches++;
    var prev = game.shots2.length ? game.shots2[game.shots2.length - 1] : null;
    game.shots2.push({ i0: i0, fold: ray.fold, branch: ray.branch, posts: posts, quiver: quiver, touched: touched, inBand: inBand });
    var before = ' With one core, this dive came up at ' + deg(was.fold) + '.', what, head, post;
    if (!touched) what = 'You dived in at ' + fmtDive(i0) + (ray.branch === 'mantle' ? ' and missed both cores. ' : ', went through the core, but passed beside the inner core. ') + 'You came up ' + deg(ray.fold) + ' round, exactly as with one core. Only a dive steeper than ' + CONFIG.PAPER.INNER_GRAZE_I0 + '° meets the inner core.';
    else if (straight) what = 'You dived straight down through the middle of both cores. A wave that hits head-on is not bent, so you came up at the far point, 180° round, as before.';
    else if (ray.branch === 'reflect') what = 'You dived in at ' + fmtDive(i0) + ' and hit the inner core at a glancing angle. You bounced off it, like a stone skipping on water, and came up ' + deg(ray.fold) + ' round.' + before;
    else what = 'You dived in at ' + fmtDive(i0) + ' and went right through the inner core. It bent you away from the middle, and you came up ' + deg(ray.fold) + ' round.' + before;
    if (inBand) { head = 'You came up in the shadow. The post at ' + deg(quiver) + ' quivers.'; post = 'You came up inside the shadow, where no wave could come up with one core. The ~ post at ' + deg(quiver) + ' quivers' + (isNew ? '.' : ' again.'); }
    else { head = (touched && !straight ? 'The inner core bent you, but you came up at ' + deg(ray.fold) + ', outside the shadow.' : 'You missed the inner core: up at ' + deg(ray.fold) + ', as before.'); post = postLine(ray.fold, posts, newPosts.length > 0, faint).replace(': reached.', ': it lights.').replace(', which you had reached already.', ', which was lit already.'); }
    var quivering = faint.filter(function (P) { return game.quivers[P] !== undefined; });
    var left = CONFIG.WAVES2 - game.shots2.length;
    return { ray: ray, posts: posts, newPosts: newPosts, quiver: quiver, quivering: quivering, touched: touched, inBand: inBand, left: left, last: left <= 0, words: { head: head, what: what, post: post, compare: touched ? compareLine(prev, i0, ray.fold, isNew) : null } };
  }
  // Stage two ends: every direction at once through three shells. The four ~ posts quiver.
  function reveal2(game) {
    var E = lehmannEarth(), cov = coverage(E), heard = heardByQuake(E), faint = faintPosts();
    var rays = fan(E, CONFIG.FAN_STEP_DRAW), band = CONFIG.PAPER.SHADOW;
    var inBand = rays.filter(function (r) { return r.fold > band[0] && r.fold < band[1]; }).length;
    var lines = [
      'This is every direction at once through an Earth with a core within the core.',
      'The steepest waves now meet the inner core. It bends them away from the middle, or bounces them off, and they come up inside the shadow.',
      'Only a few waves get there, so the four ~ posts do not light up. They quiver. That is exactly what the real earthquake did.'
    ];
    game.act = 3; game.done = true; game.reveal2 = { heard: heard, coverage: cov, inBand: inBand, total: rays.length };
    var state = {}; CONFIG.POSTS.forEach(function (P) { state[P] = faint.indexOf(P) >= 0 ? 'quiver' : 'lit'; });
    return { fan: rays, heard: heard, faint: faint, coverage: cov, state: state, head: 'A core within the core: the four ~ posts quiver. It matches.', lines: lines };
  }

  function verdict(game) {
    var faint = faintPosts(), q = faint.filter(function (P) { return game.quivers[P] !== undefined; });
    var fate = q.length ? 'You found the inner core.' : 'The inner core was there all along.';
    var did = 'You were the earthquake. In the real earthquake, four posts only quivered. With one core, no direction you chose could make them do anything: they sat in a shadow. With a core within the core, a steep dive is turned into that shadow' + (q.length ? ', and you made ' + (q.length === 1 ? 'one of the four posts' : q.length === faint.length ? 'all four posts' : numberWord(q.length) + ' of the four posts') + ' quiver yourself.' : '. Your own dives did not get there, but the full picture showed the ones that do.') + ' So the Earth with a core within the core is the one that does what the real Earth did.';
    var paper = 'That is what Inge Lehmann worked out in 1936, by hand, with a pencil. Real listening posts inside the shadow had felt a faint wave. An Earth with one core could not explain it. An Earth with a small core inside the core, where waves run faster, could. She did not say she had proved it. She called it an idea that fitted better, and asked others to check.';
    var means = 'They checked, and she was right. The inner core is about ' + CONFIG.PAPER.MODERN_KM + ' km from its centre to its edge: smaller than the Moon. Lehmann never said what it is made of. Others worked that out later, and by ' + CONFIG.PAPER.SOLID_SHOWN + ' it was clear: a solid ball of iron, inside a core of liquid iron.';
    var E = lehmannEarth(), posts = {}; faint.forEach(function (P) { var ds = []; for (var a = 0; a <= 20; a = Math.round((a + CONFIG.DIVE_STEP) * 10) / 10) if (Math.abs(trace(a, E).fold - P) <= CONFIG.EAR_DEG) ds.push(a); posts[P] = ds; });
    var widest = faint.slice().sort(function (a, b) { return posts[b].length - posts[a].length; })[0];
    var run = [posts[widest][0]]; for (var k = 1; k < posts[widest].length && posts[widest][k] - posts[widest][k - 1] < CONFIG.DIVE_STEP * 1.5; k++) run.push(posts[widest][k]); // the first unbroken stretch of dives
    var more = [
      ['One wave, or all of them?', 'A real earthquake does not choose a direction. It sends waves every way at once, and each post feels whichever of them arrive there. In the game you follow one wave at a time, because that is the only way to see which direction ends up where. Lehmann did the same with her pencil. “Every direction at once” is the whole earthquake.'],
      ['Why only a quiver?', 'Many waves come up at most posts, so they shake hard. Only a thin sliver of the steepest waves meets the inner core: in the full picture, about ' + (game.reveal2 ? game.reveal2.inBand + ' of the ' + game.reveal2.total : 'seven of the 179') + ' waves drawn land in the shadow. So the posts there feel little. Lehmann worked this out with formulas; the game only counts waves.'],
      ['The game is kinder than the Earth.', 'In the game, any wave that comes up in the shadow makes the nearest ~ post quiver. Really a post only feels a wave that comes up right beside it, and that is very hard to do. The post at ' + deg(widest) + ' is the easy one: any dive from ' + fmtDive(run[0]) + ' to ' + fmtDive(run[run.length - 1]) + ' comes up beside it. The other three each need a dive that is right to about a tenth of a degree, because near the edge of the inner core a tiny change of direction swings the wave a long way: 14° comes up at ' + deg(trace(14, E).fold) + ', 15° at ' + deg(trace(15, E).fold) + '.'],
      ['The Earth in the picture is a sketch.', 'It is the one Lehmann drew on purpose: straight paths, one speed in each layer. In the real Earth the paths curve and the shadow sits a little differently, from about ' + CONFIG.PAPER.OBS_PPRIME_DOWN_TO + '° to ' + CONFIG.PAPER.REAL_FOCAL + '°. Her inner core was about ' + Math.round(CONFIG.INNER_FRAC * CONFIG.R0_KM / 100) * 100 + ' km from centre to edge; today it is measured at ' + CONFIG.PAPER.MODERN_KM + ' km.'],
      ['There was another explanation.', 'In 1936 most scientists said the faint waves had crept round the edge of the core. Much of Lehmann’s paper argues against that: the real records showed the ground moving strongly up and down, as it does when a wave comes up steeply from deep below, and creeping waves would not do that. The game leaves that argument out and sets only the two Earths side by side.'],
      ['What she did not say.', 'Her paper never says the inner core is solid. It gives it one property: waves run faster in it. Francis Birch proposed in ' + CONFIG.PAPER.SOLID_PROPOSED + ' that it is solid iron, and that was shown in ' + CONFIG.PAPER.SOLID_SHOWN + ' from the way the whole Earth rings after a great earthquake.']
    ];
    return { fate: fate, did: did, paper: paper, means: means, more: more, faint: faint, quote: 'inside the core there is an inner core in which the velocity is larger', quoteBy: 'Inge Lehmann, 1936' };
  }

  return { CONFIG: CONFIG, twoShell: twoShell, threeShell: threeShell, lehmannEarth: lehmannEarth, trace: trace, fold: fold, fan: fan, postsHeardBy: postsHeardBy, heardByQuake: heardByQuake, reachablePosts: reachablePosts, shadowPosts: shadowPosts, faintPosts: faintPosts, record: record, diveFor: diveFor, coverage: coverage, verticalShare: verticalShare, sizeWords: sizeWords, speedWords: speedWords, steepWords: steepWords, fmtDive: fmtDive, deg: deg, numberWord: numberWord, WATCH: WATCH, AIM1: AIM1, AIM2: AIM2, INTRO1: INTRO1, INTRO2: INTRO2, newGame: newGame, fire: fire, reveal: reveal, CARD: CARD, fire2: fire2, reveal2: reveal2, verdict: verdict };
})();
if (typeof module !== 'undefined') module.exports = MECH;
