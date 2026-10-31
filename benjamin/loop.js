// The play loop on placeholders. Run: node loop.js  (writes loop-log.txt)
// Prints, after each action, what changed and where the player stands, as the stranger would read it.
const M = require('./mechanism.js');
const fs = require('fs'); const L = []; const say = s => { L.push(s); console.log(s); };
const bar = (cult, reach) => { const g = Math.round(cult * 10), r = Math.round(reach * 10); return '[' + '#'.repeat(g) + '='.repeat(r) + '.'.repeat(Math.max(0, 20 - g - r)) + ']'; };
const strip = s => s.results.map(r => M.CONFIG.AGES[r.age].key.slice(0, 4) + ':' + M.haloWords(r.halo).split(' ')[0]).join(' | ');
const plan = [0, 0, 1, 0, 3, 3, 4]; // a plausible stranger: holds, tries the feast day once, holds, then prints
const s = M.newGame();
say('AIM: Over seven ages, let the face move as many people as it can.');
for (let i = 0; i < 7; i++) {
  M.arrive(s); const a = M.currentAge(s);
  say(`\n== AGE ${i + 1} OF 7 · ${a.name} · ${a.date}`);
  say('   ' + a.newThis); if (M.arrivalLine(s)) say('   ' + M.arrivalLine(s));
  say('   picture: halo ' + M.haloWords(s.halo) + '; crowd: none yet; veil: not set');
  const opts = M.options(s);
  say('   slabs: ' + opts.map(o => (o.allowed ? o.label : '(' + o.label + ': ' + o.why + ')') + ' — ' + o.who).join(' / '));
  const v = Math.min(plan[i], a.ceiling);
  say(`   > tap ${opts[v].label}: the veil parts to ${Math.round(opts[v].n * 100)}%, the face comes nearer; nothing else moves`);
  say('   > LET THE AGE PASS');
  const r = M.commit(s, v);
  say(`   crowd walks in: about ${Math.round(r.reach * 100)} of 100 people, ${opts[v].n >= 0.75 ? 'close' : opts[v].n >= 0.5 ? 'near' : 'far off'}; halo ${M.haloWords(r.haloArrived)} -> ${M.haloWords(r.halo)}`);
  say('   line: ' + r.line);
  say('   HOLD THIS AGE ' + bar(r.cult, r.reach) + ' gold=halo, red=crowd');
  say('   had you set the veil elsewhere, the halo would be: ' + r.counterfactual.map(c => (c.index === v ? '[' : '') + M.haloWords(c.halo) + (c.index === v ? ']' : '')).join(' / '));
  say('   strip: ' + strip(s));
  M.next(s);
}
say('\n== 1936');
say('   The halo is gone. The people\'s longing for it is not. Where does the face go?');
say('   slabs: ' + M.CONFIG.FORK.map(f => f.label + ' — ' + f.meaning).join(' / '));
say('   > tap THE RALLY, PUT IT THERE');
const f = M.fork(s, 2);
say('   picture: printed halo ' + f.haloBack + ', crowd ' + f.reach + (f.war ? ', then the screen goes to war' : ''));
say('   line: ' + f.line + ' ' + f.benjamin);
const v = M.verdict(s);
say('\n== VERDICT');
say('   ' + v.lead); say('   What you did: ' + v.did); say('   What Benjamin says: ' + v.benjamin); say('   What that means: ' + v.fork);
fs.writeFileSync(__dirname + '/loop-log.txt', L.join('\n') + '\n');
