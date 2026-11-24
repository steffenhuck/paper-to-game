# Leibniz's Register — design memo (second build)

Leibniz (1694), the letter extract on perfecting medicine, as a mid-century annual report: you are the physician of a French province for ten winters, 1690 to 1699. Each winter two cards say what kind of winter it is, cold or mild and dry or wet; a hundred sick come with the winter's fever; you give them one of three remedies. For four winters you have only your own past winters to go on. Then Leibniz's letter arrives and, by public order, every physician in every province writes a few lines a year to the First Doctor of the King, and the collection comes back to you. The hard part dissolves, and that is the game.

## 0. Given

Mine: Steffen's signature and counter. Author title: *Leibniz's Register*. Part of a Leibniz suite with two sibling games built at the same time, so a look of its own: **mid-century, Eames and the Herman Miller years**, which the user asked for. Lloyd Strickland's translation; **credit him by name on the end screen**. Ideas given and binding at the first build: the text is about ledgers and annual registers, and that is where to look; **the player is not diagnosing patients**; it has to be possible to go wrong for the text's reason, trusting last year because it is the year you remember. After playing the first build the user added three things, which govern this one: **switch from no doctor keeping a journal to every doctor keeping one, with near perfect information in the second regime; keep three treatments; simplify the seasons to a winter disease where all that matters is whether the winter is cold or mild and dry or wet.**

## 0a. Revision, 24 November 2026 (after the author played the first build)

The first build (in `previous/`) had four kinds of year drawn from four seasons, a register of the player's own province only, begun in 1694, and a memory that faded on screen in four steps. The author found two things: the register helped little, since four kinds learnable only by trial meant the book held the answer once in eleven years; and the fading was beside the point, since a real player remembers eleven cards without help. Both have one root: the paper's record beats memory not because memory fades but because one doctor's experience is too small a sample, and the record is *collected*, from every province, year after year. Leibniz says so: a letter from each province to the First Doctor, "by public order"; "what a treasure trove of observations we would have if something similar had been done for a while now". This build stages that. Your own winters are all on screen, every one; what you lack before 1694 is other people's. Sections 2 to 18 below are rewritten for it; the first memo is in `previous/memo.md`.

## 0b. Revision, 24 November 2026, later (the middle word)

The author met the line "Bleeding did nothing this winter" and asked what it was calibrated against: some died, some lived, and the screen showed no baseline. It was the mechanism's middle label leaking: twenty dead is the fever's own toll, which the game never stated, and the third remedy was defined as "no physic", so it read as the nothing and yet could help or harm. Settled: rest is a treatment in its own right, bed, warmth and broth by the doctor's order, and neither bark nor lancet, and it can help, be no better, or harm like the others; the fever's own toll, about twenty of a hundred, is stated on the start screen, under the crowd, in the collection and on the end screen; and the middle word is now *no better than the fever alone* (*no better* on small cards and tallies, defined where it appears). No change to the mechanism's numbers.

## 1. Paper

G. W. Leibniz, "On the Way of Perfecting Medicine" (*Sur la manière de perfectionner la médecine*): an extract from a letter to Germain Brice, printed in the *Journal des sçavans*, 26 July 1694, pp. 338–340. Read in Lloyd Strickland's translation (© 2019), two pages with ten notes, supplied as a PDF; the translation is published at leibniz-translations.com (the page could not be reached from the build environment; the author-note says so). No DOI, no data, no code, no figures, no numbers. The game is built from the text alone.

## 2. What the paper hands over

**An argument**, primary and only: (1) the registers of baptisms and funerals in Paris and the Bills of Mortality in London are useful, and able people have drawn observations from them; (2) one could go further with an annual history of medicine per province, on Ramazzini's plan for Modena: the seasons and the air, the grains and the animals, then the health of human bodies and above all what harmed and what helped; (3) in two years Ramazzini already saw changes from black to white, quinquina succeeding incomparably better in one year than the other; (4) years similar to preceding ones often return, so the past would be of the greatest use, whereas now we learn almost from scratch at the expense of the sick; (5) what a treasure trove there would be if this had been done for a while; it is always time to begin; (6) it costs scarcely anything: a letter of a few pages per province per year to the First Doctor of the King, by public order; (7) France, with its police, could do it best; (8) the soul and the body are the first things that should be thought about and the last that are.

