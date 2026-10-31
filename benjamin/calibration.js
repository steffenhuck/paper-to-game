// Calibration check for Benjamin's Veil. Run: node calibration.js  (writes calibration-result.txt)
// The essay has no numbers, so the mechanism (a toy) is checked against the essay's CLAIMS (memo, section 17):
//   (P1) the halo withers under the veil (sections III, VI);
//   (P2) with photography, exhibition value drives back cult value along the whole line (section VI; section I on lithography);
//   (P3) unapproachability: cult value falls strictly with nearness (footnote 7);
//   (P4) irreversibility: a halo once spent never recovers (section II);
//   (P5) reach grows with the technique (section I);
//   (P6) heuristics: the best age to open is the print shop or the studio; the two ends are punished;
//   (P7) robustness of P6 under the crowd's price at half and double, and a slower eyes schedule;
//   (W)  words: no decimals on screen; every slab labelled and explained.
const M = require('./mechanism.js');
const C = M.CONFIG, fs = require('fs');
const out = []; let pass = 0, fail = 0;
function check(name, ok, detail) { (ok ? pass++ : fail++); out.push(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? '  [' + detail + ']' : ''}`); }
const f2 = x => x.toFixed(2);

// ---- P1
const veiled = M.runSchedule([0, 0, 0, 0, 0, 0]);
const halos = veiled.results.map(r => r.halo);
out.push('      halo under the veil, by age: ' + halos.map(f2).join(' '));
check('P1 never lifted: the halo at the cinema is below a tenth of its start', halos[5] < 0.1, f2(halos[5]));
check('P1b most of the loss comes after the cathedral (halo still above three quarters at the cathedral)', halos[2] > 0.75, f2(halos[2]));
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
C.VEILS.forEach((v, i) => { if (i && i !== 2 && i !== 3 && !(M.haloAfterVeil(0.5, i) < M.haloAfterVeil(0.5, i - 1))) strict = false; });
check('P3 cult value falls with nearness up the ladder (the coin excepted, by design)', strict);
check('P3b film leaves no halo at all', M.haloAfterVeil(1, 6) === 0);
check('P3c the coin spends more of the halo than the woodcut, for fewer eyes: the tempting mistake', C.VEILS[2].n > C.VEILS[3].n && C.VEILS[2].reach < C.VEILS[3].reach);

// ---- P4: irreversibility, over all schedules the stock never rises
let nonInc = true, count = 0;
(function rec(i, sched) {
  if (i === C.AGES.length) { const s = M.runSchedule(sched); let prev = 1; for (const r of s.results) { if (r.haloArrived > prev + 1e-12 || r.halo > r.haloArrived + 1e-12) nonInc = false; prev = r.halo; } count++; return; }
  for (let v = 0; v <= C.AGES[i].ceiling; v++) rec(i + 1, sched.concat(v));
})(0, []);
check('P4 the halo is non-increasing over every schedule', nonInc, count + ' schedules');

// ---- P5
let grows = true;
for (let i = 1; i < C.AGES.length; i++) if (!(C.VEILS[C.AGES[i].ceiling].reach > C.VEILS[C.AGES[i - 1].ceiling].reach)) grows = false;
check('P5 the widest reach available grows strictly from age to age', grows, C.AGES.map(a => f2(C.VEILS[a.ceiling].reach)).join(' '));
check('P5b each age opens exactly one new rung, and film only at the cinema', C.AGES.every((a, i) => a.ceiling === i + 1) && C.AGES.findIndex(a => a.ceiling === 6) === 5);
check('P5c what an age announces is what it offers: every age from the temple on names its new rung', C.AGES.slice(1).every((a) => a.newThis.toLowerCase().includes({ coins: 'coin', woodcuts: 'woodcut', lithos: 'lithograph', photos: 'photograph', film: 'film' }[C.VEILS[a.ceiling].key])));

// ---- P6: heuristics
const H = M.heuristics();
out.push('      heuristics (memo, build.md section 3):');
H.forEach(h => out.push(`        ${h.name.padEnd(26)} ${h.sched.join('')}  total ${f2(h.total)}   by age ${h.perAge.map(f2).join(' ')}`));
const best = H[H.length - 1];
const get = n => H.find(h => h.name === n);
const bestOpen = best.sched.findIndex(v => v >= 3);
check('P6 the best schedule first prints at the cathedral or the print shop', bestOpen === 2 || bestOpen === 3, C.AGES[bestOpen].key);
check('P6a the best schedule climbs the ladder: after its first print it takes each new rung as it comes', best.sched.slice(bestOpen).every((v, k) => v === C.AGES[bestOpen + k].ceiling), best.sched.join(''));
check('P6b always veiled lands below a tenth of the best: a halo nobody sees moves nobody', get('always veiled').total < 0.1 * best.total, f2(get('always veiled').total / best.total));
check('P6c always the newest rung lands below the best, and opening at the cathedral or the print shop beats it', get('always the newest rung').total < best.total && Math.max(get('open at the cathedral').total, get('open at the print shop').total) > get('always the newest rung').total, f2(get('always the newest rung').total / best.total));
check('P6d open at the print shop is within a tenth of the best', get('open at the print shop').total > 0.9 * best.total, f2(get('open at the print shop').total / best.total));
check('P6e the later the single opening after the print shop, the worse: studio below print shop, cinema below studio', get('open at the studio').total < get('open at the print shop').total && get('open at the cinema').total < get('open at the studio').total);
check('P6f open at the cinema lands below three fifths of the best: the ages of print passed unused', get('open at the cinema').total < 0.6 * best.total, f2(get('open at the cinema').total / best.total));
check('P6g print then back in the dark lands below half of the best: the halo does not return', get('print, then back in the dark').total < 0.5 * best.total, f2(get('print, then back in the dark').total / best.total));
check('P6j the coin is a tempting mistake: coins at the temple then the newest lands between four fifths and nineteen twentieths of the best', get('coins at the temple, then the newest').total > 0.8 * best.total && get('coins at the temple, then the newest').total < 0.95 * best.total, f2(get('coins at the temple, then the newest').total / best.total));
check('P6h the best path opens step by step: the veil never narrows along it', best.sched.every((v, i) => i === 0 || v >= best.sched[i - 1]), best.sched.join(''));
const spread = Math.max(...H.map(h => h.total)) - Math.min(...H.map(h => h.total));
check('P6i the heuristics spread: the decision matters (range above half of the best)', spread > 0.5 * best.total, f2(spread));

// ---- P7: robustness. The three numbers the revision introduced (section 17 of the memo), each moved both ways.
function shape(cfg, label) {
  const h = M.heuristics(cfg); const b = h[h.length - 1]; const o = b.sched.findIndex(v => v >= 3);
  const veiledR = h.find(x => x.name === 'always veiled').total / b.total, wideR = h.find(x => x.name === 'always the newest rung').total / b.total;
  out.push(`      ${label}: best ${b.sched.join('')} (prints first at ${C.AGES[o].key}); always veiled ${f2(veiledR)} of best; always widest ${f2(wideR)} of best`);
  return { open: o, veiledR, wideR, sched: b.sched };
}
const variants = [
  shape(M.withConfig({ W_SEEN: 0.1 }), 'being seen worth a tenth'),
  shape(M.withConfig({ W_SEEN: 0.4 }), 'being seen worth two fifths'),
  shape(M.withConfig({ PEOPLE_CURVE: 0.35 }), 'people counted more flatly'),
  shape(M.withConfig({ PEOPLE_CURVE: 0.75 }), 'people counted more steeply'),
  shape(M.withConfig({ AGES: JSON.parse(JSON.stringify(C.AGES)).map(a => ({ ...a, eyes: 1 - (1 - a.eyes) * 2 / 3 })) }), 'eyes declining a third more slowly')
];
check('P7 under all five variants the best schedule first prints at the cathedral or the print shop', variants.every(x => x.open >= 2 && x.open <= 3));
check('P7b under all five always veiled stays below a fifth of the best', variants.every(x => x.veiledR < 0.2));
check('P7c under all five always the newest rung stays below the best', variants.every(x => x.wideR < 1));
check('P7d under all five the best path never narrows the veil', variants.every(x => x.sched.every((v, i) => i === 0 || v >= x.sched[i - 1])));

// ---- W: words
const strings = [];
C.AGES.forEach(a => { strings.push(a.name, a.date, a.newThis, a.eyesLine || ''); a.crowd.forEach(c => strings.push(c)); });
C.VEILS.forEach(v => strings.push(v.label, v.who)); strings.push(C.EPILOGUE);
const s = M.newGame(); for (let i = 0; i < 6; i++) { M.arrive(s); strings.push(M.arrivalLine(s)); strings.push(M.commit(s, Math.min(i < 2 ? 0 : i + 1, C.AGES[i].ceiling)).line); M.next(s); } const v = M.verdict(s); strings.push(v.lead, v.did, v.benjamin, v.epilogue);
check('W no decimals in any string the screen shows', strings.every(t => !/\d\.\d/.test(t)));
check('W2 every slab has a label and a meaning, and the epilogue ends on Benjamin\'s line', C.VEILS.every(x => x.label && x.who) && /though the world perish/.test(C.EPILOGUE));
check('W3 every age has a technique, a line for what is new, and a crowd word up to its ceiling', C.AGES.every(a => a.technique && a.newThis && a.crowd.slice(0, a.ceiling + 1).every(c => c)));
check('W4 halo words cover the range', ['bright', 'a little thinner', 'about half what it was', 'a quarter of what it was', 'almost gone', 'gone'].every((w, i) => M.haloWords([1, 0.7, 0.5, 0.25, 0.1, 0.01][i]) === w));
check('W5 the verdict for the wait-for-the-lithograph path names the turn', /Benjamin dates the turn/.test(M.verdict(M.runSchedule([0, 0, 0, 4, 5, 6])).did));
check('W5b the verdict for the coin path names the coin', /coins at the temple/.test(M.verdict(M.runSchedule([0, 2, 3, 4, 5, 6])).did));
{ const t = M.newGame(); const causes = []; for (let i = 0; i < 6; i++) { M.arrive(t); causes.push(/eyes have changed/.test(M.arrivalLine(t))); M.commit(t, 0); M.next(t); }
  check('W7 the arrival line names the cause once, at the studio, and states the fact elsewhere', causes.filter(Boolean).length === 1 && causes[4] === true, causes.map(c => c ? 'cause' : 'fact').join(' ')); }
check('W8 no announcement says whether the face is hidden or shown', C.AGES.every(a => !/veil|hidden|shown|in the dark/i.test(a.newThis)));
check('W6 the verdict for the always-veiled path says the halo went anyway', /went anyway/.test(M.verdict(M.runSchedule([0, 0, 0, 0, 0, 0])).did));

const head = `Benjamin's Veil — calibration result (${new Date().toISOString().slice(0, 10)})\n${pass} passed, ${fail} failed\n`;
const text = head + out.join('\n') + '\n';
fs.writeFileSync(__dirname + '/calibration-result.txt', text);
console.log(text);
if (fail) process.exit(1);
