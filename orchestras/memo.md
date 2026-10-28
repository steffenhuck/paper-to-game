# The More the Better? — design memo

## 1. Paper

Jutta Allmendinger, J. Richard Hackman and Erin V. Lehman, "Life and Work in Symphony Orchestras", *The Musical Quarterly* 80(2), Summer 1996, pp. 194–219. Oxford University Press. Stable URL https://www.jstor.org/stable/742362 (no DOI printed). Available: the PDF only, 27 pages including the JSTOR cover. No data, no code. Every number used below is read off a figure or copied from a table in the text, and the config block says which.

## 2. What the paper hands over

An **estimate**, descriptive: a cross-national study of 78 professional orchestras (USA, UK, West Germany, East Germany) surveyed in 1990–91, reported as group means on 7-point scales. The primary thing handed over is Figure 5: six measures of orchestral life plotted against the proportion of women in the orchestra, in five bands (1–11%, 12–23%, 24–35%, 36–48%, 49–60%). Secondary: the table of women's share in major versus regional orchestras by country (p. 209), the medians by country (p. 207), and the paper's verbal account of three stages, token, transitional, balanced (pp. 211–12).

No model. No experiment. The paper's own figure title says "effects", but the design is a cross-section of orchestras sorted by composition; the game treats the curves as patterns found in the data, not as what would happen to one orchestra if its composition changed.

Not used: the country comparisons of Figures 1–2, career mobility (Figure 3), the financial-strength and governance findings, Table 2 on over- and underperforming orchestras, the East German story. Each is a separate finding with its own possible game; this one is built on the finding with the sharpest shape.

## 3. The discovery, and its kind

**A counterintuitive result.** The common dictum, which the authors name and reject, is "the more the better": as women join a formerly all-male orchestra, life there should improve, or at worst not change. In the data, almost every measure *falls* as the share of women rises from token to transitional, and for most measures it recovers only once women are more than about 40% of the ensemble. The curve is not a line; it is a dip with a tipping point. Two of the six measures (integrity as an ensemble, job involvement) do not recover at all within the observed range.

The kind is counterintuitive, with a secondary element of trade-off (the transitional stage is costly for everyone, and only balance repays it). The discovery is the shape of the curve, which is the paper's reported means and nothing finer; it does not depend on any choice this game makes.

## 4. The core narrative

For a long time, orchestras were all men. Then women started to join. People assumed that the more women joined, the nicer the orchestra would become. A study visited seventy-eight orchestras and asked the players how things were: how well they got along, how safe their jobs felt, how settled the orchestra was. The answer was a surprise. When there were only a few women, things felt fine. When there were more, a quarter or a third, things got worse for everyone, men and women. Only when women were nearly half the orchestra did things get better again. And a couple of things never got better at all. So "the more the better" was too simple: the hard part is the middle.

## 5. Fidelity level and claim boundaries

**Statistical.** The game shows the paper's reported group means directly; nothing is simulated.

- **Demonstrates:** the shape of each of the six Figure 5 curves, and the regional-versus-major pattern of women's representation in 1990.
- **Assumes:** that the values read off Figure 5 are within about 0.05 of the authors' numbers (the paper prints no table); that the first band's value can be handed to the player as an anchor; that a "shape" is well described by two questions, does it fall at first and does it recover at the end, with a dead zone of 0.2 scale points for "no change" (our choice, checked for robustness).
- **The paper establishes:** differences in means across five bands of orchestras observed once, in 1990–91, in four countries, which the authors report as "statistically reliable trends"; a verbal account of why (stages of entry) checked against interviews and observation. It does not establish what would happen to a given orchestra over time, nor a causal effect of composition on anything.

The game's writing says "in the study" and "the orchestras the study visited". Nothing is a lever: the player predicts what was found, never changes what happens.

## 6. The aim and the verdict

**Aim (start screen, play screen, first line of How to play):**
"Draw the line the study found: how life in an orchestra changes as women go from a handful to half of it."

