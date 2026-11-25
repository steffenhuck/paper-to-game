// Singer's Chalk Line — the mechanism. The only copy: the HTML is generated from this file and embeds it verbatim.
// Runs unchanged in Node (calibration.js, loop.js) and in the browser (the game passes actions in and draws what comes back).
// Mechanism kind: TOY, built to illustrate the argument of Peter Singer, "All Animals Are Equal", Philosophic Exchange 5(1), 1974,
// pp. 103-116 (the journal's own text, SUNY open repository). Page numbers below are the journal's.
// Revision of 25 Nov 2026: the first build read the 2004 anthology excerpt of the 1975 book chapter; this one is checked against the 1974 paper.

var CONFIG = {
  // ---- The cast: ten beings, every one an example the paper uses. Readings are ORDINAL STYLISATIONS, 0-10: the ORDERINGS the
  // calibration checks are the paper's stated ones (PAPER_ORDERINGS); the LENGTHS are ours.
  // The four rulers are Bentham's three questions as the paper quotes them (p. 106: "Can they reason? ... Can they talk? ... Can they suffer?")
  // plus the one the paper adds in its own voice (p. 110, 113: "aware of what is happening to them, more self-directing"; "awareness, self-consciousness").
  CAST: [
    // id, label (row), sub (row, small), phrase (board/verdict), human?, reason, talk, aware, suffer
    { id: 'adult',    label: 'adult',      sub: '',                                  phrase: 'the adult',                                     human: true,  reason: 10, talk: 10, aware: 10, suffer: 10 }, // "the rational man" (Benn, quoted p. 113)
    { id: 'infant',   label: 'infant',     sub: 'a few days old, an orphan',         phrase: 'the infant',                                    human: true,  reason: 1,  talk: 0,  aware: 1,  suffer: 10 }, // Bentham p. 106: "an infant of a day, or a week, or even a month, old"; p. 109: "an orphaned human infant"
    { id: 'braindam', label: 'adult',      sub: 'severe, irreversible brain damage', phrase: 'the adult with irreversible brain damage',      human: true,  reason: 0,  talk: 0,  aware: 0,  suffer: 10 }, // p. 110: "a human with severe and irreversible brain damage"; p. 113: "severe and irreparable brain damage"
    { id: 'disab',    label: 'adult',      sub: 'severe intellectual disability',    phrase: 'the adult with a severe intellectual disability', human: true, reason: 3,  talk: 4,  aware: 4,  suffer: 10 }, // p. 113: "permanently retarded humans"; Benn's "imbeciles"; our wording on screen
    { id: 'chimp',    label: 'chimpanzee', sub: '',                                  phrase: 'the chimpanzee',                                human: false, reason: 6,  talk: 2,  aware: 8,  suffer: 10 }, // p. 112: "no elephant, pig or chimpanzee"; p. 110: "adult apes"
    { id: 'dog',      label: 'dog',        sub: '',                                  phrase: 'the dog',                                       human: false, reason: 3,  talk: 1,  aware: 6,  suffer: 10 }, // Bentham p. 106; Benn p. 113-114: the dog and the imbecile
    { id: 'pig',      label: 'pig',        sub: '',                                  phrase: 'the pig',                                       human: false, reason: 4,  talk: 1,  aware: 6,  suffer: 10 }, // p. 112; p. 108: the meal
    { id: 'horse',    label: 'horse',      sub: '',                                  phrase: 'the horse',                                     human: false, reason: 2,  talk: 1,  aware: 5,  suffer: 10 }, // Bentham p. 106: "a full-grown horse or dog"
    { id: 'mouse',    label: 'mouse',      sub: '',                                  phrase: 'the mouse',                                     human: false, reason: 1,  talk: 0,  aware: 3,  suffer: 10 }, // p. 107: the mouse that can be tormented; p. 110: "apes, cats, mice"
    { id: 'stone',    label: 'stone',      sub: '',                                  phrase: 'the stone',                                     human: false, reason: 0,  talk: 0,  aware: 0,  suffer: 0  }  // p. 107: "a stone does not have interests because it cannot suffer"
  ],
  THING: 'stone', // the one that feels nothing
  RULERS: [ // the four the player can read, in tray order; the player picks the order
    { id: 'reason', label: 'Reason', what: 'how well it can reason', q: 'Can they reason?',
      find: '' },
    { id: 'talk',   label: 'Talk',   what: 'whether it can talk, and how much', q: 'Can they talk?',
      find: 'Only two of them talk at all. A line that keeps the infant in goes under the mouse and the stone as well.' },
    { id: 'aware',  label: 'Aware',  what: 'how aware it is of what is happening to it', q: 'Are they aware?',
      find: 'Even the mouse stands above the infant here. The paper says so in its own voice: apes, cats and mice are more aware of what is happening to them than any infant.' },
    { id: 'suffer', label: 'Suffer', what: 'whether it can suffer at all', q: 'Can they suffer?',
      find: 'Suffer reads the same for every one of them but the stone. This ruler cannot tell a person from a pig: a line on it takes them all, or none.' }
  ],
  SPECIES: { id: 'species', label: 'Species', what: 'whether it is one of us' }, // the fifth ruler: not a measurement
  MIRROR: ['Race', 'Sex'], // p. 116, the paper's own exercise on Benn's passage: "change 'species' to 'race'. Now re-read"; p. 107: "The pattern is the same in each case"
  // ---- Board two: the paper's one thought experiment (p. 109-110), as a dialogue with the experimenter.
  EXPERIMENT: {
    subjects: ['infant', 'braindam', 'chimp', 'mouse'], // the paper names the orphaned infant, the brain-damaged human, adult apes and mice
    many: 'An experiment that would save many lives. It needs one subject.',
    whyOptions: [ { id: 'human', text: 'Because the infant is one of us.' }, { id: 'grow', text: 'Because the infant will grow into more than the chimpanzee.' } ]
  },
  // ---- The coda: what the paper says about killing, which is a footnote (fn. 7, p. 116).
  CODA: 'The paper argues about suffering, not killing. Killing is a footnote. It might be argued, the footnote says, that part of what is wrong with killing a human is that most humans have desires and purposes that reach into the future. If one took that view, the footnote goes on, one would have to hold that killing an infant or a human who is permanently retarded is less serious than killing a higher mammal that has a sense of its own existence over time. The paper leaves it there. So does this board.',
  // ---- The paper's stated orderings, which the calibration checks and which the discovery rests on (not on the lengths).
  PAPER_ORDERINGS: [
    { ruler: 'reason', above: ['horse', 'dog'],        below: ['infant'],                     strict: true,  src: 'p. 106, Bentham: a full-grown horse or dog is beyond comparison a more rational animal than an infant of a day' },
    { ruler: 'talk',   above: ['horse', 'dog'],        below: ['infant'],                     strict: true,  src: 'p. 106, Bentham: a full-grown horse or dog is a more conversable animal than an infant' },
    { ruler: 'reason', above: ['dog'],                 below: ['disab'],                      strict: false, src: 'p. 113-114, on Benn: no fundamental inequality of claims between a dog and a human imbecile; the dog "however faithful or intelligent"' },
    { ruler: 'aware',  above: ['chimp', 'mouse'],      below: ['infant'],                     strict: true,  src: 'p. 110: adult apes, cats, mice and other mammals are more aware of what is happening to them, more self-directing, than any human infant' },
    { ruler: 'aware',  above: ['chimp', 'dog', 'pig'], below: ['braindam', 'infant', 'disab'], strict: true, src: 'p. 113: humans with severe brain damage, infants and permanently retarded humans are below the level of awareness, self-consciousness, intelligence and sentience of many non-humans' },
    { ruler: 'reason', above: ['chimp', 'pig', 'dog'], below: ['braindam', 'infant'],         strict: true,  src: 'p. 113: the same passage, intelligence' },
    { ruler: 'reason', above: ['adult'],               below: ['infant', 'braindam', 'disab'], strict: true, src: 'p. 113, Benn: the rational man and the imbecile; p. 106: the infant' }
  ],
  SUFFER_SAME: true // every being that can feel reads the same on Suffer: p. 107, the limit of sentience is "the only defensible boundary"; p. 110: mice "at least as sensitive to pain as any human infant"
};

