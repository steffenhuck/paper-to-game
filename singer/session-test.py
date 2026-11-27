# Scripted sessions for Draw a Line with Singer (revision 9), phone and laptop. Run: python3 session-test.py
import asyncio, sys, os
from playwright.async_api import async_playwright
HERE = os.path.dirname(os.path.abspath(__file__))
URL = 'file://' + os.path.join(HERE, 'draw-a-line-with-singer.html')
NINE = ['adult', 'infant', 'braindam', 'disab', 'chimp', 'dog', 'pig', 'horse', 'mouse']
def yes(*no): return {id: ('no' if id in no else 'yes') for id in NINE}
SESSIONS = {
  'species': {1: ['horse', 'mouse', 'stone'], 2: ['chimp', 'pig'], 3: ['dog'], 'ans': yes(), 'guess': ['agree', 'object', 'object']},
  'singer':  {1: ['stone'], 2: ['braindam', 'chimp', 'pig'], 3: ['adult', 'infant', 'dog'], 'ans': yes(), 'guess': ['agree', 'agree', 'agree']},
  'refuse':  {1: [], 2: [], 3: [], 'ans': yes(), 'guess': []},
  'reason':  {1: ['mouse', 'stone'], 2: ['braindam'], 3: ['infant'], 'ans': yes(), 'guess': ['agree', 'object', 'agree']},
  'mixed':   {1: ['disab', 'stone'], 2: ['chimp'], 3: ['infant', 'dog'], 'ans': yes('mouse', 'pig'), 'guess': ['object', 'object', 'agree']},
  'species-no': {1: ['horse', 'mouse', 'stone'], 2: ['chimp', 'pig'], 3: ['dog'], 'ans': yes('chimp', 'dog', 'pig', 'horse', 'mouse'), 'guess': ['object', 'object', 'object']},
}
async def play(page, name, plan, shots, tag):
    log = []
    await page.goto(URL); await page.click('#b-begin')
    for n in (1, 2, 3):
        await page.wait_for_selector('#s-exp.on')
        ids = await page.eval_on_selector_all('#gridE .fig', 'es => es.map(e => e.getAttribute("data-id"))')
        for id in ids:
            on = await page.eval_on_selector(f'#gridE .fig[data-id={id}]', 'e => e.classList.contains("tick")')
            if on != (id in plan[n]): await page.click(f'#gridE .fig[data-id={id}]')
        if shots and n == 1: await page.screenshot(path=f'screenshot-{tag}-{name}-exp1.png', full_page=True)
        log.append(f'exp{n} menu {ids}: ' + (await page.inner_text('#hintE')))
        await page.click('#b-doneE')
    await page.wait_for_selector('#s-one.on')
    log.append('DID: ' + (await page.inner_text('#rule1')))
    if shots: await page.screenshot(path=f'screenshot-{tag}-{name}-did.png', full_page=True)
    await page.click('#b-next')
    for i, r in enumerate(('reason', 'talk', 'aware')):
        await page.wait_for_timeout(300)
        if plan['guess']:
            log.append(r.upper() + ' asks: ' + (await page.inner_text('#hint1')))
            await page.click('#b-agree' if plan['guess'][i] == 'agree' else '#b-object')
            await page.wait_for_timeout(500)
        log.append(r.upper() + ': ' + (await page.inner_text('#now1')) + ' | ' + (await page.inner_text('#said1')) + ' | ' + (await page.inner_text('#find1')))
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
