# Gödel's Endgame — design memo (rebuild)

Gödel (1931) as Hilbert's honest printing machine in a Wiener Werkstätte cabinet. The player types sentences on four keys (NOT, PRINTS, TWICE and a box), learns that no sentence can contain itself, learns TWICE, and types the sentence that talks about itself: NOT PRINTS TWICE [NOT PRINTS TWICE]. The honest machine can never print it, so it is true. Hilbert builds Machine II; the same trick beats it. Hilbert asks the machine to print that it is honest; it can't. Then the keys turn into Gödel's numbers.

This is a rebuild in chat. The first build, *Gödel's Loophole* (chalk on a green board, a rulebook settling filled-in "shapes"), is in `previous/`. Steffen was confused from round 1 on: the first screen was already a sentence about a machine judging sentences, numbers did two jobs (values and line numbers) unannounced, the sentence-builder was a 432-way search that 1% of random players solved, and the rulebook's working stacked double negatives. He asked for the whole concept to be rethought for a prodigious teenager, and left the look and the remaining choices to Claude; title his: *Gödel's Endgame*.

## 0. Given

Mine: signature and counter. Author title, his pick. Blackboard dropped by him (he chose it hoping for animated SVG, which the first build did not deliver).

## 1. Paper

Kurt Gödel, "Über formal unentscheidbare Sätze der Principia Mathematica und verwandter Systeme I", *Monatshefte für Mathematik und Physik* 38 (1931): 173–198. DOI 10.1007/BF01700692. Built from B. Meltzer's English translation (1962), the paper alone (Braithwaite's introduction removed).

## 2–3. What the paper hands over; the discovery

An argument that is also a construction (see `previous/memo.md` §2 for the full reading). The discovery, in the "every attempt must fail" shape: an honest rulebook that works by fixed rules has a true sentence it never proves, built by filling a sentence's gap with its own name; a repaired rulebook has a new one; and no such rulebook proves its own honesty. The stranger's belief going in is Hilbert's.

## 4. The core narrative

Hilbert has an honest machine that prints sentences, some about itself, and bets it prints every true one. A sentence can't simply contain itself: its box would need the whole sentence, box included, for ever. Give the machine a key that copies the box, TWICE, and a short box can talk about a long sentence. Put the front of the sentence into its own box and it talks about itself: "the machine never prints this very sentence". If the machine printed it, it would have printed a lie; so it never does; so the sentence is true. Teach the machine the sentence and the new machine has its own. Ask the machine to print "I never print a false sentence" and it can't, since from that it could print the sentence.

## 5. Position, format, device, chassis

- **Position:** agent — the player is Gödel at the keys, the paper's constructor.
- **Format:** discovery by construction (puzzles with one answer each), then a bet and the card at the doors and at the certificate.
- **Device:** of our own, *the mirror*: under the machine, two typed lines — the sentence, and what it talks about — compared key by key, matching keys underlined in violet; when the lines are the same the sentence talks about itself. Plus slips fed out of the machine's slot.
- **Chassis:** Wiener Werkstätte, Vienna c. 1930: ivory paper, black-and-white chequer (Hoffmann), gold nameplate and box frame, black typewriter keys with gold rims, Courier Prime for anything typed, Josefin Sans for everything else, and one stamp colour, office-stamp violet. Not the night sky of *Leibniz's Worlds*, the straw handbill of *Snow*, the Swiss white-red-black of *Arrow*, or the chalk of the first build.
- **The one visual rule:** gold is the machine, black is what is typed, violet is a match or a verdict (underlines, stamps).

## 6. Three concepts (short)

- **A. The four-key machine** (picked). The diagonal construction as a puzzle with live feedback. The idea of the four keys is Raymond Smullyan's telling of Gödel's argument; About and Read further say so.
- **B. You are the rulebook** (the old runner-up): the player ticks sentences until "you will not tick this one" arrives. Given up again: the sentence arrives ready-made and reads as a trick.
- **C. Gödel's numbers** (reckless): encode and decode by prime powers. Given up as play (numbers are enormous after a few signs); kept as the watched last screen.

## 7. Aim and verdict

**Aim:** *Win the bet: type a true sentence the machine will never print.*

**Verdict:** What the paper found (any honest machine for whole numbers by fixed rules leaves out a true sentence; teach it and the new one has its own; none can print its own honesty). What you found (rub-outs before the sentence or "shown"; door; Machine II, and whether the old box was tried; the certificate bet). Where you part (doors "prints it" > certificate "it can" > answer shown > nowhere). Had yours stood (per case). Then the two sentences typed, the paper, Read further (six notes: honest vs ω-consistent and Rosser; TWICE is the substitution; Smullyan; the self-praising sentence and Löb; adding the opposite, ω-inconsistency; Proposition XI and the Part II never needed).

## 8. The shape

1. **Can a sentence hold itself?** No keys: one button, *Put the sentence in its own box*, pressed three times. Each press puts the sentence inside its own box; the sentence then talks about the one before, two keys shorter (counts on screen); after the third the game says it never closes. (Revision 1: the first build had free typing here, an impossible task with no warning, and an empty box that looked like a text field.)
2. **TWICE** on two targets: NOT [NOT] (PRINTS TWICE [NOT]) and NOT PRINTS [NOT PRINTS] (NOT PRINTS TWICE [NOT PRINTS]).
3. **The sentence:** NOT PRINTS TWICE [ ? ], keys NOT, PRINTS, TWICE; one answer in 121 boxes.
4. **The doors:** "It prints it" / "It never prints it"; the chosen branch plays (a slip stamped *False, yet printed*, or an empty slot stamped *True: never printed*), then both are shown and the game says it: true, never printed, Hilbert loses. One line separating it from the liar.
5. **Machine II:** prints everything Machine I prints plus the sentence; key PRINTS II; one answer in 341 boxes; the old box gives a sentence the game calls false (Machine II prints the old one now).
6. **The certificate:** "Machine I never prints a false sentence" — can it? Bet, then the chain in three lines.
7. **The numbers:** the eight signs flip to codes; the product 2^5 · 3^17 · 5^19 · 7^11 · 11^5 · 13^17 · 17^19 · 19^13; 97 digits.

