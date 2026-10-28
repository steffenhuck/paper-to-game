// ============================================================
// THE OLIVE — mechanism (headless). No DOM here.
// Built from Vrieler et al. 2019, Brain Struct Funct 224:1677.
// Every number below is tagged with where it comes from.
// ============================================================

const CONFIG = {
  // ---- Act one: synthetic neuron library ----------------------
  datasets: {
    //                  straightness (Table 4): min, median, max
    virus:    { sMin: 0.129, sMed: 0.368, sMax: 0.813, color: '#5cff7a', label: 'VIRUS' },
    alexa:    { sMin: 0.19,  sMed: 0.49,  sMax: 0.81,  color: '#ff6a3d', label: 'ALEXA' },
    biocytin: { sMin: 0.21,  sMed: 0.39,  sMax: 0.79,  color: '#ffb347', label: 'BIOCYTIN' },
  },
  betaShape: 2.2,          // our choice: unimodal, no bimodality (Fig. 2e, Table 3)
  stemsAtCurly: 8,         // Table 4 virus: stems 3–11; Table 5: rho(stems, straightness) = -0.41
  stemsAtStraight: 4,
  branchesAtCurly: 80,     // Table 4 virus: branches 14–90; Table 5: rho = -0.70
  branchesAtStraight: 16,
  lengthAtCurly: 3800,     // Table 4 virus: total length 1260–7006 µm; Table 5: rho = -0.47
  lengthAtStraight: 1700,
  stemsNoise: 0.8, branchesNoise: 5, lengthNoise: 350,   // our choice: spread around the trend
  segLen: 5,               // µm per growth step — our choice
  branchLenCurly: 40,      // µm, mean length of a branch between bifurcations — Table 4: longest path 170–906 µm
  branchLenStraight: 110,
  bifBase: 0.9,            // probability a finished branch bifurcates (while bifurcation target not met) — our choice
  bifDepthDecay: 0.15,     // bifurcation less likely deeper in the tree — Table 4: branch order max 3–13
  bifSpreadMin: 0.5, bifSpreadMax: 0.8,   // rad; half-angle at a bifurcation — Table 4: local angle 61–89°
  pullPerStep: 0.06,       // our choice: strength of the directional pull per step
  curlSigmaMax: 1.05,      // rad per step at straightness 0 — tuned so re-measured s spans Table 4
  curlSigmaMin: 0.07,      // rad per step at straightness 1
  curlExponent: 1.6,       // our choice: shape of the curl-vs-straightness map
  directionality: 0.55,    // Fig. 4a/b: most trees elongated, soma eccentric — pull toward a main axis
  neuronsPerSession: 20,   // our choice (paper: 90 over three datasets)

  // ---- Act two: soma field and hidden coupling groups ----------
  fieldW: 360, fieldH: 210,          // µm, a slab of one subnucleus (Fig. 5a scale)
  fieldJitter: 10,                    // µm; our choice: wobble of the field grid
  cellsPerGroupMin: 16, cellsPerGroupMax: 22,  // our choice; paper reports examples, not counts (Fig. 6)
  fieldRadius: 58,                    // µm, dendritic field of a group; reach median 121 µm (Table 4)
  rimJitter: 12,                      // µm; somata sit at the rim of the shared field (Fig. 6c)
  bridgeCells: 3,                     // Fig. 7: a few long straight cells spanning groups — our choice
  fieldSpacing: 0.95,                 // our choice: neighbouring fields nearly touch, so rims interleave
  dbscanD: 40,                        // Fig. 5c: whole IO becomes one cluster at D = 40 µm
  comFraction: 0.6,                   // a cell's dendritic centre of mass sits this far along its axis (Fig. 4b: soma eccentric)
  groupDirectionality: 12.0,           // our choice: round-two trees pulled hard toward their field (Fig. 4b, Fig. 6)
  bridgeDirectionality: 6.0,          // our choice: bridge cells straight and strongly oriented (Fig. 7)
  groupTreeScale: 0.3,               // our choice: round-two trees drawn at reduced length so fields read as fields
  bridgeTreeScale: 0.5,
  groupCellS: [0.45, 0.65],            // our choice: round-two group cells span the curly-to-middle range (Discussion: cluster cells 'curlier')
  bridgeCellS: [0.7, 0.8],            // Discussion: bridge cells straighter
  targetStop: 4,                     // µm; round-two branches stop once they reach their field centre — our choice
  maxSeeds: 12,                       // our choice: player may place up to 12 group markers
};

