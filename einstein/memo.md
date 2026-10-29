# The Light Post — design memo

*Paper-to-game, beta. Built in one run from the PDF alone.*

## 1. Paper

A. Einstein, "On the Electrodynamics of Moving Bodies", 30 June 1905. Originally "Zur Elektrodynamik bewegter Körper", *Annalen der Physik* 17:891–921 (1905), doi:10.1002/andp.19053221004. Available: the 1923 English translation by Perrett and Jeffery (Methuen, *The Principle of Relativity*), as edited by John Walker (Fourmilab, 1999), with his corrections of the 1923 typesetting errors. A clean transcription, so equations were read off text, not OCR'd. No code or data; the paper has none. Page numbers below are the 26-page PDF's.

## 2. What the paper hands over

**A model**, primary: two postulates (the principle of relativity; light always moves at *c* in the stationary system, whatever the source does, §2 p. 3) and what follows from them by derivation. The kinematical part (§§1–5) gives:

- §1, clock synchronisation by light signals: B's clock is set so that t_B − t_A = t′_A − t_B (p. 3).
- §2, the relativity of simultaneity: on a moving rod, the light takes r/(c − v) out and r/(c + v) back, so clocks synchronous in one system are not in the other (p. 5).
- §3, the Lorentz transformation τ = β(t − vx/c²), ξ = β(x − vt), β = 1/√(1 − v²/c²) (p. 9).
- §4, the physical meaning: moving bodies shorten by √(1 − v²/c²) along the motion (p. 10); a moving clock runs slow, τ = t√(1 − v²/c²) (p. 10); a clock carried away and brought back lags behind one that stayed (p. 11).
- §5, the composition of velocities: V = (v + w)/(1 + vw/c²) (p. 12). Two velocities below *c* always compose to one below *c*, and such parallel transformations "necessarily form a group".

The electrodynamical part (§§6–10) gives field transformations, Doppler and aberration, radiation pressure, and in §10 the kinetic energy of the electron, W = mc²(1/√(1 − v²/c²) − 1), which is infinite at v = c (p. 24).

**Secondary**: nothing estimated. The paper's numbers are formulas. Calibration therefore means "the game computes the paper's equations exactly", not "reproduces a reported estimate".

## 3. The discovery, and its kind

**A counterintuitive result**, the strongest kind. Everyone believed two things that the paper takes apart. First, that speeds add: half the speed of light on top of half the speed of light is the speed of light. §5 says it is four-fifths, and no pile of sub-light speeds ever reaches *c*. Second, that time is one thing for everyone: a clock carried on a journey and the clock that stayed home agree. §4 says the travelling clock comes back behind, by an amount that grows without limit as v approaches *c*.

Underneath both sits the paper's conceptual core, the relativity of simultaneity (§2). The pick plays the two consequences above; simultaneity is the runner-up's subject and is named on the About page.

## 4. The core narrative

You run a post office that sends flowers to faraway stars. Your rockets are built from boosters, and each booster you fire makes the rocket go half as fast as light, faster than it was already going. So two boosters should make it as fast as light. They don't. However many you fire, a beam of light sent at the same moment always gets there first. But something strange happens to what is inside the rocket. The flowers age more slowly than the people waiting for them, and the more boosters you fire, the more slowly they age. With enough boosters you can carry fresh flowers to a star a hundred years away. The people who ordered them will have waited a hundred years.

## 5. Who lives in the paper

- **The clock-setter at A and B** (§1). Controls the reading B's clock is set to. Could anticipate: what setting makes the clocks "agree"?
- **The moving observers on the rod** (§2). Run the same procedure on a moving rod and get a different answer. Could anticipate: will their clocks agree with the platform's?
- **The light ray.** Has no choices; that is the second postulate.
- **The moving system k**, a body given velocity v. Controls v. In §5 a point moves inside k with velocity w: one moving body launched from another. Could anticipate: how fast, all told?
- **The clock carried round a closed curve** (§4) and the clock that stayed. The traveller controls speed and route. Could anticipate: how far behind will it come back?
- **The electron** (§10), accelerated through a potential. Controls nothing, but its kinetic energy is the price of speed.

## 6. Precedent

The three most recent builds:

| Game | Position | Format | Feedback device | Chassis |
|---|---|---|---|---|
| Live from Brussels (rauh) | subject (the reader, on air) | arcade (timed skill run) | the drum, plus a fill of lit windows | TV studio at night (Techno): black, prompter white, on-air red, amber; Inter Display + JetBrains Mono; LED console keys |
| Ask First (benin) | experimenter (the enumerator) | challenge driven by discovery | the note wall | comic strip on sun yellow (Loud): Bangers + Comic Neue; slab buttons with hard offset shadow |
| Home Judges (homophily) | controller (seats a panel) | blind build, then challenge | the fill (two jars of stars) | board game on dark indigo (Retro): Bungee + Rubik; sticker buttons with hard offset shadow |

**What this game does differently.**

- **Position: agent.** The player is the dispatcher who fires the paper's moving system k: they choose how many times it is boosted, the v of §4 and the w of §5. None of the last three was an agent.
- **Format: discovery.** A test range where the player fires rockets and watches what boosters actually do (probe, conjecture). Then an order board where every rocket is committed blind and judged when it lands: prediction, scored by deliveries. The last three were arcade, challenge and build-then-challenge. The order board borrows the shape of a challenge (a budget), so this is the honest overlap. But its score is whether the player's conjecture about the law was right, which is the discovery format's score.
- **Device: two clocks.** Every landing stops two station-clock faces side by side: the home clock and the cargo clock. Behind them is **the race**: a beam of light is launched with every rocket and always lands first. There are no drums, fills, jars or note walls.
- **Chassis: a Swiss grid poster** (Austere family; the last three were Techno, Loud and Retro). Off-white paper, black ink, one signal red and a light yellow. Archivo, embedded, heavy and wide for display, medium for text. Flat black rectangles with square corners and no shadow. After two dark screens, a light one.

## 7. The aim and the verdict

**Aim** (start screen, top of every play screen, first line of How to play): **Deliver the flowers on time and still fresh.**

"On time" is a home-clock deadline; "fresh" is a cargo-clock limit. The yardstick on each order card is in exactly these units: a deadline ring on the home clock and a wilt ring on the cargo clock. When a rocket lands, the two clock hands stop either inside their rings or past them, for that order, right then.

**Verdict** (end screen leads with):
1. What you did: "You delivered N of 4. Your rockets never caught the light, and the flowers came out younger than the people who ordered them."
2. What the paper says: "Einstein, 1905: speeds don't simply add. Half light speed on top of half light speed is four-fifths, and nothing ever catches light. A clock that travels runs slow, and the faster it goes, the slower it runs."
3. What that means: "The light limit binds the people waiting. It doesn't bind the traveller: with enough boosters, a crossing of any length can be short on the clock that goes."

## 8. Three concepts

**A. The Timekeeper** (controller; discovery). The player sets the hands of station clocks along a line, using the paper's own §1 rule: flash from A, the bounce at B, the return to A. Act 1 on a platform at rest; the player learns to set B at the midpoint. Act 2 aboard a carriage moving at a large fraction of *c*. The player runs the identical procedure and is told the carriage's clocks now agree. Then the carriage passes the platform's clocks, and the platform photographs it: the rear clock is ahead. Act 3: "fire both lamps at the same moment", judged by a guard on the train and one on the platform. You can't satisfy both. *Controls*: a clock hand to set; two lamp buttons. *Deliberation*: where to set the hand; when to fire each lamp. *Moment*: the photograph of two clocks the player set honestly, out of step. *Fun*: discovery, agency. *Replay*: a different speed and a different judge. Weakness: act 1 is a procedure, not a choice, and the setting is "correct by definition", which a stranger may find arbitrary before it is surprising.

**B. The Light Post** (agent; discovery: probe, then commit). Pick, described below. *Controls*: one: how many boosters (0–6) per rocket. *Deliberation*: is it worth another booster? Will it get there in time? Will the flowers keep? Is this order possible at all? *After*: the rocket races a light beam, then two clocks stop. *Moment*: the first launch with two boosters. The player expects light speed, and the beam pulls away. *Fun*: anticipation (every launch is a wait), discovery, mastery (round 2 is planned with the law in hand). *Replay*: a second order book with different traps; the long-haul order.

