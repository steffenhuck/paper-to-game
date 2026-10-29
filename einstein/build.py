# Generates the-light-post.html from template.html, mechanism.js (the single source of truth) and the two embedded fonts,
# then verifies byte for byte that the embedded mechanism is the file calibration.js ran against.
import base64, sys
mech = open('mechanism.js', encoding='utf-8').read()
font = lambda f: base64.b64encode(open('fonts/' + f, 'rb').read()).decode()
about = """
<h2>The Light Post</h2>
<h3>The game in one line</h3>
<p>You choose how many boosters each rocket fires. The speeds, the clocks and the fuel bills are Einstein's 1905 equations, computed exactly. The customers, their fees, what they pay for and the price of fuel are this game's.</p>
<h3>What the paper found</h3>
<p>Einstein started from two rules. The laws of physics are the same for anyone moving steadily. And light always travels at the same speed, whoever sent it. From these alone he showed that clocks that agree for one observer disagree for another who is moving (§1–2). He showed that a moving clock runs slow by the factor √(1 − v²/c²) (§4), and that a clock sent on a journey and brought back lags behind one that stayed. He showed that speeds combine as (v + w)/(1 + vw/c²) (§5), so two speeds below light's always make one below light's: half and half make four-fifths, and light's speed cannot be reached by adding speeds below it. And he showed (§10) that the energy a body needs to move grows as mc²(1/√(1 − v²/c²) − 1), without limit as it nears the speed of light.</p>
<h3>Mechanism: ported, with a market of our own on top</h3>
<p><b>This game demonstrates</b> what the paper's three equations say about rockets boosted again and again, about the clocks they carry, and about what the boosting costs. Every booster adds half light speed in the rocket's own frame by the §5 rule. Arrival on the home clock is distance ÷ speed, the far station's clock set to agree with home by light signals, the rule of §1. The flowers' time is that times √(1 − v²/c²), from §4. The fuel bill is §10's kinetic energy at a price per unit.</p>
<p><b>It assumes</b> boosts that happen instantly, steady flight, no braking, and the booster size of half light speed. The flowers age by their own clock: the paper's moving clock applied to something alive. And it assumes a market: a florist who pays for freshness, a hospital that pays for speed, a gallery that pays for both, with fees, a keep-time for the flowers, a patience for the customer, and a price of fuel. None of that is in the paper. The <i>shapes</i> are: how the wait shrinks, how the flowers' clock slows, how the fuel bill climbs.</p>
<p><b>The paper establishes</b> these relations as consequences of its two principles. That nature obeys them was a matter for later experiment, not for this paper, and certainly not for this game. The game's outcomes are the equations' outcomes, not evidence for them.</p>
<p><b>What comes from the paper and what from the game.</b> "Two halves make four-fifths", "nothing catches light", "each booster adds less speed but slows the clock more", and "the bill climbs without limit" all follow from the paper, for any booster size. The pattern the game stages — a customer who pays for speed stops wanting boosters early, a customer who pays for freshness far away pays for the late ones — follows from the paper too: near light speed the wait beyond light's own arrival shrinks like (1 − v) while the flowers' ageing shrinks like √(1 − v), so promptness runs out of road first. The calibration check confirms it survives any sensible fuel price, fee or distance. Where exactly each order's best booster count sits is a game mechanic built on those equations: change the prices and it moves.</p>
<h3>What is cut</h3>
<p>The whole electrodynamical part (§§6–9: magnet and conductor, Doppler shift, aberration, light pressure). Length contraction, which would shorten the rocket but changes nothing you do. The relativity of simultaneity is not played; it is the idea everything else rests on. Acceleration, braking and coming home.</p>
<h3>The paper</h3>
<p>A. Einstein, "Zur Elektrodynamik bewegter Körper", <i>Annalen der Physik</i> 17:891–921 (1905), doi:10.1002/andp.19053221004. Read in the 1923 English translation by W. Perrett and G. B. Jeffery, "On the Electrodynamics of Moving Bodies". Public domain.</p>
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
