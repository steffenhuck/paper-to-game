// Carbuccia's Counter — mechanism. The single source of truth: plain functions, no DOM.
// Runs unchanged in Node (calibration.js, loop.js) and in the browser (inlined verbatim by build.py).
// Kind: RECONSTRUCTED. The paper's intention-to-treat estimates are the data; the ward, the purse, the years and
// the composition of targeted orders are ours.
//
// Paper: Carbuccia, Heim, Barone & Chevallier (2025), "A randomized controlled trial on the effect of administrative
// burden and information costs on social inequalities in early childcare access in France", Nature Human Behaviour
// 10:64–79, doi 10.1038/s41562-025-02293-4. "ED" = Extended Data. Shares are of households; the game calls them mothers.

var CONFIG = {
  // ---- the ward (ours, from the paper's sample) -------------------------------------------------
  WARD: 100,                       // ours: a hundred mothers stand for the 1,849 households (shares become counts)
  SHARE: {
    nodegree: 0.39,                // text: 729 of 1,849 households low-SES (mother without post-secondary education)
    abroad: 0.46,                  // text: 845 of 1,849 households with the mother born outside France
    lowknow: 0.15,                 // ours: share with poor baseline knowledge of early childcare; the paper calls the subgroup small
    inactive: 0.30                 // Table 1: 70% of mothers active at baseline
  },
  // cross-shares the paper does not report (ours): share of a target subgroup that is in each cut group
  CROSS: {
    nodegree: { abroad: 0.65 },    // ours: of mothers without a degree, 65% born abroad (so 0.39×0.65/0.46 = 55% of the abroad group)
    abroad:   { nodegree: 0.55 },  // ours: of mothers born abroad, 55% without a degree (consistent with the line above)
    lowknow:  { nodegree: 0.67, abroad: 0.70 },  // ours
    inactive: { nodegree: 0.60, abroad: 0.60 }   // ours
  },
  // ---- the control group: shares at each step, by group -----------------------------------------
  // wants: intention at baseline (text: 81% overall; 71% low-SES, 77% migrant; Fig. 2 gaps −0.16 and −0.06).
  // apply, access: ED Table 3 control means (early childcare). dcApply, dcAccess: ED Table 4 (daycare = crèche).
  CONTROL: {
    all:      { wants: 0.81, apply: 0.75, access: 0.57, dcApply: 0.59, dcAccess: 0.21 },  // Table 2
    degree:   { wants: 0.87, apply: 0.84, access: 0.69, dcApply: 0.66, dcAccess: 0.23 },  // ED3, ED4; wants = 0.71 + 0.16
    nodegree: { wants: 0.71, apply: 0.60, access: 0.36, dcApply: 0.47, dcAccess: 0.19 },  // ED3, ED4; wants from text
    france:   { wants: 0.83, apply: 0.83, access: 0.70, dcApply: 0.63, dcAccess: 0.24 },  // ED3, ED4; wants = 0.77 + 0.06
    abroad:   { wants: 0.77, apply: 0.67, access: 0.41, dcApply: 0.56, dcAccess: 0.19 },  // ED3, ED4; wants from text
    lowknow:  { wants: 0.81, apply: 0.36, access: 0.05, dcApply: 0.30, dcAccess: 0.04 },  // apply, access: text (Fig. 5); wants, dc: ours
    inactive: { wants: 0.81, apply: 0.40, access: 0.15, dcApply: 0.33, dcAccess: 0.11 }   // apply: text (Fig. 6); access read off Fig. 6; dc: ED6 (0.33, 0.11); wants ours
  },
  // ---- intention-to-treat effects (percentage points as shares) ---------------------------------
  FIRST_STAGE: 0.52,               // ED Table 2: share of those offered support who took it; text: "compliance rate of 52%"
  // the information-only arm: Table 2 point estimates −0.01 / −0.02 / +0.01 / −0.01, none distinguishable from zero
  // (every simultaneous CI includes 0; the text: "no impact"). The game plays them as zero, so that videos sent to one
  // group do not widen a gap by a rounding of a null; the point estimates and the CI are kept here for the check and About.
  VIDEOS: { apply: 0, access: 0, dcApply: 0, dcAccess: 0 },
  VIDEOS_POINT: { apply: -0.01, access: -0.02, dcApply: 0.01, dcAccess: -0.01 },  // Table 2
  VIDEOS_SCI: { apply: [-0.06, 0.04], access: [-0.08, 0.04], dcApply: [-0.06, 0.07], dcAccess: [-0.07, 0.05] }, // Table 2
  CALLS: {                         // information + support vs control, ITT
    all:      { apply: 0.04, access: 0.02, dcApply: 0.08, dcAccess: 0.05 },      // Table 2
    degree:   { apply: 0.01, access: 0.00, dcApply: 0.07, dcAccess: 0.08 },      // ED3, ED4
    nodegree: { apply: 0.09, access: 0.03, dcApply: 0.10, dcAccess: 0.00 },      // ED3, ED4
    france:   { apply: 0.00, access: -0.02, dcApply: 0.06, dcAccess: 0.06 },     // ED3, ED4
    abroad:   { apply: 0.09, access: 0.07, dcApply: 0.09, dcAccess: 0.05 },      // ED3, ED4
    // exploratory subgroups: the text gives ATT (effect on those who took the calls); ITT = ATT × first stage
    lowknow:  { attApply: 0.42, attAccess: 0.48, dcApply: 0.11, dcAccess: 0.15 }, // text (Fig. 5); dc ours (read as about the same as apply/access scaled)
    inactive: { attApply: 0.32, attAccess: 0.08, dcApply: 0.16, dcAccess: 0.04 }  // text (apply, "β = 0.32"); access read off Fig. 6; dc: ED6 inactive rows (ITT 0.19/0.14 apply, 0.04 access, averaged)
  },
  ATT: {                           // ED Table 2, for the About screen and the calibration check
    all: { apply: 0.08, access: 0.03, dcApply: 0.15, dcAccess: 0.10 }
  },
  REDUCED_ACTIVITY: { degree: { control: 0.38, itt: -0.12 }, nodegree: { control: 0.26, itt: 0.06 } }, // ED Table 5
  // ---- costs and the purse ----------------------------------------------------------------------
  COST: { videos: 5.5, calls: 55 },  // text: €5.5 and €55 per participant
  PURSE_PER_YEAR: 3000,            // ours: enough to call the 39 mothers without a degree; calls to everyone need two years' money
  YEARS: 4,                        // ours
  // ---- words (ours): how a change of so many mothers in a hundred is described ------------------
  WORDS: { same: 1.5, few: 5, more: 12 }
};

