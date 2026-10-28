# Design memo — *The Balance*

## 1. Paper

Ingela Alger and Jörgen W. Weibull (2013), "Homo Moralis — Preference Evolution Under Incomplete Information and Assortative Matching." *Econometrica* 81(6):2269–2302. doi:10.3982/ECTA10637. Only the PDF was available; there was no code. Everything is derived from the paper's equations.

## 2. What the paper hands over

Primary: a **model**, ported. People are matched in pairs to play a symmetric game, and each person's preferences are private. Matching may be assortative, which the paper summarises in one number: the index of assortativity σ, the limiting chance that a rare mutant meets its own kind (eqs. 4–6). Homo moralis has utility u_κ(x,y) = (1−κ)π(x,y) + κπ(x,x) (eq. 7). The fitness of residents and mutants is given by eqs. 11–12, and equilibrium by eq. 3. **Theorem 1:** homo moralis with κ = σ ("homo hamiltonensis") resists every mutant that behaves differently, and any type that behaves differently from it is invaded when the type space is rich.

Secondary: the paper's own worked examples, which hand over concrete games and concrete σ:
- the public-goods game (Example 1);
- the prisoners' dilemma (7,5,3,2) of Fig. 1;
- hawk–dove (Section 4);
- siblings σ = ½ and half-siblings σ = ¼ (Section 5.1, fn. 24);
- classmates σ ≈ 0.20 (Section 5.2).

## 3. The discovery, and its kind

**A counterintuitive result.**
- *Believed:* when preferences are private, evolution selects pure self-interest (Ok & Vega-Redondo 2001; Dekel, Ely & Yilankaya 2007). The lay intuition is the opposite: more goodness is always safer.
- *In the model:* the survivor is a precise blend, exactly as moral as the chance of meeting your own kind. Too little loses, and so does too much.
- *Second part:* the blend is independent of the game. The stakes change the behaviour but not the balance.

Both parts follow from the model, not from our rules. The game's yardstick, the number of newcomers that out-earn the residents, is the paper's own invasion criterion (Definition 2) applied to a grid of mutants. Section 15(f) checks that the result does not depend on our payoff numbers.

## 4. The core narrative

> A village of people who all think alike has to decide how much to care about others. People who only look after themselves do well when they deal with strangers, because nobody pays them back for being kind. But when people mostly deal with family, who think like they do, being kind comes back to you. Newcomers keep arriving who care a little more or a little less. The surprise: the village that no newcomer can push out is not the selfish one, and not the saintly one, but the one that cares exactly as much as the chance of dealing with its own kind — and that stays true whatever they are dealing over.

## 5. Fidelity level and claim boundaries

**Structural.**
- **Demonstrates:** how the paper's model behaves, meaning which homo moralis residents resist invasion in five matching environments and three games.
- **Assumes:** the paper's setup (pairwise matching, private types, vanishingly rare mutants, a unique equilibrium); a mutant set restricted to homo moralis on an 11-point grid; and payoff numbers we chose within the paper's conditions.
- **The paper establishes:** a theorem about this model, not a fact about people. The paper proposes laboratory tests (Section 6.3); the game shows none.

In-game prose says "in this model".

## 6. The aim and the verdict

- **Aim:** "Find the balance no newcomer can beat." In the two prediction rounds it becomes "Predict, in one test, the balance no newcomer can beat."
- **Verdict** (the opening lines of the end screen):
  - *You:* found it in n of 3 societies (in a, b, c tests), and predicted it in m of 2.
  - *The paper:* in this model, the only balance no newcomer can beat puts on the right thing exactly the chance of meeting your own kind, whatever the deal.
  - *What it means:* evolution picks neither the selfish nor the saint, but a person as moral as the odds of meeting their own kind.

## 7. Concepts

The playable experience was not obvious, so there are three concepts.

**A. Evolution's hand (strategic; Controller).**
- Controls: one balance, the residents' κ.
- What the player is thinking before they press: "Where is it safe? Last time the winners were all more moral than me, so how far should I move?"
- What they see: eleven newcomers race the village one by one; the winners are pinned on a ruler.
- Discovery: among siblings, both ends fail and the winners point toward one value. That value is the chance of meeting your own kind, and it stays put when the deal changes.
- Sources of fun: anticipation (each race), agency (the winners move with the balance), discovery, and mastery (the prediction rounds).
- Second playthrough: find each balance in fewer tests, or play the prediction rounds cold.

