// Ganguli's Letters — mechanism. The single source of truth: plain functions, no DOM, no randomness.
// Runs unchanged in Node (calibration.js, loop.js) and in the browser (inlined verbatim by build.py).
// Kind: RECONSTRUCTED. The paper's treatment means, its wave-2 response and its belief numbers are the data;
// the town, the streets of twenty, the six letters as real-life arrangements, the additive ripple, the bet's
// cutoffs and all words are ours.
//
// Paper: Ganguli & Mengel (2026), "Social influence and carbon dioxide mitigation", Journal of Public Economics
// 253:105558, doi 10.1016/j.jpubeco.2025.105558. Only the typeset PDF was available (no online appendix, no data).
// A "pledge" is the paper's willingness to mitigate: pounds of a £10 endowment given to tree planting.
// A "plain" street gets the baseline letter (BASE). One pound pledged is drawn as one sapling.

var CONFIG = {
  // ---- the street (ours) ----------------------------------------------------------------------
  STREET: 20,                      // ours: households per street; 20 is the paper's own "twenty" (observers, observed)
  PAIRS: 6,                        // ours: pairs of streets in a town (twelve streets, one letter per pair)
  POUNDS: 10,                      // the endowment: £10, any share to mitigation (section 2.1)

  // ---- wave 1: what being told who will see your pledge does (pounds) -------------------------
  BASE_MEAN: 2.830,                // Table 2 col (1), constant: mean pledge with the plain letter
  INF11: 0.477,                    // Table 2 col (1), INF-(1,1): one person will see it before choosing (p<0.05)
  OBS11_POINT: -0.014,             // Table 2 col (1), OBS-(1,1): one person sees it after choosing (SE 0.211, n.s.)
  OBS11_PLAYED: 0,                 // played as zero: the paper's claim is "does not change WTM substantially"
  INF11_CONSTANT: 3.307,           // Table 3 col (1), constant: INF-(1,1) mean, the baseline of Table 3 (= 2.830 + 0.477)
  INF20_1_POINT: 0.131,            // Table 3 col (1), INF-(20,1) vs INF-(1,1): twenty see it, each sees only it (SE 0.414, n.s.)
  INF20_1_PLAYED: 0,               // played as zero: the claim is "does not increase WTM" (extensive margin flat); switch here
  INF1_20_POINT: -0.496,           // Table 3 col (1), INF-(1,20) vs INF-(1,1): one sees it among twenty (p<0.05)
  INF1_20_PLAYED_VS_BASE: 0,       // played at the plain mean: the text says "no higher than the baseline"; point is −0.019 vs base
  INF20_20_POINT: -0.411,          // Table 3 col (1), INF-(20,20) vs INF-(1,1): twenty see it, each among twenty (p<0.1)
  INF20_20_PLAYED_VS_BASE: 0.066,  // played at its point: 2.830 + 0.477 − 0.411 = 2.896, "only a slight increase again"

  // ---- wave 2: what seeing a pledge does to the one who sees it (pounds per pound seen) ----------
  IMITATION_SLOPE: 0.075,          // Table 4 col (1): 7.5 pence per pound seen; "10 GBP as opposed to 0 GBP raises ... by 75 pence"
  IMITATION_CONSTANT: 2.536,       // Table 4 col (1), constant: a wave-2 person who sees £0 (used in the check, not in play)
  IMITATION_CENTRE: 2.830,         // ours: a household that sees a plain pledge plants the plain amount (centring on BASE_MEAN)
  SHEET_STAT: 'mean',              // D.11 (text): mean, median and mode of twenty seen are not pairwise distinguishable; we use the mean
  MULTIPLIER_TEXT: 1.1,            // footnote 14: social multiplier ≈ 1/(1 − 0.075) for N large, "around 1.1"

  // ---- beliefs (section 3.3) ----------------------------------------------------------------------
  BELIEF_2_TO_5: { expected: 1.62, actual: 0.27 },  // text: wave-1 participants' expected vs actual rise in wave-2 giving, £2 → £5 seen
  BELIEF_5_TO_8: { expected: 1.16, actual: 0.68 },  // text: the same for £5 → £8 seen
  TYPE_SHARES: { under: 0.17, accurate: 0.10, mild: 0.53, substantial: 0.20 },  // text ("about 10 percent accurate", "15–20% under"); mild/substantial read off Fig. 1 BASE bar
  BASELINE_GUESS: { guessed: 2.42, actual: 2.87 },  // text: participants underestimate others' plain pledge
  // the game's own cutoffs for the bet, in saplings over a street of twenty (ours; the paper's are in Appendix Fig. C.2, not available)
  BET_ACCURATE_WITHIN: 2,          // ours: expected ripple within ±2 saplings of the actual counts as accurate
  BET_MILD_UPTO: 6,                // ours: up to 6 saplings over is a mild overestimate; more is substantial

  // ---- the shape of pledges (percent of participants choosing each pound, 0..10) --------------------
  // read off the histogram in Table 2's right panel (bars at whole pounds; half-pound bars folded into the pound below),
  // then adjusted by a point or two so that each mean equals the reported mean. Tagged: READ OFF A FIGURE.
  HIST_BASE: [26, 16, 16, 8, 3, 18, 2, 2, 3, 1, 5],   // mean 2.83; lumps at 0, 5 and 10 as the text describes
  HIST_INF:  [22, 14, 14, 7, 3, 23, 5, 1, 3, 1, 7],   // mean 3.30; fewer zeros, more fives and tens

  SPOKES_INDEX: 7,                 // ours: which plot is the spokesperson (row 2, third plot); its pledge is the INF-(1,1) mean
  BET_MIN: 40, BET_MAX: 100,       // ours: the bet slider's range in saplings; it starts at the plain street every time
  OFFSET_TONNES: 2037              // text: tonnes of CO2 offset from all participants' pledges (About screen)
};

