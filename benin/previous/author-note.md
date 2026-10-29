# The Honest Billboard: note for the author

1. Look first at the first reveal of a Europe billboard, for example ITALY: the bars of guesses sit almost entirely left of the dashed truth line and turn red. Is "the honest number is good news" the moment you want? Then look at campaign 2, where the unseen billboards have to be judged by analogy.
2. Every number is in the `CONFIG` block at the top of `mechanism.js`, the only copy of the mechanism. Each line is tagged with its figure, footnote or design reason, and the billboard texts sit just below it. To change anything, edit that file, run `node fidelity.js`, then `python3 build.py`. The build regenerates the page and refuses to build if the embedded mechanism differs from the file.
3. These are the parts we were least sure about:
   - All histogram counts are read off the figures at 200 dpi, without microdata. The € axis is our reconstruction: ticks at ln(₦) = 9…15 at about ₦415/€. It reproduces the labels and your €660 median.
   - The "about right" band (×1.5, ±7.5 points) is ours. The ranking and the best set of three hold from ×1.25 to ×2.
   - THE ROAD billboard compares a personal belief ("would *you* make it?") with a population fact from footnote 34 that the paper itself says is not precisely known. Check that you are comfortable with that framing.

This game has had the builder's review only: screenshots and a scripted browser session at 380 px. It has not been played by real strangers, and the four-minute length is an estimate.