**B. The mutant (strategic; Agent).**
- Controls: the player's own balance, as a newcomer.
- Thinking: "How do I out-earn these residents?"
- Discovery: against a village at κ = σ, nothing works.
- Weakness: the best mutant κ against a non-Hamiltonian resident is not a clean number, so the lesson blurs.

**C. The preference itself (discovery; non-obvious agent).**
- The player is a preference carried into family, market and classroom at once (Section 5.3) and sets a different weight for each.
- Discovery: the winning preference is moral at home and selfish in the market.
- Weakness: it stretches Section 5.3 and has three controls whose interaction is not the paper's main finding.

## 8. The first five minutes (pick A)

- **0:00.** Start screen. The aim is in bold; three figures run from "only own gain" to "only the right thing". I tap START.
- **0:20.** *Strangers.* The balance sits in the middle. "A newcomer practically never meets another of its own kind." I think being a bit good is safe and press TEST. Newcomers race my village; the more selfish ones grow and take over. "Beaten by 5 of 11 — all less moral." So go more selfish: 0.2 is beaten by 2, and 0 holds. I'm mildly smug: selfish is safe.
- **1:30.** *Siblings.* "A newcomer's sibling shares its values half the time." My balance is still 0. I test it and get "Beaten by 10 of 11 — all more moral." I frown: selfish was safe a minute ago. I swing to 1 and get "Beaten by 8 — all less moral." Now I'm weighing it: the winners came from above when I was low and from below when I was high, so it's somewhere in the middle. I try 0.5 and it holds. The reveal says the balance equals the chance of meeting your own kind, and I grin, because that number was in the story the whole time.
- **3:00.** *Siblings, a different deal.* "Will it hold in this deal too?" The deal is now a quarrel over a resource, and the gloss shows my villagers' behaviour changed. Do I trust the rule? I keep 0.5 and it holds.
- **3:40.** *Half-siblings, predict it.* "A quarter of the time." One test, so I think before pressing. I set 0.25 and it holds. This time I knew before seeing it.
- **4:20.** *Classmates, predict it.* "About one in five." I set 0.20 and it holds. The reveal explains why a selfish village would also have held here.
- **5:00.** The verdict.

## 9. The pick, and why

**A.** It replays Theorem 1's own structure, a resident against mutants. The discovery lands in society 2 through the player's own failed tests, and the player then uses it twice in prediction rounds.

Runner-up: **C**, a second pass on conditional morality. Switch to C if the author wants the game to be about one person being moral in some places and not others.

## 10. The shape

Five societies, about five to six minutes (an estimate; not timed by a person).

| Mode | Societies | Rule |
|---|---|---|
| **Find it** | Strangers (σ 0, public good, Section 2.1 / Example 1), Siblings (σ ½, public good, Section 5.1), Siblings with a different deal (σ ½, hawk–dove, Section 4) | Test as often as needed. After three failed tests the player may ask to see the answer. |
| **Predict it** | Half-siblings (σ ¼, hawk–dove, fn. 24), Classmates (σ ≈ 0.20, PD (7,5,3,2), Section 5.2 and Fig. 1) | One test. |

Order: strangers come first because the lay intuition is "goodness is safe", so strangers is a discovery in its own right. It also sets up the siblings reversal, which arrives within two minutes.

There is no running score. The yardstick is per test ("beaten by n of 11"; 0 = held), the verdict is per round (found on test k / prediction held), and the session verdict comes at the end.

## 11. Controls, mechanism, feedback, moment

- **Control:** one slider, the balance from 0 to 1 in steps of 0.05, shown as a tilting brass scale.
- **Mechanism:** the residents' equilibrium x* and each mutant's y* (eq. 13), and fitness from eqs. 11–12 at ε → 0.
- **Feedback:**
  - the race: the village bar, the newcomers' share growing or shrinking, and the two figures with their earnings per meeting;
  - the drop: each newcomer pinned on the drawer's ruler, one row per test.
- **Moment:** siblings, test 2. The ✕ marks flip from the right side of the wedge to the left.

## 12. What is cut

- asymmetric games and role assignment (6.1, Remark 2);
- helping others and ultimatum bargaining (6.1.1–2);
- repeated play (6.1.3);
- morality versus altruism (6.2);
- empirical testing (6.3);
- conditional morality (5.3; kept for concept C);
- non-moralis mutants (the "rich" type space);
- multiple equilibria;
- the visible assortative village grid from the previous build, removed as a grid of tiny sprites.

