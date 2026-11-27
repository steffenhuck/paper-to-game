# Scripted sessions in headless Chromium (Playwright). Run: python3 session-test.py. Writes screenshot-*.png; prints what the board said; exits 1 on a page error.
import asyncio, os, sys
from playwright.async_api import async_playwright
URL = 'file://' + os.path.abspath('draw-a-line-with-singer.html')
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); errs = []
        # picks: round 0 taps; rounds: list of four lists of taps (toggles) for Reason, Talk, Aware, Suffer
        async def session(vw, vh, tag, picks, rounds, pick, answers, shots=True, suffer=None):
            suffer = suffer or {}
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
            for i, lab in enumerate(['reason', 'talk', 'aware']):
                await pg.wait_for_timeout(700); await shot('one-' + lab, True)
                if i == 0: print(tag, 'round1 Done bottom at', await pg.evaluate("document.getElementById('b-done').getBoundingClientRect().bottom"))
                print(tag, lab, 'before |', await pg.text_content('#now1'), '|', (await pg.text_content('#said1'))[:150])
                for pid in rounds[i]: await pg.click(f'.rowtap[data-id="{pid}"]'); await pg.wait_for_timeout(80)
                if rounds[i]: await shot('one-' + lab + '-moved', True); print(tag, lab, 'after  |', await pg.text_content('#now1'), '|', (await pg.text_content('#said1'))[:150])
                await pg.click('#b-done'); await pg.wait_for_timeout(400)
            # Suffer: asked, not shown
            await shot('one-suffer-ask', True); print(tag, 'suffer ask |', await pg.text_content('#now1'), '|', await pg.text_content('#hint1'))
            rows = await pg.query_selector_all('.askrow')
            for k, row in enumerate(rows):
                rid = await row.get_attribute('data-id')
                a = 'yes' if (suffer.get(rid, True)) else 'no'
                await row.query_selector(f'button[data-a="{a}"]').then(lambda b: b.click()) if False else (await (await row.query_selector(f'button[data-a="{a}"]')).click())
                await pg.wait_for_timeout(50)
            if rows: await shot('one-suffer-answered', True); await pg.click('#b-done'); await pg.wait_for_timeout(900)
            await shot('one-suffer', True); print(tag, 'suffer |', await pg.text_content('#now1'), '|', (await pg.text_content('#said1'))[:220])
            for pid in rounds[3]: await pg.click(f'.rowtap[data-id="{pid}"]'); await pg.wait_for_timeout(80)
            if rounds[3]: await shot('one-suffer-moved', True); print(tag, 'suffer after |', await pg.text_content('#now1'), '|', (await pg.text_content('#said1'))[:220])
            await pg.click('#b-done'); await pg.wait_for_timeout(400)
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
                await shot(f'two-q{i + 1}', True); print(tag, 'Q |', await pg.text_content('#qa .q'), '|', ' / '.join([await x.text_content() for x in await pg.query_selector_all('#qa button')]))
                await pg.click(f'#qa button[data-o="{a}"]'); await pg.wait_for_timeout(300)
            await pg.wait_for_timeout(900); await shot('two-result', True)
            print(tag, 'EXP |', await pg.text_content('#now2'), '|', await pg.text_content('#said2'), '|', (await pg.text_content('#paper2'))[:160])
            await pg.click('button:has-text("The verdict")'); await pg.wait_for_timeout(300); await shot('end', True)
            print(tag, 'FATE |', await pg.text_content('#fate'), '|', (await pg.text_content('#v-part'))[:200])
            await pg.click('#b-about-end'); await pg.wait_for_timeout(200); await shot('about', True)
            await pg.click('#b-about-close'); await pg.click('#b-again'); await pg.wait_for_timeout(200)
            await ctx.close()
        H = ['adult', 'infant', 'braindam', 'disab']; A = ['chimp', 'dog', 'pig', 'horse', 'mouse']
        await session(380, 760, '', H, [[], [], [], []], 'chimp', ['human'])                                   # phone: species, unmoved; says all can suffer, keeps the line
        await session(1000, 800, 'laptop-', H, [['chimp'], [], ['dog', 'pig'], ['horse', 'mouse']], 'mouse', ['none'])  # laptop: moved to Singer's by the end; Suffer moves the last two
        await session(380, 760, 'x-', H, [['infant', 'braindam', 'disab', 'chimp'], ['chimp'], ['chimp'], H[1:] + A], 'chimp', ['none'], False)  # rule-led
        await session(380, 760, 'x-', H + A, [[], [], [], []], 'nobody', [], False)                              # Singer's from the start: nothing to ask
        await session(380, 760, 'x-', ['adult', 'chimp'], [[], [], [], []], 'chimp', ['out'], False, {'pig': False, 'horse': False, 'mouse': False})  # a Reason line, kept; says no for three
        await session(380, 760, 'x-', H, [[], [], [], []], 'chimp', ['less'], False, {'chimp': False, 'dog': False, 'pig': False, 'horse': False, 'mouse': False})  # species, says none can suffer
        await b.close()
        print('ERRORS:', errs or 'none'); sys.exit(1 if errs else 0)
asyncio.run(main())
