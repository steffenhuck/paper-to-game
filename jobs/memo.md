# One Number, Please — design memo

## 0. Given

A gift for someone else; no recipient named. The beta line is the footer; no signature, no counter.

One instruction, which binds the design: *the game should not just mirror the experimental game. That would be too boring. It has to put the player outside the laboratory. This will require some imagination. Maybe the player could for once also be the researcher who thinks about how to design this.*

So the player is not a bidder. The player stands where the three authors stood: deciding what "competing" will mean on the subjects' screens, and finding out that the answer to "are women less competitive?" depends on that decision. This fixes the player position (experimenter) and overrides the precedent rule on that one dimension (section 6 says where).

## 1. Paper

Angelovski, A., Brandts, J. & Güth, W. (2026). Bidding for better jobs: an experiment on gender differences in competitiveness without a real-effort task. *Theory and Decision*, https://doi.org/10.1007/s11238-026-10132-9. Open access (CC BY 4.0). Available: the PDF only (35 pages, with the translated instructions, the z-Tree screenshots, the control questions, and appendix tables 4 and 5 and figures 9 to 12). No data, no code. Numbers read off figures 3, 4, 5, 8 and 10 are marked as such in the config block.

## 2. What the paper hands over

**Primary: an estimate.** 168 students in Rome, 32 periods each, bidding in sealed second- and third-price auctions for ranked positions (a top job and two middle jobs) in a flat firm (350 / 200 / 200, default 50) and a steep one (450 / 150 / 150, default 50), first inside their firm of four, then across both firms as eight. Reported: mean bids relative to the rational benchmark by position, gender and phase (Fig. 4, Table 1); who gets the top positions (Fig. 5, Table 2, Fig. 6); earnings by position and gender (Fig. 8, Table 3). Reconstructed into a data-generating process that reproduces those numbers.

**Secondary: an argument.** The introduction and the discussion: the standard way of measuring competitiveness (five minutes of sums, winner takes all, Niederle & Vesterlund 2007; Gneezy, Niederle & Rustichini 2003) loads on task skill, confidence about one's rank, performing under pressure, and risk; this design removes all of that and keeps only the willingness to give up money for rank, with the rules and prizes on the board. The gap in the first kind of measurement, and the papers it cites for what drives it (overconfidence and risk, van Veldhuizen 2022; Croson & Gneezy 2009), are the other half of the game's hidden system. The paper's own literature review is the source for the side of the contrast the paper did not run; the game says so.

## 3. The discovery, and its kind

**A counterintuitive result, with an identification point inside it.** The public and much of the field believe that experiments have shown women to be less competitive than men. Measure competitiveness as the willingness to pay for a better job rather than as entering a five-minute contest, and the difference is gone: bids do not differ significantly, women reach the top slightly *more* often, and nobody earns more for getting there. The paper's own sentence: *inferences about gender and competitiveness are sensitive to the measurement context.* The identification point: the famous gap is partly a gap in confidence and nerve, which the tournament measures and the auction does not.

## 4. The core narrative

Someone wants to know whether women compete less hard than men, and they want it as one number. You run a lab where students come to play for money, and you decide what the game on their screens will be. Make competing mean "solve more sums than the other three in five minutes, winner takes all," and the men go for it twice as often as the women. Make it mean "say how much of the job's pay you would give up to have the job," and the women go for it just as hard, reach the top a little more often, and nobody is richer for it. The number you send depends on the game you chose. There is no one number; there is a sentence.

## 5. Who lives in the paper

- **The bidder** (168 of them): controls bids for the top and the middle; anticipates the others' bids and the price. The obvious player, and the one the brief excludes: this is the experimental game, and a skin on it is a mirror.
- **The firm** (flat or steep): "controls" the salaries; a parameter, not an agent.
- **The experimenters**: control what competing means (sums or money), what the prizes are (one winner or a ladder), how steep the ladder is, how many compete, how many sessions they can afford. They anticipate what the measurement will show, and they conclude in a sentence. The brief's candidate, and the pick.
- **The literature's subject**: the student who, in Niederle & Vesterlund's lab, chose between the piece rate and the tournament. Lives in the paper's introduction; in the game, in the left-hand half of the apparatus.
- **The reader who wants one number**: the policy maker, the journalist, the dean. The paper addresses them in its discussion ("our results should be interpreted only as ..."). In the game, the person who sends the email.

