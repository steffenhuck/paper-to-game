// Leibniz's Flatboat — the mechanism, headless. The only copy: build.py inlines this file verbatim into the HTML and
// refuses to build if the embedded copy differs. Runs unchanged in Node (module.exports) and in the browser (window.FLATBOAT).
// Kind: toy (memo §16). The one rule the paper states is run as written: a boat carries the weight of the water it could
// hold. Every other number is ours and tagged below. Revision 2: every push returns a list of frames, one thing happening
// and one plain sentence each, which the sheet plays slowly; the words are plain (cannonball, cannons, soldiers, tons).
(function (root) {
  'use strict';

  var CONFIG = {
    // --- weights, in tons (a tun of water, about a tonne). The paper: "earth and cannons are very heavy" — ours, rounded for play
    MAN_T: 0.1,          // a soldier with musket, arms and kit — ours (about 100 kg)
    GUN_T: 2,            // a light field cannon on its carriage, with its shot — ours (a 6-pounder and carriage weigh about 1.5 t)
    FOOT_T: 2,           // one foot of earth wall across the bow (8 ft wide, 4 ft high, in sacks) — ours (0.9 m³ of earth at 1.6 t/m³ is 1.45 t; rounded up for the sacks)
    // --- the dials
    MAX_FEET: 6, MAX_GUNS: 3, MAX_MEN: 60, MEN_STEP: 10,   // ours: 60 is the standing room on a flatboat's floor
    // --- what stops what: feet of earth that stop each kind of shot — ours, on the light side of period field works
    STOPS: { musket: 1, light: 2, field: 4 },
    // --- the day and the rest of the army: "the rest will pass without difficulty" — ours
    PUSHES: 3,           // pushes before dark, each crossing
    FLEET: 5,            // ordinary boats that cross each push once the far shore is safe
    OPEN_BOAT: 60,       // soldiers in an ordinary boat (the standing room; 6 tons)
    // --- hulls: "a vessel carries without sinking the weight of the water it could contain" — the paper's rule; the tons are ours
    HULLS: {
      great:   { tuns: 12, name: 'the big flatboat',     depthFt: 2 },   // 24 ft × 8 ft × 2 ft of hollow, about 12 tons of water
      shallow: { tuns: 6,  name: 'the shallow flatboat', depthFt: 1 }    // the same floor, a foot of hollow: 6 tons
    },
    // --- the three crossings: the paper's cases, in the game's order (memo §11)
    CROSSINGS: [
      { id: 'battery', title: 'Below the Lech', hull: 'great', opening: true,
        landings: [ { id: 'front', letter: 'A', name: 'opposite the enemy cannons', fire: 'field', battery: true, guns: 4 } ],
        paperLine: 'Leibniz: make the boats cannon-proof with the very earth they carry, put cannons and soldiers in them, and let that earth cover and entrench the soldiers the moment they land; then the rest of the army passes under the cover of that wall and with the help of the cannons that have crossed.' },
      { id: 'foot', title: 'At the bend', hull: 'great',
        landings: [ { id: 'front', letter: 'A', name: 'where enemy soldiers wait with muskets', fire: 'musket', battery: false, guns: 0 } ],
        paperLine: 'Leibniz: where the enemy’s cannons are avoided, the flatboat does not need to be cannon-proof; it is enough that it carries soldiers and what they need to take cover quickly. A bend with its bulge towards the enemy forces them to divide their army, while ours stays together.' },
      { id: 'shallow', title: 'The narrows', hull: 'shallow',
        landings: [ { id: 'front', letter: 'A', name: 'opposite the enemy’s small cannons', fire: 'light', battery: true, guns: 3 },
                    { id: 'up', letter: 'B', name: 'a mile upstream, out of reach of their cannons', fire: 'musket', battery: false, guns: 0, mortars: true } ],
        paperLine: 'Leibniz: since earth and cannon are very heavy, these boats must have hollowness enough, because a vessel carries without sinking the weight of the water it could contain. And the enemy’s cannons are not as mobile as these boats: land further up- or downstream, where their mortars cannot follow.' }
    ],
    // --- the fire, in plain words, for the sheet
    FIRE: {
      musket: { who: 'enemy soldiers with muskets', shot: 'a musket shot', shots: 'musket shots', label: 'ENEMY SOLDIERS' },
      light:  { who: 'the enemy’s small cannons', shot: 'a small cannonball', shots: 'small cannonballs', label: 'SMALL CANNONS' },
      field:  { who: 'the enemy cannons', shot: 'a cannonball', shots: 'cannonballs', label: 'ENEMY CANNONS' }
    },
    // --- the general's own first boat, shown before the player loads in crossing 1 — ours
    OPENING: { feet: 0, guns: 0, men: 60 },
    // --- fates, by share of the best total — ours
    FATES: [
      { min: 0.9,  line: 'The army is over by morning. The prince has your sheet framed.' },
      { min: 0.55, line: 'The army is over by the next evening, a day later than it might have been.' },
      { min: 0.2,  line: 'The army is over in the end, on rafts, a week late and in view of everyone.' },
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
    return { k: k, pushes: 0, banks: banks, across: 0, over: false, restPassed: false, restAt: null, log: [], firstLanded: null, openingDone: !cr.opening };
  }
  function newGame() { return { crossings: [newCrossing(0), newCrossing(1), newCrossing(2)], current: 0 }; }
  function landing(cr, id) { for (var i = 0; i < cr.landings.length; i++) if (cr.landings[i].id === id) return cr.landings[i]; return cr.landings[0]; }
  function bankSafe(l, bank) { return bank.held && (!l.battery || bank.batteryOff); }

  // ---------- one push ----------
  // load: { feet, guns, men, landing }. opts.opening: the general's boat, which does not count as a push and changes nothing.
  // Returns the result: frames for the sheet (each { pic, text }), the outcome, and the state after; updates the state unless opening.
  function push(state, load, opts) {
    opts = opts || {};
    var cr = CONFIG.CROSSINGS[state.k], l = landing(cr, load.landing), bank0 = state.banks[l.id], H = hull(cr);
    var bank = opts.opening ? JSON.parse(JSON.stringify(bank0)) : bank0;
    var r = { push: state.pushes + (opts.opening ? 0 : 1), opening: !!opts.opening, load: { feet: load.feet, guns: load.guns, men: load.men, landing: l.id }, frames: [], landed: false, across: 0 };
    if (!opts.opening) state.pushes += 1; else state.openingDone = true;
    var w = weight(load), need = CONFIG.STOPS[l.fire], fire = CONFIG.FIRE[l.fire];
    r.weight = w; r.need = need;
    var who = opts.opening ? 'The general’s boat' : 'Your boat';
    if (!floats(cr, load)) {
      r.outcome = 'sinks';
      r.frames.push({ pic: 'sink', text: who + ' is loaded with ' + tons(w) + '. The hull holds only ' + tons(H.tuns) + ' of water, so it carries only ' + tons(H.tuns) + '.' });
      r.frames.push({ pic: 'sunk', text: 'It sinks at the bank before it goes anywhere. The soldiers wade out. Nobody has crossed.' });
    } else {
      r.frames.push({ pic: 'push', text: who + ' pushes off with ' + loadWords(load) + ' aboard.' });
      var safeWater = bankSafe(l, bank);
      if (!safeWater) {
        var stopped = load.feet >= need;
        r.frames.push({ pic: 'fire', text: cap(fire.who) + ' fire at it as it crosses.', stopped: stopped });
        if (!stopped) {
          r.outcome = 'through';
          r.frames.push({ pic: 'through', text: cap(fire.shot) + ' goes straight through ' + (load.feet ? 'the ' + feet(load.feet) + ' of earth and ' : '') + 'the wooden planks. Only ' + feet(need) + ' of earth would stop it' + (load.guns ? '; the ' + guns(load.guns) + ' aboard cannot' : '') + '.' });
          r.frames.push({ pic: 'back', text: 'A boat that cannonballs go through cannot go on. It turns back. Nobody has landed.' });
        } else {
          r.frames.push({ pic: 'stuck', text: cap(fire.shot) + ' hits the heap of earth at the front and sticks in it. ' + cap(feet(load.feet)) + ' of earth is enough: the boat is not hurt.' });
        }
      } else {
        r.frames.push({ pic: 'quiet', text: 'Nothing fires on the river now: your soldiers hold the far shore.' });
      }
      if (r.outcome !== 'through' && bank.men + load.men === 0) {
        r.outcome = 'nobody';
        r.frames.push({ pic: 'back', text: 'Nobody is aboard to carry anything ashore. The boat drifts back.' });
      }
      if (r.outcome !== 'through' && r.outcome !== 'nobody') {
        r.outcome = 'landed'; r.landed = true;
        r.frames.push({ pic: 'land', text: 'The boat reaches the far shore.' });
        bank.feet = Math.max(bank.feet, load.feet); bank.men += load.men; bank.guns += load.guns; bank.held = bank.feet >= need && bank.men > 0;
        if (!opts.opening) { state.across += load.men; r.across += load.men; if (!state.firstLanded) state.firstLanded = { feet: load.feet, guns: load.guns, men: load.men, landing: l.id, push: r.push }; }
        if (load.feet) r.frames.push({ pic: 'wall', text: 'The soldiers carry the sacks ashore and stack them into a wall, ' + feet(bank.feet) + ' thick. They crouch behind it' + (load.guns ? ', with ' + guns(load.guns) + ' beside them' : '') + '. The wall stops ' + fire.shots + ', so they can stay.' });
        else if (bank.feet) r.frames.push({ pic: 'wall', text: 'The soldiers run to the wall already there and crouch behind it' + (load.guns ? ', with ' + guns(load.guns) + ' beside them' : '') + '.' });
        else r.frames.push({ pic: 'nowall', text: 'There is no earth to stack into a wall. The soldiers stand on the open shore.' });
        if (l.battery && !bank.batteryOff) {
          if (bank.guns >= 1) {
            bank.batteryOff = true;
            r.frames.push({ pic: 'drive', text: 'Your cannon fires from behind the wall. The enemy cannons stand in the open and cannot hit it, so they pull back out of range.' });
          } else {
            r.frames.push({ pic: 'wait', text: 'But the enemy cannons still fire on the river, so ordinary boats cannot cross yet. Only a cannon of yours, behind the wall, could drive them off.' });
          }
        }
        if (bankSafe(l, bank)) {
          var left = CONFIG.PUSHES - state.pushes, rest = left * CONFIG.FLEET * CONFIG.OPEN_BOAT;
          if (!opts.opening) { state.restPassed = true; state.restAt = r.push; state.across += rest; r.across += rest; r.rest = rest; r.left = left; }
          r.frames.push({ pic: 'rest', boats: left * CONFIG.FLEET, men: rest, text: (l.battery ? 'Nothing fires on the river now. ' : 'The enemy soldiers keep away from the wall. ') + (left ? 'The rest of the army crosses in ordinary boats: ' + rest + ' soldiers before dark.' : 'But it is dark. The rest of the army crosses at first light.') });
        } else if (!l.battery || bank.batteryOff) {
          r.frames.push({ pic: 'wait', text: 'Without a wall to crouch behind, the soldiers cannot hold the shore against ' + fire.who + '. They get back in the boat.' });
          bank.men -= load.men; bank.guns -= load.guns; if (!opts.opening) { state.across -= load.men; r.across -= load.men; } r.landed = false; r.outcome = 'nowall';
        }
      }
    }
    if (!opts.opening && (state.restPassed || state.pushes >= CONFIG.PUSHES)) state.over = true;
    r.acrossTotal = state.across; r.pushesLeft = CONFIG.PUSHES - state.pushes; r.over = state.over;
    if (!opts.opening) state.log.push(r);
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
    if (first.outcome === 'sinks') return 'Your first boat was loaded past the water it could hold: the hull is the budget, and earth and cannons spend it fast.';
    if (first.outcome === 'through') {
      if (first.load.guns > 0 && first.load.feet < need0) return 'Your first boat carried ' + guns(first.load.guns) + ' and ' + (first.load.feet ? 'only ' + feet(first.load.feet) + ' of earth' : 'no earth') + ': a cannon stops nothing on the water, and weighs as much as twenty soldiers; earth stops the shot.';
      if (first.load.feet === 0) return 'Your first boat carried no earth. To a cannonball a boat of soldiers is a boat of planks; the earth is the armour.';
      return 'Your first boat carried ' + feet(first.load.feet) + ' of earth where ' + CONFIG.FIRE[l0.fire].shot + ' needs ' + feet(need0) + '.';
    }
    if (first.outcome === 'nowall') return 'Your first boat landed soldiers with no earth to crouch behind, and they could not stay.';
    if (first.landed && cr.landings.length > 1 && first.load.landing !== f.landing) return 'You landed at ' + l0.letter + '. With a hull of ' + tons(hull(cr).tuns) + ', the earth their cannonballs need leaves no room for a cannon of yours, so the enemy cannons stay and the rest wait; at ' + landing(cr, f.landing).letter + ' a foot of earth is enough and the rest cross at once.';
    if (first.landed && l0.battery && first.load.guns === 0) return 'Your first boat landed and dug in without a cannon. Soldiers behind earth hold the shore; it takes a cannon behind that earth to drive the enemy cannons off and let the rest cross.';
    if (first.landed && first.load.feet > need0) return 'Your first boat carried ' + feet(first.load.feet) + ' of earth where ' + feet(need0) + ' would have stopped ' + CONFIG.FIRE[l0.fire].shot + '; the rest of that weight could have been soldiers.';
    if (first.landed && first.load.men < f.men) return 'Your first boat landed with ' + men(first.load.men) + ' where ' + men(f.men) + ' would have floated.';
    return 'The first push could have made the far shore safe at once.';
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
  function tons(t) {
    var r = Math.round(t * 10) / 10, whole = Math.floor(r), tenth = Math.round((r - whole) * 10);
    var frac = { 1: 'a tenth', 2: 'a fifth', 3: 'three tenths', 4: 'two fifths', 5: 'half', 6: 'three fifths', 7: 'seven tenths', 8: 'four fifths', 9: 'nine tenths' }[tenth];
    if (r === 0) return 'nothing'; if (r === 1) return 'a ton';
    if (!tenth) return whole + ' tons';
    if (!whole) return tenth === 5 ? 'half a ton' : frac + ' of a ton';
    return whole + ' and ' + (tenth === 5 ? 'a half' : frac) + ' tons';
  }
  function feet(f) { return f === 1 ? '1 ft' : f + ' ft'; }
  function men(m) { return m === 0 ? 'no soldiers' : m === 1 ? 'one soldier' : m + ' soldiers'; }
  function guns(g) { return g === 0 ? 'no cannon' : g === 1 ? 'a cannon' : g + ' cannons'; }
  function loadWords(ld) { var p = []; p.push(ld.feet ? feet(ld.feet) + ' of earth' : 'no earth'); p.push(guns(ld.guns)); p.push(men(ld.men)); return p.join(', '); }
  function sumLine(cr, load) {
    var w = weight(load), H = hull(cr), p = [];
    p.push(load.feet ? 'earth ' + feet(load.feet) : 'no earth');
    p.push(guns(load.guns).replace('a cannon', '1 cannon'));
    p.push(men(load.men));
    return p.join(' + ') + ' = ' + tons(w) + ' of ' + H.tuns + (w > H.tuns + 1e-9 ? ' \u2014 it sinks' : '');
  }
  // the earth against the shot fired at a landing: what the sheet says while loading
  function wallVs(f, fire) { var need = CONFIG.STOPS[fire], shot = CONFIG.FIRE[fire].shot; if (f >= need) return { ok: true, text: 'your ' + feet(f) + ' of earth stops ' + shot }; return { ok: false, text: (f ? 'your ' + feet(f) + ' of earth' : 'no earth') + ': ' + shot + ' goes through; ' + feet(need) + ' would stop it' }; }

  var M = { CONFIG: CONFIG, weight: weight, hull: hull, floats: floats, draught: draught, newGame: newGame, newCrossing: newCrossing, landing: landing, push: push,
            loadings: loadings, best: best, crossingVerdict: crossingVerdict, gameVerdict: gameVerdict, sumLine: sumLine, wallVs: wallVs,
            words: { tons: tons, tuns: tons, feet: feet, men: men, guns: guns, loadWords: loadWords, cap: cap } };
  if (typeof module !== 'undefined' && module.exports) module.exports = M; else root.FLATBOAT = M;
})(typeof window !== 'undefined' ? window : this);
