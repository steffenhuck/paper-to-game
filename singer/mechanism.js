// Singer's Chalk Line — the mechanism. The only copy: the HTML is generated from this file and embeds it verbatim.
// Runs unchanged in Node (calibration.js, loop.js) and in the browser (the game passes actions in and draws what comes back).
// Mechanism kind: TOY, built to illustrate the argument of Singer, Animal Liberation (1975/1990), ch. 1, read in the
// Gensler anthology excerpt (Routledge 2004, pp. 284-292). Section names below are the excerpt's.

var CONFIG = {
  // ---- The cast: eleven beings, every one an example the paper uses, in the paper's own words (About screen).
  // Readings are ORDINAL STYLISATIONS, 0-10: the ORDERINGS the calibration checks are the paper's stated ones (listed under
  // PAPER_ORDERINGS); the LENGTHS are ours. The four rulers are the paper's own criteria: reasoning ("capable of making rational
  // decisions", section "The basis for equality"); self-awareness and plans for a future ("Killing"); close personal ties ("Killing");
  // the capacity to feel pain ("Equal consideration as a moral ideal": "the only defensible boundary").
  CAST: [
    // id, label (row), sub (row, small), paper's phrase (About/verdict), human?, reason, plans, ties, pain
    { id: 'adult',  label: 'adult',       sub: '',                               phrase: 'the adult',                              human: true,  reason: 10, plans: 10, ties: 9, pain: 10 }, // "a normal adult human"
    { id: 'baby',   label: 'baby',        sub: '',                               phrase: 'the baby',                               human: true,  reason: 2,  plans: 1,  ties: 8, pain: 10 }, // the slapped baby; "dogs can't vote" and nor can babies; ties: its parents
    { id: 'infant', label: 'infant',      sub: 'born with massive brain damage', phrase: 'the infant born with massive brain damage', human: true, reason: 0, plans: 0, ties: 0, pain: 10 }, // "Killing": never more than a "human vegetable"; the parents in the example ask for its death, so ties 0 by the example
    { id: 'disab',  label: 'adult',       sub: 'severe intellectual disability', phrase: 'the adult with a severe intellectual disability', human: true, reason: 4, plans: 8, ties: 6, pain: 10 }, // "Killing": the painkiller case; reason ties the dog ("can never achieve the intelligence level of a dog"); plans above the chimpanzee: our choice, the paper ranks only the infant and the senile below the animals
    { id: 'elder',  label: 'elder',       sub: 'advanced senility',              phrase: 'the elder in advanced senility',         human: true,  reason: 3,  plans: 1,  ties: 5, pain: 10 }, // "Killing": "someone in a state of advanced senility"
    { id: 'chimp',  label: 'chimpanzee',  sub: '',                               phrase: 'the chimpanzee',                         human: false, reason: 6,  plans: 7,  ties: 7, pain: 10 }, // "Killing": "far surpass the brain-damaged infant"
    { id: 'dog',    label: 'dog',         sub: '',                               phrase: 'the dog',                                human: false, reason: 4,  plans: 5,  ties: 7, pain: 10 }, // "Killing"; "the intelligence level of a dog"
    { id: 'pig',    label: 'pig',         sub: '',                               phrase: 'the pig',                                human: false, reason: 4,  plans: 5,  ties: 5, pain: 10 }, // "Killing"; "leave them with other pigs"
    { id: 'horse',  label: 'horse',       sub: '',                               phrase: 'the horse',                              human: false, reason: 3,  plans: 3,  ties: 4, pain: 10 }, // "Practical consequences": the slap and the heavy stick
    { id: 'mouse',  label: 'mouse',       sub: '',                               phrase: 'the mouse',                              human: false, reason: 1,  plans: 1,  ties: 2, pain: 10 }, // "Killing": "than it is to kill a mouse"; "mice do not have [ties] to the same degree"
    { id: 'oak',    label: 'oak',         sub: '',                               phrase: 'the oak',                                human: false, reason: 0,  plans: 0,  ties: 0, pain: 0  }  // our instance of "a being not capable of suffering" (the paper names the case, not the being)
  ],
  RULERS: [ // the four the player can read, in tray order; the player picks the order
    { id: 'reason', label: 'Reasoning', what: 'how well it can reason and decide' },
    { id: 'plans',  label: 'Plans',     what: 'how aware it is of itself, and of a future to plan for' },
    { id: 'ties',   label: 'Ties',      what: 'how close its ties to others are' },
    { id: 'pain',   label: 'Pain',      what: 'whether it can feel pain at all' }
  ],
  SPECIES: { id: 'species', label: 'Species', what: 'whether it is one of us' }, // the fifth ruler: not a measurement
  MIRROR: ['Race', 'Sex'],   // "The pattern is identical" (section "Equal consideration as a moral ideal"): the same line under other labels
  // ---- Board two: the paper's own thought experiments, in the order the discovery needs (memo, section 11).
  // scale 'pain': one dose; the readings in play are PAIN NOW (an amount, ours, after the slap/stick passage) and the paper's answer
  // goes by amount. scale 'life': one rescue; the readings in play are PLANS (from the cast) and the paper's answer goes by plans.
  SCENES: [
    { id: 'slap',  scale: 'pain', thing: 'one dose of painkiller', a: 'adult', b: 'pig',   painNow: { adult: 2, pig: 7 },     // "Practical consequences": a slap vs a heavy stick; the pig by extension from the horse
      setting: 'The adult was slapped. The pig was hit with a heavy stick.', paper: 'pig',
      why: 'A pain counts by how much it hurts, whoever hurts. The stick hurt more than the slap.' },
    { id: 'ward',  scale: 'pain', thing: 'one dose of painkiller', a: 'adult', b: 'disab', painNow: { adult: 6, disab: 6 },   // "Killing": "enough painkiller for one": "not so clear how we ought to choose"
      setting: 'Both have the same injury.', paper: 'either',
      why: 'The paper does not choose here. The pain is the same, and what else the two are like does not change a pain.' },
    { id: 'fire',  scale: 'life', thing: 'one rescue from a fire', a: 'adult', b: 'mouse',                                     // "Killing": "than it is to kill a mouse"; "we should choose to save the life of the human"
      setting: 'The fire will take whichever one you leave.', paper: 'adult',
      why: 'A life counts by what is in it: hopes, plans, ties. The adult loses all of that; the mouse loses less. Not because of species: look at the Plans marks.' },
    { id: 'fire2', scale: 'life', thing: 'one rescue from a fire', a: 'infant', b: 'chimp',                                    // "Killing": "there may be special cases in which the reverse holds true"
      setting: 'The fire will take whichever one you leave.', paper: 'chimp',
      why: 'By the Plans marks the chimpanzee loses more. The only thing left to prefer the infant by is species, the ruler that cannot be read.' }
  ],
  // ---- The paper's stated orderings, which the calibration checks and which the discovery rests on (not on the lengths).
  PAPER_ORDERINGS: [
    { ruler: 'plans',  above: ['chimp', 'dog', 'pig'], below: ['infant', 'elder'], strict: true,  src: '"Killing": chimpanzees, dogs, pigs far surpass the brain-damaged infant and the senile in self-awareness' },
    { ruler: 'reason', above: ['dog'],                 below: ['disab'],           strict: false, src: '"Killing": some severely retarded people can never achieve the intelligence level of a dog' },
    { ruler: 'plans',  above: ['adult'],               below: ['mouse'],           strict: true,  src: '"Killing": worse to kill a normal adult than a mouse, by self-awareness and plans' },
    { ruler: 'ties',   above: ['adult'],               below: ['mouse'],           strict: true,  src: '"Killing": close personal ties that humans have but mice do not to the same degree' },
    { ruler: 'ties',   above: ['dog', 'chimp', 'pig'], below: ['infant'],          strict: true,  src: '"Killing": the parents do not want the infant kept alive; the animals have a capacity for meaningful relations' },
    { ruler: 'reason', above: ['adult'],               below: ['baby'],            strict: true,  src: '"The basis for equality": the right to vote rests on rational decisions; a baby cannot vote' }
  ],
  PAIN_SAME: true // every being that can feel reads the same on Pain: capacity is the boundary, amount is board two ("Equal consideration as a moral ideal")
};

