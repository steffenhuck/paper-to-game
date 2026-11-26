// Scripted sessions in headless Chromium (Playwright). Run: node session-test.js. Writes screenshot-*.png; prints what the game said; exits 1 on a page error or horizontal scroll.
var { chromium } = require('playwright'), path = require('path');
var URL = 'file://' + path.resolve('meitners-drop.html');
(async function () {
  var b = await chromium.launch(process.env.CHROME ? { executablePath: process.env.CHROME, args: ['--no-sandbox'] } : {}), errs = [];
  async function session(vw, vh, tag, actsU, actsT, shots, seed) {
    var ctx = await b.newContext({ viewport: { width: vw, height: vh }, deviceScaleFactor: 2 }), pg = await ctx.newPage();
    pg.on('pageerror', function (e) { errs.push('pageerror: ' + e); });
    pg.on('console', function (m) { if (m.type() === 'error' && m.text().indexOf('gc.zgo') < 0 && m.text().indexOf('ERR_') < 0) errs.push('console: ' + m.text()); });
    async function shot(n, full) { if (shots) await pg.screenshot({ path: 'screenshot-' + tag + n + '.png', fullPage: !!full }); }
    async function nohs(l) { var w = await pg.evaluate('document.documentElement.scrollWidth'); if (w > vw) errs.push('hscroll ' + l + ': ' + w); }
    async function bottom(sel) { return Math.round(await pg.evaluate(function (s) { var e = document.querySelector(s); return e ? e.getBoundingClientRect().bottom : -1; }, sel)); }
    await pg.goto(URL + '?seed=' + seed); await pg.waitForTimeout(400); await shot('start'); await nohs('start');
    await pg.click('#b-help-start'); await pg.waitForTimeout(200); await shot('help', true); await pg.click('#b-help-close');
    await pg.click('#b-begin'); await pg.waitForTimeout(300); await shot('drops-empty'); await nohs('drops');
    await pg.click('g.tapdrop[data-i="0"]'); await pg.waitForTimeout(900); await shot('drops-lead');
    await pg.waitForTimeout(800);
    await pg.click('g.tapdrop[data-i="2"]'); await pg.waitForTimeout(1000); await shot('drops-imagined'); await pg.waitForTimeout(800);
    await pg.click('g.tapdrop[data-i="1"]'); await pg.waitForTimeout(1100); await shot('drops-uranium'); await pg.waitForTimeout(1200);
    console.log(tag, 'drops |', await pg.textContent('#said0'));
    await pg.click('#b-toshelf'); await pg.waitForTimeout(300); await shot('shelf', true); await nohs('shelf');
    await pg.click('#b-tobench'); await pg.waitForTimeout(300); await shot('bench-start'); await nohs('bench');
    console.log(tag, 'bench: split button bottom', await bottom('#b-split'), 'table bottom', await bottom('#tablesvg'), 'shelf cards bottom', await bottom('#shelf1'), 'viewport', vh);
    // a real drag on the drop panel
    var box = await (await pg.$('#dropsvg')).boundingBox();
    await pg.mouse.move(box.x + box.width * 0.5, box.y + box.height * 0.9); await pg.mouse.down(); await pg.mouse.move(box.x + box.width * 0.62, box.y + box.height * 0.9, { steps: 6 }); await pg.mouse.up();
    console.log(tag, 'after drag | line at', await pg.evaluate('window.__game.S.Z1'));
    for (var i = 0; i < actsU.length; i++) {
      var a = actsU[i];
      if (a === 'hold') { await shot('u' + (i + 1) + '-before-hold'); await pg.click('#b-hold'); }
      else { await pg.evaluate(function (z) { window.__game.setLine(z); }, a); await pg.waitForTimeout(150); await shot('u' + (i + 1) + '-set'); await pg.click('#b-split'); await pg.waitForTimeout(1000); await shot('u' + (i + 1) + '-snap'); }
      await pg.waitForTimeout(1500); await shot('u' + (i + 1) + '-climb');
      await pg.waitForTimeout(3600); await shot('u' + (i + 1) + '-result', true);
      console.log(tag, 'U' + (i + 1), '|', await pg.textContent('#now1'), '|', (await pg.textContent('#said1')).slice(0, 160), '|', await pg.textContent('#cap'));
      if (i === 0) { await pg.click('#b-help-bench'); await pg.waitForTimeout(150); await pg.click('#b-help-close2'); console.log(tag, 'help returned to', await pg.evaluate("document.querySelector('.screen.on').id")); }
      var nb = await pg.textContent('#b-next'); console.log(tag, 'next button:', nb);
      await pg.click('#b-next'); await pg.waitForTimeout(300);
      if (nb.indexOf('thorium') >= 0 || nb.indexOf('verdict') >= 0) break;
    }
    await shot('th-start');
    for (var j = 0; j < actsT.length; j++) {
      var a2 = actsT[j];
      if (a2 === 'hold') await pg.click('#b-hold'); else { await pg.evaluate(function (z) { window.__game.setLine(z); }, a2); await pg.click('#b-split'); }
      await pg.waitForTimeout(6400); await shot('th' + (j + 1) + '-result', true);
      console.log(tag, 'Th' + (j + 1), '|', await pg.textContent('#now1'), '|', (await pg.textContent('#said1')).slice(0, 160));
      var nb2 = await pg.textContent('#b-next'); await pg.click('#b-next'); await pg.waitForTimeout(300);
      if (nb2.indexOf('verdict') >= 0) break;
    }
    await shot('end', true); await nohs('end');
    console.log(tag, 'FATE |', await pg.textContent('#fate'), '|', await pg.textContent('#seedline'));
    console.log(tag, 'FOUND |', await pg.textContent('#v-found'));
    console.log(tag, 'PART |', await pg.textContent('#v-part'));
    await pg.click('#b-about-end'); await pg.waitForTimeout(200); await shot('about', true); await pg.click('#b-about-close');
    await pg.click('#b-again'); await pg.waitForTimeout(200); console.log(tag, 'again ->', await pg.evaluate("document.querySelector('.screen.on').id"));
    await ctx.close();
  }
  await session(380, 700, 'a-', [43, 'hold', 56, 56], [38, 38, 38], true, 7);
  await session(380, 700, 'b-', [56, 56, 43, 52], [45, 38, 38], true, 2);
  await session(1100, 800, 'laptop-', [43, 'hold', 52, 52], [56, 38, 38], true, 7);
  await b.close();
  if (errs.length) { console.log('ERRORS:\n' + errs.join('\n')); process.exit(1); }
  console.log('sessions ok, no errors, no horizontal scroll');
})();
