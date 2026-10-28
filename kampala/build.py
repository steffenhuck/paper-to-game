# Generates the-mixed-street.html from template.html and mechanism.js (the single source of truth),
# then verifies byte for byte that the embedded mechanism is the file the fidelity check ran against.
import sys
mech = open('mechanism.js', encoding='utf-8').read()
about = """
<h3>Fidelity: statistical, from reported estimates only</h3>
<p>Nothing in this game is simulated and nothing is random. Every bar shows a number the paper reports, or one computed directly from its tables. Where the paper reports only the gap between same-group and mixed play (the dictator and prisoners'-dilemma games), the two bars are placed symmetrically around the reported average; the gap is the paper's, the exact heights are ours.</p>
<p><b>It demonstrates</b> the paper's pattern of results and the logic of its design: which game separates which explanation from which. <b>It assumes</b> our plain-words versions of the five mechanisms, our five-test budget and our rule for which tests "back" which verdict (taken from the paper's own use of each game). <b>The paper establishes</b> how 300 randomly sampled residents of Mulago-Kyebando played these games with co-ethnics and non-co-ethnics, and argues from that to why diverse communities provide fewer public goods. The games do not measure drains or patrols; that link is the paper's argument.</p>
<h3>What the paper hands over</h3>
<p>Estimates from a field lab in Kampala, and a taxonomy. Three families of mechanisms, five in all: <b>preferences</b> (commonality of tastes; other-regarding preferences, i.e. altruism towards one's own), <b>technology</b> (efficacy, i.e. working well together; findability, i.e. being reachable through social networks) and <b>strategy selection</b> (a norm of reciprocity among co-ethnics, enforced by sanctioning). Each game isolates one of them. Players were told only their partners' photos; co-ethnicity here is the paper's "benchmark" coding, from self-reported group.</p>
<h3>The discovery</h3>
<p>Identification. All five mechanisms predict the same thing: mixed communities do worse. The paper's design tells them apart. When the giver in a dictator game is anonymous, co-ethnics get no more (Tables 2–3): no in-group altruism. When the giver is seen, the "egoists" (the 40% who kept the larger share in every round of a separate game) give co-ethnics 36 USh more of a 1,000 USh pot (Table 6); a third-party enforcer erases the co-ethnic edge in cooperation and punishes co-ethnic defectors more often (Table 9). Co-ethnics find each other more often (Table 5). Tastes do not differ by group (Table 1), and co-ethnic teams are not clearly more productive (Table 4).</p>
<h3>The game</h3>
<p>You are the researcher with a budget of five of the paper's seven games. Each result is the paper's. At the end you call each mechanism; a call counts as proven only if it matches the paper's conclusion and you ran a game that backs it. The scoring is ours. One plan proves all five; it is the paper's own set of tests. The prisoners'-dilemma pair is a second route to the sanctioning verdict, but it cannot clear altruism on its own, because the paper uses the anonymous dictator game for that.</p>
<h3>What is cut</h3>
<p>Region-based and subjective (perceived) co-ethnicity, which give similar or stronger results (for example, with perceived co-ethnicity seen egoists give 52 USh more instead of 36); the 500 USh "discrimination" variant of the dictator game (anonymous: no favouritism; seen: the co-ethnic is favoured 12 points more often); the lockbox game (mentioned in the puzzle result); group-by-group survey estimates; all regression controls and fixed effects.</p>
<h3>Divergences</h3>
<p>Per-type averages in the coin games are derived from the reported overall average and the egoist coefficient. The prisoners'-dilemma gaps use the paper's subjective co-ethnicity, the only coding it reports for that game. The paper's verdict on teamwork is "only weak evidence", so "not guilty" and "can't tell" both count as right. "Watched by their own" and "Easier to find" are both called guilty: the paper names the first as the main mechanism and reads the second as what makes sanctioning possible.</p>
<h3>For the author</h3>
<p>See the author note in the repository. This game has had the builder's review only; it has not been tested with real players.</p>
"""
t = open('template.html', encoding='utf-8').read()
assert t.count('/*__MECHANISM__*/') == 1 and t.count('/*__ABOUT__*/') == 1
out = t.replace('/*__MECHANISM__*/', mech).replace('/*__ABOUT__*/', about)
name = 'the-mixed-street.html'
open(name, 'w', encoding='utf-8').write(out)
built = open(name, encoding='utf-8').read()
if mech not in built:
    sys.exit('BUILD FAILED: embedded mechanism differs from mechanism.js')
print(f'built {name}: {len(built)} bytes; mechanism embedded verbatim ({len(mech)} bytes)')
