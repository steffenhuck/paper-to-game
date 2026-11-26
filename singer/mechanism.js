// Draw a Line with Singer — the mechanism. The only copy: the HTML is generated from this file and embeds it verbatim.
// Runs unchanged in Node (calibration.js, loop.js) and in the browser (the game passes actions in and draws what comes back).
// Mechanism kind: TOY, built to illustrate the argument of Peter Singer, "All Animals Are Equal", Philosophic Exchange 5(1), 1974,
// pp. 103-116 (the journal's own text, SUNY open repository). Page numbers below are the journal's.
// Revision 4 (26 Nov 2026): the player picks who counts with no ruler in sight (round 0), then sees each ruler in turn and may move
// anyone or keep the line (rounds 1-4, Reason, Talk, Aware, Suffer); each line is named by its shape; the verdict synthesises the five
// lines (who moved you, when) and the experiment reads the last one.

var CONFIG = {
  // ---- The cast: ten beings, every one an example the paper uses. Readings are ORDINAL STYLISATIONS, 0-10: the ORDERINGS the
  // calibration checks are the paper's stated ones (PAPER_ORDERINGS); the LENGTHS are ours.
  CAST: [
    { id: 'adult',    label: 'grown-up',   sub: '',                                  phrase: 'the grown-up',                                 human: true,  reason: 10, talk: 10, aware: 10, suffer: 10 }, // "the rational man" (Benn, quoted p. 113)
    { id: 'infant',   label: 'baby',       sub: 'a few days old, no parents',        phrase: 'the baby',                                     human: true,  reason: 1,  talk: 0,  aware: 1,  suffer: 10 }, // Bentham p. 106: "an infant of a day"; p. 109: "an orphaned human infant"
    { id: 'braindam', label: 'grown-up',   sub: 'brain badly hurt, for good',        phrase: 'the grown-up whose brain is badly hurt',       human: true,  reason: 0,  talk: 0,  aware: 0,  suffer: 10 }, // p. 110: "a human with severe and irreversible brain damage"
    { id: 'disab',    label: 'grown-up',   sub: 'who cannot learn much',             phrase: 'the grown-up who cannot learn much',           human: true,  reason: 3,  talk: 4,  aware: 4,  suffer: 10 }, // p. 113: "permanently retarded humans"; Benn's "imbeciles"; our words on screen
    { id: 'chimp',    label: 'chimpanzee', sub: '',                                  phrase: 'the chimpanzee',                               human: false, reason: 6,  talk: 2,  aware: 8,  suffer: 10 }, // p. 112; p. 110: "adult apes"
    { id: 'dog',      label: 'dog',        sub: '',                                  phrase: 'the dog',                                      human: false, reason: 3,  talk: 1,  aware: 6,  suffer: 10 }, // Bentham p. 106; Benn p. 113-114
    { id: 'pig',      label: 'pig',        sub: '',                                  phrase: 'the pig',                                      human: false, reason: 4,  talk: 1,  aware: 6,  suffer: 10 }, // p. 112; p. 108
    { id: 'horse',    label: 'horse',      sub: '',                                  phrase: 'the horse',                                    human: false, reason: 2,  talk: 1,  aware: 5,  suffer: 10 }, // Bentham p. 106
    { id: 'mouse',    label: 'mouse',      sub: '',                                  phrase: 'the mouse',                                    human: false, reason: 1,  talk: 0,  aware: 3,  suffer: 10 }, // p. 107; p. 110: "apes, cats, mice"
    { id: 'stone',    label: 'stone',      sub: '',                                  phrase: 'the stone',                                    human: false, reason: 0,  talk: 0,  aware: 0,  suffer: 0  }  // p. 107: "a stone does not have interests because it cannot suffer"
  ],
  THING: 'stone',
  RULERS: [
    { id: 'reason', label: 'Reason', what: 'how well it can think things out' },
    { id: 'talk',   label: 'Talk',   what: 'whether it can talk, and how much' },
    { id: 'aware',  label: 'Aware',  what: 'how much it knows what is happening to it' },
    { id: 'suffer', label: 'Suffer', what: 'whether it can feel pain' }
  ],
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
    ],
    outOption: { id: 'out', text: 'The baby is out on my line too.' } // offered only when the player's own line put the baby out
  },
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