## 6. Precedent

| | Position | Format | Feedback device | Chassis |
|---|---|---|---|---|
| Leavitt's Cloud | experimenter (at the plate stacks) | discovery, prediction close | the fold: tuning a beat until dots line up, then a stroke on a chart | Austere: dark room, lit glass, violet ink; Spectral and Josefin; pills |
| Jevons's Noon | controller (a nation setting a pace) | challenge, scored | a ruler, a filling sheet, a trajectory against the real curve | Instrument (Jevons's plate): cream, rule blue, soot, furnace orange; Bodoni Moda; engraver's labels |
| Julian's Window | subject / agent (Julian in bed) | discovery, no score | a strip of sixteen frames | Drawn (shōjo manga): white page, ink, one rose; Delius and Italiana; panels |

**Position** overlaps with Leavitt (experimenter) because the Given asks for it; the paper plainly wants it too, since the paper's whole point is a decision the experimenters made. So the other three dimensions move: **format** discovery, but closed by a written reply judged against the player's own notebook rather than a prediction (Leavitt) or a strip (Julian), and with a budget that makes each run a spend; **device** new to the table: *the subjects' own screen, redrawn live from the player's choices, and a lab notebook that fills one row per session*; **chassis** Retro family (none of the last three; after three light or dark paper grounds, a grey Windows 2000 dialog), the paper's own Appendix B made into the game's look.

## 7. The aim and the verdict

**Aim (one line, on the start screen, at the top of the play screen, first line of How to play):** *Find out, in eight lab sessions, whether women are less competitive than men, and write back.*

**The yardstick during play:** the notebook. One row per session: what the subjects had to do, what they could win, and the two bars that came out (men, women), with the gap in words. Sessions left, counted down. Nothing is scored.

**Verdict (the end screen leads with these, in words):**
- *What you did:* which apparatus you ran, how many times, and what each showed ("sums, one winner: men went for it about twice as often, three sessions. Price, a ladder: about the same, twice; once the women a little higher.")
- *What you wrote back:* the sentence the player chose, and whether their own notebook backs it (it can back any of the three, depending on what they ran; the game says which).
- *What the paper says:* in Rome, with 168 students and the price-and-ladder apparatus, no significant difference in bids; women a few points higher for the top of the flat firm; women got the top job more often than their share; nobody earned more up there, and the middle paid better than the top. The authors' own sentence: neither way of measuring is superior; they measure different things.

No tally. The two bars of a session the player never ran are shown greyed, as a thing not measured.

## 8. Three concepts

**A. The Control Room** (experimenter; discovery with a budget; pick). The player has a grant for eight sessions of 24 students. Before each, they set two things on the subjects' screen: what competing means (*solve sums for five minutes* or *name a price for the job*) and what the prizes are (*one winner: 350, the rest 50*; *a flat ladder: 350 / 200 / 200 / 50*; *a steep ladder: 450 / 150 / 150 / 50*). The subjects' dialog box redraws as they choose. They press *Run session*; 24 students file into cubicles; the session plays in a few seconds; the result dialog returns two bars (how hard the men went for the top, how hard the women did), a line on who got the top jobs, a line on earnings, and a line in the game's voice on what the apparatus just measured. A row goes in the notebook. After eight, the player writes back: one of three sentences. *Deliberation:* which apparatus will answer the question; whether to change one thing or two; whether to spend a session repeating a result that might be noise. *Discovery:* the gap lives in the left column of the notebook, not in the right. *Fun:* anticipation (the run), agency (I chose what to measure), discovery, mastery (second play: change one thing at a time, repeat before believing). *Replay:* run the cells you skipped; test whether a one-session "women more competitive" survives a repeat; try to get all three sentences backed.

**B. The Ministry** (controller; challenge). The player is the minister choosing how a civil service promotes: a five-minute exam contest with one winner, or a ladder of posts where you invest (train, do overtime, network) to move up; the aim is a civil service where the top is as mixed as the entry and nobody is paid for a post more than it is worth. *Deliberation:* which regime, how steep. *Discovery:* the ladder changes who gets to the top without changing what anyone takes home. *Why not:* the paper itself says its results "have nothing to say about" demand-side obstacles and are a stylised lab perspective; a policy simulator would claim what the authors explicitly refuse to claim, and the author test fails.