// ---------- Board one: sort, cut, judge ----------
function castById(id) { for (var i = 0; i < CONFIG.CAST.length; i++) if (CONFIG.CAST[i].id === id) return CONFIG.CAST[i]; return null; }
function reading(being, rulerId) { return rulerId === 'species' ? (being.human ? 1 : 0) : being[rulerId]; }
// The cast sorted by a ruler, highest first; the cast's own order breaks ties (so the sort is stable and the same every time).
function sortBy(rulerId) {
  var rows = CONFIG.CAST.map(function (b, i) { return { id: b.id, label: b.label, sub: b.sub, phrase: b.phrase, human: b.human, r: reading(b, rulerId), i: i }; });
  rows.sort(function (a, b) { return b.r - a.r || a.i - b.i; });
  for (var k = 0; k < rows.length; k++) {
    rows[k].tieAbove = k > 0 && rows[k - 1].r === rows[k].r;
    rows[k].tieBelow = k < rows.length - 1 && rows[k + 1].r === rows[k].r;
  }
  return rows;
}
// A cut k puts the first k rows (highest readings) IN and the rest OUT. A cut inside a tie is not legal: the ruler cannot tell them apart.
function cutLegal(rows, k) { return k >= 0 && k <= rows.length && !(k > 0 && k < rows.length && rows[k - 1].r === rows[k].r); }
function legalCuts(rulerId) { var rows = sortBy(rulerId), out = []; for (var k = 0; k <= rows.length; k++) if (cutLegal(rows, k)) out.push(k); return out; }
function cut(rulerId, k) {
  var rows = sortBy(rulerId), humansOut = [], animalsIn = [], oakIn = false, inH = 0, inA = 0, outH = 0, outA = 0;
  var legal = cutLegal(rows, k);
  for (var j = 0; j < rows.length; j++) {
    var inside = j < k, isOak = rows[j].id === 'oak';
    if (isOak) { if (inside) oakIn = true; continue; }
    if (inside) { if (rows[j].human) inH++; else inA++; } else { if (rows[j].human) outH++; else outA++; }
    if (!inside && rows[j].human) humansOut.push(rows[j].id);
    if (inside && !rows[j].human) animalsIn.push(rows[j].id);
  }
  // misfits are in the aim's units: a person out, an animal in; the oak in is a misfit of its own kind (nothing there to count)
  return { ruler: rulerId, k: k, legal: legal, rows: rows, humansOut: humansOut, animalsIn: animalsIn, oakIn: oakIn, misfits: humansOut.length + animalsIn.length + (oakIn ? 1 : 0),
           inH: inH, inA: inA, outH: outH, outA: outA };
}
function bestCut(rulerId) { var best = null; legalCuts(rulerId).forEach(function (k) { var c = cut(rulerId, k); if (!best || c.misfits < best.misfits) best = c; }); return best; }
// Every reading ruler fails: on it, every legal cut has a misfit. Species does not. This is what the calibration proves on this cast.
function rulerFails(rulerId) { return legalCuts(rulerId).every(function (k) { return cut(rulerId, k).misfits > 0; }); }