// ---- the six letters: the paper's cells as real-life arrangements ------------------------------------
// told: what this street's households are told. sends: what reaches the next street before it decides.
var LETTERS = [
  { key: 'plain',  cell: 'BASE',
    name: 'The plain letter', line: 'Here is £10. Plant what you like and keep the rest. Nobody sees what you chose.',
    told: 'nothing', sends: 'nothing', before: false },
  { key: 'sheet',  cell: 'INF-(20,20)',
    name: 'The sheet', line: 'All twenty pledges go on one sheet to every household on the next street, before they decide. No names.',
    told: 'twenty people will each see your pledge, among the nineteen others', sends: 'the sheet of twenty to all twenty', before: true },
  { key: 'spokes', cell: 'INF-(20,1)',
    name: 'The spokesperson', line: 'One household’s pledge goes to all twenty on the next street, before they decide. The other nineteen are told nothing. No names.',
    told: 'one household: all twenty will see your pledge; the rest: nothing', sends: 'one pledge to all twenty', before: true },
  { key: 'pass',   cell: 'INF-(1,1)',
    name: 'Pass it on', line: 'Your pledge goes to one household on the next street, before they decide. No names.',
    told: 'one person will see your pledge before deciding', sends: 'each pledge to one household', before: true },
  { key: 'after',  cell: 'OBS-(1,1)',
    name: 'Afterwards', line: 'Your pledge goes to one household on the next street, after they have decided. No names.',
    told: 'one person will see your pledge after deciding', sends: 'each pledge to one household, too late to matter', before: false },
  { key: 'clip',   cell: 'INF-(1,20)',
    name: 'The clipboard', line: 'All twenty pledges go on one clipboard to one household on the next street, before they decide. No names.',
    told: 'one person will see your pledge, among the nineteen others', sends: 'the clipboard of twenty to one household', before: true }
];
var LETTER = {}; LETTERS.forEach(function (l) { LETTER[l.key] = l; });

// ---- the cells: each household's expected pledge on this street, by letter -------------------------------
function motive(key) {
  var C = CONFIG;
  switch (key) {
    case 'plain':  return 0;
    case 'after':  return C.OBS11_PLAYED;
    case 'pass':   return C.INF11;
    case 'sheet':  return C.INF20_20_PLAYED_VS_BASE;
    case 'clip':   return C.INF1_20_PLAYED_VS_BASE;
    case 'spokes': return C.INF11 + C.INF20_1_PLAYED;   // for the one household only (see thisStreet)
  }
  return 0;
}
function plainTotal() { return CONFIG.BASE_MEAN * CONFIG.STREET; }

// expected pledge of each household on the street that gets the letter
function thisStreetMeans(key) {
  var n = CONFIG.STREET, m = [], i;
  for (i = 0; i < n; i++) m.push(CONFIG.BASE_MEAN + (key === 'spokes' ? (i === CONFIG.SPOKES_INDEX ? motive('spokes') : 0) : motive(key)));
  return m;
}

