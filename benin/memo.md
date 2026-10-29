# Design memo: *Ask First*

A rebuild. The first game from this paper, *The Honest Billboard*, sits in `previous/`. It was built before the skill was split into `SKILL.md` and `build.md`, and it was never merged. This memo starts again from the paper. The old game is treated as one more precedent to move away from.

## 1. Paper

Bernd Beber and Alexandra Scacco (2022), "The Myth of the Misinformed Migrant? Survey Insights from Nigeria's Irregular Migration Epicenter." Ruhr Economic Papers No. 957, RWI Essen. doi:10.4419/96973121.

What we had: the PDF only (46 pages, with the supplementary figures). There was no code and no microdata. Every number is either stated in the text or a footnote, or read off a figure. Those read-offs were made for the first build at 200 dpi and re-checked for this one at 80 dpi against Figs. 8, 14–17. Each number is tagged in `mechanism.js`.

## 2. What the paper hands over

- **Primary: estimates.** A representative survey of 555 households in Benin City, Nigeria, run in October and November 2018. One respondent aged 18–34 was interviewed per household. The paper reports:
  - histograms of *incentivised* best guesses, with the true value marked: Europe income and unemployment benefits (Fig. 8) and the asylum acceptance rate for Nigerians (Fig. 17). Respondents earned ₦50 of phone credit for each answer in the top half (fn. 16);
  - stacked bars of categorical answers: route knowledge (Fig. 14), real and fictional threats (Fig. 15), and own chances (Fig. 16);
  - medians in the text and footnotes.
- **Secondary: an argument.** This is about policy. European information campaigns assume potential migrants overrate Europe. If they don't, then an honest campaign about Europe makes Europe look better, and a campaign that makes Europe look worse is not honest. The paper's prescription (Section 4, after Lieberman, Posner and Tsai) is to *find out first what people believe*, and then tell them what is new to them. "This first step is rarely taken before policy actors provide migration-related information."

## 3. The discovery, and its kind

**A counterintuitive result.** The policy world believes the would-be migrant is a dreamer misled about Europe's riches. Benin City's guesses about Europe are about right, or too gloomy: the median guess of Europe's average income is €660 a month, against about €2,500. What people get wrong is the road and their own odds. Four in five think *they* would make it to Europe. Most guess the asylum rate too high. A secondary discovery comes from the method: you only learn this by asking.

## 4. The core narrative

> Young people in a city in Nigeria keep leaving on a dangerous road across the desert and the sea to Europe. Europe has printed posters to talk them out of it. The posters say "Europe isn't as rich as you think." Before they go up, you walk the streets with a clipboard and ask people what they actually believe. They don't think Europe is rich. They think it's poorer than it is, so those posters would make Europe look *better*. What they don't know is how hard the road is, and how few people make it.

## 5. Who lives in the paper

- **The respondent**, aged 18–34. They control their guesses and their own plans. They could be asked to anticipate their own odds.
- **The enumerator** with a clipboard. They choose whom to ask and what to ask, and they write down the answers. This is the paper's own instrument.
- **The campaign office** in Europe. It chooses the messages, and it assumes what people believe.
- **The returnee** (the ten qualitative interviews). They know the road: motorbikes into Niger, Agadez, Libya. They control what they tell the neighbourhood.
- **The connection man** (traffickers, p. 27). He spreads misinformation for profit.
- **The rumour** itself: vampires in the sea, pirates stealing engines. Each rumour is believed or not.
- **The neighbourhood** (Fig. 19). It holds norms about leaving and about returnees.

## 6. Precedent

| | Position | Format | Feedback device | Chassis |
|---|---|---|---|---|
| *One of Us* (homophily) | experimenter (detective) | discovery | gap meter, up/down bars, accusation | ink on cream, orange accent, review form |
| *Say It Plainly* (rauh) | agent (press officer), forecaster bets | challenge | drop, trajectory, counter on a ruler | Commission blue/yellow/green, press-release serif |
| *The Original or the Copy* | forecaster, then controller | challenge | reveal, race bars | newsprint, red-brown and blue |
| *The Honest Billboard* (previous build) | agent (campaign designer) | challenge | reveal: histogram flip, 100 dots | white billboard on red earth |

**What this game does differently.**

