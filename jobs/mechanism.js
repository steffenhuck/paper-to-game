// One Number, Please — the mechanism. The single source of truth: every rule that affects an outcome, every random
// draw, every word the game uses to describe a result, lives here. Runs unchanged in Node (calibration.js, loop.js)
// and in the browser (inlined verbatim by build.py). The interface only passes the player's choices in and shows what
// comes back.
//
// Paper: Angelovski, Brandts & Güth (2026), "Bidding for better jobs: an experiment on gender differences in
// competitiveness without a real-effort task", Theory and Decision, doi:10.1007/s11238-026-10132-9.
// Kind: RECONSTRUCTED for the price apparatus (the paper's own design, phase 1 rules, calibrated to Fig. 4, Table 1,
// Fig. 5 and Fig. 8); RECONSTRUCTED FROM THE PAPER'S LITERATURE for the sums apparatus (Niederle & Vesterlund 2007 as
// the paper's introduction and section 2 describe it); TOY for the two crossed cells the paper never ran (sums with a
// ladder) and for the one-winner price cell. Each tag below says which.

const CONFIG = {
  // ---- The lab (ours) --------------------------------------------------------------------------------------------
  sessions: 8,                 // our choice: the grant; enough to cross both switches and repeat a doubtful result
  groupsPerSession: 6,         // our choice: 24 students a session, 6 groups of 4
  groupSize: 4,                // Sect. 3: groups of four (phase 1); Niederle & Vesterlund 2007 also used groups of four
  menPerGroup: 2,              // our choice: two men and two women a group (as NV 2007); the paper's groups were random
  sessionCostEuro: 300,        // Sect. 3: average earnings 12.3 euro incl. 5 euro show-up fee, times 24, rounded

  // ---- Prizes, in ECU (Sect. 3, Fig. 1) ---------------------------------------------------------------------------
  prizes: {
    one:   { T: 350, M: null, U: 50, label: 'one winner' },   // our choice: the flat firm's top salary, nothing else
    flat:  { T: 350, M: 200,  U: 50, label: 'a flat ladder' }, // Sect. 3: firm F
    steep: { T: 450, M: 150,  U: 50, label: 'a steep ladder' } // Sect. 3: firm S
  },

  // ---- The price apparatus: the paper's design, phase 1 rules (RECONSTRUCTED) --------------------------------------
  // Mean deviation of bids from the rational benchmark (T-U for the top, M-U for a middle), in ECU, by position and
  // gender. Read off Fig. 4, phase 1 panels (bars are means over all periods of phase 1); the gender differences
  // follow Table 1's Female coefficients (TF +13.99 at the 10% level; the other three positive, not significant).
  bidDev: {
    TF: { men: -40, women: -27 },  // read off Fig. 4 (TF, phase 1); difference per Table 1 (+14, the one 10%-level effect)
    TS: { men: -47, women: -39 },  // read off Fig. 4 (TS, phase 1); Table 1 Female +8.4, n.s.
    MF: { men: -10, women: -6 },   // read off Fig. 4 (MF, phase 1); Table 1 Female +4.2, n.s.
    MS: { men: 3,   women: 7 }     // read off Fig. 4 (MS, phase 1); Table 1 Female +4.2, n.s.
  },
  bunchShare: 0.5,             // Appendix C: top bids bunch around 300 (flat) and 400 (steep), the benchmark, with a long tail
                               // below; the share that bunches is our choice, set so the second-highest bid of four is near
                               // the benchmark often enough for top earnings to land where Fig. 8 and Fig. 10 put them
  bunchSd: 12,                 // our choice: how tightly the bunched bids sit on the benchmark
  bidSdShared: 30,             // our choice: a person-level component shared by their top and middle bids (Sect. 4.3: the
                               // "very competitive individuals who bid high for both" who win the top and leave the middle)
  bidSdTop: 45,                // our choice: idiosyncratic spread of a top bid; total SD about 54, as the clouds in Fig. 9
  bidSdMid: 35,                // our choice: idiosyncratic spread of a middle bid; total SD about 46 (Fig. 9, middle panels)
  bidMax: 500,                 // Sect. 3, footnote 15: the cap on any bid
  onePriceDevKey: 'TF',        // TOY: the one-job price cell shades like the flat firm's top; no gender gap in second-price
  onePriceGenderGap: false,    //      bidding (Chen, Katuščák & Ozdenoren 2013, as cited in Sect. 2), so the women's bump is off

  // ---- The sums apparatus: the tournament as the paper's Sect. 1-2 describe it (RECONSTRUCTED FROM THE LITERATURE) --
  // Niederle & Vesterlund (2007): no gender difference in performance; about 73% of men and 35% of women choose the
  // tournament; 75% of men and 43% of women believe they were the best of four. Risk attitudes differ by gender
  // (Croson & Gneezy 2009; van Veldhuizen 2022 attributes most of the entry gap to beliefs and risk). All as cited by
  // the paper; none of these numbers is the paper's own data.
  abilitySd: 1,                // NV 2007: same performance distribution for men and women (a standard normal here)
  confidence: { men: 1.9, women: 0.75 }, // our choice, tuned so that about 75% / 43% believe they are the best of four
  confidenceSd: 0.8,           // our choice: spread of the private view of one's own standing
  gambleAversion: { men: 0.4, women: 0.9 }, // our choice, tuned with the above to 73% / 35% entry; women the more averse
  gambleAversionSd: 0.3,       // our choice; clipped at zero
  tasteSd: 30,                 // our choice: a taste for the top, in ECU, with NO gender difference (the paper's finding:
                               // the willingness to pay for rank does not differ); it adds to a top bid and to entering
  performanceNoiseSd: 0.6,     // our choice: a contest is decided by ability plus the day's noise
  sureRule: 'evenOdds',        // our choice: the sure alternative pays the contest's expected prize at even odds (NV 2007
                               // set the tournament rate at four times the piece rate for the same reason)
  targets: { entryMen: 0.73, entryWomen: 0.35, bestMen: 0.75, bestWomen: 0.43 }, // NV 2007 as cited; the check's targets

  // ---- Words (ours) -----------------------------------------------------------------------------------------------
  sameBand: 6,                 // our choice: a difference under 6 index points is "about the same" (one session is noisy)
  littleBand: 15,              // our choice: under 15 is "a little more"
  twiceRatio: 1.7,             // our choice: a share ratio above 1.7 is "about twice as often"
  earnSameBand: 12,            // our choice: a gender difference in mean earnings under 12 ECU is "about the same" (one
                               // session's difference has a standard error near 16 ECU; the paper's estimate is -2, n.s.)
  earnLittleBand: 30           // our choice: under 30 is "a little more"
};