**Per-round yardstick**, in the aim's units: whether the shape of the drawn line is right (falls at first? recovers at the end?), and the average miss in points on the 7-point scale. A right shape reads as success for that round even with a miss of a point.

**Verdict (end screen leads with):**
- *What you did:* "You drew N of 4 shapes right. Your lines missed by X points on average."
- *What the study says:* "In the orchestras the study visited, almost everything got worse as women went from a few to a third, and most of it recovered only past about 40%. Two measures, how much players throw themselves into the work and how intact the ensemble feels, kept falling."
- *What that means:* "'The more the better' is too simple. The hard part of becoming a mixed orchestra is the middle, and the orchestras that had got through it, mostly US regional orchestras, were doing better than those that had not started."

## 7. Concepts

The playable experience is nearly obvious: the paper hands over five-point curves whose shape overturns a common belief, and the only honest thing a player can do with a cross-section is predict it. Three concepts were still sketched, because the forecaster position is a fallback in this skill and the alternatives needed ruling out.

**A. Draw the line (forecaster, discovery format) — the pick.** For each measure, the player is told the token orchestras' value and draws the other four bands by tapping or dragging on a chart. The study's line is then drawn over theirs. Deliberation: before drawing, the player decides what they believe, more is better, more is worse, or nothing changes, and then where any turn comes. After the first reveal they have a theory (the stages) and the later rounds test it, including one where it only half applies. Fun: anticipation (the card turns), discovery (the dip, then the tipping point, then the measure that never recovers), mastery (round 3 goes better than round 1 for a reason the player can say). Second playthrough: two further measures, one of which recovers and one of which does not.

**B. The managing director (agent, challenge).** The player runs an orchestra over years; vacancies open (about four a year, Figure 3), the player chooses whom to hire, and the climate measures respond to composition along the Figure 5 curves. Rejected on fidelity: it turns a cross-section into an individual orchestra's trajectory and a hiring choice into an intervention, neither of which the paper supports; and it asks the player to hire by gender, which is not a decision the paper invites anyone to make.

**C. Sort the orchestras (experimenter, discovery).** The player is handed a dozen orchestras with their players' reports and must guess each one's share of women. Rejected: the paper reports only band means, so the individual orchestras would be invented, and the per-orchestra variation that makes sorting interesting is exactly what the paper does not report.

## 8. The first five minutes (the pick)

*0:00.* Dark screen, warm text. Title: The More the Better? Under it, one line: orchestras were all men; in 1990 some were half women. The aim, on its own line. A button: Start. A smaller one: How to play. I press Start.

*0:10.* A question: in 1990, which had more women, the famous big-city orchestras or the regional ones? Two big buttons. I think: the famous ones are richer and more modern, probably them. Or maybe not, maybe women got in where it was easier. I press Regional, half guessing.

*0:20.* The card turns: Regional, in every country, 52% against 24% in the US. A line says women entered where the doors were lower. I nod. Button: Next.

*0:30.* A chart. Five columns, labelled with little orchestra icons that go from one woman in ten to more than half. The title: how well players get along. The first column already has a dot at 5.3 out of 7. A line of text: tap each column to say where you think it was. I think: more women, people get along better? Or does nothing change? I draw a gentle rise, 5.4, 5.5, 5.6, 5.7. I press Show what the study found.

*0:55.* The study's line appears, in brass: it drops, to 4.5 in the middle, and climbs back to 4.8. My line sits above it, pointing the wrong way. The verdict: shape wrong, you drew it rising; it fell, then recovered. Miss 0.8 points. Below, three short lines: with a few women, nothing changes; with enough to form a group, both sides tense; near half, everyone has people like them. I frown, then think: so there is a dip, and it ends past 40%.

*1:20.* Next measure: how safe players feel in their jobs. Now I have a theory. I draw a dip bottoming in the fourth column and recovering in the fifth. Show. The brass line matches: shape right, miss 0.2. I grin.

