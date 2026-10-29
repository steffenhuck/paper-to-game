// Live from Brussels — calibration check. Runs against mechanism.js, the same file the game embeds.
// node calibration.js  > calibration-result.txt
'use strict';
const M = require('./mechanism.js');
const C = M.CONFIG, P = C.sources;
let fails = 0;
const check = (ok, msg) => { console.log((ok ? 'PASS ' : 'FAIL ') + msg); if (!ok) fails++; };
const info = msg => console.log('INFO ' + msg);
const f1 = x => x.toFixed(1), f2 = x => x.toFixed(2), f3 = x => x.toFixed(3);

console.log('== 1. The formula ==');
const cat = M.flesch('The cat sat on the mat.').score;
check(Math.abs(cat - 116.1) < 0.1, '"The cat sat on the mat." = ' + f2(cat) + ' (published 116.1)');
const platy = M.flesch('The Aus·tral·i·an plat·y·pus is seem·ing·ly a hy·brid of a mam·mal and rep·til·i·an crea·ture.').score;
check(Math.abs(platy - 24.4) < 0.1, 'platypus sentence = ' + f2(platy) + ' (published 24.4, Wikipedia "Flesch–Kincaid readability tests")');

console.log('\n== 2. The paper\'s values reproduce its verbal claims (pp. 692-3) ==');
const ms = ['reading', 'familiar', 'verbs'];
check(ms.every(m => P.comm[m] < P.uk[m] && P.comm[m] < P.ire[m]), 'Commission below both governments on all three measures');
check(ms.every(m => P.comm[m] < P.broad[m] && P.comm[m] < P.tabloid[m]), 'Commission below broadsheets and tabloids on all three');
check(P.comm.familiar < P.polsci.familiar, 'Commission below political scientists on familiar words ("performs even worse")');
check(['reading', 'verbs'].every(m => Math.abs(P.comm[m] - P.polsci[m]) < Math.abs(P.comm[m] - P.broad[m])), 'Commission closer to political scientists than to broadsheets on reading ease and verbs');
check(P.comm.reading < 30 && P.uk.reading >= 30, 'Commission in Flesch\'s graduate band (<30), UK above it ("university graduates" vs "high school") — ' + P.comm.reading + ' vs ' + P.uk.reading);
const tv = Object.values(C.trend), tmin = Math.min(...tv), tmax = Math.max(...tv);
check(tmax - tmin < 4, 'yearly series flat: range ' + f1(tmax - tmin) + ' points, 1985 ' + C.trend[1985] + ', 2020 ' + C.trend[2020] + ' ("hardly changed", "stagnate")');
check(tmax < P.ire.reading, 'in no year does the Commission reach the Irish government average (' + tmax + ' < ' + P.ire.reading + ')');

console.log('\n== 3. The scripts score what the paper measured ==');
const ids = Object.keys(M.SCRIPTS).filter(id => M.SCRIPTS[id].target != null);
const hand = {}, heur = {};
for (const id of ids) {
  const w = M.scriptWords(id); hand[id] = M.fleschOf(w); heur[id] = M.fleschOf(w, M.heuristicSyllables);
  const t = M.SCRIPTS[id].target;
  check(Math.abs(hand[id].score - t) <= C.scriptTolerance, id + ': hand-counted ' + f1(hand[id].score) + ' vs paper ' + t +
    ' (' + hand[id].words + ' words, ' + f1(hand[id].wps) + ' per sentence, ' + f2(hand[id].spw) + ' syllables per word)');
  info(id + ': a plain vowel-group counter gives ' + f1(heur[id].score) + '; it disagrees on ' +
    w.filter(x => M.heuristicSyllables(x.word) !== x.syl).map(x => x.parts.join('·') + ' (' + M.heuristicSyllables(x.word) + ')').join(', '));
}
const mad = ids.reduce((s, id) => s + Math.abs(heur[id].score - M.SCRIPTS[id].target), 0) / ids.length;
check(mad < 4, 'with the plain counter instead of the hand count, scripts stay on average within ' + f1(mad) + ' points of the paper (< 4)');
const order = ['tabloid', 'uk', 'comm', 'polsci'];
for (const [name, sc] of [['hand', hand], ['heuristic', heur]])
  check(order.every((id, i) => i === 0 || sc[order[i - 1]].score > sc[id].score), 'paper order tabloid > UK > Brussels > professor kept by the ' + name + ' count');
info('encore (ours): ' + f1(M.flesch(M.SCRIPTS.plain.text).score));