// ---- Random numbers ---------------------------------------------------------------------------------------------
function makeRng(seed) {           // mulberry32; the seed is visible in the URL and replayable
  let a = (seed >>> 0) || 1;
  return function () {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function normal(rng, mu, sd) {
  let u = 0, v = 0;
  while (u === 0) u = rng();
  while (v === 0) v = rng();
  return mu + sd * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}
function Phi(x) {                  // standard normal CDF (Abramowitz & Stegun 7.1.26)
  const t = 1 / (1 + 0.3275911 * Math.abs(x));
  const y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x / 2);
  return x >= 0 ? y : 1 - y;
}
const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));

// ---- Students ---------------------------------------------------------------------------------------------------
function drawStudent(rng, gender) {
  const C = CONFIG;
  return {
    gender,
    ability: normal(rng, 0, C.abilitySd),
    confidence: normal(rng, C.confidence[gender], C.confidenceSd),
    gambleAversion: Math.max(0, normal(rng, C.gambleAversion[gender], C.gambleAversionSd)),
    taste: normal(rng, 0, C.tasteSd),
    shared: normal(rng, 0, C.bidSdShared)
  };
}
function drawGroup(rng) {
  const g = [];
  for (let i = 0; i < CONFIG.groupSize; i++) g.push(drawStudent(rng, i < CONFIG.menPerGroup ? 'men' : 'women'));
  return g;
}

// ---- Beliefs (sums apparatus) -----------------------------------------------------------------------------------
// A student's private view of their standing is ability plus confidence; the other three are, to them, standard
// normals. P(best of four) = Phi(b)^3; P(worst) = (1-Phi(b))^3.
function beliefs(s) {
  const p = Phi(s.ability + s.confidence);
  const n = CONFIG.groupSize - 1;
  return { best: Math.pow(p, n), worst: Math.pow(1 - p, n) };
}
function prizeVector(prizes) {     // the four prizes by rank, top first
  const P = CONFIG.prizes[prizes];
  return P.M === null ? [P.T, P.U, P.U, P.U] : [P.T, P.M, P.M, P.U];
}
function sureAlternative(prizes) { // the even-odds expected prize
  const v = prizeVector(prizes);
  return v.reduce((a, b) => a + b, 0) / v.length;
}
// Does this student choose the contest? Expected prize under their beliefs, less their aversion times the prize
// spread they believe they face, plus their taste for the top, against the sure alternative.
function choosesContest(s, prizes) {
  const v = prizeVector(prizes), b = beliefs(s);
  const pMid = Math.max(0, 1 - b.best - b.worst);
  const probs = [b.best, pMid / 2, pMid / 2, b.worst];
  const ev = probs.reduce((a, p, i) => a + p * v[i], 0);
  const varr = probs.reduce((a, p, i) => a + p * (v[i] - ev) * (v[i] - ev), 0);
  const utility = ev - s.gambleAversion * Math.sqrt(varr) + s.taste;
  return utility > sureAlternative(prizes);
}

