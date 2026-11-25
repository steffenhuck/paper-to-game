// Full session in headless Chromium at phone width (build.md §4.6). Session A, a plausible stranger: burn 100 then all the
// way; swap quietly with the cat, then the diamond; mark with the lamp, then a roll; help opened mid-play and closed; the
// shift ended; the stick pushed twice, pulled out, wanted once; beam with the lamp, then the memory; booked by beam.
// Session B: the paper's reader: one burn, one quiet, one mark, the memory, booked by pod. Session C: beam and burn.
// Screenshots at the moments that matter; errors and horizontal scroll go to session-log.txt.
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
(async () => {
  const browser = await chromium.launch();
  const errors = [], log = [];
  async function session(name, plan) {
    const page = await browser.newPage({ viewport: { width: 380, height: 760 }, deviceScaleFactor: 1 });
    page.on('pageerror', e => errors.push(name + ': ' + e.message)); page.on('console', m => { if (m.type() === 'error' && m.text().indexOf('Failed to load resource') < 0) errors.push(name + ': ' + m.text()); });
    const shot = (n, full) => page.screenshot({ path: path.join(__dirname, 'screenshot-' + name + '-' + n + '.png'), fullPage: !!full });
    const hscroll = async (where) => { if (await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1)) errors.push(name + ': horizontal scroll at ' + where); };
    const text = (sel) => page.$eval(sel, e => e.innerText.replace(/\n+/g, ' / ')).catch(() => '(none)');
    const fits = async (where) => { const b = await page.evaluate(() => { const g = document.getElementById('k-go'); return g ? g.getBoundingClientRect().bottom : -1; }); log.push(name + ' ' + where + ': commit key bottom at ' + Math.round(b) + ' px'); if (b > 700) errors.push(name + ': commit key below 700 px at ' + where + ' (' + Math.round(b) + ')'); };
    const playFrames = async (label, shotPics) => {
      let n = 0;
      while (true) {
        await page.waitForTimeout(1500); await page.evaluate(() => window.scrollTo(0, 0));
        const g = await page.evaluate(() => { const x = window.__game.get(); return { fi: x.fi, n: x.frames.length, phase: x.phase, pic: x.frames[x.fi] && x.frames[x.fi].pic }; });
        if (g.phase !== 'frames') break;
        if (!shotPics || shotPics.indexOf(g.pic) >= 0) await shot(label + '-' + (g.fi + 1) + '-' + g.pic);
        log.push(name + ' ' + label + ' frame ' + (g.fi + 1) + '/' + g.n + ' [' + g.pic + ']: ' + await text('#frame-text'));
        n++; if (n > 12) { errors.push(name + ': frames did not end at ' + label); break; }
        await page.click('#b-step');
      }
      await page.waitForTimeout(300); await shot(label + '-result', true);
      log.push(name + ' ' + label + ' RESULT: ' + await text('#result') + ' || BOOK: ' + await text('#book') + ' || MORAL: ' + await text('#moral') + ' || LEIB: ' + await text('#leib'));
    };
    const tryKey = async (key, pick, label, shotPics) => {
      await page.click('#k-' + key); await page.waitForTimeout(200); await page.click('#p-' + pick); await page.waitForTimeout(250);
      await shot(label + '-set'); await fits(label); await hscroll(label);
      log.push(name + ' ' + label + ' preview: ' + await text('.preview'));
      await page.click('#k-go'); await playFrames(label, shotPics);
      await page.click('#k-next'); await page.waitForTimeout(250);
    };
    await page.goto('file://' + path.resolve(__dirname, 'beam-me-up-leibniz.html')); await page.waitForTimeout(500);
    if (name === 'a') { await shot('start', true); await hscroll('start'); log.push('START: ' + await text('#s-start')); }
    await page.click('#b-begin'); await page.waitForTimeout(400);
    await shot('1-empty', true); await hscroll('shift 1'); log.push(name + ' DONOW: ' + await text('#donow') + ' | TAPES: ' + await text('#tapes'));
    await plan({ page, shot, tryKey, playFrames, text, log, hscroll, fits });
    await page.close();
  }

  await session('a', async ({ page, shot, tryKey, playFrames, text, log, hscroll }) => {
    await tryKey('burn', 'd2', '1-burn100', ['fire', 'peel', 'remains']);
    await tryKey('burn', 'd3', '1-burnall', ['remains']);
    await page.click('#b-help-play'); await page.waitForTimeout(300); await shot('help', true); await page.click('#b-help-close'); await page.waitForTimeout(200);
    log.push('a help closed, phase: ' + await page.evaluate(() => window.__game.get().phase));
    await tryKey('quiet', 'B', '1-quietcat', ['cross', 'windows', 'tapes', 'book']);
    await tryKey('quiet', 'D', '1-quietdiamond', ['seek', 'heap']);
    await tryKey('mark', 'lamp', '1-marklamp', ['cross', 'mark', 'arrow']);
    await tryKey('mark', 'roll', '1-markroll', ['mark', 'arrow']);
    await shot('1-alltried', true); log.push('a DONOW after all: ' + await text('#donow'));
    await page.click('#k-endshift'); await page.waitForTimeout(300); await shot('1-end', true); log.push('a SHIFT END: ' + await text('#result') + ' || ' + await text('#book'));
    await page.click('#k-shift2'); await page.waitForTimeout(400); await shot('2-stick', true); await hscroll('stick'); log.push('a STICK donow: ' + await text('#donow') + ' | ' + await text('#console'));
    await page.click('#k-left'); await page.waitForTimeout(800); await shot('2-stick-left'); log.push('a steer left: ' + await text('#result'));
    await page.click('#k-right'); await page.waitForTimeout(800); log.push('a steer right: ' + await text('#result'));
    await page.click('#k-pull'); await page.waitForTimeout(400); await shot('2-stick-out', true); log.push('a pulled: ' + await text('#result'));
    await page.click('#k-left'); await page.waitForTimeout(800); await shot('2-want-left', true); log.push('a want left: ' + await text('#result'));
    await page.click('#k-toconsole'); await page.waitForTimeout(300); await shot('2-beam', true); log.push('a BEAM donow: ' + await text('#donow'));
    await tryKey('beam', 'lamp', '2-beamlamp', ['arrow']);
    await tryKey('beam', 'memory', '2-beammemory', ['cross', 'speak', 'arrow', 'moral', 'speakA']);
    await shot('2-book', true); log.push('a BOOK donow: ' + await text('#donow'));
    await page.click('#k-book'); await page.waitForTimeout(200); await page.click('#p-beam'); await page.waitForTimeout(250); await shot('2-book-beam', true); log.push('a book preview: ' + await text('.preview'));
    await page.click('#k-go'); await page.waitForTimeout(500); await shot('end', true); await hscroll('end'); log.push('a END: ' + await text('#verdict'));
    await page.click('#b-about-end'); await page.waitForTimeout(300); await shot('about', true); await page.click('#b-about-close');
  });

  await session('b', async ({ page, shot, tryKey, text, log }) => {
    await tryKey('burn', 'd0', '1-burn1', ['remains']);
    await tryKey('quiet', 'C', '1-quietfern', ['windows']);
    await tryKey('mark', 'course', '1-markcourse', ['mark', 'arrow']);
    await page.click('#k-endshift'); await page.waitForTimeout(300); await page.click('#k-shift2'); await page.waitForTimeout(300);
    await page.click('#k-right'); await page.waitForTimeout(700); await page.click('#k-left'); await page.waitForTimeout(700); await page.click('#k-pull'); await page.waitForTimeout(300); await page.click('#k-right'); await page.waitForTimeout(700); await page.click('#k-toconsole'); await page.waitForTimeout(300);
    await tryKey('beam', 'memory', '2-beammemory', ['moral']);
    await page.click('#k-book'); await page.waitForTimeout(200); await page.click('#p-pod'); await page.waitForTimeout(250); await page.click('#k-go'); await page.waitForTimeout(500); await shot('end', true); log.push('b END: ' + await text('#verdict'));
  });

  await session('c', async ({ page, shot, tryKey, text, log }) => {
    await tryKey('burn', 'd1', '1-burn10', ['remains']);
    await tryKey('quiet', 'B', '1-quiet', ['book']);
    await tryKey('mark', 'roll', '1-mark', ['arrow']);
    await page.click('#k-endshift'); await page.waitForTimeout(300); await page.click('#k-shift2'); await page.waitForTimeout(300);
    await page.click('#k-right'); await page.waitForTimeout(700); await page.click('#k-left'); await page.waitForTimeout(700); await page.click('#k-pull'); await page.waitForTimeout(300); await page.click('#k-right'); await page.waitForTimeout(700); await page.click('#k-toconsole'); await page.waitForTimeout(300);
    await tryKey('beam', 'memory', '2-beammemory', []);
    await page.click('#k-book'); await page.waitForTimeout(200); await page.click('#p-beamburn'); await page.waitForTimeout(250); await page.click('#k-go'); await page.waitForTimeout(500); await shot('end', true); log.push('c END: ' + await text('#verdict'));
  });

  // laptop width
  const lp = await browser.newPage({ viewport: { width: 1100, height: 900 }, deviceScaleFactor: 1 });
  await lp.goto('file://' + path.resolve(__dirname, 'beam-me-up-leibniz.html')); await lp.click('#b-begin'); await lp.waitForTimeout(400); await lp.click('#k-mark'); await lp.waitForTimeout(100); await lp.click('#p-lamp'); await lp.waitForTimeout(300);
  await lp.screenshot({ path: path.join(__dirname, 'screenshot-laptop-mark.png'), fullPage: true });

  await browser.close();
  fs.writeFileSync(path.join(__dirname, 'session-log.txt'), log.join('\n') + '\n\nERRORS (' + errors.length + '):\n' + errors.join('\n') + '\n');
  console.log(log.join('\n')); console.log('\nERRORS (' + errors.length + '):\n' + errors.join('\n'));
  process.exit(errors.length ? 1 : 0);
})();
