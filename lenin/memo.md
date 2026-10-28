# Design memo — *The Wall in the Head*

## 1. Paper

Alberto Alesina and Nicola Fuchs-Schündeln (2005), "Good Bye Lenin (or Not?): The Effect of Communism on People's Preferences." NBER Working Paper 11700, October 2005. The paper was later published in the *American Economic Review* 97(4):1507–1528 (2007), doi:10.1257/aer.97.4.1507, but this game was built from the working paper alone. Only the PDF was available: there was no code and no microdata (the paper uses GSOEP data). Every number in the game is either a reported estimate, a value computed from the reported coefficients, or a value read off Figure 1, and each is marked as one of these.

## 2. What the paper hands over

- **Primary: estimates.** These are probit regressions on the 1997 and 2002 GSOEP surveys. The question asked who should provide financial security in five areas (unemployment, sickness, family, old age, care): "the state" or "private forces". The tables are:
  - Table 1: East effect, the 2002 change, and how the gap narrowed;
  - Tables 3 and 4: age and birth cohort;
  - Table 5: a panel of the same people;
  - Table 8: regional economic controls;
  - Table 9: East Germans who moved West;
  - Tables 11 and 13: beliefs about luck and social conditions;
  - Table A2: raw shares;
  - Table A6: votes.
- **Secondary: an argument.** This is the identification case for reading the East–West gap as an effect of communism. The country was split exogenously. East and West were alike before 1945 (Table A1, the 1898 elections, the Prussia dummy). The paper controls for individual and regional income. It answers self-selection through migration (Section 2.1.3 and Table 5). It checks that survey answers line up with votes (Section 5).

## 3. The discovery, and its kind

There are two kinds. The game is built around the second.

- **Counterintuitive result.** Forty-five years under a dictatorial, all-intrusive state did not turn East Germans against the state. They want *more* state than West Germans: the paper "quickly and soundly reject[s]" the backlash hypothesis (p. 3).
- **Identification.** The gap is not just poverty, history or migration. It grows with the number of years a person lived under the regime. That is a dose–response pattern: older West Germans want *less* state, while older East Germans want more. The gap is closing, and about two thirds of the closing comes from people changing their minds, not from older people dying.

## 4. The core narrative

> For forty-five years a country was cut in two by a wall, for reasons that had nothing to do with the people on either side. One half lived under a government that ran everything. Then the wall came down. You'd think people who had lived under that government would want as little of it as possible. They wanted more. A doubter says: they're just poorer; or they were always like that; or the ones who liked markets had fled. Your job is to prove the doubter wrong, one piece of evidence at a time, and to find out how long the wall in people's heads will take to come down.

## 5. Fidelity level and claim boundaries

