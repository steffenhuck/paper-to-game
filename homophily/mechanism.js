// Home Judges — the mechanism. The single source of truth: build.py inlines this file verbatim into home-judges.html,
// and calibration.js runs against this same file. Plain functions, no DOM. Runs unchanged in Node and in the browser.
//
// Paper: Fuchs-Schündeln & Holub, "Homophily in Grant Evaluations" (WZB / Goethe University Frankfurt).
// Iteration 2. Kind: a toy on real data. The applicant mix is the authors' applicant file (embedded below, verbatim);
// the rosters are curated from their panel-member file; the token rule (3 / 1 / 0) and the random assignment of
// judges within a panel are the game's simplifications. See memo.md §21.

const CONFIG = {
  // --- Scoring input: applicant_country_citizenship.csv, embedded verbatim (country = where the applicant works,
  // citizenship = passport, share = applicant-population weight). calibration.js checks it against the file.
  applicantCSV: `country,citizenship,share
Germany,Germany,0.12877697841726618
Italy,Italy,0.12026378896882493
France,France,0.09864108713029576
Spain,Spain,0.09148681055155876
United Kingdom,United Kingdom,0.07973621103117506
Netherlands,Netherlands,0.057114308553157474
Israel,Israel,0.054996003197442044
Finland,Finland,0.03481215027977618
Belgium,Belgium,0.03413269384492406
Sweden,Sweden,0.03141486810551559
Portugal,Portugal,0.02434052757793765
Poland,Poland,0.021782573940847323
Denmark,Denmark,0.018784972022382093
Austria,Austria,0.01738609112709832
United Kingdom,Italy,0.01606714628297362
Ireland,Ireland,0.01574740207833733
Norway,Norway,0.014908073541167067
Türkiye,Türkiye,0.014628297362110312
United Kingdom,Germany,0.013549160671462829
France,Italy,0.013309352517985611
Greece,Greece,0.012070343725019984
Germany,Italy,0.01123101518784972
Switzerland,Switzerland,0.011071143085531575
Czechia,Czechia,0.01079136690647482
Netherlands,Germany,0.010431654676258994
United Kingdom,United States,0.009672262190247801
Austria,Germany,0.009112709832134292
Hungary,Hungary,0.009112709832134292
Switzerland,Germany,0.0077937649880095924
Spain,Italy,0.006834532374100719`,
  // Country names in the two data files -> the two-letter codes on the badges (UK, not GB, as in the game's text)
  codes: { 'Germany': 'DE', 'Italy': 'IT', 'France': 'FR', 'Spain': 'ES', 'United Kingdom': 'UK', 'Netherlands': 'NL',
    'Israel': 'IL', 'Finland': 'FI', 'Belgium': 'BE', 'Sweden': 'SE', 'Portugal': 'PT', 'Poland': 'PL', 'Denmark': 'DK',
    'Austria': 'AT', 'Ireland': 'IE', 'Norway': 'NO', 'Türkiye': 'TR', 'Greece': 'GR', 'Switzerland': 'CH', 'Czechia': 'CZ',
    'United States': 'US', 'Hungary': 'HU', 'Canada': 'CA', 'Australia': 'AU', 'Slovenia': 'SI' },
  bigFive: ['DE', 'UK', 'FR', 'IT', 'ES'], // the five largest ERC-application countries (paper, Table 2)

  // --- The game's token rule (a game scale, not the paper's 1–5 score scale) -----------------------------------
  tokens: { both: 3, one: 1, none: 0 }, // same passport AND same work country / exactly one of the two / neither
  // For the robustness check only (calibration.js): the paper's own relative sizes, Supp. Table 2 col 1,
  // rescaled so that "both" = 3 (0.164 -> 3; citizenship only 0.075 -> 1.37; country only 0.056 -> 1.02)
  tokensPaper: { both: 3, citz: 3 * 0.075 / 0.164, country: 3 * 0.056 / 0.164 },

  panelSize: 15,             // p. 4: "approximately 15 renowned experts"
  reviewersPerProposal: 4.2, // p. 5: Step 1 proposals are read by 4.2 panel reviewers on average; drawn at random here (our simplification)

  // --- Rosters (our curation, guided by panel_member_country_citizenship.csv) ------------------------------------
  // Round 1 pool: Big Five home judges recur (two each), as in the panel-member file, where the five Big Five home
  // combinations and US/US are the six largest; smaller countries appear once each. 10 of 24 are Big Five home judges,
  // so a player can still seat a panel with only one of them.
  pool: 'DE/DE DE/DE IT/IT IT/IT UK/UK UK/UK FR/FR FR/FR ES/ES ES/ES US/US NL/NL BE/BE SE/SE DE/CH IT/UK ' +
    'PL/PL IL/IL DK/DK FI/FI PT/PT CZ/CZ GR/GR AT/AT',
  // Round 2: a tilted panel (passport/work, the panel-member file's large combinations) and a 10-judge bench of
  // alternatives: seven smaller-country home judges, one German working in Austria, and a British home judge (a trap).
  tilted: 'DE/DE DE/DE IT/IT IT/IT UK/UK FR/FR ES/ES US/US NL/NL BE/BE DE/CH IT/UK SE/SE CA/CA PL/PL',
  bench: 'IL/IL FI/FI PT/PT PL/PL DK/DK GR/GR CZ/CZ NO/NO DE/AT UK/UK',
  swaps: 4,       // round 2 swap budget (kept from iteration 1)
  levelTol: 0.3,  // LEVEL zone: |gap| <= 0.3 tokens. Recalibrated for the token rule (calibration.js §4)
  gapMax: 1.5,    // display: the GAP meter runs from -1.5 to +1.5 tokens
  barMax: 2.5,    // display: a full bar is 2.5 tokens

  names: { DE: 'Germany', UK: 'the UK', FR: 'France', IT: 'Italy', ES: 'Spain', NL: 'the Netherlands', CH: 'Switzerland',
    IL: 'Israel', BE: 'Belgium', SE: 'Sweden', AT: 'Austria', PT: 'Portugal', PL: 'Poland', GR: 'Greece', DK: 'Denmark',
    IE: 'Ireland', HU: 'Hungary', CZ: 'Czechia', FI: 'Finland', NO: 'Norway', US: 'the US', TR: 'Türkiye', CA: 'Canada',
    AU: 'Australia', SI: 'Slovenia' },
  people: { DE: 'German', UK: 'British', FR: 'French', IT: 'Italian', ES: 'Spanish', NL: 'Dutch', CH: 'Swiss', IL: 'Israeli',
    BE: 'Belgian', SE: 'Swedish', AT: 'Austrian', PT: 'Portuguese', PL: 'Polish', GR: 'Greek', DK: 'Danish', IE: 'Irish',
    HU: 'Hungarian', CZ: 'Czech', FI: 'Finnish', NO: 'Norwegian', US: 'American', TR: 'Turkish', CA: 'Canadian',
    AU: 'Australian', SI: 'Slovenian' },
};

