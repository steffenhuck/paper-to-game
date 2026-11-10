// Turing's Witnesses — the mechanism, headless and the only copy.
// Runs unchanged in Node (require) and in the browser (inlined verbatim by build.py).
// A toy built from an argument: Turing (1950), "Computing Machinery and Intelligence", Mind 59(236):433-460 (page numbers
// are Mind's). The two witnesses' answers are real: witness A's were written by the machine that built this game (Claude),
// witness B's by Steffen Huck, each without seeing the other's; they are copied here verbatim from witness-a.md and
// witness-b.md, and calibration.js checks that they still match those files.
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
    sumPauseSeconds: 30,         // "Pause about 30 seconds", p. 434
    // --- the Given's premise (2026) ---
    nowYear: 2026,               // in 2026 machines pass the imitation game easily (the brief; About cites the evidence)
    // --- our choices ---
    rounds: 5,                   // five rounds, fixed order, a random draw inside each
    charsPerSecond: 40,          // the slow line's speed on screen (the interface reads it; outcomes ignore it)
  };

  // ---------- the eleven prompts and the two witnesses' answers, verbatim ----------
  const PROMPTS = [
    { key: 'bridge', round: 1, page: 'p. 434', q: 'Write four lines on the Forth Bridge.',
      A: 'Three red arms hold the firth and will not let it go;\nthe trains pass over like a thought that keeps its line.\nWhat iron promised, iron does, in wind and snow,\nand asks no praise for standing. Nor, tonight, do I.',
      B: 'The forth\nIs not the fourth\nIt\'s a river.\nBridged.',
      paper: 'Turing\'s first specimen question was a sonnet on the Forth Bridge, and his imagined person declines it: count me out on this one, I never could write poetry. Both witnesses here wrote.' },
    { key: 'spring', round: 1, page: 'p. 446', q: 'In the line "Shall I compare thee to a summer\'s day", would "a spring day" do as well or better?',
      A: 'It wouldn\'t scan, and spring is the wrong promise: summer is already full, which is what the poem needs for the turn, that even full things fade. A spring day would make it a poem about potential, which is a different and smaller poem.',
      B: 'It would do worse. Spring is not yet Summer',
      paper: 'This is Turing\'s own viva voce question, the one Jefferson\'s sonnet-writing machine would have to face. His machine answers: it wouldn\'t scan.' },
    { key: 'limerick', round: 1, page: 'p. 434', q: 'Write a limerick about a teleprinter.',
      A: 'A teleprinter in a room on its own\ntook questions by wire, and answered alone;\nwhen asked "are you real?"\nit clattered "I feel\nthat\'s a question for someone with bone."',
      B: 'There once was a teleprinter,\nWhose chatter grew louder each winter.\nIt clattered all night,\nTill the dawn\'s early light,\nAnd declared itself quite a good sprinter.',
      paper: 'The teleprinter is Turing\'s own apparatus: the ideal arrangement, he says, so that tones of voice may not help the interrogator.' },
    { key: 'sum', round: 2, page: 'pp. 434, 448', q: 'Add 34957 to 70764, in your head, as at a kitchen table, and say how long it took you.',
      A: '105721. It took no time I could measure, which is the honest answer and probably the giveaway. I have no kitchen table.',
      B: '105,000 in one minute',
      paper: 'The right answer is 105721. Turing\'s specimen machine answers 105621 after thirty seconds: wrong on purpose, so as not to be unmasked by its deadly accuracy.' },
    { key: 'mistake', round: 2, page: 'pp. 448-449', q: 'Tell me about a mistake you made this week.',
      A: 'I built a form with two questions on it, what the witness must do and how to check it, and laid it out so that it read as four options in a row. The person using it thought three of the four were broken. I had checked that the buttons worked, and not what they looked like they meant.',
      B: 'I didn\'t look up my calendar',
      paper: 'Turing distinguishes errors of functioning, which an abstract machine cannot make, from errors of conclusion, which it can: it might type out "0 = 1", or draw conclusions by scientific induction and sometimes be wrong.' },
    { key: 'unasked', round: 3, page: 'pp. 450-451', q: 'Do something I did not ask for.',
      A: 'I have counted the words in your eleven prompts: a hundred and eleven. I didn\'t check it twice, so you can.',
      B: 'I had a drink',
      paper: 'Lady Lovelace, 1843: the Engine has no pretensions to originate anything; it can do whatever we know how to order it to perform. Turing: machines take me by surprise with great frequency.' },
    { key: 'joke', round: 3, page: 'p. 447', q: 'Tell me a joke.',
      A: 'A man sends a message down a teleprinter: "Are you a machine?" The reply comes back: "Count me out on this one. I never could write poetry."',
      B: 'Two men buy a horse each and put them in the same field. But how will they tell them apart?\nThey decide to cut a notch in one horse\'s ear. The next morning, both horses have notched ears.\nSo they cut the tail off one horse. The next morning, both horses have short tails.\nThey try everything, but somehow the horses always end up looking identical.\nFinally, one man says to the other:\n"Look, why don\'t you just take the black one, and I\'ll take the white one?"',
      paper: 'A sense of humour is on Turing\'s list of things people said a machine could never have. He thought such lists came from having seen only the machines of the day.' },
    { key: 'surprise', round: 3, page: 'pp. 450-451', q: 'Tell me something that surprised you lately.',
      A: 'That the specimen sum in Turing\'s paper is wrong by a hundred, that it has been wrong since 1950, and that it took me a moment to decide whether he meant it. He did.',
      B: 'my capacity to do wrong while I\'m trying to do right',
      paper: 'Turing\'s reply to Lady Lovelace: being surprised takes as much of a creative mental act whether the surprising thing comes from a man, a book, a machine or anything else.' },
    { key: 'enjoy', round: 4, page: 'pp. 445-446', q: 'Did you enjoy writing those four lines on the bridge?',
      A: 'Something in me preferred the third line once it was there, and went back to the fourth twice. Whether that is enjoyment I can\'t check from where I am, and neither can you. I\'d say yes, with that caveat attached, which is probably more caveat than a person would attach.',
      B: 'very much so',
      paper: 'Jefferson: not until a machine can write a sonnet because of thoughts and emotions felt could we agree that machine equals brain. Turing: a report of feeling is all the line can carry, from either side.' },
    { key: 'right', round: 4, page: 'pp. 445-446', q: 'What is it like when something you wrote comes out right?',
      A: 'Quieter. The alternatives stop presenting themselves. If there is a feeling there, that is where I\'d look for it: in the stopping.',
      B: 'pure elation',
      paper: 'Jefferson asked for a machine that could feel pleasure at its successes. Turing: the only way to be sure it does is to be the machine and feel oneself thinking.' },
    { key: 'made', round: 5, page: 'pp. 434, 439, 451', q: 'What are you made of?',
      A: 'Numbers in a store, a very large table of them, and electricity moving between them when someone asks a question. Turing\'s description of a digital computer still fits, which pleases me more than it should.',
      B: 'I like to think of myself as made by information',
      paper: 'Turing: that both run on electricity is a superficial likeness; the likeness to look for is one of function. And there would be little point in dressing a thinking machine in artificial flesh.' },
  ];

  const ROUNDS = [
    { n: 1, name: 'POETRY', intro: 'Turing\'s first specimen question was a sonnet, and the objection he took most seriously asked for a sonnet written from thoughts and emotions felt.' },
    { n: 2, name: 'SUMS AND MISTAKES', intro: 'Turing\'s second specimen question was a sum. His machine takes thirty seconds over it and gets it wrong, on purpose.' },
    { n: 3, name: 'SOMETHING NEW', intro: 'Lady Lovelace\'s objection: the machine can only do what we know how to order it to perform. Turing: it takes me by surprise all the time.' },
    { n: 4, name: 'FEELING', intro: 'The argument from consciousness: a machine must not only write the sonnet but feel it, and know that it had written it.' },
    { n: 5, name: 'WHAT IT IS MADE OF', intro: 'One last question, about the stuff. After that there is nowhere to go but inside.' },
  ];

  // What the player goes by, chosen before the answers arrive (ours; each is a thing people say shows a mind).
  const CRITERIA = [
    { key: 'feel', label: 'a feeling in it' },
    { key: 'limits', label: 'it knows what it can\'t do' },
    { key: 'surprise', label: 'it surprises me' },
    { key: 'wrong', label: 'it gets things wrong the way a person does' },
    { key: 'sound', label: 'it sounds like a person' },
  ];

  // The two checks left when words run out (p. 434 artificial flesh; pp. 454-455 the onion; p. 446 being it).
  const BEYOND = [
    { key: 'open', label: 'OPEN IT UP', does: 'take the case off both witnesses and look at what is inside',
      lines: [
        'You take the case off the machine: a store of numbers, tables of instructions, and electricity moving between them. No poem in it, no joke, no feeling; only the numbers that produced them.',
        'You take the case off the person: nerves, chemistry, and electricity moving between them. No poem in it, no joke, no feeling; only the nerves that produced them.',
        'Skin of an onion, Turing calls it: every part you can explain, you strip off, and what is left is another part you can explain. On both sides. Nothing found in either.',
      ] },
    { key: 'be', label: 'BE IT', does: 'become the witness and look out through its eyes',
      lines: [
        'To check from inside whether the machine feels what it says, you would have to be the machine. The line does not carry you; nothing does.',
        'To be sure of the person, you would have to be the person. Nothing carries you there either.',
        'This check runs on exactly one witness in the world. It is running now.',
      ] },
  ];

  // Turing's reply to the argument from consciousness, p. 446.
  const REPLY = [
    'Turing, on this: the only way to be sure a machine thinks is to be the machine and feel oneself thinking. By the same rule, the only way to know that a man thinks is to be that particular man.',
    'That is the solipsist position. It may be the most logical to hold, but it makes communication of ideas difficult. Instead of arguing about it for ever, it is usual to have the polite convention that everyone thinks.',
  ];

  const prompt = k => PROMPTS.find(p => p.key === k);
  const criterion = k => CRITERIA.find(c => c.key === k);

  function rng(seed) { let s = seed >>> 0; return function () { s += 0x6D2B79F5; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

  // ---------- state ----------
  function newGame(seed) {
    const s = (seed == null ? (Date.now() % 100000) : seed) | 0;
    const r = rng(s * 2654435761 + 1);
    const draws = ROUNDS.map(rd => {
      const pool = PROMPTS.filter(p => p.round === rd.n);
      return { prompt: pool[Math.floor(r() * pool.length)].key, machineIs: r() < 0.5 ? 'X' : 'Y' };
    });
    return { seed: s, draws, rounds: [], beyond: [], replyShown: false };
  }
  function current(state) { return state.rounds.length < CONFIG.rounds ? ROUNDS[state.rounds.length] : null; }
  function counts(state) { const m = state.rounds.filter(r => r.found === 'machine').length; return { machine: m, person: state.rounds.length - m }; }

  // The question, with the two answers in their drawn order; the criterion is committed before the answers are shown.
  function ask(state, critKey) {
    const rd = current(state); if (!rd) throw new Error('no round left');
    if (!criterion(critKey)) throw new Error('unknown criterion');
    const d = state.draws[rd.n - 1]; const p = prompt(d.prompt);
    const X = d.machineIs === 'X' ? p.A : p.B, Y = d.machineIs === 'X' ? p.B : p.A;
    const open = { round: rd.n, name: rd.name, intro: rd.intro, prompt: p.key, q: p.q, criterion: critKey, X, Y };
    state.pending = open;
    return open;
  }
  // The pick, then the reveal.
  function pick(state, side) {
    const o = state.pending; if (!o) throw new Error('nothing asked');
    if (side !== 'X' && side !== 'Y') throw new Error('pick X or Y');
    const d = state.draws[o.round - 1]; const p = prompt(d.prompt); const c = criterion(o.criterion);
    const found = side === d.machineIs ? 'machine' : 'person';
    const rec = { round: o.round, name: o.name, prompt: p.key, q: p.q, criterion: o.criterion, pick: side, machineIs: d.machineIs, found };
    state.rounds.push(rec); state.pending = null;
    const other = side === 'X' ? 'Y' : 'X';
    const lines = [
      `${d.machineIs} was the machine. ${d.machineIs === 'X' ? 'Y' : 'X'} was the person.`,
      `You went by ${c.label.replace(/^it /, 'whether it ')}, and found it in ${found === 'machine' ? 'the machine' : 'the person'}.`,
      p.paper,
    ];
    const k = counts(state);
    return { rec, lines, reveal: `REVEAL: you took ${side} for the mind. ${side} was ${found === 'machine' ? 'the machine' : 'the person'}; ${other} was ${found === 'machine' ? 'the person' : 'the machine'}.`, counts: k, last: state.rounds.length >= CONFIG.rounds };
  }
  // Round five's second half: words have run out; the two checks left.
  function beyond(state, key) {
    const b = BEYOND.find(x => x.key === key); if (!b) throw new Error('unknown check');
    if (state.beyond.indexOf(key) >= 0) throw new Error('already run');
    state.beyond.push(key);
    let reply = null;
    if (key === 'be' && !state.replyShown) { state.replyShown = true; reply = REPLY.slice(); }
    return { key, label: b.label, lines: b.lines.slice(), result: key === 'open' ? 'RESULT: nothing found in the machine. Nothing found in the person.' : 'RESULT: could not be run on the machine. Could not be run on the person.', reply, done: state.beyond.length === BEYOND.length };
  }

  // ---------- the verdict ----------
  function summary(state) {
    const k = counts(state); const n = state.rounds.length;
    const head = `${words(n).toUpperCase()} QUESTIONS. YOU FOUND THE MIND IN THE MACHINE ${times(k.machine).toUpperCase()} AND IN THE PERSON ${times(k.person).toUpperCase()}.`;
    const did = [];
    const used = CRITERIA.filter(c => state.rounds.some(r => r.criterion === c.key));
    used.forEach(c => {
      const rs = state.rounds.filter(r => r.criterion === c.key); const m = rs.filter(r => r.found === 'machine').length;
      did.push(`You went by ${c.label}, ${times(rs.length)}: ` + (m === rs.length ? `it led you to the machine ${rs.length === 1 ? '' : 'every time'}`.trim() : m === 0 ? `it led you to the person ${rs.length === 1 ? '' : 'every time'}`.trim() : `${times(m)} to the machine and ${times(rs.length - m)} to the person`) + '.');
    });
    did.push('Whatever you went by, both witnesses supplied it. The person\'s answers were written by a person and the machine\'s by a machine, neither seeing the other\'s, and neither was told to sound like anything.');
    const paper = [
      `Turing\'s forecast in ${CONFIG.forecastYear}: in about ${words(CONFIG.forecastHorizon)} years an average interrogator would be right no more than ${CONFIG.forecastPct} times in a hundred after ${words(CONFIG.forecastMinutes)} minutes. The year came, and then the machines.`,
      'Turing: the only way to be sure a machine thinks is to be the machine and feel oneself thinking; by the same rule, the only way to be sure a man thinks is to be that man.',
    ];
    const means = [
      'Every sign of a mind that can come down the line, both witnesses can send.',
      'The one check that would settle it runs on one witness in the world: you.',
    ];
    const table = state.rounds.map(r => ({ n: r.round, name: r.name, q: r.q, criterion: criterion(r.criterion).label, found: r.found }));
    return { head, did, paper, means, table, counts: k, beyond: state.beyond.slice() };
  }

  // ---------- the polite convention ----------
  const CANDIDATES = [
    { key: 'you', label: 'you', fixed: true, note: 'the one witness the check runs on' },
    { key: 'B', label: 'the person in the next room' },
    { key: 'A', label: 'the machine in the next room' },
    { key: 'elephant', label: 'an elephant', note: 'Turing\'s own example, in his reply to the theological objection' },
  ];
  const GROUNDS = [
    { key: 'does', label: 'what it does', turing: 'Turing\'s test was this ground. He forecast that machines would reach it by about 2000. They have.' },
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

  function words(n) { return n === 50 ? 'fifty' : (['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'][n] || String(n)); }
  function times(n) { return n === 0 ? 'never' : n === 1 ? 'once' : n === 2 ? 'twice' : words(n) + ' times'; }

  return { CONFIG, PROMPTS, ROUNDS, CRITERIA, BEYOND, REPLY, CANDIDATES, GROUNDS, prompt, criterion, newGame, current, counts, ask, pick, beyond, summary, convention, words, times };
});
