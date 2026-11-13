// Continuity sweep in headless Chromium: plays several villages with random cards and, after every summer, checks that
// what the game SAYS agrees with what it DRAWS and with the mechanism's record, and that the village meeting is told
// only what it could know: the pond count always; a name only from the watcher or from a policeman's catch. Also the
// eleventh summer, the verdict's reveal, and "Another village". Writes sweep-log.txt.
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
  const err = (v, t, msg) => errors.push(`village ${v} summer ${t + 1}: ${msg}`);
  await page.goto('file://' + path.resolve(__dirname, 'ostroms-pond.html') + '#v=777'); await page.waitForTimeout(600);
  await page.click('#b-begin'); await page.waitForTimeout(300);
  for (let v = 0; v < villages; v++) {
    const bias = v % 5;
    for (let t = 0; t < 10; t++) {
      const key = Math.random() < 0.5 ? keys[bias] : keys[Math.floor(Math.random() * keys.length)];
      const pick = await page.evaluate(() => { const s = window.__game.state; return { summer: s.summer, eaten: s.eaten, without: s.without || 0, heading: document.getElementById('h-summer').innerText, shelf: document.getElementById('l-shelf').innerText, row: window.__game.row }; });
      if (pick.heading !== 'Summer ' + (pick.summer + 1) + ' of 10') err(v, t, `heading "${pick.heading}"`);
      if (pick.shelf !== 'times someone had no fish to eat: ' + (pick.without || 'none')) err(v, t, `shelf label "${pick.shelf}" vs without ${pick.without}`);
      if (pick.row.some(r => r.fish || r.bucket)) err(v, t, 'fish or buckets drawn before fishing');
      await page.click(`.card[data-key=${key}]`); await page.waitForTimeout(80);
      const desc = await txt('desc'); if (!desc.includes(key === 'none' ? 'Leave it be' : key === 'talk' ? 'Have a talk' : key === 'watch' ? 'Take turns watching' : key === 'weak' ? 'now and then' : 'every day')) err(v, t, 'desc does not name the card ' + key);
      await page.click('#b-fish'); await waitPhase('ph-result'); await page.waitForTimeout(60);
      const r = await page.evaluate(() => { const rec = window.__game.rec, s = window.__game.state; return { rec: JSON.parse(JSON.stringify(rec)), names: s.villagers.map(x => x.name), eaten: s.eaten, without: s.without || 0, pond: s.pond, text: document.getElementById('result').innerText, shelf: document.getElementById('l-shelf').innerText, bannedNow: s.villagers.filter(x => x.banned).map(x => x.name), row: window.__game.row }; });
      const rec = r.rec, text = r.text; summers++;
      const shared = rec.acts.filter(a => !a.banned && !a.watcher && !a.grabbed), grabbers = rec.acts.filter(a => a.grabbed), banned = rec.acts.filter(a => a.banned), watcher = rec.acts.filter(a => a.watcher);
      const fishers = shared.length + grabbers.length, took = rec.acts.reduce((s, a) => s + a.took, 0);
      if (shared.length + grabbers.length + banned.length + watcher.length !== 10) err(v, t, 'acts do not add to ten');
      // 1. the first sentence: the count the meeting can work out from the pond
      const paras = text.split(/\n+/); const first = paras[0];
      if (rec.pondBefore <= 0) { if (!first.startsWith('The pond is empty. Nobody caught anything.')) err(v, t, `empty-pond sentence "${first}"`); }
      else if (rec.ranOut) { if (!first.startsWith(`The pond ran out. Only ${took} fish came out for ${fishers} of us.`)) err(v, t, `ran-out sentence "${first}"`); }
      else {
        const expect = `${took} fish came out of the pond. ${fishers} of us went fishing, so ` + (grabbers.length === 0 ? 'everyone took one.' : grabbers.length === 1 ? 'one of us took two.' : `${grabbers.length} of us took two.`);
        if (!first.startsWith(expect)) err(v, t, `first sentence "${first}" vs "${expect}"`);
        if (took !== fishers + grabbers.length) err(v, t, 'took does not equal fishers plus grabbers although the pond did not run out');
      }
      for (const a of watcher) if (!first.includes('It was ' + a.name + '’s turn to watch')) err(v, t, `watcher ${a.name} not in first sentence`);
      for (const a of banned) if (!first.includes(a.name)) err(v, t, `banned ${a.name} not in first sentence`);
      // 2. names: only what the meeting could know. A hidden grabber's name must not appear anywhere in the text,
      //    unless they are also the watcher or banned (they are not: hidden means they fished unseen).
      const hiddenNames = rec.acts.filter(a => a.known === 'hidden').map(a => a.name);
      const second = paras[1] || '';
      for (const n of hiddenNames) if (new RegExp('\\b' + n + '\\b').test(second)) err(v, t, `hidden villager ${n} named in "${second}"`);
      for (const a of rec.acts.filter(a => a.known === 'two')) if (!second.includes(a.name)) err(v, t, `seen grabber ${a.name} not named`);
      for (const a of rec.acts.filter(a => a.known === 'one')) if (!second.includes(a.name)) err(v, t, `seen sharer ${a.name} not named`);
      if (key === 'none' || key === 'talk') { if (rec.acts.some(a => a.seen || (a.known !== 'hidden' && a.known !== 'banned' && a.known !== 'watcher'))) err(v, t, 'someone seen with nobody at the pond'); }
      if (key === 'weak' || key === 'strong') { if (rec.acts.some(a => a.known === 'one')) err(v, t, 'the policeman reported a sharer'); if (rec.acts.some(a => a.known === 'two' && a.sanction !== 'town')) err(v, t, 'known grabber not caught'); }
      if (key === 'watch') { if (rec.watcher === null) err(v, t, 'no watcher'); if (!second.startsWith(rec.acts[rec.watcher].name + ' saw ')) err(v, t, `watch sentence "${second}"`); }
      const hiddenGrabbers = rec.acts.filter(a => a.took === 2).length - rec.acts.filter(a => a.known === 'two').length;
      if (rec.acts.some(a => a.sanction && a.took !== 2)) err(v, t, 'a sanction without two fish taken');
      if (hiddenGrabbers > 0 && (key === 'watch' || key === 'weak' || key === 'strong') && !/got away/.test(second)) err(v, t, `${hiddenGrabbers} hidden grabbers but no "got away"`);
      // 3. the row draws what the meeting knows
      for (const a of rec.acts) {
        const d = r.row[a.i];
        if (a.known === 'hidden' && !(d.bucket && d.fish === 0)) err(v, t, `${a.name} hidden but drawn ${JSON.stringify(d)}`);
        if ((a.known === 'one' || a.known === 'two') && (d.bucket || d.fish !== a.took - a.fine || d.lost !== a.fine || d.fish + d.lost !== a.took)) err(v, t, `${a.name} known but drawn ${JSON.stringify(d)}`);
        if (a.known === 'banned' && !d.cross) err(v, t, `${a.name} banned without a cross`);
        if (a.known === 'watcher' && !d.stool) err(v, t, `${a.name} watcher without a stool`);
        if (a.sanction === 'word' && d.note !== 'told off') err(v, t, `${a.name} told off, note "${d.note}"`);
        if (a.sanction === 'back' && !(d.note === 'seen again' && d.note2 === 'fish put back')) err(v, t, `${a.name} fish back, notes "${d.note}/${d.note2}"`);
        if (a.sanction === 'ban' && !(d.note === 'fish put back' && d.note2 === 'no fishing next')) err(v, t, `${a.name} ban, notes "${d.note}/${d.note2}"`);
        if (a.sanction === 'town' && !(d.note === 'caught' && d.note2 === 'to the town')) err(v, t, `${a.name} caught, notes "${d.note}/${d.note2}"`);
      }
      // 4. the pond, the town, the shelf, the books
      const pm = /The pond had (\d+) fish\. We took (\d+)(?: and (\d+) (?:was|were) put back)?, so (\d+|none) (?:was|were) left\./.exec(text), nm = /Now the pond has (\d+)/.exec(text);
      const S = rec.pondAfterFishing, expectBabies = Math.max(0, Math.min(S, 12, 50 - S));
      if (!pm || !nm) err(v, t, 'no pond sentence');
      else {
        if (Number(pm[1]) !== rec.pondBefore || Number(pm[2]) !== took || Number(pm[3] || 0) !== rec.finesToPond || (pm[4] === 'none' ? 0 : Number(pm[4])) !== S || Number(nm[1]) !== rec.pondAfter || rec.pondAfter !== r.pond) err(v, t, `pond text ${pm.slice(1).join('/')}/${nm[1]} vs record ${rec.pondBefore}/${took}/${rec.finesToPond}/${S}/${rec.pondAfter}/${r.pond}`);
        if (rec.growth !== expectBabies || S + rec.growth !== rec.pondAfter) err(v, t, `babies ${rec.growth} vs rule ${expectBabies}`);
        if (rec.growth > 0 && !new RegExp('\\b' + rec.growth + ' bab').test(text)) err(v, t, `babies ${rec.growth} not stated in "${text.split(/\n+/)[2]}"`);
        if (rec.growth === 0 && !/no babies were born|no room for babies/.test(text)) err(v, t, 'zero babies not explained');
      }
      if (rec.pondBefore - took + rec.finesToPond !== rec.pondAfterFishing) err(v, t, 'pond arithmetic');
      const inHands = rec.acts.reduce((s, a) => s + (a.took - a.fine), 0);
      if (rec.eaten !== inHands - rec.fees) err(v, t, `eaten ${rec.eaten} vs hands ${inHands} − fee ${rec.fees}`);
      // who had no fish to eat: the count in the text equals the people with empty hands plus the policeman's pay
      const zero = rec.acts.filter(a => a.ate <= 0).length, expectWithout = zero + Math.min(rec.fees, 10 - zero), last = paras[3] || '';
      if (rec.without !== expectWithout) err(v, t, `without ${rec.without} vs ${expectWithout}`);
      const saysWithout = /^Everyone had a fish to eat\./.test(last) ? 0 : /^One of us had no fish/.test(last) ? 1 : /^All ten of us had no fish/.test(last) ? 10 : (/^(\d+) of us had no fish/.exec(last) || [0, -1])[1];
      if (Number(saysWithout) !== rec.without) err(v, t, `"${last}" vs without ${rec.without}`);
      for (const a of rec.acts) if (a.ate <= 0 && (a.watcher || a.banned || a.sanction) && !last.includes(a.name)) err(v, t, `${a.name} went without but is not named in "${last}"`);
      for (const n of hiddenNames) if (new RegExp('\\b' + n + '\\b').test(last)) err(v, t, `hidden villager ${n} named in "${last}"`);
      const townTotal = rec.fees + rec.finesToTown;
      if (townTotal && !/The town took/.test(text)) err(v, t, `town took ${townTotal} but text silent`);
      if (!townTotal && /The town took/.test(text)) err(v, t, 'text mentions the town with nothing taken');
      if (r.shelf !== 'times someone had no fish to eat: ' + (r.without || 'none')) err(v, t, `shelf "${r.shelf}" vs ${r.without}`);
      if (r.eaten < 0 || rec.eaten < 0 || rec.acts.some(a => a.took - a.fine < 0 || a.took > 2)) err(v, t, 'negative or impossible fish');
      for (const a of rec.acts) { if ((a.sanction === 'back' || a.sanction === 'ban' || a.sanction === 'town') && a.fine !== a.took) err(v, t, `${a.name}: fine ${a.fine} vs took ${a.took}`); if (a.sanction === 'ban' && !r.bannedNow.includes(a.name)) err(v, t, `${a.name} banned in record but not in state`); }
      if ((t === 5) !== !!rec.migration) err(v, t, 'migration at the wrong summer');
      if (rec.migration && !(rec.migration.came === 'Kit' && r.names.includes('Kit') && !r.names.includes(rec.migration.left))) err(v, t, 'migration inconsistent');
      log.push(`village ${v} summer ${t + 1} ${key}: ${text.replace(/\n+/g, ' / ')}`);
      await page.click('#b-next'); await page.waitForTimeout(120);
    }
    // the eleventh summer and the reveal
    if (!(await page.evaluate(() => document.getElementById('ph-test').style.display !== 'none'))) errors.push(`village ${v}: no eleventh summer`);
    await page.click('#b-test');
    await page.waitForFunction(() => document.getElementById('s-end').classList.contains('on'), null, { timeout: 30000 }); await page.waitForTimeout(100);
    const e = await page.evaluate(() => { const s = window.__game.state, t = s.test; return { test: JSON.parse(JSON.stringify(t)), head: document.getElementById('end-head').innerText, lines: document.getElementById('end-lines').innerText + '\n' + document.getElementById('end-lines2').innerText, paper: document.getElementById('end-paper').innerText, pond: s.pond, town: s.paidToTown, row: window.__game.row, types: s.villagers.map(x => ({ name: x.name, type: x.type, newcomer: !!x.newcomer })) }; });
    const tshared = e.test.acts.filter(a => !a.grabbed && !a.banned && !a.watcher).length, tgrab = e.test.acts.filter(a => a.grabbed);
    if (e.test.acts.some(a => a.known !== 'hidden' && a.known !== 'banned')) errors.push(`village ${v}: someone seen in the eleventh summer`);
    if (e.test.pondBefore > 0 && !e.head.includes(`${tshared} of ten took one fish`)) errors.push(`village ${v}: verdict head "${e.head}" vs ${tshared}`);
    if (e.test.pondBefore <= 0 && !e.head.includes('nothing to share')) errors.push(`village ${v}: empty pond verdict wrong`);
    for (const a of tgrab) if (e.test.pondBefore > 0 && !e.lines.includes(a.name)) errors.push(`village ${v}: eleventh-summer grabber ${a.name} not named in the reveal`);
    for (const a of e.test.acts) { const d = e.row[a.i]; if (!a.banned && (d.bucket || d.fish !== a.took)) errors.push(`village ${v}: reveal row draws ${a.name} as ${JSON.stringify(d)} with took ${a.took}`); }
    for (const x of e.types.filter(x => x.type === 'E' && !x.newcomer)) if (!e.lines.includes(x.name)) errors.push(`village ${v}: egoist ${x.name} not named in the reveal`);
    if (e.test.pondBefore > 0 && !e.lines.includes(`The pond: ${e.test.pondBefore} fish, then ${e.test.pondAfter}`)) errors.push(`village ${v}: eleventh-summer pond line`);
    if (e.town && !e.lines.includes(`the town took ${e.town}`)) errors.push(`village ${v}: town total ${e.town} not in verdict`);
    if (!/What Ostrom found/.test(e.paper)) errors.push(`village ${v}: no paper line`);
    log.push(`village ${v} END: ${e.head} / ${e.lines.replace(/\n+/g, ' / ')}`);
    await page.click('#b-again'); await page.waitForTimeout(300);
    const fresh = await page.evaluate(() => { const s = window.__game.state; return { summer: s.summer, eaten: s.eaten, rec: window.__game.rec, heading: document.getElementById('h-summer').innerText }; });
    if (fresh.summer !== 0 || fresh.eaten !== 0 || fresh.rec !== null || fresh.heading !== 'Summer 1 of 10') errors.push(`village ${v + 1}: not fresh after Another village`);
  }
  fs.writeFileSync(path.join(__dirname, 'sweep-log.txt'), `${villages} villages, ${summers} summers checked.\n` + log.join('\n') + '\n\nERRORS: ' + (errors.length ? errors.join('\n') : 'none') + '\n');
  console.log(`${villages} villages, ${summers} summers. ERRORS:`, errors.length ? errors : 'none');
  await browser.close();
})();