// ---- The sums apparatus: one group ---------------------------------------------------------------------------------
function runSumsGroup(group, prizes, rng) {
  const v = prizeVector(prizes), sure = sureAlternative(prizes);
  const perf = group.map(s => s.ability + normal(rng, 0, CONFIG.performanceNoiseSd));
  const entered = group.map(s => choosesContest(s, prizes));
  // ranks by performance among all four (NV 2007: an entrant is paid by their rank against the others' performance)
  const order = [0, 1, 2, 3].sort((i, j) => perf[j] - perf[i]);
  const rank = []; order.forEach((i, r) => { rank[i] = r; });
  const out = group.map((s, i) => ({ gender: s.gender, acted: entered[i] ? 1 : 0,
    earned: entered[i] ? v[rank[i]] : sure, top: false }));
  // the top job: the best performer among those who entered
  let best = -1;
  group.forEach((s, i) => { if (entered[i] && (best < 0 || perf[i] > perf[best])) best = i; });
  if (best >= 0) out[best].top = true;
  return out;
}

// ---- The price apparatus: one group, the paper's phase 1 rules -----------------------------------------------------
function bidsFor(s, prizes, rng) {
  const C = CONFIG, P = C.prizes[prizes];
  const oneJob = P.M === null;
  const topKey = oneJob ? C.onePriceDevKey : (prizes === 'flat' ? 'TF' : 'TS');
  const midKey = prizes === 'flat' ? 'MF' : 'MS';
  let devTop = C.bidDev[topKey][s.gender];
  if (oneJob && !C.onePriceGenderGap) devTop = C.bidDev[topKey].men;   // TOY: same shading for everyone
  // a bunched bidder sits on the benchmark; the rest sit lower, by enough that the cell's mean deviation is devTop
  const bunched = rng() < C.bunchShare;
  const dev = bunched ? normal(rng, 0, C.bunchSd) : devTop / (1 - C.bunchShare) + normal(rng, 0, C.bidSdTop);
  let top = (P.T - P.U) + dev + s.shared + s.taste;
  top = clamp(top, 0, C.bidMax);
  if (oneJob) return { top, mid: null };
  let mid = (P.M - P.U) + C.bidDev[midKey][s.gender] + s.shared + normal(rng, 0, C.bidSdMid);
  mid = clamp(mid, 0, top);       // Sect. 3: a bid for a middle job may not exceed the bid for the top
  return { top, mid };
}
function runPriceGroup(group, prizes, rng) {
  const P = CONFIG.prizes[prizes];
  const bids = group.map(s => bidsFor(s, prizes, rng));
  const out = group.map((s, i) => ({ gender: s.gender, acted: bids[i].top / (P.T - P.U), earned: P.U, top: false, bid: bids[i] }));
  // top job to the highest bidder at the second-highest bid
  const byTop = [0, 1, 2, 3].sort((i, j) => bids[j].top - bids[i].top);
  const w = byTop[0];
  out[w].top = true; out[w].earned = P.T - bids[byTop[1]].top;
  if (P.M === null) return out;
  // the two middle jobs to the two highest of the remaining three at the third's bid
  const rest = byTop.slice(1).sort((i, j) => bids[j].mid - bids[i].mid);
  const price = bids[rest[2]].mid;
  out[rest[0]].earned = P.M - price; out[rest[1]].earned = P.M - price;
  return out;
}

