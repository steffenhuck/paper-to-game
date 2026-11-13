# Voting with Arrow — design memo

## 0. Given

Mine: the game carries Steffen's signature and counter. Title: Steffen is steering away from the *X's Y* form the table is full of and proposed **Voting with Arrow**; taken. Look: "some kind of Swiss style, given that there is so much voting in Switzerland"; taken, and it overrides the precedent rule in one place: *Who Started It?* is already a Swiss poster (not among the last three, but in the table), so this game is Swiss in a different way (section 13).

One thing was settled before the design and binds it. Steffen asked whether the non-dictatorship condition is a cheap trick: why rule out that the result may *coincide* with one person's preferences by luck? It does not rule that out. Definition 5 quantifies over every pair of ballots: a dictator is the voter whose strict preferences prevail "regardless of the orderings of all individuals other than i". A list that matches one voter's ballot on one Sunday is nothing; when both agree it must match both. The game puts this difference on the picture: a corner tab on every Sunday whose list is somebody's ballot, and a boss only when the tab is the same on all 36.

## 1. Paper

Arrow, Kenneth J. (1950). A Difficulty in the Concept of Social Welfare. *Journal of Political Economy* 58(4): 328–346. doi:10.1086/256963. Read online at JSTOR: https://www.jstor.org/stable/1828886. Available to the build: the PDF only (a JSTOR scan, typeset text legible throughout). The game uses no number from the scan except the page and equation references and the worked examples on pp. 329, 337–338 and 341–342, each of which the calibration check recomputes.

## 2. What the paper hands over

A **model**, primary: a social welfare function (Definition 3) from individual orderings to a social ordering; five conditions on it; and a proof, for two individuals and three alternatives, that no function meets all five (the Possibility Theorem, p. 342). Small enough to port whole and check by exhaustion. An **argument**, secondary: what the conditions mean (Part III), what the theorem means for welfare economics (Part V), and the paper's opening contrast between voting and the market on one side and dictatorship and convention on the other.

## 3. The discovery, and its kind

**A counterintuitive result**, of the kind where every attempt must fail. One would think a fair way of turning ballots into a ranking exists and only needs finding. The paper shows that any way of doing it which settles each pair on its own and respects agreement either fails to produce a ranking for some ballots or hands every disagreement to the same voter.

## 4. The core narrative

Two neighbours have to decide what goes on the village square: a fountain, a tower or a tree. Every voting Sunday each writes the three down, best on top, and somebody has to turn the two papers into one list for the village. You are that somebody. You want to be fair, and you want to be consistent: what you decided once about a quarrel, you decide the same way next time. After a few Sundays your own earlier decisions start making the new ones for you. And when a clever man checks every pair of papers the neighbours could ever hand in, he finds one of two things: a Sunday on which your decisions chase each other in a circle and there is no list at all, or that one neighbour has got her way every single time.

## 5. Who lives in the paper

- **The social welfare function**: the rule itself. Controls: the social ordering for each pair of individual orderings. Constrained by Conditions 1–5. Could anticipate: which later ballots its present answer will bind.
- **Individuals 1 and 2**: hold orderings; in the proof they are moved about by Arrow. Control: a ballot. (Strategic voting is not in this paper.)
- **The constitution-writer**: whoever chooses the function. Controls: the whole table at once.
- **Arrow**: chooses the pairs of orderings that show a function failing; the proof is a sequence of them (eqs. 1–8).
- **The dictator** of Definition 5, and the "imposed" ordering of Definition 4: the two ways out.
- **The alternative that dies** (p. 337), and the rank-order method's voters (pp. 337–338).

## 6. Precedent

The three most recent builds (by first commit; the README table lags the folders):

| | position | format | device | chassis |
|---|---|---|---|---|
| *Test It Like Turing* | forecaster-judge: say which sentence is the human's | discovery by repeated judgement | the bet and the card | Retro: 1970s terminal, green on black, monospace |
| *Ostrom's Pond* | controller: choose a governance card for a village | challenge over ten rounds, then an unplayed round | the row of villagers and a drawn count of fish | Drawn: a child's felt-tip in a squared exercise book, Schoolbell and Short Stack |
| *Lehmann's Shadow* | agent: you are an earthquake wave | discovery by aiming, then a second act | the trajectory drawn on the paper's own figure | Instrument: a lit geological plate on basalt, Fraunces and DM Mono |

