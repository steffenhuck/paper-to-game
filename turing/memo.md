# Turing's Witnesses: the three-module build (11 November 2026)

The earlier memos are in `previous/` (the first build's full design memo in `previous/memo.md`; the five-round rebuild in `previous/five-rounds/memo.md`; the eleven-question build in `previous/eleven/memo.md`). This memo records what changed and why, and the build.

## 0. Given, from the conversations after the eleven-question build

The author liked the eleven-question game and asked for two more modules: first sentences of English novels against a machine's; and a module where the machine goes first and a person answers. Then: a fixed sequence, module 1, 2, 3; five pairs drawn from each, no option of length ("three times five is the sweet spot"); immediate feedback after each choice, no summaries between modules; the score the machine's, not the player's, put in words from the machine's side; the polite convention once, as the coda.

## 1. What the three modules test

Module 1 is symmetric: two writers, the same prompts, both blind, the machine as itself and within the person's length. Module 2 pits the machine against people at their best, novelists, who wrote without any machine in mind; the machine gets the year, a premise and the length. Module 3 reverses the order and is Turing's own game: the machine writes first, told to pass for a person keeping a diary, and a person who has read it answers. So: blind against an ordinary person; blind against a professional; and an imitating machine against a person who is trying. The difference between the three scores is the finding, and the verdict shows them side by side.

## 2. Provenance, and what was tried and not used

- Module 1: `witness-b.md` (Steffen Huck, one prompt at a time) and `witness-a.md` (a fresh session, the same rule, as itself, within the person's length). The builder's own first set, written before the person's but several times longer, is `witness-a-first.md`, not used.
- Module 2: thirteen openings verified against Gutenberg (`module2-candidates.md` lists the twenty-four candidates offered; the author chose the first thirteen). The machine's openings from a fresh session given year, premise and approximate length (`novels.md`), checked against the originals and the full texts: no shared run of four words. Little Dorrit's premise gave away Marseilles and the sun, which the memo notes and the machine's sentence shows.
- Module 3: four machine runs, the first three not used and kept in `everyday.md`: aphorisms ("a sentence about everyday modern life"); confessions ("I have never…", when allowed to say it had no moment); a novelist's moments (well written, still a writer). The author then set the diary frame and told the machine to imitate, which is the paper's game, and answered each line himself.
- On all sides: spelling checked, a final full stop and a capital to start, no word changed, each file recording the edit.

## 3. The aim and the verdict

**Aim:** *Fifteen times, two sentences: say which one the person wrote.* **Yardstick during play:** `MACHINE TAKEN FOR THE PERSON: n OF m`, in the score's own units, since the score is the machine's. **Verdict:** a five-step scale in words by the interrogator's right answers out of fifteen, the band edges set by Turing's bar (70 per cent of fifteen, rounded down to ten): 14–15 failed completely; 11–13 failed Turing's test; 8–10 passed Turing's test; 5–7 passed easily (no better than a coin); 0–4 the more human (the 2025 result). Under it the machine's score, the player's line, the three modules' lines, who the witnesses were, Turing's proposal of this experiment and his reply to Jefferson, the fifteen rows; then the polite convention and its readback.

## 4. The shape and the look

Start screen (forecast; the three settings in a sentence; the aim; the bar), then fifteen questions straight through: a typed line when a module begins, saying who the witnesses are and what the machine was told (the player must be told that the machine imitates in module 3), then the question, X and Y, X IS THE PERSON or Y IS THE PERSON, RIGHT or WRONG with who was who (and the novel, in module 2), NEXT. No paper lines between questions, for pace. The chassis is unchanged: VT323 phosphor on black, the slow line, reverse-video buttons.

## 5. Mechanism kind and claim boundaries

Toy bookkeeping around real sentences: the draw, the record, the reveal, the comparison with the bar, the scale. Demonstrates how one interrogator does on fifteen of these pairs in three settings against the 1950 bar, and what the argument says once the score is in. Assumes that these pairs stand for the general case (they do not); that a word limit, a premise and a diary frame are format rules; that fifteen answers from one interrogator measure anything beyond themselves (a coin gets about seven or eight); the scale and the four grounds. The paper establishes an argument and a forecast, nothing about 2026 and nothing about whether any machine thinks. Divergences: fixed questions answered in advance, no interaction; a machine told not to imitate in modules 1 and 2, which is harder than Turing's game; the bar of ten and the scale are ours.

## 6. Calibration

`calibration.js`, 106 checks, all passing: the paper's numbers, the bar and the scale's band edges; every sentence of all three modules byte for byte against the four files, the module-1 word limit, the module-2 years, authors and Gutenberg numbers and the length rule within four words, the module-3 topics; capitals and full stops throughout; the draw over 2000 seeds (modules in order, five distinct pairs each, all 34 drawn, sides balanced); 300 random games (three introductions, the reveal names the person and the novel, the scores add up); refusals; the five bands at 15, 13, 10, 7 and 4 right; the convention; no decimal.

## 7. Playing it in numbers (build.md §3), over 500 seeds

| rule for judging | right of 5: module 1 / 2 / 3 | of 15 (bar 10) |
|---|---|---|
| always X | 2.48 / 2.48 / 2.46 | 7.43 |
| the longer is the person | 2.06 / 3.04 / 2.21 | 7.31 |
| the shorter is the person | 2.91 / 1.96 / 2.77 | 7.64 |
| the one that says "I" is the person | 2.74 / 3.04 / 2.98 | 8.76 |
| the one with two sentences is the person | 1.60 / 3.40 / 3.95 | 8.95 |

No rule beats the bar. Module 1 is balanced by its word limit; in module 2 the novelist tends to write the longer sentence; in module 3 the person wrote two short sentences where the machine wrote one, which is right about four of five there. These are tells about the writers; the About page names them and the sentences stay as written.

## 8. Build log

- The eleven-question build moved to `previous/eleven/`.
- `mechanism.js` generated from the four witness files (module 1 from the previous mechanism's verbatim strings, modules 2 and 3 parsed from `novels.md` and `everyday.md`), with the draw, the judgement, the scale, the summary and the convention. `calibration.js` and `loop.js` rewritten; the loop read as the stranger: a module line, the question, two sentences, a choice, RIGHT or WRONG with who was who, the count.
- `template.html`: the start screen, help, play flow and verdict rewritten for three modules; the status line in the machine's units; the reveal only, no paper line, between questions. About rewritten with the provenance of all three modules and the sets not used.
- Full session in headless Chromium at 380 px (`session-test.js`, `session-log.txt`): two games (the shorter-is-the-person judge with the help opened mid-play; the longer-is-the-person judge ending as a solipsist), About opened, no page errors, no horizontal scroll.