console.log('\n== 4. Game difficulty on the scripts follows the paper ==');
const mean = (id, sk, opt, from = 1, n = 300) => { const w = M.scriptWords(id); let s = 0; for (let i = from; i < from + n; i++) s += M.modelShare(w, M.SKILLS[sk], i, opt); return s / n; };
const share = {};
for (const sk of Object.keys(M.SKILLS)) {
  share[sk] = {}; for (const id of Object.keys(M.SCRIPTS)) share[sk][id] = mean(id, sk);
  info(sk + ': ' + Object.keys(M.SCRIPTS).map(id => id + ' ' + f2(share[sk][id])).join('  '));
}
for (const sk of ['steady', 'good']) {
  const s = share[sk];
  check(s.tabloid > s.uk && s.uk > s.comm, sk + ': tabloid > UK > Brussels (' + [s.tabloid, s.uk, s.comm].map(f2).join(' > ') + ')');
  check(s.polsci <= s.comm + 0.03, sk + ': professor no easier than Brussels, within noise (' + f2(s.polsci) + ' vs ' + f2(s.comm) + ')');
  check(Math.abs(s.comm - s.polsci) < Math.abs(s.comm - s.tabloid), sk + ': Brussels closer to the professor than to the tabloid');
  const gap = s.uk - s.comm;
  for (const y of M.ARCHIVE) check(Math.abs(s[y] - s.comm) < gap, sk + ': archive ' + y + ' closer to Brussels than the UK is (' + f2(s[y]) + ' vs ' + f2(s.comm) + '; UK-Brussels gap ' + f2(gap) + ')');
  for (const b of [1, 101, 201]) {
    const t = mean('tabloid', sk, {}, b, 100), u = mean('uk', sk, {}, b, 100), c = mean('comm', sk, {}, b, 100);
    check(t > u && u > c, sk + ', seeds ' + b + '-' + (b + 99) + ': tabloid > UK > Brussels (' + [t, u, c].map(f2).join(' > ') + ')');
  }
}
{ const d = Object.fromEntries(Object.keys(M.SCRIPTS).map(id => [id, M.demand(id)]));
  info('taps a second each script asks for (skill plays no part): ' + Object.entries(d).map(([k, v]) => k + ' ' + f2(v)).join('  '));
  check(d.tabloid < d.uk && d.uk < d.comm && d.comm < d.polsci, 'drum speed asked: tabloid < UK < Brussels < professor');
  check(M.ARCHIVE.every(y => Math.abs(d[y] / d.comm - 1) < 0.07), 'drum speed asked: every archive year within 7% of Brussels (the yearly line is flat)'); }
{ const s = share.drummer; check(s.tabloid > s.comm && s.polsci < s.tabloid, 'drummer (two thumbs, near the ceiling): tabloid still easiest (' + f2(s.tabloid) + ' vs Brussels ' + f2(s.comm) + ', professor ' + f2(s.polsci) + ')'); }
info('drummer: UK ' + f2(share.drummer.uk) + ' vs Brussels ' + f2(share.drummer.comm) + ' — at two-thumb speed the government and Brussels scripts are about level; only the slower tappers feel that gap.');

console.log('\n== 5. Robustness to the split between long words and long sentences (synthetic texts) ==');
function poisson(r, l) { let L = Math.exp(-l), k = 0, p = 1; do { k++; p *= r(); } while (p > L); return k - 1; }
function synth(W, S, seed, n = 240) {
  const r = M.rng(seed), ws = [];
  while (ws.length < n) for (let k = 0; k < W; k++) ws.push({ word: 'x', syl: Math.min(7, 1 + poisson(r, S - 1)), stop: k === W - 1 });
  return ws;
}
const synShare = (W, S, sk, opt, seeds = 30) => { let s = 0; for (let i = 1; i <= seeds; i++) s += M.modelShare(synth(W, S, 1000 * i + W), M.SKILLS[sk], i, opt); return s / seeds; };
const sOf = (W, F) => (C.flesch.a - C.flesch.b * W - F) / C.flesch.c;
for (const sk of ['steady', 'good']) {
  // the trade-off the game makes between sentence length and word length
  const X = [], Y = [];
  for (const W of [14, 18, 22, 26, 30]) for (const S of [1.4, 1.55, 1.7, 1.85, 2.0]) { X.push([1, W, S]); Y.push(synShare(W, S, sk, {}, 15)); }
  const A = [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]];
  X.forEach((x, i) => { for (let a = 0; a < 3; a++) { A[a][3] += x[a] * Y[i]; for (let b = 0; b < 3; b++) A[a][b] += x[a] * x[b]; } });
  for (let i = 0; i < 3; i++) { const p = A[i][i]; for (let j = i; j < 4; j++) A[i][j] /= p; for (let k = 0; k < 3; k++) if (k !== i) { const f = A[k][i]; for (let j = i; j < 4; j++) A[k][j] -= f * A[i][j]; } }
  const bW = A[1][3], bS = A[2][3], ratio = bW / bS;
  check(bW < 0 && bS < 0, sk + ': longer sentences and longer words both cost words got out (per word of sentence ' + f3(bW) + ', per syllable per word ' + f3(bS) + ')');
  check(ratio > 0.006 && ratio < 0.024, sk + ': one word of sentence length weighs ' + f3(ratio) + ' syllables per word in the game; in the formula 1.015/84.6 = 0.012 (accept within a factor of two)');
  // iso-score lines: does the ordering survive any split, for texts whose sentences differ by up to 6 words?
  const pairs = [['tabloid', 'uk'], ['uk', 'comm'], ['tabloid', 'comm'], ['comm', 'polsci']];
  const Ws = [14, 17, 20, 23, 26, 29, 32];
  const cache = {}; const sh = (src, W) => (cache[src + W] ??= synShare(W, sOf(W, P[src].reading), sk, {}, 20));
  for (const [easy, hard] of pairs) {
    let worst = Infinity, at = '';
    for (const We of Ws) for (const Wh of Ws) if (Math.abs(We - Wh) <= 6) {
      const d = sh(easy, We) - sh(hard, Wh);
      if (d < worst) { worst = d; at = 'W ' + We + ' vs ' + Wh; }
    }
    check(worst > 0, sk + ': ' + easy + ' easier than ' + hard + ' at every split (smallest margin ' + f3(worst) + ', ' + at + ')');
  }
  info(sk + ' along the iso-score lines (W 14..32): ' + ['tabloid', 'uk', 'comm', 'polsci'].map(s => s + ' ' + Ws.map(W => f2(sh(s, W))).join('/')).join('  '));
}