Formalised into a toy (section 16): a winter has a kind, visible in two cards; a remedy helps, harms or does nothing according to the kind; kinds return; before the letter a doctor has only his own winters; after it, every doctor's winters, a year late.

## 3. The discovery, and its kind

**A mechanism made intelligible**, with a counterintuitive edge. The remedy that worked last winter is the natural one to give again, and it is right when this winter is like last winter; it is wrong when a lookalike comes, one card the same and the other different, and one province meets too few winters to learn four kinds by trial. The collection answers in a year what a province cannot learn in a decade, and the player operates both regimes: four winters alone, six with the letters.

## 4. The core narrative

Every winter is one of four kinds: cold or mild, dry or wet. The same medicine saves people in one kind of winter and kills them in another. A doctor who sees one winter a year, in one place, keeps finding out the hard way, and people die while he finds out. Then the king orders every doctor in the country to write down, every year, what kind of winter it was, what he gave, and what happened, and sends the whole pile back to everyone. Now each doctor has twelve winters a year to read instead of one, and within a year or two everyone knows what works in every kind of winter. Writing it down costs almost nothing. Nobody was doing it. Leibniz says: begin.

## 5. Who lives in the paper

- **The practitioner in a province**, who decides what to give the sick this winter. Controls the remedy. *The pick.*
- **The other practitioners**, twelve of them here, who write their lines; in this game they choose at random, so that the collection shows harm as well as help.
- **The First Doctor of the King**, who collects and returns. Not played; the collection arrives.
- **The sick**, at whose expense the learning happens. The unit of the score.
- **Leibniz**, who says *begin*; he arrives in 1694, as he did.

## 6. Precedent

| Game | Position | Format | Feedback device | Chassis |
|---|---|---|---|---|
| Nagel's Camera | agent: the describer | discovery (prediction-ending) | the print | retro: a 1972 instant camera; cream, chocolate, rainbow stripe; Baloo 2 and Varela Round; light |
| Gödel's Endgame | subject: Hilbert's machine | challenge (puzzle rounds, then a dilemma) | printed slips and stamps | clean: Wiener Werkstätte; ivory, chequer, gold; Courier Prime and Josefin Sans; light |
| Leibniz's Fullest World | controller: chooses the set that exists | challenge (maximise the light) | the fill: existence as light | techno: a 2020s app at night; Space Grotesk; dark |

This game: **experimenter**, the paper's own instrument in the player's hands: the province physician probing which remedy helps in which kind of winter, first with his own winters, then with the kingdom's letters. **Format: a challenge** (lose as few of the sick as you can), shared with Gödel and the Fullest World and said here as such: the paper's unit is the sick and its verb is *decide*. **Device: one of our own, *the collection*:** your own winters as a row of small cards that grows one a year, and from 1695 a book that holds twelve provinces' winters a year, grouped by kind, with a tally per remedy; the Isotype crowd of a hundred for the dead. **Chassis: mid-century, Eames and Isotype**: cream, charcoal, mustard, teal, tomato; Jost; flat rectangular buttons; light and coloured.

## 7. The aim and the verdict

**Aim:** *Lose as few of the sick as you can in ten winters: each winter, give the one remedy that fits the kind of winter it is.*

**Verdict (first lines of the end screen):**
- Of the thousand sick who came to you, *N* died: *B* of four hundred before the letter, in words; *A* of six hundred after it, in words.
- What Leibniz says: winters like past winters come back, the same bark cures in one and fails in the next, a doctor with only his own years learns it again each time at the expense of the sick, and a few lines a year from every province, collected, would tell him.
- What you found: how many winters were like the one before; how many were new with nothing to read; how many times the letters had your winter and the remedy that helped in it.
- Where you part: your dead against a doctor with only his own winters, a doctor who read the letters from 1694, a doctor who had had letters from 1690 ("for a while now"), and one who knew every winter; the others averaged over sixty runs of their random tries, rounded to five.
- What you leave: a collection of seventy-eight letters that every doctor in the kingdom holds, and four winters only you ever knew.

## 8. Three concepts

