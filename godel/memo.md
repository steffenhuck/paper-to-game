# Gödel's Loophole — design memo (second build: the Marker)

Gödel (1931), On formally undecidable propositions, as chalk on a green board, rebuilt for a reader who is not a logician: a marking robot that ticks or crosses every line on the board and is never wrong; lines numbered by their place; write a line about the Marker's own mark on the line you are writing, and no mark comes out right. Then close the loophole three ways and watch each fail as the paper says. The first build, with the paper's shapes and holes on the board, is in `previous/` with its memo; sections of that memo that still hold are summarised here, not repeated.

## 0. Given

Mine; author title; the blackboard idea taken up in the first build and kept. After playing the first build the author said it was the best version so far and still very difficult to understand, and asked for a scenario a very smart teenager could follow, leaving the choice to the builder. Diagnosis: the first screen asked the player to hold three abstractions at once, a rulebook that proves, shapes with a hole numbered by their line, and a sentence about a shape filled with a number, so that the loophole read "Rulebook 1 does not prove shape 6 filled with 6". The double substitution is the paper's own mechanism, and it was the thing in the way. This build keeps the board and the two acts and replaces the first act's objects.

## 1–3. Paper, what it hands over, the discovery

As in `previous/memo.md` §1–3: Gödel (1931), *Monatshefte* 38:173–198, DOI 10.1007/BF01700692, read in Meltzer's translation; an argument that is also a construction; a counterintuitive result delivered by a mechanism made intelligible, in the every-attempt-must-fail shape.

## 4. The core narrative

There is a marking robot in the classroom. Write any sentence about whole numbers on the board and it marks it: a tick if the sentence follows from its rules, a cross if the opposite does. It is never wrong. Hilbert said that with good enough rules such a robot marks everything. Gödel wrote, on line 6 of the board: "The Marker will never tick line 6." If the Marker ticks it, the line was wrong, and the Marker has marked wrong. If the Marker crosses it, it is saying the line is false, that it does tick it; but it crossed it. So the Marker can do neither, and the line, which says it will never be ticked, is true. Make the line a rule and the Marker is a new Marker, with a new line of the same kind. Make the opposite a rule and the Marker swears it ticks line 6 at some point and says no to every day you ask about. Ask the Marker to tick "I never mark wrong" and it cannot: that promise would let it tick line 6.

## 5. Who lives in the paper

As before: the system (the Marker), the constructor (the player writing lines), the axiom-adder (the player adding rules), the sentence 17 Gen r (line 6), the proof relation x B y (the days).

## 6. Precedent

Unchanged from the first build: the three games before it were *Leibniz's Worlds* (controller, challenge, light in a sky, night app), *Snow's Cloudy Glass* (experimenter, discovery, window and glass, handbill) and *Voting with Arrow* (subject, strategic, rule book and check sheet, Swiss ballot). This game: agent (writes the lines, then the rules), discovery then every-fix-fails, the chalk hand as device, chalk on a green board. Nothing shared with the three. Arrow's "rule book" was stamps the player filled; here the Marker's rules are the system, and the player adds to them only in the second act.

## 7. The aim and the verdict

**Aim:** *Write a line the Marker can neither tick nor cross. Then try to close the loophole.*

