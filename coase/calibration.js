// Calibration check for Coase's Cows: runs mechanism.js headless against Coase (1960), "The Problem of Social Cost".
const M = require('./mechanism.js'); const C = M.CONFIG;
let fails = 0, out = [];
function check(name, ok, detail) { out.push((ok ? 'PASS ' : 'FAIL ') + name + (detail ? '  — ' + detail : '')); if (!ok) fails++; }
const Q = M.quarrels(); const byId = {}; Q.forEach(q => byId[q.id] = q);
const O = {}; Q.forEach(q => O[q.id] = M.bestRuling(q));
const near = (a, b, t) => Math.abs(a - b) <= (t || 1e-9);

// 1. The farmer and the cattle-raiser, sections III–IV
const c = O.corn;
check('p. 2 table: crop loss 1, 3, 6, 10 tons for 1–4 steers at $1 a ton', JSON.stringify(C.CROP_LOSS) === '[1,3,6,10]');
check('p. 6: unconstrained herd is three steers (not liable, before any deal)', M.statusQuo(byId.corn, 0).arr.level === 3, 'level ' + M.statusQuo(byId.corn, 0).arr.level);
check('p. 3: with three or fewer steers it is cheaper to pay for crops than to fence ($9)', C.CROP_LOSS[2] < C.FENCE && !c.outcomes[1].final.device);
check('p. 3: a cattle-raiser wanting four or more steers would fence (fence beats $10 of damage)',
  M.arrangementTotal(byId.corn, { level: 4, choices: ['main'], device: 'A' }) > M.arrangementTotal(byId.corn, { level: 4, choices: ['main'], device: null }));
check('p. 6: liable, the rancher adds the third steer only if it brings more than $3; it brings $1, so he keeps two', c.outcomes[1].statusQuo.arr.level === 2);
check('p. 6: liable, the rancher pays $3 for two steers\' damage', c.outcomes[1].statusQuo.damagesPaid === 3);
check('p. 6: not liable, the farmer pays the rancher between $1 (the steer\'s meat) and $3 (the corn it eats) to keep it home',
  c.outcomes[0].deal && c.outcomes[0].transfer < 0 && -c.outcomes[0].transfer >= 1 && -c.outcomes[0].transfer <= 3, 'farmer pays ' + (-c.outcomes[0].transfer));
check('pp. 6–7 (the Coase theorem): same herd whether liable or not', c.outcomes[0].final.level === c.outcomes[1].final.level);
check('pp. 6–7: same value of production whether liable or not, and it is the maximum', near(c.outcomes[0].total, c.outcomes[1].total) && near(c.outcomes[0].total, c.ideal));
check('p. 1 / section V: exclusion (the ban) lowers the value of production here', c.outcomes[2].total < c.ideal);
check('p. 7: the money runs the other way: liable, rancher pays farmer; not liable, farmer pays rancher', c.outcomes[1].statusQuo.damagesPaid > 0 && c.outcomes[0].transfer < 0);

// 2. The strip, section III pp. 3–4
const s = O.strip;
check('p. 3: the tract\'s crop is worth $12, costs $10, net $2', C.CORN_Q2 === 2);
check('p. 4: liable, damage exceeds the net gain, so there is room for a bargain to abandon cultivation', s.outcomes[1].deal && s.outcomes[1].final.choices[0] === 'none');
check('p. 4: the payment is more than $2 (the farmer\'s net gain) and no more than the rancher\'s gain from the deal',
  s.outcomes[1].transfer >= 2 && s.outcomes[1].transfer <= (s.outcomes[1].efficient.total - s.outcomes[1].statusQuo.total) + 2, 'transfer ' + s.outcomes[1].transfer);
check('p. 4: not liable, the farmer does not plant the strip; same allocation as liable', s.outcomes[0].final.choices[0] === 'none' && s.outcomes[0].final.level === s.outcomes[1].final.level);
check('p. 4: the bargain alters the distribution of income, not the allocation', near(s.outcomes[0].total, s.outcomes[1].total) && !near(s.outcomes[0].payB, s.outcomes[1].payB));

// 3. The lawyer, section V and footnote 4
const l = O.lawyer;
check('section V: with a cost of transacting, the rearrangement happens only if the gain exceeds the cost (gain $2 < fee $3: no deal)',
  !l.outcomes[1].deal && (l.outcomes[1].efficient.total - l.outcomes[1].statusQuo.total) < C.LAWYER_FEE);
