// Draw a Line with Singer — the mechanism. The only copy: the HTML is generated from this file and embeds it verbatim.
// Runs unchanged in Node (calibration.js, loop.js) and in the browser (the game passes actions in and draws what comes back).
// Mechanism kind: TOY, built to illustrate the argument of Peter Singer, "All Animals Are Equal", Philosophic Exchange 5(1), 1974,
// pp. 103-116 (the journal's own text, SUNY open repository). Page numbers below are the journal's.
// Revision 7 (27 Nov 2026). Round 0: whose pain, if they were hurt exactly as much as you, would matter exactly as much (equal
// consideration, per unit of pain). Rounds 1-3: three candidate rules, Reason, Talk, Aware, each shown with the paper's marks; the
// board says whether the rule agrees with the player's line or objects, and which two beings it objects to; the player may move
// anyone or keep the line. Round 4, Suffer, unannounced: Bentham's question, "Can they suffer?", yes or no, asked only about the beings
// the player counts for less; the Suffer rule objects wherever the player says "yes, it can suffer" and still counts its pain for less.
// Then the last line is named by its shape and the five lines are synthesised; the scientist's experiment reads the last line.

var CONFIG = {
  // ---- The cast: ten beings, every one an example the paper uses. Readings are ORDINAL STYLISATIONS, 0-10: the ORDERINGS the
  // calibration checks are the paper's stated ones (PAPER_ORDERINGS); the LENGTHS are ours. `suffer` is Singer's answer to "can it suffer?".
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
  // The three candidate rules with marks, in the order they come to the board; Suffer is the fourth and is asked, not shown.
  RULES: [
    { id: 'reason', label: 'Reason', what: 'how well it can think things out',               rule: 'whoever can think well enough counts as much as you, and whoever cannot counts for less', verb: 'thinks' },
    { id: 'talk',   label: 'Talk',   what: 'whether it can talk, and how much',               rule: 'whoever can talk well enough counts as much as you, and whoever cannot counts for less', verb: 'talks' },
    { id: 'aware',  label: 'Aware',  what: 'how much it knows about what is happening to it',  rule: 'whoever knows enough about what is happening to it counts as much as you, and whoever does not counts for less', verb: 'knows' }
  ],
  SUFFER: { id: 'suffer', label: 'Suffer', what: 'whether it can suffer at all', rule: 'whoever can suffer counts as much as you, and only what cannot suffer counts for less' },
  MIRROR: ['Race', 'Sex'], // p. 116, the paper's own exercise: "change 'species' to 'race'. Now re-read"; p. 107: "The pattern is the same in each case"
  // ---- Board two: the paper's one thought experiment (p. 109-110), as a dialogue with the scientist.
  EXPERIMENT: {
    subjects: ['infant', 'braindam', 'chimp', 'mouse'],
    many: 'One experiment would save many lives. It needs one subject: someone it is done to, and it will hurt.',
    whyOptions: [ // {A} is the animal used
      { id: 'human', text: 'Because the baby is one of us, and {A} is not.' },
      { id: 'grow',  text: 'Because the baby will grow into more than {A} ever will.' },
      { id: 'less',  text: 'Because {A}\'s pain counts for less than the baby\'s.' },
      { id: 'none',  text: 'No reason. The baby would have done just as well.' }
    ],
    outOption: { id: 'out', text: 'Because on my line the baby\'s pain already counts for less.' } // offered only when the player's own line counts the baby for less
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
CONFIG.RULERS = CONFIG.RULES.concat([CONFIG.SUFFER]); // all four, for code that walks them in order

// ---------- helpers ----------
function castById(id) { for (var i = 0; i < CONFIG.CAST.length; i++) if (CONFIG.CAST[i].id === id) return CONFIG.CAST[i]; return null; }
function humans() { return CONFIG.CAST.filter(function (b) { return b.human; }).map(function (b) { return b.id; }); }
function feelers() { return CONFIG.CAST.filter(function (b) { return b.id !== CONFIG.THING; }).map(function (b) { return b.id; }); }
function allIds() { return CONFIG.CAST.map(function (b) { return b.id; }); }
function rulerById(id) { for (var i = 0; i < CONFIG.RULERS.length; i++) if (CONFIG.RULERS[i].id === id) return CONFIG.RULERS[i]; return null; }
function sameSet(a, b) { if (a.length !== b.length) return false; for (var i = 0; i < a.length; i++) if (b.indexOf(a[i]) < 0) return false; return true; }
function minus(a, b) { return a.filter(function (x) { return b.indexOf(x) < 0; }); }
function inCastOrder(ids) { return allIds().filter(function (id) { return ids.indexOf(id) >= 0; }); }
function cap(t) { return t.charAt(0).toUpperCase() + t.slice(1); }
function lc(name) { return name.indexOf('Singer') === 0 ? name : name.charAt(0).toLowerCase() + name.slice(1); }
function listPhrases(ids) {
  var ps = inCastOrder(ids).map(function (id) { return castById(id).phrase; });
  if (ps.length === 0) return 'nobody';
  if (ps.length === 1) return ps[0];
  return ps.slice(0, -1).join(', ') + ' and ' + ps[ps.length - 1];
}
// The cast sorted by a rule's marks, highest first; the cast's own order breaks ties.
function sortBy(ruleId) {
  var rows = CONFIG.CAST.map(function (b, i) { return { id: b.id, label: b.label, sub: b.sub, phrase: b.phrase, human: b.human, r: b[ruleId], i: i }; });
  rows.sort(function (a, b) { return b.r - a.r || a.i - b.i; });
  for (var k = 0; k < rows.length; k++) { rows[k].tieAbove = k > 0 && rows[k - 1].r === rows[k].r; rows[k].tieBelow = k < rows.length - 1 && rows[k + 1].r === rows[k].r; }
  return rows;
}

// ---------- Rounds 1-3: does the rule agree with the player's line, or object? ----------
// A rule agrees with a set when every being in the set (counted as much as you) has a higher mark than every being outside it
// (counted for less). A tie across the line is an objection too: the rule cannot tell the two apart, so it cannot put them on different sides.
// When the rule objects, the clash is the lowest-marked being in and the highest-marked being out: by the rule they are the wrong way round.
function testLine(set, ruleId) {
  var rows = sortBy(ruleId), lowIn = null, highOut = null;
  rows.forEach(function (x) {
    var inside = set.indexOf(x.id) >= 0;
    if (inside && (lowIn === null || x.r < lowIn.r)) lowIn = x;
    if (!inside && (highOut === null || x.r > highOut.r)) highOut = x;
  });
  if (lowIn === null || highOut === null) return { ruler: ruleId, line: true, k: set.length, clash: null, empty: lowIn === null, full: highOut === null };
  if (lowIn.r > highOut.r) { var k = 0; rows.forEach(function (x) { if (x.r > highOut.r) k++; }); return { ruler: ruleId, line: true, k: k, clash: null }; }
  return { ruler: ruleId, line: false, k: null, clash: [lowIn.id, highOut.id], tie: lowIn.r === highOut.r };
}
function linesOn(set) { return CONFIG.RULERS.map(function (r) { return testLine(set, r.id); }).filter(function (t) { return t.line; }).map(function (t) { return t.ruler; }); }
// What the board says when a rule with marks arrives, or after the player moves someone. Written out in full.
function revealWords(set, ruleId) {
  var t = testLine(set, ruleId), r = rulerById(ruleId);
  if (t.line) {
    if (t.empty) return r.label + ' agrees with your line, because your line counts nobody as much as you, and a rule can always do that: set the bar too high for anyone.';
    if (t.full) return r.label + ' agrees with your line, because your line counts everyone as much as you, the stone too, and a rule can always do that: set the bar so low that even a mark of none is enough.';
    return r.label + ' agrees with your line. Everyone you count as much as yourself ' + r.verb + ' better than everyone you count for less, so if ' + r.label + ' were your rule, it would draw exactly the line you drew. The red line shows where.';
  }
  var a = castById(t.clash[0]), b = castById(t.clash[1]);
  if (t.tie) return r.label + ' objects. ' + cap(a.phrase) + ' and ' + b.phrase + ' have the same mark on ' + r.label + ', ' + a[ruleId] + ' each, so ' + r.label + ' cannot tell them apart. But your line puts them on different sides: ' + a.phrase + ' counts as much as you, ' + b.phrase + ' counts for less. A rule that cannot tell two beings apart cannot put one on each side of a line. So ' + r.label + ' cannot be the rule behind your line.';
  return r.label + ' objects. By ' + r.label + ', ' + a.phrase + ' has a mark of ' + a[ruleId] + ' and ' + b.phrase + ' has a mark of ' + b[ruleId] + '. Your line counts ' + a.phrase + ' as much as you and ' + b.phrase + ' for less. That is the wrong way round: if ' + r.label + ' were your rule, ' + b.phrase + ', with the higher mark, would have to count at least as much as ' + a.phrase + '. The red circles are ' + r.label + '\'s complaints. So ' + r.label + ' cannot be the rule behind your line.';
}

// ---------- Round 4: Suffer, asked not shown ----------
// Who is asked: every being the player counts for less, except the stone. answers: { id: true | false } (true = yes, it can suffer).
function sufferAsked(set) { return feelers().filter(function (id) { return set.indexOf(id) < 0; }); }
// The Suffer rule's verdict: it objects to every being the player says can suffer and still counts for less. Also which "no" answers Singer disputes.
function sufferTest(set, answers) {
  answers = answers || {};
  var asked = sufferAsked(set), objections = [], disputed = [], unanswered = [];
  asked.forEach(function (id) {
    if (answers[id] === undefined) unanswered.push(id);
    else if (answers[id] === true) objections.push(id);
    else disputed.push(id); // the player says no; the paper says every one of the nine can suffer
  });
  return { asked: asked, objections: objections, disputed: disputed, unanswered: unanswered, complete: unanswered.length === 0, agrees: unanswered.length === 0 && objections.length === 0 };
}
function sufferWords(set, answers) {
  var t = sufferTest(set, answers);
  if (t.asked.length === 0) return 'There is nothing to ask. Your line counts everyone\'s pain as much as your own, except the stone\'s, and nobody thinks a stone can suffer. Suffer agrees with your line: whoever can suffer counts as much as you.';
  if (!t.complete) return '';
  var s = '';
  if (t.objections.length) s += 'Suffer objects. You say ' + listPhrases(t.objections) + ' can suffer. Your line counts ' + (t.objections.length === 1 ? 'its' : 'their') + ' pain for less than yours. The Suffer rule has no "less" in it: if a being can suffer, its pain weighs the same as anyone\'s, yours included. The red circles are Suffer\'s complaints, and this time they are built from your own two answers: it can suffer, and it counts for less.';
  else s += 'Suffer agrees with your line. Everyone you count for less, you say cannot suffer. If that were true, Suffer would draw exactly the line you drew.';
  if (t.disputed.length) s += ' ' + (t.objections.length ? 'And Singer' : 'But Singer') + ' disputes a fact: he says ' + listPhrases(t.disputed) + ' can suffer, at least as much as a baby a few days old can. The empty circles mark where you and he disagree about the fact.';
  return s;
}

// ---------- The shape of the set ----------
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
// The words on the naming screen. The player's line is the full dots; the two dashed lines on the board are labelled "most people" and "Singer".
function shapeWords(set) {
  var s = shapeOf(set), w = {};
  var dots = 'Your full dots are ' + listPhrases(set) + '.';
  if (s.id === 'species') {
    w.name = 'Species'; w.headline = 'No rule gives your line.';
    w.who = 'Your full dots are the four people, and nobody else. That is the line most people draw, and it is drawn in red. Three rules with marks objected to it: on every one of them an animal has a higher mark than a person you count as much as yourself. And Suffer objected too, or would have, because the animals can suffer. So no rule you can check gives this line. It has a name all the same. It is the line of the team you happen to be on: Species.';
    w.singer = '';
  } else if (s.id === 'singer') {
    w.name = 'Singer\'s line'; w.headline = 'Suffer gives your line.';
    w.who = 'Your full dots are everyone but the stone: every person and every animal counts as much as you, and the stone, which cannot suffer, counts for nothing. That is drawn in red. One rule gives exactly this line: Suffer. If a being can suffer, its pain counts as much as yours.' + (s.lines.length === 1 ? ' No other rule gives it: on Reason, Talk and Aware the grown-up whose brain is badly hurt has a mark of none, the same as the stone, so none of those rules can put him on one side and the stone on the other.' : '');
    w.singer = 'That is Singer\'s line. He says it is the only line that is not drawn by hand: pain is pain, whoever feels it. So whoever can suffer counts, and their pain counts as much as anyone\'s. Most people draw a different line, the four people only. It is the dashed line marked "most people". Keep it in mind for the next board.';
  } else if (s.id === 'everything') {
    w.name = 'Everything'; w.headline = 'Everyone counts, the stone too.';
    w.who = 'Your full dots are all ten, the stone as well. Every rule can give that line, because it is no line at all: nobody is left on the other side.';
    w.singer = 'Singer would ask about the stone. A stone cannot suffer, so nothing you do to it is good or bad for the stone; it has nothing to lose. He puts his line one step above yours: everyone who can suffer, which is all of them but the stone. It is the dashed line marked "Singer". The other dashed line, marked "most people", is the four people only.';
  } else if (s.id === 'nothing') {
    w.name = 'Nobody'; w.headline = 'Nobody counts as much as you.';
    w.who = 'You have no full dots: nobody\'s pain counts as much as your own. Every rule can give that line, because it is no line at all.';
    w.singer = 'Singer would ask whether your own pain counts. If it does, the question is why, and the three rules with marks are the answers people usually give. His own answer: because you can suffer. And so can nine of the ten. His line is the dashed one marked "Singer"; the other dashed line, marked "most people", is the four people only.';
  } else if (s.id === 'line') {
    var labs = s.lines.map(function (id) { return rulerById(id).label; });
    w.name = 'A ' + labs[0] + ' line'; w.headline = labs.join(' and ') + ' give' + (labs.length === 1 ? 's' : '') + ' your line.';
    w.who = dots + ' ' + (labs.length === 1 ? labs[0] + ' gives that line' : labs.join(' and ') + ' both give that line') + ': everyone with a full dot has a higher mark than everyone with an empty dot.' + (s.out.length ? ' It counts ' + listPhrases(s.out) + ' for less.' : '') + (s.inAnimals.length ? ' It counts ' + listPhrases(s.inAnimals) + ' as much as you.' : '') + ' A rule gives your line, so it is not drawn by hand. The question is whether it is the right rule.';
    w.singer = 'Singer says a line like that is straight, but in the wrong place. ' + (s.out.length ? cap(listPhrases(s.out)) + ' ' + (s.out.length === 1 ? 'has' : 'have') + ' a low mark on ' + labs[0] + ', but ' + (s.out.length === 1 ? 'feels' : 'feel') + ' pain exactly as much as the grown-up does. ' : '') + 'Picking ' + labs[0] + ' to decide whose pain counts is, he says, like picking skin colour: a mark that has nothing to do with being hurt. His line is the dashed one marked "Singer": everyone who can suffer. The other dashed line, marked "most people", is the four people only.';
  } else if (s.id === 'species-plus') {
    w.name = 'Species, with favourites'; w.headline = 'No rule gives your line.';
    w.who = 'Your full dots are the four people, and ' + listPhrases(s.added) + '. That is the line most people draw, the dashed one marked "most people", with ' + (s.added.length === 1 ? 'one favourite' : s.added.length + ' favourites') + ' added. No rule you can check gives it: ' + clashSentence(set);
    w.singer = 'Singer would ask what ' + listPhrases(s.added) + (s.added.length === 1 ? ' has' : ' have') + ' that the animals you count for less do not have. Not a higher mark on any rule. What ' + (s.added.length === 1 ? 'it has' : 'they have') + ' is that you know ' + (s.added.length === 1 ? 'it' : 'them') + '. That is a fact about you, not about ' + (s.added.length === 1 ? 'it' : 'them') + '. His line is the dashed one marked "Singer": everyone who can suffer.';
  } else if (s.id === 'species-minus') {
    w.name = 'Species, with exceptions'; w.headline = 'No rule gives your line.';
    w.who = dots + ' Those are people, and the other ' + (s.dropped.length === 1 ? 'person' : 'people') + ', ' + listPhrases(s.dropped) + ', ' + (s.dropped.length === 1 ? 'counts' : 'count') + ' for less, as every animal does. That is the line most people draw, the dashed one marked "most people", with ' + (s.dropped.length === 1 ? 'one person' : s.dropped.length + ' people') + ' cut out of it. No rule you can check gives it: ' + clashSentence(set);
    w.singer = 'Singer would ask why ' + listPhrases(s.dropped) + ' ' + (s.dropped.length === 1 ? 'counts' : 'count') + ' for less. Not because of a mark: ' + (s.dropped.length === 1 ? 'he' : 'they') + ' can suffer just as everyone you count in full can, and on Reason and Aware the chimpanzee has a higher mark and you count it for less too. So the line is still the team\'s line, with a cut in it that no rule makes either. His line is the dashed one marked "Singer": everyone who can suffer.';
  } else {
    var near = s.nearest === 'singer' ? 'Singer\'s line, the dashed one marked "Singer": everyone who can suffer' : 'the line most people draw, the dashed one marked "most people": the four people only';
    w.name = 'Your own line'; w.headline = 'No rule gives your line.';
    w.who = dots + ' No rule you can check gives that line: ' + clashSentence(set) + ' It is nearest to ' + near + (s.added.length ? ', with ' + listPhrases(s.added) + ' added' : '') + (s.dropped.length ? (s.added.length ? ' and ' : ', with ') + listPhrases(s.dropped) + ' taken out' : '') + '.';
    w.singer = 'Singer would ask what the beings with full dots have in common that the others do not. No rule with marks says. His own answer is one rule, Suffer: everyone who can suffer counts as much as you. That is the dashed line marked "Singer". The other dashed line, marked "most people", is the four people only.';
  }
  w.shape = s;
  return w;
}
// One sentence giving the clash on the first rule with marks that objects, plus what Suffer says.
function clashSentence(set) {
  var parts = [];
  CONFIG.RULES.forEach(function (r) {
    if (parts.length) return;
    var t = testLine(set, r.id); if (t.line) return;
    var a = castById(t.clash[0]), b = castById(t.clash[1]);
    parts.push('on ' + r.label + ', ' + a.phrase + ' has a mark of ' + a[r.id] + ' and counts as much as you, while ' + b.phrase + ' has a mark of ' + b[r.id] + ' and counts for less, which is the wrong way round');
  });
  var out = sufferAsked(set);
  if (out.length) parts.push('and ' + listPhrases(out) + ' can suffer, so Suffer would count ' + (out.length === 1 ? 'its' : 'their') + ' pain as much as yours');
  return cap(parts.join('; ')) + '.';
}

// ---------- The five lines: who moved you, when ----------
function moves(lines) {
  var out = [];
  for (var i = 1; i < lines.length; i++) {
    var prev = lines[i - 1], cur = lines[i];
    out.push({ ruler: CONFIG.RULERS[i - 1].id, added: inCastOrder(minus(cur, prev)), dropped: inCastOrder(minus(prev, cur)) });
  }
  return out;
}
function synthesis(lines, answers) {
  var mv = moves(lines), movedRounds = mv.filter(function (x) { return x.added.length || x.dropped.length; });
  var onRule = mv.map(function (x, i) { return testLine(lines[i + 1], x.ruler).line; });
  var kind = movedRounds.length === 0 ? 'unmoved' : (onRule.every(Boolean) ? 'rule-led' : 'mixed');
  var first = shapeWords(lines[0]), last = shapeWords(lines[lines.length - 1]);
  var tr = [];
  mv.forEach(function (x) {
    var lab = rulerById(x.ruler).label;
    if (!x.added.length && !x.dropped.length) tr.push(lab + ' did not move you.');
    else tr.push(lab + ' moved you: ' + (x.added.length ? listPhrases(x.added) + ' now ' + (x.added.length === 1 ? 'counts' : 'count') + ' as much as you' : '') + (x.added.length && x.dropped.length ? ', and ' : '') + (x.dropped.length ? listPhrases(x.dropped) + ' now ' + (x.dropped.length === 1 ? 'counts' : 'count') + ' for less' : '') + '.');
  });
  // the Suffer round, in the player's own two answers, judged on the line the player had when asked (lines[3]) and the line he ended with
  var st = sufferTest(lines[3] || lines[lines.length - 1], answers || {}), lastSet = lines[lines.length - 1];
  var stillOut = st.objections.filter(function (id) { return lastSet.indexOf(id) < 0; });
  var suf = '';
  if (st.asked.length === 0) suf = 'Suffer had nothing to ask you: your line already counted everyone who can suffer as much as yourself.';
  else if (st.objections.length === 0 && st.complete) suf = 'Asked whether the beings you count for less can suffer, you said no to every one: ' + listPhrases(st.asked) + '. By your own answers Suffer agreed with your line; Singer disagrees about the fact, and says all of them can suffer.';
  else if (stillOut.length) suf = 'You said ' + listPhrases(st.objections) + ' can suffer, and by the end you still counted ' + listPhrases(stillOut) + ' for less. Those are your own two answers, side by side.';
  else suf = 'You said ' + listPhrases(st.objections) + ' can suffer, and when Suffer objected you moved ' + (st.objections.length === 1 ? 'it' : 'them') + ' in.';
  var head, text;
  if (kind === 'unmoved') {
    var L = last.shape.lines, labs = L.map(function (id) { return rulerById(id).label; }), others = CONFIG.RULERS.filter(function (r) { return L.indexOf(r.id) < 0; }).map(function (r) { return r.label; });
    head = 'No rule moved you.';
    text = 'Four rules came to the board, and your line never changed: ' + listPhrases(lines[0]) + (lines[0].length ? ' counting as much as you' : '') + ', every time. ' +
      (last.shape.id === 'species' ? 'Three times a rule with marks put an animal above a person you count as much as yourself, and you kept the line where it was. Then Suffer asked, and you kept it again. That is a line drawn by hand, and it has a name.'
      : last.shape.id === 'singer' ? 'Reason, Talk and Aware all objected and that did not move you; Suffer had nothing to object to. You had Singer\'s line from the start.'
      : last.shape.id === 'everything' || last.shape.id === 'nothing' ? 'Every rule can give it, because it is no line at all.'
      : L.length ? labs.join(' and ') + ' could give it; ' + (others.length > 1 ? others.slice(0, -1).join(', ') + ' and ' + others[others.length - 1] : others[0]) + ' could not, and that did not move you.'
      : 'No rule could give it, and that did not move you.');
  } else if (kind === 'rule-led') {
    head = 'The rules drew your line.';
    text = 'Every time a rule came to the board, you moved your line to where that rule would draw it. ' + tr.filter(function (x) { return /moved you/.test(x); }).join(' ') + ' Four rules, ' + (new Set(lines.slice(1).map(function (l) { return l.slice().sort().join(); })).size) + ' different lines. You ended on Suffer\'s, ' + (last.shape.id === 'singer' ? 'which is Singer\'s.' : 'but not where Singer puts it: ' + lc(last.name) + '.');
  } else {
    head = 'Some rules moved you.';
    text = tr.join(' ') + ' You ended with ' + listPhrases(lastSet) + (lastSet.length ? ' counting as much as you' : '') + ': ' + lc(last.name) + '.';
  }
  return { kind: kind, moves: mv, trajectory: tr, head: head, text: text, first: first, last: last, movedRounds: movedRounds.length, suffer: suf, sufferTest: st };
}

// ---------- Board two: the scientist ----------
function whyOptions(set, pick) {
  var who = pick ? castById(pick).phrase : 'the animal';
  var o = CONFIG.EXPERIMENT.whyOptions.map(function (x) { return { id: x.id, text: x.text.replace(/\{A\}/g, who) }; });
  if (set && set.indexOf('infant') < 0) o.unshift(CONFIG.EXPERIMENT.outOption);
  return o;
}
function whyQuestion(path, set) {
  var who = castById(path.pick), inA = set && set.indexOf(who.id) >= 0, inB = set && set.indexOf('infant') >= 0;
  var pre = inA && inB ? 'On your last line ' + who.phrase + '\'s pain counts as much as the baby\'s, and as much as yours. ' : (!inA && inB ? 'On your last line the baby\'s pain counts as much as yours, and ' + who.phrase + '\'s counts for less. ' : (inA && !inB ? 'On your last line ' + who.phrase + '\'s pain counts as much as yours, and the baby\'s counts for less. ' : ''));
  return pre + 'Why ' + who.phrase + ', and not the baby?';
}
function nextQuestion(path, set) {
  if (!path.pick) return { id: 'pick', text: CONFIG.EXPERIMENT.many + ' Who?' };
  if (path.pick === 'nobody' || castById(path.pick).human) return null;
  if (!path.why) return { id: 'why', text: whyQuestion(path, set), options: whyOptions(set, path.pick) };
  if (path.why !== 'grow') return null;
  if (!path.braindam) return { id: 'braindam', text: 'The grown-up whose brain is badly hurt will never grow into more than ' + castById(path.pick).phrase + ' is now. Would you use him instead?', options: [{ id: 'yes', text: 'Yes' }, { id: 'no', text: 'No' }] };
  return null;
}
function judgeExperiment(path, set) {
  var who = path.pick === 'nobody' ? null : castById(path.pick);
  set = set || [];
  var real = ' He adds that the experiment that saves many lives is a story told to make the point. Real experiments on animals are almost never like that, and almost none of them would be done on a baby, which is the test he asks every experimenter to pass.';
  if (path.pick === 'nobody') return { status: 'refuse', said: 'You did no experiment, and the many were not saved.',
    paper: 'Singer asks the scientist one thing only: give the same answer for the baby and for the animal, whatever that answer is. You did: neither.' + real };
  if (who.human) return { status: 'read', said: 'You used ' + who.phrase + '.',
    paper: (set.indexOf(who.id) >= 0 ? 'On your last line ' + who.phrase + '\'s pain counts as much as yours, and you used ' + (who.id === 'infant' ? 'the baby' : 'him') + ' anyway: you spent pain you count in full, for the many lives. ' : 'On your last line ' + who.phrase + '\'s pain counts for less, and you spent it. ') + 'Singer says: whatever you would do to the chimpanzee or the mouse, you must be ready to do to a baby who knows as little and feels as much. You were. He has no quarrel with your rule. His quarrel is with the experiment itself.' + real };
  if (path.why === 'out') return { status: 'read', said: 'You used ' + who.phrase + ', because on your line the baby\'s pain already counts for less.',
    paper: 'Then you are consistent: your line counts the baby\'s pain for less, and you spent what your line counts for less. Singer has no quarrel with that as a line. He has one with where it runs: the baby feels the experiment exactly as much as ' + who.phrase + ' does, and exactly as much as you would.' + real };
  if (path.why === 'none') return { status: 'read', said: 'You used ' + who.phrase + ', and the baby would have done just as well.',
    paper: 'Then whatever your rule is, it is one you can check, because it treats the baby and ' + who.phrase + ' alike. Singer has no quarrel with that. His quarrel is with the experiment: he says that once the baby would have done just as well, almost nobody still wants to do it to ' + who.phrase + ' either.' + real };
  if (path.why === 'human') return { status: 'species', said: 'You used ' + who.phrase + ', not the baby, because the baby is one of us and ' + who.phrase + ' is not.',
    paper: 'On every rule with marks, ' + who.phrase + ' was above the baby: it knows more about what is happening to it, and it can suffer just as the baby can. The only thing that put the baby out of reach is the team it is on. Singer\'s name for that is Species, the word the sponge wiped off the board, and he says it is the same pattern as the racist\'s.' + (set.indexOf(who.id) >= 0 ? ' And on your own last line ' + who.phrase + '\'s pain counted as much as yours.' : '') };
  if (path.why === 'less') return { status: 'species', said: 'You used ' + who.phrase + ', not the baby, because ' + who.phrase + '\'s pain counts for less.',
    paper: 'Counts for less by which rule? Go back to the board: on Reason, Talk and Aware ' + who.phrase + ' was above the baby, and both of them can suffer. No rule says ' + who.phrase + '\'s pain counts for less. What says so is the team it is on, and Singer says that is the same pattern as the racist\'s.' + (set.indexOf(who.id) >= 0 ? ' And on your own last line ' + who.phrase + '\'s pain counted as much as yours.' : '') };
  if (path.braindam === 'yes') return { status: 'potential', said: 'You used ' + who.phrase + ', not the baby, because the baby will grow into more. You would have used the grown-up whose brain is badly hurt instead.',
    paper: 'Then "what it will grow into" is your rule, and it is one you can check. Singer lets it stand and tells you what it costs: on that rule an unborn child has the same claim as the baby, and that is a line many people do not want to draw. He also points out that this rule gives you no reason to prefer ' + who.phrase + ' over the grown-up whose brain is badly hurt, who will not grow either; and you gave none.' };
  return { status: 'species', said: 'You used ' + who.phrase + ', not the baby, because the baby will grow into more. You would not have used the grown-up whose brain is badly hurt, who will not.',
    paper: 'So "what it will grow into" was not your rule after all: it would have let you use the grown-up whose brain is badly hurt, and you would not. On every rule with marks ' + who.phrase + ' was above him, and both can suffer. What is left is the team he is on, and Singer says that is the same pattern as the racist\'s.' };
}

// ---------- The verdict ----------
// state: { lines: [five sets], answers: { id: true|false }, path }
function verdict(state) {
  var lines = state.lines || [state.set || []], set = lines[lines.length - 1], w = shapeWords(set), s = w.shape, syn = synthesis(lines, state.answers);
  var paper = [
    'Whose pain counts as much as yours? Singer\'s answer: everyone\'s who can suffer. Not because they are like you in any other way, but because pain is pain, whoever feels it.',
    'No rule you can check gives the line most people draw, the four people only. Reason, Talk and Aware all object to it, and Suffer objects to it too, because the animals can suffer. That line is drawn by hand. The team you are on is not a rule.'
  ];
  var found = ['Your first line, with no rule on the board: ' + listPhrases(lines[0]) + (lines[0].length ? ' counting as much as you' : '') + ' (' + syn.first.name + ').'];
  found = found.concat(syn.trajectory.slice(0, 3));
  found.push('Suffer: ' + syn.suffer + (syn.trajectory[3] ? ' ' + syn.trajectory[3] : ''));
  found.push('Your last line: ' + listPhrases(set) + (set.length ? ' counting as much as you' : '') + '. ' + w.headline + ' Its name: ' + w.name + '.');
  var j = state.path && state.path.pick ? judgeExperiment(state.path, set) : null;
  var did = j ? [j.said, j.paper] : ['You did not reach the experiment.'];
  var two = 'Singer names two things that do not survive his line. Experiments on animals that nobody would do on a baby: he says almost none would be left. And eating animals because they taste good: he says that should stop, since the pleasure of the taste is small and the pain behind it is not.';
  // where you part: the line first, then the experiment, always
  var atLine, atExp, fate;
  if (s.id === 'singer') { fate = syn.kind === 'unmoved' ? 'You drew Singer\'s line, and kept it.' : 'You ended on Singer\'s line.'; atLine = 'At the line: nowhere. Your last line is his.' + (syn.kind === 'unmoved' ? '' : ' ' + syn.text); }
  else if (s.id === 'species' || s.id === 'species-plus' || s.id === 'species-minus') {
    fate = syn.kind === 'unmoved' ? 'No rule moved you. Your hand drew the line.' : 'You ended with a line your hand drew.';
    atLine = 'At the line. ' + (syn.kind === 'unmoved' ? 'Three rules with marks showed you an animal above a person you count as much as yourself, and Suffer asked you whether the animals can suffer; none of it moved you. ' : syn.text + ' ') + 'Singer\'s word for counting pain by the team it belongs to is speciesism, and he says it is the same pattern as racism and sexism.';
  }
  else if (s.id === 'line') { fate = syn.kind === 'rule-led' ? 'You let the rules draw your line.' : 'You ended on a straight line in the wrong place.'; atLine = 'At the line. Yours is one a rule can give, so it is not drawn by hand; but Singer says the rule is the wrong one, as arbitrary as skin colour: the ones it counts for less can suffer exactly as the ones it counts in full can. ' + (syn.kind === 'rule-led' ? 'And a line that moves with every rule is four lines, not one; Singer would ask which of them is yours.' : syn.text); }
  else if (s.id === 'everything') { fate = 'You counted everything, the stone too.'; atLine = 'At the line: one step. Singer stops at the stone, which cannot suffer; you did not. ' + (syn.kind === 'unmoved' ? 'No rule moved you, and none needed to.' : syn.text); }
  else if (s.id === 'nothing') { fate = 'You counted nobody\'s pain as much as your own.'; atLine = 'At the line: everywhere, and nowhere Singer can argue with, because his argument starts from somebody\'s pain counting. If yours does, so does the pain of whoever can feel it.'; }
  else { fate = syn.kind === 'unmoved' ? 'You drew your own line, and kept it.' : 'You ended on your own line.'; atLine = 'At the line. No rule gives yours, and no team does either. ' + syn.text + ' Singer would ask what the beings you count as much as yourself have in common. If you can name it, it is a rule, and the board can test it; if you cannot, it is a hand.'; }
  if (!j) atExp = 'At the experiment: not reached.';
  else if (j.status === 'refuse') atExp = 'At the experiment: nowhere. You spent nobody\'s pain, and you gave the same answer for the baby and the animal.';
  else if (j.status === 'species') atExp = 'At the experiment: you drew the team\'s line again. You spent ' + castById(state.path.pick).phrase + '\'s pain and kept the baby\'s, and the only difference between them you could name was the team.';
  else if (j.status === 'potential') atExp = 'At the experiment: you went by what they will grow into, which is a rule you can check, and Singer tells you what it costs.';
  else atExp = 'At the experiment: you spent ' + castById(state.path.pick).phrase + '\'s pain' + (set.indexOf(state.path.pick) >= 0 ? ', which your own line counts as much as yours' : ', which your line counts for less') + ', and you would have spent the baby\'s the same way. Singer does not say you were wrong to, in a story where many lives are saved; he says real experiments are not that story, and that your own test, the baby\'s, would stop nearly all of them.';
  var part = [atLine, atExp];
  var stood = s.id === 'species' || s.id === 'species-plus' || s.id === 'species-minus' || (j && j.status === 'species')
    ? ['Singer has one more thing for you to do. Say out loud why the baby\'s pain counts in full and the chimpanzee\'s for less. Then say it again, with "white" where you said "human" or "person" and "black" where you said "animal". He says what it sounds like the second time is the reason to give the line up.', two]
    : [two];
  return { fate: fate, paper: paper, found: found, did: did, part: part, stood: stood, name: w.name, synthesis: syn };
}

if (typeof module !== 'undefined') module.exports = { CONFIG: CONFIG, castById: castById, humans: humans, feelers: feelers, allIds: allIds, rulerById: rulerById, sortBy: sortBy, sameSet: sameSet,
  testLine: testLine, linesOn: linesOn, revealWords: revealWords, sufferAsked: sufferAsked, sufferTest: sufferTest, sufferWords: sufferWords, shapeOf: shapeOf, shapeWords: shapeWords, clashSentence: clashSentence,
  whyOptions: whyOptions, whyQuestion: whyQuestion, nextQuestion: nextQuestion, judgeExperiment: judgeExperiment, verdict: verdict, listPhrases: listPhrases, moves: moves, synthesis: synthesis };
