// The Wall in the Head — mechanism. Single source of truth: every number the game shows and every
// rule that decides an outcome lives here. Runs unchanged in Node (fidelity.js) and in the page.
// Source: Alesina & Fuchs-Schündeln (2005), "Good Bye Lenin (or Not?)", NBER WP 11700.
// Areas, in the paper's column order: unemployed, sick, family, old, care.

const CONFIG = {
  // ---- Raw shares saying "only/mostly the state" (Table A2) ----------------------------------
  westShare97: [0.6324, 0.3450, 0.3278, 0.3846, 0.4077],   // Table A2, West, 1997
  eastShare97: [0.7885, 0.5276, 0.4906, 0.5609, 0.5644],   // Table A2, East, 1997
  westShare02: [0.6533, 0.4001, 0.3210, 0.3670, 0.4427],   // Table A2, West, 2002
  eastShare02: [0.7664, 0.5181, 0.4565, 0.4851, 0.5304],   // Table A2, East, 2002
  socialCond: { west: 0.6044, east: 0.7241 },               // Table A2: "social conditions define possibilities", 1999
  luck: { west: 0.4023, east: 0.3140 },                     // Table A2: "life achievements determined by luck"

  // ---- Probit coefficients ------------------------------------------------------------------
  t1East: [0.432, 0.434, 0.420, 0.426, 0.371],              // Table 1, east
  t1Year02: [0.064, 0.165, -0.012, -0.033, 0.103],          // Table 1, year02
  t1EastX02: [-0.123, -0.161, -0.060, -0.143, -0.176],      // Table 1, east*year02
  t5EastX02: [-0.124, -0.109, -0.022, -0.067, -0.130],      // Table 5 (same individuals both years), east*year02
  t8East: [0.293, 0.330, 0.367, 0.313, 0.235],              // Table 8 (with state income, unemployment, transfers), east
  t9East: [0.076, 0.204, 0.221, 0.202, 0.130],              // Table 9, east (East Germans now living in the West)
  t9EastInEast: [0.383, 0.246, 0.212, 0.239, 0.258],        // Table 9, east living in East (added on top)
  t3Age: [-0.000, -0.002, -0.003, -0.003, -0.005],          // Table 3, age (West)
  t3EastXAge: [0.009, 0.011, 0.010, 0.015, 0.008],          // Table 3, east*age
  t4East: [0.318, 0.246, 0.147, 0.081, 0.205],              // Table 4, east (born after 1975, the omitted cohort)
  t4Cohort: [                                               // Table 4, cohort main effects (West), rows = cohorts below
    [0, 0, 0, 0, 0],
    [0.014, 0.018, -0.204, -0.215, -0.027],
    [-0.092, -0.061, -0.431, -0.391, -0.086],
    [-0.064, -0.105, -0.488, -0.517, -0.092],
    [-0.008, -0.104, -0.420, -0.467, -0.006]],
  t4CohortXEast: [                                          // Table 4, cohort*east
    [0, 0, 0, 0, 0],
    [-0.106, -0.007, 0.120, 0.128, 0.012],
    [0.169, 0.180, 0.286, 0.314, 0.152],
    [0.356, 0.392, 0.501, 0.643, 0.365],
    [0.303, 0.458, 0.454, 0.754, 0.391]],
  fig1: [                                                   // read off Fig. 1 (East minus West, share), rows = cohorts
    [0.110, 0.095, 0.055, 0.030, 0.080],
    [0.065, 0.095, 0.180, 0.170, 0.100],
    [0.195, 0.190, 0.325, 0.310, 0.180],
    [0.245, 0.295, 0.430, 0.475, 0.265],
    [0.210, 0.320, 0.385, 0.495, 0.240]],
  cohorts: [                                                // Section 3.1 cohort groups; years under communism: ours, counting 1945–1990 as the paper does
    { label: 'after 1975', years: 'under 15 years, as a child' },
    { label: '1961–75', years: '15–29 years' },
    { label: '1946–60', years: '30–44 years' },
    { label: '1931–45', years: 'all 45 years' },
    { label: 'before 1931', years: 'all 45, after a youth before it' }],

  // ---- History and votes --------------------------------------------------------------------
  income1928to36: { east: [1203, 877, 1169], west: [1203, 913, 1200], years: [1928, 1932, 1936] }, // footnote 6, Mark
  pds1998: { east: [20.3, 23.6, 20.0, 20.7, 21.2], west: [1.0, 0.7, 2.4, 2.3, 1.5, 1.0, 1.2, 1.0, 1.0, 1.5] }, // Table A6
  pds2002: { east: [17.2, 16.3, 16.2, 14.4, 17.0], west: [0.9, 0.7, 2.2, 2.1, 1.3, 1.0, 1.2, 1.0, 1.4, 1.3] }, // Table A6
  eastIncomeRatio: 0.8,       // Section 2.2: East income per capita ~80% of West
  unemploymentRatio: 2,       // Section 2.2: unemployment roughly twice as large
  surveyGapYears: 5,          // 1997 to 2002
  firstSurveyAfterUnification: 7, // 1990 to 1997
  unificationYear: 1990,

  // ---- Gameplay -----------------------------------------------------------------------------
  betQuestion: 0,             // our choice: the opening jar uses the unemployment question, the most concrete
  forecastMin: 1995,          // our choice: slider range for the closing forecast
  forecastMax: 2070,
  forecastStart: 2045,        // our choice: the flag starts away from the paper's band
};

