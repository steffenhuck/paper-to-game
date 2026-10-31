# Generates hubbles-twelve-nights.html from template.html, mechanism.js (the single source of truth) and the embedded
# fonts, then verifies byte for byte that the embedded mechanism is the file calibration.js ran against.
import base64, sys, os
os.chdir(os.path.dirname(os.path.abspath(__file__)))
mech = open('mechanism.js', encoding='utf-8').read()
font = lambda f: base64.b64encode(open('fonts/' + f, 'rb').read()).decode()
about = """
<h3>The game in one line</h3>
<p>Twelve nights on the 100-inch at Mount Wilson. Each night you point at one of Hubble's twenty-four nebulae, read its distance in the eyepiece from how faint its brightest star looks, read its speed in the spectrograph from how far the calcium lines have slid, and drop a dot on the plate. Then the Sun's own motion comes off, you set the rate, and Humason's far nebula tests it.</p>
<h3>What the paper found</h3>
<p>In January 1929 Edwin Hubble put together the twenty-four nebulae whose distances he trusted (from Cepheid variables for the nearest, from the brightness of their brightest stars for most, from the average brightness of nebulae for the four in the Virgo cluster) and the radial velocities that had been measured for them, mostly by Slipher and Humason. The velocities had been a puzzle: a "K term" of several hundred km/s that would not sit still, and a solar motion that came out differently each time. Hubble let the velocity grow with distance and solved for the Sun's motion in the same step. The result: the velocity rises by about 500 km/s for every million parsecs of distance (465 from the nebulae taken singly, 513 from nine groups), with residuals of about 150 km/s, which he read as the nebulae's own motions. Twenty-two more nebulae without distances, run through the relation backwards, came out with the same spread of true brightness as the first twenty-four, which he took as independent support. Humason's new velocity for NGC 7619, 3779 km/s, fitted. Hubble called the relation "a first approximation representing a restricted range in distance" and raised the possibility that it was "the de Sitter effect", a prediction of relativistic cosmology. He did not use the word expansion.</p>
<h3>Mechanism: reconstructed</h3>
<p><b>This game demonstrates</b> the pattern in Hubble's Table 1. The twenty-four nebulae on the sky carry the table's distances and velocities; the eyepiece runs the paper's brightest-star criterion (brightest stars at a true brightness of −6.3 magnitudes) and the spectrograph runs the ordinary shift of the calcium H and K lines; the Sun's motion is taken out with the paper's own solution for it. The check that ships with the game re-solves Hubble's four-unknown equation on the table and recovers his constant, his solar motion and his residuals.</p>
<p><b>It assumes</b> the game's framing. The twelve nights and the one-, two- and three-night costs are ours: Hubble's programme ran for years, and he says only that the far nebulae are the hard ones. The eyepiece reads every nebula by the brightest-star rule, including the six Hubble did by Cepheids and the four Virgo nebulae he did by cluster brightness; where the table gives no brightest-star magnitude the rule is run backwards from the table's distance. The nebulae's positions on the sky are from standard catalogues, not the paper, and are spread apart so they can be tapped. Your readings are your own; the instruments add no error beyond your matching, and the glow that says you are close is ours. The Sun's motion is applied from Hubble's solution, not solved by you. Humason's NGC 7619 is placed at "about seven million parsecs", the cluster distance the paper quotes as independent of the velocity.</p>
<p><b>The paper establishes</b> a roughly linear relation between distance and radial velocity among these nebulae, with a constant of about 500 km/s per million parsecs on its distances, and a solar motion of about 300 km/s. It does not establish what the relation means; Hubble explicitly left that open. It does not establish the constant we use today: his distances were about seven times too short (the Cepheid scale was wrong and some of his "brightest stars" were clouds of glowing gas), and the modern value is about 70 km/s per million parsecs. The plate at the end redraws his Figure 1 from his table, with his line. Your dots are your readings of his numbers, not new evidence.</p>
<h3>What is cut</h3>
<p>Table 2 (the twenty-two nebulae with velocities only, and the matching distributions of brightness that Hubble offered as support); the nine-group solution; Lundmark's earlier attempt; the remark on galactic rotation; everything about de Sitter beyond one line on the end screen.</p>
<h3>The paper</h3>
<p>Edwin Hubble, "A relation between distance and radial velocity among extra-galactic nebulae", <i>Proceedings of the National Academy of Sciences</i> 15 (1929): 168–173. doi:10.1073/pnas.15.3.168. Open access at pnas.org.</p>
<p><b>Game built from this paper; the paper is the authority where the two disagree.</b> Fonts: Jost and IBM Plex Mono (SIL Open Font License). The game number in the page address fixes the look of the plates and star fields; the sky and its numbers are the paper's every time.</p>
"""
t = open('template.html', encoding='utf-8').read()
keys = ['/*__MECHANISM__*/', '/*__ABOUT__*/', '/*__FONT_JOST_600__*/', '/*__FONT_JOST_400__*/', '/*__FONT_PLEX__*/']
for k in keys:
    assert t.count(k) == 1, k
out = (t.replace('/*__FONT_JOST_600__*/', font('jost-600.woff2')).replace('/*__FONT_JOST_400__*/', font('jost-400.woff2'))
        .replace('/*__FONT_PLEX__*/', font('plexmono-400.woff2')).replace('/*__ABOUT__*/', about).replace('/*__MECHANISM__*/', mech))
name = 'hubbles-twelve-nights.html'
open(name, 'w', encoding='utf-8').write(out)
built = open(name, encoding='utf-8').read()
if mech not in built:
    sys.exit('BUILD FAILED: embedded mechanism differs from mechanism.js')
print(f'built {name}: {len(built)} bytes; mechanism embedded verbatim ({len(mech)} bytes)')
