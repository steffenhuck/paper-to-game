import re, html
mech = open('mechanism.js').read()
mech = re.sub(r"\nif \(typeof module[^\n]*\n", "\n", mech)
about = """
<h3>What the paper hands over</h3>
<p>Primarily an <b>estimate</b>: 90 reconstructed neurons, 25 morphometric measures (Table 1), their ranges per labeling method (Table 4), their correlations with the subjective curly/straight label and with "straightness" (Table 5), a PCA whose first component tracks straightness (Fig. 3), and the positions of 11,800 somata with a cluster search (Fig. 5). Secondarily an <b>argument</b>: the discussion proposes that dendrite directionality delineates tightly coupled groups and that straighter cells bridge them (Figs. 6–7).</p>
<h3>The two reversals</h3>
<p><b>One.</b> Believed: two cell types, curly and straight. Paper: a continuum, captured by one number, reach divided by longest path. <b>Two.</b> Believed: coupled groups would show in where the cell bodies sit. Paper: somata form one mesh down to 40 µm; the structure is in the direction the dendrites grow.</p>
<h3>Where the player sits</h3>
<p>The experimenter. Round one replays the paper's own method: sort, then measure, then see your sorting against the ruler. Round two replays its last section: look for groups in the somata, fail, then see the dendrites. The runner-up concept — the neuron as an agent spending a dendrite budget on curl versus reach — was recorded for a second pass; it needs a payoff the paper's results don't supply.</p>
<h3>Presets</h3>
<p>Round one draws from one of the paper's three labeling methods, each with its own straightness range (Table 4): Virus (0.13–0.81, median 0.37), Alexa (0.19–0.81, median 0.49), Biocytin (0.21–0.79, median 0.39).</p>
<h3>What is synthetic</h3>
<p>Every neuron is generated, not traced. Trees are grown branch by branch with a target straightness drawn from the paper's range; branch count, stem count, tip count, total length, hull size and contraction follow straightness with the signs and roughly the strengths of Table 5. A headless check on 600 generated cells per method recovers those correlations within about 0.2 (branches −0.5 vs −0.7 in the paper; stems −0.3 vs −0.4; hull +0.6 vs +0.5; contraction +0.6 vs +0.6) and a unimodal straightness distribution covering the paper's range.</p>
<p>The round-two slab is invented to match Figs. 5–7: twelve dendritic fields tile the slab; each group's cells sit at the rim of their shared field with trees growing into it (soma eccentric, Fig. 4b); three long straight cells span two fields (Fig. 7). The paper reports examples, not group sizes or counts; ours are choices, listed in the config block. The check confirms that a 40 µm distance-based clustering sees one cluster (Fig. 5c) while the dendritic overlap recovers the planted groups.</p>
<h3>What is cut</h3>
<p>The 25-measure PCA; electrophysiology and subthreshold oscillations; labeling chemistry; the dorsal cap of Kooy; the cluster-bridge hypothesis as something the player can drive (it appears only as the round-two reveal).</p>
<h3>Divergences</h3>
<p>Neurons are planar, not 3D. Twenty cells per round, not ninety. Round-two trees are drawn at reduced length so fields read as fields. The score is our construction.</p>
<h3>For the author</h3>
<p>Look at round one first: does the generated library look like your library? Every number sits in the config block at the top of the page source, each tagged with its table or figure. We were least sure about the round-two slab, which formalises your discussion rather than your results.</p>
"""
t = open('template.html').read()
t = t.replace('/*__MECHANISM__*/', mech).replace('<!--ABOUT-->', about)
open('the-olive.html', 'w').write(t)
print(len(t), 'bytes')
