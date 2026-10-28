// The Mixed Street — mechanism. Single source of truth: every number the game shows and every rule
// that decides an outcome lives here. Runs unchanged in Node (fidelity.js) and in the page.
// Source: Habyarimana, Humphreys, Posner & Weinstein (2007), APSR 101(4): 709–725.
// Co-ethnicity is the paper's "benchmark, ethnicity" coding unless a line says otherwise.
// No random draws: every result is a reported estimate.

const CONFIG = {
  // ---- Gameplay -----------------------------------------------------------------------------
  budget: 5,                       // our choice: five of seven tests, so the plan matters
  egoistShare: 0.40,               // p. 715: 124 egoists of 306 classified (40%)

  // ---- Dictator game, 1,000 USh in 100 USh coins, giver hidden (Table 2; text p. 717) ---------
  dgHiddenAvg: 230,                // p. 717: average allocated to each partner, 100 USh game
  dgHiddenEgoist: -99,             // Table 2, col. 1, "Egoist": egoists give ~100 USh less
  dgHiddenGap: -11,                // Table 2, col. 1, "In-group member" (SE 11.20, n.s.)
  dgHiddenGapEgoistX: 1,           // Table 2, col. 1, "Egoist & In-group member" (SE 16.41, n.s.)
  dgHiddenDiscrim: -0.03,          // Table 3, col. 1: 500 USh game, favouring the co-ethnic (n.s.)

  // ---- Dictator game, giver seen (Table 6; text p. 720) ----------------------------------------
  dgSeenAvg: 226,                  // p. 720: average allocated to each partner, 100 USh game
  dgSeenEgoist: -106,              // Table 6, col. 1, "Egoist"
  dgSeenGap: -19,                  // Table 6, col. 1, "In-group member" (SE 11.03, *; paper: "small and statistically weak")
  dgSeenGapEgoistX: 55,            // Table 6, col. 1, "Egoist & In-group member" (SE 16.99, ***)
  dgSeenGapEgoistXSubj: 88,        // Table 6, col. 3: same, subjective coding
  dgSeenDiscrim: 0.12,             // Table 7, col. 1: 500 USh game, favouring the co-ethnic (*); subjective 0.29 (**)

  // ---- Puzzle game (Table 4; text p. 718–719) -----------------------------------------------
  puzzleCo: 0.48,                  // Table 4, ethnicity, co-ethnic pairs (n = 73)
  puzzleNon: 0.38,                 // Table 4, ethnicity, non-co-ethnic pairs (n = 271); diff 0.10 (SE 0.07, n.s.)
  lockboxRate: 0.60,               // p. 719: lockbox game "around 60%", no co-ethnic difference

  // ---- Network game: find a stranger in the parish (Table 5) --------------------------------
  networkCo: 0.43,                 // Table 5, ethnicity, co-ethnic target (n = 51)
  networkNon: 0.28,                // Table 5, ethnicity, other target (n = 97); diff 0.15 (SE 0.08, *; text: "significantly higher")

  // ---- Prisoners' dilemma, no enforcer (Table 9) --------------------------------------------
  pdNonegoist: 0.61, pdEgoist: 0.50,       // Table 9 row 1, cols. 1–2: cooperation rate
  pdGapNonegoist: 0.11, pdGapEgoist: 0.29, // Table 9 row 2: marginal effect of subjective co-ethnicity (n.s.; ***)
  // ---- Prisoners' dilemma with a third-party enforcer (Table 9; text p. 723) ----------------
  pdEnfNonegoist: 0.64, pdEnfEgoist: 0.60,      // Table 9 row 3
  pdEnfGapNonegoist: -0.00, pdEnfGapEgoist: -0.02, // Table 9 row 4 (both n.s.)
  punishHomog: 0.58, punishMixed: 0.35,         // p. 723: nonegoist enforcers punish a defector in an all-co-ethnic vs mixed trio (p = .01)

  // ---- Taste survey (Table 1) ---------------------------------------------------------------
  tasteP: [0.25, 0.70, 0.67, 0.88, 0.35, 0.41], // Table 1, F-test p-values, six questions
  tasteR2Max: 0.01,                             // Table 1, largest adjusted R-squared
};

