// Calibration check for Carbuccia's Counter: runs mechanism.js headless against the paper's own numbers.
const M = require('./mechanism.js');
const C = M.CONFIG;
let fails = 0, out = [];
function check(name, ok, detail) { out.push((ok ? 'PASS ' : 'FAIL ') + name + (detail ? '  — ' + detail : '')); if (!ok) fails++; }
const f2 = x => (Math.round(x * 1000) / 1000).toFixed(3);
const KEYS = ['wants', 'apply', 'access', 'dcApply', 'dcAccess'];

// 1. the control group: each cut's weighted means reproduce Table 2's overall control means
for (const cut of ['degree', 'birthplace']) {
  const { a, b } = M.CUTS[cut], sa = M.share(a), sb = M.share(b);
  check(`cut ${cut}: shares sum to one`, Math.abs(sa + sb - 1) < 1e-9, `${sa} + ${sb}`);
  for (const k of KEYS) {
    const m = sa * C.CONTROL[a][k] + sb * C.CONTROL[b][k];
    check(`control ${k} by ${cut} averages to Table 2 (${C.CONTROL.all[k]}) within 0.02`, Math.abs(m - C.CONTROL.all[k]) < 0.02, f2(m));
  }
}

// 2. videos: Table 2 information-only point estimates all sit inside simultaneous CIs that include zero; the game plays zero
for (const k of ['apply', 'access', 'dcApply', 'dcAccess']) {
  const p = C.VIDEOS_POINT[k], ci = C.VIDEOS_SCI[k];
  check(`videos ${k}: point ${p} inside its SCI [${ci}] and the SCI includes 0`, p >= ci[0] && p <= ci[1] && ci[0] <= 0 && ci[1] >= 0);
  check(`videos ${k}: the SCI rules out effects beyond ±0.08`, ci[0] >= -0.08 && ci[1] <= 0.08);
  check(`videos ${k}: played as zero`, C.VIDEOS[k] === 0);
}
for (const g of ['degree', 'nodegree', 'france', 'abroad']) {
  const L = M.ladder(g, { tool: 'videos', target: 'all' }), K = M.ladder(g, null);
  check(`videos: ${g} ladder equals the ward with nothing`, L.apply === K.apply && L.access === K.access && L.dcAccess === K.dcAccess);
}

// 3. calls to everyone: the subgroup ITTs (ED Tables 3, 4) average to Table 2's overall ITT
for (const cut of ['degree', 'birthplace']) {
  const { a, b } = M.CUTS[cut], o = { tool: 'calls', target: 'all' };
  for (const k of ['apply', 'access', 'dcApply', 'dcAccess']) {
    const d = M.share(a) * (M.ladder(a, o)[k] - M.ladder(a, null)[k]) + M.share(b) * (M.ladder(b, o)[k] - M.ladder(b, null)[k]);
    check(`calls to all, ${k} by ${cut}: weighted ITT ${f2(d)} within 0.02 of Table 2 (${C.CALLS.all[k]})`, Math.abs(d - C.CALLS.all[k]) < 0.02);
  }
}

// 4. ITT and ATT: Table 2 / ED Table 2 ATT ≈ ITT / first stage (the instrument scales by take-up)
for (const k of ['apply', 'access', 'dcApply', 'dcAccess']) {
  const att = C.CALLS.all[k] / C.FIRST_STAGE;
  check(`ATT ${k} = ITT / 0.52 = ${f2(att)} within 0.015 of ED Table 2 (${C.ATT.all[k]})`, Math.abs(att - C.ATT.all[k]) < 0.015);
}
// subgroup ATTs reported in the text (0.17 low-SES, 0.15 migrant, application) scale the same way
check('low-SES application ATT 0.17 × 0.52 ≈ ITT 0.09', Math.abs(0.17 * C.FIRST_STAGE - C.CALLS.nodegree.apply) < 0.02, f2(0.17 * C.FIRST_STAGE));
check('migrant application ATT 0.15 × 0.52 ≈ ITT 0.09', Math.abs(0.15 * C.FIRST_STAGE - C.CALLS.abroad.apply) < 0.02, f2(0.15 * C.FIRST_STAGE));
// the exploratory subgroups: ITT derived from the text's ATT lands where Figs 5 and 6 put it (read off: ~0.22 / ~0.25 and ~0.15 / ~0.04)
check('low knowledge: derived ITT apply ≈ 0.22 (Fig. 5)', Math.abs(M.effect('calls', 'lowknow', 'apply') - 0.22) < 0.03, f2(M.effect('calls', 'lowknow', 'apply')));
check('low knowledge: derived ITT access ≈ 0.25 (Fig. 5)', Math.abs(M.effect('calls', 'lowknow', 'access') - 0.25) < 0.03, f2(M.effect('calls', 'lowknow', 'access')));
check('inactive: derived ITT apply ≈ 0.15 (Fig. 6)', Math.abs(M.effect('calls', 'inactive', 'apply') - 0.15) < 0.03, f2(M.effect('calls', 'inactive', 'apply')));

