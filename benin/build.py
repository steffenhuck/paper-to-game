# Generates ask-first.html from template.html and mechanism.js (the single source of truth),
# inlines the two OFL fonts as data, then verifies byte for byte that the embedded mechanism
# is the file the calibration check ran against.
import base64, sys

mech = open('mechanism.js', encoding='utf-8').read()

def face(family, path, weight, urange=None):
    data = base64.b64encode(open(path, 'rb').read()).decode('ascii')
    ur = f' unicode-range: {urange};' if urange else ''
    return (f"@font-face {{ font-family: '{family}'; font-style: normal; font-weight: {weight}; font-display: swap;"
            f" src: url(data:font/woff2;base64,{data}) format('woff2');{ur} }}\n")

fonts = (face('Bangers', 'fonts-src/bangers-latin.woff2', 400,
              'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD')
         + face('Bangers', 'fonts-src/bangers-ext.woff2', 400, 'U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C4, U+2113, U+2C60-2C7F, U+A720-A7FF')
         + face('Comic Neue', 'fonts-src/comicneue-400.woff2', 400)
         + face('Comic Neue', 'fonts-src/comicneue-700.woff2', 700))

about = """
<h3>What kind of game this is</h3>
<p><b>Reconstructed, from the paper's reported distributions.</b> Every share in the game comes from a histogram or a stacked bar in the paper, read off the figure because no microdata were available. The people at the doors are invented: their names, ages and faces are ours. Each person answers one question, and the answer is a single random draw from that question's distribution in the survey. The full-survey strips at the end are the paper's shares, scaled to 100 readers.</p>
<p><b>It demonstrates</b> where Benin City's survey answers sat relative to the true values, item by item, and how a small street sample can mislead where the city is split.</p>
<p><b>It assumes</b> four things of ours:</p>
<ul>
<li>where "about right" ends: within a factor of 1.5 for money, 7.5 points for the asylum rate. The right stamps are the same from 1.25 to 2, and from 5 to 10 points.</li>
<li>that guesses are spread evenly within each histogram bar.</li>
<li>that a fact worse than your belief makes the option look worse to you. That is a statement about beliefs, not behaviour.</li>
<li>the rule for a right stamp: print if a poster warns more people than it backfires on.</li>
</ul>
<p><b>The paper establishes</b> the distribution of beliefs in a representative 2018 sample of one city. It does not test any poster or campaign, and nothing here says anyone would stay or go.</p>
<h3>What the paper hands over</h3>
<p>A survey of 555 households in Benin City (October&ndash;November 2018), one person aged 18&ndash;34 in each. Respondents gave incentivised best guesses, earning &#8358;50 of phone credit for each answer in the top half. The guesses covered:</p>
<ul>
<li>Europe (Fig. 8);</li>
<li>the journey (Figs. 11, 14, 15);</li>
<li>asylum (Fig. 17);</li>
<li>their own chances (Fig. 16).</li>
</ul>
<p>There were also interviews with ten returnees. The true values are the paper's:</p>
<ul>
<li>EU GNI per capita in 2017;</li>
<li>the maximum Italian (NASpI) and British (Jobseeker's Allowance) benefits;</li>
<li>28,130 of 122,040 Nigerian asylum claims accepted in 2011&ndash;2017.</li>
</ul>
<h3>The discovery</h3>
<p>Campaigns assume would-be migrants overrate Europe. In the survey they did not. Their guesses about Europe were about right or too gloomy: the typical guess of European income was &euro;660 a month, against about &euro;2,500. What they got wrong was the journey and their own odds. Four in five thought they personally would make it to Europe, and most overestimated the asylum rate. So an honest message about Europe backfires, and an honest message about the road lands. The paper's advice is the game's title: find out what people believe before telling them.</p>
<h3>The posters</h3>
<p>The six posters are ours, modelled on the real campaigns the paper shows (Danish benefit adverts, &ldquo;Telling the Real Story&rdquo;). Their facts are the paper's.</p>
<p>THE ROAD (&ldquo;most who set out never get past Libya&rdquo;) is the paper's footnote 34. The paper does not know the exact share. That poster compares a person's view of their own chances with a fact about everyone who tries. Any one person might be right to be confident. On average, the paper says, respondents vastly overestimate their odds.</p>
<h3>What is cut</h3>
<ul>
<li>Life expectancy: it is not a campaign message.</li>
<li>The risk guesses for injury, death, abuse and slavery: there is no true value to compare with.</li>
<li>The splits by interest in migrating, by migrant family and by gender: the paper reports the key patterns hold in each.</li>
<li>Community norms and self-reported uncertainty.</li>
</ul>
<h3>Divergences</h3>
<ul>
<li>Benefits are shown monthly, as the paper plots them. The survey asked weekly.</li>
<li>The paper's &euro; axis comes from naira. We place its ticks at about &#8358;415 per euro, which reproduces every label and the &euro;660 median.</li>
<li>&ldquo;Don't know&rdquo; answers count as white notes (nothing new), never as warned.</li>
<li>The survey took two months and reached 555 homes; your street has twelve gates.</li>
</ul>
<h3>Fonts</h3>
<p>Bangers (Vernon Adams) and Comic Neue (Craig Rozynski), both under the SIL Open Font License.</p>
<h3>For the author</h3>
<p>See the author note in the repository. This game has had the builder's review only. It has not been tested with real players.</p>
"""

t = open('template.html', encoding='utf-8').read()
for k in ('/*__MECHANISM__*/', '/*__ABOUT__*/', '/*__FONTS__*/'):
    assert t.count(k) == 1, k
out = t.replace('/*__FONTS__*/', fonts).replace('/*__ABOUT__*/', about).replace('/*__MECHANISM__*/', mech)
name = 'ask-first.html'
open(name, 'w', encoding='utf-8').write(out)
built = open(name, encoding='utf-8').read()
if mech not in built:
    sys.exit('BUILD FAILED: embedded mechanism differs from mechanism.js')
print(f'built {name}: {len(built)} bytes; mechanism embedded verbatim ({len(mech)} bytes)')
