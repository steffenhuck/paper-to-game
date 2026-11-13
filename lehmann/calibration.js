// Calibration check for Lehmann's Shadow: runs mechanism.js headless against the paper's own numbers
// (since revision 4 also against Table II of Lehmann's original, read from the scan).
const M = require('./mechanism.js');
const C = M.CONFIG, P = C.PAPER;
let fails = 0, out = [];
function check(name, ok, detail) { out.push((ok ? 'PASS ' : 'FAIL ') + name + (detail !== undefined ? '  — ' + detail : '')); if (!ok) fails++; }
const f1 = x => (Math.round(x * 100) / 100).toFixed(2);
const two = M.twoShell(), leh = M.lehmannEarth();

// 1. Lehmann's two-shell Earth (p. 263 [p. 88–90]; Figure 2a)
check('core radius 5/9 r0 = 3539 km', Math.round(C.CORE_FRAC * C.R0_KM) === 3539, Math.round(C.CORE_FRAC * C.R0_KM));
check('the grazing ray: sin(i0) = 5/9 gives i0 = 33.75°', Math.abs(Math.asin(C.CORE_FRAC) * 180 / Math.PI - P.GRAZE_I0) < 0.01, f1(Math.asin(C.CORE_FRAC) * 180 / Math.PI));
const g = M.trace(P.GRAZE_I0, two);
check('the grazing ray, through the mantle only, comes up at 112.5°', g.branch === 'mantle' && Math.abs(g.fold - P.GRAZE_DELTA) < 0.05, f1(g.fold));
const gc = M.trace(P.GRAZE_I0, two, true);
check('the same ray refracted through the core comes up at 186.2° (Lehmann’s point 2a)', gc.branch === 'core' && Math.abs(gc.delta - P.CORE_GRAZE_DELTA) < 0.1, f1(gc.delta));
check('186.2° folds to 173.8° on the mirror side', Math.abs(gc.fold - (360 - P.CORE_GRAZE_DELTA)) < 0.1, f1(gc.fold));
let minD = 1e9, argMin = null;
for (let a = 0.01; a < P.GRAZE_I0; a += 0.01) { const r = M.trace(a, two); if (r.delta < minD) { minD = r.delta; argMin = a; } }
check('the core rays run back no nearer than 153.9° (the caustic, far edge of the shadow)', Math.abs(minD - P.CAUSTIC_DELTA) < 0.05, f1(minD));
check('…at a take-off angle of about 26° (the paper says "about 26°")', Math.abs(argMin - P.CAUSTIC_I0) < 0.5, f1(argMin));
check('a ray straight down (i0 → 0) comes up at the far point, 180°', Math.abs(M.trace(0.001, two).delta - 180) < 0.01, f1(M.trace(0.001, two).delta));
const cov2 = M.coverage(two);
check('two shells: nothing comes up between 112.5° and 153.9°', cov2.mantle[1] <= P.SHADOW[0] + 0.05 && cov2.core[0] >= P.SHADOW[1] - 0.05 && !cov2.reflect && !cov2.inner, JSON.stringify(cov2, (k, v) => typeof v === 'number' ? +f1(v) : v));
check('mantle-only rays come up at 180 − 2·i0 (chord geometry)', [40, 60, 80].every(a => Math.abs(M.trace(a, two).delta - (180 - 2 * a)) < 1e-9));