// ---------- helpers ----------
function castById(id) { for (var i = 0; i < CONFIG.CAST.length; i++) if (CONFIG.CAST[i].id === id) return CONFIG.CAST[i]; return null; }
function humans() { return CONFIG.CAST.filter(function (b) { return b.human; }).map(function (b) { return b.id; }); }
function feelers() { return CONFIG.CAST.filter(function (b) { return b.id !== CONFIG.THING; }).map(function (b) { return b.id; }); }
function allIds() { return CONFIG.CAST.map(function (b) { return b.id; }); }
function rulerById(id) { for (var i = 0; i < CONFIG.RULERS.length; i++) if (CONFIG.RULERS[i].id === id) return CONFIG.RULERS[i]; return null; }
function sameSet(a, b) { if (a.length !== b.length) return false; for (var i = 0; i < a.length; i++) if (b.indexOf(a[i]) < 0) return false; return true; }
function minus(a, b) { return a.filter(function (x) { return b.indexOf(x) < 0; }); }
function inCastOrder(ids) { return allIds().filter(function (id) { return ids.indexOf(id) >= 0; }); }
function listPhrases(ids) {
  var ps = inCastOrder(ids).map(function (id) { return castById(id).phrase; });
  if (ps.length === 0) return 'nobody';
  if (ps.length === 1) return ps[0];
  return ps.slice(0, -1).join(', ') + ' and ' + ps[ps.length - 1];
}
// The cast sorted by a ruler, highest first; the cast's own order breaks ties.
function sortBy(rulerId) {
  var rows = CONFIG.CAST.map(function (b, i) { return { id: b.id, label: b.label, sub: b.sub, phrase: b.phrase, human: b.human, r: b[rulerId], i: i }; });
  rows.sort(function (a, b) { return b.r - a.r || a.i - b.i; });
  for (var k = 0; k < rows.length; k++) { rows[k].tieAbove = k > 0 && rows[k - 1].r === rows[k].r; rows[k].tieBelow = k < rows.length - 1 && rows[k + 1].r === rows[k].r; }
  return rows;
}

// ---------- Board one: is the player's set a line on a ruler? ----------
// A set is a line on R when every being in it reads strictly higher on R than every being out of it (a tie across the line is no line).
// If it is not, the clash is the lowest one in and the highest one out: on R they are the wrong way round.
function testLine(set, rulerId) {
  var rows = sortBy(rulerId), lowIn = null, highOut = null;
  rows.forEach(function (x) {
    var inside = set.indexOf(x.id) >= 0;
    if (inside && (lowIn === null || x.r < lowIn.r)) lowIn = x;
    if (!inside && (highOut === null || x.r > highOut.r)) highOut = x;
  });
  if (lowIn === null || highOut === null) return { ruler: rulerId, line: true, k: set.length, clash: null, empty: lowIn === null, full: highOut === null };
  if (lowIn.r > highOut.r) { var k = 0; rows.forEach(function (x) { if (x.r > highOut.r) k++; }); return { ruler: rulerId, line: true, k: k, clash: null }; }
  return { ruler: rulerId, line: false, k: null, clash: [lowIn.id, highOut.id], tie: lowIn.r === highOut.r };
}
function linesOn(set) { return CONFIG.RULERS.map(function (r) { return testLine(set, r.id); }).filter(function (t) { return t.line; }).map(function (t) { return t.ruler; }); }
// What a reveal says after the player taps a ruler.
function revealWords(set, rulerId) {
  var t = testLine(set, rulerId), r = rulerById(rulerId);
  if (t.line) {
    if (t.empty) return r.label + ' draws your line: nobody reads high enough.';
    if (t.full) return r.label + ' draws your line: everyone reads high enough, even the stone, which reads nothing.';
    return r.label + ' draws your line. Everyone you put in reads higher than everyone you left out.';
  }
  var a = castById(t.clash[0]), b = castById(t.clash[1]);
  if (t.tie) return 'On ' + r.label + ', ' + a.phrase + ' is in and ' + b.phrase + ' is out, and they read the same. No line on ' + r.label + ' can part them.';
  return 'On ' + r.label + ', ' + a.phrase + ' is in with ' + a[rulerId] + ', and ' + b.phrase + ' is out with ' + b[rulerId] + '. They are the wrong way round. No line on ' + r.label + ' does that.';
}

