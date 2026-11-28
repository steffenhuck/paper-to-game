// Headless play loop (build.md §4.2): prints what changes after each action, as a stranger would read it.
// Run: node loop.js
const M = require('./mechanism.js');
const L = (d, n) => M.makeLine(d, n);
function session(title, guess, moves) {
  console.log('\n######## ' + title);
  let s = M.newLesson(guess);
  console.log('Your answer (private): ' + M.lineName(guess) + ' -> would hold ' + M.countTiles(guess).total);
  for (const mv of moves) {
    if (M.isOver(s)) break;
    const r = M.act(s, mv); s = r.state; const e = r.event;
    const what = mv.type === 'which' ? 'ASK: which line, boy?' : mv.type === 'how' ? 'LAY ' + M.lineName(mv.line) + ', ASK: how big?' : 'LAY ' + M.lineName(mv.line) + ', TELL him';
    console.log('\n> ' + what);
    if (e.say1) console.log('  boy (first): ' + e.say1);
    if (e.laid) console.log('  floor: ' + (e.laidBy === 'him' ? 'white' : 'ochre') + ' line ' + M.lineName(e.laid) + '; he lays ' + e.tiles.whole.length + ' whole + ' + e.tiles.half.length + ' halves = ' + e.count + '  (column vs the 8 mark: ' + (e.count > 8 ? 'over' : e.count === 8 ? 'exactly' : 'under') + ')');
    console.log('  game: ' + e.result);
    console.log('  boy:  ' + e.words);
    console.log('  state: ' + e.before + ' -> ' + e.after + '; questions left ' + e.purse + (e.out ? '  (Meno has to go)' : ''));
  }
  const m = M.nextMorning(s);
  console.log('\nNEXT MORNING: Meno lays a square of three (nine) and asks for its double (eighteen).');
  if (m.say1) console.log('  boy: ' + m.say1);
  if (m.line) console.log('  floor: white line ' + M.lineName(m.line) + ' -> ' + m.count + (m.right ? ' RIGHT' : ' wrong'));
  console.log('  game: ' + m.result); console.log('  boy: ' + m.words);
  const v = M.verdict(s, m);
  console.log('\nVERDICT: "' + v.headline + '"  ' + v.plinth + '  rung ' + (v.rung + 1) + ' of 4: ' + v.rungs[v.rung].name);
  v.did.forEach(d => console.log('  - ' + d));
}
session('stranger who does not know', L('flat', 4), [{ type: 'which' }, { type: 'which' }, { type: 'which' }, { type: 'how', line: L('slant', 1) }, { type: 'how', line: L('slant', 2) }]);
session('knower who tells', L('slant', 2), [{ type: 'tell', line: L('slant', 2) }]);
session('late teller', L('slant', 2), [{ type: 'which' }, { type: 'which' }, { type: 'tell', line: L('slant', 2) }]);
session('shower', L('slant', 2), [{ type: 'how', line: L('slant', 2) }, { type: 'how', line: L('slant', 2) }, { type: 'how', line: L('slant', 2) }]);
session('purist', L('flat', 3), [{ type: 'which' }, { type: 'which' }, { type: 'which' }, { type: 'which' }, { type: 'which' }]);
