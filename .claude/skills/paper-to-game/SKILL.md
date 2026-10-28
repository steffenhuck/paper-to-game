---
name: "paper-to-game"
description: "Turn a scientific paper (any field) into a playable single-file HTML browser game that makes the paper's central claim something a player feels. Trigger when the user attaches or links a paper and asks for a game, a playable version, or invokes /paper-to-game. Produces a design memo first, then the game. Not for Steffen's own house-style teaching games (those are built by hand in their own threads)."
---

# Paper to Game

This skill turns someone else's paper into a beta game. The author will tweak it afterwards; the job here is to get a *playable* and *faithful* first version out, with every design decision written down so the author can change it.

The method was reverse-engineered from *The Screen* (built from Huck's "Closed Codes"): a paper becomes a game not by itself but through a short sequence of design calls made **before any code exists**. This skill forces those calls, in order, and records them.

Two stages, one invocation, no pause between them. Stage one writes the design memo and shows it to the user. Stage two builds the game from the memo, not from the paper, and starts immediately: the memo is a record the user can read while the build runs, not a question. Stop only if the user interrupts. Do not skip the memo and go straight to code; do not wait for approval of it either.

---

## Inputs

- A paper, usually a PDF. Read all of it, including figure captions, tables and supplementary material if attached. Figure captions often state the mechanism more plainly than the text.
- Optionally: the paper's code, data, or supplementary files. If model code exists, port its dynamics exactly. If data exists, use it for calibration.
- Optionally: one line on audience (students in the field / scientists in other fields / general public). Default: scientists in other fields — curious, numerate, no field jargon.

If only the PDF is available, say so in the memo and derive everything from the paper's equations, tables and figures. Numbers read off a figure are marked as such.

---

## Stage one: the design memo

Write the memo as a short document (one to two pages) and show it to the user before building. The memo's sections, in this order:

### 1. What the paper hands over

Classify the paper's *material* — what can actually be turned into a mechanism:

- **Model.** Equations, a simulation, a game-theoretic structure. The mechanism is *ported*.
- **Estimate.** Data, coefficients, distributions, correlations, a PCA, an experimental result. The mechanism is *synthesised*: build a data-generating process that reproduces the paper's reported numbers.
- **Argument.** A verbal mechanism, a conceptual claim, a qualitative story. The mechanism is *formalised*: make the implicit toy model explicit, and say where you had to choose.

Many papers are mixed (an estimate paper whose discussion makes an argument; a model paper with calibration data). Name the primary material and the secondary. For an argument, be unusually candid: list the two or three places where the formalisation made a choice the paper did not.

### 2. The reversal

Every paper worth a game overturns something. Name what the field believed before this paper, and what the paper says instead. If there are two reversals, name both. This is the thing a naive player should get wrong in the first five minutes and understand by the end. If you cannot find a reversal, say so — the game will be thinner, and the memo should admit it.

### 3. The four invariants

Regardless of field, name:

- **The lever.** What the player moves. A choice, a knob, a measurement, a bet.
- **The hidden mechanism.** What turns the lever into outcomes. Ported, synthesised or formalised, per section 1.
- **The feedback.** What the player sees after moving the lever, and how quickly.
- **The surprise.** The moment the reversal lands on the player.

### 3b. The aim and the verdict

Write both here, before any concept is chosen, in the words the player will see.

- **The aim**: one sentence the player could repeat after reading the start screen. "Find the balance no newcomer can beat." "Sort the cells, then find the groups." A game with no win condition still has an aim; "no winning" rules out a win screen, never a goal.
- **The verdict**: the three lines the end screen leads with, large, before any table or explanation. What you did (your number). What the paper says (its number). The gap, in words. "Your eye was 67% consistent. The ruler is 100%. The two kinds are one line."

### 4. Three candidate concepts

Generate three concepts that place the player at *different* positions. The positions:

- **Agent** — the player is a role inside the model; the lever is a choice. Human or not: a neuron, a molecule, a voxel, a species can be the agent *if and only if* its "choice" maps onto a real variable in the paper and its payoff onto a real quantity. Personification sits on top of the mechanism, never replaces it. If the paper supplies no payoff, say the payoff is our construction.
- **Controller** — the player sets conditions on a dynamical system and tries to hit a target. Reaction conditions, dosing, design parameters, policy.
- **Experimenter** — the player probes a hidden truth with noisy instruments and must infer it. Often the paper's own method, replayed. For causal papers: let the player feel why the naive comparison lies.
- **Forecaster** — the player bets on what the system will do; the paper's finding is the reveal. The fallback when nothing can be manipulated. Thin but never impossible.
- **Subject** — the player is the thing being studied (a participant in the experiment, a perceiving brain, an organism under selection). Common for psychology, neuroscience, behavioural work.
- **Dilemma** — for conceptual or normative papers that resist even a toy model: the player walks through the situations the paper describes, chooses, and sees the point unfold. A scripted argument with branches, not a mechanism.

At least one of the three concepts must cast something non-obvious as the agent (the molecule, the cell, the institution). Each concept gets four lines: position, lever, feedback, the moment of surprise.

### 5. The pick, and why

Choose one. The criterion: **which concept makes the reversal something the player feels in the first five minutes**, with originality as the tie-breaker. Record the runner-up and what would make you switch to it, so a second pass can build it without redesigning.

### 6. Presets

Presets are the paper's own regimes: the baseline, the comparative statics, the counterintuitive corner, the subgroups, the conditions in the experiment. Three to six, each named and each tied to a table, figure or section. Never invent a regime the paper does not discuss. If the paper has no regimes, use its contrasts (before/after, treated/control, curly/straight).

### 7. What is cut

List everything in the paper the game leaves out, deliberately. One loop, one lever. Everything else is cut and listed so the author sees it was a decision.

### 8. Divergences

Game-clock compression, exaggerated parameters, added noise, stylised payoffs. Each one named with the reason. A paper's 400 periods become 30 rounds; say so.

### 9. Visual world

Derive the game's look from the paper, not from a template. The paper's own imagery — a confocal stack, a petri dish, an oscilloscope trace, a trading floor, a furniture catalogue — becomes the game's world, and palette, type and motion follow from it. Name the world in one line and the three or four visual rules that follow. No house style: each game looks like its paper.

### 10. Fidelity check

After the build, append the *result* here (the numbers the headless check produced against the paper's), and a short build log of what took more than one pass.

State what the headless check will verify before any UI is built:
- Model: the ported dynamics reproduce the paper's key figure qualitatively.
- Estimate: the synthetic data-generating process, re-estimated, recovers the paper's reported table (signs, rough magnitudes, correlations).
- Argument: the toy model, run, produces the outcomes the argument claims; list the assumptions it needed.

If the check fails, say so in the memo and do not build on a wrong mechanism.

---

## Stage two: the build

Build from the memo, straight away. If the user interrupts to redirect, revise the memo first.

### Procedure

1. **Mechanism first, headless.** Implement the mechanism as plain functions with no DOM. Run the fidelity check from memo section 10 in Node or Python and record the result. Keep the functions; they go into the HTML unchanged.
2. **Config block.** Every number the engine chose sits in one commented block at the top of the script, each line tagged with its origin (`// Table 4, viral-labeled median`, `// eq. 7`, `// read off Fig. 2b`, `// our choice: game-clock compression`). The author edits numbers here and nowhere else.
3. **Loop, then skin.** Build the play loop with placeholder visuals, confirm a full session works end to end, then apply the visual world.
4. **Screens.** Start screen (title, one-paragraph premise, preset choice), play, end screen with score, "About this game" (the memo, lightly edited for a reader), and attribution.
5. **Check by opening it.** Two stranger tests first: someone who has read only the start screen can say the aim in one sentence; someone who has read only the top of the end screen can say what the paper found. If either fails, fix the text before anything else. Then render the page at phone width, play one full session with screenshots, read the config block as the author would. Mechanism fidelity and visual legibility are separate checks: a slab can pass every statistical test and still look like uniform noise. If the hidden structure is not visible on screen at the moment of the reveal, iterate on the rendering (lengths, directions, density) until it is, and keep the mechanism's numbers where they were.

### Hard constraints

- One self-contained HTML file. No external dependencies, no CDN, no fonts fetched. Inline SVG or canvas.
- Playable on a phone: touch targets, no hover-only interactions, no horizontal scroll at 380px.
- A complete session in ten to fifteen minutes. No win screen, but a clear aim: the one sentence from memo 3b sits on its own line on the start screen, repeats at the top of every round, and opens the How to play page.
- A score the player can see moving while they play. It changes when the lever moves, or at least after every decision. A score that appears only at the end is not feedback.
- The score is the aim's own yardstick, in the aim's own units, measured per round. If the aim is "find the balance no newcomer can beat", the score is "newcomers held off: 11 of 11", and a round in which the aim is met reads as complete success the moment it is met. Never a running point total whose maximum lies in rounds not yet played: a player who has just done exactly what was asked must not see 33 of 165. A cross-round tally, if any, is in the same units ("societies held: 2 of 5"), shown separately and smaller. The maximum for the current round is visible on the play screen, not in the help page.
- Every round ends with its own one-line verdict before the next begins: what you did, what the paper says for this round. The game's final verdict (memo 3b) then sums those lines; it is not the first time the player learns how they did.
- No bookkeeping mechanics: no fixed number of attempts per round that rewards repeating a correct answer, no points for re-testing. A round ends when the aim is met or the player chooses to move on.
- The end screen leads with the verdict from memo 3b — three lines, large: what you did, what the paper says, the gap. Only then the explanation, the table, the attribution. A reason to play again (a different preset, a better score) closes it.
- The player never reads a paragraph of instruction before acting, but every screen carries the one or two sentences a smart stranger needs to act on it: what the things on screen are, what the choice means, roughly what a good answer looks like (a number, a range). Define every term the player has to use — if the buttons say "curly" and "straight", the screen says in plain words what each looks like, and where possible shows the two extremes side by side before the first choice. Name a measure before the player sees it move (a ruler that fills in during play is a mystery unless its axis has been explained in one line).
- A **How to play** page, reachable from a prominent button on the start screen and from a small ? on every play screen, explains the whole game in plain language for a smart person from outside the field: the setting, what each round asks, what the score means, and what the game is trying to show. Written for a general reader, not a specialist; no jargon that isn't defined in the same sentence. Returning from it lands the player back where they were.
- Button labels say what happens, not a metaphor: "Show the dendrites", not "Develop the dendrites".
- Feedback is immediate and visible — something happens on screen every time the lever moves.
- The game must be *fun to watch*: motion, accumulation, reveal. A dashboard of moving numbers is not a game.

### Prose inside the game

Match the substance of the paper; do not quote it. Technical terms only where the player needs them to act. Explanations arrive after the surprise, not before.

### Attribution

End screen and About screen carry: paper title, authors, journal, year, DOI or URL. "Game built from this paper; the paper is the authority where the two disagree."

### Deliverables

When the skill is invoked inside the `paper-to-game` repository, the build also lands in the repo: a new folder named by slug (`olive/`), holding the game, `memo.md`, `author-note.md`, the headless mechanism and fidelity check, the fidelity result and two screenshots; the PDF moved from `inbox/` into that folder if it was there; a new row in the README's games table with the play link `https://steffenhuck.github.io/paper-to-game/<slug>/<file>.html`; one commit. Push to `main` directly if the environment allows; if it only allows a branch, push the branch and open a pull request — the repository merges pull requests from `claude/…` branches automatically, so no one has to do anything further. Never leave the work unpushed. The reply ends with the play link and the folder link.


- `<slug>.html` — the game.
- The memo, as shown in stage one, also embedded in the About screen.
- A three-line note for the author: what to look at first, where the config block is, what we were least sure about.

---

## Worked examples

**Agent, from a model.** *The Screen* (from "Closed Codes"): player runs national television and picks code shares each round; mechanism ported exactly from the paper's simulation; milieu B cut entirely; six presets from the paper's most interesting parameter configurations; score, no win; furniture as the visual world (brown Schrankwand for the common code, pink shell chair for the own code). Divergences: faster clock, stronger habit.

**Experimenter, from an estimate.** *The Cutoff* (regression discontinuity): the player is the econometrician, sees why the naive comparison lies and what the discontinuity recovers. The paper's method replayed as the loop.

**Experimenter, from an estimate-plus-argument.** Vrieler et al. 2019, inferior olive neuron morphology: the player sorts synthetic neurons into "curly" and "straight" and is shown their own inconsistency; then hunts for clusters in a field of somata, fails, and sees the clusters appear when dendrite directions light up. Two reversals, one per act. Synthetic neurons generated from the paper's Table 4 ranges with Table 5 correlations; visual world the confocal stack.

---

## Failure modes to avoid

- Opening the skin before the mechanism exists: a polished page with thin content.
- Letting the player sit at a *parameter that doesn't matter* in the paper.
- A personified agent whose payoff is not in the paper, unflagged.
- Inventing presets the paper never discusses.
- A session that only shows the result; the player must have been wrong first.
- No stated aim, or a score the player only meets at the end, or an end screen that is a table rather than a verdict.
- A score denominated differently from the aim (points accumulated across the game while the aim is per round), so that success reads as failure.
- Explaining before the surprise — but also its opposite: leaving the player unable to act because a term was never defined. Orientation is not explanation; give the first, withhold the second.
- Any number in the code that is not in the config block with its origin.
