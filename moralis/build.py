import re
mech = open('mechanism.js').read()
mech = re.sub(r"\nif \(typeof module[^\n]*\n", "\n", mech)
about = """
<h3>What the paper hands over</h3>
<p>A <b>model</b>. People are matched in pairs to play a symmetric game. What each person wants is private. Matching may be assortative: one number, the <i>index of assortativity</i> σ, is the chance that a rare newcomer meets one of its own kind (Section 2.1). <i>Homo moralis</i> wants a mix: (1 − κ) of her own payoff plus κ of the payoff she would get if the other person did what she does — Kant's "act as if your maxim were a universal law" (eq. 7). κ = 0 is <i>homo oeconomicus</i>; κ = 1 is <i>homo kantiensis</i>. Theorem 1: the type with κ = σ, <i>homo hamiltonensis</i>, cannot be invaded, and any type that behaves differently can be.</p>
<h3>The two reversals</h3>
<p><b>One.</b> Believed: when preferences are private, evolution selects pure self-interest; or, if anything, it selects goodness toward kin, and more is better. Paper: it selects a precise blend, κ = σ. A village more moral than that falls just as surely as a selfish one. <b>Two.</b> Believed: how moral people should be depends on what is at stake. Paper: the surviving morality depends only on who meets whom; the game changes behaviour, not the balance.</p>
<h3>Where the player sits</h3>
<p>Evolution's hand. You set the resident population's κ and release eleven newcomer types, κ = 0, 0.1, …, 1. For each, the game computes the residents' equilibrium behaviour, the newcomers' equilibrium behaviour given they meet their own kind with probability σ, and both groups' average payoff (eqs. 3, 11, 12, with the newcomers vanishingly rare). A newcomer that earns strictly more takes over; one that earns less dies out; one that behaves exactly like the residents blends in. The runner-up concept — the player as a preference carrying a different morality into family, market and classroom (Section 5.3) — is kept for a second pass.</p>
<h3>The societies</h3>
<p>1. Strangers, σ = 0, public good (Section 2.1, Example 1). 2. Siblings, σ = ½ (Section 5.1), same game. 3. Siblings, hawk–dove (Section 4). 4. Half-siblings, σ = ¼ (footnote 24), hawk–dove. 5. Classmates in business partnerships, σ = (μ − 1)/(n − 1) · p* ≈ 0.20 with n = 100, μ = 40, p* = ½ (Section 5.2), prisoners' dilemma with (T, R, P, S) = (7, 5, 3, 2) (Fig. 1).</p>
<h3>What the check found</h3>
<p>The engine's resident behaviour matches the paper's closed forms (Fig. 1's x̂(κ), hawk–dove's (1 − κ)/(1 + κ) · v/c, Example 1's first-order condition) to 10⁻¹². In all five societies, a resident with κ = σ is beaten by none of 201 newcomer types. Every lever position that behaves differently from <i>homo hamiltonensis</i> is invaded by at least one of the eleven; the invaders always sit on σ's side. In the classmates' dilemma, every κ ≤ ¼ defects and survives, as the paper notes after Fig. 1.</p>
<h3>What is cut</h3>
<p>Asymmetric games and role assignment; helping others and ultimatum bargaining; repeated play; morality versus altruism; conditional morality by group identity; newcomer types that are not <i>homo moralis</i> (the paper's "rich" type space, which its proof uses); multiple equilibria.</p>
<h3>Divergences</h3>
<p>Newcomers come from an eleven-point grid of κ, not every possible preference. Invasion is judged in the paper's limit of vanishingly rare newcomers; the village then shows the newcomers spreading or dying out at a stylised speed, which is not a dynamic the paper studies. Public-good forms B(s) = 3s − s²/4 and C(x) = x², and hawk–dove values v = 4, c = 6, are our choices within the paper's conditions. The score is ours.</p>
<h3>For the author</h3>
<p>Play society 2 first and see whether the drawer of invaders reads as a pointer to σ. Every number sits in the config block at the top of the page source, each tagged with its section or equation. We were least sure about the newcomer grid: the theorem's instability proof uses committed newcomers, while the game uses only <i>homo moralis</i> newcomers (the check confirms these suffice in the five games).</p>
"""
t = open('template.html').read()
t = t.replace('/*__MECHANISM__*/', mech).replace('<!--ABOUT-->', about)
open('the-balance.html', 'w').write(t)
print(len(t), 'bytes')
