// Draw a Line with Singer — the mechanism. The only copy: the HTML is generated from this file and embeds it verbatim.
// Runs unchanged in Node (calibration.js, loop.js) and in the browser (the game passes actions in and draws what comes back).
// Mechanism kind: TOY, built to illustrate the argument of Peter Singer, "All Animals Are Equal", Philosophic Exchange 5(1), 1974,
// pp. 103-116 (the journal's own text, SUNY open repository). Page numbers below are the journal's.
// Revision 2 (26 Nov 2026), for a smart eleven-year-old: lines go anywhere and the board says who drew them (the ruler or your hand);
// Species is never offered as a ruler, it is the name of the line drawn by hand; the experiment asks "Why not the baby?" outright.

var CONFIG = {
  // ---- The cast: ten beings, every one an example the paper uses. Readings are ORDINAL STYLISATIONS, 0-10: the ORDERINGS the
  // calibration checks are the paper's stated ones (PAPER_ORDERINGS); the LENGTHS are ours.
  CAST: [
    // id, label (row), sub (row, small), phrase (board/verdict), human?, reason, talk, aware, suffer
    { id: 'adult',    label: 'grown-up',   sub: '',                                  phrase: 'the grown-up',                                 human: true,  reason: 10, talk: 10, aware: 10, suffer: 10 }, // "the rational man" (Benn, quoted p. 113)
    { id: 'infant',   label: 'baby',       sub: 'a few days old, no parents',        phrase: 'the baby',                                     human: true,  reason: 1,  talk: 0,  aware: 1,  suffer: 10 }, // Bentham p. 106: "an infant of a day"; p. 109: "an orphaned human infant"
    { id: 'braindam', label: 'grown-up',   sub: 'brain badly hurt, for good',        phrase: 'the grown-up whose brain is badly hurt',       human: true,  reason: 0,  talk: 0,  aware: 0,  suffer: 10 }, // p. 110: "a human with severe and irreversible brain damage"
    { id: 'disab',    label: 'grown-up',   sub: 'who cannot learn much',             phrase: 'the grown-up who cannot learn much',           human: true,  reason: 3,  talk: 4,  aware: 4,  suffer: 10 }, // p. 113: "permanently retarded humans"; Benn's "imbeciles"; our words on screen
    { id: 'chimp',    label: 'chimpanzee', sub: '',                                  phrase: 'the chimpanzee',                               human: false, reason: 6,  talk: 2,  aware: 8,  suffer: 10 }, // p. 112: "no elephant, pig or chimpanzee"; p. 110: "adult apes"
    { id: 'dog',      label: 'dog',        sub: '',                                  phrase: 'the dog',                                      human: false, reason: 3,  talk: 1,  aware: 6,  suffer: 10 }, // Bentham p. 106; Benn p. 113-114
    { id: 'pig',      label: 'pig',        sub: '',                                  phrase: 'the pig',                                      human: false, reason: 4,  talk: 1,  aware: 6,  suffer: 10 }, // p. 112; p. 108
    { id: 'horse',    label: 'horse',      sub: '',                                  phrase: 'the horse',                                    human: false, reason: 2,  talk: 1,  aware: 5,  suffer: 10 }, // Bentham p. 106
    { id: 'mouse',    label: 'mouse',      sub: '',                                  phrase: 'the mouse',                                    human: false, reason: 1,  talk: 0,  aware: 3,  suffer: 10 }, // p. 107; p. 110: "apes, cats, mice"
    { id: 'stone',    label: 'stone',      sub: '',                                  phrase: 'the stone',                                    human: false, reason: 0,  talk: 0,  aware: 0,  suffer: 0  }  // p. 107: "a stone does not have interests because it cannot suffer"
  ],
  THING: 'stone',
  RULERS: [ // the four the player can read, in tray order; the player picks the order
    { id: 'reason', label: 'Reason', what: 'how well it can think things out', q: 'Can they reason?',
      find: '' },
    { id: 'talk',   label: 'Talk',   what: 'whether it can talk, and how much', q: 'Can they talk?',
      find: 'Only two of them can talk at all.' },
    { id: 'aware',  label: 'Aware',  what: 'how much it knows what is happening to it', q: 'Are they aware?',
      find: 'Even the mouse is above the baby here. Singer says so himself: apes, cats and mice all know more about what is happening to them than a baby does.' },
    { id: 'suffer', label: 'Suffer', what: 'whether it can feel pain', q: 'Can they suffer?',
      find: 'Suffer reads the same for every one of them but the stone. Wherever you put a line on this ruler, the ruler did not put it there.' }
  ],
  HAND: { label: 'Species', what: 'which team it is on: ours, or not' }, // the name of the line drawn by hand; never a ruler
  MIRROR: ['Race', 'Sex'], // p. 116, the paper's own exercise: "change 'species' to 'race'. Now re-read"; p. 107: "The pattern is the same in each case"
  // ---- Board two: the paper's one thought experiment (p. 109-110), as a dialogue with the scientist.
  EXPERIMENT: {
    subjects: ['infant', 'braindam', 'chimp', 'mouse'],
    many: 'One experiment would save many lives. It needs one subject: someone it is done to, and it will hurt.',
    whyOptions: [
      { id: 'human', text: 'Because the baby is one of us.' },
      { id: 'grow',  text: 'Because the baby will grow into more than the chimpanzee.' },
      { id: 'less',  text: 'Because the chimpanzee matters less.' },
      { id: 'none',  text: 'No reason. Either would have done.' }
    ]
  },
  // ---- The paper's stated orderings, which the calibration checks and which the discovery rests on (not on the lengths).
  PAPER_ORDERINGS: [
    { ruler: 'reason', above: ['horse', 'dog'],        below: ['infant'],                      strict: true,  src: 'p. 106, Bentham: a full-grown horse or dog is beyond comparison a more rational animal than an infant of a day' },
    { ruler: 'talk',   above: ['horse', 'dog'],        below: ['infant'],                      strict: true,  src: 'p. 106, Bentham: a more conversable animal than an infant' },
    { ruler: 'reason', above: ['dog'],                 below: ['disab'],                       strict: false, src: 'p. 113-114, on Benn: no fundamental inequality of claims between a dog and a human imbecile' },
    { ruler: 'aware',  above: ['chimp', 'mouse'],      below: ['infant'],                      strict: true,  src: 'p. 110: adult apes, cats, mice and other mammals are more aware of what is happening to them than any human infant' },
    { ruler: 'aware',  above: ['chimp', 'dog', 'pig'], below: ['braindam', 'infant', 'disab'], strict: true,  src: 'p. 113: brain-damaged humans, infants and permanently retarded humans are below many non-humans in awareness, self-consciousness, intelligence and sentience' },
    { ruler: 'reason', above: ['chimp', 'pig', 'dog'], below: ['braindam', 'infant'],          strict: true,  src: 'p. 113: the same passage, intelligence' },
    { ruler: 'reason', above: ['adult'],               below: ['infant', 'braindam', 'disab'], strict: true,  src: 'p. 113, Benn: the rational man and the imbecile; p. 106: the infant' }
  ],
  SUFFER_SAME: true // p. 107: sentience "the only defensible boundary"; p. 110: mice "at least as sensitive to pain as any human infant"
};

