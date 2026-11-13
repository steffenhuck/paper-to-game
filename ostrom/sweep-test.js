// Continuity sweep in headless Chromium: plays several villages with random cards and, after every summer, checks that
// what the game SAYS agrees with what it DRAWS and with the mechanism's record, and that the village meeting is told
// only what it could know: the fish taken always; a name only from the watcher, a policeman's catch, or a public role
// (watching, paying the policeman, not allowed to fish). Also the pond's sum, who went hungry, the eleventh summer, the
// end screen's reveal and table, and "Another village". Writes sweep-log.txt.
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
  const names = (l) => l.length === 0 ? '' : l.length === 1 ? l[0] : l.slice(0, -1).join(', ') + ' and ' + l[l.length - 1];
  const has = (s, n) => new RegExp('\\b' + n + '\\b').test(s);
  await page.goto('file://' + path.resolve(__dirname, 'ostroms-pond.html') + '#v=777'); await page.waitForTimeout(600);
  await page.click('#b-begin'); await page.waitForTimeout(300);
  for (let v = 0; v < villages; v++) {
    const bias = v % 5;
    for (let t = 0; t < 10; t++) {
      const key = Math.random() < 0.5 ? keys[bias] : keys[Math.floor(Math.random() * keys.length)];
      const pick = await page.evaluate(() => { const s = window.__game.state; return { summer: s.summer, without: s.without, heading: document.getElementById('h-summer').innerText, shelf: document.getElementById('l-shelf').innerText, row: window.__game.row }; });
      if (pick.heading !== 'Summer ' + (pick.summer + 1) + ' of 10') err(v, t, `heading "${pick.heading}"`);
      if (pick.shelf !== 'empty plates so far: ' + (pick.without || 'none')) err(v, t, `shelf label "${pick.shelf}" vs ${pick.without}`);
      if (pick.row.some(r => r.fish || r.bucket)) err(v, t, 'fish or buckets drawn before fishing');
      await page.click(`.card[data-key=${key}]`); await page.waitForTimeout(80);
      const desc = await txt('desc'); if (!desc.includes(key === 'none' ? 'Leave it be' : key === 'talk' ? 'Have a talk' : key === 'watch' ? 'Take turns watching' : key === 'weak' ? 'now and then' : 'every day')) err(v, t, 'desc does not name the card ' + key);
      await page.click('#b-fish'); await waitPhase('ph-result'); await page.waitForTimeout(60);
      const r = await page.evaluate(() => { const rec = window.__game.rec, s = window.__game.state; return { rec: JSON.parse(JSON.stringify(rec)), names: s.villagers.map(x => x.name), without: s.without, pond: s.pond, text: document.getElementById('result').innerText, shelf: document.getElementById('l-shelf').innerText, bannedNow: s.villagers.filter(x => x.banned).map(x => x.name), row: window.__game.row }; });
      const rec = r.rec, text = r.text, paras = text.split(/\n+/); summers++;
      const A = rec.acts, payers = A.filter(a => a.payer), banned = A.filter(a => a.banned), watcher = A.filter(a => a.watcher), own = A.filter(a => !a.payer && !a.banned && !a.watcher);
      const ownCatch = own.reduce((s, a) => s + a.took, 0), took = A.reduce((s, a) => s + a.took, 0), tookTwo = A.filter(a => a.took === 2).length;
      if (payers.length + banned.length + watcher.length + own.length !== 10) err(v, t, 'acts do not add to ten');
      if (payers.length !== (key === 'strong' ? 3 : key === 'weak' ? 1 : 0) && banned.length === 0) err(v, t, `${payers.length} payers under ${key}`);
      if (payers.some(a => a.took > 1 || a.ate !== 0 || a.sanction)) err(v, t, 'a payer kept a fish, took two or was sanctioned');
      // 1. the first paragraph: who did not fish for themselves, then the count the meeting can work out
      const first = paras[0], pre = [];
      if (watcher.length) pre.push(`It was ${watcher[0].name}’s turn to watch.`);
      if (payers.length) pre.push(`${names(payers.map(a => a.name))} fished for the policeman.`);
      if (banned.length) pre.push(`${names(banned.map(a => a.name))} ${banned.length > 1 ? 'were' : 'was'} not allowed to fish.`);
      const who = pre.length ? `The other ${own.length}` : `The ${own.length} of us`, them = pre.length ? 'them' : 'us';
      const ranOut = own.some(a => a.took < a.wanted) || payers.some(a => a.took < 1);
      let main;
      if (rec.pondBefore <= 0) main = 'The pond is empty. Nobody caught anything.';
      else if (rec.ranOut) main = `The pond ran out: ${who.charAt(0).toLowerCase() + who.slice(1)} got only ${ownCatch} fish.`;
      else { main = `${who} took ${ownCatch} fish, so ` + (tookTwo === 0 ? 'everyone took one.' : tookTwo === 1 ? `one of ${them} took two.` : `${tookTwo} of ${them} took two.`); if (ownCatch !== own.length + tookTwo) err(v, t, 'own catch does not equal fishers plus those who took two'); }
      const expectFirst = (pre.length ? pre.join(' ') + ' ' : '') + main;
      if (first !== expectFirst) err(v, t, `first paragraph "${first}" vs "${expectFirst}"`);
      // 2. names: only what the meeting could know. A hidden villager's name appears nowhere in the text.
      const hiddenNames = A.filter(a => a.known === 'hidden').map(a => a.name), second = paras[1] || '';
      for (const n of hiddenNames) if (has(text, n)) err(v, t, `hidden villager ${n} named in the text`);
      for (const a of A.filter(a => a.known === 'two')) if (!has(second, a.name)) err(v, t, `seen grabber ${a.name} not named`);
      for (const a of A.filter(a => a.known === 'one')) if (!has(second, a.name)) err(v, t, `seen sharer ${a.name} not named`);
      if (key === 'none' || key === 'talk') { if (A.some(a => a.seen || !['hidden', 'banned'].includes(a.known))) err(v, t, 'someone seen with nobody at the pond'); }
      if (key === 'weak' || key === 'strong') { if (A.some(a => a.known === 'one')) err(v, t, 'the policeman reported a sharer'); if (A.some(a => a.known === 'two' && a.sanction !== 'town')) err(v, t, 'known grabber not caught'); }
      if (key === 'watch') { if (rec.watcher === null) err(v, t, 'no watcher'); else if (!second.startsWith(A[rec.watcher].name + ' saw ')) err(v, t, `watch sentence "${second}"`); }
      const hiddenGrabbers = tookTwo - A.filter(a => a.known === 'two').length;
      if (hiddenGrabbers > 0 && key !== 'none' && key !== 'talk' && !/got away/.test(second)) err(v, t, `${hiddenGrabbers} hidden grabbers but no "got away"`);
      if (A.some(a => a.sanction && a.took !== 2)) err(v, t, 'a sanction without two fish taken');
      if (/red flag|to the town|had no fish to eat/.test(text)) err(v, t, 'old wording in the text');
      // 3. the row draws what the meeting knows, with one plain caption each
      for (const a of A) {
        const d = r.row[a.i];
        if (a.known === 'hidden' && !(d.bucket && d.fish === 0)) err(v, t, `${a.name} hidden but drawn ${JSON.stringify(d)}`);
        if ((a.known === 'one' || a.known === 'two') && (d.bucket || d.fish !== a.took)) err(v, t, `${a.name} seen taking ${a.took} but drawn ${JSON.stringify(d)}`);
        if (a.known === 'payer' && !(d.note === 'pays the' && d.note2 === 'policeman' && d.fish === 0 && !d.bucket)) err(v, t, `${a.name} payer drawn ${JSON.stringify(d)}`);
        if (a.known === 'banned' && !d.cross) err(v, t, `${a.name} banned without a cross`);
        if (a.known === 'watcher' && !(d.stool && d.note === 'watching')) err(v, t, `${a.name} watcher drawn ${JSON.stringify(d)}`);
        if (a.sanction === 'word' && d.note !== 'told off') err(v, t, `${a.name} told off, note "${d.note}"`);
        if (a.sanction === 'back' && !(d.note === 'fish put back' && !d.note2)) err(v, t, `${a.name} fish back, notes "${d.note}/${d.note2}"`);
        if (a.sanction === 'ban' && !(d.note === 'fish put back' && d.note2 === 'no fishing next')) err(v, t, `${a.name} ban, notes "${d.note}/${d.note2}"`);
        if (a.sanction === 'town' && !(d.note === 'caught' && !d.note2)) err(v, t, `${a.name} caught, notes "${d.note}/${d.note2}"`);
      }
      // 4. the pond's sum on screen equals the record and the rule
      const third = paras[2] || '';
      const pm = /^The pond had (\d+) fish\. We took (\d+)(?: \((\d+) of them for the policeman\))?(?: and (\d+) (?:was|were) put back)?, so (\d+|none) (?:was|were) left\./.exec(third), nm = /Now the pond has (\d+)/.exec(third);
      const S = rec.pondAfterFishing, expectBabies = Math.max(0, Math.min(S, 12, 50 - S));
      if (!pm || !nm) err(v, t, `no pond sentence in "${third}"`);
      else {
        if (Number(pm[1]) !== rec.pondBefore || Number(pm[2]) !== took || Number(pm[3] || 0) !== rec.fees || Number(pm[4] || 0) !== rec.finesToPond || (pm[5] === 'none' ? 0 : Number(pm[5])) !== S || Number(nm[1]) !== rec.pondAfter || rec.pondAfter !== r.pond) err(v, t, `pond text "${third}" vs record ${rec.pondBefore}/${took}/${rec.fees}/${rec.finesToPond}/${S}/${rec.pondAfter}`);
        if (rec.pondBefore - took + rec.finesToPond !== S) err(v, t, 'pond arithmetic');
        if (rec.growth !== expectBabies || S + rec.growth !== rec.pondAfter) err(v, t, `babies ${rec.growth} vs rule ${expectBabies}`);
        if (rec.growth > 0 && !new RegExp('\\b' + rec.growth + ' bab').test(third)) err(v, t, `babies ${rec.growth} not stated`);
        if (rec.growth === 0 && !/no babies were born|no room for babies/.test(third)) err(v, t, 'zero babies not explained');
      }
      if (rec.fees !== payers.reduce((s, a) => s + a.took, 0)) err(v, t, 'the policeman’s pay is not the payers’ fish');
      // 5. who went hungry: the count on screen equals the villagers who ended the summer with no fish
      const hungry = A.filter(a => a.ate <= 0), last = paras[3] || '';
      if (rec.without !== hungry.length) err(v, t, `without ${rec.without} vs ${hungry.length} with no fish`);
      const says = /^Nobody went hungry this summer\./.test(last) ? 0 : Number((/^Went hungry this summer: (\d+)\./.exec(last) || [0, -1])[1]);
      if (says !== rec.without) err(v, t, `"${last}" vs ${rec.without} hungry`);
      for (const a of hungry) if ((a.watcher || a.banned || a.payer || a.sanction) && !has(last, a.name)) err(v, t, `${a.name} went hungry but is not named in "${last}"`);
      if (r.shelf !== 'empty plates so far: ' + (r.without || 'none')) err(v, t, `shelf "${r.shelf}" vs ${r.without}`);
      if (A.some(a => a.ate < 0 || a.took > 2 || a.took < 0)) err(v, t, 'negative or impossible fish');
      for (const a of A) { if ((a.sanction === 'back' || a.sanction === 'ban' || a.sanction === 'town') && a.fine !== a.took) err(v, t, `${a.name}: fine ${a.fine} vs took ${a.took}`); if (a.sanction === 'ban' && !r.bannedNow.includes(a.name)) err(v, t, `${a.name} banned in record but not in state`); }
      if ((t === 5) !== !!rec.migration) err(v, t, 'migration at the wrong summer');
      if (rec.migration && !(rec.migration.came === 'Kit' && r.names.includes('Kit') && !r.names.includes(rec.migration.left))) err(v, t, 'migration inconsistent');
      log.push(`village ${v} summer ${t + 1} ${key}: ${text.replace(/\n+/g, ' / ')}`);
      await page.click('#b-next'); await page.waitForTimeout(120);
    }
    // the eleventh summer, the reveal and the table
    if (!(await page.evaluate(() => document.getElementById('ph-test').style.display !== 'none'))) errors.push(`village ${v}: no eleventh summer`);
    await page.click('#b-test');
    await page.waitForFunction(() => document.getElementById('s-end').classList.contains('on'), null, { timeout: 30000 }); await page.waitForTimeout(100);
    const e = await page.evaluate(() => { const s = window.__game.state, t = s.test, you = document.querySelector('table.typ tr.you'); return { test: JSON.parse(JSON.stringify(t)), head: document.getElementById('end-head').innerText, lines: document.getElementById('end-lines').innerText + '\n' + document.getElementById('end-lines2').innerText, paper: document.getElementById('end-paper').innerText, pondEnd: s.history[9].pondAfter, without: s.without, row: window.__game.row, you: you ? Array.from(you.children).map(c => c.innerText) : null, rows: document.querySelectorAll('table.typ tr').length, types: s.villagers.map(x => ({ name: x.name, type: x.type, newcomer: !!x.newcomer })) }; });
    const tshared = e.test.acts.filter(a => !a.grabbed && !a.banned && !a.watcher).length, tgrab = e.test.acts.filter(a => a.grabbed);
    if (e.test.acts.some(a => a.known !== 'hidden' && a.known !== 'banned') || e.test.acts.some(a => a.payer)) errors.push(`village ${v}: someone seen or paying in the eleventh summer`);
    if (e.test.pondBefore > 0 && !e.head.includes(`${tshared} of ten took one fish`)) errors.push(`village ${v}: verdict head "${e.head}" vs ${tshared}`);
    if (e.test.pondBefore <= 0 && !e.head.includes('nothing to share')) errors.push(`village ${v}: empty pond verdict wrong`);
    for (const a of tgrab) if (e.test.pondBefore > 0 && !e.lines.includes(a.name)) errors.push(`village ${v}: eleventh-summer grabber ${a.name} not named in the reveal`);
    for (const a of e.test.acts) { const d = e.row[a.i]; if (!a.banned && (d.bucket || d.fish !== a.took)) errors.push(`village ${v}: reveal row draws ${a.name} as ${JSON.stringify(d)} with took ${a.took}`); }
    for (const x of e.types.filter(x => x.type === 'E' && !x.newcomer)) if (!e.lines.includes(x.name)) errors.push(`village ${v}: egoist ${x.name} not named in the reveal`);
    if (e.test.pondBefore > 0 && !e.lines.includes(`The pond: ${e.test.pondBefore} fish, then ${e.test.pondAfter}`)) errors.push(`village ${v}: eleventh-summer pond line`);
    if (e.without && !e.lines.includes(e.without === 1 ? '1 empty plate' : `${e.without} empty plates`)) errors.push(`village ${v}: ${e.without} empty plates not in the verdict`);
    if (!e.without && !e.lines.includes('Nobody ever went hungry')) errors.push(`village ${v}: no-hunger verdict missing`);
    const expectYou = ['your village', String(e.without), String(e.pondEnd), String(e.test.pondBefore > 0 ? tshared : 0)];
    if (!e.you || e.you.join('|') !== expectYou.join('|') || e.rows !== 7) errors.push(`village ${v}: table row ${JSON.stringify(e.you)} vs ${JSON.stringify(expectYou)}, ${e.rows} rows`);
    if (!/What Ostrom found/.test(e.paper)) errors.push(`village ${v}: no paper line`);
    log.push(`village ${v} END: ${e.head} / ${e.lines.replace(/\n+/g, ' / ')}`);
    await page.click('#b-again'); await page.waitForTimeout(300);
    const fresh = await page.evaluate(() => { const s = window.__game.state; return { summer: s.summer, without: s.without, rec: window.__game.rec, heading: document.getElementById('h-summer').innerText }; });
    if (fresh.summer !== 0 || fresh.without !== 0 || fresh.rec !== null || fresh.heading !== 'Summer 1 of 10') errors.push(`village ${v + 1}: not fresh after Another village`);
  }
  fs.writeFileSync(path.join(__dirname, 'sweep-log.txt'), `${villages} villages, ${summers} summers checked.\n` + log.join('\n') + '\n\nERRORS: ' + (errors.length ? errors.join('\n') : 'none') + '\n');
  console.log(`${villages} villages, ${summers} summers. ERRORS:`, errors.length ? errors.slice(0, 14) : 'none', errors.length > 14 ? `(+${errors.length - 14} more)` : '');
  await browser.close();
})();
