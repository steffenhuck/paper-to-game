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
  var st = m.newStage(nuc, tubes, n);
  say('\n== ' + label + '. Aim: account for every tube on the chemists\' shelf. Neutrons: ' + n);
  say('   Shelf: ' + shelf(st));
  acts.forEach(function (a) {
    if (m.stageDone(st)) return;
    say('\n-- Neutron ' + (st.used + 1) + ' of ' + n + ': ' + (a.kind === 'hold' ? 'HOLD TOGETHER' : 'drag the line to ' + m.clampZ1(nuc, a.Z1) + ' | ' + (nuc.Z - m.clampZ1(nuc, a.Z1)) + ' (landing cells outlined), SPLIT HERE'));
    var mv = m.play(st, a);
    if (mv.kind === 'split') say('   [snap] [two pieces fly out in speed lines] FISSION!! ~' + mv.energyShown + ' Mev');
    mv.pieces.forEach(function (p, i) { say('   piece ' + (i + 1) + ': ' + p.path.map(function (Z) { var c = m.cellOf(Z); return m.symbolOf(Z) + '(r' + (c.row + 4) + 'c' + (c.col + 1) + ')'; }).join(' > ')); });
    m.moveWords(st, mv).forEach(function (l) { say('   Game: ' + l); });
    say('   Shelf: ' + shelf(st) + '   neutrons left: ' + (n - st.used));
  });
  say('   ' + (st.tubes.every(function (t) { return st.lit[t.id]; }) ? 'SHELF CLEAR' : 'neutrons spent or stage left') + ' after ' + st.used + ' neutrons.');
  return st;
}
var stU = stage(U, C.TUBES_U, C.NEUTRONS_U, actsU, 'URANIUM AT THE BENCH');
var stT = stage(TH, C.TUBES_TH, C.NEUTRONS_TH, actsT, 'THORIUM. The chemists also bombarded thorium: two more tubes, filed as radium and actinium');
var v = m.verdict(stU, stT);
say('\n== VERDICT. Large: ' + v.fate);
say('   What the paper found: ' + v.paper);
v.found.forEach(function (l) { say('   What you found: ' + l); });
v.part.forEach(function (l) { say('   Where you part: ' + l); });
say('   Had yours stood: ' + v.stood);

// ---- the table of obvious strategies (build.md section 3) ----
say('\n== STRATEGIES (uranium, 5 neutrons): tubes lit of 8, ghosts down of 5, hold found, neutrons used');
function run(acts) { var st = m.newStage(U, C.TUBES_U, C.NEUTRONS_U); acts.forEach(function (a) { if (!m.stageDone(st)) m.play(st, a); }); return st; }
function row(name, acts) {
  var st = run(acts), lit = C.TUBES_U.filter(function (t) { return st.lit[t.id]; }).length, gh = C.TUBES_U.filter(function (t) { return m.isDashed(t.cellZ) && st.lit[t.id]; }).length;
  say('   ' + name.padEnd(46) + ' lit ' + lit + '/8  ghosts ' + gh + '/5  hold ' + (st.lit.u24 ? 'yes' : 'no ') + '  used ' + st.used);
}
var S = function (z) { return { kind: 'split', Z1: z }; }, H = { kind: 'hold' };
row('the equal splitter (46|46 x5)', [S(46), S(46), S(46), S(46), S(46)]);
row('the holder (hold x5)', [H, H, H, H, H]);
row('the tube-cell lander (56, 57, then 46s)', [S(56), S(57), S(46), S(46), S(46)]);
row('the extreme pincher (28|64, 64|28, 30, 62, 33)', [S(28), S(64), S(30), S(62), S(33)]);
row('the column reader (56, 43, hold)', [S(56), S(43), H]);
row('the column reader, osmium row (56, 44, hold)', [S(56), S(44), H]);
row('the sweeper (36, 40, 44, 48, 52)', [S(36), S(40), S(44), S(48), S(52)]);
row('the one who ignores the hold (56, 43, 42, 44, 38)', [S(56), S(43), S(42), S(44), S(38)]);
row('the one who holds first (hold, 56, 43)', [H, S(56), S(43)]);
// random pinchers, seeded
function rng(seed) { var s = seed; return function () { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; }; }
var hist = {}, ghostHist = {}, N = 500;
for (var i = 0; i < N; i++) { var r = rng(i + 1), acts = []; for (var k = 0; k < 5; k++) acts.push(r() < 0.15 ? H : S(C.MIN_PIECE + Math.floor(r() * (U.Z - 2 * C.MIN_PIECE + 1)))); var st = run(acts); var lit = C.TUBES_U.filter(function (t) { return st.lit[t.id]; }).length, gh = C.TUBES_U.filter(function (t) { return m.isDashed(t.cellZ) && st.lit[t.id]; }).length; hist[lit] = (hist[lit] || 0) + 1; ghostHist[gh] = (ghostHist[gh] || 0) + 1; }
say('   random pinchers (' + N + ' seeds, 15% holds): tubes lit histogram ' + JSON.stringify(hist) + '; ghosts down histogram ' + JSON.stringify(ghostHist));
say('\n== WHAT EACH PINCH LIGHTS (uranium)');
for (var z = C.MIN_PIECE; z <= U.Z - C.MIN_PIECE; z++) { var s = m.split(U, z), l = m.lightTubes(s, C.TUBES_U, U.Z); say('   ' + String(z).padStart(2) + ' | ' + String(U.Z - z).padEnd(2) + '  ' + Math.round(s.energyMeV) + ' Mev  ' + (l.map(function (x) { return x.id + '@' + x.atZ; }).join(' ') || '-')); }
