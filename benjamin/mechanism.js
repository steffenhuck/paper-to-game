// Benjamin's Veil — the mechanism, headless. The single source of truth: the HTML is generated from this file verbatim.
// Runs unchanged in Node (module.exports) and in the browser (window.VEIL).
// Kind: TOY. A model built to illustrate the argument of Benjamin, "Das Kunstwerk im Zeitalter seiner technischen
// Reproduzierbarkeit" (third version, Gesammelte Schriften I.2, pp. 471–508). The essay has no numbers; every number
// below is ours, tagged with the passage it was read from or with its design rationale.
(function (root) {
  'use strict';

  const CONFIG = {
    // ---- the veil: how near the face is let. n is nearness (0 = unapproachable, 1 = everyone, together, close up)
    VEILS: [
      { key: 'dark',   n: 0,    label: 'IN THE DARK',      who: 'the keeper and the spirits' },   // section V: the god in the cella, only for the priest
      { key: 'day',    n: 0.25, label: 'SHOWN ON THE DAY', who: 'the faithful, once a year' },    // section V: Madonnas veiled nearly all year
      { key: 'wall',   n: 0.5,  label: 'ON THE WALL',      who: 'whoever comes' },                // section V: the panel painting, the gallery
      { key: 'print',  n: 0.75, label: 'IN PRINT',         who: 'as many as the age can print' }, // section I: woodcut, engraving, lithograph, photograph
      { key: 'screen', n: 1,    label: 'ON THE SCREEN',    who: 'everyone, together, close up' }  // sections I, IV, XII: film, the mass, the close-up
    ],

    // ---- the ages. eyes: the multiplier the age applies to the halo when it arrives (our reading of sections III and VI:
    // perception changes with the techniques in the world, whatever this keeper does; the big drops at lithography and
    // photography follow section I and section VI). demand: how near the age's people have learned to want things
    // (section III, "Bedürfnis ... näherzubringen"). reach: share of the people who see the face at each veil, our table,
    // ordered by section I's techniques. ceiling: the widest veil the age's technique allows.
    AGES: [
      { key: 'cave', name: 'THE CAVE', date: 'LONG AGO', ceiling: 1, eyes: 1, demand: 0,
        technique: 'cave',
        newThis: 'No way to copy a face yet. It is painted on the wall of the cave.',           // section V: the elk, a magic instrument
        eyesLine: null,
        notYet: 'nothing can carry it farther',
        reach: [0.02, 0.12, 0.2, 0.3, 0.9], crowd: ['you and the spirits', 'the clan', 'the clan', '', ''] },
      { key: 'temple', name: 'THE TEMPLE', date: 'ANTIQUITY', ceiling: 2, eyes: 1, demand: 0.1,
        technique: 'temple',
        newThis: 'Casting and coining can copy a bronze or a coin, not a face like this one. It stands in the cella.', // section I; section V
        eyesLine: null,
        notYet: 'no way to print a face',
        reach: [0.02, 0.15, 0.22, 0.3, 0.9], crowd: ['you and the god', 'the city, at the festival', 'the city, in the forecourt', '', ''] },
      { key: 'cathedral', name: 'THE CATHEDRAL', date: 'ABOUT 1400', ceiling: 2, eyes: 0.95, demand: 0.2,
        technique: 'icon',
        newThis: 'New this age: the woodcut. Saints are printed in the market, roughly: too roughly for this face. Yours hangs in the choir.', // section I; section V
        eyesLine: 'there are woodcuts of saints in the market now',
        notYet: 'the woodcut is too rough for this face',
        reach: [0.02, 0.18, 0.25, 0.3, 0.9], crowd: ['you and the saints', 'the parish, on the feast day', 'the parish, in the nave', '', ''] },
      { key: 'court', name: 'THE COURT', date: 'ABOUT 1500', ceiling: 3, eyes: 0.85, demand: 0.4,
        technique: 'engraving',
        newThis: 'New this age: the engraving. A face can be printed a few hundred times, finely. Yours is a panel in the prince\'s gallery.', // section I; section V (panel vs fresco); footnote 2
        eyesLine: 'engravings hang in the houses of the town',
        notYet: 'nothing can show a face to everyone at once',
        reach: [0.02, 0.2, 0.3, 0.4, 0.9], crowd: ['you and the prince', 'the court, on the day', 'whoever is let into the gallery', 'a few hundred houses', ''] },
      { key: 'printshop', name: 'THE PRINT SHOP', date: 'ABOUT 1830', ceiling: 3, eyes: 0.7, demand: 0.5,
        technique: 'litho',
        newThis: 'New this age: the lithograph. A face can be printed in the daily paper, in every house.', // section I: lithography, the illustrated daily
        eyesLine: 'the illustrated paper comes out every day',
        notYet: 'nothing can show a face to everyone at once',
        reach: [0.02, 0.2, 0.3, 0.55, 0.9], crowd: ['you and the vault', 'the town, on the day', 'whoever comes to the museum', 'every house', ''] },
      { key: 'studio', name: 'THE STUDIO', date: 'ABOUT 1880', ceiling: 3, eyes: 0.4, demand: 0.7,
        technique: 'halftone',
        newThis: 'New this age: the photograph. A face can be taken in a second and printed without end, into every house and every hand.', // section I; section VI
        eyesLine: 'everyone has a photograph of their dead', sayCause: true, // the cause is said once, here (revision 4)
        notYet: 'the film is not here yet',
        reach: [0.02, 0.2, 0.3, 0.75, 0.9], crowd: ['you and the vault', 'the town, on the day', 'whoever comes to the museum', 'every house and every hand', ''] },
      { key: 'cinema', name: 'THE CINEMA', date: 'ABOUT 1930', ceiling: 4, eyes: 0.2, demand: 0.9,
        technique: 'film',
        newThis: 'New this age: film. A face can fill a screen in front of a thousand people at once, in every town, every night.', // sections I, IV, XII
        eyesLine: 'everyone has sat in the dark with a thousand others',
        notYet: '',
        reach: [0.02, 0.2, 0.3, 0.75, 0.95], crowd: ['you and the vault', 'the town, on the day', 'whoever comes to the museum', 'every house and every hand', 'everyone, together'] }
    ],

    // ---- what an age's showing is worth: the people moved. moved = weight(age) * reach * (halo as they saw it + W_SEEN).
    // PEOPLE: how many people there are to move, relative, doubling each age (our choice: the masses arrive, sections I, IV, XII).
    // PEOPLE_CURVE: the weight is PEOPLE to this power, 0.5 = a square root, so the late masses count more without drowning the
    // early ages (our choice; the keeper's present still counts). Weights are normalised to sum to the number of ages.
    // W_SEEN: being seen with no halo left still moves people, a fifth as much as a full halo (section VI: exhibition value is
    // a value of its own; our price). Revision of 31 Oct 2026: the first version summed halo and reach, which paid a keeper for
    // a halo nobody saw; the heuristics table in the memo (section 17) is what settled these three numbers.
    PEOPLE: [1, 2, 4, 8, 16, 32, 64],
    PEOPLE_CURVE: 0.5,
    W_SEEN: 0.2,
    DEMAND_SCALE: 0.15,  // our choice: how fast the crowd falls away when the face is kept farther than the age demands (section III)
    HALO_GONE: 0.03,     // our choice: below this the halo is drawn as gone

    // ---- 1936: the fork. Not scored against the ages; read. haloBack is a printed halo, in ink, not leaf.
    FORK: [
      { key: 'vault', label: 'THE VAULT', meaning: 'the one true face, certified, for one buyer',
        haloBack: 0, reach: 0.01, hold: 0.1,   // footnote 8: authenticity as the collector's fetish
        line: 'Nobody sees it. It has a certificate now: the one true face, with a price. What was a halo is a label.',
        benjamin: 'Benjamin: the idea of the authentic original arrived with the copies, and the collector keeps it as a fetish.' },
      { key: 'studio', label: 'THE STUDIO', meaning: 'a star: the face lit, named, on every poster',
        haloBack: 0.6, reach: 0.9, hold: 1.3,  // section X: the "personality" built by film capital outside the studio
        line: 'The halo is back, in ink. The studio has built a personality around the face and sells it on every wall.',
        benjamin: 'Benjamin: the star cult is the phony spell of the commodity, a halo rebuilt to be sold.' },
      { key: 'rally', label: 'THE RALLY', meaning: 'the leader\'s face over a square full of people',
        haloBack: 1, reach: 1, hold: 2, war: true, // epilogue: aestheticising politics; the mass given expression, not rights; war
        line: 'The halo is back, enormous, and the square is full. The people are given the face to look at instead of anything to own.',
        benjamin: 'Benjamin: this is politics made beautiful, and it ends in war. "Let art be made, though the world perish."' },
      { key: 'newsreel', label: 'THE NEWSREEL', meaning: 'the people film themselves; the face is one of a million',
        haloBack: 0, reach: 1, hold: 1,        // section X: everyone has a claim to be filmed; section XIII; the epilogue's last line
        line: 'No halo. The face is one among the people\'s own faces, and anyone can be in the picture.',
        benjamin: 'Benjamin: this is art made political, his answer to the rally.' }
    ]
  };

  // ---- words (no decimals on screen)
  function haloWords(h) {
    if (h >= 0.9) return 'bright';
    if (h >= 0.65) return 'a little thinner';
    if (h >= 0.4) return 'about half what it was';
    if (h >= 0.2) return 'a quarter of what it was';
    if (h > CONFIG.HALO_GONE) return 'almost gone';
    return 'gone';
  }
  function fractionWords(f) {
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
    return age.reach[v] * cut;
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
  function holdOf(cult, reach, cfg) { return movedOf(1, reach, cult, cfg).moved; }   // kept for the fork's reading; not used for the ages
  // The most this age could move: its widest allowed reach, with the halo as it arrived. The bar under the picture is drawn against this,
  // so it answers "of what this age could do, how much did you?"; the ages' different sizes show up only in the tally.
  function ageMax(i, haloSeen, cfg) {
    cfg = cfg || CONFIG; const age = cfg.AGES[i]; const w = ageWeights(cfg)[i];
    let best = 0; for (let v = 0; v <= age.ceiling; v++) best = Math.max(best, reachAt(age, v, cfg));
    return w * best * (haloSeen + cfg.W_SEEN);
  }
  function movedScale(cfg) { cfg = cfg || CONFIG; const w = ageWeights(cfg); return Math.max(...w) * 1 * (1 + cfg.W_SEEN); }

  function newGame(cfg) {
    cfg = cfg || CONFIG;
    return { cfg: cfg, age: 0, halo: 1, arrived: false, haloBefore: 1, choice: null, results: [], fork: null, over: false };
  }
  function currentAge(s) { return s.cfg.AGES[s.age]; }
  function isFork(s) { return s.age >= s.cfg.AGES.length && !s.fork; }

  // The age arrives: the world's eyes act on the halo before the keeper does anything.
  function arrive(s) {
    if (s.arrived || s.age >= s.cfg.AGES.length) return s;
    const age = currentAge(s);
    s.haloBefore = s.halo;
    s.halo = s.halo * age.eyes;
    s.arrived = true;
    s.choice = null;
    return s;
  }
  function arrivalLine(s) {
    const age = currentAge(s);
    if (!age.eyesLine || s.haloBefore <= CONFIG.HALO_GONE) return '';
    const changed = s.halo <= CONFIG.HALO_GONE ? 'The halo is gone.' : (s.halo < s.haloBefore * 0.97 ? (haloWords(s.halo) === haloWords(s.haloBefore) ? 'The halo arrives a shade thinner.' : 'The halo arrives thinner than it was: ' + haloWords(s.halo) + '.') : 'The halo arrives as it was.');
    // the fact every age; the cause (the people's eyes) once, at the age that carries it (the photograph)
    return age.sayCause ? 'The people\'s eyes have changed: ' + age.eyesLine + '. ' + changed : changed;
  }
  function options(s) {
    const age = currentAge(s);
    return s.cfg.VEILS.map((v, i) => ({ index: i, label: v.label, who: v.who, n: v.n, allowed: i <= age.ceiling, why: i <= age.ceiling ? '' : age.notYet }));
  }
  function crowdLine(age, v, reach) {
    const w = age.crowd[v];
    if (v === 0) return 'Nobody came; the face stayed in the dark with ' + w + '.';
    if (v === 1) return w.charAt(0).toUpperCase() + w.slice(1) + ' saw it.';
    if (v === 2) return 'Whoever came saw it: ' + w + '.';
    if (v === 3) return 'The prints went out: ' + w + '.';
    return 'Everyone saw it, together, in the dark.';
  }
  function commit(s, v) {
    if (!s.arrived || s.choice !== null) throw new Error('not ready to commit');
    const age = currentAge(s);
    if (v < 0 || v > age.ceiling) throw new Error('veil not available this age');
    const haloArrived = s.halo;
    const reachFull = age.reach[v];
    const reach = reachAt(age, v, s.cfg);
    const halo = haloAfterVeil(haloArrived, v, s.cfg);
    const weight = ageWeights(s.cfg)[s.age];
    const mv = movedOf(weight, reach, haloArrived, s.cfg);   // the people saw the halo as it was when they came
    const cult = mv.byHalo, hold = mv.moved, ofAge = hold / ageMax(s.age, haloArrived, s.cfg);
    const counterfactual = s.cfg.VEILS.map((_, i) => ({ index: i, halo: haloAfterVeil(haloArrived, i, s.cfg), allowed: i <= age.ceiling }));
    let line = crowdLine(age, v, reach);
    if (v > 0 && reach < reachFull * 0.8) line += ' Fewer came than might have: the people want it nearer now.';
    line += ' The halo is ' + haloWords(halo) + (halo < haloArrived && halo > s.cfg.HALO_GONE ? ', and will not grow back.' : '.');
    const r = { age: s.age, ageKey: age.key, ageName: age.name, veil: v, haloArrived: haloArrived, halo: halo, cult: cult, bySeen: mv.bySeen, weight: weight, ofAge: ofAge, reach: reach, reachFull: reachFull, hold: hold, line: line, counterfactual: counterfactual, demandCut: v > 0 && reach < reachFull * 0.8 };
    s.halo = halo; s.choice = v; s.results.push(r);
    return r;
  }
  function next(s) {
    if (s.choice === null) throw new Error('commit first');
    s.age += 1; s.arrived = false; s.choice = null;
    return s;
  }
  function fork(s, k) {
    if (!isFork(s)) throw new Error('not at the fork');
    const f = s.cfg.FORK[k];
    s.fork = { key: f.key, label: f.label, haloBack: f.haloBack, reach: f.reach, hold: f.hold, war: !!f.war, line: f.line, benjamin: f.benjamin };
    s.over = true;
    return s.fork;
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
    const veil = ['in the dark', 'the faithful on the day', 'on the wall', 'in print', 'on the screen'];
    const runs = [];
    best.sched.forEach((v, i) => { const last = runs[runs.length - 1]; if (last && last.v === v) last.to = i; else runs.push({ v: v, from: i, to: i }); });
    const bits = runs.map(r => veil[r.v] + (r.from === r.to ? ' at ' + names[r.from] : ' from ' + names[r.from] + ' to ' + names[r.to]));
    return 'The most a keeper could have done: ' + bits.join('; ') + '.';
  }
  function openedAt(s) { // first age the face went to print or the screen; first age it was lifted at all
    let printed = -1, lifted = -1;
    s.results.forEach(r => { if (lifted < 0 && r.veil > 0) lifted = r.age; if (printed < 0 && r.veil >= 3) printed = r.age; });
    return { lifted: lifted, printed: printed };
  }
  function pathWords(s) {
    const names = s.cfg.AGES.map(a => a.name.toLowerCase().replace(/^the /, 'the '));
    const o = openedAt(s);
    const veiledThrough = s.results.filter(r => r.veil === 0).length;
    if (o.lifted < 0) return 'You kept the veil down through all seven ages. Nobody saw the face but you.';
    const parts = [];
    if (o.lifted === 0) parts.push('You lifted the veil from the first age');
    else parts.push('You kept the veil down through ' + names.slice(0, o.lifted).join(o.lifted === 2 ? ' and ' : ', ').replace(/, ([^,]*)$/, ' and $1') + ', then lifted it in ' + names[o.lifted]);
    if (o.printed >= 0) parts.push(o.printed === o.lifted ? 'and put the face in print at once' : 'and put the face in print in ' + names[o.printed]);
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
    if (o.printed < 0) readingOfPath = 'The halo went anyway, in the age of the photograph, while the veil was still down; what you kept at the end was a face nobody had seen.';
    else if (o.printed < bestOpen - 1) readingOfPath = 'You opened early. The halo was spent for a reach the age could not yet give; the best age to print was ' + ageNames[bestOpen] + '.';
    else if (o.printed > bestOpen + 1) readingOfPath = 'You opened late. By then the halo had gone on its own, and the ages of the print and the photograph had passed without the face in them.';
    else readingOfPath = 'You opened where the halo was already thin and the age could carry the face far: about where Benjamin dates the turn.';
    return {
      total: total, best: best.total, fraction: f, words: fractionWords(f),
      lead: 'Over seven ages your face moved ' + fractionWords(f) + ' of the people it could have moved.',
      did: pathWords(s) + ' ' + readingOfPath + ' ' + bestPathWords(best, s.cfg),
      benjamin: 'The halo was never in the face. It was the distance between the face and the people, and the age sets the distance. Hide the face and the halo still goes, because the people\'s eyes have changed; show it early and the age cannot yet carry it far. Once the copies are everywhere, the face belongs to politics.',
      fork: s.fork ? (s.fork.line + ' ' + s.fork.benjamin) : '',
      bestOpen: bestOpen, printed: o.printed, lifted: o.lifted
    };
  }

  // ---- the obvious ways to play, for the memo (build.md section 3) and the calibration check
  function heuristics(cfg) {
    cfg = cfg || CONFIG;
    const n = cfg.AGES.length;
    const openAt = (k) => Array.from({ length: n }, (_, i) => i < k ? 0 : 4);
    const rows = [
      { name: 'always veiled', sched: new Array(n).fill(0) },
      { name: 'always the widest veil', sched: new Array(n).fill(4) },
      { name: 'always shown on the day', sched: new Array(n).fill(1) },
      { name: 'open at the court', sched: openAt(3) },
      { name: 'open at the print shop', sched: openAt(4) },
      { name: 'open at the studio', sched: openAt(5) },
      { name: 'open at the cinema', sched: openAt(6) },
      { name: 'print, then back in the dark', sched: [0, 0, 0, 0, 3, 0, 0] },
      { name: 'one step wider each age', sched: [0, 0, 1, 2, 3, 3, 4] }
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

  const api = { CONFIG, newGame, currentAge, isFork, arrive, arrivalLine, options, commit, next, fork, verdict, totalHold, maxHold, bestSchedule, runSchedule, heuristics, withConfig, reachAt, haloAfterVeil, holdOf, movedOf, ageWeights, ageMax, movedScale, bestPathWords, haloWords, fractionWords, openedAt };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.VEIL = api;
})(typeof window !== 'undefined' ? window : globalThis);
