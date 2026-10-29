# paper-to-game

Send me a paper; you get back a playable browser game built from it.

The game is a beta: one self-contained HTML file, playable on a phone, with every number it uses sitting in a commented config block at the top of the source, tagged with the table, figure or equation it came from. You tweak it from there. The paper stays the authority wherever the two disagree.

How it works is in [`SKILL.md`](SKILL.md): a design memo first (what the paper hands over, what it overturns, where the player sits, what is cut, what diverged), then the build, then a headless check that the game's hidden mechanism reproduces the paper's reported numbers.

## Games

| Game | Paper | Play |
|---|---|---|
| **The Olive** | Vrieler et al. (2019), *Brain Structure and Function* 224:1677–1695. Inferior olive neuron morphology. | [play](https://steffenhuck.github.io/paper-to-game/olive/the-olive.html) · [memo](olive/memo.md) |
| **The Balance** | Alger & Weibull (2013), *Econometrica* 81:2269–2302. Homo moralis: preference evolution under assortative matching. | [play](https://steffenhuck.github.io/paper-to-game/moralis/the-balance.html) · [memo](moralis/memo.md) |
| **The More the Better?** | Allmendinger, Hackman & Lehman (1996), *The Musical Quarterly* 80:194–219. Life and work in symphony orchestras: what happens as women join. | [play](https://steffenhuck.github.io/paper-to-game/orchestras/the-more-the-better.html) · [memo](orchestras/memo.md) |
| **The Wall in the Head** | Alesina & Fuchs-Schündeln (2005), NBER WP 11700 (*AER* 2007). Did 45 years of communism change what East Germans want from the state? | [play](https://steffenhuck.github.io/paper-to-game/lenin/the-wall-in-the-head.html) · [memo](lenin/memo.md) |
| **The Mixed Street** | Habyarimana, Humphreys, Posner & Weinstein (2007), *American Political Science Review* 101:709–725. Why does ethnic diversity undermine public goods? Experimental games in Kampala. | [play](https://steffenhuck.github.io/paper-to-game/kampala/the-mixed-street.html) · [memo](kampala/memo.md) |
| **The Original or the Copy** | Hutter & Kriesi (2022), *Journal of Ethnic and Migration Studies* 48:341–365. Politicising immigration in times of crisis: who turns it into a fight, and what copying the radical right does. | [play](https://steffenhuck.github.io/paper-to-game/original/the-original-or-the-copy.html) · [memo](original/memo.md) |
| **Say It Plainly** | Rauh (2023), *Journal of European Integration* 45:683–701. How readable are the European Commission's press releases, and did they get clearer as the EU became contested? | [play](https://steffenhuck.github.io/paper-to-game/rauh/say-it-plainly.html) · [memo](rauh/memo.md) |

## Folder convention

One folder per paper, slugged: `olive/`. Inside: the game (`the-olive.html`), `memo.md`, `author-note.md`, the headless mechanism and its fidelity check, and the screenshots from the build. `inbox/` is where incoming PDFs go before a build.

Steffen Huck, 2026. Games built with Claude under the `paper-to-game` skill.
