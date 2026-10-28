# The Mixed Street — note for the author

1. Look first at the two coin tests ("Giver hidden", "Giver seen") and at the end-screen line for a player who convicts "Kinder to their own" after running only "Giver seen". That contrast is the whole game: is it obvious enough to a stranger that the hidden version is what separates kindness from being watched?
2. Every number is in the `CONFIG` block at the top of `mechanism.js`, the only copy of the mechanism, each line tagged with its table or page; the suspects, tests and the evidence rules (`RULES`: which tests back which verdict) sit just below it. Edit, run `node fidelity.js`, then `python3 build.py`, which regenerates the page and refuses to build if the embedded mechanism differs from the file.
3. We were least sure about the evidence rules and the budget: with five of seven tests, exactly one plan proves all five calls (the paper's own set), so the challenge is tight. We also call "Easier to find" guilty alongside "Watched by their own", reading the paper's findability result as part of its sanctioning story; and the bar heights in the coin and pooling games are placed around the reported averages, since the paper reports only the gaps.

This game has had the builder's review only: screenshots and a scripted browser session at 380 px. It has not been played by real strangers, and the five-minute length is an estimate.
