// Calibration check for Turing's Witnesses (three modules): runs against mechanism.js, the only copy, in Node.
// Checks: the paper's numbers and the bar; every sentence in the mechanism byte for byte against the four witness files
// (witness-a.md, witness-b.md, novels.md, everyday.md) and the rules each set was written under; the draw; the loop; the
// verdict scale; no decimal on any line; and how the obvious rules of thumb fare, module by module.
const M = require('./mechanism.js'); const fs = require('fs');
const C = M.CONFIG;
let pass = 0, fail = 0; const out = [];
function ok(cond, msg) { if (cond) { pass++; out.push('ok   ' + msg); } else { fail++; out.push('FAIL ' + msg); } }
const endsWell = t => /[.?!]["']?$/.test(t), startsWell = t => /^[A-Z0-9"‘“]/.test(t);

// 1. The paper's numbers, the bar and the scale.
ok(C.sumA + C.sumB === 105721 && C.sumPaperAnswer === 105621, 'the specimen sum is 105721; the paper\'s answer 105621 is kept, wrong by 100 (pp. 434, 448)');
ok(C.forecastYear + C.forecastHorizon === 2000 && C.forecastPct === 70, 'forecast: about 2000, 70 per cent (p. 442)');
ok(M.TOTAL === 15 && M.BAR === 10 && C.perModule === 5 && M.MODULES.length === 3, 'three stages of five: fifteen rounds; Turing\'s bar, the interrogator right 10 times or fewer');
ok(M.SCALE.length === 5 && M.SCALE.map(b => b.minFooled).join(',') === '11,8,5,2,0', 'the scale by times taken for the human: 0-1 failed completely; 2-4 failed; 5-7 passed; 8-10 passed easily; 11-15 the more human');
ok(M.PASS === 5 && M.SCALE[2].minFooled === M.PASS && M.TOTAL - M.BAR === M.PASS, 'the pass band starts exactly at Turing\'s bar: taken for the human five times in fifteen');

// 2. Module 1 against witness-a.md and witness-b.md.
function parseNumbered(file) {
  const t = fs.readFileSync(__dirname + '/' + file, 'utf8').split('## Not used')[0]; const o = {};
  t.split(/\n\n(?=\d+\. \*\*)/).forEach(block => { const m = /^(\d+)\. \*\*(.+?)\*\*\n([\s\S]*)$/.exec(block.trim()); if (m) o[+m[1]] = { head: m[2], body: m[3] }; });
  return o;
}
const A = parseNumbered('witness-a.md'), B = parseNumbered('witness-b.md');
const ans = b => b.split('\n').map(l => l.replace(/^ {3,4}/, '')).join('\n').trim();
ok(Object.keys(A).length === 11 && Object.keys(B).length === 11 && M.M1.length === 11, 'module 1: eleven pairs in the mechanism and in both files');
M.M1.forEach((p, i) => {
  ok(A[i + 1] && ans(A[i + 1].body) === p.A, `module 1, ${i + 1} (${p.key}): the machine's answer matches witness-a.md`);
  ok(B[i + 1] && ans(B[i + 1].body) === p.B, `module 1, ${i + 1} (${p.key}): the person's answer matches witness-b.md`);
  ok(M.wordsIn(p.A) <= M.wordsIn(p.B), `module 1, ${i + 1}: the machine's ${M.wordsIn(p.A)} words within the person's ${M.wordsIn(p.B)}`);
});

// 3. Module 2 against novels.md: the novelist's and the machine's sentence, the year, the length rule.
const N = parseNumbered('novels.md');
ok(Object.keys(N).length === 13 && M.M2.length === 13, 'module 2: thirteen pairs in the mechanism and in novels.md');
M.M2.forEach((p, i) => {
  const nb = N[i + 1].body; const nov = /^\s*Novelist: (.+?) \((.+?), \*(.+?)\*, (\d{4}); Gutenberg (\d+)\)$/m.exec(nb); const mac = /^\s*Machine: (.+)$/m.exec(nb);
  ok(nov && nov[1] === p.B && mac && mac[1] === p.A, `module 2, ${i + 1}: both sentences match novels.md`);
  ok(nov && +nov[4] === p.year && p.who === `${nov[2]}, ${nov[3]}, ${nov[4]}` && +nov[5] === p.gutenberg, `module 2, ${i + 1}: ${p.who}, Gutenberg ${p.gutenberg}`);
  ok(Math.abs(M.wordsIn(p.A) - M.wordsIn(p.B)) <= 4, `module 2, ${i + 1}: lengths ${M.wordsIn(p.B)} (novelist) and ${M.wordsIn(p.A)} (machine), within four words`);
});
ok(M.M2.every(p => p.year >= 1857 && p.year <= 1928), 'module 2: all novels between 1857 and 1928, public domain');

