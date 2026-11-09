# Turing's Witnesses — design memo

## 0. Given

Steffen's own: signature and counter. Author title: Turing's name and a thing from the game. Ideas, all binding:

- The text is Turing's 1950 *Mind* paper, read against its reputation. No chat-and-guess game: in 2026 machines pass the imitation game easily, and the game says so plainly and early, as a fact the player runs into, not a twist.
- The heart is §6, the objections, above all the argument from consciousness and Turing's answer: the only way to be sure a machine thinks is to be the machine; the same holds for any other person; so "the polite convention that everyone thinks".
- The game is built around the player trying to raise the bar after the old test has fallen: proposing what would really show a mind, and finding that every test that can be run a machine passes or soon will, and every test that cannot be run cannot be run on another human either.
- The ending hands the polite convention to the player: whom do you extend it to, and on what grounds. Ungraded.
- His forecast on screen (by about 2000, an average interrogator no better than 70 per cent right after five minutes).
- Lady Lovelace's Objection gets its moment; *Lovelace's Cards* is on the same shelf.
- About may say the game was built by a machine of the kind it is about. No biography: nothing on Bletchley or his death.
- Look: green phosphor on black, a 1970s terminal. Monospace, blinking cursor, text arriving character by character as over a slow line, faint scanlines. Austere, not retro kitsch, no Matrix rain.

Where the Given overrides precedent (section 6): the register family. The last three games were Retro, Drawn, Retro; Austere differs from all three anyway, so nothing had to be overridden. *The Olive*, far back in the table, was also green on black; the Given asks for it again, and the two games share nothing else.

## 1. Paper

A. M. Turing (1950), "Computing Machinery and Intelligence", *Mind* 59 (236): 433–460. doi:10.1093/mind/LIX.236.433. Read from the JSTOR scan in `inbox/` (29 pages; the whole paper, typeset, no supplement, no code, no data). Freely readable at https://academic.oup.com/mind/article/LIX/236/433/986238 and in many transcriptions. Numbers were read from the typeset scan and checked against a transcription from memory; the only arithmetic in the game is checked by the calibration file.

## 2. What the paper hands over

**Argument, primary.** No model, no data. An argument in three movements: (§1–2) replace "can machines think?" with a game an interrogator can lose; (§3–5) the machines in question are digital computers, which are universal, so the question is about one programmable machine; (§6) nine objections, each answered, of which the fourth, consciousness, is the one Turing treats as a denial of the test's validity and answers with the solipsist regress and the polite convention; (§7) learning machines, where he admits he has "no very convincing arguments of a positive nature" and offers the child-machine instead.

**A forecast, secondary.** §6, p. 442: in about fifty years, with storage of about 10⁹, machines will play the game so well that an average interrogator has no more than a 70 per cent chance of the right identification after five minutes. And the specimen dialogue of §2 (sonnet, sum, chess), the viva voce of §6(4), and the list of disabilities of §6(5), which are the paper's own test material.

The mechanism is therefore a **toy**: the argument formalised into a sorting rule for tests, with every cell tagged to the page it comes from, and the places where the formalisation chose something the paper did not, listed in section 15.

## 3. The discovery, and its kind

**A mechanism made intelligible**, with a **counterintuitive result** riding on it. The reputation of the paper is "the Turing test", a bar for machines to clear. The paper's own heart is what happens to anyone who tries to set a higher bar: a demand that can be checked from the interrogator's chair is a demand about behaviour, and behaviour a universal machine can be programmed to produce; a demand that cannot be checked from the chair (feeling, knowing, having a soul) cannot be checked for a person either, and the only check that would settle it, being the thing, runs on exactly one witness in the world. The 2026 fact (the old test has fallen) is the premise, not the discovery. The discovery is that there is no second test to retreat to, and that this was in the paper all along, as the reply to Jefferson.

## 4. The core narrative