// The five suspects: the paper's five mechanisms (pp. 710–711), in plain words.
const SUSPECTS = [
  { id: 'tastes', name: 'Different tastes', line: 'Each group wants different things fixed, so they can\'t agree.', paper: 'Preferences: commonality of tastes' },
  { id: 'kind', name: 'Kinder to their own', line: 'People care more about their own group, so they give more when their own benefit.', paper: 'Preferences: other-regarding preferences' },
  { id: 'team', name: 'Better teamwork', line: 'Same language and habits make it easier to work together.', paper: 'Technology: efficacy' },
  { id: 'find', name: 'Easier to find', line: 'People know where their own group lives, so a shirker can be tracked down.', paper: 'Technology: findability' },
  { id: 'watched', name: 'Watched by their own', line: 'With their own group, people stick to a rule — help out, or be punished — because they will be seen.', paper: 'Strategy selection: social sanctioning' },
];

// One bar pair: centred on the reported average, split by the reported gap (paper reports gaps, not levels).
function pair(avg, gap) { return { own: avg + gap / 2, other: avg - gap / 2, gap }; }

// Per-type averages from the overall average and the egoist coefficient: share*(N+ego) + (1-share)*N = avg.
function typeAverages(avg, egoCoef) {
  const nonego = avg - CONFIG.egoistShare * egoCoef;
  return { nonego, ego: nonego + egoCoef };
}