- **Position.** The paper plainly wants the experimenter: it is a survey paper whose policy lesson is "survey before you campaign". The player holds the paper's own clipboard. That repeats *One of Us*'s position, so the other three dimensions differ from it.
- **Format.** This is a challenge (a budget of twelve knocks, an objective, a commitment) driven by discovery. *One of Us* was pure discovery: test, accuse. The only unused format, strategic, needs an opponent who reacts. The paper has no one who reacts to anyone, so a strategic game would invent its opponent. A challenge therefore repeats the format of *Say It Plainly* and *The Original or the Copy*, but differs in position, device and look from both.
- **Device.** *The note wall* (our own). Each answer becomes a coloured sticky note stuck on the poster it was about:
  - green: the poster tells this person something worse than they believed;
  - red: it tells them something better;
  - white: nothing new.

  At the end the full survey's notes pour onto the same posters. There are no rulers, meters, race bars or histograms.
- **Chassis.** A comic strip on sun-yellow, with ink outlines, speech balloons, painted compound gates and rubber stamps.

Against the previous build: the old game had the player pick billboards on intuition and then reveal the data. This game makes the player *collect* the data, one person at a time, before committing. The commitment comes after evidence, not instead of it.

## 7. The aim and the verdict

- **Aim (start screen, top of play, first line of How to play):** "Find out which of Europe's posters would backfire — before they're printed."
- **Yardstick:** notes on each poster, in the aim's units: green means it warns, red means it backfires, white means nothing new. At the end, each poster gets a stamp and a result: warns about *W* in 100, backfires on about *B*.
- **Verdict (top of the end screen, in words):**
  - *What you did:* "You scrapped the two posters that would have backfired worst, and printed the three that warn." The sentence is built from the player's stamps.
  - *What the paper says:* "In the survey, Benin City guessed Europe's riches about right or too low. What they got wrong was the road, the asylum odds and their own chances."
  - *What it means:* "An honest poster about Europe makes Europe look better. The posters that tell people something new are about the journey. You only find that out by asking."

## 8. Three concepts

**A. Ask First (picked).**
- **Position:** experimenter, the enumerator.
- **Format:** challenge driven by discovery.
- **Controls:** one tap per door (which poster to ask this person about); one stamp per poster (PRINT or SCRAP); one button to send the posters.
- **Before pressing:** "Which poster am I least sure about? Two red notes on EUROPE: is that enough, or bad luck? Should I spend a knock on BRITAIN, which keeps coming back mixed?"
- **Seen after:** a gate opens, and a young person answers the survey's own question in a balloon, in naira, with the euro beside it. The note flies to the poster.
- **Discovery:** the first EUROPE answer: "Europe? Maybe ₦150,000 a month." That is €360 against the poster's €2,500. The note is red, and Europe's poster would make Europe look better.
- **Fun:**
  - anticipation at each gate;
  - agency in how twelve knocks are spent;
  - discovery at the doors;
  - mastery: a second street run spends knocks where the answers are mixed.
- **Replay:** a different allocation, or trusting Europe and printing all six unasked, to see what that costs.

**B. Phone Credit.**
- **Position:** subject, the respondent.
- **Format:** challenge.
- **Play:** the player takes the paper's incentivised survey as a Benin City respondent and earns ₦50 of credit for each answer in the city's top half.
- **Discovery:** the stranger beats the city on Europe easily, because the city guesses low. They are as lost as the city on the road (motorbikes, Agadez).
- **Fun:** anticipation and being right.
- **Weakness:** the main loop is the player guessing facts. The player's own beliefs are not the paper's data, and the optimism-bias finding cannot be played.

**C. The Rumour (reckless).**
- **Position:** agent, a non-human one: a story loose in Benin City.
- **Format:** strategic.
- **Play:** the player is a rumour competing with other rumours for believers: "Europe pays €2,500", "pirates steal engines", "vampires roam the sea", "they cross on motorbikes".
- **Discovery:** the true stories about the road lose to a vampire. Half of those with an opinion believe the vampire; one in a hundred knew the motorbike route.
- **Fun:** strangeness, rivalry.
- **Fatal weakness:** the paper reports belief shares, not spread. Every rule for how a rumour travels would be ours, and the "finding" would come from the rules.

## 9. The first five minutes

**Pick (A).**
- **0:00.** Sun-yellow screen. **ASK FIRST** in fat comic letters over a row of painted metal gates. One line: "Benin City, Nigeria, 2018. Almost 1 in 4 households here saw someone leave for Europe by the desert road last year." The aim is on its own line. I tap *Start*.
- **0:15.** A three-panel comic.
  - Panel 1, a fax from Europe: "They think Europe is paradise. Print all six posters."
  - Panel 2, my supervisor: "Before anyone prints anything, go and ask. Twelve knocks. Each person answers one question: you pick which poster to ask about."
  - Panel 3, the three note colours: green means the poster tells them something worse than they believed, so it warns; red means something better, so it backfires; white means they knew.

  I tap *Hit the street*.
