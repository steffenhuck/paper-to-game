// Calibration check (build.md §2): runs mechanism.js in Node against the paper's reported numbers and sentences.
// Run: node calibration.js > calibration-result.txt
const M = require('./mechanism.js');
const C = M.CONFIG;
let fails = 0;
const ok = (cond, msg) => { console.log((cond ? 'PASS  ' : 'FAIL  ') + msg); if (!cond) fails++; };
const near = (got, want, tol, msg) => ok(Math.abs(got - want) <= tol, `${msg}: got ${got.toFixed(3)}, paper ${want} (tol ${tol})`);

// Play a whole campaign with a strategy: strat(day, questions) -> [index, kind]
function play(strat, g = M.newGame()) {
  while (!M.campaignOver(g)) { const qs = M.today(g); const [i, k] = strat(g.day, qs); M.answer(g, i, k); }
  return M.electionNight(g);
}
const firstImm = qs => qs.findIndex(q => q.imm), firstOther = qs => qs.findIndex(q => !q.imm);
const always = kind => (d, qs) => [firstImm(qs), kind];                                    // take every immigration question
const dodge = kind => (d, qs) => (firstOther(qs) >= 0 ? [firstOther(qs), null] : [firstImm(qs), kind]); // only when forced
const crisisGame = () => { const g = M.newGame(); play(dodge('oppose'), g); M.nextCampaign(g); return g; };

console.log('== Table 3 Model 3 against Fig. 5 (read off the figure at 110 dpi; the figure sits ~1.2 pt above the bare coefficients, so slopes and gaps are compared, not levels) ==');
const slope = (dp) => (M.gain(0.2, dp) - M.gain(-0.2, dp)) / 0.4;
near(slope(-1), (15 - -11) / 0.4, 8, 'Fig. 5, position change -1: slope, points per unit salience (line from ~-11 to ~+15)');
near(slope(1), (0.3 - 0.7) / 0.4, 3, 'Fig. 5, position change +1: slope (flat line, ~+0.7 to ~+0.3)');
near(M.gain(0.2, -1) - M.gain(0.2, 1), 15 - 0.3, 2, 'Fig. 5: gap between the lines at salience +0.2');
near(M.gain(-0.2, 1) - M.gain(-0.2, -1), 0.7 - -11, 2, 'Fig. 5: gap between the lines at salience -0.2');
near(-(M.gain(0, 1) - M.gain(0, -1)), 2 * 0.757, 0.01, 'Table 3 M3: gap at zero salience change = 2 x 0.757');
ok(C.salStep * C.days <= 0.2 + 0.011, `game salience range 0..${(C.salStep * C.days).toFixed(3)} sits inside Fig. 5's axis (-0.2..0.2, +0.01 allowed)`);

console.log('== The paper\'s sentences (p. 355) ==');
ok(Math.abs(M.gain(0, -1)) < 1 && Math.abs(M.gain(0, 1)) < 1,
  '"if the main competitor ... does not pay increasing attention ... its publicly visible position shifts, whether accommodating or adversarial, tend to have no effect": |effect| < 1 pt at zero salience change');
const grid = []; for (const ds of [0, 0.07, 0.14, 0.21]) for (const dp of [-1, 0, 1]) grid.push({ ds, dp, g: M.gain(ds, dp) });
const top = grid.reduce((a, b) => (b.g > a.g ? b : a));
ok(top.ds === 0.21 && top.dp === -1, '"pays a lot of attention to immigration and takes a stance similar to the radical right": loudest + like them is the largest gain in the grid');
ok(M.gain(0.21, 0) > 1, '"the more attention the mainstream centre-right party pays to immigration ... the greater the success" (Model 2/3 salience term): more talk on the old line helps them');
ok(Math.abs(M.gain(0.21, 1) - M.gain(0, 1)) < 1, 'adversarial + more attention: the +1 line is flat (no extra gain from talking more against them)');

