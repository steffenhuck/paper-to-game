// Draw a Line with Singer — the mechanism. The only copy: the HTML is generated from this file and embeds it verbatim.
// Runs unchanged in Node (calibration.js, loop.js) and in the browser (the game passes actions in and draws what comes back).
// Mechanism kind: TOY, built to illustrate the argument of Peter Singer, "All Animals Are Equal", Philosophic Exchange 5(1), 1974,
// pp. 103-116 (the journal's own text, SUNY open repository). Page numbers below are the journal's.
// Revision 9 (27 Nov 2026): three menus, all ten creatures, and a rationalisability test. Revision 8 (same day) had been a new shape. The player is the scientist first. Three experiments of rising stakes, each needing one
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
  // The three menus: who is on offer at each experiment. All ten creatures appear once. Each menu has a person and an animal, and each is
  // built around one of the paper's clashes: the third is the paper's own test (the orphaned infant, to save many lives; p. 109), with
  // Bentham's dog beside it (p. 106); the second is the paper's follow-up (severe and irreversible brain damage, p. 110) beside the apes;
  // the first puts Benn's "imbecile" (p. 113) beside the horse and the mouse, with the stone, which has no interests (p. 107), for free.
  MENUS: { 1: ['disab', 'horse', 'mouse', 'stone'], 2: ['braindam', 'chimp', 'pig'], 3: ['adult', 'infant', 'dog'] },
  SUBJECTS: ['adult', 'infant', 'braindam', 'disab', 'chimp', 'dog', 'pig', 'horse', 'mouse', 'stone'],
  // The three rules with marks, in the order they come to the board. The verb is how the rule orders beings; the "first" phrase says whom the rule would use first.
  RULES: [
    { id: 'reason', label: 'Reason', what: 'how well it can think things out',              rule: 'the less a being can think, the sooner you may use it; whoever can think well is used last, or not at all', verb: 'thinks' },
    { id: 'talk',   label: 'Talk',   what: 'whether it can talk, and how much',              rule: 'the less a being can talk, the sooner you may use it; whoever can talk well is used last, or not at all', verb: 'talks' },
    { id: 'aware',  label: 'Aware',  what: 'how much it knows about what is happening to it', rule: 'the less a being knows about what is happening to it, the sooner you may use it; whoever knows a lot is used last, or not at all', verb: 'knows' }
  ],
  SUFFER: { id: 'suffer', label: 'Suffer', what: 'whether it can suffer at all', rule: 'if a being can suffer, its pain counts as much as anyone\'s; so among beings that can suffer, none may be used sooner than another, and whatever cannot suffer may be used freely', verb: 'suffers' },
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
CONFIG.RULERS = CONFIG.RULES.concat([CONFIG.SUFFER, CONFIG.SPECIES]);

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
// The stone is free under every rule (it has no interests, p. 107), so no pair with the stone is ever a violation.
// A rule with marks "explains" the three choices if there is a cutoff for each experiment, rising with the stakes, such that at each
// experiment the player ticked exactly the creatures with marks at or below that experiment's cutoff. Equivalently: there is no pair
// (a ticked at stakes k, b left unticked at stakes j >= k) with mark(a) >= mark(b). Such a pair is a violation: a has the higher mark (or
// the same mark, which the rule cannot tell apart) and yet is used for a smaller good, or the same good, while b is spared.
function tickedAt(ticks, id) { var n = rungOf(id); return n && (ticks[n] || []).indexOf(id) >= 0 ? n : 0; }
function marksOf(ruleId, answers) {
  if (ruleId === 'species') return function (id) { return castById(id).human ? 1 : 0; };
  if (ruleId === 'suffer') return function (id) { return id === 'stone' ? 0 : ((answers || {})[id] === false ? 0 : 1); };
  return function (id) { return castById(id)[ruleId]; };
}
// mode: 'marks' (a rule with marks: a higher or equal mark used no later than a lower one is a violation); 'team' (Species: people and
// animals are each unordered among themselves, so only a person used while an animal is spared is a violation); 'suffer' (only beings
// that can suffer are constrained, and among them any difference is a violation; whatever cannot suffer may be used freely).
function explains(ticks, mark, mode) {
  var worst = null; mode = mode || 'marks';
  CONFIG.SUBJECTS.forEach(function (a) {
    var ka = tickedAt(ticks, a); if (!ka) return;
    if (a === 'stone') return; // the stone is free under every rule: nothing can be done to it that it minds
    CONFIG.SUBJECTS.forEach(function (b) {
      if (a === b || b === 'stone') return;
      var jb = rungOf(b); if (jb < ka || tickedAt(ticks, b)) return;
      var bad = mode === 'team' ? mark(a) > mark(b) : (mode === 'suffer' ? (mark(a) === 1 && mark(b) === 1) : mark(a) >= mark(b));
      if (bad) {
        var gap = (mark(a) - mark(b)) * 4 + (jb - ka) + (jb === ka ? 1 : 0) + (mode === 'suffer' && (b === 'infant' || b === 'braindam') ? 0.5 : 0);
        if (!worst || gap > worst.gap) worst = { sooner: a, later: b, tie: mark(a) === mark(b), gap: gap };
      }
    });
  });
  // cutoffs, for drawing: the highest mark ticked at stakes <= k, or -1 if nothing ticked yet
  var cut = {}, c = -1;
  for (var k = 1; k <= 3; k++) { (ticks[k] || []).forEach(function (id) { if (id !== 'stone' && mark(id) > c) c = mark(id); }); cut[k] = c; }
  return { ok: !worst, clash: worst ? [worst.sooner, worst.later] : null, tie: worst ? worst.tie : false, cut: cut };
}
function modeOf(ruleId) { return ruleId === 'species' ? 'team' : (ruleId === 'suffer' ? 'suffer' : 'marks'); }
function ruleTest(ticks, ruleId, answers) { var t = explains(ticks, marksOf(ruleId, answers), modeOf(ruleId)); t.ruler = ruleId; t.agrees = t.ok; return t; }
function rulesExplaining(ticks) { return CONFIG.RULES.filter(function (r) { return ruleTest(ticks, r.id).ok; }).map(function (r) { return r.id; }); }
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
// pattern: refuse (no being that can suffer, by Singer's facts, is ticked anywhere) | all (everyone ticked everywhere) | mixed
function pattern(ticks) {
  var sufferers = CONFIG.SUBJECTS.filter(function (id) { return id !== 'stone'; });
  if (sufferers.every(function (id) { return !tickedAt(ticks, id); })) return 'refuse';
  if (CONFIG.SUBJECTS.every(function (id) { return tickedAt(ticks, id); })) return 'all';
  return 'mixed';
}
function usedWords(ticks, id) { var k = tickedAt(ticks, id); return k ? levelById(k).label : 'not even ' + levelById(rungOf(id)).label; }
// A clash, in words, for a rule with marks or for Suffer.
function clashWords(ticks, t, r, mark) {
  var a = castById(t.clash[0]), b = castById(t.clash[1]), ka = tickedAt(ticks, a.id), jb = rungOf(b.id), same = ka === jb;
  var s = 'You would use ' + a.phrase + ' ' + levelById(ka).label + ', but you would not use ' + b.phrase + (same ? ', who was on offer for the same thing' : ', not even ' + levelById(jb).label) + '. ';
  if (r.id === 'suffer') s += 'Yet you say both can suffer. The experiment hurts each of them just the same, a day of bad pain. The Suffer rule has no order among beings that can suffer: one day of pain is one day of pain, whoever has it. So by the Suffer rule, if ' + a.phrase + ' may be used ' + levelById(ka).label + ', then ' + b.phrase + ' may be used for that too, and for anything bigger.';
  else if (t.tie) s += 'On ' + r.label + ', ' + a.phrase + ' and ' + b.phrase + ' have the same mark, ' + mark(a.id) + ' each, so ' + r.label + ' cannot tell them apart. A rule that cannot tell two beings apart cannot use one and spare the other' + (same ? '' : ', and whoever may be used for a small good may be used for a bigger one') + '. So ' + r.label + ' cannot be the rule behind what you did.';
  else s += 'On ' + r.label + ', ' + a.phrase + ' has a mark of ' + mark(a.id) + ' and ' + b.phrase + ' has a mark of ' + mark(b.id) + ': ' + a.phrase + ' ' + r.verb + ' better. If ' + r.label + ' were your rule, then whoever has the lower mark would be used first, or at least no later, and whoever may be used for a small good may be used for a bigger one. You did it the other way round. So ' + r.label + ' cannot be the rule behind what you did.';
  return s;
}
// What the board says for a rule with marks.
function ruleWords(ticks, ruleId) {
  var r = rulerById(ruleId), t = ruleTest(ticks, ruleId), p = pattern(ticks);
  if (p === 'refuse') return r.label + ' has nothing to check. You would use nobody who can feel anything' + (tickedAt(ticks, 'stone') ? ', only the stone' : '') + ', so there is no order of use for ' + r.label + ' to explain.';
  if (p === 'all') return r.label + ' agrees, but only because you would use everyone on every menu. A rule that uses the low marks first has no complaint about that, and nothing to add.';
  if (t.ok) return r.label + ' agrees. Everyone you would use has a mark no higher than anyone you would spare at the same stakes or at higher stakes. If ' + r.label + ' were your rule, with a cutoff that rises as the stakes rise, it would have given exactly these three choices. The red lines are the cutoffs: one for each experiment.';
  return r.label + ' objects. ' + clashWords(ticks, t, r, marksOf(ruleId)) + ' The red circles are ' + r.label + '\'s complaint.';
}