**C. The Screen Builder** (experimenter; reckless). No words from the game on the play screen at all: a z-Tree-style dialog editor where the player drags parts onto the subjects' screen (a clock, a sums box, a bid field, prize boxes, a "you are ranked" line) and presses *Procedi*; the only feedback is the pair of bars. The player infers from the parts what each one measures. *Reckless because:* a wordless editor may be illegible on a phone, and the channel each part switches on (confidence, risk, pressure) is exactly what the stranger does not know. *Kept in A:* the subjects' screen built live from the player's choices, as the preview of every decision. *Given up:* the silence, and the drag.

## 9. The first five minutes

**A, the pick.** 0:00. A grey window on a grey desktop, navy title bar: *One Number, Please*. Under it an email in a white box: "Are women less competitive than men? I need one number by Friday." Then the aim, and a bevelled button, *Open the lab*. They press it.

0:15. A window titled *Session 1 of 8*. Two group boxes with radio buttons, like a questionnaire. *To compete, the students must:* (•) solve as many sums as they can in five minutes, ( ) name a price for the job. *What they win:* ( ) one winner takes 350, the others 50 ... Nothing is selected. Below, a second window, *What the students will see*, blank. They tap *solve sums*: the lower window fills in: "You have 5 minutes. Solve as many sums as you can." They tap *one winner*: "If you solve more than the other three: 350 ECU. Otherwise: 50." They wonder what the other options would say and tap *a ladder*; the dialog changes to three rungs. They go back to *one winner*, because that is what a competition is. *Run session (24 students, €300)*.

0:50. The lab: 24 small heads file into six grey cubicle rows, screens flicker, a clock runs five minutes in three seconds, the cubicles empty. A result window: two bars, navy and red: *Men: 9 of 12 chose the contest. Women: 4 of 12.* "Men went for it about twice as often." Under it: *Top jobs: 5 of 6 went to men. Earnings: about the same.* And: "To go for it, a student had to believe they would beat three others at sums, and accept a one-in-four shot at 350 against a sure 125. The bar measures confidence and nerve as much as wanting the top." They grin: there is the number. *Write it in the notebook.* The notebook shows row 1.

1:30. Session 2. Everything is unselected again. They think: is it the sums, or the prize? They pick *name a price* and *one winner*. The subjects' screen now reads: "Enter the most you would pay to have the job worth 350. The highest bidder gets it and pays the second-highest bid." Run. Bars: *Men bid 86 of every 100 the job is worth. Women bid 89.* "About the same." Frown. *Top jobs: 3 of 6 to women.* "Nothing to perform, nothing to guess: just how much of the job's worth they would give up to have it. A price for rank measures only wanting the top."

