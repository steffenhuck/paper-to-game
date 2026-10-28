# Generates the-wall-in-the-head.html from template.html and mechanism.js (the single source of truth),
# then verifies byte for byte that the embedded mechanism is the file the fidelity check ran against.
import sys
mech = open('mechanism.js', encoding='utf-8').read()
about = """
<h3>Fidelity: statistical, from reported estimates only</h3>
<p>Nothing in this game is simulated. Every number is one of three things: reported in the paper; computed from a reported regression coefficient (converted into "people in every 100" at the West German share, a conversion that reproduces the paper's own 14.5–17 point figures); or read off the paper's Figure 1. The jars of 100 people display shares; they are not individuals.</p>
<p><b>It demonstrates</b> the paper's reported pattern and the logic of its argument: which comparison answers which alternative explanation. <b>It assumes</b> our conversion of coefficients into points, our averaging across the five survey questions, and our editing of the paper's argument into six objections, each with the one card the paper itself uses against it (sections are named on the cards). <b>The paper establishes</b> the associations in the German Socio-Economic Panel, with controls for income, education, job and family. The causal reading rests on the paper's natural-experiment case: the split was imposed from outside, the two halves were alike before 1945, and migration does not drive the result. The paper argues these points; it cannot prove them, and the game says "in the paper's survey", never "this proves".</p>
<h3>What the paper hands over</h3>
<p>Estimates. In 1997 and 2002 the survey asked who should provide financial security in five areas (unemployment, sickness, family, old age, care): the state or private forces. The paper runs probit regressions of "the state" on an East indicator, a 2002 indicator, their interaction and many controls (Table 1), then by age and birth cohort (Tables 3–4, Figure 1), for the same individuals in both years (Table 5), with regional economic controls (Table 8), for East Germans who moved West (Table 9), and for beliefs about luck and social conditions (Tables 11 and 13). An argument: why the gap should be read as an effect of communism (Section 2.1, Section 3.5, Section 5).</p>
<h3>The discovery</h3>
<p>Two kinds. A counterintuitive result: 45 years under an all-intrusive state did not turn East Germans against the state; they want more of it. And an identification result: the gap grows with years lived under communism, while in the West age pushes the other way; it survives controls for income, region and history; and it is closing, mostly because the same people are changing their minds.</p>
<h3>The game</h3>
<p>You bet on the opening question, then settle six objections by choosing the comparison that answers each. The judging is the paper's own: each objection accepts the card the paper uses against that alternative. The doubter's words are ours. The forecast shows the paper's straight-line projection from the 1997–2002 pace, 11 to 35 years after 1997 depending on the question, which the paper itself calls rough.</p>
<h3>What is cut</h3>
<p>The five policy areas separately (the cards average them; the bet uses the unemployment question); ordered-probit estimates; wealth, income-source and future-income controls; each eastern state separately; all individual control coefficients.</p>
<h3>Divergences</h3>
<p>The "Old and young" bars are read off Figure 1. Recomputing them from Table 4 with our conversion gives a flatter rise (7 to 24 points instead of 7 to 34); the rise and the reversal with age survive either way. "Two thirds changed their minds" is the paper's own rounding of a 35% average fall in the convergence coefficient among the same individuals. Years lived under communism are counted from 1945.</p>
<h3>For the author</h3>
<p>See the author note in the repository. This game has had the builder's review only; it has not been tested with real players.</p>
"""
t = open('template.html', encoding='utf-8').read()
assert t.count('/*__MECHANISM__*/') == 1 and t.count('/*__ABOUT__*/') == 1
out = t.replace('/*__MECHANISM__*/', mech).replace('/*__ABOUT__*/', about)
name = 'the-wall-in-the-head.html'
open(name, 'w', encoding='utf-8').write(out)
built = open(name, encoding='utf-8').read()
if mech not in built:
    sys.exit('BUILD FAILED: embedded mechanism differs from mechanism.js')
print(f'built {name}: {len(built)} bytes; mechanism embedded verbatim ({len(mech)} bytes)')