**Verdict**, in words: what the paper found (a marker that marks by fixed rules and is never wrong has a line it cannot mark, and the line is true; make it a rule and the new marker has one of its own; make the opposite a rule and the marker swears a thing happens and denies every day; no such marker can tick its own promise); what you found (which line, on which try, by your hand or Gödel's; the cheap tick if met; which rule first and what the new Marker did; the bet); where you part; had yours stood. No score; the yardstick is lines written and lines without a mark.

## 8. The concepts

The three concepts of the first build stand (`previous/memo.md` §8): A, the composer of shapes; B, the coder with the paper's prime code (reckless); C, you are the rulebook. This build is A with its objects replaced: the three parts of a shape (proves or not; which shape; which number) become the three chips of a line about the Marker (will tick or will never tick; which line; and "this line" is one of the lines). What was A's double hole is now one chip. The wrong branches stay live: a number fact (always marked), a line about an earlier line (always marked, by reading the board), and "will tick this line" (the cheap tick, Löb). The only line the Marker cannot mark is "will never tick this line", which is the paper's.

## 9. The first five minutes

0:00. The board: the Marker, two lines already on it, "4 is even" with a tick and "9 is a prime" with a cross. The aim. Under the lines, a yellow line that says "line 3: make it from the chips below", two tabs, *a number* and *about the Marker*, and chips. 0:15. I tap 7 and *is a prime*; the yellow line reads "7 is a prime". *Write it on the board*. Line 3 appears in yellow, white chalk writes "7 divides by nothing but 1 and 7", and a tick draws itself on line 3. 0:35. *Next line*. I tap *about the Marker*: "Marker 1 …" *will tick* / *will never tick*, "… line …" 1, 2, 3, and "4 · this line". I tap *will tick* and 2: "Marker 1 will tick line 2". Write. "Line 2 (9 is a prime) got a cross from Marker 1. So 'will tick line 2' is wrong." A cross. I see: it reads its own board. 1:00. The chip "this line" is sitting there. I tap *will tick* and "5 · this line": "Marker 1 will tick line 5 (this line)". Write. "Line 5 is about my own mark on line 5: this very line. Try the tick: the line says I tick it, and I would have. The tick comes out right." A tick. I grin: it praised itself and got away with it. 1:30. I tap *will never tick* and "6 · this line". Write. "Try the tick: the line says I never tick it, so the tick would make it false. A wrong mark. Try the cross: a cross says the line is false, that I do tick it. But I would have crossed it, not ticked it. Wrong again. No mark comes out right. No mark." A pink loop draws round line 6 and keeps moving. "Marker 1 can neither tick nor cross line 6. That is a loophole. And since Marker 1 never ticks it, what line 6 says is so. It is true, and the Marker that is never wrong cannot say so." 2:15. *Close the loophole*. Two rules to choose from: line 6 itself gets a tick, or its opposite. I touch the first and it appears under the Marker's name. *Add it*. The name rubs out and comes back: Marker 2, with the rule in yellow; line 6 now has a tick. "Marker 2 is a Marker too, and a line can talk about what Marker 2 does." *Write Marker 2 a line*. The chips now say Marker 2. I tap *will never tick* and "7 · this line". The loop, one line down. "Make that a rule and Marker 4 has one; and so on for ever." 3:00. *Now the other rule*. Marker 3, with "Marker 1 will tick line 6" as its rule; line 6 has a cross. "Does Marker 1 tick it on day 1?" Cross: "Marker 1 looked at line 6 and gave it no mark. So no, not on day 1." Day 2, 3, 4, any day after: no, every day. "Marker 3 swears that Marker 1 ticks line 6, and says no to every day you ask about. The paper's word: ω-inconsistent." 3:45. The promise: "Marker 1 never marks wrong." Will Marker 1 tick it? I bet yes. "Suppose I could tick it. Then I never tick line 6, since that would be a wrong mark. So line 6 is right, and I would tick it. But I cannot tick line 6. So I cannot tick the promise either." No mark, and the loop. 4:15. The verdict, in chalk.

## 10. The pick, and why

Same reasons as the first build, with the first act's objects replaced for the stranger: the player still writes the paper's own variable (the sentence and its number) and runs the paper's own machine on it; the counterintuitive moment is still a loop the Marker draws, not a line the builder wrote; the three repairs still fail differently. What is new: every word on the first screen names something the stranger can picture, a marker, a line, a tick, a cross; the rule the Marker applies to a line about itself is one sentence the player can check (a mark must come out right, and it tries the tick first); and the loophole reads as a sentence, "Marker 1 will never tick line 6". The author test: Gödel would recognise the sentence, the extension, the ω-inconsistent c′ and Proposition XI; a logician finds the cheap tick (Löb). Runner-up: the feed with a fact-check bot (the same mechanism in a different room; kept out so the board you liked stays).

## 11. The shape

Two acts on one board. Act 1: two lines on the board; the player writes up to six; a line about the Marker's own mark on the line it is written on, "will never tick", ends the act; after six marked lines Gödel's chalk writes it and the player watches the Marker mark it. Act 2: a rule (either order), then the other, then the promise with a bet; the verdict. Presets are the paper's regimes: c (Marker 1), c + 17 Gen r (Marker 2), c + Neg(17 Gen r) (Marker 3), Wid(c) (the promise). No score; five to seven minutes.

## 12. Controls, mechanism, feedback, moment

- **Controls.** Two tabs; number chips 2–9 and three facts; *will tick* / *will never tick* and line chips up to "this line"; *Write it on the board*; *Next line*. Act 2: two rule boxes and *Add it*; day chips; the bet and *Let Marker 1 mark it*.
- **Mechanism (toy; `mechanism.js`).** A Marker marks a line: a number fact by arithmetic; a line about Marker w's mark on another line by reading that mark off the board (no mark there, no mark here); a line about its own mark on that very line by the rule the board states: a mark must come out right, tick tried first ("will tick" gets the tick; "will never tick" gets nothing); an added rule marks its line outright and holds in later versions. "Day k" sentences are checkable facts (x B y); the promise is settled by the chain of Proposition XI.
- **Feedback: the chalk hand.** The new line writes itself in yellow, the working in white, the mark draws itself at the line's right; a line with no mark gets the pink loop that never closes.
- **The moment.** "Line 6 is about my own mark on line 6: this very line." Two tries, both wrong, no mark, the loop; then the game's own line: it is true.

## 13. The look

Unchanged: chalk on slate green in a wooden frame on plaster; Kalam; the Marker writes in white, the player in yellow, the loophole in pink. The board now carries the marks at the right of each line, so the record the Marker reads is the record the player sees. A long board scrolls so that the line being written, its chips and the Write button are on screen together, and after a write the new line and its working are.

## 14. What is cut

As before, plus the paper's double substitution (a shape with a hole filled with its own number): here a line names a line, and "this line" is one of the names. The About screen says so.

## 15. Divergences

- **Self-reference by line number** rather than by the paper's hole-and-number construction; the About screen explains what the construction is for.
- **"Never marks wrong"** for soundness, which the paper's §1 sketch assumes and the formal proof weakens to ω-consistency; "never proves a sentence and its opposite" was the first build's wording of the promise and is the paper's Wid; the teenager's "never marks wrong" is stronger, and the chain works the same way.
- **The Marker tries the tick first** when both marks would come out right ("will tick this line"): Löb (1955), not in the paper; the live wrong branch.
- **The generous Marker** may read a cross off the board and tick "will never tick line 2"; the paper's system cannot certify a "never" without Wid. `GENEROUS = false` runs the paper's weaker Marker in the check.
- **Days** for the paper's proof numbers x; the pages of the first build (the player's own runs) are gone, since a teenager asks "when?", not "which page?".
- **Budgets** of six, three and four are ours.