*1:50.* How steady the orchestra is. Dip again; I put the bottom at the fourth column. Right. Miss 0.3.

*2:20.* How much players throw themselves into the work. I draw a dip. Reveal: it falls, and falls, and falls, to 3.4. Shape wrong: you drew a recovery; this one never recovered. The text says: two of the six measures kept falling. I think: so the tipping point is real but not universal.

*2:50.* The end screen: three shapes right of four, miss 0.4. The study's conclusion in two lines, then what it means. A button: two more measures. Another: play again. I press two more, because I want to know which of the remaining two recovers.

## 9. The pick, and why

Concept A. It is the only concept that stays inside what the paper reports, and the walkthrough has real deliberation (which way, where the turn is, whether this measure follows the pattern) with the discovery landing in the first reveal and sharpened by the last. The runner-up is B, the managing director; the condition for switching would be a longitudinal dataset or the authors' own stage model as a dynamic, neither of which this paper contains.

## 10. The shape

Five screens: start, help, play (round), end, about. One opener bet, then four drawing rounds, then a verdict; an optional second set of two rounds. Presets are the paper's own measures, ordered for the player, not as Figure 5 orders them: relationships first (the cleanest dip-and-recovery, the discovery in the first reveal), then job security and stability (the theory confirmed twice, with the bottom in the fourth band), then job involvement (the exception). The replay set is structure (recovers) and integrity (does not). Score: shapes right out of four and average miss; no running points. Session length, estimated: three to four minutes; five with the second set.

## 11. Controls, mechanism, feedback, moment

- **Controls:** one, a tap or drag on the chart that places a dot in the touched column at the touched height, snapped to 0.1. Four dots to place; the first band is given. One button, Show what the study found, enabled once four dots are placed. The opener has two buttons.
- **Mechanism (`mechanism.js`):** the six curves, the regional/major table, the shape classifier (falls at first; recovers at the end; dead zone 0.2), the miss (mean absolute difference over the four drawn bands, rounded to 0.1), the per-round verdict words, the session verdict. No randomness anywhere.
- **Feedback:** the reveal. The player's line stays; the study's line is drawn over it in brass, column by column, with the dots landing in turn. The verdict line below the chart, in the aim's units.
- **Moment:** the first reveal, when the brass line turns down where the player drew it up or flat; and the fourth, when it does not turn back up.

## 12. What is cut

Everything in the paper outside Figure 5 and the women's representation table: country and major/regional differences in structure and satisfaction (Figures 1–2, Table 1), motivation rankings across thirteen occupations, career mobility and where players go (Figure 3), women's representation by section (Figure 4 bottom), the financial-strength and governance findings, over- and underperforming orchestras (Table 2), East Germany under socialism and after reunification. The paper's five bands are kept; the three stages are used only as explanation after the first reveal.

## 13. Divergences

- The first band's value is given to the player, so that drawing is about shape rather than level. Our choice.
- Measures are renamed in plain words ("how well players get along" for quality of interpersonal relationships, "how steady the orchestra is" for stability, "how much players throw themselves into the work" for job involvement, "how intact the ensemble feels" for integrity as an ensemble, "how well the orchestra is set up for its work" for orchestra structure: task and composition). The paper's names are in the About screen.
- The chart shows the part of the 7-point scale from 3 to 7 for every measure, so that the dips are visible at phone width; the paper's panels use different windows.
- The band icons (one, two, three, four, five women in ten) are stylised midpoints of the paper's bands (6%, 18%, 30%, 42%, 55%).
- The shape classifier and its dead zone are the game's; the curves are the paper's.

## 14. Visual world

