// Headless play of the loop (build.md sections 3 and 4.2). Prints, after each action, what changed and where the player stands;
// then the table of obvious strategies. Usage: node loop.js [actions for uranium, e.g. 56,43,hold] [actions for thorium, e.g. 56]
var m = require('./mechanism.js'), C = m.CONFIG, U = C.URANIUM, TH = C.THORIUM;
function parse(s, dflt) { return (s || dflt).split(',').map(function (x) { return x === 'hold' ? { kind: 'hold' } : { kind: 'split', Z1: Number(x) }; }); }
var actsU = parse(process.argv[2], '56,43,hold'), actsT = parse(process.argv[3], '56');
function say(s) { console.log(s); }
function shelf(st) { return st.tubes.map(function (t) { return (st.lit[t.id] ? '[*' : '[ ') + t.label + ']'; }).join(' '); }
say('== START: Meitner\'s Drop. A heavy drop, a neutron, a shelf of test tubes. [Drop a neutron]');
say('== THREE DROPS. Tap a drop to drop a neutron on it. A drop\'s skin holds it together; its charge pulls it apart.');
[C.LEAD, U, C.IMAGINED].forEach(function (n) { say('   ' + n.name + ' (' + n.Z + '): skin left ' + Math.round(m.skin(n) * 100) + '% -> ' + m.skinClass(n)); });
say('   uranium: barely holding. Where it splits is up to you. [To the bench]');
function stage(nuc, tubes, n, acts, label) {
  var st = m.newStage(nuc, tubes, n, SEED);
  say('\n== ' + label + '. Aim: account for every tube on the chemists\' shelf. Neutrons: ' + n);
  say('   Shelf: ' + shelf(st));
  acts.forEach(function (a) {
    if (m.stageDone(st)) return;
    say('\n-- Neutron ' + (st.used + 1) + ' of ' + n + ': ' + (a.kind === 'hold' ? 'HOLD TOGETHER' : 'drag the line to ' + m.clampZ1(nuc, a.Z1) + ' | ' + (nuc.Z - m.clampZ1(nuc, a.Z1)) + ' (landing cells outlined; "splits ' + m.oddsWords(m.splitOdds(nuc, a.Z1)) + '"), SPLIT HERE'));
    var mv = m.play(st, a);
    if (mv.kind === 'split') say('   [snap] [two pieces fly out in speed lines] FISSION!! ~' + mv.energyShown + ' Mev');
    if (mv.kind === 'rang') say('   [the neck forms, the skin pulls it back] RINGS... no split');
    mv.pieces.forEach(function (p, i) { say('   piece ' + (i + 1) + ': ' + p.path.map(function (Z) { var c = m.cellOf(Z); return m.symbolOf(Z) + '(r' + (c.row + 4) + 'c' + (c.col + 1) + ')'; }).join(' > ')); });
    m.moveWords(st, mv).forEach(function (l) { say('   Game: ' + l); });
    say('   Shelf: ' + shelf(st) + '   neutrons left: ' + (n - st.used));
  });
  say('   ' + (st.tubes.every(function (t) { return st.lit[t.id]; }) ? 'SHELF CLEAR' : 'neutrons spent or stage left') + ' after ' + st.used + ' neutrons.');
  return st;
}
var SEED = Number(process.argv[4] || 7);
var stU = stage(U, C.TUBES_U, C.NEUTRONS_U, actsU, 'URANIUM AT THE BENCH (seed ' + SEED + ')');
var stT = stage(TH, C.TUBES_TH, C.NEUTRONS_TH, actsT, 'THORIUM. The chemists also bombarded thorium: two more tubes, filed as radium and actinium');
var v = m.verdict(stU, stT);
say('\n== VERDICT. Large: ' + v.fate);
say('   Scoreboard: chemists claimed ' + v.claimed + '; you took away ' + v.you + '; the paper ' + v.paperDown);
v.story.forEach(function (l) { say('   ' + l); });

// ---- the table of obvious strategies (build.md section 3), over 1000 seeds ----
say('\n== STRATEGIES (uranium, ' + C.NEUTRONS_U + ' neutrons, 1000 seeds): mean tubes lit of 8, mean ghosts down of 5, P(all 8), P(24-min tube), mean cuts failed');
var NS = 1000;
function run(acts, seed) { var st = m.newStage(U, C.TUBES_U, C.NEUTRONS_U, seed); acts.forEach(function (a) { if (!m.stageDone(st)) m.play(st, a); }); return st; }
function row(name, acts) {
  var lit = 0, gh = 0, all = 0, hd = 0, rg = 0;
  for (var sd = 1; sd <= NS; sd++) { var st = run(acts, sd); var l = C.TUBES_U.filter(function (t) { return st.lit[t.id]; }).length; lit += l; if (l === 8) all++; gh += C.TUBES_U.filter(function (t) { return m.isDashed(t.cellZ) && st.lit[t.id]; }).length; if (st.lit.u24) hd++; rg += st.moves.filter(function (x) { return x.kind === 'rang'; }).length; }
  say('   ' + name.padEnd(50) + ' lit ' + (lit / NS).toFixed(1) + '  ghosts ' + (gh / NS).toFixed(1) + '  all8 ' + (all / NS * 100).toFixed(0).padStart(3) + '%  hold ' + (hd / NS * 100).toFixed(0).padStart(3) + '%  pulled back ' + (rg / NS).toFixed(2));
}
var S = function (z) { return { kind: 'split', Z1: z }; }, H = { kind: 'hold' };
row('the equal splitter (46 x4)', [S(46), S(46), S(46), S(46)]);
row('the edge hugger (1 x4)', [S(1), S(1), S(1), S(1)]);
row('the barium gambler (56 x4)', [S(56), S(56), S(56), S(56)]);
row('safe first, then barium (43, 56, 56, 56)', [S(43), S(56), S(56), S(56)]);
row('safe first, then 52 (43, 52, 52, 52)', [S(43), S(52), S(52), S(52)]);
row('safe first, then 53 (43, 53, 53, 53)', [S(43), S(53), S(53), S(53)]);
row('safe first, then 54 (43, 54, 54, 54)', [S(43), S(54), S(54), S(54)]);
row('safe first, then 55 (43, 55, 55, 55)', [S(43), S(55), S(55), S(55)]);
row('the sweeper (40, 44, 48, 52)', [S(40), S(44), S(48), S(52)]);
say('\n== WHAT EACH PINCH LIGHTS (uranium)');
for (var z = C.MIN_PIECE; z <= U.Z - C.MIN_PIECE; z++) { var s = m.split(U, z), l = m.lightTubes(s, C.TUBES_U, U.Z); say('   ' + String(z).padStart(2) + ' | ' + String(U.Z - z).padEnd(2) + '  ' + Math.round(s.energyMeV) + ' Mev  splits ' + m.oddsWords(m.splitOdds(U, z)).padEnd(26) + (l.map(function (x) { return x.id + '@' + x.atZ; }).join(' ') || '-')); }