// ---------- The shape of the set ----------
// Eight shapes. Each has a name, who drew it, and what Singer says. 'own' carries the nearest named line and what was added or dropped.
function shapeOf(set) {
  var H = humans(), F = feelers(), A = allIds(), L = linesOn(set);
  var added = minus(set, H), dropped = minus(H, set);
  if (set.length === 0) return { id: 'nothing', lines: L };
  if (sameSet(set, H)) return { id: 'species', lines: L };
  if (sameSet(set, F)) return { id: 'singer', lines: L };
  if (sameSet(set, A)) return { id: 'everything', lines: L };
  var readL = L.filter(function (x) { return x !== 'suffer'; });
  if (readL.length) return { id: 'line', lines: readL, out: minus(F, set), inAnimals: added.filter(function (x) { return x !== CONFIG.THING; }) };
  if (dropped.length === 0 && added.indexOf(CONFIG.THING) < 0) return { id: 'species-plus', lines: L, added: added };
  if (added.length === 0) return { id: 'species-minus', lines: L, dropped: dropped };
  var dS = added.length + dropped.length, dF = minus(set, F).length + minus(F, set).length;
  return { id: 'own', lines: L, nearest: dF < dS ? 'singer' : 'species', added: dF < dS ? minus(set, F) : added, dropped: dF < dS ? minus(F, set) : dropped };
}
function shapeWords(set) {
  var s = shapeOf(set), w = {};
  if (s.id === 'species') {
    w.name = 'Species'; w.headline = 'No ruler drew your line.';
    w.who = 'You put in the four people and nobody else. No ruler draws that line: on every ruler you could read, an animal reads higher than a person you kept in, and on Suffer they all read the same. The line has a name. It is the one most people draw without thinking: Species.';
    w.singer = '';
  } else if (s.id === 'singer') {
    w.name = 'Singer\'s line'; w.headline = 'Suffer drew your line.';
    w.who = 'You put in everyone but the stone. One ruler draws exactly that line: Suffer, which reads the same for all nine and nothing for the stone.' + (s.lines.length === 1 ? ' No other ruler does: on Reason, Talk and Aware the grown-up whose brain is hurt reads none, like the stone, so no line on them can part the two.' : '');
    w.singer = 'That is Singer\'s line. He says it is the only line that is not drawn by hand: whoever can feel pain has something to lose, so whoever can feel pain counts, and their pain counts as much as anyone\'s. Most people draw a different line, the four people. It is dashed below; keep it in mind for the next board.';
  } else if (s.id === 'everything') {
    w.name = 'Everything'; w.headline = 'Everyone in, the stone too.';
    w.who = 'You put in all ten, the stone as well. Every ruler draws that line, because it is no line at all: nobody is out.';
    w.singer = 'Singer would ask about the stone. A stone cannot feel pain, so nothing you do to it is good or bad for the stone. It has nothing to lose. He puts his line one step above yours: everyone who can feel pain, which is all of them but the stone. It is dashed below, with the line most people draw.';
  } else if (s.id === 'nothing') {
    w.name = 'Nobody'; w.headline = 'Nobody in.';
    w.who = 'You put nobody in. Every ruler draws that line, because it is no line at all.';
    w.singer = 'Singer would ask whether you count. If you do, the question is why, and the four rulers are the answers people give. His own: because you can feel pain. And so can nine of the ten. His line is dashed below, with the line most people draw.';
  } else if (s.id === 'line') {
    var labs = s.lines.map(function (id) { return rulerById(id).label; });
    w.name = 'A ' + labs[0] + ' line'; w.headline = labs.join(' and ') + ' drew your line.';
    w.who = (labs.length === 1 ? labs[0] + ' draws your line' : labs.join(' and ') + ' both draw your line') + ': everyone you put in reads higher than everyone you left out.' + (s.out.length ? ' It keeps out ' + listPhrases(s.out) + '.' : '') + (s.inAnimals.length ? ' It lets in ' + listPhrases(s.inAnimals) + '.' : '');
    w.singer = 'Singer says a line like that is straight, but it is in the wrong place. ' + (s.out.length ? listPhrases(s.out).charAt(0).toUpperCase() + listPhrases(s.out).slice(1) + (s.out.length === 1 ? ' reads' : ' read') + ' low on ' + labs[0] + ' but ' + (s.out.length === 1 ? 'feels' : 'feel') + ' pain exactly as much as the grown-up. ' : '') + 'Picking ' + labs[0] + ' to decide who counts is, he says, like picking skin colour: a mark that has nothing to do with being hurt. His line is one ruler over: everyone who can feel pain. It is dashed below, with the line most people draw.';
  } else if (s.id === 'species-plus') {
    w.name = 'Species, with favourites'; w.headline = 'No ruler drew your line.';
    w.who = 'You put in the four people, and ' + listPhrases(s.added) + '. No ruler draws that line: ' + clashSentence(set) + ' The line is the one most people draw, Species, with ' + (s.added.length === 1 ? 'one favourite' : s.added.length + ' favourites') + ' let in.';
    w.singer = 'Singer would ask what ' + listPhrases(s.added) + (s.added.length === 1 ? ' has' : ' have') + ' that the ones you left out do not. Not a higher mark on any ruler. What ' + (s.added.length === 1 ? 'it has' : 'they have') + ' is that you know ' + (s.added.length === 1 ? 'it' : 'them') + '. That is a fact about you, not about ' + (s.added.length === 1 ? 'it' : 'them') + '. His line is dashed below: everyone who can feel pain.';
  } else if (s.id === 'species-minus') {
    w.name = 'Species, with exceptions'; w.headline = 'No ruler drew your line.';
    w.who = 'You put in ' + listPhrases(set) + ' and left out ' + listPhrases(s.dropped) + ', and every animal. No ruler draws that line: ' + clashSentence(set) + ' It is the line most people draw, Species, with ' + (s.dropped.length === 1 ? 'one person' : s.dropped.length + ' people') + ' cut out.';
    w.singer = 'Singer would ask why ' + listPhrases(s.dropped) + (s.dropped.length === 1 ? ' is' : ' are') + ' out. Not because of a mark: on Suffer ' + (s.dropped.length === 1 ? 'it reads' : 'they read') + ' the same as everyone you kept in, and the animals you left out read higher on Reason and Aware. The line is still the team, with a cut no ruler makes. His line is dashed below: everyone who can feel pain.';
  } else {
    var near = s.nearest === 'singer' ? 'Singer\'s line, everyone who can feel pain' : 'the line most people draw, the four people';
    w.name = 'Your own line'; w.headline = 'No ruler drew your line.';
    w.who = 'You put in ' + listPhrases(set) + '. No ruler draws that line: ' + clashSentence(set) + ' It is nearest to ' + near + (s.added.length ? ', with ' + listPhrases(s.added) + ' added' : '') + (s.dropped.length ? (s.added.length ? ' and ' : ', with ') + listPhrases(s.dropped) + ' dropped' : '') + '.';
    w.singer = 'Singer would ask what the ones you put in share that the ones you left out do not. No ruler says. His own answer is one ruler, Suffer, and it draws the dashed line below: everyone who can feel pain. The other dashed line is the one most people draw.';
  }
  w.shape = s;
  return w;
}
// One sentence giving the clash on the first reading ruler that fails, plus Suffer's word.
function clashSentence(set) {
  var parts = [];
  CONFIG.RULERS.forEach(function (r) {
    if (r.id === 'suffer' || parts.length) return;
    var t = testLine(set, r.id); if (t.line) return;
    var a = castById(t.clash[0]), b = castById(t.clash[1]);
    parts.push('on ' + r.label + ', ' + a.phrase + ' is in with ' + a[r.id] + ' and ' + b.phrase + ' is out with ' + b[r.id] + ', the wrong way round');
  });
  var ts = testLine(set, 'suffer');
  if (!ts.line) parts.push('on Suffer they all read the same, so Suffer draws no line between them');
  return parts.join('; ') + '.';
}

