// Benjamin's Veil — the mechanism, headless. The single source of truth: the HTML is generated from this file verbatim.
// Runs unchanged in Node (module.exports) and in the browser (window.VEIL).
// Kind: TOY. A model built to illustrate the argument of Benjamin, "Das Kunstwerk im Zeitalter seiner technischen
// Reproduzierbarkeit" (third version, Gesammelte Schriften I.2, pp. 471–508). The essay has no numbers; every number
// below is ours, tagged with the passage it was read from or with its design rationale.
(function (root) {
  'use strict';

  const CONFIG = {
    // ---- the rungs: how far the face is let go, and by what means. Each age opens one more rung; the old ones stay.
    // n is how much of the halo a showing spends (section III: the aura withers as things are brought nearer and copied);
    // reach is the share of the age's people who see the face by that means (our table, ordered by section I's techniques).
    // Revision of 31 Oct 2026: the rungs are the paper's techniques, one per age, so what an age announces is what it offers.
    // carry: how much of the halo a showing by this means conveys to the people who see it. Presence carries it whole (section
    // III: the aura is the here and now of the original). No reproduction carries it whole (section II: "even the most perfect
    // reproduction lacks one thing, the here and now of the work of art"); a trace survives in the early photograph, where
    // "the aura emanates for the last time" (section VI), and least on film, where the performance is for the apparatus and
    // the audience is not present (sections VIII and IX). Our numbers, settled by simulation (memo, section 26).
    // tech: how a showing by this means is drawn. The original is one painting and never changes; what changes is what is shown.
    VEILS: [
      { key: 'dark',     n: 0,    reach: 0,    carry: 1,    tech: 'original', label: 'IN THE DARK',    who: 'the keeper alone',                  copies: false }, // section V: the god in the cella, only for the priest. Reach 0: the keeper is not the people; a face kept from every eye moves nobody
      { key: 'day',      n: 0.2,  reach: 0.18, carry: 1,    tech: 'original', label: 'ON THE DAY',     who: 'the faithful, once a year',         copies: false }, // section V: Madonnas veiled nearly all year
      { key: 'coins',    n: 0.55, reach: 0.25, carry: 0.3,  tech: 'coin',     label: 'ON COINS',       who: 'the city, in every purse, tiny',    copies: true  }, // section I: casting and stamping; bronzes, terracottas, coins. The god on the drachma: the most profane hand the face can fall into (our price: it spends more than the woodcut, for fewer eyes, and carries little)
      { key: 'woodcuts', n: 0.45, reach: 0.4,  carry: 0.5,  tech: 'woodcut',  label: 'IN WOODCUTS',    who: 'the parish, a few dozen sheets',    copies: true  }, // section I: the woodcut, the first graphic reproduction
      { key: 'lithos',   n: 0.7,  reach: 0.6,  carry: 0.6,  tech: 'litho',    label: 'IN LITHOGRAPHS', who: 'every house, in the daily paper',   copies: true  }, // section I: lithography, the illustrated daily
      { key: 'photos',   n: 0.85, reach: 0.8,  carry: 0.7,  tech: 'halftone', label: 'IN PHOTOGRAPHS', who: 'every house and every hand',        copies: true  }, // section I; section VI: the last trace of the aura
      { key: 'film',     n: 1,    reach: 0.95, carry: 0.35, tech: 'film',     label: 'ON FILM',        who: 'everyone, together, close up',      copies: true  }  // sections I, IV, VIII, IX, XII: film, the mass, the close-up; the screen cannot carry presence
    ],

    // ---- the ages. eyes: how much a halo moves the people of this age, relative to the age before (our reading of sections
    // III and VI: perception changes with the techniques in the world, whatever this keeper does; the big drops at photography
    // and film follow section VI). Revision of 31 Oct 2026 (memo, section 26): the eyes act on the halo's effect, never on
    // the halo itself. The halo is a stock that only showing spends; kept in the dark it stays whole, and is drawn whole. demand: how near the age's people have learned to want things (section III, "Bedürfnis ...
    // näherzubringen"); a face kept farther than that draws fewer than it could. ceiling: the newest rung the age opens.
    AGES: [
      { key: 'cave', name: 'THE CAVE', date: 'LONG AGO', ceiling: 1, eyes: 1, demand: 0,
        technique: 'cave',
        newThis: 'No way to copy a face yet. It is painted on the wall of the cave, for the spirits.',   // section V: the elk, a magic instrument
        eyesLine: null,
        crowd: ['you and the spirits', 'the clan', '', '', '', '', ''] },
      { key: 'temple', name: 'THE TEMPLE', date: 'ANTIQUITY', ceiling: 2, eyes: 1, demand: 0.15,
        technique: 'temple',
        newThis: 'New this age: the coin. A face can be struck in metal and carried in every purse, tiny and worn. Yours stands in the cella.',   // section I: casting and stamping; section V
        eyesLine: null,
        crowd: ['you and the god', 'the city, at the festival', 'the city, in every purse', '', '', '', ''] },
      { key: 'cathedral', name: 'THE CATHEDRAL', date: 'ABOUT 1400', ceiling: 3, eyes: 0.9, demand: 0.3,
        technique: 'icon',
        newThis: 'New this age: the woodcut. A face can be cut in wood and printed, roughly, a few dozen times. Yours hangs in the choir.',   // section I; section V
        eyesLine: 'there are woodcuts of saints in the market now',
        crowd: ['you and the saints', 'the parish, on the feast day', 'the town, in every purse', 'the parish, a few dozen sheets', '', '', ''] },
      { key: 'printshop', name: 'THE PRINT SHOP', date: 'ABOUT 1830', ceiling: 4, eyes: 0.7, demand: 0.55,
        technique: 'litho',
        newThis: 'New this age: the lithograph. A face can be printed in the daily paper, in every house.',   // section I: lithography, the illustrated daily
        eyesLine: 'the illustrated paper comes out every day',
        crowd: ['you and the vault', 'the town, on the day', 'the town, in every purse', 'a few dozen sheets', 'every house', '', ''] },
      { key: 'studio', name: 'THE STUDIO', date: 'ABOUT 1880', ceiling: 5, eyes: 0.45, demand: 0.75,
        technique: 'halftone',
        newThis: 'New this age: the photograph. A face can be taken in a second and printed without end, into every house and every hand.',   // section I; section VI
        eyesLine: 'everyone has a photograph of their dead', sayCause: true,   // the cause is said once, here (revision 4)
        crowd: ['you and the vault', 'the town, on the day', 'the town, in every purse', 'a few dozen sheets', 'every house', 'every house and every hand', ''] },
      { key: 'cinema', name: 'THE CINEMA', date: 'ABOUT 1930', ceiling: 6, eyes: 0.2, demand: 0.9,
        technique: 'film',
        newThis: 'New this age: film. A face can fill a screen in front of a thousand people at once, in every town, every night.',   // sections I, IV, XII
        eyesLine: 'everyone has sat in the dark with a thousand others',
        crowd: ['you and the vault', 'the town, on the day', 'the town, in every purse', 'a few dozen sheets', 'every house', 'every house and every hand', 'everyone, together'] }
    ],

    // ---- what an age's showing is worth: the people moved. moved = weight(age) * reach * (halo as they saw it + W_SEEN).
    // PEOPLE: how many people there are to move, relative, doubling each age (our choice: the masses arrive, sections I, IV, XII).
    // PEOPLE_CURVE: the weight is PEOPLE to this power, 0.5 = a square root, so the late masses count more without drowning the
    // early ages (our choice; the keeper's present still counts). Weights are normalised to sum to the number of ages.
    // W_SEEN: being seen with no halo left still moves people, about a seventh as much as a full halo (section VI: exhibition value is
    // a value of its own; our price). Revision of 31 Oct 2026: the first version summed halo and reach, which paid a keeper for
    // a halo nobody saw; the heuristics table in the memo (section 17) is what settled these three numbers.
    PEOPLE: [1, 2, 4, 8, 16, 32],
    PEOPLE_CURVE: 0.5,
    W_SEEN: 0.15,
    DEMAND_SCALE: 0.15,  // our choice: how fast the crowd falls away when the face is kept farther than the age demands (section III)
    HALO_GONE: 0.03,     // our choice: below this the halo is drawn as gone

    // ---- 1936: the epilogue, read, not played. The essay's last pages (section X on the star, footnote 8 on the collector,
    // the epilogue on aestheticised politics and war). The first version staged this as a fork with four places; it was a
    // reading dressed as a choice, with nothing at stake, and was cut (memo, section 22). What stays is Benjamin's sentence.
    EPILOGUE: 'The halo is gone; the longing for it is not. Where that longing is served, Benjamin says what comes of it: the collector\'s certificate on a face nobody sees; the film star\'s "personality", a halo rebuilt to be sold; and the leader\'s face on every wall and over a square full of people, which is politics made beautiful, and it ends in war. "Let art be made, though the world perish."'
  };

  // ---- words (no decimals on screen)
  function haloWords(h) {
    if (h >= 0.9) return 'bright';
    if (h >= 0.65) return 'a little thinner';
    if (h >= 0.4) return 'about half what it was';
    if (h >= 0.3) return 'about a third of what it was';
    if (h >= 0.15) return 'a quarter of what it was';
    if (h > CONFIG.HALO_GONE) return 'almost gone';
    return 'gone';
  }
  function fractionWords(f) {
    if (f <= 0.005) return 'none';
    if (f >= 0.995) return 'all';
    if (f >= 0.92) return 'nearly all';
    if (f >= 0.78) return 'about four fifths';
    if (f >= 0.7) return 'about three quarters';
    if (f >= 0.58) return 'about three fifths';
    if (f >= 0.45) return 'about half';
    if (f >= 0.3) return 'about a third';
    return 'well under a third';
  }

  // ---- the model
  function reachAt(age, v, cfg) {
    cfg = cfg || CONFIG;
    const veil = cfg.VEILS[v];
    const gap = age.demand - veil.n;
    const cut = gap > 0 ? Math.exp(-gap / cfg.DEMAND_SCALE) : 1;
    return cfg.VEILS[v].reach * cut;
  }
  function haloAfterVeil(haloArrived, v, cfg) { cfg = cfg || CONFIG; return haloArrived * (1 - cfg.VEILS[v].n); }
  function ageWeights(cfg) {
    cfg = cfg || CONFIG;
    const raw = cfg.PEOPLE.map(p => Math.pow(p, cfg.PEOPLE_CURVE));
    const sum = raw.reduce((a, b) => a + b, 0);
    return raw.map(x => x / sum * cfg.AGES.length);
  }
  // The people moved this age: how many saw it, times the halo they saw it with, plus a fifth for merely being seen.
  function movedOf(weight, reach, haloSeen, cfg) {
    cfg = cfg || CONFIG;
    return { byHalo: weight * reach * haloSeen, bySeen: weight * reach * cfg.W_SEEN, moved: weight * reach * (haloSeen + cfg.W_SEEN) };
  }
  // The most this age could move: its widest allowed reach, with the halo as it arrived. The bar under the picture is drawn against this,
  // so it answers "of what this age could do, how much did you?"; the ages' different sizes show up only in the tally.
  function ageMax(i, stock, eyes, cfg) {
    cfg = cfg || CONFIG; const age = cfg.AGES[i]; const w = ageWeights(cfg)[i];
    let best = 0; for (let v = 0; v <= age.ceiling; v++) best = Math.max(best, reachAt(age, v, cfg) * (stock * eyes * cfg.VEILS[v].carry + cfg.W_SEEN));
    return w * best;
  }
  // What the people saw, in words: the halo as the means carried it, to the eyes of the age.
  function seenLine(v, stock, seen, eyes) {
    if (v === 0) return '';
    if (stock <= CONFIG.HALO_GONE) return 'There was no halo left to see.';
    if (v === 1) {
      const what = stock > 0.5 ? 'halo and all' : 'and what was left of the halo';
      return eyes < 0.5 ? 'They stood before it, ' + what + ', and it moved them less than it moved their fathers: their eyes have seen a thousand faces.' : 'They stood before it, ' + what + '.';
    }
    const carry = CONFIG.VEILS[v].carry;
    const medium = ['', '', 'A coin', 'A woodcut', 'A lithograph', 'A photograph', 'The screen'][v];
    const carried = carry >= 0.65 ? 'carries a good part of the halo' : carry >= 0.45 ? 'carries about half of the halo' : 'carries little of the halo';
    return medium + ' ' + carried + (eyes < 0.5 ? ', and the eyes of this age are not their fathers\' eyes.' : '.');
  }
  function movedScale(cfg) { cfg = cfg || CONFIG; const w = ageWeights(cfg); return Math.max(...w) * 1 * (1 + cfg.W_SEEN); }

  function newGame(cfg) {
    cfg = cfg || CONFIG;
    return { cfg: cfg, age: 0, halo: 1, eyes: 1, arrived: false, choice: null, results: [], over: false };
  }
  function currentAge(s) { return s.cfg.AGES[s.age]; }
  function isOver(s) { return s.age >= s.cfg.AGES.length; }

  // The age arrives: the world's eyes act on the halo before the keeper does anything.
  // The eyes of an age: the product of every age's multiplier so far. The halo (s.halo) is untouched by arrival.
  function eyesOf(s, i) { let e = 1; for (let k = 0; k <= (i === undefined ? s.age : i); k++) e *= s.cfg.AGES[k].eyes; return e; }
  function arrive(s) {
    if (s.arrived || s.age >= s.cfg.AGES.length) return s;
    s.eyes = eyesOf(s);
    s.arrived = true;
    s.choice = null;
    return s;
  }
  function arrivalLine(s) {
    const age = currentAge(s);
    // Nothing happens to the picture when an age arrives. The one thing said, once, at the age that carries it (the photograph):
    // the people's eyes have changed, so a halo moves them less than it moved their fathers.
    return age.sayCause && age.eyesLine ? 'The people\'s eyes have changed: ' + age.eyesLine + '. A halo moves them less than it moved their fathers.' : '';
  }
  function options(s) {
    const age = currentAge(s);
    // Only the rungs this age has opened; the newest is flagged. The ladder grows by one rung an age and never loses one.
    return s.cfg.VEILS.filter((v, i) => i <= age.ceiling).map((v, i) => ({ index: i, key: v.key, label: v.label, who: age.crowd[i] || v.who, n: v.n, allowed: true, isNew: s.age > 0 && i === age.ceiling }));
  }
  function crowdLine(age, v, reach) {
    const w = age.crowd[v];
    const cap = t => t.charAt(0).toUpperCase() + t.slice(1);
    switch (v) {
      case 0: return 'Nobody came; the face stayed in the dark with ' + w + '.';
      case 1: return cap(w) + (w.indexOf(',') >= 0 ? ',' : '') + ' saw it.';
      case 2: return 'The coins went out: ' + w + '. A small worn face in every hand.';
      case 3: return 'The sheets went out: ' + w + '.';
      case 4: return 'The prints went out: ' + w + '.';
      case 5: return 'The photographs went out: ' + w + '.';
      default: return 'Everyone saw it, together, in the dark.';
    }
  }
  function commit(s, v) {
    if (!s.arrived || s.choice !== null) throw new Error('not ready to commit');
    const age = currentAge(s);
    if (v < 0 || v > age.ceiling) throw new Error('veil not available this age');
    const haloArrived = s.halo;                       // the stock, as it is: showing spends it, nothing else does
    const rung = s.cfg.VEILS[v];
    const reachFull = rung.reach;
    const reach = reachAt(age, v, s.cfg);
    const halo = haloAfterVeil(haloArrived, v, s.cfg);
    const weight = ageWeights(s.cfg)[s.age];
    const haloSeen = haloArrived * s.eyes * rung.carry;   // what moved them: the halo, as this means carries it, to eyes the age has made
    const mv = movedOf(weight, reach, haloSeen, s.cfg);
    const cult = mv.byHalo, hold = mv.moved, ofAge = hold / ageMax(s.age, haloArrived, s.eyes, s.cfg);
    let line;
    if (v > 0 && Math.round(reach * 40) < 1) line = 'Hardly anyone came: the people want it nearer than that now.';   // the demand cut took the whole crowd
    else {
      line = crowdLine(age, v, reach);
      if (v > 0 && reach < reachFull * 0.8) line += ' Fewer came than might have: the people want it nearer now.';
      line += ' ' + seenLine(v, haloArrived, haloSeen, s.eyes);
    }
    if (halo < haloArrived && (haloWords(halo) !== haloWords(haloArrived) || haloArrived - halo > 0.1)) line += ' The original\'s halo is ' + haloWords(halo) + (halo > s.cfg.HALO_GONE ? ', and will not grow back.' : '.');
    const r = { age: s.age, ageKey: age.key, ageName: age.name, veil: v, haloArrived: haloArrived, halo: halo, haloSeen: haloSeen, eyes: s.eyes, carry: rung.carry, lit: Math.min(1, haloSeen), cult: cult, bySeen: mv.bySeen, weight: weight, ofAge: ofAge, reach: reach, reachFull: reachFull, hold: hold, line: line, demandCut: v > 0 && reach < reachFull * 0.8 };
    s.halo = halo; s.choice = v; s.results.push(r);
    return r;
  }
  function next(s) {
    if (s.choice === null) throw new Error('commit first');
    s.age += 1; s.arrived = false; s.choice = null;
    if (s.age >= s.cfg.AGES.length) s.over = true;
    return s;
  }

  // ---- scoring and the verdict
  function totalHold(s) { return s.results.reduce((a, r) => a + r.hold, 0); }
  function maxHold(cfg) { return bestSchedule(cfg || CONFIG).total; }
  // the best schedule, exhaustively (5^7 = 78125 paths), for the verdict's "of what was possible"
  function runSchedule(sched, cfg) {
    cfg = cfg || CONFIG;
    const s = newGame(cfg);
    for (let i = 0; i < cfg.AGES.length; i++) { arrive(s); const v = Math.min(sched[i], cfg.AGES[i].ceiling); commit(s, v); next(s); }
    return s;
  }
  let _best = null;
  function bestSchedule(cfg) {
    cfg = cfg || CONFIG;
    if (cfg === CONFIG && _best) return _best;
    const n = cfg.AGES.length; let best = null;
    const sched = new Array(n).fill(0);
    const rec = (i) => {
      if (i === n) { const s = runSchedule(sched, cfg); const t = totalHold(s); if (!best || t > best.total + 1e-12) best = { total: t, sched: sched.slice(), state: s }; return; }
      for (let v = 0; v <= cfg.AGES[i].ceiling; v++) { sched[i] = v; rec(i + 1); }
    };
    rec(0);
    if (cfg === CONFIG) _best = best;
    return best;
  }
  // The best path in words: where the most careful keeper would have set the veil, age by age, runs of the same veil joined.
  function bestPathWords(best, cfg) {
    cfg = cfg || CONFIG;
    const names = cfg.AGES.map(a => a.name.toLowerCase());
    const veil = ['in the dark', 'the faithful on the day', 'on coins', 'in woodcuts', 'in lithographs', 'in photographs', 'on film'];
    const runs = [];
    best.sched.forEach((v, i) => { const last = runs[runs.length - 1]; if (last && last.v === v) last.to = i; else runs.push({ v: v, from: i, to: i }); });
    const bits = runs.map(r => veil[r.v] + (r.from === r.to ? ' at ' + names[r.from] : ' from ' + names[r.from] + ' to ' + names[r.to]));
    return 'The most a keeper could have done: ' + bits.join('; ') + '.';
  }
  // Where the player's ages fell short of the best path's, and why: the mechanism can tell two causes apart. Kept farther
  // than the age allowed (the best path's veil was wider: fewer saw it), or the halo spent earlier (the veil was as wide or
  // wider, but the halo they saw it with was thinner than on the best path). One or two sentences; nothing if within a twentieth.
  function shortfallWords(s, best) {
    const names = s.cfg.AGES.map(a => a.name.toLowerCase());
    const rows = s.results.map((r, i) => { const b = best.state.results[i]; return { i, gap: b.hold - r.hold, narrower: r.veil < b.veil, thinner: r.haloArrived < b.haloArrived - 0.02 }; });
    if (totalHold(s) >= 0.97 * best.total) return '';   // within a few hundredths of the best: nothing to explain
    if (s.results.every(r => r.veil === 0)) return '';   // never lifted: the reading says it all
    // a cause counts when the ages it explains lost, together, more than a twenty-fifth of the best; each named age lost at least a hundredth
    const sum = xs => xs.reduce((a, x) => a + x.gap, 0);
    const list = xs => xs.map(x => names[x.i]).join(xs.length === 2 ? ' and ' : ', ').replace(/, ([^,]*)$/, ' and $1');
    let narrow = rows.filter(x => x.narrower && x.gap > 0.01 * best.total), thin = rows.filter(x => !x.narrower && x.thinner && x.gap > 0.01 * best.total);
    if (sum(narrow) < 0.04 * best.total) narrow = [];
    if (sum(thin) < 0.04 * best.total) thin = [];
    const bits = [];
    if (narrow.length) bits.push((narrow.length >= 4 ? 'through ' + (narrow.length === rows.length ? 'all six ages' : 'most of the ages') : 'at ' + list(narrow.sort((a, b) => a.i - b.i))) + ' the face was kept farther from the people than it could have been, and fewer saw it');
    if (thin.length) {
      const wider = s.results.map((r, i) => r.veil > best.state.results[i].veil ? i : -1).filter(i => i >= 0);
      const where = wider.length === 0 ? 'early' : wider.length === 1 ? 'at ' + names[wider[0]] : 'early, from ' + names[wider[0]] + ' on';
      bits.push('the halo had been spent ' + where + ', so the crowds of ' + list(thin.sort((a, b) => a.i - b.i)) + ' saw a face with little of it left');
    }
    if (!bits.length) return '';
    const t = bits.join('; ');
    return 'But ' + t.charAt(0) + t.slice(1) + '.';
  }
  // The painting as it is at the end: what is left of its halo, and where the rest went.
  function faceNowWords(s) {
    const stock = s.halo;
    const used = []; s.results.forEach(r => { if (r.veil > 0) { const k = ['', 'to the faithful on the day', 'on coins', 'in woodcuts', 'in lithographs', 'in photographs', 'on film'][r.veil]; if (used.indexOf(k) < 0) used.push(k); } });
    const list = used.join(used.length === 2 ? ' and ' : ', ').replace(/, ([^,]*)$/, ' and $1');
    if (stock >= 0.97) return 'Its halo is whole. It has never left the dark.';
    if (stock <= CONFIG.HALO_GONE) return 'Its halo is gone. It went out to the people: ' + list + '.';
    return 'Its halo is ' + haloWords(stock) + '. The rest went out to the people: ' + list + '.';
  }
  function openedAt(s) { // first age the face went to print or the screen; first age it was lifted at all
    let printed = -1, lifted = -1;
    s.results.forEach(r => { if (lifted < 0 && r.veil > 0) lifted = r.age; if (printed < 0 && r.veil >= 3) printed = r.age; });
    return { lifted: lifted, printed: printed };
  }
  function pathWords(s) {   // the path in words; "put the face in print" means woodcuts or beyond
    const names = s.cfg.AGES.map(a => a.name.toLowerCase().replace(/^the /, 'the '));
    const o = openedAt(s);
    const veiledThrough = s.results.filter(r => r.veil === 0).length;
    if (o.lifted < 0) return 'You kept the veil down through all six ages. Nobody saw the face but you.';
    const parts = [];
    if (o.lifted === 0) parts.push('You lifted the veil from the first age');
    else parts.push('You kept the veil down through ' + names.slice(0, o.lifted).join(o.lifted === 2 ? ' and ' : ', ').replace(/, ([^,]*)$/, ' and $1') + ', then lifted it in ' + names[o.lifted]);
    if (o.printed >= 0) { const by = ['', '', 'on coins', 'in woodcuts', 'in lithographs', 'in photographs', 'on film'][s.results[o.printed].veil]; parts.push(o.printed === o.lifted ? 'and put the face ' + by + ' at once' : 'and put the face ' + by + ' in ' + names[o.printed]); }
    else parts.push('and never put it in print');
    return parts.join(' ') + '.';
  }
  function verdict(s) {
    const total = totalHold(s), best = bestSchedule(s.cfg);
    const f = total / best.total;
    const o = openedAt(s);
    const bestOpen = best.sched.findIndex(v => v >= 3);
    const ageNames = s.cfg.AGES.map(a => a.name.toLowerCase());
    let readingOfPath;
    const coined = s.results.length > 1 && s.results[1].veil === 2;
    const splash = o.lifted === s.cfg.AGES.length - 1 && s.results[o.lifted].veil >= 2;
    if (o.lifted < 0) readingOfPath = 'The halo is whole, and nobody has seen it. A face kept from every eye holds nobody: what you kept was a painting in the dark.';
    else if (splash) readingOfPath = 'You kept the halo whole through every age and showed it at last to everyone, ' + (s.results[o.lifted].veil === 6 ? 'on a screen, which cannot carry it' : 'in copies, which carry a trace of it') + ', to eyes that had seen a thousand faces. The crowds of five ages saw nothing; the sixth saw a copy.';
    else if (o.printed < 0) readingOfPath = 'The faithful saw it, halo and all, and few else did; the ages of print passed with the face in the dark.';
    else if (o.printed === bestOpen) readingOfPath = (coined ? 'You put the face on coins at the temple first, a worn god in every purse, and the halo paid for it before the woodcut came. Then you ' : 'You ') + 'put the face into the people\'s hands as soon as there was a way to print it, and followed each new way as it came.';
    else if (o.printed === bestOpen + 1) readingOfPath = (coined ? 'You put the face on coins at the temple, a worn god in every purse, and paid for it. ' : '') + 'You waited for the lithograph, where Benjamin dates the turn; the woodcut\'s few dozen sheets were the price of waiting, and it was small.';
    else readingOfPath = 'You opened late. The halo was whole, and the eyes of the age could no longer see it as their fathers had; the ages of print had passed without the face in them.';
    return {
      total: total, best: best.total, fraction: f, words: fractionWords(f),
      score: Math.max(0, Math.min(100, Math.round(f * 100))),   // the economist's tally, out of 100: people moved as a share of the most a keeper could have moved
      lead: 'Over six ages your face moved ' + fractionWords(f) + ' of the people it could have moved.',
      shortfall: shortfallWords(s, best),
      did: pathWords(s) + ' ' + readingOfPath + ' ' + (f >= 0.97 ? 'That is as much as any keeper could have done.' : bestPathWords(best, s.cfg)),
      benjamin: 'The halo was never in the face alone. It was between the face and the people, and no copy carries it whole; the age sets what the people can see. Keep the face in the dark and the halo stays, but the eyes of the age change, and when you show it at last they see it as they see everything else. Show it early and the age cannot yet carry it far. Once the copies are everywhere, the face belongs to politics.',
      epilogue: s.cfg.EPILOGUE,
      faceNow: faceNowWords(s),
      bestResults: best.state.results,
      bestOpen: bestOpen, printed: o.printed, lifted: o.lifted
    };
  }

  // ---- the obvious ways to play, for the memo (build.md section 3) and the calibration check
  function heuristics(cfg) {
    cfg = cfg || CONFIG;
    const n = cfg.AGES.length;
    const openAt = (k) => Array.from({ length: n }, (_, i) => i < k ? 0 : cfg.AGES[i].ceiling);
    const rows = [
      { name: 'always veiled', sched: new Array(n).fill(0) },
      { name: 'always the newest rung', sched: cfg.AGES.map(a => a.ceiling) },
      { name: 'always shown on the day', sched: new Array(n).fill(1) },
      { name: 'coins at the temple, then the newest', sched: [0].concat(cfg.AGES.slice(1).map(a => a.ceiling)) },
      { name: 'open at the cathedral', sched: openAt(2) },
      { name: 'open at the print shop', sched: openAt(3) },
      { name: 'open at the studio', sched: openAt(4) },
      { name: 'open at the cinema', sched: openAt(5) },
      { name: 'print, then back in the dark', sched: [0, 0, 0, 4, 0, 0] }
    ].map(h => { const s = runSchedule(h.sched, cfg); return { name: h.name, sched: h.sched.map((v, i) => Math.min(v, cfg.AGES[i].ceiling)), total: totalHold(s), perAge: s.results.map(r => r.hold) }; });
    const best = bestSchedule(cfg);
    rows.push({ name: 'the best possible', sched: best.sched, total: best.total, perAge: best.state.results.map(r => r.hold) });
    return rows;
  }
  function withConfig(overrides) { // a copy of CONFIG with some fields replaced, for the robustness checks
    const c = JSON.parse(JSON.stringify(CONFIG));
    Object.keys(overrides || {}).forEach(k => { c[k] = overrides[k]; });
    return c;
  }

  const api = { CONFIG, newGame, currentAge, isOver, arrive, arrivalLine, options, commit, next, verdict, totalHold, maxHold, bestSchedule, runSchedule, heuristics, withConfig, reachAt, haloAfterVeil, movedOf, ageWeights, ageMax, eyesOf, seenLine, movedScale, bestPathWords, shortfallWords, haloWords, fractionWords, openedAt };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.VEIL = api;
})(typeof window !== 'undefined' ? window : globalThis);
