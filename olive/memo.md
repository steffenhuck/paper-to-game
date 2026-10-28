# Design memo — *The Olive*

Paper: Vrieler et al. (2019), "Variability and directionality of inferior olive neuron dendrites revealed by detailed 3D characterization of an extensive morphological library." *Brain Structure and Function* 224:1677–1695. doi:10.1007/s00429-019-01859-z. Only the PDF was available; no code or reconstructions.

## 1. What the paper hands over

Primary: **estimate**. 90 reconstructed neurons, 25 morphometric measures (Table 1), their ranges per dataset (Table 4), their correlations with the subjective curly/straight label and with "straightness" (Table 5), a PCA whose first component tracks straightness (Fig. 3), soma positions of 11,800 cells with a DBSCAN cluster search (Fig. 5).

Secondary: **argument**. The discussion proposes that dendrite directionality delineates tightly coupled clusters and that straighter, less directional cells act as "bridges" between them (Figs. 6–7). No model, one illustrative sample. Formalising this needs choices; see section 8.

## 2. The reversal

Two.

- *Believed:* inferior olive neurons come in two types, curly and straight (Cajal, Scheibel). *Paper:* it is a continuum; one number, straightness (reach / longest path), carries what the experts' eyes were doing, and no measure shows bimodality.
- *Believed:* if coupled groups exist, you would see them in where the cell bodies sit. *Paper:* soma positions are one mesh down to 40 µm; the structure is in the *direction* the dendrites grow, not in where the somata are.

## 3. The four invariants

- **Lever.** Act one: a sorting judgement (curly / straight / can't tell) per neuron. Act two: cluster boundaries the player draws on a field of somata.
- **Hidden mechanism.** A synthetic neuron generator whose shape parameters are drawn from Table 4 ranges with Table 5's correlations built in: straightness drives branch count, tip count, hull volume, reach, contraction. For act two, a soma field with weak density hot spots (Fig. 5b) and, underneath, directional dendrite fields that overlap within groups and avoid each other across groups (Fig. 6).
- **Feedback.** Act one: after every sort, the neuron's straightness is revealed and it drops onto a growing histogram, with the player's labels coloured. Act two: the player's boundaries are scored against the hidden overlap structure, first with somata only, then with dendrites lit.
- **Surprise.** Act one: the player's own "ambiguous" pile is the biggest, and the three piles overlap on the ruler. Act two: the boundaries the player drew from somata were wrong; the ones the dendrites reveal cut right through dense soma patches.

## 4. Three concepts

**A. The experimenter (sort, then cluster).** Position: the anatomist with a confocal stack. Lever: label neurons; draw cluster boundaries. Feedback: histogram fills; boundaries scored. Surprise: your categories don't exist; your clusters were in the wrong place.

**B. The neuron (grow your dendrites).** Position: one IO neuron, cast as agent. Lever: a dendrite budget split between local curl and straight reach, plus a direction. Feedback: gap-junction coupling with neighbours lights up as trees overlap. Surprise: the curly build couples you tightly to a few; the straight build couples you weakly to many, and the network needs both. Payoff (coupling → synchronised firing) is in the introduction, not the results: our construction.

**C. The forecaster (bet on the slice).** Position: a reader before the figures. Lever: bets on distributions (two humps or one?), on cluster detection, on where somata sit in the dendritic volume. Feedback: the paper's figure. Surprise: each bet reveals a reversal. Thin.

## 5. Pick

**A.** It is the paper's own method replayed, both reversals land on the player through their own hands, and it needs no invented payoff. Runner-up: **B**, which is the better toy and the better second pass once the author has confirmed that the cluster-bridge story is what they want foregrounded. Switch to B if the author says the game is "too much about the method, not enough about the olive."

## 6. Presets

Act one, by labeling dataset (Table 4 columns): **Virus** (fullest trees, straightness median 0.37), **Alexa** (sparser, median 0.49), **Biocytin** (median 0.39). Act two, by subnucleus (Fig. 1g, Fig. 5): **PO**, **MAO**, **DAO** — same mechanism, different soma fields.

## 7. What is cut

The 25-measure PCA (reduced to straightness plus the three or four correlates the player can see); electrophysiology; the cluster-bridge hypothesis as a *mechanism* (it appears only as the act-two reveal, not as something the player can drive); subthreshold oscillations; labeling chemistry; the DCK subnucleus.

## 8. Divergences

- Neurons are 2D projections, not 3D; "straightness" computed in the plane.
- Twenty neurons per act-one session (the paper: 90 over three datasets).
- Act-two group structure is *invented to match Fig. 6*: the paper shows that directionality could delineate groups and offers examples; it does not report group sizes or counts. The game tiles a 360×210 µm slab with about eleven dendritic fields (radius ~58 µm) on a jittered hex grid, 16–22 cells per field with somata at the rim (Fig. 6c), trees pulled toward the field centre, three long straight "bridge" cells spanning two fields (Fig. 7). All in the config block.
- Round-two trees are drawn at about a third of their generated length and stop at the field centre, so fields read as fields on a phone screen.
- Correlations enforced only for straightness vs. branches (−0.70), stems (−0.41), tips (−0.67), hull volume (+0.50), contraction (+0.57), all from the viral column of Table 5.

## 9. Visual world

The confocal stack. Black field; neurons in fluorescent green (viral), red-orange (Alexa) or amber (biocytin) with a soft glow; the olive border as a white dotted line; a 20 µm scale bar; monospace captions in the corner like a microscope overlay. Motion: trees grow from the soma when they appear; in act two the dendrites "develop" like a long exposure.

## 10. Fidelity check

*Result (600 generated cells per method, seed 20191677):* straightness unimodal and spanning Table 4 (virus 0.15–0.83, median 0.41); Spearman rho with branches −0.53 (paper −0.70), stems −0.37 (−0.41), tips −0.54 (−0.63), hull +0.68 (+0.50), contraction +0.57 (+0.57), total length −0.34 (−0.47). Signs all right; branches and length weaker than the paper by ~0.15. Act two: DBSCAN at 40 µm sees one cluster in 18 of 20 slabs; seeds at the true field centres score F1 > 0.85 in 20 of 20.

*Planned:* 
Generate 1,000 synthetic neurons per dataset; re-measure straightness, branches, stems, tips, hull; check that Spearman correlations match Table 5 in sign and within ±0.15; check that the straightness distribution covers Table 4's min–max and is unimodal; check that the act-two soma field, run through a simple DBSCAN at D = 40 µm, yields one cluster (Fig. 5c) while the dendrite-overlap graph yields the planted groups.

## 11. Build log

- Mechanism took two passes: a breadth-first grower spread the length budget over too many tips and made every path short and straight; growing branch by branch fixed the straightness range and the correlations in one go.
- The round-two slab took five passes. The mechanism was right from pass two (one DBSCAN cluster, groups recoverable), but the *picture* did not show the groups until trees were short, pulled toward a point, and stopped at the centre. Mechanism fidelity and visual legibility are separate checks.
