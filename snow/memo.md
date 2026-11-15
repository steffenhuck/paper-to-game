# Snow's Cloudy Glass — design memo (fourth build, 15 November 2026)

The third build and its memo are in `previous/`; the second in `previous/second/`, the first in `previous/first/`. The paper reading of the first memo and the design argument of the third stand; this memo records what the fourth changes and why.

## 0. Given

Mine; author title, *Snow's Cloudy Glass* kept. The brief after the third build, which the author called much better: build the best game I can imagine; the type was too small to read on a laptop even with glasses; the verdict must centre on identification, first whether it was achieved and only then how fast, and a right answer must not count as identification when the data do not carry it. Before that, two questions from the author were answered in conversation: the window should take an entry on every test (it only took entries from streets where both waters had been tested, which looked like a bug), and whether there is an optimal strategy, which there is: anchor on a crape door in a mixed street, then test that street's other doors until one comes up blue; it concedes the doctor at the second or third glass in most games, where going to the crape takes nine or more. That analysis set the shape of this build: the count of glasses to the concession is the score, and the budget is a cap, not a target.

## 1–5. Paper, discovery, narrative, players

As in the third memo: Snow (1856), the grand experiment read as spatial identification. A cause that varies house by house (the pipe) can be told apart from everything that varies district by district (the air, the crowding, the poverty) by comparing within the district; the map's six streets are Snow's subdistricts with their real shares of each water, placed at random within the street, and crape at the paper's rates times ten. The player is Snow with the glass; the parish doctor is the Board's way of reading a map.

## 6. Precedent

