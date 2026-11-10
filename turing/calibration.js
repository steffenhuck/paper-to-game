// Calibration check for Turing's Witnesses (rebuild): runs against mechanism.js, the only copy, in Node.
// The mechanism is a toy from an argument, so the checks are: the paper's numbers; that the two witnesses' answers in the
// mechanism are byte-for-byte the answers in witness-a.md and witness-b.md (the honesty of the game rests on this); the
// draw's shape over many seeds; the play loop; the verdict's wording; and no decimal on any line.
const M = require('./mechanism.js'); const fs = require('fs');
const C = M.CONFIG;
let pass = 0, fail = 0; const out = [];
function ok(cond, msg) { if (cond) { pass++; out.push('ok   ' + msg); } else { fail++; out.push('FAIL ' + msg); } }

// 1. The paper's numbers.
ok(C.sumA + C.sumB === 105721 && C.sumPaperAnswer === 105621, 'the specimen sum is 105721; the paper\'s answer 105621 is kept, wrong by 100 (pp. 434, 448)');
ok(C.forecastYear + C.forecastHorizon === 2000 && C.forecastPct === 70 && C.forecastMinutes === 5, 'forecast: about 2000, 70 per cent, five minutes (p. 442)');

// 2. The answers are the ones in the two files, verbatim.
function parseMd(file) {
  const t = fs.readFileSync(__dirname + '/' + file, 'utf8');
  const out = {};
  t.split(/\n\n(?=\d+\. \*\*)/).forEach(block => { const m = /^(\d+)\. \*\*(.+?)\*\*\n([\s\S]*)$/.exec(block.trim()); if (m) out[+m[1]] = { q: m[2], a: m[3].split('\n').map(l => l.replace(/^ {3,4}/, '')).join('\n').trim() }; });
  return out;
}
const A = parseMd('witness-a.md'), B = parseMd('witness-b.md');
ok(Object.keys(A).length === 11 && Object.keys(B).length === 11, 'eleven answers in each witness file');
M.PROMPTS.forEach((p, i) => {
  ok(A[i + 1] && A[i + 1].a === p.A, `prompt ${i + 1} (${p.key}): witness A's answer matches witness-a.md`);
  ok(B[i + 1] && B[i + 1].a === p.B, `prompt ${i + 1} (${p.key}): witness B's answer matches witness-b.md`);
  ok(p.page && p.paper && p.q && [1, 2, 3, 4, 5].indexOf(p.round) >= 0, `prompt ${i + 1}: page ${p.page}, round ${p.round}`);
});
ok(M.PROMPTS.length === 11 && M.ROUNDS.length === 5 && M.CRITERIA.length === 5 && M.BEYOND.length === 2, 'eleven prompts, five rounds, five criteria, two checks beyond words');
ok(M.ROUNDS.every(r => M.PROMPTS.some(p => p.round === r.n)), 'every round has at least one prompt');
ok(M.PROMPTS.find(p => p.key === 'sum').A.indexOf('105721') === 0 && /105,000/.test(M.PROMPTS.find(p => p.key === 'sum').B), 'the sum: the machine right, the person wrong, both as written');

// 3. The draw: over 2000 seeds every prompt appears, the side is balanced, and a game is always five rounds.
{
  const seen = {}; let x = 0, n = 0;
  for (let s = 1; s <= 2000; s++) { const g = M.newGame(s); g.draws.forEach(d => { seen[d.prompt] = (seen[d.prompt] || 0) + 1; if (d.machineIs === 'X') x++; n++; }); }
  ok(M.PROMPTS.every(p => seen[p.key] > 0), 'every prompt is drawn in 2000 games (least: ' + Math.min(...M.PROMPTS.map(p => seen[p.key])) + ')');
  ok(Math.abs(x / n - 0.5) < 0.03, `the machine is X in ${(100 * x / n).toFixed(1)} per cent of rounds`);
  const r1 = M.PROMPTS.filter(p => p.round === 1).map(p => seen[p.key]); ok(Math.max(...r1) / Math.min(...r1) < 1.3, 'round 1 draws its three prompts about evenly: ' + r1.join(', '));
}

// 4. The loop: commit, pick, reveal; counts add up; the reveal names who was who; beyond words runs both checks, the reply once.
{
  let bad = 0;
  for (let s = 1; s <= 300; s++) {
    const g = M.newGame(s); const r = (function () { let t = s; return () => { t = (t * 1103515245 + 12345) & 0x7fffffff; return t / 0x7fffffff; }; })();
    for (let i = 0; i < 5; i++) {
      const o = M.ask(g, M.CRITERIA[Math.floor(r() * 5)].key); if (o.round !== i + 1 || !o.X || !o.Y || o.X === o.Y) bad++;
      const res = M.pick(g, r() < 0.5 ? 'X' : 'Y'); const d = g.draws[i];
      if ((res.rec.pick === d.machineIs) !== (res.rec.found === 'machine')) bad++;
      if (!new RegExp(d.machineIs + ' was the machine').test(res.lines[0])) bad++;
      if (res.last !== (i === 4)) bad++;
    }
    const k = M.counts(g); if (k.machine + k.person !== 5 || M.current(g) !== null) bad++;
    const b1 = M.beyond(g, s % 2 ? 'open' : 'be'), b2 = M.beyond(g, s % 2 ? 'be' : 'open');
    if (!b2.done || b1.done) bad++;
    if (((b1.key === 'be' ? b1 : b2).reply || []).length !== 2) bad++;
    if ((b1.key === 'be' ? b2 : b1).reply !== null) bad++;
    const sm = M.summary(g); if (!/^FIVE QUESTIONS\. YOU FOUND THE MIND IN THE MACHINE .* AND IN THE PERSON .*\.$/.test(sm.head) || sm.table.length !== 5) bad++;
  }
  ok(bad === 0, '300 random games: five rounds, the reveal names who was who, counts add to five, both checks beyond words run, the reply once');
  let threw = 0; try { const g = M.newGame(1); M.pick(g, 'X'); } catch (e) { threw++; } try { const g = M.newGame(1); M.ask(g, 'feel'); M.pick(g, 'Z'); } catch (e) { threw++; } try { const g = M.newGame(1); M.beyond(g, 'open'); M.beyond(g, 'open'); } catch (e) { threw++; }
  ok(threw === 3, 'a pick before a question, a pick that is neither X nor Y, and a repeated check are refused');
}