// 2. the inner core (p. 264 [p. 97–98]; Figure 2b)
check('inner core radius 8/10·r0·sin16° = 0.2205 r0 = 1405 km', Math.abs(C.INNER_FRAC - 0.2205) < 0.0005 && Math.round(C.INNER_FRAC * C.R0_KM) === 1405, f1(C.INNER_FRAC * 10000) / 10000 + ' ' + Math.round(C.INNER_FRAC * C.R0_KM));
const ig = M.trace(P.INNER_GRAZE_I0, leh);
check('the ray at 16° just touches the inner core and comes up at 160.7°', ig.branch === 'core' && Math.abs(ig.delta - P.INNER_GRAZE_DELTA) < 0.1, ig.branch + ' ' + f1(ig.delta));
check('the ray at 16° has its core chord exactly at the inner radius', Math.abs(C.CORE_FRAC * Math.sin(Math.asin(0.8 * Math.sin(Math.asin(Math.sin(16 * Math.PI / 180) / C.CORE_FRAC)))) - C.INNER_FRAC) < 1e-9);
const critI0 = Math.asin((C.V_CORE / C.V_INNER) * Math.sin(16 * Math.PI / 180)) * 180 / Math.PI;
check('total reflection at the inner core sets in at i0 = 14.85°', Math.abs(critI0 - P.CRIT_I0) < 0.01, f1(critI0));
const cr = M.trace(critI0 + 1e-10, leh);
check('the totally reflected ray at 14.85° comes up at 118.8°', cr.branch === 'reflect' && Math.abs(cr.delta - P.CRIT_DELTA) < 0.15, cr.branch + ' ' + f1(cr.delta));
const ci = M.trace(critI0 - 1e-10, leh);
check('the ray just steeper than 14.85° goes through the inner core and comes up at the same 118.8°: the branches join', ci.branch === 'inner' && Math.abs(ci.delta - cr.delta) < 0.02, ci.branch + ' ' + f1(ci.delta));
check('inner-core rays run forward from 118.8° to 180° as i0 falls to 0', Math.abs(M.trace(0.001, leh).delta - 180) < 0.01);
check('Lehmann’s own Table II [p. 98 of the original]: rays through the inner core come up where she computed, to the tenth of a degree', P.TABLE_II.every(([i0, d]) => Math.abs(M.trace(i0, leh).delta - d) < 0.1 && M.trace(i0, leh).branch === 'inner'), P.TABLE_II.map(([i0, d]) => i0 + '°→' + f1(M.trace(i0, leh).delta)).join(' '));
const cov3 = M.coverage(leh);
check('three shells: reflected rays cover 118.8°–160.7°, transmitted 118.8°–180°, core rays 153.9°–180°, mantle 0°–112.5°', Math.abs(cov3.reflect[0] - P.CRIT_DELTA) < 0.2 && Math.abs(cov3.reflect[1] - P.INNER_GRAZE_DELTA) < 0.3 && Math.abs(cov3.inner[0] - P.CRIT_DELTA) < 0.2 && cov3.inner[1] > 179.9 && Math.abs(cov3.core[0] - P.CAUSTIC_DELTA) < 0.05 && Math.abs(cov3.mantle[1] - P.GRAZE_DELTA) < 0.05, JSON.stringify(cov3, (k, v) => typeof v === 'number' ? +f1(v) : v));
check('the inner-core arrivals come up steeply: cos(14.85°) = 0.97, "strong" up-and-down (p. 264 [p. 100])', M.verticalShare(critI0) > C.STEEP_STRONG && M.steepWords(critI0) === 'strong');
check('the arrival angle equals the dive for every branch (symmetric paths), so the drum reads cos(i0)', [5, 15, 15.5, 30, 60].every(a => { const r = M.trace(a, leh); const last = r.pts[r.pts.length - 1], prev = r.pts[r.pts.length - 2]; const D = Math.PI / 180; const x1 = prev[1] * Math.sin(prev[0] * D), y1 = prev[1] * Math.cos(prev[0] * D), x2 = Math.sin(last[0] * D), y2 = Math.cos(last[0] * D); const dx = x2 - x1, dy = y2 - y1; const dot = (dx * x2 + dy * y2) / Math.hypot(dx, dy); return Math.abs(Math.acos(dot) / D - a) < 1e-6; }));

// 3. our posts and the ear: the shadow holds exactly four posts, and Lehmann's ball reaches them
const shadow = M.shadowPosts(two);
check('two shells: exactly the posts at 120°, 130°, 140°, 150° are unreachable', JSON.stringify(shadow) === JSON.stringify([120, 130, 140, 150]), JSON.stringify(shadow));
check('two shells: the post at 110° can be reached (112.5 is within the ear) and 160° too (from 153.9 on)', M.reachablePosts(two).includes(110) && M.reachablePosts(two).includes(160));
check('every reachable post has a dive on the dial that reaches it', M.reachablePosts(two).every(p => M.diveFor(p, two) !== null));
check('Lehmann’s ball: all 18 posts hear a quake', M.shadowPosts(leh).length === 0, JSON.stringify(M.shadowPosts(leh)));
check('Lehmann’s ball: the four shadow posts are reached by the reflected and transmitted rays', [120, 130, 140, 150].every(p => ['reflect', 'inner'].includes(M.heardByQuake(leh)[p])), JSON.stringify([120, 130, 140, 150].map(p => M.heardByQuake(leh)[p])));
const slow = M.threeShell(C.INNER_FRAC, 7.5 / 8), same = M.threeShell(C.INNER_FRAC, 1);
check('a ball the same speed as the core changes nothing', JSON.stringify(M.shadowPosts(same)) === JSON.stringify(shadow));
check('a ball a little slower (7.5 km/s) leaves the shadow’s first three posts dark', [120, 130, 140].every(p => !M.heardByQuake(slow)[p]), JSON.stringify(M.shadowPosts(slow)));
const vslow = M.threeShell(C.INNER_FRAC, 6 / 8);
check('a ball much slower (6 km/s) fills the shadow from the other side (waves cross the far point): the verdict names this honestly', [120, 130, 140, 150].every(p => M.heardByQuake(vslow)[p]) && M.fan(vslow, 0.05).some(r => r.branch === 'inner' && r.delta > 182), JSON.stringify(M.shadowPosts(vslow)));
check('the speed dial holds Lehmann’s 1.075 inside [0.75, 1.25], off its starting place', C.V_INNER / C.V_CORE > C.SPEED_MIN && C.V_INNER / C.V_CORE < C.SPEED_MAX && Math.abs(C.V_INNER / C.V_CORE - C.SPEED_START) > 0.02);

