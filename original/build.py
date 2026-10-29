# Generates on-the-record.html from template.html, mechanism.js (the single source of truth) and the Bangers font,
# then verifies byte for byte that the embedded mechanism is the file calibration.js ran against.
import base64, sys
mech = open('mechanism.js', encoding='utf-8').read()
font = base64.b64encode(open('bangers-latin.woff2', 'rb').read()).decode('ascii')
about = """
<h3>What kind of game this is</h3>
<p><b>A toy built on the paper's estimate.</b> The rule that moves the balloon is the paper's Table 3 (Model 3): across 37 elections in 15 European countries, the change in the radical right's vote, set against how much more the main centre-right party talked about immigration and which way its position moved. The game treats that pattern as if it were a lever you pull. The paper's data are not an experiment.</p>
<p><b>It demonstrates</b> what that estimate implies, answer by answer: talking more about immigration while sounding like the radical right goes with a bigger radical right; talking more on your old line goes with a somewhat bigger one; talking more against them goes with no change; moving position without talking more goes with no change.</p>
<p><b>It assumes</b>, under this game's own rules: that each answer is worth 3.5 points of your campaign's attention to immigration (six of six reaches the edge of the paper's range); that "like them" and "against them" are the full one-point position shifts drawn in the paper's Figure 5; that the estimate can be read after each answer as if the campaign ended there; that the 1-point line, the questions and the crisis deck are ours. With smaller position shifts (the distances between the party groups' average positions in the paper's Table 2), "like them" is still worst and the forced crisis answers "against them" still stay under the line, but taking them on every single day would hand them about two points. That "against them" is harmless rests on the paper's interaction term, estimated from 37 elections (t = &minus;2.18); without it, talking about immigration on any line helps them.</p>
<p><b>The paper establishes</b> the association with country fixed effects, and reads it as the centre-right's accommodating strategy "contributing" to the radical right's success, provided the centre-right gives immigration increasing attention. It also shows that the radical right's own campaigning raises how much every other party talks about immigration, more so during the crisis, without moving their positions. That is why some days in the crisis every question is about immigration.</p>
<h3>How the paper measured it</h3>
<p>Two newspapers per country, two months before each national election, 2003&ndash;2018. Every sentence in which a party says something about an issue was coded as <i>who</i>, <i>which issue</i>, <i>which way</i>, about 100,000 in all. A party's attention to immigration is the share of its statements on it; its position is their average direction. Your answers are scored the same way.</p>
<h3>Also in the paper, not in the game</h3>
<p>The refugee crisis was neither necessary nor sufficient for a fight over immigration: Greece, the hardest-hit port of entry, barely argued about it in 2015, while Switzerland and Poland, hit less or not at all, did. Refugee arrivals helped radical-right upstarts much more than parties already established. The radical right is the main force putting immigration into campaigns everywhere.</p>
<h3>What is cut or changed</h3>
<p>Countries and real parties (yours is unnamed); talking <i>less</i> about immigration than last time (each campaign starts from zero immigration headlines); the previous-vote and country terms of the model (the balloon shows only the part of their gain the estimate attributes to your campaign; the 12% start is for display). The questions, answers, headlines and the radical right's lines are ours.</p>
<h3>For the author</h3>
<p>Every number is in the <code>CONFIG</code> block at the top of the mechanism, tagged with its source. This game has had the builder's review only; it has not been tested with real players.</p>
<p class="cite">Headline font: Bangers by Vernon Adams, SIL Open Font License.</p>
"""
t = open('template.html', encoding='utf-8').read()
for k in ('/*__MECHANISM__*/', '/*__ABOUT__*/', '/*__FONT__*/'):
    assert t.count(k) == 1, k
out = t.replace('/*__FONT__*/', font).replace('/*__ABOUT__*/', about).replace('/*__MECHANISM__*/', mech)
name = 'on-the-record.html'
open(name, 'w', encoding='utf-8').write(out)
built = open(name, encoding='utf-8').read()
if mech not in built:
    sys.exit('BUILD FAILED: embedded mechanism differs from mechanism.js')
print(f'built {name}: {len(built)} bytes; mechanism embedded verbatim ({len(mech)} bytes)')
