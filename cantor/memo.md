# Not in the Book — design memo

Cantor (1891), the diagonal argument, as a fairground challenge: the Great Lister claims his endless book contains every row of m's and w's; you write one it does not.

## 1. Paper

Georg Cantor, "Über eine elementare Frage der Mannigfaltigkeitslehre", *Jahresbericht der Deutschen Mathematiker-Vereinigung* 1 (1890–91): 75–78. No DOI (1891). What was available: a three-page PDF from the Logic Museum (logicmuseum.com/cantor/diagarg.htm, E. D. Buckner's page) with the German original in one column and an English translation in the other; only the first half of the paper, up to the conclusion that M cannot be put in the form E1, E2, …, Eν, …. The second half, where Cantor generalises to the set of all functions on any set L and concludes that powers have no maximum, is omitted from the PDF and from the game. The German is the paper; the translation is an aid. Typeset text, not a scan; no numbers to misread.

## 2. What the paper hands over

**Primary: an argument, fully explicit, which is also an algorithm.** Take two distinct characters m and w. Let M be the set of all infinite sequences E = (x1, x2, …) of m's and w's. Cantor's proposition: if E1, E2, … is any simply infinite series of elements of M, there is an element E0 of M that agrees with none of them. The proof *constructs* E0: write the series as a grid with entries a(u,v); define b(v) to be m or w but different from a(v,v); set E0 = (b1, b2, …). Then E0 = Eu is impossible for every u, since it would require b(u) = a(u,u). Hence M cannot be listed as E1, E2, …: M does not have the power of the number series 1, 2, 3, …. The paper also gives three sample elements, E_I = (m, m, m, …), E_II = (w, w, w, …), E_III = (m, w, m, w, …), and notes that this proof does not go through the irrational numbers, unlike his 1874 proof.

**Secondary: nothing quantitative.** There are no parameters, no data. What can be ported is the construction itself, exactly, and tested exactly: for any grid, b(v) ≠ a(v,v) for all v, and E0 differs from every row.

## 3. The discovery, and its kind

**A counterintuitive result, delivered by a mechanism made intelligible.** The stranger's belief: an endless list has room for everything; given infinitely many rows, surely every row of m's and w's gets a place. The paper: no. However the list is made, there is a row it misses, and you can write that row down: look along the diagonal and change every letter. The second half of the discovery is the mechanism: the missing row is not found by luck or search but by a rule that handles row u with letter u, so every row is dealt with by its own number, and the list's being endless does not help it. A corollary the player can carry away: there are more such rows than there are whole numbers to count them with; some infinities are bigger than others.

## 4. The core narrative

A showman has an endless book. On each line of the book is an endless row of two letters, m and w, and he says his book has every possible row in it, somewhere. You say: I will write a row that is not in your book. He laughs: the book is endless, whatever you write is in there. You start writing your row one letter at a time, and every letter you write crosses out all the lines that disagree with you there. But every time you cross some out, he turns to lines further down that still agree with you, and there is no end of them. Then you find the trick. You deal with line 1 using your first letter, line 2 using your second letter, line 3 using your third: look at where line 3 crosses your third letter, and write the other one. Now every line is crossed out by the time you pass it, and the book being endless does not matter. The showman adds your row to the book and challenges you again, and the same trick works again. His book can never be complete. There are more rows than lines to put them on.

## 5. Who lives in the paper

- **The maker of the list** (hypothetical: whoever claims M can be put in the form E1, E2, …). Controls the content and order of the rows. Could be asked to anticipate the diagonal and fail.
- **The constructor of E0** (Cantor). Controls b(v), one letter at a time. Anticipates nothing: the rule needs only a(v,v).
- **The elements E** of M. The thing being listed; one of them, E0, is the one that gets away. A sequence could be personified as the fugitive.
- **The grid a(u,v)** itself: the instrument. The diagonal is a line on it.
- **The three sample elements** E_I, E_II, E_III: the paper's own small list, and the first three rows of this game's first book.

## 6. Precedent

| Game | Position | Format | Feedback device | Chassis |
|---|---|---|---|---|
| Watson's Cardboard (dna) | experimenter (builds the model) | discovery (build, zip, read the faults, build again) | the rails (two ribbons bow, pinch or run straight) | cardboard model kit on kraft (Drawn): kraft, pencil, card, ribbon blue, fault red; Permanent Marker + Courier Prime; luggage-tag buttons |
| Einstein's Flower Merchant (einstein) | agent (dispatcher choosing boosters) | discovery, then a committed order book | two clocks and the race of the light beam | Swiss grid poster (Austere): paper, ink, signal red, light yellow; Archivo; flat square ink buttons |
| Home Judges (homophily) | controller (seats a panel) | blind build, then challenge | the fill (two jars of stars) | board game on indigo (Retro): Bungee + Rubik; sticker buttons with hard offset shadow |

**What this game does differently.**

- **Position: the player is the one the paper is about, the constructor of E0, in a contest.** The player writes b1, b2, …, Cantor's own variable, against a Lister. That is an agent seat, and Einstein's player was also an agent; the paper plainly wants this one, since the whole paper is one agent's construction. The other three dimensions differ from all three predecessors.
- **Format: strategic.** None of the last three was strategic. The player faces an opponent who reacts: a Lister who, each time rows are struck, turns to rows further down that still agree, and who in the last round writes each row to copy the player so far. The player wins by finding the one rule that the opponent cannot answer.
- **Device: the strike (one of our own).** The Lister's book is the scoreboard. A row alive is ink on cream; a row the player's letter disagrees with is struck through and greys out, with the deciding letter ringed. The book fills with strikes or does not. No rails, clocks, jars.
- **Chassis: a fairground bill** (Loud family; the last three were Drawn, Austere, Retro). Big-top red ground, cream bill, brass gold for the player's row and the tickets, ink, and teal for Cantor's line. Rye for display, Alfa Slab One for the letters in the book, Work Sans for text. Buttons are tickets with perforated edges. A saturated red ground after kraft, off-white paper and indigo.

## 7. The aim and the verdict

**Aim**, the line the player reads on the start screen, at the top of every play screen, and first in How to play: *Write a row of m's and w's that is not in the Lister's book.*

**Verdict**, the end screen's first lines, in words:

- *You wrote a row that is not in the Lister's book, and you can prove it: row 1 differs from yours at letter 1, row 2 at letter 2, row 3 at letter 3, and so on for ever. That is Cantor's argument of 1891. No endless list of such rows can ever be complete: there are more rows than there are whole numbers to count them with. Some infinities are bigger than others.*
- If rows slipped past their number in the last round: *… Three rows slipped past their own number still agreeing with you. Cantor's rule lets none slip: at letter u, look at row u's letter u and write the other one.*

The yardstick is in the aim's units: rows struck, rows still agreeing, rows slipped past their number. Never points.

## 8. Three concepts

**A. Not in the Book** (agent: the constructor of E0; strategic). Controls: two tickets, m and w; each tap writes the next letter of your row. Three rounds against the Great Lister. Round 1, his small book: five rows (the paper's own E_I, E_II, E_III and two more); every letter strikes the rows that disagree; strike all five before you run out of letters. Round 2, the endless book: the same play, but each time you strike rows the Lister turns to rows further down that still agree with you; after five letters, still agreeing: endless. Round 3, Cantor's bargain: strike each row by the time you reach its own number, shown as a teal line through the book; the Lister writes each row to copy you so far, so the only cell that can strike row u in time is the one on the line. Deliberation: round 1, which letter strikes more rows (count the m's and w's in the next column of the rows still alive); round 2, whether any letter can finish this; round 3, which cell decides row u, and then the realisation that it is always the same cell. Discovery moment: the fifth letter of round 2 strikes nine rows and nine more slide in, still agreeing; then in round 3 the player writes the opposite of the line cell and the row dies on its number, every time. Fun: agency (the strikes follow from each tap), discovery (the rule), mastery (round 3 after round 2), anticipation (the end, when the Lister adds your row to the book and the rule runs again on its own). Second playthrough: a new book number; different rows; the same rule, which is the point, so replayability is low and the game is short rather than padded.

**B. The Great Lister** (controller; challenge). The player is the showman and builds the book: chooses, for rows 1 to 8, a scheme (all m, all w, alternate, count in binary, copy the row above and change one letter, …) and tries to make a book that catches Cantor's row. After each scheme, Cantor's hand runs down the diagonal, flips each letter, and shows the row that is missing. The player then may add that row (shift the rest down) and watch the hand run again. Deliberation: can any scheme pre-empt the diagonal? Discovery: whatever is put in row u, the hand changes letter u, so the missing row differs from row u at u; the failing is the result, named as such. Fun: anticipation, discovery. Replay: low. This is the "every attempt must fail" shape the skill allows, and the author test passes (Cantor would enjoy watching listers fail), but the stranger's actions are picking from a menu of schemes, and after the second scheme the picking is idle.

**C. The Fugitive** (subject: the player *is* the sequence E0; real time, no words on the play screen; the reckless one). The book scrolls upward endlessly; the player's row is being written at the bottom in time with the scroll; rows that agree with you so far glow and close in; a tap on the left half writes m, on the right half writes w; a row that reaches the line still glowing catches you and the game ends; your score is how far you got. Discovery: the only thing to look at is the cell on the line, and once you see that, you can run for ever. Fun: mastery, anticipation. Replay: a skill run, so high. Given up because real time punishes the thinking the paper needs: a stranger who has not yet seen the rule is caught at row 3 and never finds out why, and a stranger who has seen it has nothing more to find; the play is reflex on a result that is pure logic.

## 9. The first five minutes

**A, Not in the Book.** 0:00. A red bill: NOT IN THE BOOK. Under it, a cream card: "The Great Lister has an endless book. On each line, an endless row of two letters, m and w. He says every possible row is in it. Write one that is not." A gold ticket: START. 0:15. Round 1. A cream page with five rows of big letters, numbered 1 to 5, six letters each and dots after; the first three are m m m m m m, w w w w w w, m w m w m w. Below the book, a gold band with six empty cells: YOUR ROW. Two tickets: m and w. One line: "Each letter you write strikes out every row that disagrees with it there. Strike all five." 0:25. I count: three rows start with m, two with w. I tap w. Rows 1, 3 and 4 strike through and grey out, each with its first letter ringed. "3 struck, 2 still agree." Two rows left, both starting with w; one has w next, one m. I tap m. One strikes. I tap, the last one goes. "All five struck in three letters." A ticket: NEXT: THE ENDLESS BOOK. 0:50. Round 2. The page shows rows 1 to 9, and under row 9, a torn edge: "… and on for ever." Same tickets. "Strike them all." I tap w: five rows strike, and as they fade they slide away, and five rows slide in from below with numbers 14, 23, 31, 47, 58, each starting with w, agreeing with me. "Still agreeing with you: these, and endlessly more." I grin. I tap m: more strike, more arrive: rows 112, 203, 377… I see what is happening. After five letters the Lister's card: "You struck 45 rows. Still agreeing with you: endless. You will never strike them all." 1:30. Cantor's bargain on a card: "You do not have to strike them all at once. Strike row 1 by your 1st letter, row 2 by your 2nd, row 3 by your 3rd. Every row dealt with by its own number, and the book being endless does not matter." A ticket: TRY IT. 1:45. Round 3. A fresh page. Row 1 appears, ten letters, and its first cell has a teal frame; a teal line runs down the diagonal of the empty page. "The Lister writes each row as you go. Strike row 1 here." Row 1's first letter is m. I tap w. Row 1 strikes, ringed on the line. Row 2 slides in: w, then m in the teal cell, then more. I see it: its first letter is mine. The Lister is copying me. I tap w. Struck. Row 3: w w, then w in the frame. I tap m. 2:30. Row 7: I am going fast now and I look only at the teal cell, and I frown at how easy it is, and then I realise that is the point: it is easy *for ever*. 3:00. Row 10 struck. "Ten rows, each struck at its own number. None slipped." A ticket: SEE THE VERDICT. 3:10. The end screen: the verdict in words; under it, the Lister puts my row into his book as row 1 and shifts the rest down, and a hand runs down the new diagonal flipping letters, and a new row appears in gold: "Not in the book. Again." Then the paper's line. A ticket: PLAY AGAIN with a new book number.

**B, The Great Lister.** 0:00. Same bill, but "You are the Lister. Fill the book so that no row is missing." 0:15. A page with eight empty rows and a menu of ways to fill them: ALL m, ALL w, ALTERNATE, COUNT, COPY ABOVE AND CHANGE ONE. I pick COUNT; rows fill with binary counting. "Cantor's hand" runs the diagonal and writes the missing row in gold. "Not in your book." 0:40. "Add it?" I add it as row 1; the hand runs again; a new missing row. I frown: I am watching, not doing. 1:00. I try COPY ABOVE AND CHANGE ONE. The hand wins. By 1:30 I know every pick loses, and the game has told me so. The showing of why (letter u changes at row u) is clear and the failing is honestly named, but I have made two choices and both were from a menu.

## 10. The pick, and why

**A, Not in the Book.** The player writes the paper's own variable, b(v), one letter at a time, against an opponent who embodies the stranger's wrong belief (the book has everything; whatever you write, I have it further down). The three rounds are three different questions (which letter strikes most; can I finish at all; which cell decides this row), with the counterintuitive moment in round 2 and the mechanism in round 3. The sentence afterwards has no "guess": *I wrote the row by flipping the diagonal, and the Lister could not have it.*

**Author test.** Cantor would recognise his m and w, his E_I, E_II, E_III as the first three rows, his b(v) ≠ a(v,v), and his closing line that E0 would be both an element and not an element of M; he would enjoy the Lister's copying trick in round 3, which is exactly the adversary the proof is built to beat. The colleague who knows the answer still has to count letters in round 1 and still enjoys the endless book turning to rows further down.

**Runner-up: B, The Great Lister.** Switch if the author wants the game to show the *failure of every listing* rather than the construction that beats it; the shape would then be a sequence of menu picks each shown to fail, honestly labelled, and B's walkthrough shows that becomes watching by the second pick.

**What the reckless concept would have given.** C's wordless real-time scroll would have put the diagonal under the thumb with no text at all, and its skill run would be replayable. Its idea survives in a softened form: round 3's rows arrive one at a time and the only thing to look at is the cell on the line. Given up: the clock, the catching, the scoreless run.

## 11. The shape

Three short rounds and an end, about three minutes, one session:

1. **The small book**: 5 rows, 6 letters wide; the paper's E_I, E_II, E_III and two rows drawn from the book number. Write up to 6 letters; the round ends when every row is struck (success: "all five struck in k letters") or the sixth letter leaves a row agreeing ("row 4 is you: the Lister has it").
2. **The endless book**: 9 rows shown; write 5 letters; after each, struck rows leave and rows from further down that agree with you arrive, with their row numbers; the round ends on the Lister's card: struck so many, still agreeing: endless.
3. **Cantor's bargain**: a 10-by-10 page with a teal line down the diagonal; the Lister writes row u when you reach letter u, copying your first u−1 letters and choosing the rest; strike row u on the line or it slips. Ten letters. Round verdict: how many slipped.
4. **The end**: the verdict in words; the Lister adds your row as row 1 and the rule runs on its own and produces a new missing row; the paper's line; PLAY AGAIN with a new book number.

No presets: the paper has one construction. The book number (seed) is on the start screen and replayable through the URL. Score: none; each round reports in the aim's units.

## 12. Controls, mechanism, feedback, moment

- **Controls.** Two tickets, m and w, each about half the width and 72 px tall. One tap writes the next letter of your row. Nothing else to press during a round except ? (How to play).
- **Mechanism (ported).** `flip(c)`: the other character. `strike(rows, yourRow)`: for each row, the first column where it differs from your row so far, or none. `diagonal(rows)`: Cantor's E0, b(v) = flip(a(v,v)). The books: round 1's five rows (three fixed, two seeded); the endless book, whose rows are generated on demand and stored so that a row number always shows the same letters, with the Lister fetching the next rows that agree with your prefix; round 3's Lister, who writes row u as your first u−1 letters followed by seeded letters. Round 3's score: the rows whose letter on the line equals yours.
- **Feedback.** The strike: a row's letters grey and a line runs through them, and the deciding cell is ringed. The arrival: struck rows slide out of the endless book and agreeing rows slide in with bigger numbers. In round 3, the teal line and a row dying exactly on it, or flashing gold and staying when it slips. A one-line count under the book in the aim's units.
- **Moment.** Round 2's third letter: the player strikes most of the page and the page refills with rows that agree. Round 3's third row: the player sees the Lister copying them and that only the cell on the line is free, writes the other letter, and the row dies on its number. The end: the rule runs on its own against a book that now contains the player's row.

## 13. The look

**Register: a fairground bill** (Loud family). It comes from the paper's setting read as a show: a man with an endless book who claims to have everything, and a challenger. Halle, 1891, is the Germany of the Jahrmarkt, and the paper's one-upmanship (a "much simpler proof") has a showman's swagger. Loud means the register: wood type, stripes, tickets; no jokes on the mechanism.

- **Palette:** big-top red `#D7263D` (the ground and the w letters); bill cream `#FBEFD5` (the book's pages and cards); ink `#1A1412` (text, the m letters, strikes); brass gold `#F2B33D` (your row, the tickets, the slip flash); Cantor teal `#1C8E86` (the line in round 3, the ring on a deciding letter). Struck rows fade to a warm grey `#B9AFA0`.
- **Type:** Rye (SIL OFL) for the title, round names, row numbers and tickets; Alfa Slab One (SIL OFL) for the m's and w's in the book and the big counts; Work Sans (SIL OFL) regular and bold for text. All embedded as data.
- **Buttons:** tickets: gold, with a perforated edge (a dotted line inside each short side), ink capitals in Rye, slightly rounded; pressed, ink with gold type. The m and w tickets are the same shape with one big letter.
- **The one visual rule:** the book is the scoreboard. Nothing counts but strikes on the page: a row alive is ink on cream, a struck row is greyed with a line through it and its deciding letter ringed, and your row is the one gold band on the page.
- **Play screen, at 380 px:** aim line in cream on red (32 px) with ? at the right; the book: a cream page, rows of 6 or 10 cells at 34–44 px with row numbers in Rye on the left margin, about 5 to 10 rows (210–420 px); it answers "which rows still agree with me?"; under the page, the gold band YOUR ROW with the same cells, filled left to right; it answers "what have I written?"; the two tickets (72 px); one line of count in the aim's units. In round 2 the page has a torn bottom edge and "… and on for ever". In round 3 the teal line crosses the page corner to corner.

## 14. What is cut

The second half of the paper (the generalisation to the set of all functions on any set L, and the conclusion that powers have no maximum): not in the PDF and not in the game, though the end screen says Cantor went on to it. The 1874 proof via irrationals and the remark that this one avoids them. The words Mächtigkeit, Mannigfaltigkeit, Inbegriff: the game says "rows", "book", "more rows than whole numbers". The real numbers: the game never mentions them. Any permutation of the diagonal (any pairing of rows to letters works): the game uses Cantor's own, row u with letter u.

## 15. Divergences

- **Finite windows.** The rows are infinite in the paper; the game shows 6 or 10 letters and dots after. In round 1 and 3 the contest is on the shown letters; the About screen says so.
- **An opponent who reacts.** The paper's list is given in advance. Round 2's Lister turns to rows further down that agree (which an endless book that contained everything would have); round 3's Lister writes each row after seeing your letters so far. Both are the designer's dramatisation of the Lister's claim that whatever you write is already in the book. The rule the player finds beats a list given in advance just as well, and the end screen runs it on such a list.
- **The deadline (row u by letter u).** This is Cantor's own bookkeeping (b(u) ≠ a(u,u)), drawn as a line and made the rule of round 3. It is one way to beat the book, not the only one; the game says "Cantor's bargain", not "the only way".
- **Round 1's majority trick.** Striking the most rows per letter is a strategy the finite book rewards and the paper does not discuss; it is there so that round 2 can take it away.
- **Counts on screen** (3 struck, 2 still agree) are small integers the player needs to act; no other numbers appear.

## 16. Mechanism kind and claim boundaries

**Ported.** The mechanism runs Cantor's construction as written: `flip(c)` is the other character, `diagonal(rows)` is E0 with b(v) = flip(a(v,v)), `strike(rows, yours)` is the position where a row first differs from the player's row. Round 3's score (a row slipped if its letter on the line equals the player's letter) is the paper's own check b(u) ≠ a(u,u). Everything else is the game's framing: the books, the window widths, the Lister who turns to rows further down (round 2) and writes rows to copy the player (round 3), the majority trick that round 1 rewards.

- **Demonstrates:** the construction, on the paper's own three elements, on random lists, on adversarial lists and on the game's reactive Lister; that adding E0 to the list and rerunning gives a new E0 not in the new list.
- **Assumes:** finite windows (6 or 10 letters) for rows that are endless in the paper; a reactive Lister, where the paper's list is fixed in advance; the deadline framing as one way, not the only way, to beat the book.
- **The paper establishes:** that no series E1, E2, … contains every element of M, hence M is not countable. It says nothing about strategies, deadlines or showmen. The game's rounds are not evidence for the theorem; they show the construction that proves it.

**Where the discovery comes from.** Round 2's "you can never strike them all" follows from the Lister's claim that every prefix is in the book, which the game grants him (and which a complete book would have to satisfy); it is the stranger's own belief acted out, not a result of the paper. Round 3's "flip the line cell and no row survives" is the paper's mechanism. The check that the discovery survives changes to the designer's choices: the diagonal rule leaves no row agreeing for random lists, for the four adversarial lists (all-m, staircase, checkerboard, binary counting) and for the copying Lister; it does not depend on the window width, the number of rows or the seed (calibration.js, P1, P2, R3).

## 17. Calibration plan

Against the paper: (P1) b(v) ≠ a(v,v) for every v on 500 random square lists of 2 to 41 rows; (P2) E0 agrees with no row on those lists; the same two on four adversarial lists; (P3) the paper's E_I, E_II, E_III give E0 = (w, m, w), which is what the paper's definition yields on its own examples; (P4) adding E0 as row 1 and rerunning gives a new E0 not in the new list, 300 seeds. Against the game's own framing: round 1 books have five distinct rows with the paper's three first and are beatable by the diagonal in at most 5 letters (400 book numbers); the endless book always refills with rows that agree, with growing row numbers and consistent contents, and never ends by striking everything (300 seeds); round 3's rows copy the player's first u−1 letters and the diagonal rule lets none slip (300 seeds). Heuristic players (random, always-m, majority-strike, diagonal) over 2000 book numbers, with the memo's expectations as checks.

## 18. Calibration result

22 of 22 checks pass (`calibration-result.txt`). Heuristic players, 2000 book numbers each:

| player | R1 strikes all five | R1 letters used | R3 rows slipped (of 10) | R3 rows still agreeing at the end |
|---|---|---|---|---|
| random | 92% | 3.8 | 5.05 | 1.00 |
| always m | 0% | 6 | 5.01 | 1.03 |
| majority strike | 100% | 2.5 | 0 | 0 |
| diagonal | 100% | 2.7 | 0 | 0 |

What the table says, and what the game does with it. In round 1 the majority trick beats the diagonal (fewer letters), so a stranger who finds it is rewarded; random play loses the round about one time in twelve, which is enough for the loss screen to exist. In round 3, because the Lister's rows arrive one at a time already agreeing with the player, the round-1 habit (strike the rows still alive) *coincides* with Cantor's rule: a player who carries the habit finds the rule by doing it, and only a player who ignores the page slips, about half the time per row. That is why round 3 has no separate hint about the line beyond the bargain card. The slip-count verdict distinguishes the two.

## 19. Build log

- Mechanism written headless (`mechanism.js`), calibration 22/22. Loop played headlessly (`loop.js`, `loop-log.txt`): the strikes name themselves, round 2 visibly refills with rows that agree, round 3's copying is plain in the printout.
- Skin: fairground bill. Fonts Rye, Alfa Slab One, Work Sans (OFL), embedded. Tickets with perforated edges; the book as the scoreboard; one gold band for the player's row; teal only for Cantor's line and the deciding letter.
- Browser session (`session-test.js`, `session-log.txt`, Chromium at 380 px): a full game by majority then one deliberate slip; help opened mid-round-2 and returned to the same page; the end screen's rerun; play again with a new book number; a second game losing round 1 by always-m and playing round 3 clean, reaching the "clean after a round-1 loss" verdict. No console errors, no horizontal scroll.
- Screenshot review fixed four things: the player's band stacked its cells vertically (a missing flex rule); the teal diagonal ran the wrong way; the round-2 title wrapped; the end screen's lower band is now labelled "new row". Round 1's orientation shortened to four lines.
- Length: about three minutes, estimated from the tap count (about 21 taps and four cards); not measured with a person.
- Not done: stranger testing. The author-note says so.
