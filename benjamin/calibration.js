// Calibration check for Benjamin's Veil. Run: node calibration.js  (writes calibration-result.txt)
// The essay has no numbers, so the mechanism (a toy) is checked against the essay's CLAIMS (memo, section 17):
//   (P1) the halo withers under the veil (sections III, VI);
//   (P2) with photography, exhibition value drives back cult value along the whole line (section VI; section I on lithography);
//   (P3) unapproachability: cult value falls strictly with nearness (footnote 7);
//   (P4) irreversibility: a halo once spent never recovers (section II);
//   (P5) reach grows with the technique (section I);
//   (P6) heuristics: the best age to open is the print shop or the studio; the two ends are punished;
//   (P7) robustness of P6 under the crowd's price at half and double, and a slower eyes schedule;
//   (P8) the fork: the rally holds most and ends in war; the newsreel has no halo; the vault a crowd of one;
//   (W)  words: no decimals on screen; every slab labelled and explained.
const M = require('./mechanism.js');
const C = M.CONFIG, fs = require('fs');
const out = []; let pass = 0, fail = 0;
function check(name, ok, detail) { (ok ? pass++ : fail++); out.push(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? '  [' + detail + ']' : ''}`); }
const f2 = x => x.toFixed(2);

// ---- P1
const veiled = M.runSchedule([0, 0, 0, 0, 0, 0, 0]);
const halos = veiled.results.map(r => r.halo);
out.push('      halo under the veil, by age: ' + halos.map(f2).join(' '));
check('P1 never lifted: the halo at the cinema is below a tenth of its start', halos[6] < 0.1, f2(halos[6]));
check('P1b most of the loss comes after the court (halo still above three quarters at the court)', halos[3] > 0.75, f2(halos[3]));
check('P1c the halo is still bright through the temple', halos[1] >= 0.9, f2(halos[1]));

// ---- P2: the turn
const turn = C.AGES.map((a, i) => { const cult = halos[i] / (1 - 0) ; const wide = M.reachAt(a, a.ceiling); return { age: a.key, cult: halos[i], wide: wide }; });
out.push('      cult (never shown) vs widest reach, by age: ' + turn.map(t => `${t.age} ${f2(t.cult)}/${f2(t.wide)}`).join(', '));
const firstWideWins = turn.findIndex(t => t.wide > t.cult);
const firstClose = turn.findIndex(t => Math.abs(t.wide - t.cult) <= 0.1);
check('P2 the first age at which the widest reach beats the never-shown halo is the studio (photography)', C.AGES[firstWideWins].key === 'studio', C.AGES[firstWideWins].key);
check('P2b the first age at which the two are within a tenth is the print shop (lithography)', C.AGES[firstClose].key === 'printshop', C.AGES[firstClose].key);

// ---- P3: unapproachability
let strict = true;
C.AGES.forEach(a => { for (let v = 1; v <= a.ceiling; v++) if (!(M.haloAfterVeil(0.5, v) < M.haloAfterVeil(0.5, v - 1))) strict = false; });
check('P3 cult value falls strictly with nearness at every age', strict);
check('P3b the screen leaves no halo at all', M.haloAfterVeil(1, 4) === 0);

// ---- P4: irreversibility, over all 5^7 schedules the stock never rises
let nonInc = true, count = 0;
(function rec(i, sched) {
  if (i === C.AGES.length) { const s = M.runSchedule(sched); let prev = 1; for (const r of s.results) { if (r.haloArrived > prev + 1e-12 || r.halo > r.haloArrived + 1e-12) nonInc = false; prev = r.halo; } count++; return; }
  for (let v = 0; v <= C.AGES[i].ceiling; v++) rec(i + 1, sched.concat(v));
})(0, []);
check('P4 the halo is non-increasing over every schedule', nonInc, count + ' schedules');

// ---- P5
let grows = true;
for (let i = 1; i < C.AGES.length; i++) if (!(C.AGES[i].reach[C.AGES[i].ceiling] > C.AGES[i - 1].reach[C.AGES[i - 1].ceiling])) grows = false;
check('P5 the widest reach available grows strictly from age to age', grows, C.AGES.map(a => f2(a.reach[a.ceiling])).join(' '));
check('P5b the ceiling never falls and reaches the screen only at the cinema', C.AGES.every((a, i) => i === 0 || a.ceiling >= C.AGES[i - 1].ceiling) && C.AGES.findIndex(a => a.ceiling === 4) === 6);

// ---- P6: heuristics
const H = M.heuristics();
out.push('      heuristics (memo, build.md section 3):');
H.forEach(h => out.push(`        ${h.name.padEnd(26)} ${h.sched.join('')}  total ${f2(h.total)}   by age ${h.perAge.map(f2).join(' ')}`));
const best = H[H.length - 1];
const get = n => H.find(h => h.name === n);
const bestOpen = best.sched.findIndex(v => v >= 3);
check('P6 the best schedule first prints at the print shop or the studio', bestOpen === 4 || bestOpen === 5, C.AGES[bestOpen].key);
check('P6b always veiled lands below three quarters of the best', get('always veiled').total < 0.75 * best.total, f2(get('always veiled').total / best.total));
check('P6c always the widest veil lands below three quarters of the best', get('always the widest veil').total < 0.75 * best.total, f2(get('always the widest veil').total / best.total));
check('P6d open at the print shop and at the studio are both within a tenth of the best', get('open at the print shop').total > 0.9 * best.total && get('open at the studio').total > 0.9 * best.total);
check('P6e open at the cinema is worse than open at the studio (the ages of print passed unused)', get('open at the cinema').total < get('open at the studio').total);
check('P6f open at the court is worse than open at the print shop (the halo spent too early)', get('open at the court').total < get('open at the print shop').total);
const spread = Math.max(...H.map(h => h.total)) - Math.min(...H.map(h => h.total));
check('P6g the heuristics spread: the decision matters (range above a quarter of the best)', spread > 0.25 * best.total, f2(spread));

// ---- P7: robustness
function shape(cfg, label) {
  const h = M.heuristics(cfg); const b = h[h.length - 1]; const o = b.sched.findIndex(v => v >= 3);
  const veiledR = h.find(x => x.name === 'always veiled').total / b.total, wideR = h.find(x => x.name === 'always the widest veil').total / b.total;
  out.push(`      ${label}: best ${b.sched.join('')} (prints first at ${C.AGES[o].key}); always veiled ${f2(veiledR)} of best; always widest ${f2(wideR)} of best`);
  return { open: o, veiledR, wideR };
}
const half = shape(M.withConfig({ W_CROWD: 0.5 }), 'crowd at half price');
const dbl = shape(M.withConfig({ W_CROWD: 2 }), 'crowd at double price');
const slowAges = JSON.parse(JSON.stringify(C.AGES)).map(a => ({ ...a, eyes: 1 - (1 - a.eyes) * 2 / 3 }));
const slow = shape(M.withConfig({ AGES: slowAges }), 'eyes declining a third more slowly');
check('P7 under all three the best schedule first prints between the court and the studio', [half, dbl, slow].every(x => x.open >= 3 && x.open <= 5));
check('P7b under all three always veiled stays below nine tenths of the best', [half, dbl, slow].every(x => x.veiledR < 0.9));
check('P7c under all three always widest stays below the best, and below three quarters when the crowd is not overpriced', [half, dbl, slow].every(x => x.wideR < 1) && half.wideR < 0.75 && slow.wideR < 0.75);
check('P7d the halo under the veil still goes below a quarter by the cinema with the slower eyes', M.runSchedule([0, 0, 0, 0, 0, 0, 0], M.withConfig({ AGES: slowAges })).results[6].halo < 0.25);

// ---- P8: the fork
const F = C.FORK;
check('P8 the rally holds the most and ends in war', F.every(f => f.key === 'rally' || f.hold < F[2].hold) && F[2].war === true && F[2].haloBack === 1);
check('P8b the newsreel has no halo and everyone in it', F[3].haloBack === 0 && F[3].reach === 1);
check('P8c the vault has a crowd of one and no halo', F[0].reach <= 0.02 && F[0].haloBack === 0);
check('P8d the studio rebuilds a halo, in ink, smaller than the rally\'s', F[1].haloBack > 0 && F[1].haloBack < F[2].haloBack);

// ---- W: words
const strings = [];
C.AGES.forEach(a => { strings.push(a.name, a.date, a.newThis, a.eyesLine || '', a.notYet); a.crowd.forEach(c => strings.push(c)); });
C.VEILS.forEach(v => strings.push(v.label, v.who)); C.FORK.forEach(f => strings.push(f.label, f.meaning, f.line, f.benjamin));
const s = M.newGame(); for (let i = 0; i < 7; i++) { M.arrive(s); strings.push(M.arrivalLine(s)); strings.push(M.commit(s, i < 4 ? 0 : 3).line); M.next(s); } M.fork(s, 2); const v = M.verdict(s); strings.push(v.lead, v.did, v.benjamin, v.fork);
check('W no decimals in any string the screen shows', strings.every(t => !/\d\.\d/.test(t)));
check('W2 every veil slab and every fork slab has a label and a meaning', C.VEILS.every(x => x.label && x.who) && C.FORK.every(x => x.label && x.meaning));
check('W3 every age has a technique, a line for what is new, and a crowd word up to its ceiling', C.AGES.every(a => a.technique && a.newThis && a.crowd.slice(0, a.ceiling + 1).every(c => c)));
check('W4 halo words cover the range', ['bright', 'a little thinner', 'about half what it was', 'a quarter of what it was', 'almost gone', 'gone'].every((w, i) => M.haloWords([1, 0.7, 0.5, 0.25, 0.1, 0.01][i]) === w));
check('W5 the verdict for a sensible path names the turn', /Benjamin dates the turn/.test(M.verdict(M.runSchedule([0, 0, 0, 0, 3, 3, 4])).did));
{ const t = M.newGame(); const causes = []; for (let i = 0; i < 7; i++) { M.arrive(t); causes.push(/eyes have changed/.test(M.arrivalLine(t))); M.commit(t, 0); M.next(t); }
  check('W7 the arrival line names the cause once, at the studio, and states the fact elsewhere', causes.filter(Boolean).length === 1 && causes[5] === true, causes.map(c => c ? 'cause' : 'fact').join(' ')); }
check('W8 no announcement says whether the face is hidden or shown', C.AGES.every(a => !/veil|hidden|shown|in the dark/i.test(a.newThis)));
check('W6 the verdict for the always-veiled path says the halo went anyway', /went anyway/.test(M.verdict(M.runSchedule([0, 0, 0, 0, 0, 0, 0])).did));

const head = `Benjamin's Veil — calibration result (${new Date().toISOString().slice(0, 10)})\n${pass} passed, ${fail} failed\n`;
const text = head + out.join('\n') + '\n';
fs.writeFileSync(__dirname + '/calibration-result.txt', text);
console.log(text);
if (fail) process.exit(1);
