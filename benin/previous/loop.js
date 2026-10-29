// Placeholder loop (build step 2): plays a plausible session headlessly and prints what the player would see.
const M = require('./mechanism.js');
const g = M.newGame();
const show = r => { r.results.forEach(x => { const b = M.BILLBOARDS.find(y => y.id === x.id);
  console.log(`  [${b.tag}] warned ${x.warn} · knew ${x.knew} · backfired ${x.back} → ${M.sgn(x.net)}${x.fresh ? '' : ' (seen before)'}\n     ${b.after}`); });
  console.log(`  CAMPAIGN SCORE ${M.sgn(r.score)} of a possible ${M.sgn(r.best)} — ${M.campaignLine(r)}`); };
console.log('CAMPAIGN 1: the myth (tell them Europe is not so rosy): italy, uk, reach'); show(M.runCampaign(g, ['italy', 'uk', 'reach']));
console.log('another campaign?', M.anotherCampaign(g));
console.log('\nCAMPAIGN 2: by analogy, skip EUROPE too: reach, asylum, pirates'); show(M.runCampaign(g, ['reach', 'asylum', 'pirates']));
console.log('another campaign?', M.anotherCampaign(g));
console.log('\nVERDICT', M.verdict(g));
