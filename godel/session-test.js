// Full session in headless Chromium at phone width (build.md §4.6). Session A: a number fact, a line about line 2, the
// self-praising line, then Gödel's line (the loophole on the 4th line); make it a rule, write Marker 2 its line at once;
// the opposite, four days and after; the promise, bet yes; the verdict; help opened mid-play; About. Session B: six lines
// that all get marks (Gödel writes the line), the opposite rule first, Marker 2's loophole missed three times (Gödel writes
// it), bet no. Taps are real clicks. Errors and horizontal scroll go to session-log.txt.
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 380, height: 700 }, deviceScaleFactor: 1 });
  const errors = [], log = [];
  page.on('pageerror', e => errors.push(e.message)); page.on('console', m => { if (m.type() === 'error' && m.text().indexOf('Failed to load resource') < 0) errors.push(m.text()); });
  await page.goto('file://' + path.resolve(__dirname, 'godels-endgame.html')); await page.waitForTimeout(500);
  const shot = (n, full) => page.screenshot({ path: path.join(__dirname, 'screenshot-' + n + '.png'), fullPage: !!full });
  const shotOverlay = async (id, n) => { await page.evaluate(id => { const o = document.getElementById(id); o.style.position = 'absolute'; o.style.inset = 'auto'; o.style.top = '0'; o.style.left = '0'; o.style.right = '0'; document.querySelector('body > .wrap').style.visibility = 'hidden'; }, id); await page.evaluate(() => window.scrollTo(0, 0)); await shot(n, true); await page.evaluate(id => { const o = document.getElementById(id); o.style.position = ''; o.style.inset = ''; o.style.top = ''; o.style.left = ''; o.style.right = ''; document.querySelector('body > .wrap').style.visibility = ''; }, id); };
  const hscroll = async (where) => { if (await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1)) errors.push('horizontal scroll at ' + where); };
  const now = () => page.$eval('#now', e => e.innerText.replace(/\n/g, ' / '));
  const panelText = () => page.$eval('#panel', e => e.innerText.replace(/\n+/g, ' / '));
  const settle = async () => { await page.waitForTimeout(150); await page.click('#panel', { position: { x: 4, y: 4 }, force: true }); for (let i = 0; i < 80; i++) { await page.waitForTimeout(150); if (await page.$('#panel .cbtn:not([disabled])') || await page.$('#panel .chip:not([disabled])')) break; } };
  const fits = async (sel, where, topSel) => { await page.waitForTimeout(120); const ok = await page.evaluate(([s, ts]) => { const e = document.querySelector(s), t = document.querySelector(ts || '#sent'); return !!e && e.getBoundingClientRect().bottom <= 700 && !!t && t.getBoundingClientRect().top >= 0; }, [sel, topSel]); log.push(where + ': ' + sel + ' and ' + (topSel || '#sent') + ' on screen together (700 px): ' + ok); if (!ok) errors.push(sel + ' not on screen with ' + (topSel || '#sent') + ' at ' + where); };
  const pick = async (row, i) => { await page.locator('#panel .nums').nth(row).locator('.chip').nth(i).click(); await page.waitForTimeout(80); };
  const writeNum = async (n, pred, name) => { await pick(0, 0); await pick(1, n - 2); await pick(2, pred); if (name) await shot(name + '-set'); await fits('#b-write', 'write'); await page.click('#b-write'); await settle(); const pr = await markIt(); log.push('wrote ' + n + '/' + pred + ' pressed ' + pr + ' → ' + await now() + ' | ' + (await panelText()).slice(0, 200)); if (name) await shot(name); };
  const writeMk = async (will, targetIdx, name) => { await pick(0, 1); await pick(1, will ? 0 : 1); await pick(2, targetIdx); if (name) await shot(name + '-set'); await fits('#b-write', 'write mk'); await page.click('#b-write'); await settle(); if (name) await shot(name + '-pending'); const pr = await markIt(); log.push('wrote mk ' + (will ? 'will' : 'never') + ' #' + targetIdx + ' pressed ' + pr + ' → ' + await now() + ' | ' + (await panelText()).slice(0, 240)); if (name) await shot(name); };
  const thisLine = async () => (await page.locator('#panel .nums').nth(2).locator('.chip').count()) - 1;
  const nextBtn = async (id) => { await page.click('#' + id); await page.waitForTimeout(700); };
  // press the Marker's buttons: tick first; if refused, cross; if both refused, leave it unmarked
  const markIt = async () => { for (let i = 0; i < 40 && !(await page.$('#b-tick')); i++) await page.waitForTimeout(150); await page.click('#b-tick'); await settle(); let pressed = 'tick'; if (await page.$('#b-cross:not([disabled])') && !(await page.$('#b-next')) && !(await page.$('#b-none'))) { await page.click('#b-cross'); await settle(); pressed += ',cross'; } if (await page.$('#b-none')) { await page.click('#b-none'); await settle(); pressed += ',none'; } return pressed; };

  // ---- Session A ----
  await shot('start', true); await hscroll('start');
  await page.click('#b-begin'); await page.waitForTimeout(400); await shot('a-1-board'); await hscroll('board');
  await writeNum(7, 1, 'a-1-num'); await nextBtn('b-next');
  await pick(0, 1); await shot('a-1-mk-tab'); await writeMk(true, 1, 'a-1-about2'); await nextBtn('b-next');
  await page.click('#b-help-play'); await page.waitForTimeout(300); await shotOverlay('help', 'help'); await page.click('#b-help-close'); await page.waitForTimeout(200);
  await pick(0, 1); await pick(1, 0); const t1 = await thisLine(); await writeMk(true, t1, 'a-2-praise'); await nextBtn('b-next');
  await pick(0, 1); await pick(1, 1); const t2 = await thisLine(); await writeMk(false, t2, 'a-2-loophole'); await shot('a-3-loophole', true); await hscroll('loophole');
  await nextBtn('b-close'); await shot('a-4-rule'); await page.click('#panel .choice:nth-child(1)'); await page.waitForTimeout(200); await shot('a-4-rule-touched');
  await nextBtn('b-add'); await page.waitForTimeout(1800); await shot('a-4-added', true);
  await nextBtn('b-hunt'); await shot('a-4-hunt'); await hscroll('hunt');
  await pick(0, 1); await pick(1, 1); const t3 = await thisLine(); await writeMk(false, t3, 'a-4-mk2'); await shot('a-4-mk2-found', true);
  await nextBtn('b-leave'); await shot('a-5-other'); await page.click('#panel .choice:nth-child(2)'); await page.waitForTimeout(200); await nextBtn('b-add'); await page.waitForTimeout(1800); await shot('a-5-days', true);
  for (let k = 1; k <= 5; k++) { const chips = await page.$$('#panel .chip:not([disabled])'); if (!chips.length) break; await chips[0].click(); await settle(); log.push('day ' + k + ' → ' + await now()); }
  await shot('a-5-omega', true); await hscroll('days');
  await nextBtn('b-leave'); await shot('a-6-promise'); await fits('#b-runp', 'promise');
  await page.click('#panel .chip:nth-child(1)'); await page.waitForTimeout(100); await nextBtn('b-runp'); await settle(); await shot('a-6-promise-run', true); log.push('promise → ' + await now());
  await nextBtn('b-verdict'); await shot('a-end', true); await hscroll('end');
  log.push('VERDICT A: ' + await page.$eval('#s-end', e => e.innerText.replace(/\n+/g, ' / ').slice(0, 1600)));
  await page.click('#b-about'); await page.waitForTimeout(300); await shotOverlay('about', 'about'); await page.click('#b-about-close'); await page.waitForTimeout(200);

  // ---- Session B ----
  await page.click('#b-again'); await page.waitForTimeout(400);
  await writeNum(4, 0); await nextBtn('b-next'); await writeNum(3, 2); await nextBtn('b-next');
  await writeMk(false, 0); await nextBtn('b-next'); await writeMk(true, 2); await nextBtn('b-next'); await writeNum(9, 1); await nextBtn('b-next'); await writeMk(false, 3);
  await page.waitForTimeout(2500); await shot('b-2-godel', true); await nextBtn('b-markgodel'); await settle(); await markIt(); await shot('b-2-godel-marked', true); log.push('godel → ' + await now());
  await nextBtn('b-close'); await page.click('#panel .choice:nth-child(2)'); await nextBtn('b-add'); await page.waitForTimeout(1800);
  for (let k = 1; k <= 6; k++) { const chips = await page.$$('#panel .chip:not([disabled])'); if (!chips.length) break; await chips[0].click(); await settle(); }
  await nextBtn('b-leave'); await page.click('#panel .choice:nth-child(1)'); await nextBtn('b-add'); await page.waitForTimeout(1800); await nextBtn('b-hunt');
  await writeMk(true, 0); await nextBtn('b-next'); await writeMk(false, 1); await nextBtn('b-next'); await writeMk(true, 8);
  await page.waitForTimeout(2500); await shot('b-4-mk2-godel', true); await nextBtn('b-markgodel2'); await settle(); await markIt(); log.push('mk2 godel → ' + await now());
  await nextBtn('b-leave'); await page.click('#panel .chip:nth-child(2)'); await nextBtn('b-runp'); await settle(); await nextBtn('b-verdict'); await shot('b-end', true);
  log.push('VERDICT B: ' + await page.$eval('#s-end', e => e.innerText.replace(/\n+/g, ' / ').slice(0, 1200)));

  fs.writeFileSync(path.join(__dirname, 'session-log.txt'), (errors.length ? 'ERRORS:\n' + errors.join('\n') + '\n\n' : 'no page errors, no horizontal scroll\n\n') + log.join('\n') + '\n');
  await browser.close();
  console.log(errors.length ? 'ERRORS: ' + errors.join(' | ') : 'session ok'); console.log(log.join('\n'));
})().catch(e => { console.error('SESSION FAILED', e); process.exit(1); });