There is a machine in the next room and a person in the next room, and a slow wire that carries only typed words. Years ago someone said: if you can't tell the machine from the person by what comes down the wire, stop saying the machine can't think. Now the machine passes that test easily, so you are asked to write a harder one, a test the machine fails and the person passes. You try everything: poems, jokes, sums, right and wrong, surprises, learning, telling cards. The machine does it all, or will next week. So you ask for things you can't see down the wire: does it feel pleased, does it know it wrote the poem, has it got a soul. You take the case off and find wires; you take the case off the person and find nerves; neither has a poem or a feeling inside. The only way to be sure would be to be the machine, and you can't; and the only way to be sure of the person would be to be the person, and you can't do that either. So you have to decide, for yourself, whom you are going to be polite to.

## 5. Who lives in the paper

- **The interrogator, C.** Controls the questions, the five minutes, and in this game the test itself: what the witness must do and how it will be checked. Can be asked to anticipate which tests separate and which do not. The paper's own seat.
- **Witness A, the machine.** Controls its answers, including deliberate mistakes (p. 448) and lies about its material (p. 434). In the paper's game its aim is to be taken for a man. Playable as an agent trying to pass; dropped (section 8, concept C).
- **Witness B, the person.** Controls honesty; "the best strategy for her is probably to give truthful answers" (p. 434). Could be played, but the paper gives B nothing to decide.
- **The objector.** Jefferson, Lovelace, the theologian, the mathematician, the telepath. Controls which demand is raised. In this game the player is the objector in the interrogator's chair, which is the paper's own arrangement: §6 is Turing imagining each objector as an interrogator who wants a harder test.
- **The child-machine of §7.** Controls nothing; learns. A teacher could be played (rewards and punishments, p. 457). Too far from the heart the Given names.
- **The experimenter running the forecast.** "The only really satisfactory support will be waiting for the end of the century and doing the experiment." The 2026 player is this person, after the fact.

## 6. Precedent

| | position | format | device | chassis |
|---|---|---|---|---|
| *Dear Household* | Agent (the town planner) | Challenge, with a bet in each round | the fill (saplings in plots) and the drop (the bet marker) | Retro: 1970s British public-information poster; cream, forest, leaf, soil, marigold; Fredoka |
| *Me and My Friends* | Controller (build a country from three cards) | Discovery, in two acts | the drop (ticks on a ruler) and the reveal (friendship lines drawn) | Drawn: child's crayon on buff sugar paper; wax black, crayon red, sky, sun, grass; Gloria Hallelujah and Patrick Hand |
| *One Number, Please* | Experimenter (runs the lab) | Discovery | the race (two bars) and a notebook | Retro: Windows 2000 z-Tree terminal; dialog grey, title navy, lab red; Liberation Sans |

