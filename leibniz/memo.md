# Leibniz's Worlds — design memo

This is the second build for this paper. The first, *Leibniz's Tiles* (in `previous/`), played Leibniz's own analogy literally: shapes dragged onto a board, essence as area, compossibility as non-overlap. Its author found it "too Tetris" and rejected the activity, not the look. This build keeps the rule and drops the board; the look carries over.

## 0. Given

Mine: Steffen's signature and counter. Working title *Leibniz's Worlds* (dummy; to be settled). Ideas given: **no theology quiz**, **modern look**, **Strickland credit**, and from the rejection of the first build: **no spatial packing**. Lloyd Strickland's translation is used with his nod; he suggested the text.

## 1. Paper

G. W. Leibniz, *De rerum originatione radicali* (On the ultimate origination of things), dated 23 November 1697. Manuscript LH 4, 1, 10 Bl. 2–4 (Gottfried Wilhelm Leibniz Bibliothek, Hanover); first printed in Erdmann's *Opera philosophica* (1840), 147–150; standard reference Gerhardt, *Die philosophischen Schriften* VII, 302–308. Read in Lloyd Strickland's translation from the Latin (© 2014, complete, with the manuscript's deletions in the notes), published at leibniz-translations.com. No DOI. Available: the translation as a PDF, six pages; no data, no code, no figures, no numbers. The game is built from the text alone.

## 2. What the paper hands over

An **argument** (primary), in two movements. First: no state of the world explains why there is a world at all, because every state is copied from the one before it; so the reason lies outside the series, in something necessary. Second, the part the game runs: *how* that reason picks a world. Every possible thing strives to exist with a force in proportion to how much reality it contains; not all possibles can exist together; what exists is the combination through which the greatest total of essence comes into being. Leibniz illustrates this with a board game (secondary), but the rule is not spatial: possibles are incompossible because of what they are. Then the theodicy follows from the maximum: the best whole is not the sum of the best parts; a part seen alone is "a confused chaos of colours"; afflictions are "stepping back in order to make a leap forward with greater force" (*reculer pour mieux sauter* in the margin); destruction "is useful for achieving something greater, so that in a way we profit from our very loss".

## 2a. Revision, 15 Nov 2026 (after the author played the sky build)

Two notes from him: the shut-out stars read as matter that blocks rather than as things gone out (fixed: a shut-out star keeps its own ring and number, faded, with a key line under the sky); and a wish for many more rounds, which turned into the question what the player is to learn. Answer, worked backwards: *"best possible world" means the fullest set of things that can exist together, not everything; it leaves things out, can leave the grandest thing out, is sometimes reached only by putting a good thing out, and from a part you cannot tell whether a world is that set.* Four clauses, four worlds, no rounds beyond the lessons and nothing after the verdict (his call). World 1 reworked so the first clause is felt (six things, three pairs, the best leaves three dark). World 4 added: the covered picture played, two worlds through one window, the same lit 2 and dark 9 in each, one world the fullest and one seven short; the player judges from the window, then the cover lifts.

## 2b. Revision, 15 Nov 2026, later (after he played the four-world build)

His two notes: the first skies were too easy, the numbers and the drawn lines letting the best be read at a glance; and the window world was too hard to understand and should proceed in stages. Done: lines and numbers are now found, not given (a pair's line appears once one of the two has shut the other out and stays; a star's number appears once it has been lit; world 3's dark things are of unknown worth until tried); world 2 has a second pair (rose–ice; best now 19, heaviest-first 12); the window world runs in three stages per world, a small window, a wider one that shows what holds the 9 down (or does not), then the whole, with "can't tell" as a third answer; the verdict reports whether the player's judgement changed with the light.

## 2c. Revision, 15 Nov 2026, evening (after he played the staged window)

Two notes: the headline ("as full as it can be" or "yours holds x, the best holds y") arrived before the best sky had been shown (fixed: after Let it be the game only says that what could be has come in; the headline, lesson and lines appear once the best sky has lit star by star); and the window world, even in stages, left the player nothing to do: "everything is just levered to the player without much choice". Rebuilt as torch and hand: the sky is covered except the window; the player may light a torch twice, anywhere they tap, each lifting a circle of the cover; then they put the 2 out (the dark 9 looks like a mistake) or leave the world; the cover lifts and the consequence is theirs: in the first world nothing comes in and 2 is lost, in the second the 9 comes in and 7 is gained. The "can't tell" answer went with the judging; what remains is a choice with a cost and a way to find out before choosing. The verdict reports torches lit, the act and what it got.

## 2d. Revision, 15 Nov 2026, late (after he played the torch build)

His three decisions: no defaults, "only stars that are actually tapped should comprise the world" (the rush-in at Let it be went; a world holds exactly what the player lit; Let it be wakes after the first tap in the first two skies); the salt mine deferred to me (the lamp: a circle of light dragged over a covered sky, burning oil by distance, enough for about a third of the sky; then put the small one out or leave it); and "substantially more variation in all stages": the skies are now drawn by a generator from a seed for every game, each draw rejected until the solver proves its lesson (world 1: the best leaves at least two out, uniquely; world 2: the big one out of the unique best, its holders outweigh it, heaviest-first play at least four short; world 3: filled by weight is short, exactly one lit star, never the biggest, opens the way to the best, and putting the biggest out frees nothing; the lamp: two skies with the same stars lit in the same places, one the fullest, the other short by exactly the big star less the small), and every layout rejected until no line passes through a star, no two lines cross and no two stars touch. Numbers never show during play; sizes do the work; numbers and every line appear when a world has ended. Also fixed on the way: a line in the old fixed world 2 ran through the big star and read as its line.

## 2e. Revision, 15 Nov 2026, evening (after he played the lamp)

His diagnosis: with enough oil the lamp turns the dark world into a lit one, and the choice is arithmetic again, "something akin to stage 1". His design, built as said: one torch per world; one tap places it; for three seconds the stars and lines inside its glow show faintly (rings at a third, lines at about a fifth of daylight), then it dies and only the opening remains; nothing seen is kept on screen. Then the two buttons. The reveal says whether the torch lit the lines that mattered. Settings to tune by eye on a phone: `TORCH.radius` (115), `seconds` (3), `starLight` (.35), `lineLight` (.3).

## 2f. Revision, 15 Nov 2026, evening (after he played the one-torch build)

His notes: the torch could not be seen as an instrument (it was invisible until used); "put the small one out" too Claude-ish; and after the choice everything came at once, a frustrating moment. Built: the torches lie in the dark as flames and are dragged to where they are struck; two torches for the two worlds (his open question, my call: a second torch is worth having only at a price, and the price is the next world's only look); the torch burns three seconds full and three fading; "Done looking" leads to a reading, *Did anything else hold the big star down?* (I saw lines / I saw none / Couldn't tell), which is the second decision; then *Choose the other star* / *Leave it* (his words); then the consequence in the dark (the small star goes out; the big one lights, or stays dark and "something else is holding it"); then *Lift the cover*, a circle of light growing from the big star over three and a half seconds; then the account and the best world beside.

## 2g. Revision, 15 Nov 2026, late evening (after he played the two-torch build)

His note: the second world of round 4 was odd, there was nothing meaningful to do (both torches spent, a coin toss), and should it have its own number. Cut: round 4 is one world, one torch, the full sequence; after the cover lifts, *The twin* is shown beside it, the other world with the same opening, and the line says which kind each was and that only a torch could have told them apart. Which of the two is played is drawn at random. Four worlds, no fifth. He will send the game to Strickland before it goes on the page.

## 2h. Revision, 15 Nov 2026, night (after he played the one-world-and-twin build)

His note: round 4 still a little trivial and too random; his suggestion, "naughty", to put the answer where the torch did not shine. Built instead as one-sided evidence, which gets the effect honestly: three lines leave the big star in both worlds, stubs in view from the start, ends beyond the torch's reach from the big star and spread in direction; in the full world two of the three ends are lit holders worth more than the big one together and the third a dark thing shut out by a lit other; in the short world all three ends are dark. A torch can show a lit end (held, certain) and never prove the big one free. The reading becomes *Did you see the big star held? Yes, held / Nothing held it / Couldn't tell*; he asked whether the reading is superfluous; it was (the choice says what was believed), and it went: Done looking leads straight to the choice; the account afterwards says what the torch reached and what the choice assumed. Unlit star discs are now opaque so that lines do not show through them in the opening.

## 2i. Revision, 15 Nov 2026, night (the shape settled)

His questions and the answers built: does the paper argue that this is the best world (yes, a priori, from the striving; and the salt mine and covered picture are his reply to the objection: you cannot judge from the part, and you know it anyway from the argument), so the verdict now carries "The two halves" under "What Leibniz says"; the two halves are named on screen, "The skies · k of 3" and "The salt mine · r of 2"; the salt mine has two rounds, each a fresh draw with its own torch and its twin (his point: three skies against one salt mine was unbalanced; the earlier coin-toss round was the shared torch's fault, not the second round's); and a score, his proposal, in the paper's own measure: the light the five worlds hold over the light the five best worlds hold, as the verdict's headline with a bar, the share in words. A shadowed variable (the round number against the decision's result) sent round one's twin to the verdict; fixed.

## 3. The discovery, and its kind

**A mechanism made intelligible**, with a **counterintuitive corner**. The mechanism: "best of all possible worlds" is an argmax, the fullest set of things that can exist together. The corner: the fullest world need not contain the grandest single thing; the way from a decent world to the best one can run through destroying a part that was fine. Three things to find out, one per world; the paper names all three.

## 4. The core narrative

There are things that could exist, and each one pushes to exist as hard as there is of it. Some pairs cannot both exist. The world is whichever set of them holds the most. If you let the biggest thing be first, it shuts out four smaller things that together are worth more, and your world ends up dim. And sometimes the only way to a fuller world is to put out something that was fine, so that three others can come in.

## 5. Who lives in the paper

- **The possibles**: each "strives to exist in proportion to its quantity of essence". They choose nothing; they push. The material.
- **The dominant unity**, God, who makes the world "according to the principle of wisdom or perfection". Controls which possibles exist. The player, in the one respect the paper makes mechanical: choosing the set.
- **The heavy bodies**: the physical analogy; weights settle. Kept as the rush-in at Let it be and as the filling of world 3.
- **The afflicted good man**, whose loss is a step back for a leap: whoever puts a lit star out.
- **The viewer of the covered painting**: the verdict's last paragraph, not a player.

## 6. Precedent

Unchanged from the first memo (Arrow, Coase, Snow): subject/strategic, agent/challenge, experimenter/discovery; ballot paper, ledger, handbill looks. This game: controller (chooses the set), challenge, feedback by light in a sky, night-app look. No dimension shared.

## 7. The aim and the verdict

**Aim**: *Bring as much into existence as will fit.* The yardstick in its units: the bar of light under the sky (lit weight over all that wants to be), with the best world's mark appearing after Let it be.

**Verdict** (end screen leads with): what Leibniz says (three lines); what you found (one line per world from what the player did); where you part; had yours stood; the covered picture as one paragraph; the three skies beside the best.

## 8. The concepts

**A. The Sky** (controller; challenge) — the pick. Possibles are stars with a weight; a line between two means they cannot both exist. Tap to let a thing be; it lights, and what it excludes goes dark with a red line to the thing that shut it out. Tap a lit star to put it out (the step back). Let it be ends the world: whatever still can be rushes in, heaviest first; what the player put out stays out; the best possible world is shown beside yours. Thinking before pressing: what does admitting this cost me. Three worlds, one lesson each.

**B. The Packer** (the first build) — rejected by the author: a spatial packing puzzle is Tetris, and the spatial rule is not Leibniz's rule anyway.

**C. The Weights** (the reckless one, unchanged from the first memo): pour weights, the highest pile is the world. Still a demonstration; not built.

## 9. The first five minutes

0:00 Title, the sky motif, three lines of setting, the two acts, the aim. 0:20 World 1: five rings, one line between the 4 and the 3. Tap the 4: it lights, the 3 goes dark with a red dashed line. Tap the 3: "cannot be: the amber star shut it out. Put it out first." Tap the 4 again: a step back; the 3 can be. The hands are learned. Let it be: the rest rush in; yours 11 or 12, best 12; "even the best possible world leaves something out". 1:30 World 2: a 9 in the middle with lines to four 4s, a 3 and a 2 free. They tap the 9; four go dark at once. 3 and 2 come in. Let it be: 14 against 21; the best sky lights up without the 9. The frown, then the grin. 3:00 World 3: already lit, 19, nothing waiting. "Make this world fuller." The only thing to tap is a lit star. The 8 looks guilty from last time; put it out: nothing comes in, 11. Put it back. The 6 has three lines to dark stars: put it out, three come in, 24. Let it be: full. 4:30 The verdict.

## 10. The pick, and why

The Sky plays the paper's rule rather than its illustration, and its one thought, "what does this cost", is the thought the paper describes. The author test: the step back as an action, and the grandest thing shut out by arithmetic rather than by shape. Originality: no game in the table has had the player choose a set under exclusions.

## 11. The shape

Three skies, one Let it be each, then the window, then the verdict. World 1: six stars (5, 4, 3, 3, 2, 1), three pairs (5–3, 4–3, 2–1); best 11, three left dark. World 2: a 9 that cannot be with four 4s; a free 3 and 2; best 21 without the 9; heaviest-first ends at 14. World 3: filled by weight to 19 (8 free; 6 excluding 4, 4, 3; 5 excluding 5); put the 6 out and three come in: 24, the best; put the 8 out: 11; put the 5 out: 19. World 4: two made worlds, the same seven stars in the same places, lit alike (22); through the window (a rectangle holding only the lit 2, the dark 9 and the line between them) they are identical; in the first the 9 is also held down by three 4s and 22 is the best; in the second only the 2 holds it and the best is 29. The player answers "as full as can be" or "short" for each; the cover lifts; the second reveal carries the lesson. No presets; worlds fixed, best worlds exact. Score: the bar of light only; verdict in words.

## 12. Controls, mechanism, feedback, moment

Controls: tap a star (let be / put out); Let it be. Mechanism (`mechanism.js`): `newWorld`, `letBe`, `putOut`, `letItBe` (rush-in, heaviest first, put-out stars stay out), `solve` (exact maximum over every subset), `result`, `verdict`. Feedback: light; the red dashed line from a lit star to what it shut out; the bar; after Let it be, the best sky lighting star by star beside yours. Moment: world 2's best sky without the 9; world 3's three stars lighting where the 6 was.

## 13. The look

**Register: a 2020s app at night**, carried over from the first build: night `#0E1016`, slab `#171A23`, void `#07080C`, chalk, mute; seven star colours (coral, amber, mint, azure, lilac, rose, ice); Space Grotesk embedded; pill buttons, Let it be the one solid one. **The one visual rule: existence is light.** A waiting thing is a ring in its colour; an existing thing is a filled star with a glow; a shut-out thing is a dark disc with a red dashed line to what shut it out. Numbers inside stars (the weight), because the deliberation is arithmetic. The sky is 320 × 300 in a slab panel; Let it be is within 700 px on every world without scrolling (checked).

## 14. What is cut

The regress (three lines on the start screen); the triangle, the sphere, the laws of motion, the commonwealth of minds; the covered picture is read, not played; the ape and the King of Denmark are on About.

## 15. Divergences

- **A possible's claim is its weight**, a number we chose. Robustness: with claim = weight^k, the grandest thing stays out of the best second world up to k ≈ 1.75, and the third world's step back pays up to k ≈ 2.3 (calibration check).
- **Incompossibility is a listed pair.** Leibniz gives no rule for which possibles exclude which; the pairs are ours.
- **The player chooses.** In the paper nothing chooses; the maximum "arises". The striving acts without a hand at Let it be and in world 3's filling.
- **What the player put out stays out at Let it be.** Otherwise the step back would be undone by the striving.
- **Three fixed worlds**, best worlds exact.

## 16. Mechanism kind and claim boundaries

**Toy.** The About screen says what the game demonstrates (under this rule, the fullest set must leave something out, can leave the grandest thing out, and can be reached from a decent set only by removing something), what it assumes (claim = weight; the pairs; the three skies), and what the paper establishes (an argument, not evidence).

## 17. Calibration plan and result

`node calibration.js` (now 57 checks, incl. the window: both windows show the same stars in the same states and the same lines, no line stub from the 9 inside the window): solver exact against an independent search; the three worlds' totals and maxima; the properties of each world (best leaves something out; the 9 out of the best second world, 14 with it forced in, heaviest-first 14; world 3 filled to 19, put out the 6 → 24, the 8 → 11, the 5 → 19); the striving and the step back; robustness in k; heuristics (heaviest-first, random, best play); the words. 47 checks, all pass; see `calibration-result.txt`.

## 18. Build log

Rebuilt in chat 15 Nov 2026 after the first build was played and rejected as Tetris. `mechanism.js` new; `template.html` new, same chassis; `about.html` rewritten; `calibration.js` new; `session-test.js` plays the walkthrough of §9 and the best play at 380 px, screenshots in the folder, no page errors, no horizontal scroll, Let it be above 700 px on all three worlds. One bug found and fixed in the build: the rush-in brought a put-out star back; now what the player put out stays out.
