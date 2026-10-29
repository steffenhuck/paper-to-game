// Fidelity check (memo section 15). Run: node fidelity.js > fidelity-result.txt
const M = require('./mechanism.js');
let fails = 0;
const ok = (cond, msg) => { console.log((cond ? 'PASS ' : 'FAIL ') + msg); if (!cond) fails++; };
const src = M.src;

// 1. Flesch formula against published values
const plat = M.readingEase(M.textStats('The Australian platypus is seemingly a hybrid of a mammal and reptilian creature.'));
ok(Math.abs(plat - 24.4) < 0.1, `platypus sentence = ${plat.toFixed(2)} (published 24.4, Wikipedia 'Flesch–Kincaid readability tests')`);
const cat = M.readingEase(M.textStats('The cat sat on the mat.'));
ok(Math.abs(cat - 116.1) < 0.1, `"The cat sat on the mat." = ${cat.toFixed(2)} (published 116.1)`);

// 2. syllables against a hand count of every word the release can contain
const HAND = `a1 view1 waste1 wastes1 measures2 acceleration5 achievement3 adopted3 adoption3 after2 agree2 also2 alternative4 an1 and1 apply2 as1 availability6 away2 be1
becomes2 both1 buy1 buying2 by1 can1 charge1 choice1 circular3 climate2 commission3 commissioner4 consumer3 consumers3 consumption3
contributes3 contribution4 council2 country2 deal1 debate2 decide2 directive3 each1 easy2 economy4 element3 empowerment4 ensure2 entry2
essential3 eu2 europe2 european4 facilitation5 firms1 fix1 following3 for1 force1 foreseen2 further2 goals1 goods1 governments3 green1
guides1 has1 have1 help1 implementation5 in1 information4 instead2 internal3 into2 is1 it1 its1 keep1 key1 last1 law1 legislative4 less1
make1 making2 market2 member2 model2 money2 months1 move1 must1 national3 negotiate4 negotiation5 new1 next1 now1 objective3 obligation4
of1 offer2 on1 one1 ones1 ordinary4 own1 parliament3 part1 parts1 people2 period3 placing2 planet2 practice2 procedure3 producers3 product2
promotion3 proposal3 proposed2 put1 reach1 reduction3 reinforcement4 repair2 replacement3 responsible4 rights1 rules1 said1 saves1 sell1
shop1 significant4 so1 spare1 start1 stated2 states1 stronger2 subject2 sustainable4 ten1 that1 the1 them1 then1 they1 things1 this1 throw1
to1 today2 towards2 transition3 twenty-four3 two1 under2 unit2 up1 what1 when1 wherever3 whether2 will1 with1 within2 would1 years1`
  .split(/\s+/).filter(Boolean).map(t => { const m = t.match(/^(.*?)(\d+)$/); return [m[1], +m[2]]; });
const hand = Object.fromEntries(HAND);
const used = new Set();
M.RELEASE.paras.forEach((p, i) => [-1, 0, 1].forEach(k => M.words(M.paraText(i, k)).forEach(w => used.add(w.toLowerCase()))));
const missing = [...used].filter(w => hand[w] == null), wrong = [...used].filter(w => hand[w] != null && M.syllables(w) !== hand[w]);
ok(missing.length === 0, `every release word has a hand count (${used.size} words${missing.length ? '; missing: ' + missing.join(' ') : ''})`);
ok(wrong.length === 0, `syllables() matches the hand count for all of them${wrong.length ? '; wrong: ' + wrong.map(w => `${w} ${M.syllables(w)}≠${hand[w]}`).join(', ') : ''}`);

