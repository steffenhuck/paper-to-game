// Fidelity check (build step 1): runs mechanism.js headless against the paper's reported numbers.
// Run: node fidelity.js   (writes nothing; prints PASS/FAIL lines; exit code 1 on any failure)
const M = require('./mechanism.js');
let fails = 0;
const ok = (cond, msg) => { console.log((cond ? 'PASS ' : 'FAIL ') + msg); if (!cond) fails++; };
const near = (a, b, tol) => Math.abs(a - b) <= tol;
const T = id => M.testById(id);

console.log('-- 1. Displayed gaps equal the paper\'s estimates');
ok(T('dgHidden').rows[0].gap === -11, 'giver hidden, most givers: -11 USh (Table 2 col. 1 row 1)');
ok(T('dgHidden').rows[1].gap === -10, 'giver hidden, egoists: -11 + 1 = -10 USh (Table 2 rows 1+3)');
ok(T('dgSeen').rows[0].gap === -19, 'giver seen, most givers: -19 USh (Table 6 col. 1 row 1)');
ok(T('dgSeen').rows[1].gap === 36, 'giver seen, egoists: -19 + 55 = 36 USh (Table 6 rows 1+3)');
ok(near(T('puzzle').rows[0].gap, 0.10, 1e-9), 'puzzle: 0.48 - 0.38 = 0.10 (Table 4)');
ok(near(T('network').rows[0].gap, 0.15, 1e-9), 'network: 0.43 - 0.28 = 0.15 (Table 5)');
ok(near(T('pd').rows[1].gap, 0.29, 1e-9) && near(T('pd').rows[0].gap, 0.11, 1e-9), 'PD no enforcer: egoists +0.29, nonegoists +0.11 (Table 9 row 2)');
ok(near(T('pdEnf').rows[1].gap, -0.02, 1e-9) && near(T('pdEnf').rows[0].gap, 0, 1e-9), 'PD enforcer: egoists -0.02, nonegoists 0.00 (Table 9 row 4)');
ok(near(T('pdEnf').rows[2].own, 0.58, 1e-9) && near(T('pdEnf').rows[2].other, 0.35, 1e-9), 'enforcers punish co-ethnic defectors 0.58 vs 0.35 (p. 723)');
ok(T('survey').dots.every(p => p > 0.10) && T('survey').dots.length === 6, 'survey: six F-tests, all p > .10 (Table 1)');

console.log('-- 2. "clear" flags match the paper\'s significance and wording');
const flags = { dgHidden: ['chance', 'chance'], dgSeen: ['weak', 'clear'], puzzle: ['chance'], network: ['clear'], pd: ['chance', 'clear'], pdEnf: ['chance', 'chance', 'clear'] };
for (const [id, f] of Object.entries(flags)) ok(JSON.stringify(T(id).rows.map(r => r.clear)) === JSON.stringify(f), `${id}: ${f.join(', ')}`);

console.log('-- 3. Derived type averages reproduce the reported overall averages');
for (const [avg, ego, lbl] of [[230, -99, 'hidden'], [226, -106, 'seen']]) {
  const t = M.typeAverages(avg, ego), back = 0.4 * t.ego + 0.6 * t.nonego;
  ok(near(back, avg, 2), `${lbl}: 0.4*${t.ego.toFixed(1)} + 0.6*${t.nonego.toFixed(1)} = ${back.toFixed(1)} (reported ${avg})`);
  ok(near(t.nonego - t.ego, -ego, 1e-9), `${lbl}: egoists give ${-ego} less (Tables 2, 6)`);
}

console.log('-- 4. Bar pairs carry exactly the gap, centred on the base');
for (const t of M.TESTS) for (const r of (t.rows || [])) ok(near(r.own - r.other, r.gap, 1e-9), `${t.id} / ${r.label}: own - other = gap`);

console.log('-- 5. Evidence rules');
const paperCalls = { tastes: 'not', kind: 'not', team: 'not', find: 'guilty', watched: 'guilty' };
const play = (plan, calls) => { const g = M.newGame(); plan.forEach(id => M.runTest(g, id, true)); for (const [s, c] of Object.entries(calls)) M.call(g, s, c); return M.score(g); };
ok(play(['survey', 'dgHidden', 'dgSeen', 'puzzle', 'network'], paperCalls).proven === 5, "paper's route (survey, hidden, seen, puzzle, network) proves 5/5");
const noHidden = play(['survey', 'dgSeen', 'puzzle', 'network', 'pd'], paperCalls);
ok(!noHidden.per.find(p => p.suspect === 'watched').proven && !noHidden.per.find(p => p.suspect === 'kind').proven, 'seen without hidden backs neither "kind: not" nor "watched: guilty"');
const pdRoute = play(['survey', 'puzzle', 'network', 'pd', 'pdEnf'], paperCalls);
ok(pdRoute.per.find(p => p.suspect === 'watched').proven && !pdRoute.per.find(p => p.suspect === 'kind').proven && pdRoute.proven === 4, 'PD route backs "watched" but not "kind": 4/5');
const g6 = M.newGame(); ['survey', 'dgHidden', 'dgSeen', 'puzzle', 'network'].forEach(id => M.runTest(g6, id, true));
ok(M.runTest(g6, 'pd', true) === null && g6.run.length === 5, 'budget: a sixth test is refused');
ok(M.runTest(M.newGame(), 'nope', true) === null, 'unknown test refused');

console.log('-- 6. Scoring: right but unbacked scores 0; "can\'t tell" on teamwork accepted when backed');
const unb = play(['dgSeen'], paperCalls);
ok(unb.proven === 0 && unb.right === 5, 'all five right with only "Giver seen": 0 proven, 5 right');
ok(play(['puzzle'], { team: 'cant' }).per.find(p => p.suspect === 'team').proven, 'team "can\'t tell" + puzzle: proven');
ok(!play([], { team: 'cant' }).per.find(p => p.suspect === 'team').proven, 'team "can\'t tell" without puzzle: not proven');

console.log('-- 7. All 21 five-test plans, scored with the paper\'s calls');
const ids = M.TESTS.map(t => t.id), plans = [];
const rec = (i, cur) => { if (cur.length === 5) return plans.push(cur.slice()); for (let j = i; j < ids.length; j++) { cur.push(ids[j]); rec(j + 1, cur); cur.pop(); } };
rec(0, []);
const dist = {}; plans.forEach(p => { const s = play(p, paperCalls).proven; dist[s] = (dist[s] || 0) + 1; });
ok(plans.length === 21, '21 plans enumerated');
console.log('     proven-calls distribution over plans:', JSON.stringify(dist));
ok(dist[5] === 1, 'exactly one plan proves 5/5 (the paper\'s own route)');
// The discovery is shown, whatever the order: the hidden/seen contrast for egoists is the same numbers in any sequence.
const a = M.newGame(), b = M.newGame();
const ra = [M.runTest(a, 'dgHidden', false), M.runTest(a, 'dgSeen', true)], rb = [M.runTest(b, 'dgSeen', true), M.runTest(b, 'dgHidden', false)];
ok(ra[0].test.rows[1].gap === rb[1].test.rows[1].gap && ra[1].test.rows[1].gap === rb[0].test.rows[1].gap, 'results do not depend on test order');

console.log(fails ? `\n${fails} FAILED` : '\nALL PASS');
process.exit(fails ? 1 : 0);
