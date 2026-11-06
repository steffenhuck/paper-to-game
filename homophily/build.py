# Generates home-judges.html from template.html, mechanism.js (the single source of truth) and the two embedded fonts,
# then verifies byte for byte that the embedded mechanism is the file calibration.js ran against.
import base64, sys
mech = open('mechanism.js', encoding='utf-8').read()
font = lambda f: base64.b64encode(open('fonts/' + f, 'rb').read()).decode()
about = """
<h3>THE PAPER</h3>
<p>Nicola Fuchs-Schündeln and Felix Holub, <i>Homophily in Grant Evaluations</i> (WZB Berlin / Goethe University Frankfurt, manuscript). Using 37,073 ERC applications, they compare the same proposal across its reviewers: reviewers who share the applicant's citizenship or country of work give higher scores, most of all when both match.</p>
<h3>THE GAME</h3>
<p>The applicant mix is the authors' applicant file (30 passport and work-country combinations with their shares), built into the page. The judges are curated from their panel-member file. Two simplifications are the game's own: the token rule (both match 3, one match 1, none 0) is a game scale, not the paper's 1–5 scores; and each applicant's judges are drawn at random from the 15 on the panel (about four each), while the ERC assigns by expertise.</p>
<p>So the game <b>demonstrates</b> how panel composition spreads home advantage across applicant groups under these simplifications. It <b>assumes</b> the token rule and random assignment. The paper <b>establishes</b> that matched reviewers score the same proposal higher; it does not test other panels. The LEVEL target and the four swaps are game choices, not recommendations.</p>
<p class="dim">Game built from this paper; the paper is the authority where the two disagree. Beta, builder-reviewed only. Fonts: Bungee, Rubik (SIL OFL).</p>
"""
t = open('template.html', encoding='utf-8').read()
for k in ['/*__MECHANISM__*/', '/*__ABOUT__*/', '/*__FONT_BUNGEE__*/', '/*__FONT_RUBIK__*/']:
    assert t.count(k) == 1, k
out = (t.replace('/*__FONT_BUNGEE__*/', font('bungee.woff2')).replace('/*__FONT_RUBIK__*/', font('rubik.woff2'))
        .replace('/*__ABOUT__*/', about).replace('/*__MECHANISM__*/', mech))
name = 'home-judges.html'
open(name, 'w', encoding='utf-8').write(out)
built = open(name, encoding='utf-8').read()
if mech not in built:
    sys.exit('BUILD FAILED: embedded mechanism differs from mechanism.js')
print(f'built {name}: {len(built)} bytes; mechanism embedded verbatim ({len(mech)} bytes)')
