// Fidelity check (memo section 15). Runs mechanism.js unchanged against the paper's stated numbers.
// Run: node fidelity.js > fidelity-result.txt
const M = require('./mechanism.js');
const C = M.CONFIG;
let fails = 0;
function check(name, ok, detail) { console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? '  — ' + detail : ''}`); if (!ok) fails++; }
const within = (v, lo, hi) => v >= lo && v <= hi;
const r1 = v => v.toFixed(1);

// (c) tick placement reproduces the figure's labels (k€): .02 .05 .14 .39 1.1 2.9 7.8 at ln(₦)=9..15
const labels = [.02, .05, .14, .39, 1.1, 2.9, 7.8];
const got = [9, 10, 11, 12, 13, 14, 15].map(x => M.toEUR(x) / 1000);
check('(c) ln(₦)=9..15 at ₦' + C.nairaPerEuro + '/€ reproduces Fig. 8 tick labels', got.every((v, i) => Math.abs(v - labels[i]) / labels[i] < 0.12), got.map(v => v.toPrecision(2)).join(' '));

// (a) median income guess ≈ €660 (fn. 37, ₦270,000)
function median(h) { const n = h.counts.reduce((a, b) => a + b); let acc = 0;
  for (let i = 0; i < h.counts.length; i++) { if (acc + h.counts[i] >= n / 2) return h.edges[i] + (n / 2 - acc) / h.counts[i] * (h.edges[i + 1] - h.edges[i]); acc += h.counts[i]; } }
const medInc = M.toEUR(median(C.income));
check('(a) median EU-income guess ≈ €660 (fn. 37), ±15%', within(medInc, 561, 759), '€' + medInc.toFixed(0) + '; n read off = ' + C.income.counts.reduce((a, b) => a + b));
check('(a2) true EU income on the € axis ≈ €2,500 (GNI p.c. 2017, fn. 17)', within(M.toEUR(C.income.truth), 2200, 2800), '€' + M.toEUR(C.income.truth).toFixed(0));

// (b) direction of errors about Europe (text p. 15–16)
const inc = M.histShares(C.income, C.income.truth, C.income.truth), ita = M.histShares(C.italy, C.italy.truth, C.italy.truth), uk = M.histShares(C.uk, C.uk.truth, C.uk.truth);
check('(b1) most underestimate EU income', inc.below > 75, r1(inc.below) + '% below truth');
check('(b2) most underestimate the Italian benefit', ita.below > 75, r1(ita.below) + '% below truth');
const ukMed = M.toEUR(median(C.uk));
check('(b3) UK benefit: typical guess close to truth ("close to the correct figure")', Math.abs(Math.log(ukMed / M.toEUR(C.uk.truth))) < Math.log(1.5), 'median €' + ukMed.toFixed(0) + ' vs truth €' + M.toEUR(C.uk.truth).toFixed(0) + '; ' + r1(uk.below) + '% below, ' + r1(uk.above) + '% above');
check('(b4) Italy truth ≈ €1,300, UK ≈ €350 (fn. 19, as plotted)', within(M.toEUR(C.italy.truth), 1150, 1450) && within(M.toEUR(C.uk.truth), 300, 400), '€' + M.toEUR(C.italy.truth).toFixed(0) + ', €' + M.toEUR(C.uk.truth).toFixed(0));

// (d) asylum
const A = C.asylum, an = A.counts.reduce((a, b) => a + b), amean = A.counts.reduce((s, c, i) => s + c * (A.edges[i] + 5), 0) / an;
check('(d1) asylum truth = 28,130/122,040 ≈ 23%', Math.abs(A.truth - 23.05) < 0.05, r1(A.truth));
check('(d2) mean asylum guess above the truth; mode in 40–50 ("spike at the focal point of 50")', amean > A.truth + 5 && A.counts.indexOf(Math.max(...A.counts)) === 4, 'mean ' + r1(amean) + ', n = ' + an);

// (e) own chances (p. 23)
const R = C.reachEurope, O = C.ownAsylum;
const sum = o => Object.values(o).reduce((a, b) => a + b);
check('(e1) four in five think they would likely reach Europe', within(R.veryLikely + R.somewhatLikely, 76, 84), r1(R.veryLikely + R.somewhatLikely) + '%');
check('(e2) "nearly the same share" think own asylum claim would succeed', within(O.veryLikely + O.somewhatLikely, 74, 84) && O.veryLikely + O.somewhatLikely <= R.veryLikely + R.somewhatLikely, r1(O.veryLikely + O.somewhatLikely) + '%');
check('(e3) stacked bars add to ≈100 (≤1.5 missing segment)', [R, O, C.pirates, C.vampires].every(o => within(sum(o), 98.5, 100.5)), [R, O, C.pirates, C.vampires].map(sum).join(', '));
check('(e4) optimism: own-claim "likely" share far above the true acceptance rate and above the median guess for Nigerians', O.veryLikely + O.somewhatLikely > 2 * median(A) && median(A) > A.truth, 'own ' + (O.veryLikely + O.somewhatLikely) + '% vs median guess ' + r1(median(A)) + ' vs truth ' + r1(A.truth));

// (f) threats and route knowledge (p. 21–23)
const P = C.pirates, V = C.vampires;
check('(f1) pirates believed more than vampires', P.definitely + P.probably > V.definitely + V.probably, (P.definitely + P.probably) + '% vs ' + (V.definitely + V.probably) + '%');
check('(f2) about half or more of those with an opinion believe in sea vampires ("more than half")', M.vampireShare() >= 50, M.vampireShare() + ' in 100');
check('(f3) motorbike ≈1%, Agadez ≈ one third', C.motorbikeCorrect === 1 && within(C.agadezCorrect, 30, 36));

// (g) robustness of the central discovery to the designer's band and scoring choices
const bands = [{ bandFactor: 1.25, bandPoints: 5 }, { bandFactor: 1.5, bandPoints: 7.5 }, { bandFactor: 2, bandPoints: 10 }];
bands.forEach(o => {
  const c = id => M.counts(id, o), best = M.bestCampaign(o);
  const line = ['income', 'italy', 'uk', 'asylum', 'reach', 'pirates'].map(id => `${id} ${M.sgn(c(id).net)}`).join(', ');
  check(`(g1) band ×${o.bandFactor} / ±${o.bandPoints}: Europe-wealth billboards net < −50, asylum and road > +20`, c('income').net < -50 && c('italy').net < -50 && c('asylum').net > 20 && c('reach').net > 20, line);
  check(`(g2) band ×${o.bandFactor} / ±${o.bandPoints}: best three = asylum, road, sea`, best.pick.slice().sort().join() === 'asylum,pirates,reach', best.pick.join(', ') + ' = ' + best.score);
  const byWarn = ['income', 'italy', 'uk', 'asylum', 'reach', 'pirates'].sort((a, b) => c(a).warn - c(b).warn);
  check(`(g3) band ×${o.bandFactor}: scoring by "warned" alone still puts income and Italy last`, byWarn.slice(0, 2).sort().join() === 'income,italy', byWarn.map(id => id + ' ' + c(id).warn).join(', '));
});
check('(g4) UK billboard is a near-wash under every band (|net| < 20)', bands.every(o => Math.abs(M.counts('uk', o).net) < 20), bands.map(o => M.sgn(M.counts('uk', o).net)).join(', '));

// (h) game logic
check('(h1) displayed counts add to 100 for every billboard', M.BILLBOARDS.every(b => { const c = M.counts(b.id); return c.warn + c.knew + c.back === 100; }));
check('(h2) a pick must be exactly 3 different billboards', !M.validPick(['uk', 'uk', 'italy']) && !M.validPick(['uk', 'italy']) && M.validPick(['uk', 'italy', 'reach']));
const all = M.combos(M.BILLBOARDS.map(b => b.id), 3);
check('(h3) best score is the max over all 20 campaigns, computed not typed', all.length === 20 && Math.max(...all.map(p => M.campaignScore(p))) === M.BEST.score, 'best ' + M.BEST.score + ' = ' + M.BEST.pick.join(', '));
let g = M.newGame(); const r = M.runCampaign(g, M.BEST.pick);
check('(h4) perfect first campaign ends the game (no second campaign to repeat)', r.perfect && !M.anotherCampaign(g));
g = M.newGame(); const a = M.runCampaign(g, ['italy', 'uk', 'reach']);
check('(h5) campaign score = warned − backfired, summed', a.score === a.results.reduce((s, x) => s + x.net, 0) && M.anotherCampaign(g), `score ${a.score}: ${M.campaignLine(a)}`);
const b = M.runCampaign(g, ['reach', 'asylum', 'pirates']);
check('(h6) second campaign marks repeats as already seen; verdict uses the best campaign', !b.results.find(x => x.id === 'reach').fresh && b.results.find(x => x.id === 'asylum').fresh && !M.anotherCampaign(g) && M.verdict(g).you.includes(M.sgn(b.score)), M.verdict(g).you);
const avg = all.reduce((s, p) => s + M.campaignScore(p), 0) / all.length;
check('(h7) a random campaign scores far below the best', avg < M.BEST.score / 3, 'mean over all 20: ' + r1(avg));

console.log('\nBillboards as displayed (of 100 people: warned / knew / backfired = score):');
M.ranking().forEach(x => console.log(`  ${x.b.tag.padEnd(9)} ${x.warn} / ${x.knew} / ${x.back} = ${M.sgn(x.net)}   "${x.b.fact}"`));
console.log(`\n${fails === 0 ? 'ALL CHECKS PASS' : fails + ' FAILED'}`);
process.exitCode = fails ? 1 : 0;
