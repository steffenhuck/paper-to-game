# Generates test-it-like-turing.html from template.html, mechanism.js (the single source of truth), about.html and the
# embedded font, then verifies byte for byte that the embedded mechanism is the file calibration.js ran against.
import base64, sys, os
os.chdir(os.path.dirname(os.path.abspath(__file__)))
mech = open('mechanism.js', encoding='utf-8').read()
about = open('about.html', encoding='utf-8').read()
def font(f): return base64.b64encode(open('fonts/' + f, 'rb').read()).decode()
t = open('template.html', encoding='utf-8').read()
subs = {
    '/*__F_VT323__*/': font('VT323-400-latin.woff2'),
    '/*__ABOUT__*/': about,
    '/*__MECHANISM__*/': mech,
}
for k in subs: assert t.count(k) == 1, k
for k, v in subs.items(): t = t.replace(k, v)
name = 'test-it-like-turing.html'
open(name, 'w', encoding='utf-8').write(t)
built = open(name, encoding='utf-8').read()
if mech not in built:
    sys.exit('BUILD FAILED: embedded mechanism differs from mechanism.js')
print(f'built {name}: {len(built)} bytes; mechanism embedded verbatim ({len(mech)} bytes)')
