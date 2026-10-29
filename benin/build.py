# Generates the-honest-billboard.html from template.html and mechanism.js (the single source of truth),
# then verifies byte for byte that the embedded mechanism is the file the fidelity check ran against.
import sys
mech = open('mechanism.js', encoding='utf-8').read()
about = """
<h3>Fidelity: statistical, from reported distributions only</h3>
<p>Nothing in this game is simulated or random. Every share comes from a histogram or stacked bar in the paper, read off the figure, or from a number in its text. The 100 dots show shares; they are not individual people.</p>
<p><b>It demonstrates</b> where Benin City's survey answers sat relative to the true values, item by item. <b>It assumes</b> three things of ours: where "about right" ends (within a factor of 1.5 for money, 7.5 points for the asylum rate; the conclusions hold from 1.25 to 2 and from 5 to 10 points); that guesses are spread evenly within each histogram bar; and that a fact worse than your guess makes the option look worse to you. That is a statement about beliefs, not behaviour. <b>The paper establishes</b> the distribution of beliefs in a representative 2018 sample of one city. It does not test any campaign, and nothing here says anyone would stay or go.</p>
<h3>What the paper hands over</h3>
<p>A survey of 555 households in Benin City (October–November 2018), with incentivised best guesses about Europe (Fig. 8), the journey (Figs. 11, 14, 15), asylum (Fig. 17) and the respondent's own chances (Fig. 16), plus interviews with ten returnees. The true values are the paper's: GNI per capita in the EU in 2017; the maximum Italian (NASpI) and British (Jobseeker's Allowance) benefits; 28,130 of 122,040 Nigerian asylum claims accepted in 2011–2017.</p>
<h3>The discovery</h3>
<p>Campaigns assume would-be migrants overrate Europe. In the survey they did not: their guesses about Europe were about right or too gloomy (the typical guess of European income was €660 a month, against about €2,500). What they got wrong was the journey and their own odds: four in five thought they personally would make it to Europe, and most overestimated the asylum rate. So an honest message about Europe backfires; an honest message about the road lands.</p>
<h3>The "making it" billboard</h3>
<p>The fact ("most who set out never get past Libya") is the paper's footnote 34; the paper does not know the exact share. The comparison is between a person's view of their own chances and a fact about everyone who tries. Any one person might be right to be confident; on average, the paper says, respondents vastly overestimate their odds.</p>
<h3>What is cut</h3>
<p>Life expectancy (not a campaign message); the risk histograms for injury, death, abuse and slavery (no true value exists to compare with); the splits by interest in migrating, by family migration and by gender (the paper reports the key patterns hold in each); community norms; self-reported uncertainty.</p>
<h3>Divergences</h3>
<p>Benefits are shown monthly, as the paper plots them (it asked weekly). The paper's € axis comes from naira; we place its ticks at about ₦415 per euro, which reproduces every label and the €660 median. "Don't know" answers count as "knew it / no change", never as warned.</p>
<h3>For the author</h3>
<p>See the author note in the repository. This game has had the builder's review only; it has not been tested with real players.</p>
"""
t = open('template.html', encoding='utf-8').read()
assert t.count('/*__MECHANISM__*/') == 1 and t.count('/*__ABOUT__*/') == 1
out = t.replace('/*__MECHANISM__*/', mech).replace('/*__ABOUT__*/', about)
name = 'the-honest-billboard.html'
open(name, 'w', encoding='utf-8').write(out)
built = open(name, encoding='utf-8').read()
if mech not in built:
    sys.exit('BUILD FAILED: embedded mechanism differs from mechanism.js')
print(f'built {name}: {len(built)} bytes; mechanism embedded verbatim ({len(mech)} bytes)')
