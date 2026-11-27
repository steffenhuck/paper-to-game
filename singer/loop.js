// Headless play of the loop (build.md section 4.2). Usage: node loop.js [ticks at experiment 1] [at 2] [at 3] [suffer answers, e.g. -mouse,-pig: - no; unlisted = yes] [seed]
// Example: node loop.js horse,mouse,stone chimp,pig dog "" 3
var m = require('./mechanism.js'), C = m.CONFIG, S = C.SUBJECTS;
function ids(s) { return (s || '').split(',').filter(Boolean); }
var ticks = { 1: ids(process.argv[2]), 2: ids(process.argv[3]), 3: ids(process.argv[4]) };
var answers = {}; S.forEach(function (id) { if (id !== 'stone') answers[id] = true; }); ids(process.argv[5]).forEach(function (a) { answers[a.replace(/^[+-]/, '')] = a[0] !== '-'; });
var skins = m.drawSkins(parseInt(process.argv[6] || '0', 10));
function say(s) { console.log(s); }
say('== START: Draw a Line with Singer. Whose pain would you spend? Draw the line. [Pick up the chalk]');
C.LEVELS.forEach(function (L, i) {
  say('\n-- Experiment ' + L.n + ' of 3. ' + skins[i] + ' ' + C.COST);
  say('   On offer: ' + m.menuOf(L.n).map(function (id) { var b = m.castById(id); return b.label + (b.sub ? ' (' + b.sub + ')' : ''); }).join(', ') + '. Tap everyone you would be willing to use.');
  say('   You tick: ' + m.listPhrases(ticks[L.n]) + '. [Done]');
});
say('\n== WHAT YOU DID. ' + m.didWords(ticks) + ' Rules with marks that explain all three choices: ' + m.rulesExplaining(ticks).length + '.');
C.RULES.forEach(function (r, i) {
  var t = m.ruleTest(ticks, r.id);
  say('\n-- Rule ' + (i + 1) + ': ' + r.label + ' comes to the board. Suppose ' + r.label + ' were your rule: ' + r.rule + '. [You guess: agrees / objects]');
  S.slice().sort(function (a, b) { return m.castById(b)[r.id] - m.castById(a)[r.id]; }).forEach(function (id) { var b = m.castById(id), k = m.rungOf(id), on = m.tickedAt(ticks, id); say('     ' + (b.label + (b.sub ? ' (' + b.sub + ')' : '')).padEnd(36) + ' ' + '#'.repeat(b[r.id]).padEnd(10) + ' ' + String(b[r.id]).padStart(2) + '   ' + [1, 2, 3].map(function (n) { return n === k ? (on ? 'v' : 'x') : '.'; }).join(' ')); });
  say('   ' + (t.ok ? 'Cutoffs ' + JSON.stringify(t.cut) + '. ' : 'Red circles on ' + m.castById(t.clash[0]).phrase + ' and ' + m.castById(t.clash[1]).phrase + '. ') + m.ruleWords(ticks, r.id));
});
say('\n-- One more question: can they suffer? You answer: ' + S.filter(function (id) { return id !== 'stone'; }).map(function (id) { return m.castById(id).phrase + ' ' + (answers[id] ? 'yes' : 'no'); }).join(', ') + '.');
say('   Board: ' + m.sufferWords(ticks, answers));
var w = m.shapeWords(ticks, answers);
say('\n== THE NAME: ' + w.name + '. ' + w.headline + '\n   ' + w.who + (w.singer ? '\n   ' + w.singer : ''));
say('\n-- The sponge writes Race, then Sex, over the line most people draw. Then Singer\'s answer: can it suffer?');
var v = m.verdict({ ticks: ticks, answers: answers, skins: skins });
say('\n== THE VERDICT: ' + v.fate);
['paper', 'did', 'found', 'part', 'stood'].forEach(function (k) { say('   [' + k + ']'); v[k].forEach(function (p) { say('   ' + p); }); });
