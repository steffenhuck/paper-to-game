// On the Record: mechanism (single source of truth; runs unchanged in Node and in the browser).
// Hutter & Kriesi (2022), "Politicising immigration in times of crisis", JEMS 48(2): 341-365, doi:10.1080/1369183X.2020.1853902.
// Kind: TOY built on the paper's estimate. Table 3 Model 3 is an association across 37 elections; the game plays it as a lever.
// Nothing here is random: the decks are fixed, and every outcome follows from the player's answers.

const CONFIG = {
  // Table 3, Model 3 (OLS, country fixed effects, N = 37): change in radical-right vote share, in points.
  bSal: 31.92,          // Table 3 M3: change in centre-right salience of immigration (share, 0..1)
  bPos: -0.757,         // Table 3 M3: change in centre-right position on immigration (-1 against .. +1 for)
  bInt: -33.05,         // Table 3 M3: salience change x position change (t = -2.18)
  tInt: -2.18,          // Table 3 M3: t statistic of the interaction, quoted on the About screen
  tPos: -0.36,          // Table 3 M3: t statistic of the position term (no evidence on its own)
  nElections: 37,       // Table 3 M3: N
  // Table 3, Model 2 (no interaction): used only by calibration.js as a robustness check.
  m2Sal: 33.48, m2Pos: -1.097,

  // What one answer is worth. Our choice: six immigration answers of six = +0.21, the edge of Fig. 5's salience axis.
  salStep: 0.035,
  // Lean of each kind of answer, as a change in the party's position (Fig. 5 draws exactly these: -1, and +1; 0 is "no shift").
  lean: { copy: -1, usual: 0, oppose: 1 },  // Fig. 5's two lines; Table 2's party averages give about -0.53 / +0.60 (calibration.js checks both)
  // Table 2 Model 1 (Direction): average direction of immigration statements by party group; constant = radical left.
  dirConst: 0.744, dirCL: -0.221, dirCR: -0.825, dirRR: -1.357,

  days: 6,              // our choice: six press days per campaign (the paper codes the last two months of a campaign)
  holdLimit: 1.0,       // our choice: "held" if your campaign hands them less than 1 point (same outcomes for any limit in (0, 1.11])
  startShare: 12,       // our choice, display only: the model predicts changes, not levels
  floorAtZero: true,    // our choice: shown gains never go below 0. Below zero comes only from the position term (t = -0.36) and Fig. 5's +1 line sits at about 0
  // Crisis deck: immigration questions per day. Two forced days put the minimum salience change at +0.07, near
  // Table 2 Model 5's crisis x centre-right salience term (+0.056) plus the radical right's contagion (Table 2 M5, -0.006 per unit).
  quietDeck: [1, 1, 1, 1, 1, 1],   // our choice: before the crisis, one immigration question a day
  crisisDeck: [3, 2, 1, 3, 2, 1],  // our choice: in the crisis, two days on which every question is about immigration
};

// Their gain (points) from a campaign whose immigration share rose by ds and whose position moved by dp. Table 3 Model 3.
function gain(ds, dp, c = CONFIG) { return c.bSal * ds + c.bPos * dp + c.bInt * ds * dp; }
// What the balloon shows: the estimate, floored at zero (see CONFIG.floorAtZero).
function shown(x) { return CONFIG.floorAtZero ? Math.max(0, x) : x; }

// ---------------------------------------------------------------- the questions (ours, written for the register)
const ANS = { copy: 'LIKE THEM', usual: 'YOUR USUAL LINE', oppose: 'AGAINST THEM' };