**Statistical, from reported estimates only.** There is no simulated respondent anywhere in the game. Every number shown is one of three things:
- reported in the paper;
- computed from a reported probit coefficient, converted to percentage points at the West German share (the conversion is stated, and it reproduces the paper's own 14.5–17 point figures);
- read off Figure 1.

- **Demonstrates:** the paper's reported pattern, and the logic of its argument, meaning which comparison rules out which alternative explanation.
- **Assumes:** our conversion of probit coefficients into "people out of 100". The jars of 100 are a display of shares, not individuals. We also assume that each objection has one piece of evidence that best answers it; that matching is our editing of the paper's argument, with sections cited.
- **The paper establishes:** the reported associations in GSOEP survey data, with controls. The causal reading ("communism did it") rests on the paper's natural-experiment assumptions: the split was exogenous, the two halves were similar before 1945, and migration does not drive the result. The paper argues for these and cannot prove them. The game says "in the paper's survey" and "the paper argues", never "this proves".

Correlation and causation: the player never moves a lever that changes preferences. The player chooses which *comparison* to look at, which is what an experimenter does.

## 6. The aim and the verdict

- **Aim (start screen and top of play):** "Prove to a doubter that living under communism changed what people want."
- **Per objection:** "Pick the one piece of evidence that settles this." The yardstick is in the same units: settled at the first try, settled at the second, or lost to the doubter.
- **Verdict (top of end screen):**
  - *You:* settled *n* of 6 objections, *k* of them at the first try; the doubter won the rest.
  - *The paper:* in the paper's survey, East Germans were about 16 points more likely to want the state in charge. The gap was biggest among those who lived longest under communism, and income, history and migration do not explain it away.
  - *What it means:* a political system can reshape what its citizens want, and the change takes a generation or two to wear off.

## 7. Concepts

The playable experience was not obvious: an empirical paper has no model to steer. There were three concepts.

**A. The doubter (discovery, Experimenter; "present the evidence").**
- **Setup:** after an opening bet, a doubter raises six objections in turn. The player holds seven evidence cards, each one a comparison the paper made, and plays the card that settles the objection. The card turns over to show the paper's numbers. A wrong card also turns over (the player learns its finding), and the doubter explains why it does not settle the point.
- **Controls:** one tap, choosing a card.
- **Deliberation:** "What comparison would rule *that* out?" That is the paper's identification question.
- **Discovery:** each card is a finding. The moment comes when the "Old and young" card answers "it's just the shock of 1990" and shows the gap climbing with years under communism.
- **Fun:** anticipation (the bet and each card flip), agency (cards work or fail for reasons the player can see), discovery, and a little mastery (later objections get easier as the player learns what each card shows).
- **Second play:** little. It is a puzzle and its answer is learnt, and we do not claim otherwise.

**B. The survey van (discovery, Experimenter, sampling under a budget).**
- **Setup:** the player sends interviewers to five generations, East and West. Simulated answers drop into jars, and the player must find where the gap is largest.
- **Weakness:** it needs constructed individual respondents (an average effect played as individual answers). The deliberation, where to sample next, is generic statistics, not this paper's argument. The probit gradient is also flat at the top (1931–45 vs before 1931), so "find the max" has no clean answer.

**C. Spot the Easterner (Subject/perception).**
- **Setup:** the player sees a person's birth year and five survey answers and guesses East or West. The discovery: the old give themselves away, the young do not.
- **Weakness:** it needs an invented correlation between a person's five answers. Accuracy tops out near a coin flip for the young, which plays as frustration rather than insight.

## 8. The first five minutes (pick A)

- **0:00.** Start screen: "The Wall in the Head." There is a grey wall with a crack and one line: "1990: Germany reunites after 45 years apart." The aim is on its own line. I tap *Start*.
- **0:15.** The bet. "1997. A survey asks Germans: if you lose your job, who should look after you: the state, or private forces (yourself, family, insurers, charities)?" "East Germans lived 45 years under a state that ran everything. Compared with West Germans, will they say 'the state'…" [*More often*] [*Less often*]. I think: they had the Stasi, they must hate the state. I tap *Less*.
- **0:30.** Two jars of 100 figures fill: West 63 say "the state", East 79. "More. Many people guess less, and the paper calls that the first idea it rejects." I'm surprised and want to know why.
- **0:50.** The doubter appears. "Of course they want help. They're poorer: the East earns 20% less and has twice the unemployment." Seven cards fan out below: *Same pay, same job*; *Old and young*; *Before the split*; *Same people, five years on*; *The ballot box*; *Luck or society?*; *Those who moved West*. Each card shows one line saying what it compares. I weigh it: poverty means comparing people with the same income. I tap *Same pay, same job*. The card flips: the gap was 17 points raw, still 16 among people with the same income and job, and 11 even after counting the aid the East receives. "Fair. Some of it is money, most of it isn't." ✓ First try.
- **1:40.** "Then it's the shock of 1990: factories closed overnight and everyone in the East clung to the state." I hesitate. *Same people, five years on*? Maybe. I play it. The doubter: "That shows minds are moving now. It doesn't say what put the difference there." The card shows the narrowing anyway. I think again: the shock hit everyone, but communism hit the old for longer. I play *Old and young*. The bars climb from 7 points for those born after 1975 to about 33 for those born before 1946. A note says that among West Germans, age makes people *less* keen on the state. That is the moment: the dose.
- **2:40.** "They were always like that, different region, different history." *Before the split*: incomes in 1928–36 were identical, and in 1898 the West, if anything, voted more for state intervention. ✓
- **3:10.** "Three million fled West before the Wall. The market lovers left." Tempting: *Those who moved West*! The doubter: "That helps me: the movers are less keen on the state, exactly what you'd see if they were different all along." I grin, caught. I play *Same people, five years on*: the same individuals became less pro-state between 1997 and 2002, so preferences aren't fixed traits sorted by migration. ✓
- **3:50.** "People say anything to a survey taker." *The ballot box*: the ex-communist party won about 20% of the vote in the East and 1% in the West. ✓
- **4:10.** "All right. But how can a government change what people want?" *Luck or society?*: East Germans believe more that social conditions, not luck or effort, decide your life. ✓
- **4:30.** The last question: "When will East and West want the same?" I drag a flag to 2050. The reveal shows the paper's band, 2010–2030 if the 1997–2002 pace holds, and says two thirds of the closing is people changing their minds.
- **4:50.** The verdict: 6 settled, 4 at the first try, and the paper's one-sentence finding.

## 9. The pick, and why

**A.** It makes the paper's real intellectual content, *why we believe it was communism*, into the player's decision. Every reveal is a reported finding, nothing has to be invented about individuals, and the "present the evidence" form is a known pleasure. The counterintuitive bet opens it, and the dose–response moment comes in about two minutes.

Runner-up: **B**. Switch if the author would rather the player gathered data than reasoned about it, accepting a constructed respondent-level process declared as illustrative.

## 10. The shape

The game takes about five minutes (an estimate; not timed by a person), in three parts:
1. **The bet:** one choice.
2. **The doubter:** six objections, ordered for the player:
   1. poverty;
   2. the 1990 shock, answered by the dose;
   3. always different;
   4. self-selection;
   5. cheap talk;
   6. why.

   Poverty comes first because it is everyone's first thought. The dose comes second so the strongest finding arrives early.
3. **The forecast:** drag a flag to a year, then reveal.

No presets: the objections are the paper's own robustness sections. Two tries per objection: a second miss loses the objection to the doubter, and the card the paper plays is shown so the lesson survives the loss. The score is per objection (first try, second try, or lost), and the session verdict counts objections settled and first tries out of 6. There is no running point total.

## 11. Controls, mechanism, feedback, moment

- **Controls:** tap a card; two bet buttons; one year slider.
- **Mechanism:** the judging is `judge(objection, card)` in `mechanism.js`. Each objection accepts exactly one card, the one the paper uses against it (sections cited in `CONFIG`). Every card's numbers are computed in `mechanism.js` from the paper's tables.
- **Feedback:**
  - the reveal (the card flips to show its chart);
  - the race (paired East/West bars);
  - the bet and the card (the opening jars, the closing forecast).
- **Moment:** objection 2. *Old and young* turns over and the gap climbs with years lived under communism.

## 12. What is cut

- the separate five policy areas (averaged, except the opening question, which is unemployment);
- ordered probit (Table A5);
- wealth controls (Table 2);
- income sources and future income (Tables 6–7);
- each eastern state separately (Table 10);
- the luck and social-conditions regressions as controls (Tables 12 and 14);
- all individual control coefficients.

## 13. Divergences

- The opening jars show raw shares for one question (unemployment, 1997, Table A2), not the regression estimate.
- The card numbers average the five areas, rounded to whole points.
- Probit coefficients are converted to points at the West German share, our approximation. It reproduces the paper's stated 14.5–17 points.
- The "Old and young" bars are read off Figure 1. Recomputing them from Table 4 at the West share gives a smaller gradient for the older cohorts (about 7 → 24 points instead of 7 → 33). The rise survives either way; see the fidelity result.
- The doubter's lines are ours. The objections paraphrase the alternatives the paper itself raises.
- "Two thirds changed their minds" is the paper's rounding of a 35% average reduction.

## 14. Visual world

The paper's imagery is two survey samples on either side of a line. Rules:
1. Concrete grey and paper white; East in a warm red, West in a slate blue, used for nothing else.
2. A wall runs across the top of every screen, cracked.
3. Cards are large index cards, at most seven, two per row, with big titles and one line each.
4. Charts are paired bars, three to five per card, each labelled with its number.

**Legibility rule.** On the play screen the player looks at:
- one speech bubble (the objection, at most two lines);
- seven cards, each 48% wide, which answer "what does this compare?";
- after a play, one card turned over, whose chart answers "did it settle it, and what did the paper find?".

## 15. Fidelity plan

`fidelity.js` checks, against the paper's numbers:
- (a) the East effect in points from Table 1 for each area against the text's 14.5–17;
- (b) the 1997→2002 change from Table 1 against the text's 2.3–6.9 points;
- (c) linear years to convergence against the text's 11–35 (and 20–40 after reunification);
- (d) the panel reduction (Table 5 vs Table 1) against the text's 35%;
- (e) the Table 8 drop of 0.43 → 0.29 against "up to one third";
- (f) Figure 1's youngest cohort reproduced from Table 4;
- (g) robustness: the dose–response rise holds under the figure, under a recomputation from Table 4, and with the conversion at the East share instead of the West share;
- (h) footnote 6 incomes within 3%;
- (i) the raw gap is positive in all five areas and both years;
- (j) the game logic: exactly one accepted card per objection; a perfect run scores 6/6; a random strategy averages well below; the verdict is in the aim's units.

## 16. Fidelity result and build log

**Fidelity result** (`fidelity-result.txt`, all checks pass):
- (a) East effect in points from Table 1 at the West share: 14.7, 16.9, 16.2, 16.8, 14.7, matching the text's 14.5–17.
- (b) 1997→2002 change: −4.2, −6.1, −2.4, −5.8, −6.9, matching the text's −2.3 to −6.9.
- (c) Years to close: 10.6 (care) to 33.2 (family), matching the text's 11–35, giving closing years 2008–2030.
- (d) Panel reduction 35.0%, so 65% of the narrowing is minds changing (the paper's "two thirds").
- (e) Regional controls cut the unemployed coefficient by 32% ("up to one third").
- (f) Figure 1's youngest cohort is reproduced from Table 4 within 0.2 points, so the conversion is right.
- (g) The dose–response rise holds in Figure 1 (7 → 12 → 24 → 34 → 33), recomputed from Table 4 at the West share (7 → 8 → 15 → 23 → 24), and at the East share (7 → 8 → 15 → 23 → 23). The figure's older cohorts are larger than the recomputation, and the author note says so. Age effects have opposite signs East and West (Table 3). The East effect stays at or above 10 points when converted at the East share.
- (h)–(i) Pre-war incomes within 4%; raw gaps positive in all ten cells; PDS 21% vs 1.4%; movers below stayers but above West Germans.
- (j) Exactly one accepting card per objection, all different; a perfect run scores 6 of 6 first tries; random tapping averages 0.86 of 6.

**Build log:**
1. `mechanism.js` written and checked in Node; one bug found by the check (the share of narrowing attributed to minds changing was inverted) and fixed before any page existed.
2. `loop.js` played a plausible session headlessly: wrong cards produce a specific rebuttal and still show the card's finding; the yardstick reads "settled at the first try" or "on try n".
3. `template.html` skinned (concrete wall, East red / West slate, large cards two per row, bar charts with the number on every bar); `build.py` inlines the mechanism verbatim and verifies it byte for byte.
4. Screenshots at 380 px: start, bet, card grid, a settled card, the cohort card, a wrong card, forecast, end. One fix from the screenshots: the end-screen table squeezed the objection column.
5. Builder's self-review: the aim can be stated from the start screen alone ("prove to a doubter that communism changed what people want"); the discovery can be stated from the top of the end screen alone (East Germans want about 16 points more state; the gap grows with years under communism; it is not money, history or migration). This is the builder's review, not stranger testing.
6. `session-test.js` drove the final page through a full session at 380 px with two wrong cards, the help page opened and returned from mid-play, a forecast, the verdict, and a retry: no console errors, no horizontal scroll (scrollWidth 380). Session length is an estimate of about five minutes; a person has not timed it.
7. Revision after the author's first play: the start-screen wall made much bigger (a 260 px cracked wall with WEST and EAST on it), and a two-try rule added in `mechanism.js` (`CONFIG.maxTries`): a second miss loses the objection to the doubter, marked red, and the paper's card is shown beneath the wrong one. Fidelity check (j4b) covers the rule; the session test now loses objection 4 on purpose. All 25 checks pass; the browser session runs clean at 380 px.
