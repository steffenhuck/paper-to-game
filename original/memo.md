# On the Record — design memo

A rebuild. This folder used to hold *The Original or the Copy*, built from the same paper: a forecaster bet on eight countries followed by a controller with two dials (talk, lean) over three campaigns, in newsprint. That game is in the git history. This one starts again from the PDF, under the current skill, and is meant to differ from it as well as from the last three games.

## 1. Paper

Swen Hutter & Hanspeter Kriesi (2022). "Politicising immigration in times of crisis." *Journal of Ethnic and Migration Studies* 48(2): 341–365. doi:[10.1080/1369183X.2020.1853902](https://doi.org/10.1080/1369183X.2020.1853902). Open access, CC BY.

Available: the PDF only, appendices included (Appendix B's per-country figure is cut off in the PDF). No data, no code. Every coefficient used is copied from Tables 2 and 3; nothing is read off a figure except the Fig. 5 checks in the calibration.

## 2. What the paper hands over

**Primary: an estimate.** Table 3 Model 3: across 37 elections with country fixed effects, the change in the radical right's vote is

ΔRR = 31.92·Δs − 0.757·Δp − 33.05·Δs·Δp (+ previous-share and country terms)

where Δs is the change in how much of the main centre-right party's campaign is about immigration (a share), and Δp is the change in its position on immigration (−1 = against, +1 = for).

**Secondary: a measurement and a second estimate.** The measurement is the paper's instrument: core sentence analysis. Every newspaper sentence is reduced to *actor — direction — issue*, and a party's salience is the share of its coded statements on an issue, its position the average direction (Appendix A). The second estimate is Table 2: the radical right's politicisation raises the *salience* of immigration for every other party, more so in the crisis, but barely moves their *positions*; and the party-group averages of direction (radical right −0.61, centre-right −0.08, centre-left +0.52; Table 2 Model 1, Direction).

## 3. The discovery, and its kind

**A counterintuitive result.** The common instinct of a mainstream party facing a rising anti-immigration party is to steal its issue: talk about immigration and sound tough. The paper finds the opposite. When the big centre-right party talks more about immigration *and* moves towards the radical right's position, the radical right grows. Talking more about it on your old line helps them too, less. Moving your position without talking more makes no difference. "The French choose the original, not the copy" (p. 355).

A second piece rides along as the constraint, not the plot: in the crisis, the radical right's noise and the news put immigration on everyone's agenda (Table 2, salience contagion); "ignoring the immigration issue … was hardly an option" (p. 345).

## 4. The core narrative

You run the big party on the right. A smaller, angrier party is growing by shouting about immigrants. Every day reporters ask you questions, and the angry party makes sure some are about immigration. You want to stop them. The obvious trick is to say what they say, so their voters come to you. But every time you sound like them, more people decide to vote for them instead: if you say it too, they must have been right all along. When the big crisis comes you can't avoid the question any more, and you have to decide what you sound like.

## 5. Who lives in the paper

- **The main centre-right party.** Controls what share of its campaign is about immigration, and which way it leans. It is the player of Table 3 and the paper's title.
- **The radical right party.** Controls how hard it pushes immigration. In the paper it pushes regardless of the crisis (Table 1 Model 2) and its gains are not a function of its own noise but of refugee inflows and its rival's strategy. As a player it has no decision worth making (louder is always better).
- **The centre-left and radical left.** React to the radical right in a pro-immigration direction (Table 1 Model 4). Minor in the paper's story.
- **The coder.** The paper's own instrument: a trained coder reducing ~100,000 newspaper sentences to actor–direction–issue. Controls nothing in the world, everything in the measurement.
- **The reporter / the newspaper.** The "master arena". In the data, the filter between parties and voters.
- **Voters.** Present only as the radical right's vote share.

## 6. Precedent

| Game | Position | Format | Feedback device | Chassis |
|---|---|---|---|---|
| Say It Plainly (Rauh) | agent: the press officer, opened by forecaster bets | challenge | a marker sliding on a ruler of benchmarks | press release: Commission blue / yellow / green, serif text, ruler |
| The Honest Billboard (Beber & Scacco) | agent: the campaign designer | challenge (pick 3 of 6) | flipping cards, histogram, row of 100 dots | white billboard on red-earth ground; green / grey / red |
| One of Us (Fuchs-Schündeln & Holub) | experimenter: the detective | discovery | gap meter with interval; up/down bars | ink on cream review form, one orange accent |

**This game.** *Position:* agent, the centre-right leader. The paper plainly wants it: the finding is about what this party does, and the title is about it. Two of the last three used an agent, so the other three dimensions differ. *Format:* strategic. The player plays against a rival whose noise fills the player's question deck and against an electorate that reacts to every answer; none of the last three was strategic. *Device:* a balloon held by the rival that inflates or shrinks with each answer, and the next morning's tabloid headline quoting you. *Chassis:* a comic strip, pop-art halftone on hot yellow, black outlines, speech-bubble buttons; none of the last three (press release, billboard, review form) and not the old game's newsprint.

## 7. The aim and the verdict

**Aim (start, play screen, first line of How to play):** *Stop the radical right gaining 1 point or more from your campaign.*

The yardstick is their gain in points, shown on the balloon after every answer, with the 1-point line drawn on it. It refers to the campaign in hand, which is complete after six days.

**Verdict (end screen, first lines):**
- What you did: "In the quiet year you [copied them / took them on / kept off it], and they [grew by X points / barely moved]. In the crisis you [...] and they [...]."
- What the paper says: "Across 37 elections, when the big centre-right party talked more about immigration and sounded like the radical right, the radical right grew. Talking more on its old line helped them a little. Talking more against them didn't help them."
- What that means: "Voters choose the original, not the copy."

## 8. Three concepts

**A. On the Record (agent, strategic).** The player is the leader of the big centre-right party in an unnamed country, through two six-day campaigns: a quiet one before the crisis, then one during it. Each day three reporters ask a question; the player answers one. Immigration questions come with three answers: *sound like them*, *your usual line*, *take them on*. Every answer is a coded statement: the share of the player's answers that were about immigration is their salience, the average lean of those answers their position, exactly as the paper measures a party. The rival's balloon (its gain from your campaign, Table 3 Model 3) moves with each answer. In the crisis, the rival's noise and the news fill the deck: some days all three questions are about immigration.
- *Thinking before pressing:* "Do I take the immigration question? If I do, do I steal their line?" Then, in the crisis: "I have to answer this one. Which way?"
- *Seen after:* the balloon swells or shrinks, the rival's reaction, tomorrow's headline.
- *Moment:* the first tough answer, meant to take their voters, pumps their balloon by two points.
- *Fun:* agency (every answer moves the balloon), discovery (the copy backfires), mastery (the crisis campaign is played with what the quiet one taught, under a constraint), anticipation (election night).
- *Second playthrough:* the player who dodged everything first time can try the lines they avoided; the player who copied can try to win the quiet year by taking them on. It offers a different strategy, not a different regime; replay is modest, and the game is short enough not to need more.

**B. The Coder (experimenter) — the reckless one.** The paper's instrument in the player's hands, in real time. Newspaper sentences from a campaign slide in one by one; the player swipes each to sort it: who said it, and for or against immigration, or "not about immigration". Gauges for salience and polarisation build as they code, using the paper's formula. Then a second campaign from another country. The play screen is almost wordless apart from the sentences; speed matters.
- *Thinking:* "who is this, and which way is it pointing?"
- *Moment:* the crisis-hit country's paper is all bailout; the bystander's is all immigration, and nearly every immigration sentence comes from one party.
- *Fun:* skill (sorting speed and accuracy), discovery.
- *Second playthrough:* faster, more accurate; same lesson.

**C. The Mixing Desk (controller).** The centre-right's campaign as two faders, *how much immigration* and *which way*, with the rival's vote as a meter; a target per scenario. This is the previous build's Act 2, with a free 2D pad instead of 3 × 3 buttons.
- *Thinking:* "where on the pad is safe?"
- *Moment:* top-left corner (loud, tough) sends the meter up.
- *Fun:* agency, some discovery.
- *Second playthrough:* nothing new; the pad is the whole model.

## 9. The first five minutes

**Pick: A, On the Record.**

- *0:00.* A comic panel on hot yellow: a podium, a microphone, and on a soapbox across the panel a figure in magenta holding a fat balloon marked "12%". Title: *On the Record*. Under it, on its own line: "Stop the radical right gaining 1 point or more from your campaign." I tap *Start the campaign*.
- *0:15.* One panel of brief: "You lead the big party on the right. The radical right is the small loud one. It wants this election to be about immigration. Every day: three reporters, one question you answer. What you say is what the papers print, and that is what voters hear." Under it, the three immigration answers side by side, each a bubble: *Sound like them*, *Your usual line* (what your party said last time), *Take them on*. I tap *Day 1*.
- *0:40.* Three reporter bubbles. "Pensions: will you raise the retirement age?" "Taxes: who pays for the new trains?" "Immigration: they say the borders are open. Are they?" I think: their voters care about borders; if I'm tough, they come to me. I tap immigration, then *Sound like them*: "We'll close the borders. Enough is enough."
- *0:55.* My bubble pops. The rival grins: "Why vote for the copy?" The balloon swells 12 → 15, past the dashed ring. A headline: "BIG PARTY: 'WE WILL SHUT THEM'". A note: sounding like them made them bigger, not smaller. I frown: what?
- *1:20.* Day 2. I try *Your usual line* on immigration: the balloon swells again, less (+0.7): "even your usual line helps them". Day 3 I take *Roads*: nothing moves. Day 4 I try *Against them*: the balloon shrinks a little (−0.4), but not back inside the ring. I'm now thinking about it as a mix.
- *2:30.* Election night: "Not held. Your campaign handed the radical right 3.4 points." A strip shows my six answers as bubbles, coloured by lean. One line: "In 37 real elections, a big centre-right party that talked more about immigration and sounded like the radical right fed it. Voters chose the original, not the copy."
- *2:50.* Campaign 2. "The refugee crisis. Their noise and the news are everywhere: some days every question is about immigration." Day 1: three immigration questions. I can't dodge. I weigh it: tough fed them; my usual line fed them; *Take them on* didn't. I take them on. The balloon doesn't move. Day 2 offers schools: I take it, keeping immigration down.
- *4:00.* Election night 2: "Held. Less than a point." I grin. The end screen leads with the verdict, then three balloons side by side: what the crisis's two no-dodge days hand them on each line (+5.3, +2.2, 0).

**Runner-up: C, The Mixing Desk.**

- *0:00.* Two faders and a meter. "Keep the radical right under 1 point." I push immigration up and lean tough. The meter shoots up. I pull lean to open; it drops. Ten seconds later I have found the whole surface.
- *0:30.* Scenario 2 locks the immigration fader high. I already know: lean open. Held.
- *1:00.* I'm done and not sure what I decided. The pad is a demonstration with a target. There was no moment where my intuition committed before I saw.

**The reckless one: B, The Coder.**

- *0:00.* "You are a coder. Sort each sentence: who said it, which way." A sentence slides in: "Centre-right leader rejects calls for a border fence." I swipe: centre-right, *for* immigration? I hesitate: rejecting a fence is pro. Correct. The next is about the bailout: *not immigration*. 
- *0:40.* I get quick. The gauges fill; the Greek campaign's immigration gauge stays near empty. Then the Swiss one: immigration sentences pour in, mostly from one party.
- *1:30.* Reveal: "Greece was the hardest-hit port of entry. Switzerland barely saw a boat. The fight was where a party made it." I nod.
- *2:00.* But I realise my coding didn't change anything: the sentences were already what they were; my speed made the gauge fill faster. The skill was sorting, and the finding arrived as a reveal I watched.

## 10. The pick, and why

**A.** The player's every action is a variable in the paper: a coded statement by the centre-right, which builds the very salience and position that Table 3 uses. The deliberation is real and rests on a widely held prior (steal their issue), so the discovery lands on the first or second answer. The crisis campaign turns the paper's second finding (contagion: you can't ignore it) into the constraint that forces the interaction into play. Mastery is visible: the crisis campaign goes better than the quiet one for a reason the player can say.

**Author test.** Hutter and Kriesi measure parties by what they are quoted saying. In this game the player *is* what they are quoted saying, statement by statement, and the scoring is their Table 3. They would recognise their instrument and their result, and might enjoy watching a colleague feed the balloon.

**Runner-up: C.** Switch if testers find per-answer cards slow and want to see the whole surface; C could appear as the end screen's map. It is already partly there (four balloons).

**What the reckless concept would have given.** The paper's instrument in the hand, a skill loop, and the Fig. 3 discovery (the crisis was neither necessary nor sufficient). It lost because the player's actions do not change the outcome, and the sentences would be invented quotes attributed to real parties in real campaigns. Its best idea survives in A: the player's answers *are* core sentences, and the end-of-campaign strip shows them coded.

## 11. The shape

- **Screens:** Start → Brief → Campaign 1 (6 days) → Election night 1 → Crisis brief → Campaign 2 (6 days) → Election night 2 → End. How to play and About from the start screen; a ? on every play screen returns the player to where they were.
- **Presets:** two, both the paper's own regimes: before the crisis, and during it (Table 2 Model 5's crisis × centre-right salience term; p. 345).
- **Order:** the quiet campaign first, so the instinctive copy is free to try and to fail; the crisis second, where avoidance is no longer possible and the lesson has to be used.
- **Score:** none beyond held / not held per campaign and the points gained, in the aim's units. No total.
- **Length:** about four minutes; 12 days, 12–24 taps.

## 12. Controls, mechanism, feedback, moment

- **Controls:** tap one of three question bubbles; for an immigration question, tap one of three answer bubbles. A non-immigration question is answered with one tap on your party's line.
- **Mechanism:** each immigration answer adds 3.5 points to the share of your campaign on immigration (Δs += 0.035; six of six = +0.21, the top of Fig. 5's range). Its lean is a position shift of the size Fig. 5 draws: *like them* = −1, *your usual line* = 0, *against them* = +1. Δp is the mean over your immigration answers. (The design first used Table 2's party-group distances, −0.53 / +0.60; the calibration keeps them as the robustness case, see §16.) The rival's gain is Table 3 Model 3 applied to (Δs, Δp) after every answer. In the crisis, two days have three immigration questions and two days have two (the deck carries the contagion).
- **Feedback:** the rival's balloon (size and number), with the 1-point line marked as a dashed ring; the rival's reaction bubble; tomorrow's headline quoting you.
- **Moment:** day 1 or 2 of the quiet campaign, when the copy inflates the balloon.

## 13. The look

**Register:** a comic strip, specifically the pop-art political cartoon. Where it came from: the paper's data are what parties are *quoted* saying in newspapers, Bild and Blick and The Sun among them; a quote is a speech bubble. The setting is a campaign: podium, soapbox, reporters.

- **Palette:** hot yellow `#FFD83D` (ground), ink black `#141414` (outlines, text), magenta `#FF2F7E` (the radical right and its balloon), teal `#00A3A1` (you), paper white `#FFFDF4` (bubbles). Halftone dots in the panels.
- **Type:** Bangers (OFL) for titles and headlines, inlined as data; system sans for body text, heavy weight.
- **Buttons:** speech bubbles: white, thick black outline, a tail pointing at the speaker, a hard offset shadow.
- **The one rule:** everything anyone says is a bubble with a tail pointing at who said it. Questions point at reporters, answers at you, reactions at the rival.

**The play screen:** the aim on one line at the top (with the ?); a panel about 40% of the screen tall with your podium (left, teal) and the rival on a soapbox holding the balloon (right, magenta). The balloon is the biggest object on screen, up to 150 px across, with its number inside; it answers *did that work?* Below the panel, the day (1 of 6) and three question bubbles, each full width, about 60 px; they answer *what can I say today?* After an immigration question, the three answers replace them. A headline strip appears under the panel after each answer: *what did the papers print?*

## 14. What is cut

- Systemic politicisation by election, region and country (Figs. 1–3), including the "neither necessary nor sufficient" result. One line in About.
- Refugee inflows and the radical right's declining marginal returns (Table 3 Model 1). One line in About.
- The centre-left's and radical left's reactions (Table 1 Models 4–5).
- Country names and real parties: the country is unnamed and the parties are "you" and "the radical right".
- The previous vote share and country-fixed-effect terms of Model 3: the balloon shows only the part of their gain the model attributes to your campaign.
- Talking *less* than last time (Δs < 0): the previous campaign is set at zero immigration headlines, so the player can only add. This keeps the game inside the paper's range and the paper's claim.

## 15. Divergences

- **Statements as headlines.** Each of the six daily answers stands for a slice of a campaign worth 3.5 points of salience. Ours, to keep six-of-six at +0.21, the edge of the range Fig. 5 shows.
- **Answer leans** are Fig. 5's ±1, the two cases the paper draws and describes. These are big shifts (half the scale). Under Table 2's smaller party-group distances (−0.53 / +0.60) the ordering holds, but taking them on six times of six would hand them about two points; so the game never claims that taking them on is always harmless, only that it gives them nothing on the forced days.
- **Running projection.** Model 3 relates a whole campaign to an election. Showing it after each answer ("if the campaign ended now") is a presentation choice.
- **Crisis deck.** The number of forced immigration days (two of six) is ours, chosen so the forced minimum Δs (+0.07) is close to Table 2 Model 5's crisis × centre-right salience term (+0.056) plus the rival's contagion.
- **The 1-point line** is ours. The calibration reports the range of lines that gives the same held / not held outcomes for the key strategies.
- **The rival's starting 12%** is for display only; the model predicts changes. The crisis campaign starts where the quiet one ended.
- **Floor at zero.** The model's estimate goes slightly negative for "against them" (−0.8 to −1.0), entirely through the position term (t = −0.36). The balloon never shrinks below its starting size; the paper gives no evidence that any line costs them votes.
- **Causality.** Table 3 is an association across 37 elections with country fixed effects; the paper reads it causally ("contributes to"). The game plays it as a lever and says, on election night and in About, that it is a pattern, not an experiment, and that the interaction term is estimated with t = −2.18.
- **Reactions and headlines** are ours, written for the register.

## 16. Mechanism kind and claim boundaries

**Toy, built on the paper's estimate.** Table 3 Model 3 is an association across 37 elections with country fixed effects; the game turns it into a lever, which build.md allows only for a toy that says so. The game says it on every election night ("a pattern across elections, not an experiment; the game plays it as if it were a lever") and on About.

- **Demonstrates:** what the estimate implies answer by answer: more talk + like them goes with a bigger radical right; more talk on the old line with a somewhat bigger one; more talk against them with no change; a position shift without more talk with no change.
- **Assumes:** 3.5 points of salience per answer; Fig. 5's ±1 position shifts; reading the estimate after each answer; the 1-point line, the decks, the texts; the floor at zero; the 12% start.
- **Establishes (the paper):** the association, read by the authors as the accommodating strategy "contributing" to the radical right's success provided salience rises; salience contagion from the radical right to all parties, stronger in the crisis, without position contagion.

**Which discoveries come from the paper and which from the rules.** *The copy feeds the original* and *talking on your old line helps them* follow from Table 3 (main salience term t = 4.65; interaction t = −2.18). *Taking them on is harmless* follows from the interaction term alone (under Model 2 it would be +1.2 on the forced days) and from the size of the "against" shift; the game says so at the first "against them" answer. *You can't dodge in the crisis* is a rule of ours, sized to Table 2 Model 5. *Held / not held* is ours; the calibration shows the outcomes are the same for any line in (0, 1.12].

## 17. Calibration plan and result

`calibration.js` runs `mechanism.js` in Node and checks:
- Model 3 against Fig. 5, read off the figure at 110 dpi: the −1 line runs from about −11 to +15 over salience −0.2…+0.2 (slope ≈ 65), the +1 line is flat near zero, and the gaps between the lines at ±0.2. The figure sits about 1.2 points above the bare coefficients (other covariates), so slopes and gaps are compared, not levels.
- The sentences on p. 355; the measurement (share of statements, mean direction, Appendix A); Table 2's ordering of party positions.
- The decks (one immigration question a day in the quiet year; two forced days in the crisis, minimum Δs 0.07 against Table 2 M5's +0.056; no repeated question).
- Eight player strategies end to end.
- Robustness: Table 2 leans instead of ±1; Model 2 instead of Model 3; the hold line; the salience step (0.025, 0.033).
- The display floor; determinism.

**Result: ALL PASS** (`calibration-result.txt`, 34 checks). Slope of the −1 line 64.97 (figure ≈ 65); +1 line slope −1.13 (figure ≈ −1); gaps 14.7 and 11.7 (figure 14.7 and 11.7). Strategies: quiet year, copy every day +14.4, usual line every day +6.7, against them every day 0 (estimate −1.0), never touch it 0; crisis, forced days only: like them +5.3, usual +2.2, against 0. **Not robust**, and said in the game: under Model 2, talking against them is not harmless; under Table 2 leans, taking them on every day gives +2.1.

## 18. Build log

1. `mechanism.js` and `calibration.js`. First run: one failure (crisis questions repeated); added six immigration and six other questions and fixed the deck offsets.
2. `loop.js` as a headless first-timer (`loop-log.txt`): +3.0 on the first copy, +0.7 on the usual line, −0.4 on taking them on; not held at +3.4; crisis held. Fix: the immigration question always sat first on the list; rotated it.
3. Changed the answer leans from Table 2's distances to Fig. 5's ±1 when the calibration showed the "against them" result depended on them; kept Table 2 as the robustness case. Added the display floor at zero after the loop showed the balloon shrinking below its start on "against them" answers.
4. `template.html` in the declared look; `build.py` inlines the mechanism (verified byte for byte) and the Bangers font (OFL).
5. Screenshot fixes at 380 px: the 1-point ring drawn over the balloon (it was hidden); the rival's bubble moved off the soapbox; label clipping; day title and dots separated; bubble text wrap; what-if balloons sized by the gain.
6. `session-test.js` in headless Chromium at 380 px (`session-log.txt`): a full session, help opened and returned from mid-play, "take another question", About and back, a retry copying every day (+14.4). No errors; no horizontal scroll on any screen.

**Self-review.** The aim can be stated from the start screen alone ("stop the radical right gaining a point from your campaign"). The discovery can be stated from the top of the end screen ("sounding like them made them grow; voters choose the original, not the copy"). It does not look like any game in the README table: no ruler, billboard or form; a comic panel with a balloon. Session length is about four minutes, a builder's estimate nobody has measured.
