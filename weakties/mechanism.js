// Granovetter's Dashed Line — the mechanism. The single source of truth: every rule that moves anything on screen lives here.
// Runs unchanged in Node (node calibration.js) and in the browser (inlined verbatim by build.py).
// Mechanism kind: TOY of the paper's argument (Granovetter 1973, AJS 78:1360–1380), calibrated on two of its tables.
//
// Rules, in the words the screen uses:
//   The town: five circles of people. Inside a circle everyone sees everyone often. A few dashed lines join circles.
//   Your week: three evenings, one person each. An evening turns a dashed line ("rarely") thin ("now and then"), and a thin line
//   thick ("often"): the paper's own survey categories, p. 1371, built up week after week. A line is a state that lasts: a line you
//   do not tend this week thins by one step about one week in two, thick to thin, thin to dashed, and never vanishes: someone you once
//   knew is a dashed line for ever.
//   At the start your three friends at Home are thick lines and the eight others dashed.
//   The town reacts: two people you see often come to know each other (the forbidden triad, Fig. 1, p. 1363, exaggerated as the
//   paper does to "never occurs"); a person you see often introduces you to one of their circle (Gans's experience, p. 1374);
//   once a week you run into someone by chance (p. 1372, "chance meetings ... reactivate such ties"): usually someone new, a dashed
//   line; sometimes someone you already know, and the old line comes back thick for that week.
//   News: each week six openings arise, each at one person. Whoever hears passes it on to each neighbour: on a thick line always,
//   on a thin line usually, on a dashed line sometimes (the motivation of close ties, p. 1371, weighed against structure), and a
//   little less at every hand it has passed through (n. 11, p. 1366). You keep what you hear and do not pass it on.
//   Score: distinct openings you heard of, as a share of what could have been heard on this town's news: the better of the best
//   three weeks found with the news known in advance (hindsight) and your own run, so the share never exceeds 100. The verdict counts, for each, how often you saw the person who told you first
//   (Boston table, p. 1371) and how many hands it passed through before you (p. 1372).