const IMM = [ // [question, like them, usual line, against them]
  ['They say the borders are wide open. Are they?', 'They are. We will shut them. Enough is enough.', 'Our rules are firm and they are fair.', 'No. And people fleeing war are not the enemy.'],
  ['Should newcomers lose benefits for five years?', 'Yes. Ours come first.', 'Everyone pays in, everyone follows the rules.', 'No. Punishing children wins nobody anything.'],
  ['A mosque is planned in the old town. For or against?', 'Against. This is not who we are.', 'That is for the town council.', 'For. Freedom of religion is in our constitution.'],
  ['Is immigration why the rents are so high?', 'Of course it is. Too many, too fast.', 'Rents are high for many reasons.', 'No. We stopped building homes. That is on us.'],
  ['Would you deport families whose asylum claims fail?', 'Every single one. No exceptions.', 'The courts decide, and we follow the courts.', 'Not families who have lived here for years.'],
  ['Hospitals say they need nurses from abroad. Do they?', 'Train our own. Not one more visa.', 'We look at each sector case by case.', 'Yes. And we should thank them.'],
  ['Boats are arriving every night. What would you do?', 'Turn them back. Every one.', 'Work with our European partners.', 'Save lives first. Then decide each case fairly.'],
  ['Would you build a fence on the border?', 'Yes, and higher than theirs.', 'We will look at all the options.', 'No. Fences move people, they do not stop them.'],
  ['Should the army guard the border?', 'Yes. This is an emergency.', 'The police are doing their job.', 'No. These are refugees, not an army.'],
  ['Do you accept your share of refugees under the EU plan?', 'Not one. Brussels can keep them.', 'We will honour our agreements.', 'Yes. We are not going to leave Italy and Greece alone.'],
  ['A town hall has 400 refugees in it. Is that too many?', 'Far too many. Close it.', 'The mayor has our support.', 'The town is coping. Ask them how.'],
  ['Should refugees be allowed to work while they wait?', 'No. They should not be here at all.', 'After a waiting period, under conditions.', 'From day one. Work is how people fit in.'],
  ['Will you cut the number of asylum seekers in half?', 'In half? We will cut it to zero.', 'We will manage the numbers responsibly.', 'Asylum is a right, not a quota.'],
  ['Are there terrorists among the refugees?', 'Nobody knows, and that is the problem.', 'Our security services check everyone.', 'Most of them are fleeing the terrorists.'],
  ['Should schools teach in the newcomers’ languages?', 'No. Here we speak our language.', 'Schools know best what their pupils need.', 'Some help in their language gets them learning ours faster.'],
  ['A refugee shelter was set on fire last night. Your reaction?', 'Wrong, but people are angry and nobody listens.', 'Violence is never acceptable.', 'It is a crime, and words like theirs lit the match.'],
  ['Should citizenship take ten years instead of five?', 'Fifteen. Citizenship must be earned.', 'Five years has served us well.', 'Five is enough. They pay taxes like everyone.'],
  ['Thousands are walking along the motorway. Will you stop them?', 'Yes. Close the roads, close the border.', 'We are in talks with our neighbours tonight.', 'We will give them water and a bus, and check every claim.'],
  ['Germany is taking a million. Should we take more?', 'Not one more. Let Germany keep them.', 'We will take what we can manage.', 'Yes. We can manage our share.'],
  ['Should refugees live in camps outside the towns?', 'Yes. Far outside.', 'Wherever there is room and order.', 'No. Put them in towns, near schools and jobs.'],
  ['Is the crisis a threat to our way of life?', 'It is the biggest threat in fifty years.', 'It is a challenge we can handle.', 'No. Fear is the threat.'],
  ['Should we pay Turkey to keep refugees there?', 'Pay whatever it takes. Keep them out.', 'If the deal is fair and legal.', 'Not if it means camps no one can leave.'],
  ['Will you hold a referendum on refugee quotas?', 'Yes. Let the people say no.', 'Parliament will decide.', 'No. Human rights are not up for a vote.'],
  ['Is your country full?', 'Yes. It is full.', 'We are a country that manages its borders.', 'No. Our villages are emptying.'],
];
const OTHER = [ // [topic, question, your answer]
  ['PENSIONS', 'Will you raise the retirement age?', 'Not without asking the people who do the heavy jobs.'],
  ['TAXES', 'Who pays for the new railway?', 'Growth pays for it, not your wages.'],
  ['SCHOOLS', 'Classes have 32 pupils. Will you fix that?', 'Five thousand new teachers in four years.'],
  ['HOSPITALS', 'Waiting lists are at a record. Your plan?', 'Open the closed wards again. We have the money.'],
  ['JOBS', 'The car plant is closing. What now?', 'A new factory on the same site within two years.'],
  ['ROADS', 'Potholes everywhere. Who is to blame?', 'Whoever governs next will fix them. That is us.'],
  ['FARMS', 'Milk prices have collapsed. Will you help?', 'Fair prices, guaranteed by law.'],
  ['ENERGY', 'Heating bills doubled. What will you do?', 'A cap on prices this winter.'],
  ['CRIME', 'Burglaries are up. Are you soft on crime?', 'Two thousand more police on the streets.'],
  ['HOUSING', 'Young people can’t afford a flat. Your answer?', 'Build. A hundred thousand homes.'],
  ['TAXES', 'Will you cut income tax?', 'For the middle, yes. Next year.'],
  ['PENSIONS', 'Will pensions keep up with prices?', 'Yes. Indexed to prices, every year.'],
  ['SCHOOLS', 'Will you build new schools in the suburbs?', 'Twelve new schools by the end of the term.'],
  ['TRAINS', 'The trains are always late. Your plan?', 'Fix the signals first. Then new trains.'],
  ['JOBS', 'Young people can\u2019t find work. What will you do?', 'An apprenticeship for every school-leaver who wants one.'],
  ['BANKS', 'Should the state rescue the banks again?', 'Never again with your money.'],
  ['INTERNET', 'Half the villages have no fast internet. When?', 'Every village connected in three years.'],
  ['CHILDCARE', 'Nurseries cost more than rent. Will you help?', 'Free mornings for every child over two.'],
];
const REACT = {
  copy: ['See? Even they agree with us now!', 'Why vote for the copy?', 'They’re reading our leaflets!', 'Thank you. That’s our line.'],
  usual: ['Keep talking about it. It’s our topic.', 'Immigration, immigration! Good.', 'Everyone’s talking about it now.'],
  oppose: ['Hmm.', '…', 'They sound nothing like us.'],
  dodge: ['Scared of the question?', 'Not talking about it, eh?'],
  other: ['Boring!', 'Zzz.'],
};
const HEAD = {
  copy: q => `BIG PARTY: “${q.toUpperCase()}”`,
  usual: q => `BIG PARTY STICKS TO ITS LINE`,
  oppose: q => `BIG PARTY TAKES ON THE RADICAL RIGHT`,
  other: t => `BIG PARTY ON ${t}`,
};