This game: **subject** (the player *is* the thing studied, the social welfare function, built answer by answer); **strategic** (Arrow picks the ballots in response to the player's rulings); device **of our own**, the *rule book and the check sheet* (six stamps that fill, then a 6 × 6 sheet of every possible Sunday struck through where there is no list); chassis **Clean/Austere: a Swiss ballot paper**, white, red and black, Inter. None of the four is shared with the three above. Against the older *Who Started It?* (Swiss poster): that was cream stock, orange and green overprinting circles, lowercase Archivo; this is a white official form, red and black with no mixing, boxes and crosses.

Also in the table: *Cantor's Bargain*, the other game in which every attempt must fail. There the player attacks a claimed list; here the player builds the thing and it fails or turns into a boss under their hands.

## 7. The aim and the verdict

**Aim, as the player reads it:** *Give the village a list on every Sunday that could ever come, without making one voter the boss.*

**Verdict, as the end screen leads** (one of):

- *Your rule book gave a list on 33 of the 36 possible Sundays. On 3 there was none.* / *Nobody is the boss; and no rule book of this kind does better than 34 without one.* / *Arrow, 1950: the only rule books that never fail are the two where one voter wins every disagreement.*
- *Your rule book never fails: a list on all 36 Sundays.* / *And on all 36 the list is Anna's ballot. Every ruling went her way; Beat's ballot changes nothing.* / *Arrow, 1950: that is the only kind of rule book that never fails. His word for Anna is dictator.*

The score is the number of the 36 Sundays that have a list, against 34 (the best without a boss) and 36 (a boss). The count gives every pair of ballots equal weight: that is ours, and the About screen says so. The paper's finding is the wall between 34 and 36, not the number 34.

## 8. Three concepts

**A. The Drafter** (controller; challenge). Six three-way switches, one for each way the two voters can disagree about each pair; set them all, run the 36 Sundays, read the struck-through squares, amend, five drafts. *Thinking before pressing:* which switch to give to whom. *After:* the sheet. *Moment:* the draft that finally clears the sheet has every switch on the same voter. *Fun:* agency, mastery. *Replay:* hunt for 34. Weakness: the first screen is six abstract switches with nothing concrete behind them.

**B. The Troublemaker** (experimenter; discovery). Real voting methods, one after another: majority with three voters, points, plurality with a run-off. The player writes the voters' ballots to make each method trip: a circle under majority, a winner who changes when a loser withdraws under points. *Thinking:* which ballots would break this one. *Moment:* every method trips; the two that do not are one person deciding and a result fixed in advance. *Fun:* discovery, mastery. *Replay:* little. Weakness: the menu of methods is ours, and "all of these fail" is induction from five cases where the paper has a proof.

**C. The Rule** (subject; strategic; **the reckless one**). The player is the social welfare function. Each Sunday two ballots arrive and the player posts the village's list. Where both voters agree, the list must agree. Where they disagree, the player rules, and the ruling is kept: the same disagreement about the same pair gets the same answer ever after (Condition 3 as precedent). Arrow chooses the ballots. First he leaves room; then he hands in the ballots on which the player's own rulings leave exactly one list, so a ruling the player never chose enters the book (this is eqs. 1–6 of the proof, lived). When the book is complete Arrow checks all 36 pairs of ballots. *Thinking:* what will this ruling cost me later; who has had their way so far. *After:* new stamps in the book; later, Sundays with one list left; then the sheet. *Moment:* the forced Sunday ("I never chose that"), then the struck-through squares, or the sheet with Anna's corner on every square. *Fun:* anticipation, agency, discovery, mastery. *Replay:* 135 paths to ten different scores, a boss on six of them; the best without a boss takes finding. Why reckless: the player is an abstraction, the middle of the game takes choice away on purpose, and nobody can win.

## 9. The first five minutes

**C, the pick.** *Start.* A white form, a red bar, a black bar, a big title. Two voters, three plans, you count. Begin. *Sunday 1.* Anna's ballot in red: fountain, tower, tree. Beat's in black: tree, fountain, tower. Three lines read the pairs for me one at a time: fountain and tower, both put the fountain higher, fixed; tower and tree, they disagree, yours; fountain and tree, they disagree, yours. Under that, five little lists I could post. I touch the one that looks like Anna's ballot and the two open lines say "Anna's way" twice. That feels unfair. I touch the one with tower and tree side by side: "Anna's way" and "level". Better? I touch the one with tree between fountain and tower: one each. That is the fair one. Post. Two stamps go into the rule book, one red, one black. *Sunday 2.* New ballots; one line now says "you ruled this on Sunday 1" and is fixed. Three lists. I am keeping count of who has had what: I give this one to Beat, or call it level. *Sunday 3.* The same again; I am pleased with my book: two red, one black, one grey. *Sunday 4.* One list. The screen says: only one list is left; the two voters agree on one pair, your ruling from Sunday 2 fixes another, and with those two fixed the third can only go one way. A stamp I did not choose goes into the book. I frown. *Sunday 5.* One list again. The book is full. *Arrow's check.* A sheet of 36 squares, one for every pair of ballots there could ever be. He reads one slowly: tree over fountain, your ruling; fountain over tower, both say so; tower over tree, your ruling. Round in a circle. No list. Struck through. Then the other 35 run: three more struck through. I tap them. Each one is my own rulings contradicting each other. *Verdict.* 32 of 36. Nobody can do better than 34 without a boss; all 729 rule books are on the screen as small squares, two of them red and black in opposite corners. I play again and give everything to Anna to see: Sunday after Sunday the list is her ballot, the sheet clears, all 36 squares carry her red corner, and the game says what Arrow called her.

**A, the runner-up.** *Start*, then six rows of three buttons, each headed by two tiny ballots. I do not know what a good setting is; I set them all to "level" because that sounds fair. Run: the sheet strikes through fourteen squares. I tap one and read why. I go back and change two switches, without much idea which. Run: nine. By the third draft I am pattern-matching on the count and not reading the squares. The discovery arrives, but as the end of a hill-climb on a number, and I never had a concrete case in my hands when I chose.

## 10. The pick, and why

**C, The Rule.** It is the one in which the player is furthest inside the paper: not choosing a function from outside but being it, extensionally, one pair of ballots at a time, which is how Definition 3 defines it. The first press is concrete and obvious (touch a list). There is something to weigh every time a list is chosen, and the weighing is about fairness, which is what the stranger brings. The forced Sundays are Arrow's proof happening to the player rather than being explained. The sentence afterwards has no "guess": *I ruled on their quarrels one at a time and kept my word, and my own rulings either tied themselves in a knot or made one of them the boss.* Originality: no game in the table has made the player a function, or let the opponent be a theorem.

**Author test.** Anyone who teaches Arrow knows the answer and has never asked the question the score asks: how many of the 36 can a non-dictatorial rule book hold? It is 34, and the books that reach it by one route are the ones where a fixed order of the plans wins every disagreement, whoever is for it: custom in the place of a person, which is the other pole of the paper's first page. That is something to find.

**Runner-up: A, The Drafter.** Switch if the author wants the whole space of rule books under the player's fingers from the first screen and accepts an abstract start. Its sheet and its count are kept, as the second half of C.

**The reckless concept was picked.** What it risks: a middle in which the player has no choice for two Sundays running. The memo's answer is that those two Sundays are the discovery, that the screen says in plain words why only one list is left, and that they are short.

## 11. The shape

One game: five Sundays, then Arrow's check, then the verdict. No presets. Sunday 1 is Arrow's own pair of ballots from eq. (7); a second and third game open on the same pair with the plans renamed. Sundays 2 and 3 open one new ruling each with three lists to choose from; on Sundays 4 and 5 Arrow hands in the ballots that leave the least room, which on every path is exactly one list. Score: Sundays with a list, out of 36. Play again from the verdict.

## 12. Controls, mechanism, feedback, moment

- **Control:** touch one of the lists that can be posted (five, three, three, one, one); then *Post the list*. Touching previews, on the three pair lines, whose way each open disagreement would go.
- **Mechanism:** `legalLists` (the weak orderings that agree with the voters where they agree and with the book where it has ruled), `post` (the list's new rulings enter the book), `nextBallots` (Arrow's calendar), `audit` (all 36 pairs of ballots read against the complete book), `verdict`.
- **Feedback:** the rule book, six boxes that take a red, black or grey stamp; the check sheet, 36 squares that take a list or a strike-through, with a red or black corner where the list is that voter's ballot.
- **Moment:** Sunday 4, one list left; then the first struck-through square, read pair by pair; or the sheet with one colour in every corner.

## 13. The look

**Register: a Swiss ballot paper** (Clean family, with Austere's Swiss grid behind it; by the Given). Not the concert poster of *Who Started It?* but the thing that comes through a Swiss letterbox four times a year: a white official form, a grid, boxes to put a cross in, one red.

- **Palette:** *form white* `#FFFFFF` on a *paper grey* page `#F1F0EC`; *ink* `#111111`; *Swiss red* `#DA291C`; *rule grey* `#8D8D8A` (level rulings, fine rules, muted words); *strike grey* `#D4D3CE` (the hatching of a struck-through square).
- **Type:** Inter (Rasmus Andersson; SIL OFL), a neo-grotesque in the Helvetica line: Inter Display 900 for the title and the big numerals, tight and flush left; 700 for headings and buttons; Inter 400 and 600 for text; tabular figures. Embedded as data, subset to Latin.
- **Buttons:** form fields. A choice is a white box with a 2 px ink border and an empty check square at its foot; touching it puts a cross in the square. The one committing button is a solid ink bar, full width, white capitals with wide tracking, square corners, no shadow.
- **The one visual rule:** *red is Anna, black is Beat, and the village has no colour of its own.* Anna's ballot is solid red shapes, Beat's solid black; the village's list is drawn in outline only. A ruling is stamped red, black or grey by whose way it went. Where there is no list the square is struck through. So a boss is something the player sees: outline lists that copy the red ballot, and a red corner on every square.
- **Play screen at 380 px:** the aim, two lines, with ? at the right. A huge numeral and "Sunday 2 of 5". The two ballots side by side under a red and a black bar, three shapes each, 34 px, best on top. Three pair lines, 46 px each: the two shapes, what the voters say, and a slot that shows the result. The lists that can be posted, in a row, each a small flight of steps with the shapes standing on them (level plans share a step). *Post the list*. Below, the rule book: six boxes in two rows, each showing the two shapes with the voters' dots over them and the stamp.
- **Check screen:** the sheet, 6 × 6 squares of 50 px, Anna's six ballots down the side in red, Beat's along the top in black; a reading panel under it.
- **Verdict:** the three lines large; the player's sheet small; all 729 rule books as a 27 × 27 block of squares, grey by how many Sundays fail, the two bosses red and black in opposite corners, the player's ringed.

## 14. What is cut

- **Voters who are indifferent.** Arrow's individuals may hold weak orderings; the game's ballots are strict. The theorem holds on strict ballots (checked by exhaustion), and the rule book has six rulings instead of twenty-four.
- **Condition 3 as a choice.** Independence is the rule of the game's world ("a ruling is kept"), not something the player may drop. Arrow's defence of it (the candidate who dies, the rank-order example, pp. 337–338) is two sentences on the verdict screen.
- **Imposed orderings** (Condition 4): excluded by construction, since agreement always wins. Named on the verdict as the paper's other way out, next to the fixed-order books that come closest to it.
- **More than two voters, more than three alternatives**; majority voting and the paradox of voting as a played scene (p. 329; one sentence on the verdict: with two voters, majority is "level whenever they disagree", which is one of the 729).
- **Parts IV.1 and V**: the individualistic assumptions, the one-commodity world, the Bergson function, compensation.

## 15. Divergences

- **The calendar is ours.** Which ballots come on which Sunday is a design choice (`nextBallots`); the paper's theorem is about all of them at once. The check sheet restores that, and the calibration shows the discovery does not depend on the calendar.
- **The count out of 36 is ours**: equal weight on every pair of ballots. The paper gives no measure of how badly a function fails.
- **"Custom"** as a name for the books in which a fixed order wins every disagreement is ours; they are not imposed in the sense of Definition 4, and they fail on two Sundays.
- **A ruling carried forward** is the opposite of the skill's rule that every round starts from the same place. Here the carrying is the mechanism (Condition 3).
- **The start screen says it cannot be done.** The failing is named before play and again at the check, not disguised as a puzzle.
- **Names.** Anna, Beat, a fountain, a tower and a tree stand for individuals 1 and 2 and alternatives x, y, z.

## 16. Mechanism kind and claim boundaries

**Ported.** The game runs Arrow's own small case: two individuals, three alternatives, a function that satisfies Conditions 2–4 by construction, and Condition 1 and Definition 5 checked as written.

- **Demonstrates:** that in this case every rule book which settles each pair on its own and respects agreement either leaves some pair of ballots without an ordering or is dictatorial; and how one ruling forces another.
- **Assumes:** strict ballots; the calendar; the count out of 36 and everything said about 34.
- **The paper establishes:** the theorem for any number of individuals and three or more alternatives (proved in the paper for two and three; "the results stated in this paper hold for any number of individuals", p. 336), with individual indifference allowed. It does not establish that real elections fail often, or that any actual rule is dictatorial; nor does the game.

**The discovery comes from the paper, not from the rules.** That only the two one-voter books never fail is the theorem, checked by exhaustion over all 729. That the best without a boss is 34, and that fixed-order books reach it, follows from our count and is presented as the game's, on the verdict and the About screen.

## 17. Calibration plan and result

`calibration.js` checks the mechanism against the paper, not against itself: 13 weak orderings; of 729 rule books exactly two give an ordering on all 36 pairs of ballots, and they are the two dictators by Definition 5; dictatorial if and only if never failing; Condition 2 holds in all 729; identical ballots are always returned (Consequence 1, Condition 4); eqs. (7)–(8) reproduced (all disagreements level, ballots x,y,z and z,x,y: xPy, yIz, xIz, no ordering); eq. (1) forces eq. (2), and the chain (1)–(6) forces a dictator on Arrow's own five pairs of ballots; the paradox of voting of p. 329; the rank-order example of pp. 337–338 (x wins on 10 points; with y deleted x and z tie on 10). Then the game's shape over every path from every opening: 135 paths, each five Sundays, lists on offer 5, 3, 3, 1, 1, no Sunday without a list during play, a complete book at the end; and the robustness statement.

**Result: 21 checks, 0 failed** (`calibration-result.txt`).

## 18. Playing it in numbers (build.md §3)

Over all 729 books, Sundays with a list: 22 (12 books), 23 (84), 24 (73), 26 (126), 27 (24), 28 (156), 29 (72), 30 (72), 31 (12), 32 (30), 33 (48), 34 (18), 36 (2). Over the 135 paths of play: 26 (5), 27 (2), 28 (21), 29 (19), 30 (9), 31 (4), 32 (17), 33 (36), 34 (16), 36 (6).

Obvious ways of playing, from the first opening (`loop.js` prints them):

| player | book | Sundays with a list |
|---|---|---|
| always the list nearest Anna's ballot | AAAAAA | 36, Anna the boss |
| always the list nearest Beat's ballot | BBBBBB | 36, Beat the boss |
| level wherever a level list is on offer | EBBEEB | 28 |
| the first list on offer every time | EBBEEB | 28 |
| the last list on offer every time | BBBABB | 33 |
| one each: whoever has had less so far | ABBBAB | 34 |
| a fixed order settles it: Fountain, Tree, Tower | ABBAAB | 34 |

The spread is ten values wide and the decisions matter. The simple rule that wins everything is "always the same voter", which is the sentence the player should leave with. Level rulings cost most. The fair-minded player who gives one each lands at 34, the edge, and is told so.

## 19. Build log

- **Mechanism** (`mechanism.js`, the only copy): written first, explored headlessly. A ruthless Arrow (always the ballots that break the book) ends three of five first moves on Sunday 2, and a forcing Arrow leaves one decision in the whole game; the calendar that was kept gives three real choices (5, 3, 3 lists) and then two forced Sundays on every one of 135 paths.
- **Calibration:** 21 checks, 0 failed.
- **Loop on placeholders** (`loop.js`, `loop-log.txt`): seven ways of playing; the table in section 18.
- **Skin and text**, then **screenshots at 380 px**. Changed after looking: the check box under each list read as a fourth shape (a square is the Tower), so it became a grey foot band that says *touch* and turns red with a cross; "One Sunday proves nothing" repeated on every Sunday of a boss game, so it now counts ("That makes 3 Sundays out of 3"); "the same plan wins every disagreement" was wrong for a fixed order and became "one fixed order settles every disagreement".
- **Full session in headless Chromium** (`session-test.js`, `session-log.txt`): a fair-minded game (34 of 36, a fixed-order book), help opened and closed mid-play and during the check, three squares touched, the verdict, About, then a second game on the second opening that makes Anna the boss. It caught one bug: the check button stayed disabled in a second game. No errors, no horizontal scroll at 380 px.
- **Self-review from the screenshots.** Aim from the start screen alone: yes. Discovery from the top of the end screen alone: yes. Does it look like a game in the table? The nearest is *Who Started It?*; this is white, red and black with boxes and a struck-through sheet, no circles overprinting, no lowercase headlines.
- **Not done:** play by a real stranger; a measured session length; the DOI and the JSTOR link could not be opened from the session (doi.org refused the request) and are given from memory.
