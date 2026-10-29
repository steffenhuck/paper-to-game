// Placeholder loop: play one street headlessly and print what the stranger would see after each action.
const M = require('./mechanism.js');
const g = M.newGame(2018);
const plan = ['income', 'income', 'italy', 'asylum', 'reach', 'uk', 'uk', 'pirates', 'uk', 'asylum', 'asylum', 'pirates'];
const wall = () => M.ids.map(id => `${M.poster(id).tag}[${g.notes[id].map(c => c[0].toUpperCase()).join('')}]`).join(' ');
plan.forEach(id => {
  const p = M.knock(g, id);
  console.log(`knock ${p.n} (${g.knocksLeft} left) · ask about ${M.poster(id).tag}: ${p.name}, ${p.age}: "${p.say}" ${p.aside} → ${p.colour.toUpperCase()} note: ${p.note}`);
  console.log('   wall: ' + wall());
});
// stamp by the notes: scrap if any red outnumbers green, else print
M.ids.forEach(id => { const n = g.notes[id], gr = n.filter(x => x === 'green').length, rd = n.filter(x => x === 'red').length; M.setStamp(g, id, rd > gr ? 'scrap' : 'print'); });
console.log('\nstamps: ' + M.ids.map(id => `${M.poster(id).tag}=${g.stamps[id]}`).join(', '));
const s = M.send(g);
s.results.forEach(r => console.log(`  ${r.tag.padEnd(9)} ${r.line} ${r.call}`));
console.log(`\nbalance: warned ${s.warn}, backfired ${s.back} (best: ${s.best.warn} / ${s.best.back})`);
const v = M.verdict(g); console.log('\nYOU: ' + v.you + '\nPAPER: ' + v.paper + '\nMEANS: ' + v.means);
