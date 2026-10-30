# Generates not-in-the-book.html from template.html, mechanism.js (the single source of truth) and the
# embedded fonts, then verifies byte for byte that the embedded mechanism is the file calibration.js ran against.
import base64, sys, os
os.chdir(os.path.dirname(os.path.abspath(__file__)))
mech = open('mechanism.js', encoding='utf-8').read()
font = lambda f: base64.b64encode(open('fonts/' + f, 'rb').read()).decode()
about = """
<h3>The game in one line</h3>
<p>A showman says his endless book holds every row of m's and w's. You write your own row letter by letter; each letter strikes out the rows that disagree with it there; against the endless book you can never strike them all, until you take Cantor's bargain and strike row 1 with letter 1, row 2 with letter 2, and so on. Then no row survives, the Lister's book is shown incomplete, and adding your row to it only makes a new missing row.</p>
<h3>What the paper found</h3>
<p>In 1891, in the first volume of the journal of the German Mathematical Union, Georg Cantor gave a new proof that some infinite collections are too big to be counted off as first, second, third, and so on. In 1874 he had proved it for the real numbers, by a harder route. Here he takes two characters, m and w, and the collection M of all endless rows of them, such as (m, m, m, …), (w, w, w, …) and (m, w, m, w, …). Suppose someone claims to have listed every row: E1, E2, E3, …. Write the list as a grid. Build a new row E0 by going down the diagonal, the first letter of row 1, the second letter of row 2, the third letter of row 3, and writing the other letter each time. E0 cannot be row u for any u, because at letter u it differs from row u by construction. So the list missed one, whatever the list was: M cannot be put in the form E1, E2, E3, …. M does not have the "power" of the whole numbers. In the second half of the paper, which this game leaves out, Cantor extends the argument to the collection of all ways of marking the elements of any set L with m or w, concluding that there is no greatest power: no biggest infinity.</p>
<h3>Mechanism: ported</h3>
<p><b>This game demonstrates</b> Cantor's construction, run as written: for the ten rows of the last round, your letter u is set against row u's letter u, and the rule "write the other letter" leaves every row struck by its own number; adding your row to the book and running the rule again produces another row the book misses. The check that ships with the game runs the construction on hundreds of lists, random and adversarial, and on the paper's own three examples (which give E0 = w, m, w, …).</p>
<p><b>It assumes</b> the game's framing. The rows in the paper are endless; the page shows six or ten letters and the contest runs on those. The Lister who turns to rows further down (round 2) and who writes each row to copy what you have written so far (round 3) is this game's dramatisation of the claim that an endless book contains everything; the paper's list is fixed in advance, and the rule beats a fixed list just as well, which is what the end screen shows. Striking the most rows per letter, the trick that wins round 1, is a strategy the small book rewards and the paper does not discuss. "Row u by letter u" is Cantor's own bookkeeping, drawn as a line; any pairing of rows with letters would do, and the game uses his.</p>
<p><b>The paper establishes</b> that no sequence E1, E2, E3, … can contain every element of M, and so that M is not countable; the game's rounds are not evidence for this, they show the construction that proves it. The paper does not say anything about strategies, deadlines or showmen; those are the game's. The conclusion the game states, that there are more such rows than whole numbers, is the paper's; "some infinities are bigger than others" is the plain-language form of its claim that M does not have the power of the number series 1, 2, 3, ….</p>
<h3>What is cut</h3>
<p>The second half of the paper (the generalisation to any set L and the theorem that powers have no maximum); the 1874 proof and the remark that this one does not need the irrational numbers; Cantor's words for manifold, totality and power; the real numbers, which the game never mentions.</p>
<h3>The paper</h3>
<p>Georg Cantor, "Über eine elementare Frage der Mannigfaltigkeitslehre", <i>Jahresbericht der Deutschen Mathematiker-Vereinigung</i> 1 (1890–91): 75–78. No DOI. Read it, with an English translation, at logicmuseum.com/cantor/diagarg.htm (the Logic Museum); the game was built from that page's first half, which contains the diagonal argument.</p>
<p><b>Game built from this paper; the paper is the authority where the two disagree.</b> It is a beta. It has had the builder's review only and has not been tested with real players. Fonts: Rye, Alfa Slab One and Work Sans (SIL Open Font License). Book numbers are game seeds: the same number gives the same books, and the number is in the page address.</p>
"""
t = open('template.html', encoding='utf-8').read()
keys = ['/*__MECHANISM__*/', '/*__ABOUT__*/', '/*__FONT_RYE__*/', '/*__FONT_ALFA__*/', '/*__FONT_WORK__*/', '/*__FONT_WORK_BOLD__*/']
for k in keys:
    assert t.count(k) == 1, k
out = (t.replace('/*__FONT_RYE__*/', font('rye.woff2')).replace('/*__FONT_ALFA__*/', font('alfa.woff2'))
        .replace('/*__FONT_WORK_BOLD__*/', font('work-700.woff2')).replace('/*__FONT_WORK__*/', font('work-400.woff2'))
        .replace('/*__ABOUT__*/', about).replace('/*__MECHANISM__*/', mech))
name = 'not-in-the-book.html'
open(name, 'w', encoding='utf-8').write(out)
built = open(name, encoding='utf-8').read()
if mech not in built:
    sys.exit('BUILD FAILED: embedded mechanism differs from mechanism.js')
print(f'built {name}: {len(built)} bytes; mechanism embedded verbatim ({len(mech)} bytes)')