**A. The province physician, two regimes** (experimenter; challenge). Ten winters: four with your own winters only, then the letter, then six with the collection. Controls: one tap a winter among three remedies; the collection opened by a tap and read by eye. Thinking before acting: alone, "is this winter like one of mine, and if not, what do I try"; with the letters, "which kind is this, and what did the provinces see there". Discovery: the lookalike winter in 1692, when last winter's remedy harms; then 1695, when the first letters answer a winter you never had. Fun: agency, anticipation, discovery, mastery. Second playthrough: a different map and a different plan of kinds; the alone years can be played by trying the untried rather than trusting the remembered. *The pick.*

**B. The First Doctor of the King** (experimenter; discovery). The player receives the letters and answers each province. Rejected at the first build for lacking the trap; still true, and now redundant: the collection is in the physician's hands anyway.

**C. The page** (reckless: the player writes the lines, under a budget, and an automaton doctor reads). Rejected at the first build as a quiz with one right answer; still true.

## 9. The first five minutes

The start screen: cream, four colour bars, the title; the acts; the aim; *Begin, 1690*. The play screen: *1690 · winter 1 of 10*; two big cards, cold and wet; *What you have to go on: nothing, you have just arrived*; a dashed box, *No letters*; three remedy buttons with a line beneath saying what each is; a crowd of a hundred teal figures. The stranger: no idea; bark, say. The badge, the line *Bark for the hundred sick, all winter. Nothing has happened yet*, the big button *Give bark to the hundred sick*. Tap. Five fall, red, lying. "Bark helped this winter. A kind of winter you had not seen, and no letters. Nothing could have told you." *Yours alone.* 1691: the same cards; a small card of 1690 in the strip, *bark helped*. Grin: bark. Five fall. 1692: cold and dry, one card the same. Last winter bark helped; bark. Thirty fall. "Bark harmed this winter. Last winter was cold, wet, and it helped there. This one is cold, dry. The same bark, a different winter on one card." Frown, and the lesson: the card that changed is the card that mattered. 1693: cold and dry again; not bark; rest, say; twenty, did nothing; or bleeding, five. 1694: the letter, a memo from the First Doctor of the King: every physician in every province writes from this winter; the collection comes back next winter; *Write this winter down*. A mild, wet winter, new; the black box under the crowd: *Written and sent. Every province will read it next winter.* 1695: mild and dry, another new kind; but the book button is black now: *Open the collection · 13 letters, the winter of 1694, every province*. Tap. Four groups, each headed by two small cards; *This winter, yours, is mild, dry. Find that kind below*; in the mild-dry group, *Bleeding: helped 2*, and two provinces named. Close; bleeding; five fall. "The letters had this winter: two provinces had given bleeding in a mild, dry winter and seen it help." That is minute four, and the discovery: what you could not have known, twelve other doctors knew, and now you do. Minute five is 1696, your old cold-wet winter, with the letters confirming what you learned the hard way in 1690.

Thinking before the first, middle and last action: first, "I know nothing; what do doctors do?"; middle (1695), "a kind I have never had; the letters have thirteen winters; which group is mine and what helped there?"; last (1699), "the letters have sixty-five; read the group." Three different thoughts, and the last is easy on purpose.

## 10. The pick, and why

A. It is the paper's proposal played in both halves: the physician alone, then the physician with the kingdom's letters. The author test: the author knows the answer and still meets 1692's lookalike alone, and still has the pleasure of 1695, when the collection answers a winter never seen. The Given is met: the trap is trusting last winter on the lookalike (1692, and again in 1697 for anyone who ignores the letters), and the second regime has near perfect information by 1696 by construction. Originality: no game in the table has had a record built by other players' hands arrive mid-game.

## 11. The shape

Ten rounds, one per winter, 1690–1699, one tap each plus the reading. Two halves: 1690–1693 alone; the letter in 1694; 1694 written but blind (the first letters come back the next winter); 1695–1699 with the collection. The plan of your own winters is fixed over four kinds drawn fresh each game: A any kind; B its neighbour with the other wetness (the lookalike); C its neighbour with the other temperature; D the opposite. The other provinces' winters and remedies are drawn at random under two floors: the letters of 1694 hold the remedy that helps in your 1695 winter, and the letters of 1694 and 1695 hold the helper of every kind.

