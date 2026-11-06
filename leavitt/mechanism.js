// Leavitt's Cloud — mechanism. The single source of truth: plain functions, no DOM.
// Runs unchanged in Node (calibration.js, loop.js) and in the browser (inlined verbatim by build.py).
// Kind: RECONSTRUCTED. Table I of the circular is the data; the plates are ours, drawn at her periods.

var CONFIG = {
  // ---- the paper ----------------------------------------------------------------------------------
  // Table I, Harvard College Observatory Circular 173 (1912), p. 2. Read by eye off the NASA ADS scan
  // (no transcription found): [Harvard no., mag at maximum, mag at minimum, epoch (d after JD 2,410,000),
  // period (d), printed Res. M, printed Res. m]. The calibration check re-derives Res. M and Res. m.
  TABLE_I: [
    [1505, 14.8, 16.1, 0.02, 1.25336, -0.6, -0.5],
    [1436, 14.8, 16.4, 0.02, 1.6637, -0.3, +0.1],
    [1446, 14.8, 16.4, 1.38, 1.7620, -0.3, +0.1],
    [1506, 15.1, 16.3, 1.08, 1.87502, +0.1, +0.1],
    [1413, 14.7, 15.6, 0.35, 2.17352, -0.2, -0.5],
    [1460, 14.4, 15.7, 0.00, 2.913, -0.3, -0.1],
    [1422, 14.7, 15.9, 0.6, 3.501, +0.2, +0.2],
    [842, 14.6, 16.1, 2.61, 4.2897, +0.3, +0.6],
    [1425, 14.3, 15.3, 2.8, 4.547, 0.0, -0.1],
    [1742, 14.3, 15.5, 0.95, 4.9866, +0.1, +0.2],
    [1646, 14.4, 15.4, 4.30, 5.311, +0.3, +0.1],
    [1649, 14.3, 15.2, 5.05, 5.323, +0.2, -0.1],
    [1492, 13.8, 14.8, 0.6, 6.2926, -0.2, -0.4],
    [1400, 14.1, 14.8, 4.0, 6.650, +0.2, -0.3],
    [1355, 14.0, 14.8, 4.8, 7.483, +0.2, -0.2],
    [1374, 13.9, 15.2, 6.0, 8.397, +0.2, -0.3],
    [818, 13.6, 14.7, 4.0, 10.336, 0.0, 0.0],
    [1610, 13.4, 14.6, 11.0, 11.645, 0.0, 0.0],
    [1365, 13.8, 14.8, 9.6, 12.417, +0.4, +0.2],
    [1351, 13.4, 14.4, 4.0, 13.08, +0.1, -0.1],
    [827, 13.4, 14.3, 11.6, 13.47, +0.1, -0.2],
    [822, 13.0, 14.6, 13.0, 16.75, -0.1, +0.3],
    [823, 12.2, 14.1, 2.9, 31.94, -0.3, +0.4],
    [824, 11.4, 12.8, 4.0, 65.8, -0.4, -0.2],
    [821, 11.2, 12.1, 97.0, 127.0, -0.1, -0.4]
  ],
  SLOPE_LOGP_PER_MAG: 0.48,      // p. 2: "the logarithm of the period increases by about 0.48 for each ... magnitude"
  AVERAGE_RANGE_MAG: 1.2,        // p. 3: "the average range, for bright and faint variables alike, is about 1.2 magnitudes"
  RISE_FRACTION: 1 / 6,          // our choice, from p. 1: "increasing very rapidly to a brief maximum"
  FADE_TAU: 0.22,                // our choice, from p. 1: "diminishing slowly ... remaining near minimum for the greater part of the time"
  // ---- the plates (ours) --------------------------------------------------------------------------
  PLATES_PER_STAR: 26,           // our choice: enough that her beat is the cleanest fold (calibration 4), few enough to see each dot
  SPAN_CYCLES: [4, 6],           // our choice: the plates cover 4 to 6 of the star's cycles (hers covered years)
  EYE_NOISE_MAG: 0.08,           // our choice: she estimated to a tenth of a magnitude (Table I is given to 0.1)
  MIN_GAP_CYCLES: 0.06,          // our choice: no two plates closer than this share of a cycle
  // ---- the game (ours) ----------------------------------------------------------------------------
  ROUNDS: [1425, 1505, 823, 1374, 821, 1436, 822], // our order: the first three span the range, so the slope shows by star 3
  PREDICT_ROUND: 6,              // index in ROUNDS of the star set from its light first: 822, close to her lines (Res. -0.1/+0.3)
  DIAL_MIN: 1, DIAL_MAX: 128,    // days; coarse dial in doublings, as her Figure 2 is in log period
  DIAL_START: 8,                 // days; every round starts here
  FINE_SPAN: 0.10,               // fine dial: ten per cent either way
  TIMELAPSE_SEC_PER_DAY: 0.5,    // the ringed star pulses at this fixed rate for every star (ours)
  // words: how near a written beat is to hers (shares of her beat)
  SAME_TOL: 0.015, NEAR_TOL: 0.04, MULTIPLE_TOL: 0.04,
  // words: how near the seventh star's guess, from its light alone, was (ratio to hers)
  GUESS_CLOSE: 0.25, GUESS_FAIR: 0.6, // her lines scatter by about ±0.3 mag, i.e. about ±40% in beat (Table I residuals)
  CHART_MAG_TOP: 10.8, CHART_MAG_BOTTOM: 16.8 // chart range in magnitudes (brighter up)
};

