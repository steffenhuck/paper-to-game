// Continuity sweep in headless Chromium: plays several villages with random cards and, after every summer, checks that
// what the game SAYS agrees with what it DRAWS and with the mechanism's record: every villager is accounted for in the
// first sentence, every name in the text is a villager, the fish in hands equal what was eaten plus what the town took,
// the pond label equals the text's pond, the shelf equals the running total, and nothing is ever negative. Also checks
// the eleventh summer and the verdict, and "Another village". Writes sweep-log.txt.
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 380, height: 760 }, deviceScaleFactor: 1 });
  const errors = []; page.on('pageerror', e => errors.push('PAGE ' + e.message)); page.on('console', m => { if (m.type() === 'error' && !/ERR_TUNNEL|count\.js/.test(m.text())) errors.push('CONSOLE ' + m.text()); });
  const villages = Number(process.argv[2] || 6);
  const keys = ['none', 'talk', 'watch', 'weak', 'strong'];
  const log = []; let summers = 0;
  const txt = async (id) => page.evaluate(id => document.getElementById(id).innerText, id);
  const waitPhase = async (id) => page.waitForFunction(id => document.getElementById(id).style.display !== 'none', id, { timeout: 30000 });
  await page.goto('file://' + path.resolve(__dirname, 'ostroms-pond.html') + '#v=777'); await page.waitForTimeout(600);
  await page.click('#b-begin'); await page.waitForTimeout(300);
  for (let v = 0; v < villages; v++) {
    const bias = v % 5; // each village leans on one card so every regime gets long runs too
    for (let t = 0; t < 10; t++) {
      const key = Math.random() < 0.5 ? keys[bias] : keys[Math.floor(Math.random() * keys.length)];
      // the pick screen: no fish in hands, shelf equals the running total, heading right
      const pick = await page.evaluate(() => { const s = window.__game.state; return { summer: s.summer, pond: s.pond, eaten: s.eaten, banned: s.villagers.filter(x => x.banned).map(x => x.name), heading: document.getElementById('h-summer').innerText, shelf: document.getElementById('l-shelf').innerText }; });
      if (pick.heading !== 'Summer ' + (pick.summer + 1) + ' of 10') errors.push(`heading "${pick.heading}" at summer ${pick.summer + 1}`);
      if (pick.shelf !== 'fish eaten so far: ' + (pick.eaten || 'none')) errors.push(`shelf label "${pick.shelf}" vs eaten ${pick.eaten}`);
      await page.click(`.card[data-key=${key}]`); await page.waitForTimeout(80);
      const desc = await txt('desc'); if (!desc.includes(key === 'none' ? 'Leave it be' : key === 'talk' ? 'Have a talk' : key === 'watch' ? 'Take turns watching' : key === 'weak' ? 'now and then' : 'every day')) errors.push('desc does not name the card ' + key);
      await page.click('#b-fish'); await waitPhase('ph-result'); await page.waitForTimeout(60);
      const r = await page.evaluate(() => { const rec = window.__game.rec, s = window.__game.state; return { rec: JSON.parse(JSON.stringify(rec)), names: s.villagers.map(x => x.name), eaten: s.eaten, pond: s.pond, text: document.getElementById('result').innerText, shelf: document.getElementById('l-shelf').innerText, bannedNow: s.villagers.filter(x => x.banned).map(x => x.name) }; });
      const rec = r.rec, text = r.text;
      summers++;
      // 1. everyone accounted for in the first sentence
      const shared = rec.acts.filter(a => !a.banned && !a.watcher && !a.grabbed), grabbers = rec.acts.filter(a => a.grabbed), banned = rec.acts.filter(a => a.banned), watcher = rec.acts.filter(a => a.watcher);
      if (shared.length + grabbers.length + banned.length + watcher.length !== 10) errors.push(`village ${v} summer ${t + 1}: acts do not add to ten`);
      if (!text.startsWith(`${shared.length} of ${shared.length + grabbers.length} took one fish.`)) errors.push(`village ${v} summer ${t + 1}: first sentence "${text.split('.')[0]}" vs ${shared.length} of ${shared.length + grabbers.length}`);
      for (const a of grabbers) if (!text.includes(a.name)) errors.push(`village ${v} summer ${t + 1}: grabber ${a.name} not named`);
      for (const a of banned) if (!text.includes(a.name + ' could not fish') && !text.includes(a.name + ' and') && !text.includes(a.name + ',')) errors.push(`village ${v} summer ${t + 1}: banned ${a.name} not in text`);
      for (const a of watcher) if (!text.includes(a.name + ' watched instead')) errors.push(`village ${v} summer ${t + 1}: watcher ${a.name} not in text`);
      // 2. the fish in hands (what the row draws) equal what the text says was eaten plus the town's fee
      const inHands = rec.acts.reduce((s, a) => s + (a.took - a.fine), 0);
      const m = /We ate (\d+) fish/.exec(text); if (!m) errors.push(`village ${v} summer ${t + 1}: no "we ate"`);
      else if (Number(m[1]) !== inHands - rec.fees) errors.push(`village ${v} summer ${t + 1}: text ate ${m[1]} vs hands ${inHands} − fee ${rec.fees}`);
      if (rec.acts.some(a => a.took - a.fine < 0 || a.took < 0 || a.took > 2)) errors.push(`village ${v} summer ${t + 1}: a hand holds a negative or impossible number of fish`);
      // 3. the pond: text and label agree with the record
      const pm = /The pond: (\d+) fish, (\d+) after fishing.*?babies: (\d+)/.exec(text);
      if (!pm) errors.push(`village ${v} summer ${t + 1}: no pond sentence`);
      else if (Number(pm[1]) !== rec.pondBefore || Number(pm[2]) !== rec.pondAfterFishing || Number(pm[3]) !== rec.pondAfter || rec.pondAfter !== r.pond) errors.push(`village ${v} summer ${t + 1}: pond text ${pm.slice(1).join('/')} vs record ${rec.pondBefore}/${rec.pondAfterFishing}/${rec.pondAfter}/${r.pond}`);
      const took = rec.acts.reduce((s, a) => s + a.took, 0);
      if (rec.pondBefore - took + rec.finesToPond !== rec.pondAfterFishing) errors.push(`village ${v} summer ${t + 1}: pond arithmetic`);
      // 4. the town
      const townTotal = rec.fees + rec.finesToTown;
      if (townTotal && !/The town took/.test(text)) errors.push(`village ${v} summer ${t + 1}: town took ${townTotal} but text silent`);
      if (!townTotal && /The town took/.test(text)) errors.push(`village ${v} summer ${t + 1}: text mentions the town with nothing taken`);
      // 5. the shelf
      if (r.shelf !== 'fish eaten so far: ' + (r.eaten || 'none')) errors.push(`village ${v} summer ${t + 1}: shelf "${r.shelf}" vs ${r.eaten}`);
      if (r.eaten < 0 || rec.eaten < 0) errors.push(`village ${v} summer ${t + 1}: negative eating`);
      // 6. sanctions named consistently
      for (const a of rec.acts) {
        if (a.sanction === 'word' && !text.includes(a.name)) errors.push(`village ${v} summer ${t + 1}: told off ${a.name} unnamed`);
        if ((a.sanction === 'back' || a.sanction === 'ban') && a.fine !== a.took) errors.push(`village ${v} summer ${t + 1}: fish-back sanction with fine ${a.fine} vs took ${a.took}`);
        if (a.sanction === 'town' && a.fine !== a.took) errors.push(`village ${v} summer ${t + 1}: town sanction with fine ${a.fine} vs took ${a.took}`);
        if (a.sanction === 'ban' && !r.bannedNow.includes(a.name)) errors.push(`village ${v} summer ${t + 1}: ${a.name} banned in record but not in state`);
      }
      if (rec.migration && !(rec.migration.came === 'Kit' && r.names.includes('Kit') && !r.names.includes(rec.migration.left))) errors.push(`village ${v} summer ${t + 1}: migration inconsistent`);
      if ((t === 5) !== !!rec.migration) errors.push(`village ${v} summer ${t + 1}: migration at the wrong summer`);
      log.push(`village ${v} summer ${t + 1} ${key}: ${text.replace(/\n+/g, ' / ')}`);
      await page.click('#b-next'); await page.waitForTimeout(120);
    }
    // the eleventh summer and the verdict
    if (!(await page.evaluate(() => document.getElementById('ph-test').style.display !== 'none'))) errors.push(`village ${v}: no eleventh summer`);
    await page.click('#b-test');
    await page.waitForFunction(() => document.getElementById('s-end').classList.contains('on'), null, { timeout: 30000 }); await page.waitForTimeout(100);
    const e = await page.evaluate(() => { const s = window.__game.state, t = s.test; return { test: JSON.parse(JSON.stringify(t)), head: document.getElementById('end-head').innerText, lines: document.getElementById('end-lines').innerText, paper: document.getElementById('end-paper').innerText, pond: s.pond, town: s.paidToTown, hist: s.history.map(h => h.regime) }; });
    const tshared = e.test.acts.filter(a => !a.grabbed && !a.banned && !a.watcher).length, tgrab = e.test.acts.filter(a => a.grabbed);
    if (e.test.pondBefore > 0 && !e.head.includes(`${tshared} of ten still took one fish`)) errors.push(`village ${v}: verdict head "${e.head}" vs ${tshared}`);
    if (e.test.pondBefore <= 0 && !e.head.includes('nothing left')) errors.push(`village ${v}: empty pond verdict wrong`);
    for (const a of tgrab) if (e.test.pondBefore > 0 && !e.lines.includes(a.name)) errors.push(`village ${v}: eleventh-summer grabber ${a.name} not named`);
    if (e.test.pondBefore > 0 && !e.lines.includes(`The pond: ${e.test.pondBefore} fish, then ${e.test.pondAfter}`)) errors.push(`village ${v}: eleventh-summer pond line`);
    if (e.town && !e.lines.includes(`the town took ${e.town}`)) errors.push(`village ${v}: town total ${e.town} not in verdict`);
    if (!/What the paper says/.test(e.paper)) errors.push(`village ${v}: no paper line`);
    log.push(`village ${v} END (${e.hist.join(',')}): ${e.head} / ${e.lines.replace(/\n+/g, ' / ')}`);
    await page.click('#b-again'); await page.waitForTimeout(300);
    const fresh = await page.evaluate(() => { const s = window.__game.state; return { summer: s.summer, eaten: s.eaten, pond: s.pond, rec: window.__game.rec, heading: document.getElementById('h-summer').innerText }; });
    if (fresh.summer !== 0 || fresh.eaten !== 0 || fresh.rec !== null || fresh.heading !== 'Summer 1 of 10') errors.push(`village ${v + 1}: not fresh after Another village`);
  }
  fs.writeFileSync(path.join(__dirname, 'sweep-log.txt'), `${villages} villages, ${summers} summers checked.\n` + log.join('\n') + '\n\nERRORS: ' + (errors.length ? errors.join('\n') : 'none') + '\n');
  console.log(`${villages} villages, ${summers} summers. ERRORS:`, errors.length ? errors : 'none');
  await browser.close();
})();