2:15. Session 3. They pick *sums* and *a flat ladder*. The gap is still there, hardly smaller: changing the prizes did not do it. 3:00. Session 4: *price* and *flat ladder* (the paper's own). Women a little higher; under the bars, a greyed line: *Rome, 2026: about the same; women a few points higher for the top of the flat firm.* 3:40. Session 5: they repeat session 4 to see if the women-higher holds. This time about the same. They notice the notebook: the left column has gaps whatever the prizes, the right column does not. 4:30. Sessions 6 to 8: steep ladder with sums; steep ladder with price; one more classic to be sure. Then *Write back*: three sentences. They choose the third. The verdict: their notebook, the greyed cells, the Rome result, the authors' sentence.

**C, the runner-up.** 0:00 the same email. 0:15 a dialog editor: a palette of parts on the left (a clock, a sums box, a bid field, three prize boxes, one prize box, a "the others are: ..." line); the subjects' blank screen on the right. They drag the clock and the sums box on; the *Procedi* button lights. They press; bars appear: 9 of 12, 4 of 12. They do not know yet what those bars count. They drag the clock off and the bid field on. Bars: 86, 89. They are intrigued but cannot say what changed in the measuring, and the parts have no names. The walkthrough stalls at "I don't know what I'm supposed to feel" by the third run. Not built; its live-redrawn subjects' screen is kept.

## 10. The pick, and why

**A, The Control Room.** It is the game the brief asked for, and it is the paper: the three authors' decision made into the player's control, with the paper's own data on one side of the switch and the paper's own summary of the literature on the other. The stranger has real deliberation (what to change, what to repeat, how to spend the last session), the discovery lands in the notebook by the fourth session, and the sentence afterwards has no "guess": *I ran the sums contest and the men went for it twice as often; I made them name a price instead and the women went just as hard and got the top job more often; the gap was in my apparatus.* Originality: no game in the table has handed the player the experimental design itself, or made the subjects' screen the preview of the control.

**Author test.** Brandts and Güth know the result; what they will enjoy is being handed the design choice as a switch, seeing their own z-Tree dialog redraw, and watching a stranger discover why the real-effort literature and theirs disagree. The game's left-hand side is their introduction animated; the right-hand side is their Table 1 and Figures 5 and 8.

**Runner-up: C, The Screen Builder.** Switch if the author wants a wordless ninety-second piece for a talk and accepts that the parts must be named after all.

**What the reckless concept would have given.** The feeling of literally building a screen. Kept: the subjects' dialog redraws with every tap. Given up: dragging, and the silence.

## 11. The shape

Eight sessions, each a short round: choose (two radio groups, both reset to unselected each session), run (a three-second lab animation), read (the result window), log (a row in the notebook). Then one last decision: the reply, three sentences. Then the verdict screen. Screens: start (the email, the aim, Open the lab), play (the apparatus window, the subjects' screen window, Run, the notebook window), result (a window over the play screen), reply, verdict, How to play, About. Presets are the paper's own regimes and the literature's: sums + one winner (Niederle & Vesterlund's lab, as the paper describes it); price + flat ladder and price + steep ladder (the paper's firms F and S, phase 1 rules); price + one winner (a second-price auction for a single job, as in the auction literature the paper cites); sums + ladder, flat and steep (ours: the tournament with the paper's prize ladder, an extrapolation, declared). The player orders them; nothing is locked. No score. Five to seven minutes.

## 12. Controls, mechanism, feedback, moment

**Controls.** Two radio groups. *To compete, the students must:* solve sums for five minutes / name a price for the job. *What they win:* one winner (350; the rest 50) / a flat ladder (350, 200, 200, 50) / a steep ladder (450, 150, 150, 50). Both unselected at the start of every session. *Run session* enables only when both are set. After the eighth session, a third control, once: the reply, three radio buttons.

**Mechanism** (the hidden system). A pool of students, each with traits drawn once per session: ability (same distribution for men and women), belief about their own rank (men more often believe they are the best of four), appetite for a gamble, and a taste for the top rung. Each apparatus is a procedure run on groups of four (two men, two women), six groups a session:
- *Sums:* a student chooses the contest or a sure piece rate by comparing the prize they expect under their *believed* rank, less a gamble penalty, with the sure thing; the contest is then decided by true ability plus noise. The headline is the share who chose the contest.
- *Price:* a student bids a shaded share of what each rung is worth above the default, plus their taste for the top; the paper's allocation rules run (top to the highest bidder at the second-highest bid; middles to the next two at the third-highest); the headline is the mean bid for the top as a share of what it is worth.
- The one-winner prize sets the gamble penalty high and the rank belief decisive; the ladder dilutes both; the price removes the rank belief entirely and makes the gamble penalty irrelevant (bidding one's value is dominant in the second-price rule).

**Feedback.** The result window: two bars with the headline in words; who got the six top jobs; earnings in words; the game's line on what the apparatus measured; the Rome ghost line when the apparatus is the paper's. The notebook: one row per session.

**Moment.** Session 2 or 3, whenever the player first changes *what competing means* and the gap goes: "the number moved and I did not touch the students."

## 13. The look

**Register: a z-Tree lab terminal, Windows 2000** (Retro family). From the paper itself: Appendix B's screenshots, grey dialog boxes with navy title bars, red bold ECU amounts, radio-button questionnaires, a *Procedi* button at the bottom right, a yellow frame round the live screen. The paper's ugliest pages become the game's whole surface, with affection: it is what the three authors looked at for a year.

- **Palette:** *dialog grey* `#D4D0C8` (every window face and the desktop); *title navy* `#0A246A`, graded to `#3A6EA5` at the right, as the 2000 title bar; *field white* `#FFFFFF` (text fields, the notebook page, the subjects' screen); *lab red* `#C00000` (the subjects' amounts, the women's bar, the ECU numbers, as in the screenshots); *men's navy* is the title navy again, for the men's bar; *bevel light* `#FFFFFF` and *bevel dark* `#808080` / `#404040` for every 3-D edge; *highlight yellow* `#FFF200`, only as the frame round the subjects' screen while a session runs.
- **Type:** Liberation Sans (Red Hat, SIL OFL), regular and bold, the free Arial: the Windows dialog face. Embedded as data, Latin subset. 13 px in dialogs, 11 px in status bars, bold for amounts; title bars in bold white.
- **Buttons:** Windows 2000 push buttons: grey face, 2 px bevel (white top-left, dark grey bottom-right), square, black text; the default button has a 1 px black ring outside the bevel; pressed inverts the bevel; disabled shows engraved grey text. Radio buttons drawn as the real thing: a sunken circle with a black dot. Group boxes with an etched border and a caption.
- **The one visual rule:** *everything on screen is a window, and the subjects' window sits inside yours.* No element lives outside a titled frame; the player's lab is a desktop of windows; the game never speaks except inside a dialog or a status bar.
- **Play screen at 380 px.** The aim, one line, in the window's title area under the title bar, with a ? at the right. Window 1, *Session 3 of 8 · Apparatus*: the two group boxes with radios; answers "what can I set?". Window 2, *What the students will see*, a white field with the subjects' dialog drawn small (title bar ESPERIMENTO, the instruction lines, the amounts in red bold, a *Procedi* button) and redrawn on every tap; answers "what does my setting do?". The *Run session (24 students, €300)* button. Window 3, *Notebook*, a white page with one row per session: two small icons (Σ or €; one box or three), two thin bars navy and red, the gap in words; answers "what has the lab found so far?". While a session runs, window 2 gets the yellow frame and a lab window draws 24 heads in 6 cubicle rows with flickering screens and a clock; answers "is it running?". The result is a window over everything, *Result · Session 3*: the two bars large, the headline, the two lines, the measured line, the ghost line, *Write it in the notebook*.
- **Reply screen:** a window, *Reply to the email*: the email again, three radio sentences, *Send*.
- **Verdict screen:** a window, *Sent*: the notebook complete with greyed cells for what was never run, the three verdict lines, the Rome result as a small bar pair, the authors' sentence, *Run the lab again*, How to play, About, the beta line.

## 14. What is cut

Phase 2 (eight bidders across both firms); runs and periods (one session is one shot per group); the four-bid monotone profile (each student bids per rung, monotone by construction); the bottom-level U as a bid; the personality, cognition and loss-attitude measures; the 10 ECU = 1 euro exchange and the show-up fee (kept only as the €300 session cost, from the paper's average earnings); the regressions; the real-effort *performance* gap (Gneezy, Niederle & Rustichini 2003), since the game's sums apparatus measures entry, not output; the ambiguity, visibility and feedback-dynamics strands of the literature review.

## 15. Divergences

- **Half the hidden system is not the paper's data.** The sums apparatus is calibrated to Niederle & Vesterlund (2007) as the paper describes it (men enter the tournament about twice as often, with no gender difference in performance, driven by beliefs about rank and attitudes to risk), because the paper's discovery is a contrast and the contrast needs both sides on the same screen. The config block tags those numbers to the paper's introduction and literature section, not to its tables, and About says so. Reason: without the left-hand side, the game is a demonstration of a null result.
- **Sums with a ladder is ours.** The paper never ran a real-effort contest with its prize ladder; the cell exists so the two controls can be crossed. Its direction (the gap shrinks when a ladder dilutes the gamble) follows the paper's argument that steeper and flatter ladders change the stakes of advancement; its size is a modelling choice, declared.
- **One session is six groups, one period.** The paper's 32 periods with learning are compressed to one shot, with the paper's steady-state bid levels (periods 4 onwards, Fig. 3) as the calibration target. Reason: a run must take seconds.
- **Twelve men and twelve women, two of each per group.** The paper's sessions were randomly gendered (45% female); fixed halves make the bars comparable and the top-job count readable. Niederle & Vesterlund used the same two-and-two groups.
- **Stylised headline index.** The sums apparatus reports a share who entered; the price apparatus reports a mean bid as a share of the rung's worth. Both are drawn on the same 0–100 bar with their own caption; the game says in the verdict that the two bars never measured the same thing, which is the paper's point.
- **The email and the budget are ours.** The paper has no journalist and no grant; the session cost (€300) is 24 times the paper's average earnings of €12.3, rounded.
- **The price-and-one-winner cell** is a second-price auction for a single job, calibrated to "no gender difference" from the auction literature the paper cites (Chen et al. 2013, second-price), with the paper's own top-rung shading. Declared as literature, not as the paper's data.

## 16. Mechanism kind and claim boundaries

Three kinds, one per part, declared on the About screen:

- **The price apparatus: reconstructed from the paper.** Bids are the benchmark plus a deviation drawn to the paper's reported means (Fig. 4, phase 1; Table 1's Female coefficients), with the bunching at the benchmark that Appendix C describes and a person-level component shared by a student's top and middle bids (Sect. 4.3's explanation of why the middle pays better). The paper's own allocation rules then run. It demonstrates the paper's patterns (no gender gap in bids, women a little higher at the top of the flat firm, women on top more often than their share, the middle paying better than the top, no gender difference in earnings). It assumes the shape of every distribution, the bunching share, one shot instead of 32 rounds, and two-and-two groups. The paper establishes the reported estimates for its 168 students and nothing finer.
- **The sums apparatus: reconstructed from the literature the paper cites.** Niederle & Vesterlund (2007) as the paper's introduction and section 2 describe it: entry about 73% of men and 35% of women; 75% and 43% believing themselves the best of four; no gender difference in performance; the gap attributed to beliefs and risk (van Veldhuizen 2022, Croson & Gneezy 2009). Each student has ability, a private view of their standing, an aversion to a gamble, and a gender-neutral taste for the top. It demonstrates that gap. It assumes the decomposition, which the paper does not identify; the calibration check re-runs it under all-confidence and all-risk alternatives, and the central contrast survives both (the price apparatus loads on neither trait by construction, which is the paper's own argument for its design). None of these numbers is the paper's data, and the result window says so under every sums result.
- **Toy: the crossed cells and the one-job price.** Sums with a ladder was never run by anyone; in this model a ladder barely moves the gap, because the belief about one's rank still decides entry. The one-job price is a second-price auction with no gender difference (Chen, Katuščák & Ozdenoren 2013, as cited). Both are labelled as not the paper's on the result window.

**Where the discovery comes from.** The gap on the left and its absence on the right are the literature's number and the paper's number, not the rules': no budget, scoring or objective produces them. What the rules add is the noise of a 24-student session, which is real (the paper's own gender results are mostly "not significant"), and the verdict's reading of the notebook, which is ours and is judged in words.

