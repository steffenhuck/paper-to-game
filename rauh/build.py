# Generates live-from-brussels.html from template.html, mechanism.js (the single source of truth) and the fonts,
# then verifies byte for byte that the embedded mechanism is the file the calibration check ran against.
import base64, sys
mech = open('mechanism.js', encoding='utf-8').read()
def font(name, file):
    b = base64.b64encode(open('fonts/' + file, 'rb').read()).decode()
    return "@font-face{font-family:'%s';src:url(data:font/woff2;base64,%s) format('woff2');font-display:swap}" % (name, b)
fonts = '\n'.join([font('Disp', 'disp.woff2'), font('Mono', 'mono.woff2'), font('Body', 'body.woff2')])
about = """
<p><b>Paper.</b> Christian Rauh (2023). Clear messages to the European public? The language of European Commission press releases 1985–2020. <i>Journal of European Integration</i> 45(4): 683–701. <a href="https://doi.org/10.1080/07036337.2022.2134860">doi:10.1080/07036337.2022.2134860</a>. Game built from this paper; the paper is the authority where the two disagree.</p>

<h3>What the study found</h3>
<p>Rauh measured all 44,978 English press releases the European Commission issued from 1985 to 2020, and compared them with 92,070 UK and Irish government press releases, 2,332 political-science journal abstracts, and about 80,000 paragraphs from the politics pages of broadsheet and tabloid newspapers. On three yardsticks — <b>reading ease</b> (short sentences, short words), <b>familiar words</b> (how common the words are in Google Books) and <b>focus on action</b> (verbs rather than nouns) — the Commission is harder to follow than both governments and far harder than any newspaper. On reading ease it sits between the governments and the professors; on familiar words it is worse than the professors. The gap holds within the same topics, and after matching texts on topic. And over 35 years in which the Commission gained power and became publicly contested, the yearly average hardly moved; only word choice became a little more familiar.</p>

<h3>What kind of game this is</h3>
<p><b>Reconstructed, with a toy on top.</b> The bars and the yearly line are the paper’s reported averages, read off its Figure 2 (to about half a reading-ease point; the paper gives no table). The scripts are ours: one invented text per writer, all on the same story, each written so that its reading-ease score — with syllables counted by hand, exactly as shown on the prompter — matches the paper’s average for that writer, within a point and a half. None is a real press release. The drum is a toy reading of the formula: syllables per word become taps per beat, and a long sentence becomes the breath that quickens the beat.</p>
<p><b>It demonstrates</b> what a text at each writer’s average score is like to get through, word by word, and that under this game’s rules a script at the Commission’s score is much harder to get out than one at a tabloid’s, and close to one at a professor’s. <b>It assumes</b> our scripts (real releases vary widely around the average; ours is one point in that cloud), our beat, our breath rule, our tolerance (a word counts with its syllables in taps, or one more) and our windows. <b>The paper establishes</b> the averages over the full collections, the within-topic gaps and the flat yearly line. It says nothing about reading aloud, tapping, or how much any reader understood; the lit windows are a measure of your thumbs, not of comprehension.</p>
<p>A calibration check (in the repository) confirms that the game’s difficulty trades sentence length against word length at roughly the formula’s rate, and that the ordering tabloid → UK → Brussels → professor survives different splits of each score between long words and long sentences, different beats, and stricter or looser tap rules. At two-thumb speed the UK and Brussels scripts are about level; the gap is felt by slower tappers.</p>

<h3>Why it might be so</h3>
<p>The paper does not say, and neither does the game. It names three explanations for future research: a deep-rooted self-image as an expert body; consensus-seeking between the Commission’s own departments; and strategic caution, keeping stances vague when member governments or the public are at odds.</p>

<h3>What is cut</h3>
<p>Figure 1 (how many releases a month: about 100 by the 1990s, 150 under Prodi and Barroso, just over 50 under Juncker as social media took over); the topic-by-topic detail of Figure 3; the topic-matching check; the history of the Commission’s communication policy; the Irish government and broadsheets as items you read (they appear on the end screen).</p>

<h3>Divergences</h3>
<p>All scripts invented, on one story, so that only the writing differs (the paper shows the gap is not about topics). Archive years: three of 35, chosen for spread. The encore is our own plain rewrite: the paper argues that clarity is possible without “dumbing down”, but does not test rewrites.</p>

<h3>Credits</h3>
<p>Type: Inter Display and JetBrains Mono (SIL Open Font License), embedded. This game has had the builder’s review only; it has not yet been tested with real players.</p>
"""
t = open('template.html', encoding='utf-8').read()
for k in ('/*__MECHANISM__*/', '/*__ABOUT__*/', '/*__FONTS__*/'):
    assert t.count(k) == 1, k
out = t.replace('/*__FONTS__*/', fonts).replace('/*__ABOUT__*/', about).replace('/*__MECHANISM__*/', mech)
name = 'live-from-brussels.html'
open(name, 'w', encoding='utf-8').write(out)
built = open(name, encoding='utf-8').read()
if mech not in built:
    sys.exit('BUILD FAILED: embedded mechanism differs from mechanism.js')
print(f'built {name}: {len(built)} bytes; mechanism embedded verbatim ({len(mech)} bytes)')
