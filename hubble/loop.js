// Headless play loop on placeholder "graphics": prints after every action what changed and where the player stands.
// Run: node loop.js  (writes loop-log.txt). Strategy: four cheap bright nebulae, then far ones, as a stranger might.
const M = require('./mechanism.js');
const C = M.CONFIG, N = C.NEBULAE, L = [];
const say = s => L.push(s);
function plate(state) {
  const pts = M.platePoints(state); const W = 40, H = 10; const rows = Array.from({ length: H }, () => Array(W).fill(' '));
  for (const p of pts) { const x = Math.min(W - 1, Math.round(p.r / 2.4 * (W - 1))); const y = Math.min(H - 1, Math.max(0, Math.round((1200 - p.v) / 1500 * (H - 1)))); rows[y][x] = p.v >= 0 ? '●' : '○'; }
  const zero = Math.round(1200 / 1500 * (H - 1)); rows[zero] = rows[zero].map(ch => ch === ' ' ? '·' : ch);
  return rows.map(r => '    |' + r.join('')).join('\n') + '\n    +' + '-'.repeat(W) + ' distance →';
}
const state = M.newGame(42);
say(`START  aim: find out whether the far nebulae drift at random or whether their speed is tied to their distance. ${C.NIGHTS} nights. Then say how fast.`);
say(`SKY    24 nebulae; costs ${N.map(n => M.cost(n)).join('')}; nights left ${state.nightsLeft}`);
const picks = [5, 7, 8, 6, 22, 19, 16];
for (const idx of picks) {
  const n = N[idx];
  if (!M.canObserve(state, idx)) { say(`TAP    ${n.name}: cannot afford (${M.cost(n)} nights, ${state.nightsLeft} left)`); continue; }
  say(`TAP    ${n.name}  cost ${M.cost(n)} night(s)`);
  const ms = M.brightestStarMag(n);
  say(`EYE    brightest star m=${ms.toFixed(1)}; dial from 0.1: comparison star ${(M.relBrightness(M.magFromDistance(0.1), ms)).toFixed(2)}× too bright ... turning dial ... ring glows at r≈${n.r}`);
  const rRead = n.r * 1.04;
  say(`READ   distance about ${rRead.toFixed(2)} million parsecs`);
  const lp = M.lineProfile(n);
  say(`SPEC   lines width ${lp.widthA.toFixed(1)} Å depth ${lp.depth.toFixed(2)}; K line at ${M.shiftedLambda(C.LINES[0].lambda, n.v).toFixed(1)} Å (rest ${C.LINES[0].lambda}); slide until ring glows`);
  const vRead = n.v + 15;
  const o = M.observe(state, idx, rRead, vRead);
  say(`READ   ${M.nightWords(o, state)}`);
  say(`PLATE  ${M.plateWords(state)}\n${plate(state)}`);
}
say(`NIGHTS OVER: ${M.nightsOver(state)}; affordable: ${M.affordable(state).filter(Boolean).length}`);
say('SUN    Something is in the way: the Sun itself moves at about 300 km/s. Take it out.');
M.takeOutSun(state);
say(`PLATE  ${M.plateWords(state)}\n${plate(state)}`);
say(`RATE   dial from 0 (flat) to ${C.RATE_MAX}; player stops at 450`);
M.setRate(state, 450);
say(`       ${M.rateWords(state)}`);
say(`HUMASON  new nebula at about 7 million parsecs; your line says about ${M.roundV(M.predictHumason(state))} km/s. Commit.`);
M.commitPrediction(state, M.predictHumason(state));
say(`SPEC   Humason's K line at ${M.shiftedLambda(C.LINES[0].lambda, C.HUMASON.v).toFixed(1)} Å, H at ${M.shiftedLambda(C.LINES[1].lambda, C.HUMASON.v).toFixed(1)}: a long way right. ${C.HUMASON.v} km/s.`);
const v = M.verdict(state);
say(`VERDICT\n  ${v.did}\n  ${v.rate}\n  ${v.test}\n  ${v.plate}\n  ${v.meaning}`);
require('fs').writeFileSync(__dirname + '/loop-log.txt', L.join('\n') + '\n');
console.log(L.join('\n'));
