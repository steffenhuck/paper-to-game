// Ask First: mechanism (single source of truth; runs unchanged in Node and in the browser).
// Beber & Scacco (2022), "The Myth of the Misinformed Migrant?", Ruhr Economic Papers 957, doi:10.4419/96973121.
// Every share comes from a histogram or stacked bar in the paper. The people at the doors are single draws from those
// reported distributions, one question each; no joint distribution across questions is constructed.

const CONFIG = {
  sampleHouseholds: 555,                    // p. 5, p. 12
  leftLastYear: 23,                         // p. 14: 23% of households had someone "follow land" in the previous year
  nairaPerEuro: 415,                        // our fit: ticks at ln(₦)=9..15 give Fig. 8's labels .02 .05 .14 .39 1.1 2.9 7.8 (k€); fn. 37 implies ≈409
  phoneCredit: 50,                          // fn. 16: ₦50 phone credit for each answer in the top half of best guesses
  bandFactor: 1.5,                          // our choice: a money guess within ×1.5 of the truth counts as "about right" (varied 1.25–2 in calibration.js)
  bandPoints: 7.5,                          // our choice: an asylum guess within ±7.5 points counts as "about right" (varied 5–10)
  knocks: 12,                               // our choice: twelve doors on one street (the survey had 555)
  ageMin: 18, ageMax: 34,                   // p. 12: one household member aged 18–34 was interviewed

  // Histograms of best guesses: bin edges on the paper's x-axis, counts read off, truth = dashed line.
  income: {                                 // Fig. 8, top left: monthly income per capita, EU; bins 0.5 wide in ln(₦)
    edges: [8.5, 9, 9.5, 10, 10.5, 11, 11.5, 12, 12.5, 13, 13.5, 14, 14.5, 15, 15.5],
    counts: [1, 1, 6, 12, 39, 18, 91, 65, 91, 87, 43, 4, 7, 2],   // read off Fig. 8 (200 dpi; re-checked at 80 dpi)
    truth: 13.83,                           // dashed line read off Fig. 8 (≈€2,450; GNI p.c. EU 2017, fn. 17)
    log: true },
  italy: {                                  // Fig. 8, bottom right: maximum monthly unemployment benefit, Italy (NASpI); bins 1 wide in ln(₦)
    edges: [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
    counts: [1, 3, 0, 0, 0, 58, 97, 145, 111, 16, 12, 1],        // read off Fig. 8
    truth: 13.20,                           // dashed line read off Fig. 8 (≈€1,300; fn. 19)
    log: true },
  uk: {                                     // Fig. 8, bottom left: monthly Jobseeker's Allowance, UK
    edges: [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
    counts: [1, 5, 0, 0, 0, 32, 80, 140, 143, 32, 16, 2],        // read off Fig. 8
    truth: 11.90,                           // dashed line read off Fig. 8 (≈€350; fn. 19)
    log: true },
  asylum: {                                 // Fig. 17: "Out of 100 Nigerians that apply for asylum in Europe, how many are allowed to stay?"
    edges: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
    counts: [55, 72, 78, 52, 116, 45, 34, 32, 15, 5],            // read off Fig. 17
    truth: 100 * 28130 / 122040,            // fn. 34: 28,130 of 122,040 Nigerian claims accepted 2011–2017 (Eurostat)
    log: false },

  // Stacked bars, shares in % read off the figures (segment boundaries), whole or half numbers.
  reachEurope: { veryLikely: 52, somewhatLikely: 28, somewhatUnlikely: 7, veryUnlikely: 10, dontKnow: 3 },          // Fig. 16 left
  ownAsylum:   { veryLikely: 47, somewhatLikely: 32, somewhatUnlikely: 11.5, veryUnlikely: 5.5, dontKnow: 3 },      // Fig. 16 right
  pirates:  { definitely: 36, probably: 21, probablyNot: 20, definitelyNot: 15, dontKnow: 8 },                      // Fig. 15 right
  vampires: { definitely: 27, probably: 18.5, probablyNot: 19.5, definitelyNot: 25.5, dontKnow: 8.5 },              // Fig. 15 left
  motorbikeCorrect: 1,                      // p. 21: "only about 1% giving the correct response"
  boatAnswer: 15,                           // p. 21: "about 15% said boat or ship"
  agadezCorrect: 32.5,                      // Fig. 14 right, read off ("only a third", p. 22)
  medianIncomeGuessEUR: 660,                // fn. 37: ₦270,000
  medianWageEuropeEUR: 490,                 // p. 25: median expected own wage in Europe ₦200,000
  medianStayWageEUR: 490,                   // p. 25: median wage needed to stay in Nigeria, the same; modal difference zero
  washBand: 20,                             // our choice: a poster whose warned minus backfired is within ±20 of 100 is called "close to a wash"
};

// The six posters Europe drafted. Three about Europe (like the Danish benefit ads, Fig. 1), three about the journey (like
// "Telling the Real Story", Fig. 1). Each fact is the paper's true value; each question is the survey's own item, shortened.
const POSTERS = [
  { id: 'income', tag: 'EUROPE', fact: 'The average European lives on about €2,500 a month.', src: 'Fig. 8 · fn. 17',
    q: 'What is the average income in Europe, per person, per month?', kind: 'money',
    red: 'Guessed less than €2,500. This poster makes Europe look better to them.', green: 'Guessed more than €2,500. This poster warns them.', white: 'About right. Nothing new.' },
  { id: 'italy', tag: 'ITALY', fact: 'Lose your job in Italy and the state pays up to €1,300 a month.', src: 'Fig. 8 · fn. 19',
    q: 'If someone in Italy loses their job, how much does the state pay them a month?', kind: 'money',
    red: 'Guessed less than €1,300. This poster makes Italy look better to them.', green: 'Guessed more than €1,300. This poster warns them.', white: 'About right. Nothing new.' },
  { id: 'uk', tag: 'BRITAIN', fact: 'Lose your job in Britain and the state pays about €350 a month.', src: 'Fig. 8 · fn. 19',
    q: 'If someone in Britain loses their job, how much does the state pay them a month?', kind: 'money',
    red: 'Guessed less than €350. This poster makes Britain look better to them.', green: 'Guessed more than €350. This poster warns them.', white: 'About right. Nothing new.' },
  { id: 'asylum', tag: 'ASYLUM', fact: 'Fewer than 1 in 4 Nigerians who ask for asylum in Europe may stay.', src: 'Fig. 17 · fn. 34',
    q: 'Out of 100 Nigerians who ask for asylum in Europe, how many may stay?', kind: 'share',
    red: 'Guessed fewer than 1 in 4. The real number is better news to them.', green: 'Guessed more than 1 in 4. This poster warns them.', white: 'About right. Nothing new.' },
  { id: 'reach', tag: 'THE ROAD', fact: 'Most who set out from here never get past Libya.', src: 'Fig. 16 · fn. 34',
    q: 'If you tried, how likely is it that you would make it all the way to Europe?', kind: 'reach',
    green: 'Thinks they would make it. This poster warns them.', white: 'Already doubtful. Nothing new.', dk: "Doesn't know. Counted as nothing new." },
  { id: 'pirates', tag: 'THE SEA', fact: 'At sea, pirates steal the engines of migrant boats.', src: 'Fig. 15',
    q: 'Is it true that sea pirates steal the engines of boats crossing to Europe?', kind: 'pirates',
    green: 'Thinks it is made up. This poster warns them.', white: 'Already believes it. Nothing new.', dk: "Doesn't know. Counted as nothing new." },
];

// Invented people for the doors (names common in Benin City). Ages are drawn from the survey's 18–34 range.
const PEOPLE = [
  ['Osas', 'm'], ['Ivie', 'f'], ['Efosa', 'm'], ['Osaro', 'm'], ['Eghosa', 'm'], ['Uyi', 'm'], ['Esosa', 'f'], ['Nosa', 'm'],
  ['Omoze', 'f'], ['Ehis', 'm'], ['Blessing', 'f'], ['Precious', 'f'], ['Osamudiamen', 'm'], ['Itohan', 'f'], ['Ewaen', 'f'],
  ['Joy', 'f'], ['Edosa', 'm'], ['Obehi', 'f'], ['Aisosa', 'f'], ['Kingsley', 'm'], ['Favour', 'f'], ['Idemudia', 'm'],
  ['Eseosa', 'f'], ['Victor', 'm'],
];

// ---------- randomness (seeded, so a street can be replayed exactly) ----------

function rng(seed) {                                      // mulberry32
  let a = seed >>> 0;
  return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
function pickWeighted(r, weights) {
  const total = weights.reduce((a, b) => a + b, 0); let u = r() * total;
  for (let i = 0; i < weights.length; i++) { u -= weights[i]; if (u < 0) return i; }
  return weights.length - 1;
}

// ---------- the city: shares from the paper ----------

const toEUR = x => Math.exp(x) / CONFIG.nairaPerEuro;
const fromEUR = e => Math.log(e * CONFIG.nairaPerEuro);
const poster = id => POSTERS.find(p => p.id === id);
const ids = POSTERS.map(p => p.id);

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

// For each poster: of the whole survey, the share it warns (fact worse than their belief), tells nothing new, or backfires on (fact better).
function outcome(id, opt = {}) {
  if (CONFIG[id] && CONFIG[id].edges) {
    const [lo, hi] = band(id, opt), s = histShares(CONFIG[id], lo, hi);
    return { warn: s.above, knew: s.inside, back: s.below };     // higher income / benefit / acceptance = rosier than the fact
  }
  if (id === 'reach') { const r = CONFIG.reachEurope;
    return { warn: r.veryLikely + r.somewhatLikely, knew: r.somewhatUnlikely + r.veryUnlikely + r.dontKnow, back: 0 }; }
  if (id === 'pirates') { const p = CONFIG.pirates;
    return { warn: p.probablyNot + p.definitelyNot, knew: p.definitely + p.probably + p.dontKnow, back: 0 }; }
  throw new Error('unknown poster ' + id);
}

// Whole people out of 100 (largest remainder), so the three counts on screen always add to 100.
function counts(id, opt) {
  const o = outcome(id, opt), keys = ['warn', 'knew', 'back'], raw = keys.map(k => o[k] * 100 / (o.warn + o.knew + o.back));
  const fl = raw.map(Math.floor); let left = 100 - fl.reduce((a, b) => a + b, 0);
  raw.map((v, i) => [v - fl[i], i]).sort((a, b) => b[0] - a[0]).forEach(([, i]) => { if (left > 0) { fl[i]++; left--; } });
  return { warn: fl[0], knew: fl[1], back: fl[2], net: fl[0] - fl[2] };
}

// The right stamp, judged on the whole survey: print a poster if it warns more people than it backfires on.
const rightStamp = (id, opt) => (counts(id, opt).net > 0 ? 'print' : 'scrap');
function bestCampaign(opt) {
  const pick = ids.filter(id => rightStamp(id, opt) === 'print');
  return { pick, warn: pick.reduce((s, id) => s + counts(id, opt).warn, 0), back: pick.reduce((s, id) => s + counts(id, opt).back, 0) };
}

// ---------- one person at one door ----------

const roundSig = (v, sig) => { if (v <= 0) return 0; const p = Math.pow(10, Math.floor(Math.log10(v)) - sig + 1); return Math.round(v / p) * p; };
const naira = v => '₦' + Math.round(v).toLocaleString('en');
const euro = v => '€' + (v >= 100 ? Math.round(v / 10) * 10 : v >= 10 ? Math.round(v) : Math.round(v * 10) / 10).toLocaleString('en');

// Classify an answer against the poster's band: green = rosier than the fact (the poster warns), white = about right, red = gloomier (backfires).
function colourFor(id, value, opt) {
  const [lo, hi] = band(id, opt), x = CONFIG[id].log ? Math.log(value) : value;
  return x > hi ? 'green' : x < lo ? 'red' : 'white';
}

function answer(id, r) {
  const p = poster(id);
  if (p.kind === 'money' || p.kind === 'share') {
    const h = CONFIG[id], i = pickWeighted(r, h.counts), x = h.edges[i] + r() * (h.edges[i + 1] - h.edges[i]);
    if (p.kind === 'money') {
      const n = roundSig(Math.exp(x), 2), c = colourFor(id, n);
      return { value: n, say: `${naira(n)} a month.`, aside: '≈ ' + euro(n / CONFIG.nairaPerEuro), colour: c, note: p[c] };
    }
    const n = Math.min(100, Math.max(0, Math.round(x))), c = colourFor(id, n);
    return { value: n, say: `About ${n} out of 100.`, aside: '', colour: c, note: p[c] };
  }
  if (p.kind === 'reach') {
    const s = CONFIG.reachEurope, opts = [
      ['veryLikely', 'Me? Very likely. I would make it.', 'green'], ['somewhatLikely', 'Somewhat likely, I think.', 'green'],
      ['somewhatUnlikely', 'Somewhat unlikely.', 'white'], ['veryUnlikely', 'Very unlikely.', 'white'], ['dontKnow', "I don't know.", 'dk']];
    const k = opts[pickWeighted(r, opts.map(o => s[o[0]]))];
    return { value: k[0], say: k[1], aside: '', colour: k[2] === 'dk' ? 'white' : k[2], note: p[k[2]] };
  }
  const s = CONFIG.pirates, opts = [
    ['definitely', 'Pirates? Definitely true.', 'white'], ['probably', 'Probably true.', 'white'], ['probablyNot', 'Probably not. Just stories.', 'green'],
    ['definitelyNot', 'No. Definitely made up.', 'green'], ['dontKnow', "I don't know.", 'dk']];
  const k = opts[pickWeighted(r, opts.map(o => s[o[0]]))];
  return { value: k[0], say: k[1], aside: '', colour: k[2] === 'dk' ? 'white' : k[2], note: p[k[2]] };
}

// ---------- the game ----------

function newGame(seed) {
  const s = (seed === undefined ? Math.floor(Math.random() * 2 ** 31) : seed) >>> 0, r = rng(s);
  const order = PEOPLE.map((p, i) => [r(), i]).sort((a, b) => a[0] - b[0]).map(x => x[1]);
  const notes = {}, stamps = {}; ids.forEach(id => { notes[id] = []; stamps[id] = 'print'; });   // Europe's draft: print all six
  return { seed: s, r, order, knocksLeft: CONFIG.knocks, people: [], notes, stamps, sent: null };
}

function knock(g, id) {
  if (g.sent) throw new Error('posters already sent');
  if (g.knocksLeft <= 0) throw new Error('no knocks left');
  if (!ids.includes(id)) throw new Error('unknown poster ' + id);
  const [name, sex] = PEOPLE[g.order[g.people.length % PEOPLE.length]];
  const age = CONFIG.ageMin + Math.floor(g.r() * (CONFIG.ageMax - CONFIG.ageMin + 1));
  const a = answer(id, g.r), person = { n: g.people.length + 1, name, sex, age, id, ...a };
  g.people.push(person); g.notes[id].push(a.colour); g.knocksLeft--;
  return person;
}

function setStamp(g, id, stamp) {
  if (g.sent) throw new Error('posters already sent');
  if (!ids.includes(id) || !['print', 'scrap'].includes(stamp)) throw new Error('bad stamp');
  g.stamps[id] = stamp;
}

const BEST = bestCampaign();
const plural = (n, one, many) => (n === 1 ? one : many);

function judge(id, stamp) {
  const c = counts(id), right = stamp === rightStamp(id), wash = Math.abs(c.net) < CONFIG.washBand, tag = poster(id).tag;
  let line;
  if (c.back === 0) line = `Warns about ${c.warn} in 100 and backfires on no one.`;
  else if (wash) line = `Close to a wash: warns about ${c.warn} in 100, backfires on about ${c.back}.`;
  else if (c.net < 0) line = `Backfires on about ${c.back} in 100. It warns only ${c.warn}.`;
  else line = `Warns about ${c.warn} in 100 and backfires on about ${c.back}.`;
  if (id === 'reach') line += ' Any one person might be right about themselves; on average, the paper says, people overrate their odds.';
  let call = `${stamp === 'print' ? 'Printed' : 'Scrapped'}: ${right ? 'right' : wash ? 'a narrow miss' : 'wrong'}.`;
  if (!right && c.back === 0) call = 'Scrapped: worth printing, since it backfires on no one.';
  return { id, tag, stamp, right, wash, ...c, line, call };
}

function send(g) {
  if (g.sent) return g.sent;
  const results = ids.map(id => judge(id, g.stamps[id]));
  const printed = results.filter(x => x.stamp === 'print');
  const res = { results, warn: printed.reduce((s, x) => s + x.warn, 0), back: printed.reduce((s, x) => s + x.back, 0),
    printed: printed.length, asked: g.people.length, rights: results.filter(x => x.right).length, best: BEST };
  res.perfect = res.rights === ids.length;
  g.sent = res;
  return res;
}

// The end screen's three lines, in words. "What you did" is built from the stamps.
function verdict(g) {
  const s = g.sent || send(g), R = id => s.results.find(x => x.id === id);
  const eu = ['income', 'italy'].map(R), road = ['asylum', 'reach', 'pirates'].map(R), uk = R('uk');
  const parts = [];
  parts.push(s.asked === 0 ? 'You asked no one and took Europe’s word for it.' : `You asked ${s.asked} ${plural(s.asked, 'person', 'people')}.`);
  const euPrinted = eu.filter(x => x.stamp === 'print');
  if (euPrinted.length === 0) parts.push('You scrapped both Europe posters that would have backfired.');
  else parts.push(`You printed ${euPrinted.map(x => x.tag).join(' and ')}, which would ${euPrinted.length > 1 ? 'each ' : ''}have backfired on most readers.`);
  const roadPrinted = road.filter(x => x.stamp === 'print'), roadScrapped = road.filter(x => x.stamp === 'scrap');
  if (roadScrapped.length === 0) parts.push('You printed all three posters about the journey, which warn.');
  else if (roadPrinted.length === 0) parts.push('You scrapped all three posters about the journey, the ones that warn.');
  else parts.push(`You scrapped ${roadScrapped.map(x => x.tag).join(' and ')}, which ${roadScrapped.length > 1 ? 'warn' : 'warns'} more people than ${roadScrapped.length > 1 ? 'they backfire' : 'it backfires'} on.`);
  if (uk.stamp === 'print') parts.push('BRITAIN was close to a wash.');
  const paper = 'In the survey, Benin City guessed Europe’s riches about right or too low. What they got wrong was the road, the asylum odds and their own chances.';
  const means = 'An honest poster about Europe makes Europe look better. The posters that tell people something new are about the journey. You only find that out by asking.';
  return { you: parts.join(' '), paper, means };
}

// How the player's street compares with the whole city, poster by poster (for the reveal).
function streetVsCity(g) {
  return ids.map(id => { const n = g.notes[id], c = counts(id);
    return { id, tag: poster(id).tag, asked: n.length, green: n.filter(x => x === 'green').length, white: n.filter(x => x === 'white').length,
      red: n.filter(x => x === 'red').length, city: c }; });
}

const vampireShare = () => { const v = CONFIG.vampires; return Math.round(100 * (v.definitely + v.probably) / (v.definitely + v.probably + v.probablyNot + v.definitelyNot)); };

const ALSO = [
  `Only about ${CONFIG.motorbikeCorrect} in 100 knew that most people cross into Niger on the back of motorbikes. About ${CONFIG.boatAnswer} in 100 said by boat, though that border is dry land.`,
  `Only about ${Math.round(CONFIG.agadezCorrect)} in 100 knew that the trucks across the Sahara leave from Agadez.`,
  `About ${vampireShare()} in 100 of those with an opinion said vampires roam the sea to Europe. Real dangers and rumours are hard to tell apart.`,
  `The typical person expected to earn about €${CONFIG.medianWageEuropeEUR} a month in Europe, and said they would need the same €${CONFIG.medianStayWageEUR} at home to stop thinking of leaving. As if the journey cost nothing.`,
];

const M = { CONFIG, POSTERS, PEOPLE, ALSO, ids, poster, rng, pickWeighted, toEUR, fromEUR, histShares, band, outcome, counts, rightStamp,
  bestCampaign, BEST, colourFor, answer, roundSig, naira, euro, newGame, knock, setStamp, judge, send, verdict, streetVsCity, vampireShare };
if (typeof module !== 'undefined') module.exports = M;
