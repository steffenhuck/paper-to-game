# Design memo: *The Honest Billboard*

## 1. Paper

Bernd Beber and Alexandra Scacco (2022), "The Myth of the Misinformed Migrant? Survey Insights from Nigeria's Irregular Migration Epicenter." Ruhr Economic Papers No. 957, RWI Essen. doi:10.4419/96973121. We had the PDF only, with its supplementary figures. There was no code and no microdata. Every number in the game is either stated in the text or a footnote, or read off a figure at 200 dpi. Each one is tagged as such in `mechanism.js`.

## 2. What the paper hands over

- **Primary: estimates.** The data come from a representative survey of 555 households in Benin City, Nigeria, in October and November 2018. The paper reports histograms of incentivised best guesses with the true value marked:
  - Fig. 8: European income, life expectancy, and unemployment benefits in the UK and Italy;
  - Fig. 11: risks of the journey (these have no true value);
  - Fig. 17: the asylum acceptance rate for Nigerians.
  It also reports shares of categorical answers: route knowledge (Fig. 14), real and fictional threats (Fig. 15), and the respondent's own chances of reaching Europe and of getting asylum (Fig. 16). The text and footnotes add medians: expected European wage, the reservation wage, and the median guess of European income.
- **Secondary: an argument.** This is about policy. European information campaigns assume that potential migrants overrate Europe. If they do not, then a campaign that tells the truth about Europe makes Europe look better, and a campaign that makes Europe look worse is untrue. The paper argues that the useful information is about the journey and about the gap between "people like me" and "me" (Section 4, citing Lieberman, Posner and Tsai: information works when it is new).

## 3. The discovery, and its kind

**A counterintuitive result.** The policy world believes the would-be migrant is a dreamer misled about Europe's riches. Benin City's guesses about Europe are about right, or too gloomy. The median guess of the average European income is €660 a month against a true figure of about €2,500. Most people also guess Italy's unemployment benefit too low. What people get wrong is the road and their own odds. Four in five think they personally would make it to Europe. Most guess the asylum acceptance rate too high. So an *honest* billboard about Europe backfires. An honest billboard about the journey lands.

## 4. The core narrative

> A city in Nigeria sends a lot of its young people on a dangerous road across the desert and the sea to Europe. Europe pays for posters there to talk them out of it, and the posters mostly say "Europe isn't as good as you think." You get to put up three posters, and every word on them has to be true. The catch is that you have to guess what the people reading them already believe. It turns out they don't think Europe is paradise; they think it is poorer than it is. So the true facts about Europe make it look *better*. What they don't know is how hard the road is, and how few of the people who try get through.

## 5. Fidelity level and claim boundaries

**Statistical, from reported distributions only.** Nothing is simulated and nothing is random.

Each billboard states a true fact from the paper. Each respondent's survey guess falls into one of three groups:
- **rosier** than the fact: the billboard *warns* them, because the truth is worse than they thought;
- **about right**: the billboard tells them nothing new;
- **gloomier** than the fact: the billboard *backfires*, because the truth is better than they thought.

The shares in each group are computed from the paper's histograms. A guess counts as "about right" if it is within a factor of 1.5 of the true value for money, or within 7.5 points for the asylum rate. Within a histogram bar, guesses are spread evenly on the paper's log scale.

- **Demonstrates:** where Benin City's beliefs sit relative to the truth, item by item, as reported.
- **Assumes:**
  - the "about right" band;
  - spreading guesses evenly within a histogram bar;
  - that a fact which is worse than your guess makes the option look worse to you. This is a statement about beliefs, not behaviour.
  - On the "making it" billboard, the comparison is between a personal belief ("would *you* get there?") and a fact about the population ("most who set out do not"). The paper itself notes that an individual could be right to be confident.
- **The paper establishes:** the reported distributions of beliefs in a representative 2018 sample from one city. It does *not* establish that any billboard changes beliefs or behaviour. The game never says anyone stays or goes. It says whom a fact warns and on whom it backfires: "in the survey".

The player's lever is a choice of message. It is not an intervention on the population. No individual responses are constructed. The 100 figures are a display of shares.

## 6. The aim and the verdict

- **Aim:** "Pick 3 true billboards that warn the most people and backfire on the fewest."
- **Yardstick:** each billboard gets three counts out of 100 people: warned, knew already, backfired. The campaign score is warned minus backfired, summed over the three billboards. The best possible score is shown next to it at the reveal.
- **Verdict (top of end screen):**
  - *You:* your best campaign warned *W* and backfired on *B* (score *S* of a possible 155).
  - *The paper:* in the survey, Benin City guessed Europe's riches about right or too low. The facts they got wrong were the asylum odds, the road, and their own chances.
  - *What it means:* a campaign that tells would-be migrants Europe is worse than they think is either useless or untrue. The honest message is about the journey.

## 7. Concepts