var CONFIG = {
  WEEKS: 3,                        // our choice: three things to find out, one a week (memo, section 11; revision 2)
  EVENINGS: 3,                     // our choice (revision 6): three nights out a week is all the time there is; the paper's premise that strength is time
  CAP: 1,                          // our choice (revision 6): one evening per person a week; a line is built up across weeks, not within one
  NEWS_PER_WEEK: 7,                // our choice: one opening per circle per week on average; the paper gives no rate
  P_PASS: { often: 1.0, occ: 0.75, rare: 0.3 },  // ours: strong ties are more motivated to pass on (p. 1371, "a natural a priori idea");
                                   //   the three values tuned so that a mixed Boston week reproduces the paper's two tables (calibration 3, 4)
  DAMP: 0.8,                       // ours: "if the motivation to spread the rumor is dampened a bit on each wave of retelling" (n. 11, p. 1366)
  TIME_IS_FINITE: true,            // the paper's premise (p. 1361–1362: strength is time, and "stronger ties involve larger time commitments"), applied to
                                   //   the other party too: a person you see often gives you two of their evenings and sees their own circle less:
                                   //   their lines there go from thick to thin for that week. Ours in form; without it a strong bridge costs nothing (memo, section 18)
  CHANCE_FROM_WEEK: 2,             // our choice: week one is the circle as it is; chance meetings begin in week two
  DECAY: true,                     // the paper's premise in form (p. 1361: strength is time): a line you do not tend this week may thin by one step.
                                   //   Ours in form; without it a thick line would be free to keep (revision 4)
  P_THIN: 0.5,                     // ours: the chance that an untended line thins this week (revision 5: a coin, so a quiet week is not a sentence)
  P_REVIVE: 0.33,                  // ours: the chance that the week's chance meeting is with someone you already know, whose line comes back thick
                                   //   for the week (p. 1372: "chance meetings or mutual friends operated to reactivate such ties")
  BANDS: [85, 60],                 // our choice: the score's three bands, as a share of what could have been heard (85 and up; 60 to 85; under 60)
  BEST_PLAN: 'threeDoors',         // the best plan without foreknowledge, by search over the plan family (memo, revision 6; calibration 10)
  WEEK1_FLOOR: true,               // our choice (build.md §3, a floor): week one's six openings include one in Home and one in every outer circle,
                                   //   so the triple arrival and the dashed-line arrival can both be seen; later weeks are unconstrained draws
  CIRCLES: [                       // ours: the paper gives no town. Ties inside a circle are all "often" (the circle is a clique);
                                   //   Home has no line out except yours (p. 1370: your strong ties form a dense sector). Seven circles, so that
                                   //   there are more circles than a week of evenings can hold close (p. 1361: "stronger ties involve larger time commitments")
    { id: 'home', label: 'Home', people: ['Ann', 'Ben', 'Cal'] },
    { id: 'firm', label: 'The firm', people: ['Dee', 'Hal', 'Ina', 'Jon', 'Kay'] },
    { id: 'college', label: 'College', people: ['Eli', 'Lou', 'Mia', 'Nat'] },
    { id: 'street', label: 'The street', people: ['Fay', 'Oli', 'Pia', 'Raj', 'Sal'] },
    { id: 'choir', label: 'The choir', people: ['Gus', 'Tam', 'Uli', 'Viv'] },
    { id: 'club', label: 'The club', people: ['Wes', 'Xan', 'Yui', 'Zed', 'Rae'] },
    { id: 'cousins', label: 'The cousins', people: ['Kim', 'Lia', 'Max', 'Noa'] }
  ],
  YOU: 'You',
  KNOWN_AT_START: ['Ann', 'Ben', 'Cal', 'Dee', 'Hal', 'Eli', 'Fay', 'Oli', 'Gus', 'Wes', 'Kim'],   // ours: three close friends and eight people you once knew and hardly see,
                                   //   one or two in every other circle (p. 1372: "an old college friend or a former workmate", "individuals whose very existence they have forgotten")
  BRIDGES: [['Hal', 'Lou'], ['Nat', 'Oli'], ['Sal', 'Tam'], ['Viv', 'Wes'], ['Zed', 'Kim'], ['Noa', 'Jon'], ['Ina', 'Pia'], ['Mia', 'Uli'], ['Yui', 'Kay']],
                                   // ours: a ring of dashed lines among the outer circles and three chords (local bridges, Fig. 2, p. 1365); none into Home
  // The paper's tables, for the calibration check and the verdict (p. 1371, N = 54; p. 1372, N = 64). Typeset text, not a scan.
  BOSTON_SEEN: { often: 16.7, occ: 55.6, rare: 27.8 },
  BOSTON_HANDS: { h0: 39.1, h1: 45.3, h2: 12.5, h3: 3.1 },
  // Our reference player for the calibration (revision 6): one who spreads three nights over different people each week and never settles,
  // which is the paper's weak-tie-rich individual (pp. 1370–1372); the tables are read against this player, not a plan the game recommends.
  REFERENCE: 'rotate',
  TOL_SEEN: 12,                    // percentage points of tolerance on the Boston "how often seen" table
  TOL_HANDS: 12                    // percentage points of tolerance on the Boston "hands passed through" table
};

// ---------- small deterministic randomness ----------
function hash32(str) { var h = 2166136261 >>> 0; for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; } return h >>> 0; }
function unit(parts) { // a uniform in [0,1) fixed by its parts: the same coin for the same tie, piece and week whatever the player did
  var h = hash32(parts.join('|')); h ^= h >>> 13; h = Math.imul(h, 0x5bd1e995) >>> 0; h ^= h >>> 15; return (h >>> 0) / 4294967296;
}
function rng(seedStr) { var x = hash32(seedStr) || 1; return function () { x ^= x << 13; x >>>= 0; x ^= x >>> 17; x ^= x << 5; x >>>= 0; return x / 4294967296; }; }

