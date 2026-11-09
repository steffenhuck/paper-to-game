// Me and My Friends — mechanism. The single source of truth: plain functions, no DOM.
// Runs unchanged in Node (calibration.js, loop.js) and in the browser (inlined verbatim by build.py).
// Kind: RECONSTRUCTED estimates, played as a TOY. The paper (Bagues & Zinovyeva, 2025) reports correlations and
// probit marginal effects; the game lets the player move them as if they were levers, which the paper does not claim.

var CONFIG = {
  // ---- part one: a country (HBSC, 37 countries, age 11) ----------------------------------------------
  SHARE_MEAN_11: 0.27,          // p. 17: share of close friends of the opposite sex at age 11 (27%)
  SHARE_FINLAND: 0.16,          // p. 5, p. 17: Finland 16%
  SHARE_PORTUGAL: 0.39,         // p. 5, p. 17: Portugal 39%
  NONE_FINLAND: 0.41,           // p. 17: 41% of Finnish 11-year-olds have no opposite-sex close friend
  NONE_PORTUGAL: 0.06,          // p. 17: 6% in Portugal
  // the three country dials and their reported correlations with the share of opposite-sex friends (Fig. 3, p. 25)
  CORR_GDP: -0.39,              // Fig. 3, p. 25: GDP per capita (log), rho = -0.39
  CORR_EQUALITY: -0.43,         // Fig. 3, p. 25: Gender Inequality Index rho = +0.43; equality is its mirror, -0.43
  CORR_PERMISSIVE: -0.67,       // Fig. 3, p. 25: share of parents who prize independence over obedience, rho = -0.67
  // correlations among the dials, for the robustness check (not used in play)
  CORR_GDP_EQUALITY: 0.69,      // Fig. A3: log GDP vs GII rho = -0.69, so GDP vs equality +0.69
  CORR_GDP_PERMISSIVE: 0.59,    // p. 14: permissive parenting vs GDP rho = 0.59
  CORR_EQUALITY_PERMISSIVE: 0.72, // p. 14: permissive vs GII rho = -0.72, so vs equality +0.72
  // dial positions: the paper's minimum, mean and maximum for each country measure (Table A1), shown as words
  GDP_10K: [1.6, 4.61, 13.0],   // Table A1: GDP per capita (10k PPP $), min / mean / max (Ukraine ... Luxembourg)
  EQUALITY_GGGI: [0.61, 0.73, 0.85], // Table A1: Global Gender Gap Index min / mean / max (higher = more equal)
  PERMISSIVE_SHARE: [0.07, 0.32, 0.81], // Table A1: share of parents classed permissive, min / mean / max
  CORNER_SPREAD: 2,             // our choice: dials two steps apart = a corner few real countries live in (dials travel together, rho 0.59-0.72)
  // ---- part two: a street in Britain (Millennium Cohort Study, age 11) -----------------------------
  MIXED_LOWEST_FIFTH: 0.656,    // Fig. 4, p. 31: share with opposite-sex friends at 11, lowest income fifth
  MIXED_HIGHEST_FIFTH: 0.482,   // Fig. 4, p. 31: highest income fifth
  MIXED_QUINTILES: [0.656, 0.64, 0.60, 0.58, 0.482], // Fig. 4 bars; the middle three read off the figure
  // marginal effects at age 11 on "has opposite-sex friends", per standard deviation unless noted
  ME_NORMS_11: 0.018,           // Table A14 col 2: maternal gender egalitarianism, age 11
  ME_PERMISSIVE: -0.0177,       // Table 4 col 3: "think for yourself" vs "obey", with income
  ME_AUTHORITATIVE: -0.0022,    // Table 4 col 3: "work hard" vs "obey", with income
  ME_CLUBS: -0.010,             // Table 5 col 5: clubs outside school (z), with income and the other practices
  ME_UNSUPERVISED: 0.024,       // Table 5 col 5: unsupervised time outside (z)
  ME_INCOME_11: -0.062,         // Table 5 col 5: family income (z) at 11, with practices; -0.074 without (col 4)
  // what a big house (top fifth) typically does, in z-scores: ours, from the paper's correlations
  BIG_TYPICAL: {
    norms: 0.2,                 // Table A4: income vs mother's gender norms rho = 0.141; top fifth ~ +1.4 SD income
    permissive: 0.5, authoritative: 0.35, // Table A6: permissive parents are richer (log income +0.34); our split for the top fifth
    clubs: 0.4,                 // p. 33: clubs "a practice more common in wealthier families"; our size
    unsupervised: -0.4          // p. 33: roaming "a practice associated with lower income"; our size
  },
  LEVER_SD: 1.5,                // our choice: the ends of a lever sit 1.5 SD either side of the mean
  CLUBS_FLOOR: -0.6,            // Table A5: clubs mean 0.63 a week, so "none" is about 0.6 SD below the mean
  // the paper's own decomposition of the income gradient, for the result text
  GAP_SHARE_WEEK: 0.13,         // p. 33: practices reduce the income coefficient by around 13%
  GAP_SHARE_CHILD: 0.25,        // p. 34: personality traits and cognitive ability explain about 25%
  // ---- downstream, for the verdict (read, not played) ---------------------------------------------
  SD_GCSE: 0.067, SD_ALEVEL: 0.072, // Table 7 cols 2, 4: opposite-sex share of chosen subjects, SD units
  PP_FRIENDS_14: 0.06,          // Table 7 col 6: opposite-sex friends at 14, +6 points
  SD_VIEWS_14: 0.09,            // p. 36: egalitarian views at 14, +0.09 SD
  PP_OCCUPATION: 0.03,          // p. 36: aspired occupation, about 3 points more opposite-sex workers
  RHO_STEM: 0.43, RHO_DUNCAN: -0.47, // p. 5: country level, share of opposite-sex friends vs female STEM propensity / Duncan
  // ---- the drawing (ours) --------------------------------------------------------------------------
  KIDS: 10,                     // five boys, five girls: "of ten kids"
  LINES: 12,                    // friendship lines in a playground of ten
  TRIES_COUNTRY: 3, TRIES_STREET: 3
};