- **0:40.** The street. Six posters in two columns:
  - EUROPE: "The average European lives on €2,500 a month"
  - ITALY: "Jobless in Italy? The state pays up to €1,300 a month"
  - BRITAIN: "Jobless in Britain? About €350 a month"
  - ASYLUM: "Fewer than 1 in 4 Nigerians who ask for asylum may stay"
  - THE ROAD: "Most who set out never get past Libya"
  - THE SEA: "Pirates steal the engines of migrant boats"

  Above them, a closed gate and twelve knock-dots. I think: everyone knows Europe's rich, let me check that first. I tap EUROPE.
- **0:50.** The gate swings. Osas, 24, says: "Europe? Average person… maybe ₦150,000 a month." A small tag says "≈ €360". A red note slaps onto EUROPE: "Thought less: the poster makes Europe look better." I frown. Bad luck? I ask EUROPE again. Ivie, 19: "₦300,000." That's €720. Red again.
- **1:30.** ITALY: red. ASYLUM: "Half of them, I think." Green. THE ROAD: "Me? Very likely I'd make it." Green. BRITAIN: green, then red. Mixed. I spend two more knocks on BRITAIN: white, red.
- **2:40.** Twelve knocks spent. I tap *Stamp the posters*. All six are pre-stamped PRINT by Europe. I scrap EUROPE and ITALY. I hesitate on BRITAIN (2 red, 1 green, 1 white) and scrap it. I print ASYLUM, THE ROAD and THE SEA (one white note, one green, no red). I tap *Send to Europe*.
- **3:00.** The full survey arrives. Each poster fills with the city's notes, and a stamp verdict appears:
  - EUROPE: "Backfires on about 85 in 100. Scrapped: right."
  - BRITAIN: "Close to a wash: 33 warned, 42 backfired. Scrapped: right."
  - THE SEA: "Warns 35, backfires on no one: two in three already believe the pirates. Printed: right."

  I grin.
- **3:40.** End screen. The verdict sentences, then my street against the city, then "what else the survey found": motorbikes, Agadez, vampires, the wage that would make people stay. Then *Walk another street*.

**Runner-up (B).**
- **0:00.** Start: "Earn phone credit like Benin City did." I'm asked Europe's average monthly income. I type €2,000, and my dot lands among the city's guesses. I'm in the top half and get ₦50. The city mostly guessed lower. Huh.
- **1:00.** Italy's benefit: I guess €800, top half. Asylum: I guess 40, which is not the top half. The truth is 23.
- **2:00.** "How do most people cross into Niger?" I guess bus and I'm wrong, like 99% of the city.
- **2:30.** "Would *you* make it?" This is unscorable for me.

I'm learning about the city, but only by comparison with myself, and my actions are guesses. The walkthrough works for one minute and then turns into a quiz.

## 10. The pick, and why

**A.** It puts the paper's own instrument in the player's hands, and it makes the paper's policy lesson ("ask first") the action itself. The discovery lands at the first EUROPE door, inside the first minute. The deliberation is real: the noisy posters (BRITAIN, ASYLUM) need more knocks, and the stamp is a commitment the reveal judges.

- **Author test:** Beber and Scacco get to run their survey and watch Europe's assumptions die door by door. Their footnote about phone credit and their "first step is rarely taken" line are in the play.
- **Runner-up:** B. I would switch if testers find the enumerator role too distant and want their own guesses on the line.
- **What C would have given:** a strange agent and the vampire as a villain. It was given up because its central dynamic would be our invention.

## 11. The shape

- **Screens:** Start → Brief (three panels) → Street (12 knocks) → Stamp → Reveal → End. How to play and About are always reachable. Returning lands the player where they were.
- **One round.** Retry with *Walk another street*: new doors, new people.
- **Presets:** the six posters are the paper's own items with true values, three about Europe and three about the journey. That mirrors the real campaigns in Fig. 1: Danish benefit ads; "Telling the Real Story" on the journey's dangers.
- **Order:** EUROPE comes first on the board because the discovery should come early. A player who follows Europe's lead asks about Europe first.
- **Score:** none as a tally. The yardstick is the notes and stamps. At the end: the stamp verdict per poster, in words, and the campaign's balance as warned and backfired.
- **Length:** about four minutes (estimate).

## 12. Controls, mechanism, feedback, moment