// ---------- the town ----------
function circleOf(name) { if (name === CONFIG.YOU) return 'home'; for (var i = 0; i < CONFIG.CIRCLES.length; i++) if (CONFIG.CIRCLES[i].people.indexOf(name) >= 0) return CONFIG.CIRCLES[i].id; return null; }
function circleLabel(id) { for (var i = 0; i < CONFIG.CIRCLES.length; i++) if (CONFIG.CIRCLES[i].id === id) return CONFIG.CIRCLES[i].label; return id; }
function everyone() { var l = []; CONFIG.CIRCLES.forEach(function (c) { l = l.concat(c.people); }); return l; }
function key(a, b) { return a < b ? a + '~' + b : b + '~' + a; }
function townTies() { // the ties that are not yours: a map key -> category
  var t = {};
  CONFIG.CIRCLES.forEach(function (c) { for (var i = 0; i < c.people.length; i++) for (var j = i + 1; j < c.people.length; j++) t[key(c.people[i], c.people[j])] = 'often'; });
  CONFIG.BRIDGES.forEach(function (b) { t[key(b[0], b[1])] = 'rare'; });
  return t;
}
function catOf(evenings) { return evenings >= 2 ? 'often' : (evenings >= 1 ? 'occ' : 'rare'); } // the survey's categories from a count; kept for the record
function down(cat) { return cat === 'often' ? 'occ' : 'rare'; }
function up(cat) { return cat === 'rare' ? 'occ' : 'often'; }
function weekCat(s, n, ev) { // this week's line: an evening raises it one step; untended, the same as last week or one step down, on a coin fixed by seed, week and name
  var e = (ev && ev[n]) || 0; if (e >= 1) return up(s.strength[n] || 'rare');
  if (s.revived && s.revived[n]) return 'often';
  var st = s.strength[n] || 'rare'; if (!CONFIG.DECAY || st === 'rare') return st;
  return unit([s.seed, 'thin', s.week, n]) < CONFIG.P_THIN ? down(st) : st;
}
function catWord(cat) { return cat === 'often' ? 'often' : (cat === 'occ' ? 'now and then' : 'rarely'); }

// ---------- a game ----------
function newGame(seed) {
  var s = { seed: String(seed), week: 1, known: CONFIG.KNOWN_AT_START.slice(), extra: {}, weeks: [], heardAll: {}, strength: {} };
  s.known.forEach(function (n) { s.strength[n] = circleOf(n) === 'home' ? 'often' : 'rare'; });
  // extra: ties the town added among people (closures), key -> 'rare'
  return s;
}
function reachedCircles(s) { var r = {}; s.known.forEach(function (n) { r[circleOf(n)] = true; }); return Object.keys(r); }
function legalWeek(s, ev) { // ev: {name: evenings}
  var sum = 0; for (var n in ev) { if (s.known.indexOf(n) < 0) return false; if (ev[n] < 0 || ev[n] > CONFIG.CAP) return false; sum += ev[n]; }
  return sum <= CONFIG.EVENINGS;
}
function allTies(s, ev) { // every tie in the town this week, key -> category, including yours
  var t = townTies();
  for (var k in s.extra) t[k] = s.extra[k];
  s.known.forEach(function (n) { t[key(CONFIG.YOU, n)] = weekCat(s, n, ev); });
  if (CONFIG.TIME_IS_FINITE) s.known.forEach(function (n) {
    if (weekCat(s, n, ev) !== 'often') return;
    var c = circleOf(n); if (c === 'home') return; // your evenings with Ann are the Home circle's own evenings
    CONFIG.CIRCLES.filter(function (x) { return x.id === c; })[0].people.forEach(function (mate) { if (mate !== n && t[key(n, mate)] === 'often') t[key(n, mate)] = 'occ'; });
  });
  return t;
}
function neighbours(ties) { var nb = {}; for (var k in ties) { var ab = k.split('~'); (nb[ab[0]] = nb[ab[0]] || []).push([ab[1], ties[k]]); (nb[ab[1]] = nb[ab[1]] || []).push([ab[0], ties[k]]); } return nb; }

function drawOrigins(seed, week) { // six distinct people, not you; week one floored so every circle has one
  var R = rng(seed + '|origins|' + week), pool = everyone(), out = [];
  if (week === 1 && CONFIG.WEEK1_FLOOR) {
    CONFIG.CIRCLES.forEach(function (c) { out.push(c.people[Math.floor(R() * c.people.length)]); });
  }
  while (out.length < CONFIG.NEWS_PER_WEEK) { var p = pool[Math.floor(R() * pool.length)]; if (out.indexOf(p) < 0) out.push(p); }
  // shuffle so the circle order is not the paper's order every week
  for (var i = out.length - 1; i > 0; i--) { var j = Math.floor(R() * (i + 1)); var tmp = out[i]; out[i] = out[j]; out[j] = tmp; }
  return out;
}

