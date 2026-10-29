# Ask First: note for the author

1. **Look first** at the first EUROPE door. A young person names a monthly income for Europe in naira, the euro figure sits beside it, and a red note says the poster would make Europe look *better*. Is that the moment you want? Then look at the stamp screen: twelve knocks rarely settle BRITAIN or ASYLUM, and that is deliberate.
2. **Changing numbers.** Every number sits in the `CONFIG` block at the top of `mechanism.js`, the only copy of the mechanism. Each line is tagged with its figure, footnote or design reason, and the six posters sit just below it. To change anything:
   - edit `mechanism.js`;
   - run `node calibration.js`;
   - run `python3 build.py`.

   The build inlines the fonts, regenerates `ask-first.html`, and refuses to build if the embedded mechanism differs from the file.
3. **What we were least sure about:**
   - All counts are read off your figures; there were no microdata. The € axis is our fit at about ₦415/€.
   - The "about right" band (×1.5, ±7.5 points) is ours. The right stamps hold from ×1.25 to ×2.
   - THE ROAD poster sets a personal belief ("would *you* make it?") against footnote 34's population fact. The reveal adds your caveat that an individual might be right.
   - The people at the doors are invented. Their answers are draws from your distributions, one question each.

This game has had the builder's review only: screenshots and a scripted browser session at 380 px. It has not been played by real strangers, and the 3–5 minute length is an estimate. The first build, *The Honest Billboard*, is in `previous/`.