**C. Same Moment** (subject; real time; **the reckless one**). No words on the play screen. The player is the passenger in the middle of a carriage; two lamps at its ends flash; the player taps when they see each flash. The carriage speeds up between runs. A second figure stands on the embankment and taps too. The two tap-strips are shown one above the other: at rest they align; at speed the embankment's strip shows the rear flash first and the player's shows the two together. Then the roles swap. *Controls*: one tap. *Deliberation*: little. It is perception and reaction, and the "aha" comes from comparing strips. *Moment*: two honest witnesses, two orders of events. *Fun*: discovery, a bit of skill. *Replay*: weak. Weakness: the player's taps add noise to a result that is purely kinematic, so the skill is fake. And the light delays in a real-time picture would have to be so slow that the "paradox" looks like a video lag.

## 9. The first five minutes

**B, The Light Post (pick).**

- *0:00.* A white poster. Big black type: THE LIGHT POST. One red line: *Deliver the flowers on time and still fresh.* Below it, two sentences: "Each booster makes your rocket go half as fast as light, faster than it was going. Light itself is the yellow line." One black button: OPEN THE TEST RANGE. I press it.
- *0:15.* A track runs across the screen: HOME at the left, a star called POST 1 at the right, "4 light-years: light takes 4 years". Below are two clock faces, HOME and FLOWERS, both at 0. A booster counter has a big + and −. A note says "Two boosters: half light speed, then half again." I think: two halves, so light speed, 4 years. I press + twice and LAUNCH.
- *0:25.* A yellow line shoots out, and the red rocket follows, visibly behind. The yellow arrives at 4 years. The rocket lands a moment later: HOME clock stops at 5 years. FLOWERS stops at 3. Two surprises at once. Why not light speed? And why are the flowers younger? I frown. The card says: "Two halves made four-fifths of light speed, not light speed."
- *0:50.* Obviously: more boosters. Three: 4.3 years; the gap is smaller. Five: 4.03. I can't catch it. But the FLOWERS clock dropped from 3 to 1.6 to half a year. The log at the bottom fills a row per booster count I have tried: speed bar, home time, flower time. I start to see it: each booster barely adds speed, but it slows the flowers' clock more and more. I grin at the six-booster shot: four years at home, 3½ months in the box.
- *2:00.* NEXT: THE ORDER BOOK. Four order cards, 11 boosters in the crate. One wants roses 10 light-years away within 11 years, and they wilt after 2½ years. One wants a letter 6 light-years away within 5 years. My Newton brain says three boosters is one and a half light speed, so easy. Then I remember the beam. Light needs 6 years. Impossible. I leave it at zero. Is that allowed? The card says "leave it empty to refuse it". Good.
- *3:00.* I have to split 11 boosters across the other three. The far one (20 light-years, fresh for 3 years) needs a lot: from my log, five boosters slow the flowers about eight times. The near one needs two. That's 2 + 4 + 5 = 11. Tight. I commit: LAUNCH ALL.
- *3:30.* The rockets go one by one, each racing its own yellow beam. Each lands; the two clocks stop inside or past their rings. My roses arrive at 10¼ years, fresh at 2¼ years: inside both rings, by a whisker. Yes.
- *4:30.* The end screen: 3 of 4, with the refusal counted as right. The three lines of verdict. A button: THE LONG HAUL. One order: 100 light-years, fresh for 10 years. I know it's possible now. Six boosters. Home clock: 100.3 years. Flowers: 7½ years. "Everyone who ordered these is gone. The flowers are fresh."

**A, The Timekeeper (runner-up).**

- *0:00.* A platform, two clocks A and B, and a lamp at A. "Set B so the clocks agree." I fire the lamp, the light crawls to B and back. A's clock read 0 at the flash and 8 when it returned. Where do I set B? 4, I suppose. I drag B's hand to 4. "Synchronised." Fine, but I was told the answer by common sense; it doesn't feel like a discovery.
- *1:00.* Now the same on a carriage moving right at three-fifths light speed. I flash from the rear. The light chases the front, the bounce comes back fast. I set the midpoint again; the carriage crew says "synchronised".
- *2:00.* The carriage passes the platform's clocks; a camera on the platform snaps both carriage clocks at one platform moment. Rear reads 6, front reads 3. I grin: I did it right twice and they disagree. But I'm also unsure who is "right", and the game has to tell me that nobody is.
- *3:00.* The lamp task: two judges, two lamps. I tap, I fail one judge, I retime, I fail the other. After three tries I understand I can't win. That is the point, but it's a frustration loop rather than a plan.