// ---------- Board two: the paper's choices ----------
function sceneById(id) { for (var i = 0; i < CONFIG.SCENES.length; i++) if (CONFIG.SCENES[i].id === id) return CONFIG.SCENES[i]; return null; }
function sceneMarks(scene, who) { // the two readings the scene shows under each figure: {painNow, plans}
  var b = castById(who);
  return { painNow: scene.scale === 'pain' ? scene.painNow[who] : 0, plans: b.plans };
}
function judge(sceneId, pick) {
  var s = sceneById(sceneId);
  if (pick !== s.a && pick !== s.b) throw new Error('pick not in scene');
  var status = s.paper === 'either' ? 'either' : (pick === s.paper ? 'agree' : 'part');
  return { scene: s, pick: pick, status: status, paper: s.paper, why: s.why };
}

// ---------- Words ----------
function listPhrases(ids) {
  var ps = ids.map(function (id) { return castById(id).phrase; });
  if (ps.length === 0) return 'nobody';
  if (ps.length === 1) return ps[0];
  return ps.slice(0, -1).join(', ') + ' and ' + ps[ps.length - 1];
}
function people(n) { return n === 1 ? '1 person' : n + ' people'; }
function animals(n) { return n === 1 ? '1 animal' : n + ' animals'; }
// What the board says after a chalk line, in the aim's units.
function cutWords(c) {
  var rulerLabel = rulerById(c.ruler).label;
  if (c.misfits === 0) return 'On ' + rulerLabel + ', every person in, every animal out. It works.';
  var parts = [];
  if (c.humansOut.length) parts.push(people(c.humansOut.length) + ' out: ' + listPhrases(c.humansOut));
  if (c.animalsIn.length) parts.push(animals(c.animalsIn.length) + ' in: ' + listPhrases(c.animalsIn));
  if (c.oakIn) parts.push('the oak in, which feels nothing');
  return 'On ' + rulerLabel + ', ' + parts.map(function (x, i) { return i ? cap(x) : x; }).join('. ') + '.';
}
function rulerById(id) { if (id === 'species') return CONFIG.SPECIES; for (var i = 0; i < CONFIG.RULERS.length; i++) if (CONFIG.RULERS[i].id === id) return CONFIG.RULERS[i]; return null; }
// What each ruler cannot do, said once the line is chalked: the thing to find out on that ruler.
function rulerFind(rulerId) {
  var rows = sortBy(rulerId);
  if (rulerId === 'pain') return 'Pain reads the same for every one of them but the oak. This ruler cannot tell a person from a pig: a line on it takes them all, or none.';
  // the highest animal, and every person under it
  var topAnimal = null, under = [];
  for (var j = 0; j < rows.length; j++) { if (!rows[j].human && topAnimal === null) topAnimal = j; else if (topAnimal !== null && rows[j].human && rows[j].r <= rows[topAnimal].r) under.push(rows[j].id); }
  var ta = rows[topAnimal];
  var s = 'On ' + rulerById(rulerId).label + ', ' + ta.phrase + ' stands above ' + listPhrases(under) + ': any line that keeps them in keeps it in.';
  // a person who reads the same as an animal: the ruler cannot tell them apart
  var pair = null;
  for (var a = 0; a < rows.length && !pair; a++) if (rows[a].human) for (var b = 0; b < rows.length; b++) if (!rows[b].human && rows[b].id !== 'oak' && rows[b].r === rows[a].r) { pair = [rows[a].id, rows[b].id]; break; }
  if (pair) s += ' And ' + castById(pair[0]).phrase + ' reads the same as ' + castById(pair[1]).phrase + ': this ruler cannot tell them apart.';
  return s;
}
function sceneWords(j) { // the board's own statement of what the player did, before the paper's line
  var s = j.scene, who = castById(j.pick), other = castById(j.pick === s.a ? s.b : s.a);
  if (s.scale === 'pain') return 'The dose went to ' + who.phrase + '. ' + cap(other.phrase) + ' stays in pain.';
  return 'You pulled out ' + who.phrase + '. The fire took ' + other.phrase + '.';
}
function paperWords(j) {
  var s = j.scene;
  if (j.status === 'either') return 'The paper: either. ' + s.why;
  if (j.status === 'agree') return 'The paper: the same, ' + castById(s.paper).phrase + '. ' + s.why;
  return 'The paper: ' + castById(s.paper).phrase + '. ' + s.why;
}
function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

