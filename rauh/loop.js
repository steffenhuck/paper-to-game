// Headless play of the whole loop with a model player, printed as the stranger would meet it.
// node loop.js > loop-log.txt
'use strict';
const M = require('./mechanism.js');
const sk = M.SKILLS[process.argv[2] || 'good'];
const res = {};
let seed = 7;
function read(id) {
  const w = M.scriptWords(id), j = M.judgeWords(w, M.modelTaps(w, sk, seed++));
  const r = M.itemReport(id, j);
  console.log('\n[' + M.SCRIPTS[id].kicker + '] ' + w.length + ' words, ' + M.timeline(w).end.toFixed(0) + ' s on air');
  console.log('  as read: ' + j.results.map(x => x.ok ? x.word : '~' + x.word.toLowerCase() + '~').join(' '));
  console.log('  windows lit: ' + '#'.repeat(r.lit) + '.'.repeat(M.CONFIG.windows - r.lit));
  console.log('  ' + r.headline + ' ' + r.why);
  console.log('  paper: ' + r.paper);
  return j.share;
}
for (const id of M.ORDER) res[id] = read(id);
const pick = process.argv[3] || 'y2020';
console.log('\n[archive] player picks ' + M.SCRIPTS[pick].year + ' hoping it is plainer');
res.archive = { year: M.SCRIPTS[pick].year, share: read(pick) };
console.log('  the paper\'s line: ' + M.ARCHIVE.map(y => M.SCRIPTS[y].year + ' ' + M.CONFIG.trend[M.SCRIPTS[y].year]).join(', '));
console.log('\n[END]\n  ' + M.verdict(res).join('\n  '));