// ---------- random numbers: seeded, replayable ----------
function rng(seed) {
  var s = (seed >>> 0) || 1;
  return function () { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; };
}
function clamp(x, a, b) { return Math.max(a, Math.min(b, x)); }

// ---------- part one: a country ----------
// dials: {money, jobs, learn} each -1 (small house / mostly dads / do as you're told), 0 (middle), +1 (big / both the same / think for yourself)
function countryShare(d) {
  var C = CONFIG;
  var w = (C.CORR_GDP * d.money + C.CORR_EQUALITY * d.jobs + C.CORR_PERMISSIVE * d.learn) /
          (Math.abs(C.CORR_GDP) + Math.abs(C.CORR_EQUALITY) + Math.abs(C.CORR_PERMISSIVE)); // -1 (all up) .. +1 (all down)
  var mid = (C.SHARE_FINLAND + C.SHARE_PORTUGAL) / 2, half = (C.SHARE_PORTUGAL - C.SHARE_FINLAND) / 2;
  return mid + half * w;
}
// share of children with no opposite-sex close friend, from the share of opposite-sex friends: the line through Finland and Portugal (Fig. A9)
function noneFromShare(s) {
  var C = CONFIG;
  var b = (C.NONE_PORTUGAL - C.NONE_FINLAND) / (C.SHARE_PORTUGAL - C.SHARE_FINLAND);
  return clamp(C.NONE_FINLAND + b * (s - C.SHARE_FINLAND), 0.02, 0.6);
}
function cornerSpread(d) { var v = [d.money, d.jobs, d.learn]; return Math.max.apply(null, v) - Math.min.apply(null, v); }
function country(d) {
  var s = countryShare(d), n = noneFromShare(s);
  // hedge: the equality dial moved while the parents' dial stayed in the middle. Bivariately each goes with less mixing; a multivariate
  // reading of the same reported correlations gives the weight to parenting, so here the paper cannot say which does the work.
  return { share: s, none: n, kids: CONFIG.KIDS * (1 - n), corner: cornerSpread(d) >= CONFIG.CORNER_SPREAD, hedge: d.jobs !== 0 && d.learn === 0, dials: { money: d.money, jobs: d.jobs, learn: d.learn } };
}
// the multivariate alternative construction (robustness only): beta = R^-1 r, same scaling on the diagonal
function countryShareMultivariate(d) {
  var C = CONFIG;
  var R = [[1, C.CORR_GDP_EQUALITY, C.CORR_GDP_PERMISSIVE], [C.CORR_GDP_EQUALITY, 1, C.CORR_EQUALITY_PERMISSIVE], [C.CORR_GDP_PERMISSIVE, C.CORR_EQUALITY_PERMISSIVE, 1]];
  var r = [C.CORR_GDP, C.CORR_EQUALITY, C.CORR_PERMISSIVE];
  var b = solve3(R, r);
  var raw = b[0] * d.money + b[1] * d.jobs + b[2] * d.learn, top = Math.abs(b[0] + b[1] + b[2]);
  var w = raw / top; // all up -> -1, all down -> +1
  var mid = (C.SHARE_FINLAND + C.SHARE_PORTUGAL) / 2, half = (C.SHARE_PORTUGAL - C.SHARE_FINLAND) / 2;
  return mid + half * w;
}
function solve3(A, b) {
  A = A.map(function (r) { return r.slice(); }); b = b.slice();
  for (var i = 0; i < 3; i++) {
    var p = i; for (var k = i + 1; k < 3; k++) if (Math.abs(A[k][i]) > Math.abs(A[p][i])) p = k;
    var t = A[i]; A[i] = A[p]; A[p] = t; t = b[i]; b[i] = b[p]; b[p] = t;
    for (k = i + 1; k < 3; k++) { var f = A[k][i] / A[i][i]; for (var j = i; j < 3; j++) A[k][j] -= f * A[i][j]; b[k] -= f * b[i]; }
  }
  var x = [0, 0, 0];
  for (i = 2; i >= 0; i--) { var s = b[i]; for (j = i + 1; j < 3; j++) s -= A[i][j] * x[j]; x[i] = s / A[i][i]; }
  return x;
}

