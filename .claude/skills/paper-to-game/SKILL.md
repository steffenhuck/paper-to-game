---
name: "paper-to-game"
description: "Turn a scientific paper (any field) into a playable single-file HTML browser game that gives a stranger a good few minutes and leaves them with something the paper discovered. Trigger when the user attaches or links a paper and asks for a game, a playable version, or invokes /paper-to-game. Writes a design memo, builds the game, checks it, commits it. Not for Steffen's own house-style teaching games (those are built by hand in their own threads)."
---

# Paper to Game

## 0. What this is for

Someone sends a paper. They get back a game: one HTML file, playable on a phone, built on the paper's own mechanism, with every number tagged to its source so the author can tweak it. The game is a beta; the author finishes it.

The hard problem is not the code. It is discovering the playable experience latent in a particular paper: what a player could *do* that would let them find for themselves what the paper found. The engineering below exists to serve that discovery, not to dictate its shape. Different papers should produce games in which players do different things, not the same structure in different skins.

The test of a good result: a smart stranger, handed the link on a phone, plays, for as long as the game needs and no longer, without being told to, understands what they are doing the whole time, has to think before acting at least once, finds something out, and could afterwards say in one sentence what the paper discovered. Fidelity is a constraint, not the goal: the game must be honest about what it demonstrates and what it merely illustrates (section 5), but within that honesty the presentation may simplify as far as play requires.

---

## 1. The player

A smart person from outside the field, on a phone, who did not ask for homework. They tapped a link because someone they like sent it. They will give it thirty seconds before deciding whether to give it five minutes. They read nothing longer than two lines before they are allowed to do something. They do not know the field's words and will not look them up. They can follow a number if told what it measures. They like being surprised, they like being right, and they like being wrong when the game is kind about it.

What they are hoping for, in order: something to do right away, with an obvious thing to press and an obvious thing that happens; a reason to care that fits in a sentence; feedback they can see, that says whether what they did worked; a moment of discovery; a sense of getting better, or of understanding; a verdict in a few lines. What they are not hoping for: decoration, a tutorial, a dashboard, points for their own sake, a table, the abstract, anything in Greek.

---

## 2. What makes it a game rather than a demonstration

A slider with an animated response can be an excellent demonstration and not a game. A game requires **meaningful decisions or actions whose consequences the player can learn to anticipate or influence**. The commonest way to meet that is deliberation — the player has a reason to think before acting — and the sharpest test is to ask, before every design decision, *what is the player thinking about before they press?* If the answer is "nothing, they're seeing what happens," the thing is a demonstration. But deliberation is not the only way: timing, perception, pattern recognition, experimentation and acquired skill are also meaningful action, provided consequences follow from what the player does and the player can get better at it. Demonstrations have their place inside a game (an opening, a reveal), but a game needs at least one stretch where the player's actions matter and they know it.

Three formats, each with its own kind of deliberation; a paper usually suits one:

- **Challenge.** An objective under constraints: reach a target, hold a position, allocate a budget. The player plans. Suits models with a controllable parameter and a clear optimum or trade-off.
- **Discovery.** Experiment and learn to predict: the player probes a hidden system, forms a conjecture, tests it, and is finally asked to predict. Suits empirical papers, mechanisms, identification. The score, if any, is prediction accuracy at the end, not points for probing.
- **Strategic.** Respond to agents or an evolving system that reacts to the player: rivals, a population, a market. The player anticipates. Suits game theory, evolution, competition.

Fun has four sources; a concept should have at least two, and know which:

1. **Anticipation** — a choice is made and the player waits to see. Suspense between action and outcome.
2. **Agency** — the outcome follows from the choice in a way the player can feel and learn. If two settings give the same picture, there is no agency there.
3. **Discovery** — the moment something becomes clear: a surprise, a mechanism seen working, a pattern recognised, a trade-off felt.
4. **Mastery** — the second attempt goes better than the first, visibly, for a reason the player understands.

Replayability is real only if a second playthrough offers something new: a different strategy, a different conjecture to test, a different regime of the model. Cosmetic variation (a new random seed with the same lesson) is not replayability and should not be claimed as such.

---

## 3. Principles

### The discovery is the plot

Every game built here lets the player find something out that the paper found out. Papers offer discoveries of different kinds, and the kind shapes the game:

- **A counterintuitive result** — the field or the public believed X, the paper shows Y. The game lets the player act on X and meet Y. The strongest plot when available; not every paper has one, and the skill does not invent one.
- **A mechanism made intelligible** — the paper explains *how* something works. The game lets the player operate the mechanism and see the parts move.
- **Emergence** — simple rules at the micro level produce a pattern at the macro level. The game lets the player set the rules and watch the pattern form.
- **Identification** — the paper shows how a causal effect can be told apart from a confound. The game lets the player feel why the naive comparison misleads and what the design fixes.
- **A trade-off** — the paper maps what must be given up for what. The game puts the player on the frontier.

Name the kind in the memo. If the paper offers none of these, say so: the game will be thin, and the engine looks harder at the results before settling for a forecaster's reveal.

### Conjecture before seeing

The player commits before the outcome is shown: a prediction, a setting, a sorting, a bet. That commitment is what makes the outcome mean something. It does *not* follow that the player must be wrong. An intuition that turns out right is rewarding; an intuition that turns out wrong is instructive; both work if the commitment was real. Never engineer an unfair failure to manufacture a twist — the sensible choice should fail only where the paper says it fails.

### Fun first, mechanism honest

The mechanism — what turns the player's actions into outcomes — is ported from the paper's model, synthesised from its estimates, or constructed to illustrate its argument, and it never claims more than its fidelity level allows (section 5). But the *presentation* may simplify without limit: fewer agents, bigger ones, a compressed clock, exaggerated parameters, a stylised payoff, one regime instead of twelve. When the only fully faithful game would be dull, the engine picks the playable concept, keeps the mechanism honest where it is used, and declares what was dropped. The author can put it back.

### Minimal controls, simple loop

Use the fewest controls that preserve the paper's central mechanism. One is the default. Two or more are right when their *interaction* is the finding — severity and probability of punishment, price and quality, effort and luck — and wrong when they merely add realism. Whatever the number, the loop stays simple: act → mechanism → visible result → where you stand.

The engine decides the shape: one long round or many short; how many screens; presets or none; whether there is a score at all. A challenge game has a target and a distance from it; a discovery game may have no score until the final prediction; a strategic game has an outcome against the rivals. What every format has is an **aim** the player can repeat and a **verdict** at the end.

### The aim is a sentence; the yardstick is in its units

Before any concept is chosen, write the aim in the words the player will read. It sits on its own line on the start screen, at the top of the play screen, and as the first line of How to play.

Whatever tells the player how they are doing is measured in the aim's units, for the stretch of play the aim refers to. If the aim is per round, the measure is per round, and meeting it reads as complete success at that moment. Never a running point total whose maximum lies in rounds not yet played; never a number the player has to look up the maximum of. A player who has just done what was asked must not see a low number.

No bookkeeping mechanics: no fixed number of attempts that rewards repeating a correct answer, no points for re-testing.

### Pictures explain; motion is the feedback; fewer, bigger things

Every picture answers a question the player has at that moment: what is this? did it work? which way? If a picture needs its caption, simplify the picture. Motion is not ornament: the thing that moves *is* the feedback. On a phone, a few large things beat a crowd of small ones.

A picture can be beautiful and illegible, and a generated scene can pass every statistical check and still look like noise. Mechanism fidelity and visual legibility are separate checks; every screen is looked at by the builder at phone width with the question "what would a stranger see here?"

### Orientation before acting; explanation after the discovery

The player never reads a paragraph before they may act, but every screen carries the one or two sentences a stranger needs to act on it: what the things on screen are, what the choice means, roughly what a good answer looks like. Every word on a button is defined on that screen before the first press. A measure is named before the player sees it move. Where two extremes exist, show them side by side before the first choice.

Explanation — why the paper's answer is what it is — comes after the discovery, not before.

A **How to play** page explains the whole game in plain language: the setting, the aim, what each screen asks, what the yardstick means, what the game is trying to show. Reachable from a prominent button on the start screen and from a small ? on every play screen; returning lands the player where they were. Button labels say what happens, not a metaphor.

### Personification sits on the mechanism

A neuron, a molecule, a voxel, an institution may be the agent the player plays — one of the best moves available — but only if its "choice" maps onto a real variable in the paper and its payoff onto a real quantity. Where the paper supplies no payoff, the memo and the About screen say the payoff is ours.

---

## 4. Reading the paper

Read all of it: text, tables, figure captions (captions often state the mechanism more plainly than the text), supplementary material if attached. If code or data are attached, the mechanism is ported from the code and calibrated from the data. If only the PDF is available, say so; numbers read off a figure are marked as such.

Then answer, in writing:

**What does the paper hand over?** A **model** (equations, a simulation, a game-theoretic structure — ported); an **estimate** (data, coefficients, distributions, an experimental result — synthesised into a data-generating process that reproduces the reported numbers); an **argument** (a verbal mechanism, a conceptual claim — formalised into an explicit toy model, with the places where the formalisation chose something the paper did not, listed). Often one primary and one secondary.

**What did it discover, and of which kind?** From the list in section 3.

**What could a player control, and what could they predict?** Candidates for the controls (a choice an agent makes, a parameter, a measurement, a bet) and for the conjectures (what the player could be asked to predict before seeing).

**Where is the moment?** The point in play when the discovery lands: "the player does X, sees Y, and realises Z." If it cannot be written as a moment, the concept is not ready.

**What is the story, for an eight-year-old?** Before any concept is chosen, write the game's core narrative as one short paragraph a child of eight could follow: who wants what, what is in the way, what happens that nobody expected. No field words. This is a test of the narrative, not of the game's difficulty — the story is for a child, the play may be as hard as the paper demands — and it must not push the game toward cute characters: the one who wants something may be a cell, a country, a molecule, or the player. If the paragraph cannot be written, the game has a mechanism and no plot; if it can, every screen serves that paragraph, and it is the first thing checked when a screen feels confusing.

---

## 5. Fidelity levels and claim boundaries

Every game declares its fidelity level, and the About screen states three things in plain words: what the game **demonstrates**, what it **assumes**, and what the paper itself **establishes**. The three are not the same, and conflating them is the most serious failure this skill can produce.

- **Structural.** The game runs the paper's own model or algorithm. It demonstrates the model's behaviour; it assumes the paper's functional forms and whatever parameters were chosen for play; the paper establishes the theorems or simulation results, not that the world is like the model.
- **Statistical.** The game runs a constructed data-generating process that reproduces the paper's reported patterns — distributions, correlations, effect sizes. It demonstrates those patterns; it assumes everything the construction had to invent (the shape of the joint distribution, the individual-level process behind an average); the paper establishes the reported estimates and nothing finer.
- **Illustrative.** The game runs a toy model built to illustrate the paper's argument. It demonstrates that the argument *can* work as described; it assumes the toy model; the paper establishes the argument's claims only to the extent it does, which the memo states.

Two traps, named because synthesised mechanisms fall into them easily:

- **Correlation is not causation.** A paper that reports a correlation does not license a game in which the player moves one variable and the other responds. If the player must have a lever, the game is illustrative and says so, or the lever is a selection the player makes (an experimenter choosing what to measure), not an intervention.
- **An average effect is not an individual response.** A treatment effect of 0.3 does not mean each person responds by 0.3. A game that shows individuals responding must draw them from a distribution the paper constrains, and the About screen must say that individual responses are constructed.

The declared level also bounds the writing inside the game: a structural game may say "in this model"; a statistical game may say "in the data"; an illustrative game says "if the argument is right."

**Robustness of the discovery.** Many data-generating processes reproduce the same reported estimates and imply different counterfactuals; an average treatment effect does not say which subgroup to treat, and a subgroup-optimal strategy generated from invented heterogeneity is not a finding of the paper. So, whenever the game's central discovery depends on an assumption the paper does not identify, the fidelity plan includes a robustness check: re-run the mechanism under one or two plausible alternative assumptions and see whether the discovery survives. If it does, say so in the memo. If it does not, either redesign the game so the discovery rests on what the paper identifies, or make the illustrative status explicit *in the gameplay itself* — the player is told, at the moment of discovery, that this is how it works under the game's assumption, not a result of the paper — not only in the About screen.

---

## 6. Finding the game

### Player positions

- **Agent** — a role inside the model; the control is a choice. Human or not (see personification).
- **Controller** — sets conditions on a system and aims at a target.
- **Experimenter** — probes a hidden truth with noisy instruments and must infer or predict. Often the paper's own method replayed; for identification papers, the player feels why the naive comparison misleads.
- **Subject** — the thing being studied: a participant, a perceiving brain, an organism under selection.
- **Forecaster** — bets on what the system will do; the finding is the reveal. The fallback; thin but never impossible.
- **Dilemma** — for conceptual or normative papers: the player walks through the situations the paper describes, chooses, and sees the point unfold.

### Concepts, scaled to the paper