## 16. Mechanism kind and claim boundaries

**Toy.** Demonstrates: a marker that is never wrong and reads its own board still has a line it cannot mark; the line is true; c + G has one of its own; c + ¬G swears and denies every day; Wid(c) would prove G. Assumes: the toy above, generous to the Marker in two places (the cross read off the board; the cheap tick). The paper establishes Propositions VI, VIII and XI for P and its ω-consistent recursive extensions, by arithmetisation the game does not play. The discovery comes from the marking rule applied to a self-referring "will never tick", not from the chips or the budgets; the check confirms it with other start lines, at every position, and under the weaker Marker.

## 17. Calibration plan and result

Plan: (1) number facts against a reference; (2) lines about earlier lines are marked as the board says; (3) every line the chips can make, at every position a player can reach (six positions, 30 to 40 lines each): all marked except "will never tick this line", and "will tick this line" ticked; (4) the paper's structure: G unmarked and true, lines about G unmarked, c + G ticks G by rule and has a new G, versions 3–5 likewise, c + ¬G crosses G by rule, keeps every other mark and says no to every day, Wid(c) unmarked through G, and for Marker 2 through its own line; (5) robustness: no start lines, one, and four including two about the Marker; the weaker Marker; (6) the heuristics table; (7) the words. Result: `calibration-result.txt`, all checks passed.

## 18. Playing it in numbers (build.md §3)

| way of writing lines (budget six) | result |
|---|---|
| number facts only | no loophole: the Marker computes |
| about the Marker, earlier lines only | no loophole: it reads the board |
| self-praise first, then flips | cheap tick on the first line, loophole on the second |
| Gödel's line straight away | loophole on the first |
| random chips, 500 players | about a quarter find it in six lines |

The random rate is higher than the first build's (1%), because the composer is smaller: one chip, "this line", is the whole trick, and a quarter of random players touch it with "will never". That is the point of the rebuild: the trick is reachable, and the number-only and earlier-lines-only players still miss it for the reasons the paper names.

## 19. Build log

- Mechanism rewritten with the marking rule; a Node session end to end before any screen. A counter kept counting after the loophole (fixed).
- Calibration: all checks passed on the first run of the new check.
- Template rewritten around the composer with tabs and "this line"; marks on the board lines; the loop on the line itself.
- Browser session at 380 × 700, two sessions: on a long board the Write button fell below the fold (fixed: numbers 2–9 fit one row, smaller chips, and the board scrolls so the line being written, its chips and the button are on screen together, with room at the bottom of the play screen to scroll into); the test's own viewport did not match its check (fixed). No page errors, no horizontal scroll.
- Not measured: session length (estimate five to seven minutes). Builder's review only.