// what each household on the next street sees, given this street's expected pledges (null = nothing before deciding)
function seenByNext(key, thisMeans) {
  var n = CONFIG.STREET, s = [], i, mean = avg(thisMeans);
  for (i = 0; i < n; i++) {
    switch (key) {
      case 'pass':   s.push(thisMeans[i]); break;
      case 'spokes': s.push(thisMeans[CONFIG.SPOKES_INDEX]); break;
      case 'sheet':  s.push(mean); break;                           // SHEET_STAT: the mean of the twenty
      case 'clip':   s.push(i === 0 ? mean : null); break;           // one household holds the clipboard
      default:       s.push(null);                                   // plain: nothing; afterwards: too late to matter
    }
  }
  return s;
}
// expected pledge of each household on the next street: a reader only, never also told who sees it
function nextStreetMeans(key, thisMeans) {
  var seen = seenByNext(key, thisMeans), m = [], i;
  for (i = 0; i < seen.length; i++) m.push(CONFIG.BASE_MEAN + (seen[i] === null ? 0 : CONFIG.IMITATION_SLOPE * (seen[i] - CONFIG.IMITATION_CENTRE)));
  return m;
}

// ---- drawing a street: twenty whole-pound pledges that show the paper's lumps and add up to the street's total --------
function histMix(w) {   // w = 0: the plain histogram; 1: the INF-(1,1) histogram
  var h = [], i; w = Math.max(0, Math.min(1, w));
  for (i = 0; i <= 10; i++) h.push((1 - w) * CONFIG.HIST_BASE[i] + w * CONFIG.HIST_INF[i]);
  return h;
}
function quantiles(h, n) {   // n values from the histogram's CDF at (i + 0.5)/n
  var total = h.reduce(function (a, b) { return a + b; }, 0), out = [], i, v, cum, p;
  for (i = 0; i < n; i++) {
    p = (i + 0.5) / n * total; cum = 0;
    for (v = 0; v <= 10; v++) { cum += h[v]; if (p <= cum) break; }
    out.push(Math.min(10, v));
  }
  return out;
}
// nudge whole-pound values until they sum to target; prefer households with the largest expected lift (or drop),
// and among equals prefer moves that keep the lumps (4→5, 9→10 first on the way up; 6→5, 1→0 first on the way down)
function fitSum(values, target, lift) {
  var v = values.slice(), s = v.reduce(function (a, b) { return a + b; }, 0), guard = 0;
  var upPref = { 4: 0, 9: 1, 3: 2, 2: 3, 1: 4, 8: 5, 7: 6, 6: 7, 0: 8, 5: 9 };
  var dnPref = { 6: 0, 1: 1, 4: 2, 3: 3, 2: 4, 9: 5, 8: 6, 7: 7, 10: 8, 5: 9 };
  function pick(up) {
    var best = -1, bestKey = 1e9, i, k;
    for (i = 0; i < v.length; i++) {
      if (up ? v[i] >= 10 : v[i] <= 0) continue;
      k = (up ? upPref[v[i]] : dnPref[v[i]]) * 1000 - (lift ? (up ? lift[i] : -lift[i]) * 100 : 0) + i * 0.001;
      if (k < bestKey) { bestKey = k; best = i; }
    }
    return best;
  }
  while (s !== target && guard++ < 400) {
    var i = pick(s < target); if (i < 0) break;
    v[i] += s < target ? 1 : -1; s += s < target ? 1 : -1;
  }
  return v;
}
function drawStreet(means) {   // means: expected pledge per household → whole saplings per plot, summing to the rounded total
  var n = means.length, total = Math.round(sum(means)), i;
  // a household whose expectation stands apart from the street's (the spokesperson; a reader who saw a ten) is drawn at its own
  // rounded mean; the rest are drawn as quantiles of the paper's histogram for the street's typical pledge, lifted where the
  // household's own expectation is highest, and nudged so that the plots add up to the street's total
  var sorted = means.slice().sort(function (a, b) { return a - b; }), median = sorted[Math.floor(n / 2)];
  var special = [], typical = [], v = [];
  for (i = 0; i < n; i++) (Math.abs(means[i] - median) > 0.4 ? special : typical).push(i);
  var specialSum = 0; special.forEach(function (i) { v[i] = Math.max(0, Math.min(10, Math.round(means[i]))); specialSum += v[i]; });
  var typMean = avg(typical.map(function (i) { return means[i]; })), w = (typMean - CONFIG.BASE_MEAN) / CONFIG.INF11;
  var q = quantiles(histMix(w), typical.length);
  typical.sort(function (a, b) { return means[a] - means[b] || a - b; });
  typical.forEach(function (idx, k) { v[idx] = q[k]; });
  var lift = means.map(function (m) { return m - typMean; });
  var t = fitSum(typical.map(function (i) { return v[i]; }), total - specialSum, typical.map(function (i) { return lift[i]; }));
  typical.forEach(function (idx, k) { v[idx] = t[k]; });
  return v;
}