// ---- Statistics --------------------------------------------------------------------------------
function erf(x) { // Abramowitz–Stegun 7.1.26, |error| < 1.5e-7
  const t = 1 / (1 + 0.3275911 * Math.abs(x));
  const y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x);
  return x >= 0 ? y : -y;
}
function Phi(x) { return 0.5 * (1 + erf(x / Math.SQRT2)); }
function PhiInv(p) { let lo = -8, hi = 8; for (let i = 0; i < 80; i++) { const m = (lo + hi) / 2; if (Phi(m) < p) lo = m; else hi = m; } return (lo + hi) / 2; }
const mean = a => a.reduce((s, v) => s + v, 0) / a.length;

// Convert a probit coefficient into a difference in share, evaluated at a base share (our approximation).
function pointsAt(coef, base) { const z = PhiInv(base); return Phi(z + coef) - Phi(z); }
// Cross-partial for the east*year02 interaction (Ai & Norton 2003, as the paper's footnote 15).
function interactionAt(e, y, ey, base) { const z = PhiInv(base); return Phi(z + e + y + ey) - Phi(z + y) - Phi(z + e) + Phi(z); }

// ---- Derived numbers (all the game displays) -------------------------------------------------
function derive(baseKey) {
  const C = CONFIG, base = C[baseKey || 'westShare97'], A = [0, 1, 2, 3, 4];
  const rawGap97 = A.map(q => C.eastShare97[q] - C.westShare97[q]);
  const rawGap02 = A.map(q => C.eastShare02[q] - C.westShare02[q]);
  const eastPts = A.map(q => pointsAt(C.t1East[q], base[q]));
  const change02 = A.map(q => interactionAt(C.t1East[q], C.t1Year02[q], C.t1EastX02[q], base[q]));
  const yearsToClose = A.map(q => eastPts[q] / -change02[q] * C.surveyGapYears);
  const closeYear = yearsToClose.map(y => C.unificationYear + C.firstSurveyAfterUnification + y);
  const panelRatio = A.map(q => C.t5EastX02[q] / C.t1EastX02[q]);
  const regionalPts = A.map(q => pointsAt(C.t8East[q], base[q]));
  const moverPts = A.map(q => pointsAt(C.t9East[q], base[q]));
  const stayerPts = A.map(q => pointsAt(C.t9East[q] + C.t9EastInEast[q], base[q]));
  const cohortFig = C.fig1.map(r => mean(r));
  const cohortCalc = C.t4CohortXEast.map((r, c) => mean(A.map(q => {
    const z = PhiInv(base[q]) + C.t4Cohort[c][q];
    return Phi(z + C.t4East[q] + r[q]) - Phi(z);
  })));
  const ageWest = mean(C.t3Age), ageEast = mean(A.map(q => C.t3Age[q] + C.t3EastXAge[q]));
  return {
    rawGap97, rawGap02, eastPts, change02, yearsToClose, closeYear, panelRatio, regionalPts, moverPts, stayerPts,
    cohortFig, cohortCalc, ageWest, ageEast,
    mindShare: mean(panelRatio),                       // share of the narrowing still present among the same individuals = minds changing
    closeLo: Math.min(...closeYear), closeHi: Math.max(...closeYear),
    pds98: { east: mean(C.pds1998.east), west: mean(C.pds1998.west) },
    pds02: { east: mean(C.pds2002.east), west: mean(C.pds2002.west) },
  };
}
const D = derive();
const pts = x => Math.round(100 * x);