Hints after rub-outs (twiceA/B 2, self1 3, self2 2); *Show me* after 4/4/6/4. No score.

## 9. Mechanism kind and claim boundaries

**Toy.** A sentence is a front ([NOT] PRINTS|PRINTS II [TWICE]) and a box; it talks about the box's contents, or with TWICE about the contents followed by a box holding them; the game compares piece by piece. The doors and the certificate are the paper's argument written out, with the machine assumed honest.

- **Demonstrates:** no self-reference without a copying step; exactly one filling with it; the honest machine never prints that sentence and it is true; a machine taught it has a new one; a machine printing its own honesty would print the sentence.
- **Assumes:** honesty (soundness), stronger than Gödel's ω-consistency; PRINTS and TWICE as primitive keys where the paper builds Bew and Sb from 46 definitions.
- **The paper establishes:** Propositions VI and XI for P and every ω-consistent system whose axioms form a recursive class. Nothing about others.

## 10. Divergences

- Provable is "printed"; the system is "the machine".
- Honest, not ω-consistent (Read further 1).
- TWICE is the diagonal substitution as a key; the paper's §1 sketch does the same with a numbered list of class-signs.
- Codes for PRINTS (17), TWICE (19), PRINTS II (23) are ours; 5 and 11/13 are the paper's.
- Adding the negation (ω-inconsistency) is a Read-further note, not played.
- The self-praising sentence is not reachable (the fronts are fixed); Read further mentions it and Löb.

## 11. Playing it in numbers

| way of filling the box at step 3 | result |
|---|---|
| copy the front into the box | hit on the first go |
| carry over step 2's answer [NOT PRINTS] | miss, one key short: the mirror shows the third piece differs |
| TWICE first or alone | miss at the first piece |
| random boxes (1000 players) | median 87 tries, 8% within six: a puzzle, not a lottery |

The wrong ways fail for the paper's reason: the gap must be filled with the sentence's own name, nothing else. At step 5 the natural wrong move (the old box) gives a false sentence, the paper's c + 17 Gen r proving the old one.

## 12. Calibration result

`calibration-result.txt`: all checks passed — no self-reference without TWICE (127 boxes, subject always shorter), exactly one answer per puzzle and it is the shown one, the diagonal holds over 2,728 sentences and 8 fronts, the doors, Machine II and its old box, the mirror agrees with the self-reference test, the number has 97 digits.

## 13. Build log

- Rebuilt in chat, 15 Nov 2026. Mechanism headless first (`mechanism.js`), calibration, then the screens; `build.py` refuses to build on a failed check and verifies the mechanism is embedded verbatim.
- Browser sessions at 380 × 760 (`session-test.js`, `session-log.txt`): a player who works it out (with a rub-out hint at step 3, the old box at step 5, "it can" at the certificate) and a player who uses *Show me* everywhere and says "prints it" at the doors. No page errors (the counter script is blocked in the test), no horizontal scroll; keys within 700 px on steps 1–3, step 5 just past it with the Machine II note showing.
- Fixed on the screenshots: stamps overlapping the typed text (now set below it), the rub-out glyph too small, the nesting animation below the keys, the step 1 ending off screen.
- Revision 1, 15 Nov, after his first play ("a little lost in round 1 … I have to enter a string of two characters but can't"): step 1 rebuilt as three presses of one button with the reason said up front; the empty box now reads *tap the keys below* instead of showing a cursor; on a computer the letter keys N, P, T, 2 and Backspace work too.
- Revision 2, 15 Nov, after he still could not enter anything in Safari on a MacBook (clicks on the key buttons never registered for him; not reproducible in Chromium, no Safari available here) and asked for one clear input box: the play screen now has one real text field inside the machine, typed into as words (NOT, PRINTS, TWICE, PRINTS II), with the black chips as optional helpers that type into it; the two comparison lines are plain text with bracket characters, no frames; wrong words and overfull boxes are named under the field. A `?debug` overlay that logs pointer, click and key events on screen stays in the file for future bug reports.
- Revision 3, 15 Nov, after a photo of his screen: he had been on step 1 the whole time, which showed three framed boxes and a headline that read as "enter something" with nothing to enter. Step 1 now shows the sentence and one button under "Nothing to type yet. Just press the button."; the comparison lines on later steps lost their frames (a thin left rule only), so that the gold input field is the only framed thing on the screen. Lesson for the skill: a watch-only step must say so in its first line, and nothing but the control may be drawn as a box.
- Revision 4, 15 Nov: typing was judged on every keystroke, which flashed "not a key" at half-typed words and locked the field the instant the text happened to be right (on step 2 after three letters). Now nothing is judged until Enter or *Feed it in*; while typing, only the "It says" line previews; chips type a word and feed it; a miss keeps the focus in the field; tries are feeds that miss. No uppercase transform or autocapitalize on the field (WebKit quirks avoided).
- Revision 5, 15 Nov: the text field is gone. After four rounds in which he could not enter anything in Safari on his MacBook (cause not found; the buttons Begin and the step-1 button always worked for him), the only input is a pad of big static word buttons (NOT, PRINTS, PRINTS II, TWICE) with *Take the last word out* and *Empty the brackets*, the same kind of control as Begin. The game reads the sentence after every tap. Nothing on screen has a field's frame.
- Not measured: session length.
