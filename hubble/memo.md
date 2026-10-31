# Design memo — *Hubble's Twelve Nights*

## 0. Given

Mine: the game carries Steffen's signature and counter. Ideas given: "Instrument register, like The Olive: dark sky, the eyepiece and the spectrograph as the instruments, animated and fancy. Otherwise free." This fixes the register family (Instrument) and the two instruments the player holds; it overrides the precedent rule only in that The Olive (the first game in the table, not one of the last three) was also Instrument. The last three were Loud, Drawn and Austere, so the rule is met anyway. Palette, type, buttons and the visual rule are chosen to differ from The Olive's green phosphor as well.

## 1. Paper

Edwin Hubble, "A relation between distance and radial velocity among extra-galactic nebulae", *Proceedings of the National Academy of Sciences* 15 (1929): 168–173. doi:10.1073/pnas.15.3.168. Open access at pnas.org. Only the PDF was available: a scan with an OCR layer. The two tables were transcribed by hand from the scan and checked against the well-known transcriptions of this paper (Table 1's 24 nebulae, Table 2's 22); the OCR had mangled several digits (e.g. "7331 19.0 1.1 + 500" came through intact, "N.G.C. 6822" came through as "N. G. C. 6822 .. 0.214 - 130" intact; the headers were garbled). Figure 1 is the famous plot; its points are Table 1's distances against velocities corrected for solar motion.

## 2. What the paper hands over

**Primary: an estimate.** Table 1: 24 nebulae with a distance r (millions of parsecs) and a measured radial velocity v (km/s), plus, for 14 of them, the photographic magnitude of their brightest stars. A least-squares solution of v = Kr + X cos α cos δ + Y sin α cos δ + Z sin δ, giving K ≈ 465 ± 50 km/s per million parsecs from the 24 objects and 513 ± 60 from 9 groups, with the Sun's motion (X, Y, Z) solved at the same time; Hubble's round value K = 500. Residuals of about 150 km/s, read as the nebulae's own motions. Table 2: 22 more nebulae with velocities only; the relation run backwards gives their distances and absolute magnitudes, whose distribution matches Table 1's. Humason's first far nebula, NGC 7619 at 3779 km/s.

**Secondary: a method, as argument.** Distances come from the brightness of the brightest stars a nebula can be resolved into, on the assumption that the brightest stars in any such nebula are about the same true brightness (M = −6.3); Cepheids for the nearest; the average brightness of nebulae for the Virgo cluster. Velocities come from the shift of absorption lines in the nebula's spectrum. The game puts both instruments in the player's hands.

## 3. The discovery, and its kind

**A counterintuitive result**, and a pattern. Believed in 1929: the nebulae's radial velocities were a puzzle, a "K term" of several hundred km/s that would not sit still, with the sun's own motion through the nebulae confusing the picture; velocity and distance had been suspected of being related, but "so far the results have not been convincing". The paper: once distances are trusted, the velocities line up with them. The farther the nebula, the faster it recedes, about 500 km/s for every million parsecs, and the ones that seem to approach are nearby ones whose approach is mostly our own motion. Hubble himself stops short of saying what it means ("the possibility that the velocity-distance relation may represent the de Sitter effect"). The game ends where he ended.

## 4. The core narrative

Through a big telescope you can see faint smudges of light far beyond our own stars. Some of them are coming towards us and some are going away, and nobody could see any order in it. You have twelve nights at the telescope. Each night you can point at one smudge, work out how far away it is from how bright its brightest stars look, and work out how fast it is moving from how far the dark lines in its light have slid towards the red. Each smudge becomes a dot on a chart. If you only look at the near, bright, easy ones, the dots are a cloud and the chart says nothing. If you spend your nights on the faint, far ones, the dots climb: the farther the smudge, the faster it is going away, and the nearby ones that seemed to be coming towards us were mostly the Sun moving. Then a colleague brings you a smudge far beyond any you measured, and you have to say how fast it is going before he tells you.

## 5. Who lives in the paper

- **Hubble, the observer** — controls which nebula gets a plate, reads brightest-star magnitudes, reads line shifts. Could be asked to anticipate where a new nebula will fall on the chart. *The natural player.*
- **Humason, the spectroscopist** — controls exposure on the faintest objects; the paper's last word is his 3779 km/s.
- **The Sun** — moves at about 300 km/s toward a point in the northern sky; its motion is a confound added to every velocity and is solved for in the same step as K. Could be a hidden layer the player uncovers.
- **The nebulae** — have a distance, a true velocity, a peculiar motion of about 150 km/s; no choice.
- **The instruments** — the 100-inch, the eyepiece/plate on which stars resolve, the spectrograph with its comparison lines. The paper's own instruments; the user asked for them.
- **The reader in 1929** — believes the velocities are random, or a fixed K term.