// 5. the headline: calls to the mothers without a degree
{
  const o = { tool: 'calls', target: 'nodegree' };
  const L = M.ladder('nodegree', o), D = M.ladder('degree', o);
  check('calls to no-degree: their application share 0.60 → 0.69 (ED Table 3)', Math.abs(L.apply - 0.69) < 1e-9, f2(L.apply));
  check('calls to no-degree: their place share 0.36 → 0.39 (ED Table 3)', Math.abs(L.access - 0.39) < 1e-9, f2(L.access));
  check('calls to no-degree: mothers with a degree untouched', D.apply === C.CONTROL.degree.apply && D.access === C.CONTROL.degree.access);
  const g = M.gaps('degree', o), g0 = M.gaps('degree', null);
  check('application gap 24 → 15 in a hundred', g0.apply === 24 && g.apply === 15, `${g0.apply} → ${g.apply}`);
  check('place gap 33 → 30 in a hundred', g0.access === 33 && g.access === 30, `${g0.access} → ${g.access}`);
  // for compliers (ATT 0.17): 0.77 against 0.84, the gap "nearly closed" (text)
  const compl = 0.60 + 0.17;
  check('complier application gap under 0.10 ("nearly closed")', (0.84 - compl) < 0.10, f2(0.84 - compl));
  // daycare places for mothers with a degree when everyone is called: +0.08 on 0.23 (ED Table 4)
  const Da = M.ladder('degree', { tool: 'calls', target: 'all' });
  check('calls to all: degree crèche places 0.23 → 0.31 (ED Table 4)', Math.abs(Da.dcAccess - 0.31) < 1e-9, f2(Da.dcAccess));
  const Na = M.ladder('nodegree', { tool: 'calls', target: 'all' });
  check('calls to all: no-degree crèche places unchanged at 0.19 (ED Table 4)', Math.abs(Na.dcAccess - 0.19) < 1e-9, f2(Na.dcAccess));
}

// 6. cross-shares consistent with each other and with the ward
{
  const implied = C.SHARE.nodegree * C.CROSS.nodegree.abroad / C.SHARE.abroad;
  check('cross-shares agree: share of abroad without a degree', Math.abs(implied - C.CROSS.abroad.nodegree) < 0.03, f2(implied) + ' vs ' + C.CROSS.abroad.nodegree);
  for (const t of M.TARGETS) for (const g of ['degree', 'nodegree', 'france', 'abroad', 'all']) {
    const c = M.coverage(t, g); if (!(c >= 0 && c <= 1)) check(`coverage(${t},${g}) in [0,1]`, false, String(c));
  }
  check('coverage(all, g) = 1 and coverage(nodegree, degree) = 0', M.coverage('all', 'nodegree') === 1 && M.coverage('nodegree', 'degree') === 0);
  // the rest of the ward outside a subgroup, weighted with the subgroup, gives the overall control
  for (const t of ['lowknow', 'inactive', 'nodegree', 'abroad']) {
    const s = M.share(t), T = M.ladder(t, null), R = M.ladder('rest-' + t, null);
    const m = s * T.apply + (1 - s) * R.apply;
    check(`rest of ward outside ${t} reconstructs Table 2 apply`, Math.abs(m - C.CONTROL.all.apply) < 1e-9, f2(m));
  }
}

// 7. every order keeps shares in order: 0 ≤ crèche ≤ place ≤ applied ≤ 1
{
  let ok = true, worst = '';
  const orders = [null]; for (const t of M.TOOLS) for (const g of M.TARGETS) orders.push({ tool: t, target: g });
  for (const o of orders) for (const g of ['degree', 'nodegree', 'france', 'abroad', 'lowknow', 'inactive', 'all']) {
    const L = M.ladder(g, o);
    if (!(L.dcAccess <= L.access + 1e-12 && L.access <= L.apply + 1e-12 && L.apply <= 1 && L.dcAccess >= 0)) { ok = false; worst = JSON.stringify([o, g, L]); }
  }
  check('all 11 orders × 7 groups keep crèche ≤ place ≤ applied ≤ 1', ok, worst);
}