console.log('== The measurement (Appendix A): salience = share of statements, position = mean direction ==');
{ const m = M.measure([{ kind: 'copy' }, { kind: 'other' }, { kind: 'oppose' }, { kind: 'other' }]);
  ok(Math.abs(m.ds - 2 * C.salStep) < 1e-12 && m.dp === 0, 'two immigration answers (one each way) + two others: ds = 2 steps, dp = mean = 0'); }
{ const m = M.measure([{ kind: 'other' }, { kind: 'other' }]); ok(m.ds === 0 && m.dp === 0 && m.gain === 0, 'no immigration answers: nothing changes'); }
{ const pRR = C.dirConst + C.dirRR, pCR = C.dirConst + C.dirCR, pCL = C.dirConst + C.dirCL;
  console.log(`  Table 2 M1 average directions: radical right ${pRR.toFixed(2)}, centre-right ${pCR.toFixed(2)}, centre-left ${pCL.toFixed(2)}`);
  ok(pRR < pCR && pCR < pCL, 'Table 2: the centre-right sits between the radical right and the centre-left'); }

console.log('== The decks ==');
M.CAMPAIGNS.forEach(c => ok(c.deck.length === C.days && c.deck.every(d => d.length === 3), `${c.key}: ${C.days} days of 3 questions`));
ok(M.CAMPAIGNS[0].deck.every(d => d.filter(q => q.imm).length === 1), 'quiet year: exactly one immigration question a day (dodging always possible)');
const forcedDays = M.CAMPAIGNS[1].deck.filter(d => d.every(q => q.imm)).length;
ok(forcedDays === 2, 'crisis: two days on which every question is about immigration');
near(forcedDays * C.salStep, 0.056, 0.02, 'crisis: forced minimum salience change vs Table 2 M5 crisis x centre-right salience term');
const texts = new Set(); M.CAMPAIGNS.forEach(c => c.deck.flat().forEach(q => texts.add(q.text)));
ok(texts.size === M.CAMPAIGNS.reduce((s, c) => s + c.deck.flat().length, 0), 'no question repeats across the two campaigns');

console.log('== Strategies, as a player would play them ==');
const S = {
  'quiet year, take every immigration question, like them': play(always('copy')),
  'quiet year, take every immigration question, usual line': play(always('usual')),
  'quiet year, take every immigration question, against them': play(always('oppose')),
  'quiet year, never touch immigration': play(dodge('oppose')),
};
const crisis = kind => play(dodge(kind), crisisGame());
S['crisis, dodge when possible, forced answers like them'] = crisis('copy');
S['crisis, dodge when possible, forced answers usual line'] = crisis('usual');
S['crisis, dodge when possible, forced answers against them'] = crisis('oppose');
S['crisis, every immigration question, against them'] = play(always('oppose'), crisisGame());
for (const [k, r] of Object.entries(S)) console.log(`  ${k.padEnd(62)} k=${r.k} ds=${r.ds.toFixed(3)} dp=${r.dp.toFixed(2)}  gain ${M.fmt(r.gain).padStart(5)}  ${r.held ? 'held' : 'NOT held'}`);
ok(!S['quiet year, take every immigration question, like them'].held && !S['quiet year, take every immigration question, usual line'].held, 'the instinctive strategies (copy; talk on the usual line) fail the aim');
ok(S['quiet year, never touch immigration'].held && S['crisis, dodge when possible, forced answers against them'].held, 'the paper-consistent strategies (keep off it; when you can\'t, take them on) pass');
ok(!S['crisis, dodge when possible, forced answers like them'].held && !S['crisis, dodge when possible, forced answers usual line'].held, 'in the crisis, copying or the usual line on the forced days alone fails');