// ---------------------------------------------------------------------------------------------------------------
function parseApplicants(csv) {
  return csv.trim().split('\n').slice(1).map(line => {
    const [country, citizenship, share] = line.split(',');
    return { w: CONFIG.codes[country], p: CONFIG.codes[citizenship], s: +share };
  });
}
function parseJudges(s, prefix) {
  return s.trim().split(/\s+/).map((x, i) => { const [p, w] = x.split('/'); return { id: prefix + i, p, w }; });
}
const APPLICANTS = parseApplicants(CONFIG.applicantCSV);

function isBig(country) { return CONFIG.bigFive.indexOf(country) >= 0; }
// "Same" means the same named country, not two Big Five countries
function matchType(app, judge) {
  if (app.p === judge.p && app.w === judge.w) return 'both';
  if (app.w === judge.w) return 'country';
  if (app.p === judge.p) return 'citz';
  return null;
}
function tokensFor(type, rule) {
  rule = rule || CONFIG.tokens;
  if (!type) return rule.none || 0;
  if (type === 'both') return rule.both;
  return rule.one != null ? rule.one : rule[type];
}

// The four applicant groups shown as bars: passport row × workplace column. They classify applicants, never judges.
const CELLS = ['bigP_bigW', 'bigP_othW', 'othP_bigW', 'othP_othW'];
function cellOf(a) { return (isBig(a.p) ? 'bigP' : 'othP') + '_' + (isBig(a.w) ? 'bigW' : 'othW'); }

