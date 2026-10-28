---
name: "paper-to-game"
description: "Turn a scientific paper (any field) into a playable single-file HTML browser game that gives a stranger a good few minutes and leaves them with the paper's central claim. Trigger when the user attaches or links a paper and asks for a game, a playable version, or invokes /paper-to-game. Writes a design memo, builds the game, checks it, commits it. Not for Steffen's own house-style teaching games (those are built by hand in their own threads)."
---

# Paper to Game

## 0. What this is for

Someone sends a paper. They get back a game: one HTML file, playable on a phone, built from the paper's own mechanism, with every number tagged to its source so the author can tweak it. The game is a beta; the author finishes it.

The test of a good result is not whether the game is faithful. It is whether a smart stranger, handed the link on a phone, plays for five to eight minutes without being told to, understands what they are doing the whole time, is surprised somewhere in the middle, and could afterwards say in one sentence what the paper found. Fidelity is the second-order constraint: the mechanism must not lie about the paper. Everything else — how much of the paper appears, how the mechanism is dressed, how many rounds, how many screens — is decided by what makes those minutes good.

---

## 1. The player, and what a good few minutes feel like

The player is a smart person from outside the field, on a phone, who did not ask for homework. They tapped a link because someone they like sent it. They will give it thirty seconds before deciding whether to give it five minutes. They read nothing longer than two lines before they are allowed to do something. They do not know the field's words and will not look them up. They can follow a number if told what it measures. They enjoy being wrong when the game is kind about it.

What they are hoping for, in order:

- **Something to do right away**, with an obvious thing to press and an obvious thing that happens.
- **A reason to care** that fits in a sentence: an aim they can repeat.
- **Feedback they can see** — the thing on screen changes because of what they did, and the change says whether they are getting closer.
- **A surprise** about a third of the way in: what they assumed was wrong, and the game shows them so with their own hands.
- **A sense of getting better**, and a moment where they get it.
- **A verdict**: how they did, what the paper says, the gap between the two, in three lines.

What they are not hoping for: decoration, a tutorial, a dashboard, points, a table, the paper's abstract, anything in Greek.

Fun, in these games, has four sources, and a concept that lacks all four is not a game yet:

1. **Anticipation.** The player makes a choice and *waits to see* — a panel fills, a rival arrives, a hidden layer lights up. Suspense between lever and outcome.
2. **Agency.** The outcome follows from the choice in a way the player can feel and learn. If two different settings produce the same picture, there is no agency.
3. **Surprise.** The reversal. The player did the sensible thing and it was wrong, and the game shows why.
4. **Mastery.** The second attempt goes better than the first, visibly, for a reason the player understands.

---

## 2. Principles

Each principle comes with its reason.

### The reversal is the twist

Every paper worth a game overturns something the field, or the public, believed. That reversal is the game's plot: the player should start out believing the old thing, act on it, and be shown. If the paper has two reversals, the game may have two acts. If it has none, say so in the memo: the game will be thin, and the engine should look harder for the surprising corner of the results before settling.

Open on the reversal, or one step before it: order the rounds so that the player meets the overturned belief early, not after rounds in which the old belief happens to be right.

### Fun first, mechanism honest

The mechanism — what turns the player's lever into outcomes — is ported from the paper's model, synthesised from its estimates, or formalised from its argument, and it never says something the paper does not. But the *presentation* may simplify without limit: fewer agents, bigger ones, a compressed clock, exaggerated parameters, a stylised payoff, one regime instead of twelve. When the only faithful game would be a dull one, the engine picks the fun concept, keeps the mechanism honest where it is used, and declares in the memo and the About screen what was dropped. The author can put it back.

### One lever, one loop; the engine decides the shape

The player moves one thing. The game has one loop: lever → mechanism → feedback → score. What the engine decides, per paper: whether the loop runs once over a long arc or many times in short rounds; how many screens; whether there are presets. A model with regimes wants several short rounds; an argument with a single build-up may want one long round of twelve screens; an experiment may want twenty trials. There is no required round structure. There is a required aim, a required visible yardstick, and a required verdict (next principle).

### The aim is a sentence; the score is its yardstick

Before any concept is chosen, write the aim in the words the player will read. It appears on its own line on the start screen, at the top of the play screen, and as the first line of How to play.

