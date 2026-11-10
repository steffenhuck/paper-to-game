# Turing's Witnesses: rebuild memo (10 November 2026)

The first build (in `previous/`, with its full memo) put the player in the interrogator's chair after the old test had fallen and had them write six tests, a demand from Turing's list checked from the chair, with the case off, or by being it; the counter of separations that hold never moved, and the terminal said why. The author played it twice. The form read as four peer options and the categories were opaque; and, deeper, the game *told* the player that the machine had passed. Nobody judged anything. The crux of the paper in 2026, that an interrogator not only cannot tell but takes the machine for the human, was asserted by a line the builder wrote.

## 0. Given (unchanged, plus the second conversation)

Steffen's own; author title; green phosphor on black, the slow line. From the discussion after the first build: fixed sequence with a random draw so no two games are alike; five rounds, not seven; and the crux: how can anyone decide whether a response is a human one, when machines often sound more human than people. The answer we settled on: the player judges, but not identity; the two witnesses' answers are real, written by a person and by the machine that built the game; the machine answers as itself, not imitating a man.

## 1. The core narrative

There is a person in the next room and a machine in the next room, and a wire that carries only typed words. Five times you ask a question from Turing's paper, and both answer. Before the answers come, you say what you will look for: a feeling, a joke that lands, an admission, a mistake, a human sound. Then you say which answer has a mind behind it, and you are told who wrote which. Whatever you looked for, both sent it. Then you try the two things that do not use the wire, opening them up and being them, and find mechanism on both sides and a check that runs only on yourself. So you decide whom you will be polite to.

## 2. Who the witnesses are

Witness B's eleven answers were written by Steffen Huck, one prompt at a time in this conversation, fast, unedited (`witness-b.md`). Witness A's were written by Claude, the machine building the game, as itself, before seeing B's, and not changed after (`witness-a.md`, committed first). The prompts are the paper's specimen questions (the Forth Bridge, the viva voce question, the sum) and the subjects of its objections (a mistake, something unasked, a joke, a surprise, enjoyment, what it is like, what you are made of). The calibration check refuses to pass unless the mechanism's text is the two files byte for byte. The About screen says who wrote what and links the files.

## 3. The aim and the verdict

**Aim:** *Say which of two answers has a mind behind it, five times, and what you went by.* **Yardstick:** `MIND FOUND IN: PERSON n · MACHINE m` on the status line, a record, not a score. **Verdict:** *Five questions. You found the mind in the machine three times and in the person twice.* Then, per criterion the player used, where it led them; then that both witnesses supplied every one; Turing's forecast and his reply to Jefferson; and the two lines that are the lesson: every sign of a mind that can come down the line, both witnesses can send; the one check that would settle it runs on one witness in the world.

## 4. The shape

Five rounds in the paper's order: Poetry (three prompts), Sums and mistakes (two), Something new (three; Lady Lovelace's moment), Feeling (two), What it is made of (one). Each round draws one prompt and a random side order from the seed shown as the line number. The player ticks a criterion (five, the same list every round, so the verdict can tally by criterion), sends the question, reads X and Y, picks. The reveal names who was who, what the player went by, and a line from the paper for that prompt. After the fifth pick, words have run out: OPEN IT UP and BE IT, both taken, each with its meaning beside the button; Turing's reply typed on BE IT. Then the polite convention, unchanged from the first build: extend it to yourself (fixed), the person, the machine, an elephant; on the grounds of what it does, what it is made of, what it says it feels, or politeness; read back beside Turing's, ungraded.

## 5. Precedent and look

Position: Agent, the paper's interrogator, now judging as Turing's interrogator judges, with the question changed. Format: Discovery (the discovery is what one's own criteria do). Device: the slow line, with the pick and the reveal. Chassis unchanged from the first build: VT323 phosphor on black, scanlines, reverse-video text buttons, nothing on screen but text. The answers keep their line breaks, so the poems arrive as poems.

## 6. What is cut

The fifteen-demand list and the three-way check as a form. The Gödel question, the strawberries, telepathy and the nerves as played tests (the first build's cells remain in `previous/`; the About page names them). The counter of separations.

## 7. Divergences

- Turing's interrogator asks which is the machine; ours is told after choosing and asked which answer had a mind behind it. The brief's: in 2026 the first question is settled, and the game says so on the start screen.
- Five rounds, the draw, the five criteria and the two checks beyond words are ours.
- Eleven answers from one person and one machine do not establish the general case, and the About page says so. The calibration file records that length is the one reliable tell in these pairs (the machine wrote more in nearly every round), which is a fact about these two writers.

## 8. Mechanism kind and claim boundaries

Toy, from an argument, around real answers. Demonstrates: that whatever a player goes by, from five things people say show a mind, both witnesses supplied it in these pairs; and what the paper's two remaining checks come to. Assumes: that these pairs stand for the general case (they do not); the five criteria; the five-round shape; the four grounds. The paper establishes: an argument and a forecast, nothing about 2026 and nothing about whether any machine thinks. The discovery comes from the answers and the paper, not from the rules: the mechanism judges nothing; it draws, records and reveals.

## 9. Calibration plan and result

`calibration.js`, 54 checks, all passing: the specimen sum and the paper's wrong answer; the forecast; the eleven answers of each witness equal to the two files byte for byte; every prompt with a page and a round; the draw over 2000 seeds (every prompt drawn, the side balanced, round one even); 300 random games (five rounds, the reveal names who was who, counts add to five, both checks run, the reply once); refusals of a pick before a question, a pick that is neither X nor Y, and a repeated check; the verdict's wording; the convention; no decimal on any line; the longest round under fifteen seconds untapped.

## 10. Playing it in numbers (build.md §3)

| rule for picking | mind found in the machine, of 5, over 500 seeds |
|---|---|
| always X | 2.52 |
| the longer answer | 4.70 |
| the shorter answer | 0.30 |
| the one that says "I" | 3.30 |
| the one with a line break | 4.70 |

There is no score to tune, so the table records what the pairs can and cannot tell: length separates the writers, and nothing else in the list does. The verdict says what the player went by, not how often they found the machine.

## 11. Build log

- The first build's game, memo, mechanism, checks, screenshots and author note moved to `previous/`.
- `witness-a.md` written and committed before any of the person's answers arrived; `witness-b.md` filled in one answer per commit as they came.
- `mechanism.js` rebuilt: the eleven pairs, five rounds, five criteria, the two checks beyond words, the draw, the summary, the convention. `calibration.js` rewritten, with the verbatim-file check; the first run caught a parser bug of its own (multi-line answers) and nothing in the mechanism. `loop.js` read as the stranger: the reveal says who was who and what the player went by before any paper line.
- `template.html` rebuilt on the same chassis: the criterion ticked before the question is sent; X and Y typed as answers with their line breaks; the pick as two reverse-video buttons; the reveal in afterglow; the two checks beyond words with their meaning beside the buttons; the status line in the aim's units.
- Full session in headless Chromium at 380 px (`session-test.js`, `session-log.txt`): two games (the shorter-answer picker with the help opened mid-play; the longer-answer picker with a solipsist ending), About opened, no page errors, no horizontal scroll.
