// Headless play of the loop (build.md section 4.2): prints, after each action, what changed and where the player stands.
// Usage: node loop.js [seed] [strategy: homebody|loyal|threeDoors|rotate|oneHomeTwoDoors|stayIn|learns]
var m = require('./mechanism.js'), C = m.CONFIG;
var seed = process.argv[2] || 'demo', stratName = process.argv[3] || 'learns';
var learns = [function () { return { Ann: 1, Ben: 1, Cal: 1 }; }, function () { return { Dee: 1, Eli: 1, Fay: 1 }; }, function () { return { Dee: 1, Eli: 1, Gus: 1 }; }];
var strat = stratName === 'learns' ? function (s) { return learns[s.week - 1](s); } : m.STRATEGIES[stratName];
function say(x) { console.log(x); }
function lineWord(cat) { return cat === 'often' ? 'thick line' : (cat === 'occ' ? 'thin line' : 'dashed line'); }
var s = m.newGame(seed);
say('== START. Granovetter\'s Dashed Line. Aim: Spend your evenings so that you hear of as many job openings as you can. [Start]');
say('   The town: seven circles. You are in Home with Ann, Ben and Cal (thick lines: you see them often). Eight dashed lines run out to people you once knew: ' + C.KNOWN_AT_START.slice(3).map(function (n) { return n + ' (' + m.circleLabel(m.circleOf(n)) + ')'; }).join(', ') + '.');
while (!m.isOver(s)) {
  var ev = strat(s), w = s.week;
  say('\n-- WEEK ' + w + ' OF ' + C.WEEKS + '. Give your three evenings; tap a name for one. Evenings left: ' + (C.EVENINGS - Object.keys(ev).reduce(function (a, k) { return a + ev[k]; }, 0)) + ' after: ' + Object.keys(ev).map(function (k) { return k + ' ' + (ev[k] === 2 ? '●●' : '●'); }).join(', '));
  say('   Preview on the map: ' + s.known.map(function (n) { return n + ' = ' + lineWord(m.catOf(ev[n] || 0)); }).join('; '));
  say('   [Spend the week]');
  var rec = m.playWeek(s, ev);
  rec.thinned.forEach(function (x) { say('   ' + x.who + ' got no evening: the line thins, ' + x.from + ' to ' + x.to + ' (a coin).'); });
  if (rec.held.length) say('   No evening, line held for now: ' + rec.held.map(function (x) { return x.who; }).join(', ') + '.');
  rec.closures.forEach(function (c) { say('   The town: ' + c[0] + ' and ' + c[1] + ' come to know each other (you see both often). A new dashed line.'); });
  rec.intros.forEach(function (x) { say('   The town: ' + x.by + ' introduces you to ' + x.who + ' (' + m.circleLabel(x.circle) + '). A new dashed line; a new name on your map.'); });
  if (rec.chance) say(rec.chance.revive ? '   By chance you run into ' + rec.chance.who + ' at a wedding: the old line is back, thick, for this week.' : '   By chance you run into ' + rec.chance.who + ', from ' + m.circleLabel(rec.chance.circle).toLowerCase() + '. A new dashed line.');
  var oftenOut = s.known.filter(function (n) { return m.catOf(ev[n] || 0) === 'often' && m.circleOf(n) !== 'home'; });
  if (oftenOut.length) say('   ' + oftenOut.join(' and ') + ' spent two evenings with you, so their lines in their own circle go thin this week.');
  rec.pieces.forEach(function (p, i) {
    var line = '   News ' + (i + 1) + ': ' + p.origin + ' (' + m.circleLabel(p.originCircle) + ') hears of an opening. ';
    var fails = [], tells = p.tellers.map(function (t) { return t.who; });
    p.rounds.forEach(function (round) { round.forEach(function (tr) { if (tr.to === C.YOU && !tr.ok) fails.push(tr.from + ' (' + lineWord(tr.cat) + ', did not mention it)'); }); });
    if (p.heard) line += 'It reaches you: ' + tells[0] + ' tells you' + (tells.length > 1 ? '; ' + tells.slice(1).join(' and ') + (tells.length > 2 ? ' tell' : ' tells') + ' you the same' : '') + '. Hands before you: ' + p.hands + '.';
    else line += 'It never reaches you' + (fails.length ? ' (' + fails.join(', ') + ')' : ' (nobody you know heard it)') + '.';
    say(line);
  });
  say('   WEEK ' + w + ': you heard of ' + rec.heard + ' of ' + rec.total + ' openings. Weeks so far: ' + s.weeks.map(function (x) { return x.heard; }).join(' · ') + '. [Next week]');
}
var t = m.tally(s);
say('\n== VERDICT. You heard of ' + t.heard + ' of the ' + t.total + ' openings the town heard of in three weeks.');
say('   From people you saw often: ' + t.seen.often + '; now and then: ' + t.seen.occ + '; rarely: ' + t.seen.rare + '.   Granovetter\'s 54 job changers: ' + C.BOSTON_SEEN.often + ' / ' + C.BOSTON_SEEN.occ + ' / ' + C.BOSTON_SEEN.rare + ' per cent.');
say('   Straight from the source: ' + t.hands.h0 + '; one pair of hands: ' + t.hands.h1 + '; two: ' + t.hands.h2 + '; more: ' + t.hands.h3 + '.');
var hb = m.tally(m.runStrategy(seed, m.STRATEGIES.homebody)).heard, sp = m.tally(m.runStrategy(seed, m.STRATEGIES.threeDoors)).heard, st = m.tally(m.runStrategy(seed, m.STRATEGIES.stayIn)).heard, hs = m.tally(m.runStrategy(seed, m.STRATEGIES.hindsight)).heard;
say('   Same news, every evening in your circle: ' + hb + '. One evening to one person in each circle: ' + sp + '. No evening on anyone: ' + st + '. Best three weeks knowing the news: ' + hs + '.');
say('   Then the West End, read: a town with no dashed lines cannot get a leaflet past one circle.');