// ---------- groups, targets, cuts ----------
var CUTS = {
  degree:     { a: 'degree', b: 'nodegree', label: 'by degree' },
  birthplace: { a: 'france', b: 'abroad',   label: 'by birthplace' }
};
var GROUP_NAME = {
  all: 'everyone', degree: 'mothers with a degree', nodegree: 'mothers without a degree',
  france: 'mothers born in France', abroad: 'mothers born abroad',
  lowknow: 'mothers who know least about crèches', inactive: 'mothers not in work'
};
var TARGETS = ['all', 'nodegree', 'abroad', 'lowknow', 'inactive'];
var TOOLS = ['videos', 'calls'];
var STEPS = ['wants', 'apply', 'access'];

function share(g) {
  var S = CONFIG.SHARE;
  if (g === 'all') return 1;
  if (g === 'degree') return 1 - S.nodegree;
  if (g === 'france') return 1 - S.abroad;
  return S[g];
}
function count(g) { return Math.round(share(g) * CONFIG.WARD); }

// share of group g that a target t covers
function coverage(t, g) {
  if (t === 'all' || t === g) return 1;
  if (g === 'all') return share(t);
  var comp = { degree: 'nodegree', nodegree: 'degree', france: 'abroad', abroad: 'france' };
  var X = CONFIG.CROSS[t] || {};
  // cross-share of target in g: X[g] if given, else 1 - X[complement of g] if given, else 0
  var inG = (X[g] != null) ? X[g] : (X[comp[g]] != null ? 1 - X[comp[g]] : null);
  if (inG == null) return 0;
  return Math.min(1, share(t) * inG / share(g));
}

// the ITT of a tool on the people a target covers; for 'calls' the target's own conditional estimate
function effect(tool, t, key) {
  if (tool === 'videos') return CONFIG.VIDEOS[key];
  var e = CONFIG.CALLS[t];
  if (key === 'apply' && e.attApply != null) return e.attApply * CONFIG.FIRST_STAGE;
  if (key === 'access' && e.attAccess != null) return e.attAccess * CONFIG.FIRST_STAGE;
  return e[key];
}

function clamp01(x) { return Math.max(0, Math.min(1, x)); }

