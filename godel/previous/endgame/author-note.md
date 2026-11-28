# Gödel's Endgame — note for the author

1. Look first at `screenshot-a-3-hit.png` (the sentence that talks about itself), then `screenshot-a-4-not.png` and `screenshot-a-4-neither.png` (both buttons fail, then *Print neither*), `screenshot-a-2-packing.png` and `screenshot-a-2-punch.png` (the filing trick and the sentence about the machine), `screenshot-a-1-nonsense.png` and `screenshot-a-end.png`. Then play it.
2. Everything tunable is in `GODEL_CONFIG` at the top of `mechanism.js`: the keypad, Hilbert's first sentence, the dealt sentences, the number of rounds, the codes, the sentences to pack and unpack, the frame and the four gap choices. Change it, run `node calibration.js`, then `python3 build.py`.
3. Least sure about: (a) whether Act 2's packing and unpacking is too long or too arithmetical for a teenager; (b) whether four gap choices make Act 3 too easy (the hint comes after two misses); (c) "honest" is more than Gödel assumed, which only Read further says; (d) the repair is one watched screen.

This game has had the builder's review only: screenshots and two scripted browser sessions. It has not been played by real strangers, and its length has not been measured.