// The seven tests. Each result row is a bar pair; `clear` is the paper's reading of that row
// ('clear' = paper treats it as a real difference, 'weak' = paper calls it weak, 'chance' = not distinguishable from zero).
function buildTests() {
  const C = CONFIG;
  const h = typeAverages(C.dgHiddenAvg, C.dgHiddenEgoist), s = typeAverages(C.dgSeenAvg, C.dgSeenEgoist);
  return [
    { id: 'dgHidden', name: 'Share the coins — giver hidden', short: 'Giver hidden',
      what: 'A giver splits 1,000 shillings between themself and two people whose photos they see — one from their own group, one not. Nobody can see who the giver is.',
      pib: 'hidden', unit: 'shillings given', fmt: 'ush', src: 'Table 2',
      rows: [
        { label: 'Most givers', ...pair(h.nonego, C.dgHiddenGap), clear: 'chance' },
        { label: 'The stingiest 40%', ...pair(h.ego, C.dgHiddenGap + C.dgHiddenGapEgoistX), clear: 'chance' }],
      headline: 1, betYes: false, bet: 'Will givers hand their own group more?',
      say: 'No favouritism. Hidden givers treat both partners the same — the stingy ones too.' },
    { id: 'dgSeen', name: 'Share the coins — giver seen', short: 'Giver seen',
      what: 'The same game, but now the giver\'s photo is shown to both partners. They know who gave what.',
      pib: 'seen', unit: 'shillings given', fmt: 'ush', src: 'Table 6',
      rows: [
        { label: 'Most givers', ...pair(s.nonego, C.dgSeenGap), clear: 'weak' },
        { label: 'The stingiest 40%', ...pair(s.ego, C.dgSeenGap + C.dgSeenGapEgoistX), clear: 'clear' }],
      headline: 1, betYes: true, bet: 'Will givers hand their own group more?',
      say: 'Once they are seen, the stingiest givers favour their own group — by 36 shillings. Most givers don\'t.' },
    { id: 'survey', name: 'Ask what to fix first', short: 'Survey',
      what: 'Everyone is asked six questions: drains, rubbish or security first? Pay fees or volunteer? Do answers differ by group?',
      pib: 'none', unit: 'how surprising each group difference is', fmt: 'dots', src: 'Table 1',
      dots: C.tasteP, headline: null, betYes: false, bet: 'Will the groups want different things?',
      say: 'All six questions: group differences no bigger than chance would make. Groups want the same things.' },
    { id: 'puzzle', name: 'Solve a puzzle in pairs', short: 'Puzzle',
      what: 'Two people each hold two pieces of a four-piece puzzle behind a low wall. They must talk it through to fit it together.',
      pib: 'pair', unit: 'pairs that solved it', fmt: 'pct', src: 'Table 4',
      rows: [{ label: 'Pairs solving it', own: C.puzzleCo, other: C.puzzleNon, gap: C.puzzleCo - C.puzzleNon, clear: 'chance' }],
      headline: 0, betYes: false, bet: 'Will same-group pairs clearly do better?',
      say: 'Same-group pairs did a little better, but a gap this size could be chance. A second test (talking a partner through a lock) showed no difference at all.' },
    { id: 'network', name: 'Find a stranger', short: 'Find someone',
      what: 'A runner gets a photo and a name and has a day to find that person somewhere in the neighbourhood.',
      pib: 'pair', unit: 'runners who found their target', fmt: 'pct', src: 'Table 5',
      rows: [{ label: 'Targets found', own: C.networkCo, other: C.networkNon, gap: C.networkCo - C.networkNon, clear: 'clear' }],
      headline: 0, betYes: true, bet: 'Will runners find their own group more often?',
      say: 'Runners found people from their own group far more often: 43 in 100 against 28 in 100.' },
    { id: 'pd', name: 'Pool money or keep it', short: 'Pool or keep',
      what: 'Two players each choose: keep 1,000 shillings, or put it in a pot that grows by half and is split between them. Each sees the other\'s photo.',
      pib: 'pair', unit: 'players who pooled', fmt: 'pct', src: 'Table 9',
      rows: [
        { label: 'Most players', ...pair(C.pdNonegoist, C.pdGapNonegoist), clear: 'chance' },
        { label: 'The stingiest 40%', ...pair(C.pdEgoist, C.pdGapEgoist), clear: 'clear' }],
      headline: 1, betYes: true, bet: 'Will players pool more often with their own group?',
      say: 'With their own group, the stingy pool far more often: 29 more in 100. Kindness, or fear of being punished? This test alone can\'t say.' },
    { id: 'pdEnf', name: 'Pool or keep — with a referee', short: 'With a referee',
      what: 'The same game, plus a referee who watches and can pay to wipe out a cheat\'s earnings.',
      pib: 'ref', unit: 'players who pooled · referees who punished', fmt: 'pct', src: 'Table 9; p. 723',
      rows: [
        { label: 'Most players', ...pair(C.pdEnfNonegoist, C.pdEnfGapNonegoist), clear: 'chance' },
        { label: 'The stingiest 40%', ...pair(C.pdEnfEgoist, C.pdEnfGapEgoist), clear: 'chance' },
        { label: 'Referees punishing a cheat', own: C.punishHomog, other: C.punishMixed, gap: C.punishHomog - C.punishMixed, clear: 'clear', note: 'own group = all three from one group' }],
      headline: 1, betYes: false, bet: 'With a referee watching, will players still pool more with their own group?',
      say: 'With a referee, everyone pools about equally — the own-group edge vanishes. And referees punish a cheat from their own group far more often.' },
  ];
}
const TESTS = buildTests();
const testById = id => TESTS.find(t => t.id === id);