**Correlation and averages.** The player's lever is a selection of what to measure, not an intervention on anyone; the students are drawn afresh each session from the same distributions. Individual responses are constructed; the About screen says so.

## 17. Calibration plan

Headless, in Node, `calibration.js` against `mechanism.js`, 3,000 sessions per cell:

- Price apparatus against the paper: mean bid deviations by position and gender within ±6 ECU of Fig. 4 (phase 1) with the gender differences of Table 1 (TF +14 ± 5; TS +8 ± 5); women's share of top jobs in the flat firm 52–62% and in the steep firm 49–58% (Fig. 5, Table 2, with our 50% expectation); earnings of the top job 50–75 and of a middle job 90–112 (flat) and 75–97 (steep), read off Fig. 8 and Fig. 10; middle minus top 20–60 (flat) and 8–45 (steep), per Table 3 model 2; gender difference in earnings within ±6 (Table 3); the share of single sessions whose words are "about the same" or "women a little higher" at least 80% (flat) and 90% (steep).
- One-job price: gender difference within ±3 points.
- Sums apparatus against NV 2007 as cited: believe-best 75% / 43% ± 5; entry 73% / 35% ± 5; the share of sessions saying "men about twice as often" or "clearly more" at least 85%; men do not out-earn women (over-entry does not pay); men's share of top jobs 58–72%.
- Crossed cells: the gap still 15–50 points.
- The central contrast: sums one-winner gap 25–55; price flat −8 to +2; price steep −6 to +2.
- Robustness (build.md §1): the contrast under (a) all-confidence and (b) all-risk decompositions of the sums gap.
- The draw over 500 seeds: a sums-one-winner session fails to show the gap at most 8% of the time; a price-flat session shows the men clearly higher at most 5%.
- The verdict logic on three notebooks: both columns run, sums only, price only.