// 4. robustness of the central discovery to our choices (the ear, the posts' offset): every post called
//    unreachable lies inside the paper's shadow, at least three do, and every shadow post that lies where the
//    paper's inner-core rays land (from 118.8° on) hears Lehmann's ball
function story(label) {
  const sh = M.shadowPosts(two), h = M.heardByQuake(leh);
  const ok = sh.every(p => p > P.SHADOW[0] && p < P.SHADOW[1]) && sh.length >= 3 && sh.filter(p => p + C.EAR_DEG >= P.CRIT_DELTA).every(p => h[p]) && M.shadowPosts(leh).every(p => p + C.EAR_DEG < P.CRIT_DELTA);
  check(label, ok, 'shadow ' + JSON.stringify(sh) + ', dark under Lehmann ' + JSON.stringify(M.shadowPosts(leh)));
}
[1, 2, 3, 4].forEach(ear => { const saved = C.EAR_DEG; C.EAR_DEG = ear; story(`ear ${ear}°: the same story`); C.EAR_DEG = saved; });
{
  const saved = C.POSTS.slice(); C.POSTS.length = 0; for (let p = 5; p <= 175; p += 10) C.POSTS.push(p);
  story('posts at 5°, 15°, …, 175° instead: the same story (the post at 115° lies in the sliver below 118.8° and stays dark under Lehmann’s ball)');
  C.POSTS.length = 0; saved.forEach(p => C.POSTS.push(p));
}
{
  const saved = C.FAN_STEP_HEAR; C.FAN_STEP_HEAR = 0.5;
  const keys = h => JSON.stringify(Object.keys(h).map(Number).sort((a, b) => a - b));
  check('the fan’s step does not decide what is heard (0.5° gives the same posts as 0.05°)', keys(M.heardByQuake(leh)) === keys((() => { C.FAN_STEP_HEAR = saved; return M.heardByQuake(leh); })()));
  C.FAN_STEP_HEAR = saved;
}

// 5. words
check('Lehmann’s ball in words: "a bit smaller than the Moon", "a little faster than the core"', M.sizeWords(C.INNER_FRAC) === 'a bit smaller than the Moon' && M.speedWords(C.V_INNER / C.V_CORE) === 'a little faster than the core', M.sizeWords(C.INNER_FRAC) + ' / ' + M.speedWords(C.V_INNER / C.V_CORE));
check('Gutenberg & Richter’s 1200 km in words: "about half the size of the Moon" (0.69 of the Moon)', M.sizeWords(P.GUTENBERG_RICHTER_KM / C.R0_KM) === 'about half the size of the Moon', M.sizeWords(P.GUTENBERG_RICHTER_KM / C.R0_KM));

