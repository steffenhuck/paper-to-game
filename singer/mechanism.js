// Draw a Line with Singer — the mechanism. The only copy: the HTML is generated from this file and embeds it verbatim.
// Runs unchanged in Node (calibration.js, loop.js) and in the browser (the game passes actions in and draws what comes back).
// Mechanism kind: TOY, built to illustrate the argument of Peter Singer, "All Animals Are Equal", Philosophic Exchange 5(1), 1974,
// pp. 103-116 (the journal's own text, SUNY open repository). Page numbers below are the journal's.
// Revision 12 (28 Nov 2026): Suffer is the fourth rule, with equal marks, played like the other three (no yes/no); the mirror is cut; the
// verdict draws the player's line and Singer's. Revision 11 (28 Nov 2026): each experiment checked on its own (a rule complains about a column where a tick sits above a cross), and
// the player taps the experiments he expects the rule to complain about. Revision 10 (27 Nov 2026): the stone off the menus (it appears once, at the Suffer question, as the boundary); on each rule screen the player
// taps the creature he expects the rule to complain about before the reveal. Revision 9 (same day): three menus and a rationalisability test. The player is the scientist first. Three experiments of rising stakes, each needing one
// subject who will be hurt; four subjects on offer (the paper's own: the orphaned baby, the brain-damaged grown-up, the chimpanzee,
// the mouse); the player ticks everyone he would be willing to use. From the ticks the game reads, for each subject, the lowest stakes
// at which the player would use it: that is the player's line, revealed by what he did. Then three rules with marks (Reason, Talk,
// Aware) each say whether they could have given that order of use, and if not, which two subjects are the wrong way round. Then
// Bentham's question, "can they suffer?", for the four, and the Suffer rule objects to any difference among those the player says
// can suffer. Then the line is named, the sponge writes Race and Sex over the team's name, and the verdict is about what the player did.