// ---- The bet ----------------------------------------------------------------------------------
function betResult(choice) { // choice: 'more' | 'less'
  const q = CONFIG.betQuestion, w = pts(CONFIG.westShare97[q]), e = pts(CONFIG.eastShare97[q]);
  const right = choice === 'more';
  return { west: w, east: e, right,
    head: right ? 'More. You called it.' : 'More, not less.',
    line: right
      ? `${e} in every 100 East Germans said "the state", against ${w} in every 100 West Germans.`
      : `${e} in every 100 East Germans said "the state", against ${w} in every 100 West Germans. "They'll be sick of the state" is a natural guess, and it is the first idea the paper rejects.` };
}

// ---- The evidence cards -----------------------------------------------------------------------
// chart: { kind: 'pairs' | 'bars' | 'split', rows } — numbers only; the page draws them.
const CARDS = [
  { id: 'income', title: 'Same pay, same job', compares: 'East vs West Germans with the same income, schooling, job and family.',
    shows: 'the gap stays when you compare people with the same income and job',
    source: 'Tables A2, 1 and 8',
    chart: { kind: 'bars', unit: 'points more East Germans say "the state"', rows: [
      { label: 'Everyone', v: pts(mean(D.rawGap97)) },
      { label: 'Same pay, job, family', v: pts(mean(D.eastPts)) },
      { label: '…and counting aid to the East', v: pts(mean(D.regionalPts)) }] },
    finding: `Comparing like with like barely moves the gap. Counting the money the eastern states receive explains up to a third of it; most of it remains.` },
  { id: 'cohort', title: 'Old and young', compares: 'The East–West gap in each generation, by year of birth.',
    shows: 'the gap is small in the young and large in the old',
    source: 'Fig. 1 (read off), Tables 3 and 4',
    chart: { kind: 'bars', unit: 'points more East Germans say "the state", by year of birth', rows:
      CONFIG.cohorts.map((c, i) => ({ label: 'born ' + c.label, sub: c.years, v: pts(D.cohortFig[i]) })) },
    finding: `The longer someone lived under communism, the bigger the gap. And age pulls the two sides opposite ways: older West Germans want less state, older East Germans more.` },
  { id: 'before', title: 'Before the split', compares: 'The later East and West regions before 1945.',
    shows: 'before 1945 the two halves had the same incomes, and the West voted, if anything, more for state intervention',
    source: 'Table A1, footnote 6, Section 2.1.2',
    chart: { kind: 'pairs', unit: 'income per head, Mark', rows: CONFIG.income1928to36.years.map((y, i) =>
      ({ label: String(y), east: CONFIG.income1928to36.east[i], west: CONFIG.income1928to36.west[i] })) },
    finding: 'Before the split the two halves were equally rich. In the 1898 elections the West, if anything, leaned more towards state intervention. Places that were Prussian show no extra love of the state.' },
  { id: 'panel', title: 'Same people, five years on', compares: 'The same East Germans asked in 1997 and again in 2002.',
    shows: 'the same individuals became less keen on the state between 1997 and 2002',
    source: 'Tables 1 and 5, Section 3.2',
    chart: { kind: 'split', unit: 'why the gap narrowed, 1997 to 2002', rows: [
      { label: 'the same people changed their minds', v: pts(D.mindShare) },
      { label: 'older people replaced by younger', v: 100 - pts(D.mindShare) }] },
    finding: 'East Germans are converging on the West, and mostly because the same people are changing their minds. Preferences that move are not a fixed trait that migration sorted.' },
  { id: 'ballot', title: 'The ballot box', compares: 'Votes for the ex-communist party (PDS) in the 1998 federal election.',
    shows: 'people in the East voted for the ex-communist party far more',
    source: 'Table A6, Section 5',
    chart: { kind: 'pairs', unit: '% of votes for the PDS', rows: [
      { label: '1998', east: Math.round(D.pds98.east), west: Math.round(D.pds98.west * 10) / 10 },
      { label: '2002', east: Math.round(D.pds02.east), west: Math.round(D.pds02.west * 10) / 10 }] },
    finding: 'Votes cost effort and the survey answers cost nothing, yet they tell the same story, including the drift towards the centre by 2002.' },
  { id: 'beliefs', title: 'Luck or society?', compares: 'What East and West Germans think decides how a life turns out.',
    shows: 'East Germans believe more that society, not luck or effort, decides your fate',
    source: 'Tables A2, 11 and 13, Section 4',
    chart: { kind: 'pairs', unit: '% who agree', rows: [
      { label: '"Society decides my chances"', east: pts(CONFIG.socialCond.east), west: pts(CONFIG.socialCond.west) },
      { label: '"Life is down to luck"', east: pts(CONFIG.luck.east), west: pts(CONFIG.luck.west) }] },
    finding: 'If society decides who ends up poor, society should fix it. A tenet of the regime\'s ideology, it is held more by the old who lived longest under it. The paper also suggests people simply got used to an all-providing state.' },
  { id: 'movers', title: 'Those who moved West', compares: 'East Germans who now live in the West vs those who stayed.',
    shows: 'East Germans who moved West are much less keen on the state than those who stayed',
    source: 'Table 9, Section 3.4',
    chart: { kind: 'bars', unit: 'points more than West Germans say "the state"', rows: [
      { label: 'Stayed in the East', v: pts(mean(D.stayerPts)) },
      { label: 'Moved to the West', v: pts(mean(D.moverPts)) }] },
    finding: 'Movers are closer to West Germans. The paper cannot say whether living in the West changed them or whether they were different to begin with.' },
];