// ---------- random numbers: seeded, replayable ----------
function rng(seed) {
  var s = (seed >>> 0) || 1;
  return function () { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; };
}
function gauss(r) { var u = r() || 1e-9, v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }

// ---------- the stars ----------
function star(h) {
  var row = CONFIG.TABLE_I.filter(function (x) { return x[0] === h; })[0];
  if (!row) throw new Error('no star ' + h);
  return { h: row[0], max: row[1], min: row[2], epoch: row[3], period: row[4], resM: row[5], resm: row[6] };
}
function allStars() { return CONFIG.TABLE_I.map(function (r) { return star(r[0]); }); }

// light curve: magnitude at phase phi (0 = maximum), between mx (bright) and mn (faint)
function lightCurve(phi, mx, mn, shape) {
  phi = ((phi % 1) + 1) % 1;
  var A = mn - mx;
  if (shape === 'sine') return mx + A * (0.5 - 0.5 * Math.cos(2 * Math.PI * phi));
  var r = CONFIG.RISE_FRACTION, tau = CONFIG.FADE_TAU;
  if (phi < 1 - r) return mx + A * (1 - Math.exp(-phi / tau)) / (1 - Math.exp(-(1 - r) / tau));
  return mn - A * (phi - (1 - r)) / r;
}

// plates for one star: [{t: days since the first plate, mag}] on irregular dates
function makePlates(h, seed, opts) {
  opts = opts || {};
  var s = star(h), r = rng(seed * 7919 + h);
  var n = opts.n || CONFIG.PLATES_PER_STAR;
  var K = CONFIG.SPAN_CYCLES[0] + r() * (CONFIG.SPAN_CYCLES[1] - CONFIG.SPAN_CYCLES[0]);
  var span = K * s.period, gap = CONFIG.MIN_GAP_CYCLES * s.period, ts = [], tries = 0;
  while (ts.length < n && tries < 5000) {
    tries++;
    var t = r() * span;
    if (ts.every(function (u) { return Math.abs(u - t) >= gap; })) ts.push(t);
  }
  ts.sort(function (a, b) { return a - b; });
  var t0 = ts[0];
  var start = s.epoch + Math.floor(r() * 400) * s.period + r() * s.period; // JD offset of the first plate
  var noise = opts.noise == null ? CONFIG.EYE_NOISE_MAG : opts.noise;
  return {
    h: h, start: start, span: ts[ts.length - 1] - t0,
    plates: ts.map(function (t) {
      var jd = start + (t - t0);
      var phi = (jd - s.epoch) / s.period;
      return { t: t - t0, mag: lightCurve(phi, s.max, s.min, opts.shape) + noise * gauss(r) };
    }),
    maxPhase: function (P) { return (((s.epoch - start) / P) % 1 + 1) % 1; } // where her maxima fall, folding from the first plate
  };
}

