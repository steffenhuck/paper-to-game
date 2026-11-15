// The play loop on placeholder graphics (build.md §4.2): drives mechanism.js headless and prints, after every action,
// what changed and where the player stands. Strategy: the walkthrough's (decline the doctor; a Battersea pair by word;
// a Battersea pair by glass; the Waterloo Road crape door against its neighbour by glass; a check; a last asked pair).
const M = require('./mechanism.js'); const C = M.CONFIG;
const seed = Number(process.argv[2] || 7);
const g = M.newGame(seed); const L = [];
const name = ref => M.house(g, ref).name;
const row = (s) => { let t = ''; for (let r = 0; r < 2; r++) { let line = ''; for (let c = 0; c < 6; c++) { const h = s.houses[r * 6 + c]; const kw = M.knownWater(h); line += (h.crape ? 'X' : '.') + (h.known === 'glass' ? (h.water === 'brown' ? 'B' : 'U') : h.known === 'word' ? (kw === 'brown' ? 'b' : kw === 'blue' ? 'u' : '?') : '-') + ' '; } t += '     ' + line + '\n'; } return t; };
const show = () => { L.push('   WINDOW: ' + JSON.stringify(M.windowFrom(g, false))); L.push('   LINE: ' + M.line(g)); L.push('   knocks left ' + g.knocks); };
L.push(`SEED ${seed}. AIM: Find out whether it is the water: set a crape door beside a door without, and know what each drinks.`);
g.streets.forEach(s => { L.push(`${s.name} (${s.phrase}): crape on ${s.crape} doors`); L.push(row(s)); });
const o = g.offers.first[0];
L.push(`DOCTOR: "Here is a pair for nothing: ${name(o.a)}'s (crape, Battersea) says ${M.house(g, o.a).word || 'could not say'}; ${name(o.b)}'s (Waterloo Road, no crape) says ${M.house(g, o.b).word || 'could not say'}." Card: ${JSON.stringify(M.card(g, o.a, o.b))}. [Take it] [No]`);
M.declineOffer(g, 'first'); L.push('   -> declined');
const doPair = (a, b, how) => {
  L.push(`PAIR: ${name(a)} (${M.house(g, a).crape ? 'crape' : 'no crape'}, ${g.streets[a.s].name}) against ${name(b)} (${g.streets[b.s].name}), by ${how}`);
  const r = M.makePair(g, a, b, how); if (!r.ok) { L.push('   refused: ' + r.why); return; }
  const A = M.house(g, a), B = M.house(g, b);
  const say = h => how === 'glass' ? (h.water === 'brown' ? 'MILKY (Battersea water)' : 'CLEAR (Thames Ditton water)') : (h.word === null ? 'could not say' : h.word === 'brown' ? '"Southwark and Vauxhall"' : '"the Lambeth"');
  L.push(`   ${A.name}: ${say(A)}; ${B.name}: ${say(B)}. CARD: ${r.rec.card.kind} (${r.rec.card.street ? 'different street' : 'same street'}; water ${r.rec.card.water})`);
  show();
  if (g.offers.second && g.offers.secondTaken === undefined) { L.push(`DOCTOR: "Three more pairs for nothing." [Take all three] [No]`); M.declineOffer(g, 'second'); L.push('   -> declined'); }
};
const b0 = g.streets[0], w1 = g.streets[1];
const crB = b0.houses.filter(h => h.crape), crW = w1.houses.filter(h => h.crape);
const nb = (s, i) => { const c = [i - 1, i + 1].filter(k => k >= 0 && k < 12 && !s.houses[k].crape); return c[0] !== undefined ? c[0] : s.houses.findIndex(h => !h.crape); };
doPair({ s: 0, i: crB[0].i }, { s: 0, i: nb(b0, crB[0].i) }, 'ask');
doPair({ s: 0, i: crB[1].i }, { s: 0, i: nb(b0, crB[1].i) }, 'glass');
doPair({ s: 1, i: crW[0].i }, { s: 1, i: nb(w1, crW[0].i) }, 'glass');
const wordy = b0.houses.find(h => h.known === 'word' && h.crape);
if (wordy && g.knocks >= 1) { L.push(`CHECK: ${wordy.name}'s word (${wordy.word || 'could not say'}) with the glass`); const r = M.check(g, { s: 0, i: wordy.i }); L.push(`   -> ${r.milky ? 'MILKY' : 'CLEAR'}; ${r.wasWrong ? 'the word was wrong' : r.wasUnsure ? 'now known' : 'the word was right'}`); show(); }
if (g.knocks >= 1 && crB[2]) doPair({ s: 0, i: crB[2].i }, { s: 0, i: nb(b0, crB[2].i) }, 'ask');
L.push('CLOSE THE BOOK: ' + M.closeBook(g)); M.writeSentence(g, 'water');
const v = M.verdict(g);
L.push(`\nVERDICT (${v.band})\n  SNOW: ${v.snow}\n  YOU: ${v.you}\n  PART: ${v.part}\n  WORDS: ${v.words}\n  HAD: ${v.had}`);
g.streets.forEach(s => L.push(s.name + '\n' + row(s)));
console.log(L.join('\n')); require('fs').writeFileSync(__dirname + '/loop-log.txt', L.join('\n') + '\n');