// ---- The doubter's objections, in the order played -------------------------------------------
// answer: the card the paper itself uses against this alternative (section in source).
const OBJECTIONS = [
  { id: 'poverty', say: `Of course they want help. They're poorer: the East earns about ${pts(1 - CONFIG.eastIncomeRatio)}% less and has twice the unemployment.`,
    crux: 'whether it is just money', answer: 'income', source: 'Sections 3, 3.3',
    yield: 'Fair. Some of it is money. Most of it isn\'t.' },
  { id: 'shock', say: 'Then it\'s the shock of 1990. Factories closed overnight, and everyone in the East clung to the state.',
    crux: 'whether it was 45 years of communism, or just the upheaval after it', answer: 'cohort', source: 'Sections 3.1, 3.5',
    yield: 'Hm. The shock of 1990 hit every generation, but the gap grows with the years each one lived under communism.' },
  { id: 'always', say: 'Easterners were always like this. Different region, different history, long before communism.',
    crux: 'what the two halves were like before 1945', answer: 'before', source: 'Section 2.1.2, Table A1',
    yield: 'All right. Before the war you couldn\'t tell them apart.' },
  { id: 'selection', say: 'Three million fled West before the Wall went up in 1961. The ones who liked markets left; the ones who liked the state stayed.',
    crux: 'whether the gap is just who left and who stayed', answer: 'panel', source: 'Sections 2.1.3, 3.2',
    yield: 'If it were only who left, the gap would sit still. Instead the very same people are shifting. Point taken.' },
  { id: 'talk', say: 'People tell a survey taker anything. Talk is cheap.',
    crux: 'whether people act on these answers', answer: 'ballot', source: 'Section 5, Table A6',
    yield: 'Votes, then. That\'s more than talk.' },
  { id: 'why', say: 'Fine, the regime did it. But how can a government change what people want?',
    crux: 'what changed inside people\'s heads', answer: 'beliefs', source: 'Section 4',
    yield: 'So it changed what they believe about how lives turn out. That I can follow.' },
];

