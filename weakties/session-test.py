# Full sessions in a headless browser at phone width (build.md section 4.6). Usage: python3 session-test.py [seed]
import asyncio, sys, os
from playwright.async_api import async_playwright
SEED = sys.argv[1] if len(sys.argv) > 1 else '4821'
URL = 'file://' + os.path.abspath('granovetters-dashed-line.html') + '?seed=' + SEED
PLAN = [  # a learning player: the circle first, then three doors, then two of them again
    {'Ann': 1, 'Ben': 1, 'Cal': 1},
    {'Dee': 1, 'Eli': 1, 'Fay': 1},
    {'Dee': 1, 'Eli': 1, 'Gus': 1},
]
async def main():
    async with async_playwright() as p:
        try: b = await p.chromium.launch()
        except Exception: b = await p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
        ctx = await b.new_context(viewport={'width': 380, 'height': 760}, device_scale_factor=2)
        pg = await ctx.new_page()
        errs = []
        pg.on('pageerror', lambda e: errs.append('pageerror: ' + str(e)))
        pg.on('console', lambda m: errs.append('console: ' + m.text) if m.type == 'error' and 'goatcounter' not in m.text and 'gc.zgo' not in m.text and 'Failed to load resource' not in m.text else None)
        async def shot(n, full=False): await pg.screenshot(path=f'screenshot-{n}.png', full_page=full)
        async def nohs(l):
            w = await pg.evaluate('document.documentElement.scrollWidth')
            if w > 380: errs.append(f'hscroll {l}: {w}')
        await pg.goto(URL); await pg.wait_for_timeout(400); await shot('start'); await nohs('start')
        await pg.click('#b-help-start'); await pg.wait_for_timeout(200); await shot('help', True); await pg.click('#b-help-close'); await pg.wait_for_timeout(100)
        await pg.click('#b-begin'); await pg.wait_for_timeout(300); await shot('week1-empty'); await nohs('week1')
        spend = await pg.evaluate("document.getElementById('b-spend').getBoundingClientRect().bottom"); print('spend button bottom at 380 wide:', spend)
        for w, plan in enumerate(PLAN, 1):
            for name, n in plan.items():
                for _ in range(n): await pg.click(f'.chip:has-text("{name}")'); await pg.wait_for_timeout(60)
            left = await pg.text_content('#wk-leftn'); print(f'week {w}: evenings left {left}')
            if w == 1: await shot('week1-planned'); await nohs('week1-planned')
            if w == 2:
                await pg.click('#b-help-week'); await pg.wait_for_timeout(150); assert await pg.evaluate("document.getElementById('help').classList.contains('on')")
                await pg.click('#b-help-close'); await pg.wait_for_timeout(100)
                assert (await pg.text_content('#wk-leftn')) == left, 'help lost the plan'
            await pg.click('#b-spend'); await pg.wait_for_timeout(1200)
            if w == 1: await shot('week1-playing')
            if w == 1:
                await pg.wait_for_timeout(4500); await shot('week1-news')
            await pg.click('#b-skip');
            for _ in range(200):
                if await pg.evaluate("document.getElementById('wk-result').style.display === ''"): break
                await pg.wait_for_timeout(100)
            print('   ', await pg.text_content('#res-big'), '|', await pg.text_content('#res-text'))
            await shot(f'week{w}-result', True); await nohs(f'week{w}-result')
            if w == 3: await shot('week3-planned-strong-bridge') if False else None
            await pg.click('#b-next'); await pg.wait_for_timeout(300)
            if w == 2: await shot('week3-new-names')
        assert await pg.evaluate("document.getElementById('s-end').classList.contains('on')"), 'verdict not shown'
        await shot('end', True); await nohs('end')
        print('VERDICT |', await pg.text_content('#v-pct'), '|', await pg.text_content('#v-big'), '|', await pg.text_content('#v-fate'), '|', await pg.text_content('#v-plan'), '|', await pg.text_content('#v-part'))
        await pg.click('#b-about-end'); await pg.wait_for_timeout(200); await shot('about', True); await pg.click('#b-about-close')
        # retry: replay this town, homebody, watch one full week without skipping
        await pg.click('#b-replay'); await pg.wait_for_timeout(300)
        assert await pg.evaluate("document.getElementById('s-week').classList.contains('on')")
        for name in ['Ann', 'Ben', 'Cal']: await pg.click(f'.chip:has-text("{name}")'); await pg.wait_for_timeout(40)
        await pg.click('#b-spend')
        for _ in range(900):
            if await pg.evaluate("document.getElementById('wk-result').style.display === ''"): break
            await pg.wait_for_timeout(100)
        print('REPLAY week 1 (watched) |', await pg.text_content('#res-big'), '|', await pg.text_content('#res-text'))
        await shot('replay-week1-result')
        print('ERRORS:', errs if errs else 'none')
        await b.close()
        if errs: sys.exit(1)
asyncio.run(main())