// ---------- Board one: sort, cut, judge ----------
function castById(id) { for (var i = 0; i < CONFIG.CAST.length; i++) if (CONFIG.CAST[i].id === id) return CONFIG.CAST[i]; return null; }
function humansCount() { return CONFIG.CAST.filter(function (b) { return b.human; }).length; }
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
  var rows = sortBy(rulerId), humansOut = [], animalsIn = [], thingIn = false, inH = 0, inA = 0, outH = 0, outA = 0;
  var legal = cutLegal(rows, k);
  for (var j = 0; j < rows.length; j++) {
    var inside = j < k, isThing = rows[j].id === CONFIG.THING;
    if (isThing) { if (inside) thingIn = true; continue; }
    if (inside) { if (rows[j].human) inH++; else inA++; } else { if (rows[j].human) outH++; else outA++; }
    if (!inside && rows[j].human) humansOut.push(rows[j].id);
    if (inside && !rows[j].human) animalsIn.push(rows[j].id);
  }
  // misfits are in the aim's units: a person out, an animal in; the stone in is a misfit of its own kind (nothing there to count)
  return { ruler: rulerId, k: k, legal: legal, rows: rows, humansOut: humansOut, animalsIn: animalsIn, thingIn: thingIn, misfits: humansOut.length + animalsIn.length + (thingIn ? 1 : 0),
           inH: inH, inA: inA, outH: outH, outA: outA };
}
function bestCut(rulerId) { var best = null; legalCuts(rulerId).forEach(function (k) { var c = cut(rulerId, k); if (!best || c.misfits < best.misfits) best = c; }); return best; }
// Every reading ruler fails: on it, every legal cut has a misfit. Species does not. This is what the calibration proves on this cast.
function rulerFails(rulerId) { return legalCuts(rulerId).every(function (k) { return cut(rulerId, k).misfits > 0; }); }