From the paper: a concert hall, the ensemble on stage, the question of who sits in it. Rules: stage-dark background, warm cream text, brass for the study's line, a cool blue for the player's; no decoration beyond the band icons; one chart per screen, large. Legibility: on the play screen the player looks at one chart filling the width, five columns, five icons under them, at most five dots of theirs and five of the study's; the chart answers "where was it?" and the icons answer "what is this column?"; the verdict line under the chart answers "was I right?".

## 15. Fidelity plan

Run in Node against `mechanism.js`:

(a) Every value lies on the 1–7 scale and inside the axis window of its Figure 5 panel; the first band is the highest band for all six measures (the paper: "almost all of our measures show an initial decline"; in fact all six do).
(b) The two measures the text names as declining without interruption, integrity and job involvement, are monotone non-increasing; the other four have their minimum in band 3 or 4 and end above it (the text: a tipping point, improvement "not until women achieved a representation of over 40%").
(c) The classifier's verdicts on the six paper curves agree with (b) for every dead zone from 0.1 to 0.3, so the discovery does not depend on our threshold. Under an alternative rule (sign of every segment, no dead zone) the same four recover and the same two do not.
(d) A player who draws the paper's own line scores miss 0 and shape right on all six; a flat line and a straight rising line score shape wrong on all six; a straight falling line scores right only on the two non-recovering measures. So "the more the better" loses everywhere, and the loss comes from the curves, not from the scoring.
(e) The opener: regional share exceeds major share in all four countries (p. 209); country medians are US 36, UK 30, Germany 16 (p. 207); the sample median is 21 and the range 2–59.

## 16. Fidelity result and build log

(appended after the build)

### Fidelity result

`node fidelity.js` against `mechanism.js`: all 21 checks pass (`fidelity-result.txt`). All six Figure 5 curves start at their highest value and fall; integrity and job involvement fall without interruption; relationships bottoms in the third band and the other three in the fourth, all four rising into the fifth. The classifier agrees with the text's classification for every dead zone 0.1–0.3 and under a segment-sign rule with no dead zone. Drawing the paper's own line scores miss 0.0 and shape right on all six; a flat line and a straight rise score shape wrong on all six; a straight fall scores right only on the two non-recovering measures. Regional share exceeds major share in all four countries; medians and sample figures match pp. 207 and 209.

### Build log

1. Mechanism headless in `mechanism.js`: curves, opener table, shape classifier, miss, verdict words, session verdict. No randomness. Fidelity check written and passed.
2. Loop test (`loop.js`): a stranger who believes "the more the better" in round 1, adopts the dip-and-recovery theory for rounds 2–3, and is caught by round 4. Printout read as the stranger: each reveal says whether the shape was right and by how much the dots missed; the theory formed after round 1 is usable in rounds 2–3 and fails honestly in round 4.
3. Skin: stage-dark, brass for the study, blue for the player, ten-seat band icons under the columns. Screenshots at 380 px in the folder.
4. Text: aim on the start screen and the top of the play screen and first line of How to play; orientation on every screen; the only button term, "Show what the study found", is self-explanatory; per-round verdict in the aim's units; final verdict first on the end screen; About with fidelity level and the three claim-boundary lines; attribution.
5. Self-review from screenshots: the aim can be stated from the start screen alone ("draw how orchestral life changes as women go from a handful to half"); the discovery can be stated from the top of the end screen alone ("most of it got worse in the middle and recovered past 40%; two measures never recovered"). One fix from the review: the axis label touched the top tick and was moved.
6. Browser session (`session-test.js`, Playwright, 380 × 760, DPR 2): opener answered, four rounds drawn by tapping on the chart, help opened mid-round and returned with dots kept, verdict screen, second set of two, About and back, Play again. No page errors; no horizontal scroll on any screen. The scripted session takes 17 s; a person reading and thinking is estimated at 3–5 minutes, not yet measured.

Publication: `orchestras/the-more-the-better.html` on branch `claude/intelligent-maxwell-thefr6`, intended play link https://steffenhuck.github.io/paper-to-game/orchestras/the-more-the-better.html once merged to `main`.
