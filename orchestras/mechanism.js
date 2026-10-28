// ============================================================
// THE MORE THE BETTER? — mechanism (headless). No DOM here.
// Built from Allmendinger, Hackman & Lehman (1996), The Musical Quarterly 80(2):194–219.
// Every number below is tagged with where it comes from. Nothing here is random.
// ============================================================

const CONFIG = {
  // ---- The five bands of Figure 5 (p. 210): proportion of women in the orchestra ---
  bands: [
    { label: '1–11%',  women: 1 },  // Fig. 5 x-axis; icon: one woman in ten (stylised midpoint 6%)
    { label: '12–23%', women: 2 },  // Fig. 5 x-axis; icon: two in ten (midpoint 18%)
    { label: '24–35%', women: 3 },  // Fig. 5 x-axis; icon: three in ten (midpoint 30%)
    { label: '36–48%', women: 4 },  // Fig. 5 x-axis; icon: four in ten (midpoint 42%)
    { label: '49–60%', women: 5 },  // Fig. 5 x-axis; icon: five in ten (midpoint 55%)
  ],
  iconSeats: 10,                    // our choice: each band icon is ten seats

  // ---- The six measures of Figure 5, values read off the figure at 300 dpi (±0.05) ---
  // All measures are on 1–7 scales (p. 199: "the scale for this and all other measures ranges from 1 to 7").
  // 'axis' is the panel's own y-axis window, used only by the fidelity check.
  measures: {
    relationships: {
      name: 'how well players get along',
      paperName: 'Quality of interpersonal relationships',
      values: [5.30, 4.75, 4.46, 4.66, 4.81], axis: [4, 6] },     // read off Fig. 5, middle-left panel
    security: {
      name: 'how safe players feel in their jobs',
      paperName: 'Satisfaction with job security',
      values: [5.40, 4.80, 4.48, 4.30, 4.95], axis: [4, 6] },     // read off Fig. 5, bottom-right panel
    stability: {
      name: 'how steady the orchestra is',
      paperName: 'Stability',
      values: [6.55, 6.00, 5.62, 5.28, 5.98], axis: [4, 7] },     // read off Fig. 5, middle-right panel
    involvement: {
      name: 'how much players throw themselves into the work',
      paperName: 'Job involvement',
      values: [5.85, 5.32, 4.22, 4.18, 3.40], axis: [3, 6] },     // read off Fig. 5, bottom-left panel
    structure: {
      name: 'how well the orchestra is set up for its work',
      paperName: 'Orchestra structure: task and composition',
      values: [5.45, 4.93, 4.60, 4.49, 4.82], axis: [4, 6] },     // read off Fig. 5, top-right panel
    integrity: {
      name: 'how intact the ensemble feels',
      paperName: 'Integrity as an ensemble',
      values: [5.62, 5.30, 4.90, 4.62, 4.40], axis: [4, 6] },     // read off Fig. 5, top-left panel
  },
  // The text's own classification (p. 210–11): "for some of them, that downward trend continued
  // uninterrupted (see, for example, the graphs for integrity as an ensemble and for job involvement).
  // For the majority of the measures, however, there comes a 'tipping point'".
  paperSaysNoRecovery: ['integrity', 'involvement'],

  // ---- Rounds, ordered for the player, not as Figure 5 orders them (our choice) -----
  rounds: ['relationships', 'security', 'stability', 'involvement'], // discovery first, theory confirmed twice, then the exception
  replayRounds: ['structure', 'integrity'],                          // second set: one recovers, one does not

  // ---- The chart and the drawing ---------------------------------------------------
  yWindow: [3, 7],       // our choice: the part of the 1–7 scale shown, same for every measure, so dips are visible
  snap: 0.1,             // our choice: drawn values snap to a tenth of a point
  anchorFirst: true,     // our choice: the first band's value is given, so the player draws shape, not level

  // ---- Scoring (ours; the curves are the paper's) -----------------------------------
  flatTol: 0.2,          // our choice: a change smaller than this counts as "no change" when reading a shape
  missRound: 0.1,        // our choice: the miss is reported to a tenth of a point

  // ---- The opener: women's share in 1990 by standing (table p. 209) and by country (p. 207) ---
  shareByStanding: {
    'United States':  { major: 24, regional: 52 },   // p. 209
    'United Kingdom': { major: 26, regional: 38 },   // p. 209
    'East Germany':   { major: 13, regional: 22 },   // p. 209
    'West Germany':   { major: 13, regional: 20 },   // p. 209
  },
  medianShare: { 'United States': 36, 'United Kingdom': 30, 'Germany': 16 }, // p. 207: medians by country
  sampleMedian: 21, sampleRange: [2, 59],                                    // p. 207
  orchestras: 78,                                                            // p. 194: seventy-eight orchestras
  stageBounds: { token: 10, transition: 40 },                                // p. 211: token ≤10%, transition 10–40%, balanced 40–60%
};