## 6. Precedent

| Game | Position | Format | Feedback device | Chassis |
|---|---|---|---|---|
| Cantor's Bargain (cantor) | agent (the constructor of E0, in a contest) | strategic | the strike (rows struck in the Lister's book) | fairground bill (Loud): big-top red, cream, ink, brass gold, teal; Rye + Alfa Slab One + Work Sans; ticket buttons |
| Watson's Cardboard (dna) | experimenter (builds the model) | discovery, closed by a real-time copy | the rails (two ribbons bow, pinch, run straight) | cardboard model kit on kraft (Drawn): Permanent Marker + Courier Prime; luggage-tag buttons |
| Einstein's Flower Merchant (einstein) | agent (dispatcher choosing boosters) | discovery, then a committed order book | two clocks and the race of the light beam | Swiss grid poster (Austere): paper, ink, signal red, light yellow; Archivo; flat square ink buttons |

**What this game does differently.**

- **Position: experimenter, with the paper's own instruments.** Watson's Cardboard also seated an experimenter (building a model). This paper plainly wants the seat, and the user asked for the eyepiece and the spectrograph in the player's hands, so the position repeats, and the other three dimensions differ from all three predecessors. What the experimenter does is also unlike the cardboard: this one spends a scarce budget of nights and operates two perceptual instruments, a brightness match and a line match.
- **Format: discovery under a budget.** Twelve nights, one nebula per night, far ones costing more than one night. The deliberation is an allocation (many near or few far), so this has the shape of a challenge, but what is scored is whether the player found the law and could state it, which is the discovery score. Cantor was strategic; Einstein and DNA were discovery without a scarce resource to allocate.
- **Device: the plate (one of our own), with a reveal.** Hubble's Figure 1 drawn live: blank axes at the start, a dot dropped after every night at the distance and velocity the player measured. At the end of the nights, the Sun's motion is taken out and the dots slide to their corrected places. No strikes, rails or clocks.
- **Chassis: an observatory at night** (Instrument family; the last three were Loud, Drawn, Austere, and the only earlier Instrument game, The Olive, was green phosphor). Deep sky, starlight white, amber comparison-arc lines, redshift red, brass. Jost (a 1920s geometric) for dials and display, IBM Plex Mono for readings. Buttons are brass-rimmed instrument plates. A dark screen after a red, a kraft and a paper one.

## 7. The aim and the verdict

**Aim** (start screen, top of play screen, first line of How to play): *Find out whether the far nebulae drift at random or whether their speed is tied to their distance. Twelve nights. Then say how fast.*

**Verdict** (the end screen leads with these, in words):
1. What you did: *You read N nebulae out to about R million parsecs, and you set the rate at about K km/s for every million parsecs.*
2. What the paper says: *Hubble set it at about 500. Your rate was within his two solutions / somewhat high / somewhat low / you called it random.*
3. The test: *Humason's nebula, seven million parsecs out: you said about V, the spectrograph said 3,800 km/s.*
4. What that means: *The farther a nebula, the faster it recedes; the ones that seemed to approach were mostly the Sun's own motion. Hubble stopped there. Others would call it the expanding universe.*

The yardstick during play is the plate itself: after every night the player sees whether the new dot sits on a rising line or in a cloud, and the nights remaining. At the end, the rate in the aim's units (km/s per million parsecs) against Hubble's.

## 8. Three concepts

**A. The Observer (experimenter, discovery under a budget).** Controls: which nebula to point at (tap on the sky), the eyepiece dial (trial distance until the comparison star matches the nebula's brightest star), the spectrograph slide (until the nebula's dark lines sit over the comparison lines). Deliberation: which nebula is worth a night, given what the plate shows so far and how many nights remain; the far ones cost two or three nights. Sees: a dot drop onto the plate. Discovery moment: with two or three far nebulae on the plate, the dots stop being a cloud and climb; then the Sun's motion comes off and the approaching nearby ones turn out to be standing still or receding. Fun: agency (the instruments are under the thumb), anticipation (where will this dot land), discovery (the climb), mastery (a second game spends its nights on the far ones from the start). Replay: a different allocation; the far-first strategy and the near-first strategy produce different plates and different verdicts.