Unchanged from the third memo (Leibniz's Worlds, Voting with Arrow, Test It Like Turing): this game shares none of their four dimensions. Device of our own: the map that colours under the hand, with a tally on every street, and the window that takes every test, hollow until its street has both waters.

## 7. The aim and the verdict

**Aim:** *Make the water stand alone: test houses so that the doctor cannot say "that is just the inland air", with as few glasses as you can.*

**Yardstick during play:** the window (every tested house, hollow while its street has only one water tested, solid once it has both), the street tallies, the line in the game's voice (all tests; same street), the doctor's line, and the count ("four glasses used · conceded at the third · six left").

**Verdict,** in this order: a headline on identification (*The water stands alone* / *Nearly: a gap, but a small one* / *Still tangled*); what the tests show, in the game's voice; the sentence, judged against the tests and not against the answer ("Right, but nothing in your tests says so. A right answer is not identification"); how many glasses, against the two benchmarks; what Snow found; the side of town (where the player tested brown houses on both sides); had yours stood; the map with every pipe revealed; the two windows; the later weeks.

## 8–10. The concept and the pick

The third build's concept (one map, one tool, one decision) with three changes: the doctor concedes on screen at the glass that makes the same-street evidence clean, and the count is fixed there; the player may write to the Board at any time after the first glass, up to a cap of ten; and the verdict is built around identification. The runner-up considered in conversation, giving the glasses after the concession a second job (sharpening the estimate of how much deadlier), was set aside as a second idea for a small game; the glasses after the concession may still be spent, to see more of the map, and do not change the count.

**Author test.** The concession as a moment on screen, the count as the thing to beat, and a verdict that calls a right guess a guess.

## 11. The shape

One map; up to ten glasses; the doctor's concession when it comes; one sentence; the verdict. Three to five minutes; replayed to beat the count.

## 12. Controls, mechanism, feedback, moment

Controls: tap a house; *Add the silver drops*; *Another house*; *Write to the Board* (from the first glass); *Keep testing* after the concession; one of three sentences; *Back to the map* from the sentence screen while glasses remain. Mechanism: as before, plus `concededAt` set in `test` the first time the evidence is clean, `canWrite` from the first glass, and the five adaptive strategies (random, crape first, the doctor's sides, one house per street, anchor and hunt) that stop at the concession. Feedback: the glass, the painted door, the tally, the window filling and hardening, the line, the doctor, the count. Moment: the concession, in a rule box with his line.

## 13. The look

The handbill, with larger type: body 16.5 px on a phone and 18 px on a laptop, where the bill widens to 600 px so the map and the window scale with it; the map's names, tallies and labels one to two points larger than before; the lines under the map 14 px.

## 14. What is cut

The fixed budget of eight as a target. The sentence as the only way out.

## 15. Divergences

As in the third memo; and the count and the cap are ours, with the benchmarks the verdict quotes taken from the strategy table below.

## 16. Mechanism kind and claim boundaries

**Reconstructed**, as before. Demonstrates: that tests on one side of town cannot separate the water from the side and tests in one street can; that the comparison costs two or three glasses to a player who goes to the mixed streets and nine or more to one who goes to the crape. Assumes: the map's construction, the floors, the doctor's rule of concession (one street with a tested brown crape house and a tested blue house, the brown houses worse by the paper's gap or no blue crape at all), the cap. The paper establishes the shares, the rates and the identification argument. The verdict judges identification by the tests alone; the sentence is read against them.

## 17. Calibration plan and result

`calibration.js`, 44 checks, all passing (`calibration-result.txt`): the rates and the rows as before; the map over 3,000 unconstrained seeds; the rules of a test; the sentence allowed from the first glass and once; the evidence states in sequence; the concession at the glass that makes the evidence clean, fixed there while further glasses are spent; the doctor's objection and his concession line; the verdict's bands for identified and wrote the water, wrote the water without identification (called a guess), identified and wrote the air; the speed line naming the glass; the strategies' concession curves (below); robustness at compression 5 and 20 without floors and at caps of six and fourteen; no decimal, NaN, Infinity or undefined in 10,000 lines.

## 18. Playing it in numbers (build.md §3)

3,000 maps, `numbers.js` → `numbers-log.txt`. Each strategy is adaptive and stops at the concession or at the cap.

| plan | conceded by glass 2 / 3 / 4 / 6 / 10 | never within ten | median glass |
|---|---|---|---|
| anchor and hunt (a crape door in a mixed street, then its street until a blue) | 56% / 87% / 96% / 99% / 100% | 0% | 2 |
| anywhere at random | 2% / 5% / 9% / 19% / 44% | 56% | 7 |
| the crape doors first | 0% / 0% / 0% / 2% / 39% | 61% | 9 |
| one house per street, then random | 0% / 0% / 0% / 0% / 38% | 62% | 8 |
| the doctor's: inland crape against riverside houses | 0% / 0% / 0% / 0% / 6% | 94% | 9 |

Before any test, Bayes on a door: in a mixed street a crape door is brown with probability 0.87 and a door without crape is blue with 0.58; inland a crape door is brown with 0.97 but a blue is found with 0.22 a try, by the river the reverse. Read: the decision is the whole game, the gap between plans is the whole range, and the count is a fair score: two or three for the plan that understands stratification, nine or never for the plans that do not. The benchmarks the verdict quotes are these.

## 19. Build log

1. Brief and the conversation recorded in section 0; the third build moved to `previous/`.
2. `mechanism.js`: the concession and the count in `test`, the sentence from the first glass, the verdict rebuilt around identification, five adaptive strategies replacing the fixed ones. `numbers.js` as the concession table. 44 checks; one check on the concession's glass number was stated too precisely (the anchor can coincide with an earlier inland test) and was loosened.
3. `loop.js`, seed 7: a stranger's game (an inland crape door, a riverside house, then the plan) concedes at the third glass; the verdict reads as intended.
4. `template.html`: the window takes every test, hollow until its street has both waters; the count on every panel; the concession panel; *Write to the Board* from the first glass; the verdict in the new order; type enlarged throughout and the bill widened on a laptop. `about.html` updated.
5. Session in headless Chromium at 380 × 760, seed 7 (`session-test.js` → `session-log.txt`): the stranger's game with help mid-play, a glass after the concession, About; then the doctor's way to the cap and a right guess, judged as a guess. No errors, no horizontal scroll.
6. Self-review from the screenshots as before; the type checked at phone width and at 600 px.
7. Session length not measured by a person: two to five minutes by the number of taps.

## 20. Revision 1 (15 Nov 2026): one slope, consistent headings, one meaning per mark

After the author's play of the fourth build. (1) The river band read as a stage marker, so the map's foot is now a wavy Thames in the water colour and its head "higher ground, inland" in the same style: one slope, not two stages; the author's question whether to split the experiments was answered no, because the lesson needs the side of town and the water to run together across one map. (2) The row headings were inconsistent (a tally where tests existed, the street's phrase elsewhere, and the same on the revealed map): now the right-hand side is always the tally during play ("no glass yet" where none) and always the whole street's truth on the revealed map; the phrases moved to a legend under the map. (3) The revealed map drew untested doors pale, which read as a third and fourth colour: now every door is in the full colour of its water and a ring marks the doors the player tested, so colour means water and nothing else.
