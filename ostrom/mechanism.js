// Ostrom's Pond — mechanism. The single source of truth: plain functions, no DOM; every rule that affects an
// outcome and every random draw lives here. Runs unchanged in Node (calibration.js, loop.js) and in the
// browser (inlined verbatim by build.py).
//
// Kind: TOY. The paper (Ostrom 2000, "Collective Action and the Evolution of Social Norms", Journal of Economic
// Perspectives 14(3):137–158, doi 10.1257/jep.14.3.137) hands over an argument with numbers reported from other
// studies. This file is a model built to illustrate that argument: three types of villager, a norm that adapts to
// what pays and withers under outside enforcement, a pond that breeds. Its directions and rough sizes are anchored
// to the paper's reported numbers (tagged below); its functional forms and rates are ours. Only the typeset PDF
// was available; no code, no data.

var CONFIG = {
  // ---- the village (ours) -----------------------------------------------------------------------------------
  N: 10,                          // ours: ten villagers, so that a share is a count
  SUMMERS: 6,                     // ours: six decided summers, then a seventh that nobody watches (revision 8: was ten)
  TYPES: { E: 3, CC: 5, WP: 2 },  // our reading of Ahn, Ostrom & Walker (1998), p. 146: 40% rank (C,C) above (D,C),
                                  // 27% indifferent, the rest not; and the text's three types (p. 142)
  NAMES: ['Ada', 'Bo', 'Cyd', 'Dot', 'Eli', 'Fay', 'Gus', 'Hal', 'Ivy', 'Jem'],  // ours

  // ---- the pond (ours) --------------------------------------------------------------------------------------
  POND_CAP: 50,                   // ours: a full pond holds fifty fish (drawn, countable)
  POND_START: 40,                 // ours: the pond at the start
  POND_BABIES: 12,                // ours: the pond has food for twelve babies a winter: one for each of us and two to spare.
                                  // The winter's rule, in words a player can check: every fish left can have one baby;
                                  // never more than POND_BABIES babies; never more fish than POND_CAP. So ten fish out
                                  // and twelve in fills the pond slowly, and every second fish someone takes beyond
                                  // that is a fish the pond is short next summer. (Revision 4: this replaced a logistic
                                  // curve that gave most babies at half full and that no player could verify.)
  FAIR: 1,                        // ours: the fair take, one fish
  GREEDY: 2,                      // ours: the greedy take, two fish; the temptation is the second fish

  // ---- the choice: share (take one) or grab (take two) ----------------------------------------------------------
  // p(share) = logistic((−TEMPTATION + n·(W_RECIP·c_hat + G_BASE) + deterrence + shame + assurance) / TAU)
  TEMPTATION: 1,                  // = GREEDY − FAIR, in fish
  W_RECIP: 1.8,                   // ours: how much a norm-user's willingness depends on expecting others to share
                                  // (finding 3, p. 140: those who believe others will cooperate are more likely to)
  G_BASE: 0.7,                    // ours: a norm-user's reluctance to grab even when others do
  TAU: 0.4,                       // ours: choice noise
  C_HAT0: 0.6,                    // ours: what everyone expects of the others before the first summer; chosen so
                                  // that leave-it-be's first summer lands in the 40–60% band (finding 1, p. 140)
  NORM0_CC: [0.55, 0.75],         // ours: conditional cooperators' starting norm strength, uniform in this range
  NORM0_WP: [0.80, 0.90],         // ours: willing punishers' starting norm strength (also conditional cooperators)
  NORM0_E: 0,                     // rational egoists: intrinsic payoffs equal objective payoffs (p. 144)

  // ---- the five arrangements -----------------------------------------------------------------------------------
  // none: the lab baseline (findings 1–2). talk: face-to-face communication (finding 5; Ostrom & Walker 1997).
  // watch: local monitors chosen by the users with graduated sanctions (design principles 4–5, pp. 151–152).
    // strong: strong external monitoring (p. 147: cooperation enforced without norms; Frohlich & Oppenheimer 1996).
  TALK_PROMISE_PULL: 0.5,         // ours: promises pull expectations halfway from last summer's share toward everyone sharing
  SHAME_TALK: 0.6,                // ours: × norm; the "verbal tongue-lashings" (p. 140) a norm-user dreads
  SHAME_WATCH: 0.4,               // ours: × norm; being told off in front of the village
  ASSURE_WATCH: 0.5,              // ours: × norm; "with local monitors, conditional cooperators are assured that
                                  // someone is generally checking" (p. 151)
  WATCH_SEE: 0.8,                 // ours: chance the summer's watcher sees what a villager takes; one of our own, at the pond all
                                  // summer, knows everybody (design principle 4, p. 151: local monitors)
  WATCH_SEE_BELIEF0: 0.3,         // ours: what villagers think that chance is before anyone has been told off
  WATCH_INFO: true,               // p. 151: the first sanction "needs to be considered more as information both to the
                                  // person who is 'caught' and to others": once a telling-off is seen, everyone
                                  // believes the true WATCH_SEE
  // design principle 5, graduated sanctions (p. 151), all in kind so that every sanction is a drawing: first offence seen,
  // a telling-off and nothing else; second, both fish go back into the pond; third and after, both fish back and no fishing
  // next summer. A grabber who has been told off and grabs again expects GREEDY − WATCH_SEE × GREEDY = 0.4 fish, less
  // than a sharer's one, which is the differential the imitation rule needs.
  WATCH_BAN_VALUE: 8,             // ours: what a summer without fishing is worth, in fish, when weighing a third offence
  WATCH_LEARN: [0.25, 0.25, 0.25],// ours: how much a sanction from one's own village raises an egoist's norm (p. 151:
                                  // "learns that others basically continue to extend their trust"; Fehr & Gächter,
                                  // p. 141: least trusting "transformed into strong cooperators")
  POLICE_TAKES_CATCH: true,       // ours: the town's flat sanction: a grabber who is caught hands both fish to the policeman (not graduated)
  POLICE_SEE: 0.9,                // ours: "strong external monitoring" (p. 147): the town's policeman catches nine grabbers in ten
  // The policeman is honest and costs the village nothing (revision 8): a grabber he catches puts the fish back in the pond,
  // as under the village's own watcher. What differs is the paper's three things: he is a stranger who reports only whom he
  // caught; while he is there the village stops telling each other off; and sharing enforced by him builds no norm.
  WATCHER_FISHES: false,          // ours: the day's watcher does not fish (the cost of monitoring, one fish a summer)

  // ---- the winter: how norms move (the indirect evolutionary approach, pp. 144–145) --------------------------------
  IMITATE: 0.03,                  // ours: × (fish a grabber ate − fish a sharer ate); "those who were less successful would
                                  // tend to learn the values of those who had achieved higher material rewards" (p. 145)
  REINFORCE: 0.05,                // ours: sharing in a village where at least half share strengthens the norm ("norms seem
                                  // to have a certain staying power in encouraging a growth of the desire", p. 147);
                                  // not under a policeman: enforced sharing builds no norm (p. 147)
  SUCKERED: 0.03,                 // ours: sharing when fewer than half did weakens it ("easily disappointed", p. 142)
  GRABBED: 0.01,                  // ours: grabbing weakens it a little
  CROWD_STRONG: 0.12,             // ours: every summer the daily policeman is in charge ("cooperation is enforced without
                                  // any need for internal norms to develop", p. 147; Frey 1994 crowding out)
  IMITATE_UP_UNDER_POLICE: false, // ours: under a policeman, sharers who out-earn the caught are showing compliance, not a
                                  // norm, so imitation builds no norm there; it still erodes one when grabbers out-earn
  HALF: 0.5,                      // the share of the village that counts as "most of us"

  // ---- the threat (p. 153: in-migration "may bring new participants who do not trust others and do not rapidly
  //      learn social norms"; out-migration loses "those who contribute needed resources") ---------------------------
  MIGRATION_AFTER: 3,             // ours: after three summers one villager moves away and a newcomer moves in
  NEWCOMER: 'Kit',                // ours: the newcomer's name; a rational egoist (norm 0) who has never fished here
  LEAVER_TYPES: ['CC', 'WP']      // ours: the one who moves away is a norm-user (a loss of those who contribute)
};