## 18. Calibration result

43 checks, 43 passed (`calibration-result.txt`). Flat firm: top deviations −40 (men) and −27 (women), middle −9; women take 54% of top jobs; top earns 62, middle 103; earnings gender difference −0.6. Steep: top −47 / −39; women 52% of tops; top 69 (Fig. 8 and 10 put it nearer 60; inside tolerance, noted), middle 88. Sums: believe-best 74% / 43%, entry 76% / 34%; 93% of sessions say twice or clearly; men's earnings 6 below women's; men take 66% of top jobs. Central contrast: +41 points on sums-one-winner, −4 on price-flat, −2 on price-steep. Under (a) the sums gap is 46 and the price gap −5; under (b) 25 and −5. Noise: 3% of sums sessions miss the gap; 1% of price-flat sessions show the men clearly higher.

## 19. Playing it in numbers (build.md §3)

There is no score, so the heuristics are strategies for spending eight sessions, run against the verdict (`loop.js` and the checks in `calibration.js`):

| Strategy | Notebook | "less" | "same" | "depends" |
|---|---|---|---|---|
| Textbook only (sums + one winner, eight times) | eight gaps | backed ("the honest reply from your lab; you never changed what competing meant") | not backed | not backed ("you ran only one kind of apparatus") |
| Paper only (price + ladders, eight times) | eight "about the same" or "women a little" | not backed | backed | not backed |
| One of each, then repeats (the walkthrough) | gaps left, none right | contradicted by the right column | contradicted by the left column | backed |
| Prizes first (sums with all three prizes, then price) | gaps across the sums row, none under price | contradicted | contradicted | backed, and the notebook shows the prize switch doing nothing |

