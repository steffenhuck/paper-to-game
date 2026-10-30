// Calibration check for Watson's Cardboard (formerly The Other Chain) (build step 1). Tests mechanism.js against the claims of Watson & Crick (1953).
// Run: node calibration.js > calibration-result.txt
const M = require('./mechanism.js'), C = M.CONFIG, K = M.KEYS;
let pass = 0, fail = 0;
const ok = (cond, msg) => { if (cond) pass++; else fail++; console.log((cond ? 'PASS ' : 'FAIL ') + msg); };
const pairsHeld = opts => { const out = []; K.forEach(x => K.forEach(y => { if (M.fit(x, y, opts).held) out.push(x + y); })); return out.sort(); };

console.log('== The pairing (p. 737) ==');
const held = pairsHeld();
ok(JSON.stringify(held) === JSON.stringify(['AT', 'CG', 'GC', 'TA']), 'of 16 ordered pairs exactly A-T, T-A, G-C, C-G hold: ' + held.join(' '));
ok(held.every(p => C.BASES[p[0]].ring !== C.BASES[p[1]].ring), 'every pair that holds is one purine and one pyrimidine');
ok(M.partnerOf('A') === 'T' && M.partnerOf('T') === 'A' && M.partnerOf('G') === 'C' && M.partnerOf('C') === 'G', 'the partner, found by trying all four, is unique: A-T, G-C');
ok(M.fit('A', 'G').fault === 'wide' && M.fit('G', 'G').fault === 'wide', 'two purines are too wide');
ok(M.fit('T', 'C').fault === 'narrow' && M.fit('C', 'C').fault === 'narrow', 'two pyrimidines are too narrow');
ok(M.fit('A', 'C').fault === 'clash' || M.fit('A', 'C').fault === 'loose', 'A-C has the right width but its ends do not grip (' + M.fit('A', 'C').fault + ')');
ok(M.fit('G', 'T').fault === 'clash' || M.fit('G', 'T').fault === 'loose', 'G-T has the right width but its ends do not grip (' + M.fit('G', 'T').fault + ')');

console.log('== Both constraints are needed (robustness of the discovery to the toy) ==');
const widthOnly = []; K.forEach(x => K.forEach(y => { if (M.fit(x, y).width === 'ok') widthOnly.push(x + y); }));
const gripOnly = []; K.forEach(x => K.forEach(y => { const f = M.fit(x, y); if (f.p6 === 'grip' && f.p1 === 'grip') gripOnly.push(x + y); }));
ok(widthOnly.length === 8, 'width alone allows 8 ordered pairs (any purine with any pyrimidine): ' + widthOnly.join(' '));
ok(gripOnly.length === 8, 'grip alone allows 8 ordered pairs: ' + gripOnly.join(' '));
// other length units: any purine length P > pyrimidine length Y, gap P + Y
let lensOk = true;
for (let P = 2; P <= 9; P++) for (let Y = 1; Y < P; Y++) { const h = pairsHeld({ len: { purine: P, pyrimidine: Y }, gap: P + Y }); if (h.join() !== held.join()) lensOk = false; }
ok(lensOk, 'the same two pairs, for every choice of lengths with purine longer than pyrimidine and the gap = their sum (P 2..9)');
// the keto assumption matters, as the paper says
const enolBases = JSON.parse(JSON.stringify(C.BASES)); Object.keys(C.ENOL).forEach(b => Object.assign(enolBases[b], C.ENOL[b]));
const enol = pairsHeld({ bases: enolBases });
ok(enol.join() !== held.join(), 'with G and T in enol forms the pairing changes (' + (enol.join(' ') || 'nothing holds') + '): the result rests on the keto assumption, as the paper states');

