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
// how a written blink time compares with hers: {kind, line}. Words for a smart eleven-year-old.
function compare(playerP, herP) {
  var ratio = playerP / herP, d = playerP - herP, dir = d > 0 ? 'long' : 'short';
  if (Math.abs(ratio - 1) <= CONFIG.SAME_TOL) return { kind: 'same', dir: dir, line: 'Spot on! Yours and hers are ' + gapWords(d) + ' apart.' };
  if (Math.abs(ratio - 1) <= CONFIG.NEAR_TOL) return { kind: 'near', dir: dir, line: 'Very close! Yours is ' + gapWords(d) + ' too ' + dir + '. That looks tiny, but it adds up over many blinks.' };
  var mults = [[2, 'twice as long as hers: each of your blinks holds two of hers.'], [3, 'three times as long as hers: each of your blinks holds three of hers.'], [4, 'four times as long as hers: each of your blinks holds four of hers.'],
    [0.5, 'half of hers: your blink time cuts each of her blinks in two.'], [1 / 3, 'a third of hers: your blink time cuts each of her blinks in three.']];
  for (var i = 0; i < mults.length; i++) if (Math.abs(ratio / mults[i][0] - 1) <= CONFIG.MULTIPLE_TOL) return { kind: 'multiple', k: mults[i][0], dir: dir, line: 'Yours is ' + mults[i][1] + ' The dots line up at both, so look for one hump in each half.' };
  // off: say which way and roughly how far, in a different voice each time
  var how = ratio > 1 ? (ratio < 1.25 ? 'a bit too long' : ratio < 1.7 ? 'quite a bit too long' : 'far too long') : (ratio > 0.8 ? 'a bit too short' : ratio > 0.6 ? 'quite a bit too short' : 'far too short');
  var tails = [
    'Yours is ' + how + '. Slide the dial ' + (ratio > 1 ? 'left' : 'right') + ' a little and the scribble will settle.',
    'Yours is ' + how + ': the real blink is ' + (ratio > 1 ? 'quicker' : 'slower') + ' than you set it.',
    'Yours is ' + how + '. At her time the dots hug the line; at yours they still wander.',
    'Yours is ' + how + '. Her blink ' + (ratio > 1 ? 'comes round sooner' : 'takes longer to come round') + ' than yours.'
  ];
  return { kind: 'off', dir: dir, line: tails[Math.floor(playerP * 97) % tails.length] };
}
function guessWords(guessP, herP) {
  var r = guessP / herP, e = Math.abs(Math.log(r));
  var dir = r > 1 ? 'long' : 'short';
  if (e <= Math.log(1 + CONFIG.GUESS_CLOSE)) return { kind: 'close', short: 'and your guess was close', line: 'Good guess: just a few days off.' };
  if (e <= Math.log(1 + CONFIG.GUESS_FAIR)) return { kind: 'fair', short: 'and your guess was not far off', line: 'Not bad: a bit too ' + dir + '.' };
  if (r >= 1.8) { var tw = (Math.round(r) === 2 ? 'twice' : Math.round(r) + ' times') + ' as long as hers'; return { kind: 'far', short: 'and your guess was ' + tw, line: 'Way off: your guess was about ' + tw + '.' }; }
  if (r <= 1 / 1.8) { var q = Math.round(1 / r), pt = 'about ' + (q === 2 ? 'half' : q === 3 ? 'a third' : q === 4 ? 'a quarter' : 'a small part') + ' of hers'; return { kind: 'far', short: 'and your guess was ' + pt, line: 'Way off: your guess was ' + pt + '.' }; }
  return { kind: 'wide', short: 'and your guess was quite a bit too ' + dir, line: 'Quite a bit too ' + dir + '.' };
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

// the verdict, in words: what she found, what you found, where you part, and what would follow if yours had stood
function fracWords(f) { // a shortfall or excess as a plain fraction
  if (f < 0.08) return 'a little'; if (f < 0.2) return 'about a sixth'; if (f < 0.3) return 'about a quarter'; if (f < 0.42) return 'about a third'; if (f < 0.6) return 'about half'; return 'more than half';
}
function verdict(game) {
  var R = game.rounds, S = R.map(function (r) { return star(r.h); }), H = herLines();
  var kinds = R.map(function (r) { return r.cmp ? r.cmp.kind : 'off'; });
  var nSame = kinds.filter(function (k) { return k === 'same' || k === 'near'; }).length;
  var nLong = R.filter(function (r) { return r.cmp && r.cmp.kind !== 'same' && r.cmp.kind !== 'near' && r.written > star(r.h).period; }).length;
  var nShort = R.length - nSame - nLong;
  // the player's own chart: a line through their seven, brightness on log blink time
  var lx = R.map(function (r) { return Math.log10(r.written); }), ly = S.map(function (s) { return s.max; });
  var L = fitLine(lx, ly), rms = 0; for (var i = 0; i < R.length; i++) { var e = ly[i] - (L.a + L.b * lx[i]); rms += e * e; } rms = Math.sqrt(rms / R.length);
  // how far the player's times sit from hers, as one factor, and how much they wander
  var lr = R.map(function (r) { return Math.log10(r.written / star(r.h).period); });
  var meanLr = lr.reduce(function (a, b) { return a + b; }, 0) / lr.length, sdLr = Math.sqrt(lr.reduce(function (a, b) { return a + (b - meanLr) * (b - meanLr); }, 0) / lr.length);
  var factor = Math.pow(10, meanLr);
  var g = R[CONFIG.PREDICT_ROUND];

  var she = 'Leavitt timed 25 blinking stars and put them on a chart. They fell on a straight line: the brighter the star, the slower it blinks. Since the stars all sit in one cloud, at about one distance, the brighter-looking ones really are brighter. So a star\u2019s blink tells you how bright it truly is; and if you know that, how faint it looks tells you how far away it is. She did not say that last part in 1912; she hoped someone would find it. They did, and this is how the first distances to other galaxies were measured.';

  var part, ifStood, kind;
  if (nSame === 7) {
    kind = 'hers';
    part = 'Nowhere. Your chart is her chart.';
    ifStood = 'Nothing would change. The stars would be measured as they are.';
  } else if (sdLr < 0.08 && Math.abs(meanLr) > 0.1) {
    kind = 'shifted';
    var k = factor, kw = k > 1 ? (k < 1.7 ? 'about half again as long as' : k < 2.6 ? 'about twice' : k < 3.6 ? 'about three times' : 'several times') : (k > 0.6 ? 'about two thirds of' : k > 0.4 ? 'about half' : 'a fraction of');
    part = 'Your stars line up as neatly as hers, but every blink time is ' + kw + ' hers. Same pattern, shifted sideways.';
    var shift = Math.abs(L.b) * Math.abs(meanLr); // magnitudes a star would be misread by
    var dist = Math.sqrt(Math.pow(10, 0.4 * shift)); // the factor distances would be wrong by
    var short = k > 1; // too-long blink times: a star is read as fainter than it is, so placed too close
    ifStood = 'Your chart would still work as a yardstick, but a crooked one. Anyone timing a star elsewhere and reading its brightness off your chart would take it for a ' + (short ? 'fainter' : 'brighter') + ' star than it is, and so place it ' + (short ? 'too close' : 'too far') + '. Every distance measured this way would come out ' + fracWords(short ? 1 - 1 / dist : dist - 1) + ' too ' + (short ? 'short' : 'long') + '. We would think the galaxies ' + (short ? 'nearer' : 'farther') + ' than they are, all of them, by the same crooked amount, and nobody would notice until a distance was measured some other way.';
  } else if (L.b < 0 && rms < 0.8 && nSame >= 3) {
    kind = 'ragged';
    part = 'Your line runs the right way, but ' + (7 - nSame === 1 ? 'one star sits' : (7 - nSame) + ' stars sit') + ' off it: ' + (nLong && nShort ? 'some timed too long, some too short' : nLong ? 'timed too long, so pushed to the right' : 'timed too short, so pushed to the left') + '. Hers has every star near the line.';
    ifStood = 'A ragged yardstick. A star read off your chart might be right, or might be out by ' + fracWords(Math.min(0.7, Math.sqrt(Math.pow(10, 0.4 * rms)) - 1)) + ' in distance, and you would not know which. People would have trusted it less, argued about it longer, and the distances to other galaxies would have come later and fuzzier.';
  } else if (L.b < 0) {
    kind = 'rough';
    part = 'There is a trend on your chart, but the stars stray so far from it that the line is hard to see. Hers is clean.';
    ifStood = 'No usable yardstick. With stars this scattered nobody could read a brightness off the chart with any confidence. The pattern would have been a rumour, not a law, and the first distances to other galaxies would have had to wait for someone to time the stars again, properly.';
  } else {
    kind = 'none';
    part = 'Everything. On your chart the brighter stars do not blink more slowly; on hers they do.';
    ifStood = 'The cloud would have told us nothing. No pattern, no yardstick, no way from a star\u2019s blink to its distance. We would have gone on not knowing how far away the other galaxies are, until someone timed the stars again and found what she found.';
  }
  var nOff = 7 - nSame;
  var yourChart = kind === 'hers' || kind === 'shifted' ? 'a clean line, the brighter the slower, like hers'
    : kind === 'ragged' ? 'a line the right way, the brighter the slower, with ' + (nOff === 1 ? 'one star' : nOff + ' stars') + ' off it'
    : kind === 'rough' ? 'a rough trend, the brighter the slower, with stars straying far off it'
    : 'no pattern of the right kind: on your chart the brighter stars do not blink more slowly';
  var you = 'You timed seven of her stars. ' + (nSame === 7 ? 'All seven of your blink times were hers, to within hours.' : nSame === 0 ? 'None of your blink times was hers' + (nLong && nShort ? ': ' + nLong + ' came out too long and ' + nShort + ' too short.' : nLong ? ': all came out too long.' : ': all came out too short.') :
    nSame + ' of your blink times ' + (nSame === 1 ? 'was' : 'were') + ' hers; ' + (nLong && nShort ? nLong + ' came out too long and ' + nShort + ' too short' : nLong ? (nLong === 1 ? 'one came out too long' : nLong + ' came out too long') : (nShort === 1 ? 'one came out too short' : nShort + ' came out too short')) + '.') +
    ' Your own chart shows ' + yourChart + '.' + (g.guessCmp ? ' Before the last star\u2019s photos came you guessed its blink time from its brightness, ' + g.guessCmp.short + '.' : '');

  return {
    kind: kind, she: she, you: you, part: part, ifStood: ifStood,
    // kept for older callers
    did: you, paper: she, means: ifStood
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
  fracWords: fracWords, fitLine: fitLine, chartX01: chartX01, chartY01: chartY01, newGame: newGame, write: write, guess: guess, verdict: verdict, cloudField: cloudField };
if (typeof module !== 'undefined') module.exports = MECH;
