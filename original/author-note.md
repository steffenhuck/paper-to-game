# On the Record — note for the author

1. Look first at day 1 of the quiet year after a "like them" answer (+3.0 points in one answer) and at the crisis's forced days answered "against them" (nothing). Those two moments carry the game; check that they read as your Table 3 and Fig. 5 rather than as an exaggeration.
2. Every number is in the `CONFIG` block at the top of `mechanism.js`, the only copy of the rules, each line tagged with its table, figure or our rationale. Edit there, run `node calibration.js`, then `python3 build.py`; the build refuses to run if the embedded mechanism differs from the file.
3. I was least sure about the size of an answer's position shift. The game uses Fig. 5's ±1; with the smaller distances between your party groups' average positions (Table 2), "like them" is still worst, but taking them on every day would hand them about two points, and without Model 3's interaction any talk about immigration helps them. The game says so at the first "against them" answer.

This game has had the builder's review only: screenshots and a scripted browser session at 380 px. It has not been played by real strangers, and the four-minute length is an estimate. The previous build from this paper, *The Original or the Copy*, is in `previous/`.
