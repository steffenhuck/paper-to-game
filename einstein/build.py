# Generates the-light-post.html from template.html, mechanism.js (the single source of truth) and the two embedded fonts,
# then verifies byte for byte that the embedded mechanism is the file calibration.js ran against.
import base64, sys
mech = open('mechanism.js', encoding='utf-8').read()
font = lambda f: base64.b64encode(open('fonts/' + f, 'rb').read()).decode()
about = """
<h2>The Light Post</h2>
<h3>The game in one line</h3>
<p>You are a merchant in Bern selling flowers to customers at other stars. You choose how many boosters each rocket fires, or refuse the order. The speeds, the two clocks and the fuel bills are Einstein's 1905 equations, computed exactly. The customers, the fees, the keep-times, the price of fuel and the merchants' discount rates are this game's.</p>
<h3>Where everyone is</h3>
<p>You are at home and keep home time. The customer is at a star, light-years away; the star's station clock has been synchronised with home's by light signals, which is the rule Einstein lays down in §1 of the paper, so when the rocket lands the station clock reads home time, and that is when you are paid. The flowers ride in the rocket, and the rocket carries its own clock, which by §4 runs slow. The flowers age by that clock.</p>
<h3>What the paper found</h3>
<p>Einstein started from two rules. The laws of physics are the same for anyone moving steadily. And light always travels at the same speed, whoever sent it. From these alone he showed how distant clocks can be synchronised (§1) and that clocks which agree for one observer disagree for another who is moving (§2). He showed that a moving clock runs slow by the factor √(1 − v²/c²) (§4). He showed that speeds combine as (v + w)/(1 + vw/c²) (§5), so two speeds below light's always make one below light's: half and half make four-fifths, and light's speed cannot be reached by adding speeds below it. And he showed (§10) that the energy a body needs to move grows as mc²(1/√(1 − v²/c²) − 1), without limit as it nears the speed of light.</p>
<h3>Mechanism: ported, with a market of our own on top</h3>
<p><b>This game demonstrates</b> what the paper's equations say about rockets boosted again and again, about the clocks they carry, and about what the boosting costs, and what follows for a merchant who is paid on arrival: nothing you do brings the fee sooner than light would arrive, but boosters can make the flowers arrive as young as you like. Every booster adds half light speed in the rocket's own frame by the §5 rule. Arrival on the station clock is distance ÷ speed. The rocket's clock is that times √(1 − v²/c²), from §4. The fuel bill is §10's kinetic energy at a price per unit.</p>
<p><b>It assumes</b> boosts that happen instantly, steady flight, no braking, the booster size of half light speed, and flowers that are alive until the rocket's clock passes their keep-time and dead after. And it assumes a market: a fee paid on arrival, a keep-time per order, a price of fuel, and a merchant who discounts future francs at 0, 4 or 10 percent a year. None of that is in the paper. The <i>shapes</i> are: how the arrival time is pinned above the light-time, how the rocket's clock falls, how the fuel bill climbs.</p>
<p><b>The paper establishes</b> these relations as consequences of its two principles. That nature obeys them was a matter for later experiment, not for this paper, and certainly not for this game. The game's outcomes are the equations' outcomes, not evidence for them.</p>
<p><b>What comes from the paper and what from the game.</b> "Two halves make four-fifths", "nothing catches light", "the fee can never arrive before light would", "every booster makes the flowers younger on arrival", and "the bill climbs without limit" all follow from the paper, for any booster size. The pattern the game stages, that a merchant who discounts refuses the far stars first and the near ones never, follows from the first of those together with discounting: the calibration check confirms it for any fuel price, fee and keep-time tried. Where exactly each star's best booster count sits, and which merchant sends to which star, are game mechanics built on those equations: change the prices and they move.</p>
<h3>What is cut</h3>
<p>The whole electrodynamical part (§§6–9: magnet and conductor, Doppler shift, aberration, light pressure). Length contraction, which would shorten the rocket but changes nothing you do. The relativity of simultaneity is used (the station clock agrees with home's because the two are at rest relative to each other) but not played. Acceleration, braking and coming home.</p>
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