// What the paper concludes about each suspect, which calls it accepts, and which tests back them.
// A call is proven only if it is accepted AND one of the `backedBy` sets was run in full.
const RULES = {
  tastes: { paper: 'not', accept: ['not'], backedBy: [['survey']], src: 'Table 1',
    verdict: 'Not guilty. Groups ranked drains, rubbish and security the same way.' },
  kind: { paper: 'not', accept: ['not'], backedBy: [['dgHidden']], src: 'Tables 2–3',
    verdict: 'Not guilty. Hidden givers gave their own group no more than anyone else.' },
  team: { paper: 'not', accept: ['not', 'cant'], backedBy: [['puzzle']], src: 'Table 4; p. 719',
    verdict: 'Not shown. Same-group pairs did a little better at the puzzle, but no more than chance could explain. "Can\'t tell" counts too.' },
  find: { paper: 'guilty', accept: ['guilty'], backedBy: [['network']], src: 'Table 5',
    verdict: 'Guilty. People found strangers from their own group far more often — so a shirker from your own group can be tracked down.' },
  watched: { paper: 'guilty', accept: ['guilty'], backedBy: [['dgHidden', 'dgSeen'], ['pd', 'pdEnf']], src: 'Tables 6–9',
    verdict: 'Guilty — the main culprit. The stingy favour their own only when seen; a referee erases the own-group edge; referees punish their own group\'s cheats more.' },
};

const NAMES = { dgHidden: '"Giver hidden"', dgSeen: '"Giver seen"', survey: 'the survey', puzzle: 'the puzzle', network: '"Find a stranger"', pd: '"Pool or keep"', pdEnf: '"With a referee"' };
const setName = set => set.map(id => NAMES[id]).join(' and ');

// Game state.
function newGame() { return { run: [], bets: {}, calls: {} }; }
function canRun(g, id) { return g.run.length < CONFIG.budget && !g.run.includes(id) && !!testById(id); }
// Run a test: spends one of the budget, records the bet, returns the reported result and whether the bet was right.
function runTest(g, id, betYes) {
  if (!canRun(g, id)) return null;
  g.run.push(id);
  const t = testById(id);
  g.bets[id] = betYes;
  return { test: t, betRight: betYes === t.betYes, left: CONFIG.budget - g.run.length };
}
function call(g, suspect, verdict) { if (RULES[suspect] && ['guilty', 'not', 'cant'].includes(verdict)) g.calls[suspect] = verdict; }

// Judge one suspect: right? backed? and the line that explains it.
function judge(g, sid) {
  const r = RULES[sid], c = g.calls[sid] || 'cant';
  const right = r.accept.includes(c);
  const backed = r.backedBy.some(set => set.every(id => g.run.includes(id)));
  const proven = right && backed;
  let why;
  if (proven) why = 'Proven: right, and backed by ' + setName(r.backedBy.find(set => set.every(id => g.run.includes(id)))) + '.';
  else if (right) why = 'Right, but not proven: you needed ' + r.backedBy.map(setName).join(', or ') + '.';
  else if (c === 'cant') why = 'The study could tell. The test that settles it: ' + r.backedBy.map(setName).join(', or ') + '.';
  else why = 'Wrong call. ' + r.backedBy.map(setName).join(', or ') + ' settles it.';
  // The paper's identification point: seeing alone cannot separate kindness from being watched.
  if (sid === 'kind' && c === 'guilty' && g.run.includes('dgSeen') && !g.run.includes('dgHidden'))
    why = 'Wrong call. "Giver seen" alone can\'t tell kindness from being watched. With the giver hidden, the favouritism disappears — so it isn\'t kindness.';
  if (sid === 'watched' && right && !backed && (g.run.includes('dgSeen') || g.run.includes('pd')))
    why = 'Right, but not proven. Favouritism when seen could still be kindness — you needed the hidden version too (' + r.backedBy.map(setName).join(', or ') + ').';
  return { suspect: sid, call: c, paper: r.paper, right, backed, proven, why, verdict: r.verdict };
}
function score(g) {
  const per = SUSPECTS.map(s => judge(g, s.id));
  return { per, proven: per.filter(p => p.proven).length, right: per.filter(p => p.right).length,
    hunches: g.run.filter(id => g.bets[id] === testById(id).betYes).length, of: SUSPECTS.length };
}

const MECH = { CONFIG, SUSPECTS, TESTS, RULES, typeAverages, pair, newGame, canRun, runTest, call, judge, score, testById };
if (typeof module !== 'undefined') module.exports = MECH;