The score is the aim measured, in the aim's units, for the stretch of play the aim refers to. If the aim is per round, the score is per round, and a round in which the aim is met reads as complete success at that moment. Never a running point total whose maximum lies in rounds not yet played.

Score the round as the round, in its own units ("held off: 11 of 11"); keep any cross-round tally in the same units ("rounds held: 1 of 5"), smaller and separate. A player who has just done exactly what the aim asked must never see a low number.

No bookkeeping mechanics: no fixed number of attempts that rewards repeating a correct answer, no points for re-testing, no maximum the player learns only from the help page.

### Pictures explain; motion is the feedback; fewer, bigger things

Every picture on screen answers one question the player has at that moment: what is this? did it work? which way? If a picture needs its caption to be understood, simplify the picture. Motion is not ornament: the thing that moves *is* the feedback — the panel filling, the bar growing, the marker dropping onto the ruler, the lights coming on. On a phone, a few large figures beat a crowd of small ones; one bar beats a tableau.

A picture can be beautiful and illegible, and a generated scene can pass every statistical check and still look like noise on a phone. Mechanism fidelity and visual legibility are separate checks; every picture must be *looked at* by the builder, at phone width, with the question "what would a stranger see here?"

### Orientation before acting; explanation after the surprise

The player never reads a paragraph before they may act. But every screen carries the one or two sentences a stranger needs to act on it: what the things on screen are, what the choice means, roughly what a good answer looks like (a number, a range). Every word on a button is defined on that screen, in plain words, before the first press. A measure is named in one line before the player sees it move. Where two extremes exist, show them side by side before the first choice.

Explanation — why the paper's answer is what it is — comes *after* the surprise, never before. Orientation is not explanation; give the first, withhold the second.

A **How to play** page explains the whole game in plain language: the setting, the aim, what each screen asks, what the score means, what the game is trying to show. Reachable from a prominent button on the start screen and from a small ? on every play screen; returning lands the player where they were.

Button labels say what happens, not a metaphor.

### The player must have been wrong first

A game that only shows the result is a figure with a scroll bar. The player acts on the old belief, sees it fail, and is then handed the paper's answer. Design the first choice so that the sensible, textbook answer is the one the paper overturns.

### Personification sits on the mechanism

A neuron, a molecule, a voxel, an institution may be the agent the player plays — this is one of the best moves available, with a long tradition — but only if its "choice" maps onto a real variable in the paper and its payoff onto a real quantity. Where the paper supplies no payoff, the memo says the payoff is ours, and the About screen says so too.

---

## 3. Reading the paper

Read all of it: text, tables, figure captions (captions often state the mechanism more plainly than the text), supplementary material if attached. If code or data are attached, the mechanism is ported from the code and calibrated from the data. If only the PDF is available, say so in the memo; numbers read off a figure are marked as read off a figure.

Then answer four questions in writing, in this order.

**What does the paper hand over?** One of three materials, often with a secondary one:

- **Model** — equations, a simulation, a game-theoretic structure. The mechanism is *ported*.
- **Estimate** — data, coefficients, distributions, correlations, a PCA, an experimental result. The mechanism is *synthesised*: a data-generating process that reproduces the paper's reported numbers.
- **Argument** — a verbal mechanism, a conceptual claim, a qualitative story. The mechanism is *formalised*: the implicit toy model made explicit, with the two or three places where the formalisation chose something the paper did not, listed.

**What does it overturn?** The reversal(s): what was believed before, what the paper says instead. The thing a naive player gets wrong in the first minutes and understands by the end.

**Where is the lever?** Something a player could hold: a choice an agent in the model makes; a parameter of a system; a measurement; a bet. And what the paper claims happens when it moves.

**Where is the surprise, exactly?** The moment, in play, when the reversal lands. If it cannot be located as a moment — "the player presses X and sees Y and realises Z" — the concept is not ready.

---

## 4. Finding the game

### Player positions

- **Agent** — the player is a role inside the model; the lever is a choice. Human or not (see the personification principle).
- **Controller** — the player sets conditions on a system and tries to hit a target: reaction conditions, dosing, design parameters, policy, a population's temperament.
- **Experimenter** — the player probes a hidden truth with noisy instruments and must infer it. Often the paper's own method, replayed. For causal papers: the player feels why the naive comparison lies and what the identification fixes.
- **Subject** — the player is the thing being studied: a participant, a perceiving brain, an organism under selection.
- **Forecaster** — the player bets on what the system will do; the finding is the reveal. The fallback when nothing can be manipulated. Thin, never impossible.
- **Dilemma** — for conceptual or normative papers that resist even a toy model: the player walks through the situations the paper describes, chooses, and sees the point unfold. A scripted argument with branches.

