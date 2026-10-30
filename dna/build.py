# Generates watsons-cardboard.html (the-other-chain.html redirects to it) from template.html, mechanism.js (the single source of truth) and the embedded fonts,
# then verifies byte for byte that the embedded mechanism is the file calibration.js ran against.
import base64, sys
mech = open('mechanism.js', encoding='utf-8').read()
font = lambda f: base64.b64encode(open('fonts/' + f, 'rb').read()).decode()
about = """
<h2>What's real here</h2>
<h3>The game in one line</h3>
<p>You build the second chain of a DNA ladder from cut-out pieces, zip it to see which rungs hold, then pull it apart and watch it copy itself. The rule that decides which rungs hold is Watson and Crick's; the pieces, their lengths and the ladder are this game's.</p>
<h3>The cardboard</h3>
<p>The pieces are cardboard because that is how the pairs were found: in February 1953 Watson cut the four bases out of stiff card, to scale, and pushed them around his desk until an adenine–thymine pair and a guanine–cytosine pair turned out to be the same shape (Watson, <i>The Double Helix</i>, 1968, ch. 26). The cardboard is history, not the letter, which says only that the structure rests on "published experimental data and stereochemical arguments". The aim, to build the other chain, is the letter's own consequence: "if the sequence of bases on one chain is given, then the sequence on the other chain is automatically determined."</p>
<h3>What the paper found</h3>
<p>In a one-page letter to <i>Nature</i> in April 1953, James Watson and Francis Crick proposed the structure of DNA. Two chains wind round the same axis, right-handed, running in opposite directions. The sugar-phosphate backbones are on the outside (Linus Pauling's model of a month earlier had three chains with the phosphates in the middle). The bases are inside, flat, and joined across in pairs by hydrogen bonds. One base of each pair must be a purine (adenine or guanine, two rings) and the other a pyrimidine (thymine or cytosine, one ring). Assuming the bases take their most plausible (keto) forms, only adenine with thymine and guanine with cytosine can bond. So the order of bases along one chain is unrestricted, but it fixes the order on the other. That explains why, as Erwin Chargaff had measured, DNA holds as much adenine as thymine and as much guanine as cytosine. And, in the letter's most famous sentence, "It has not escaped our notice that the specific pairing we have postulated immediately suggests a possible copying mechanism for the genetic material." The helix has a base pair every 3.4 Å along the axis, each turned 36° from the last, so it repeats every 10 pairs (34 Å); the phosphates sit 10 Å from the axis. The authors say the model is "roughly compatible" with the X-ray data then published and "must be regarded as unproved" until checked.</p>
<h3>Mechanism: a toy</h3>
<p><b>This game demonstrates</b> that the letter's two conditions, one purine with one pyrimidine (so every rung has the same width) and hydrogen bonds that line up (in the keto forms), leave exactly two pairs, and that this forces one chain to spell out the other, so a ladder pulled apart can be rebuilt twice over. Each condition alone would leave twice as many pairs; together they leave A–T and G–C.</p>
<p><b>It assumes</b> pieces instead of molecules. Length stands for ring size: a long piece (A, G) and a short piece (T, C) exactly span the rails; two long pieces are too wide, two short ones too narrow. The lengths are our units; any lengths with purines longer than pyrimidines give the same answer. The bumps and dents stand for hydrogen donors and acceptors at the letter's positions 6 and 1. Which base has which is standard chemistry for the keto forms, not printed in the letter. The game uses the letter's two contacts per pair; guanine and cytosine were later found to share a third. The ladder and its sequence (drawn from the game number) are ours. The end screen compares your ladder with other ways of playing, from our simulation: pinning at random holds about 2 or 3 rungs of 10, reading only the lengths or only the ends about 5, reading both all 10; the pattern of failures on your ladder (only too wide or too narrow, only bump on bump, or both) says which clue was missing.</p>
<p><b>The paper establishes</b> a proposed structure and the pairing argument behind it, from published data and stereochemistry; it says the structure is unproved. It does not describe how copying happens: the letter only says the pairing "suggests" a mechanism. The copy in this game (each half rebuilding its partner) is the version Watson and Crick set out a month later, in <i>Nature</i> 171:964, and that later experiments bore out. Neither the zip nor the copy in this game is evidence for the structure: the game shows what follows if it is right.</p>
<h3>What is cut</h3>
<p>Pauling's and Fraser's rival models; the argument that the material is a salt and that the phosphates outside give cations easy access; the water content; the reason ribose would not fit; the helix's geometry, except at the end, where the copies twist a tenth of a turn per rung, the letter's 36°, one full turn per ten rungs.</p>
<h3>The paper</h3>
<p>J. D. Watson and F. H. C. Crick, "Molecular Structure of Nucleic Acids: A Structure for Deoxyribose Nucleic Acid", <i>Nature</i> 171:737–738 (1953). doi:10.1038/171737a0. Read it at nature.com/articles/171737a0.</p>
<p><b>Game built from this paper; the paper is the authority where the two disagree.</b> It is a beta. It has had the builder's review only and has not been tested with real players. Fonts: Permanent Marker (Apache License 2.0) and Courier Prime (SIL Open Font License).</p>
"""
t = open('template.html', encoding='utf-8').read()
for k in ['/*__MECHANISM__*/', '/*__ABOUT__*/', '/*__FONT_MARKER__*/', '/*__FONT_TYPE__*/', '/*__FONT_TYPE_BOLD__*/']:
    assert t.count(k) == 1, k
out = (t.replace('/*__FONT_MARKER__*/', font('marker.woff2')).replace('/*__FONT_TYPE_BOLD__*/', font('prime-700.woff2'))
        .replace('/*__FONT_TYPE__*/', font('prime-400.woff2')).replace('/*__ABOUT__*/', about).replace('/*__MECHANISM__*/', mech))
name = 'watsons-cardboard.html'
open(name, 'w', encoding='utf-8').write(out)
built = open(name, encoding='utf-8').read()
if mech not in built:
    sys.exit('BUILD FAILED: embedded mechanism differs from mechanism.js')
print(f'built {name}: {len(built)} bytes; mechanism embedded verbatim ({len(mech)} bytes)')
open('the-other-chain.html', 'w', encoding='utf-8').write('<!doctype html><meta charset="utf-8"><meta http-equiv="refresh" content="0; url=watsons-cardboard.html"><title>Watson\'s Cardboard</title><p>This game is now <a href="watsons-cardboard.html">Watson\'s Cardboard</a>.</p>')
