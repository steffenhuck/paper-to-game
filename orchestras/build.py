# Generates the-more-the-better.html from template.html and mechanism.js (the single source of truth),
# then verifies byte for byte that the embedded mechanism is the file the fidelity check ran against.
import sys
mech = open('mechanism.js', encoding='utf-8').read()
about = """
<h3>Fidelity: statistical</h3>
<p>The game shows the paper's reported numbers directly; nothing is simulated. <b>It demonstrates</b> the shape of each of the six curves in the paper's Figure 5, and the pattern of women's representation in major and regional orchestras in 1990. <b>It assumes</b> that the values read off Figure 5 are within about 0.05 of the authors' numbers (the paper prints no table for that figure); that handing the player the first group's value as an anchor is fair; and that a line's shape is well described by two questions, does it fall at first and does it recover at the end, with changes under 0.2 points counting as no change. <b>The paper establishes</b> differences in group averages across five groups of orchestras observed once, in 1990–91, in four countries, which the authors report as statistically reliable and checked against their interviews and observations. It does not establish what would happen to one orchestra as its composition changed, nor a causal effect of composition on anything; the game never lets you change an orchestra, only predict what the study found.</p>
<h3>What the paper hands over</h3>
<p>A descriptive study of 78 professional symphony orchestras in the United States, the United Kingdom, West Germany and East Germany, visited in 1990–91: archival data, interviews, observation and a survey of fifteen players per orchestra. The part the game is built on is Figure 5, which sorts the orchestras into five groups by share of women (1–11%, 12–23%, 24–35%, 36–48%, 49–60%) and plots six measures of orchestral life, each on a 1–7 scale, against them; and the table on p. 209 giving the share of women in major and regional orchestras in each country.</p>
<h3>The discovery</h3>
<p>A counterintuitive result. The common view, which the authors name and reject, is "the more the better". In the study, almost every measure fell as the share of women rose from token to transitional, and most measures recovered only once women were more than about 40% of the orchestra. Two of six, integrity as an ensemble and job involvement, did not recover within the observed range. The authors describe three stages: token (women keep a low profile, nothing changes), transition (enough women to form a group; boundaries harden on both sides, support across the line falls, everyone is more tense), and balance (everyone has people like themselves; relations stabilise). They note that the upturn comes mainly from regional orchestras in the United States, which had got furthest.</p>
<h3>The measures and their names in the paper</h3>
<table class="t"><tr><th>In the game</th><th>In the paper</th></tr>
<tr><td>how well players get along</td><td>Quality of interpersonal relationships</td></tr>
<tr><td>how safe players feel in their jobs</td><td>Satisfaction with job security</td></tr>
<tr><td>how steady the orchestra is</td><td>Stability</td></tr>
<tr><td>how much players throw themselves into the work</td><td>Job involvement</td></tr>
<tr><td>how well the orchestra is set up for its work</td><td>Orchestra structure: task and composition</td></tr>
<tr><td>how intact the ensemble feels</td><td>Integrity as an ensemble</td></tr></table>
<p>The game plays the first four, ordered so that the dip and recovery arrive in the first reveal and the exception comes last; the second set plays the remaining two. Figure 5 orders them differently.</p>
<h3>What the check found</h3>
<p>All six curves, as read off the figure, start at their highest value and fall; integrity and job involvement fall without interruption, and the other four bottom out in the third or fourth group and rise into the fifth, as the text says. The game's shape rule agrees with the text's classification for every dead zone from 0.1 to 0.3 points and under a rule with no dead zone at all. A straight rising line ("the more the better") scores shape wrong on all six measures; a flat line scores wrong on all six; a straight falling line scores right only on the two that never recover. So what the player discovers comes from the paper's curves, not from the game's scoring. Regional orchestras had a higher share of women than major orchestras in all four countries.</p>
<h3>What is cut</h3>
<p>Everything else in the paper: differences between countries and between major and regional orchestras in structure, resources and satisfaction (Figures 1–2, Table 1); orchestra players' motivation and satisfaction compared with twelve other occupations; career patterns, departures and arrivals (Figure 3); the representation of women by section (Figure 4); the finding that financial strength predicts an orchestra's standing, and that board and manager say strengthens finances while player say and an over-reaching music director weaken them; over- and underperforming orchestras (Table 2); East German orchestras under socialism and after reunification.</p>
<h3>Divergences</h3>
<p>The first group's value is given to the player, so that drawing is about shape rather than level. The measures are renamed in plain words (table above). The chart shows the part of the 7-point scale from 3 to 7 for every measure; the paper's panels use different windows. The group icons (one to five women in ten seats) are stylised midpoints of the paper's five bands. The shape rule, the dead zone and the miss are the game's; the curves are the paper's, read off the figure at 300 dpi.</p>
<h3>For the author</h3>
<p>See the author note in the repository. This game has had the builder's review only; it has not been tested with real players.</p>
"""
t = open('template.html', encoding='utf-8').read()
assert t.count('/*__MECHANISM__*/') == 1
out = t.replace('/*__MECHANISM__*/', mech).replace('<!--ABOUT-->', about)
open('the-more-the-better.html', 'w', encoding='utf-8').write(out)
# verify: the bytes between the markers are exactly mechanism.js
html = open('the-more-the-better.html', 'rb').read()
a = html.index(b'/*MECHANISM-BEGIN*/\n') + len(b'/*MECHANISM-BEGIN*/\n')
b = html.index(b'\n/*MECHANISM-END*/')
if html[a:b] != open('mechanism.js', 'rb').read():
    sys.exit('BUILD FAILED: embedded mechanism differs from mechanism.js')
print(f'{len(html)} bytes; embedded mechanism identical to mechanism.js ({b - a} bytes)')
