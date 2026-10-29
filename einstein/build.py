# Generates the-light-post.html from template.html, mechanism.js (the single source of truth) and the two embedded fonts,
# then verifies byte for byte that the embedded mechanism is the file calibration.js ran against.
import base64, sys
mech = open('mechanism.js', encoding='utf-8').read()
font = lambda f: base64.b64encode(open('fonts/' + f, 'rb').read()).decode()
about = """
<h2>The Light Post</h2>
<h3>The game in one line</h3>
<p>You choose how many boosters each rocket fires. The speeds and the clocks are Einstein's 1905 equations, computed exactly. The orders, the crate and the booster size are this game's.</p>
<h3>What the paper found</h3>
<p>Einstein started from two rules. The laws of physics are the same for anyone moving steadily. And light always travels at the same speed, whoever sent it. From these alone he showed that clocks that agree for one observer disagree for another who is moving (§1–2). He showed that a moving clock runs slow by the factor √(1 − v²/c²) (§4), and that a clock sent on a journey and brought back lags behind one that stayed. He also showed that speeds combine as (v + w)/(1 + vw/c²) (§5), so two speeds below light's always make one below light's: half and half make four-fifths. Light's speed cannot be reached by adding speeds below it. In the second half of the paper (§10), the energy needed to reach light speed is infinite.</p>
<h3>Mechanism: ported</h3>
<p><b>This game demonstrates</b> what the paper's equations say about rockets boosted again and again and about the clocks they carry. In this model, every booster adds half light speed in the rocket's own frame by the §5 rule. A rocket's arrival on the home clock is distance ÷ speed. The far station's clock is set to agree with home's by light signals, the rule of §1. The flowers' time is that times √(1 − v²/c²), from §4.</p>
<p><b>It assumes</b> boosts that happen instantly, steady flight, no braking (the flowers are dropped in passing), and the booster size of half light speed. The flowers age by their own clock: that is the paper's moving clock applied to something alive. The paper speaks only of clocks, though it says its result holds for a balance-clock at the equator, and footnote 7 rules out only a pendulum clock, whose ticking depends on the Earth.</p>
<p><b>The paper establishes</b> these relations as consequences of its two principles. That nature obeys them was a matter for later experiment, not for this paper, and certainly not for this game. The game's outcomes are the equations' outcomes, not evidence for them.</p>
<p><b>What comes from the paper and what from the game.</b> "Two halves make four-fifths", "nothing catches light", and "each booster adds less speed but slows the clock more" all follow from the paper. They hold for any booster size (checked for 0.3c to 0.7c). The order book's puzzles (which order is impossible, and how 11 boosters split) are game mechanics built on those equations.</p>
<h3>What is cut</h3>
<p>The whole electrodynamical part (§§6–9: magnet and conductor, Doppler shift, aberration, light pressure). Length contraction, which would shorten the rocket but changes nothing you do. The relativity of simultaneity is not played; it is the idea everything else rests on. Acceleration, braking and coming home. The energy cost of speed (§10), which here would grow without limit; boosters are identical stages instead.</p>
<h3>The paper</h3>
<p>A. Einstein, "Zur Elektrodynamik bewegter Körper", <i>Annalen der Physik</i> 17:891–921 (1905), doi:10.1002/andp.19053221004. Read in the 1923 English translation by W. Perrett and G. B. Jeffery, "On the Electrodynamics of Moving Bodies", in the electronic edition by John Walker (Fourmilab, 1999). Public domain.</p>
<p><b>Game built from this paper; the paper is the authority where the two disagree.</b> It is a beta. It has had the builder's review only and has not been tested with real players. Font: Archivo, SIL Open Font License.</p>
"""
t = open('template.html', encoding='utf-8').read()
for k in ['/*__MECHANISM__*/', '/*__ABOUT__*/', '/*__FONT_DISP__*/', '/*__FONT_BODY__*/']:
    assert t.count(k) == 1, k
out = (t.replace('/*__FONT_DISP__*/', font('disp.woff2')).replace('/*__FONT_BODY__*/', font('body.woff2'))
        .replace('/*__ABOUT__*/', about).replace('/*__MECHANISM__*/', mech))
name = 'the-light-post.html'
open(name, 'w', encoding='utf-8').write(out)
built = open(name, encoding='utf-8').read()
if mech not in built:
    sys.exit('BUILD FAILED: embedded mechanism differs from mechanism.js')
print(f'built {name}: {len(built)} bytes; mechanism embedded verbatim ({len(mech)} bytes)')
