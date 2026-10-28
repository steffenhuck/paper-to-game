# The More the Better? — note for the author

1. Look first at the first reveal (how well players get along). The player has just drawn a line, usually rising or flat; the brass line turns down and then back up. Does the verdict line under the chart say enough, or should the stage explanation be shorter?
2. Every number is in the `CONFIG` block at the top of `mechanism.js`, the only copy of the mechanism, each line tagged with its figure, page or design reason. The six curves are read off Figure 5 at 300 dpi; if you have the authors' table, replace them there. Edit, run `node fidelity.js`, then `python3 build.py`, which regenerates the page and refuses to build if the embedded mechanism differs from the file.
3. We were least sure about the shape rule: "falls at first" and "recovers at the end" with a 0.2-point dead zone. The check shows the paper's six curves classify the same way for any dead zone from 0.1 to 0.3 and under a rule with no dead zone, but a player's wobbly line near the threshold may read as "level" when they meant a small rise. And the measures are renamed in plain words; the paper's names are on the About screen.

This game has had the builder's review only: screenshots and a scripted browser session. It has not been played by real strangers.
