# Scripted sessions in headless Chromium (Playwright). Run: python3 session-test.py. Writes screenshot-*.png; prints what the board said; exits 1 on a page error.
import asyncio, os, sys
from playwright.async_api import async_playwright
URL = 'file://' + os.path.abspath('draw-a-line-with-singer.html')
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); errs = []
        async def session(vw, vh, tag, rulers, handk, pick, answers, shots=True):
            ctx = await b.new_context(viewport={'width': vw, 'height': vh}, device_scale_factor=2); pg = await ctx.new_page()
            pg.on('pageerror', lambda e: errs.append('pageerror: ' + str(e)))
            pg.on('console', lambda m: errs.append('console: ' + m.text) if m.type == 'error' and 'gc.zgo' not in m.text and 'ERR_TUNNEL' not in m.text else None)
            async def shot(n, full=False):
                if shots: await pg.screenshot(path=f'screenshot-{tag}{n}.png', full_page=full)
            async def nohs(l):
                w = await pg.evaluate('document.documentElement.scrollWidth')
                if w > vw: errs.append(f'hscroll {l}: {w}')
            await pg.goto(URL); await pg.wait_for_timeout(300); await shot('start'); await nohs('start')
            await pg.click('#b-begin'); await pg.wait_for_timeout(200); await shot('one-empty'); await nohs('one')
            print(tag, 'Chalk it bottom at', await pg.evaluate("document.getElementById('b-chalk').getBoundingClientRect().bottom"))
            for lab, row in rulers:
                await pg.click(f'button.rb:has-text("{lab}")'); await pg.wait_for_timeout(200)
                if lab == 'Reason': await shot('one-reason-sorted')
                await pg.click(f'.rowtap[data-j="{row}"]'); await pg.wait_for_timeout(200)
                if lab == 'Reason': await shot('one-reason-preview')
                await pg.click('#b-chalk'); await pg.wait_for_timeout(1600)
                await shot('one-' + lab.lower() + '-chalked', True)
                print(tag, lab, '|', await pg.text_content('#now1'), '|', await pg.text_content('#said1'), '|', await pg.text_content('#find1'))
                await pg.click('button:has-text("Sponge")'); await pg.wait_for_timeout(800)
            await shot('one-hand-empty'); print(tag, 'hand |', await pg.text_content('#rule1'))
            await pg.click(f'.rowtap[data-j="{handk - 1}"]'); await pg.wait_for_timeout(200)
            await pg.click('#b-chalk'); await pg.wait_for_timeout(1400); await shot('one-hand-chalked', True)
            print(tag, 'hand |', await pg.text_content('#now1'), '|', await pg.text_content('#said1'), '|', await pg.text_content('#find1'))
            await pg.click('button:has-text("And then")'); await pg.wait_for_timeout(900); await shot('one-race', True)
            await pg.click('button:has-text("And then")'); await pg.wait_for_timeout(900); await shot('one-sex', True)
            await pg.click('button:has-text("So where does the line go")'); await pg.wait_for_timeout(900); await shot('one-reply', True)
            await pg.click('button:has-text("Now you are the scientist")'); await pg.wait_for_timeout(300); await shot('two-offer', True); await nohs('two')
            if pick == 'nobody': await pg.click('#b-nobody')
            else:
                await pg.click(f'.fig[data-id="{pick}"]'); await pg.wait_for_timeout(200); await shot('two-picked')
                await pg.click('#b-use')
            await pg.wait_for_timeout(300)
            for i, a in enumerate(answers):
                await shot(f'two-q{i + 1}', True)
                await pg.click(f'#qa button[data-o="{a}"]'); await pg.wait_for_timeout(300)
            await pg.wait_for_timeout(900); await shot('two-result', True)
            print(tag, 'EXP |', await pg.text_content('#now2'), '|', await pg.text_content('#said2'), '|', await pg.text_content('#paper2'))
            await pg.click('button:has-text("The verdict")'); await pg.wait_for_timeout(300); await shot('end', True)
            print(tag, 'FATE |', await pg.text_content('#fate'))
            await pg.click('#b-about-end'); await pg.wait_for_timeout(200); await shot('about', True)
            await pg.click('#b-about-close'); await pg.click('#b-again'); await pg.wait_for_timeout(200)
            await ctx.close()
        # phone: the species player
        await session(380, 760, '', [('Reason', 0), ('Talk', 1), ('Aware', 0), ('Suffer', 3)], 4, 'chimp', ['human'])
        # laptop: lines by hand, Singer's own line in the hand round, the potential path
        await session(1000, 800, 'laptop-', [('Suffer', 3), ('Aware', 4), ('Talk', 1), ('Reason', 3)], 9, 'mouse', ['grow', 'yes'])
        # phone, no screenshots: "matters less", "either", nobody
        await session(380, 760, 'x-', [('Reason', 1), ('Talk', 0), ('Aware', 9), ('Suffer', 9)], 10, 'mouse', ['less'], False)
        await session(380, 760, 'x-', [('Reason', 0), ('Talk', 0), ('Aware', 0), ('Suffer', 0)], 1, 'chimp', ['none'], False)
        await session(380, 760, 'x-', [('Reason', 0), ('Talk', 0), ('Aware', 0), ('Suffer', 8)], 4, 'nobody', [], False)
        await b.close()
        print('ERRORS:', errs or 'none'); sys.exit(1 if errs else 0)
asyncio.run(main())