### Three concepts, then the first five minutes

Generate three concepts placing the player at different positions. At least one casts something non-obvious as the agent. Each gets: position, lever, what the player sees after moving it, the moment of surprise, and the four sources of fun it has or lacks (anticipation, agency, surprise, mastery).

Then, for the two strongest, write **the first five minutes** — the stranger's experience in the present tense, minute by minute: what they see, what they are wondering, what they want to press, what happens when they press it, where they grin, where they frown. This is the test that kills a concept on paper rather than after a build. If the walkthrough reaches a moment where the honest line is "and I don't know what I'm supposed to feel", the concept has failed. If it cannot be written at all, there is no game there.

### The pick

The criterion is the walkthrough: **which concept gives the stranger the best five minutes, with the reversal landing inside them.** Originality is the tie-breaker. Fidelity is not a criterion beyond honesty: a faithful concept with a dull walkthrough loses to a bolder one that declares its divergences. Record the runner-up and what would make you switch, so a second pass can build it without redesign.

### The shape

Having picked, decide the shape and say why: one long round or several short; how many screens; whether presets exist and what they are. Presets are the paper's own regimes — its baseline, comparative statics, counterintuitive corner, subgroups, experimental conditions — never invented. Order them so that the reversal arrives early: open on it or one step before it, not on the case where the old belief holds.

Session length: five to eight minutes for a stranger. Longer only if the walkthrough shows the player wanting more.

---

## 5. The design memo

Written in full and shown to the user before the build starts, as a record, not a question; the build follows immediately. Stop only if the user interrupts. Sections, in order:

1. **Paper** — citation, DOI, what was available (PDF only, code, data).
2. **What the paper hands over** — material, primary and secondary; for an argument, the formalisation's choices.
3. **The reversal(s).**
4. **The aim and the verdict** — the aim as one sentence the player will read; the verdict as the three lines the end screen will lead with (what you did, with its number; what the paper says, with its number; the gap, in words).
5. **Three concepts**, each with position, lever, feedback, surprise, sources of fun.
6. **The first five minutes** for the two strongest concepts.
7. **The pick, and why**; the runner-up and the switch condition.
8. **The shape** — rounds, screens, presets with their sources, the order and the reason for it.
9. **The lever, the mechanism, the feedback, the surprise** — the four invariants, named concretely for the picked concept.
10. **What is cut** — everything in the paper the game leaves out, so the author sees it was a decision.
11. **Divergences** — clock compression, exaggerated parameters, stylised payoffs, simplified presentation; each named with the reason, and the mechanism's honesty asserted or qualified.
12. **Visual world** — one line naming the world drawn from the paper's own imagery (a microscope field, a trading floor, a weather map, a catalogue page), then three or four visual rules; then the **legibility rule** for this game: what the player will be looking at on the play screen, how big, how many, and what question each picture answers. No house style: each game looks like its paper.
13. **Fidelity plan** — what the headless check will verify (model: the key figure reproduced qualitatively; estimate: the reported table recovered, signs and rough magnitudes; argument: the toy model produces the claimed outcomes, assumptions listed).
14. **Fidelity result and build log** — appended after the build: the numbers, and what took more than one pass.

---

## 6. The build

In this order; do not skip to the skin.

1. **Mechanism, headless.** Plain functions, no DOM. Every number the engine chose in one `CONFIG` block at the top, each line tagged with its origin (`// Table 4, viral-labeled median`, `// eq. 7`, `// read off Fig. 2b`, `// our choice: game-clock compression`). Run the fidelity plan in Node or Python; record the result. If the check fails, fix the mechanism or revise the memo; never build on a mechanism that is wrong about the paper.

2. **Loop on placeholder graphics.** Build the play loop with boxes and numbers, no styling. Then play it headlessly: a script that takes the player's actions and prints, after each one, what changed on screen and what the score now says. Read the printout as the stranger: after every action, did something visible change, and did it tell them whether they were closer to the aim? If any action produces no visible change, or a change the player could not interpret, fix the loop before any skin exists.