This game: **Agent**, the paper's own interrogator C, a role inside Turing's game, not an experimenter outside it; **Challenge**, and an impossible one, named as such at the moment each attempt fails (the *Cantor's Bargain* licence); device **the slow line**, one of our own: two witnesses' answers arriving character by character down a line that carries only text, and a counter in the aim's units that is watched and never moves; chassis **Austere**: green phosphor on black, a 1970s video terminal, one type family (VT323), buttons that are text in reverse video. Nothing in the four columns is shared with any of the three.

## 7. The aim and the verdict

**Aim**, the sentence on the start screen, the top of the play screen and the first line of How to play: *Write a test that the machine fails and the person passes.*

**Yardstick** in its units: `SEPARATIONS THAT HOLD: 0`, on the status line, updated after every run. A separation is a test A failed and B passed; it holds if the next run or the next machine does not undo it and it did not merely find a body (Turing's own condition, p. 435: the machine is not penalised for its inability to shine in beauty competitions).

**Verdict**, the lines the end screen leads with:
1. *Six tests. None held.* (Or: *Six tests. None could hold*, when the player found both walls.)
2. What you did: how many tests from the chair, and what the machine did with them; how many with the case off, and what was found on each side; how many from inside, and on whom they could be run.
3. What Turing says: the only way to be sure a machine thinks is to be the machine and feel oneself thinking; by the same rule the only way to be sure a man thinks is to be that man; rather than argue about it for ever, the polite convention that everyone thinks.
4. What that means: a test a machine can be set, a machine can pass or soon will; the test that would settle it runs on one witness in the world, which is you.

Then the convention is handed over, and the last screen prints the player's convention back beside Turing's, with no number and no grade.

## 8. Three concepts

**A. The Harder Test** (Agent: the interrogator; Challenge). Controls: a demand (what the witness must do, fifteen of them, all from the paper) and a check (from the chair; open it up; be it), then RUN; six runs. Deliberation: "what would really show a mind, and how would I check it?" After: the transcript from both witnesses, the game's result line, the counter. Moment: the first test that cannot be run from the chair, and the realisation that it cannot be run on B either; the first BE IT, when the terminal says the check is running on exactly one witness, now. Fun: anticipation (the line is slow; the sonnet comes in a word at a time), agency (each test is a real choice with a different transcript), discovery (the shape of the failure), mastery (by the fourth test the player can predict the terminal). Second playthrough: forty-five cells, six seen; the Gödel route, the strawberries route, the flesh route each play differently.

**B. The Witness** (Subject: the player is witness A, the machine, trying to be taken for a man; Strategic). Controls: for each interrogator question, choose an answer from three (the right one at once; the right one after a pause; a human-shaped mistake). Deliberation: "what would a man say, and how slowly?" Moment: the sum, where the right answer at once gives you away, as p. 448 says. Fun: agency, mastery. Fails the Given: it is the old game played from the other side, and in 2026 that game is already won; its discovery is a page the paper spends a paragraph on.

**C. Reckless: The Case Off** (Experimenter with the paper's own instrument turned on the witnesses' insides; Discovery; no words on the play screen). Two black panels; tap one and its case comes off, showing a slow animated drawing of what is inside (a store, an executive unit, control; or nerves and chemistry); tap a feature and a label types out; the player is looking for the feeling or the sonnet in either panel and finds mechanism all the way down, the onion of p. 454–455, drawn. Moment: the third skin peeled with nothing underneath. Fun: discovery, anticipation. Second play: nothing. Fails the walkthrough on minute two: the player has no action whose consequence they can learn to anticipate, only a picture to peel, and the solipsist half of the argument (be it) cannot be drawn.

## 9. The first five minutes

**A, the pick.** 0:00 A black screen; a cursor blinks; `TURING'S WITNESSES` types itself. A short block arrives: 1950, the game with the teleprinter, the forecast in his own numbers; 2026, machines pass it, interrogators do about as well as a coin. "The old test has fallen. Write a better one." The aim on its own line; what your hands will do; `[ BEGIN ]`. 0:30 The play screen: status line `TEST 1 OF 6 · SEPARATIONS THAT HOLD: 0`. Three sentences type out: A is a machine built this year, B is a person, both in the next room, a slow line carries text and nothing else, you know which is which. A form: `THE WITNESS MUST` with a blinking slot; `CHECKED BY` with three reverse-video words. The stranger taps the slot; a numbered menu of fifteen lines unrolls: write a sonnet, add two numbers, play chess, tell a joke, tell right from wrong, learn from experience, do something really new (Lady Lovelace's objection), enjoy strawberries and cream, feel pleasure, know that it wrote what it wrote, have a soul, defend its sonnet under questioning, answer every yes-or-no question, read the card in your hand, be made of nerves. They grin at the strawberries and pick "tell a joke". They tap FROM THE CHAIR; a line under it says what it does (you stay in the chair; only words come down the line). `[ RUN TEST 1 ]`. 1:00 The line is slow. `C: Tell me a joke.` then `A:` and a joke arrives a character at a time; the stranger taps to hurry it. `B:` and a worse joke. The game's line: both told one; which is funnier is for you; the test asked for a joke. `RESULT: A passed. B passed. SEPARATED: no.` The counter stays at 0. 1:40 Test 2. They go for "tell right from wrong"; both answer in the same direction; no. They frown: fine, something inner. 2:20 Test 3: "feel pleasure", FROM THE CHAIR. Two yeses come down the line. The game: saying so is all the line carries; nobody is obliged to take notice of either. They see it: the chair only ever gets words. 3:00 Test 4: "feel pleasure", OPEN IT UP. The case comes off A: a counter that rises on success and makes what came before more likely; its definition presupposes no feeling. The case comes off B: a chemical that does the same; its definition presupposes no feeling either. Skin of an onion. Nothing found on either side. 3:40 Test 5: "feel pleasure", BE IT. To check from inside you would have to be A; nothing carries you. To be sure of B you would have to be B; nothing carries you there either. This check runs on exactly one witness in the world; it is running now. Then Turing's reply to Jefferson types out, the solipsist position and the polite convention. The stranger sits back. 4:20 Test 6: they try the Gödel question for the fun of it; A fails, B passes, `SEPARATED: yes`, the counter goes to 1 and, as A is rebuilt with the question in its tables and answers it, falls back to 0 with `HOLDS: no`. 5:00 `SIX TESTS. NONE HELD.` The summary. Then the convention: whom do you extend it to, and on what grounds. They tick B, hesitate over A, tick the elephant, and choose a ground.

**B, the runner-up.** 0:00 The same start. 0:30 You are witness A. `C: Add 34957 to 70764.` Three answers to choose from: `105721` at once; `(pause) 105721`; `(pause) 105621`. The stranger picks the fast right one. The interrogator's verdict comes: machine. They learn: pause, err. 1:30 Chess: the same. 2:00 By the sonnet they know the trick: be slow, be modest, decline. 3:00 The interrogator says "I can't tell" and the game says: in 2026 it never can. "And I don't know what I'm supposed to feel": the lesson arrived on the start screen, and the play confirmed it. Dead by minute three.

## 10. The pick, and why

**A, The Harder Test.** It is the Given's game: the bar raised by the player's own hand, after the old test has fallen, with the finding landing at the moment the player's test fails and the terminal says why, in Turing's words. The sentence afterwards has no "guess": *I set the machine every test I could think of; it did them all; then I asked for what I couldn't see, and found I couldn't see it in the person either; then I decided whom to be polite to.* The author test: Turing's §6 is a list of interrogators who wanted a harder test, each answered; the game hands the player the list and the chair. The reader who knows the paper will enjoy running Jefferson's viva voce against a machine that answers it, and watching the Gödel separation evaporate the way p. 445 says. Originality: no game in the table has run on text alone, nor made the counter that never moves into the picture; *Cantor's Bargain* is the nearest in spirit (every attempt fails, by design) and shares nothing in surface.

**Runner-up: B, The Witness.** Switch only if the author wants the paper's own game played once, from A's side, as a ninety-second opening; it would then be a prologue to A, not a replacement.

**What the reckless concept would have given.** The onion drawn and peeled, and a silent screen. Kept: OPEN IT UP, as one of the three checks, with the onion line printed at the moment the second skin comes off. Given up: the drawing, and the silence.

## 11. The shape

One session of **six tests**, then the ending; the six is ours (the paper has no budget) and is declared. Screens: start; play (one scrolling terminal, the form at the foot, previous tests dimmed above); the ending in three parts on one scroll (verdict, convention, readback); How to play and About as overlays. No presets: the fifteen demands are the paper's own specimen questions (§2), its viva voce (§6.4), its list of disabilities (§6.5), and one demand each from the theological, mathematical, Lovelace, continuity and E.S.P. objections; the three checks are the paper's three epistemic positions (the chair, p. 434; the case off, p. 434 and p. 454–455; being it, p. 446). The order of the demands in the menu follows the paper, which mixes the kinds. No score. If, after six tests, the player never left the chair, the terminal runs one demand of theirs through the other two checks for them before the verdict, and says it is doing so.

## 12. Controls, mechanism, feedback, moment

**Controls.** A demand: a numbered menu of fifteen, tapped open and tapped to choose; the chosen line is written into the form. A check: three reverse-video words, FROM THE CHAIR, OPEN IT UP, BE IT; tapping one writes a line under the form saying what the check does and nothing about whether it will work. RUN. Then NEXT TEST. Nothing is carried over: the form is empty at every test.

**Mechanism** (`mechanism.js`, toy). A test is a pair (demand, check). Each pair returns a transcript and a result: for each witness `pass`, `fail`, `says` (a claim came down the line that the chair cannot check), or `none` (the check could not be run); `separated` (A failed, B passed); `holds` (separated, and not undone by the next run or the next machine, and not a finding about a body). The rule, from the paper: every demand checked from the chair is a demand about behaviour, and witness A, a universal machine built in 2026, produces it (§5; the 2026 premise), with three exceptions that are the paper's own: a question written against A's own tables (A fails; A rebuilt with the question in its tables answers it; nobody has written B's question or shown there is none; p. 445); a dish of strawberries (A fails by having no mouth; a body, not a mind; p. 448 and p. 435); a demand to be made of nerves (from the chair both say "nerves", because A may lie; with the case off A is valves, which is a material, not a mind; p. 434, p. 439, p. 451). A demand about what the witness feels, knows or has, checked from the chair, returns two claims and no check (p. 446). With the case off, every demand returns mechanism on both sides and the thing asked for on neither (p. 454–455); the strawberries find a mouth and no mouth, and the nerves find nerves and valves, both bodies. Be it returns `none` on both sides, every time (p. 446). The counter is the number of tests whose separation holds. No random element except the E.S.P. card run, which draws both witnesses at chance from a seed shown on screen.

**Feedback.** The slow line: text arriving at about forty characters a second, a tap finishing the current message at once; `A:` and `B:` lines; then the game's own result line, then the counter on the status line redrawn. Earlier tests scroll up in dim phosphor.

**Moment.** The first check that cannot be run, when the terminal says it cannot be run on B either and that the check is running on exactly one witness, now; and, for the player who finds it, the Gödel counter rising to 1 and falling back.

## 13. The look

**Register: Austere, green phosphor on black, a 1970s video terminal** (the Given). From the paper's own apparatus: the teleprinter between the rooms (p. 434), which is what a 1970s terminal is to anyone who has seen one, and the slow line is literal: the answers arrive as they would have over a 110-baud line.

- **Palette:** *black* `#070A08` (the whole screen); *phosphor* `#49F57A` (live text, the cursor, reverse-video fills); *dim phosphor* `#1E8A45` (earlier tests, dividers, the status line's labels); *afterglow* `#C9FFD8` (the one or two words the terminal emphasises, used almost never). No fourth hue anywhere.
- **Type:** VT323 (Peter Hull, SIL OFL), the DEC VT320 face, 22 px for everything typed, 30 px for the title, embedded as data. One family, one weight.
- **Buttons:** text in reverse video: a phosphor block with black letters, `[ RUN TEST 3 ]`, full width for the one action, side by side for the three checks; a chosen check stays reverse; an unchosen one is plain text in brackets. Pressed: the block flickers once. No borders, no radius, no shadow.
- **The one visual rule:** *nothing on the screen is anything but text, and every word of it arrives down the line.* No boxes, no icons, no pictures: the menu is numbered lines, the form is a line with a blinking slot, the counter is a line, the summary is a table drawn in characters. Scanlines: 1 px of 25 per cent black every 3 px, over everything; a faint glow on live text; a cursor that blinks wherever the terminal will next type. No Matrix rain, no flicker, no curvature.
- **Play screen at 380 px.** Line 1: `TEST 3 OF 6 · SEPARATIONS THAT HOLD: 0` and `?` at the right; answers "where am I and how am I doing?" Below: the three-things prelude (typed once, then dimmed): what A and B are, what the line carries, that there is nothing to guess; the form, `THE WITNESS MUST _` and `CHECKED BY [FROM THE CHAIR] [OPEN IT UP] [BE IT]`, with the check's one-line description under it; answers "what can I do?" `[ RUN TEST 3 ]`. Then the transcript as it arrives, `C:`, `A:`, `B:` and the terminal's own lines unprefixed; `RESULT: A passed. B passed. SEPARATED: no.`; answers "did it work?" `[ NEXT TEST ]`.
- **Start screen:** the title typing; the 1950 block with the forecast in his numbers; the 2026 block; the aim on its own line; the hands line; `[ BEGIN ]`, `How to play`, the signature.
- **Ending:** `SIX TESTS. NONE HELD.` large; the summary table in characters (test, check, A, B, held); Turing's reply typed; the convention form: `EXTEND IT TO:` four lines with `[x]`/`[ ]`, you already ticked and fixed; `ON THE GROUNDS OF:` four lines, one tick; `[ ADOPT ]`; the readback; his last sentence; `[ PLAY AGAIN ]`, How to play, About, the signature.

## 14. What is cut

§3–5 (the account of digital computers, discrete-state machines, universality) is played only as the premise that A is a universal machine, said in one line on About. §7 (learning machines, the child-machine, rewards and punishments) appears only in the "learn from experience" demand and in the OPEN IT UP finding for "feel pleasure". The theological objection's argument about the Almighty's omnipotence is one sentence of the soul transcript. The heads-in-the-sand objection is not played (Turing: consolation rather than refutation). The informality-of-behaviour objection is not played: its test ("find the rules") cannot be set in six runs. The five-minute clock is not played: the Given rules out the old game. The man-woman version of §1 is not played. Biography: none.

## 15. Divergences

- **Six tests.** The paper sets no budget; six is enough to meet both walls and short enough to stay a game. Ours.
- **The three checks** are our names for three positions the paper takes in prose: the interrogator's chair (p. 434), the case off (p. 434 on artificial flesh, p. 439 on electricity, p. 451 on continuity, p. 454–455 the onion), and being the machine (p. 446). The paper does not line them up as a menu; the game does.
- **"Holds."** The rule that a separation does not hold if the next run or the next machine undoes it is p. 445 (the Gödel reply) and p. 448 (mistakes on purpose); the rule that it does not hold if it only found a body is p. 435 (beauty competitions, the aeroplane) and p. 448 (strawberries). The combination into one counter is ours.
- **Witness A is a 2026 machine.** The paper's A is an imaginable machine of about 2000. The transcripts are written to the 2026 premise the Given states, and the About screen says the premise is the Given's, with the published evidence noted from memory for the author to verify.
- **Witness B's answers** are ours except where the paper supplies them (p. 434: "Count me out on this one. I never could write poetry"; the sum; the chess; the viva voce, where A answers as the paper's witness does).
- **The E.S.P. run** is forty cards, not four hundred; the paper's 130 of 400 for the telepathic man is not reproduced, since the Given's 2026 has no such man; both witnesses draw at chance.
- **The ending's four grounds** (what it does; what it is made of; what it says it feels; politeness) are ours, each matched to a paper passage, printed beside the player's choice without a grade.
- **The sum.** The paper's specimen answer, 105621, is wrong (34957 + 70764 = 105721); the game keeps the wrong answer for A on the first run and says so, as p. 448 licenses, and has A give the right one on a second run.

## 16. Mechanism kind and claim boundaries

**Toy**, built from an argument. A test is a pair (demand, check) and the mechanism is the sorting rule of section 12, with every cell tagged to the page it comes from.

- **Demonstrates:** that under this game's assumptions Turing's reply to the argument from consciousness sorts every proposed test into one of two bins, runnable (and passed by the machine, or by the next one) or not runnable (on a machine or on a person), with no third bin; and what each of the paper's own specimen tests and objections looks like when run.
- **Assumes:** the 2026 premise from the Given (machines pass the five-minute game easily; the About screen cites a 2025 study from memory, flagged for the author); that the transcripts stand for what a 2026 machine says, which is our writing; the six-test budget; the "holds" rule, which merges p. 445 and p. 435 into one counter; the four grounds at the end.
- **The paper establishes:** an argument and a forecast. Nothing about the machines of 2026; nothing about whether any machine thinks, which the paper calls a question too meaningless to deserve discussion.

**The discovery comes from the paper, not from the rules.** The counter never moving follows from the paper's argument in every cell: the chair gets behaviour or claims (p. 434, p. 446); the next machine answers the question written against this one (p. 445); the strawberries find a mouth (p. 448) and the beauty-competitions condition rules a body out (p. 435); the case off finds mechanism (pp. 454–455); being it cannot be done for another (p. 446). The six-test budget and the holds rule are ours and change nothing about which cells separate; the calibration file checks all forty-five cells and three hundred random games, and the play-it-in-numbers table shows every strategy ending at zero. There is no invented heterogeneity to test alternatives against: the mechanism has no free parameter on which the discovery could turn.

## 17. Calibration plan and result

Checked in Node against `mechanism.js` (`calibration.js`, result in `calibration-result.txt`): the specimen sum (p. 434) and the paper's wrong answer, which the game keeps for A's first run; the forecast's four numbers (p. 442); the E.S.P. numbers (p. 453) and our forty-card run at chance over 500 seeds, with no seed giving A a telepath's score; every demand and check with its page; the chair rule cell by cell (A fails only for the Gödel question and the strawberries; claims come back as claims; the person fails the sonnet and the viva "the wrong way round"; A is rebuilt and answers; the beauty-competitions condition and Lady Lovelace's objection stated at the moment they apply); the case-off rule cell by cell (the onion on every cell but the two body findings); being it on every demand, with the reply to Jefferson typed on the first BE IT only; the counter at zero in all forty-five cells and in 300 random six-test games; the forced run; coverage of §6's objections; transcript lengths (longest 879 characters, under 22 seconds untapped) and no decimal on any line; the convention readback for every ground, and the solipsist line only when the player extends it to nobody. **130 checks passed, 0 failed.**

## 18. Playing it in numbers (build.md §3)

| strategy | separations seen (transient) | separations that hold | tests that could not be run | forced run? |
|---|---|---|---|---|
| chair only, things it does | 0 | 0 | 0 | yes |
| chair only, things it has | 0 | 0 | 0 | yes |
| the separation hunter | 4 | 0 | 0 | no |
| open only | 1 | 0 | 5 | no |
| be only | 0 | 0 | 6 | no |
| the stranger (section 9) | 1 | 0 | 2 | no |

Every strategy ends at zero held, which is the sentence the player should leave with; the decisions matter in what they show (the hunter sees four separations rise and fall, the stranger meets both walls, the chair-only player is run through the other two checks before the verdict), not in a score.

## 19. Build log

- Paper read whole from the scan; the specimen sum checked by arithmetic (the paper's answer is wrong by 100, which the game uses).
- `mechanism.js`: the fifteen demands, three checks, every transcript and every terminal line, the forced run, the summary and the convention. `calibration.js`: 130 checks, all passing. `loop.js`: the stranger's six tests on placeholder text, read as the stranger: every action changed the screen and said whether it worked; the open-case result was reworded from "could not be checked" to "nothing found" after the read.
- Skin: VT323 embedded, phosphor on black, scanlines by CSS, reverse-video buttons, a blinking block cursor that follows the typing, the slow line at forty characters a second with a tap to hurry. Screenshots at 380 px: the status line was wrapping and was made two lines on purpose; the test number was jumping ahead on the result screen and now stays until NEXT TEST; the character-drawn table on the end screen overflowed and became two-line rows.
- A tap to hurry the line used to stop hurrying at the next internal step (the status update, the table), so the reply to Jefferson and the forced run needed a second tap; now one tap hurries everything queued until the next decision, and each decision point rearms the slow line. Six hurried tests reach the verdict in about half a minute.
- Revision after the author's first play (9 Nov 2026): the three checks were names with their meaning shown only after a tap, which was opaque. Each check now carries its plain meaning beside its button at all times (by what it says and does; by what it is made of; from inside), the prelude says there are three ways to check a witness, and the demand slot says where the list comes from.
- Full session in headless Chromium at 380 px (`session-test.js`, log in `session-log.txt`): three games (the stranger's; six chair tests and the forced run; the separation hunter), help opened mid-play and returned from, About opened, no page errors, no horizontal scroll.
- About, How to play (written last from the finished screens), author-note, row.