// ---------- Board two: the scientist ----------
// path: { pick: subjectId | 'nobody', why: 'human'|'grow'|'less'|'none'|'out'|null, braindam: 'yes'|'no'|null }; set: the player's line
function whyOptions(set) { var o = CONFIG.EXPERIMENT.whyOptions.slice(); if (set && set.indexOf('infant') < 0) o.unshift(CONFIG.EXPERIMENT.outOption); return o; }
function nextQuestion(path, set) {
  if (!path.pick) return { id: 'pick', text: CONFIG.EXPERIMENT.many + ' Who?' };
  if (path.pick === 'nobody' || castById(path.pick).human) return null;
  if (!path.why) return { id: 'why', text: 'Why not the baby?', options: whyOptions(set) };
  if (path.why !== 'grow') return null;
  if (!path.braindam) return { id: 'braindam', text: 'The grown-up whose brain is badly hurt will not grow into more than the chimpanzee. Would you use him?', options: [{ id: 'yes', text: 'Yes' }, { id: 'no', text: 'No' }] };
  return null;
}
function judgeExperiment(path, set) {
  var who = path.pick === 'nobody' ? null : castById(path.pick);
  set = set || [];
  if (path.pick === 'nobody') return { status: 'refuse', said: 'You did no experiment.',
    paper: 'Singer asks the scientist one thing only: give the same answer for the baby and for the animal. You did. Neither. He adds that the experiment that saves many lives is a story told to make the point, and that nearly all real experiments on animals would never be done on a baby.' };
  if (who.human) return { status: 'read', said: 'You used ' + who.phrase + '.',
    paper: (set.indexOf(who.id) >= 0 ? 'On your line ' + who.phrase + ' counts, and you used ' + (who.id === 'infant' ? 'the baby' : 'him') + ' anyway. ' : '') + 'Singer says: whatever you would do to the chimpanzee or the mouse, you must be ready to do to a baby who knows as little and feels as much. You were. He has no quarrel with your ruler. His quarrel is with the experiment itself, which he says almost nobody would do once they had answered this way.' };
  if (path.why === 'out') return { status: 'read', said: 'You used ' + who.phrase + ', and the baby is out on your line too.',
    paper: 'Then you are consistent: your line kept the baby out, and you used what your line keeps out. Singer has no quarrel with that as a line. He has one with where it runs: the baby feels the experiment exactly as much as ' + who.phrase + ' does, and as much as you would.' };
  if (path.why === 'none') return { status: 'read', said: 'You used ' + who.phrase + ', and the baby would have done as well.',
    paper: 'Then your ruler is one you can read. Singer has no quarrel with it. His quarrel is with the experiment: he says that once the baby would have done as well, almost nobody still wants to do it to the chimpanzee or the mouse either.' };
  if (path.why === 'human') return { status: 'species', said: 'You used ' + who.phrase + ', not the baby, because the baby is one of us.',
    paper: 'On every ruler you could read, ' + who.phrase + ' was above the baby: it knows more about what is happening to it, and it feels pain just as much. The only thing that put the baby out of reach is the team it is on. Singer\'s name for that is Species, and he says it is the same pattern as the racist\'s.' };
  if (path.why === 'less') return { status: 'species', said: 'You used ' + who.phrase + ', not the baby, because the chimpanzee matters less.',
    paper: 'Matters less measured how? Go back to the rulers: on Reason, Talk and Aware ' + who.phrase + ' was above the baby, and on Suffer they were level. No ruler says it matters less. What says so is the team it is on, and Singer says that is the same pattern as the racist\'s.' };
  if (path.braindam === 'yes') return { status: 'potential', said: 'You used ' + who.phrase + ', not the baby, because the baby will grow. You would use the grown-up whose brain is badly hurt.',
    paper: 'Then "what it will grow into" is your ruler, and it is one you can read. Singer lets it stand and tells you what it costs: on that ruler an unborn child has the same claim as the baby, and that is a line many people do not want to draw. And he points out that this ruler gives you no reason to prefer ' + who.phrase + ' over the grown-up whose brain is hurt, who will not grow either; you gave none.' };
  return { status: 'species', said: 'You used ' + who.phrase + ', not the baby, because the baby will grow. You would not use the grown-up whose brain is badly hurt, who will not.',
    paper: 'So "what it will grow into" was not your ruler after all: it would have let you use the grown-up whose brain is hurt, and you would not. On every ruler you could read, ' + who.phrase + ' was above him. What is left is the team he is on, and Singer says that is the same pattern as the racist\'s.' };
}

