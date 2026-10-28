# Design memo — *The Balance*

Paper: Ingela Alger and Jörgen W. Weibull (2013), "Homo Moralis — Preference Evolution Under Incomplete Information and Assortative Matching." *Econometrica* 81(6):2269–2302. doi:10.3982/ECTA10637. Only the PDF was available; no code. Everything is derived from the paper's equations.

## 1. What the paper hands over

Primary: **model**. A population matched in pairs to play a symmetric game; each individual's preferences are private; matching may be assortative, summarised by one number, the index of assortativity σ (eq. 4–6). Homo moralis has utility u_κ(x,y) = (1−κ)·π(x,y) + κ·π(x,x) (eq. 7). Fitness of residents and rare mutants: eqs. 11–12. Theorem 1: homo moralis with κ = σ ("homo hamiltonensis") cannot be invaded; any type that behaves differently can be. The mechanism is *ported*: the Bayesian Nash equilibrium of eq. 3 and the payoffs of eqs. 11–12, computed exactly for quadratic fitness games.

Secondary: worked examples that hand over concrete games and concrete σ — the public-goods game (Example 1), the prisoners' dilemma with (T,R,P,S) = (7,5,3,2) (Fig. 1), hawk–dove (Section 4), siblings σ = 1/2 and half-siblings σ = 1/4 (Section 5.1, fn. 24), classmates σ ≈ 0.2 (Section 5.2).

## 2. The reversal

Two.

- *Believed:* when preferences are private, evolution selects pure self-interest (Ok and Vega-Redondo 2001; Dekel, Ely and Yilankaya 2007); or, from biology, if anything it selects *altruism* toward relatives, and more goodness is better. *Paper:* evolution selects a mixture — part selfish, part Kantian ("do what would be best if everyone did it") — and the Kantian weight is pinned down exactly: κ = σ. A society *more* moral than that is invaded just as surely as a selfish one.
- *Believed:* how moral people should be depends on what is at stake. *Paper:* the stable degree of morality depends only on *who meets whom*. Change the game and behaviour changes; the morality that survives does not.

## 3. The four invariants

- **Lever.** A balance with "self" on one pan and "the right thing" on the other: the degree of morality κ of the resident population, 0 to 1.
- **Hidden mechanism.** For the society's game and matching index σ, the residents' equilibrium behaviour x* (fixed point of eq. 13, first line), each mutant's equilibrium behaviour y* (eq. 13, second line), and the fitness comparison Π_θ vs Π_τ (eqs. 11–12, ε → 0). Ported exactly.
- **Feedback.** Moving the balance immediately changes what the residents do (effort, hawkishness, cooperation), shown on the figures. Releasing the mutants: eleven mutant types (κ = 0, 0.1, …, 1) arrive one by one; each either spreads or dies out in the village, and lands on a ruler as *invaded* or *repelled*.
- **Surprise.** Siblings, second society: the player who learned "selfish is safe" among strangers is overrun by *more* moral mutants; the player who swings to pure Kant is overrun by *less* moral ones. The invaders always sit between the player's κ and a hidden point — and that point is the chance of meeting your own kind. Then the game changes, and the point does not move.

## 3b. The aim and the verdict

- **The aim:** "Find the balance no newcomer can beat." On its own line on the start screen, at the top of every round, and at the head of the How to play page.
- **The verdict** (the end screen opens with it, large): *You:* your final balance in each society. *The paper:* 0 · ½ · ½ · ¼ · 0.20, the chance of meeting your own kind. *The gap:* in how many societies your final balance held, and where it was too moral or too selfish.

## 4. Three candidate concepts

**A. Evolution's hand (Controller).** Position: the player sets the morality of a resident population and defends it against a gauntlet of mutants. Lever: κ. Feedback: who invades, plotted on a κ-ruler. Surprise: invaders point toward a hidden κ that turns out to equal σ, in every game.

**B. The mutant (Agent).** Position: a single new type dropped into a resident village; the player picks their own morality to out-earn the residents. Lever: κ of the mutant. Feedback: the mutant clan grows or shrinks. Surprise: against a homo hamiltonensis village, nothing works. Weakness: the best mutant κ against a non-Hamiltonian resident is not a clean number, so the lesson blurs.

**C. The preference itself (Agent, non-obvious).** Position: the player *is* a preference — a utility function competing in the genome/culture for carriers. Lever: how much weight to put on the Kantian term in each environment (family, market, classmates — Section 5.3). Feedback: share of carriers across environments. Surprise: the winning preference carries a *different* morality in each matching environment. Payoff (carrier share) is the paper's fitness; the multi-environment framing stretches Section 5.3.

## 5. The pick, and why

**A.** The theorem is a statement about a resident type and the mutants that try to invade it; A replays exactly that, and the reversal arrives in the second society through the player's own failed defence. Runner-up: **C**, a good second pass on "conditional morality" (Section 5.3: high κ with family, low with strangers, κ_ij by group). Switch to C if the author wants the game to be about *one person being moral in some places and not others* rather than about the population.

## 6. Presets (the five societies, played in order)

1. **Strangers in a city** — uniform random matching, σ = 0 (Section 2.1; Corollary 2). Public-goods game (Example 1).
2. **Siblings** — σ = 1/2 (Section 5.1). Same public-goods game.
3. **Siblings, a different game** — σ = 1/2, hawk–dove (Section 4, x_κ = (1−κ)/(1+κ)·v/c). Payoff independence.
4. **Half-siblings** — σ = 1/4 (fn. 24). Hawk–dove.
5. **Classmates** — business partnerships among graduates of the same class, σ = (μ−1)/(n−1)·p* with n = 100, μ = 40, p* = 1/2, so σ ≈ 0.197 (Section 5.2). Prisoners' dilemma (7,5,3,2) (Fig. 1). The corner: below κ = 1/4 every moralist defects, so the selfish are *behavioural clones* of homo hamiltonensis and survive (discussion after Fig. 1).

