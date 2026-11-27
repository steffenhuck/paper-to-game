// Draw a Line with Singer — the mechanism. The only copy: the HTML is generated from this file and embeds it verbatim.
// Runs unchanged in Node (calibration.js, loop.js) and in the browser (the game passes actions in and draws what comes back).
// Mechanism kind: TOY, built to illustrate the argument of Peter Singer, "All Animals Are Equal", Philosophic Exchange 5(1), 1974,
// pp. 103-116 (the journal's own text, SUNY open repository). Page numbers below are the journal's.
// Revision 8 (27 Nov 2026): a new shape. The player is the scientist first. Three experiments of rising stakes, each needing one
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
  // The four subjects the paper itself names for the experiment (p. 109-110), in the order they are shown.
  SUBJECTS: ['infant', 'braindam', 'chimp', 'mouse'],
  // The three rules with marks, in the order they come to the board. The verb is how the rule orders beings; the "first" phrase says whom the rule would use first.
  RULES: [
    { id: 'reason', label: 'Reason', what: 'how well it can think things out',              rule: 'the less a being can think, the sooner you may use it; whoever can think well is used last, or not at all', verb: 'thinks' },
    { id: 'talk',   label: 'Talk',   what: 'whether it can talk, and how much',              rule: 'the less a being can talk, the sooner you may use it; whoever can talk well is used last, or not at all', verb: 'talks' },
    { id: 'aware',  label: 'Aware',  what: 'how much it knows about what is happening to it', rule: 'the less a being knows about what is happening to it, the sooner you may use it; whoever knows a lot is used last, or not at all', verb: 'knows' }
  ],
  SUFFER: { id: 'suffer', label: 'Suffer', what: 'whether it can suffer at all', rule: 'if a being can suffer, its pain counts as much as anyone\'s; so among beings that can suffer, none may be used sooner than another' },
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
CONFIG.RULERS = CONFIG.RULES.concat([CONFIG.SUFFER]);
var NEVER = 99; // the threshold of a subject the player would never use

// ---------- helpers ----------
function castById(id) { for (var i = 0; i < CONFIG.CAST.length; i++) if (CONFIG.CAST[i].id === id) return CONFIG.CAST[i]; return null; }
function rulerById(id) { for (var i = 0; i < CONFIG.RULERS.length; i++) if (CONFIG.RULERS[i].id === id) return CONFIG.RULERS[i]; return null; }
function levelById(n) { for (var i = 0; i < CONFIG.LEVELS.length; i++) if (CONFIG.LEVELS[i].n === n) return CONFIG.LEVELS[i]; return null; }
function cap(t) { return t.charAt(0).toUpperCase() + t.slice(1); }
function inOrder(ids) { return CONFIG.SUBJECTS.filter(function (id) { return ids.indexOf(id) >= 0; }); }
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

// ---------- Part 1: the experiments, and the line they reveal ----------
// ticks: { 1: [ids], 2: [ids], 3: [ids] } — everyone the player was willing to use at each rung.
// threshold(id): the lowest rung at which the player would use it, or NEVER.
function thresholds(ticks) {
  var th = {};
  CONFIG.SUBJECTS.forEach(function (id) {
    th[id] = NEVER;
    CONFIG.LEVELS.forEach(function (L) { if (th[id] === NEVER && (ticks[L.n] || []).indexOf(id) >= 0) th[id] = L.n; });
  });
  return th;
}
function thWords(t) { return t === NEVER ? 'never' : levelById(t).label; }
// What the player did, in words: who at which rung.
function didWords(th) {
  var groups = [];
  CONFIG.LEVELS.forEach(function (L) { var ids = CONFIG.SUBJECTS.filter(function (id) { return th[id] === L.n; }); if (ids.length) groups.push('You would use ' + listPhrases(ids) + ' ' + L.label + '.'); });
  var never = CONFIG.SUBJECTS.filter(function (id) { return th[id] === NEVER; });
  if (never.length) groups.push('You would never use ' + listPhrases(never) + ', not even to save a thousand lives.');
  // the earliest-used, in plain words
  return groups.join(' ');
}
// The pattern of the line: who goes first.
function pattern(th) {
  var ids = CONFIG.SUBJECTS, vals = ids.map(function (id) { return th[id]; });
  if (vals.every(function (v) { return v === NEVER; })) return 'refuse';
  if (vals.every(function (v) { return v === vals[0]; })) return 'equal';
  var hum = ids.filter(function (id) { return castById(id).human; }), ani = ids.filter(function (id) { return !castById(id).human; });
  var minH = Math.min.apply(null, hum.map(function (id) { return th[id]; })), minA = Math.min.apply(null, ani.map(function (id) { return th[id]; }));
  var maxH = Math.max.apply(null, hum.map(function (id) { return th[id]; })), maxA = Math.max.apply(null, ani.map(function (id) { return th[id]; }));
  if (maxA <= minH && minA < minH) return 'species';   // every animal used no later than any person, and some animal sooner
  if (maxH <= minA && minH < minA) return 'reverse';   // every person used no later than any animal, and some person sooner
  return 'mixed';
}

