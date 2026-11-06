// The best paths (the score, and the coda): the pace per generation, over the ruler's five marks, that gives the
// highest typical generation (mechanism.js, typicalOf). Searched over the marks only, so that the best path can be told
// in the ruler's own words and a player can follow it. Run by build.py; writes optimum.json, which the page embeds as
// OPTIMUM and calibration.js checks against a fresh search. Run: node optimum.js
const M = require('./mechanism.js'); const C = M.CONFIG; const fs = require('fs');
const NG = C.MAX_GENS, MARKS = [0.5, 1, 1.5, 2, 2.4];
function search(substitute) {
  const t0 = Date.now(); let runs = 0;
  const val = p => { runs++; return M.typicalOf(M.playPath(p), substitute); };
  // every path over the five marks for the first five generations, the rest at the fifth; keep the ten best
  const grid = [];
  const rec = (prefix, depth) => {
    if (depth === 5) { grid.push({ v: val(prefix), path: prefix.concat(Array(NG - 5).fill(prefix[4])) }); return; }
    for (const m of MARKS) { prefix.push(m); rec(prefix, depth + 1); prefix.pop(); }
  };
  rec([], 0);
  grid.sort((a, b) => b.v - a.v);
  // then coordinate ascent over all ten generations, over the marks, from each of those and from every steady path
  // (there are local optima: one start is not enough)
  const starts = grid.slice(0, 10).map(g => g.path).concat(MARKS.map(m => Array(NG).fill(m)));
  let best = null;
  for (const s0 of starts) {
    let cur = s0.slice(), curv = val(cur);
    for (let sweep = 0; sweep < 12; sweep++) {
      let improved = false;
      for (let i = 0; i < NG; i++) for (const m of MARKS) {
        if (m === cur[i]) continue;
        const t = cur.slice(); t[i] = m; const v = val(t);
        if (v > curv + 1e-9) { cur = t; curv = v; improved = true; }
      }
      if (!improved) break;
    }
    if (!best || curv > best.v + 1e-12) best = { v: curv, path: cur };
  }
  const cur = best.path, curv = best.v;
  const st = M.playPath(cur), L = M.ledger(st), noon = Math.max(...st.history.map(h => h.C));
  return { typical: curv, path: cur, perHead: L.gens.map(g => +g.perHead.toFixed(3)), after: +L.after.perHead.toFixed(3),
    left: +L.left.toFixed(1), noonMult: +(noon / C.C0).toFixed(2), noonYear: st.history.find(h => h.C === noon).year, runs, ms: Date.now() - t0 };
}
function noEngines() {
  const saved = C.ENGINES; C.ENGINES = [];
  try { return search(null); } finally { C.ENGINES = saved; }
}
function all() {
  const r = search(null);
  r.noEngines = noEngines();
  r.substitutes = C.SUBSTITUTE.map(s => Object.assign({ from: s.from, floor: s.floor }, search(s)));
  return r;
}
if (require.main === module) {
  const r = all();
  fs.writeFileSync(__dirname + '/optimum.json', JSON.stringify(r, null, 1) + '\n');
  console.log(`best typical x${r.typical.toFixed(3)} on ${r.path.join(' ')} (${r.runs} runs, ${r.ms} ms); per head ${r.perHead.join(' ')}, after ${r.after}, left ${r.left}, noon ${r.noonYear} x${r.noonMult}`);
  console.log(`  without the engines: x${r.noEngines.typical.toFixed(3)} on ${r.noEngines.path.join(' ')}`);
  for (const s of r.substitutes) console.log(`  substitute from ${s.from} at x${s.floor}: x${s.typical.toFixed(3)} on ${s.path.join(' ')}, left ${s.left}, noon ${s.noonYear} x${s.noonMult}`);
}
module.exports = { search, all };
