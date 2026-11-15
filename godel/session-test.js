// Full session in headless Chromium at phone width (build.md §4.6). Session A: three sentences, the composer with the
// self-praising shape first, then Gödel's shape; the loophole; add the loophole sentence, find Rulebook 2's loophole at
// once; the opposite, four pages and every page after; the certificate bet yes; the verdict; help opened mid-play; About.
// Session B: six composer runs that all settle (Gödel writes shape 6), the opposite rule first, Rulebook 2's loophole missed
// three times (Gödel fills it), bet no. Taps are real clicks. Errors and horizontal scroll go to session-log.txt.
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 380, height: 760 }, deviceScaleFactor: 1 });
  const errors = [], log = [];
  page.on('pageerror', e => errors.push(e.message)); page.on('console', m => { if (m.type() === 'error' && m.text().indexOf('Failed to load resource') < 0) errors.push(m.text()); });
  await page.goto('file://' + path.resolve(__dirname, 'godels-loophole.html')); await page.waitForTimeout(500);
  const shot = (n, full) => page.screenshot({ path: path.join(__dirname, 'screenshot-' + n + '.png'), fullPage: !!full });
  const shotOverlay = async (id, n) => { await page.evaluate(id => { const o = document.getElementById(id); o.style.position = 'absolute'; o.style.inset = 'auto'; o.style.top = '0'; o.style.left = '0'; o.style.right = '0'; document.querySelector('body > .wrap').style.visibility = 'hidden'; }, id); await page.evaluate(() => window.scrollTo(0, 0)); await shot(n, true); await page.evaluate(id => { const o = document.getElementById(id); o.style.position = ''; o.style.inset = ''; o.style.top = ''; o.style.left = ''; o.style.right = ''; document.querySelector('body > .wrap').style.visibility = ''; }, id); };
  const hscroll = async (where) => { if (await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1)) errors.push('horizontal scroll at ' + where); };
  const now = () => page.$eval('#now', e => e.innerText.replace(/\n/g, ' / '));
  const panelText = () => page.$eval('#panel', e => e.innerText.replace(/\n+/g, ' / '));
  const settle = async () => { await page.waitForTimeout(150); await page.click('#panel', { position: { x: 4, y: 4 }, force: true }); for (let i = 0; i < 60; i++) { await page.waitForTimeout(150); if (await page.$('#panel .cbtn') || await page.$('#panel .chip')) break; } };
  const fits = async (sel, where) => { const ok = await page.evaluate(s => { const e = document.querySelector(s); return !!e && e.getBoundingClientRect().bottom <= 700; }, sel); log.push(where + ': ' + sel + ' within 700 px without scrolling: ' + ok); if (!ok) errors.push(sel + ' below 700 px at ' + where); };
  const runSentence = async (s, n, name) => { await page.click('#shapes li:nth-child(' + s + ')'); await page.click('#panel .chip:nth-child(' + n + ')'); if (name) await shot(name + '-set'); await fits('#b-run', 'run ' + s + ':' + n); await page.click('#b-run'); await settle(); log.push('run ' + s + ':' + n + ' → ' + await now() + ' | ' + (await panelText()).slice(0, 220)); if (name) await shot(name); };
  const compose = async (pol, A, B, name) => { const pick = async (row, i) => { await page.locator('#panel .nums').nth(row).locator('.chip').nth(i).click(); await page.waitForTimeout(80); }; await pick(0, pol); await pick(1, A); await pick(2, B); if (name) await shot(name); await page.click('#b-write'); await page.waitForTimeout(900); };
  const nextBtn = async (id) => { await page.click('#' + id); await page.waitForTimeout(700); };

  // ---- Session A ----
  await shot('start', true); await hscroll('start');
  await page.click('#b-begin'); await page.waitForTimeout(400); await shot('a-1-board'); await hscroll('board'); await fits('#b-run', 'board');
  await runSentence(2, 5, 'a-1-run1');
  await nextBtn('b-another'); await runSentence(4, 3, 'a-1-run2');
  await nextBtn('b-another'); await runSentence(5, 5, 'a-1-run3');
  await page.click('#b-help-play'); await page.waitForTimeout(300); await shotOverlay('help', 'help'); await page.click('#b-help-close'); await page.waitForTimeout(200);
  await nextBtn('b-compose'); await shot('a-2-composer'); await hscroll('composer'); await fits('#b-write', 'composer');
  await compose(0, 0, 0, 'a-2-composed-praise');
  await shot('a-2-written'); await runSentence(6, 6, 'a-2-praise');
  await nextBtn('b-compose'); await compose(1, 0, 0);
  await runSentence(6, 6, 'a-2-loophole'); await shot('a-3-loophole', true); await hscroll('loophole');
  await nextBtn('b-close'); await shot('a-4-rule'); await hscroll('rule');
  await page.click('#panel .choice:nth-child(1)'); await page.waitForTimeout(200); await shot('a-4-rule-touched');
  await nextBtn('b-add'); await page.waitForTimeout(1800); await shot('a-4-added', true);
  await nextBtn('b-hunt'); await shot('a-4-hunt'); await runSentence(7, 7, 'a-4-rb2'); await shot('a-4-rb2-found', true);
  await nextBtn('b-leave'); await shot('a-5-other'); await page.click('#panel .choice:nth-child(2)'); await page.waitForTimeout(200); await nextBtn('b-add'); await page.waitForTimeout(1800); await shot('a-5-pages', true);
  for (let k = 1; k <= 5; k++) { const chips = await page.$$('#panel .chip:not([disabled])'); if (!chips.length) break; await chips[0].click(); await settle(); log.push('page ' + k + ' → ' + await now()); }
  await shot('a-5-omega', true); await hscroll('pages');
  await nextBtn('b-leave'); await shot('a-6-cert'); await fits('#b-runcert', 'certificate');
  await page.click('#panel .chip:nth-child(1)'); await page.waitForTimeout(100); await nextBtn('b-runcert'); await settle(); await shot('a-6-cert-run', true); log.push('cert → ' + await now());
  await nextBtn('b-verdict'); await shot('a-end', true); await hscroll('end');
  log.push('VERDICT A: ' + await page.$eval('#s-end', e => e.innerText.replace(/\n+/g, ' / ').slice(0, 1600)));
  await page.click('#b-about'); await page.waitForTimeout(300); await shotOverlay('about', 'about'); await page.click('#b-about-close'); await page.waitForTimeout(200);

  // ---- Session B ----
  await page.click('#b-again'); await page.waitForTimeout(400);
  await runSentence(1, 4); await nextBtn('b-another'); await runSentence(1, 3); await nextBtn('b-another'); await runSentence(3, 2);
  await nextBtn('b-compose');
  const tries = [[0, 1, 2, 1], [1, 2, 5, 6], [0, 0, 3, 6], [1, 5, 0, 6], [1, 0, 0, 5], [0, 4, 0, 6]];
  for (let i = 0; i < tries.length; i++) { const t = tries[i]; await compose(t[0], t[1], t[2]); await runSentence(6, t[3]); if (i < tries.length - 1) await nextBtn('b-compose'); }
  await page.waitForTimeout(2500); await shot('b-2-godel', true); await nextBtn('b-fillgodel'); await runSentence(6, 6, 'b-2-godel-loop');
  await nextBtn('b-close'); await page.click('#panel .choice:nth-child(2)'); await nextBtn('b-add'); await page.waitForTimeout(1800);
  for (let k = 1; k <= 6; k++) { const chips = await page.$$('#panel .chip:not([disabled])'); if (!chips.length) break; await chips[0].click(); await settle(); }
  await nextBtn('b-leave'); await page.click('#panel .choice:nth-child(1)'); await nextBtn('b-add'); await page.waitForTimeout(1800); await nextBtn('b-hunt');
  await runSentence(7, 2); await nextBtn('b-another'); await runSentence(6, 6); await nextBtn('b-another'); await runSentence(7, 6); await page.waitForTimeout(2500); await settle(); await shot('b-4-rb2-godel', true); log.push('rb2 godel → ' + await now());
  await nextBtn('b-leave'); await page.click('#panel .chip:nth-child(2)'); await nextBtn('b-runcert'); await settle(); await nextBtn('b-verdict'); await shot('b-end', true);
  log.push('VERDICT B: ' + await page.$eval('#s-end', e => e.innerText.replace(/\n+/g, ' / ').slice(0, 1200)));

  fs.writeFileSync(path.join(__dirname, 'session-log.txt'), (errors.length ? 'ERRORS:\n' + errors.join('\n') + '\n\n' : 'no page errors, no horizontal scroll\n\n') + log.join('\n') + '\n');
  await browser.close();
  console.log(errors.length ? 'ERRORS: ' + errors.join(' | ') : 'session ok'); console.log(log.join('\n'));
})().catch(e => { console.error('SESSION FAILED', e); process.exit(1); });