## 7. What is cut

Asymmetric games and role assignment (6.1, Remark 2); helping others and ultimatum bargaining (6.1.1–6.1.2); repeated play (6.1.3); morality versus altruism (6.2) beyond one line in the About screen; empirical testing (6.3); conditional morality by group (5.3, kept for concept C); general non-moralis mutant types (the "rich" type set) except as the theorem's backdrop; equilibrium multiplicity and the upper-hemicontinuity machinery.

## 8. Divergences

- Mutants are homo moralis types on a grid of eleven κ values, not the paper's arbitrary type space. The theorem's instability proof uses *committed* mutants; we check headlessly that moralis mutants alone already invade every non-Hamiltonian resident in our games.
- Invasion is judged in the limit ε → 0 (Definition 2); the village animation then shows the mutant share rising or falling at a stylised speed so that a tiny but positive edge is still visible. The animation is not a replicator dynamic the paper studies.
- The lever moves in steps of 0.05; σ ≈ 0.197 for classmates is therefore approached, not hit, and the score treats the PD corner's clone region honestly (anything in [0, 1/4] is unbeatable there).
- Public-goods functional forms are our choice within Example 1's conditions: B(s) = 3s − s²/4, C(x) = x², m = 2. Hawk–dove v = 4, c = 6 (our choice; v < c as required).
- Score: one point per mutant held off, three tests per society. Our construction.

## 9. Visual world

A natural-history specimen plate. The paper names species — *homo oeconomicus*, *homo kantiensis*, *homo moralis*, *homo hamiltonensis* — so the game is a naturalist's catalogue: cream laid paper, sepia ink, engraved hairlines, Latin binomials in italic serif, specimen numbers. Rules: (1) two inks only, iron-red for self and indigo for the right thing; every figure is tinted by its κ between them; (2) the lever is a brass balance beam that tilts; (3) the village is a field of small figures paired by fine lines, mutants drawn as filled specimens among outlined residents; (4) the ruler under the village is a specimen drawer: each tested mutant pinned at its κ with a label, ✕ for invaded, · for repelled.

## 10. Fidelity check

*Planned, before UI:* (a) reproduce Fig. 1 (x̂(κ) for the PD: 0 up to κ = 1/4, 1 from κ = 2/3) and the hawk–dove closed form x_κ = (1−κ)/(1+κ)·v/c and Example 1's FOC C′(x) = (1+κ)B′(2x); (b) Theorem 1: for each of the five societies, a resident with κ = σ is not invaded by any mutant on a fine κ grid; (c) every resident whose behaviour differs from homo hamiltonensis's is invaded by at least one mutant on the game's 11-mutant grid; (d) Corollary 2/PD corner: for σ < 1/4, residents with κ ≤ 1/4 are not invaded.

*Result (`fidelity-result.txt`):* (a) the engine's resident behaviour matches Fig. 1's x̂(κ), the hawk–dove closed form and Example 1's FOC to 3·10⁻¹³; PD gives x̂ = 0 up to κ = 0.25, 0.667 at κ = 0.5, 1 from κ = 2/3, as in Fig. 1. (b) In all five societies, a resident with κ = σ is invaded by 0 of 201 mutant types; the best mutant edge is exactly 0. (c) At every lever position (step 0.05), the resident is invaded by at least one of the 11 gauntlet mutants if and only if its behaviour differs from homo hamiltonensis's: 21/21 positions in all five societies. The number of invaders falls monotonically toward σ (siblings: 10 10 9 9 7 6 4 3 2 1 **0** 1 1 3 …). (d) Invaders always sit on the σ side of the resident. (e) At ε = 0.01 (eqs. 11–12, φ = σ), the sign of the edge agrees with the limit in 530 of 530 non-marginal duels. Classmates: every κ ≤ 0.25 holds (behavioural clones in the PD), as the paper notes after Fig. 1.

## 11. Build log

- The mechanism worked in one pass. All three games are quadratic in own strategy, so homo moralis's best reply depends only on the opponents' mean strategy and has a closed form; equilibria are fixed points found by scan plus bisection.
- First fidelity wording claimed invaders lie *between* the resident and σ. They don't: from κ = 0 among siblings, newcomers up to κ = 1 invade. Corrected to "on σ's side."
- Visual pass two: the village's bottom row sat under the banner, and the end table's uppercase header turned κ into K. Both fixed. A full headless session at 380 px (one strategy per society) ran with no errors, no horizontal scroll and score 131/165.
- Pass three, after the skill gained its section on orienting the player: every screen now carries one or two orienting lines (what the balance's 0 and 1 mean, what the village figures and pair lines are, how to read the drawer's ruler and marks, what the end plot's axes are). The player-facing "κ" became "balance", and each balance setting gets a plain gloss with what the villagers then do ("grab 40% of the time"). A How to play page is reachable from the start screen and from a ? on the play screen, and returns the player to where they were. Button labels are plain: START, TEST AGAINST NEWCOMERS, SEE ALL RESULTS.
- Pass four, after the skill gained 3b and the visible-score rule: the aim sits on the start screen, at the top of the play screen and at the head of How to play. The score reads "score n / 165" and pulses each time a newcomer fails. The end screen opens with the three-line verdict before the plot, explanation, table and attribution, and closes with a reason to play again. Stranger tests: the start screen alone gives the aim in one sentence, and the verdict alone says what the paper found (morality equals the chance of meeting your own kind).