// ---------- Part 2: could a rule have given this order of use? ----------
// A rule with marks orders beings: the lower the mark, the sooner the rule would use it. The rule agrees with the player's line when,
// for every two subjects, the one with the higher mark is used no sooner than the one with the lower mark (ties in marks may go either way).
// When the rule objects, the clash is the pair that breaks this the most: higher mark, yet used sooner.
// A tie is an objection too: two beings with the same mark that the player uses at different rungs; the rule cannot tell them apart.
function ruleTest(th, ruleId) {
  var ids = CONFIG.SUBJECTS, worst = null, tie = null;
  ids.forEach(function (a) { ids.forEach(function (b) {
    if (a === b) return;
    var ma = castById(a)[ruleId], mb = castById(b)[ruleId];
    if (ma > mb && th[a] < th[b]) { // a has the higher mark but is used sooner
      var gap = (ma - mb) + (th[b] === NEVER ? 10 : th[b] - th[a]);
      if (!worst || gap > worst.gap) worst = { sooner: a, later: b, gap: gap };
    }
    if (ma === mb && th[a] < th[b] && !tie) tie = { sooner: a, later: b };
  }); });
  if (worst) return { ruler: ruleId, agrees: false, clash: [worst.sooner, worst.later], tie: false };
  if (tie) return { ruler: ruleId, agrees: false, clash: [tie.sooner, tie.later], tie: true };
  return { ruler: ruleId, agrees: true, clash: null, tie: false };
}
function rulesAgreeing(th) { return CONFIG.RULES.filter(function (r) { return ruleTest(th, r.id).agrees; }).map(function (r) { return r.id; }); }
// What the board says for a rule, written out in full.
function ruleWords(th, ruleId) {
  var r = rulerById(ruleId), t = ruleTest(th, ruleId), p = pattern(th);
  if (p === 'refuse') return r.label + ' has nothing to say. You would use nobody at any price, so there is no order of use for ' + r.label + ' to check.';
  if (t.agrees) {
    if (p === 'equal') return r.label + ' agrees, but only because you treated all four alike: you would use every one of them ' + thWords(th[CONFIG.SUBJECTS[0]]) + ', and no sooner. A rule that uses the low marks first has no complaint about that, and nothing to add.';
    return r.label + ' agrees with your line. Every time you were willing to use one subject sooner than another, the one you would use sooner has the lower mark on ' + r.label + '. If ' + r.label + ' were your rule, it would have given exactly this order of use.';
  }
  var a = castById(t.clash[0]), b = castById(t.clash[1]);
  if (t.tie) return r.label + ' objects. ' + cap(a.phrase) + ' and ' + b.phrase + ' have the same mark on ' + r.label + ', ' + a[ruleId] + ' each, so ' + r.label + ' cannot tell them apart. Yet you would use ' + a.phrase + ' ' + thWords(th[a.id]) + ', and ' + b.phrase + ' ' + (th[b.id] === NEVER ? 'never' : 'only ' + thWords(th[b.id])) + '. A rule that cannot tell two beings apart cannot put one before the other. So ' + r.label + ' cannot be the rule behind what you did.';
  return r.label + ' objects. By ' + r.label + ', ' + a.phrase + ' has a mark of ' + a[ruleId] + ' and ' + b.phrase + ' has a mark of ' + b[ruleId] + ', so ' + a.phrase + ' ' + r.verb + ' better. Yet you would use ' + a.phrase + ' ' + thWords(th[a.id]) + ', and ' + b.phrase + ' ' + (th[b.id] === NEVER ? 'never' : 'only ' + thWords(th[b.id])) + '. That is the wrong way round: if ' + r.label + ' were your rule, ' + b.phrase + ', with the lower mark, would have to be used first, or at least no later. The red circles are ' + r.label + '\'s complaint. So ' + r.label + ' cannot be the rule behind what you did.';
}