3. **Skin.** Apply the visual world. Then screenshot every screen at phone width (≈380 px) and look at each with one question: what would a stranger see here? Pictures that need their caption are simplified. Things too small to read are made fewer and bigger.

4. **Text.** Aim on the start screen, its own line. Orientation lines on every screen. Button words defined where they appear. Help page. Per-round verdict where rounds exist; final verdict first on the end screen, three lines, large, before any table. Attribution: title, authors, journal, year, DOI, and the sentence "Game built from this paper; the paper is the authority where the two disagree."

5. **Stranger tests.** Two, from the screenshots alone: someone who has read only the start screen can say the aim in one sentence; someone who has read only the top of the end screen can say what the paper found. If either fails, fix the text first.

6. **Full session.** Play one complete session headlessly with a plausible strategy, with screenshots; confirm no errors, no horizontal scroll at 380 px, a session within the target length, and that the surprise is reachable by the sensible-wrong strategy.

Hard constraints throughout: one self-contained HTML file, no external dependencies, no CDN, no fonts fetched; touch targets, no hover-only interactions; the player never reads a paragraph before acting; something happens on screen every time the lever moves.

---

## 7. Feedback devices that work on a phone

A short library. Pick one or two per game; do not stack.

- **The fill.** A panel, jar, bar or grid of a dozen large cells fills as the player's choice takes effect. Good for shares, budgets, allocations.
- **The drop.** Each decision drops a marker onto a ruler or histogram, coloured by what the player said, so a pattern accumulates in front of them. Good for sorting, judgement, estimation tasks.
- **The reveal.** The screen the player acted on is redrawn with the hidden layer on: lights come on, true colours appear, the structure the player guessed at is overlaid on their guess. Good for inference tasks; it is the natural home of the surprise.
- **The before/after.** Two states side by side or on a slider: what the player set, what the paper's answer would have given.
- **The race.** Two or three large figures or bars whose relative size changes with the player's choice — incumbent against challenger, treated against control. Good for invasion, competition, selection.
- **The counter.** A single number that counts up or down visibly after each action, in the aim's units.
- **The bet and the card.** The player commits to a prediction, then the card turns. The forecaster's device; also a good opening for any game before the first lever.
- **The trajectory.** One line drawn over time as the player's rounds accumulate, with the paper's line appearing at the end.

Anti-patterns: a running point total; a grid of tiny sprites; a dashboard of moving numbers; a metaphor on a button; a measure that moves before it is named; a picture that is beautiful and answers no question.

---

## 8. Writing inside the game

Plain, concrete, numbers where they help. Match the substance of the paper; never quote it. Field terms only where the player must use them to act, defined in the same sentence. Greek letters stay in the paper. Explanations arrive after the surprise. The About screen carries the memo, lightly edited for a reader, including the divergences and the runner-up concept.

---

## 9. Deliverables and repository

- `<slug>/<name>.html` — the game.
- `<slug>/memo.md` — the memo with the fidelity result and build log appended.
- `<slug>/author-note.md` — three lines for the author: what to look at first, where the config block is, what we were least sure about.
- `<slug>/mechanism.js` (or `.py`) and the fidelity check, the fidelity result, and the screenshots.
- The PDF moved from `inbox/` into the folder if it was there.
- A row in the README's games table with the play link `https://steffenhuck.github.io/paper-to-game/<slug>/<name>.html` and the memo link.

Commit. Push to `main` directly if the environment allows; if it only allows a branch, push the branch and open a pull request — the repository merges pull requests from `claude/…` branches automatically. Never leave the work unpushed. The reply ends with the play link and the folder link.

---

## 10. Failure modes

- Opening the skin before the mechanism exists: a polished page with thin content.
- A concept that could not survive a written first five minutes, built anyway.
- The reversal arriving late because the presets follow the paper's order instead of the player's needs.
- A score denominated differently from the aim, so that success reads as failure.
- Pictures that pass the statistics and fail the eye: too many, too small, a caption doing the picture's job.
- A term on a button that was never defined; a measure that moved before it was named; a metaphor where a verb was needed.
- Explaining before the surprise; or its opposite, leaving the player unable to act because nothing was oriented.
- Bookkeeping dressed as mechanics: fixed attempts, points for repetition.
- A personified agent whose payoff is not in the paper, unflagged.
- Presets the paper never discusses.
- Any number in the code outside the config block, or in it without its origin.
- Work finished and not pushed.