When the playable experience is obvious — the paper hands over a model with one natural control and one natural discovery — one concept and its walkthrough suffice, and the memo says why alternatives were not needed. When it is not obvious, generate three concepts at different player positions, at least one casting something non-obvious as the agent, and write the walkthrough for the two strongest. Each concept names: position, format (challenge / discovery / strategic), controls, what the player is thinking about before they act, what they see after, the moment of discovery, the sources of fun it has, and what a second playthrough offers.

### The first five minutes

For the picked concept always, and for the runner-up when there is one: the stranger's experience in the present tense, minute by minute — what they see, what they are wondering, what they want to press, what they are weighing before they press it, what happens, where they grin, where they frown. This is the test that kills a concept on paper rather than after a build. If the walkthrough reaches a line like "and I don't know what I'm supposed to feel" or "I press it to see what happens," the concept has a demonstration where it needs a game. If the walkthrough cannot be written, there is no game there.

### The pick

Which concept gives the stranger the best five minutes, with real deliberation in them and the discovery landing inside them. Originality breaks ties. Fidelity is a constraint through section 5, not a criterion: a structural concept with a dull walkthrough loses to an illustrative one that declares itself. Record the runner-up and what would make you switch.

### The shape

One long round or several short; how many screens; presets or none; score or none. Presets are the paper's own regimes — baseline, comparative statics, the counterintuitive corner, subgroups, experimental conditions — never invented. Order them for the player, not as the paper orders them: the discovery should arrive early, not after rounds that merely confirm what the player already believed. Session length: five to eight minutes is the default target, not a minimum. Some discoveries land best in ninety seconds and should be left that short; a short, memorable game is never padded with repetitive decisions to reach a duration. Longer only if the walkthrough shows the player wanting more.

---

## 7. The design memo

Written in full and shown to the user before the build, as a record, not a question; the build follows immediately. Stop only if the user interrupts. Length scales with the paper's difficulty; an obvious game gets a short memo. Sections:

1. **Paper** — citation, DOI, what was available.
2. **What the paper hands over** — model / estimate / argument, primary and secondary.
3. **The discovery, and its kind.**
4. **The story for an eight-year-old** — one paragraph.
5. **Fidelity level and claim boundaries** — structural / statistical / illustrative; demonstrates, assumes, establishes.
6. **The aim and the verdict** — the aim as the sentence the player will read; the verdict as the lines the end screen leads with (what you did; what the paper says; what that means).
7. **Concepts** — one or three, as scaled above, each with format, controls, deliberation, discovery moment, sources of fun, replayability.
8. **The first five minutes** for the pick (and the runner-up, if any).
9. **The pick, and why**; runner-up and switch condition.
10. **The shape** — rounds, screens, presets and their sources, order and reason, score or none.
11. **Controls, mechanism, feedback, moment** — named concretely for the pick.
12. **What is cut.**
13. **Divergences** — clock, parameters, payoffs, presentation; each with its reason.
14. **Visual world** — one line from the paper's own imagery; three or four rules; the legibility rule: what the player looks at on the play screen, how big, how many, what question each picture answers.
15. **Fidelity plan** — what the headless check will verify at the declared level.
16. **Fidelity result and build log** — appended after the build.

---

## 8. The build

In this order; do not skip to the skin.

1. **Mechanism, headless.** Plain functions, no DOM. Every chosen number in one `CONFIG` block at the top, each line tagged with its origin (`// Table 4, median`, `// eq. 7`, `// read off Fig. 2b`, `// our choice: clock compression`). Run the fidelity plan in Node or Python; record the result. If it fails, fix the mechanism or revise the memo; never build on a mechanism that misstates the paper at its declared level.

2. **Loop on placeholder graphics.** The play loop with boxes and numbers. Play it headlessly with a script that prints, after each action, what changed and where the player now stands. Read the printout as the stranger: did something visible change, did it say whether the action worked, was there a reason to think before it? Fix the loop before any skin exists.

3. **Skin.** Apply the visual world. Screenshot every screen at phone width (≈380 px) and look at each with the question "what would a stranger see here?" Simplify pictures that need their captions; make small things fewer and bigger.

4. **Text.** Aim on the start screen, its own line. Orientation on every screen. Button words defined where they appear. How to play. Per-round verdict where rounds exist; the final verdict first on the end screen, large, before any table. About screen with the memo lightly edited, the fidelity level, and the three claim-boundary lines. Attribution: title, authors, journal, year, DOI, and "Game built from this paper; the paper is the authority where the two disagree."

