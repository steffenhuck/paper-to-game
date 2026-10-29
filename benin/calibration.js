// Calibration check (memo section 17). Runs mechanism.js unchanged against the paper's stated numbers.
// Run: node calibration.js > calibration-result.txt
const M = require('./mechanism.js');
const C = M.CONFIG;
let fails = 0;
function check(name, ok, detail) { console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? '  — ' + detail : ''}`); if (!ok) fails++; }
const within = (v, lo, hi) => v >= lo && v <= hi;
const r1 = v => v.toFixed(1);
const sum = o => Object.values(o).reduce((a, b) => a + b);
function median(h) { const n = h.counts.reduce((a, b) => a + b); let acc = 0;
  for (let i = 0; i < h.counts.length; i++) { if (acc + h.counts[i] >= n / 2) return h.edges[i] + (n / 2 - acc) / h.counts[i] * (h.edges[i + 1] - h.edges[i]); acc += h.counts[i]; } }

console.log('A. The read-off data against the paper\'s text\n');
const labels = [.02, .05, .14, .39, 1.1, 2.9, 7.8];
const got = [9, 10, 11, 12, 13, 14, 15].map(x => M.toEUR(x) / 1000);
check('A1 ln(₦)=9..15 at ₦' + C.nairaPerEuro + '/€ reproduces Fig. 8 tick labels (±12%)', got.every((v, i) => Math.abs(v - labels[i]) / labels[i] < 0.12), got.map(v => v.toPrecision(2)).join(' '));
const medInc = M.toEUR(median(C.income));
check('A2 median EU-income guess ≈ €660 (fn. 37), ±15%', within(medInc, 561, 759), '€' + medInc.toFixed(0) + '; n read off = ' + C.income.counts.reduce((a, b) => a + b));
check('A3 true EU income on the € axis ≈ €2,500 (GNI p.c. 2017, fn. 17)', within(M.toEUR(C.income.truth), 2200, 2800), '€' + M.toEUR(C.income.truth).toFixed(0));
const inc = M.histShares(C.income, C.income.truth, C.income.truth), ita = M.histShares(C.italy, C.italy.truth, C.italy.truth), uk = M.histShares(C.uk, C.uk.truth, C.uk.truth);
check('A4 most underestimate EU income (p. 15)', inc.below > 75, r1(inc.below) + '% below truth');
check('A5 most underestimate the Italian benefit (p. 16)', ita.below > 75, r1(ita.below) + '% below truth');
const ukMed = M.toEUR(median(C.uk));
check('A6 UK benefit: typical guess close to the truth (p. 16)', Math.abs(Math.log(ukMed / M.toEUR(C.uk.truth))) < Math.log(1.5), 'median €' + ukMed.toFixed(0) + ' vs truth €' + M.toEUR(C.uk.truth).toFixed(0) + '; ' + r1(uk.below) + '% below, ' + r1(uk.above) + '% above');
check('A7 Italy truth ≈ €1,300, UK ≈ €350 (fn. 19, as plotted)', within(M.toEUR(C.italy.truth), 1150, 1450) && within(M.toEUR(C.uk.truth), 300, 400), '€' + M.toEUR(C.italy.truth).toFixed(0) + ', €' + M.toEUR(C.uk.truth).toFixed(0));
const A = C.asylum, an = A.counts.reduce((a, b) => a + b), amean = A.counts.reduce((s, c, i) => s + c * (A.edges[i] + 5), 0) / an;
check('A8 asylum truth = 28,130/122,040 ≈ 23% (fn. 34)', Math.abs(A.truth - 23.05) < 0.05, r1(A.truth));
check('A9 mean asylum guess above the truth; mode in the 40–50 bar (p. 24)', amean > A.truth + 5 && A.counts.indexOf(Math.max(...A.counts)) === 4, 'mean ' + r1(amean) + ', n = ' + an);
const R = C.reachEurope, O = C.ownAsylum, P = C.pirates, V = C.vampires;
check('A10 four in five think they would likely reach Europe (p. 23)', within(R.veryLikely + R.somewhatLikely, 76, 84), (R.veryLikely + R.somewhatLikely) + '%');
check('A11 "nearly the same share" think their own asylum claim would succeed (p. 23)', within(O.veryLikely + O.somewhatLikely, 74, 84), (O.veryLikely + O.somewhatLikely) + '%');
check('A12 stacked bars add to ≈100', [R, O, P, V].every(o => within(sum(o), 98.5, 100.5)), [R, O, P, V].map(sum).join(', '));
check('A13 pirates believed more than vampires (p. 23)', P.definitely + P.probably > V.definitely + V.probably, (P.definitely + P.probably) + '% vs ' + (V.definitely + V.probably) + '%');
check('A14 about half or more of those with an opinion believe in sea vampires ("more than half", p. 23)', M.vampireShare() >= 50, M.vampireShare() + ' in 100');
check('A15 motorbike ≈1%, Agadez ≈ one third (pp. 21–22)', C.motorbikeCorrect === 1 && within(C.agadezCorrect, 30, 36));

console.log('\nB. The people at the doors reproduce the paper\'s distributions\n');
const N = 200000;
M.ids.forEach(id => {
  const r = M.rng(1000 + id.length), tally = { green: 0, white: 0, red: 0 };
  for (let i = 0; i < N; i++) tally[M.answer(id, r).colour]++;
  const c = M.outcome(id), sh = k => 100 * tally[k] / N;
  const err = Math.max(Math.abs(sh('green') - c.warn), Math.abs(sh('white') - c.knew), Math.abs(sh('red') - c.back));
  check(`B1 ${id}: note shares from ${N / 1000}k doors match the survey's shares (≤1.5 points, after rounding answers)`, err <= 1.5,
    `doors ${r1(sh('green'))}/${r1(sh('white'))}/${r1(sh('red'))} vs survey ${r1(c.warn)}/${r1(c.knew)}/${r1(c.back)} (green/white/red)`);
});
{ const r = M.rng(7); let ok = true; const xs = [];
  for (let i = 0; i < 20000; i++) { const a = M.answer('income', r); xs.push(a.value); if (a.colour !== M.colourFor('income', a.value)) ok = false; }
  xs.sort((a, b) => a - b);
  const med = xs[xs.length / 2] / C.nairaPerEuro;
  check('B2 the note colour always matches the number the person says (classified after rounding)', ok);
  check('B3 median income answer at the doors ≈ €660 (fn. 37), ±15%', within(med, 561, 759), '€' + med.toFixed(0)); }
{ const a = M.newGame(42), b = M.newGame(42); const sa = M.ids.map(id => M.knock(a, id).say).join('|'), sb = M.ids.map(id => M.knock(b, id).say).join('|');
  check('B4 a street replays exactly from its seed', sa === sb); }