// ---------- Part 2, last: can they suffer? ----------
// answers: { id: true | false } for each of the four. The Suffer rule objects wherever two beings the player says can suffer are used at
// different rungs: among beings that can suffer it allows no order. The pair named is the one used soonest against the one used latest.
function sufferTest(th, answers) {
  answers = answers || {};
  var ids = CONFIG.SUBJECTS, yes = ids.filter(function (id) { return answers[id] === true; }), no = ids.filter(function (id) { return answers[id] === false; });
  var unanswered = ids.filter(function (id) { return answers[id] === undefined; });
  var vals = yes.map(function (id) { return th[id]; }), objects = false, soonest = null, latest = null;
  if (yes.length >= 2 && Math.min.apply(null, vals) !== Math.max.apply(null, vals)) {
    objects = true;
    yes.forEach(function (id) { if (soonest === null || th[id] < th[soonest]) soonest = id; if (latest === null || th[id] > th[latest]) latest = id; });
  }
  return { yes: yes, no: no, unanswered: unanswered, complete: unanswered.length === 0, objects: objects, clash: objects ? [soonest, latest] : null, disputed: no };
}
function sufferWords(th, answers) {
  var t = sufferTest(th, answers), p = pattern(th);
  if (!t.complete) return '';
  var s = '';
  if (p === 'refuse') s = 'Suffer has nothing to object to: you would use nobody. ';
  else if (t.objects) {
    var a = castById(t.clash[0]), b = castById(t.clash[1]);
    s = 'Suffer objects. You say ' + listPhrases(t.yes) + ' can suffer. Yet you would use ' + a.phrase + ' ' + thWords(th[a.id]) + ', and ' + b.phrase + ' ' + (th[b.id] === NEVER ? 'never' : 'only ' + thWords(th[b.id])) + '. The experiment hurts each of them just the same, a day of bad pain, and you say both can feel it. The Suffer rule has no order among beings that can suffer: one day of pain is one day of pain, whoever has it. The red circles are Suffer\'s complaint, and this time it is built from two things you said yourself: it can suffer, and it may be used sooner. ';
  } else if (t.yes.length >= 2) s = 'Suffer agrees with your line. Everyone you say can suffer, you would use at the same stakes, and no sooner one than another. That is what the Suffer rule asks: one day of pain counts the same, whoever has it. ';
  else s = 'Suffer has nothing to compare. ' + (t.yes.length === 1 ? 'Only ' + listPhrases(t.yes) + ' can suffer, you say, so there is no second being for Suffer to weigh it against. ' : 'You say none of the four can suffer, so by your answers there is no pain here to weigh at all. ');
  if (t.no.length) s += (t.objects || t.yes.length >= 2 ? 'And Singer' : 'But Singer') + ' disputes a fact: he says ' + listPhrases(t.no) + ' can suffer, ' + (t.no.length === 1 ? 'and feels' : 'and feel') + ' pain at least as much as a baby a few days old does. The dashed circle' + (t.no.length === 1 ? ' marks' : 's mark') + ' where you and he disagree about the fact.';
  return s;
}

