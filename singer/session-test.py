# Scripted sessions for Draw a Line with Singer (revision 8), phone and laptop. Run: python3 session-test.py
import asyncio, sys, os
from playwright.async_api import async_playwright
HERE = os.path.dirname(os.path.abspath(__file__))
URL = 'file://' + os.path.join(HERE, 'draw-a-line-with-singer.html')
SESSIONS = {
  'species': {1: ['mouse'], 2: ['mouse', 'chimp'], 3: ['mouse', 'chimp', 'braindam', 'infant'], 'ans': {'infant': 'yes', 'braindam': 'yes', 'chimp': 'yes', 'mouse': 'yes'}},
  'singer':  {1: [], 2: ['infant', 'braindam', 'chimp', 'mouse'], 3: ['infant', 'braindam', 'chimp', 'mouse'], 'ans': {'infant': 'yes', 'braindam': 'yes', 'chimp': 'yes', 'mouse': 'yes'}},
  'refuse':  {1: [], 2: [], 3: [], 'ans': {'infant': 'yes', 'braindam': 'yes', 'chimp': 'yes', 'mouse': 'yes'}},
  'reason':  {1: ['braindam'], 2: ['braindam', 'infant', 'mouse'], 3: ['braindam', 'infant', 'mouse', 'chimp'], 'ans': {'infant': 'yes', 'braindam': 'yes', 'chimp': 'yes', 'mouse': 'yes'}},
  'mixed':   {1: ['infant'], 2: ['infant', 'chimp'], 3: ['infant', 'chimp', 'mouse'], 'ans': {'infant': 'yes', 'braindam': 'no', 'chimp': 'yes', 'mouse': 'no'}},
}
async def play(page, name, plan, shots, tag):
    log = []
    await page.goto(URL); await page.click('#b-begin')
    for n in (1, 2, 3):
        await page.wait_for_selector('#s-exp.on')
        # set ticks exactly: untick all, then tick plan
        for id in ['infant', 'braindam', 'chimp', 'mouse']:
            on = await page.eval_on_selector(f'#gridE .fig[data-id={id}]', 'e => e.classList.contains("tick")')
            want = id in plan[n]
            if on != want: await page.click(f'#gridE .fig[data-id={id}]')
        if shots and n == 1: await page.screenshot(path=f'screenshot-{tag}-{name}-exp1.png', full_page=True)
        log.append(f'exp{n}: ' + (await page.inner_text('#hintE')))
        await page.click('#b-doneE')
    await page.wait_for_selector('#s-one.on')
    log.append('LINE: ' + (await page.inner_text('#rule1')))
    if shots: await page.screenshot(path=f'screenshot-{tag}-{name}-line.png', full_page=True)
    await page.click('#b-next')
    for r in ('reason', 'talk', 'aware'):
        await page.wait_for_timeout(500)
        log.append(r.upper() + ': ' + (await page.inner_text('#now1')) + ' | ' + (await page.inner_text('#said1')))
        if shots and r == 'reason': await page.screenshot(path=f'screenshot-{tag}-{name}-reason.png', full_page=True)
        await page.click('#b-next')
    await page.wait_for_selector('#ask', state='visible')
    for id, a in plan['ans'].items(): await page.click(f'#ask .askrow[data-id={id}] button[data-a={a}]')
    if shots: await page.screenshot(path=f'screenshot-{tag}-{name}-ask.png', full_page=True)
    await page.click('#b-next'); await page.wait_for_timeout(500)
    log.append('SUFFER: ' + (await page.inner_text('#now1')) + ' | ' + (await page.inner_text('#said1')))
    if shots: await page.screenshot(path=f'screenshot-{tag}-{name}-suffer.png', full_page=True)
    await page.click('#b-next')
    log.append('NAME: ' + (await page.inner_text('#now1')) + ' | ' + (await page.inner_text('#said1')) + ' | ' + (await page.inner_text('#find1')))
    if shots: await page.screenshot(path=f'screenshot-{tag}-{name}-name.png', full_page=True)
    for k in range(3):
        await page.click('#b-next'); await page.wait_for_timeout(700)
        log.append(f'MIRROR{k+1}: ' + (await page.inner_text('#now1')))
        if shots and k == 0: await page.screenshot(path=f'screenshot-{tag}-{name}-race.png', full_page=True)
    log.append('REPLY: ' + (await page.inner_text('#reply1')))
    await page.click('#b-next'); await page.wait_for_selector('#s-end.on')
    log.append('FATE: ' + (await page.inner_text('#fate')))
    log.append('PART: ' + (await page.inner_text('#v-part')))
    if shots: await page.screenshot(path=f'screenshot-{tag}-{name}-end.png', full_page=True)
    return log
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        for tag, vp in (('phone', (380, 760)), ('laptop', (1000, 800))):
            page = await b.new_page(viewport={'width': vp[0], 'height': vp[1]})
            errs = []; page.on('pageerror', lambda e: errs.append(str(e)))
            for name, plan in SESSIONS.items():
                log = await play(page, name, plan, tag == 'phone' or name == 'species', tag)
                print(f'\n=== {tag} / {name} ==='); print('\n'.join(log))
            if errs: print('PAGE ERRORS', errs); sys.exit(1)
        await b.close()
asyncio.run(main())
