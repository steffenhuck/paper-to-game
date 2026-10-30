// Headless play of the loop on placeholder graphics: prints, after each tap, what changed and where
// the player stands, for the builder to read as the stranger. Run: node loop.js [seed] > loop-log.txt
const M = require('./mechanism.js');
const seed = parseInt(process.argv[2] || '4821', 10);
const fmt = r => r.join(' ');
function pageR1(rows, yours, st) {
  rows.forEach((r, i) => console.log(`  ${i + 1}  ${r.map((c, v) => (st.struck[i] >= 0 && v === st.struck[i] ? `(${c})` : st.struck[i] >= 0 ? `-${c}-` : ` ${c} `)).join('')} …`));
  console.log(`  YOUR ROW: ${fmt(yours)}`);
}
console.log(`BOOK No. ${seed}`);
console.log('\n== ROUND 1: the small book.  Aim: write a row that is in none of the five.');
const rows1 = M.round1Book(seed);
let yours = [];
let st = M.round1Status(rows1, yours);
pageR1(rows1, yours, st);
// play the majority trick
while (!st.done) {
  const alive = rows1.filter((r, i) => st.struck[i] < 0);
  const c = M.PLAYERS.majority({ yours, aliveRows: alive });
  yours = yours.concat([c]);
  st = M.round1Status(rows1, yours);
  console.log(`\n  tap ${c}  ->  ${st.struck.filter(s => s >= 0).length} struck, ${st.alive} still agree`);
  pageR1(rows1, yours, st);
}
console.log(st.won ? `\n  ROUND 1: all five struck in ${st.letters} letters.` : `\n  ROUND 1: row ${st.caughtBy + 1} is you after ${st.letters} letters: the Lister has it.`);

console.log('\n== ROUND 2: the endless book.  Aim: strike them all.');
const book = M.makeEndlessBook(seed);
let s2 = M.round2Start(book);
const show2 = s => { s.page.forEach(p => console.log(`  ${String(p.n).padStart(5)}  ${fmt(p.row)} …`)); console.log(`  YOUR ROW: ${fmt(s.yours)}`); };
show2(s2);
while (!s2.done) {
  const c = M.PLAYERS.majority({ yours: s2.yours, aliveRows: s2.page.map(p => p.row) });
  s2 = M.round2Write(book, s2, c);
  console.log(`\n  tap ${c}  ->  struck rows ${s2.struckNow.join(', ')}; the Lister turns to rows ${s2.arrived.join(', ')}, which agree with you.  Struck so far: ${s2.struckTotal}. Still agreeing: all ${s2.page.length} on the page, and endlessly more.`);
  show2(s2);
}
console.log(`\n  ROUND 2 (the Lister's card): you struck ${s2.struckTotal} rows. Still agreeing with you: endless. You will never strike them all.`);
console.log("  CANTOR'S BARGAIN: strike row 1 by your 1st letter, row 2 by your 2nd, row 3 by your 3rd...");

console.log('\n== ROUND 3: Cantor\'s bargain.  Aim: strike each row on its own number (the line).');
const lister = M.makeLister3(seed);
let s3 = M.round3Start(lister);
const show3 = s => {
  s.rows.forEach((r, i) => console.log(`  ${String(i + 1).padStart(2)}  ${r.map((c, v) => (v === i ? `[${c}]` : (s.struck && s.struck[i] >= 0) ? `-${c}-` : ` ${c} `)).join('')}`));
  console.log(`  YOUR ROW: ${fmt(s.yours)}`);
};
show3(s3);
let k = 0;
while (!s3.done) {
  const u = s3.yours.length;
  // the stranger: slips on row 2 (writes the same letter as the line cell), then gets it
  const c = k === 1 ? s3.rows[u][u] : M.flip(s3.rows[u][u]); k++;
  s3 = M.round3Write(lister, s3, c);
  console.log(`\n  tap ${c}  ->  ${s3.slippedNow ? `row ${u + 1} SLIPPED past its number, still agreeing with you` : `row ${u + 1} struck on its number`}${s3.done ? '' : `; the Lister writes row ${u + 2}, copying your ${u + 1} letters`}`);
  show3(s3);
}
console.log(`\n  ROUND 3: ten rows; ${s3.slipped.length === 0 ? 'each struck at its own number, none slipped' : `${s3.slipped.length} slipped past (row${s3.slipped.length > 1 ? 's' : ''} ${s3.slipped.map(i => i + 1).join(', ')})`}.`);
const again = M.addToBookAndRerun(s3.rows, s3.yours);
console.log(`\n== THE END: the Lister adds your row as row 1. The rule runs again on its own: new row ${fmt(again.e0)} — not in the book.`);
console.log(`  verdict key: ${M.verdictKey(st, s3)}`);