check('section V: the initial delimitation of rights now affects the value of production', !near(l.outcomes[0].total, l.outcomes[1].total));
check('footnote 4: a crop the cattle do not eat is planted when the farmer bears the damage', l.outcomes[0].final.choices[0] === 'alt');
check('footnote 4 / liable: the farmer keeps the damaged crop since he is compensated', l.outcomes[1].final.choices[0] === 'main');
check('lawyer quarrel: the best ruling leaves the right with the one who can act cheaply', l.best === 0);

// 4. The chimney, section V p. 9, and section II (the reciprocal nature: the sufferer can also step aside)
const sm = O.smoke;
check('p. 9: "smoke preventing devices" exist; liable, the works fits one rather than pay', sm.outcomes[1].final.device === 'A');
check('p. 9: the question is whether the factory should install devices or the occupants should move; here the occupants\' way out is the cheaper', C.HORSES < C.FILTER && sm.outcomes[0].final.device === 'B');
check('p. 9: a vast number of people: no deal is possible, so the ruling decides the outcome', !isFinite(byId.smoke.talk) && !near(sm.outcomes[0].total, sm.outcomes[1].total));
check('section II / p. 9: making the works liable puts the fix on the dear side and lowers the value of production', sm.outcomes[1].total < sm.outcomes[0].total && sm.best === 0);
check('p. 9: shutting the works by decree is worse still', sm.outcomes[2].total < sm.outcomes[1].total);
check('p. 9: not liable reaches the efficient arrangement without a deal (each house acts alone)', near(sm.outcomes[0].total, sm.ideal));
check('section V: the works would pay for the cheap fix if it could deal with a hundred houses; the gap is the cost of transacting', sm.outcomes[1].efficient.total - sm.outcomes[1].total === C.FILTER - C.HORSES);
check('chimney: the filter is the works\' own, and the clothes horses the houses\' own, in the purses', near(sm.outcomes[1].payA, C.WORKS_PROFIT - C.FILTER) && near(sm.outcomes[0].payB, C.WASHING - C.HORSES));

// 5. The railway, section VII pp. 15–16
const r = O.sparks, rq = byId.sparks;
check('p. 15: one train $150 / $50, two trains $250 / $100', C.TRAIN_VALUE[0] === 150 && C.TRAIN_VALUE[0] + C.TRAIN_VALUE[1] === 250 && C.TRAIN_COST[0] === 50 && C.TRAIN_COST[0] + C.TRAIN_COST[1] === 100);
check('p. 15: one train burns $60 of crops, two $120', rq.b.plots[0].burn[0] === 60 && rq.b.plots[0].burn[1] === 120);
check('p. 15: not liable, the railway runs two trains', r.outcomes[0].statusQuo.arr.level === 2);
check('p. 15: the second train lowers the value of total production ($100 of services against $110 of loss)', M.efficient(rq).arr.level === 1);
check('p. 16: liable, the farmers plant the land by the line too, and damage doubles to $120 a train', r.outcomes[1].statusQuo.arr.choices[1] === 'main' && rq.b.plots[0].burn[0] + rq.b.plots[1].burn[0] === 120);
check('p. 16: liable, no train pays ($150 − $50 − $120 < 0): the railway ceases operations', r.outcomes[1].final.level === 0);
check('p. 16: not liable, the strip is abandoned ($160 of crops lost, $150 of factors released: net $10)', r.outcomes[0].final.choices[1] === 'none' && C.NEAR_CROP_NET === 10);
check('p. 16: operating the railway (not liable) raises the value of total production by $20 over no railway', near(r.outcomes[0].total - r.outcomes[2].total, 20), (r.outcomes[0].total - r.outcomes[2].total) + '');
check('p. 16: "it is better that the railway should not be liable"', r.best === 0 && r.outcomes[0].total > r.outcomes[1].total);
check('p. 17: the Pigovian analysis conceives a better world (one train) that no ruling reaches', r.ideal > r.bestTotal);

// 6. The orchard, p. 17
const o = O.orchard;
check('p. 17: "by altering the figures... other cases in which it would be desirable that the railway should be liable"', o.outcomes[1].total > o.outcomes[0].total && near(o.outcomes[1].total, o.ideal));
check('orchard: not liable, the railway runs and the orchards are abandoned', o.outcomes[0].final.level === 2 && o.outcomes[0].final.choices[0] === 'none');