// 3. benchmarks reproduce the paper's verbal claims
const C = src('comm'), U = src('uk'), I = src('ire'), P = src('polsci'), B = src('broad'), T = src('tabloid');
ok(['reading', 'familiar', 'verbs'].every(m => C[m] < U[m] && C[m] < I[m]), 'Commission below both governments on all three indicators (p. 692)');
ok(['reading', 'familiar', 'verbs'].every(m => C[m] < B[m] && C[m] < T[m]), 'Commission below broadsheets and tabloids on all three (p. 692)');
ok(Math.abs(C.reading - P.reading) < Math.abs(C.reading - B.reading) && Math.abs(C.verbs - P.verbs) < Math.abs(C.verbs - B.verbs), 'Commission closer to political-science abstracts than to broadsheets on reading ease and verbs (p. 692)');
ok(C.familiar < P.familiar, 'Commission below political scientists on familiar words (p. 692: "performs even worse")');
ok(C.reading < 30 && U.reading >= 30, `Commission in Flesch's graduate band (<30), UK above it (p. 692: university graduates vs high school) — ${C.reading} vs ${U.reading}`);
const tr = M.CONFIG.trend.map(x => x[1]), range = Math.max(...tr) - Math.min(...tr);
ok(M.trendTruth() === 'same' && range < 4, `annual reading ease flat: range ${range.toFixed(1)} points, first ${tr[0]} last ${tr[tr.length - 1]} (p. 693: "hardly changed")`);
ok(Math.max(...tr) < I.reading, 'in no year does the Commission reach the Irish government average (Fig. 2 lower panel)');

// 4. the invented release
const start = M.draftScore(M.newDraft());
ok(start.ease > 12 && start.ease < I.reading, `original release scores ${start.ease.toFixed(1)}: inside the Commission spread (Fig. 2 lower panel, ~10–45) and below the Irish average`);
ok(Math.abs(start.ease - C.reading) < 7, `original within 7 points of the Commission average ${C.reading}`);

// 5. balance with the configured budget
const plans = M.allPlans(M.CONFIG.budget), tgt = src(M.CONFIG.target).reading;
const hits = plans.filter(p => p.ease >= tgt), best = plans.reduce((a, b) => (b.ease > a.ease ? b : a));
ok(hits.length >= 1, `with ${M.CONFIG.budget} edits, ${hits.length} of ${plans.length} plans reach ${tgt} (best ${best.ease.toFixed(1)}: ${best.pick.join(',')})`);
ok(hits.length / plans.length < 0.5, `a random plan succeeds ${(100 * hits.length / plans.length).toFixed(0)}% of the time (< 50%: the choice matters)`);
ok(plans.every(p => p.ease < B.reading), `no two-edit plan reaches the broadsheet line ${B.reading} (the aim is the UK line, not beyond)`);
const greedy = (() => { const d = M.newDraft(); for (let n = 0; n < M.CONFIG.budget; n++) { let bst = null; M.RELEASE.paras.forEach((p, i) => p.alts.forEach((a, k) => { if (d.pick[i] >= 0) return; const t = { pick: d.pick.slice() }; t.pick[i] = k; const e = M.draftScore(t).ease; if (!bst || e > bst.e) bst = { i, k, e }; })); M.edit(d, bst.i, bst.k); } return M.draftScore(d).ease; })();
ok(greedy >= tgt, `a player who always picks the single biggest improvement reaches ${greedy.toFixed(1)} (sensible play succeeds)`);