// ---------- RNG -------------------------------------------------
function mulberry32(a) {
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
function gauss(rnd) {
  let u = 0, v = 0;
  while (u === 0) u = rnd(); while (v === 0) v = rnd();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}
// Beta-ish sample on [0,1] via sum of uniforms shaped by exponent; unimodal, centred where asked.
function betaLike(rnd, shape) {
  let x = 0; const n = 4;
  for (let i = 0; i < n; i++) x += rnd();
  x /= n;                                  // Bates distribution, bell-shaped on [0,1]
  return x;
}
const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));

// ---------- Neuron generator ----------------------------------------
// Grows a tree branch by branch (each branch a short random walk), so that
// soma-to-tip paths are long and winding for curly cells, long and straight for straight ones.
// Returns { nodes:[{x,y,path,parent,stem}], segs:[[i,j]], stems, bifs, sTarget, measures }
function makeNeuron(rnd, ds, opts = {}) {
  const d = CONFIG.datasets[ds];
  let u = betaLike(rnd, CONFIG.betaShape);
  const medT = (d.sMed - d.sMin) / (d.sMax - d.sMin);
  u = Math.pow(u, Math.log(medT) / Math.log(0.5));   // warp so the median maps to the paper's median
  const sT = opts.sT !== undefined ? opts.sT : lerp(d.sMin, d.sMax, u);
  const t = clamp((sT - 0.1) / 0.8, 0, 1);            // 0 = curly, 1 = straight
  const stems = Math.max(2, Math.round(lerp(CONFIG.stemsAtCurly, CONFIG.stemsAtStraight, t) + gauss(rnd) * CONFIG.stemsNoise));
  const branches = Math.max(stems, Math.round(lerp(CONFIG.branchesAtCurly, CONFIG.branchesAtStraight, t) + gauss(rnd) * CONFIG.branchesNoise));
  const bifTarget = Math.max(0, Math.round((branches - stems) / 2));
  const lengthBudget = Math.max(600, lerp(CONFIG.lengthAtCurly, CONFIG.lengthAtStraight, t) + gauss(rnd) * CONFIG.lengthNoise) * (opts.lengthScale || 1);
  const sigma = CONFIG.curlSigmaMin + (CONFIG.curlSigmaMax - CONFIG.curlSigmaMin) * Math.pow(1 - t, CONFIG.curlExponent);
  const branchLen = lerp(CONFIG.branchLenCurly, CONFIG.branchLenStraight, t);
  const mainAxis = opts.mainAxis !== undefined ? opts.mainAxis : rnd() * Math.PI * 2;
  const dirPull = opts.directionality !== undefined ? opts.directionality : CONFIG.directionality * (0.5 + rnd());

  const nodes = [{ x: 0, y: 0, path: 0, parent: -1, stem: -1 }];
  const segs = [];
  let total = 0, bifs = 0;
  const stack = [];
  for (let i = 0; i < stems; i++) stack.push({ node: 0, heading: rnd() * Math.PI * 2, stem: i, depth: 0 }); // Fig. 4c: stems placed at random
  while (stack.length && total < lengthBudget) {
    const br = stack.pop();
    const L = Math.max(10, branchLen * (0.4 + 1.2 * rnd()));
    let h = br.heading, cur = br.node, walked = 0, reached = false;
    while (walked < L && total < lengthBudget) {
      h += gauss(rnd) * sigma;
      const dAng = Math.atan2(Math.sin(mainAxis - h), Math.cos(mainAxis - h));
      h += dAng * dirPull * CONFIG.pullPerStep;          // directionality: trees elongate along one axis
      const p = nodes[cur];
      nodes.push({ x: p.x + Math.cos(h) * CONFIG.segLen, y: p.y + Math.sin(h) * CONFIG.segLen, path: p.path + CONFIG.segLen, parent: cur, stem: br.stem });
      segs.push([cur, nodes.length - 1]);
      cur = nodes.length - 1; walked += CONFIG.segLen; total += CONFIG.segLen;
      if (opts.target && Math.hypot(opts.target.x - nodes[cur].x, opts.target.y - nodes[cur].y) < CONFIG.targetStop) { walked = L; reached = true; }
    }
    const pBif = bifs < bifTarget && !reached ? CONFIG.bifBase / (1 + br.depth * CONFIG.bifDepthDecay) : 0;
    if (rnd() < pBif && total < lengthBudget) {
      bifs++;
      const spread = CONFIG.bifSpreadMin + rnd() * (CONFIG.bifSpreadMax - CONFIG.bifSpreadMin); // Table 4: local bifurcation angle 61–89°
      stack.push({ node: cur, heading: h - spread, stem: br.stem, depth: br.depth + 1 });
      stack.push({ node: cur, heading: h + spread, stem: br.stem, depth: br.depth + 1 });
    }
  }
  const n = { nodes, segs, stems, bifs, sTarget: sT, dataset: ds, mainAxis };
  n.measures = measure(n);
  return n;
}

