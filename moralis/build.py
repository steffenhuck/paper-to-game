# Generates the-balance.html from template.html and mechanism.js (the single source of truth),
# then verifies byte for byte that the embedded mechanism is the file the fidelity check ran against.
import sys
mech = open('mechanism.js', encoding='utf-8').read()
about = """
<h3>Fidelity: structural</h3>
<p>The game runs the paper's own model. <b>It demonstrates</b> how that model behaves: which temperaments resist invasion in five matching environments and three deals. <b>It assumes</b> the paper's setup (pairwise matching, private temperaments, rare newcomers), its <i>homo moralis</i> family of temperaments, and payoff numbers we chose within the paper's conditions. <b>The paper establishes</b> a theorem about this model — that the temperament whose moral weight equals the chance of meeting your own kind cannot be invaded, and that temperaments behaving differently can be — not that real people are like this. The paper suggests laboratory tests; none are shown here.</p>
<h3>What the paper hands over</h3>
<p>A model. People are paired to play a symmetric game. What each person wants is private. Pairing may be assortative: one number, which the paper calls the <i>index of assortativity</i>, is the chance that a rare newcomer is paired with one of its own kind. <i>Homo moralis</i> weighs her own payoff against the payoff she would get if the other person did what she does, Kant's "act as if your rule were a universal law". The paper's main result: the temperament whose weight on the second goal equals the index of assortativity — <i>homo hamiltonensis</i> — cannot be invaded, and any temperament that behaves differently can be (Theorem 1).</p>
<h3>The discovery</h3>
<p>A counterintuitive result. Earlier work found that when preferences are private, evolution selects pure self-interest; and a natural guess is that more goodness is always safer. In this model, the survivor is a precise blend: exactly as moral as the chance of meeting your own kind. Too little loses; so does too much. And the blend does not depend on the deal being played: what is at stake changes the behaviour, not the balance. Both follow from the model, not from the game's scoring: the game counts which newcomers out-earn your villagers, which is the paper's own test of invasion.</p>
<h3>How the game works</h3>
<p>You set the village's balance and test it against eleven newcomer kinds, balances 0, 0.1, … up to 1. For each, the game computes how your villagers behave, how the newcomers behave given that they meet their own kind with the society's chance, and what each earns per meeting — in the limit where newcomers are very rare, as in the paper. A newcomer that earns more takes over; one that earns less dies out; one that behaves exactly like your villagers blends in.</p>
<h3>The societies</h3>
<p>1. Strangers in a city, chance zero (Section 2.1), shared chore (the public-goods game of Example 1). 2. Siblings, chance one half (Section 5.1), same chore. 3. Siblings, a quarrel over a resource (the hawk–dove game, Section 4). 4. Half-siblings, chance one quarter (footnote 24), same quarrel. 5. Classmates in business partnerships, chance (40 − 1)/(100 − 1) × ½ ≈ 0.20 (Section 5.2), a prisoners' dilemma with the payoffs of the paper's Fig. 1. The first three are for finding the unbeatable balance; the last two ask you to predict it in one test.</p>
<h3>What the check found</h3>
<p>The game's behaviour matches the paper's formulas (Fig. 1, the hawk–dove solution, Example 1's condition) to within 10⁻¹². In all five societies, the predicted balance is beaten by none of 201 newcomer kinds; every other balance that behaves differently is beaten by at least one of the eleven, and the winners always sit on the side of the unbeatable balance. The result survives sixty random alternative deals and chances, so it does not depend on our payoff numbers. In the classmates' dilemma, every balance up to one quarter cheats and survives, as the paper notes after Fig. 1.</p>
<h3>What is cut</h3>
<p>Asymmetric games and role assignment; helping others and ultimatum bargaining; repeated play; morality versus altruism; morality conditional on group identity; newcomer kinds that are not <i>homo moralis</i> (the paper's proof uses committed types); multiple equilibria.</p>
<h3>Divergences</h3>
<p>Newcomers come from an eleven-point grid of balances. The bar shows newcomers spreading or shrinking at a stylised speed; only the direction is the model's. The chore's benefit and cost curves and the quarrel's stakes are our choices within the paper's conditions. The balance moves in steps of 0.05. The count of tests and the predictions are the game's, not the paper's.</p>
<h3>For the author</h3>
<p>See the author note in the repository. This game has had the builder's review only; it has not been tested with real players.</p>
"""
t = open('template.html', encoding='utf-8').read()
assert t.count('/*__MECHANISM__*/') == 1
out = t.replace('/*__MECHANISM__*/', mech).replace('<!--ABOUT-->', about)
open('the-balance.html', 'w', encoding='utf-8').write(out)
# verify: the bytes between the markers are exactly mechanism.js
html = open('the-balance.html', 'rb').read()
a = html.index(b'/*MECHANISM-BEGIN*/\n') + len(b'/*MECHANISM-BEGIN*/\n')
b = html.index(b'\n/*MECHANISM-END*/')
if html[a:b] != open('mechanism.js', 'rb').read():
    sys.exit('BUILD FAILED: embedded mechanism differs from mechanism.js')
print(f'{len(html)} bytes; embedded mechanism identical to mechanism.js ({b - a} bytes)')