## 13. Divergences

- Mutants are homo moralis on an 11-point grid. Theorem 1's instability proof uses committed types; check (c) confirms the moralis grid already invades every non-Hamiltonian resident in these games.
- The race's speed and final share are stylised; only the direction (out-earns or not) is the model's.
- Public good: B(s) = 3s − s²/4, C(x) = x², m = 2. Hawk–dove: v = 4, c = 6. Both are our choices within the paper's conditions; check (f) shows the result does not depend on them.
- The lever moves in steps of 0.05, so classmates' σ ≈ 0.197 is approached at 0.20, which holds (any balance ≤ ¼ holds there).
- The test count, the prediction rounds and the show-the-answer offer are the game's.

## 14. Visual world

A natural-history specimen plate, because the paper names species (oeconomicus, kantiensis, moralis, hamiltonensis). The look: cream paper, sepia ink, italic Latin binomials.

Rules:
1. Two inks only, iron-red for own gain and indigo for the right thing; every figure is tinted by its balance.
2. The control is a brass scale that tilts.
3. Few, big things. The play screen shows one scale, one village bar, two large figures with their earnings, and one ruler.
4. Legibility. The scale answers "what did I set?". The bar answers "is the newcomer winning?". The earnings answer "why?". The drawer answers "which way should I move?".

## 15. Fidelity plan

Run `node fidelity.js` against `mechanism.js`, the only copy:

- **(a)** The engine's resident behaviour against the closed forms of Fig. 1 / eq. 19, Section 4 and Example 1, with tolerance 1e-9; and Fig. 1's kinks at ¼ and ⅔.
- **(b)** Theorem 1, first claim: a resident at κ = σ is invaded by none of 201 mutants, in every society.
- **(c)** Second claim, on the game's own lever and gauntlet: at every lever position, the resident is invaded if and only if its behaviour differs from homo hamiltonensis's.
- **(d)** Every invader sits on σ's side of the resident.
- **(e)** Finite ε = 0.01 agrees in sign with the limit.
- **(f)** Robustness against our choices: 60 random alternative games (public goods with other curves, hawk–dove with other stakes, other PDs) and random σ, on a 101 × 101 grid. The unbeatable set must be exactly the behaviour of κ = σ.
- **(g)** Arrival-order seeds change only the order, never the count. Boundary balances 0 and 1. The paper's named corners (strangers: selfish holds, Corollary 2; classmates: κ ≤ ¼ holds, after Fig. 1).

## 16. Fidelity result and build log

**Result** (`fidelity-result.txt`): ALL CHECKS PASS.
- (a) max error 3·10⁻¹³.
- (b) best mutant edge exactly 0 in all five societies.
- (c) 21/21 lever positions correct in each society. The invader counts fall toward σ, e.g. siblings: 10 10 9 9 7 6 4 3 2 1 **0** 1 1 3 3 5 5 6 7 8 8.
- (d) holds.
- (e) 530/530.
- (f) 60/60 alternative games and σ.
- (g) holds.

**Build log:**
- Passes one to four (before the skill's rewrite) built a 96-figure village grid, a running point total out of 165, and three fixed tests per society with untaken tests credited. All three are now anti-patterns and were removed.
- κ and σ appeared on play screens and are now "balance" and "the chance of meeting your own kind".
- Scoring, the newcomer order (a seeded shuffle) and the round and session verdicts moved from the interface into `mechanism.js`. The interface now only passes the balance in and draws what comes back.
- `build.py` used to strip the module-export line from the mechanism. It now inlines the file verbatim and fails unless the embedded bytes equal `mechanism.js`.
- The order changed: the discovery now arrives in society 2, and societies 4–5 became prediction rounds.
- The race panel's result banner overlapped the figures; the figures moved down.
- The loop was printed headlessly (`loop.js`) before the skin.
- Browser session at 380 px (`play2.js`): a full session with a retry in society 2, How to play opened and returned from mid-play, and the show-the-answer path. No console errors, no horizontal scroll, and no Greek letters on any player-facing screen. Machine run time was 83 s without thinking time; the real session length is unmeasured.
- Self-review from the screenshots: the start screen alone gives the aim; the top of the end screen alone gives the discovery. This is the builder's review only, not stranger testing.