// 4. Module 3 against everyday.md.
const E = parseNumbered('everyday.md');
ok(Object.keys(E).length === 10 && M.M3.length === 10, 'module 3: ten pairs in the mechanism and in everyday.md');
M.M3.forEach((p, i) => {
  const eb = E[i + 1].body; const mac = /^\s*Machine: (.+)$/m.exec(eb); const per = /^\s*Person: (.+)$/m.exec(eb);
  ok(mac && mac[1] === p.A && per && per[1] === p.B && E[i + 1].head.replace(/\.$/, '') === p.topic, `module 3, ${i + 1} (${p.topic}): both lines match everyday.md`);
});

// 5. Every sentence starts with a capital (or a digit or a quotation mark) and ends on a full stop.
{
  const all = [].concat(M.M1, M.M2, M.M3); let bad = [];
  all.forEach(p => { [p.A, p.B].forEach(t => { if (!endsWell(t) || !startsWell(t)) bad.push(t.slice(0, 30)); }); });
  ok(bad.length === 0, 'every sentence on both sides starts with a capital and ends on a full stop' + (bad.length ? ': ' + bad.join(' | ') : ''));
}

// 6. The draw over 2000 seeds: modules in order, five distinct items each, every item drawn, sides balanced.
{
  let x = 0, n = 0, orderOk = 0; const seen = {};
  for (let s = 1; s <= 2000; s++) {
    const g = M.newGame(s); const mods = g.order.map(d => d.module);
    const distinct = [1, 2, 3].every(m => new Set(g.order.filter(d => d.module === m).map(d => d.item)).size === 5);
    if (mods.join('') === '111112222233333' && distinct) orderOk++;
    g.order.forEach(d => { seen[d.module + ':' + d.item] = 1; if (d.personIs === 'X') x++; n++; });
  }
  ok(orderOk === 2000, 'every game: modules 1, 2, 3 in order, five distinct pairs from each');
  ok(Object.keys(seen).length === 34, 'every one of the 34 pairs is drawn in 2000 games');
  ok(Math.abs(x / n - 0.5) < 0.03, `the person is X in ${(100 * x / n).toFixed(1)} per cent of questions`);
}