// ---------- The verdict: words, no tally ----------
// state: { cuts: [cut objects in the order chalked, four reading rulers then species], picks: { sceneId: pickId } }
function verdict(state) {
  var paper = [
    'No ruler you can read draws the line at the species. The one that reads the same for all of them is Pain, and it puts everyone in but the oak.',
    'A pain counts by how much it hurts, whoever hurts. A life counts by what is in it, whoever lives it. Species sets nothing.'
  ];
  var found = [];
  state.cuts.forEach(function (c) {
    if (c.ruler === 'species') found.push('Only Species drew your line. Race drew the same line, and so did Sex.');
    else if (c.ruler === 'pain') found.push('Pain read one length for all of them but the oak. Your line went ' + (c.k === 0 ? 'above the lot: every person out.' : (c.oakIn ? 'under the lot, the oak too.' : 'under everyone who can feel: every animal in.')));
    else found.push(cutWords(c));
  });
  var chose = [], part = [], speciesLine = false, byAmount = true, byPlans = true;
  CONFIG.SCENES.forEach(function (s) {
    var pick = state.picks[s.id]; if (!pick) return;
    var j = judge(s.id, pick), who = castById(pick);
    if (s.scale === 'pain') {
      if (j.status === 'either') chose.push('With the same injury, the dose went to ' + who.phrase + '; the paper would not choose.');
      else if (j.status === 'agree') chose.push('The dose went to ' + who.phrase + ', who hurt more.');
      else { chose.push('The dose went to ' + who.phrase + ', who hurt less.'); byAmount = false; part.push('The dose: you gave it to ' + who.phrase + ', slapped, over ' + castById(s.paper).phrase + ', beaten. The paper says a smaller pain cannot outweigh a bigger one because of who feels it.'); speciesLine = true; }
    } else {
      if (j.status === 'agree') chose.push('From the fire you pulled ' + who.phrase + ', the life with more in it.');
      else { chose.push('From the fire you pulled ' + who.phrase + ', the life with less in it.'); byPlans = false;
             if (who.human) { speciesLine = true; part.push('The fire: you pulled out ' + who.phrase + ' and left ' + castById(s.paper).phrase + ', whose Plans mark is longer. The paper says that is the species line, the one no ruler could draw.'); }
             else part.push('The fire: you pulled out ' + who.phrase + ' and left ' + castById(s.paper).phrase + ', whose Plans mark is longer. The paper would pull out the life with more in it, whoever lives it.'); }
    }
  });
  var partLine = part.length ? part : ['Nowhere. Your four choices are the paper\'s.'];
  var stood = speciesLine
    ? ['Had yours stood, a smaller pain or a thinner life would outweigh a bigger one because of the species of the one who has it. The paper says that thought has the same shape as the racist\'s: a line drawn on the group you belong to, not on anything you can read.']
    : ['Had the paper\'s stood, and it is yours too, the paper says what follows: radical changes in diet, farming, experiments, hunting, furs, circuses, rodeos and zoos, and a vast amount of suffering avoided.'];
  var fate = speciesLine ? 'You drew the species line after all.' : (byAmount && byPlans ? 'You counted pain by the hurt and life by the plans.' : 'You counted pain by the hurt, and life by something else.');
  return { fate: fate, paper: paper, found: found, chose: chose, part: partLine, stood: stood };
}

if (typeof module !== 'undefined') module.exports = { CONFIG: CONFIG, castById: castById, reading: reading, sortBy: sortBy, legalCuts: legalCuts, cut: cut, bestCut: bestCut, rulerFails: rulerFails,
  sceneById: sceneById, sceneMarks: sceneMarks, judge: judge, cutWords: cutWords, rulerFind: rulerFind, sceneWords: sceneWords, paperWords: paperWords, verdict: verdict, rulerById: rulerById, listPhrases: listPhrases };
