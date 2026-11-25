// loop.js — the play loop on placeholder graphics (build.md §4.2): the stranger's session of memo §9 played against the
// mechanism, one page a quarrel (no revision stage), printing after each action what changed and where the player now
// stands. Output in loop-log.txt.
var M = require('./mechanism.js'), C = M.CONFIG;
var g = M.newGame(1), log = []; g.draw = [0, 0, 0]; // phones, pets, homework
function say(s) { log.push(s); console.log(s); }
function show(q, page) { return page.map(function (it) { return q.sides[M.speakerOf(q, it)].name + (it.kind === 'reply' ? ' (reply)' : ' ' + it.form) + ': ' + M.textOf(q, it).slice(0, 40) + '…'; }).join('\n     ') + '\n     [' + M.pageLines(q, page) + ' of ' + q.budget + ' lines; publish ' + (M.canPublish(q, page) ? 'open' : 'closed') + ']'; }
function add(id, kind) { var q = M.quarrel(g), a = M.addItem(q, g.page, id, kind); if (a.error) say('  + ' + id + ' ' + kind + ' → refused: ' + a.error); else { g.page = a.page; say('  + ' + id + ' ' + kind + ' → on the page, ' + a.note); } }
function off(idx) { var q = M.quarrel(g); g.page = M.removeItem(q, g.page, idx); say('  − line ' + idx + ' off'); }
function brief(idx) { var q = M.quarrel(g), t = M.toggleForm(q, g.page, idx); g.page = t.page; say('  ~ line ' + idx + ' → ' + (t.note || t.error)); }
function move(idx, d) { var q = M.quarrel(g); g.page = M.moveItem(q, g.page, idx, d); say('  ↕ line ' + idx + (d < 0 ? ' up' : ' down')); }
function pub() { var q = M.quarrel(g), r = M.publish(g); say('  PUBLISH\n     ' + show(q, r.page)); r.readers.forEach(function (x) { say('     ' + q.sides[x.side].name + '-side ' + x.label + ': ' + x.text); }); say('     GAME: ' + r.statement); }

say('QUARREL 1: ' + M.gameQuarrels(g)[0].question); M.setStance(g, 0); say('  stance: ' + M.gameQuarrels(g)[0].sides[0].stance);
add('b1', 'reason'); add('b1', 'reply'); add('b2', 'reason'); add('p1', 'reason'); add('p1', 'reply'); add('b3', 'reason'); add('b3', 'reply');
brief(2); add('p2', 'reason'); move(0, -1); brief(1);
say('  page:\n     ' + show(M.gameQuarrels(g)[0], g.page)); pub(); M.next(g);
say('QUARREL 2: ' + M.gameQuarrels(g)[1].question); M.setStance(g, 1); say('  stance: ' + M.gameQuarrels(g)[1].sides[1].stance);
add('d1', 'reason'); add('c1', 'reason'); add('d2', 'reason'); add('d1', 'reply'); off(2); add('d1', 'reply'); add('c1', 'reply'); move(3, -1);
pub(); M.next(g);
say('QUARREL 3: ' + M.gameQuarrels(g)[2].question); M.setStance(g, null); say('  stance: no view');
add('s1', 'reason'); add('k1', 'reason'); add('s2', 'reason'); add('k2', 'reason'); brief(0); brief(1); brief(2); brief(3); add('k1', 'reply'); add('s1', 'reply'); add('k2', 'reply'); add('s2', 'reply');
pub(); M.next(g);
var v = M.verdict(g);
say('VERDICT: ' + v.headline); v.quarrels.forEach(function (l) { say('  ' + l); }); v.stood.forEach(function (l) { say('  ' + l); });
require('fs').writeFileSync(__dirname + '/loop-log.txt', log.join('\n') + '\n');
