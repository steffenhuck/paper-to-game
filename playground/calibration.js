// Calibration check for Me and My Friends: runs mechanism.js headless against the paper's reported numbers.
const M = require('./mechanism.js'); const C = M.CONFIG;
let fails = 0, out = [];
function check(name, ok, detail) { out.push((ok ? 'PASS ' : 'FAIL ') + name + (detail ? '  — ' + detail : '')); if (!ok) fails++; }
const up = { money: 1, jobs: 1, learn: 1 }, down = { money: -1, jobs: -1, learn: -1 }, mid = { money: 0, jobs: 0, learn: 0 };

// 1. part one against Finland, Portugal and the mean
const cu = M.country(up), cd = M.country(down), cm = M.country(mid);
check('all dials up gives Finland\'s share (16%) within 0.02', Math.abs(cu.share - C.SHARE_FINLAND) < 0.02, cu.share.toFixed(3));
check('all dials down gives Portugal\'s share (39%) within 0.02', Math.abs(cd.share - C.SHARE_PORTUGAL) < 0.02, cd.share.toFixed(3));
check('middle gives the age-11 mean share (27%) within 0.02', Math.abs(cm.share - C.SHARE_MEAN_11) < 0.02, cm.share.toFixed(3));
check('all up: share with no opposite-sex friend 41% within 0.03', Math.abs(cu.none - C.NONE_FINLAND) < 0.03, cu.none.toFixed(3));
check('all down: 6% within 0.02', Math.abs(cd.none - C.NONE_PORTUGAL) < 0.02, cd.none.toFixed(3));
check('middle: about 21-23% with none (p. 17: 21% at 11 overall)', cm.none > 0.18 && cm.none < 0.26, cm.none.toFixed(3));
check('ruler: Finland end about 6 of 10, Portugal end about 9 of 10', Math.round(cu.kids) === 6 && Math.round(cd.kids) === 9, cu.kids.toFixed(2) + ' / ' + cd.kids.toFixed(2));
// monotone in each dial, sign of each reported correlation
['money', 'jobs', 'learn'].forEach(k => {
  const lo = Object.assign({}, mid, { [k]: -1 }), hi = Object.assign({}, mid, { [k]: 1 });
  check('dial ' + k + ' up lowers the share (reported rho < 0)', M.countryShare(hi) < M.countryShare(lo), (M.countryShare(lo) - M.countryShare(hi)).toFixed(3) + ' swing');
});
// relative size of the swings follows the reported correlations
const sw = k => M.countryShare(Object.assign({}, mid, { [k]: -1 })) - M.countryShare(Object.assign({}, mid, { [k]: 1 }));
check('parenting swing > equality swing > money swing (|rho| .67 > .43 > .39)', sw('learn') > sw('jobs') && sw('jobs') > sw('money'), [sw('money'), sw('jobs'), sw('learn')].map(x => x.toFixed(3)).join(' / '));
// robustness: a multivariate construction from the same reported correlations
let agreeDiag = true, cornerDisagree = 0, cornerAgreeFlagged = true, settings = [];
[-1, 0, 1].forEach(a => [-1, 0, 1].forEach(b => [-1, 0, 1].forEach(c => settings.push({ money: a, jobs: b, learn: c }))));
const order = (f, s) => f(s);
const diag = [up, mid, down].map(s => [M.countryShare(s), M.countryShareMultivariate(s)]);
agreeDiag = diag[0][0] < diag[1][0] && diag[1][0] < diag[2][0] && diag[0][1] < diag[1][1] && diag[1][1] < diag[2][1];
check('robust: both constructions order all-up < middle < all-down', agreeDiag, diag.map(d => d.map(x => x.toFixed(3)).join('|')).join('  '));
settings.forEach(s => {
  const a = M.countryShare(s) - cm.share, b = M.countryShareMultivariate(s) - cm.share;
  if (Math.sign(a) !== Math.sign(b) && Math.abs(a) > 0.01 && Math.abs(b) > 0.01) { cornerDisagree++; const r = M.country(s); if (!r.corner && !r.hedge) cornerAgreeFlagged = false; }
});
check('robust: every setting where the two constructions disagree in sign carries the corner or the hedge line on screen', cornerAgreeFlagged, cornerDisagree + ' disagreeing settings');
check('robust: a lone move of the jobs dial is hedged; a lone move of the parents\' dial or the money dial is not', M.country({ money: 0, jobs: 1, learn: 0 }).hedge && !M.country({ money: 0, jobs: 0, learn: 1 }).hedge && !M.country({ money: 1, jobs: 0, learn: 0 }).hedge, '');
check('the flagged corners are a minority of settings', settings.filter(s => M.country(s).corner).length <= 14, settings.filter(s => M.country(s).corner).length + ' of 27');

