// Say It Plainly — mechanism (the single source of truth).
// Everything that decides an outcome lives here: the paper's benchmark values, the reading-ease formula,
// the press release and its rewrites, the edit budget, the scoring of both bets and of the draft.
// Runs unchanged in Node (require) and in the browser (window.MECH). No DOM, no randomness.
(function (root) {
'use strict';

const CONFIG = {
  // --- The paper's numbers (Rauh 2023, Fig. 2; values read off the figure at 400 dpi, about ±1 point / ±0.00003 / ±0.01) ---
  sources: [
    // reading: average Flesch reading ease; familiar: average Google Books frequency relative to 'the'; verbs: verbs/(verbs+nouns)
    { id: 'polsci',  name: 'Political science abstracts', short: 'Academics',      reading: 14.3, familiar: 0.00256, verbs: 0.415 }, // Fig. 2 upper panel, green
    { id: 'comm',    name: 'European Commission press releases', short: 'Commission', reading: 26.7, familiar: 0.00249, verbs: 0.475 }, // Fig. 2 upper panel, blue
    { id: 'ire',     name: 'Irish government press releases', short: 'Irish gov.',  reading: 33.2, familiar: 0.00285, verbs: 0.557 }, // Fig. 2 upper panel, yellow
    { id: 'uk',      name: 'UK government press releases', short: 'UK gov.',        reading: 40.0, familiar: 0.00289, verbs: 0.596 }, // Fig. 2 upper panel, yellow
    { id: 'broad',   name: 'Broadsheet newspapers (politics)', short: 'Broadsheets', reading: 48.1, familiar: 0.00277, verbs: 0.680 }, // Fig. 2 upper panel, green
    { id: 'tabloid', name: 'Tabloid newspapers (politics)', short: 'Tabloids',     reading: 64.5, familiar: 0.00283, verbs: 0.865 }, // Fig. 2 upper panel, green
  ],
  // Annual mean reading ease of Commission releases, read off Fig. 2 lower-left panel (±1 point).
  trend: [[1985, 27.6], [1987, 28.6], [1989, 28.4], [1990, 27.2], [1992, 26.8], [1994, 26.4], [1996, 26.0], [1998, 25.8],
          [2000, 26.6], [2002, 27.0], [2004, 27.0], [2006, 26.8], [2008, 26.6], [2010, 27.0], [2012, 27.6], [2014, 28.0],
          [2016, 27.2], [2018, 26.8], [2020, 25.6]],
  // Moments of politicisation named in the paper (pp. 687-690), placed on the trend for the player.
  events: [[1992, 'Maastricht No'], [1999, 'Santer quits'], [2005, 'Constitution No'], [2010, 'Euro crisis'], [2016, 'Brexit']],
  // "Hardly changed": the paper's reading of the trend (p. 693). Our threshold for "about the same": first-to-last change under this many points.
  sameBand: 5,                       // our choice: the series moves within ±2 points; anything under 5 reads as flat

  // --- Flesch (1948) reading ease, as used in the paper (p. 691, note 3) ---
  flesch: { a: 206.835, b: 1.015, c: 84.6 },  // FRE = a - b*(words/sentence) - c*(syllables/word)

  // --- Gameplay (ours) ---
  ruler: { min: 0, max: 70 },        // our choice: the reading-ease axis shown to the player; Fig. 2 spans ~10-70
  betClose: 4,                       // our choice: a placement within 4 points of the Commission's 26.7 counts as spot on
  betNear: 9,                        // our choice: within 9 points counts as close
  budget: 2,                         // our choice: edits allowed before the midday briefing; with 2, reaching the UK line takes picking the right ones (fidelity.js: 1 in 4 plans)
  target: 'uk',                      // our choice: the aim is the UK government's average (40.0), the paper's clearest national benchmark
};

// The press release. Written by us in the Commission's typical register; NOT a real release.
// Each paragraph has the original and two rewrites, each tagged by the kind of change it makes.
// Every version says the same thing: who proposes what, for how long, why, and what happens next.
const RELEASE = {
  headline: 'Commission proposes new rules on the repair of goods',
  paras: [
    { id: 'p1', orig: 'The European Commission has today adopted a proposal for a Directive on the promotion of the repair of goods, with a view to the reduction of waste and the reinforcement of consumer rights within the internal market.',
      alts: [
        { kind: 'split', text: 'The European Commission has today adopted a proposal for a Directive on the repair of goods. Its objective is the reduction of waste. A further objective is the reinforcement of consumer rights within the internal market.' },
        { kind: 'verbs', text: 'Today the European Commission proposed new rules so that people can repair the things they buy, throw less away, and have stronger rights wherever they shop in the EU.' },
      ] },
    { id: 'p2', orig: 'Under the proposed measures, producers would be subject to an obligation to ensure the availability of spare parts and repair information for a period of up to ten years following the placing on the market of the last unit of a product model.',
      alts: [
        { kind: 'split', text: 'Producers would have an obligation to ensure the availability of spare parts and repair information. This obligation would apply for a period of up to ten years. It would start with the placing on the market of the last unit of a model.' },
        { kind: 'words', text: 'Firms that make goods would have to keep spare parts and repair guides on offer for up to ten years after they sell the last one of a model.' },
      ] },
    { id: 'p3', orig: 'The facilitation of repair as an alternative to replacement is an essential element of the European Green Deal and the transition to a circular economy.',
      alts: [
        { kind: 'words', text: 'Making repair an easy choice instead of buying new is a key part of the European Green Deal and of the move to an economy that wastes less.' },
        { kind: 'verbs', text: 'When people fix things instead of buying new ones, they help Europe reach its climate goals and waste less.' },
      ] },
    { id: 'p4', orig: 'The Commissioner responsible stated: "This proposal is a significant contribution to the empowerment of consumers and to sustainable consumption."',
      alts: [
        { kind: 'split', text: 'The Commissioner responsible stated: "This proposal is a significant contribution to the empowerment of consumers. It also contributes to sustainable consumption."' },
        { kind: 'verbs', text: 'The Commissioner in charge said: "With this law, people can fix what they own. That saves them money, and it saves the planet."' },
      ] },
    { id: 'p5', orig: 'The proposal will now be subject to negotiation and adoption by the European Parliament and the Council under the ordinary legislative procedure. Implementation by the Member States is foreseen within twenty-four months following entry into force.',
      alts: [
        { kind: 'words', text: 'The European Parliament and the Council will now negotiate the proposal and must both agree to it. Member States will then have two years to apply the new rules.' },
        { kind: 'verbs', text: 'Next, the European Parliament and the national governments will debate the proposal and decide whether it becomes law. Each EU country then has two years to put it into practice.' },
      ] },
  ],
};
const KINDS = {
  split: 'Shorter sentences',      // the sentence-length half of the Flesch formula
  words: 'Everyday words',         // the word-length half (and the paper's 'familiar words')
  verbs: 'Say who does what',      // the paper's verbal style: verbs instead of nominalisations
};

// ---------------- reading ease ----------------
// Syllables: a standard vowel-group heuristic, with hand-checked exceptions for words in this game
// (fidelity.js checks every word the release can contain against a hand count).
const SYL_EXCEPT = { the: 1, european: 4, every: 3, being: 2, area: 3, idea: 3, people: 2, parliament: 3, business: 2,
  creature: 2, platypus: 3, reptilian: 4, seemingly: 3, goods: 1, guides: 1, makes: 1, saves: 1, uses: 2,
  'twenty-four': 3, ensure: 2, agree: 2, eu: 2, commissioner: 4, directive: 3, availability: 6, facilitation: 5,
  acceleration: 5, consumption: 3, patterns: 2, sustainable: 4, obligation: 4, negotiation: 5, legislative: 4, negotiate: 4, australian: 4, hybrid: 2, mammal: 2, framework: 2, rules: 1,
  responsible: 4, procedure: 3, unit: 2, model: 2, ordinary: 4, reinforcement: 4, period: 3, therefore: 2,
  science: 2, sat: 1, foreseen: 2, alternative: 4, ones: 1, once: 1, done: 1, gone: 1, some: 1, came: 1,
  whether: 2, practice: 2, empowerment: 4, achievement: 3, replacement: 3, implementation: 5, measures: 2,
  promotion: 3, reduction: 3, information: 4, producers: 3, proposed: 2, adopted: 3, stated: 2, placing: 2, wastes: 1,
  debate: 2, decide: 2, becomes: 2, cheaper: 2, cycle: 2, able: 2 };
function syllables(word) {
  let w = word.toLowerCase().replace(/[^a-z-]/g, '');
  if (!w) return 0;
  if (SYL_EXCEPT[w] != null) return SYL_EXCEPT[w];
  if (w.includes('-')) return w.split('-').reduce((s, p) => s + syllables(p), 0);
  if (w.length <= 3) return 1;
  w = w.replace(/(?:[^laeiouy]es|[^laeiouytd]ed|[^laeiouy]e)$/, m => m[0]).replace(/^y/, '');
  const groups = w.match(/[aeiouy]{1,2}/g);
  return Math.max(1, groups ? groups.length : 1);
}
function words(text) { return text.split(/\s+/).map(t => t.replace(/^[^A-Za-z0-9]+|[^A-Za-z0-9]+$/g, '')).filter(t => /[A-Za-z0-9]/.test(t)); }
function sentences(text) { return Math.max(1, (text.match(/[.!?]+(?=["'”’)]*(\s|$))/g) || []).length); }
function textStats(text) {
  const w = words(text), s = sentences(text), syl = w.reduce((a, x) => a + syllables(x), 0);
  return { words: w.length, sentences: s, syllables: syl };
}
function readingEase(st) {
  const f = CONFIG.flesch;
  return f.a - f.b * (st.words / st.sentences) - f.c * (st.syllables / st.words);
}

// ---------------- the opening bets ----------------
const src = id => CONFIG.sources.find(s => s.id === id);
function placeBet(guess) {
  const truth = src('comm').reading, err = Math.abs(guess - truth);
  const grade = err <= CONFIG.betClose ? 'spot' : err <= CONFIG.betNear ? 'close' : 'off';
  return { guess, truth, err, grade, dir: guess > truth ? 'too clear' : 'too hard' };
}
function trendTruth() {
  const t = CONFIG.trend, d = t[t.length - 1][1] - t[0][1];
  return Math.abs(d) < CONFIG.sameBand ? 'same' : d > 0 ? 'easier' : 'harder';
}
function trendBet(choice) { return { choice, truth: trendTruth(), right: choice === trendTruth(), first: CONFIG.trend[0], last: CONFIG.trend[CONFIG.trend.length - 1] }; }

// ---------------- the draft ----------------
function newDraft() { return { pick: RELEASE.paras.map(() => -1), used: 0, log: [] }; }  // -1 = original wording
function paraText(i, pick) { return pick < 0 ? RELEASE.paras[i].orig : RELEASE.paras[i].alts[pick].text; }
function draftText(d) { return RELEASE.paras.map((p, i) => paraText(i, d.pick[i])).join(' '); }
function draftScore(d) { const st = textStats(draftText(d)); return Object.assign(st, { ease: readingEase(st) }); }
function left(d) { return CONFIG.budget - d.used; }
function canEdit(d, i, k) { return left(d) > 0 && d.pick[i] !== k; }
function edit(d, i, k) {
  if (!canEdit(d, i, k)) return null;
  const before = draftScore(d).ease;
  d.pick[i] = k; d.used++;
  const after = draftScore(d).ease;
  const r = { para: i, kind: k < 0 ? 'orig' : RELEASE.paras[i].alts[k].kind, before, after, delta: after - before, left: left(d) };
  d.log.push(r); return r;
}
// where a reading-ease value sits among the paper's benchmarks
function standing(ease) {
  const passed = CONFIG.sources.filter(s => s.id !== 'comm' && ease >= s.reading).sort((a, b) => b.reading - a.reading);
  return passed.length ? passed[0] : null;
}
function verdict(d) {
  const ease = draftScore(d).ease, t = src(CONFIG.target);
  return { ease, start: draftScore(newDraft()).ease, hit: ease >= t.reading, gap: t.reading - ease,
           beat: standing(ease), kinds: d.log.map(r => r.kind) };
}
// every plan of `budget` edits (one per paragraph): used by the fidelity check and by the end screen's "best possible"
function allPlans(budget) {
  const n = RELEASE.paras.length, out = [];
  (function rec(i, pick, used) {
    if (i === n) { if (used === budget) out.push(pick.slice()); return; }
    for (let k = -1; k < RELEASE.paras[i].alts.length; k++) {
      const u = used + (k >= 0 ? 1 : 0); if (u > budget) continue;
      pick[i] = k; rec(i + 1, pick, u);
    }
  })(0, [], 0);
  return out.map(pick => ({ pick, ease: draftScore({ pick }).ease }));
}

// mean gain in reading ease from a single rewrite of each kind, starting from the original release (shown on the end screen)
function oneEditGains() {
  const s0 = draftScore(newDraft()).ease, acc = {};
  RELEASE.paras.forEach((p, i) => p.alts.forEach((a, k) => { const d = newDraft(); d.pick[i] = k; (acc[a.kind] = acc[a.kind] || []).push(draftScore(d).ease - s0); }));
  const out = {}; for (const k in acc) out[k] = acc[k].reduce((x, y) => x + y, 0) / acc[k].length; return out;
}

const MECH = { CONFIG, RELEASE, KINDS, syllables, words, sentences, textStats, readingEase, src, placeBet, trendBet, trendTruth,
  newDraft, paraText, draftText, draftScore, left, canEdit, edit, standing, verdict, allPlans, oneEditGains };
if (typeof module !== 'undefined' && module.exports) module.exports = MECH; else root.MECH = MECH;
})(typeof window !== 'undefined' ? window : globalThis);