**B. The Sun's Motion (controller, challenge).** The player is handed Hubble's 24 raw velocities on the plate and three dials: the Sun's speed, its direction, and K. Aim: make the residuals as small as possible. Deliberation: trade the Sun against K. Discovery: there is one setting where the cloud becomes a line, and K is not zero. Fun: agency, discovery. Replay: none worth having; the optimum is unique. Dull in the walkthrough: dial fiddling with nothing at stake and no instrument.

**C. The Spectrograph Alone (subject/skill, real time) — the reckless one.** No sky, no plate, no words: a spectrum strip scrolls in; the player drags the comparison lines onto the dark lines against a clock; velocity reads out; a sound rises with the shift. Then a second strip, fainter, with wider lines, from farther away; then a third. After six, the distances are revealed and the six readings are placed on the plate. The player has been doing Humason's job without knowing it. Fun: mastery, anticipation. Discovery arrives only at the reveal, which makes the stretch before it a skill test about nothing. Given up: the wordless screen and the clock. Kept from it: the spectrograph as a drag-to-align instrument whose lines get broad and shallow for faint nebulae, and the last spectrum, Humason's, whose shift is so large the lines nearly leave the frame.

## 9. The first five minutes

**A, the pick.** 0:00. A black screen, stars, a title in brass capitals: HUBBLE'S TWELVE NIGHTS. Under it one line: the aim. A brass plate: BEGIN. The stranger taps. 0:10. The sky: about two dozen small smudges, some bright and large, most faint. Across the top: *Night 1 of 12. Tap a nebula.* A short orientation: the bright ones take one night, the faint ones two or three; nights left shown as twelve lamps. The stranger taps the biggest, brightest smudge (Andromeda, M31). 0:20. The eyepiece: a round field, the nebula resolved into points of light, one of them picked out as THE BRIGHTEST STAR; beside it a comparison star in a small circle and a dial under it marked in millions of parsecs. *Turn the dial until the comparison star is as bright as the brightest star.* They drag; the comparison star dims as the dial runs out; they go back; the two look alike; a thin ring glows. They press READ. 0:45. The spectrograph: a strip of grainy light with two dark lines; under it two amber lines, the comparison. *Slide the strip until its dark lines sit over the amber ones.* They drag; the dark lines slide; they stop over the amber; the readout says *coming toward us, about 200 km/s*. READ. 1:05. The plate: axes labelled DISTANCE and SPEED, one dot low down, left of centre, below the zero line. *One nebula. Nothing to see yet. 11 nights left.* The stranger wonders what the chart is for, and taps the next bright smudge. 1:10–2:30. Three more bright ones: dots cluster low on the left, two above zero, one below. The plate says: *Four nebulae, all nearby. A cloud so far.* The stranger frowns: this is not telling me anything. They look at the faint smudges and the note that one costs three nights. They weigh it: eight nights left, three for one far one. They take it. 2:45. The eyepiece for a Virgo nebula: the field is faint and grainy, the brightest star is barely there; matching is harder. The spectrograph: the lines are shallow and wide, and they are a long way to the right. The readout: *going away, about 900 km/s*. The dot lands far right and high. *The farthest one you have is also the fastest.* They grin. 3:30. Five nights left; they spend them on far ones: two more two-night nebulae and a one-night. The dots climb. 4:30. Nights over. *Something is in the way: the Sun itself moves through space at about 300 km/s. Take it out.* They press; the dots slide; the approaching ones rise to the zero line or above. *Now set the rate.* A dial swings a line up from flat through the dots. They stop it where it fits. COMMIT. 4:50. *Humason has a new nebula, seven million parsecs out, beyond anything you measured. How fast?* The line says about 3,500; they commit. The spectrograph opens: the dark lines slide a very long way right. *3,800 km/s.* 5:10. The verdict.