var CONFIG = {
  // ---- The cast. Readings are ORDINAL STYLISATIONS, 0-10: the ORDERINGS the calibration checks are the paper's stated ones.
  CAST: [
    { id: 'adult',    label: 'grown-up',   sub: '',                                  phrase: 'the grown-up',                                 human: true,  reason: 10, talk: 10, aware: 10, suffer: 10 },
    { id: 'infant',   label: 'baby',       sub: 'a few days old, no parents',        phrase: 'the baby',                                     human: true,  reason: 1,  talk: 0,  aware: 1,  suffer: 10 }, // Bentham p. 106; p. 109: "an orphaned human infant"
    { id: 'braindam', label: 'grown-up',   sub: 'brain badly hurt, for good',        phrase: 'the grown-up whose brain is badly hurt',       human: true,  reason: 0,  talk: 0,  aware: 0,  suffer: 10 }, // p. 110: "severe and irreversible brain damage"
    { id: 'disab',    label: 'grown-up',   sub: 'who cannot learn much',             phrase: 'the grown-up who cannot learn much',           human: true,  reason: 3,  talk: 4,  aware: 4,  suffer: 10 },
    { id: 'chimp',    label: 'chimpanzee', sub: '',                                  phrase: 'the chimpanzee',                               human: false, reason: 6,  talk: 2,  aware: 8,  suffer: 10 }, // p. 110: "adult apes"
    { id: 'dog',      label: 'dog',        sub: '',                                  phrase: 'the dog',                                      human: false, reason: 3,  talk: 1,  aware: 6,  suffer: 10 },
    { id: 'pig',      label: 'pig',        sub: '',                                  phrase: 'the pig',                                      human: false, reason: 4,  talk: 1,  aware: 6,  suffer: 10 },
    { id: 'horse',    label: 'horse',      sub: '',                                  phrase: 'the horse',                                    human: false, reason: 2,  talk: 1,  aware: 5,  suffer: 10 },
    { id: 'mouse',    label: 'mouse',      sub: '',                                  phrase: 'the mouse',                                    human: false, reason: 1,  talk: 0,  aware: 3,  suffer: 10 }, // p. 110: "apes, cats, mice"
    { id: 'stone',    label: 'stone',      sub: '',                                  phrase: 'the stone',                                    human: false, reason: 0,  talk: 0,  aware: 0,  suffer: 0  }
  ],
  // The three menus: who is on offer at each experiment. The nine creatures that can suffer appear once each. Each menu has a person and an
  // animal, and each is built around one of the paper's clashes: the third is the paper's own test (the orphaned infant, to save many lives;
  // p. 109), with Bentham's dog beside it (p. 106); the second is the paper's follow-up (severe and irreversible brain damage, p. 110) beside
  // the apes; the first puts Benn's "imbecile" (p. 113) beside the horse and the mouse.
  // The stone is not on a menu (no experiment on a stone helps anyone); it appears once, at the Suffer question, as the boundary (p. 107).
  MENUS: { 1: ['disab', 'horse', 'mouse'], 2: ['braindam', 'chimp', 'pig'], 3: ['adult', 'infant', 'dog'] },
  SUBJECTS: ['adult', 'infant', 'braindam', 'disab', 'chimp', 'dog', 'pig', 'horse', 'mouse'],
  // The three rules with marks, in the order they come to the board. The verb is how the rule orders beings; the "first" phrase says whom the rule would use first.
  RULES: [
    { id: 'reason', label: 'Reason', what: 'how well it can think things out',              rule: 'the less a being can think, the sooner you may use it; whoever can think well is used last, or not at all', verb: 'thinks' },
    { id: 'talk',   label: 'Talk',   what: 'whether it can talk, and how much',              rule: 'the less a being can talk, the sooner you may use it; whoever can talk well is used last, or not at all', verb: 'talks' },
    { id: 'aware',  label: 'Aware',  what: 'how much it knows about what is happening to it', rule: 'the less a being knows about what is happening to it, the sooner you may use it; whoever knows a lot is used last, or not at all', verb: 'knows' }
  ],
  SUFFER: { id: 'suffer', label: 'Suffer', what: 'whether it can suffer at all', rule: 'a being that cannot suffer may be used freely; a being that can suffer has a pain that counts as much as anyone\'s, so among beings that can suffer, none may be used while another is spared', verb: 'suffers' },
  SPECIES: { id: 'species', label: 'Species', what: 'whether it is a person', rule: 'animals may be used sooner than people; people are used last, or not at all', verb: 'is one of us' },
  MIRROR: ['Race', 'Sex'],
  // ---- The experiments: three rungs of stakes, each with a pool of stories; one story is drawn per rung per play. The cost is the same every time.
  COST: 'Whoever you use will be in bad pain for a day. Then they will be fine again, with no lasting harm.',
  LEVELS: [
    { n: 1, label: 'to spare one child a year of illness', short: 'one child, a year of illness', stakes: 'one child, ill for a year',
      skins: [
        'A girl in the hospital has an illness that will keep her in bed for a whole year. This experiment would find the cure, and she would be up and out in a week.',
        'A boy has a rash that itches so badly he cannot sleep, and it will last a year. This experiment would find the cream that makes it stop.',
        'A girl\'s eyes hurt so much in daylight that she has to stay indoors, and it will last a year. This experiment would find the drops that fix it.'
      ] },
    { n: 2, label: 'to save one life', short: 'one life', stakes: 'one life',
      skins: [
        'One man is dying of a fever that nobody knows how to treat. This experiment would find the medicine, in time to save him.',
        'A woman has been bitten by a snake, and there is no antidote for its poison. This experiment would make the antidote, in time to save her.',
        'A boy\'s heart is failing, and the only drug that might help has never been tried. This experiment would show whether it works, in time to save him.'
      ] },
    { n: 3, label: 'to save a thousand lives', short: 'a thousand lives', stakes: 'a thousand lives',
      skins: [
        'A fever is spreading through a town of a thousand people, and it kills. This experiment would find the vaccine, in time to save all of them.',
        'A thousand people drink from the same well, and something in the water is slowly killing them. This experiment would find what it is, and how to clean the water, in time.',
        'A thousand miners are trapped underground with bad air. This experiment would find the one gas that keeps them alive until they can be dug out.'
      ] }
  ],
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
CONFIG.RULES.push(CONFIG.SUFFER); // the fourth rule: marks all equal (every one of the nine can suffer; the stone cannot)
CONFIG.MARKS = CONFIG.RULES.slice(0, 3); // the three rules with rankings
CONFIG.RULERS = CONFIG.RULES.concat([CONFIG.SPECIES]);

// ---------- helpers ----------
function castById(id) { for (var i = 0; i < CONFIG.CAST.length; i++) if (CONFIG.CAST[i].id === id) return CONFIG.CAST[i]; return null; }
function rulerById(id) { for (var i = 0; i < CONFIG.RULERS.length; i++) if (CONFIG.RULERS[i].id === id) return CONFIG.RULERS[i]; return null; }
function levelById(n) { for (var i = 0; i < CONFIG.LEVELS.length; i++) if (CONFIG.LEVELS[i].n === n) return CONFIG.LEVELS[i]; return null; }
function cap(t) { return t.charAt(0).toUpperCase() + t.slice(1); }
function inOrder(ids) { return CONFIG.SUBJECTS.filter(function (id) { return ids.indexOf(id) >= 0; }); }
function menuOf(n) { return CONFIG.MENUS[n]; }
function rungOf(id) { for (var n = 1; n <= 3; n++) if (menuOf(n).indexOf(id) >= 0) return n; return 0; }
function listPhrases(ids) {
  var ps = inOrder(ids).map(function (id) { return castById(id).phrase; });
  if (ps.length === 0) return 'nobody';
  if (ps.length === 1) return ps[0];
  return ps.slice(0, -1).join(', ') + ' and ' + ps[ps.length - 1];
}
function isAre(ids) { return ids.length === 1 ? 'is' : 'are'; }
// A story for each rung, drawn with a seed so a play is reproducible; seed 0 gives the first story of each rung.
function drawSkins(seed) {
  var x = (seed || 0) >>> 0;
  return CONFIG.LEVELS.map(function (L) { x = (x * 1664525 + 1013904223) >>> 0; return L.skins[seed ? x % L.skins.length : 0]; });
}

// ---------- Part 1: the experiments, and whether one rule can make sense of them ----------
// ticks: { 1: [ids], 2: [ids], 3: [ids] } — everyone the player was willing to use at each experiment. Each creature is on one menu only.
// A rule "explains" an experiment if, on that menu, every creature the player used has a mark lower than every creature he spared (a tie is a
// violation: a rule that cannot tell two beings apart cannot use one and spare the other). A rule explains the player's choices if it explains
// all three experiments. Each experiment is checked on its own. Suffer is a rule like the others whose marks are all equal, so it explains an
// experiment only where the player used all three or nobody. Species is the team's rule: people and animals are each unordered among
// themselves, so only a person used while an animal is spared is a violation.
function tickedAt(ticks, id) { var n = rungOf(id); return n && (ticks[n] || []).indexOf(id) >= 0 ? n : 0; }
function marksOf(ruleId) {
  if (ruleId === 'species') return function (id) { return castById(id).human ? 1 : 0; };
  return function (id) { return castById(id)[ruleId]; };
}
function modeOf(ruleId) { return ruleId === 'species' ? 'team' : 'marks'; }
function explainsColumn(ticks, mark, mode, k) {
  var menu = menuOf(k), used = menu.filter(function (id) { return tickedAt(ticks, id); }), spared = menu.filter(function (id) { return !tickedAt(ticks, id); });
  var worst = null, pairs = [], inv = {};
  used.forEach(function (a) { spared.forEach(function (b) {
    var bad = mode === 'team' ? mark(a) > mark(b) : mark(a) >= mark(b);
    if (!bad) return;
    var gap = (mark(a) - mark(b)) * 4 + (b === 'infant' || b === 'braindam' ? 0.5 : 0);
    pairs.push([a, b]); inv[a] = true; inv[b] = true;
    if (!worst || gap > worst.gap) worst = { sooner: a, later: b, tie: mark(a) === mark(b), gap: gap };
  }); });
  return { k: k, ok: !worst, clash: worst ? [worst.sooner, worst.later] : null, tie: worst ? worst.tie : false, pairs: pairs, violators: Object.keys(inv), used: used, spared: spared };
}
function explains(ticks, mark, mode) {
  var cols = {}, bad = [], worst = null; mode = mode || 'marks';
  [1, 2, 3].forEach(function (k) { var c = explainsColumn(ticks, mark, mode, k); cols[k] = c; if (!c.ok) { bad.push(k); if (!worst || c.pairs.length > worst.pairs.length) worst = c; } });
  return { ok: bad.length === 0, cols: cols, bad: bad, clash: worst ? worst.clash : null, tie: worst ? worst.tie : false };
}
function ruleTest(ticks, ruleId) { var t = explains(ticks, marksOf(ruleId), modeOf(ruleId)); t.ruler = ruleId; t.agrees = t.ok; return t; }
function rulesExplaining(ticks) { return CONFIG.MARKS.filter(function (r) { return ruleTest(ticks, r.id).ok; }).map(function (r) { return r.id; }); }
function countTicked(ticks) { return [1, 2, 3].reduce(function (n, k) { return n + (ticks[k] || []).length; }, 0); }
// What the player did, in words.
function didWords(ticks) {
  return CONFIG.LEVELS.map(function (L) {
    var t = inOrder(ticks[L.n] || []), off = menuOf(L.n), no = off.filter(function (id) { return t.indexOf(id) < 0; });
    if (t.length === 0) return cap(L.label) + ', you would use nobody; on offer were ' + listPhrases(off) + '.';
    if (no.length === 0) return cap(L.label) + ', you would use any of them: ' + listPhrases(t) + '.';
    return cap(L.label) + ', you would use ' + listPhrases(t) + ', and spare ' + listPhrases(no) + '.';
  }).join(' ');
}
// pattern: refuse (nobody ticked anywhere) | all (everyone ticked everywhere) | mixed
function pattern(ticks) {
  if (CONFIG.SUBJECTS.every(function (id) { return !tickedAt(ticks, id); })) return 'refuse';
  if (CONFIG.SUBJECTS.every(function (id) { return tickedAt(ticks, id); })) return 'all';
  return 'mixed';
}
function expName(k) { return 'Experiment ' + k; }
// One column, in one line.
function columnWords(ticks, r, mark, c) {
  var head = expName(c.k) + ': ';
  if (c.used.length === 0) return head + 'nobody used, so nothing to complain about.';
  if (c.spared.length === 0) return head + 'all three used, so nothing to complain about.';
  if (c.ok) return head + 'fine. ' + cap(listPhrases(c.used)) + ' ' + (c.used.length === 1 ? 'has' : 'have') + ' the lower mark' + (c.used.length === 1 ? '' : 's') + ', ' + listPhrases(c.spared) + ' the higher.';
  var a = castById(c.clash[0]), b = castById(c.clash[1]);
  if (r.id === 'suffer') return head + 'Suffer complains. You would use ' + a.phrase + ' and spare ' + b.phrase + ', and both can suffer just the same.';
  if (r.id === 'species') return head + 'the team\'s rule complains. You would use ' + a.phrase + ', a person, and spare ' + b.phrase + ', an animal.';
  if (c.tie) return head + r.label + ' complains. You would use ' + a.phrase + ' and spare ' + b.phrase + ', but they have the same mark, ' + mark(a.id) + ' each; ' + r.label + ' cannot tell them apart.';
  return head + r.label + ' complains. You would use ' + a.phrase + ' (mark ' + mark(a.id) + ') and spare ' + b.phrase + ' (mark ' + mark(b.id) + '): the one you would use ' + r.verb + ' better.';
}
// What the board says for a rule: a headline, then one line per experiment.
function ruleWords(ticks, ruleId) {
  var r = rulerById(ruleId), t = ruleTest(ticks, ruleId), p = pattern(ticks), mark = marksOf(ruleId);
  if (p === 'refuse') return r.label + ' has nothing to check: you would use nobody.';
  if (p === 'all') return r.label + ' has no complaint, but only because you would use everyone on every menu.';
  var cols = [1, 2, 3].map(function (k) { return columnWords(ticks, r, mark, t.cols[k]); }).join(' ');
  if (t.ok && ruleId === 'suffer') return 'Suffer agrees with all three of your choices. Its marks are all the same, because every one of the nine can suffer; and in every experiment you would use all three, or nobody. Nobody\'s pain counted for more with you than anybody else\'s.';
  if (t.ok) return r.label + ' agrees with all three of your choices: in every experiment, the ones you would use have the lower marks. The red marks are its cutoffs. ' + cols;
  if (ruleId === 'suffer') return 'Suffer objects, in ' + (t.bad.length === 1 ? 'one experiment' : t.bad.length + ' experiments') + '. Its marks are all the same, because every one of the nine can suffer; so it has no complaint only where you would use all three, or nobody. ' + cols;
  return r.label + ' objects, in ' + (t.bad.length === 1 ? 'one experiment' : t.bad.length + ' experiments') + ': you would use someone with a higher mark and spare someone with a lower one. The red circles show where. ' + cols;
}

// ---------- The name of the line ----------
// refuse (nobody, at any price: Foot's question) | singer (Suffer explains the choices: all or none, in every experiment)
// | line (a rule with a ranking explains them) | species (the team's rule explains them and no rule with a ranking does) | own (nothing explains them)
function shapeOf(ticks) {
  var p = pattern(ticks), L = rulesExplaining(ticks);
  if (p === 'refuse') return { id: 'refuse', lines: [] };
  if (ruleTest(ticks, 'suffer').ok) return { id: 'singer', lines: L };
  if (L.length) return { id: 'line', lines: L };
  if (ruleTest(ticks, 'species').ok) return { id: 'species', lines: [] };
  return { id: 'own', lines: [] };
}
// The player's line, for drawing: who he would use (with the stakes), who he would spare.
function lineOf(ticks) {
  var used = CONFIG.SUBJECTS.filter(function (id) { return tickedAt(ticks, id); }), spared = CONFIG.SUBJECTS.filter(function (id) { return !tickedAt(ticks, id); });
  return { used: used, spared: spared, stakes: function (id) { return tickedAt(ticks, id); } };
}
function shapeWords(ticks) {
  var s = shapeOf(ticks), w = { shape: s }, p = pattern(ticks);
  if (s.id === 'refuse') {
    w.name = 'No one, at any price'; w.headline = 'You would use nobody.';
    w.who = 'Not to spare a child a year of illness, not to save a life, not to save a thousand lives. There is no line between the nine here for a rule to explain: you drew no line at all.';
    w.singer = 'Singer has no quarrel with you about animals; you treat the baby and the mouse exactly alike. You part from him somewhere else: he says a day of pain for one, against a thousand lives, is a trade worth making, whoever has the pain; you say some things may not be done to anyone, whatever it buys. That is a different question, and a different paper: Philippa Foot\'s, also on this shelf.';
  } else if (s.id === 'singer') {
    w.name = 'Singer\'s line'; w.headline = 'Suffer explains all three of your choices.';
    w.who = p === 'all' ? 'You would use everyone on every menu, for anything from a child\'s year of illness to a thousand lives. Nobody\'s pain counted for more with you than anybody else\'s; only the stakes mattered, and they were always enough.' : 'In every experiment you would use all three or nobody. So nobody\'s pain counted for more with you than anybody else\'s; only the stakes moved you.';
    w.singer = 'That is Singer\'s line, and he says it is the only line not drawn by hand: a day of pain is a day of pain, whoever has it. Whoever can suffer counts, and counts the same; the stone is the only one that does not count. Most people draw a different line, animals used and people spared; it has a name, and the board will tell you what it is at the end.';
  } else if (s.id === 'line') {
    var labs = s.lines.map(function (id) { return rulerById(id).label; });
    w.name = 'A ' + labs[0] + ' line'; w.headline = (labs.length === 1 ? labs[0] + ' explains' : labs.slice(0, -1).join(', ') + ' and ' + labs[labs.length - 1] + ' each explain') + ' all three of your choices.';
    w.who = 'In every experiment, the ones you would use have the lower marks on ' + labs.join(' and ') + '. A rule you can check gives your line; it is not drawn by hand. The question is whether it is the right rule.';
    w.singer = 'Singer says it is not. The ones you would use ' + (labs[0] === 'Aware' ? 'know least about what is happening to them' : (labs[0] === 'Talk' ? 'can talk least' : 'think least well')) + ', but a day of bad pain hurts them exactly as much as it hurts the ones you would spare. Picking ' + labs[0] + ' to decide whose pain may be spent is, he says, like picking skin colour: a mark that has nothing to do with being hurt. Suffer, the one rule whose marks are about being hurt, objected to your choices.';
  } else if (s.id === 'species') {
    w.name = 'Species'; w.headline = 'No rule with a ranking explains your choices. One rule does.';
    w.who = 'Reason, Talk and Aware each objected: somewhere an animal you would use has a higher mark than a person you would spare. Suffer objected too: they can all suffer. But one rule explains all three of your choices, and it needs no marks at all: animals may be used, people are spared. It is the rule of the team you happen to be on. Its name is Species.';
    w.singer = 'Singer\'s word for this is speciesism, and he says it is the same pattern as racism and sexism: the line is drawn on the team, not on any mark you could check. His own test, from the last page of his paper: say why the dog may be used and the baby may not, then say it again with "white" for "person" and "black" for "animal".';
  } else {
    w.name = 'Your own order'; w.headline = 'No rule explains your choices.';
    w.who = 'No rule with a ranking gives your three choices, and the team\'s rule, animals used and people spared, does not give them either. Singer would ask what the ones you would use have in common that the ones you would spare lack. If you can name it, it is a rule, and the board can check it; if you cannot, it is a hand.';
    w.singer = 'His own answer is one rule, Suffer, with no ranking in it: whoever can suffer counts, and counts the same. It objected to your choices too. Most people draw a different line, animals used and people spared; it has a name, and the board will tell you what it is at the end.';
  }
  return w;
}

// ---------- The verdict ----------
// state: { ticks, skins }
function verdict(state) {
  var ticks = state.ticks || {}, w = shapeWords(ticks), s = w.shape, line = lineOf(ticks);
  var fate, part, team = 'The line most people draw, animals used and people spared, is given by no rule you can check; its name is Species, and Singer says it is the same pattern as racism and sexism.';
  var two = 'Singer names two things that do not survive his line: experiments on animals that nobody would do on a baby, and eating animals because they taste good.';
  if (s.id === 'refuse') { fate = 'You would spend nobody\'s pain.'; part = 'Not about animals: you treat the baby and the mouse alike, which is all Singer asks. You part from him on whether a day of pain for one may ever be traded for a thousand lives. He says yes; you say no. That is Foot\'s question, not his; her paper is on this shelf.'; }
  else if (s.id === 'singer') { fate = 'You drew Singer\'s line.'; part = 'Nowhere that matters. Whoever can suffer counted the same with you, and only the stakes moved you. That is equal consideration, which is the whole of his paper. ' + team; }
  else if (s.id === 'line') { fate = 'You drew a straight line in the wrong place.'; part = 'At the rule. A rule you can check gives your choices, so they are not made by hand; but Singer says it is the wrong rule, as arbitrary as skin colour: the ones you would use are hurt exactly as much as the ones you would spare. ' + team; }
  else if (s.id === 'species') { fate = 'Your hand drew the line, not a rule.'; part = 'At the line. The only difference between the animals you would use and the people you would spare that fits what you did is the team each is on. Singer\'s word for that is speciesism, and he says it is the same pattern as racism and sexism.'; }
  else { fate = 'You drew your own order.'; part = 'At the line. No rule with a ranking gives your choices, and the team\'s rule does not either. Singer would ask what the ones you would use have in common; if you can name it, the board can check it. ' + team; }
  var singerLine = 'Singer\'s line puts all nine on one side and the stone alone on the other: whoever can suffer counts, and counts the same.';
  return { fate: fate, name: w.name, who: w.who, part: part, singerLine: singerLine, two: two, shape: s, line: line, did: didWords(ticks) };
}

if (typeof module !== 'undefined') module.exports = { CONFIG: CONFIG, expName: expName, columnWords: columnWords, explainsColumn: explainsColumn, castById: castById, rulerById: rulerById, levelById: levelById, listPhrases: listPhrases, drawSkins: drawSkins, menuOf: menuOf, rungOf: rungOf,
  tickedAt: tickedAt, marksOf: marksOf, explains: explains, ruleTest: ruleTest, rulesExplaining: rulesExplaining, countTicked: countTicked, didWords: didWords, pattern: pattern, ruleWords: ruleWords,
  shapeOf: shapeOf, lineOf: lineOf, shapeWords: shapeWords, verdict: verdict };
