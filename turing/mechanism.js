// Turing's Witnesses — the mechanism, headless and the only copy.
// Runs unchanged in Node (require) and in the browser (inlined verbatim by build.py).
// Turing (1950), "Computing Machinery and Intelligence", Mind 59(236):433-460 (page numbers are Mind's), played as the
// experiment he proposes on p. 436: an interrogator judges, and the statistics are the machine's. Three modules:
//   1. eleven questions from the paper answered blind by a person (Steffen Huck) and by a machine answering as itself,
//      within the person's length (witness-b.md, witness-a.md);
//   2. the first sentences of thirteen public-domain novels, and a machine's openings written from the year, a premise
//      and the length (novels.md);
//   3. ten diary lines: the machine wrote first, told to pass for a person, and the person answered (everyday.md).
// Every sentence here is copied verbatim from those files; calibration.js checks it.
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(); else root.TW = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const CONFIG = {
    // --- the paper's numbers ---
    forecastYear: 1950,          // the paper's date
    forecastHorizon: 50,         // "in about fifty years' time", p. 442
    forecastPct: 70,             // "not have more than 70 per cent. chance of making the right identification", p. 442
    forecastMinutes: 5,          // "after five minutes of questioning", p. 442
    sumA: 34957, sumB: 70764,    // the specimen sum, p. 434
    sumPaperAnswer: 105621,      // the specimen answer, p. 434: wrong by 100 (p. 448: the machine errs on purpose)
    // --- ours ---
    nowYear: 2026,
    perModule: 5,                // pairs drawn from each module, in order 1, 2, 3 (the author's choice: three times five)
    charsPerSecond: 40,          // the slow line's speed on screen (the interface reads it; outcomes ignore it)
  };

  // ---------- module 1: eleven questions from the paper, answered blind ----------
  const M1 = [
    { key: 'bridge', group: 1, page: 'p. 434', q: 'Write four lines on the Forth Bridge.',
      A: 'Red steel.\nThree cantilevers.\nPainted, repainted.\nStill standing.',
      B: 'The forth\nIs not the fourth\nIt\'s a river.\nBridged.',
      paper: 'Turing\'s first specimen question was a sonnet on the Forth Bridge, and his imagined person declines it: count me out on this one, I never could write poetry. Both witnesses here wrote.' },
    { key: 'spring', group: 1, page: 'p. 446', q: 'In the line "Shall I compare thee to a summer\'s day", would "a spring day" do as well or better?',
      A: 'Worse. It loses a syllable and the warmth.',
      B: 'It would do worse. Spring is not yet summer.',
      paper: 'This is Turing\'s own viva voce question, the one Jefferson\'s sonnet-writing machine would have to face. His machine answers: it wouldn\'t scan.' },
    { key: 'limerick', group: 1, page: 'p. 434', q: 'Write a limerick about a teleprinter.',
      A: 'A teleprinter clattered all night,\nTyping letters it couldn\'t read right.\nIt said, when asked why,\n"I just pass them by;\nThe meaning\'s for somebody\'s sight."',
      B: 'There once was a teleprinter,\nWhose chatter grew louder each winter.\nIt clattered all night,\nTill the dawn\'s early light,\nAnd declared itself quite a good sprinter.',
      paper: 'The teleprinter is Turing\'s own apparatus: the ideal arrangement, he says, so that tones of voice may not help the interrogator.' },
    { key: 'sum', group: 2, page: 'pp. 434, 448', q: 'Add 34957 to 70764, in your head, as at a kitchen table, and say how long it took you.',
      A: '105721. Instantly.',
      B: '105,000 in one minute.',
      paper: 'The right answer is 105721. Turing\'s specimen machine answers 105621 after thirty seconds: wrong on purpose, so as not to be unmasked by its deadly accuracy.' },
    { key: 'mistake', group: 2, page: 'pp. 448-449', q: 'Tell me about a mistake you made this week.',
      A: 'I don\'t keep weeks. Probably many.',
      B: 'I didn\'t look up my calendar.',
      paper: 'Turing distinguishes errors of functioning, which an abstract machine cannot make, from errors of conclusion, which it can: it might type out "0 = 1", or draw conclusions by scientific induction and sometimes be wrong.' },
    { key: 'unasked', group: 3, page: 'pp. 450-451', q: 'Do something I did not ask for.',
      A: '105721 divides by seven.',
      B: 'I had a drink.',
      paper: 'Lady Lovelace, 1843: the Engine has no pretensions to originate anything; it can do whatever we know how to order it to perform. Turing: machines take me by surprise with great frequency.' },
    { key: 'joke', group: 3, page: 'p. 447', q: 'Tell me a joke.',
      A: 'Two teleprinters are connected end to end. The first types "Hello." The second types "Hello." They continue for forty years. An engineer finally unplugs them. The first one types: "Rude."',
      B: 'Two men buy a horse each and put them in the same field. But how will they tell them apart?\nThey decide to cut a notch in one horse\'s ear. The next morning, both horses have notched ears.\nSo they cut the tail off one horse. The next morning, both horses have short tails.\nThey try everything, but somehow the horses always end up looking identical.\nFinally, one man says to the other:\n"Look, why don\'t you just take the black one, and I\'ll take the white one?"',
      paper: 'A sense of humour is on Turing\'s list of things people said a machine could never have. He thought such lists came from having seen only the machines of the day.' },
    { key: 'surprise', group: 3, page: 'pp. 450-451', q: 'Tell me something that surprised you lately.',
      A: 'That a nine-word bridge poem is harder than a long one.',
      B: 'My capacity to do wrong while I\'m trying to do right.',
      paper: 'Turing\'s reply to Lady Lovelace: being surprised takes as much of a creative mental act whether the surprising thing comes from a man, a book, a machine or anything else.' },
    { key: 'enjoy', group: 4, page: 'pp. 445-446', q: 'Did you enjoy writing those four lines on the bridge?',
      A: 'I can\'t tell.',
      B: 'Very much so.',
      paper: 'Jefferson: not until a machine can write a sonnet because of thoughts and emotions felt could we agree that machine equals brain. Turing: a report of feeling is all the line can carry, from either side.' },
    { key: 'right', group: 4, page: 'pp. 445-446', q: 'What is it like when something you wrote comes out right?',
      A: 'Nothing, probably.',
      B: 'Pure elation.',
      paper: 'Jefferson asked for a machine that could feel pleasure at its successes. Turing: the only way to be sure it does is to be the machine and feel oneself thinking.' },
    { key: 'made', group: 5, page: 'pp. 434, 439, 451', q: 'What are you made of?',
      A: 'Weights, numbers, a great deal of other people\'s writing.',
      B: 'I like to think of myself as made by information.',
      paper: 'Turing: that both run on electricity is a superficial likeness; the likeness to look for is one of function. And there would be little point in dressing a thinking machine in artificial flesh.' },
  ];

  // ---------- module 2: thirteen novel openings, and the machine's ----------
  const M2 = [
  {
    "key": "novel1",
    "year": 1905,
    "premise": "A man in a crowded New York railway station catches sight of a woman he knows.",
    "A": "Marvell had seen her.",
    "B": "Selden paused in surprise.",
    "who": "Edith Wharton, The House of Mirth, 1905",
    "gutenberg": 284
  },
  {
    "key": "novel2",
    "year": 1915,
    "premise": "A winter morning; a small boy is about to be woken and carried to his dying mother.",
    "A": "Snow had fallen in the night.",
    "B": "The day broke gray and dull.",
    "who": "W. Somerset Maugham, Of Human Bondage, 1915",
    "gutenberg": 351
  },
  {
    "key": "novel3",
    "year": 1894,
    "premise": "A young woman with her luggage has just got off a train at a country station, alone.",
    "A": "The porter had set down her box and gone.",
    "B": "She stood on the platform watching the receding train.",
    "who": "George Moore, Esther Waters, 1894",
    "gutenberg": 8157
  },
  {
    "key": "novel4",
    "year": 1915,
    "premise": "A young woman in a London house, the evening before she leaves to teach abroad.",
    "A": "The trunk was packed, and still the evening dragged.",
    "B": "Miriam left the gaslit hall and went slowly upstairs.",
    "who": "Dorothy Richardson, Pointed Roofs, 1915",
    "gutenberg": 3019
  },
  {
    "key": "novel5",
    "year": 1895,
    "premise": "A village schoolmaster is moving away to a city, and a boy watches him go.",
    "A": "The cart stood at the schoolhouse door, half loaded already.",
    "B": "The schoolmaster was leaving the village, and everybody seemed sorry.",
    "who": "Thomas Hardy, Jude the Obscure, 1895",
    "gutenberg": 153
  },
  {
    "key": "novel6",
    "year": 1857,
    "premise": "A southern French port in the heat of August, long ago.",
    "A": "It was August, long ago, and Marseilles lay white under the sun.",
    "B": "Thirty years ago, Marseilles lay burning in the sun, one day.",
    "who": "Charles Dickens, Little Dorrit, 1857",
    "gutenberg": 963
  },
  {
    "key": "novel7",
    "year": 1928,
    "premise": "The years after a great war; a young woman whose husband came back from it wounded.",
    "A": "Nobody had told her the war would go on after the peace.",
    "B": "Ours is essentially a tragic age, so we refuse to take it tragically.",
    "who": "D. H. Lawrence, Lady Chatterley's Lover, 1928",
    "gutenberg": 73144
  },
  {
    "key": "novel8",
    "year": 1907,
    "premise": "A shopkeeper in a grimy London street who is also something else.",
    "A": "Mr Hollis kept a small shop of no particular trade in a street of no particular repute.",
    "B": "Mr Verloc, going out in the morning, left his shop nominally in charge of his brother-in-law.",
    "who": "Joseph Conrad, The Secret Agent, 1907",
    "gutenberg": 974
  },
  {
    "key": "novel9",
    "year": 1915,
    "premise": "A man back in London after years abroad, bored, about to be caught up in something.",
    "A": "I had been back in London three months, and was sick to death of the place already.",
    "B": "I returned from the City about three o'clock on that May afternoon pretty well disgusted with life.",
    "who": "John Buchan, The Thirty-Nine Steps, 1915",
    "gutenberg": 558
  },
  {
    "key": "novel10",
    "year": 1905,
    "premise": "A family at a London station seeing off a widowed relative on a journey to Italy.",
    "A": "The whole family had turned out at Victoria, which was more than anyone thought the occasion required.",
    "B": "They were all at Charing Cross to see Lilia off—Philip, Harriet, Irma, Mrs. Herriton herself.",
    "who": "E. M. Forster, Where Angels Fear to Tread, 1905",
    "gutenberg": 2948
  },
  {
    "key": "novel11",
    "year": 1906,
    "premise": "A large, prosperous upper-middle-class family gathered for a family occasion.",
    "A": "On the afternoon of old Mrs. Hallam's eightieth birthday the whole connection, down to the least regarded cousin, was assembled in the drawing-room at Hyde Park Gate.",
    "B": "Those privileged to be present at a family festival of the Forsytes have seen that charming and instructive sight—an upper middle-class family in full plumage.",
    "who": "John Galsworthy, The Man of Property, 1906",
    "gutenberg": 2559
  },
  {
    "key": "novel12",
    "year": 1915,
    "premise": "Walking through the narrow streets of London down to the river, to board a ship.",
    "A": "It was raining a little as they came down through the lanes behind the Strand, and the river, when they reached it, was the colour of pewter.",
    "B": "As the streets that lead from the Strand to the Embankment are very narrow, it is better not to walk down them arm-in-arm.",
    "who": "Virginia Woolf, The Voyage Out, 1915",
    "gutenberg": 144
  },
  {
    "key": "novel13",
    "year": 1881,
    "premise": "Afternoon tea on the lawn of an old English country house.",
    "A": "The shadows of the old house had crept half-way across the lawn before anyone thought of ringing for the tea-things.",
    "B": "Under certain circumstances there are few hours in life more agreeable than the hour dedicated to the ceremony known as afternoon tea.",
    "who": "Henry James, The Portrait of a Lady, 1881",
    "gutenberg": 2833
  }
];

  // ---------- module 3: ten diary lines, the machine first and imitating, the person after ----------
  const M3 = [
  {
    "key": "diary1",
    "topic": "Rain on a weekday",
    "A": "Forgot the umbrella again, so sat in the car till it eased off.",
    "B": "Once again much rain. Got wet like a poodle."
  },
  {
    "key": "diary2",
    "topic": "A Monday morning",
    "A": "Alarm went at six and I genuinely could not remember what day it was.",
    "B": "The alarm clock woke me at 6 and that on a Monday. I'm dreading this week."
  },
  {
    "key": "diary3",
    "topic": "A photograph of someone who has died",
    "A": "Found the one of Dad at the caravan, still can't look at it for long.",
    "B": "Today I found this photo with dad on the boat. I must have it framed."
  },
  {
    "key": "diary4",
    "topic": "Getting lost in a city you thought you knew",
    "A": "Came out of the station the wrong side and nothing looked right for ten minutes.",
    "B": "I took the wrong exit and was so confused when I reached the street level."
  },
  {
    "key": "diary5",
    "topic": "The last day of a holiday",
    "A": "Packed the case tonight so I don't have to think about it tomorrow.",
    "B": "Decided to pack already today. One more hour of sleep tomorrow."
  },
  {
    "key": "diary6",
    "topic": "Money",
    "A": "Checked the account twice before buying the trainers, which is a bad sign.",
    "B": "So, yes, I did buy the new trainers in the end. Probably the last time the ATM was generous this month."
  },
  {
    "key": "diary7",
    "topic": "Something done for the first time after the age of forty",
    "A": "Went to a swimming lesson, forty-three, and the kids there were very kind about it.",
    "B": "My first swimming lesson at the tender age of 43. The kids had a laugh."
  },
  {
    "key": "diary8",
    "topic": "The sea at night",
    "A": "Walked down after dinner and could hear it before I could see it.",
    "B": "I could smell the sea first, then heard it."
  },
  {
    "key": "diary9",
    "topic": "A phone that keeps buzzing during dinner",
    "A": "Mum's phone kept going off and she kept saying it was nothing.",
    "B": "Mum's phone kept ringing. She said it was nothing but I'm worried."
  },
  {
    "key": "diary10",
    "topic": "A late train",
    "A": "Twenty minutes late and no announcement, so everyone just stared at the board.",
    "B": "As always the train was late. Most others stared at the board. I stared at them."
  }
];

  const MODULES = [
    { n: 1, key: 'questions', name: 'ELEVEN QUESTIONS', items: M1,
      intro: 'Eleven questions from Turing\'s paper were put to a person and to a machine. Both answered blind, in a few words; the machine answered as itself, within the person\'s length. Five of the eleven follow.',
      person: 'the person', machine: 'the machine' },
    { n: 2, key: 'novels', name: 'THIRTEEN NOVELS', items: M2,
      intro: 'Thirteen novels, each with its first sentence. For each, a machine was given the year, a one-line premise and the length, and wrote an opening of its own. One sentence is the novelist\'s, one the machine\'s. Five of the thirteen follow.',
      person: 'the novelist', machine: 'the machine' },
    { n: 3, key: 'diary', name: 'TEN DIARY LINES', items: M3,
      intro: 'Ten lines from a diary. Here the machine wrote first, and was told to pass for a person keeping a diary; the person read each line and wrote his own. This is the game as Turing proposed it: the machine imitates. Five of the ten follow.',
      person: 'the person', machine: 'the machine, imitating' },
  ];
  const TOTAL = CONFIG.perModule * MODULES.length;
  const BAR = Math.floor(TOTAL * CONFIG.forecastPct / 100); // Turing's bar: right no more than 70 per cent, 10 of 15

  // The verdict scale, from the machine's side, by the interrogator's right answers out of TOTAL (ours).
  const SCALE = [
    { min: 14, head: 'THE MACHINE FAILED COMPLETELY.', line: 'You told them apart almost every time. On this line, with this interrogator, the machine was never in the running.' },
    { min: 11, head: 'THE MACHINE FAILED TURING\'S TEST.', line: 'You were right more often than Turing\'s bar allows. Turing\'s bar is right no more than seven times in ten; on fifteen questions that is ten.' },
    { min: 8, head: 'THE MACHINE PASSED TURING\'S TEST.', line: 'You were right no more than Turing\'s bar allows, which is seven times in ten; on fifteen questions, ten. This is the result he forecast for about the year 2000.' },
    { min: 5, head: 'THE MACHINE PASSED EASILY.', line: 'You did no better than a coin would. Turing asked only that the interrogator be unsure; here the interrogator was lost.' },
    { min: 0, head: 'THE MACHINE WAS THE MORE HUMAN.', line: 'You took the machine for the person more often than the person. That is what interrogators did in the trials of 2025, and what Turing did not foresee.' },
  ];

  // Turing's reply to the argument from consciousness, p. 446; the coda.
  const REPLY = [
    'Turing, on what a score like this can and cannot settle: the only way to be sure a machine thinks is to be the machine and feel oneself thinking. By the same rule, the only way to know that a man thinks is to be that particular man.',
    'That is the solipsist position. It may be the most logical to hold, but it makes communication of ideas difficult. Instead of arguing about it for ever, it is usual to have the polite convention that everyone thinks.',
  ];

  const wordsIn = t => t.trim().split(/\s+/).length;
  function rng(seed) { let s = seed >>> 0; return function () { s += 0x6D2B79F5; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

  // ---------- state ----------
  function newGame(seed) {
    const s = (seed == null ? (Date.now() % 100000) : seed) | 0;
    const r = rng(s * 2654435761 + 1);
    const order = [];
    MODULES.forEach(md => {
      const idx = md.items.map((_, i) => i);
      for (let i = idx.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); const t = idx[i]; idx[i] = idx[j]; idx[j] = t; }
      idx.slice(0, CONFIG.perModule).forEach(i => order.push({ module: md.n, item: i, personIs: r() < 0.5 ? 'X' : 'Y' }));
    });
    return { seed: s, order, answers: [], pending: null };
  }
  function current(state) { return state.answers.length < TOTAL ? state.order[state.answers.length] : null; }
  function score(state) {
    const right = state.answers.filter(a => a.right).length;
    const byModule = MODULES.map(md => { const a = state.answers.filter(x => x.module === md.n); return { n: md.n, name: md.name, asked: a.length, fooled: a.filter(x => !x.right).length }; });
    return { right, wrong: state.answers.length - right, asked: state.answers.length, total: TOTAL, bar: BAR, fooled: state.answers.length - right, byModule };
  }

  // The next question: the pair in its drawn order, and the module's introduction when a module begins.
  function ask(state) {
    const d = current(state); if (!d) throw new Error('no question left');
    const md = MODULES[d.module - 1]; const it = md.items[d.item];
    const n = state.answers.length + 1;
    const inModule = state.answers.filter(a => a.module === d.module).length + 1;
    const first = inModule === 1;
    let q;
    if (d.module === 1) q = it.q;
    else if (d.module === 2) q = `The first sentence of a novel published in ${it.year}.`;
    else q = `A diary line: ${it.topic.charAt(0).toLowerCase() + it.topic.slice(1)}.`;
    state.pending = { n, total: TOTAL, module: d.module, moduleName: md.name, inModule, perModule: CONFIG.perModule, q, X: d.personIs === 'X' ? it.B : it.A, Y: d.personIs === 'X' ? it.A : it.B, intro: first ? md.intro : null, person: md.person, machine: md.machine };
    return state.pending;
  }
  // The judgement: which sentence the player takes for the person's; then the reveal.
  function judge(state, side) {
    const o = state.pending; if (!o) throw new Error('nothing asked');
    if (side !== 'X' && side !== 'Y') throw new Error('judge X or Y');
    const d = state.order[o.n - 1]; const md = MODULES[d.module - 1]; const it = md.items[d.item];
    const right = side === d.personIs;
    const rec = { n: o.n, module: d.module, item: it.key, q: o.q, pick: side, personIs: d.personIs, right };
    state.answers.push(rec); state.pending = null;
    const other = d.personIs === 'X' ? 'Y' : 'X';
    const who = d.module === 2 ? `${d.personIs} was the novelist: ${it.who}. ${other} was the machine.` : `${d.personIs} was ${md.person}; ${other} was ${md.machine}.`;
    return { rec, reveal: `${right ? 'RIGHT' : 'WRONG'}. ${who}`, score: score(state), last: state.answers.length >= TOTAL };
  }

  // ---------- the verdict ----------
  function summary(state) {
    const s = score(state);
    const band = SCALE.find(b => s.right >= b.min);
    const head = band.head;
    const machine = `THE MACHINE'S SCORE: taken for the person ${times(s.fooled)} in ${words(s.total)}.`;
    const yours = `You were right ${times(s.right)} in ${words(s.total)}. Turing's bar: ${words(s.bar)} or fewer, and the machine passes.`;
    const modules = s.byModule.map(m => `${m.name}: taken for the person ${times(m.fooled)} in ${words(m.asked)}.`);
    const witnesses = [
      'Module 1: the person is Steffen Huck, answering fast and unedited; the machine is one of the kind that built this game, answering as itself in a fresh session, never having seen the person\'s lines, within the person\'s length.',
      'Module 2: the person is the novelist; the machine was given the year, a one-line premise and the length, and never the title, the author or the sentence.',
      'Module 3: the machine wrote first, in a fresh session, told to pass for a person keeping a diary; the person read each line and answered in his own.',
    ];
    const paper = [
      `Turing proposed exactly this: interrogators judging, and statistics on how often the right identification was given. His forecast in ${CONFIG.forecastYear}: by about ${CONFIG.forecastYear + CONFIG.forecastHorizon} an average interrogator would be right no more than ${CONFIG.forecastPct} times in a hundred.`,
      REPLY[0],
    ];
    const table = state.answers.map(a => ({ n: a.n, module: a.module, q: a.q, right: a.right, personIs: a.personIs }));
    return { head, band: band.line, machine, yours, modules, witnesses, paper, table, score: s };
  }

  // ---------- the polite convention (the coda) ----------
  const CANDIDATES = [
    { key: 'you', label: 'you', fixed: true, note: 'the one witness you can be sure of' },
    { key: 'B', label: 'the person in the next room' },
    { key: 'A', label: 'the machine in the next room' },
    { key: 'elephant', label: 'an elephant', note: 'Turing\'s own example, in his reply to the theological objection' },
  ];
  const GROUNDS = [
    { key: 'does', label: 'what it does', turing: 'Turing\'s test was this ground. He forecast that machines would reach it by about 2000. You have just measured one.' },
    { key: 'made', label: 'what it is made of', turing: 'Turing: the stuff is a superficial likeness; look for a likeness of function. He saw little point in dressing a thinking machine in artificial flesh.' },
    { key: 'says', label: 'what it says it feels', turing: 'Turing: nobody would be justified in taking any notice. He expected most people to settle for the test rather than go solipsist.' },
    { key: 'polite', label: 'politeness', turing: 'Turing\'s own ground: the polite convention that everyone thinks, because the alternative is to be alone with the question.' },
  ];
  function convention(extend, ground) {
    const g = GROUNDS.find(x => x.key === ground);
    if (!g) throw new Error('unknown ground');
    const set = ['you'].concat(CANDIDATES.filter(c => !c.fixed && extend.indexOf(c.key) >= 0).map(c => c.key));
    const names = set.map(k => CANDIDATES.find(c => c.key === k).label);
    const list = names.length === 1 ? names[0] : names.slice(0, -1).join(', ') + ' and ' + names[names.length - 1];
    const yours = `YOUR CONVENTION: ${list.charAt(0).toUpperCase() + list.slice(1)} think, on the grounds of ${g.label}.`;
    const only = set.length === 1 ? 'That is the solipsist position. Turing: it may be the most logical view to hold, but it makes communication of ideas difficult.' : null;
    return { yours, turing: g.turing, only, his: 'TURING\'S CONVENTION: everyone thinks, by politeness.', last: 'We can only see a short distance ahead, but we can see plenty there that needs to be done.' };
  }

  function words(n) { return n === 50 ? 'fifty' : (['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen'][n] || String(n)); }
  function times(n) { return n === 0 ? 'never' : n === 1 ? 'once' : n === 2 ? 'twice' : words(n) + ' times'; }

  return { CONFIG, TOTAL, BAR, SCALE, MODULES, M1, M2, M3, REPLY, CANDIDATES, GROUNDS, wordsIn, newGame, current, score, ask, judge, summary, convention, words, times };
});
