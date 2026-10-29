// The Original or the Copy — mechanism. Single source of truth: every number the game shows and every rule
// that decides an outcome lives here. Runs unchanged in Node (fidelity.js) and in the page.
// Source: Hutter & Kriesi (2022), "Politicising immigration in times of crisis",
// Journal of Ethnic and Migration Studies 48(2): 341–365. doi:10.1080/1369183X.2020.1853902
// Only the PDF was available; no data or code. No random draws anywhere.

const CONFIG = {
  // ---- Act 1: where did the 2015 crisis turn the election into a fight over immigration? ----------
  // Politicisation = salience x polarisation of immigration in newspaper coverage of the campaign (p. 348).
  fightLine: 3.4,                  // read off Fig. 2: upper dashed line, mean + 1 s.d. over all 17 issues; above it an issue is "usually among the top-3" (p. 348)
  quietLine: 1.3,                  // read off Fig. 2: lower dashed line, mean over all 17 issues
  scaleMax: 10,                    // Fig. 3 y-axis
  // hit: how hard the crisis hit, in the paper's own words (p. 350). value: crisis-election politicisation, read off Fig. 3.
  countries: [
    { id: 'AT', name: 'Austria',     year: 2017, hit: 'hard', hitLine: 'A main transit and destination country.',        value: 8.4, why: 'An established radical right (the FPÖ) had made it its issue for decades.' },
    { id: 'GR', name: 'Greece',      year: 2015, hit: 'hard', hitLine: 'Hardest-hit port of entry: arrivals by sea.',     value: 0.6, why: 'The bailout crowded out every other issue, immigration included.' },
    { id: 'PL', name: 'Poland',      year: 2015, hit: 'low',  hitLine: 'A bystander: few refugees arrived.',               value: 5.8, why: 'PiS fought the EU plan to relocate refugees, and made it a campaign.' },
    { id: 'DE', name: 'Germany',     year: 2017, hit: 'hard', hitLine: 'The main destination country.',                    value: 5.9, why: 'The crisis drove the rise of the AfD, which pushed the issue.' },
    { id: 'CH', name: 'Switzerland', year: 2015, hit: 'low',  hitLine: 'Hit less than its neighbours.',                    value: 9.9, why: 'The SVP, long established, made it the top issue of the campaign.' },
    { id: 'IE', name: 'Ireland',     year: 2016, hit: 'low',  hitLine: 'Outside Schengen; barely touched.',                value: 0.5, why: 'No party carried it into the campaign.' },
    { id: 'HU', name: 'Hungary',     year: 2018, hit: 'hard', hitLine: 'On the main transit route.', value: 6.0, why: 'Fidesz in government ran its campaign against migration.' },
    { id: 'NL', name: 'Netherlands', year: 2017, hit: 'low',  hitLine: 'Hit less than its neighbours.',                    value: 5.7, why: 'An established radical right (Wilders\' PVV) kept it centre stage.' },
  ],

  // ---- Act 2: the centre-right's campaign and the radical right's vote (Table 3, Model 3) ----------
  // Dependent variable: change in the radical right's vote share, in percentage points, election to election.
  bSal: 31.92,                     // Table 3, Model 3: change in centre-right salience (t = 4.65)
  bPos: -0.757,                    // Table 3, Model 3: change in centre-right position (t = -0.36)
  bInt: -33.05,                    // Table 3, Model 3: salience change x position change (t = -2.18)
  m2Sal: 33.48, m2Pos: -1.097,     // Table 3, Model 2 (no interaction), for the robustness check only
  nElections: 37,                  // Table 3, N for Models 2 and 3
  // Salience = share of the party's campaign statements about immigration (p. 364). Position runs from
  // -1 (fully against immigration) to +1 (fully for it) (Appendix A, Table A3).
  talk: [0, 0.10, 0.20],           // salience change: same / +10 / +20 points of the campaign; Fig. 5 x-axis ends at +0.2; no 'talk less' option: see memo, Divergences
  lean: [-1, 0, 1],                // position change: tougher / hold / more open; the two lines plotted in Fig. 5 are -1 and +1
  rrStart: 12,                     // our choice: an illustrative radical-right vote share before the campaign
  holdLimit: 1,                    // our choice: the aim is "no more than 1 point". Any limit from 0.77 to 3.18 gives the same wins and losses (fidelity.js)
  campaigns: [                     // our choice: three scenarios; the 2nd and 3rd each fix one dial so the player must use the other
    { id: 'free',  title: 'Campaign 1',  rule: 'Free choice.',                                                        fixLean: null, minTalk: 0 },
    { id: 'tough', title: 'Campaign 2',  rule: 'Your party\'s base demands a tougher line. You must lean tougher.',     fixLean: -1,   minTalk: 0 },
    { id: 'loud',  title: 'Campaign 3',  rule: 'The crisis is all over the news. You must talk about it more.',         fixLean: null, minTalk: 1 },
  ],
};