// fold: phase in [0,1) of each plate for a trial beat P (days), from the first plate
function fold(rec, P) { return rec.plates.map(function (p) { return { phase: ((p.t / P) % 1 + 1) % 1, mag: p.mag }; }); }

// roughness of a fold (string length): the summed jumps between neighbouring dots in beat order, against what
// dots in no order give. About 1 = no order; a clean curve is well under. Used by the calibration check only:
// on screen the player judges the fold by eye.
function roughness(rec, P) {
  var f = fold(rec, P).sort(function (a, b) { return a.phase - b.phase; }), L = 0, n = f.length;
  for (var i = 0; i < n; i++) L += Math.abs(f[(i + 1) % n].mag - f[i].mag);
  var ms = rec.plates.map(function (p) { return p.mag; }), mean = ms.reduce(function (a, b) { return a + b; }, 0) / n;
  var sd = Math.sqrt(ms.reduce(function (a, b) { return a + (b - mean) * (b - mean); }, 0) / n);
  return L / (n * sd * 1.128); // 1.128 sd = mean |difference| of two independent normal draws
}

// her curve, for the ghost: magnitude at fold phase x for trial beat P (drawn with her period and epoch)
function herCurveAt(rec, P, x) {
  var s = star(rec.h), jd = rec.start + x * P;
  return lightCurve((jd - s.epoch) / s.period, s.max, s.min);
}

// ---------- the dial ----------
function dialToDays(coarse01, fine01) { // coarse in [0,1] across doublings, fine in [0,1] with 0.5 the centre
  var lo = Math.log2(CONFIG.DIAL_MIN), hi = Math.log2(CONFIG.DIAL_MAX);
  var base = Math.pow(2, lo + coarse01 * (hi - lo));
  return base * (1 + CONFIG.FINE_SPAN * (2 * fine01 - 1));
}
function daysToCoarse(d) { var lo = Math.log2(CONFIG.DIAL_MIN), hi = Math.log2(CONFIG.DIAL_MAX); return (Math.log2(d) - lo) / (hi - lo); }