// Build a fixed deck: for each day, `n` immigration questions and 3 - n others. Deterministic.
function buildDeck(spec, immStart, otherStart) {
  let ii = immStart, oi = otherStart;
  return spec.map((n, d) => {
    const qs = [];
    for (let k = 0; k < 3; k++) {
      if (k < n) { const q = IMM[ii++ % IMM.length]; qs.push({ imm: true, topic: 'IMMIGRATION', text: q[0], answers: { copy: q[1], usual: q[2], oppose: q[3] } }); }
      else { const o = OTHER[oi++ % OTHER.length]; qs.push({ imm: false, topic: o[0], text: o[1], answer: o[2] }); }
    }
    // the immigration question is not always first: rotate by a fixed pattern so position gives nothing away
    const r = (2 * d + 1) % 3; return qs.slice(r).concat(qs.slice(0, r));
  });
}
const CAMPAIGNS = [
  { key: 'quiet', name: 'THE QUIET YEAR', deck: buildDeck(CONFIG.quietDeck, 0, 0) },
  { key: 'crisis', name: 'THE CRISIS', deck: buildDeck(CONFIG.crisisDeck, 6, 12) },
];

// ---------------------------------------------------------------- state
function newGame() { return { c: 0, day: 0, answers: [], start: CONFIG.startShare, results: [] }; }
function current(g) { return CAMPAIGNS[g.c]; }
function today(g) { return current(g).deck[g.day]; }
function forced(g) { return today(g).every(q => q.imm); }

// The campaign so far, measured as the paper measures a party: share of statements on immigration, mean direction of those.
function measure(answers) {
  const imm = answers.filter(a => a.kind !== 'other');
  const ds = CONFIG.salStep * imm.length;
  const dp = imm.length ? imm.reduce((s, a) => s + CONFIG.lean[a.kind], 0) / imm.length : 0;
  return { k: imm.length, ds, dp, gain: gain(ds, dp) };
}

// The player answers question qi of today; kind is 'copy' | 'usual' | 'oppose' for an immigration question, ignored otherwise.
function answer(g, qi, kind) {
  const q = today(g)[qi];
  const before = measure(g.answers).gain;
  const k = q.imm ? kind : 'other';
  if (q.imm && !(k in CONFIG.lean)) throw new Error('bad answer kind ' + kind);
  const said = q.imm ? q.answers[k] : q.answer;
  const dodged = !q.imm && today(g).some(x => x.imm);
  g.answers.push({ day: g.day, kind: k, topic: q.topic, said });
  const m = measure(g.answers);
  const pool = REACT[q.imm ? k : (dodged ? 'dodge' : 'other')];
  const r = {
    said, kind: k, topic: q.topic,
    headline: q.imm ? HEAD[k](said.split(/[.?!]\s*/).filter(Boolean).sort((x, y) => y.length - x.length)[0]) : HEAD.other(q.topic),
    reaction: pool[(g.answers.length + g.c) % pool.length],
    before, after: m.gain, change: shown(m.gain) - shown(before), share: g.start + shown(m.gain),
    held: m.gain < CONFIG.holdLimit, k: m.k,
  };
  g.day++;
  return r;
}
function campaignOver(g) { return g.day >= CONFIG.days; }