// ---------- The name of the line ----------
// shape: refuse (nobody, at any price: Foot's question) | singer (equal, and all can suffer) | equal-no (equal, but the player denies some can suffer)
//        | line (a rule with marks gives the order) | species (animals sooner than people, no rule gives it) | own (anything else)
function shapeOf(th, answers) {
  var p = pattern(th), L = rulesAgreeing(th), st = sufferTest(th, answers || {});
  if (p === 'refuse') return { id: 'refuse', lines: [] };
  if (p === 'equal') return { id: st.no.length ? 'equal-no' : 'singer', lines: L };
  if (L.length) return { id: 'line', lines: L };
  if (p === 'species') return { id: 'species', lines: [] };
  return { id: 'own', lines: [] };
}
function shapeWords(th, answers) {
  var s = shapeOf(th, answers), w = { shape: s }, ids = CONFIG.SUBJECTS;
  var hum = ids.filter(function (id) { return castById(id).human; }), ani = ids.filter(function (id) { return !castById(id).human; });
  if (s.id === 'refuse') {
    w.name = 'No one, at any price'; w.headline = 'You would use nobody.';
    w.who = 'Not to spare a child a year of illness, not to save a life, not to save a thousand lives: you would not put any of the four through a day of pain. There is no order of use here for a rule to check, and no line between the four at all.';
    w.singer = 'Singer has no quarrel with you about animals: you treat the baby and the mouse exactly alike. Your disagreement with him is somewhere else. He would say that a day of pain for one, against a thousand lives, is a trade worth making, whoever has the pain; you say some things may not be done to anyone, whatever it buys. That is a different question, and a different paper: Philippa Foot\'s, which is also on this shelf.';
  } else if (s.id === 'singer') {
    w.name = 'Singer\'s line'; w.headline = 'You treated all four alike.';
    w.who = 'You would use every one of the four ' + thWords(th[ids[0]]) + ', and none of them sooner than another. And you say all four can suffer. So the pain of each counted the same with you, baby or mouse, and only the stakes moved you. Every rule agrees with that, because it is no order of use at all.';
    w.singer = 'That is Singer\'s line. He says it is the only line that is not drawn by hand: a day of pain is a day of pain, whoever has it. So whoever can suffer counts, and their pain counts as much as anyone\'s. Most people draw a different line: they would use the chimpanzee and the mouse long before they would use the baby. Keep that line in mind; it has a name, and the sponge is about to show it to you.';
  } else if (s.id === 'equal-no') {
    w.name = 'All alike, by your own answers'; w.headline = 'You treated all four alike.';
    w.who = 'You would use every one of the four ' + thWords(th[ids[0]]) + ', and none sooner than another. But you say ' + listPhrases(sufferTest(th, answers).no) + ' cannot suffer; by your own answers, then, you were not weighing pain against pain for all of them.';
    w.singer = 'Singer agrees with what you did and disagrees about a fact: he says every one of the four can suffer, the mouse at least as much as a baby a few days old. If he is right, your line is his.';
  } else if (s.id === 'line') {
    var labs = s.lines.map(function (id) { return rulerById(id).label; });
    w.name = 'A ' + labs[0] + ' line'; w.headline = labs.join(' and ') + ' agree' + (labs.length === 1 ? 's' : '') + ' with your line.';
    w.who = didWords(th) + ' ' + (labs.length === 1 ? labs[0] + ' gives that order' : labs.join(' and ') + ' both give that order') + ': whenever you would use one subject sooner than another, the one you use sooner has the lower mark. So a rule you can check gives your line; it is not drawn by hand. The question is whether it is the right rule.';
    w.singer = 'Singer says a line like that is straight, but in the wrong place. The ones you would use first ' + (labs[0] === 'Aware' ? 'know least about what is happening to them' : 'think least well') + ', but a day of bad pain hurts them exactly as much as it hurts the ones you would spare. Picking ' + labs[0] + ' to decide whose pain may be spent first is, he says, like picking skin colour: a mark that has nothing to do with being hurt.';
  } else if (s.id === 'species') {
    var firstA = ani.filter(function (id) { return th[id] === Math.min.apply(null, ani.map(function (x) { return th[x]; })); });
    w.name = 'Species'; w.headline = 'No rule gives your line.';
    var stS = sufferTest(th, answers || {});
    w.who = didWords(th) + ' So you would use the animals sooner than the people. Three rules with marks checked that order and every one objected: on each of them an animal you would use sooner has a higher mark than a person you would spare. ' + (stS.objects ? 'And Suffer objected too, because you said yourself that they can suffer. ' : (stS.no.length ? 'Suffer did not object, but only because you said ' + listPhrases(stS.no) + ' cannot suffer; Singer says ' + (stS.no.length === 1 ? 'it can' : 'they can') + ', and then Suffer would object as well. ' : '')) + 'No rule you can check gives this line. It has a name all the same. It is the line of the team you happen to be on: Species.';
    w.singer = '';
  } else {
    w.name = 'Your own order'; w.headline = 'No rule gives your line.';
    w.who = didWords(th) + ' No rule with marks gives that order, and it is not the team\'s order either, since you would not use every animal before every person. Singer would ask what the ones you would use first have in common. If you can name it, it is a rule, and the board can check it; if you cannot, it is a hand.';
    w.singer = 'His own answer is one rule: can it suffer? If it can, its pain counts as much as anyone\'s, and nobody who can suffer may be used sooner than another. Most people draw a different line, the team\'s; the sponge is about to show it to you.';
  }
  return w;
}