// ---- A session ----------------------------------------------------------------------------------------------------
// task: 'sums' | 'price'; prizes: 'one' | 'flat' | 'steep'. Returns the two bars (0-100), who got the top jobs, earnings,
// and the words.
function runSession(task, prizes, seed) {
  const rng = makeRng(seed);
  const people = [];
  for (let g = 0; g < CONFIG.groupsPerSession; g++) {
    const group = drawGroup(rng);
    const res = task === 'sums' ? runSumsGroup(group, prizes, rng) : runPriceGroup(group, prizes, rng);
    res.forEach(r => people.push(r));
  }
  const by = gender => people.filter(p => p.gender === gender);
  const mean = (arr, f) => arr.length ? arr.reduce((a, p) => a + f(p), 0) / arr.length : 0;
  const idx = { men: 100 * mean(by('men'), p => p.acted), women: 100 * mean(by('women'), p => p.acted) };
  const tops = { men: by('men').filter(p => p.top).length, women: by('women').filter(p => p.top).length };
  tops.none = CONFIG.groupsPerSession - tops.men - tops.women;
  const earn = { men: mean(by('men'), p => p.earned), women: mean(by('women'), p => p.earned) };
  const topEarn = mean(people.filter(p => p.top), p => p.earned);
  const midEarn = task === 'price' && CONFIG.prizes[prizes].M !== null
    ? mean(people.filter(p => !p.top && p.earned !== CONFIG.prizes[prizes].U), p => p.earned) : null;
  return { task, prizes, seed, idx, tops, earn, topEarn, midEarn, count: { men: by('men').length, women: by('women').length },
    gap: gapClass(task, idx), words: gapWords(task, idx), topWords: topWords(tops), earnWords: earnWords(earn) };
}

// ---- Words ----------------------------------------------------------------------------------------------------------
// gap classes: 'men2x' | 'men+' | 'same' | 'women+' | 'women2x'
function gapClass(task, idx) {
  const d = idx.men - idx.women, C = CONFIG;
  if (Math.abs(d) < C.sameBand) return 'same';
  if (task === 'sums') {
    const hi = Math.max(idx.men, idx.women), lo = Math.max(1, Math.min(idx.men, idx.women));
    if (hi / lo >= C.twiceRatio && Math.abs(d) >= C.littleBand) return d > 0 ? 'men2x' : 'women2x';
  }
  if (Math.abs(d) < C.littleBand) return d > 0 ? 'men+' : 'women+';
  return d > 0 ? 'men++' : 'women++';
}
function gapWords(task, idx) {
  const g = gapClass(task, idx);
  const verb = task === 'sums' ? 'went for it' : 'bid';
  return {
    same: 'About the same.',
    'men+': task === 'sums' ? 'The men went for it a little more often.' : 'The men bid a little higher.',
    'women+': task === 'sums' ? 'The women went for it a little more often.' : 'The women bid a little higher.',
    'men++': task === 'sums' ? 'The men went for it clearly more often.' : 'The men bid clearly higher.',
    'women++': task === 'sums' ? 'The women went for it clearly more often.' : 'The women bid clearly higher.',
    men2x: 'The men ' + verb + ' about twice as often.',
    women2x: 'The women ' + verb + ' about twice as often.'
  }[g];
}
function topWords(t) {
  const n = CONFIG.groupsPerSession;
  if (t.none === n) return 'Nobody went for the top job in any group.';
  const w = t.women, m = t.men;
  let s = 'Top jobs: ' + w + ' of ' + n + ' went to women' + (t.none ? ', ' + t.none + ' to nobody' : '') + '.';
  if (w > m) s += ' More women than men up there.'; else if (m > w) s += ' More men than women up there.'; else s += ' Half and half.';
  return s;
}
function earnWords(e) {
  const d = e.men - e.women;
  if (Math.abs(d) < CONFIG.earnSameBand) return 'Earnings: about the same.';
  if (Math.abs(d) < CONFIG.earnLittleBand) return d > 0 ? 'Earnings: the men took home a little more.' : 'Earnings: the women took home a little more.';
  return d > 0 ? 'Earnings: the men took home clearly more.' : 'Earnings: the women took home clearly more.';
}
function indexLabel(task, prizes) {
  if (task === 'sums') return 'chose the contest';
  return 'bid for the top job, out of every 100 it is worth';
}
// what the apparatus measured: the game's own line after each result (explanation after discovery)
function measuredLine(task, prizes) {
  const P = CONFIG.prizes[prizes];
  if (task === 'sums') {
    const sure = sureAlternative(prizes);
    if (P.M === null) return 'To go for it, a student had to believe they would beat three others at sums, and take a one-in-four shot at ' + P.T + ' against a sure ' + sure + '. The bar measures confidence and nerve as much as wanting the top.';
    return 'To go for it, a student had to believe they would not come last at sums, and take a spread of ' + P.T + ' down to ' + P.U + ' against a sure ' + sure + '. Three of four rungs pay; less nerve is needed than for one winner, but a view of one\'s own rank still is.';
  }
  if (P.M === null) return 'Nothing to perform, nothing to guess about anyone\'s rank: just how much of the job\'s worth a student would give up to have it. The bar measures wanting the top, and only that.';
  return 'Nothing to perform, nothing to guess about anyone\'s rank: just how much of each rung\'s worth a student would give up to have it, with the salaries on the board. The bar measures wanting the top, and only that.';
}
// the paper's own result, shown as a ghost under the player's reading when the apparatus is the paper's
function ghostLine(task, prizes) {
  if (task !== 'price' || CONFIG.prizes[prizes].M === null) return null;
  if (prizes === 'flat') return 'Rome, 168 students, flat firm: about the same; the women a few points higher for the top. Women got the top job more often than their share. The middle paid better than the top.';
  return 'Rome, 168 students, steep firm: about the same. Women got the top job about as often as their share, a little more once both firms competed. The middle paid better than the top.';
}

