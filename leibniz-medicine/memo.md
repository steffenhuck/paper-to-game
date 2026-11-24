# Leibniz's Register — design memo

Leibniz (1694), the letter extract on perfecting medicine, as a mid-century annual report: you are the physician of a French province for eleven years, 1690 to 1700. Each year the seasons come in as four cards, a hundred of the province's sick come to you with the year's fever, and you give them one remedy for the year. Nobody wrote the years down before you; after Leibniz's letter in 1694 you keep the register. The year that matches this one is sometimes last year, sometimes a year in the book, and sometimes a year you never wrote down.

## 0. Given

Mine: Steffen's signature and counter. Author title: *Leibniz's Register*. Part of a Leibniz suite with two sibling games being built at the same time (one on *On Controversies*, one an engineer's-drawing game on crossing a river), so a look of its own: **mid-century, Eames and the Herman Miller years**, which the user asked for. Lloyd Strickland's translation; **credit him by name on the end screen**. Ideas given and binding: the text is about ledgers and annual registers, and that is where to look; **the player is not diagnosing patients**; whatever the game is, **it has to be possible to go wrong for the text's reason: trusting last year because it is the year you remember, when the year that matches is one you never wrote down.** The substance, in the user's words: without a record of past years every doctor learns from scratch at the expense of the sick; the same bark cures one year and fails the next; years like the past ones come back, so the record is worth more than the doctor's memory. Nothing in the Given overrides precedent, and nothing in precedent had to give way to it.

## 1. Paper

G. W. Leibniz, "On the Way of Perfecting Medicine" (*Sur la manière de perfectionner la médecine*): an extract from a letter to Germain Brice, printed in the *Journal des sçavans*, 26 July 1694, pp. 338–340. Read in Lloyd Strickland's translation (© 2019), two pages with ten notes, supplied as a PDF; the translation is published at leibniz-translations.com (the page could not be reached from the build environment; the author-note says so). No DOI, no data, no code, no figures, no numbers. The game is built from the text alone.

## 2. What the paper hands over

**An argument**, primary and only. Its parts, in the order Leibniz gives them: (1) the registers of baptisms and funerals in Paris and the Bills of Mortality in London are useful, and able people have drawn observations from them; (2) one could go further with an annual history of medicine per province, on Ramazzini's plan for Modena: first the seasons and the constitution of the air, then how the grains and fruits prospered and what diseases the animals had, then the chief matter, the health of human bodies, the epidemics, how other diseases changed, and above all which medicines had the best effect, the *nocentia* and *juvantia*, what harms and what helps; (3) in two years Ramazzini already saw great variations, changes from black to white, quinquina (cinchona bark) succeeding incomparably better in one year than the other; (4) years similar to preceding ones often return, so the past would be of the greatest use in deciding, whereas now we learn almost from scratch at the expense of the sick; (5) what a treasure trove of observations there would be if this had been done for a while; it is always time to begin; (6) it costs scarcely anything: a letter of a few pages per province per year to the First Doctor of the King, by public order; (7) France, with its police, could do it best, and the king would deserve more credit than the kings who gave their names to a few medicines or to astronomy; (8) the soul and the body are the first things that should be thought about and the last that are.

Formalised into a toy (section 16): a year has a kind (its seasons); a remedy helps, harms or does nothing according to the year's kind; kinds return; a doctor's memory holds the last year whole, the year before it in part, and nothing older; a register holds every year written in it, whole, for ever.

## 3. The discovery, and its kind

**A mechanism made intelligible**, with a counterintuitive edge: the remedy that worked last year is the natural one to give again, and it is right when this year is like last year, which is often; it is wrong when this year is like an older year, and the older year is exactly the one memory has lost. The record beats memory not because memory is bad at last year but because the year that matches is often not last year. The player operates that mechanism: they give the remedies, they feel memory fade, they keep the book, and they meet the year the book does not hold.

## 4. The core narrative

Every year is a kind of year: wet and cold, or hot and dry, or mild and damp. The same medicine saves people in one kind of year and kills them in another. Kinds of year come back. A doctor who only remembers last year gives last year's medicine, and when a different old kind of year comes back, he gets it wrong and people die while he finds out again what he once knew. A doctor who writes every year down, what the weather was and what helped and what hurt, can look the year up when it comes back. Writing it down costs almost nothing. Nobody does it. Leibniz says: begin.

## 5. Who lives in the paper

- **The practitioner in a province**, who decides what to give the sick this year and learns from scratch at their expense. Controls the remedy. Could anticipate: which past year this one is like. *The pick.*
- **Ramazzini, the writer of the annual history**, who sets down the seasons, the grains, the beasts, the diseases, what helped and what harmed. Controls what goes on the page. Could anticipate: what a later reader will need to find the year again.
- **The First Doctor of the King**, who receives a letter from each province each year. Controls the collection; could match a province's year against every other province's.
- **The sick**, at whose expense the learning happens. Control nothing; they are the unit of the score.
- **The year itself**, the constitution of the air. Not a player: it does not react.
- **Leibniz**, writing the letter: the one who says *begin*. In the game he arrives in 1694, as he did.

## 6. Precedent

| Game | Position | Format | Feedback device | Chassis |
|---|---|---|---|---|
| Nagel's Camera | agent: the describer | discovery (prediction-ending) | the print: a photograph develops at the reader's side | retro: a 1972 instant camera; cream card, chocolate ink, rainbow stripe; Baloo 2 and Varela Round; light |
| Gödel's Endgame | subject: the player is Hilbert's machine | challenge (puzzle rounds, then a dilemma) | printed slips and stamps (a reveal) | clean: Wiener Werkstätte cabinet, ivory, black-and-white chequer, gold; Courier Prime and Josefin Sans; light |
| Leibniz's Fullest World | controller: chooses the set that exists | challenge (maximise the light) | the fill: existence as light in a sky | techno: a 2020s app at night, dark slabs, seven star colours; Space Grotesk; dark |

This game: **experimenter**, the paper's own instrument in the player's hands: the province physician probing which remedy helps in which kind of year, with the annual register as the instrument once it exists; a position none of the three used. **Format: a challenge** (lose as few of the sick as you can) with a hidden map inside it. Challenge is Gödel's and the Fullest World's format, and this paper plainly wants it: its unit is the sick, its verb is *decide*, and its failure is a count ("at the expense of the sick"); so the format is shared, said here as such, and the other three dimensions differ. **Device: one of our own, *the page and the wash*:** every year ends as a card; a written year is set down in ink on a page of the register and stays crisp for ever; an unwritten year goes into memory as a wash that greys, blurs and loses its words a step more each year until it is blank. The dead are counted in Isotype figures. The end screen is a reveal of the whole decade with the matching years joined. None of the three used a fading or a written record. **Chassis: mid-century, Eames and Isotype**: cream paper, charcoal, mustard, teal, tomato; Jost (a Futura of our time), never used in the table; flat rectangular buttons with small corners, no outline, no shadow; light and coloured. After a cream retro card, an ivory Viennese cabinet and a night app: a 1950s annual report in three inks.

## 7. The aim and the verdict

**Aim (start screen, top of the play screen, first line of How to play):** *Lose as few of the sick as you can in eleven years: each year, give the one remedy that fits the kind of year it is.*

**Verdict (first lines of the end screen):**
- What the paper says: years like past years come back, and the same bark cures in one and fails in the next; a doctor with only his memory learns from scratch each time at the expense of the sick, and a register of a few lines a year would have told him.
- What you found: over eleven years, eleven hundred sick came to you and *N* died: about one in six, or whatever it was, in words. Four years were the same kind as the year before and your head held them; once the year that matched was in your register; twice it was a year nobody had written down, and you learned it again from scratch; four years were new and nothing could have told you.
- Where you part, or do not: how many you lost against the doctor who had nothing but memory, the doctor who kept the register from 1694 and read it, the doctor who had had it from 1690, as Leibniz imagined ("if something similar had been done for a while now"), and the doctor who knew every year; the other doctors' random tries averaged over sixty runs on the same years, rounded to five.
- What would have followed had yours stood: the register you leave to your successor holds seven years; the four before it go with you.

## 8. Three concepts

**A. The province physician** (experimenter; challenge). Eleven years. Controls: one tap a year among three remedies: bark, bleeding, rest; the register, once begun, opened by a tap and read by eye. Thinking before acting: which past year is this year like, and do I have it, in my head or in the book, and if neither, what do I try. After: a hundred figures, the dead filled in, the game's line on what the remedy did this year against what it did last time; the year set down in ink or washed into memory. Discovery moment: the first return of a year that memory has lost, when last year's remedy harms and the register, if it has begun, does not hold the year. Fun: agency, anticipation, mastery (the book makes the second return easy). Second playthrough: a different map of remedies and seasons, and a different strategy: try the untried early so the book fills, or trust what worked. *The pick.*

**B. The First Doctor of the King** (experimenter; discovery). Letters arrive from six provinces each year; the player matches a province's year against the others' past letters and sends back the remedy. Controls: which past letter to answer with. Thinking: matching, across provinces as well as years. Discovery: the collection matches what no single doctor's memory can. Fun: discovery, mastery. Replay: new provinces. Fails the Given: the King's doctor has every letter, so the trap of trusting the remembered year never bites, and the player never feels a year they did not write down.

**C. The page** (subject: the player is the register; reckless: no remedy is chosen by the player, and the play screen has no words on it). Each year the player writes the page: six facts of the year are offered as pictograms (seasons, air, grains, beasts, the disease, what helped, what harmed) and the page has room for three; an automaton doctor then acts, consulting the book and otherwise trusting last year. Thinking: what will the doctor need to find this year again. Discovery: a page without the seasons cannot be matched, a page without the remedies cannot advise, and the doctor who reads a half page is worse than the one who reads none. Fun: discovery, anticipation. Replay: a different budget. What it gives up if not picked: the writing as the player's act, Ramazzini's order as the thing the player learns. What it loses: the choice of what to write has one right answer (the seasons and the remedy) and so is a quiz with a budget; and the player does not give the bark, so the expense of the sick is somebody else's.

**The hybrid** (A with C's pen): A, with the page written by the player each year under a budget. Written out and rejected: the second decision has one right answer every year, which makes it a chore after the first year; the register in A is written by the game in Ramazzini's order, and the player's act is to read it, which is where the paper's doctor fails.

## 9. The first five minutes
**A (the pick).** The start screen is a cream page with four colour bars and a title in a geometric sans; the acts: *read the four cards of the year, open the register, once there is one, give the hundred sick one remedy*; the aim on its own line; a button *Begin, 1690*. Tap. The play screen: *1690 · year 1 of 11*; *Give this year's remedy*; four big cards in a row, winter cold, spring hot, summer mild, autumn cold, with a line under them, "this year the hay was good; the hens stopped laying"; a strip, *What you have to go on*: three grey cards, *you have just arrived*, and a dashed box, *No register. Nobody wrote the years down*; three buttons, Bark, Bleeding, Rest, each with a pictogram and a line beneath saying what each is; a crowd of a hundred small teal figures, *the hundred sick who came this year*. The stranger thinks: no idea; bleeding is what doctors do; tap Bleeding. The button goes black, a lancet badge appears over the crowd, the line says *Bleeding for the hundred sick, all year. Nothing has happened yet*, and the big button now says *Give bleeding to the hundred sick*. Tap. Figures fall over one by one, red, lying down; thirty of them. "You gave bleeding. Of a hundred sick, thirty died. Bleeding harmed this year." And: "Kept only in your head. There is no register." *Next year, 1691.* The same four cards. The stranger grins: same year, I know this one; bleeding was bad; bark then. Five fall. "Bark helped this year. The same kind of year as last year." The memory strip: 1691 crisp with its five red figures, 1690 greyed. 1692: different cards, wet winter, hot summer. Last year bark helped. Bark. Thirty fall. "Bark harmed this year. Last year, a different kind of year, it helped: five died. The same bark, a different year." Frown. 1693: the same wet-and-hot cards as 1692; last year's card says bark harmed; so not bark; rest, say. Twenty fall; did nothing. 1694: a letter, a memo from the First Doctor of the King with Mr Leibniz's proposal; *Begin the register*. A new kind of year, mild and damp; the stranger learns from scratch again, and this time the box under the crowd is black: *Written in the register. It stays.* 1695: the same cards as 1694; the book has one page, and it is this year; the stranger reads it and gives what helped, or avoids what harmed. 1696: the wet-and-hot cards again. The strip shows 1695 crisp, 1694 with its cards and "Bark…", 1693 a blur, *a year like that…*. The book, opened, has 1694 and 1695: neither matches. The stranger weighs: last year's remedy, which helped; or the blur says something; or the untried one. That is the paper's moment, in minute four: the year that matches is one nobody wrote down. Whatever they give, the game then says: "This kind of year came before, in 1692 and 1693. Nobody wrote it down, and your head no longer holds it." Minute five is 1697, a new kind, written.

**B (the runner-up).** The start screen: a desk, six envelopes. Open one: Burgundy, 1690, four cards, "what shall we give?" The stranger looks for a matching letter among the others and there is none; sends a guess. Next year, six more envelopes, and now there are past ones to match against; the matching is pleasant. By minute three the stranger is a filing clerk who is always right once the files are thick enough, and never meets a year they forgot, because they forget nothing. No frown, no grin.

Thinking before the first, middle and last action in A: first, "I know nothing; what do doctors do?"; middle (1696), "is this year in my head, in my book, or nowhere, and if nowhere, do I trust last year or try what I have not tried?"; last (1700), "which page is this year, and what does it say helped?" Three different thoughts.

## 10. The pick, and why

A. It is the paper's doctor at the paper's moment: deciding on this year's remedy with memory, then with a register, and the register's gap is where Leibniz's sentence lives. The author test: the author knows the answer (keep the book) and still has to match the cards and still meets 1695 with the book too thin to help; they operate the mechanism rather than being told it. The Given's requirement is met by construction: in 1696 and in 1699 the matching year is one nobody wrote down, last year's remedy is the natural choice, and it harms. Originality: no game in the table has had a memory that fades on screen or a record the player keeps and then reads; none has had the player meet the limit of their own record. Runner-up: B; what would make me switch: a draw in which the trap in A does not bite because the stranger always experiments, which the numbers table (section 18) says does not happen. C's loss: the page as the player's act; the About screen says Ramazzini's order is the page's, and the game writes it.

## 11. The shape
Eleven rounds, one per year, 1690–1700, one tap each plus the reading (a first plan of ten years was replaced after the numbers table, section 18: it had as many flips as repeats, and a doctor who trusted last year did worse than one who gave the same remedy every year). Two halves: 1690–1693 with memory only; a letter screen in 1694; 1694–1700 with the register. The sequence of year-kinds is a fixed plan over four kinds drawn fresh each game (which seasons are which kind, which remedy helps and harms in each, are drawn under constraints; the seed is visible and replayable):

| Year | Kind | What it is there to show |
|---|---|---|
| 1690 | A | nothing to go on: learn from scratch |
| 1691 | A | last year comes back: memory is right |
| 1692 | B | black to white: last year's remedy harms |
| 1693 | B | memory is right again |
| letter | | Leibniz, 1694: begin the register |
| 1694 | C | a new kind, and the first page in ink |
| 1695 | C | memory and the book agree |
| 1696 | B | the year that matches was never written down; last year's remedy harms |
| 1697 | D | a new kind, written |
| 1698 | D | memory is right; the book has it too |
| 1699 | A | an unwritten year again, nine years gone; last year's remedy harms |
| 1700 | B | the register pays: 1696 was written at the expense of the sick, and is there |

Screens: start; play (eleven times); the letter (once); end, with the reveal; the register; How to play; About. Score: the dead, out of eleven hundred sick, against three other doctors (memory alone; the register from 1694; the register from 1690) and the one who knew. No presets: the plan is the preset.

## 12. Controls, mechanism, feedback, moment

**Controls:** three remedy buttons (Bark, Bleeding, Rest), each defined on the button; *Open the register* (from 1694), an overlay of the written pages; *Next year*; ? and About. Touching a remedy button previews the move in the picture: the bottle, the lancet or the bed slides to the hundred figures, no outcome.

**Mechanism (toy):** four kinds of year, each a signature of four season cards, any two differing in two or three of the four (and one line of grains and beasts that follows the kind); for each kind, one remedy helps (five of a hundred die), one does nothing (twenty), one harms (thirty); bark helps in at least one kind and harms in at least one; each remedy helps somewhere; the plan above fixes which kind comes when; memory shows age 1 whole, age 2 the cards and the remedy with the figures gone, age 3 the cards faded and nothing else, age 4 and older blank; the register shows every page written in it whole.

**Feedback:** the hundred figures, one per sick, in five rows of twenty, the dead lying down in red one by one; the game's line: what you gave, how many died, whether it helped, did nothing or harmed, and what the same remedy did the last time you gave it, if you can know; the year's card sliding into the register page in ink or into the memory strip as a wash.

**Moment:** 1696. The cards are those of 1692 and 1693. The memory strip shows 1695 crisp (its cards, its remedy, its figures), 1694 greyed with its remedy and no result, 1693 a blur. The register holds 1694 and 1695, and neither matches. The player gives 1695's remedy, or what the blur suggests, or the untried one; the figures fall; and the game says, in its own voice, that this kind of year came in 1692 and 1693 and nobody wrote it down.

## 13. The look

**Register: mid-century, Eames and Isotype, a 1950s annual report in three inks**, asked for by the user; the paper's object is a register, and the Isotype figures of Neurath and Arntz are the mid-century way of counting people on a page. **Palette:** cream paper `#F2E8D0`; charcoal `#2B2A28`; mustard `#E3A62A`; teal `#2F8F8C`; tomato `#D8502C`. **Type:** Jost, the whole file (variable, 400 to 700), embedded; labels in capitals with wide tracking; the title heavy. **Buttons:** flat rectangles, 4 px corners, mustard fill with charcoal text, no outline, no shadow; the remedy buttons carry a pictogram (a bottle, a lancet, a bed); *Next year* in teal. **The one visual rule: ink keeps, memory fades.** A year is a card: four season squares, a remedy pictogram, ten small marks for the dead and the living. In the register it is charcoal on cream, crisp, for ever. In memory it is the same card greying and blurring a step a year, the figures the first to go, then the remedy, then the squares, until it is a blank grey card. **The play screen:** the year and the thing to do at the top; the four season squares, about 80 × 56 px each, the one big picture, answering "what kind of year is this?"; under them the strip of memory cards, three small ones, answering "what do I remember?", with the book as the fourth cell; the three remedy buttons; the Give button; the crowd of a hundred, five rows of twenty, answering "who is here?" before the move and "how many died?" after it; all within 700 px (Give's bottom at about 525 px, the crowd's at about 630). After the move the choice collapses, the crowd falls, and the game's lines and the written card appear under it.

## 14. What is cut

The Bills of Mortality and the Paris registers of baptisms and funerals are three lines on the start screen and on About. Ramazzini's dedication of his second year to Leibniz, the Ephemerides of the German doctors "curious about nature", the Lieutenant of Police, Louis XIV, Mithridates, Juba and Gentius, Alfonso and Ulugh Beg, the king's glory, and the closing line about the soul and the body are read on About or on the end screen, not played. The grains and the beasts are one line of colour per kind, not a variable. Diagnosis is not played: one fever a year, a hundred sick, one remedy. Other provinces are not played. The cost of the register (scarcely any) is not a choice: the letter arrives and the register begins.

## 15. Divergences

- **Clock:** eleven years, one tap each. Leibniz's letter is dated 1694 and the game begins the register in that year; the four years before it are the years nobody wrote down. The province is unnamed.
- **Kinds of year:** four, each a fixed signature of four seasons. Leibniz says "constitutions of the times" and "the seasons and the constitution of the air"; the toy makes a constitution a thing the player can see and match.
- **Remedies:** three. Bark is Leibniz's (quinquina, note 3); bleeding and rest are the game's, the standard practice of the time and its absence, so that the choice has three live options.
- **Effects:** one helps, one does nothing, one harms, in every kind, with fixed numbers (five, twenty, thirty of a hundred). Leibniz gives no numbers; "black to white" and "incomparably better" are the sizes. No noise: the About screen says so, and the calibration check adds noise to see whether the lesson holds.
- **Memory:** four steps to blank. The paper says only "learning almost always from scratch"; the steps are ours.
- **The score** (the dead out of eleven hundred) is ours; the unit, the sick, is the paper's.
- **The look** is three hundred years after the letter, on purpose.

## 16. Mechanism kind and claim boundaries

**Toy.** The game runs a model built to illustrate the paper's argument. What the game demonstrates: that under these rules a doctor who trusts the remembered year is right when the year repeats and wrong when an older kind returns; that a register finds the older kind when it holds it; and that a register begun late cannot find the years before it. What the game assumes: that a year has a kind that can be seen in its seasons; that a remedy's effect depends on the kind and on nothing else; that memory fades in four steps; the three numbers of the dead; the plan of eleven years. What the paper establishes: an argument from Ramazzini's two years of observation that remedies vary from year to year, and the claim that similar years often return; it does not establish the mapping, the numbers, or that memory fails in four years. On screen the game says "in this game" and "under this game's rules", never "as Leibniz showed".

The discovery comes from the paper's mechanism, not from the rules: the trap is a return of a kind that memory has lost and the register does not hold, and it is in the plan because Leibniz says years return; the score is ours and the calibration check varies the numbers and the memory horizon to see that memory alone still loses to the register.

## 17. Calibration plan

No reported numbers to hit. The check, over hundreds of seeds: (1) the draw: four kinds with distinct signatures, any two differing in two or three seasons; every remedy helps in at least one kind; bark helps in one and harms in another; (2) the plan's promises on every seed: a doctor who knows the helper and repeats it is right at 1691, 1693, 1695, 1698 (five die) and loses thirty at 1692, 1696, 1699; the lookup along the plan reads new, last, new, last, new, last, lost, new, last, lost, book; the register begins in 1694; (3) memory: the age rule gives what section 12 says; the register holds exactly the written years; (4) the doctors' table (section 18): the order oracle < register from 1690 < register from 1694 < memory alone; the memory doctor loses most on the two lost years; the register doctor loses as much as the memory doctor there and less at 1700; the register from 1690 loses far less there; (5) robustness: two other sets of effect sizes and noise of plus or minus six on every count: the order holds; (6) the words. **Result:** `calibration-result.txt`, all passed over three hundred seeds.

## 18. Playing it in numbers
From `calibration-result.txt`, the dead over eleven years (of eleven hundred sick), mean over three hundred seeds, with the mean by year:

| Doctor | Dead | 1690 | 91 | 92 | 93 | 94 | 95 | 96 | 97 | 98 | 99 | 1700 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Knew every year | 55 | 5 | 5 | 5 | 5 | 5 | 5 | 5 | 5 | 5 | 5 | 5 |
| Register from 1690 | 157 | 18 | 11 | 28 | 13 | 20 | 13 | 5 | 26 | 15 | 5 | 5 |
| Register from 1694 | 191 | 18 | 11 | 28 | 13 | 20 | 13 | 26 | 17 | 11 | 28 | 7 |
| Memory alone | 203 | 18 | 11 | 28 | 13 | 20 | 13 | 26 | 17 | 11 | 28 | 19 |
| Always bark | 208 | | | | | | | | | | | |
| Always bleeding | 198 | | | | | | | | | | | |
| Always rest | 199 | | | | | | | | | | | |

What the table says. The spread is real: the way of playing the paper names as the failure (repeat what helped last year) loses nearly four times what the best possible loses, and its losses sit where the paper puts them, on the years that came back from before the record (1696, 1699: twenty-six and twenty-eight against five for the doctor who had the register from 1690). The register kept from 1694 is worth little until a written year returns (1700: seven against nineteen), which is the paper's "it is always time to begin" and its "if it had been done for a while now" in one row each. Every option is live: each remedy is the helper in some kind on every seed, and the fixed-remedy doctors are the proof that no remedy is safe to give blind.

The one honest discomfort, recorded here and on About: a doctor who gives the same remedy every year loses about as much as the memory doctor (198 against 203). That is the plan's doing, not the paper's: in eleven years the plan has four repeats, where trusting last year gains fifteen, and three flips, where it loses ten against a blind guess, and a doctor who has to find the helper by trial finds it on the first try only a third of the time. A first plan of ten years was worse (the memory doctor lost more than the blind doctor) and was replaced by this one. The order of the four doctors on the verdict does not depend on it, and holds under other effect sizes (ten, twenty, thirty; five, fifteen, forty) and with noise of six on every count; the player's own count is honest arithmetic either way. The player is smarter than any row: a page that says a remedy harmed rules it out, two pages rule out two, and the end screen's "memory alone" is the floor to beat, not the ceiling.

The wrong branch is the paper's: at 1696 and 1699 the sensible choice, last year's helper, is harmful, for the reason Leibniz gives, and the game says so after the move. No heuristic finds a loophole: the best path is the oracle's and nothing beats it.

## 19. Build log
- Mechanism and calibration first (`mechanism.js`, `calibration.js`); the numbers table changed the plan from ten years to eleven and the effect sizes from six, eighteen, thirty to five, twenty, thirty before any screen existed. `build.py` runs the check, inlines the mechanism verbatim and refuses to build on a failure or a mismatch.
- Two browser sessions at 380 × 760 (`session-test.js`, `session-log.txt`): seed 42 played by the register rule with How to play opened in 1692 and the register opened in 1696 and 1700; seed 7 played by the memory rule; a 1280 × 640 laptop window. No page errors (the counter script is blocked in the test), no horizontal scroll, Give within 700 px with the crowd visible under it on every year, the register button dead before 1694 and Give dead before a remedy is chosen.
- Fixed on the screenshots: the crowd drawn through an SVG symbol that the page's CSS could not reach (the dead never turned red); the crowd ten by ten, too tall to sit on screen with Give (now five rows of twenty); the book icon that read as a pause sign; the letter's header colliding; memory cards clipping their last line; the end screen's list of kinds as a paragraph (now four rows with their cards); the verdict's other doctors as one random run each (now averaged over sixty runs and rounded to five); small counts in the verdict as digits (now words).
- Not measured: session length. Not tested in Safari (not available here). Not reachable from here: leibniz-translations.com, so the link to Strickland's page is unverified (author-note).