function lc(name) { return name.indexOf('Singer') === 0 ? name : name.charAt(0).toLowerCase() + name.slice(1); }

// ---------- The five lines: who moved you, when ----------
// lines: [set0, set1, set2, set3, set4], set i for i >= 1 drawn with CONFIG.RULERS[i-1] on the board.
function moves(lines) {
  var out = [];
  for (var i = 1; i < lines.length; i++) {
    var prev = lines[i - 1], cur = lines[i];
    out.push({ ruler: CONFIG.RULERS[i - 1].id, added: inCastOrder(minus(cur, prev)), dropped: inCastOrder(minus(prev, cur)) });
  }
  return out;
}
// The kind of player: unmoved (the same line five times), ruler-led (on every ruler round the line is a line on that ruler, and at least one move),
// or mixed. Plus the words for the trajectory.
function synthesis(lines) {
  var mv = moves(lines), movedRounds = mv.filter(function (x) { return x.added.length || x.dropped.length; });
  var onRuler = mv.map(function (x, i) { return testLine(lines[i + 1], x.ruler).line; });
  var kind = movedRounds.length === 0 ? 'unmoved' : (onRuler.every(Boolean) ? 'ruler-led' : 'mixed');
  var first = shapeWords(lines[0]), last = shapeWords(lines[lines.length - 1]);
  var tr = [];
  mv.forEach(function (x) {
    var lab = rulerById(x.ruler).label;
    if (!x.added.length && !x.dropped.length) tr.push(lab + ' did not move you.');
    else tr.push(lab + ' moved you: ' + (x.added.length ? 'you let in ' + listPhrases(x.added) : '') + (x.added.length && x.dropped.length ? ' and ' : '') + (x.dropped.length ? 'you put out ' + listPhrases(x.dropped) : '') + '.');
  });
  var head, text;
  if (kind === 'unmoved') {
    head = 'No ruler moved you.';
    var L = last.shape.lines, labs = L.map(function (id) { return rulerById(id).label; }), others = CONFIG.RULERS.filter(function (r) { return L.indexOf(r.id) < 0; }).map(function (r) { return r.label; });
    text = 'Four rulers, and your line never changed: ' + listPhrases(lines[0]) + (lines[0].length ? ' in' : '') + ', every time. ' +
      (last.shape.id === 'species' ? 'Four times a ruler put an animal above a person you kept in, and you kept the line where it was. That is a line drawn by hand, and it has a name.'
      : last.shape.id === 'singer' ? 'Three rulers could not draw it and that did not move you; the fourth could. You had Singer\'s line from the start.'
      : last.shape.id === 'everything' || last.shape.id === 'nothing' ? 'Every ruler draws it, because it is no line at all.'
      : L.length ? labs.join(' and ') + ' could draw it; ' + others.join(', ') + ' could not, and that did not move you.'
      : 'No ruler could draw it, and that did not move you.');
  } else if (kind === 'ruler-led') {
    head = 'The rulers drew your line.';
    text = 'On every ruler your line was that ruler\'s line: everyone in above everyone out. Four rulers, ' + (new Set(lines.slice(1).map(function (l) { return l.slice().sort().join(); })).size) + ' different lines. You ended on Suffer\'s, ' + (last.shape.id === 'singer' ? 'which is Singer\'s.' : 'but not where Singer puts it: ' + lc(last.name) + '.');
  } else {
    head = 'Some rulers moved you.';
    text = tr.join(' ') + ' You ended with ' + listPhrases(lines[lines.length - 1]) + (lines[lines.length - 1].length ? ' in' : '') + ': ' + lc(last.name) + '.';
  }
  return { kind: kind, moves: mv, trajectory: tr, head: head, text: text, first: first, last: last, movedRounds: movedRounds.length };
}