// ---------- Part 2: can they suffer? ----------
// answers: { id: true | false } for the nine beings (the stone is not asked; it cannot suffer, and the game says so).
function sufferTest(ticks, answers) {
  answers = answers || {};
  var ids = CONFIG.SUBJECTS.filter(function (id) { return id !== 'stone'; });
  var yes = ids.filter(function (id) { return answers[id] === true; }), no = ids.filter(function (id) { return answers[id] === false; });
  var unanswered = ids.filter(function (id) { return answers[id] === undefined; });
  var t = explains(ticks, marksOf('suffer', answers), 'suffer');
  return { yes: yes, no: no, unanswered: unanswered, complete: unanswered.length === 0, objects: !t.ok, clash: t.clash, cut: t.cut, disputed: no, singer: explains(ticks, marksOf('suffer', {}), 'suffer').ok };
}
function sufferWords(ticks, answers) {
  var t = sufferTest(ticks, answers), p = pattern(ticks), s = '';
  if (!t.complete) return '';
  if (p === 'refuse') s = 'Suffer has nothing to object to: you would use nobody who can feel anything. ';
  else if (t.objects) s = 'Suffer objects. ' + clashWords(ticks, t, CONFIG.SUFFER) + ' The red circles are Suffer\'s complaint, and this time it is built from two things you said yourself: it can suffer, and it may be used. ';
  else if (p === 'all') s = 'Suffer agrees: you would use everyone on every menu, and that is no order among them. ';
  else s = 'Suffer agrees with your three choices. Whenever you would use one being that can suffer, by your own answers, you would also use every other being that can suffer, on that menu and on the menus with higher stakes. That is what the Suffer rule asks: one day of pain counts the same, whoever has it. ';
  if (t.no.length) s += (t.objects ? 'And Singer' : 'But Singer') + ' disputes a fact: he says ' + listPhrases(t.no) + ' can suffer, ' + (t.no.length === 1 ? 'and feels' : 'and feel') + ' pain at least as much as a baby a few days old does. The dashed circle' + (t.no.length === 1 ? ' marks' : 's mark') + ' where you and he disagree about the fact.' + (!t.objects && !t.singer ? ' With his facts, Suffer would object to your choices.' : '');
  return s;
}