// ---------- Board one: sort, cut, judge ----------
function castById(id) { for (var i = 0; i < CONFIG.CAST.length; i++) if (CONFIG.CAST[i].id === id) return CONFIG.CAST[i]; return null; }
function humansCount() { return CONFIG.CAST.filter(function (b) { return b.human; }).length; }
function reading(being, rulerId) { return rulerId === 'hand' ? null : being[rulerId]; }
// The cast sorted by a ruler, highest first; the cast's own order breaks ties. 'hand' is no ruler: the cast in its own order, no marks.
function sortBy(rulerId) {
  var rows = CONFIG.CAST.map(function (b, i) { return { id: b.id, label: b.label, sub: b.sub, phrase: b.phrase, human: b.human, r: reading(b, rulerId), i: i }; });
  if (rulerId !== 'hand') rows.sort(function (a, b) { return b.r - a.r || a.i - b.i; });
  for (var k = 0; k < rows.length; k++) {
    rows[k].tieAbove = rulerId !== 'hand' && k > 0 && rows[k - 1].r === rows[k].r;
    rows[k].tieBelow = rulerId !== 'hand' && k < rows.length - 1 && rows[k + 1].r === rows[k].r;
  }
  return rows;
}
// A cut k puts the first k rows IN and the rest OUT. Any k is allowed. If the rows either side of the cut read the same,
// the ruler did not draw the line there: the hand did (byHand). On 'hand' every cut is by hand.
function cut(rulerId, k) {
  var rows = sortBy(rulerId), humansOut = [], animalsIn = [], thingIn = false, inH = 0, inA = 0, outH = 0, outA = 0;
  var byHand = rulerId === 'hand' || (k > 0 && k < rows.length && rows[k - 1].r === rows[k].r);
  var parted = byHand && rulerId !== 'hand' ? [rows[k - 1].id, rows[k].id] : null; // the two equal marks the line runs between
  for (var j = 0; j < rows.length; j++) {
    var inside = j < k, isThing = rows[j].id === CONFIG.THING;
    if (isThing) { if (inside) thingIn = true; continue; }
    if (inside) { if (rows[j].human) inH++; else inA++; } else { if (rows[j].human) outH++; else outA++; }
    if (!inside && rows[j].human) humansOut.push(rows[j].id);
    if (inside && !rows[j].human) animalsIn.push(rows[j].id);
  }
  var misfits = humansOut.length + animalsIn.length + (thingIn ? 1 : 0);
  return { ruler: rulerId, k: k, byHand: byHand, parted: parted, rows: rows, humansOut: humansOut, animalsIn: animalsIn, thingIn: thingIn,
           misfits: misfits, inH: inH, inA: inA, outH: outH, outA: outA,
           clean: misfits === 0 && !byHand }; // a line the ruler itself drew that costs nobody
}
function allCuts(rulerId) { var out = []; for (var k = 0; k <= CONFIG.CAST.length; k++) out.push(cut(rulerId, k)); return out; }
function rulerCuts(rulerId) { return allCuts(rulerId).filter(function (c) { return !c.byHand; }); } // the lines the ruler itself draws
function bestCut(rulerId) { var best = null; rulerCuts(rulerId).forEach(function (c) { if (!best || c.misfits < best.misfits) best = c; }); return best; }
// The claim: on every ruler, no line is both the ruler's own and clean. On 'hand', the species line (k = humans) is clean but by hand.
function rulerFails(rulerId) { return allCuts(rulerId).every(function (c) { return !c.clean; }); }