// ---------- words ----------
function beatWords(d) { // never a decimal
  if (d < 1) { var h = Math.round(d * 24); return h + (h === 1 ? ' hour' : ' hours'); }
  if (d >= 20) { var dd = Math.round(d); return dd + ' days'; }
  var days = Math.floor(d), hrs = Math.round((d - days) * 24);
  if (hrs === 24) { days++; hrs = 0; }
  var a = days + (days === 1 ? ' day' : ' days');
  return hrs ? a + ' ' + hrs + (hrs === 1 ? ' hour' : ' hours') : a;
}
function gapWords(dDays) {
  var h = Math.abs(dDays) * 24;
  if (h < 1) return 'less than an hour';
  if (h < 1.5) return 'about an hour';
  if (h < 36) return 'about ' + Math.round(h) + ' hours';
  return 'about ' + Math.round(Math.abs(dDays)) + ' days';
}
// how a written beat compares with hers: {kind, line}
function compare(playerP, herP) {
  var ratio = playerP / herP, d = playerP - herP;
  if (Math.abs(ratio - 1) <= CONFIG.SAME_TOL) return { kind: 'same', line: 'Your beat is hers: the two differ by ' + gapWords(d) + '.' };
  if (Math.abs(ratio - 1) <= CONFIG.NEAR_TOL) return { kind: 'near', line: 'Your beat is close to hers, ' + gapWords(d) + (d > 0 ? ' too long' : ' too short') + '. Over many blinks the dots drift apart.' };
  var mults = [[2, 'twice hers: each of your beats holds two of her blinks'], [3, 'three times hers: each of your beats holds three of her blinks'], [4, 'four times hers: each of your beats holds four of her blinks'],
    [0.5, 'half hers: your beat lays the climb of one blink on the fade of the next'], [1 / 3, 'a third of hers']];
  for (var i = 0; i < mults.length; i++) if (Math.abs(ratio / mults[i][0] - 1) <= CONFIG.MULTIPLE_TOL) return { kind: 'multiple', k: mults[i][0], line: 'Your beat is ' + mults[i][1] + '.' };
  return { kind: 'off', line: 'Your beat is not hers: at hers, the dots line up; at yours, they do not.' };
}
function guessWords(guessP, herP) {
  var r = guessP / herP, e = Math.abs(Math.log(r));
  var dir = r > 1 ? 'longer' : 'shorter';
  if (e <= Math.log(1 + CONFIG.GUESS_CLOSE)) return { kind: 'close', short: 'within a few days of her beat', line: 'From its light alone you set it within a few days of her beat.' };
  if (e <= Math.log(1 + CONFIG.GUESS_FAIR)) return { kind: 'fair', short: 'in the right neighbourhood', line: 'From its light alone you set it in the right neighbourhood, a little ' + dir + ' than hers.' };
  if (r >= 1.8) { var tw = (Math.round(r) === 2 ? 'twice' : Math.round(r) + ' times') + ' as long as her beat'; return { kind: 'far', short: 'at about ' + tw, line: 'From its light alone you set it about ' + tw + '.' }; }
  if (r <= 1 / 1.8) { var q = Math.round(1 / r), pt = 'at about ' + (q === 2 ? 'half' : q === 3 ? 'a third of' : q === 4 ? 'a quarter of' : 'a small part of') + ' her beat'; return { kind: 'far', short: pt, line: 'From its light alone you set it ' + pt + '.' }; }
  return { kind: 'wide', short: 'well ' + dir + ' than her beat', line: 'From its light alone you set it well ' + dir + ' than her beat.' };
}

// ---------- her lines (Figure 2) ----------
function fitLine(xs, ys) {
  var n = xs.length, mx = xs.reduce(function (a, b) { return a + b; }, 0) / n, my = ys.reduce(function (a, b) { return a + b; }, 0) / n, sxx = 0, sxy = 0;
  for (var i = 0; i < n; i++) { sxx += (xs[i] - mx) * (xs[i] - mx); sxy += (xs[i] - mx) * (ys[i] - my); }
  var b = sxy / sxx; return { a: my - b * mx, b: b };
}
// the lines as her printed residuals imply them: line value = observed - residual, refit on log10 P
function herLines() {
  var S = allStars(), x = S.map(function (s) { return Math.log10(s.period); });
  return {
    max: fitLine(x, S.map(function (s) { return s.max - s.resM; })),
    min: fitLine(x, S.map(function (s) { return s.min - s.resm; }))
  };
}
// the lines as least squares on the transcribed table
function tableLines() {
  var S = allStars(), x = S.map(function (s) { return Math.log10(s.period); });
  return { max: fitLine(x, S.map(function (s) { return s.max; })), min: fitLine(x, S.map(function (s) { return s.min; })) };
}

// ---------- the seventh star: where a guessed beat would put it on the chart ----------
function chartY01(mag) { return (mag - CONFIG.CHART_MAG_TOP) / (CONFIG.CHART_MAG_BOTTOM - CONFIG.CHART_MAG_TOP); } // 0 top (bright)
function chartX01(days, linear) {
  if (linear) return days / 135;                                       // her Figure 1: days evenly spaced
  return (Math.log2(days) - Math.log2(CONFIG.DIAL_MIN)) / (Math.log2(CONFIG.DIAL_MAX) - Math.log2(CONFIG.DIAL_MIN)); // doublings evenly spaced
}