// ---------- Morphometry (Table 1 subset) -----------------------------
function measure(n) {
  let reach = 0, longest = 0;
  const perStem = {};
  for (const nd of n.nodes) {
    const r = Math.hypot(nd.x, nd.y);
    if (r > reach) reach = r;
    if (nd.path > longest) longest = nd.path;
    if (nd.stem >= 0) {
      const ps = perStem[nd.stem] || (perStem[nd.stem] = { reach: 0, path: 0 });
      if (r > ps.reach) ps.reach = r;
      if (nd.path > ps.path) ps.path = nd.path;
    }
  }
  const straightness = longest > 0 ? reach / longest : 0;          // Table 1 #22
  const contr = Object.values(perStem).map(s => s.path > 0 ? s.reach / s.path : 0);
  const contraction = contr.length ? contr.reduce((a, b) => a + b, 0) / contr.length : 0; // #23
  const branches = n.stems + 2 * n.bifs;                              // #12
  const tips = n.stems + n.bifs;                                      // #16
  const hull = hullArea(n.nodes);                                     // #18 (2D proxy)
  const totalLength = n.segs.length * CONFIG.segLen;                  // #6
  return { straightness, contraction, branches, tips, stems: n.stems, bifs: n.bifs, hull, reach, longest, totalLength };
}
function hullArea(pts) {
  const p = pts.map(q => [q.x, q.y]).sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  if (p.length < 3) return 0;
  const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lower = [];
  for (const q of p) { while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], q) <= 0) lower.pop(); lower.push(q); }
  const upper = [];
  for (let i = p.length - 1; i >= 0; i--) { const q = p[i]; while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], q) <= 0) upper.pop(); upper.push(q); }
  const h = lower.slice(0, -1).concat(upper.slice(0, -1));
  let a = 0;
  for (let i = 0; i < h.length; i++) { const j = (i + 1) % h.length; a += h[i][0] * h[j][1] - h[j][0] * h[i][1]; }
  return Math.abs(a) / 2;
}