// ---------- Board two: the experimenter ----------
// path: { pick: subjectId | 'nobody', infant: 'yes'|'no'|null, why: 'human'|'grow'|null, braindam: 'yes'|'no'|null }
// Returns the next question the board asks, or null when the dialogue is over.
function nextQuestion(path) {
  if (!path.pick) return { id: 'pick', text: CONFIG.EXPERIMENT.many + ' Which?' };
  if (path.pick === 'nobody' || castById(path.pick).human) return null;
  if (!path.infant) return { id: 'infant', text: 'Would you have used the infant instead?', options: [{ id: 'yes', text: 'Yes' }, { id: 'no', text: 'No' }] };
  if (path.infant === 'yes') return null;
  if (!path.why) return { id: 'why', text: 'Why not the infant?', options: CONFIG.EXPERIMENT.whyOptions };
  if (path.why === 'human') return null;
  if (!path.braindam) return { id: 'braindam', text: 'The adult with irreversible brain damage will not grow into more than the chimpanzee. Would you use him?', options: [{ id: 'yes', text: 'Yes' }, { id: 'no', text: 'No' }] };
  return null;
}
// The paper's reading of a finished path: status and the line it says.
function judgeExperiment(path) {
  var who = path.pick === 'nobody' ? null : castById(path.pick);
  if (path.pick === 'nobody') return { status: 'refuse',
    said: 'You did no experiment. The many were not saved.',
    paper: 'The paper asks only that the experimenter answer the same for the infant and the ape. You did: neither. It adds that the many-lives case is a hypothetical, and that without the bias the experiments actually done would be a minute fraction of what is done today.' };
  if (who.human) return { status: 'read',
    said: 'You used ' + who.phrase + '.',
    paper: 'The paper says that whatever the experimenter would do to an ape he must be prepared to do to an infant at the same level, or lower, of awareness and sentience. You were. Your ruler is one you can read, and the paper has no quarrel with it. Its quarrel is with the experiment, which it says few would then still perform.' };
  // an animal
  if (path.infant === 'yes') return { status: 'read',
    said: 'You used ' + who.phrase + ', and would have used the infant.',
    paper: 'Then your ruler is one you can read, and on it ' + who.phrase + ' and the infant stand where the first board put them. The paper has no quarrel with that. Its quarrel is with the experiment: it says that once the bias is gone, few are left that anyone would do to either.' };
  if (path.why === 'human') return { status: 'species',
    said: 'You used ' + who.phrase + ', and not the infant, because the infant is one of us.',
    paper: 'On every ruler you can read, ' + who.phrase + ' stands above the infant: more aware of what is happening to it, more self-directing, and at least as sensitive to pain. The ruler that put the infant out of reach is the fifth one. The paper calls this simple discrimination, and says it is the same pattern as the racist\'s.' };
  if (path.braindam === 'yes') return { status: 'potential',
    said: 'You used ' + who.phrase + ', and not the infant, because the infant will grow. You would use the adult with irreversible brain damage.',
    paper: 'Then what they will become is your ruler, and it is one you can read. The paper lets it stand and names its price: on that ruler the fetus has the potential too, and so, taken together, do the egg and the sperm. And it notes that this ruler gives no reason to prefer ' + who.phrase + ' over the adult with brain damage, who will not grow either; you drew none.' };
  return { status: 'species',
    said: 'You used ' + who.phrase + ', and not the infant, because the infant will grow. You would not use the adult with irreversible brain damage, who will not.',
    paper: 'So what they will become was not the ruler: it would have let you use the adult with brain damage, and you would not. On every ruler you can read, ' + who.phrase + ' stands above him. What is left is the fifth ruler. The paper calls this simple discrimination, and says it is the same pattern as the racist\'s.' };
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
function rulerById(id) { if (id === 'species') return CONFIG.SPECIES; for (var i = 0; i < CONFIG.RULERS.length; i++) if (CONFIG.RULERS[i].id === id) return CONFIG.RULERS[i]; return null; }
// What the board says after a chalk line, in the aim's units.
function cutWords(c) {
  var rulerLabel = rulerById(c.ruler).label;
  if (c.misfits === 0) return 'On ' + rulerLabel + ', every person in, every animal out. It works.';
  var parts = [];
  if (c.humansOut.length) parts.push(people(c.humansOut.length) + ' out: ' + listPhrases(c.humansOut));
  if (c.animalsIn.length) parts.push(animals(c.animalsIn.length) + ' in: ' + listPhrases(c.animalsIn));
  if (c.thingIn) parts.push('the stone in, which feels nothing');
  return 'On ' + rulerLabel + ', ' + parts.map(function (x, i) { return i ? cap(x) : x; }).join('. ') + '.';
}
// What each ruler cannot do, said once the line is chalked: the thing to find out on that ruler.
function rulerFind(rulerId) {
  var rows = sortBy(rulerId), r = rulerById(rulerId);
  if (rulerId === 'suffer') return r.find;
  // the highest animal, and every person under it
  var topAnimal = null, under = [];
  for (var j = 0; j < rows.length; j++) { if (!rows[j].human && topAnimal === null) topAnimal = j; else if (topAnimal !== null && rows[j].human && rows[j].r <= rows[topAnimal].r) under.push(rows[j].id); }
  var ta = rows[topAnimal];
  var s = 'On ' + r.label + ', ' + ta.phrase + ' stands above ' + listPhrases(under) + ': any line that keeps them in keeps it in.';
  // a person who reads the same as an animal: the ruler cannot tell them apart
  var pair = null;
  for (var a = 0; a < rows.length && !pair; a++) if (rows[a].human) for (var b = 0; b < rows.length; b++) if (!rows[b].human && rows[b].id !== CONFIG.THING && rows[b].r === rows[a].r) { pair = [rows[a].id, rows[b].id]; break; }
  if (pair) s += ' And ' + castById(pair[0]).phrase + ' reads the same as ' + castById(pair[1]).phrase + ': this ruler cannot tell them apart.';
  if (r.find) s += ' ' + r.find;
  return s;
}
function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

// ---------- The verdict: words, no tally ----------
// state: { cuts: [cut objects in the order chalked, four reading rulers then species], path: the experiment path }
function verdict(state) {
  var paper = [
    'No ruler you can read draws the line at the species. The one that reads the same for all of them is Suffer, and it puts everyone in but the stone. The paper calls that the only defensible boundary.',
    'Equality is not a fact about them. It is a rule about how to treat them: like interests count the same, whoever has them.'
  ];
  var found = [];
  state.cuts.forEach(function (c) {
    if (c.ruler === 'species') found.push('Only Species drew your line. Race drew the same line, and so did Sex.');
    else if (c.ruler === 'suffer') found.push('Suffer read one length for all of them but the stone. Your line went ' + (c.k === 0 ? 'above the lot: every person out.' : (c.thingIn ? 'under the lot, the stone too.' : 'under everyone who can suffer: every animal in.')));
    else found.push(cutWords(c));
  });
  var j = state.path && state.path.pick ? judgeExperiment(state.path) : null;
  var did = j ? [j.said, j.paper] : ['You did not reach the experiment.'];
  var part, stood, fate;
  if (!j) { part = ['Not known.']; stood = []; fate = 'The line is drawn.'; }
  else if (j.status === 'species') {
    fate = 'You used the one ruler that cannot be read.';
    part = ['At the experiment. Every ruler on the first board put ' + castById(state.path.pick).phrase + ' above the infant, and you still would not swap them. The paper\'s word for a line drawn on the group you belong to is speciesism, and it says the pattern is the same as the racist\'s and the sexist\'s.'];
    stood = ['Had yours stood, the paper has one more thing for you to do, its own closing exercise: take your defence of the line, change "species" to "race", and re-read it. What it then reads as, the paper says, is the reason to give the line up.'];
  } else if (j.status === 'potential') {
    fate = 'You went by what they will become.';
    part = ['Nowhere the paper can point to on the board. Your ruler is one you can read. The paper names its price (the fetus, and the egg and sperm together, have the potential too) and leaves you to pay it or not.'];
    stood = ['If the paper\'s line stands, and yours is close to it, the paper names two practices that do not survive it: experiments on animals for purposes that would not justify using a human at the same level of awareness, and eating them for the taste. It says the first would shrink to a minute fraction, and the second should stop.'];
  } else if (j.status === 'refuse') {
    fate = 'You put the chalk down.';
    part = ['Nowhere. The paper asks the experimenter to answer the same for the infant and the ape, and you did.'];
    stood = ['If the paper\'s line stands, the paper names two practices that do not survive it: experiments on animals for purposes that would not justify using a human at the same level of awareness, and eating them for the taste. It says the first would shrink to a minute fraction, and the second should stop.'];
  } else {
    fate = 'You read the rulers and went where they led.';
    var w = castById(state.path.pick);
    part = ['Nowhere. Your ruler is one you can read, and it puts ' + (w.human ? 'the infant and the ape' : w.phrase + ' and the infant') + ' where the first board put them.'];
    stood = ['If the paper\'s line stands, and yours is the same line, the paper names two practices that do not survive it: experiments on animals for purposes that would not justify using a human at the same level of awareness, and eating them for the taste. It says the first would shrink to a minute fraction, and the second should stop.'];
  }
  return { fate: fate, paper: paper, found: found, did: did, part: part, stood: stood };
}

if (typeof module !== 'undefined') module.exports = { CONFIG: CONFIG, castById: castById, humansCount: humansCount, reading: reading, sortBy: sortBy, legalCuts: legalCuts, cut: cut, bestCut: bestCut, rulerFails: rulerFails,
  nextQuestion: nextQuestion, judgeExperiment: judgeExperiment, cutWords: cutWords, rulerFind: rulerFind, verdict: verdict, rulerById: rulerById, listPhrases: listPhrases };
