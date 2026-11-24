// Leibniz's Flatboat — the mechanism, headless. The only copy: build.py inlines this file verbatim into the HTML and
// refuses to build if the embedded copy differs. Runs unchanged in Node (module.exports) and in the browser (window.FLATBOAT).
// Kind: toy (memo §16). The one rule the paper states is run as written: a boat carries the weight of the water it could
// hold. Every other number is ours and tagged below.
(function (root) {
  'use strict';

  var CONFIG = {
    // --- weights, in tuns (a tun of water, about a tonne). The paper: "earth and cannons are very heavy" — ours, rounded for play
    MAN_T: 0.1,          // a man with musket, arms and kit — ours (about 100 kg)
    GUN_T: 2,            // a light field gun on its carriage, with its shot — ours (a 6-pounder and carriage weigh about 1.5 t)
    FOOT_T: 2,           // one foot of wall across the bow (8 ft wide, 4 ft high, in sacks of earth) — ours (0.9 m³ of earth at 1.6 t/m³ is 1.45 t; rounded up for the sacks and baskets)
    // --- the dials
    MAX_FEET: 6, MAX_GUNS: 3, MAX_MEN: 60, MEN_STEP: 10,   // ours: 60 is the standing room on a flatboat's floor
    // --- what stops what: feet of earth that stop a ball of each kind — ours, on the light side of period field works
    STOPS: { musket: 1, light: 2, field: 4 },
    // --- hands: the paper says men "can handle and transport these sacks" and the boats carry "artillery and men" — ours
    CREW: 5,             // men ashore needed to serve one gun
    HANDS: 10,           // men ashore needed to raise the parapet (a boat landing with fewer, and none already there, turns back)
    // --- the day and the rest of the army: "the rest will pass without difficulty" — ours
    PUSHES: 3,           // pushes before dark, each crossing
    FLEET: 5,            // open boats that pass each push once the bank is safe
    OPEN_BOAT: 60,       // men in an open boat (the standing room; 6 tuns)
    // --- hulls: "a vessel carries without sinking the weight of the water it could contain" — the paper's rule; the tuns are ours
    HULLS: {
      great:   { tuns: 12, name: 'the great flatboat',  depthFt: 2 },   // 24 ft × 8 ft × 2 ft of hollow, about 12 tuns of water
      shallow: { tuns: 6,  name: 'the shallow flatboat', depthFt: 1 }   // the same floor, a foot of hollow: 6 tuns
    },
    // --- the three crossings: the paper's cases, in the game's order (memo §11)
    CROSSINGS: [
      { id: 'battery', title: 'Below the Lech', place: 'the Danube below the Lech, towards the heart of Bavaria', hull: 'great',
        landings: [ { id: 'front', letter: 'A', name: 'opposite their battery', fire: 'field', battery: true, guns: 4 } ],
        paperLine: 'Leibniz: cannon-proof boats, equipped with artillery and men, designed so that the very earth they carry covers and entrenches them the moment they land; then the rest pass under the cover of that entrenchment and with the help of the artillery that has crossed.' },
      { id: 'foot', title: 'At the bend', place: 'a bend of the river, its convex side towards the enemy', hull: 'great',
        landings: [ { id: 'front', letter: 'A', name: 'where their foot waits', fire: 'musket', battery: false, guns: 0 } ],
        paperLine: 'Leibniz: where the enemy’s batteries are avoided, the flatboat does not need to be cannon-proof; it is enough that it carries men and what is needed to take cover quickly. The bend with its convex side towards the enemy forces them to divide their army, while ours stays together.' },
      { id: 'shallow', title: 'The narrows', place: 'the narrows, where the yard could build only shallow boats', hull: 'shallow',
        landings: [ { id: 'front', letter: 'A', name: 'opposite their battery', fire: 'light', battery: true, guns: 3 },
                    { id: 'up', letter: 'B', name: 'a mile upstream, beyond their guns', fire: 'musket', battery: false, guns: 0, mortars: true } ],
        paperLine: 'Leibniz: since earth and cannon are very heavy, these boats must have sufficient hollowness, because a vessel carries without sinking the weight of the water it could contain. And the enemy’s batteries are not as mobile as these boats: land further up- or downstream, where their mortars cannot follow.' }
    ],
    // --- the fire, in words, for the sheet
    FIRE: {
      musket: { what: 'their foot, with muskets', ball: 'a musket ball' },
      light:  { what: 'their battery of light pieces', ball: 'a light ball' },
      field:  { what: 'their battery of field pieces', ball: 'a six-pound ball' }
    },
    // --- fates, by share of the best total — ours
    FATES: [
      { min: 0.9,  line: 'The army is over by morning. The prince has your sheet framed.' },
      { min: 0.55, line: 'The army is over by the next evening, a day later than it might have been.' },
      { min: 0.2,  line: 'The army is over in the end, on flosses, a week late and in view of everyone.' },
      { min: 0,    line: 'The army waits on the wrong bank.' }
    ]
  };

  // ---------- the carrying rule ----------
  function weight(load) { return load.feet * CONFIG.FOOT_T + load.guns * CONFIG.GUN_T + load.men * CONFIG.MAN_T; }
  function hull(cr) { return CONFIG.HULLS[cr.hull]; }
  function floats(cr, load) { return weight(load) <= hull(cr).tuns + 1e-9; }           // the paper's rule, as written
  function draught(cr, load) { return Math.min(1.5, weight(load) / hull(cr).tuns); }  // share of the hollow under water (1 = the gunwale)

  // ---------- state ----------
  function newCrossing(k) {
    var cr = CONFIG.CROSSINGS[k], banks = {};
    cr.landings.forEach(function (l) { banks[l.id] = { men: 0, feet: 0, guns: 0, batteryOff: false, held: false }; });
    return { k: k, pushes: 0, banks: banks, across: 0, over: false, restPassed: false, restAt: null, log: [], firstLanded: null };
  }
  function newGame() { return { crossings: [newCrossing(0), newCrossing(1), newCrossing(2)], current: 0 }; }
  function landing(cr, id) { for (var i = 0; i < cr.landings.length; i++) if (cr.landings[i].id === id) return cr.landings[i]; return cr.landings[0]; }
  function bankSafe(l, bank) { return bank.held && (!l.battery || bank.batteryOff); }

  // ---------- one push ----------
  // load: { feet, guns, men, landing }. Returns the result (events for the drawing, sentences for the sheet) and updates the state.
  function push(state, load) {
    var cr = CONFIG.CROSSINGS[state.k], l = landing(cr, load.landing), bank = state.banks[l.id], H = hull(cr);
    var r = { push: state.pushes + 1, load: { feet: load.feet, guns: load.guns, men: load.men, landing: l.id }, events: [], lines: [], landed: false, across: 0 };
    state.pushes += 1;
    var w = weight(load), need = CONFIG.STOPS[l.fire], fire = CONFIG.FIRE[l.fire];
    r.weight = w; r.need = need;
    if (!floats(cr, load)) {
      r.outcome = 'sinks'; r.events.push({ t: 'sink' });
      r.lines.push('Push ' + r.push + '. ' + tuns(w) + ' in a hull that holds ' + tuns(H.tuns) + '. The boat sank at the bank; the men waded ashore on this side.');
    } else {
      r.events.push({ t: 'cross' });
      var safeWater = bankSafe(l, bank);
      if (!safeWater) {
        var stopped = load.feet >= need;
        r.events.push({ t: 'shot', fire: l.fire, need: need, feet: load.feet, stopped: stopped });
        if (!stopped) {
          r.outcome = 'through'; r.events.push({ t: 'back' });
          r.lines.push('Push ' + r.push + '. ' + cap(fire.ball) + ' went through ' + (load.feet ? feet(load.feet) + ' of earth and ' : '') + 'the planks. The boat turned back.' + (load.feet ? '' : ' Nothing aboard stopped it.'));
        } else {
          r.lines.push('Push ' + r.push + '. ' + cap(fire.ball) + ' stopped in ' + feet(load.feet) + ' of earth.');
        }
      }
      if (r.outcome !== 'through') {
        if (bank.men + load.men < CONFIG.HANDS) {
          r.outcome = 'nohands'; r.events.push({ t: 'back' });
          r.lines.push((safeWater ? 'Push ' + r.push + '. ' : '') + 'The boat touched the bank with ' + men(load.men) + ' aboard and nobody there: too few hands to raise a parapet. It came back.');
        } else {
          r.outcome = 'landed'; r.landed = true; r.events.push({ t: 'land', feet: Math.max(bank.feet, load.feet), men: load.men, guns: load.guns });
          bank.feet = Math.max(bank.feet, load.feet); bank.men += load.men; bank.guns += load.guns; bank.held = bank.feet >= need && bank.men >= CONFIG.HANDS;
          state.across += load.men; r.across += load.men;
          if (!state.firstLanded) state.firstLanded = { feet: load.feet, guns: load.guns, men: load.men, landing: l.id, push: r.push };
          r.lines.push((safeWater ? 'Push ' + r.push + '. ' : '') + 'The boat landed' + (safeWater ? ' behind your men' : '') + '. ' + cap(men(load.men)) + (load.men ? ' carried the sacks ashore and ' : ' ') + (load.feet ? 'the ' + feet(bank.feet) + ' of earth now stand on the bank as a parapet' : (bank.feet ? 'the men stand behind the parapet already there' : 'there is no earth to stand behind')) + (load.guns ? ', with ' + guns(load.guns) + ' behind it' : '') + '.');
          if (l.battery && !bank.batteryOff) {
            if (bank.guns >= 1 && bank.men >= CONFIG.CREW) {
              bank.batteryOff = true; r.events.push({ t: 'drive' });
              r.lines.push('Your gun fired from behind the earth. Their battery, on an open bank, limbered up and drew off.');
            } else if (bank.guns >= 1) {
              r.lines.push('A gun is ashore but fewer than ' + CONFIG.CREW + ' men to serve it; it stays silent. Their battery still commands the water.');
            } else {
              r.lines.push('Their battery still commands the water: an open boat could not cross it.');
            }
          }
          if (bankSafe(l, bank)) {
            var left = CONFIG.PUSHES - state.pushes, rest = left * CONFIG.FLEET * CONFIG.OPEN_BOAT;
            state.restPassed = true; state.restAt = r.push; state.across += rest; r.across += rest; r.rest = rest; r.left = left;
            r.events.push({ t: 'rest', boats: left * CONFIG.FLEET, men: rest });
            r.lines.push((l.battery ? 'Nothing over there can fire on an open boat now. ' : 'Your men hold the bank and their foot keeps off. ') + (left ? 'The rest pass: ' + CONFIG.FLEET + ' open boats of ' + CONFIG.OPEN_BOAT + ' every push left, ' + rest + ' men before dark.' : 'But it is dark: the rest pass at first light.'));
          }
        }
      }
    }
    if (state.restPassed || state.pushes >= CONFIG.PUSHES) state.over = true;
    r.acrossTotal = state.across; r.pushesLeft = CONFIG.PUSHES - state.pushes; r.over = state.over;
    state.log.push(r);
    return r;
  }

  // ---------- the best this boat could do here: exhaustive search over loadings and push sequences ----------
  function loadings(cr) {
    var out = [];
    cr.landings.forEach(function (l) {
      for (var f = 0; f <= CONFIG.MAX_FEET; f++) for (var g = 0; g <= CONFIG.MAX_GUNS; g++) for (var m = 0; m <= CONFIG.MAX_MEN; m += CONFIG.MEN_STEP) {
        var ld = { feet: f, guns: g, men: m, landing: l.id };
        if (floats(cr, ld)) out.push(ld);
      }
    });
    return out;
  }
  function cloneState(s) { return JSON.parse(JSON.stringify(s)); }
  function best(k) {
    var cr = CONFIG.CROSSINGS[k], L = loadings(cr), memo = {};
    function key(s) { return s.pushes + '|' + JSON.stringify(s.banks); }
    function go(s) {
      if (s.over) return { across: 0, seq: [] };
      var kk = key(s); if (memo[kk]) return memo[kk];
      var bestv = { across: 0, seq: [] }, triedWaste = false;
      for (var i = 0; i < L.length; i++) {
        var ld = L[i], t = cloneState(s); t.log = []; var before = t.across; var r = push(t, ld);
        if (!r.landed) { if (triedWaste) continue; triedWaste = true; }   // every wasted push is the same wasted push
        var sub = go(t); var v = { across: (t.across - before) + sub.across, seq: [ld].concat(sub.seq) };
        if (v.across > bestv.across) bestv = v;
      }
      memo[kk] = bestv; return bestv;
    }
    var s = newCrossing(k); s.log = []; var b = go(s);
    // is the best first push unique? count first loadings that reach the best total
    var firsts = [];
    for (var i = 0; i < L.length; i++) {
      var t = newCrossing(k); var r = push(t, L[i]); if (!r.landed) continue;
      var v = t.across + go(t).across; if (v === b.across) firsts.push(L[i]);
    }
    return { across: b.across, seq: b.seq, first: b.seq[0], firsts: firsts };
  }

  // ---------- the verdict ----------
  function crossingVerdict(state) {
    var k = state.k, cr = CONFIG.CROSSINGS[k], b = best(k), f = b.first, lines = [];
    lines.push('By dark: ' + men(state.across) + ' across.');
    lines.push('The most this boat could have put across here: ' + b.across + ', with ' + loadWords(f) + (cr.landings.length > 1 ? ' at ' + landing(cr, f.landing).letter : '') + ' on the first push.');
    var part = whereParted(state, b);
    if (part) lines.push(part);
    return { lines: lines, best: b.across, bestFirst: f, across: state.across, paperLine: cr.paperLine, parted: part };
  }
  function whereParted(state, b) {
    var cr = CONFIG.CROSSINGS[state.k], log = state.log, f = b.first;
    if (state.across >= b.across) return 'That is the paper’s loading.';
    if (!log.length) return 'No boat was pushed off.';
    var first = log[0], l0 = landing(cr, first.load.landing), need0 = CONFIG.STOPS[l0.fire];
    if (first.outcome === 'sinks') return 'Your first boat was loaded past the water it could hold: the hull is the budget, and earth and guns spend it fast.';
    if (first.outcome === 'through') {
      if (first.load.guns > 0 && first.load.feet < need0) return 'Your first boat carried ' + guns(first.load.guns) + ' and ' + (first.load.feet ? 'only ' + feet(first.load.feet) : 'no earth') + ': a gun keeps nothing off on the water, and weighs as much as twenty men; the earth does.';
      if (first.load.feet === 0) return 'Your first boat carried no earth. A boat of men is a boat of planks to a ball; the earth is the armour.';
      return 'Your first boat carried ' + feet(first.load.feet) + ' where ' + CONFIG.FIRE[l0.fire].ball + ' needs ' + feet(need0) + '.';
    }
    if (first.outcome === 'nohands') return 'Your first boat landed with too few men to raise the parapet.';
    if (first.landed && cr.landings.length > 1 && first.load.landing !== f.landing) return 'You landed at ' + l0.letter + '. With a hull of ' + tuns(hull(cr).tuns) + ' the wall their guns need leaves no room for a gun of yours, so their battery stays and the rest wait; at ' + landing(cr, f.landing).letter + ' a foot of earth is enough and the rest pass at once.';
    if (first.landed && l0.battery && first.load.guns === 0) return 'Your first boat landed and dug in without a gun. Men behind earth hold the bank; it takes a gun behind the earth to drive their battery off and let the rest pass.';
    if (first.landed && first.load.feet > need0) return 'Your first boat carried ' + feet(first.load.feet) + ' where ' + feet(need0) + ' would have stopped ' + CONFIG.FIRE[l0.fire].ball + '; the rest of that weight could have been men.';
    if (first.landed && first.load.men < f.men) return 'Your first boat landed with ' + men(first.load.men) + ' where ' + men(f.men) + ' would have floated.';
    return 'The first push could have made the bank safe at once.';
  }
  function gameVerdict(game) {
    var tot = 0, bst = 0, per = [];
    game.crossings.forEach(function (s) { var v = crossingVerdict(s); per.push(v); tot += s.across; bst += v.best; });
    var share = bst ? tot / bst : 0, fate = CONFIG.FATES[CONFIG.FATES.length - 1];
    for (var i = 0; i < CONFIG.FATES.length; i++) if (share >= CONFIG.FATES[i].min) { fate = CONFIG.FATES[i]; break; }
    return { total: tot, best: bst, share: share, fate: fate.line, per: per };
  }

  // ---------- words ----------
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  function tuns(t) {
    var r = Math.round(t * 10) / 10, whole = Math.floor(r), tenth = Math.round((r - whole) * 10);
    var frac = { 1: 'a tenth', 2: 'a fifth', 3: 'three tenths', 4: 'two fifths', 5: 'half', 6: 'three fifths', 7: 'seven tenths', 8: 'four fifths', 9: 'nine tenths' }[tenth];
    if (r === 0) return 'nothing'; if (r === 1) return 'a tun';
    if (!tenth) return whole + ' tuns';
    if (!whole) return tenth === 5 ? 'half a tun' : frac + ' of a tun';
    return whole + ' and ' + (tenth === 5 ? 'a half' : frac) + ' tuns';
  }
  function feet(f) { return f === 1 ? '1 ft' : f + ' ft'; }
  function men(m) { return m === 0 ? 'no men' : m === 1 ? 'one man' : m + ' men'; }
  function guns(g) { return g === 0 ? 'no gun' : g === 1 ? 'a gun' : g + ' guns'; }
  function loadWords(ld) { var p = []; p.push(ld.feet ? feet(ld.feet) + ' of earth' : 'no earth'); p.push(guns(ld.guns)); p.push(men(ld.men)); return p.join(', '); }
  function sumLine(cr, load) {
    var w = weight(load), H = hull(cr);
    return (load.feet ? feet(load.feet) + ' of earth ' + tuns(load.feet * CONFIG.FOOT_T) : 'no earth') + ' · ' + guns(load.guns) + (load.guns ? ' ' + tuns(load.guns * CONFIG.GUN_T) : '') + ' · ' + men(load.men) + (load.men ? ' ' + tuns(load.men * CONFIG.MAN_T) : '') + ' = ' + tuns(w) + ' of ' + H.tuns + (w > H.tuns + 1e-9 ? ' — it sinks' : '');
  }
  function wallWords(f) { if (f >= CONFIG.STOPS.field) return 'stops a six-pound ball'; if (f >= CONFIG.STOPS.light) return 'stops a light ball, not a six-pounder'; if (f >= CONFIG.STOPS.musket) return 'stops a musket ball, not a cannon ball'; return 'stops nothing'; }

  var M = { CONFIG: CONFIG, weight: weight, hull: hull, floats: floats, draught: draught, newGame: newGame, newCrossing: newCrossing, landing: landing, push: push,
            loadings: loadings, best: best, crossingVerdict: crossingVerdict, gameVerdict: gameVerdict, sumLine: sumLine, wallWords: wallWords,
            words: { tuns: tuns, feet: feet, men: men, guns: guns, loadWords: loadWords, cap: cap } };
  if (typeof module !== 'undefined' && module.exports) module.exports = M; else root.FLATBOAT = M;
})(typeof window !== 'undefined' ? window : this);