// ---------- The name of the line ----------
// refuse (nobody who can suffer, at any price: Foot's question) | singer (Suffer explains the choices with Singer's facts: all who can suffer alike)
// | line (a rule with marks explains them) | species (the team's rule explains them and no rule with marks does) | equal-no (no rule and not the
// team, but Suffer explains them with the player's own answers, which say some of the nine cannot suffer) | own (nothing explains them)
function shapeOf(ticks, answers) {
  var p = pattern(ticks), L = rulesExplaining(ticks), st = sufferTest(ticks, answers || {});
  if (p === 'refuse') return { id: 'refuse', lines: [] };
  if (st.singer) return { id: 'singer', lines: L };
  if (L.length) return { id: 'line', lines: L };
  if (ruleTest(ticks, 'species').ok) return { id: 'species', lines: [] };
  if (st.complete && !st.objects) return { id: 'equal-no', lines: [] };
  return { id: 'own', lines: [] };
}
function shapeWords(ticks, answers) {
  var s = shapeOf(ticks, answers), w = { shape: s }, st = sufferTest(ticks, answers || {}), p = pattern(ticks);
  var team = 'Most people make a different set of choices: the animals used first, the people spared until the stakes are very high, or for good. That set of choices has a name, and the sponge is about to show it to you.';
  if (s.id === 'refuse') {
    w.name = 'No one, at any price'; w.headline = 'You would use nobody who can feel anything.';
    w.who = 'Not to spare a child a year of illness, not to save a life, not to save a thousand lives: you would not put any being that can suffer through a day of pain' + (tickedAt(ticks, 'stone') ? ' (the stone, yes; but nothing can be done to a stone that it minds)' : '') + '. There is no order of use here for a rule to explain, and no line between the nine at all.';
    w.singer = 'Singer has no quarrel with you about animals: you treat the baby and the mouse exactly alike. Your disagreement with him is somewhere else. He would say that a day of pain for one, against a thousand lives, is a trade worth making, whoever has the pain; you say some things may not be done to anyone, whatever it buys. That is a different question, and a different paper: Philippa Foot\'s, which is also on this shelf.';
  } else if (s.id === 'singer') {
    w.name = 'Singer\'s line'; w.headline = 'You treated everyone who can suffer alike.';
    w.who = p === 'all' ? 'You would use everyone on every menu, the stone and the grown-up and the baby and the mouse, for anything from a child\'s year of illness to a thousand lives. Nobody\'s pain counted for more with you than anybody else\'s, and nobody was spared: only the stakes mattered, and they were always enough.' : 'Whenever you would use one being that can suffer, you would use every other being that can suffer, on that menu and on the menus with higher stakes. So nobody\'s pain counted for more with you than anybody else\'s; only the stakes moved you. ' + (st.no.length ? 'You say ' + listPhrases(st.no) + ' cannot suffer, and Singer says ' + (st.no.length === 1 ? 'it can' : 'they can') + '; but your choices fit his facts as well as yours. ' : '');
    w.singer = 'That is Singer\'s line. He says it is the only line that is not drawn by hand: a day of pain is a day of pain, whoever has it. So whoever can suffer counts, and their pain counts as much as anyone\'s; and the stone, which cannot suffer, is the only one that does not count. ' + team;
  } else if (s.id === 'equal-no') {
    w.name = 'All alike, by your own answers'; w.headline = 'By your own answers, you treated everyone who can suffer alike.';
    w.who = didWords(ticks) + ' No rule with marks gives those choices, and the team\'s rule, animals first and people spared, does not give them either. But whenever you would use one being that you say can suffer, you would use every other being that you say can suffer, on that menu and on the menus with higher stakes. So the Suffer rule, with your facts, explains your choices. And your facts are doing the work: you say ' + listPhrases(st.no) + ' cannot suffer, and with Singer\'s facts, that every one of the nine can suffer, the Suffer rule would object.';
    w.singer = 'So you and Singer agree on the rule and disagree about a fact. He says the mouse is at least as sensitive to pain as a baby a few days old, and the same for the rest. If he is right about the facts, your line is not his. ' + team;
  } else if (s.id === 'line') {
    var labs = s.lines.map(function (id) { return rulerById(id).label; });
    w.name = 'A ' + labs[0] + ' line'; w.headline = (labs.length === 1 ? labs[0] + ' explains' : labs.slice(0, -1).join(', ') + ' and ' + labs[labs.length - 1] + ' each explain') + ' all three of your choices.';
    w.who = didWords(ticks) + ' ' + (labs.length === 1 ? labs[0] + ' gives those choices' : 'Each of ' + labs.join(', ') + ' gives those choices') + ': everyone you would use has a mark no higher than anyone you would spare, at the same stakes or at higher stakes, with a cutoff that rises as the stakes rise. So a rule you can check gives your line; it is not drawn by hand. The question is whether it is the right rule.';
    w.singer = 'Singer says a line like that is straight, but in the wrong place. The ones you would use first ' + (labs[0] === 'Aware' ? 'know least about what is happening to them' : (labs[0] === 'Talk' ? 'can talk least' : 'think least well')) + ', but a day of bad pain hurts them exactly as much as it hurts the ones you would spare. Picking ' + labs[0] + ' to decide whose pain may be spent first is, he says, like picking skin colour: a mark that has nothing to do with being hurt. ' + (st.objects ? 'And by your own answers, Suffer objects to your choices. ' : '') + team;
  } else if (s.id === 'species') {
    w.name = 'Species'; w.headline = 'No rule with marks explains your choices. One rule does.';
    w.who = didWords(ticks) + ' Reason, Talk and Aware each objected: on each of them, some animal you would use has a higher mark than some person you would spare. ' + (st.objects ? 'And Suffer objected too, because you said yourself that they can suffer. ' : (st.no.length ? 'Suffer did not object, but only because you said ' + listPhrases(st.no) + ' cannot suffer; Singer says ' + (st.no.length === 1 ? 'it can' : 'they can') + ', and with his facts Suffer would object as well. ' : '')) + 'But there is one rule that explains all three of your choices, and it needs no marks at all: the animals may be used first, and the people are spared. It is the rule of the team you happen to be on. Its name is Species.';
    w.singer = '';
  } else {
    w.name = 'Your own order'; w.headline = 'No rule explains your choices.';
    w.who = didWords(ticks) + ' No rule with marks gives those choices, and the team\'s rule, animals first and people spared, does not give them either. Singer would ask what the ones you would use have in common, that the ones you would spare lack. If you can name it, it is a rule, and the board can check it; if you cannot, it is a hand.';
    w.singer = 'His own answer is one rule: can it suffer? If it can, its pain counts as much as anyone\'s, and nobody who can suffer may be used sooner than another who can. ' + (st.objects ? 'By your own answers, Suffer objects to your choices too. ' : '') + team;
  }
  return w;
}