// the ladder of group g under an order {tool, target} (null = nothing sent): shares at each step
function ladder(g, order) {
  var c = CONFIG.CONTROL[g] || controlOfRest(g);
  var L = { wants: c.wants, apply: c.apply, access: c.access, dcApply: c.dcApply, dcAccess: c.dcAccess };
  if (order && order.tool) {
    var t = order.target;
    // when everyone is treated, each group gets its own conditional estimate
    var src = (t === 'all' && CONFIG.CALLS[g]) ? g : t;
    var cov = coverage(t, g);
    ['apply', 'access', 'dcApply', 'dcAccess'].forEach(function (k) { L[k] += cov * effect(order.tool, src, k); });
  }
  L.apply = clamp01(L.apply); L.access = clamp01(Math.min(L.access, L.apply));
  L.dcApply = clamp01(Math.min(L.dcApply, L.apply)); L.dcAccess = clamp01(Math.min(L.dcAccess, L.access, L.dcApply));
  return L;
}
// the rest of the ward outside a target subgroup: control means by subtraction
function controlOfRest(g) {
  var t = g.replace(/^rest-/, ''), s = share(t), A = CONFIG.CONTROL.all, T = CONFIG.CONTROL[t], r = {};
  Object.keys(A).forEach(function (k) { r[k] = clamp01((A[k] - s * T[k]) / (1 - s)); });
  return r;
}

function cost(order) {
  if (!order || !order.tool) return 0;
  return Math.round(count(order.target) * CONFIG.COST[order.tool]);
}

// gaps on the board, in mothers per hundred, for a cut: group a minus group b
function gaps(cut, order) {
  var A = ladder(CUTS[cut].a, order), B = ladder(CUTS[cut].b, order);
  return { apply: Math.round((A.apply - B.apply) * CONFIG.WARD), access: Math.round((A.access - B.access) * CONFIG.WARD) };
}

// ---------- the game ----------
function newGame() {
  return { year: 1, purse: CONFIG.PURSE_PER_YEAR, orders: [], results: [], done: false };
}
function canAfford(game, order) { return cost(order) <= game.purse; }

function runYear(game, order) {
  if (game.done) throw new Error('game over');
  if (order && order.tool && !canAfford(game, order)) throw new Error('cannot afford');
  var o = (order && order.tool) ? { tool: order.tool, target: order.target } : null;
  var c = cost(o);
  var r = {
    year: game.year, order: o, cost: c, purseBefore: game.purse, purseAfter: game.purse - c,
    sent: o ? count(o.target) : 0,
    pickedUp: (o && o.tool === 'calls') ? Math.round(count(o.target) * CONFIG.FIRST_STAGE) : 0,
    ladders: {}, gaps: {}, control: {}
  };
  ['degree', 'nodegree', 'france', 'abroad'].forEach(function (g) { r.ladders[g] = ladder(g, o); r.control[g] = ladder(g, null); });
  if (o && o.target !== 'all') {
    r.ladders.target = ladder(o.target, o); r.control.target = ladder(o.target, null);
    r.ladders.rest = ladder('rest-' + o.target, null); r.control.rest = r.ladders.rest;
  }
  r.gaps.degree = gaps('degree', o); r.gaps.birthplace = gaps('birthplace', o);
  r.gaps.control = { degree: gaps('degree', null), birthplace: gaps('birthplace', null) };
  r.words = words(r);
  game.orders.push(o); game.results.push(r);
  game.purse = r.purseAfter;
  if (game.year >= CONFIG.YEARS) game.done = true; else { game.year += 1; game.purse += CONFIG.PURSE_PER_YEAR; }
  return r;
}