// ---- words -------------------------------------------------------------------------------------------------------------
function sum(a) { return a.reduce(function (x, y) { return x + y; }, 0); }
function avg(a) { return sum(a) / a.length; }
function describeDiff(total, plain) {   // in words, rough sizes only; the screen never shows a decimal
  var d = total - plain, r = d / plain;
  if (Math.abs(d) < 0.25) return 'the same as a plain street';
  if (d > 0 && d < 1) return 'less than one sapling more than a plain street';
  if (d < 0 && d > -1) return 'less than one sapling fewer than a plain street';
  if (Math.abs(r) >= 0.14 && Math.abs(r) < 0.2) return (d > 0 ? 'about a sixth more' : 'about a sixth fewer') + ' than a plain street';
  if (Math.abs(r) >= 0.2) return (d > 0 ? 'about a ' + fractionWord(r) + ' more' : 'about a ' + fractionWord(-r) + ' fewer') + ' than a plain street';
  if (Math.abs(r) >= 0.08) return (d > 0 ? 'about a tenth more' : 'about a tenth fewer') + ' than a plain street';
  if (Math.abs(d) < 2.5) return (d > 0 ? 'one or two saplings more' : 'one or two saplings fewer') + ' than a plain street';
  return (d > 0 ? 'a few saplings more' : 'a few saplings fewer') + ' than a plain street';
}
function fractionWord(r) { if (r >= 0.45) return 'half'; if (r >= 0.3) return 'third'; if (r >= 0.22) return 'quarter'; return 'fifth'; }
function moreWords(n) { n = Math.round(n); if (n === 0) return 'no more'; if (n === 1) return 'one more'; if (n === 2) return 'two more'; if (n <= 4) return 'a few more'; return 'about ' + n + ' more'; }

var PAPER_THIS = {
  plain:  'The paper: with nothing said about anyone seeing it, people put a little under three pounds of the ten into trees.',
  after:  'The paper: being seen is not what moves people. The same person, looking afterwards, changes nothing.',
  pass:   'The paper: the chance that your choice shapes someone else’s is what moves people: about a sixth more, for one reader.',
  sheet:  'The paper: a pledge that is one of twenty is nearly as good as unseen, even with twenty people looking at the sheet: a slight rise, far short of what one reader alone does.',
  spokes: 'The paper: being seen by twenty moves a person no more than being seen by one. And here only one person was moved.',
  clip:   'The paper: one of twenty on a clipboard, even for a reader who decides afterwards, is as good as unseen.'
};
var PAPER_NEXT = {
  pass:   'The paper: a household that sees a pledge copies about seven pence of every pound. The chain reaction people imagine is a ripple: about a tenth of the first step.',
  spokes: 'The paper: twenty households each copied seven pence of every pound of one pledge. Twenty small copies of one small step.',
  sheet:  'The paper: a sheet of twenty pledges looks like an ordinary street, and an ordinary street is copied into an ordinary street.',
  clip:   'The paper: one household saw an ordinary street’s worth of pledges and planted like anyone. Nineteen saw nothing.',
  after:  'The paper: a pledge seen after deciding can change nothing on this street.',
  plain:  'The paper: nothing seen, nothing copied.'
};

