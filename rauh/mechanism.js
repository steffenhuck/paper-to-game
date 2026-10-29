// Live from Brussels — mechanism (the single source of truth).
// Everything that decides an outcome lives here: the paper's values, the scripts and their syllables,
// the beat, the judging of taps, the per-item and final verdicts, and the model player used by the
// calibration check. The page only passes tap times in and shows what comes back.
// Runs unchanged in Node (require) and in the browser (window.MECH). No DOM.
(function (root) {
'use strict';

const CONFIG = {
  // --- The paper's numbers (Rauh 2023, Fig. 2 upper panel; dot centres read off at 600 dpi against the gridlines) ---
  // reading: mean Flesch reading ease (±0.5); familiar: mean Google Books frequency of the words, relative to 'the' (±0.00001);
  // verbs: verbs / (verbs + nouns) (±0.005)
  sources: {
    polsci:  { name: 'Political science abstracts',          short: 'Professors',     reading: 14.3, familiar: 0.00256, verbs: 0.415 }, // Fig. 2, green
    comm:    { name: 'European Commission press releases',   short: 'Brussels',       reading: 26.7, familiar: 0.00250, verbs: 0.476 }, // Fig. 2, blue
    ire:     { name: 'Irish government press releases',      short: 'Irish gov.',     reading: 33.1, familiar: 0.00286, verbs: 0.559 }, // Fig. 2, yellow
    uk:      { name: 'UK government press releases',         short: 'UK gov.',        reading: 40.0, familiar: 0.00289, verbs: 0.596 }, // Fig. 2, yellow
    broad:   { name: 'Broadsheet newspapers, politics pages', short: 'Broadsheets',   reading: 48.0, familiar: 0.00277, verbs: 0.680 }, // Fig. 2, green
    tabloid: { name: 'Tabloid newspapers, politics pages',   short: 'Tabloids',       reading: 64.4, familiar: 0.00283, verbs: 0.867 }, // Fig. 2, green
  },
  // Yearly mean reading ease of Commission releases: Fig. 2 lower-left panel, the dark line traced at 600 dpi (±0.7).
  trend: { 1985: 27.2, 1986: 27.8, 1987: 28.0, 1988: 28.4, 1989: 28.1, 1990: 26.0, 1991: 26.0, 1992: 26.0, 1993: 26.2,
           1994: 25.9, 1995: 25.6, 1996: 24.9, 1997: 25.2, 1998: 25.9, 1999: 26.2, 2000: 26.9, 2001: 26.6, 2002: 27.0,
           2003: 26.9, 2004: 27.3, 2005: 26.9, 2006: 26.8, 2007: 26.8, 2008: 26.4, 2009: 26.7, 2010: 27.1, 2011: 27.3,
           2012: 28.0, 2013: 28.0, 2014: 27.9, 2015: 26.7, 2016: 26.2, 2017: 26.7, 2018: 25.8, 2019: 26.5, 2020: 25.5 },
  // Moments of contestation the paper names (pp. 687-690), marked on the yearly line.
  events: [[1992, 'Danish No'], [1999, 'Santer quits'], [2005, 'Treaty No'], [2010, 'Euro crisis'], [2016, 'Brexit']],
  // Flesch (1948) reading ease, as the paper uses it (p. 691, note 3): 206.835 - 1.015*(words/sentence) - 84.6*(syllables/word)
  flesch: { a: 206.835, b: 1.015, c: 84.6 },
  scriptTolerance: 1.5,       // our choice: each script's hand-counted score must sit within this of its sender's average

  // --- The drum (ours; see calibration.js for why these values) ---
  beat: 0.55,                  // our choice: seconds per word at the start of a sentence (~67 words a minute, a slow on-air pace)
  rush: 0.012,                // our choice: the beat shrinks by this share for every word since the last full stop (breath running low);
                              //   sets the game's trade-off between sentence length and word length near the formula's (calibration.js, check 5)
  beatFloor: 0.6,             // our choice: the beat never falls below this share of the starting beat
  restBeats: 1,               // our choice: a full stop adds one rest beat and restores the breath
  lag: 0,                     // our choice: taps count for the word on screen when they land (what you see is what counts)
  extraTaps: 1,               // our choice: a word is got out with exactly its syllables in taps, or one more
  countIn: 3,                 // our choice: beats of count-in before the first word
  windows: 20,                // our choice: lit windows in the result picture
  // Per-item words, by share of words got out (ours).
  bands: [[1, 'You got every word out.'], [0.88, 'You got almost every word out.'], [0.0, null]],
};

// ---------------- the scripts ----------------
// All ours, all on one topic (trains and passengers' money), each written in its sender's register so that its
// Flesch score, with the syllables marked here by hand, matches the paper's average for that sender.
// Syllables are separated by '·'. These marks are what the player sees and taps.
const SCRIPTS = {
  tabloid: { source: 'tabloid', target: 64.4, slot: 'Tabloid', kicker: 'A tabloid’s politics page',
    text: 'Rail pas·sen·gers could soon get half their mon·ey back when trains run an hour late, un·der plans un·veiled by Eu·ro·pe·an Un·ion of·fi·cials yes·ter·day. Com·pa·nies would have to pay up with·in two weeks. Fu·ri·ous rail bos·ses say the plan will cost the in·dus·try mil·lions.',
    paper: 'Tabloid politics pages are the easiest reading in the study.' },
  uk: { source: 'uk', target: 40.0, slot: 'UK gov.', kicker: 'A UK government press release',
    text: 'The Trans·port Sec·re·tar·y has to·day an·nounced new rules to make it eas·i·er for pas·sen·gers to claim com·pen·sa·tion when their train is de·layed. From Ap·ril, op·er·a·tors will be re·quired to pay re·funds di·rect·ly in·to pas·sen·gers’ ac·counts for de·lays of fif·teen min·utes or long·er.',
    paper: 'That is how hard an average UK government press release is to read: about high-school level.' },
  comm: { source: 'comm', target: 26.7, slot: 'Brussels', kicker: 'A European Commission press release',
    text: 'The Eu·ro·pe·an Com·mis·sion has to·day a·dopt·ed a pro·pos·al for the re·vi·sion of the reg·u·la·tion on rail pas·sen·gers’ rights, with a view to the strength·en·ing of pro·tec·tion in the case of de·lays. The pro·pos·al pro·vides for the re·in·force·ment of com·pen·sa·tion en·ti·tle·ments and for more ef·fec·tive en·force·ment by na·tion·al bod·ies.',
    paper: 'That is how hard an average Commission press release is to read: university-graduate level. The study measured 44,978 of them.' },
  polsci: { source: 'polsci', target: 14.3, slot: 'Professor', kicker: 'A political-science journal abstract',
    text: 'This ar·ti·cle ex·am·ines how na·tion·al au·thor·i·ties en·force Eu·ro·pe·an pas·sen·ger rights. Draw·ing on an o·rig·i·nal da·ta·set of com·plaints, it shows that the ef·fec·tive·ness of su·pra·na·tion·al reg·u·la·tion de·pends on the ca·pac·i·ty of do·mes·tic bod·ies and on the le·gal cul·tures of the mem·ber states.',
    paper: 'Professors writing for other professors: the only group in the study harder to read than Brussels. On familiar words, Brussels did even worse than them.' },
  y1987: { source: 'comm', year: 1987, target: 28.0, slot: '1987', kicker: 'Brussels, 1987',
    text: 'The Com·mis·sion has to·day wel·comed the a·gree·ment of the Coun·cil on a first pack·age of meas·ures for the re·struc·tur·ing of air trans·port with·in the Com·mu·ni·ty. The meas·ures pro·vide for great·er flex·i·bil·i·ty in the reg·u·la·tion of fares and in the al·lo·ca·tion of ca·pac·i·ty be·tween na·tion·al car·ri·ers.',
    paper: '1987: before Maastricht, before anyone much argued about Brussels.' },
  y2004: { source: 'comm', year: 2004, target: 27.3, slot: '2004', kicker: 'Brussels, 2004',
    text: 'The Eu·ro·pe·an Com·mis·sion has to·day a·dopt·ed a fur·ther pack·age of pro·pos·als for the re·form of the rail·ways. The pack·age pro·vides for the o·pen·ing of in·ter·na·tion·al pas·sen·ger ser·vic·es to com·pe·ti·tion and for the es·tab·lish·ment of min·i·mum rights for pas·sen·gers in the case of de·lays.',
    paper: '2004: a Commissioner for communication, and a plan for “democracy, dialogue and debate”.' },
  y2020: { source: 'comm', year: 2020, target: 25.5, slot: '2020', kicker: 'Brussels, 2020',
    text: 'The Eu·ro·pe·an Com·mis·sion has to·day pub·lished guide·lines on the use of pas·sen·ger rights in the con·text of the de·vel·op·ing sit·u·a·tion with the cor·o·na·vi·rus. The guide·lines are in·tend·ed to en·sure le·gal cer·tain·ty for trav·el·lers and com·pa·nies with re·gard to re·pay·ment and re·book·ing.',
    paper: '2020: after the euro crisis, the refugee crisis and Brexit.' },
  // Ours, not the paper's: the Brussels news said plainly. The paper argues clarity is possible without "dumbing down" (pp. 686-7).
  plain: { source: null, target: null, slot: 'Encore', kicker: 'The same news, said plainly (our rewrite)',
    text: 'Good news if your train is late. The Eu·ro·pe·an Com·mis·sion wants you to get more of your mon·ey back, and to get it fast·er. It also wants each na·tion·al gov·ern·ment to check that rail com·pa·nies real·ly pay.',
    paper: 'Same news, same facts. We wrote this one; the paper argues it can be done, but does not test it.' },
};
const ORDER = ['tabloid', 'uk', 'comm', 'polsci'];          // our choice: the warm-up first, the government before Brussels, the professor after
const ARCHIVE = ['y1987', 'y2004', 'y2020'];                // our choice: three years spread over the 35 (Fig. 2 lower panel values in `target`)

// ---------------- text ----------------
function parse(text) {
  return text.split(/\s+/).filter(Boolean).map(tok => {
    const parts = tok.split('·');
    const stop = /[.!?]["”’]?$/.test(tok);
    return { word: parts.join(''), parts, syl: parts.length, stop };
  });
}
function scriptWords(id) { return parse(SCRIPTS[id].text); }

function fleschOf(words, sylFn) {
  const f = CONFIG.flesch;
  const n = words.length, sents = words.filter(w => w.stop).length || 1;
  const syl = words.reduce((s, w) => s + (sylFn ? sylFn(w.word) : w.syl), 0);
  return { score: f.a - f.b * n / sents - f.c * syl / n, words: n, sentences: sents, wps: n / sents, spw: syl / n };
}
function flesch(text) { return fleschOf(parse(text)); }

// An independent, plain syllable heuristic (vowel groups, silent final e), for the calibration check only.
function heuristicSyllables(word) {
  let w = word.toLowerCase().replace(/[^a-z]/g, '');
  if (!w) return 0;
  if (w.length <= 3) return 1;
  w = w.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '').replace(/^y/, '');
  const m = w.match(/[aeiouy]{1,2}/g);
  return Math.max(1, m ? m.length : 1);
}

// ---------------- the beat ----------------
// Each word gets one beat; the beat shrinks with every word since the last full stop; a full stop adds a rest.
function timeline(words, opt) {
  const o = Object.assign({}, CONFIG, opt || {});
  let t = o.countIn * o.beat, k = 0;
  const slots = words.map(w => {
    const dur = o.beat * Math.max(o.beatFloor, 1 - o.rush * k);
    const s = { start: t, dur, breath: Math.max(0, 1 - k / ((1 - o.beatFloor) / o.rush)) };
    t += dur; k++;
    if (w.stop) { t += o.restBeats * o.beat; k = 0; }
    return s;
  });
  return { slots, end: t + 0.3, countIn: o.countIn * o.beat };
}

// Which word a tap at time t belongs to (or -1 for a rest or the count-in).
function slotAt(tl, t, opt) {
  const lag = (opt && opt.lag != null) ? opt.lag : CONFIG.lag;
  const u = t - lag;
  for (let i = 0; i < tl.slots.length; i++) {
    const s = tl.slots[i];
    if (u >= s.start && u < s.start + s.dur) return i;
  }
  return -1;
}

// Judge a reading: taps are times in seconds from the start of the count-in.
function judge(id, taps, opt) { return Object.assign({ id }, judgeWords(scriptWords(id), taps, opt)); }
function judgeWords(words, taps, opt) {
  const o = Object.assign({}, CONFIG, opt || {});
  const tl = timeline(words, o);
  const counts = words.map(() => 0);
  for (const t of taps) { const i = slotAt(tl, t, o); if (i >= 0) counts[i]++; }
  const results = words.map((w, i) => ({ word: w.word, syl: w.syl, taps: counts[i], ok: counts[i] >= w.syl && counts[i] <= w.syl + o.extraTaps }));
  const got = results.filter(r => r.ok).length;
  const share = got / words.length;
  return { results, got, total: words.length, share, lit: Math.round(share * o.windows) };
}

// ---------------- words for the player ----------------
function oneIn(x) { // "one in four" from a share
  const n = Math.max(2, Math.round(1 / x));
  const names = ['', '', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
  return n <= 10 ? 'one word in ' + names[n] : 'one word in ' + n;
}
function itemLine(share) {
  for (const [min, txt] of CONFIG.bands) if (share >= min && txt) return txt;
  const miss = 1 - share;
  if (miss >= 0.55) return 'More than half of it came out as mush.';
  if (miss >= 0.42) return 'About half of it came out as mush.';
  if (miss >= 0.36) return 'Well over a third of it came out as mush.';
  if (miss >= 0.28) return 'About a third of it came out as mush.';
  return 'About ' + oneIn(miss) + ' came out as mush.';
}
function whyLine(id) {
  const ws = scriptWords(id), f = fleschOf(ws);
  const long = ws.filter(w => w.syl >= 4).length / ws.length;
  const longTxt = long < 0.04 ? 'Hardly any long words' : 'About ' + oneIn(long) + ' has four syllables or more';
  return longTxt + ', and sentences run about ' + Math.round(f.wps) + ' words between breathers.';
}
// How fast a script makes you drum: all its syllables over all its spoken beats (rests excluded). Skill plays no part.
function demand(id) {
  const ws = scriptWords(id), tl = timeline(ws);
  const syl = ws.reduce((s, w) => s + w.syl, 0), t = tl.slots.reduce((s, x) => s + x.dur, 0);
  return syl / t;
}
function demandLine(id, base) {
  if (!base || id === base) return 'It asked for about ' + Math.round(demand(id)) + ' taps a second.';
  const r = demand(id) / demand(base) - 1;
  const name = { tabloid: 'the tabloid', comm: 'the Brussels script you read earlier' }[base] || SCRIPTS[base].slot;
  if (r < -0.07) return 'It asked for fewer taps a second than ' + name + '.';
  if (r < 0.07) return 'It asked for about as many taps a second as ' + name + '.';
  if (r >= 0.37 && r < 0.6) return 'It made you drum about half again as many taps a second as ' + name + '.';
  const amt = r < 0.2 ? 'a few more taps' : r < 0.37 ? 'about a third more taps' : 'far more taps';
  return 'It made you drum ' + amt + ' a second than ' + name + '.';
}
function itemReport(id, j) {
  const s = SCRIPTS[id];
  return { headline: itemLine(j.share), why: whyLine(id), speed: demandLine(id, s.year ? 'comm' : 'tabloid'), paper: s.paper, lit: j.lit, share: j.share };
}

// Final verdict, from the shares the player got out: { tabloid, uk, comm, polsci, archive: {year, share} }.
function verdict(r) {
  const lines = [];
  const knots = r.comm < r.tabloid - 0.08;
  const nearProf = Math.abs(r.comm - r.polsci) <= Math.abs(r.comm - r.tabloid);
  if (knots) lines.push(nearProf
    ? 'The Brussels script tied your thumbs in knots, nearly as badly as the professor’s.'
    : 'The Brussels script tied your thumbs in knots, far worse than the tabloid’s.');
  else lines.push('You drummed your way through Brussels — but you had to tap much faster than for the tabloid.');
  if (r.archive) {
    const y = r.archive.year, d = r.archive.share - r.comm;
    lines.push(d > 0.1 ? 'Your ' + y + ' script went better than today’s — but on paper it is just as hard: the yearly average hardly moved.'
      : 'The ' + y + ' script you picked was no easier.');
  }
  lines.push('Rauh measured 44,978 real Commission press releases, 1985–2020. They are harder to read than the UK and Irish governments’ releases, far harder than any newspaper, nearer to professors writing for professors — and they never got easier.');
  lines.push('Brussels kept promising to explain itself better. On the page, it didn’t.');
  return lines;
}

// ---------------- model player (calibration only; never used in play) ----------------
function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function gauss(r) { return Math.sqrt(-2 * Math.log(1 - r())) * Math.cos(2 * Math.PI * r()); }
// A tapper who sees each word as its beat starts, reacts, then taps its syllables evenly over the time left,
// never faster than `rate` taps a second, with timing jitter. Spill-over taps land in the next window.
function modelTaps(words, skill, seed, opt) {
  const o = Object.assign({}, CONFIG, opt || {});
  const r = rng(seed), tl = timeline(words, o), taps = [];
  let busyUntil = 0;
  words.forEach((w, i) => {
    const s = tl.slots[i];
    let t = Math.max(busyUntil, s.start + skill.react + 0.03 * gauss(r));
    const room = s.dur + o.lag - (t - s.start) - 0.05;
    const iti = Math.max(1 / skill.rate, room / w.syl);
    const slip = skill.slip0 + skill.slip1 * Math.pow(1 / (iti * skill.rate), 2); // per tap: the faster you must go, the likelier a miss
    for (let k = 0; k < w.syl; k++) {
      const u = r();
      if (u < slip / 2) { t += iti; continue; }                                   // a tap missed
      taps.push(t + skill.jitter * gauss(r));
      if (u > 1 - slip / 2) taps.push(t + iti / 2 + skill.jitter * gauss(r));     // a tap doubled
      t += iti;
    }
    busyUntil = t - iti + 1 / skill.rate;
  });
  return taps;
}
function modelShare(words, skill, seed, opt) {
  return judgeWords(words, modelTaps(words, skill, seed, opt), opt).share;
}
const SKILLS = {                                       // our choice: plausible phone tappers
  steady: { rate: 5.5, react: 0.20, jitter: 0.025, slip0: 0.01, slip1: 0.12 },   // one thumb, careful
  good:   { rate: 7,   react: 0.15, jitter: 0.02,  slip0: 0.01, slip1: 0.10 },   // one thumb, practised
  drummer:{ rate: 9,   react: 0.12, jitter: 0.015, slip0: 0.01, slip1: 0.08 },   // two thumbs
};

const MECH = { CONFIG, SCRIPTS, ORDER, ARCHIVE, SKILLS, parse, scriptWords, flesch, fleschOf, heuristicSyllables,
  timeline, slotAt, judge, judgeWords, itemLine, whyLine, demand, demandLine, itemReport, verdict, rng, gauss, modelTaps, modelShare };
if (typeof module !== 'undefined' && module.exports) module.exports = MECH; else root.MECH = MECH;
})(typeof window !== 'undefined' ? window : globalThis);