// 7. Accounting and whole dollars, every quarrel, every ruling
Q.forEach(q => [0, 1, 2].forEach(rr => {
  const x = M.outcome(q, rr);
  check(q.id + ' r' + rr + ': purses + fee = valley', near(x.payA + x.payB + x.fee, x.total), x.payA + '+' + x.payB + '+' + x.fee + ' vs ' + x.total);
  check(q.id + ' r' + rr + ': whole dollars on screen', [x.total, x.payA, x.payB, x.transfer].every(v => near(v, Math.round(v))));
  check(q.id + ' r' + rr + ': no decimals in any beat', x.beats.every(b => !/\d\.\d/.test(b.text)));
  check(q.id + ' r' + rr + ': the valley\'s worth equals the arrangement\'s worth less the fee', near(x.total, M.arrangementTotal(q, x.final) - x.fee));
}));

// 8. Robustness of the discoveries (build.md §1)
// (a) the Coase theorem holds for any meat values and crop worth when talking is free, by the mechanism, not by the chosen numbers
let seed = 7; const rnd = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };
let okT = true, okD = true, n = 0;
for (let i = 0; i < 300; i++) {
  const meat = [0, 0, 0, 0].map(() => Math.round(rnd() * 8) - 1).sort((a, b) => b - a);
  const worth = Math.round(rnd() * 12);
  const q = { id: 'rand', kind: 'farm', scene: { level: 3, choices: ['main'] }, signs: ['a', 'b', 'c'], rulings: ['a', 'b', 'c'], facts: [],
    a: { name: 'the rancher', marginal: meat }, b: { name: 'the farmer', plots: [{ name: 'the corn', worth: worth, burn: C.CROP_LOSS }] },
    deviceA: { name: 'a fence', cost: C.FENCE }, deviceB: { name: 'a fence', cost: C.FENCE }, talk: 0 };
  const x0 = M.outcome(q, 0), x1 = M.outcome(q, 1), e = M.efficient(q).total;
  if (!near(x0.total, e) || !near(x1.total, e)) okT = false;
  // the herd can differ only where two herds are worth exactly the same to the valley (a tie)
  if (x0.final.level !== x1.final.level && !near(M.arrangementTotal(q, x0.final), M.arrangementTotal(q, x1.final))) okD = false;
  n++;
}
check('robustness: with free talking, both rulings reach the maximum for 300 random meat and corn values', okT);
check('robustness: with free talking, both rulings end with the same herd for the 300, ties apart', okD);
// (b) the railway reversal survives changes to our one invented number (the far fields' standing crop) at any size,
// and to Coase's strip ($10 net) up to $29: at $30 the strip is worth as much as two trains net of their burning,
// and the ruling flips, which is Coase's own "by altering the figures" (p. 17), played as quarrel 6.
let okR = true, flips = true;
for (const far of [50, 200, 1000]) for (const nearNet of [1, 10, 20, 29]) {
  const q = JSON.parse(JSON.stringify(byId.sparks)); q.talk = Infinity;
  q.b.plots[0].worth = far; q.b.plots[1].worth = nearNet;
  const b = M.bestRuling(q); if (!(b.outcomes[0].total > b.outcomes[1].total)) okR = false;
}
{ const q = JSON.parse(JSON.stringify(byId.sparks)); q.talk = Infinity; q.b.plots[1].worth = 40; const b = M.bestRuling(q); if (!(b.outcomes[1].total > b.outcomes[0].total)) flips = false; }
check('robustness: making the railway liable stays worse for far crops of $50–$1000 and a strip worth $1–$29', okR);
check('robustness: with the strip worth $40 the ruling flips, as p. 17 says other figures would', flips);
// (c) the lawyer quarrel: the ruling matters for any fee above the $2 gain, and stops mattering at a fee of $0
let okL = true;
for (const fee of [2.5, 3, 5, 20]) { const q = JSON.parse(JSON.stringify(byId.lawyer)); q.talk = fee; const b = M.bestRuling(q); if (!(b.outcomes[0].total > b.outcomes[1].total)) okL = false; }
{ const q = JSON.parse(JSON.stringify(byId.lawyer)); q.talk = 0; const b = M.bestRuling(q); if (!near(b.outcomes[0].total, b.outcomes[1].total)) okL = false; }
check('robustness: the lawyer quarrel\'s ruling matters for fees above the gain and not at a fee of zero', okL);
// (d) the surplus split (ours) changes purses, never the valley
let okS = true;
for (const sp of [0, 0.25, 0.75, 1]) { const keep = C.SURPLUS_SPLIT; C.SURPLUS_SPLIT = sp; const b = M.bestRuling(byId.corn); if (!near(b.outcomes[0].total, 14) || !near(b.outcomes[1].total, 14)) okS = false; C.SURPLUS_SPLIT = keep; }
check('robustness: the even split is ours and moves only the purses, not the valley', okS);
// (e) the alternative meat values Coase\'s text would also allow (third steer $2): same discoveries, half dollars aside
{ const keep = C.MEAT.slice(); C.MEAT = [5, 4, 2, -1]; const Q2 = M.quarrels(); const b1 = M.bestRuling(Q2[0]), b2 = M.bestRuling(Q2[1]), b3 = M.bestRuling(Q2[2]);
  check('robustness: with the third steer at $2, quarrels 1–2 still tie across rulings and quarrel 3 still splits', near(b1.outcomes[0].total, b1.outcomes[1].total) && near(b2.outcomes[0].total, b2.outcomes[1].total) && b3.outcomes[0].total > b3.outcomes[1].total);
  C.MEAT = keep; }