// ---------- The verdict ----------
// state: { ticks, answers, skins }
function verdict(state) {
  var th = thresholds(state.ticks || {}), w = shapeWords(th, state.answers), s = w.shape, st = sufferTest(th, state.answers || {});
  var paper = [
    'Whose pain may be spent, and whose must be spared? Singer\'s answer: if two beings can both suffer, neither may be used sooner than the other. Not because they are alike in any other way, but because a day of pain is a day of pain, whoever has it.',
    'The line most people draw, animals first and people only at the highest stakes or never, is given by no rule you can check. Reason, Talk and Aware all object to it, because the chimpanzee and the mouse have higher marks than the baby and the hurt grown-up, and Suffer objects to it too, because all four can suffer. That line is drawn by hand. The team you are on is not a rule.'
  ];
  var did = [didWords(th)];
  CONFIG.RULES.forEach(function (r) { did.push(ruleWords(th, r.id)); });
  did.push('Can they suffer? You said yes for ' + (st.yes.length ? listPhrases(st.yes) : 'none of them') + (st.no.length ? ', and no for ' + listPhrases(st.no) : '') + '. ' + sufferWords(th, state.answers));
  var found = ['Its name: ' + w.name + '. ' + w.who + (w.singer ? ' ' + w.singer : '')];
  var fate, part, stood;
  var two = 'Singer names two things that do not survive his line. Experiments on animals that nobody would do on a baby: he says almost none would be left, because almost no real experiment is the story you were told, with a thousand lives on the other side. And eating animals because they taste good: he says that should stop, since the pleasure of the taste is small and the pain behind it is not.';
  if (s.id === 'refuse') { fate = 'You would spend nobody\'s pain.'; part = ['Not about animals: you treated the baby and the mouse exactly alike, which is all Singer asks. You part from him on whether a day of pain for one may ever be traded for a thousand lives. He says yes; you say no. That is Foot\'s question, not his.']; stood = ['If you want to go on with that question, Philippa Foot\'s paper is on this shelf: the trolley, the surgeon, and what may not be done to one for the sake of many.', two]; }
  else if (s.id === 'singer') { fate = 'You drew Singer\'s line.'; part = ['Nowhere. You would use any of the four at the same stakes and none sooner than another, and you say all four can suffer. That is equal consideration, which is the whole of his paper.']; stood = [two]; }
  else if (s.id === 'equal-no') { fate = 'You treated all four alike.'; part = ['Only on a fact. You say ' + listPhrases(st.no) + ' cannot suffer; Singer says ' + (st.no.length === 1 ? 'it can' : 'they can') + ', at least as much as a baby a few days old. On what to do, you and he agree.']; stood = [two]; }
  else if (s.id === 'line') { fate = 'You drew a straight line in the wrong place.'; part = ['At the rule. A rule you can check gives your order of use, so it is not drawn by hand; but Singer says it is the wrong rule, as arbitrary as skin colour: the ones you would use first are hurt exactly as much as the ones you would spare.' + (st.objects ? ' And by your own answers they can all suffer, so Suffer objects to the order too.' : '')]; stood = [two]; }
  else if (s.id === 'species') { fate = 'Your hand drew the line, not a rule.'; part = ['At the line. You would use the animals sooner than the people, and no rule with marks gives that order; the only difference between the chimpanzee and the baby that fits what you did is the team each is on. Singer\'s word for spending pain by team is speciesism, and he says it is the same pattern as racism and sexism.' + (st.objects ? ' And you said yourself that the animals can suffer.' : (st.no.length ? ' You said ' + listPhrases(st.no) + ' cannot suffer; he says ' + (st.no.length === 1 ? 'it can' : 'they can') + '.' : ''))]; stood = ['Singer has one more thing for you to do. Say out loud why the chimpanzee may be used to save a life and the baby only to save a thousand. Then say it again, with "white" where you said "human" or "person" and "black" where you said "animal". He says what it sounds like the second time is the reason to give the line up.', two]; }
  else { fate = 'You drew your own order.'; part = ['At the line. No rule with marks gives your order of use, and it is not the team\'s order either. Singer would ask what the ones you would use first have in common; if you can name it, the board can check it.' + (st.objects ? ' And by your own answers, two beings you would use at different stakes can both suffer, so Suffer objects.' : '')]; stood = [two]; }
  return { fate: fate, paper: paper, did: did, found: found, part: part, stood: stood, name: w.name, th: th, shape: s };
}

if (typeof module !== 'undefined') module.exports = { CONFIG: CONFIG, NEVER: NEVER, castById: castById, rulerById: rulerById, levelById: levelById, listPhrases: listPhrases, drawSkins: drawSkins,
  thresholds: thresholds, thWords: thWords, didWords: didWords, pattern: pattern, ruleTest: ruleTest, rulesAgreeing: rulesAgreeing, ruleWords: ruleWords,
  sufferTest: sufferTest, sufferWords: sufferWords, shapeOf: shapeOf, shapeWords: shapeWords, verdict: verdict };