// Specific rebuttals for tempting wrong cards; otherwise a generic one is built from the card and objection.
const REBUTTALS = {
  'selection:movers': 'That helps me! The ones who left are less keen on the state, exactly what you\'d see if they were different all along. The paper itself says it can\'t tell.',
  'always:cohort': 'Suggestive. But an old regional culture could also be strongest in the old. Show me what the regions were like before 1945.',
  'shock:panel': 'That shows minds are moving now. It doesn\'t say what put the difference there in the first place.',
  'shock:income': 'You showed me that already. It rules out income, not the upheaval of 1990.',
  'poverty:movers': 'Movers also moved to the richer West. That mixes money and place together; it isn\'t a clean test.',
  'why:panel': 'That shows minds can change. My question is what is in them.',
};

const cardById = id => CARDS.find(c => c.id === id);

function judge(objIndex, cardId) {
  const o = OBJECTIONS[objIndex], c = cardById(cardId);
  if (!o || !c) throw new Error('bad play');
  if (o.answer === cardId) return { ok: true, line: o.yield, finding: c.finding };
  const key = o.id + ':' + cardId;
  return { ok: false, line: REBUTTALS[key] || `True: ${c.shows}. But that doesn't settle my point, which is ${o.crux}.`, finding: c.finding };
}

// ---- Session state ------------------------------------------------------------------------------
function newSession() { return { bet: null, obj: 0, tries: OBJECTIONS.map(() => 0), settled: OBJECTIONS.map(() => false), seen: {}, forecast: null }; }

function play(s, cardId) {
  if (s.obj >= OBJECTIONS.length || s.settled[s.obj]) throw new Error('no open objection');
  const r = judge(s.obj, cardId);
  s.tries[s.obj] += 1; s.seen[cardId] = true;
  if (r.ok) s.settled[s.obj] = true;
  return Object.assign({ tries: s.tries[s.obj], firstTry: r.ok && s.tries[s.obj] === 1 }, r);
}
function advance(s) { if (s.settled[s.obj]) s.obj += 1; return s.obj; }
function firstTries(s) { return s.tries.filter((t, i) => s.settled[i] && t === 1).length; }

function forecastResult(year) {
  const lo = Math.round(D.closeLo), hi = Math.round(D.closeHi);
  const inside = year >= lo && year <= hi;
  return { year, lo, hi, inside, mind: pts(D.mindShare),
    head: inside ? `${year}: inside the paper's range.` : year < lo ? `${year}: sooner than the paper expects.` : `${year}: later than the paper expects.`,
    line: `If the 1997–2002 pace held, the gap would close between about ${lo} and ${hi}, depending on the question: one to two generations. That is the paper's straight-line forecast from 2005, and it says so. About ${pts(D.mindShare)}% of the narrowing came from people changing their minds, the rest from older East Germans being replaced by younger ones.` };
}

function verdict(s) {
  const n = s.settled.filter(Boolean).length, k = firstTries(s);
  return {
    you: `You settled ${n} of ${OBJECTIONS.length} objections, ${k} of them at the first try.`,
    paper: `In the paper's survey, East Germans were about ${pts(mean(D.eastPts))} points more likely than comparable West Germans to want the state in charge. The gap was biggest in those who lived longest under communism, and money, history and migration do not explain it away.`,
    means: 'A political system can reshape what its citizens want, and the change takes a generation or two to wear off.',
  };
}

const MECH = { CONFIG, Phi, PhiInv, pointsAt, interactionAt, derive, D, CARDS, OBJECTIONS, REBUTTALS, judge, newSession, play, advance, firstTries, betResult, forecastResult, verdict };
if (typeof module !== 'undefined') module.exports = MECH;