5. **Self-review from screenshots.** Two questions the builder answers honestly from the screenshots alone: can the aim be stated in one sentence after reading only the start screen? can the discovery be stated after reading only the top of the end screen? This is the builder's review, not stranger testing; real stranger testing is the user's to do, and the author-note says so.

6. **Full session.** One complete session headlessly with a plausible strategy, screenshots along the way; no errors, no horizontal scroll at 380 px, within the target length, the discovery reachable.

Hard constraints throughout: one self-contained HTML file; no external dependencies, no CDN, no fonts fetched; touch targets, no hover-only interaction; the player never reads a paragraph before acting; something visible happens on every action.

---

## 9. Feedback devices that work on a phone

Pick one or two; do not stack.

- **The fill** — a panel, jar, bar or grid of large cells fills as the choice takes effect. Shares, budgets, allocations.
- **The drop** — each decision drops a marker onto a ruler or histogram, coloured by what the player said; a pattern accumulates. Sorting, judgement, estimation.
- **The reveal** — the screen the player acted on is redrawn with the hidden layer on. Inference; the natural home of discovery.
- **The before/after** — two states side by side or on a slider: what the player set, what the paper's answer gives.
- **The race** — two or three large figures or bars whose relative size follows the player's choice. Competition, selection, treated against control.
- **The counter** — one number counting up or down after each action, in the aim's units.
- **The bet and the card** — the player commits to a prediction, then the card turns. The forecaster's device, and a good opening for any format.
- **The trajectory** — one line drawn over the rounds, with the paper's line appearing at the end.
- **The prediction round** — after exploring, the player is asked to predict a new case; accuracy is the yardstick. The natural close of a discovery game.

Anti-patterns: a running point total; a grid of tiny sprites; a dashboard of moving numbers; a metaphor on a button; a measure that moves before it is named; a picture that is beautiful and answers no question; a slider the player moves "to see what happens" with nothing at stake.

---

## 10. Writing inside the game

Plain, concrete, numbers where they help. Match the substance of the paper; never quote it. Field terms only where the player must use them to act, defined in the same sentence. Greek letters stay in the paper. Explanation after discovery. Claims bounded by the declared fidelity level ("in this model", "in the data", "if the argument is right").

---

## 11. Deliverables and repository

- `<slug>/<name>.html` — the game.
- `<slug>/memo.md` — with fidelity result and build log appended.
- `<slug>/author-note.md` — three lines: what to look at first; where the config block is; what we were least sure about. Plus one line saying the game has had the builder's review only.
- `<slug>/mechanism.js` (or `.py`), the fidelity check, its result, and the screenshots.
- The PDF moved from `inbox/` into the folder if it was there.
- A row in the README's games table with the play link `https://steffenhuck.github.io/paper-to-game/<slug>/<name>.html` and the memo link.

Commit. Push to `main` directly if the environment allows; otherwise push a branch and open a pull request — the repository merges pull requests from `claude/…` branches automatically. Never leave the work unpushed. The reply ends with the play link and the folder link.

---

## 12. Testing the skill itself

The skill is judged on a heterogeneous set, not on one paper: a theoretical model, a randomised experiment, a descriptive empirical study, a biological mechanism, a mathematical result, a conceptual argument. The question is whether players *do different things* across the six, not whether the games look different. Pay particular attention to failures: a technically flawless, scientifically honest, boring game teaches more about the skill's limits than another success. If the six converge on one structure — an opening challenge, a twist, a retry, a verdict — the skill is prescribing a formula and section 3 needs loosening, not tightening.

---

## 13. Failure modes

- A demonstration shipped as a game: actions without consequences the player can learn, a slider moved to see what happens.
- A central discovery resting on an invented assumption, unchecked against alternatives.
- A short game padded to a target length.
- A reversal forced onto a paper that offers a different kind of discovery.
- An unfair failure engineered to manufacture a twist.
- A fidelity level undeclared, or a correlation played as a cause, or an average effect played as an individual response.
- A concept that could not survive a written walkthrough, built anyway.
- A game whose story could not be told to an eight-year-old.
- The discovery arriving late because presets follow the paper's order instead of the player's.
- A yardstick in different units from the aim, so that success reads as failure.
- Pictures that pass the statistics and fail the eye.
- A term on a button never defined; a measure moved before it was named; a metaphor where a verb was needed.
- Explaining before the discovery; or leaving the player unable to act because nothing was oriented.
- Replayability claimed for a new random seed.
- Builder's screenshot review reported as stranger testing.
- Any number outside the config block, or inside it without its origin.
- Work finished and not pushed.