function thisWords(key, total, plain, pledges) {
  var L = LETTER[key], n = Math.round(total), d = describeDiff(total, plain), what;
  switch (key) {
    case 'plain':  what = 'Nobody on this street was told anything.'; break;
    case 'after':  what = 'Every household was told that one person on the next street would see its pledge, after that person had decided.'; break;
    case 'pass':   what = 'Every household was told that one person on the next street would see its pledge before deciding.'; break;
    case 'sheet':  what = 'Every household was told that all twenty on the next street would see its pledge on a sheet with the nineteen others, before deciding.'; break;
    case 'spokes': what = 'One household was told that all twenty on the next street would see its pledge before deciding. Nineteen were told nothing.'; break;
    case 'clip':   what = 'Every household was told that one person on the next street would see its pledge on a clipboard with the nineteen others, before deciding.'; break;
  }
  var came = 'The street planted ' + n + ' saplings: ' + d + '.';
  if (key === 'spokes') came = 'The street planted ' + n + ' saplings: ' + d + '. The spokesperson planted a little more; the nineteen planted as usual.';
  return { what: what, came: came, paper: PAPER_THIS[key], letter: L.name };
}
function nextWords(key, total, plain, expected, actualRipple, thisTotal) {
  var n = Math.round(total), d = describeDiff(total, plain), saw;
  switch (key) {
    case 'pass':   saw = 'Each household saw one pledge from the street before, a street that planted ' + describeDiff(thisTotal, plain) + '.'; break;
    case 'spokes': saw = 'All twenty saw the spokesperson’s pledge, a little greener than an ordinary one.'; break;
    case 'sheet':  saw = 'Every household saw the sheet: twenty pledges, an ordinary street’s worth.'; break;
    case 'clip':   saw = 'One household saw the clipboard: twenty pledges, an ordinary street’s worth. The other nineteen saw nothing.'; break;
    case 'after':  saw = 'Each household was shown a pledge after it had decided.'; break;
    default:       saw = 'Nothing was sent to this street.';
  }
  var came = 'They planted ' + n + ' saplings between them: ' + d + '.';
  var bet = null;
  if (expected !== null && expected !== undefined) {
    var e = expected - plain;
    bet = 'You expected ' + (e > 0.5 ? moreWords(e) + ' than a plain street' : e < -0.5 ? Math.round(-e) + ' fewer than a plain street' : 'a plain street') + '; they planted ' + (actualRipple > 0.25 ? (actualRipple < 1 ? 'less than one more' : moreWords(actualRipple)) : 'no more') + '.';
  }
  return { saw: saw, came: came, bet: bet, paper: PAPER_NEXT[key] };
}

// ---- the bet -----------------------------------------------------------------------------------------------------------
function betType(expectedRipple, actualRipple) {   // in saplings over a street of twenty
  var e = expectedRipple - actualRipple, C = CONFIG;
  if (Math.abs(e) <= C.BET_ACCURATE_WITHIN) return 'accurate';
  if (e < 0) return 'under';
  if (e <= C.BET_MILD_UPTO) return 'mild';
  return 'substantial';
}
var TYPE_WORDS = {
  accurate: 'you had the ripple about right',
  under: 'you expected less than came',
  mild: 'you mildly overestimated your influence',
  substantial: 'you substantially overestimated your influence'
};
var TYPE_PAPER = {
  accurate: 'About one in ten of the paper’s participants did; most overestimated it.',
  under: 'So did about one in six of the paper’s participants; most overestimated it.',
  mild: 'So did about half of the paper’s participants; one in five overestimated it substantially, and only one in ten had it right.',
  substantial: 'So did about one in five of the paper’s participants; another half overestimated it mildly, and only one in ten had it right.'
};

// ---- the game --------------------------------------------------------------------------------------------------------
function newGame() { return { pair: 1, pairs: [], phase: 'letter', done: false, current: null }; }
function needsBet(key) { return LETTER[key].before; }

function plantThis(game, key) {
  if (game.done || game.phase !== 'letter') return null;
  var means = thisStreetMeans(key), total = sum(means), plain = plainTotal();
  var r = { letter: key, cell: LETTER[key].cell, thisMeans: means, thisTotal: total, thisPledges: drawStreet(means), plain: plain,
    thisWords: thisWords(key, total, plain), spokes: key === 'spokes' ? CONFIG.SPOKES_INDEX : -1 };
  game.current = r; game.phase = needsBet(key) ? 'bet' : 'next';
  return r;
}
// expected: the player's bet on the next street's saplings (null where no bet is asked)
function plantNext(game, expected) {
  if (game.done || (game.phase !== 'bet' && game.phase !== 'next')) return null;
  var r = game.current, means = nextStreetMeans(r.letter, r.thisMeans), total = sum(means);
  r.nextMeans = means; r.nextTotal = total; r.nextPledges = drawStreet(means); r.seen = seenByNext(r.letter, r.thisMeans);
  r.ripple = total - r.plain;
  r.expected = (game.phase === 'bet' && expected !== null && expected !== undefined) ? expected : null;
  r.betType = r.expected === null ? null : betType(r.expected - r.plain, r.ripple);
  r.nextWords = nextWords(r.letter, total, r.plain, r.expected, r.ripple, r.thisTotal);
  r.pairTotal = r.thisTotal + r.nextTotal;
  game.pairs.push(r); game.current = null;
  game.phase = 'done-pair';
  return r;
}
function nextPair(game) {
  if (game.phase !== 'done-pair') return false;
  if (game.pairs.length >= CONFIG.PAIRS) { game.done = true; game.phase = 'verdict'; return false; }
  game.pair = game.pairs.length + 1; game.phase = 'letter'; return true;
}
function pairTotalFor(key) { var m = thisStreetMeans(key); return sum(m) + sum(nextStreetMeans(key, m)); }
function bestLetter() { var best = null, bt = -1; LETTERS.forEach(function (l) { var t = pairTotalFor(l.key); if (t > bt) { bt = t; best = l.key; } }); return best; }