// ---------- Spearman ------------------------------------------------
function rank(arr) {
  const idx = arr.map((v, i) => [v, i]).sort((a, b) => a[0] - b[0]);
  const r = new Array(arr.length);
  for (let i = 0; i < idx.length;) {
    let j = i; while (j + 1 < idx.length && idx[j + 1][0] === idx[i][0]) j++;
    const avg = (i + j) / 2 + 1;
    for (let k = i; k <= j; k++) r[idx[k][1]] = avg;
    i = j + 1;
  }
  return r;
}
function spearman(a, b) {
  const ra = rank(a), rb = rank(b), n = a.length;
  const ma = ra.reduce((x, y) => x + y, 0) / n, mb = rb.reduce((x, y) => x + y, 0) / n;
  let num = 0, da = 0, db = 0;
  for (let i = 0; i < n; i++) { num += (ra[i] - ma) * (rb[i] - mb); da += (ra[i] - ma) ** 2; db += (rb[i] - mb) ** 2; }
  return num / Math.sqrt(da * db);
}

// ---------- Act one scoring ----------------------------------------
// labels: array of 'curly' | 'straight' | 'unsure'; s: straightness values
// Consistency = best single cutoff on straightness reproducing curly/straight labels.
function consistency(labels, s) {
  const pairs = labels.map((l, i) => [l, s[i]]).filter(p => p[0] !== 'unsure');
  if (pairs.length < 2) return { score: 0, cutoff: null, n: pairs.length };
  const cands = pairs.map(p => p[1]).sort((a, b) => a - b);
  let best = 0, bestC = cands[0];
  for (let i = 0; i <= cands.length; i++) {
    const c = i < cands.length ? cands[i] : 1.01;
    let ok = 0;
    for (const [l, v] of pairs) if ((v < c && l === 'curly') || (v >= c && l === 'straight')) ok++;
    if (ok > best) { best = ok; bestC = c; }
  }
  return { score: best / pairs.length, cutoff: bestC, n: pairs.length };
}

// ---------- Act two: soma field ------------------------------------
// Returns { cells:[{x,y,group,axis,isBridge}], groups:[{cx,cy,r}], W, H }
function makeField(rnd, preset = 'PO') {
  const W = CONFIG.fieldW, H = CONFIG.fieldH;
  const groups = [];
  // group fields tile the slab on a jittered hexagonal grid, so rims interleave and no
  // part of the slab is empty of somata (Fig. 5a: somata everywhere; Fig. 6: fields overlap or abut)
  const r0 = CONFIG.fieldRadius, dx = 2 * r0 * CONFIG.fieldSpacing, dy = dx * 0.866;
  for (let row = 0, y = r0 * 0.5; y < H + r0 * 0.3; row++, y += dy) {
    for (let x = (row % 2 ? dx / 2 : 0) + r0 * 0.2; x < W + r0 * 0.3; x += dx) {
      groups.push({ cx: x + gauss(rnd) * CONFIG.fieldJitter, cy: y + gauss(rnd) * CONFIG.fieldJitter, r: r0 * (0.85 + 0.3 * rnd()) });
    }
  }
  const cells = [];
  groups.forEach((g, gi) => {
    const n = CONFIG.cellsPerGroupMin + Math.floor(rnd() * (CONFIG.cellsPerGroupMax - CONFIG.cellsPerGroupMin + 1));
    for (let i = 0; i < n; i++) {
      const a = rnd() * Math.PI * 2;
      const rr = g.r + gauss(rnd) * CONFIG.rimJitter;       // soma at the rim (Fig. 6c, Fig. 4b)
      const x = g.cx + Math.cos(a) * rr, y = g.cy + Math.sin(a) * rr;
      if (x < 4 || y < 4 || x > W - 4 || y > H - 4) continue;
      cells.push({ x, y, group: gi, axis: Math.atan2(g.cy - y, g.cx - x), tx: g.cx - x, ty: g.cy - y, isBridge: false, sT: CONFIG.groupCellS[0] + rnd() * (CONFIG.groupCellS[1] - CONFIG.groupCellS[0]) });
    }
  });
  // bridge cells: straight, long, pointing from one field toward another (Fig. 7)
  for (let b = 0; b < CONFIG.bridgeCells && groups.length > 1; b++) {
    const a = Math.floor(rnd() * groups.length); let c = Math.floor(rnd() * groups.length); if (c === a) c = (a + 1) % groups.length;
    const ga = groups[a], gc = groups[c];
    const t = 0.35 + rnd() * 0.3;
    const x = lerp(ga.cx, gc.cx, t) + gauss(rnd) * 10, y = lerp(ga.cy, gc.cy, t) + gauss(rnd) * 10;
    if (x < 4 || y < 4 || x > W - 4 || y > H - 4) continue;
    const bx = x, by = y;
    cells.push({ x: bx, y: by, group: -1, axis: Math.atan2(gc.cy - ga.cy, gc.cx - ga.cx), tx: gc.cx - bx, ty: gc.cy - by, isBridge: true, sT: CONFIG.bridgeCellS[0] + rnd() * (CONFIG.bridgeCellS[1] - CONFIG.bridgeCellS[0]) });
  }
  return { cells, groups, W, H, preset };
}

