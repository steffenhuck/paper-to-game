# Generates one-of-us.html from template.html and mechanism.js (the single source of truth),
# then verifies byte for byte that the embedded mechanism is the file the fidelity check ran against.
import sys
mech = open('mechanism.js', encoding='utf-8').read()
about = """
<h3>The discovery</h3>
<p>When a judge shares an applicant's country, the applicant's marks are higher. On its own that proves nothing. The study rules out the innocent explanations one by one. It compares the <b>same proposal</b> marked by matched and unmatched judges, so quality is held fixed. It compares the <b>same judge</b> marking matched and unmatched applicants, so generosity is held fixed. It looks at the <b>whole spread</b>: better knowledge would add marks at both ends, but the extra marks are top marks only. And it controls for <b>shared taste</b>: closeness of the judge's own papers to the proposal, coauthorship, and topic. What survives is homophily, a bonus for being one of us. It is +0.164 on Step 1 project scores when country of work and citizenship both match (95% CI 0.135–0.193), +0.075 for citizenship only, +0.056 for country only, and +0.024 for gender. At the panel level, applicants from the five biggest countries meet compatriots about three times as often. That goes with a predicted funding boost of 1.7 percentage points against 0.8 for everybody else, on a base of 14%. This last part is a correlation.</p>
<h3>Fidelity: three parts, labelled</h3>
<p><b>The three practice panels are illustrative.</b> They are invented countries with invented, exaggerated effects (0.30–0.40 points instead of 0.164). Each is simulated from a toy model in which one explanation is true. They teach the method; the paper says nothing about them. In the "knows them better" panel, the judges are Bayesian: compatriots read a precise signal of quality, others a very noisy one, and both shrink towards the average. A practice panel whose test lands on the wrong side of the line by chance is re-drawn, about 1 time in 40.</p>
<p><b>The fourth case is statistical:</b> a reconstruction calibrated to the paper, not the confidential ERC data. It has 37,073 proposals, about 4.2 judges each, a Step 1 mark mean of 3.29 and SD of 0.99, about 3% of marks from a judge who shares country and citizenship, and a bonus that gives 0.166 when the paper's own estimator is run on it (paper: 0.164). Every player sees the same reconstruction. <b>It demonstrates</b> what the paper's estimates look like through the three tests. <b>It assumes</b> normal-ish latent marks rounded to half points, matches unrelated to quality (so the headline gap equals the bonus), and an additive bonus. That bonus puts somewhat more weight on a 5.0 than the data do (+0.02 against the paper's +0.010). <b>The paper establishes</b> the estimates above on 155,000 real reviews, with standard errors clustered by proposal and reviewer. The ranges in the game are 99% intervals from our simulation, not the paper's.</p>
<p><b>The closing question is the paper's Table 2</b> and is correlational. Panel decisions are made once per proposal, so quality cannot be held fixed.</p>
<p>The paper calls the effect homophily. It does not say whether it is deliberate: "Favours their own" means only that the same work gets a higher mark from a compatriot.</p>
<h3>What is cut</h3>
<p>Step 2 reviews (similar sizes), PI scores, the split by grant scheme and by domain, the shared-taste test (shown only as a sentence), same-rank homophily between elite institutions (none found), the chair results, and the study's policy ideas: limiting matched assignments, more diverse panels, partial lotteries near the cutoff, blind project scoring.</p>
<h3>For the author</h3>
<p>See the author note in the repository. This game has had the builder's review only; it has not been tested with real players.</p>
"""
t = open('template.html', encoding='utf-8').read()
assert t.count('/*__MECHANISM__*/') == 1 and t.count('/*__ABOUT__*/') == 1
out = t.replace('/*__MECHANISM__*/', mech).replace('/*__ABOUT__*/', about)
name = 'one-of-us.html'
open(name, 'w', encoding='utf-8').write(out)
built = open(name, encoding='utf-8').read()
if mech not in built:
    sys.exit('BUILD FAILED: embedded mechanism differs from mechanism.js')
print(f'built {name}: {len(built)} bytes; mechanism embedded verbatim ({len(mech)} bytes)')