console.log('\n== 6. Robustness to our design choices ==');
const variants = { 'beat -15%': { beat: C.beat * 0.85 }, 'beat +15%': { beat: C.beat * 1.15 }, 'no rush': { rush: 0 }, 'exact taps only': { extraTaps: 0 }, 'lag 0.1 s': { lag: 0.1 } };
for (const [name, opt] of Object.entries(variants)) for (const sk of ['steady', 'good']) {
  const t = mean('tabloid', sk, opt, 1, 200), u = mean('uk', sk, opt, 1, 200), c = mean('comm', sk, opt, 1, 200), p = mean('polsci', sk, opt, 1, 200);
  check(t > u && u > c && p <= c + 0.04, name + ', ' + sk + ': tabloid > UK > Brussels, professor not easier (' + [t, u, c, p].map(f2).join(' / ') + ')');
}

console.log('\n== 7. Balance ==');
check(share.good.tabloid >= 0.9, 'a practised one-thumb player gets ≥90% of the tabloid out (' + f2(share.good.tabloid) + ')');
check(share.steady.tabloid - share.steady.comm >= 0.15, 'a careful one-thumb player loses ≥15 points more on Brussels than on the tabloid (' + f2(share.steady.tabloid - share.steady.comm) + ')');
check(share.good.tabloid - share.good.comm >= 0.1, 'a practised one-thumb player loses ≥10 points more on Brussels (' + f2(share.good.tabloid - share.good.comm) + ')');
check(share.drummer.polsci >= 0.6, 'nothing is impossible: two thumbs get ≥60% of the professor out (' + f2(share.drummer.polsci) + ')');
check(share.steady.plain >= share.steady.tabloid - 0.02, 'the encore is as easy as the tabloid (' + f2(share.steady.plain) + ')');
const durs = Object.keys(M.SCRIPTS).map(id => M.timeline(M.scriptWords(id)).end);
info('item length ' + f1(Math.min(...durs)) + '–' + f1(Math.max(...durs)) + ' s; five readings ≈ ' + f1(durs.slice(0, 5).reduce((a, b) => a + b, 0) / 60) + ' min');

console.log('\n== 8. Judge and words ==');
{ const w = M.scriptWords('tabloid'), tl = M.timeline(w);
  const perfect = []; tl.slots.forEach((s, i) => { for (let k = 0; k < w[i].syl; k++) perfect.push(s.start + 0.05 + k * s.dur * 0.8 / w[i].syl); });
  check(M.judge('tabloid', perfect).share === 1, 'evenly spaced taps inside every beat get every word out');
  check(M.judge('tabloid', []).share === 0, 'no taps, no words');
  const mash = []; for (let t = 0; t < tl.end; t += 0.1) mash.push(t);
  check(M.judge('comm', mash).share < 0.2, 'mashing ten taps a second gets almost nothing out (' + f2(M.judge('comm', mash).share) + ')'); }
for (const x of [1, 0.9, 0.8, 0.7, 0.6, 0.45]) info('share ' + x + ': "' + M.itemLine(x) + '"');
for (const id of ['tabloid', 'uk', 'comm', 'polsci']) info(id + ' why: "' + M.whyLine(id) + '"');
info('verdict (typical): ' + M.verdict({ tabloid: 0.92, uk: 0.85, comm: 0.72, polsci: 0.68, archive: { year: 2020, share: 0.74 } }).join(' | '));

console.log('\n' + (fails ? fails + ' FAILED' : 'ALL PASS'));
process.exitCode = fails ? 1 : 0;