// 6. a scripted game runs to a verdict (revision 5: twelve waves, the records and Lehmann's idea, the inner ball drawn in)
{
  const g = M.newGame();
  let fires = []; [45, 60, 30, 80, 10, 20, 34, 33.5, 33.7, 26, 22.5, 0].forEach(a => { fires.push(M.fire(g, a)); });
  check('scripted act one: the twelfth wave is the last; every wave has a one-line headline', fires[11].last === true && fires[11].left === 0 && fires.every(f => /You came up at/.test(f.words.head)));
  check('a dive of 33.5° after 34° is called a jump (60° further round for half a degree), and 33.6° is on the dial', (() => { const h = M.newGame(); M.fire(h, 34); const r = M.fire(h, 33.5); const r2 = M.fire(h, 33.6); return /Something big happens between 33.5° and 34°/.test(r.words.compare) && r2.ray.i0 === 33.6; })());
  const r = M.reveal(g);
  check('scripted act one: 14 reachable posts, 4 in shadow, lines name the shadow', r.reach.length === 14 && r.shadow.length === 4 && /shadow/.test(r.lines.join(' ')), r.got.length + ' got, ' + r.missed.length + ' missed');
  check('the records card names the quake of 16 June 1929 and states Lehmann’s idea outright: a core inside the core', /16 June 1929/.test(M.RECORDS.before.join(' ')) && /core inside the core/i.test(M.RECORDS.after.join(' ')) && P.RECORDS.length === 3);
  const a = [30, 10, 13, 14, 15, 14.5, 15.5].map(d => M.fire2(g, d));
  check('act two: a dive of 30° misses the inner ball and comes up as in the first Earth; the game says what reaches it', a[0].touched === false && /steeper than 16°/.test(a[0].words.clue) && Math.abs(a[0].ray.fold - M.trace(30, two).fold) < 1e-9);
  check('act two: 13° lights 150°, 14° lands in the shadow between posts, 15° bounces and lights 120°, 14.5° lights 140°, 15.5° lights 130°', JSON.stringify(a.slice(2).map(x => x.newLit)) === '[[150],[],[120],[140],[130]]' && a[4].ray.branch === 'reflect' && /bounced off/.test(a[4].words.what) && /inside the shadow/.test(a[3].words.heard), JSON.stringify(a.slice(2).map(x => x.newLit)));
  check('act two ends as soon as the four shadow posts are lit', a[5].last === false && a[6].last === true && /All four/.test(a[6].words.next));
  check('the slider’s half-degree steps hold a dive for each shadow post (13, 14.5, 15, 15.5)', [[13, 150], [14.5, 140], [15, 120], [15.5, 130]].every(([d, post]) => Math.abs(M.trace(d, leh).fold - post) <= C.EAR_DEG));
  const r2 = M.reveal2(g);
  check('the second reveal: all 18 posts feel the three-shell quake; the lines name the bounce and the faster speed', Object.keys(r2.heard).length === 18 && /shadow is gone/.test(r2.lines[0]) && /bounces off/.test(r2.lines[1]) && /faster/.test(r2.lines[2]));
  const v = M.verdict(g);
  check('verdict: "You filled the shadow."; Lehmann’s caution, 1200 km, and solidity credited to 1940 and 1971, not to her', v.fate === 'You filled the shadow.' && /could not be proved/.test(v.paper) && /1200 km/.test(v.means) && /never said/.test(v.means) && /1940/.test(v.means) && /1971/.test(v.means) && /inner core/.test(v.quote) && v.quote.split(' ').length < 15, v.fate);
  const h = M.newGame(); for (let i = 0; i < 12; i++) M.fire(h, 40 + 2 * i); M.reveal(h); let lastH; for (let i = 0; i < C.WAVES2; i++) lastH = M.fire2(h, 20 + 3 * i);
  check('a player who never dives steeply: act two ends after its eight waves, "The shadow stayed dark."', lastH.last === true && h.touches === 0 && (M.reveal2(h), M.verdict(h).fate) === 'The shadow stayed dark.');
  const q1 = M.quake(M.newGame(), 0.95), q2 = M.quake(M.newGame(), 1.08);
  check('the author’s tool quake(): a ball a little slower lights none of the first three shadow posts; a little faster lights all four', q1.lit.filter(p => p < 145).length === 0 && q2.lit.length === 4, JSON.stringify([q1.lit, q2.lit]));
  check('quake() takes a size for the author: a tiny ball at 1.05 lights fewer', M.quake(M.newGame(), 1.05, 0.1).lit.length < 4);
}

// 7. the play-it-in-numbers table (build.md §3): shadow posts lit by size and speed
out.push('\nShadow posts lit (1 = 120°, 2 = 130°, 3 = 140°, 4 = 150°) by the ball’s radius (rows, fraction of r0) and its speed (cols, × core):');
const speeds = [0.75, 0.8, 0.85, 0.9, 0.95, 1.0, 1.05, 1.075, 1.1, 1.15, 1.25];
out.push('r1\\v  ' + speeds.map(s => String(s).padStart(6)).join(''));
[0.10, 0.15, 0.20, 0.2205, 0.25, 0.30, 0.35, 0.40, 0.45, 0.50].forEach(r1 => {
  out.push(String(r1).padEnd(6) + speeds.map(s => { const h = M.heardByQuake(M.threeShell(r1, s)); return [120, 130, 140, 150].map((p, i) => h[p] ? i + 1 : '').join('').padStart(6); }).join(''));
});

out.push('\n' + (fails ? fails + ' FAILED' : 'ALL PASSED') + ' (' + out.filter(l => /^(PASS|FAIL)/.test(l)).length + ' checks)');
const text = out.join('\n');
console.log(text);
require('fs').writeFileSync(require('path').join(__dirname, 'calibration-result.txt'), text + '\n');
process.exit(fails ? 1 : 0);
