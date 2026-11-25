// Headless play of the loop (build.md section 4.2): prints, after each action, what changed and where the player stands.
// Usage: node loop.js [order of rulers, e.g. reason,talk,aware,suffer] [cuts, e.g. 1,2,1,9] [experiment path, e.g. chimp,no,human]
var m = require('./mechanism.js'), C = m.CONFIG;
var order = (process.argv[2] || 'reason,talk,aware,suffer').split(','), ks = (process.argv[3] || '1,2,1,9').split(',').map(Number), ans = (process.argv[4] || 'chimp,no,human').split(',');
var state = { cuts: [], path: { pick: null, infant: null, why: null, braindam: null } };
function say(s) { console.log(s); }
say('== START: Singer\'s Chalk Line. Aim: Draw the line: who counts. [Pick up the chalk]');
say('== BOARD ONE. Aim: Draw one line that keeps every person in and every animal out, with a ruler you can read.');
say('   The cast, unsorted: ' + C.CAST.map(function (b) { return b.label + (b.sub ? ' (' + b.sub + ')' : ''); }).join(', '));
say('   Bentham asked: can they reason? can they talk? can they suffer?   Tray: ' + C.RULERS.map(function (r) { return r.label; }).join(' | '));
order.forEach(function (r, i) {
  var rows = m.sortBy(r);
  say('\n-- Ruler ' + (i + 1) + ' of 5: tap ' + m.rulerById(r).label + ' (' + m.rulerById(r).what + ')');
  say('   The column sorts, highest first; a yellow mark per row:');
  rows.forEach(function (x, j) { say('     ' + String(j + 1).padStart(2) + '. ' + (x.human ? '[person] ' : (x.id === C.THING ? '[thing]  ' : '[animal] ')) + (x.label + (x.sub ? ' (' + x.sub + ')' : '')).padEnd(44) + ' ' + '#'.repeat(x.r).padEnd(10) + ' ' + x.r + (x.tieBelow ? '  (same as the next: no gap here)' : '')); });
  var legal = m.legalCuts(r);
  say('   Gaps you can tap (line goes under row k): ' + legal.join(', ') + '. A faint stroke previews; no count until you chalk.');
  var k = ks[i]; if (legal.indexOf(k) < 0) { k = legal[0]; say('   (chosen gap not legal: ruler cannot tell them apart; using ' + k + ')'); }
  var c = m.cut(r, k); state.cuts.push(c);
  say('   Tap gap ' + k + ', then CHALK IT. The stroke draws itself under row ' + k + '.');
  say('   Board: ' + m.cutWords(c) + ' In: ' + c.inH + ' people, ' + c.inA + ' animals. Out: ' + c.outH + ' people, ' + c.outA + ' animals' + (c.thingIn ? ', the stone in' : '') + '. Red circles on ' + c.misfits + '.');
  say('   Board: ' + m.rulerFind(r));
  say('   [Sponge] wipes the stroke; the smear stays.');
});
say('\n-- Ruler 5 of 5: one ruler left: SPECIES (' + C.SPECIES.what + ')');
var sc = m.cut('species', m.humansCount()); state.cuts.push(sc);
say('   The cast splits, four and six. Tap the one gap. CHALK IT. ' + m.cutWords(sc));
C.MIRROR.forEach(function (lab) { say('   [And then] The sponge wipes the word and writes ' + lab.toUpperCase() + '. The line stays. Every one of ours in, every one of theirs out.'); });
say('   Singer: the pattern is the same in each case. A line on the group you belong to is not a ruler you can read.');
say('   Singer\'s reply: equality was never a fact about them; it is a rule about how to treat them. The ruler that read the same for all of them is Suffer, and that is the line: whoever can suffer is in.');
say('\n== BOARD TWO. You are the experimenter. ' + C.EXPERIMENT.many);
say('   On offer: ' + C.EXPERIMENT.subjects.map(function (id) { var b = m.castById(id); return b.phrase + ' [' + C.RULERS.map(function (r) { return r.label.toLowerCase() + ' ' + b[r.id]; }).join(', ') + ']'; }).join('; ') + '; or no one.');
var ai = 0, q;
while ((q = m.nextQuestion(state.path))) {
  var a = ans[ai++]; if (a === undefined) { a = q.id === 'pick' ? 'chimp' : (q.options[0].id); }
  say('   Board asks: ' + q.text + (q.options ? '  [' + q.options.map(function (o) { return o.text; }).join(' | ') + ']' : ''));
  say('   You: ' + a);
  state.path[q.id] = a;
}
var j = m.judgeExperiment(state.path);
say('   Board: ' + j.said);
say('   Under it, after a beat: ' + j.paper + '  (status: ' + j.status + ')');
say('\n== CODA. And killing? ' + C.CODA);
var v = m.verdict(state);
say('\n== VERDICT. Large: ' + v.fate);
say('   What the paper says: ' + v.paper.join(' '));
say('   What you found: ' + v.found.join(' '));
say('   What you did: ' + v.did.join(' '));
say('   Where you part: ' + v.part.join(' '));
say('   What follows: ' + v.stood.join(' '));
say('   [Play again] [About]');