Verdict: A has the paper's deepest idea and a beautiful photograph, but its deliberation is thin (the right setting is "by definition") and act 3 is designed to be unwinnable. B has a real plan in it and two surprises that land in the first thirty seconds.

## 10. The pick, and why

**B, The Light Post.** It is the one concept where the player makes a real allocation with the paper's law in hand, can be wrong in a way the paper predicts (refusing the impossible order, under-boosting the far one), and gets better between round 1 and round 2 for a reason they can say. Both discoveries land on the very first launch. The player's sentence afterwards: "I fired two half-light boosters and still lost to the light, but my flowers came home young." That is §5 and §4 in one breath, without "guess".

**Author test.** Einstein would recognise his §5 group property: every booster is the same transformation, applied again in the rocket's own frame. He would also recognise the clock carried away that comes back slow (§4, p. 11). The colleague who sent the paper knows the answer and still has to plan an order book.

**Runner-up: A, The Timekeeper.** Switch if the author wants the game to be about simultaneity, the paper's conceptual centre, rather than its two famous consequences. It would need a better act 3 than "two judges you cannot both please".

**What the reckless concept would have given.** C, Same Moment, would have put the relativity of simultaneity into the player's own perception, with no words at all. It was given up because the player's taps would be noise on a purely kinematic result: a skill that changes nothing.

## 11. The shape

Three screens of play, about five minutes:

1. **Test range.** One destination, 4 light-years, deadline 5 years, flowers last 3 years. Free launches with 0–6 boosters, as many as the player likes. A log row is added for each booster count tried. The first launch is pre-suggested at two boosters ("two halves"), not forced. NEXT appears after the first launch.
2. **Order book.** Four orders, a crate of 11 boosters, all committed blind, launched together, judged one by one. One order is impossible (light itself would be late). Its correct play is zero boosters. Two presets (order book A, then order book B on replay); both are game choices built on the paper's equations.
3. **The long haul** (encore, from the end screen). One order: 100 light-years, deadline 101 years, fresh for 10 years.

The score is deliveries made out of 4, with a correctly refused impossible order counted as one. The end screen leads with the verdict in words; the tally is secondary.

## 12. Controls, mechanism, feedback, moment

