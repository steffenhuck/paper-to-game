# paper-to-game

Send me a paper; you get back a playable browser game built from it.

The game is a beta: one self-contained HTML file, playable on a phone, with every number it uses sitting in a commented config block at the top of the source, tagged with the table, figure or equation it came from. You tweak it from there. The paper stays the authority wherever the two disagree.

How it works is in [`SKILL.md`](SKILL.md): a design memo first (what the paper hands over, what it overturns, where the player sits, what is cut, what diverged), then the build, then a headless check that the game's hidden mechanism reproduces the paper's reported numbers.

## Games

| Game | Paper | Play |
|---|---|---|
| **The Olive** | Vrieler et al. (2019), *Brain Structure and Function* 224:1677–1695. Inferior olive neuron morphology. | [play](https://steffenhuck.github.io/paper-to-game/olive/the-olive.html) · [memo](olive/memo.md) |

## Folder convention

One folder per paper, slugged: `olive/`. Inside: the game (`the-olive.html`), `memo.md`, `author-note.md`, the headless mechanism and its fidelity check, and the screenshots from the build. `inbox/` is where incoming PDFs go before a build.

Steffen Huck, 2026. Games built with Claude under the `paper-to-game` skill.
