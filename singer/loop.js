// Headless play of the loop (build.md section 4.2): prints, after each action, what changed and where the player stands.
// Usage: node loop.js [order of rulers, e.g. reason,plans,ties,pain] [cuts, e.g. 1,2,2,10] [picks, e.g. adult,adult,adult,infant]
var m = require('./mechanism.js'), C = m.CONFIG;
var order = (process.argv[2] || 'reason,plans,ties,pain').split(','), ks = (process.argv[3] || '1,2,2,10').split(',').map(Number), picks = (process.argv[4] || 'adult,adult,adult,infant').split(',');
var state = { cuts: [], picks: {} };
function say(s) { console.log(s); }
say('== START: Singer\'s Chalk Line. Aim: Draw the line: who counts, and how much. [Pick up the chalk]');
say('== BOARD ONE. Aim: Draw one line that keeps every person in and every animal out, with a ruler you can read.');
say('   The cast, unsorted: ' + C.CAST.map(function (b) { return b.label + (b.sub ? ' (' + b.sub + ')' : ''); }).join(', '));
say('   Tray: ' + C.RULERS.map(function (r) { return r.label; }).join(' | '));
order.forEach(function (r, i) {
  var rows = m.sortBy(r);
  say('\n-- Ruler ' + (i + 1) + ' of 5: tap ' + m.rulerById(r).label + ' (' + m.rulerById(r).what + ')');
  say('   The column sorts, highest first; a yellow mark per row:');
  rows.forEach(function (x, j) { say('     ' + String(j + 1).padStart(2) + '. ' + (x.human ? '[person] ' : (x.id === 'oak' ? '[thing]  ' : '[animal] ')) + x.label.padEnd(11) + ' ' + '#'.repeat(x.r).padEnd(10) + ' ' + x.r + (x.tieBelow ? '  (same as the next: no gap here)' : '')); });
  var legal = m.legalCuts(r);
  say('   Gaps you can tap (line goes under row k): ' + legal.join(', ') + '. A faint stroke previews; no count until you chalk.');
  var k = ks[i]; if (legal.indexOf(k) < 0) { k = legal[0]; say('   (chosen gap not legal: ruler cannot tell them apart; using ' + k + ')'); }
  var c = m.cut(r, k); state.cuts.push(c);
  say('   Tap gap ' + k + ', then CHALK IT. The stroke draws itself under row ' + k + '.');
  say('   Board: ' + m.cutWords(c) + ' In: ' + c.inH + ' people, ' + c.inA + ' animals. Out: ' + c.outH + ' people, ' + c.outA + ' animals' + (c.oakIn ? ', the oak in' : '') + '. Red circles on ' + c.misfits + '.');
  say('   Board: ' + m.rulerFind(r));
  say('   [Sponge] wipes the stroke; the smear stays.');
});
say('\n-- Ruler 5 of 5: one ruler left: SPECIES (' + C.SPECIES.what + ')');
var sc = m.cut('species', 5); state.cuts.push(sc);
say('   The cast splits, five and six. Tap the one gap. CHALK IT. ' + m.cutWords(sc));
C.MIRROR.forEach(function (lab) { say('   [Next] The sponge wipes the word Species and writes ' + lab.toUpperCase() + '. The line stays. Every one of ours in, every one of theirs out.'); });
say('   Singer: the pattern is identical. A line on the group you belong to is not a ruler you can read.');
say('   Singer\'s reply: equality was never a fact about them; it is a rule about how to treat them. The ruler that read the same for all of them is Pain, and that is the line: whoever can hurt is in.');
say('\n== BOARD TWO. Aim: Everyone who can hurt is in. Now give the one dose, and the one rescue.');
C.SCENES.forEach(function (s, i) {
  var pick = picks[i];
  var ma = m.sceneMarks(s, s.a), mb = m.sceneMarks(s, s.b);
  say('\n-- Scene ' + (i + 1) + ' of 4: ' + s.thing + '. ' + s.setting);
  say('   Left: ' + m.castById(s.a).phrase + ' | pain now ' + '#'.repeat(ma.painNow) + ' (' + ma.painNow + ') | plans ' + '#'.repeat(ma.plans) + ' (' + ma.plans + ')');
  say('   Right: ' + m.castById(s.b).phrase + ' | pain now ' + '#'.repeat(mb.painNow) + ' (' + mb.painNow + ') | plans ' + '#'.repeat(mb.plans) + ' (' + mb.plans + ')');
  say('   Tap one figure, then ' + (s.scale === 'pain' ? 'GIVE THE DOSE' : 'PULL OUT') + '. Picked: ' + pick);
  var j = m.judge(s.id, pick); state.picks[s.id] = pick;
  say('   Board: ' + m.sceneWords(j));
  say('   Under it, after a beat: ' + m.paperWords(j));
});
var v = m.verdict(state);
say('\n== VERDICT. Large: ' + v.fate);
say('   What the paper says: ' + v.paper.join(' '));
say('   What you found: ' + v.found.join(' '));
say('   What you chose: ' + v.chose.join(' '));
say('   Where you part: ' + v.part.join(' '));
say('   Had it stood: ' + v.stood.join(' '));
say('   [Play again] [About]');