// ---------- The verdict ----------
// state: { ticks, answers, skins }
function verdict(state) {
  var ticks = state.ticks || {}, w = shapeWords(ticks, state.answers), s = w.shape, st = sufferTest(ticks, state.answers || {});
  var paper = [
    'Whose pain may be spent, and whose must be spared? Singer\'s answer: if two beings can both suffer, neither may be used sooner than the other. Not because they are alike in any other way, but because a day of pain is a day of pain, whoever has it.',
    'The choices most people make, animals first and people only at the highest stakes or never, are given by no rule you can check. Reason, Talk and Aware all object to them, because the chimpanzee, the dog and the mouse have higher marks than the baby and the hurt grown-up, and Suffer objects to them too, because all nine can suffer. Those choices are made by hand. The team you are on is not a rule.'
  ];
  var did = [didWords(ticks)];
  CONFIG.RULES.forEach(function (r) { did.push(ruleWords(ticks, r.id)); });
  did.push('Can they suffer? You said yes for ' + (st.yes.length ? listPhrases(st.yes) : 'none of them') + (st.no.length ? ', and no for ' + listPhrases(st.no) : '') + '. ' + sufferWords(ticks, state.answers));
  var found = ['Its name: ' + w.name + '. ' + w.who + (w.singer ? ' ' + w.singer : '')];
  var fate, part, stood;
  var two = 'Singer names two things that do not survive his line. Experiments on animals that nobody would do on a baby: he says almost none would be left, because almost no real experiment is the story you were told, with a thousand lives on the other side. And eating animals because they taste good: he says that should stop, since the pleasure of the taste is small and the pain behind it is not.';
  if (s.id === 'refuse') { fate = 'You would spend nobody\'s pain.'; part = ['Not about animals: you treated the baby and the mouse exactly alike, which is all Singer asks. You part from him on whether a day of pain for one may ever be traded for a thousand lives. He says yes; you say no. That is Foot\'s question, not his.']; stood = ['If you want to go on with that question, Philippa Foot\'s paper is on this shelf: the trolley, the surgeon, and what may not be done to one for the sake of many.', two]; }
  else if (s.id === 'singer') { fate = 'You drew Singer\'s line.'; part = ['Nowhere that matters. Whenever you would use one being that can suffer, you would use any other, and only the stakes moved you. That is equal consideration, which is the whole of his paper.' + (st.no.length ? ' You and he disagree about one fact, whether ' + listPhrases(st.no) + ' can suffer, but your choices fit his facts as well as yours.' : '')]; stood = [two]; }
  else if (s.id === 'equal-no') { fate = 'You treated everyone who can suffer alike, by your own answers.'; part = ['On a fact. You say ' + listPhrases(st.no) + ' cannot suffer; Singer says ' + (st.no.length === 1 ? 'it can' : 'they can') + ', at least as much as a baby a few days old. With his facts, the Suffer rule objects to your choices; with yours, it agrees. On the rule itself, you and he agree.']; stood = [two]; }
  else if (s.id === 'line') { fate = 'You drew a straight line in the wrong place.'; part = ['At the rule. A rule you can check gives your three choices, so they are not made by hand; but Singer says it is the wrong rule, as arbitrary as skin colour: the ones you would use first are hurt exactly as much as the ones you would spare.' + (st.objects ? ' And by your own answers they can all suffer, so Suffer objects to your choices too.' : '')]; stood = [two]; }
  else if (s.id === 'species') { fate = 'Your hand drew the line, not a rule.'; part = ['At the line. You would use the animals and spare the people, and no rule with marks gives those choices; the only difference between the animals you would use and the people you would spare that fits what you did is the team each is on. Singer\'s word for spending pain by team is speciesism, and he says it is the same pattern as racism and sexism.' + (st.objects ? ' And you said yourself that the animals can suffer.' : (st.no.length ? ' You said ' + listPhrases(st.no) + ' cannot suffer; he says ' + (st.no.length === 1 ? 'it can' : 'they can') + '.' : ''))]; stood = ['Singer has one more thing for you to do. Say out loud why the dog may be used to save a thousand lives and the baby may not. Then say it again, with "white" where you said "human" or "person" and "black" where you said "animal". He says what it sounds like the second time is the reason to give the line up.', two]; }
  else { fate = 'You drew your own order.'; part = ['At the line. No rule with marks gives your three choices, and the team\'s rule does not give them either. Singer would ask what the ones you would use have in common; if you can name it, the board can check it.' + (st.objects ? ' And by your own answers, two beings who can both suffer are treated differently, so Suffer objects.' : '')]; stood = [two]; }
  return { fate: fate, paper: paper, did: did, found: found, part: part, stood: stood, name: w.name, shape: s };
}

if (typeof module !== 'undefined') module.exports = { CONFIG: CONFIG, castById: castById, rulerById: rulerById, levelById: levelById, listPhrases: listPhrases, drawSkins: drawSkins, menuOf: menuOf, rungOf: rungOf,
  tickedAt: tickedAt, marksOf: marksOf, explains: explains, ruleTest: ruleTest, rulesExplaining: rulesExplaining, countTicked: countTicked, didWords: didWords, pattern: pattern, usedWords: usedWords, ruleWords: ruleWords,
  sufferTest: sufferTest, sufferWords: sufferWords, shapeOf: shapeOf, shapeWords: shapeWords, verdict: verdict };