// 2. part two against Figure 4 and the tables
const small = M.smallHouses(), big0 = M.bigHouses({ mums: 0, learn: 0, week: 0 });
check('small houses at 65.6%, about 7 of 10', Math.abs(small.share - 0.656) < 1e-9 && Math.round(small.kids) === 7, small.kids.toFixed(2));
check('big houses, levers in the middle, near the top fifth (48%), within 0.03', Math.abs(big0.share - C.MIXED_HIGHEST_FIFTH) < 0.03, big0.share.toFixed(3));
check('the gap in the middle is about 17 points (Fig. 4: 17.4)', Math.abs((small.share - big0.share) - 0.174) < 0.035, (small.share - big0.share).toFixed(3));
// each lever's sign matches the paper
const L = (k, v) => M.bigHouses(Object.assign({ mums: 0, learn: 0, week: 0 }, { [k]: v })).share;
check('mums "same as dads" raises mixing (Table A14: +0.018/SD)', L('mums', 1) > L('mums', -1), (L('mums', 1) - L('mums', -1)).toFixed(3));
check('"think for yourself" lowers mixing vs "do as you\'re told" (Table 4: -0.018)', L('learn', 1) < L('learn', -1), (L('learn', -1) - L('learn', 1)).toFixed(3));
check('"work hard" between the two, nearer "obey" (Table 4: -0.002)', L('learn', 0) <= L('learn', -1) && L('learn', 0) > L('learn', 1), '');
check('the street raises mixing vs all clubs (Table 5: clubs -0.010, roaming +0.024)', L('week', 1) > L('week', -1), (L('week', 1) - L('week', -1)).toFixed(3));
check('the week moves most, the mums\' views least of the three', (L('week', 1) - L('week', -1)) > (L('mums', 1) - L('mums', -1)) && (L('mums', 1) - L('mums', -1)) > (L('learn', -1) - L('learn', 1)) * 0.9, '');
// the lever effects are the paper's marginal effects times the lever's travel
const e = M.leverZ({ mums: 1, learn: -1, week: 1 });
check('mums lever at +1 = 0.018 x (1.5 - 0.2)', Math.abs(e.norms - C.ME_NORMS_11 * (C.LEVER_SD - C.BIG_TYPICAL.norms)) < 1e-9, e.norms.toFixed(4));
check('street: clubs at the floor, roaming at +1.5', Math.abs(e.clubs - C.ME_CLUBS * (C.CLUBS_FLOOR - C.BIG_TYPICAL.clubs)) < 1e-9 && Math.abs(e.unsup - C.ME_UNSUPERVISED * (C.LEVER_SD - C.BIG_TYPICAL.unsupervised)) < 1e-9, '');
// the target cannot be reached: the central discovery of part two
const best = M.bestBigHouses();
check('no lever setting reaches the small-house share (the shortfall is real)', best.share < small.share, 'best ' + best.share.toFixed(3) + ' vs ' + small.share.toFixed(3));
check('the best setting is mums same as dads, do as you\'re told, out on the street', best.levers.mums === 1 && best.levers.learn === -1 && best.levers.week === 1, JSON.stringify(best.levers));
const sf = M.shortfall();
check('pulling every lever closes between a third and two thirds of the gap', sf.closed > 0.33 && sf.closed < 0.67, (sf.closed * 100).toFixed(0) + '%');
// robustness: with no typical big-house behaviour (all typical z = 0) the shortfall and signs survive
const T0 = { norms: 0, permissive: 0, authoritative: 0, clubs: 0, unsupervised: 0 };
const best0 = M.bestBigHouses(T0);
check('robust: typical big-house z set to zero, the target is still out of reach', best0.share < small.share, best0.share.toFixed(3));
check('robust: typical z zero, best levers unchanged', best0.levers.mums === 1 && best0.levers.learn === -1 && best0.levers.week === 1, JSON.stringify(best0.levers));
// robustness: income effect at 11 implies the quintile gap. ME -0.062/SD; top vs bottom fifth of a normal are ~2.8 SD apart -> 17 points
check('Table 5 income effect x 2.8 SD gives the Figure 4 gap within 0.03', Math.abs(-C.ME_INCOME_11 * 2.8 - 0.174) < 0.03, (-C.ME_INCOME_11 * 2.8).toFixed(3));
check('paper\'s shares: week an eighth, child a quarter, remainder more than half', C.GAP_SHARE_WEEK + C.GAP_SHARE_CHILD < 0.5, '');