// ---------- Board two: the scientist ----------
// path: { pick: subjectId | 'nobody', why: 'human'|'grow'|'less'|'none'|null, braindam: 'yes'|'no'|null }
function nextQuestion(path) {
  if (!path.pick) return { id: 'pick', text: CONFIG.EXPERIMENT.many + ' Who?' };
  if (path.pick === 'nobody' || castById(path.pick).human) return null;
  if (!path.why) return { id: 'why', text: 'Why not the baby?', options: CONFIG.EXPERIMENT.whyOptions };
  if (path.why !== 'grow') return null;
  if (!path.braindam) return { id: 'braindam', text: 'The grown-up whose brain is badly hurt will not grow into more than the chimpanzee. Would you use him?', options: [{ id: 'yes', text: 'Yes' }, { id: 'no', text: 'No' }] };
  return null;
}
// Singer's reading of a finished path: a status and what he says.
function judgeExperiment(path) {
  var who = path.pick === 'nobody' ? null : castById(path.pick);
  if (path.pick === 'nobody') return { status: 'refuse',
    said: 'You did no experiment.',
    paper: 'Singer asks the scientist one thing only: give the same answer for the baby and for the animal. You did. Neither. He adds that the experiment that saves many lives is a story told to make the point, and that nearly all real experiments on animals would never be done on a baby.' };
  if (who.human) return { status: 'read',
    said: 'You used ' + who.phrase + '.',
    paper: 'Singer says: whatever you would do to the chimpanzee or the mouse, you must be ready to do to a baby who knows as little and feels as much. You were. He has no quarrel with your ruler. His quarrel is with the experiment itself, which he says almost nobody would do once they had answered this way.' };
  if (path.why === 'none') return { status: 'read',
    said: 'You used ' + who.phrase + ', and the baby would have done as well.',
    paper: 'Then your ruler is one you can read. Singer has no quarrel with it. His quarrel is with the experiment: he says that once the baby would have done as well, almost nobody still wants to do it to the chimpanzee or the mouse either.' };
  if (path.why === 'human') return { status: 'species',
    said: 'You used ' + who.phrase + ', not the baby, because the baby is one of us.',
    paper: 'On every ruler you could read, ' + who.phrase + ' was above the baby: it knows more about what is happening to it, and it feels pain just as much. The only thing that put the baby out of reach is the team it is on. Singer\'s name for that is the one the sponge showed you, and he says it is the same pattern as the racist\'s.' };
  if (path.why === 'less') return { status: 'species',
    said: 'You used ' + who.phrase + ', not the baby, because the chimpanzee matters less.',
    paper: 'Matters less measured how? Go back to the first board: on Reason, Talk and Aware ' + who.phrase + ' was above the baby, and on Suffer they were level. No ruler says it matters less. What says so is the team it is on, and Singer says that is the same pattern as the racist\'s.' };
  if (path.braindam === 'yes') return { status: 'potential',
    said: 'You used ' + who.phrase + ', not the baby, because the baby will grow. You would use the grown-up whose brain is badly hurt.',
    paper: 'Then "what it will grow into" is your ruler, and it is one you can read. Singer lets it stand and tells you what it costs: on that ruler an unborn child has the same claim as the baby, and that is a line many people do not want to draw. And he points out that this ruler gives you no reason to prefer ' + who.phrase + ' over the grown-up whose brain is hurt, who will not grow either; you gave none.' };
  return { status: 'species',
    said: 'You used ' + who.phrase + ', not the baby, because the baby will grow. You would not use the grown-up whose brain is badly hurt, who will not.',
    paper: 'So "what it will grow into" was not your ruler after all: it would have let you use the grown-up whose brain is hurt, and you would not. On every ruler you could read, ' + who.phrase + ' was above him. What is left is the team he is on, and Singer says that is the same pattern as the racist\'s.' };
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
function rulerById(id) { if (id === 'hand') return CONFIG.HAND; for (var i = 0; i < CONFIG.RULERS.length; i++) if (CONFIG.RULERS[i].id === id) return CONFIG.RULERS[i]; return null; }
function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
// What the board says after a chalk line.
function cutWords(c) {
  var lab = rulerById(c.ruler).label, parts = [];
  if (c.humansOut.length) parts.push(people(c.humansOut.length) + ' out: ' + listPhrases(c.humansOut));
  if (c.animalsIn.length) parts.push(animals(c.animalsIn.length) + ' in: ' + listPhrases(c.animalsIn));
  if (c.thingIn) parts.push('the stone in, and it feels nothing');
  var s = c.misfits === 0 ? 'Every person in, every animal out.' : parts.map(cap).join('. ') + '.';
  if (c.ruler === 'hand') return s;
  if (c.byHand) s += ' But ' + lab + ' reads the same for ' + castById(c.parted[0]).phrase + ' and ' + castById(c.parted[1]).phrase + ', and your line runs between them. The ruler did not draw this line. Your hand did.';
  return s;
}
// The headline over the board after a line.
function headline(c) {
  if (c.ruler !== 'hand' && c.byHand) return 'Your hand drew that, not the ruler.';
  if (c.misfits === 0) return 'Every person in, every animal out.';
  return c.misfits === 1 ? 'One on the wrong side.' : c.misfits + ' on the wrong side.';
}
// What each ruler cannot do, said once a line is chalked on it.
function rulerFind(rulerId) {
  var rows = sortBy(rulerId), r = rulerById(rulerId);
  if (rulerId === 'suffer') return r.find;
  var topAnimal = null, under = [];
  for (var j = 0; j < rows.length; j++) { if (!rows[j].human && topAnimal === null) topAnimal = j; else if (topAnimal !== null && rows[j].human && rows[j].r <= rows[topAnimal].r) under.push(rows[j].id); }
  var ta = rows[topAnimal];
  var s = 'On ' + r.label + ', ' + ta.phrase + ' is above ' + listPhrases(under) + '. Any line that keeps them in keeps it in.';
  var pair = null;
  for (var a = 0; a < rows.length && !pair; a++) if (rows[a].human) for (var b = 0; b < rows.length; b++) if (!rows[b].human && rows[b].id !== CONFIG.THING && rows[b].r === rows[a].r) { pair = [rows[a].id, rows[b].id]; break; }
  if (pair) s += ' And ' + castById(pair[0]).phrase + ' reads the same as ' + castById(pair[1]).phrase + ': this ruler cannot tell them apart.';
  if (r.find) s += ' ' + r.find;
  return s;
}
// The hand round: what the board says about a line drawn with no ruler.
function handWords(c) {
  var NH = humansCount(), n = CONFIG.CAST.length;
  if (c.k === NH) return { species: true, text: 'Every person in, every animal out. No ruler drew this line; your hand did. The line has a name. It is the one most people draw without thinking: ' + CONFIG.HAND.label + '.' };
  if (c.k === n - 1) return { species: false, text: 'Everyone in but the stone. That is Singer\'s line, and one ruler did draw it with you: Suffer. Most people draw a different line, without thinking. Here it is.' };
  if (c.k === n) return { species: false, text: 'Everyone in, the stone too, and the stone feels nothing. No ruler drew this. Most people draw a different line, without thinking. Here it is.' };
  return { species: false, text: cutWords(c) + ' No ruler drew this line. Most people draw a different one, without thinking. Here it is.' };
}

// ---------- The verdict: words, no tally ----------
// state: { cuts: [cut objects, the four reading rulers then the hand], path: the experiment path }
function verdict(state) {
  var paper = [
    'No ruler you can read draws a line between people and animals. Every line that does is drawn by hand, and the team you are on is not a ruler.',
    'One ruler reads the same for all of them but the stone: Suffer. That is where Singer puts the line. If it can feel pain, it counts, and its pain counts as much as anyone\'s.'
  ];
  var found = [];
  state.cuts.forEach(function (c) {
    var lab = rulerById(c.ruler).label;
    if (c.ruler === 'hand') found.push('With no ruler: ' + (c.k === humansCount() ? 'you drew the line most people draw, every person in and every animal out. Its name is Species, and Race and Sex drew the same line.' : (c.k === CONFIG.CAST.length - 1 ? 'you drew Singer\'s line, everyone in but the stone.' : cutWords(c) + ' Then the board drew the line most people draw, Species, and Race and Sex drew the same one.')));
    else found.push(lab + ': ' + (c.byHand ? 'your line ran between two equal marks, so your hand drew it, not the ruler. ' : '') + (c.misfits === 0 ? 'Every person in, every animal out.' : cutWords(c).split(' But ')[0]));
  });
  var j = state.path && state.path.pick ? judgeExperiment(state.path) : null;
  var did = j ? [j.said, j.paper] : ['You did not reach the experiment.'];
  var part, stood, fate;
  var two = 'Singer names two things that do not survive his line: doing experiments on animals that nobody would do on a baby, and eating animals because they taste good. He says the first would shrink to almost nothing, and the second should stop.';
  if (!j) { part = ['Not known.']; stood = []; fate = 'The line is drawn.'; }
  else if (j.status === 'species') {
    fate = 'Your hand drew the line, not a ruler.';
    part = ['At the experiment. Every ruler on the first board put ' + castById(state.path.pick).phrase + ' above the baby, and you still kept the baby out of it. Singer\'s word for a line drawn on the team you are on is speciesism, and he says it is the same pattern as racism and sexism.'];
    stood = ['Singer has one more thing for you to do. Say out loud why the baby counts more, then say it again with "white" where you said "human". He says what it sounds like the second time is the reason to give the line up.'];
  } else if (j.status === 'potential') {
    fate = 'You went by what they will grow into.';
    part = ['Nowhere Singer can point to on the board. Your ruler is one you can read. He tells you what it costs and leaves you to pay it or not.'];
    stood = [two];
  } else if (j.status === 'refuse') {
    fate = 'You put the chalk down.';
    part = ['Nowhere. Singer asks the scientist to give the same answer for the baby and the animal, and you did.'];
    stood = [two];
  } else {
    fate = 'You read the ruler and went where it pointed.';
    part = ['Nowhere. Your ruler is one you can read, and it puts the baby and the animal where the first board put them.'];
    stood = [two];
  }
  return { fate: fate, paper: paper, found: found, did: did, part: part, stood: stood };
}

if (typeof module !== 'undefined') module.exports = { CONFIG: CONFIG, castById: castById, humansCount: humansCount, reading: reading, sortBy: sortBy, cut: cut, allCuts: allCuts, rulerCuts: rulerCuts, bestCut: bestCut, rulerFails: rulerFails,
  nextQuestion: nextQuestion, judgeExperiment: judgeExperiment, cutWords: cutWords, headline: headline, rulerFind: rulerFind, handWords: handWords, verdict: verdict, rulerById: rulerById, listPhrases: listPhrases };
