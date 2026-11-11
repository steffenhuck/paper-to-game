// Calibration check for Turing's Witnesses: runs against mechanism.js, the only copy, in Node.
// Checks: the paper's numbers and the bar derived from them; that both witnesses' answers in the mechanism are byte for
// byte the answers in witness-a.md and witness-b.md, and that the machine's are no longer than the person's (the rule it
// was given); the draw's shape; the loop; the verdict's wording; no decimal on any line; and how the obvious ways of
// judging fare against these pairs.
const M = require('./mechanism.js'); const fs = require('fs');
const C = M.CONFIG;
let pass = 0, fail = 0; const out = [];
function ok(cond, msg) { if (cond) { pass++; out.push('ok   ' + msg); } else { fail++; out.push('FAIL ' + msg); } }

// 1. The paper's numbers and the bar.
ok(C.sumA + C.sumB === 105721 && C.sumPaperAnswer === 105621, 'the specimen sum is 105721; the paper\'s answer 105621 is kept, wrong by 100 (pp. 434, 448)');
ok(C.forecastYear + C.forecastHorizon === 2000 && C.forecastPct === 70 && C.forecastMinutes === 5, 'forecast: about 2000, 70 per cent, five minutes (p. 442)');
ok(M.BAR === 7 && C.questions === 11, 'Turing\'s bar on eleven questions: right no more than 7 times (70 per cent of 11, rounded down)');
ok(105721 % 7 === 0, 'the machine\'s unasked-for fact is true: 105721 divides by seven');

