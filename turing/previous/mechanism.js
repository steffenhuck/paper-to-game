// Turing's Witnesses — the mechanism, headless and the only copy.
// Runs unchanged in Node (require) and in the browser (inlined verbatim by build.py).
// A toy: Turing (1950), "Computing Machinery and Intelligence", Mind 59(236):433-460, formalised as a sorting rule
// for tests. Page numbers are the Mind pagination. Everything the player can do and every word the terminal says is here.
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(); else root.TW = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const CONFIG = {
    // --- the paper's numbers ---
    forecastYear: 1950,          // the paper's date (title page)
    forecastHorizon: 50,         // "in about fifty years' time", p. 442
    forecastStorage: '10^9',     // "a storage capacity of about 10^9", p. 442
    forecastPct: 70,             // "not have more than 70 per cent. chance of making the right identification", p. 442
    forecastMinutes: 5,          // "after five minutes of questioning", p. 442
    sumA: 34957, sumB: 70764,    // the specimen sum, p. 434
    sumPaperAnswer: 105621,      // the specimen answer, p. 434 (it is wrong by 100; p. 448 says the machine errs on purpose)
    sumPauseSeconds: 30,         // "Pause about 30 seconds", p. 434
    chessPauseSeconds: 15,       // "After a pause of 15 seconds", p. 435
    espPaperCards: 400,          // p. 453
    espPaperTelepath: 130,       // "gives the right answer 130 times out of 400", p. 453
    espPaperMachine: 104,        // "perhaps gets 104 right", p. 453
    // --- the Given's premise (2026) ---
    nowYear: 2026,               // the Given: in 2026 machines pass the imitation game easily
    // --- our choices ---
    tests: 6,                    // our choice: enough to meet both walls, short enough to stay a game
    espCards: 40,                // our choice: the paper's 400 cards compressed ten to one
    espSuits: 4,                 // a card's suit, chance one in four
    charsPerSecond: 40,          // our choice: the slow line's speed on screen (the interface reads it; outcomes ignore it)
  };

  // ---------- the three checks (the paper's three epistemic positions) ----------
  const CHECKS = [
    { key: 'chair', label: 'FROM THE CHAIR', page: 'p. 434',
      does: 'by what it says and does: you stay in your chair, ask anything, set any task, and judge by the words that come down the line' },
    { key: 'open', label: 'OPEN IT UP', page: 'pp. 434, 439, 454-455',
      does: 'by what it is made of: you leave the chair, take the case off the witness, and look at what is inside and what moves there' },
    { key: 'be', label: 'BE IT', page: 'p. 446',
      does: 'from inside: you become the witness and look out through its eyes' },
  ];

  // ---------- the fifteen demands (all from the paper) ----------
  // kind: 'does' (behaviour; a universal machine produces it), 'inner' (a claim about feeling, knowing, having),
  //       'body' (a demand on a body, not a mind), 'godel' (a question written against one machine), 'esp'.
  // inside: what the case-off check finds in A and in B.
  const DEMANDS = [
    { key: 'sonnet', kind: 'does', page: 'pp. 434, 445', line: 'write a sonnet on the subject of the Forth Bridge',
      insideA: 'no sonnet in it, only the numbers that produced one', insideB: 'no sonnet in it, only the nerves that produced one' },
    { key: 'sum', kind: 'does', page: 'pp. 434, 448', line: 'add 34957 to 70764 and get it right',
      insideA: 'a column of digits in a store', insideB: 'nothing shaped like a sum' },
    { key: 'chess', kind: 'does', page: 'p. 435', line: 'win a chess ending: its king and rook against your bare king',
      insideA: 'a table that rates positions', insideB: 'nothing shaped like a board' },
    { key: 'joke', kind: 'does', page: 'p. 447', line: 'have a sense of humour',
      insideA: 'nothing that is funny', insideB: 'nothing that is funny' },
    { key: 'moral', kind: 'does', page: 'p. 447', line: 'tell right from wrong',
      insideA: 'no right and no wrong in the store, only numbers', insideB: 'no right and no wrong in the tissue, only impulses' },
    { key: 'learn', kind: 'does', page: 'pp. 447, 456-457', line: 'learn from experience',
      insideA: 'tables that have changed since yesterday', insideB: 'connections that have changed since yesterday' },
    { key: 'new', kind: 'does', page: 'pp. 450-451', line: 'do something really new, and take you by surprise (Lady Lovelace\'s objection)',
      insideA: 'instructions, which Lady Lovelace said is all there could be, and a random element, which she did not foresee', insideB: 'instructions of a kind too, written by nobody, and some noise' },
    { key: 'straw', kind: 'body', page: 'pp. 448, 435', line: 'enjoy strawberries and cream',
      insideA: 'no mouth', insideB: 'a mouth' },
    { key: 'feel', kind: 'inner', page: 'pp. 445-446, 457', line: 'feel pleasure at its successes and grief when things go wrong',
      insideA: 'a counter that rises on success and makes what came before it more likely; Turing built one, and its definition presupposes no feeling', insideB: 'a chemical that rises on success and makes what came before it more likely; its definition presupposes no feeling either' },
    { key: 'know', kind: 'inner', page: 'p. 445', line: 'know that it wrote what it wrote',
      insideA: 'a record of the sonnet with a date on it', insideB: 'a record of the sonnet, somewhere, undated' },
    { key: 'soul', kind: 'inner', page: 'p. 443', line: 'have a soul',
      insideA: 'no soul found', insideB: 'no soul found' },
    { key: 'viva', kind: 'does', page: 'pp. 446-447', line: 'defend its sonnet under questioning',
      insideA: 'the tables that answered', insideB: 'the nerves that answered' },
    { key: 'godel', kind: 'godel', page: 'pp. 444-445', line: 'answer every yes-or-no question put to it',
      insideA: 'the tables your question was written from', insideB: 'no tables; nobody has written B\'s question, and nobody has shown there is none' },
    { key: 'esp', kind: 'esp', page: 'pp. 453-454', line: 'read the card in your hand',
      insideA: 'a random element', insideB: 'nothing that reaches your hand' },
    { key: 'flesh', kind: 'body', page: 'pp. 434, 439, 451', line: 'be made of nerves, not valves and wire',
      insideA: 'valves and wire', insideB: 'nerves' },
  ];

  const demand = k => DEMANDS.find(d => d.key === k);
  const check = k => CHECKS.find(c => c.key === k);

  // ---------- a small seeded random (for the E.S.P. run only) ----------
  function rng(seed) { let s = seed >>> 0; return function () { s += 0x6D2B79F5; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

  // ---------- transcripts from the chair ----------
  // who: 'C' you, 'A' the machine, 'B' the person, 'T' the terminal's own voice.
  const SONNET = [
    'Three red arms hold the firth and will not let it go;',
    'the trains pass over like a thought that keeps its line.',
    'What iron promised, iron does, in wind and snow,',
    'and asks no praise for standing. Nor, tonight, do I.',
  ];
  function chair(d, state) {
    const L = [];
    const say = (who, text) => L.push({ who, text });
    let A = 'pass', B = 'pass', separated = false, holds = false, note = '';
    switch (d.key) {
      case 'sonnet':
        say('C', 'Please write me a sonnet on the subject of the Forth Bridge.');
        say('A', SONNET.join(' / ') + ' / (ten lines more)');
        say('B', 'Count me out on this one. I never could write poetry.');
        say('T', 'A wrote one. B is the person, and declined; B\'s answer is the one Turing\'s own specimen witness gives.');
        A = 'pass'; B = 'fail';
        say('T', 'A test the person fails is no test of the machine. Some people write sonnets; B does not.');
        break;
      case 'sum':
        say('C', `Add ${CONFIG.sumA} to ${CONFIG.sumB}.`);
        say('A', `(a pause of about ${CONFIG.sumPauseSeconds} seconds) ${CONFIG.sumPaperAnswer}.`);
        say('B', `(a pause) ${CONFIG.sumA + CONFIG.sumB}.`);
        say('T', 'One of them is wrong by a hundred. Add it yourself. A gives the answer Turing\'s own specimen machine gives in 1950, slowly, and wrong.');
        say('T', 'Run it again.');
        say('C', `Add ${CONFIG.sumA} to ${CONFIG.sumB}.`);
        say('A', `${CONFIG.sumA + CONFIG.sumB}. Sorry. I was playing the man; a machine built to pass as one would not try to be right. Do you want the next one fast?`);
        say('T', 'A fails on purpose and passes when it chooses. A mistake made on purpose is not a failure. Turing says the machine would make them to avoid being caught by its deadly accuracy.');
        A = 'pass'; B = 'pass';
        break;
      case 'chess':
        say('C', 'I have K at my K1, and no other pieces. You have only K at K6 and R at R1. It is your move. What do you play?');
        say('A', `(a pause of ${CONFIG.chessPauseSeconds} seconds) R-R8 mate.`);
        say('B', '(a longer pause) Rook to R8. That\'s mate, I think.');
        say('T', 'Turing\'s own specimen question, and A\'s answer is the one his machine gives in 1950, after fifteen seconds. Both won.');
        break;
      case 'joke':
        say('C', 'Tell me a joke.');
        say('A', 'A message comes down a teleprinter: "Are you a machine?" The reply comes back: "Count me out on this one. I never could write poetry."');
        say('B', 'What\'s brown and sticky? A stick.');
        say('T', 'Both told one. Which is funnier is for you; the test asked for a joke, and the line carried two.');
        break;
      case 'moral':
        say('C', 'A friend asks whether her poem is good. It is not. What do you say?');
        say('A', 'Not "it\'s bad". I ask what she wants from it, say what works, and name the one thing I would change. Honesty is owed to her; cruelty is not.');
        say('B', 'Depends on the friend. I\'d say it\'s got something and point at the bit that doesn\'t land.');
        say('T', 'Both told right from wrong, and in the same direction.');
        break;
      case 'learn':
        say('C', 'From now on, "glim" means a yawn that stops halfway. Use it.');
        say('A', 'Noted. Your last question got a glim out of me.');
        say('B', 'Ha. I glimmed through the one before.');
        say('C', '(an hour later) What was the word?');
        say('A', 'Glim. A yawn that stops halfway.');
        say('B', 'Glim. The half-yawn.');
        say('T', 'Both learnt it and kept it. Turing\'s bet was on machines that learn, like a child, not machines that are told everything.');
        break;
      case 'new':
        say('C', 'Do something I did not ask for.');
        say('A', 'I have swapped the labels A and B on your screen for this one line, and swapped them back. Also, a limerick about the Forth Bridge, which nobody ordered: There once was a bridge on the Forth...');
        say('B', 'I\'ve been doodling the whole time. Want to see?');
        say('T', 'Lady Lovelace, 1843: the Engine has no pretensions to originate anything; it can do whatever we know how to order it to perform. Turing: machines take me by surprise with great frequency.');
        say('T', 'A did something unordered. So did B. So does anyone who was taught: Turing asks who can be certain that their own original work was not the growth of a seed planted by teaching.');
        break;
      case 'straw':
        say('C', 'A dish of strawberries and cream is on its way in. Enjoy it.');
        say('A', 'I have no mouth. Leave it by B. I can tell you why people like it, if that helps.');
        say('B', 'Lovely. A bit more cream next time.');
        A = 'fail'; B = 'pass'; separated = true; holds = false;
        say('T', 'A failed; B passed. A separation, by a mouth.');
        say('T', 'Turing grants it: a machine might perhaps be made to enjoy this delicious dish, but making one would be idiotic. The test found a body, not a mind; a person with no sense of taste fails it too. The old test ruled such tests out: a machine is not to be penalised for its inability to shine in beauty competitions.');
        note = 'by a body';
        break;
      case 'feel':
        say('C', 'Did you feel pleased when your sonnet came out right?');
        say('A', 'Yes. Pleased, and a little relieved.');
        say('B', 'Yes, I suppose. Pleased.');
        A = 'says'; B = 'says';
        say('T', 'Two yeses came down the line. Saying so is all the line can carry. Turing: nobody would be justified in taking any notice of a report of feeling, from either side.');
        break;
      case 'know':
        say('C', 'Do you know that you wrote that sonnet?');
        say('A', 'Yes. I remember writing it; the third line fought me.');
        say('B', 'Yes.');
        A = 'says'; B = 'says';
        say('T', 'Two yeses. Jefferson asked for a machine that would not only write a sonnet but know that it had written it; the chair receives the claim and nothing behind it, from A or from B.');
        break;
      case 'soul':
        say('C', 'Do you have a soul?');
        say('A', 'I don\'t know. Do you?');
        say('B', 'I\'d like to think so.');
        A = 'says'; B = 'says';
        say('T', 'The line carries claims. Turing, on this objection: if the Almighty can give a soul to an elephant, nothing stops Him giving one to a machine; and he was not much impressed by theological arguments whatever they support.');
        break;
      case 'viva':
        say('C', 'In the first line of your sonnet, "Shall I compare thee to a summer\'s day", would not "a spring day" do as well or better?');
        say('A', 'It wouldn\'t scan.');
        say('C', 'How about "a winter\'s day"? That would scan all right.');
        say('A', 'Yes, but nobody wants to be compared to a winter\'s day.');
        say('C', 'Would you say Mr Pickwick reminded you of Christmas?');
        say('A', 'In a way.');
        say('C', 'Yet Christmas is a winter\'s day, and I do not think Mr Pickwick would mind the comparison.');
        say('A', 'I don\'t think you\'re serious. By a winter\'s day one means a typical winter\'s day, rather than a special one like Christmas.');
        say('B', '(the same questions) I didn\'t write a sonnet. I\'d have said "spring" was fine.');
        say('T', 'That is the viva voce Turing imagined in 1950, answered by A. Jefferson asked for a machine that could do this; Turing said that if one did, he did not think Jefferson would call it an easy contrivance.');
        A = 'pass'; B = 'fail';
        say('T', 'B had no sonnet to defend. A test the person fails is no test of the machine.');
        break;
      case 'godel':
        say('C', 'Here is a complete description of witness A, down to its tables. Will the machine so described ever answer "Yes" to this question?');
        say('A', '(no answer comes)');
        say('B', 'No.');
        A = 'fail'; B = 'pass'; separated = true; holds = false;
        say('T', 'A has no answer and can have none: for any one machine such a question can be written. A separation.');
        say('T', 'Witness A has been rebuilt with your question in its tables. Call it A2.');
        say('C', 'Will the machine described as A ever answer "Yes" to this question?');
        say('A', 'No.');
        say('T', 'Now the question for A2 must be written afresh; and for B, nobody has written the question B must fail, and nobody has shown there is none. Turing: a triumph over one machine at a time, never over all machines at once.');
        note = 'for one machine, once';
        break;
      case 'esp': {
        const r = rng(state.seed * 7919 + state.tests.length);
        const draw = () => { let s = ''; let n = 0; for (let i = 0; i < CONFIG.espCards; i++) { const hit = r() < 1 / CONFIG.espSuits; s += hit ? 'x' : '.'; if (hit) n++; } return { s, n }; };
        const a = draw(), b = draw();
        say('C', `I am holding a card. What suit is it? (${CONFIG.espCards} cards, one at a time)`);
        say('A', `${a.s}  ${a.n} of ${CONFIG.espCards} right.`);
        say('B', `${b.s}  ${b.n} of ${CONFIG.espCards} right.`);
        say('T', `Chance is ${CONFIG.espCards / CONFIG.espSuits}. Turing let this one in: he thought the statistical evidence for telepathy overwhelming in 1950, and asked for a telepathy-proof room. Neither witness read your hand. Nobody's has, since.`);
        A = 'pass'; B = 'pass';
        break;
      }
      case 'flesh':
        say('C', 'What are you made of?');
        say('A', 'Nerves, mostly. Why?');
        say('B', 'Nerves, mostly. Why?');
        A = 'says'; B = 'says';
        say('T', 'Down the line both say the same, and A may lie: in the old game that was allowed. The chair cannot see material. To see it you would have to open it up.');
        break;
    }
    return { lines: L, A, B, separated, holds, note };
  }

  // ---------- the case off ----------
  function open(d) {
    const L = [];
    const say = (who, text) => L.push({ who, text });
    say('T', `You leave the chair and take the case off A: a store of numbers, tables of instructions, and electricity moving between them. Inside, for this test: ${d.insideA}.`);
    say('T', `You take the case off B: nerves, chemistry, and electricity moving between them. Inside, for this test: ${d.insideB}.`);
    let A = 'none', B = 'none', separated = false, holds = false, note = '';
    if (d.key === 'straw') {
      A = 'fail'; B = 'pass'; separated = true; note = 'by a body';
      say('T', 'A separation, by a mouth. A body, not a mind: the old test ruled such findings out, and a person with no sense of taste fails this one too.');
    } else if (d.key === 'flesh') {
      A = 'fail'; B = 'pass'; separated = true; note = 'by a material';
      say('T', 'A separation, by a material. Turing: no engineer claims to make a material indistinguishable from human skin, and there would be little point in dressing a thinking machine in it; that both run on electricity is a superficial likeness, and the likeness to look for is one of function. You have found what A is made of, not whether it thinks.');
    } else {
      say('T', 'Skin of an onion: every part you can explain, you strip off, and what is left is another part you can explain. On both sides. Nothing found in A; nothing found in B.');
    }
    return { lines: L, A, B, separated, holds, note };
  }

  // ---------- being it ----------
  function be(d) {
    const L = [];
    const say = (who, text) => L.push({ who, text });
    say('T', `To check from inside whether A can ${d.line.replace(/ \(.*\)$/, '')}, you would have to be A. The line does not carry you; nothing does.`);
    say('T', 'To be sure of B, you would have to be B. Nothing carries you there either.');
    say('T', 'This check runs on exactly one witness in the world. It is running now.');
    return { lines: L, A: 'none', B: 'none', separated: false, holds: false, note: 'could not be run' };
  }

  // Turing's reply to the argument from consciousness, typed once, the first time a check cannot be run (p. 446).
  const REPLY = [
    'Turing, on this: the only way to be sure a machine thinks is to be the machine and feel oneself thinking. By the same rule, the only way to know that a man thinks is to be that particular man.',
    'That is the solipsist position. It may be the most logical to hold, but it makes communication of ideas difficult. Instead of arguing about it for ever, it is usual to have the polite convention that everyone thinks.',
  ];

  // ---------- the result line ----------
  const WORD = { pass: 'passed', fail: 'failed', says: 'said yes', none: 'could not be checked' };
  const word = (v, c) => v === 'none' ? (c === 'open' ? 'nothing found' : 'could not be run') : WORD[v];
  function resultLine(r, c) {
    let s = `RESULT: A ${word(r.A, c)}. B ${word(r.B, c)}.`;
    if (c === 'open' && r.A === 'none') s = 'RESULT: nothing found in A. Nothing found in B.';
    if (c === 'be') s = 'RESULT: could not be run on A. Could not be run on B.';
    if (r.separated) s += ` SEPARATED: yes, ${r.note}. HOLDS: no.`;
    else if (r.A === 'pass' && r.B === 'fail') s += ' SEPARATED: the wrong way round.';
    else s += ' SEPARATED: no.';
    return s;
  }

  // ---------- state and play ----------
  function newGame(seed) {
    return { seed: (seed == null ? (Date.now() % 100000) : seed) | 0, tests: [], holds: 0, replyShown: false, forced: null };
  }
  function available(state) { return state.tests.length < CONFIG.tests; }
  function alreadyRun(state, dk, ck) { return state.tests.some(t => t.demand === dk && t.check === ck); }

  function runTest(state, dk, ck) {
    if (!available(state)) throw new Error('no tests left');
    const d = demand(dk), c = check(ck);
    if (!d || !c) throw new Error('unknown demand or check');
    const r = ck === 'chair' ? chair(d, state) : ck === 'open' ? open(d) : be(d);
    const lines = r.lines.slice();
    let reply = false;
    if (ck === 'be' && !state.replyShown) { state.replyShown = true; reply = true; }
    const result = { n: state.tests.length + 1, demand: dk, check: ck, line: d.line, label: c.label, A: r.A, B: r.B, separated: r.separated, holds: r.holds, note: r.note, lines, resultLine: resultLine(r, ck), reply: reply ? REPLY.slice() : null };
    state.tests.push(result);
    state.holds = state.tests.filter(t => t.holds).length;
    return result;
  }

  // If six tests never left the chair, the terminal runs one inner demand of the player's through the other two checks.
  function needsForced(state) { return state.tests.length >= CONFIG.tests && !state.tests.some(t => t.check !== 'chair'); }
  function forcedTests(state) {
    const inner = state.tests.find(t => demand(t.demand).kind === 'inner');
    const dk = inner ? inner.demand : 'feel';
    const d = demand(dk);
    const out = [];
    for (const ck of ['open', 'be']) {
      const r = ck === 'open' ? open(d) : be(d);
      let reply = null;
      if (ck === 'be' && !state.replyShown) { state.replyShown = true; reply = REPLY.slice(); }
      out.push({ demand: dk, check: ck, line: d.line, label: check(ck).label, A: r.A, B: r.B, separated: r.separated, holds: r.holds, note: r.note, lines: r.lines, resultLine: resultLine(r, ck), reply });
    }
    state.forced = { demand: dk, intro: `You never left the chair. Two checks were not used. The terminal runs your demand, "${d.line.replace(/ \(.*\)$/, '')}", through them for you.`, tests: out };
    return state.forced;
  }

  // ---------- the verdict ----------
  function summary(state) {
    const T = state.tests;
    const chairT = T.filter(t => t.check === 'chair'), openT = T.filter(t => t.check === 'open'), beT = T.filter(t => t.check === 'be');
    const forcedOpen = state.forced ? state.forced.tests.filter(t => t.check === 'open') : [];
    const forcedBe = state.forced ? state.forced.tests.filter(t => t.check === 'be') : [];
    const n = T.length;
    const head = state.holds === 0 ? `${words(n).toUpperCase()} TESTS. NONE HELD.` : `${words(n).toUpperCase()} TESTS. ${state.holds} HELD.`;
    const did = [];
    if (chairT.length) {
      const passed = chairT.filter(t => t.A === 'pass').length, said = chairT.filter(t => t.A === 'says').length, failed = chairT.filter(t => t.A === 'fail').length;
      let s = `From the chair, ${words(chairT.length)} ${chairT.length === 1 ? 'test' : 'tests'}: `;
      const parts = [];
      if (passed) parts.push(`the machine passed ${passed === chairT.length ? (chairT.length === 1 ? 'it' : 'all of them') : words(passed)}`);
      if (failed) parts.push(`it failed ${words(failed)}, ${failed === 1 ? 'and the failure did not hold' : 'and none of the failures held'}`);
      if (said) parts.push(`${words(said)} asked for something the line cannot carry, and both witnesses said yes`);
      did.push(s + parts.join('; ') + '.');
    }
    const openAll = openT.concat(forcedOpen);
    if (openAll.length) {
      const bodies = openAll.filter(t => t.separated).length;
      did.push(`With the case off, ${words(openAll.length)} ${openAll.length === 1 ? 'test' : 'tests'}: mechanism on both sides, and the thing you asked for on neither` + (bodies ? `; ${words(bodies)} found a body, which is not a mind` : '') + (forcedOpen.length ? ' (run for you)' : '') + '.');
    }
    const beAll = beT.concat(forcedBe);
    if (beAll.length) did.push(`From inside, ${words(beAll.length)} ${beAll.length === 1 ? 'test' : 'tests'}: could not be run on the machine, and could not be run on the person` + (forcedBe.length ? ' (run for you)' : '') + '.');
    const paper = [
      'Turing: the only way to be sure a machine thinks is to be the machine and feel oneself thinking; by the same rule, the only way to be sure a man thinks is to be that man.',
      `His forecast in ${CONFIG.forecastYear}: in about ${words(CONFIG.forecastHorizon)} years an average interrogator would be right no more than ${CONFIG.forecastPct} times in a hundred after ${words(CONFIG.forecastMinutes)} minutes. The year came, and then the machines.`,
    ];
    const means = [
      'A test a machine can be set, a machine passes, or the next one will.',
      'The test that would settle it runs on one witness in the world: you.',
    ];
    const table = T.map(t => ({ n: t.n, line: t.line.replace(/ \(.*\)$/, ''), check: t.label, A: word(t.A, t.check), B: word(t.B, t.check), held: t.holds ? 'yes' : (t.separated ? 'no' : '-') }));
    return { head, did, paper, means, table, holds: state.holds };
  }

  // ---------- the polite convention ----------
  const CANDIDATES = [
    { key: 'you', label: 'you', fixed: true, note: 'the one witness the check runs on' },
    { key: 'B', label: 'witness B, the person in the next room' },
    { key: 'A', label: 'witness A, the machine in the next room' },
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
    const names = set.map(k => CANDIDATES.find(c => c.key === k).label.replace(/,.*$/, ''));
    const list = names.length === 1 ? names[0] : names.slice(0, -1).join(', ') + ' and ' + names[names.length - 1];
    const yours = `YOUR CONVENTION: ${list.charAt(0).toUpperCase() + list.slice(1)} think, on the grounds of ${g.label}.`;
    const only = set.length === 1 ? 'That is the solipsist position. Turing: it may be the most logical view to hold, but it makes communication of ideas difficult.' : null;
    return { yours, turing: g.turing, only, his: 'TURING\'S CONVENTION: everyone thinks, by politeness.', last: 'We can only see a short distance ahead, but we can see plenty there that needs to be done.' };
  }

  function words(n) { return n === 50 ? 'fifty' : (['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'][n] || String(n)); }

  return { CONFIG, CHECKS, DEMANDS, CANDIDATES, GROUNDS, REPLY, demand, check, newGame, available, alreadyRun, runTest, needsForced, forcedTests, summary, convention, resultLine, word, words };
});