console.log('== One chain fixes the other; the sequence is unrestricted; Chargaff (p. 737) ==');
let unique = true, chargaffAll = true; const aShare = []; let atgc = 0;
for (let s = 1; s <= 1000; s++) {
  const g = M.drawGame(s);
  [g.ladder1, g.ladder2].forEach(L => {
    L.forEach(sp => { if (M.partnersOf(sp.given).length !== 1) unique = false; });
    const full = M.complete(L), z = M.zip(L, L.map(sp => M.partnerOf(sp.given)));
    if (z.held !== z.n || !z.chargaff.both) chargaffAll = false;
    const c = M.counts(full); aShare.push((c.A) / (c.A + c.G));
  });
}
ok(unique, 'for every given piece in 1000 games, exactly one piece completes the rung');
ok(chargaffAll, 'every fully held ladder in 1000 games has exactly A = T and G = C ("very close to unity" in real DNA)');
const lo = Math.min(...aShare), hi = Math.max(...aShare);
ok(lo <= 0.2 && hi >= 0.8, 'yet the share of A among purines varies freely across ladders (' + lo.toFixed(2) + ' to ' + hi.toFixed(2) + '): the sequence is not restricted');
// a wrong rung breaks Chargaff in general
const z1 = M.zip([{ given: 'A', side: 'L' }, { given: 'G', side: 'L' }], ['C', 'C']);
ok(!z1.chargaff.AT, 'a ladder with a wrong rung (A-C) need not satisfy A = T');

console.log('== Copying ==');
let copyOk = true;
for (let s = 1; s <= 500; s++) {
  const full = M.complete(M.drawGame(s).ladder2);
  const entries = M.copySpots(full).map(sp => M.partnerOf(sp.template));
  const r = M.scoreCopy(full, entries);
  if (!(r.same[0] && r.same[1] && r.right === r.n)) copyOk = false;
}
ok(copyOk, 'for 500 sequences, each half templating its partner gives two copies identical to the parent');
{ const full = M.complete(M.drawGame(3).ladder2); const e = M.copySpots(full).map(sp => M.partnerOf(sp.template)); e[4] = null; e[7] = e[7] === 'A' ? 'G' : 'A';
  const r = M.scoreCopy(full, e); ok(r.missed === 1 && r.right === r.n - 2 && !(r.same[0] && r.same[1]), 'a missed spot and a wrong piece are counted and break the copy'); }
ok(M.copyMs(0) === C.COPY_MS_FIRST && M.copyMs(C.LADDER2_RUNGS - 1) === C.COPY_MS_LAST, 'the fork speeds up from first to last rung');

console.log('== Helix numbers (p. 737) ==');
ok(Math.abs(360 / C.TWIST_DEG - C.REPEAT_RESIDUES) < 1e-9, '360 / 36 = 10 residues per turn');
ok(Math.abs(C.REPEAT_RESIDUES * C.RISE_A - C.REPEAT_A) < 1e-9, '10 x 3.4 A = 34 A repeat');
ok(M.helixPoint(10).angleDeg === 0 && Math.abs(M.helixPoint(10).zA - 34) < 1e-9, 'the drawing repeats after 10 rungs, 34 A up');
ok(C.LADDER2_RUNGS === C.REPEAT_RESIDUES, 'ladder 2 is one full turn');

console.log('== The draw over 300 seeds ==');
let all4 = true, sides = true, ag = true, distinct = new Set();
for (let s = 1; s <= 300; s++) {
  const g = M.drawGame(s); distinct.add(g.ladder1.map(x => x.given).join('') + g.ladder2.map(x => x.given + x.side).join(''));
  if (!K.every(k => g.ladder1.some(x => x.given === k))) all4 = false;
  const nL = g.ladder2.filter(x => x.side === 'L').length; if (nL < 3 || g.ladder2.length - nL < 3) sides = false;
  const c = M.counts(M.complete(g.ladder2)); if (c.A === c.G) ag = false;
}
ok(all4, 'ladder 1 always shows all four letters');
ok(sides, 'ladder 2 always has at least 3 given pieces on each rail');
ok(ag, 'ladder 2 always ends with unequal A and G');
ok(distinct.size === 300, '300 seeds give 300 different games');

