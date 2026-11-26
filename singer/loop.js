// Headless play of the loop (build.md section 4.2). Usage: node loop.js [round 0, e.g. adult,infant,braindam,disab] [experiment, e.g. chimp,human] [moves per ruler as +id/-id lists separated by ;, e.g. '+chimp;;+dog,+pig;+horse,+mouse']
var m = require('./mechanism.js'), C = m.CONFIG;
var set = (process.argv[2] || 'adult,infant,braindam,disab').split(',').filter(Boolean), ans = (process.argv[3] || 'chimp,human').split(',');
var mvArg = (process.argv[4] || ';;;').split(';');
var lines = [set.slice()];
var state = { lines: lines, path: { pick: null, why: null, braindam: null } };
function say(s) { console.log(s); }
say('== START: Draw a Line with Singer. Who counts? Draw the line. [Pick up the chalk]');
say('== BOARD ONE. Who counts? Tap everyone who counts. The rest are out.');
say('   The ten: ' + C.CAST.map(function (b) { return b.label + (b.sub ? ' (' + b.sub + ')' : ''); }).join(', '));
say('   You tap: ' + m.listPhrases(set) + '. [Done]');
say('   Your line is drawn. Now the rulers. Could a ruler have drawn your line?');
C.RULERS.forEach(function (r, i) {
  var cur = lines[lines.length - 1].slice();
  (mvArg[i] || '').split(',').filter(Boolean).forEach(function (mv) { var id = mv.slice(1); if (mv[0] === '+' && cur.indexOf(id) < 0) cur.push(id); if (mv[0] === '-') cur = cur.filter(function (x) { return x !== id; }); });
  var rows = m.sortBy(r.id), t = m.testLine(cur, r.id), moved = !m.sameSet(cur, lines[lines.length - 1]);
  say('\n-- Ruler ' + (i + 1) + ' of 4: ' + r.label + ' (' + r.what + ') comes to the board. Your dots ride along. Does it move you?');
  rows.forEach(function (x, j) { say('     ' + String(j + 1).padStart(2) + '. ' + (cur.indexOf(x.id) >= 0 ? '● ' : '○ ') + (x.label + (x.sub ? ' (' + x.sub + ')' : '')).padEnd(40) + ' ' + '#'.repeat(x.r).padEnd(10) + ' ' + x.r + (x.tieBelow ? '  (= same as the next)' : '')); });
  say('   You: ' + (moved ? 'move ' + (mvArg[i] || '') + ' [Done]' : '[Keep my line]'));
  lines.push(cur); set = cur;
  say('   ' + (t.line ? 'A red line draws itself under row ' + t.k + '.' : 'Red circles on ' + m.castById(t.clash[0]).phrase + ' and ' + m.castById(t.clash[1]).phrase + '.'));
  say('   Board: ' + (moved ? r.label + ' moved you. ' : 'You kept your line. ') + m.revealWords(cur, r.id));
});
var syn = m.synthesis(lines);
say('\n-- [So what drew my line?] ' + syn.head + ' ' + syn.text);
var w = m.shapeWords(set);
say('   Headline: ' + w.headline + '  Column headed: ' + w.name.toUpperCase());
say('   Board: ' + w.who);
if (w.singer) say('   Singer: ' + w.singer);
say('   [' + (w.shape.id === 'species' ? 'And then…' : 'And the line most people draw?') + '] The sponge writes RACE, then SEX, over the four-people line. The pattern is the same in each case. Singer\'s answer: Suffer.');
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