// ---------- shapes ----------------------------------------------------
// A shape is two answers: does the line fall at first (band 1 to band 3)? does it recover at the end
// (last band above the lowest of bands 3 and 4)? Changes within flatTol count as no change.
function classifyShape(values, tol) {
  if (tol === undefined) tol = CONFIG.flatTol;
  const d = (a, b) => Math.round((a - b) * 100) / 100;   // differences to a hundredth, so 5.5 − 5.3 is exactly 0.2
  const falls = d(values[2], values[0]) < -tol;
  const rises = d(values[2], values[0]) > tol;
  const low = Math.min(values[2], values[3]);
  const recovers = d(values[4], low) > tol;
  return { falls, rises, recovers };
}

// Alternative rule, used only by the fidelity check: the sign of every segment, no dead zone.
function classifyBySegments(values) {
  const d = values.slice(1).map((v, i) => Math.sign(v - values[i]));
  return { falls: d[0] < 0 && d[1] <= 0, recovers: d[3] > 0 };
}

function shapeWords(s) {
  if (s.falls && s.recovers) return 'falls, then recovers';
  if (s.falls) return 'falls and keeps falling';
  if (s.rises) return 'rises';
  if (s.recovers) return 'rises at the end';
  return 'stays about level';
}

// ---------- scoring ----------------------------------------------------
function roundTo(x, step) { return Math.round(x / step) * step; }

// drawn: five values, the first equal to the paper's first band (the anchor).
function scoreDrawing(measureId, drawn) {
  const m = CONFIG.measures[measureId];
  const paper = m.values;
  const from = CONFIG.anchorFirst ? 1 : 0;
  let sum = 0;
  for (let i = from; i < 5; i++) sum += Math.abs(drawn[i] - paper[i]);
  const miss = roundTo(sum / (5 - from), CONFIG.missRound);
  const yours = classifyShape(drawn), theirs = classifyShape(paper);
  const shapeRight = yours.falls === theirs.falls && yours.recovers === theirs.recovers;
  return { measureId, miss, shapeRight, yours, theirs, verdict: roundVerdict(shapeRight, yours, theirs, miss) };
}

function roundVerdict(shapeRight, yours, theirs, miss) {
  const head = shapeRight ? 'Shape right.' : 'Shape wrong.';
  const body = shapeRight
    ? `It ${shapeWords(theirs)}, as you drew.`
    : `You drew a line that ${shapeWords(yours)}; in the study it ${shapeWords(theirs)}.`;
  return `${head} ${body} Your dots missed by ${miss.toFixed(1)} points on average.`;
}

// ---------- the opener ----------------------------------------------------
function openerAnswer() {
  const rows = Object.entries(CONFIG.shareByStanding).map(([country, s]) => ({ country, ...s }));
  const regionalEverywhere = rows.every(r => r.regional > r.major);
  return { answer: regionalEverywhere ? 'regional' : 'mixed', rows };
}

// ---------- the session ----------------------------------------------------
function sessionVerdict(results) {
  const n = results.length, right = results.filter(r => r.shapeRight).length;
  const miss = n ? roundTo(results.reduce((a, r) => a + r.miss, 0) / n, CONFIG.missRound) : 0;
  return { n, right, miss, line: `You drew ${right} of ${n} shapes right. Your dots missed by ${miss.toFixed(1)} points on average.` };
}

// ---------- band icons ----------------------------------------------------
function bandIcon(i) { return { women: CONFIG.bands[i].women, seats: CONFIG.iconSeats, label: CONFIG.bands[i].label }; }

if (typeof module !== 'undefined') module.exports = {
  CONFIG, classifyShape, classifyBySegments, shapeWords, scoreDrawing, roundVerdict, openerAnswer, sessionVerdict, bandIcon, roundTo,
};