// The five cards. Each says what it is, what it costs, what happens to someone who takes two, and what the village meeting
// gets to know afterwards (the meeting always learns how many fish left the pond; names only come from a watcher or a catch).
var REGIMES = [
  { key: 'none', name: 'Leave it be',
    line: 'Everyone just goes fishing. Nobody says anything.',
    cost: 'Costs nothing.', greedy: 'Nothing happens to anyone who takes two.',
    knows: 'Nobody is at the pond, so we only find out how many fish are gone, not who took them.' },
  { key: 'talk', name: 'Have a talk',
    line: 'Before fishing we all sit in a circle and promise to take one fish each.',
    cost: 'Costs nothing.', greedy: 'If fish go missing, the circle tells everybody off next summer. Nothing else happens.',
    knows: 'Nobody is at the pond, so we only find out how many fish are gone, not who broke the promise.' },
  { key: 'watch', name: 'Take turns watching',
    line: 'One of us sits by the pond all day and watches, instead of fishing.',
    cost: 'Costs us the watcher’s fish.', greedy: 'Seen taking two: the first time, a telling-off. The second time, both fish go back in the pond. The third time, both fish back and no fishing next summer.',
    knows: 'The watcher sees most of us, but not everyone. Whoever the watcher saw, we know what they took.' },
  { key: 'strong', name: 'Ask the town for a policeman',
    line: 'The town sends a policeman. He stands by the pond every day, all summer.',
    cost: 'Costs nothing.', greedy: 'If he catches someone taking two, the fish go back in the pond. We stop telling each other off: that\u2019s his job now.',
    knows: 'He only tells us who he caught, and he catches nearly everyone who takes two.' }
];
var REGIME = {}; REGIMES.forEach(function (r) { REGIME[r.key] = r; });

