# Generates beam-me-up-leibniz.html from template.html and the embedded fonts.
import base64, os
os.chdir(os.path.dirname(os.path.abspath(__file__)))
def font(f): return base64.b64encode(open('fonts/' + f, 'rb').read()).decode()
t = open('template.html', encoding='utf-8').read()
subs = {'/*__F_MICHROMA__*/': font('michroma-400-latin.woff2'), '/*__F_OUTFIT__*/': font('outfit-var-latin.woff2')}
for k in subs: assert t.count(k) == 1, k
for k, v in subs.items(): t = t.replace(k, v)
open('beam-me-up-leibniz.html', 'w', encoding='utf-8').write(t)
print('built beam-me-up-leibniz.html:', len(t), 'bytes')
