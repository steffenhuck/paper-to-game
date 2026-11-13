// The loop on placeholders: plays whole games headlessly and prints what the player would see. Run: node loop.js
const { MECH: M } = require('./mechanism.js');
const P = ['Fountain', 'Tower', 'Tree'], S = ['●', '■', '▲'];
const show = b => b.map(x => S[x]).join(' ');
const showList = r => M.tiers(r).map(t => t.map(x => S[x]).join('=')).join(' > ');
const out = [];
const strategies = {
  'always nearest Anna': (L, nb, bk) => L.slice().sort((a, b) => score(b, nb, bk, 'A') - score(a, nb, bk, 'A'))[0],
  'always nearest Beat': (L, nb, bk) => L.slice().sort((a, b) => score(b, nb, bk, 'B') - score(a, nb, bk, 'B'))[0],
  'level where possible': (L, nb, bk) => L.slice().sort((a, b) => score(b, nb, bk, 'E') - score(a, nb, bk, 'E'))[0],
  'one each (whoever has had less)': (L, nb, bk) => { const c = M.counts(bk); const want = c.A <= c.B ? 'A' : 'B'; return L.slice().sort((a, b) => bal(a, nb, bk) - bal(b, nb, bk) || score(b, nb, bk, want) - score(a, nb, bk, want))[0]; },
  'a fixed order settles it: Fountain, Tree, Tower': (L) => { const d = w => Math.abs(w[0] - 0) + Math.abs(w[2] - 1) + Math.abs(w[1] - 2) + (new Set(w).size < 3 ? 5 : 0); return L.slice().sort((a, b) => d(a) - d(b))[0]; },
  'first list on offer': (L) => L[0],
  'last list on offer': (L) => L[L.length - 1]
};
function score(w, nb, bk, v) { return M.newRulings(bk, nb.anna, nb.beat, w).filter(r => r.value === v).length; }
function bal(w, nb, bk) { const c = M.counts(M.post(bk, nb.anna, nb.beat, w)); return Math.abs(c.A - c.B) + c.E; }
Object.keys(strategies).forEach((name, si) => {
  out.push('=== ' + name);
  let bk = M.emptyBook(), t = 0, nb;
  while ((nb = M.nextBallots(bk, t, 0))) {
    const L = M.legalLists(bk, nb.anna, nb.beat), w = strategies[name](L, nb, bk), nr = M.newRulings(bk, nb.anna, nb.beat, w);
    if (si === 3 || si === 0) out.push(`  Sunday ${t + 1}: Anna ${show(nb.anna)} | Beat ${show(nb.beat)} | lists on offer ${L.length}: ${L.map(showList).join('  /  ')}`);
    if (si === 3 || si === 0) out.push(`     posts ${showList(w)}; new rulings: ${nr.map(r => `${S[r.annaFor]} v ${S[r.beatFor]} -> ${r.value === 'A' ? "Anna's way" : r.value === 'B' ? "Beat's way" : 'level'}`).join('; ')}` + (M.sameList(w, nb.anna) ? '  [the list is Anna\'s ballot]' : '') + (M.sameList(w, nb.beat) ? '  [the list is Beat\'s ballot]' : ''));
    bk = M.post(bk, nb.anna, nb.beat, w); t++;
  }
  const v = M.verdict(bk);
  out.push(`  book ${bk.join('')}: a list on ${v.holds} of 36; fate ${v.fate}` + (v.boss ? ' (' + (v.boss === 'A' ? 'Anna' : 'Beat') + ')' : '') + `; lists that are Anna's ballot ${v.annas}, Beat's ${v.beats}`);
  if (si === 3) { const a = M.audit(bk); a.cells.filter(c => !c.list).forEach(c => { const k = c.clash; out.push(`     no list on Anna ${show(c.anna)} | Beat ${show(c.beat)}: ${S[k.a]} ${k.ab === '>' ? 'over' : 'level with'} ${S[k.b]}, ${S[k.b]} ${k.bc === '>' ? 'over' : 'level with'} ${S[k.c]}, but ${S[k.a]} ${k.actual === '<' ? 'under' : k.actual === '=' ? 'level with' : 'over'} ${S[k.c]}` + (k.circle ? '  (a circle)' : '')); }); }
});
const txt = out.join('\n'); console.log(txt); require('fs').writeFileSync(__dirname + '/loop-log.txt', txt + '\n');