**B, the runner-up.** 0:00. Title, aim: *Make the cloud a line.* 0:10. The plate with 24 dots and three dials. The stranger moves the first dial (Sun's speed); the dots shuffle up and down. The second (direction); they shuffle differently. The third (K); a line tilts. *What am I doing?* They move things until a number at the bottom, the scatter, is smallest. 1:30. It is smallest near K = 500 and a Sun speed of 300. *So?* The stranger has moved sliders to minimise a number. They did not measure anything, and the one thing they learned, that the dots become a line at a particular setting, is the game telling them the answer with extra steps. Dead by 1:30.

## 10. The pick, and why

**A, The Observer.** The player does what the paper did, with the paper's instruments, under the paper's own constraint (the far nebulae are the ones that settle the question, and they are the hardest to get). Real deliberation: a budget allocation that the paper itself comments on ("new data on more distant objects will be required"). The discovery lands inside the play: the climb of the dots, then the Sun's motion coming off. The sentence afterwards has no "guess": *I measured the nebulae, the far ones were the fast ones, and I set the rate.* Originality: no game in the table has had a perceptual instrument the player reads.

**Author test.** Hubble would recognise his brightest-star criterion with M = −6.3, his K term and solar motion solved together, his Table 1 nebulae, his Figure 1, and Humason's NGC 7619 at the end as the paper's own last word. He would enjoy watching a player waste four nights on bright nearby nebulae and then realise the Virgo cluster is where the answer is. The colleague who knows the answer still has to match the lines, and still has to choose where to spend the nights.

**Runner-up: B.** Switch if the author wants the game to be about the joint solution for solar motion and K, the paper's statistical move, rather than about the observing. It would need a stake, and the walkthrough found none.

**What the reckless concept would have given.** C's wordless real-time spectrograph would have put Humason's craft under the thumb with no text. Kept: the drag-to-align spectrograph, lines that broaden for faint nebulae, and the climactic spectrum whose shift is enormous. Given up: the clock, the sound, and the screen with no words.

## 11. The shape

One session of about five minutes, no retry past the end (a NEW GAME button starts a fresh sky from a new seed).

1. **Start**: aim, BEGIN, How to play, About, signature.
2. **The sky** (returned to after each nebula): the 24 nebulae of Table 1 at their places in the sky, drawn by brightness; nights-left lamps; the plate as a small inset that grows when tapped. Tap a nebula to point the telescope. Costs: 1 night for brightest stars of magnitude under 18, 2 for 18 to 19.4, 3 for fainter and for the Virgo four (our choice: exposure grows with faintness; Hubble notes the far ones are the hard ones and Humason's programme was built for them).
3. **The eyepiece**: brightness match, a dial in millions of parsecs. READ.
4. **The spectrograph**: line match, a slide. READ. The dot drops onto the plate with a line of text in the aim's units: what it did, how the plate looks (cloud / climbing / a line), nights left.
5. **Nights over, the Sun's motion**: one press takes out the Sun's motion (Hubble's 24-object solution, applied; the player does not fit it). The dots slide.
6. **Set the rate**: a dial swings a line from flat (random, no relation) upwards; the readout in km/s per million parsecs. COMMIT. Nothing previews a fit.
7. **Humason's nebula**: the player's line gives a prediction at 7 million parsecs; the player may adjust before committing; then the spectrograph shows the real shift.
8. **End**: the verdict in words, Hubble's plate (Figure 1 redrawn from Table 1 with his line) beside the player's, the signature, NEW GAME, About.

Presets: none; the sky is the paper's 24 nebulae every time. The seed varies the instruments' graininess, the pattern of the lamps, and which nebula the orientation line first points to, not the data. Score: no running total; the rate against Hubble's at the end.

## 12. Controls, mechanism, feedback, moment

- **Controls**: tap a nebula; one dial (eyepiece, trial distance); one slide (spectrograph, shift); one dial (rate); two COMMIT presses; READ buttons.
- **Mechanism**: Table 1 as truth. Brightest-star apparent magnitude m_s from the table where given, else derived from r by the paper's own criterion (M = −6.3); the eyepiece shows the brightest star at brightness ∝ 10^(−0.4 m_s) and the comparison star at the brightness a −6.3 star would have at the trial distance. The spectrograph shows the Ca II H and K lines at 3933.7 and 3968.5 Å shifted by (1 + v/c), with line width and depth scaled by faintness (the paper's remark on wide shallow lines in fainter nebulae); the comparison lines fixed. The Sun's motion: X = −65, Y = +226, Z = −195 km/s with standard-catalogue coordinates for the 24 (not in the paper; tagged). Rate dial 0–1000 km/s per million parsecs. Humason's nebula: r "of the order of 7 million parsecs" from the paper, measured v = 3779, corrected 3910.
- **Feedback**: the dot on the plate, with its sentence. The lamps going out. The dots sliding when the Sun's motion comes off. The line swinging on the rate dial. The spectrograph's lines travelling far right for NGC 7619.
- **Moment**: the first far nebula's dot landing far right and high above the cloud; then the Sun's motion coming off and the "approaching" nebulae rising to zero.

## 13. The look

**Register: an observatory at night** (Instrument family, as given). It comes from the paper's setting: Mount Wilson, the 100-inch, photographic plates, a spectrograph with an iron-arc comparison, a chart drawn by hand in a ledger. Instrument means the data are drawn, not illustrated: the sky is the 24 nebulae at their places, the eyepiece field is the magnitude, the spectrum is the shift, the plate is Figure 1.

- **Palette**: sky `#070B14` (ground); starlight `#E8EEF8` (stars, spectra, text); arc amber `#F2A33A` (comparison lines, the brightest-star ring, dial marks); shift red `#E5484D` (the shift readout, receding dots and arrows, the rate line); brass `#B08D57` (title, rims, buttons, lamps). Blue `#6EA8FF` for "approaching" only, before the Sun's motion comes off.
- **Type**: Jost 600 (SIL OFL) for title, dial faces and labels, in spaced capitals, as if engraved; Jost 400 for text; IBM Plex Mono (SIL OFL) for readings. All embedded as subset data.
- **Buttons**: instrument plates: dark, a 2 px brass rim, 8 px radius, brass spaced capitals; the primary action (READ, COMMIT, BEGIN) filled brass with sky-coloured capitals. Pressed, they invert. Dials are horizontal brass-marked sliders with a large thumb, 56 px high.
- **The one visual rule**: everything the player measures is light on one dark glass: the sky, the eyepiece field, the spectrum and the plate are all the same black, and colour means only three things: amber is the comparison, red is the shift, brass is the instrument.
- **Play screens at 380 px**: the sky, 380 × 420, nebulae as soft discs of 6–18 px by brightness with name on tap, and 12 brass lamps in a row (answers "where can I point, and what will it cost?"); the eyepiece, a 300 px round field with a 60 px comparison circle at the lower right and a 56 px dial (answers "how far?"); the spectrograph, a 340 × 120 strip over a 340 × 40 comparison strip, a 56 px slide, a mono readout (answers "how fast, which way?"); the plate, 340 × 260, two axes in starlight, dots 10 px, red above zero and blue below, the player's line in red (answers "is there a pattern?").

## 14. What is cut

Table 2 (22 nebulae with velocities only; distances derived from K; the matching distributions of absolute magnitudes), mentioned in About as the paper's check. The two solutions (24 objects, 9 groups): the game uses the 24-object solar motion and lets the player set K. The Cepheid distances for the nearest six and the cluster-luminosity distance for Virgo: the game's eyepiece reads every nebula by the brightest-star criterion, with the table's r as truth. Lundmark's earlier solution; the galactic rotation remark; the de Sitter discussion beyond one line on the end screen. The measured magnitudes of whole nebulae (m_t) and their absolute magnitudes.

## 15. Divergences

- **Clock**: Hubble's programme ran over years; the game compresses it to twelve nights and makes nights the scarce resource. Our choice, to create the allocation the paper comments on.
- **Costs**: 1, 2 or 3 nights by brightest-star magnitude. Our choice; the paper says only that fainter means harder.
- **Distances**: all by brightest-star match, including the six Hubble did by Cepheids and the four Virgo nebulae he did by cluster luminosity. The dial reads the table's r for every nebula; where the paper gives no m_s it is derived from r. Declared on About.
- **Solar motion**: applied from Hubble's solution with catalogue coordinates, not solved by the player. Declared. The coordinates are not in the paper.
- **Measurement noise**: the player's readings are their own; the instruments add no noise beyond what the player's matching produces; faint nebulae are harder to read because their stars are faint and their lines are shallow (paper). The game has a tolerance ring that glows when the match is within reading accuracy; the reading is the player's, not snapped.
- **Values**: Hubble's distances are about seven times too small by today's measurements (the Cepheid zero point and the confusion of brightest stars with gas clouds), and today's rate is about 70 km/s per million parsecs. The game runs on the paper's numbers and the end screen says so in one line.
- **Payoff**: none invented; the verdict compares the player's rate to the paper's and their prediction to Humason's measurement.

## 16. Mechanism kind and claim boundaries

**Reconstructed.** The game runs on Hubble's Table 1 as truth (24 nebulae, distances and velocities), the paper's brightest-star criterion (M = −6.3) for the eyepiece, the first-order Doppler shift of Ca II H and K for the spectrograph, and the paper's own 24-object solution for the Sun's motion. Nothing is simulated beyond the player's own readings.

- **Demonstrates:** the pattern in Table 1; that the Sun's motion accounts for the nebulae that seemed to approach; that a plate needs near and far nebulae together to show the relation; Humason's NGC 7619 as the paper's own test.
- **Assumes:** the twelve nights and the 1/2/3-night costs (ours); the eyepiece reading every nebula by the brightest-star rule; catalogue coordinates for the solar-motion term; the tolerance rings; Humason's nebula at the paper's "about 7 million parsecs" cluster distance.
- **The paper establishes:** a roughly linear relation among these nebulae with K ≈ 500 km/s per million parsecs on its distances and a solar motion of about 300 km/s; not the meaning of the relation (Hubble left it open), and not today's constant (his distances were about seven times too short).

**Which discoveries follow from the paper and which from the rules.** The climb of the dots and the effect of the Sun's motion follow from Table 1 and the paper's solution; the calibration recovers both from the table. The lesson that *Virgo-only shows nothing* follows from the data (all four at 2.0 million parsecs) and not from our costs. The lesson that *near-only shows a cloud until the Sun comes off* follows from the data too (raw correlation 0.42 among the eleven cheapest, 0.75 corrected). What the rules add is the scarcity: that the far nebulae cost more. Robustness: with 9 or 15 nights instead of 12 the mixed strategy still shows the relation (checks H5), and over 300 seeds of reading noise within the rings the mixed strategy's K stays within 300–600 (H6).

## 17. Calibration plan and result

Plan: (P1) the brightest-star criterion reproduces Table 1's distances from its m_s column within 12%; (P2) Hubble's four-unknown solution on Table 1 with catalogue coordinates reproduces K = 465 ± 50, X, Y, Z within their printed errors, V0 ≈ 306, residuals ≈ 150; (P3) the through-origin fit on corrected velocities lands in the span of his two solutions; (P4) NGC 7619: 3779 corrects to about 3910, and 3910/500 = 7.8, M = −17.65; (P5) the spectrograph round-trips and 1000 km/s moves K by 13 Å; (P6) correction removes the approaching nebulae; then costs, budget, heuristics, words, seeds.

Result (`calibration-result.txt`): **45 passed, 0 failed.** The four-parameter solution on the transcribed table gives K = 465, X = −69, Y = +235, Z = −200, V0 = 317, mean residual 150, against the paper's 465, −65, +226, −195, 306, 150.

Heuristics (noisy readings within the rings; K through the origin after the Sun's motion is taken out):

| strategy | nebulae | farthest | K | corr |
|---|---|---|---|---|
| nearest and cheapest first | 11 | 0.86 | 502 | 0.75 (raw, before the Sun: 0.42) |
| farthest first (= the four Virgo) | 4 | 2.26 | 393 | 0.01 |
| alternate far and near | 6 | 2.25 | 360 | 0.99 |
| random order | 5 | 2.25 | 394 | 0.57 |
| all 24, exact (Hubble's table) | 24 | 2.00 | 465 | 0.84 |

The decisions matter: the same twelve nights give a plate that shows nothing, a plate that shows the relation only after the Sun's step, or a plate that shows it plainly. Budget and costs were kept at 12 and 1/2/3 after this table; the memo's plan of "far ones cost more" survived, and the far-first trap (all at one distance) was added to the plate's words.

## 18. Build log

1. Mechanism headless (`mechanism.js`), calibration (`calibration.js`) run in Node: 45/45 after two rounds. The first run exposed the Virgo-at-one-distance fact and the near-only-after-Sun fact; the plate's words and the verdict were rewritten to say both honestly.
2. Loop on placeholders (`loop.js`, `loop-log.txt`): seven nights, the Sun, the rate, Humason, the verdict; every action changes the printed plate and says what happened.
3. Skin: observatory at night; Jost 600/400 and IBM Plex Mono subset and embedded; brass-rimmed plates for buttons; sky, eyepiece, spectrograph and plate on one dark glass. `build.py` inlines the mechanism verbatim and checks it byte for byte.
4. Text: distances and speeds in words or rounded to 50; the verdict leads in words; About with kind and the three claim lines.
5. Screenshots at 380 px: `screenshot-*.png`. Fixes from them: plate margin for the "1000" tick, axis labels moved off the ticks, duplicate SVG gradient ids across hidden screens (Humason's strip had lost its continuum), the marker label.
6. Browser session (`session-test.js`, `session-log.txt`): three near then three far nebulae, help opened from the eyepiece and returned to it, the Sun step, the rate at 470, the prediction, Humason's spectrum, the verdict, About and back, a new game. No page errors (the visitor counter's script is blocked in the sandbox, as expected); no horizontal scroll at 380 px. Length about five minutes, estimated.

Self-review: the aim can be stated from the start screen alone; the discovery ("The farther, the faster.") from the top of the end screen alone; the look resembles no game in the table.

## 19. Revisions after play

A first play found the instruments felt like guessing: the task was not self-evident from the picture, and nothing afterwards said whether a reading had been close. Five changes, in the order given:

1. **Eyepiece as a split field.** One round field split down the middle: the nebula's brightest star on the left, the comparison star on the right, both large, each with a halo that grows and shrinks with brightness. The dial drives the right half only and is labelled "comparison star's distance", so fainter-means-farther stays the player's inference. The frame glows when the halves match within the ring tolerance; the reading is still the player's.
2. **Spectrograph bars and bracket.** The two calcium lines are now thick dark bars over a quiet continuum (grain only for faint nebulae, bars broader and shallower there, never lost). The lamp marks are an amber bracket at the same spacing, so the task reads as "fit the bracket over the bars"; bracket and frame glow when they sit together. A faint dashed outline shows where the bars would sit if the nebula stood still, and "redder →" sits on the frame, so the shift is a distance travelled.
3. **Night one shows before it asks.** On the first night only, the eyepiece runs itself for about two seconds (comparison star flares, fades, settles mid-way) under one line, "Turn the dial until the halves match"; the spectrograph slides the bracket across once and back under "Slide the bracket onto the dark bars". Controls are disabled during the demonstration and handed over after. From night two the full orientation returns and nothing demonstrates.
4. **Hubble's reading after the player's.** When the player's dot lands, a dotted amber dot fades in where Table 1 puts that nebula (never before the reading). Hubble's dots then stay under the player's on the sky's small plate, the Sun screen (they move with the correction), the rate screen and the end screen. The verdict's first line now ends with one sentence from the mechanism comparing the two plates in words: "your dots sat on his", "your distances ran short/long", "your far ones ran fast/slow" (thresholds: 0.04 dex in distance, 60 km/s in speed; CONFIG-adjacent in `comparisonWords`).
5. **The plate describes, the verdict concludes.** Until the rate is set the plate's words only describe: "Your farthest dot is also your highest", "Three nebulae, all nearby. A cloud so far", "The dots rise from left to right, with some scatter", "all at about the same distance". "The farther, the faster" appears only as the verdict's headline. A calibration check (W2c) plays sixty random games and asserts the plate never uses "faster", "relation" or "tied" before the verdict.

Calibration after the revision: 50 passed, 0 failed (five new checks on the descriptive words, Hubble's points and the comparison sentence). Browser session rerun with the demonstrations: no page errors, no horizontal scroll at 380 px; new screenshots `screenshot-eyepiece-demo.png`, `screenshot-spectrograph-demo.png`, and the plate with Hubble's dotted dots in `screenshot-plate-first-far.png`.

## 20. Second revision after play: the instrument leaves the judgement to the player

The first revision made the instruments grade the player in real time: a glow and "the halves match" or "on the bars" as soon as the dial came within tolerance. That took the judgement away from the player, who then hunted the glow instead of looking. Changed, and nothing else:

- **Eyepiece.** The readout shows only the dial's distance in words. No "right half fainter", no "the halves match", no ring glow and no amber state during play. READ THE DISTANCE is always enabled; the player reads when they judge the halves alike, and the mechanism records whatever distance the dial is at.
- **Spectrograph.** The readout shows only the speed and its direction. No "on the bars", no bracket or frame glow during play. READ THE SPEED is always enabled; the reading is wherever the bracket sits.
- **The plate.** The player's reading error is now real. Hubble's dotted dots still appear under the player's after each reading, and the verdict's comparison sentence is derived from the actual gap between the player's readings and Table 1 (near his / distances ran short or long / far ones ran fast or slow; thresholds 0.04 dex and 60 km/s), in words. Two new calibration checks feed deliberately long-and-slow and small-error readings through it.
- **Night one.** The demonstrations keep their glow and their one-line captions ("Turn the dial until the halves match", "Slide the bracket onto the dark bars"), unchanged; the glow is tied to a flag that is true only while a demonstration runs. After night one nothing on screen says whether a match is right. The match tests in the mechanism remain, for the demonstration only, and their config lines say so.

Reason: the instrument explains itself once and then leaves the judgement to the player, as it did for Hubble. A reading is an act of judgement with a consequence on the plate, not a target to hit.

Calibration after this revision: 52 passed, 0 failed. The session script no longer relies on any match state: the scripted player sets each dial to the true value times a small deliberate error, checks that the readouts carry no match words, that no glow is visible during play, and that both READ buttons are enabled after the demonstration; no page errors, no horizontal scroll at 380 px.

## 21. Third revision after play: the instrument's parts, assembled in front of the player

The previous version hid the spectrograph's rest position in a faint dashed outline that nobody could see, and the eyepiece's dial was a bare number. The player must see the instrument's parts and own the judgement. Changed, on the two instruments only:

- **Spectrograph: a sandwich, no ghost.** Three touching bands: a thin lamp strip above, the nebula's strip between, a thin lamp strip below. The lamp's two calcium lines are strong amber and run the full height of both lamp strips, directly above and below the nebula's dark bars, so the bars' displacement is visible at a glance against them. The dashed rest-position outlines and the separate lamp strip at the bottom are gone. The bracket became crosshairs: two uprights at the calcium spacing through all three bands, starting on the amber lines. The slider is labelled "measuring screw"; its readout is the screw's reading as a speed with direction ("about 250 km/s, coming toward us"), from "zero" at the amber lines (`screwWords` in the mechanism). Faint nebulae keep broader, shallower bars with some grain; the bars stay the darkest thing in the strip.
- **Eyepiece: the comparison star moves.** The dial is labelled NEARER ← COMPARISON STAR → FARTHER and starts at the far end; the readout says where the star has been put ("comparison star at about a quarter of a million parsecs"). The star brightens and grows as it comes nearer, fades and shrinks as it goes farther. The orientation, every night from night two: "Through the eyepiece the nebula breaks into stars. The brightest star of any such nebula is about as bright as any other's, in truth: it looks faint only because it is far. Beside it, a comparison star just like it, which you can bring nearer or push farther away."
- **Night one: each instrument assembles in three pictures, one tap each.** Eyepiece: (1) the field with the nebula resolved and its brightest star ringed ("Through the eyepiece the nebula breaks into stars. The ringed one is its brightest."), tap *Add a comparison star*; (2) the split field with the comparison star on the right and the orientation sentence, tap *To the dial*; (3) the dial, readout and READ THE DISTANCE, no further text. Spectrograph: (1) the lamp strip alone ("Calcium, from a lamp in the lab. The lamp does not move, so this is where calcium's lines sit at rest."), tap *Now the nebula*; (2) the nebula's strip slides in between two lamp strips, bars visibly offset ("The same calcium, in the nebula's light. The bars have moved."), tap *Measure it*; (3) the crosshairs on the amber lines, the screw, the readout at zero ("Turn the measuring screw. The readout is how far the crosshairs have travelled, as a speed."), READ THE SPEED enabled. The self-running demonstrations of the earlier revision are gone. From night two both instruments appear assembled with their orientation line.
- **Unchanged:** no match words, no glow, READ always enabled once the instrument is assembled; nothing on the play screens says where the dial or the crosshairs belong; Hubble's dotted dots after each reading; the plate describes and the verdict concludes; signature, counter, register, palette; no decimals. Help carries the full procedure for both instruments. The match tolerances remain in CONFIG only as the reading error assumed by the heuristics.

Calibration: 53 passed, 0 failed (one new check on the screw's readout). The session script taps through both night-one stagings, screenshots each of the three pictures for each instrument (`screenshot-eyepiece-stage1/2/3.png`, `screenshot-spectrograph-stage1/2/3.png`), then plays six nights by its own judgement; it asserts no match words in the readouts, no glow and no dashed outline in the strip, and both READ buttons enabled; no page errors, no horizontal scroll at 380 px.

**Fourth revision, wording only:** the later nights' spectrograph line no longer says where the crosshairs belong; "plate" is the photograph only and the diagram of dots is "the chart" everywhere (screens, Help, mechanism words, verdict); the rate control is "the ruler", laid through the dots; Humason's is "the faintest spectrum yet taken". Calibration 53/53, session rerun, screenshots refreshed.