**A. The honest billboard (Challenge, Agent: the campaign designer).** The player picks 3 of 6 true billboards. Each one flips to show the survey's guesses against the fact, coloured warned, knew or backfired. Then there is a second campaign, informed by the first.
- **Deliberation:** "What does a 25-year-old in Benin City believe about this?" Picking a billboard is a conjecture about other people's beliefs.
- **Discovery:** the Europe billboards that a European reads as deterrents ("only €350 a month") backfire.
- **Fun:**
  - anticipation: each flip;
  - agency: the choice decides the score;
  - discovery;
  - mastery: campaign 2 uses what campaign 1 revealed, and the unseen billboards must be inferred by analogy.

**B. You vs Benin City (Subject).** The player answers the survey's own questions and sees their guess dropped onto Benin City's histogram. It makes for a good "drop". But the discovery is about the player compared with Benin City, not about the campaign premise. It also turns into a sequence of guesses.

**C. The rumour mill (Discovery).** The player sorts circulating stories (pirates, vampires, Agadez, motorbikes) into true and false, then sees how Benin City sorted them. Its weakness is that it covers only finding 2, and it is a quiz.

## 8. The first five minutes (pick A)

- **0:00.** A white billboard against a red-earth sky. "The Honest Billboard." Under it: "Benin City, Nigeria: in 2017 almost 1 in 4 households saw someone leave for Europe by the desert and sea road." The aim is on its own line. I tap *Start*.
- **0:20.** The brief. "Europe pays for campaigns here," with three real examples in one line each: Denmark's ads ("benefits have been cut"), Germany's billboard ("Leaving? Are you sure?"), and the EU's "Telling the real story". "You run the next one. Rule: every word must be true." Then the definitions: *warn* means the fact is worse than what someone believed; *backfire* means it is better. I tap *Choose billboards*.
- **0:45.** Six billboards in a grid. Each has a big fact and a small topic tag: EUROPE, ITALY, BRITAIN, ASYLUM, THE ROAD, THE SEA. I think: these people imagine Europe as paradise, so tell them benefits are tiny. I pick Italy (€1,300 max) and Britain (€350). For the third I hesitate between "Most who set out never get past Libya" and the €2,500 income. €2,500 sounds like a lot. I'm unsure, so I pick Libya. I tap *Put them up*.
- **1:30.** First flip: ITALY. A histogram of guesses with a dashed line at €1,300. Almost all the bars sit to the left of it, in red. "Backfired on 88 of 100: they thought the dole was smaller." I frown. Britain: mostly grey with red and green on either side, net −9. Libya: a green column, "Warned 80: four in five think they'd make it themselves." My score is −13 of a possible +155. I get it now: they underrate Europe.
- **2:40.** Campaign 2. My three seen billboards carry their badges. I reason by analogy: if they underrate the dole, they probably underrate income too, so I skip EUROPE. I keep Libya and add ASYLUM and THE SEA. Flips: asylum +40 ("most guessed above 1 in 4"), pirates +35. Score +155 of +155. I grin.
- **3:40.** End screen. The verdict, then all six billboards ranked, then three things the survey also found: only 1 in 100 knew most people cross into Niger on motorbikes; half of those with an opinion believe vampires roam the sea; the median "wage that would make me stay" equals the median wage expected in Europe.

## 9. The pick, and why

A. It has a decision with a real prior, and that prior is the policy myth the paper tests. The discovery lands on the first flip. Campaign 2 gives mastery by inference. Runner-up: B. I would switch if testers found picking billboards abstract and wanted to see their own guess on the histogram. B's "drop" could be added as an optional opening guess.

## 10. The shape

- **Screens:** Start → Brief → Campaign 1 (pick 3) → reveal three flips → Campaign 2 (pick 3; skipped if campaign 1 already scored the best possible) → reveal → End. How to play and About are always reachable.
- **Billboards:** six, all the paper's own items. Three are Europe facts from Fig. 8 (income, Italy benefit, UK benefit). Three are journey and odds facts: asylum (Fig. 17), own chances (Fig. 16), pirates (Fig. 15).
- **Left out:** life expectancy, because it is not a campaign message and its truth sits on a bar edge; death and injury rates, because the paper gives no true value.
- **Score:** warned minus backfired.

## 11. Controls, mechanism, feedback, moment

- **Controls:** tap to choose 3 billboards, then tap to flip each one.
- **Mechanism:** for each item, the shares of guesses rosier than, about equal to, or gloomier than the fact, computed from the read-off histograms.
- **Feedback:** the reveal. The histogram of guesses is coloured by group, with the fact as a dashed line, followed by the three counts and a row of 100 dots.
- **Moment:** the first Europe billboard flips red.

## 12. What is cut

