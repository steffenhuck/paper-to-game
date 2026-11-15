// The play loop on placeholder graphics (build.md §4.2): a scripted stranger plays the walkthrough of memo §9 through the
// mechanism, and after every action the script prints the board as letters, the status line in the aim's units, and
// what the game would say. Read as the stranger: did something change, did it say whether it worked, was there a
// reason to think first? Output goes to loop-log.txt.
var M = require('./mechanism.js');
var L = 'ABCDEFGHIJ';
function board(w) { var b = M.occupancy(w), s = ''; for (var r = 0; r < w.H; r++) { for (var c = 0; c < w.W; c++) s += b[r * w.W + c] < 0 ? '.' : L[b[r * w.W + c]]; s += '\n'; } return s; }
function tray(w) { return w.pieces.filter(function (p) { return !p.placed; }).map(function (p) { return L[p.id] + '=' + p.shape; }).join(' ') || '(empty)'; }
function say(w, what) { var st = M.status(w); console.log('> ' + what + '\n' + board(w) + 'Lit ' + st.lit + ' of ' + st.total + '. Dark ' + st.dark + '. Waiting ' + st.waiting + ' [' + tray(w) + ']\n'); }
var g = M.newGame();
console.log('=== WORLD 1 of 3 — Fill the land. Not all of these will fit. ===');
var w = g.worlds[0]; say(w, 'the board as the stranger first sees it');
M.place(w, 0, 0, 0); say(w, 'drag the rectangle (A) to the top-left');
M.place(w, 1, 2, 0); say(w, 'drag the small square (B) under it');
var t = M.turn(w, 4); console.log('> tap the bar of two (E): it turns (rotation ' + t.ri + ')');
M.place(w, 4, 0, 3); say(w, 'drag the upright bar of two (E) to the right edge');
var ok = M.place(w, 3, 2, 2); console.log('> try the bar of three (D) at (2,2): ' + (ok.ok ? 'placed' : 'does not fit there: ' + ok.why));
M.place(w, 2, 2, 2); say(w, 'drag the L (C) into the bottom-right');
var r = M.letItBe(w); say(w, 'LET IT BE — rushed in: ' + r.rushed.map(function (x) { return x.name; }).join(', '));
r.lines.forEach(function (l) { console.log('  game: ' + l); });
M.nextWorld(g);

console.log('\n=== WORLD 2 of 3 — the stranger takes the big square first ===');
w = g.worlds[1]; say(w, 'the board as first seen');
M.place(w, 0, 0, 0); say(w, 'drag the big square (A) to the top-left corner');
M.place(w, 1, 0, 3); console.log('> long bar (B) at (0,3) horizontal: ' + (w.pieces[1].placed ? 'placed' : 'no'));
M.turn(w, 1); M.place(w, 1, 0, 3); say(w, 'turn the long bar (B) upright and drag it to the right of the square');
M.turn(w, 2); M.place(w, 2, 0, 5); say(w, 'turn the second long bar (C) upright, drag it to the far right');
M.place(w, 4, 3, 0); M.place(w, 5, 3, 2); say(w, 'two small squares (E, F) under the big square');
ok = M.place(w, 3, 4, 0); console.log('> third long bar (D) flat along the bottom: ' + (ok.ok ? 'placed' : ok.why));
M.turn(w, 3); ok = M.place(w, 3, 4, 2); console.log('> third long bar (D) upright at (4,2): ' + (ok.ok ? 'placed' : ok.why));
M.place(w, 6, 4, 4); say(w, 'the last small square (G) at (4,4)');
console.log('> the stranger stares: 29 lit, 7 dark, one long bar waiting. Pull the big square? (This is the decision.)');
console.log('> this stranger lets it be.');
r = M.letItBe(w); say(w, 'LET IT BE — rushed in: ' + (r.rushed.length ? r.rushed.map(function (x) { return x.name; }).join(', ') : 'nothing'));
r.lines.forEach(function (l) { console.log('  game: ' + l); });
console.log('  best possible world:'); var bw = M.makeWorld(M.CONFIG.WORLDS[1], 1); bw.best.placement.forEach(function (p) { bw.pieces[p.id].ri = p.ri; M.place(bw, p.id, p.r, p.c); }); console.log(board(bw));
M.nextWorld(g);

console.log('\n=== WORLD 3 of 3 — a world made by weight; nothing left fits; make it fuller ===');
w = g.worlds[2]; say(w, 'the board as first seen (A longest bar, B big square, C long bar, D thin bar placed by weight)');
console.log('> each waiting shape, does it fit anywhere? ' + w.pieces.filter(function (p) { return !p.placed; }).map(function (p) { return p.shape + ':' + (M.anyFit(w, p) ? 'yes' : 'no'); }).join(' '));
M.pull(w, 1); say(w, 'tap the big square (B): it comes out — a step back');
console.log('> now: ' + w.pieces.filter(function (p) { return !p.placed; }).map(function (p) { return p.shape + ':' + (M.anyFit(w, p) ? 'fits' : 'no'); }).join(' '));
M.place(w, 1, 2, 0); say(w, 'put the big square back where it was');
M.pull(w, 2); say(w, 'tap the long bar (C) instead: a bigger hole, 13 dark');
M.turn(w, 4); M.place(w, 4, 2, 3); say(w, 'turn the rectangle (E) upright, drag it into the hole at (2,3)');
M.place(w, 5, 5, 0); say(w, 'the thin bar (F) along the bottom-left');
M.turn(w, 6); M.turn(w, 6); M.place(w, 6, 4, 4); say(w, 'turn the L (G) twice and drag it into the bottom-right');
console.log('> the long bar (C) is waiting and nowhere fits it: the stranger lets it be.');
r = M.letItBe(w); say(w, 'LET IT BE');
r.lines.forEach(function (l) { console.log('  game: ' + l); });
M.nextWorld(g);
console.log('\n=== VERDICT ===');
var v = M.verdict(g);
console.log(v.fate + '\n' + v.paper + '\n' + v.found.join('\n') + '\n' + v.part + '\n' + v.stood);