- **Control:** one per rocket, the booster count, 0–6, set with big − and + keys. On the order book, one counter per card plus a crate showing what is left.
- **Mechanism** (`mechanism.js`, the paper's equations exactly):
  - Speed after n boosters: v_n = (v_{n−1} + w)/(1 + v_{n−1}w/c²) with w = c/2 (§5, p. 12). Every booster applies the same §5 composition in the rocket's current frame.
  - Arrival on the home clock: t = d/v_n. The far station's clock is synchronised with home's by §1, so "the station's time" is the home clock (stationary system K).
  - Elapsed on the cargo clock: τ = t·√(1 − v_n²/c²) (§4, p. 10).
  - A light beam fired at launch arrives at t = d/c (postulate 2).
  - Zero boosters means the rocket stays home and the order is refused.
- **Feedback:** the race on the track (yellow beam, red rocket, same start); then two clock faces stop, HOME and FLOWERS, each with its order's ring; a stamp, DELIVERED, LATE, WILTED or REFUSED.
- **Moment:** the first two-booster launch. The beam lands at 4, the rocket at 5. The cargo clock reads 3.

## 13. The look

**Register:** a Swiss grid poster (Austere). It comes from the paper's own picture and setting: synchronised station clocks (§1, the "7 o'clock" train of p. 2), drawn the way Swiss railway posters draw them, and Bern, where the paper was written. Austere means the register, not the journal: big type, hard grid, one loud colour.

- **Palette:** paper `#F2EEE5`; ink `#111111`; signal red `#E2231A` (the rocket, the cargo clock, the aim); light yellow `#FFC800` (light, always and only); fog grey `#9C978C` for rules and rings.
- **Type:** Archivo (SIL OFL), embedded as two subset instances: Extra Bold at 112% width for display and big numerals, Medium for text. Numerals are tabular.
- **Buttons:** flat ink rectangles with square corners, white uppercase type, no shadow and no outline. Pressed, they turn signal red. The +/− keys are 64 px squares.
- **The one visual rule:** yellow is light and nothing else; red is what you sent and nothing else. Everything else is black on paper.
- **Play screen**, top to bottom at 390 px:
  - aim line in red, small, with ? at the right (32 px);
  - the track, full width, about 90 px: HOME dot, destination star, yellow beam, red rocket, and a tick for every light-year. It answers "who gets there first?";
  - two clock faces, about 150 px each, side by side, with the order's rings in grey and the hands in black (home) and red (flowers). They answer "how long did it take, for whom?";
  - booster keys and LAUNCH, about 70 px;
  - the log: up to 7 rows, each a speed bar against a yellow light-speed tick, plus home and flower years. It answers "what does one more booster buy?".

  On the order book, four cards replace the track and clocks. Each card has the destination, a mini track and both deadlines drawn as rings on two mini clocks.

## 14. What is cut

- The electrodynamical part entirely (§§6–9): field transformations, magnet and conductor, Doppler, aberration, radiation pressure.
- Length contraction (§4) is not used in play. It could draw the rocket squashed, but the player does nothing with it.
- The relativity of simultaneity (§2) is not played. It is the runner-up's subject and named on the About page.
- §10's kinetic energy is not the cost of boosters. Boosters are identical stages, each a §5 composition; the energy grows without limit as v → c, which the About page says.
- Acceleration, braking and the return journey: rockets fly by and drop the flowers.

## 15. Divergences

- **Boosters are identical stages of w = c/2 in the rocket's own frame.** This is the §5 composition applied repeatedly, using the group property the paper states. The stage size c/2 is ours, chosen so that "two halves" is the natural wrong intuition.
- **Instant boosts, coasting flight, no braking.** §4's clock result is for uniform motion; the turnaround and acceleration phases are dropped. Flowers are dropped in passing.
- **Distances in light-years, times in years.** The paper uses general units; we pick the ones that make c = 1.
- **Orders, deadlines and wilt times are invented** to make the trade-offs bite. Every outcome is computed from the paper's equations.
- **The flowers' clock.** Flowers age by their own time. That is §4's moving clock applied to a living process, the reading the paper's "balance-clock" remark invites. The paper itself speaks only of clocks.

## 16. Mechanism kind and claim boundaries

**Ported.** `mechanism.js` computes the paper's equations exactly: §5 composition for each booster, t = d/v on the home-synchronised station clock (§1), and τ = t√(1 − v²/c²) for the cargo (§4).

- **Demonstrates:** what the paper's equations say about a rocket boosted repeatedly by the same amount in its own frame, and about the clocks it carries, in this model.
- **Assumes:** instant boosts; steady flight; no braking or return; a booster size of c/2; the flowers ageing by their own clock (the paper speaks only of clocks; the About page says so, and the long-haul verdict says "the paper speaks of clocks; this game lets the flowers keep time the same way").
- **The paper establishes:** these relations as consequences of its two postulates. Experimental confirmation came later and is not claimed by the game; the game's outcomes are the equations' outputs, not evidence for them (About page).
- **Where each discovery comes from.**
  1. "Two halves make four-fifths" and "nothing catches light": from the paper (§5).
  2. "Each booster adds less speed but slows the cargo clock more than the last": from the paper (§§4–5); it holds for any booster size (calibration §6, w = 0.3c to 0.7c).
  3. "The light limit binds the people waiting, not the traveller": from the paper (§4 with t ≥ d/c); calibration §3 shows 1,000 ly with a one-year cargo clock is reachable.
  4. "One order is impossible; eleven boosters split exactly": game mechanics built on the equations, not presented as findings.
- **Newtonian intuition inverts the order book** (calibration §5). A player who believes speeds add and clocks agree thinks OLTEN and SION are impossible (the flowers would wilt), and that BRIG and CHUR are easy. The paper says the opposite. This is a consequence of the paper's equations, not of the scoring.

## 17. Calibration plan

`calibration.js` against `mechanism.js`:

1. §5: half on half = 4/5; composition with c gives c; 10,000 random sub-light pairs stay below c and match the paper's κ, λ form; symmetry; the group property; the closed form tanh(n artanh w).
2. §4: τ = t√(1 − v²/c²) agrees with the §3 transformation at x = vt; the slow-speed lag ≈ ½tv²/c² (the paper's own approximation); clock-slowing gains grow with each booster.
3. `fly()`: two boosters to 4 ly give exactly 5 and 3 years; no flight ever matches light; both impossible orders fail for every booster count and score when refused.
4. Display words: never show more than the truth (beyond a rounded day), within a month below it, no decimals; for every order and booster count, the shown time sits on the same side of the limit as the judged one.
5. Balance: the "two halves" test shot fails both ways; each book needs exactly its budget, with one perfect plan; a Newtonian plan scores at most 2 of 4; all boosters on the farthest order scores at most 2.
6. Robustness: discoveries 1–2 hold at w = 0.3, 0.4, 0.6, 0.7c.

## 18. Calibration result

`node calibration.js` → `calibration-result.txt`: **ALL PASS, 32 checks.**

- Booster speeds: 0.5, 0.8, 0.929, 0.976, 0.992, 0.997 c. Clock factors: 1.15, 1.67, 2.69, 4.56, 7.83, 13.5.
- Book A: 1,085 legal allocations, one perfect plan (2-4-0-5), mean score 1.16. The Newtonian plan 2-0-4-0 scores 1.
- Book B: one perfect plan (3-0-2-6), mean 1.22. The Newtonian plan 4-3-3-0 scores 2.
- The first version of the display check demanded rounding to the nearest half month. That conflicted with the design rule "never round a late arrival into an on-time one", so the check was restated as one-sided. This is said here.

## 19. Build log

1. **Mechanism first** (`mechanism.js`). The word formatters live in the mechanism too, so that what is shown always agrees with what was judged. The first time format used quarter-years with "just over". It made the 4-, 5- and 6-booster test shots all read "just over 4 years". It was replaced with years + months, or months + days ("4 years 4 days"), which makes the losing margin to light concrete.
2. **Loop** (`loop.js`, `loop-log.txt`). Each launch says how fast, who arrived first, and how long for whom. The Newtonian plan visibly fails both books.
3. **Skin.** Swiss grid poster: paper, ink, signal red, light yellow; Archivo embedded as two subset instances (42 KB, OFL in `fonts/`); square flat buttons; station-clock dials with the limit at six o'clock and the past-the-limit half grey. Fixes after the first screenshots:
   - the limit label inside the dial collided with the hour hand, so it was removed (the limit is printed above);
   - "OFF THE DIAL" was moved clear of the pinned hand;
   - the dials were shrunk and the order header put on one line, so LAUNCH sits above the fold at 380 × 760;
   - a refused order now still runs the light beam, so the player sees light itself land on or after the deadline;
   - the end-screen headline was changed from a tally ("One of four right") to words.
4. **Self-review from screenshots.** Aim from the start screen alone: "send flowers to stars with boosters, on time and fresh." Discovery from the top of the end screen alone: "speeds don't add, nothing catches light, and travelling clocks run slow." Does it look like an earlier game? No. It is the first light, Swiss-poster game, with clock dials; the earlier ones are a dark studio, a yellow comic, a dark board game and cream paper charts.
5. **Browser session** (`session-test.js`, `session-log.txt`, `screenshot-*.png`) at 380 px. The test range is played at 2, then help is opened mid-range and returned from (stamp kept), then 3, 5 and 4. Order book A is spread evenly 3-3-3-2, with the crate refusing the 12th booster, and the log is opened from the book. Flights follow, then the verdict ("You chased an order not even light could make"). Book B is played perfectly. The long haul is played at 5 (wilted), then 6 (fresh), then About. No console errors, no decimals on screen, no horizontal scroll. Session length is an estimate (5–7 minutes); no person has timed it.


## 20. Revision after the first review (same day)

The first play screen read as a slider that did nothing: two grey lanes with a knob-shaped rocket, +/− keys that changed only a number, and the only pressable things below the fold under two empty clocks. Rebuilt the test range around Steffen's suggestion that the control should move the clocks:

- The booster control is a slider, 1–6, in the register (ink rail, red square thumb).
- Dragging it previews the race frozen at the moment the light reaches the star: beam full, star lit, the rocket as far as it got (at two boosters, four-fifths of the way), with one flame chevron per booster. Both clocks sweep to the arrival readings, shown in grey until a launch confirms them. The §5 discovery is therefore under the thumb before the first launch; the launch and the stamp confirm it.
- Order on screen: order slip (one line, no cells), track with the lanes labelled LIGHT and YOUR ROCKET and a start line, clocks, slider, LAUNCH — all within one phone screen. Stamp, sentence and log below.
- The order book is unchanged: +/− keys, committed blind, judged on landing. The stakes live there, as the memo intended; the test range is now the instrument it was meant to be.

Mechanism untouched; `template.html` only; rebuilt and replayed at 380 px, no errors, no horizontal scroll.


## 21. Revision two: profit (same day)

Steffen's second note after playing: on the test range you would always set the boosters to six, because boosters were free there and the only constraint, the crate, lived in the order book. The pass/fail thresholds (a deadline, a keep-time) made it worse: once over the line, nothing finer was rewarded. He asked for a score that merges speed and freshness continuously, with an economist's answer: profit.

**What changed in the mechanism (ported, with a market of ours on top).**
- §10 is in. Each rocket's fuel bill is Einstein's kinetic energy, W = mc²(1/√(1 − v²/c²) − 1), at a price per unit (our choice: 10 francs). One booster costs about 1½ francs, four about 36, six about 130. The shape is the paper's; the price is ours.
- Customers replace thresholds. Each order names a fee and a customer who discounts it continuously for what the paper's two clocks measure: a florist pays fee × (1 − τ/keep) for freshness; a hospital pays fee × (1 − (t − d)/patience) for promptness, where the wait is counted from light's own arrival, since nothing can come sooner; a gallery pays half for each. Fees, keep, patience and the weights are ours.
- Profit = what the customer paid − fuel. The final score, in francs. No deadline, no crate: the sixth booster costs ten times the first, and no order pays for it. Refusing an order (0 boosters) earns and costs nothing, and one order per book cannot be made to pay.

**What this does to the game.** Every order now has a best booster count in the middle, and it differs by customer and distance: the hospital at Thun wants three, the florist at Olten four, the florist at Sion five, the florist at Zug six, and the florist at Brig should be refused. The pattern — a customer who pays for speed stops wanting boosters early; a customer who pays for freshness, far away, pays for the late ones — is the paper's: near light speed the wait beyond light-time shrinks like (1 − v) while the flowers' ageing shrinks like √(1 − v), so promptness runs out of road first. The calibration check (`calibration.js`, 29 checks) confirms §4, §5 and §10 against the paper's own values and confirms that the pattern survives any fuel price from 3 to 40 francs, any fee from 60 to 400, and any distance from 2 to 20 light-years, 320 cases.

**On screen.** The order slip names the customer and what they pay for. Under each clock, a line says what that clock is worth to this customer ("worth over half to them"). A till under the clocks shows PAID and FUEL as two bars against the fee and the PROFIT in large figures, live as the slider moves and in grey until a launch confirms it. The stamp is the profit, "+69 FRANCS" in ink or "−7 FRANCS" in red. The verdict leads with the book's profit against the best possible and says, order by order, where money was left: refused the wrong one, flew to the one nobody can make pay, overspent on the hospital, underspent on the far florist. Whole francs only; years and months for the clocks.

**Claim boundaries, restated.** Demonstrates: what the three equations imply for boosted rockets, the clocks they carry, and the cost of boosting; and that under any sensible prices the speed-buyer stops early and the freshness-buyer far away spends late. Assumes: instant boosts, half-light boosters, flowers that age by their own clock, and the market. The paper establishes the three relations; it establishes no market and no price, and where exactly an order's best booster count sits is ours.

**Build.** `mechanism.js` rewritten (CONFIG tagged line by line); `calibration.js` new, 29 passed; `loop.js` and `session-test.js` rewritten for the slider and the till; `template.html` and the About text rewritten; full browser session at 380 px: range (2, preview 4, 3, 5, 4), help mid-range, order book A spread evenly (145 of 219 francs; verdict names the two mistakes), order book B played well (152, every franc), the long haul at five (a loss) and six (+81), About; no errors, no horizontal scroll, no decimals on any screen.