// Spread one piece of news through the town. Returns the hop rounds (for the screen to draw) and what reached you.
function spread(seed, week, pieceIndex, origin, ties) {
  var nb = neighbours(ties), hopOf = {}, rounds = [], tellers = [], heardHop = null, firstTeller = null;
  hopOf[origin] = 0;
  var frontier = [origin], h = 0;
  while (frontier.length && h < (CONFIG.MAX_HOPS || 12)) {
    var next = [], tries = [];
    frontier.forEach(function (from) {
      (nb[from] || []).slice().sort(function (a, b) { return a[0] < b[0] ? -1 : 1; }).forEach(function (pair) {
        var to = pair[0], cat = pair[1];
        if (to === origin) return;
        if (to !== CONFIG.YOU && hopOf[to] !== undefined) return; // already heard (you are told again anyway: the redundancy is the point)
        var p = CONFIG.P_PASS[cat] * Math.pow(CONFIG.DAMP, h), u = unit([seed, 'coin', week, pieceIndex, from, to]), ok = u < p;
        tries.push({ from: from, to: to, cat: cat, hop: h, p: p, ok: ok });
        if (ok) {
          if (to === CONFIG.YOU) { tellers.push({ who: from, cat: cat, hop: h + 1 }); if (heardHop === null) { heardHop = h + 1; firstTeller = { who: from, cat: cat }; } }
          else if (next.indexOf(to) < 0) { next.push(to); hopOf[to] = h + 1; }
        }
      });
    });
    rounds.push(tries);
    frontier = next; h++;
  }
  // first teller at the first hop: if several told you in the same round, the one whose line is strongest, then by name (the survey asked for one contact)
  var same = tellers.filter(function (t) { return t.hop === heardHop; });
  if (same.length > 1) { var rank = { often: 0, occ: 1, rare: 2 }; same.sort(function (a, b) { return rank[a.cat] - rank[b.cat] || (a.who < b.who ? -1 : 1); }); firstTeller = { who: same[0].who, cat: same[0].cat }; }
  return { origin: origin, originCircle: circleOf(origin), rounds: rounds, heard: heardHop !== null, hands: heardHop === null ? null : heardHop - 1, tellers: tellers, first: firstTeller, reached: Object.keys(hopOf).length };
}

