import asyncio, sys
from playwright.async_api import async_playwright
URL='file://' + __import__('os').path.abspath('singers-chalk-line.html') + ''
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        ctx = await b.new_context(viewport={'width':380,'height':760}, device_scale_factor=2)
        pg = await ctx.new_page()
        errs=[]
        pg.on('pageerror', lambda e: errs.append('pageerror: '+str(e)))
        pg.on('console', lambda m: errs.append('console: '+m.text) if m.type=='error' and 'goatcounter' not in m.text and 'gc.zgo' not in m.text else None)
        async def shot(n, full=False): await pg.screenshot(path=f'screenshot-{n}.png', full_page=full)
        async def nohs(l):
            w = await pg.evaluate('document.documentElement.scrollWidth')
            if w>380: errs.append(f'hscroll {l}: {w}')
        await pg.goto(URL); await pg.wait_for_timeout(300); await shot('start'); await nohs('start')
        await pg.click('#b-begin'); await pg.wait_for_timeout(200); await shot('one-empty'); await nohs('one')
        bottom = await pg.evaluate("document.getElementById('b-chalk').getBoundingClientRect().bottom"); print('chalk bottom', bottom)
        plan=[('Reason',0),('Talk',1),('Aware',0),('Suffer',8)]
        for lab,row in plan:
            await pg.click(f'button.rb:has-text("{lab}")'); await pg.wait_for_timeout(200)
            if lab=='Reason': await shot('one-reason-sorted')
            await pg.click(f'.rowtap[data-j="{row}"]'); await pg.wait_for_timeout(200)
            await pg.click('#b-chalk'); await pg.wait_for_timeout(1800)
            await shot('one-'+lab.lower()+'-chalked', True)
            print(lab,'|',await pg.text_content('#now1'),'|',await pg.text_content('#said1'),'|',await pg.text_content('#find1'))
            await pg.click('button:has-text("Sponge")'); await pg.wait_for_timeout(800)
        await pg.click('button.rb.species'); await pg.wait_for_timeout(200)
        await pg.click('.rowtap[data-j="3"]'); await pg.wait_for_timeout(200)
        await pg.click('#b-chalk'); await pg.wait_for_timeout(1500); await shot('one-species-chalked', True)
        print('Species |', await pg.text_content('#said1'))
        await pg.click('button:has-text("And then")'); await pg.wait_for_timeout(900); await shot('one-race', True)
        await pg.click('button:has-text("And then")'); await pg.wait_for_timeout(900); await shot('one-sex', True)
        await pg.click('button:has-text("So where is the line")'); await pg.wait_for_timeout(900); await shot('one-reply', True)
        await pg.click('button:has-text("Now you are the experimenter")'); await pg.wait_for_timeout(300); await shot('two-offer', True); await nohs('two')
        await pg.click('.fig[data-id="chimp"]'); await pg.wait_for_timeout(200); await shot('two-picked')
        await pg.click('#b-use'); await pg.wait_for_timeout(300); await shot('two-q-infant', True)
        await pg.click('#qa button[data-o="no"]'); await pg.wait_for_timeout(300); await shot('two-q-why', True)
        await pg.click('#qa button[data-o="human"]'); await pg.wait_for_timeout(1200); await shot('two-result', True)
        print('EXP |', await pg.text_content('#said2'), '|', await pg.text_content('#paper2'))
        await pg.click('button:has-text("And killing")'); await pg.wait_for_timeout(300); await shot('coda', True)
        await pg.click('#b-verdict'); await pg.wait_for_timeout(300); await shot('end', True)
        print('FATE', await pg.text_content('#fate'))
        await pg.click('#b-about-end'); await pg.wait_for_timeout(200); await shot('about', True)
        # second session: potential path, then nobody
        await pg.goto(URL); await pg.click('#b-begin')
        for lab,row in [('Suffer',8),('Aware',0),('Talk',1),('Reason',0)]:
            await pg.click(f'button.rb:has-text("{lab}")'); await pg.click(f'.rowtap[data-j="{row}"]'); await pg.click('#b-chalk'); await pg.wait_for_timeout(900); await pg.click('button:has-text("Sponge")'); await pg.wait_for_timeout(600)
        await pg.click('button.rb.species'); await pg.click('.rowtap[data-j="3"]'); await pg.click('#b-chalk'); await pg.wait_for_timeout(900)
        for t in ['And then','And then','So where is the line','Now you are the experimenter']: await pg.click(f'button:has-text("{t}")'); await pg.wait_for_timeout(600)
        await pg.click('.fig[data-id="mouse"]'); await pg.click('#b-use'); await pg.wait_for_timeout(200)
        await pg.click('#qa button[data-o="no"]'); await pg.wait_for_timeout(200); await pg.click('#qa button[data-o="grow"]'); await pg.wait_for_timeout(200); await shot('two-q-braindam', True)
        await pg.click('#qa button[data-o="yes"]'); await pg.wait_for_timeout(1200); await shot('two-result-potential', True)
        await pg.click('button:has-text("And killing")'); await pg.click('#b-verdict'); await pg.wait_for_timeout(200); print('FATE2', await pg.text_content('#fate'))
        await pg.click('#b-again'); await pg.wait_for_timeout(200)
        print('ERRORS:', errs or 'none')
        await b.close()
asyncio.run(main())