The decisions matter: only a notebook with both columns backs the paper's sentence, and the strategy of changing only the prizes is the instructive dead end. No single rule wins by the rules; the sentence the player should leave with is the one the paper ends on.

## 20. Build log

- Mechanism written headless; tuned over a sweep of the four sums parameters (confidence by gender, gamble aversion by gender) to the NV 2007 targets; the bunching share added when the steep firm's top earnings came out 15 ECU too high with plain normal bids (the paper's Appendix C describes the bunching that fixes it).
- Loop on placeholder text (`loop.js`): eight sessions printed with bars, words, the measured line and the ghost; the notebook abbreviations; the three replies judged. Read as the stranger: the result says what happened before anything explains it; the measured line comes after; the ghost is grey.
- Skin: Windows 2000. The desktop is the title-bar blue (`#3A6EA5`), not dialog grey as section 13 first said: grey windows on a grey ground had no edges, and the blue desktop is what the lab's screens sat on. Everything else as declared: grey faces, navy-to-pale title bars, bevelled buttons with the default ring, drawn radios, etched group boxes, red amounts, the yellow frame while a session runs, Liberation Sans embedded (9 KB a weight, Latin subset).
- Screenshots at 380 px: start, empty apparatus, task only, both set, running, four results, notebook, help, reply, end (both-columns and sums-only), about. Fixes from the review: a class clash boxed the radio labels; the notebook rows truncated their words (now wrap); the "what to expect" line was missing from the run button (added above it); the walkthrough's "about half" for the ladder cells corrected to what the model gives.
- Full session in headless Chromium (`session-test.js`, `session-log.txt`): seed 2026, the walkthrough's eight sessions, help opened mid-play and returned from, reply "depends" backed; a second play of sums only with reply "less" backed; "Run the lab again" reseeds; no errors, no horizontal scroll on any screen.
- Length: five to seven minutes, estimated; not measured on a person.