console.log('\nC. The central discovery survives the designer\'s choices\n');
const bands = [{ bandFactor: 1.25, bandPoints: 5 }, { bandFactor: 1.5, bandPoints: 7.5 }, { bandFactor: 2, bandPoints: 10 }];
bands.forEach(o => {
  const c = id => M.counts(id, o);
  const line = M.ids.map(id => `${id} ${c(id).warn}/${c(id).knew}/${c(id).back}`).join(', ');
  check(`C1 band ×${o.bandFactor} / ±${o.bandPoints}: both Europe-wealth posters backfire on more than 70 in 100; asylum and road warn more than they backfire`, c('income').back > 70 && c('italy').back > 70 && c('asylum').net > 20 && c('reach').net > 20, line);
  check(`C2 band ×${o.bandFactor} / ±${o.bandPoints}: the right stamps are print ASYLUM, THE ROAD, THE SEA; scrap the rest`, M.bestCampaign(o).pick.slice().sort().join() === 'asylum,pirates,reach', M.bestCampaign(o).pick.join(', '));
});
check('C3 BRITAIN is a near-wash under every band (|warned − backfired| < 20)', bands.every(o => Math.abs(M.counts('uk', o).net) < C.washBand), bands.map(o => M.counts('uk', o).net).join(', '));
{ const byWarn = M.ids.slice().sort((a, b) => M.counts(a).warn - M.counts(b).warn);
  check('C4 an alternative rule (judge posters by warned alone): the two Europe-wealth posters are still the worst', byWarn.slice(0, 2).sort().join() === 'income,italy', byWarn.map(id => id + ' ' + M.counts(id).warn).join(', ')); }