function verdict(game) {
  var C = CONFIG, town = 0, plain = plainTotal() * 2 * C.PAIRS, best = pairTotalFor(bestLetter()) * C.PAIRS;
  var names = [], bets = [], i, p;
  for (i = 0; i < game.pairs.length; i++) { p = game.pairs[i]; town += p.pairTotal; names.push(LETTER[p.letter].name); if (p.expected !== null) bets.push({ e: p.expected - p.plain, a: p.ripple }); }
  var counts = {}; game.pairs.forEach(function (q) { counts[q.letter] = (counts[q.letter] || 0) + 1; });
  var list = LETTERS.filter(function (l) { return counts[l.key]; }).map(function (l) { return l.name.toLowerCase() + (counts[l.key] > 1 ? ' × ' + counts[l.key] : ''); });
  var townR = Math.round(town), plainR = Math.round(plain), bestR = Math.round(best);
  var gap = townR - plainR, shortOf = bestR - townR;
  var l1 = 'You sent six letters: ' + list.join(', ') + '. Your twelve streets planted ' + townR + ' saplings.';
  var l2 = 'Plain letters everywhere would have planted ' + plainR + '; ' + LETTER[bestLetter()].name.toLowerCase() + ' everywhere, ' + bestR + '.' +
    (shortOf <= 2 ? ' You found the best letter and kept to it.' : gap <= 2 ? ' Your letters changed nothing a plain town would not have planted.' : ' You beat the plain town and left ' + shortOf + ' saplings unplanted.');
  var betLine = null, type = null;
  if (bets.length) {
    var e = avg(bets.map(function (b) { return b.e; })), a = avg(bets.map(function (b) { return b.a; }));
    type = betType(e, a);
    betLine = 'When a letter sent something to the next street, you expected it to plant ' + (e > 0.5 ? moreWords(e) + ' than a plain street' : e < -0.5 ? 'fewer than a plain street' : 'like a plain street') +
      '; it planted ' + (a > 0.25 ? (a < 1 ? 'less than one more' : moreWords(a)) : 'no more') + '. In the paper’s words, ' + TYPE_WORDS[type] + '. ' + TYPE_PAPER[type];
  }
  return {
    town: townR, plain: plainR, best: bestR, bestLetter: bestLetter(), type: type,
    lines: betLine ? [l1, l2, betLine] : [l1, l2],
    paper: [
      'Told that one person would see their pledge before deciding, people gave about a sixth more.',
      'Told that the person would see it afterwards, they gave no more than when nobody saw it.',
      'Told that twenty people would see it, they gave no more than for one.',
      'Told that theirs would be one of twenty seen, they gave as if nobody were looking.',
      'And the person who saw a pledge copied about seven pence of every pound. Asked to guess, most people thought it would be five or six times that.'
    ],
    boundary: 'No pledge in the paper carried a name, and none in this town does. Put names on the letters and a street is a different experiment, one the paper does not run.'
  };
}

// exports for Node; globals in the browser
var MECH = { CONFIG: CONFIG, LETTERS: LETTERS, LETTER: LETTER, motive: motive, plainTotal: plainTotal, thisStreetMeans: thisStreetMeans,
  seenByNext: seenByNext, nextStreetMeans: nextStreetMeans, drawStreet: drawStreet, histMix: histMix, quantiles: quantiles, fitSum: fitSum,
  describeDiff: describeDiff, betType: betType, TYPE_WORDS: TYPE_WORDS, TYPE_PAPER: TYPE_PAPER, newGame: newGame, needsBet: needsBet,
  plantThis: plantThis, plantNext: plantNext, nextPair: nextPair, pairTotalFor: pairTotalFor, bestLetter: bestLetter, verdict: verdict, sum: sum, avg: avg };
if (typeof module !== 'undefined' && module.exports) module.exports = MECH;
