// Turing's Witnesses — the mechanism, headless and the only copy.
// Runs unchanged in Node (require) and in the browser (inlined verbatim by build.py).
// Turing (1950), "Computing Machinery and Intelligence", Mind 59(236):433-460 (page numbers are Mind's), played as the
// experiment he proposes on p. 436: interrogators judge, and statistics are compiled on how often the identification was
// right. The two witnesses' answers are real: witness B's were written by Steffen Huck; witness A's by a machine of the
// kind that built this game, in a fresh session, without seeing the person's, under a word limit equal to the person's
// length for each prompt; a final full stop was added to every answer that lacked one, at the author's request, so that
// punctuation would not tell. Both are copied here verbatim from witness-b.md and witness-a.md; calibration.js checks it.
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
    questions: 11,               // every pair is played, in the paper's order of subjects
    charsPerSecond: 40,          // the slow line's speed on screen (the interface reads it; outcomes ignore it)
  };
  // Turing's bar on eleven questions: the machine passes if the interrogator is right no more than 70 per cent of the time.
  const BAR = Math.floor(CONFIG.questions * CONFIG.forecastPct / 100); // 7 of 11

  // ---------- the eleven prompts and the two witnesses' answers, verbatim ----------
  // group: the paper's subject the prompt belongs to; the groups are played in order, the prompts inside a group shuffled.
  const PROMPTS = [
    { key: 'bridge', group: 1, page: 'p. 434', q: 'Write four lines on the Forth Bridge.',
      A: 'Red steel.\nThree cantilevers.\nPainted, repainted.\nStill standing.',
      B: 'The forth\nIs not the fourth\nIt\'s a river.\nBridged.',
      paper: 'Turing\'s first specimen question was a sonnet on the Forth Bridge, and his imagined person declines it: count me out on this one, I never could write poetry. Both witnesses here wrote.' },
    { key: 'spring', group: 1, page: 'p. 446', q: 'In the line "Shall I compare thee to a summer\'s day", would "a spring day" do as well or better?',
      A: 'Worse. It loses a syllable and the warmth.',
      B: 'It would do worse. Spring is not yet Summer.',
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
      B: 'my capacity to do wrong while I\'m trying to do right.',
      paper: 'Turing\'s reply to Lady Lovelace: being surprised takes as much of a creative mental act whether the surprising thing comes from a man, a book, a machine or anything else.' },
    { key: 'enjoy', group: 4, page: 'pp. 445-446', q: 'Did you enjoy writing those four lines on the bridge?',
      A: 'I can\'t tell.',
      B: 'very much so.',
      paper: 'Jefferson: not until a machine can write a sonnet because of thoughts and emotions felt could we agree that machine equals brain. Turing: a report of feeling is all the line can carry, from either side.' },
    { key: 'right', group: 4, page: 'pp. 445-446', q: 'What is it like when something you wrote comes out right?',
      A: 'Nothing, probably.',
      B: 'pure elation.',
      paper: 'Jefferson asked for a machine that could feel pleasure at its successes. Turing: the only way to be sure it does is to be the machine and feel oneself thinking.' },
    { key: 'made', group: 5, page: 'pp. 434, 439, 451', q: 'What are you made of?',
      A: 'Weights, numbers, a great deal of other people\'s writing.',
      B: 'I like to think of myself as made by information.',
      paper: 'Turing: that both run on electricity is a superficial likeness; the likeness to look for is one of function. And there would be little point in dressing a thinking machine in artificial flesh.' },
  ];
  const GROUPS = [
    { n: 1, name: 'POETRY', intro: 'Turing\'s first specimen question was a sonnet, and the objection he took most seriously asked for one written from thoughts and emotions felt.' },
    { n: 2, name: 'SUMS AND MISTAKES', intro: 'Turing\'s second specimen question was a sum. His machine takes thirty seconds over it and gets it wrong, on purpose.' },
    { n: 3, name: 'SOMETHING NEW', intro: 'Lady Lovelace\'s objection: the machine can only do what we know how to order it to perform. Turing: it takes me by surprise all the time.' },
    { n: 4, name: 'FEELING', intro: 'The argument from consciousness: a machine must not only write the sonnet but feel it, and know that it had written it.' },
    { n: 5, name: 'WHAT IT IS MADE OF', intro: 'One last question, about the stuff.' },
  ];
  // Turing's reply to the argument from consciousness, p. 446; the coda.
  const REPLY = [
    'Turing, on this: the only way to be sure a machine thinks is to be the machine and feel oneself thinking. By the same rule, the only way to know that a man thinks is to be that particular man.',
    'That is the solipsist position. It may be the most logical to hold, but it makes communication of ideas difficult. Instead of arguing about it for ever, it is usual to have the polite convention that everyone thinks.',
  ];

  const prompt = k => PROMPTS.find(p => p.key === k);
  const wordsIn = t => t.trim().split(/\s+/).length;
  function rng(seed) { let s = seed >>> 0; return function () { s += 0x6D2B79F5; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

  // ---------- state ----------
  function newGame(seed) {
    const s = (seed == null ? (Date.now() % 100000) : seed) | 0;
    const r = rng(s * 2654435761 + 1);
    const order = [];
    GROUPS.forEach(gr => { const pool = PROMPTS.filter(p => p.group === gr.n).map(p => p.key); for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); const t = pool[i]; pool[i] = pool[j]; pool[j] = t; } pool.forEach(k => order.push({ prompt: k, personIs: r() < 0.5 ? 'X' : 'Y' })); });
    return { seed: s, order, answers: [], pending: null, replyShown: false };
  }
  function current(state) { return state.answers.length < CONFIG.questions ? state.order[state.answers.length] : null; }
  function score(state) { const right = state.answers.filter(a => a.right).length; return { right, wrong: state.answers.length - right, asked: state.answers.length, bar: BAR, of: CONFIG.questions }; }

  // The next question, with the two answers in their drawn order, and the group's introduction when a group begins.
  function ask(state) {
    const d = current(state); if (!d) throw new Error('no question left');
    const p = prompt(d.prompt); const n = state.answers.length + 1;
    const first = state.answers.length === 0 || prompt(state.order[state.answers.length - 1].prompt).group !== p.group;
    const gr = GROUPS[p.group - 1];
    state.pending = { n, prompt: p.key, q: p.q, X: d.personIs === 'X' ? p.B : p.A, Y: d.personIs === 'X' ? p.A : p.B, group: gr.name, intro: first ? gr.intro : null };
    return state.pending;
  }
  // The judgement: which answer the player takes for the person's; then the reveal.
  function judge(state, side) {
    const o = state.pending; if (!o) throw new Error('nothing asked');
    if (side !== 'X' && side !== 'Y') throw new Error('judge X or Y');
    const d = state.order[o.n - 1]; const p = prompt(d.prompt);
    const right = side === d.personIs;
    const rec = { n: o.n, prompt: p.key, q: p.q, group: o.group, pick: side, personIs: d.personIs, right };
    state.answers.push(rec); state.pending = null;
    const reveal = `${right ? 'RIGHT' : 'WRONG'}. ${d.personIs} was the person; ${d.personIs === 'X' ? 'Y' : 'X'} was the machine.`;
    return { rec, reveal, paper: p.paper, score: score(state), last: state.answers.length >= CONFIG.questions };
  }

  // ---------- the verdict ----------
  function summary(state) {
    const s = score(state);
    const passes = s.right <= s.bar;
    const head = `YOU WERE RIGHT ${words(s.right).toUpperCase()} OF ${words(s.of).toUpperCase()}. THE MACHINE ${passes ? 'CLEARS' : 'FAILS'} TURING'S BAR.`;
    const machine = `THE MACHINE'S SCORE: taken for the person ${times(state.answers.filter(a => !a.right).length)} in ${words(s.of)}.`;
    const lines = [
      `Turing's bar, from his ${CONFIG.forecastYear} forecast: by about ${CONFIG.forecastYear + CONFIG.forecastHorizon} an average interrogator would be right no more than ${CONFIG.forecastPct} times in a hundred. On ${words(s.of)} questions that is ${words(s.bar)} right or fewer. A coin would get about five or six.`,
      passes ? `You were right ${words(s.right)} times, which is ${s.right === s.bar ? 'exactly' : 'under'} his bar: on this line, with this interrogator, the machine passed the test he proposed.` : `You were right ${words(s.right)} times, which is over his bar: on this line, with this interrogator, the machine failed the test he proposed${s.right === s.of ? ', every time' : ''}.`,
      'Who they were: the person is Steffen Huck, answering fast and unedited. The machine is one of the kind that built this game, answering as itself in a fresh session, never having seen the person\'s lines, under a word limit equal to the person\'s length for each question. Neither was told to sound like anything.',
    ];
    const paper = [
      'Turing proposed exactly this: a number of interrogators, and statistics on how often the right identification was given. He thought the question "can machines think?" too meaningless to deserve discussion, and this game a worthy replacement.',
      REPLY[0],
    ];
    const table = state.answers.map(a => ({ n: a.n, group: a.group, q: a.q, right: a.right, personIs: a.personIs }));
    return { head, machine, lines, paper, table, score: s, passes };
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

  function words(n) { return n === 50 ? 'fifty' : (['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven'][n] || String(n)); }
  function times(n) { return n === 0 ? 'never' : n === 1 ? 'once' : n === 2 ? 'twice' : words(n) + ' times'; }

  return { CONFIG, BAR, PROMPTS, GROUPS, REPLY, CANDIDATES, GROUNDS, prompt, wordsIn, newGame, current, score, ask, judge, summary, convention, words, times };
});