// ---- Act 1 ------------------------------------------------------------------------------------
function isFight(c) { return c.value > CONFIG.fightLine; }
// calls: { AT: true/false, ... } where true = "it became a fight"
function scoreAct1(calls) {
  const rows = CONFIG.countries.map(c => ({ id: c.id, name: c.name, call: calls[c.id], fight: isFight(c), right: calls[c.id] === isFight(c) }));
  return { rows, right: rows.filter(r => r.right).length, of: rows.length };
}
// What a player who believes "hit hard means a fight" would score.
function naiveCalls() { const o = {}; CONFIG.countries.forEach(c => { o[c.id] = c.hit === 'hard'; }); return o; }

// ---- Act 2 ------------------------------------------------------------------------------------
// Change in the radical right's vote, relative to a centre-right campaign that changes nothing (Table 3, Model 3).
function rrEffect(talkIdx, leanIdx) {
  const s = CONFIG.talk[talkIdx], p = CONFIG.lean[leanIdx];
  return CONFIG.bSal * s + CONFIG.bPos * p + CONFIG.bInt * s * p;
}
function rrEffectModel2(talkIdx, leanIdx) {
  return CONFIG.m2Sal * CONFIG.talk[talkIdx] + CONFIG.m2Pos * CONFIG.lean[leanIdx];
}
function allowed(campIdx, talkIdx, leanIdx) {
  const c = CONFIG.campaigns[campIdx];
  if (c.fixLean !== null && CONFIG.lean[leanIdx] !== c.fixLean) return false;
  return talkIdx >= c.minTalk;
}
function holds(delta) { return delta <= CONFIG.holdLimit; }
function runCampaign(campIdx, talkIdx, leanIdx) {
  if (!allowed(campIdx, talkIdx, leanIdx)) throw new Error('choice not allowed in this campaign');
  const delta = rrEffect(talkIdx, leanIdx);
  // every allowed option, so the page can show what else was possible
  const options = [];
  CONFIG.talk.forEach((_, t) => CONFIG.lean.forEach((_, l) => { if (allowed(campIdx, t, l)) options.push({ t, l, delta: rrEffect(t, l), held: holds(rrEffect(t, l)) }); }));
  return { campIdx, talkIdx, leanIdx, delta, held: holds(delta), before: CONFIG.rrStart, after: CONFIG.rrStart + delta,
           copied: CONFIG.talk[talkIdx] > 0 && CONFIG.lean[leanIdx] < 0, options };
}
// The full map for the end screen (explanation after discovery).
function effectGrid() { return CONFIG.talk.map((_, t) => CONFIG.lean.map((_, l) => rrEffect(t, l))); }

// ---- Verdict ------------------------------------------------------------------------------------
function verdict(act1, campaigns) {
  const held = campaigns.filter(c => c.held).length;
  const copied = campaigns.filter(c => c.copied);
  return { act1Right: act1.right, act1Of: act1.of, held, of: campaigns.length, copiedCount: copied.length,
           worst: campaigns.reduce((m, c) => Math.max(m, c.delta), -Infinity) };
}

const MECH = { CONFIG, isFight, scoreAct1, naiveCalls, rrEffect, rrEffectModel2, allowed, holds, runCampaign, effectGrid, verdict };
if (typeof module !== 'undefined') module.exports = MECH;