// ---------- words (ours) ----------
function sizeWord(d) { // d in mothers per hundred, signed
  var W = CONFIG.WORDS, a = Math.abs(d);
  if (a < W.same) return 'about as many';
  var s = a < W.few ? 'a few' : a < W.more ? 'noticeably' : 'many';
  return s + (d > 0 ? ' more' : ' fewer');
}
function pts(L, C, k) { return (L[k] - C[k]) * CONFIG.WARD; }
function oneIn(p) { var n = Math.round(1 / p); return ['', '', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'][n] || String(n); }

function words(r) {
  var o = r.order, w = {};
  if (!o) {
    w.what = 'Nothing was sent this year. The purse carries over.';
    w.steps = 'The ward looks like the ward that got nothing: the bars sit on their ghosts.';
    w.paper = '';
    return w;
  }
  var tn = GROUP_NAME[o.target], n = r.sent;
  if (o.tool === 'videos') {
    w.what = (o.target === 'all' ? 'All ' + n + ' mothers' : 'The ' + n + ' ' + tn) + ' got the five text messages and the short films, with reminders.';
    w.steps = 'About as many applied as with nothing, and about as many got a place. The bars sit on their ghosts.';
    w.paper = 'The paper found the same: it could not tell the ward that got the videos from the ward that got nothing, on applications or on places, for any group of mothers.';
    return w;
  }
  w.what = 'A helper phoned ' + (o.target === 'all' ? 'all ' + n + ' mothers' : 'the ' + n + ' ' + tn) + '; about half picked up (' + r.pickedUp + '), and the forms were filled in with them.';
  var T = o.target === 'all' ? null : { L: r.ladders.target, C: r.control.target };
  var g = o.target === 'all' ? 'nodegree' : o.target;
  var dA = T ? pts(T.L, T.C, 'apply') : pts(r.ladders.nodegree, r.control.nodegree, 'apply');
  var dP = T ? pts(T.L, T.C, 'access') : pts(r.ladders.nodegree, r.control.nodegree, 'access');
  var who = o.target === 'all' ? 'Of the mothers without a degree, ' : 'Of them, ';
  w.steps = who + sizeWord(dA) + ' applied' + (o.target === 'all' ? '; of the mothers with a degree, ' + sizeWord(pts(r.ladders.degree, r.control.degree, 'apply')) : '') + '. Places: ' + sizeWord(dP) + '.';
  if (o.target === 'lowknow') {
    w.steps = 'Of the ' + n + ', about one in twenty had got a place with nothing; now about one in ' + oneIn(r.ladders.target.access) + '. Applications: ' + sizeWord(dA) + '.';
  }
  var P = {
    all: 'The paper found the same: the calls moved applications for mothers without a degree and mothers born abroad, and barely for the others; places moved hardly at all. The few extra crèche places went mostly to mothers with a degree, who traded a childminder for the crèche they preferred.',
    nodegree: 'The paper found the same. For the half who picked up the phone, the application gap nearly closed. The places did not follow: the paper could not see them move, though its estimate is loose enough to hide a modest rise. The town hall gave out the places as before.',
    abroad: 'The paper found the same. For the half who picked up, the application gap nearly closed. Places rose a little in the paper too, but it cannot be sure of that; the estimate is loose.',
    lowknow: 'The paper found this in its exploratory look at mothers who knew least about the system: for those who took the calls, the chance of a place went from about one in twenty to about one in two. A small group, and the paper says so; but it is the one place where the help reached the places.',
    inactive: 'The paper found the same: mothers not in work applied far more once helped (by about four fifths, for those who took the calls). Places: it could not see them move.'
  };
  w.paper = P[o.target];
  return w;
}

// ---------- the verdict ----------
function verdict(game) {
  var R = game.results, spent = R.reduce(function (a, r) { return a + r.cost; }, 0);
  var orderWords = R.map(function (r) {
    if (!r.order) return 'nothing';
    return (r.order.tool === 'videos' ? 'videos to ' : 'calls to ') + GROUP_NAME[r.order.target];
  });
  var g0 = R[0].gaps.control.degree;
  var bestA = Math.min.apply(null, R.map(function (r) { return r.gaps.degree.apply; }));
  var bestP = Math.min.apply(null, R.map(function (r) { return r.gaps.degree.access; }));
  var called = R.filter(function (r) { return r.order && r.order.tool === 'calls'; }).length;
  var videos = R.filter(function (r) { return r.order && r.order.tool === 'videos'; }).length;
  var lines = [];
  var appl = bestA <= g0.apply - CONFIG.WORDS.few
    ? 'The gap in applications ' + (bestA <= g0.apply / 2 ? 'closed by half or more' : 'narrowed by about a third') + ' in the years you called the mothers who were falling behind'
    : 'The gap in applications never narrowed' + (videos && !called ? ': videos do not do that' : '');
  var plac = bestP <= g0.access - CONFIG.WORDS.few
    ? 'the gap in places narrowed a little, and never closed'
    : 'the gap in places hardly moved';
  lines.push(appl + '; ' + plac + '.');
  lines.push('You spent €' + spent.toLocaleString('en-GB') + ' over four years: ' + orderWords.join(', then ') + '.');
  lines.push('The paper found the same. Five videos changed nothing it could measure. A helper on the phone got mothers without a degree, and mothers born abroad, to apply nearly as often as the others. Places did not follow, except for the few who knew least about the system; and the crèche places the calls did win went mostly to mothers with a degree.');
  lines.push('What stands between an application and a place is not in the mother’s hands: too few places, and the town hall’s rules for giving them out, which favour parents who are both in work.');
  return { lines: lines, spent: spent, orders: orderWords, bestApplyGap: bestA, bestPlaceGap: bestP, startGaps: g0 };
}

var MECH = { CONFIG: CONFIG, CUTS: CUTS, GROUP_NAME: GROUP_NAME, TARGETS: TARGETS, TOOLS: TOOLS, STEPS: STEPS,
  share: share, count: count, coverage: coverage, effect: effect, ladder: ladder, cost: cost, gaps: gaps,
  newGame: newGame, canAfford: canAfford, runYear: runYear, words: words, sizeWord: sizeWord, verdict: verdict };
if (typeof module !== 'undefined' && module.exports) module.exports = MECH;
