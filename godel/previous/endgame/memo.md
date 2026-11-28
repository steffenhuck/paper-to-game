# Gödel's Endgame — design memo (three acts)

Gödel (1931) as Hilbert's honest machine and Hilbert's promise: "give my machine any sentence; it prints it, or prints its NOT." The player plays the machine on sentences with + and ×, packs a sentence into one number and unpacks another, judges a sentence about the machine itself, fills one gap so a sentence talks about itself, and finds that both buttons fail: the machine can print neither the sentence nor its NOT, and the sentence is true.

Built in chat, 15 Nov 2026, out of a long conversation with Steffen in which he worked through the argument himself. Earlier builds are in `previous/` (*Gödel's Loophole*, chalk, first engine run) and `previous/four-keys/` (the four-key machine, revisions 0–5). What the conversation settled: the four-key machine handed the player a PRINTS key for free and so hid where Gödel bites; the paper's real first move is that with + and × a sentence can be packed into a number, so arithmetic can talk about its own proofs (with only +, Presburger 1929, it cannot); Hilbert's claim is completeness ("it or its NOT"), which is what the paper breaks; "not a sentence" (xyzzy, the endless nesting) is no counterexample, so the grammar is visible as a stamp; nothing about printing is ever typed by the player, it is said by the game in full English; the self-referring sentence is given in plain words with one gap (Quine's "written twice, the second time in quotes"); and the player works the machine with the same two buttons throughout, so that the dilemma is met in the hands (his idea), with a third button, *Print neither*, appearing only when both fail.

## Given
Mine: signature and counter. Title his: *Gödel's Endgame*. Look left to Claude (kept: Wiener Werkstätte cabinet, ivory, black-and-white chequer, gold plate, Courier Prime for anything printed, Josefin Sans, violet stamps, red for false). Input: buttons only, no text field (after a long round in which typing never worked for him in Safari).

## Paper
Kurt Gödel, "Über formal unentscheidbare Sätze der Principia Mathematica und verwandter Systeme I", *Monatshefte für Mathematik und Physik* 38 (1931): 173–198. DOI 10.1007/BF01700692. Meltzer's translation (1962).

## The discovery
Completeness fails once arithmetic can describe its own machine: the step is multiplication (packing lists into numbers), the sentence is finite and talks about itself through a recipe rather than by containing itself, and it is true. Every repair has its own such sentence.

## Shape
- **Act 1, Hilbert's promise.** Round 1: Hilbert hands over `1 + 1 = 2` (keypad locked), player hands it in, the grammar stamp says SENTENCE, player as the machine presses *Print it*. Rounds 2–3: free keypad (digits, +, ×, =, NOT; Take back, Clear, *Give me one*). Non-sentences get NOT A SENTENCE with the rule broken, and Hilbert: "a scribble doesn't count." A wrong button is refused: "that slip would be false; the machine is honest."
- **Act 2, every sentence gets a number.** Code card (1→1, 2→2, 3→3, +→4, ×→5, =→6, NOT→7). Pack `1 + 1 = 2` by tapping its symbols in order: 2¹ × 3⁴ × 5¹ × 7⁶ × 11² = 11,530,778,490. Unpack 72,900 by dividing by 2, then 3, then 5 (codes 2, 6, 2 → `2 = 2`). One line: with only + this is impossible. Then "The machine has printed sentence number 11,530,778,490" with the same two buttons; true, printed; Hilbert: "my machine can even talk about itself; multiplication did."
- **Act 3, the sentence.** "The machine never prints the following words, written twice, the second time in quotes: "____"". Four gap choices; under the machine, *Your sentence* and *It talks about*; exactly one choice (the frame's own words) makes them the same. Hint after two misses. Then the same two buttons: *Print it* → a false slip; *Print its NOT* → a false slip; *Print neither* appears after the first failure → the slot stays empty, the sentence is true, the promise broken. One line separating it from the liar.
- **Hilbert's repair.** Machine II's sentence, one word changed; every repair gets a new one.
- **Verdict** in four parts; Read further (Presburger; the filing trick and the gap are Gödel's, the words Quine's; honest vs ω-consistent and Rosser; Proposition XI; what it does not say).

## Mechanism kind and claim boundaries
**Toy.** Grammar: NOT* expr = expr, expr = numbers joined by + and × (× first). Truth by arithmetic. Packing by prime powers with the game's codes; unpacking by division. The gap: the sentence talks about the gap's words doubled with quotes; self-reference iff the gap holds the frame itself. The dilemma is the argument written out, machine assumed honest.
- **Demonstrates:** an honest machine settles every keypad sentence; one number holds a sentence and gives it back; a sentence about the machine's printing is a sentence about a number; one filling makes the sentence about itself; the machine can then print neither it nor its NOT, and it is true; a repaired machine has its own.
- **Assumes:** honesty (more than Gödel's ω-consistency); that "the machine prints sentence N" can be written with + and × (shown in one case, proved in the paper by forty-six definitions and Proposition VII).
- **The paper establishes:** Propositions VI and XI for P and every ω-consistent system with a recursive set of axioms.

## Calibration
`calibration-result.txt`: grammar and truth cases; every keypad string up to 5 symbols (579,194 strings, 34,000 sentences) is either not a sentence or settled by exactly one button; packing 1 + 1 = 2 gives 11,530,778,490 and unpacks back; 72,900 unpacks to 2 = 2; every string up to 4 code symbols round-trips; exactly one gap choice is self-referring and it is the frame; the dilemma's three branches. All passed.

## Build log
- Mechanism and calibration first; `build.py` refuses to build on a failed check and verifies the mechanism is embedded verbatim.
- Two browser sessions (`session-test.js`, `session-log.txt`): a phone at 380 × 760 that tries nonsense, a wrong button, misses the gap twice and presses all three dilemma buttons; a 1280 × 640 laptop window. No page errors (the counter script is blocked in the test), no horizontal scroll.
- Fixed on the screenshots: slips sliding over the sentence (now fade in), the choice list hidden once the gap is found, the comparison scrolled into view after a miss.
- Not measured: session length. Not tested in Safari (not available here); buttons only, the same kind of control as *Begin*, which always worked for him.