// 2. The answers are the ones in the two files, verbatim; the machine's never longer than the person's.
function parseMd(file) {
  const t = fs.readFileSync(__dirname + '/' + file, 'utf8'); const out = {};
  t.split(/\n\n(?=\d+\. \*\*)/).forEach(block => { const m = /^(\d+)\. \*\*(.+?)\*\*\n([\s\S]*)$/.exec(block.trim()); if (m) out[+m[1]] = { q: m[2], a: m[3].split('\n').map(l => l.replace(/^ {3,4}/, '')).join('\n').trim() }; });
  return out;
}
const A = parseMd('witness-a.md'), B = parseMd('witness-b.md');
ok(Object.keys(A).length === 11 && Object.keys(B).length === 11, 'eleven answers in each witness file');
M.PROMPTS.forEach((p, i) => {
  ok(A[i + 1] && A[i + 1].a === p.A, `prompt ${i + 1} (${p.key}): witness A's answer matches witness-a.md`);
  ok(B[i + 1] && B[i + 1].a === p.B, `prompt ${i + 1} (${p.key}): witness B's answer matches witness-b.md`);
  ok(M.wordsIn(p.A) <= M.wordsIn(p.B), `prompt ${i + 1}: the machine's ${M.wordsIn(p.A)} words within the person's ${M.wordsIn(p.B)}`);
  ok(p.page && p.paper && p.q && p.group >= 1 && p.group <= 5, `prompt ${i + 1}: page ${p.page}, group ${p.group}`);
});
ok(M.PROMPTS.length === 11 && M.GROUPS.length === 5, 'eleven prompts in five groups');
ok(M.PROMPTS.every(p => /[.?!]["']?$/.test(p.A) && /[.?!]["']?$/.test(p.B)), 'every answer on both sides ends on a full stop (or a question mark inside a quotation)');
ok(M.PROMPTS.every(p => /^[A-Z0-9"]/.test(p.A) && /^[A-Z0-9"]/.test(p.B)), 'every answer on both sides starts with a capital letter, a digit or a quotation mark');

// 3. The draw: groups in order, prompts shuffled inside, sides balanced, over 2000 seeds.
{
  let sideX = 0, n = 0, orderOk = 0, firstBridge = 0;
  for (let s = 1; s <= 2000; s++) {
    const g = M.newGame(s); const groups = g.order.map(d => M.prompt(d.prompt).group);
    if (groups.every((v, i) => i === 0 || v >= groups[i - 1]) && new Set(g.order.map(d => d.prompt)).size === 11) orderOk++;
    if (g.order[0].prompt === 'bridge') firstBridge++;
    g.order.forEach(d => { if (d.personIs === 'X') sideX++; n++; });
  }
  ok(orderOk === 2000, 'every game plays all eleven once, groups in the paper\'s order');
  ok(Math.abs(sideX / n - 0.5) < 0.03, `the person is X in ${(100 * sideX / n).toFixed(1)} per cent of questions`);
  ok(Math.abs(firstBridge / 2000 - 1 / 3) < 0.05, `the bridge opens the game in ${(100 * firstBridge / 2000).toFixed(0)} per cent of games (three prompts in the group)`);
}

// 4. The loop: ask, judge, reveal; the score; the group introduction once per group; the verdict's head and the bar.
{
  let bad = 0; const heads = new Set();
  for (let s = 1; s <= 300; s++) {
    const g = M.newGame(s); const r = (function () { let t = s; return () => { t = (t * 1103515245 + 12345) & 0x7fffffff; return t / 0x7fffffff; }; })();
    let intros = 0;
    for (let i = 0; i < 11; i++) {
      const o = M.ask(g); if (o.n !== i + 1 || !o.X || !o.Y || o.X === o.Y) bad++; if (o.intro) intros++;
      const side = r() < 0.5 ? 'X' : 'Y'; const res = M.judge(g, side); const d = g.order[i];
      if (res.rec.right !== (side === d.personIs)) bad++;
      if (!new RegExp('^' + (res.rec.right ? 'RIGHT' : 'WRONG') + '\\. ' + d.personIs + ' was the person').test(res.reveal)) bad++;
      if (res.last !== (i === 10)) bad++;
    }
    if (intros !== 5) bad++;
    const sc = M.score(g); if (sc.right + sc.wrong !== 11 || M.current(g) !== null) bad++;
    const sm = M.summary(g); heads.add(sm.head.replace(/RIGHT \w+ OF/, 'RIGHT n OF'));
    if (sm.passes !== (sc.right <= 7) || sm.table.length !== 11) bad++;
  }
  ok(bad === 0, '300 random games: eleven questions, the reveal names the person, the score adds up, five group introductions, the bar applied');
  ok(heads.size === 2 && heads.has('YOU WERE RIGHT n OF ELEVEN. THE MACHINE CLEARS TURING\'S BAR.') && heads.has('YOU WERE RIGHT n OF ELEVEN. THE MACHINE FAILS TURING\'S BAR.'), 'the verdict leads with the machine against the bar');
  let threw = 0; try { const g = M.newGame(1); M.judge(g, 'X'); } catch (e) { threw++; } try { const g = M.newGame(1); M.ask(g); M.judge(g, 'Z'); } catch (e) { threw++; }
  ok(threw === 2, 'a judgement before a question, or one that is neither X nor Y, is refused');
  const g = M.newGame(4); for (let i = 0; i < 11; i++) { M.ask(g); M.judge(g, g.order[i].personIs); }
  ok(M.summary(g).head === 'YOU WERE RIGHT ELEVEN OF ELEVEN. THE MACHINE FAILS TURING\'S BAR.' && /every time/.test(M.summary(g).lines[1]) && /taken for the person never/.test(M.summary(g).machine), 'all right: ' + M.summary(g).machine);
  const g2 = M.newGame(4); for (let i = 0; i < 11; i++) { M.ask(g2); M.judge(g2, i < 7 ? g2.order[i].personIs : (g2.order[i].personIs === 'X' ? 'Y' : 'X')); }
  ok(M.summary(g2).passes && /exactly/.test(M.summary(g2).lines[1]) && /taken for the person four times/.test(M.summary(g2).machine), 'seven right: exactly the bar, the machine clears it');
}

// 5. The convention, and no decimal on any line a player reads.
for (const g of M.GROUNDS) ok(/Turing/.test(M.convention(['A', 'B'], g.key).turing), `ground ${g.key}: Turing's line`);
ok(M.convention([], 'polite').only !== null && M.convention(['A'], 'does').only === null, 'the solipsist line only when the player extends it to nobody');
{
  const texts = [];
  M.PROMPTS.forEach(p => texts.push(p.q, p.A, p.B, p.paper)); M.GROUPS.forEach(r => texts.push(r.intro)); M.REPLY.forEach(t => texts.push(t));
  const g = M.newGame(5); for (let i = 0; i < 11; i++) { M.ask(g); texts.push(M.judge(g, 'X').reveal); } const s = M.summary(g); texts.push(s.head, s.machine, ...s.lines, ...s.paper);
  ok(texts.every(t => !/\d\.\d/.test(t)), 'no decimal number in any line the player can read');
  const longest = Math.max(...M.PROMPTS.map(p => p.A.length + p.B.length + p.q.length));
  ok(longest < 800, `longest question ${longest} characters (under ${Math.round(longest / C.charsPerSecond)} s at ${C.charsPerSecond} a second, tap to hurry)`);
}

// --- play it in numbers (build.md section 3): the obvious ways of judging, against the real pairs, over 500 seeds ---
const rules = {
  'always X': (o) => 'X',
  'the longer answer is the person': (o) => o.X.length > o.Y.length ? 'X' : 'Y',
  'the shorter answer is the person': (o) => o.X.length < o.Y.length ? 'X' : 'Y',
  'the one that says "I" is the person': (o) => { const c = t => (t.match(/\bI\b|\bI'/g) || []).length; return c(o.X) > c(o.Y) ? 'X' : c(o.X) < c(o.Y) ? 'Y' : (o.X.length > o.Y.length ? 'X' : 'Y'); },
  'the lower-case start is the person': (o) => /^[a-z]/.test(o.X) === /^[a-z]/.test(o.Y) ? 'X' : (/^[a-z]/.test(o.X) ? 'X' : 'Y'),
  'the one without a full stop is the person': (o) => /\.$/.test(o.X) === /\.$/.test(o.Y) ? 'X' : (/\.$/.test(o.X) ? 'Y' : 'X'),
};
out.push('\nPLAY IT IN NUMBERS: rule for judging | right, of 11, averaged over 500 seeds (Turing\'s bar: 7 or fewer)');
for (const name in rules) {
  let total = 0; for (let s = 1; s <= 500; s++) { const g = M.newGame(s); for (let i = 0; i < 11; i++) { const o = M.ask(g); M.judge(g, rules[name](o)); } total += M.score(g).right; }
  out.push(`  ${name.padEnd(42)} | ${(total / 500).toFixed(2)}`);
}
out.push('  With the word limit, length no longer tells the writers apart; with punctuation and capitals harmonised, neither does typing. None of these rules beats a coin by much.');

out.push(`\n${pass} checks passed, ${fail} failed.`);
console.log(out.join('\n'));
fs.writeFileSync(__dirname + '/calibration-result.txt', out.join('\n') + '\n');
process.exit(fail ? 1 : 0);