- **Controls:** tap a poster to ask the next person about it (12 times, or fewer: the player can stop early). Tap a poster's stamp to toggle PRINT and SCRAP. Tap *Send to Europe*.
- **Mechanism:**
  - Each person at a door is a single draw from the paper's reported distribution for that question. The money and asylum guesses are drawn from the read-off histogram, uniform within a bar on the paper's plotted scale. The categorical answers are drawn from the stacked-bar shares.
  - The note colour compares that answer with the poster's fact: guess rosier than the fact gives green, within the "about right" band gives white, gloomier gives red.
  - The reveal uses the full-survey shares, scaled to 100.
  - All randomness lives in `mechanism.js`, from a seeded generator.
- **Feedback:** the note wall during play; the flood of the city's notes at the reveal; stamps judged.
- **Moment:** the first red note on EUROPE.

## 13. The look

- **Register:** a comic strip. It comes from the setting of the data: door-to-door interviews in Benin City's neighbourhoods, where compounds sit behind painted metal gates.
- **Palette:**
  - Sun #FFCE3A for the ground;
  - Ink #161616 for outlines and text;
  - Gate Teal #137C7A for gates and buttons;
  - Warn Green #1F9D57 for green notes and PRINT;
  - Backfire Red #E5432F for red notes and backfires.

  Paper white #FFFDF4 is the neutral for balloons and blank notes.
- **Type:** Bangers (display: titles, stamps, poster tags) and Comic Neue Bold (body, balloons), both OFL and inlined as woff2.
- **Buttons:** chunky slabs with a 3 px ink outline and a hard 4 px offset shadow that collapses when pressed.
- **The one visual rule:** every number is said by someone in a balloon or written on a note. No number floats free.
- **Play screen:**
  - one comic panel, about 190 px tall: the gate, the person and the balloon. It answers "what did this person say?";
  - six poster cards in two columns, about 170 × 120 px each, with notes as 22 px squares. They answer "which posters keep getting red?";
  - twelve knock-dots at the top, which answer "how many questions are left?".

  Nothing else moves.

## 14. What is cut

- Life expectancy: it is not a campaign message, and the truth sits on a bar edge.
- The risk histograms (injury, death, abuse, slavery), which have no true value.
- The splits by interest in migrating, by migrant family and by gender (Figs. 9–13, S.2–S.7). The paper says the key patterns hold in each.
- Community norms (Fig. 19).
- The motorbike and Agadez items, the vampire item and the reservation-wage comparison are kept as end-screen facts, not posters. Route knowledge is not a warning. A true "no vampires" poster would need a behavioural assumption we cannot source.

## 15. Divergences

- **Clock.** The real survey took two months; the street takes twelve knocks.
- **People.** Names, ages and faces are invented. Each person answers one question, drawn from that question's reported distribution. No joint distribution across questions is constructed.
- **Benefits.** The monthly figures are the paper's own conversion of weekly amounts.
- **Income truth.** The truth is GNI per capita (2017 USD) as the paper plots it on its € axis, about €2,500.
- **Naira axis.** The figure's ticks are placed at ln(₦) = 9…15, at about ₦415/€. This reproduces every tick label and the paper's €660 median.
- **"About right" band.** The band is ours: ×1.5 for money and ±7.5 points for asylum. The calibration check varies it.
- **"Making it" poster.** It compares a personal belief with a population fact (fn. 34). The paper says an individual could be right; the reveal says so.
- **"Don't know" answers** count as white notes (nothing new), not as warned.
- **Stamp judgement.** PRINT is right if the poster warns more people than it backfires on in the full survey. This is our rule. The check confirms that the right stamps do not change across the band choices.

## 16. Mechanism kind and claim boundaries

**Reconstructed.** The full-survey shares are computed from the read-off histograms and stacked bars. The people at the doors are invented. Each is one random draw from the reported distribution of the one question they are asked. No individual is shown answering two questions, so no joint distribution is constructed.

- **Demonstrates:**
  - where Benin City's answers sat relative to the true values, item by item;
  - how a small street sample can mislead where the city is split (BRITAIN, ASYLUM).
- **Assumes:**
  - the "about right" band;
  - an even spread within histogram bars;
  - that a fact worse than your belief makes the option look worse to you (a statement about beliefs, not behaviour);
  - the stamp rule (print if warned > backfired).
- **The paper establishes:** the distribution of beliefs in a representative 2018 sample of one city. It tests no campaign. The game never says anyone stays or goes.
- **Where each staged discovery comes from:**
  - "Europe posters backfire" follows from the paper's data: under every band, more than 70 in 100 guess below the truth.
  - "Print the journey posters" follows from the data under the designer's stamp rule. A warned-only rule gives the same ranking.
  - "Small samples mislead on mixed items" follows from the paper's spread of answers combined with our budget of twelve knocks. It is presented as a lesson about asking, not as a finding of the paper.
