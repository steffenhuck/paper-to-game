# Generates the-original-or-the-copy.html from template.html and mechanism.js (the single source of truth),
# then verifies byte for byte that the embedded mechanism is the file the fidelity check ran against.
import sys
mech = open('mechanism.js', encoding='utf-8').read()
about = """
<h3>The paper in one paragraph</h3>
<p>Hutter and Kriesi coded about 100,000 statements by parties in newspaper coverage of 61 national election campaigns in 15 European countries, from the early 2000s to 2018. They ask three questions. Did the 2015 migration crisis make immigration a bigger fight? Is the radical right still the party driving it? And when does the radical right profit at the ballot box?</p>
<h3>What it found</h3>
<p><b>The crisis raised the fight everywhere, but did not decide where.</b> After 2015 immigration became one of the most fought-over issues across Europe. Yet the crisis was "neither a necessary nor a sufficient condition". Greece, the hardest-hit port of entry, hardly argued about it, because the bailout crowded out everything else. Switzerland, the Netherlands and Poland, which were hit less or not at all, fought hard. Partisan mobilisation decided.</p>
<p><b>The radical right drives it.</b> It is the main party putting immigration into the debate, against immigration. When it does, every other party talks about immigration more, especially during the crisis, but other parties do not shift their positions towards it.</p>
<p><b>The centre-right's strategy matters, through an interaction.</b> When the main centre-right party gave immigration more attention <i>and</i> moved towards the radical right's position, the radical right gained. Moving without more attention made no difference, and neither did more attention combined with a move the other way. The paper quotes Jean-Marie Le Pen: "the French choose the original, not the copy." The paper also finds that a rise in refugee numbers helped new radical-right parties much more than established ones. That result is not in the game.</p>
<h3>Fidelity</h3>
<p><b>Part 1 is statistical, and shows observations.</b> Each bar is the paper's own measure for that country's first election after the crisis, read off its Figure 3 (to about ±0.3). The measure is salience × polarisation of immigration in campaign coverage. The dashed line is the paper's benchmark: the mean plus one standard deviation over all 17 issues. The hit levels and the reasons are paraphrased from the paper's discussion (p. 350). The paper counts Fidesz and PiS as radical right, and says this is a contested choice. <b>It demonstrates</b> where immigration was and was not fought over. <b>It assumes</b> our read-offs. The split between fight and no fight is the same for any line from 0.6 to 5.7. <b>The paper establishes</b> these measurements from two newspapers per country.</p>
<p><b>Part 2 is illustrative, built on the paper's estimate.</b> The radical right's change in vote is Table 3, Model 3, exactly: 31.92 × (change in centre-right attention) − 0.757 × (change in its position) − 33.05 × (the two multiplied). Attention is the share of the party's campaign statements on immigration. Position runs from −1 (fully against) to +1 (fully for). <b>It demonstrates</b> what that estimate implies if each choice were a lever. <b>It assumes</b> that the pattern is causal, that the straight-line model holds for the steps offered, and a starting vote of 12%, which is ours and for display only. <b>The paper establishes</b> an association across 37 elections with country fixed effects, not an experiment, and its uncertainty is wide. The "move more open" result rests on the interaction term alone (t = −2.18). A simpler model without it (Model 2) would show talking more always helping the radical right, by about 2 points with a move away from them. The "copy" result holds in both models.</p>
<h3>Our choices</h3>
<p>The 1-point aim is ours. Any limit from 0.8 to 3.1 gives the same wins and losses. There is no "talk less" option. The paper notes that in the crisis ignoring immigration "was hardly an option" for mainstream parties, and its claim concerns a centre-right that does or does not pay <i>increasing</i> attention. Stretching the straight line to big cuts in attention would claim more than the paper does. The tougher and more-open steps (±1) are the two lines the paper plots in its Figure 5. Campaigns 2 and 3 each fix one dial. These are our scenarios, not findings. We show eight of the 15 countries: the ones whose crisis "hit" the paper describes.</p>
<h3>What is cut</h3>
<p>Salience and polarisation shown separately; regional trends; the before-and-after comparison by country; the party-level regressions (Tables 1–2), which are summarised above; refugee inflows and the upstart-versus-established result (Table 3, Model 1).</p>
<h3>For the author</h3>
<p>See the author note and memo in the repository. This game has had the builder's review only. It has not been tested with real players.</p>
"""
t = open('template.html', encoding='utf-8').read()
assert t.count('/*__MECHANISM__*/') == 1 and t.count('/*__ABOUT__*/') == 1
out = t.replace('/*__MECHANISM__*/', mech).replace('/*__ABOUT__*/', about)
name = 'the-original-or-the-copy.html'
open(name, 'w', encoding='utf-8').write(out)
built = open(name, encoding='utf-8').read()
if mech not in built:
    sys.exit('BUILD FAILED: embedded mechanism differs from mechanism.js')
print(f'built {name}: {len(built)} bytes; mechanism embedded verbatim ({len(mech)} bytes)')