// ---------- part two: the big houses on a street ----------
// levers: {mums, learn, week} each -1 / 0 / +1: mums (stay home / either way / same as dads); learn (do as you're told / work hard /
// think for yourself); week (all clubs / a bit of both / out on the street)
function leverZ(l, typical) {
  var C = CONFIG, T = typical || C.BIG_TYPICAL;
  var norms = l.mums * C.LEVER_SD;
  var perm = l.learn === 1 ? 1 : 0, auth = l.learn === 0 ? 1 : 0;
  var clubs = l.week === -1 ? C.LEVER_SD : l.week === 0 ? 0 : C.CLUBS_FLOOR;
  var unsup = l.week === -1 ? -C.LEVER_SD : l.week === 0 ? 0 : C.LEVER_SD;
  return {
    norms: C.ME_NORMS_11 * (norms - T.norms),
    learn: C.ME_PERMISSIVE * (perm - T.permissive) + C.ME_AUTHORITATIVE * (auth - T.authoritative),
    clubs: C.ME_CLUBS * (clubs - T.clubs),
    unsup: C.ME_UNSUPERVISED * (unsup - T.unsupervised)
  };
}
function bigHouses(l, typical) {
  var C = CONFIG, e = leverZ(l, typical);
  var p = clamp(C.MIXED_HIGHEST_FIFTH + e.norms + e.learn + e.clubs + e.unsup, 0.05, 0.95);
  return { share: p, kids: C.KIDS * p, effects: e, target: C.KIDS * C.MIXED_LOWEST_FIFTH, levers: { mums: l.mums, learn: l.learn, week: l.week } };
}
function smallHouses() { return { share: CONFIG.MIXED_LOWEST_FIFTH, kids: CONFIG.KIDS * CONFIG.MIXED_LOWEST_FIFTH }; }
function bestBigHouses(typical) {
  var best = null;
  [-1, 0, 1].forEach(function (a) { [-1, 0, 1].forEach(function (b) { [-1, 0, 1].forEach(function (c) {
    var r = bigHouses({ mums: a, learn: b, week: c }, typical); if (!best || r.share > best.share) best = r; }); }); });
  return best;
}