- **The road poster:** the reveal says, at the moment of discovery, that any one person might be right about themselves.

## 17. Calibration plan

`node calibration.js` runs `mechanism.js` unchanged. It checks:

- **A. Read-offs against the text:**
  - the axis fit reproduces the tick labels;
  - the median income guess is ≈ €660 (fn. 37);
  - the directions of error about Europe (pp. 15–16);
  - the asylum truth and mode (fn. 34, p. 24);
  - four in five "likely" (p. 23);
  - pirates are believed more than vampires, and about half believe in vampires;
  - motorbike ≈ 1% and Agadez ≈ ⅓.
- **B. The doors:** 200,000 simulated doors per poster reproduce the survey's shares to within 1.5 points. The note colour matches the spoken (rounded) number. The median door answer is ≈ €660. A street replays exactly from its seed.
- **C. Robustness:** at bands ×1.25/×1.5/×2 (±5/7.5/10 points), the Europe posters backfire on more than 70 in 100 and the right stamps are unchanged. BRITAIN is a near-wash throughout. Under the alternative warned-only rule, Europe and Italy are still the worst.
- **D. Game logic:** 12 knocks; one note per knock; Europe's draft is judged; the best campaign is computed, not typed; stamps lock once sent.
- **E. Budget:** a plain strategy (two knocks per poster) shows the first EUROPE answer is red for most players. The mixed items are stamped right less often.

## 18. Calibration result

All checks pass (`calibration-result.txt`).

- Median EU-income guess: €648 (paper €660). At the doors: €651.
- Full survey, warned / nothing new / backfired, per 100 readers:

  | Poster | Warned | Nothing new | Backfired |
  |---|---|---|---|
  | EUROPE | 2 | 13 | 85 |
  | ITALY | 5 | 7 | 88 |
  | BRITAIN | 33 | 25 | 42 |
  | ASYLUM | 59 | 22 | 19 |
  | THE ROAD | 80 | 20 | 0 |
  | THE SEA | 35 | 65 | 0 |

- The right stamps are print ASYLUM, THE ROAD and THE SEA at every band.
- The first EUROPE note is red for 85% of players.
- With two knocks per poster and "print if green > red", the share of streets that stamp each poster right is:

  | Poster | Stamped right |
  |---|---|
  | EUROPE | 99% |
  | ITALY | 99% |
  | BRITAIN | 73% |
  | ASYLUM | 62% |
  | THE ROAD | 96% |
  | THE SEA | 57% |

  THE SEA is low because two white notes tempt a scrap. The reveal then teaches that a poster which never backfires is worth printing; that is the mastery for the second street.

## 19. Build log

1. **Mechanism, headless.** Re-used the first build's figure read-offs after re-checking them against Figs. 8, 14–17. Wrote new door draws, stamps, judgement and verdict. Calibration passed first time.
2. **Placeholder loop** (`loop.js`, `loop-log.txt`). The campaign total, warned and backfired summed over printed posters, confused: printing the near-wash BRITAIN *raised* "warned" above the best campaign's. So the end screen leads with words, and the per-poster judgement is the yardstick. Scrapping THE SEA gets its own call ("worth printing, since it backfires on no one") instead of a bare "wrong".
3. **Skin.**
   - Bangers and Comic Neue are inlined, about 80 KB, so the file stays self-contained at 160 KB.
   - Playwright could not tap the pulsing Start button (never "stable"). The test forces taps; a finger has no such problem.
   - From the screenshots: the note captions now name the poster's number ("Guessed less than €2,500"), so a stranger sees why a note is red.
   - The "Back to the street (0 knocks left)" button showed because `.btn` overrode `[hidden]`; fixed.
   - The scene and the cards were tightened.
4. **Text.** The aim is on its own line on the start screen, at the top of every play screen, and first in How to play. Every reveal number sits on a note.
5. **Self-review from screenshots.**
   - Can the aim be stated from the start screen alone? Yes: find which posters backfire before they're printed.
   - Can the discovery be stated from the top of the end screen? Yes: the city guessed Europe right or too low; what they got wrong was the road, the asylum odds and their own chances.
   - Does it look like any game in the table? No. It is a sun-yellow comic with gates, balloons and stamps; nothing is cream, newsprint, Commission blue or billboard.
6. **Full browser session** at 380 px (`session-test.js`, `session-log.txt`), covering:
   - 12 knocks;
   - help opened and closed mid-street, with the notes kept;
   - stamping by the notes;
   - the reveal;
   - the verdict;
   - About and back;
   - a retry that stamps without asking (Europe's draft).

   No errors and no horizontal scroll. Session length is estimated at 3–5 minutes; no person has timed it.