// 8. costs and the purse
{
  check('videos to all cost €550', M.cost({ tool: 'videos', target: 'all' }) === 550);
  check('calls to all cost €5,500', M.cost({ tool: 'calls', target: 'all' }) === 5500);
  check('calls to the 39 without a degree cost €2,145', M.cost({ tool: 'calls', target: 'nodegree' }) === 2145);
  const g = M.newGame();
  check('year 1: calls to all unaffordable, calls to no-degree affordable', !M.canAfford(g, { tool: 'calls', target: 'all' }) && M.canAfford(g, { tool: 'calls', target: 'nodegree' }));
  M.runYear(g, null);
  check('year 2 after saving: calls to all affordable', g.year === 2 && M.canAfford(g, { tool: 'calls', target: 'all' }), 'purse ' + g.purse);
  M.runYear(g, { tool: 'calls', target: 'all' }); M.runYear(g, { tool: 'videos', target: 'all' }); M.runYear(g, { tool: 'calls', target: 'lowknow' });
  check('four years end the game', g.done && g.results.length === 4);
  const v = M.verdict(g);
  check('verdict has four lines and the spend', v.lines.length === 4 && v.spent === 5500 + 550 + 825, v.spent);
}

// 9. robustness of the central discovery under alternative cross-shares (build.md §1)
{
  const saved = JSON.parse(JSON.stringify(C.CROSS));
  const alts = [
    { lowknow: { nodegree: 0.5, abroad: 0.5 }, inactive: { nodegree: 0.4, abroad: 0.4 } },
    { lowknow: { nodegree: 0.85, abroad: 0.85 }, inactive: { nodegree: 0.8, abroad: 0.8 } },
    saved
  ];
  let placeGapFloor = 99, applyNarrowOnlyCalls = true, videosNever = true;
  for (const alt of alts) {
    C.CROSS.lowknow = alt.lowknow; C.CROSS.inactive = alt.inactive;
    for (const t of M.TOOLS) for (const g of M.TARGETS) {
      const o = { tool: t, target: g }, gp = M.gaps('degree', o), g0 = M.gaps('degree', null);
      placeGapFloor = Math.min(placeGapFloor, gp.access);
      if (t === 'videos' && (Math.abs(gp.apply - g0.apply) >= 1.5 || Math.abs(gp.access - g0.access) >= 1.5)) videosNever = false;
      if (t === 'videos' && g0.apply - gp.apply >= 5) applyNarrowOnlyCalls = false;
    }
  }
  C.CROSS.lowknow = saved.lowknow; C.CROSS.inactive = saved.inactive;
  check('no single order brings the place gap below 25 in a hundred, under any cross-shares tried', placeGapFloor >= 25, 'floor ' + placeGapFloor);
  check('videos never move either gap by 1.5 or more', videosNever);
  check('only calls narrow the application gap by 5 or more', applyNarrowOnlyCalls);
  // the loose end the verdict names: at the upper bound of the paper's SCI for no-degree places (+0.15), the gap would be 18
  const upper = Math.round((C.CONTROL.degree.access - (C.CONTROL.nodegree.access + 0.15)) * 100);
  check('upper bound of the no-degree place effect (SCI +0.15, ED Table 3) would leave a gap of about 18', upper === 18, String(upper));
}

// 10. play it in numbers (build.md §3): the obvious ways of playing, and where each ends
{
  const strategies = {
    'videos every year': [['videos', 'all'], ['videos', 'all'], ['videos', 'all'], ['videos', 'all']],
    'calls to no-degree every year': [['calls', 'nodegree'], ['calls', 'nodegree'], ['calls', 'nodegree'], ['calls', 'nodegree']],
    'calls to abroad every year': [['calls', 'abroad'], ['calls', 'abroad'], ['calls', 'abroad'], ['calls', 'abroad']],
    'save, then calls to all, twice': [null, ['calls', 'all'], null, ['calls', 'all']],
    'calls to those who know least, every year': [['calls', 'lowknow'], ['calls', 'lowknow'], ['calls', 'lowknow'], ['calls', 'lowknow']],
    'calls to mothers not in work, every year': [['calls', 'inactive'], ['calls', 'inactive'], ['calls', 'inactive'], ['calls', 'inactive']],
    'videos, no-degree, know least, all': [['videos', 'all'], ['calls', 'nodegree'], ['calls', 'lowknow'], ['calls', 'all']]
  };
  out.push('');
  out.push('Play it in numbers: the gap by degree (mothers per hundred) after each year, applications / places; start 24 / 33');
  for (const name in strategies) {
    const g = M.newGame(); const cells = [];
    for (const s of strategies[name]) {
      const o = s ? { tool: s[0], target: s[1] } : null;
      if (o && !M.canAfford(g, o)) { cells.push('(cannot afford)'); M.runYear(g, null); continue; }
      const r = M.runYear(g, o); cells.push(r.gaps.degree.apply + ' / ' + r.gaps.degree.access);
    }
    out.push('  ' + name.padEnd(44) + cells.join('   ') + '   spent €' + M.verdict(g).spent);
  }
}

out.push('');
out.push(fails ? `${fails} CHECK(S) FAILED` : 'ALL CHECKS PASSED');
console.log(out.join('\n'));
process.exit(fails ? 1 : 0);