// ---------- a game ----------
function newGame(seed) {
  return {
    seed: seed, round: 0, rounds: CONFIG.ROUNDS.map(function (h, i) { return { h: h, rec: makePlates(h, seed + i), written: null, guess: null }; })
  };
}
function write(game, P) { // commit the beat for the current round; returns the comparison
  var r = game.rounds[game.round], s = star(r.h);
  r.written = P; r.cmp = compare(P, s.period);
  return r.cmp;
}
function guess(game, P) { var r = game.rounds[game.round], s = star(r.h); r.guess = P; r.guessCmp = guessWords(P, s.period); return r.guessCmp; }

// the verdict, in words
function verdict(game) {
  var R = game.rounds, ex = [], allSame = true;
  R.forEach(function (r) {
    var k = r.cmp ? r.cmp.kind : 'off';
    if (k !== 'same') allSame = false;
    if (k === 'multiple') ex.push('Harvard ' + r.h + ', where yours held ' + (r.cmp.k >= 1 ? (r.cmp.k === 2 ? 'two' : r.cmp.k === 3 ? 'three' : 'four') + ' of her blinks' : 'half of her blink'));
    else if (k === 'off') ex.push('Harvard ' + r.h + ', where yours was not hers');
  });
  var how = ex.length === 0 ? (allSame ? 'Your beats were hers, to within hours.' : 'Your beats were hers, or close to hers.')
    : ex.length <= 3 ? 'Your beats were hers, except at ' + ex.join(', and at ') + '.'
    : R.every(function (r) { return r.cmp && r.cmp.kind !== 'off'; }) ? 'Most of your beats held more than one of her blinks, so your black strokes sit to the right of her violet ones, in a line of their own.'
    : 'Many of your beats were not hers, so your black strokes scatter; her violet ones show the line.';
  var g = R[CONFIG.PREDICT_ROUND];
  return {
    did: 'You timed seven stars of the Cloud by their blinks. ' + how + (g.guessCmp ? ' The seventh you first set from its light alone, ' + g.guessCmp.short + '.' : ''),
    paper: 'Miss Leavitt’s twenty-five fall on a straight line. The brighter the star, the slower it blinks: a blink about three times as long goes with about two and a half times the light.',
    means: 'They are all in one cloud, about equally far away, so this is how bright they really are. Time a star like this anywhere in the sky and you know its true brightness; how faint it looks then says how far away it is. The circular does not claim that. It hopes for it.'
  };
}

// the Cloud's crowd of specks on the plate (decoration, seeded)
function cloudField(seed, n) {
  var r = rng(seed * 31 + 5), out = [];
  for (var i = 0; i < n; i++) {
    var a = r() * 2 * Math.PI, rad = Math.sqrt(-2 * Math.log(r() || 1e-9)) * 0.22;
    out.push({ x: 0.5 + rad * Math.cos(a) * 1.3, y: 0.5 + rad * Math.sin(a) * 0.8, s: Math.pow(r(), 3) });
  }
  return out;
}

var MECH = { CONFIG: CONFIG, rng: rng, star: star, allStars: allStars, lightCurve: lightCurve, makePlates: makePlates, fold: fold, roughness: roughness, herCurveAt: herCurveAt,
  dialToDays: dialToDays, daysToCoarse: daysToCoarse, beatWords: beatWords, gapWords: gapWords, compare: compare, guessWords: guessWords, herLines: herLines, tableLines: tableLines,
  fitLine: fitLine, chartX01: chartX01, chartY01: chartY01, newGame: newGame, write: write, guess: guess, verdict: verdict, cloudField: cloudField };
if (typeof module !== 'undefined') module.exports = MECH;