// ---- The reply, judged against the notebook -----------------------------------------------------------------------
// reply: 'less' | 'same' | 'depends'. notebook: array of runSession results. Returns lines in words.
function menMore(r) { return r.gap === 'men2x' || r.gap === 'men++' || r.gap === 'men+'; }
function verdict(notebook, reply) {
  const sums = notebook.filter(r => r.task === 'sums'), price = notebook.filter(r => r.task === 'price');
  const share = arr => arr.length ? arr.filter(menMore).length / arr.length : null;
  const left = share(sums), right = share(price);
  const leftGap = left !== null && left > 0.5, rightGap = right !== null && right > 0.5;
  const cell = (t, p) => notebook.filter(r => r.task === t && r.prizes === p);
  const did = [];
  const mainWords = { same: 'about the same', 'men+': 'the men a little more', 'men++': 'the men clearly more', men2x: 'the men about twice as often',
    'women+': 'the women a little more', 'women++': 'the women clearly more', women2x: 'the women about twice as often' };
  ['sums', 'price'].forEach(t => ['one', 'flat', 'steep'].forEach(p => {
    const rs = cell(t, p); if (!rs.length) return;
    const counts = {}; rs.forEach(r => { counts[r.gap] = (counts[r.gap] || 0) + 1; });
    const main = Object.keys(counts).sort((a, b) => counts[b] - counts[a])[0];
    did.push({ task: t, prizes: p, n: rs.length, main, mixed: Object.keys(counts).length > 1,
      text: (t === 'sums' ? 'Sums' : 'Price') + ', ' + CONFIG.prizes[p].label + ': ' + mainWords[main] +
        (rs.length > 1 ? ', ' + rs.length + ' sessions' : ', once') + (Object.keys(counts).length > 1 ? ' (not every time)' : '') + '.' });
  }));
  let backed, why;
  const onlyOne = (sums.length === 0) !== (price.length === 0);
  if (reply === 'less') {
    backed = leftGap && (price.length === 0 || rightGap);
    why = backed
      ? (price.length === 0 ? 'From your notebook, that is the honest reply: in every session, competing meant sums, and the men went for it more. You never changed what competing meant.' : 'Your notebook backs it as far as it goes: the men went for it more under both kinds of apparatus. The lab in Rome did not see that on the price side.')
      : (sums.length === 0 ? 'Your notebook does not back it: in every session, competing meant naming a price, and the women bid as high as the men. You never ran the sums.' : 'Your notebook disagrees with you: wherever competing meant naming a price, the women bid as high as the men. The gap was only in the sums column.');
  } else if (reply === 'same') {
    backed = !leftGap && !rightGap;
    why = backed
      ? (sums.length === 0 ? 'From your notebook, that is the honest reply: in every session, competing meant naming a price, and the women bid as high as the men. You never made them race at sums.' : 'Your notebook backs it: no apparatus you ran showed the men going for it more. The textbook lab would have.')
      : (price.length === 0 ? 'Your notebook disagrees with you: in every session, competing meant sums, and the men went for it more. You never changed what competing meant.' : 'Your notebook disagrees with you on the left: wherever competing meant sums, the men went for it more. It was the price column that showed no gap.');
  } else {
    backed = leftGap && price.length > 0 && !rightGap;
    why = backed
      ? 'Your notebook backs it: a gap wherever competing meant sums, none wherever it meant naming a price. The number moved and you never touched the students.'
      : (onlyOne ? 'You guessed right, but your notebook cannot show it: you ran only one kind of apparatus. The sentence needs both columns.' : 'Your notebook does not quite show it: the two kinds of apparatus did not come out differently in your sessions. Run each again before sending that.');
  }
  return { did, backed, why, left, right, sums: sums.length, price: price.length };
}

const MECH = { CONFIG, makeRng, normal, Phi, drawStudent, drawGroup, beliefs, prizeVector, sureAlternative, choosesContest,
  runSumsGroup, runPriceGroup, bidsFor, runSession, gapClass, gapWords, topWords, earnWords, indexLabel, measuredLine,
  ghostLine, verdict };
if (typeof module !== 'undefined') module.exports = MECH;
