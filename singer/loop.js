// Headless play of the loop (build.md section 4.2). Usage: node loop.js [ticks at experiment 1] [at 2] [at 3] [seed]
// Example: node loop.js horse,mouse chimp,pig dog 3
var m = require('./mechanism.js'), C = m.CONFIG, S = C.SUBJECTS;
function ids(s) { return (s || '').split(',').filter(Boolean); }
var ticks = { 1: ids(process.argv[2]), 2: ids(process.argv[3]), 3: ids(process.argv[4]) };
var skins = m.drawSkins(parseInt(process.argv[5] || '0', 10));
function say(s) { console.log(s); }
say('== START: Draw a Line with Singer. Whose pain would you spend? Draw the line. [Pick up the chalk]');
C.LEVELS.forEach(function (L, i) {
  say('\n-- Experiment ' + L.n + ' of 3. ' + skins[i] + ' ' + C.COST);
  say('   On offer: ' + m.menuOf(L.n).map(function (id) { var b = m.castById(id); return b.label + (b.sub ? ' (' + b.sub + ')' : ''); }).join(', ') + '. Tap everyone you would be willing to use.');
  say('   You tick: ' + m.listPhrases(ticks[L.n]) + '. [Done]');
});
say('\n== WHAT YOU DID. ' + m.didWords(ticks) + ' Rules with a ranking that explain all three choices: ' + m.rulesExplaining(ticks).length + '.');
C.RULES.forEach(function (r, i) {
  var t = m.ruleTest(ticks, r.id);
  say('\n-- Rule ' + (i + 1) + ': ' + r.label + ' comes to the board. ' + r.rule + '. [You tap the experiments you think it will complain about, then Check]');
  S.slice().sort(function (a, b) { return m.castById(b)[r.id] - m.castById(a)[r.id]; }).forEach(function (id) { var b = m.castById(id), k = m.rungOf(id), on = m.tickedAt(ticks, id); say('     ' + (b.label + (b.sub ? ' (' + b.sub + ')' : '')).padEnd(36) + ' ' + '#'.repeat(b[r.id]).padEnd(10) + ' ' + String(b[r.id]).padStart(2) + '   ' + [1, 2, 3].map(function (n) { return n === k ? (on ? 'v' : 'x') : '.'; }).join(' ')); });
  say('   ' + (t.ok ? 'No circles. ' : 'Red circles in experiment ' + t.bad.join(', ') + '. ') + m.ruleWords(ticks, r.id));
});
var w = m.shapeWords(ticks);
say('\n== THE NAME: ' + w.name + '. ' + w.headline + '\n   ' + w.who + '\n   ' + w.singer);
var v = m.verdict({ ticks: ticks, skins: skins });
say('\n== THE VERDICT: ' + v.fate);
say('   [your line] would use: ' + v.line.used.map(function (id) { return id + '@' + v.line.stakes(id); }).join(', ') + ' | would spare: ' + v.line.spared.join(', '));
say('   [Singer\'s line] ' + v.singerLine);
say('   [part] ' + v.part);
say('   [follows] ' + v.two);