// ---------- the drawing: ten kids, twelve lines ----------
// For a playground with `kidsWith` children (0..10, continuous) who have a friend from the other side and share `s` of lines crossing:
// returns {kids:[{side,x,y}], lines:[{a,b,cross}]} with exactly round(kidsWith) children holding at least one red line.
function drawPlayground(seed, kidsWith, share) {
  var C = CONFIG, r = rng(seed), n = C.KIDS, half = n / 2;
  var kids = [];
  for (var i = 0; i < n; i++) {
    var side = i < half ? 0 : 1, k = i % half;
    kids.push({ side: side, x: side === 0 ? 0.08 + k * 0.085 + (r() - 0.5) * 0.03 : 0.58 + k * 0.085 + (r() - 0.5) * 0.03, y: 0.35 + (k % 2) * 0.3 + (r() - 0.5) * 0.12 });
  }
  var want = clamp(Math.round(kidsWith), 0, n);
  var crossLines = clamp(Math.round(share * C.LINES), Math.ceil(want / 2), C.LINES);
  // choose the kids who get a red line: `want` of them, balanced across sides as far as possible
  var order = shuffle(kids.map(function (_, i) { return i; }), r);
  var left = order.filter(function (i) { return kids[i].side === 0; }), right = order.filter(function (i) { return kids[i].side === 1; });
  var nl = Math.min(left.length, Math.ceil(want / 2)), nr = Math.min(right.length, want - nl);
  if (nl + nr < want) nl = Math.min(left.length, want - nr);
  var redL = left.slice(0, nl), redR = right.slice(0, nr);
  var lines = [], seen = {};
  function add(a, b, cross) { var key = a < b ? a + '-' + b : b + '-' + a; if (seen[key] || a === b) return false; seen[key] = 1; lines.push({ a: a, b: b, cross: cross }); return true; }
  // red lines: every chosen kid gets at least one, pairing left with right
  var m = Math.max(redL.length, redR.length);
  for (i = 0; i < m && (redL.length && redR.length); i++) add(redL[i % redL.length], redR[i % redR.length], true);
  var guard = 0;
  while (lines.filter(function (x) { return x.cross; }).length < crossLines && redL.length && redR.length && guard++ < 200)
    add(redL[Math.floor(r() * redL.length)], redR[Math.floor(r() * redR.length)], true);
  // black lines: same side, until twelve
  guard = 0;
  while (lines.length < C.LINES && guard++ < 500) {
    var side = r() < 0.5 ? 0 : 1, pool = kids.map(function (_, i) { return i; }).filter(function (i) { return kids[i].side === side; });
    add(pool[Math.floor(r() * pool.length)], pool[Math.floor(r() * pool.length)], false);
  }
  var withRed = {}; lines.forEach(function (x) { if (x.cross) { withRed[x.a] = 1; withRed[x.b] = 1; } });
  return { kids: kids, lines: lines, kidsWithRed: Object.keys(withRed).length, crossLines: lines.filter(function (x) { return x.cross; }).length };
}
function shuffle(a, r) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(r() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }

