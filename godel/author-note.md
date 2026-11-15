# Gödel's Endgame — note for the author

1. Look first at `screenshot-a-3-hit.png` (the sentence that talks about itself, the two lines the same), then `screenshot-a-1-nest.png` (why no sentence can contain itself), `screenshot-a-4-never.png` (the doors), `screenshot-a-5-old.png` (Machine II and the old box), `screenshot-a-6-why.png`, `screenshot-a-7-turned.png` and `screenshot-a-end.png`. Then play it on a phone.
2. Everything tunable is in `GODEL_CONFIG` at the top of `mechanism.js`: the keys and their codes, the five puzzles (fixed front, keys, target, box size, hint and show-me thresholds) and Machine II's rule. Change it, run `node calibration.js`, then `python3 build.py`.
3. Least sure about: (a) whether step 2's first target is too easy (one tap of NOT can hit it by accident); (b) the doors and the certificate are a bet and a card, watched rather than played; (c) "honest" is stronger than what Gödel assumed, which only Read further says; (d) whether the numbers screen lands for a teenager or reads as decoration.

This game has had the builder's review only: screenshots and two scripted browser sessions at 380 px. It has not been played by real strangers, and its length has not been measured.
