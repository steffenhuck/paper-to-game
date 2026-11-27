# Scripted sessions for Draw a Line with Singer (revision 12), phone and laptop. Run: python3 session-test.py
import asyncio, sys, os
from playwright.async_api import async_playwright
HERE = os.path.dirname(os.path.abspath(__file__))
URL = 'file://' + os.path.join(HERE, 'draw-a-line-with-singer.html')
# guess: per rule (Reason, Talk, Aware, Suffer), the list of experiments (1-3) to tap before Check
SESSIONS = {
  'species': {1: ['horse', 'mouse'], 2: ['chimp', 'pig'], 3: ['dog'], 'guess': [[2, 3], [1, 2], [], [1, 2, 3]]},
  'singer':  {1: [], 2: ['braindam', 'chimp', 'pig'], 3: ['adult', 'infant', 'dog'], 'guess': [[], [2], [], []]},
  'refuse':  {1: [], 2: [], 3: [], 'guess': []},
  'reason':  {1: ['mouse'], 2: ['braindam'], 3: ['infant'], 'guess': [[], [3], [], [2]]},
  'mixed':   {1: ['disab'], 2: ['chimp'], 3: ['infant', 'dog'], 'guess': [[1], [1, 2, 3], [], [1]]},
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
    for i, r in enumerate(('reason', 'talk', 'aware', 'suffer')):
        await page.wait_for_timeout(300)
        if plan['guess']:
            log.append(r.upper() + ' asks: ' + (await page.inner_text('#hint1')))
            if shots and r == 'reason': await page.screenshot(path=f'screenshot-{tag}-{name}-guess.png', full_page=True)
            for k in plan['guess'][i]: await page.click(f'#btns1 button[data-k="{k}"]')
            await page.click('#b-check')
            await page.wait_for_timeout(600)
        log.append(r.upper() + ': ' + (await page.inner_text('#now1')) + ' | ' + (await page.inner_text('#said1')) + ' | ' + (await page.inner_text('#find1')))
        if shots and r in ('reason', 'suffer'): await page.screenshot(path=f'screenshot-{tag}-{name}-{r}.png', full_page=True)
        await page.click('#b-next')
    await page.wait_for_timeout(200)
    log.append('NAME: ' + (await page.inner_text('#now1')) + ' | ' + (await page.inner_text('#said1')) + ' | ' + (await page.inner_text('#find1')))
    if shots: await page.screenshot(path=f'screenshot-{tag}-{name}-name.png', full_page=True)
    await page.click('#b-next'); await page.wait_for_selector('#s-end.on')
    log.append('FATE: ' + (await page.inner_text('#fate')) + ' | ' + (await page.inner_text('#vp-yours')))
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