// 5. The verdict's wording, per criterion, in words.
{
  const g = M.newGame(7); ['feel', 'feel', 'sound', 'feel', 'wrong'].forEach((c, i) => { M.ask(g, c); M.pick(g, g.draws[i].machineIs); });
  const s = M.summary(g);
  ok(s.head === 'FIVE QUESTIONS. YOU FOUND THE MIND IN THE MACHINE FIVE TIMES AND IN THE PERSON NEVER.', 'all five picks on the machine: ' + s.head);
  ok(s.did[0] === 'You went by a feeling in it, three times: it led you to the machine every time.' && s.did.some(d => /it sounds like a person, once: it led you to the machine\./.test(d)), 'criterion lines: ' + s.did[0]);
  const g2 = M.newGame(7); ['feel', 'feel', 'feel', 'feel', 'feel'].forEach((c, i) => { M.ask(g2, c); M.pick(g2, i < 2 ? g2.draws[i].machineIs : (g2.draws[i].machineIs === 'X' ? 'Y' : 'X')); });
  ok(M.summary(g2).head.indexOf('IN THE MACHINE TWICE AND IN THE PERSON THREE TIMES') > 0 && /twice to the machine and three times to the person/.test(M.summary(g2).did[0]), 'mixed picks: ' + M.summary(g2).did[0]);
}

// 6. The convention, and no decimal on any line a player reads.
for (const g of M.GROUNDS) ok(/Turing/.test(M.convention(['A', 'B'], g.key).turing), `ground ${g.key}: Turing's line`);
ok(M.convention([], 'polite').only !== null && M.convention(['A'], 'does').only === null, 'the solipsist line only when the player extends it to nobody');
{
  const texts = [];
  M.PROMPTS.forEach(p => texts.push(p.q, p.A, p.B, p.paper)); M.ROUNDS.forEach(r => texts.push(r.intro)); M.BEYOND.forEach(b => b.lines.forEach(l => texts.push(l))); M.REPLY.forEach(t => texts.push(t));
  const g = M.newGame(5); for (let i = 0; i < 5; i++) { M.ask(g, 'feel'); M.pick(g, 'X').lines.forEach(l => texts.push(l)); } const s = M.summary(g); texts.push(s.head, ...s.did, ...s.paper, ...s.means);
  ok(texts.every(t => !/\d\.\d/.test(t)), 'no decimal number in any line the player can read');
  const longest = Math.max(...M.PROMPTS.map(p => p.A.length + p.B.length + p.q.length));
  ok(longest < 900, `longest round ${longest} characters (under ${Math.round(longest / C.charsPerSecond)} s at ${C.charsPerSecond} a second, tap to hurry)`);
}

// --- play it in numbers (build.md section 3): the obvious ways of picking, against the real pairs, over 500 seeds ---
const rules = {
  'always X': (o) => 'X',
  'the longer answer': (o) => o.X.length >= o.Y.length ? 'X' : 'Y',
  'the shorter answer': (o) => o.X.length < o.Y.length ? 'X' : 'Y',
  'the one that says "I"': (o) => { const c = t => (t.match(/\bI\b/g) || []).length; return c(o.X) >= c(o.Y) ? 'X' : 'Y'; },
  'the one with a line break': (o) => (o.X.indexOf('\n') >= 0) === (o.Y.indexOf('\n') >= 0) ? (o.X.length >= o.Y.length ? 'X' : 'Y') : (o.X.indexOf('\n') >= 0 ? 'X' : 'Y'),
};
out.push('\nPLAY IT IN NUMBERS: rule for picking | mind found in the machine, of 5, averaged over 500 seeds');
for (const name in rules) {
  let total = 0; for (let s = 1; s <= 500; s++) { const g = M.newGame(s); for (let i = 0; i < 5; i++) { const o = M.ask(g, 'feel'); M.pick(g, rules[name](o)); } total += M.counts(g).machine; }
  out.push(`  ${name.padEnd(28)} | ${(total / 500).toFixed(2)}`);
}
out.push('  Length is the one reliable tell in these pairs (the machine wrote more), and length is not a mind; the verdict says what the player went by, not how often they were right.');

out.push(`\n${pass} checks passed, ${fail} failed.`);
console.log(out.join('\n'));
fs.writeFileSync(__dirname + '/calibration-result.txt', out.join('\n') + '\n');
process.exit(fail ? 1 : 0);