// The town reacts to your week, then the news comes. Mutates s and returns the week's record.
function playWeek(s, ev) {
  if (!legalWeek(s, ev)) throw new Error('illegal week');
  var week = s.week, rec = { week: week, evenings: {}, closures: [], intros: [], chance: null, pieces: [], heard: 0, total: CONFIG.NEWS_PER_WEEK, thinned: [], held: [], before: Object.assign({}, s.strength) };
  s.revived = {};
  s.known.forEach(function (n) { rec.evenings[n] = ev[n] || 0; var c = weekCat(s, n, ev); if (!(ev[n] > 0) && s.strength[n] !== 'rare') { if (c !== s.strength[n]) rec.thinned.push({ who: n, from: s.strength[n], to: c }); else rec.held.push({ who: n, cat: c }); } });
  var often = s.known.filter(function (n) { return weekCat(s, n, ev) === 'often'; }), knownAtStart = s.known.slice();
  // 1. closure: two people you see often come to know each other (the forbidden triad never occurs)
  var ties0 = allTies(s, ev);
  for (var i = 0; i < often.length; i++) for (var j = i + 1; j < often.length; j++) {
    var k = key(often[i], often[j]);
    if (!ties0[k]) { s.extra[k] = 'rare'; rec.closures.push([often[i], often[j]]); }
  }
  // 2. introductions: a person you see often introduces you to one of their circle you do not know
  var R = rng(s.seed + '|intro|' + week);
  often.forEach(function (n) {
    var c = circleOf(n), cands = CONFIG.CIRCLES.filter(function (x) { return x.id === c; })[0].people.filter(function (p) { return s.known.indexOf(p) < 0; });
    if (cands.length) { var who = cands[Math.floor(R() * cands.length)]; s.known.push(who); rec.intros.push({ by: n, who: who, circle: c }); }
  });
  // 3. a chance meeting: someone from a circle you have no line into, if any; otherwise anyone you do not know
  s.known.forEach(function (n) { if (!s.strength[n]) s.strength[n] = 'rare'; }); // the introduced: a dashed line
  if (week >= CONFIG.CHANCE_FROM_WEEK) {
    var R2 = rng(s.seed + '|chance|' + week), reached = reachedCircles(s);
    var far = CONFIG.CIRCLES.filter(function (c) { return reached.indexOf(c.id) < 0; });
    var old = knownAtStart.filter(function (n) { return !(ev[n] > 0) && weekCat(s, n, ev) !== 'often'; }), reviveRoll = R2(); // an old line: known before this week
    if (reviveRoll < CONFIG.P_REVIVE && old.length) { // someone you already know: the old line comes back thick for the week
      var back = old[Math.floor(R2() * old.length)]; s.revived[back] = true; rec.chance = { who: back, circle: circleOf(back), revive: true, was: s.strength[back] };
    } else {
      var pool = far.length ? far[Math.floor(R2() * far.length)].people : everyone().filter(function (p) { return s.known.indexOf(p) < 0; });
      pool = pool.filter(function (p) { return s.known.indexOf(p) < 0; });
      if (pool.length) { var met = pool[Math.floor(R2() * pool.length)]; s.known.push(met); s.strength[met] = 'rare'; rec.chance = { who: met, circle: circleOf(met), far: far.length > 0 }; }
    }
  }
  // 4. the news: ties as they stand after the town reacted; new acquaintances are dashed lines from now (no evenings yet)
  var ties = allTies(s, ev);
  rec.ties = ties;
  s.known.forEach(function (n) { s.strength[n] = ties[key(CONFIG.YOU, n)]; }); // the line you have after this week
  var origins = drawOrigins(s.seed, week);
  origins.forEach(function (o, idx) {
    var p = spread(s.seed, week, idx, o, ties); p.index = idx; rec.pieces.push(p);
    if (p.heard) { rec.heard++; s.heardAll[week + ':' + idx] = p; }
  });
  s.weeks.push(rec); s.week++;
  return rec;
}
function isOver(s) { return s.week > CONFIG.WEEKS; }

// ---------- the verdict ----------
function tally(s) {
  var seen = { often: 0, occ: 0, rare: 0 }, hands = { h0: 0, h1: 0, h2: 0, h3: 0 }, heard = 0, total = 0, tellersSum = 0;
  s.weeks.forEach(function (w) { total += w.total; w.pieces.forEach(function (p) { if (p.heard) { heard++; seen[p.first.cat]++; hands[p.hands >= 3 ? 'h3' : 'h' + p.hands]++; tellersSum += p.tellers.length; } }); });
  return { heard: heard, total: total, seen: seen, hands: hands, meanTellers: heard ? tellersSum / heard : 0 };
}
function shares(obj) { var sum = 0, out = {}; for (var k in obj) sum += obj[k]; for (var k2 in obj) out[k2] = sum ? 100 * obj[k2] / sum : 0; return out; }