| Winter | Kind | What it is there to show |
|---|---|---|
| 1690 | A | nothing to go on: learn from scratch |
| 1691 | A | last winter comes back: trusting it is right |
| 1692 | B | the lookalike: one card the same, last winter's remedy harms |
| 1693 | B | trusting last winter is right again |
| letter | | Leibniz, 1694: by public order, every doctor writes |
| 1694 | C | a new kind, written and sent, nothing to read yet |
| 1695 | D | a new kind, and the letters answer it |
| 1696 | A | your own old kind, and the letters agree |
| 1697 | B | the lookalike again; the letters answer it, memory alone fails it |
| 1698 | C | the letters answer |
| 1699 | D | the letters answer |

Screens: start; play (ten times); the letter (once); the collection; end; How to play; About. Score: the dead, out of a thousand sick, before and after the letter, against three other doctors and the one who knew.

## 12. Controls, mechanism, feedback, moment

**Controls:** three remedy buttons, each defined on the screen; *Give it to the hundred sick* after a remedy is chosen (touching a remedy previews the move: the badge over the crowd, the line, no outcome); *Open the collection* from 1695; *Next winter*; ? and About.

**Mechanism (toy):** four kinds of winter, cold or mild by dry or wet; for each kind one remedy helps (five of a hundred die), one is no better than the fever alone (twenty, the fever's own toll, stated on screen), one harms (thirty); A's helper harms in B; every remedy helps somewhere; bark harms somewhere; twelve provinces, each with a random winter and a random remedy each year from 1694; the collection at any time is every letter of every year before this one, with your own written winters, grouped by kind with a tally per remedy.

**Feedback:** the crowd of a hundred, five rows of twenty, the dead lying down in red one by one; the game's lines: what you gave, how many died, what it did, what the same remedy did last winter if you gave it, and what you could have known (nothing; last winter; your own earlier winter; the letters, with how many provinces had seen the helper); the card written and sent, or yours alone.

**Moment:** 1695. The cards are a kind you have never had. Your own five winters say nothing about it. The book is black for the first time. Open it: four groups, your kind among them, two provinces that gave something and saw it help. Give it. Five fall.

## 13. The look

Unchanged from the first build: **mid-century, Eames and Isotype**; cream `#F2E8D0`, charcoal `#2B2A28`, mustard `#E3A62A`, teal `#2F8F8C`, tomato `#D8502C`; Jost embedded; flat rectangles with 4 px corners, no outline, no shadow; the crowd after Isotype. The two winter cards: cold is pale with a snowflake, mild mustard with a sun, dry tomato with wind, wet teal with drops; four colours, so a kind is a pair of colours the eye matches at once. **The one visual rule: what was written and sent is black; what was yours alone is pale.** The play screen within 700 px on every winter (Give's bottom at 495 to 582 px, the crowd's top at 511 to 598).

## 14. What is cut

The Bills of Mortality and the Paris registers are a line on About. Ramazzini's seasons, grains and beasts are two cards. His dedication, the Ephemerides, the Lieutenant of Police, Louis XIV, the kings who named medicines, Alfonso and Ulugh Beg are read on About. No diagnosis; one fever a winter; one remedy. The First Doctor is not played. The cost of writing is not a choice.

## 15. Divergences

- **Clock:** ten winters. The letter is dated 1694; the first collection comes back in 1695 (Leibniz says only "every year").
- **Kinds:** four, from two cards. Leibniz's "constitutions of the times" are richer; the user asked for this simplification.
- **Remedies:** three; bark is Leibniz's, bleeding and rest are ours.
- **Effects:** five, twenty, thirty of a hundred; no noise. Leibniz gives sizes in words.
- **The other doctors choose at random**, before and after the letter, so the collection keeps showing harm. Real doctors would read the collection too and the harmful rows would thin out; About says so.
- **Twelve provinces**, named after real ones; the player's is unnamed.
- **The score** is ours; the sick are Leibniz's. **The look** is three hundred years after the letter, on purpose.

## 16. Mechanism kind and claim boundaries

**Toy.** What the game demonstrates: that under these rules a doctor with only his own winters is right when the winter repeats and wrong on a lookalike; that a collection of every province's winters answers within a year or two what one province cannot learn in a decade; and that the collection cannot answer for the winters before it began. What the game assumes: the kinds, the map, the three numbers, the twelve random doctors, the plan, the two floors on the draw. What the paper establishes: an argument from Ramazzini's two years, the claim that similar years return, and the proposal of collected annual letters; no mapping, no number. On screen the game says "in this game", never "as Leibniz showed". The discovery comes from the paper's mechanism, not the rules: the collection answers because twelve provinces see twelve winters a year, which is Leibniz's arithmetic, not ours; the score is ours and the calibration check varies the sizes and adds noise.

## 17. Calibration plan and result

Over three hundred seeds: (1) the draw: each kind has one helper, one nothing, one harm; every remedy helps somewhere; bark harms somewhere; A and B are the lookalike pair; (2) the plan's promises: a doctor who knows the helper and repeats it is right at 1691 and 1693 and loses thirty at 1692 and 1697; (3) the floors: the letters of 1694 hold your 1695 winter's helper; the letters of 1694 and 1695 hold every kind's helper; (4) the collection and the lookup along the plan: new, last, new, last, new, then collection five times; (5) the doctors' table and its order; the reader loses five every winter from 1695; (6) robustness: two other sets of effect sizes, noise of six, and the draw without its floors; (7) the words. **Result:** `calibration-result.txt`, all passed.

## 18. Playing it in numbers

From `calibration-result.txt`, the dead over ten winters (of a thousand sick), mean over three hundred seeds, by winter:

| Doctor | Dead | 1690 | 91 | 92 | 93 | 94 | 95 | 96 | 97 | 98 | 99 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Knew every winter | 50 | 5 | 5 | 5 | 5 | 5 | 5 | 5 | 5 | 5 | 5 |
| Letters from 1690 | 64 | 18 | 6 | 5 | 5 | 5 | 5 | 5 | 5 | 5 | 5 |
| Letters from 1694 | 118 | 18 | 12 | 27 | 13 | 22 | 5 | 5 | 5 | 5 | 5 |
| Own winters only | 192 | 18 | 12 | 27 | 13 | 22 | 19 | 19 | 24 | 19 | 20 |
| Always bark / bleeding / rest | 188 / 183 / 179 | | | | | | | | | | |

What the table says. The two regimes are the two halves of the reader's row: the memory doctor's numbers until 1694, then five every winter, which is the near perfect information the user asked for. The doctor with only his own winters goes on losing a fifth of the sick for ever, worst on the lookalike winters (1692, 1697), which is the paper's failure in the paper's place. Letters from 1690 would have made every winter but the first a five, Leibniz's "for a while now" in one row. A fixed remedy does about as well as the memory doctor, as in the first build, and for the same reason (four repeats, three flips, and a helper found by trial a third of the time); it is recorded on About and does not touch the order. The order holds under effect sizes of ten, twenty, thirty and five, fifteen, forty, with noise of six on every count, and without the floors on the draw (reader 120 against memory 189 over a hundred and fifty seeds); the floors only make the lesson certain on every draw, as a floor should. No heuristic finds a loophole: the best path is the oracle's.

## 19. Build log

- Second build, 24 November 2026, from the author's three instructions. Mechanism and calibration first; two checks were wrong on the first run (a threshold, and the collection after the last winter, which read no year) and were fixed; the mechanism's end-of-game collection now holds everything.
- Two browser sessions at 380 × 760 (`session-test.js`, `session-log.txt`): seed 42 played by the reading rule, with How to play opened in 1692 and the collection in 1695 and 1698; seed 7 by the own-winters rule; a laptop window. No page errors, no horizontal scroll, the collection dead until 1695 and live after, Give dead until a remedy is chosen.
- Fixed on the screenshots: the strip of own winters pushing the crowd below the fold from 1696 (the cards lost their figure row, the winter line went, the cards and the book button shrank); the lookalike line reworded to name both winters plainly.
- Revision 0b: the baseline on screen and the middle word reworded; rebuilt and rerun, no errors.
- Not measured: session length. Not tested in Safari. Not reachable from here: leibniz-translations.com (author-note).
