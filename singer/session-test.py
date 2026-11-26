# Scripted sessions in headless Chromium (Playwright). Run: python3 session-test.py. Writes screenshot-*.png; prints what the board said; exits 1 on a page error.
import asyncio, os, sys
from playwright.async_api import async_playwright
URL = 'file://' + os.path.abspath('draw-a-line-with-singer.html')
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); errs = []
        # picks: round 0 taps; rounds: list of four lists of taps (toggles) for Reason, Talk, Aware, Suffer
        async def session(vw, vh, tag, picks, rounds, pick, answers, shots=True):
            ctx = await b.new_context(viewport={'width': vw, 'height': vh}, device_scale_factor=2); pg = await ctx.new_page()
            pg.on('pageerror', lambda e: errs.append('pageerror: ' + str(e)))
            pg.on('console', lambda m: errs.append('console: ' + m.text) if m.type == 'error' and 'gc.zgo' not in m.text and 'ERR_TUNNEL' not in m.text else None)
            async def shot(n, full=False):
                if shots: await pg.screenshot(path=f'screenshot-{tag}{n}.png', full_page=full)
            async def nohs(l):
                w = await pg.evaluate('document.documentElement.scrollWidth')
                if w > vw: errs.append(f'hscroll {l}: {w}')
            await pg.goto(URL); await pg.wait_for_timeout(300); await shot('start'); await nohs('start')
            await pg.click('#b-begin'); await pg.wait_for_timeout(200); await shot('one-pick-empty'); await nohs('one')
            print(tag, 'Done bottom at', await pg.evaluate("document.getElementById('b-done').getBoundingClientRect().bottom"))
            for pid in picks: await pg.click(f'.rowtap[data-id="{pid}"]'); await pg.wait_for_timeout(60)
            await shot('one-picked', True)
            await pg.click('#b-done'); await pg.wait_for_timeout(300)
            for i, lab in enumerate(['reason', 'talk', 'aware', 'suffer']):
                if i == 0: await shot('one-round1'); print(tag, 'round1 Done bottom at', await pg.evaluate("document.getElementById('b-done').getBoundingClientRect().bottom"))
                for pid in rounds[i]: await pg.click(f'.rowtap[data-id="{pid}"]'); await pg.wait_for_timeout(60)
                if rounds[i]: await shot('one-' + lab + '-moved', True)
                await pg.click('#b-done'); await pg.wait_for_timeout(1100)
                await shot('one-' + lab + '-revealed', True)
                print(tag, lab, '|', await pg.text_content('#now1'), '|', await pg.text_content('#said1'))
                await pg.click('#btns1 button'); await pg.wait_for_timeout(400)
            await shot('one-name', True)
            print(tag, 'NAME |', await pg.text_content('#now1'), '|', await pg.text_content('#rule1'), '|', await pg.text_content('#said1'))
            await pg.click('#btns1 button'); await pg.wait_for_timeout(900); await shot('one-race', True)
            await pg.click('button:has-text("And then")'); await pg.wait_for_timeout(900); await shot('one-sex', True)
            await pg.click('button:has-text("So where does the line go")'); await pg.wait_for_timeout(900); await shot('one-reply', True)
            await pg.click('button:has-text("Now you are the scientist")'); await pg.wait_for_timeout(300); await shot('two-offer', True); await nohs('two')
            if pick == 'nobody': await pg.click('#b-nobody')
            else:
                await pg.click(f'.fig[data-id="{pick}"]'); await pg.wait_for_timeout(200); await pg.click('#b-use')
            await pg.wait_for_timeout(300)
            for i, a in enumerate(answers):
                await shot(f'two-q{i + 1}', True)
                await pg.click(f'#qa button[data-o="{a}"]'); await pg.wait_for_timeout(300)
            await pg.wait_for_timeout(900); await shot('two-result', True)
            print(tag, 'EXP |', await pg.text_content('#now2'), '|', await pg.text_content('#said2'))
            await pg.click('button:has-text("The verdict")'); await pg.wait_for_timeout(300); await shot('end', True)
            print(tag, 'FATE |', await pg.text_content('#fate'), '|', (await pg.text_content('#v-part'))[:200])
            await pg.click('#b-about-end'); await pg.wait_for_timeout(200); await shot('about', True)
            await pg.click('#b-about-close'); await pg.click('#b-again'); await pg.wait_for_timeout(200)
            await ctx.close()
        H = ['adult', 'infant', 'braindam', 'disab']; A = ['chimp', 'dog', 'pig', 'horse', 'mouse']
        await session(380, 760, '', H, [[], [], [], []], 'chimp', ['human'])                                   # phone: species, unmoved
        await session(1000, 800, 'laptop-', H, [['chimp'], [], ['dog', 'pig'], ['horse', 'mouse']], 'mouse', ['none'])  # laptop: moved to Singer's by the end
        await session(380, 760, 'x-', H, [['infant', 'braindam', 'disab', 'chimp'], ['chimp'], ['chimp'], H[1:] + A], 'chimp', ['none'], False)  # ruler-led
        await session(380, 760, 'x-', H + A, [[], [], [], []], 'nobody', [], False)                              # Singer's from the start
        await session(380, 760, 'x-', ['adult', 'chimp'], [[], [], [], []], 'chimp', ['out'], False)              # a Reason line, kept
        await b.close()
        print('ERRORS:', errs or 'none'); sys.exit(1 if errs else 0)
asyncio.run(main())
