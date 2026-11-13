// The play loop on placeholder graphics (build.md §4.2): plays one village headlessly with the stranger's strategy
// from the memo's walkthrough and prints, after each action, what changed and where the player stands.
const M = require('./mechanism.js');
const C = M.CONFIG;
const seed = Number(process.argv[2] || 1234);
const plan = (process.argv[3] || 'talk,talk,watch,watch,watch,watch,weak,watch,watch,watch').split(',');
const s = M.newVillage(seed);
const row = () => s.villagers.map(v => v.name + (v.banned ? '(banned)' : '')).join(' ');
console.log(`Village no. ${seed}. Pond: ${s.pond} fish. Row: ${row()}. Shelf: ${s.eaten} fish eaten.`);
for (let t = 0; t < C.SUMMERS; t++) {
  const key = plan[t] || plan[plan.length - 1];
  console.log(`\nSummer ${t + 1} of ${C.SUMMERS}. You pick: ${M.REGIME[key].name}. (${M.REGIME[key].line} ${M.REGIME[key].cost} ${M.REGIME[key].greedy})`);
  const rec = M.playSummer(s, key, false);
  if (rec.migration) console.log(`  ${rec.migration.left} moved away. ${rec.migration.came} moved in and has never fished here.`);
  if (rec.watcher !== null) console.log(`  ${s.villagers[rec.watcher].name} is the watcher today and does not fish.`);
  for (const a of rec.acts) {
    if (a.banned) { console.log(`  ${a.name}: no fishing this summer (banned).`); continue; }
    if (a.watcher) continue;
    let line = `  ${a.name} takes ${a.took === 0 ? 'nothing (the pond is empty)' : a.took === 1 ? 'one fish' : 'two fish'}` + (a.known === 'hidden' ? ' (in a bucket: the meeting does not know)' : ' (seen)');
    if (a.grabbed && a.sanction === 'word') line += ' and is told off';
    if (a.grabbed && a.sanction === 'back') line += ' and is seen again: both fish back into the pond';
    if (a.grabbed && a.sanction === 'ban') line += ' and is seen a third time: both fish back into the pond, and no fishing next summer';
    if (a.grabbed && a.sanction === 'town') line += ' and the policeman catches them: both fish to the town';
    if (a.grabbed && a.sanction === 'circle') line += ' (a telling-off in next summer’s circle)';
    console.log(line + '.');
  }
  if (rec.fees) console.log(`  The town takes ${rec.fees} fish.`);
  console.log(`  ${rec.shared} of ${rec.fishers} took one fish${rec.grabbers ? '; ' + rec.acts.filter(a => a.grabbed).map(a => a.name).join(', ') + ' took two' : ''}. The pond: ${rec.pondBefore} → ${rec.pondAfterFishing} after fishing, then the fish had babies: ${rec.pondAfter} (${M.pondWord(rec.pondAfter)}). Eaten this summer: ${rec.eaten}. Shelf: ${rec.eatenTotal}.`);
}
console.log(`\nSummer ${C.SUMMERS + 1}. Nobody watching. Nobody talking.`);
const test = M.playSummer(s, 'none', true);
console.log(`  ${test.shared} of ${test.fishers} took one fish${test.grabbers ? '; ' + test.acts.filter(a => a.grabbed).map(a => a.name).join(', ') + ' took two' : ''}. The pond: ${test.pondBefore} → ${test.pondAfter}.`);
console.log(`\nVERDICT. The summer nobody watched: ${test.shared} of ten still took one fish. After ten summers the pond is ${M.pondWord(s.history[9].pondAfter)} and the village ${M.belliesWord((s.history[7].eaten + s.history[8].eaten + s.history[9].eaten) / 3 * C.SUMMERS)}.`);
console.log('  Types: ' + s.villagers.map(v => `${v.name} ${v.type}${v.newcomer ? ' (newcomer)' : ''} norm ${v.norm0.toFixed(2)} → ${v.norm.toFixed(2)}`).join('; '));
