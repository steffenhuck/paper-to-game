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
  // Two possibilities, and the records to judge them by. The records (ours, after the paper's observation that
  // P′ is seen "with smaller amplitudes" inside the shadow [p. 93] and its Figure 3 [p. 96]): every post felt
  // the quake; the posts inside the one-core Earth's shadow felt it only faintly. Stage one asks what an Earth
  // with ONE CORE lets a wave reach; stage two asks the same of an Earth with A CORE WITHIN THE CORE.
  function faintPosts() { return shadowPosts(twoShell()); }
  function newGame() { return { act: 1, shots: [], reached: {}, shots2: [], reached2: {}, inShadow: 0, touches: 0, pick: null, done: false }; }
  var AIM1 = 'Can an Earth with one core reach every post? Try the four faint ones too.';
  var AIM2 = 'Now a core within the core. Can you get a wave to the faint posts?';
  var INTRO1 = 'The picture shows an Earth with one core. The posts on the right all felt real earthquakes; the four with a broken ring felt them only faintly. Fire a wave and see where this Earth lets you come up.';
  var INTRO2 = 'The pale ball is the core within the core. Waves run faster in it than in the core around it. Only a steep dive, less than ' + CONFIG.PAPER.INNER_GRAZE_I0 + '°, gets that deep.';

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
    if (posts.length) return 'That is right by the ' + (faint.indexOf(posts[0]) >= 0 ? 'faint post' : 'post') + ' at ' + deg(posts[0]) + (isNew ? ': reached.' : ', which you had reached already.');
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
    var head = 'You came up at ' + deg(ray.fold) + '. ' + (posts.length ? 'Post ' + deg(posts[0]) + (newPosts.length ? ' reached.' : ' again.') : 'No post there.');
    var left = CONFIG.WAVES - game.shots.length;
    return { ray: ray, posts: posts, newPosts: newPosts, reachedCount: Object.keys(game.reached).length, faintReached: 0, left: left, last: left <= 0, words: { head: head, what: what, post: postLine(ray.fold, posts, newPosts.length > 0, faint), compare: compareLine(prev, i0, ray.fold, newPosts.length > 0) } };
  }
  // Stage one ends after the last wave: the whole fan fires, and the four faint posts stay unreached.
  function reveal(game) {
    var earth = twoShell(), reach = reachablePosts(earth), shadow = shadowPosts(earth), cov = coverage(earth), graze = trace(asinDeg(earth.coreFrac), earth, true);
    var got = reach.filter(function (P) { return game.reached[P] !== undefined; });
    var lines = [
      'This is every dive at once through an Earth with one core: the picture Inge Lehmann drew in 1936.',
      'A wave that just misses the core comes up at ' + deg(cov.mantle[1]) + '. A wave that just catches it is bent so hard that it comes up near the far point. Nothing at all lands between ' + deg(cov.mantle[1]) + ' and ' + deg(cov.core[0]) + '. That empty band is called the shadow.',
      'The four faint posts sit inside it. With one core, no dive can ever reach them. But they did feel something. So one core cannot be the whole story.'
    ];
    game.act = 2; game.reveal = { reach: reach, got: got, shadow: shadow, coverage: cov };
    return { fan: fan(earth, CONFIG.FAN_STEP_DRAW), reach: reach, got: got, shadow: shadow, coverage: cov, head: 'With one core, no wave reaches the four faint posts.', lines: lines };
  }
  // The card between the stages: the records [p. 95–96] and the idea [p. 97].
  var CARD = [
    'This is no made-up puzzle. After a great earthquake in New Zealand on ' + CONFIG.PAPER.QUAKE_DATE + ', listening posts at ' + listNames(CONFIG.PAPER.RECORDS) + ', all inside the shadow, wrote down a faint wave. An Earth with one core says they should have felt nothing.',
    'Inge Lehmann, in Copenhagen, had an idea. The core is not the innermost thing. Inside it sits a second, smaller core, where waves run faster again. A core within the core.',
    'Try her idea. ' + cap(numberWord(CONFIG.WAVES2)) + ' waves into an Earth with a core within the core. Can you get a wave to the faint posts now?'
  ];
  function listNames(rs) { return rs.map(function (r) { return r.name; }).join(', ').replace(/, ([^,]*)$/, ' and $1'); }

  // Stage two: fire one wave at dive i0 into an Earth with a core within the core (Lehmann's three-shell Earth).
  function fire2(game, i0) {
    i0 = clampDive(i0);
    var ray = trace(i0, lehmannEarth()), was = trace(i0, twoShell()), faint = faintPosts(), band = CONFIG.PAPER.SHADOW;
    var hit = postsHeardBy([ray]), posts = Object.keys(hit).map(Number), newFaint = [];
    posts.forEach(function (P) { if (faint.indexOf(P) >= 0 && game.reached2[P] === undefined) { game.reached2[P] = i0; newFaint.push(P); } });
    var touched = ray.branch === 'reflect' || ray.branch === 'inner', straight = touched && i0 < 0.05;
    var inBand = ray.fold > band[0] && ray.fold < band[1];
    if (touched) game.touches++; if (inBand) game.inShadow++;
    var prev = game.shots2.length ? game.shots2[game.shots2.length - 1] : null;
    game.shots2.push({ i0: i0, fold: ray.fold, branch: ray.branch, posts: posts, touched: touched, inBand: inBand });
    var where = 'You came up ' + deg(ray.fold) + ' round' + (inBand ? ': inside the shadow.' : '.'), before = ' With one core, this dive came up at ' + deg(was.fold) + '.', what, head;
    if (!touched) { what = 'You dived in at ' + fmtDive(i0) + (ray.branch === 'mantle' ? ' and missed both cores. ' : ', went through the core, but passed beside the inner core. ') + 'You came up ' + deg(ray.fold) + ' round, exactly as with one core. Only a dive steeper than ' + CONFIG.PAPER.INNER_GRAZE_I0 + '° meets the inner core.'; head = 'You missed the inner core: up at ' + deg(ray.fold) + ', as before.'; }
    else if (straight) { what = 'You dived straight down through the middle of both cores. A wave that hits head-on is not bent, so you came up at the far point, 180° round, as before.'; head = 'Straight through both cores: up at 180°, as before.'; }
    else if (ray.branch === 'reflect') { what = 'You dived in at ' + fmtDive(i0) + ' and hit the inner core at a glancing angle. You bounced off it, like a stone skipping on water. ' + where + before; head = 'You bounced off the inner core: up at ' + deg(ray.fold) + (inBand ? ', inside the shadow.' : '.'); }
    else { what = 'You dived in at ' + fmtDive(i0) + ' and went right through the inner core. It bent you away from the middle, going in and again coming out. ' + where + before; head = 'The inner core bent you: up at ' + deg(ray.fold) + (inBand ? ', inside the shadow.' : '.'); }
    if (newFaint.length) head = 'You reached the faint post at ' + deg(newFaint[0]) + '.';
    var post = posts.length && faint.indexOf(posts[0]) < 0 ? null : postLine(ray.fold, posts, newFaint.length > 0, faint);
    if (!posts.length && inBand) post = 'A wave inside the shadow: with one core that could not happen. ' + post.replace('No post is there. The', 'No post is right there, though: the');
    var faintReached = faint.filter(function (P) { return game.reached2[P] !== undefined; });
    var left = CONFIG.WAVES2 - game.shots2.length;
    return { ray: ray, posts: posts, newFaint: newFaint, faintReached: faintReached, touched: touched, inBand: inBand, left: left, last: left <= 0, words: { head: head, what: what, post: post, compare: touched ? compareLine(prev, i0, ray.fold, newFaint.length > 0) : null } };
  }
  // Stage two ends: the whole fan fires through three shells. The faint posts are reached, by few waves.
  function reveal2(game) {
    var E = lehmannEarth(), cov = coverage(E), heard = heardByQuake(E), faint = faintPosts();
    var crit = asinDeg((CONFIG.V_CORE / CONFIG.V_INNER) * Math.sin(CONFIG.PAPER.INNER_GRAZE_I0 * D));
    var rays = fan(E, CONFIG.FAN_STEP_DRAW), band = CONFIG.PAPER.SHADOW;
    var inBand = rays.filter(function (r) { return r.fold > band[0] && r.fold < band[1]; }).length;
    var lines = [
      'This is every dive at once through an Earth with a core within the core.',
      'Waves that dive steeper than ' + deg(CONFIG.PAPER.INNER_GRAZE_I0) + ' meet the inner core. Between ' + deg(CONFIG.PAPER.INNER_GRAZE_I0) + ' and about ' + deg(crit) + ' they bounce off it. Steeper ones go through, and are bent away from the middle, because waves run faster in there. Both kinds come up inside the shadow.',
      'Look how few they are: only about ' + inBand + ' of the ' + rays.length + ' waves drawn here land in the shadow. So the posts there feel just a little. Faint: exactly what the real posts wrote down.'
    ];
    game.act = 3; game.reveal2 = { heard: heard, coverage: cov, inBand: inBand, total: rays.length };
    return { fan: rays, heard: heard, faint: faint, coverage: cov, head: 'With a core within the core, every post is reached, four of them faintly.', lines: lines, question: 'Which Earth fits what the posts recorded?', options: [['one', 'One core'], ['two', 'A core within the core']] };
  }

  // The player says which Earth fits the records; then the verdict.
  function choose(game, pick) { game.pick = pick === 'two' ? 'two' : 'one'; game.done = true; return verdict(game); }
  function verdict(game) {
    var faint = faintPosts(), got2 = faint.filter(function (P) { return game.reached2[P] !== undefined; });
    var fate = game.pick === 'two' ? 'You found the inner core.' : 'The four faint posts disagree.';
    var did = 'You were the earthquake. In an Earth with one core, none of your waves could reach the four faint posts, and no dive ever can: they sit in a shadow. In an Earth with a core within the core, steep waves are turned aside by the inner core and come up inside that shadow.';
    did += game.shots2.length ? (game.inShadow ? ' ' + cap(numberWord(game.inShadow)) + ' of your ' + numberWord(game.shots2.length) + ' waves did just that' + (got2.length ? ', and you reached ' + (got2.length === 1 ? 'the faint post at ' + deg(got2[0]) : numberWord(got2.length) + ' of the faint posts') + '.' : '.') : game.touches ? ' Your waves met the inner core but did not land in the shadow; the full picture showed the ones that do.' : ' Your own waves never dived steeply enough to meet it; the full picture showed the ones that do.') : '';
    did += game.pick === 'two' ? ' You chose the Earth with a core within the core. It is the one that fits.' : ' You chose the Earth with one core. But that Earth leaves four posts silent, and the real posts were not silent.';
    var paper = 'That is what Inge Lehmann worked out in 1936, by hand, with a pencil. Real listening posts inside the shadow had felt a faint wave. An Earth with one core could not explain it. An Earth with a small core inside the core, where waves run faster, could. She did not say she had proved it. She called it an idea that fitted the records better, and asked others to check.';
    var means = 'They checked, and she was right. The inner core is about ' + CONFIG.PAPER.MODERN_KM + ' km from its centre to its edge: smaller than the Moon. Lehmann never said what it is made of. Others worked that out later, and by ' + CONFIG.PAPER.SOLID_SHOWN + ' it was clear: a solid ball of iron, inside a core of liquid iron.';
    return { fate: fate, did: did, paper: paper, means: means, pick: game.pick, faint: faint, quote: 'inside the core there is an inner core in which the velocity is larger', quoteBy: 'Inge Lehmann, 1936' };
  }

  return { CONFIG: CONFIG, twoShell: twoShell, threeShell: threeShell, lehmannEarth: lehmannEarth, trace: trace, fold: fold, fan: fan, postsHeardBy: postsHeardBy, heardByQuake: heardByQuake, reachablePosts: reachablePosts, shadowPosts: shadowPosts, faintPosts: faintPosts, diveFor: diveFor, coverage: coverage, verticalShare: verticalShare, sizeWords: sizeWords, speedWords: speedWords, steepWords: steepWords, fmtDive: fmtDive, deg: deg, numberWord: numberWord, AIM1: AIM1, AIM2: AIM2, INTRO1: INTRO1, INTRO2: INTRO2, newGame: newGame, fire: fire, reveal: reveal, CARD: CARD, fire2: fire2, reveal2: reveal2, choose: choose, verdict: verdict };
})();
if (typeof module !== 'undefined') module.exports = MECH;