// 6. robustness of the editor's lesson
const plain = w => { let x = w.toLowerCase().replace(/[^a-z]/g, ''); if (x.length <= 3) return 1; x = x.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '').replace(/^y/, ''); const g = x.match(/[aeiouy]{1,2}/g); return Math.max(1, g ? g.length : 1); };
const statsWith = (text, syl) => { const w = M.words(text); return { words: w.length, sentences: M.sentences(text), syllables: w.reduce((a, x) => a + x.split('-').reduce((s, p) => s + syl(p), 0), 0) }; };
const textOf = pick => M.RELEASE.paras.map((p, i) => M.paraText(i, pick[i])).join(' ');
const fre = st => M.readingEase(st), fkgl = st => -(0.39 * st.words / st.sentences + 11.8 * st.syllables / st.words - 15.59); // grade, negated so higher = easier
const rank = arr => { const s = arr.map((v, i) => [v, i]).sort((a, b) => a[0] - b[0]); const r = []; s.forEach(([, i], j) => r[i] = j); return r; };
const spearman = (a, b) => { const ra = rank(a), rb = rank(b), n = a.length; const d2 = ra.reduce((s, x, i) => s + (x - rb[i]) ** 2, 0); return 1 - 6 * d2 / (n * (n * n - 1)); };
const base = plans.map(p => p.ease);
for (const [label, score] of [['plain syllable heuristic', p => fre(statsWith(textOf(p.pick), plain))], ['Flesch–Kincaid grade formula', p => fkgl(M.textStats(textOf(p.pick)))]]) {
  const alt = plans.map(score), rho = spearman(base, alt);
  const altBest = plans[alt.indexOf(Math.max(...alt))];
  if (label.startsWith('plain')) ok(rho > 0.85, `${label}: plan ranking correlates with the game's (Spearman ${rho.toFixed(3)})`);
  else console.log(`INFO ${label}: plan ranking correlation with the game's Spearman ${rho.toFixed(3)} — this formula weighs sentence length more, so the order of middling plans shifts; the claim the game makes is checked below`);
  ok(base[plans.indexOf(altBest)] >= tgt, `${label}: its best plan (${altBest.pick.join(',')}) also reaches the UK line in the game (${base[plans.indexOf(altBest)].toFixed(1)})`);
}
// lesson: rewrites that only shorten sentences gain less than rewrites that shorten words
for (const [label, sylf] of [['hand-checked counter', M.syllables], ['plain heuristic', plain]]) {
  const gain = kind => { const g = []; M.RELEASE.paras.forEach((p, i) => p.alts.forEach((a, k) => { if (a.kind !== kind) return; const t = Array(M.RELEASE.paras.length).fill(-1); const s0 = fre(statsWith(textOf(t), sylf)); t[i] = k; g.push(fre(statsWith(textOf(t), sylf)) - s0); })); return g.reduce((a, b) => a + b, 0) / g.length; };
  const gs = gain('split'), gw = gain('words'), gv = gain('verbs');
  ok(gs < gw && gs < gv, `${label}: mean one-edit gain — shorter sentences ${gs.toFixed(1)}, everyday words ${gw.toFixed(1)}, who-does-what ${gv.toFixed(1)}`);
}
// under Flesch–Kincaid grade: do both kinds of change still help, and does the quote rewrite stay the single best edit?
{ const one = (i, k) => { const t = Array(M.RELEASE.paras.length).fill(-1); t[i] = k; return t; };
  const g0 = fkgl(M.textStats(textOf(Array(M.RELEASE.paras.length).fill(-1))));
  const res = []; M.RELEASE.paras.forEach((p, i) => p.alts.forEach((a, k) => res.push({ id: p.id, kind: a.kind, gF: M.draftScore({ pick: one(i, k) }).ease - start.ease, gK: fkgl(M.textStats(textOf(one(i, k)))) - g0 })));
  ok(res.every(r => r.gF > 0 && r.gK > 0), 'every rewrite improves the score under both formulas (no edit is a trap)');
  const bestF = res.reduce((a, b) => b.gF > a.gF ? b : a), bestK = res.reduce((a, b) => b.gK > a.gK ? b : a);
  ok(bestF.id === bestK.id && bestF.kind === bestK.kind, `single best edit under both formulas: ${bestF.id} ${bestF.kind} (Flesch +${bestF.gF.toFixed(1)}; FK grade −${bestK.gK.toFixed(1)}) / FK best ${bestK.id} ${bestK.kind}`);
  console.log('INFO one-edit gains (Flesch points / FK grades):', res.map(r => `${r.id}-${r.kind} ${r.gF.toFixed(1)}/${r.gK.toFixed(2)}`).join('  '));
}
// the split rewrites change only sentences, not words: isolates the sentence-length half
M.RELEASE.paras.forEach((p, i) => p.alts.forEach((a, k) => { if (a.kind === 'split') { const s0 = M.textStats(p.orig), s1 = M.textStats(a.text); ok(Math.abs(s1.syllables / s1.words - s0.syllables / s0.words) < 0.2 && s1.sentences > s0.sentences, `split rewrite of ${p.id} adds sentences (${s0.sentences}→${s1.sentences}) and keeps word length (${(s0.syllables / s0.words).toFixed(2)}→${(s1.syllables / s1.words).toFixed(2)} syll/word)`); } }));

console.log(fails ? `\n${fails} FAILED` : '\nALL PASS');
process.exit(fails ? 1 : 0);
