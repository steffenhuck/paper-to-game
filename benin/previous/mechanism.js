// The Honest Billboard: mechanism (single source of truth; runs unchanged in Node and in the browser).
// Beber & Scacco (2022), "The Myth of the Misinformed Migrant?", Ruhr Economic Papers 957, doi:10.4419/96973121.
// Nothing here is simulated and nothing is random: every share comes from a histogram or stacked bar in the paper.

const CONFIG = {
  sampleHouseholds: 555,                    // p. 5, p. 12
  leftLastYear: 23,                         // p. 14: 23% of households had someone "follow land" in the previous year
  nairaPerEuro: 415,                        // our fit: ticks at ln(₦)=9..15 give the figure labels .02 .05 .14 .39 1.1 2.9 7.8 (k€); fn. 37 implies ≈409
  bandFactor: 1.5,                          // our choice: a money guess within ×1.5 of the truth counts as "about right" (varied 1.25–2 in fidelity.js)
  bandPoints: 7.5,                          // our choice: an asylum guess within ±7.5 points counts as "about right" (varied 5–10)

  // Histograms of best guesses: bin edges on the paper's x-axis, counts read off at 200 dpi, truth = dashed line.
  income: {                                 // Fig. 8, top left: monthly income per capita, EU; bins are 0.5 wide in ln(₦)
    edges: [8.5, 9, 9.5, 10, 10.5, 11, 11.5, 12, 12.5, 13, 13.5, 14, 14.5, 15, 15.5],
    counts: [1, 1, 6, 12, 39, 18, 91, 65, 91, 87, 43, 4, 7, 2],   // read off Fig. 8
    truth: 13.83,                           // dashed line read off Fig. 8 (≈€2,450; GNI p.c. EU 2017, fn. 17)
    log: true },
  italy: {                                  // Fig. 8, bottom right: maximum monthly unemployment benefit, Italy (NASpI); bins 1 wide in ln(₦)
    edges: [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
    counts: [1, 3, 0, 0, 0, 58, 97, 145, 111, 16, 12, 1],        // read off Fig. 8
    truth: 13.20,                           // dashed line read off Fig. 8 (≈€1,300; fn. 19)
    showFrom: 8,                            // display only: 4 near-zero guesses (<1%) are left off the chart but counted in the shares
    log: true },
  uk: {                                     // Fig. 8, bottom left: monthly Jobseeker's Allowance, UK
    edges: [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
    counts: [1, 5, 0, 0, 0, 32, 80, 140, 143, 32, 16, 2],        // read off Fig. 8
    truth: 11.90,                           // dashed line read off Fig. 8 (≈€350; fn. 19)
    showFrom: 8,                            // display only: 6 near-zero guesses (1.3%) are left off the chart but counted in the shares
    log: true },
  asylum: {                                 // Fig. 17: "Out of 100 Nigerians that apply for asylum in Europe, how many are allowed to stay?"
    edges: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
    counts: [55, 72, 78, 52, 116, 45, 34, 32, 15, 5],            // read off Fig. 17
    truth: 100 * 28130 / 122040,            // fn. 34: 28,130 of 122,040 Nigerian claims accepted 2011–2017 (Eurostat)
    log: false },

  // Stacked bars, shares in % read off the figures (top-to-bottom segment boundaries).
  reachEurope: { veryLikely: 52, somewhatLikely: 28, somewhatUnlikely: 7, veryUnlikely: 10, dontKnow: 3 },   // Fig. 16 left, read off to ±1, whole numbers
  ownAsylum:   { veryLikely: 47, somewhatLikely: 32, somewhatUnlikely: 11.5, veryUnlikely: 5.5, dontKnow: 3 },         // Fig. 16 right
  pirates:  { definitely: 36, probably: 21, probablyNot: 20, definitelyNot: 15, dontKnow: 8 },   // Fig. 15 right, read off to ±1, whole numbers
  vampires: { definitely: 27, probably: 18.5, probablyNot: 19.5, definitelyNot: 25.5, dontKnow: 8.5 },                   // Fig. 15 left
  motorbikeCorrect: 1,                      // p. 21: "only about 1% giving the correct response"
  boatAnswer: 15,                           // p. 21: "about 15% said boat or ship"
  agadezCorrect: 32.5,                      // Fig. 14 right, read off ("only a third", p. 22)
  medianIncomeGuessEUR: 660,                // fn. 37: ₦270,000
  medianWageEuropeEUR: 490,                 // p. 25: median expected own wage in Europe ₦200,000
  medianStayWageEUR: 490,                   // p. 25: median wage needed to stay in Nigeria, same; modal difference zero

  picks: 3,                                 // our choice: three billboards per campaign
  campaigns: 2,                             // our choice: a second campaign lets the player use what the first revealed
};

const BILLBOARDS = [
  { id: 'income', tag: 'EUROPE', fact: 'The average European lives on about €2,500 a month.', src: 'Fig. 8 · fn. 17',
    q: 'What do you think is the average personal income in Europe per month?',
    rosier: 'guessed more', gloomier: 'guessed less',
    after: 'Most guessed far less. The typical guess was €660. The truth makes Europe look better.' },
  { id: 'italy', tag: 'ITALY', fact: 'Lose your job in Italy and the state pays up to €1,300 a month.', src: 'Fig. 8 · fn. 19',
    q: 'If someone in Italy loses their job, how much does the state pay them?',
    rosier: 'guessed more', gloomier: 'guessed less',
    after: 'Almost everyone guessed less. In Italy the honest number is good news.' },
  { id: 'uk', tag: 'BRITAIN', fact: 'Lose your job in Britain and the state pays about €350 a month.', src: 'Fig. 8 · fn. 19',
    q: 'If someone in Britain loses their job, how much does the state pay them?',
    rosier: 'guessed more', gloomier: 'guessed less',
    after: 'The typical guess was right on. The rest split both ways, slightly more of them too low.' },
  { id: 'asylum', tag: 'ASYLUM', fact: 'Fewer than 1 in 4 Nigerians who ask for asylum in Europe may stay.', src: 'Fig. 17 · fn. 34',
    q: 'Out of 100 Nigerians who ask for asylum in Europe, how many may stay?',
    rosier: 'guessed more', gloomier: 'guessed fewer',
    after: 'Most guessed higher, and "half" was the favourite answer. Asked about their own claim, 79 in 100 thought it would likely succeed.' },
  { id: 'reach', tag: 'THE ROAD', fact: 'Most people who set out from here never get past Libya.', src: 'Fig. 16 · fn. 34',
    q: 'How likely is it that you would make it all the way to Europe, if you wanted to?',
    rosier: 'said "likely" for themselves', gloomier: '',
    after: 'Four in five said they themselves would likely make it. The paper calls this optimism bias: people are hopeful about Nigerians in general, and even more hopeful about themselves.' },
  { id: 'pirates', tag: 'THE SEA', fact: 'At sea, pirates steal the engines of migrant boats.', src: 'Fig. 15',
    q: 'Do you think this is true: there are sea pirates that steal the engines of boats trying to cross to Europe?',
    rosier: 'thought it false', gloomier: '',
    after: 'A third thought this real danger was made up. And when asked about vampires in the sea, half of those with an opinion said they were real.' },
];

// ---------- the mechanism ----------

const toEUR = x => Math.exp(x) / CONFIG.nairaPerEuro;
const fromEUR = e => Math.log(e * CONFIG.nairaPerEuro);

// Share of guesses below, inside and above an interval, spreading each bar's guesses evenly across the bar (on the plotted scale).
function histShares(h, lo, hi) {
  const n = h.counts.reduce((a, b) => a + b, 0); let below = 0, inside = 0, above = 0;
  h.counts.forEach((c, i) => {
    const a = h.edges[i], b = h.edges[i + 1], part = (x, y) => Math.max(0, Math.min(b, y) - Math.max(a, x)) / (b - a);
    below += c * part(-Infinity, lo); inside += c * part(lo, hi); above += c * part(hi, Infinity);
  });
  return { below: 100 * below / n, inside: 100 * inside / n, above: 100 * above / n, n };
}

function band(id, opt = {}) {
  const h = CONFIG[id], f = opt.bandFactor || CONFIG.bandFactor, d = opt.bandPoints || CONFIG.bandPoints;
  return h.log ? [h.truth - Math.log(f), h.truth + Math.log(f)] : [h.truth - d, h.truth + d];
}

// For each billboard: of 100 people, how many it warns (fact worse than their guess), tells nothing new, or backfires on (fact better).
function outcome(id, opt = {}) {
  if (CONFIG[id] && CONFIG[id].edges) {
    const [lo, hi] = band(id, opt), s = histShares(CONFIG[id], lo, hi);
    return { warn: s.above, knew: s.inside, back: s.below };     // higher income / benefit / acceptance = rosier than the fact
  }
  if (id === 'reach') { const r = CONFIG.reachEurope;
    return { warn: r.veryLikely + r.somewhatLikely, knew: r.somewhatUnlikely + r.veryUnlikely + r.dontKnow, back: 0 }; }
  if (id === 'pirates') { const p = CONFIG.pirates;
    return { warn: p.probablyNot + p.definitelyNot, knew: p.definitely + p.probably + p.dontKnow, back: 0 }; }
  throw new Error('unknown billboard ' + id);
}

// Whole people out of 100 (largest remainder), so the three counts on screen always add to 100.
function counts(id, opt) {
  const o = outcome(id, opt), keys = ['warn', 'knew', 'back'], raw = keys.map(k => o[k] * 100 / (o.warn + o.knew + o.back));
  const fl = raw.map(Math.floor); let left = 100 - fl.reduce((a, b) => a + b, 0);
  raw.map((v, i) => [v - fl[i], i]).sort((a, b) => b[0] - a[0]).forEach(([, i]) => { if (left > 0) { fl[i]++; left--; } });
  return { warn: fl[0], knew: fl[1], back: fl[2], net: fl[0] - fl[2] };
}

const ids = BILLBOARDS.map(b => b.id);
function combos(arr, k) { if (k === 0) return [[]]; if (arr.length < k) return [];
  const [x, ...rest] = arr; return combos(rest, k - 1).map(c => [x, ...c]).concat(combos(rest, k)); }
function campaignScore(pick, opt, scorer = c => c.net) { return pick.reduce((s, id) => s + scorer(counts(id, opt)), 0); }
function bestCampaign(opt, scorer) {
  let best = null; combos(ids, CONFIG.picks).forEach(c => { const s = campaignScore(c, opt, scorer); if (!best || s > best.score) best = { pick: c, score: s }; });
  return best;
}

// Display data for the reveal: histogram bars, band and truth on the plotted scale, axis ticks in plain € or numbers.
function chart(id) {
  const h = CONFIG[id];
  if (!h || !h.edges) {
    const src = id === 'reach' ? CONFIG.reachEurope : CONFIG.pirates;
    const segs = id === 'reach'
      ? [['Very likely', src.veryLikely, 'warn'], ['Somewhat likely', src.somewhatLikely, 'warn'], ['Somewhat unlikely', src.somewhatUnlikely, 'knew'], ['Very unlikely', src.veryUnlikely, 'knew'], ["Don't know", src.dontKnow, 'knew']]
      : [['Definitely true', src.definitely, 'knew'], ['Probably true', src.probably, 'knew'], ['Probably not', src.probablyNot, 'warn'], ['Definitely not', src.definitelyNot, 'warn'], ["Don't know", src.dontKnow, 'knew']];
    return { kind: 'stack', segs: segs.map(([label, v, cat]) => ({ label, v, cat })) };
  }
  const [lo, hi] = band(id);
  const lo0 = h.showFrom !== undefined ? h.showFrom : h.edges[0];
  const ticks = h.log ? [30, 100, 300, 1000, 3000, 10000].map(e => ({ x: fromEUR(e), label: e >= 1000 ? '€' + e / 1000 + 'k' : '€' + e }))
                      : [0, 20, 40, 60, 80, 100].map(v => ({ x: v, label: String(v) }));
  const n = h.counts.reduce((a, b) => a + b, 0);
  return { kind: 'hist', bars: h.counts.map((c, i) => ({ a: h.edges[i], b: h.edges[i + 1], share: 100 * c / n })).filter(r => r.a >= lo0),
    lo, hi, truth: h.truth, min: lo0, max: h.edges[h.edges.length - 1], ticks,
    truthLabel: h.log ? '€' + (Math.round(toEUR(h.truth) / 50) * 50).toLocaleString('en') : Math.round(h.truth) + ' in 100' };
}

// ---------- the game ----------

function newGame() { return { campaign: 0, known: {}, history: [] }; }
function validPick(pick) { return Array.isArray(pick) && pick.length === CONFIG.picks && new Set(pick).size === CONFIG.picks && pick.every(id => ids.includes(id)); }
const BEST = bestCampaign();

function runCampaign(g, pick) {
  if (!validPick(pick)) throw new Error('pick exactly ' + CONFIG.picks + ' different billboards');
  const results = pick.map(id => { const c = counts(id); const fresh = !g.known[id]; g.known[id] = c; return { id, fresh, ...c }; });
  const r = { pick, results, warn: results.reduce((s, x) => s + x.warn, 0), back: results.reduce((s, x) => s + x.back, 0) };
  r.score = r.warn - r.back; r.best = BEST.score; r.perfect = r.score >= BEST.score;
  g.history.push(r); g.campaign++;
  return r;
}
function anotherCampaign(g) { const last = g.history[g.history.length - 1]; return g.campaign < CONFIG.campaigns && !(last && last.perfect); }
const sgn = v => (v > 0 ? '+' : v < 0 ? '−' : '') + Math.abs(v);

function campaignLine(r) {
  if (r.perfect) return 'The best campaign there is.';
  const tag = x => BILLBOARDS.find(b => b.id === x.id).tag, out = [];
  const backs = r.results.filter(x => x.net <= -20).map(tag), wash = r.results.filter(x => x.net > -20 && x.net < 20).map(tag);
  if (backs.length) out.push(`${backs.join(' and ')} backfired: most people already thought ${backs.length > 1 ? 'those numbers were' : 'that number was'} lower than the truth.`);
  if (wash.length) out.push(`${wash.join(' and ')} was close to a wash.`);
  if (!out.length) out.push('No backfires, but a better set of three exists.');
  return out.join(' ');
}

function verdict(g) {
  const best = g.history.reduce((a, b) => (b.score > a.score ? b : a));
  const you = `Your best campaign warned ${best.warn} and backfired on ${best.back}: a score of ${sgn(best.score)} out of a possible ${sgn(BEST.score)}.`;
  const paper = 'In the survey, Benin City guessed Europe’s wealth about right or too low. The facts they got wrong were the asylum odds, the road, and their own chances.';
  const means = 'A campaign that says "Europe is worse than you think" is either useless or untrue. The honest message is about the journey.';
  return { you, paper, means };
}

function ranking() { return ids.map(id => ({ id, ...counts(id), b: BILLBOARDS.find(x => x.id === id) })).sort((a, b) => b.net - a.net); }

const vampireShare = () => { const v = CONFIG.vampires; return Math.round(100 * (v.definitely + v.probably) / (v.definitely + v.probably + v.probablyNot + v.definitelyNot)); };

const ALSO = [
  `Only about ${CONFIG.motorbikeCorrect} in 100 knew that most people cross into Niger on the back of motorbikes. ${CONFIG.boatAnswer} in 100 said by boat, though the route crosses dry land.`,
  `Only ${Math.round(CONFIG.agadezCorrect)} in 100 knew that the trucks across the Sahara leave from Agadez.`,
  `${vampireShare()} in 100 of those with an opinion thought vampires roam the sea to Europe. It is hard to tell real dangers from rumours.`,
  `The typical person expected to earn about €${CONFIG.medianWageEuropeEUR} a month in Europe. They said they would need the same €${CONFIG.medianStayWageEUR} at home to stop thinking of leaving. As if the journey cost nothing, or leaving were worth something in itself.`,
];

const M = { vampireShare, CONFIG, BILLBOARDS, ALSO, toEUR, fromEUR, histShares, band, outcome, counts, combos, campaignScore, bestCampaign, BEST, chart,
  newGame, validPick, runCampaign, anotherCampaign, campaignLine, verdict, ranking, sgn };
if (typeof module !== 'undefined') module.exports = M;
