// Headless play of the loop (build.md section 4.2): prints, after each action, what changed and where the player stands.
// Usage: node loop.js [rulers, e.g. reason,talk,aware,suffer] [lines, e.g. 1,2,1,4] [hand line, e.g. 4] [experiment, e.g. chimp,human]
var m = require('./mechanism.js'), C = m.CONFIG;
var order = (process.argv[2] || 'reason,talk,aware,suffer').split(','), ks = (process.argv[3] || '1,2,1,4').split(',').map(Number), hk = Number(process.argv[4] || 4), ans = (process.argv[5] || 'chimp,human').split(',');
var state = { cuts: [], path: { pick: null, why: null, braindam: null } };
function say(s) { console.log(s); }
say('== START: Draw a Line with Singer. Most people think every person counts and no animal does. Measured how? [Pick up the chalk]');
say('== BOARD ONE. Every person in, every animal out. Find the ruler that draws that line.');
say('   The ten, unsorted: ' + C.CAST.map(function (b) { return b.label + (b.sub ? ' (' + b.sub + ')' : ''); }).join(', '));
say('   Bentham asked: Can they reason? Can they talk? Can they suffer?   Tray: ' + C.RULERS.map(function (r) { return r.label; }).join(' | '));
order.forEach(function (r, i) {
  var rows = m.sortBy(r);
  say('\n-- Ruler ' + (i + 1) + ' of 4: tap ' + m.rulerById(r).label + ' (' + m.rulerById(r).what + ')');
  rows.forEach(function (x, j) { say('     ' + String(j + 1).padStart(2) + '. ' + (x.human ? '[person] ' : (x.id === C.THING ? '[thing]  ' : '[animal] ')) + (x.label + (x.sub ? ' (' + x.sub + ')' : '')).padEnd(40) + ' ' + '#'.repeat(x.r).padEnd(10) + ' ' + x.r + (x.tieBelow ? '  (= same as the next)' : '')); });
  var k = ks[i], c = m.cut(r, k); state.cuts.push(c);
  say('   Tap row ' + k + ': a red dashed line under it. CHALK IT: the line is drawn for good.');
  say('   Headline: ' + m.headline(c));
  say('   Board: ' + m.cutWords(c) + (c.misfits ? ' (red circles on ' + c.misfits + ')' : '') + (c.byHand ? ' (yellow bracket: same mark)' : ''));
  say('   Board: ' + m.rulerFind(r));
  say('   [Sponge] wipes the line; the smear stays.');
});
say('\n-- No ruler. Four rulers, four lines. Every one cost somebody, or your hand drew it. The ten are back in no order, no marks. Draw the line where you think it goes.');
var hc = m.cut('hand', hk); state.cuts.push(hc); var hw = m.handWords(hc);
say('   Tap row ' + hk + '. CHALK IT. Board: ' + hw.text + (hw.species ? ' (the column is headed SPECIES)' : ' (a yellow dashed line appears under the four people: Species)'));
C.MIRROR.forEach(function (lab) { say('   [And then] The sponge wipes the word and writes ' + lab.toUpperCase() + '. The line stays. Every one of us in, every one of them out.'); });
say('   Singer: the pattern is the same in each case. None of these is a ruler; they are the team you are on. One ruler read the same for all but the stone: Suffer. Whoever can feel pain counts.');
say('\n== BOARD TWO. Now you are the scientist. ' + C.EXPERIMENT.many);
say('   On offer: ' + C.EXPERIMENT.subjects.map(function (id) { var b = m.castById(id); return b.phrase + ' [' + C.RULERS.map(function (r) { return r.label.toLowerCase() + ' ' + b[r.id]; }).join(', ') + ']'; }).join('; ') + '; or no one.');
var ai = 0, q;
while ((q = m.nextQuestion(state.path))) {
  var a = ans[ai++]; if (a === undefined) a = q.id === 'pick' ? 'chimp' : q.options[0].id;
  say('   Singer asks: ' + q.text + (q.options ? '  [' + q.options.map(function (o) { return o.text; }).join(' | ') + ']' : ''));
  say('   You: ' + a);
  state.path[q.id] = a;
}
var j = m.judgeExperiment(state.path);
say('   Board: ' + j.said);
say('   Singer: ' + j.paper + '  (status: ' + j.status + ')');
var v = m.verdict(state);
say('\n== VERDICT. Large: ' + v.fate);
say('   What Singer says: ' + v.paper.join(' '));
say('   What you found: ' + v.found.join(' '));
say('   What you did: ' + v.did.join(' '));
say('   Where you part: ' + v.part.join(' '));
say('   What follows: ' + v.stood.join(' '));
say('   [Play again] [About]');
