# Generates draw-a-line-with-singer.html from template.html, mechanism.js (the single source of truth), about.html and the two
# embedded fonts, then verifies byte for byte that the embedded mechanism is the file calibration.js ran against.
import base64, sys, os, subprocess
os.chdir(os.path.dirname(os.path.abspath(__file__)))
r = subprocess.run(['node', 'calibration.js'], capture_output=True, text=True)
open('calibration-result.txt', 'w', encoding='utf-8').write(r.stdout)
if r.returncode != 0:
    sys.exit('BUILD REFUSED: calibration.js failed\n' + r.stdout[-2000:])
mech = open('mechanism.js', encoding='utf-8').read()
about = open('about.html', encoding='utf-8').read()
def font(f): return base64.b64encode(open('fonts/' + f, 'rb').read()).decode()
t = open('template.html', encoding='utf-8').read()
subs = {
    '/*__F_FRED__*/': font('fredericka-the-great-latin.woff2'),
    '/*__F_ARCH__*/': font('architects-daughter-latin.woff2'),
    '/*__ABOUT__*/': about,
    '/*__MECHANISM__*/': mech,
}
for k in subs: assert t.count(k) == 1, k
for k, v in subs.items(): t = t.replace(k, v)
name = 'draw-a-line-with-singer.html'
open(name, 'w', encoding='utf-8').write(t)
built = open(name, encoding='utf-8').read()
if mech not in built:
    sys.exit('BUILD FAILED: embedded mechanism differs from mechanism.js')
print(f'built {name}: {len(built)} bytes; mechanism embedded verbatim ({len(mech)} bytes); calibration passed')