// ---------- The verdict ----------
// state: { lines: [five sets], path }
function verdict(state) {
  var lines = state.lines || [state.set || []], set = lines[lines.length - 1], w = shapeWords(set), s = w.shape, syn = synthesis(lines);
  var paper = [
    'No ruler you can read draws a line between people and animals. The line most people draw is drawn by hand, and the team you are on is not a ruler.',
    'One ruler reads the same for all of them but the stone: Suffer. That is where Singer puts the line. If it can feel pain, it counts, and its pain counts as much as anyone\'s.'
  ];
  var found = ['Your first line, with no ruler: ' + listPhrases(lines[0]) + (lines[0].length ? ' in' : '') + ' (' + syn.first.name + ').'];
  found = found.concat(syn.trajectory);
  found.push('Your last line, on Suffer: ' + listPhrases(set) + (set.length ? ' in' : '') + '. ' + w.headline + ' Its name: ' + w.name + '.');
  var j = state.path && state.path.pick ? judgeExperiment(state.path, set) : null;
  var did = j ? [j.said, j.paper] : ['You did not reach the experiment.'];
  var two = 'Singer names two things that do not survive his line: doing experiments on animals that nobody would do on a baby, and eating animals because they taste good. He says the first would shrink to almost nothing, and the second should stop.';
  var fate, part, stood;
  if (s.id === 'singer') {
    fate = syn.kind === 'unmoved' ? 'You drew Singer\'s line, and kept it.' : 'You ended on Singer\'s line.';
    part = [j && j.status === 'species' ? 'Only at the experiment: your line let the baby and ' + castById(state.path.pick).phrase + ' both count, and then you treated them differently. Singer would say the line was right and the scientist forgot it.' : (syn.kind === 'unmoved' ? 'Nowhere. Your line was his from the start, and you kept to it as the scientist.' : 'Nowhere, by the end. ' + syn.text)];
    stood = [two];
  } else if (s.id === 'species' || s.id === 'species-plus' || s.id === 'species-minus') {
    fate = syn.kind === 'unmoved' ? 'No ruler moved you. Your hand drew the line.' : 'You ended with a line your hand drew.';
    part = ['At the line. ' + (syn.kind === 'unmoved' ? 'Four rulers showed you an animal above a person you kept in, and none of them moved you. ' : syn.text + ' ') + 'Singer\'s word for a line drawn on the team you are on is speciesism, and he says it is the same pattern as racism and sexism.' + (j && j.status === 'species' ? ' At the experiment you drew it again.' : (j && j.status !== 'species' ? ' At the experiment, though, you did not use it.' : ''))];
    stood = ['Singer has one more thing for you to do. Say out loud why the baby counts and the chimpanzee does not, then say it again with "white" where you said "human" or "person". He says what it sounds like the second time is the reason to give the line up.'];
  } else if (s.id === 'line') {
    fate = syn.kind === 'ruler-led' ? 'You let the rulers draw your line.' : 'You ended on a straight line in the wrong place.';
    part = ['At the ruler. Your last line is one a ruler can read, and Singer says it is as arbitrary as skin colour: the ones it keeps out are hurt exactly as much as the ones it keeps in. ' + (syn.kind === 'ruler-led' ? 'And a line that moves with every ruler is four lines, not one; Singer asks which of them is yours.' : syn.text)];
    stood = [two];
  } else if (s.id === 'everything') { fate = 'You let everything count, the stone too.'; part = ['One step. Singer stops at the stone, which cannot feel; you did not. ' + (syn.kind === 'unmoved' ? 'No ruler moved you, and none needed to.' : syn.text)]; stood = [two]; }
  else if (s.id === 'nothing') { fate = 'You let nobody count.'; part = ['Everywhere, and nowhere Singer can argue with: his argument starts from somebody counting. If you count, so does whoever can feel pain.']; stood = [two]; }
  else { fate = syn.kind === 'unmoved' ? 'You drew your own line, and kept it.' : 'You ended on your own line.'; part = ['At the line. No ruler draws yours, and no team does either. ' + syn.text + ' Singer would ask what the ones you put in share. If you can name it, it is a ruler, and the board can test it; if you cannot, it is a hand.']; stood = [two]; }
  if (j && j.status === 'potential') part.push('And at the experiment: you went by what they will grow into, which is a ruler you can read, and Singer tells you what it costs.');
  return { fate: fate, paper: paper, found: found, did: did, part: part, stood: stood, name: w.name, synthesis: syn };
}

if (typeof module !== 'undefined') module.exports = { CONFIG: CONFIG, castById: castById, humans: humans, feelers: feelers, allIds: allIds, rulerById: rulerById, sortBy: sortBy, sameSet: sameSet,
  testLine: testLine, linesOn: linesOn, revealWords: revealWords, shapeOf: shapeOf, shapeWords: shapeWords, clashSentence: clashSentence,
  whyOptions: whyOptions, nextQuestion: nextQuestion, judgeExperiment: judgeExperiment, verdict: verdict, listPhrases: listPhrases, moves: moves, synthesis: synthesis };