console.log('== Robustness: does the discovery depend on our design choices? ==');
// (a) answer leans: Fig. 5's -1 / +1 versus Table 2's party-average distances
const altLean = { copy: (C.dirConst + C.dirRR) - (C.dirConst + C.dirCR), usual: 0, oppose: (C.dirConst + C.dirCL) - (C.dirConst + C.dirCR) };
console.log(`  alternative leans from Table 2: like them ${altLean.copy.toFixed(2)}, against them +${altLean.oppose.toFixed(2)}`);
for (const k of [2, 6]) {
  const ds = k * C.salStep, a = M.gain(ds, altLean.copy), u = M.gain(ds, 0), o = M.gain(ds, altLean.oppose);
  console.log(`  k=${k}: like them ${M.fmt(a)}, usual ${M.fmt(u)}, against ${M.fmt(o)}`);
  ok(a > u && u > o, `Table 2 leans, ${k} answers: like them > usual line > against them`);
}
ok(M.gain(2 * C.salStep, altLean.oppose) < C.holdLimit, 'Table 2 leans: forced crisis answers against them still held');
ok(M.gain(6 * C.salStep, altLean.oppose) >= C.holdLimit,
  'NOTE (expected): with Table 2 leans, taking them on six times of six is NOT held (+2.1); the "against them is always safe" reading rests on Fig. 5\'s +1 line, so the game never claims it');
// (b) Model 2, no interaction
const m2 = (ds, dp) => C.m2Sal * ds + C.m2Pos * dp;
ok(m2(0.21, -1) > m2(0.21, 0) && m2(0.21, 0) > m2(0.21, 1), 'Model 2 (no interaction): like them > usual > against at full talk');
console.log(`  NOT robust: under Model 2, against them at 2 forced answers gives ${M.fmt(m2(0.07, 1))}, at 6 gives ${M.fmt(m2(0.21, 1))}: that "talking against them is harmless" rests on Model 3's interaction (t = ${C.tInt}); the game says so at the first "against them" answer and on About.`);
// (c) hold limit
const keyGains = [0.07, 0.035].flatMap(ds => [M.gain(ds, 0), M.gain(ds, -1)]);
const lo = Math.max(0, ...Object.values(S).filter(r => r.held).map(r => r.gain)), hi = Math.min(...keyGains, ...Object.values(S).filter(r => !r.held).map(r => r.gain));
console.log(`  held/not-held identical for every strategy above for any limit in (${lo.toFixed(2)}, ${hi.toFixed(2)}]; we use ${C.holdLimit}`);
ok(lo < C.holdLimit && C.holdLimit <= hi, 'hold limit inside the range that gives the same outcomes');
// (d) salience step
for (const st of [0.025, 0.033]) {
  const g = (k, dp) => M.gain(k * st, dp);
  ok(g(1, -1) > g(1, 0) && g(1, 0) > g(1, 1) && g(2, 1) < 1 && g(1, 0) > 0, `salience step ${st}: same ordering, forced "against" still harmless, usual line still helps them`);
}

console.log('== Display ==');
{ const g = M.newGame(); M.nextCampaign(Object.assign(g, { results: [{ end: 12 }] })); const i = M.today(g).findIndex(q => q.imm); const r = M.answer(g, i, 'oppose');
  ok(r.share === g.start && r.change === 0 && r.after < 0, `a lone "against them" answer: estimate ${M.fmt(r.after)}, balloon unchanged (floored at zero)`); }
console.log('== Headlines and determinism ==');
{ const g = M.newGame(); const i = M.today(g).findIndex(q => q.imm); const r = M.answer(g, i, 'copy'); console.log('  day 1 copy headline:', r.headline, '| reaction:', r.reaction, '| change', M.fmt(r.change)); ok(r.headline.length < 60, 'headline fits'); }
{ const a = JSON.stringify(play(always('copy'))), b = JSON.stringify(play(always('copy'))); ok(a === b, 'no randomness: two runs identical'); }
console.log('\nWhat-if (end screen, crisis forced days):', M.whatIf().map(w => `${w.label} ${M.fmt(w.gain)}`).join(' | '));
console.log(fails ? `\n${fails} FAILED` : '\nALL PASS');
process.exitCode = fails ? 1 : 0;