// ---------- words ----------
function kidsWords(k) { // "about six", "six and a half", "nearly all ten"
  var w = ['none', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'all ten'];
  var f = Math.round(k * 2) / 2, i = Math.floor(f);
  if (f >= 10) return 'all ten';
  if (f - i === 0.5) return (i === 0 ? 'half a kid' : w[i] + ' and a half');
  return 'about ' + w[i];
}
function moveWords(delta) { // for one lever's effect, in kids of ten
  var a = Math.abs(delta), dir = delta > 0 ? 'up' : 'down';
  if (a < 0.1) return 'hardly at all';
  if (a < 0.35) return dir + ' a touch';
  if (a < 0.75) return dir + ' by about half a kid in ten';
  if (a < 1.3) return dir + ' by about one kid in ten';
  return dir + ' by about ' + Math.round(a) + ' kids in ten';
}
var DIAL_WORDS = {
  money: ['small houses', 'middling houses', 'big houses'],
  jobs: ['jobs mostly for dads', 'dads first, then mums', 'jobs for both the same'],
  learn: ['do as you’re told', 'work hard', 'think for yourself'],
  mums: ['mums stay home', 'mums can go either way', 'mums work the same as dads'],
  week: ['all clubs', 'a bit of both', 'out on the street']
};
function dw(key, v) { return DIAL_WORDS[key][v + 1]; }
function cap(s) { return s.replace(/^./, function (c) { return c.toUpperCase(); }); }