console.log('\nD. Game logic\n');
check('D1 displayed counts add to 100 for every poster', M.ids.every(id => { const c = M.counts(id); return c.warn + c.knew + c.back === 100; }));
{ const g = M.newGame(3); for (let i = 0; i < C.knocks; i++) M.knock(g, M.ids[i % 6]); let threw = false; try { M.knock(g, 'income'); } catch (e) { threw = true; }
  check('D2 exactly ' + C.knocks + ' knocks, then no more', threw && g.people.length === C.knocks && g.knocksLeft === 0);
  check('D3 every knock leaves one note on the poster asked about', M.ids.every(id => g.notes[id].length === 2)); }
{ const g = M.newGame(5); const s = M.send(g);
  check('D4 Europe\'s draft (print all six, ask no one) is judged: 3 of 6 stamps right, and it backfires', s.rights === 3 && s.back > 0 && s.asked === 0, `warns ${s.warn}, backfires on ${s.back}; ${M.verdict(g).you}`); }
{ const g = M.newGame(6); M.ids.forEach(id => M.setStamp(g, id, M.rightStamp(id))); const s = M.send(g);
  check('D5 the right stamps are judged all right; the best campaign is computed, not typed', s.perfect && s.warn === M.BEST.warn && s.back === M.BEST.back, `warns ${s.warn}, backfires on ${s.back}; ${M.verdict(g).you}`); }
{ const g = M.newGame(8); M.ids.forEach(id => M.setStamp(g, id, 'scrap')); M.send(g); let threw = false; try { M.setStamp(g, 'uk', 'print'); } catch (e) { threw = true; }
  check('D6 stamps lock once sent; scrapping everything is judged', threw, M.verdict(g).you); }

console.log('\nE. Is twelve knocks enough? (a plain strategy: ask each poster twice; print if green notes outnumber red)\n');
{ const T = 20000, right = {}; M.ids.forEach(id => right[id] = 0); let allEuroRed = 0, firstEuroRed = 0;
  for (let t = 0; t < T; t++) {
    const g = M.newGame(10000 + t); M.ids.forEach(id => { M.knock(g, id); M.knock(g, id); });
    if (g.notes.income[0] === 'red') firstEuroRed++;
    if (g.notes.income.every(x => x === 'red') && g.notes.italy.every(x => x === 'red')) allEuroRed++;
    M.ids.forEach(id => { const n = g.notes[id], gr = n.filter(x => x === 'green').length, rd = n.filter(x => x === 'red').length;
      if ((gr > rd ? 'print' : 'scrap') === M.rightStamp(id)) right[id]++; });
  }
  check('E1 the first EUROPE answer is red for most players (the discovery lands at the first door)', firstEuroRed / T > 0.8, r1(100 * firstEuroRed / T) + '%');
  console.log('      share of streets where this strategy stamps each poster right: ' + M.ids.map(id => `${id} ${r1(100 * right[id] / T)}%`).join(', '));
  console.log('      all four Europe-wealth notes red: ' + r1(100 * allEuroRed / T) + '%');
  check('E2 the evidence is noisy where the paper\'s data are mixed (BRITAIN and ASYLUM are stamped right less often than EUROPE and ITALY)', right.uk < right.income && right.asylum < right.italy); }

console.log('\nPosters as judged on the whole survey (of 100 readers: warned / nothing new / backfired → right stamp):');
M.ids.forEach(id => { const c = M.counts(id); console.log(`  ${M.poster(id).tag.padEnd(9)} ${c.warn} / ${c.knew} / ${c.back} → ${M.rightStamp(id).toUpperCase()}   "${M.poster(id).fact}"`); });
console.log(`  Best campaign: ${M.BEST.pick.join(', ')}: warns ${M.BEST.warn}, backfires on ${M.BEST.back}`);
console.log(`\n${fails === 0 ? 'ALL CHECKS PASS' : fails + ' FAILED'}`);
process.exitCode = fails ? 1 : 0;