// 3. the drawing: over many seeds, the right count of kids and lines
let okKids = 0, okLines = 0, n = 0, okTotal = 0;
for (let seed = 1; seed <= 300; seed++) {
  settings.forEach(s => { const c = M.country(s), p = M.drawPlayground(seed * 31 + s.money + 3 * s.jobs + 9 * s.learn, c.kids, c.share); n++;
    if (p.kidsWithRed === Math.round(c.kids)) okKids++; if (p.lines.length === C.LINES) okTotal++;
    if (Math.abs(p.crossLines - Math.round(c.share * C.LINES)) <= 1) okLines++; });
}
check('drawing: exactly round(kids) children hold a red line (all seeds, all settings)', okKids === n, okKids + '/' + n);
check('drawing: twelve lines every time', okTotal === n, okTotal + '/' + n);
check('drawing: red lines within one of share x twelve (>= 90%)', okLines / n > 0.9, (100 * okLines / n).toFixed(1) + '%');
const pb = M.drawPlayground(7, M.bigHouses({ mums: 0, learn: 0, week: 0 }).kids, 0.3);
check('drawing works for part two shares', pb.lines.length === C.LINES && pb.kidsWithRed === 5, pb.kidsWithRed + ' kids red');
// 4. words
check('kidsWords(6.0) = "about six"', M.kidsWords(6.0) === 'about six', M.kidsWords(6.0));
check('kidsWords(9.4) = "nine and a half"', M.kidsWords(9.4) === 'nine and a half', M.kidsWords(9.4));
check('kidsWords(7.7) = "seven and a half"', M.kidsWords(7.7) === 'seven and a half', M.kidsWords(7.7));
check('kidsWords(4.1) = "about four"', M.kidsWords(4.1) === 'about four', M.kidsWords(4.1));
check('moveWords: small effects say hardly / a touch', M.moveWords(0.05) === 'hardly at all' && M.moveWords(0.2) === 'up a touch' && M.moveWords(-0.31) === 'down a touch' && M.moveWords(0.46) === 'up by about half a kid in ten', '');
check('no decimals in result text', !/\d\.\d/.test(M.countryResult(cu).join(' ') + M.streetResult(best).join(' ') + sf.lines.join(' ') + JSON.stringify(M.verdict([cu, cd], [best]))), '');

console.log(out.join('\n')); console.log(fails ? `\n${fails} FAILED` : '\nall passed');
process.exit(fails ? 1 : 0);
