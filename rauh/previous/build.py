# Generates say-it-plainly.html from template.html and mechanism.js (the single source of truth),
# then verifies byte for byte that the embedded mechanism is the file the fidelity check ran against.
import sys
mech = open('mechanism.js', encoding='utf-8').read()
about = """
<h3>Fidelity: two parts, labelled</h3>
<p><b>The two guesses are the study's data.</b> Every dot and the yearly line are averages the paper reports in its Figure 2, read off the figure (to about ±1 reading-ease point; the paper gives no table). <b>The edit is a working model of the study's measure.</b> The score is the Flesch reading-ease formula, exactly as the study uses it: 206.835 − 1.015 × (words per sentence) − 84.6 × (syllables per word). The press release and its rewrites are ours, written in the Commission's usual style. It is not a real release.</p>
<p><b>It demonstrates</b> where Commission press releases sit against national governments, academics and newspapers; that they did not get easier from 1985 to 2020; and how the study's main measure responds to shorter sentences, shorter words and verbs. <b>It assumes</b> our invented release, our rewrites, our two-edit budget and our syllable counter (checked by hand for every word in the game). <b>The paper establishes</b> the averages across 44,978 Commission releases, 92,070 UK and Irish government releases, 2,332 political-science abstracts and about 80,000 newspaper paragraphs, and that the gap holds within topics (56 of 60 topic-by-measure comparisons, Figure 3) and after matching on topics. It does not test rewrites of any release, and it does not claim that clearer releases would change what Europeans think.</p>
<h3>The three measures</h3>
<p><b>Reading ease</b> (Flesch 1948): sentence length and word length. <b>Familiar words</b>: how often the words appear in the Google Books corpus for that decade, relative to "the". <b>Verbs, not nouns</b>: the share of verbs among all verbs and nouns; noun-heavy "nominal style" hides who does what. The game computes only the first live; the other two appear as the study's values, because we cannot reproduce the study's Google Books data or its part-of-speech tagging on the same scale.</p>
<h3>The discovery</h3>
<p>The Commission's political power and public controversy both grew over these 35 years, and it repeatedly promised better communication. Its press releases stayed about as hard to read as academic prose, harder than two national governments and far harder than newspapers — and the yearly average did not move. Only word choice became slightly more familiar.</p>
<h3>What is cut</h3>
<p>Figure 1 (the number of releases per month: about 100 a month by the 1990s, around 150 under Prodi and Barroso, slightly more than 50 under Juncker, as social media took over); the topic-by-topic detail of Figure 3; the topic-matching check (Appendix B); the study's discussion of the Commission's history of public communication.</p>
<h3>Divergences</h3>
<p>Benchmark values are read off a figure. Our release starts at 21, a little below the Commission's 26.7 average and well inside the spread of individual releases. The UK government line as the aim and the two-edit budget are ours: with two edits, about one plan in four reaches the line. The lesson the end screen draws (long words weigh heavily) holds on the study's formula; on a related formula that weighs sentence length more (Flesch–Kincaid grade), splitting sentences counts for more, though the single best edit — rewriting the quote — is the same.</p>
<h3>For the author</h3>
<p>See the author note in the repository. This game has had the builder's review only; it has not been tested with real players.</p>
"""
t = open('template.html', encoding='utf-8').read()
assert t.count('/*__MECHANISM__*/') == 1 and t.count('/*__ABOUT__*/') == 1
out = t.replace('/*__MECHANISM__*/', mech).replace('/*__ABOUT__*/', about)
name = 'say-it-plainly.html'
open(name, 'w', encoding='utf-8').write(out)
built = open(name, encoding='utf-8').read()
if mech not in built:
    sys.exit('BUILD FAILED: embedded mechanism differs from mechanism.js')
print(f'built {name}: {len(built)} bytes; mechanism embedded verbatim ({len(mech)} bytes)')