// ---- random numbers: one seeded stream per village, so a seed replays exactly -------------------------------------
function makeRng(seed) {
  var a = (seed >>> 0) || 1;
  return function () { a = (a + 0x6D2B79F5) | 0; var t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
function logistic(x) { return 1 / (1 + Math.exp(-x)); }
function clamp01(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
function uniform(rng, lo, hi) { return lo + (hi - lo) * rng(); }

// ---- a village ---------------------------------------------------------------------------------------------------
function newVillage(seed) {
  var C = CONFIG, rng = makeRng(seed);
  var types = [];
  for (var i = 0; i < C.TYPES.E; i++) types.push('E');
  for (i = 0; i < C.TYPES.CC; i++) types.push('CC');
  for (i = 0; i < C.TYPES.WP; i++) types.push('WP');
  for (i = types.length - 1; i > 0; i--) { var j = Math.floor(rng() * (i + 1)); var t = types[i]; types[i] = types[j]; types[j] = t; }
  var villagers = types.map(function (type, k) {
    var n0 = type === 'E' ? C.NORM0_E : type === 'CC' ? uniform(rng, C.NORM0_CC[0], C.NORM0_CC[1]) : uniform(rng, C.NORM0_WP[0], C.NORM0_WP[1]);
    return { i: k, name: C.NAMES[k], type: type, norm0: n0, norm: n0, offences: 0, banned: false, eaten: 0, toldOff: 0, fined: 0 };
  });
  return { seed: seed, rng: rng, pond: C.POND_START, summer: 0, villagers: villagers, cHat: C.C_HAT0, seeBelief: C.WATCH_SEE_BELIEF0,
           eaten: 0, history: [], watcherNext: 0, lastRegime: null };
}

// what a villager weighs this summer; returns the probability of taking one fish
function shareProb(v, s, regime) {
  var C = CONFIG, n = v.norm;
  var cHat = regime === 'talk' ? s.cHat + C.TALK_PROMISE_PULL * (1 - s.cHat) : s.cHat;
  var deter = 0, shame = 0, assure = 0;
  if (regime === 'watch') {
    var next = v.offences === 0 ? 0 : v.offences === 1 ? C.GREEDY : C.GREEDY + C.WATCH_BAN_VALUE;   // what the next offence costs
    deter = s.seeBelief * next;
    shame = n * C.SHAME_WATCH;
    assure = n * C.ASSURE_WATCH;
  } else if (regime === 'strong') { deter = C.POLICE_SEE * C.GREEDY; }
  else if (regime === 'talk') { shame = n * C.SHAME_TALK; }
  var delta = -C.TEMPTATION + n * (C.W_RECIP * cHat + C.G_BASE) + deter + shame + assure;
  return logistic(delta / C.TAU);
}

// one summer under an arrangement. test=true is the eleventh summer: nobody watches, nobody talks, no winter after.
// Returns the record of what happened, in the order it happened, for the interface to draw.
function playSummer(s, regime, test) {
  var C = CONFIG, rng = s.rng, V = s.villagers;
  var rec = { summer: s.summer + 1, regime: regime, test: !!test, pondBefore: s.pond, acts: [], watcher: null, finesToPond: 0, bansNext: [], migration: null };
  if (!test && s.summer === C.MIGRATION_AFTER && !s.migrated) rec.migration = migrate(s);
  var banned = V.filter(function (v) { return v.banned; }).map(function (v) { return v.i; });
  var watcher = null;
  if (regime === 'watch') {
    var w = s.watcherNext % C.N, tries = 0;
    while (V[w].banned && tries < C.N) { w = (w + 1) % C.N; tries++; }
    watcher = w; s.watcherNext = (w + 1) % C.N; rec.watcher = w;
  }
  // 1. everyone decides
  var wants = V.map(function (v) {
    if (v.banned) return 0;
    if (watcher !== null && v.i === watcher && !C.WATCHER_FISHES) return 0;
    var p = shareProb(v, s, regime);
    return rng() < p ? C.FAIR : C.GREEDY;
  });
  // 2. fish leave the pond one at a time: everyone's first fish in turn, then the grabbers' second
  var took = V.map(function () { return 0; }), pond = s.pond;
  for (var round = 1; round <= C.GREEDY; round++) {
    for (var i = 0; i < C.N; i++) { if (wants[i] >= round && pond > 0) { took[i]++; pond--; } }
  }
  // 3. who is seen, what happens to them, and what the village meeting gets to know. Everyone carries the catch home in a
  //    bucket: the meeting always learns the pond count, and a name only from the watcher (who sees most villagers, one
  //    fish or two) or from a policeman's catch (he reports only whom he caught). known: 'hidden' | 'one' | 'two' |
  //    'watcher' | 'banned'.
  var seenAny = false;
  for (i = 0; i < C.N; i++) {
    var v = V[i];
    var act = { i: i, name: v.name, wanted: wants[i], took: took[i], grabbed: wants[i] === C.GREEDY, seen: false, sanction: null, fine: 0, banned: v.banned, watcher: watcher === i, ate: took[i], known: 'hidden' };
    if (act.banned) act.known = 'banned';
    else if (act.watcher) act.known = 'watcher';
    else if (!test && regime === 'watch') {
      if (rng() < C.WATCH_SEE) {
        act.seen = true; act.known = act.grabbed ? 'two' : 'one';
        if (act.grabbed) {
          seenAny = true;
          var k = v.offences; v.offences++;
          if (k === 0) { act.sanction = 'word'; v.toldOff++; }
          else { act.sanction = k === 1 ? 'back' : 'ban'; act.fine = act.took; act.ate -= act.fine; rec.finesToPond += act.fine; v.fined++; if (k >= 2) rec.bansNext.push(i); }
          v.norm = clamp01(v.norm + C.WATCH_LEARN[Math.min(k, C.WATCH_LEARN.length - 1)]);
        }
      }
    } else if (!test && regime === 'strong') {
      if (act.grabbed && rng() < C.POLICE_SEE) { act.seen = true; act.known = 'two'; act.sanction = 'police'; act.fine = act.took; act.ate -= act.fine; rec.finesToPond += act.fine; v.fined++; }
    } else if (!test && regime === 'talk' && act.grabbed) { act.sanction = 'circle'; v.toldOff++; }
    rec.acts.push(act);
  }
  rec.seenCount = rec.acts.filter(function (x) { return x.seen; }).length;
  rec.ranOut = rec.acts.some(function (x) { return !x.banned && !x.watcher && x.took < x.wanted; });
  if (regime === 'watch' && C.WATCH_INFO && seenAny) s.seeBelief = C.WATCH_SEE;
  // 4. the books
  var catchTotal = took.reduce(function (a, b) { return a + b; }, 0);
  var ate = rec.acts.reduce(function (a, x) { return a + x.ate; }, 0);
  rec.catch = catchTotal;
  rec.eaten = ate;                               // the fish in hands after sanctions; never negative
  s.eaten += ate;
  rec.acts.forEach(function (x) { V[x.i].eaten += x.ate; });
  rec.shared = rec.acts.filter(function (x) { return !x.banned && !x.watcher && !x.grabbed; }).length;
  rec.grabbers = rec.acts.filter(function (x) { return x.grabbed; }).length;
  rec.fishers = rec.acts.filter(function (x) { return !x.banned && !x.watcher; }).length;
  rec.shareRate = rec.fishers ? rec.shared / rec.fishers : 0;
  rec.pondAfterFishing = pond + rec.finesToPond;
  // 6. the winter: the fish breed, bans are served and lifted, norms move
  if (!test) {
    var S = rec.pondAfterFishing;
    var b = babies(S);
    s.pond = S + b.n;
    rec.growth = b.n; rec.babyLimit = b.limit;
    V.forEach(function (v) { v.banned = false; });
    rec.bansNext.forEach(function (i) { V[i].banned = true; });
    winter(s, rec, regime);
    s.cHat = rec.shareRate;
    s.summer++;
    s.lastRegime = regime;
    s.history.push(rec);
  } else {
    s.pond = rec.pondAfterFishing; rec.growth = 0; s.test = rec;
  }
  rec.pondAfter = s.pond;
  rec.eatenTotal = s.eaten;
  return rec;
}

// one villager moves away and a newcomer takes their place in the row
function migrate(s) {
  var C = CONFIG, V = s.villagers;
  var cands = V.filter(function (v) { return C.LEAVER_TYPES.indexOf(v.type) >= 0 && !v.banned; });
  var leaver = cands[Math.floor(s.rng() * cands.length)];
  var left = { i: leaver.i, name: leaver.name, type: leaver.type };
  V[leaver.i] = { i: leaver.i, name: C.NEWCOMER, type: 'E', norm0: C.NORM0_E, norm: C.NORM0_E, offences: 0, banned: false, eaten: 0, toldOff: 0, fined: 0, newcomer: true };
  s.migrated = true;
  return { left: left.name, leftType: left.type, came: C.NEWCOMER, slot: leaver.i };
}

// norms move over the winter
function winter(s, rec, regime) {
  var C = CONFIG, V = s.villagers;
  var sharers = rec.acts.filter(function (x) { return !x.grabbed && !x.banned && !x.watcher; });
  var grabbers = rec.acts.filter(function (x) { return x.grabbed; });
  var mean = function (xs) { return xs.reduce(function (a, x) { return a + x.ate; }, 0) / xs.length; };
  var gap = (sharers.length && grabbers.length) ? mean(grabbers) - mean(sharers) : 0;   // fish a grabber ate over a sharer
  var external = regime === 'strong';
  if (external && gap < 0 && !C.IMITATE_UP_UNDER_POLICE) gap = 0;
  rec.acts.forEach(function (a) {
    var v = V[a.i], d = 0;
    d -= C.IMITATE * gap;                                                   // toward whoever ate better
    if (!a.banned && !a.watcher) {
      if (!a.grabbed) d += rec.shareRate >= C.HALF ? (external ? 0 : C.REINFORCE) : -C.SUCKERED;  // enforced sharing builds no norm (p. 147)
      else d -= C.GRABBED;
    }
    if (external) d -= C.CROWD_STRONG;   // crowding out
    v.norm = clamp01(v.norm + d);
  });
  rec.gap = gap;
}

// a whole village on a fixed strategy (for the numbers and the checks); strategy is a key or a function(summer, state) → key
function runStrategy(seed, strategy) {
  var s = newVillage(seed), recs = [];
  for (var t = 0; t < CONFIG.SUMMERS; t++) {
    var key = typeof strategy === 'function' ? strategy(t, s) : strategy;
    recs.push(playSummer(s, key, false));
  }
  var test = playSummer(s, 'none', true);
  return { state: s, recs: recs, test: test };
}

// words for the pond and the bellies (the verdict's second line) — thresholds ours
// the winter: how many babies, and what held the number down ('food', 'room', 'parents', or 'none' when no fish are left)
function babies(S) {
  var C = CONFIG, room = Math.max(0, C.POND_CAP - S), n = Math.max(0, Math.min(S, C.POND_BABIES, room));
  var limit = S <= 0 ? 'none' : n === room && room < C.POND_BABIES && room <= S ? 'room' : n === S && S < C.POND_BABIES ? 'parents' : 'food';
  return { n: n, limit: limit };
}
function pondWord(fish) {
  var C = CONFIG;
  if (fish <= 0) return 'empty';
  if (fish < C.POND_CAP * 0.3) return 'nearly empty';
  if (fish < C.POND_CAP * 0.7) return 'half full';
  if (fish < C.POND_CAP * 0.9) return 'nearly full';
  return 'full';
}
function belliesWord(eaten) {
  var C = CONFIG, perSummer = eaten / C.SUMMERS;   // ten villagers taking one each would be 10 a summer
  if (perSummer >= C.N * 0.75) return 'ate well';   // thresholds ours: a watched village (nine fishers) eats well,
  if (perSummer >= C.N * 0.5) return 'ate thinly';  // the daily policeman's village (a quarter to the town) eats thinly
  return 'went hungry';
}
function sum(xs) { return xs.reduce(function (a, b) { return a + b; }, 0); }

var M = { CONFIG: CONFIG, REGIMES: REGIMES, REGIME: REGIME, makeRng: makeRng, newVillage: newVillage, babies: babies, migrate: migrate, shareProb: shareProb, playSummer: playSummer, winter: winter, runStrategy: runStrategy, pondWord: pondWord, belliesWord: belliesWord, sum: sum };
if (typeof module !== 'undefined' && module.exports) module.exports = M;
