// Headless play of the loop (build.md section 4.2). Usage: node loop.js [round 0, e.g. adult,infant,braindam,disab] [experiment, e.g. chimp,human] [moves per rule as +id/-id lists separated by ;, e.g. '+chimp;;+dog,+pig;+horse,+mouse'] [suffer answers, e.g. +chimp,+dog,-pig: + yes, - no; unlisted = yes]
var m = require('./mechanism.js'), C = m.CONFIG;
var set = (process.argv[2] || 'adult,infant,braindam,disab').split(',').filter(Boolean), ans = (process.argv[3] || 'chimp,human').split(',');
var mvArg = (process.argv[4] || ';;;').split(';');
var lines = [set.slice()];
var answers = {}; (process.argv[5] || '').split(',').filter(Boolean).forEach(function (a) { answers[a.replace(/^[+-]/, '')] = a[0] !== '-'; });
var state = { lines: lines, answers: answers, path: { pick: null, why: null, braindam: null } };
function say(s) { console.log(s); }
say('== START: Draw a Line with Singer. Who counts? Draw the line. [Pick up the chalk]');
say('== BOARD ONE. Who counts? Tap everyone who counts. The rest are out.');
say('   The ten: ' + C.CAST.map(function (b) { return b.label + (b.sub ? ' (' + b.sub + ')' : ''); }).join(', '));
say('   You tap: ' + m.listPhrases(set) + '. [Done]');
say('   Your line is drawn. Now the rulers. Could a ruler have drawn your line?');
C.RULES.forEach(function (r, i) {
  var cur = lines[lines.length - 1].slice();
  (mvArg[i] || '').split(',').filter(Boolean).forEach(function (mv) { var id = mv.slice(1); if (mv[0] === '+' && cur.indexOf(id) < 0) cur.push(id); if (mv[0] === '-') cur = cur.filter(function (x) { return x !== id; }); });
  var rows = m.sortBy(r.id), t0 = m.testLine(lines[lines.length - 1], r.id), t = m.testLine(cur, r.id), moved = !m.sameSet(cur, lines[lines.length - 1]);
  say('\n-- Rule ' + (i + 1) + ': ' + r.label + ' comes to the board. Suppose ' + r.label + ' were your rule: ' + r.rule + '. The ten sort by it; your dots ride along.');
  rows.forEach(function (x, j) { say('     ' + String(j + 1).padStart(2) + '. ' + (cur.indexOf(x.id) >= 0 ? '● ' : '○ ') + (x.label + (x.sub ? ' (' + x.sub + ')' : '')).padEnd(40) + ' ' + '#'.repeat(x.r).padEnd(10) + ' ' + x.r + (x.tieBelow ? '  (= same as the next)' : '')); });
  say('   At once: ' + (t0.line ? 'a red line under row ' + t0.k + '. ' : 'red circles on ' + m.castById(t0.clash[0]).phrase + ' and ' + m.castById(t0.clash[1]).phrase + '. ') + m.revealWords(lines[lines.length - 1], r.id));
  say('   You: ' + (moved ? 'move ' + (mvArg[i] || '') + ' [Done]' : '[Keep my line]'));
  if (moved) say('   Checked again: ' + m.revealWords(cur, r.id));
  lines.push(cur); set = cur;
});
// Suffer: asked, not shown
var asked = m.sufferAsked(set); asked.forEach(function (id) { if (answers[id] === undefined) answers[id] = true; });
say('\n-- One more question: can they suffer? Asked about ' + (asked.length ? m.listPhrases(asked) : 'nobody') + '. You answer: ' + asked.map(function (id) { return m.castById(id).phrase + ' ' + (answers[id] ? 'yes' : 'no'); }).join(', ') + '.');
say('   Board: ' + m.sufferWords(set, answers));
var cur4 = set.slice();
(mvArg[3] || '').split(',').filter(Boolean).forEach(function (mv) { var id = mv.slice(1); if (mv[0] === '+' && cur4.indexOf(id) < 0) cur4.push(id); if (mv[0] === '-') cur4 = cur4.filter(function (x) { return x !== id; }); });
say('   You: ' + (m.sameSet(cur4, set) ? '[Keep my line]' : 'move ' + (mvArg[3] || '') + ' [Done]'));
lines.push(cur4); set = cur4;
var syn = m.synthesis(lines, answers);
var syn = m.synthesis(lines);
say('\n-- ' + syn.head + ' ' + syn.text + ' ' + syn.suffer);
var w = m.shapeWords(set);
say('   Headline: ' + w.headline + '  Column headed: ' + w.name.toUpperCase());
say('   Board: ' + w.who);
if (w.singer) say('   Singer: ' + w.singer);
say('   [' + (w.shape.id === 'species' ? 'And then…' : 'And the line most people draw?') + '] The sponge writes RACE, then SEX, over the four-people line. The pattern is the same in each case. Singer\'s answer: can it suffer?');
say('\n== BOARD TWO. Now you are the scientist. ' + C.EXPERIMENT.many);
var ai = 0, q;
while ((q = m.nextQuestion(state.path, set))) {
  var a = ans[ai++]; if (a === undefined) a = q.id === 'pick' ? 'chimp' : q.options[0].id;
  say('   Singer asks: ' + q.text + (q.options ? '  [' + q.options.map(function (o) { return o.text; }).join(' | ') + ']' : ''));
  say('   You: ' + a);
  state.path[q.id] = a;
}
var j = m.judgeExperiment(state.path, set);
say('   Board: ' + j.said);
say('   Singer: ' + j.paper + '  (status: ' + j.status + ')');
var v = m.verdict(state);
say('\n== VERDICT. Large: ' + v.fate);
say('   What Singer says: ' + v.paper.join(' '));
say('   Your lines: ' + v.found.join(' '));
say('   What you did: ' + v.did.join(' '));
say('   Where you part: ' + v.part.join(' '));
say('   What follows: ' + v.stood.join(' '));
say('   [Play again] [About]');