// 9. A full run through the game API, the first quarrel ruled twice
{ const g = M.newGame(); const rs = [1, 0, 0, 0, 1, 1]; let last;
  check('run: the second quarrel cannot be ruled before the year after', M.rule(g, rs[0]).again === true && M.rule(g, 0) === null);
  check('run: the year after refuses the same sign and takes another', M.ruleAgain(g, rs[0]) === null && M.ruleAgain(g, 0) !== null && M.ruleAgain(g, 2) === null);
  rs.slice(1).forEach(rr => last = M.rule(g, rr));
  const v = M.verdict(g);
  check('run: six rulings make a finished game', g.done && last !== null && M.rule(g, 0) === null);
  check('run: the verdict sums the six valleys against the six bests', near(v.possible, 14 + 10 + 16 + 30 + 230 + 300) && near(v.mine, 14 + 10 + 16 + 30 + 210 + 300), v.mine + ' / ' + v.possible);
  check('run: the verdict counts quarrels found, the first by its first year, and names the fair ruling that missed', v.found === 5 && /sparks/.test(v.missText) && /felt fair/.test(v.missText), v.found + ' ' + v.missText);
  check('run: the year after is shown in the verdict and not scored', /year two/.test(v.did[0].line) && v.did[0].hit === true);
  check('run: a fate in words and the verdict lines without decimals', typeof v.fate === 'string' && !/\d\.\d/.test(v.didText + v.missText + v.paper + v.means + v.fate));
  const gb = M.newGame(); Q.forEach((q, i) => { M.rule(gb, M.bestRuling(q).best); if (i === 0) M.ruleAgain(gb, 1); }); const vb = M.verdict(gb);
  check('run: the best ruling every time gets everything and the first fate', near(vb.mine, vb.possible) && vb.found === 6 && vb.fate.indexOf('signpost') > 0 && vb.missText === '');
  const gf = M.newGame(); [1, 1, 1, 1, 1, 1].forEach((rr, i) => { M.rule(gf, rr); if (i === 0) M.ruleAgain(gf, 0); }); const vf = M.verdict(gf);
  check('run: the fair instinct, make the harmer pay every time, finds only three of six and is told so', vf.found === 3 && vf.fate.indexOf('signpost') < 0 && /lawyer/.test(vf.missText) && /chimney/.test(vf.missText) && /sparks/.test(vf.missText), vf.found + ' ' + vf.fate);
  const gl = M.newGame(); [0, 0, 0, 0, 0, 0].forEach((rr, i) => { M.rule(gl, rr); if (i === 0) M.ruleAgain(gl, 1); }); const vl = M.verdict(gl);
  check('run: let them carry on every time misses the orchard: no rule of thumb', vl.found === 5 && /orchard/.test(vl.missText));
  // the year after: every pair of signs compares, and the two non-ban pairs say the valley is the same
  let okY = true; [[0, 1], [1, 0], [0, 2], [2, 0], [1, 2], [2, 1]].forEach(([a, b]) => { const gy = M.newGame(); M.rule(gy, a); const x = M.ruleAgain(gy, b); if (!x || x.result.length !== 3 || x.others.length !== 1) okY = false; if (a !== 2 && b !== 2 && !/same valley/.test(x.result[0])) okY = false; });
  check('run: the year after compares any two signs, one ghost left over', okY);
}

out.push(''); out.push(fails ? fails + ' FAILED of ' + out.filter(l => /^(PASS|FAIL)/.test(l)).length : 'ALL ' + out.filter(l => /^(PASS|FAIL)/.test(l)).length + ' PASSED');
console.log(out.join('\n'));
require('fs').writeFileSync(__dirname + '/calibration-result.txt', out.join('\n') + '\n');
process.exit(fails ? 1 : 0);