- Life expectancy and the risk histograms (injury, death, sexual abuse, slavery), which have no true value.
- The splits by interest in migrating (Figs. 9–10, 12–13), by family migration and by gender (S.2–S.3). The paper says the key patterns hold in each.
- Community norms (Fig. 19) and self-reported uncertainty (S.4–S.7).
- The reservation-wage figure (Fig. 18). The median comparison is kept as an end-screen fact.

## 13. Divergences

- The monthly figures for benefits are the paper's own conversion from weekly amounts.
- The true income is GNI per capita in current USD (2017), plotted on the paper's € axis. We show what the plot shows: about €2,500.
- We place the figure's ticks at ln(naira) = 9…15 with roughly ₦415 per euro. This reproduces every tick label and the paper's €660 median.
- The "about right" band is our choice. The robustness check below varies it.
- The "making it" fact ("most who set out never get past Libya") is the paper's footnote 34. Benin City's beliefs on it come from Fig. 16.
- "Don't know" answers count as "no change", not as warned.

## 14. Visual world

Fig. 1's billboards and Fig. 2's road north. The rules:
- a white billboard panel on red-earth ground;
- one big fact per billboard, no small print;
- three colours only: green = warned, grey = knew, red = backfired;
- one histogram per flip, at most 14 bars, with € labels in plain numbers.

Legibility: the play screen shows six cards (two columns, each about 170 px wide). The reveal shows one histogram (full width, about 160 px tall) and one row of 100 dots. Each picture answers one question: "where did people's guesses sit, compared with the truth?"

## 15. Fidelity plan

`node fidelity.js` runs `mechanism.js` unchanged and checks:
- (a) The median income guess computed from the read-off histogram is ≈ €660 (fn. 37, tolerance ±15%).
- (b) Most respondents underestimate EU income and the Italian benefit (text p. 16). The UK mean is close to the truth.
- (c) The tick placement reproduces the figure labels.
- (d) The asylum truth is 28,130 / 122,040 = 23% (fn. 34). The mean guess is above it, and the mode is the 40–50 bar (p. 23–24).
- (e) Four in five say "somewhat" or "very likely" to reach Europe. Nearly the same share say so for asylum (p. 23).
- (f) Pirates are believed more than vampires. More than half of those with an opinion think vampires are probably or definitely real (p. 23). About 1% knew the motorbike crossing and about a third knew Agadez (p. 21–22).
- (g) **Robustness:** with the band at a factor of 1.25, 1.5 and 2 (and ±5, 7.5, 10 points), income and Italy always have net < −50, asylum and "making it" always > +20, and the best set of three is always {making it, asylum, pirates}. Under an alternative score that counts only the warned, income and Italy are still the two worst.
- (h) Game logic: picking requires exactly 3; the score equals the sum; the best possible score is computed, not typed; campaign 2 is skipped after a perfect campaign 1; displayed counts sum to 100.

## 16. Fidelity result and build log

**Fidelity:** `node fidelity.js` → all 33 checks pass (`fidelity-result.txt`).
- The median EU-income guess recomputed from the read-off histogram is €648, against €660 in fn. 37.
- 94% of guesses are below the true EU income, and 94% below the true Italian benefit. The UK median is €311 against a truth of €355.
- The asylum truth is 23.0%. The mean guess is 38, and the mode is the 40–50 bar.
- 80% say they would likely reach Europe; 79% say their own asylum claim would likely succeed.
- Robustness: across bands ×1.25 / ×1.5 / ×2 (±5 / 7.5 / 10 points), income is −87 / −83 / −72 and Italy −88 / −83 / −78. UK is −8 / −9 / −9. Asylum is +39 to +41, the road +80, the sea +35. The best set is always {asylum, road, sea}, scoring 154 to 156. Scored by "warned" alone, income and Italy are still last.

**Build log:**
1. Built the mechanism headless; fidelity passed on the first run.
2. Ran the placeholder loop (`loop.js`). The feedback line called BRITAIN a backfire, but it is a near-wash (−9), so I split the line into "backfired" (net ≤ −20) and "close to a wash".
3. Applied the skin. The Italy and UK charts were crushed by four to six near-zero guesses on a long log axis, so I added a display-only `showFrom` (those guesses are still counted) and sparser €30…€10k ticks.
4. The stacked-bar read-offs for THE ROAD and THE SEA were rounded to whole numbers, so the category rows add up to the counts shown (±1, within read-off precision).
5. Self-review from screenshots:
   - Can the aim be stated from the start screen alone? Yes: pick three true billboards that warn most and backfire least.
   - Can the discovery be stated from the top of the end screen? Yes: Benin City guessed Europe about right or too low; what they got wrong was asylum, the road, and their own odds.
6. Ran a full browser session at 380 px (`session-test.js`, `session-log.txt`). It covered campaign 1 with the "myth" picks, help opened and closed mid-pick with the selection kept, campaign 2, the verdict, About and back, and a retry in which a perfect first campaign skips campaign 2. There were no errors and no horizontal scroll. The session length is estimated at about 4 minutes and has not been measured with a person.