function countryResult(c, prev) {
  var C = CONFIG, k = c.kids, lines = [];
  lines.push('You set ' + dw('money', c.dials.money) + ', ' + dw('jobs', c.dials.jobs) + ' and parents who say “' + dw('learn', c.dials.learn) + '”.');
  lines.push(kidsWords(k).replace(/^./, function (m) { return m.toUpperCase(); }) + ' of your ten kids have a friend from the other side' + (prev == null ? '.' : prev === k ? ', the same as last time.' : ', ' + moveWords(k - prev).replace('by ', 'by ') + ' from last time.'));
  var fin = C.KIDS * (1 - C.NONE_FINLAND), por = C.KIDS * (1 - C.NONE_PORTUGAL);
  var where = k <= fin + 0.5 ? 'That is the Finland end of the ruler, where the rich, equal, think-for-yourself countries sit.' :
              k >= por - 0.6 ? 'That is the Portugal end of the ruler, where the poorer, less equal, do-as-you’re-told countries sit.' :
              'That is the middle of the ruler, about where most of the 37 countries sit.';
  lines.push(where);
  if (c.corner) lines.push('Few real countries look like this one: in the paper’s 37, rich, equal and think-for-yourself go together. Out here the paper can’t say much.');
  else if (c.hedge) lines.push('Here equal jobs and what parents say have come apart. In the paper’s 37 countries they go together, and from outside it can’t tell which one does the work. That is what looking inside is for.');
  return lines;
}
function streetResult(b, prev) {
  var C = CONFIG, e = b.effects, lines = [];
  lines.push('You set the big houses to “' + dw('mums', b.levers.mums) + '”, “' + dw('learn', b.levers.learn) + '” and ' + dw('week', b.levers.week) + '.');
  lines.push(kidsWords(b.kids).replace(/^./, function (m) { return m.toUpperCase(); }) + ' of the ten big-house kids have a friend from the other side' + (prev == null ? '.' : prev === b.kids ? ', the same as last time.' : ', ' + moveWords(b.kids - prev) + ' from last time.') + ' The small-house kids are at ' + kidsWords(C.KIDS * C.MIXED_LOWEST_FIFTH) + '.');
  var parts = [];
  parts.push('The week (' + dw('week', b.levers.week) + '): ' + moveWords(C.KIDS * (e.clubs + e.unsup)) + '.');
  parts.push('“' + cap(dw('learn', b.levers.learn)) + '”: ' + moveWords(C.KIDS * e.learn) + '.');
  parts.push('“' + cap(dw('mums', b.levers.mums)) + '”: ' + moveWords(C.KIDS * e.norms) + '.');
  lines.push(parts.join(' '));
  if (b.levers.mums === -1) lines.push('Inside one country it runs the other way from the map: the kids of mums who say “same as dads” have a friend from the other side a little more often, not less.');
  else if (b.levers.mums === 1) lines.push('Inside one country this runs the other way from the map: equal-minded mums’ kids mix a little more, not less.');
  return lines;
}
function shortfall() {
  var C = CONFIG, best = bestBigHouses(), gap = C.MIXED_LOWEST_FIFTH - C.MIXED_HIGHEST_FIFTH, closed = (best.share - C.MIXED_HIGHEST_FIFTH) / gap;
  var frac = closed < 0.4 ? 'about a third' : closed < 0.6 ? 'about half' : 'most';
  return {
    bestKids: best.kids, closed: closed, levers: best.levers,
    lines: [
      'You can’t get there from here. Pulling every lever as far as it goes (' + dw('mums', best.levers.mums) + ', “' + dw('learn', best.levers.learn) + '”, ' + dw('week', best.levers.week) + ') gets the big-house kids to ' + kidsWords(best.kids) + ' of ten, and closes ' + frac + ' of the gap.',
      'The paper, looking at what families actually do rather than what they could, puts the week at about an eighth of the gap and the children themselves at a quarter: big-house kids are calmer, get on with everyone, score higher, grow up a little later, and every one of those goes with same-side friends. They are also more popular, and happier with the friends they have.',
      'The rest of the gap, more than half, nobody can explain yet.'
    ]
  };
}
function verdict(countries, streets) {
  var C = CONFIG, best = null, worst = null;
  countries.forEach(function (c) { if (!best || c.kids > best.kids) best = c; if (!worst || c.kids < worst.kids) worst = c; });
  var last = streets.length ? streets[streets.length - 1] : null, top = null;
  streets.forEach(function (s) { if (!top || s.kids > top.kids) top = s; });
  var did = [];
  if (best) did.push('Of the countries you built, the one where most kids had a friend from the other side (' + kidsWords(best.kids) + ' of ten) was ' + dw('money', best.dials.money) + ', ' + dw('jobs', best.dials.jobs) + ', “' + dw('learn', best.dials.learn) + '”.' + (worst && worst !== best ? ' The fewest (' + kidsWords(worst.kids) + ') was ' + dw('money', worst.dials.money) + ', ' + dw('jobs', worst.dials.jobs) + ', “' + dw('learn', worst.dials.learn) + '”.' : ''));
  if (top) did.push('Inside, you got the big-house kids to ' + kidsWords(top.kids) + ' of ten; the small-house kids were at ' + kidsWords(C.KIDS * C.MIXED_LOWEST_FIFTH) + '.');
  return {
    did: did.join(' '),
    paper: 'Richer, more equal countries have more boys-on-one-side playgrounds at eleven, and more boys-on-one-side universities too. Inside a country it is the money, not the views: children of equal-minded mums mix a little more; children of richer families mix less, in 34 countries of 37. Part of why is the week money buys, part is the calm, popular child money raises, who likes the friends they have; most of it the paper cannot say.',
    means: 'Children with a friend from the other side at seven pick slightly less boyish or girlish subjects at sixteen, still mix at fourteen, hold more equal views, and want slightly more mixed jobs. Where the playground mixes, so does the university. The paper shows patterns, not levers; this game let you pull them.'
  };
}

var MECH = { CONFIG: CONFIG, rng: rng, country: country, countryShare: countryShare, countryShareMultivariate: countryShareMultivariate, noneFromShare: noneFromShare,
  bigHouses: bigHouses, smallHouses: smallHouses, bestBigHouses: bestBigHouses, leverZ: leverZ, drawPlayground: drawPlayground, kidsWords: kidsWords, moveWords: moveWords,
  countryResult: countryResult, streetResult: streetResult, shortfall: shortfall, verdict: verdict, DIAL_WORDS: DIAL_WORDS, dw: dw, solve3: solve3 };
if (typeof module !== 'undefined') module.exports = MECH;