function electionNight(g) {
  const m = measure(g.answers), c = current(g);
  const res = { campaign: c.key, ...m, start: g.start, end: g.start + shown(m.gain), held: m.gain < CONFIG.holdLimit,
    copies: g.answers.filter(a => a.kind === 'copy').length, usuals: g.answers.filter(a => a.kind === 'usual').length,
    opposes: g.answers.filter(a => a.kind === 'oppose').length, answers: g.answers.slice() };
  res.line = nightLine(res);
  g.results[g.c] = res;
  return res;
}

function nightLine(r) {
  if (r.k === 0) return 'You never talked about immigration. Nothing you said gave them anything.';
  if (r.copies && r.copies >= r.opposes) return 'You sounded like them, and they grew. Voters chose the original, not the copy.';
  if (r.copies) return 'You sounded like them some of the time. The answers against them only partly undid it.';
  if (r.usuals && !r.opposes) return 'You talked about it on your usual line. Every answer put their topic in the papers, and it helped them.';
  if (r.usuals) return 'Your usual-line answers helped them; the answers against them didn’t.';
  return 'You talked about it, and every time you took them on. That gave them nothing.';
}

function nextCampaign(g) {
  const r = g.results[g.c];
  g.c++; g.day = 0; g.answers = []; g.start = Math.round(r.end * 10) / 10;
}

// End screen: the crisis campaign's two forced days, answered each way, and the quiet year with no word on immigration.
function whatIf() {
  const kForced = CONFIG.crisisDeck.filter(n => n === 3).length;
  const ds = CONFIG.salStep * kForced;
  return [
    { label: ANS.copy, kind: 'copy', gain: gain(ds, CONFIG.lean.copy) },
    { label: ANS.usual, kind: 'usual', gain: gain(ds, CONFIG.lean.usual) },
    { label: ANS.oppose, kind: 'oppose', gain: gain(ds, CONFIG.lean.oppose) },
  ].map(x => ({ ...x, k: kForced }));
}

const fmt = x => (x >= 0.05 ? '+' : x <= -0.05 ? '−' : '') + Math.abs(x).toFixed(1);

function did(r) {
  if (r.k === 0) return 'kept off immigration';
  const parts = [];
  if (r.copies) parts.push(`sounded like them ${times(r.copies)}`);
  if (r.usuals) parts.push(`gave your usual line ${times(r.usuals)}`);
  if (r.opposes) parts.push(`took them on ${times(r.opposes)}`);
  return parts.join(', ').replace(/, ([^,]*)$/, ' and $1');
}
function times(n) { return n === 1 ? 'once' : n === 2 ? 'twice' : `${n} times`; }
// Under a point either way reads as "barely moved": inside Fig. 5's bands, and the position term alone (t = -0.36) is no evidence of a loss.
function moved(r) { return r.gain >= CONFIG.holdLimit ? `they gained ${fmt(r.gain).slice(1)} points` : shown(r.gain) < 0.05 ? 'they didn\u2019t move' : 'they barely moved'; }

function verdict(g) {
  const [a, b] = g.results;
  const you = `In the quiet year you ${did(a)}, and ${moved(a)}. In the crisis you ${did(b)}, and ${moved(b)}.`;
  const paper = `Across ${CONFIG.nElections} real elections, when the big centre-right party talked more about immigration and sounded like the radical right, the radical right grew. Talking more on its old line helped them a little. Talking more against them didn’t.`;
  const means = 'Voters choose the original, not the copy.';
  return { you, paper, means };
}

const M = { CONFIG, ANS, IMM, OTHER, CAMPAIGNS, gain, shown, measure, newGame, current, today, forced, answer, campaignOver,
  electionNight, nextCampaign, whatIf, verdict, fmt, did, moved };
if (typeof module !== 'undefined') module.exports = M;