// 7. The loop: ask, judge, reveal; the score; the module introduction once per module; the verdict and its band.
{
  let bad = 0; const heads = new Set();
  for (let s = 1; s <= 300; s++) {
    const g = M.newGame(s); const r = (function () { let t = s; return () => { t = (t * 1103515245 + 12345) & 0x7fffffff; return t / 0x7fffffff; }; })();
    let intros = 0;
    for (let i = 0; i < 15; i++) {
      const o = M.ask(g); if (o.n !== i + 1 || !o.X || !o.Y || o.X === o.Y || o.inModule !== (i % 5) + 1) bad++; if (o.intro) intros++;
      const side = r() < 0.5 ? 'X' : 'Y'; const res = M.judge(g, side); const d = g.order[i];
      if (res.rec.right !== (side === d.personIs)) bad++;
      if (!new RegExp('^' + (res.rec.right ? 'RIGHT' : 'WRONG') + '\\. ' + d.personIs + ' was the human').test(res.reveal)) bad++;
      if (d.module === 2 && !/was the human: .*, \d{4}\. [XY] was the machine\.$/.test(res.reveal)) bad++;
      if (res.last !== (i === 14)) bad++;
    }
    if (intros !== 3) bad++;
    const sc = M.score(g); if (sc.right + sc.wrong !== 15 || M.current(g) !== null || sc.byModule.reduce((a, m) => a + m.fooled, 0) !== sc.fooled) bad++;
    const sm = M.summary(g); heads.add(sm.head); if (!/^On Turing's questions it managed \d of 5, on the novels \d of 5, in the diaries \d of 5\.$/.test(sm.stages) || !/^Going by your answers, in 2026 machines are /.test(sm.relative)) bad++;
  }
  ok(bad === 0, '300 random games: fifteen rounds, three stage lines, the reveal names the human (and the novel), the stage and best-worst lines well formed');
  ok(heads.size >= 3, `the verdict bands reached by random play: ${[...heads].join(' / ')}`);
  let threw = 0; try { const g = M.newGame(1); M.judge(g, 'X'); } catch (e) { threw++; } try { const g = M.newGame(1); M.ask(g); M.judge(g, 'Z'); } catch (e) { threw++; }
  ok(threw === 2, 'a judgement before a question, or one that is neither X nor Y, is refused');
  const play = (k) => { const g = M.newGame(9); for (let i = 0; i < 15; i++) { M.ask(g); M.judge(g, i < k ? g.order[i].personIs : (g.order[i].personIs === 'X' ? 'Y' : 'X')); } return M.summary(g); };
  ok(play(15).head === 'THE MACHINE FAILED COMPLETELY.' && play(13).head === 'THE MACHINE FAILED TURING\'S TEST.' && play(10).head === 'THE MACHINE PASSED TURING\'S TEST.' && play(7).head === 'THE MACHINE PASSED EASILY.' && play(4).head === 'THE MACHINE WAS THE MORE HUMAN.', 'the five bands at 15, 13, 10, 7 and 4 right (0, 2, 5, 8 and 11 times taken for the human)');
  ok(play(10).machine === 'The machine was taken for the human five times in fifteen.' && /This one managed five\.$/.test(play(10).forecast) && /at least five times in fifteen/.test(play(10).forecast), 'the machine\'s score and the forecast line in words');
  { const g = M.newGame(9); for (let i = 0; i < 15; i++) { M.ask(g); M.judge(g, g.order[i].module === 3 ? (g.order[i].personIs === 'X' ? 'Y' : 'X') : g.order[i].personIs); } ok(M.summary(g).relative === 'Going by your answers, in 2026 machines are best at diaries and worst at Turing\'s questions and novels.', 'best and worst with a tie: ' + M.summary(g).relative); }
}

// 8. No decimal on any line a player reads.
{
  const texts = []; [].concat(M.M1, M.M2, M.M3).forEach(p => texts.push(p.A, p.B)); M.MODULES.forEach(m => texts.push(m.intro)); M.SCALE.forEach(b => texts.push(b.head, b.line)); texts.push(M.LAST);
  const g = M.newGame(5); for (let i = 0; i < 15; i++) { texts.push(M.ask(g).q); texts.push(M.judge(g, 'X').reveal); } const s = M.summary(g); texts.push(s.head, s.band, s.machine, s.stages, s.relative, s.forecast);
  ok(texts.every(t => !/\d\.\d/.test(t)), 'no decimal number in any line the player can read');
}

// --- play it in numbers (build.md section 3): the obvious rules of thumb, module by module, over 500 seeds ---
const rules = {
  'always X': (o) => 'X',
  'the longer is the human': (o) => o.X.length > o.Y.length ? 'X' : 'Y',
  'the shorter is the human': (o) => o.X.length < o.Y.length ? 'X' : 'Y',
  'the one that says "I" is the human': (o) => { const c = t => (t.match(/\bI\b|\bI'/g) || []).length; return c(o.X) > c(o.Y) ? 'X' : c(o.X) < c(o.Y) ? 'Y' : (o.X.length > o.Y.length ? 'X' : 'Y'); },
  'the one with two sentences is the human': (o) => { const c = t => (t.match(/[.?!]/g) || []).length; return c(o.X) > c(o.Y) ? 'X' : c(o.X) < c(o.Y) ? 'Y' : (o.X.length > o.Y.length ? 'X' : 'Y'); },
};
out.push('\nPLAY IT IN NUMBERS: rule for judging | right of 5 in Turing's questions / novels / diaries | of 15, averaged over 500 seeds (bar 10)');
for (const name in rules) {
  const tot = [0, 0, 0]; let all = 0;
  for (let s = 1; s <= 500; s++) { const g = M.newGame(s); for (let i = 0; i < 15; i++) { const o = M.ask(g); const r = M.judge(g, rules[name](o)); if (r.rec.right) { tot[o.module - 1]++; all++; } } }
  out.push(`  ${name.padEnd(42)} | ${tot.map(t => (t / 500).toFixed(2)).join(' / ')} | ${(all / 500).toFixed(2)}`);
}
out.push('  Turing\'s questions are balanced by the word limit; in the novels the novelist tends to write the longer sentence; in the diaries the human wrote in two sentences where the machine wrote one. The About page names both.');

out.push(`\n${pass} checks passed, ${fail} failed.`);
console.log(out.join('\n'));
fs.writeFileSync(__dirname + '/calibration-result.txt', out.join('\n') + '\n');
process.exit(fail ? 1 : 0);