console.log('== Heuristic players, 300 games each (share of ladder rungs that hold) ==');
const strategies = {
  'random piece': (b, r) => K[Math.floor(r() * 4)],
  'like with like': b => b,
  'width only (any opposite length)': (b, r) => { const o = K.filter(y => M.fit(b, y).width === 'ok'); return o[Math.floor(r() * o.length)]; },
  'grip only (any matching ends)': (b, r) => { const o = K.filter(y => { const f = M.fit(b, y); return f.p6 === 'grip' && f.p1 === 'grip'; }); return o[Math.floor(r() * o.length)]; },
  'the rule': b => M.partnerOf(b),
};
const table = [];
Object.entries(strategies).forEach(([name, f]) => {
  const r = M.rng(99); let h = 0, n = 0, perfect2 = 0;
  for (let s = 1; s <= 300; s++) { const g = M.drawGame(s);
    [g.ladder1, g.ladder2].forEach((L, li) => { const z = M.zip(L, L.map(sp => f(sp.given, r))); h += z.held; n += z.n; if (li === 1 && z.held === z.n) perfect2++; }); }
  table.push([name, Math.round(100 * h / n) + '%', Math.round(100 * perfect2 / 300) + '%']);
});
console.log('strategy | rungs held | ladder 2 fully held'); table.forEach(t => console.log(t.join(' | ')));
ok(table[4][1] === '100%' && table.slice(0, 4).every(t => parseInt(t[1]) <= 55), 'only the rule holds everywhere; each half-rule holds about half the rungs');

console.log(`\n${pass} passed, ${fail} failed`);
process.exitCode = fail ? 1 : 0;

// ---- the model on the desk (ladder 2 arrives built wrongly) and the grandchildren (the copies copied again) ----
{ let good = true, tries = 0;
  for (let seed = 1; seed <= 200; seed++) { const g = M.drawGame(seed); const z = M.zip(g.ladder2, g.prefill); tries++;
    const f = { wide: 0, narrow: 0, clash: 0 }; z.rungs.forEach(r => { if (r.fit.fault) f[r.fit.fault] = (f[r.fit.fault] || 0) + 1; });
    if (z.held !== z.n - C.LADDER2_LIKE - C.LADDER2_CLASH) good = false;
    if (f.wide + f.narrow !== C.LADDER2_LIKE || f.clash !== C.LADDER2_CLASH) good = false;
    if (M.zip(g.ladder2, g.ladder2.map(s => M.partnerOf(s.given))).held !== z.n) good = false; }
  ok(good, `the model on the desk: on ${tries} seeds exactly ${C.LADDER2_LIKE} like-with-like faults and ${C.LADDER2_CLASH} clashes, the rest held; mended by the rule it holds throughout`); }
{ const g = M.drawGame(3), full = M.complete(g.ladder2), spots = M.copySpots(full);
  const entries = spots.map((s, k) => k === 2 ? M.clashPartner(s.template) : M.partnerOf(s.template));
  const sc = M.scoreCopy(full, entries), gr = M.copyAgain(sc.copies, full);
  const changed = gr.reduce((n, cp) => n + cp.filter(x => x.changed).length, 0);
  ok(changed === 1 && gr.every(cp => cp.every(x => x.held)), 'grandchildren: one clashing slip in the copy gives exactly one changed rung in the next generation, and every grandchild rung holds');
  const sc2 = M.scoreCopy(full, spots.map(s => M.partnerOf(s.template))), gr2 = M.copyAgain(sc2.copies, full);
  ok(gr2.every(cp => cp.every(x => x.held && !x.changed)), 'grandchildren: a perfect copy breeds a perfect copy'); }
console.log(`\n(appended) ${pass} passed, ${fail} failed`);
if (fail) process.exitCode = 1;