// ---------- strategies (the ghosts, and the heuristics table) ----------
// Each takes the state and returns a week's evenings. They see only what the player sees: the known list and the circles.
var STRATEGIES = {
  homebody: function (s) { return { Ann: 1, Ben: 1, Cal: 1 }; }, // every night with the circle: the three friends stay thick
  loyal: function (s) { var ev = { Ann: 1, Ben: 1 }; var first = outerByCircle(s).list[0]; if (first) ev[first] = 1; return ev; }, // two friends and one acquaintance
  threeDoors: function (s) { var ev = {}; outerByCircle(s).list.slice(0, CONFIG.EVENINGS).forEach(function (n) { ev[n] = 1; }); return ev; }, // the same three doors every week: one person in each of three other circles, the circles where you know fewest people first
  rotate: function (s) { var ev = {}, o = outerByCircle(s), k = (s.week - 1) * CONFIG.EVENINGS; for (var i = 0; i < CONFIG.EVENINGS; i++) { var n = o.list[(k + i) % o.list.length]; if (n) ev[n] = 1; } return ev; }, // three new doors each week
  oneHomeTwoDoors: function (s) { var ev = { Ann: 1 }; outerByCircle(s).list.slice(0, 2).forEach(function (n) { ev[n] = 1; }); return ev; }, // keep one friend, two doors
  stayIn: function (s) { return {}; }, // no evenings on anyone
  hindsight: function (s) { return hindsightWeek(s).ev; } // the best week we can find knowing the week's news: hill-climbing from the best plan's week
};
function outerByCircle(s) { // one person per outer circle, the circles where you know fewest people first (a second dashed line into a circle is already a door), then by size, then the second person in each
  var byC = {}; s.known.forEach(function (n) { var c = circleOf(n); if (c !== 'home') (byC[c] = byC[c] || []).push(n); });
  var order = Object.keys(byC).sort(function (a, b) { return byC[a].length - byC[b].length || sizeOf(a) - sizeOf(b) || (a < b ? -1 : 1); }), list = [];
  for (var round = 0; round < 6; round++) order.forEach(function (c) { if (byC[c][round]) list.push(byC[c][round]); });
  return { list: list, order: order, byC: byC };
}
function ceiling(s) { return Math.max(tally(runStrategy(s.seed, STRATEGIES.hindsight)).heard, tally(s).heard); }
function scoreOf(s) { var c = ceiling(s), h = tally(s).heard, p = c ? 100 * h / c : 0; return { heard: h, ceiling: c, pct: p, band: p >= CONFIG.BANDS[0] ? 2 : (p >= CONFIG.BANDS[1] ? 1 : 0) }; }
function lightClone(s) { return { seed: s.seed, week: s.week, known: s.known.slice(), extra: Object.assign({}, s.extra), weeks: [], heardAll: {}, strength: Object.assign({}, s.strength), revived: {} }; }
function heardOf(s, ev) { return playWeek(lightClone(s), ev).heard; }
function hindsightWeek(s) { // the best week with the news known: every legal week (a few hundred with three evenings, one per person) tried on this week's draw and coins
  var best = {}, bestH = -1;
  allWeeks(s.known).forEach(function (ev) { var h = heardOf(s, ev); if (h > bestH) { bestH = h; best = ev; } });
  return { ev: best, heard: bestH };
}
function sizeOf(cid) { for (var i = 0; i < CONFIG.CIRCLES.length; i++) if (CONFIG.CIRCLES[i].id === cid) return CONFIG.CIRCLES[i].people.length; return 0; }
function runStrategy(seed, strat) { var s = newGame(seed); while (!isOver(s)) playWeek(s, strat(s)); return s; }

// Every legal week over the known list (each 0..CAP, sum <= EVENINGS); for the search in the calibration check.
function allWeeks(known) {
  var out = [];
  (function rec(i, ev, sum) {
    if (i === known.length) { out.push(Object.assign({}, ev)); return; }
    for (var e = 0; e <= CONFIG.CAP; e++) { if (sum + e > CONFIG.EVENINGS) break; if (e) ev[known[i]] = e; else delete ev[known[i]]; rec(i + 1, ev, sum + e); }
    delete ev[known[i]];
  })(0, {}, 0);
  return out;
}

if (typeof module !== 'undefined') module.exports = { CONFIG: CONFIG, newGame: newGame, playWeek: playWeek, isOver: isOver, legalWeek: legalWeek, allTies: allTies, townTies: townTies, circleOf: circleOf, circleLabel: circleLabel, everyone: everyone, catOf: catOf, catWord: catWord, key: key, tally: tally, shares: shares, STRATEGIES: STRATEGIES, runStrategy: runStrategy, weekCat: weekCat, down: down, up: up, outerByCircle: outerByCircle, ceiling: ceiling, scoreOf: scoreOf, hindsightWeek: hindsightWeek, heardOf: heardOf, lightClone: lightClone, allWeeks: allWeeks, drawOrigins: drawOrigins, spread: spread, reachedCircles: reachedCircles, sizeOf: sizeOf, unit: unit, rng: rng };