// Expected home-advantage tokens for one applicant: reviewersPerProposal judges drawn at random from the panel,
// so R × (mean tokens over the panel's judges). A group's value is the share-weighted average over its applicants.
// big / other: by workplace (the success measure); cells: passport × workplace.
function evaluate(panel, opts) {
  opts = opts || {};
  const rule = opts.rule || CONFIG.tokens, apps = opts.applicants || APPLICANTS;
  const R = opts.reviewers || CONFIG.reviewersPerProposal, n = panel.length;
  const acc = {}; const add = (k, a, v) => { acc[k] = acc[k] || { v: 0, w: 0 }; acc[k].v += a.s * v; acc[k].w += a.s; };
  for (const a of apps) {
    let t = 0; for (const j of panel) t += tokensFor(matchType(a, j), rule);
    const v = n ? R * t / n : 0;
    add(cellOf(a), a, v); add(isBig(a.w) ? 'big' : 'other', a, v);
  }
  const g = k => acc[k] ? { tokens: acc[k].v / acc[k].w, weight: acc[k].w } : { tokens: 0, weight: 0 };
  const out = { big: g('big'), other: g('other'), cells: {} };
  CELLS.forEach(k => { out.cells[k] = g(k); });
  out.gap = out.big.tokens - out.other.tokens;
  out.ratio = out.other.tokens > 0 ? out.big.tokens / out.other.tokens : Infinity;
  out.level = Math.abs(out.gap) <= CONFIG.levelTol;
  return out;
}

// --- Game state: all rules that affect outcomes ----------------------------------------------------------------
function newRound1() { return { round: 1, pool: parseJudges(CONFIG.pool, 'p'), seated: [], revealed: false }; }
// Tap a pool judge: seat if free and room, unseat if seated. The 15th seat reveals the bars and locks the panel.
function toggleSeat(st, id) {
  if (st.revealed) return st;
  const seated = st.seated.slice(), i = seated.indexOf(id);
  if (i >= 0) seated.splice(i, 1);
  else if (seated.length < CONFIG.panelSize) seated.push(id);
  return Object.assign({}, st, { seated, revealed: seated.length === CONFIG.panelSize });
}
function panelOf(st) {
  if (st.round === 1) return st.seated.map(id => st.pool.find(j => j.id === id));
  return st.table.slice();
}
function newRound2() {
  return { round: 2, table: parseJudges(CONFIG.tilted, 'e'), bench: parseJudges(CONFIG.bench, 'b'),
    swapsLeft: CONFIG.swaps, swapsUsed: 0, done: false, history: [] };
}
// Swap the panel judge at seatIdx with the bench judge at benchIdx, if swaps remain. LEVEL or no swaps left ends the round.
function swap(st, seatIdx, benchIdx) {
  if (st.done || st.swapsLeft <= 0) return st;
  const table = st.table.slice(), bench = st.bench.slice();
  const out = table[seatIdx], inn = bench[benchIdx];
  if (!out || !inn) return st;
  table[seatIdx] = inn; bench[benchIdx] = out;
  const ns = Object.assign({}, st, { table, bench, swapsLeft: st.swapsLeft - 1, swapsUsed: st.swapsUsed + 1,
    history: st.history.concat([[out.p + '/' + out.w, inn.p + '/' + inn.w]]) });
  if (evaluate(table).level || ns.swapsLeft === 0) ns.done = true;
  return ns;
}
function finishRound2(st) { return Object.assign({}, st, { done: true }); }

// A tiny seeded RNG for the calibration check's simulation (not used by the game)
function rng(seed) { let s = seed >>> 0; return () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
// Simulate applicants drawn by share, each read by 4 or 5 judges drawn at random from the panel (mean 4.2);
// returns mean tokens for works-in-Big-Five and works-elsewhere: a check of evaluate()'s expectation.
function simulate(panel, nProps, seed) {
  const r = rng(seed), tot = APPLICANTS.reduce((a, b) => a + b.s, 0), acc = { big: [0, 0], other: [0, 0] };
  for (let k = 0; k < nProps; k++) {
    let u = r() * tot, a = APPLICANTS[0];
    for (const x of APPLICANTS) { u -= x.s; if (u <= 0) { a = x; break; } }
    const m = r() < (CONFIG.reviewersPerProposal - 4) ? 5 : 4, idx = panel.map((_, i) => i);
    for (let i = 0; i < m; i++) { const j = i + Math.floor(r() * (idx.length - i)); [idx[i], idx[j]] = [idx[j], idx[i]]; }
    let t = 0; for (let i = 0; i < m; i++) t += tokensFor(matchType(a, panel[idx[i]]));
    const G = acc[isBig(a.w) ? 'big' : 'other']; G[0] += t; G[1]++;
  }
  return { big: acc.big[0] / acc.big[1], other: acc.other[0] / acc.other[1] };
}

const MECH = { CONFIG, APPLICANTS, CELLS, cellOf, parseApplicants, parseJudges, isBig, matchType, tokensFor, evaluate,
  newRound1, toggleSeat, panelOf, newRound2, swap, finishRound2, simulate, rng };
if (typeof module !== 'undefined') module.exports = MECH;