// DBSCAN count of clusters at distance D with minPts (Fig. 5c)
function dbscanClusters(cells, D, minPts = 3) {
  const n = cells.length, lab = new Array(n).fill(0); let c = 0;
  const nb = i => { const r = []; for (let j = 0; j < n; j++) if (j !== i && Math.hypot(cells[i].x - cells[j].x, cells[i].y - cells[j].y) <= D) r.push(j); return r; };
  for (let i = 0; i < n; i++) {
    if (lab[i]) continue;
    const N = nb(i); if (N.length + 1 < minPts) { lab[i] = -1; continue; }
    c++; lab[i] = c; const q = [...N];
    while (q.length) { const j = q.pop(); if (lab[j] === -1) lab[j] = c; if (lab[j]) continue; lab[j] = c; const M = nb(j); if (M.length + 1 >= minPts) q.push(...M); }
  }
  return c;
}

// Player partition: seeds mark group fields. A cell belongs to the seed nearest its
// DENDRITIC centre of mass (soma + axis * comFraction * fieldRadius), because coupling lives
// in the dendrites, not at the soma (Discussion; Fig. 6). Score = pairwise F1 against planted groups.
// Bridge cells are excluded: the paper does not assign them to a group.
function comOf(c) {
  return { x: c.x + Math.cos(c.axis) * CONFIG.comFraction * CONFIG.fieldRadius, y: c.y + Math.sin(c.axis) * CONFIG.comFraction * CONFIG.fieldRadius };
}
function partitionScore(cells, seeds) {
  if (!seeds.length) return { f1: 0, precision: 0, recall: 0, assign: cells.map(() => -1) };
  const assign = cells.map(c => { const p = comOf(c); let b = 0, bd = Infinity; seeds.forEach((s, k) => { const d = Math.hypot(p.x - s.x, p.y - s.y); if (d < bd) { bd = d; b = k; } }); return b; });
  let tp = 0, fp = 0, fn = 0;
  for (let i = 0; i < cells.length; i++) {
    if (cells[i].isBridge) continue;
    for (let j = i + 1; j < cells.length; j++) {
      if (cells[j].isBridge) continue;
      const same = cells[i].group === cells[j].group, together = assign[i] === assign[j];
      if (same && together) tp++; else if (!same && together) fp++; else if (same && !together) fn++;
    }
  }
  const precision = tp + fp ? tp / (tp + fp) : 0, recall = tp + fn ? tp / (tp + fn) : 0;
  const f1 = precision + recall ? 2 * precision * recall / (precision + recall) : 0;
  return { f1, precision, recall, assign };
}

if (typeof module !== 'undefined') module.exports = { CONFIG, mulberry32, makeNeuron, measure, spearman, consistency, makeField, dbscanClusters, partitionScore, comOf };
