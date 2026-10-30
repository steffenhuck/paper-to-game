// Headless loop (build step 2): plays one game as a stranger would and prints what changes after every action.
// Run: node loop.js > loop-log.txt
const M = require('./mechanism.js');
const g = M.drawGame(1);
const show = z => z.rungs.map((r, i) => `  rung ${i + 1}: ${r.left || '_'} | ${r.right || '_'}  -> ${r.fit.held ? 'HOLDS, ribbons straight' : r.fit.fault === 'wide' ? 'TOO WIDE, ribbons bow out' : r.fit.fault === 'narrow' ? 'TOO NARROW, ribbons pinch' : 'BUMP HITS BUMP, piece springs back'}`).join('\n');
console.log('GAME 1. Aim: Build the other chain so every rung holds when you zip it.');
console.log('Ladder 1, given (left rail):', g.ladder1.map(s => s.given).join(' '));
// first-timer: school memory says A-T, then guesses like-with-like for G, and any short for C
const naive = g.ladder1.map(s => s.given === 'A' ? 'T' : s.given === 'G' ? 'G' : s.given === 'T' ? 'C' : 'G');
naive.forEach((p, i) => console.log(`  tap ${p} -> pinned opposite ${g.ladder1[i].given} at rung ${i + 1} (as a tag; not tested)`));
let z1 = M.zip(g.ladder1, naive); console.log('ZIP\n' + show(z1)); console.log(`  => ${z1.held} of ${z1.n} rungs held. Letters A ${z1.counts.A} T ${z1.counts.T} G ${z1.counts.G} C ${z1.counts.C}; A=T? ${z1.chargaff.AT}, G=C? ${z1.chargaff.GC}`);
console.log('\nLadder 2, given:', g.ladder2.map(s => s.given + '(' + s.side + ')').join(' '));
const learned = g.ladder2.map(s => M.partnerOf(s.given));
let z2 = M.zip(g.ladder2, learned); console.log('ZIP\n' + show(z2)); console.log(`  => ${z2.held} of ${z2.n} rungs held. Letters A ${z2.counts.A} T ${z2.counts.T} G ${z2.counts.G} C ${z2.counts.C}; A=T? ${z2.chargaff.AT}, G=C? ${z2.chargaff.GC}`);
const full = M.complete(g.ladder2), spots = M.copySpots(full);
console.log('\nCOPY: ladder pulled apart; fork reaches', spots.length, 'spots');
const entries = spots.map((s, k) => k === 13 ? null : k === 17 ? 'A' : M.partnerOf(s.template));
spots.forEach((s, k) => console.log(`  rung ${s.rung + 1} copy ${s.copy + 1} (${M.copyMs(s.rung)} ms): template ${s.template} -> ${entries[k] || 'MISSED'}`));
const c = M.scoreCopy(full, entries); console.log(`  => ${c.right} of ${c.n} right, missed ${c.missed}; copy 1 same as parent: ${c.same[0]}, copy 2: ${c.same[1]}`);
console.log('\nVERDICT:\n' + M.verdict({ l1: z1, l2: z2, copy: c }).join('\n'));
