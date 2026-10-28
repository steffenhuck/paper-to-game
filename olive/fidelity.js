const M = require('./mechanism.js');
const rnd = M.mulberry32(20191677);
for (const ds of ['virus', 'alexa', 'biocytin']) {
  const N = 600, S = [], B = [], ST = [], T = [], H = [], C = [], L = [];
  for (let i = 0; i < N; i++) {
    const n = M.makeNeuron(rnd, ds); const m = n.measures;
    S.push(m.straightness); B.push(m.branches); ST.push(m.stems); T.push(m.tips); H.push(m.hull); C.push(m.contraction); L.push(m.totalLength);
  }
  const srt = [...S].sort((a, b) => a - b);
  const q = p => srt[Math.floor(p * (N - 1))];
  console.log(`\n[${ds}] straightness min ${q(0).toFixed(2)} p10 ${q(0.1).toFixed(2)} median ${q(0.5).toFixed(2)} p90 ${q(0.9).toFixed(2)} max ${q(1).toFixed(2)}   (Table 4: ${M.CONFIG.datasets[ds].sMin}/${M.CONFIG.datasets[ds].sMed}/${M.CONFIG.datasets[ds].sMax})`);
  // crude bimodality check: histogram in 8 bins, count local maxima
  const bins = new Array(8).fill(0); for (const s of S) bins[Math.min(7, Math.floor((s - 0.1) / 0.1))]++;
  let peaks = 0; for (let i = 0; i < 8; i++) if (bins[i] >= (bins[i - 1] || 0) && bins[i] >= (bins[i + 1] || 0) && bins[i] > N * 0.05) peaks++;
  console.log('  histogram', bins.join(' '), ' peaks:', peaks);
  console.log(`  rho(s, branches)   ${M.spearman(S, B).toFixed(2)}  (Table 5 viral: -0.70)`);
  console.log(`  rho(s, stems)      ${M.spearman(S, ST).toFixed(2)}  (-0.41)`);
  console.log(`  rho(s, tips)       ${M.spearman(S, T).toFixed(2)}  (-0.63/-0.67)`);
  console.log(`  rho(s, hull)       ${M.spearman(S, H).toFixed(2)}  (+0.50)`);
  console.log(`  rho(s, contraction)${M.spearman(S, C).toFixed(2)}  (+0.57)`);
  console.log(`  rho(s, length)     ${M.spearman(S, L).toFixed(2)}  (-0.47)`);
}
// Act two
let one = 0, trials = 20, groupsOk = 0;
for (let t = 0; t < trials; t++) {
  const f = M.makeField(rnd);
  const k = M.dbscanClusters(f.cells, M.CONFIG.dbscanD, 3);
  if (k === 1) one++;
  // dendrite-overlap partition: perfect seeds at group centres should score high
  const seeds = f.groups.map(g => ({ x: g.cx, y: g.cy }));
  const sc = M.partitionScore(f.cells, seeds);
  if (sc.f1 > 0.85) groupsOk++;
  if (t < 3) console.log(`\nfield ${t}: ${f.groups.length} groups, ${f.cells.length} cells, DBSCAN@40 -> ${k} cluster(s), F1 at true centres ${sc.f1.toFixed(2)}`);
}
console.log(`\nDBSCAN@40 gives one cluster in ${one}/${trials} fields; planted groups recoverable (F1>0.85) in ${groupsOk}/${trials}`);
